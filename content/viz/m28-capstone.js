/* Visuals for module 28. Names start with the module id.
 * Every input may be empty or junk, so each build must cope with that.
 * The maze pictures show the plan in plain words, not Python, because the
 * learner writes that Python in the same lesson.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const whole = (v, lo, hi, fallback) => {
    let n = Math.round(Number(v));
    if (v === '' || v == null || !Number.isFinite(n)) n = fallback;
    return Math.max(lo, Math.min(hi, n));
  };
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const skipNote = skipped => (skipped ? ' Some of what you typed was skipped.' : '');
  /* Reads "1, 3, 5" from a text box. Anything that is not a small whole number is skipped. */
  function readNums(text, limit, low, high) {
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
  /* A question for a frame. Drops repeats and moves the right answer around. */
  function askIt(q, right, wrongs, why, turn = 0) {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    const answer = turn % (rest.length + 1);
    rest.splice(answer, 0, String(right));
    return { q, options: rest, answer, why };
  }
  /* Breaks a long sentence into lines of at most width letters. */
  function wrap(text, width) {
    const lines = [];
    let line = '';
    String(text).split(' ').forEach(word => {
      if (line && (line + ' ' + word).length > width) { lines.push(line); line = word; }
      else line = line ? line + ' ' + word : word;
    });
    if (line) lines.push(line);
    return lines;
  }
  const bits = (n, width) => n.toString(2).padStart(width, '0');

  // ---------------------------------------------------------------- lesson 28.1
  Viz.register('m28-method', {
    title: 'Best rise: the slow way, then a better way',
    size: [560, 300],
    inputs: [
      { key: 'prices', label: 'Price on each day', type: 'text', value: '5, 2, 6, 1, 4', size: 18 },
    ],
    tryInputs: [
      { prices: '' }, { prices: '7' }, { prices: '3, 8' }, { prices: '8, 3' }, { prices: '9, 7, 5, 3' }, { prices: '1, 2, 3, 4, 5, 6, 7' },
      { prices: '4, 4, 4' }, { prices: 'cat, dog' }, { prices: '0, 0' }, { prices: '99, 1, 50, 2, 98' }, { prices: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' },
    ],
    build(s, p) {
      const { nums: prices, skipped } = readNums(p.prices, 7, 0, 99);
      const n = prices.length;
      const floor = 232;
      const o = { cell: 62, gap: 8 };
      const X = i => s.slotX(i, n, o);
      const top = Math.max(1, ...prices);
      const H = v => 14 + Math.round((v / top) * 104);
      s.text('phase', 20, 18, 'Step 1: understand', { size: 15, anchor: 'start', weight: 700 });
      s.text('count', 540, 18, '', { size: 15, anchor: 'end', weight: 700 });
      s.text('note', 280, 40, '', { size: 14, mono: true });
      prices.forEach((v, i) => {
        s.bar('b' + i, X(i), floor, H(v), v, { w: 46 });
        s.text('d' + i, X(i), floor + 18, `day ${i}`, { size: 13, tone: 'muted' });
      });

      if (n < 2) {
        if (!n) s.text('none', 280, 150, 'There are no days here.', { size: 16, tone: 'muted' });
        const c = askIt('What should best_rise give here?', '0', ['-1', 'It may crash, and that is fine'],
          n ? 'With 1 day, you cannot sell on a later day. So the gain is 0.' : 'With no days, there is nothing to buy. So the gain is 0.');
        s.snap(`${n ? 'There is only 1 day.' : 'This list is empty.'}${skipNote(skipped)}`, { ask: c });
        s.set('phase', { text: 'Step 4: odd cases' });
        s.snap('This is an odd case. Your code must give 0 and not crash.', { vars: { best: 0 } });
        s.snap('Now type a list with 3 or more prices.', { vars: { best: 0 } });
        return;
      }

      // The brute force answer, with the first pair that reaches it.
      let best = 0, bi = -1, bj = -1;
      for (let i = 0; i < n; i += 1) for (let j = i + 1; j < n; j += 1) {
        if (prices[j] - prices[i] > best) { best = prices[j] - prices[i]; bi = i; bj = j; }
      }
      const lo = Math.min(...prices), hi = Math.max(...prices);
      const loAt = prices.indexOf(lo), hiAt = prices.indexOf(hi);
      if (best > 0) {
        const backward = loAt > hiAt && hi - lo > best;
        s.snap(`Buy on one day. Sell on a later day. Find the biggest rise.${skipNote(skipped)}`, {
          ask: askIt('Which pair gives the biggest rise?', `Buy at ${prices[bi]}, sell at ${prices[bj]}`,
            [`Buy at ${lo}, sell at ${hi}`, `Buy at ${prices[0]}, sell at ${prices[n - 1]}`, 'Do not buy at all'],
            backward
              ? `You must buy first. ${lo} comes after ${hi}, so that pair is not allowed. The best allowed rise is ${best}.`
              : `${prices[bi]} comes first and ${prices[bj]} comes later. That rise is ${best}, and no pair beats it.`, n),
        });
      } else {
        s.snap(`Buy on one day. Sell on a later day. Find the biggest rise.${skipNote(skipped)}`, {
          ask: askIt('These prices never go up. What is the best rise?', '0', [hi - lo + 1, -1],
            'Every later price is the same or lower. So you do not buy, and the gain is 0.', n),
        });
      }

      // Step 2. One frame for each buy day.
      s.set('phase', { text: 'Step 2: the slow way' });
      s.set('count', { text: 'checks: 0' });
      let checks = 0, sofar = 0;
      const askDay = Math.min(1, n - 2);
      for (let i = 0; i < n - 1; i += 1) {
        s.clearTones();
        s.tone('b' + i, 'active');
        for (let j = i + 1; j < n; j += 1) s.tone('b' + j, 'warn');
        if (i === 0) s.pointer('buy', X(0), 88, 'buy', { dir: 'down' });
        else s.set('buy', { x: X(i) });
        const tries = n - 1 - i;
        if (i === askDay) {
          s.snap(`Now the slow way tries buying on day ${i}.`, {
            vars: { best: sofar },
            ask: askIt(`Buy on day ${i}. How many sell days must it try?`, tries, [n, n - i, tries + 2],
              `Only later days count. That leaves ${many(tries, 'day')} after day ${i}.`, i),
          });
        }
        let here = 0;
        for (let j = i + 1; j < n; j += 1) here = Math.max(here, prices[j] - prices[i]);
        checks += tries;
        sofar = Math.max(sofar, here);
        s.set('count', { text: `checks: ${checks}` });
        s.set('note', { text: `buy at ${prices[i]}: best rise ${here}` });
        s.snap(`Buy at ${prices[i]}. It checks ${many(tries, 'later day')}. Best so far: ${sofar}.`, { vars: { best: sofar } });
      }
      s.clearTones();
      s.del('buy');
      s.set('note', { text: `${checks} checks, best rise ${sofar}` });
      s.snap(`That took ${many(checks, 'check')}. It has a loop inside a loop.`, {
        vars: { best: sofar },
        ask: askIt('You double the number of days. How many checks then?', 'About 4 times as many', ['About twice as many', 'The same number'],
          'A loop in a loop is O(n^2). Twice the days means about 4 times the checks.', n),
      });

      // Step 3.
      s.set('phase', { text: 'Step 3: a better way' });
      s.set('count', { text: 'steps: 0' });
      s.set('note', { text: 'Which work did it repeat?' });
      s.snap('The slow way kept going back over old days. Do you need them all?', {
        ask: askIt('To sell today, which earlier price matters?', 'The lowest price so far', ['Every earlier price', 'Only yesterday\'s price'],
          'A lower buy price always gives a bigger rise. So one number can stand for all the old days.', n + 1),
      });

      let low = prices[0], lowAt = 0, gain = 0, steps = 0;
      s.pointer('day', X(0), 88, 'day', { dir: 'down' });
      s.pointer('low', X(0), floor + 30, 'low', { dir: 'up', tone: 'ok' });
      for (let i = 0; i < n; i += 1) {
        const v = prices[i];
        s.clearTones();
        s.set('day', { x: X(i) });
        s.tone('b' + i, 'active');
        steps += 1;
        s.set('count', { text: `steps: ${steps}` });
        const rise = v - low;
        if (i % 2 === 1) {
          s.set('note', { text: `${v} - ${low} = ${rise}` });
          s.snap(`Day ${i}: the price is ${v}, and low names ${low}.`, {
            vars: { low, best: gain },
            ask: askIt('What does best name after this day?', Math.max(gain, rise), [gain + 1, v, Math.max(gain, rise) + 2],
              rise > gain ? `${v} - ${low} is ${rise}. That beats ${gain}, so best moves to ${rise}.` : `${v} - ${low} is ${rise}. That does not beat ${gain}, so best stays.`, i),
          });
        }
        const isBest = rise > gain;
        if (isBest) gain = rise;
        const newLow = v < low;
        if (newLow) { low = v; lowAt = i; s.set('low', { x: X(i) }); }
        if (i === 0) s.set('note', { text: `first price is ${v}` });
        else if (newLow) s.set('note', { text: `${v} is lower, so low moves` });
        else s.set('note', { text: `${v} - ${low} = ${rise}` });
        const part = i === 0 ? `low names ${v}, and best is 0.`
          : isBest ? `The rise is ${rise}, a new best.`
          : newLow ? `A new low: ${v}. best stays ${gain}.`
          : `The rise is ${rise}. best stays ${gain}.`;
        s.snap(`Day ${i}: ${part}`, { vars: { low, best: gain } });
      }
      s.clearTones();
      s.tone('b' + lowAt, 'default');
      s.del('day');
      s.set('phase', { text: 'Step 4: odd cases' });
      s.set('note', { text: `slow: ${checks} checks. better: ${steps} steps.` });
      s.snap(`Slow: ${many(checks, 'check')}. Better: ${many(steps, 'step')}. Both say ${gain}.`, { vars: { low, best: gain } });
      s.snap('Now test odd cases. Try no days, 1 day and falling prices.', { vars: { low, best: gain } });
    },
  });

  // ---------------------------------------------------------------- lesson 28.2
  /* The decision flow. Each option leads to another question or to a tool. */
  const FLOW = {
    start: { q: 'What is the problem about?', opts: [
      ['map', 'A map, grid or network', 'map'], ['row', 'A row of items or letters', 'row'],
      ['link', 'A chain or a tree', 'link'], ['word', 'Many saved words', 'word'], ['choice', 'Choices to make', 'choice'],
    ] },
    map: { q: 'Do the links have costs?', opts: [['yes', 'Yes', '=Dijkstra with a heap'], ['no', 'No', 'map2']] },
    map2: { q: 'What do you want?', opts: [
      ['moves', 'The fewest moves', '=BFS'], ['all', 'Every area or every path', '=DFS'],
      ['order', 'An order that obeys rules', '=Topological sort'], ['group', 'Same group, as links arrive', '=Union-find'],
    ] },
    row: { q: 'Is the row sorted?', opts: [['yes', 'Yes', 'rowS'], ['no', 'No', 'rowU']] },
    rowS: { q: 'What do you want?', opts: [['one', 'Find one value', '=Binary search'], ['pair', 'Find a pair', '=Two pointers']] },
    rowU: { q: 'What do you want?', opts: [
      ['count', 'Count, or spot repeats', '=A dict or a set'], ['stretch', 'A stretch side by side', '=Sliding window'],
      ['totals', 'Many range totals', '=Prefix sums'], ['next', 'Brackets, or next bigger', '=A stack'],
      ['top', 'The k biggest', '=A heap'], ['ranges', 'Ranges that overlap', '=Sort, then sweep'],
    ] },
    link: { q: 'Which one fits?', opts: [
      ['chain', 'Chain: a loop or the middle', '=Fast and slow pointers'], ['depth', 'Tree: depth or all paths', '=DFS, with recursion'],
      ['level', 'Tree: level by level', '=BFS, with a queue'],
    ] },
    word: { q: 'Must you match the start?', opts: [['yes', 'Yes', '=A trie'], ['no', 'No, whole words only', '=A set']] },
    choice: { q: 'What does it ask for?', opts: [
      ['every', 'List every arrangement', '=Backtracking'], ['ways', 'Count ways, or best cost', '=Dynamic programming'],
      ['value', 'Smallest value that works', '=Binary search on the answer'], ['rule', 'One safe rule each time', '=Greedy'],
    ] },
  };
  /* Each problem: its words, the options it takes, a reason for each choice, its cue words and a near miss. */
  const PROBLEMS = [
    { key: 'window', label: 'Longest part with no repeat',
      text: 'Find the longest part of a word that has no repeated letter.', path: ['row', 'no', 'stretch'],
      why: ['A word is a row of letters.', 'Nothing says the letters are in order.', 'The part must be side by side, and it can grow or shrink.'],
      cue: 'longest part', miss: 'Not two pointers from both ends. Those look for a pair, not a stretch.' },
    { key: 'hash', label: 'How many sweets of each colour',
      text: 'A bag has 1000 sweets. How many are there of each colour?', path: ['row', 'no', 'count'],
      why: ['The sweets are a row of items.', 'Nothing says they are in order.', 'One count for each colour is a dict job.'],
      cue: 'how many of each', miss: 'Not sorting first. A dict counts in one walk, with no sort needed.' },
    { key: 'pair', label: 'Sorted pair that adds to 30',
      text: 'This list of ages is sorted. Find 2 ages that add up to 30.', path: ['row', 'yes', 'pair'],
      why: ['A list of ages is a row.', 'The problem says "sorted".', 'You want 2 items, not 1.'],
      cue: 'sorted, 2 that add up', miss: 'A dict also works, but it needs extra memory. Pointers need none.' },
    { key: 'binary', label: 'Is this score in a sorted list?',
      text: 'One million scores are sorted. Is the score 72 in there?', path: ['row', 'yes', 'one'],
      why: ['Scores in a list are a row.', 'The problem says "sorted".', 'You want 1 value.'],
      cue: 'sorted, is it in there', miss: 'Not a walk. A walk may open a million spots. This takes about 20.' },
    { key: 'prefix', label: 'Many range totals, fixed list',
      text: 'A list of daily steps never changes. Answer 5000 questions: what is the total from day a to day b?', path: ['row', 'no', 'totals'],
      why: ['The days are a row of numbers.', 'Steps per day have no order.', 'Many questions about totals in a range is the cue.'],
      cue: 'many totals, no changes', miss: 'Not a Fenwick tree. You need that one only if the list keeps changing.' },
    { key: 'stack', label: 'Does every bracket have a partner?',
      text: 'Check that every bracket in this line of code has a partner.', path: ['row', 'no', 'next'],
      why: ['A line of code is a row of letters.', 'Brackets come in any order.', 'The newest open bracket must close first.'],
      cue: 'brackets', miss: 'Not a queue. A queue gives the oldest bracket, and you need the newest.' },
    { key: 'next', label: 'Next warmer day for each day',
      text: 'For each day in a list, find the next day that is warmer.', path: ['row', 'no', 'next'],
      why: ['The days are a row of numbers.', 'Temperatures go up and down.', 'Next bigger is the job of a monotonic stack.'],
      cue: 'next bigger', miss: 'Not a loop in a loop. That works, but it is O(n^2). The stack is O(n).' },
    { key: 'heap', label: 'Keep the 3 biggest scores',
      text: 'Scores keep arriving. Always keep the 3 biggest.', path: ['row', 'no', 'top'],
      why: ['Scores come as a row of numbers.', 'New scores arrive in any order.', 'The k biggest is the cue for a heap.'],
      cue: 'k biggest', miss: 'Not a full sort for each score. A small heap does each one in about log k steps.' },
    { key: 'ranges', label: 'Merge meetings that overlap',
      text: 'Some meetings overlap. Join them into blocks of busy time.', path: ['row', 'no', 'ranges'],
      why: ['A list of meetings is a row.', 'The meetings come in any order.', 'Overlap means sort by start, then sweep.'],
      cue: 'overlap', miss: 'Not a loop in a loop. After a sort, you only compare with the last block.' },
    { key: 'dijkstra', label: 'Cheapest way across town by bus',
      text: 'Each bus ride has its own fare. Find the cheapest way across town.', path: ['map', 'yes'],
      why: ['Stops joined by rides make a network.', 'Each ride has a fare, so links have costs.'],
      cue: 'fare, cheapest', miss: 'Not BFS. BFS finds the fewest rides, which may not be the cheapest.' },
    { key: 'bfs', label: 'Fewest moves through a maze',
      text: 'Find the fewest moves from the door of a maze to the exit.', path: ['map', 'no', 'moves'],
      why: ['A maze is a grid.', 'Each move counts the same, so there are no costs.', 'Fewest moves is the cue for BFS.'],
      cue: 'fewest moves', miss: 'Not DFS. It finds a way out, but not always the shortest.' },
    { key: 'dfs', label: 'Count the islands on a map',
      text: 'A map has land and water. Count the islands.', path: ['map', 'no', 'all'],
      why: ['A map is a grid.', 'No step costs more than another.', 'You must visit each whole area.'],
      cue: 'islands', miss: 'BFS works too, as you only need to mark each area. DFS is shorter to write.' },
    { key: 'topo', label: 'An order for courses',
      text: 'Some courses need other courses first. Find an order to take them.', path: ['map', 'no', 'order'],
      why: ['Courses joined by rules make a network.', 'The rules have no costs.', 'An order that obeys rules is the cue.'],
      cue: 'needs first', miss: 'Not a plain sort. No number says which course comes first.' },
    { key: 'union', label: 'Same group, as roads open',
      text: 'Roads open one at a time. After each, are these 2 towns in the same group?', path: ['map', 'no', 'group'],
      why: ['Towns and roads make a network.', 'The roads have no costs here.', 'Same group, with links arriving, is the cue.'],
      cue: 'same group, one at a time', miss: 'Not a new BFS each time. That repeats the work after every road.' },
    { key: 'cycle', label: 'Does this chain loop?',
      text: 'A linked list may loop back on itself. Use almost no extra memory. Does it loop?', path: ['link', 'chain'],
      why: ['A linked list is a chain.', 'A loop in a chain is the cue for 2 speeds.'],
      cue: 'loop, little memory', miss: 'A set of seen nodes also works, but this problem asks for almost no memory.' },
    { key: 'depth', label: 'How deep is this family tree?',
      text: 'How deep is this family tree?', path: ['link', 'depth'],
      why: ['A family tree is a tree.', 'Depth comes from asking each child, then joining the answers.'],
      cue: 'depth', miss: 'A level walk works too, but recursion takes only a few lines.' },
    { key: 'levels', label: 'Print a tree one level at a time',
      text: 'Print the names in this tree, one level at a time.', path: ['link', 'level'],
      why: ['The problem says it is a tree.', 'Level by level is the cue for a queue.'],
      cue: 'level by level', miss: 'Not plain recursion. That goes deep first, so levels come out mixed.' },
    { key: 'trie', label: 'Words that start with "pre"',
      text: 'Show every saved word that starts with what I type.', path: ['word', 'yes'],
      why: ['The problem is about many saved words.', '"Starts with" is the cue for a trie.'],
      cue: 'starts with', miss: 'Not a set. A set can say if a whole word is there, but not its start.' },
    { key: 'spell', label: 'Is this exact word saved?',
      text: 'A spell checker asks: is this exact word in the dictionary?', path: ['word', 'no'],
      why: ['The problem is about many saved words.', 'You only ever match whole words.'],
      cue: 'exact word', miss: 'A trie works, but a set is smaller to write, and it is as quick here.' },
    { key: 'back', label: 'Every way to seat 4 friends',
      text: 'List every way to seat 4 friends in a row.', path: ['choice', 'every'],
      why: ['Each seat is a choice to make.', 'List every way is the cue.'],
      cue: 'list every way', miss: 'Not dynamic programming. It can count the ways, but you must list each one.' },
    { key: 'dp', label: 'How many ways to climb 20 stairs',
      text: 'You climb 20 stairs, taking 1 or 2 at a time. How many ways are there?', path: ['choice', 'ways'],
      why: ['Each step up is a choice.', 'How many ways, with the same small questions again and again.'],
      cue: 'how many ways', miss: 'Not backtracking. Listing every way takes far too long. You only want the count.' },
    { key: 'answer', label: 'Smallest bag that fits the toys',
      text: 'Pack toys into 5 bags. Find the smallest bag size that fits them all.', path: ['choice', 'value'],
      why: ['You choose one bag size.', 'If a size works, every bigger size works too.'],
      cue: 'smallest that works', miss: 'Not greedy. There is no safe first pick, but you can test any one size.' },
    { key: 'greedy', label: 'Fit the most talks into one room',
      text: 'Fit the most talks into one room. No 2 may overlap.', path: ['choice', 'rule'],
      why: ['You choose which talks to keep.', 'A safe rule exists: always take the talk that ends first.'],
      cue: 'the most, no overlap', miss: 'Not backtracking. Trying every group is far too slow, and the rule is safe.' },
  ];
  /* Follows a problem through FLOW. Returns its steps and its tool. */
  function walkFlow(prob) {
    const out = [];
    let at = 'start';
    prob.path.forEach((pick, i) => {
      const node = FLOW[at];
      const index = node.opts.findIndex(o => o[0] === pick);
      out.push({ node, index, why: prob.why[i], label: node.opts[index][1] });
      at = node.opts[index][2];
    });
    return { steps: out, tool: at.slice(1) };
  }

  Viz.register('m28-tool-flow', {
    title: 'Which tool fits? Follow the questions',
    size: [560, 346],
    note: 'Pick a problem from the list, then answer each question.',
    inputs: [
      { key: 'problem', label: 'Problem', type: 'select', value: 'window', options: PROBLEMS.map(x => ({ label: x.label, value: x.key })) },
    ],
    tryInputs: PROBLEMS.map(x => ({ problem: x.key })).concat([{ problem: 'nothing' }]),
    build(s, p) {
      const prob = PROBLEMS.find(x => x.key === p.problem) || PROBLEMS[0];
      const { steps, tool } = walkFlow(prob);
      const lines = wrap(prob.text, 50);
      s.box('storyBox', 280, 40, '', { w: 536, h: 68, tone: 'muted' });
      lines.forEach((t, i) => s.text('story' + i, 280, 40 + (i - (lines.length - 1) / 2) * 20, t, { size: 15, weight: 700 }));
      const rowY = i => 104 + i * 60;
      const QX = 140, AX = 418;
      s.snap(`Read the problem. Now follow the questions to a tool.`);
      steps.forEach((st, i) => {
        s.box('q' + i, QX, rowY(i), '', { w: 250, h: 44 });
        s.text('qt' + i, QX, rowY(i), st.node.q, { size: 14, weight: 700 });
        if (i) s.edge('down' + i, 'q' + (i - 1), 'q' + i, {});
        s.snap(`Question ${i + 1}: ${st.node.q}`, {
          ask: { q: st.node.q, options: st.node.opts.map(o => o[1]), answer: st.index, why: st.why },
        });
        s.box('a' + i, AX, rowY(i), '', { w: 262, h: 44, tone: 'ok' });
        s.text('at' + i, AX, rowY(i), st.label, { size: 14, weight: 700 });
        s.edge('over' + i, 'q' + i, 'a' + i, {});
        s.snap(`You follow "${st.label}".`);
      });
      const toolY = rowY(steps.length);
      s.box('tool', QX, toolY, '', { w: 250, h: 44, tone: 'active' });
      s.text('toolT', QX, toolY, tool, { size: 14, weight: 700 });
      s.edge('toTool', 'q' + (steps.length - 1), 'tool', {});
      s.text('cue', AX, toolY, `Cue: ${prob.cue}`, { size: 14 });
      s.snap(`The tool is: ${tool}. The cue words were "${prob.cue}".`);
      s.snap(prob.miss);
    },
  });

  // ---------------------------------------------------------------- lesson 28.3
  const PLACES = [32, 16, 8, 4, 2, 1];

  Viz.register('m28-binary', {
    title: 'A number as a row of switches',
    size: [560, 210],
    inputs: [{ key: 'n', label: 'Number, 0 to 63', type: 'number', value: 13, min: 0, max: 63 }],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 32 }, { n: 63 }, { n: 42 }, { n: '' }, { n: 'cat' }, { n: 900 }],
    build(s, p) {
      const n = whole(p.n, 0, 63, 0);
      const o = { y: 92, cell: 60, gap: 10 };
      const X = i => s.slotX(i, 6, o);
      s.text('goal', 20, 18, `Make ${n} with switches`, { size: 15, anchor: 'start', weight: 700 });
      PLACES.forEach((v, i) => {
        s.text('pl' + i, X(i), 48, `worth ${v}`, { size: 13, tone: 'muted' });
        s.box('sw' + i, X(i), o.y, 0, { w: o.cell, h: 52, tone: 'muted' });
      });
      s.text('sum', 280, 148, '', { size: 16, mono: true, weight: 700 });
      s.text('py', 280, 178, '', { size: 15, mono: true });
      let left = n;
      const on = [];
      s.snap(`Each switch has a worth. All are off, so the row says 0.`, { vars: { 'left to make': left } });
      PLACES.forEach((v, i) => {
        const fits = v <= left;
        if (i >= 2 && i !== 4) {
          s.tone('sw' + i, 'active');
          s.snap(`${left} is left to make. Look at the switch worth ${v}.`, {
            vars: { 'left to make': left },
            ask: askIt(`Should the ${v} switch go on?`, fits ? 'Yes' : 'No', [fits ? 'No' : 'Yes'],
              fits ? `${v} fits inside ${left}, so it goes on. Then ${left - v} is left.` : `${v} is bigger than ${left}, so it stays off.`, i),
          });
        }
        if (fits) {
          left -= v;
          on.push(v);
          s.set('sw' + i, { text: 1, tone: 'ok' });
          s.set('sum', { text: on.join(' + ') });
          s.snap(`${v} fits, so that switch turns on. ${left} is left.`, { vars: { 'left to make': left } });
        } else {
          s.set('sw' + i, { text: 0, tone: 'muted' });
          s.snap(left === 0 ? `Nothing is left to make. The ${v} switch stays off.` : `${v} is bigger than ${left}. That switch stays off.`, { vars: { 'left to make': left } });
        }
      });
      s.set('sum', { text: on.length ? `${on.join(' + ')} = ${n}` : 'every switch is off' });
      s.set('py', { text: `bin(${n}) gives 0b${n.toString(2)}` });
      s.snap(`${n} in binary is ${n.toString(2)}. Python drops any 0s on the left.`, { vars: { 'left to make': 0 } });
    },
  });

  const OPS = {
    and: { sign: '&', word: 'AND', rule: 'The answer is 1 only if both bits are 1.', f: (x, y) => x & y },
    or: { sign: '|', word: 'OR', rule: 'The answer is 1 if at least one bit is 1.', f: (x, y) => x | y },
    xor: { sign: '^', word: 'XOR', rule: 'The answer is 1 only if the 2 bits differ.', f: (x, y) => x ^ y },
  };
  Viz.register('m28-bit-ops', {
    title: 'Bit operators work one column at a time',
    size: [560, 236],
    inputs: [
      { key: 'a', label: 'a', type: 'number', value: 13, min: 0, max: 63 },
      { key: 'b', label: 'b', type: 'number', value: 7, min: 0, max: 63 },
      { key: 'op', label: 'Operator', type: 'select', value: 'and', options: [{ label: '& (AND)', value: 'and' }, { label: '| (OR)', value: 'or' }, { label: '^ (XOR)', value: 'xor' }] },
    ],
    tryInputs: [
      { a: 0, b: 0, op: 'and' }, { a: 0, b: 0, op: 'xor' }, { a: 63, b: 63, op: 'xor' }, { a: 63, b: 0, op: 'or' }, { a: 5, b: 5, op: 'and' },
      { a: 1, b: 2, op: 'and' }, { a: 12, b: 10, op: 'xor' }, { a: '', b: 'x', op: 'or' }, { a: 500, b: 1, op: 'bad' },
    ],
    build(s, p) {
      const a = whole(p.a, 0, 63, 0), b = whole(p.b, 0, 63, 0);
      const op = OPS[p.op] || OPS.and;
      const result = op.f(a, b);
      const A = bits(a, 6), B = bits(b, 6), R = bits(result, 6);
      const X = i => 160 + i * 52;
      const rows = { a: 72, b: 126, r: 190 };
      PLACES.forEach((v, i) => s.text('pl' + i, X(i), 34, v, { size: 13, tone: 'muted', mono: true }));
      s.text('la', 16, rows.a, `a is ${a}`, { size: 15, anchor: 'start', weight: 700 });
      s.text('lb', 16, rows.b, `b is ${b}`, { size: 15, anchor: 'start', weight: 700 });
      s.text('lr', 16, rows.r, `a ${op.sign} b`, { size: 15, anchor: 'start', weight: 700, mono: true });
      for (let i = 0; i < 6; i += 1) {
        s.box('a' + i, X(i), rows.a, A[i], { w: 44, h: 44, tone: A[i] === '1' ? 'default' : 'muted' });
        s.box('b' + i, X(i), rows.b, B[i], { w: 44, h: 44, tone: B[i] === '1' ? 'default' : 'muted' });
      }
      s.text('ans', 530, rows.r, '', { size: 16, anchor: 'end', weight: 700, mono: true });
      s.snap(`Write a and b in bits, in columns. ${op.rule}`);
      const asked = new Set();
      let shown = '';
      for (let i = 0; i < 6; i += 1) {
        const pair = A[i] + B[i];
        s.tone(['a' + i, 'b' + i], 'active');
        if (!asked.has(pair)) {
          asked.add(pair);
          s.snap(`Look at the column worth ${PLACES[i]}. The top bit is ${A[i]} and the lower bit is ${B[i]}.`, {
            ask: askIt(`What does ${A[i]} ${op.sign} ${B[i]} give?`, R[i], [R[i] === '1' ? '0' : '1'], op.rule, i),
          });
        }
        s.box('r' + i, X(i), rows.r, R[i], { w: 44, h: 44, tone: R[i] === '1' ? 'ok' : 'muted' });
        shown += R[i];
        s.snap(`${A[i]} ${op.sign} ${B[i]} is ${R[i]}. The answer so far is ${shown}.`);
        s.tone('a' + i, A[i] === '1' ? 'default' : 'muted');
        s.tone('b' + i, B[i] === '1' ? 'default' : 'muted');
      }
      s.set('ans', { text: `= ${result}` });
      s.snap(`${R} in bits is ${result}. So ${a} ${op.sign} ${b} is ${result}.`);
    },
  });

  Viz.register('m28-xor-lonely', {
    title: 'XOR makes every pair cancel',
    size: [560, 214],
    code: py`
      x = 0
      for n in nums:
          x = x ^ n
      print(x)
    `,
    inputs: [{ key: 'nums', label: 'Numbers', type: 'text', value: '4, 1, 2, 1, 2', size: 18 }],
    tryInputs: [
      { nums: '' }, { nums: '7' }, { nums: '2, 2' }, { nums: '0, 0, 9' }, { nums: '5, 5, 5' }, { nums: '1, 2, 3' }, { nums: 'cat' },
      { nums: '1, 1, 2, 2, 3, 3, 4' }, { nums: '9, 8, 7, 6, 5, 4, 3, 2, 1' }, { nums: '63, 63, 63, 63' }, { nums: '100, 3' },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.nums, 7, 0, 63);
      const n = nums.length;
      const o = { y: 56, cell: 52, gap: 8, index: false };
      const X = i => s.slotX(i, n, o);
      s.text('tag', 20, 16, 'x starts at 0', { size: 15, anchor: 'start', weight: 700 });
      if (n) s.row('c', nums, o);
      else s.text('empty', 280, 58, 'There are no numbers here.', { size: 16, tone: 'muted' });
      const width = Math.max(4, ...nums.map(v => v.toString(2).length));
      const rowY = [146, 170, 194];
      ['old x', 'n', 'new x'].forEach((t, i) => {
        s.text('lab' + i, 200, rowY[i], t, { size: 14, anchor: 'end', tone: 'muted' });
        s.text('val' + i, 216, rowY[i], '', { size: 15, anchor: 'start', mono: true, weight: i === 2 ? 700 : 500 });
      });
      let x = 0;
      s.snap(`x starts at 0.${skipNote(skipped)}`, { line: 1, vars: { x } });
      const seen = new Map();
      for (let i = 0; i < n; i += 1) {
        const v = nums[i];
        if (i === 0) s.pointer('at', X(0), 88, 'n', { dir: 'up' });
        else s.set('at', { x: X(i) });
        s.tone('c' + i, 'active');
        const next = x ^ v;
        s.set('val0', { text: `${bits(x, width)}  (${x})` });
        s.set('val1', { text: `${bits(v, width)}  (${v})` });
        s.set('val2', { text: '' });
        const twin = seen.get(v);
        if ((twin != null && twin % 2 === 1) || i === 1) {
          s.snap(`Next, n names ${v}. Line up its bits under x.`, {
            line: 3, vars: { x, n: v },
            ask: askIt(`x is ${x} and n is ${v}. What is x ^ n?`, next, [x + v + 1, 0, v],
              `Compare each column. A column gives 1 only if the 2 bits differ. That gives ${bits(next, width)}.`, i),
          });
        }
        x = next;
        s.set('val2', { text: `${bits(x, width)}  (${x})` });
        s.set('c' + i, { tone: 'muted', scale: 0.86 });
        s.set('tag', { text: `x is ${x}` });
        seen.set(v, (seen.get(v) || 0) + 1);
        s.snap(twin != null && twin % 2 === 1 ? `Its partner already went in, so the ${v} cancels out. x is ${x}.` : `The bits of ${v} go into x. x is ${x}.`, { line: 3, vars: { x, n: v } });
      }
      if (n) s.del('at');
      const odd = [...seen.entries()].filter(e => e[1] % 2 === 1).map(e => e[0]);
      const all = [...new Set(nums)];
      all.forEach(v => {
        if (odd.length === 1 && v === odd[0]) nums.forEach((w, i) => { if (w === v) s.set('c' + i, { tone: 'ok', scale: 1 }); });
      });
      const final = !n
        ? 'The loop made no trips, so x is still 0.'
        : odd.length === 0
          ? 'Every number has a partner, so all of it cancels. x is 0.'
          : odd.length === 1
            ? `${odd[0]} has no partner, so it is what stays. x is ${x}.`
            : `${odd.length} numbers have no partner, so x is a mix. The trick needs exactly 1 lonely number.`;
      s.snap(final, { line: 4, vars: { x }, out: String(x) });
    },
  });

  // ---------------------------------------------------------------- lesson 28.4
  Viz.register('m28-clock', {
    title: 'Modulo wraps a walk around a ring',
    size: [560, 276],
    code: py`
      spot = (start + steps) % size
      print(spot)
    `,
    inputs: [
      { key: 'size', label: 'Spots on the ring', type: 'number', value: 8, min: 2, max: 12 },
      { key: 'start', label: 'Start spot', type: 'number', value: 5, min: 0, max: 40 },
      { key: 'steps', label: 'Steps', type: 'number', value: 6, min: 0, max: 60 },
    ],
    tryInputs: [
      { size: 2, start: 0, steps: 0 }, { size: 12, start: 11, steps: 1 }, { size: 8, start: 5, steps: 3 }, { size: 8, start: 0, steps: 8 },
      { size: 5, start: 2, steps: 60 }, { size: 3, start: 40, steps: 7 }, { size: '', start: 'x', steps: 'y' }, { size: 99, start: -3, steps: -2 },
    ],
    build(s, p) {
      const size = whole(p.size, 2, 12, 8);
      const raw = whole(p.start, 0, 40, 0);
      const start = raw % size;
      const steps = whole(p.steps, 0, 60, 0);
      const answer = (start + steps) % size;
      const cx = 150, cy = 140, R = 104;
      const spot = i => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / size;
        return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
      };
      for (let i = 0; i < size; i += 1) {
        const [x, y] = spot(i);
        s.circle('n' + i, x, y, i, { r: 20, size: 15, tone: 'default' });
      }
      s.circle('hub', cx, cy, '', { r: 6, tone: 'muted' });
      s.edge('hand', 'hub', 'n' + start, {});
      s.set('n' + start, { tone: 'active', scale: 1.15 });
      s.text('sum', 300, 92, `(${start} + ${steps}) % ${size}`, { size: 17, anchor: 'start', mono: true, weight: 700 });
      s.text('walk', 300, 126, 'steps walked: 0', { size: 15, anchor: 'start' });
      s.text('laps', 300, 156, '', { size: 15, anchor: 'start' });
      s.text('res', 300, 196, '', { size: 17, anchor: 'start', mono: true, weight: 700 });
      const moved = raw !== start ? ` Spot ${raw} wraps to ${start}.` : '';
      const opts = [answer, start + steps, (answer + 1) % size, steps];
      s.snap(`The ring has ${size} spots. The hand starts at ${start}.${moved}`, {
        line: 1, vars: { size, start, steps },
        ask: askIt(`Walk ${many(steps, 'step')} from ${start}. Where does the hand stop?`, answer, opts,
          `${start} + ${steps} is ${start + steps}. Sharing that into groups of ${size} leaves ${answer}.`, size),
      });
      let at = start, walked = 0;
      const go = i => {
        s.set('n' + at, { tone: 'default', scale: 1 });
        at = i;
        s.set('hand', { to: 'n' + at });
        s.set('n' + at, { tone: 'active', scale: 1.15 });
      };
      const whole_laps = Math.floor(steps / size);
      const rest = steps % size;
      if (whole_laps > 0) {
        s.set('laps', { text: `${many(whole_laps, 'whole lap')} change nothing` });
        s.set('walk', { text: `steps walked: ${whole_laps * size}` });
        walked = whole_laps * size;
        s.snap(`${many(whole_laps * size, 'step')} ${whole_laps * size === 1 ? 'is' : 'are'} ${many(whole_laps, 'whole lap')}. The hand ends where it began.`, { line: 1, vars: { size, start, steps } });
      }
      for (let k = 1; k <= rest; k += 1) {
        const next = (at + 1) % size;
        const wraps = next === 0;
        go(next);
        walked += 1;
        s.set('walk', { text: `steps walked: ${walked}` });
        s.snap(wraps ? `After spot ${size - 1} comes spot 0. That is the wrap.` : `Step: the hand moves to spot ${next}.`, { line: 1, vars: { size, start, steps } });
      }
      s.set('n' + at, { tone: 'ok', scale: 1.15 });
      s.set('res', { text: `is ${answer}` });
      s.snap(`The hand stops at ${answer}, with no walking needed in code.`, { line: 2, vars: { size, start, steps, spot: answer }, out: String(answer) });
    },
  });

  Viz.register('m28-gcd', {
    title: 'Euclid: swap and take the remainder',
    size: [560, 250],
    code: py`
      def gcd(a, b):
          while b > 0:
              a, b = b, a % b
          return a
      print(gcd(a, b))
    `,
    inputs: [
      { key: 'a', label: 'a', type: 'number', value: 48, min: 0, max: 999 },
      { key: 'b', label: 'b', type: 'number', value: 18, min: 0, max: 999 },
    ],
    tryInputs: [
      { a: 0, b: 0 }, { a: 0, b: 5 }, { a: 5, b: 0 }, { a: 7, b: 7 }, { a: 1, b: 999 }, { a: 999, b: 1 }, { a: 18, b: 48 },
      { a: 987, b: 610 }, { a: 17, b: 13 }, { a: '', b: 'x' }, { a: 5000, b: -4 },
    ],
    build(s, p) {
      let a = whole(p.a, 0, 999, 0), b = whole(p.b, 0, 999, 0);
      const a0 = a, b0 = b;
      const unit = 460 / Math.max(1, a, b);
      const W = v => Math.max(2, v * unit);
      const left = 30;
      s.text('count', 540, 18, 'rounds: 0', { size: 15, anchor: 'end', weight: 700 });
      s.text('la', left, 18, `a is ${a}`, { size: 15, anchor: 'start', weight: 700 });
      s.box('A', left + W(a) / 2, 48, '', { w: W(a), h: 30, tone: 'active' });
      s.text('lb', left, 84, `b is ${b}`, { size: 15, anchor: 'start', weight: 700 });
      s.box('B', left + W(b) / 2, 114, '', { w: W(b), h: 30, tone: 'warn' });
      s.text('calc', left, 158, '', { size: 16, anchor: 'start', mono: true, weight: 700 });
      s.text('race', left, 192, '', { size: 15, anchor: 'start' });
      const place = () => {
        s.set('la', { text: `a is ${a}` });
        s.set('lb', { text: `b is ${b}` });
        s.set('A', { x: left + W(a) / 2, w: W(a) });
        s.set('B', { x: left + W(b) / 2, w: W(b) });
      };
      s.snap('The bars show a and b. Their lengths are the 2 numbers.', { line: 1, vars: { a, b } });
      let rounds = 0;
      while (b > 0) {
        const rem = a % b;
        const swapOnly = a < b;
        s.set('calc', { text: `${a} % ${b} is ?` });
        if (rounds === 0 || rounds === 2) {
          s.snap(`The loop runs, because b is ${b}. Now work out a % b.`, {
            line: 2, vars: { a, b },
            ask: askIt(`What is ${a} % ${b}?`, rem, [rem + 1, b, Math.floor(a / b)],
              swapOnly ? `${a} is smaller than ${b}. So nothing can be shared out, and all ${a} are left over.` : `${b} fits into ${a} ${Math.floor(a / b)} times. That leaves ${rem} over.`, rounds + a),
          });
        }
        rounds += 1;
        s.set('calc', { text: `${a} % ${b} is ${rem}` });
        const oldA = a;
        a = b;
        b = rem;
        place();
        s.set('count', { text: `rounds: ${rounds}` });
        s.snap(swapOnly
          ? `${oldA} is smaller, so this round only swaps them. a is ${a}, b is ${b}.`
          : `a moves to ${a}, and b moves to the remainder, ${b}.`, { line: 3, vars: { a, b } });
      }
      if (a0 === 0 && b0 === 0) {
        s.set('calc', { text: 'gcd(0, 0) is 0' });
        s.snap('Both are 0, and b is not above 0. The loop never runs, so it gives 0.', { line: 4, vars: { a, b } });
        s.snap('print shows 0. math.gcd gives the same answer.', { line: 5, vars: { a, b }, out: '0' });
        return;
      }
      s.set('calc', { text: `b is 0, so gcd(${a0}, ${b0}) is ${a}` });
      s.snap(`b is 0, so the loop stops.`, {
        line: 2, vars: { a, b },
        ask: askIt('b is 0. What does the function hand back?', a, [0, a0, b0 === a ? a + 1 : b0], `The answer is whatever a names when b reaches 0. Here that is ${a}.`, rounds),
      });
      s.tone('A', 'ok');
      const tries = a0 && b0 ? Math.min(a0, b0) - a + 1 : 0;
      s.set('race', { text: tries ? `The slow way counts down from ${Math.min(a0, b0)}: ${tries === 1 ? '1 try' : tries + ' tries'}` :'One number is 0, so there is nothing to count down.' });
      s.snap(`gcd(${a0}, ${b0}) is ${a}. That took ${many(rounds, 'round')}.`, { line: 5, vars: { a, b }, out: String(a) });
    },
  });

  // ---------------------------------------------------------------- lesson 28.5
  Viz.register('m28-sieve', {
    title: 'The sieve: cross out the multiples',
    size: [560, 306],
    code: py`
      alive = [True] * (n + 1)
      for p in range(2, n + 1):
          if alive[p]:
              print(p)
              for m in range(p * p, n + 1, p):
                  alive[m] = False
    `,
    inputs: [{ key: 'n', label: 'Up to n', type: 'number', value: 30, min: 2, max: 40 }],
    tryInputs: [{ n: 2 }, { n: 3 }, { n: 4 }, { n: 9 }, { n: 10 }, { n: 25 }, { n: 40 }, { n: '' }, { n: 'x' }, { n: 500 }],
    build(s, p) {
      const n = whole(p.n, 2, 40, 30);
      const perRow = 8;
      const X = v => 56 + ((v - 2) % perRow) * 56;
      const Y = v => 58 + Math.floor((v - 2) / perRow) * 50;
      const alive = {};
      for (let v = 2; v <= n; v += 1) {
        alive[v] = true;
        s.box('c' + v, X(v), Y(v), v, { w: 48, h: 42, size: 16 });
      }
      s.text('count', 20, 16, 'crossed out: 0', { size: 15, anchor: 'start', weight: 700 });
      s.text('calc', 540, 16, '', { size: 15, anchor: 'end', mono: true, weight: 700 });
      let crossings = 0, turn = 0;
      const found = [];
      const out = () => found.join(' ');
      s.snap(`Every number from 2 to ${n} starts alive.`, { line: 1, vars: { n } });
      for (let q = 2; q <= n && q * q <= n; q += 1) {
        if (!alive[q]) {
          s.tone('c' + q, 'active');
          s.snap(`${q} is crossed out, so a smaller prime divides it. Skip it.`, { line: 3, vars: { n, p: q }, out: out() });
          s.set('c' + q, { tone: 'muted', scale: 0.78 });
          continue;
        }
        s.tone('c' + q, 'active');
        const first = q * q;
        s.snap(`p is ${q}, and nothing crossed it out.`, {
          line: 3, vars: { n, p: q }, out: out(),
          ask: q === 2
            ? askIt('Only 1 and 2 divide 2. Is 2 prime?', 'Yes', ['No'], 'Only 1 and 2 divide 2 with nothing left over. So 2 is prime.', turn++)
            : askIt(`Which number should p = ${q} cross out first?`, first, [q + q, q + 1, first + q],
              `Smaller multiples like ${q + q} have a smaller factor, so they are already crossed. Start at ${q} x ${q}.`, turn++),
        });
        found.push(q);
        s.set('c' + q, { tone: 'ok', scale: 1.08 });
        s.snap(`${q} is prime, so print shows it.`, { line: 4, vars: { n, p: q }, out: out() });
        const multiples = [];
        for (let m = first; m <= n; m += q) multiples.push(m);
        const fresh = multiples.filter(m => alive[m]);
        multiples.forEach(m => {
          alive[m] = false;
          s.set('c' + m, { tone: 'muted', scale: 0.78 });
        });
        crossings += multiples.length;
        s.set('count', { text: `crossed out: ${crossings}` });
        s.set('calc', { text: `from ${first}, jump by ${q}` });
        const crossed = multiples.length === 1 ? `Cross out ${first}.` : multiples.length === 2 ? `Cross out ${first} and ${first + q}.` : `Cross out ${first}, ${first + q} and on, jumping by ${q}.`;
        s.snap(`${crossed} ${fresh.length} of them ${fresh.length === 1 ? 'was' : 'were'} still alive.`, { line: 6, vars: { n, p: q }, out: out() });
      }
      const next = Math.floor(Math.sqrt(n)) + 1;
      const rest = [];
      for (let v = next; v <= n; v += 1) if (alive[v]) rest.push(v);
      s.set('calc', { text: `${next} x ${next} = ${next * next}` });
      s.snap(`p is now past the square root: ${next} x ${next} is more than ${n}.`, {
        line: 5, vars: { n, p: next }, out: out(),
        ask: askIt(`Can p = ${next} or above cross out anything new?`, 'No, those jumps start past the end', ['Yes, it must keep going', 'Only if it is even'],
          `Each p starts crossing at p x p. For ${next} and above, that is past ${n}.`, turn++),
      });
      rest.forEach(v => { found.push(v); s.set('c' + v, { tone: 'ok', scale: 1.08 }); });
      s.set('calc', { text: `${found.length} primes` });
      s.snap(rest.length ? `The loop reads the rest. Every number still alive is prime.` : 'No more numbers are alive.', { line: 4, vars: { n }, out: out() });
      s.snap(`There ${found.length === 1 ? 'is 1 prime' : `are ${found.length} primes`} up to ${n}, with ${many(crossings, 'crossing')}.`, { line: 4, vars: { n }, out: out() });
    },
  });

  // ---------------------------------------------------------------- lessons 28.6 and 28.7
  /* Rows are split by a slash. A short row is filled with walls. Only the first S and E count. */
  function readMaze(text, maxR, maxC) {
    const rows = String(text == null ? '' : text).split(/[/\n;]+/).map(x => x.replace(/\s+/g, '')).filter(Boolean);
    const used = rows.slice(0, maxR);
    const cols = Math.min(maxC, used.reduce((m, r) => Math.max(m, r.length), 0));
    let start = null, end = null, changed = rows.length > maxR || rows.some(r => r.length > maxC);
    const grid = used.map((row, r) => {
      const a = [];
      for (let c = 0; c < cols; c += 1) {
        let ch = row[c] === undefined ? '#' : row[c].toUpperCase();
        if (ch === 'S') { if (start) { ch = '.'; changed = true; } else start = [r, c]; }
        else if (ch === 'E') { if (end) { ch = '.'; changed = true; } else end = [r, c]; }
        else if (!/[#.1-9]/.test(ch)) { ch = '.'; changed = true; }
        a.push(ch);
      }
      return a;
    });
    return { grid, start, end, changed };
  }
  const K = (r, c) => r + ',' + c;
  const spotText = ([r, c]) => `(${r},${c})`;

  function mazeKit(s, grid) {
    const x0 = 46, y0 = 52, cell = 42, gap = 4;
    const rows = grid.length, cols = rows ? grid[0].length : 0;
    const id = (r, c) => `m${r}_${c}`;
    const X = c => x0 + c * (cell + gap), Y = r => y0 + r * (cell + gap);
    for (let c = 0; c < cols; c += 1) s.text('ch' + c, X(c), y0 - cell / 2 - 12, c, { size: 13, tone: 'muted', mono: true });
    for (let r = 0; r < rows; r += 1) s.text('rh' + r, x0 - cell / 2 - 12, Y(r), r, { size: 13, tone: 'muted', mono: true });
    grid.forEach((row, r) => row.forEach((ch, c) => {
      s.box(id(r, c), X(c), Y(r), ch === '.' ? '' : ch, { w: cell, h: cell, size: 17, tone: ch === '#' ? 'muted' : 'default' });
    }));
    /* The same order as the Python: up, down, left, right. */
    const near = (r, c) => {
      const out = [];
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] !== '#') out.push([nr, nc]);
      });
      return out;
    };
    return { id, rows, cols, near };
  }
  /* BFS, one layer at a time. Also writes down who found each cell. */
  function bfsLayers(kit, start) {
    const dist = { [K(start[0], start[1])]: 0 };
    const came = { [K(start[0], start[1])]: null };
    const layers = [[start]];
    for (;;) {
      const next = [];
      layers[layers.length - 1].forEach(([r, c]) => {
        kit.near(r, c).forEach(([a, b]) => {
          if (dist[K(a, b)] == null) {
            dist[K(a, b)] = layers.length;
            came[K(a, b)] = [r, c];
            next.push([a, b]);
          }
        });
      });
      if (!next.length) break;
      layers.push(next);
    }
    return { dist, came, layers };
  }
  const label = (ch, d) => (ch === 'S' ? 'S' : ch === 'E' ? `E=${d}` : String(d));
  /* Shared opening. Returns false when the maze cannot be searched. */
  function mazeReady(s, m, line) {
    const note = m.changed ? ' Some of what you typed was changed.' : '';
    if (!m.grid.length || !m.start || !m.end) {
      const what = !m.grid.length ? 'This maze is empty.' : !m.start && !m.end ? 'This maze has no S and no E.' : !m.start ? 'This maze has no S.' : 'This maze has no E.';
      s.text('none', m.grid.length ? 470 : 280, 130, 'Try S.E', { size: 16, tone: 'muted' });
      s.snap(`${what}${note} A search needs both.`, { line });
      return false;
    }
    return true;
  }
  function legend(s, lines) {
    lines.forEach((t, i) => s.text('lg' + i, 372, 40 + i * 24, t, { size: 13, anchor: 'start', tone: 'muted' }));
  }

  const BFS_PLAN = py`
    put start in the queue, with 0 steps
    while the queue is not empty:
        take the cell at the front
        if it is the end: return its steps
        for each neighbour with no number:
            give it the steps of this cell + 1
            add it to the queue
    return -1
  `;

  Viz.register('m28-maze', {
    title: 'BFS fills your maze in layers',
    size: [560, 276],
    code: BFS_PLAN,
    inputs: [{ key: 'maze', label: 'Maze, rows split by /', type: 'text', value: 'S..#. / ##.#. / ..... / .###E', size: 26 }],
    tryInputs: [
      { maze: '' }, { maze: 'S' }, { maze: 'E' }, { maze: 'SE' }, { maze: 'S#E' }, { maze: 'S.#E / ..#. / ..#.' }, { maze: 'cat / dog' }, { maze: 'S.E' },
      { maze: 'S...... / ....... / ....... / ....... / ......E' }, { maze: 'S.#.#.. / .#...#. / ...#... / .#.#.#E' },
      { maze: 'S..... / #####. / ...... / .##### / .....E' }, { maze: 'S / . / . / . / . / . / E' }, { maze: 'S.......... / ....E' }, { maze: 'SS.EE' },
    ],
    build(s, p) {
      const m = readMaze(p.maze, 5, 7);
      const kit = mazeKit(s, m.grid);
      legend(s, ['S is the start', 'E is the exit', '# is a wall', 'A number means', 'steps from S']);
      if (!mazeReady(s, m, 1)) return;
      const end = m.end, start = m.start;
      const { dist, layers } = bfsLayers(kit, start);
      const ed = dist[K(end[0], end[1])];
      const reach = ed != null;
      const guess = Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1]);
      const note = m.changed ? ' Some of what you typed was changed.' : '';
      s.snap(`Look at the maze. You can step up, down, left or right.${note}`, {
        line: 1, vars: { steps: 0 },
        ask: reach
          ? askIt('Count by eye. What is the fewest steps from S to E?', ed, [ed + 2, ed + 1, 'There is no way out', Math.max(1, ed - 1)], `The shortest way has ${many(ed, 'step')}. Watch BFS find it.`, ed)
          : askIt('Count by eye. What is the fewest steps from S to E?', 'There is no way out', [guess, guess + 2], 'Walls close off the exit. Watch BFS run out of cells.', guess),
      });
      s.set(kit.id(start[0], start[1]), { tone: 'warn' });
      s.snap('S goes in the queue, with 0 steps.', { line: 1, vars: { steps: 0, 'in queue': 1 } });
      let total = 1;
      const lastLayer = reach ? ed : layers.length - 1;
      for (let d = 1; d <= lastLayer; d += 1) {
        const cells = layers[d];
        const isLast = reach && d === ed;
        layers[d - 1].forEach(([r, c]) => s.set(kit.id(r, c), { tone: 'ok' }));
        if (d % 3 === 1) {
          s.snap(`Every cell at ${many(d - 1, 'step')} leaves the queue, in turn.`, {
            line: 3, vars: { steps: d - 1, seen: total },
            ask: askIt(`How many new cells are ${many(d, 'step')} from S?`, cells.length, [cells.length + 1, Math.max(0, cells.length - 1), 4],
              `A new cell touches a cell from the last layer, and has no number yet. That gives ${cells.length}.`, d),
          });
        }
        cells.forEach(([r, c]) => {
          const box = kit.id(r, c);
          const text = label(m.grid[r][c], d);
          s.set(box, { text, tone: 'warn', size: text.length > 3 ? 14 : 17 });
        });
        total += cells.length;
        s.snap(isLast
          ? `E gets its number: ${d}. BFS stops when E leaves the queue.`
          : `${cells.length === 1 ? '1 new cell gets' : `${cells.length} new cells get`} the number ${d}.`, { line: 6, vars: { steps: d, seen: total, 'in queue': cells.length } });
      }
      if (reach) {
        s.set(kit.id(end[0], end[1]), { tone: 'ok', scale: 1.08 });
        s.snap(`The answer is ${ed}. BFS goes in layers, so nothing shorter was missed.`, { line: 4, vars: { steps: ed, seen: total }, out: String(ed) });
        s.snap('Now edit the maze. Add a wall to block it, or remove one.', { line: 4, vars: { steps: ed, seen: total }, out: String(ed) });
        return;
      }
      layers[layers.length - 1].forEach(([r, c]) => s.set(kit.id(r, c), { tone: 'ok' }));
      s.set(kit.id(end[0], end[1]), { tone: 'bad' });
      s.snap(`The queue is empty, and E has no number.`, {
        line: 2, vars: { seen: total, 'in queue': 0 },
        ask: askIt('What should the search give back?', '-1', ['0', String(total), 'It keeps looping'],
          'No cell is left to try, so the loop ends. The last line gives -1, which means no way out.', total),
      });
      s.snap(`The answer is -1. BFS reached ${many(total, 'cell')}, and E is not one of them.`, { line: 8, vars: { seen: total }, out: '-1' });
      s.snap('Now edit the maze. Open one wall, and run it again.', { line: 8, vars: { seen: total }, out: '-1' });
    },
  });

  Viz.register('m28-maze-route', {
    title: 'Walk back from the exit to get the route',
    size: [560, 276],
    code: py`
      path = []
      at = end
      while at is not None:
          path.append(at)
          at = came_from[at]
      path.reverse()
      print the maze, with * on the path
    `,
    inputs: [{ key: 'maze', label: 'Maze, rows split by /', type: 'text', value: 'S..#. / ##.#. / ..... / .###E', size: 26 }],
    tryInputs: [
      { maze: '' }, { maze: 'S' }, { maze: 'SE' }, { maze: 'S.E' }, { maze: 'S#E' }, { maze: 'S.#E / ..#. / ..#.' }, { maze: 'cat / dog' },
      { maze: 'S...... / ....... / ....... / ....... / ......E' }, { maze: 'S..... / #####. / ...... / .##### / .....E' }, { maze: 'S / . / . / . / E' },
    ],
    build(s, p) {
      const m = readMaze(p.maze, 5, 7);
      const kit = mazeKit(s, m.grid);
      legend(s, ['A number means', 'steps from S', 'An arrow points', 'to who found it']);
      if (!mazeReady(s, m, 1)) return;
      const start = m.start, end = m.end;
      const { dist, came } = bfsLayers(kit, start);
      const ed = dist[K(end[0], end[1])];
      m.grid.forEach((row, r) => row.forEach((ch, c) => {
        const d = dist[K(r, c)];
        if (d != null && ch !== 'S') {
          const text = label(ch, d);
          s.set(kit.id(r, c), { text, tone: 'muted', size: text.length > 3 ? 14 : 17 });
        }
      }));
      s.set(kit.id(start[0], start[1]), { tone: 'warn' });
      s.set(kit.id(end[0], end[1]), { tone: ed == null ? 'bad' : 'warn' });
      if (ed == null) {
        s.snap('BFS finished, and came_from has no entry for E.', {
          line: 1,
          ask: askIt('What should find_route give back?', 'An empty list', ['A list with only S', 'A crash is fine', 'The longest route'],
            'There is no route, so the list stays empty. Your code should check this before it walks back.', 2),
        });
        s.snap('It gives [], and the maze prints with no stars. Now open a wall.', { line: 7, vars: { path: '[]' }, out: m.grid.map(r => r.join('')).join('\n') });
        return;
      }
      s.snap('BFS has run. For each cell, came_from says who found it.', { line: 1, vars: { path: '[]' } });
      let at = end;
      const back = [];
      let step = 0;
      const pathText = list => '[' + list.map(spotText).join(' ') + ']';
      s.snap(`at starts on E, at ${spotText(end)}.`, { line: 2, vars: { at: spotText(at), path: '[]' } });
      while (at) {
        back.push(at);
        const from = came[K(at[0], at[1])];
        const here = kit.id(at[0], at[1]);
        s.set(here, { tone: 'ok' });
        if (from) {
          const options = kit.near(at[0], at[1]).map(spotText).filter(t => t !== spotText(from));
          if (step % 3 === 0 && options.length) {
            s.snap(`${spotText(at)} joins the path. Who found it?`, {
              line: 5, vars: { at: spotText(at), path: pathText(back) },
              ask: askIt(`The cell ${spotText(at)} has the number ${dist[K(at[0], at[1])]}. What is came_from here?`, spotText(from), options,
                `BFS found it from ${spotText(from)}. That cell has the number ${dist[K(from[0], from[1])]}.`, step),
            });
          }
          const arrow = from[0] < at[0] ? '\u2191' : from[0] > at[0] ? '\u2193' : from[1] < at[1] ? '\u2190' : '\u2192';
          const mark = (m.grid[at[0]][at[1]] === 'E' ? 'E' : String(dist[K(at[0], at[1])])) + arrow;
          s.set(here, { text: mark, size: mark.length > 3 ? 14 : 17 });
          s.snap(`${spotText(at)} joins the path. came_from says ${spotText(from)}, so at moves there.`, { line: 5, vars: { at: spotText(from), path: pathText(back) } });
        } else {
          s.snap('S joins the path. came_from for S is None.', {
            line: 3, vars: { at: 'None', path: pathText(back) },
            ask: askIt('at is now None. What does the loop do?', 'It stops', ['It starts again at E', 'It crashes'],
              'The loop runs only while at is not None. S is the only cell with None.', 1),
          });
        }
        at = from;
        step += 1;
      }
      const forward = back.slice().reverse();
      s.snap(`The list runs from E back to S. So flip it.`, {
        line: 6, vars: { at: 'None', path: pathText(back) },
        ask: askIt('Which cell comes first after the flip?', `S at ${spotText(start)}`, [`E at ${spotText(end)}`, 'The middle cell'],
          'Walking back made E first. Flipping the list puts S first.', 3),
      });
      s.snap(`path now starts at S and ends at E. It has ${forward.length} cells and ${many(forward.length - 1, 'step')}.`, { line: 6, vars: { path: pathText(forward) } });
      const onPath = new Set(forward.map(c => K(c[0], c[1])));
      m.grid.forEach((row, r) => row.forEach((ch, c) => {
        const box = kit.id(r, c);
        if (ch === 'S' || ch === 'E') s.set(box, { text: ch, size: 17 });
        else if (onPath.has(K(r, c))) s.set(box, { text: '*', tone: 'ok' });
        else if (ch !== '#') s.set(box, { text: '', tone: 'default' });
      }));
      const drawn = m.grid.map((row, r) => row.map((ch, c) => (ch === '.' && onPath.has(K(r, c)) ? '*' : ch)).join('')).join('\n');
      s.snap('Print the maze, with * on each cell of the path.', { line: 7, vars: { path: pathText(forward) }, out: drawn });
    },
  });

  Viz.register('m28-maze-costs', {
    title: 'Fewest steps or lowest cost?',
    size: [560, 226],
    code: py`
      push (0, start) on the heap
      while the heap is not empty:
          pop the cheapest cell
          if it is finished: skip it
          mark it finished
          if it is the end: return its cost
          for each neighbour:
              new = cost + price of that cell
              if new beats its best cost:
                  save new, and push it
      return -1
    `,
    inputs: [{ key: 'maze', label: 'Maze: digits are prices', type: 'text', value: 'S9.E / 1.9. / 1111', size: 24 }],
    tryInputs: [
      { maze: '' }, { maze: 'S' }, { maze: 'SE' }, { maze: 'S9E' }, { maze: 'S#E' }, { maze: 'S.#E / 11#. / 11#.' }, { maze: 'cat / dog' },
      { maze: 'S9E / 111' }, { maze: 'S2E / #5#' }, { maze: 'S1111 / 11111 / 11111 / 1111E' }, { maze: 'S999 / 1999 / 1111 / 999E' }, { maze: '9S9 / 9E9' },
    ],
    build(s, p) {
      const m = readMaze(p.maze, 4, 5);
      const kit = mazeKit(s, m.grid);
      s.text('hl', 372, 40, 'heap: cheapest first', { size: 13, anchor: 'start', tone: 'muted' });
      if (!mazeReady(s, m, 1)) return;
      const start = m.start, end = m.end;
      const price = (r, c) => {
        const ch = m.grid[r][c];
        return /[1-9]/.test(ch) ? Number(ch) : 1;
      };
      const { dist, came } = bfsLayers(kit, start);
      const fewest = dist[K(end[0], end[1])];
      // The cost of the route that BFS finds, to compare at the end.
      let bfsCost = null;
      if (fewest != null) {
        bfsCost = 0;
        let at = end;
        while (came[K(at[0], at[1])]) { bfsCost += price(at[0], at[1]); at = came[K(at[0], at[1])]; }
      }
      const heap = [{ cost: 0, r: start[0], c: start[1] }];
      const order = (a, b) => a.cost - b.cost || a.r - b.r || a.c - b.c;
      const best = { [K(start[0], start[1])]: 0 };
      const done = new Set();
      const show = () => {
        const sorted = heap.slice().sort(order);
        for (let i = 0; i < 6; i += 1) {
          const t = i < 5 ? (sorted[i] ? `${sorted[i].cost} at (${sorted[i].r},${sorted[i].c})` : '') : (sorted.length > 5 ? `and ${sorted.length - 5} more` : '');
          if (s.has('h' + i)) s.set('h' + i, { text: t });
          else s.text('h' + i, 372, 64 + i * 22, t, { size: 14, anchor: 'start', mono: true });
        }
        return sorted;
      };
      show();
      const note = m.changed ? ' Some of what you typed was changed.' : '';
      s.snap(`Each digit is the price to step on that cell. Other cells cost 1.${note}`, {
        line: 1, vars: { popped: 0 },
        ask: fewest == null
          ? askIt('Can any route reach E here?', 'No, walls block it', ['Yes, if it pays more', 'Yes, through a wall'], 'Prices cannot open a wall. The heap will run out.', 1)
          : askIt('Is the route with the fewest steps always the cheapest?', 'No, it may cross costly cells', ['Yes, always', 'Only on a big grid'],
            'BFS counts steps and does not look at prices. Fewer steps can still cost more.', 1),
      });
      let popped = 0, result = -1, turn = 0, sinceAsk = 0;
      while (heap.length) {
        const sorted = heap.slice().sort(order);
        const top = sorted[0];
        const tag = t => `(${t.r},${t.c})`;
        if (sorted.length > 1 && sinceAsk >= 2) {
          const others = sorted.slice(1, 3).map(tag).filter(t => t !== tag(top));
          if (others.length) {
            s.snap('The heap holds more than one cell.', {
              line: 3, vars: { popped },
              ask: askIt('Which cell comes off next?', `${tag(top)}, cost ${top.cost}`, sorted.slice(1, 3).filter(t => tag(t) !== tag(top)).map(t => `${tag(t)}, cost ${t.cost}`),
                sorted[1].cost === top.cost ? `Both cost ${top.cost}. On a tie, Python compares the row next, so ${tag(top)} goes first.` : `A heap always gives the smallest. Cost ${top.cost} is the lowest here.`, turn++),
            });
            sinceAsk = 0;
          }
        }
        heap.splice(heap.indexOf(top), 1);
        popped += 1;
        sinceAsk += 1;
        const id = K(top.r, top.c);
        if (done.has(id)) {
          show();
          s.snap(`${tag(top)} is already finished, so this is a stale entry. Skip it.`, { line: 4, vars: { popped } });
          continue;
        }
        done.add(id);
        s.set(kit.id(top.r, top.c), { tone: 'ok' });
        if (top.r === end[0] && top.c === end[1]) {
          result = top.cost;
          show();
          s.set(kit.id(top.r, top.c), { text: `E=${top.cost}`, size: top.cost > 9 ? 14 : 17, scale: 1.08 });
          s.snap(`E comes off with cost ${top.cost}. That cost is final, so stop here.`, { line: 6, vars: { popped, cost: top.cost } });
          break;
        }
        const added = [];
        kit.near(top.r, top.c).forEach(([r, c]) => {
          const nk = K(r, c);
          if (done.has(nk)) return;
          const fresh = top.cost + price(r, c);
          if (best[nk] == null || fresh < best[nk]) {
            best[nk] = fresh;
            heap.push({ cost: fresh, r, c });
            added.push(fresh);
            const ch = m.grid[r][c];
            if (ch !== 'E') s.set(kit.id(r, c), { text: `=${fresh}`, tone: 'warn', size: fresh > 9 ? 14 : 17 });
            else s.set(kit.id(r, c), { tone: 'warn' });
          }
        });
        show();
        s.snap(`${tag(top)} comes off with cost ${top.cost}. ${added.length ? `It pushes ${many(added.length, 'new cost')}.` : 'It pushes nothing new.'}`, { line: added.length ? 10 : 3, vars: { popped, cost: top.cost } });
      }
      if (result < 0) {
        s.set(kit.id(end[0], end[1]), { tone: 'bad' });
        s.snap('The heap is empty, and E never came off. The answer is -1.', { line: 11, vars: { popped }, out: '-1' });
        return;
      }
      s.snap(bfsCost === result
        ? `Here the BFS route costs ${result} too. Raise a price on it and try again.`
        : `BFS takes ${many(fewest, 'step')} but costs ${bfsCost}. Dijkstra's route costs ${result}.`, { line: 6, vars: { popped, cost: result }, out: String(result) });
    },
  });
})();
