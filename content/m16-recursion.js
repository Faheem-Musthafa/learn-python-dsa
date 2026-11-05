/* Module 16: Recursion. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm16-recursion',
  num: 16, part: 2, level: 'I',
  title: 'Recursion',
  blurb: 'Solve a big job by having a function call a smaller copy of itself.',
  needs: ['m04-functions', 'm15-stacks-queues'],
});

/* ------------------------------------------------------------------ 16.1 */
Course.lesson('m16-recursion', {
  id: '16-1-calls-itself',
  num: '16.1',
  title: 'A function that calls itself',
  goal: 'You can write a function that calls itself, with a base case and a smaller job.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Can a function call itself?' },
    { t: 'p', text: 'In lesson 4.2, one function called another. A function can call itself too. Each call gets a smaller job than the last one.' },
    { t: 'q', id: 'spark-countdown', type: 'predict', level: 1,
      q: 'Take a guess. `countdown` calls itself on line 6. What will the screen show?',
      code: py`
        def countdown(n):
            if n == 0:
                print("Go!")
            else:
                print(n)
                countdown(n - 1)

        countdown(3)
      `,
      options: [
        '3\n2\n1\nGo!',
        { text: 'Go!', why: 'That thinks the `if` part runs first. At the start `n` is 3, so the `else` part runs.' },
        { text: '3\nGo!', why: 'That thinks the call on line 6 goes nowhere. It runs the whole function again, with `n` as 2.' },
      ],
      answer: 0,
      explain: 'Each call prints its own `n`, then calls again with a smaller one. When `n` reaches 0, it prints Go! and stops.',
      hints: ['Start with `n` as 3. Which part of the `if` runs?', 'Line 6 runs the same steps again with `n - 1`.'],
    },
    { t: 'words', items: [
      { word: 'recursion', say: 'ree-KUR-zhun', means: 'A function that solves a problem by calling a smaller copy of itself.' },
      { word: 'base case', means: 'The smallest case, where the function stops calling itself.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of nesting dolls. Open a doll, and you find a smaller doll inside. The smallest doll does not open, so you stop there. Unlike a doll, a call can hand an answer back.' },
    { t: 'big', text: '[[Recursion]] needs 2 parts: a [[base case]] that stops, and a call with a smaller job.' },
    { t: 'viz', name: 'm16-countdown', caption: 'Make a guess each time it asks. Then pick a new number, and try 0.' },
    { t: 'code', caption: 'Change the 3 to a 5, and guess before you run it. Then try `countdown(0)`.', output: '3\n2\n1\nGo!', code: py`
      def countdown(n):
          if n == 0:
              print("Go!")
          else:
              print(n)
              countdown(n - 1)

      countdown(3)
    ` },
    { t: 'q', id: 'find-base', type: 'mcq', level: 1,
      q: 'In `countdown`, which part is the [[base case]]?',
      options: [
        'The part for `n == 0`, which prints Go!',
        { text: 'The first call, `countdown(3)`', why: 'That is where the work starts. The base case is where it stops, at the smallest job.' },
        { text: 'The line `countdown(n - 1)`', why: 'That line makes the smaller call. The base case is the part that makes no more calls.' },
      ],
      answer: 0,
      explain: 'When `n` is 0, the function prints and makes no more calls. So the calls stop there.',
      hints: ['Which part of the function makes no new call?'],
    },

    { t: 'h', text: 'How does a call hand back an answer?' },
    { t: 'p', text: 'Here is a job with a smaller copy inside. 4 x 3 x 2 x 1 is 24. Look closely: that is 4 x (3 x 2 x 1). So the big job holds the same job, one size smaller.' },
    { t: 'words', items: [
      { word: 'factorial', say: 'fak-TOR-ee-ul', means: 'A whole number times every whole number below it, down to 1. The factorial of 4 is 24.' },
    ] },
    { t: 'steps', title: 'Write factorial with 3 questions', items: [
      { label: 'What is the smallest job?', text: 'The [[factorial]] of 1 is 1. You know that with no more work. So that is the [[base case]].', code: 'if n <= 1:\n    return 1' },
      { label: 'What is one size smaller?', text: 'The job for 4 holds the job for 3. So ask for `factorial(n - 1)`.', code: 'smaller = factorial(n - 1)' },
      { label: 'How do you use that answer?', text: 'Times it by your own `n`, and return the result.', code: 'return n * smaller' },
    ] },
    { t: 'code', caption: 'Each call waits for the smaller call to return. Try `factorial(5)`, and guess first.', output: '1\n6\n24', code: py`
      def factorial(n):
          if n <= 1:
              return 1
          smaller = factorial(n - 1)
          return n * smaller

      print(factorial(1))
      print(factorial(3))
      print(factorial(4))
    ` },
    { t: 'q', id: 'count-calls', type: 'mcq', level: 2,
      q: 'Count by hand. `factorial(4)` calls `factorial(3)`, and so on. How many calls is that in all?',
      options: [
        { text: '1', why: 'That counts only the first call. Line 4 makes another call each time `n` is above 1.' },
        { text: '3', why: 'That leaves out one call. Count 4, 3, 2 and 1, and each one is a call.' },
        '4',
        { text: '24', why: '24 is the answer it hands back. The number of calls is a different count.' },
      ],
      answer: 2,
      explain: 'The calls have `n` as 4, 3, 2 and 1. That makes 4 calls.',
      hints: ['Write down the `n` of each call, until the base case.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`factorial(n)`', cost: 'O(n)', why: 'You counted 4 calls for `n = 4`. Double `n`, and you double the calls.' },
    ] },
    { t: 'q', id: 'fill-sum-to', type: 'fill', level: 2,
      q: 'Fill the gaps. `sum_to(n)` adds 1 + 2 + ... + n, so `sum_to(4)` gives 10.',
      code: py`
        def sum_to(n):
            if n == ____:
                return 0
            return n + sum_to(____)

        print(sum_to(4))
      `,
      blanks: ['0', ['n - 1', 'n-1']],
      output: '10',
      explain: 'Adding up nothing gives 0, so that is the base case. Then each call asks for one size smaller.',
      hints: ['Which `n` gives a total of 0?', 'What is one size smaller than `n`?'],
    },
    { t: 'q', id: 'order-say-hi', type: 'order', level: 2,
      q: 'Put the lines in order. `say_hi(2)` should print Hi twice, then Done.',
      lines: [
        'def say_hi(n):',
        '    if n == 0:',
        '        print("Done")',
        '    else:',
        '        print("Hi")',
        '        say_hi(n - 1)',
        'say_hi(2)',
      ],
      extra: ['        say_hi(n)'],
      output: 'Hi\nHi\nDone',
      explain: 'It has the same shape as `countdown`. The extra line keeps `n` the same, so the job would never get smaller.',
      hints: ['The `def` line comes first and the call comes last.', 'Which call makes the job smaller?'],
    },
    { t: 'trap',
      think: 'recursion jumps back to the top of the function, like a loop.',
      real: 'Each call is a new run, with its own `n`. The old call waits. When the new call ends, the old call carries on from where it stopped. It still has its own `n`.',
      code: 'def f(n):\n    if n > 0:\n        f(n - 1)\n        print(n)   # runs after the smaller call ends\n\nf(2)           # prints 1, then 2',
    },
    { t: 'tip', title: 'Test the small cases first', text: 'Try the base case on its own, like `factorial(1)`. Then try one size up. Also ask what happens for 0, or for an empty input.' },
  ],
  recap: [
    'You can spot the base case in a function.',
    'You can make each call do a smaller job.',
    'You can use the answer a smaller call hands back.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[recursion]]', 'A function calling a smaller copy of itself'],
        ['[[base case]]', 'The smallest job, where the calls stop'],
        ['[[factorial]]', 'A number times every whole number below it'],
      ],
      explain: 'Recursion is the idea. The base case stops it. Factorial is one job it can do.',
      hints: ['Which word goes with the smallest doll?'],
    },
    { id: 'two-parts', type: 'mcq', level: 1,
      q: 'Which 2 parts does a function that calls itself need?',
      options: [
        'A base case, and a call with a smaller job',
        { text: 'A loop, and a list', why: 'That mixes recursion up with looping. The repeating here comes from the calls, so no loop is needed.' },
        { text: 'A print line, and a call with the same job', why: 'Printing is not needed. And a call with the same job would never reach the end.' },
      ],
      answer: 0,
      explain: 'The smaller job moves toward the base case. The base case then stops the calls.',
      hints: ['What makes the calls stop?'],
    },
    { id: 'predict-add-up', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        def add_up(n):
            if n == 0:
                return 0
            return n + add_up(n - 1)

        print(add_up(3))
      `,
      answer: '6',
      why: 'It works out 3 + 2 + 1 + 0, and the 0 comes from the base case.',
      explain: '`add_up(3)` is 3 + `add_up(2)`, and so on down to `add_up(0)`, which is 0. In all, that makes 6.',
      hints: ['What does `add_up(0)` return?', 'Now work out `add_up(1)`, then `add_up(2)`.'],
    },
    { id: 'fix-base-value', type: 'fix', level: 2,
      q: '`sum_to(3)` should give 6, but it gives 7. The base case hands back the wrong value. Fix it.',
      code: 'def sum_to(n):\n    if n == 0:\n        return 1\n    return n + sum_to(n - 1)\n',
      answer: 'def sum_to(n):\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)\n',
      tests: [
        { label: 'sum_to(3) gives 6', call: 'sum_to(3)', want: '6' },
        { label: 'sum_to(1) gives 1', call: 'sum_to(1)', want: '1' },
        { label: 'sum_to(0) gives 0', call: 'sum_to(0)', want: '0' },
      ],
      explain: 'Adding up nothing gives 0. The base case answer goes into every call above it, so it must be right.',
      hints: ['What should `sum_to(0)` be?', 'Change the value on line 3.'],
    },
    { id: 'write-stars', type: 'write', level: 2,
      q: 'Write `stars(n)`. It returns a string of `n` stars, and it must call itself. So `stars(3)` gives `"***"`.',
      starter: 'def stars(n):\n    # Your code here.\n    return None\n',
      answer: 'def stars(n):\n    if n == 0:\n        return ""\n    return "*" + stars(n - 1)\n',
      tests: [
        { label: 'stars(3) gives ***', call: 'stars(3)', want: '"***"' },
        { label: 'stars(1) gives *', call: 'stars(1)', want: '"*"' },
        { label: 'stars(0) gives an empty string', call: 'stars(0)', want: '""' },
      ],
      explain: 'Zero stars is the empty string, so that is the base case. Each bigger call adds 1 star to a smaller answer.',
      hints: ['What should `stars(0)` return?', 'One size smaller is `stars(n - 1)`.', 'Return `"*" + stars(n - 1)`.'],
    },
    { id: 'write-count-up', type: 'write', level: 3,
      q: 'Stretch: write `count_up(n)`. It prints 1 up to `n`, one number per line, and it calls itself. It needs no loop.',
      starter: 'def count_up(n):\n    # Your code here.\n    pass\n\ncount_up(3)\n',
      answer: 'def count_up(n):\n    if n > 0:\n        count_up(n - 1)\n        print(n)\n\ncount_up(3)\n',
      wantOutput: '1\n2\n3',
      explain: 'The smaller call prints its numbers first. Each call then prints its own `n` when the smaller call ends.',
      hints: ['Should a call print before or after the smaller call?', 'When `n` is 0, do nothing.', 'Put `print(n)` after `count_up(n - 1)`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 16.2 */
Course.lesson('m16-recursion', {
  id: '16-2-call-stack',
  num: '16.2',
  title: 'The call stack in pictures',
  goal: 'You can draw the call stack for a function that calls itself, and explain a RecursionError.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Where does each call keep its n?' },
    { t: 'p', text: 'In lesson 4.2, you saw the pile of calls. In module 15, you met stacks. The [[call stack]] is a stack of calls, and the top one runs.' },
    { t: 'q', id: 'spark-after', type: 'predict', level: 2,
      q: 'This time, `print` comes after the call. What will the screen show?',
      code: py`
        def show(n):
            if n > 0:
                show(n - 1)
                print(n)

        show(3)
      `,
      options: [
        { text: '3\n2\n1', why: 'That thinks `print` runs before going deeper. Here each call waits for the smaller call first.' },
        { text: '0\n0\n0', why: 'That thinks all the calls share one `n`. Each call keeps its own `n`, and its value stays the same.' },
        '1\n2\n3',
      ],
      answer: 2,
      explain: 'The smallest call prints first. Each waiting call still has its own `n`, and prints it when its turn comes.',
      hints: ['Which call reaches its `print` line first?', 'Does `show(3)` lose its `n` while it waits?'],
    },
    { t: 'words', items: [
      { word: 'frame', means: 'The space one call gets on the call stack. It holds that call\'s own names.' },
      { word: 'depth', means: 'How many calls are on the pile at one moment.' },
    ] },
    { t: 'viz', name: 'm16-stack', caption: 'Pick a number from 0 to 5. Predict each return value before it travels down.' },
    { t: 'big', text: 'Each call gets its own [[frame]] with its own names. The pile grows, then each answer travels back down.' },
    { t: 'steps', title: 'Draw the pile by hand', items: [
      { label: 'Grow', text: 'Write a new [[frame]] on top for each call. Write its `n` inside. Keep going to the [[base case]].' },
      { label: 'Turn around', text: 'The [[base case]] returns first. It is the only call that makes no new call.' },
      { label: 'Unwind', text: 'Cross out the top frame, and pass its answer to the frame below. That frame carries on from where it stopped.' },
    ] },
    { t: 'code', caption: 'More spaces mean a taller pile. Find the line where the calls turn around. Then change the 3 to a 4.',
      output: 'call, n = 3\n  call, n = 2\n    call, n = 1\n    return 1\n  return 2\nreturn 6\n6',
      code: py`
        def factorial(n, depth):
            pad = "  " * depth
            print(pad + "call, n =", n)
            if n <= 1:
                print(pad + "return 1")
                return 1
            smaller = factorial(n - 1, depth + 1)
            answer = n * smaller
            print(pad + "return", answer)
            return answer

        print(factorial(3, 0))
      `,
    },
    { t: 'q', id: 'trace-add-up', type: 'trace', level: 2,
      q: 'Fill in one row for each call, in the order the calls finish. The top of the pile finishes first.',
      code: py`
        def add_up(n):
            if n == 0:
                return 0
            smaller = add_up(n - 1)
            return n + smaller

        print(add_up(3))
      `,
      head: ['n', 'smaller', 'returns'],
      rows: [
        ['0', 'none', '0'],
        ['1', '0', '1'],
        ['2', '1', '3'],
        ['3', '3', '6'],
      ],
      given: 1,
      verify: py`
        def add_up(n):
            if n == 0:
                print(n, 'none', 0)
                return 0
            smaller = add_up(n - 1)
            print(n, smaller, n + smaller)
            return n + smaller
        add_up(3)
      `,
      explain: 'Each call waits for the row above it. Its `smaller` is what the call above returned.',
      hints: ['The call with `n` as 1 gets 0 from the call above it.', 'Now work out 2 + 1, then 3 + 3.'],
    },
    { t: 'q', id: 'count-depth', type: 'mcq', level: 2,
      q: 'Count by hand. At its tallest, how many `factorial` frames does `factorial(4)` have on the pile?',
      options: [
        { text: '1', why: 'That thinks each call ends before the next starts. A call stays on the pile while it waits.' },
        '4',
        { text: '24', why: '24 is the answer it returns. The pile only holds one frame per call.' },
      ],
      answer: 1,
      explain: 'The frames for 4, 3 and 2 all wait while the call for 1 runs. That makes 4 at once, so the [[depth]] is 4.',
      hints: ['Does a call leave the pile while it waits for a smaller call?'],
    },
    { t: 'cost', title: 'How much does it cost?', items: [
      { op: 'Time for `factorial(n)`', cost: 'O(n)', why: 'It makes n calls, and each call does a little work.' },
      { op: 'Memory for the pile', cost: 'O(n)', why: 'You counted 4 frames for `n = 4`. All of them wait at once.' },
    ] },

    { t: 'h', text: 'What if the calls never stop?' },
    { t: 'q', id: 'spark-no-base', type: 'predict', level: 2, expectError: true,
      q: 'This function has no [[base case]]. What happens when it runs?',
      code: py`
        def factorial(n):
            return n * factorial(n - 1)

        print(factorial(3))
      `,
      options: [
        { text: '6', why: 'That thinks Python knows where to stop. Nothing in this code says to stop at 1.' },
        { text: '0', why: 'That thinks `n` stops at 0. No line makes it stop, so `n` carries on to -1, -2 and beyond.' },
        'Python stops with a RecursionError',
      ],
      answer: 2,
      explain: 'Every call makes a new call, and none returns. The pile reaches the limit, and Python stops the program.',
      hints: ['Which line would stop the calls?', 'What happens to a pile that only grows?'],
    },
    { t: 'words', items: [
      { word: 'RecursionError', say: 'ree-KUR-zhun air-or', means: 'Python saying "this pile of calls is too tall, so I stopped".' },
    ] },
    { t: 'viz', name: 'm16-too-deep', caption: 'Try each version. For the version with n == 1, try a start of 0 and a start of 3.' },
    { t: 'code', error: true, caption: 'Run it. It is safe. Read the last line of the message. Then add a base case, and run it again.', code: py`
      def factorial(n):
          return n * factorial(n - 1)

      print(factorial(3))
    ` },
    { t: 'table', caption: 'Why a RecursionError happens', head: ['What went wrong', 'What it looks like', 'The fix'], rows: [
      ['No stop rule', 'No `if` in the function', 'Add a base case'],
      ['The job never shrinks', '`factorial(n)` calls `factorial(n)`', 'Hand over `n - 1`'],
      ['n jumps past the stop', '`if n == 1` when `n` starts at 0', 'Use `if n <= 1`'],
      ['The job is really that big', 'A correct function with a huge `n`', 'Use a loop'],
    ] },
    { t: 'code', caption: 'You met `try` in lesson 4.4. It catches this error as well. The last line shows the limit, which is 1000 here.', output: 'The pile got too tall.\n1000', code: py`
      import sys

      def forever(n):
          return forever(n + 1)

      try:
          forever(0)
      except RecursionError:
          print("The pile got too tall.")
      print(sys.getrecursionlimit())
    ` },
    { t: 'q', id: 'fix-same-n', type: 'fix', level: 2,
      q: 'Python stops with a RecursionError here. The job never gets smaller. Fix one line.',
      code: 'def add_up(n):\n    if n == 0:\n        return 0\n    return n + add_up(n)\n',
      answer: 'def add_up(n):\n    if n == 0:\n        return 0\n    return n + add_up(n - 1)\n',
      tests: [
        { label: 'add_up(3) gives 6', call: 'add_up(3)', want: '6' },
        { label: 'add_up(0) gives 0', call: 'add_up(0)', want: '0' },
      ],
      explain: 'With `n - 1`, each call moves closer to the base case. Then the calls can stop.',
      hints: ['What `n` does the new call get?', 'Change the call on line 4.'],
    },
    { t: 'p', text: 'A correct function can hit the limit too. A very big job needs a very tall pile. A loop keeps no pile, so it can go further.' },
    { t: 'code', caption: 'Both functions are correct. Only the loop gets through the bigger job.', output: '125250\nToo deep for recursion\nA loop got 12502500', code: py`
      def add_up(n):
          if n == 0:
              return 0
          return n + add_up(n - 1)

      print(add_up(500))
      try:
          print(add_up(5000))
      except RecursionError:
          print("Too deep for recursion")

      total = 0
      for i in range(5001):
          total = total + i
      print("A loop got", total)
    ` },
    { t: 'trap',
      think: 'a RecursionError means I should raise the limit with `sys.setrecursionlimit`.',
      real: 'First, look for a bug. A missing base case still fails with a bigger limit. And Python warns that a limit set too high can crash the program.',
    },
  ],
  recap: [
    'You can draw a frame for each call.',
    'You can say why answers come back in reverse order.',
    'You can name 3 causes of a RecursionError.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[frame]]', 'The space one call gets on the pile'],
        ['[[depth]]', 'How many calls are on the pile'],
        ['[[RecursionError]]', 'Python stopped because the pile got too tall'],
      ],
      explain: 'Each call gets a frame. Depth counts the frames. Too much depth gives the error.',
      hints: ['Which one counts something?'],
    },
    { id: 'first-to-finish', type: 'mcq', level: 1,
      q: 'You call `factorial(3)`. Which call finishes first?',
      options: [
        { text: '`factorial(3)`', why: 'It starts first, but it sits low on the pile. It waits for `factorial(2)` to return.' },
        { text: '`factorial(2)`', why: 'This one waits too. It needs the answer from `factorial(1)` first.' },
        '`factorial(1)`',
      ],
      answer: 2,
      explain: '`factorial(1)` is on top of the pile, and it is the base case. The last one on is the first one off.',
      hints: ['Which call does not need to wait for another call?'],
    },
    { id: 'predict-both-sides', type: 'predict', level: 2,
      q: 'One print comes before the call, and one comes after. What will the screen show?',
      code: py`
        def ping(n):
            if n > 0:
                print("down", n)
                ping(n - 1)
                print("up", n)

        ping(2)
      `,
      options: [
        { text: 'down 2\nup 2\ndown 1\nup 1', why: 'That thinks `ping(2)` ends before the smaller call starts. It waits at line 4 until `ping(1)` is done.' },
        'down 2\ndown 1\nup 1\nup 2',
        { text: 'down 2\ndown 1\nup 2\nup 1', why: 'That has the way back in the wrong order. The top of the pile comes off first, and that is `ping(1)`.' },
      ],
      answer: 1,
      explain: 'The pile grows on the way down. Then the calls come off in reverse order, so `up 1` comes first.',
      hints: ['What does `ping(2)` do while `ping(1)` runs?', 'Which call comes off the pile first?'],
    },
    { id: 'own-n', type: 'mcq', level: 2,
      q: '`factorial(3)` is waiting for `factorial(2)`. What does the `n` in the `factorial(3)` frame hold?',
      options: [
        '3',
        { text: '2', why: 'That thinks all calls share one `n`. The new call has its own `n` in its own frame.' },
        { text: 'Nothing, it was cleared', why: 'Names stay in a frame until that call ends. This call has not ended yet.' },
      ],
      answer: 0,
      explain: 'Each frame keeps its own `n`. When the answer comes back, this frame still has its 3.',
      hints: ['Does each call have its own names?'],
    },
    { id: 'fix-jump-past', type: 'fix', level: 2,
      q: '`factorial(4)` works, but `factorial(0)` stops with a RecursionError. It should give 1. Fix the base case.',
      code: 'def factorial(n):\n    if n == 1:\n        return 1\n    return n * factorial(n - 1)\n',
      answer: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n',
      tests: [
        { label: 'factorial(4) gives 24', call: 'factorial(4)', want: '24' },
        { label: 'factorial(1) gives 1', call: 'factorial(1)', want: '1' },
        { label: 'factorial(0) gives 1', call: 'factorial(0)', want: '1' },
      ],
      explain: 'From 0, the next `n` is -1, so `n` never equals 1. With `n <= 1`, the base case catches it.',
      hints: ['Follow `n` from 0. Does it ever equal 1?', 'Which test also catches 0?'],
    },
    { id: 'write-halves', type: 'write', level: 2,
      q: 'Write `halves(n)`. It counts how many times `//` can cut `n` in half before it reaches 0. It must call itself.',
      starter: 'def halves(n):\n    # Your code here.\n    return None\n',
      answer: 'def halves(n):\n    if n == 0:\n        return 0\n    return 1 + halves(n // 2)\n',
      tests: [
        { label: 'halves(8) gives 4', call: 'halves(8)', want: '4' },
        { label: 'halves(1) gives 1', call: 'halves(1)', want: '1' },
        { label: 'halves(0) gives 0', call: 'halves(0)', want: '0' },
      ],
      explain: 'Each call does one cut, then asks about what is left. The pile for 8 holds calls for 8, 4, 2, 1 and 0.',
      hints: ['What does `halves(0)` return?', 'One cut, plus the cuts left: `1 + halves(n // 2)`.'],
    },
    { id: 'write-can-finish', type: 'write', level: 3,
      q: 'Stretch: write `can_finish(n)`. It returns True if `add_up(n)` finishes, and False if it stops with a RecursionError.',
      starter: 'def add_up(n):\n    if n == 0:\n        return 0\n    return n + add_up(n - 1)\n\ndef can_finish(n):\n    # Your code here.\n    return None\n',
      answer: 'def add_up(n):\n    if n == 0:\n        return 0\n    return n + add_up(n - 1)\n\ndef can_finish(n):\n    try:\n        add_up(n)\n        return True\n    except RecursionError:\n        return False\n',
      tests: [
        { label: 'can_finish(10) gives True', call: 'can_finish(10)', want: 'True' },
        { label: 'can_finish(5000) gives False', call: 'can_finish(5000)', want: 'False' },
      ],
      explain: 'A deep `add_up` raises the error, and `except` catches it. The pile empties, so your program carries on.',
      hints: ['Use `try` and `except`.', 'The error to catch is `RecursionError`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 16.3 */
Course.lesson('m16-recursion', {
  id: '16-3-lists-strings-numbers',
  num: '16.3',
  title: 'Recursion on lists, strings and numbers',
  goal: 'You can write recursion that shrinks a list, a string or a number.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How do you make a list smaller?' },
    { t: 'p', text: 'A number gets smaller with `n - 1`. A list gets smaller with a [[slice]]. `items[1:]` is every item but the first.' },
    { t: 'q', id: 'spark-total', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        def total(items):
            if len(items) == 0:
                return 0
            return items[0] + total(items[1:])

        print(total([4, 7, 2]))
      `,
      options: [
        { text: '4', why: 'That stops at the first item. The second part, `total(items[1:])`, adds the rest.' },
        '13',
        { text: 'Python stops with an IndexError', why: 'That thinks `items[0]` runs on the empty list. The base case returns 0 before that line.' },
      ],
      answer: 1,
      explain: 'It works out 4 + `total([7, 2])`, then 7 + `total([2])`, and so on. In all, 4 + 7 + 2 + 0 is 13.',
      hints: ['What is `total([])`?', 'Now work out `total([2])`, then `total([7, 2])`.'],
    },
    { t: 'analogy', title: 'Dolls again', text: 'Take one item off the list, and a smaller list is left. That is like opening a doll. The empty list is the smallest doll. Unlike a doll, a slice is a copy, so the first list stays whole.' },
    { t: 'big', text: 'Trust the smaller call. Ask what this call must add, and let the smaller call do the rest.' },
    { t: 'viz', name: 'm16-sum-list', caption: 'Change the list, and predict each return value. Try an empty list, one number, and repeats like 3, 3, 3.' },
    { t: 'steps', noun: 'Shape', title: 'How to shrink each kind of data', items: [
      { label: 'A list', text: 'The smallest job is often the empty list. A [[slice]] takes off the first item.', code: 'items[1:]   # [4, 7, 2] becomes [7, 2]' },
      { label: 'A string', text: 'The smallest job is often the empty string. A slice works here too.', code: 'word[1:]    # "cat" becomes "at"' },
      { label: 'A number', text: 'The smallest job is often 0 or 1. Take away 1, or cut off a digit.', code: 'n - 1       # 123 becomes 122\nn // 10     # 123 becomes 12' },
    ] },
    { t: 'code', caption: 'Test the odd cases too: an empty list, one item, and repeats. Add a list of your own.', output: '13\n0\n5\n9', code: py`
      def total(items):
          if len(items) == 0:
              return 0
          rest = total(items[1:])
          return items[0] + rest

      print(total([4, 7, 2]))
      print(total([]))
      print(total([5]))
      print(total([3, 3, 3]))
    ` },
    { t: 'h', text: 'What does the slice cost?' },
    { t: 'q', id: 'count-copies', type: 'mcq', level: 2,
      q: 'Count by hand. For 4 items, the slices copy 3, then 2, then 1, then 0 items. How many is that?',
      options: [
        { text: '4', why: 'That counts one for each call. Each slice copies a whole list, so most calls copy more than 1.' },
        '6',
        { text: '10', why: 'That adds 4 + 3 + 2 + 1. A slice leaves out the first item, so the biggest copy is 3.' },
      ],
      answer: 1,
      explain: '3 + 2 + 1 + 0 is 6. The picture above counts copies like this too.',
      hints: ['Add the 4 numbers up.'],
    },
    { t: 'code', caption: 'This counts the copies for bigger lists. Each time the list doubles, the copies grow about 4 times.', output: '6 28 120', code: py`
      def copies(n):
          if n == 0:
              return 0
          return (n - 1) + copies(n - 1)

      print(copies(4), copies(8), copies(16))
    ` },
    { t: 'code', caption: 'Pass an index, and you copy nothing. The list stays whole, and `i` does the shrinking.', output: '13', code: py`
      def total_from(items, i):
          if i == len(items):
              return 0
          return items[i] + total_from(items, i + 1)

      print(total_from([4, 7, 2], 0))
    ` },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`total` with `items[1:]`', cost: 'O(n^2)', why: 'Each slice copies the rest of the list. You counted 6 copies for 4 items.' },
      { op: '`total_from` with an index', cost: 'O(n)', why: 'It makes n + 1 calls, and each one copies nothing.' },
      { op: 'Memory for `total_from`', cost: 'O(n)', why: 'It keeps about n frames waiting at once.' },
      { op: 'Memory for `total`', cost: 'O(n^2)', why: 'It keeps n frames too, and each one holds its own copy of the list.' },
    ] },

    { t: 'h', text: 'How do you reverse a string?' },
    { t: 'p', text: 'Take the first letter off. Reverse the rest. Then stick the first letter on the end. An empty string is the smallest job.' },
    { t: 'q', id: 'fill-reverse', type: 'fill', level: 2,
      q: 'Fill the gaps. `reverse("cat")` should give `tac`.',
      code: py`
        def reverse(word):
            if word == "":
                return ____
            return reverse(word[1:]) + ____

        print(reverse("cat"))
      `,
      blanks: [['""', "''"], 'word[0]'],
      output: 'tac',
      explain: 'The reverse of nothing is nothing. Each call then puts its first letter after the reversed rest.',
      hints: ['What is an empty string reversed?', 'Which letter goes on the end?'],
    },
    { t: 'q', id: 'order-power', type: 'order', level: 2,
      q: 'Put the lines in order. `power(2, 5)` means 2 times itself 5 times, which is 32.',
      lines: [
        'def power(base, exp):',
        '    if exp == 0:',
        '        return 1',
        '    return base * power(base, exp - 1)',
        'print(power(2, 5))',
      ],
      extra: ['    return base * power(base, exp)'],
      output: '32',
      explain: 'Anything to the power 0 is 1, so that is the base case. The extra line keeps `exp` the same, so it would never stop.',
      hints: ['Which line stops the calls?', 'Which number shrinks: `base` or `exp`?'],
    },

    { t: 'h', text: 'Does a word read the same both ways?' },
    { t: 'p', text: 'Words like "level" read the same from both ends. Check the first and last letters. If they match, the middle still has to pass the same test.' },
    { t: 'words', items: [
      { word: 'palindrome', say: 'PAL-in-drohm', means: 'A word that reads the same from both ends, like "noon".' },
    ] },
    { t: 'viz', name: 'm16-palindrome', caption: 'Try "noon", "hello", one letter and an empty word. Then try "Level" with a capital.' },
    { t: 'code', caption: 'A capital L and a small l do not match. Try `"Level"`, and guess first.', output: 'True\nFalse\nTrue\nTrue', code: py`
      def same_both_ways(word):
          if len(word) <= 1:
              return True
          if word[0] != word[-1]:
              return False
          return same_both_ways(word[1:-1])

      print(same_both_ways("level"))
      print(same_both_ways("hello"))
      print(same_both_ways("a"))
      print(same_both_ways(""))
    ` },
    { t: 'q', id: 'stop-early', type: 'mcq', level: 2,
      q: 'You test `"hello"`. How many pairs of letters does the function check?',
      options: [
        '1',
        { text: '2', why: 'That checks the middle as well. The first pair differs, so line 5 returns False at once.' },
        { text: '5', why: 'That counts letters, and thinks each one gets a check. Each call checks one pair, and only the first call runs here.' },
      ],
      answer: 0,
      explain: '"h" and "o" differ, so the function returns False right away. It makes no smaller call.',
      hints: ['Compare the first and last letters of "hello".'],
    },
    { t: 'trap',
      think: 'the answer of the smaller call comes back by itself.',
      real: 'You must `return` it. Without `return`, the call hands back None. Then the call below it tries to add None, and Python stops with a TypeError.',
      code: 'def total(items):\n    if len(items) == 0:\n        return 0\n    items[0] + total(items[1:])    # no return!',
    },
    { t: 'tip', title: 'How to recognize it', text: 'Look for a job that holds a smaller copy of the same job. Clue words are "nested", "depth" and "all paths". Loops can do the jobs in this lesson, and they keep no pile. Trees and folders are nested, so recursion fits them better.' },
  ],
  recap: [
    'You can shrink a list, a string or a number.',
    'You can handle empty input with a base case.',
    'You can avoid copies by passing an index.',
  ],
  practice: [
    { id: 'pick-base', type: 'mcq', level: 1,
      q: 'You write a function that counts the items in a list. What is the best base case?',
      options: [
        'The list is empty, so return 0',
        { text: 'The list has 100 items, so return 100', why: 'That starts from a big case. The base case must be the smallest job, and shorter lists would never reach this one.' },
        { text: 'No base case is needed for a list', why: 'That thinks the list stops the calls. With no base case, `items[0]` fails on the empty list.' },
      ],
      answer: 0,
      explain: 'An empty list holds 0 items, and you know that with no more work. So every smaller slice ends there.',
      hints: ['What is the smallest list there is?'],
    },
    { id: 'predict-reverse', type: 'predict', level: 1,
      q: 'What will the screen show? Type it.',
      code: py`
        def reverse(word):
            if word == "":
                return ""
            return reverse(word[1:]) + word[0]

        print(reverse("abc"))
      `,
      answer: 'cba',
      why: '`reverse("abc")` is `reverse("bc")` + a. In turn, that is cb + a.',
      explain: 'Each call puts its first letter after the reversed rest. So a ends up last.',
      hints: ['What is `reverse("c")`?', 'Now work out `reverse("bc")`.'],
    },
    { id: 'fix-no-return', type: 'fix', level: 2,
      q: 'Python stops with a TypeError here. One line works out the answer, but never hands it back. Fix it.',
      code: 'def total(items):\n    if len(items) == 0:\n        return 0\n    rest = total(items[1:])\n    items[0] + rest\n',
      answer: 'def total(items):\n    if len(items) == 0:\n        return 0\n    rest = total(items[1:])\n    return items[0] + rest\n',
      tests: [
        { label: 'total([1, 2, 3]) gives 6', call: 'total([1, 2, 3])', want: '6' },
        { label: 'total([5]) gives 5', call: 'total([5])', want: '5' },
        { label: 'total([]) gives 0', call: 'total([])', want: '0' },
      ],
      explain: 'Without `return`, the call hands back None. Then `items[0] + rest` tries to add None, and Python stops.',
      hints: ['Which line works out a value and then drops it?', 'Add `return` to the last line.'],
    },
    { id: 'write-digits', type: 'write', level: 2,
      q: 'Write `sum_digits(n)`. It adds the digits of a whole number, and it calls itself. So `sum_digits(123)` gives 6.',
      starter: 'def sum_digits(n):\n    # n % 10 is the last digit. n // 10 is the rest.\n    return None\n',
      answer: 'def sum_digits(n):\n    if n == 0:\n        return 0\n    return n % 10 + sum_digits(n // 10)\n',
      tests: [
        { label: 'sum_digits(123) gives 6', call: 'sum_digits(123)', want: '6' },
        { label: 'sum_digits(7) gives 7', call: 'sum_digits(7)', want: '7' },
        { label: 'sum_digits(0) gives 0', call: 'sum_digits(0)', want: '0' },
        { label: 'sum_digits(1005) gives 6', call: 'sum_digits(1005)', want: '6' },
      ],
      explain: '`n % 10` takes off the last digit. `n // 10` leaves a smaller number, and it reaches 0 at the end.',
      hints: ['What is `sum_digits(0)`?', '`123 % 10` is 3, and `123 // 10` is 12.', 'Return `n % 10 + sum_digits(n // 10)`.'],
    },
    { id: 'write-count-item', type: 'write', level: 2,
      q: 'Write `count_item(items, x)`. It counts how many times `x` is in the list, and it calls itself.',
      starter: 'def count_item(items, x):\n    # Your code here.\n    return None\n',
      answer: 'def count_item(items, x):\n    if len(items) == 0:\n        return 0\n    rest = count_item(items[1:], x)\n    if items[0] == x:\n        return 1 + rest\n    return rest\n',
      tests: [
        { label: 'Repeats: count_item([1, 2, 1, 1], 1)', call: 'count_item([1, 2, 1, 1], 1)', want: '3' },
        { label: 'Not found: count_item([2], 3)', call: 'count_item([2], 3)', want: '0' },
        { label: 'One item: count_item([3], 3)', call: 'count_item([3], 3)', want: '1' },
        { label: 'Empty: count_item([], 5)', call: 'count_item([], 5)', want: '0' },
      ],
      explain: 'The smaller call counts the rest of the list. This call only adds 1 if its first item matches.',
      hints: ['An empty list holds 0 of anything.', 'Get `rest` from `count_item(items[1:], x)`.', 'Add 1 only if `items[0] == x`.'],
    },
    { id: 'write-largest', type: 'write', level: 2,
      q: 'Write `largest(items)`. It returns the biggest number in a list with at least 1 item. It calls itself, and it does not use `max`.',
      starter: 'def largest(items):\n    # Your code here.\n    return None\n',
      answer: 'def largest(items):\n    if len(items) == 1:\n        return items[0]\n    rest = largest(items[1:])\n    if items[0] > rest:\n        return items[0]\n    return rest\n',
      tests: [
        { label: 'largest([3, 9, 4]) gives 9', call: 'largest([3, 9, 4])', want: '9' },
        { label: 'One item: largest([5])', call: 'largest([5])', want: '5' },
        { label: 'Repeats: largest([2, 2])', call: 'largest([2, 2])', want: '2' },
        { label: 'Below zero: largest([-3, -1])', call: 'largest([-3, -1])', want: '-1' },
      ],
      explain: 'A list of one item has only one choice, so that is the base case. An empty list has no biggest item.',
      hints: ['Why can the base case not be the empty list here?', 'Compare `items[0]` with the biggest of the rest.'],
    },
    { id: 'write-deep-sum', type: 'write', level: 3,
      q: 'Stretch: lists can hold lists. Write `deep_sum(items)` to add every number, however deep. Use `type(x) == list` to spot a list.',
      starter: 'def deep_sum(items):\n    # Your code here.\n    return None\n',
      answer: 'def deep_sum(items):\n    total = 0\n    for x in items:\n        if type(x) == list:\n            total = total + deep_sum(x)\n        else:\n            total = total + x\n    return total\n',
      tests: [
        { label: 'deep_sum([1, 2]) gives 3', call: 'deep_sum([1, 2])', want: '3' },
        { label: 'deep_sum([1, [2, 3], [[4]]]) gives 10', call: 'deep_sum([1, [2, 3], [[4]]])', want: '10' },
        { label: 'deep_sum([]) gives 0', call: 'deep_sum([])', want: '0' },
        { label: 'deep_sum([[], [[]]]) gives 0', call: 'deep_sum([[], [[]]])', want: '0' },
      ],
      explain: 'A loop goes over one list. Each list inside gets its own call. Here the [[base case]] is a list with no lists inside.',
      hints: ['Loop over the items of the list.', 'If `x` is a list, ask `deep_sum(x)`.', 'If `x` is a number, add it to the total.'],
    },
  ],
});

/* ------------------------------------------------------------------ 16.4 */
Course.lesson('m16-recursion', {
  id: '16-4-fibonacci-memo',
  num: '16.4',
  title: 'Repeated work and memoization',
  goal: 'You can count repeated calls in a function, and remove them with a dict or cache.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Why can one small function get so slow?' },
    { t: 'p', text: 'Start with 0 and 1. Each new number adds the 2 numbers before it: 0, 1, 1, 2, 3, 5, 8.' },
    { t: 'words', items: [
      { word: 'Fibonacci', say: 'fib-oh-NAH-chee', means: 'A row of numbers where each one is the sum of the 2 before it.' },
    ] },
    { t: 'code', caption: 'This code reads almost like the rule. Line 4 makes 2 calls, not 1. Try `fib(8)`.', output: '[0, 1, 1, 2, 3, 5, 8]', code: py`
      def fib(n):
          if n <= 1:
              return n
          return fib(n - 1) + fib(n - 2)

      print([fib(n) for n in range(7)])
    ` },
    { t: 'q', id: 'count-fib', type: 'trace', level: 2,
      q: 'Count by hand. Draw the calls on paper, and count every call. So `fib(2)` makes 3 calls: itself, `fib(1)` and `fib(0)`.',
      code: py`
        def fib(n):
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)
      `,
      head: ['n', 'calls'],
      rows: [['0', '1'], ['1', '1'], ['2', '3'], ['3', '5'], ['4', '9']],
      given: 3,
      verify: py`
        def calls(n):
            if n <= 1:
                return 1
            return 1 + calls(n - 1) + calls(n - 2)
        for n in range(5):
            print(n, calls(n))
      `,
      explain: 'A call counts itself, plus all the calls of its 2 smaller calls. So `fib(3)` is 1 + 3 + 1, and `fib(4)` is 1 + 5 + 3.',
      hints: ['`fib(3)` calls `fib(2)` and `fib(1)`. You have those counts.', 'Add 1 for the call itself.'],
    },
    { t: 'viz', name: 'm16-fib-tree', caption: 'Pick a number. Watch the row at the bottom count each call, and look for the squares.' },
    { t: 'code', caption: 'This counts calls, so you get the same result on every run. Look how fast the count grows.', output: '5 15\n10 177\n15 1973\n20 21891', code: py`
      count = {"calls": 0}

      def fib(n):
          count["calls"] = count["calls"] + 1
          if n <= 1:
              return n
          return fib(n - 1) + fib(n - 2)

      for n in [5, 10, 15, 20]:
          count["calls"] = 0
          fib(n)
          print(n, count["calls"])
    ` },
    { t: 'q', id: 'why-slow', type: 'mcq', level: 2,
      q: 'Why does `fib` make so many calls?',
      options: [
        'It asks the same small questions again and again',
        { text: 'The numbers get too big for Python', why: 'Python handles big whole numbers well. The trouble is the number of calls, not the size of the numbers.' },
        { text: 'It has no base case', why: 'It has one, on line 2. Calls do stop, but there are a lot of them.' },
      ],
      answer: 0,
      explain: '`fib(5)` needs only 6 different answers, but it makes 15 calls. The other calls redo old work.',
      hints: ['Look at the squares in the picture.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`fib(n)` with no notes', cost: 'O(2^n)', why: 'Each call can make 2 more, so people write O(2^n). The true count grows a bit slower: about 1.6 times per step. You counted 15 calls for 5, and 21891 for 20.' },
    ] },

    { t: 'h', text: 'How do you stop redoing old work?' },
    { t: 'analogy', title: 'Picture this', text: 'You work out a hard sum and write it on a sticky note. Next time, you read the note. This is only safe if the answer never changes. If a question can get a new answer, an old note is wrong.' },
    { t: 'words', items: [
      { word: 'memoization', say: 'mem-oh-ih-ZAY-shun', means: 'Writing down an answer so you can look it up next time.' },
      { word: 'cache', say: 'KASH', means: 'A place that keeps answers you already worked out.' },
    ] },
    { t: 'steps', title: 'Add notes to a function', items: [
      { label: 'Make the notes', text: 'Make an empty dict outside the function. So every call shares the same notes.', code: 'notes = {}' },
      { label: 'Look first', text: 'Before doing any work, check the notes.', code: 'if n in notes:\n    return notes[n]' },
      { label: 'Write it down', text: 'After working out an answer, save it. Then return it.', code: 'notes[n] = answer\nreturn answer' },
    ] },
    { t: 'viz', name: 'm16-fib-memo', caption: 'Each square is a call that reads a note. Pick a number, and count the shapes.' },
    { t: 'code', caption: '`notes.clear()` empties the dict for each new test. Compare the counts: for 20, it was 21891 calls.', output: '5 9\n10 19\n15 29\n20 39', code: py`
      count = {"calls": 0}
      notes = {}

      def fib(n):
          count["calls"] = count["calls"] + 1
          if n <= 1:
              return n
          if n in notes:
              return notes[n]
          answer = fib(n - 1) + fib(n - 2)
          notes[n] = answer
          return answer

      for n in [5, 10, 15, 20]:
          count["calls"] = 0
          notes.clear()
          fib(n)
          print(n, count["calls"])
    ` },
    { t: 'q', id: 'same-answer', type: 'predict', level: 2,
      q: '`slow` has no notes, and `fast` has notes. What will the screen show?',
      code: py`
        notes = {}

        def slow(n):
            if n <= 1:
                return n
            return slow(n - 1) + slow(n - 2)

        def fast(n):
            if n <= 1:
                return n
            if n in notes:
                return notes[n]
            notes[n] = fast(n - 1) + fast(n - 2)
            return notes[n]

        print(slow(10) == fast(10))
      `,
      options: [
        'True',
        { text: 'False', why: 'That thinks notes change the answer. They only save work, so both give the same number.' },
        { text: 'Python stops with a KeyError', why: 'Line 11 checks that the key is there before line 12 reads it. So the read is safe.' },
      ],
      answer: 0,
      explain: 'Both give 55. [[Memoization]] changes how much work happens, and it never changes the answer.',
      hints: ['Does a note hold the right answer?'],
    },
    { t: 'q', id: 'fill-memo', type: 'fill', level: 2,
      q: 'Fill the gaps, so `double(n)` looks in its notes first, and saves each new answer.',
      code: py`
        notes = {}

        def double(n):
            if n ____ notes:
                return notes[n]
            answer = n * 2
            ____ = answer
            return answer

        print(double(4), double(4))
      `,
      blanks: ['in', 'notes[n]'],
      output: '8 8',
      explain: '`n in notes` asks if the key is there. `notes[n] = answer` writes the note.',
      hints: ['Which word checks for a key in a dict?', 'How do you save a value under the key `n`?'],
    },
    { t: 'cost', title: 'What do the notes cost?', items: [
      { op: '`fib(n)` with notes', cost: 'O(n)', why: 'You saw 39 calls for 20. Each new `n` adds 2 calls.' },
      { op: 'Read or write a note', cost: 'O(1) average', why: 'A dict goes straight to the key.' },
      { op: 'Memory for the notes', cost: 'O(n)', why: 'You trade memory for speed: one note for each `n`.' },
    ] },
    { t: 'h', text: 'Can Python keep the notes for you?' },
    { t: 'p', text: 'Yes. `functools` is a [[module]] with a tool called `cache`. Put `@cache` on the line above `def`. Python then keeps a dict of answers for you.' },
    { t: 'code', caption: 'Without notes, `fib(80)` would take far too long. Here it gives the answer right away.', output: '23416728348467685', code: py`
      from functools import cache

      @cache
      def fib(n):
          if n <= 1:
              return n
          return fib(n - 1) + fib(n - 2)

      print(fib(80))
    ` },
    { t: 'tip', title: 'What notes cannot do', text: 'Notes do not shrink the pile. With a dict, a first call to `fib(5000)` still stops with a RecursionError. `@cache` runs out of room sooner: on this page, `fib(500)` makes Python start again. Also, `@cache` uses your arguments as dict keys. So a list as an argument gives a TypeError.' },
    { t: 'trap',
      think: 'I can make the notes dict inside the function.',
      real: 'Then each call gets its own new dict, in its own [[frame]]. The dict is gone when the call ends, so no call ever finds a note. Make the dict outside.',
      code: 'def fib(n):\n    notes = {}    # new and empty on every call\n    ...',
    },
    { t: 'tip', title: 'How to recognize it', text: 'Do the same inputs come up again and again? Draw the calls for a small input, and look for repeats. Clue words are "number of ways" and "overlapping choices". Module 25 builds on this idea.' },
  ],
  recap: [
    'You can count the repeated calls in a function.',
    'You can add notes with a dict or `@cache`.',
    'You can say that notes never change the answer.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[Fibonacci]]', 'Numbers where each is the sum of the 2 before it'],
        ['[[memoization]]', 'Writing down an answer to look up next time'],
        ['[[cache]]', 'A place that keeps worked-out answers'],
      ],
      explain: 'Fibonacci is the job. Memoization is the trick. A cache is where the answers wait.',
      hints: ['Which word is about a row of numbers?'],
    },
    { id: 'when-notes', type: 'mcq', level: 1,
      q: 'When do notes help a function?',
      options: [
        'When the same inputs come up many times',
        { text: 'When every call gets a different input', why: 'Then no note is ever read again, so the notes only use up memory. `factorial` is like this.' },
        { text: 'When the answer changes from one call to the next', why: 'Then an old note would be wrong. Notes are safe only if the same input always gives the same answer.' },
      ],
      answer: 0,
      explain: 'A note saves work only when someone reads it again. It is right only if the answer stays the same.',
      hints: ['When does anyone read a note a second time?'],
    },
    { id: 'count-with-notes', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        count = {"calls": 0}
        notes = {}

        def fib(n):
            count["calls"] = count["calls"] + 1
            if n <= 1:
                return n
            if n in notes:
                return notes[n]
            notes[n] = fib(n - 1) + fib(n - 2)
            return notes[n]

        fib(4)
        print(count["calls"])
      `,
      answer: '7',
      why: 'The calls have `n` as 4, 3, 2, 1, 0, 1 and 2. The last `fib(2)` reads a note.',
      explain: 'Without notes, it took 9 calls. With notes, each `n` from 2 to 4 does its work only once.',
      hints: ['Write the calls in the order they happen.', 'The second `fib(2)` finds a note, and makes no more calls.'],
    },
    { id: 'fix-notes-inside', type: 'fix', level: 2,
      q: 'The answers are right, but `fib(20)` makes 21891 calls. The notes never help. Fix it, so it makes under 100 calls.',
      code: 'count = {"calls": 0}\n\ndef fib(n):\n    notes = {}\n    count["calls"] = count["calls"] + 1\n    if n <= 1:\n        return n\n    if n in notes:\n        return notes[n]\n    notes[n] = fib(n - 1) + fib(n - 2)\n    return notes[n]\n',
      answer: 'count = {"calls": 0}\nnotes = {}\n\ndef fib(n):\n    count["calls"] = count["calls"] + 1\n    if n <= 1:\n        return n\n    if n in notes:\n        return notes[n]\n    notes[n] = fib(n - 1) + fib(n - 2)\n    return notes[n]\n',
      tests: [
        { label: 'fib(10) gives 55', call: 'fib(10)', want: '55' },
        { label: 'fib(20) makes under 100 calls', check: '(count.update(calls=0), notes.clear() if "notes" in globals() else None, fib(20), count["calls"])[3] < 100' },
      ],
      explain: 'Inside the function, each call makes a new empty dict. Outside the function, every call shares one dict.',
      hints: ['How many dicts are there while it runs?', 'Move `notes = {}` above the `def` line.'],
    },
    { id: 'write-tri', type: 'write', level: 2,
      q: 'Write `tri(n)`. `tri(0)` and `tri(1)` are 0, and `tri(2)` is 1. Every other `tri(n)` adds the 3 before it. Use notes, so `tri(25)` is quick.',
      starter: 'def tri(n):\n    # Your code here.\n    return None\n',
      answer: 'notes = {}\n\ndef tri(n):\n    if n <= 1:\n        return 0\n    if n == 2:\n        return 1\n    if n in notes:\n        return notes[n]\n    notes[n] = tri(n - 1) + tri(n - 2) + tri(n - 3)\n    return notes[n]\n',
      tests: [
        { label: 'tri(0) gives 0', call: 'tri(0)', want: '0' },
        { label: 'tri(2) gives 1', call: 'tri(2)', want: '1' },
        { label: 'tri(6) gives 7', call: 'tri(6)', want: '7' },
        { label: 'tri(25) gives 755476', call: 'tri(25)', want: '755476' },
      ],
      explain: 'This one has 3 base cases and 3 smaller calls. The notes work in the same way.',
      hints: ['Which values of `n` need no smaller call?', 'Make `notes = {}` above the `def` line.', 'Use `tri(n - 1) + tri(n - 2) + tri(n - 3)`.'],
    },
    { id: 'memory-trade', type: 'mcq', level: 2,
      q: 'What do you give up when you add notes?',
      options: [
        'Some memory, to hold the notes',
        { text: 'The right answer', why: 'That thinks notes change the answer. They give back what the function worked out before.' },
        { text: 'The base case', why: 'You still need it. The first call for each input works out its answer in the usual way.' },
      ],
      answer: 0,
      explain: 'Notes trade memory for speed. Each note takes up a little space in the dict.',
      hints: ['Where do the notes live?'],
    },
    { id: 'write-paths', type: 'write', level: 3,
      q: 'Stretch: a robot moves only down or right on a grid. `paths(r, c)` counts its routes with `r` moves down and `c` right. If `r` or `c` is 0, there is 1 route.',
      starter: 'def paths(r, c):\n    # Your code here.\n    return None\n',
      answer: 'from functools import cache\n\n@cache\ndef paths(r, c):\n    if r == 0 or c == 0:\n        return 1\n    return paths(r - 1, c) + paths(r, c - 1)\n',
      tests: [
        { label: 'paths(0, 5) gives 1', call: 'paths(0, 5)', want: '1' },
        { label: 'paths(1, 1) gives 2', call: 'paths(1, 1)', want: '2' },
        { label: 'paths(2, 2) gives 6', call: 'paths(2, 2)', want: '6' },
        { label: 'paths(12, 12) gives 2704156', call: 'paths(12, 12)', want: '2704156' },
      ],
      explain: 'The first move is down or right, so add the routes for both. `@cache` works with 2 arguments as well.',
      hints: ['If the first move is down, what is left?', 'Add `paths(r - 1, c)` and `paths(r, c - 1)`.', 'Without notes, the last test takes too long. Use `@cache`.'],
    },
  ],
});
