/* Visuals for module 1. Names start with the module id. */
Viz.register('m01-steps-run', {
  title: 'The computer runs one line at a time',
  size: [560, 230],
  code: py`
    print("Good morning")
    print("Brush teeth")
    print("Go to school")
  `,
  build(s) {
    const ys = [72, 122, 172];
    const lines = ['print("Good morning")', 'print("Brush teeth")', 'print("Go to school")'];
    const shown = ['Good morning', 'Brush teeth', 'Go to school'];
    // Each print gets its own row on the screen, the way real output does.
    const screenY = [72, 108, 144];
    const showLine = i => s.text(`S${i}`, 396, screenY[i], shown[i], { size: 15, weight: 600, mono: true, anchor: 'start' });

    s.text('codelabel', 232, 30, 'Code', { size: 15, weight: 700 });
    lines.forEach((t, i) => s.box(`L${i}`, 232, ys[i], t, { w: 264, h: 40 }));
    s.area('screen', 380, 14, 166, 198, '');
    s.text('screenlabel', 396, 34, 'Screen', { size: 15, weight: 700, anchor: 'start' });
    s.text('ptr', 60, ys[0], 'now >', { size: 15, weight: 700 });
    s.tone('L0', 'active');
    s.snap('Python starts at the top line. The screen is empty.', { line: 1, out: '' });

    showLine(0);
    s.tone('L0', 'ok');
    s.snap('Line 1 runs. Good morning shows on the screen.', {
      line: 1,
      out: 'Good morning',
      ask: {
        q: 'Which line does Python run next?',
        options: ['Line 1 again', 'Line 2, the one below', 'The last line'],
        answer: 1,
        why: 'Python moves down one line at a time, like reading a page.',
      },
    });

    s.set('ptr', { y: ys[1] });
    s.tone('L1', 'active');
    s.snap('Python moves down to line 2.', {
      line: 2,
      out: 'Good morning',
      ask: {
        q: 'Where will Brush teeth show on the screen?',
        options: ['Next to Good morning', 'On a new line, below Good morning', 'On top of Good morning'],
        answer: 1,
        why: 'Each print starts on a new line. The old words stay where they are.',
      },
    });

    showLine(1);
    s.tone('L1', 'ok');
    s.snap('Line 2 runs. Brush teeth shows on a new line.', { line: 2, out: 'Good morning\nBrush teeth' });

    s.set('ptr', { y: ys[2] });
    s.tone('L2', 'active');
    s.snap('Python moves down to the last line.', { line: 3, out: 'Good morning\nBrush teeth' });

    showLine(2);
    s.tone('L2', 'ok');
    s.snap('Line 3 runs. Go to school shows on its own line.', { line: 3, out: 'Good morning\nBrush teeth\nGo to school' });

    s.del('ptr');
    s.snap('Every line ran once, from top to bottom. Now the program ends.', { line: 0, out: 'Good morning\nBrush teeth\nGo to school' });
  },
});

/* Lesson 1.2: a variable is a name tag, and = moves the tag. */
Viz.register('m01-name-tag', {
  title: 'A name tag moves to a new value',
  size: [560, 240],
  code: py`
    score = 3
    score = score + 1
    print(score)
  `,
  build(s) {
    const oldX = 150, newX = 380, tagY = 60, valY = 165;
    s.box('v3', oldX, valY, 3, { w: 70, h: 60, sub: 'int' });
    s.tone('v3', 'active');
    s.snap('Line 1 starts on the right of the = sign. It makes the value 3.', { line: 1 });

    s.box('tag', oldX, tagY, 'score', { w: 110, h: 42 });
    s.edge('link', 'tag', 'v3');
    s.tone('v3', 'default');
    s.tone('tag', 'active');
    s.snap('The name tag score sticks on the value 3.', { line: 1, vars: { score: 3 } });

    s.tone('tag', 'default');
    s.snap('Line 2 has an = sign too. Read it as: score gets score + 1.', {
      line: 2,
      vars: { score: 3 },
      ask: {
        q: 'What does Python do first on this line?',
        options: ['It moves the tag', 'It works out the right side', 'It prints the score'],
        answer: 1,
        why: 'Python always works out the right side first. Then it knows where the tag goes.',
      },
    });

    s.text('sum', 265, 130, '3 + 1 = 4', { size: 16, weight: 600 });
    s.box('v4', newX, valY, 4, { w: 70, h: 60, sub: 'int' });
    s.tone('v4', 'active');
    s.snap('The tag score is on 3, so score + 1 makes a new value: 4.', {
      line: 2,
      vars: { score: 3 },
      ask: {
        q: 'Where does the name tag go now?',
        options: ['It stays on 3', 'It moves to 4', 'It sticks on both 3 and 4'],
        answer: 1,
        why: 'A name tag sits on 1 value at a time. The = sign moves it to the new one.',
      },
    });

    s.del('sum');
    s.set('tag', { x: newX });
    s.set('link', { to: 'v4' });
    s.tone('v4', 'default');
    s.tone('tag', 'active');
    s.snap('The tag moves to 4. Now score means 4.', { line: 2, vars: { score: 4 } });

    s.tone('tag', 'default');
    s.tone('v3', 'muted');
    s.set('v3', { opacity: 0.45 });
    s.snap('No tag points at 3 now. The name score does not remember it.', {
      line: 2,
      vars: { score: 4 },
      ask: {
        q: 'What will print(score) show?',
        options: ['3', '4', 'The word score'],
        answer: 1,
        why: 'With no quote marks, score is a name. Python shows the value on that tag.',
      },
    });

    s.del('v3');
    s.tone('v4', 'ok');
    s.pulse('v4');
    s.snap('print follows the tag and shows the value it finds: 4.', { line: 3, vars: { score: 4 }, out: '4' });
  },
});

/* Lesson 1.3: input() gives text, and int() makes a number from it. */
Viz.register('m01-input-int', {
  title: 'input gives text, and int makes a number',
  size: [560, 240],
  code: py`
    age = input()
    age = int(age)
    print(age + 1)
  `,
  inputs: [
    { key: 'typed', label: 'You type', type: 'number', value: 11, min: 0, max: 99 },
  ],
  tryInputs: [{ typed: 0 }, { typed: 99 }],
  build(s, p) {
    const n = Number.isFinite(p.typed) ? Math.round(p.typed) : 11;
    const textX = 150, numX = 390, tagY = 60, valY = 165;
    const text = `"${n}"`;

    s.text('wait', textX, valY, 'Waiting for you...', { size: 15, tone: 'muted' });
    s.snap('input stops the program. It waits for you to type.', { line: 1 });

    s.set('wait', { text: `You type ${n}, then Enter.`, tone: 'default' });
    s.snap(`You type ${n} and press Enter.`, {
      line: 1,
      ask: {
        q: 'What type of value does input give back?',
        options: ['int, a whole number', 'str, some text', 'bool, True or False'],
        answer: 1,
        why: 'input always gives back text, even when you type only digits.',
      },
    });

    s.del('wait');
    s.box('t', textX, valY, text, { w: 90, h: 60, sub: 'str' });
    s.tone('t', 'active');
    s.snap(`The answer is the text ${text}. The quote marks show that it is a str.`, { line: 1 });

    s.tone('t', 'default');
    s.box('tag', textX, tagY, 'age', { w: 90, h: 42 });
    s.edge('link', 'tag', 't');
    s.snap(`The name tag age sticks on ${text}.`, {
      line: 1,
      vars: { age: text },
      ask: {
        q: 'What would age + 1 do right now?',
        options: [`Make ${n + 1}`, `Make "${n}1"`, 'Stop with a TypeError'],
        answer: 2,
        why: 'Python cannot add text and a number, so it stops with a TypeError.',
      },
    });

    s.box('num', numX, valY, n, { w: 90, h: 60, sub: 'int' });
    s.tone('num', 'active');
    s.snap(`Line 2 runs int. It reads the text and makes the whole number ${n}.`, { line: 2, vars: { age: text } });

    s.tone('num', 'default');
    s.set('tag', { x: numX });
    s.set('link', { to: 'num' });
    s.tone('tag', 'active');
    s.snap(`The tag moves to the number ${n}. Now a sum can work.`, { line: 2, vars: { age: n } });

    s.tone('tag', 'default');
    s.del('t');
    s.text('sum', 490, valY, `${n} + 1 = ${n + 1}`, { size: 16, weight: 600 });
    s.snap(`Line 3 works out age + 1. That makes ${n + 1}.`, { line: 3, vars: { age: n } });

    s.tone('num', 'ok');
    s.pulse('num');
    s.snap(`print shows ${n + 1}.`, { line: 3, vars: { age: n }, out: String(n + 1) });
  },
});
