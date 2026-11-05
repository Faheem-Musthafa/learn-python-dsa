/* Visuals for module 27: tries, Fenwick trees and segment trees. Names start with the module id.
 *
 * Every typed value goes through a reader that skips junk, so no input can break a picture.
 * Each box sits on a fixed spot, worked out from the finished shape, so nothing jumps when a word joins.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const W = 560;
  const R = 18;
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const nBoxes = n => `${n} ${n === 1 ? 'box' : 'boxes'}`;
  const whole = (v, min, max, dflt) => {
    const n = Math.round(Number(v));
    return v !== '' && v != null && Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : dflt;
  };
  const tokens = text => String(text == null ? '' : text).split(/[\s,;]+/).filter(Boolean);
  const skipNote = n => (n ? ' Some of what you typed was skipped.' : '');

  /* Options for an ask. Drops repeats, and moves the right answer around. */
  let turn = 0;
  function choices(right, wrongs) {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    turn += 1;
    const at = turn % (rest.length + 1);
    rest.splice(at, 0, String(right));
    return { options: rest, answer: at };
  }
  /* Puts a question on the frame already saved, so it shows before the next change. */
  const askOnLast = (s, ask) => { if (s.frames.length) s.frames[s.frames.length - 1].ask = ask; };

  /* Lower-case words of letters only. Anything else is skipped. */
  function readWords(text, maxWords = 5, maxLen = 5) {
    const words = [];
    let skipped = 0;
    tokens(text).forEach(t => {
      const w = t.toLowerCase();
      if (/^[a-z]+$/.test(w) && w.length <= maxLen && words.length < maxWords) words.push(w);
      else skipped += 1;
    });
    return { words, skipped };
  }
  /* One word of letters. Bad input gives an empty word. */
  function readOne(text, maxLen = 8) {
    const t = tokens(text)[0] || '';
    const w = t.toLowerCase().replace(/[^a-z]/g, '').slice(0, maxLen);
    return w;
  }
  function readNums(text, max) {
    const nums = [];
    let skipped = 0;
    tokens(text).forEach(t => {
      const n = Number(t);
      if (Number.isInteger(n) && n >= -99 && n <= 99 && nums.length < max) nums.push(n);
      else skipped += 1;
    });
    return { nums, skipped };
  }

  // ------------------------------------------------------------- trie helpers
  function makeTrie(words) {
    const root = { id: 'n', ch: '', kids: [], map: {}, end: false, path: '' };
    words.forEach(w => {
      let n = root;
      for (const ch of w) {
        if (!n.map[ch]) {
          const k = { id: 'n' + n.path + ch, ch, kids: [], map: {}, end: false, path: n.path + ch, up: n };
          n.map[ch] = k;
          n.kids.push(k);
          n.kids.sort((a, b) => (a.ch < b.ch ? -1 : 1));
        }
        n = n.map[ch];
      }
      n.end = true;
    });
    return root;
  }
  const allBoxes = n => [n, ...n.kids.flatMap(allBoxes)];
  const leafCount = n => (n.kids.length ? n.kids.reduce((a, k) => a + leafCount(k), 0) : 1);

  /* Works out where every box sits, once, from the finished trie. */
  function placeTrie(root, o = {}) {
    const leaves = leafCount(root);
    const wide = o.wide || 460;
    const xGap = Math.min(o.maxGap || 104, wide / Math.max(1, leaves - 1));
    const gap = o.gap || 50;
    const depth = n => (n.kids.length ? 1 + Math.max(...n.kids.map(depth)) : 0);
    const top = (o.top || 30) + Math.max(0, 5 - depth(root)) * Math.round(gap / 2);
    return Viz.Scene.layoutTree(root, { xGap, yGap: gap, y: top, x: o.x || W / 2 });
  }
  /* Draws one box, and the arrow from its parent. */
  function drawBox(s, n, pos, o = {}) {
    const r = o.r || R;
    const p = pos[n.id];
    if (!n.ch) s.circle(n.id, p.x, p.y, 'top', { r, size: 13 });
    else s.circle(n.id, p.x, p.y, n.ch, { r, size: o.size || 19 });
    if (n.up) s.edge('e' + n.id, n.up.id, n.id, {});
  }
  /* The name tag "node", beside the box it names. */
  function tagAt(s, p, r = R) {
    const flip = p.x > W - 110;
    const props = { x: flip ? p.x - r - 6 : p.x + r + 6, y: p.y, text: flip ? 'node >' : '< node', anchor: flip ? 'end' : 'start', opacity: 1 };
    if (s.has('tag')) s.set('tag', props);
    else s.text('tag', props.x, props.y, props.text, { size: 13, weight: 700, mono: true, anchor: props.anchor, tone: 'accent' });
  }
  const hideTag = s => { if (s.has('tag')) s.set('tag', { opacity: 0 }); };
  /* The end mark sits inside the box as a $, as the dict has a "$" key. */
  const markEnd = (s, n, small) => s.set(n.id, { text: n.ch + '$', size: small ? 14 : 17 });

  const TRIE_H = 310;
  const WORD_INPUT = value => ({ key: 'words', label: 'Words (up to 5, with 5 letters each)', type: 'text', value, size: 22 });
  const WORD_TRIES = [
    { words: '' }, { words: 'a' }, { words: 'cat cat cat' }, { words: 'to top tops' },
    { words: 'ant bee cow dog elk' }, { words: 'apple apply ape app a' }, { words: 'Cat, c4t, !!, elephant, dog' },
    { words: 'aaaaa aaaab aaabb aabbb abbbb' }, { words: 'a b c d e f g h' },
  ];

  // ---------------------------------------------------------------- lesson 27.1
  function growBuild(s, p, counts) {
    const { words, skipped } = readWords(p.words);
    const root = makeTrie(words);
    const pos = placeTrie(root);
    const line = counts
      ? { top: 3, make: 6, step: 7, tally: 8, end: 9 }
      : { top: 2, make: 5, step: 6, end: 7 };
    drawBox(s, root, pos);
    if (!words.length) {
      s.snap(`No words yet, so the top box stays empty.${skipNote(skipped)} Type some above.`, { line: line.top, vars: { boxes: 0 } });
      return;
    }
    const tally = {};
    const showCount = n => {
      if (!counts) return;
      const p = pos[n.id];
      const id = 'tally' + n.id;
      if (s.has(id)) s.set(id, { text: tally[n.id] });
      else s.text(id, p.x - R - 5, p.y, tally[n.id], { size: 15, weight: 700, mono: true, anchor: 'end' });
    };
    const drawn = new Set(['n']);
    let boxes = 0, letters = 0;
    s.snap(`The top box is an empty dict. It stands for "no letters yet".${skipNote(skipped)}`, { line: 1, vars: { boxes } });

    words.forEach(w => {
      // How much of this word is on the stage already?
      let probe = root, shared = 0;
      for (const ch of w) {
        probe = probe.map[ch];
        if (drawn.has(probe.id)) shared += 1;
      }
      const fresh = w.length - shared;
      if (!counts) {
        const c = choices(fresh, [w.length, shared, fresh + 1]);
        askOnLast(s, {
          q: `Next word: ${w}. How many new boxes will it need?`,
          options: c.options, answer: c.answer,
          why: shared
            ? `It shares ${shared === w.length ? 'all its letters' : `its first ${many(shared, 'letter')}`} with words already here. So it needs ${fresh} new.`
            : `It shares nothing yet. Each of its ${w.length} letters needs a new box.`,
        });
      } else if (shared > 0) {
        let k = root;
        for (let i = 0; i < shared; i++) k = k.map[w[i]];
        const before = tally[k.id];
        const c = choices(before + 1, [before, before + 2, 1]);
        askOnLast(s, {
          q: `Next word: ${w}. What will the count on box ${k.ch} become?`,
          options: c.options, answer: c.answer,
          why: `${w} passes through ${k.ch}, so its count goes up by 1.`,
        });
      }
      let n = root;
      s.clearTones();
      allBoxes(root).forEach(b => { if (b.done && drawn.has(b.id)) s.set(b.id, { tone: 'ok' }); });
      if (counts) {
        tally.n = (tally.n || 0) + 1;
        showCount(root);
      }
      for (const ch of w) {
        const next = n.map[ch];
        const had = drawn.has(next.id);
        if (!had) {
          drawBox(s, next, pos);
          drawn.add(next.id);
          boxes += 1;
        }
        letters += 1;
        if (counts) s.set(n.id, { tone: n.done ? 'ok' : 'default' });
        n = next;
        s.tone(n.id, 'active');
        if (counts) {
          tally[n.id] = (tally[n.id] || 0) + 1;
          showCount(n);
        } else tagAt(s, pos[n.id]);
        s.snap(had ? `${ch} is already here. Share it, and step down.` : `No ${ch} here yet. Make a new box, and step down.`, {
          line: counts ? line.tally : had ? line.step : line.make,
          vars: { word: w, ch, boxes, letters },
        });
      }
      const again = n.done;
      n.end = true;
      n.done = true;
      markEnd(s, n);
      s.tone(n.id, 'ok');
      s.snap(again ? `${w} is already marked. No new mark is added.` : `The letters run out. Put the end mark $ here, so ${w} is a word.`, {
        line: line.end, vars: { word: w, boxes, letters },
      });
    });
    hideTag(s);
    s.clearTones();
    allBoxes(root).forEach(b => { if (b.done) s.set(b.id, { tone: 'ok' }); });
    if (counts) {
      const first = words[0].slice(0, Math.min(2, words[0].length));
      let k = root;
      for (const ch of first) k = k.map[ch];
      const right = tally[k.id];
      const c = choices(right, [right + 1, Math.max(0, right - 1), words.length + 1]);
      askOnLast(s, {
        q: `How many words start with ${first}? Read it from the picture.`,
        options: c.options, answer: c.answer,
        why: `The count on that box is ${right}. No need to look at the boxes below it.`,
      });
      s.snap(`The box for ${first} says ${right}. One short walk gives the answer.`, { line: 0, vars: { start: first, count: right } });
      return;
    }
    const c = choices(boxes, [letters, boxes + 1, Math.max(1, boxes - 1)]);
    askOnLast(s, {
      q: 'How many boxes are there now, leaving out the top one?',
      options: c.options, answer: c.answer,
      why: 'Count the letters on the picture. A shared letter is one box, however many words use it.',
    });
    s.snap(boxes < letters
      ? `${many(letters, 'letter')} fit in ${nBoxes(boxes)}, because shared starts are stored once.`
      : `${many(letters, 'letter')} need ${nBoxes(boxes)}. These words share no starts, so nothing is saved.`, {
      line: 0, vars: { boxes, letters },
    });
  }

  Viz.register('m27-trie-grow', {
    title: 'Words share their starts',
    size: [W, TRIE_H],
    code: py`
      def add(trie, word):
          node = trie
          for ch in word:
              if ch not in node:
                  node[ch] = {}
              node = node[ch]
          node[END] = True
    `,
    inputs: [WORD_INPUT('car cart care cat dog')],
    tryInputs: WORD_TRIES,
    build(s, p) { growBuild(s, p, false); },
  });

  Viz.register('m27-trie-walk', {
    title: 'Ask the trie a question',
    size: [W, TRIE_H],
    code: py`
      def find_node(trie, text):
          node = trie
          for ch in text:
              if ch not in node:
                  return None
              node = node[ch]
          return node

      # has_word: node is not None and END in node
      # starts_with: node is not None
    `,
    inputs: [
      WORD_INPUT('car cart care cat dog'),
      { key: 'text', label: 'Letters to look for', type: 'text', value: 'ca', size: 8 },
      { key: 'job', label: 'Question', type: 'select', value: 'has_word', options: ['has_word', 'starts_with'] },
    ],
    tryInputs: [
      { words: '', text: 'cat', job: 'has_word' }, { words: '', text: '', job: 'starts_with' }, { words: 'cat', text: '', job: 'has_word' },
      { words: 'cat', text: 'cat', job: 'has_word' }, { words: 'cat', text: 'catch', job: 'starts_with' }, { words: 'cat dog', text: 'x', job: 'has_word' },
      { words: 'car cart', text: 'car', job: 'starts_with' }, { words: 'car', text: 'C4R!', job: 'has_word' }, { words: 'car', text: 'caaaaaaaaaaaaar', job: 'other' },
    ],
    build(s, p) {
      const { words, skipped } = readWords(p.words);
      const text = readOne(p.text);
      const job = p.job === 'starts_with' ? 'starts_with' : 'has_word';
      const root = makeTrie(words);
      const pos = placeTrie(root);
      allBoxes(root).forEach(b => {
        drawBox(s, b, pos);
        if (b.end) markEnd(s, b);
      });
      const call = `${job}("${text}")`;
      tagAt(s, pos.n);
      s.tone('n', 'active');
      s.snap(`Now ask: ${call}. The tag starts at the top box.${skipNote(skipped)}`, { line: 2, vars: { text: text || 'nothing' } });
      let n = root, missing = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = n.map[ch];
        if (i === 0 || i % 2 === 0 || !next) {
          askOnLast(s, {
            q: `Is there a box for ${ch} below this one?`,
            options: ['Yes', 'No'],
            answer: next ? 0 : 1,
            why: next ? `This box has a key ${ch}, so the walk goes on.` : `This box has no key ${ch}. No word here goes that way.`,
          });
        }
        if (!next) { missing = ch; break; }
        n = next;
        s.clearTones();
        s.tone(n.id, 'active');
        tagAt(s, pos[n.id]);
        s.snap(`${ch} is here, so the tag steps down.`, { line: 6, vars: { ch, text } });
      }
      if (missing) {
        s.tone(n.id, 'bad');
        s.snap(`No ${missing}, so find_node gives None. Both questions say False.`, { line: 5, vars: { ch: missing, answer: 'False' }, out: 'False' });
        return;
      }
      const right = job === 'starts_with' ? true : n.end;
      askOnLast(s, {
        q: `The walk ended safely. What does ${call} say?`,
        options: ['True', 'False'],
        answer: right ? 0 : 1,
        why: job === 'starts_with'
          ? 'A start only needs the path to exist, and it does.'
          : n.end ? 'This box has an end mark, so a whole word stops here.' : 'The path exists, but this box has no end mark. No word stops here.',
      });
      s.tone(n.id, right ? 'ok' : 'warn');
      const say = job === 'starts_with'
        ? 'The path exists, so starts_with says True. It never reads the end mark.'
        : n.end ? 'End mark found, so has_word says True.' : 'No end mark here, so has_word says False. The path alone is not a word.';
      s.snap(say, { line: 7, vars: { answer: right ? 'True' : 'False' }, out: right ? 'True' : 'False' });
    },
  });

  // ---------------------------------------------------------------- lesson 27.2
  Viz.register('m27-trie-suggest', {
    title: 'List every word below a box',
    size: [W, TRIE_H],
    code: py`
      def collect(node, sofar, found):
          if END in node:
              found.append(sofar)
          for ch in sorted(node):
              if ch != END:
                  collect(node[ch], sofar + ch, found)
    `,
    inputs: [
      WORD_INPUT('cat car cart care dog'),
      { key: 'start', label: 'Start of the word', type: 'text', value: 'ca', size: 8 },
    ],
    tryInputs: [
      { words: '', start: 'a' }, { words: '', start: '' }, { words: 'cat', start: '' }, { words: 'cat', start: 'cat' },
      { words: 'cat', start: 'dog' }, { words: 'cat', start: 'catch' }, { words: 'a ab abc abcd abcde', start: 'a' },
      { words: 'ant bee cow dog elk', start: '' }, { words: 'cat', start: '!!' },
    ],
    build(s, p) {
      const { words, skipped } = readWords(p.words);
      const start = readOne(p.start);
      const root = makeTrie(words);
      const pos = placeTrie(root);
      allBoxes(root).forEach(b => {
        drawBox(s, b, pos);
        if (b.end) markEnd(s, b);
      });
      let n = root;
      s.tone('n', 'active');
      tagAt(s, pos.n);
      s.snap(`First walk down to the box for "${start}".${skipNote(skipped)}`, { line: 0, vars: { start: start || 'nothing' } });
      for (const ch of start) {
        const next = n.map[ch];
        if (!next) {
          s.tone(n.id, 'bad');
          s.snap(`There is no box for ${ch} here. So no word has this start. The list stays empty.`, { line: 0, vars: { found: 'nothing' }, out: '[]' });
          return;
        }
        n = next;
        s.clearTones();
        s.tone(n.id, 'active');
        tagAt(s, pos[n.id]);
        s.snap(`Step down to ${ch}.`, { line: 0, vars: { sofar: n.path } });
      }
      const found = [];
      const seen = [];
      const visits = [];
      (function walk(b) { visits.push(b); b.kids.forEach(walk); })(n);
      const under = visits.filter(b => b.end).map(b => b.path);
      visits.forEach((b, i) => {
        s.clearTones();
        seen.forEach(x => s.set(x.id, { tone: x.end ? 'ok' : 'muted' }));
        s.tone(b.id, 'active');
        tagAt(s, pos[b.id]);
        if (b.end) {
          found.push(b.path);
          s.snap(`This box has an end mark. So "${b.path}" goes in the list.`, { line: 3, vars: { sofar: b.path, found: found.length }, out: found.join('\n') });
        } else {
          s.snap(`No end mark on "${b.path || 'top'}". Keep going down.`, { line: 2, vars: { sofar: b.path, found: found.length }, out: found.join('\n') });
        }
        seen.push(b);
        // Before the walk chooses a side, ask which side sorted picks.
        if (b.kids.length >= 2) {
          const c = choices(b.kids[0].ch, b.kids.slice(1).map(k => k.ch));
          askOnLast(s, {
            q: `Letters below: ${b.kids.map(k => k.ch).sort().reverse().join(', ')}. Which does sorted visit first?`,
            options: c.options, answer: c.answer,
            why: `sorted gives letters in alphabet order, so ${b.kids[0].ch} comes first.`,
          });
        } else {
          const nextWord = under[found.length];
          if (nextWord && i + 1 < visits.length && visits[i + 1].end && under.length > 1) {
            const c = choices(nextWord, under.filter(w => w !== nextWord).concat(n.path + '?'));
            askOnLast(s, {
              q: 'Which word goes in the list next?',
              options: c.options, answer: c.answer,
              why: `The walk steps straight down to ${nextWord}, and that box has an end mark.`,
            });
          }
        }
      });
      hideTag(s);
      s.clearTones();
      visits.forEach(x => s.set(x.id, { tone: x.end ? 'ok' : 'muted' }));
      s.snap(found.length
        ? `Done, with ${many(found.length, 'word')} from ${many(visits.length, 'visit')}. A word always comes before longer words that start with it.`
        : 'Done. No end mark was below this box.', { line: 0, vars: { found: found.length }, out: found.join('\n') });
    },
  });

  Viz.register('m27-trie-count', {
    title: 'Each box keeps a count',
    size: [W, TRIE_H],
    code: py`
      def add(trie, word):
          node = trie
          node["count"] = node.get("count", 0) + 1
          for ch in word:
              if ch not in node:
                  node[ch] = {}
              node = node[ch]
              node["count"] = node.get("count", 0) + 1
          node[END] = True
    `,
    inputs: [WORD_INPUT('car cat care dog')],
    tryInputs: WORD_TRIES,
    build(s, p) { growBuild(s, p, true); },
  });

  Viz.register('m27-stem-walk', {
    title: 'Stop at the first end mark',
    size: [W, TRIE_H],
    code: py`
      def shorten(trie, word):
          node = trie
          sofar = ""
          for ch in word:
              if ch not in node:
                  return word
              node = node[ch]
              sofar = sofar + ch
              if END in node:
                  return sofar
          return word
    `,
    inputs: [
      { key: 'stems', label: 'Stems (up to 5, with 5 letters each)', type: 'text', value: 'sun sunny re run', size: 20 },
      { key: 'word', label: 'Word to shorten', type: 'text', value: 'sunny', size: 10 },
    ],
    tryInputs: [
      { stems: '', word: 'cat' }, { stems: 'cat', word: '' }, { stems: 'cat', word: 'cat' }, { stems: 'cat', word: 'ca' }, { stems: 'cat', word: 'dog' },
      { stems: 'a aa aaa', word: 'aaaa' }, { stems: 'play player', word: 'player' }, { stems: 'play', word: 'pl4y!' }, { stems: 'run re', word: 'rerun' },
    ],
    build(s, p) {
      const { words: stems, skipped } = readWords(p.stems);
      const word = readOne(p.word, 10);
      const root = makeTrie(stems);
      const pos = placeTrie(root);
      allBoxes(root).forEach(b => {
        drawBox(s, b, pos);
        if (b.end) markEnd(s, b);
      });
      s.tone('n', 'active');
      tagAt(s, pos.n);
      s.snap(`Shorten "${word}". Walk its letters from the top box.${skipNote(skipped)}`, { line: 2, vars: { word: word || 'nothing', sofar: '' } });
      let n = root, sofar = '';
      if (!word) {
        s.snap('The word has no letters, so the loop never runs. It stays as it is.', { line: 11, vars: { answer: 'nothing' }, out: '' });
        return;
      }
      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const next = n.map[ch];
        if (i === 0 || !next) {
          askOnLast(s, {
            q: `The next letter is ${ch}. Is there a box for it here?`,
            options: ['Yes', 'No'], answer: next ? 0 : 1,
            why: next ? `There is, so the walk steps down.` : `There is none, so no stem can match this word.`,
          });
        }
        if (!next) {
          s.tone(n.id, 'bad');
          s.snap(`No box for ${ch}. No stem fits, so the whole word stays: ${word}.`, { line: 6, vars: { ch, answer: word }, out: word });
          return;
        }
        n = next;
        sofar += ch;
        s.clearTones();
        s.tone(n.id, 'active');
        tagAt(s, pos[n.id]);
        s.snap(`Step down to ${ch}. The letters so far are "${sofar}".`, { line: 8, vars: { ch, sofar } });
        if (n.end) {
          const c = choices(`Return "${sofar}" now`, ['Keep walking for a longer stem', `Return "${word}"`]);
          askOnLast(s, {
            q: 'This box has an end mark. What does the code do?',
            options: c.options, answer: c.answer,
            why: 'It wants the shortest stem. The first end mark on the walk is the shortest one.',
          });
          s.tone(n.id, 'ok');
          s.snap(`End mark! The walk stops here, and the answer is "${sofar}".`, { line: 10, vars: { sofar, answer: sofar }, out: sofar });
          return;
        }
      }
      s.tone(n.id, 'warn');
      s.snap(`The word ran out, with no end mark on the way. It stays: ${word}.`, { line: 11, vars: { answer: word }, out: word });
    },
  });

  /* Reads rows of letters. Rows are cut to one length, so the grid stays square-cornered. */
  function readGrid(text) {
    const rows = tokens(text).map(t => t.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3)).filter(Boolean).slice(0, 3);
    if (!rows.length) return [];
    const cols = Math.min(...rows.map(r => r.length));
    return rows.map(r => r.slice(0, cols).split(''));
  }
  Viz.register('m27-grid-trie', {
    title: 'Walk the grid and the trie together',
    size: [W, 300],
    code: py`
      def find(r, c, node, sofar):
          if not on_board(r, c):
              return
          ch = board[r][c]
          if ch not in node:
              return
          node = node[ch]
          sofar = sofar + ch
          if END in node:
              found.add(sofar)
          board[r][c] = "#"
          for dr, dc in MOVES:
              find(r + dr, c + dc, node, sofar)
          board[r][c] = ch
    `,
    inputs: [
      { key: 'grid', label: 'Grid (rows, up to 3 by 3)', type: 'text', value: 'cat ore dog', size: 14 },
      { key: 'words', label: 'Words (up to 5)', type: 'text', value: 'cat car core dog door', size: 20 },
    ],
    tryInputs: [
      { grid: '', words: 'cat' }, { grid: 'cat ore dog', words: '' }, { grid: 'c', words: 'c' }, { grid: 'a', words: 'b' }, { grid: 'ab', words: 'ab ba' },
      { grid: 'aaa aaa aaa', words: 'aaaaa aaa' }, { grid: 'ab cde f', words: 'ac' }, { grid: '!! 12', words: 'cat' }, { grid: 'cat ore dog', words: 'xyz' },
    ],
    build(s, p) {
      const grid = readGrid(p.grid);
      const { words, skipped } = readWords(p.words);
      if (!grid.length) {
        s.text('none', 280, 120, 'Type rows of letters above.', { size: 16, weight: 700 });
        s.snap('There is no grid, so no word can be found.', { line: 0, vars: { found: 'nothing' } });
        return;
      }
      const root = makeTrie(words);
      const pos = placeTrie(root, { wide: 300, maxGap: 76, gap: 48, top: 30, x: 375 });
      const rows = grid.length, cols = grid[0].length;
      const cx = c => 44 + c * 52, cy = r => 80 + r * 52;
      const cell = (r, c) => `g${r}_${c}`;
      grid.forEach((row, r) => row.forEach((ch, c) => s.box(cell(r, c), cx(c), cy(r), ch, { w: 46, h: 46 })));
      s.text('gl', 96, 30, 'The grid', { size: 14, weight: 700 });
      allBoxes(root).forEach(b => {
        drawBox(s, b, pos, { r: 16, size: 17 });
        if (b.end) markEnd(s, b, true);
      });

      // Work out the whole walk first, so each question can look one step ahead.
      const events = [];
      const used = new Set();
      const foundAll = new Set();
      const MOVES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const walk = (r, c, up) => {
        const n = up.map[grid[r][c]];
        used.add(cell(r, c));
        const isNew = n.end && !foundAll.has(n.path);
        if (n.end) foundAll.add(n.path);
        events.push({ t: 'enter', r, c, n, isNew, end: n.end });
        MOVES.forEach(([dr, dc]) => {
          const a = r + dr, b = c + dc;
          if (a < 0 || b < 0 || a >= rows || b >= cols || used.has(cell(a, b))) return;
          if (n.map[grid[a][b]]) walk(a, b, n);
        });
        used.delete(cell(r, c));
        events.push({ t: 'back', r, c, n });
      };
      let skip = [];
      const flush = () => { if (skip.length) { events.push({ t: 'skip', cells: skip }); skip = []; } };
      grid.forEach((row, r) => row.forEach((ch, c) => {
        if (root.map[ch]) { flush(); walk(r, c, root); } else skip.push([r, c]);
      }));
      flush();
      // Walking back through many cells is one idea, so it gets one frame.
      const merged = [];
      events.forEach(e => {
        const last = merged[merged.length - 1];
        if (e.t === 'back' && last && last.t === 'back') {
          last.cells.push([e.r, e.c]);
          last.to = e.n.up;
        } else if (e.t === 'back') {
          merged.push({ t: 'back', n: e.n, to: e.n.up, cells: [[e.r, e.c]] });
        } else merged.push(e);
      });
      events.length = 0;
      merged.forEach(e => events.push(e));

      const kindOf = e => (!e ? '' : e.t === 'skip' ? 'These cells start no word'
        : e.t === 'back' ? 'Dead end, walk back'
          : e.end ? 'A word is found' : 'The walk goes deeper');
      const KINDS = ['A word is found', 'The walk goes deeper', 'Dead end, walk back', 'These cells start no word'];
      let steps = 0;
      const found = [];
      const vars = () => ({ found: found.length ? found.join(' ') : 'nothing', steps });
      s.snap(`Each step in the grid is also a step down the trie.${skipNote(skipped)}`, { line: 1, vars: vars() });
      const LIMIT = 31;
      const shown = Math.min(events.length, LIMIT);
      for (let i = 0; i < shown; i++) {
        const e = events[i];
        if (e.t === 'skip') {
          e.cells.forEach(([r, c]) => s.set(cell(r, c), { tone: 'muted' }));
          s.snap(`${e.cells.map(([r, c]) => grid[r][c]).join(', ')}: the top box has no such letter. Skip at once.`, { line: 6, vars: vars() });
        } else if (e.t === 'enter') {
          steps += 1;
          s.set(cell(e.r, e.c), { tone: 'active', text: grid[e.r][e.c] });
          s.clearTones(grid.flatMap((row, r) => row.map((_, c) => cell(r, c))));
          s.tone(e.n.id, e.end ? 'ok' : 'active');
          if (e.isNew) found.push(e.n.path);
          s.snap(e.end ? `"${e.n.path}" has an end mark, so it is a word. Keep it, and go on.` : `Step to ${grid[e.r][e.c]}. The trie has a box for "${e.n.path}".`, { line: e.end ? 10 : 8, vars: vars() });
        } else {
          e.cells.forEach(([r, c]) => s.set(cell(r, c), { tone: 'default' }));
          s.clearTones(grid.flatMap((row, r) => row.map((_, c) => cell(r, c))));
          if (e.to && e.to.ch) s.tone(e.to.id, 'active');
          s.snap(`From "${e.n.path}", no free neighbour has a box below. Walk back to "${e.to && e.to.path ? e.to.path : 'top'}".`, { line: 14, vars: vars() });
        }
        const nextOne = events[i + 1];
        if (nextOne && i < shown - 1 && i % 3 === 1) {
          const right = KINDS.indexOf(kindOf(nextOne));
          askOnLast(s, {
            q: 'What happens next? Check the neighbours and the trie.',
            options: KINDS, answer: right,
            why: nextOne.t === 'enter'
              ? `A neighbour holds ${grid[nextOne.r][nextOne.c]}, and the trie has a box for "${nextOne.n.path}".`
              : nextOne.t === 'back' ? 'No free neighbour has a box below this one.' : 'The top box has no key for these letters.',
          });
        }
      }
      if (events.length > shown) {
        events.slice(shown).forEach(e => {
          if (e.t === 'enter') {
            steps += 1;
            if (e.isNew) found.push(e.n.path);
          }
        });
      }
      s.clearTones();
      grid.forEach((row, r) => row.forEach((ch, c) => s.set(cell(r, c), { tone: 'default' })));
      s.snap(`${events.length > shown ? 'The rest runs the same way. ' : ''}Found ${many(found.length, 'word')}, with ${many(steps, 'step')} in the grid.`, { line: 0, vars: vars() });
    },
  });

  // ---------------------------------------------------------------- lesson 27.4
  Viz.register('m27-prefix-break', {
    title: 'One change, many fixes',
    size: [W, 270],
    code: py`
      nums[spot] = nums[spot] + change
      for i in range(spot + 1, len(prefix)):
          prefix[i] = prefix[i] + change
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 numbers)', type: 'text', value: '4 1 3 2 6 5', size: 16 },
      { key: 'spot', label: 'Change spot', type: 'number', value: 0, min: 0, max: 5 },
      { key: 'change', label: 'Add', type: 'number', value: 2, min: -9, max: 9 },
    ],
    tryInputs: [
      { nums: '', spot: 0, change: 2 }, { nums: '7', spot: 0, change: 2 }, { nums: '4 1 3 2 6 5', spot: 5, change: 2 }, { nums: '4 1 3', spot: 5, change: 2 },
      { nums: '4 1 3', spot: 1, change: 0 }, { nums: '-5 -5', spot: 0, change: -9 }, { nums: 'cat', spot: 'x', change: 'y' }, { nums: '1 2 3 4 5 6 7 8 9', spot: 2, change: 1 },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.nums, 6);
      const n = nums.length;
      const change = whole(p.change, -9, 9, 2);
      s.box('st', 500, 34, 0, { w: 64, h: 40, sub: 'steps' });
      if (!n) {
        s.text('none', 280, 130, 'The list is empty.', { size: 18, weight: 700 });
        s.snap('An empty list has no item to change, so nothing needs fixing.', { line: 0, vars: { steps: 0 } });
        return;
      }
      const spot = whole(p.spot, 0, n - 1, 0);
      const prefix = [0];
      nums.forEach(v => prefix.push(prefix[prefix.length - 1] + v));
      const top = { y: 96, cell: 52, x: 280 - 29 };
      const low = { y: 196, cell: 52, x: 280 };
      s.text('l1', 18, top.y - 44, 'nums', { size: 14, weight: 700, anchor: 'start', mono: true });
      s.text('l2', 18, low.y - 44, 'prefix', { size: 14, weight: 700, anchor: 'start', mono: true });
      s.row('a', nums, top);
      s.row('p', prefix, low);
      s.snap(`The prefix list is ready. It answers any range sum in one step.${skipNote(skipped)}`, { line: 0, vars: { spot, change, steps: 0 } });
      const need = n - spot;
      const c = choices(need, [1, n + 1, Math.max(1, need - 1)]);
      askOnLast(s, {
        q: `Spot ${spot} changes. How many prefix totals must change too?`,
        options: c.options, answer: c.answer,
        why: `Each total from prefix[${spot + 1}] to prefix[${n}] includes spot ${spot}. That is ${many(need, 'total')}.`,
      });
      let steps = 1;
      nums[spot] += change;
      s.set('a' + spot, { text: nums[spot], tone: 'warn' });
      s.set('st', { text: steps });
      s.snap(change === 0 ? 'Adding 0 changes no values. The code still walks the same totals.' : `Spot ${spot} changes by ${change}. That is one quick step.`, { line: 1, vars: { spot, change, steps } });
      for (let i = spot + 1; i <= n; i++) {
        s.clearTones(['a' + spot]);
        prefix[i] += change;
        steps += 1;
        s.set('p' + i, { text: prefix[i], tone: 'active' });
        s.set('st', { text: steps });
        s.snap(`prefix[${i}] includes spot ${spot}, so it must change too.`, { line: 3, vars: { i, steps } });
      }
      s.clearTones();
      s.snap(spot === 0
        ? `${many(need, 'total')} changed. A change near the start touches nearly the whole list.`
        : `${many(need, 'total')} changed. Only a change near the end is cheap. Try spot 0 next.`, { line: 0, vars: { steps } });
    },
  });

  /* Fenwick picture. Every box is drawn over the items it covers, one row per size. */
  const FW = 500;
  const fenX = (i, n) => FW / 2 + (i - (n + 1) / 2) * 60;
  const fenSize = i => i & -i;
  const fenY = i => 205 - 48 * Math.log2(fenSize(i));
  function fenBoxes(nums) {
    const n = nums.length;
    const boxes = new Array(n + 1).fill(0);
    nums.forEach((v, k) => {
      for (let i = k + 1; i <= n; i += fenSize(i)) boxes[i] += v;
    });
    return boxes;
  }
  function drawItems(s, n, values) {
    for (let i = 1; i <= n; i++) {
      s.box('it' + i, fenX(i, n), 264, values ? values[i - 1] : '', { w: 52, h: 40, tone: 'default' });
      s.text('il' + i, fenX(i, n), 296, 'item ' + i, { size: 13, tone: 'muted' });
    }
  }
  function drawOneBox(s, i, n, value) {
    const size = fenSize(i);
    const x = (fenX(i - size + 1, n) + fenX(i, n)) / 2;
    const w = (size - 1) * 60 + 52;
    s.box('b' + i, x, fenY(i), value, { w, h: 28, size: 17 });
    s.text('bl' + i, x, fenY(i) - 22, 'box ' + i, { size: 13, weight: 700 });
  }
  const itemsOf = i => {
    const out = [];
    for (let k = i - fenSize(i) + 1; k <= i; k++) out.push(k);
    return out;
  };
  const coverText = i => (fenSize(i) === 1 ? `item ${i}` : `items ${i - fenSize(i) + 1} to ${i}`);

  Viz.register('m27-fen-boxes', {
    title: 'What each box covers',
    size: [FW, 310],
    inputs: [{ key: 'n', label: 'How many items', type: 'number', value: 8, min: 1, max: 8 }],
    tryInputs: [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 7 }, { n: 8 }, { n: 'x' }, { n: 99 }],
    build(s, p) {
      const n = whole(p.n, 1, 8, 8);
      drawItems(s, n);
      s.snap('Here are the items. We count them from 1 this time. Boxes will sit above them.', { vars: { items: n } });
      for (let i = 1; i <= n; i++) {
        const size = fenSize(i);
        if (i === 2 || i === 4 || i === 6) {
          const c = choices(size, [1, 2, 4, i].filter(x => x !== size));
          askOnLast(s, {
            q: `Box ${i} ends at item ${i}. How many items does it cover?`,
            options: c.options, answer: c.answer,
            why: `${size} is the biggest of 1, 2, 4, 8 that divides ${i} with nothing left over.`,
          });
        }
        s.clearTones();
        drawOneBox(s, i, n, size);
        s.tone('b' + i, 'active');
        itemsOf(i).forEach(k => s.tone('it' + k, 'active'));
        s.snap(`Box ${i} covers ${coverText(i)}. Its size is ${size}.`, { vars: { box: i, size } });
      }
      s.clearTones();
      if (n >= 3) {
        const holders = [];
        for (let i = 3; i <= n; i += fenSize(i)) holders.push(i);
        const c = choices(holders.join(', '), ['1, 2, 3', '3', '3, 4, 5, 6, 7, 8'].filter(x => x !== holders.join(', ')));
        s.tone('it3', 'warn');
        s.snap('Find item 3 at the bottom. Look straight up from it.', { vars: { item: 3 } });
        askOnLast(s, {
          q: 'Which boxes cover item 3?',
          options: c.options, answer: c.answer,
          why: `Boxes ${holders.join(', ')} sit above item 3. No other box reaches it.`,
        });
        holders.forEach(i => s.tone('b' + i, 'warn'));
        s.snap(`Boxes ${holders.join(', ')} cover item 3. So few boxes hold any one item.`, { vars: { item: 3, boxes: holders.length } });
        s.clearTones();
      }
      s.snap('Each box ends at its own number. Its size is the biggest of 1, 2, 4, 8 that divides it.', { vars: { items: n } });
    },
  });

  const FEN_NUMS = { key: 'nums', label: 'nums (up to 8 numbers)', type: 'text', value: '4 1 3 2 6 5 2 7', size: 18 };
  const noItems = s => {
    s.text('none', FW / 2, 130, 'The list is empty.', { size: 18, weight: 700 });
    s.snap('There are no items, so there are no boxes.', { line: 0, vars: { steps: 0 } });
  };

  Viz.register('m27-fen-total', {
    title: 'Add the first i items',
    size: [FW, 310],
    code: py`
      def total(boxes, i):
          answer = 0
          while i > 0:
              answer = answer + boxes[i]
              i = i - size(i)
          return answer
    `,
    inputs: [FEN_NUMS, { key: 'i', label: 'i, how many items to add', type: 'number', value: 7, min: 0, max: 8 }],
    tryInputs: [
      { nums: '', i: 3 }, { nums: '5', i: 1 }, { nums: '5', i: 0 }, { nums: '4 1 3', i: 8 }, { nums: '4 1 3 2 6 5 2 7', i: 8 },
      { nums: '-9 -9 -9 -9 -9 -9 -9 -9', i: 7 }, { nums: 'cat', i: 1 }, { nums: '1 2 3 4', i: 'x' }, { nums: '99 99 99 99 99 99 99 99', i: 8 },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.nums, 8);
      const n = nums.length;
      if (!n) return noItems(s);
      const boxes = fenBoxes(nums);
      drawItems(s, n, nums);
      for (let k = 1; k <= n; k++) drawOneBox(s, k, n, boxes[k]);
      let i = whole(p.i, 0, n, Math.min(7, n));
      const start = i;
      let answer = 0, steps = 0;
      s.snap(`total(${i}) wants the first ${many(i, 'item')}. Each box shows its total.${skipNote(skipped)}`, { line: 2, vars: { i, answer, steps } });
      if (i === 0) {
        s.snap('i is 0, so the loop never runs. The first 0 items add up to 0.', { line: 6, vars: { i, answer, steps } });
        return;
      }
      while (i > 0) {
        answer += boxes[i];
        steps += 1;
        s.tone('b' + i, 'active');
        itemsOf(i).forEach(k => s.tone('it' + k, 'ok'));
        const size = fenSize(i);
        s.snap(`Box ${i} holds the total of ${coverText(i)}. Add its ${boxes[i]}.`, { line: 4, vars: { i, answer, steps } });
        const next = i - size;
        if (next > 0) {
          const c = choices(`Box ${next}`, [`Box ${i - 1 === next ? Math.max(1, i - 2) : i - 1}`, `Box ${i + size <= n ? i + size : Math.max(1, next - 1)}`, 'Stop']);
          askOnLast(s, {
            q: `Items down to ${next + 1} are done. Which box do you read next?`,
            options: c.options, answer: c.answer,
            why: `Item ${next} is the next one to cover, and box ${next} ends there. That is i minus size(i).`,
          });
        } else {
          const c = choices('Stop', [`Box ${Math.max(1, i - 1)}`, 'Box 0']);
          askOnLast(s, {
            q: `Box ${i} reaches item 1. What happens next?`,
            options: c.options, answer: c.answer,
            why: 'i becomes 0. Every item is covered, so the loop stops.',
          });
        }
        i = next;
        s.tone('b' + (i + size), 'ok');
      }
      s.snap(`i is 0, so stop. The answer is ${answer}, from ${nBoxes(steps)}. A loop over items takes ${start}.`, { line: 6, vars: { i, answer, steps } });
    },
  });

  Viz.register('m27-fen-add', {
    title: 'Change one item',
    size: [FW, 310],
    code: py`
      def add(boxes, i, change):
          while i < len(boxes):
              boxes[i] = boxes[i] + change
              i = i + size(i)
    `,
    inputs: [
      FEN_NUMS,
      { key: 'i', label: 'Item to change', type: 'number', value: 3, min: 1, max: 8 },
      { key: 'change', label: 'Add', type: 'number', value: 5, min: -9, max: 9 },
    ],
    tryInputs: [
      { nums: '', i: 1, change: 1 }, { nums: '5', i: 1, change: 1 }, { nums: '4 1 3 2 6 5 2 7', i: 1, change: 2 }, { nums: '4 1 3 2 6 5 2 7', i: 8, change: 2 },
      { nums: '4 1 3', i: 8, change: 2 }, { nums: '1 2 3 4', i: 2, change: 0 }, { nums: '-9 -9', i: 'x', change: 'y' }, { nums: 'cat', i: 2, change: 3 },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.nums, 8);
      const n = nums.length;
      if (!n) return noItems(s);
      const boxes = fenBoxes(nums);
      drawItems(s, n, nums);
      for (let k = 1; k <= n; k++) drawOneBox(s, k, n, boxes[k]);
      const item = whole(p.i, 1, n, Math.min(3, n));
      const change = whole(p.change, -9, 9, 5);
      let i = item, steps = 0;
      nums[item - 1] += change;
      s.set('it' + item, { text: nums[item - 1], tone: 'warn' });
      s.snap(`Item ${item} changes by ${change}. Which boxes include it? Only those need fixing.${skipNote(skipped)}`, { line: 1, vars: { i, change, steps } });
      while (i <= n) {
        boxes[i] += change;
        steps += 1;
        s.set('b' + i, { text: boxes[i], tone: 'active' });
        s.snap(`Box ${i} covers ${coverText(i)}, so it changes by ${change}.`, { line: 3, vars: { i, change, steps } });
        const size = fenSize(i);
        const next = i + size;
        const stop = next > n;
        const right = stop ? 'Stop, no such box' : `Box ${next}`;
        const c = choices(right, [`Box ${Math.min(n, i + 1) === next ? Math.max(1, i - 1) : Math.min(n, i + 1)}`, stop ? `Box ${Math.max(1, i - size)}` : 'Stop, no such box']);
        askOnLast(s, {
          q: `size(${i}) is ${size}, so i + size(i) is ${next}. What comes next?`,
          options: c.options, answer: c.answer,
          why: stop ? `This list has no box ${next}, so the loop stops.` : `Box ${next} is the next box that also covers item ${item}.`,
        });
        s.tone('b' + i, 'ok');
        i = next;
      }
      s.snap(`The loop stops. Only ${nBoxes(steps)} changed, out of ${n}. Every total is right again.`, { line: 2, vars: { i, change, steps } });
    },
  });

  // ---------------------------------------------------------------- lesson 27.5 and 27.6
  function segTree(nums, join) {
    const make = (lo, hi) => {
      const n = { id: `s${lo}_${hi}`, lo, hi, left: null, right: null, val: 0 };
      if (hi - lo === 1) n.val = nums[lo];
      else {
        const mid = Math.floor((lo + hi) / 2);
        n.left = make(lo, mid);
        n.right = make(mid, hi);
        n.val = join(n.left.val, n.right.val);
      }
      return n;
    };
    return make(0, nums.length);
  }
  const segAll = n => (n ? [n, ...segAll(n.left), ...segAll(n.right)] : []);
  const segPost = n => (n ? [...segPost(n.left), ...segPost(n.right), n] : []);
  const rangeText = n => `${n.lo}:${n.hi}`;
  const SEG_H = 310;
  /* A mark as well as a colour: a tick for all inside, a cross for all outside. */
  const markBox = (s, node, mark) => {
    const t = mark + node.val;
    s.set(node.id, { text: t, size: t.length > 4 ? 14 : t.length > 3 ? 15 : 19 });
  };
  function drawSeg(s, root, opts = {}) {
    const n = root.hi;
    const pos = Viz.Scene.layoutTree(root, { xGap: Math.min(84, 500 / Math.max(1, n - 1)), yGap: 70, y: 56, x: 280 });
    segAll(root).forEach(b => {
      s.box(b.id, pos[b.id].x, pos[b.id].y, opts.blank ? '' : b.val, { w: 56, h: 34, sub: rangeText(b) });
      if (!opts.blank) s.set(b.id, { size: String(b.val).length > 3 ? 17 : 19 });
      if (b.left) s.edge('e' + b.left.id, b.id, b.left.id, { arrow: false });
      if (b.right) s.edge('e' + b.right.id, b.id, b.right.id, { arrow: false });
    });
    return pos;
  }
  const SEG_NUMS = { key: 'nums', label: 'nums (up to 8 numbers)', type: 'text', value: '4 1 3 2 6 5', size: 18 };
  const SEG_EMPTY = s => {
    s.text('none', 280, 130, 'The list is empty, so there is no tree.', { size: 17, weight: 700 });
    s.snap('Build needs at least 1 item. Check for an empty list first.', { line: 0, vars: { boxes: 0 } });
  };
  const SEG_TRIES = [
    { nums: '' }, { nums: '5' }, { nums: '5 7' }, { nums: '1 2 3' }, { nums: '1 2 3 4 5 6 7 8' }, { nums: '-99 -99 -99 -99 -99 -99 -99 -99' },
    { nums: '99 99 99 99 99 99 99 99' }, { nums: 'cat' }, { nums: '1 2 3 4 5 6 7 8 9 10' },
  ];

  Viz.register('m27-seg-build', {
    title: 'Build the scoreboard from the bottom up',
    size: [W, SEG_H],
    code: py`
      def build(nums, lo, hi):
          node = SegNode(lo, hi)
          if hi - lo == 1:
              node.total = nums[lo]
              return node
          mid = (lo + hi) // 2
          node.left = build(nums, lo, mid)
          node.right = build(nums, mid, hi)
          node.total = node.left.total + node.right.total
          return node
    `,
    inputs: [SEG_NUMS],
    tryInputs: SEG_TRIES,
    build(s, p) {
      const { nums, skipped } = readNums(p.nums, 8);
      if (!nums.length) return SEG_EMPTY(s);
      const root = segTree(nums, (a, b) => a + b);
      drawSeg(s, root, { blank: true });
      const count = 2 * nums.length - 1;
      s.snap(`Each box covers a stretch of the list.${skipNote(skipped)}`, { line: 2, vars: { n: nums.length } });
      const c0 = choices(count, [nums.length, count + 1, 2 * nums.length]);
      askOnLast(s, {
        q: `Count the boxes in the picture. How many are there for ${many(nums.length, 'item')}?`,
        options: c0.options, answer: c0.answer,
        why: `There is 1 leaf per item, and every join needs 1 more box. That makes 2 x ${nums.length} - 1.`,
      });
      let joins = 0;
      segPost(root).forEach(b => {
        segAll(root).filter(x => x.done).forEach(x => s.set(x.id, { tone: 'ok' }));
        if (b.left) {
          joins += 1;
          if (joins % 2 === 1) {
            const right = b.val;
            const c = choices(right, [b.left.val, b.right.val, right + 1]);
            askOnLast(s, {
              q: `Box ${rangeText(b)} is next. What total goes in it?`,
              options: c.options, answer: c.answer,
              why: `Its 2 children hold ${b.left.val} and ${b.right.val}. Together that makes ${right}.`,
            });
          }
          s.set(b.id, { text: b.val, tone: 'active', size: String(b.val).length > 3 ? 17 : 19 });
          s.snap(`Box ${rangeText(b)} joins ${b.left.val} and ${b.right.val} to make ${b.val}.`, { line: 9, vars: { lo: b.lo, hi: b.hi, total: b.val } });
        } else {
          s.set(b.id, { text: b.val, tone: 'ok' });
          s.snap(`Box ${rangeText(b)} covers 1 item, so it is a leaf. It holds ${b.val}.`, { line: 4, vars: { lo: b.lo, hi: b.hi, total: b.val } });
        }
        b.done = true;
      });
      s.clearTones();
      s.snap(`Done. ${count} ${count === 1 ? 'box' : 'boxes'} from ${many(nums.length, 'item')}. The top box holds the total of the whole list.`, { line: 10, vars: { boxes: count } });
    },
  });

  function queryBuild(s, p, kind) {
    const isMin = kind === 'min';
    const join = isMin ? Math.min : (a, b) => a + b;
    const { nums, skipped } = readNums(p.nums, 8);
    if (!nums.length) return SEG_EMPTY(s);
    const n = nums.length;
    const a = whole(p.a, 0, n, 0), b = whole(p.b, 0, n, n);
    const root = segTree(nums, join);
    drawSeg(s, root);
    const call = isMin ? `smallest(${a}, ${b})` : `query(${a}, ${b})`;
    s.text('call', 16, 16, call, { size: 15, weight: 700, mono: true, anchor: 'start' });
    const outsideVal = isMin ? 'inf' : '0';
    const LABELS = ['All inside: use its value', `All outside: give back ${outsideVal}`, 'Part inside: ask both children'];
    s.snap(a >= b
      ? `This range holds no items. Watch what the boxes say.${skipNote(skipped)}`
      : `We want spots ${a} up to ${b}, with ${b} left out, as in a slice.${skipNote(skipped)}`, { line: 1, vars: { a, b } });
    let visits = 0, asked = 0;
    const visit = node => {
      visits += 1;
      const out = b <= node.lo || node.hi <= a;
      const inside = !out && a <= node.lo && node.hi <= b;
      const kindNo = inside ? 0 : out ? 1 : 2;
      asked += 1;
      if (asked <= 3 || asked % 3 === 0) {
        askOnLast(s, {
          q: `Next is box ${rangeText(node)}. We want ${a}:${b}. Which case is it?`,
          options: LABELS, answer: kindNo,
          why: inside ? `All of ${rangeText(node)} sits within ${a}:${b}.` : out ? `${rangeText(node)} and ${a}:${b} share no spots.` : `${rangeText(node)} has spots both in and out of ${a}:${b}.`,
        });
      }
      if (inside) {
        s.set(node.id, { tone: 'ok' });
        markBox(s, node, '\u2713');
        s.snap(`Box ${rangeText(node)} is all inside. Use its ${node.val}, and go no lower.`, { line: 5, vars: { visits } });
        return node.val;
      }
      if (out) {
        s.set(node.id, { tone: 'muted', scale: 0.86 });
        markBox(s, node, '\u2717');
        s.snap(`Box ${rangeText(node)} is all outside. It gives back ${outsideVal}.`, { line: 3, vars: { visits } });
        return isMin ? Infinity : 0;
      }
      s.set(node.id, { tone: 'active' });
      s.snap(`Box ${rangeText(node)} is only part inside. Ask both children.`, { line: 6, vars: { visits } });
      const l = visit(node.left);
      const r = visit(node.right);
      const res = join(l, r);
      const show = x => (x === Infinity ? 'inf' : x);
      s.set(node.id, { tone: 'warn' });
      s.snap(isMin ? `Box ${rangeText(node)} takes the smaller of ${show(l)} and ${show(r)}: ${show(res)}.` : `Box ${rangeText(node)} adds ${l} and ${r}, and gives back ${res}.`, { line: 8, vars: { visits, answer: show(res) } });
      return res;
    };
    const res = visit(root);
    const shown = res === Infinity ? 'inf' : res;
    s.snap(`The answer is ${shown}, after ${many(visits, 'visit')}. There are ${2 * n - 1} boxes in all.`, { line: 0, vars: { answer: shown, visits } });
  }
  const QUERY_TRIES = [
    { nums: '', a: 0, b: 1 }, { nums: '5', a: 0, b: 1 }, { nums: '5', a: 0, b: 0 }, { nums: '4 1 3 2 6 5', a: 3, b: 3 }, { nums: '4 1 3 2 6 5', a: 5, b: 2 },
    { nums: '4 1 3 2 6 5', a: 0, b: 6 }, { nums: '1 2 3 4 5 6 7 8', a: 1, b: 7 }, { nums: '1 2 3', a: 'x', b: 'y' }, { nums: 'cat', a: 0, b: 1 }, { nums: '1 2 3', a: 2, b: 99 },
  ];
  const RANGE_INPUTS = [
    SEG_NUMS,
    { key: 'a', label: 'a', type: 'number', value: 1, min: 0, max: 8 },
    { key: 'b', label: 'b, left out', type: 'number', value: 5, min: 0, max: 8 },
  ];

  Viz.register('m27-seg-query', {
    title: 'Answer a range question',
    size: [W, SEG_H],
    code: py`
      def query(node, a, b):
          if b <= node.lo or node.hi <= a:
              return 0
          if a <= node.lo and node.hi <= b:
              return node.total
          left = query(node.left, a, b)
          right = query(node.right, a, b)
          return left + right
    `,
    inputs: RANGE_INPUTS,
    tryInputs: QUERY_TRIES,
    build(s, p) { queryBuild(s, p, 'sum'); },
  });

  Viz.register('m27-seg-min', {
    title: 'Same tree, new join',
    size: [W, SEG_H],
    code: py`
      def smallest(node, a, b):
          if b <= node.lo or node.hi <= a:
              return float("inf")
          if a <= node.lo and node.hi <= b:
              return node.best
          left = smallest(node.left, a, b)
          right = smallest(node.right, a, b)
          return min(left, right)
    `,
    inputs: RANGE_INPUTS,
    tryInputs: QUERY_TRIES,
    build(s, p) { queryBuild(s, p, 'min'); },
  });

  Viz.register('m27-seg-update', {
    title: 'Change one item, fix one path',
    size: [W, SEG_H],
    code: py`
      def update(node, i, value):
          if node.hi - node.lo == 1:
              node.total = value
              return
          if i < node.left.hi:
              update(node.left, i, value)
          else:
              update(node.right, i, value)
          node.total = node.left.total + node.right.total
    `,
    inputs: [
      SEG_NUMS,
      { key: 'i', label: 'Spot to change', type: 'number', value: 1, min: 0, max: 7 },
      { key: 'value', label: 'New value', type: 'number', value: 9, min: -99, max: 99 },
    ],
    tryInputs: [
      { nums: '', i: 0, value: 1 }, { nums: '5', i: 0, value: 7 }, { nums: '5', i: 0, value: 5 }, { nums: '4 1 3', i: 7, value: 2 }, { nums: '1 2 3 4 5 6 7 8', i: 7, value: -99 },
      { nums: '4 1 3 2 6 5', i: 'x', value: 'y' }, { nums: 'cat', i: 0, value: 1 }, { nums: '1 2', i: 0, value: 1 },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.nums, 8);
      if (!nums.length) return SEG_EMPTY(s);
      const n = nums.length;
      const i = whole(p.i, 0, n - 1, 0);
      const value = whole(p.value, -99, 99, 9);
      const root = segTree(nums, (a, b) => a + b);
      drawSeg(s, root);
      const all = segAll(root).length;
      s.text('call', 16, 16, `update(${i}, ${value})`, { size: 15, weight: 700, mono: true, anchor: 'start' });
      s.snap(`Spot ${i} gets the new value ${value}. Which boxes cover spot ${i}?${skipNote(skipped)}`, { line: 1, vars: { i, value } });
      const path = [];
      let node = root;
      let visits = 0;
      let first = true;
      for (;;) {
        path.push(node);
        visits += 1;
        s.tone(node.id, 'active');
        if (node.hi - node.lo === 1) break;
        const goLeft = i < node.left.hi;
        if (first || visits % 2 === 1) {
          askOnLast(s, {
            q: `Spot ${i}. Box ${rangeText(node)} has children ${rangeText(node.left)} and ${rangeText(node.right)}. Which holds spot ${i}?`,
            options: [rangeText(node.left), rangeText(node.right)], answer: goLeft ? 0 : 1,
            why: `${i} is ${goLeft ? 'before' : 'at or after'} ${node.left.hi}, so go ${goLeft ? 'left' : 'right'}.`,
          });
          first = false;
        }
        s.snap(`Box ${rangeText(node)} covers spot ${i}. Go ${goLeft ? 'left' : 'right'}.`, { line: goLeft ? 6 : 8, vars: { i, visits } });
        node = goLeft ? node.left : node.right;
      }
      node.val = value;
      s.set(node.id, { text: value, tone: 'warn' });
      s.snap(`This leaf is spot ${i}. It gets the new value ${value}.`, { line: 3, vars: { i, visits } });
      let joins = 0;
      for (let k = path.length - 2; k >= 0; k--) {
        const b = path[k];
        const now = b.left.val + b.right.val;
        joins += 1;
        if (joins === 1 || joins % 2 === 1) {
          const c = choices(now, [b.val, now + 1, b.left.val]);
          askOnLast(s, {
            q: `On the way back up: box ${rangeText(b)} has children holding ${b.left.val} and ${b.right.val}. What is its new total?`,
            options: c.options, answer: c.answer,
            why: `Join the 2 children again: ${b.left.val} + ${b.right.val} is ${now}. The old total is out of date.`,
          });
        }
        b.val = now;
        s.set(b.id, { text: now, tone: 'ok', size: String(now).length > 3 ? 17 : 19 });
        s.snap(`Box ${rangeText(b)} is fixed: ${now}.`, { line: 9, vars: { i, total: now } });
      }
      s.snap(`Only ${path.length} of ${all} ${all === 1 ? 'box' : 'boxes'} changed. They form one path from the leaf to the top.`, { line: 0, vars: { fixed: path.length, boxes: all } });
    },
  });
})();
