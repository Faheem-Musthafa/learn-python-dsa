/* Visuals for module 16. Names start with the module id.
 * Pile pictures use the words from lesson 4.2: main code at the bottom, "runs now" and "waits".
 * Every input is held in a safe range here too, so a typed value can never break a picture.
 */
(function () {
  const whole = (v, lo, hi, fallback) => {
    let n = Math.round(Number(v));
    if (!Number.isFinite(n)) n = fallback;
    return Math.max(lo, Math.min(hi, n));
  };
  /* Puts the right option in a spot that depends on `turn`, so the answer does not always sit first. */
  const mix = (right, wrongs, turn) => {
    const answer = turn % (wrongs.length + 1);
    const options = wrongs.slice();
    options.splice(answer, 0, right);
    return { options: options.map(String), answer };
  };
  const listText = a => '[' + a.join(', ') + ']';
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  /* ---------------------------------------------------------------- 16.1 */
  Viz.register('m16-countdown', {
    title: 'Each call opens a smaller doll',
    size: [560, 190],
    code: py`
      def countdown(n):
          if n == 0:
              print("Go!")
          else:
              print(n)
              countdown(n - 1)

      countdown(pick)
    `,
    inputs: [
      { key: 'pick', label: 'pick (0 to 5)', type: 'number', value: 3, min: 0, max: 5 },
    ],
    tryInputs: [{ pick: 0 }, { pick: 1 }, { pick: 2 }, { pick: 5 }, { pick: '' }, { pick: 'cat' }],
    build(s, p) {
      const pick = whole(p.pick, 0, 5, 3);
      const rad = n => 20 + n * 5;
      const gap = 10, Y = 106;
      let span = -gap;
      for (let n = pick; n >= 0; n--) span += 2 * rad(n) + gap;
      let left = (560 - span) / 2;
      const X = {};
      for (let n = pick; n >= 0; n--) { X[n] = left + rad(n); left += 2 * rad(n) + gap; }
      let out = '';

      s.text('cap', 280, 24, 'Each doll is one call. Its number is its own n.', { size: 14 });
      s.snap(`Line 8 calls countdown(${pick}). Nothing has printed yet.`, { line: 8, vars: { pick }, out });

      for (let n = pick; n >= 1; n--) {
        if (n < pick) s.tone('d' + (n + 1), 'default');
        s.circle('d' + n, X[n], Y, n, { r: rad(n), tone: 'active' });
        s.snap(`countdown(${n}) starts. This call has its own n, which names ${n}.`, {
          line: 1, vars: { n }, out,
          ask: n === pick ? {
            q: `n names ${n}. Which part of the if runs?`,
            options: ['The if part, so it prints Go!', 'The else part, so it prints the number'],
            answer: 1,
            why: 'The if part runs only when n is 0. This n is bigger, so the else part runs.',
          } : null,
        });

        out += (out ? '\n' : '') + n;
        const nextIsBase = n === 1;
        s.snap(`n is not 0, so line 5 prints ${n}.`, {
          line: 5, vars: { n }, out,
          ask: nextIsBase ? {
            q: 'Line 6 calls countdown(0). What will that call do?',
            options: ['Print Go! and call nobody', 'Print 0', 'Call countdown(-1)'],
            answer: 0,
            why: 'n is 0, so the if part runs. It prints Go! and makes no more calls. This is the base case.',
          } : n === pick ? {
            q: `Line 6 calls again. What n does the new call get?`,
            options: [String(n), String(n - 1), '0'],
            answer: 1,
            why: `The call hands over n - 1, which is ${n - 1}. Each call has a smaller job.`,
          } : null,
        });
      }

      if (pick > 0) s.tone('d1', 'default');
      s.circle('d0', X[0], Y, 0, { r: rad(0), tone: 'active' });
      s.text('baseLbl', X[0], Y + 38, 'base case', { size: 14, weight: 700 });
      s.snap('countdown(0) starts. Its n names 0, so the if part runs.', {
        line: 2, vars: { n: 0 }, out,
        ask: pick === 0 ? {
          q: 'n names 0. What happens now?',
          options: ['It prints Go! and stops calling', 'It calls countdown(-1)'],
          answer: 0,
          why: 'n == 0 is True, so the if part runs. No more calls happen. This is the base case.',
        } : null,
      });

      out += (out ? '\n' : '') + 'Go!';
      s.tone('d0', 'ok');
      s.snap('It prints Go! and makes no more calls. The smallest doll does not open.', { line: 3, vars: { n: 0 }, out });

      for (let n = 0; n <= pick; n++) s.tone('d' + n, 'muted');
      s.snap('Each waiting call now has nothing left to do. They end, smallest first.', { line: 8, vars: { pick }, out });
    },
  });

  /* ---------------------------------------------------------------- 16.2 */
  /* The core picture: a frame per call, the pile grows, and each answer travels back down. */
  Viz.register('m16-stack', {
    title: 'Each call gets its own frame',
    size: [560, 324],
    code: py`
      def factorial(n):
          if n <= 1:
              return 1
          smaller = factorial(n - 1)
          return n * smaller

      print(factorial(pick))
    `,
    inputs: [
      { key: 'pick', label: 'pick (0 to 5)', type: 'number', value: 3, min: 0, max: 5 },
    ],
    tryInputs: [{ pick: 0 }, { pick: 1 }, { pick: 2 }, { pick: 4 }, { pick: 5 }, { pick: '' }, { pick: 'x' }],
    build(s, p) {
      const pick = whole(p.pick, 0, 5, 3);
      const Y = i => 276 - 46 * i;
      const NOTE = 328, SMALL = 286;
      let calls = 0;

      const note = (id, y, text) => s.text(id, NOTE, y, text, { size: 14, anchor: 'start', weight: 700 });
      const wake = (k, text) => s.set('note' + k, { text, x: NOTE });

      /* Bottom of the pile. */
      s.text('floor', 165, 308, 'bottom of the pile', { size: 13, tone: 'muted' });
      s.box('frMain', 165, Y(0), '', { w: 300, h: 40, tone: 'warn' });
      s.text('nmMain', 26, Y(0), 'main code', { size: 14, anchor: 'start', weight: 700 });
      s.text('plMain', 176, Y(0), 'pick', { size: 14, mono: true });
      s.box('pvMain', 228, Y(0), pick, { w: 38, h: 30, size: 16 });
      note('noteMain', Y(0), 'runs now');
      s.snap('Your main code runs first. It is the bottom of the pile.', { line: 7, vars: { pick } });

      /* Going up: one new frame per call. */
      const chain = [];
      for (let k = pick; ; k--) { chain.push(k); if (k <= 1) break; }
      chain.forEach((k, i) => {
        const y = Y(i + 1);
        const below = i === 0 ? 'Main' : chain[i - 1];
        s.tone(i === 0 ? 'frMain' : 'fr' + below, 'default');
        if (i > 0) s.tone('nv' + below, 'default');
        wake(below, `waits for factorial(${k})`);
        calls += 1;
        s.box('fr' + k, 165, y, '', { w: 300, h: 40, tone: 'warn' });
        s.text('nm' + k, 26, y, 'factorial', { size: 14, anchor: 'start', weight: 700 });
        s.text('nl' + k, 116, y, 'n', { size: 15, mono: true });
        s.box('nv' + k, 148, y, k, { w: 38, h: 30, size: 16, tone: 'active' });
        note('note' + k, y, 'runs now');
        s.cue('carry', i === 0 ? 'pvMain' : 'nv' + below, 'nv' + k, k);
        s.snap(`factorial(${k}) goes on top. It gets a new frame with its own n.`, { line: 1, vars: { n: k, 'calls so far': calls } });

        if (k > 1) {
          s.text('sl' + k, 222, y, 'smaller', { size: 14, mono: true });
          s.box('sv' + k, SMALL, y, '?', { w: 54, h: 30, size: 16, tone: 'muted' });
          s.snap(`n is ${k}, so n <= 1 is False. Line 4 needs factorial(${k - 1}).`, {
            line: 4, vars: { n: k, smaller: '?', 'calls so far': calls },
            ask: i === 0 ? {
              q: `The next call has n = ${k - 1}. What happens to the n in this frame?`,
              options: [`It changes to ${k - 1}`, `It stays ${k}`, 'It is deleted'],
              answer: 1,
              why: 'Each frame has its own n. A new call makes a new n, and this one waits unchanged.',
            } : null,
          });
        }
      });

      /* The top of the pile: the base case. */
      const top = chain[chain.length - 1];
      s.snap(`n is ${top}, so n <= 1 is True. This is the base case.`, {
        line: 2, vars: { n: top, 'calls so far': calls },
        ask: {
          q: `What does factorial(${top}) return?`,
          options: ['1', top === 1 ? 'factorial(0)' : `factorial(${top - 1})`, 'Nothing'],
          answer: 0,
          why: 'Line 3 returns 1 and makes no more calls. So the pile stops growing here.',
        },
      });

      s.circle('ret', 345, Y(chain.length), 1, { r: 17, size: 15, tone: 'ok' });
      s.set('note' + top, { text: 'returns 1', x: 370 });
      s.snap(`factorial(${top}) returns 1. Now the answers start to travel back down.`, { line: 3, vars: { n: top, 'calls so far': calls } });

      /* Going down: each answer lands in the frame below. */
      let value = 1;
      for (let i = chain.length - 1; i >= 1; i--) {
        const gone = chain[i], k = chain[i - 1];
        const y = Y(i);
        s.del('fr' + gone, 'nm' + gone, 'nl' + gone, 'nv' + gone, 'note' + gone, 'sl' + gone, 'sv' + gone);
        s.tone('fr' + k, 'warn');
        s.tone('nv' + k, 'active');
        wake(k, 'runs now');
        s.set('ret', { x: SMALL, y });
        s.set('sv' + k, { text: '' });
        const answer = k * value;
        const m = mix(answer, [k + value, value], k);
        s.snap(`factorial(${gone}) comes off the pile. The ${value} lands in smaller, in the frame below.`, {
          line: 4, vars: { n: k, smaller: value, 'calls so far': calls },
          ask: {
            q: `This frame has n = ${k} and smaller = ${value}. What does it return?`,
            options: m.options,
            answer: m.answer,
            why: `Line 5 returns n * smaller, and ${k} * ${value} is ${answer}.`,
          },
        });

        const got = value;
        s.set('sv' + k, { text: got, tone: 'ok' });
        value = answer;
        s.set('ret', { x: 345, y, text: value });
        s.set('note' + k, { text: `returns ${k} * ${got} = ${value}`, x: 370 });
        s.snap(`This n still names ${k}. So it returns ${k} * ${got}, which is ${value}.`, {
          line: 5, vars: { n: k, smaller: got, 'calls so far': calls },
        });
      }

      const last = chain[0];
      s.del('fr' + last, 'nm' + last, 'nl' + last, 'nv' + last, 'note' + last, 'sl' + last, 'sv' + last);
      s.tone('frMain', 'warn');
      wake('Main', 'runs now');
      s.set('ret', { x: SMALL, y: Y(0) });
      s.snap(`The last factorial frame comes off. The ${value} lands in your main code.`, { line: 7, vars: { pick, 'calls so far': calls } });

      s.set('noteMain', { text: `prints ${value}` });
      s.pulse('ret');
      s.snap(`print shows ${value}. It took ${many(calls, 'call')}. Now pick a new number above.`, { line: 7, vars: { pick, 'calls so far': calls }, out: String(value) });
    },
  });

  /* A bug makes the pile grow until Python stops it. No code panel, because the code depends on the version picked. */
  const VERSIONS = {
    none: {
      lines: ['def factorial(n):', '    return n * factorial(n - 1)', '', 'print(factorial(start))'],
      callLine: 1, base: () => false, next: n => n - 1,
      why: n => `n is ${n}. No line says stop, so it calls factorial(${n - 1}).`,
      fix: ['Add a base case:', 'if n <= 1: return 1'],
    },
    same: {
      lines: ['def factorial(n):', '    if n <= 1:', '        return 1', '    return n * factorial(n)', '', 'print(factorial(start))'],
      callLine: 3, base: n => n <= 1, next: n => n,
      why: n => `n is ${n}. The call hands over the same n, so the job never shrinks.`,
      fix: ['Make the job smaller:', 'factorial(n - 1)'],
    },
    past: {
      lines: ['def factorial(n):', '    if n == 1:', '        return 1', '    return n * factorial(n - 1)', '', 'print(factorial(start))'],
      callLine: 3, base: n => n === 1, next: n => n - 1,
      why: n => `n is ${n}, not 1. So it calls factorial(${n - 1}).`,
      fix: ['Catch 0 and below too:', 'if n <= 1: return 1'],
    },
    good: {
      lines: ['def factorial(n):', '    if n <= 1:', '        return 1', '    return n * factorial(n - 1)', '', 'print(factorial(start))'],
      callLine: 3, base: n => n <= 1, next: n => n - 1,
      why: n => `n is ${n}, which is not 1 or less. So it calls factorial(${n - 1}).`,
    },
  };

  Viz.register('m16-too-deep', {
    title: 'A pile that never stops growing',
    size: [560, 290],
    inputs: [
      { key: 'version', label: 'Version', type: 'select', value: 'none', options: [
        { label: 'No base case', value: 'none' },
        { label: 'Same n each time', value: 'same' },
        { label: 'Only if n == 1', value: 'past' },
        { label: 'Fixed: if n <= 1', value: 'good' },
      ] },
      { key: 'start', label: 'start (0 to 5)', type: 'number', value: 3, min: 0, max: 5 },
    ],
    tryInputs: [
      { version: 'none', start: 0 }, { version: 'none', start: 5 },
      { version: 'same', start: 1 }, { version: 'same', start: 4 },
      { version: 'past', start: 0 }, { version: 'past', start: 1 }, { version: 'past', start: 5 },
      { version: 'good', start: 0 }, { version: 'good', start: 1 }, { version: 'good', start: 5 },
      { version: 'other', start: '' },
    ],
    build(s, p) {
      const v = VERSIONS[p.version] || VERSIONS.none;
      const start = whole(p.start, 0, 5, 3);
      const FULL = 5;
      const PX = 446, Y = i => 252 - 42 * i;
      const lineY = i => 32 + i * 26;

      /* Work out what will happen, so the first question has a true answer. */
      const chain = [];
      let n = start;
      while (chain.length < FULL + 1 && !v.base(n)) { chain.push(n); n = v.next(n); }
      const stops = chain.length <= FULL && v.base(n);
      if (stops) chain.push(n);

      s.box('mark', 166, lineY(v.lines.length - 1), '', { w: 308, h: 26, tone: 'warn' });
      v.lines.forEach((t, i) => {
        if (!t) return;
        const pad = t.length - t.trimStart().length;
        s.text('c' + i, 22 + pad * 9, lineY(i), t.trim(), { size: 14, anchor: 'start', mono: true });
      });
      s.text('countLbl', 22, 204, 'calls on the pile', { size: 14, anchor: 'start', weight: 700 });
      s.box('count', 216, 204, 0, { w: 104, h: 34, size: 16 });
      s.text('floor', PX, 279, 'bottom of the pile', { size: 13, tone: 'muted' });
      s.box('main', PX, Y(0), 'main code', { w: 212, h: 34, size: 15, tone: 'default' });
      s.snap(`Read the code. Your main code will call factorial(${start}).`, {
        vars: { start },
        ask: {
          q: `Will a call to factorial(${start}) ever reach a line that stops?`,
          options: ['Yes, a call will stop and return', 'No, the pile will keep growing'],
          answer: stops ? 0 : 1,
          why: stops
            ? `Each call moves n closer, and the stop rule catches it. Watch the pile stop growing.`
            : 'No call ever meets a stop rule. n keeps going, and each call waits for the next one.',
        },
      });

      const rowText = (k, state) => `factorial n=${k} ${state}`;
      const shown = chain.slice(0, FULL);
      shown.forEach((k, i) => {
        if (i > 0) s.set('r' + (i - 1), { text: rowText(shown[i - 1], 'waits'), tone: 'default' });
        s.box('r' + i, PX, Y(i + 1), rowText(k, 'runs'), { w: 212, h: 34, size: 14, tone: 'active' });
        s.set('count', { text: i + 1 });
        const isBase = v.base(k);
        s.set('mark', { y: lineY(isBase ? 2 : v.callLine) });
        s.snap(isBase ? `n is ${k}, so the stop rule is True. This call returns 1.` : v.why(k), {
          vars: { n: k, 'calls on the pile': i + 1 },
        });
      });

      if (stops) {
        let value = 1;
        for (let i = shown.length - 1; i >= 0; i--) {
          const k = shown[i];
          value = i === shown.length - 1 ? 1 : k * value;
          s.del('r' + i);
          s.set('mark', { y: lineY(i === shown.length - 1 ? 2 : v.callLine) });
          s.set('count', { text: i });
          if (i > 0) s.set('r' + (i - 1), { text: rowText(shown[i - 1], 'runs'), tone: 'active' });
          s.snap(`factorial(${k}) returns ${value} and comes off the pile.`, {
            vars: { returned: value, 'calls on the pile': i },
            ask: i === shown.length - 1 && i > 0 ? {
              q: 'The top call has returned. Which call runs next?',
              options: ['The one just below it', 'Your main code', 'All of them at once'],
              answer: 0,
              why: 'The top of the pile always runs. The call below was waiting for this answer.',
            } : null,
          });
        }
        s.set('mark', { y: lineY(v.lines.length - 1) });
        s.text('result', 22, 240, `It prints ${value}.`, { size: 16, anchor: 'start', weight: 700, tone: 'ok' });
        s.snap(`Every call returned. It took ${many(shown.length, 'call')}, and the pile is empty again.`, { vars: { start, printed: value } });
        return;
      }

      s.set('r' + (shown.length - 1), { text: '... about 995 more calls', size: 14, tone: 'bad' });
      s.set('count', { text: 'about 1000', size: 14, tone: 'bad' });
      s.snap('The picture is full, but the pile keeps growing. No call has returned.', {
        vars: { 'calls on the pile': 'about 1000' },
        ask: {
          q: 'The pile is about 1000 calls tall. What does Python do?',
          options: ['It stops with a RecursionError', 'It keeps going until the computer breaks', 'It returns 0'],
          answer: 0,
          why: 'Python has a limit on the pile. At the limit it stops your program with a RecursionError.',
        },
      });

      s.text('err1', 22, 240, 'RecursionError: maximum', { size: 14, anchor: 'start', mono: true, weight: 700, tone: 'bad' });
      s.text('err2', 22, 262, 'recursion depth exceeded', { size: 14, anchor: 'start', mono: true, weight: 700, tone: 'bad' });
      shown.forEach((k, i) => s.tone('r' + i, 'bad'));
      s.snap('Python stops at its limit and shows a RecursionError.', { vars: { 'calls on the pile': 'about 1000' } });

      shown.forEach((k, i) => s.del('r' + i));
      s.set('count', { text: 0, size: 16, tone: 'default' });
      s.text('fix1', PX, 110, v.fix[0], { size: 15, weight: 700 });
      s.text('fix2', PX, 138, v.fix[1], { size: 14, mono: true, weight: 700 });
      s.snap('Python clears the pile. Nothing is broken, so you can fix the code and run again.', { vars: { 'calls on the pile': 0 } });
    },
  });

  /* ---------------------------------------------------------------- 16.3 */
  Viz.register('m16-sum-list', {
    title: 'Take one item off, and trust the smaller call',
    size: [560, 334],
    code: py`
      def total(items):
          if len(items) == 0:
              return 0
          rest = total(items[1:])
          return items[0] + rest

      print(total(nums))
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 5 numbers)', type: 'text', value: '4, 7, 2', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '5' }, { nums: '3, 3, 3' }, { nums: '1, 2, 3, 4, 5' }, { nums: '9, 8, 7, 6, 5, 4, 3' }, { nums: 'cat, 2' }, { nums: '-1, 0' }, { nums: '500, 2' }],
    build(s, p) {
      const nums = String(p.nums == null ? '' : p.nums).split(/[\s,]+/)
        .filter(t => /^-?\d+$/.test(t) && Math.abs(Number(t)) <= 99).map(Number).slice(0, 5);
      const Y = i => 292 - 42 * i;
      const NOTE = 314, TOKEN = 290;
      const CELL = d => 86 + 38 * d;
      let calls = 0, copied = 0;
      const chips = (more) => Object.assign({}, more, { calls, 'items copied': copied });

      s.text('floor', 138, 323, 'bottom of the pile', { size: 13, tone: 'muted' });
      s.box('frMain', 138, Y(0), '', { w: 248, h: 36, tone: 'warn' });
      s.text('nmMain', 22, Y(0), 'main code', { size: 14, anchor: 'start', weight: 700 });
      s.text('noteMain', 272, Y(0), 'runs now', { size: 14, anchor: 'start', weight: 700 });
      const count = mix(nums.length + 1, [nums.length, nums.length + 2], nums.length + 1);
      s.snap(`nums holds ${listText(nums)}. Items that are not numbers from -99 to 99 are left out.`, {
        line: 7,
        vars: chips({ nums: listText(nums) }),
        ask: {
          q: 'How many calls of total will run, if you count the one with the empty list?',
          options: count.options,
          answer: count.answer,
          why: `Each call takes one item off, and the last call has an empty list. So ${many(nums.length, 'item')} need ${many(nums.length + 1, 'call')}.`,
        },
      });

      const cleanTop = (d) => s.del('fr' + d, 'nm' + d, 'note' + d, ...nums.map((v, j) => `c${d}_${j}`), 'emp' + d);

      for (let d = 0; d <= nums.length; d++) {
        const y = Y(d + 1);
        const part = nums.slice(d);
        s.tone(d === 0 ? 'frMain' : 'fr' + (d - 1), 'default');
        s.set(d === 0 ? 'noteMain' : 'note' + (d - 1), { text: 'waits' });
        calls += 1;
        s.box('fr' + d, 138, y, '', { w: 248, h: 36, tone: 'warn' });
        s.text('nm' + d, 22, y, 'total', { size: 14, anchor: 'start', weight: 700 });
        s.text('note' + d, 272, y, 'runs now', { size: 14, anchor: 'start', weight: 700 });
        part.forEach((v, j) => s.box(`c${d}_${d + j}`, CELL(j), y, v, { w: 34, h: 26, size: 15 }));
        if (!part.length) s.text('emp' + d, 76, y, 'empty list', { size: 14, anchor: 'start', mono: true });

        if (part.length) {
          const k = part.length - 1;
          const m = mix(k, [k + 1, k + 2], d);
          s.snap(`total(${listText(part)}) goes on top. It has its own items.`, {
            line: 1,
            vars: chips({ items: listText(part) }),
            ask: d < 2 ? {
              q: `items[1:] makes a new list. How many items does it copy?`,
              options: m.options,
              answer: m.answer,
              why: `It copies all but the first item. This list has ${many(part.length, 'item')}, so the copy has ${k}.`,
            } : null,
          });
          copied += k;
          s.tone(`c${d}_${d}`, 'active');
          s.snap(`The list is not empty. Line 4 copies ${many(k, 'item')} and calls total on the copy.`, {
            line: 4,
            vars: chips({ items: listText(part), rest: '?' }),
          });
        } else {
          s.snap('total([]) goes on top. This list is empty.', {
            line: 2,
            vars: chips({ items: '[]' }),
            ask: {
              q: 'What should the total of an empty list be?',
              options: ['0', 'None', 'An IndexError'],
              answer: 0,
              why: 'Nothing adds up to 0. Line 3 returns 0 and never touches items[0], so nothing breaks.',
            },
          });
        }
      }

      let value = 0;
      const top = nums.length;
      s.circle('ret', TOKEN, Y(top + 1), 0, { r: 17, size: 14, tone: 'ok' });
      s.set('note' + top, { text: 'returns 0', x: NOTE });
      s.snap('The base case returns 0. Answers now travel back down.', { line: 3, vars: chips({ items: '[]' }) });

      for (let d = top - 1; d >= 0; d--) {
        const y = Y(d + 1);
        const first = nums[d];
        cleanTop(d + 1);
        s.tone('fr' + d, 'warn');
        s.set('note' + d, { text: `rest is ${value}`, x: NOTE });
        s.set('ret', { y });
        const answer = first + value;
        const wrong = [first, value === answer ? answer + 1 : value].map(String);
        const unique = [...new Set(wrong.filter(w => w !== String(answer)))];
        while (unique.length < 2) unique.push(String(answer + unique.length + 1));
        const m = mix(answer, unique, d + 1);
        s.snap(`The smaller call comes off the pile. Its answer, ${value}, lands in rest.`, {
          line: 4,
          vars: chips({ items: listText(nums.slice(d)), rest: value }),
          ask: {
            q: `The first item is ${first}, and rest is ${value}. What does this call return?`,
            options: m.options,
            answer: m.answer,
            why: `Line 5 returns items[0] + rest, and ${first} + ${value} is ${answer}.`,
          },
        });

        const before = value;
        value = answer;
        s.set('ret', { text: value, size: String(value).length > 3 ? 13 : 14 });
        s.set('note' + d, { text: `returns ${first} + ${before} = ${value}` });
        s.tone(`c${d}_${d}`, 'ok');
        s.snap(`It returns ${first} + ${before}, which is ${value}.`, {
          line: 5,
          vars: chips({ items: listText(nums.slice(d)), rest: before }),
        });
      }

      cleanTop(0);
      s.tone('frMain', 'warn');
      s.set('noteMain', { text: `prints ${value}`, x: NOTE });
      s.set('ret', { y: Y(0) });
      s.snap(`print shows ${value}. It took ${many(calls, 'call')} and copied ${many(copied, 'item')}.`, { line: 7, vars: chips({ nums: listText(nums) }), out: String(value) });
    },
  });

  Viz.register('m16-palindrome', {
    title: 'Check the two ends, then the middle',
    size: [560, 270],
    code: py`
      def same_both_ways(word):
          if len(word) <= 1:
              return True
          if word[0] != word[-1]:
              return False
          return same_both_ways(word[1:-1])

      print(same_both_ways(pick))
    `,
    inputs: [
      { key: 'word', label: 'word (up to 7 letters)', type: 'text', value: 'level', size: 10 },
    ],
    tryInputs: [{ word: '' }, { word: 'a' }, { word: 'ab' }, { word: 'aa' }, { word: 'noon' }, { word: 'hello' }, { word: 'Level' }, { word: 'abcdefghijk' }, { word: 'a b a' }],
    build(s, p) {
      const word = Array.from(String(p.word == null ? '' : p.word)).slice(0, 7);
      const Y = i => 226 - 46 * i;
      const X = 190, NOTE = 372, TOKEN = 394;
      const show = a => '"' + a.join('') + '"';
      let pairs = 0;

      s.text('floor', X, 258, 'bottom of the pile', { size: 13, tone: 'muted' });
      s.box('frMain', X, Y(0), 'main code', { w: 336, h: 38, size: 15, tone: 'warn' });
      s.text('noteMain', NOTE, Y(0), 'runs now', { size: 14, anchor: 'start', weight: 700 });
      s.snap(`The word is ${show(word)}. Main code asks if it reads the same both ways.`, { line: 8, vars: { pick: show(word), 'pairs checked': pairs } });

      const rows = [];
      let part = word, answer = null, depth = 0;
      while (answer === null) {
        const d = depth;
        const y = Y(d + 1);
        rows.push(part);
        s.tone(d === 0 ? 'frMain' : 'fr' + (d - 1), 'default');
        s.set(d === 0 ? 'noteMain' : 'note' + (d - 1), { text: 'waits' });
        s.box('fr' + d, X, y, '', { w: 336, h: 38, tone: 'warn' });
        s.text('note' + d, NOTE, y, 'runs now', { size: 14, anchor: 'start', weight: 700 });
        const left = X - (part.length * 44 - 4) / 2 + 20;
        part.forEach((ch, j) => s.box(`l${d}_${j}`, left + j * 44, y, ch, { w: 40, h: 30, size: 17 }));
        if (!part.length) s.text('emp' + d, X, y, 'empty word', { size: 14, mono: true });

        if (part.length <= 1) {
          s.snap(`This call has ${show(part)}. That is ${many(part.length, 'letter')}.`, {
            line: 2,
            vars: { word: show(part), 'pairs checked': pairs },
            ask: {
              q: `A word with ${part.length === 1 ? 'one letter' : 'no letters'}: does it read the same both ways?`,
              options: ['Yes, so it returns True', 'No, so it returns False'],
              answer: 0,
              why: 'There is no pair left that could differ. So this is the base case, and it returns True.',
            },
          });
          answer = true;
          s.circle('ret', TOKEN, y, 'True', { r: 22, size: 13, tone: 'ok' });
          s.set('note' + d, { text: 'returns', x: 424 });
          s.snap('The base case returns True. No more calls are needed.', { line: 3, vars: { word: show(part), 'pairs checked': pairs } });
          break;
        }

        const a = part[0], b = part[part.length - 1];
        const match = a === b;
        const opts = mix(match ? 'Call itself on the middle' : 'Return False now', [match ? 'Return False now' : 'Call itself on the middle', 'Return True now'], d);
        s.tone([`l${d}_0`, `l${d}_${part.length - 1}`], 'active');
        s.snap(`This call has ${show(part)}. Look at the first and last letters.`, {
          line: 4,
          vars: { word: show(part), 'pairs checked': pairs },
          ask: {
            q: `First is "${a}" and last is "${b}". What does this call do?`,
            options: opts.options,
            answer: opts.answer,
            why: match
              ? 'The ends match, but the middle might not. So the smaller call checks the middle.'
              : 'One pair that differs is enough. There is no need to look at the middle.',
          },
        });
        pairs += 1;
        s.tone([`l${d}_0`, `l${d}_${part.length - 1}`], match ? 'ok' : 'bad');
        if (!match) {
          answer = false;
          s.circle('ret', TOKEN, y, 'False', { r: 22, size: 13, tone: 'bad' });
          s.set('note' + d, { text: 'returns', x: 424 });
          s.snap(`"${a}" and "${b}" differ, so this call returns False right away.`, { line: 5, vars: { word: show(part), 'pairs checked': pairs } });
          break;
        }
        s.snap(`"${a}" and "${b}" match. Line 6 cuts them off and checks the middle.`, { line: 6, vars: { word: show(part), 'pairs checked': pairs } });
        part = part.slice(1, -1);
        depth += 1;
      }

      const word_ = String(answer ? 'True' : 'False');
      for (let d = depth; d >= 0; d--) {
        const gone = d;
        const y = Y(d);
        s.del('fr' + gone, 'note' + gone, 'emp' + gone, ...rows[gone].map((c, j) => `l${gone}_${j}`));
        s.set('ret', { y });
        if (d > 0) {
          s.tone('fr' + (d - 1), 'warn');
          s.set('note' + (d - 1), { text: 'hands it on', x: 424 });
          s.snap(`The top call comes off. Its ${word_} lands in the frame below.`, {
            line: 6,
            vars: { word: show(rows[d - 1]), 'pairs checked': pairs },
            ask: d === depth ? {
              q: `This call gets ${word_} back. What does it return?`,
              options: [`${word_}, the same answer`, `${answer ? 'False' : 'True'}, the opposite`, 'It checks the letters again'],
              answer: 0,
              why: 'Line 6 returns what the smaller call gave back. So the answer passes straight down.',
            } : null,
          });
        } else {
          s.tone('frMain', 'warn');
          s.set('noteMain', { text: `prints ${word_}`, x: 424 });
          s.snap(`print shows ${word_}. It checked ${many(pairs, 'pair')} of letters. Try another word.`, { line: 8, vars: { pick: show(word), 'pairs checked': pairs }, out: word_ });
        }
      }
    },
  });

  /* ---------------------------------------------------------------- 16.4 */
  const fibValue = n => (n <= 1 ? n : fibValue(n - 1) + fibValue(n - 2));
  const fibCalls = n => (n <= 1 ? 1 : 1 + fibCalls(n - 1) + fibCalls(n - 2));

  /* Draws one call of the tree: a circle for a first visit, a square for a repeat. */
  const drawCall = (s, node, pos, parent, square, tone) => {
    const at = pos[node.id];
    if (square) s.box(node.id, at.x, at.y, node.value, { w: 40, h: 40, tone });
    else s.circle(node.id, at.x, at.y, node.value, { r: 21, tone });
    if (parent) s.edge('e' + node.id, parent, node.id, { tone: 'default' });
  };
  const legend = s => {
    s.text('key1', 14, 18, 'Circle: a new question', { size: 13, anchor: 'start' });
    s.text('key2', 14, 38, 'Square: a repeat', { size: 13, anchor: 'start' });
  };

  Viz.register('m16-fib-tree', {
    title: 'Count the repeated calls',
    size: [560, 384],
    code: py`
      def fib(n):
          if n <= 1:
              return n
          return fib(n - 1) + fib(n - 2)

      print(fib(pick))
    `,
    inputs: [
      { key: 'pick', label: 'pick (0 to 5)', type: 'number', value: 4, min: 0, max: 5 },
    ],
    tryInputs: [{ pick: 0 }, { pick: 1 }, { pick: 2 }, { pick: 3 }, { pick: 5 }, { pick: '' }, { pick: 'x' }],
    build(s, p) {
      const pick = whole(p.pick, 0, 5, 4);
      let nextId = 0;
      const order = [];
      const grow = (n, parent) => {
        const node = { id: 'n' + nextId++, value: n, parent };
        order.push(node);
        if (n > 1) { node.left = grow(n - 1, node.id); node.right = grow(n - 2, node.id); }
        return node;
      };
      const root = grow(pick, null);
      const leaves = order.filter(x => x.value <= 1).length;
      const pos = Viz.Scene.layoutTree(root, { xGap: Math.min(84, 504 / Math.max(1, leaves - 1)), yGap: 60, y: 40, x: 280 });

      const seen = {}, tally = {};
      const TX = v => 280 + (v - (pick / 2)) * -90;
      for (let v = 0; v <= pick; v++) {
        tally[v] = 0;
        s.text('tl' + v, TX(v), 324, `fib(${v})`, { size: 13, mono: true });
        s.box('tv' + v, TX(v), 354, 0, { w: 44, h: 32, size: 16, tone: 'muted' });
      }
      legend(s);

      let asked3 = false, asked2 = false;
      order.forEach((node, i) => {
        const v = node.value;
        const repeat = !!seen[v];
        seen[v] = true;
        tally[v] += 1;
        if (i > 0) {
          const prev = order[i - 1];
          s.tone(prev.id, prev.wasRepeat ? 'warn' : 'default');
        }
        node.wasRepeat = repeat;
        drawCall(s, node, pos, node.parent, repeat, 'active');
        s.set('tv' + v, { text: tally[v], tone: 'default' });
        const tail = i === order.length - 1;
        const nextNode = order[i + 1];
        let ask = null;
        if (i === 0) {
          ask = v > 1 ? {
            q: `fib(${v}) is not a base case. Which call does line 4 start first?`,
            options: [`fib(${v - 1})`, `fib(${v - 2})`, 'Both at the same time'],
            answer: 0,
            why: `Python works left to right. It finishes fib(${v - 1}) before it starts fib(${v - 2}).`,
          } : {
            q: `n is ${v}. What does this call do?`,
            options: [`It returns ${v} right away`, 'It calls fib again'],
            answer: 0,
            why: 'n <= 1 is True, so this is the base case. It makes no more calls.',
          };
        } else if (nextNode && seen[nextNode.value] && nextNode.value >= 2 && !asked2) {
          asked2 = true;
          ask = {
            q: `Next comes fib(${nextNode.value}) again. Python worked it out before. What does it do?`,
            options: ['It uses the old answer', 'It works it all out again'],
            answer: 1,
            why: 'This code keeps no record of old answers. Each call starts from nothing.',
          };
        } else if (nextNode && seen[nextNode.value] && nextNode.value >= 3 && !asked3) {
          asked3 = true;
          const size = fibCalls(nextNode.value);
          const m = mix(size, [nextNode.value, size + 2], 1);
          ask = {
            q: `fib(${nextNode.value}) starts again. How many calls will it make, counting itself?`,
            options: m.options,
            answer: m.answer,
            why: `Last time fib(${nextNode.value}) took ${size} calls. This repeat takes the same ${size}.`,
          };
        } else if (tail) {
          const total = order.length;
          const m = mix(total, [pick + 1 === total ? total + 1 : pick + 1, total + 2], 2);
          ask = {
            q: `That was the last call. How many calls did fib(${pick}) make in all?`,
            options: m.options,
            answer: m.answer,
            why: 'Add up the row of numbers at the bottom. Each one counts the calls for that n.',
          };
        }
        let say;
        if (repeat) say = `fib(${v}) again. It is a repeat, and Python does the work again.`;
        else if (v <= 1) say = `fib(${v}) is a base case. It returns ${v} and makes no calls.`;
        else say = `fib(${v}) is new. It needs fib(${v - 1}) and fib(${v - 2}).`;
        s.snap(say, { line: v <= 1 ? 2 : 4, vars: { n: v, calls: i + 1 }, ask });
      });

      const last = order[order.length - 1];
      s.tone(last.id, last.wasRepeat ? 'warn' : 'default');
      const distinct = pick + 1;
      for (let v = 0; v <= pick; v++) s.tone('tv' + v, tally[v] > 1 ? 'warn' : 'default');
      s.snap(`fib(${pick}) made ${many(order.length, 'call')} for ${many(distinct, 'different question')}. The answer is ${fibValue(pick)}.`, {
        line: 6, vars: { calls: order.length, 'different questions': distinct }, out: String(fibValue(pick)),
      });
    },
  });

  Viz.register('m16-fib-memo', {
    title: 'Write it on a note, and look it up',
    size: [560, 384],
    code: py`
      notes = {}

      def fib(n):
          if n <= 1:
              return n
          if n in notes:
              return notes[n]
          answer = fib(n - 1) + fib(n - 2)
          notes[n] = answer
          return answer

      print(fib(pick))
    `,
    inputs: [
      { key: 'pick', label: 'pick (0 to 5)', type: 'number', value: 5, min: 0, max: 5 },
    ],
    tryInputs: [{ pick: 0 }, { pick: 1 }, { pick: 2 }, { pick: 3 }, { pick: 4 }, { pick: '' }, { pick: 'x' }],
    build(s, p) {
      const pick = whole(p.pick, 0, 5, 5);
      let nextId = 0;
      const events = [];
      const known = {};
      const grow = (n, parent) => {
        const node = { id: 'n' + nextId++, value: n, parent };
        if (n <= 1) { events.push({ kind: 'base', node }); return node; }
        if (n in known) { events.push({ kind: 'look', node }); return node; }
        events.push({ kind: 'work', node });
        node.left = grow(n - 1, node.id);
        node.right = grow(n - 2, node.id);
        known[n] = fibValue(n);
        events.push({ kind: 'write', node });
        return node;
      };
      const root = grow(pick, null);
      const nodes = events.filter(e => e.kind !== 'write').map(e => e.node);
      const leaves = nodes.filter(x => !x.left).length;
      const pos = Viz.Scene.layoutTree(root, { xGap: Math.min(84, 504 / Math.max(1, leaves - 1)), yGap: 60, y: 40, x: 280 });

      s.text('key1', 14, 18, 'Circle: a call', { size: 13, anchor: 'start' });
      s.text('key2', 14, 38, 'Square: read a note', { size: 13, anchor: 'start' });
      const keys = [];
      for (let v = 2; v <= pick; v++) keys.push(v);
      const NX = i => 280 + (i - (keys.length - 1) / 2) * 120;
      s.text('noteHead', 280, 318, keys.length ? 'The notes dict' : 'No notes needed for a base case.', { size: 14, weight: 700 });
      keys.forEach((v, i) => {
        s.box('note' + v, NX(i), 354, `${v}: ?`, { w: 104, h: 34, size: 15, tone: 'muted' });
      });

      const notes = {};
      const noteText = () => '{' + Object.keys(notes).map(k => `${k}: ${notes[k]}`).join(', ') + '}';
      let calls = 0, prev = null, asked = false;
      const settle = () => { if (prev) s.tone(prev.id, prev.square ? 'ok' : 'default'); };
      events.forEach((e, i) => {
        const v = e.node.value;
        const nextEv = events[i + 1];
        settle();
        let ask = null;
        if (nextEv && nextEv.kind === 'look' && !asked) {
          asked = true;
          ask = {
            q: `Next comes fib(${nextEv.node.value}) again. Notes hold it now. What does the call do?`,
            options: ['It reads the note and returns', 'It works it all out again'],
            answer: 0,
            why: 'Line 6 finds the key in notes. Line 7 returns the saved answer, so no more calls happen.',
          };
        }
        if (e.kind === 'write') {
          notes[v] = fibValue(v);
          s.set('note' + v, { text: `${v}: ${notes[v]}`, tone: 'ok' });
          s.tone(e.node.id, 'active');
          prev = e.node;
          s.snap(`fib(${v}) is ${notes[v]}. Line 9 writes it in the notes before it returns.`, { line: 9, vars: { n: v, notes: noteText(), calls }, ask });
          return;
        }
        calls += 1;
        e.node.square = e.kind === 'look';
        drawCall(s, e.node, pos, e.node.parent, e.kind === 'look', 'active');
        prev = e.node;
        if (i === 0 && !ask) {
          ask = v > 1 ? {
            q: 'The notes dict is empty. Can this call use a note?',
            options: ['No, it must work out the answer', 'Yes, it reads the note'],
            answer: 0,
            why: `The key ${v} is not in notes yet. So it calls fib(${v - 1}) and fib(${v - 2}).`,
          } : {
            q: `n is ${v}. Does this call need the notes?`,
            options: ['No, it is a base case', 'Yes, it reads a note'],
            answer: 0,
            why: 'Line 4 is True, so line 5 returns n. The notes are never touched.',
          };
        }
        if (e.kind === 'base') s.snap(`fib(${v}) is a base case. It returns ${v}.`, { line: 5, vars: { n: v, notes: noteText(), calls }, ask });
        else if (e.kind === 'work') s.snap(`fib(${v}) is not in the notes, so it must work it out.`, { line: 8, vars: { n: v, notes: noteText(), calls }, ask });
        else {
          s.pulse('note' + v);
          s.snap(`fib(${v}) is in the notes. Line 7 hands back ${notes[v]} with no more calls.`, { line: 7, vars: { n: v, notes: noteText(), calls }, ask });
        }
      });

      settle();
      const m = mix(calls, [fibCalls(pick) + 2, fibCalls(pick)], 1);
      const sameCount = calls === fibCalls(pick);
      s.snap('Every call has finished. Count the shapes in the picture.', {
        line: 12,
        vars: { notes: noteText(), calls },
        ask: {
          q: `How many calls did fib(${pick}) make with notes?`,
          options: sameCount ? [String(calls), String(calls + 2), String(calls + 4)] : m.options,
          answer: sameCount ? 0 : m.answer,
          why: `There are ${many(calls, 'shape')}. Without notes, it would take ${many(fibCalls(pick), 'call')}.`,
        },
      });
      s.snap(`With notes: ${many(calls, 'call')}. Without notes: ${many(fibCalls(pick), 'call')}. The answer is ${fibValue(pick)} both ways.`, {
        line: 12, vars: { notes: noteText(), calls }, out: String(fibValue(pick)),
      });
    },
  });
})();
