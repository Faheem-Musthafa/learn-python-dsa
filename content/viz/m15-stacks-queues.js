/* Visuals for module 15. Names start with the module id. */
(function () {
  /* ---------------------------------------------------------------- shared picture
   * A stack drawn as a pile. It grows up from a floor, and the top is the end of the list.
   * Module 16 can reuse it for the call stack:
   *
   *   const pile = Viz.pile(s, { x: 130, floor: 252, w: 150, h: 38, topLabel: 'runs now' });
   *   pile.push('fact(3)');          // goes on top, and the top marker moves up to it
   *   pile.push('fact(2)');
   *   pile.peek();                   // 'fact(2)'
   *   pile.tone('active');           // tone of the top item
   *   pile.pop();                    // {id, value}. The item goes away in the next frame.
   *   pile.pop({ x: 400, y: 90 });   // The item slides to (x, y) and stays. s.del(id) removes it.
   *
   * Options: x, floor, w, h, gap, size (letter size), prefix, topLabel, index (spot numbers).
   * Keep floor + 26 inside the stage, for the "bottom" label.
   */
  Viz.pile = function (s, o = {}) {
    const x = o.x == null ? 130 : o.x, floor = o.floor == null ? 252 : o.floor;
    const w = o.w || 110, h = o.h || 38, gap = o.gap == null ? 4 : o.gap;
    const pre = o.prefix || 'pile', topLabel = o.topLabel || 'top';
    const ids = [], values = [];
    let made = 0;
    const yAt = k => floor - h / 2 - k * (h + gap);
    const markTop = () => {
      const has = s.has(pre + 'Top'), n = ids.length;
      if (!n) {
        if (has) s.del(pre + 'Top');
        if (!s.has(pre + 'Empty')) s.text(pre + 'Empty', x, floor - 18, 'empty', { size: 14, tone: 'muted' });
        return;
      }
      if (s.has(pre + 'Empty')) s.del(pre + 'Empty');
      if (has) s.set(pre + 'Top', { y: yAt(n - 1) });
      else s.text(pre + 'Top', x + w / 2 + 8, yAt(n - 1), '← ' + topLabel, { size: 14, anchor: 'start', weight: 700 });
    };
    s.box(pre + 'Floor', x, floor + 3, '', { w: w + 24, h: 6, tone: 'muted' });
    s.text(pre + 'Bottom', x, floor + 18, 'bottom', { size: 13, tone: 'muted' });
    markTop();
    return {
      ids, values, yAt,
      size: () => ids.length,
      peek: () => values[values.length - 1],
      topId: () => ids[ids.length - 1],
      tone(t) { if (ids.length) s.tone(ids[ids.length - 1], t); },
      push(value, opts) {
        const k = ids.length, id = pre + 'Item' + made++;
        s.box(id, x, yAt(k), value, Object.assign({ w, h, tone: 'active' }, o.size ? { size: o.size } : null, opts));
        if (o.index) s.text(id + 'Spot', x - w / 2 - 14, yAt(k), k, { size: 13, tone: 'muted', mono: true });
        ids.forEach(i => { if (s.get(i).tone === 'active') s.tone(i, 'default'); });
        ids.push(id);
        values.push(value);
        markTop();
        return id;
      },
      pop(moved) {
        const id = ids.pop(), value = values.pop();
        if (o.index) s.del(id + 'Spot');
        if (moved) s.set(id, moved);
        else s.del(id);
        markTop();
        return { id, value };
      },
    };
  };

  // ---------------------------------------------------------------- small helpers
  const wordsIn = (t, most, letters) => String(t == null ? '' : t)
    .split(/[\s,]+/).filter(Boolean).slice(0, most)
    .map(x => Array.from(x).slice(0, letters).join(''));
  const whole = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v)) || 0));
  const show = a => '[' + a.map(x => "'" + x + "'").join(', ') + ']';
  /* Options with the right one at spot `at`. Drops repeats, so typed values never give two same buttons. */
  const choose = (right, others, at) => {
    const rest = [];
    others.forEach(o => { if (String(o) !== String(right) && !rest.includes(String(o))) rest.push(String(o)); });
    const spot = Math.min(at, rest.length);
    rest.splice(spot, 0, String(right));
    return { options: rest, answer: spot };
  };

  // ---------------------------------------------------------------- lesson 15.1
  Viz.register('m15-stack-pile', {
    title: 'A pile with one open end',
    size: [560, 290],
    code: py`
      stack = []
      for x in items:
          stack.append(x)
      for t in range(pops):
          print(stack.pop())
      print(stack)
    `,
    inputs: [
      { key: 'items', label: 'Items to push (up to 5)', type: 'text', value: 'red blue green' },
      { key: 'pops', label: 'How many pops', type: 'number', value: 2, min: 0, max: 6 },
    ],
    tryInputs: [
      { items: '', pops: 0 }, { items: '', pops: 1 }, { items: 'A', pops: 1 }, { items: 'A A A', pops: 2 },
      { items: 'a b', pops: 5 }, { items: 'averyveryverylongword x', pops: 1 }, { items: ' , ,', pops: 0 },
      { items: '1 2 3 4 5 6 7 8', pops: 6 },
    ],
    build(s, p) {
      const items = wordsIn(p.items, 5, 5);
      const pops = whole(p.pops, 0, 6);
      const pile = Viz.pile(s, { x: 130, floor: 252, w: 110, h: 38, index: true });
      const lines = [];
      const out = () => lines.join('\n');
      const vars = () => ({ stack: show(pile.values) });
      s.text('name', 130, 22, 'stack', { size: 15, mono: true });
      s.snap('The stack starts empty. The end of the list will be the top.', { line: 1, vars: vars() });

      if (!items.length) s.snap('items is empty, so nothing goes on.', { line: 2, vars: vars() });
      items.forEach((x, i) => {
        if (i === 1) {
          s.snap(`Next, append runs with ${x}.`, {
            line: 3, vars: vars(),
            ask: {
              q: `Where does ${x} go?`,
              options: [`Under ${items[0]}`, `On top of ${items[0]}`],
              answer: 1,
              why: 'append adds at the end of the list. The end of the list is the top of the stack.',
            },
          });
        }
        pile.push(x);
        s.snap(i === 0 ? `${x} goes on first. It sits at spot 0, the bottom.` : `${x} goes on top. It is the last item in the list now.`, { line: 3, vars: vars() });
      });

      if (pops === 0) {
        s.tone(pile.ids, 'default');
      } else {
        s.text('offl', 263, 72, 'came off, in order', { size: 14, tone: 'muted', anchor: 'start' });
      }
      for (let t = 0; t < pops; t++) {
        const n = pile.size();
        s.tone(pile.ids, 'default');
        const low = pile.values[0], top = pile.peek();
        if (n === 0) {
          s.snap('The next pop runs, but the pile is empty.', {
            line: 5, vars: vars(), out: out(),
            ask: {
              q: 'The stack is empty. What does pop do?',
              options: ['It hands back None', 'Python stops with an IndexError', 'It hands back 0'],
              answer: 1,
              why: 'There is nothing to hand back, so Python stops and tells you.',
            },
          });
          lines.push('IndexError: pop from empty list');
          s.snap('Python stops here. Always check for an empty stack before you pop.', { line: 5, vars: vars(), out: out() });
          return;
        }
        const ask = n >= 2
          ? Object.assign(
            { q: 'Which item comes off next?', why: 'pop with no number takes the end of the list. That is the top, the last one in.' },
            t % 2 ? { options: [`${top}, the top one`, `${low}, the bottom one`], answer: 0 } : { options: [`${low}, the bottom one`, `${top}, the top one`], answer: 1 })
          : { q: 'One item is left. What is in the stack after this pop?', options: ['Nothing. It is empty.', 'The same item. pop only looks.'], answer: 0, why: 'pop takes the item out and hands it back. Only peeking with stack[-1] leaves it there.' };
        s.snap('Next, pop runs.', { line: 5, vars: vars(), out: out(), ask });
        pile.pop({ x: 288 + 54 * t, y: 106, w: 50, h: 44, size: 14, tone: 'accent' });
        lines.push(top);
        s.snap(`${top} comes off the top. ${n > 1 ? `The new top is ${pile.peek()}.` : 'The pile is empty now.'}`, { line: 5, vars: vars(), out: out() });
      }
      s.tone(pile.ids, 'default');
      lines.push(show(pile.values));
      s.snap(pops > 1 ? 'They came off in the reverse of the order they went on.' : 'print shows what is left in the list.', { line: 6, vars: vars(), out: out() });
    },
  });

  Viz.register('m15-call-pile', {
    title: 'Function calls make a stack too',
    size: [560, 290],
    code: py`
      def c():
          print("c runs")

      def b():
          c()
          print("b ends")

      def a():
          b()
          print("a ends")

      pick()
    `,
    inputs: [
      { key: 'pick', label: 'pick is', type: 'select', value: 'a', options: ['a', 'b', 'c'] },
    ],
    tryInputs: [{ pick: 'a' }, { pick: 'b' }, { pick: 'c' }, { pick: 'nope' }],
    build(s, p) {
      const fns = {
        a: { def: 8, call: 9, inner: 'b', print: 10, says: 'a ends' },
        b: { def: 4, call: 5, inner: 'c', print: 6, says: 'b ends' },
        c: { def: 1, call: 0, inner: null, print: 2, says: 'c runs' },
      };
      const pick = fns[p.pick] ? p.pick : 'a';
      const pile = Viz.pile(s, { x: 130, floor: 252, w: 150, h: 38, topLabel: 'runs now' });
      const lines = [];
      const out = () => (lines.length ? lines.join('\n') : null);
      const vars = () => ({ pick, calls: show(pile.values) });
      let asked = 0;
      s.text('name', 130, 22, 'call stack', { size: 15 });
      pile.push('main code');
      s.snap('Your main code runs first. It is at the bottom of the pile.', { line: 12, vars: vars() });
      s.snap(`The last line calls ${pick}().`, {
        line: 12, vars: vars(),
        ask: {
          q: `Where does the call to ${pick}() go?`,
          options: ['Under main code', 'On top of main code', 'It replaces main code'],
          answer: 1,
          why: 'A new call goes on top. The code that made the call waits below it.',
        },
      });
      const run = name => {
        const f = fns[name];
        pile.push(name + '()');
        s.snap(`${name}() goes on top. The call below it waits.`, { line: f.def, vars: vars(), out: out() });
        if (f.inner) {
          s.snap(`${name}() calls ${f.inner}() and must wait for it.`, { line: f.call, vars: vars(), out: out() });
          run(f.inner);
        }
        lines.push(f.says);
        pile.tone('active');
        s.snap(`${name}() prints its line.`, { line: f.print, vars: vars(), out: out() });
        const below = pile.values[pile.size() - 2];
        const ask = asked++ < 2 ? {
          q: `${name}() is done. Which call runs next?`,
          ...choose(below, pile.values.filter(v => v !== below), asked % 2),
          why: 'The top call comes off. The call right below it was waiting, so it carries on.',
        } : null;
        s.snap(`${name}() has no more lines.`, { line: f.print, vars: vars(), out: out(), ask });
        pile.pop();
        pile.tone('active');
        s.snap(`${name}() comes off the top. ${below} runs again.`, { line: below === 'main code' ? 12 : fns[below[0]].call, vars: vars(), out: out() });
      };
      run(pick);
      s.snap('The last call on was the first call off. That is a stack.', { line: 12, vars: vars(), out: out() });
    },
  });

  // ---------------------------------------------------------------- lesson 15.2
  Viz.register('m15-pop-front', {
    title: 'What pop(0) really does',
    size: [560, 230],
    code: py`
      names = "Ann Bo Cy Di Eve Fay".split()
      line = names[:size]
      first = line.pop(0)
      print(first)
      print(line)
    `,
    inputs: [
      { key: 'size', label: 'People in the line', type: 'number', value: 4, min: 1, max: 6 },
    ],
    tryInputs: [{ size: 1 }, { size: 2 }, { size: 3 }, { size: 6 }],
    build(s, p) {
      const n = whole(p.size, 1, 6);
      const line = ['Ann', 'Bo', 'Cy', 'Di', 'Eve', 'Fay'].slice(0, n);
      const o = { y: 100, cell: 62, gap: 6 };
      const X = i => s.slotX(i, n, o);
      let moves = 0;
      const vars = () => ({ size: n, moves });
      s.row('p', line, o);
      s.text('moved', 420, 34, 'moves: 0', { size: 18, weight: 700 });
      s.snap(`The line holds ${n} ${n === 1 ? 'person' : 'people'}. Spot 0 is the front.`, { line: 2, vars: vars() });
      s.snap('Next, pop(0) runs. A list must keep its items in spots with no gaps.', {
        line: 3, vars: vars(),
        ask: {
          q: `The front person leaves. How many others must slide left?`,
          ...choose(n - 1, [0, 1, n], 2),
          why: 'A list has no gaps. So every other item slides one spot to the left.',
        },
      });
      s.set('p0', { y: 34, tone: 'accent' });
      s.text('firstl', X(0) + 44, 34, 'first', { size: 14, anchor: 'start', mono: true });
      s.snap(`${line[0]} leaves. Spot 0 is empty now.`, { line: 3, vars: vars() });
      for (let i = 1; i < n; i++) {
        moves += 1;
        s.set('p' + i, { x: X(i - 1), tone: 'warn' });
        if (i > 1) s.tone('p' + (i - 1), 'default');
        s.set('moved', { text: `moves: ${moves}` });
        s.snap(`${line[i]} slides from spot ${i} to spot ${i - 1}. That is move ${moves}.`, { line: 3, vars: vars() });
      }
      if (n > 1) s.tone('p' + (n - 1), 'default');
      s.del('pi' + (n - 1));
      const printed = [line[0], show(line.slice(1))];
      s.snap(moves === 0 ? 'Nobody else is in the line, so nothing slides.' : `One pop(0) took ${moves} ${moves === 1 ? 'move' : 'moves'}. The last spot goes away.`, { line: 4, vars: vars(), out: printed[0] });
      const total = n * (n - 1) / 2;
      const parts = [];
      for (let k = n - 1; k >= 1; k--) parts.push(k);
      s.snap('print shows who is left. Now picture serving everyone this way.', {
        line: 5, vars: vars(), out: printed.join('\n'),
        ask: {
          q: `Serve all ${n} with pop(0). How many slides in all?`,
          ...choose(total, [n - 1, n, n * n], 1),
          why: `Each pop slides everyone still in line. So you add ${parts.length ? parts.join(' + ') + ' + 0' : '0'}.`,
        },
      });
      s.text('sum', 280, 188, parts.length > 1 ? `To empty it: ${parts.join(' + ')} = ${total} moves` : `To empty it: ${total} ${total === 1 ? 'move' : 'moves'}`, { size: 15, weight: 700 });
      s.snap(n === 1 ? 'One person means no slides. Now try a longer line.' : 'Every serve slides the whole line. A long line means a lot of moves.', { line: 5, vars: vars(), out: printed.join('\n') });
    },
  });

  Viz.register('m15-deque-line', {
    title: 'A deque has two open ends',
    size: [560, 270],
    code: py`
      from collections import deque
      line = deque()
      for name in people:
          line.append(name)
      for t in range(serve):
          print(line.popleft())
      print(len(line))
    `,
    inputs: [
      { key: 'people', label: 'People (up to 5)', type: 'text', value: 'Ann Bo Cy Di' },
      { key: 'serve', label: 'How many to serve', type: 'number', value: 2, min: 0, max: 6 },
    ],
    tryInputs: [
      { people: '', serve: 0 }, { people: '', serve: 2 }, { people: 'Ann', serve: 1 }, { people: 'Bo Bo Bo', serve: 2 },
      { people: 'A B', serve: 6 }, { people: 'Christopher B C D E F G', serve: 3 },
    ],
    build(s, p) {
      const people = wordsIn(p.people, 5, 6);
      const serve = whole(p.serve, 0, 6);
      const X = i => 100 + 84 * i;
      const y = 95;
      const inLine = [], lines = [];
      let front = 0;
      const vars = () => ({ line: show(inLine.map(i => people[i])), moves: 0 });
      const marks = () => {
        const has = s.has('front');
        if (!inLine.length) {
          if (has) s.del('front', 'back');
          if (!s.has('none')) s.text('none', 280, y, 'nobody in line', { size: 15, tone: 'muted' });
          return;
        }
        if (s.has('none')) s.del('none');
        const a = X(inLine[0]), b = X(inLine[inLine.length - 1]);
        if (has) { s.set('front', { x: a }); s.set('back', { x: b }); }
        else { s.pointer('front', a, 67, 'front', { dir: 'down' }); s.pointer('back', b, 123, 'back', { dir: 'up' }); }
      };
      s.text('servedl', 50, 222, 'served', { size: 14, tone: 'muted' });
      marks();
      s.snap('The line starts empty. Nobody has joined yet.', { line: 2, vars: vars() });
      if (!people.length) s.snap('people is empty, so nobody joins.', { line: 3, vars: vars() });
      people.forEach((name, i) => {
        if (i === 1) {
          s.snap(`Next, append runs with ${name}.`, {
            line: 4, vars: vars(),
            ask: {
              q: `Where does ${name} join?`,
              options: ['At the back', 'At the front'],
              answer: 0,
              why: 'append adds at the back. New people wait behind everyone else.',
            },
          });
        }
        s.tone(inLine.map(k => 'q' + k), 'default');
        s.box('q' + i, X(i), y, name, { w: 72, h: 48, size: 15, tone: 'active' });
        inLine.push(i);
        marks();
        s.snap(`${name} joins at the back of the line.`, { line: 4, vars: vars() });
      });
      s.tone(inLine.map(k => 'q' + k), 'default');
      for (let t = 0; t < serve; t++) {
        if (!inLine.length) {
          s.snap('The next popleft runs, but the line is empty.', {
            line: 6, vars: vars(), out: lines.join('\n'),
            ask: {
              q: 'The line is empty. What does popleft do?',
              options: ['It hands back None', 'It waits for someone to join', 'Python stops with an IndexError'],
              answer: 2,
              why: 'There is nobody to hand back. So check that the line is not empty first.',
            },
          });
          lines.push('IndexError: pop from an empty deque');
          s.snap('Python stops here. Check the length before you serve.', { line: 6, vars: vars(), out: lines.join('\n') });
          return;
        }
        const f = people[inLine[0]], b = people[inLine[inLine.length - 1]];
        if (t < 3) {
          s.snap('Next, popleft runs.', {
            line: 6, vars: vars(), out: lines.join('\n'),
            ask: inLine.length > 1 ? {
              q: 'Who leaves the line?',
              options: t % 2 ? [`${f}, at the front`, `${b}, at the back`] : [`${b}, at the back`, `${f}, at the front`],
              answer: t % 2 ? 0 : 1,
              why: 'popleft takes from the front. The first one in is the first one out.',
            } : {
              q: 'How many other items must slide when this person leaves?',
              options: ['None', 'All of them'],
              answer: 0,
              why: 'A deque never slides items. It only changes which spot counts as the front.',
            },
          });
        }
        const at = inLine.shift();
        s.set('q' + at, { x: 118 + 72 * front, y: 222, w: 64, h: 40, tone: 'accent' });
        front += 1;
        marks();
        lines.push(f);
        s.snap(inLine.length ? `${f} leaves. Nobody slides. Only the front marker moves.` : `${f} leaves. Nobody is left in the line.`, { line: 6, vars: vars(), out: lines.join('\n') });
      }
      lines.push(String(inLine.length));
      s.snap(`print shows that ${inLine.length} ${inLine.length === 1 ? 'person is' : 'people are'} left. No item had to slide.`, { line: 7, vars: vars(), out: lines.join('\n') });
    },
  });

  // ---------------------------------------------------------------- lesson 15.3
  Viz.register('m15-brackets', {
    title: 'Check your own brackets',
    size: [560, 380],
    code: py`
      pairs = {")": "(", "]": "[", "}": "{"}
      def balanced(text):
          stack = []
          for ch in text:
              if ch in "([{":
                  stack.append(ch)
              elif ch in ")]}":
                  if len(stack) == 0:
                      return False
                  top = stack.pop()
                  if pairs[ch] != top:
                      return False
          return len(stack) == 0
      print(balanced(text))
    `,
    inputs: [
      { key: 'text', label: 'Type your brackets (try none, or only closing ones)', type: 'text', value: '{[()]}' },
    ],
    tryInputs: [
      { text: '' }, { text: ')' }, { text: ')))' }, { text: '(((' }, { text: '([)]' }, { text: '{[()]}' }, { text: ')(' }, { text: '()' },
      { text: 'a(b)c' }, { text: 'hello' }, { text: '( )' }, { text: '((((((((((' }, { text: '(((((((((((((((((((((' },
      { text: '()()()()()()()()()()' }, { text: '(((())))' }, { text: '\u{1F642}(' }, { text: '(]' }, { text: '<>' },
    ],
    build(s, p) {
      const all = Array.from(String(p.text == null ? '' : p.text).replace(/\s+/g, ''));
      const chars = all.slice(0, 10);
      const cut = all.length > chars.length;
      const opens = '([{', closes = ')]}';
      const partner = { ')': '(', ']': '[', '}': '{' };

      // Work out how tall the pile gets, so the plates always fit.
      let d = 0, deep = 0;
      for (const c of chars) {
        if (opens.includes(c)) { d += 1; deep = Math.max(deep, d); } else if (closes.includes(c)) d = Math.max(0, d - 1);
      }
      const look = deep <= 5 ? { h: 44, gap: 4 } : deep <= 7 ? { h: 30, gap: 4 } : { h: 22, gap: 3, size: 15 };
      const pile = Viz.pile(s, Object.assign({ x: 130, floor: 348, w: 90 }, look));
      const vars = ch => (ch == null ? { stack: show(pile.values) } : { ch, stack: show(pile.values) });
      const o = { y: 40, cell: 40, gap: 4, index: false };
      const X = i => s.slotX(i, chars.length, o);
      let asked = false, plate = null;

      const finish = (result, say, line, tone) => {
        s.box('verdict', 410, 322, `balanced: ${result ? 'True' : 'False'}`, { w: 220, h: 48, size: 17, tone });
        s.snap(say, { line, vars: vars(), out: result ? 'True' : 'False' });
      };
      const clearMatch = () => {
        s.del('cmpCh', 'cmpTopL', 'cmpChL', 'cmpSay');
        if (plate) s.del(plate);
        plate = null;
      };
      const lookAt = c => {
        if (!s.has('cmpCh')) {
          s.box('cmpCh', 450, 170, c, { w: 52, h: 52 });
          s.text('cmpChL', 450, 128, 'ch', { size: 14, mono: true });
        }
      };

      if (chars.length) s.row('c', chars, o);
      else s.text('none', 280, 40, 'Your text is empty', { size: 15, tone: 'muted' });
      s.snap(cut ? 'Only the first 10 characters fit here, so this uses those.' : chars.length ? 'Here is your text. The stack starts empty.' : 'Your text has no characters, so the loop has nothing to read.', {
        line: 3, vars: vars(),
        ask: chars.length ? null : {
          q: 'Is a text with no brackets balanced?',
          options: ['No. There is nothing to check.', 'Yes. Nothing is left open.'],
          answer: 1,
          why: 'No bracket is open at the end, and none closed by mistake. So the empty text is fine.',
        },
      });

      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        clearMatch();
        pile.ids.forEach(id => s.tone(id, 'default'));
        if (i === 0) s.pointer('ptr', X(0), 62, 'ch', { dir: 'up' });
        else { s.set('ptr', { x: X(i) }); s.tone('c' + (i - 1), 'muted'); }
        s.tone('c' + i, 'active');

        if (opens.includes(c)) {
          if (!asked) {
            asked = true;
            s.snap(`ch is ${c}, an opening bracket.`, {
              line: 5, vars: vars(c),
              ask: {
                q: `What does the code do with ${c}?`,
                options: ['Throws it away', 'Pushes it on the stack', 'Answers False'],
                answer: 1,
                why: 'An opening bracket must wait for its partner. The stack keeps it until then.',
              },
            });
          }
          pile.push(c);
          s.snap(`${c} is an opening bracket, so it goes on the stack to wait.`, { line: 6, vars: vars(c) });
        } else if (closes.includes(c)) {
          lookAt(c);
          if (!pile.size()) {
            s.snap(`ch is ${c}, a closing bracket. The stack is empty.`, {
              line: 8, vars: vars(c),
              ask: {
                q: `${c} has nothing to close. What should the code do?`,
                options: ['Answer False right now', 'Skip it and read on', 'Push it on the stack'],
                answer: 0,
                why: 'No bracket is open, so this closing bracket can never find a partner.',
              },
            });
            finish(false, `Nothing is open, so ${c} has no partner. The answer is False.`, 9, 'bad');
            return;
          }
          const top = pile.peek(), good = partner[c] === top;
          pile.tone('warn');
          s.snap(`ch is ${c}, a closing bracket. Look at the top: it is ${top}.`, {
            line: 10, vars: vars(c),
            ask: {
              q: `Top is ${top} and ch is ${c}. Do they make a pair?`,
              options: ['Yes', 'No'],
              answer: good ? 0 : 1,
              why: good ? `${top} opens what ${c} closes.` : `${c} closes ${partner[c]}, but the most recent open bracket is ${top}.`,
            },
          });
          plate = pile.pop({ x: 370, y: 170, w: 52, h: 52, size: 19, tone: good ? 'ok' : 'bad' }).id;
          s.text('cmpTopL', 370, 128, 'top', { size: 14, mono: true });
          s.tone('cmpCh', good ? 'ok' : 'bad');
          s.text('cmpSay', 410, 222, good ? 'a pair' : 'not a pair', { size: 16, weight: 700 });
          if (!good) {
            s.snap(`${top} and ${c} do not pair up.`, { line: 11, vars: vars(c) });
            finish(false, `The brackets cross or do not match. The answer is False.`, 12, 'bad');
            return;
          }
          s.snap(`${top} and ${c} pair up. The top comes off, and the code reads on.`, { line: 11, vars: vars(c) });
        } else {
          s.snap(`${c} is not a bracket, so the code skips it.`, { line: 7, vars: vars(c) });
        }
      }

      clearMatch();
      if (chars.length) { s.del('ptr'); s.tone('c' + (chars.length - 1), 'muted'); }
      const left = pile.size(), ok = left === 0;
      if (chars.length) {
        s.snap(`The text is done. The stack holds ${left} ${left === 1 ? 'item' : 'items'}.`, {
          line: 13, vars: vars(),
          ask: {
            q: 'What does balanced give now?',
            options: ['True', 'False'],
            answer: ok ? 0 : 1,
            why: ok ? 'An empty stack means every bracket found its partner.' : 'Items left on the stack are open brackets that never closed.',
          },
        });
      }
      finish(ok, ok ? (chars.length ? 'The stack is empty, so every bracket found its partner.' : 'The stack is empty, so the answer is True.') : `${left} still ${left === 1 ? 'waits' : 'wait'} on the stack. They never closed, so the answer is False.`, 14, ok ? 'ok' : 'bad');
    },
  });

  Viz.register('m15-undo', {
    title: 'Undo takes the newest save',
    size: [560, 290],
    code: py`
      text = ""
      history = []
      for letter in word:
          history.append(text)
          text = text + letter
      for t in range(undos):
          if len(history) > 0:
              text = history.pop()
      print(text)
    `,
    inputs: [
      { key: 'word', label: 'Letters to type (up to 5)', type: 'text', value: 'cat' },
      { key: 'undos', label: 'How many undos', type: 'number', value: 2, min: 0, max: 6 },
    ],
    tryInputs: [
      { word: '', undos: 0 }, { word: '', undos: 3 }, { word: 'a', undos: 1 }, { word: 'aa', undos: 1 }, { word: 'hi', undos: 6 }, { word: 'elephant', undos: 2 },
    ],
    build(s, p) {
      const word = Array.from(String(p.word == null ? '' : p.word).replace(/\s+/g, '')).slice(0, 5);
      const undos = whole(p.undos, 0, 6);
      const pile = Viz.pile(s, { x: 130, floor: 252, w: 120, h: 38 });
      let text = '';
      const q = t => `"${t}"`;
      const vars = () => ({ text: q(text), history: pile.size() + ' saved' });
      s.text('name', 130, 22, 'history', { size: 15, mono: true });
      s.text('docl', 410, 60, 'text', { size: 15, mono: true });
      s.box('doc', 410, 102, q(text), { w: 170, h: 56 });
      s.snap('The text starts empty, and no saves are on the stack.', { line: 2, vars: vars() });
      if (!word.length) s.snap('There are no letters to type.', { line: 3, vars: vars() });
      word.forEach(letter => {
        s.tone('doc', 'default');
        pile.push(q(text));
        s.snap(`Before the change, the code saves ${q(text)} on the stack.`, { line: 4, vars: vars() });
        text += letter;
        s.set('doc', { text: q(text), tone: 'active' });
        s.snap(`Then ${letter} is added to the text.`, { line: 5, vars: vars() });
      });
      s.tone('doc', 'default');
      pile.ids.forEach(id => s.tone(id, 'default'));
      for (let t = 0; t < undos; t++) {
        s.tone('doc', 'default');
        const n = pile.size();
        if (n === 0) {
          s.snap('Undo runs, but the stack holds no saves.', {
            line: 7, vars: vars(),
            ask: {
              q: 'history is empty. What happens?',
              options: ['The if says no, so nothing changes', 'Python stops with an IndexError', 'The text goes blank'],
              answer: 0,
              why: 'The if line checks the length first. So pop never runs on an empty stack.',
            },
          });
          break;
        }
        const newest = pile.peek(), oldest = pile.values[0];
        const ask = n >= 2
          ? Object.assign({ q: 'Undo runs. Which save comes back?', why: 'Undo wants the most recent save, and that is on top. Last in, first out.' },
            t % 2 ? { options: [`${newest}, the newest`, `${oldest}, the oldest`], answer: 0 } : { options: [`${oldest}, the oldest`, `${newest}, the newest`], answer: 1 })
          : { q: 'One save is left. How many saves are there after this undo?', options: ['1', '0'], answer: 1, why: 'pop takes the save off the stack and hands it back.' };
        s.snap(`Undo runs. The text is ${q(text)} right now.`, { line: 8, vars: vars(), ask });
        pile.pop();
        text = newest.slice(1, -1);
        s.set('doc', { text: q(text), tone: 'active' });
        s.snap(`The newest save comes off. The text goes back to ${q(text)}.`, { line: 8, vars: vars() });
      }
      s.tone('doc', 'default');
      s.snap(undos ? `print shows ${q(text)}. Each undo takes back one step.` : `print shows ${q(text)}. No undo ran.`, { line: 9, vars: vars(), out: text });
    },
  });

  Viz.register('m15-line-sim', {
    title: 'A line that takes turns',
    size: [560, 270],
    code: py`
      from collections import deque
      line = deque(kids)
      while len(line) > 0:
          kid = line.popleft()
          kid[1] = kid[1] - 1
          if kid[1] > 0:
              line.append(kid)
          else:
              print(kid[0], "done")
    `,
    inputs: [
      { key: 'wants', label: 'Scoops each child wants (up to 4 children, 1 to 3 scoops)', type: 'text', value: '2 1 2' },
    ],
    tryInputs: [{ wants: '' }, { wants: '1' }, { wants: '3' }, { wants: '2 2 2' }, { wants: '3 3 3 3' }, { wants: 'x y' }, { wants: '0 9 -2' }, { wants: '1 1 1 1 1 1 1 1' }],
    build(s, p) {
      const nums = (String(p.wants == null ? '' : p.wants).match(/-?\d+/g) || []).slice(0, 4).map(v => whole(v, 1, 3));
      const names = ['A', 'B', 'C', 'D'];
      const y = 92;
      const SPOT = i => 180 + 86 * i;
      const line = nums.map((w, i) => ({ id: 'k' + i, name: names[i], left: w }));
      const sub = k => (k.left === 1 ? 'wants 1' : `wants ${k.left}`);
      const lines = [];
      let turns = 0, doneCount = 0;
      const place = () => line.forEach((k, i) => s.set(k.id, { x: SPOT(i), y }));
      const vars = () => ({ line: '[' + line.map(k => `[${k.name}, ${k.left}]`).join(', ') + ']', turns });
      const out = () => (lines.length ? lines.join('\n') : null);

      s.text('frontl', SPOT(0), 36, 'front of line', { size: 14, tone: 'muted' });
      s.text('servel', 66, 36, 'being served', { size: 14, tone: 'muted' });
      s.text('donel', 44, 218, 'done', { size: 14, tone: 'muted' });
      line.forEach((k, i) => s.box(k.id, SPOT(i), y, k.name, { w: 60, h: 52, sub: sub(k) }));
      if (!line.length) {
        s.text('none', 300, y, 'Nobody is in line', { size: 15, tone: 'muted' });
        s.snap('Nobody is in line, so the while loop never runs.', { line: 3, vars: vars() });
        s.snap('The program ends, and the screen stays empty.', { line: 3, vars: vars() });
        return;
      }
      s.snap('Each child gets 1 scoop per turn. Here people step up, but a deque slides nothing.', { line: 2, vars: vars() });
      while (line.length) {
        const k = line.shift();
        s.set(k.id, { x: 66, y, tone: 'active' });
        place();
        k.left -= 1;
        turns += 1;
        s.set(k.id, { sub: k.left ? sub(k) : 'wants 0' });
        const mine = k.left > 0;
        const ask = turns <= 2 || turns % 3 === 0 ? {
          q: `${k.name} now wants ${k.left} more. Where does ${k.name} go?`,
          options: turns % 2 ? ['To the back of the line', 'To the done row'] : ['To the done row', 'To the back of the line'],
          answer: mine === (turns % 2 === 1) ? 0 : 1,
          why: mine ? 'Scoops are still wanted, so the child goes to the back and waits for another turn.' : 'No more scoops are wanted, so the child leaves the line.',
        } : null;
        s.snap(`${k.name} comes off the front and takes 1 scoop.`, { line: 5, vars: vars(), out: out(), ask });
        s.tone(k.id, 'default');
        if (mine) {
          line.push(k);
          place();
          s.snap(`${k.name} still wants more, so ${k.name} goes to the back.`, { line: 7, vars: vars(), out: out() });
        } else {
          s.set(k.id, { x: 110 + 70 * doneCount, y: 218, w: 56, h: 40, sub: '', tone: 'ok' });
          doneCount += 1;
          lines.push(`${k.name} done`);
          s.snap(`${k.name} is done and leaves the line.`, { line: 9, vars: vars(), out: out() });
        }
      }
      s.snap(`The line is empty after ${turns} ${turns === 1 ? 'turn' : 'turns'}. That matches the total scoops.`, { line: 3, vars: vars(), out: out() });
    },
  });

  // ---------------------------------------------------------------- lesson 15.4
  Viz.register('m15-next-bigger', {
    title: 'Each number waits for a bigger one',
    size: [560, 410],
    code: py`
      answer = [-1] * len(nums)
      stack = []
      for i in range(len(nums)):
          n = nums[i]
          while (len(stack) > 0 and
                 nums[stack[-1]] < n):
              spot = stack.pop()
              answer[spot] = n
          stack.append(i)
      print(answer)
    `,
    inputs: [
      { key: 'nums', label: 'Your numbers (up to 6)', type: 'text', value: '3 1 2 5 4' },
    ],
    tryInputs: [
      { nums: '' }, { nums: '7' }, { nums: '2 2 2' }, { nums: '6 5 4 3 2 1' }, { nums: '1 2 3 4 5 6' }, { nums: 'x y z' }, { nums: '-5 -2 -9' },
      { nums: '1 2 3 4 5 6 7 8 9 10' }, { nums: '100000 99999' }, { nums: '3 3 5' },
    ],
    build(s, p) {
      const typed = String(p.nums == null ? '' : p.nums).match(/-?\d+/g) || [];
      const nums = typed.slice(0, 6).map(v => Math.max(-99, Math.min(999, Number(v))));
      const changed = typed.length > 6 || typed.slice(0, 6).some((v, i) => Number(v) !== nums[i]);
      const o = { y: 66, cell: 52, gap: 6, x: 300 };
      const X = i => s.slotX(i, nums.length, o);
      const answer = nums.map(() => -1);
      const pile = Viz.pile(s, { x: 130, floor: 372, w: 124, h: 28, gap: 4, size: 15 });
      const spots = [];
      let steps = 0, lastAsk = -9, frame = 0;
      const vars = extra => Object.assign({ stack: '[' + spots.join(', ') + ']', answer: '[' + answer.join(', ') + ']', steps }, extra);
      const snap = (say, opts) => {
        if (opts.ask) lastAsk = frame;
        frame += 1;
        s.snap(say, opts);
      };
      const free = () => frame - lastAsk >= 2;

      s.text('stackl', 130, 170, 'stack of waiting spots', { size: 14, tone: 'muted' });
      if (!nums.length) {
        s.snap('You gave no numbers, so the answer is an empty list.', { line: 1, vars: vars(), out: '[]' });
        return;
      }
      s.text('numsl', 44, 66, 'nums', { size: 15, mono: true });
      s.text('ansl', 44, 138, 'answer', { size: 15, mono: true });
      s.row('n', nums, o);
      nums.forEach((_, i) => s.box('a' + i, X(i), 138, -1, { w: 52, h: 36, size: 15, tone: 'muted' }));
      s.text('seen', 420, 214, '', { size: 16, weight: 700 });
      s.text('cnt', 420, 262, 'pushes + pops: 0', { size: 15 });
      snap(changed ? 'This picture keeps 6 numbers, from -99 to 999. Every answer starts at -1.' : 'Every answer starts at -1. That means no bigger number was found.', { line: 2, vars: vars() });

      const ptr = i => {
        if (s.has('ptr')) s.set('ptr', { x: X(i) });
        else s.pointer('ptr', X(i), 36, 'i', { dir: 'down' });
      };
      const count = () => s.set('cnt', { text: `pushes + pops: ${steps}` });
      const askFor = n => {
        const top = nums[spots[spots.length - 1]];
        const off = `${top} comes off. ${n} is its answer.`;
        const stay = `${n} goes on top. ${top} keeps waiting.`;
        const at = (frame % 2);
        const pops = top < n;
        return {
          q: `The top waits with ${top}. The new number is ${n}. What happens?`,
          options: at ? [stay, off] : [off, stay],
          answer: pops ? (at ? 1 : 0) : (at ? 0 : 1),
          why: pops ? `${n} is bigger than ${top}, so ${n} is the next bigger number for it.`
            : top === n ? `Equal is not bigger. So ${top} keeps waiting, and ${n} waits too.`
              : `${n} is smaller than ${top}, so it cannot answer for ${top}.`,
        };
      };

      nums.forEach((n, i) => {
        ptr(i);
        if (i > 0) s.tone('n' + (i - 1), spots.includes(i - 1) ? 'warn' : 'default');
        s.tone('n' + i, 'active');
        const has = spots.length > 0;
        s.set('seen', { text: has ? `${nums[spots[spots.length - 1]]} < ${n} ?` : '' });
        snap(has ? `The new number is ${n}. Compare it with the top of the stack.` : `The new number is ${n}. Nothing is waiting yet.`, {
          line: has ? 5 : 4, vars: vars({ i, n }), ask: has && free() ? askFor(n) : null,
        });
        while (spots.length && nums[spots[spots.length - 1]] < n) {
          const spot = spots.pop();
          pile.pop();
          answer[spot] = n;
          steps += 1;
          count();
          s.tone('n' + spot, 'default');
          s.set('a' + spot, { text: n, tone: 'ok' });
          const more = spots.length > 0;
          s.set('seen', { text: more ? `${nums[spots[spots.length - 1]]} < ${n} ?` : '' });
          snap(`${nums[spot]} comes off, and its answer is ${n}.`, {
            line: 8, vars: vars({ i, n }), ask: more && free() ? askFor(n) : null,
          });
        }
        spots.push(i);
        pile.push(`spot ${i}: ${n}`);
        steps += 1;
        count();
        s.set('seen', { text: '' });
        snap(`${n} goes on the stack and waits for something bigger.`, { line: 9, vars: vars({ i, n }) });
      });

      s.del('ptr', 'seen');
      nums.forEach((_, i) => s.tone('n' + i, spots.includes(i) ? 'warn' : 'default'));
      if (spots.length) {
        snap(`The list is done. ${spots.length} still ${spots.length === 1 ? 'waits' : 'wait'} on the stack.`, {
          line: 10, vars: vars(),
          ask: {
            q: 'What is the answer for a spot still on the stack?',
            options: ['The last number in the list', 'It stays -1', 'The number itself'],
            answer: 1,
            why: 'Nothing bigger ever came. So the -1 from the start stays there.',
          },
        });
      }
      snap(`${steps === 1 ? '1 number took 1 push' : `${nums.length} numbers took ${steps} pushes and pops`}. Each spot went on once and off at most once.`, {
        line: 10, vars: vars(), out: '[' + answer.join(', ') + ']',
      });
    },
  });
})();
