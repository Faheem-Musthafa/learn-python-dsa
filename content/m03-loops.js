/* Module 3: Loops. Part 1 (Learn Python). */
Course.module({
  id: 'm03-loops',
  num: 3, part: 1, level: 'B',
  title: 'Loops',
  blurb: 'Make the computer repeat steps, without writing them again.',
  needs: ['m02-decisions'],
});

// ------------------------------------------------------------------ 3.1
Course.lesson('m03-loops', {
  id: '3-1-while-loops',
  num: '3.1',
  title: 'While loops: repeat until a rule says stop',
  goal: 'You can write a while loop, say when it stops, and fix one that never stops.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How do you repeat a step?' },
    { t: 'p', text: 'You want the screen to show 1, 2, 3, 4, 5. You could write 5 print lines. But what if you want 100 numbers?' },
    { t: 'words', items: [
      { word: 'loop', means: 'A way to repeat steps without writing them again.' },
      { word: 'iteration', means: 'One trip around a loop.', say: 'it-er-AY-shun' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'You walk up some stairs. Before each step you ask: is there another stair? If yes, you step up and ask again. If no, you stop. Unlike you, Python cannot look ahead. It only asks at the top of each trip.' },
    { t: 'p', text: 'A `while` [[loop]] works the same way. It has a question at the top, called a [[condition]]. If the answer is True, Python runs the indented lines, then asks again.' },
    { t: 'steps', title: 'The shape of a while loop', items: [
      { label: 'Set a start value', text: 'Make a [[variable]] that the question can check.', code: 'n = 1' },
      { label: 'Ask the question', text: 'The line starts with `while` and ends with a colon.', code: 'while n <= 5:' },
      { label: 'Write the steps to repeat', text: 'Indent them. These lines run on each [[iteration]].', code: '    print(n)' },
      { label: 'Change the value', text: 'Move `n` closer to the stop. Without this line, the loop never ends.', code: '    n = n + 1' },
    ] },
    { t: 'viz', name: 'm03-while-stairs', caption: 'Step through it and answer the questions. Then change the limit and watch again.' },
    { t: 'code', caption: 'Run it. Then change the 5 to a 3. Guess the output before you run it again.',
      code: py`
        n = 1
        while n <= 5:
            print(n)
            n = n + 1
        print("Done")
      `,
      output: '1\n2\n3\n4\n5\nDone',
    },
    { t: 'q', id: 'finishes-the-trip', type: 'predict', level: 2,
      q: 'Look closely at the order of the lines. What will the screen show?',
      code: py`
        n = 1
        while n < 3:
            n = n + 1
            print(n)
      `,
      options: [
        '2\n3',
        { text: '2', why: 'You may think the loop stops as soon as n is 3. Python finishes the whole trip first.' },
        { text: '1\n2', why: 'Line 3 adds 1 before print runs. So the first number shown is 2.' },
      ],
      answer: 0,
      explain: 'Python asks only at the top. When n becomes 3, the trip still finishes, so print shows 3.',
      hints: ['Which line runs first inside the loop?', 'Python checks the question only at the top of each trip.'],
    },
    { t: 'h', text: 'Can the question be about words?' },
    { t: 'p', text: 'Yes. The question can check anything that is True or False. This loop repeats until you type the right word.' },
    { t: 'code', caption: 'Each line in the input box is one guess. Add more wrong guesses, then run it again.',
      code: py`
        guess = ""
        while guess != "cat":
            print("Guess my pet!")
            guess = input()
        print("You got it!")
      `,
      stdin: ['dog', 'cat'],
      output: 'Guess my pet!\nGuess my pet!\nYou got it!',
    },
    { t: 'q', id: 'which-line-stops', type: 'mcq', level: 2,
      q: 'Which line lets this loop stop?',
      code: py`
        count = 5
        while count > 0:
            print(count)
            count = count - 1
      `,
      options: [
        '`count = count - 1`',
        { text: '`print(count)`', why: 'print shows the value, but it does not change it. So print cannot end the loop.' },
        { text: '`count = 5`', why: 'This line runs only once, before the loop. It cannot make the answer turn False.' },
      ],
      answer: 0,
      explain: 'Each trip makes count smaller. In time, `count > 0` turns False, and the loop stops.',
      hints: ['A loop stops when its question turns False.', 'Which line changes the value in the question?'],
    },
    { t: 'h', text: 'What if the question never turns False?' },
    { t: 'words', items: [
      { word: 'infinite loop', means: 'A loop that never stops, because its question never turns False.', say: 'IN-fin-it loop' },
    ] },
    { t: 'trap',
      think: 'A loop stops by itself after a while.',
      real: 'A loop stops only when its question turns False. Here `n` never changes, so this is an [[infinite loop]].',
      code: py`
        n = 1
        while n <= 3:
            print(n)
      `,
    },
    { t: 'code', caption: 'We added a safety counter, so this one stops after 4 trips. See how n stays at 1.',
      code: py`
        n = 1
        trips = 0
        while n <= 3 and trips < 4:
            print(n)
            trips = trips + 1
        print("I stopped it for you.")
      `,
      output: '1\n1\n1\n1\nI stopped it for you.',
    },
    { t: 'tip', title: 'You cannot break anything', text: 'If your code runs for too long, Stepwise stops it after a few seconds. Then look at what should change the question.' },
    { t: 'q', id: 'countdown-order', type: 'order', level: 2,
      q: 'Put the lines in order. The program counts down from 3, then prints Go!',
      lines: [
        'count = 3',
        'while count > 0:',
        '    print(count)',
        '    count = count - 1',
        'print("Go!")',
      ],
      extra: ['    count = count + 1'],
      output: '3\n2\n1\nGo!',
      explain: 'The value starts at 3 and goes down on each trip. print("Go!") has no indent, so it runs once, after the loop.',
      hints: ['Set the start value first.', 'Adding 1 moves count away from 0. Would the loop ever stop?'],
    },
    { t: 'big', text: 'A while loop asks its question at the top of every trip. It stops only when the answer is False.' },
  ],
  recap: [
    'You can write a while loop with a question.',
    'You can say when a loop stops.',
    'You can find and fix a loop that never ends.',
  ],
  practice: [
    { id: 'words-match', type: 'match', level: 1,
      q: 'Match each word with its meaning.',
      pairs: [
        ['[[loop]]', 'Repeats steps without writing them again'],
        ['[[iteration]]', 'One trip around a loop'],
        ['[[infinite loop]]', 'A loop that never stops'],
        ['`while`', 'Asks a question before each trip'],
      ],
      explain: 'These are the words for this lesson. You will see them often from now on.',
      hints: ['Start with the word you know best.'],
    },
    { id: 'count-by-two', type: 'predict', level: 1,
      q: 'Type what this program prints.',
      code: py`
        x = 2
        while x <= 6:
            print(x)
            x = x + 2
      `,
      answer: '2\n4\n6',
      why: 'Go one line at a time. x starts at 2 and grows by 2. Is 6 <= 6 True?',
      explain: 'x takes the values 2, 4, 6 and 8. When x is 8, the question is False, so 8 is not printed.',
      hints: ['Write down x after each trip.', '`<=` means less than or equal, so 6 still counts.'],
    },
    { id: 'zero-trips', type: 'mcq', level: 2,
      q: 'How many times does print run?',
      code: py`
        n = 5
        while n < 5:
            print("hi")
            n = n + 1
      `,
      options: [
        '0 times',
        { text: '1 time', why: 'You may think a loop always runs once. Python asks first, and 5 < 5 is False.' },
        { text: '5 times', why: 'The 5 is the start value here, not the number of trips. Python asks first, and the answer is False.' },
      ],
      answer: 0,
      explain: 'Python asks before the first trip. `5 < 5` is False, so the indented lines never run.',
      hints: ['What does Python do first: run the lines, or ask the question?', 'Is 5 less than 5?'],
    },
    { id: 'count-up-fill', type: 'fill', level: 2,
      q: 'Fill the gaps. The program should print 1, 2, 3, 4, each on its own line.',
      code: py`
        n = 1
        while n ____ 4:
            print(n)
            n = ____
      `,
      blanks: ['<=', ['n + 1', 'n+1', '1 + n']],
      output: '1\n2\n3\n4',
      why: 'The question must still be True when n is 4. Then n must grow by 1.',
      explain: 'The loop must run when n is 4, so use `<=`. Each trip adds 1 to n.',
      hints: ['Which symbol means less than or equal?', 'The last line must make n grow by 1.'],
    },
    { id: 'fix-never-ends', type: 'fix', level: 2,
      q: 'This program should add 1 + 2 + 3 and print 6. Python keeps looping and never gets to print. Fix it.',
      code: py`
        total = 0
        n = 1
        while n <= 3:
            total = total + n
        print(total)
      `,
      answer: py`
        total = 0
        n = 1
        while n <= 3:
            total = total + n
            n = n + 1
        print(total)
      `,
      wantOutput: '6',
      explain: 'Nothing changed n, so the question stayed True. Adding `n = n + 1` inside the loop lets it end.',
      hints: ['What is n on the second trip?', 'Add one indented line that changes n.'],
    },
    { id: 'write-liftoff', type: 'write', level: 2,
      q: 'Use a while loop to print 5, 4, 3, 2, 1, each on its own line. Then print Liftoff!',
      starter: 'n = 5\n# Write your loop here.\n',
      answer: py`
        n = 5
        while n > 0:
            print(n)
            n = n - 1
        print("Liftoff!")
      `,
      wantOutput: '5\n4\n3\n2\n1\nLiftoff!',
      tests: [{ label: 'n counted down to 0', check: 'n == 0' }],
      explain: 'The loop runs while n is above 0, and n shrinks on each trip. Liftoff! has no indent, so it prints once.',
      hints: ['Your question could be `while n > 0:`.', 'Inside the loop, print n, then take 1 away from it.', 'Do not indent the last print.'],
    },
    { id: 'plant-grows', type: 'write', level: 3,
      q: 'A plant is 1 cm tall. It doubles in height every week. How many weeks until it is at least 100 cm tall? Use a while loop, then print weeks.',
      starter: 'height = 1\nweeks = 0\n# Write your loop here.\n',
      answer: py`
        height = 1
        weeks = 0
        while height < 100:
            height = height * 2
            weeks = weeks + 1
        print(weeks)
      `,
      tests: [
        { label: 'weeks ends at 7', check: 'weeks == 7' },
        { label: 'height ends at 128', check: 'height == 128' },
      ],
      wantOutput: '7',
      explain: 'The height goes 2, 4, 8, 16, 32, 64, 128. That is 7 trips. A while loop fits, because you do not know the count at the start.',
      hints: ['Keep looping while the height is under 100.', 'Each trip changes 2 variables: height and weeks.', '`height = height * 2` doubles the height.'],
    },
  ],
});

// ------------------------------------------------------------------ 3.2
Course.lesson('m03-loops', {
  id: '3-2-for-loops-range',
  num: '3.2',
  title: 'For loops and range: repeat a set number of times',
  goal: 'You can write a for loop with range, and name the exact numbers range gives.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Can Python do the counting for you?' },
    { t: 'p', text: 'A while loop needs a start, a question and a change. If you forget the change, it never stops. For counting, Python has a shorter loop.' },
    { t: 'words', items: [
      { word: 'for loop', means: 'A loop that visits each value in a group, one at a time.' },
      { word: 'range', means: 'A tool that gives you numbers in order, one at a time.' },
    ] },
    { t: 'q', id: 'first-guess', type: 'predict', level: 1,
      q: 'Take a guess before you learn the rule. What does this print?',
      code: py`
        for i in range(5):
            print(i)
      `,
      options: [
        '0\n1\n2\n3\n4',
        { text: '1\n2\n3\n4\n5', why: 'Most people guess this first. But range starts at 0, not 1.' },
        { text: '0\n1\n2\n3\n4\n5', why: 'You are right that it starts at 0. But range stops before 5, so 5 is not printed.' },
      ],
      answer: 0,
      explain: 'range(5) gives 5 numbers. It starts at 0 and stops before 5.',
      hints: ['A wrong guess is fine here. Which number do you think comes first?'],
    },
    { t: 'viz', name: 'm03-range-line', caption: 'Step through it, then change the stop number. The stop number never gets a trip.' },
    { t: 'big', text: '`range(5)` gives 5 numbers: 0, 1, 2, 3, 4. It starts at 0 and stops before 5.' },
    { t: 'steps', title: 'How a for loop runs', items: [
      { label: 'Get the next number', text: 'Python asks [[range]] for the next number.', code: 'for i in range(3):' },
      { label: 'Name it', text: 'The [[variable]] `i` is now stuck on that number. You do not need to change `i` yourself.' },
      { label: 'Run the indented lines', text: 'These lines run once on each [[iteration]].', code: '    print("Trip", i)' },
      { label: 'Go back to the top', text: 'If there are no numbers left, the [[for loop]] ends.' },
    ] },
    { t: 'code', caption: 'Run it. Then change the 3 to a 6. How many lines do you get now?',
      code: py`
        for i in range(3):
            print("Trip", i)
      `,
      output: 'Trip 0\nTrip 1\nTrip 2',
    },
    { t: 'h', text: 'What if you count one too many?' },
    { t: 'words', items: [
      { word: 'off-by-one mistake', means: 'A loop that runs 1 time too many or 1 time too few.' },
    ] },
    { t: 'trap',
      think: '`range(5)` counts 1, 2, 3, 4, 5.',
      real: 'It gives 0, 1, 2, 3, 4. You get 5 numbers, but 5 is not one of them. Mixing this up causes an [[off-by-one mistake]].',
    },
    { t: 'h', text: 'How do you pick the start and the stop?' },
    { t: 'p', text: 'Give [[range]] 2 numbers. It includes the first one, and it stops before the second one. A third number sets the size of each jump.' },
    { t: 'table', caption: 'What range gives you', head: ['You write', 'You get', 'Why'], rows: [
      ['`range(4)`', '0 1 2 3', 'Start at 0. Stop before 4.'],
      ['`range(2, 6)`', '2 3 4 5', 'Start at 2. Stop before 6.'],
      ['`range(0, 10, 2)`', '0 2 4 6 8', 'Jump by 2. Stop before 10.'],
      ['`range(3, 0, -1)`', '3 2 1', 'Jump down by 1. Stop before 0.'],
    ] },
    { t: 'code', caption: 'To count 1 to 5, the stop must be 6. Make it print 1 to 10. What do you change?',
      code: py`
        for i in range(1, 6):
            print(i)
      `,
      output: '1\n2\n3\n4\n5',
    },
    { t: 'q', id: 'pick-range', type: 'mcq', level: 2,
      q: 'Which one gives 3, 4, 5?',
      options: [
        '`range(3, 6)`',
        { text: '`range(3, 5)`', why: 'range stops before the second number. So this one gives only 3 and 4.' },
        { text: '`range(5)`', why: 'With one number, range starts at 0. So this one gives 0, 1, 2, 3, 4.' },
      ],
      answer: 0,
      explain: 'range includes the first number and stops before the second. So 6 is the stop that gives you 5.',
      hints: ['The first number is where it starts.', 'The stop is 1 more than the last number you want.'],
    },
    { t: 'q', id: 'fill-one-to-four', type: 'fill', level: 2,
      q: 'Fill the gaps. The program should print 1, 2, 3, 4, each on its own line.',
      code: py`
        for i in range(____, ____):
            print(i)
      `,
      blanks: ['1', '5'],
      output: '1\n2\n3\n4',
      why: 'The first number is the start. The second must be 1 more than the last number you want.',
      explain: 'range(1, 5) starts at 1 and stops before 5.',
      hints: ['Where does the count start?', 'range stops before the second number. So which stop gives you 4?'],
    },
    { t: 'h', text: 'What else can a for loop visit?' },
    { t: 'p', text: 'A [[for loop]] can visit each letter of a [[string]]. It can also visit a row of numbers in square brackets. Module 5 shows you much more about these rows.' },
    { t: 'code', caption: 'Change the word and the numbers, then run it again.',
      code: py`
        for letter in "cat":
            print(letter)

        for n in [7, 2, 9]:
            print(n)
      `,
      output: 'c\na\nt\n7\n2\n9',
    },
    { t: 'q', id: 'after-the-loop', type: 'predict', level: 2,
      q: 'Look at the [[indentation]]. What does this print?',
      code: py`
        for i in range(2):
            print("hi")
        print("bye")
      `,
      options: [
        'hi\nhi\nbye',
        { text: 'hi\nbye\nhi\nbye', why: 'That would need print("bye") to be indented. It has no indent, so it is not in the loop.' },
        { text: 'hi\nbye', why: 'range(2) gives 2 numbers, so the loop makes 2 trips. print("hi") runs twice.' },
      ],
      answer: 0,
      explain: 'Only indented lines repeat. print("bye") has no indent, so it runs once, after the loop.',
      hints: ['Which lines are indented?', 'How many numbers does range(2) give?'],
    },
    { t: 'tip', title: 'Which loop should you pick?', text: 'Use `for` when you know the values ahead of time. Use `while` when you wait for something to happen.' },
  ],
  recap: [
    'You can write a for loop with range.',
    'You can say the exact numbers range gives.',
    'You can fix a loop that is off by one.',
  ],
  practice: [
    { id: 'range-two-five', type: 'predict', level: 1,
      q: 'Type what this program prints.',
      code: py`
        for i in range(2, 5):
            print(i)
      `,
      answer: '2\n3\n4',
      why: 'range includes the first number. It stops before the second number.',
      explain: 'range(2, 5) gives 2, 3 and 4. It stops before 5.',
      hints: ['Where does it start?', 'Does range ever give the stop number?'],
    },
    { id: 'how-many-trips', type: 'mcq', level: 1,
      q: 'How many times does print run?',
      code: py`
        for i in range(10):
            print(i)
      `,
      options: [
        '10 times',
        { text: '9 times', why: 'The last number is 9, but counting from 0 gives 10 numbers. Count them on your fingers.' },
        { text: '11 times', why: 'That would need 10 to be printed too. range stops before 10.' },
      ],
      answer: 0,
      explain: 'range(10) gives 0 to 9. That is 10 numbers, so the loop makes 10 trips.',
      hints: ['Try it with range(3) first. It gives 0, 1, 2.'],
    },
    { id: 'order-one-to-three', type: 'order', level: 2,
      q: 'Put the lines in order. The program prints 1, 2, 3, then Done.',
      lines: [
        'for i in range(1, 4):',
        '    print(i)',
        'print("Done")',
      ],
      extra: ['for i in range(3):'],
      output: '1\n2\n3\nDone',
      explain: 'range(1, 4) gives 1, 2 and 3. range(3) would give 0, 1 and 2.',
      hints: ['You need only one for line. Which range gives 1, 2, 3?'],
    },
    { id: 'fix-off-by-one', type: 'fix', level: 2,
      q: 'This program should print 1, 2, 3, 4, 5. It stops too soon. Fix it.',
      code: py`
        for i in range(1, 5):
            print(i)
      `,
      answer: py`
        for i in range(1, 6):
            print(i)
      `,
      wantOutput: '1\n2\n3\n4\n5',
      explain: 'range stops before the second number. To reach 5, the stop must be 6.',
      hints: ['Run it. Which number is missing?', 'Change the stop number.'],
    },
    { id: 'times-three', type: 'write', level: 2,
      q: 'Use a for loop to print the 3 times table: 3, 6, 9, 12, 15, each on its own line.',
      starter: '# Use a for loop and range.\n',
      answer: py`
        for i in range(1, 6):
            print(i * 3)
      `,
      wantOutput: '3\n6\n9\n12\n15',
      explain: 'i goes from 1 to 5, and each trip prints `i * 3`. `range(3, 16, 3)` also works.',
      hints: ['You need 5 trips.', 'Let i go from 1 to 5, using `range(1, 6)`.', 'Print `i * 3` inside the loop.'],
    },
    { id: 'i-after-loop', type: 'predict', level: 2,
      q: 'What does this program print? Look closely at the last line.',
      code: py`
        for i in range(3):
            print("tick")
        print(i)
      `,
      options: [
        'tick\ntick\ntick\n2',
        { text: 'tick\ntick\ntick\n3', why: 'You may think i reaches the stop number. range(3) never gives 3, so i stays at 2.' },
        { text: 'tick\ntick\ntick\n0', why: 'i does not go back to its start. It keeps the last value it had, which is 2.' },
      ],
      answer: 0,
      explain: 'After the loop, i keeps its last value. The last number from range(3) is 2.',
      hints: ['Which numbers does range(3) give?', 'Does i change after the loop ends?'],
    },
    { id: 'count-down-twos', type: 'write', level: 3,
      q: 'Use one for loop to print 10, 8, 6, 4, 2, 0. Put each on its own line.',
      starter: '# Use range with 3 numbers.\n',
      answer: py`
        for i in range(10, -1, -2):
            print(i)
      `,
      wantOutput: '10\n8\n6\n4\n2\n0',
      explain: 'Start at 10 and jump by -2. To include 0, the stop must be one past it, going down. That is -1.',
      hints: ['The third number can be negative, like -2.', 'range stops before the stop number. To reach 0, what must the stop be?', 'Going down, the number past 0 is -1.'],
    },
  ],
});

// ------------------------------------------------------------------ 3.3
Course.lesson('m03-loops', {
  id: '3-3-break-continue-recipes',
  num: '3.3',
  title: 'Break, continue and loop recipes',
  goal: 'You can stop or skip in a loop, and write the sum, count and biggest recipes.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How do you leave a loop early?' },
    { t: 'p', text: 'Sometimes you find what you want before the loop is over. Then you can stop looking. Other times you want to skip one trip and carry on.' },
    { t: 'words', items: [
      { word: 'break', means: 'Leave the loop right now. Go to the first line after it.' },
      { word: 'continue', means: 'Skip the rest of this trip. Go back to the top of the loop.' },
    ] },
    { t: 'viz', name: 'm03-break', caption: 'Step through it with break. Watch which numbers never get a trip.' },
    { t: 'q', id: 'break-predict', type: 'predict', level: 1,
      q: 'What does this print?',
      code: py`
        for n in range(5):
            if n == 2:
                break
            print(n)
        print("Done")
      `,
      options: [
        '0\n1\nDone',
        { text: '0\n1\n2\nDone', why: 'break runs before print on that trip. So 2 is never shown.' },
        { text: '0\n1', why: 'break leaves the loop, not the program. The line after the loop still runs.' },
      ],
      answer: 0,
      explain: 'When n is 2, break leaves the loop. Then Python runs the first line after the loop.',
      hints: ['What is n when break runs?', 'Does break end the whole program, or only the loop?'],
    },
    { t: 'viz', name: 'm03-continue', caption: 'This is the same code, but with continue. Compare it with the last picture.' },
    { t: 'q', id: 'continue-predict', type: 'predict', level: 2,
      q: 'What does this print?',
      code: py`
        for letter in "cat":
            if letter == "a":
                continue
            print(letter)
      `,
      options: [
        'c\nt',
        { text: 'c', why: 'That is what break would do. continue skips one trip, and the loop goes on.' },
        { text: 'c\na\nt', why: 'continue jumps back to the top before print runs. So a is not shown.' },
      ],
      answer: 0,
      explain: 'On the trip for a, continue skips print. The loop then goes on to t.',
      hints: ['Which letter makes the if True?', 'What does continue skip?'],
    },
    { t: 'code', caption: 'This search stops at the first number over 6. Change the numbers and run it.',
      code: py`
        for n in [3, 8, 5, 12]:
            print("Looking at", n)
            if n > 6:
                print("Found it!")
                break
      `,
      output: 'Looking at 3\nLooking at 8\nFound it!',
    },
    { t: 'h', text: 'Which 3 recipes do most loops use?' },
    { t: 'p', text: 'Many loops do one of 3 jobs: add up, count or find the biggest. Each recipe has the same shape. You set a value before the loop, change it inside, and use it after.' },
    { t: 'steps', title: 'The 3 loop recipes', noun: 'Recipe', items: [
      { label: 'Sum', text: 'Start at 0. On each trip, add the new value.', code: py`
        total = 0
        for n in [4, 9, 2]:
            total = total + n
      ` },
      { label: 'Count', text: 'Start at 0. Add 1 each time a value passes your test.', code: py`
        count = 0
        for n in [4, 9, 2]:
            if n > 3:
                count = count + 1
      ` },
      { label: 'Biggest', text: 'Start low. Keep a new value only if it beats the best so far.', code: py`
        biggest = 0
        for n in [4, 9, 2]:
            if n > biggest:
                biggest = n
      ` },
    ] },
    { t: 'viz', name: 'm03-biggest', caption: 'Step through it. Then type your own numbers and guess each step.' },
    { t: 'code', caption: 'All 3 recipes on the same numbers. Change the numbers and guess the output first.',
      code: py`
        total = 0
        count = 0
        biggest = 0
        for n in [4, 9, 2, 7]:
            total = total + n
            if n > 3:
                count = count + 1
            if n > biggest:
                biggest = n
        print(total)
        print(count)
        print(biggest)
      `,
      output: '22\n3\n9',
    },
    { t: 'tip', title: 'Why does biggest start at 0?', text: 'Our numbers are all above 0, so any of them can beat it. If every number is below 0, this recipe gives 0. Module 5 shows a better start.' },
    { t: 'q', id: 'sum-order', type: 'order', level: 2,
      q: 'Put the lines in order. The program adds 1 + 2 + 3 + 4 and prints the total.',
      lines: [
        'total = 0',
        'for n in range(1, 5):',
        '    total = total + n',
        'print(total)',
      ],
      extra: ['    total = 0'],
      output: '10',
      explain: 'Set total before the loop, so it runs once. Print after the loop, so it shows the final total.',
      hints: ['Which line must run only once, at the very start?', 'Would you want to set total back to 0 on every trip?'],
    },
    { t: 'trap',
      think: 'It does not matter if `total = 0` goes inside the loop.',
      real: 'That line runs on every trip, so it wipes the total each time. This code prints 3, not 6. Set the value before the loop.',
      code: py`
        for n in range(1, 4):
            total = 0
            total = total + n
        print(total)
      `,
    },
  ],
  recap: [
    'You can stop a loop with break.',
    'You can skip one trip with continue.',
    'You can use the sum, count and biggest recipes.',
  ],
  practice: [
    { id: 'break-continue-match', type: 'match', level: 1,
      q: 'Match each word with what it does.',
      pairs: [
        ['`break`', 'Leaves the loop now'],
        ['`continue`', 'Skips to the next trip'],
        ['`count = count + 1`', 'Adds 1 each time a value passes a test'],
      ],
      explain: 'break ends the loop. continue ends only this trip. The count recipe adds 1 for each value that passes.',
      hints: ['Which word sounds like stopping?'],
    },
    { id: 'fix-reset-total', type: 'fix', level: 2,
      q: 'This program should add 1 + 2 + 3 and print 6. It prints 3. Fix it.',
      code: py`
        for n in range(1, 4):
            total = 0
            total = total + n
        print(total)
      `,
      answer: py`
        total = 0
        for n in range(1, 4):
            total = total + n
        print(total)
      `,
      wantOutput: '6',
      explain: 'Inside the loop, `total = 0` wipes the total on every trip. Before the loop, it runs only once.',
      hints: ['What is total at the start of the last trip?', 'Move one line up and out of the loop.'],
    },
    { id: 'count-a', type: 'write', level: 2,
      q: 'Use the count recipe to find how many times the letter a is in "banana". Use the name `count` for the answer, then print it.',
      starter: 'count = 0\n# Write your loop here.\n',
      answer: py`
        count = 0
        for letter in "banana":
            if letter == "a":
                count = count + 1
        print(count)
      `,
      tests: [{ label: 'count is 3', check: 'count == 3' }],
      wantOutput: '3',
      explain: 'The loop visits each letter. Only an a passes the test, so count grows 3 times.',
      hints: ['Start your loop with `for letter in "banana":`.', 'Inside it, use `if letter == "a":`.', 'When the test passes, add 1 to count.'],
    },
    { id: 'sum-ten', type: 'write', level: 2,
      q: 'Use the sum recipe to add the numbers from 1 to 10. Use the name `total` for the answer, then print it.',
      starter: 'total = 0\n# Write your loop here.\n',
      answer: py`
        total = 0
        for n in range(1, 11):
            total = total + n
        print(total)
      `,
      tests: [{ label: 'total is 55', check: 'total == 55' }],
      wantOutput: '55',
      explain: 'range(1, 11) gives 1 to 10. Each trip adds the new number to total.',
      hints: ['Which range gives 1 to 10?', 'The stop must be 11.', 'Print after the loop, with no indent.'],
    },
    { id: 'smallest', type: 'write', level: 3,
      q: 'Change the biggest recipe into a smallest recipe. Find the smallest number in [12, 5, 31, 8]. Use the name `smallest` for it, then print it.',
      starter: 'smallest = 100\n# Write your loop here.\n',
      answer: py`
        smallest = 100
        for n in [12, 5, 31, 8]:
            if n < smallest:
                smallest = n
        print(smallest)
      `,
      tests: [{ label: 'smallest is 5', check: 'smallest == 5' }],
      wantOutput: '5',
      explain: 'The recipe has the same shape. Now a new value wins when it is smaller, so the test uses `<`.',
      hints: ['It starts high this time, so any number can beat it.', 'Which symbol do you need in the if: `<` or `>`?'],
    },
    { id: 'first-square', type: 'write', level: 3,
      q: 'Find the first number whose square (n * n) is over 50. Use `for n in range(1, 20):` and break. Print that number once.',
      starter: '# Stop as soon as you find it.\n',
      answer: py`
        for n in range(1, 20):
            if n * n > 50:
                print(n)
                break
      `,
      wantOutput: '8',
      tests: [{ label: 'The loop stopped with n at 8', check: 'n == 8' }],
      explain: '7 x 7 is 49, which is too small. 8 x 8 is 64, so the loop prints 8, then break stops it.',
      hints: ['Inside the loop, test `n * n > 50`.', 'Print n inside the if.', 'Put break right after the print.'],
    },
  ],
});

// ------------------------------------------------------------------ 3.4
Course.lesson('m03-loops', {
  id: '3-4-trace-tables',
  num: '3.4',
  title: 'Tracing code by hand with a table',
  goal: 'You can fill in a trace table and use it to find a bug.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Can you be the computer?' },
    { t: 'p', text: 'Some code is too much to hold in your head. So you write the values down, one row at a time. You will use this skill in every part of this course.' },
    { t: 'words', items: [
      { word: 'trace', means: 'Follow code line by line, the way the computer does.' },
      { word: 'trace table', means: 'A table that shows the value of each variable on each trip.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[trace table]] is a scoreboard for your code. Each time a value changes, you write the new score. Unlike a real scoreboard, you keep the old scores too. So you can look back.' },
    { t: 'steps', title: 'How to fill in a trace table', items: [
      { label: 'Draw the columns', text: 'Make one column for each [[variable]].' },
      { label: 'Write the start values', text: 'If a variable has no value yet, write a dash.' },
      { label: 'Add a row for each trip', text: 'Read the indented lines in order. Use the row above for old values.' },
      { label: 'Check the last row', text: 'Does it match what the program prints?' },
    ] },
    { t: 'viz', name: 'm03-trace-table', caption: 'Step through it and guess each value. Try it on paper too.' },
    { t: 'code', caption: 'Add a print inside the loop to check your table. Each line of output is one row.',
      code: py`
        total = 0
        for n in range(1, 4):
            total = total + n
            print(n, total)
        print("Last total:", total)
      `,
      output: '1 1\n2 3\n3 6\nLast total: 6',
    },
    { t: 'q', id: 'trace-score', type: 'trace', level: 2,
      q: 'Fill in the table. Each row is one trip. The first row is done for you.',
      code: py`
        score = 10
        for turn in range(1, 4):
            score = score - turn
        print(score)
      `,
      head: ['turn', 'score'],
      rows: [['-', 10], [1, 9], [2, 7], [3, 4]],
      given: 1,
      verify: py`
        score = 10
        print('-', score)
        for turn in range(1, 4):
            score = score - turn
            print(turn, score)
      `,
      explain: 'Each trip takes turn away from the old score. So 10 becomes 9, then 7, then 4.',
      hints: ['What is the first number range(1, 4) gives?', 'Use the score from the row above.', '10 - 1 is 9. Then what is 9 - 2?'],
    },
    { t: 'trap',
      think: '`total` remembers every number added so far.',
      real: 'A [[variable]] is a tag on one value at a time. When the tag moves, it leaves the old value behind. Your table keeps the old values, but the variable does not.',
      code: py`
        total = 1
        total = 3
        print(total)
      `,
    },
    { t: 'h', text: 'How does a table help with a while loop?' },
    { t: 'p', text: 'Add a column for the question. Then you can see the exact row where it turns False.' },
    { t: 'q', id: 'trace-while', type: 'trace', level: 2,
      q: 'Fill in the table. Write True or False in the second column, with a capital letter.',
      code: py`
        x = 1
        while x < 10:
            x = x * 3
        print(x)
      `,
      head: ['x', 'x<10'],
      rows: [[1, 'True'], [3, 'True'], [9, 'True'], [27, 'False']],
      given: 1,
      verify: py`
        x = 1
        print(x, x < 10)
        while x < 10:
            x = x * 3
            print(x, x < 10)
      `,
      explain: 'Python asks at the top of each trip. Only 27 makes the answer False, so x ends at 27, not 9.',
      hints: ['Each trip multiplies x by 3.', 'Python asks again after each trip. Is 9 < 10?'],
    },
    { t: 'h', text: 'How does a table find a bug?' },
    { t: 'p', text: 'This code should add 1 + 2 + 3 and print 6. But it prints 3. So you trace it.' },
    { t: 'code', caption: 'Run it. The print inside the loop shows the rows of the table.',
      code: py`
        total = 0
        for n in range(1, 3):
            total = total + n
            print(n, total)
        print(total)
      `,
      output: '1 1\n2 3\n3',
    },
    { t: 'table', caption: 'The trace table for this code', head: ['n', 'total'], rows: [
      ['-', '0'],
      ['1', '1'],
      ['2', '3'],
    ] },
    { t: 'q', id: 'find-bug-table', type: 'mcq', level: 2,
      q: 'The last row of the table has n as 2. What is the bug?',
      options: [
        '`range(1, 3)` stops too soon, so n never gets to 3.',
        { text: '`total` should start at 1.', why: 'That gives 1 + 1 + 2, which is 4. The table shows the real gap: n never reaches 3.' },
        { text: 'Python forgot the old total.', why: 'The table shows total growing from 1 to 3, so Python kept it. The missing row is the clue.' },
      ],
      answer: 0,
      explain: 'range stops before the second number. To reach 3, the stop must be 4. This is an off-by-one mistake.',
      hints: ['Which value of n do you need that is not in the table?', 'Which number stops range?'],
    },
    { t: 'big', text: 'A trace table shows what the code really does, not what you hoped it does.' },
    { t: 'tip', title: 'Count the rows', text: 'The number of rows tells you how many trips the loop made. In Module 8, you use counts like this to say how fast code is.' },
  ],
  recap: [
    'You can draw one column for each variable.',
    'You can add one row for each trip.',
    'You can use a table to find a bug.',
  ],
  practice: [
    { id: 'trace-double', type: 'trace', level: 1,
      q: 'Fill in the table. Each row is one trip.',
      code: py`
        for i in range(3):
            x = i * 2
      `,
      head: ['i', 'x'],
      rows: [[0, 0], [1, 2], [2, 4]],
      given: 1,
      verify: py`
        for i in range(3):
            x = i * 2
            print(i, x)
      `,
      explain: 'i goes 0, 1, 2, and x is always i times 2.',
      hints: ['Which numbers does range(3) give?', 'On each row, x is i times 2.'],
    },
    { id: 'count-if-predict', type: 'predict', level: 2,
      q: 'Trace it on paper first. Then type what it prints.',
      code: py`
        count = 0
        for n in range(4):
            if n > 1:
                count = count + 1
        print(count)
      `,
      answer: '2',
      why: 'Make a table with n and count. Which values of n pass the test?',
      explain: 'n goes 0, 1, 2, 3. Only 2 and 3 are above 1, so count grows twice.',
      hints: ['Which numbers does range(4) give?', 'Is 1 > 1?'],
    },
    { id: 'trace-biggest', type: 'trace', level: 2,
      q: 'Trace the biggest recipe. The first row is done for you.',
      code: py`
        biggest = 0
        for n in [3, 8, 5]:
            if n > biggest:
                biggest = n
      `,
      head: ['n', 'biggest'],
      rows: [['-', 0], [3, 3], [8, 8], [5, 8]],
      given: 1,
      verify: py`
        biggest = 0
        print('-', biggest)
        for n in [3, 8, 5]:
            if n > biggest:
                biggest = n
            print(n, biggest)
      `,
      explain: 'biggest changes for 3 and 8. On the last trip, 5 does not beat 8, so biggest stays at 8.',
      hints: ['On each row, ask: does n beat the biggest in the row above?', 'If it does not, copy the old biggest down.'],
    },
    { id: 'trace-halving', type: 'trace', level: 2,
      q: 'Here `//` divides and drops any remainder, so 5 // 2 is 2. Fill in the table.',
      code: py`
        n = 20
        count = 0
        while n > 1:
            n = n // 2
            count = count + 1
      `,
      head: ['n', 'count'],
      rows: [[20, 0], [10, 1], [5, 2], [2, 3], [1, 4]],
      given: 1,
      verify: py`
        n = 20
        count = 0
        print(n, count)
        while n > 1:
            n = n // 2
            count = count + 1
            print(n, count)
      `,
      explain: 'n halves on each trip, and count adds 1. When n is 1, the question is False, so the loop ends.',
      hints: ['20 // 2 is 10.', '5 // 2 is 2, because the remainder is dropped.', 'Is 1 > 1? That is where it stops.'],
    },
    { id: 'fix-with-table', type: 'fix', level: 2,
      q: 'This program should add 1 + 2 + 3 + 4 and print 10. It prints 4. Trace it, then fix it.',
      code: py`
        total = 0
        for n in range(1, 5):
            total = n
        print(total)
      `,
      answer: py`
        total = 0
        for n in range(1, 5):
            total = total + n
        print(total)
      `,
      wantOutput: '10',
      explain: 'The table shows total copying n on each trip. The fix adds n to the old total.',
      hints: ['Fill in a table. What is total on each row?', 'The new total should use the old total.'],
    },
    { id: 'trace-fib', type: 'trace', level: 3,
      q: 'This one has 4 columns. Go line by line inside the loop. The first row is done for you.',
      code: py`
        a = 1
        b = 1
        for i in range(3):
            c = a + b
            a = b
            b = c
      `,
      head: ['i', 'c', 'a', 'b'],
      rows: [['-', '-', 1, 1], [0, 2, 1, 2], [1, 3, 2, 3], [2, 5, 3, 5]],
      given: 1,
      verify: py`
        a = 1
        b = 1
        print('-', '-', a, b)
        for i in range(3):
            c = a + b
            a = b
            b = c
            print(i, c, a, b)
      `,
      explain: 'Each trip adds a and b to make c. Then a takes the old b, and b takes c.',
      hints: ['Do the lines in order: first c, then a, then b.', 'On the first trip, c is 1 + 1.', 'a = b uses the value of b before b changes.'],
    },
    { id: 'write-product', type: 'write', level: 3,
      q: 'Multiply 1 x 2 x 3 x 4 with a loop. Use the name `product` for the answer, then print it. Trace it first. What must product start at?',
      starter: '# Set product, then write your loop.\n',
      answer: py`
        product = 1
        for n in range(1, 5):
            product = product * n
        print(product)
      `,
      tests: [{ label: 'product is 24', check: 'product == 24' }],
      wantOutput: '24',
      explain: 'It must start at 1. If it starts at 0, every row stays 0. That is because 0 times anything is 0.',
      hints: ['It has the shape of the sum recipe, with `*` in place of `+`.', 'Try a start of 0 in a table. What happens?', 'Start at 1.'],
    },
  ],
});

// ------------------------------------------------------------------ 3.5
Course.lesson('m03-loops', {
  id: '3-5-nested-loops',
  num: '3.5',
  title: 'Loops inside loops',
  goal: 'You can nest 2 loops, and say how many times the inner lines run.',
  mins: 12,
  steps: [
    { t: 'h', text: 'What is a loop inside a loop?' },
    { t: 'p', text: 'A cinema has 2 rows, and each row has 3 seats. You want to print every seat. So you need one loop for the rows. You need another for the seats in each row.' },
    { t: 'words', items: [
      { word: 'nested', means: 'Put inside something of the same kind, like a loop in a loop.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a clock. Each time the hour hand moves once, the minute hand goes all the way round. The minute hand is the inner loop. Unlike a clock, [[nested]] loops do end.' },
    { t: 'viz', name: 'm03-nested-grid', caption: 'The inner loop starts over on each outer trip. Watch col go back to 0.' },
    { t: 'q', id: 'nested-count', type: 'mcq', level: 2,
      q: 'How many times does print run?',
      code: py`
        for a in range(3):
            for b in range(4):
                print("hi")
      `,
      options: [
        '12 times',
        { text: '7 times', why: 'You added 3 and 4. But each of the 3 outer trips runs all 4 inner trips.' },
        { text: '4 times', why: 'The inner loop starts over on each outer trip. So its 4 trips happen 3 times.' },
      ],
      answer: 0,
      explain: 'There are 3 outer trips, and each one has 4 inner trips. 3 x 4 = 12.',
      hints: ['How many inner trips happen for one outer trip?', 'Then multiply by the number of outer trips.'],
    },
    { t: 'code', caption: 'Run it. Then change the 3 to a 4. How many lines do you get now?',
      code: py`
        for row in range(2):
            for seat in range(3):
                print("row", row, "seat", seat)
        print("Done")
      `,
      output: 'row 0 seat 0\nrow 0 seat 1\nrow 0 seat 2\nrow 1 seat 0\nrow 1 seat 1\nrow 1 seat 2\nDone',
    },
    { t: 'q', id: 'trace-pairs', type: 'trace', level: 2,
      q: 'Fill in the table. Each row shows a and b when print runs. The first row is done for you.',
      code: py`
        for a in range(2):
            for b in range(2):
                print(a, b)
      `,
      head: ['a', 'b'],
      rows: [[0, 0], [0, 1], [1, 0], [1, 1]],
      given: 1,
      verify: py`
        for a in range(2):
            for b in range(2):
                print(a, b)
      `,
      explain: 'b goes all the way through for each value of a. So b goes 0, 1, then 0, 1 again.',
      hints: ['Which one changes first, a or b?', 'When b runs out of numbers, a moves on and b starts over.'],
    },
    { t: 'q', id: 'indent-decides', type: 'predict', level: 2,
      q: 'Look at the [[indentation]]. What does this print?',
      code: py`
        for a in range(2):
            print("A")
            for b in range(2):
                print("B")
      `,
      options: [
        'A\nB\nB\nA\nB\nB',
        { text: 'A\nB\nA\nB', why: 'The inner loop runs all its trips on each outer trip. So B shows 2 times after each A.' },
        { text: 'A\nA\nB\nB', why: 'The inner loop sits inside the outer loop. It runs before the next A, not after all of them.' },
      ],
      answer: 0,
      explain: 'Each outer trip prints A once. Then the inner loop prints B 2 times.',
      hints: ['Which lines belong to the outer loop?', 'Go through one outer trip first.'],
    },
    { t: 'trap',
      think: 'The inner loop carries on from where it stopped.',
      real: 'The inner loop starts over on each outer trip. So `b` goes back to 0 every time.',
      code: py`
        for a in range(2):
            for b in range(2):
                print(b)    # shows 0, 1, 0, 1
      `,
    },
    { t: 'tip', title: 'break leaves one loop', text: 'In a [[nested]] loop, [[break]] leaves only the loop it is in. The outer loop keeps going.' },
    { t: 'code', caption: 'Each outer trip builds one line of stars. Change the 3 and the 4, and guess first.',
      code: py`
        for row in range(3):
            line = ""
            for col in range(4):
                line = line + "*"
            print(line)
      `,
      output: '****\n****\n****',
    },
    { t: 'big', text: 'The inner loop runs all the way through, once for each outer trip.' },
  ],
  recap: [
    'You can put a loop inside a loop.',
    'You can say how many times the inner lines run.',
    'You can say which loop a break leaves.',
  ],
  practice: [
    { id: 'count-all-trips', type: 'predict', level: 1,
      q: 'Type what this program prints.',
      code: py`
        count = 0
        for a in range(2):
            for b in range(5):
                count = count + 1
        print(count)
      `,
      answer: '10',
      why: 'There are 2 outer trips, and each one has 5 inner trips. Multiply them.',
      explain: 'Each of the 2 outer trips runs the inner line 5 times. 2 x 5 = 10.',
      hints: ['How many inner trips happen for one outer trip?', 'Now multiply by the number of outer trips.'],
    },
    { id: 'break-inner-only', type: 'predict', level: 2,
      q: 'What does this print?',
      code: py`
        for a in range(2):
            for b in range(3):
                if b == 1:
                    break
                print(a, b)
      `,
      options: [
        '0 0\n1 0',
        { text: '0 0', why: 'break leaves only the inner loop. The outer loop still takes its next trip.' },
        { text: '0 0\n0 1\n1 0\n1 1', why: 'break runs before print when b is 1. So b = 1 is never shown.' },
      ],
      answer: 0,
      explain: 'On each outer trip, the inner loop prints b = 0, then breaks at b = 1. The outer loop goes on.',
      hints: ['Which loop does break leave?', 'Go through it once with a = 0, then again with a = 1.'],
    },
    { id: 'order-nested', type: 'order', level: 2,
      q: 'Put the lines in order. The program prints 1 1, 1 2, 2 1, 2 2, then Done once. One line is not needed.',
      lines: [
        'for a in range(1, 3):',
        '    for b in range(1, 3):',
        '        print(a, b)',
        'print("Done")',
      ],
      extra: ['        print("Done")'],
      output: '1 1\n1 2\n2 1\n2 2\nDone',
      explain: 'The inner loop sits inside the outer loop, pushed in by 4 more spaces. print("Done") has no indent, so it runs once.',
      hints: ['Which line must come first?', 'How many times should Done show? Which indent does that need?'],
    },
    { id: 'fix-inner-indent', type: 'fix', level: 2,
      q: 'This should print each pair. Python got stuck on line 3, because print is not inside the inner loop. Fix it.',
      code: py`
        for a in range(2):
            for b in range(2):
            print(a, b)
      `,
      answer: py`
        for a in range(2):
            for b in range(2):
                print(a, b)
      `,
      wantOutput: '0 0\n0 1\n1 0\n1 1',
      explain: 'Each loop needs its own indented lines. So the print line needs 8 spaces to sit inside the inner loop.',
      hints: ['How many spaces does a line inside the inner loop need?', 'Add 4 more spaces in front of print.'],
    },
    { id: 'write-pairs', type: 'write', level: 2,
      q: 'Use a loop inside a loop to print every pair. The outer loop is `for a in range(3):`, and the inner loop is `for b in range(2):`.',
      starter: '# Write your 2 loops here.\n',
      answer: py`
        for a in range(3):
            for b in range(2):
                print(a, b)
      `,
      wantOutput: '0 0\n0 1\n1 0\n1 1\n2 0\n2 1',
      tests: [
        { label: 'a ends at 2', check: 'a == 2' },
        { label: 'b ends at 1', check: 'b == 1' },
      ],
      explain: 'a takes each of 0, 1 and 2. For each one, b takes 0 and 1. That makes 3 x 2 = 6 lines.',
      hints: ['Write the 2 for lines first. The second one is pushed in by 4 spaces.', 'The print line is pushed in by 8 spaces.', 'Use `print(a, b)`.'],
    },
    { id: 'write-table-total', type: 'write', level: 3,
      q: 'Add up `a * b` for every pair, with `a` and `b` each going from 1 to 3. Use the name `total` for the answer, then print it.',
      starter: 'total = 0\n# Write your 2 loops here.\n',
      answer: py`
        total = 0
        for a in range(1, 4):
            for b in range(1, 4):
                total = total + a * b
        print(total)
      `,
      wantOutput: '36',
      tests: [
        { label: 'total is 36', check: 'total == 36' },
        { label: 'a ends at 3', check: 'a == 3' },
        { label: 'b ends at 3', check: 'b == 3' },
      ],
      explain: 'This is the sum recipe with 2 loops. It adds 9 products, and they come to 36.',
      hints: ['Which range gives 1, 2 and 3?', 'Use the same range for both loops.', 'Inside the inner loop, write `total = total + a * b`.'],
    },
  ],
});
