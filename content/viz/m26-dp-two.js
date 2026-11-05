/* Visuals for module 26: tables you fill by hand. Names start with the module id.
 * Each cell shows where its answer comes from: the cells it reads get a tone and
 * an arrow, and the panel names them. Every build must cope with empty input,
 * junk text and values that do not fit.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const whole = (v, lo, hi, d) => {
    const n = v === '' || v == null ? NaN : Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
  };
  const times = (n, one) => (n === 1 ? `1 ${one}` : `${n} ${one}s`);

  /* Options for an ask. Repeats are dropped, and the right one moves around. */
  const pick = (right, wrongs, seed = 0) => {
    const r = String(right);
    const rest = [...new Set(wrongs.map(String))].filter(x => x !== r);
    const at = Math.abs(seed) % (rest.length + 1);
    const options = rest.slice();
    options.splice(at, 0, r);
    return { options, answer: at };
  };

  /* A table of boxes. Ids come from id(r, c). Arrows go in the gaps between cells. */
  function tableKit(s, rows, cols, o) {
    const pitch = o.cell + o.gap;
    const X = c => o.x0 + c * pitch;
    const Y = r => o.y0 + r * pitch;
    const name = o.name || 't';
    const id = (r, c) => `${name}${r}_${c}`;
    const links = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        s.box(id(r, c), X(c), Y(r), '', { w: o.cell, h: o.cell, size: o.size || 17 });
      }
    }
    return {
      id, X, Y, rows, cols,
      link(from, to, tone = 'accent', bend = 0) {
        const key = `${name}-link${links.length}`;
        links.push(key);
        s.edge(key, from, to, { tone, bend });
      },
      clearLinks() {
        links.forEach(k => s.del(k));
        links.length = 0;
      },
    };
  }

  /* Lines of text beside or under a table. */
  function panelKit(s, x, y, count, o = {}) {
    const gap = o.gap || 24;
    const anchor = o.anchor || 'start';
    for (let i = 0; i < count; i += 1) {
      s.text(`panel${i}`, x, y + i * gap, '', { size: o.size || 14, anchor, mono: true, weight: i === o.bold ? 700 : 500 });
    }
    return lines => {
      for (let i = 0; i < count; i += 1) s.set(`panel${i}`, { text: lines[i] == null ? '' : lines[i] });
    };
  }

  /* "1 2 1 / 3 9 9" becomes rows of numbers. Short rows are cut to match, and junk is dropped. */
  function readGrid(text, maxRows, maxCols, top) {
    const rows = String(text == null ? '' : text).split('/')
      .map(part => (part.match(/\d+/g) || []).map(Number).map(v => Math.min(v, top)))
      .filter(r => r.length)
      .slice(0, maxRows);
    if (!rows.length) return [];
    const cols = Math.min(maxCols, ...rows.map(r => r.length));
    return rows.map(r => r.slice(0, cols));
  }

  /* "3:4, 2:3" becomes items named A, B, and so on. Anything else is skipped. */
  function readItems(text, limit) {
    const items = [];
    const re = /(\d+)\s*:\s*(\d+)/g;
    const src = String(text == null ? '' : text);
    let m;
    while ((m = re.exec(src)) && items.length < limit) {
      const weight = Number(m[1]), value = Number(m[2]);
      if (weight >= 1 && weight <= 9 && value <= 99) {
        items.push({ name: 'ABCD'[items.length], weight, value });
      }
    }
    return items;
  }

  /* Letters and digits only, and at most 5, so the table fits on a phone. */
  function readWord(text, limit = 5) {
    const clean = String(text == null ? '' : text).replace(/[^A-Za-z0-9]/g, '');
    return { word: clean.slice(0, limit), cut: clean.length > limit };
  }

  // ---------------------------------------------------------------- lesson 26.1
  Viz.register('m26-paths', {
    title: 'Count the paths: each cell adds above and left',
    size: [560, 310],
    code: py`
      ways = [[0] * cols for r in range(rows)]
      for r in range(rows):
          for c in range(cols):
              if (r, c) in walls:
                  ways[r][c] = 0
              elif r == 0 and c == 0:
                  ways[r][c] = 1
              else:
                  above = 0
                  left = 0
                  if r > 0:
                      above = ways[r - 1][c]
                  if c > 0:
                      left = ways[r][c - 1]
                  ways[r][c] = above + left
      print(ways[rows - 1][cols - 1])
    `,
    inputs: [
      { key: 'rows', label: 'Rows', type: 'number', value: 3, min: 1, max: 5 },
      { key: 'cols', label: 'Columns', type: 'number', value: 4, min: 1, max: 5 },
      { key: 'walls', label: 'Blocked cells, like 1,1 0,2', type: 'text', value: '', size: 14 },
    ],
    tryInputs: [
      { rows: 1, cols: 1, walls: '' }, { rows: 1, cols: 5, walls: '' }, { rows: 5, cols: 1, walls: '' },
      { rows: 5, cols: 5, walls: '' }, { rows: 3, cols: 3, walls: '1,1' }, { rows: 3, cols: 3, walls: '0,0' },
      { rows: 3, cols: 3, walls: '2,2' }, { rows: 2, cols: 2, walls: '0,1 1,0' }, { rows: 3, cols: 3, walls: 'cat, 9,9' },
      { rows: 1, cols: 3, walls: '0,1' }, { rows: '', cols: 'x', walls: null },
    ],
    build(s, p) {
      const rows = whole(p.rows, 1, 5, 3), cols = whole(p.cols, 1, 5, 4);
      const walls = new Set();
      const re = /(\d+)\s*,\s*(\d+)/g;
      const src = String(p.walls == null ? '' : p.walls);
      let m;
      while ((m = re.exec(src))) {
        if (Number(m[1]) < rows && Number(m[2]) < cols) walls.add(`${Number(m[1])},${Number(m[2])}`);
      }
      const shift = (5 - rows) * 28;
      const kit = tableKit(s, rows, cols, { x0: 58, y0: 54 + shift, cell: 40, gap: 16 });
      for (let c = 0; c < cols; c += 1) s.text(`top${c}`, kit.X(c), kit.Y(0) - 32, c, { size: 14, mono: true, tone: 'muted' });
      for (let r = 0; r < rows; r += 1) s.text(`side${r}`, 22, kit.Y(r), r, { size: 14, mono: true, tone: 'muted' });
      const panel = panelKit(s, 346, 96, 5, { bold: 0, gap: 25 });
      const ways = Array.from({ length: rows }, () => Array(cols).fill(0));
      walls.forEach(w => {
        const [r, c] = w.split(',').map(Number);
        s.set(kit.id(r, c), { text: 'X', tone: 'muted', scale: 0.86 });
      });
      let done = 0, asks = 0, inner = 0, pastWall = false;
      const size = rows * cols;
      panel(['cells done: 0', '', `Table: ${rows} by ${cols}`]);
      s.snap(`The robot starts top left. It moves only right or down.${walls.size ? ' X marks a blocked cell.' : ''}`, { line: 1 });

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const here = kit.id(r, c);
          done += 1;
          if (walls.has(`${r},${c}`)) {
            pastWall = true;
            panel([`cells done: ${done}`, '', `ways[${r}][${c}] stays 0`]);
            s.snap(`Cell ${r},${c} is blocked. No path can stand here, so ways is 0.`, { line: 5, vars: { r, c } });
            continue;
          }
          if (r === 0 && c === 0) {
            ways[0][0] = 1;
            s.set(here, { text: 1, tone: 'ok' });
            panel([`cells done: ${done}`, '', 'ways[0][0] = 1']);
            s.snap('Base case: there is 1 way to stand at the start.', { line: 7, vars: { r, c } });
            continue;
          }
          const above = r > 0 ? ways[r - 1][c] : 0;
          const left = c > 0 ? ways[r][c - 1] : 0;
          const sum = above + left;
          const lines = [
            `ways[${r}][${c}]`,
            r > 0 ? `above [${r - 1}][${c}]: ${above}` : 'above: none, so 0',
            c > 0 ? `left [${r}][${c - 1}]: ${left}` : 'left: none, so 0',
            `${above} + ${left} = ${sum}`,
            `cells done: ${done}`,
          ];
          s.tone(here, 'active');
          if (r > 0) { s.tone(kit.id(r - 1, c), 'accent'); kit.link(kit.id(r - 1, c), here); }
          if (c > 0) { s.tone(kit.id(r, c - 1), 'accent'); kit.link(kit.id(r, c - 1), here); }

          const isInner = r > 0 && c > 0;
          if (isInner) inner += 1;
          const firstEdge = done === 2;
          const wantAsk = asks < 6 && (firstEdge || (isInner && inner % 3 === 1) || (pastWall && (above === 0 || left === 0) && asks < 3));
          if (wantAsk) {
            asks += 1;
            pastWall = false;
            const c0 = pick(sum, [above, left, sum + 1, above * left], r + c + sum);
            s.set(here, { text: '?' });
            panel([lines[0], lines[1], lines[2], '', lines[4]]);
            s.snap(`Which number goes in cell ${r},${c}?`, {
              line: 15, vars: { r, c, above, left },
              ask: {
                q: `Above gives ${above}. Left gives ${left}. How many paths reach this cell?`,
                options: c0.options, answer: c0.answer,
                why: `Each path's last step comes from above or from the left, never both. So add: ${above} + ${left} = ${sum}.`,
              },
            });
          }
          ways[r][c] = sum;
          s.set(here, { text: sum });
          panel(lines);
          s.snap(`Cell ${r},${c} adds above and left: ${above} + ${left} = ${sum}.`, { line: 15, vars: { r, c, above, left } });
          kit.clearLinks();
          s.tone(here, 'default');
          if (r > 0) s.tone(kit.id(r - 1, c), walls.has(`${r - 1},${c}`) ? 'muted' : 'default');
          if (c > 0) s.tone(kit.id(r, c - 1), walls.has(`${r},${c - 1}`) ? 'muted' : 'default');
          if (ways[0][0] === 1) s.tone(kit.id(0, 0), 'ok');
        }
      }
      const answer = ways[rows - 1][cols - 1];
      if (!walls.has(`${rows - 1},${cols - 1}`)) s.tone(kit.id(rows - 1, cols - 1), 'ok');
      panel(['Answer', `${times(answer, 'path')}`, '', `${size} cells filled`, `${rows} x ${cols} = ${size}`]);
      s.snap(`The last cell holds ${times(answer, 'path')}. Filling took one step per cell, ${size} in all.`, { line: 16, out: String(answer) });
    },
  });

  Viz.register('m26-min-path', {
    title: 'The cheapest path: add this cell to the cheaper way in',
    size: [560, 306],
    code: py`
      best = [[0] * cols for r in range(rows)]
      for r in range(rows):
          for c in range(cols):
              if r == 0 and c == 0:
                  came = 0
              elif r == 0:
                  came = best[r][c - 1]
              elif c == 0:
                  came = best[r - 1][c]
              else:
                  up = best[r - 1][c]
                  lf = best[r][c - 1]
                  came = min(up, lf)
              best[r][c] = cost[r][c] + came
      print(best[rows - 1][cols - 1])
    `,
    inputs: [
      { key: 'grid', label: 'Costs, rows split by /', type: 'text', value: '1 2 1 / 3 9 9 / 1 1 1', size: 24 },
    ],
    tryInputs: [
      { grid: '' }, { grid: '7' }, { grid: '1 2 3 4 5 6' }, { grid: '1 / 2 / 3 / 4 / 5 / 6' }, { grid: '0 0 / 0 0' },
      { grid: 'cat / dog' }, { grid: '1 2 3 / 4 / 5 6' }, { grid: '99 99 99 99 / 99 99 99 99 / 99 99 99 99 / 99 99 99 99' },
      { grid: '1000 2000 / 3 4' }, { grid: null },
    ],
    build(s, p) {
      const cost = readGrid(p.grid, 4, 4, 99);
      const rows = cost.length, cols = rows ? cost[0].length : 0;
      if (!rows) {
        s.text('none', 280, 130, 'This grid is empty.', { size: 16, tone: 'muted' });
        s.snap('There are no cells, so there is no path to price. Type some numbers.');
        s.snap('Try 1 row, 1 column, or a grid of zeros next.');
        return;
      }
      const shift = (4 - rows) * 26;
      const left = tableKit(s, rows, cols, { name: 'g', x0: 54, y0: 62 + shift, cell: 40, gap: 12, size: 16 });
      const right = tableKit(s, rows, cols, { name: 'b', x0: 332, y0: 62 + shift, cell: 40, gap: 12, size: 16 });
      s.text('lblL', 54 - 20, left.Y(0) - 38, 'cost: price of a cell', { size: 14, anchor: 'start', weight: 700 });
      s.text('lblR', 332 - 20, right.Y(0) - 38, 'best: cheapest total', { size: 14, anchor: 'start', weight: 700 });
      cost.forEach((row, r) => row.forEach((v, c) => s.set(left.id(r, c), { text: v, tone: 'muted' })));
      const panel = panelKit(s, 280, 268, 2, { anchor: 'middle', gap: 22 });
      const best = Array.from({ length: rows }, () => Array(cols).fill(0));
      s.snap('Left: each cell has a price. Right: the cheapest total to reach each cell.', { line: 1 });

      let asks = 0, seen = 0;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const here = right.id(r, c);
          const price = cost[r][c];
          seen += 1;
          s.tone(here, 'active');
          s.tone(left.id(r, c), 'default');
          if (r === 0 && c === 0) {
            best[0][0] = price;
            s.set(here, { text: price });
            panel(['best[0][0] = cost[0][0]', `= ${price}`]);
            s.snap(`Base case: the robot must pay for the start, so ${price}.`, { line: 14, vars: { r, c } });
          } else {
            const hasUp = r > 0, hasLeft = c > 0;
            const up = hasUp ? best[r - 1][c] : null, lf = hasLeft ? best[r][c - 1] : null;
            if (hasUp) { s.tone(right.id(r - 1, c), 'accent'); right.link(right.id(r - 1, c), here); }
            if (hasLeft) { s.tone(right.id(r, c - 1), 'accent'); right.link(right.id(r, c - 1), here); }
            const from = hasUp && hasLeft ? Math.min(up, lf) : hasUp ? up : lf;
            const total = price + from;
            const reads = [hasUp ? `above best[${r - 1}][${c}] = ${up}` : '', hasLeft ? `left best[${r}][${c - 1}] = ${lf}` : ''].filter(Boolean).join(', ');
            const both = hasUp && hasLeft;
            const sumText = both ? `best[${r}][${c}] = ${price} + min(${up}, ${lf}) = ${total}` : `best[${r}][${c}] = ${price} + ${from} = ${total}`;
            if (asks < 5 && (both ? (asks < 1 || seen % 2 === 0) : asks === 0)) {
              asks += 1;
              const c0 = both
                ? pick(total, [price + Math.max(up, lf), price + up + lf, price], r + c + total)
                : pick(total, [price, from, total + 1], r + c + total);
              s.set(here, { text: '?' });
              panel([reads, '']);
              s.snap(`Cell ${r},${c} costs ${price}. What is the cheapest total to reach it?`, {
                line: both ? 13 : (r === 0 ? 7 : 9), vars: { r, c, price },
                ask: {
                  q: both ? `This cell costs ${price}. Coming in costs ${up} from above, or ${lf} from the left. What goes here?` : `This cell costs ${price}. The only way in costs ${from}. What goes here?`,
                  options: c0.options, answer: c0.answer,
                  why: both ? `Take the cheaper way in, then pay for this cell: ${price} + ${from} = ${total}.` : `There is one way in, so add its total to this price: ${from} + ${price} = ${total}.`,
                },
              });
            }
            best[r][c] = total;
            s.set(here, { text: total });
            panel([reads, sumText]);
            s.snap(both ? `The cheaper way in costs ${from}. Add the price ${price} to get ${total}.` : `Only one way in here, so ${from} + ${price} = ${total}.`, { line: 14, vars: { r, c, price } });
            right.clearLinks();
            if (hasUp) s.tone(right.id(r - 1, c), 'default');
            if (hasLeft) s.tone(right.id(r, c - 1), 'default');
          }
          s.tone(here, 'default');
          s.tone(left.id(r, c), 'muted');
        }
      }

      // Walk back from the end, always to the cheaper way in.
      const path = [];
      let r = rows - 1, c = cols - 1;
      while (r > 0 || c > 0) {
        path.push([r, c]);
        if (r === 0) c -= 1;
        else if (c === 0) r -= 1;
        else if (best[r - 1][c] <= best[r][c - 1]) r -= 1;
        else c -= 1;
      }
      path.push([0, 0]);
      const answer = best[rows - 1][cols - 1];
      s.tone(right.id(rows - 1, cols - 1), 'ok');
      panel([`Cheapest total: ${answer}`, '']);
      s.snap(`The last cell gives the answer: ${answer}.`, { line: 15, out: String(answer) });
      path.forEach(([a, b]) => {
        s.tone(right.id(a, b), 'ok');
        s.tone(left.id(a, b), 'ok');
      });
      const prices = path.slice().reverse().map(([a, b]) => cost[a][b]);
      panel([`Path: ${prices.join(' + ')} = ${answer}`, 'Walk back along the cheaper way in.']);
      s.snap('Walk back from the end, always to the cheaper way in. That shows the path.', { line: 15, out: String(answer) });
    },
  });

  // ---------------------------------------------------------------- lesson 26.2
  Viz.register('m26-knap-table', {
    title: 'Knapsack table: skip reads above, take reads above and left',
    size: [560, 362],
    code: py`
      n = len(items)
      best = [[0] * (cap + 1) for i in range(n + 1)]
      for i in range(1, n + 1):
          weight, value = items[i - 1]
          for c in range(cap + 1):
              best[i][c] = best[i - 1][c]
              if c >= weight:
                  room = c - weight
                  take = best[i - 1][room] + value
                  best[i][c] = max(best[i][c], take)
      print(best[n][cap])
    `,
    inputs: [
      { key: 'items', label: 'Items, weight:value', type: 'text', value: '3:4, 2:3, 2:3', size: 16 },
      { key: 'cap', label: 'Bag holds', type: 'number', value: 4, min: 1, max: 6 },
    ],
    tryInputs: [
      { items: '', cap: 4 }, { items: 'cat', cap: 3 }, { items: '9:9', cap: 2 }, { items: '1:1', cap: 1 },
      { items: '1:1, 1:1, 1:1, 1:1', cap: 6 }, { items: '1:99, 1:99, 1:99, 1:99', cap: 6 }, { items: '2:0, 3:0', cap: 5 },
      { items: '0:5, 20:3, 2:500', cap: 4 }, { items: '1:1, 2:2, 3:3, 4:4, 5:5, 6:6', cap: 6 }, { items: '7:7', cap: '' },
    ],
    build(s, p) {
      const items = readItems(p.items, 4);
      const cap = whole(p.cap, 1, 6, 4);
      const n = items.length;
      const blockTop = 46 + (4 - n) * 26;
      const kit = tableKit(s, n + 1, cap + 1, { x0: 108, y0: blockTop, cell: 40, gap: 12 });
      for (let c = 0; c <= cap; c += 1) s.text(`top${c}`, kit.X(c), kit.Y(0) - 32, c, { size: 14, mono: true, tone: 'muted' });
      s.text('topName', 18, kit.Y(0) - 32, 'bag', { size: 14, anchor: 'start', weight: 700 });
      s.text('side0', 18, kit.Y(0), 'none', { size: 14, mono: true, anchor: 'start', tone: 'muted' });
      items.forEach((it, i) => s.text(`side${i + 1}`, 18, kit.Y(i + 1), `${it.name} ${it.weight}:${it.value}`, { size: 14, mono: true, anchor: 'start' }));
      const panel = panelKit(s, 18, kit.Y(n) + 44, 3, { gap: 23 });
      const best = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(0));
      for (let c = 0; c <= cap; c += 1) s.set(kit.id(0, c), { text: 0, tone: 'muted' });
      if (!n) {
        s.snap('Base case: with no items, every bag holds value 0.', { line: 2, vars: { cap } });
        s.snap('You typed no items I can read. So the best value is 0. Try 2:3.', { line: 11, vars: { cap }, out: '0' });
        return;
      }
      s.snap('Base case: with no items, every bag holds value 0. The row is ready.', { line: 2, vars: { cap } });

      let asks = 0;
      for (let i = 1; i <= n; i += 1) {
        const { name, weight, value } = items[i - 1];
        s.tone(`side${i}`, 'accent');
        panel([`Item ${name}: weight ${weight}, value ${value}`]);
        const small = Math.min(weight - 1, cap);
        for (let c = 0; c <= small; c += 1) {
          best[i][c] = best[i - 1][c];
          s.set(kit.id(i, c), { text: best[i][c], tone: 'muted' });
        }
        panel([`Item ${name}: weight ${weight}, value ${value}`, small === 0 ? 'Bag 0 is too small.' : `Bags 0 to ${small} are too small.`, 'They copy the cell above.']);
        s.snap(`${name} weighs ${weight}, so it does not fit in ${small === 0 ? 'bag 0' : `bags 0 to ${small}`}. Those cells copy the row above.`, { line: 6, vars: { i, weight, value } });

        let firstTake = true;
        for (let c = weight; c <= cap; c += 1) {
          const here = kit.id(i, c);
          const skipId = kit.id(i - 1, c), takeId = kit.id(i - 1, c - weight);
          const skip = best[i - 1][c], take = best[i - 1][c - weight] + value;
          const win = Math.max(skip, take);
          s.tone(here, 'active');
          s.tone(skipId, 'warn');
          s.tone(takeId, 'accent');
          kit.link(skipId, here, 'active');
          kit.link(takeId, here, 'accent');
          const lines = [
            `Item ${name}, bag ${c}:`,
            `skip best[${i - 1}][${c}] = ${skip}`,
            `take best[${i - 1}][${c - weight}] + ${value} = ${take}`,
          ];
          const fight = skip > 0 && take > 0 && skip !== take;
          if (asks < 5 && (fight || (firstTake && i === 1))) {
            asks += 1;
            const c0 = pick(win, [Math.min(skip, take), skip + take, win + 1], i + c + win);
            s.set(here, { text: '?' });
            panel(lines);
            s.snap(`Bag ${c}: skip gives ${skip}, or take gives ${take}.`, {
              line: 10, vars: { i, c, skip, take },
              ask: {
                q: `Skip keeps ${skip}. Take gives ${take}. What goes in this cell?`,
                options: c0.options, answer: c0.answer,
                why: `You pick one choice, so you do not add them. The bigger one wins: ${win}.`,
              },
            });
          }
          firstTake = false;
          best[i][c] = win;
          s.set(here, { text: win });
          panel([lines[0], lines[1], lines[2]]);
          s.snap(take > skip ? `Taking ${name} wins: ${take} beats ${skip}.` : take === skip ? `A tie at ${win}. Either choice gives the same value.` : `Skipping ${name} wins: ${skip} beats ${take}.`, { line: 10, vars: { i, c, skip, take } });
          kit.clearLinks();
          s.tone(here, 'default');
          s.tone(skipId, i - 1 === 0 ? 'muted' : 'default');
          s.tone(takeId, i - 1 === 0 ? 'muted' : 'default');
        }
        s.tone(`side${i}`, 'default');
        for (let c = 0; c <= small; c += 1) s.tone(kit.id(i, c), 'default');
      }

      const answer = best[n][cap];
      s.tone(kit.id(n, cap), 'ok');
      panel([`Best value: ${answer}`, '', '']);
      s.snap(`The bottom right cell is the answer: value ${answer}.`, { line: 11, vars: { cap }, out: String(answer) });

      // Walk back up. A cell that differs from the one above must have taken its item.
      const taken = [];
      let c = cap;
      for (let i = n; i >= 1; i -= 1) {
        if (best[i][c] !== best[i - 1][c]) {
          s.tone(kit.id(i, c), 'ok');
          taken.unshift(items[i - 1].name);
          c -= items[i - 1].weight;
        }
      }
      panel([`Best value: ${answer}`, taken.length ? `Packed: ${taken.join(' + ')}` : 'Packed: nothing', 'A cell that beats the one above took its item.']);
      s.snap(`Walk back up: where a cell beats the one above, it took that item.`, { line: 11, vars: { cap }, out: String(answer) });
    },
  });

  Viz.register('m26-knap-row', {
    title: 'One row: the loop direction decides if an item repeats',
    size: [560, 286],
    code: py`
      best = [0] * (cap + 1)
      for weight, value in items:
          # Each item once: right to left
          for c in range(cap, weight - 1, -1):
          # Items can repeat: left to right
          # for c in range(weight, cap + 1):
              take = best[c - weight] + value
              best[c] = max(best[c], take)
      print(best[cap])
    `,
    inputs: [
      { key: 'dir', label: 'Loop runs', type: 'select', value: 'down', options: [{ label: 'right to left', value: 'down' }, { label: 'left to right', value: 'up' }] },
      { key: 'items', label: 'Items, weight:value', type: 'text', value: '2:3', size: 12 },
      { key: 'cap', label: 'Bag holds', type: 'number', value: 4, min: 1, max: 6 },
    ],
    tryInputs: [
      { dir: 'up', items: '2:3', cap: 4 }, { dir: 'down', items: '2:3', cap: 4 }, { dir: 'up', items: '', cap: 3 }, { dir: 'down', items: 'cat', cap: 3 },
      { dir: 'up', items: '1:1', cap: 6 }, { dir: 'down', items: '1:1', cap: 6 }, { dir: 'up', items: '9:9', cap: 2 }, { dir: 'down', items: '1:99, 1:99, 1:99', cap: 6 },
      { dir: 'up', items: '1:2, 2:5, 3:7', cap: 6 }, { dir: 'down', items: '2:3, 3:4', cap: 5 }, { dir: 'sideways', items: '2:3', cap: '' },
    ],
    build(s, p) {
      const up = p.dir === 'up';
      const items = readItems(p.items, 3);
      const cap = whole(p.cap, 1, 6, 4);
      const count = cap + 1;
      const o = { y: 106, cell: 52, gap: 14 };
      const X = i => s.slotX(i, count, o);
      const best = Array(count).fill(0);
      const uses = Array(count).fill('');
      for (let c = 0; c < count; c += 1) {
        s.box(`b${c}`, X(c), o.y, 0, { w: o.cell, h: o.cell });
        s.text(`idx${c}`, X(c), o.y + 40, c, { size: 14, mono: true, tone: 'muted' });
        s.text(`use${c}`, X(c), o.y + 62, '-', { size: 14, mono: true, weight: 700 });
      }
      s.text('dirNote', 280, 18, up ? 'Loop runs left to right  -->' : '<--  Loop runs right to left', { size: 15, weight: 700 });
      const panel = panelKit(s, 280, 228, 2, { anchor: 'middle', gap: 23 });
      panel(['Numbers under each bag: its size. Letters: what is in it.', '']);
      const loopLine = up ? 6 : 4;
      if (!items.length) {
        s.snap('Every bag starts with value 0.', { line: 1, vars: { cap } });
        panel(['No items to pack.', 'best[cap] stays 0.']);
        s.snap('I can read no items here, so nothing changes. Try 2:3.', { line: 9, vars: { cap }, out: '0' });
        return;
      }
      s.snap(`Each cell is the best value for that bag size. All start at 0.`, { line: 1, vars: { cap } });

      let asks = 0, repeated = null;
      items.forEach(item => {
        const { name, weight, value } = item;
        const seq = [];
        for (let c = weight; c <= cap; c += 1) seq.push(c);
        if (!up) seq.reverse();
        if (!seq.length) {
          panel([`${name} weighs ${weight}. No bag here can hold it.`, 'The loop makes no trips.']);
          s.snap(`${name} weighs ${weight}. It does not fit in any bag, so the loop makes no trips.`, { line: loopLine, vars: { weight, value } });
          return;
        }
        const wrote = new Set();
        let askedOld = false;
        seq.forEach((c, step) => {
          const from = c - weight;
          const skip = best[c], take = best[from] + value;
          s.tone(`b${c}`, 'active');
          s.tone(`b${from}`, 'accent');
          s.edge('arc', `b${from}`, `b${c}`, { tone: 'accent', bend: weight === 1 ? -44 : Math.max(-92, -68 - (weight - 2) * 12) });
          if (s.has('cPtr')) s.set('cPtr', { x: X(c) });
          else s.pointer('cPtr', X(c), o.y + 76, 'c', { dir: 'up' });
          panel([`${name}: bag ${c} reads bag ${from}`, `take = ${best[from]} + ${value} = ${take}, skip = ${skip}`]);
          let ask = null;
          const hasNew = wrote.has(from);
          if (!askedOld && (from >= weight) && asks < 4) {
            askedOld = true;
            asks += 1;
            ask = {
              q: `Bag ${c} reads bag ${from}. Has bag ${from} already used ${name} on this pass?`,
              options: ['Yes, it may hold it already', 'No, it is still the old value'],
              answer: hasNew ? 0 : 1,
              why: hasNew
                ? `Left to right wrote bag ${from} first. Reading it now can pack ${name} again.`
                : `Right to left has not reached bag ${from} yet. So it still holds the old value.`,
            };
          } else if (step === 0 && asks < 4) {
            asks += 1;
            const c0 = pick(Math.max(skip, take), [Math.min(skip, take) === Math.max(skip, take) ? take + 1 : Math.min(skip, take), skip + take], c + value);
            ask = {
              q: `Skip keeps ${skip}. Take gives ${take}. What does bag ${c} get?`,
              options: c0.options, answer: c0.answer,
              why: `max keeps the bigger one: ${Math.max(skip, take)}.`,
            };
          }
          s.snap(`c is ${c}. Bag ${c} reads bag ${from}, which holds ${best[from]}.`, { line: 7, vars: { weight, value, c, take }, ask });
          if (take > skip) {
            best[c] = take;
            uses[c] = uses[from] + name;
            wrote.add(c);
            s.set(`b${c}`, { text: take });
            s.set(`use${c}`, { text: uses[c] });
            const twice = uses[c].split('').filter(x => x === name).length;
            if (twice > 1) {
              if (!repeated) repeated = { c, name, twice };
              s.tone(`use${c}`, 'bad');
              s.pulse(`b${c}`);
              s.snap(`Look: bag ${c} now packs ${name} ${twice} times. It read a new value.`, { line: 8, vars: { weight, value, c, take } });
            } else {
              s.snap(`Taking wins, so bag ${c} becomes ${take}.`, { line: 8, vars: { weight, value, c, take } });
            }
          } else {
            s.snap(`Taking does not beat ${skip}, so bag ${c} stays.`, { line: 8, vars: { weight, value, c, take } });
          }
          s.del('arc');
          s.tone(`b${c}`, 'default');
          s.tone(`b${from}`, 'default');
        });
      });

      s.del('cPtr');
      panel(['Read the letters under each bag.', '']);
      s.snap('The loop is done. Check the letters under the bags.', {
        line: 8, vars: { cap },
        ask: {
          q: 'Did any bag pack the same item twice?',
          options: ['Yes', 'No'],
          answer: repeated ? 0 : 1,
          why: repeated ? `Bag ${repeated.c} packed ${repeated.name} ${repeated.twice} times, as it read a value that already held it.` : 'Each bag read a value that did not hold this item yet.',
        },
      });
      const answer = best[cap];
      s.tone(`b${cap}`, 'ok');
      if (repeated) {
        panel([`best[${cap}] = ${answer}. Some bags repeated an item.`, 'Right for endless items. Wrong for one of each.']);
        s.snap('Left to right lets an item repeat. Now switch the loop and compare.', { line: 9, vars: { cap }, out: String(answer) });
      } else if (up) {
        panel([`best[${cap}] = ${answer}.`, 'This run had no room to repeat an item.']);
        s.snap('No item repeated here, but left to right allows it. Try a bigger bag.', { line: 9, vars: { cap }, out: String(answer) });
      } else {
        panel([`best[${cap}] = ${answer}.`, 'Each item is used at most once.']);
        s.snap('Right to left always reads old values. So no item can repeat. Now switch the loop.', { line: 9, vars: { cap }, out: String(answer) });
      }
    },
  });

  // ---------------------------------------------------------------- shared by LCS and edit distance
  /* A table for 2 words. a runs down the side and b runs across the top. */
  function wordTable(s, a, b, name) {
    const n = a.length, m = b.length;
    const shift = (5 - n) * 22;
    const kit = tableKit(s, n + 1, m + 1, { name, x0: 80, y0: 62 + shift, cell: 34, gap: 14, size: 15 });
    const pad = kit.Y(0) - 52;
    for (let j = 0; j <= m; j += 1) {
      s.text(`topI${j}`, kit.X(j), pad, j, { size: 13, mono: true, tone: 'muted' });
      if (j) s.text(`topL${j}`, kit.X(j), pad + 22, b[j - 1], { size: 15, mono: true, weight: 700 });
    }
    for (let i = 0; i <= n; i += 1) {
      s.text(`sideI${i}`, 16, kit.Y(i), i, { size: 13, mono: true, tone: 'muted' });
      if (i) s.text(`sideL${i}`, 40, kit.Y(i), a[i - 1], { size: 15, mono: true, weight: 700 });
    }
    return kit;
  }
  const letterTones = (s, i, j, tone) => {
    if (s.has(`sideL${i}`)) s.tone(`sideL${i}`, tone);
    if (s.has(`topL${j}`)) s.tone(`topL${j}`, tone);
  };

  // ---------------------------------------------------------------- lesson 26.3
  Viz.register('m26-lcs', {
    title: 'LCS table: a match reads the diagonal',
    size: [560, 330],
    code: py`
      n = len(a)
      m = len(b)
      t = [[0] * (m + 1) for i in range(n + 1)]
      for i in range(1, n + 1):
          for j in range(1, m + 1):
              if a[i - 1] == b[j - 1]:
                  t[i][j] = t[i - 1][j - 1] + 1
              else:
                  up = t[i - 1][j]
                  left = t[i][j - 1]
                  t[i][j] = max(up, left)
      print(t[n][m])
    `,
    inputs: [
      { key: 'a', label: 'Word a (5 letters at most)', type: 'text', value: 'ANT', size: 8 },
      { key: 'b', label: 'Word b (5 letters at most)', type: 'text', value: 'TAN', size: 8 },
    ],
    tryInputs: [
      { a: '', b: '' }, { a: 'CAT', b: '' }, { a: '', b: 'CAT' }, { a: 'A', b: 'A' }, { a: 'A', b: 'B' },
      { a: 'ABCDE', b: 'ABCDE' }, { a: 'AAAAA', b: 'AAAAA' }, { a: 'ABCDE', b: 'FGHIJ' }, { a: 'a very long word', b: 'another long one' },
      { a: '!!!', b: '123' }, { a: 'cat', b: 'CAT' }, { a: null, b: null },
    ],
    build(s, p) {
      const ra = readWord(p.a), rb = readWord(p.b);
      const a = ra.word, b = rb.word;
      const n = a.length, m = b.length;
      const kit = wordTable(s, a, b, 'c');
      const panel = panelKit(s, 372, 100, 5, { bold: 0, gap: 25 });
      const cutNote = ra.cut || rb.cut ? ' Only the first 5 letters are used.' : '';
      const t = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
      for (let j = 0; j <= m; j += 1) s.set(kit.id(0, j), { text: 0, tone: 'muted' });
      for (let i = 0; i <= n; i += 1) s.set(kit.id(i, 0), { text: 0, tone: 'muted' });
      panel(['Row 0, column 0:', 'an empty word', 'shares nothing.']);
      if (!n || !m) {
        const c0 = pick(0, [Math.max(n, m), 1], n + m);
        s.snap(`One word is empty.${cutNote}`, {
          line: 3, vars: { n, m },
          ask: { q: 'One word has no letters. How long is the longest shared part?', options: c0.options, answer: c0.answer, why: 'An empty word has nothing to share. So the answer is 0.' },
        });
        s.snap('The table is only its base case, so the answer is 0.', { line: 12, vars: { n, m }, out: '0' });
        return;
      }
      s.snap(`Base case: an empty word shares 0 letters with anything.${cutNote}`, { line: 3, vars: { n, m } });

      const matched = new Set();
      const paint = () => {
        for (let i = 1; i <= n; i += 1) for (let j = 1; j <= m; j += 1) {
          s.tone(kit.id(i, j), matched.has(`${i},${j}`) ? 'ok' : 'default');
        }
      };
      let asks = 0, askedMatch = false, askedMiss = false, cells = 0;
      for (let i = 1; i <= n; i += 1) {
        for (let j = 1; j <= m; j += 1) {
          cells += 1;
          const la = a[i - 1], lb = b[j - 1];
          const same = la === lb;
          const here = kit.id(i, j);
          const diag = t[i - 1][j - 1], up = t[i - 1][j], lf = t[i][j - 1];
          letterTones(s, i, j, 'accent');
          s.tone(here, 'active');
          let val, lines, say;
          if (same) {
            val = diag + 1;
            s.tone(kit.id(i - 1, j - 1), 'accent');
            kit.link(kit.id(i - 1, j - 1), here);
            lines = [`${la} and ${lb}: match`, `diag t[${i - 1}][${j - 1}]: ${diag}`, `${diag} + 1 = ${val}`];
            say = `${la} and ${lb} match. Use both, so read the diagonal and add 1.`;
          } else {
            val = Math.max(up, lf);
            s.tone(kit.id(i - 1, j), 'accent');
            s.tone(kit.id(i, j - 1), 'accent');
            kit.link(kit.id(i - 1, j), here);
            kit.link(kit.id(i, j - 1), here);
            lines = [`${la} and ${lb}: differ`, `above t[${i - 1}][${j}]: ${up}`, `left t[${i}][${j - 1}]: ${lf}`, `max = ${val}`];
            say = `${la} and ${lb} differ. Drop one last letter, and keep the bigger answer.`;
          }
          const wantAsk = asks < 7 && (
            (same && !askedMatch) || (!same && !askedMiss) || cells % 5 === 0 || cells === n * m);
          if (wantAsk) {
            asks += 1;
            if (same) askedMatch = true; else askedMiss = true;
            const c0 = same
              ? pick(val, [diag, Math.max(up, lf) + 1, up + lf + 1], i + j + val)
              : pick(val, [up + lf, Math.min(up, lf) === val ? val + 1 : Math.min(up, lf), val + 1], i + j + val);
            s.set(here, { text: '?' });
            panel(same ? [lines[0], lines[1]] : [lines[0], lines[1], lines[2]]);
            s.snap(`Now compare ${la} and ${lb}.`, {
              line: same ? 7 : 11, vars: { i, j, 'a[i-1]': la, 'b[j-1]': lb },
              ask: {
                q: same ? `${la} and ${lb} match. The diagonal holds ${diag}. What goes here?` : `${la} and ${lb} differ. Above is ${up}, and left is ${lf}. What goes here?`,
                options: c0.options, answer: c0.answer,
                why: same ? `A match adds 1 to the answer without either letter: ${diag} + 1 = ${val}.` : `No match, so one last letter goes unused. Keep the better of the two: ${val}.`,
              },
            });
          }
          t[i][j] = val;
          s.set(here, { text: val });
          panel(lines);
          s.snap(say, { line: same ? 7 : 11, vars: { i, j, 'a[i-1]': la, 'b[j-1]': lb } });
          kit.clearLinks();
          if (same) matched.add(`${i},${j}`);
          letterTones(s, i, j, 'default');
          for (let x = 0; x <= n; x += 1) s.tone(kit.id(x, 0), 'muted');
          for (let y = 0; y <= m; y += 1) s.tone(kit.id(0, y), 'muted');
          paint();
        }
      }
      const answer = t[n][m];
      s.set(kit.id(n, m), { tone: 'ok' });
      panel([`Answer: ${answer}`, `${n} x ${m} = ${n * m} cells`, 'worked out.']);
      s.snap(`The last cell holds the answer: ${answer}. That took one step per cell.`, { line: 12, out: String(answer) });

      // Walk back to spell the shared letters.
      const word = [];
      let i = n, j = m;
      const trail = [];
      while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) { word.unshift(a[i - 1]); trail.push(kit.id(i, j)); i -= 1; j -= 1; }
        else if (t[i - 1][j] >= t[i][j - 1]) i -= 1;
        else j -= 1;
      }
      for (let x = 1; x <= n; x += 1) for (let y = 1; y <= m; y += 1) s.tone(kit.id(x, y), 'default');
      trail.forEach(id => s.set(id, { tone: 'ok', scale: 1.1 }));
      panel([`Answer: ${answer}`, word.length ? `Shared: ${word.join('')}` : 'Nothing shared.', 'The bigger cells are', 'the matches it used.']);
      s.snap(word.length ? `Walk back from the end. The matches spell ${word.join('')}.` : 'No letters match, so nothing is shared.', { line: 12, out: String(answer) });
    },
  });

  // ---------------------------------------------------------------- lesson 26.4
  Viz.register('m26-edit', {
    title: 'Edit distance: the fewest changes, cell by cell',
    size: [560, 330],
    code: py`
      n = len(a)
      m = len(b)
      d = [[0] * (m + 1) for i in range(n + 1)]
      for i in range(n + 1):
          d[i][0] = i
      for j in range(m + 1):
          d[0][j] = j
      for i in range(1, n + 1):
          for j in range(1, m + 1):
              if a[i - 1] == b[j - 1]:
                  d[i][j] = d[i - 1][j - 1]
              else:
                  remove = d[i - 1][j]
                  add = d[i][j - 1]
                  swap = d[i - 1][j - 1]
                  low = min(remove, add, swap)
                  d[i][j] = 1 + low
      print(d[n][m])
    `,
    inputs: [
      { key: 'a', label: 'From word (5 letters at most)', type: 'text', value: 'SUN', size: 8 },
      { key: 'b', label: 'To word (5 letters at most)', type: 'text', value: 'SING', size: 8 },
    ],
    tryInputs: [
      { a: '', b: '' }, { a: 'CAT', b: '' }, { a: '', b: 'CAT' }, { a: 'A', b: 'A' }, { a: 'A', b: 'B' },
      { a: 'ABCDE', b: 'ABCDE' }, { a: 'ABCDE', b: 'FGHIJ' }, { a: 'AAAAA', b: 'A' }, { a: 'a very long word', b: 'another long one' },
      { a: '!!!', b: '123' }, { a: 'cat', b: 'CAT' }, { a: null, b: null },
    ],
    build(s, p) {
      const ra = readWord(p.a), rb = readWord(p.b);
      const a = ra.word, b = rb.word;
      const n = a.length, m = b.length;
      const kit = wordTable(s, a, b, 'c');
      const panel = panelKit(s, 372, 92, 6, { bold: 0, gap: 25 });
      const cutNote = ra.cut || rb.cut ? ' Only the first 5 letters are used.' : '';
      const d = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
      panel(['Make the left word', 'into the top word.']);
      s.snap(`Each cell holds the fewest edits between the starts of the 2 words.${cutNote}`, { line: 3, vars: { n, m } });

      if (m > 0) {
        for (let j = 0; j <= m; j += 1) { d[0][j] = j; s.set(kit.id(0, j), { text: j, tone: 'muted' }); }
      } else s.set(kit.id(0, 0), { text: 0, tone: 'muted' });
      const c1 = pick(m, [0, m + 1], m);
      panel(['Top row: from an', 'empty word, add', 'every letter.']);
      s.snap(`The top row starts from no letters, so each letter needs one add.`, {
        line: 7, vars: { n, m },
        ask: m > 0 ? { q: `Start from an empty word. How many edits make "${b}"?`, options: c1.options, answer: c1.answer, why: `Add each letter once. "${b}" has ${times(m, 'letter')}, so ${m}.` } : null,
      });
      for (let i = 0; i <= n; i += 1) { d[i][0] = i; s.set(kit.id(i, 0), { text: i, tone: 'muted' }); }
      panel(['Left column: to an', 'empty word, remove', 'every letter.']);
      s.snap('The left column ends with no letters, so each letter needs one remove.', { line: 5, vars: { n, m } });

      if (!n || !m) {
        const answer = Math.max(n, m);
        s.tone(kit.id(n, m), 'ok');
        panel([`Answer: ${answer}`, 'One word is empty,', 'so the base case', 'is the answer.']);
        s.snap(`One word is empty, so the base case gives ${answer}.`, { line: 18, vars: { n, m }, out: String(answer) });
        return;
      }

      let asks = 0, askedSame = false, askedDiff = false, cells = 0;
      for (let i = 1; i <= n; i += 1) {
        for (let j = 1; j <= m; j += 1) {
          cells += 1;
          const la = a[i - 1], lb = b[j - 1];
          const same = la === lb;
          const here = kit.id(i, j);
          const diag = d[i - 1][j - 1], up = d[i - 1][j], lf = d[i][j - 1];
          letterTones(s, i, j, 'accent');
          s.tone(here, 'active');
          let val, lines, say;
          if (same) {
            val = diag;
            s.tone(kit.id(i - 1, j - 1), 'accent');
            kit.link(kit.id(i - 1, j - 1), here);
            lines = [`${la} and ${lb}: same`, `diag d[${i - 1}][${j - 1}]: ${diag}`, `no edit, so ${val}`];
            say = `${la} and ${lb} are the same. No edit is needed, so copy the diagonal.`;
          } else {
            const low = Math.min(up, lf, diag);
            val = 1 + low;
            s.tone([kit.id(i - 1, j), kit.id(i, j - 1), kit.id(i - 1, j - 1)], 'accent');
            kit.link(kit.id(i - 1, j), here);
            kit.link(kit.id(i, j - 1), here);
            kit.link(kit.id(i - 1, j - 1), here);
            lines = [`${la} and ${lb}: differ`, `remove d[${i - 1}][${j}]: ${up}`, `add d[${i}][${j - 1}]: ${lf}`, `swap d[${i - 1}][${j - 1}]: ${diag}`, `1 + ${low} = ${val}`];
            say = `${la} and ${lb} differ. Pay 1 edit, plus the smallest of the 3 cells.`;
          }
          const wantAsk = asks < 5 && ((same && !askedSame) || (!same && !askedDiff) || cells % 6 === 0 || cells === n * m);
          if (wantAsk) {
            asks += 1;
            if (same) askedSame = true; else askedDiff = true;
            const low = Math.min(up, lf, diag);
            const c0 = same
              ? pick(val, [diag + 1, low + 1, up], i + j + val)
              : pick(val, [low, up + lf + diag, Math.max(up, lf, diag) + 1], i + j + val);
            s.set(here, { text: '?' });
            panel(same ? [lines[0], lines[1]] : lines.slice(0, 4));
            s.snap(`Now compare ${la} and ${lb}.`, {
              line: same ? 11 : 17, vars: { i, j, 'a[i-1]': la, 'b[j-1]': lb },
              ask: {
                q: same ? `${la} and ${lb} are the same. The diagonal holds ${diag}. What goes here?` : `${la} and ${lb} differ. The cells hold ${up}, ${lf} and ${diag}. What goes here?`,
                options: c0.options, answer: c0.answer,
                why: same ? `Same letters cost nothing, so copy the diagonal: ${val}.` : `Take the smallest, ${low}, then pay 1 for this edit: ${val}.`,
              },
            });
          }
          d[i][j] = val;
          s.set(here, { text: val });
          panel(lines);
          s.snap(say, { line: same ? 11 : 17, vars: { i, j, 'a[i-1]': la, 'b[j-1]': lb } });
          kit.clearLinks();
          letterTones(s, i, j, 'default');
          for (let x = 1; x <= n; x += 1) for (let y = 1; y <= m; y += 1) s.tone(kit.id(x, y), 'default');
          for (let x = 0; x <= n; x += 1) s.tone(kit.id(x, 0), 'muted');
          for (let y = 0; y <= m; y += 1) s.tone(kit.id(0, y), 'muted');
        }
      }
      const answer = d[n][m];
      s.tone(kit.id(n, m), 'ok');
      panel([`Answer: ${answer}`, `${n} x ${m} = ${n * m} cells`, 'worked out.']);
      s.snap(`The last cell holds the answer: ${times(answer, 'edit')}.`, { line: 18, out: String(answer) });

      // Walk back to list the edits.
      const edits = [];
      let i = n, j = m;
      s.tone(kit.id(n, m), 'ok');
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) {
          i -= 1; j -= 1;
        } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
          edits.unshift(`swap ${a[i - 1]} to ${b[j - 1]}`); i -= 1; j -= 1;
        } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
          edits.unshift(`add ${b[j - 1]}`); j -= 1;
        } else {
          edits.unshift(`remove ${a[i - 1]}`); i -= 1;
        }
        s.tone(kit.id(i, j), 'ok');
      }
      panel(edits.length ? ['The edits:'].concat(edits) : ['No edits needed.', 'The words match.']);
      s.snap(edits.length ? `Walk back from the end. The marked cells give ${times(edits.length, 'edit')}.` : 'The words are the same, so no edits are needed.', { line: 18, out: String(answer) });
    },
  });

  // ---------------------------------------------------------------- lesson 26.5 (bonus)
  Viz.register('m26-rolling', {
    title: 'One row does the work of a whole table',
    size: [560, 250],
    code: py`
      row = [1] * cols
      for r in range(1, rows):
          for c in range(1, cols):
              row[c] = row[c] + row[c - 1]
      print(row[cols - 1])
    `,
    inputs: [
      { key: 'rows', label: 'Rows', type: 'number', value: 3, min: 1, max: 5 },
      { key: 'cols', label: 'Columns', type: 'number', value: 4, min: 1, max: 5 },
    ],
    tryInputs: [{ rows: 1, cols: 1 }, { rows: 1, cols: 5 }, { rows: 5, cols: 1 }, { rows: 5, cols: 5 }, { rows: 2, cols: 2 }, { rows: '', cols: 'x' }],
    build(s, p) {
      const rows = whole(p.rows, 1, 5, 3), cols = whole(p.cols, 1, 5, 4);
      const o = { cell: 52, gap: 14 };
      const X = c => s.slotX(c, cols, o);
      const row = Array(cols).fill(1);
      s.text('oldLbl', 16, 48, 'old', { size: 14, anchor: 'start', weight: 700, tone: 'muted' });
      s.text('newLbl', 16, 124, 'row', { size: 14, anchor: 'start', weight: 700 });
      for (let c = 0; c < cols; c += 1) {
        s.box(`o${c}`, X(c), 48, '', { w: 40, h: 40, size: 15, tone: 'muted', scale: 0.9 });
        s.box(`n${c}`, X(c), 124, 1, { w: 52, h: 52 });
        s.text(`i${c}`, X(c), 164, c, { size: 14, mono: true, tone: 'muted' });
      }
      const panel = panelKit(s, 280, 194, 2, { anchor: 'middle', gap: 23 });
      const kept = `This list keeps ${cols} cells, not ${rows * cols}.`;
      panel(['Row 0 is all 1s: one way along the top.', kept]);
      s.snap('Keep one list. It starts as the top row of the table.', { line: 1, vars: { rows, cols } });
      if (rows === 1 || cols === 1) {
        s.tone(`n${cols - 1}`, 'ok');
        panel([rows === 1 ? 'Only 1 row, so the loop makes no trips.' : 'Only 1 column, so the inner loop makes no trips.', kept]);
        s.snap('The loops have no work to do. There is 1 path.', { line: 5, vars: { rows, cols }, out: '1' });
        return;
      }
      let asks = 0;
      for (let r = 1; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) s.set(`o${c}`, { text: row[c] });
        panel([`Now row ${r}. The old row is shown on top.`, kept]);
        s.snap(`Row ${r} starts. The list still holds row ${r - 1}. Spot 0 stays 1.`, { line: 2, vars: { r } });
        for (let c = 1; c < cols; c += 1) {
          const old = row[c], left = row[c - 1], val = old + left;
          s.tone(`n${c}`, 'active');
          s.tone(`o${c}`, 'accent');
          s.tone(`n${c - 1}`, 'accent');
          panel([`row[${c}] is still old: above = ${old}`, `row[${c - 1}] is new: left = ${left}`]);
          let ask = null;
          if (asks === 0) {
            asks += 1;
            ask = {
              q: `Before this write, what does row[${c}] mean?`,
              options: ['The cell above: it is still the old value', 'The cell to the left', 'Nothing yet: it is empty'],
              answer: 0,
              why: 'Nothing has written this spot on this pass. So it still holds the value from the row above.',
            };
          } else if (asks < 5 && c === cols - 1) {
            asks += 1;
            const c0 = pick(val, [old, left, val + 1], r + c + val);
            ask = {
              q: `Above is ${old}, and left is ${left}. What does row[${c}] become?`,
              options: c0.options, answer: c0.answer,
              why: `It is the same rule as the table: above + left = ${val}.`,
            };
          }
          if (ask) s.snap(`Read row[${c}] and row[${c - 1}]. One is old, and one is new.`, { line: 4, vars: { r, c }, ask });
          row[c] = val;
          s.set(`n${c}`, { text: val });
          s.snap(`Spot ${c} reads old ${old} and new ${left}. Write ${val} over the old value.`, { line: 4, vars: { r, c } });
          s.tone(`n${c}`, 'default');
          s.tone(`o${c}`, 'muted');
          s.tone(`n${c - 1}`, 'default');
        }
      }
      s.tone(`n${cols - 1}`, 'ok');
      panel([`Answer: ${row[cols - 1]}, the same as the full table.`, kept]);
      s.snap(`The same answer, from a much smaller list: ${row[cols - 1]}.`, { line: 5, vars: { rows, cols }, out: String(row[cols - 1]) });
    },
  });

  Viz.register('m26-subset', {
    title: 'Subset-sum: which totals can you reach?',
    size: [560, 250],
    code: py`
      can = [False] * (target + 1)
      can[0] = True
      for n in nums:
          for c in range(target, n - 1, -1):
              if can[c - n]:
                  can[c] = True
      print(can[target])
    `,
    inputs: [
      { key: 'nums', label: 'Numbers', type: 'text', value: '3, 5, 2', size: 12 },
      { key: 'target', label: 'Target', type: 'number', value: 7, min: 0, max: 9 },
    ],
    tryInputs: [
      { nums: '', target: 5 }, { nums: 'cat', target: 2 }, { nums: '4', target: 0 }, { nums: '9, 9', target: 3 }, { nums: '2', target: 4 },
      { nums: '2, 2', target: 4 }, { nums: '1, 1, 1, 1, 1, 1', target: 9 }, { nums: '1, 2, 3, 4', target: 9 }, { nums: '0, 0', target: 1 }, { nums: '100, 3', target: '' },
    ],
    build(s, p) {
      const raw = String(p.nums == null ? '' : p.nums).match(/\d+/g) || [];
      const nums = raw.map(Number).filter(v => v >= 1 && v <= 9).slice(0, 4);
      const dropped = raw.length !== nums.length;
      const target = whole(p.target, 0, 9, 7);
      const count = target + 1;
      const o = { y: 96, cell: 44, gap: 8 };
      const X = i => s.slotX(i, count, o);
      const can = Array(count).fill(false);
      const group = Array(count).fill(null);
      can[0] = true;
      group[0] = [];
      for (let c = 0; c < count; c += 1) {
        s.box(`b${c}`, X(c), o.y, c === 0 ? 'T' : 'F', { w: o.cell, h: o.cell, size: 17, tone: c === 0 ? 'ok' : 'muted', scale: c === 0 ? 1 : 0.86 });
        s.text(`i${c}`, X(c), o.y + 38, c, { size: 14, mono: true, tone: 'muted' });
      }
      s.text('now', 20, 22, '', { size: 15, anchor: 'start', weight: 700 });
      const panel = panelKit(s, 280, 176, 3, { anchor: 'middle', gap: 23 });
      panel(['T means True: some of the numbers add up to this total.', 'F means False: not yet.']);
      s.snap(`Base case: picking nothing makes total 0. So can[0] is True.${dropped ? ' Some of what you typed was skipped.' : ''}`, { line: 2, vars: { target } });

      let asks = 0;
      nums.forEach((n, nIndex) => {
        s.set('now', { text: `Number ${n}` });
        if (n > target) {
          panel([`${n} is bigger than the target.`, 'The loop makes no trips.']);
          s.snap(`${n} is bigger than the target, so it cannot help.`, { line: 3, vars: { n } });
          return;
        }
        const fresh = [];
        for (let c = target; c >= n; c -= 1) if (can[c - n] && !can[c]) fresh.push(c);
        panel([`Add ${n} to each total you already have.`, 'Go right to left, so old values are read.']);
        let ask = null;
        if (asks < 5) {
          asks += 1;
          const reach = fresh.length;
          const c0 = pick(reach, [reach + 1, Math.max(0, reach - 1), count], n + reach);
          ask = {
            q: `How many new totals does ${n} add, counting only those up to ${target}?`,
            options: c0.options, answer: c0.answer,
            why: reach ? `Adding ${n} to old True spots gives new totals: ${fresh.slice().reverse().join(', ')}.` : `Every total that ${n} can make is already True, or past the target.`,
          };
        }
        s.snap(`Next number: ${n}. Each True spot may reach a new total.`, { line: 3, vars: { n }, ask });
        fresh.forEach(c => {
          const from = c - n;
          s.tone(`b${from}`, 'accent');
          s.set(`b${c}`, { tone: 'active' });
          s.edge('arc', `b${from}`, `b${c}`, { tone: 'accent', bend: n === 1 ? -40 : Math.max(-84, -60 - (n - 2) * 8) });
          panel([`can[${from}] is True, so ${from} + ${n} = ${c} works.`, `can[${c}] becomes True.`]);
          can[c] = true;
          group[c] = group[from].concat(n);
          s.set(`b${c}`, { text: 'T', scale: 1 });
          s.snap(`can[${from}] is True, so ${from} + ${n} makes ${c}.`, { line: 6, vars: { n, c } });
          s.del('arc');
          s.tone(`b${from}`, 'ok');
          s.tone(`b${c}`, 'ok');
        });
        if (!fresh.length) {
          panel([`${n} adds no new totals here.`, '']);
          s.snap(`${n} adds nothing new.`, { line: 4, vars: { n } });
        }
        if (nIndex === 0 && n * 2 <= target && asks < 5) {
          asks += 1;
          s.tone(`b${n}`, 'active');
          panel([`Total ${n} is True now. Total ${n * 2} is still ${can[n * 2] ? 'True' : 'False'}.`, `Going left to right would read can[${n}] again.`]);
          s.snap(`Why did can[${n * 2}] not use ${n} twice?`, {
            line: 4, vars: { n },
            ask: {
              q: `Suppose the loop ran left to right. What would can[${n * 2}] do?`,
              options: [`Read the new can[${n}], and use ${n} twice`, 'Stay the same as now', 'Crash with an error'],
              answer: 0,
              why: `can[${n}] would already be True. So can[${n * 2}] would turn True, though you have only one ${n}.`,
            },
          });
          s.tone(`b${n}`, 'ok');
        }
      });

      s.set('now', { text: nums.length ? 'Done' : 'No numbers' });
      const answer = can[target];
      s.set(`b${target}`, { scale: 1.12, tone: answer ? 'ok' : 'bad' });
      const made = answer ? (group[target].length ? group[target].join(' + ') : 'nothing at all') : '';
      panel([`can[${target}] is ${answer ? 'True' : 'False'}.`, answer ? `One group: ${made}.` : `No group adds up to ${target}.`]);
      s.snap(answer ? `Yes. You can make ${target} with ${made}.` : `No. No group of these numbers adds up to ${target}.`, { line: 7, vars: { target }, out: answer ? 'True' : 'False' });
    },
  });
})();
