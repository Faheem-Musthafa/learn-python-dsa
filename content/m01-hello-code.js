/* Module 1: Hello, Code. Part 1 (Learn Python). */
Course.module({
  id: 'm01-hello-code',
  num: 1, part: 1, level: 'B',
  title: 'Hello, Code',
  blurb: 'What code is, and how to make the computer say something.',
  needs: [],
});

Course.lesson('m01-hello-code', {
  id: '1-1-what-is-code',
  num: '1.1',
  title: 'What is code?',
  goal: 'You can say what code is, and make the computer print words in order.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How do you tell a computer what to do?' },
    { t: 'p', text: 'A computer is very fast, but it cannot think for itself. You have to tell it each step. Before you see any code, try this puzzle.' },
    { t: 'q', id: 'robot-steps', type: 'mcq', level: 1,
      q: 'A robot follows your steps exactly. Step 1: Pour the milk. Step 2: Put a cup on the table. What happens?',
      options: [
        { text: 'It puts the cup down first, then pours the milk.', why: 'You may think it knows what you meant. It only follows the steps, in the order you gave.' },
        { text: 'It pours milk on the table, then adds a cup.', why: '' },
        { text: 'It stops and asks what you really meant.', why: 'This robot never asks. It does each step, even a silly one.' },
      ],
      answer: 1,
      explain: 'The robot does step 1, then step 2. It cannot see that the order is silly.',
      hints: ['Which step does the robot do first?', 'Is there a cup on the table when it does step 1?'],
    },
    { t: 'h', text: 'What are code and a program?' },
    { t: 'analogy', title: 'Picture this', text: 'A recipe is a list of steps for a cook. Code is a recipe for a computer. Unlike a cook, a computer never spots a silly step and fixes it.' },
    { t: 'words', items: [
      { word: 'code', means: 'The words and symbols you type to give the computer steps.' },
      { word: 'program', means: 'A list of steps for the computer, written in a language it knows.', say: 'PRO-gram' },
      { word: 'print', means: 'Show something on the screen. It does not use paper.' },
    ] },
    { t: 'p', text: 'You write [[code]], and your lines of code make a [[program]]. In this course, you write code in a language called [[Python]].' },
    { t: 'steps', title: 'Read your first line of code', items: [
      { label: 'Name the job', text: 'The word `print` is the job. It shows something on the screen.', code: 'print' },
      { label: 'Add round brackets', text: 'The brackets hold what `print` must show.', code: 'print()' },
      { label: 'Add the words', text: 'Quote marks hold the exact words to show.', code: 'print("Hello!")' },
    ] },
    { t: 'code', caption: 'Press [[Run|run]]. That tells the computer to follow your steps now. Then change the words inside the quote marks, and press Run again.',
      code: 'print("Hello!")',
      output: 'Hello!',
    },
    { t: 'h', text: 'In what order do the lines run?' },
    { t: 'p', text: 'A [[program]] can have many lines. The computer runs them one at a time, from top to bottom. Each [[print]] starts on a new line.' },
    { t: 'viz', name: 'm01-steps-run', caption: 'Use the arrows to step through it, or press Play. Make a guess each time it asks.' },
    { t: 'q', id: 'order-of-lines', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        print("Hi")
        print("Bye")
      `,
      options: [
        { text: 'Bye\nHi', why: 'The computer runs the top line first, so Hi comes first.' },
        { text: 'Hi\nBye', why: '' },
        { text: 'Hi Bye', why: 'Each print starts on a new line, so Hi and Bye are not on one line.' },
      ],
      answer: 1,
      explain: 'The computer runs the top line first. Each print starts on a new line.',
      hints: ['Which line does the computer run first?', 'Look at the top line. What does it print?'],
    },
    { t: 'code', caption: 'Run it. Then swap lines 1 and 3. Guess what the screen will show before you run it again.',
      code: py`
        print("Ready")
        print("Set")
        print("Go!")
      `,
      output: 'Ready\nSet\nGo!',
    },
    { t: 'q', id: 'order-the-morning', type: 'order', level: 1,
      q: 'Put these lines in order. The screen should show Socks, then Shoes, then Door.',
      lines: ['print("Socks")', 'print("Shoes")', 'print("Door")'],
      output: 'Socks\nShoes\nDoor',
      explain: 'The top line runs first, so Socks must go at the top.',
      hints: ['Which word should show first?', 'The line for that word goes at the top.'],
    },
    { t: 'h', text: 'Does the computer guess what you meant?' },
    { t: 'big', text: 'The computer does exactly what the code says, in order. It does not guess what you meant.' },
    { t: 'p', text: 'So one wrong letter can stop your program. Python cannot tell what you were trying to write. Try it here.' },
    { t: 'code', error: true, caption: 'Python gets stuck on line 1. `NameError` means: I do not know that name. Add the missing letter, then run it again.',
      code: 'prnt("Hello!")',
    },
    { t: 'tip', title: 'Getting stuck is normal', text: 'Everyone who writes code gets messages like this, every day. The message tells you where Python got stuck. Read it, fix the line, and run it again.' },
    { t: 'q', id: 'capital-p', type: 'predict', level: 2,
      q: 'Look closely at the first letter. What happens when this runs?',
      code: 'Print("Hi")',
      expectError: true,
      options: [
        { text: 'Hi', why: 'You can tell what it means, but Python cannot. To Python, `Print` and `print` are two different names.' },
        'NameError',
        { text: 'Print("Hi")', why: 'Python does not show the line itself. It tries to follow the step, and it gets stuck.' },
      ],
      answer: 1,
      explain: 'A capital P is a different letter to Python. It knows no job called `Print`, so it stops with a `NameError`.',
      hints: ['Compare this line to the ones you ran before.', 'Does Python guess that you meant `print`?'],
    },
    { t: 'trap',
      think: '`print(Hello)` shows Hello, because the computer can see what I mean.',
      real: 'With no quote marks, Python looks for a name. It cannot find one, so it stops with a `NameError`. Put quote marks around words you want to show.',
      code: 'print("Hello")',
    },
  ],
  recap: [
    'You can say what code and a program are.',
    'You can tell the order that lines run in.',
    'You can use `print` to show exact words.',
  ],
  practice: [
    { id: 'what-is-program', type: 'mcq', level: 1,
      q: 'What is a program?',
      options: [
        'A list of steps for the computer',
        { text: 'A picture of a computer', why: 'A program is steps, not a picture.' },
        { text: 'A kind of keyboard', why: 'A keyboard is a thing you type on. A program is steps for the computer to follow.' },
      ],
      answer: 0,
      explain: 'A program is a list of steps. The computer follows the steps in order.',
      hints: ['A program tells the computer what to do. What kind of thing does that?'],
    },
    { id: 'match-first-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['code', 'The words and symbols you type'],
        ['program', 'A list of steps for the computer'],
        ['`print`', 'Shows something on the screen'],
        ['run', 'Tell the computer to follow the steps now'],
      ],
      explain: 'You type code to make a program. When you run it, the computer follows the steps.',
      hints: ['Which word is about the screen?', 'Which word is something you do with a finished program?'],
    },
    { id: 'say-ready', type: 'write', level: 1,
      q: 'Make the screen show the word Ready. The line that starts with # is a note for you. The computer skips it.',
      starter: '# Type your code on the line below.\n',
      answer: 'print("Ready")',
      wantOutput: 'Ready',
      explain: 'print shows the words inside the quote marks.',
      hints: ['Use print.', 'Put the word Ready inside quote marks, like "Ready".'],
    },
    { id: 'false-sum', type: 'predict', level: 2,
      q: 'Look at the sum inside the quote marks. What will the screen show?',
      code: 'print("2 + 2 = 5")',
      options: [
        { text: '2 + 2 = 4', why: 'You know the real answer is 4. But the computer does not fix your words.' },
        '2 + 2 = 5',
        { text: 'Nothing at all', why: 'You may think the computer checks if words are true. It does not. It shows them.' },
      ],
      answer: 1,
      explain: 'The computer does not check if your words are true. Quote marks say: show exactly this.',
      hints: ['Does the computer know what you meant to write?', 'What do quote marks tell it to do?'],
    },
    { id: 'fix-the-order', type: 'fix', level: 2,
      q: 'This program should show Wake up, then Eat. The lines are in the wrong order. Fix it.',
      code: py`
        print("Eat")
        print("Wake up")
      `,
      answer: py`
        print("Wake up")
        print("Eat")
      `,
      wantOutput: 'Wake up\nEat',
      explain: 'The computer runs lines from top to bottom. So the line for Wake up must come first.',
      hints: ['Which line does the computer run first?', 'Swap the 2 lines.'],
    },
    { id: 'fix-quote-marks', type: 'fix', level: 2,
      q: 'This program should show Hello. Python gets stuck on line 1. Fix it.',
      code: 'print(Hello)',
      answer: 'print("Hello")',
      wantOutput: 'Hello',
      explain: 'Quote marks tell Python to show these exact words. With no quote marks, it looks for a name.',
      hints: ['Compare this line to your first line of code.', 'What is missing around the word Hello?'],
    },
    { id: 'draw-a-tree', type: 'write', level: 3,
      q: 'Stretch: draw this tree with 3 `print` lines. Spaces count too, so put them inside the quote marks.',
      starter: '# Type your code on the lines below.\n',
      answer: 'print("  *")\nprint(" ***")\nprint("*****")',
      wantOutput: '  *\n ***\n*****',
      explain: 'Each print starts a new line, from top to bottom. The computer shows every space you put in the quote marks.',
      hints: ['You need one print for each line of the tree.', 'The top line has 2 spaces, then 1 star.', 'The next line has 1 space, then 3 stars.'],
    },
  ],
});

Course.lesson('m01-hello-code', {
  id: '1-2-print-variables-types',
  num: '1.2',
  title: 'print, variables and types',
  goal: 'You can make a variable, print it, say what type its value is, and do sums.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Can code remember things?' },
    { t: 'p', text: 'So far, `print` shows words you put in the code. Now you make the computer remember things. First, make a guess.' },
    { t: 'q', id: 'quotes-or-sum', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        print("2 + 3")
        print(2 + 3)
      `,
      options: [
        { text: '5\n5', why: 'Quote marks tell Python that this is text. It shows the text as it is, with no sum.' },
        { text: '2 + 3\n5', why: '' },
        { text: '2 + 3\n2 + 3', why: 'The second line has no quote marks. So Python works out the sum.' },
      ],
      answer: 1,
      explain: 'Inside quote marks, Python shows the text as it is. With no quote marks, it does the sum.',
      hints: ['Look for the quote marks. Which line has them?', 'Text in quote marks is shown as it is.'],
    },
    { t: 'h', text: 'A name tag for a value' },
    { t: 'analogy', title: 'Picture this', text: 'Think of a name tag stuck on a thing. You read the tag, and you find the thing. You can peel the tag off and stick it on a new thing. Unlike a real tag, this one sticks on a number or on some words.' },
    { t: 'words', items: [
      { word: 'value', means: 'A piece of information, like 7 or "cat".' },
      { word: 'variable', means: 'A name tag stuck on a value so you can find it later.', say: 'VAIR-ee-uh-bul' },
      { word: 'type', means: 'The kind of value it is, like a whole number or some text.' },
    ] },
    { t: 'steps', title: 'Make and use a variable', items: [
      { label: 'Stick a tag on a value', text: 'Read `=` as "gets". This line says: score gets 3.', code: 'score = 3' },
      { label: 'Use the name', text: 'Write the name with no quote marks. Python finds the value on that tag.', code: 'print(score)' },
      { label: 'Move the tag', text: 'Python works out the right side first. Then it moves the tag.', code: 'score = score + 1' },
    ] },
    { t: 'viz', name: 'm01-name-tag', caption: 'Use the arrows to step through it. Make a guess each time it asks.' },
    { t: 'code', caption: 'Run it. Then change 3 to a new number. Guess the output before you run it again.',
      code: py`
        score = 3
        print(score)
        score = score + 1
        print(score)
      `,
      output: '3\n4',
    },
    { t: 'q', id: 'tags-do-not-follow', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        a = 3
        b = a
        a = 5
        print(b)
      `,
      options: [
        { text: '5', why: 'You may think `b` follows `a`. But `b = a` sticks `b` on the value 3, and `b` stays there.' },
        { text: '3', why: '' },
        { text: 'a', why: 'With no quote marks, `a` is a name. So `b = a` gives `b` the value 3, not the letter.' },
      ],
      answer: 1,
      explain: 'The line `b = a` sticks `b` on the value 3. Moving the tag `a` later does not move `b`.',
      hints: ['Go line by line. What value is `b` stuck on after line 2?', 'Line 3 moves only the tag called `a`.'],
    },
    { t: 'q', id: 'order-the-coins', type: 'order', level: 1,
      q: 'Put these lines in order, so the program prints 10. One line is not needed.',
      lines: ['coins = 7', 'coins = coins + 3', 'print(coins)'],
      extra: ['print("coins")'],
      output: '10',
      explain: 'First stick the tag on 7. Then move it to 10. Then print the value on the tag.',
      hints: ['A name must exist before you can use it.', 'The line with quote marks prints the word coins, not its value.'],
    },
    { t: 'h', text: 'Every value has a type' },
    { t: 'p', text: 'Every value has a [[type]]. The type tells Python what it can do with that value. Here are the 4 types you use most.' },
    { t: 'table', caption: 'The 4 types you meet first', head: ['Type', 'What it is', 'Examples'], rows: [
      ['`int`', 'A whole number', '`7` and `-2`'],
      ['`float`', 'A number with a point', '`3.5` and `7.0`'],
      ['`str`', 'Text inside quote marks', '`"cat"` and `"7"`'],
      ['`bool`', 'Only True or False', '`True` and `False`'],
    ] },
    { t: 'code', caption: 'Ask Python for the type of a value. Read `<class \'int\'>` as: this is an int.',
      code: py`
        print(type(7))
        print(type(3.5))
        print(type("7"))
        print(type(True))
      `,
      output: "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>",
    },
    { t: 'q', id: 'type-of-quoted-seven', type: 'mcq', level: 1,
      q: 'What type is `"7"`?',
      options: [
        { text: '`int`', why: 'It looks like a number. But the quote marks make it text.' },
        { text: '`str`', why: '' },
        { text: '`bool`', why: 'A `bool` can only be `True` or `False`.' },
      ],
      answer: 1,
      explain: 'Quote marks always make text, so `"7"` is a `str`.',
      hints: ['Look at the quote marks.'],
    },
    { t: 'q', id: 'text-joins', type: 'predict', level: 2,
      q: 'The type changes what `+` does. What will the screen show?',
      code: py`
        print("5" + "5")
        print(5 + 5)
      `,
      options: [
        { text: '10\n10', why: 'Quote marks make text. Using `+` on text joins it, so `"5" + "5"` is 55.' },
        { text: '55\n10', why: '' },
        { text: '55\n55', why: 'The second line has no quote marks. So those are numbers, and Python adds them.' },
      ],
      answer: 1,
      explain: 'Using `+` on text joins it. Using `+` on numbers adds them.',
      hints: ['Which line has text? Which line has numbers?'],
    },
    { t: 'h', text: 'What sums can Python do?' },
    { t: 'table', caption: 'The signs for sums', head: ['Sign', 'What it does', 'Example'], rows: [
      ['`+`', 'Adds', '`7 + 2` is `9`'],
      ['`-`', 'Takes away', '`7 - 2` is `5`'],
      ['`*`', 'Times', '`7 * 2` is `14`'],
      ['`/`', 'Divides, and always gives a `float`', '`7 / 2` is `3.5`'],
      ['`//`', 'Divides, and drops what is left over', '`7 // 2` is `3`'],
      ['`%`', 'Gives only what is left over', '`7 % 2` is `1`'],
    ] },
    { t: 'analogy', title: 'Share the sweets', text: 'Share 7 sweets between 2 kids. Each kid gets 3, and that is `7 // 2`. One sweet is left over, and that is `7 % 2`. Unlike a real sweet, a number can split, so `7 / 2` is 3.5.' },
    { t: 'code', caption: 'Run it. An even number leaves 0, so `10 % 2` is 0. Then try your own numbers.',
      code: py`
        print(7 * 2)
        print(7 / 2)
        print(7 // 2)
        print(7 % 2)
        print(10 % 2)
      `,
      output: '14\n3.5\n3\n1\n0',
    },
    { t: 'q', id: 'share-nine', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        print(9 // 2)
        print(9 % 2)
        print(8 / 2)
      `,
      options: [
        { text: '4\n1\n4.0', why: '' },
        { text: '4.5\n1\n4', why: 'The `//` sign drops what is left over, so `9 // 2` is 4. And `/` always gives a `float`, so `8 / 2` is 4.0.' },
        { text: '4\n0\n4.0', why: 'The `%` sign gives what is left over. 2 piles of 4 use 8 of the 9, so 1 is left.' },
      ],
      answer: 0,
      explain: '9 makes 2 piles of 4, with 1 left over. So `//` gives 4 and `%` gives 1. The `/` sign always gives a `float`.',
      hints: ['Share 9 sweets between 2 kids. How many does each kid get?', 'How many sweets are left over?'],
    },
    { t: 'tip', title: 'Which part comes first?', text: 'Python does `*` and `/` before `+` and `-`, as in maths. So `2 + 3 * 4` is 14. Brackets go first, so `(2 + 3) * 4` is 20.' },
    { t: 'p', text: '`print` can show many things at once. Put commas between them, and Python adds a space each time.' },
    { t: 'code', caption: 'Run it. Then change the name and the age.',
      code: py`
        name = "Mia"
        age = 10
        print(name, "is", age)
      `,
      output: 'Mia is 10',
    },
    { t: 'trap',
      think: '`print(score)` and `print("score")` do the same thing.',
      real: 'With no quote marks, `score` is a name, so Python shows its value. With quote marks, Python shows the word score.',
      code: py`
        score = 3
        print(score)    # shows 3
        print("score")  # shows score
      `,
    },
    { t: 'trap',
      think: 'Python knows what a name like `score` means.',
      real: 'A name means nothing to Python. `banana` works as well as `score`. So pick names that help people read your code. Python also skips a [[comment]], a note that starts with `#`.',
      code: py`
        banana = 3
        # Python skips this note.
        print(banana)
      `,
    },
    { t: 'code', error: true, caption: 'Python gets stuck on line 2. A `NameError` means: I cannot find a tag with that name. Fix the spelling and run it again.',
      code: py`
        score = 3
        print(scoer)
      `,
    },
    { t: 'big', text: 'A [[variable]] is a name tag on 1 [[value]]. The `=` sign moves the tag. It does not say that 2 things are equal.' },
  ],
  recap: [
    'You can stick a name tag on a value.',
    'You can read `=` as "gets".',
    'You can name 4 types: `int`, `float`, `str`, `bool`.',
  ],
  practice: [
    { id: 'newest-value', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        x = 2
        x = 7
        print(x)
      `,
      options: [
        { text: '2\n7', why: 'A variable does not keep a history. There is only 1 print, and it shows the newest value.' },
        { text: '7', why: '' },
        { text: '9', why: 'Nothing adds here. The `=` sign moves the tag, so it does not add to the old value.' },
      ],
      answer: 1,
      explain: 'Line 2 moves the tag to 7. So `x` means 7 when the print runs.',
      hints: ['What is `x` stuck on after line 2?'],
    },
    { id: 'match-the-types', type: 'match', level: 1,
      q: 'Match each value to its type.',
      pairs: [
        ['`7`', '`int`: a whole number'],
        ['`3.5`', '`float`: a number with a point'],
        ['`"7"`', '`str`: text'],
        ['`True`', '`bool`: True or False'],
      ],
      explain: 'A point makes a `float`. Quote marks make a `str`.',
      hints: ['Look for a point and for quote marks.'],
    },
    { id: 'make-a-pet', type: 'write', level: 2,
      q: 'Make a variable called `pet`. Stick it on the text `cat`. Then print `pet`.',
      starter: '# Type your code below.\n',
      answer: py`
        pet = "cat"
        print(pet)
      `,
      wantOutput: 'cat',
      tests: [{ label: 'The name pet is on the text cat', check: 'pet == "cat"' }],
      explain: 'Quote marks make the text. The name `pet` has no quote marks, so print shows its value.',
      hints: ['Start with `pet = `.', 'Put `"cat"` on the right of the `=` sign.', 'On the next line, use `print(pet)`.'],
    },
    { id: 'name-before-use', type: 'fix', level: 2,
      q: 'This program should print 5. Python gets stuck on line 1. Fix it.',
      code: py`
        print(coins)
        coins = 5
      `,
      answer: py`
        coins = 5
        print(coins)
      `,
      wantOutput: '5',
      explain: 'Python runs lines from top to bottom. A name must exist before you use it.',
      hints: ['Which line runs first?', 'Does the name `coins` exist when line 1 runs?'],
    },
    { id: 'what-gets-means', type: 'mcq', level: 2,
      q: 'What does `score = score + 1` do?',
      options: [
        { text: 'It says that `score` and `score + 1` are equal.', why: 'That is how `=` works in maths. In Python, read `=` as "gets".' },
        { text: 'It works out the sum, then moves the tag to it.', why: '' },
        { text: 'It makes a second tag, also called `score`.', why: 'A name can only be on 1 value. The same tag moves to the new value.' },
      ],
      answer: 1,
      explain: 'Python works out the right side first. Then it moves the tag to the answer.',
      hints: ['Which side does Python work out first?'],
    },
    { id: 'slash-gives-float', type: 'predict', level: 2,
      q: 'The `/` sign means divide. What will the screen show?',
      code: 'print(6 / 2)',
      options: [
        { text: '3', why: 'The answer is whole, but `/` always gives a `float`. A `float` has a point.' },
        { text: '3.0', why: '' },
        { text: '6 / 2', why: 'There are no quote marks here, so this is a sum and not text.' },
      ],
      answer: 1,
      explain: 'The `/` sign always gives a `float`, even when the answer is whole.',
      hints: ['What type does `/` give back?', 'A `float` always has a point.'],
    },
    { id: 'swap-two-tags', type: 'write', level: 3,
      q: 'Stretch: swap the values, so `a` is 2 and `b` is 1. Keep the first 2 lines and the last line.',
      starter: py`
        a = 1
        b = 2
        # Swap them here.
        print(a, b)
      `,
      answer: py`
        a = 1
        b = 2
        keep = a
        a = b
        b = keep
        print(a, b)
      `,
      wantOutput: '2 1',
      tests: [
        { label: 'a is now 2', check: 'a == 2' },
        { label: 'b is now 1', check: 'b == 1' },
      ],
      explain: 'The tag `keep` stays on the old value of `a`. With no third tag, the value 1 gets lost.',
      hints: ['What happens to the 1 if you write `a = b` first?', 'Stick a third name on the 1, so you do not lose it.', 'Try `keep = a` as your first new line.'],
    },
  ],
});

Course.lesson('m01-hello-code', {
  id: '1-3-talking-to-the-computer',
  num: '1.3',
  title: 'Talking to the computer',
  goal: 'You can read typed answers, turn them into numbers, and print them neatly.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How does a program hear you?' },
    { t: 'p', text: 'So far, your programs only talk. Now they can listen too. They ask a question, then they wait for your answer.' },
    { t: 'words', items: [
      { word: 'input', means: 'What goes into the program, like a name you type.', say: 'IN-put' },
      { word: 'string', means: 'Text. Letters and symbols inside quote marks. In code, Python calls it `str`.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A waiter asks what you want and writes your answer on a pad. The pad holds only writing, even if you say 2. `input()` works the same way. Unlike a waiter, it never guesses what your answer means.' },
    { t: 'code', caption: 'Look at the Input box. It holds what you would type. Change Sam to your own name, then press Run.',
      code: py`
        name = input()
        print("Hello", name)
      `,
      stdin: ['Sam'],
      output: 'Hello Sam',
    },
    { t: 'tip', title: 'How typing works here', text: 'On this site, you type your answers in the Input box before you press Run. Put each answer on its own line. Your answers do not show in the printed output.' },
    { t: 'code', caption: 'Put a question inside the brackets. Python shows it, then it waits for the answer.',
      code: py`
        name = input("What is your name? ")
        print("Hello", name)
      `,
      stdin: ['Sam'],
      output: 'What is your name? Hello Sam',
    },
    { t: 'p', text: 'See how the question and the hello share a line? Your typed answer does not show here, so they sit together. In other Python windows, your answer and the Enter key sit between them.' },
    { t: 'h', text: 'What type does input give you?' },
    { t: 'q', id: 'input-joins', type: 'predict', level: 1,
      q: 'You type 2 when the program waits. What will the screen show?',
      code: py`
        n = input()
        print(n + n)
      `,
      stdin: ['2'],
      options: [
        { text: '4', why: 'You typed digits, but `input()` always gives a [[string]]. Using `+` on text joins it.' },
        { text: '22', why: '' },
        { text: '2 2', why: 'You are close. But `+` joins text with no space, so there is no gap.' },
      ],
      answer: 1,
      explain: 'The name `n` is on the text `"2"`. Joining `"2"` and `"2"` makes `22`.',
      hints: ['What type does `input()` give back?', 'What does `+` do to text?'],
    },
    { t: 'steps', title: 'Add 1 to your age', items: [
      { label: 'Ask', text: 'The answer comes back as text.', code: 'age = input()' },
      { label: 'Turn it into a number', text: '`int()` reads the text and makes a whole number.', code: 'age = int(age)' },
      { label: 'Do the sum', text: 'Now `age` is a number, so `+` adds.', code: 'print(age + 1)' },
    ] },
    { t: 'viz', name: 'm01-input-int', caption: 'Step through it. Then type a new number in the box and go again.' },
    { t: 'code', error: true, caption: 'Here, step 2 is missing. Python stops on line 2. A `TypeError` means: I cannot add text and a number.',
      code: py`
        age = input()
        print(age + 1)
      `,
      stdin: ['11'],
    },
    { t: 'table', caption: 'Tools that turn one type into another', head: ['You write', 'You get', 'Its type'], rows: [
      ['`int("7")`', '`7`', '`int`'],
      ['`float("3.5")`', '`3.5`', '`float`'],
      ['`str(7)`', '`"7"`', '`str`'],
    ] },
    { t: 'code', caption: 'You can do both jobs on 1 line. Python works from the inside out: first `input()`, then `int()`.',
      code: py`
        age = int(input())
        print(age + 1)
      `,
      stdin: ['11'],
      output: '12',
    },
    { t: 'q', id: 'fill-the-tool', type: 'fill', level: 2,
      q: 'Fill the gap so the sum works. You type 10, and it should print 15.',
      code: py`
        age = ____(input())
        print(age + 5)
      `,
      blanks: ['int'],
      stdin: ['10'],
      output: '15',
      explain: '`int()` turns the text `"10"` into the number 10. Then `+` can add.',
      why: 'The gap needs a tool that turns text into a whole number.',
      hints: ['Look at the table of tools above.', 'You want a whole number. Its type has 3 letters.'],
    },
    { t: 'big', text: '`input()` always gives you text. Turn it into a number before you do a sum.' },
    { t: 'h', text: 'How do you print a neat message?' },
    { t: 'words', items: [
      { word: 'f-string', means: 'Text with an `f` in front. Python fills in each name inside curly brackets.', say: 'eff string' },
    ] },
    { t: 'code', caption: 'The `f` goes right before the first quote mark. Run it, then change the name.',
      code: py`
        name = "Mia"
        age = 10
        print(f"{name} is {age} years old.")
        print(f"Next year: {age + 1}")
      `,
      output: 'Mia is 10 years old.\nNext year: 11',
    },
    { t: 'q', id: 'missing-f', type: 'predict', level: 2,
      q: 'Look closely at the print line. What will the screen show?',
      code: py`
        name = "Mia"
        print("Hi {name}")
      `,
      options: [
        { text: 'Hi Mia', why: 'There is no `f` before the quote mark. So Python does not fill anything in.' },
        { text: 'Hi {name}', why: '' },
        { text: 'Hi name', why: 'With no `f`, this is plain text. So the curly brackets stay on the screen too.' },
      ],
      answer: 1,
      explain: 'With no `f`, the curly brackets are plain text. Python shows them as they are.',
      hints: ['Compare this print line to the one above it.', 'What is missing before the first quote mark?'],
    },
    { t: 'trap',
      think: '`print("Age: " + 10)` works, because Python can see what I mean.',
      real: 'Python stops with a `TypeError`, as it never guesses. Use an [[f-string]], or turn the number into text with `str()`.',
      code: py`
        age = 10
        print(f"Age: {age}")
        print("Age: " + str(age))
      `,
    },
  ],
  recap: [
    'You can read typed answers with `input()`.',
    'You can turn text into a number with `int()`.',
    'You can print neat messages with an f-string.',
  ],
  practice: [
    { id: 'what-input-gives', type: 'mcq', level: 1,
      q: 'You type 7 when `input()` waits. What type of value do you get?',
      options: [
        { text: '`int`', why: 'It looks like a number, but `input()` always gives text. You need `int()` to turn it.' },
        { text: '`str`', why: '' },
        { text: '`float`', why: 'A `float` is a number with a point. But `input()` always gives text.' },
      ],
      answer: 1,
      explain: '`input()` always gives a `str`, even when you type digits.',
      hints: ['Think of the waiter. What does the pad hold?'],
    },
    { id: 'match-the-tools', type: 'match', level: 1,
      q: 'Match each piece of code to its job.',
      pairs: [
        ['`input()`', 'Waits for you to type'],
        ['`int("7")`', 'Turns text into a whole number'],
        ['`str(7)`', 'Turns a number into text'],
        ['`f"{x}"`', 'Fills a value into text'],
      ],
      explain: 'Each tool does one job. You often use them together.',
      hints: ['The name of the tool often tells you what you get.'],
    },
    { id: 'real-sum', type: 'predict', level: 2,
      q: 'You type 3 when the program waits. Type what the screen shows.',
      code: py`
        n = int(input())
        print(n + n)
      `,
      stdin: ['3'],
      answer: '6',
      why: 'Here, `int()` turns the text into a number. So `+` adds and does not join.',
      explain: 'The name `n` is on the number 3, and 3 + 3 is 6.',
      hints: ['What does `int()` do to the text `"3"`?'],
    },
    { id: 'say-hi', type: 'write', level: 2,
      q: 'Read a name with `input()`, with nothing inside the brackets. Call it `name`. Then use an f-string to print `Hi Zoe!` for the answer Zoe.',
      starter: '# Use input(). The Input box already holds Zoe.\n',
      stdin: ['Zoe'],
      answer: py`
        name = input()
        print(f"Hi {name}!")
      `,
      wantOutput: 'Hi Zoe!',
      tests: [
        { label: 'The name is on what you typed', check: 'name == "Zoe"' },
        { label: 'You read the Input box with input()', check: '__import__("sys").stdin.read() == ""' },
      ],
      explain: 'The f-string fills in the value of `name`, so it works for any name.',
      hints: ['Start with `name = input()`.', 'Put `f` before the quote mark.', 'Write `{name}` where the name goes.'],
    },
    { id: 'turn-it-first', type: 'fix', level: 2,
      q: 'You type 9, and this should print 10. Python stops on line 2. Fix it.',
      code: py`
        age = input()
        print(age + 1)
      `,
      stdin: ['9'],
      answer: py`
        age = int(input())
        print(age + 1)
      `,
      wantOutput: '10',
      tests: [{ label: 'You read the Input box with input()', check: '__import__("sys").stdin.read() == ""' }],
      explain: '`input()` gives text. `int()` turns it into a number, so the sum can work.',
      hints: ['What type does `input()` give?', 'Use `int()` to turn the text into a number.'],
    },
    { id: 'point-in-int', type: 'predict', level: 3,
      q: 'Stretch: what happens when this runs?',
      code: 'print(int("3.5"))',
      options: [
        { text: '3', why: '`int()` does not cut off the point when it reads text. It stops instead.' },
        { text: '3.5', why: 'An `int` is a whole number, so it cannot hold a point.' },
        { text: 'ValueError', why: '' },
      ],
      answer: 2,
      expectError: true,
      explain: 'A `ValueError` means: I cannot read this text as a whole number. Use `float()` for text with a point.',
      hints: ['What kind of number does `int()` make?', 'Can `int()` read the point in that text?'],
    },
    { id: 'add-two-answers', type: 'write', level: 3,
      q: 'Stretch: read 2 whole numbers, called `a` and `b`. For 3 and 4, print `3 + 4 = 7`. Use an f-string.',
      starter: '# Use input() 2 times. The Input box holds 3 and 4.\n',
      stdin: ['3', '4'],
      answer: py`
        a = int(input())
        b = int(input())
        print(f"{a} + {b} = {a + b}")
      `,
      wantOutput: '3 + 4 = 7',
      tests: [
        { label: 'a is the number 3', check: 'a == 3' },
        { label: 'b is the number 4', check: 'b == 4' },
        { label: 'You read the Input box with input()', check: '__import__("sys").stdin.read() == ""' },
      ],
      explain: 'Each `input()` reads 1 line. Curly brackets can hold a name or a sum.',
      hints: ['Use `int(input())` 2 times.', 'Curly brackets can hold a sum, like `{a + b}`.', 'Plain text outside the curly brackets stays as it is.'],
    },
  ],
});
