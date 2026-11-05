/* Module 2: Making Decisions. Part 1 (Learn Python). */
Course.module({
  id: 'm02-decisions',
  num: 2, part: 1, level: 'B',
  title: 'Making Decisions',
  blurb: 'Ask the computer questions, and make it choose what to do next.',
  needs: ['m01-hello-code'],
});

Course.lesson('m02-decisions', {
  id: '2-1-true-false-compare',
  num: '2.1',
  title: 'True, False and comparing',
  goal: 'You can compare 2 values and say if the answer is True or False.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Can a computer answer a question?' },
    { t: 'p', text: 'Is 9 smaller than 10? Python can answer that. It says yes with `True`, and it says no with `False`.' },
    { t: 'code', caption: 'Run it. Python answers each question.',
      code: py`
        print(9 < 10)
        print(9 > 10)
      `,
      output: 'True\nFalse',
    },
    { t: 'analogy', title: 'Picture this', text: 'Picture a judge with 2 cards. One card says True, and the other says False. You show the judge 2 values, and the judge holds up 1 card. Unlike a real judge, Python has no opinion. It only follows the rule.' },
    { t: 'words', items: [
      { word: 'boolean', means: 'A value that is only True or False. Python calls it `bool`.', say: 'BOO-lee-un' },
      { word: 'operator', means: 'A symbol that does a job, like `+` or `>`.', say: 'OP-er-ay-ter' },
      { word: 'condition', means: 'A question the program asks, with a True or False answer.' },
    ] },
    { t: 'table', caption: 'The 6 operators that compare', head: ['Operator', 'It asks', 'Example', 'Answer'], rows: [
      ['`==`', 'Are they the same?', '`3 == 3`', '`True`'],
      ['`!=`', 'Are they different?', '`3 != 3`', '`False`'],
      ['`<`', 'Is the left one smaller?', '`2 < 5`', '`True`'],
      ['`>`', 'Is the left one bigger?', '`2 > 5`', '`False`'],
      ['`<=`', 'Smaller, or the same?', '`5 <= 5`', '`True`'],
      ['`>=`', 'Bigger, or the same?', '`4 >= 5`', '`False`'],
    ] },
    { t: 'viz', name: 'm02-compare', caption: 'Step through it. Then type a new number in the box. Try 10 next.' },
    { t: 'q', id: 'smaller-not-same', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'print(10 < 10)',
      options: [
        { text: 'True', why: 'The `<` sign means smaller, and 10 is not smaller than 10. Use `<=` to count the same value.' },
        { text: 'False', why: '' },
        { text: '10', why: 'A [[condition]] does not give back a number. It gives `True` or `False`.' },
      ],
      answer: 1,
      explain: '10 is the same as 10, so it is not smaller. The answer is `False`.',
      hints: ['Is 10 smaller than 10?'],
    },
    { t: 'h', text: 'One = does a job. Two == ask a question' },
    { t: 'table', head: ['Code', 'Read it as', 'What it does'], rows: [
      ['`x = 5`', 'x gets 5', 'Moves the tag. It gives no answer.'],
      ['`x == 5`', 'Is x the same as 5?', 'Gives `True` or `False`. It changes nothing.'],
    ] },
    { t: 'code', caption: 'Asking does not change `x`. It is still 5 at the end.',
      code: py`
        x = 5
        print(x == 5)
        print(x == 7)
        print(x)
      `,
      output: 'True\nFalse\n5',
    },
    { t: 'q', id: 'which-line-asks', type: 'mcq', level: 1,
      q: 'Which code asks: is `score` the same as 10?',
      options: [
        { text: '`score = 10`', why: 'One `=` moves the tag. It does not ask anything.' },
        { text: '`score == 10`', why: '' },
        { text: '`score != 10`', why: 'The `!=` operator asks if they are different.' },
      ],
      answer: 1,
      explain: 'Two equal signs ask if the values are the same. One equal sign moves a tag.',
      hints: ['How many equal signs does a question need?'],
    },
    { t: 'q', id: 'fill-the-operators', type: 'fill', level: 2,
      q: 'Fill each gap. The first line asks if they are the same. The second asks if they are different.',
      code: py`
        age = 12
        print(age ____ 12)
        print(age ____ 12)
      `,
      blanks: ['==', '!='],
      output: 'True\nFalse',
      explain: 'The `==` [[operator]] asks if they are the same. The `!=` [[operator]] asks if they are different.',
      why: 'Look at the table of operators, and check the first and second rows.',
      hints: ['Both answers have 2 symbols.', 'The second symbol in both is `=`.'],
    },
    { t: 'h', text: 'Python compares exactly' },
    { t: 'code', caption: 'Capital letters matter. Text is never the same as a number.',
      code: py`
        print("cat" == "cat")
        print("cat" == "Cat")
        print("5" == 5)
      `,
      output: 'True\nFalse\nFalse',
    },
    { t: 'p', text: 'You can also stick a name tag on the answer. A [[boolean]] is a value, like a number or some text.' },
    { t: 'code', caption: 'Run it. Then change 12 to 8.',
      code: py`
        age = 12
        can_ride = age >= 10
        print(can_ride)
      `,
      output: 'True',
    },
    { t: 'trap',
      think: '`true` and `True` are the same thing.',
      real: 'Python only knows `True` and `False` with a capital letter. With `true`, Python looks for a tag with that name and stops with a `NameError`.',
      code: py`
        print(True)   # shows True
        print(true)   # NameError
      `,
    },
    { t: 'big', text: 'A comparison is a question. Python always answers it with `True` or `False`.' },
  ],
  recap: [
    'You can compare with `==`, `!=`, `<` and `>`.',
    'You can tell `=` from `==`.',
    'You can say why `"5" == 5` is `False`.',
  ],
  practice: [
    { id: 'bigger-than', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        print(7 > 3)
        print(7 < 3)
      `,
      options: [
        { text: 'True\nTrue', why: 'The sign changed on line 2. Is 7 smaller than 3?' },
        { text: 'True\nFalse', why: '' },
        { text: '7\n3', why: 'Python does not print the bigger number. A comparison gives `True` or `False`.' },
      ],
      answer: 1,
      explain: '7 is bigger than 3, so line 1 is `True`. 7 is not smaller than 3, so line 2 is `False`.',
      hints: ['The open side of the sign points at the bigger value.'],
    },
    { id: 'match-operators', type: 'match', level: 1,
      q: 'Match each operator to the question it asks.',
      pairs: [
        ['`==`', 'Are they the same?'],
        ['`!=`', 'Are they different?'],
        ['`<`', 'Is the left one smaller?'],
        ['`>=`', 'Bigger, or the same?'],
      ],
      explain: 'In `<=` and `>=`, the `=` means that the same value counts too.',
      hints: ['The `!` sign means not.'],
    },
    { id: 'or-the-same', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'print(5 >= 5)',
      options: [
        { text: 'False', why: 'You may be thinking of `>`. The `>=` operator asks: bigger, or the same?' },
        { text: 'True', why: '' },
        { text: '5', why: 'A comparison does not give a number. It gives `True` or `False`.' },
      ],
      answer: 1,
      explain: 'The `>=` operator counts the same value too. 5 is the same as 5.',
      hints: ['Read `>=` out loud as: bigger, or the same.'],
    },
    { id: 'one-equal-sign', type: 'fix', level: 2,
      q: 'This should print `True`. Python got stuck on line 2. Fix that line.',
      code: py`
        x = 5
        print(x = 5)
      `,
      answer: py`
        x = 5
        print(x == 5)
      `,
      wantOutput: 'True',
      explain: 'One `=` moves a tag. Two `==` ask a question, and the question gives `True`.',
      hints: ['How many equal signs does a question need?'],
    },
    { id: 'old-enough', type: 'write', level: 2,
      q: 'Add 1 line that prints the answer to this question: is `age` 10 or more?',
      starter: 'age = 12\n',
      answer: py`
        age = 12
        print(age >= 10)
      `,
      wantOutput: 'True',
      explain: 'The `>=` operator counts the same value too, so 10 would also be `True`.',
      hints: ['Use `print` with a comparison inside.', 'Which operator means bigger, or the same?'],
    },
    { id: 'typed-seven', type: 'predict', level: 3,
      q: 'Stretch: you type 7 when the program waits. What will the screen show?',
      code: py`
        answer = input()
        print(answer == 7)
      `,
      stdin: ['7'],
      options: [
        { text: 'True', why: '`input()` gives text. The text `"7"` is not the same as the number 7.' },
        { text: 'False', why: '' },
        { text: '7', why: 'The `==` operator asks a question, so the answer is `True` or `False`.' },
      ],
      answer: 1,
      explain: '`answer` is on the text `"7"`, and text is never the same as a number. Use `int(input())` to fix this.',
      hints: ['What type does `input()` give back?'],
    },
    { id: 'same-word', type: 'write', level: 3,
      q: 'Stretch: read 2 words with `input()`, called `a` and `b`. Print `True` if they are the same, and `False` if not.',
      starter: '# Use input() 2 times. The Input box holds cat and Cat.\n',
      stdin: ['cat', 'Cat'],
      answer: py`
        a = input()
        b = input()
        print(a == b)
      `,
      wantOutput: 'False',
      tests: [
        { label: 'a is on the first word', check: 'a == "cat"' },
        { label: 'b is on the second word', check: 'b == "Cat"' },
        { label: 'You read the Input box with input()', check: '__import__("sys").stdin.read() == ""' },
      ],
      explain: 'Capital letters matter, so `"cat"` and `"Cat"` are not the same.',
      hints: ['Use `input()` 2 times.', 'Put a comparison inside `print`.'],
    },
  ],
});

Course.lesson('m02-decisions', {
  id: '2-2-if-elif-else',
  num: '2.2',
  title: 'Choosing a path: if, elif, else',
  goal: 'You can make a program choose a path using if, elif, else, and, or and not.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How does a program choose?' },
    { t: 'p', text: 'You make choices all day. If it rains, you take a coat. Your code can choose too.' },
    { t: 'analogy', title: 'Picture this', text: 'Picture a path that splits in 2. A sign asks a question, and the answer tells you which way to walk. You walk only 1 way. Unlike a real path, the 2 ways in code always join up again below.' },
    { t: 'words', items: [
      { word: 'if / else', means: 'Do this if the answer is yes. Do that if it is no.' },
      { word: 'elif', means: 'Short for "else if". Ask a new question when the last answer was no.', say: 'ELL-if' },
      { word: 'indentation', means: 'Spaces at the start of a line. In Python they show what belongs together.', say: 'in-den-TAY-shun' },
    ] },
    { t: 'steps', title: 'Build a choice', items: [
      { label: 'Ask a question', text: 'Write `if`, then a [[condition]], then a colon.', code: 'if age >= 10:' },
      { label: 'Say what to do for yes', text: 'Put 4 spaces in front. This [[indentation]] shows the line belongs to the `if`.', code: '    print("You can ride.")' },
      { label: 'Say what to do for no', text: 'Write `else` and a colon, then an indented line.', code: 'else:\n    print("Too young.")' },
    ] },
    { t: 'code', caption: 'Run it. Then change 12 to 8. Guess the output before you run it.',
      code: py`
        age = 12
        if age >= 10:
            print("You can ride.")
        else:
            print("Too young.")
        print("Have a nice day.")
      `,
      output: 'You can ride.\nHave a nice day.',
    },
    { t: 'p', text: 'Use [[elif]] when you have more than 2 paths. Python asks from the top and stops at the first True.' },
    { t: 'viz', name: 'm02-branches', caption: 'Step through it. Then type a new score in the box. Try 9, then 2.' },
    { t: 'q', id: 'only-one-path', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        n = 7
        if n > 5:
            print("A")
        elif n > 2:
            print("B")
        else:
            print("C")
      `,
      options: [
        { text: 'A', why: '' },
        { text: 'A\nB', why: 'You may think each question gets asked. After the first True, Python skips the rest of the chain.' },
        { text: 'A\nB\nC', why: 'Only 1 path in a chain runs. It does not run `if`, `elif` and `else` together.' },
      ],
      answer: 0,
      explain: 'The first question is True, so Python prints A. Then it skips the rest of the chain.',
      hints: ['Which question comes first? What is its answer?', 'What does Python do after the first True?'],
    },
    { t: 'code', caption: 'Here are 2 separate `if` lines, not a chain. Each asks its own question, so both can run.',
      code: py`
        n = 7
        if n > 5:
            print("big")
        if n > 2:
            print("not tiny")
      `,
      output: 'big\nnot tiny',
    },
    { t: 'code', error: true, caption: 'Python gets stuck on line 2. One `=` moves a tag, but `if` needs a question. Change it to `==` and run it again.',
      code: py`
        x = 5
        if x = 5:
            print("five")
      `,
    },
    { t: 'q', id: 'order-hot', type: 'order', level: 2,
      q: 'Put these lines in order, so the program prints Hot. One line is not needed.',
      lines: ['temp = 30', 'if temp > 25:', '    print("Hot")', 'else:', '    print("Not hot")'],
      extra: ['if temp = 30:'],
      output: 'Hot',
      explain: 'First make the name. Then ask the question. Each indented line goes under the line it belongs to.',
      hints: ['A question needs `==` or `>`, not one `=`.', 'An indented line goes right under its colon.'],
    },
    { t: 'h', text: 'How do you ask 2 things at once?' },
    { t: 'table', caption: 'Three words that join or flip answers', head: ['Word', 'True when', 'Example', 'Answer'], rows: [
      ['`and`', 'both sides are True', '`5 > 1 and 5 > 9`', '`False`'],
      ['`or`', 'at least 1 side is True', '`5 > 1 or 5 > 9`', '`True`'],
      ['`not`', 'it flips the answer', '`not 5 > 9`', '`True`'],
    ] },
    { t: 'code', caption: 'Run it. Then change `True` to `False`, and guess first.',
      code: py`
        age = 11
        has_ticket = True
        if age >= 10 and has_ticket:
            print("Come in!")
        else:
            print("Not today.")
      `,
      output: 'Come in!',
    },
    { t: 'q', id: 'and-needs-both', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        x = 5
        if x > 1 and x > 9:
            print("yes")
        else:
            print("no")
      `,
      options: [
        { text: 'yes', why: 'You may be thinking of `or`. The word `and` needs both sides to be True.' },
        { text: 'no', why: '' },
        { text: 'yes\nno', why: 'Only 1 path runs. Python never runs both `if` and `else`.' },
      ],
      answer: 1,
      explain: '`x > 1` is True, but `x > 9` is False. The word `and` needs both, so `else` runs.',
      hints: ['Work out each side by itself.', 'Is 5 bigger than 9?'],
    },
    { t: 'trap',
      think: '`if x == 1 or 2:` asks if `x` is 1 or 2.',
      real: 'Python works out each side by itself. A lone `2` counts as True, so this `if` always runs. Write the full question on both sides.',
      code: py`
        x = 5
        if x == 1 or x == 2:
            print("yes")
      `,
    },
    { t: 'big', text: 'Python asks from the top. It runs the first path with a True answer, then skips the rest.' },
  ],
  recap: [
    'You can write `if`, `elif` and `else` with [[indentation]].',
    'You can say why only 1 path in a chain runs.',
    'You can join questions with `and`, `or` and `not`.',
  ],
  practice: [
    { id: 'skip-the-indented', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        x = 2
        if x > 5:
            print("big")
        print("end")
      `,
      options: [
        { text: 'big\nend', why: '`x` is 2, so `x > 5` is False. Python skips the indented line.' },
        { text: 'end', why: '' },
        { text: 'big', why: 'The last line has no indentation. So it is not part of the `if`, and it always runs.' },
      ],
      answer: 1,
      explain: 'The question is False, so Python skips the indented line. The last line always runs.',
      hints: ['Is 2 bigger than 5?', 'Which line has no spaces in front?'],
    },
    { id: 'flip-it', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        print(not True)
        print(not 5 > 9)
      `,
      options: [
        { text: 'True\nFalse', why: 'The word `not` flips the answer. So `not True` is `False`.' },
        { text: 'False\nTrue', why: '' },
        { text: 'False\nFalse', why: 'Work out `5 > 9` first. It is `False`, and `not` flips it to `True`.' },
      ],
      answer: 1,
      explain: 'The word `not` flips each answer. `True` becomes `False`, and `False` becomes `True`.',
      hints: ['Line 2: work out `5 > 9` first, then flip it.'],
    },
    { id: 'trace-the-medals', type: 'trace', level: 2,
      q: 'Follow the code for each score. Fill in what it prints.',
      code: py`
        if score >= 9:
            print("Gold")
        elif score >= 5:
            print("Silver")
        else:
            print("Bronze")
      `,
      head: ['score', 'prints'],
      rows: [['9', 'Gold'], ['8', 'Silver'], ['5', 'Silver'], ['4', 'Bronze']],
      given: 1,
      verify: py`
        for score in [9, 8, 5, 4]:
            if score >= 9:
                out = "Gold"
            elif score >= 5:
                out = "Silver"
            else:
                out = "Bronze"
            print(score, out)
      `,
      explain: 'Python asks from the top. It stops at the first True, and `else` catches the rest.',
      hints: ['Start with the top question each time.', 'Does 5 count for `score >= 5`?'],
    },
    { id: 'or-both-sides', type: 'fix', level: 2,
      q: 'This should print `no`, as 5 is not 3 or 7. Python prints `yes`. Fix line 2.',
      code: py`
        x = 5
        if x == 3 or 7:
            print("yes")
        else:
            print("no")
      `,
      answer: py`
        x = 5
        if x == 3 or x == 7:
            print("yes")
        else:
            print("no")
      `,
      wantOutput: 'no',
      explain: 'Python works out each side of `or` by itself. So each side needs its own full question.',
      hints: ['What does a lone `7` count as?', 'Write `x ==` on both sides of `or`.'],
    },
    { id: 'child-or-adult', type: 'write', level: 2,
      q: 'Read a whole number, called `age`. Print `Child` if it is under 13. Print `Adult` if not.',
      starter: '# Use input(). The Input box already holds 12.\n',
      stdin: ['12'],
      answer: py`
        age = int(input())
        if age < 13:
            print("Child")
        else:
            print("Adult")
      `,
      wantOutput: 'Child',
      tests: [
        { label: 'age is the number 12', check: 'age == 12' },
        { label: 'You read the Input box with input()', check: '__import__("sys").stdin.read() == ""' },
      ],
      explain: 'The question picks 1 of 2 paths. Try typing 13 in the Input box too.',
      hints: ['Start with `age = int(input())`.', 'Use `if age < 13:` and then `else:`.', 'Put 4 spaces before each print.'],
    },
    { id: 'first-true-wins', type: 'fix', level: 3,
      q: 'Stretch: a score of 95 should print `Top`. It prints `Pass`. Fix the order of the questions.',
      code: py`
        score = 95
        if score >= 50:
            print("Pass")
        elif score >= 90:
            print("Top")
      `,
      answer: py`
        score = 95
        if score >= 90:
            print("Top")
        elif score >= 50:
            print("Pass")
      `,
      wantOutput: 'Top',
      explain: 'Python stops at the first True. So ask the harder question first.',
      hints: ['Is 95 bigger than 50? What happens next?', 'Which question should Python ask first?'],
    },
    { id: 'can-you-ride', type: 'write', level: 3,
      q: 'Stretch: read `age`, then `height`, both whole numbers. Print `Ride` if age is at least 8 and height is at least 120. Print `Wait` if not.',
      starter: '# Use input() 2 times. The Input box holds 9 and 130.\n',
      stdin: ['9', '130'],
      answer: py`
        age = int(input())
        height = int(input())
        if age >= 8 and height >= 120:
            print("Ride")
        else:
            print("Wait")
      `,
      wantOutput: 'Ride',
      tests: [
        { label: 'age is the number 9', check: 'age == 9' },
        { label: 'height is the number 130', check: 'height == 130' },
        { label: 'You read the Input box with input()', check: '__import__("sys").stdin.read() == ""' },
      ],
      explain: 'The word `and` needs both sides to be True. Try 9 and 100 in the Input box too.',
      hints: ['Read 2 numbers with `int(input())`.', 'Which word joins 2 questions when both must be True?', 'Write a full question on each side of `and`.'],
    },
  ],
});
