/* Visuals for module 22: greedy coins, intervals as bars on a timeline, greedy classics. Names start with the module id. */
(function () {
  // ------------------------------------------------------------- helpers
  const toInt = (v, lo, hi, d) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
  };
  const show = a => '[' + a.join(', ') + ']';
  const plural = (n, word) => (n === 1 ? `1 ${word}` : `${n} ${word}s`);

  /* Options for an ask. Repeats are dropped, and the right one moves around. */
  const pick = (right, wrongs, seed = 0) => {
    const r = String(right);
    const rest = [...new Set(wrongs.map(String))].filter(x => x !== r);
    const at = Math.abs(seed) % (rest.length + 1);
    const options = rest.slice();
    options.splice(at, 0, r);
    return { options, answer: at };
  };

  /* A question with only one choice is no question, so leave it out. */
  const askIf = ask => (ask.options.length > 1 ? ask : null);

  /* Something the rule has thrown away looks smaller and paler, so colour is not the only clue. */
  const ruleOut = (s, id) => s.set(id, { tone: 'muted', scale: 0.86 });

  // ------------------------------------------------------------- coins
  /* Different coin values from 1 to 50, biggest first. Anything else is skipped. */
  const readCoins = text => {
    const raw = (String(text == null ? '' : text).match(/-?\d+/g) || []).map(x => parseInt(x, 10));
    const coins = [...new Set(raw.filter(v => v >= 1 && v <= 50))].sort((a, b) => b - a).slice(0, 5);
    return { coins, changed: raw.length !== coins.length };
  };
  const greedyPlan = (coins, amount) => {
    const used = [];
    let left = amount;
    coins.forEach(c => { while (left >= c) { left -= c; used.push(c); } });
    return { used, left };
  };
  /* The fewest coins, found by building up from amount 0. The learner meets this idea in module 25. */
  const bestMix = (coins, amount) => {
    const best = [[]];
    for (let a = 1; a <= amount; a++) {
      best[a] = null;
      coins.forEach(c => {
        if (c <= a && best[a - c] && (!best[a] || best[a - c].length + 1 < best[a].length)) best[a] = best[a - c].concat(c);
      });
    }
    return best[amount] ? best[amount].slice().sort((x, y) => y - x) : null;
  };
  const coinSum = list => list.join(' + ');

  const COIN_CODE = py`
    def greedy_coins(coins, amount):
        used = []
        for coin in sorted(coins, reverse=True):
            while amount >= coin:
                amount = amount - coin
                used.append(coin)
        if amount > 0:
            return None
        return used
  `;

  // ---------------------------------------------------------- lesson 22.1
  Viz.register('m22-coins', {
    title: 'Greedy grabs the biggest coin that fits',
    size: [560, 300],
    code: COIN_CODE,
    inputs: [
      { key: 'coins', label: 'coins', type: 'text', value: '1 3 4', size: 14 },
      { key: 'amount', label: 'amount', type: 'number', value: 6, min: 0, max: 20 },
    ],
    tryInputs: [
      { coins: '', amount: 6 }, { coins: '', amount: 0 }, { coins: '5', amount: 0 }, { coins: '1', amount: 20 },
      { coins: '3 5', amount: 6 }, { coins: '4 6', amount: 7 }, { coins: '1 5 10 50', amount: 18 },
      { coins: '3 3 1', amount: 6 }, { coins: '9', amount: 6 }, { coins: 'cat', amount: 4 },
      { coins: '0 -2 7', amount: 7 }, { coins: '1 2 3 4 5 6 7 8', amount: 20 }, { coins: '1 3 4', amount: 10 },
    ],
    build(s, p) {
      const { coins, changed } = readCoins(p.coins);
      const amount = toInt(p.amount, 0, 20, 6);
      const plan = greedyPlan(coins, amount);
      const best = bestMix(coins, amount);

      s.box('left', 50, 34, amount, { w: 64, h: 40, sub: 'left' });
      s.box('count', 510, 34, 0, { w: 64, h: 40, sub: 'coins used' });
      s.text('cl', 146, 34, 'coins', { size: 13, anchor: 'end' });
      coins.forEach((c, i) => s.circle('c' + c, 280 + (i - (coins.length - 1) / 2) * 54, 34, c, { r: 22 }));
      s.area('ga', 16, 92, 528, 98, 'Greedy: biggest coin that fits');
      s.area('ba', 16, 196, 528, 98, 'Best mix: found by trying every mix');

      /* Spots for the coins in an area. More than 13 coins take 2 rows. */
      const spot = (i, total, top) => {
        const perRow = 13, gap = 40;
        const row = total > perRow ? Math.floor(i / perRow) : 0;
        const inRow = total > perRow ? (row === 0 ? perRow : total - perRow) : total;
        const col = i - row * perRow;
        const y = total > perRow ? top + 44 + row * 34 : top + 56;
        return { x: 280 + (col - (inRow - 1) / 2) * gap, y };
      };
      const vars = (left, used) => ({ amount: left, used: show(used) });
      if (changed) {
        s.snap(coins.length
          ? `I kept different coins from 1 to 50. You have ${show(coins)}.`
          : 'I found no coins from 1 to 50 in what you typed.', { line: 1, vars: vars(amount, []) });
      }

      if (!coins.length) {
        s.snap(amount === 0
          ? 'The amount is 0, so you need no coins at all.'
          : `You have no coins, so nothing can make ${amount}. Greedy hands back None.`,
        { line: amount === 0 ? 9 : 8, vars: vars(amount, []), out: amount === 0 ? '[]' : 'None' });
        return;
      }
      if (amount === 0) {
        s.snap('The amount is 0. No coin is needed, so the list stays empty.', { line: 9, vars: vars(0, []), out: '[]' });
        return;
      }

      /* The next greedy question, asked before the coin is taken. */
      const nextAsk = left => {
        const fit = coins.find(c => c <= left);
        const bigger = coins.filter(c => c > left).slice(-1);
        const smaller = fit == null ? [] : coins.filter(c => c < fit).slice(0, 1);
        const shown = [...bigger, ...(fit == null ? [] : [fit]), ...smaller].sort((a, b) => b - a).map(String);
        const options = shown.concat('No coin fits');
        return {
          q: `${left} is left. What does greedy take next?`,
          options,
          answer: fit == null ? options.length - 1 : options.indexOf(String(fit)),
          why: fit == null
            ? `Every coin is bigger than ${left}, so greedy has no move.`
            : `${fit} is the biggest coin that fits in ${left}.${bigger.length ? ` ${bigger[0]} is too big.` : ''}`,
        };
      };

      s.snap(`You must make ${amount}. Greedy looks at the biggest coin first.`, {
        line: 3, vars: vars(amount, []), ask: nextAsk(amount),
      });

      let left = amount, at = 0, run = 0;
      const used = [];
      while (left > 0) {
        let next = at;
        while (next < coins.length && coins[next] > left) next += 1;
        if (next !== at || used.length === 0) {
          const skipped = coins.slice(used.length ? at + 1 : 0, next);
          if (used.length) s.tone('c' + coins[at], 'muted');
          skipped.forEach(c => s.tone('c' + c, 'muted'));
          if (skipped.length) {
            s.snap(`${coinSum(skipped).replace(/ \+ /g, ' and ')} ${skipped.length === 1 ? 'is' : 'are'} too big for ${left}, so greedy skips ${skipped.length === 1 ? 'it' : 'them'}.`, {
              line: 4, vars: vars(left, used),
            });
          }
          run = 0;
        }
        if (next === coins.length) break;
        at = next;
        const c = coins[at];
        left -= c;
        run += 1;
        used.push(c);
        s.tone('c' + c, 'active');
        const q = spot(used.length - 1, plan.used.length, 92);
        s.circle('g' + used.length, q.x, q.y, c, { r: 17, tone: 'active' });
        if (used.length > 1) s.tone('g' + (used.length - 1), 'default');
        s.set('left', { text: left });
        s.set('count', { text: used.length });
        const stillSame = left >= c;
        const askNow = left > 0 && (!stillSame || run % 4 === 0);
        s.snap(left === 0 ? `Take ${c}. That leaves nothing.` : `Take ${c}. That leaves ${left}.`, {
          line: 6, vars: vars(left, used), ask: askNow ? nextAsk(left) : null,
        });
      }

      coins.forEach(c => s.tone('c' + c, 'muted'));
      if (used.length) s.tone('g' + used.length, 'default');
      const stuck = left > 0;
      const k = used.length;
      const gout = stuck ? 'None' : show(used);
      const m = best ? best.length : 0;
      const q = stuck
        ? pick('Yes', ['No'], amount)
        : pick(best.length < k ? 'Yes' : 'No', [best.length < k ? 'No' : 'Yes'], amount);
      const qAsk = stuck
        ? {
          q: `Greedy gave up with ${left} left. Can any mix make ${amount}?`,
          options: best ? q.options : ['Yes', 'No'],
          answer: best ? q.answer : 1,
          why: best ? `${m <= 6 ? coinSum(best) : 'A mix'} makes ${amount}.` : `No mix of these coins adds up to ${amount}.`,
        }
        : {
          q: `Can another mix make ${amount} with fewer than ${k} coins?`,
          options: q.options, answer: q.answer,
          why: best.length < k ? `${m <= 6 ? coinSum(best) : 'A mix'} makes ${amount} with ${plural(m, 'coin')}.` : `No mix makes ${amount} with fewer than ${plural(k, 'coin')}.`,
        };
      s.snap(stuck
        ? `No coin fits in ${left}, so greedy hands back None.`
        : `Greedy made ${amount} with ${plural(k, 'coin')}${k <= 6 ? ': ' + coinSum(used) : ''}.`, {
        line: stuck ? 8 : 9, vars: vars(left, used), out: gout, ask: qAsk,
      });

      if (best) {
        best.forEach((c, i) => {
          const q2 = spot(i, m, 196);
          s.circle('b' + i, q2.x, q2.y, c, { r: 17, tone: 'ok' });
        });
        s.snap(m <= 6 ? `The best mix is ${coinSum(best)}. That is ${plural(m, 'coin')}.` : `The best mix also uses ${plural(m, 'coin')}.`, { line: stuck ? 8 : 9, vars: { greedy: stuck ? 'stuck' : k, best: m }, out: gout });
      } else {
        s.text('none', 280, 252, 'No mix works', { size: 16, weight: 700 });
        s.snap(`No mix of these coins can make ${amount}.`, { line: 8, vars: { greedy: 'stuck', best: 'none' }, out: gout });
      }

      if (stuck && best) {
        for (let i = 1; i <= k; i++) s.tone('g' + i, 'bad');
        s.snap('Greedy got stuck, but a mix exists. Greedy lied here.', { line: 8, vars: { greedy: 'stuck', best: m }, out: gout });
      } else if (!stuck && m < k) {
        for (let i = 1; i <= k; i++) s.tone('g' + i, 'bad');
        s.snap(`Greedy used ${k}, and the best is ${m}. Greedy lied here.`, { line: 9, vars: { greedy: k, best: m }, out: gout });
      } else if (!stuck) {
        for (let i = 1; i <= k; i++) s.tone('g' + i, 'ok');
        s.snap('Greedy matched the best here. One match does not prove the rule.', { line: 9, vars: { greedy: k, best: m }, out: gout });
      } else {
        s.snap('Greedy told the truth here. No mix exists at all.', { line: 8, vars: { greedy: 'stuck', best: 'none' }, out: gout });
      }
    },
  });

  Viz.register('m22-coin-hunt', {
    title: 'Hunt for the amount where greedy lies',
    size: [560, 216],
    inputs: [{ key: 'coins', label: 'coins', type: 'text', value: '1 3 4', size: 14 }],
    tryInputs: [
      { coins: '' }, { coins: '1' }, { coins: '3 5' }, { coins: '1 5 10 50' }, { coins: '1 2 4 8' },
      { coins: '4 6' }, { coins: '1 4 5' }, { coins: 'cat' }, { coins: '3 3 1' }, { coins: '11' },
    ],
    build(s, p) {
      const { coins } = readCoins(p.coins);
      const MAX = 10;
      const o = { y: 58, x: 314, cell: 42, gap: 5, index: false };
      const amounts = Array.from({ length: MAX }, (_, i) => i + 1);
      s.text('la', 8, 58, 'amount', { size: 13, anchor: 'start' });
      s.text('lg', 8, 108, 'greedy', { size: 13, anchor: 'start' });
      s.text('lb', 8, 158, 'best', { size: 13, anchor: 'start' });
      s.row('a', amounts, o);
      s.row('g', amounts.map(() => ''), Object.assign({}, o, { y: 108 }));
      s.row('b', amounts.map(() => ''), Object.assign({}, o, { y: 158 }));
      s.text('msg', 280, 18, '', { size: 16, weight: 700 });
      if (!coins.length) {
        s.snap('You have no coins, so no amount can be made. Type some coins above.', { vars: { lies: 0 } });
        return;
      }
      const X = i => s.slotX(i, MAX, o);
      const rows = amounts.map(a => {
        const g = greedyPlan(coins, a);
        const b = bestMix(coins, a);
        return { a, g: g.left > 0 ? null : g.used.length, b: b ? b.length : null };
      });
      const isLie = r => r.b != null && (r.g == null || r.g > r.b);
      const firstLie = rows.findIndex(isLie);
      const lies = [];
      s.snap(`Coins ${show(coins.slice().reverse())}. Each column is one amount. A dash means it cannot be done.`, { vars: { lies: 0 } });
      rows.forEach((r, i) => {
        const gt = r.g == null ? '-' : r.g;
        const bt = r.b == null ? '-' : r.b;
        const asking = i === firstLie || (firstLie !== 2 && i === 2) || (firstLie < 0 && i === 6);
        s.tone('a' + i, 'active');
        if (i > 0) s.tone('a' + (i - 1), 'default');
        s.set('g' + i, { text: gt });
        if (asking) {
          const lie = isLie(r);
          const q = pick('Yes', ['No'], i);
          const ans = lie ? 'Yes' : 'No';
          s.set('msg', { text: `Amount ${r.a}: greedy says ${gt}` });
          s.snap(r.g == null ? `Amount ${r.a}: greedy gets stuck.` : `Amount ${r.a}: greedy uses ${plural(r.g, 'coin')}.`, {
            vars: { amount: r.a, lies: lies.length },
            ask: {
              q: r.g == null ? `Can some mix make ${r.a}, even though greedy got stuck?` : `Can another mix make ${r.a} with fewer coins?`,
              options: q.options, answer: q.options.indexOf(ans),
              why: lie ? `A mix with ${plural(r.b, 'coin')} works. So greedy lied at ${r.a}.` : (r.b == null ? `No mix can make ${r.a} with these coins.` : `The best for ${r.a} is ${plural(r.b, 'coin')}. Greedy is right here.`),
            },
          });
        }
        s.set('b' + i, { text: bt });
        if (isLie(r)) {
          lies.push(r.a);
          s.tone(['g' + i, 'b' + i], 'bad');
          s.text('x' + i, X(i), 196, 'lie', { size: 13, weight: 700, tone: 'bad' });
        } else {
          s.tone(['g' + i, 'b' + i], 'ok');
        }
        s.set('msg', { text: isLie(r) ? `Amount ${r.a}: greedy lies` : `Amount ${r.a}: same answer` });
        s.snap(isLie(r)
          ? `Amount ${r.a}: greedy says ${gt}, and the best is ${bt}.`
          : (r.b == null ? `Amount ${r.a}: nothing can make it. Both agree.` : `Amount ${r.a}: both use ${plural(r.b, 'coin')}.`), { vars: { amount: r.a, lies: lies.length } });
      });
      s.tone('a' + (MAX - 1), 'default');
      s.set('msg', { text: lies.length ? `Lies at: ${lies.join(', ')}` : 'No lies up to 10' });
      const q = pick('1', [String(MAX), '2'], coins.length);
      s.snap(lies.length
        ? `Greedy passed ${MAX - lies.length} amounts and failed ${lies.length}.`
        : `Greedy passed all ${MAX} amounts here. Bigger amounts are still untested.`, {
        vars: { lies: lies.length },
        ask: {
          q: 'How many bad amounts does it take to prove a rule wrong?',
          options: q.options, answer: q.answer,
          why: 'One counterexample is enough. Many good tests never prove a rule right.',
        },
      });
    },
  });

  // ---------------------------------------------------------- timeline helpers
  /* Pairs of whole numbers from what the learner typed, like 1-3 2-5. Times run from 0 to 10. */
  const readBars = (text, max = 6) => {
    const nums = (String(text == null ? '' : text).match(/\d+/g) || []).map(x => parseInt(x, 10));
    const bars = [];
    let note = '';
    for (let i = 0; i + 1 < nums.length && bars.length < max; i += 2) {
      let a = Math.min(10, nums[i]), b = Math.min(10, nums[i + 1]);
      if (nums[i] > 10 || nums[i + 1] > 10) note = 'Times run from 0 to 10, so I moved bigger ones to 10.';
      if (a > b) { const t = a; a = b; b = t; note = note || 'A start must come before its end, so I swapped some.'; }
      if (a === b) { note = 'A bar must start before it ends, so I skipped some.'; continue; }
      bars.push([a, b]);
    }
    if (nums.length > max * 2) note = `I kept the first ${max} bars.`;
    return { bars, note };
  };
  const name = b => `${b[0]}-${b[1]}`;
  const byStart = (x, y) => x[0] - y[0] || x[1] - y[1];
  const byEnd = (x, y) => x[1] - y[1] || x[0] - y[0];
  const clash = (x, y) => x[0] < y[1] && y[0] < x[1];
  const list = bars => '[' + bars.map(b => `[${b[0]}, ${b[1]}]`).join(', ') + ']';

  /* A timeline from 0 to 10. opts.x0 is where 0 sits, opts.unit is one hour. */
  const timeline = (s, top, floor, o = {}) => {
    const x0 = o.x0 == null ? 30 : o.x0, unit = o.unit || 50;
    const tx = t => x0 + t * unit;
    for (let t = 0; t <= 10; t++) {
      s.box('gr' + t, tx(t), (top + floor) / 2, '', { w: 1, h: floor - top, tone: 'muted' });
      s.text('tk' + t, tx(t), o.tickY == null ? floor + 15 : o.tickY, t, { size: 13, mono: true, tone: 'muted' });
    }
    const bar = (id, b, y, extra) => s.box(id, tx((b[0] + b[1]) / 2), y, name(b), Object.assign({ w: (b[1] - b[0]) * unit, h: 26, size: 16 }, extra));
    const place = (id, b, y, extra) => s.set(id, Object.assign({ x: tx((b[0] + b[1]) / 2), y, w: (b[1] - b[0]) * unit, text: name(b) }, extra));
    return { tx, bar, place };
  };

  const BAR_TRIES = [
    { meetings: '' }, { meetings: '2-4' }, { meetings: '1-2 3-4' }, { meetings: '1-5 5-8' },
    { meetings: '1-10 2-3 4-5' }, { meetings: '2-4 2-4' }, { meetings: 'cat' }, { meetings: '5-5' },
    { meetings: '7-2' }, { meetings: '0-1 1-2 2-3 3-4 4-5 5-6 6-7' }, { meetings: '20-30' }, { meetings: '9-10 0-10 3-4' },
  ];

  // ---------------------------------------------------------- lesson 22.2
  Viz.register('m22-merge', {
    title: 'Merge bars on a timeline',
    size: [560, 330],
    code: py`
      def merge(meetings):
          merged = []
          for start, end in sorted(meetings):
              if len(merged) > 0 and start <= merged[-1][1]:
                  merged[-1][1] = max(merged[-1][1], end)
              else:
                  merged.append([start, end])
          return merged
    `,
    inputs: [{ key: 'meetings', label: 'bars (start-end)', type: 'text', value: '1-3 2-5 5-6 8-10 8-9', size: 22 }],
    tryInputs: BAR_TRIES,
    build(s, p) {
      const { bars, note } = readBars(p.meetings);
      const n = bars.length;
      const lane = i => 62 + i * 30;
      const t = timeline(s, 46, 232);
      s.text('expr', 280, 14, '', { size: 16, weight: 700 });
      s.area('ma', 16, 258, 528, 68, 'merged');
      s.box('sw', t.tx(0), 139, '', { w: 2, h: 186, tone: 'accent', opacity: 0 });
      bars.forEach((b, i) => t.bar('b' + i, b, lane(i)));
      const vars = (merged, steps) => ({ merged: list(merged), steps });
      if (note) s.snap(note, { line: 1, vars: vars([], 0) });
      if (!n) {
        s.snap('There are no bars, so merged stays empty.', { line: 8, vars: vars([], 0), out: '[]' });
        return;
      }

      const order = bars.map((b, i) => ({ b, i })).sort((x, y) => byStart(x.b, y.b));
      const isSortedAlready = order.every((o, k) => o.i === k);
      if (n > 1) {
        s.snap('These bars are in the order you typed them.', {
          line: 3, vars: vars([], 0),
          ask: {
            q: 'What should you do before you merge?',
            options: ['Sort the bars by start', 'Sort the bars by end', 'Merge the first 2 you see'],
            answer: 0,
            why: 'After sorting by start, only the last block can touch the next bar.',
          },
        });
        order.forEach((o, k) => s.set('b' + o.i, { y: lane(k) }));
        s.snap(isSortedAlready ? 'These are already in start order, so nothing moves.' : 'Now the bars run by start time, top to bottom.', { line: 3, vars: vars([], 0) });
      }

      const merged = [];
      let steps = 0;
      s.set('sw', { x: t.tx(order[0].b[0]), opacity: 1 });
      s.text('now', t.tx(order[0].b[0]), 36, 'now', { size: 13, weight: 700 });
      order.forEach((o, k) => {
        const [start, end] = o.b;
        steps += 1;
        s.set('sw', { x: t.tx(start) });
        s.set('now', { x: t.tx(start) });
        s.tone('b' + o.i, 'active');
        if (k === 0) {
          merged.push([start, end]);
          t.bar('m0', merged[0], 304, { tone: 'ok' });
          s.set('expr', { text: 'merged is empty' });
          s.snap(`The first bar, ${name(o.b)}, starts the first block.`, { line: 7, vars: vars(merged, steps) });
          ruleOut(s, 'b' + o.i);
          return;
        }
        const last = merged[merged.length - 1];
        const mid = merged.length - 1;
        const touching = start === last[1];
        const joins = start <= last[1];
        s.set('expr', { text: `start ${start} <= last end ${last[1]} ?` });
        s.snap(`Next is ${name(o.b)}. The last block ends at ${last[1]}.`, {
          line: 4, vars: vars(merged, steps),
          ask: {
            q: `${name(o.b)} starts at ${start}. The last block ends at ${last[1]}. What happens?`,
            options: ['Merge it into the last block', 'Start a new block'],
            answer: joins ? 0 : 1,
            why: touching
              ? `They touch at ${start}. No gap is left, so this merge glues them together.`
              : joins
                ? `${start} is not past ${last[1]}, so they share time.`
                : `${start} is past ${last[1]}, so there is a gap between them.`,
          },
        });
        if (joins) {
          const inside = end <= last[1];
          if (inside) {
            const q = pick(last[1], [end], start);
            s.snap(`${name(o.b)} sits inside the last block.`, {
              line: 5, vars: vars(merged, steps),
              ask: askIf({
                q: 'What is the end of the block now?',
                options: q.options, answer: q.answer,
                why: `The block still runs to ${last[1]}. That is why the code uses max, so the end never shrinks.`,
              }),
            });
          }
          last[1] = Math.max(last[1], end);
          t.place('m' + mid, last, 304);
          s.pulse('m' + mid);
          s.set('expr', { text: `max keeps the end at ${last[1]}` });
          s.snap(inside ? `The block stays ${name(last)}, since the bar adds nothing.` : `The block grows to ${name(last)}.`, { line: 5, vars: vars(merged, steps) });
        } else {
          merged.push([start, end]);
          t.bar('m' + (merged.length - 1), merged[merged.length - 1], 304, { tone: 'ok' });
          s.set('expr', { text: 'a gap, so a new block' });
          s.snap(`${name(o.b)} starts a new block.`, { line: 7, vars: vars(merged, steps) });
        }
        ruleOut(s, 'b' + o.i);
      });
      s.del('sw', 'now');
      s.set('expr', { text: '' });
      s.snap(`${plural(n, 'bar')} became ${plural(merged.length, 'block')}. The sweep took ${plural(steps, 'look')}.`, { line: 8, vars: vars(merged, steps), out: list(merged) });
    },
  });

  const RULES = {
    end: { label: 'ends first', cmp: byEnd, why: 'It ends soonest, so it leaves the most time.' },
    start: { label: 'starts first', cmp: byStart, why: 'It has the earliest start.' },
    short: { label: 'shortest first', cmp: (x, y) => (x[1] - x[0]) - (y[1] - y[0]) || byStart(x, y), why: 'It is the shortest bar.' },
  };
  const bestPlan = (bars, without) => {
    let best = [];
    for (let mask = 0; mask < 1 << bars.length; mask++) {
      if (without != null && mask & (1 << without)) continue;
      const pickd = bars.filter((_, i) => mask & (1 << i));
      if (pickd.length <= best.length) continue;
      if (pickd.every((x, i) => pickd.every((y, j) => j <= i || !clash(x, y)))) best = pickd;
    }
    return best.slice().sort(byStart);
  };

  Viz.register('m22-activity', {
    title: 'Which greedy rule fits the most meetings?',
    size: [560, 330],
    code: py`
      def most_meetings(meetings, rule):
          kept = []
          for m in sorted(meetings, key=rule):
              if no_clash(m, kept):
                  kept.append(m)
          return len(kept)
    `,
    inputs: [
      { key: 'meetings', label: 'meetings (start-end)', type: 'text', value: '0-9 1-4 3-5 4-8', size: 22 },
      { key: 'rule', label: 'rule', type: 'select', value: 'start', options: [
        { label: 'starts first', value: 'start' }, { label: 'shortest first', value: 'short' }, { label: 'ends first', value: 'end' },
      ] },
    ],
    tryInputs: [
      ...BAR_TRIES.map(x => Object.assign({ rule: 'end' }, x)),
      ...BAR_TRIES.map(x => Object.assign({ rule: 'short' }, x)),
      { meetings: '0-9 1-4 3-5 4-8', rule: 'end' },
      { meetings: '0-9 1-4 3-5 4-8', rule: 'short' },
      { meetings: '0-10 1-4 3-5 4-7 7-9', rule: 'short' },
      { meetings: '5-6 1-3', rule: 'short' },
      { meetings: '1-2 1-2 1-2', rule: 'start' },
    ],
    build(s, p) {
      const { bars, note } = readBars(p.meetings);
      const rule = RULES[p.rule] || RULES.end;
      const n = bars.length;
      const lane = i => 62 + i * 30;
      const t = timeline(s, 46, 232);
      s.text('expr', 280, 14, `Rule: ${rule.label}`, { size: 16, weight: 700 });
      s.area('ka', 16, 258, 528, 68, 'You go to');
      bars.forEach((b, i) => t.bar('b' + i, b, lane(i)));
      const vars = (kept, steps) => ({ rule: rule.label, kept: kept.length ? kept.map(name).join(' ') : 'none', steps });
      if (note) s.snap(note, { line: 1, vars: vars([], 0) });
      if (!n) {
        s.snap('There are no meetings, so you go to 0.', { line: 6, vars: vars([], 0), out: '0' });
        return;
      }
      const order = bars.map((b, i) => ({ b, i })).sort((x, y) => rule.cmp(x.b, y.b));
      if (n > 1) {
        const first = order[0].b;
        const q = pick(name(first), order.slice(1, 3).map(o => name(o.b)), n + first[0]);
        s.snap(`Your rule is: ${rule.label}. It decides who gets looked at first.`, {
          line: 3, vars: vars([], 0),
          ask: askIf({
            q: 'Which meeting does this rule look at first?',
            options: q.options, answer: q.answer,
            why: `${name(first)} wins. ${rule.why}`,
          }),
        });
        order.forEach((o, k) => s.set('b' + o.i, { y: lane(k) }));
        s.snap(`The rule puts the meetings in this order, top to bottom.`, { line: 3, vars: vars([], 0) });
      }
      const kept = [];
      let steps = 0;
      order.forEach((o, k) => {
        steps += 1;
        s.tone('b' + o.i, 'active');
        const blockers = kept.filter(x => clash(x, o.b));
        const touch = kept.find(x => x[1] === o.b[0] || x[0] === o.b[1]);
        if (kept.length) {
          s.set('expr', { text: `Does ${name(o.b)} clash?` });
          s.snap(`Next is ${name(o.b)}. Look at the bars in your list.`, {
            line: 4, vars: vars(kept, steps),
            ask: {
              q: `Does ${name(o.b)} clash with a meeting you kept?`,
              options: ['No clash. Keep it', 'Clash. Skip it'],
              answer: blockers.length ? 1 : 0,
              why: blockers.length
                ? `It shares time with ${name(blockers[0])}. You cannot be in both.`
                : touch
                  ? `It touches ${name(touch)} at one moment. Touching is not a clash.`
                  : 'It shares no time with anything you kept.',
            },
          });
        }
        if (blockers.length) {
          ruleOut(s, 'b' + o.i);
          s.set('expr', { text: `Skip ${name(o.b)}` });
          s.snap(`${name(o.b)} clashes, so you skip it for good.`, { line: 4, vars: vars(kept, steps) });
        } else {
          kept.push(o.b);
          s.tone('b' + o.i, 'ok');
          t.bar('k' + o.i, o.b, 304, { tone: 'ok' });
          s.set('expr', { text: `Keep ${name(o.b)}` });
          s.snap(`You keep ${name(o.b)}. Your list has ${plural(kept.length, 'meeting')}.`, { line: 5, vars: vars(kept, steps) });
        }
      });
      const best = bestPlan(bars);
      const c = kept.length, m = best.length;
      const q = pick(m > c ? 'Yes' : 'No', [m > c ? 'No' : 'Yes'], n);
      s.set('expr', { text: `Rule: ${rule.label}. You go to ${c}.` });
      s.snap(`This rule fits ${plural(c, 'meeting')}.`, {
        line: 6, vars: vars(kept, steps), out: String(c),
        ask: {
          q: `Could another plan fit more than ${c}?`,
          options: q.options, answer: q.answer,
          why: m > c ? `A plan with ${plural(m, 'meeting')} exists: ${best.map(name).join(', ')}.` : `${c} is the most that fit here. No plan beats it.`,
        },
      });
      if (m > c) {
        order.forEach(o => { if (s.has('k' + o.i)) s.del('k' + o.i); });
        best.forEach((b, i) => t.bar('p' + i, b, 304, { tone: 'warn' }));
        s.set('ka', { text: 'A better plan' });
        s.snap(`This plan fits ${m}. So the rule "${rule.label}" lied on these bars.`, { line: 6, vars: { rule: rule.label, kept: c, best: m }, out: String(c) });
      } else {
        s.snap(p.rule === 'end'
          ? 'Ends first gave the most again. The next picture shows why.'
          : 'This rule did well here. Other bars can still make it lose.', { line: 6, vars: { rule: rule.label, kept: c, best: m }, out: String(c) });
      }
    },
  });

  Viz.register('m22-swap-reason', {
    title: 'Why ends first is safe: the swap',
    size: [560, 310],
    inputs: [{ key: 'meetings', label: 'meetings (start-end)', type: 'text', value: '1-5 2-4 5-7 7-9', size: 22 }],
    tryInputs: [
      { meetings: '' }, { meetings: '2-4' }, { meetings: '1-2 3-4' }, { meetings: '1-5 5-8' }, { meetings: '2-4 2-4' },
      { meetings: 'cat' }, { meetings: '0-10 1-4 3-5 4-7 7-9' }, { meetings: '2-5 1-3 5-6 5-8' }, { meetings: '1-3 1-3 3-5' }, { meetings: '1-4 2-4 4-6' },
      { meetings: '0-1 1-2 2-3 3-4 4-5 5-6 6-7' },
    ],
    build(s, p) {
      const { bars, note } = readBars(p.meetings);
      const n = bars.length;
      const lane = i => 52 + i * 28;
      const t = timeline(s, 36, 212);
      s.text('msg', 280, 14, '', { size: 16, weight: 700 });
      s.area('pa', 16, 240, 528, 66, 'A best plan');
      bars.forEach((b, i) => t.bar('b' + i, b, lane(i)));
      if (note) s.snap(note);
      if (!n) { s.snap('There are no meetings, so there is nothing to swap.'); return; }
      const e = bars.map((b, i) => ({ b, i })).sort((x, y) => byEnd(x.b, y.b))[0];
      if (n > 1) {
        const q = pick(name(e.b), bars.filter(b => b !== e.b).slice(0, 2).map(name), n + 1);
        s.snap('Each bar is one meeting you could go to.', {
          ask: askIf({
            q: 'Which meeting ends first?',
            options: q.options, answer: q.answer,
            why: `${name(e.b)} ends at ${e.b[1]}. No other meeting ends sooner.`,
          }),
        });
      }
      s.tone('b' + e.i, 'ok');
      s.set('msg', { text: `${name(e.b)} ends first` });
      s.snap(`${name(e.b)} ends first, at ${e.b[1]}. Call it the early bar.`);

      const whole = bestPlan(bars);
      const other = bestPlan(bars, e.i);
      if (other.length < whole.length || !other.length || name(other[0]) === name(e.b)) {
        whole.forEach((b, i) => t.bar('p' + i, b, 284, { tone: 'ok' }));
        s.set('msg', { text: 'It is already in the plan' });
        s.snap(`Every best plan here uses ${name(e.b)} already. So no swap is needed.`);
        return;
      }
      other.forEach((b, i) => t.bar('p' + i, b, 276));
      const x = other[0];
      s.tone('p0', 'active');
      s.set('msg', { text: `Plan size: ${other.length}` });
      s.snap(`Say a friend's best plan skips the early bar. It starts with ${name(x)}.`);

      const rest = other.slice(1);
      const q = pick('No. It ends no later than that bar', ['Yes. It must clash with the rest'], n);
      s.snap(`Now swap: take out ${name(x)} and put in ${name(e.b)}.`, {
        ask: {
          q: `Will ${name(e.b)} clash with the rest of the plan?`,
          options: q.options, answer: q.answer,
          why: rest.length
            ? `The rest start at ${rest[0][0]} or later. ${name(e.b)} ends at ${e.b[1]}, which is no later than ${x[1]}.`
            : 'The plan has no other meetings, so nothing can clash.',
        },
      });
      s.del('p0');
      t.bar('sw', e.b, 284, { tone: 'ok' });
      s.pulse('sw');
      s.set('msg', { text: 'Swapped. No clash.' });
      s.snap(`${name(e.b)} ends in time for the rest of the plan. Nothing clashes.`);

      const c = other.length;
      const q2 = pick(c, [c - 1 > 0 ? c - 1 : c + 2, c + 1], n + 2);
      s.snap('You took out 1 meeting and put in 1 meeting.', {
        ask: {
          q: 'How many meetings does the plan hold now?',
          options: q2.options, answer: q2.answer,
          why: `One out and one in leaves ${c}. The plan is as big as before.`,
        },
      });
      s.set('msg', { text: `Plan size: still ${c}` });
      s.snap(`The plan still holds ${c}. Taking the early bar never made it worse.`);

      bars.forEach((b, i) => { if (i !== e.i && clash(b, e.b)) ruleOut(s, 'b' + i); });
      s.set('msg', { text: 'Now repeat on what is left' });
      s.snap(`Cross out bars that clash with ${name(e.b)}. The same swap works on the rest.`);
    },
  });

  /* The heap moves below follow Python's heapq, so ends shows the same list Python has. */
  const heapPush = (h, v) => {
    h.push(v);
    let i = h.length - 1;
    while (i > 0) {
      const up = (i - 1) >> 1;
      if (h[up] <= h[i]) break;
      [h[up], h[i]] = [h[i], h[up]];
      i = up;
    }
  };
  const heapPop = h => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const a = 2 * i + 1, b = a + 1;
        let m = i;
        if (a < h.length && h[a] < h[m]) m = a;
        if (b < h.length && h[b] < h[m]) m = b;
        if (m === i) break;
        [h[m], h[i]] = [h[i], h[m]];
        i = m;
      }
    }
    return top;
  };

  Viz.register('m22-rooms', {
    title: 'How many rooms do you need?',
    size: [560, 292],
    code: py`
      import heapq

      def rooms_needed(meetings):
          ends = []
          for start, end in sorted(meetings):
              if len(ends) > 0 and ends[0] <= start:
                  heapq.heappop(ends)
              heapq.heappush(ends, end)
          return len(ends)
    `,
    inputs: [{ key: 'meetings', label: 'meetings (start-end)', type: 'text', value: '1-4 2-5 4-7 5-8 6-9', size: 22 }],
    tryInputs: [...BAR_TRIES, { meetings: '1-3 1-3 1-3 1-3 1-3 1-3' }, { meetings: '1-2 2-3 3-4' }],
    build(s, p) {
      const { bars, note } = readBars(p.meetings);
      const order = bars.slice().sort(byStart);
      const n = order.length;
      const t = timeline(s, 86, 288, { x0: 70, unit: 46, tickY: 72 });
      const lane = r => 104 + r * 32;
      s.text('expr', 280, 14, '', { size: 16, weight: 700 });
      s.text('ln', 6, 46, 'next', { size: 13, anchor: 'start', weight: 700 });
      const vars = (ends, steps) => ({ ends: show(ends), steps });
      if (note) s.snap(note, { line: 3, vars: vars([], 0) });
      if (!n) {
        s.snap('There are no meetings, so you need 0 rooms.', { line: 9, vars: vars([], 0), out: '0' });
        return;
      }
      const ends = [];
      const rooms = [];   // Each room remembers when it is free, in order to place the bars.
      let steps = 0;
      s.snap('The meetings come in order of start. Each one needs a room.', { line: 5, vars: vars(ends, steps) });
      const barAt = [];
      s.box('sw', t.tx(order[0][0]), 158, '', { w: 2, h: 256, tone: 'accent' });
      order.forEach((b, i) => {
        const [start, end] = b;
        steps += 1;
        s.set('sw', { x: t.tx(start) });
        t.bar('b' + i, b, 46, { tone: 'active' });
        barAt.forEach(a => { s.tone(a.id, a.end <= start ? 'muted' : 'default'); });
        const free = ends.length > 0 && ends[0] <= start;
        if (ends.length) {
          s.set('expr', { text: `soonest end ${ends[0]}, start ${start}` });
          s.snap(`${name(b)} is next. ends[0] says a room frees up at ${ends[0]}.`, {
            line: 6, vars: vars(ends, steps),
            ask: {
              q: `The soonest room frees at ${ends[0]}. This meeting starts at ${start}. What happens?`,
              options: ['Use that room again', 'Open a new room'],
              answer: free ? 0 : 1,
              why: free
                ? (ends[0] === start
                  ? `The room frees at ${start}, right when this one starts. Touching is fine.`
                  : `The room is already free by ${start}.`)
                : `Even the soonest room is busy until ${ends[0]}. So every room is busy.`,
            },
          });
        } else {
          s.set('expr', { text: 'no rooms yet' });
          s.snap(`${name(b)} is first. No room is open yet.`, { line: 6, vars: vars(ends, steps) });
        }
        let room;
        if (free) {
          heapPop(ends);
          room = rooms.findIndex(x => x === Math.min(...rooms));
          rooms[room] = end;
        } else {
          room = rooms.length;
          rooms.push(end);
          s.text('rl' + room, 6, lane(room), `Room ${room + 1}`, { size: 13, anchor: 'start' });
        }
        heapPush(ends, end);
        s.set('b' + i, { y: lane(room), tone: 'ok' });
        barAt.push({ id: 'b' + i, end });
        s.pulse('b' + i);
        s.set('expr', { text: `${rooms.length} ${rooms.length === 1 ? 'room' : 'rooms'} open` });
        s.snap(free ? `${name(b)} uses Room ${room + 1} again. The heap swaps the old end for ${end}.` : `${name(b)} opens Room ${room + 1}. The heap gets ${end}.`, {
          line: 8, vars: vars(ends, steps),
        });
      });
      s.del('sw');
      s.set('expr', { text: `You need ${rooms.length} ${rooms.length === 1 ? 'room' : 'rooms'}` });
      barAt.forEach(a => s.tone(a.id, 'default'));
      s.snap(`The heap holds one end time per room. So len(ends) is ${rooms.length}.`, { line: 9, vars: vars(ends, steps), out: String(rooms.length) });
    },
  });

  // ---------------------------------------------------------- lesson 22.3
  const readInts = (text, max = 6, hi = 9) =>
    (String(text == null ? '' : text).match(/-?\d+/g) || [])
      .slice(0, max)
      .map(x => Math.max(0, Math.min(hi, parseInt(x, 10))));

  Viz.register('m22-jump', {
    title: 'Keep track of how far you can reach',
    size: [560, 200],
    code: py`
      def can_cross(stones):
          reach = 0
          for i in range(len(stones)):
              if i > reach:
                  return False
              reach = max(reach, i + stones[i])
          return True
    `,
    inputs: [{ key: 'stones', label: 'stones (up to 6 numbers)', type: 'text', value: '2 1 3 0 1', size: 16 }],
    tryInputs: [
      { stones: '' }, { stones: '0' }, { stones: '0 1' }, { stones: '3 1 1 0 2' }, { stones: '1 1 1' },
      { stones: '5 0 0' }, { stones: 'cat' }, { stones: '9 9 9 9 9 9 9 9' }, { stones: '2 0 0' }, { stones: '1 0 2' },
    ],
    build(s, p) {
      const stones = readInts(p.stones);
      const n = stones.length;
      const o = { y: 100 };
      const X = i => s.slotX(i, n, o);
      s.row('n', stones, o);
      s.text('expr', 280, 18, '', { size: 16, weight: 700 });
      if (!n) {
        s.snap('There are no stones, so the loop never runs. The answer is True.', { line: 7, vars: { reach: 0 }, out: 'True' });
        return;
      }
      let reach = 0;
      const paint = () => { for (let k = 0; k < n; k++) s.tone('n' + k, k <= reach ? 'ok' : 'default'); };
      s.pointer('pi', X(0), 70, 'i', { dir: 'down' });
      s.pointer('pr', X(0), 152, 'reach', { dir: 'up' });
      paint();
      s.snap('You stand on stone 0. So reach starts at 0.', { line: 2, vars: { reach, i: 0 } });
      for (let i = 0; i < n; i++) {
        s.set('pi', { x: X(i) });
        const bad = i > reach;
        // The check is worth asking at the edge of reach, where you might be stuck.
        if (i > 0 && i >= reach) {
          s.set('expr', { text: `i is ${i}, reach is ${reach}` });
          s.snap(`i moves to stone ${i}. Is this stone inside your reach?`, {
            line: 4, vars: { reach, i },
            ask: {
              q: `i is ${i}, and reach is ${reach}. Can you stand on stone ${i}?`,
              options: ['Yes, keep walking', 'No. You are stuck'],
              answer: bad ? 1 : 0,
              why: bad
                ? `No stone so far can reach past ${reach}. So stone ${i} is out of range.`
                : `Every stone up to ${reach} can be reached. A long leap can also stop short.`,
            },
          });
          if (bad) {
            s.tone('n' + i, 'bad');
            s.set('expr', { text: `${i} > ${reach}: stuck` });
            s.snap(`Stone ${i} is past your reach. The answer is False.`, { line: 5, vars: { reach, i }, out: 'False' });
            return;
          }
        }
        const v = stones[i];
        const next = Math.max(reach, i + v);
        s.tone('n' + i, 'active');
        s.set('expr', { text: `${i} + ${v} = ${i + v}` });
        if (next === reach) {
          s.snap(`Stone ${i} gets you to ${i + v} at most. reach stays ${reach}.`, { line: 6, vars: { reach, i } });
          paint();
          continue;
        }
        const q = pick(next, [reach, next + 1], i + next);
        s.snap(`From stone ${i}, you can leap up to ${plural(v, 'stone')}.`, {
          line: 6, vars: { reach, i },
          ask: {
            q: `reach is ${reach}, and ${i} + ${v} is ${i + v}. What is reach now?`,
            options: q.options, answer: q.answer,
            why: `reach keeps the bigger number: max(${reach}, ${i + v}) is ${next}.`,
          },
        });
        reach = next;
        paint();
        s.set('pr', { x: X(Math.min(reach, n - 1)) });
        s.set('expr', { text: reach >= n - 1 ? `reach ${reach} covers the last stone` : `reach is ${reach}` });
        s.snap(`reach is now ${reach}.`, { line: 6, vars: { reach, i } });
      }
      s.del('pi');
      s.set('expr', { text: 'You got across' });
      s.snap(`The walk passed every stone. The answer is True.`, { line: 7, vars: { reach }, out: 'True' });
    },
  });

  Viz.register('m22-cookies', {
    title: 'Smallest cookie, smallest need',
    size: [560, 262],
    code: py`
      def fed_kids(kids, cookies):
          kids = sorted(kids)
          cookies = sorted(cookies)
          k = 0
          for cookie in cookies:
              if k < len(kids) and cookie >= kids[k]:
                  k = k + 1
          return k
    `,
    inputs: [
      { key: 'kids', label: 'kids need', type: 'text', value: '2 5 3 7', size: 12 },
      { key: 'cookies', label: 'cookie sizes', type: 'text', value: '3 1 6 4', size: 12 },
    ],
    tryInputs: [
      { kids: '', cookies: '' }, { kids: '', cookies: '1 2' }, { kids: '3', cookies: '' }, { kids: '5', cookies: '1' },
      { kids: '2 2 2', cookies: '2 2' }, { kids: 'cat', cookies: 'dog' }, { kids: '1 2 3 4 5 6 7 8', cookies: '9 9 9 9 9 9 9 9' },
      { kids: '1', cookies: '9 9' }, { kids: '9 9 9', cookies: '1 1 1' },
    ],
    build(s, p) {
      const kidsIn = readInts(p.kids), cooksIn = readInts(p.cookies);
      const kids = kidsIn.slice().sort((a, b) => a - b), cooks = cooksIn.slice().sort((a, b) => a - b);
      const oK = { y: 90, x: 310, index: false }, oC = { y: 190, x: 310, index: false };
      const XK = i => s.slotX(i, kids.length, oK), XC = i => s.slotX(i, cooks.length, oC);
      s.text('lk', 8, 90, 'kids', { size: 13, anchor: 'start', weight: 700 });
      s.text('lc', 8, 190, 'cookies', { size: 13, anchor: 'start', weight: 700 });
      s.row('k', kidsIn, oK);
      s.row('c', cooksIn, oC);
      s.text('expr', 280, 14, '', { size: 16, weight: 700 });
      const vars = (k, c) => ({ k, cookie: c == null ? 'none' : c });
      if (!kids.length || !cooks.length) {
        s.snap(!kids.length ? 'There are no kids to feed. The answer is 0.' : 'There are no cookies to give. The answer is 0.', { line: 8, vars: vars(0), out: '0' });
        return;
      }
      s.snap('Each kid needs a cookie at least that big. Each cookie feeds 1 kid.', {
        line: 2, vars: vars(0),
        ask: {
          q: 'What should you do first?',
          options: ['Sort both rows, smallest first', 'Give the biggest cookie to the first kid'],
          answer: 0,
          why: 'Small with small saves the big cookies for the kids who need them.',
        },
      });
      kids.forEach((v, i) => s.set('k' + i, { text: v }));
      cooks.forEach((v, i) => s.set('c' + i, { text: v }));
      s.snap('Both rows now run smallest first.', { line: 3, vars: vars(0) });

      let k = 0;
      s.pointer('pk', XK(0), 60, 'k', { dir: 'down' });
      s.pointer('pc', XC(0), 218, 'cookie', { dir: 'up' });
      cooks.forEach((v, i) => {
        s.set('pc', { x: XC(i) });
        s.tone('c' + i, 'active');
        if (k >= kids.length) {
          s.set('expr', { text: 'every kid is fed' });
          ruleOut(s, 'c' + i);
          s.snap(`Every kid is fed, so cookie ${v} stays spare.`, { line: 6, vars: vars(k, v) });
          return;
        }
        const need = kids[k];
        const fits = v >= need;
        s.set('pk', { x: XK(k) });
        s.tone('k' + k, 'active');
        s.set('expr', { text: `cookie ${v}, need ${need}` });
        s.snap(`Cookie ${v} meets the kid who needs ${need}.`, {
          line: 6, vars: vars(k, v),
          ask: {
            q: `Cookie ${v}. This kid needs ${need}. What happens?`,
            options: ['Give it to this kid', 'Throw this cookie out'],
            answer: fits ? 0 : 1,
            why: fits
              ? `${v} is big enough. Any bigger cookie stays for a hungrier kid.`
              : `${v} is too small for the smallest need left. So it fits nobody.`,
          },
        });
        if (fits) {
          s.tone(['k' + k, 'c' + i], 'ok');
          s.edge('e' + i, 'c' + i, 'k' + k, { arrow: false, tone: 'ok' });
          k += 1;
          if (k < kids.length) s.set('pk', { x: XK(k) });
          s.snap(`The kid gets cookie ${v}. Now ${plural(k, 'kid')} ${k === 1 ? 'is' : 'are'} fed.`, { line: 7, vars: vars(k, v) });
        } else {
          ruleOut(s, 'c' + i);
          s.tone('k' + k, 'default');
          s.snap(`Cookie ${v} fits no kid left, so you move past it.`, { line: 6, vars: vars(k, v) });
        }
      });
      s.del('pk', 'pc');
      s.set('expr', { text: `${plural(k, 'kid')} fed` });
      s.snap(`You fed ${plural(k, 'kid')}, with ${plural(cooks.length, 'look')} at the cookies.`, { line: 8, vars: { k }, out: String(k) });
    },
  });

  Viz.register('m22-gas', {
    title: 'Find the station to start from',
    size: [560, 226],
    code: py`
      def best_start(gas, cost):
          if sum(gas) < sum(cost):
              return None
          start = 0
          tank = 0
          for i in range(len(gas)):
              tank = tank + gas[i] - cost[i]
              if tank < 0:
                  start = i + 1
                  tank = 0
          return start
    `,
    inputs: [
      { key: 'gas', label: 'gas', type: 'text', value: '1 5 2 4', size: 12 },
      { key: 'cost', label: 'cost', type: 'text', value: '3 2 4 1', size: 12 },
    ],
    tryInputs: [
      { gas: '', cost: '' }, { gas: '3', cost: '3' }, { gas: '1', cost: '2' }, { gas: '2 2', cost: '3 3' },
      { gas: '0 0 9', cost: '3 3 3' }, { gas: 'cat', cost: 'dog' }, { gas: '1 2 3', cost: '1' },
      { gas: '9 9 9 9 9 9 9 9', cost: '1 1 1 1 1 1 1 1' }, { gas: '2 2 2', cost: '2 2 2' },
    ],
    build(s, p) {
      let gas = readInts(p.gas), cost = readInts(p.cost);
      const n = Math.min(gas.length, cost.length);
      const trimmed = gas.length !== cost.length;
      gas = gas.slice(0, n); cost = cost.slice(0, n);
      const oG = { y: 90, x: 290, index: false }, oC = { y: 148, x: 290, index: false };
      const X = i => s.slotX(i, n, oG);
      s.text('lg', 8, 90, 'gas', { size: 14, anchor: 'start', weight: 700 });
      s.text('lc', 8, 148, 'cost', { size: 14, anchor: 'start', weight: 700 });
      s.row('g', gas, oG);
      s.row('c', cost, oC);
      s.box('tank', 512, 90, 0, { w: 64, h: 40, sub: 'tank' });
      s.box('tot', 512, 168, sum0(gas) - sum0(cost), { w: 64, h: 40, sub: 'total' });
      s.text('expr', 280, 14, '', { size: 16, weight: 700 });
      const vars = (start, tank, i) => (i == null ? { start, tank } : { i, start, tank });
      if (trimmed) s.snap(`Each station needs a gas and a cost, so I used ${plural(n, 'station')}.`, { line: 1, vars: vars(0, 0) });
      if (!n) {
        s.snap('There are no stations, so the walk is over. The answer is 0.', { line: 11, vars: vars(0, 0), out: '0' });
        return;
      }
      const total = sum0(gas) - sum0(cost);
      s.set('expr', { text: `gas ${sum0(gas)}, cost ${sum0(cost)}` });
      s.snap(`The stations sit in a ring. After station ${n - 1}, you come back to 0.`, {
        line: 2, vars: vars(0, 0),
        ask: {
          q: `All the gas adds to ${sum0(gas)}. The whole trip costs ${sum0(cost)}. Can a trip work?`,
          options: ['Yes. Some start will work', 'No. No start can work'],
          answer: total >= 0 ? 0 : 1,
          why: total >= 0
            ? 'There is enough gas in all. The walk will find where to start.'
            : 'The whole loop needs more gas than exists, wherever you start.',
        },
      });
      if (total < 0) {
        s.tone('tot', 'bad');
        s.set('expr', { text: 'not enough gas in all' });
        s.snap('There is too little gas, so the answer is None.', { line: 3, vars: vars(0, 0), out: 'None' });
        return;
      }
      let start = 0, tank = 0;
      s.pointer('ps', X(0), 176, 'start', { dir: 'up' });
      s.pointer('pi', X(0), 60, 'i', { dir: 'down' });
      s.snap('You try starting at station 0, with an empty tank.', { line: 5, vars: vars(start, tank) });
      for (let i = 0; i < n; i++) {
        s.set('pi', { x: X(i) });
        const now = tank + gas[i] - cost[i];
        s.tone(['g' + i, 'c' + i], 'active');
        tank = now;
        s.set('tank', { text: tank, tone: tank < 0 ? 'bad' : 'default' });
        s.set('expr', { text: `tank + ${gas[i]} - ${cost[i]} = ${tank}` });
        const go = tank < 0;
        const q = {
          q: `The tank is ${tank}. What happens next?`,
          options: ['Keep going from here', `Try station ${i + 1} as the new start`],
          answer: go ? 1 : 0,
          why: go
            ? `Below 0 means you ran dry. Every station since ${start} fails too, so jump ahead.`
            : 'The tank is not below 0, so this start still looks good.',
        };
        s.snap(`At station ${i}, take ${gas[i]} and burn ${cost[i]}. The tank is ${tank}.`, {
          line: 7, vars: vars(start, tank, i), ask: i < n - 1 || go ? q : null,
        });
        s.tone(['g' + i, 'c' + i], 'default');
        if (go) {
          start = i + 1;
          tank = 0;
          for (let k = 0; k <= i; k++) { ruleOut(s, 'g' + k); ruleOut(s, 'c' + k); }
          s.set('tank', { text: 0, tone: 'default' });
          s.set('ps', { x: X(Math.min(start, n - 1)) });
          s.set('expr', { text: `new start: ${start}` });
          s.snap(`Start moves to station ${start}, and the tank is empty again.`, { line: 10, vars: vars(start, tank, i) });
        }
      }
      s.del('pi');
      s.tone(['g' + start, 'c' + start], 'ok');
      s.set('expr', { text: `Start at station ${start}` });
      s.snap(`The walk ends with the tank at ${tank}. Total gas covers the rest, so start ${start} works.`, { line: 11, vars: vars(start, tank), out: String(start) });
    },
  });

  function sum0(a) { return a.reduce((x, y) => x + y, 0); }
})();
