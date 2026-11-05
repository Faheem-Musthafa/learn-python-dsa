/* Visuals for module 12. Names start with the module id. */
(function () {
  /* Reads what a learner typed. Bad words are skipped, so a picture never crashes. */
  const parseNums = (text, most) => String(text == null ? '' : text)
    .replace(/[\[\]()]/g, ' ')
    .split(/[\s,]+/)
    .filter(x => x !== '')
    .map(Number)
    .filter(Number.isFinite)
    .map(v => Math.max(-99, Math.min(999, Math.trunc(v))))
    .slice(0, most);
  const show = a => '[' + a.join(', ') + ']';
  const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  /* Keeps the first copy of each option, then turns the list so the right answer moves around. */
  const quiz = (q, right, others, why) => {
    const list = [];
    [right].concat(others).forEach(o => { if (!list.includes(String(o))) list.push(String(o)); });
    const turn = (q + list.join('')).split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % list.length;
    return { q, why, options: list.slice(turn).concat(list.slice(0, turn)), answer: (list.length - turn) % list.length };
  };

  /* Bars share one look. Height shows the value, and the number sits on top. */
  const BASE = 186;
  const heightOf = nums => {
    const low = Math.min(...nums), high = Math.max(...nums);
    return v => (high === low ? 70 : 28 + ((v - low) / (high - low)) * 92);
  };
  const SORTED_TOP = 8, SORTED_H = 200;
  /* The sorted part sits in a soft box, so it is not shown by colour alone. */
  const markSorted = (s, x0, x1) => {
    if (s.has('sorted')) s.set('sorted', { x: x0, w: x1 - x0 });
    else s.area('sorted', x0, SORTED_TOP, x1 - x0, SORTED_H, 'sorted');
  };
  const nothing = (s, nums, line) => {
    if (!nums.length) {
      s.text('none', 280, 110, 'The list is empty.', { size: 18, weight: 600 });
      s.snap('The list is empty, so there is nothing to sort. Type some numbers above.', { line, vars: { comparisons: 0 }, out: '[]' });
      return true;
    }
    return false;
  };

  // ---------------------------------------------------------- lesson 12.1
  Viz.register('m12-selection', {
    title: 'Selection sort: find the smallest, then swap',
    size: [560, 250],
    code: py`
      n = len(a)
      for i in range(n - 1):
          smallest = i
          for j in range(i + 1, n):
              if a[j] < a[smallest]:
                  smallest = j
          a[i], a[smallest] = a[smallest], a[i]
      print(a)
    `,
    inputs: [
      { key: 'nums', label: 'a (up to 6 whole numbers)', type: 'text', value: '5 2 8 1 3', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '2 1' }, { nums: '4 4 4' }, { nums: '1 2 3 4 5 6' }, { nums: '6 5 4 3 2 1' }, { nums: '3 1 3 1 3 1' }, { nums: '-5 0 1000 2.5 x' }],
    build(s, p) {
      const a = parseNums(p.nums, 6);
      if (nothing(s, a, 8)) return;
      const n = a.length;
      const X = i => 280 + (i - (n - 1) / 2) * 76;
      const hOf = heightOf(a);
      const ids = a.map((_, i) => 'b' + i);
      const tagY = v => BASE - hOf(v) - 24; // The smallest tag rides just above the bar it names.
      let comps = 0, swaps = 0;
      const vars = extra => Object.assign({}, extra, { comparisons: comps, swaps });
      a.forEach((v, i) => {
        s.text('i' + i, X(i), BASE + 16, i, { size: 13, tone: 'muted', mono: true });
        s.bar('b' + i, X(i), BASE, hOf(v), v, { w: 48 });
      });
      s.snap(n === 1 ? 'Here is your number.' : 'Here are your numbers. Taller bars are bigger values.', { line: 1, vars: vars() });
      if (n === 1) {
        s.tone('b0', 'ok');
        s.snap('One item is already in order. The loop never runs.', { line: 8, vars: vars(), out: show(a) });
        return;
      }

      for (let i = 0; i < n - 1; i++) {
        let sm = i;
        s.pointer('m', X(i), tagY(a[i]), 'smallest', { dir: 'down', tone: 'warn' });
        s.tone(ids[i], 'warn');
        s.snap(`Pass ${i + 1}. So far, ${a[i]} is the smallest of the unsorted part.`, { line: 3, vars: vars({ i, smallest: i }) });

        for (let j = i + 1; j < n; j++) {
          if (j === i + 1 && i === 0) s.pointer('j', X(j), 212, 'j', { dir: 'up' });
          else s.set('j', { x: X(j) });
          s.tone(ids[j], 'active');
          comps += 1;
          const less = a[j] < a[sm];
          if (j === i + 1 && i <= 1) {
            s.snap(`j moves to spot ${j}. Python compares ${a[j]} with ${a[sm]}.`, {
              line: 5, vars: vars({ i, j, smallest: sm }),
              ask: quiz(`Is ${a[j]} smaller than ${a[sm]}?`, less ? 'Yes, so smallest moves' : 'No, so smallest stays', [less ? 'No, so smallest stays' : 'Yes, so smallest moves'],
                a[j] === a[sm] ? 'They are equal, and equal is not smaller.' : `${a[j]} is ${less ? 'smaller' : 'not smaller'} than ${a[sm]}.`),
            });
          }
          if (less) {
            const was = a[sm];
            s.tone(ids[sm], 'default');
            sm = j;
            s.tone(ids[j], 'warn');
            s.set('m', { x: X(j), y: tagY(a[j]) });
            s.snap(`Is ${a[j]} smaller than ${was}? Yes, so smallest moves to spot ${j}.`, { line: 6, vars: vars({ i, j, smallest: sm }) });
          } else {
            s.snap(`Is ${a[j]} smaller than ${a[sm]}? No, so smallest stays.`, { line: 5, vars: vars({ i, j, smallest: sm }) });
            s.tone(ids[j], 'default');
          }
        }

        const rest = a.slice(i);
        const uniq = [...new Set(rest)];
        if (i <= 2 && uniq.length > 1) {
          s.snap(`The pass has seen the whole unsorted part. Spot ${i} needs its item.`, {
            line: 7, vars: vars({ i, smallest: sm }),
            ask: quiz(`Which value goes into spot ${i}?`, a[sm], [a[i] === a[sm] ? Math.max(...rest) : a[i], Math.max(...rest)],
              `${a[sm]} is the smallest of the unsorted part. It belongs in spot ${i}.`),
          });
        }
        if (sm !== i) {
          s.swap(ids[i], ids[sm], 34);
          s.tone(ids[sm], 'default');
          s.tone(ids[i], 'default');
          [ids[i], ids[sm]] = [ids[sm], ids[i]];
          [a[i], a[sm]] = [a[sm], a[i]];
          swaps += 1;
        }
        s.tone(ids[i], 'ok');
        s.del('m');
        markSorted(s, X(0) - 38, X(i) + 38);
        s.snap(sm !== i ? `${a[i]} swaps into spot ${i}. It is now in its final place.` : `${a[i]} is already in spot ${i}, so nothing changes.`, { line: 7, vars: vars({ i }) });
      }

      s.del('j');
      s.tone(ids[n - 1], 'ok');
      markSorted(s, X(0) - 38, X(n - 1) + 38);
      s.snap(`The last item has nowhere else to go. That is ${count(comps, 'comparison')} and ${count(swaps, 'swap')}.`, { line: 8, vars: vars(), out: show(a) });
    },
  });

  Viz.register('m12-bubble', {
    title: 'Bubble sort: neighbours swap, and the biggest rises',
    size: [560, 250],
    code: py`
      n = len(a)
      for i in range(n - 1):
          swapped = False
          for j in range(n - 1 - i):
              if a[j] > a[j + 1]:
                  a[j], a[j + 1] = a[j + 1], a[j]
                  swapped = True
          if not swapped:
              break
      print(a)
    `,
    inputs: [
      { key: 'nums', label: 'a (up to 6 whole numbers)', type: 'text', value: '4 1 5 2', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '2 1' }, { nums: '4 4 4' }, { nums: '1 2 3 4 5 6' }, { nums: '6 5 4 3 2 1' }, { nums: '3 1 3 1 3 1' }, { nums: '-5 0 1000 2.5 x' }],
    build(s, p) {
      const a = parseNums(p.nums, 6);
      if (nothing(s, a, 10)) return;
      const n = a.length;
      const X = i => 280 + (i - (n - 1) / 2) * 76;
      const hOf = heightOf(a);
      const ids = a.map((_, i) => 'b' + i);
      let comps = 0, swaps = 0;
      const vars = extra => Object.assign({}, extra, { comparisons: comps, swaps });
      a.forEach((v, i) => {
        s.text('i' + i, X(i), BASE + 16, i, { size: 13, tone: 'muted', mono: true });
        s.bar('b' + i, X(i), BASE, hOf(v), v, { w: 48 });
      });
      s.snap(n === 1 ? 'Here is your number.' : 'Here are your numbers. Taller bars are bigger values.', { line: 1, vars: vars() });
      if (n === 1) {
        s.tone('b0', 'ok');
        s.snap('One item is already in order. The loop never runs.', { line: 10, vars: vars(), out: show(a) });
        return;
      }

      let sortedFrom = n;
      for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        s.snap(`Pass ${i + 1} starts. No swaps yet in this pass.`, {
          line: 3, vars: vars({ i, swapped: 'False' }),
          ask: i === 0 && new Set(a).size > 1 ? quiz('Which value will reach the far right in this pass?', Math.max(...a), [Math.min(...a), a[0] === Math.max(...a) ? a[n - 1] : a[0]],
            'The biggest value wins every comparison it is in. So it keeps moving right.') : null,
        });
        for (let j = 0; j < n - 1 - i; j++) {
          if (i === 0 && j === 0) s.pointer('j', X(0), 212, 'j', { dir: 'up' });
          else s.set('j', { x: X(j) });
          s.tone([ids[j], ids[j + 1]], 'active');
          comps += 1;
          const big = a[j] > a[j + 1];
          if (j === 0 && i <= 1 || (i === 0 && j === 2)) {
            s.snap(`j is ${j}. These neighbours are ${a[j]} and ${a[j + 1]}.`, {
              line: 5, vars: vars({ i, j, swapped: swapped ? 'True' : 'False' }),
              ask: quiz(`Do ${a[j]} and ${a[j + 1]} swap?`, big ? 'Yes' : 'No', [big ? 'No' : 'Yes'],
                big ? `${a[j]} is bigger, so it moves right.` : `${a[j]} is not bigger than ${a[j + 1]}, so they stay. Equal items never swap.`),
            });
          }
          if (big) {
            s.swap(ids[j], ids[j + 1], 30);
            [ids[j], ids[j + 1]] = [ids[j + 1], ids[j]];
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            swaps += 1;
            swapped = true;
            s.snap(`Is ${a[j + 1]} bigger than ${a[j]}? Yes, so they swap.`, { line: 6, vars: vars({ i, j, swapped: 'True' }) });
          } else {
            s.snap(`Is ${a[j]} bigger than ${a[j + 1]}? No, so they stay.`, { line: 5, vars: vars({ i, j, swapped: swapped ? 'True' : 'False' }) });
          }
          s.tone([ids[j], ids[j + 1]], 'default');
        }

        if (!swapped) {
          s.snap(`This pass made no swaps at all.`, {
            line: 8, vars: vars({ i, swapped: 'False' }),
            ask: quiz('What does a pass with no swaps tell you?', 'The list is already sorted', ['One more pass is needed', 'The list is too short'],
              'Every neighbour pair is in order, so the whole list is in order.'),
          });
          sortedFrom = 0;
          s.del('j');
          a.forEach((_, k) => s.tone(ids[k], 'ok'));
          markSorted(s, X(0) - 38, X(n - 1) + 38);
          s.snap('So break stops the loops early. That saves passes.', { line: 9, vars: vars({ i, swapped: 'False' }) });
          break;
        }
        const end = n - 1 - i;
        sortedFrom = end;
        s.tone(ids[end], 'ok');
        markSorted(s, X(end) - 38, X(n - 1) + 38);
        s.snap(`Pass ${i + 1} is done. ${a[end]} is now in its final place.`, { line: 8, vars: vars({ i, swapped: 'True' }) });
      }
      if (s.has('j')) s.del('j');
      if (sortedFrom !== 0) {
        s.tone(ids[0], 'ok');
        markSorted(s, X(0) - 38, X(n - 1) + 38);
      }
      s.snap(`Sorted, with ${count(comps, 'comparison')} and ${count(swaps, 'swap')}. Try a list already in order next.`, { line: 10, vars: vars(), out: show(a) });
    },
  });

  // ---------------------------------------------------------- lesson 12.2
  Viz.register('m12-insertion', {
    title: 'Insertion sort: slide each new card into place',
    size: [560, 250],
    code: py`
      for i in range(1, len(a)):
          held = a[i]
          j = i - 1
          while j >= 0 and a[j] > held:
              a[j + 1] = a[j]
              j = j - 1
          a[j + 1] = held
      print(a)
    `,
    inputs: [
      { key: 'nums', label: 'a (up to 6 whole numbers)', type: 'text', value: '5 2 8 1 3', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '2 1' }, { nums: '4 4 4' }, { nums: '1 2 3 4 5 6' }, { nums: '6 5 4 3 2 1' }, { nums: '1 2 3 5 4 6' }, { nums: '-5 0 1000 2.5 x' }],
    build(s, p) {
      const a = parseNums(p.nums, 6);
      if (nothing(s, a, 8)) return;
      const n = a.length;
      const X = i => 60 + i * 70;
      const HAND = 500;
      const hOf = heightOf(a);
      // spot[k] is the id of the bar in spot k. It is null while there is a gap there.
      const spot = a.map((_, i) => 'b' + i);
      let comps = 0, shifts = 0;
      const vars = extra => Object.assign({}, extra, { comparisons: comps, shifts });
      s.area('hand', HAND - 48, SORTED_TOP, 96, SORTED_H, 'hand');
      a.forEach((v, i) => {
        s.text('i' + i, X(i), BASE + 16, i, { size: 13, tone: 'muted', mono: true });
        s.bar('b' + i, X(i), BASE, hOf(v), v, { w: 46 });
      });
      s.snap(n === 1 ? 'Here is your number. Think of it as a card.' : 'Here are your numbers. Think of them as cards to pick up.', { line: 1, vars: vars() });
      s.tone('b0', 'ok');
      markSorted(s, X(0) - 35, X(0) + 35);
      s.snap('One card is always in order. So spot 0 starts as the sorted part.', { line: 1, vars: vars() });
      if (n === 1) {
        s.snap('There is nothing else to pick up.', { line: 8, vars: vars(), out: show(a) });
        return;
      }

      let asks = 0;
      for (let i = 1; i < n; i++) {
        const held = a[i];
        const heldId = spot[i];
        spot[i] = null;
        s.set(heldId, { x: HAND, tone: 'active' });
        s.snap(`Pick up ${held} and hold it. Its spot is now a gap.`, { line: 2, vars: vars({ i, held }) });

        // Work out where it lands, for the question.
        let land = i;
        while (land > 0 && a[land - 1] > held) land -= 1;
        if (asks < 3 && i <= 3) {
          asks += 1;
          s.snap(`The sorted part is ${show(a.slice(0, i))}. You hold ${held}.`, {
            line: 3, vars: vars({ i, held }),
            ask: quiz(`Which spot will ${held} land in?`, `Spot ${land}`, [`Spot ${(land + 1) % (i + 1)}`, `Spot ${i}`, 'Spot 0'],
              land === i ? `${a[i - 1]} is not bigger than ${held}, so nothing has to move.` : `Every card bigger than ${held} slides right. That frees spot ${land}.`),
          });
        }

        let j = i - 1;
        if (i === 1) s.pointer('j', X(j), 212, 'j', { dir: 'up' });
        else s.set('j', { x: X(j) });
        while (j >= 0) {
          s.set('j', { x: X(j) });
          comps += 1;
          if (a[j] > held) {
            const id = spot[j];
            s.set(id, { x: X(j + 1), tone: 'warn' });
            spot[j + 1] = id;
            spot[j] = null;
            a[j + 1] = a[j];
            shifts += 1;
            s.snap(`Is ${a[j]} bigger than ${held}? Yes, so ${a[j]} shifts right.`, { line: 5, vars: vars({ i, held, j }) });
            s.tone(id, 'ok');
            j -= 1;
          } else {
            s.snap(`Is ${a[j]} bigger than ${held}? No, so the search stops here.`, { line: 4, vars: vars({ i, held, j }) });
            break;
          }
        }
        if (j < 0) s.set('j', { x: X(0) });

        s.set(heldId, { x: X(j + 1), tone: 'ok' });
        spot[j + 1] = heldId;
        a[j + 1] = held;
        markSorted(s, X(0) - 35, X(i) + 35);
        s.snap(`${held} drops into spot ${j + 1}. Spots 0 to ${i} are now sorted.`, { line: 7, vars: vars({ i, held, j }) });
      }
      s.del('j');
      s.snap(`Sorted, with ${count(comps, 'comparison')} and ${count(shifts, 'shift')}. Try a list that is nearly in order.`, { line: 8, vars: vars(), out: show(a) });
    },
  });

  /* The same three sorts as the lessons, counting comparisons and moves. */
  const countSelection = list => {
    const a = list.slice();
    let c = 0, m = 0;
    for (let i = 0; i < a.length - 1; i++) {
      let sm = i;
      for (let j = i + 1; j < a.length; j++) { c += 1; if (a[j] < a[sm]) sm = j; }
      if (sm !== i) { [a[i], a[sm]] = [a[sm], a[i]]; m += 1; }
    }
    return { c, m };
  };
  const countBubble = list => {
    const a = list.slice();
    let c = 0, m = 0;
    for (let i = 0; i < a.length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < a.length - 1 - i; j++) {
        c += 1;
        if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; m += 1; swapped = true; }
      }
      if (!swapped) break;
    }
    return { c, m };
  };
  const countInsertion = list => {
    const a = list.slice();
    let c = 0, m = 0;
    for (let i = 1; i < a.length; i++) {
      const held = a[i];
      let j = i - 1;
      while (j >= 0) {
        c += 1;
        if (a[j] > held) { a[j + 1] = a[j]; m += 1; j -= 1; } else break;
      }
      a[j + 1] = held;
    }
    return { c, m };
  };

  Viz.register('m12-race', {
    title: 'A race on your list, counted in comparisons',
    size: [560, 268],
    inputs: [
      { key: 'nums', label: 'nums (up to 8 whole numbers)', type: 'text', value: '1 2 3 5 4 6', size: 16 },
    ],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '2 1' }, { nums: '4 4 4 4' }, { nums: '1 2 3 4 5 6 7 8' }, { nums: '8 7 6 5 4 3 2 1' }, { nums: '2 3 4 5 6 1' }, { nums: 'a b' }],
    build(s, p) {
      const a = parseNums(p.nums, 8);
      const n = a.length;
      const racers = [
        { key: 'sel', name: 'selection', x: 120, r: countSelection(a), moved: 'swap' },
        { key: 'bub', name: 'bubble', x: 280, r: countBubble(a), moved: 'swap' },
        { key: 'ins', name: 'insertion', x: 440, r: countInsertion(a), moved: 'shift' },
      ];
      const most = Math.max(1, ...racers.map(x => x.r.c));
      const floor = 204;
      const unit = 116 / Math.max(most, 8);
      const say = { n };
      if (n) s.row('v', a, { y: 34, cell: 40, gap: 6, index: false });
      else s.text('none', 280, 34, 'The list is empty.', { size: 16, weight: 600 });
      racers.forEach(x => {
        s.text('n' + x.key, x.x, floor + 16, x.name, { size: 15, weight: 600 });
        s.bar('b' + x.key, x.x, floor, 0, '?', { w: 70, tone: 'muted' });
      });
      s.snap('Three sorts race on your list. Taller bars mean more comparisons.', { vars: say });

      const words = count;
      const reveal = x => {
        s.set('b' + x.key, { h: x.r.c * unit, text: x.r.c, tone: 'active' });
        s.text('m' + x.key, x.x, floor + 42, words(x.r.m, x.moved), { size: 14, tone: 'muted' });
      };

      const [sel, bub, ins] = racers;
      const full = (n * (n - 1)) / 2;
      s.snap(`Selection sort goes first. It always scans the whole unsorted part.`, {
        vars: say,
        ask: quiz(`How many comparisons will selection make on ${words(n, 'item')}?`, sel.r.c, [Math.max(0, n - 1) + (full === n - 1 ? 1 : 0), n * n + 1],
          n < 2 ? 'With fewer than 2 items, there is nothing to compare.' : `It makes ${n - 1} + ... + 1 comparisons, and the order of the list changes nothing.`),
      });
      reveal(sel);
      s.snap(`Selection makes ${words(sel.r.c, 'comparison')}, in any order. It never stops early.`, { vars: say });
      s.tone('bsel', 'default');

      const cmp = (x, y) => (x < y ? 'Fewer' : x > y ? 'More' : 'The same');
      s.snap('Bubble sort is next. It can stop early if a pass makes no swaps.', {
        vars: say,
        ask: quiz('Will bubble make fewer comparisons than selection here?', cmp(bub.r.c, sel.r.c), ['Fewer', 'More', 'The same'],
          bub.r.c < sel.r.c ? 'A pass with no swaps stopped it early.' : 'It needed every pass on this list, so it never stopped early.'),
      });
      reveal(bub);
      s.snap(`Bubble makes ${words(bub.r.c, 'comparison')} and ${words(bub.r.m, 'swap')}.`, { vars: say });
      s.tone('bbub', 'default');

      s.snap('Insertion sort is last. Each new card stops as soon as it fits.', {
        vars: say,
        ask: quiz('Will insertion make fewer comparisons than bubble here?', cmp(ins.r.c, bub.r.c), ['Fewer', 'More', 'The same'],
          ins.r.c < bub.r.c ? 'Each card stops at the first card that is not bigger. Here most stop quickly.' : ins.r.c === bub.r.c ? 'On this list, every card had to look as far as bubble did.' : 'On this list, bubble stopped early and insertion had more to do.'),
      });
      reveal(ins);
      s.snap(`Insertion makes ${words(ins.r.c, 'comparison')} and ${words(ins.r.m, 'shift')}.`, { vars: say });
      s.tone('bins', 'default');

      const low = Math.min(sel.r.c, bub.r.c, ins.r.c);
      racers.forEach(x => { if (x.r.c === low) s.tone('b' + x.key, 'ok'); });
      const winners = racers.filter(x => x.r.c === low).map(x => x.name);
      s.snap(winners.length === 3 ? 'All three tie on comparisons. Look at the swaps and shifts too. Try another list.'
        : `Fewest comparisons: ${winners.join(' and ')}. Try a reversed list, then one nearly in order.`, { vars: say });
    },
  });

  // ---------------------------------------------------------- lesson 12.3
  Viz.register('m12-two-tools', {
    title: 'sorted makes a new list, and sort changes this one',
    size: [560, 276],
    code: py`
      a = nums
      b = sorted(a)
      print(a)
      print(b)
      x = a.sort()
      print(a)
      print(x)
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 5 whole numbers)', type: 'text', value: '3 1 2', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '2 2 1' }, { nums: '1 2 3 4 5' }, { nums: 'x' }],
    build(s, p) {
      const a = parseNums(p.nums, 5);
      const n = a.length;
      const order = a.slice().sort((u, v) => u - v);
      const y1 = 50, y2 = 140, y3 = 230;
      const opt = y => ({ x: 340, y, index: false, cell: 52, gap: 6 });
      const tag = { w: 46, h: 40, tone: 'accent' };
      const empty = (id, y) => s.box(id, 340, y, '[]', { w: 64, h: 52 });
      const firstA = n ? 'A0' : 'Ae', firstB = n ? 'B0' : 'Be';
      const vars = extra => Object.assign({ a: show(a) }, extra);

      if (n) s.row('A', a, opt(y1));
      else empty('Ae', y1);
      s.box('ta', 80, y1, 'a', tag);
      s.edge('ea', 'ta', firstA);
      s.snap('a is a name tag on your list.', { line: 1, vars: vars() });

      s.snap('Next, sorted(a) runs.', {
        line: 2, vars: vars(),
        ask: quiz('What happens to the list that a names?', 'It stays as it was', ['It gets sorted too', 'It goes away'],
          'sorted makes a new list. It only reads the old one.'),
      });
      if (n) s.row('B', order, opt(y2));
      else empty('Be', y2);
      s.box('tb', 80, y2, 'b', tag);
      s.edge('eb', 'tb', firstB);
      s.tone(order.map((_, i) => 'B' + i), 'active');
      s.snap('sorted makes a new list in order. The tag b goes on it.', { line: 2, vars: vars({ b: show(order) }) });
      s.tone(order.map((_, i) => 'B' + i), 'default');

      let out = show(a);
      s.snap('print(a) shows your first list, in its old order.', { line: 3, vars: vars({ b: show(order) }), out });
      out += '\n' + show(order);
      s.snap('print(b) shows the new list.', { line: 4, vars: vars({ b: show(order) }), out });

      s.snap('Next, x = a.sort() runs.', {
        line: 5, vars: vars({ b: show(order) }), out,
        ask: quiz('What will x hold?', 'None', ['The sorted list', 'A copy of b'],
          'sort changes the list in place, and hands back None. So it works like append.'),
      });
      // Each box glides to its place in order. Ties keep their first order, as a stable sort must.
      const places = a.map((v, i) => ({ v, i })).sort((u, v) => u.v - v.v || u.i - v.i);
      places.forEach((item, to) => {
        s.set('A' + item.i, { x: s.slotX(to, n, opt(y1)), tone: 'active' });
      });
      s.set('ea', { to: n ? 'A' + places[0].i : 'Ae' });
      s.box('tx', 80, y3, 'x', tag);
      s.box('none', 340, y3, 'None', { w: 92, h: 48, tone: 'muted' });
      s.edge('ex', 'tx', 'none');
      s.snap('The list itself changes. No new list appears, and x gets None.', { line: 5, vars: { a: show(order), b: show(order), x: 'None' }, out });

      places.forEach(item => s.tone('A' + item.i, 'default'));
      out += '\n' + show(order);
      s.snap('print(a) now shows the list in order.', { line: 6, vars: { a: show(order), b: show(order), x: 'None' }, out });
      out += '\nNone';
      s.snap('print(x) shows None. So never write a = a.sort().', { line: 7, vars: { a: show(order), b: show(order), x: 'None' }, out });
    },
  });

  Viz.register('m12-stable', {
    title: 'Items that tie stay in line order',
    size: [560, 245],
    code: py`
      def grade(kid):
          return kid[1]

      kids.sort(key=grade, reverse=flip)
      print(kids)
    `,
    inputs: [
      { key: 'grades', label: 'grades (up to 6 numbers, 0 to 9)', type: 'text', value: '2 1 2 1', size: 14 },
      { key: 'flip', label: 'reverse', type: 'select', value: 'False', options: ['False', 'True'] },
    ],
    tryInputs: [{ grades: '' }, { grades: '3' }, { grades: '1 1 1 1' }, { grades: '1 2 3 4 5 6' }, { grades: '5 5 1 1 5 1', flip: 'True' }, { grades: 'x', flip: 'True' }],
    build(s, p) {
      const NAMES = ['Ann', 'Bo', 'Cy', 'Di', 'Eva', 'Fay'];
      const grades = parseNums(p.grades, 6).map(v => Math.max(0, Math.min(9, v)));
      const flip = String(p.flip) === 'True';
      const n = grades.length;
      const kids = grades.map((g, i) => ({ name: NAMES[i], g, i, id: 'k' + i }));
      const W = 80, GAP = 6;
      const X = i => 280 + (i - (n - 1) / 2) * (W + GAP);
      const y1 = 70, y2 = 184;
      const tuple = k => `("${k.name}", ${k.g})`;
      const list = a => '[' + a.map(k => `('${k.name}', ${k.g})`).join(', ') + ']';
      const vars = { flip: flip ? 'True' : 'False' };

      s.text('top', 20, y1 - 46, 'first line', { size: 14, weight: 600, anchor: 'start' });
      s.text('low', 20, y2 - 48, 'sorted line', { size: 14, weight: 600, anchor: 'start' });
      if (!n) {
        s.snap('The list is empty, so sort has nothing to do.', { line: 4, vars });
        s.snap('It still works. print shows an empty list.', { line: 5, vars, out: '[]' });
        return;
      }
      kids.forEach(k => {
        s.box(k.id, X(k.i), y1, `${k.name} ${k.g}`, { w: W, h: 48, size: 16 });
        s.text('p' + k.i, X(k.i), y1 + 38, k.i, { size: 13, tone: 'muted', mono: true });
      });
      s.snap(`Kids stand in a line. Each one has a name and a grade, like ${tuple(kids[0])}.`, { line: 0, vars });

      s.snap('Python calls grade on each kid. That answer is what it compares.', {
        line: 2, vars,
        ask: quiz('What does the key make sort compare?', 'Only the grades', ['Only the names', 'Names and grades'],
          'The key function hands back the grade, so names play no part in the order.'),
      });

      const order = kids.slice().sort((u, v) => (flip ? v.g - u.g : u.g - v.g) || u.i - v.i);
      const tied = order.findIndex((k, i) => i > 0 && order[i - 1].g === k.g);
      let asked = false;
      order.forEach((k, to) => {
        if (to === tied - 1 && !asked) {
          const other = order[tied];
          asked = true;
          s.tone([k.id, other.id], 'warn');
          s.snap(`${k.name} and ${other.name} both have grade ${k.g}. That is a tie.`, {
            line: 4, vars,
            ask: quiz(`Who goes first in the sorted line?`, `${k.name}, who was first in line`, [`${other.name}, who was later in line`, 'Python picks at random'],
              'Python keeps tied items in the order they came. It never mixes them.'),
          });
        }
        s.tone(k.id, 'active');
        s.set(k.id, { x: X(to), y: y2 });
        s.text('q' + to, X(to), y2 + 38, to, { size: 13, tone: 'muted', mono: true });
        s.snap(`${k.name} goes to spot ${to}, with grade ${k.g}.`, { line: 4, vars });
        s.tone(k.id, 'default');
      });
      s.snap(flip ? 'Ties still keep their line order, even with reverse=True. Try other grades.' : 'Ties kept their line order. Now set reverse to True and look again.', { line: 5, vars, out: list(order) });
    },
  });
})();
