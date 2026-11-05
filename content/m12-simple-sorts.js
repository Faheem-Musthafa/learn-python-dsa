/* Module 12: Simple Sorting. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm12-simple-sorts',
  num: 12, part: 2, level: 'B/I',
  title: 'Simple Sorting',
  blurb: 'Put things in order with your own code, then with the tools Python gives you.',
  needs: ['m08-big-o', 'm09-arrays'],
});

// ---------------------------------------------------------------- lesson 12.1
Course.lesson('m12-simple-sorts', {
  id: '12-1-selection-bubble',
  num: '12.1',
  title: 'Selection sort and bubble sort',
  goal: 'You can trace selection sort and bubble sort by hand, and count their comparisons.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How would you put cards in order?' },
    { t: 'p', text: 'You hold 4 number cards. You can see the smallest at a glance. Python cannot. It can only compare 2 items at a time.' },
    { t: 'q', id: 'spark-smallest', type: 'mcq', level: 1,
      q: 'The list is `[5, 2, 8, 1]`. Python compares 2 items at a time. How many comparisons does it need to be sure which is smallest?',
      options: [
        { text: '1', why: 'That is how it feels when you look at the cards. Python must check them in pairs.' },
        '3',
        { text: '4', why: 'The first item needs no comparison of its own. It is the smallest so far.' },
      ],
      answer: 1,
      explain: 'Start with 5 as the smallest so far. Then compare with 2, with 8 and with 1.',
      hints: ['Keep a smallest so far.', 'How many other items must you check it against?'],
    },
    { t: 'words', items: [
      { word: 'selection sort', means: 'Find the smallest item, put it first, then repeat with the rest.' },
      { word: 'bubble sort', means: 'Compare neighbours and swap them if they are out of order. Repeat until none swap.' },
      { word: 'pass', means: 'One trip through the part of the list that is not done yet.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'You lay your cards in a row, then put them in order, one at a time. Unlike you, Python sees only 2 cards at each step. So we count those steps.' },
    { t: 'big', text: 'Each [[pass]] puts one more item in its final place. The sorted part grows until nothing is left.' },
    { t: 'steps', title: 'Selection sort, one pass', items: [
      { label: 'Find the smallest', text: 'Scan the unsorted part. Keep the spot of the smallest so far.' },
      { label: 'Swap it into place', text: 'Swap that item with the first unsorted item.' },
      { label: 'Grow the sorted part', text: 'That spot is done. The next pass starts one spot later.' },
    ] },
    { t: 'viz', name: 'm12-selection', caption: 'Guess before each step. Then type your own list. Try one with repeats, and one already in order.' },
    { t: 'q', id: 'count-selection', type: 'trace', level: 2,
      q: 'Sort `[5, 2, 8, 1]` by hand with [[selection sort]]. Fill in the comparisons and the list after each pass.',
      code: py`
        a = [5, 2, 8, 1]
        for i in range(3):
            s = i
            for j in range(i + 1, 4):
                if a[j] < a[s]:
                    s = j
            a[i], a[s] = a[s], a[i]
      `,
      head: ['pass', 'comparisons', 'list'],
      rows: [['1', '3', '[1,2,8,5]'], ['2', '2', '[1,2,8,5]'], ['3', '1', '[1,2,5,8]']],
      given: 1,
      verify: py`
        a = [5, 2, 8, 1]
        for i in range(3):
            count = 0
            s = i
            for j in range(i + 1, 4):
                count = count + 1
                if a[j] < a[s]:
                    s = j
            a[i], a[s] = a[s], a[i]
            print(i + 1, count, str(a).replace(" ", ""))
      `,
      explain: 'The comparisons shrink by one each pass: 3, then 2, then 1. That is 6 for 4 items.',
      hints: ['Pass 2 starts at spot 1, so it ignores the 1 in spot 0.', 'Sometimes the smallest is already in place.'],
    },
    { t: 'code', caption: 'A count shows the work. Change the list, then guess the count. Words work too, not only numbers.',
      code: py`
        def selection_sort(a):
            count = 0
            for i in range(len(a) - 1):
                smallest = i
                for j in range(i + 1, len(a)):
                    count = count + 1
                    if a[j] < a[smallest]:
                        smallest = j
                a[i], a[smallest] = a[smallest], a[i]
            return count

        nums = [5, 2, 8, 1]
        print(selection_sort(nums), nums)
        words = ["pear", "fig", "kiwi"]
        print(selection_sort(words), words)
        print(selection_sort([1, 2, 3, 4]))
      `,
      output: "6 [1, 2, 5, 8]\n3 ['fig', 'kiwi', 'pear']\n6",
    },
    { t: 'table', caption: 'Selection sort always compares this many times', head: ['Items', 'Sum', 'Comparisons'], rows: [
      ['4', '3 + 2 + 1', '6'],
      ['8', '7 + 6 + ... + 1', '28'],
      ['16', '15 + 14 + ... + 1', '120'],
    ] },
    { t: 'p', text: 'Twice the items gives about 4 times the comparisons. That is **O(n^2)**. Even a list already in order takes all 6, because selection sort never checks for that.' },
    { t: 'h', text: 'What if only neighbours may swap?' },
    { t: 'p', text: '[[Bubble sort]] looks at 2 neighbours. If the left one is bigger, they swap. So the biggest value keeps moving right, and it reaches the end in one pass.' },
    { t: 'viz', name: 'm12-bubble', caption: 'Watch the biggest value rise. Then type a list already in order, and see the early stop.' },
    { t: 'q', id: 'one-pass', type: 'predict', level: 2,
      q: 'This is one pass of bubble sort. What will the screen show?',
      code: py`
        a = [4, 1, 3, 2]
        for j in range(3):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
        print(a)
      `,
      options: [
        { text: '[1, 2, 3, 4]', why: 'You may expect one pass to finish the job. One pass only sends the biggest value to the end.' },
        '[1, 3, 2, 4]',
        { text: '[1, 4, 3, 2]', why: 'This stops after the first swap. The loop goes on and keeps carrying the 4.' },
      ],
      answer: 1,
      explain: 'The 4 swaps with 1, then 3, then 2. So 4 reaches the end, and 3 and 2 are still out of order.',
      hints: ['Write the list again after each trip of the loop.', 'Where is the 4 after each trip?'],
    },
    { t: 'q', id: 'order-pass', type: 'order', level: 2,
      q: 'Put the lines in order to do one pass. The goal is to print `[1, 3, 2, 4]`. One line does not belong.',
      lines: ['a = [4, 1, 3, 2]', 'for j in range(len(a) - 1):', '    if a[j] > a[j + 1]:', '        a[j], a[j + 1] = a[j + 1], a[j]', 'print(a)'],
      extra: ['for j in range(len(a)):'],
      output: '[1, 3, 2, 4]',
      explain: 'The loop must stop one spot early. On the last spot, `a[j + 1]` would not exist.',
      hints: ['What is `a[j + 1]` when j is the last index?'],
    },
    { t: 'code', caption: 'If a pass makes no swaps, the list is sorted, so `break` stops early. Compare the first count with the second.',
      code: py`
        def bubble_sort(a):
            count = 0
            for i in range(len(a) - 1):
                swapped = False
                for j in range(len(a) - 1 - i):
                    count = count + 1
                    if a[j] > a[j + 1]:
                        a[j], a[j + 1] = a[j + 1], a[j]
                        swapped = True
                if not swapped:
                    break
            return count

        print(bubble_sort([1, 2, 3, 4]))
        print(bubble_sort([4, 3, 2, 1]))
        print(bubble_sort([]))
      `,
      output: '3\n6\n0',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Selection sort', cost: 'O(n^2)', why: 'Always, in any order. But it makes at most n - 1 swaps.' },
      { op: 'Bubble sort, worst case', cost: 'O(n^2)', why: 'A reversed list needs every pass, and it swaps on every comparison.' },
      { op: 'Bubble sort, already in order', cost: 'O(n)', why: 'One pass with no swaps, and then `break`.' },
    ] },
    { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
      ['"smallest first, then the next"', 'Selection sort is this idea.'],
      ['"writing is costly", "few swaps"', 'Selection sort makes at most n - 1 swaps.'],
      ['"swap neighbours only"', 'Bubble sort is this idea.'],
    ] },
    { t: 'trap',
      think: 'Bubble sort is the good one. Everyone talks about it.',
      real: 'It is famous because it is short to explain. It often makes far more swaps than selection sort. Lesson 12.2 shows a better simple sort.',
    },
  ],
  recap: [
    'You can trace selection sort, pass by pass.',
    'You can trace bubble sort, and spot the early stop.',
    'Both take O(n^2) comparisons in the worst case.',
  ],
  practice: [
    { id: 'after-one', type: 'mcq', level: 1,
      q: 'After the first pass of selection sort, what is sure to be true?',
      options: [
        'The smallest item is in spot 0',
        { text: 'The biggest item is at the end', why: 'That is what a bubble sort pass does. Selection sort picks the smallest.' },
        { text: 'The whole list is sorted', why: 'One pass places only one item. The others may still be out of order.' },
      ],
      answer: 0,
      explain: 'Each pass finds the smallest of the unsorted part. It goes to the front of that part.',
      hints: ['What does the pass look for?'],
    },
    { id: 'bubble-one', type: 'predict', level: 1,
      q: 'One pass of bubble sort. Type what the screen will show.',
      code: py`
        a = [3, 1, 2]
        for j in range(2):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
        print(a)
      `,
      answer: '[1, 2, 3]',
      why: 'The 3 swaps with 1, then with 2.',
      explain: 'The 3 moves all the way to the end. On this short list, that happens to finish the job.',
      hints: ['Write the list after each trip.'],
    },
    { id: 'hand-trace-six', type: 'trace', level: 2,
      q: 'Sort these 6 numbers by hand with selection sort. Write the list after each pass.',
      code: py`
        a = [6, 3, 9, 1, 7, 2]
        for i in range(5):
            s = i
            for j in range(i + 1, 6):
                if a[j] < a[s]:
                    s = j
            a[i], a[s] = a[s], a[i]
      `,
      head: ['pass', 'list'],
      rows: [['1', '[1,3,9,6,7,2]'], ['2', '[1,2,9,6,7,3]'], ['3', '[1,2,3,6,7,9]'], ['4', '[1,2,3,6,7,9]'], ['5', '[1,2,3,6,7,9]']],
      given: 1,
      verify: py`
        a = [6, 3, 9, 1, 7, 2]
        for i in range(5):
            s = i
            for j in range(i + 1, 6):
                if a[j] < a[s]:
                    s = j
            a[i], a[s] = a[s], a[i]
            print(i + 1, str(a).replace(" ", ""))
      `,
      explain: 'The list is in order after pass 3. Selection sort cannot tell, so it does passes 4 and 5 too.',
      hints: ['Each pass ignores the spots already done.', 'A pass can change nothing, if the smallest is in place.'],
    },
    { id: 'fix-smallest', type: 'fix', level: 2,
      q: 'This selection sort gives the wrong order. One line is off. Fix it.',
      code: py`
        def selection_sort(a):
            for i in range(len(a) - 1):
                smallest = 0
                for j in range(i + 1, len(a)):
                    if a[j] < a[smallest]:
                        smallest = j
                a[i], a[smallest] = a[smallest], a[i]
      `,
      answer: py`
        def selection_sort(a):
            for i in range(len(a) - 1):
                smallest = i
                for j in range(i + 1, len(a)):
                    if a[j] < a[smallest]:
                        smallest = j
                a[i], a[smallest] = a[smallest], a[i]
      `,
      tests: [
        { label: '[3, 1, 2] gets sorted', check: '(lambda a: (selection_sort(a), a)[1] == [1, 2, 3])([3, 1, 2])' },
        { label: '[4, 2, 2, 1] gets sorted', check: '(lambda a: (selection_sort(a), a)[1] == [1, 2, 2, 4])([4, 2, 2, 1])' },
        { label: 'An empty list', check: '(lambda a: (selection_sort(a), a)[1] == [])([])' },
      ],
      explain: 'Each pass must start its search at spot i. Spot 0 is already done after the first pass.',
      hints: ['Trace pass 2. Where should its search start?', 'Look at the line that sets smallest.'],
    },
    { id: 'is-sorted', type: 'write', level: 2,
      q: 'Write `is_sorted(nums)`. It gives back `True` if every item is less than or equal to the next.',
      starter: py`
        def is_sorted(nums):
            # Compare each pair of neighbours.
            return False
      `,
      answer: py`
        def is_sorted(nums):
            for i in range(len(nums) - 1):
                if nums[i] > nums[i + 1]:
                    return False
            return True
      `,
      tests: [
        { label: 'is_sorted([1, 2, 3])', call: 'is_sorted([1, 2, 3])', want: 'True' },
        { label: 'is_sorted([1, 3, 2])', call: 'is_sorted([1, 3, 2])', want: 'False' },
        { label: 'Duplicates', call: 'is_sorted([2, 2, 3])', want: 'True' },
        { label: 'One item', call: 'is_sorted([7])', want: 'True' },
        { label: 'An empty list', call: 'is_sorted([])', want: 'True' },
      ],
      explain: 'One pass over the neighbours is enough, so this is O(n). A list of 0 or 1 items has no pairs to fail.',
      hints: ['Loop over the spots, but stop one early.', 'If any pair is out of order, you can answer at once.'],
    },
    { id: 'write-selection', type: 'write', level: 2,
      q: 'Write `selection_sort(a)`. It sorts the list in place, smallest first, and hands back nothing.',
      starter: py`
        def selection_sort(a):
            # Your code here.
            return None
      `,
      answer: py`
        def selection_sort(a):
            for i in range(len(a) - 1):
                smallest = i
                for j in range(i + 1, len(a)):
                    if a[j] < a[smallest]:
                        smallest = j
                a[i], a[smallest] = a[smallest], a[i]
      `,
      tests: [
        { label: '[3, 1, 2] gets sorted', check: '(lambda a: (selection_sort(a), a)[1] == [1, 2, 3])([3, 1, 2])' },
        { label: 'Duplicates', check: '(lambda a: (selection_sort(a), a)[1] == [1, 1, 2, 2])([2, 1, 2, 1])' },
        { label: 'One item', check: '(lambda a: (selection_sort(a), a)[1] == [5])([5])' },
        { label: 'An empty list', check: '(lambda a: (selection_sort(a), a)[1] == [])([])' },
      ],
      explain: 'The outer loop picks the spot to fill. The inner loop finds the smallest item to put there.',
      hints: ['Use one loop for the spot to fill, and one loop to search.', 'Keep the spot of the smallest, not its value.', 'Swap once, after the inner loop ends.'],
    },
    { id: 'count-swaps-write', type: 'write', level: 3,
      q: 'Stretch: write `count_swaps(nums)`. It does a bubble sort and gives back how many swaps it made.',
      starter: py`
        def count_swaps(nums):
            # Your code here.
            return 0
      `,
      answer: py`
        def count_swaps(nums):
            swaps = 0
            for i in range(len(nums) - 1):
                for j in range(len(nums) - 1 - i):
                    if nums[j] > nums[j + 1]:
                        nums[j], nums[j + 1] = nums[j + 1], nums[j]
                        swaps = swaps + 1
            return swaps
      `,
      tests: [
        { label: 'count_swaps([3, 2, 1])', call: 'count_swaps([3, 2, 1])', want: '3' },
        { label: 'count_swaps([1, 2, 3])', call: 'count_swaps([1, 2, 3])', want: '0' },
        { label: 'Duplicates do not swap', call: 'count_swaps([2, 2, 1])', want: '2' },
        { label: 'An empty list', call: 'count_swaps([])', want: '0' },
      ],
      explain: 'Each swap fixes one pair that is out of order. So the count tells you how mixed up the list was.',
      hints: ['Start from the bubble sort in this lesson.', 'Add 1 to a count each time you swap.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 12.2
Course.lesson('m12-simple-sorts', {
  id: '12-2-insertion-sort',
  num: '12.2',
  title: 'Insertion sort, and why nearly sorted is fast',
  goal: 'You can trace insertion sort, and say why nearly sorted lists are fast.',
  mins: 13,
  steps: [
    { t: 'h', text: 'How do you add a card to your hand?' },
    { t: 'p', text: 'Your hand is already in order: 2, 5, 8. You pick up a 6. You do not start again. You look from the right until it fits.' },
    { t: 'q', id: 'spark-hand', type: 'mcq', level: 1,
      q: 'Your hand is 2, 5, 8, and you hold a 6. You check from the right. How many cards do you look at?',
      options: [
        { text: '1', why: 'After 8 you know the 6 goes further left. You still need to know if it passes the 5.' },
        '2',
        { text: '3', why: 'You can stop at the 5, because it is not bigger than 6. The 2 stays unseen.' },
      ],
      answer: 1,
      explain: 'You look at 8, which is bigger. You look at 5, which is not. So the 6 goes between them.',
      hints: ['Start with the 8. Is it bigger than 6?', 'When can you stop looking?'],
    },
    { t: 'words', items: [
      { word: 'insertion sort', means: 'Take the next item and slide it back into the sorted part. Repeat.' },
      { word: 'nearly sorted', means: 'A list where almost every item is close to its final place.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'This is how many people sort cards in their hand. Unlike your hand, a list has no room between items. So every bigger item must [[shift]] one spot, and we count each one.' },
    { t: 'big', text: 'Everything left of the line is sorted. Take the next item, and slide it into its place.' },
    { t: 'steps', title: 'Insertion sort, one item', items: [
      { label: 'Pick it up', text: 'Put a name on the next item. Its spot is now free to use.', code: 'held = a[i]' },
      { label: 'Shift bigger items', text: 'Move left. Each item bigger than held shifts one spot right.', code: 'a[j + 1] = a[j]' },
      { label: 'Drop it in', text: 'Stop at an item that is not bigger, or at the front.', code: 'a[j + 1] = held' },
    ] },
    { t: 'viz', name: 'm12-insertion', caption: 'Guess the landing spot each time. Then type your own list. Try one with repeats.' },
    { t: 'q', id: 'count-by-hand', type: 'trace', level: 2,
      q: 'Count by hand. Find the comparisons and shifts for each list of 4.',
      code: py`
        for i in range(1, len(a)):
            held = a[i]
            j = i - 1
            while j >= 0 and a[j] > held:
                a[j + 1] = a[j]
                j = j - 1
            a[j + 1] = held
      `,
      head: ['list', 'comparisons', 'shifts'],
      rows: [['[1,2,3,4]', '3', '0'], ['[1,3,2,4]', '4', '1'], ['[4,3,2,1]', '6', '6']],
      given: 1,
      verify: py`
        for a in [[1, 2, 3, 4], [1, 3, 2, 4], [4, 3, 2, 1]]:
            start = str(a).replace(" ", "")
            c = 0
            m = 0
            for i in range(1, len(a)):
                held = a[i]
                j = i - 1
                while j >= 0:
                    c = c + 1
                    if a[j] > held:
                        a[j + 1] = a[j]
                        m = m + 1
                        j = j - 1
                    else:
                        break
                a[j + 1] = held
            print(start, c, m)
      `,
      explain: 'A list in order needs 1 comparison per item. A reversed list makes each item travel to the front.',
      hints: ['Do one item at a time, for i = 1, 2 and 3.', 'Count one comparison each time you ask "is it bigger?"'],
    },
    { t: 'code', caption: 'Each count matches what you found by hand. Try `[1, 2, 3, 5, 4, 6]` and guess first.',
      code: py`
        def insertion_sort(a):
            c = 0
            m = 0
            for i in range(1, len(a)):
                held = a[i]
                j = i - 1
                while j >= 0:
                    c = c + 1
                    if a[j] > held:
                        a[j + 1] = a[j]
                        m = m + 1
                        j = j - 1
                    else:
                        break
                a[j + 1] = held
            return c, m

        print(insertion_sort([1, 2, 3, 4]))
        print(insertion_sort([1, 3, 2, 4]))
        print(insertion_sort([4, 3, 2, 1]))
        print(insertion_sort([]))
      `,
      output: '(3, 0)\n(4, 1)\n(6, 6)\n(0, 0)',
    },
    { t: 'h', text: 'Which sort wins?' },
    { t: 'p', text: 'It depends on your list. In a list that is [[nearly sorted]], each item moves only a little. So each search stops after a look or two.' },
    { t: 'code', caption: 'All 3 lists hold 1,000 numbers. Guess each count, then run it. Try swapping more neighbours.',
      code: py`
        def count_looks(a):
            c = 0
            for i in range(1, len(a)):
                held = a[i]
                j = i - 1
                while j >= 0:
                    c = c + 1
                    if a[j] <= held:
                        break
                    a[j + 1] = a[j]
                    j = j - 1
                a[j + 1] = held
            return c

        in_order = [i for i in range(1000)]
        nearly = [i for i in range(1000)]
        nearly[500], nearly[501] = nearly[501], nearly[500]
        backward = [999 - i for i in range(1000)]
        print(count_looks(in_order))
        print(count_looks(nearly))
        print(count_looks(backward))
      `,
      output: '999\n1000\n499500',
    },
    { t: 'viz', name: 'm12-race', caption: 'Race on your own list. Try `8 7 6 5 4 3 2 1`, then `1 2 3 4 5 6 7 8`, then `2 3 4 5 6 1`.' },
    { t: 'cost', title: 'How fast is insertion sort?', items: [
      { op: 'Worst case', cost: 'O(n^2)', why: 'In a reversed list, each item travels all the way to the front.' },
      { op: 'Already in order', cost: 'O(n)', why: 'Each item needs one look, and nothing shifts.' },
      { op: 'Nearly sorted', cost: 'Near O(n)', why: 'Each item moves only a few spots.' },
    ] },
    { t: 'q', id: 'fill-insertion', type: 'fill', level: 2,
      q: 'Fill the gaps. This slides 3 into its place in a sorted part.',
      code: py`
        a = [1, 4, 6, 3]
        held = a[3]
        j = 2
        while j >= 0 and a[j] ____ held:
            a[j + 1] = ____
            j = j - 1
        a[j + 1] = held
        print(a)
      `,
      blanks: ['>', 'a[j]'],
      output: '[1, 3, 4, 6]',
      explain: 'While the item is bigger than held, it shifts one spot right.',
      hints: ['Which items need to shift: the bigger ones or the smaller ones?', 'Spot j + 1 gets a copy of what is in spot j.'],
    },
    { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
      ['"almost in order", "nearly sorted"', 'Insertion sort does very little work.'],
      ['"new items keep arriving"', 'Slide each one into the sorted part.'],
      ['"a very short list"', 'Any simple sort is fine, and insertion is a good pick.'],
    ] },
    { t: 'trap',
      think: 'When j reaches -1, Python stops me, because that spot does not exist.',
      real: 'Spot -1 does exist. It is the last item! So keep `j >= 0` in the loop, and keep it first.',
      code: py`
        while j >= 0 and a[j] > held:   # safe
        while a[j] > held:              # j can go below 0
      `,
    },
  ],
  recap: [
    'You can trace insertion sort, one item at a time.',
    'It takes O(n^2) comparisons in the worst case.',
    'On a list nearly in order, it is close to O(n).',
  ],
  practice: [
    { id: 'left-part', type: 'mcq', level: 1,
      q: 'Insertion sort has finished the item at spot 2. What is sure to be true?',
      options: [
        { text: 'Spots 0 to 2 hold the 3 smallest items of the whole list', why: 'That is true for selection sort. Insertion sort has not seen the items on the right yet.' },
        'Spots 0 to 2 are in order',
        { text: 'The whole list is sorted', why: 'The items to the right of spot 2 have not been touched yet.' },
      ],
      answer: 1,
      explain: 'The left part is in order, but a later item can still slide into it.',
      hints: ['Has it looked at the items to the right yet?'],
    },
    { id: 'one-insert', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        a = [2, 7, 9, 5]
        held = a[3]
        j = 2
        while j >= 0 and a[j] > held:
            a[j + 1] = a[j]
            j = j - 1
        a[j + 1] = held
        print(a)
      `,
      answer: '[2, 5, 7, 9]',
      why: '9 and 7 shift right, and 5 lands after 2.',
      explain: '9 and 7 are bigger than 5, so they shift. 2 is not bigger, so the search stops there.',
      hints: ['Which items are bigger than 5?'],
    },
    { id: 'trace-five', type: 'trace', level: 2,
      q: 'Sort by hand with insertion sort. Write the list after each item is placed.',
      code: py`
        a = [5, 2, 4, 1, 3]
        for i in range(1, 5):
            held = a[i]
            j = i - 1
            while j >= 0 and a[j] > held:
                a[j + 1] = a[j]
                j = j - 1
            a[j + 1] = held
      `,
      head: ['i', 'held', 'list'],
      rows: [['1', '2', '[2,5,4,1,3]'], ['2', '4', '[2,4,5,1,3]'], ['3', '1', '[1,2,4,5,3]'], ['4', '3', '[1,2,3,4,5]']],
      given: 1,
      verify: py`
        a = [5, 2, 4, 1, 3]
        for i in range(1, 5):
            held = a[i]
            j = i - 1
            while j >= 0 and a[j] > held:
                a[j + 1] = a[j]
                j = j - 1
            a[j + 1] = held
            print(i, held, str(a).replace(" ", ""))
      `,
      explain: 'Each row grows the sorted part by one. The items on the right do not change until their turn.',
      hints: ['Only the part up to spot i can change.', 'Slide held left until it fits.'],
    },
    { id: 'pick-sort', type: 'mcq', level: 2,
      q: 'You have 1,000 items in order, except that 2 neighbours are swapped. Which sort does the fewest comparisons?',
      options: [
        { text: 'Selection sort', why: 'Selection sort scans the whole unsorted part on every pass, whatever the order.' },
        'Insertion sort',
        { text: 'They all do the same', why: 'The order of the list changes the work for insertion sort. Count [1, 3, 2, 4] again.' },
      ],
      answer: 1,
      explain: 'Nearly every item needs one look. So it takes about 1,000 comparisons, not about 500,000.',
      hints: ['How far must each item travel?'],
    },
    { id: 'fix-minus-one', type: 'fix', level: 2,
      q: 'Python stops on some lists. Spot -1 is the problem here. Fix the `while` line.',
      code: py`
        def insertion_sort(a):
            for i in range(1, len(a)):
                held = a[i]
                j = i - 1
                while a[j] > held:
                    a[j + 1] = a[j]
                    j = j - 1
                a[j + 1] = held
      `,
      answer: py`
        def insertion_sort(a):
            for i in range(1, len(a)):
                held = a[i]
                j = i - 1
                while j >= 0 and a[j] > held:
                    a[j + 1] = a[j]
                    j = j - 1
                a[j + 1] = held
      `,
      tests: [
        { label: '[2, 1] gets sorted', check: '(lambda a: (insertion_sort(a), a)[1] == [1, 2])([2, 1])' },
        { label: '[3, 2, 1] gets sorted', check: '(lambda a: (insertion_sort(a), a)[1] == [1, 2, 3])([3, 2, 1])' },
        { label: 'Already in order', check: '(lambda a: (insertion_sort(a), a)[1] == [1, 2])([1, 2])' },
      ],
      explain: 'Spot -1 is the last item, so the loop does not stop at the front. `j >= 0` stops it there.',
      hints: ['What happens when j reaches -1?', 'The loop should also check that j is still inside the list.'],
    },
    { id: 'write-insertion', type: 'write', level: 2,
      q: 'Write `insertion_sort(a)`. It sorts the list in place, smallest first, and hands back nothing.',
      starter: py`
        def insertion_sort(a):
            # Your code here.
            return None
      `,
      answer: py`
        def insertion_sort(a):
            for i in range(1, len(a)):
                held = a[i]
                j = i - 1
                while j >= 0 and a[j] > held:
                    a[j + 1] = a[j]
                    j = j - 1
                a[j + 1] = held
      `,
      tests: [
        { label: '[3, 1, 2] gets sorted', check: '(lambda a: (insertion_sort(a), a)[1] == [1, 2, 3])([3, 1, 2])' },
        { label: 'Duplicates', check: '(lambda a: (insertion_sort(a), a)[1] == [1, 1, 2, 2])([2, 1, 2, 1])' },
        { label: 'One item', check: '(lambda a: (insertion_sort(a), a)[1] == [5])([5])' },
        { label: 'An empty list', check: '(lambda a: (insertion_sort(a), a)[1] == [])([])' },
      ],
      explain: 'The outer loop picks up each item in turn. The inner loop shifts bigger items until held fits.',
      hints: ['Start the outer loop at spot 1.', 'Put a name on `a[i]` before you shift anything.', 'After the inner loop, held goes in spot j + 1.'],
    },
    { id: 'sort-by-len', type: 'write', level: 3,
      q: 'Stretch: write `sort_by_len(words)`, with insertion sort. Shortest words come first. Words of the same length must keep their order.',
      starter: py`
        def sort_by_len(words):
            # Use insertion sort. Do not use sorted.
            return words
      `,
      answer: py`
        def sort_by_len(words):
            for i in range(1, len(words)):
                held = words[i]
                j = i - 1
                while j >= 0 and len(words[j]) > len(held):
                    words[j + 1] = words[j]
                    j = j - 1
                words[j + 1] = held
            return words
      `,
      tests: [
        { label: 'Ties keep their order', call: 'sort_by_len(["bee", "ox", "cat", "a"])', want: '["a", "ox", "bee", "cat"]' },
        { label: 'All the same length', call: 'sort_by_len(["dog", "ant"])', want: '["dog", "ant"]' },
        { label: 'One word', call: 'sort_by_len(["hi"])', want: '["hi"]' },
        { label: 'No words', call: 'sort_by_len([])', want: '[]' },
      ],
      explain: 'Use `>` and not `>=`. A word of the same length does not shift, so ties keep their order.',
      hints: ['Compare `len(words[j])` with `len(held)`.', 'What should happen when two lengths are equal?'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 12.3
Course.lesson('m12-simple-sorts', {
  id: '12-3-python-sort',
  num: '12.3',
  title: "Python's sorted and sort",
  goal: 'You can pick `sorted` or `.sort`, use `key` and `reverse`, and trust that ties keep order.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Do you ever write your own sort?' },
    { t: 'p', text: 'In real programs, almost never. Python already has a very good one. You met `sorted` in Module 5. Lists also have a tool called `.sort`. Are they the same?' },
    { t: 'q', id: 'spark-none', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        a = [3, 1, 2]
        b = a.sort()
        print(b)
      `,
      options: [
        { text: '[1, 2, 3]', why: 'You may think `.sort` hands back a sorted list. `sorted` does that, but `.sort` hands back None.' },
        { text: '[3, 1, 2]', why: 'This is the old order of the list. b names what `.sort` hands back.' },
        'None',
      ],
      answer: 2,
      explain: '`.sort` changes the list itself and hands back `None`. So it works like `append`.',
      hints: ['Think back to `x = nums.append(4)`.'],
    },
    { t: 'words', items: [
      { word: 'stable', means: 'A sort is stable when items that tie keep the order they came in.' },
      { word: 'Timsort', means: 'The name of the sorting method Python uses.', say: 'TIM-sort' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Kids stand in a line. A teacher says: sort by grade. Kids with the same grade stay in their line order. Unlike a real line, `sorted` leaves the first line alone and makes a new one.' },
    { t: 'viz', name: 'm12-two-tools', caption: 'Follow the tags. Type your own list, then try an empty one.' },
    { t: 'table', caption: 'Which tool should you use?', head: ['', '`sorted(x)`', '`x.sort()`'], rows: [
      ['What it hands back', 'A new list', '`None`'],
      ['Does x change?', 'No', 'Yes, in place'],
      ['What can x be?', 'Anything you can loop over', 'A list only'],
      ['Use it when', 'You need to keep the old order', 'You are happy to lose the old order'],
    ] },
    { t: 'code', caption: 'sorted works on a string or a tuple too, and always hands back a list. Try your own word.',
      code: py`
        nums = [3, 1, 2]
        print(sorted(nums))
        print(nums)
        nums.sort()
        print(nums)
        print(sorted("cat"))
        print(sorted((9, 4)))
      `,
      output: "[1, 2, 3]\n[3, 1, 2]\n[1, 2, 3]\n['a', 'c', 't']\n[4, 9]",
    },
    { t: 'h', text: 'What can you tell it to do?' },
    { t: 'p', text: 'Both tools take the same 2 extras. A [[sort key]] picks what to compare, as you saw in Module 5. `reverse=True` puts the order the other way round.' },
    { t: 'code', caption: 'Capital letters come before small ones, so `str.lower` gives dictionary order.',
      code: py`
        words = ["kiwi", "Fig", "apple"]
        print(sorted(words))
        print(sorted(words, key=str.lower))
        print(sorted(words, key=len))
        print(sorted(words, key=len, reverse=True))
      `,
      output: "['Fig', 'apple', 'kiwi']\n['apple', 'Fig', 'kiwi']\n['Fig', 'kiwi', 'apple']\n['apple', 'kiwi', 'Fig']",
    },
    { t: 'code', error: true, caption: 'Run it. Python cannot say which comes first, 3 or "a". So it stops with a `TypeError`.',
      code: py`
        print(sorted([3, "a", 1]))
      `,
    },
    { t: 'h', text: 'What happens to items that tie?' },
    { t: 'p', text: 'Python\'s sort is [[stable]]. Items that tie stay in the order they came. You can count on it. It holds with `reverse=True` too.' },
    { t: 'viz', name: 'm12-stable', caption: 'Guess who goes first in each tie. Type your own grades, and try reverse.' },
    { t: 'q', id: 'tie-order', type: 'predict', level: 2,
      q: 'bee and cat tie on length. What will the screen show?',
      code: py`
        print(sorted(["bee", "ox", "cat"], key=len, reverse=True))
      `,
      options: [
        "['bee', 'cat', 'ox']",
        { text: "['cat', 'bee', 'ox']", why: 'You may think reverse flips the ties too. Ties keep the order they came in.' },
        { text: "['ox', 'bee', 'cat']", why: 'This is shortest first. `reverse=True` puts the longest first.' },
      ],
      answer: 0,
      explain: 'Longest first, so ox goes last. bee came before cat, so it stays before cat.',
      hints: ['Sort by length first.', 'Then look at the tie. Who came first?'],
    },
    { t: 'h', text: 'How do you sort by grade, then by name?' },
    { t: 'steps', title: 'Two ways to use 2 rules', noun: 'Way', items: [
      { label: 'A tuple key', text: 'Python compares tuples item by item. If the first items tie, it looks at the next.', code: 'return (kid[1], kid[0])' },
      { label: 'Sort twice', text: 'Sort by the second rule, then by the first. Stable sorting keeps the second rule inside each tie.', code: 'kids.sort(key=name)\nkids.sort(key=grade)' },
    ] },
    { t: 'code', caption: 'Both ways give the same list. Change a grade, and guess first. For high grades first, use `-kid[1]`.',
      code: py`
        kids = [("Zed", 2), ("Amy", 3), ("Bo", 2)]

        def grade_name(kid):
            return (kid[1], kid[0])

        print(sorted(kids, key=grade_name))

        def name(kid):
            return kid[0]

        def grade(kid):
            return kid[1]

        kids.sort(key=name)
        kids.sort(key=grade)
        print(kids)
      `,
      output: "[('Bo', 2), ('Zed', 2), ('Amy', 3)]\n[('Bo', 2), ('Zed', 2), ('Amy', 3)]",
    },
    { t: 'h', text: 'How fast is it?' },
    { t: 'q', id: 'count-in-order', type: 'mcq', level: 2,
      q: 'Count by hand. `[1, 2, 3, 4]` is in order. How many comparisons does it take to be sure of that?',
      options: [
        { text: '1', why: 'One pair says nothing about the others. Each neighbour pair could be the one out of order.' },
        '3',
        { text: '6', why: 'That is what selection sort does. If each neighbour pair is in order, the whole list is.' },
      ],
      answer: 1,
      explain: 'There are 3 neighbour pairs, and each takes one comparison.',
      hints: ['How many neighbour pairs do 4 items have?'],
    },
    { t: 'p', text: 'Now count what Python really does. This class adds 1 to a count each time `sorted` uses `<`. Selection sort would make 4,950 comparisons here, every time.' },
    { t: 'code', caption: 'Both lists hold 100 numbers. The first is in order, and the second is mixed up.',
      code: py`
        count = [0]

        class Num:
            def __init__(self, v):
                self.v = v

            def __lt__(self, other):
                count[0] = count[0] + 1
                return self.v < other.v

        def python_count(values):
            count[0] = 0
            sorted([Num(v) for v in values])
            return count[0]

        print(python_count([i for i in range(100)]))
        print(python_count([i * 37 % 101 for i in range(100)]))
      `,
      output: '99\n533',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`sorted`', cost: 'O(n log n)', why: 'It also needs memory for the new list.' },
      { op: '`.sort`', cost: 'O(n log n)', why: 'It changes the list in place.' },
      { op: 'Already in order', cost: 'About O(n)', why: '[[Timsort]] looks for order that is already there, and uses it.' },
      { op: '`min`, `max`', cost: 'O(n)', why: 'One scan. Do not sort if you need only the smallest.' },
    ] },
    { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
      ['"in order", "alphabetical"', '`sorted`, or `.sort` if the old order can go.'],
      ['"top 3", "smallest 5"', 'Sort, then take a slice.'],
      ['"only the smallest"', '`min` is cheaper than a sort.'],
      ['"closest pair", "any duplicates?"', 'Sort first, then compare neighbours.'],
      ['"by grade, then by name"', 'A tuple key, or 2 stable sorts.'],
    ] },
    { t: 'trap',
      think: '`nums = nums.sort()` sorts my list and keeps it in nums.',
      real: '`.sort` hands back `None`, so now nums holds `None` and your list is gone. Write `nums.sort()` on its own line.',
      code: py`
        nums = [2, 1]
        nums = nums.sort()
        print(nums)        # None
      `,
    },
  ],
  recap: [
    'You can pick sorted for a new list, or .sort to change it.',
    'You can use key and reverse.',
    'Ties keep their order, because the sort is stable.',
  ],
  practice: [
    { id: 'which-new', type: 'mcq', level: 1,
      q: 'Which one leaves `nums` as it was, and hands back a new list?',
      options: [
        '`sorted(nums)`',
        { text: '`nums.sort()`', why: 'This one changes nums in place, and hands back `None`.' },
        { text: '`nums.reverse()`', why: 'This changes nums in place too, and it does not sort.' },
      ],
      answer: 0,
      explain: '`sorted` only reads the list you give it. It builds a new one.',
      hints: ['Which one is a tool on its own, with no dot?'],
    },
    { id: 'sorted-keeps', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        a = [2, 3, 1]
        b = sorted(a)
        print(a[0])
      `,
      answer: '2',
      why: '`sorted` made a new list, so a keeps its old order.',
      explain: 'a is unchanged, so spot 0 still holds 2.',
      hints: ['Does `sorted` change a?'],
    },
    { id: 'desc-key', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        def last(word):
            return word[-1]

        print(sorted(["ab", "ca", "bb"], key=last))
      `,
      options: [
        { text: "['ab', 'bb', 'ca']", why: 'This is A to Z order for the whole word. The key compares last letters only.' },
        "['ca', 'ab', 'bb']",
        { text: "['ca', 'bb', 'ab']", why: 'ab and bb tie on their last letter. A stable sort keeps ab first, because it came first.' },
      ],
      answer: 1,
      explain: 'ca ends in a, so it goes first. ab and bb both end in b, so they keep their order.',
      hints: ['Write the last letter of each word.', 'What happens to the two that tie?'],
    },
    { id: 'fix-none', type: 'fix', level: 2,
      q: 'This should show the smallest score. Python stops on line 3. Fix line 2.',
      code: py`
        scores = [7, 3, 9]
        scores = scores.sort()
        print(scores[0])
      `,
      answer: py`
        scores = [7, 3, 9]
        scores.sort()
        print(scores[0])
      `,
      wantOutput: '3',
      explain: '`.sort` changes the list and hands back `None`. So do not save what it hands back.',
      hints: ['What does `.sort` hand back?', 'What does scores hold after line 2?'],
    },
    { id: 'grade-name', type: 'write', level: 2,
      q: 'Each kid is a (name, grade) tuple. Write `rank(kids)`. It gives back a new list, highest grade first. Ties go in A to Z name order.',
      starter: py`
        def rank(kids):
            # Your code here.
            return kids
      `,
      answer: py`
        def order(kid):
            return (-kid[1], kid[0])

        def rank(kids):
            return sorted(kids, key=order)
      `,
      tests: [
        { label: 'High grades first', call: 'rank([("Bo", 1), ("Amy", 3)])', want: '[("Amy", 3), ("Bo", 1)]' },
        { label: 'Ties by name', call: 'rank([("Zed", 2), ("Amy", 2), ("Cy", 3)])', want: '[("Cy", 3), ("Amy", 2), ("Zed", 2)]' },
        { label: 'No kids', call: 'rank([])', want: '[]' },
        { label: 'The first list stays', check: '(lambda k: (rank(k), k)[1] == [("Zed", 2), ("Amy", 2)])([("Zed", 2), ("Amy", 2)])' },
      ],
      explain: 'A minus sign puts high grades first. The name comes second in the tuple, so it settles any tie.',
      hints: ['Write a key function that returns a tuple.', 'A minus sign turns high grades into low numbers.'],
    },
    { id: 'top-three', type: 'write', level: 2,
      q: 'Write `top_three(scores)`. It gives back the 3 highest scores, highest first. There may be fewer than 3. The old list must not change.',
      starter: py`
        def top_three(scores):
            # Your code here.
            return []
      `,
      answer: py`
        def top_three(scores):
            return sorted(scores, reverse=True)[:3]
      `,
      tests: [
        { label: 'top_three([4, 9, 1, 7])', call: 'top_three([4, 9, 1, 7])', want: '[9, 7, 4]' },
        { label: 'Fewer than 3', call: 'top_three([2, 5])', want: '[5, 2]' },
        { label: 'Duplicates', call: 'top_three([5, 5, 5, 1])', want: '[5, 5, 5]' },
        { label: 'No scores', call: 'top_three([])', want: '[]' },
        { label: 'The old list stays', check: '(lambda a: (top_three(a), a)[1] == [1, 2, 3, 4])([1, 2, 3, 4])' },
      ],
      explain: 'Sort a new list with the highest first, then slice. A slice past the end does not fail.',
      hints: ['`sorted` keeps the old list safe.', 'Which extra puts the highest first?', 'Use a slice to take the first 3.'],
    },
    { id: 'closest-gap', type: 'write', level: 3,
      q: 'Stretch: write `closest_gap(nums)`. It gives back the smallest gap between any 2 numbers. With fewer than 2 numbers, give back `None`.',
      starter: py`
        def closest_gap(nums):
            # Sort first. Then which pairs do you need to check?
            return 0
      `,
      answer: py`
        def closest_gap(nums):
            if len(nums) < 2:
                return None
            a = sorted(nums)
            best = a[1] - a[0]
            for i in range(1, len(a) - 1):
                gap = a[i + 1] - a[i]
                if gap < best:
                    best = gap
            return best
      `,
      tests: [
        { label: 'closest_gap([9, 1, 4, 6])', call: 'closest_gap([9, 1, 4, 6])', want: '2' },
        { label: 'Duplicates', call: 'closest_gap([5, 2, 5])', want: '0' },
        { label: 'Two numbers', call: 'closest_gap([8, 3])', want: '5' },
        { label: 'One number', call: 'closest_gap([4])', want: 'None' },
        { label: 'No numbers', call: 'closest_gap([])', want: 'None' },
      ],
      explain: 'After a sort, the closest 2 numbers are neighbours. So you check n - 1 pairs, not every pair.',
      hints: ['After sorting, where is the closest pair sure to be?', 'Compare each item with the next one.', 'Handle short lists first.'],
    },
  ],
});
