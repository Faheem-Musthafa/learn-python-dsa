"""Runs one piece of course code and reports what happened, as JSON.

Used by tools/check.mjs. It behaves like the harness inside the browser
(assets/js/py.js), so a check that passes here gives the same result in a lesson.
"""
import io, json, sys


def describe(e):
    info = {"type": type(e).__name__, "msg": str(e), "line": 0}
    if isinstance(e, SyntaxError):
        info["msg"] = e.msg or str(e)
        info["line"] = e.lineno or 0
    else:
        tb = e.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == "main.py":
                info["line"] = tb.tb_lineno
            tb = tb.tb_next
    return info


def short(v, limit=200):
    try:
        t = repr(v)
    except Exception:
        t = "<cannot show this value>"
    return t if len(t) <= limit else t[:limit] + "..."


def main():
    job = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    real_out = sys.stdout
    buf = io.StringIO()
    sys.stdout = buf
    sys.stderr = buf
    sys.stdin = io.StringIO("".join(line + "\n" for line in (job.get("stdin") or [])))
    g = {"__name__": "__main__"}
    res = {"error": None, "tests": [], "out": ""}
    try:
        exec(compile(job["code"], "main.py", "exec"), g)
    except SystemExit:
        pass
    except BaseException as e:
        res["error"] = describe(e)
    res["out"] = buf.getvalue()
    for t in (job.get("tests") or []):
        row = {"label": t.get("label") or t.get("call") or t.get("check") or "test", "ok": False, "got": None, "want": None}
        if res["error"] is not None:
            row["skipped"] = True
            res["tests"].append(row)
            continue
        saved, sys.stdout = sys.stdout, io.StringIO()
        try:
            if "call" in t:
                got = eval(t["call"], g)
                want = eval(t["want"], g)
                row["ok"] = bool(got == want)
                row["got"], row["want"] = short(got), short(want)
            else:
                row["ok"] = bool(eval(t["check"], g))
        except BaseException as e:
            row["crash"] = type(e).__name__ + ": " + str(e)
        finally:
            sys.stdout = saved
        res["tests"].append(row)
    sys.stdout = real_out
    real_out.buffer.write(json.dumps(res).encode("utf-8"))


if __name__ == "__main__":
    main()
