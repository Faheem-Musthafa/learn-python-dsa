/* Visuals for module 10. Names start with the module id.
 * Every algorithm here takes the learner's own values, so each build must
 * cope with an empty list, one item, duplicates, junk text and a missing target.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  /* Reads "1, 3, 5" from a text box. Anything that is not a small whole number is skipped. */
  function readNums(text, limit, low = -999, high = 999) {
    const parts = String(text == null ? '' : text).split(/[\s,;]+/).filter(Boolean);
    const nums = [];
    let skipped = 0;
    parts.forEach(t => {
      const n = Number(t);
      if (Number.isInteger(n) && n >= low && n <= high && nums.length < limit) nums.push(n);
      else skipped += 1;
    });
    return { nums, skipped };
  }
  const whole = (v, min, max, dflt) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : dflt;
  };
  const show = a => '[' + a.join(', ') + ']';
  const inOrder = a => a.every((v, i) => i === 0 || a[i - 1] <= v);
  /* Options for an ask. Drops repeats, and moves the right answer around. */
  function choices(right, wrongs) {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    const at = Math.abs(Number(right) || String(right).length) % (rest.length + 1);
    rest.splice(at, 0, String(right));
    return { options: rest, answer: at };
  }
  const skipNote = skipped => (skipped ? ' Some of what you typed was skipped.' : '');

  /* The stage shared by every list search: a row, a window, and the pointers lo, hi and mid. */
  function listKit(s, items, shift = 0) {
    const n = items.length;
    const rowY = 110 + shift;
    const o = { y: rowY, cell: 52, gap: 6 };
    const X = i => s.slotX(i, n, o);
    const kit = {
      X, n, rowY,
      draw() {
        if (n) s.row('c', items, o);
        else s.text('empty', 280, rowY, 'This list is empty.', { size: 16, tone: 'muted' });
      },
      /* Puts lo and hi under the row. When they share a spot, one arrow carries both names. */
      place(lo, hi) {
        const same = lo === hi;
        if (s.has('lo')) s.set('lo', { x: X(lo), text: same ? 'lo hi' : 'lo' });
        else s.pointer('lo', X(lo), 164 + shift, same ? 'lo hi' : 'lo', { dir: 'up' });
        if (s.has('hi')) s.set('hi', { x: X(hi), opacity: same ? 0 : 1 });
        else s.pointer('hi', X(hi), 164 + shift, 'hi', { dir: 'up', opacity: same ? 0 : 1 });
      },
      /* The window is the soft area behind the lockers that may still hold the target. */
      window(lo, hi) {
        if (!n || lo > hi) { s.del('win'); return; }
        const left = X(Math.max(lo, 0)) - 30;
        const wide = X(Math.min(hi, n - 1)) - X(Math.max(lo, 0)) + 60;
        if (s.has('win')) s.set('win', { x: left, w: wide });
        else s.area('win', left, 78 + shift, wide, 64, '');
      },
      /* Thrown-away lockers shrink as well as fade, so colour is not the only cue. */
      drop(a, b) {
        for (let i = Math.max(a, 0); i <= Math.min(b, n - 1); i += 1) s.set('c' + i, { tone: 'muted', scale: 0.78 });
      },
      mid(i) {
        if (s.has('mid')) s.set('mid', { x: X(i) });
        else s.pointer('mid', X(i), 78 + shift, 'mid', { dir: 'down', tone: 'active' });
      },
    };
    return kit;
  }

  // ---------------------------------------------------------------- lesson 10.1
  Viz.register('m10-guess-game', {
    title: 'Guess my number: always guess the middle',
    size: [560, 214],
    inputs: [
      { key: 'top', label: 'Biggest number', type: 'number', value: 100, min: 1, max: 1000 },
      { key: 'secret', label: 'Secret number', type: 'number', value: 73, min: 1, max: 1000 },
    ],
    tryInputs: [{ top: 1, secret: 1 }, { top: 2, secret: 2 }, { top: 100, secret: 50 }, { top: 100, secret: 1 }, { top: 1000, secret: 1000 }, { top: 10, secret: 99 }],
    build(s, p) {
      const top = whole(p.top, 1, 1000, 100);
      const secret = whole(p.secret, 1, top, 1);
      const left = 56, wide = 448;
      const at = v => (top === 1 ? 280 : left + (wide * (v - 1)) / (top - 1));
      const liveBox = (lo, hi) => ({ x: (at(lo) + at(hi)) / 2, w: Math.max(8, at(hi) - at(lo) + 8) });
      let lo = 1, hi = top, guesses = 0;
      const vars = () => ({ lo, hi, secret });

      s.box('line', 280, 88, '', { w: wide + 8, h: 8, tone: 'muted' });
      s.box('live', liveBox(lo, hi).x, 88, '', { w: liveBox(lo, hi).w, h: 34, tone: 'active' });
      s.text('min', 28, 88, 1, { size: 14, mono: true });
      s.text('max', 534, 88, top, { size: 14, mono: true });
      s.pointer('sec', at(secret), 112, 'secret', { dir: 'up', tone: 'default' });
      s.text('count', 540, 16, 'guesses: 0', { size: 15, anchor: 'end', weight: 700 });
      s.text('status', 280, 164, `Still possible: 1 to ${top}`, { size: 16 });
      s.snap(`The tall bar shows every number that could be the secret: 1 to ${top}.`, { vars: vars() });

      let round = 0;
      while (lo <= hi) {
        round += 1;
        const g = Math.floor((lo + hi) / 2);
        guesses += 1;
        if (s.has('guess')) s.set('guess', { x: at(g), text: g });
        else s.pointer('guess', at(g), 68, g, { dir: 'down' });
        s.set('count', { text: `guesses: ${guesses}` });
        if (g === secret) break;

        const low = g < secret;
        const gone = low ? `${lo} to ${g}` : `${g} to ${hi}`;
        const other = low ? `${g + 1} to ${hi}` : `${lo} to ${g - 1}`;
        const newLo = low ? g + 1 : lo, newHi = low ? hi : g - 1;
        const leftNow = newHi - newLo + 1;
        let ask = null;
        if (round <= 3 || round % 2 === 0) {
          if (round % 2 === 1) {
            const c = choices(gone, [other, `Only ${g}`]);
            ask = {
              q: `You guess ${g}. The secret is ${secret}. Which numbers can you cross out?`,
              options: c.options, answer: c.answer,
              why: `${g} is too ${low ? 'low' : 'high'}. So ${g} and every number ${low ? 'below' : 'above'} it cannot be the secret.`,
            };
          } else {
            const c = choices(leftNow, [hi - lo, hi - lo + 1]);
            ask = {
              q: `You guess ${g}. It is too ${low ? 'low' : 'high'}. How many numbers are left after that?`,
              options: c.options, answer: c.answer,
              why: `Only ${newLo} to ${newHi} are left. That is ${leftNow} of them.`,
            };
          }
        }
        s.snap(`Guess ${guesses}: the middle of ${lo} to ${hi} is ${g}.`, { vars: Object.assign(vars(), { guess: g }), ask });

        lo = newLo; hi = newHi;
        s.set('live', liveBox(lo, hi));
        s.set('status', { text: `Still possible: ${lo === hi ? lo : lo + ' to ' + hi}` });
        s.snap(`Too ${low ? 'low' : 'high'}. Now ${leftNow} ${leftNow === 1 ? 'number is' : 'numbers are'} left.`, { vars: Object.assign(vars(), { guess: g }) });
      }

      s.set('live', { tone: 'ok' });
      s.set('status', { text: `Middle way: ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}.` });
      s.snap(`The secret is ${secret}. You got it on guess ${guesses}.`, { vars: { guess: secret, secret } });
      s.text('race', 280, 192, `Counting up from 1: ${secret} ${secret === 1 ? 'guess' : 'guesses'}.`, { size: 16 });
      s.snap(`Counting up from 1 would take ${secret}. Now try a bigger game.`, { vars: { guess: secret, secret } });
    },
  });

  Viz.register('m10-linear-walk', {
    title: 'Linear search opens each locker in turn',
    size: [560, 200],
    code: py`
      def find(items, target):
          for i in range(len(items)):
              if items[i] == target:
                  return i
          return -1

      print(find(items, target))
    `,
    inputs: [
      { key: 'list', label: 'List', type: 'text', value: '4, 9, 2, 7, 5', size: 18 },
      { key: 'target', label: 'Target', type: 'number', value: 7, min: -99, max: 999 },
    ],
    tryInputs: [
      { list: '', target: 3 }, { list: '5', target: 5 }, { list: '5', target: 6 },
      { list: '7, 1, 7, 7', target: 7 }, { list: '1, 2, 3, 4, 5, 6, 7, 8', target: 99 },
      { list: 'cat, dog', target: 1 }, { list: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11', target: 8 }, { list: '-5, 100, 3', target: 3 },
    ],
    build(s, p) {
      const { nums: items, skipped } = readNums(p.list, 8);
      const target = whole(p.target, -99, 999, 0);
      const n = items.length;
      const o = { y: 92, cell: 52, gap: 6 };
      const X = i => s.slotX(i, n, o);
      const foundAt = items.indexOf(target);
      const need = foundAt >= 0 ? foundAt + 1 : n;
      let looks = 0;

      s.text('tgt', 20, 18, `target is ${target}`, { size: 15, anchor: 'start', weight: 700 });
      s.text('count', 540, 18, 'looks: 0', { size: 15, anchor: 'end', weight: 700 });
      if (n) s.row('c', items, o);
      else s.text('empty', 280, 92, 'This list is empty.', { size: 16, tone: 'muted' });

      if (!n) {
        const c = choices(-1, [0, 'IndexError']);
        s.snap(`There is nothing to open here.${skipNote(skipped)}`, {
          line: 2, vars: { target },
          ask: {
            q: 'The loop has no trips to make. What does find hand back?',
            options: c.options, answer: c.answer,
            why: 'The loop runs 0 times. So Python goes on to return -1.',
          },
        });
        s.snap('The loop made no trips, so find hands back -1.', { line: 5, vars: { target } });
        s.snap('print shows -1, and that took 0 looks.', { line: 7, vars: { target }, out: '-1' });
        return;
      }

      const c0 = choices(need, foundAt >= 0 ? [n, 1, need + 1] : [n + 1, Math.max(1, n - 1), 1]);
      s.snap(`The lockers are in any order. The target is ${target}.${skipNote(skipped)}`, {
        line: 1, vars: { target },
        ask: {
          q: 'Count before it starts. How many lockers will it open?',
          options: c0.options, answer: c0.answer,
          why: foundAt >= 0
            ? `It opens lockers from 0 up to ${foundAt}, then stops. That makes ${need}.`
            : `${target} is not here, so it must open all ${n} lockers to be sure.`,
        },
      });

      let result = -1;
      for (let i = 0; i < n; i += 1) {
        if (i === 0) s.pointer('i', X(0), 60, 'i', { dir: 'down' });
        else s.set('i', { x: X(i) });
        s.snap(`i is ${i}, so the loop opens locker ${i}.`, { line: 2, vars: { target, i } });

        looks += 1;
        s.set('count', { text: `looks: ${looks}` });
        s.tone('c' + i, 'active');
        const hit = items[i] === target;
        let ask = null;
        if (hit && items.indexOf(target, i + 1) >= 0) {
          const later = items.indexOf(target, i + 1);
          ask = {
            q: `There is another ${target} at locker ${later}. Will the code ever open it?`,
            options: ['Yes, it checks them all', 'No, it stops here'],
            answer: 1,
            why: 'return ends the function at once. So you get the first match.',
          };
        } else if (i === 1 && !hit) {
          ask = {
            q: `items[1] is ${items[1]}. Can the code skip some lockers now?`,
            options: ['Yes, it can jump ahead', 'No, the next one could be it'],
            answer: 1,
            why: 'The lockers are in any order. So each one might hold the target.',
          };
        } else if (i % 2 === 1 && !hit) {
          const c = choices(i + 1, [i, i + 2, n]);
          ask = {
            q: 'How many lockers has it opened so far?',
            options: c.options, answer: c.answer,
            why: `It opened lockers 0 to ${i}. That makes ${i + 1}, as counting starts at 0.`,
          };
        }
        s.snap(`Is ${items[i]} == ${target}? ${hit ? 'True' : 'False'}.`, { line: 3, vars: { target, i, 'items[i]': items[i] }, ask });

        if (hit) {
          s.set('c' + i, { tone: 'ok', scale: 1.08 });
          result = i;
          s.snap(`Found it. return hands back ${i}, and the loop stops.`, { line: 4, vars: { target, i } });
          break;
        }
        s.set('c' + i, { tone: 'muted', scale: 0.78 });
      }

      if (result < 0) {
        s.del('i');
        const c = choices(-1, [n - 1, n]);
        s.snap('All the lockers are open, and the target is not here.', {
          line: 5, vars: { target },
          ask: {
            q: 'What does find hand back now?',
            options: c.options, answer: c.answer,
            why: 'The loop ended with no match. So the next line runs: return -1.',
          },
        });
      }
      s.snap(`print shows ${result}. That took ${looks} ${looks === 1 ? 'look' : 'looks'} for ${n} ${n === 1 ? 'item' : 'items'}.`, { line: 7, vars: { target }, out: String(result) });
    },
  });

  // ---------------------------------------------------------------- lesson 10.2
  const BINARY_CODE = lowLine => [
    'def find(items, target):',
    '    lo = 0',
    '    hi = len(items) - 1',
    '    while lo <= hi:',
    '        mid = (lo + hi) // 2',
    '        if items[mid] == target:',
    '            return mid',
    '        if items[mid] < target:',
    `            ${lowLine}`,
    '        else:',
    '            hi = mid - 1',
    '    return -1',
    'print(find(items, target))',
  ].join('\n');

  /* One builder for all the binary search pictures.
     stuck turns on the lo = mid bug. quick skips the setup and the plain loop checks,
     for pictures that come after the learner has seen the whole trace once. */
  function binaryRun(s, p, { stuck = false, quick = false } = {}) {
    const { nums: items, skipped } = readNums(p.list, 8);
    const target = whole(p.target, -99, 999, 0);
    const kit = listKit(s, items);
    const n = items.length;
    const sorted = inOrder(items);
    const realSpot = items.indexOf(target);
    let lo = 0, hi = n - 1, mid = null, looks = 0;
    const vars = () => {
      const v = { target, lo, hi };
      if (mid != null) { v.mid = mid; if (mid >= 0 && mid < n) v['items[mid]'] = items[mid]; }
      return v;
    };
    const count = () => s.set('count', { text: `looks: ${looks}` });

    // The target is a tile, so a compare can link to it. These sit over the ends of the row, so the row can fill the stage.
    const leftEnd = n ? Math.min(kit.X(0) - 26, 170) : 170, rightEnd = n ? Math.max(kit.X(n - 1) + 26, 390) : 390;
    s.text('tgt', leftEnd, 18, 'target', { size: 15, anchor: 'start', weight: 700 });
    s.box('tgtBox', leftEnd + 76, 18, target, { w: Math.max(44, 12 * String(target).length + 14), h: 34, size: 18, tone: 'accent' });
    s.text('count', rightEnd, 18, 'looks: 0', { size: 15, anchor: 'end', weight: 700 });
    s.text('cmp', 280, 220, '', { size: 15, mono: true, weight: 700 });
    kit.draw();
    const first = !n ? 'There are no lockers at all.' : sorted ? 'The list is in order, from small to big.' : 'Look closely: this list is not in order.';
    s.snap(first + skipNote(skipped), { line: 1, vars: { target } });

    if (quick) {
      kit.place(lo, hi);
      kit.window(lo, hi);
      s.snap(n ? `The window starts as the whole list. lo is 0 and hi is ${hi}.` : 'lo is 0 and hi is -1, so lo is already past hi.', { line: 3, vars: vars() });
    } else {
      s.pointer('lo', kit.X(0), 164, 'lo', { dir: 'up' });
      s.snap(n ? 'lo starts at locker 0, the first one.' : 'lo starts at 0, though there is no locker 0.', { line: 2, vars: { target, lo } });

      const cHi = choices(n - 1, n > 1 ? [n, 0] : [n, 0, n + 1]);
      s.snap('Next, hi marks the last locker.', {
        line: 3, vars: { target, lo },
        ask: {
          q: `This list has ${n} ${n === 1 ? 'item' : 'items'}. What does hi start as?`,
          options: cHi.options, answer: cHi.answer,
          why: n ? `The last index is one less than the count, so hi is ${n - 1}.` : 'len(items) is 0, and 0 - 1 is -1. So hi starts before lo.',
        },
      });
      kit.place(lo, hi);
      kit.window(lo, hi);
      s.snap(n ? `hi is ${hi}. The window runs from lo to hi.` : 'hi is -1. So lo is already past hi.', { line: 3, vars: vars() });
    }

    const seen = new Set();
    let trip = 0, result = -1, found = false, ended = false;
    while (true) {
      trip += 1;
      const key = lo + ',' + hi;
      if (seen.has(key)) {
        s.set('cmp', { text: 'same lo and hi as last trip' });
        s.snap(`Look: lo is ${lo} and hi is ${hi}, the same as last trip.`, {
          line: 4, vars: vars(),
          ask: {
            q: 'lo did not move, and nothing else changed. What happens now?',
            options: ['The next trip finds the target', 'The same trip runs forever', 'Python spots the bug and fixes it'],
            answer: 1,
            why: 'mid comes out the same, so lo stays the same. Nothing can ever change.',
          },
        });
        s.snap('This is an infinite loop. The window never gets smaller.', { line: 9, vars: vars(), out: '(never ends)' });
        return;
      }
      seen.add(key);

      if (lo > hi) {
        s.snap(`Next, the loop asks its question again.`, {
          line: 4, vars: vars(),
          ask: {
            q: `lo is ${lo} and hi is ${hi}. Does the loop run again?`,
            options: ['Yes', 'No'],
            answer: 1,
            why: `${lo} <= ${hi} is False. No lockers are left in the window.`,
          },
        });
        s.del('mid');
        s.set('cmp', { text: `${lo} <= ${hi} is False` });
        s.snap('lo has passed hi, so the window is empty. The loop ends.', { line: 4, vars: vars() });
        ended = true;
        break;
      }
      if (lo === hi) {
        s.snap('Next, the loop asks its question again.', {
          line: 4, vars: vars(),
          ask: {
            q: `lo and hi are both ${lo}. Does the loop run again?`,
            options: ['Yes', 'No'],
            answer: 0,
            why: `${lo} <= ${hi} is True. One locker is left, and it still needs a look.`,
          },
        });
        s.set('cmp', { text: `${lo} <= ${hi} is True` });
        s.snap('One locker is left, so the loop runs again.', { line: 4, vars: vars() });
      } else if (!quick) {
        s.set('cmp', { text: `${lo} <= ${hi} is True` });
        s.snap('The window still has lockers in it, so a new trip starts.', { line: 4, vars: vars() });
      }

      const m = Math.floor((lo + hi) / 2);
      if (trip === 1 && !quick) {
        const cMid = choices(m, [m + 1, lo + hi + 1, hi]);
        s.snap('Now find the middle locker.', {
          line: 5, vars: vars(),
          ask: {
            q: `lo is ${lo} and hi is ${hi}. What is (lo + hi) // 2?`,
            options: cMid.options, answer: cMid.answer,
            why: `${lo} + ${hi} is ${lo + hi}. Then // cuts it in half and drops any part after the point.`,
          },
        });
      }
      mid = m;
      kit.mid(mid);
      s.set('cmp', { text: `(${lo} + ${hi}) // 2 is ${mid}` });
      s.snap(`mid is ${mid}, so the code opens locker ${mid}.`, { line: 5, vars: vars() });

      const v = items[mid];
      looks += 1;
      count();
      s.tone('c' + mid, 'active');
      const hit = v === target, low = v < target;
      s.set('cmp', { text: `items[${mid}] is ${v}` });
      const whyOrder = hit
        ? `items[${mid}] is the target, so return hands back ${mid}.`
        : sorted
          ? `${v} is ${low ? 'smaller' : 'bigger'} than ${target}. In a sorted list, everything to its ${low ? 'left is smaller' : 'right is bigger'} too.`
          : `The code sees only that ${v} ${low ? '<' : '>'} ${target}. It trusts the list to be in order.`;
      s.cue('compare', 'c' + mid, 'tgtBox');
      s.snap(`Compare items[${mid}] with the target.`, {
        line: 6, vars: vars(),
        ask: {
          q: `items[${mid}] is ${v}, and the target is ${target}. What does the code do?`,
          options: ['Stop. This is the target.', 'Throw away the left part.', 'Throw away the right part.'],
          answer: hit ? 0 : low ? 1 : 2,
          why: whyOrder,
        },
      });

      if (hit) {
        s.set('c' + mid, { tone: 'ok', scale: 1.08 });
        s.set('cmp', { text: `${v} == ${target} is True` });
        result = mid;
        found = true;
        s.snap(`${v} == ${target}, so return hands back ${mid}.`, { line: 7, vars: vars() });
        break;
      }
      if (low) {
        const newLo = stuck ? mid : mid + 1;
        s.set('c' + mid, { tone: stuck ? 'warn' : 'default' });
        kit.drop(lo, newLo - 1);
        lo = newLo;
        kit.place(lo, hi);
        kit.window(lo, hi);
        s.set('cmp', { text: `${v} < ${target}, so lo = ${stuck ? 'mid' : 'mid + 1'}` });
        s.snap(stuck ? `${v} < ${target}. lo moves to mid, so locker ${mid} stays in the window.` : `${v} < ${target}. Locker ${mid} and the left part go. lo is now ${lo}.`, { line: 9, vars: vars() });
      } else {
        s.set('c' + mid, { tone: 'default' });
        kit.drop(mid, hi);
        hi = mid - 1;
        kit.place(lo, hi);
        kit.window(lo, hi);
        s.set('cmp', { text: `${v} > ${target}, so hi = mid - 1` });
        s.snap(`${v} > ${target}. Locker ${mid} and the right part go. hi is now ${hi}.`, { line: 11, vars: vars() });
      }
    }

    if (ended) s.snap(n ? 'Every locker was thrown away, so find hands back -1.' : 'The loop never ran, so find hands back -1.', { line: 12, vars: vars() });
    const out = String(result);
    if (found) {
      s.snap(sorted
        ? `print shows ${result}. That took ${looks} ${looks === 1 ? 'look' : 'looks'} for ${n} ${n === 1 ? 'item' : 'items'}.`
        : `print shows ${result}. That was luck, as this list is not in order.`, { line: 13, vars: vars(), out });
      return;
    }
    if (!sorted && realSpot >= 0) {
      s.set('c' + realSpot, { tone: 'bad', scale: 1.08 });
      s.set('cmp', { text: `items[${realSpot}] is ${target}, but print shows -1` });
      s.snap(`But ${target} IS here, at locker ${realSpot}! The search threw it away, with no warning.`, { line: 13, vars: vars(), out });
      return;
    }
    s.snap(n
      ? `print shows -1. It took ${looks} ${looks === 1 ? 'look' : 'looks'} to be sure ${target} is not here.`
      : 'print shows -1. It took 0 looks, as the loop never ran.', { line: 13, vars: vars(), out });
  }

  const binaryTries = [
    { list: '', target: 3 }, { list: '5', target: 5 }, { list: '5', target: 6 }, { list: '5', target: 2 },
    { list: '1, 2', target: 2 }, { list: '1, 2', target: 0 },
    { list: '4, 4, 4, 4', target: 4 }, { list: '1, 2, 3, 4, 5, 6, 7, 8', target: 8 },
    { list: '1, 2, 3, 4, 5, 6, 7, 8', target: 99 }, { list: '1, 2, 3, 4, 5, 6, 7, 8', target: -5 },
    { list: '8, 7, 6, 5, 4, 3, 2, 1', target: 2 }, { list: 'cat, dog', target: 1 },
    { list: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11', target: 8 }, { list: '-50, -3, 0, 999', target: 999 },
  ];
  const binaryInputs = (list, target) => [
    { key: 'list', label: 'List', type: 'text', value: list, size: 18 },
    { key: 'target', label: 'Target', type: 'number', value: target, min: -99, max: 999 },
  ];

  Viz.register('m10-binary-trace', {
    title: 'Binary search: open the middle, throw half away',
    size: [560, 240],
    code: BINARY_CODE('lo = mid + 1'),
    inputs: binaryInputs('2, 4, 5, 7, 8, 9', 7),
    tryInputs: binaryTries,
    build(s, p) { binaryRun(s, p); },
  });

  Viz.register('m10-binary-miss', {
    title: 'When the target is not there, lo and hi cross',
    size: [560, 240],
    code: BINARY_CODE('lo = mid + 1'),
    inputs: binaryInputs('2, 4, 5, 7, 8, 9', 6),
    tryInputs: binaryTries,
    build(s, p) { binaryRun(s, p, { quick: true }); },
  });

  Viz.register('m10-binary-unsorted', {
    title: 'What breaks when the list is not sorted?',
    size: [560, 240],
    code: BINARY_CODE('lo = mid + 1'),
    inputs: binaryInputs('9, 2, 7, 4, 1', 2),
    tryInputs: binaryTries,
    build(s, p) { binaryRun(s, p, { quick: true }); },
  });

  Viz.register('m10-bug-stuck', {
    title: 'One small bug: lo = mid',
    size: [560, 240],
    code: BINARY_CODE('lo = mid'),
    inputs: binaryInputs('2, 4', 4),
    tryInputs: binaryTries,
    build(s, p) { binaryRun(s, p, { stuck: true, quick: true }); },
  });

  // ---------------------------------------------------------------- lesson 10.3
  Viz.register('m10-bisect-fence', {
    title: 'bisect tells you where the fence goes',
    size: [560, 226],
    code: py`
      from bisect import bisect_left
      from bisect import bisect_right
      items = sorted(items)
      left = bisect_left(items, x)
      right = bisect_right(items, x)
      print(left, right)
      print(right - left)
    `,
    inputs: [
      { key: 'list', label: 'List', type: 'text', value: '2, 4, 4, 4, 7, 9', size: 18 },
      { key: 'x', label: 'x', type: 'number', value: 4, min: -99, max: 999 },
    ],
    tryInputs: [
      { list: '', x: 3 }, { list: '5', x: 5 }, { list: '5', x: 1 }, { list: '5', x: 9 },
      { list: '4, 4, 4, 4', x: 4 }, { list: '2, 4, 7, 9', x: 5 }, { list: '2, 4, 7, 9', x: 99 }, { list: '2, 4, 7, 9', x: -1 },
      { list: '9, 1, 5, 5, 3', x: 5 }, { list: 'cat, dog', x: 1 }, { list: '1, 2, 3, 4, 5, 6, 7, 8, 9', x: 8 },
    ],
    build(s, p) {
      const raw = readNums(p.list, 8);
      const items = raw.nums.slice().sort((a, b) => a - b);
      const changed = !inOrder(raw.nums);
      const x = whole(p.x, -99, 999, 0);
      const n = items.length;
      const o = { y: 104, cell: 52, gap: 6 };
      const X = i => s.slotX(i, n, o);
      const gapX = i => (!n ? 280 : i === 0 ? X(0) - 29 : X(i - 1) + 29);
      const left = items.filter(v => v < x).length;
      const right = items.filter(v => v <= x).length;
      const count = right - left;
      const vars = extra => Object.assign({ x }, extra);

      s.text('tgt', 20, 18, `x is ${x}`, { size: 15, anchor: 'start', weight: 700 });
      if (n) s.row('c', items, o);
      else s.text('empty', 130, 104, 'This list is empty.', { size: 16, tone: 'muted' });
      s.snap((changed ? 'sorted puts your list in order first. bisect needs that.'
        : n ? 'This list is in order already. bisect needs that.'
          : 'An empty list has one place for a fence: spot 0.') + skipNote(raw.skipped), { line: 3, vars: vars() });

      if (n) {
        items.forEach((v, i) => {
          s.text('sign' + i, X(i), 168, v < x ? '<' : v === x ? '=' : '>', { size: 16, mono: true, weight: 700 });
          if (v === x) s.tone('c' + i, 'active');
        });
        s.snap(`Each mark shows if that item is smaller than, equal to, or bigger than ${x}.`, { line: 4, vars: vars() });
      }

      const cL = choices(left, [right, left + 1, Math.max(0, left - 1)]);
      s.snap(`bisect_left puts its fence right after the items smaller than ${x}.`, {
        line: 4, vars: vars(),
        ask: {
          q: 'What number will bisect_left hand back?',
          options: cL.options, answer: cL.answer,
          why: `${left} ${left === 1 ? 'item is' : 'items are'} smaller than ${x}. The fence goes right after them, at spot ${left}.`,
        },
      });
      s.box('fl', gapX(left), 104, '', { w: 6, h: 92, tone: 'accent' });
      s.pointer('pl', gapX(left), 184, 'left', { dir: 'up' });
      s.snap(n ? `left is ${left}. Everything left of this fence is smaller than ${x}.` : 'left is 0, as no items are smaller.', { line: 4, vars: vars({ left }) });

      const cR = choices(right, [left, right + 1, Math.max(0, right - 1)]);
      s.snap(`bisect_right puts its fence right after the items that are ${x} or less.`, {
        line: 5, vars: vars({ left }),
        ask: {
          q: 'What number will bisect_right hand back?',
          options: cR.options, answer: cR.answer,
          why: count
            ? `${right} ${right === 1 ? 'item is' : 'items are'} ${x} or smaller. The fence goes right after them, at spot ${right}.`
            : `No item equals ${x}, so nothing sits between the fences. Both land at spot ${right}.`,
        },
      });
      s.box('fr', gapX(right), 104, '', { w: 6, h: 92, tone: 'accent' });
      s.pointer('pr', gapX(right), 56, 'right', { dir: 'down' });
      s.snap(count
        ? `right is ${right}. Everything right of this fence is bigger than ${x}.`
        : `right is ${right} too. The 2 fences stand at the same gap.`, { line: 5, vars: vars({ left, right }) });

      const out1 = `${left} ${right}`;
      s.snap('print shows both numbers.', { line: 6, vars: vars({ left, right }), out: out1 });

      const cC = choices(count, [count + 1, right, Math.max(0, count - 1)]);
      s.snap('Next, right - left works out a new number.', {
        line: 7, vars: vars({ left, right }), out: out1,
        ask: {
          q: `What does ${right} - ${left} tell you?`,
          options: [`${count} ${count === 1 ? 'copy' : 'copies'} of ${x}`, `${count + 1} ${count + 1 === 1 ? 'copy' : 'copies'} of ${x}`, `${x} is at spot ${count}`],
          answer: 0,
          why: 'The only items between the fences are the ones equal to x. So the gap counts them.',
        },
      });
      s.snap(count
        ? `There ${count === 1 ? 'is 1 copy' : `are ${count} copies`} of ${x} between the fences.`
        : `${x} is not here. Spot ${left} is where a new ${x} could go.`, { line: 7, vars: vars({ left, right }), out: `${out1}\n${count}` });
    },
  });

  Viz.register('m10-first-at-least', {
    title: 'Finding the fence: keep going after a match',
    size: [560, 258],
    code: py`
      def first_at_least(items, x):
          lo = 0
          hi = len(items) - 1
          best = len(items)
          while lo <= hi:
              mid = (lo + hi) // 2
              if items[mid] >= x:
                  best = mid
                  hi = mid - 1
              else:
                  lo = mid + 1
          return best
      print(first_at_least(items, x))
    `,
    inputs: [
      { key: 'list', label: 'List', type: 'text', value: '2, 4, 4, 4, 7, 9', size: 18 },
      { key: 'x', label: 'x', type: 'number', value: 4, min: -99, max: 999 },
    ],
    tryInputs: [
      { list: '', x: 3 }, { list: '5', x: 5 }, { list: '5', x: 1 }, { list: '5', x: 9 },
      { list: '4, 4, 4, 4', x: 4 }, { list: '2, 4, 7, 9', x: 5 }, { list: '2, 4, 7, 9', x: 99 }, { list: '2, 4, 7, 9', x: -1 },
      { list: '9, 1, 5, 5, 3', x: 5 }, { list: 'cat, dog', x: 1 }, { list: '1, 2, 3, 4, 5, 6, 7, 8, 9', x: 8 },
    ],
    build(s, p) {
      const raw = readNums(p.list, 8);
      const items = raw.nums.slice().sort((a, b) => a - b);
      const x = whole(p.x, -99, 999, 0);
      const shift = 16;
      const kit = listKit(s, items, shift);
      const n = items.length;
      let lo = 0, hi = n - 1, best = n, mid = null, looks = 0;
      /* The best arrow sits right above the row. If mid is on the same spot, it stands above mid. */
      const bestX = () => Math.min(530, kit.X(best));
      const placeBest = () => s.set('best', { x: bestX(), y: (mid === best ? 44 : 78) + shift });
      const vars = () => {
        const v = { x, lo, hi, best };
        if (mid != null) v.mid = mid;
        return v;
      };

      s.text('tgt', 20, 18, `x is ${x}`, { size: 15, anchor: 'start', weight: 700 });
      s.text('count', 540, 18, 'looks: 0', { size: 15, anchor: 'end', weight: 700 });
      s.text('cmp', 280, 220 + shift, '', { size: 15, mono: true, weight: 700 });
      kit.draw();
      s.snap((!n ? 'There are no lockers at all.' : inOrder(raw.nums) ? 'The list is in order.' : 'I sorted your list first, as this search needs order.') + skipNote(raw.skipped), { line: 1, vars: { x } });

      kit.place(lo, hi);
      kit.window(lo, hi);
      s.snap(n ? 'The window runs from lo to hi. This is the same start as before.' : 'lo is 0 and hi is -1, so lo is already past hi.', { line: 3, vars: { x, lo, hi } });
      s.pointer('best', bestX(), 78 + shift, 'best', { dir: 'down', tone: 'ok' });
      s.snap(`best starts at ${n}, the spot past the end. It means "none yet".`, { line: 4, vars: vars() });

      let asked = 0;
      while (lo <= hi) {
        s.set('cmp', { text: `${lo} <= ${hi} is True` });
        s.snap('The window still has lockers in it, so a new trip starts.', { line: 5, vars: vars() });
        mid = Math.floor((lo + hi) / 2);
        kit.mid(mid);
        placeBest();
        s.set('cmp', { text: `(${lo} + ${hi}) // 2 is ${mid}` });
        s.snap(`mid is ${mid}, so the code opens locker ${mid}.`, { line: 6, vars: vars() });

        const v = items[mid];
        const yes = v >= x;
        looks += 1;
        s.set('count', { text: `looks: ${looks}` });
        s.tone('c' + mid, 'active');
        s.set('cmp', { text: `items[${mid}] is ${v}` });
        const firstMatch = v === x && !asked;
        s.snap(`Is ${v} >= ${x}? Think about what comes next.`, {
          line: 7, vars: vars(),
          ask: firstMatch ? {
            q: `items[${mid}] is ${x}, the value you want. What does the code do?`,
            options: ['Stop. It found x.', 'Save this spot as best, and look further left.'],
            answer: 1,
            why: `A ${x} could sit further left. So save this spot, and keep looking for an earlier one.`,
          } : {
            q: `items[${mid}] is ${v}, and x is ${x}. Which part goes?`,
            options: ['The left part', 'The right part'],
            answer: yes ? 1 : 0,
            why: yes
              ? `${v} >= ${x}, so the first such spot is here or further left. The right part goes.`
              : `${v} < ${x}, so it is too small, and so is everything to its left.`,
          },
        });
        if (firstMatch) asked = 1;

        if (yes) {
          best = mid;
          placeBest();
          s.set('c' + mid, { tone: 'ok' });
          s.set('cmp', { text: `${v} >= ${x} is True, so best = ${mid}` });
          s.snap(`Spot ${mid} is the best so far. best is now ${mid}.`, { line: 8, vars: vars() });
          for (let i = mid + 1; i <= hi; i += 1) s.set('c' + i, { tone: 'muted', scale: 0.78 });
          s.set('c' + mid, { scale: 0.92 });
          hi = mid - 1;
          kit.place(lo, hi);
          kit.window(lo, hi);
          s.set('cmp', { text: 'hi = mid - 1' });
          s.snap(`Now look further left. hi is now ${hi}.`, { line: 9, vars: vars() });
        } else {
          kit.drop(lo, mid);
          lo = mid + 1;
          kit.place(lo, hi);
          kit.window(lo, hi);
          s.set('cmp', { text: `${v} < ${x}, so lo = mid + 1` });
          s.snap(`${v} is too small. Locker ${mid} and the left part go. lo is now ${lo}.`, { line: 11, vars: vars() });
        }
      }

      const none = best === n;
      s.snap('Next, the loop asks its question again.', {
        line: 5, vars: vars(),
        ask: {
          q: `lo is ${lo} and hi is ${hi}. Does the loop run again?`,
          options: ['Yes', 'No'],
          answer: 1,
          why: `${lo} <= ${hi} is False. The window is empty, so the fence is where best says.`,
        },
      });
      s.del('mid');
      s.set('best', { y: 78 + shift });
      s.set('cmp', { text: `${lo} <= ${hi} is False` });
      s.snap('lo has passed hi, so the loop ends.', { line: 5, vars: vars() });
      s.set('cmp', { text: `return ${best}` });
      s.snap(`best is ${best}, so that comes back.`, { line: 12, vars: vars() });
      const say = none
        ? `print shows ${best}. No item is ${x} or more, so the fence goes at the end.`
        : items[best] === x
          ? `print shows ${best}. That is the first ${x}, and it took ${looks} ${looks === 1 ? 'look' : 'looks'}.`
          : `print shows ${best}. ${x} is not here, so ${best} is where it could go.`;
      s.snap(say, { line: 13, vars: vars(), out: String(best) });
    },
  });

  // ---------------------------------------------------------------- lesson 10.4
  Viz.register('m10-answer-line', {
    title: 'Search the answers, not a list',
    size: [560, 240],
    code: py`
      lo = 1
      hi = max(piles)
      best = -1
      while lo <= hi:
          mid = (lo + hi) // 2
          if works(mid):
              best = mid
              hi = mid - 1
          else:
              lo = mid + 1
      print(best)
    `,
    inputs: [
      { key: 'piles', label: 'Piles', type: 'text', value: '4, 9, 6', size: 14 },
      { key: 'limit', label: 'Hours', type: 'number', value: 6, min: 1, max: 40 },
    ],
    tryInputs: [
      { piles: '', limit: 3 }, { piles: '5', limit: 1 }, { piles: '5', limit: 40 }, { piles: '1', limit: 1 },
      { piles: '4, 9, 6', limit: 2 }, { piles: '4, 9, 6', limit: 3 }, { piles: '12, 12, 12, 12, 12', limit: 5 },
      { piles: '12, 12, 12, 12, 12', limit: 40 }, { piles: 'cat', limit: 3 }, { piles: '99, 3', limit: 3 }, { piles: '0, 2', limit: 3 },
      { piles: '1, 1, 1, 1, 1, 1', limit: 6 },
    ],
    build(s, p) {
      const { nums: piles, skipped } = readNums(p.piles, 5, 1, 12);
      const limit = whole(p.limit, 1, 40, 6);
      const hoursFor = sp => piles.map(size => Math.ceil(size / sp));
      s.text('story', 20, 18, `piles: ${piles.join(', ') || 'none'}. limit: ${limit} hours.`, { size: 15, anchor: 'start', weight: 700 });
      if (!piles.length) {
        s.text('empty', 280, 120, 'There are no piles.', { size: 16, tone: 'muted' });
        s.snap(`There are no piles here.${skipNote(skipped)}`, {
          line: 1, vars: { limit },
          ask: {
            q: 'What will max(piles) do with an empty list?',
            options: ['Hand back 0', 'Stop with a ValueError', 'Hand back None'],
            answer: 1,
            why: 'max has nothing to look at, so Python stops. Check for an empty list first.',
          },
        });
        s.snap('max finds nothing, so Python stops with a ValueError.', { line: 2, vars: { limit }, out: 'ValueError' });
        return;
      }

      const top = Math.max(...piles);
      const o = { y: 110, cell: 38, gap: 6 };
      const X = sp => s.slotX(sp - 1, top, o);
      let lo = 1, hi = top, best = -1, mid = null, checks = 0;
      const vars = () => {
        const v = { lo, hi, best };
        if (mid != null) v.mid = mid;
        return v;
      };
      // lo and hi can step past the row when they cross, so keep their arrows on the stage.
      const P = sp => Math.max(14, Math.min(546, X(sp)));
      const place = () => {
        const same = lo === hi;
        s.set('lo', { x: P(lo), text: same ? 'lo hi' : 'lo' });
        s.set('hi', { x: P(hi), opacity: same ? 0 : 1 });
        if (lo > hi) s.del('win');
        else s.set('win', { x: X(lo) - 22, w: X(hi) - X(lo) + 44 });
      };

      for (let sp = 1; sp <= top; sp += 1) s.box('c' + sp, X(sp), o.y, sp, { w: o.cell, h: o.cell });
      s.text('rowlabel', 20, 42, 'speeds', { size: 14, anchor: 'start', tone: 'muted' });
      s.snap(`Each box is one speed to try. The slowest is 1.${skipNote(skipped)}`, { line: 1, vars: { limit } });

      s.area('win', X(1) - 22, 84, X(hi) - X(1) + 44, 52, '');
      s.pointer('lo', X(lo), 164, lo === hi ? 'lo hi' : 'lo', { dir: 'up' });
      s.pointer('hi', X(hi), 164, 'hi', { dir: 'up', opacity: lo === hi ? 0 : 1 });
      s.snap(`The biggest pile holds ${top}. Speed ${top} clears any pile in 1 hour, so hi is ${top}.`, { line: 2, vars: { lo, hi, limit } });
      s.text('cmp', 280, 220, '', { size: 15, mono: true, weight: 700 });
      s.snap('best is -1 for now. That means no speed has worked yet.', { line: 3, vars: vars() });

      let trip = 0;
      while (lo <= hi) {
        trip += 1;
        s.snap(`${lo} <= ${hi} is True, so a new trip starts.`, { line: 4, vars: vars() });
        mid = Math.floor((lo + hi) / 2);
        if (s.has('mid')) s.set('mid', { x: X(mid) });
        else s.pointer('mid', X(mid), 84, 'mid', { dir: 'down', tone: 'active' });
        s.tone('c' + mid, 'active');
        s.snap(`The middle speed is ${mid}. Try that one.`, { line: 5, vars: vars() });

        const parts = hoursFor(mid);
        const total = parts.reduce((a, b) => a + b, 0);
        const yes = total <= limit;
        checks += 1;
        s.set('cmp', { text: `speed ${mid}: ${parts.join(' + ')} = ${total} hours` });
        s.snap(`At speed ${mid}, the piles take ${total} hours. The limit is ${limit}.`, {
          line: 6, vars: vars(),
          ask: trip === 1 ? {
            q: `Does speed ${mid} finish in time?`,
            options: ['Yes', 'No'],
            answer: yes ? 0 : 1,
            why: `${total} ${yes ? 'is not more than' : 'is more than'} ${limit}, so the answer is ${yes ? 'Yes' : 'No'}.`,
          } : null,
        });

        s.text('mark' + mid, X(mid), 142, yes ? 'Yes' : 'No', { size: 13, weight: 700, tone: yes ? 'ok' : 'bad' });
        s.snap(`Speed ${mid} gets a ${yes ? 'Yes' : 'No'}. Now throw some speeds away.`, {
          line: 6, vars: vars(),
          ask: {
            q: yes ? `Speed ${mid} works. Which speeds can you throw away?` : `Speed ${mid} is too slow. Which speeds can you throw away?`,
            options: [`${mid} and slower`, `Faster than ${mid}`, 'None of them'],
            answer: yes ? 1 : 0,
            why: yes
              ? `Faster speeds also work, but you want the slowest. So look only at speeds below ${mid}.`
              : `Slower speeds take even longer, so ${mid} and below can never work.`,
          },
        });

        const dim = (a, b) => { for (let i = a; i <= b; i += 1) s.set('c' + i, { tone: 'muted', scale: 0.78 }); };
        if (yes) {
          if (best > 0) s.set('c' + best, { tone: 'muted', scale: 0.78 });
          best = mid;
          s.set('c' + mid, { tone: 'ok', scale: 0.92 });
          dim(mid + 1, hi);
          hi = mid - 1;
          place();
          s.set('cmp', { text: `best = ${best}, hi = ${hi}` });
          s.snap(`Save ${best} as best, then look for something slower.`, { line: 8, vars: vars() });
        } else {
          dim(lo, mid);
          lo = mid + 1;
          place();
          s.set('cmp', { text: `lo = ${lo}` });
          s.snap(`Speed ${mid} and slower go. lo is now ${lo}.`, { line: 10, vars: vars() });
        }
      }

      s.snap('Next, the loop asks its question again.', {
        line: 4, vars: vars(),
        ask: {
          q: `lo is ${lo} and hi is ${hi}. Does the loop run again?`,
          options: ['Yes', 'No'],
          answer: 1,
          why: `${lo} <= ${hi} is False. No speeds are left to try.`,
        },
      });
      s.del('mid');
      s.set('cmp', { text: `${lo} <= ${hi} is False` });
      s.snap('lo has passed hi, so the loop ends.', { line: 4, vars: vars() });
      if (best > 0) {
        s.set('c' + best, { tone: 'ok', scale: 1.08 });
        s.set('cmp', { text: `${checks} ${checks === 1 ? 'check' : 'checks'}, out of ${top} speeds` });
        s.snap(`print shows ${best}, the slowest speed that works. It took ${checks} ${checks === 1 ? 'check' : 'checks'}.`, { line: 11, vars: vars(), out: String(best) });
      } else {
        s.set('cmp', { text: `${piles.length} piles, but only ${limit} hours` });
        s.snap(`print shows -1. No speed works, as each pile needs at least 1 hour.`, { line: 11, vars: vars(), out: '-1' });
      }
    },
  });
})();
