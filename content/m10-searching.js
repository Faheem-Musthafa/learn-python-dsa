/* Module 10: Searching. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm10-searching',
  num: 10, part: 2, level: 'B/I',
  title: 'Searching',
  blurb: 'Find one item fast, by throwing away the places it cannot be.',
  needs: ['m03-loops', 'm08-big-o', 'm09-arrays'],
});

// ---------------------------------------------------------------- lesson 10.1
Course.lesson('m10-searching', {
  id: '10-1-linear-and-guessing',
  num: '10.1',
  title: 'Two ways to search: walk, or guess the middle',
  goal: 'You can write a linear search, count its looks, and say why the middle needs fewer.',
  mins: 13,
  steps: [
    { t: 'h', text: 'How would you win this guessing game?' },
    { t: 'p', text: 'I pick a whole number from 1 to 100. You guess, and I say "too low" or "too high". What should you guess first?' },
    { t: 'q', id: 'spark-first-guess', type: 'mcq', level: 1,
      q: 'Which first guess tells you the most, whatever I say back?',
      options: [
        { text: '1', why: 'You may want to start at the start. But "too low" rules out only one number.' },
        '50',
        { text: '99', why: 'A far-off guess is a gamble. "Too low" rules out nearly all, but "too high" rules out only 2.' },
      ],
      answer: 1,
      explain: 'Whatever I say, 50 rules out about half of the numbers. No other guess does that every time.',
      hints: ['Think about the worst answer you could hear.', 'How many numbers are left after each answer?'],
    },
    { t: 'words', items: [
      { word: 'linear search', means: 'Look at each item in turn, from the start, until you find it.', say: 'LIN-ee-ur' },
      { word: 'binary search', means: 'Look in the middle, then throw away the half that cannot have it.', say: 'BY-nuh-ree' },
      { word: 'sorted', means: 'In order, like small to big.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Play "guess my number" and always guess the middle. Each answer throws away about half of what is left. Unlike your friend, a list cannot say "too low". Your code must open a locker and compare.' },
    { t: 'viz', name: 'm10-guess-game', caption: 'Answer each question as it comes. Then pick your own secret number, and try a game up to 1000.' },
    { t: 'p', text: 'That is the idea behind [[binary search]]. You get to use it because the numbers from 1 to 100 are [[sorted]]. An answer of "too low" tells you about all the smaller numbers too.' },
    { t: 'h', text: 'What if the list has no order?' },
    { t: 'p', text: 'Remember that a list is a row of numbered lockers. The item you want is the target. [[Linear search|linear search]] opens locker 0, then 1, then 2, until it finds the target.' },
    { t: 'code', caption: 'Run it. -1 means "not here". Then try a target of your own.',
      code: py`
        def find(items, target):
            for i in range(len(items)):
                if items[i] == target:
                    return i
            return -1

        nums = [4, 9, 2, 7, 5]
        print(find(nums, 7))
        print(find(nums, 6))
      `,
      output: '3\n-1',
    },
    { t: 'viz', name: 'm10-linear-walk', caption: 'Change the list and the target. Try an empty list, one item, and a number that is there twice.' },
    { t: 'q', id: 'first-match', type: 'predict', level: 2,
      q: 'The target is in this list twice. What will the screen show?',
      code: py`
        def find(items, target):
            for i in range(len(items)):
                if items[i] == target:
                    return i
            return -1

        print(find([3, 8, 3, 1], 3))
      `,
      options: [
        '0',
        { text: '2', why: 'You may think it keeps going to the last match. `return` ends the function at the first one.' },
        { text: '[0, 2]', why: 'This function hands back one number. It stops as soon as it has a match.' },
      ],
      answer: 0,
      explain: 'Locker 0 holds a 3, so `return` hands back 0. The code never opens the other 3.',
      hints: ['What does `return` do to the loop?', 'Which locker holds the first 3?'],
    },
    { t: 'q', id: 'fill-linear', type: 'fill', level: 2,
      q: 'Fill the gaps. The function hands back the spot, or -1 if the target is not there.',
      code: py`
        def find(items, target):
            for i in range(len(items)):
                if items[i] ____ target:
                    return ____
            return -1

        print(find([5, 6, 7], 6))
      `,
      blanks: ['==', 'i'],
      output: '1',
      explain: '`==` asks if this locker holds the target. Then `return i` hands back the spot, not the item.',
      hints: ['One `=` puts a name on a value. Which sign asks a question?', 'The function should hand back the spot.'],
    },
    { t: 'h', text: 'Count the looks by hand' },
    { t: 'p', text: 'Now a race. Before any fancy words, count how many lockers each way opens. A look is one locker opened.' },
    { t: 'q', id: 'count-walk', type: 'trace', level: 2,
      q: 'The list is `[6, 1, 8, 3]` and the target is 3. Fill in each look.',
      code: py`
        items = [6, 1, 8, 3]
        looks = 0
        for i in range(4):
            looks = looks + 1
            print(i, items[i], looks)
      `,
      head: ['i', 'items[i]', 'looks'],
      rows: [['0', '6', '1'], ['1', '1', '2'], ['2', '8', '3'], ['3', '3', '4']],
      given: 1,
      verify: 'items = [6, 1, 8, 3]\nlooks = 0\nfor i in range(4):\n    looks = looks + 1\n    print(i, items[i], looks)',
      explain: 'The target was in the last locker, so 4 items took 4 looks.',
      hints: ['looks goes up by 1 on each trip.', 'Read `items[i]` from the list above.'],
    },
    { t: 'q', id: 'count-halves', type: 'predict', level: 2,
      q: 'Each look at the middle throws away about half. Start with 8 lockers. How many looks until none are left?',
      code: py`
        n = 8
        looks = 0
        while n > 0:
            n = n // 2
            looks = looks + 1
        print(looks)
      `,
      options: [
        { text: '3', why: 'You may stop when 1 locker is left. That last locker still needs a look.' },
        '4',
        { text: '8', why: 'That is how many a walk may need. This loop cuts n in half on each trip.' },
      ],
      answer: 1,
      explain: 'n goes 8, 4, 2, 1, 0. That is 4 trips, so the worst case for 8 lockers is 4 looks.',
      hints: ['Write n after each trip.', 'The loop runs while n is more than 0.'],
    },
    { t: 'p', text: 'Now let Python count for bigger lists. The walk number is the worst case, when every locker gets opened.' },
    { t: 'code', caption: 'Run it. Add your own sizes to the list, like 2000 or 1000000.',
      code: py`
        def halve_looks(n):
            looks = 0
            while n > 0:
                n = n // 2
                looks = looks + 1
            return looks

        for n in [4, 16, 100, 1000]:
            print(n, "walk:", n, "middle:", halve_looks(n))
      `,
      output: '4 walk: 4 middle: 3\n16 walk: 16 middle: 5\n100 walk: 100 middle: 7\n1000 walk: 1000 middle: 10',
    },
    { t: 'big', text: 'A walk looks at every item. The middle way throws half away on each look.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Linear search, worst case', cost: 'O(n)', why: 'Every locker may need a look. Twice the items means twice the looks.' },
      { op: 'Linear search, best case', cost: 'O(1)', why: 'The target may sit in locker 0.' },
      { op: '`x in items`', cost: 'O(n)', why: 'Python walks the list for you.' },
      { op: 'Binary search, on a sorted list', cost: 'O(log n)', why: 'Each look cuts what is left in half. 1000 items need about 10 looks.' },
    ] },
    { t: 'trap',
      think: 'Linear search needs a sorted list.',
      real: 'No. It opens every locker in turn, so any order works. Binary search is the one that needs order.',
      code: py`
        print(7 in [9, 1, 7])   # True, with no order at all
      `,
    },
    { t: 'table', caption: 'How to spot which one to use', head: ['If the problem says...', 'Think of...'], rows: [
      ['any order, or nothing about order', 'Linear search'],
      ['a short list, searched once', 'Linear search is fine'],
      ['"sorted", "in order", or "too low, too high"', 'Binary search'],
      ['a huge sorted list, searched many times', 'Binary search'],
    ] },
    { t: 'tip', title: 'A slow way can still be right', text: 'For 5 items, a walk is short, and the list needs no order. The gap only grows large when the list grows large.' },
  ],
  recap: [
    'You can write a linear search that hands back -1.',
    'You can count the looks on a small list by hand.',
    'You can say why the middle way needs order.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['linear search', 'Open each locker in turn'],
        ['binary search', 'Open the middle, then throw half away'],
        ['sorted', 'In order, like small to big'],
        ['target', 'The item you want to find'],
      ],
      explain: 'A walk is linear search. Guessing the middle is binary search, and it needs a sorted list.',
      hints: ['Which one sounds like a walk along a row?'],
    },
    { id: 'worst-looks', type: 'mcq', level: 1,
      q: 'A list has 20 items, and the target is not there. How many looks does linear search take?',
      options: [
        { text: '1', why: 'That is the best case, when the target sits in locker 0. Here it is not there at all.' },
        { text: '10', why: 'You may think it stops halfway. It cannot be sure until every locker is open.' },
        '20',
      ],
      answer: 2,
      explain: 'A locker it skips could hold the target. So it must open all 20.',
      hints: ['When can it be sure the target is not there?'],
    },
    { id: 'empty-list', type: 'predict', level: 1,
      q: 'The list is empty. Type what the screen will show.',
      code: py`
        def find(items, target):
            for i in range(len(items)):
                if items[i] == target:
                    return i
            return -1

        print(find([], 5))
      `,
      answer: '-1',
      explain: 'The loop makes 0 trips, so Python goes on to `return -1`. Nothing crashes.',
      hints: ['How many trips does `range(0)` make?'],
    },
    { id: 'needs-order', type: 'mcq', level: 2,
      q: 'Your list is `[8, 2, 9, 4]`, and it must stay in this order. You want to find 4. What fits?',
      options: [
        'Linear search',
        { text: 'Binary search', why: 'Binary search works only on a sorted list. This list has no order.' },
        { text: 'Neither one. You must sort it.', why: 'Linear search works on any order, so no sort is needed.' },
      ],
      answer: 0,
      explain: 'Linear search opens each locker in turn, so it does not care about order.',
      hints: ['Which one needs a sorted list?'],
    },
    { id: 'fix-early-exit', type: 'fix', level: 2,
      q: 'This search gives up after the first locker. Fix it.',
      code: py`
        def find(items, target):
            for i in range(len(items)):
                if items[i] == target:
                    return i
                else:
                    return -1
            return -1
      `,
      answer: py`
        def find(items, target):
            for i in range(len(items)):
                if items[i] == target:
                    return i
            return -1
      `,
      tests: [
        { label: 'find([4, 7, 9], 4)', call: 'find([4, 7, 9], 4)', want: '0' },
        { label: 'find([4, 7, 9], 9)', call: 'find([4, 7, 9], 9)', want: '2' },
        { label: 'find([4, 7, 9], 5)', call: 'find([4, 7, 9], 5)', want: '-1' },
        { label: 'find([], 5)', call: 'find([], 5)', want: '-1' },
      ],
      explain: 'You can only say "not here" after the loop ends. One wrong locker proves nothing.',
      hints: ['What happens on the first trip if locker 0 is not the target?', 'Take the `else` part away. The last line already hands back -1.'],
    },
    { id: 'count-looks', type: 'write', level: 2,
      q: 'Write `count_looks(items, target)`. It does a linear search, and hands back how many lockers it opened.',
      starter: py`
        def count_looks(items, target):
            # Your code here.
            return 0
      `,
      answer: py`
        def count_looks(items, target):
            looks = 0
            for item in items:
                looks = looks + 1
                if item == target:
                    return looks
            return looks
      `,
      tests: [
        { label: 'count_looks([6, 1, 8, 3], 3)', call: 'count_looks([6, 1, 8, 3], 3)', want: '4' },
        { label: 'count_looks([6, 1, 8, 3], 6)', call: 'count_looks([6, 1, 8, 3], 6)', want: '1' },
        { label: 'count_looks([6, 1, 8, 3], 5)', call: 'count_looks([6, 1, 8, 3], 5)', want: '4' },
        { label: 'count_looks([], 5)', call: 'count_looks([], 5)', want: '0' },
      ],
      explain: 'Add 1 before you compare. So the locker that holds the target counts too.',
      hints: ['Start a count at 0.', 'Add 1 on each trip, then check the item.', 'Hand back the count in 2 places: on a match, and after the loop.'],
    },
    { id: 'guess-bot', type: 'write', level: 3,
      q: 'Stretch: write a bot, `guesses(secret, top)`. It plays guess my number from 1 to top, always guessing the middle. It hands back how many guesses it needed.',
      starter: py`
        def guesses(secret, top):
            lo = 1
            hi = top
            # Your code here.
            return 0
      `,
      answer: py`
        def guesses(secret, top):
            lo = 1
            hi = top
            count = 0
            while lo <= hi:
                guess = (lo + hi) // 2
                count = count + 1
                if guess == secret:
                    return count
                if guess < secret:
                    lo = guess + 1
                else:
                    hi = guess - 1
            return count
      `,
      tests: [
        { label: 'guesses(50, 100)', call: 'guesses(50, 100)', want: '1' },
        { label: 'guesses(73, 100)', call: 'guesses(73, 100)', want: '6' },
        { label: 'guesses(100, 100)', call: 'guesses(100, 100)', want: '7' },
        { label: 'guesses(1, 1)', call: 'guesses(1, 1)', want: '1' },
      ],
      explain: 'lo and hi mark the numbers still possible. Each guess moves one of them past the guess.',
      hints: ['The middle is `(lo + hi) // 2`.', 'If the guess is too low, the secret must be above it. So `lo = guess + 1`.', 'Loop `while lo <= hi`, and add 1 to a count on each guess.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 10.2
Course.lesson('m10-searching', {
  id: '10-2-binary-search-code',
  num: '10.2',
  title: 'Write binary search with no off-by-one bugs',
  goal: 'You can write binary search, trace lo, hi and mid, and say why the loop ends.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How do you guess the middle of a list?' },
    { t: 'p', text: 'In the guessing game, you kept 2 numbers in your head: the lowest and the highest still possible. Code does the same with 2 indexes. `lo` and `hi` mark the first and last locker that may still hold the target.' },
    { t: 'q', id: 'spark-mid', type: 'predict', level: 1,
      q: 'Lockers 0 to 6 may hold the target. Which locker do you open?',
      code: py`
        lo = 0
        hi = 6
        print((lo + hi) // 2)
      `,
      options: [
        '3',
        { text: '3.5', why: '`/` would give 3.5. But `//` drops the part after the point, and a locker number must be whole.' },
        { text: '6', why: 'You may be adding lo and hi and stopping there. The `// 2` cuts that in half.' },
      ],
      answer: 0,
      explain: '0 + 6 is 6, and half of 6 is 3. Locker 3 has 3 lockers on each side.',
      hints: ['Work out the brackets first.', '`//` divides, then drops any part after the point.'],
    },
    { t: 'words', items: [
      { word: 'search window', means: 'The lockers that may still hold the target. It runs from lo to hi.' },
      { word: 'off-by-one bug', means: 'A bug where a number is 1 too big or 1 too small.' },
    ] },
    { t: 'big', text: 'On each trip, open the middle locker. Then throw that locker away, with one whole side.' },
    { t: 'steps', title: 'Binary search in 4 moves', items: [
      { label: 'Set the window', text: 'The [[search window]] starts as the whole list.', code: 'lo = 0\nhi = len(items) - 1' },
      { label: 'Find the middle', text: 'Halfway between lo and hi, rounded down.', code: 'mid = (lo + hi) // 2' },
      { label: 'Compare', text: 'If this locker holds the target, you are done.', code: 'if items[mid] == target:\n    return mid' },
      { label: 'Shrink the window', text: 'Too small? Go right. Too big? Go left. Mid has had its look, so it goes too.', code: 'lo = mid + 1\n# or\nhi = mid - 1' },
    ] },
    { t: 'viz', name: 'm10-binary-trace', caption: 'Guess each move before it happens. Watch lo, hi and mid in the code panel. Then type your own sorted list and target.' },
    { t: 'code', caption: 'Run it. The print inside the loop shows lo, hi and mid on each trip. Try other targets.',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                print(lo, hi, mid)
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1

        nums = [1, 3, 5, 7, 9, 11, 13]
        print("answer:", find(nums, 9))
      `,
      output: '0 6 3\n4 6 5\n4 4 4\nanswer: 4',
    },
    { t: 'q', id: 'trace-window', type: 'trace', level: 2,
      q: 'The list is `[2, 6, 8, 12, 15, 21, 30]` and the target is 15. Fill in each trip.',
      code: py`
        items = [2, 6, 8, 12, 15, 21, 30]
        target = 15
        lo = 0
        hi = 6
        while lo <= hi:
            mid = (lo + hi) // 2
            print(lo, hi, mid, items[mid])
            if items[mid] == target:
                break
            if items[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
      `,
      head: ['lo', 'hi', 'mid', 'items[mid]'],
      rows: [['0', '6', '3', '12'], ['4', '6', '5', '21'], ['4', '4', '4', '15']],
      given: 1,
      verify: 'items = [2, 6, 8, 12, 15, 21, 30]\ntarget = 15\nlo = 0\nhi = 6\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    print(lo, hi, mid, items[mid])\n    if items[mid] == target:\n        break\n    if items[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1',
      explain: '12 is too small, so lo jumps to 4. 21 is too big, so hi drops to 4. One locker is left, and it holds 15.',
      hints: ['Is 12 smaller or bigger than 15? That tells you which of lo or hi moves.', 'lo moves to mid + 1. hi moves to mid - 1.'],
    },
    { t: 'h', text: 'How does the loop end if the target is not there?' },
    { t: 'p', text: 'Each trip makes the window smaller. So lo and hi come closer, and then they cross. Watch the last 2 trips of this one.' },
    { t: 'viz', name: 'm10-binary-miss', caption: 'Look at lo and hi when they meet, and when they cross. Then try a target smaller than them all, and one bigger.' },
    { t: 'q', id: 'why-equals', type: 'predict', level: 2,
      q: 'Someone wrote `<` in place of `<=`. The list has one item. What will the screen show?',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1

        print(find([5], 5))
      `,
      options: [
        { text: '0', why: 'That is the right answer, but this code never gets there. `0 < 0` is False, so the loop never runs.' },
        '-1',
        { text: 'IndexError', why: 'No locker gets opened at all, so no index can be too big.' },
      ],
      answer: 1,
      explain: 'lo and hi are both 0, and `0 < 0` is False. So the code skips the one locker it should open.',
      hints: ['What are lo and hi at the start?', 'Is 0 smaller than 0?'],
    },
    { t: 'h', text: 'Four lines that stop off-by-one bugs' },
    { t: 'table', caption: 'Each line has a reason. Learn the reason, not only the line.', head: ['Write this', 'Why'], rows: [
      ['`hi = len(items) - 1`', 'The last index is one less than the count. With `len(items)`, mid can reach a locker that is not there.'],
      ['`while lo <= hi`', 'When lo equals hi, one locker still needs a look. With `<`, that locker gets skipped.'],
      ['`lo = mid + 1`', 'Mid has had its look, so it leaves the window. With `lo = mid`, the loop can get stuck forever.'],
      ['`hi = mid - 1`', 'The same reason. Mid has had its look.'],
    ] },
    { t: 'p', text: 'Lesson 10.5 breaks these lines on purpose, so you can see what goes wrong.' },
    { t: 'q', id: 'fill-rules', type: 'fill', level: 2,
      q: 'Fill the gaps, so the code has no off-by-one bugs.',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - ____
            while lo ____ hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid ____ 1
                else:
                    hi = mid ____ 1
            return -1

        print(find([1, 4, 6], 6))
      `,
      blanks: ['1', '<=', '+', '-'],
      output: '2',
      explain: 'hi starts at the last index, and the loop runs while a locker is left. Both moves step past mid.',
      hints: ['What is the last index of a list?', 'If items[mid] is too small, the target is further right. So lo goes up.'],
    },
    { t: 'h', text: 'Count the looks, then name the cost' },
    { t: 'code', caption: 'looks counts the lockers opened. The list grows 10 times, then 10 times again. Try other sizes.',
      code: py`
        def count_looks(items, target):
            lo = 0
            hi = len(items) - 1
            looks = 0
            while lo <= hi:
                mid = (lo + hi) // 2
                looks = looks + 1
                if items[mid] == target:
                    return looks
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return looks

        for size in [10, 100, 1000, 10000]:
            nums = list(range(size))
            print(size, count_looks(nums, -1))
      `,
      output: '10 3\n100 6\n1000 9\n10000 13',
    },
    { t: 'p', text: 'The list grew 1000 times, but the looks only went from 3 to 13. We write this as [[O(log n)]]. Doubling the list adds about one look.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Binary search, worst case', cost: 'O(log n)', why: 'Each look throws away about half of the window.' },
      { op: 'Binary search, best case', cost: 'O(1)', why: 'The first mid may hold the target.' },
      { op: 'One look, `items[mid]`', cost: 'O(1)', why: 'You can jump straight to any locker if you know its number.' },
      { op: 'Sort first, with `sorted`', cost: 'O(n log n)', why: 'This costs more than a walk. It pays off when you search many times.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Look for the words "sorted" or "in order". Look for a long list that gets searched many times. No order? Then binary search is not safe.' },
    { t: 'tip', title: 'Another way to write mid', text: 'Some books write `lo + (hi - lo) // 2`. In some languages, `lo + hi` can grow too big to store. Python whole numbers have no such limit, so `(lo + hi) // 2` is safe.' },
  ],
  recap: [
    'You can write binary search with lo, hi and mid.',
    'You can say why the loop ends when lo passes hi.',
    'You can say why each line of the loop is there.',
  ],
  practice: [
    { id: 'hi-start', type: 'mcq', level: 1,
      q: 'A list has 8 items. What should hi start as?',
      options: [
        { text: '8', why: 'That is the count. Counting starts at 0, so the last locker is one less.' },
        '7',
        { text: '4', why: 'That is near the middle. hi marks the end of the window, and the window starts as the whole list.' },
      ],
      answer: 1,
      explain: 'The lockers are 0 to 7. So `len(items) - 1` is 7.',
      hints: ['What is the last index of a list of 8 items?'],
    },
    { id: 'mid-round', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        lo = 2
        hi = 5
        print((lo + hi) // 2)
      `,
      answer: '3',
      explain: '2 + 5 is 7. Then `7 // 2` is 3, as `//` drops the part after the point.',
      hints: ['Add lo and hi first.'],
    },
    { id: 'which-move', type: 'mcq', level: 2,
      q: 'The list is sorted. `items[mid]` is 6, and the target is 4. Which line runs next?',
      options: [
        { text: '`lo = mid + 1`', why: 'That goes right, to bigger numbers. 6 is already too big, so the target must be further left.' },
        '`hi = mid - 1`',
        { text: '`return mid`', why: '`return mid` runs only if items[mid] equals the target. 6 is not 4.' },
      ],
      answer: 1,
      explain: '6 is too big, and everything right of it is bigger still. So hi moves left of mid.',
      hints: ['Is 6 too small or too big?', 'Which side has the smaller numbers?'],
    },
    { id: 'write-binary', type: 'write', level: 2,
      q: 'Write `find(items, target)` with binary search. `items` is sorted. It hands back the spot of the target, or -1. It must not walk the whole list.',
      starter: py`
        def find(items, target):
            # Your code here.
            return -1
      `,
      answer: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
      `,
      tests: [
        { label: 'find([2, 4, 6, 8], 2)', call: 'find([2, 4, 6, 8], 2)', want: '0' },
        { label: 'find([2, 4, 6, 8], 8)', call: 'find([2, 4, 6, 8], 8)', want: '3' },
        { label: 'find([2, 4, 6, 8], 5)', call: 'find([2, 4, 6, 8], 5)', want: '-1' },
        { label: 'find([7], 7)', call: 'find([7], 7)', want: '0' },
        { label: 'find([], 7)', call: 'find([], 7)', want: '-1' },
        { label: 'It opens few lockers in a list of 1000', check: '(lambda c: (lambda a: find(a, 999) == 999 and a.n <= 40)(c(range(1000))))(type("Counted", (list,), {"n": 0, "__getitem__": lambda s, i: (setattr(s, "n", s.n + 1), list.__getitem__(s, i))[1]}))' },
      ],
      explain: 'Use the 4 moves: set the window, find the middle, compare, shrink. Then hand back -1 after the loop.',
      hints: ['Start with `lo = 0` and `hi = len(items) - 1`.', 'Loop `while lo <= hi`, and work out mid first.', 'Too small means `lo = mid + 1`. Too big means `hi = mid - 1`.'],
    },
    { id: 'big-to-small', type: 'write', level: 3,
      q: 'Stretch: this list is sorted from big to small. Write `find_down(items, target)` with binary search. It hands back the spot, or -1.',
      starter: py`
        def find_down(items, target):
            # Your code here.
            return -1
      `,
      answer: py`
        def find_down(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] > target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
      `,
      tests: [
        { label: 'find_down([9, 7, 4, 1], 9)', call: 'find_down([9, 7, 4, 1], 9)', want: '0' },
        { label: 'find_down([9, 7, 4, 1], 1)', call: 'find_down([9, 7, 4, 1], 1)', want: '3' },
        { label: 'find_down([9, 7, 4, 1], 5)', call: 'find_down([9, 7, 4, 1], 5)', want: '-1' },
        { label: 'find_down([], 5)', call: 'find_down([], 5)', want: '-1' },
      ],
      explain: 'The list runs big to small, so bigger numbers are on the left. One `<` becomes `>`, and all else stays.',
      hints: ['If items[mid] is bigger than the target, which side holds smaller numbers?', 'Only one comparison needs to change.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 10.3
Course.lesson('m10-searching', {
  id: '10-3-bisect',
  num: '10.3',
  title: 'bisect: first spot, last spot, and where to insert',
  goal: 'You can use bisect tools to find first and last spots, counts, and where to insert.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What if the target is there 3 times?' },
    { t: 'p', text: 'Your binary search finds a match, but which one? Guess what it does here.' },
    { t: 'q', id: 'spark-dupes', type: 'predict', level: 1,
      q: 'There are 3 fours in this list. What will the screen show?',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1

        print(find([2, 4, 4, 4, 7, 9], 4))
      `,
      options: [
        { text: '1', why: 'You may expect the first 4. This code stops at whichever 4 it lands on.' },
        '2',
        { text: '3', why: 'You may expect the last 4. The first mid is 2, and locker 2 already holds a 4.' },
      ],
      answer: 1,
      explain: 'The first mid is 2, and locker 2 holds a 4. So it stops there, with a 4 still on each side.',
      hints: ['Work out the first mid. `lo` is 0 and `hi` is 5.'],
    },
    { t: 'p', text: 'So it finds a 4, but not always the first one. And for a missing number, it says only -1. It could say where that number would go.' },
    { t: 'words', items: [
      { word: 'bisect', means: 'Cut into 2 parts. In Python, it is also a box of search tools for sorted lists.', say: 'BY-sekt' },
      { word: 'insertion point', means: 'The spot where a new item can go, so the list stays sorted.', say: 'in-SUR-shun' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Picture a fence in a gap between 2 lockers. Small items stay left of it, and big items stay right. Each [[bisect]] tool tells you which gap gets the fence. Unlike a real fence, it moves nothing and takes no room.' },
    { t: 'table', caption: 'Where each tool puts the fence, when you give it x', head: ['Tool', 'The fence goes right after...'], rows: [
      ['`bisect_left`', 'the items smaller than x'],
      ['`bisect_right`', 'the items that are x or less'],
    ] },
    { t: 'viz', name: 'm10-bisect-fence', caption: 'Guess each number first. Then try an x that is not in the list, one smaller than them all, and one bigger.' },
    { t: 'big', text: '`bisect_left` puts the fence before every x. `bisect_right` puts it after every x.' },
    { t: 'code', caption: 'The number you get back is a gap: it says how many items sit left of the fence. Try other values of x.',
      code: py`
        from bisect import bisect_left, bisect_right

        items = [2, 4, 4, 4, 7, 9]
        print(bisect_left(items, 4))
        print(bisect_right(items, 4))
        print(bisect_left(items, 5))
        print(bisect_right(items, 5))
        print(bisect_left(items, 99))
      `,
      output: '1\n4\n4\n4\n6',
    },
    { t: 'q', id: 'missing-x', type: 'predict', level: 2,
      q: 'x is not in this list. What will the screen show?',
      code: py`
        from bisect import bisect_left, bisect_right

        items = [1, 3, 8, 8]
        print(bisect_left(items, 5), bisect_right(items, 5))
      `,
      options: [
        '2 2',
        { text: '-1 -1', why: '-1 was your own signal in `find`. A bisect tool always gives a gap, even if x is missing.' },
        { text: '2 3', why: 'The 2 fences differ only if x is in the list. With no 5 here, nothing sits between them.' },
      ],
      answer: 0,
      explain: '1 and 3 are smaller than 5, and 8 is bigger. So both fences go at gap 2, the [[insertion point]].',
      hints: ['How many items are smaller than 5?', 'Are any items equal to 5?'],
    },
    { t: 'h', text: 'How do you get the first spot, the last spot, and a count?' },
    { t: 'steps', title: 'Three jobs with 2 fences', items: [
      { label: 'First spot', text: 'The fence on the left sits right before the first x.', code: 'first = bisect_left(items, x)' },
      { label: 'Last spot', text: 'The fence on the right sits right after the last x. So go back one.', code: 'last = bisect_right(items, x) - 1' },
      { label: 'Count', text: 'Only copies of x sit between the fences.', code: 'count = bisect_right(items, x) - bisect_left(items, x)' },
    ] },
    { t: 'trap',
      think: '`bisect_left` hands back the spot where x is.',
      real: 'It hands back a gap, even if x is missing. That gap can be past the end. So check before you open that locker.',
      code: py`
        from bisect import bisect_left
        items = [2, 4]
        i = bisect_left(items, 9)      # i is 2
        items[i]                       # IndexError
        i < len(items) and items[i] == 9   # the safe check
      `,
    },
    { t: 'code', caption: 'The check has 2 parts. If the first part is False, Python skips the second, so no IndexError. Try 2, 4, 5 and 99.',
      code: py`
        from bisect import bisect_left, bisect_right

        def first_last(items, x):
            first = bisect_left(items, x)
            if first < len(items) and items[first] == x:
                return first, bisect_right(items, x) - 1
            return -1, -1

        nums = [2, 4, 4, 4, 7, 9]
        print(first_last(nums, 4))
        print(first_last(nums, 5))
        print(first_last(nums, 99))
      `,
      output: '(1, 3)\n(-1, -1)\n(-1, -1)',
    },
    { t: 'h', text: 'How does it find the fence?' },
    { t: 'p', text: 'It uses the same binary search, with one change. A match does not stop it. It saves the spot as `best`, then keeps looking further left.' },
    { t: 'viz', name: 'm10-first-at-least', caption: 'See what it does at the first 4. Then try other lists. Compare the answer with bisect_left.' },
    { t: 'q', id: 'fill-right', type: 'fill', level: 2,
      q: 'This code finds `bisect_right` by hand: the first item bigger than x. Change one sign.',
      code: py`
        def first_bigger(items, x):
            lo = 0
            hi = len(items) - 1
            best = len(items)
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] ____ x:
                    best = mid
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best

        print(first_bigger([2, 4, 4, 4, 7, 9], 4))
      `,
      blanks: ['>'],
      output: '4',
      explain: 'With `>`, a 4 does not count, so the search moves past every 4. The first bigger item is at spot 4.',
      hints: ['`>=` would stop at the first 4. You want the first item past them all.'],
    },
    { t: 'h', text: 'How do you add an item and keep the order?' },
    { t: 'code', caption: '`insort` finds the insertion point, then inserts there. Try adding 1 and 99.',
      code: py`
        from bisect import insort

        scores = [3, 5, 8]
        insort(scores, 6)
        print(scores)
      `,
      output: '[3, 5, 6, 8]',
    },
    { t: 'q', id: 'count-bisect', type: 'trace', level: 2,
      q: 'Count the looks by hand. The list is `[1, 3, 3, 5]` and x is 3. Fill in each trip, with best as it is after the trip.',
      code: py`
        items = [1, 3, 3, 5]
        x = 3
        lo = 0
        hi = 3
        best = 4
        while lo <= hi:
            mid = (lo + hi) // 2
            if items[mid] >= x:
                best = mid
                hi = mid - 1
            else:
                lo = mid + 1
      `,
      head: ['look', 'mid', 'items[mid]', 'best'],
      rows: [['1', '1', '3', '1'], ['2', '0', '1', '1']],
      given: 1,
      verify: 'items = [1, 3, 3, 5]\nx = 3\nlo = 0\nhi = 3\nbest = 4\nlook = 0\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    look = look + 1\n    if items[mid] >= x:\n        best = mid\n        hi = mid - 1\n    else:\n        lo = mid + 1\n    print(look, mid, items[mid], best)',
      explain: 'After look 1, hi is 0. So mid is 0, and 1 is too small. lo passes hi, so 2 looks were enough.',
      hints: ['After look 1, best is 1 and hi moves to 0.', 'Work out mid from lo 0 and hi 0.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`bisect_left`, `bisect_right`', cost: 'O(log n)', why: 'Each look throws half of the window away.' },
      { op: 'First spot, last spot, count', cost: 'O(log n)', why: 'These use 1 or 2 bisect calls, and no walking.' },
      { op: '`insort`', cost: 'O(n)', why: 'The search is O(log n). But the insert must move every item after that spot.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Look for "first", "last", "how many between" or "where would it go" in a sorted list. For one exact value in data with no order, a dict is often a better fit.' },
  ],
  recap: [
    'You can place both fences with bisect_left and bisect_right.',
    'You can find the first spot, the last spot and a count.',
    'You can check that x is really there first.',
  ],
  practice: [
    { id: 'left-means', type: 'mcq', level: 1,
      q: 'The list is `[1, 3, 3, 5]`. What does `bisect_left(items, 3)` hand back?',
      options: [
        '1',
        { text: '2', why: 'That is the second 3. The left fence goes before every 3, so it comes right after the 1.' },
        { text: '3', why: 'That is what `bisect_right` gives. It goes after every 3.' },
      ],
      answer: 0,
      explain: 'One item is smaller than 3. So the fence goes at gap 1, before the first 3.',
      hints: ['How many items are smaller than 3?'],
    },
    { id: 'right-means', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        from bisect import bisect_right
        print(bisect_right([1, 3, 3, 5], 3))
      `,
      answer: '3',
      explain: 'The items 1, 3 and 3 are not bigger than 3. So the fence goes right after them, at gap 3.',
      hints: ['How many items are 3 or less?'],
    },
    { id: 'end-gap', type: 'predict', level: 2,
      q: 'x is bigger than every item. What will the screen show?',
      code: py`
        from bisect import bisect_left
        print(bisect_left([2, 4, 6], 10))
      `,
      options: [
        { text: '-1', why: 'That was your own signal in `find`. `bisect_left` always hands back a gap.' },
        { text: '2', why: 'That is the last locker. But the fence goes after every smaller item, so it is past that locker.' },
        '3',
      ],
      answer: 2,
      explain: 'All 3 items are smaller than 10, so the fence goes at the end. A new 10 would go at spot 3.',
      hints: ['How many items are smaller than 10?'],
    },
    { id: 'fix-check', type: 'fix', level: 2,
      q: '`has(items, x)` should say if x is in the sorted list. It crashes when x is bigger than every item. Fix it.',
      code: py`
        from bisect import bisect_left

        def has(items, x):
            i = bisect_left(items, x)
            return items[i] == x
      `,
      answer: py`
        from bisect import bisect_left

        def has(items, x):
            i = bisect_left(items, x)
            return i < len(items) and items[i] == x
      `,
      tests: [
        { label: 'has([2, 4], 4)', call: 'has([2, 4], 4)', want: 'True' },
        { label: 'has([2, 4], 3)', call: 'has([2, 4], 3)', want: 'False' },
        { label: 'has([2, 4], 9)', call: 'has([2, 4], 9)', want: 'False' },
        { label: 'has([], 1)', call: 'has([], 1)', want: 'False' },
      ],
      explain: 'The gap can be past the end. So check `i < len(items)` before you open that locker.',
      hints: ['What is i when x is bigger than every item?', 'Add a check with `and`. Put it first.'],
    },
    { id: 'count-of', type: 'write', level: 2,
      q: 'Write `count_of(items, x)`. `items` is sorted. It hands back how many copies of x there are, using bisect.',
      starter: py`
        from bisect import bisect_left, bisect_right

        def count_of(items, x):
            # Your code here.
            return -1
      `,
      answer: py`
        from bisect import bisect_left, bisect_right

        def count_of(items, x):
            return bisect_right(items, x) - bisect_left(items, x)
      `,
      tests: [
        { label: 'count_of([1, 2, 2, 2, 5], 2)', call: 'count_of([1, 2, 2, 2, 5], 2)', want: '3' },
        { label: 'count_of([1, 2, 2, 2, 5], 3)', call: 'count_of([1, 2, 2, 2, 5], 3)', want: '0' },
        { label: 'count_of([], 3)', call: 'count_of([], 3)', want: '0' },
      ],
      explain: 'Only copies of x sit between the 2 fences. So the gap between them is the count.',
      hints: ['Where do the 2 fences go?', 'Take the left number away from the right number.'],
    },
    { id: 'count-between', type: 'write', level: 2,
      q: 'Write `count_between(items, a, b)`. `items` is sorted. It counts the items from a to b, and a and b count too.',
      starter: py`
        from bisect import bisect_left, bisect_right

        def count_between(items, a, b):
            # Your code here.
            return -1
      `,
      answer: py`
        from bisect import bisect_left, bisect_right

        def count_between(items, a, b):
            return bisect_right(items, b) - bisect_left(items, a)
      `,
      tests: [
        { label: 'count_between([1, 3, 3, 5, 8, 9], 3, 8)', call: 'count_between([1, 3, 3, 5, 8, 9], 3, 8)', want: '4' },
        { label: 'count_between([1, 3, 3, 5, 8, 9], 4, 4)', call: 'count_between([1, 3, 3, 5, 8, 9], 4, 4)', want: '0' },
        { label: 'count_between([1, 3, 3, 5, 8, 9], 0, 99)', call: 'count_between([1, 3, 3, 5, 8, 9], 0, 99)', want: '6' },
        { label: 'count_between([], 1, 2)', call: 'count_between([], 1, 2)', want: '0' },
      ],
      explain: 'Put one fence before the first a. Put the other fence after the last b. Then take one from the other.',
      hints: ['Which tool goes before every a?', 'Which tool goes after every b?'],
    },
    { id: 'place-by-hand', type: 'write', level: 3,
      q: 'Stretch: write `place(items, x)` with no bisect tool. `items` is sorted. It hands back the first spot where x could go, as `bisect_left` does.',
      starter: py`
        def place(items, x):
            lo = 0
            hi = len(items) - 1
            best = len(items)
            # Your code here.
            return -1
      `,
      answer: py`
        def place(items, x):
            lo = 0
            hi = len(items) - 1
            best = len(items)
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] >= x:
                    best = mid
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best
      `,
      tests: [
        { label: 'place([1, 3, 3, 5], 3)', call: 'place([1, 3, 3, 5], 3)', want: '1' },
        { label: 'place([1, 3, 5], 4)', call: 'place([1, 3, 5], 4)', want: '2' },
        { label: 'place([1, 3, 5], 0)', call: 'place([1, 3, 5], 0)', want: '0' },
        { label: 'place([1, 3, 5], 9)', call: 'place([1, 3, 5], 9)', want: '3' },
        { label: 'place([], 9)', call: 'place([], 9)', want: '0' },
      ],
      explain: 'A spot with an item of x or more could be the answer. So save it, then look further left.',
      hints: ['Use the same `while lo <= hi` loop as before.', 'If `items[mid] >= x`, save mid in best, then move hi.', 'Otherwise, the item is too small, so move lo.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 10.4
Course.lesson('m10-searching', {
  id: '10-4-search-the-answer',
  num: '10.4',
  title: 'Binary search on the answer',
  goal: 'You can spot a "smallest value that works" problem and solve it with binary search.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What if there is no list to search?' },
    { t: 'p', text: 'A robot packs piles of toys. Each hour, it packs up to `speed` toys from one pile. If that pile runs out early, it waits for the next hour. A slow robot uses less power.' },
    { t: 'p', text: 'The piles are 4, 9 and 6 toys, and you have 6 hours. What is the slowest speed that still finishes in time?' },
    { t: 'q', id: 'spark-faster', type: 'mcq', level: 1,
      q: 'Speed 5 finishes in time. Does speed 6 finish in time too?',
      options: [
        'Yes. Faster never takes longer.',
        { text: 'No. Only one speed can work.', why: 'You may think there is one right speed. Any speed above a working speed works too.' },
        { text: 'You must count it to know.', why: 'You can count it, but no need. A faster robot can never need more hours.' },
      ],
      answer: 0,
      explain: 'A faster robot takes the same hours or fewer. So once a speed works, all faster speeds work too.',
      hints: ['Can a faster robot take more hours than a slower one?'],
    },
    { t: 'words', items: [
      { word: 'answer range', means: 'All the answers that might be right, from lo to hi.' },
      { word: 'check function', means: 'A function that tests one answer. It hands back True or False.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Line up every speed and write No or Yes on each. You get No, No, No, then Yes, Yes, Yes. The fence goes between them. Unlike lockers, these answers are not stored. A [[check function]] works out each one when you ask.' },
    { t: 'code', caption: 'Here is the check function. Run it to see the row of No and Yes. Change `limit` to 8.',
      code: py`
        def works(speed, piles, limit):
            hours = 0
            for size in piles:
                hours = hours + size // speed
                if size % speed > 0:
                    hours = hours + 1
            return hours <= limit

        piles = [4, 9, 6]
        limit = 6
        for speed in range(1, 10):
            print(speed, works(speed, piles, limit))
      `,
      output: '1 False\n2 False\n3 False\n4 True\n5 True\n6 True\n7 True\n8 True\n9 True',
    },
    { t: 'q', id: 'count-hours', type: 'predict', level: 2,
      q: 'Count by hand first. At speed 3, how many hours do the 3 piles take?',
      code: py`
        hours = 0
        for size in [4, 9, 6]:
            hours = hours + size // 3
            if size % 3 > 0:
                hours = hours + 1
        print(hours)
      `,
      options: [
        { text: '6', why: 'You may be dropping the last toy in the pile of 4. That 1 toy still needs an hour of its own.' },
        '7',
        { text: '19', why: 'That is how many toys there are. Each hour packs up to 3 toys.' },
      ],
      answer: 1,
      explain: 'The piles take 2, 3 and 2 hours. That makes 7.',
      hints: ['A pile of 4 at speed 3: 3 toys, then 1 toy. That is 2 hours.'],
    },
    { t: 'big', text: 'If answers go No, No, then Yes, Yes, you can binary search the answers.' },
    { t: 'steps', title: 'Search the answers in 3 moves', items: [
      { label: 'Set the answer range', text: 'Speed 1 is the slowest. The biggest pile sets the top, as nothing faster can help.', code: 'lo = 1\nhi = max(piles)' },
      { label: 'Test the middle', text: 'Ask the check function about mid.', code: 'mid = (lo + hi) // 2\nif works(mid, piles, limit):' },
      { label: 'Keep the best and shrink', text: 'Yes? Save mid, and try slower. No? Try faster.', code: 'best = mid\nhi = mid - 1\n# or\nlo = mid + 1' },
    ] },
    { t: 'viz', name: 'm10-answer-line', caption: 'Guess each move. Then change the piles and the hours. What if the hours are fewer than the piles?' },
    { t: 'code', caption: 'This is the same loop as before. `checks` counts the tests. Try piles in the thousands.',
      code: py`
        def works(speed, piles, limit):
            hours = 0
            for size in piles:
                hours = hours + size // speed
                if size % speed > 0:
                    hours = hours + 1
            return hours <= limit

        def slowest(piles, limit):
            lo = 1
            hi = max(piles)
            best = -1
            checks = 0
            while lo <= hi:
                mid = (lo + hi) // 2
                checks = checks + 1
                if works(mid, piles, limit):
                    best = mid
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best, checks

        print(slowest([4, 9, 6], 6))
        print(slowest([300, 1000, 700], 10))
        print(slowest([4, 9, 6], 2))
      `,
      output: '(4, 4)\n(234, 10)\n(-1, 4)',
    },
    { t: 'q', id: 'fill-answer', type: 'fill', level: 2,
      q: 'Fill the gaps. A Yes means: save it, then try something slower.',
      code: py`
        def works(speed):
            return speed >= 7

        lo = 1
        hi = 20
        best = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if works(mid):
                best = ____
                hi = ____ - 1
            else:
                lo = mid + 1
        print(best)
      `,
      blanks: ['mid', 'mid'],
      output: '7',
      explain: 'mid works, so it is the best so far. Then hi drops below it, to look for a smaller one that works.',
      hints: ['What do you want to remember when a test says Yes?', 'To try slower, the top of the range goes below mid.'],
    },
    { t: 'q', id: 'count-checks', type: 'predict', level: 2,
      q: 'Count by hand. How many checks does it take to search speeds 1 to 8 here?',
      code: py`
        def works(speed):
            return speed >= 6

        lo = 1
        hi = 8
        checks = 0
        while lo <= hi:
            mid = (lo + hi) // 2
            checks = checks + 1
            if works(mid):
                hi = mid - 1
            else:
                lo = mid + 1
        print(checks)
      `,
      options: [
        '3',
        { text: '6', why: 'That is how many a walk from speed 1 needs. This loop throws half away on each check.' },
        { text: '8', why: 'That would be a check for every speed. This loop skips most of them.' },
      ],
      answer: 0,
      explain: 'It tries 4, which is too slow. Then it tries 6, which works. Then 5, which is too slow. Then lo passes hi.',
      hints: ['The first mid is 4. Does 4 work?', 'Next, lo is 5 and hi is 8. Write out each mid.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'One check', cost: 'O(n)', why: 'The check function walks all n piles.' },
      { op: 'Number of checks', cost: 'O(log m)', why: 'm is the size of the answer range. Each check cuts it in half.' },
      { op: 'All together', cost: 'O(n log m)', why: 'That is log m checks, and each one costs n steps.' },
    ] },
    { t: 'trap',
      think: 'I can binary search any list of answers.',
      real: 'The answers must switch once: all No, then all Yes. If they go back and forth, throwing half away can throw away the answer.',
      code: py`
        def is_even(x):
            return x % 2 == 0
        # 1 No, 2 Yes, 3 No, 4 Yes: not safe
      `,
    },
    { t: 'h', text: 'What about "the biggest that still fits"?' },
    { t: 'p', text: 'Sometimes the row goes Yes, Yes, then No, No, and you want the last Yes. Then a Yes means: save it, and try bigger. So the 2 moves trade places.' },
    { t: 'code', caption: 'This finds the biggest whole number whose square is not more than n. Try 16, 17 and 1000000.',
      code: py`
        def whole_root(n):
            lo = 0
            hi = n
            best = 0
            while lo <= hi:
                mid = (lo + hi) // 2
                if mid * mid <= n:
                    best = mid
                    lo = mid + 1
                else:
                    hi = mid - 1
            return best

        print(whole_root(15))
        print(whole_root(16))
      `,
      output: '3\n4',
    },
    { t: 'q', id: 'cue-words', type: 'mcq', level: 2,
      q: 'Which problem fits binary search on the answer?',
      options: [
        'Find the smallest shelf width that fits all your books in 4 rows.',
        { text: 'Find which day had the most rain.', why: 'Each day is only a number to compare. A walk finds the biggest, and no row of No then Yes appears.' },
        { text: 'Count how many words start with A.', why: 'You must look at every word. There is no answer to test as Yes or No.' },
      ],
      answer: 0,
      explain: 'A wider shelf never needs more rows. So the widths go No, No, then Yes, Yes.',
      hints: ['Look for "smallest ... that works".', 'If a width works, does a wider one work too?'],
    },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Your check asks...'], rows: [
      ['"smallest speed that finishes"', 'Does this speed finish in time?'],
      ['"least", "minimum ... that works"', 'Does this value work?'],
      ['"largest that still fits"', 'Does this value still fit?'],
      ['"at most k hours" or "at most k boxes"', 'Does it stay within k?'],
    ] },
    { t: 'list', items: [
      'What if no value works? Keep `best = -1`, as the code above does.',
      'What if the list of piles is empty? `max` stops with a `ValueError`, so check first.',
      'What if the answer is at either end of the range? Test lo and hi.',
    ] },
  ],
  recap: [
    'You can spot a row of No, then Yes.',
    'You can write a check function for one answer.',
    'You can binary search the answers and keep the best.',
  ],
  practice: [
    { id: 'which-row', type: 'mcq', level: 1,
      q: 'Each row shows a check function\'s answers, from small to big. Which row can you binary search?',
      options: [
        'No, No, No, Yes, Yes',
        { text: 'No, Yes, No, Yes, No', why: 'This goes back and forth. Throwing half away could throw away the answer.' },
        { text: 'Yes, No, Yes, No, Yes', why: 'This has no single switch. A Yes tells you nothing about its neighbours.' },
      ],
      answer: 0,
      explain: 'The row switches once. So each test tells you which half to throw away.',
      hints: ['How many times should the answers switch?'],
    },
    { id: 'range-top', type: 'mcq', level: 1,
      q: 'The piles are `[3, 12, 5]`. What should hi start as, when you search for the slowest speed?',
      options: [
        { text: '3', why: 'That is the first pile. A speed of 3 may be too slow for the pile of 12.' },
        '12',
        { text: '20', why: 'That is all the toys. It works, but a speed above the biggest pile never helps.' },
      ],
      answer: 1,
      explain: 'At speed 12, each pile takes 1 hour. Nothing faster can do better.',
      hints: ['At what speed does each pile take 1 hour?'],
    },
    { id: 'works-predict', type: 'predict', level: 2,
      q: 'Type what the screen will show.',
      code: py`
        def works(speed, piles, limit):
            hours = 0
            for size in piles:
                hours = hours + size // speed
                if size % speed > 0:
                    hours = hours + 1
            return hours <= limit

        print(works(2, [5, 4], 4))
      `,
      answer: 'False',
      explain: 'The pile of 5 takes 3 hours, and the pile of 4 takes 2. That makes 5, which is more than 4.',
      hints: ['A pile of 5 at speed 2: 2 toys, 2 toys, then 1 toy.'],
    },
    { id: 'fix-no-best', type: 'fix', level: 2,
      q: 'This should find the smallest number whose square is at least n. It always hands back -1. Fix it.',
      code: py`
        def first_square(n):
            lo = 0
            hi = n
            best = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if mid * mid >= n:
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best
      `,
      answer: py`
        def first_square(n):
            lo = 0
            hi = n
            best = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if mid * mid >= n:
                    best = mid
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best
      `,
      tests: [
        { label: 'first_square(16)', call: 'first_square(16)', want: '4' },
        { label: 'first_square(17)', call: 'first_square(17)', want: '5' },
        { label: 'first_square(1)', call: 'first_square(1)', want: '1' },
      ],
      explain: 'The loop throws away values, so it must save each Yes as it goes. Otherwise best stays -1.',
      hints: ['Which name is on the answer?', 'Where does best ever change?'],
    },
    { id: 'first-bad', type: 'write', level: 2,
      q: 'Your game has builds 1 to n. A bug arrived in one build, and every later build has it too. `is_bad(b)` tests a build. Write `first_bad(n, is_bad)` to find the first bad build. All the good builds come first, and at least one build is bad.',
      starter: py`
        def first_bad(n, is_bad):
            # Your code here.
            return -1
      `,
      answer: py`
        def first_bad(n, is_bad):
            lo = 1
            hi = n
            best = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if is_bad(mid):
                    best = mid
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best
      `,
      tests: [
        { label: 'first_bad(5, lambda b: b >= 3)', call: 'first_bad(5, lambda b: b >= 3)', want: '3' },
        { label: 'first_bad(5, lambda b: b >= 1)', call: 'first_bad(5, lambda b: b >= 1)', want: '1' },
        { label: 'first_bad(5, lambda b: b >= 5)', call: 'first_bad(5, lambda b: b >= 5)', want: '5' },
        { label: 'first_bad(1, lambda b: True)', call: 'first_bad(1, lambda b: True)', want: '1' },
        { label: 'first_bad(1000, lambda b: b >= 700)', call: 'first_bad(1000, lambda b: b >= 700)', want: '700' },
      ],
      explain: 'is_bad is the check function. The builds go No, No, then Yes, Yes, and you want the first Yes.',
      hints: ['The range runs from 1 to n.', 'If mid is bad, save it and try earlier builds.', 'If mid is good, the first bad build must be later.'],
    },
    { id: 'whole-root', type: 'write', level: 2,
      q: 'Write `root_of(n)`. It hands back the biggest whole number whose square is not more than n. Use binary search, not a walk.',
      starter: py`
        def root_of(n):
            # Your code here.
            return -1
      `,
      answer: py`
        def root_of(n):
            lo = 0
            hi = n
            best = 0
            while lo <= hi:
                mid = (lo + hi) // 2
                if mid * mid <= n:
                    best = mid
                    lo = mid + 1
                else:
                    hi = mid - 1
            return best
      `,
      tests: [
        { label: 'root_of(0)', call: 'root_of(0)', want: '0' },
        { label: 'root_of(1)', call: 'root_of(1)', want: '1' },
        { label: 'root_of(15)', call: 'root_of(15)', want: '3' },
        { label: 'root_of(16)', call: 'root_of(16)', want: '4' },
        { label: 'root_of(1000000)', call: 'root_of(1000000)', want: '1000' },
      ],
      explain: 'Small numbers pass the test, and big numbers fail. You want the last Yes, so a Yes moves lo up.',
      hints: ['The check is `mid * mid <= n`.', 'If it says Yes, save mid and try bigger.', 'The range can run from 0 to n.'],
    },
    { id: 'slowest-speed', type: 'write', level: 3,
      q: 'Stretch: write `slowest(piles, limit)`. It hands back the slowest speed that packs all the piles within limit hours. If no speed works, it hands back -1. There is at least one pile.',
      starter: py`
        def slowest(piles, limit):
            # Your code here.
            return 0
      `,
      answer: py`
        def works(speed, piles, limit):
            hours = 0
            for size in piles:
                hours = hours + size // speed
                if size % speed > 0:
                    hours = hours + 1
            return hours <= limit

        def slowest(piles, limit):
            lo = 1
            hi = max(piles)
            best = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if works(mid, piles, limit):
                    best = mid
                    hi = mid - 1
                else:
                    lo = mid + 1
            return best
      `,
      tests: [
        { label: 'slowest([4, 9, 6], 6)', call: 'slowest([4, 9, 6], 6)', want: '4' },
        { label: 'slowest([4, 9, 6], 3)', call: 'slowest([4, 9, 6], 3)', want: '9' },
        { label: 'slowest([4, 9, 6], 19)', call: 'slowest([4, 9, 6], 19)', want: '1' },
        { label: 'slowest([4, 9, 6], 2)', call: 'slowest([4, 9, 6], 2)', want: '-1' },
        { label: 'slowest([10], 3)', call: 'slowest([10], 3)', want: '4' },
      ],
      explain: 'First write the check function. Then search speeds 1 to `max(piles)`, and save each Yes.',
      hints: ['Write a helper that counts the hours for one speed.', 'A pile takes `size // speed` hours, plus 1 if any toys are left.', 'A Yes means save mid and try slower. A No means try faster.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 10.5
Course.lesson('m10-searching', {
  id: '10-5-what-breaks-search',
  num: '10.5',
  title: 'What breaks binary search?',
  goal: 'You can spot a binary search that goes wrong, and fix it.',
  mins: 13,
  steps: [
    { t: 'p', text: 'You have used binary search a lot by now. Now try to break it. Some bugs stop the program. Others give a wrong answer and say nothing.' },
    { t: 'h', text: 'Why must the list be sorted?' },
    { t: 'p', text: 'Throwing half away feels safe. But is it always safe? Guess first, then watch.' },
    { t: 'q', id: 'unsorted-guess', type: 'predict', level: 2,
      q: 'This list is not in order, and 2 is at locker 1. What will the screen show?',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1

        print(find([9, 2, 7, 4, 1], 2))
      `,
      options: [
        { text: '1', why: 'You may think binary search works on any list. It trusts the order, and here it throws 2 away.' },
        '-1',
        { text: 'An error message', why: 'Python gives no warning. The code runs fine and gives a wrong answer.' },
      ],
      answer: 1,
      explain: 'The middle is 7, so the code goes left. Then it opens 9, and it goes left again, past the 2.',
      hints: ['Trace it: the first mid is 2, and locker 2 holds 7.', 'Is 2 smaller than 7? Which way does the code go?'],
    },
    { t: 'viz', name: 'm10-binary-unsorted', caption: 'See where the 2 gets thrown away. Then make your own list that is not in order, and try to fool it.' },
    { t: 'trap',
      think: 'Binary search works on any list.',
      real: 'It throws lockers away because it trusts the order. With no order, it can throw away the target, and Python gives no warning. Sort first, or walk the list.',
      code: py`
        items = sorted([9, 2, 7, 4, 1])
        print(items)   # [1, 2, 4, 7, 9]
      `,
    },
    { t: 'h', text: 'What if lo does not move?' },
    { t: 'p', text: 'Lesson 10.2 says to write `lo = mid + 1`. What if someone writes `lo = mid`?' },
    { t: 'viz', name: 'm10-bug-stuck', caption: 'Line 9 has an [[off-by-one bug]]. Watch lo and hi on the last trips. Then try a target that gets found, and see that the bug can hide.' },
    { t: 'code', caption: 'A safety count stops this after 5 trips. See how the 3 numbers never change. Then fix line 12.',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            trips = 0
            while lo <= hi and trips < 5:
                trips = trips + 1
                mid = (lo + hi) // 2
                print(lo, hi, mid)
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid
                else:
                    hi = mid - 1
            return "I stopped it for you."

        print(find([2, 4], 4))
      `,
      output: '0 1 0\n0 1 0\n0 1 0\n0 1 0\n0 1 0\nI stopped it for you.',
    },
    { t: 'q', id: 'order-steps', type: 'order', level: 2,
      q: 'Put the lines in order. The window shrinks until lo stops at the spot of 5. One line does not belong.',
      lines: [
        'items = [1, 3, 5, 7]',
        'lo, hi = 0, 3',
        'while lo <= hi:',
        '    mid = (lo + hi) // 2',
        '    if items[mid] < 5:',
        '        lo = mid + 1',
        '    else:',
        '        hi = mid - 1',
        'print(lo)',
      ],
      extra: ['        lo = mid'],
      output: '2',
      explain: 'The window comes first. Then each trip finds mid, compares, and shrinks. print comes after the loop.',
      hints: ['What must exist before you can work out mid?', '`lo = mid` can get stuck. Leave that line out.'],
    },
    { t: 'h', text: 'What if hi starts too high?' },
    { t: 'code', error: true, caption: 'Run it. The lockers are 0, 1 and 2. Which locker does it try last? Then fix line 3.',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items)
            while lo <= hi:
                mid = (lo + hi) // 2
                print("opens locker", mid)
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1

        print(find([1, 3, 5], 9))
      `,
    },
    { t: 'q', id: 'match-bugs', type: 'match', level: 2,
      q: 'Match each bug to what you see when it strikes.',
      pairs: [
        ['`hi = len(items)`', 'An IndexError on some targets'],
        ['`while lo < hi`', 'It misses the last locker left'],
        ['`lo = mid`', 'An infinite loop on some targets'],
        ['A list that is not sorted', 'A wrong answer, with no error'],
      ],
      explain: 'Only the last bug is silent. That is why it is the most dangerous, and why you test.',
      hints: ['Which bug opens a locker that does not exist?', 'Which bug gives no warning at all?'],
    },
    { t: 'big', text: 'A search that works once can still be wrong. Test it where it is most likely to break.' },
    { t: 'h', text: 'How do you test a search?' },
    { t: 'list', items: [
      'Test your search on an empty list.',
      'Test it on a list with one item.',
      'Test the first locker and the last locker.',
      'Test a target that is not there.',
      'Test a target that is there many times. You may get any one of them.',
    ] },
  ],
  recap: [
    'You can say why a list that is not sorted gives a wrong answer.',
    'You can match each off-by-one bug to what it does.',
    'You can test a search on the cases that break it.',
  ],
  practice: [
    { id: 'safe-to-search', type: 'mcq', level: 1,
      q: 'Which list is safe for our binary search, as it is?',
      options: [
        '`[1, 4, 4, 9]`',
        { text: '`[4, 1, 9]`', why: 'This list is not in order. So a half you throw away may hold the target.' },
        { text: '`[9, 4, 1]`', why: 'This list runs big to small. Our code goes the wrong way on it, unless you flip the compare.' },
      ],
      answer: 0,
      explain: 'Repeats are fine. Each item is the same as the one before it or bigger, so the order holds.',
      hints: ['Check each pair of neighbours.'],
    },
    { id: 'bug-hides', type: 'predict', level: 2,
      q: 'This search has the bug `lo = mid`. What will the screen show?',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid
                else:
                    hi = mid - 1
            return -1

        print(find([2, 4], 2))
      `,
      options: [
        '0',
        { text: '-1', why: 'The first mid is 0, and locker 0 holds the target. So `return mid` runs first.' },
        { text: 'It never stops', why: 'That needs `lo = mid` to run. This target is found first, so that line never runs.' },
      ],
      answer: 0,
      explain: 'The bug is there, but this target never reaches it. So one good test proves little. Try many targets.',
      hints: ['Work out the first mid.', 'Does the line `lo = mid` ever run here?'],
    },
    { id: 'fix-hi', type: 'fix', level: 2,
      q: 'This search stops with an IndexError when the target is bigger than every item. Fix it.',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items)
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
      `,
      answer: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
      `,
      tests: [
        { label: 'find([1, 3, 5], 9)', call: 'find([1, 3, 5], 9)', want: '-1' },
        { label: 'find([1, 3, 5], 5)', call: 'find([1, 3, 5], 5)', want: '2' },
        { label: 'find([], 5)', call: 'find([], 5)', want: '-1' },
      ],
      explain: 'With 3 items, the last locker is 2. `hi = len(items)` lets mid reach locker 3, which does not exist.',
      hints: ['What is hi for a list of 3 items?', 'Which line sets the end of the window?'],
    },
    { id: 'fix-last-one', type: 'fix', level: 2,
      q: 'This search misses the target when one locker is left. Fix one line.',
      code: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
      `,
      answer: py`
        def find(items, target):
            lo = 0
            hi = len(items) - 1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    return mid
                if items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return -1
      `,
      tests: [
        { label: 'find([5], 5)', call: 'find([5], 5)', want: '0' },
        { label: 'find([1, 3, 5], 5)', call: 'find([1, 3, 5], 5)', want: '2' },
        { label: 'find([1, 3, 5], 4)', call: 'find([1, 3, 5], 4)', want: '-1' },
      ],
      explain: 'When lo equals hi, one locker still needs a look. `<=` lets that trip run.',
      hints: ['What are lo and hi when one locker is left?', 'Look at the `while` line.'],
    },
    { id: 'first-spot', type: 'write', level: 3,
      q: 'Stretch: write `first_spot(items, target)` with no bisect tool. `items` is sorted and may have repeats. It hands back the first spot of target, or -1.',
      starter: py`
        def first_spot(items, target):
            # Your code here.
            return -1
      `,
      answer: py`
        def first_spot(items, target):
            lo = 0
            hi = len(items) - 1
            best = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if items[mid] == target:
                    best = mid
                    hi = mid - 1
                elif items[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return best
      `,
      tests: [
        { label: 'first_spot([2, 4, 4, 4, 7], 4)', call: 'first_spot([2, 4, 4, 4, 7], 4)', want: '1' },
        { label: 'first_spot([2, 4, 7], 7)', call: 'first_spot([2, 4, 7], 7)', want: '2' },
        { label: 'first_spot([2, 4, 7], 5)', call: 'first_spot([2, 4, 7], 5)', want: '-1' },
        { label: 'first_spot([5, 5], 5)', call: 'first_spot([5, 5], 5)', want: '0' },
        { label: 'first_spot([], 5)', call: 'first_spot([], 5)', want: '-1' },
      ],
      explain: 'A match does not end the search. Save the spot in best, then keep looking further left. The other moves stay the same.',
      hints: ['Keep a name `best` that starts at -1.', 'On a match, save mid and move hi to the left of it.', 'The other 2 moves stay as they were.'],
    },
  ],
});
