/* Module 15: Stacks and Queues. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm15-stacks-queues',
  num: 15, part: 2, level: 'I',
  title: 'Stacks and Queues',
  blurb: 'Keep things in a pile or a line, so the right one comes out next.',
  needs: ['m09-arrays', 'm14-linked-lists'],
});

// ---------------------------------------------------------------- lesson 15.1
Course.lesson('m15-stacks-queues', {
  id: '15-1-stack-with-a-list',
  num: '15.1',
  title: 'Stacks: a pile with one open end',
  goal: 'You can use a list as a stack, and check for empty before you pop.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Which plate comes off first?' },
    { t: 'p', text: 'You stack 3 plates: red, then blue, then green. Now you want one plate. You may not lift any plate off another.' },
    { t: 'q', id: 'spark-plate', type: 'mcq', level: 1,
      q: 'Which plate can you take?',
      options: [
        { text: 'Red', why: 'Red went on first, so it sits at the bottom. Blue and green are on it.' },
        { text: 'Blue', why: 'Blue is in the middle. Green is still on top of it.' },
        'Green',
      ],
      answer: 2,
      explain: 'Green went on last, so it is on top. The last plate on is the first plate off.',
      hints: ['Draw the pile. Which plate went on last?'],
    },
    { t: 'words', items: [
      { word: 'stack', means: 'A pile. You add and take from the top only.' },
      { word: 'push', means: 'Put one item on top of a stack.' },
      { word: 'LIFO', means: 'Last in, first out. The newest item leaves first.', say: 'LIE-foe' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[stack]] is a pile of plates. You add to the top, and you take from the top. Unlike real plates, you can never sneak one out of the middle.' },
    { t: 'big', text: 'A stack is [[LIFO]]: the last item in is the first item out.' },
    { t: 'h', text: 'How do you make a stack in Python?' },
    { t: 'p', text: 'Python has no tool called Stack, and you do not need one. A list works well. Touch only its end, and that list acts as a stack.' },
    { t: 'steps', title: 'Use a list as a stack', items: [
      { label: 'Make it', text: 'An empty list is an empty stack.', code: 'stack = []' },
      { label: 'Push', text: 'To [[push]], use `append`. The end of the list is the top.', code: 'stack.append("red")' },
      { label: 'Peek', text: 'Spot -1 is the top. This only looks, so the item stays.', code: 'stack[-1]' },
      { label: 'Pop', text: '`pop` with no number takes the top and hands it back.', code: 'stack.pop()' },
    ] },
    { t: 'viz', name: 'm15-stack-pile', caption: 'Answer each question. Then type your own items and press Enter. Try no items, and try more pops than items.' },
    { t: 'code', caption: 'Run it. Then push one more plate, and guess the output first.',
      code: py`
        stack = []
        stack.append("red")
        stack.append("blue")
        stack.append("green")
        print(stack)
        print(stack[-1])
        print(stack.pop())
        print(stack)
      `,
      output: "['red', 'blue', 'green']\ngreen\ngreen\n['red', 'blue']",
    },
    { t: 'q', id: 'which-is-top', type: 'predict', level: 1,
      q: 'The list goes from left to right. What will the screen show?',
      code: py`
        stack = [4, 7, 9]
        print(stack[-1])
      `,
      options: [
        { text: '4', why: 'You may think spot 0 is the top. Spot 0 is the bottom of the pile.' },
        '9',
        { text: '[4, 7]', why: 'Spot -1 is one item. And peeking takes nothing away.' },
      ],
      answer: 1,
      explain: 'The end of the list is the top of the stack. Spot -1 reads the end.',
      hints: ['Which end does `append` add to?', 'Spot -1 is the last item in the list.'],
    },
    { t: 'q', id: 'push-pop-mix', type: 'predict', level: 2,
      q: 'Follow each line. What will the screen show?',
      code: py`
        s = []
        s.append(1)
        s.append(2)
        s.pop()
        s.append(3)
        print(s)
      `,
      options: [
        '[1, 3]',
        { text: '[2, 3]', why: 'This pops the first item. `pop` takes the last one in, which is 2.' },
        { text: '[1, 2, 3]', why: 'This forgets the pop line. It takes the 2 away.' },
      ],
      answer: 0,
      explain: 'After 2 pushes the stack is [1, 2]. The pop takes the 2. Then the 3 goes on top.',
      hints: ['Write the list again after each line.'],
    },
    { t: 'h', text: 'How much work is a pop?' },
    { t: 'p', text: 'Count before you name it. Picture a stack of 4 items, and one pop.' },
    { t: 'q', id: 'count-the-moves', type: 'mcq', level: 2,
      q: 'A stack holds 4 items. You pop once. How many other items must move?',
      options: [
        '0',
        { text: '3', why: 'That is the cost of `pop(0)`, which takes from the front. `pop()` takes from the end.' },
        { text: '4', why: 'Only one item leaves. The others stay in their spots.' },
      ],
      answer: 0,
      explain: 'Only the end item leaves. The other items stay where they are.',
      hints: ['Which item leaves? Is anything after it in the list?'],
    },
    { t: 'p', text: 'Now try 1,000 items. Still 0 other items move. So the work stays the same, however tall the pile is.' },
    { t: 'cost', title: 'How fast is a list as a stack?', items: [
      { op: 'stack.append(x)', cost: 'O(1)', why: 'Nothing else moves. Now and then the list must find more room. So this O(1) is amortized, as in module 8.' },
      { op: 'stack.pop()', cost: 'O(1)', why: 'Only the end item leaves.' },
      { op: 'stack[-1]', cost: 'O(1)', why: 'Python jumps straight to the last spot.' },
      { op: 'len(stack)', cost: 'O(1)', why: 'The list keeps its own count.' },
    ] },
    { t: 'h', text: 'What if the stack is empty?' },
    { t: 'code', error: true, caption: 'Run it. There is nothing to take, so Python stops.',
      code: py`
        stack = []
        print(stack.pop())
      `,
    },
    { t: 'p', text: '`IndexError` here means: this list has nothing in it to pop. So check the length first. Peeking with `stack[-1]` fails on an empty stack too.' },
    { t: 'code', caption: 'The `if` keeps the empty stack safe. Try it with an item in the stack.',
      code: py`
        stack = []
        if len(stack) > 0:
            print(stack.pop())
        else:
            print("Nothing here")
      `,
      output: 'Nothing here',
    },
    { t: 'q', id: 'order-reverse', type: 'order', level: 2,
      q: 'Items come off in the reverse order. Use that to turn "cat" into "tac". Put the lines in order.',
      lines: [
        'stack = []',
        'for ch in "cat":',
        '    stack.append(ch)',
        'out = ""',
        'while len(stack) > 0:',
        '    out = out + stack.pop()',
        'print(out)',
      ],
      extra: ['    out = out + stack.pop(0)'],
      output: 'tac',
      explain: 'The letters go on as c, a, t. They come off as t, a, c.',
      hints: ['Push all the letters before you pop any.', '`pop(0)` takes the bottom. Which end do you want?'],
    },
    { t: 'trap', think: 'Spot 0 is the top of the stack.',
      real: 'Spot 0 is the bottom. The top is the end of the list. `pop(0)` takes the bottom, and every other item must slide.',
      code: py`
        stack = ["a", "b", "c"]
        stack.pop()    # takes c, the top
        stack.pop(0)   # takes a, the bottom
      `,
    },
    { t: 'h', text: 'Where have you met a stack before?' },
    { t: 'p', text: 'In module 4 you saw the [[call stack]], the pile of unfinished calls. It really is a stack. Each new call goes on top, and the top call must end first.' },
    { t: 'viz', name: 'm15-call-pile', caption: 'Pick a function to start with. Each call is a plate on the same pile.' },
    { t: 'tip', title: 'How to spot a stack', text: 'Look for words like "most recent", "go back", "undo" or "matching pairs". They mean the newest thing matters first.' },
  ],
  recap: [
    'You can push with append and pop from the end.',
    'You can say the last one in leaves first.',
    'You can check for empty before you pop.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word with its meaning.',
      pairs: [
        ['[[stack]]', 'A pile with one open end'],
        ['[[push]]', 'Put one item on top'],
        ['`pop()`', 'Take the top item and hand it back'],
        ['[[LIFO]]', 'The last one in leaves first'],
      ],
      explain: 'These words will come back in module 16, when you study the call stack.',
      hints: ['Start with the word you know best.'],
    },
    { id: 'peek-after-pop', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        s = [1]
        s.append(2)
        s.append(3)
        s.pop()
        print(s[-1])
      `,
      answer: '2',
      explain: 'The pop takes the 3 away. So the 2 is on top now.',
      hints: ['What is the list after the pop line?'],
    },
    { id: 'two-pops', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        s = []
        for n in [1, 2, 3]:
            s.append(n)
        print(s.pop(), s.pop())
      `,
      options: [
        { text: '1 2', why: 'That is the order they went on. A stack gives the newest item first.' },
        { text: '3 3', why: 'You may think pop only looks. It takes the item out, so the next pop gets a new one.' },
        '3 2',
      ],
      answer: 2,
      explain: 'The first pop takes the 3. The second pop takes the next top, which is 2.',
      hints: ['Which number went on last?', 'Does a pop leave the item there?'],
    },
    { id: 'fix-wrong-end', type: 'fix', level: 2,
      q: 'This stack should give back its top item, c. It gives the bottom one. Fix it.',
      code: py`
        stack = ["a", "b", "c"]
        top = stack.pop(0)
        print(top)
        print(stack)
      `,
      answer: py`
        stack = ["a", "b", "c"]
        top = stack.pop()
        print(top)
        print(stack)
      `,
      wantOutput: "c\n['a', 'b']",
      explain: '`pop()` with no number takes the end of the list. The end is the top.',
      hints: ['Which spot is the top of a stack?', 'Take the number out of the brackets.'],
    },
    { id: 'reverse-text', type: 'write', level: 2,
      q: 'Write `reverse_text(text)`. Push every letter on a stack, then pop them all to build the new string.',
      starter: py`
        def reverse_text(text):
            stack = []
            # Your code here.
            return ""
      `,
      answer: py`
        def reverse_text(text):
            stack = []
            for ch in text:
                stack.append(ch)
            out = ""
            while len(stack) > 0:
                out = out + stack.pop()
            return out
      `,
      tests: [
        { label: 'reverse_text("abc")', call: 'reverse_text("abc")', want: '"cba"' },
        { label: 'reverse_text("noon")', call: 'reverse_text("noon")', want: '"noon"' },
        { label: 'reverse_text("x")', call: 'reverse_text("x")', want: '"x"' },
        { label: 'reverse_text("")', call: 'reverse_text("")', want: '""' },
      ],
      explain: 'The last letter in is the first letter out. So the string comes out in reverse.',
      hints: ['Use one loop to push and a second loop to pop.', 'Loop while `len(stack) > 0`.'],
    },
    { id: 'safe-pop', type: 'write', level: 2,
      q: 'Write `safe_pop(stack)`. It pops and gives back the top item. If the stack is empty, it gives back `None`.',
      starter: py`
        def safe_pop(stack):
            # Your code here.
            return None
      `,
      answer: py`
        def safe_pop(stack):
            if len(stack) > 0:
                return stack.pop()
            return None
      `,
      tests: [
        { label: 'safe_pop([1, 2])', call: 'safe_pop([1, 2])', want: '2' },
        { label: 'safe_pop([])', call: 'safe_pop([])', want: 'None' },
        { label: 'The item really leaves', check: '(lambda s: (safe_pop(s), s)[1] == [1])([1, 2])' },
      ],
      explain: 'The `if` checks the length first. So `pop` never runs on an empty list.',
      hints: ['Check the length before you pop.', 'A function can use `return` in two places.'],
    },
    { id: 'stack-class', type: 'write', level: 3,
      q: 'Stretch: finish the class `Stack`. `pop` and `peek` give back `None` when it is empty. Only `peek` leaves the item there.',
      starter: py`
        class Stack:
            def __init__(self):
                self.items = []

            def push(self, x):
                pass

            def pop(self):
                pass

            def peek(self):
                pass
      `,
      answer: py`
        class Stack:
            def __init__(self):
                self.items = []

            def push(self, x):
                self.items.append(x)

            def pop(self):
                if len(self.items) == 0:
                    return None
                return self.items.pop()

            def peek(self):
                if len(self.items) == 0:
                    return None
                return self.items[-1]
      `,
      tests: [
        { label: 'Pop gives the newest item', check: '(lambda s: (s.push(1), s.push(2), s.pop())[2] == 2)(Stack())' },
        { label: 'Peek leaves the item there', check: '(lambda s: (s.push(5), s.peek(), s.peek())[2] == 5)(Stack())' },
        { label: 'Pop on empty gives None', check: 'Stack().pop() is None' },
        { label: 'Peek on empty gives None', check: 'Stack().peek() is None' },
        { label: 'Pop takes the item out', check: '(lambda s: (s.push(5), s.pop(), s.pop())[2] is None)(Stack())' },
      ],
      explain: 'The class keeps a list inside and allows only the top to be touched. Code that uses it cannot reach the middle.',
      hints: ['Each method uses `self.items`.', '`push` is one `append` line.', 'Check the length before you pop or peek.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 15.2
Course.lesson('m15-stacks-queues', {
  id: '15-2-queue-and-deque',
  num: '15.2',
  title: 'Queues: first in, first out',
  goal: 'You can serve a line with a deque, and say why pop(0) gets slow.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Who gets served first?' },
    { t: 'p', text: 'Ann joins the canteen line. Then Bo joins, and then Cy. The cook is ready for one person.' },
    { t: 'q', id: 'spark-line', type: 'mcq', level: 1,
      q: 'Who does the cook serve first?',
      options: [
        'Ann',
        { text: 'Bo', why: 'Bo is in the middle. Ann has waited longer.' },
        { text: 'Cy', why: 'That would be a stack, where the newest leaves first. A line is the other way round.' },
      ],
      answer: 0,
      explain: 'Ann came first, so Ann is served first. This is fair, and it is how a line works.',
      hints: ['Who has waited the longest?'],
    },
    { t: 'words', items: [
      { word: 'queue', means: 'A line. The first to join is the first to leave.', say: 'KYOO' },
      { word: 'FIFO', means: 'First in, first out. The oldest item leaves first.', say: 'FIE-foe' },
      { word: 'deque', means: 'A line with 2 open ends. You can add or take at either end.', say: 'DECK' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[queue]] is the line at the school canteen. New people join at the back. The front person is served next. Unlike a real line, nobody pushes in, and nobody gives up and leaves.' },
    { t: 'big', text: 'A queue is [[FIFO]]: the first item in is the first item out.' },
    { t: 'h', text: 'Can a list be a queue?' },
    { t: 'p', text: 'Yes, it can. `append` adds at the back, and `pop(0)` takes from the front. Run it, and the answers are right.' },
    { t: 'code', caption: 'It works. So where is the trap? Keep reading.',
      code: py`
        line = []
        line.append("Ann")
        line.append("Bo")
        line.append("Cy")
        print(line.pop(0))
        print(line)
      `,
      output: "Ann\n['Bo', 'Cy']",
    },
    { t: 'p', text: 'The trap is hidden inside `pop(0)`. In module 9, you saw the items shift left. Now count those moves by hand.' },
    { t: 'viz', name: 'm15-pop-front', caption: 'Count the slides before you press on. Then try 1 person, and try 6.' },
    { t: 'q', id: 'race-five', type: 'mcq', level: 2,
      q: 'A list holds 5 people. You serve them all with `pop(0)`. How many slides in all?',
      options: [
        { text: '4', why: 'That is only the first `pop(0)`. Each later serve slides the rest again.' },
        '10',
        { text: '25', why: 'That is 5 times 5. The line gets shorter each time, so it is about half of that.' },
      ],
      answer: 1,
      explain: 'The serves slide 4, then 3, then 2, then 1, then 0 people. That adds up to 10.',
      hints: ['The first serve slides 4 people. How many does the next serve slide?', 'Add 4 + 3 + 2 + 1 + 0.'],
    },
    { t: 'code', caption: 'This counts slides, not seconds, so you get the same answer every time. Add a bigger line.',
      code: py`
        def slides_to_empty(n):
            slides = 0
            while n > 0:
                n = n - 1
                slides = slides + n
            return slides

        for n in [4, 100, 200, 1000]:
            print(n, slides_to_empty(n))
      `,
      output: '4 6\n100 4950\n200 19900\n1000 499500',
    },
    { t: 'p', text: 'Look at 100 and 200. Twice the people gives about 4 times the slides. One `pop(0)` is O(n), so serving everyone is O(n^2).' },
    { t: 'h', text: 'What does deque change?' },
    { t: 'p', text: 'Python has a tool built for this. Inside, a [[deque]] is a chain of linked blocks, like the [[linked list]] in module 14. To serve someone, it moves its front marker. No item slides.' },
    { t: 'steps', title: 'Use a deque as a queue', items: [
      { label: 'Bring it in', text: 'It lives in the `collections` module, like `Counter`.', code: 'from collections import deque' },
      { label: 'Make the line', text: 'Round brackets call it. Nothing is in the line yet.', code: 'line = deque()' },
      { label: 'Join at the back', text: '`append` adds at the back, as with a list.', code: 'line.append("Ann")' },
      { label: 'Serve the front', text: '`popleft` takes the front item and hands it back.', code: 'line.popleft()' },
    ] },
    { t: 'viz', name: 'm15-deque-line', caption: 'The moves stay at 0. Then type your own names. Try nobody, one person, and more serves than people.' },
    { t: 'code', caption: 'Spot 0 is the front, and spot -1 is the back. Add a new name, then guess the output.',
      code: py`
        from collections import deque

        line = deque()
        line.append("Ann")
        line.append("Bo")
        line.append("Cy")
        print(line)
        print(line[0])
        print(line.popleft())
        print(len(line))
      `,
      output: "deque(['Ann', 'Bo', 'Cy'])\nAnn\nAnn\n2",
    },
    { t: 'q', id: 'pile-or-line', type: 'predict', level: 2,
      q: 'A stack and a queue are not the same thing. Both get 1, 2, 3 in that order. What will the screen show?',
      code: py`
        from collections import deque

        stack = [1, 2, 3]
        line = deque([1, 2, 3])
        print(stack.pop())
        print(line.popleft())
      `,
      options: [
        { text: '1\n1', why: 'You may think a stack and a queue act alike. A stack gives the newest item first.' },
        { text: '3\n3', why: '`popleft` takes from the front of the line. That is the 1.' },
        '3\n1',
      ],
      answer: 2,
      explain: 'The stack gives its newest item, 3. The queue gives its oldest item, 1.',
      hints: ['Which item is on top of the stack?', 'Which item is at the front of the line?'],
    },
    { t: 'q', id: 'fill-popleft', type: 'fill', level: 2,
      q: 'Fill the gap so the front person is served.',
      code: 'from collections import deque\nline = deque(["Mo", "Pat"])\nprint(line.____())',
      blanks: ['popleft'],
      output: 'Mo',
      explain: '`popleft` takes from the left end, which is the front of the line.',
      hints: ['The word says which side it takes from.'],
    },
    { t: 'cost', title: 'List or deque?', items: [
      { op: 'list.pop(0)', cost: 'O(n)', why: 'Every other item slides one spot.' },
      { op: 'list.insert(0, x)', cost: 'O(n)', why: 'Every item slides to make room.' },
      { op: 'deque.append(x)', cost: 'O(1)', why: 'It adds at the back, and nothing slides.' },
      { op: 'deque.popleft()', cost: 'O(1)', why: 'It takes the front, and nothing slides.' },
      { op: 'd[0] and d[-1]', cost: 'O(1)', why: 'The deque knows both ends.' },
      { op: 'd[i] in the middle', cost: 'O(n)', why: 'It must walk along the chain. A list is better for this.' },
    ] },
    { t: 'trap', think: '`line.pop()` serves the front of a deque, or I can write `line.pop(0)`.',
      real: 'On a deque, `pop()` takes the back. It takes no number, so `pop(0)` makes Python stop. Use `popleft()` to serve.',
      code: py`
        line = deque([1, 2, 3])
        line.pop()      # takes 3, the back
        line.popleft()  # takes 1, the front
      `,
    },
    { t: 'tip', title: 'Is pop(0) always bad?', text: 'For a line of 5 people, `pop(0)` does very little work. The trouble comes with long lines. A deque costs you one import line, so use it for any real queue.' },
    { t: 'tip', title: 'How to spot a queue', text: 'Look for "first come, first served", "take turns" or "in the order they arrive". Later you will also see "level by level" and "minimum moves".' },
  ],
  recap: [
    'You can join with append and serve with popleft.',
    'You can say why pop(0) slides everyone.',
    'You can tell a stack from a queue.',
  ],
  practice: [
    { id: 'match-tools', type: 'match', level: 1,
      q: 'Match each line of code with its cost.',
      pairs: [
        ['`line.pop(0)` on a list', 'O(n), everyone slides'],
        ['`line.popleft()` on a deque', 'O(1), takes the front'],
        ['`d[2]` deep inside a long deque', 'O(n), walks along the chain'],
      ],
      explain: 'A list is good at any spot but slow at the front. A deque is good at both ends but slow in the middle.',
      hints: ['Which one has to slide every other item?'],
    },
    { id: 'which-end', type: 'mcq', level: 1,
      q: 'A queue of tickets is printed in the order people asked. Which item should print next?',
      options: [
        'The oldest ticket',
        { text: 'The newest ticket', why: 'That is how a stack works. A queue is first in, first out.' },
        { text: 'The ticket in the middle', why: 'A queue lets items leave from the front only.' },
      ],
      answer: 0,
      explain: 'A queue is [[FIFO]]. The ticket that came first has waited longest, so it goes next.',
      hints: ['Think of the canteen line.'],
    },
    { id: 'trace-line', type: 'predict', level: 2,
      q: 'Type what the screen will show.',
      code: py`
        from collections import deque

        q = deque()
        q.append(5)
        q.append(6)
        q.popleft()
        q.append(7)
        print(q[0])
      `,
      answer: '6',
      explain: 'The popleft takes the 5. That leaves 6 at the front and 7 at the back.',
      hints: ['Write down the line after each row of code.', 'Spot 0 is the front.'],
    },
    { id: 'fix-served-last', type: 'fix', level: 2,
      q: 'The line should serve Ann first. It serves Cy first. Fix one line.',
      code: py`
        from collections import deque

        line = deque(["Ann", "Bo", "Cy"])
        print(line.pop())
      `,
      answer: py`
        from collections import deque

        line = deque(["Ann", "Bo", "Cy"])
        print(line.popleft())
      `,
      wantOutput: 'Ann',
      explain: 'On a deque, `pop()` takes the back. `popleft()` takes the front.',
      hints: ['Which end does `pop()` take from?', 'Use the tool named after the left side.'],
    },
    { id: 'serve-all', type: 'write', level: 2,
      q: 'Write `serve_all(names)`. Use a deque. It gives back a list of the names in the order they were served.',
      starter: py`
        from collections import deque

        def serve_all(names):
            line = deque(names)
            served = []
            # Your code here.
            return []
      `,
      answer: py`
        from collections import deque

        def serve_all(names):
            line = deque(names)
            served = []
            while len(line) > 0:
                served.append(line.popleft())
            return served
      `,
      tests: [
        { label: 'Three names', call: 'serve_all(["a", "b", "c"])', want: '["a", "b", "c"]' },
        { label: 'One name', call: 'serve_all(["a"])', want: '["a"]' },
        { label: 'The same name twice', call: 'serve_all(["a", "a"])', want: '["a", "a"]' },
        { label: 'Nobody', call: 'serve_all([])', want: '[]' },
      ],
      explain: 'The loop runs until the line is empty. Each trip moves the front name to the end of served.',
      hints: ['Loop while `len(line) > 0`.', 'Each trip: take with `popleft`, and add it to `served`.'],
    },
    { id: 'recent-calls', type: 'write', level: 2,
      q: 'Phone calls come in at the times in a list, in order. For each call, count the calls in the last 10 seconds, itself too. A call exactly 10 seconds old still counts. Write `recent(times)`.',
      starter: py`
        from collections import deque

        def recent(times):
            line = deque()
            counts = []
            for t in times:
                line.append(t)
                # Your code here.
            return counts
      `,
      answer: py`
        from collections import deque

        def recent(times):
            line = deque()
            counts = []
            for t in times:
                line.append(t)
                while line[0] < t - 10:
                    line.popleft()
                counts.append(len(line))
            return counts
      `,
      tests: [
        { label: 'recent([1, 5, 11, 12, 30])', call: 'recent([1, 5, 11, 12, 30])', want: '[1, 2, 3, 3, 1]' },
        { label: 'recent([2])', call: 'recent([2])', want: '[1]' },
        { label: 'recent([])', call: 'recent([])', want: '[]' },
        { label: 'Calls at the same time', call: 'recent([4, 4, 4])', want: '[1, 2, 3]' },
      ],
      explain: 'Old calls sit at the front of the line. So you drop them from the front until the front is recent enough.',
      hints: ['A call at time 1 still counts at time 11, but not at time 12.', 'Use `while line[0] < t - 10:` to drop the old ones.', 'After that, `len(line)` is the count.'],
    },
    { id: 'two-stacks', type: 'write', level: 3,
      q: 'Stretch: make a queue with 2 stacks. `join` pushes on `inbox`. `leave` pops from `outbox`. When `outbox` is empty, pour `inbox` into it first. If both are empty, give back `None`.',
      starter: py`
        class Line:
            def __init__(self):
                self.inbox = []
                self.outbox = []

            def join(self, x):
                pass

            def leave(self):
                pass
      `,
      answer: py`
        class Line:
            def __init__(self):
                self.inbox = []
                self.outbox = []

            def join(self, x):
                self.inbox.append(x)

            def leave(self):
                if len(self.outbox) == 0:
                    while len(self.inbox) > 0:
                        self.outbox.append(self.inbox.pop())
                if len(self.outbox) == 0:
                    return None
                return self.outbox.pop()
      `,
      tests: [
        { label: 'First in is first out', check: '(lambda q: (q.join(1), q.join(2), q.leave())[2] == 1)(Line())' },
        { label: 'Then the next one', check: '(lambda q: (q.join(1), q.join(2), q.leave(), q.leave())[3] == 2)(Line())' },
        { label: 'Join between leaves', check: '(lambda q: (q.join(1), q.join(2), q.leave(), q.join(3), q.leave(), q.leave())[4:] == (2, 3))(Line())' },
        { label: 'Empty gives None', check: 'Line().leave() is None' },
      ],
      explain: 'Pouring one stack into another reverses the order. So the oldest item ends up on top. Each item moves at most twice, so the total work stays small.',
      hints: ['What happens to the order when you pop everything from one stack into another?', 'Pour only when `outbox` is empty, or the order gets mixed up.', 'Check `outbox` a second time, in case the line is empty.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 15.3
Course.lesson('m15-stacks-queues', {
  id: '15-3-classic-uses',
  num: '15.3',
  title: 'At work: brackets, undo and taking turns',
  goal: 'You can check brackets, undo a change, and act out a line of people.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Can you check brackets by counting?' },
    { t: 'p', text: 'Every opening bracket needs a closing partner. A friend has a rule: count both kinds, and if the counts match, all is well.' },
    { t: 'q', id: 'spark-count', type: 'mcq', level: 1,
      q: 'Which text shows that the rule fails? The counts match, but the text is not fine.',
      options: [
        { text: '`()`', why: 'This text really is fine, so the rule gets it right.' },
        '`)(`',
        { text: '`(()`', why: 'The counts differ here, so the rule catches it. It gets this one right.' },
      ],
      answer: 1,
      explain: '`)(` has one of each, so the counts match. But the first `)` has nothing to close.',
      hints: ['Read each text from left to right.', 'Can a closing bracket come before its partner?'],
    },
    { t: 'words', items: [
      { word: 'balanced', means: 'Every opening bracket has a closing partner, in the right order.', say: 'BAL-unst' },
      { word: 'simulate', means: 'Act out a real thing in code, one step at a time.', say: 'SIM-yoo-late' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Each opening bracket is a plate on the pile. A closing bracket must match the plate on top. Unlike real plates, each one gets checked as it comes off.' },
    { t: 'steps', title: 'The bracket rule', items: [
      { label: 'Opening bracket', text: 'Push it. It waits for its partner.', code: 'stack.append(ch)' },
      { label: 'Closing bracket, empty stack', text: 'Nothing is open, so the answer is False.', code: 'if len(stack) == 0:\n    return False' },
      { label: 'Closing bracket, items waiting', text: 'Pop the top. If it is not the partner, the answer is False.', code: 'top = stack.pop()\nif pairs[ch] != top:\n    return False' },
      { label: 'End of the text', text: 'The text is [[balanced]] only if the stack is empty.', code: 'return len(stack) == 0' },
    ] },
    { t: 'viz', name: 'm15-brackets', caption: 'Type your own text and press Enter. Try nothing at all, then `)`, `(((` and `([)]`.' },
    { t: 'code', caption: 'These are the hard cases. Add your own, and guess each answer first.',
      code: py`
        pairs = {")": "(", "]": "[", "}": "{"}

        def balanced(text):
            stack = []
            for ch in text:
                if ch in "([{":
                    stack.append(ch)
                elif ch in ")]}":
                    if len(stack) == 0:
                        return False
                    top = stack.pop()
                    if pairs[ch] != top:
                        return False
            return len(stack) == 0

        print(balanced("{[()]}"))
        print(balanced(""))
        print(balanced(")"))
        print(balanced("((("))
        print(balanced("([)]"))
        print(balanced("a(b)c"))
      `,
      output: 'True\nTrue\nFalse\nFalse\nFalse\nTrue',
    },
    { t: 'table', caption: 'The corner cases', head: ['Text', 'Answer', 'Why'], rows: [
      ['empty', 'True', 'Nothing is left open.'],
      ['`)`', 'False', 'The stack is empty, so it has no partner.'],
      ['`(((`', 'False', 'The stack is not empty at the end.'],
      ['`([)]`', 'False', 'The top is `[`, so `)` does not match it.'],
      ['`a(b)c`', 'True', 'Other characters get skipped.'],
    ] },
    { t: 'q', id: 'trace-brackets', type: 'trace', level: 2,
      q: 'Follow the code on the text `([])`. Write what the stack holds after each character. Use - for an empty stack.',
      code: py`
        stack = []
        for ch in "([])":
            if ch in "([":
                stack.append(ch)
            else:
                stack.pop()
      `,
      head: ['ch', 'stack'],
      rows: [['(', '('], ['[', '(['], [']', '('], [')', '-']],
      given: 1,
      verify: 'stack = []\nfor ch in "([])":\n    if ch in "([":\n        stack.append(ch)\n    else:\n        stack.pop()\n    print(ch, "".join(stack) or "-")',
      explain: 'Each opening bracket goes on. Each closing bracket takes the top off. The stack ends empty.',
      hints: ['Opening brackets go on the stack.', 'Closing brackets take the top off.'],
    },
    { t: 'q', id: 'count-bracket-steps', type: 'mcq', level: 2,
      q: 'Count by hand on `(())`. How many pushes and pops does the code make in all?',
      options: [
        { text: '2', why: 'That counts only the pushes. Each closing bracket makes a pop too.' },
        '4',
        { text: '16', why: 'That is 4 times 4. The code reads each character once, so there is no second loop.' },
      ],
      answer: 1,
      explain: 'There are 2 pushes and 2 pops. Each character makes one push or one pop, so 4 characters make 4.',
      hints: ['Go through the 4 characters. What does each one do?'],
    },
    { t: 'q', id: 'fix-left-open', type: 'fix', level: 2,
      q: 'This code says `(((` is fine. Find the bug and fix it.',
      code: py`
        def balanced(text):
            stack = []
            for ch in text:
                if ch == "(":
                    stack.append(ch)
                elif ch == ")":
                    if len(stack) == 0:
                        return False
                    stack.pop()
            return True
      `,
      answer: py`
        def balanced(text):
            stack = []
            for ch in text:
                if ch == "(":
                    stack.append(ch)
                elif ch == ")":
                    if len(stack) == 0:
                        return False
                    stack.pop()
            return len(stack) == 0
      `,
      tests: [
        { label: 'balanced("(((")', call: 'balanced("(((")', want: 'False' },
        { label: 'balanced("(())")', call: 'balanced("(())")', want: 'True' },
        { label: 'balanced(")")', call: 'balanced(")")', want: 'False' },
        { label: 'balanced("")', call: 'balanced("")', want: 'True' },
      ],
      explain: 'Items left on the stack are brackets that never closed. So the last line must check that the stack is empty.',
      hints: ['What is left on the stack after `(((`?', 'Change the last line.'],
    },
    { t: 'trap', think: 'If both kinds of bracket have equal counts, the text is fine.',
      real: 'Order matters too. `([)]` has equal counts of each kind, but the brackets cross. Only a stack sees that.',
      code: py`
        text = "([)]"
        a = text.count("(")
        b = text.count(")")
        print(a == b)          # True
        print(balanced(text))  # False
      `,
    },
    { t: 'h', text: 'How does undo work?' },
    { t: 'p', text: 'Before each change, the program saves the old text on a stack. Undo pops the newest save and puts it back. The newest change is the first to go.' },
    { t: 'viz', name: 'm15-undo', caption: 'Type a word and pick a number of undos. Try more undos than letters.' },
    { t: 'code', caption: 'Try 2 undos in a row. Which text comes back?',
      code: py`
        text = "Hi"
        history = []

        history.append(text)
        text = text + " there"
        print(text)

        history.append(text)
        text = text + " pal"
        print(text)

        text = history.pop()
        print(text)
      `,
      output: 'Hi there\nHi there pal\nHi there',
    },
    { t: 'h', text: 'How do you act out a line?' },
    { t: 'p', text: 'Some children share one ice cream server. Each gets 1 scoop per turn. Anyone who wants more goes to the back.' },
    { t: 'p', text: 'A [[queue]] can [[simulate]] this with 2 moves: take from the front, then maybe add at the back.' },
    { t: 'viz', name: 'm15-line-sim', caption: 'Type how many scoops each child wants. Who finishes first? Check the count of turns.' },
    { t: 'q', id: 'who-finishes', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        from collections import deque

        kids = [["A", 1], ["B", 2], ["C", 1]]
        line = deque(kids)
        while len(line) > 0:
            kid = line.popleft()
            kid[1] = kid[1] - 1
            if kid[1] > 0:
                line.append(kid)
            else:
                print(kid[0], "done")
      `,
      options: [
        { text: 'A done\nB done\nC done', why: 'You may think B stays at the front until done. B goes to the back after 1 scoop.' },
        'A done\nC done\nB done',
        { text: 'C done\nB done\nA done', why: 'That is the order a stack would give. A queue starts from the front.' },
      ],
      answer: 1,
      explain: 'A is done after one turn. B goes to the back. C is done next, and then B has the last turn.',
      hints: ['Write the line down after each trip of the loop.'],
    },
    { t: 'cost', title: 'How much work is each job?', items: [
      { op: 'balanced(text)', cost: 'O(n)', why: 'Each character makes at most one push or pop. A stack of `(((` needs O(n) memory too.' },
      { op: 'One undo', cost: 'O(1)', why: 'It is one pop from the end of a list.' },
      { op: 'One turn in the line', cost: 'O(1)', why: 'It is one `popleft` and maybe one `append` on a deque.' },
    ] },
    { t: 'tip', title: 'Stack or queue?', text: 'Does the newest thing go first? Think brackets, undo and "go back". Use a stack. Does the oldest thing go first? Think turns and "first come, first served". Use a queue.' },
  ],
  recap: [
    'You can check brackets with a stack.',
    'You can undo a change by popping a save.',
    'You can act out a line with a deque.',
  ],
  practice: [
    { id: 'pick-the-tool', type: 'match', level: 1,
      q: 'Match each job with the right tool.',
      pairs: [
        ['Check that brackets open and close in order', 'Stack: match the newest open bracket'],
        ['Print pages in the order people asked', 'Queue: oldest job first'],
        ['Go back one page in a web browser', 'Stack: newest page first'],
      ],
      explain: 'A stack helps when the newest thing goes first. A queue helps when the oldest thing goes first.',
      hints: ['Does the newest or the oldest thing go first?'],
    },
    { id: 'which-balanced', type: 'mcq', level: 1,
      q: 'Which text is balanced?',
      options: [
        { text: '`{[}]`', why: 'The counts are equal, but the brackets cross. `}` comes while `[` is on top.' },
        { text: '`{{}`', why: 'One `{` never closes, so the stack is not empty at the end.' },
        '`{[]}`',
        { text: '`}{`', why: 'The first `}` has nothing to close. The stack is empty when it arrives.' },
      ],
      answer: 2,
      explain: 'The `[` closes first, then the `{`. The stack is empty at the end.',
      hints: ['Act out the stack for each one.'],
    },
    { id: 'undo-twice', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        history = ["", "a", "ab"]
        text = "abc"
        text = history.pop()
        text = history.pop()
        print(text)
      `,
      options: [
        { text: 'ab', why: 'That is after one undo. The second pop goes one step further back.' },
        'a',
        { text: 'abc', why: 'The name text changes on each pop. So it does not stay as abc.' },
      ],
      answer: 1,
      explain: 'The first pop gives "ab". The second pop gives "a", the next save down.',
      hints: ['Which save is on top at the start?'],
    },
    { id: 'fix-empty-stack', type: 'fix', level: 2,
      q: 'This code stops with an `IndexError` on the text `)`. It should give back False. Fix it.',
      code: py`
        def balanced(text):
            stack = []
            for ch in text:
                if ch == "(":
                    stack.append(ch)
                elif ch == ")":
                    stack.pop()
            return len(stack) == 0
      `,
      answer: py`
        def balanced(text):
            stack = []
            for ch in text:
                if ch == "(":
                    stack.append(ch)
                elif ch == ")":
                    if len(stack) == 0:
                        return False
                    stack.pop()
            return len(stack) == 0
      `,
      tests: [
        { label: 'balanced(")")', call: 'balanced(")")', want: 'False' },
        { label: 'balanced("())")', call: 'balanced("())")', want: 'False' },
        { label: 'balanced("(())")', call: 'balanced("(())")', want: 'True' },
        { label: 'balanced("(")', call: 'balanced("(")', want: 'False' },
      ],
      explain: 'A closing bracket with an empty stack has no partner. So check the length before the pop.',
      hints: ['What is in the stack when `)` comes first?', 'Add an `if` before the pop line.'],
    },
    { id: 'type-out', type: 'write', level: 2,
      q: 'Write `type_out(keys)`. Each key is a letter to add, or "UNDO" to take back the last letter added. Give back the text. An undo with nothing to undo does nothing.',
      starter: py`
        def type_out(keys):
            stack = []
            # Your code here.
            return ""
      `,
      answer: py`
        def type_out(keys):
            stack = []
            for key in keys:
                if key == "UNDO":
                    if len(stack) > 0:
                        stack.pop()
                else:
                    stack.append(key)
            return "".join(stack)
      `,
      tests: [
        { label: 'a, b, UNDO, c', call: 'type_out(["a", "b", "UNDO", "c"])', want: '"ac"' },
        { label: 'No keys', call: 'type_out([])', want: '""' },
        { label: 'Only UNDO', call: 'type_out(["UNDO", "UNDO"])', want: '""' },
        { label: 'x, UNDO, UNDO, y', call: 'type_out(["x", "UNDO", "UNDO", "y"])', want: '"y"' },
      ],
      explain: 'The stack holds the letters so far. Undo pops the newest one, and `join` glues the rest together.',
      hints: ['Push each letter. Pop on "UNDO".', 'Check the length before you pop.', '`"".join(stack)` makes one string.'],
    },
    { id: 'write-balanced', type: 'write', level: 2,
      q: 'Now write the whole `balanced(text)` yourself, for all 3 kinds of bracket. Other characters get skipped.',
      starter: py`
        pairs = {")": "(", "]": "[", "}": "{"}

        def balanced(text):
            stack = []
            # Your code here.
            return False
      `,
      answer: py`
        pairs = {")": "(", "]": "[", "}": "{"}

        def balanced(text):
            stack = []
            for ch in text:
                if ch in "([{":
                    stack.append(ch)
                elif ch in pairs:
                    if len(stack) == 0:
                        return False
                    if stack.pop() != pairs[ch]:
                        return False
            return len(stack) == 0
      `,
      tests: [
        { label: 'Empty text', call: 'balanced("")', want: 'True' },
        { label: 'Nested', call: 'balanced("{[()]}")', want: 'True' },
        { label: 'Crossed', call: 'balanced("([)]")', want: 'False' },
        { label: 'Only closing', call: 'balanced("))")', want: 'False' },
        { label: 'Left open', call: 'balanced("((")', want: 'False' },
        { label: 'Other characters', call: 'balanced("f(a[1])")', want: 'True' },
      ],
      explain: 'Push the opening ones. For a closing one, pop and compare. At the end, the stack must be empty.',
      hints: ['Follow the 4 steps of the bracket rule.', '`pairs[ch]` gives the partner of a closing bracket.'],
    },
    { id: 'last-standing', type: 'write', level: 3,
      q: 'Stretch: children sit in a ring and count to k. On each count, the front child moves to the back. On k, that child leaves. Write `last_child(names, k)`. Give back the final child.',
      starter: py`
        from collections import deque

        def last_child(names, k):
            line = deque(names)
            # Your code here.
            return None
      `,
      answer: py`
        from collections import deque

        def last_child(names, k):
            line = deque(names)
            while len(line) > 1:
                for count in range(k - 1):
                    line.append(line.popleft())
                line.popleft()
            return line[0]
      `,
      tests: [
        { label: 'k is 2, with 3 children', call: 'last_child(["a", "b", "c"], 2)', want: '"c"' },
        { label: 'k is 1: the front child always leaves', call: 'last_child(["a", "b", "c"], 1)', want: '"c"' },
        { label: 'k is 3, with 4 children', call: 'last_child(["a", "b", "c", "d"], 3)', want: '"a"' },
        { label: 'One child', call: 'last_child(["a"], 5)', want: '"a"' },
      ],
      explain: 'The queue acts out the ring. Moving the front to the back is one count. The child on k leaves for good.',
      hints: ['Keep going while more than 1 child is left.', 'Move k - 1 children to the back, one at a time.', 'Then the front child leaves.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 15.4
Course.lesson('m15-stacks-queues', {
  id: '15-4-monotonic-stack',
  num: '15.4',
  title: 'Monotonic stack: the next bigger number',
  goal: 'You can find the next bigger number for every item in O(n) steps, using a stack.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What is the next bigger number?' },
    { t: 'p', text: 'Here is a row of numbers: 3, 1, 2, 5. For each one, look to its right. Find the first number that is bigger. If there is none, write -1.' },
    { t: 'q', id: 'spark-next', type: 'mcq', level: 1,
      q: 'What is the answer list for `[3, 1, 2, 5]`?',
      options: [
        { text: '`[5, 5, 5, -1]`', why: 'This takes the biggest number. You want the first bigger number on the right.' },
        { text: '`[1, 2, 5, -1]`', why: 'This takes the number right after each one. But 1 is not bigger than 3.' },
        '`[5, 2, 5, -1]`',
      ],
      answer: 2,
      explain: '3 skips the 1 and the 2, and finds 5. 1 finds 2 right away. 2 finds 5. Nothing beats 5.',
      hints: ['Start at 3. Which is the first number to its right that beats 3?'],
    },
    { t: 'h', text: 'The slow way: look right every time' },
    { t: 'p', text: 'You did it by looking right from each number. Code can do that too, with a loop inside a loop. This one counts each look.' },
    { t: 'code', caption: 'Falling numbers are the worst case, because no number ever finds an answer. Try `[1, 2, 3, 4]`.',
      code: py`
        def slow(nums):
            looks = 0
            answer = []
            for i in range(len(nums)):
                found = -1
                for j in range(i + 1, len(nums)):
                    looks = looks + 1
                    if nums[j] > nums[i]:
                        found = nums[j]
                        break
                answer.append(found)
            return answer, looks

        print(slow([4, 3, 2, 1]))
      `,
      output: '([-1, -1, -1, -1], 6)',
    },
    { t: 'q', id: 'count-looks', type: 'mcq', level: 2,
      q: 'Count by hand. How many looks does the slow way make on `[5, 4, 3, 2, 1]`?',
      options: [
        { text: '5', why: 'That counts one look per number. The 5 alone looks at 4 numbers.' },
        '10',
        { text: '25', why: 'That is 5 times 5. Each number looks only to its right, so it is about half that.' },
      ],
      answer: 1,
      explain: 'The numbers make 4, 3, 2, 1 and 0 looks. That adds up to 10.',
      hints: ['The 5 looks at 4 numbers. How many does the 4 look at?'],
    },
    { t: 'p', text: 'That is the same sum as `pop(0)`, so it is O(n^2). The slow way looks at the same numbers again and again. A stack can remember who still waits.' },
    { t: 'h', text: 'What does the stack remember?' },
    { t: 'words', items: [
      { word: 'monotonic stack', means: 'A stack kept in order, so its items only go one way from bottom to top.', say: 'mon-uh-TON-ik' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Keep the pile of plates in mind. Here, a plate may only sit on a plate at least as big. When a bigger plate comes, it lifts off every smaller plate on top. Unlike real plates, each one writes down who lifted it.' },
    { t: 'big', text: 'A number waits on the stack until a bigger one comes. Then it gets its answer and leaves.' },
    { t: 'steps', title: 'What to do with each new number', items: [
      { label: 'Compare', text: 'Is the number on top smaller than the new number?', code: 'nums[stack[-1]] < n' },
      { label: 'Pop and answer', text: 'If yes, the new number is its answer. Pop it, then compare again.', code: 'spot = stack.pop()\nanswer[spot] = n' },
      { label: 'Push', text: 'When no smaller number is on top, the new number starts to wait.', code: 'stack.append(i)' },
    ] },
    { t: 'viz', name: 'm15-next-bigger', caption: 'Guess each time it asks. Then type your own numbers and press Enter. Try falling numbers, equal numbers, and one number.' },
    { t: 'code', caption: 'Round brackets let the `while` test run over 2 lines. Each print tries a corner case. Guess first.',
      code: py`
        def next_bigger(nums):
            answer = [-1] * len(nums)
            stack = []
            for i in range(len(nums)):
                n = nums[i]
                while (len(stack) > 0 and
                    nums[stack[-1]] < n):
                    spot = stack.pop()
                    answer[spot] = n
                stack.append(i)
            return answer

        print(next_bigger([3, 1, 2, 5, 4]))
        print(next_bigger([]))
        print(next_bigger([7]))
        print(next_bigger([2, 2, 3]))
        print(next_bigger([5, 4, 3]))
      `,
      output: '[5, 2, 5, -1, -1]\n[]\n[-1]\n[3, 3, -1]\n[-1, -1, -1]',
    },
    { t: 'q', id: 'why-spots', type: 'mcq', level: 2,
      q: 'The stack holds spots, not the numbers. Why?',
      options: [
        { text: 'Numbers cannot go on a stack.', why: 'A stack can hold anything. Numbers would go on with no trouble.' },
        'A spot says where to write the answer.',
        { text: 'Spots take less memory.', why: 'A spot and a number take about the same room. The reason is about the answer list.' },
      ],
      answer: 1,
      explain: 'With `spot`, the code can write `answer[spot] = n`. The number itself is still there to read, in `nums[spot]`.',
      hints: ['Look at the line `answer[spot] = n`.'],
    },
    { t: 'q', id: 'trace-next', type: 'trace', level: 2,
      q: 'Follow the code on `[2, 1, 3]`. Fill in the stack and the answer after each trip. Spots go in the stack.',
      code: py`
        nums = [2, 1, 3]
        answer = [-1] * 3
        stack = []
        for i in range(3):
            n = nums[i]
            while (len(stack) > 0 and
                nums[stack[-1]] < n):
                spot = stack.pop()
                answer[spot] = n
            stack.append(i)
      `,
      head: ['i', 'stack', 'answer'],
      rows: [['0', '[0]', '[-1,-1,-1]'], ['1', '[0,1]', '[-1,-1,-1]'], ['2', '[2]', '[3,3,-1]']],
      given: 1,
      verify: 'nums = [2, 1, 3]\nanswer = [-1] * 3\nstack = []\nfor i in range(3):\n    n = nums[i]\n    while len(stack) > 0 and nums[stack[-1]] < n:\n        spot = stack.pop()\n        answer[spot] = n\n    stack.append(i)\n    print(i, str(stack).replace(" ", ""), str(answer).replace(" ", ""))',
      explain: '1 is smaller than 2, so both wait. Then 3 lifts them both off, and each gets 3 as its answer.',
      hints: ['When i is 1, is the number 2 smaller than the new number 1?', 'When i is 2, the while loop runs 2 times.'],
    },
    { t: 'h', text: 'How much work does the stack save?' },
    { t: 'code', caption: 'It counts steps, so the numbers are the same every run. It shows slow, then stack, for falling and then rising lists.',
      code: py`
        def slow_looks(nums):
            looks = 0
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    looks = looks + 1
                    if nums[j] > nums[i]:
                        break
            return looks

        def stack_steps(nums):
            steps = 0
            stack = []
            for n in nums:
                while (len(stack) > 0 and
                    stack[-1] < n):
                    stack.pop()
                    steps = steps + 1
                stack.append(n)
                steps = steps + 1
            return steps

        falling = list(range(1000, 0, -1))
        rising = list(range(1, 1001))
        print(slow_looks(falling))
        print(stack_steps(falling))
        print(slow_looks(rising))
        print(stack_steps(rising))
      `,
      output: '499500\n1000\n999\n1999',
    },
    { t: 'p', text: 'On rising numbers, the slow way does fine. But you cannot choose your input. So plan for the worst case, where the stack does far less work.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'The slow way', cost: 'O(n^2)', why: 'On falling numbers, each number looks at all the numbers after it.' },
      { op: 'next_bigger time', cost: 'O(n)', why: 'Each spot goes on once and comes off at most once. So there are at most 2n pushes and pops.' },
      { op: 'next_bigger memory', cost: 'O(n)', why: 'On falling numbers, every spot waits on the stack at once.' },
    ] },
    { t: 'trap', think: 'A loop inside a loop is always O(n^2).',
      real: 'Count the total work. One new number can pop many, but each spot comes off only once. So all the `while` trips add up to at most n.',
      code: py`
        # n trips
        for i in range(len(nums)):
            # at most n pops, over all trips
            while top_is_smaller:
                stack.pop()
      `,
    },
    { t: 'tip', title: 'Equal is not bigger', text: 'The test uses `<`, so equal numbers both keep waiting. With `<=`, the first 2 in `[2, 2, 3]` would get 2 as its answer. That is not bigger.' },
    { t: 'tip', title: 'How to spot it', text: 'Look for "next bigger", "next smaller", "next warmer day" or "how long until". To find the next smaller number, flip the `<` to `>`.' },
  ],
  recap: [
    'You can keep waiting spots on a stack.',
    'You can pop and answer when a bigger number comes.',
    'You can say why it takes O(n) steps.',
  ],
  practice: [
    { id: 'stack-after', type: 'mcq', level: 1,
      q: 'The waiting numbers are `[7, 4, 2]`, with 2 on top. The new number is 5. What does the pile hold after the push?',
      options: [
        { text: '`[7, 4, 2, 5]`', why: 'This pushes with no compare. But 2 and 4 are smaller than 5, so they come off.' },
        { text: '`[5]`', why: 'This pops the 7 too. But 7 is bigger than 5, so it keeps waiting.' },
        '`[7, 5]`',
      ],
      answer: 2,
      explain: '2 and 4 are smaller, so they come off with 5 as their answer. 7 stays, and 5 goes on top.',
      hints: ['Start from the top. Is 2 smaller than 5?', 'Stop popping when the top is not smaller.'],
    },
    { id: 'spot-the-pattern', type: 'mcq', level: 1,
      q: 'A problem says: "For each day, how many days until a warmer one?" Which tool fits best?',
      options: [
        'A stack of days still waiting',
        { text: 'A queue of days', why: 'A queue gives the oldest day first. Here the newest waiting day gets its answer first.' },
        { text: 'Sorting the days', why: 'Sorting mixes up the order of the days. This problem depends on that order.' },
      ],
      answer: 0,
      explain: '"Until a warmer one" is a cue for next bigger. So a monotonic stack fits.',
      hints: ['Which words sound like "next bigger"?'],
    },
    { id: 'predict-next', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        def next_bigger(nums):
            answer = [-1] * len(nums)
            stack = []
            for i in range(len(nums)):
                n = nums[i]
                while (len(stack) > 0 and
                    nums[stack[-1]] < n):
                    spot = stack.pop()
                    answer[spot] = n
                stack.append(i)
            return answer

        print(next_bigger([1, 3, 2]))
      `,
      options: [
        '[3, -1, -1]',
        { text: '[3, 2, -1]', why: '2 is to the right of 3, but it is smaller. So 3 has no next bigger number.' },
        { text: '[3, 3, 3]', why: 'A number can only find a bigger one to its right. The 3 has nothing bigger there.' },
      ],
      answer: 0,
      explain: '3 lifts off the 1. Then 3 and 2 wait until the end, so they keep -1.',
      hints: ['Follow the stack as each number comes in.'],
    },
    { id: 'fix-equal', type: 'fix', level: 2,
      q: 'Equal numbers should keep waiting. Here, `[2, 2, 3]` gives the wrong answer. Fix one character.',
      code: py`
        def next_bigger(nums):
            answer = [-1] * len(nums)
            stack = []
            for i in range(len(nums)):
                n = nums[i]
                while (len(stack) > 0 and
                    nums[stack[-1]] <= n):
                    spot = stack.pop()
                    answer[spot] = n
                stack.append(i)
            return answer
      `,
      answer: py`
        def next_bigger(nums):
            answer = [-1] * len(nums)
            stack = []
            for i in range(len(nums)):
                n = nums[i]
                while (len(stack) > 0 and
                    nums[stack[-1]] < n):
                    spot = stack.pop()
                    answer[spot] = n
                stack.append(i)
            return answer
      `,
      tests: [
        { label: 'next_bigger([2, 2, 3])', call: 'next_bigger([2, 2, 3])', want: '[3, 3, -1]' },
        { label: 'next_bigger([4, 4])', call: 'next_bigger([4, 4])', want: '[-1, -1]' },
        { label: 'next_bigger([1, 2])', call: 'next_bigger([1, 2])', want: '[2, -1]' },
      ],
      explain: 'With `<=`, an equal number counts as bigger. With `<`, only a truly bigger number gives an answer.',
      hints: ['Is 2 bigger than 2?', 'Look at the compare in the while line.'],
    },
    { id: 'next-smaller', type: 'write', level: 2,
      q: 'Write `next_smaller(nums)`. For each number, find the first smaller number to its right. If there is none, use -1.',
      starter: py`
        def next_smaller(nums):
            answer = [-1] * len(nums)
            stack = []
            # Your code here.
            return []
      `,
      answer: py`
        def next_smaller(nums):
            answer = [-1] * len(nums)
            stack = []
            for i in range(len(nums)):
                n = nums[i]
                while (len(stack) > 0 and
                    nums[stack[-1]] > n):
                    spot = stack.pop()
                    answer[spot] = n
                stack.append(i)
            return answer
      `,
      tests: [
        { label: 'next_smaller([4, 5, 2, 3])', call: 'next_smaller([4, 5, 2, 3])', want: '[2, 2, -1, -1]' },
        { label: 'next_smaller([])', call: 'next_smaller([])', want: '[]' },
        { label: 'next_smaller([6])', call: 'next_smaller([6])', want: '[-1]' },
        { label: 'next_smaller([3, 3, 1])', call: 'next_smaller([3, 3, 1])', want: '[1, 1, -1]' },
      ],
      explain: 'It is the same code with one sign flipped. Now the numbers on the stack get bigger toward the top.',
      hints: ['Start from `next_bigger`.', 'Only the compare in the while line changes.'],
    },
    { id: 'days-until-warmer', type: 'write', level: 2,
      q: '`temps` holds the heat of each day. For each day, find how many days until a warmer one, or 0 if none comes. Write `days_until(temps)`.',
      starter: py`
        def days_until(temps):
            answer = [0] * len(temps)
            stack = []
            # Your code here.
            return []
      `,
      answer: py`
        def days_until(temps):
            answer = [0] * len(temps)
            stack = []
            for i in range(len(temps)):
                while (len(stack) > 0 and
                    temps[stack[-1]] < temps[i]):
                    spot = stack.pop()
                    answer[spot] = i - spot
                stack.append(i)
            return answer
      `,
      tests: [
        { label: 'days_until([20, 18, 19, 25])', call: 'days_until([20, 18, 19, 25])', want: '[3, 1, 1, 0]' },
        { label: 'days_until([30, 29])', call: 'days_until([30, 29])', want: '[0, 0]' },
        { label: 'days_until([5])', call: 'days_until([5])', want: '[0]' },
        { label: 'days_until([])', call: 'days_until([])', want: '[]' },
        { label: 'days_until([7, 7, 8])', call: 'days_until([7, 7, 8])', want: '[2, 1, 0]' },
      ],
      explain: 'The shape is the same. Now the answer is a gap between 2 spots, `i - spot`. That is why the stack holds spots.',
      hints: ['Use the `next_bigger` shape.', 'The day that waited is `spot`, and today is `i`.', 'Write `answer[spot] = i - spot`.'],
    },
    { id: 'prev-bigger', type: 'write', level: 3,
      q: 'Stretch: now look left. For each number, find the nearest bigger number to its left. If there is none, use -1. Write `prev_bigger(nums)` in O(n).',
      starter: py`
        def prev_bigger(nums):
            answer = []
            stack = []
            # Your code here.
            return answer
      `,
      answer: py`
        def prev_bigger(nums):
            answer = []
            stack = []
            for n in nums:
                while len(stack) > 0 and stack[-1] <= n:
                    stack.pop()
                if len(stack) > 0:
                    answer.append(stack[-1])
                else:
                    answer.append(-1)
                stack.append(n)
            return answer
      `,
      tests: [
        { label: 'prev_bigger([3, 1, 2, 5, 4])', call: 'prev_bigger([3, 1, 2, 5, 4])', want: '[-1, 3, 3, -1, 5]' },
        { label: 'prev_bigger([])', call: 'prev_bigger([])', want: '[]' },
        { label: 'prev_bigger([2, 2])', call: 'prev_bigger([2, 2])', want: '[-1, -1]' },
        { label: 'prev_bigger([9, 8, 7])', call: 'prev_bigger([9, 8, 7])', want: '[-1, 9, 8]' },
      ],
      explain: 'Pop every number that is not bigger, since it can never be the answer again. Whatever stays on top is the nearest bigger one.',
      hints: ['Here the stack can hold the numbers themselves.', 'Pop while the top is not bigger than n.', 'After the pops, the top is the answer, if there is a top.'],
    },
  ],
});
