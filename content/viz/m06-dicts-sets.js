/* Visuals for module 6. Names start with the module id. */

/* 6.1: a dict drawn as key boxes with arrows to value boxes. */
Viz.register('m06-dict-lookup', {
  title: 'A dict: each key has an arrow to its value',
  size: [560, 280],
  code: py`
    stock = {"apple": 3, "pear": 5}
    stock["kiwi"] = 7
    print(stock["pear"])
    stock["apple"] = 9
    print(stock.get("plum", 0))
  `,
  build(s) {
    const ys = [82, 136, 190];
    const addPair = (i, key, val) => {
      s.box(`k${i}`, 170, ys[i], `"${key}"`, { w: 120, h: 42, tone: 'active' });
      s.box(`v${i}`, 390, ys[i], val, { w: 60, h: 42, tone: 'active' });
      s.edge(`e${i}`, `k${i}`, `v${i}`, { tone: 'active' });
    };
    s.area('dict', 60, 14, 440, 252, 'stock (a dict)');
    s.text('kh', 170, 46, 'key', { size: 14, tone: 'muted' });
    s.text('vh', 390, 46, 'value', { size: 14, tone: 'muted' });
    s.snap('Line 1 makes a dict called stock.', { line: 1, out: '' });

    addPair(0, 'apple', 3);
    s.snap('The key "apple" gets an arrow to the value 3.', { line: 1, out: '' });

    s.clearTones();
    addPair(1, 'pear', 5);
    s.snap('The key "pear" gets an arrow to the value 5.', {
      line: 1,
      out: '',
      ask: {
        q: 'Line 2 uses a new key, "kiwi". What happens?',
        options: ['Python adds a new pair', 'Python stops with an error', '"kiwi" takes the place of "pear"'],
        answer: 0,
        why: 'A new key makes a new pair. The other pairs stay the same.',
      },
    });

    s.clearTones();
    addPair(2, 'kiwi', 7);
    s.snap('Python adds a new pair for "kiwi".', { line: 2, out: '' });

    s.clearTones();
    s.tone('k1', 'active');
    s.snap('To look up "pear", Python goes straight to that key.', { line: 3, out: '' });

    s.tone(['e1', 'v1'], 'ok');
    s.snap('Python follows the arrow and prints 5.', {
      line: 3,
      out: '5',
      ask: {
        q: 'Line 4 uses a key that is already there. What happens to the 3?',
        options: ['"apple" now points to 3 and 9', '9 takes its place', 'A second "apple" key appears'],
        answer: 1,
        why: 'A key points to one value at a time. The new value replaces the old one.',
      },
    });

    s.clearTones();
    s.tone(['k0', 'e0'], 'active');
    s.set('v0', { text: 9, tone: 'ok' });
    s.pulse('v0');
    s.snap('The key "apple" now points to 9. The 3 is gone.', { line: 4, out: '5' });

    s.clearTones();
    s.box('miss', 170, 238, '"plum"', { w: 120, h: 38, tone: 'warn' });
    s.text('missnote', 330, 238, 'no key like this', { size: 14, tone: 'muted' });
    s.snap('Line 5 asks for "plum". The dict has no such key.', {
      line: 5,
      out: '5',
      ask: {
        q: 'There is no "plum" key. What does get do?',
        options: ['It stops with a KeyError', 'It adds "plum" to the dict', 'It gives the backup value, 0'],
        answer: 2,
        why: 'get gives the backup when the key is missing. It adds nothing.',
      },
    });

    s.set('missnote', { text: 'get gives the backup: 0' });
    s.snap('The key is missing, so get gives the backup. Python prints 0.', { line: 5, out: '5\n0' });

    s.del('miss', 'missnote');
    s.snap('The dict still has 3 pairs. get did not add "plum".', { line: 5, out: '5\n0' });
  },
});

/* 6.1: looping over a dict with items(). */
Viz.register('m06-dict-loop', {
  title: 'A loop visits each pair',
  size: [560, 260],
  code: py`
    stock = {"pear": 5, "apple": 3, "kiwi": 7}
    for fruit, count in stock.items():
        print(fruit, count)
  `,
  build(s) {
    const pairs = [['pear', 5], ['apple', 3], ['kiwi', 7]];
    const xs = [110, 280, 450];
    pairs.forEach(([k, v], i) => {
      s.box(`k${i}`, xs[i], 60, `"${k}"`, { w: 120, h: 42 });
      s.box(`v${i}`, xs[i], 150, v, { w: 60, h: 42 });
      s.edge(`e${i}`, `k${i}`, `v${i}`);
    });
    s.snap('The dict holds 3 pairs, in the order you added them.', {
      line: 1,
      out: '',
      ask: {
        q: 'Which pair does the loop visit first?',
        options: ['"apple", first in the alphabet', '"pear", the first one added', '"kiwi", the biggest number'],
        answer: 1,
        why: 'A dict keeps the order you added things. It does not sort them.',
      },
    });

    let out = '';
    pairs.forEach(([k, v], i) => {
      s.clearTones();
      s.tone([`k${i}`, `v${i}`, `e${i}`], 'active');
      if (i === 0) s.pointer('ptr', xs[0], 180, 'this pair', { dir: 'up' });
      else s.set('ptr', { x: xs[i] });
      const vars = { fruit: `"${k}"`, count: v };
      s.snap(i === 0 ? `items() hands over a pair. fruit gets "${k}" and count gets ${v}.` : `The next trip gets the next pair: "${k}" and ${v}.`, { line: 2, vars, out });

      s.tone([`k${i}`, `v${i}`, `e${i}`], 'ok');
      out += (out ? '\n' : '') + `${k} ${v}`;
      const shown = { line: 3, vars, out };
      if (i === 1) {
        shown.ask = {
          q: 'How many more trips will the loop make?',
          options: ['0', '1', '2'],
          answer: 1,
          why: 'Only "kiwi" is left. The loop visits each pair once.',
        };
      }
      s.snap(`Python prints ${k} and ${v}, then goes back to the top.`, shown);
    });

    s.del('ptr');
    s.clearTones();
    s.snap('No pairs are left, so the loop ends.', { line: 2, out });
  },
});

/* 6.2: a set refuses repeats. */
Viz.register('m06-set-add', {
  title: 'A set keeps each thing once',
  size: [560, 290],
  code: py`
    seen = set()
    for c in ["red", "blue", "red", "green"]:
        seen.add(c)
    print(len(seen))
  `,
  build(s) {
    const items = ['red', 'blue', 'red', 'green'];
    const xs = [100, 220, 340, 460];
    const spots = { red: [150, 170], blue: [420, 160], green: [285, 232] };
    items.forEach((t, i) => s.box(`L${i}`, xs[i], 36, `"${t}"`, { w: 100, h: 40 }));
    s.area('bag', 40, 108, 480, 170, 'seen (a set)');
    s.snap('Line 1 makes an empty set called seen.', { line: 1, out: '' });

    const reach = (i, t, ask) => {
      s.clearTones();
      s.tone(`L${i}`, 'active');
      if (i === 0) s.pointer('ptr', xs[0], 62, 'c', { dir: 'up' });
      else s.set('ptr', { x: xs[i] });
      // A clone sits on the list item, so it can glide into the set in the next frame.
      s.box(i === 2 ? 'moving' : `S${t}`, xs[i], 36, `"${t}"`, { w: 100, h: 40, tone: 'active' });
      s.snap(i === 2 ? `c is "${t}" again.` : `c is "${t}".`, { line: 2, vars: { c: `"${t}"` }, out: '', ask });
    };
    const keep = (i, t, ask) => {
      s.set(`S${t}`, { x: spots[t][0], y: spots[t][1], tone: 'ok' });
      s.tone(`L${i}`, 'muted');
      s.snap(`"${t}" is new, so it goes in the set.`, { line: 3, vars: { c: `"${t}"` }, out: '', ask });
    };

    reach(0, 'red');
    keep(0, 'red');
    reach(1, 'blue');
    keep(1, 'blue');

    reach(2, 'red', {
      q: 'seen already has "red". What happens now?',
      options: ['The set now holds 2 reds', 'Python stops with an error', 'Nothing changes. The set keeps one "red"'],
      answer: 2,
      why: 'A set holds each thing once. Adding a repeat does nothing.',
    });
    s.set('moving', { x: spots.red[0] + 30, y: spots.red[1] + 22, tone: 'warn' });
    s.snap('The set checks first. "red" is already here.', { line: 3, vars: { c: '"red"' }, out: '' });
    s.del('moving');
    s.tone('L2', 'muted');
    s.snap('The repeat is dropped. The set still has 2 things.', { line: 3, vars: { c: '"red"' }, out: '' });

    reach(3, 'green');
    keep(3, 'green', {
      q: 'What will len(seen) print?',
      options: ['4', '3', '2'],
      answer: 1,
      why: 'The list has 4 items, but one is a repeat. The set holds 3 things.',
    });

    s.del('ptr');
    s.clearTones();
    s.snap('The list has 4 items. The set has 3.', { line: 4, out: '3' });
  },
});

/* 6.2: union and intersection on two overlapping regions. */
Viz.register('m06-set-join', {
  title: 'Join 2 sets with | and &',
  size: [560, 280],
  code: py`
    art = {"Ann", "Ben", "Cy"}
    music = {"Ben", "Cy", "Dee"}
    print(sorted(art | music))
    print(sorted(art & music))
  `,
  build(s) {
    const place = { Ann: [120, 130], Ben: [280, 100], Cy: [280, 170], Dee: [440, 130] };
    const put = n => s.box(n, place[n][0], place[n][1], n, { w: 78, h: 44 });
    s.area('art', 30, 30, 320, 190, 'art');
    ['Ann', 'Ben', 'Cy'].forEach(put);
    s.text('res', 280, 250, '', { size: 16, weight: 700, mono: true });
    s.snap('Line 1 makes the art set: Ann, Ben and Cy.', { line: 1, out: '' });

    const line3 = "['Ann', 'Ben', 'Cy', 'Dee']";
    const line4 = "['Ben', 'Cy']";
    s.area('music', 210, 30, 320, 190, 'music');
    put('Dee');
    s.tone(['Ben', 'Cy'], 'active');
    s.snap('Line 2 makes the music set. Ben and Cy sit in the middle, in both.', {
      line: 2,
      out: '',
      ask: {
        q: 'Which names does art | music give?',
        options: ['Only Ben and Cy', 'All 4 names, each one once', 'All names, with Ben and Cy twice'],
        answer: 1,
        why: 'The | operator takes everything from both sets. A set never holds a repeat.',
      },
    });

    s.tone(['Ann', 'Ben', 'Cy', 'Dee'], 'ok');
    s.set('res', { text: 'art | music: all 4 names' });
    s.snap('The | gives everything in art or in music. This is the union.', {
      line: 3,
      out: line3,
      ask: {
        q: 'Which names does art & music give?',
        options: ['Ann and Dee', 'All 4 names', 'Only Ben and Cy'],
        answer: 2,
        why: 'The & operator keeps only the names that are in both sets.',
      },
    });

    s.tone(['Ann', 'Dee'], 'muted');
    s.set('res', { text: 'art & music: Ben and Cy' });
    s.snap('The & gives only what is in both. This is the intersection.', { line: 4, out: `${line3}\n${line4}` });

    s.clearTones();
    s.set('res', { text: 'art and music did not change' });
    s.snap('Each answer is a new set. art and music stay the same.', { line: 4, out: `${line3}\n${line4}` });
  },
});

/* 6.3: counting letters with get. The learner can change the word. */
Viz.register('m06-count-letters', {
  title: 'Count letters with a dict',
  size: [560, 280],
  code: py`
    counts = {}
    for ch in word:
        counts[ch] = counts.get(ch, 0) + 1
    print(counts)
  `,
  inputs: [{ key: 'word', label: 'Word (up to 6 letters)', type: 'text', value: 'banana', size: 8 }],
  tryInputs: [{ word: 'aaa' }, { word: 'abcdef' }, { word: '' }, { word: 'Hi 5' }, { word: 'a' }, { word: 'longerword' }],
  build(s, p) {
    const word = String(p.word == null ? '' : p.word).toLowerCase().replace(/[^a-z]/g, '').slice(0, 6) || 'banana';
    const letters = word.split('');
    const distinct = [...new Set(letters)];
    const keyX = ch => 300 + (distinct.indexOf(ch) - (distinct.length - 1) / 2) * 80;
    const counts = {};
    const show = () => `{${Object.keys(counts).map(k => `'${k}': ${counts[k]}`).join(', ')}}`;
    const word_ = `"${word}"`;

    s.row('w', letters, { cell: 44, gap: 8, x: 300, y: 34, index: false });
    s.area('dict', 56, 100, 488, 168, 'counts (a dict)');
    s.text('keylabel', 28, 158, 'key', { size: 14, tone: 'muted' });
    s.text('vallabel', 28, 232, 'value', { size: 14, tone: 'muted' });
    s.snap('counts starts empty. The loop reads one letter at a time.', { line: 1, vars: { word: word_, counts: '{}' }, out: '' });

    letters.forEach((ch, i) => {
      const cur = counts[ch] || 0;
      const x = s.get(`w${i}`).x;
      s.clearTones();
      s.tone(`w${i}`, 'active');
      if (i === 0) s.pointer('ptr', x, 60, 'ch', { dir: 'up' });
      else s.set('ptr', { x });
      const frame = { line: 2, vars: { word: word_, ch: `"${ch}"`, counts: show() }, out: '' };
      if (i % 2 === 0) {
        frame.ask = {
          q: `ch is "${ch}". What does counts.get(ch, 0) give now?`,
          options: cur === 0 ? ['A KeyError', '0', '1'] : [String(cur + 1), 'A KeyError', String(cur)],
          answer: cur === 0 ? 1 : 2,
          why: cur === 0 ? `There is no "${ch}" key yet, so get gives the backup, 0.` : `"${ch}" is already a key with the value ${cur}, so get gives ${cur}.`,
        };
      }
      s.snap(`ch is "${ch}".`, frame);

      counts[ch] = cur + 1;
      const kx = keyX(ch);
      if (cur === 0) {
        s.box(`k${ch}`, kx, 158, `"${ch}"`, { w: 60, h: 44, tone: 'active' });
        s.box(`v${ch}`, kx, 232, 1, { w: 60, h: 44, tone: 'ok' });
        s.edge(`e${ch}`, `k${ch}`, `v${ch}`, { tone: 'active' });
        s.snap(`get gives 0, and 0 + 1 is 1. Python adds the key "${ch}".`, { line: 3, vars: { word: word_, ch: `"${ch}"`, counts: show() }, out: '' });
      } else {
        s.tone(`k${ch}`, 'active');
        s.set(`v${ch}`, { text: cur + 1, tone: 'ok' });
        s.pulse(`v${ch}`);
        s.snap(`get gives ${cur}, and ${cur} + 1 is ${cur + 1}. The new count replaces the old one.`, { line: 3, vars: { word: word_, ch: `"${ch}"`, counts: show() }, out: '' });
      }
    });

    s.del('ptr');
    s.clearTones();
    s.snap('The loop is done. Python prints the whole dict.', { line: 4, vars: { word: word_, counts: show() }, out: show() });
  },
});

/* 6.3: a short preview of why a key must not change. */
Viz.register('m06-hashable-keys', {
  title: 'Why a list cannot be a key',
  size: [560, 270],
  code: py`
    spots = {}
    spots[(1, 2)] = "tree"
    spots[[1, 2]] = "tree"
  `,
  build(s) {
    const xs = [160, 250, 340, 430];
    xs.forEach((x, i) => {
      s.box(`b${i}`, x, 205, '', { w: 84, h: 46, tone: 'muted', sub: `spot ${i}` });
    });
    s.snap('Inside, a dict keeps its pairs in numbered spots.', { line: 1, out: '' });

    s.box('key', 90, 62, '(1, 2)', { w: 110, h: 46, tone: 'active' });
    s.snap('The key is the tuple (1, 2). A tuple cannot change.', { line: 2, out: '' });

    s.box('recipe', 300, 62, 'hash recipe', { w: 170, h: 46 });
    s.edge('in', 'key', 'recipe');
    s.snap('A recipe, called a hash, turns the key into a spot number.', { line: 2, out: '' });

    s.edge('to', 'recipe', 'b2', { label: 'say spot 2' });
    s.set('b2', { text: '"tree"', tone: 'ok' });
    s.snap('Say the recipe gives spot 2. The pair goes there.', {
      line: 2,
      out: '',
      ask: {
        q: 'Line 3 uses a list as the key. What does Python do?',
        options: ['It stores the pair, the same as before', 'It turns the list into a tuple', 'It stops with a TypeError'],
        answer: 2,
        why: 'A list can change. A changed key would lead to the wrong spot, so Python refuses.',
      },
    });

    s.del('to');
    s.set('key', { text: '[1, 2]', tone: 'warn' });
    s.snap('Now the key is the list [1, 2]. A list can change.', { line: 3, out: '' });

    s.edge('to', 'recipe', 'b0', { label: 'a new spot?', dashed: true, tone: 'bad' });
    s.snap('If the list changes, the recipe gives a new spot. Python would miss the pair.', { line: 3, out: '' });

    s.del('to', 'in');
    s.tone('key', 'bad');
    s.tone('recipe', 'muted');
    s.snap('So Python refuses to use a list as a key.', { line: 3, out: "TypeError: unhashable type: 'list'" });
  },
});
