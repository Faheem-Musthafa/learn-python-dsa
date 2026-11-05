# Progress sync

Stepwise keeps progress in the learner's browser. This feature lets a learner choose to also save it off their device. The site is public and static, so it cannot hold a GitHub token. A Cloudflare Worker holds it instead, and writes to a private GitHub repo once an hour.

**State of this work:** the Worker and its tests are built. Nothing is deployed, and the browser side is not built. See [What was not verified](#what-was-not-verified).

Setup steps for the owner are in `worker/README.md`.

## What is sent, and what is never sent

The Worker accepts progress and nothing free-form. Every field is a number, a yes/no, a date, or a word from a fixed list. Anything else gets a 400 and is not stored. The list lives in one file, `worker/src/schema.js`.

| Sent | Never sent |
| --- | --- |
| Which lessons were opened and finished, with dates | The learner's name or nickname |
| For each question: tries, right answers, hints, review schedule, dates | Notes |
| For each day: minutes, actions, lessons, questions | Saved code |
| Weekly goal (a number from 1 to 7) | Typed answers, filled boxes, program output |
| Display settings, from fixed lists | Bookmarks, scroll position, backup dates, the goal topic |
| A random id, and a random key that is stored only as a hash | Email, age, or an account of any kind |

IP addresses reach Cloudflare, as with any website. The Worker does not store them or log them, and it hashes them before using them for rate limits. It logs no ids, keys or data. Worker logs are turned off in `wrangler.toml`, because they would record URLs, and the GET route has the id in its URL.

### The exact shape

`data` must be an object with these fields, and no others. Only `v` is required.

```js
{
  v: 1,                          // Format version: whole number, 1 to 99.
  lessons: {                     // Up to 600. Key: lower-case letters, digits, single hyphens, like "3-1-while-loops".
    "<lessonId>": {
      status: "open" | "done",
      openedAt, doneAt, last,    // "YYYY-MM-DD" or null
      undone: true | false
    }
  },
  answers: {                     // Up to 5,000. Key: "<lessonId>/<questionSlug>".
    "<questionId>": {
      tries, ok, hints,          // Whole number, 0 to 1,000,000
      saw: false | true | null | "YYYY-MM-DD",
      box,                       // Whole number, 0 to 32
      due, last, slip,           // "YYYY-MM-DD" or null
      okDays: ["YYYY-MM-DD"]     // Up to 64
    }
  },
  days: {                        // Up to 4,000. Key: "YYYY-MM-DD", a real date from 2000 to 2100.
    "<date>": {
      mins,                      // 0 to 1,440
      acts, lessons, qs          // 0 to 1,000,000
    }
  },
  work: {                        // Up to 5,000. Key: question id. The numeric part of a half-done question.
    "<questionId>": {
      t,                         // Milliseconds since 1970, up to the year 2100
      n, h,                      // Whole number
      a, s, c, b,                // 0, 1, true or false
      k: 0 | 1 | 2,
      o, l, p: [number],         // Option, line and pair positions. Up to 200, each 0 to 200.
      m: [0 | 1 | null]          // Up to 200
    }
  },
  goals: { weekDays },           // 1 to 7
  prefs: {
    theme: "system" | "light" | "dark",
    size: "100" | "115" | "130" | "150",
    spacing: "normal" | "roomy",
    motion: "auto" | "on" | "off",
    hideHints: true | false,
    vizSpeed: 0.5 | 1 | 2 | 3,
    vizCodeOpen: true | false
  }
}
```

### How the app's real data maps to this

`toSyncData(state)` in `schema.js` does this. It drops whatever is not allowed, so a damaged save or a new app field can neither stop sync nor leak out.

| In `assets/js/store.js` | What happens |
| --- | --- |
| `v`, `lessons`, `answers`, `days` | Sent, with fields limited to the lists above |
| `work.t n h a s b k o l p` | Sent. All numbers. |
| `work.x`, `work.v`, `work.r` | **Dropped.** Typed answer, filled boxes, and program output: all can hold anything |
| `work.c`, `work.m` | Sent, unless the record also had `x` or `v`. Without those words they would show an empty box as wrong. |
| `goals.weekDays` | Sent |
| `goals.topic`, `goals.topicBy` | **Dropped.** A topic could be free text |
| `prefs` | Sent, each only if it matches its fixed list |
| `name`, `notes`, `code` | **Dropped.** Free text |
| `saved`, `place`, `backup`, `pausedUntil`, `onboarded`, `created`, `lastLesson` | **Dropped.** They say nothing the course needs to restore progress, and `place` holds a string |

## The privacy position

- **Opt-in only.** Nothing is sent until the learner says yes. Before that, the site makes no sync requests at all.
- **Progress only.** The schema refuses names, notes and code, however the request was made.
- **Random ids.** An id is 128 random bits and is not linked to a name or email by this system.
- **Deletion on request.** A learner can delete from the site. Their record leaves the store at once, and their file leaves the repo on the next hourly run. If they lost their key, the owner can do it by hand. See `worker/README.md`.

**What the owner can see in the repo:** one file per learner, named by random id. It shows which lessons they did, how they did on each question, and how many minutes they studied on which dates. It does not show who they are. Dates of study are still behaviour, so treat this as a learner's record and keep the repo private.

**A random id is not anonymous in law.** If a learner tells you their id, that file is about a known child. Privacy laws often treat data like this as personal data even with no name on it.

**What you should do before turning it on:**

1. Tell learners and parents in plain words: what is saved, where (Cloudflare and GitHub, both US companies with servers in many countries), who can see it (you), and how to delete it. Ask for a parent's agreement for younger children.
2. Look at the law on children's data where you and your learners live. Examples to ask about are India's Digital Personal Data Protection Act, the EU and UK GDPR with the UK Children's Code, and the US COPPA rule. Some of these may require a parent's consent or set other duties. **This document is not legal advice**, and nobody has checked whether this design meets any of these laws.

### Deletion and git history

Removing a file in a new commit does not remove it from earlier commits. **After a deletion, the learner's old progress is still in the repo's git history**, where only people with access to the private repo can read it. So "removed from the repo" means removed from the current files.

If you promise full erasure, you have to rewrite history. The simple way is to make a fresh repo now and then and delete the old one, for example once a year or whenever someone asks. Tell people this honestly when you describe deletion.

### One limit of the whitelist

Ids are checked by pattern, not against the course. Somebody who writes their own request could store a few lower-case words in an id, like `my-name-is-asha`. The real app can never do this, because ids come from the course. The Worker could only stop it by knowing every id in the course, which would break sync at each new lesson. Numbers are capped, so they are no practical place to hide text.

## How it works

```
Browser ──(HTTPS, only after opt-in)──> Worker ──> KV: p:<id>, dirty:<id>:<rev>, gone:<id>
                                                    │
                            hourly cron <───────────┘
                                 │
                                 └──> One commit in the private repo: progress/<id[0:2]>/<id>.json
```

### What is in KV

| Key | Value | Purpose |
| --- | --- | --- |
| `p:<id>` | `{hash, rev, data, updatedAt}` | The learner's data, and the SHA-256 of their key |
| `dirty:<id>:<rev>` | `1`, with metadata `{at, size}` | "This changed." One per save. |
| `dirty:<id>:del` | `1` | "Remove this from the repo." |
| `gone:<id>` | Date of deletion | The tombstone: this id can never be used again |
| `count:new-ids:<date>` | A number | The daily cap on new ids. Expires after 2 days. |

### How KV's delays are handled

KV is eventually consistent. Cloudflare's docs say a change may take "60 seconds or more" to show in other locations, and that "not found" is cached too. A read can be old. KV has no compare-and-set. So:

- **The rev check catches ordinary conflicts,** such as a laptop and a phone saving minutes apart. The client re-reads with the 409 reply, merges, and saves again.
- **It cannot catch everything.** Two devices saving within a minute through different Cloudflare locations can both be told they succeeded, and one overwrites the other. Nothing is lost for good, because each device still has its own full copy, and the merge at the next session brings both together. That is why the contract says to GET and merge at the start of each session. If this ever needs to be exact, the fix is to send writes through a Durable Object.
- **A marker is never lost to a stale read.** The batch deletes only the exact marker keys it saw, and each save writes a new key. So a save during a run cannot be erased by the run, however old its view of KV is. This is why a marker's key has the rev in it.
- **The batch will not write old data.** If a marker says rev 8 but KV here shows rev 7, it waits for the next run. After 5 minutes it stops waiting, so nothing can get stuck.
- **A delete can be undone only briefly, and it heals.** For about a minute after a delete, another location might not see it yet and could let an old device save. The tombstone is a separate key that saves never touch, so the next batch sees it, erases the record again, and removes the file.

### The batch

Each hour it lists the markers, takes deletions first and then whoever has waited longest, and writes everything to one commit.

- **A failed run clears nothing,** so it all goes again next hour.
- **A successful run clears only the markers it saw.**
- **A rerun is safe.** If a commit worked but clearing did not, the next run writes identical files, gets the same tree back from GitHub, makes no commit, and clears.
- **Nothing reads from the repo back into the store,** so stale repo data cannot re-create a learner.
- **Commit messages hold counts only:** `Mirror progress: 3 updated, 1 removed`.

## Contract for the browser code

### Rules

1. **Never run before the learner opts in.** No request, not even health, and do not load `schema.js` until then.
2. **Never block the UI.** Sync runs in the background. A failure must never stop a lesson, delay a page or lose local data. `localStorage` stays the source of truth. Show status quietly in Settings, and never interrupt learning for it.
3. **Keep `id` and `key` in their own localStorage key,** for example `stepwise.sync`, with `rev`. They must not go in `stepwise.v1`, or they would end up in exported backups. Treat `key` like a password.
4. **Always send through `toSyncData`.** Never send `Store.state`.

### The shared file

`worker/src/schema.js` is a plain ES module with no imports. The site's scripts are classic scripts, so load it with a dynamic import after opt-in:

```js
const Sync = await import('./worker/src/schema.js');
Sync.toSyncData(Store.state);        // App state to allowed data. Always valid.
await Sync.packForSync({id, key, baseRev, data});  // {body, headers, withoutWork}, or null if it cannot fit.
Sync.mergeData(local, remote);       // The merge below.
Sync.validateData(data);             // {ok: true} or {ok: false, path, reason}
```

GitHub Pages serves the `worker/` folder along with the rest of the repo. It holds no secrets. If you ever stop publishing that folder, copy this file.

### Making an id

```js
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
const id = hex(16), key = hex(16);   // Lower-case hex. id: 32 to 64 characters. key: 32 to 128.
```

### Requests

All routes are under `SYNC_URL`. Every request needs an allowed `Origin`, which the browser adds by itself. Only `GET /v1/health` works without one.

**`POST /v1/sync`**. Save.

Use `packForSync` to build the body. It must have `Content-Type: application/json`, and `Content-Encoding: gzip` if gzipped. The limit is **64 KB as sent, and 1 MB after unpacking**.

```js
{ id, key, baseRev, data }   // baseRev is the rev you last got, or 0 for the very first save.
```

| Reply | Meaning | What to do |
| --- | --- | --- |
| `200 {rev}` | Saved | Store `rev` |
| `409 {rev, data}` | Someone else saved first. `data` is null if nothing is stored. | Merge, then POST again with this `rev` |
| `429` | Too soon, or too many | Wait for `Retry-After` |
| `410` | This id was deleted | See below |

**`GET /v1/sync?id=<id>`** with header `Authorization: Bearer <key>`. Read. Never put the key in the URL.

| Reply | Meaning |
| --- | --- |
| `200 {rev, data}` | The stored progress |
| `404` | Nothing stored |
| `410` | This id was deleted |

**`DELETE /v1/sync`**. Erase.

Body `{id, key}`, with `Content-Type: application/json`. Replies `200 {deleted: true}`. Asking twice is fine.

**`GET /v1/health`**. Replies `200 {ok: true}`.

**Every error** looks like this, and `field` is there only sometimes. It says where the problem is and never repeats what you sent.

```js
{ "error": { "code": "bad_data", "message": "Plain words.", "field": "answers.*.tries" } }
```

| Status | `code` | What to do |
| --- | --- | --- |
| 400 | `bad_request`, `bad_json`, `bad_data` | A bug in the client. Stop for this session. Do not retry. |
| 401 | `unauthorized` | A bug in the client. Stop. |
| 403 | `forbidden` | The key is wrong. Stop, and tell the learner sync needs setting up again. |
| 403 | `origin_not_allowed` | Configuration. Stop. |
| 404 | `not_found` | See the session steps below |
| 410 | `deleted` | Stop for good. Forget the id and key. Do not make a new id without asking the learner. |
| 413 | `too_large` | Stop for this session. `packForSync` should prevent it. |
| 415 | `unsupported_type` | A bug in the client. Stop. |
| 429 | `too_soon`, `rate_limited`, `daily_limit` | Wait for `Retry-After` |
| 500, 503 | `internal`, `store_unavailable` | Back off and retry |

### When to sync

1. **At the start of a session, after opt-in:** GET first, merge into local, then save only if the merge changed something.
2. **While studying:** at most once every 10 minutes, and when a lesson is finished. Never on each answer. The free plan allows about 500 saves a day across **all** learners, so this matters.
3. **Skip a save if nothing changed** since the last one that worked. Compare the output of `toSyncData`.
4. **The Worker refuses a save within 60 seconds of the last one** with `429 too_soon`. A conflict gets its 409 first, so a merge may then have to wait out `Retry-After` before saving.
5. **A 404 after a save has worked before** may just be KV being slow. Wait 2 minutes and try once more. If it is still 404, POST with `baseRev: 0` to store local progress again.

### The merge on a 409

`mergeData(local, remote)` does all of this. Nothing learned is ever lost, and for progress it gives the same result whichever way round it is called.

- **Lessons:** finished wins over open. Take the later `doneAt`, the later `last`, and the earlier `openedAt`. `undone` is kept only if the merged lesson is not finished. This means "reopen" on one device can lose to "finished" on another, which is the safe side.
- **Answers:** take the larger `tries`, `ok` and `hints`. Take the later `last`, `slip` and `saw`, and union `okDays`. Take `box` and `due` together from whichever side practised last, with more `ok` breaking a tie. Do not take `box` and `due` separately.
- **Days:** union of dates, with the max of each counter. Never add them, or the same minutes count twice.
- **Work:** the record with the larger `t`.
- **Goals and prefs:** this device's value wins, and the other side only fills gaps.

After merging:

1. Write the result into local state, then POST it with the `rev` from the 409.
2. If that also gets a 409, repeat, at most 3 times in a row. Then stop until the next normal sync.
3. **Merge into local with care.** The result holds only synced fields, so it must not replace `Store.state`. Keep `name`, `notes`, `code`, `saved` and `place` as they are. When taking a remote `work` record, keep any local `x`, `v` and `r`, since the server never has them.
4. On a brand new device, set `onboarded = true` after restoring.
5. `Store.importData`'s merge is close to this but not identical. It keeps the first lesson record, and it is not limited to the whitelist. Use `mergeData`.

### Retry and backoff

For a network failure, 500 or 503: wait about 1 minute, then 2, 4, 8, up to 60 minutes, each with some random extra so a whole classroom does not retry together. If there is a `Retry-After` header, wait at least that long. Reset after any success. Stop for the session after about 5 failures. Never retry in a tight loop, and never retry on the statuses marked "Stop" above.

### Delete and opt out

- **Delete my saved progress:** send DELETE. On `200` or `410`, forget the id, key and rev. Local progress stays on the device. Say so, and say when the repo file goes (within about an hour).
- **Turn off sync, keeping saved data:** stop syncing and keep the id and key. If the learner turns it on again, follow the session start steps.
- Offer delete **before** forgetting the id, because without the key they cannot delete it themselves.

## Limits and costs

These numbers are from the Cloudflare and GitHub docs as read on 2026-11-05. They change, so check them.

### Cloudflare Workers Free

| Limit | Number | What it means here |
| --- | --- | --- |
| Requests | 100,000 a day | Plenty |
| CPU | 10 ms per request or cron run, with some unstated flexibility | The tightest limit. See below. |
| Outgoing requests | 50 per run | Why one run makes about 5 GitHub requests, not one per file |
| KV reads | 100,000 a day | Plenty |
| **KV writes** | **1,000 a day** | **The real ceiling.** Each save is 2 writes, so about 500 saves a day across all learners |
| KV deletes | 1,000 a day | One per marker, so no more than the writes |
| KV lists | 1,000 a day | About 24 used |
| KV storage | 1 GB | About 2,400 learners with the whole course done, or 12,000 typical |
| KV operations | 1,000 per run | The batch stops at 900 and finishes next run |
| Cron triggers | 5 per account | This uses 1 |

At the suggested pace of about 3 saves per study session, 500 saves a day is about 150 learners a day. Beyond that, saves get a 503 until midnight UTC. Local progress is not affected, and the client retries later.

**Workers Paid costs $5 a month.** It includes 10 million requests, and KV with 1 million writes a month and 1 GB of storage. Beyond that it is charged by use.

### What a learner weighs

These are measured from a made-up learner played through the real `store.js` and the real course (125 lessons, 1,327 questions). CPU is on this Windows laptop in Node, not on Cloudflare.

| Learner | JSON | Gzipped | In the repo | CPU per save | CPU per file in the batch |
| --- | --- | --- | --- | --- | --- |
| 30 lessons, 3 months | 81 KB | 10 KB | 148 KB | 1.3 ms | 1.2 ms |
| Whole course, 3 years | 417 KB | 54 to 62 KB | 769 KB | 7.2 ms | 6.1 ms |

**The 64 KB body limit.** As plain JSON, a learner passes 64 KB about a fifth of the way through the course (roughly 24 of 125 lessons). A limit on plain JSON would have stopped sync for good, with no way out, for anyone who kept going. So the limit applies to the bytes sent, and gzip is allowed, which fits the whole course. A second limit of 1 MB after unpacking stops a small file from unpacking into a huge one. The stored data can therefore be larger than 64 KB. To go back to a true 64 KB of data, you would have to send less per question, or accept that long-term learners cannot sync.

A finished learner is close to the 64 KB limit with real clocks, because `work.t` compresses poorly. If it does not fit, `packForSync` drops `work`, and all progress still goes. Without `work` that learner is 323 KB and 40 KB gzipped.

**CPU on the free plan.** A finished learner is near the 10 ms limit, and Cloudflare's machines may be slower or faster than this laptop. Most learners are far below it. Watch **Exceeded CPU Time Limits** in the Worker's metrics. If it appears, the $5 plan removes the problem.

**The batch on the free plan.** One run takes up to 384 KB of stored data (`MIRROR_MAX_BYTES`), always at least one learner. That is about 4 typical learners an hour, or about 100 a day. If more than that change each day, the mirror falls behind. No data is lost, as it is all safe in KV, but the repo lags. On the paid plan, raise `MIRROR_MAX_BYTES` a lot, up to the 300 file cap.

### GitHub Free

| Limit | Number | What it means here |
| --- | --- | --- |
| Private repos | Unlimited | |
| API requests | 5,000 an hour | About 5 per run, a few more with deletions |
| Creating content | 80 a minute, 500 an hour | 2 an hour. One blob per file would break this. |
| Repo size | 10 GB | Each hour stores whole files for whoever changed. My rough guess is 1 GB a year at 100 learners a day. That is an estimate, not a measurement. |
| One file | 1 MB recommended, 100 MB enforced | A finished learner is 769 KB |
| One folder | 3,000 entries | 256 folders by first two hex digits, so about 768,000 learners |

### Abuse limits, and what they do not stop

| Limit | Default | Set by |
| --- | --- | --- |
| Requests per IP | 120 a minute, as classrooms share an IP | `[[ratelimits]] RATE_IP` |
| Requests per id | 10 a minute | `RATE_ID` |
| New ids per IP | 10 a minute | `RATE_CLAIM` |
| Time between saves per id | 60 seconds | `MIN_SYNC_SECONDS` |
| New ids per day | 200 | `MAX_NEW_IDS_PER_DAY` |
| Body size | 64 KB sent, 1 MB unpacked | `MAX_BODY_BYTES`, `MAX_JSON_BYTES` |

The rate limits are approximate and counted per Cloudflare location. The daily cap is also approximate, because KV is. The site is public and has no accounts, so someone determined can still use up the day's 1,000 KV writes and stop saves until midnight UTC, or slowly fill storage with valid-looking data. They cannot read or change anyone's data, and local progress is untouched. Cloudflare Turnstile could be added if this ever happens.

## Where this differs from the original design

These were changes made for a reason. The owner should know about them.

1. **Marker keys are `dirty:<id>:<rev>`, not `dirty:<id>`.** With one key per id, a stale read while clearing could delete the marker of a newer save and lose it from the mirror.
2. **File contents go in the tree request** (`content` on each entry), not in a separate blob request per file. It is still the Git Data API, and GitHub writes the blobs. One blob per file would be 300 requests, against a limit of 50 per run on the free plan and 80 content-creating requests a minute on GitHub.
3. **The 64 KB limit is on bytes sent, with gzip allowed,** and there is a new 1 MB limit after unpacking. See above.
4. **Extra fields were allowed** after reading what the app really saves: `lessons.last`, `lessons.undone`, `answers.slip`, and the numeric part of `work`. None can hold free text.
5. **`DELETE` takes `{id, key}` in a JSON body,** so the id stays out of the URL.
6. **Extra limits:** a cap on bytes per batch for the free plan's CPU, and a limit on repo lookups per run.
7. **Compatibility date is 2026-11-01,** because the newest local runtime available supports dates only up to about the start of November.

## If gzip fails

If `GZIP BODY ACCEPTED` fails after deploying with a 413, Cloudflare may be unpacking the body before the Worker sees it, which could not be tested here. To get going, raise `MAX_BODY_BYTES` in `wrangler.toml` to `1048576` and deploy. The Worker already accepts a body labelled gzip that was unpacked on the way, so the browser code does not change. This uses no extra KV writes, but the limit before parsing is then 1 MB, not 64 KB. Any other failure needs looking at, so keep the smoke test's output.

## What was not verified

No code here has run on the real Cloudflare or the real GitHub. No token was used.

**Run for real:** all tests, in `workerd`, the actual Workers runtime, with Miniflare's KV and rate limiter. Plus the smoke test over real HTTP against `wrangler dev`, and `wrangler deploy --dry-run` for bundling and config. Separately, 18 deliberate bugs were put into the source one at a time, and the tests caught all 18.

**Known only from documentation, or simulated:**

- **GitHub.** The fake GitHub follows the documented rules, including the error when deleting a missing file. It is not GitHub. Not tested for real: a tree request carrying many files inline (no size limit is documented, so a very large one may be refused), whether the token permission is enough for creating commits (the docs were checked for trees and refs), and exactly what an empty repo answers.
- **Gzip on the edge.** It works in the local runtime. Whether Cloudflare's edge passes a gzip request through unchanged was not found in the docs. The Worker handles either case unless the unpacked body is over 64 KB. The smoke test checks this.
- **KV delays.** Stale reads were simulated. Real timing depends on Cloudflare. Miniflare's KV is immediately consistent, so it cannot show this by itself. The bulk read was tested only on Miniflare.
- **Rate Limiting on the free plan.** The docs name no plan restriction, but this was not tried. Local testing shows the binding working, not its real accuracy.
- **Real CPU use.** Measured on this laptop only.
- **Prices and limits** were read from the docs, and could change.
- **The law.** Nobody has checked this against any law.
