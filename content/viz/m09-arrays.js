/* Visuals for module 9. Names start with the module id. */
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
  const whole = (v, low, high, dflt) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(low, Math.min(high, n)) : dflt;
  };
  /* Keeps the first copy of each option, and finds where the right answer ended up. */
  const choices = (right, others) => {
    const list = [];
    [right].concat(others).forEach(o => { if (!list.includes(String(o))) list.push(String(o)); });
    // Turn the list by an amount taken from its words, so the right answer is not always first.
    const turn = list.join('').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % list.length;
    return { options: list.slice(turn).concat(list.slice(0, turn)), answer: (list.length - turn) % list.length };
  };
  const quiz = (q, right, others, why) => Object.assign(choices(right, others), { q, why });

  // ---------------------------------------------------------- lesson 9.1
  Viz.register('m09-jump', {
    title: 'One sum finds any spot',
    size: [560, 230],
    code: py`
      print(len(nums))
      print(nums[k])
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 whole numbers)', type: 'text', value: '40 15 72 8 33', size: 14 },
      { key: 'k', label: 'k', type: 'number', value: 3, min: -7, max: 7 },
    ],
    tryInputs: [{ nums: '', k: 0 }, { nums: '7', k: 0 }, { nums: '7', k: 1 }, { nums: '5 5 5', k: -1 }, { nums: '1 2 3', k: -4 }, { nums: 'cat', k: 2 }],
    build(s, p) {
      const nums = parseNums(p.nums, 6);
      const k = whole(p.k, -7, 7, 0);
      const n = nums.length;
      const o = { x: 310, y: 120 };
      const X = i => s.slotX(i, n, o);
      const start = 100;
      let steps = 0;
      const vars = () => ({ k, 'len(nums)': n, sums: steps });
      let out = String(n);

      if (n) {
        s.row('v', nums, o);
        nums.forEach((_, i) => s.text('d' + i, X(i), 82, start + i, { size: 13, tone: 'muted', mono: true }));
        s.text('dl', 62, 82, 'memory', { size: 13, tone: 'muted' });
        s.text('il', 62, 162, 'index', { size: 13, tone: 'muted' });
      } else {
        s.box('none', 310, 120, '[]', { w: 76, h: 52, tone: 'muted' });
      }
      s.text('sum', 310, 206, '', { size: 17, mono: true, weight: 700 });
      s.snap(n ? 'Your list sits in memory, in spots side by side.' : 'Your list is empty. It has no spots at all.', { line: 0, vars: vars() });
      s.snap(`The list keeps its own count, so len reads ${n} at once.`, { line: 1, vars: vars(), out });

      const at = k < 0 ? k + n : k;
      const inside = at >= 0 && at < n;
      if (k < 0 && n) {
        s.set('sum', { text: `${k} + ${n} = ${at}` });
        s.snap(`k is below 0, so Python adds the length first. That gives ${at}.`, { line: 2, vars: vars(), out });
      }
      if (!inside) {
        const ask = quiz(`Can Python read nums[${k}] in this list?`, 'No. There is no such spot.', ['Yes. It gives the nearest item.'],
          'Python checks the index against the length first. A spot outside the row does not exist.');
        s.snap(`The list has ${n} items. Now nums[${k}] runs.`, { line: 2, vars: vars(), out, ask });
        out += '\nIndexError';
        s.set('sum', { text: 'no such spot' });
        s.snap('Python stops with an IndexError. Try another k above.', { line: 2, vars: vars(), out });
        return;
      }

      s.snap(`The row starts at memory spot ${start}. Python wants index ${at}.`, {
        line: 2, vars: vars(), out,
        ask: quiz(`Which memory spot holds index ${at}?`, `Spot ${start + at}`, [`Spot ${start + at + 1}`, 'Python must walk there to find out'],
          `All spots are the same size, so ${start} + ${at} gives the place. No walking.`),
      });
      steps = 1;
      s.set('sum', { text: `${start} + ${at} = ${start + at}` });
      s.snap('Python does one sum. It looks at no other items.', { line: 2, vars: vars(), out });

      s.pointer('ptr', X(at), 66, `nums[${k}]`, { dir: 'down' });
      s.tone('v' + at, 'active');
      out += '\n' + nums[at];
      s.snap(`It jumps straight there and reads ${nums[at]}. That took 1 sum.`, { line: 2, vars: vars(), out });

      s.tone('v' + at, 'ok');
      s.snap('Any spot takes 1 sum, near or far. Pick another k above.', { line: 2, vars: vars(), out });
    },
  });

  Viz.register('m09-grow', {
    title: 'A full row moves to a bigger row',
    size: [560, 215],
    note: 'This picture doubles the row, so the counting stays plain. Python keeps spare room too, but its own amount is different.',
    code: py`
      nums = []
      for i in range(adds):
          nums.append(i)
      print(len(nums))
    `,
    inputs: [
      { key: 'adds', label: 'adds', type: 'number', value: 5, min: 1, max: 8 },
    ],
    tryInputs: [{ adds: 1 }, { adds: 2 }, { adds: 4 }, { adds: 8 }],
    build(s, p) {
      const adds = whole(p.adds, 1, 8, 5);
      const y1 = 70, y2 = 170;
      const X = i => 74 + 58 * i;
      let room = 1, used = 0, moves = 0;
      const vars = () => ({ 'len(nums)': used, room, moves });
      const spare = (row, from, to, y) => { for (let i = from; i < to; i++) s.box(`e${row}x${i}`, X(i), y, '', { tone: 'muted' }); };
      let row = 0;

      s.text('rlabel', 20, 28, 'the row', { size: 14, weight: 600, anchor: 'start' });
      spare(row, 0, room, y1);
      s.snap('nums starts empty. Its row has room for 1 item.', { line: 1, vars: vars() });

      for (let i = 0; i < adds; i++) {
        if (used === room) {
          const asked = room === 1
            ? quiz('The row is full, and the next locker may be in use. What can the list do?',
              'Get a bigger row and move over', ['Write over an old item', 'Stop with an error'],
              'The items must stay side by side. So the list gets a bigger row in another part of memory.')
            : quiz('The row is full again. How many items must move this time?', String(used), ['1', String(used + 1)],
              `Every item must go to the new row, and there are ${used} items.`);
          s.snap(room === 1 ? `i is ${i}, but the only spot is full.` : `i is ${i}, but all ${room} spots are full.`, { line: 3, vars: vars(), ask: asked });

          room = room * 2;
          row += 1;
          s.text('nlabel', 20, 128, 'new, bigger row', { size: 14, weight: 600, anchor: 'start' });
          spare(row, 0, room, y2);
          s.snap(`The list gets a new row with room for ${room}.`, { line: 3, vars: vars() });

          for (let j = 0; j < used; j++) {
            s.del(`e${row}x${j}`);
            s.set(`v${j}`, { y: y2, tone: 'warn' });
            s.box(`old${j}`, X(j), y1, '', { tone: 'muted' });
            moves += 1;
            s.snap(`Item ${j} moves to the new row. That is ${count(moves, 'move')} so far.`, { line: 3, vars: vars() });
            s.tone(`v${j}`, 'default');
          }

          for (let j = 0; j < used; j++) { s.del(`old${j}`); s.set(`v${j}`, { y: y1 }); }
          for (let j = used; j < room; j++) s.set(`e${row}x${j}`, { y: y1 });
          s.del('nlabel');
          s.snap('The old row is free now. The new row takes its place.', { line: 3, vars: vars() });
        }

        const ask = i === 0 ? quiz('A spot is free. How many other items must move for this append?', '0', ['1'],
          'The new item drops into the free spot. Nothing else needs to change.') : null;
        if (ask) s.snap('append is about to add the first item.', { line: 3, vars: vars(), ask });
        s.del(`e${row}x${used}`);
        s.box(`v${used}`, X(used), y1, i, { tone: 'active' });
        used += 1;
        s.snap(`append puts ${i} in a free spot. No other item moves.`, { line: 3, vars: vars() });
        s.tone(`v${used - 1}`, 'default');
      }

      s.snap(`${count(adds, 'append')} needed ${count(moves, 'move')} in all. Most appends move nothing.`, {
        line: 4, vars: vars(), out: String(adds),
      });
    },
  });

  // ---------------------------------------------------------- lesson 9.2
  Viz.register('m09-shift', {
    title: 'No gaps allowed, so items must move',
    size: [560, 210],
    code: py`
      nums.insert(at, 99)
      print(nums)
      nums.pop(at)
      print(nums)
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 whole numbers)', type: 'text', value: '10 20 30 40', size: 14 },
      { key: 'at', label: 'at', type: 'number', value: 0, min: 0, max: 8 },
    ],
    tryInputs: [{ nums: '', at: 0 }, { nums: '5', at: 0 }, { nums: '5', at: 1 }, { nums: '5', at: 4 }, { nums: '2 2 2', at: 1 }, { nums: '1 2 3 4 5 6', at: 0 }, { nums: '1 2 3 4 5 6', at: 6 }, { nums: 'hi', at: 8 }],
    build(s, p) {
      const nums = parseNums(p.nums, 6);
      const at = whole(p.at, 0, 8, 0);
      const n = nums.length;
      const X = i => 106 + 58 * i;
      const y = 120;
      // items holds the id of the box in each spot, so duplicate values cause no trouble.
      const items = nums.map((v, i) => {
        s.box('v' + i, X(i), y, v);
        return { id: 'v' + i, v };
      });
      const idx = i => { if (!s.has('i' + i)) s.text('i' + i, X(i), y + 42, i, { size: 13, tone: 'muted', mono: true }); };
      items.forEach((_, i) => idx(i));
      const list = () => show(items.map(x => x.v));
      let moves = 0, out = '';
      const vars = () => ({ at, moves, nums: list() });

      s.text('il', 46, y + 42, 'index', { size: 13, tone: 'muted' });
      s.snap(n ? 'Items sit side by side, with no gaps.' : 'The list is empty. It has no items at all.', { line: 0, vars: vars() });

      const place = Math.min(at, n);
      const moving = n - place;
      s.snap(at > n ? `at is ${at}, past the end. So insert uses the end.` : `Next, insert must free spot ${place}.`, {
        line: 1, vars: vars(),
        ask: quiz(`How many items must move to free spot ${place}?`, String(moving), [String(moving + 1), '1', '0'],
          moving === 0 ? `Spot ${place} is already free at the end. Nothing needs to move.` : `Every item from spot ${place} onward moves one spot right. That is ${moving}.`),
      });

      // The last item moves first, so nothing gets written over.
      for (let i = n - 1; i >= place; i--) {
        s.set(items[i].id, { x: X(i + 1), tone: 'warn' });
        idx(i + 1);
        moves += 1;
        s.snap(`${items[i].v} moves from spot ${i} to spot ${i + 1}.`, { line: 1, vars: vars() });
        s.tone(items[i].id, 'default');
      }

      idx(place);
      s.box('new', X(place), y, 99, { tone: 'active' });
      items.splice(place, 0, { id: 'new', v: 99 });
      const inserted = moves;
      s.snap(`99 goes into spot ${place}. That took ${count(inserted, 'move')}.`, { line: 1, vars: vars() });
      s.tone('new', 'default');
      out = list();
      s.snap('print shows the list as it is now.', { line: 2, vars: vars(), out });

      if (at >= items.length) {
        s.snap(`Next, nums.pop(${at}) runs.`, {
          line: 3, vars: vars(), out,
          ask: quiz(`The list has spots 0 to ${items.length - 1}. What does pop(${at}) do?`, 'It stops with an IndexError', ['It takes the last item'],
            'insert forgives a number past the end. pop does not, because there is nothing there to take.'),
        });
        out += '\nIndexError';
        s.snap('Python stops with an IndexError. Try a smaller at above.', { line: 3, vars: vars(), out });
        return;
      }

      moves = 0;
      const left = items.length - at - 1;
      s.snap(`Next, nums.pop(${at}) takes the item in spot ${at}.`, {
        line: 3, vars: vars(), out,
        ask: quiz('How many items must move to close the gap?', String(left), [String(left + 1), String(at), '0'],
          left === 0 ? 'That was the last item, so no gap is left.' : `Every item after spot ${at} moves one spot left. That is ${left}.`),
      });
      const gone = items[at];
      s.tone(gone.id, 'bad');
      s.set(gone.id, { y: 44 });
      s.snap(`pop lifts out ${gone.v}. It leaves a gap in spot ${at}.`, { line: 3, vars: vars(), out });
      s.del(gone.id);
      items.splice(at, 1);

      for (let i = at; i < items.length; i++) {
        s.set(items[i].id, { x: X(i), tone: 'warn' });
        moves += 1;
        s.snap(`${items[i].v} moves from spot ${i + 1} to spot ${i}.`, { line: 3, vars: vars(), out });
        s.tone(items[i].id, 'default');
      }
      s.del('i' + items.length);
      out += '\n' + list();
      s.snap(`Insert took ${count(inserted, 'move')}, and pop took ${moves}. Try another at above.`, { line: 4, vars: vars(), out });
    },
  });

  Viz.register('m09-walk', {
    title: 'x in nums walks along the list',
    size: [560, 190],
    code: py`
      looks = 0
      found = False
      for x in nums:
          looks = looks + 1
          if x == target:
              found = True
              break
      print(found, looks)
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 whole numbers)', type: 'text', value: '40 15 72 8 33', size: 14 },
      { key: 'target', label: 'target', type: 'number', value: 8, min: -99, max: 999 },
    ],
    tryInputs: [{ nums: '', target: 1 }, { nums: '4', target: 4 }, { nums: '4', target: 5 }, { nums: '6 6 6', target: 6 }, { nums: '1 2 3 4 5 6', target: 9 }, { nums: 'dog', target: 0 }],
    build(s, p) {
      const nums = parseNums(p.nums, 6);
      const target = whole(p.target, -99, 999, 0);
      const n = nums.length;
      const o = { y: 100 };
      const X = i => s.slotX(i, n, o);
      let looks = 0;
      const vars = extra => Object.assign({ target, looks }, extra);

      if (!n) {
        s.box('none', 280, 100, '[]', { w: 76, h: 52, tone: 'muted' });
        s.snap('The list is empty. The loop has nothing to look at.', {
          line: 3, vars: vars({ found: 'False' }),
          ask: quiz('How many looks will this take?', '0', ['1', 'Python stops with an error'], 'There are no items, so the loop never runs. An empty list is fine here.'),
        });
        s.snap('So the answer is False, after 0 looks.', { line: 8, vars: vars({ found: 'False' }), out: 'False 0' });
        return;
      }

      s.row('v', nums, o);
      s.snap(`You want to know if ${target} is in the list.`, {
        line: 1, vars: vars({ found: 'False' }),
        ask: quiz(`Can Python jump straight to the ${target}?`, 'No. It must look at the items.', ['Yes, with one sum'],
          'A jump needs the spot number. Here you know the value, but not its spot.'),
      });

      let found = false;
      for (let i = 0; i < n && !found; i++) {
        if (i === 0) s.pointer('ptr', X(0), 64, 'x', { dir: 'down' });
        else s.set('ptr', { x: X(i) });
        looks += 1;
        s.tone('v' + i, 'active');
        const ask = i === 1 ? quiz(`x is ${nums[1]}. Is it the one you want?`,
          nums[1] === target ? 'Yes, so the loop stops' : 'No, so the loop goes on',
          [nums[1] === target ? 'No, so the loop goes on' : 'Yes, so the loop stops'],
          `Python asks if ${nums[1]} == ${target}. The answer is ${nums[1] === target ? 'True' : 'False'}.`) : null;
        s.snap(`Look number ${looks}: x is ${nums[i]}.`, { line: 4, vars: vars({ x: nums[i] }), ask });

        if (nums[i] === target) {
          found = true;
          s.tone('v' + i, 'ok');
          s.snap(`${nums[i]} == ${target} is True. The loop can stop now.`, { line: 7, vars: vars({ x: nums[i], found: 'True' }) });
        } else {
          s.tone('v' + i, 'muted');
          s.snap(`${nums[i]} == ${target} is False, so Python moves on.`, { line: 5, vars: vars({ x: nums[i] }) });
        }
      }
      if (found) {
        s.snap(`It found ${target} after ${count(looks, 'look')}. Now try a number that is not there.`, { line: 8, vars: vars({ found: 'True' }), out: `True ${looks}` });
      } else {
        s.del('ptr');
        s.snap(`${target} is not there. Python had to check every item, so that took ${count(looks, 'look')}.`, { line: 8, vars: vars({ found: 'False' }), out: `False ${looks}` });
      }
    },
  });

  // ---------------------------------------------------------- lesson 9.3
  Viz.register('m09-reverse', {
    title: 'Reverse a list from both ends',
    size: [560, 205],
    code: py`
      left = 0
      right = len(a) - 1
      while left < right:
          a[left], a[right] = a[right], a[left]
          left = left + 1
          right = right - 1
      print(a)
    `,
    inputs: [
      { key: 'nums', label: 'a (up to 6 whole numbers)', type: 'text', value: '1 2 3 4 5', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '7 8' }, { nums: '3 3 3 3' }, { nums: '1 2 3 4 5 6' }, { nums: 'x y' }],
    build(s, p) {
      const nums = parseNums(p.nums, 6);
      const n = nums.length;
      const o = { y: 100 };
      const X = i => s.slotX(i, n, o);
      let left = 0, right = n - 1, swaps = 0;
      const ids = nums.map((_, i) => 'v' + i);
      const vars = () => ({ left, right, swaps });

      if (n) s.row('v', nums, o);
      else s.box('none', 280, 100, '[]', { w: 76, h: 52, tone: 'muted' });
      s.snap(n ? 'Here is your list. There is no second list.' : 'The list is empty, so right starts at -1.', { line: 1, vars: vars() });
      if (n) {
        s.pointer('L', X(0), 62, 'left', { dir: 'down' });
        s.pointer('R', X(n - 1), 154, 'right', { dir: 'up', tone: 'warn' });
        s.snap('left starts at the first spot. right starts at the last spot.', { line: 2, vars: vars() });
      }

      let first = true;
      while (left < right) {
        s.tone([ids[left], ids[right]], 'active');
        const ask = first ? quiz(`left is ${left} and right is ${right}. What happens to the items at those spots?`,
          'They trade places', ['Both get copied to a new list', 'The first one is lost'],
          'The swap line works out the right side first, so both values stay safe.') : null;
        s.snap(`Is ${left} < ${right}? Yes, so the loop goes on.`, { line: 3, vars: vars(), ask });
        first = false;

        s.swap(ids[left], ids[right], 40);
        [ids[left], ids[right]] = [ids[right], ids[left]];
        [nums[left], nums[right]] = [nums[right], nums[left]];
        swaps += 1;
        s.snap(`The items trade places. That is swap number ${swaps}.`, { line: 4, vars: vars() });

        s.tone([ids[left], ids[right]], 'ok');
        left += 1;
        right -= 1;
        if (left < n && right >= 0) {
          s.set('L', { x: X(left) });
          s.set('R', { x: X(right) });
        }
        const stopNext = left >= right;
        s.snap('Both ends are done. left and right each step inward.', {
          line: 6, vars: vars(),
          ask: stopNext ? quiz(`left is ${left} and right is ${right}. Does the loop run again?`, 'No, it stops', ['Yes, one more time'],
            left === right ? 'They meet at the middle item, and it is already in the right place.' : 'left has passed right, so every pair has been swapped.') : null,
        });
      }

      s.snap(n > 1 ? 'left is no longer below right, so the loop ends.' : `left is ${left} and right is ${right}.`, {
        line: 3, vars: vars(),
        ask: n > 1 ? null : quiz('Does the loop run at all?', 'No, there is nothing to swap', ['Yes, one time'],
          'left is not below right, so the loop never runs. A list this short is already reversed.'),
      });
      nums.forEach((_, i) => { if (n) s.tone(ids[i], 'ok'); });
      s.snap(`${count(n, 'item')} took ${count(swaps, 'swap')}. Try a list with an odd count, then an even one.`, { line: 7, vars: vars(), out: show(nums) });
    },
  });

  Viz.register('m09-keep', {
    title: 'Remove duplicates with a write index',
    size: [560, 215],
    code: py`
      seen = set()
      w = 0
      for x in nums:
          if x not in seen:
              seen.add(x)
              nums[w] = x
              w = w + 1
      while len(nums) > w:
          nums.pop()
      print(nums)
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 whole numbers)', type: 'text', value: '3 1 3 2 1', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '4' }, { nums: '2 2 2 2' }, { nums: '1 2 3' }, { nums: '5 1 5 1 5 1' }, { nums: 'none' }],
    build(s, p) {
      const nums = parseNums(p.nums, 6);
      const n = nums.length;
      const o = { y: 100 };
      const X = i => s.slotX(i, n, o);
      const seen = [];
      let w = 0;
      const shown = () => (seen.length ? '{' + seen.join(', ') + '}' : 'empty');
      const vars = extra => Object.assign({ w, seen: shown() }, extra);

      if (!n) {
        s.box('none', 280, 100, '[]', { w: 76, h: 52, tone: 'muted' });
        s.snap('The list is empty, so there is nothing to clean.', {
          line: 3, vars: vars(),
          ask: quiz('How many trips will the loop make?', '0', ['1', 'It stops with an error'], 'There are no items to read, so the loop never runs.'),
        });
        s.snap('The loop never runs. The list stays empty.', { line: 10, vars: vars(), out: '[]' });
        return;
      }

      s.row('v', nums, o);
      s.pointer('W', X(0), 154, 'w', { dir: 'up', tone: 'warn' });
      s.snap('w marks the next spot to write. Everything before w is kept.', { line: 2, vars: vars() });

      nums.forEach((x, r) => {
        if (r === 0) s.pointer('R', X(0), 62, 'x', { dir: 'down' });
        else s.set('R', { x: X(r) });
        s.tone('v' + r, 'active');
        const isNew = !seen.includes(x);
        const ask = (r > 0 && r % 2 === 0) || (r > 0 && !isNew) ? quiz(`x is ${x}. What happens to w?`,
          isNew ? `${x} is new, so w moves on` : `${x} was seen, so w stays`,
          [isNew ? `${x} was seen, so w stays` : `${x} is new, so w moves on`],
          isNew ? 'It is not in seen, so it gets written at spot w. Then w steps on.' : 'It is in seen already, so nothing gets written.') : null;
        s.snap(`The loop reads x = ${x} from spot ${r}. Is it in seen?`, { line: 4, vars: vars({ x }), ask });

        if (isNew) {
          seen.push(x);
          s.set('v' + w, { text: x });
          s.tone('v' + w, 'ok');
          const at = w;
          w += 1;
          if (r !== at) s.tone('v' + r, 'default');
          s.set('W', { x: X(w) });
          s.snap(`${x} is new. It goes in spot ${at}, and w moves to ${w}.`, { line: 7, vars: vars({ x }) });
        } else {
          if (r >= w) s.tone('v' + r, 'muted');
          s.snap(`${x} is in seen, so it is skipped. w stays at ${w}.`, { line: 4, vars: vars({ x }) });
        }
      });
      s.del('R');

      let left = n;
      if (left > w) {
        s.snap(`Spots ${w} and up hold old values. They must go.`, {
          line: 8, vars: vars(),
          ask: quiz('How many items will the pop loop take off the end?', String(left - w), ['0', String(left)],
            `The list has ${left} items and should keep ${w}. Popping from the end moves nothing.`),
        });
      }
      while (left > w) {
        left -= 1;
        s.del('v' + left, 'vi' + left);
        s.snap(`pop takes the last spot. The list has ${count(left, 'item')} now.`, { line: 9, vars: vars() });
      }
      s.del('W');
      const final = seen.slice();
      s.snap(`The first copy of each value stays, in the same order. Try 2 2 2 2 next.`, { line: 10, vars: vars(), out: show(final) });
    },
  });

  Viz.register('m09-transpose', {
    title: 'Flip a square grid over its diagonal',
    size: [560, 262],
    code: py`
      n = len(g)
      for r in range(n):
          for c in range(r + 1, n):
              g[r][c], g[c][r] = g[c][r], g[r][c]
      print(g)
    `,
    inputs: [
      { key: 'size', label: 'rows and columns', type: 'number', value: 3, min: 1, max: 4 },
    ],
    tryInputs: [{ size: 1 }, { size: 2 }, { size: 4 }],
    build(s, p) {
      const n = whole(p.size, 1, 4, 3);
      const cell = 46, gapX = 54, gapY = 52;
      const left = 280 - ((n - 1) * gapX) / 2;
      const top = 64;
      const X = c => left + c * gapX;
      const Y = r => top + r * gapY;
      const grid = [];
      const ids = [];
      for (let r = 0; r < n; r++) {
        grid.push([]);
        ids.push([]);
        s.text('rl' + r, X(0) - 44, Y(r), r, { size: 13, tone: 'muted', mono: true });
        for (let c = 0; c < n; c++) {
          const v = r * n + c + 1;
          grid[r].push(v);
          ids[r].push(`g${r}x${c}`);
          s.box(`g${r}x${c}`, X(c), Y(r), v, { w: cell, h: cell, tone: r === c ? 'muted' : 'default' });
        }
      }
      for (let c = 0; c < n; c++) s.text('cl' + c, X(c), top - 36, c, { size: 13, tone: 'muted', mono: true });
      s.text('rname', X(0) - 44, top - 36, 'r \\ c', { size: 13, tone: 'muted' });
      let swaps = 0;
      const shownGrid = () => '[' + grid.map(r => '[' + r.join(', ') + ']').join(', ') + ']';
      const vars = extra => Object.assign({ swaps }, extra);

      s.snap('Rows should become columns. The diagonal, top left to bottom right, has r equal to c.', { line: 1, vars: vars({ n }) });

      if (n === 1) {
        s.snap('One cell has no other cell to trade with. So nothing moves.', { line: 3, vars: vars({ n }) });
        s.snap('The loop finds no pairs at all.', { line: 5, vars: vars({ n }), out: shownGrid() });
        return;
      }

      s.snap('The diagonal is the mirror line.', {
        line: 2, vars: vars({ n }),
        ask: quiz('Where does g[1][1] go when rows become columns?', 'It stays where it is', ['It moves to g[0][0]'],
          'Row 1, column 1 becomes column 1, row 1. That is the same spot.'),
      });

      for (let r = 0; r < n; r++) {
        for (let c = r + 1; c < n; c++) {
          const a = ids[r][c], b = ids[c][r];
          s.tone([a, b], 'active');
          const before = grid[c][r];
          const ask = swaps === 0 ? quiz(`r is ${r} and c is ${c}. Which value will land in g[${r}][${c}]?`,
            String(before), [String(grid[r][c]), String(grid[r][r])],
            `g[${r}][${c}] trades with its mirror, g[${c}][${r}]. That cell holds ${before}.`)
            : swaps === 1 ? quiz('Why does c start at r + 1?', 'So each pair trades only once', ['To skip the last column', 'To make the code shorter'],
              'A pair that trades twice goes back where it was. So you visit only one side of the diagonal.')
              : null;
          s.snap(`r is ${r} and c is ${c}. These 2 cells are mirrors.`, { line: 3, vars: vars({ r, c }), ask });

          s.swap(a, b, 30);
          [ids[r][c], ids[c][r]] = [ids[c][r], ids[r][c]];
          [grid[r][c], grid[c][r]] = [grid[c][r], grid[r][c]];
          swaps += 1;
          s.snap(`They trade places. That is swap number ${swaps}.`, { line: 4, vars: vars({ r, c }) });
          s.tone([a, b], 'ok');
        }
      }
      s.snap(`${n} rows took ${count(swaps, 'swap')}. Row 0 now reads what column 0 said. Try another size.`, { line: 5, vars: vars({}), out: shownGrid() });
    },
  });
})();
