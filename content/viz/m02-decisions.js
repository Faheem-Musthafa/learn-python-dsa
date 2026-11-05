/* Visuals for module 2. Names start with the module id. */
Viz.register('m02-compare', {
  title: 'Each comparison gives True or False',
  size: [560, 240],
  code: py`
    age = int(input())
    print(age < 10)
    print(age == 10)
    print(age != 10)
  `,
  inputs: [
    { key: 'age', label: 'You type', type: 'number', value: 9, min: 0, max: 20 },
  ],
  tryInputs: [{ age: 10 }, { age: 15 }],
  build(s, p) {
    const a = Number.isFinite(p.age) ? Math.round(p.age) : 9;
    const word = b => (b ? 'True' : 'False');
    const lines = [
      { op: '<', ans: a < 10, ask: `Is ${a} smaller than 10?`,
        yes: `${a} is smaller than 10.`, no: `${a} is not smaller than 10.` },
      { op: '==', ans: a === 10, ask: `Is ${a} the same as 10?`,
        yes: `${a} is the same as 10.`, no: `${a} is not the same as 10.` },
      { op: '!=', ans: a !== 10, ask: `Is ${a} different from 10?`,
        yes: `${a} is different from 10.`, no: `${a} is the same as 10, so it is not different.` },
    ];
    const ys = [72, 130, 188];
    s.text('h1', 80, 26, 'age', { size: 15, tone: 'muted' });
    s.text('h2', 190, 26, 'operator', { size: 15, tone: 'muted' });
    s.text('h3', 300, 26, 'compare to', { size: 15, tone: 'muted' });
    s.text('h4', 440, 26, 'answer', { size: 15, tone: 'muted' });
    s.snap(`You type ${a}. The name tag age sticks on ${a}.`, { line: 1, vars: { age: a } });

    let out = '';
    lines.forEach((l, i) => {
      const y = ys[i];
      s.clearTones();
      s.box(`l${i}`, 80, y, a, { w: 64, h: 44 });
      s.circle(`o${i}`, 190, y, l.op, { r: 22 });
      s.box(`r${i}`, 300, y, 10, { w: 64, h: 44 });
      s.tone(`o${i}`, 'active');
      s.snap(`Line ${i + 2} asks: ${l.ask}`, {
        line: i + 2,
        vars: { age: a },
        out,
        ask: {
          q: `What does age ${l.op} 10 give?`,
          options: ['True', 'False'],
          answer: l.ans ? 0 : 1,
          why: l.ans ? l.yes : l.no,
        },
      });
      out += (out ? '\n' : '') + word(l.ans);
      s.box(`a${i}`, 440, y, word(l.ans), { w: 100, h: 44 });
      s.tone(`a${i}`, l.ans ? 'ok' : 'bad');
      s.snap(`The answer is ${word(l.ans)}. ${l.ans ? l.yes : l.no}`, { line: i + 2, vars: { age: a }, out });
    });
    s.clearTones();
    lines.forEach((l, i) => s.tone(`a${i}`, l.ans ? 'ok' : 'bad'));
    s.snap('Each line gave one value: True or False. The name age did not change.', { line: 4, vars: { age: a }, out });
  },
});

Viz.register('m02-branches', {
  title: 'Python takes only 1 path',
  size: [560, 270],
  code: py`
    score = int(input())
    if score >= 9:
        print("Gold")
    elif score >= 5:
        print("Silver")
    else:
        print("Try again")
    print("Done")
  `,
  inputs: [
    { key: 'score', label: 'You type', type: 'number', value: 7, min: 0, max: 10 },
  ],
  tryInputs: [{ score: 10 }, { score: 9 }, { score: 5 }, { score: 2 }],
  build(s, p) {
    const n = Number.isFinite(p.score) ? Math.round(p.score) : 7;
    const vars = { score: n };
    let chosen = '';
    s.box('q1', 90, 70, 'score >= 9', { w: 136, h: 44 });
    s.box('q2', 280, 70, 'score >= 5', { w: 136, h: 44 });
    s.box('e', 470, 70, 'else', { w: 110, h: 44 });
    s.box('a', 90, 165, 'Gold', { w: 130, h: 42 });
    s.box('b', 280, 165, 'Silver', { w: 130, h: 42 });
    s.box('c', 470, 165, 'Try again', { w: 140, h: 42 });
    s.box('done', 280, 240, 'Done', { w: 130, h: 40 });
    s.edge('e1', 'q1', 'q2', { label: 'no' });
    s.edge('e2', 'q2', 'e', { label: 'no' });
    s.edge('e3', 'q1', 'a', { label: 'yes' });
    s.edge('e4', 'q2', 'b', { label: 'yes' });
    s.edge('e5', 'e', 'c');
    s.edge('e6', 'a', 'done', { dashed: true });
    s.edge('e7', 'b', 'done', { dashed: true });
    s.edge('e8', 'c', 'done', { dashed: true });
    s.snap(`You type ${n}. Python starts at the top.`, { line: 1, vars });

    const nextAsk = {
      q: 'What does Python do after this print?',
      options: ['It asks the next question too', 'It skips the rest of the chain', 'It goes back to the top'],
      answer: 1,
      why: 'Once 1 answer is True, Python skips every other path in the chain.',
    };
    const skip = (say, keep) => {
      ['q1', 'q2', 'e', 'a', 'b', 'c'].filter(id => !keep.includes(id)).forEach(id => s.tone(id, 'muted'));
      s.snap(say, { line: 8, vars, out: chosen });
    };

    s.pointer('now', 90, 42, 'now', { dir: 'down' });
    s.tone('q1', 'active');
    s.snap(`Line 2 asks: is ${n} >= 9?`, {
      line: 2,
      vars,
      ask: {
        q: 'Which way does Python go?',
        options: ['Yes, it prints Gold', 'No, it moves to the next question'],
        answer: n >= 9 ? 0 : 1,
        why: `The answer to ${n} >= 9 is ${n >= 9 ? 'True' : 'False'}.`,
      },
    });

    if (n >= 9) {
      chosen = 'Gold';
      s.del('now');
      s.tone('q1', 'ok');
      s.set('a', { text: 'Gold ✓' });
      s.tone('a', 'ok');
      s.pulse('a');
      s.snap('True, so Python runs the indented line under if.', { line: 3, vars, out: chosen, ask: nextAsk });
      skip('Python skips elif and else. It goes on to the next line with no indentation.', ['q1', 'a']);
    } else {
      s.tone('q1', 'bad');
      s.set('now', { x: 280 });
      s.tone('q2', 'active');
      s.snap(`False, so Python goes to elif. It asks: is ${n} >= 5?`, {
        line: 4,
        vars,
        ask: {
          q: 'Which way does Python go?',
          options: ['Yes, it prints Silver', 'No, it moves on to else'],
          answer: n >= 5 ? 0 : 1,
          why: `The answer to ${n} >= 5 is ${n >= 5 ? 'True' : 'False'}.`,
        },
      });
      if (n >= 5) {
        chosen = 'Silver';
        s.del('now');
        s.tone('q2', 'ok');
        s.set('b', { text: 'Silver ✓' });
        s.tone('b', 'ok');
        s.pulse('b');
        s.snap('True, so Python runs the indented line under elif.', { line: 5, vars, out: chosen, ask: nextAsk });
        skip('Python skips else. It goes on to the next line with no indentation.', ['q1', 'q2', 'b']);
      } else {
        s.tone('q2', 'bad');
        s.set('now', { x: 470 });
        s.tone('e', 'active');
        s.snap('False again. The word else has no question, so Python goes there.', { line: 6, vars });
        chosen = 'Try again';
        s.del('now');
        s.tone('e', 'ok');
        s.set('c', { text: 'Try again ✓' });
        s.tone('c', 'ok');
        s.pulse('c');
        s.snap('Python runs the indented line under else.', { line: 7, vars, out: chosen });
        skip('That is the end of the chain. Python goes on to the next line.', ['q1', 'q2', 'e', 'c']);
      }
    }

    s.tone('done', 'ok');
    s.pulse('done');
    s.snap('This line has no indentation, so it always runs. Only 1 path ran above it.', { line: 8, vars, out: chosen + '\nDone' });
  },
});
