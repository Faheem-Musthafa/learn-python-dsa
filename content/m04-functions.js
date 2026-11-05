/* Module 4: Functions, Errors and Tests. Part 1 (Learn Python). */
Course.module({
  id: 'm04-functions',
  num: 4, part: 1, level: 'B',
  title: 'Functions, Errors and Tests',
  blurb: 'Give your steps a name, read what errors tell you, and test your own code.',
  needs: ['m03-loops'],
});

/* ------------------------------------------------------------------ 4.1 */
Course.lesson('m04-functions', {
  id: '4-1-def-and-return',
  num: '4.1',
  title: 'Functions: def, parameters and return',
  goal: 'You can write a function that takes a value and returns an answer.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Give a job a name' },
    { t: 'p', text: 'Some jobs come up again and again. You can give a job a name. Then you use that name each time you need the job.' },
    { t: 'analogy', title: 'Picture this', text: 'Think of a kitchen helper. You hand over a note. The helper works, then hands you a plate. Unlike a real helper, Python forgets the note when the job ends.' },
    { t: 'words', items: [
      { word: 'function', say: 'FUNK-shun', means: 'A named mini-program you can use again and again. To **call** it means to ask it to do its job now.' },
      { word: 'parameter', say: 'puh-RAM-uh-ter', means: 'A name tag inside a function for something you give it. It is the note for the helper.' },
      { word: 'return', means: 'Hand an answer back from a function to the code that asked. It is the plate.' },
    ] },
    { t: 'steps', title: 'Make a function, then use it', items: [
      { label: 'Save the steps', text: '`def` saves the steps under a name. Nothing runs yet. `n` is the [[parameter]].', code: 'def double(n):\n    answer = n * 2\n    return answer' },
      { label: 'Call it', text: 'Write the name and a value. Now the steps run, with the tag `n` on 4.', code: 'result = double(4)' },
      { label: 'Use the answer', text: 'The [[function]] hands back 8. The name `result` sticks on it.', code: 'print(result)' },
    ] },
    { t: 'viz', name: 'm04-double', caption: 'Step through it. Make a guess before each big step.' },
    { t: 'code', caption: 'Run it. Then change the 4 to another number and run it again.', output: '8', code: py`
      def double(n):
          answer = n * 2
          return answer

      result = double(4)
      print(result)
    ` },
    { t: 'q', id: 'def-waits', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        def hello():
            print("Hi")

        print("Bye")
      `,
      options: [
        { text: 'Hi\nBye', why: 'That thinks `def` runs the steps. It only saves them. Nothing here calls `hello()`.' },
        { text: 'Bye', why: '' },
        { text: 'Hi', why: 'The line `print("Bye")` is not indented, so it is outside the function. It does run.' },
      ],
      answer: 1,
      explain: '`def` only saves the steps. Nothing calls `hello()`, so Hi never shows.',
      hints: ['Look for a line that calls `hello()`.', 'Is there any line with `hello()` outside the `def`?'],
    },

    { t: 'h', text: 'Do the names have to match?' },
    { t: 'p', text: 'A function can take more than one value. The first value goes to the first parameter. The second goes to the second.' },
    { t: 'code', caption: 'Your names do not need to match the parameter names. Try changing x and y.', output: '7\n11', code: py`
      def add(a, b):
          return a + b

      x = 2
      y = 5
      print(add(x, y))
      print(add(10, 1))
    ` },

    { t: 'h', text: 'return is not print' },
    { t: 'p', text: '`print` puts a value on the screen. `return` hands a value back to your code. They look alike, but they do different jobs.' },
    { t: 'viz', name: 'm04-print-vs-return', caption: 'Watch the screen and the names a and b.' },
    { t: 'big', text: 'print talks to the person. return talks to the code.' },
    { t: 'p', text: 'If a function has no `return`, it hands back [[None]]. That is a value that means "nothing here".' },
    { t: 'code', caption: 'Run it. See which value a is on, and which value b is on.', output: '8\na is None\nb is 8', code: py`
      def show(n):
          print(n * 2)

      def give(n):
          return n * 2

      a = show(4)
      b = give(4)
      print("a is", a)
      print("b is", b)
    ` },
    { t: 'q', id: 'none-from-print', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        def shout(word):
            print(word + "!")

        x = shout("Go")
        print(x)
      `,
      options: [
        { text: 'Go!\nGo!', why: 'That treats `print` like `return`. `shout` shows the word, but hands back nothing.' },
        { text: 'Go!', why: 'The last line still runs. `x` is on None, and `print` shows it.' },
        { text: 'Go!\nNone', why: '' },
      ],
      answer: 2,
      explain: '`shout` prints Go! and has no `return`. So `x` is on None, and the last line shows it.',
      hints: ['Does `shout` have a `return`?', 'A function with no `return` hands back None.'],
    },

    { t: 'h', text: 'return ends the job' },
    { t: 'p', text: 'When Python reaches `return`, the function stops at once. Any lines below it never run.' },
    { t: 'q', id: 'after-return', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        def check(n):
            return n + 1
            print("Done")

        print(check(2))
      `,
      options: [
        { text: '3', why: '' },
        { text: 'Done\n3', why: 'That thinks code after `return` still runs. The function stops at `return`.' },
        { text: '3\nDone', why: 'The line with Done is inside the function, after `return`. Python never reaches it.' },
      ],
      answer: 0,
      explain: 'The function stops at `return`. The line with Done never runs.',
      hints: ['Which line comes first inside the function?', 'What happens to the function when it reaches `return`?'],
    },
    { t: 'q', id: 'order-triple', type: 'order', level: 2,
      q: 'Put the lines in order. The program should show 15. One line is not needed.',
      lines: ['def triple(n):', '    return n * 3', 'print(triple(5))'],
      extra: ['    print(n * 3)'],
      output: '15',
      explain: 'First save the steps with `def`. The `return` goes inside, pushed in by 4 spaces. The call comes after.',
      hints: ['The `def` line comes first.', 'The indented `return` line belongs right under `def`.'],
    },
    { t: 'trap',
      think: 'a function with `print` gives the answer back to your code.',
      real: '`print` only shows the answer on the screen. Your code gets None, and the next sum stops with a TypeError.',
      code: 'def add(a, b):\n    print(a + b)\n\ntotal = add(1, 2)   # total is None\nprint(total + 1)    # Python stops here',
    },
  ],
  recap: [
    'You can save steps with def and run them with a call.',
    'You can pass a value in through a parameter.',
    'You can tell return from print, and spot None.',
  ],
  practice: [
    { id: 'def-meaning', type: 'mcq', level: 1,
      q: 'What does `def` do?',
      options: [
        { text: 'It runs the steps right now', why: 'The steps wait until a call. `def` alone never runs them.' },
        'It saves the steps under a name',
        { text: 'It shows the steps on the screen', why: 'Showing things is the job of `print`. `def` shows nothing.' },
      ],
      answer: 1,
      explain: '`def` saves the steps under a name. They run when you call the [[function]].',
      hints: ['Think about what happens to a function that nobody calls.'],
    },
    { id: 'fill-square', type: 'fill', level: 1,
      q: 'Fill the gaps so the program shows 9.',
      code: '____ square(n):\n    ____ n * n\n\nprint(square(3))',
      blanks: ['def', 'return'],
      output: '9',
      explain: '`def` starts the function. `return` hands the answer back to the code that asked.',
      hints: ['Which word starts a function?', 'Which word hands an answer back?'],
    },
    { id: 'two-calls', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        def add_two(n):
            return n + 2

        a = add_two(1)
        b = add_two(a)
        print(b)
      `,
      answer: '5',
      why: 'Do one line at a time. `a` gets 3. Then the 3 goes in, and `b` gets 5.',
      explain: '`a` gets 3. Then `add_two` runs again with 3, so `b` gets 5.',
      hints: ['What value is `a` on after line 4?', 'That value goes into the second call.'],
    },
    { id: 'swapped-names', type: 'predict', level: 3,
      q: 'The names look swapped. What will the screen show?',
      code: py`
        def minus(a, b):
            return a - b

        a = 1
        b = 10
        print(minus(b, a))
      `,
      options: [
        { text: '-9', why: 'That matches values by name. Python goes by place: the first value goes to the first parameter.' },
        { text: '9', why: '' },
        { text: 'Python stops with an error', why: 'Names do not need to match, and the order can change. This code runs fine.' },
      ],
      answer: 1,
      explain: 'The first value is 10, so the parameter `a` gets 10. Inside, 10 - 1 gives 9.',
      hints: ['What is the first value inside the brackets of the call?', 'That first value goes to the first [[parameter]], `a`.'],
    },
    { id: 'fix-area', type: 'fix', level: 2,
      q: 'This function shows the area, but your code cannot use it. Make it hand the answer back.',
      code: 'def area(w, h):\n    print(w * h)\n',
      answer: 'def area(w, h):\n    return w * h\n',
      tests: [
        { label: 'area(2, 3) gives 6', call: 'area(2, 3)', want: '6' },
        { label: 'area(5, 5) gives 25', call: 'area(5, 5)', want: '25' },
      ],
      explain: '`return` hands the value back to the code that asked. `print` only shows it.',
      hints: ['Which word on line 2 should change?', 'Change `print(w * h)` to `return w * h`.'],
    },
    { id: 'write-minutes', type: 'write', level: 2,
      q: 'Write a function `minutes(hours)`. It should return how many minutes are in that many hours.',
      starter: '# Write your function below.\n',
      answer: 'def minutes(hours):\n    return hours * 60\n',
      tests: [
        { label: 'minutes(1) gives 60', call: 'minutes(1)', want: '60' },
        { label: 'minutes(2) gives 120', call: 'minutes(2)', want: '120' },
        { label: 'minutes(0) gives 0', call: 'minutes(0)', want: '0' },
      ],
      explain: 'The [[parameter]] `hours` is a tag on the value you hand in. The function returns that value times 60.',
      hints: ['Start with `def minutes(hours):`.', 'Next line: 4 spaces, then `return` and a sum.'],
    },
    { id: 'write-bigger', type: 'write', level: 3,
      q: 'Write a function `bigger(a, b)`. It should return the bigger number. If they match, return either one.',
      starter: '# Write your function below.\n',
      answer: 'def bigger(a, b):\n    if a > b:\n        return a\n    return b\n',
      tests: [
        { label: 'bigger(2, 9) gives 9', call: 'bigger(2, 9)', want: '9' },
        { label: 'bigger(9, 2) gives 9', call: 'bigger(9, 2)', want: '9' },
        { label: 'bigger(4, 4) gives 4', call: 'bigger(4, 4)', want: '4' },
      ],
      explain: 'If `a` is bigger, `return a` ends the function. If not, Python goes on to `return b`.',
      hints: ['Use `if a > b:` inside the function.', 'A function can have 2 `return` lines. Only one of them runs.'],
    },
  ],
});

/* ------------------------------------------------------------------ 4.2 */
Course.lesson('m04-functions', {
  id: '4-2-scope-and-calls',
  num: '4.2',
  title: 'Scope, and functions that call functions',
  goal: 'You can say which names a function can see, and which call finishes first.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Where does a name live?' },
    { t: 'p', text: 'Each call of a [[function]] gets its own private room. Names made in that room stay in that room. When the call ends, the room goes away.' },
    { t: 'q', id: 'secret-spark', type: 'predict', level: 1, expectError: true,
      q: 'Take a guess. What happens when this runs?',
      code: py`
        def make():
            secret = 5

        make()
        print(secret)
      `,
      options: [
        { text: '5', why: 'That thinks names made in a function can be seen everywhere. `secret` stays in the room.' },
        { text: 'Python stops with a NameError', why: '' },
        { text: 'None', why: 'None is what a call hands back with no `return`. Here `print` asks for a name instead.' },
      ],
      answer: 1,
      explain: '`secret` was made inside `make`. Outside, Python does not know that name.',
      hints: ['Where was the name `secret` made?', 'The last line is outside the function.'],
    },
    { t: 'words', items: [
      { word: 'scope', say: 'skohp', means: 'Where in the code a name can be seen.' },
      { word: 'local variable', means: 'A name made inside a function. It lasts only while that call runs.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a room with one-way windows. From inside, you can look out and read names outside. From outside, you cannot look in. Unlike a real room, Python builds it new for each call.' },
    { t: 'viz', name: 'm04-scope-rooms', caption: 'Two names, both called x. Watch which one changes.' },
    { t: 'code', caption: 'Run it. Then remove line 4 and guess again before you run it.', output: '99\n1', code: py`
      x = 1

      def change():
          x = 99
          print(x)

      change()
      print(x)
    ` },
    { t: 'q', id: 'read-outside', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        score = 10

        def show():
            print(score)

        show()
      `,
      options: [
        { text: '10', why: '' },
        { text: 'Python stops with a NameError', why: 'A function can read names from outside. It looks out through the window.' },
        { text: 'None', why: 'None would be the hand-back value. This call shows `score`, and nothing prints the hand-back.' },
      ],
      answer: 0,
      explain: '`show` has no `score` of its own, so it reads the one outside.',
      hints: ['Does `show` make its own `score`?', 'From inside the room, you can read names outside.'],
    },
    { t: 'q', id: 'set-inside', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        n = 1

        def set_n():
            n = 5

        set_n()
        print(n)
      `,
      options: [
        { text: '5', why: 'That thinks a name inside a function is the same as the one outside. This `n` is a new [[local variable]].' },
        { text: 'None', why: 'The last line prints `n`, not the value the call hands back. The outside `n` is still on 1.' },
        { text: '1', why: '' },
      ],
      answer: 2,
      explain: 'The line `n = 5` makes a new [[local variable]]. The outside `n` is still on 1.',
      hints: ['How many names called `n` are there?', 'Which `n` does the last line see?'],
    },
    { t: 'tip', title: 'Get a value out with return', text: 'A local name cannot leave the room. Its value can. Use `return` to hand the value out, then give it a name outside.' },
    { t: 'code', caption: 'Now the 5 gets out of the room. Try changing it to another number.', output: '5', code: py`
      def set_n():
          n = 5
          return n

      n = set_n()
      print(n)
    ` },
    { t: 'trap',
      think: 'a function can change an outside name by setting it.',
      real: 'Setting a name makes it local for the whole function. So this line reads `count` before it has a value, and Python stops. Pass the value in, and return the new one.',
      code: 'count = 0\n\ndef add_one():\n    count = count + 1   # Python stops here\n\nadd_one()',
    },

    { t: 'h', text: 'One function can call another' },
    { t: 'p', text: 'A function can ask another function for help. The first one waits until the helper is done. Python keeps a pile of the waiting calls.' },
    { t: 'words', items: [
      { word: 'call stack', means: 'The pile of unfinished function calls the computer remembers.' },
    ] },
    { t: 'analogy', title: 'A pile of notes', text: 'Each new job is a note on top of a pile. Python works only on the top note. When that job ends, the note comes off. Unlike real notes, each call has its own names.' },
    { t: 'viz', name: 'm04-call-stack', caption: 'Watch the pile grow, then shrink. Which call is on top?' },
    { t: 'q', id: 'order-of-prints', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        def inner():
            print("inner")

        def outer():
            print("outer starts")
            inner()
            print("outer ends")

        outer()
      `,
      options: [
        { text: 'outer starts\nouter ends\ninner', why: 'That thinks `outer` finishes before its helper runs. `outer` waits at the call until `inner` is done.' },
        { text: 'inner\nouter starts\nouter ends', why: 'The `def` for `inner` is on top, but it only saves steps. The run begins at the last line.' },
        { text: 'outer starts\ninner\nouter ends', why: '' },
      ],
      answer: 2,
      explain: '`outer` starts, then waits on the [[call stack]] while `inner` runs. Then `outer` finishes.',
      hints: ['Which line starts the whole run?', 'What does `outer` do when it reaches `inner()`?'],
    },
    { t: 'code', caption: 'A helper can do a small part of a bigger job. Change the numbers and guess first.', output: '25', code: py`
      def square(n):
          return n * n

      def two_squares(a, b):
          return square(a) + square(b)

      print(two_squares(3, 4))
    ` },
  ],
  recap: [
    'You can say where a name can be seen.',
    'You can get a value out of a function with return.',
    'You can say which call on the pile finishes first.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[scope]]', 'Where in the code a name can be seen'],
        ['[[local variable]]', 'A name made inside a function'],
        ['[[call stack]]', 'The pile of unfinished calls'],
      ],
      explain: 'A local name lives in one call. Scope says where it can be seen. The pile tracks the calls.',
      hints: ['Which word has the idea of a pile in it?'],
    },
    { id: 'pile-order', type: 'mcq', level: 1,
      q: 'Your code calls `a`. Then `a` calls `b`, and `b` calls `c`. Which call finishes first?',
      options: [
        { text: '`a`', why: '`a` started first, so it sits low on the pile. It waits for `b`.' },
        { text: '`b`', why: '`b` cannot finish yet. It is waiting for `c` to hand back an answer.' },
        '`c`',
      ],
      answer: 2,
      explain: '`c` is on top of the pile. The top call always finishes first.',
      hints: ['Draw the pile. Which call is on top?'],
    },
    { id: 'read-and-add', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        x = 3

        def f():
            y = x + 1
            print(y)

        f()
      `,
      answer: '4',
      why: '`f` reads the outside `x`, which is on 3. Then the local `y` gets 3 + 1.',
      explain: '`f` can read the outside `x`. So `y` gets 3 + 1, which is 4.',
      hints: ['Can `f` read the name `x`?', 'What is 3 + 1?'],
    },
    { id: 'fix-scope', type: 'fix', level: 2,
      q: 'Python stops on the last line, because `answer` is local. Make the program show 8.',
      code: 'def double(n):\n    answer = n * 2\n\ndouble(4)\nprint(answer)\n',
      answer: 'def double(n):\n    answer = n * 2\n    return answer\n\nanswer = double(4)\nprint(answer)\n',
      wantOutput: '8',
      explain: '`return` hands the value out of the room. Then a name outside sticks on it.',
      hints: ['Add a `return` line to the function.', 'Then keep the value: `answer = double(4)`.'],
    },
    { id: 'trace-pile', type: 'trace', level: 2,
      q: 'Fill in the pile as Python runs. Write `main` for your main code. Waiting calls are the ones under the top.',
      code: 'def small():\n    return 1\n\ndef big():\n    return small() + 1\n\nprint(big())',
      head: ['Line', 'Top of pile', 'Calls waiting'],
      rows: [
        ['7', 'main', '0'],
        ['5', 'big', '1'],
        ['2', 'small', '2'],
        ['5', 'big', '1'],
        ['7', 'main', '0'],
      ],
      given: 1,
      verify: py`
        import sys
        def log(line):
            f = sys._getframe(1)
            top = f.f_code.co_name
            n = 0
            while f.f_code.co_name != '<module>':
                f = f.f_back
                n += 1
            print(line, 'main' if top == '<module>' else top, n)
        def small():
            log(2)
            return 1
        def big():
            log(5)
            x = small()
            log(5)
            return x + 1
        log(7)
        y = big()
        log(7)
      `,
      explain: 'Each call goes on top. When it returns, it comes off, and the call below runs again.',
      hints: ['Line 7 calls `big`, so `big` goes on top.', 'Line 5 calls `small`, so `small` goes on top of `big`.'],
    },
    { id: 'write-two-squares', type: 'write', level: 2,
      q: 'Write `add_squares(a, b)`. It should use `square` twice and return the sum of the 2 squares.',
      starter: 'def square(n):\n    return n * n\n\n# Write add_squares below.\n',
      answer: 'def square(n):\n    return n * n\n\ndef add_squares(a, b):\n    return square(a) + square(b)\n',
      tests: [
        { label: 'add_squares(3, 4) gives 25', call: 'add_squares(3, 4)', want: '25' },
        { label: 'add_squares(1, 1) gives 2', call: 'add_squares(1, 1)', want: '2' },
        { label: 'add_squares(0, 2) gives 4', call: 'add_squares(0, 2)', want: '4' },
      ],
      explain: '`add_squares` calls `square` twice. Each call goes on the pile, and comes off with an answer.',
      hints: ['Start with `def add_squares(a, b):`.', 'Return `square(a) + square(b)`.'],
    },
    { id: 'two-ns', type: 'predict', level: 3,
      q: 'Both functions have an `n`. What will the screen show?',
      code: py`
        def inner(n):
            n = n + 1
            return n

        def outer(n):
            m = inner(n)
            return n + m

        print(outer(2))
      `,
      options: [
        { text: '6', why: 'That thinks `inner` changed the `n` in `outer`. Each call has its own `n`, so that one is still on 2.' },
        { text: '5', why: '' },
        { text: '4', why: 'That misses the hand-back. `m` is on what `inner` returns, which is 3 and not 2.' },
      ],
      answer: 1,
      explain: '`inner` has its own `n` and returns 3. In `outer`, `n` is still on 2, so 2 + 3 gives 5.',
      hints: ['What does `inner(2)` return?', 'Does the `n` in `outer` change?'],
    },
  ],
});

/* ------------------------------------------------------------------ 4.3 */
Course.lesson('m04-functions', {
  id: '4-3-errors-and-debugging',
  num: '4.3',
  title: 'Read an error message and find a bug',
  goal: 'You can read an error message, find its line, and use print to find a bug.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Errors are clues' },
    { t: 'p', text: 'Everyone gets errors, even experts. An error does not mean you did badly. It is Python telling you where it got stuck.' },
    { t: 'words', items: [
      { word: 'error message', means: 'The computer saying "I got stuck, and here is where."' },
      { word: 'bug', means: 'A mistake in code that makes it do the wrong thing.' },
      { word: 'debug', say: 'dee-BUG', means: 'Find a mistake in code and fix it.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a note from a cook: "I got stuck on step 3. There is no flour." It says where and why. Unlike the cook, Python only knows where it got stuck. The real cause can be earlier.' },
    { t: 'code', error: true, caption: 'Run it. Then press "Show Python\'s exact words" under the card. Those are the words to learn to read.', code: py`
      apples = 3
      pears = 4
      print(apples + total)
    ` },
    { t: 'viz', name: 'm04-read-error', caption: 'Outside this site, Python prints all of this. Here is how to read it.' },
    { t: 'list', ordered: true, items: [
      'Read the bottom line. It says what went wrong.',
      'Find the line number. Go to that line.',
      'Look at that line, and then at the lines above it.',
      'Change one thing. Run it again.',
    ] },
    { t: 'table', caption: 'Errors you will meet most', head: ['Python says', 'It means', 'Look for'], rows: [
      ['`NameError`', 'Python does not know this name.', 'A spelling slip, or a name not made yet.'],
      ['`TypeError`', 'These 2 things do not work together.', 'Text mixed with a number.'],
      ['`ZeroDivisionError`', 'You tried to divide by 0.', 'The number after the `/` sign.'],
      ['`IndentationError`', 'The spaces at the start look wrong.', 'A line not pushed in by 4 spaces.'],
      ['`SyntaxError`', 'Python could not read this line.', 'A missing colon, bracket or quote mark.'],
    ] },
    { t: 'q', id: 'name-plus-age', type: 'predict', level: 1, expectError: true,
      q: 'Which error will this give?',
      code: py`
        name = "Sam"
        age = 10
        print(name + age)
      `,
      options: [
        { text: 'NameError', why: 'Both names were made on the lines above, so Python knows them. The trouble is the values they are on.' },
        { text: 'TypeError', why: '' },
        { text: 'No error. It shows Sam10', why: 'That thinks `+` glues text and numbers. `+` needs 2 of the same kind here.' },
      ],
      answer: 1,
      explain: '`name` is on text and `age` is on a number. `+` cannot join those 2 kinds.',
      hints: ['What kind of value is `name` on?', 'What kind of value is `age` on?'],
    },
    { t: 'trap',
      think: 'the mistake is always on the line the error names.',
      real: 'That is only where Python got stuck. Here Python stops on line 2, but the real mistake is on line 4. The 8 should not be in quote marks.',
      code: 'def half(n):\n    return n / 2\n\ntext = "8"\nprint(half(text))',
    },
    { t: 'q', id: 'read-bottom', type: 'mcq', level: 2,
      q: 'The bottom line says `ZeroDivisionError: division by zero`. What should you check?',
      options: [
        { text: 'The spelling of each name', why: 'That is the check for a NameError. This error names a different problem.' },
        { text: 'The number after the `/` sign', why: '' },
        { text: 'The spaces at the start of the line', why: 'That is the check for an IndentationError. This error is about dividing.' },
      ],
      answer: 1,
      explain: 'The bottom line says what went wrong. Here a sum tried to divide by 0.',
      hints: ['Read the first word of the error slowly. It has the word zero in it.'],
    },

    { t: 'h', text: 'What if there is no error, but the answer is wrong?' },
    { t: 'p', text: 'Some bugs give no error at all. The program runs, and the answer is wrong. You can add a `print` line to look inside.' },
    { t: 'steps', title: 'Debug with print', items: [
      { label: 'Say what you expect', text: 'Say the answer you want before you run it. Here, `total_to(3)` should add 1 + 2 + 3.' },
      { label: 'Add a print', text: 'Put a `print` line where the value changes. Show the names too, so you can read it.' },
      { label: 'Compare', text: 'Find the first line that differs from what you expect. The bug is close to there.' },
      { label: 'Fix it and clean up', text: 'Fix the bug. Then remove the `print` line.' },
    ] },
    { t: 'viz', name: 'm04-debug-print', caption: 'The function runs with no error, but the answer is wrong. The print line shows why.' },
    { t: 'code', caption: 'Run it. Then change line 3 to range(1, n + 1), and run it again.', output: 'i is 0 total is 0\ni is 1 total is 1\ni is 2 total is 3\n3', code: py`
      def total_to(n):
          total = 0
          for i in range(n):
              total = total + i
              print("i is", i, "total is", total)
          return total

      print(total_to(3))
    ` },
    { t: 'q', id: 'what-print-shows', type: 'mcq', level: 2,
      q: 'A print line shows `i` as 0, then 1, then 2. You wanted 1, then 2, then 3. What is the bug?',
      options: [
        { text: 'The loop starts at 0 and stops too soon', why: '' },
        { text: 'The `print` line changes `i`', why: 'A `print` line only looks. It never changes a value.' },
        { text: 'Python is adding the numbers badly', why: 'Python does the sum you wrote. The trouble is which numbers the loop gives.' },
      ],
      answer: 0,
      explain: '`range(3)` gives 0, 1 and 2. To get 1, 2 and 3 you need `range(1, 4)`.',
      hints: ['What does `range(3)` give?', 'It starts at 0 and stops before 3.'],
    },
  ],
  recap: [
    'You can read an error from the bottom up.',
    'You can find the line an error names, and look above it.',
    'You can add a print line to find a bug.',
  ],
  practice: [
    { id: 'match-errors', type: 'match', level: 1,
      q: 'Match each error to what it means.',
      pairs: [
        ['`NameError`', 'Python does not know this name'],
        ['`TypeError`', 'These 2 values do not work together'],
        ['`ZeroDivisionError`', 'You tried to divide by 0'],
        ['`IndentationError`', 'The spaces at the start look wrong'],
      ],
      explain: 'The first word of the bottom line tells you which kind of problem it is.',
      hints: ['Look for a hint inside each error name.'],
    },
    { id: 'where-to-start', type: 'mcq', level: 1,
      q: 'You get a long [[error message]]. Which part do you read first?',
      options: [
        { text: 'The top line, Traceback', why: 'That line only says a list of steps comes next. The clue is further down.' },
        { text: 'The bottom line', why: '' },
        { text: 'None of it. Type the code again', why: 'Typing it again can bring the same [[bug]] back. The message tells you what to fix.' },
      ],
      answer: 1,
      explain: 'The bottom line names the problem. Then you go up to find the line number.',
      hints: ['Which line has the word Error in it?'],
    },
    { id: 'divide-by-zero', type: 'predict', level: 2, expectError: true,
      q: 'Which error will this give?',
      code: py`
        x = 10
        y = 0
        print(x / y)
      `,
      options: [
        { text: 'NameError', why: 'Both names were made above, so Python knows them. Look at the value `y` is on.' },
        { text: 'ZeroDivisionError', why: '' },
        { text: 'No error. It shows 0', why: 'Nobody can split something into 0 parts. Python stops, and does not guess an answer.' },
      ],
      answer: 1,
      explain: '`y` is on 0, and Python cannot divide by 0.',
      hints: ['What number is `y` on?'],
    },
    { id: 'fix-name', type: 'fix', level: 2,
      q: 'Python says `NameError: name \'scor\' is not defined`. Fix the program so it shows 6.',
      code: 'score = 5\nprint(scor + 1)\n',
      answer: 'score = 5\nprint(score + 1)\n',
      wantOutput: '6',
      explain: 'Python does not guess what you meant. The name must match exactly.',
      hints: ['Compare the name on line 1 with the name on line 2.'],
    },
    { id: 'add-a-print', type: 'write', level: 2,
      q: 'Add one `print(n)` line after line 2, so you can see `n` in the middle. Do not change the other lines.',
      starter: 'n = 3\nn = n * 2\nn = n + 1\nprint(n)\n',
      answer: 'n = 3\nn = n * 2\nprint(n)\nn = n + 1\nprint(n)\n',
      wantOutput: '6\n7',
      explain: 'The new line shows 6 in the middle of the program. The value at the end is still 7.',
      hints: ['The new line goes between `n = n * 2` and `n = n + 1`.'],
    },
    { id: 'fix-total', type: 'fix', level: 2,
      q: '`total_to(3)` should add 1 + 2 + 3 and give 6. It gives 3. Debug it.',
      code: 'def total_to(n):\n    total = 0\n    for i in range(n):\n        total = total + i\n    return total\n',
      answer: 'def total_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total = total + i\n    return total\n',
      tests: [
        { label: 'total_to(3) gives 6', call: 'total_to(3)', want: '6' },
        { label: 'total_to(1) gives 1', call: 'total_to(1)', want: '1' },
        { label: 'total_to(4) gives 10', call: 'total_to(4)', want: '10' },
      ],
      explain: '`range(1, n + 1)` starts at 1 and stops before `n + 1`. So `n` is the last number added.',
      hints: ['Add `print(i)` in the loop to see what `i` does.', 'Use `range(a, b)`. It includes `a` and stops before `b`.'],
    },
    { id: 'fix-average', type: 'fix', level: 3,
      q: '`average(2, 4)` should give 3.0. It gives 4.0. No error shows. Find the [[bug]] and fix it.',
      code: 'def average(a, b):\n    return a + b / 2\n',
      answer: 'def average(a, b):\n    return (a + b) / 2\n',
      tests: [
        { label: 'average(2, 4) gives 3.0', call: 'average(2, 4)', want: '3.0' },
        { label: 'average(10, 20) gives 15.0', call: 'average(10, 20)', want: '15.0' },
        { label: 'average(1, 2) gives 1.5', call: 'average(1, 2)', want: '1.5' },
      ],
      explain: 'Python divides before it adds. Brackets make it add first.',
      hints: ['Work out `2 + 4 / 2` by hand. Which part happens first?', 'Brackets make a part happen first.'],
    },
  ],
});

/* ------------------------------------------------------------------ 4.4 */
Course.lesson('m04-functions', {
  id: '4-4-try-except-assert',
  num: '4.4',
  title: 'try, except and assert',
  goal: 'You can catch an error with try and except, and check a function with assert.',
  mins: 12,
  steps: [
    { t: 'h', text: 'What if someone types the wrong thing?' },
    { t: 'p', text: 'Your program asks for a number. Someone types cat. Python stops with an error, and the rest of the program never runs.' },
    { t: 'code', error: true, stdin: ['cat'], caption: 'Run it. The input is cat. Then change the input to 7 and run it again.', code: py`
      n = int(input())
      print(n + 1)
    ` },
    { t: 'words', items: [
      { word: 'try / except', means: 'A way to run risky code with a backup plan. If the `try` part gets stuck, the `except` part runs.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a net under a rope walker. The walker tries the rope first. If they slip, the net catches them, and the show goes on. Unlike a net, `except` catches only the kind of error you name.' },
    { t: 'viz', name: 'm04-try-except', caption: 'Step through it. Then type a number, like 7, in the box and step through again.' },
    { t: 'code', stdin: ['cat'], caption: 'Run it with cat. Then change the input to 7. The last line runs both times.', output: 'Not a number\nBye', code: py`
      text = input()
      try:
          n = int(text)
          print("Double is", n * 2)
      except ValueError:
          print("Not a number")
      print("Bye")
    ` },
    { t: 'q', id: 'try-skips', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        try:
            x = 5 / 0
            print("A")
        except ZeroDivisionError:
            print("B")
        print("C")
      `,
      options: [
        { text: 'A\nB\nC', why: 'That thinks the `try` part always finishes. The line that fails ends it at once, so A never shows.' },
        { text: 'B\nC', why: '' },
        { text: 'B', why: 'That thinks the program ends after `except`. It carries on, so C shows too.' },
      ],
      answer: 1,
      explain: 'Line 2 fails, so Python jumps to `except` and shows B. Then it carries on and shows C.',
      hints: ['What happens on line 2?', 'Where does Python jump after a failed line?'],
    },
    { t: 'q', id: 'no-error-no-except', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        try:
            print("A")
        except ValueError:
            print("B")
        print("C")
      `,
      options: [
        { text: 'A\nC', why: '' },
        { text: 'A\nB\nC', why: 'That thinks `except` always runs. It runs only after an error, and there is none here.' },
        { text: 'B\nC', why: 'Nothing failed here, so the `try` part runs as normal and A shows.' },
      ],
      answer: 0,
      explain: 'There is no error, so Python skips the `except` part.',
      hints: ['Does anything go wrong in the `try` part?'],
    },
    { t: 'trap',
      think: '`except:` with no name is safer, because it catches everything.',
      real: 'It catches your own [[bug]] too. Here a spelling slip looks like bad input. Name the error you expect, so other errors still show.',
      code: 'text = "7"\ntry:\n    n = int(txet)   # spelling slip\nexcept:\n    print("Not a number")   # misleading',
    },

    { t: 'h', text: 'How do you know a function works?' },
    { t: 'p', text: 'You could run it and read each answer yourself. It is better to let Python check for you. Then you can repeat the check any time.' },
    { t: 'words', items: [
      { word: 'test', means: 'A small check that your code gives the right answer.' },
      { word: 'assert', say: 'uh-SERT', means: 'A check in your code. If the check is False, the program stops.' },
    ] },
    { t: 'code', caption: 'Quiet means the tests passed. Change the 10 to 11 and see what happens.', output: 'All tests passed', code: py`
      def double(n):
          return n * 2

      assert double(2) == 4
      assert double(5) == 10
      print("All tests passed")
    ` },
    { t: 'viz', name: 'm04-assert-test', caption: 'This double has a bug. Can 2 tests find it?' },
    { t: 'q', id: 'assert-quiet', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        assert 2 + 2 == 4
        print("Done")
      `,
      options: [
        { text: 'True\nDone', why: 'That thinks `assert` shows its answer. It stays quiet when the check is True.' },
        { text: 'Done', why: '' },
        { text: 'AssertionError', why: 'That happens only when the check is False. Here 2 + 2 does equal 4.' },
      ],
      answer: 1,
      explain: 'The check is True, so `assert` stays quiet. Then `print` shows Done.',
      hints: ['Is 2 + 2 == 4 True or False?', 'What does `assert` do with a True check?'],
    },
    { t: 'q', id: 'fill-assert', type: 'fill', level: 2,
      q: 'Fill the gaps to [[test]] `add`. The program should show ok.',
      code: 'def add(a, b):\n    return a + b\n\n____ add(2, 3) ____ 5\nprint("ok")',
      blanks: ['assert', '=='],
      output: 'ok',
      explain: '`assert` makes the check. `==` asks if 2 values match. One `=` would set a name, not ask.',
      hints: ['Which word makes a check?', 'To ask if 2 things match, use 2 equals signs.'],
    },
    { t: 'tip', title: 'Good tests', text: 'Use more than one test. Try a normal value, then a strange one like 0. Each test can catch a different [[bug]].' },
  ],
  recap: [
    'You can catch a named error with try and except.',
    'You can say what runs when there is no error.',
    'You can write a test with assert.',
  ],
  practice: [
    { id: 'when-except', type: 'mcq', level: 1,
      q: 'When does the `except` part run?',
      options: [
        { text: 'Every time', why: 'That thinks `except` is a normal next step. It is a backup plan, so it waits for a problem.' },
        { text: 'Only after an error in the `try` part', why: '' },
        { text: 'Before the `try` part', why: 'Python runs the `try` part first. It cannot know about a problem before that.' },
      ],
      answer: 1,
      explain: '`except` is the backup plan. With no error, Python skips it.',
      hints: ['Think of the net under the rope walker. When does the net do its job?'],
    },
    { id: 'works-fine', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        try:
            print(int("4") + 1)
        except ValueError:
            print("no")
      `,
      answer: '5',
      why: 'The text "4" can turn into a number, so nothing fails. Python skips the `except` part.',
      explain: '`int("4")` gives 4, and 4 + 1 is 5. There is no error, so Python skips the `except` part.',
      hints: ['Can the text "4" turn into a number?'],
    },
    { id: 'order-safe', type: 'order', level: 2,
      q: 'Put the lines in order. The program should show Not a number. One line is not needed.',
      lines: ['text = "hi"', 'try:', '    print(int(text))', 'except ValueError:', '    print("Not a number")'],
      extra: ['if ValueError:'],
      output: 'Not a number',
      explain: 'The risky line goes in the `try` part. The backup plan goes in the `except` part.',
      hints: ['`try:` comes before the risky line.', 'The word that follows the `try` part is `except`.'],
    },
    { id: 'fix-wrong-kind', type: 'fix', level: 2,
      q: '`safe_div(1, 0)` should return 0, but Python still stops. Fix the `except` line.',
      code: 'def safe_div(a, b):\n    try:\n        return a / b\n    except ValueError:\n        return 0\n',
      answer: 'def safe_div(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return 0\n',
      tests: [
        { label: 'safe_div(8, 2) gives 4.0', call: 'safe_div(8, 2)', want: '4.0' },
        { label: 'safe_div(1, 0) gives 0', call: 'safe_div(1, 0)', want: '0' },
      ],
      explain: '`except` catches only the kind of error you name. Dividing by 0 gives a ZeroDivisionError.',
      hints: ['Which error happens when you divide by 0?'],
    },
    { id: 'fix-is-even', type: 'fix', level: 2,
      q: 'The [[test]] lines are right, but the function has a bug. Fix the function so all tests pass.',
      code: 'def is_even(n):\n    return n % 2 == 1\n\nassert is_even(4) == True\nassert is_even(7) == False\nprint("All tests passed")\n',
      answer: 'def is_even(n):\n    return n % 2 == 0\n\nassert is_even(4) == True\nassert is_even(7) == False\nprint("All tests passed")\n',
      wantOutput: 'All tests passed',
      explain: 'An even number leaves 0 after you divide by 2. So the check should be `n % 2 == 0`.',
      hints: ['The `%` sign gives what is left over. What is `4 % 2`?', 'Change the number at the end of line 2.'],
    },
    { id: 'wrong-kind', type: 'predict', level: 3, expectError: true,
      q: 'The `except` names a kind of error. What happens when this runs?',
      code: py`
        try:
            print(1 / 0)
        except ValueError:
            print("oops")
      `,
      options: [
        { text: 'oops', why: 'That thinks `except` catches every error. It catches only the kind you name, and this is not a ValueError.' },
        { text: 'Python stops with a ZeroDivisionError', why: '' },
        { text: 'Nothing shows and the program ends fine', why: 'The error does not vanish. No `except` matches it, so Python stops.' },
      ],
      answer: 1,
      explain: 'Dividing by 0 gives a ZeroDivisionError. This `except` only catches a ValueError, so Python stops.',
      hints: ['Which kind of error does `1 / 0` give?', 'Does that match the name after `except`?'],
    },
    { id: 'write-to-grade', type: 'write', level: 3,
      q: 'The tests are ready. Write `grade(score)` so they pass. It returns "pass" for 50 or more, and "try again" for less.',
      starter: '# Write grade here.\n\nassert grade(50) == "pass"\nassert grade(49) == "try again"\nassert grade(100) == "pass"\nprint("All tests passed")\n',
      answer: 'def grade(score):\n    if score >= 50:\n        return "pass"\n    return "try again"\n\nassert grade(50) == "pass"\nassert grade(49) == "try again"\nassert grade(100) == "pass"\nprint("All tests passed")\n',
      wantOutput: 'All tests passed',
      explain: 'The tests came first, and your code came after. Each [[assert]] checks one case, and quiet means it passed.',
      hints: ['Start with `def grade(score):` above the tests.', 'Use `if score >= 50:` and 2 `return` lines.'],
    },
  ],
});
