/* Module 8: How Fast Is It? Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm08-big-o',
  num: 8, part: 2, level: 'B',
  title: 'How Fast Is It?',
  blurb: 'Count the steps your code takes, and see how they grow as the input grows.',
  needs: ['m03-loops', 'm04-functions'],
});

// ---------------------------------------------------------------- lesson 8.1
Course.lesson('m08-big-o', {
  id: '8-1-count-steps',
  num: '8.1',
  title: 'Count steps, not seconds',
  goal: 'You can count the steps of a loop, and say how the count grows.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Which computer did more work?' },
    { t: 'p', text: 'Ann and Bo run the same code on the same list. Ann sees 2 seconds on her clock. Bo sees 6 seconds on his.' },
    { t: 'q', id: 'why-seconds', type: 'mcq', level: 1,
      q: 'Why do the two clocks differ?',
      options: [
        { text: 'The code did more steps on the computer Bo has.', why: 'You may think slow means more steps. The same code on the same list does the same steps.' },
        'The computer Bo has does each step more slowly.',
        { text: 'The code is worse when Bo runs it.', why: 'The code is the same for both. Seconds also depend on the computer.' },
      ],
      answer: 1,
      explain: 'The steps are the same. Each computer does them at its own speed.',
      hints: ['Is the code any different for Ann and Bo?', 'What is different about their computers?'],
    },
    { t: 'viz', name: 'm08-two-computers', caption: 'Step through it and answer each question. Then change the numbers.' },
    { t: 'big', text: 'Seconds depend on the computer. Steps depend on the code and its input.' },
    { t: 'analogy', title: 'Picture this', text: 'A phone book is a thick book of names in order. Say you flip one page at a time to find a name. A book twice as thick can take twice the flips. Unlike page flips, code steps are not all the same size. So a count shows the growth, not the exact time.' },
    { t: 'words', items: [
      { word: 'input size', means: 'How many items the code must work on. We call it n.' },
      { word: 'time complexity', means: 'How the number of steps grows when the input grows.', say: 'kom-PLEK-sit-ee' },
      { word: 'Big-O', means: 'A short way to write how fast the steps grow.', say: 'big oh' },
    ] },
    { t: 'h', text: 'What counts as a step?' },
    { t: 'p', text: 'A step is one small job, like one trip around a loop. Pick the job that repeats the most. Then count how many times it runs.' },
    { t: 'steps', title: 'Count the steps of a loop', items: [
      { label: 'Pick the job', text: 'Here the job is one trip around the loop.', code: 'for x in items:\n    steps = steps + 1' },
      { label: 'Try a tiny input', text: 'Use 4 items and count by hand: 1, 2, 3, 4. That is 4 steps.' },
      { label: 'Try twice as many', text: 'Use 8 items and count again. That is 8 steps.' },
      { label: 'Say the rule', text: 'The steps match the [[input size]]. With n items, the loop takes n steps.' },
    ] },
    { t: 'viz', name: 'm08-count-loop', caption: 'Guess each time it asks. Then try 0 items, 1 item and 6 items.' },
    { t: 'q', id: 'count-five', type: 'predict', level: 1,
      q: 'Count the trips by hand. What will the screen show?',
      code: py`
        steps = 0
        for x in [4, 9, 2, 7, 1]:
            steps = steps + 1
        print(steps)
      `,
      answer: '5',
      explain: 'The list has 5 items, so the loop makes 5 trips.',
      hints: ['Touch each item in the list with your finger.', 'Each item adds 1 to steps.'],
    },
    { t: 'code', caption: 'The computer can count for you. Add your own number to the list at the end.',
      code: py`
        def count_steps(n):
            steps = 0
            for i in range(n):
                steps = steps + 1
            return steps

        for n in [4, 8, 1000]:
            print(n, count_steps(n))
      `,
      output: '4 4\n8 8\n1000 1000',
    },
    { t: 'q', id: 'big-values', type: 'mcq', level: 2,
      q: 'A loop goes over each list once. Which list takes more trips: `[1000, 2000]` or `[1, 2, 3, 4, 5]`?',
      options: [
        { text: '`[1000, 2000]`', why: 'You may think big values mean more steps. The input size is how many items there are.' },
        '`[1, 2, 3, 4, 5]`',
        { text: 'They take the same.', why: 'The two lists have different lengths, and the loop makes one trip per item.' },
      ],
      answer: 1,
      explain: 'One list has 2 items and the other has 5. The loop counts items, not how big they are.',
      hints: ['What does the loop do once per trip?', 'How many items does each list have?'],
    },
    { t: 'code', caption: 'Each line shows the total, then the steps. Big values do not add steps. Try a list of your own.',
      code: py`
        def add_all(nums):
            total = 0
            steps = 0
            for x in nums:
                total = total + x
                steps = steps + 1
            print(total, steps)

        add_all([1000, 2000])
        add_all([1, 2, 3, 4, 5])
        add_all([])
      `,
      output: '3000 2\n15 5\n0 0',
    },
    { t: 'p', text: 'See the last line? An empty list makes 0 trips, and nothing breaks. Always test an empty list and a list with 1 item.' },
    { t: 'h', text: 'How does the count grow?' },
    { t: 'q', id: 'grow-table', type: 'trace', level: 2,
      q: 'This loop adds 2 on each trip. Fill in the steps for each n.',
      code: py`
        def count_steps(n):
            steps = 0
            for i in range(n):
                steps = steps + 2
            return steps
      `,
      head: ['n', 'steps'],
      rows: [['1', '2'], ['2', '4'], ['4', '8'], ['8', '16']],
      given: 1,
      verify: 'def count_steps(n):\n    steps = 0\n    for i in range(n):\n        steps = steps + 2\n    return steps\nfor n in [1, 2, 4, 8]:\n    print(n, count_steps(n))',
      explain: 'Each row doubles n, and the steps double too. That growth is what matters.',
      hints: ['How many trips does n = 2 make?', 'Each trip adds 2.'],
    },
    { t: 'p', text: 'Look down your table. When n doubles, the steps double. That pattern is the [[time complexity]] of this loop.' },
    { t: 'cost', title: 'What you can count so far', items: [
      { op: 'Loop over n items', cost: 'n steps', why: 'One trip for each item.' },
      { op: 'Loop over an empty list', cost: '0 steps', why: 'No items, so no trips.' },
      { op: 'Double n in that loop', cost: '2 times the steps', why: 'Twice the items, twice the trips.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Words like "each item", "every name" or "go through the list" hint at one loop. So expect the steps to grow with n.' },
    { t: 'trap',
      think: 'My program took 1 second, so it is fast.',
      real: 'Seconds change with the computer and the input. Count the steps, then ask how they grow for a bigger input.',
      code: py`
        # 10 items: 10 steps
        # 1000000 items: 1000000 steps
        for x in items:
            print(x)
      `,
    },
    { t: 'tip', title: 'Coming next', text: 'People write growth in [[Big-O]]. You counted first, because a count is what Big-O is about. The next lesson gives each kind of growth a short name.' },
  ],
  recap: [
    'You can count the trips of a loop by hand.',
    'You know seconds change, but steps do not.',
    'You can say what happens when n doubles.',
  ],
  practice: [
    { id: 'what-to-count', type: 'mcq', level: 1,
      q: 'You want to compare two programs fairly. What should you look at?',
      options: [
        { text: 'The seconds on your own computer', why: 'Seconds also depend on the computer and what else it is doing.' },
        'How the steps grow as the input grows',
        { text: 'How many lines of code each one has', why: 'A short program can still loop a million times.' },
      ],
      answer: 1,
      explain: 'Steps do not depend on the computer. Their growth tells you how the code copes with big inputs.',
      hints: ['Which of these stays the same on every computer?'],
    },
    { id: 'count-while', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        n = 7
        steps = 0
        while n > 0:
            n = n - 1
            steps = steps + 1
        print(steps)
      `,
      answer: '7',
      explain: 'n goes 7, 6, 5, 4, 3, 2, 1, so the loop makes 7 trips. When n is 0, the loop stops.',
      hints: ['How much does n go down on each trip?', 'The loop stops when n is 0.'],
    },
    { id: 'range-start', type: 'predict', level: 2,
      q: 'How many steps does this loop take?',
      code: py`
        steps = 0
        for i in range(2, 8):
            steps = steps + 1
        print(steps)
      `,
      options: [
        { text: '8', why: 'You may be reading only the stop number. This range starts at 2.' },
        '6',
        { text: '7', why: 'You may think range includes 8. It stops before 8, so i goes from 2 to 7.' },
      ],
      answer: 1,
      explain: 'i takes the values 2, 3, 4, 5, 6 and 7. That is 6 trips.',
      hints: ['Write out the values of i.', 'range stops before its stop number.'],
    },
    { id: 'jump-two', type: 'predict', level: 2,
      q: 'i jumps by 2 this time. How many steps does this loop take?',
      code: py`
        i = 0
        steps = 0
        while i < 10:
            i = i + 2
            steps = steps + 1
        print(steps)
      `,
      options: [
        { text: '10', why: 'You may be using the stop number as the count. Each trip moves i by 2, not 1.' },
        '5',
        { text: '6', why: 'You may be counting a trip at i = 10. The loop asks first, and 10 < 10 is False.' },
      ],
      answer: 1,
      explain: 'The trips start at i = 0, 2, 4, 6 and 8. That is 5 trips.',
      hints: ['Make a small table of i and steps.'],
    },
    { id: 'fix-counter', type: 'fix', level: 2,
      q: 'This function should count the items in a list, but it is wrong. Fix it.',
      code: py`
        def count_items(items):
            for x in items:
                steps = 0
                steps = steps + 1
            return steps
      `,
      answer: py`
        def count_items(items):
            steps = 0
            for x in items:
                steps = steps + 1
            return steps
      `,
      tests: [
        { label: 'count_items([5, 6, 7])', call: 'count_items([5, 6, 7])', want: '3' },
        { label: 'count_items(["a"])', call: 'count_items(["a"])', want: '1' },
        { label: 'count_items([])', call: 'count_items([])', want: '0' },
      ],
      explain: 'The counter must start once, before the loop. Inside the loop, it starts over on each trip.',
      hints: ['What happens to steps at the top of each trip?', 'Move one line up, above the loop.'],
    },
    { id: 'count-trips', type: 'write', level: 2,
      q: 'Write `count_trips(word)`. Loop over the letters and count the trips. Do not use `len`.',
      starter: py`
        def count_trips(word):
            # Your code here.
            return None
      `,
      answer: py`
        def count_trips(word):
            trips = 0
            for letter in word:
                trips = trips + 1
            return trips
      `,
      tests: [
        { label: 'count_trips("cat")', call: 'count_trips("cat")', want: '3' },
        { label: 'count_trips("a")', call: 'count_trips("a")', want: '1' },
        { label: 'count_trips("")', call: 'count_trips("")', want: '0' },
      ],
      explain: 'A for loop visits each letter once. So the trips match the length of the word.',
      hints: ['Start a counter at 0.', 'Add 1 inside a `for` loop over the word.'],
    },
    { id: 'pages-flipped', type: 'write', level: 3,
      q: 'Stretch: write `pages_flipped(pages, name_page)`. Flip from page 1 up, and stop at name_page. If the name is not in the book, you flip every page. Give back the flips.',
      starter: py`
        def pages_flipped(pages, name_page):
            # Your code here.
            return 0
      `,
      answer: py`
        def pages_flipped(pages, name_page):
            flips = 0
            for page in range(1, pages + 1):
                flips = flips + 1
                if page == name_page:
                    break
            return flips
      `,
      tests: [
        { label: 'pages_flipped(10, 4)', call: 'pages_flipped(10, 4)', want: '4' },
        { label: 'pages_flipped(10, 1)', call: 'pages_flipped(10, 1)', want: '1' },
        { label: 'pages_flipped(10, 99)', call: 'pages_flipped(10, 99)', want: '10' },
        { label: 'pages_flipped(0, 1)', call: 'pages_flipped(0, 1)', want: '0' },
      ],
      explain: 'Each trip is one flip. `break` ends the loop when you reach the page.',
      hints: ['Use `range(1, pages + 1)` for the page numbers.', 'Add 1 to flips first, then check the page.', '`break` leaves the loop.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 8.2
Course.lesson('m08-big-o', {
  id: '8-2-loops-big-o',
  num: '8.2',
  title: 'O(1), O(n) and O(n^2): read the loops',
  goal: 'You can look at loops and name their growth as O(1), O(n) or O(n^2).',
  mins: 14,
  steps: [
    { t: 'h', text: 'Three small programs, three counts' },
    { t: 'p', text: 'Before any new words, count by hand. These 3 functions each hand back their own step count.' },
    { t: 'q', id: 'count-three', type: 'trace', level: 2,
      q: 'Work out each function for n = 2 and n = 4. The first row is done for you.',
      code: py`
        def no_loop(n):
            return 1

        def one_loop(n):
            steps = 0
            for i in range(n):
                steps = steps + 1
            return steps

        def two_loops(n):
            steps = 0
            for i in range(n):
                for j in range(n):
                    steps = steps + 1
            return steps
      `,
      head: ['n', 'no_loop', 'one_loop', 'two_loops'],
      rows: [['1', '1', '1', '1'], ['2', '1', '2', '4'], ['4', '1', '4', '16']],
      given: 1,
      verify: 'def no_loop(n):\n    return 1\ndef one_loop(n):\n    steps = 0\n    for i in range(n):\n        steps = steps + 1\n    return steps\ndef two_loops(n):\n    steps = 0\n    for i in range(n):\n        for j in range(n):\n            steps = steps + 1\n    return steps\nfor n in [1, 2, 4]:\n    print(n, no_loop(n), one_loop(n), two_loops(n))',
      explain: 'no_loop never changes. one_loop matches n. two_loops makes n trips, n times over.',
      hints: ['no_loop has no loop to count.', 'In two_loops, the inner loop runs all the way on each outer trip.'],
    },
    { t: 'viz', name: 'm08-nested-steps', caption: 'Each square is one step. Answer as you go, then try n = 0, 1 and 5.' },
    { t: 'p', text: 'You met [[nested]] loops in module 3. Now you can see their cost. The steps fill a square, and a square grows fast.' },
    { t: 'words', items: [
      { word: 'O(1)', means: 'Always the same number of steps, no matter how big the input.', say: 'oh of one' },
      { word: 'O(n)', means: 'Steps grow in line with the input: twice the items, twice the steps.', say: 'oh of en' },
      { word: 'O(n^2)', means: 'Steps grow like the input times itself: double the items, 4 times the steps.', say: 'oh of en squared' },
    ] },
    { t: 'p', text: 'In a [[Big-O]] name, `n^2` means n times n. In Python you would write that as `n * n`.' },
    { t: 'viz', name: 'm08-race-three', caption: 'Each bar is a step count, not a clock. Answer, then put in your own n.' },
    { t: 'big', text: 'No loop stays flat. One loop grows with n. A loop in a loop grows with n times n.' },
    { t: 'q', id: 'what-o-n-means', type: 'mcq', level: 2,
      q: 'A function is `O(n)`, and n is 1000. What can you say for sure?',
      options: [
        { text: 'It takes 1000 seconds.', why: 'O(n) counts no seconds at all. It only names how the steps grow.' },
        { text: 'It takes exactly 1000 steps.', why: 'O(n) gives the growth, not the exact count. It might take 2000 steps.' },
        'If n doubles, the steps about double.',
      ],
      answer: 2,
      explain: 'Big-O names the shape of the growth. It does not give seconds or an exact count.',
      hints: ['Think about what your tables showed.', 'Is Big-O about clocks?'],
    },
    { t: 'code', caption: 'Run it. Look at the right-hand column, then add 32 to the list.',
      code: py`
        def two_loops(n):
            steps = 0
            for i in range(n):
                for j in range(n):
                    steps = steps + 1
            return steps

        for n in [2, 4, 8, 16]:
            print(n, two_loops(n))
      `,
      output: '2 4\n4 16\n8 64\n16 256',
    },
    { t: 'h', text: 'How do you read the loops?' },
    { t: 'steps', title: 'Name the growth in 3 moves', items: [
      { label: 'Find n', text: 'Ask what can grow. It is often the length of a list.' },
      { label: 'Find the loops that use n', text: 'A loop that always runs 3 times does not grow. It costs a fixed number of steps.', code: '# This does not grow.\nfor i in range(3):\n    print(items[0])' },
      { label: 'Times or plus?', text: 'One loop inside another means times. One loop after another means plus.', code: 'inside: n * n\nafter:  n + n' },
    ] },
    { t: 'q', id: 'one-after-other', type: 'predict', level: 2,
      q: 'Two loops, one after the other. What will the screen show?',
      code: py`
        n = 4
        steps = 0
        for i in range(n):
            steps = steps + 1
        for j in range(n):
            steps = steps + 1
        print(steps)
      `,
      options: [
        { text: '16', why: 'You may have multiplied. The second loop is not inside the first, so you add.' },
        '8',
        { text: '4', why: 'Both loops run, so both add steps. They do not share their trips.' },
      ],
      answer: 1,
      explain: 'The first loop adds 4 and the second adds 4. So n + n is 8, and that is still `O(n)`.',
      hints: ['Is the second loop indented under the first?', 'Add up the trips of each loop.'],
    },
    { t: 'q', id: 'order-nested', type: 'order', level: 2,
      q: 'Put the lines in order, so the code counts n times n steps for n = 3.',
      lines: ['steps = 0', 'for i in range(3):', '    for j in range(3):', '        steps = steps + 1', 'print(steps)'],
      extra: ['    steps = 0'],
      output: '9',
      explain: 'The counter starts once. The inner loop sits inside the outer one, and print comes after both.',
      hints: ['Which line must run only once, at the very start?', 'Each deeper line has more spaces in front.'],
    },
    { t: 'h', text: 'Can one line hide a loop?' },
    { t: 'p', text: 'Yes. `x in items` looks like one small job. But Python checks the items one by one, so it is a hidden loop.' },
    { t: 'q', id: 'hidden-loop', type: 'mcq', level: 2,
      q: 'Lists a and b each hold n items. What growth does this code have?',
      code: py`
        for x in a:
            if x in b:
                print(x)
      `,
      options: [
        { text: '`O(n)`', why: 'Only one `for` is on show, but `x in b` is a hidden loop inside it.' },
        '`O(n^2)`',
        { text: '`O(1)`', why: 'Both a and b can grow, so the steps grow too.' },
      ],
      answer: 1,
      explain: 'The loop makes n trips, and each `x in b` can look at n items. That is n times n.',
      hints: ['What does `x in b` do when x is not there?', 'A loop inside a loop means times.'],
    },
    { t: 'code', caption: 'Here the hidden loop is written out, so it can count its looks. No value matches, the worst case. Add a fifth item to both lists.',
      code: py`
        def count_looks(a, b):
            looks = 0
            for x in a:
                # This is "x in b".
                for y in b:
                    looks = looks + 1
                    if y == x:
                        break
            return looks

        a = [1, 2, 3]
        b = [7, 8, 9]
        print(count_looks(a, b))
        a = [1, 2, 3, 4]
        b = [6, 7, 8, 9]
        print(count_looks(a, b))
      `,
      output: '9\n16',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`items[k]`', cost: 'O(1)', why: 'Go straight to the locker with that number.' },
      { op: '`len(items)`', cost: 'O(1)', why: 'The count is already known. Python does not count again.' },
      { op: 'A loop over the list', cost: 'O(n)', why: 'One trip for each item.' },
      { op: '`x in items`', cost: 'O(n)', why: 'A hidden loop. It may check every item.' },
      { op: '`min(items)`, `max(items)`', cost: 'O(n)', why: 'A hidden loop. It must see every item.' },
      { op: 'Check every pair of items', cost: 'O(n^2)', why: 'A loop in a loop.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Cue words help. "Get the item at spot k" points to `O(1)`. "Check each item" points to `O(n)`. "Compare every pair" points to `O(n^2)`.' },
    { t: 'trap',
      think: 'Two `for` lines always mean `O(n^2)`.',
      real: 'Only if one is inside the other, and both grow with n. One after the other is `n + n`, which is `O(n)`.',
      code: py`
        for x in items:       # n steps
            print(x)
        for x in items:       # n more steps
            print(x)
      `,
    },
  ],
  recap: [
    'You can name no loop as O(1).',
    'You can name one loop as O(n).',
    'You can name a loop in a loop as O(n^2).',
  ],
  practice: [
    { id: 'match-shapes', type: 'match', level: 1,
      q: 'Match each piece of code to its growth.',
      pairs: [
        ['`items[0]`', 'O(1)'],
        ['`for x in items:`', 'O(n)'],
        ['A `for` inside a `for`, both over items', 'O(n^2)'],
      ],
      explain: 'A jump to one spot does not grow. One loop grows with n. A loop in a loop grows with n times n.',
      hints: ['Which one has no loop at all?'],
    },
    { id: 'double-square', type: 'mcq', level: 1,
      q: 'An `O(n^2)` function takes 100 steps at n = 10. About how many steps at n = 20?',
      options: [
        { text: '200', why: 'That is how `O(n)` grows. Here both n in n times n double.' },
        '400',
        { text: '120', why: 'You may have added 20 steps. Growth here is by times, not by plus.' },
      ],
      answer: 1,
      explain: 'Double n, and n times n goes up 4 times. So 100 becomes about 400.',
      hints: ['What is 20 times 20?'],
    },
    { id: 'inner-fixed', type: 'predict', level: 2,
      q: 'Look closely at the inner range. What will the screen show?',
      code: py`
        n = 3
        steps = 0
        for i in range(n):
            for j in range(2):
                steps = steps + 1
        print(steps)
      `,
      options: [
        '6',
        { text: '9', why: 'You may have read both ranges as n. The inner one always runs 2 times.' },
        { text: '5', why: 'You may have added 3 and 2. One loop inside another means times.' },
      ],
      answer: 0,
      explain: 'That is 3 trips times 2 trips, which is 6. The inner loop does not grow, so this is `O(n)`.',
      hints: ['How many trips does the inner loop make?', 'Does the inner count change when n grows?'],
    },
    { id: 'fixed-loop', type: 'mcq', level: 2,
      q: 'What growth does this have, if items can be any length?',
      code: py`
        for i in range(100):
            print(items[0])
      `,
      options: [
        { text: '`O(n)`', why: 'You may see a loop and think O(n). This one runs 100 times, however long the list is.' },
        '`O(1)`',
        { text: '`O(n^2)`', why: 'There is only one loop here, and it does not use the length of the list.' },
      ],
      answer: 1,
      explain: 'The count is always 100. A fixed count does not grow, so it is `O(1)`.',
      hints: ['What happens to the count when items gets longer?'],
    },
    { id: 'fix-pairs', type: 'fix', level: 2,
      q: '`count_pairs(n)` should count n times n steps. It only gets n + n. Fix it.',
      code: py`
        def count_pairs(n):
            steps = 0
            for i in range(n):
                steps = steps + 1
            for j in range(n):
                steps = steps + 1
            return steps
      `,
      answer: py`
        def count_pairs(n):
            steps = 0
            for i in range(n):
                for j in range(n):
                    steps = steps + 1
            return steps
      `,
      tests: [
        { label: 'count_pairs(3)', call: 'count_pairs(3)', want: '9' },
        { label: 'count_pairs(1)', call: 'count_pairs(1)', want: '1' },
        { label: 'count_pairs(0)', call: 'count_pairs(0)', want: '0' },
      ],
      explain: 'Put one loop inside the other. Then each outer trip runs the whole inner loop.',
      hints: ['Should the loops sit one after the other, or one inside the other?', 'Indent the second loop under the first.'],
    },
    { id: 'grid-steps', type: 'write', level: 2,
      q: 'A grid has `rows` rows and `cols` columns. Write `grid_steps(rows, cols)`. Use 2 loops to count the visits to every spot.',
      starter: py`
        def grid_steps(rows, cols):
            # Your code here.
            return None
      `,
      answer: py`
        def grid_steps(rows, cols):
            steps = 0
            for r in range(rows):
                for c in range(cols):
                    steps = steps + 1
            return steps
      `,
      tests: [
        { label: 'grid_steps(2, 3)', call: 'grid_steps(2, 3)', want: '6' },
        { label: 'grid_steps(4, 1)', call: 'grid_steps(4, 1)', want: '4' },
        { label: 'grid_steps(0, 5)', call: 'grid_steps(0, 5)', want: '0' },
      ],
      explain: 'The inner loop runs cols times for each of the rows. So the count is rows times cols.',
      hints: ['Use the shape of `two_loops` from the lesson.', 'One range uses rows, and the other uses cols.'],
    },
    { id: 'has-pair', type: 'write', level: 3,
      q: 'Stretch: write `has_pair(nums, target)`. It gives back True if 2 different spots add up to target. Check every pair of spots.',
      starter: py`
        def has_pair(nums, target):
            # Your code here.
            return None
      `,
      answer: py`
        def has_pair(nums, target):
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    if nums[i] + nums[j] == target:
                        return True
            return False
      `,
      tests: [
        { label: 'has_pair([1, 2, 3], 5)', call: 'has_pair([1, 2, 3], 5)', want: 'True' },
        { label: 'has_pair([1, 2, 3], 7)', call: 'has_pair([1, 2, 3], 7)', want: 'False' },
        { label: 'has_pair([4, 4], 8)', call: 'has_pair([4, 4], 8)', want: 'True' },
        { label: 'has_pair([4], 8)', call: 'has_pair([4], 8)', want: 'False' },
        { label: 'has_pair([], 0)', call: 'has_pair([], 0)', want: 'False' },
      ],
      explain: 'Starting j at `i + 1` means a spot never pairs with itself. "Every pair" is the cue for `O(n^2)`.',
      hints: ['Use a loop in a loop, over the spots.', 'Start the inner loop at `i + 1`.', 'Return False only after both loops end.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 8.3
Course.lesson('m08-big-o', {
  id: '8-3-halving',
  num: '8.3',
  title: 'O(log n) and O(n log n): the power of halving',
  goal: 'You can spot code that halves its input, and say why it grows so slowly.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What if you stop flipping one page at a time?' },
    { t: 'p', text: 'Back to the phone book. This time you open it in the middle. The name is in one half. So the other half can go.' },
    { t: 'q', id: 'spark-halve', type: 'mcq', level: 1,
      q: 'Count by hand. A book has 16 pages, and each look throws away half. How many halvings until 1 page is left?',
      options: [
        { text: '8', why: 'That is how many pages are left after one halving. Keep going to 1.' },
        '4',
        { text: '16', why: 'That is the count if you flip every page. Here each look removes half.' },
      ],
      answer: 1,
      explain: '16 goes to 8, then 4, then 2, then 1. That is 4 halvings.',
      hints: ['Write 16, then halve it. Keep going until you reach 1.', 'Count the arrows, not the numbers.'],
    },
    { t: 'viz', name: 'm08-halving', caption: 'Answer as you go. Then try page 1, page 16 and a page that is not in the book.' },
    { t: 'analogy', title: 'Why it works', text: 'One look at the phone book removes half, because the names are in order. A mixed-up book breaks the trick. Then a page tells you nothing about the others.' },
    { t: 'words', items: [
      { word: 'binary search', means: 'Look in the middle, then throw away the half that cannot have it. The items must be in order.', say: 'BY-nuh-ree' },
      { word: 'O(log n)', means: 'Steps grow very slowly: doubling the input adds only one step.', say: 'oh of log en' },
      { word: 'O(n log n)', means: 'A halving job, done once for each of n items.', say: 'oh of en log en' },
    ] },
    { t: 'p', text: 'So `log n` answers one question: how many times can you halve n before you reach 1? You will write a full [[binary search]] in module 10.' },
    { t: 'code', caption: 'Run it. Look how slowly the right-hand column grows. Put your own number in the list.',
      code: py`
        def halvings(n):
            steps = 0
            while n > 1:
                n = n // 2
                steps = steps + 1
            return steps

        big = 1024 * 1024
        for n in [1, 2, 4, 8, 1024, big]:
            print(n, halvings(n))
      `,
      output: '1 0\n2 1\n4 2\n8 3\n1024 10\n1048576 20',
    },
    { t: 'big', text: 'Double the input, and halving takes only 1 more step.' },
    { t: 'q', id: 'halve-32', type: 'predict', level: 1,
      q: 'Count by hand. Type what the screen will show.',
      code: py`
        n = 32
        steps = 0
        while n > 1:
            n = n // 2
            steps = steps + 1
        print(steps)
      `,
      answer: '5',
      explain: '32 goes to 16, 8, 4, 2 and then 1. That is 5 halvings.',
      hints: ['Write the value of n after each trip.'],
    },
    { t: 'viz', name: 'm08-race-five', caption: 'Each bar is a step count. Answer, then try n = 1 and n = 16 too.' },
    { t: 'h', text: 'What is O(n log n)?' },
    { t: 'p', text: 'Put a halving loop inside a loop over n items. Each of the n trips does about log n steps. So the count is n times log n.' },
    { t: 'steps', title: 'Count n log n for n = 8', items: [
      { label: 'Count the outer trips', text: 'The outer loop makes 8 trips.' },
      { label: 'Count the inner halvings', text: 'Each trip halves 8 down to 1. That is 3 steps.', code: 'm = n\nwhile m > 1:\n    m = m // 2' },
      { label: 'Multiply', text: 'Inside means times, so 8 times 3 is 24 steps.' },
    ] },
    { t: 'q', id: 'n-log-n-16', type: 'predict', level: 2,
      q: 'Use the same idea for n = 4. What will the screen show?',
      code: py`
        n = 4
        steps = 0
        for i in range(n):
            m = n
            while m > 1:
                m = m // 2
                steps = steps + 1
        print(steps)
      `,
      options: [
        { text: '6', why: 'You may have added 4 and 2. A loop inside another loop means times.' },
        '8',
        { text: '16', why: 'That would be n times n. The inner loop halves, so it takes only 2 steps.' },
      ],
      answer: 1,
      explain: 'The outer loop makes 4 trips. Each one halves 4 down to 1 in 2 steps. So 4 times 2 is 8.',
      hints: ['How many steps does the while loop take when m starts at 4?', 'Multiply that by the outer trips.'],
    },
    { t: 'code', caption: 'A loop in a loop is not always n times n. Compare the 2 right-hand columns.',
      code: py`
        def n_log_n(n):
            steps = 0
            for i in range(n):
                m = n
                while m > 1:
                    m = m // 2
                    steps = steps + 1
            return steps

        for n in [2, 4, 8, 16]:
            print(n, n_log_n(n), n * n)
      `,
      output: '2 2 4\n4 8 16\n8 24 64\n16 64 256',
    },
    { t: 'p', text: 'You already use this growth. Python sorts a list in `O(n log n)` steps. That is why "sort it first" is often worth the cost.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'A loop that halves n', cost: 'O(log n)', why: 'Double n, and it adds 1 step.' },
      { op: 'Binary search on a sorted list', cost: 'O(log n)', why: 'Each look removes half of what is left.' },
      { op: '`sorted(items)`, `items.sort()`', cost: 'O(n log n)', why: 'Faster growth than one loop, slower growth than a loop in a loop.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Cue words are "sorted", "halve" and "cut in half". In code, look for `n = n // 2`, or for a `mid` that throws half away. "Sort it first" points to `O(n log n)`.' },
    { t: 'trap',
      think: 'I can use binary search on any list.',
      real: 'The list must be sorted. On a mixed-up list, the half you throw away may hold the item.',
    },
    { t: 'code', caption: 'Both lists hold a 3. Run it, and see which search misses it. Then sort the second list and run it again.',
      code: py`
        def found(items, x):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == x:
                    return True
                if items[mid] < x:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return False

        print(found([1, 3, 5, 7, 9], 3))
        print(found([5, 1, 9, 3, 7], 3))
      `,
      output: 'True\nFalse',
    },
    { t: 'tip', title: 'Is there worse?', text: 'Yes. `O(2^n)` doubles the steps each time n grows by 1. You will meet it later, when code tries every choice.' },
  ],
  recap: [
    'You can count halvings by hand.',
    'You know doubling n adds 1 step to O(log n).',
    'You can spot O(n log n), like a sort.',
  ],
  practice: [
    { id: 'double-log', type: 'mcq', level: 1,
      q: 'An `O(log n)` search takes 10 steps on 1024 items. About how many steps on 2048 items?',
      options: [
        { text: '20', why: 'That is how `O(n)` grows. Halving only needs one more cut.' },
        '11',
        { text: '100', why: 'That is 10 times 10. Doubling the input does not square the steps here.' },
      ],
      answer: 1,
      explain: 'The first halving takes 2048 down to 1024. After that, it is the same as before.',
      hints: ['What does one halving do to 2048?'],
    },
    { id: 'halve-64', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        n = 64
        steps = 0
        while n > 1:
            n = n // 2
            steps = steps + 1
        print(steps)
      `,
      answer: '6',
      explain: '64 goes to 32, 16, 8, 4, 2 and then 1. That is 6 halvings.',
      hints: ['Count the halvings until n is 1.'],
    },
    { id: 'unsorted', type: 'mcq', level: 2,
      q: 'You have a mixed-up list of 1000 numbers, and you want to find one number. Can binary search do it as it is?',
      options: [
        { text: 'Yes, because it is always faster.', why: 'It is only fast because it can throw away half. That needs a sorted list.' },
        { text: 'Yes, if the list is short.', why: 'Length is not the problem. Even a short list can fool it, if the list is not sorted.' },
        'No, it needs the list to be sorted first.',
      ],
      answer: 2,
      explain: 'Without order, one look says nothing about the other items. So no half can safely go.',
      hints: ['Why can binary search throw away half?'],
    },
    { id: 'rank-growth', type: 'order', level: 2, run: false,
      q: 'Put these jobs in order, from the slowest-growing steps to the fastest-growing steps.',
      lines: ['Get items[0]', 'Halve n until it reaches 1', 'Look at each item once', 'Sort the list', 'Compare every pair of items'],
      explain: 'The order is `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, then `O(n^2)`. Keep this order in your head.',
      hints: ['Which job does not grow at all?', 'Sorting grows faster than one loop, but slower than every pair.'],
    },
    { id: 'thirds', type: 'predict', level: 2,
      q: 'This loop cuts n into thirds. What will the screen show?',
      code: py`
        n = 27
        steps = 0
        while n > 1:
            n = n // 3
            steps = steps + 1
        print(steps)
      `,
      options: [
        '3',
        { text: '9', why: 'That is n after the first cut, not the number of cuts.' },
        { text: '13', why: 'You may be subtracting 2 on each trip. The `//` divides n, and that is much quicker.' },
      ],
      answer: 0,
      explain: '27 goes to 9, then 3, then 1. Any loop that divides by a fixed number is `O(log n)`.',
      hints: ['Write n after each trip.'],
    },
    { id: 'fix-halve', type: 'fix', level: 2,
      q: '`halvings(n)` should count the halvings until n reaches 1. One line is wrong. Fix it.',
      code: py`
        def halvings(n):
            steps = 0
            while n > 1:
                n = n - 2
                steps = steps + 1
            return steps
      `,
      answer: py`
        def halvings(n):
            steps = 0
            while n > 1:
                n = n // 2
                steps = steps + 1
            return steps
      `,
      tests: [
        { label: 'halvings(8)', call: 'halvings(8)', want: '3' },
        { label: 'halvings(1024)', call: 'halvings(1024)', want: '10' },
        { label: 'halvings(1)', call: 'halvings(1)', want: '0' },
      ],
      explain: '`n - 2` takes a fixed amount off, which is still `O(n)`. `n // 2` cuts n in half each time.',
      hints: ['Does `n - 2` cut n in half?', 'Use `//` so that n stays a whole number.'],
    },
    { id: 'guesses-needed', type: 'write', level: 3,
      q: 'Stretch: I pick a number from 1 to `top`. You always guess the middle. Write `most_guesses(top)`. Cut top in half on each trip, until it is 0. Count the trips.',
      starter: py`
        def most_guesses(top):
            # Your code here.
            return None
      `,
      answer: py`
        def most_guesses(top):
            guesses = 0
            while top > 0:
                top = top // 2
                guesses = guesses + 1
            return guesses
      `,
      tests: [
        { label: 'most_guesses(1)', call: 'most_guesses(1)', want: '1' },
        { label: 'most_guesses(3)', call: 'most_guesses(3)', want: '2' },
        { label: 'most_guesses(8)', call: 'most_guesses(8)', want: '4' },
        { label: 'most_guesses(100)', call: 'most_guesses(100)', want: '7' },
      ],
      explain: 'Each guess removes half of the numbers left. So 100 numbers need at most 7 guesses, which is `O(log n)`.',
      hints: ['Use a `while` loop with the test `top > 0`.', 'Inside it, halve top with `//`, then add 1 to guesses.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 8.4
Course.lesson('m08-big-o', {
  id: '8-4-rules-of-big-o',
  num: '8.4',
  title: 'Drop the small stuff, plan for the worst',
  goal: 'You can cut a step count down to its Big-O, and say which case you mean.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Does 3n + 5 need its own name?' },
    { t: 'p', text: 'Real code does more than one job on each trip. Here it does 5 jobs at the start, then 3 jobs per trip.' },
    { t: 'q', id: 'count-3n5', type: 'predict', level: 1,
      q: 'Count by hand for n = 4. Type what the screen will show.',
      code: py`
        n = 4
        steps = 5
        for i in range(n):
            steps = steps + 3
        print(steps)
      `,
      answer: '17',
      explain: 'It starts at 5, and 4 trips add 3 each. So 5 + 12 is 17.',
      hints: ['What is steps before the loop?', 'How much do all the trips add?'],
    },
    { t: 'code', caption: 'Compare the last 2 columns. As n grows, the extra 5 stops mattering.',
      code: py`
        for n in [10, 100, 1000]:
            print(n, 3 * n + 5, 3 * n)
      `,
      output: '10 35 30\n100 305 300\n1000 3005 3000',
    },
    { t: 'p', text: 'Big-O asks one thing: what shape does the growth have? The `+ 5` fades away. The 3 does not change the shape, because `3n` still doubles when n doubles.' },
    { t: 'steps', title: 'Cut a count down to Big-O', items: [
      { label: 'Write the whole count', text: 'Add up the jobs.', code: '3n + 5' },
      { label: 'Keep the fastest-growing part', text: 'Here `3n` grows and `5` stays still.', code: '3n' },
      { label: 'Drop the number in front', text: 'What is left is the growth shape.', code: 'O(n)' },
    ] },
    { t: 'table', caption: 'More counts, cut down', head: ['Count', 'Big-O', 'What got dropped'], rows: [
      ['`500`', '`O(1)`', 'It never grows, however big it looks.'],
      ['`2n + 100`', '`O(n)`', 'The 2 and the 100'],
      ['`n * n + 4n`', '`O(n^2)`', 'The slower-growing `4n`'],
      ['`n * n / 2`', '`O(n^2)`', 'The "half"'],
    ] },
    { t: 'q', id: 'pairs-half', type: 'predict', level: 2,
      q: 'j starts at `i + 1`, so each pair is counted once. Count by hand. What will the screen show?',
      code: py`
        n = 4
        steps = 0
        for i in range(n):
            for j in range(i + 1, n):
                steps = steps + 1
        print(steps)
      `,
      options: [
        { text: '16', why: 'That is n times n. Here j starts later on each trip, so the inner loop gets shorter.' },
        '6',
        { text: '10', why: 'That would count each spot paired with itself. j starts at `i + 1`, not at i.' },
      ],
      answer: 1,
      explain: 'The inner loop runs 3, then 2, then 1, then 0 times. That adds up to 6.',
      hints: ['How many trips does j make when i is 0?', 'Now do the same for i = 1, 2 and 3.'],
    },
    { t: 'p', text: 'That count is about half of `n * n`. Half of a square still grows like a square, so it is still `O(n^2)`.' },
    { t: 'viz', name: 'm08-constant-race', caption: 'Who wins? Answer each time. Then change the jobs per trip, and find the new tie.' },
    { t: 'p', text: 'So Big-O does not say who wins at every n. It says who wins once n gets big. For a tiny list, either code is fine.' },
    { t: 'h', text: 'Same size, different luck' },
    { t: 'p', text: 'A search can finish early. So one list size can take many different counts. This search looks at items one by one, and they can be in any order.' },
    { t: 'words', items: [
      { word: 'best case', means: 'The fewest steps a job can take, for inputs of one size.' },
      { word: 'worst case', means: 'The most steps a job can take, for inputs of one size.' },
      { word: 'amortized', means: 'Shared out. A rare slow step, spread over many quick ones, costs little each.', say: 'AM-or-tized' },
    ] },
    { t: 'viz', name: 'm08-best-worst', caption: 'Try the first item, the last item, a missing item, an empty list and repeats.' },
    { t: 'code', caption: 'Run it. Then change a target, and try to get a count of 2.',
      code: py`
        def find_steps(items, target):
            steps = 0
            for x in items:
                steps = steps + 1
                if x == target:
                    break
            return steps

        nums = [7, 2, 9, 4]
        print(find_steps(nums, 7))
        print(find_steps(nums, 4))
        print(find_steps(nums, 5))
        print(find_steps([], 5))
      `,
      output: '1\n4\n4\n0',
    },
    { t: 'table', caption: 'One search, 3 cases', head: ['Case', 'When', 'Looks', 'Big-O'], rows: [
      ['[[Best case|best case]]', 'The target is first', '1', '`O(1)`'],
      ['Average', 'The target is there, at a random spot', 'About n / 2', '`O(n)`'],
      ['[[Worst case|worst case]]', 'The target is last or missing', 'n', '`O(n)`'],
    ] },
    { t: 'p', text: 'Plan for the worst case. It is a promise: the code never takes more. The average is often hard to work out, and the best case is only luck.' },
    { t: 'q', id: 'best-not-small', type: 'mcq', level: 2,
      q: 'Which one is the best case for this search?',
      options: [
        { text: 'The list has only 1 item.', why: 'A small list is not the best case. Cases compare inputs of the same size.' },
        'The target is the first item, whatever the list size.',
        { text: 'The target is missing from the list.', why: 'That is the worst case. The loop must look at every item.' },
      ],
      answer: 1,
      explain: 'The best case asks: for this size of list, what is the luckiest input? Here that is 1 look.',
      hints: ['Keep the list size the same. What is the luckiest thing that can happen?'],
    },
    { t: 'h', text: 'What does amortized mean?' },
    { t: 'p', text: '`append` is `O(1)` [[amortized]]. A list saves spare room at its end, so most appends are quick. Now and then the room runs out. Then that one append may have to move every item.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Search item by item', cost: 'O(n) worst', why: 'The best case is `O(1)`, but do not count on it.' },
      { op: '`items.append(x)`', cost: 'O(1) amortized', why: 'Quick nearly every time. Rare slow moves are shared out.' },
      { op: '`items.pop()`', cost: 'O(1)', why: 'Nothing else has to move.' },
      { op: '`items.pop(0)`, `items.insert(0, x)`', cost: 'O(n)', why: 'Every other item must move.' },
      { op: '`key in d`, `d[key]`', cost: 'O(1) average', why: 'Fast on average, but the worst case is `O(n)`.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: '"Stops as soon as it finds one" is a cue. Then best and worst differ, so say which you mean. If a question gives only one Big-O, it usually means the worst case.' },
    { t: 'trap',
      think: 'Code with the smaller number in front always wins.',
      real: 'Only for small n. Growth beats any fixed number in the end, as your race showed. For big n, `100n` beats `n * n`.',
      code: py`
        # n = 10:   100n is 1000
        #           n * n is 100
        # n = 1000: 100n is 100000
        #           n * n is 1000000
      `,
    },
  ],
  recap: [
    'You can drop small parts and numbers in front.',
    'You can name the best and the worst case.',
    'You know append is O(1) amortized.',
  ],
  practice: [
    { id: 'match-drop', type: 'match', level: 1,
      q: 'Match each count to its Big-O.',
      pairs: [
        ['`7`', 'O(1)'],
        ['`5 log n + 2`', 'O(log n)'],
        ['`3n + 5`', 'O(n)'],
        ['`n * n + 100n`', 'O(n^2)'],
      ],
      explain: 'Keep the part that grows fastest, and drop the number in front.',
      hints: ['Which part of each count grows fastest?'],
    },
    { id: 'worst-search', type: 'mcq', level: 1,
      q: 'You search 100 items, one at a time. The target is not there. How many looks do you need?',
      options: [
        { text: '1', why: 'That is the best case. A missing item never stops the search early.' },
        { text: '50', why: 'That is about the average when the item is there. A missing item needs them all.' },
        '100',
      ],
      answer: 2,
      explain: 'To be sure an item is missing, you must look at every item. That is the worst case.',
      hints: ['Can you stop before the end, if the item is not there?'],
    },
    { id: 'find-dups', type: 'predict', level: 2,
      q: 'The list has a repeat. What will the screen show?',
      code: py`
        def find_steps(items, target):
            steps = 0
            for x in items:
                steps = steps + 1
                if x == target:
                    break
            return steps

        print(find_steps([3, 8, 8, 5], 8))
      `,
      options: [
        { text: '3', why: 'You may be looking for the last match. `break` ends the loop at the first one.' },
        '2',
        { text: '4', why: 'You may think the loop always runs to the end. `break` stops it early.' },
      ],
      answer: 1,
      explain: 'The first 8 is at the second spot. The loop stops there, after 2 looks.',
      hints: ['Where is the first 8?'],
    },
    { id: 'who-wins', type: 'mcq', level: 2,
      q: 'Code A takes `1000 * n` steps, and code B takes `n * n` steps. Which sentence is true?',
      options: [
        { text: 'A is always faster, because it is `O(n)`.', why: 'At n = 10, A takes 10000 steps and B takes 100. Growth only wins at big n.' },
        { text: 'B is always faster, because 1000 is a big number.', why: 'At n = 2000, A takes 2 million steps and B takes 4 million. Growth wins in the end.' },
        'B wins for small n, and A wins for big n.',
      ],
      answer: 2,
      explain: 'They tie at n = 1000. Below that B has fewer steps, and above it A does.',
      hints: ['Try n = 10, then try n = 2000.'],
    },
    { id: 'fix-break', type: 'fix', level: 2,
      q: '`find_steps` should stop at the first match. It never stops early, so every search is the worst case. Fix it.',
      code: py`
        def find_steps(items, target):
            steps = 0
            for x in items:
                steps = steps + 1
            return steps
      `,
      answer: py`
        def find_steps(items, target):
            steps = 0
            for x in items:
                steps = steps + 1
                if x == target:
                    break
            return steps
      `,
      tests: [
        { label: 'find_steps([7, 2, 9], 7)', call: 'find_steps([7, 2, 9], 7)', want: '1' },
        { label: 'find_steps([7, 2, 9], 5)', call: 'find_steps([7, 2, 9], 5)', want: '3' },
        { label: 'find_steps([2, 2], 2)', call: 'find_steps([2, 2], 2)', want: '1' },
        { label: 'find_steps([], 2)', call: 'find_steps([], 2)', want: '0' },
      ],
      explain: 'Add 1 first, then check. `break` leaves the loop on the first match.',
      hints: ['Where does the code check for the target?', 'Add an `if` with a `break` after the count goes up.'],
    },
    { id: 'all-same', type: 'write', level: 3,
      q: 'Stretch: write `same_steps(items)`. Compare each later item with `items[0]`, and stop at the first one that differs. Give back the number of compares.',
      starter: py`
        def same_steps(items):
            # Your code here.
            return None
      `,
      answer: py`
        def same_steps(items):
            steps = 0
            for i in range(1, len(items)):
                steps = steps + 1
                if items[i] != items[0]:
                    break
            return steps
      `,
      tests: [
        { label: 'Best case: same_steps([1, 2, 2])', call: 'same_steps([1, 2, 2])', want: '1' },
        { label: 'Worst case: same_steps([5, 5, 5, 5])', call: 'same_steps([5, 5, 5, 5])', want: '3' },
        { label: 'One item: same_steps([5])', call: 'same_steps([5])', want: '0' },
        { label: 'Empty: same_steps([])', call: 'same_steps([])', want: '0' },
      ],
      explain: 'The best case is 1 compare. The worst case is n - 1 compares, which is `O(n)`.',
      hints: ['Use `range(1, len(items))`, so you never compare spot 0 with itself.', 'That range is empty for short lists, so nothing breaks.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 8.5
Course.lesson('m08-big-o', {
  id: '8-5-space',
  num: '8.5',
  title: 'Space: how much memory?',
  goal: 'You can say how much extra memory code needs, and trade memory for steps.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Are steps the only cost?' },
    { t: 'p', text: 'Code also needs room to keep its values. Some code keeps one number. Other code keeps a whole new list.' },
    { t: 'q', id: 'spark-room', type: 'mcq', level: 1,
      q: 'One function adds up a list and keeps a total. Another function builds a new list with each item doubled. Which needs more room as the list grows?',
      options: [
        { text: 'The one that adds up', why: 'A total is one number, even for a huge list.' },
        'The one that builds a new list',
        { text: 'They need the same', why: 'The new list gets longer as the input gets longer. One total does not.' },
      ],
      answer: 1,
      explain: 'A new list needs one more spot for each item. A total stays one value.',
      hints: ['How many values does each function keep at the end?'],
    },
    { t: 'analogy', title: 'Picture this', text: 'Go back to the phone book, and keep notes as you flip. A tally of names takes one line, however thick the book. Copying every name takes a line for each name. Unlike a notepad, Python can reuse that room once no name uses it.' },
    { t: 'words', items: [
      { word: 'memory', means: 'Where the computer keeps values while a program runs.' },
      { word: 'space complexity', means: 'How much extra memory the steps need as the input grows.' },
      { word: 'in place', means: 'Changing the items where they are, with no new list.' },
    ] },
    { t: 'viz', name: 'm08-memory-grow', caption: 'Count the new things as they appear. Then try 0 items and 6 items.' },
    { t: 'big', text: 'Count the new things your code keeps, and see how that count grows.' },
    { t: 'p', text: 'The same names work for [[memory]]. `O(1)` extra means a few names, however long the list. `O(n)` extra means a new item for each input item.' },
    { t: 'q', id: 'count-new', type: 'predict', level: 2,
      q: 'Count the new items by hand. Type what the screen will show.',
      code: py`
        nums = [5, 6, 7, 8]
        new = []
        for x in nums:
            new.append(x * 2)
        print(len(new))
      `,
      answer: '4',
      explain: 'Each of the 4 trips adds one item to new. So new needs 4 spots of extra memory.',
      hints: ['How many times does append run?'],
    },
    { t: 'code', caption: 'A new list for each input item. Then try a list comprehension of your own.',
      code: py`
        def doubled(nums):
            new = []
            for x in nums:
                new.append(x * 2)
            return new

        print(doubled([1, 2, 3]))
        print(len(doubled([1, 2, 3])))
        print(len(doubled([])))
      `,
      output: '[2, 4, 6]\n3\n0',
    },
    { t: 'cost', title: 'How much extra memory?', items: [
      { op: 'A few names, like `total = 0`', cost: 'O(1)', why: 'The count of names stays the same.' },
      { op: '`[x * 2 for x in items]`', cost: 'O(n)', why: 'One new item for each input item.' },
      { op: '`items.copy()`, `items[:]`', cost: 'O(n)', why: 'A whole new list.' },
      { op: '`sorted(items)`', cost: 'O(n)', why: 'A new list, in order. The old list stays.' },
      { op: 'A set of the items seen so far', cost: 'O(n)', why: 'With no repeats, it keeps every item.' },
      { op: 'A grid with n rows and n columns', cost: 'O(n^2)', why: 'That is n times n spots.' },
    ] },
    { t: 'trap',
      think: 'A slice only looks at the list, so it costs nothing.',
      real: 'A slice is a new list. It needs a new spot for each item, and it takes steps to fill them.',
      code: py`
        items = [1, 2, 3, 4]
        part = items[1:]   # 3 new spots
        part[0] = 99
        print(items)       # [1, 2, 3, 4]
      `,
    },
    { t: 'tip', title: 'What do we count?', text: 'We usually count only the extra memory, not the input. Waiting function calls count too, because each call on the [[call stack]] keeps its own names.' },
    { t: 'h', text: 'Can memory buy you speed?' },
    { t: 'p', text: 'Say you want to know if a list has a repeat. You can compare every pair, with no extra memory. Or you can keep a set of what you have seen.' },
    { t: 'viz', name: 'm08-dup-tradeoff', caption: 'Change the list. Try one repeat, no repeats, a short list and an empty one.' },
    { t: 'code', caption: 'Both ways count their steps. Each answer shows True or False, then the steps. Add your own list.',
      code: py`
        def way_pairs(nums):
            n = len(nums)
            steps = 0
            for i in range(n):
                for j in range(i + 1, n):
                    steps = steps + 1
                    if nums[i] == nums[j]:
                        return True, steps
            return False, steps

        def way_set(nums):
            seen = set()
            steps = 0
            for x in nums:
                steps = steps + 1
                if x in seen:
                    return True, steps
                seen.add(x)
            return False, steps

        nums = [3, 8, 1, 6, 4, 9, 2, 7]
        print(way_pairs(nums))
        print(way_set(nums))
      `,
      output: '(False, 28)\n(False, 8)',
    },
    { t: 'table', caption: 'Two ways to find a repeat', head: ['Way', 'Steps (worst)', 'Extra memory'], rows: [
      ['Compare every pair', '`O(n^2)`', '`O(1)`'],
      ['Keep a set', '`O(n)` on average', '`O(n)`'],
    ] },
    { t: 'q', id: 'list-vs-set', type: 'mcq', level: 2,
      q: 'You will check many names against a list of 1000. Should you keep the names in a list or a set?',
      options: [
        { text: 'A list, because a list uses `x in names`.', why: 'A set uses `in` as well. In a list, `in` is a hidden loop that may check all 1000.' },
        'A set, because `in` takes about 1 step on average.',
        { text: 'A list, because a list is always faster.', why: 'A list is quick for a spot number. But to find a value, it may check every item.' },
      ],
      answer: 1,
      explain: 'A set lookup is `O(1)` on average. It costs some memory to build, and many lookups pay that back.',
      hints: ['What does `in` do on a list?'],
    },
    { t: 'tip', title: 'How to spot it', text: 'Cue words are "seen before", "repeat" and "look up many times". They hint at a set or a dict. You spend memory, and you save steps.' },
    { t: 'q', id: 'in-place-order', type: 'order', level: 2,
      q: 'Put the lines in order, to double each number in place with no new list.',
      lines: ['nums = [1, 2, 3]', 'for i in range(len(nums)):', '    nums[i] = nums[i] * 2', 'print(nums)'],
      extra: ['    new.append(nums[i] * 2)'],
      output: '[2, 4, 6]',
      explain: 'Writing to `nums[i]` changes the list itself. That is [[in place]], so it needs only `O(1)` extra memory.',
      hints: ['Which line makes no new list?'],
    },
  ],
  recap: [
    'You can count the new things code keeps.',
    'You know a copy or a slice costs O(n) memory.',
    'You can trade memory for fewer steps.',
  ],
  practice: [
    { id: 'match-memory', type: 'match', level: 1,
      q: 'Match each line to the extra memory it needs.',
      pairs: [
        ['`count = 0`', 'O(1): one name'],
        ['`[0] * n`', 'O(n): one new list'],
        ['`[[0] * n for r in range(n)]`', 'O(n^2): a grid'],
      ],
      explain: 'One name does not grow. A list of n grows with n. A grid of n rows of n grows with n times n.',
      hints: ['How many spots does each line make?'],
    },
    { id: 'total-memory', type: 'mcq', level: 1,
      q: 'This function finds the biggest number with a loop. It keeps one name, `best`. What extra memory does it need?',
      options: [
        { text: '`O(n)`', why: 'You may be counting the input list. We count only the new things, and that is one name.' },
        '`O(1)`',
        { text: '`O(n^2)`', why: 'There is no grid and no new list here.' },
      ],
      answer: 1,
      explain: 'One name stays one name, however long the list gets.',
      hints: ['How many new values does it keep?'],
    },
    { id: 'count-kept', type: 'predict', level: 2,
      q: 'The `if` keeps only some items. Type what the screen will show.',
      code: py`
        nums = [1, 2, 3, 4, 5]
        new = [x for x in nums if x > 3]
        print(len(new))
      `,
      answer: '2',
      explain: 'Only 4 and 5 pass the test. In the worst case every item passes, so it is still `O(n)` extra.',
      hints: ['Which items are bigger than 3?'],
    },
    { id: 'sort-or-sorted', type: 'predict', level: 2,
      q: 'One tool works in place, and one makes a new list. What will the screen show?',
      code: py`
        a = [3, 1, 2]
        b = sorted(a)
        a.sort()
        print(a is b)
        print(a == b)
      `,
      options: [
        { text: 'True\nTrue', why: 'You may think sorted hands back the same list. It makes a new one.' },
        'False\nTrue',
        { text: 'False\nFalse', why: '`==` asks about the items. Both lists now hold 1, 2 and 3.' },
      ],
      answer: 1,
      explain: '`sorted` makes a second list. `a.sort()` changes a in place. They hold the same items, but they are 2 lists.',
      hints: ['`is` asks: same list? `==` asks: same items?'],
    },
    { id: 'fix-in-place', type: 'fix', level: 2,
      q: '`double_all` should change the list in place. Now the list stays the same. Fix the function.',
      code: py`
        def double_all(nums):
            nums = [x * 2 for x in nums]

        a = [1, 2, 3]
        double_all(a)
        print(a)
      `,
      answer: py`
        def double_all(nums):
            for i in range(len(nums)):
                nums[i] = nums[i] * 2

        a = [1, 2, 3]
        double_all(a)
        print(a)
      `,
      wantOutput: '[2, 4, 6]',
      explain: 'The first code moves the tag `nums` to a new list. Writing to `nums[i]` changes the list that a names.',
      hints: ['Does `nums = ...` change the list, or move a tag?', 'Loop over the spots, and write to `nums[i]`.'],
    },
    { id: 'has-repeat', type: 'write', level: 2,
      q: 'Write `has_repeat(nums)`. Keep a set of the numbers you have seen. Give back True if any number comes twice.',
      starter: py`
        def has_repeat(nums):
            # Your code here.
            return None
      `,
      answer: py`
        def has_repeat(nums):
            seen = set()
            for x in nums:
                if x in seen:
                    return True
                seen.add(x)
            return False
      `,
      tests: [
        { label: 'has_repeat([1, 2, 1])', call: 'has_repeat([1, 2, 1])', want: 'True' },
        { label: 'has_repeat([1, 2, 3])', call: 'has_repeat([1, 2, 3])', want: 'False' },
        { label: 'has_repeat([7])', call: 'has_repeat([7])', want: 'False' },
        { label: 'has_repeat([])', call: 'has_repeat([])', want: 'False' },
      ],
      explain: 'This takes `O(n)` steps on average and `O(n)` extra memory. Return False only after the loop ends.',
      hints: ['Start with `seen = set()`.', 'Check `x in seen` before you add x.'],
    },
    { id: 'reverse-in-place', type: 'write', level: 3,
      q: 'Stretch: write `reverse_in_place(items)`. Swap the 2 ends, then move inward. Use `O(1)` extra memory, so make no new list.',
      starter: py`
        def reverse_in_place(items):
            # Your code here.
            pass
      `,
      answer: py`
        def reverse_in_place(items):
            lo = 0
            hi = len(items) - 1
            while lo < hi:
                items[lo], items[hi] = items[hi], items[lo]
                lo = lo + 1
                hi = hi - 1
      `,
      tests: [
        { label: 'An even length: [1, 2, 3, 4]', check: '(lambda a: (reverse_in_place(a), a)[1] == [4, 3, 2, 1])([1, 2, 3, 4])' },
        { label: 'An odd length: [1, 2, 3]', check: '(lambda a: (reverse_in_place(a), a)[1] == [3, 2, 1])([1, 2, 3])' },
        { label: 'One item: [5]', check: '(lambda a: (reverse_in_place(a), a)[1] == [5])([5])' },
        { label: 'Empty: []', check: '(lambda a: (reverse_in_place(a), a)[1] == [])([])' },
      ],
      explain: 'Two names and a swap are `O(1)` extra memory. The loop makes about n / 2 swaps, which is `O(n)` steps.',
      hints: ['Use 2 names: `lo` at the front and `hi` at the back.', 'Swap with `a, b = b, a`, then move both names inward.', 'Stop when lo and hi meet.'],
    },
  ],
});
