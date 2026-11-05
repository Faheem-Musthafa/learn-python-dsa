/* Visuals for module 11. Names start with the module id.
   Everything uses our own teaching recipe: add the letter codes, then % the buckets.
   So every picture gives the same answer on every run. */
(function () {
  const sumCodes = key => [...key].reduce((t, ch) => t + ch.codePointAt(0), 0);
  const bucketFor = (key, size) => sumCodes(key) % size;
  const cleanKey = (w, max = 6) => [...String(w == null ? '' : w).trim()].slice(0, max).join('');
  const keyList = (text, most) => String(text == null ? '' : text).split(/[\s,]+/).filter(Boolean).slice(0, most).map(w => cleanKey(w));
  const quoted = k => `"${k}"`;
  const whole = (v, lo, hi, dflt) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
  };
  const looksWord = n => (n === 1 ? '1 look' : `${n} looks`);
  const stepsWord = n => (n === 1 ? '1 step' : `${n} steps`);
  const keysWord = n => (n === 1 ? '1 key' : `${n} keys`);

  /* A guess with number choices. It always holds the right answer and never repeats a choice. */
  function numAsk(q, right, others, why, floor = 0) {
    const picks = [];
    for (const v of [right, ...others, right + 1, right + 2, right + 3]) {
      if (v >= floor && !picks.includes(v) && picks.length < 3) picks.push(v);
    }
    picks.sort((a, b) => a - b);
    return { q, options: picks.map(String), answer: picks.indexOf(right), why };
  }

  /* Bucket rows, one under another. Used by the chain, probe and HashMap pictures. */
  function rows(s, size, o = {}) {
    const top = o.top == null ? 88 : o.top;
    const room = o.room || 212;
    const gap = Math.min(50, room / Math.max(size, 1));
    const y = i => top + i * gap;
    const h = Math.min(36, gap - 5);
    for (let i = 0; i < size; i++) s.box(`b${i}`, 46, y(i), i, { w: 44, h, tone: 'muted', size: 17 });
    return { y, h };
  }

  // ------------------------------------------------------------ 11.1: the recipe
  Viz.register('m11-hash-function', {
    title: 'A recipe turns a key into a bucket number',
    size: [560, 310],
    code: py`
      def bucket_for(key, buckets):
          total = 0
          for ch in key:
              total = total + ord(ch)
          return total % buckets
    `,
    inputs: [
      { key: 'key', label: 'Key (up to 6 letters)', type: 'text', value: 'cat', size: 8 },
      { key: 'buckets', label: 'Buckets', type: 'number', value: 5, min: 1, max: 8 },
    ],
    tryInputs: [{ key: '' }, { key: 'a' }, { key: 'act' }, { key: 'aaaaaa' }, { key: 'longerword', buckets: 8 }, { key: 'cat', buckets: 1 }, { key: '  Hi 5 ' }, { key: 'cat', buckets: '' }],
    build(s, p) {
      const key = cleanKey(p.key), size = whole(p.buckets, 1, 8, 5);
      const letters = [...key], label = quoted(key);
      const total = sumCodes(key), right = total % size;
      const vars = t => ({ key: label, buckets: size, total: t });

      if (letters.length) {
        s.row('L', letters, { cell: 52, gap: 14, x: 280, y: 42, index: false });
        letters.forEach((ch, i) => s.text(`c${i}`, s.get(`L${i}`).x, 86, '', { size: 15, mono: true }));
      } else {
        s.text('none', 280, 42, 'This key has no letters', { size: 15, tone: 'muted' });
      }
      s.box('tl', 166, 130, 'total', { w: 76, h: 36, size: 15 });
      s.box('total', 290, 130, 0, { w: 100, h: 44 });
      s.edge('tlE', 'tl', 'total');
      s.text('calc', 280, 176, '', { size: 16, mono: true, weight: 700 });
      s.row('B', Array(size).fill(''), { cell: 52, gap: 6, x: 280, y: 250, box: { tone: 'muted' } });

      const numbered = size === 1 ? 'There is 1 bucket, number 0.' : `The buckets have numbers 0 to ${size - 1}.`;
      let startAsk = null;
      if (letters.length === 1) {
        const code = letters[0].codePointAt(0);
        startAsk = numAsk(`ord(${quoted(letters[0])}) is ${code}. What is total after the next line?`, code, [0, code + 1],
          `total starts at 0, and 0 + ${code} is ${code}.`);
      } else if (!letters.length) {
        startAsk = numAsk('This key has no letters. How many trips does the loop make?', 0, [1, 2],
          'With no letters, the loop has nothing to visit.');
      }
      s.snap(`total starts at 0. ${numbered}`, { line: 2, vars: vars(0), ask: startAsk });

      let t = 0;
      letters.forEach((ch, i) => {
        const code = ch.codePointAt(0);
        t += code;
        if (i) s.tone(`L${i - 1}`, 'default');
        s.tone(`L${i}`, 'active');
        s.set(`c${i}`, { text: code });
        s.set('total', { text: t });
        s.pulse('total');
        let ask = null;
        if (i === letters.length - 2) {
          const nextCode = [...key][i + 1].codePointAt(0), next = t + nextCode;
          ask = numAsk(`total is ${t}. ord(${quoted(letters[i + 1])}) is ${nextCode}. What is total next?`, next, [nextCode, t + nextCode + 10],
            `The loop adds each code to total. ${t} + ${nextCode} is ${next}.`);
        }
        s.snap(`ch is ${quoted(ch)}. ord gives ${code}, so total is now ${t}.`, { line: 4, vars: Object.assign(vars(t), { ch: quoted(ch) }), ask });
      });

      if (letters.length) s.tone(`L${letters.length - 1}`, 'default');
      s.set('calc', { text: `${total} % ${size}` });
      const times = Math.floor(total / size);
      s.snap('The loop is done. The last line fits total to the buckets.', {
        line: 5,
        vars: vars(total),
        ask: numAsk(`What is ${total} % ${size}?`, right, [total, times], `${size} goes into ${total} ${times} times, with ${right} left over. % gives what is left.`),
      });

      s.set('calc', { text: `${total} % ${size} = ${right}` });
      s.tone(`B${right}`, 'ok');
      s.pointer('ptr', s.get(`B${right}`).x, 222, 'goes here', { dir: 'down' });
      s.snap(`The answer is ${right}. The key ${label} goes in bucket ${right}.`, {
        line: 5,
        vars: vars(total),
        ask: {
          q: `You run the recipe on ${label} again. Which bucket do you get?`,
          options: ['A new bucket each time', 'It depends on the time', `Bucket ${right} again`],
          answer: 2,
          why: 'The recipe has no luck in it. The same key always adds up to the same total.',
        },
      });
      s.snap('Same key, same bucket. So Python can find this key again.', { line: 5, vars: vars(total) });
    },
  });

  // ----------------------------------------------------- 11.1: share the bucket
  Viz.register('m11-chain', {
    title: 'Way 1: 2 keys share a bucket',
    size: [560, 310],
    code: py`
      buckets = [[] for i in range(size)]
      for key in keys:
          b = bucket_for(key, size)
          if key not in buckets[b]:
              buckets[b].append(key)
      b = bucket_for(find, size)
      print(find in buckets[b])
    `,
    inputs: [
      { key: 'keys', label: 'Keys (up to 5)', type: 'text', value: 'cat dog act owl', size: 16 },
      { key: 'buckets', label: 'Buckets', type: 'number', value: 5, min: 1, max: 6 },
      { key: 'find', label: 'Find', type: 'text', value: 'act', size: 7 },
    ],
    tryInputs: [{ keys: '' }, { keys: 'cat' }, { keys: 'cat cat cat' }, { keys: 'cat act tac', buckets: 1 }, { keys: 'a b c d e f g', buckets: 6, find: 'z' }, { find: '' }, { keys: 'cat, dog', find: 'cat', buckets: '' }],
    build(s, p) {
      const size = whole(p.buckets, 1, 6, 5), keys = keyList(p.keys, 5), find = cleanKey(p.find);
      const buckets = Array.from({ length: size }, () => []);
      const { y, h } = rows(s, size);
      const x = j => 122 + j * 72;
      const box = { w: 64, h, size: 15 };
      s.text('st', 92, 30, '', { anchor: 'start', size: 15, mono: true });
      s.snap(keys.length ? 'Each bucket starts as an empty list.' : 'You gave no keys, so every bucket stays empty.', { line: 1, vars: { size } });

      let warned = false;
      keys.forEach((key, n) => {
        const total = sumCodes(key), b = total % size, there = buckets[b], id = `c${n}`;
        const vars = { size, key: quoted(key) };
        s.clearTones();
        for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
        s.box(id, 46, 30, key, Object.assign({}, box, { h: 36, tone: 'active' }));
        if (n === 1) {
          s.set('st', { text: `${quoted(key)} adds to ${total}.` });
          s.snap(`The recipe adds up the codes of ${quoted(key)}.`, {
            line: 3, vars,
            ask: numAsk(`What is ${total} % ${size}? That is the bucket.`, b, [Math.floor(total / size)],
              `${size} goes into ${total} with ${b} left over. So it goes to bucket ${b}.`),
          });
        }
        s.set('st', { text: `${quoted(key)} adds to ${total}. ${total} % ${size} = ${b}` });
        s.tone(`b${b}`, 'active');
        vars.b = b;
        let ask = null;
        if (there.includes(key)) {
          ask = {
            q: `Bucket ${b} already holds ${quoted(key)}. What should happen?`,
            options: ['Add it a second time', 'Keep one copy and add nothing', 'Stop with an error'],
            answer: 1,
            why: 'A key can be in the table only once. The line with `not in` checks that.',
          };
        } else if (there.length && !warned) {
          warned = true;
          ask = {
            q: `Bucket ${b} already holds ${quoted(there[0])}. What happens to ${quoted(key)}?`,
            options: ['Python stops with an error', `${quoted(key)} joins the same bucket`, `${quoted(key)} throws out ${quoted(there[0])}`],
            answer: 1,
            why: 'This is a collision. It is normal. Both keys stay, side by side in one bucket.',
          };
        }
        const seenSay = there.includes(key) ? `Bucket ${b} already holds this key.` : there.length ? `Bucket ${b} is not empty. This is a collision.` : `Bucket ${b} is empty.`;
        s.snap(seenSay, { line: 3, vars, ask });

        if (there.includes(key)) {
          s.del(id);
          s.snap(`${quoted(key)} is already here, so nothing changes.`, { line: 4, vars });
        } else {
          const shared = there.length > 0;
          s.set(id, { x: x(there.length), y: y(b), h, tone: 'ok' });
          there.push(key);
          s.snap(shared ? `${quoted(key)} joins bucket ${b}. Nothing is lost, and nothing breaks.` : `${quoted(key)} goes in bucket ${b}.`, { line: 5, vars });
        }
      });

      // Now look one up.
      const b = bucketFor(find, size), there = buckets[b];
      const vars = looks => ({ size, find: quoted(find), b, looks });
      s.clearTones();
      for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
      s.tone(`b${b}`, 'active');
      s.box('F', 46, 30, find === '' ? '""' : find, Object.assign({}, box, { h: 36, tone: 'accent' }));
      s.set('st', { text: `${quoted(find)} adds to ${sumCodes(find)}. ${sumCodes(find)} % ${size} = ${b}` });
      s.snap(`Now find ${quoted(find)}. The recipe sends you straight to bucket ${b}.`, {
        line: 6,
        vars: vars(0),
        ask: numAsk(`Bucket ${b} holds ${keysWord(there.length)}. At most how many looks will you need?`, there.length, [keys.length, size],
          'You skip every other bucket. Then you check only the keys in this one.'),
      });

      let looks = 0, found = false;
      for (let j = 0; j < there.length; j++) {
        looks += 1;
        const id = `c${keys.indexOf(there[j])}`;
        if (there[j] === find) {
          found = true;
          s.tone(id, 'ok');
          s.pulse(id);
          s.snap(`Look ${looks}: this one is ${quoted(find)}. Found it.`, { line: 7, vars: vars(looks), out: 'True' });
          break;
        }
        s.tone(id, 'active');
        s.snap(`Look ${looks}: ${quoted(there[j])} is not ${quoted(find)}. Keep going.`, { line: 7, vars: vars(looks) });
      }
      if (!found) {
        s.snap(there.length ? `No keys are left in bucket ${b}. So ${quoted(find)} is not here.` : `Bucket ${b} is empty. So ${quoted(find)} is not here, after 0 looks.`, { line: 7, vars: vars(looks), out: 'False' });
      }
    },
  });

  // ---------------------------------------------------- 11.1: try the next bucket
  Viz.register('m11-probe', {
    title: 'Way 2: try the next bucket',
    size: [560, 310],
    code: py`
      slots = [None] * size
      for key in keys:
          b = bucket_for(key, size)
          while slots[b] not in (None, key):
              b = (b + 1) % size
          slots[b] = key
      b = bucket_for(find, size)
      while slots[b] not in (None, find):
          b = (b + 1) % size
      print(slots[b] == find)
    `,
    inputs: [
      { key: 'keys', label: 'Keys (up to 5)', type: 'text', value: 'cat dog act owl', size: 16 },
      { key: 'buckets', label: 'Buckets', type: 'number', value: 5, min: 1, max: 6 },
      { key: 'find', label: 'Find', type: 'text', value: 'emu', size: 7 },
    ],
    tryInputs: [{ keys: '' }, { keys: 'cat' }, { keys: 'cat cat cat' }, { keys: 'cat act tac', buckets: 1 }, { keys: 'a b c d e', buckets: 2, find: 'z' }, { keys: 'a b c d e', buckets: 6, find: 'e' }, { find: '' }, { find: 'cat' }, { keys: 'cat dog', buckets: '' }],
    build(s, p) {
      const size = whole(p.buckets, 1, 6, 5), keys = keyList(p.keys, 5), find = cleanKey(p.find);
      const slots = Array(size).fill(null), ids = Array(size).fill(null);
      const { y, h } = rows(s, size);
      const box = { w: 64, h, size: 15 };
      s.text('st', 92, 30, '', { anchor: 'start', size: 15, mono: true });
      s.snap(keys.length ? 'Now each bucket holds one key. All of them start empty.' : 'You gave no keys, so every bucket stays empty.', { line: 1, vars: { size } });

      let askedNext = false, askedWrap = false;
      const reset = () => {
        for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
        ids.forEach(id => { if (id) s.tone(id, 'default'); });
      };

      keys.forEach((key, n) => {
        const total = sumCodes(key);
        let b = total % size, tries = 0;
        const id = `c${n}`;
        reset();
        s.tone(`b${b}`, 'active');
        s.box(id, 46, 30, key, Object.assign({}, box, { h: 36, tone: 'active' }));
        s.set('st', { text: `${quoted(key)} adds to ${total}. ${total} % ${size} = ${b}` });
        s.snap(`The recipe says bucket ${b} for ${quoted(key)}.`, { line: 3, vars: { size, key: quoted(key), b } });

        while (slots[b] !== null && slots[b] !== key && tries < size) {
          const next = (b + 1) % size;
          s.set(id, { x: 200, y: y(b), h });
          s.tone(ids[b], 'warn');
          s.tone(`b${b}`, 'active');
          let ask = null;
          if (size > 1 && next === 0 && !askedWrap) {
            askedWrap = true;
            ask = {
              q: `Bucket ${b} is the last one, and it is taken. Where next?`,
              options: [`Bucket ${b + 1}, a new one`, 'Bucket 0, back at the top', 'Python stops with an error'],
              answer: 1,
              why: `% wraps around. (${b} + 1) % ${size} is 0.`,
            };
          } else if (size > 1 && !askedNext) {
            askedNext = true;
            ask = {
              q: `Bucket ${b} holds ${quoted(slots[b])}. Where does ${quoted(key)} go now?`,
              options: [`Throw out ${quoted(slots[b])}`, 'Python stops with an error', `Try bucket ${next}`],
              answer: 2,
              why: 'This is a collision, and it is normal. The key walks on to the next bucket.',
            };
          }
          s.snap(`Bucket ${b} holds ${quoted(slots[b])}, so this spot is taken.`, { line: 4, vars: { size, key: quoted(key), b }, ask });
          s.tone(ids[b], 'default');
          s.tone(`b${b}`, 'muted');
          b = next;
          tries += 1;
          if (tries < size) {
            s.tone(`b${b}`, 'active');
            s.set(id, { x: 200, y: y(b), h });
            s.snap(`Move on to bucket ${b}.`, { line: 5, vars: { size, key: quoted(key), b } });
          }
        }
        if (tries >= size) {
          s.set(id, { tone: 'bad', x: 46, y: 30 });
          s.snap(`Every bucket is taken. A real table grows long before this happens.`, { line: 4, vars: { size, key: quoted(key) } });
          s.del(id);
          return;
        }
        if (slots[b] === key) {
          s.del(id);
          s.snap(`${quoted(key)} is already in bucket ${b}, so nothing changes.`, { line: 6, vars: { size, key: quoted(key), b } });
          return;
        }
        slots[b] = key;
        ids[b] = id;
        s.set(id, { x: 122, y: y(b), h, tone: 'ok' });
        s.snap(`Bucket ${b} is free. ${quoted(key)} stays there.`, { line: 6, vars: { size, key: quoted(key), b } });
      });

      // Now look one up, walking the same path.
      let b = bucketFor(find, size), looks = 0;
      const vars = () => ({ size, find: quoted(find), b, looks });
      reset();
      s.box('F', 46, 30, find === '' ? '""' : find, Object.assign({}, box, { h: 36, tone: 'accent' }));
      s.set('st', { text: `${quoted(find)} adds to ${sumCodes(find)}. ${sumCodes(find)} % ${size} = ${b}` });
      s.tone(`b${b}`, 'active');
      s.snap(`Now find ${quoted(find)}. Start at bucket ${b}, and walk the same path.`, { line: 7, vars: vars() });
      s.set('F', { x: 200, y: y(b), h });
      let result = null;
      let askedEmpty = false;
      while (looks < size) {
        if (slots[b] === null) {
          const emptyAsk = !askedEmpty ? {
            q: `Bucket ${b} is empty. What does that tell you?`,
            options: ['Keep walking, it may be further on', 'Python stops with an error', `${quoted(find)} is not in the table`],
            answer: 2,
            why: 'If the key were here, it would have stopped at this empty bucket when it went in.',
          } : null;
          askedEmpty = true;
          s.set('F', { x: 200, y: y(b) });
          s.snap(`Bucket ${b} is empty.`, { line: 8, vars: vars(), ask: emptyAsk });
          s.snap(`So ${quoted(find)} is not here. That took ${looksWord(looks)}.`, { line: 10, vars: vars(), out: 'False' });
          result = false;
          break;
        }
        looks += 1;
        s.set('F', { x: 200, y: y(b) });
        if (slots[b] === find) {
          s.tone(ids[b], 'ok');
          s.pulse(ids[b]);
          s.snap(`Look ${looks}: bucket ${b} holds ${quoted(find)}. Found it.`, { line: 10, vars: vars(), out: 'True' });
          result = true;
          break;
        }
        s.tone(ids[b], 'active');
        const stopAsk = looks === 1 && size > 1 ? {
          q: `Bucket ${b} holds ${quoted(slots[b])}, not ${quoted(find)}. Can you stop now?`,
          options: [`Yes. ${quoted(find)} is not in the table`, `No. ${quoted(find)} may have walked on`],
          answer: 1,
          why: 'A key that found its bucket taken walked on. So you must walk on too.',
        } : null;
        s.snap(`Look ${looks}: bucket ${b} holds ${quoted(slots[b])}, not ${quoted(find)}.`, { line: 8, vars: vars(), ask: stopAsk });
        s.tone(ids[b], 'default');
        s.tone(`b${b}`, 'muted');
        b = (b + 1) % size;
        s.tone(`b${b}`, 'active');
      }
      if (result === null) {
        s.snap(`You checked every bucket. ${quoted(find)} is not here.`, { line: 10, vars: vars(), out: 'False' });
      }
    },
  });

  // ---------------------------------------------------- 11.2: good and bad recipes
  Viz.register('m11-good-bad', {
    title: 'Same keys, good recipe, bad recipe',
    size: [560, 310],
    code: py`
      def good(key, size):
          return bucket_for(key, size)

      def bad(key, size):
          return 0
    `,
    inputs: [
      { key: 'keys', label: 'Keys (up to 6)', type: 'text', value: 'cat dog pig fox hen owl', size: 20 },
      { key: 'buckets', label: 'Buckets', type: 'number', value: 4, min: 1, max: 5 },
    ],
    tryInputs: [{ keys: '' }, { keys: 'cat' }, { keys: 'cat cat cat' }, { keys: 'cat act tac' }, { keys: 'a b c d e f g h' }, { buckets: 1 }, { buckets: 5 }, { buckets: '' }],
    build(s, p) {
      const size = whole(p.buckets, 1, 5, 4);
      const keys = [...new Set(keyList(p.keys, 6))], n = keys.length;
      const top = 106;
      const { y, h } = rows(s, size, { top, room: 164 });
      const x = j => 122 + j * 72;
      const box = { w: 64, h, size: 15 };
      const heads = new Set();
      const head = j => {
        if (heads.has(j)) return;
        heads.add(j);
        s.text(`hd${j}`, x(j), 76, looksWord(j + 1), { size: 13, tone: 'muted' });
      };
      const summary = (counts) => {
        const total = counts.reduce((a, c) => a + (c * (c + 1)) / 2, 0);
        const worst = Math.max(0, ...counts);
        return { total, worst, avg: n ? (total / n).toFixed(1) : '0' };
      };
      s.text('st', 280, 30, 'good recipe: add the codes', { size: 16, weight: 700 });
      s.text('sum', 280, 290, '', { size: 15, mono: true, weight: 700 });
      s.snap(n ? 'A key at the start of a bucket takes 1 look. The next takes 2.' : 'You gave no keys, so there is nothing to look for.', { line: 2, vars: { size } });

      const counts = Array(size).fill(0);
      keys.forEach((key, i) => {
        const b = bucketFor(key, size), j = counts[b];
        if (i) s.tone(`c${i - 1}`, 'default');
        head(j);
        s.box(`c${i}`, x(j), y(b), key, Object.assign({}, box, { tone: 'active' }));
        counts[b] += 1;
        s.snap(`${quoted(key)} goes to bucket ${b}. Finding it will take ${looksWord(j + 1)}.`, { line: 2, vars: { size, key: quoted(key), b } });
      });
      if (!n) return;

      const good = summary(counts);
      s.tone(`c${n - 1}`, 'default');
      s.snap('All the keys are in. Now look at the longest bucket.', {
        line: 2,
        ask: numAsk('What is the most looks any one key needs here?', good.worst, [n, 1], 'The worst key sits at the end of the longest bucket.'),
      });
      s.set('sum', { text: `worst ${good.worst}, total ${good.total}, average ${good.avg}` });
      s.snap(`Add all the looks: ${good.total}. Share them over ${keysWord(n)}. That is about ${good.avg} looks each.`, { line: 2 });

      s.set('st', { text: 'bad recipe: always bucket 0' });
      s.set('sum', { text: '' });
      s.snap('Now try a bad recipe. It gives bucket 0 for every key.', {
        line: 5,
        ask: numAsk(`All ${keysWord(n)} land in bucket 0. How many looks does the last key need?`, n, [good.worst, 1], 'Every key is in one bucket, so you may check all of them.'),
      });
      keys.forEach((key, i) => {
        head(i);
        s.set(`c${i}`, { x: x(i), y: y(0), tone: i === n - 1 ? 'bad' : 'warn' });
      });
      s.snap(`Every key is in bucket 0. The last one takes ${looksWord(n)}.`, { line: 5, vars: { size } });

      const badAll = summary([n]);
      s.set('sum', { text: `worst ${badAll.worst}, total ${badAll.total}, average ${badAll.avg}` });
      s.snap(`Now the average is ${badAll.avg} looks. A list would do as well as this.`, { line: 5 });
    },
  });

  // --------------------------------------------------------- 11.2: the table grows
  Viz.register('m11-grow', {
    title: 'A full table grows',
    size: [560, 320],
    code: py`
      for key in keys:
          if count == size:
              size = size * 2
              # Put every key in again.
          b = bucket_for(key, size)
          buckets[b].append(key)
          count = count + 1
    `,
    inputs: [{ key: 'keys', label: 'Keys (up to 5)', type: 'text', value: 'cat dog pig fox', size: 18 }],
    tryInputs: [{ keys: '' }, { keys: 'cat' }, { keys: 'cat cat cat' }, { keys: 'a b c d e f g' }, { keys: 'cat act tac god dog' }],
    build(s, p) {
      const keys = [...new Set(keyList(p.keys, 5))];
      let size = 2;
      let table = Array.from({ length: size }, () => []);
      const cell = { cell: 60, gap: 6 };
      const X = i => s.slotX(i, size, Object.assign({ x: 280 }, cell));
      const rowY = j => 130 + j * 38;
      const drawBuckets = () => {
        for (let i = 0; i < 8; i++) if (s.has(`b${i}`)) s.del(`b${i}`);
        for (let i = 0; i < size; i++) s.box(`b${i}`, X(i), 88, i, { w: 60, h: 40, tone: 'muted', size: 17 });
      };
      drawBuckets();
      s.text('st', 92, 34, '', { anchor: 'start', size: 15, mono: true });
      s.snap(keys.length ? 'Our table starts with 2 buckets.' : 'You gave no keys, so the table stays at 2 buckets.', { line: 1, vars: { size, count: 0 } });

      let count = 0;
      keys.forEach((key, n) => {
        const id = `c${n}`;
        const total = sumCodes(key);
        s.clearTones();
        for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
        s.box(id, 46, 34, key, { w: 62, h: 36, size: 14, tone: 'active' });
        s.set('st', { text: `${quoted(key)} adds to ${total}.` });

        if (count === size) {
          s.snap(`${keysWord(count)} and ${size} buckets. The table is full.`, {
            line: 2,
            vars: { size, count },
            ask: {
              q: 'Our rule is about a full table. What happens now?',
              options: ['An old key gets thrown out', 'The table gets more buckets', 'Python stops with an error'],
              answer: 1,
              why: 'The table doubles. Then the buckets stay short.',
            },
          });
          size *= 2;
          drawBuckets();
          for (let i = 0; i < size; i++) s.tone(`b${i}`, 'active');
          const old = table.flat();
          table = Array.from({ length: size }, () => []);
          // Keys glide to the new home one at a time, so wait until each frame to place them.
          s.snap(`Now there are ${size} buckets. Each old key must go in again.`, { line: 3, vars: { size, count } });
          for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
          old.forEach((k, idx) => {
            const oldId = `c${keys.indexOf(k)}`;
            const t = sumCodes(k), b = t % size, j = table[b].length;
            let ask = null;
            if (idx === 0) {
              ask = numAsk(`${quoted(k)} adds to ${t}. What is ${t} % ${size} now?`, b, [t % (size / 2)],
                `The recipe uses the new size. ${t} % ${size} is ${b}.`);
              s.tone(oldId, 'active');
              s.snap('The recipe uses the new size, so a bucket can change.', { line: 4, vars: { size, count }, ask });
            }
            table[b].push(k);
            s.set(oldId, { x: X(b), y: rowY(j), tone: 'ok' });
            s.snap(`${quoted(k)} adds to ${t}. ${t} % ${size} = ${b}. It goes to bucket ${b}.`, { line: 4, vars: { size, count } });
            s.tone(oldId, 'default');
          });
          s.set('st', { text: `${quoted(key)} adds to ${total}.` });
        }

        const b = total % size, j = table[b].length;
        s.tone(`b${b}`, 'active');
        s.set('st', { text: `${quoted(key)} adds to ${total}. ${total} % ${size} = ${b}` });
        s.snap(`The recipe says bucket ${b} for ${quoted(key)}.`, { line: 5, vars: { size, count, b } });
        table[b].push(key);
        count += 1;
        s.set(id, { x: X(b), y: rowY(j), tone: 'ok' });
        s.snap(`${quoted(key)} goes in. The table now holds ${keysWord(count)}.`, { line: 6, vars: { size, count } });
      });
      if (keys.length) {
        s.clearTones();
        for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
        const longest = Math.max(...table.map(t => t.length));
        const sameTotal = keys.length > 1 && new Set(keys.map(sumCodes)).size === 1;
        s.snap(sameTotal
          ? 'These keys all add to the same total. No size can split them. That takes a better recipe.'
          : `The longest bucket holds ${keysWord(longest)}. Growing keeps the buckets short.`, { line: 7, vars: { size, count } });
      }
    },
  });

  // ----------------------------------------------------- 11.4: a tiny HashMap class
  Viz.register('m11-hashmap', {
    title: 'Inside put and get',
    size: [560, 310],
    code: py`
      class HashMap:
          def __init__(self, size):
              self.buckets = [[] for i in range(size)]

          def put(self, key, value):
              b = bucket_for(key, len(self.buckets))
              for pair in self.buckets[b]:
                  if pair[0] == key:
                      pair[1] = value
                      return
              self.buckets[b].append([key, value])

          def get(self, key):
              b = bucket_for(key, len(self.buckets))
              for pair in self.buckets[b]:
                  if pair[0] == key:
                      return pair[1]
              return None
    `,
    inputs: [
      { key: 'key', label: 'Your key', type: 'text', value: 'act', size: 7 },
      { key: 'value', label: 'Your value', type: 'number', value: 7, min: 0, max: 99 },
      { key: 'size', label: 'Buckets', type: 'number', value: 5, min: 1, max: 6 },
    ],
    tryInputs: [{ key: '' }, { key: 'cat' }, { key: 'dog', value: 0 }, { key: 'emu' }, { size: 1 }, { key: 'abcdefgh', size: 6 }, { value: '', size: '' }],
    build(s, p) {
      const size = whole(p.size, 1, 6, 5), mine = cleanKey(p.key), val = whole(p.value, 0, 99, 7);
      const buckets = Array.from({ length: size }, () => []);
      const { y, h } = rows(s, size);
      const x = j => 122 + j * 106;
      const missKey = ['emu', 'yak', 'elk'].find(k => k !== mine);
      let nextId = 0, askedNew = false, askedSame = false;
      s.text('op', 20, 30, '', { anchor: 'start', size: 16, mono: true, weight: 700 });
      const clean = () => {
        s.clearTones();
        for (let i = 0; i < size; i++) s.tone(`b${i}`, 'muted');
      };
      s.snap(`__init__ makes ${size === 1 ? '1 empty bucket' : `${size} empty buckets`}. Each one is a list.`, { line: 3, vars: { size } });

      const put = (key, value) => {
        const b = bucketFor(key, size), there = buckets[b];
        const vars = { key: quoted(key), value, b };
        clean();
        s.set('op', { text: `m.put(${quoted(key)}, ${value})` });
        s.tone(`b${b}`, 'active');
        const newCollide = there.length && !there.some(q => q.key === key) && !askedNew;
        let ask = null;
        if (newCollide) {
          askedNew = true;
          ask = {
            q: `Bucket ${b} is not empty, and ${quoted(key)} is a new key. What will put do?`,
            options: [`Replace ${quoted(there[0].key)}`, 'Check each pair, then add a new pair', 'Stop with an error'],
            answer: 1,
            why: 'put must check first. If no pair has this key, it adds a new pair.',
          };
        }
        s.snap(`The recipe says bucket ${b}.`, { line: 6, vars, ask });
        for (const pair of there) {
          s.tone(pair.id, 'active');
          if (pair.key === key) {
            let same = null;
            if (!askedSame) {
              askedSame = true;
              same = {
                q: `This pair already has the key ${quoted(key)}. What should put do?`,
                options: ['Add a second pair', 'Change the value in this pair', 'Throw the new value away'],
                answer: 1,
                why: 'A key holds one value at a time. So put changes this pair and stops.',
              };
            }
            s.snap(`This pair has the key ${quoted(key)}.`, { line: 8, vars, ask: same });
            pair.value = value;
            s.set(pair.id, { text: `${key}: ${value}`, tone: 'ok' });
            s.pulse(pair.id);
            s.snap(`The value becomes ${value}. Then put stops. No new pair.`, { line: 9, vars });
            return;
          }
          s.snap(`${quoted(pair.key)} is not ${quoted(key)}. Check the next pair.`, { line: 8, vars });
          s.tone(pair.id, 'default');
        }
        const id = `p${nextId++}`;
        s.box(id, x(there.length), y(b), `${key}: ${value}`, { w: 98, h, size: 14, tone: 'ok' });
        there.push({ key, value, id });
        s.snap(there.length === 1 ? `The bucket is empty, so put adds the pair.` : `No pair has this key. put adds a new pair at the end.`, { line: 11, vars });
      };

      const get = (key, ask) => {
        const b = bucketFor(key, size), there = buckets[b];
        const vars = { key: quoted(key), b };
        clean();
        s.set('op', { text: `m.get(${quoted(key)})` });
        s.tone(`b${b}`, 'active');
        s.snap(`The recipe says bucket ${b}.`, { line: 14, vars, ask });
        for (const pair of there) {
          s.tone(pair.id, 'active');
          if (pair.key === key) {
            s.tone(pair.id, 'ok');
            s.snap(`This pair has the key. get returns ${pair.value}.`, { line: 17, vars: Object.assign({ returns: pair.value }, vars) });
            return;
          }
          s.snap(`${quoted(pair.key)} is not ${quoted(key)}. Check the next pair.`, { line: 16, vars });
          s.tone(pair.id, 'default');
        }
        s.snap(`No pair has this key. get returns None.`, { line: 18, vars: Object.assign({ returns: 'None' }, vars) });
      };

      put('cat', 3);
      put('dog', 5);
      put(mine, val);
      if (mine !== 'cat') put('cat', 9);
      get(mine);
      get(missKey, {
        q: `No one ever put ${quoted(missKey)} in. What will get give back?`,
        options: ['0', 'It stops with a KeyError', 'None'],
        answer: 2,
        why: 'The loop finds no pair, so the last line runs. Our get gives None. A real dict with [] stops with a KeyError.',
      });
    },
  });

  // ------------------------------------------------------------- 11.3: Two Sum
  const numberList = text => String(text == null ? '' : text).split(/[\s,]+/).filter(Boolean)
    .map(Number).filter(Number.isFinite).map(n => Math.max(-999, Math.min(999, Math.round(n)))).slice(0, 6);
  const targetOf = t => whole(t, -999, 999, 12);
  const TWO_SUM_INPUTS = [
    { key: 'nums', label: 'Numbers (up to 6)', type: 'text', value: '4 9 2 7 5', size: 14 },
    { key: 'target', label: 'Target', type: 'number', value: 12, min: -999, max: 999 },
  ];
  const TWO_SUM_TRIES = [{ nums: '' }, { nums: '6' }, { nums: '3 3', target: 6 }, { nums: '3 4', target: 6 }, { nums: '1 2 3 4 5 6', target: 99 }, { nums: '-4 9 -2', target: 5 }, { nums: 'a b c' }, { nums: '1 2 3 4 5 6 7 8 9' }, { nums: '4 9', target: '' }, { nums: '1.5 2.5' }];
  /* How many steps the double loop takes, so the dict picture can compare. */
  function loopSteps(nums, target) {
    let steps = 0;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        steps += 1;
        if (nums[i] + nums[j] === target) return steps;
      }
    }
    return steps;
  }

  Viz.register('m11-two-sum-loops', {
    title: 'Two Sum with a double loop',
    size: [560, 280],
    code: py`
      def two_sum(nums, target):
          for i in range(len(nums)):
              for j in range(i + 1, len(nums)):
                  if nums[i] + nums[j] == target:
                      return [i, j]
          return None
    `,
    inputs: TWO_SUM_INPUTS,
    tryInputs: TWO_SUM_TRIES,
    build(s, p) {
      const nums = numberList(p.nums), target = targetOf(p.target), n = nums.length;
      const pairs = (n * (n - 1)) / 2;
      const o = { cell: 60, gap: 10, x: 280, y: 52 };
      const vars = (steps, i, j) => (i == null ? { target, steps } : { target, i, j, steps });
      if (n) s.row('n', nums, o);
      else s.text('none', 280, 52, 'The list is empty', { size: 15, tone: 'muted' });
      s.text('sum', 280, 178, '', { size: 16, mono: true, weight: 700 });
      s.text('sl', 228, 232, 'steps', { size: 16, weight: 700 });
      s.box('steps', 300, 232, 0, { w: 80, h: 48 });

      let firstAsk = null;
      if (n >= 2) {
        firstAsk = numAsk(`${n} items. If no pair works, how many pairs does the loop try?`, pairs, [n * n, n],
          `Each item pairs with the ones after it. That is ${Array.from({ length: n - 1 }, (_, k) => n - 1 - k).join(' + ')} = ${pairs}.`);
      }
      s.snap(n ? `Look for 2 numbers that add up to ${target}.` : 'No numbers means no pairs. The loops never run.', { line: 1, vars: vars(0), ask: firstAsk });

      let steps = 0, found = null;
      outer:
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          steps += 1;
          s.clearTones();
          s.tone([`n${i}`, `n${j}`], 'active');
          if (steps === 1) {
            s.pointer('pi', s.get(`n${i}`).x, 110, 'i', { dir: 'up' });
            s.pointer('pj', s.get(`n${j}`).x, 110, 'j', { dir: 'up' });
          } else {
            s.set('pi', { x: s.get(`n${i}`).x });
            s.set('pj', { x: s.get(`n${j}`).x });
          }
          s.set('steps', { text: steps });
          const total = nums[i] + nums[j], hit = total === target;
          s.set('sum', { text: `${nums[i]} + ${nums[j]} = ${total}. Target is ${target}.` });
          const atRowEnd = j === n - 1 && i < n - 2;
          let ask = null;
          if (!hit && atRowEnd && i === 0) {
            ask = {
              q: `j reached the end. i moves to ${i + 1}. Where does j start?`,
              options: ['At 0, back at the start', `At ${i + 2}, right after i`, `At ${i + 1}, the same spot as i`],
              answer: 1,
              why: 'Starting at 0 would try old pairs again. The same spot would use one item twice.',
            };
          }
          s.snap(hit ? `Step ${steps}: ${total} is the target. Found it.` : `Step ${steps}: ${total} is not the target. Try the next pair.`, { line: hit ? 5 : 4, vars: vars(steps, i, j), ask });
          if (hit) {
            s.tone([`n${i}`, `n${j}`], 'ok');
            found = [i, j];
            break outer;
          }
        }
      }
      if (found) {
        s.snap(`It returns [${found[0]}, ${found[1]}] after ${stepsWord(steps)}. The worst case for ${n} items is ${pairs}.`, { line: 5, vars: vars(steps, found[0], found[1]) });
      } else {
        if (s.has('pi')) s.del('pi', 'pj');
        s.clearTones();
        s.set('sum', { text: 'No pair works.' });
        s.snap(n === 1 ? 'One item has no partner, so there are 0 pairs. It returns None.' : `It returns None after ${stepsWord(steps)}. That is every pair.`, { line: 6, vars: vars(steps) });
      }
    },
  });

  Viz.register('m11-two-sum-dict', {
    title: 'Two Sum with a dict',
    size: [560, 290],
    code: py`
      def two_sum(nums, target):
          seen = {}
          for i in range(len(nums)):
              need = target - nums[i]
              if need in seen:
                  return [seen[need], i]
              seen[nums[i]] = i
          return None
    `,
    inputs: TWO_SUM_INPUTS,
    tryInputs: TWO_SUM_TRIES,
    build(s, p) {
      const nums = numberList(p.nums), target = targetOf(p.target), n = nums.length;
      const o = { cell: 60, gap: 10, x: 280, y: 44 };
      if (n) s.row('n', nums, o);
      else s.text('none', 280, 44, 'The list is empty', { size: 15, tone: 'muted' });
      s.text('need', 196, 152, '', { size: 16, mono: true, weight: 700 });
      s.text('sl', 440, 152, 'steps', { size: 15, weight: 700 });
      s.box('steps', 500, 152, 0, { w: 64, h: 40, size: 17 });
      s.area('seen', 20, 182, 520, 98, 'seen (number: its index)');
      s.snap(n ? `seen starts empty. It remembers numbers you have passed. The target is ${target}.` : 'No numbers, so the loop never runs. It returns None.', { line: 2, vars: { target, steps: 0, seen: '{}' } });
      if (!n) return;

      const chips = {};
      const order = [];
      const chipX = k => 62 + k * 87;
      const shown = () => `{${order.map(v => `${v}: ${chips[v].i}`).join(', ')}}`;
      let steps = 0, found = null;

      for (let i = 0; i < n; i++) {
        const v = nums[i], need = target - v;
        steps += 1;
        s.clearTones();
        s.tone(`n${i}`, 'active');
        if (i === 0) s.pointer('pi', s.get('n0').x, 102, 'i', { dir: 'up' });
        else s.set('pi', { x: s.get(`n${i}`).x });
        s.set('need', { text: `need = ${target} - ${v} = ${need}` });
        s.set('steps', { text: steps });
        const vars = { target, i, need, steps, seen: shown() };
        const has = Object.prototype.hasOwnProperty.call(chips, need);
        const ask = (i === 1 || has || i === n - 1) && !(i === 0 && !has) ? {
          q: `Is ${need} in seen right now?`,
          options: ['Yes', 'No'],
          answer: has ? 0 : 1,
          why: has ? `${need} is a key in seen, and a dict finds it in about 1 look.` : `seen has no key ${need}. A dict can tell you without checking every key.`,
        } : null;
        s.snap(`Step ${steps}: ${v} needs a partner of ${need}.`, { line: 4, vars, ask });

        if (has) {
          s.tone(`n${chips[need].i}`, 'ok');
          s.tone(`n${i}`, 'ok');
          s.tone(chips[need].id, 'ok');
          s.pulse(chips[need].id);
          found = [chips[need].i, i];
          s.snap(`${need} is in seen, at index ${chips[need].i}. Found the pair.`, { line: 6, vars });
          break;
        }
        if (Object.prototype.hasOwnProperty.call(chips, v)) {
          chips[v].i = i;
          s.set(chips[v].id, { text: `${v}: ${i}`, tone: 'ok' });
        } else {
          const id = `s${order.length}`;
          s.box(id, chipX(order.length), 238, `${v}: ${i}`, { w: 82, h: 40, size: 15, tone: 'ok' });
          chips[v] = { i, id };
          order.push(v);
        }
        s.snap(`${need} is not in seen yet. So you remember ${v} and go on.`, { line: 7, vars: { target, i, need, steps, seen: shown() } });
      }

      const slow = loopSteps(nums, target);
      if (found) {
        s.snap(`It returns [${found[0]}, ${found[1]}] after ${stepsWord(steps)}. The double loop took ${slow}.`, { line: 6, vars: { target, steps, seen: shown() } });
      } else {
        s.del('pi');
        s.clearTones();
        s.set('need', { text: 'No pair works.' });
        s.snap(`It returns None after ${stepsWord(steps)}. The double loop took ${slow}.`, { line: 8, vars: { target, steps, seen: shown() } });
      }
    },
  });

  // ------------------------------------------------------- 11.3: group the anagrams
  Viz.register('m11-group-anagrams', {
    title: 'Group words by their sorted letters',
    size: [560, 310],
    code: py`
      groups = defaultdict(list)
      for word in words:
          key = "".join(sorted(word))
          groups[key].append(word)
      print(list(groups.values()))
    `,
    inputs: [{ key: 'words', label: 'Words (up to 5)', type: 'text', value: 'stop pots ring grin tops', size: 24 }],
    tryInputs: [{ words: '' }, { words: 'solo' }, { words: 'aaa aaa' }, { words: 'ab cd ef gh ij' }, { words: 'abcdefgh hgfedcba' }, { words: 'a b c d e f g' }, { words: 'Stop pots' }],
    build(s, p) {
      const words = keyList(p.words, 5);
      const sortKey = w => [...w].sort().join('');
      const x = i => s.slotX(i, words.length || 1, { cell: 88, gap: 8, x: 280 });
      words.forEach((w, i) => s.box(`w${i}`, x(i), 34, w, { w: 80, h: 38, size: 15 }));
      if (!words.length) s.text('none', 280, 34, 'You gave no words', { size: 15, tone: 'muted' });
      s.text('keytext', 280, 80, '', { size: 16, mono: true, weight: 700 });
      s.area('groups', 20, 102, 520, 200, 'groups (sorted letters: the words)');
      s.snap(words.length ? 'groups starts empty. Each word will find its group.' : 'No words, so groups stays empty.', { line: 1, out: '' });
      if (!words.length) { s.snap('It prints an empty list.', { line: 5, out: '[]' }); return; }

      const groups = {}, names = [];
      const rowY = r => 148 + r * 31;
      const memberX = j => 150 + j * 84;
      let askedKey = false, askedSame = false;

      words.forEach((word, i) => {
        const key = sortKey(word);
        s.clearTones();
        s.tone(`w${i}`, 'active');
        s.set('keytext', { text: '' });
        const vars = { word: quoted(word) };
        const options = [...new Set([word, key, [...word].reverse().join('')])];
        const ask = !askedKey && i === 1 && options.length > 1 ? {
          q: `What is the sorted key for ${quoted(word)}?`,
          options: options.map(quoted),
          answer: options.indexOf(key),
          why: 'sorted puts the letters in order, and join makes them one string again.',
        } : null;
        if (ask) askedKey = true;
        s.snap(`Next word: ${quoted(word)}.`, { line: 2, vars, ask, out: '' });
        s.set('keytext', { text: `sorted letters: ${quoted(key)}` });
        vars.key = quoted(key);
        const known = Object.prototype.hasOwnProperty.call(groups, key);
        const sameAsk = known && !askedSame ? {
          q: `The key ${quoted(key)} is already in groups. Where does ${quoted(word)} go?`,
          options: ['Into a new group', 'Into the same group', 'Nowhere. It gets dropped'],
          answer: 1,
          why: 'The same letters give the same key. So all anagrams meet in one group.',
        } : null;
        if (sameAsk) askedSame = true;
        s.snap(`The letters of ${quoted(word)} in order are ${quoted(key)}.`, { line: 3, vars, ask: sameAsk, out: '' });
        if (!known) {
          groups[key] = [];
          const r = names.length;
          names.push(key);
          s.box(`k${r}`, 66, rowY(r), key, { w: 76, h: 28, size: 15, tone: 'accent' });
        }
        const r = names.indexOf(key), j = groups[key].length;
        groups[key].push(word);
        s.set(`w${i}`, { x: memberX(j), y: rowY(r), h: 28, tone: 'ok' });
        s.snap(known ? `The key is there, so ${quoted(word)} joins its group.` : `This key is new, so it starts a new group.`, { line: 4, vars, out: '' });
      });

      s.clearTones();
      names.forEach((n, r) => s.tone(`k${r}`, 'accent'));
      s.set('keytext', { text: '' });
      const printed = `[${names.map(n => `[${groups[n].map(w => `'${w}'`).join(', ')}]`).join(', ')}]`;
      const count = names.length;
      s.snap(`${words.length === 1 ? '1 word' : `${words.length} words`} made ${count === 1 ? '1 group' : `${count} groups`}, in one trip through the list.`, { line: 5, out: printed });
    },
  });
})();
