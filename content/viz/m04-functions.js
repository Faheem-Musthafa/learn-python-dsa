/* Visuals for module 4. Names start with the module id. */

/* 4.1: def saves the steps, a call runs them, return hands back an answer. */
Viz.register('m04-double', {
  title: 'A function takes a value and hands one back',
  size: [560, 300],
  code: py`
    def double(n):
        answer = n * 2
        return answer

    result = double(4)
    print(result)
  `,
  build(s) {
    const tag = { h: 38, tone: 'accent' };
    s.area('main', 14, 14, 246, 272, 'Your code');
    s.snap('Python reads line 1. It sees the word def.', {
      line: 1,
      ask: {
        q: 'Will Python run line 2 now?',
        options: ['Yes, it runs each line in turn', 'No, def only saves the steps'],
        answer: 1,
        why: 'def saves the steps under a name. They run later, when you call the function.',
      },
    });
    s.box('recipe', 137, 74, 'double', { w: 170, h: 46, sub: 'saved steps' });
    s.snap('Python saves the steps under the name double.', { line: 1 });

    s.box('val', 137, 184, 4, { w: 56, h: 56, tone: 'active' });
    s.text('valLbl', 137, 142, 'double(4)', { size: 16, mono: true });
    s.snap('Line 5 calls double. It hands over the value 4.', { line: 5 });

    s.area('room', 286, 14, 260, 272, 'Inside double');
    s.snap('The call opens a space for the steps to work in.', { line: 1 });

    s.set('val', { x: 490, y: 100 });
    s.del('valLbl');
    s.box('nTag', 350, 100, 'n', { w: 46, ...tag });
    s.edge('nEdge', 'nTag', 'val');
    s.snap('The parameter n is a name tag. It sticks on the value 4.', { line: 1, vars: { n: 4 } });

    s.tone('val', 'default');
    s.box('aTag', 350, 190, 'answer', { w: 92, ...tag });
    s.box('ans', 490, 190, 8, { w: 56, h: 56, tone: 'active' });
    s.edge('aEdge', 'aTag', 'ans');
    s.snap('Line 2 works out n * 2. The tag answer sticks on 8.', {
      line: 2,
      vars: { n: 4, answer: 8 },
      ask: {
        q: 'Line 3 says return answer. Where does the 8 go?',
        options: ['Onto the screen', 'Back to the line that made the call', 'Nowhere, it gets lost'],
        answer: 1,
        why: 'return hands the value back to the code that asked. Only print puts it on the screen.',
      },
    });

    s.set('ans', { x: 137, y: 184 });
    s.snap('return hands the 8 back to line 5.', { line: 3, vars: { n: 4, answer: 8 } });

    s.del('room', 'nEdge', 'nTag', 'val', 'aEdge', 'aTag');
    s.snap('The job is done. The tags n and answer are gone.', { line: 3 });

    s.box('rTag', 72, 244, 'result', { w: 92, ...tag });
    s.set('ans', { x: 200, y: 244, tone: 'ok' });
    s.edge('rEdge', 'rTag', 'ans');
    s.snap('The name tag result sticks on the 8.', { line: 5, vars: { result: 8 } });

    s.pulse('ans');
    s.snap('print shows the value of result on the screen.', { line: 6, vars: { result: 8 }, out: '8' });
  },
});

/* 4.1: print and return side by side. */
Viz.register('m04-print-vs-return', {
  title: 'print shows it. return hands it back.',
  size: [560, 300],
  code: py`
    def show(n):
        print(n * 2)

    def give(n):
        return n * 2

    a = show(4)
    b = give(4)
    print(a)
    print(b)
  `,
  build(s) {
    const L = 145, R = 415;
    const tag = { w: 46, h: 38, tone: 'accent' };
    s.box('show', L, 44, 'show(4)', { w: 130, h: 46 });
    s.box('give', R, 44, 'give(4)', { w: 130, h: 46 });
    s.area('screen', 20, 180, 520, 106, 'Screen');
    s.snap('Lines 1 to 5 save 2 functions. Nothing runs yet.', { line: 4 });

    s.tone('show', 'active');
    s.snap('Line 7 calls show and hands it 4.', { line: 7 });

    s.text('sc1', 280, 212, '8', { size: 18, mono: true });
    s.snap('show prints 8, so 8 appears on the screen.', {
      line: 2,
      out: '8',
      ask: {
        q: 'show has no return. What will the tag a stick on?',
        options: ['8', 'None', 'Nothing, because Python stops'],
        answer: 1,
        why: 'With no return, a function hands back None. print showed the 8, but nothing came back.',
      },
    });

    s.box('aTag', L - 90, 124, 'a', tag);
    s.box('a', L + 8, 124, 'None', { w: 92, h: 52, tone: 'warn' });
    s.edge('aEdge', 'aTag', 'a');
    s.tone('show', 'default');
    s.snap('show hands back None. So the tag a sticks on None.', { line: 7, vars: { a: 'None' }, out: '8' });

    s.tone('give', 'active');
    s.snap('Line 8 calls give and hands it 4.', {
      line: 8,
      vars: { a: 'None' },
      out: '8',
      ask: {
        q: 'give has a return and no print. What new thing shows on the screen?',
        options: ['Another 8', 'Nothing new', 'None'],
        answer: 1,
        why: 'return hands the value to your code. It does not put anything on the screen.',
      },
    });

    s.pulse('give');
    s.snap('give returns 8. The screen does not change.', { line: 5, vars: { a: 'None' }, out: '8' });

    s.box('bTag', R - 90, 124, 'b', tag);
    s.box('b', R + 8, 124, 8, { w: 92, h: 52, tone: 'ok' });
    s.edge('bEdge', 'bTag', 'b');
    s.tone('give', 'default');
    s.snap('The tag b sticks on 8.', { line: 8, vars: { a: 'None', b: 8 }, out: '8' });

    s.text('sc2', 280, 238, 'None', { size: 18, mono: true });
    s.pulse('a');
    s.snap('print(a) shows None on the screen.', { line: 9, vars: { a: 'None', b: 8 }, out: '8\nNone' });

    s.text('sc3', 280, 264, '8', { size: 18, mono: true });
    s.pulse('b');
    s.snap('print(b) shows 8. Only print puts things on the screen.', { line: 10, vars: { a: 'None', b: 8 }, out: '8\nNone\n8' });
  },
});

/* 4.2: a name made in a function lives in that function's room. */
Viz.register('m04-scope-rooms', {
  title: 'Each call gets its own room',
  size: [560, 270],
  code: py`
    x = 1

    def change():
        x = 99
        print(x)

    change()
    print(x)
  `,
  build(s) {
    const tag = { w: 46, h: 38, tone: 'accent' };
    s.area('out', 14, 14, 532, 242, 'Outside any function');
    s.box('xTag', 60, 90, 'x', tag);
    s.box('x', 170, 90, 1, { w: 60, h: 60, tone: 'active' });
    s.edge('xEdge', 'xTag', 'x');
    s.snap('The name tag x sticks on 1, outside any function.', { line: 1, vars: { x: 1 } });

    s.tone('x', 'default');
    s.box('fn', 125, 196, 'change', { w: 130, h: 46, sub: 'saved steps' });
    s.snap('def saves the steps of change. Nothing runs yet.', { line: 3, vars: { x: 1 } });

    s.area('room', 260, 56, 268, 184, 'Inside change()', { tone: 'default' });
    s.snap('Line 7 calls change. The call builds a new room.', {
      line: 7,
      vars: { x: 1 },
      ask: {
        q: 'Line 4 says x = 99. Which x does it set?',
        options: ['The x outside', 'A new x inside the room'],
        answer: 1,
        why: 'Setting a name inside a function makes a new local name. The outside x stays as it was.',
      },
    });

    s.box('x2Tag', 310, 140, 'x', tag);
    s.box('x2', 430, 140, 99, { w: 72, h: 60, tone: 'active' });
    s.edge('x2Edge', 'x2Tag', 'x2');
    s.snap('Line 4 makes a new tag x inside the room. It sticks on 99.', { line: 4, vars: { 'x outside': 1, 'x inside': 99 } });

    s.pulse('x2');
    s.snap('print looks in the room first, so it shows 99.', { line: 5, vars: { 'x outside': 1, 'x inside': 99 }, out: '99' });

    s.del('room', 'x2Edge', 'x2Tag', 'x2');
    s.snap('The call ends. The room and its x are gone.', { line: 7, vars: { x: 1 }, out: '99' });

    s.tone('x', 'active');
    s.snap('Line 8 asks for x again, outside the room.', {
      line: 8,
      vars: { x: 1 },
      out: '99',
      ask: {
        q: 'What does print(x) show now?',
        options: ['99', '1', 'Python stops with an error'],
        answer: 1,
        why: 'The 99 was only in the room, and the room is gone. The outside x never changed.',
      },
    });

    s.tone('x', 'ok');
    s.snap('It shows 1. The outside x never changed.', { line: 8, vars: { x: 1 }, out: '99\n1' });
  },
});

/* 4.2: the first picture of the call stack. */
Viz.register('m04-call-stack', {
  title: 'The pile of calls',
  size: [560, 280],
  code: py`
    def add_one(n):
        return n + 1

    def double_up(n):
        d = n * 2
        r = add_one(d)
        return r

    print(double_up(3))
  `,
  build(s) {
    const X = 190, W = 330, Y = [226, 164, 102];
    const note = (id, slot, text) => {
      s.box(id, X, Y[slot], text, { w: W, h: 56, tone: 'active' });
      s.text(id + 'Say', 372, Y[slot], 'runs now', { size: 15, anchor: 'start', weight: 700 });
    };
    const wait = id => {
      s.tone(id, 'default');
      s.set(id + 'Say', { text: 'waits' });
    };
    const wake = id => {
      s.tone(id, 'active');
      s.set(id + 'Say', { text: 'runs now' });
    };
    s.text('floor', X, 268, 'bottom of the pile', { size: 13, tone: 'muted' });

    note('main', 0, 'main code');
    s.snap('Your main code runs first. It is the bottom of the pile.', { line: 9 });

    wait('main');
    note('dbl', 1, 'double_up n=3');
    s.snap('Line 9 calls double_up. It goes on top, and main waits.', { line: 4, vars: { n: 3 } });

    s.set('dbl', { text: 'double_up n=3 d=6' });
    s.snap('Line 5 works out d. It gets 6.', {
      line: 5,
      vars: { n: 3, d: 6 },
      ask: {
        q: 'Line 6 calls add_one. What does double_up do while add_one runs?',
        options: ['It waits on the pile', 'It ends right away', 'It keeps running at the same time'],
        answer: 0,
        why: 'Python works only on the top of the pile. double_up waits there until add_one hands back an answer.',
      },
    });

    wait('dbl');
    note('add', 2, 'add_one n=6');
    s.snap('add_one goes on top. It has its own n, which is on 6.', { line: 1, vars: { n: 6 } });

    s.pulse('add');
    s.snap('Line 2 works out 7 and returns it.', {
      line: 2,
      vars: { n: 6 },
      ask: {
        q: 'Which call leaves the pile first?',
        options: ['main code', 'double_up', 'add_one'],
        answer: 2,
        why: 'The top call always finishes first. The last one on is the first one off.',
      },
    });

    s.del('add', 'addSay');
    wake('dbl');
    s.snap('add_one comes off the top. double_up runs again.', { line: 6, vars: { n: 3, d: 6 } });

    s.set('dbl', { text: 'double_up n=3 d=6 r=7' });
    s.snap('The name r gets the 7. This n is still on 3.', { line: 6, vars: { n: 3, d: 6, r: 7 } });

    s.del('dbl', 'dblSay');
    wake('main');
    s.snap('double_up returns 7 and comes off the pile.', { line: 7 });

    s.pulse('main');
    s.snap('Main code gets the 7 and prints it.', { line: 9, out: '7' });
  },
});

/* 4.3: how to read a real error message, from the bottom up. */
Viz.register('m04-read-error', {
  title: 'Read an error message from the bottom up',
  size: [560, 260],
  code: py`
    apples = 3
    pears = 4
    print(apples + total)
  `,
  build(s) {
    const pad = n => ' '.repeat(n);
    const X = 22;
    const rows = [
      ['e0', 34, 'Traceback (most recent call last):'],
      ['e1', 68, pad(2) + 'File "main.py", line 3, in <module>'],
      ['e2', 102, pad(4) + 'print(apples + total)'],
      ['e3', 130, pad(19) + '^^^^^'],
      ['e4', 168, "NameError: name 'total' is not defined"],
    ];
    const showRows = () => rows.forEach(([id, y, t]) => s.text(id, X, y, t, { size: 15, anchor: 'start', mono: true }));
    const mark = (id, y, h) => s.box(id, 280, y, '', { w: 530, h, tone: 'warn' });
    const note = t => {
      if (s.has('note')) s.set('note', { text: t });
      else s.text('note', 280, 226, t, { size: 16, weight: 700 });
    };

    note('No problem so far');
    s.snap('Lines 1 and 2 run with no trouble.', { line: 2, vars: { apples: 3, pears: 4 } });

    s.snap('Line 3 uses the name total. No line ever made it.', {
      line: 3,
      vars: { apples: 3, pears: 4 },
      ask: {
        q: 'What does Python do on line 3?',
        options: ['It guesses a value for total', 'It stops and shows an error message', 'It prints 3 and skips the rest'],
        answer: 1,
        why: 'Python never guesses. It stops at the line where it got stuck, and tells you why.',
      },
    });

    showRows();
    note('This is the error message');
    s.snap('Python stops on line 3 and shows this error message.', {
      line: 3,
      ask: {
        q: 'Where should you start reading?',
        options: ['The top line', 'The bottom line', 'It does not matter'],
        answer: 1,
        why: 'The bottom line says what went wrong. The top line only says a list of steps comes next.',
      },
    });

    mark('m4', 168, 32);
    note('Bottom line: the kind of problem');
    s.snap('Start at the bottom. NameError is the kind of problem.', { line: 3 });

    note('After the colon: the clue');
    s.snap('The words after the colon give the clue: total is not defined.', { line: 3 });

    s.del('m4');
    mark('m1', 68, 30);
    note('line 3: where Python got stuck');
    s.snap('Now look up. It says line 3, so look there.', { line: 3 });

    s.del('m1');
    mark('m2', 116, 58);
    note('The ^ marks point at the spot');
    s.snap('The ^ marks point at the exact spot: total.', { line: 3 });

    s.del('m2');
    note('Fix it, then run again');
    s.snap('Now you know the fix. Make total first, or use a name you made.', { line: 3 });
  },
});

/* 4.3: a bug with no error, found by adding one print line. */
Viz.register('m04-debug-print', {
  title: 'A print line shows the bug',
  size: [560, 250],
  code: py`
    def total_to(n):
        total = 0
        for i in range(n):
            total = total + i
            print("i is", i, "total is", total)
        return total

    print(total_to(3))
  `,
  build(s) {
    const opt = { cell: 52, gap: 10, x: 340, index: false };
    s.text('wantLbl', 96, 50, 'You want', { size: 16, weight: 700 });
    s.row('w', [1, 2, 3], { ...opt, y: 50 });
    s.text('gotLbl', 96, 122, 'i really is', { size: 16, weight: 700 });
    s.row('g', ['', '', ''], { ...opt, y: 122, box: { tone: 'muted' } });
    s.text('totLbl', 96, 200, 'total', { size: 16, weight: 700 });
    s.box('tot', 278, 200, 0, { w: 52, h: 52 });
    s.snap('You want total_to(3) to add 1 + 2 + 3. That makes 6.', { line: 8 });

    s.tone('tot', 'active');
    s.snap('total starts at 0.', { line: 2, vars: { n: 3, total: 0 } });

    s.tone('tot', 'default');
    s.set('g0', { text: 0, tone: 'bad' });
    s.snap('Trip 1: the new print line shows i is 0, total is 0.', {
      line: 5,
      vars: { i: 0, total: 0 },
      out: 'i is 0 total is 0',
      ask: {
        q: 'You wanted to add 1 first. What does this print tell you?',
        options: ['The loop starts at 0, not 1', 'The print line caused the bug', 'Everything is fine so far'],
        answer: 0,
        why: 'The print line only looks. It shows that i starts at 0, and you expected 1.',
      },
    });

    let shown = 'i is 0 total is 0';
    s.set('g1', { text: 1, tone: 'bad' });
    s.set('tot', { text: 1 });
    shown += '\ni is 1 total is 1';
    s.snap('Trip 2: i is 1 and total is 1.', { line: 5, vars: { i: 1, total: 1 }, out: shown });

    s.set('g2', { text: 2, tone: 'bad' });
    s.set('tot', { text: 3 });
    shown += '\ni is 2 total is 3';
    s.snap('Trip 3: i is 2 and total is 3.', {
      line: 5,
      vars: { i: 2, total: 3 },
      out: shown,
      ask: {
        q: 'Will the loop run again with i as 3?',
        options: ['Yes, range(3) includes 3', 'No, range(3) stops before 3'],
        answer: 1,
        why: 'range(3) gives 0, 1 and 2. It stops before the number you give it.',
      },
    });

    s.tone('tot', 'bad');
    shown += '\n3';
    s.snap('The function returns 3, but you wanted 6.', { line: 8, out: shown });

    s.tone(['w0', 'w1', 'w2'], 'warn');
    s.snap('Compare the rows. You wanted 1, 2, 3. You got 0, 1, 2.', { line: 3, out: shown });

    s.text('fix', 416, 200, 'Fix: range(1, n + 1)', { size: 16, mono: true, weight: 700 });
    s.snap('Change line 3 to range(1, n + 1). Then remove the print line.', { line: 3, out: shown });
  },
});

/* 4.4: try runs the risky line, except is the backup plan. The learner picks the input. */
Viz.register('m04-try-except', {
  title: 'try the risky line, with a backup plan',
  size: [560, 300],
  code: py`
    text = input()
    try:
        n = int(text)
        print("Double is", n * 2)
    except ValueError:
        print("Not a number")
    print("Bye")
  `,
  inputs: [
    { key: 'text', label: 'You type', type: 'text', value: 'cat', size: 8 },
  ],
  tryInputs: [{ text: '7' }, { text: '' }, { text: 'a very long word' }, { text: '1_000' }],
  build(s, p) {
    const raw = String(p.text == null ? '' : p.text);
    const clean = raw.trim();
    const good = /^[+-]?\d+(_\d+)*$/.test(clean);
    const short = raw.length > 8 ? raw.slice(0, 8) + '..' : raw;
    const X = 330;
    s.area('tryA', 66, 8, 482, 124, 'try');
    s.area('exA', 66, 140, 482, 76, 'except ValueError');
    s.box('L3', X, 54, 'n = int(text)', { w: 310, h: 40 });
    s.box('L4', X, 102, 'print("Double is", n * 2)', { w: 310, h: 40 });
    s.box('L6', X, 182, 'print("Not a number")', { w: 310, h: 40 });
    s.box('L7', X, 252, 'print("Bye")', { w: 310, h: 40 });
    s.pointer('now', 40, 20, 'now', { dir: 'up' });
    const at = y => s.set('now', { y: y - 8 });

    s.snap(`The name tag text sticks on what you typed: "${short}".`, { line: 1, vars: { text: short } });

    at(54);
    s.tone('L3', 'active');
    if (!good) {
      s.snap(`Line 3 tries to turn "${short}" into a number.`, {
        line: 3,
        vars: { text: short },
        ask: {
          q: 'This text is not a number. What does Python do next?',
          options: ['It runs line 4 anyway', 'It jumps to except', 'The whole program ends'],
          answer: 1,
          why: 'The failed line ends the try part at once. Python jumps to the except that matches.',
        },
      });
      s.tone('L3', 'bad');
      s.tone('L4', 'muted');
      at(182);
      s.tone('L6', 'active');
      s.snap('A ValueError happens. Python skips line 4 and jumps to except.', { line: 5, vars: { text: short } });
      s.tone('L6', 'ok');
      s.snap('The backup plan runs. It prints Not a number.', { line: 6, vars: { text: short }, out: 'Not a number' });
      at(252);
      s.tone('L7', 'ok');
      s.snap('The program does not crash. It carries on to the last line.', { line: 7, vars: { text: short }, out: 'Not a number\nBye' });
    } else {
      const big = BigInt(clean.replace(/_/g, ''));
      const n = String(big);
      const line = `Double is ${big * 2n}`;
      s.snap(`Line 3 turns "${short}" into the number ${n}. It works.`, {
        line: 3,
        vars: { text: short, n },
        ask: {
          q: 'There is no error. Will the except part run?',
          options: ['Yes, it always runs', 'No, it runs only after an error'],
          answer: 1,
          why: 'except is a backup plan. With no error, Python skips it.',
        },
      });
      s.tone('L3', 'ok');
      at(102);
      s.tone('L4', 'ok');
      s.snap(`Line 4 runs. It prints ${line}.`, { line: 4, vars: { text: short, n }, out: line });
      s.tone('L6', 'muted');
      s.snap('There was no error, so Python skips the except part.', { line: 5, vars: { text: short, n }, out: line });
      at(252);
      s.tone('L7', 'ok');
      s.snap('The program carries on to the last line.', { line: 7, vars: { text: short, n }, out: `${line}\nBye` });
    }
  },
});

/* 4.4: assert is quiet when a test passes, and stops the program when one fails. */
Viz.register('m04-assert-test', {
  title: 'assert checks your function for you',
  size: [560, 230],
  code: py`
    def double(n):
        return n + 2

    assert double(2) == 4
    assert double(3) == 6
    print("All tests passed")
  `,
  build(s) {
    const row = (id, y, t) => {
      s.text(id + 'T', 40, y, t, { size: 17, anchor: 'start', mono: true });
      s.box(id, 400, y, '?', { w: 110, h: 46, tone: 'muted' });
    };
    row('t1', 50, 'double(2) == 4');
    row('t2', 112, 'double(3) == 6');
    s.snap('Here is double. 2 tests will check it.', { line: 1 });

    s.tone('t1', 'active');
    s.snap('double(2) gives 4, and 4 == 4 is True.', {
      line: 4,
      ask: {
        q: 'The check is True. What does assert do?',
        options: ['It stays quiet and moves on', 'It prints True', 'It stops the program'],
        answer: 0,
        why: 'assert says nothing when a check is True. Quiet means the test passed.',
      },
    });

    s.set('t1', { text: 'pass', tone: 'ok' });
    s.snap('The first test passes. assert says nothing.', { line: 4 });

    s.tone('t2', 'active');
    s.snap('double(3) gives 5, and 5 == 6 is False.', {
      line: 5,
      ask: {
        q: 'The check is False. What happens now?',
        options: ['Python stops with an AssertionError', 'It prints False and moves on', 'It tries the next line'],
        answer: 0,
        why: 'A False check stops the program. That is how the test tells you about a bug.',
      },
    });

    s.set('t2', { text: 'fail', tone: 'bad' });
    s.text('stop', 280, 176, 'AssertionError on line 5', { size: 17, mono: true, weight: 700 });
    s.snap('The second test fails. Python stops on line 5.', { line: 5 });

    s.text('why', 280, 208, 'The function adds 2. It should multiply by 2.', { size: 15 });
    s.snap('Line 6 never runs. The second test found a bug the first one missed.', { line: 5 });
  },
});
