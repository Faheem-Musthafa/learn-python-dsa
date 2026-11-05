/* Visuals for module 3. Names start with the module id. */
(function () {
  // ---------------------------------------------------------- lesson 3.1
  Viz.register('m03-while-stairs', {
    title: 'A while loop asks at the top of every trip',
    size: [520, 270],
    code: py`
      n = 1
      while n <= limit:
          print(n)
          n = n + 1
      print("Done")
    `,
    inputs: [
      { key: 'limit', label: 'limit', type: 'number', value: 3, min: 1, max: 5 },
    ],
    build(s, p) {
      const limit = Math.max(1, Math.min(5, Math.floor(Number(p.limit)) || 3));
      const X = i => 62 + (i - 1) * 72;
      const Y = i => 238 - (i - 1) * 26;
      const tipY = i => Y(i) - 18;
      for (let i = 1; i <= limit; i++) s.box(`st${i}`, X(i), Y(i), i, { w: 62, h: 32, tone: 'muted' });
      s.box('top', X(limit + 1), Y(limit + 1), 'Stop', { w: 62, h: 32, tone: 'muted' });
      s.box('q', 260, 34, 'Is n <= limit?', { w: 260, h: 44, size: 18 });
      s.pointer('ptr', X(1), tipY(1), 'n', { dir: 'down' });

      let out = '';
      s.snap('n starts at 1, on the first stair.', { line: 1, vars: { n: 1, limit }, out });

      for (let n = 1; n <= limit; n++) {
        s.set('q', { text: `Is ${n} <= ${limit}?`, tone: 'active' });
        let ask = null;
        if (n === 1) {
          ask = {
            q: `Python asks: is 1 <= ${limit}? What happens next?`,
            options: ['It runs the indented lines', 'It jumps to print("Done")'],
            answer: 0,
            why: 'The answer is True, so the trip goes ahead.',
          };
        } else if (n === limit || n === 3) {
          ask = {
            q: `Is ${n} <= ${limit} True or False?`,
            options: ['True', 'False'],
            answer: 0,
            why: n === limit ? `<= means less than or equal. ${n} equals ${limit}, so it is True.` : `${n} is less than ${limit}, so it is True.`,
          };
        }
        s.snap(`Python asks the question: is ${n} <= ${limit}?`, { line: 2, vars: { n, limit }, out, ask });

        s.set('q', { text: `Is ${n} <= ${limit}? Yes`, tone: 'ok' });
        s.snap('The answer is True, so this trip goes ahead.', { line: 2, vars: { n, limit }, out });

        s.tone(`st${n}`, 'ok');
        out += (out ? '\n' : '') + n;
        s.snap(`print shows ${n} on the screen.`, { line: 3, vars: { n, limit }, out });

        s.tone('q', 'default');
        const next = n + 1;
        s.set('ptr', { x: X(next), y: tipY(next) });
        s.snap(`n grows to ${next}. This moves us closer to the stop.`, {
          line: 4,
          vars: { n: next, limit },
          out,
          ask: n === 1 ? {
            q: 'The trip is over. Which line runs next?',
            options: ['Line 2, to ask again', 'Line 5, print("Done")', 'Line 3, to print again'],
            answer: 0,
            why: 'Python goes back to the while line. It asks again on every trip.',
          } : null,
        });
      }

      const end = limit + 1;
      s.set('q', { text: `Is ${end} <= ${limit}?`, tone: 'active' });
      s.snap(`Python asks again: is ${end} <= ${limit}?`, {
        line: 2,
        vars: { n: end, limit },
        out,
        ask: {
          q: `${end} is bigger than ${limit}. What happens now?`,
          options: ['It runs the indented lines again', 'It leaves the loop'],
          answer: 1,
          why: 'The answer is False, so the loop is over.',
        },
      });
      s.set('q', { text: `Is ${end} <= ${limit}? No`, tone: 'bad' });
      s.snap('The answer is False, so the loop ends.', { line: 2, vars: { n: end, limit }, out });
      s.tone('top', 'ok');
      out += '\nDone';
      s.snap('Python moves to the first line after the loop.', { line: 5, vars: { n: end, limit }, out });
    },
  });

  // ---------------------------------------------------------- lesson 3.2
  Viz.register('m03-range-line', {
    title: 'range counts from 0 and stops before the stop number',
    size: [520, 210],
    code: py`
      for i in range(stop):
          print(i)
      print("Done")
    `,
    inputs: [
      { key: 'stop', label: 'stop', type: 'number', value: 5, min: 1, max: 6 },
    ],
    build(s, p) {
      const stop = Math.max(1, Math.min(6, Math.floor(Number(p.stop)) || 5));
      const opt = { cell: 54, gap: 8, y: 70, index: false, x: 260 };
      const vals = [];
      for (let i = 0; i <= stop; i++) vals.push(i);
      s.row('c', vals, opt);
      s.tone(`c${stop}`, 'muted');
      s.text('stoplabel', s.slotX(stop, stop + 1, opt), 28, 'stop', { size: 15, weight: 600 });
      s.text('notin', s.slotX(stop, stop + 1, opt), 112, 'not given', { size: 13, tone: 'muted' });
      s.text('sum', 260, 188, '', { size: 16, weight: 600 });

      const vars = i => (i == null ? { stop } : { i, stop });
      let out = '';
      s.snap(`range gets ready. It stops before ${stop}.`, {
        line: 1,
        vars: vars(),
        out,
        ask: {
          q: 'What is the first number that i gets?',
          options: ['0', '1'],
          answer: 0,
          why: 'range starts at 0 unless you tell it another start.',
        },
      });
      s.pointer('ptr', s.slotX(0, stop + 1, opt), 100, 'i', { dir: 'up' });
      for (let i = 0; i < stop; i++) {
        s.set('ptr', { x: s.slotX(i, stop + 1, opt) });
        s.tone(`c${i}`, 'active');
        s.snap(`The next number is ${i}, so i is now ${i}.`, { line: 1, vars: vars(i), out });
        s.tone(`c${i}`, 'ok');
        out += (out ? '\n' : '') + i;
        let ask = null;
        if (i === stop - 1) {
          ask = {
            q: `i is ${i}. What happens next?`,
            options: [`i becomes ${stop}`, 'The loop ends'],
            answer: 1,
            why: `range stops before ${stop}, so i never gets to be ${stop}.`,
          };
        } else if (i === 2) {
          ask = {
            q: 'What is i on the next trip?',
            options: ['3', '2 again'],
            answer: 0,
            why: 'The for line gives i the next number on every trip.',
          };
        }
        s.snap(`print shows ${i}. Then Python goes back to the for line.`, { line: 2, vars: vars(i), out, ask });
      }
      s.del('ptr');
      s.pulse(`c${stop}`);
      s.snap(`No numbers are left, because ${stop} is the stop.`, { line: 1, vars: vars(stop - 1), out });
      out += '\nDone';
      const count = stop === 1 ? 'You got 1 number: 0.' : `You got ${stop} numbers: 0 to ${stop - 1}.`;
      s.set('sum', { text: count });
      s.snap(`The loop is over. ${count}`, { line: 3, vars: vars(stop - 1), out });
    },
  });

  // ---------------------------------------------------------- lesson 3.3
  /* The same picture for break and continue, so the learner can compare them. */
  function jumpVisual(name, word, title) {
    Viz.register(name, {
      title,
      size: [460, 170],
      code: [
        'for n in range(1, 6):',
        '    if n == 3:',
        `        ${word}`,
        '    print(n)',
        'print("Done")',
      ].join('\n'),
      build(s) {
        const opt = { cell: 54, gap: 8, y: 50, index: false, x: 230 };
        s.row('c', [1, 2, 3, 4, 5], opt);
        s.pointer('ptr', s.slotX(0, 5, opt), 80, 'n', { dir: 'up' });
        s.text('sum', 230, 150, '', { size: 15, weight: 600 });
        let out = '';
        for (const n of [1, 2, 3, 4, 5]) {
          s.set('ptr', { x: s.slotX(n - 1, 5, opt) });
          s.tone(`c${n - 1}`, 'active');
          s.snap(`A new trip starts. n is ${n}.`, { line: 1, vars: { n }, out });
          if (n === 3) {
            s.snap('Is n == 3? Yes, so Python runs the indented line.', {
              line: 2,
              vars: { n },
              out,
              ask: {
                q: `Python is about to run ${word}. What will it do?`,
                options: ['Leave the loop right now', 'Skip print, then go on with n = 4', 'Stop the whole program'],
                answer: word === 'break' ? 0 : 1,
                why: word === 'break'
                  ? 'break leaves the loop. The line after the loop still runs.'
                  : 'continue skips the rest of this trip. The loop then goes on.',
              },
            });
            if (word === 'break') {
              s.tone(`c${n - 1}`, 'bad');
              s.set('sum', { text: '4 and 5 never get a trip.' });
              s.snap('break leaves the loop. Python never prints 3, 4 or 5.', { line: 3, vars: { n }, out });
              break;
            }
            s.tone(`c${n - 1}`, 'warn');
            s.snap('continue skips print. Python goes back to the for line.', {
              line: 3,
              vars: { n },
              out,
              ask: {
                q: 'Where does Python go now?',
                options: ['Back to the for line, where n becomes 4', 'Down to print(n)'],
                answer: 0,
                why: 'continue ends this trip early. The next trip starts at the for line.',
              },
            });
            continue;
          }
          s.snap(`Is n == 3? No, so Python skips the indented line.`, { line: 2, vars: { n }, out });
          s.tone(`c${n - 1}`, 'ok');
          out += (out ? '\n' : '') + n;
          s.snap(`print shows ${n}.`, { line: 4, vars: { n }, out });
        }
        out += (out ? '\n' : '') + 'Done';
        if (word === 'continue') s.set('sum', { text: 'Only 3 was skipped.' });
        s.snap('Python moves to the line after the loop.', { line: 5, vars: { n: word === 'break' ? 3 : 5 }, out });
      },
    });
  }
  jumpVisual('m03-break', 'break', 'break leaves the loop');
  jumpVisual('m03-continue', 'continue', 'continue skips one trip');

  Viz.register('m03-nested-grid', {
    title: 'The inner loop runs all the way, once for each outer trip',
    size: [480, 210],
    code: py`
      for row in range(2):
          for col in range(3):
              print(row, col)
    `,
    build(s) {
      const xs = [210, 300, 390], ys = [62, 122];
      xs.forEach((x, c) => s.text(`ch${c}`, x, 22, `col ${c}`, { size: 14, tone: 'muted' }));
      ys.forEach((y, r) => {
        s.text(`rh${r}`, 90, y, `row ${r}`, { size: 14, tone: 'muted' });
        xs.forEach((x, c) => s.box(`g${r}${c}`, x, y, '', { w: 76, h: 48 }));
      });
      s.text('rowmark', 140, ys[0], 'row >', { size: 15, weight: 700 });
      s.pointer('colptr', xs[0], 150, 'col', { dir: 'up' });
      let out = '';
      for (let row = 0; row < 2; row++) {
        s.set('rowmark', { y: ys[row] });
        s.snap(`The outer loop starts a trip. row is ${row}.`, { line: 1, vars: { row }, out });
        for (let col = 0; col < 3; col++) {
          s.set('colptr', { x: xs[col] });
          s.tone(`g${row}${col}`, 'active');
          s.snap(`The inner loop gives the next number. col is ${col}.`, { line: 2, vars: { row, col }, out });
          s.set(`g${row}${col}`, { text: `${row} ${col}`, tone: 'ok' });
          out += (out ? '\n' : '') + `${row} ${col}`;
          let ask = null;
          if (row === 0 && col === 0) {
            ask = {
              q: 'Which one changes next?',
              options: ['col', 'row'],
              answer: 0,
              why: 'The inner loop finishes all its trips before row can change.',
            };
          } else if (row === 0 && col === 2) {
            ask = {
              q: 'The inner loop is out of numbers. What happens next?',
              options: ['row becomes 1, and col starts at 0 again', 'col becomes 3', 'The program ends'],
              answer: 0,
              why: 'The outer loop takes its next trip. The inner loop then starts over.',
            };
          } else if (row === 1 && col === 1) {
            ask = {
              q: 'How many times will print run in all?',
              options: ['6 times', '5 times', '3 times'],
              answer: 0,
              why: 'There are 2 outer trips with 3 inner trips each. 2 x 3 = 6.',
            };
          }
          s.snap(`print shows ${row} ${col}.`, { line: 3, vars: { row, col }, out, ask });
        }
      }
      s.snap('Both loops are out of numbers. The grid is full.', { line: 1, vars: { row: 1, col: 2 }, out });
    },
  });

  Viz.register('m03-biggest', {
    title: 'The biggest recipe keeps the best value so far',
    size: [520, 210],
    code: py`
      biggest = 0
      for n in nums:
          if n > biggest:
              biggest = n
      print(biggest)
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 numbers)', type: 'text', value: '4 9 2 7', size: 14 },
    ],
    build(s, p) {
      const nums = String(p.nums).trim().split(/[\s,]+/).filter(x => x !== '').map(Number).filter(Number.isFinite).slice(0, 6);
      if (!nums.length) throw new Error('type some numbers with spaces between them.');
      const opt = { cell: 52, gap: 8, y: 44, index: false, x: 260 };
      s.row('c', nums, opt);
      const show = `[${nums.join(', ')}]`;
      s.text('biglabel', 110, 162, 'biggest', { size: 16, weight: 600 });
      s.box('big', 190, 162, 0, { w: 64, h: 52 });
      s.text('test', 370, 162, '', { size: 17, weight: 600 });
      let big = 0;
      s.snap('biggest starts at 0. Any number above 0 can beat it.', { line: 1, vars: { nums: show, biggest: 0 }, out: '' });
      s.pointer('ptr', s.slotX(0, nums.length, opt), 74, 'n', { dir: 'up' });
      nums.forEach((n, i) => {
        s.set('ptr', { x: s.slotX(i, nums.length, opt) });
        s.clearTones(['big']);
        s.tone('big', 'default');
        s.tone(`c${i}`, 'active');
        s.set('test', { text: '' });
        s.snap(`The next number is ${n}.`, { line: 2, vars: { n, biggest: big }, out: '' });
        const wins = n > big;
        s.set('test', { text: `Is ${n} > ${big}?` });
        s.snap(`Python compares ${n} with the best so far, ${big}.`, {
          line: 3,
          vars: { n, biggest: big },
          out: '',
          ask: i === 0 || i % 2 === 1 ? {
            q: `Is ${n} > ${big}? What happens to biggest?`,
            options: ['Yes, so biggest changes', 'No, so biggest stays'],
            answer: wins ? 0 : 1,
            why: wins ? `${n} beats ${big}, so biggest becomes ${n}.` : `${n} does not beat ${big}, so biggest stays at ${big}.`,
          } : null,
        });
        if (wins) {
          big = n;
          s.set('big', { text: big, tone: 'ok' });
          s.pulse('big');
          s.set('test', { text: 'Yes' });
          s.snap(`${n} wins, so biggest is now ${n}.`, { line: 4, vars: { n, biggest: big }, out: '' });
        } else {
          s.set('test', { text: 'No' });
          s.tone(`c${i}`, 'muted');
          s.snap(`${n} does not win, so biggest stays at ${big}.`, { line: 3, vars: { n, biggest: big }, out: '' });
        }
      });
      s.del('ptr');
      s.set('test', { text: '' });
      s.snap(`No numbers are left. print shows ${big}.`, { line: 5, vars: { biggest: big }, out: String(big) });
    },
  });

  // ---------------------------------------------------------- lesson 3.4
  Viz.register('m03-trace-table', {
    title: 'Fill a trace table one row at a time',
    size: [500, 250],
    code: py`
      total = 0
      for n in range(1, 4):
          total = total + n
      print(total)
    `,
    build(s) {
      const col = { when: 90, n: 240, total: 370 };
      const rowY = i => 72 + i * 46;
      s.text('hw', col.when, 26, 'row', { size: 15, tone: 'muted' });
      s.text('hn', col.n, 26, 'n', { size: 18, weight: 700, mono: true });
      s.text('ht', col.total, 26, 'total', { size: 18, weight: 700, mono: true });
      s.snap('Draw one column for each variable: n and total.', { line: 0, out: '' });

      s.text('r0', col.when, rowY(0), 'start', { size: 15 });
      s.box('n0', col.n, rowY(0), '-', { w: 96, h: 38, tone: 'muted' });
      s.box('t0', col.total, rowY(0), 0, { w: 96, h: 38, tone: 'ok' });
      s.snap('total starts at 0. n has no value yet, so write a dash.', { line: 1, vars: { total: 0 }, out: '' });

      const asks = {
        1: {
          q: 'total is 0 and n is 1. What goes in the total box?',
          options: ['1', '0', '2'],
          answer: 0,
          why: 'total + n is 0 + 1, which is 1.',
        },
        2: {
          q: 'total is 1 and n is 2. What goes in the total box?',
          options: ['3', '2', '1'],
          answer: 0,
          why: 'Use the row above. total + n is 1 + 2, which is 3.',
        },
        3: null,
      };
      let total = 0;
      for (let n = 1; n <= 3; n++) {
        s.clearTones();
        s.tone(`n0`, 'muted');
        s.text(`r${n}`, col.when, rowY(n), `trip ${n}`, { size: 15 });
        s.box(`n${n}`, col.n, rowY(n), n, { w: 96, h: 38, tone: 'active' });
        s.snap(`Trip ${n} starts. Write n = ${n} in a new row.`, {
          line: 2,
          vars: { n, total },
          out: '',
          ask: asks[n],
        });
        s.tone(`n${n}`, 'default');
        total += n;
        s.box(`t${n}`, col.total, rowY(n), total, { w: 96, h: 38, tone: 'ok' });
        s.snap(`total + n works out to ${total}. Write it in the same row.`, {
          line: 3,
          vars: { n, total },
          out: '',
          ask: n === 3 ? {
            q: 'Do we need a row where n is 4?',
            options: ['No, range stops before 4', 'Yes, one more trip'],
            answer: 0,
            why: 'range(1, 4) gives 1, 2 and 3. So the table has 3 trips.',
          } : null,
        });
      }
      s.pulse('t3');
      s.snap(`The loop is over. print shows the last total: ${total}.`, { line: 4, vars: { n: 3, total }, out: String(total) });
    },
  });
})();
