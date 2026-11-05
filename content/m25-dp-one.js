/* Module 25: Dynamic Programming I. Part 4 (Advanced). */
Course.module({
  id: 'm25-dp-one',
  num: 25, part: 4, level: 'A',
  title: 'Dynamic Programming I',
  blurb: 'Write down the answers to small questions, and big questions stop being scary.',
  needs: ['m16-recursion', 'm22-greedy'],
});

// ---------------------------------------------------------------- lesson 25.1
Course.lesson('m25-dp-one', {
  id: '25-1-overlapping-subproblems',
  num: '25.1',
  title: 'Overlapping subproblems: Fibonacci again',
  goal: 'You can count how many different smaller questions a recursion really asks.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How many different questions does fib(5) ask?' },
    { t: 'p', text: 'You met `fib` in lesson 16.4. With no notes, `fib(5)` makes 15 calls. How many of those calls are really different?' },
    { t: 'q', id: 'count-asks', type: 'trace', level: 2,
      q: 'Draw the calls of `fib(4)` on paper. Count how many times each question gets asked. Write each question like `fib(2)`.',
      code: py`
        def fib(n):
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)

        fib(4)
      `,
      head: ['question', 'asks'],
      rows: [['fib(4)', '1'], ['fib(3)', '1'], ['fib(2)', '2'], ['fib(1)', '3'], ['fib(0)', '2']],
      given: 2,
      verify: py`
        asks = {}
        def fib(n):
            asks[n] = asks.get(n, 0) + 1
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)
        fib(4)
        for n in [4, 3, 2, 1, 0]:
            print("fib(" + str(n) + ")", asks[n])
      `,
      explain: 'That adds up to 9 calls, as you counted in lesson 16.4. Yet there are only 5 different questions.',
      hints: ['`fib(4)` calls `fib(3)` and `fib(2)`. So `fib(2)` has one ask already.', '`fib(3)` asks for `fib(2)` as well. Keep going down.'],
    },
    { t: 'viz', name: 'm25-fib-collapse', caption: 'Press the arrow to step. Watch the repeats go, one branch at a time. Then try 3 and 4.' },
    { t: 'words', items: [
      { word: 'subproblem', say: 'SUB-prob-lum', means: 'A smaller copy of the big question.' },
      { word: 'overlapping subproblems', say: 'oh-ver-LAP-ing', means: 'Smaller questions that come up again and again on the way to the answer.' },
      { word: 'dynamic programming', say: 'dy-NAM-ik', means: 'Save answers to small parts so you never solve them twice. People call it DP.' },
    ] },
    { t: 'big', text: 'A slow recursion with repeats is really a short row of different questions. [[Dynamic programming]] answers each one once.' },
    { t: 'analogy', title: 'Picture this', text: 'In lesson 16.4, you wrote an answer on a sticky note. Now picture a wall with one note per question. For `fib(5)`, 6 notes replace 15 calls. A real wall lets you write notes in any order. DP does not, and lesson 25.3 shows why.' },
    { t: 'code', caption: 'This code counts each ask. `asks.values()` gives the counts, as lesson 11.3 showed. Look at how few questions there are.',
      code: py`
        asks = {}

        def fib(n):
            asks[n] = asks.get(n, 0) + 1
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)

        fib(10)
        for n in sorted(asks, reverse=True):
            print("fib", n, "asked", asks[n])
        print("calls:", sum(asks.values()))
        print("different:", len(asks))
      `,
      output: 'fib 10 asked 1\nfib 9 asked 1\nfib 8 asked 2\nfib 7 asked 3\nfib 6 asked 5\nfib 5 asked 8\nfib 4 asked 13\nfib 3 asked 21\nfib 2 asked 34\nfib 1 asked 55\nfib 0 asked 34\ncalls: 177\ndifferent: 11',
    },
    { t: 'q', id: 'which-overlap', type: 'mcq', level: 2,
      q: 'Which one asks the same smaller question many times?',
      options: [
        '`fib(n)`, which calls `fib(n - 1)` and `fib(n - 2)`',
        { text: 'Binary search, which keeps one half each time', why: 'It looks at one smaller range and throws the rest away. No range comes up twice.' },
        { text: 'Merge sort, which sorts 2 halves', why: 'Two calls do not mean repeats. The 2 halves hold different items, so they ask different questions.' },
      ],
      answer: 0,
      explain: '`fib(n - 1)` needs `fib(n - 2)` too. So the 2 branches share questions. That sharing is the overlap.',
      hints: ['Two calls are not enough. Do the two calls ask about the same things?'],
    },
    { t: 'h', text: 'Do all recursions repeat themselves?' },
    { t: 'p', text: 'No. `fact(6)` asks about each smaller number once. No question comes twice, so a note would never get read.' },
    { t: 'code', caption: 'Every count is 1. There is nothing here for DP to save.',
      code: py`
        asks = {}

        def fact(n):
            asks[n] = asks.get(n, 0) + 1
            if n <= 1:
                return 1
            return n * fact(n - 1)

        fact(6)
        print(asks)
      `,
      output: '{6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1}',
    },
    { t: 'h', text: 'Do the coins from lesson 22.1 repeat too?' },
    { t: 'p', text: 'Yes. Trying every mix asks about the same amounts again and again. Here it pays 6 with coins 1, 3 and 4.' },
    { t: 'code', caption: 'This walks every mix and counts each amount it asks about. Amount 0 gets asked 9 times.',
      code: py`
        asks = {}

        def tries(amount):
            asks[amount] = asks.get(amount, 0) + 1
            for coin in [1, 3, 4]:
                if coin <= amount:
                    tries(amount - coin)

        tries(6)
        print(asks)
        print("calls:", sum(asks.values()))
        print("different:", len(asks))
      `,
      output: '{6: 1, 5: 1, 4: 1, 3: 2, 2: 4, 1: 6, 0: 9}\ncalls: 24\ndifferent: 7',
    },
    { t: 'q', id: 'coin-questions', type: 'predict', level: 2,
      q: 'The same code now pays 8. How many different amounts does it ask about?',
      code: py`
        asks = {}

        def tries(amount):
            asks[amount] = asks.get(amount, 0) + 1
            for coin in [1, 3, 4]:
                if coin <= amount:
                    tries(amount - coin)

        tries(8)
        print(len(asks))
      `,
      options: [
        '9',
        { text: '8', why: 'You may have counted 1 to 8. Amount 0 is a question too, because every finished mix lands there.' },
        { text: '64', why: 'That counts every call. This code asks for the different keys in the dict, and repeats share one key.' },
      ],
      answer: 0,
      explain: 'The amounts are 8, 7, 6, 5, 4, 3, 2, 1 and 0. That is 9 questions, however many calls ask them.',
      hints: ['What are all the amounts it could ever land on?', 'Remember to count 0.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Calls of `fib(n)` with no notes', cost: 'O(2^n)', why: 'Lesson 16.4 wrote it this way. The real count grows about 1.6 times per step: 15 for 5, 177 for 10.' },
      { op: 'Different questions in `fib(n)`', cost: 'O(n)', why: 'You counted them: 5 for `fib(4)`, 11 for `fib(10)`. That is n + 1.' },
    ] },
    { t: 'trap',
      think: 'Any recursion is dynamic programming.',
      real: 'DP only helps when questions repeat. `fact` asks each one once, so notes would only use up memory.',
    },
    { t: 'tip', title: 'How to recognize it', text: 'Look for these words: **number of ways**, **fewest**, **most**, **longest**. Then draw the calls for a tiny input. Repeats mean DP can help. No repeats mean it cannot.' },
  ],
  recap: [
    'You can count how often each question gets asked.',
    'You can say what overlapping subproblems are.',
    'You can spot a recursion with no repeats.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[subproblem]]', 'A smaller copy of the big question'],
        ['[[overlapping subproblems]]', 'Small questions that come up again and again'],
        ['[[dynamic programming]]', 'Save small answers so you never solve them twice'],
      ],
      explain: 'A subproblem is one small question. Overlap means it repeats. DP is what you do about that.',
      hints: ['Which one is about repeats?'],
    },
    { id: 'why-no-help', type: 'mcq', level: 1,
      q: 'Why would notes not speed up `fact(6)`?',
      options: [
        'Each question is asked only once',
        { text: 'It has no base case', why: 'It has one: `n <= 1`. The trouble is that nothing repeats, so no note gets read.' },
        { text: 'The numbers get too big', why: 'Python handles big whole numbers well. The count of asks is what matters here.' },
      ],
      answer: 0,
      explain: 'A note saves work only when someone reads it a second time. Here, nobody does.',
      hints: ['Look at the printed counts for `fact`.'],
    },
    { id: 'predict-asks', type: 'predict', level: 2,
      q: 'Draw the calls, or use the pattern. Type what the screen will show.',
      code: py`
        asks = {}

        def fib(n):
            asks[n] = asks.get(n, 0) + 1
            if n <= 1:
                return n
            return fib(n - 1) + fib(n - 2)

        fib(6)
        print(asks[3], len(asks))
      `,
      answer: '3 7',
      why: '`fib(3)` is asked by `fib(5)` once and by `fib(4)` twice. The different questions are 0 up to 6.',
      explain: '`fib(6)` asks `fib(3)` 3 times. There are 7 different questions in all.',
      hints: ['`fib(4)` is asked 2 times. Each of those asks `fib(3)` once.', 'Do not forget `fib(5)`. It asks `fib(3)` as well.', 'For the second number, count 0 to 6.'],
    },
    { id: 'which-repeats', type: 'mcq', level: 2,
      q: 'Which job asks the same smaller question many times, if you solve it by recursion?',
      options: [
        'Count the ways to pay 20 with coins 1, 3 and 4',
        { text: 'Add up the items of a list, one at a time', why: 'Each call looks at a shorter list than the last, and no list comes up twice.' },
        { text: 'Find the biggest item in a list', why: 'One walk along the list is enough. Nothing gets asked twice.' },
      ],
      answer: 0,
      explain: 'Many mixes land on the same amount. So the same amount gets asked again and again.',
      hints: ['Do different paths land on the same smaller question?'],
    },
    { id: 'fix-count', type: 'fix', level: 2,
      q: '`tally(n, asks)` should count how often each question comes up. Every count comes out as 1. Fix it.',
      code: py`
        def tally(n, asks):
            asks[n] = 1
            if n > 1:
                tally(n - 1, asks)
                tally(n - 2, asks)
            return asks
      `,
      answer: py`
        def tally(n, asks):
            asks[n] = asks.get(n, 0) + 1
            if n > 1:
                tally(n - 1, asks)
                tally(n - 2, asks)
            return asks
      `,
      tests: [
        { label: 'tally(4, {})', call: 'tally(4, {})', want: '{4: 1, 3: 1, 2: 2, 1: 3, 0: 2}' },
        { label: 'tally(1, {})', call: 'tally(1, {})', want: '{1: 1}' },
        { label: 'tally(6, {}) asks fib(1) 8 times', call: 'tally(6, {})[1]', want: '8' },
      ],
      explain: '`asks[n] = 1` throws away the old count. `asks.get(n, 0) + 1` adds to it, and starts at 0 for a new key.',
      hints: ['What happens to the old count on line 2?', 'Lesson 6.3 counted with `get`.'],
    },
    { id: 'write-distinct', type: 'write', level: 2,
      q: 'Write `questions(amount, coins)`. It tries every mix of the coins in the list `coins`. It gives back how many different amounts get asked about.',
      starter: py`
        def questions(amount, coins):
            # Your code here.
            return None
      `,
      answer: py`
        asks = {}

        def walk(amount, coins):
            asks[amount] = True
            for coin in coins:
                if coin <= amount:
                    walk(amount - coin, coins)

        def questions(amount, coins):
            asks.clear()
            walk(amount, coins)
            return len(asks)
      `,
      tests: [
        { label: 'Amount 0 is one question', call: 'questions(0, [1, 2])', want: '1' },
        { label: 'Coins 1 and 2 land on every amount', call: 'questions(5, [1, 2])', want: '6' },
        { label: 'Only 2s skip some amounts', call: 'questions(5, [2])', want: '3' },
        { label: 'Coins 5 and 7 land on few amounts', call: 'questions(12, [5, 7])', want: '5' },
        { label: 'A coin too big never fits', call: 'questions(3, [9])', want: '1' },
      ],
      explain: 'A dict or a set keeps one key per amount. Clear it first, so an old test does not change the count.',
      hints: ['Write a helper that walks every mix and marks each amount.', 'The answer is the number of marks.', 'Use `asks.clear()` at the start of `questions`.'],
    },
    { id: 'write-wasted', type: 'write', level: 3,
      q: 'Stretch: write `wasted(n)`. Run `fib(n)` with no notes. Give back the calls minus the different questions. These are the calls that redo old work.',
      starter: py`
        def wasted(n):
            # Your code here.
            return None
      `,
      answer: py`
        def tally(n, asks):
            asks[n] = asks.get(n, 0) + 1
            if n > 1:
                tally(n - 1, asks)
                tally(n - 2, asks)
            return asks

        def wasted(n):
            asks = tally(n, {})
            return sum(asks.values()) - len(asks)
      `,
      tests: [
        { label: 'wasted(0)', call: 'wasted(0)', want: '0' },
        { label: 'wasted(2)', call: 'wasted(2)', want: '0' },
        { label: 'wasted(3)', call: 'wasted(3)', want: '1' },
        { label: 'wasted(5)', call: 'wasted(5)', want: '9' },
        { label: 'wasted(20)', call: 'wasted(20)', want: '21870' },
      ],
      explain: '`fib(20)` makes 21891 calls for 21 questions. So 21870 calls redo old work.',
      hints: ['Count asks in a dict, as `tally` does.', 'The sum of the counts is the number of calls.', 'The number of keys is the number of different questions.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 25.2
Course.lesson('m25-dp-one', {
  id: '25-2-top-down',
  num: '25.2',
  title: 'Top-down: start big, write notes',
  goal: 'You can add notes to a slow recursion, with a key that holds all that changes.',
  mins: 13,
  steps: [
    { t: 'h', text: 'How many ways are there up the stairs?' },
    { t: 'p', text: 'You climb some stairs. Each hop goes up 1 stair or 2 stairs. How many different ways reach the top?' },
    { t: 'q', id: 'stairs-three', type: 'mcq', level: 1,
      q: 'Count by hand. How many ways are there up 3 stairs?',
      options: [
        { text: '2', why: 'You may have counted 1 + 2 and 2 + 1 as one way. They hop in a different order, so they are 2 ways.' },
        '3',
        { text: '4', why: 'You may have added 2 + 2. That goes past stair 3, so it does not count.' },
      ],
      answer: 1,
      explain: 'The ways are 1 + 1 + 1, 1 + 2 and 2 + 1.',
      hints: ['Write the hops as sums that make 3.', 'Does the order of hops matter here? Yes.'],
    },
    { t: 'p', text: 'Think about your last hop. To stand on stair 5, you came from stair 4 or stair 3. So the ways to 5 are the ways to 4, plus the ways to 3.' },
    { t: 'code', caption: 'This has the same shape as `fib`. Only the base case differs.',
      code: py`
        def stairs(n):
            if n <= 1:
                return 1
            return stairs(n - 1) + stairs(n - 2)

        print([stairs(n) for n in range(7)])
      `,
      output: '[1, 1, 2, 3, 5, 8, 13]',
    },
    { t: 'tip', title: 'Why is stairs(0) equal to 1?', text: 'There is one way to stand on the floor: make no hops. `stairs(2)` needs this. Its 2 ways are through stair 1, or straight from the floor.' },
    { t: 'words', items: [
      { word: 'top-down', means: 'Start at the big question, and let it ask smaller ones. Write notes as answers come back.' },
    ] },
    { t: 'p', text: '[[Top-down]] DP is the note trick from lesson 16.4: make the notes, look first, write it down. Here is what those moves do on the stairs.' },
    { t: 'viz', name: 'm25-stairs-memo', caption: 'Watch which note comes first. Then try 0, 1 and 6.' },
    { t: 'q', id: 'first-note', type: 'mcq', level: 2,
      q: 'You call `stairs(5)`. Which note gets written first?',
      options: [
        '`notes[2]`',
        { text: '`notes[5]`', why: '`stairs(5)` starts first, but it finishes last. It must wait for its smaller calls.' },
        { text: '`notes[1]`', why: '`stairs(1)` is a base case. It returns before it reaches any note.' },
      ],
      answer: 0,
      explain: 'The calls go all the way down first. So the smallest real note gets written first, and the top note comes last.',
      hints: ['Which call that is not a base case finishes first?'],
    },
    { t: 'q', id: 'count-calls', type: 'predict', level: 2,
      q: 'Count the calls by hand. What will the screen show?',
      code: py`
        count = {"calls": 0}
        notes = {}

        def stairs(n):
            count["calls"] = count["calls"] + 1
            if n <= 1:
                return 1
            if n in notes:
                return notes[n]
            answer = stairs(n - 1) + stairs(n - 2)
            notes[n] = answer
            return answer

        stairs(4)
        print(count["calls"])
      `,
      options: [
        { text: '4', why: 'That counts one call per stair. But some calls only read a note, and they still count.' },
        '7',
        { text: '9', why: 'That is the count with no notes. Here the second `stairs(2)` reads a note and stops.' },
      ],
      answer: 1,
      explain: 'The calls have `n` as 4, 3, 2, 1, 0, 1 and 2. The last one reads a note.',
      hints: ['Write the calls in the order they happen.', 'The second `stairs(2)` makes no more calls.'],
    },
    { t: 'code', caption: 'Each row shows `n`, the answer, then the calls. Each new stair adds 2 calls.',
      code: py`
        count = {"calls": 0}
        notes = {}

        def stairs(n):
            count["calls"] = count["calls"] + 1
            if n <= 1:
                return 1
            if n in notes:
                return notes[n]
            answer = stairs(n - 1) + stairs(n - 2)
            notes[n] = answer
            return answer

        for n in [5, 10, 20, 40]:
            count["calls"] = 0
            notes.clear()
            print(n, stairs(n), count["calls"])
      `,
      output: '5 8 9\n10 89 19\n20 10946 39\n40 165580141 79',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`stairs(n)` with notes', cost: 'O(n)', why: 'You counted 7 calls for 4, and the code showed 79 for 40. That is 2n - 1.' },
      { op: 'Read or write a note', cost: 'O(1) average', why: 'A dict goes straight to the key.' },
      { op: 'Memory', cost: 'O(n)', why: 'One note per stair, and up to n calls waiting on the pile.' },
    ] },

    { t: 'h', text: 'What if the question has 2 parts?' },
    { t: 'p', text: 'Now the biggest hop can change. `ways(n, big)` counts the ways up `n` stairs, with hops from 1 to `big`. The answer depends on both numbers, so the key must hold both.' },
    { t: 'code', caption: '`@cache` makes the key from all the arguments. Depth 80 is safe here.',
      code: py`
        from functools import cache

        @cache
        def ways(n, big):
            if n == 0:
                return 1
            total = 0
            for hop in range(1, big + 1):
                if hop <= n:
                    total = total + ways(n - hop, big)
            return total

        print(ways(5, 2), ways(5, 3), ways(80, 2))
      `,
      output: '8 13 37889062373143906',
    },
    { t: 'trap',
      think: 'The key can be `n` alone, even when `big` changes.',
      real: 'Then the notes for `big` 2 get read for `big` 3. Python gives no error, only a wrong answer. With a dict, write `notes[(n, big)]`. A tuple can be a key, as lesson 6.3 showed.',
      code: py`
        notes[n] = total          # wrong: forgets big
        notes[(n, big)] = total   # right: holds both
      `,
    },
    { t: 'h', text: 'What can still go wrong?' },
    { t: 'p', text: 'Top-down still makes a pile of calls, one for each stair on the way down. Lesson 16.2 showed the pile has a limit. Notes do not shrink it.' },
    { t: 'code', caption: 'A first call this deep stops with a `RecursionError`. Lesson 25.3 climbs this high with no pile at all.',
      code: py`
        notes = {}

        def stairs(n):
            if n <= 1:
                return 1
            if n in notes:
                return notes[n]
            answer = stairs(n - 1) + stairs(n - 2)
            notes[n] = answer
            return answer

        try:
            print(stairs(2000))
        except RecursionError:
            print("The pile of calls got too tall.")
      `,
      output: 'The pile of calls got too tall.',
    },
    { t: 'tip', title: 'Keep @cache shallow', text: 'Lesson 16.4 warned about this. On this page, `@cache` can make Python start again when calls go deep. Keep `@cache` under about 300 deep. For deeper climbs, use a table.' },
    { t: 'q', id: 'fill-key', type: 'fill', level: 2,
      q: 'Fill the gaps, so `ways` looks first, and saves each answer under both numbers.',
      code: py`
        notes = {}

        def ways(n, big):
            if n == 0:
                return 1
            if (n, big) in notes:
                return ____
            total = 0
            for hop in range(1, big + 1):
                if hop <= n:
                    total = total + ways(n - hop, big)
            ____ = total
            return total

        print(ways(5, 2), ways(5, 3))
      `,
      blanks: [['notes[(n, big)]', 'notes[n, big]'], ['notes[(n, big)]', 'notes[n, big]']],
      output: '8 13',
      explain: 'Both gaps use the same key: the tuple `(n, big)`. So each pair of numbers gets its own note.',
      hints: ['Line 6 checks for the key `(n, big)`.', 'Read and write with that same key.'],
    },
    { t: 'tip', title: 'How to recognize it', text: 'Do you already have a slow recursion with repeats? Top-down is the fastest fix. Ask what changes between calls. That is your key.' },
  ],
  recap: [
    'You can turn a slow recursion into top-down DP.',
    'You can pick a key that holds all that changes.',
    'You can say why deep top-down calls can fail.',
  ],
  practice: [
    { id: 'what-top-down', type: 'mcq', level: 1,
      q: 'What makes DP top-down?',
      options: [
        'It starts at the big question, and small answers come back as notes',
        { text: 'It starts at the smallest question and uses a loop', why: 'That is the other style, in lesson 25.3. Top-down starts with the big call.' },
        { text: 'It tries each choice once and never goes back', why: 'That is greedy, from lesson 22.1. It never looks at the other choices.' },
      ],
      answer: 0,
      explain: 'Top-down calls down from the big question. Notes get written on the way back up.',
      hints: ['Which call starts first?'],
    },
    { id: 'predict-notes', type: 'predict', level: 1,
      q: 'What will the screen show? Type it.',
      code: py`
        notes = {}

        def stairs(n):
            if n <= 1:
                return 1
            if n in notes:
                return notes[n]
            answer = stairs(n - 1) + stairs(n - 2)
            notes[n] = answer
            return answer

        stairs(4)
        print(notes)
      `,
      answer: '{2: 2, 3: 3, 4: 5}',
      why: 'The smallest note gets written first. A dict keeps the order of its keys, so 2 comes first.',
      explain: 'Stair 2 finishes first, then 3, then 4. Stairs 0 and 1 are base cases, so they get no notes.',
      hints: ['Do base cases write a note?', 'Which call finishes its work first?'],
    },
    { id: 'order-memo', type: 'order', level: 2,
      q: 'Put the lines in order. The program should print the ways up 6 stairs, with notes.',
      lines: [
        'notes = {}',
        'def stairs(n):',
        '    if n <= 1:',
        '        return 1',
        '    if n in notes:',
        '        return notes[n]',
        '    notes[n] = stairs(n - 1) + stairs(n - 2)',
        '    return notes[n]',
        'print(stairs(6))',
      ],
      extra: ['    notes = {}'],
      output: '13',
      explain: 'The dict sits outside, so every call shares it. Inside, a call makes a new empty dict each time.',
      hints: ['What must exist before the function runs?', 'Base case first, then look at the notes.'],
    },
    { id: 'fix-forgot', type: 'fix', level: 2,
      q: 'The answers are right, but `stairs(20)` makes 21891 calls. It looks in its notes but something is missing. Fix it, so it makes under 100 calls.',
      code: py`
        count = {"calls": 0}
        notes = {}

        def stairs(n):
            count["calls"] = count["calls"] + 1
            if n <= 1:
                return 1
            if n in notes:
                return notes[n]
            answer = stairs(n - 1) + stairs(n - 2)
            return answer
      `,
      answer: py`
        count = {"calls": 0}
        notes = {}

        def stairs(n):
            count["calls"] = count["calls"] + 1
            if n <= 1:
                return 1
            if n in notes:
                return notes[n]
            answer = stairs(n - 1) + stairs(n - 2)
            notes[n] = answer
            return answer
      `,
      tests: [
        { label: 'stairs(5) gives 8', call: 'stairs(5)', want: '8' },
        { label: 'stairs(20) gives 10946', call: 'stairs(20)', want: '10946' },
        { label: 'stairs(20) makes under 100 calls', check: '(count.update(calls=0), notes.clear(), stairs(20), count["calls"])[3] < 100' },
      ],
      explain: 'A note nobody writes can never be read. Write it before you return.',
      hints: ['Which of the 3 moves from lesson 16.4 is missing?', 'Add `notes[n] = answer`.'],
    },
    { id: 'fix-key', type: 'fix', level: 2,
      q: '`ways(5, 2)` should give 8, and `ways(5, 3)` should give 13. After the first call, the second gives 8 too. Fix the key.',
      code: py`
        notes = {}

        def ways(n, big):
            if n == 0:
                return 1
            if n in notes:
                return notes[n]
            total = 0
            for hop in range(1, big + 1):
                if hop <= n:
                    total = total + ways(n - hop, big)
            notes[n] = total
            return total
      `,
      answer: py`
        notes = {}

        def ways(n, big):
            if n == 0:
                return 1
            if (n, big) in notes:
                return notes[(n, big)]
            total = 0
            for hop in range(1, big + 1):
                if hop <= n:
                    total = total + ways(n - hop, big)
            notes[(n, big)] = total
            return total
      `,
      tests: [
        { label: 'Both answers in a row', check: 'ways(5, 2) == 8 and ways(5, 3) == 13' },
        { label: 'The other order', check: 'ways(6, 3) == 24 and ways(6, 2) == 13' },
        { label: 'No stairs', call: 'ways(0, 2)', want: '1' },
      ],
      explain: 'The answer depends on `n` and `big`. So a note under `n` alone gets read for the wrong `big`.',
      hints: ['What else can change the answer, besides `n`?', 'Use the tuple `(n, big)` as the key, in all 3 places.'],
    },
    { id: 'write-hops', type: 'write', level: 2,
      q: 'Write `hops3(n)`: the ways up `n` stairs with hops of 1, 2 or 3. Use notes, so `hops3(30)` is quick.',
      starter: py`
        def hops3(n):
            # Your code here.
            return None
      `,
      answer: py`
        notes = {}

        def hops3(n):
            if n < 0:
                return 0
            if n == 0:
                return 1
            if n in notes:
                return notes[n]
            notes[n] = hops3(n - 1) + hops3(n - 2) + hops3(n - 3)
            return notes[n]
      `,
      tests: [
        { label: 'hops3(0) gives 1', call: 'hops3(0)', want: '1' },
        { label: 'hops3(1) gives 1', call: 'hops3(1)', want: '1' },
        { label: 'hops3(2) gives 2', call: 'hops3(2)', want: '2' },
        { label: 'hops3(3) gives 4', call: 'hops3(3)', want: '4' },
        { label: 'hops3(30) gives 53798080', call: 'hops3(30)', want: '53798080' },
      ],
      explain: 'The last hop came from 1, 2 or 3 stairs down. Below the floor, there are 0 ways.',
      hints: ['What are the ways to stand below the floor?', 'Make `notes = {}` above the `def` line.', 'Add `hops3(n - 1)`, `hops3(n - 2)` and `hops3(n - 3)`.'],
    },
    { id: 'write-score', type: 'write', level: 3,
      q: 'Stretch: in a game, a move scores one of the numbers in the tuple `shots`. Write `score_ways(total, shots)`. Count the move orders that reach exactly `total`. Use `@cache`.',
      starter: py`
        from functools import cache

        def score_ways(total, shots):
            # Your code here.
            return None
      `,
      answer: py`
        from functools import cache

        @cache
        def score_ways(total, shots):
            if total == 0:
                return 1
            count = 0
            for s in shots:
                if s <= total:
                    count = count + score_ways(total - s, shots)
            return count
      `,
      tests: [
        { label: 'Total 0', call: 'score_ways(0, (2, 3))', want: '1' },
        { label: 'Total 1 cannot be reached', call: 'score_ways(1, (2, 3))', want: '0' },
        { label: 'Total 7 with 2 and 3', call: 'score_ways(7, (2, 3))', want: '3' },
        { label: 'Other shots, same total', call: 'score_ways(7, (1, 7))', want: '2' },
        { label: 'Total 60 is quick', call: 'score_ways(60, (1, 2, 5))', want: '49203950608909' },
      ],
      explain: 'The last move scored one of the shots. A tuple can be part of the key, and a list cannot.',
      hints: ['What is the base case? How many ways reach a total of 0?', 'Loop over `shots`. Skip any shot bigger than `total`.', 'Without `@cache`, the last test takes far too long.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 25.3
Course.lesson('m25-dp-one', {
  id: '25-3-bottom-up-table',
  num: '25.3',
  title: 'Bottom-up: fill a table',
  goal: 'You can fill a table from the smallest cell up, and write it with a loop.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Why not start with the small notes?' },
    { t: 'p', text: 'In lesson 25.2, `stairs(5)` walks all the way down first. The first note it writes is for stair 2. So why not begin there, and skip the walk down?' },
    { t: 'words', items: [
      { word: 'bottom-up', means: 'Start with the smallest questions, and build up to the big one.' },
      { word: 'table', means: 'A list that keeps one answer for each small question.' },
      { word: 'cell', means: 'One spot in a table.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Go back to the wall of sticky notes. Write note 0, then note 1, then note 2. Each new note reads notes you already wrote. Here the picture stops being true. A real wall lets you write in any order. A table cell can only read cells that are full.' },
    { t: 'viz', name: 'm25-stairs-table', caption: 'Say each cell out loud before you press the arrow. Then try 0, 1 and 8.' },
    { t: 'code', caption: 'A loop fills the [[table]]. No call waits on a pile, so 2000 stairs is fine. That answer has 418 digits.',
      code: py`
        def stairs(n):
            if n <= 1:
                return 1
            ways = [0] * (n + 1)
            ways[0] = 1
            ways[1] = 1
            for i in range(2, n + 1):
                ways[i] = ways[i - 1] + ways[i - 2]
            return ways[n]

        print(stairs(6))
        print(stairs(0), stairs(1))
        print(len(str(stairs(2000))))
      `,
      output: '13\n1 1\n418',
    },
    { t: 'q', id: 'next-cell', type: 'predict', level: 2,
      q: 'Now each hop is 1 stair or 3 stairs. Each cell reads the cell 1 back and the cell 3 back. What will the screen show?',
      code: py`
        ways = [1, 1, 1, 0, 0, 0]
        for i in range(3, 6):
            ways[i] = ways[i - 1] + ways[i - 3]
        print(ways)
      `,
      options: [
        '[1, 1, 1, 2, 3, 4]',
        { text: '[1, 1, 1, 2, 3, 5]', why: 'That is the old habit of adding the 2 cells before. Cell 5 reads cell 4 and cell 2, so 3 + 1.' },
        { text: '[1, 1, 1, 3, 5, 9]', why: 'That adds all 3 cells before. This rule reads only cell `i - 1` and cell `i - 3`.' },
      ],
      answer: 0,
      explain: 'Cell 3 is 1 + 1. Cell 4 is 2 + 1. Cell 5 is 3 + 1.',
      hints: ['Do cell 3 first. It reads cell 2 and cell 0.', 'Use each new cell for the next one.'],
    },
    { t: 'q', id: 'count-loop', type: 'mcq', level: 1,
      q: 'Count by hand. How many cells does the loop fill for `stairs(6)`?',
      options: [
        { text: '7', why: 'The list has 7 cells, but the base cases fill 2 before the loop.' },
        '5',
        { text: '13', why: 'That is the answer in the last cell, not the number of cells filled.' },
      ],
      answer: 1,
      explain: 'The loop fills cells 2, 3, 4, 5 and 6. So `stairs(n)` takes n - 1 trips.',
      hints: ['Read `range(2, n + 1)` with `n` as 6.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Bottom-up `stairs(n)`', cost: 'O(n)', why: 'You counted 5 trips for 6. That is n - 1 trips, each with 2 reads and 1 write.' },
      { op: 'Memory', cost: 'O(n)', why: 'The table has n + 1 cells. No calls wait on a pile.' },
    ] },
    { t: 'trap',
      think: 'I can always write `ways[1] = 1`.',
      real: 'With `n` as 0, the list has only 1 cell. So `ways[1]` gives an IndexError. Lines 2 and 3 of `stairs` deal with small `n` first.',
      code: py`
        ways = [0] * (0 + 1)   # only cell 0
        ways[1] = 1            # IndexError
      `,
    },

    { t: 'h', text: 'What if each step has a choice?' },
    { t: 'p', text: 'Houses in a row give out sweets on a festival day. Neighbours talk, so you may not visit 2 houses side by side. Books call this the house robber problem, but we like sweets better.' },
    { t: 'q', id: 'three-houses', type: 'mcq', level: 1,
      q: 'Three houses give 3, 6 and 4 sweets. What is the most you can get?',
      options: [
        { text: '6', why: 'That grabs the biggest first, which is the greedy rule. It blocks both neighbours, and 3 + 4 beats it.' },
        '7',
        { text: '13', why: 'That visits all 3, but the houses are side by side. You may not take neighbours.' },
      ],
      answer: 1,
      explain: 'The first and last houses are not neighbours. So 3 + 4 gives 7.',
      hints: ['Which pairs of houses are not side by side?'],
    },
    { t: 'p', text: 'Look at house `i`. You can skip it, and keep the best so far. Or you can take it, and add its sweets to the best from 2 houses back.' },
    { t: 'viz', name: 'm25-sweets-table', caption: 'Guess each cell. Then try 5 1 1 5. Try one house, and no houses at all.' },
    { t: 'code', caption: 'Lines 3 to 6 deal with tiny streets first. Then the loop makes the same choice at every house.',
      code: py`
        def most_sweets(houses):
            n = len(houses)
            if n == 0:
                return 0
            if n == 1:
                return houses[0]
            best = [0] * n
            best[0] = houses[0]
            best[1] = max(houses[0], houses[1])
            for i in range(2, n):
                skip = best[i - 1]
                take = best[i - 2] + houses[i]
                best[i] = max(skip, take)
            return best[n - 1]

        print(most_sweets([3, 6, 4, 2, 5]))
        print(most_sweets([5, 1, 1, 5]))
        print(most_sweets([4]), most_sweets([]))
      `,
      output: '12\n10\n4 0',
    },
    { t: 'q', id: 'fill-sweets', type: 'fill', level: 2,
      q: 'Fill the gaps. `take` adds this house to the best from 2 houses back. Then keep the bigger choice.',
      code: py`
        houses = [4, 1, 3, 8]
        best = [4, 4, 0, 0]
        for i in range(2, 4):
            skip = best[i - 1]
            take = best[____] + houses[i]
            best[i] = ____(skip, take)
        print(best)
      `,
      blanks: ['i - 2', 'max'],
      output: '[4, 4, 7, 12]',
      explain: 'House `i - 1` is a neighbour, so taking house `i` must skip it. `max` keeps the bigger of the 2 choices.',
      hints: ['Which cell is safe to add to? Not the neighbour.', 'Do you want the bigger or the smaller?'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`most_sweets`', cost: 'O(n)', why: 'One trip per house. Each trip reads 2 cells and writes 1.' },
      { op: 'Memory', cost: 'O(n)', why: 'One cell per house.' },
    ] },
    { t: 'table', caption: 'Same answers, 2 ways of working', head: ['', 'Top-down', 'Bottom-up'], rows: [
      ['Starts at', 'the big question', 'the smallest cell'],
      ['Tool', 'recursion and a dict', 'a loop and a list'],
      ['Pile of calls', 'grows with n', 'none'],
      ['Who picks the order', 'Python, by calling', 'you, in the loop'],
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **number of ways** or **most you can get**, with a choice at each step. Words like **no two side by side** mean a choice now changes later choices. A table keeps every option alive.' },
  ],
  recap: [
    'You can fill a table one cell at a time.',
    'You can write bottom-up DP with a loop and a list.',
    'You can handle tiny inputs before the table starts.',
  ],
  practice: [
    { id: 'which-no-pile', type: 'mcq', level: 1,
      q: 'You need `stairs(5000)`. Which style is safe on this page?',
      options: [
        'Bottom-up, with a loop and a list',
        { text: 'Top-down, with a dict', why: 'Notes do not shrink the pile. A first call this deep stops with a RecursionError.' },
        { text: 'Top-down, with `@cache`', why: 'This goes deep too, and `@cache` runs out of room sooner. It can make Python start again.' },
      ],
      answer: 0,
      explain: 'A loop makes no pile of calls. So depth is never a problem.',
      hints: ['Which style has no calls waiting?'],
    },
    { id: 'trace-best', type: 'trace', level: 2,
      q: 'Fill the table for houses 2, 4, 3 and 5.',
      code: py`
        houses = [2, 4, 3, 5]
        best = [0] * 4
        best[0] = houses[0]
        best[1] = max(houses[0], houses[1])
        for i in range(2, 4):
            best[i] = max(best[i - 1], best[i - 2] + houses[i])
      `,
      head: ['i', 'house', 'best'],
      rows: [['0', '2', '2'], ['1', '4', '4'], ['2', '3', '5'], ['3', '5', '9']],
      given: 2,
      verify: py`
        houses = [2, 4, 3, 5]
        best = [0] * 4
        best[0] = houses[0]
        best[1] = max(houses[0], houses[1])
        for i in range(2, 4):
            best[i] = max(best[i - 1], best[i - 2] + houses[i])
        for i in range(4):
            print(i, houses[i], best[i])
      `,
      explain: 'Cell 2 takes 2 + 3, which beats 4. Cell 3 takes 4 + 5, which beats 5.',
      hints: ['Cell 2: skip gives 4. Take gives 2 + 3.', 'Cell 3: skip gives 5. Take gives 4 + 5.'],
    },
    { id: 'broken-stair', type: 'predict', level: 2,
      q: 'Stair 3 is broken, so no hop can land there. Line 5 sets its cell back to 0. Type what the screen will show.',
      code: py`
        ways = [1, 1, 0, 0, 0, 0]
        for i in range(2, 6):
            ways[i] = ways[i - 1] + ways[i - 2]
            if i == 3:
                ways[i] = 0
        print(ways)
      `,
      answer: '[1, 1, 2, 0, 2, 2]',
      why: 'Cell 3 is 0. So cell 4 is 0 + 2, and cell 5 is 2 + 0.',
      explain: 'A 0 means no path lands there. The cells after it read that 0, so paths through it do not count.',
      hints: ['Fill cell 2 first, then force cell 3 to 0.', 'Cell 4 reads cell 3 and cell 2.'],
    },
    { id: 'fix-small', type: 'fix', level: 2,
      q: '`stairs(0)` gives an IndexError. Python got confused on the `ways[1]` line. Fix it, and keep the table.',
      code: py`
        def stairs(n):
            ways = [0] * (n + 1)
            ways[0] = 1
            ways[1] = 1
            for i in range(2, n + 1):
                ways[i] = ways[i - 1] + ways[i - 2]
            return ways[n]
      `,
      answer: py`
        def stairs(n):
            if n <= 1:
                return 1
            ways = [0] * (n + 1)
            ways[0] = 1
            ways[1] = 1
            for i in range(2, n + 1):
                ways[i] = ways[i - 1] + ways[i - 2]
            return ways[n]
      `,
      tests: [
        { label: 'stairs(0) gives 1', call: 'stairs(0)', want: '1' },
        { label: 'stairs(1) gives 1', call: 'stairs(1)', want: '1' },
        { label: 'stairs(2) gives 2', call: 'stairs(2)', want: '2' },
        { label: 'stairs(6) gives 13', call: 'stairs(6)', want: '13' },
      ],
      explain: 'With `n` as 0, the list has 1 cell, so cell 1 does not exist. Deal with tiny `n` before you touch the table.',
      hints: ['How many cells does the list have when `n` is 0?', 'Add a check at the top that returns 1.'],
    },
    { id: 'fix-neighbour', type: 'fix', level: 2,
      q: 'This code visits neighbours. It gives 17 for houses 3, 6, 4, 2, 5, but the answer is 12. Fix it.',
      code: py`
        def most_sweets(houses):
            n = len(houses)
            if n == 0:
                return 0
            if n == 1:
                return houses[0]
            best = [0] * n
            best[0] = houses[0]
            best[1] = max(houses[0], houses[1])
            for i in range(2, n):
                skip = best[i - 1]
                take = best[i - 1] + houses[i]
                best[i] = max(skip, take)
            return best[n - 1]
      `,
      answer: py`
        def most_sweets(houses):
            n = len(houses)
            if n == 0:
                return 0
            if n == 1:
                return houses[0]
            best = [0] * n
            best[0] = houses[0]
            best[1] = max(houses[0], houses[1])
            for i in range(2, n):
                skip = best[i - 1]
                take = best[i - 2] + houses[i]
                best[i] = max(skip, take)
            return best[n - 1]
      `,
      tests: [
        { label: 'Five houses', call: 'most_sweets([3, 6, 4, 2, 5])', want: '12' },
        { label: 'Both ends', call: 'most_sweets([5, 1, 1, 5])', want: '10' },
        { label: 'Two houses', call: 'most_sweets([2, 9])', want: '9' },
        { label: 'No houses', call: 'most_sweets([])', want: '0' },
      ],
      explain: '`best[i - 1]` may include the house next door. `best[i - 2]` cannot, so it is safe to add to.',
      hints: ['Which line decides what you add to?', 'If you take house `i`, can you use house `i - 1`?'],
    },
    { id: 'write-hops-table', type: 'write', level: 2,
      q: 'Write `hops3(n)` with a table: the ways up `n` stairs with hops of 1, 2 or 3. It must work for 2000 stairs, so use a loop.',
      starter: py`
        def hops3(n):
            # Your code here.
            return None
      `,
      answer: py`
        def hops3(n):
            ways = [0] * (n + 3)
            ways[0] = 1
            ways[1] = 1
            ways[2] = 2
            for i in range(3, n + 1):
                ways[i] = ways[i - 1] + ways[i - 2] + ways[i - 3]
            return ways[n]
      `,
      tests: [
        { label: 'hops3(0) gives 1', call: 'hops3(0)', want: '1' },
        { label: 'hops3(1) gives 1', call: 'hops3(1)', want: '1' },
        { label: 'hops3(2) gives 2', call: 'hops3(2)', want: '2' },
        { label: 'hops3(4) gives 7', call: 'hops3(4)', want: '7' },
        { label: 'hops3(2000) works', call: 'hops3(2000) % 1000', want: '9' },
      ],
      explain: 'There are 3 base cells, then each cell reads 3 cells back. Make the list long enough for cells 0, 1 and 2, even when `n` is small.',
      hints: ['Which cells need no work? Cells 0, 1 and 2.', 'Tiny `n` must not break the table. Check first, or make the list longer.', 'Each new cell adds the 3 before it.'],
    },
    { id: 'write-ring', type: 'write', level: 3,
      q: 'Stretch: now the houses stand in a ring. The first and last houses are neighbours. Write `ring_sweets(houses)`. You may call `most_sweets`.',
      starter: py`
        def most_sweets(houses):
            n = len(houses)
            if n == 0:
                return 0
            if n == 1:
                return houses[0]
            best = [0] * n
            best[0] = houses[0]
            best[1] = max(houses[0], houses[1])
            for i in range(2, n):
                best[i] = max(best[i - 1], best[i - 2] + houses[i])
            return best[n - 1]

        def ring_sweets(houses):
            # Your code here.
            return None
      `,
      answer: py`
        def most_sweets(houses):
            n = len(houses)
            if n == 0:
                return 0
            if n == 1:
                return houses[0]
            best = [0] * n
            best[0] = houses[0]
            best[1] = max(houses[0], houses[1])
            for i in range(2, n):
                best[i] = max(best[i - 1], best[i - 2] + houses[i])
            return best[n - 1]

        def ring_sweets(houses):
            if len(houses) == 1:
                return houses[0]
            return max(most_sweets(houses[1:]), most_sweets(houses[:-1]))
      `,
      tests: [
        { label: 'No houses', call: 'ring_sweets([])', want: '0' },
        { label: 'One house', call: 'ring_sweets([7])', want: '7' },
        { label: 'Two houses', call: 'ring_sweets([3, 8])', want: '8' },
        { label: 'Three in a ring', call: 'ring_sweets([4, 5, 4])', want: '5' },
        { label: 'Five in a ring', call: 'ring_sweets([3, 6, 4, 2, 5])', want: '11' },
      ],
      explain: 'You cannot use both ends. So solve the street without the first house, then without the last, and keep the bigger.',
      hints: ['You can never take both the first and the last house.', 'So at least one end is left out. Try each.', 'Slices make the 2 shorter streets. Watch out for a single house.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 25.4
Course.lesson('m25-dp-one', {
  id: '25-4-coin-change',
  num: '25.4',
  title: 'Coin change: greedy failed, a table wins',
  goal: 'You can fill a table for the fewest coins, and find which coins it used.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Can we beat greedy at last?' },
    { t: 'p', text: 'In lesson 22.1, you paid 6 cents with coins 1, 3 and 4. Greedy took 4 + 1 + 1, which is 3 coins. But 3 + 3 uses only 2.' },
    { t: 'p', text: 'That lesson promised a better tool. You already know it: a table. The new idea is to ask about your last coin.' },
    { t: 'q', id: 'last-coin', type: 'mcq', level: 1,
      q: 'You want to pay 6, and your last coin is a 3. Which question is left?',
      options: [
        'What is the fewest coins for 3?',
        { text: 'What is the fewest coins for 6?', why: 'That is the question you started with. Paying one coin must leave a smaller amount.' },
        { text: 'What is the fewest coins for 9?', why: 'A coin pays part of the amount, so you take it away. You do not add it.' },
      ],
      answer: 0,
      explain: 'A 3 pays part of it, and 6 - 3 leaves 3. So the total is 1 coin, plus the fewest coins for 3.',
      hints: ['How much is left to pay after that coin?'],
    },
    { t: 'q', id: 'by-hand', type: 'trace', level: 2,
      q: 'Fill these by hand. The coins are 1, 3 and 4. How few coins pay each amount?',
      code: py`
        coins = [1, 3, 4]
        # 0 needs no coins.
        # 1 needs one coin: 1.
      `,
      head: ['amount', 'fewest'],
      rows: [['0', '0'], ['1', '1'], ['2', '2'], ['3', '1'], ['4', '1'], ['5', '2']],
      given: 2,
      verify: py`
        coins = [1, 3, 4]
        fewest = [0] + [9] * 5
        for a in range(1, 6):
            for coin in coins:
                if coin <= a:
                    fewest[a] = min(fewest[a], 1 + fewest[a - coin])
        for a in range(6):
            print(a, fewest[a])
      `,
      explain: 'Each one tries every coin as the last coin. So 5 is 1 + the answer for 4, which gives 2.',
      hints: ['2 is 1 + 1.', '3 and 4 are coins, so each takes 1.', '5 is 4 + 1.'],
    },
    { t: 'steps', title: 'Build the rule', items: [
      { label: 'Say what a cell means', text: 'The cell for amount `a` is the fewest coins that pay `a`.', code: 'fewest[a]' },
      { label: 'Start from nothing', text: 'Paying 0 takes 0 coins. All other cells start as "no mix found".', code: 'fewest[0] = 0' },
      { label: 'Try each coin as the last coin', text: 'If a coin fits, it costs 1 coin, plus the cell for what is left.', code: '1 + fewest[a - coin]' },
      { label: 'Keep the smallest', text: 'Each try is a real way to pay. So the smallest try is the fewest coins.', code: 'fewest[a] = min(fewest[a], try_it)' },
    ] },
    { t: 'viz', name: 'm25-coin-table', caption: 'Guess each cell before you press the arrow. Then try coins 3 5 with amount 7. Some cells have no answer.' },
    { t: 'code', caption: '`None` means no mix works. Run it, then change the coins.',
      code: py`
        def fewest_coins(coins, amount):
            BIG = amount + 1
            fewest = [BIG] * (amount + 1)
            fewest[0] = 0
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        fewest[a] = min(fewest[a], try_it)
            if fewest[amount] == BIG:
                return None
            return fewest[amount]

        print(fewest_coins([1, 3, 4], 6))
        print(fewest_coins([3, 5], 7))
        print(fewest_coins([4, 6], 0))
        print(fewest_coins([], 3))
      `,
      output: '2\nNone\n0\nNone',
    },
    { t: 'tip', title: 'Why amount + 1?', text: 'No real answer can use more than `amount` coins, even if all are 1s. So `amount + 1` is too big to be real. It means "no mix found yet". Adding 1 to it never beats it in `min`.' },
    { t: 'q', id: 'beat-greedy', type: 'predict', level: 2,
      q: 'Greedy pays 8 with 5 + 1 + 1 + 1. What does the table give?',
      code: py`
        def fewest_coins(coins, amount):
            BIG = amount + 1
            fewest = [BIG] * (amount + 1)
            fewest[0] = 0
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        fewest[a] = min(fewest[a], try_it)
            if fewest[amount] == BIG:
                return None
            return fewest[amount]

        print(fewest_coins([1, 4, 5], 8))
      `,
      options: [
        { text: '4', why: 'That is what greedy does, grabbing the 5 first. The table tries every last coin, so it finds a better mix.' },
        '2',
        { text: '3', why: 'You may have tried 5 + 3, but there is no 3 coin here. Look for 2 coins of the same size.' },
      ],
      answer: 1,
      explain: '4 + 4 makes 8. The cell for 8 tries a last coin of 4. The cell for 4 says 1.',
      hints: ['Is there a mix with only 2 coins?', 'Try 4 as the last coin.'],
    },
    { t: 'q', id: 'count-checks', type: 'mcq', level: 1,
      q: 'Count by hand. The coins are 1, 3 and 4, and the amount is 6. How many times does the `for coin` loop run its body?',
      options: [
        { text: '6', why: 'That counts the cells. Each cell also tries every coin.' },
        '18',
        { text: '24', why: 'That is the calls for trying every mix. The table does less work.' },
      ],
      answer: 1,
      explain: 'There are 6 cells to fill, and each one tries 3 coins. So 6 times 3 is 18.',
      hints: ['How many cells does the outer loop fill?', 'How many coins does each cell try?'],
    },
    { t: 'code', caption: 'The columns are: amount, greedy, table, calls for every mix, table steps.',
      code: py`
        def greedy_count(coins, amount):
            used = 0
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    used = used + 1
            return used

        def table_count(coins, amount):
            steps = 0
            fewest = [amount + 1] * (amount + 1)
            fewest[0] = 0
            for a in range(1, amount + 1):
                for coin in coins:
                    steps = steps + 1
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        fewest[a] = min(fewest[a], try_it)
            return fewest[amount], steps

        def tries(coins, amount):
            calls = 1
            for coin in coins:
                if coin <= amount:
                    calls = calls + tries(coins, amount - coin)
            return calls

        coins = [1, 3, 4]
        for a in [5, 6, 10, 20]:
            count, steps = table_count(coins, a)
            g = greedy_count(coins, a)
            t = tries(coins, a)
            print(a, g, count, t, steps)
      `,
      output: '5 2 2 15 15\n6 3 2 24 18\n10 4 3 168 30\n20 5 5 20736 60',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Fill the table', cost: 'O(a k)', why: 'There are `a` cells, and each tries `k` kinds of coin. You counted 6 times 3.' },
      { op: 'Memory', cost: 'O(a)', why: 'One cell for each amount from 0 to `a`.' },
      { op: 'Try every mix', cost: 'O(k^a)', why: 'That is the upper limit from lesson 22.1. The row for 20 shows 20736 calls against 60 steps.' },
    ] },
    { t: 'h', text: 'Which coins did it use?' },
    { t: 'p', text: 'The table gives a count, not the coins. So keep one more list, `last`, which says which coin won each cell. Then walk back from the amount to 0.' },
    { t: 'code', caption: 'Each time a try wins, `last[a]` notes its coin. The `while` loop then follows those coins back.',
      code: py`
        def coins_used(coins, amount):
            BIG = amount + 1
            fewest = [BIG] * (amount + 1)
            last = [0] * (amount + 1)
            fewest[0] = 0
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        if try_it < fewest[a]:
                            fewest[a] = try_it
                            last[a] = coin
            if fewest[amount] == BIG:
                return None
            used = []
            while amount > 0:
                used.append(last[amount])
                amount = amount - last[amount]
            return used

        print(coins_used([1, 3, 4], 6))
        print(coins_used([1, 4, 5], 8))
        print(coins_used([3, 5], 7))
        print(coins_used([2], 0))
      `,
      output: '[3, 3]\n[4, 4]\nNone\n[]',
    },
    { t: 'trap',
      think: 'I can start every cell at 0, like the stairs table.',
      real: '`min` keeps the smallest, so a cell that starts at 0 stays 0 for ever. Stairs add up from 0. Fewest needs to start too big and come down.',
      code: py`
        fewest = [0] * (amount + 1)      # every answer is 0
        fewest = [BIG] * (amount + 1)    # real tries beat BIG
      `,
    },
    { t: 'tip', title: 'Corner cases to test', text: 'Try amount 0, which needs 0 coins. Try no coins at all. Try a coin bigger than the amount. Try an amount no mix can pay, like 7 with coins 3 and 5.' },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **fewest coins**, **fewest steps to reach**, or **can you make exactly**. First hunt for a counterexample to greedy, as lesson 22.1 showed. If you find one, reach for a table.' },
  ],
  recap: [
    'You can try each coin as the last coin.',
    'You can fill the table and handle amounts no mix can pay.',
    'You can walk back through the table to find the coins.',
  ],
  practice: [
    { id: 'why-zero', type: 'mcq', level: 1,
      q: 'Why is `fewest[0]` set to 0?',
      options: [
        'Paying nothing takes no coins',
        { text: 'All cells start at 0', why: 'They start at `BIG`, so that real tries can beat them. Only cell 0 is a real 0.' },
        { text: 'Python lists start at 0', why: 'Cell 0 is the first spot, yes. But its value means the amount 0 needs 0 coins.' },
      ],
      answer: 0,
      explain: 'It is the base case. A coin that pays the whole amount reads this cell: 1 + 0 is 1 coin.',
      hints: ['What does the cell for amount 0 mean?'],
    },
    { id: 'trace-two-five', type: 'trace', level: 2,
      q: 'The coins are 2 and 5. Fill the table. Write `X` if no mix pays that amount.',
      code: py`
        coins = [2, 5]
        # X means no mix pays this amount.
      `,
      head: ['amount', 'fewest'],
      rows: [['0', '0'], ['1', 'X'], ['2', '1'], ['3', 'X'], ['4', '2'], ['5', '1'], ['6', '3'], ['7', '2']],
      given: 2,
      verify: py`
        coins = [2, 5]
        BIG = 8
        fewest = [BIG] * 8
        fewest[0] = 0
        for a in range(1, 8):
            for coin in coins:
                if coin <= a:
                    fewest[a] = min(fewest[a], 1 + fewest[a - coin])
        for a in range(8):
            if fewest[a] >= BIG:
                print(a, "X")
            else:
                print(a, fewest[a])
      `,
      explain: '6 is 2 + 2 + 2, so 3 coins. 7 is 5 + 2, so 2 coins. Odd amounts below 5 have no mix.',
      hints: ['Amount 3: a 2 leaves 1, and 1 has no mix.', 'Amount 7: try 5 as the last coin. Then 2 is left.'],
    },
    { id: 'predict-none', type: 'predict', level: 1,
      q: 'What will the screen show? Type it.',
      code: py`
        amount = 3
        BIG = amount + 1
        fewest = [BIG] * (amount + 1)
        fewest[0] = 0
        for a in range(1, amount + 1):
            for coin in [2]:
                if coin <= a:
                    try_it = 1 + fewest[a - coin]
                    fewest[a] = min(fewest[a], try_it)
        print(fewest)
      `,
      answer: '[0, 4, 1, 4]',
      why: 'Amount 1 and amount 3 have no mix. So they keep `BIG`, which is 4 here.',
      explain: 'A 2 pays amount 2. For amount 3, a 2 leaves 1, and that cell is `BIG`. So 1 + 4 does not beat 4.',
      hints: ['What is `BIG` when `amount` is 3?', 'Only amount 2 has a real mix, other than 0.'],
    },
    { id: 'order-rule', type: 'order', level: 2,
      q: 'Put the lines in order. The program should print the fewest coins for 6.',
      lines: [
        'coins = [1, 3, 4]',
        'fewest = [7] * 7',
        'fewest[0] = 0',
        'for a in range(1, 7):',
        '    for coin in coins:',
        '        if coin <= a:',
        '            fewest[a] = min(fewest[a], 1 + fewest[a - coin])',
        'print(fewest[6])',
      ],
      extra: ['            fewest[a] = min(fewest[a], fewest[a + coin])'],
      output: '2',
      explain: 'Fill the base case, then each cell tries every coin. The extra line reads a bigger amount, and it forgets to count the coin.',
      hints: ['What must be true of cell 0 before the loop starts?', 'A coin leaves a smaller amount, so use `a - coin`.'],
    },
    { id: 'fix-start', type: 'fix', level: 2,
      q: 'This table gives 0 for every amount. Fix it, so it finds the real fewest coins.',
      code: py`
        def fewest_coins(coins, amount):
            BIG = amount + 1
            fewest = [0] * (amount + 1)
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        fewest[a] = min(fewest[a], try_it)
            if fewest[amount] == BIG:
                return None
            return fewest[amount]
      `,
      answer: py`
        def fewest_coins(coins, amount):
            BIG = amount + 1
            fewest = [BIG] * (amount + 1)
            fewest[0] = 0
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        fewest[a] = min(fewest[a], try_it)
            if fewest[amount] == BIG:
                return None
            return fewest[amount]
      `,
      tests: [
        { label: 'Coins 1, 3, 4, amount 6', call: 'fewest_coins([1, 3, 4], 6)', want: '2' },
        { label: 'Coins 3, 5, amount 7', call: 'fewest_coins([3, 5], 7)', want: 'None' },
        { label: 'Amount 0', call: 'fewest_coins([2], 0)', want: '0' },
        { label: 'No coins', call: 'fewest_coins([], 4)', want: 'None' },
      ],
      explain: '`min` can never lift a cell above 0. Start at `BIG`, and set only cell 0 to 0.',
      hints: ['What does `min(0, 3)` give?', 'Use `[BIG] * (amount + 1)`, then set cell 0.'],
    },
    { id: 'write-cant-pay', type: 'write', level: 2,
      q: 'Write `cant_pay(coins, limit)`. Give back a list of the amounts from 1 to `limit` that no mix can pay. Keep them small to big.',
      starter: py`
        def cant_pay(coins, limit):
            # Your code here.
            return None
      `,
      answer: py`
        def cant_pay(coins, limit):
            BIG = limit + 1
            fewest = [BIG] * (limit + 1)
            fewest[0] = 0
            for a in range(1, limit + 1):
                for coin in coins:
                    if coin <= a:
                        try_it = 1 + fewest[a - coin]
                        fewest[a] = min(fewest[a], try_it)
            out = []
            for a in range(1, limit + 1):
                if fewest[a] == BIG:
                    out.append(a)
            return out
      `,
      tests: [
        { label: 'Coins 3 and 5', call: 'cant_pay([3, 5], 8)', want: '[1, 2, 4, 7]' },
        { label: 'A 1 pays anything', call: 'cant_pay([1], 3)', want: '[]' },
        { label: 'No coins', call: 'cant_pay([], 2)', want: '[1, 2]' },
        { label: 'Only 2s', call: 'cant_pay([2], 5)', want: '[1, 3, 5]' },
        { label: 'Limit 0', call: 'cant_pay([2], 0)', want: '[]' },
      ],
      explain: 'One table answers every amount at once. A cell still at `BIG` means no mix pays it.',
      hints: ['Build the same table, up to `limit`.', 'Then walk the table, and collect each cell still at `BIG`.'],
    },
    { id: 'write-pay-ways', type: 'write', level: 3,
      q: 'Stretch: write `pay_ways(coins, amount)`. Count the coin orders that pay exactly `amount`. So 1 + 3 and 3 + 1 count as 2. The table stays, but the rule changes.',
      starter: py`
        def pay_ways(coins, amount):
            # Your code here.
            return None
      `,
      answer: py`
        def pay_ways(coins, amount):
            ways = [0] * (amount + 1)
            ways[0] = 1
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        ways[a] = ways[a] + ways[a - coin]
            return ways[amount]
      `,
      tests: [
        { label: 'Coins 1 and 3, amount 4', call: 'pay_ways([1, 3], 4)', want: '3' },
        { label: 'Coins 1, 3, 4, amount 6', call: 'pay_ways([1, 3, 4], 6)', want: '9' },
        { label: 'Amount 0', call: 'pay_ways([2], 0)', want: '1' },
        { label: 'Coin too big', call: 'pay_ways([5], 3)', want: '0' },
        { label: 'No coins', call: 'pay_ways([], 2)', want: '0' },
      ],
      explain: '"How many" adds the tries, and "fewest" keeps the smallest. Cell 0 is 1 here, because making no choices is one way.',
      hints: ['The last coin can be any coin that fits.', 'Add `ways[a - coin]` for each of those coins.', 'What should cell 0 be? Look back at `stairs(0)`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 25.5
Course.lesson('m25-dp-one', {
  id: '25-5-dp-recipe',
  num: '25.5',
  title: 'The DP recipe: state, transition, base case, order',
  goal: 'You can write the 4 parts of the recipe for a new problem, then code it.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What did all those tables share?' },
    { t: 'p', text: 'You have built tables for stairs, sweets and coins. Each time, you made the same 4 choices. Today those choices get names, so you can use them on new problems.' },
    { t: 'q', id: 'cell-meaning', type: 'mcq', level: 1,
      q: 'In lesson 25.4, what does `fewest[a]` mean?',
      options: [
        'The fewest coins that pay amount `a`',
        { text: 'The coin with value `a`', why: 'That mixes up the coins with the amounts. The index `a` is an amount to pay.' },
        { text: 'How many cells are full so far', why: 'A cell answers one small question. It does not count the table.' },
      ],
      answer: 0,
      explain: 'One sentence tells what a cell means. Everything else in the code follows from that sentence.',
      hints: ['What question does that cell answer?'],
    },
    { t: 'words', items: [
      { word: 'state', means: 'What one cell means, said in one sentence.' },
      { word: 'transition', say: 'tran-ZISH-un', means: 'The rule that makes a cell from other cells.' },
    ] },
    { t: 'steps', title: 'The DP recipe', noun: 'Part', items: [
      { label: 'State', text: 'Say what one cell means, in one sentence with `i` in it.', code: '# ways[i] is the ways to reach stair i' },
      { label: 'Transition', text: 'Say how to make a cell from other cells. Think about the last choice.', code: 'ways[i] = ways[i - 1] + ways[i - 2]' },
      { label: 'Base case', text: 'Fill the cells that read nothing. These are the smallest questions.', code: 'ways[0] = 1\nways[1] = 1' },
      { label: 'Order', text: 'Fill each cell after the cells it reads. Then read the answer.', code: 'for i in range(2, n + 1):' },
    ] },
    { t: 'big', text: 'State, transition, base case, order. Say these 4 parts before you write any code.' },
    { t: 'table', caption: 'The recipe for 3 tables you built', head: ['Part', 'Stairs', 'Sweets', 'Coins'], rows: [
      ['State', 'ways to reach stair `i`', 'most from houses 0 to `i`', 'fewest coins for amount `a`'],
      ['Transition', 'add the 2 cells before', 'bigger of skip and take', 'smallest try over all coins'],
      ['Base case', 'cells 0 and 1 are 1', 'first 2 houses', 'cell 0 is 0'],
      ['Order', 'small to big', 'small to big', 'small to big'],
    ] },
    { t: 'h', text: 'Can the recipe crack a new problem?' },
    { t: 'p', text: 'Each stair has a toll. You pay when you stand on it. You may start on stair 0 or stair 1, and hop 1 or 2 each time.' },
    { t: 'p', text: 'The top sits past the last stair, and it is free. What is the least you can pay?' },
    { t: 'viz', name: 'm25-toll-recipe', caption: 'Pick each part of the recipe, then fill the table. Next, set fill order to big to small and run it again.' },
    { t: 'code', caption: 'The code follows the 4 parts. Adding a free stair makes the top one more cell.',
      code: py`
        def least_toll(tolls):
            stairs = tolls + [0]
            n = len(stairs)
            if n == 1:
                return 0
            least = [0] * n
            least[0] = stairs[0]
            least[1] = stairs[1]
            for i in range(2, n):
                cheaper = min(least[i - 1], least[i - 2])
                least[i] = stairs[i] + cheaper
            return least[n - 1]

        print(least_toll([2, 5, 1, 4, 3]))
        print(least_toll([5]))
        print(least_toll([]))
      `,
      output: '6\n0\n0',
    },
    { t: 'q', id: 'match-toll', type: 'match', level: 2,
      q: 'Match each part of the recipe to its line for the toll stairs.',
      pairs: [
        ['State', '`least[i]` is the least toll to stand on stair `i`'],
        ['Transition', '`stairs[i]` plus the smaller of the 2 cells before'],
        ['Base case', '`least[0]` and `least[1]` are their own tolls'],
        ['Order', 'Go from stair 2 up to the top'],
      ],
      explain: 'The state says what a cell means. The other 3 say how to fill it.',
      hints: ['Which one is a sentence about what a cell means?'],
    },
    { t: 'trap',
      think: 'A loop is a loop. The direction does not matter.',
      real: 'Going the wrong way reads cells that are not full yet. They still say 0. Python gives no error, only a wrong answer. So this toll climb looks free.',
      code: py`
        for i in range(n - 1, 1, -1):   # reads empty cells
        for i in range(2, n):           # reads full cells
      `,
    },
    { t: 'code', caption: 'Same rule, same numbers. Each row prints the table. The last cell says 6 going up, and 0 going down.',
      code: py`
        def climb(stairs, order):
            least = [0] * len(stairs)
            least[0] = stairs[0]
            least[1] = stairs[1]
            for i in order:
                cheaper = min(least[i - 1], least[i - 2])
                least[i] = stairs[i] + cheaper
            return least

        stairs = [2, 5, 1, 4, 3, 0]
        print(climb(stairs, [2, 3, 4, 5]))
        print(climb(stairs, [5, 4, 3, 2]))
      `,
      output: '[2, 5, 3, 7, 6, 6]\n[2, 5, 3, 4, 3, 0]',
    },
    { t: 'q', id: 'pick-state', type: 'mcq', level: 2,
      q: 'New problem: a frog wants the fewest hops to reach stone `n`. Each hop covers 1, 2 or 5 stones. Which state fits?',
      options: [
        '`hops[i]` is the fewest hops to reach stone `i`',
        { text: '`hops[i]` is the size of hop number `i`', why: 'That describes one path, not a smaller question. The recipe needs a cell that answers a smaller copy of the problem.' },
        { text: '`hops[i]` is the biggest hop that fits at stone `i`', why: 'That is the greedy habit. It picks one hop and hides the others. This is really the coin problem.' },
      ],
      answer: 0,
      explain: 'Copy the wording of the problem, and replace `n` with `i`. That often gives you the state.',
      hints: ['What does the problem ask for at stone `n`?', 'Say the same thing for stone `i`.'],
    },
    { t: 'h', text: 'What does a table cost?' },
    { t: 'p', text: 'You can count the work from the recipe, with no code at all. Count the cells. Then count what each cell reads.' },
    { t: 'q', id: 'count-reads', type: 'mcq', level: 1,
      q: 'Toll stairs with 20 cells. Each cell reads about 2 cells. About how many reads is that?',
      options: [
        { text: '20', why: 'That counts the cells. Each cell reads more than once.' },
        '40',
        { text: '400', why: 'That is 20 times 20. A cell reads only 2 others, not all of them.' },
      ],
      answer: 1,
      explain: 'Cells times reads per cell: 20 times 2 is 40.',
      hints: ['Multiply the 2 counts.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Time', cost: 'cells x reads', why: 'Multiply the cells by the reads per cell. Stairs: n x 2, so O(n). Coins: a x k, so O(a k).' },
      { op: 'Memory', cost: 'O(cells)', why: 'One answer per cell.' },
    ] },
    { t: 'h', text: 'How do you know a problem wants DP?' },
    { t: 'table', caption: 'Cue words are clues, not proof', head: ['The problem says', 'Try'], rows: [
      ['**number of ways**', 'DP'],
      ['**fewest**, **most** or **longest**, and a choice now changes later choices', 'DP'],
      ['**list all** the combinations', 'backtracking (module 19)'],
      ['**maximum number of**, and you have a swap reason', 'greedy (module 22)'],
      ['**fewest moves** on a map with no costs', 'BFS (module 21)'],
    ] },
    { t: 'tip', title: 'Stuck on the state?', text: 'Ask what you must know about a smaller question to finish the big one. If one number is not enough, the state needs more. Lesson 25.6 shows this. Module 26 uses 2 numbers.' },
  ],
  recap: [
    'You can name the 4 parts of the recipe.',
    'You can write a state in one sentence.',
    'You can say why the fill order matters.',
  ],
  practice: [
    { id: 'match-parts', type: 'match', level: 1,
      q: 'Match each part of the recipe to what it does.',
      pairs: [
        ['[[state]]', 'Says what one cell means'],
        ['[[transition]]', 'Makes a cell from other cells'],
        ['[[base case]]', 'Fills the cells that read nothing'],
        ['order', 'Fills each cell after the cells it reads'],
      ],
      explain: 'These 4 parts are the same for every table in this module.',
      hints: ['Which part is a sentence, and not code?'],
    },
    { id: 'cue-pick', type: 'mcq', level: 2,
      q: 'Which problem wants DP, and not backtracking?',
      options: [
        'How many ways can you pay 50 with these coins?',
        { text: 'Print every way to pay 50 with these coins', why: 'To print each way, you must visit each way. That is backtracking. DP only counts.' },
        { text: 'Print every order of these 4 letters', why: 'That asks for a full list as well, so backtracking fits. No answers get reused.' },
      ],
      answer: 0,
      explain: 'Counting can reuse small counts. Listing has to write every answer out.',
      hints: ['Does the problem ask for a count, or a full list?'],
    },
    { id: 'pick-transition', type: 'mcq', level: 2,
      q: 'A frog wants the fewest hops to stone `i`, with hops of 1, 2 or 5. Which line is the transition?',
      options: [
        '`hops[i] = 1 + min(hops[i - h] for each hop h that fits)`',
        { text: '`hops[i] = hops[i - 1] + hops[i - 2] + hops[i - 5]`', why: 'Adding counts the ways. The problem asks for the fewest, so you need the smallest.' },
        { text: '`hops[i] = 1 + hops[i - 5]`', why: 'That always takes the biggest hop, which is the greedy habit. It tries only one choice.' },
      ],
      answer: 0,
      explain: 'The last hop can be any size that fits. It costs 1 hop, plus the best way to get there.',
      hints: ['Does the problem say "how many ways" or "fewest"?', 'Which hop sizes must you try?'],
    },
    { id: 'order-toll', type: 'order', level: 2,
      q: 'Put the lines in order. The program should print the least toll for tolls 4, 1 and 6.',
      lines: [
        'stairs = [4, 1, 6, 0]',
        'n = len(stairs)',
        'least = [0] * n',
        'least[0] = stairs[0]',
        'least[1] = stairs[1]',
        'for i in range(2, n):',
        '    least[i] = stairs[i] + min(least[i - 1], least[i - 2])',
        'print(least[n - 1])',
      ],
      extra: ['for i in range(n - 1, 1, -1):'],
      output: '1',
      explain: 'Base cells first, then fill from small to big. The other loop line reads cells that are still empty.',
      hints: ['Which loop reads only cells that are full?', 'The base cells come before the loop.'],
    },
    { id: 'fix-order', type: 'fix', level: 2,
      q: 'This code runs with no error, but `least_toll([2, 5, 1, 4, 3])` gives 0. The answer is 6. Fix the order.',
      code: py`
        def least_toll(tolls):
            stairs = tolls + [0]
            n = len(stairs)
            if n == 1:
                return 0
            least = [0] * n
            least[0] = stairs[0]
            least[1] = stairs[1]
            for i in range(n - 1, 1, -1):
                cheaper = min(least[i - 1], least[i - 2])
                least[i] = stairs[i] + cheaper
            return least[n - 1]
      `,
      answer: py`
        def least_toll(tolls):
            stairs = tolls + [0]
            n = len(stairs)
            if n == 1:
                return 0
            least = [0] * n
            least[0] = stairs[0]
            least[1] = stairs[1]
            for i in range(2, n):
                cheaper = min(least[i - 1], least[i - 2])
                least[i] = stairs[i] + cheaper
            return least[n - 1]
      `,
      tests: [
        { label: 'Five tolls', call: 'least_toll([2, 5, 1, 4, 3])', want: '6' },
        { label: 'Three tolls', call: 'least_toll([4, 1, 6])', want: '1' },
        { label: 'One toll', call: 'least_toll([5])', want: '0' },
        { label: 'No tolls', call: 'least_toll([])', want: '0' },
      ],
      explain: 'Each cell reads the 2 cells on its left. So those must be full first, which means going from small to big.',
      hints: ['Which cells does cell `i` read?', 'Are those cells full when the loop reaches `i`?'],
    },
    { id: 'write-walk', type: 'write', level: 2,
      q: 'Stones in a row hold points, which can be below 0. Start on stone 0, and hop 1 or 2 stones. You must end on the last stone. Write `best_walk(stones)` for the most points. No stones gives 0.',
      starter: py`
        def best_walk(stones):
            # best[i]: the most points standing on stone i.
            return None
      `,
      answer: py`
        def best_walk(stones):
            n = len(stones)
            if n == 0:
                return 0
            best = [0] * n
            best[0] = stones[0]
            for i in range(1, n):
                came = best[i - 1]
                if i >= 2:
                    came = max(came, best[i - 2])
                best[i] = stones[i] + came
            return best[n - 1]
      `,
      tests: [
        { label: 'No stones', call: 'best_walk([])', want: '0' },
        { label: 'One stone', call: 'best_walk([5])', want: '5' },
        { label: 'Two stones', call: 'best_walk([5, 3])', want: '8' },
        { label: 'Hop over a bad stone', call: 'best_walk([1, -5, 2])', want: '3' },
        { label: 'Five stones', call: 'best_walk([2, -1, -3, 4, -2])', want: '3' },
      ],
      explain: 'You must stand on the last stone and start on stone 0. So the cell for `i` adds its points to the better of the 2 cells before.',
      hints: ['State: `best[i]` is given in the starter. Use it.', 'Transition: `stones[i]` plus the bigger of the 2 cells before.', 'Stone 1 has only 1 cell before it. Watch for that.'],
    },
    { id: 'write-run', type: 'write', level: 3,
      q: 'Stretch: write `best_run(nums)`. A run is some numbers side by side, with at least 1 number. Give back the biggest sum of any run. No numbers gives 0. Pick your state with care.',
      starter: py`
        def best_run(nums):
            # Your code here.
            return None
      `,
      answer: py`
        def best_run(nums):
            n = len(nums)
            if n == 0:
                return 0
            ending = [0] * n
            ending[0] = nums[0]
            for i in range(1, n):
                ending[i] = max(nums[i], ending[i - 1] + nums[i])
            return max(ending)
      `,
      tests: [
        { label: 'Mixed numbers', call: 'best_run([2, -5, 3, 4, -1])', want: '7' },
        { label: 'All below 0', call: 'best_run([-3, -1, -2])', want: '-1' },
        { label: 'One number', call: 'best_run([5])', want: '5' },
        { label: 'No numbers', call: 'best_run([])', want: '0' },
        { label: 'Whole list', call: 'best_run([1, 2, 3])', want: '6' },
      ],
      explain: 'The state is the best run that ends exactly at `i`. A run can then grow, or start again. The answer is the biggest cell.',
      hints: ['To grow a run, you must know where it ends.', 'Try this state: `ending[i]` is the best run that ends at `i`.', 'At each `i`, start again with `nums[i]`, or add it to `ending[i - 1]`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 25.6
Course.lesson('m25-dp-one', {
  id: '25-6-longest-increasing',
  num: '25.6',
  title: 'Longest increasing subsequence',
  goal: 'You can pick a state that ends at `i`, and fill the table for it.',
  mins: 13,
  steps: [
    { t: 'h', text: 'How long a rising pick can you make?' },
    { t: 'p', text: 'Here is a row of numbers: 4, 7, 2, 5, 6, 1. Pick some, and keep them in their order. Each one you pick must be bigger than the one before.' },
    { t: 'q', id: 'by-hand', type: 'mcq', level: 1,
      q: 'What is the longest rising pick from 4, 7, 2, 5, 6, 1?',
      options: [
        { text: '2', why: 'You may have grabbed the next bigger number each time: 4, then 7. That greedy habit gets stuck, as 7 is so big.' },
        '3',
        { text: '4', why: '2, 4, 5, 6 is rising, but the 4 comes before the 2. You may not change the order.' },
      ],
      answer: 1,
      explain: '2, 5, 6 works, and so does 4, 5, 6. No rising pick has 4 numbers.',
      hints: ['Try starting from the 2.', 'Keep the numbers in the order they appear.'],
    },
    { t: 'words', items: [
      { word: 'subsequence', say: 'SUB-see-kwens', means: 'Some items from a list, with their order kept. You may skip items.' },
      { word: 'increasing', means: 'Each item is bigger than the one before.' },
    ] },
    { t: 'p', text: 'So the problem has a long name: the longest [[increasing]] [[subsequence]]. We say rising pick for short. Let us use the recipe from lesson 25.5, where the state is the tricky part.' },
    { t: 'q', id: 'why-ends-at', type: 'mcq', level: 2,
      q: 'Say a cell means "the longest pick among the first `i` numbers". The next number is 5. Why is this not enough?',
      options: [
        'The cell does not say how the pick ends, so you cannot tell if 5 fits',
        { text: 'The cell is too big to fit in a list', why: 'A cell holds one small number. Size is not the trouble. The missing fact is the last number of the pick.' },
        { text: 'You cannot use a table when numbers go down', why: 'A table works fine with any numbers. It only needs the right state.' },
      ],
      answer: 0,
      explain: 'To add 5, the pick must end below 5. So the state must say where the pick ends.',
      hints: ['What must be true of a pick before you can add 5 to it?'],
    },
    { t: 'steps', title: 'The recipe for this problem', noun: 'Part', items: [
      { label: 'State', text: 'The longest rising pick that ends exactly at number `i`.', code: 'longest[i]' },
      { label: 'Transition', text: 'Look at each earlier number that is smaller. Grow the best pick that ends there.', code: 'longest[i] = max(longest[i], longest[j] + 1)' },
      { label: 'Base case', text: 'A number alone is a pick of 1. So every cell starts at 1.', code: 'longest = [1] * n' },
      { label: 'Order', text: 'Left to right, because each cell reads only earlier cells. The answer is the biggest cell.', code: 'for i in range(n):' },
    ] },
    { t: 'viz', name: 'm25-lis-table', caption: 'Guess each cell. Watch the `checks` count too. Then try 2 2 2, and 6 5 4 3 2 1.' },
    { t: 'code', caption: 'Each row prints the table, then the answer. Nothing rises in the 2nd row, and equal numbers do not rise in the 3rd.',
      code: py`
        def lis(nums):
            n = len(nums)
            if n == 0:
                return 0
            longest = [1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] < nums[i]:
                        try_it = longest[j] + 1
                        longest[i] = max(longest[i], try_it)
            print(longest)
            return max(longest)

        print(lis([4, 7, 2, 5, 6, 1]))
        print(lis([5, 4, 3]))
        print(lis([2, 2, 2]))
        print(lis([]))
      `,
      output: '[1, 2, 1, 2, 3, 1]\n3\n[1, 1, 1]\n1\n[1, 1, 1]\n1\n0',
    },
    { t: 'q', id: 'predict-lis', type: 'predict', level: 2,
      q: 'Fill the table in your head. What will the screen show?',
      code: py`
        nums = [1, 3, 2, 4]
        longest = [1] * 4
        for i in range(4):
            for j in range(i):
                if nums[j] < nums[i]:
                    longest[i] = max(longest[i], longest[j] + 1)
        print(longest)
      `,
      options: [
        '[1, 2, 2, 3]',
        { text: '[1, 2, 3, 4]', why: 'That thinks the whole list rises. But 2 comes after 3, so 3 cannot lead into 2.' },
        { text: '[1, 2, 1, 3]', why: 'Cell 2 is not 1. The number 2 can follow the 1 at the start, so its pick has 2 numbers.' },
      ],
      answer: 0,
      explain: 'The 2 grows from 1, so its cell is 2. The 4 grows from the 3 or the 2, so its cell is 3.',
      hints: ['Cell 2 belongs to the number 2. Which earlier numbers are smaller?', 'Then do cell 3, for the number 4.'],
    },
    { t: 'trap',
      think: 'The answer is in the last cell, as it was for stairs and coins.',
      real: 'This state says "ends at `i`". The best pick can end anywhere. Here the last cell says 1, and the biggest says 3. Use `max(longest)`.',
      code: py`
        return longest[n - 1]   # the pick must end at the last number
        return max(longest)     # the pick can end anywhere
      `,
    },
    { t: 'q', id: 'count-checks', type: 'mcq', level: 1,
      q: 'Count by hand. For 6 numbers, how many times does `nums[j] < nums[i]` run? The first number has 0 before it, the next has 1.',
      options: [
        { text: '6', why: 'That counts one check per number. But each number checks every number before it.' },
        '15',
        { text: '36', why: 'That is 6 times 6. Each number checks only the ones before it, so it is about half of that.' },
      ],
      answer: 1,
      explain: 'That is 0 + 1 + 2 + 3 + 4 + 5, which is 15. It matches the `checks` count in the picture.',
      hints: ['Add up how many numbers come before each one.'],
    },
    { t: 'code', caption: 'Double the numbers, and the checks grow about 4 times. That is the O(n^2) shape from lesson 8.2.',
      code: py`
        def checks(nums):
            count = 0
            longest = [1] * len(nums)
            for i in range(len(nums)):
                for j in range(i):
                    count = count + 1
                    if nums[j] < nums[i]:
                        try_it = longest[j] + 1
                        longest[i] = max(longest[i], try_it)
            return count

        for n in [5, 10, 20, 40]:
            print(n, checks(list(range(n))))
      `,
      output: '5 10\n10 45\n20 190\n40 780',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Fill the table', cost: 'O(n^2)', why: 'You counted 15 checks for 6 numbers. That is n(n - 1) / 2. The recipe count still works: cells x reads per cell.' },
      { op: 'Memory', cost: 'O(n)', why: 'One cell per number.' },
      { op: 'Read the answer', cost: 'O(n)', why: '`max` walks the whole list, as lesson 8.2 showed.' },
    ] },
    { t: 'tip', title: 'Is there a faster way?', text: 'Yes. There is an O(n log n) way that uses binary search. It keeps different facts in its list, so it needs a new idea. The table here is the one to learn first.' },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **longest** and **keep the order**, and you may **skip** items. If the items must be side by side, try a sliding window from lesson 13.2. If you need a state that says where a thing ends, say "ends at `i`".' },
  ],
  recap: [
    'You can say what a subsequence is.',
    'You can fill a table whose state ends at `i`.',
    'You can read the answer from the biggest cell.',
  ],
  practice: [
    { id: 'what-sub', type: 'mcq', level: 1,
      q: 'Which one is a subsequence of 3, 1, 4, 1, 5?',
      options: [
        '1, 4, 5',
        { text: '4, 3', why: 'The 3 comes before the 4. A subsequence must keep the order.' },
        { text: '1, 1, 1', why: 'The list has only 2 ones. You can skip items, but you cannot add any.' },
      ],
      answer: 0,
      explain: 'You skip the 3 and the second 1. The rest stay in their order.',
      hints: ['Can you find these numbers in order, reading left to right?'],
    },
    { id: 'trace-table', type: 'trace', level: 2,
      q: 'Fill the table for 3, 1, 2, 5, 4.',
      code: py`
        nums = [3, 1, 2, 5, 4]
        longest = [1] * 5
        for i in range(5):
            for j in range(i):
                if nums[j] < nums[i]:
                    longest[i] = max(longest[i], longest[j] + 1)
      `,
      head: ['i', 'num', 'longest'],
      rows: [['0', '3', '1'], ['1', '1', '1'], ['2', '2', '2'], ['3', '5', '3'], ['4', '4', '3']],
      given: 1,
      verify: py`
        nums = [3, 1, 2, 5, 4]
        longest = [1] * 5
        for i in range(5):
            for j in range(i):
                if nums[j] < nums[i]:
                    longest[i] = max(longest[i], longest[j] + 1)
        for i in range(5):
            print(i, nums[i], longest[i])
      `,
      explain: 'The 2 grows from the 1. Both the 5 and the 4 grow from the 2, so their cells are 3.',
      hints: ['Nothing before the 1 is smaller.', 'The 5 can follow 3, 1 or 2. Which cell is biggest?'],
    },
    { id: 'predict-ties', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        nums = [1, 2, 2, 3]
        longest = [1] * 4
        for i in range(4):
            for j in range(i):
                if nums[j] < nums[i]:
                    longest[i] = max(longest[i], longest[j] + 1)
        print(max(longest))
      `,
      answer: '3',
      why: 'The 2 and the 2 are equal, so one cannot follow the other. 1, 2, 3 is the longest.',
      explain: 'The check uses `<`, so equal numbers do not count as rising.',
      hints: ['Can a 2 follow a 2 here?'],
    },
    { id: 'fix-last', type: 'fix', level: 2,
      q: '`lis([4, 7, 2, 5, 6, 1])` gives 1, but the answer is 3. Fix the line that reads the answer.',
      code: py`
        def lis(nums):
            n = len(nums)
            if n == 0:
                return 0
            longest = [1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] < nums[i]:
                        longest[i] = max(longest[i], longest[j] + 1)
            return longest[n - 1]
      `,
      answer: py`
        def lis(nums):
            n = len(nums)
            if n == 0:
                return 0
            longest = [1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] < nums[i]:
                        longest[i] = max(longest[i], longest[j] + 1)
            return max(longest)
      `,
      tests: [
        { label: 'Ends low', call: 'lis([4, 7, 2, 5, 6, 1])', want: '3' },
        { label: 'Ends high', call: 'lis([1, 2, 3])', want: '3' },
        { label: 'Empty', call: 'lis([])', want: '0' },
      ],
      explain: 'The last cell is only the best pick that ends at the last number. The biggest cell is the best of all.',
      hints: ['What does the state of the last cell say?', 'Use `max`.'],
    },
    { id: 'fix-equal', type: 'fix', level: 2,
      q: '`lis([2, 2, 2])` should give 1, but this gives 3. Python counts equal numbers as rising. Fix the check.',
      code: py`
        def lis(nums):
            n = len(nums)
            if n == 0:
                return 0
            longest = [1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] <= nums[i]:
                        longest[i] = max(longest[i], longest[j] + 1)
            return max(longest)
      `,
      answer: py`
        def lis(nums):
            n = len(nums)
            if n == 0:
                return 0
            longest = [1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] < nums[i]:
                        longest[i] = max(longest[i], longest[j] + 1)
            return max(longest)
      `,
      tests: [
        { label: 'All equal', call: 'lis([2, 2, 2])', want: '1' },
        { label: 'A tie inside', call: 'lis([1, 2, 2, 3])', want: '3' },
        { label: 'Rising', call: 'lis([1, 5, 9])', want: '3' },
      ],
      explain: 'Increasing means each number is bigger than the one before. So use `<`, not `<=`.',
      hints: ['Look at the check on line 8.', 'Is 2 bigger than 2?'],
    },
    { id: 'write-fall', type: 'write', level: 2,
      q: 'Write `longest_fall(nums)`: the length of the longest pick where each number is smaller than the one before.',
      starter: py`
        def longest_fall(nums):
            # Your code here.
            return None
      `,
      answer: py`
        def longest_fall(nums):
            n = len(nums)
            if n == 0:
                return 0
            longest = [1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] > nums[i]:
                        longest[i] = max(longest[i], longest[j] + 1)
            return max(longest)
      `,
      tests: [
        { label: 'Empty', call: 'longest_fall([])', want: '0' },
        { label: 'One number', call: 'longest_fall([4])', want: '1' },
        { label: 'All rising', call: 'longest_fall([1, 2, 3])', want: '1' },
        { label: 'All falling', call: 'longest_fall([9, 5, 2])', want: '3' },
        { label: 'Mixed', call: 'longest_fall([4, 7, 2, 5, 6, 1])', want: '3' },
      ],
      explain: 'The recipe stays the same. Only the check flips, so the state is now the longest fall that ends at `i`.',
      hints: ['Start from the `lis` code.', 'Which single check must change?'],
    },
    { id: 'write-pick', type: 'write', level: 3,
      q: 'Stretch: write `lis_pick(nums)`. Give back one longest rising pick as a list. Hint: keep a list `came`, where `came[i]` says which cell won for `i`.',
      starter: py`
        def lis_pick(nums):
            # Your code here.
            return None
      `,
      answer: py`
        def lis_pick(nums):
            n = len(nums)
            if n == 0:
                return []
            longest = [1] * n
            came = [-1] * n
            for i in range(n):
                for j in range(i):
                    if nums[j] < nums[i] and longest[j] + 1 > longest[i]:
                        longest[i] = longest[j] + 1
                        came[i] = j
            at = longest.index(max(longest))
            pick = []
            while at != -1:
                pick.append(nums[at])
                at = came[at]
            pick.reverse()
            return pick
      `,
      tests: [
        { label: 'Empty', call: 'lis_pick([])', want: '[]' },
        { label: 'One number', call: 'lis_pick([5])', want: '[5]' },
        { label: 'Only one best pick', call: 'lis_pick([1, 5, 2, 3, 0])', want: '[1, 2, 3]' },
        { label: 'Length is right', check: 'len(lis_pick([4, 7, 2, 5, 6, 1])) == 3' },
        { label: 'The pick really rises', check: 'lis_pick([4, 7, 2, 5, 6, 1])[0] < lis_pick([4, 7, 2, 5, 6, 1])[1] < lis_pick([4, 7, 2, 5, 6, 1])[2]' },
      ],
      explain: 'This is the same walk back as `coins_used` in lesson 25.4. Follow `came` from the biggest cell, then reverse.',
      hints: ['When a try wins, write `came[i] = j`.', 'Start at the biggest cell, then follow `came` until it says -1.', 'The walk goes backwards, so reverse at the end.'],
    },
  ],
});
