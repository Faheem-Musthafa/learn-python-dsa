/* Visuals for module 5. Names start with the module id. */

// ---------------------------------------------------------------- lesson 5.1
Viz.register('m05-list-index', {
  title: 'Every spot in a list has a number',
  size: [560, 190],
  code: py`
    pets = ["ant", "bee", "cat", "dog", "elk"]
    print(pets[0])
    print(pets[4])
    print(pets[-1])
    print(pets[-2])
    print(pets[pick])
  `,
  inputs: [
    { key: 'pick', label: 'Your pick', type: 'number', value: 2, min: -6, max: 6 },
  ],
  build(s, p) {
    const pets = ['ant', 'bee', 'cat', 'dog', 'elk'];
    const n = pets.length;
    const o = { y: 90 };
    const pick = Math.round(Number(p.pick)) || 0;
    const X = i => s.slotX(i, n, o);
    const vars = { pick };
    let out = '';

    s.row('p', pets, o);
    s.text('idxlabel', 60, 132, 'index', { size: 13, tone: 'muted' });
    s.snap('The list has 5 items. The small numbers show each spot.', { line: 1, vars, out });

    s.pointer('ptr', X(0), 58, 'pets[0]', { dir: 'down' });
    s.snap('Now print(pets[0]) runs. Look at the numbers under the boxes.', {
      line: 2, vars, out,
      ask: {
        q: 'What does pets[0] give?',
        options: ['ant', 'bee', 'Nothing. Spots start at 1.'],
        answer: 0,
        why: 'Counting starts at 0, so spot 0 holds the first item.',
      },
    });
    s.tone('p0', 'active');
    out = 'ant';
    s.snap('pets[0] is the first item: ant.', { line: 2, vars, out });

    s.tone('p0', 'default');
    s.snap('The list has 5 items. Which number is the last spot?', {
      line: 3, vars, out,
      ask: {
        q: 'What is the last index in this list of 5 items?',
        options: ['5', '4', '6'],
        answer: 1,
        why: 'The spots are 0, 1, 2, 3 and 4. The last index is one less than the count.',
      },
    });
    s.set('ptr', { x: X(4), text: 'pets[4]' });
    s.tone('p4', 'active');
    out += '\nelk';
    s.snap('pets[4] is the last item: elk.', { line: 3, vars, out });

    s.tone('p4', 'default');
    s.text('neglabel', 60, 156, 'from end', { size: 13, tone: 'muted' });
    pets.forEach((_, i) => s.text('neg' + i, X(i), 156, i - n, { size: 13, tone: 'muted', mono: true }));
    s.snap('Each spot has a second number. It counts back from the end.', {
      line: 4, vars, out,
      ask: {
        q: 'What does pets[-1] give?',
        options: ['An error', 'ant', 'elk'],
        answer: 2,
        why: 'A negative index counts from the end, so -1 is the last item.',
      },
    });
    s.set('ptr', { text: 'pets[-1]' });
    s.tone('p4', 'active');
    out += '\nelk';
    s.snap('-1 means the last item. It is the same spot as 4.', { line: 4, vars, out });

    s.tone('p4', 'default');
    s.set('ptr', { x: X(3), text: 'pets[-2]' });
    s.tone('p3', 'active');
    out += '\ndog';
    s.snap('-2 means second from the end: dog.', { line: 5, vars, out });

    s.tone('p3', 'default');
    if (pick >= -n && pick < n) {
      const at = pick < 0 ? pick + n : pick;
      s.set('ptr', { x: X(at), text: `pets[${pick}]` });
      s.tone('p' + at, 'ok');
      out += '\n' + pets[at];
      s.snap(`Your pick is ${pick}. That spot holds ${pets[at]}. Try another number above.`, { line: 6, vars, out });
    } else {
      s.del('ptr');
      out += '\nIndexError';
      s.snap(`There is no spot ${pick}. Python stops with an IndexError.`, { line: 6, vars, out });
    }
  },
});

Viz.register('m05-slice', {
  title: 'A slice cuts a piece from a list',
  size: [560, 250],
  code: py`
    pets = ["ant", "bee", "cat", "dog", "elk"]
    start = 1
    stop = 3
    part = pets[start:stop]
    print(part)
    print(pets)
  `,
  inputs: [
    { key: 'start', label: 'start', type: 'number', value: 1, min: 0, max: 3 },
    { key: 'stop', label: 'stop', type: 'number', value: 3, min: 1, max: 4 },
  ],
  build(s, p) {
    const pets = ['ant', 'bee', 'cat', 'dog', 'elk'];
    const stop = Math.max(1, Math.min(4, Math.round(Number(p.stop)) || 1));
    const start = Math.max(0, Math.min(stop - 1, Math.round(Number(p.start)) || 0));
    const part = pets.slice(start, stop);
    const show = a => '[' + a.map(x => "'" + x + "'").join(', ') + ']';
    const o = { y: 90 };
    const X = i => s.slotX(i, pets.length, o);
    const vars = { start, stop };

    s.row('p', pets, o);
    s.text('petslabel', 60, 90, 'pets', { size: 15, mono: true });
    s.snap('Here is the list. Each box has its index below it.', { line: 1 });

    s.pointer('a', X(start), 58, 'start', { dir: 'down' });
    s.snap(`The slice starts at index ${start}.`, { line: 2, vars });

    s.pointer('b', X(stop), 58, 'stop', { dir: 'down' });
    s.snap(`The stop is index ${stop}. The slice stops before this spot.`, {
      line: 3, vars,
      ask: {
        q: `Which items are in pets[${start}:${stop}]?`,
        options: [show(pets.slice(start, stop + 1)), show(part), show(pets.slice(start + 1, stop + 1))],
        answer: 1,
        why: 'It includes the start and stops before the stop.',
      },
    });

    part.forEach((_, i) => s.tone('p' + (start + i), 'active'));
    s.snap('These items are in the slice. The stop spot stays out.', { line: 4, vars });

    s.text('partlabel', 60, 190, 'part', { size: 15, mono: true });
    s.row('r', part, { y: 190 });
    s.snap('Python copies them into a new list, with its own numbers.', { line: 4, vars });

    s.snap('The screen shows the new list.', { line: 5, vars, out: show(part) });

    s.clearTones();
    s.snap('pets still has all 5 items. A slice does not change it.', { line: 6, vars, out: show(part) + '\n' + show(pets) });
  },
});

Viz.register('m05-list-change', {
  title: 'Add and remove items',
  size: [560, 180],
  code: py`
    nums = [10, 20, 30]
    nums.append(40)
    x = nums.pop()
    nums.insert(1, 15)
    print(nums)
    print(x)
  `,
  build(s) {
    const y = 90;
    const X = i => 90 + 58 * i;
    const idx = i => s.text('ni' + i, X(i), y + 42, i, { size: 13, tone: 'muted', mono: true });

    s.row('n', [10, 20, 30], { x: X(1), y });
    s.snap('The list has 3 items.', { line: 1, vars: { nums: '[10, 20, 30]' } });

    s.snap('Next, append adds the value 40.', {
      line: 2, vars: { nums: '[10, 20, 30]' },
      ask: {
        q: 'Where does append put 40?',
        options: ['At the front', 'At index 1', 'At the end'],
        answer: 2,
        why: 'append always adds a new spot at the end.',
      },
    });
    s.box('n3', X(3), y, 40, { w: 52, h: 52, tone: 'active' });
    idx(3);
    s.snap('40 goes in a new spot at the end.', { line: 2, vars: { nums: '[10, 20, 30, 40]' } });

    s.tone('n3', 'default');
    s.snap('Next, pop runs with no number.', {
      line: 3, vars: { nums: '[10, 20, 30, 40]' },
      ask: {
        q: 'Which item does pop() take out?',
        options: ['10', '40', 'All of them'],
        answer: 1,
        why: 'With no number, pop takes the last item and hands it back.',
      },
    });
    s.text('xlabel', 470, 42, 'x', { size: 15, mono: true });
    s.set('n3', { x: 470, tone: 'accent' });
    s.del('ni3');
    s.snap('pop takes the last item and hands it back. Now x is 40.', { line: 3, vars: { nums: '[10, 20, 30]', x: 40 } });

    s.snap('Next, insert puts 15 at index 1.', {
      line: 4, vars: { nums: '[10, 20, 30]', x: 40 },
      ask: {
        q: 'After the insert, what index will 20 have?',
        options: ['1', '2', '3'],
        answer: 1,
        why: 'Items from index 1 onward move up one spot, so 20 moves to index 2.',
      },
    });
    s.set('n2', { x: X(3), tone: 'warn' });
    idx(3);
    s.snap('To make room, 30 moves one spot to the right.', { line: 4, vars: { x: 40 } });

    s.tone('n2', 'default');
    s.set('n1', { x: X(2), tone: 'warn' });
    s.snap('Then 20 moves too. Spot 1 is free now.', { line: 4, vars: { x: 40 } });

    s.tone('n1', 'default');
    s.box('n15', X(1), y, 15, { w: 52, h: 52, tone: 'active' });
    s.snap('15 goes into spot 1.', { line: 4, vars: { nums: '[10, 15, 20, 30]', x: 40 } });

    s.tone('n15', 'default');
    s.snap('print shows the list as it is now.', { line: 5, vars: { nums: '[10, 15, 20, 30]', x: 40 }, out: '[10, 15, 20, 30]' });
    s.snap('x is still on the 40 that pop handed back.', { line: 6, vars: { nums: '[10, 15, 20, 30]', x: 40 }, out: '[10, 15, 20, 30]\n40' });
  },
});

// ---------------------------------------------------------------- lesson 5.2
Viz.register('m05-two-tags', {
  title: 'Two name tags, one list',
  size: [560, 300],
  code: py`
    a = [1, 2, 3]
    b = a
    b.append(4)
    print(a)
    c = a.copy()
    c.append(5)
    print(a)
    print(c)
  `,
  build(s) {
    const y1 = 90, y2 = 225, cell = 46;
    const X = i => 190 + 52 * i;
    const add = (pre, i, v, y) => {
      s.box(pre + i, X(i), y, v, { w: cell, h: cell, tone: 'active' });
      s.text(pre + 'i' + i, X(i), y + cell / 2 + 16, i, { size: 13, tone: 'muted', mono: true });
    };
    const tag = { w: 46, h: 38, tone: 'accent' };

    s.row('L', [1, 2, 3], { x: X(1), y: y1, cell, gap: 6 });
    s.text('one', 490, y1, 'list 1', { size: 14, tone: 'muted' });
    s.box('ta', 60, 55, 'a', tag);
    s.edge('ea', 'ta', 'L0');
    s.snap('a is a name tag on a list.', { line: 1, vars: { a: '[1, 2, 3]' } });

    s.snap('Next, the line b = a runs.', {
      line: 2, vars: { a: '[1, 2, 3]' },
      ask: {
        q: 'What does b = a do?',
        options: ['It makes a second list', 'It adds a second tag to the same list', 'It moves the tag a away'],
        answer: 1,
        why: 'Python makes no new list. b is one more name for the list that a names.',
      },
    });
    s.box('tb', 60, 125, 'b', tag);
    s.edge('eb', 'tb', 'L0');
    s.snap('Now b is a second tag on the one list.', { line: 2, vars: { a: '[1, 2, 3]', b: '[1, 2, 3]' } });

    s.snap('Next, b.append(4) runs. Then print(a) runs.', {
      line: 3, vars: { a: '[1, 2, 3]', b: '[1, 2, 3]' },
      ask: {
        q: 'What will print(a) show?',
        options: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]'],
        answer: 1,
        why: 'a and b name one list. A change made through b shows through a too.',
      },
    });
    add('L', 3, 4, y1);
    s.snap('append changes the one list. Both tags see the new item.', { line: 3, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]' } });

    s.tone('L3', 'default');
    s.snap('print(a) shows the 4. There was only ever one list.', { line: 4, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]' }, out: '[1, 2, 3, 4]' });

    s.snap('Next, c = a.copy() runs.', {
      line: 5, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]' }, out: '[1, 2, 3, 4]',
      ask: {
        q: 'How many lists will there be now?',
        options: ['1', '2', '3'],
        answer: 1,
        why: 'copy makes one new list. a and b still share the first one.',
      },
    });
    s.row('C', [1, 2, 3, 4], { x: X(1.5), y: y2, cell, gap: 6 });
    s.text('two', 490, y2, 'list 2', { size: 14, tone: 'muted' });
    s.box('tc', 60, y2, 'c', tag);
    s.edge('ec', 'tc', 'C0');
    s.snap('copy makes a second list with the same items. c is its tag.', { line: 5, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]', c: '[1, 2, 3, 4]' }, out: '[1, 2, 3, 4]' });

    s.snap('Next, c.append(5) runs.', {
      line: 6, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]', c: '[1, 2, 3, 4]' }, out: '[1, 2, 3, 4]',
      ask: {
        q: 'Does list 1 change this time?',
        options: ['Yes, it gets the 5 too', 'No, only list 2 changes'],
        answer: 1,
        why: 'c names its own list. No tag joins the two lists now.',
      },
    });
    add('C', 4, 5, y2);
    s.snap('Only list 2 gets the 5. List 1 stays as it was.', { line: 6, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]', c: '[1, 2, 3, 4, 5]' }, out: '[1, 2, 3, 4]' });

    s.tone('C4', 'default');
    s.snap('print(a) shows list 1, with no 5.', { line: 7, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]', c: '[1, 2, 3, 4, 5]' }, out: '[1, 2, 3, 4]\n[1, 2, 3, 4]' });
    s.snap('print(c) shows list 2, with the 5.', { line: 8, vars: { a: '[1, 2, 3, 4]', b: '[1, 2, 3, 4]', c: '[1, 2, 3, 4, 5]' }, out: '[1, 2, 3, 4]\n[1, 2, 3, 4]\n[1, 2, 3, 4, 5]' });
  },
});

// ---------------------------------------------------------------- lesson 5.3
Viz.register('m05-swap-wrong', {
  title: 'A swap that loses a value',
  size: [560, 230],
  code: py`
    a = 3
    b = 7
    a = b
    b = a
    print(a, b)
  `,
  build(s) {
    const tag = { w: 46, h: 38, tone: 'accent' };
    s.box('ta', 110, 70, 'a', tag);
    s.box('v3', 400, 70, 3);
    s.edge('ea', 'ta', 'v3');
    s.snap('a is a name tag on the value 3.', { line: 1, vars: { a: 3 } });

    s.box('tb', 110, 170, 'b', tag);
    s.box('v7', 400, 170, 7);
    s.edge('eb', 'tb', 'v7');
    s.snap('b is a name tag on the value 7.', { line: 2, vars: { a: 3, b: 7 } });

    s.snap('Next, a = b runs.', {
      line: 3, vars: { a: 3, b: 7 },
      ask: {
        q: 'What value will a have after a = b?',
        options: ['3', '7'],
        answer: 1,
        why: 'The tag a moves to the value that b has. That value is 7.',
      },
    });
    s.set('ea', { to: 'v7' });
    s.tone('v3', 'muted');
    s.snap('The tag a moves to 7. Now no tag is left on 3.', { line: 3, vars: { a: 7, b: 7 } });

    s.snap('Next, b = a runs.', {
      line: 4, vars: { a: 7, b: 7 },
      ask: {
        q: 'What value will b have after b = a?',
        options: ['3', '7'],
        answer: 1,
        why: 'a is 7 now, so b gets 7. The old 3 has no name any more.',
      },
    });
    s.pulse('v7');
    s.snap('b gets what a has now, and that is 7. The 3 is lost.', { line: 4, vars: { a: 7, b: 7 } });

    s.snap('Both names show 7. This swap did not work.', { line: 5, vars: { a: 7, b: 7 }, out: '7 7' });
  },
});

Viz.register('m05-swap-right', {
  title: 'The swap that works',
  size: [560, 250],
  code: py`
    a = 3
    b = 7
    a, b = b, a
    print(a, b)
  `,
  build(s) {
    const tag = { w: 46, h: 38, tone: 'accent' };
    s.box('ta', 70, 125, 'a', tag);
    s.box('v3', 480, 125, 3);
    s.edge('ea', 'ta', 'v3');
    s.box('tb', 70, 215, 'b', tag);
    s.box('v7', 480, 215, 7);
    s.edge('eb', 'tb', 'v7');
    s.snap('a is on 3. b is on 7.', { line: 2, vars: { a: 3, b: 7 } });

    s.snap('Next, the swap line runs.', {
      line: 3, vars: { a: 3, b: 7 },
      ask: {
        q: 'Which side of the = does Python work on first?',
        options: ['The left side', 'The right side'],
        answer: 1,
        why: 'Python always works out the right side first.',
      },
    });
    s.row('T', [7, 3], { x: 280, y: 42, cell: 46 });
    s.text('tlabel', 180, 42, 'b, a', { size: 15, mono: true });
    s.snap('The right side makes a tuple: (7, 3). It saves both values.', { line: 3, vars: { a: 3, b: 7 } });

    s.snap('Now Python unpacks the tuple. Each name on the left gets 1 item.', {
      line: 3, vars: { a: 3, b: 7 },
      ask: {
        q: 'What value does a get?',
        options: ['3', '7', 'Both'],
        answer: 1,
        why: 'The first name gets the first item of the tuple. That item is 7.',
      },
    });
    s.tone('T0', 'active');
    s.set('ea', { to: 'v7' });
    s.snap('a gets spot 0 of the tuple: 7.', { line: 3, vars: { a: 7, b: 7 } });

    s.tone('T0', 'default');
    s.tone('T1', 'active');
    s.set('eb', { to: 'v3' });
    s.snap('b gets spot 1 of the tuple: 3. The tuple kept it safe.', { line: 3, vars: { a: 7, b: 3 } });

    s.del('T0', 'T1', 'Ti0', 'Ti1', 'tlabel');
    s.snap('Python is done with the tuple, so it goes away.', { line: 3, vars: { a: 7, b: 3 } });

    s.snap('The values have traded places. No value got lost.', { line: 4, vars: { a: 7, b: 3 }, out: '7 3' });
  },
});

// ---------------------------------------------------------------- lesson 5.4
Viz.register('m05-string-new', {
  title: 'A string never changes',
  size: [560, 220],
  code: py`
    s = "cat"
    t = s.upper()
    print(s)
    print(t)
    s = t
    print(s)
  `,
  build(sc) {
    const tag = { w: 46, h: 38, tone: 'accent' };
    sc.box('ts', 90, 60, 's', tag);
    sc.box('cat', 360, 60, '"cat"', { w: 100, h: 48 });
    sc.edge('es', 'ts', 'cat');
    sc.snap('s is a name tag on the string "cat".', { line: 1, vars: { s: '"cat"' } });

    sc.snap('Next, s.upper() runs.', {
      line: 2, vars: { s: '"cat"' },
      ask: {
        q: 'What happens to the string "cat"?',
        options: ['It turns into "CAT"', 'It stays. Python makes a new string.', 'It goes away'],
        answer: 1,
        why: 'A string cannot change. upper makes a new string and hands it back.',
      },
    });
    sc.box('CAT', 360, 160, '"CAT"', { w: 100, h: 48, tone: 'active' });
    sc.box('tt', 90, 160, 't', tag);
    sc.edge('et', 'tt', 'CAT');
    sc.snap('upper makes a new string. The tag t goes on it.', { line: 2, vars: { s: '"cat"', t: '"CAT"' } });

    sc.tone('CAT', 'default');
    sc.snap('s is still on "cat", so print shows cat.', { line: 3, vars: { s: '"cat"', t: '"CAT"' }, out: 'cat' });
    sc.snap('t is on the new string, so print shows CAT.', { line: 4, vars: { s: '"cat"', t: '"CAT"' }, out: 'cat\nCAT' });

    sc.set('es', { to: 'CAT' });
    sc.tone('cat', 'muted');
    sc.snap('s = t moves the tag. The string "cat" itself did not change.', { line: 5, vars: { s: '"CAT"', t: '"CAT"' }, out: 'cat\nCAT' });
    sc.snap('Now s shows CAT, because the tag moved.', { line: 6, vars: { s: '"CAT"', t: '"CAT"' }, out: 'cat\nCAT\nCAT' });
  },
});

Viz.register('m05-split-join', {
  title: 'Split text, then join it again',
  size: [560, 260],
  code: py`
    text = "red,green,blue"
    parts = text.split(",")
    print(parts)
    back = "-".join(parts)
    print(back)
  `,
  build(s) {
    s.text('l1', 60, 45, 'text', { size: 15, mono: true });
    s.box('text', 280, 45, '"red,green,blue"', { w: 220, h: 44 });
    s.snap('text is one string with 2 commas in it.', { line: 1 });

    s.snap('Next, split runs. It cuts wherever it finds a comma.', {
      line: 2,
      ask: {
        q: 'How many items will the new list have?',
        options: ['2', '3', '14'],
        answer: 1,
        why: '2 cuts make 3 pieces. The commas themselves go away.',
      },
    });
    s.text('l2', 60, 125, 'parts', { size: 15, mono: true });
    s.row('p', ['red', 'green', 'blue'], { y: 125, cell: 70 });
    s.snap('split makes a list of 3 strings. The commas are gone.', { line: 2 });

    const shown = "['red', 'green', 'blue']";
    s.snap('print shows the list.', { line: 3, out: shown });

    s.snap('Next, join glues the items together. The glue is "-".', {
      line: 4, out: shown,
      ask: {
        q: 'What will back be?',
        options: ['red-green-blue-', 'redgreenblue', 'red-green-blue'],
        answer: 2,
        why: 'join puts the glue between items only, not after the last one.',
      },
    });
    s.text('l3', 60, 220, 'back', { size: 15, mono: true });
    s.box('back', 280, 220, '"red-green-blue"', { w: 220, h: 44, tone: 'active' });
    s.snap('join makes one new string, with the glue between the items.', { line: 4, out: shown });

    s.tone('back', 'default');
    s.snap('print shows the new string.', { line: 5, out: shown + '\nred-green-blue' });
  },
});

Viz.register('m05-comp-build', {
  title: 'Build a new list in one line',
  size: [560, 250],
  code: py`
    nums = [1, 2, 3, 4]
    new = [n * times for n in nums]
    print(new)
  `,
  inputs: [
    { key: 'times', label: 'times', type: 'number', value: 2, min: 2, max: 5 },
  ],
  build(s, p) {
    const t = Math.max(2, Math.min(5, Math.round(Number(p.times)) || 2));
    const nums = [1, 2, 3, 4];
    const o = { y: 85 };
    const X = i => s.slotX(i, nums.length, o);
    const y2 = 185;
    let got = [];
    const show = () => '[' + got.join(', ') + ']';

    s.row('n', nums, o);
    s.text('l1', 90, 85, 'nums', { size: 15, mono: true });
    s.text('l2', 90, y2, 'new', { size: 15, mono: true });
    s.snap('nums has 4 items. The new list starts empty.', { line: 1, vars: { times: t, new: show() } });

    nums.forEach((v, i) => {
      if (i === 0) s.pointer('ptr', X(0), 53, 'n', { dir: 'down' });
      else s.set('ptr', { x: X(i) });
      const ask = i === 1 ? {
        q: 'n is 2 now. What goes in the new list next?',
        options: [String(2 * t), '2', String(3 * t)],
        answer: 0,
        why: `The new item is n * times, and 2 * ${t} is ${2 * t}.`,
      } : null;
      s.snap(`The loop part sets n to ${v}.`, { line: 2, vars: { times: t, n: v, new: show() }, ask });

      got.push(v * t);
      s.box('r' + i, X(i), y2, v * t, { w: 52, h: 52, tone: 'active' });
      s.text('ri' + i, X(i), y2 + 42, i, { size: 13, tone: 'muted', mono: true });
      s.snap(`${v} * ${t} is ${v * t}. It goes in the new list.`, { line: 2, vars: { times: t, n: v, new: show() } });
      s.tone('r' + i, 'default');
    });

    s.del('ptr');
    s.snap('print shows the new list. nums did not change.', { line: 3, vars: { times: t, new: show() }, out: show() });
  },
});

// ---------------------------------------------------------------- lesson 5.5
Viz.register('m05-grid-read', {
  title: 'Row first, then the spot in that row',
  size: [560, 260],
  code: py`
    grid = [[7, 2, 9],
            [4, 8, 5]]
    print(grid[1])
    print(grid[1][0])
    for r in range(2):
        for c in range(3):
            print(grid[r][c])
    print(grid[row][col])
  `,
  inputs: [
    { key: 'row', label: 'row', type: 'number', value: 0, min: 0, max: 2 },
    { key: 'col', label: 'col', type: 'number', value: 2, min: 0, max: 3 },
  ],
  tryInputs: [{ row: 1, col: 1 }, { row: 2, col: 0 }, { row: 1, col: 3 }],
  build(s, p) {
    const grid = [[7, 2, 9], [4, 8, 5]];
    const X = [220, 284, 348], Y = [90, 170];
    const row = Math.max(0, Math.round(Number(p.row)) || 0);
    const col = Math.max(0, Math.round(Number(p.col)) || 0);
    const vars = { row, col };
    const read = (a, b, c) => {
      s.set('read1', { text: a });
      s.set('read2', { text: b });
      s.set('read3', { text: c });
    };
    let out = '';

    X.forEach((x, c) => s.text(`ch${c}`, x, 34, `col ${c}`, { size: 14, tone: 'muted' }));
    grid.forEach((cells, r) => {
      s.area(`a${r}`, 182, Y[r] - 34, 204, 68, '');
      s.box(`rl${r}`, 128, Y[r], `grid[${r}]`, { w: 96, h: 40, sub: `row ${r}` });
      cells.forEach((v, c) => s.box(`g${r}${c}`, X[c], Y[r], v, { w: 56, h: 52 }));
    });
    s.text('read1', 472, 90, '', { size: 15, mono: true, weight: 700 });
    s.text('read2', 472, 125, '', { size: 15 });
    s.text('read3', 472, 160, '', { size: 15, mono: true, weight: 700 });
    s.snap('grid is one list. It holds 2 lists, and each one is a row.', { line: 1, vars, out });

    s.snap('Next, print(grid[1]) runs. It has only one index.', {
      line: 3, vars, out,
      ask: {
        q: 'What does grid[1] give?',
        options: ['2', '4', '[4, 8, 5]'],
        answer: 2,
        why: 'One index picks one item of the outer list. Each item of grid is a whole row.',
      },
    });
    s.tone(['rl1', 'g10', 'g11', 'g12'], 'active');
    read('grid[1]', 'row 1', '[4, 8, 5]');
    out = '[4, 8, 5]';
    s.snap('The first index picks a row. grid[1] is the whole second row.', { line: 3, vars, out });

    s.snap('Next, grid[1][0] adds a second index.', {
      line: 4, vars, out,
      ask: {
        q: 'What does grid[1][0] give?',
        options: ['2', '4', '7'],
        answer: 1,
        why: 'Row first. Row 1 is [4, 8, 5], and spot 0 of that row holds 4.',
      },
    });
    s.tone(['g11', 'g12'], 'default');
    s.tone('g10', 'ok');
    read('grid[1][0]', 'row 1, col 0', '4');
    out += '\n4';
    s.snap('The second index picks a spot in that row. Spot 0 holds 4.', { line: 4, vars, out });

    s.clearTones();
    read('', '', '');
    s.snap('Next, 2 loops visit every spot, one at a time.', {
      line: 5, vars, out,
      ask: {
        q: 'How many times will print run in these loops?',
        options: ['3', '5', '6'],
        answer: 2,
        why: 'There are 2 rows with 3 spots each, and 2 x 3 is 6.',
      },
    });

    grid.forEach((cells, r) => {
      if (r === 0) {
        s.text('rmark', 58, Y[0], 'r >', { size: 15, weight: 700 });
        s.pointer('cptr', X[0], 214, 'c', { dir: 'up' });
      } else {
        s.set('rmark', { y: Y[r] });
        s.set('cptr', { x: X[0] });
        s.tone('rl0', 'default');
      }
      s.tone(`rl${r}`, 'active');
      s.snap(`The outer loop starts a trip. r is ${r}, so c starts at 0.`, { line: 5, vars: { row, col, r, c: 0 }, out });

      cells.forEach((v, c) => {
        s.set('cptr', { x: X[c] });
        s.tone(`g${r}${c}`, 'ok');
        read('grid[r][c]', `grid[${r}][${c}]`, String(v));
        out += '\n' + v;
        const ask = r === 0 && c === cells.length - 1 ? {
          q: 'Row 0 is done. What happens next?',
          options: ['c goes on to 3', 'r goes to 1, and c starts over at 0', 'The loops end'],
          answer: 1,
          why: 'The inner loop has finished its trip. The outer loop moves on, and the inner loop starts over.',
        } : null;
        s.snap(`c is ${c}. grid[${r}][${c}] holds ${v}, so print shows it.`, { line: 7, vars: { row, col, r, c }, out, ask });
      });
    });

    s.del('rmark', 'cptr');
    s.clearTones();
    if (row < grid.length && col < grid[row].length) {
      const v = grid[row][col];
      s.tone(`rl${row}`, 'active');
      s.tone(`g${row}${col}`, 'ok');
      read(`grid[${row}][${col}]`, `row ${row}, col ${col}`, String(v));
      out += '\n' + v;
      s.snap(`Your pick is row ${row}, col ${col}. That spot holds ${v}. Try other numbers above.`, { line: 8, vars, out });
    } else {
      read(`grid[${row}][${col}]`, 'not there', 'IndexError');
      out += '\nIndexError';
      const say = row >= grid.length ? `There is no row ${row}.` : `Row ${row} has no spot ${col}.`;
      s.snap(`${say} Python stops with an IndexError.`, { line: 8, vars, out });
    }
  },
});

Viz.register('m05-grid-share', {
  title: 'Three spots, one row',
  size: [560, 270],
  code: py`
    bad = [[0] * 3] * 3
    bad[0][0] = 5
    print(bad)
    good = [[0] * 3 for r in range(3)]
    good[0][0] = 5
    print(good)
  `,
  build(s) {
    const ys = [90, 150, 210];
    const spot = { w: 34, h: 34 };
    const cells = { cell: 38, gap: 6, index: false };
    const badOut = '[[5, 0, 0], [5, 0, 0], [5, 0, 0]]';
    const goodOut = '[[5, 0, 0], [0, 0, 0], [0, 0, 0]]';

    s.text('tbad', 150, 34, 'bad', { size: 17, weight: 700, mono: true });
    s.row('B', [0, 0, 0], Object.assign({ x: 214, y: ys[1] }, cells));
    s.tone(['B0', 'B1', 'B2'], 'active');
    s.snap('First, [0] * 3 makes one row. It is a list of 3 zeros.', { line: 1 });

    s.tone(['B0', 'B1', 'B2'], 'default');
    s.snap('Next, the * 3 on the outside repeats what the outer list holds.', {
      line: 1,
      ask: {
        q: 'The outer list holds this row. How many new rows will * 3 make?',
        options: ['None. It repeats the same row.', '2 more, so 3 rows in all', '3 more, so 4 rows in all'],
        answer: 0,
        why: 'The * repeats what is in the outer list. That is the row itself, not a copy of it.',
      },
    });
    ys.forEach((y, i) => {
      s.text(`bl${i}`, 40, y, `bad[${i}]`, { size: 15, mono: true });
      s.box(`bs${i}`, 92, y, '', spot);
      s.edge(`be${i}`, `bs${i}`, 'B0');
    });
    s.snap('bad has 3 spots. All 3 arrows point at the same row.', { line: 1 });

    s.snap('Next, bad[0][0] = 5 follows the first arrow.', {
      line: 2,
      ask: {
        q: 'What will bad[1][0] be after this line?',
        options: ['0', '5'],
        answer: 1,
        why: 'bad[0] and bad[1] are two names for one row, so both see the 5.',
      },
    });
    s.set('B0', { text: 5 });
    s.tone('B0', 'active');
    s.pulse('B0');
    s.snap('There is only one row, so that one change shows through every arrow.', { line: 2 });

    s.tone('B0', 'default');
    s.snap('print follows each arrow to the same row. So 5 shows 3 times.', { line: 3, out: badOut });

    s.text('tgood', 430, 34, 'good', { size: 17, weight: 700, mono: true });
    s.snap('Now the safe way. This line puts [0] * 3 inside a loop.', {
      line: 4, out: badOut,
      ask: {
        q: 'How many rows will this line make?',
        options: ['1', '3'],
        answer: 1,
        why: 'Each trip of the loop runs [0] * 3 again, and each run makes a new list.',
      },
    });
    ys.forEach((y, i) => {
      s.text(`gl${i}`, 320, y, `good[${i}]`, { size: 15, mono: true });
      s.box(`gs${i}`, 374, y, '', spot);
      s.row(`G${i}c`, [0, 0, 0], Object.assign({ x: 484, y }, cells));
      s.edge(`ge${i}`, `gs${i}`, `G${i}c0`);
      s.snap(`Trip ${i + 1}: [0] * 3 runs again and makes a new row.`, { line: 4, out: badOut });
    });

    s.snap('Next, good[0][0] = 5 follows the first arrow.', {
      line: 5, out: badOut,
      ask: {
        q: 'What will good[1][0] be after this line?',
        options: ['0', '5'],
        answer: 0,
        why: 'Each spot of good has its own row. So only row 0 changes.',
      },
    });
    s.set('G0c0', { text: 5 });
    s.tone('G0c0', 'active');
    s.pulse('G0c0');
    s.snap('Only row 0 changes. Each arrow points at its own row.', { line: 5, out: badOut });

    s.tone('G0c0', 'default');
    s.snap('print shows one 5. This is the grid you wanted.', { line: 6, out: badOut + '\n' + goodOut });
  },
});
