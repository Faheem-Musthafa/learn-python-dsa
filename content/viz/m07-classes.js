/* Visuals for module 7. Names start with the module id. */
(function () {
  /* One attribute inside an object: a small label, then a box with the value. */
  function attr(s, id, cx, y, label, value, tone) {
    s.text(id + 'L', cx - 66, y, label, { size: 14, mono: true });
    s.box(id, cx + 28, y, value, { w: 112, h: 38, tone: tone || 'default' });
  }

  /* A node: a box for the value, joined to a small box for the next pointer. */
  function drawNode(s, id, x, y, value) {
    s.box(id + 'v', x - 19, y, value, { w: 44, h: 44 });
    s.box(id + 'n', x + 27, y, '', { w: 48, h: 44 });
    s.text(id + 'x', x + 27, y, 'None', { size: 12, mono: true, weight: 700 });
  }

  /* Puts an arrow in a node's next box. */
  function link(s, from, to) {
    s.set(from + 'x', { text: '•', size: 22 });
    s.edge(from + 'e', from + 'n', to + 'v');
  }

  // ------------------------------------------------------------- lesson 7.1
  Viz.register('m07-cookie-cutter', {
    title: 'One class makes 2 objects',
    size: [540, 240],
    code: py`
      class Pet:
          def __init__(self, name, age):
              self.name = name
              self.age = age

      a = Pet("Rex", 3)
      b = Pet("Mia", 5)
      print(a.name)
      print(b.age)
    `,
    build(s) {
      const A = 218, B = 430;
      s.box('cutter', 62, 118, 'Pet', { w: 84, h: 70, sub: 'the class' });
      s.snap('Python reads the class. This makes the cutter, not a cookie.', {
        line: 1,
        ask: {
          q: 'Python has read the whole class. How many pets exist now?',
          options: ['0', '1', '2'],
          answer: 0,
          why: 'A class is only the plan. No pet exists until you use the plan.',
        },
      });

      s.area('objA', A - 100, 48, 200, 140, 'a Pet object');
      s.tone('cutter', 'active');
      s.snap('Pet("Rex", 3) uses the cutter. A new, empty object appears.', { line: 6 });

      s.tone('cutter', 'default');
      s.pointer('self', A, 46, 'self', { dir: 'down', tone: 'active' });
      s.snap('Python runs __init__. Here, self means this new object.', { line: 2, vars: { name: '"Rex"', age: 3 } });

      attr(s, 'aName', A, 100, 'name', '"Rex"', 'active');
      s.snap('self.name = name gives the object a name tag, on "Rex".', { line: 3, vars: { name: '"Rex"', age: 3 } });

      s.tone('aName', 'default');
      attr(s, 'aAge', A, 150, 'age', '3', 'active');
      s.snap('self.age = age gives the object an age tag, on 3.', { line: 4, vars: { name: '"Rex"', age: 3 } });

      s.tone('aAge', 'default');
      s.del('self');
      s.pointer('tagA', A, 190, 'a', { dir: 'up' });
      s.snap('__init__ is done. The name a now points at this object.', {
        line: 6,
        ask: {
          q: 'Pet("Mia", 5) runs next. What happens to Rex?',
          options: ['Rex turns into Mia', 'A second object appears. Rex stays.', 'Python shows an error'],
          answer: 1,
          why: 'Each use of the class makes a new object. Old objects keep their values.',
        },
      });

      s.area('objB', B - 100, 48, 200, 140, 'a Pet object');
      s.tone('cutter', 'active');
      s.snap('Pet("Mia", 5) uses the same cutter. A second object appears.', { line: 7 });

      s.tone('cutter', 'default');
      s.pointer('self', B, 46, 'self', { dir: 'down', tone: 'active' });
      s.snap('Python runs __init__ again. Now self means the new object.', { line: 2, vars: { name: '"Mia"', age: 5 } });

      attr(s, 'bName', B, 100, 'name', '"Mia"', 'active');
      s.snap('self.name = name gives the second object a name tag, on "Mia".', { line: 3, vars: { name: '"Mia"', age: 5 } });

      s.tone('bName', 'default');
      attr(s, 'bAge', B, 150, 'age', '5', 'active');
      s.snap('self.age = age gives the second object an age tag, on 5.', { line: 4, vars: { name: '"Mia"', age: 5 } });

      s.tone('bAge', 'default');
      s.del('self');
      s.pointer('tagB', B, 190, 'b', { dir: 'up' });
      s.snap('The name b now points at the second object.', {
        line: 7,
        ask: {
          q: 'print(a.name) runs next. What shows on the screen?',
          options: ['Rex', 'Mia', 'name'],
          answer: 0,
          why: 'The name a points at the first object. Its name attribute is on "Rex".',
        },
      });

      s.tone('aName', 'ok');
      s.snap('a.name goes to object a and reads its name: Rex.', { line: 8, out: 'Rex' });

      s.tone('aName', 'default');
      s.tone('bAge', 'ok');
      s.snap('b.age goes to object b and reads its age: 5.', { line: 9, out: 'Rex\n5' });

      s.tone('bAge', 'default');
      s.snap('One cutter made 2 cookies. Each object keeps its own values.', { line: 9, out: 'Rex\n5' });
    },
  });

  // ------------------------------------------------------------- lesson 7.2
  Viz.register('m07-method-self', {
    title: 'The object before the dot becomes self',
    size: [480, 220],
    code: py`
      class Player:
          def __init__(self, name):
              self.name = name
              self.score = 0

          def add(self, n):
              self.score = self.score + n

      a = Player("Ana")
      b = Player("Ben")
      a.add(5)
      b.add(2)
      a.add(1)
      print(a.score)
    `,
    build(s) {
      const A = 125, B = 355;
      s.area('objA', A - 100, 48, 200, 130, 'object a');
      attr(s, 'aName', A, 96, 'name', '"Ana"');
      attr(s, 'aScore', A, 144, 'score', '0');
      s.area('objB', B - 100, 48, 200, 130, 'object b');
      attr(s, 'bName', B, 96, 'name', '"Ben"');
      attr(s, 'bScore', B, 144, 'score', '0');
      s.snap('Ana and Ben are 2 objects. Both scores start at 0.', {
        line: 10,
        ask: {
          q: 'a.add(5) runs next. Whose score changes?',
          options: ['Only Ana', 'Only Ben', 'Both of them'],
          answer: 0,
          why: 'The object before the dot is the one that does the job.',
        },
      });

      s.pointer('self', A, 46, 'self', { dir: 'down', tone: 'active' });
      s.snap('a.add(5) runs. a is before the dot, so self means a.', { line: 11, vars: { n: 5 } });

      s.set('aScore', { text: '5', tone: 'active' });
      s.snap('self.score goes from 0 to 5. Only this object changes.', {
        line: 7,
        vars: { n: 5 },
        ask: {
          q: 'b.add(2) runs next. What does self mean this time?',
          options: ['a', 'b', 'The class Player'],
          answer: 1,
          why: 'b is before the dot this time, so self means b.',
        },
      });

      s.tone('aScore', 'default');
      s.set('self', { x: B });
      s.snap('b.add(2) runs. Now self means b.', { line: 12, vars: { n: 2 } });

      s.set('bScore', { text: '2', tone: 'active' });
      s.snap('self.score goes from 0 to 2. Ana keeps her 5.', {
        line: 7,
        vars: { n: 2 },
        ask: {
          q: 'a.add(1) runs next. What will the score of a be?',
          options: ['1', '6', '8'],
          answer: 1,
          why: 'a had 5, and 5 + 1 is 6. The 2 points belong to b.',
        },
      });

      s.tone('bScore', 'default');
      s.set('self', { x: A });
      s.snap('a.add(1) runs. self means a again.', { line: 13, vars: { n: 1 } });

      s.set('aScore', { text: '6', tone: 'active' });
      s.snap('self.score goes from 5 to 6.', { line: 7, vars: { n: 1 } });

      s.del('self');
      s.tone('aScore', 'ok');
      s.snap('print shows the score of a: 6.', { line: 14, out: '6' });
    },
  });

  Viz.register('m07-less-than', {
    title: 'Python turns a < b into a method call',
    size: [480, 230],
    code: py`
      class Player:
          def __init__(self, score):
              self.score = score

          def __lt__(self, other):
              return self.score < other.score

      a = Player(7)
      b = Player(2)
      print(a < b)
    `,
    inputs: [
      { key: 'a', label: 'Score of a', type: 'number', value: 7, min: 0, max: 99 },
      { key: 'b', label: 'Score of b', type: 'number', value: 2, min: 0, max: 99 },
    ],
    tryInputs: [{ a: 1, b: 2 }, { a: 3, b: 3 }],
    build(s, p) {
      const A = 125, B = 355;
      const result = p.a < p.b;
      s.area('objA', A - 100, 60, 200, 90, 'object a');
      attr(s, 'aScore', A, 112, 'score', p.a);
      s.area('objB', B - 100, 60, 200, 90, 'object b');
      attr(s, 'bScore', B, 112, 'score', p.b);
      s.snap('You have 2 Player objects. Each one has a score.', { line: 9 });

      s.text('sum', 240, 190, 'a < b', { size: 22, mono: true, weight: 700 });
      s.snap('Python reads a < b. It looks in the class for __lt__.', {
        line: 10,
        ask: {
          q: 'Python calls __lt__. Which object becomes self?',
          options: ['a, on the left', 'b, on the right', 'Neither one'],
          answer: 0,
          why: 'a < b turns into a.__lt__(b). The left object comes before the dot.',
        },
      });

      s.pointer('self', A, 58, 'self', { dir: 'down', tone: 'active' });
      s.snap('The left object, a, becomes self.', { line: 5 });

      s.pointer('other', B, 58, 'other', { dir: 'down', tone: 'active' });
      s.snap('The right object, b, becomes other.', {
        line: 5,
        ask: {
          q: `Python checks ${p.a} < ${p.b}. What comes back?`,
          options: ['True', 'False'],
          answer: result ? 0 : 1,
          why: `${p.a} is ${result ? '' : 'not '}less than ${p.b}, so __lt__ returns ${result ? 'True' : 'False'}.`,
        },
      });

      s.set('sum', { text: `${p.a} < ${p.b}` });
      s.tone(['aScore', 'bScore'], 'active');
      s.snap('The return line reads both scores and compares them.', { line: 6 });

      s.set('sum', { text: `${p.a} < ${p.b} is ${result ? 'True' : 'False'}` });
      s.tone(['aScore', 'bScore'], 'default');
      s.snap(`__lt__ hands back ${result ? 'True' : 'False'}.`, { line: 6 });

      s.del('self', 'other');
      s.snap(`print shows the answer: ${result ? 'True' : 'False'}.`, { line: 10, out: result ? 'True' : 'False' });
    },
  });

  // ------------------------------------------------------------- lesson 7.3
  Viz.register('m07-link-nodes', {
    title: 'Linking 3 nodes into a chain',
    size: [560, 180],
    code: py`
      class Node:
          def __init__(self, value):
              self.value = value
              self.next = None

      a = Node(5)
      b = Node(8)
      c = Node(2)
      a.next = b
      b.next = c
      print(a.next.value)
      print(a.next.next.value)
    `,
    build(s) {
      const y = 104, X = [100, 280, 460];
      const tag = (id, i, label) => s.pointer(id, X[i] - 19, y + 26, label, { dir: 'up' });

      s.text('lblV', X[0] - 19, y - 34, 'value', { size: 13, tone: 'muted' });
      s.text('lblN', X[0] + 22, y - 34, 'next', { size: 13, tone: 'muted' });
      drawNode(s, 'a', X[0], y, 5);
      tag('tagA', 0, 'a');
      s.snap('Node(5) makes a node. Its next box holds None.', { line: 6 });

      drawNode(s, 'b', X[1], y, 8);
      tag('tagB', 1, 'b');
      s.snap('Node(8) makes a second node. It stands alone.', { line: 7 });

      drawNode(s, 'c', X[2], y, 2);
      tag('tagC', 2, 'c');
      s.snap('Node(2) makes a third node. No arrows yet.', {
        line: 8,
        ask: {
          q: 'a.next = b runs next. What goes in the next box of a?',
          options: ['A copy of b', 'An arrow to b', 'The number 8'],
          answer: 1,
          why: 'Nothing gets copied. The next box of a now points at b itself.',
        },
      });

      link(s, 'a', 'b');
      s.tone('ae', 'active');
      s.snap('The next box of a now holds an arrow to b.', { line: 9 });

      s.tone('ae', 'default');
      link(s, 'b', 'c');
      s.tone('be', 'active');
      s.snap('b.next = c adds a second arrow. Now you have a chain.', { line: 10 });

      s.tone('be', 'default');
      s.tone('cx', 'active');
      s.pulse('cn');
      s.snap('c.next is still None. That is how you know the chain ends.', {
        line: 10,
        ask: {
          q: 'print(a.next.value) runs next. What shows?',
          options: ['5', '8', '2'],
          answer: 1,
          why: 'a.next follows one arrow to b, and b holds 8.',
        },
      });

      s.tone('cx', 'default');
      s.pointer('walk', X[0], y - 42, 'start', { dir: 'down', tone: 'active' });
      s.snap('Start at a.', { line: 11 });

      s.set('walk', { x: X[1], text: 'a.next' });
      s.tone('bv', 'ok');
      s.snap('.next follows the arrow to b. .value reads 8.', {
        line: 11,
        out: '8',
        ask: {
          q: 'print(a.next.next.value) runs next. What shows?',
          options: ['5', '8', '2', 'None'],
          answer: 2,
          why: 'Each .next follows one arrow. 2 arrows from a lands on c, and c holds 2.',
        },
      });

      s.tone('bv', 'default');
      s.set('walk', { x: X[0], text: 'start' });
      s.snap('Start at a again.', { line: 12, out: '8' });

      s.set('walk', { x: X[1], text: 'a.next' });
      s.snap('The first .next follows the arrow to b.', { line: 12, out: '8' });

      s.set('walk', { x: X[2], text: 'a.next.next' });
      s.tone('cv', 'ok');
      s.snap('The second .next follows the arrow to c. .value reads 2.', { line: 12, out: '8\n2' });
    },
  });

  Viz.register('m07-walk-chain', {
    title: 'A loop walks the chain to None',
    size: [580, 170],
    code: py`
      node = head
      while node is not None:
          print(node.value)
          node = node.next
      print("Done")
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '5,8,2', size: 12 },
    ],
    tryInputs: [{ values: '7' }, { values: '1,2' }, { values: '4,4,4,4,4' }, { values: '1,2,3,4,5,6,7' }],
    build(s, p) {
      const values = String(p.values).split(',').map(v => v.trim().slice(0, 3)).filter(Boolean).slice(0, 5);
      const n = values.length;
      if (!n) throw new Error('Type at least 1 number, like 5,8,2');

      const gap = Math.min(170, n > 1 ? 440 / (n - 1) : 0);
      const left = 290 - (gap * (n - 1)) / 2;
      const X = values.map((_, i) => left + i * gap);
      const y = 92;

      values.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
      values.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      s.pointer('head', X[0] - 19, y + 26, 'head', { dir: 'up' });
      s.snap('The name head points at the first node. None marks the end.', { out: '' });

      let out = '';
      s.pointer('node', X[0], y - 26, 'node', { dir: 'down', tone: 'active' });
      s.snap('node = head. Now node points at the first node too.', { line: 1, vars: { node: `the ${values[0]} node` }, out });

      values.forEach((v, i) => {
        const here = { node: `the ${v} node` };
        const last = i === n - 1;
        const guess = i > 0 && !last && v !== values[i - 1];
        s.snap('Is node None? No, it points at a node. So the loop goes on.', {
          line: 2,
          vars: here,
          out,
          ask: guess ? {
            q: 'print(node.value) runs next. What shows?',
            options: [v, values[i - 1], 'None'],
            answer: 0,
            why: `node moved along the arrow, so it points at the ${v} node now.`,
          } : null,
        });

        s.tone('n' + i + 'v', 'active');
        out = out ? `${out}\n${v}` : v;
        const askFirst = i === 0 && n > 1;
        s.snap(`print shows the value of this node: ${v}.`, {
          line: 3,
          vars: here,
          out,
          ask: askFirst ? {
            q: 'node = node.next runs next. Where does node go?',
            options: ['To the next node', 'Back to head', 'It stays here'],
            answer: 0,
            why: 'node takes what is in the next box, and that is an arrow to the next node.',
          } : last ? {
            q: 'This next box holds None. What happens at node = node.next?',
            options: ['node becomes None', 'node goes back to head', 'Python shows an error'],
            answer: 0,
            why: 'None is a value, so the tag node can be on it. Nothing breaks yet.',
          } : null,
        });

        s.tone('n' + i + 'v', 'default');
        if (last) {
          s.set('node', { x: X[i] + 22, text: 'node: None', tone: 'bad' });
          s.snap('node takes the None from the last next box. It points at nothing.', {
            line: 4,
            vars: { node: 'None' },
            out,
            ask: {
              q: 'The loop checks again. What does it do now?',
              options: ['It stops', 'It runs once more', 'It starts again at head'],
              answer: 0,
              why: 'node is None now, so the check says stop.',
            },
          });
        } else {
          s.set('node', { x: X[i + 1] });
          s.snap('node follows the arrow to the next node.', { line: 4, vars: { node: `the ${values[i + 1]} node` }, out });
        }
      });

      s.snap('Is node None? Yes. So the loop stops.', { line: 2, vars: { node: 'None' }, out });
      out += '\nDone';
      s.snap('The code after the loop runs. head still points at the first node.', { line: 5, vars: { node: 'None' }, out });
    },
  });
})();
