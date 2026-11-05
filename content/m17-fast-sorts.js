/* Module 17: Faster Sorting. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm17-fast-sorts',
  num: 17, part: 2, level: 'I',
  title: 'Faster Sorting',
  blurb: 'Cut a big sort into small jobs, so it takes far fewer steps.',
  needs: ['m12-simple-sorts', 'm16-recursion'],
});

// ---------------------------------------------------------------- lesson 17.1
Course.lesson('m17-fast-sorts', {
  id: '17-1-merge-sort',
  num: '17.1',
  title: 'Merge sort: split, then merge',
  goal: 'You can merge 2 sorted lists, write merge sort, and count its steps.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Can one big sort become many small jobs?' },
    { t: 'p', text: 'Selection sort compares nearly every pair. For 1,000 items, that is about 500,000 compares. There is a better plan, and it starts with a puzzle.' },
    { t: 'q', id: 'spark-top', type: 'mcq', level: 1,
      q: 'You have 2 piles of cards. Each pile is sorted, with its smallest card on top. Where is the smallest card of all?',
      options: [
        'On top of one of the piles',
        { text: 'At the bottom of one pile', why: 'The bottom card is the biggest in its pile. Small cards sit on top.' },
        { text: 'It could be anywhere', why: 'That is true for messy piles. These piles are sorted, so only the 2 top cards matter.' },
      ],
      answer: 0,
      explain: 'Each top card is the smallest in its pile. So the smallest of all is one of those 2 cards.',
      hints: ['Which card is smallest in one sorted pile?'],
    },
    { t: 'words', items: [
      { word: 'divide and conquer', means: 'Cut a big job into smaller jobs, solve those, then join the answers.', say: 'di-VIDE and CON-ker' },
      { word: 'merge', means: 'Join 2 sorted lists into 1 sorted list.' },
      { word: 'merge sort', means: 'A sort that splits a list in half, sorts each half, then merges them.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'You hold 2 sorted piles of cards, face up. You take the smaller top card and put it down. You repeat until both piles are gone. Unlike real cards, Python copies items into a new list, so it needs extra memory.' },
    { t: 'h', text: 'How do you merge 2 piles?' },
    { t: 'viz', name: 'm17-merge-piles', caption: 'Pick the next card each time it asks. Then type your own piles. Try an empty pile, or the same number in both.' },
    { t: 'q', id: 'count-merge', type: 'trace', level: 2,
      q: 'Now count by hand. Merge `[1, 4]` and `[2, 3]`. Each row is one compare. Fill in the front cards and the card that goes next.',
      code: py`
        left = [1, 4]
        right = [2, 3]
        i = 0
        j = 0
        while i < 2 and j < 2:
            if left[i] <= right[j]:
                i = i + 1
            else:
                j = j + 1
      `,
      head: ['no.', 'left', 'right', 'next'],
      rows: [['1', '1', '2', '1'], ['2', '4', '2', '2'], ['3', '4', '3', '3']],
      given: 1,
      verify: py`
        left = [1, 4]
        right = [2, 3]
        i = 0
        j = 0
        c = 0
        while i < 2 and j < 2:
            c = c + 1
            if left[i] <= right[j]:
                print(c, left[i], right[j], left[i])
                i = i + 1
            else:
                print(c, left[i], right[j], right[j])
                j = j + 1
      `,
      explain: 'After 3 compares the right pile is empty. So 4 goes on the end with no compare at all.',
      hints: ['Start with the 2 front cards, 1 and 2.', 'When a card goes next, the card behind it becomes the new front.'],
    },
    { t: 'code', caption: 'Run it. The last line of merge adds the leftovers. One of those 2 slices is always empty.',
      code: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]

        print(merge([1, 4], [2, 3]))
        print(merge([], [5, 6]))
        print(merge([2, 2], [2]))
      `,
      output: '[1, 2, 3, 4]\n[5, 6]\n[2, 2, 2]',
    },
    { t: 'trap', think: 'Merging is free, because both piles are sorted already.',
      real: 'A merge still places every item once. Two piles with 1,000 items in all mean 1,000 items placed.',
    },
    { t: 'h', text: 'Where do the sorted piles come from?' },
    { t: 'p', text: 'You know this trick from recursion. A list of 1 item is always sorted, so that is the [[base case]]. You keep cutting until every piece has 1 item.' },
    { t: 'big', text: 'First split, with no comparing. Then merge. All the sorting happens in the merge.' },
    { t: 'steps', title: 'Merge sort in 3 moves', items: [
      { label: 'Stop if it is short', text: 'A list of 0 or 1 items is sorted.', code: 'if len(items) <= 1:\n    return items' },
      { label: 'Split and sort each half', text: 'Find the middle. Call [[merge sort]] on each half.', code: 'mid = len(items) // 2\nleft = merge_sort(items[:mid])\nright = merge_sort(items[mid:])' },
      { label: 'Merge the halves', text: 'Both halves are sorted now, so you can [[merge]] them.', code: 'return merge(left, right)' },
    ] },
    { t: 'viz', name: 'm17-merge-tree', caption: 'The top box only splits. The bottom box only merges. Watch the compares go up in one box only. Then try 6 items, or all the same number.' },
    { t: 'code', caption: 'The prints show the real order. Python finishes the left half first. Try an empty list, then one item.',
      code: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]

        def merge_sort(items):
            if len(items) <= 1:
                return items
            mid = len(items) // 2
            print("split", items[:mid], items[mid:])
            left = merge_sort(items[:mid])
            right = merge_sort(items[mid:])
            print("merge", left, right)
            return merge(left, right)

        print(merge_sort([6, 2, 8, 1]))
      `,
      output: 'split [6, 2] [8, 1]\nsplit [6] [2]\nmerge [6] [2]\nsplit [8] [1]\nmerge [8] [1]\nmerge [2, 6] [1, 8]\n[1, 2, 6, 8]',
    },
    { t: 'q', id: 'order-merge-sort', type: 'order', level: 2,
      q: 'Put the lines in order to make `merge_sort`.',
      lines: [
        'def merge_sort(items):',
        '    if len(items) <= 1:',
        '        return items',
        '    mid = len(items) // 2',
        '    left = merge_sort(items[:mid])',
        '    right = merge_sort(items[mid:])',
        '    return merge(left, right)',
      ],
      extra: ['    return left + right'],
      explain: 'The base case comes first. Then split, sort each half, and merge. `left + right` only joins them, so the result would be out of order.',
      hints: ['What must happen before any cutting?', 'The merge comes last, once both halves are sorted.'],
    },
    { t: 'h', text: 'How many steps does it take?' },
    { t: 'p', text: 'Count for 4 items, as in the picture. The merges form 2 rows. Each row places all 4 items. So that is 2 x 4, which is 8 items placed.' },
    { t: 'q', id: 'race-eight', type: 'mcq', level: 2,
      q: 'Now take 8 items. They split 8, 4, 2, 1, so the merges form 3 rows. How many items get placed in all?',
      options: [
        { text: '8', why: 'That is only one row. Each of the 3 rows places all 8 items.' },
        '24',
        { text: '64', why: 'That is 8 x 8, the kind of count selection sort has. Merge sort has only 3 rows here.' },
      ],
      answer: 1,
      explain: 'There are 3 rows, and each row places 8 items. 3 x 8 is 24.',
      hints: ['How many items does one row place?', 'Multiply that by the number of rows.'],
    },
    { t: 'code', caption: 'placed counts what you counted by hand. Try other sizes. Compare it with n x n.',
      code: py`
        def placed(n):
            if n <= 1:
                return 0
            half = n // 2
            return placed(half) + placed(n - half) + n

        for n in [4, 8, 16, 1024]:
            print(n, placed(n), n * n)
      `,
      output: '4 8 16\n8 24 64\n16 64 256\n1024 10240 1048576',
    },
    { t: 'cost', title: 'How fast is merge sort?', items: [
      { op: 'Merge 2 lists', cost: 'O(n)', why: 'Each item gets placed once.' },
      { op: 'Merge sort, any input', cost: 'O(n log n)', why: 'About log n rows, and n items in each row. A standard result.' },
      { op: 'Extra memory', cost: 'O(n)', why: 'Each slice and each merge makes a new list.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Look for these cue words: "merge 2 sorted lists", "keep ties in order", "count pairs out of order". Each one points to a split and a merge.' },
  ],
  recap: [
    'You can merge 2 sorted lists, one front card at a time.',
    'A split compares nothing. A merge does all the sorting.',
    'Merge sort places about n log n items on any input.',
  ],
  practice: [
    { id: 'which-compares', type: 'mcq', level: 1,
      q: 'Which part of merge sort compares items?',
      options: [
        { text: 'The split', why: 'This mixes up the 2 parts. A split only finds the middle and cuts.' },
        'The merge',
        { text: 'The base case', why: 'The base case only stops the calls. A list that short has nothing to compare.' },
      ],
      answer: 1,
      explain: 'A split cuts with no compares. A merge compares the front items of 2 piles.',
      hints: ['Think about the 2 boxes in the picture. In which one did compares go up?'],
    },
    { id: 'stops-early', type: 'predict', level: 2,
      q: 'How many compares does this merge make?',
      code: py`
        left = [1, 2, 3]
        right = [7, 8, 9]
        i = 0
        j = 0
        c = 0
        while i < 3 and j < 3:
            c = c + 1
            if left[i] <= right[j]:
                i = i + 1
            else:
                j = j + 1
        print(c)
      `,
      options: [
        '3',
        { text: '6', why: 'You may be counting every item. Once the left pile is gone, the right pile needs no compares.' },
        { text: '9', why: 'That is 3 x 3. A merge never compares every pair, because it only looks at the fronts.' },
      ],
      answer: 0,
      explain: 'All 3 left cards are smaller, so they go first. Then the loop ends, and 7, 8, 9 need no compares.',
      hints: ['Which pile runs out first?', 'The loop stops as soon as one pile is empty.'],
    },
    { id: 'tie-goes-left', type: 'mcq', level: 2,
      q: 'Why does `merge` use `<=` and not `<`?',
      options: [
        { text: 'With `<`, Python stops with an error', why: 'It still runs. On a tie it takes the right item first, so tied items swap their order.' },
        { text: 'It makes the merge use fewer steps', why: 'The step count stays about the same. The sign only decides who wins a tie.' },
        'On a tie, the left item goes first, so ties keep their order',
      ],
      answer: 2,
      explain: 'With `<=`, a tie goes to the left pile. So items that tie stay in the order they came in.',
      hints: ['Try it with `left[i]` and `right[j]` both equal to 2.'],
    },
    { id: 'fix-leftovers', type: 'fix', level: 2,
      q: 'This merge loses some items. Fix the last line.',
      code: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out
      `,
      answer: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]
      `,
      tests: [
        { label: 'merge([1, 3], [2])', call: 'merge([1, 3], [2])', want: '[1, 2, 3]' },
        { label: 'merge([], [4])', call: 'merge([], [4])', want: '[4]' },
        { label: 'merge([5], [])', call: 'merge([5], [])', want: '[5]' },
        { label: 'merge([1], [2])', call: 'merge([1], [2])', want: '[1, 2]' },
      ],
      explain: 'The loop ends when one pile is empty. The other pile may still hold items, so add both leftover slices.',
      hints: ['What is left when the loop stops?', 'Add `left[i:]` and `right[j:]` to the end.'],
    },
    { id: 'fix-base', type: 'fix', level: 2,
      q: 'This works on most lists, but an empty list makes Python stop with a `RecursionError`. Fix the base case.',
      code: py`
        def merge_sort(items):
            if len(items) == 1:
                return items
            mid = len(items) // 2
            left = merge_sort(items[:mid])
            right = merge_sort(items[mid:])
            return sorted(left + right)
      `,
      answer: py`
        def merge_sort(items):
            if len(items) <= 1:
                return items
            mid = len(items) // 2
            left = merge_sort(items[:mid])
            right = merge_sort(items[mid:])
            return sorted(left + right)
      `,
      tests: [
        { label: 'merge_sort([])', call: 'merge_sort([])', want: '[]' },
        { label: 'merge_sort([4])', call: 'merge_sort([4])', want: '[4]' },
        { label: 'merge_sort([2, 1])', call: 'merge_sort([2, 1])', want: '[1, 2]' },
      ],
      explain: 'An empty list cuts into 2 more empty lists, so the calls never stop. `<= 1` stops that as well.',
      hints: ['What are `items[:0]` and `items[0:]` when items is empty?', 'The base case must also catch a length of 0.'],
    },
    { id: 'write-merge-sort', type: 'write', level: 2,
      q: 'Write `merge_sort(items)`. It gives back a new sorted list. The `merge` function is there for you to use.',
      starter: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]

        def merge_sort(items):
            # Your code here.
            return items
      `,
      answer: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]

        def merge_sort(items):
            if len(items) <= 1:
                return items
            mid = len(items) // 2
            left = merge_sort(items[:mid])
            right = merge_sort(items[mid:])
            return merge(left, right)
      `,
      tests: [
        { label: 'merge_sort([5, 3, 8, 1])', call: 'merge_sort([5, 3, 8, 1])', want: '[1, 3, 5, 8]' },
        { label: 'merge_sort([])', call: 'merge_sort([])', want: '[]' },
        { label: 'merge_sort([7])', call: 'merge_sort([7])', want: '[7]' },
        { label: 'merge_sort([2, 2, 1])', call: 'merge_sort([2, 2, 1])', want: '[1, 2, 2]' },
        { label: 'merge_sort([9, 8, 7, 6, 5])', call: 'merge_sort([9, 8, 7, 6, 5])', want: '[5, 6, 7, 8, 9]' },
      ],
      explain: 'The base case stops the calls. Each call sorts 2 smaller lists, and merge joins them in order.',
      hints: ['Start with the base case.', 'Find the middle with `len(items) // 2`.', 'Call `merge_sort` on both slices, then merge the answers.'],
    },
    { id: 'sort-and-count', type: 'write', level: 3,
      q: 'Stretch: a pair is out of order if the bigger item comes first. `[3, 1, 2]` has 2 such pairs. Write `sort_and_count(items)`. It gives back the sorted list and the count.',
      starter: py`
        def sort_and_count(items):
            if len(items) <= 1:
                return items, 0
            mid = len(items) // 2
            left, a = sort_and_count(items[:mid])
            right, b = sort_and_count(items[mid:])
            count = a + b
            out = []
            # Merge here, and add to count.
            return out, count
      `,
      answer: py`
        def sort_and_count(items):
            if len(items) <= 1:
                return items, 0
            mid = len(items) // 2
            left, a = sort_and_count(items[:mid])
            right, b = sort_and_count(items[mid:])
            count = a + b
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
                    count = count + len(left) - i
            return out + left[i:] + right[j:], count
      `,
      tests: [
        { label: 'sort_and_count([3, 1, 2])', call: 'sort_and_count([3, 1, 2])', want: '([1, 2, 3], 2)' },
        { label: 'sort_and_count([1, 2, 3])', call: 'sort_and_count([1, 2, 3])', want: '([1, 2, 3], 0)' },
        { label: 'sort_and_count([3, 2, 1])', call: 'sort_and_count([3, 2, 1])', want: '([1, 2, 3], 3)' },
        { label: 'sort_and_count([2, 2, 1])', call: 'sort_and_count([2, 2, 1])', want: '([1, 2, 2], 2)' },
        { label: 'sort_and_count([])', call: 'sort_and_count([])', want: '([], 0)' },
      ],
      explain: 'A right item that goes next is smaller than every item left in the left pile. That adds `len(left) - i` pairs at once.',
      hints: ['Use the same loop as `merge`.', 'Take a right item only when it is smaller than the left front.', 'How many left items are still waiting at that moment? They all make a pair with it.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 17.2
Course.lesson('m17-fast-sorts', {
  id: '17-2-quicksort',
  num: '17.2',
  title: 'Quicksort: pick a pivot',
  goal: 'You can partition a list, write quicksort, and show its worst case.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Can you do the work before the split?' },
    { t: 'p', text: 'Merge sort does its real work at the end, when it merges. Quicksort does its work at the start. It picks one item and moves the others around it.' },
    { t: 'q', id: 'spark-line', type: 'mcq', level: 1,
      q: 'A class lines up. You pick one kid, Ann. Shorter kids stand on her left, and taller kids on her right. Does Ann need to move again?',
      options: [
        { text: 'Yes, she must go to the middle', why: 'You may think the picked one belongs in the middle. She stands wherever the counts put her.' },
        'No, she is already in her final spot',
        { text: 'Yes, because the line is not sorted yet', why: 'The 2 sides are not sorted yet. But sorting them never moves anyone past Ann.' },
      ],
      answer: 1,
      explain: 'Everyone shorter is on her left, and everyone taller is on her right. So her spot is final.',
      hints: ['Will anyone from the left side ever cross over to the right side?'],
    },
    { t: 'words', items: [
      { word: 'pivot', means: 'The item you pick, so you can compare all the others with it.', say: 'PIV-ut' },
      { word: 'partition', means: 'Move items into 2 piles: smaller than the pivot, and all the rest.', say: 'par-TISH-un' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Picture that line again, with Ann as the [[pivot]]. Shorter kids go left, and taller kids go right. Then each side picks its own kid and does the same. Unlike kids, Python cannot see the whole line. It compares one item at a time.' },
    { t: 'viz', name: 'm17-partition', caption: 'Say where each item goes. Then change the pivot spot. Any spot works.' },
    { t: 'q', id: 'tie-partition', type: 'predict', level: 2,
      q: 'Two list comprehensions make the 2 piles, and `>=` takes ties. This list has 2 threes. What will the screen show?',
      code: py`
        nums = [3, 5, 3, 1]
        pivot = nums[0]
        rest = nums[1:]
        left = [x for x in rest if x < pivot]
        right = [x for x in rest if x >= pivot]
        print(left, right)
      `,
      options: [
        { text: '[1] [5]', why: 'You may think an item that ties with the pivot goes away. `>=` keeps the second 3 on the right.' },
        '[1] [5, 3]',
        { text: '[3, 1] [5]', why: 'The second 3 is not smaller than the pivot. `<` is False when 2 values tie.' },
      ],
      answer: 1,
      explain: 'Only 1 is smaller than 3. The rest, 5 and the second 3, stay in order on the right.',
      hints: ['`rest` is `[5, 3, 1]`. Check each one against the pivot.', 'Is 3 < 3 True or False?'],
    },
    { t: 'h', text: 'How does one partition sort the whole list?' },
    { t: 'steps', title: 'Quicksort in 3 moves', items: [
      { label: 'Stop if it is short', text: 'A list of 0 or 1 items is sorted.', code: 'if len(items) <= 1:\n    return items' },
      { label: 'Partition', text: 'Pick a pivot. [[Partition]] the rest into 2 piles.', code: 'pivot = items[0]\nrest = items[1:]\nleft = [x for x in rest if x < pivot]\nright = [x for x in rest if x >= pivot]' },
      { label: 'Sort each pile', text: 'Call `quick` on both piles, and put the pivot between them.', code: 'return quick(left) + [pivot] + quick(right)' },
    ] },
    { t: 'viz', name: 'm17-quick-levels', caption: 'Each row is one level of calls. This list is mixed up, so the piles are fairly even.' },
    { t: 'code', caption: 'Run it. Then try an empty list, one item, and a list of all the same number.',
      code: py`
        def quick(items):
            if len(items) <= 1:
                return items
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            return quick(left) + [pivot] + quick(right)

        print(quick([4, 2, 6, 1, 5, 3]))
        print(quick([2, 1, 2]))
      `,
      output: '[1, 2, 3, 4, 5, 6]\n[1, 2, 2]',
    },
    { t: 'h', text: 'Count by hand: is every list the same?' },
    { t: 'p', text: 'The pivot is the first item. Each round compares the pivot with the rest of its pile. Try these 2 lists on paper.' },
    { t: 'q', id: 'race-mixed', type: 'mcq', level: 2,
      q: 'Count the compares for `[3, 1, 4, 2]`. Round 1 has pivot 3 and 3 other items. Then `[1, 2]` has pivot 1. How many in all?',
      options: [
        { text: '3', why: 'That is only round 1. The pile `[1, 2]` still needs its own round.' },
        '4',
        { text: '6', why: 'That is the count for a list with every pivot at one end. Here pivot 3 splits the list.' },
      ],
      answer: 1,
      explain: 'Round 1 uses 3 compares. The pile `[1, 2]` uses 1. Piles with 1 item use 0. So 3 + 1 is 4.',
      hints: ['Add up one number for each round.', 'A pile of 1 item needs no compares.'],
    },
    { t: 'q', id: 'race-sorted', type: 'mcq', level: 2,
      q: 'Same size, but sorted: `[1, 2, 3, 4]`. The pivot is the first item again. How many compares in all?',
      options: [
        { text: '3', why: 'That is only round 1. Here the right pile is nearly as long as the list, so more rounds follow.' },
        { text: '4', why: 'That was the mixed list. On this list no pile is ever split in 2 parts.' },
        '6',
      ],
      answer: 2,
      explain: 'Each pivot is the smallest, so the left pile stays empty. The rounds use 3, then 2, then 1 compares.',
      hints: ['Round 1 has pivot 1. Which pile gets the other 3 items?', 'Add 3 + 2 + 1.'],
    },
    { t: 'viz', name: 'm17-quick-levels', params: { items: '1 2 3 4 5 6' }, caption: 'This list is already sorted. Watch the rows make a staircase. Then change the pivot to the middle item and step through again.' },
    { t: 'code', caption: 'Same size, very different counts. Change n and run it again.',
      code: py`
        def count(items):
            if len(items) <= 1:
                return 0
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            return len(rest) + count(left) + count(right)

        n = 64
        print("sorted", count(list(range(n))))
        print("same", count([7] * n))
        print("mixed", count([i * 37 % n for i in range(n)]))
      `,
      output: 'sorted 2016\nsame 2016\nmixed 348',
    },
    { t: 'p', text: 'So the worst case is real. The sorted count is n x (n - 1) / 2, the same as selection sort. A long sorted list can even break the [[recursion]] limit.' },
    { t: 'code', error: true, caption: 'Run it. Each call makes a pile only 1 item shorter. The calls go too deep, so Python stops.',
      code: py`
        def quick(items):
            if len(items) <= 1:
                return items
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            return quick(left) + [pivot] + quick(right)

        print(len(quick(list(range(2000)))))
      `,
    },
    { t: 'trap', think: 'The worst case never happens in real life.',
      real: 'People often sort lists that are already sorted. With the first item as pivot, each of those lists is the worst case. A middle or random pivot makes it rare, but still possible.',
    },
    { t: 'cost', title: 'How fast is quicksort?', items: [
      { op: 'One partition', cost: 'O(n)', why: 'Each item gets compared with the pivot once.' },
      { op: 'Quicksort, usual case', cost: 'O(n log n)', why: 'Fairly even piles give about log n levels. A standard result.' },
      { op: 'Quicksort, worst case', cost: 'O(n^2)', why: 'One pile stays empty each time, so you get n levels.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Cue words for a partition: "put the small ones first", "split around a value". The same move can also find one spot of the sorted list, with no full sort. Lesson 17.3 shows you how.' },
  ],
  recap: [
    'You can partition a list around any pivot.',
    'You can show that a sorted list is quicksort\'s worst case here.',
    'You can say why the choice of pivot changes the step count.',
  ],
  practice: [
    { id: 'pivot-where', type: 'mcq', level: 1,
      q: 'Which item can be the pivot?',
      options: [
        { text: 'Only the middle value', why: 'This is a common mix-up. Any item works. A value near the middle only gives more even piles.' },
        { text: 'Only the first item', why: 'The first item is one choice, as in our code. The picture let you pick any spot.' },
        'Any item in the list',
      ],
      answer: 2,
      explain: 'Any pivot gives a correct sort. The choice only changes how many steps it takes.',
      hints: ['Think of the Pivot spot box in the picture. Which spots worked?'],
    },
    { id: 'pivot-landing', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        nums = [5, 9, 1, 7, 2]
        pivot = nums[0]
        left = [x for x in nums[1:] if x < pivot]
        print(len(left))
      `,
      answer: '2',
      explain: 'Only 1 and 2 are smaller than 5. So the pivot lands on spot 2.',
      hints: ['Which items are smaller than 5?'],
    },
    { id: 'worst-list', type: 'mcq', level: 2,
      q: 'The pivot is always the first item. Which list takes the most compares?',
      options: [
        { text: '`[3, 1, 5, 2, 4]`', why: 'Pivot 3 has items on both sides, so the piles are even.' },
        { text: '`[4, 2, 5, 1, 3]`', why: 'Pivot 4 has items on both sides, so the list does get split.' },
        '`[5, 4, 3, 2, 1]`',
      ],
      answer: 2,
      explain: 'Each pivot is the biggest in its pile, so the right pile stays empty. Backwards lists are as bad as sorted ones.',
      hints: ['Look for the list where every pivot leaves one pile empty.'],
    },
    { id: 'match-two', type: 'match', level: 2,
      q: 'Match each sort to the true sentence about it.',
      pairs: [
        ['Merge sort', 'Its split compares nothing, and its work comes after the calls.'],
        ['Quicksort', 'Its work comes before the calls, in the partition.'],
        ['Selection sort', 'It compares nearly every pair, whatever the order.'],
      ],
      explain: 'Merge sort works on the way back up. Quicksort works on the way down. Selection sort scans the rest on every pass.',
      hints: ['Which one has a merge at the end?'],
    },
    { id: 'fix-lost-ties', type: 'fix', level: 2,
      q: 'This quicksort loses items when 2 values tie. Fix it.',
      code: py`
        def quick(items):
            if len(items) <= 1:
                return items
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x > pivot]
            return quick(left) + [pivot] + quick(right)
      `,
      answer: py`
        def quick(items):
            if len(items) <= 1:
                return items
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            return quick(left) + [pivot] + quick(right)
      `,
      tests: [
        { label: 'quick([2, 1, 2])', call: 'quick([2, 1, 2])', want: '[1, 2, 2]' },
        { label: 'quick([3, 3, 3])', call: 'quick([3, 3, 3])', want: '[3, 3, 3]' },
        { label: 'quick([3, 1, 2])', call: 'quick([3, 1, 2])', want: '[1, 2, 3]' },
      ],
      explain: 'With `>`, an item that ties with the pivot is in neither pile. `>=` keeps it on the right.',
      hints: ['Which pile gets an item equal to the pivot?', 'Change the test in the line for right.'],
    },
    { id: 'write-quick', type: 'write', level: 2,
      q: 'Write `quick(items)` with the last item as the pivot. It gives back a new sorted list.',
      starter: py`
        def quick(items):
            # Your code here.
            return items
      `,
      answer: py`
        def quick(items):
            if len(items) <= 1:
                return items
            pivot = items[-1]
            rest = items[:-1]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            return quick(left) + [pivot] + quick(right)
      `,
      tests: [
        { label: 'quick([4, 1, 3, 2])', call: 'quick([4, 1, 3, 2])', want: '[1, 2, 3, 4]' },
        { label: 'quick([])', call: 'quick([])', want: '[]' },
        { label: 'quick([9])', call: 'quick([9])', want: '[9]' },
        { label: 'quick([2, 2, 1, 2])', call: 'quick([2, 2, 1, 2])', want: '[1, 2, 2, 2]' },
        { label: 'quick([1, 2, 3])', call: 'quick([1, 2, 3])', want: '[1, 2, 3]' },
      ],
      explain: 'Only the pivot line and the rest line change. `items[:-1]` is every item except the last.',
      hints: ['Start with the base case.', '`items[-1]` is the last item, and `items[:-1]` is the rest.', 'The last line joins 3 lists: left, the pivot, and right.'],
    },
    { id: 'three-piles', type: 'write', level: 3,
      q: 'Stretch: a list of one value is a worst case for `quick`. Write `three_way(items)` with 3 piles: smaller, the same as the pivot, and bigger. Use the middle item as the pivot.',
      starter: py`
        def three_way(items):
            # Your code here.
            return items
      `,
      answer: py`
        def three_way(items):
            if len(items) <= 1:
                return items
            pivot = items[len(items) // 2]
            small = [x for x in items if x < pivot]
            same = [x for x in items if x == pivot]
            big = [x for x in items if x > pivot]
            return three_way(small) + same + three_way(big)
      `,
      tests: [
        { label: 'three_way([3, 1, 2])', call: 'three_way([3, 1, 2])', want: '[1, 2, 3]' },
        { label: 'three_way([2, 2, 1, 2])', call: 'three_way([2, 2, 1, 2])', want: '[1, 2, 2, 2]' },
        { label: 'three_way([])', call: 'three_way([])', want: '[]' },
        { label: 'A long list of one value', check: 'three_way([7] * 2000) == [7] * 2000' },
        { label: 'A long sorted list', check: 'three_way(list(range(2000))) == list(range(2000))' },
      ],
      explain: 'Every item that ties goes in the middle pile, and that pile needs no more sorting. So a list of one value takes one round.',
      hints: ['The middle item is `items[len(items) // 2]`.', 'Make the 3 piles from all the items, so the pivot lands in the middle pile.', 'Sort only the small and big piles.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 17.4
Course.lesson('m17-fast-sorts', {
  id: '17-3-counting-sort',
  num: '17.4',
  title: 'The speed limit, and a way around it',
  goal: 'You can explain the n log n floor for comparing sorts, and write counting sort.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Could a cleverer sort go lower?' },
    { t: 'p', text: 'Merge sort takes about n log n steps. Can a smarter sort use fewer? If it only compares pairs, the answer is no. Here is the idea, with no proof.' },
    { t: 'q', id: 'spark-orders', type: 'mcq', level: 1,
      q: 'You have 3 cards: a, b and c. How many different orders can they lie in?',
      options: [
        { text: '3', why: 'That is the number of cards. Each card can go first, and then the other 2 can swap.' },
        '6',
        { text: '9', why: 'That is 3 x 3. But a used card cannot be used again, so it is 3 x 2 x 1.' },
      ],
      answer: 1,
      explain: 'You have 3 choices for first, then 2, then 1. And 3 x 2 x 1 is 6.',
      hints: ['Write out every order that starts with a. Then do the same for b and c.'],
    },
    { t: 'words', items: [
      { word: 'comparison sort', means: 'A sort that learns the order only by comparing 2 items at a time.', say: 'com-PARE-i-sun' },
      { word: 'floor', means: 'The lowest a step count can go, however clever the code is.' },
      { word: 'counting sort', means: 'A sort that counts how many of each value there are.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a game where you find a secret with yes or no questions. At best, each answer rules out half of what is left. A compare is one such question. Unlike the game, the secret here is the right order of the list.' },
    { t: 'viz', name: 'm17-yes-no', caption: 'Answer for the cards shown. Then change the cards, and try some that tie.' },
    { t: 'p', text: 'More items means far more orders. 4 cards have 24 orders. But 4 answers tell apart only 16 orders. So in the worst case you need 5.' },
    { t: 'code', caption: 'Each row shows n, the answers you must have, and n log n. Both grow at the same pace.',
      code: py`
        import math

        for n in [3, 4, 8, 16, 64]:
            orders = math.factorial(n)
            need = math.ceil(math.log2(orders))
            print(n, need, round(n * math.log2(n)))
      `,
      output: '3 3 5\n4 5 8\n8 16 24\n16 45 64\n64 296 384',
    },
    { t: 'p', text: '`math.factorial(n)` works out n x (n - 1) and so on, down to 1. That is the number of orders. `math.log2` says how many yes or no answers can split them.' },
    { t: 'big', text: 'A [[comparison sort]] has a [[floor]]. In its worst case, it needs about n log n compares.' },
    { t: 'q', id: 'friend-claim', type: 'mcq', level: 2,
      q: 'A friend says: "My new sort only compares pairs. It sorts any 8 items in 8 compares." What do you say?',
      options: [
        { text: 'It works if the computer is fast enough', why: 'This mixes up steps and seconds. A faster computer does not change how many answers you must have.' },
        { text: 'Yes, a sorted list only needs 7 compares', why: 'That is one lucky list. The friend said any 8 items, so the worst case counts.' },
        'No. 8 answers tell apart 256 orders, but 8 items have 40,320',
      ],
      answer: 2,
      explain: 'Each answer can only double what you can tell apart. Eight 2s multiplied together make 256.',
      hints: ['How many orders can 8 yes or no answers tell apart?', 'Keep doubling, starting from 1. Do it 8 times.'],
    },
    { t: 'h', text: 'How can a sort step around the limit?' },
    { t: 'p', text: 'The limit is only for sorts that compare. Now say your items are small whole numbers, like scores from 0 to 5. You can use each value as an index, and compare nothing.' },
    { t: 'analogy', title: 'A tally chart', text: 'Think of a tally chart for votes. You read each vote and add a mark next to it. You never compare 2 votes. Unlike a real chart, [[counting sort]] needs a spot for every value, even with no votes.' },
    { t: 'viz', name: 'm17-counting', caption: 'Watch the compares stay at 0. Then try one item, all the same value, or a value that is far too big.' },
    { t: 'q', id: 'race-tally', type: 'trace', level: 2,
      q: 'Count by hand. The list is `[2, 0, 2, 1]`, and counts has 3 spots. Fill in the 3 spots after each item.',
      code: py`
        counts = [0, 0, 0]
        for x in [2, 0, 2, 1]:
            counts[x] = counts[x] + 1
      `,
      head: ['x', 'spot0', 'spot1', 'spot2'],
      rows: [['2', '0', '0', '1'], ['0', '1', '0', '1'], ['2', '1', '0', '2'], ['1', '1', '1', '2']],
      given: 1,
      verify: py`
        counts = [0, 0, 0]
        for x in [2, 0, 2, 1]:
            counts[x] = counts[x] + 1
            print(x, counts[0], counts[1], counts[2])
      `,
      explain: 'That is 4 steps to count. Then 3 steps walk along the spots. So 7 steps, and no compares.',
      hints: ['Only 1 spot changes on each row.', 'x tells you which spot goes up.'],
    },
    { t: 'code', caption: 'Run it. `extend` adds a whole list to the end. `out = out + ...` would copy the old items each time. And `max([])` stops with an error, so check for an empty list.',
      code: py`
        def counting_sort(items):
            if len(items) == 0:
                return []
            counts = [0] * (max(items) + 1)
            for x in items:
                counts[x] = counts[x] + 1
            out = []
            for value in range(len(counts)):
                out.extend([value] * counts[value])
            return out

        print(counting_sort([2, 0, 3, 2, 1, 2]))
        print(counting_sort([]))
        print(counting_sort([4, 4]))
      `,
      output: '[0, 1, 2, 2, 2, 3]\n[]\n[4, 4]',
    },
    { t: 'q', id: 'fix-spots', type: 'fix', level: 2,
      q: 'This counting sort stops with an `IndexError`. Fix the line that makes counts.',
      code: py`
        def counting_sort(items):
            if len(items) == 0:
                return []
            counts = [0] * max(items)
            for x in items:
                counts[x] = counts[x] + 1
            out = []
            for value in range(len(counts)):
                out.extend([value] * counts[value])
            return out
      `,
      answer: py`
        def counting_sort(items):
            if len(items) == 0:
                return []
            counts = [0] * (max(items) + 1)
            for x in items:
                counts[x] = counts[x] + 1
            out = []
            for value in range(len(counts)):
                out.extend([value] * counts[value])
            return out
      `,
      tests: [
        { label: 'counting_sort([3, 1, 2])', call: 'counting_sort([3, 1, 2])', want: '[1, 2, 3]' },
        { label: 'counting_sort([0, 0])', call: 'counting_sort([0, 0])', want: '[0, 0]' },
        { label: 'counting_sort([])', call: 'counting_sort([])', want: '[]' },
      ],
      explain: 'A biggest value of 3 needs spots 0, 1, 2 and 3. That is 4 spots, so add 1.',
      hints: ['If the biggest value is 3, how many spots run from 0 to 3?', 'Counting starts at 0, so the count is one more than the biggest index.'],
    },
    { t: 'trap', think: 'Counting sort has no compares, so it is always the fastest.',
      real: 'Its steps grow with the biggest value too. One huge value makes a huge list of counts.',
      code: py`
        def steps(items):
            return len(items) + max(items) + 1

        print(steps([3, 1, 2]))        # 7
        print(steps([3, 1000000]))     # 1000003
      `,
    },
    { t: 'table', caption: 'When does counting sort fit?', head: ['Items', 'Fits?', 'Why'], rows: [
      ['Scores from 0 to 100', 'Yes', 'Whole numbers, with few possible values.'],
      ['A few numbers up to a billion', 'No', 'You would need a billion spots.'],
      ['Prices like 2.50', 'No', 'A list index must be a whole number.'],
      ['Numbers below 0', 'With care', '`counts[-1]` is the last spot, not a spot for -1. Shift the values first.'],
    ] },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'The floor for comparison sorts', cost: 'O(n log n)', why: 'None can beat this in its worst case. A standard result.' },
      { op: 'Counting sort', cost: 'O(n + k)', why: 'n steps to count, and k steps to walk. Here k is the biggest value.' },
      { op: 'Counting sort, extra memory', cost: 'O(n + k)', why: 'One spot for each possible value, and a new list of n items.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Cue words for counting sort: "only 0, 1 and 2", "scores from 0 to 100", "ages", "letters a to z". The values are whole numbers from a small set.' },
    { t: 'tip', title: 'Does quickselect break the limit?', text: 'No. The floor is for sorts. Quickselect, from lesson 17.3, does not sort the list. It finds only one spot.' },
  ],
  recap: [
    'A sort that only compares needs about n log n compares at worst.',
    'Counting sort uses each value as an index, with no compares.',
    'Counting sort only fits small whole numbers.',
  ],
  practice: [
    { id: 'which-fits', type: 'mcq', level: 1,
      q: 'Which list suits counting sort best?',
      options: [
        'The ages of 500 kids in a school',
        { text: '10 phone numbers', why: 'Phone numbers are huge, so you would need billions of spots for only 10 items.' },
        { text: 'The heights of trees, like 4.75 metres', why: 'A list index must be a whole number, so 4.75 cannot be a spot.' },
      ],
      answer: 0,
      explain: 'Ages are whole numbers with few possible values. That is what counting sort needs.',
      hints: ['How many different values can each list hold?'],
    },
    { id: 'counts-list', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        counts = [0, 0, 0, 0]
        for x in [1, 3, 1]:
            counts[x] = counts[x] + 1
        print(counts)
      `,
      answer: '[0, 2, 0, 1]',
      explain: 'Spot 1 goes up 2 times, and spot 3 goes up once. The other spots stay at 0.',
      hints: ['x is the spot that goes up.'],
    },
    { id: 'not-broken', type: 'mcq', level: 2,
      q: 'Counting sort can take fewer than n log n steps. Why does that not break the speed limit?',
      options: [
        'The limit is only for sorts that learn by comparing',
        { text: 'The limit is wrong for small lists', why: 'The limit holds for comparing sorts at any size. Counting sort gets around it in another way.' },
        { text: 'Counting sort compares items without showing it', why: 'It really has no compares. It uses each value as an index.' },
      ],
      answer: 0,
      explain: 'An index jump gets the spot in one step, not a yes or no answer. So the limit does not apply.',
      hints: ['What did the yes or no game count?'],
    },
    { id: 'fill-counting', type: 'fill', level: 2,
      q: 'Fill the gaps to finish counting sort.',
      code: py`
        def counting_sort(items):
            counts = [0] * (max(items) + 1)
            for x in items:
                counts[____] = counts[x] + 1
            out = []
            for value in range(len(counts)):
                out.extend([value] * counts[____])
            return out

        print(counting_sort([3, 0, 3, 1]))
      `,
      blanks: ['x', 'value'],
      output: '[0, 1, 3, 3]',
      explain: 'The first loop uses the item as the spot. The second loop reads how many of each value to write.',
      hints: ['Which spot should go up when you read x?', 'How many copies of value should go in?'],
    },
    { id: 'match-cost', type: 'match', level: 2,
      q: 'Match each sort to its worst-case steps.',
      pairs: [
        ['Selection sort', '`O(n^2)`'],
        ['Merge sort', '`O(n log n)`'],
        ['Counting sort', '`O(n + k)`, with k the biggest value'],
      ],
      explain: 'Selection sort compares nearly every pair. Merge sort has log n rows. Counting sort uses no compares.',
      hints: ['Which one depends on the biggest value?'],
    },
    { id: 'sort-socks', type: 'write', level: 2,
      q: 'A list holds socks: 0 is red, 1 is white, 2 is blue. Write `sort_socks(items)` with 3 counts. It gives back a new list with all the 0s, then 1s, then 2s.',
      starter: py`
        def sort_socks(items):
            counts = [0, 0, 0]
            # Your code here.
            return []
      `,
      answer: py`
        def sort_socks(items):
            counts = [0, 0, 0]
            for x in items:
                counts[x] = counts[x] + 1
            return [0] * counts[0] + [1] * counts[1] + [2] * counts[2]
      `,
      tests: [
        { label: 'sort_socks([2, 0, 1, 0])', call: 'sort_socks([2, 0, 1, 0])', want: '[0, 0, 1, 2]' },
        { label: 'sort_socks([2, 2])', call: 'sort_socks([2, 2])', want: '[2, 2]' },
        { label: 'sort_socks([1])', call: 'sort_socks([1])', want: '[1]' },
        { label: 'sort_socks([])', call: 'sort_socks([])', want: '[]' },
      ],
      explain: 'Count each colour once. Then `[0] * counts[0]` makes the right number of red socks, and so on.',
      hints: ['Use a loop to fill counts.', '`[0] * 3` makes `[0, 0, 0]`.', 'Add the 3 lists together with `+`.'],
    },
    { id: 'counting-below-zero', type: 'write', level: 3,
      q: 'Stretch: write `counting_sort_any(items)`, which also works for numbers below 0. Hint: spot 0 can stand for the smallest value.',
      starter: py`
        def counting_sort_any(items):
            # Your code here.
            return items
      `,
      answer: py`
        def counting_sort_any(items):
            if len(items) == 0:
                return []
            low = min(items)
            counts = [0] * (max(items) - low + 1)
            for x in items:
                counts[x - low] = counts[x - low] + 1
            out = []
            for i in range(len(counts)):
                out.extend([i + low] * counts[i])
            return out
      `,
      tests: [
        { label: 'counting_sort_any([2, -1, 0])', call: 'counting_sort_any([2, -1, 0])', want: '[-1, 0, 2]' },
        { label: 'counting_sort_any([-3, -3, -5])', call: 'counting_sort_any([-3, -3, -5])', want: '[-5, -3, -3]' },
        { label: 'counting_sort_any([4, 2])', call: 'counting_sort_any([4, 2])', want: '[2, 4]' },
        { label: 'counting_sort_any([])', call: 'counting_sort_any([])', want: '[]' },
      ],
      explain: 'Subtract the smallest value to get a spot. Add it back when you write the value out.',
      hints: ['Find the smallest value with `min`.', 'The spot for x is `x - low`.', 'The value for spot i is `i + low`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 17.5 (bonus)
Course.lesson('m17-fast-sorts', {
  id: '17-4-timsort',
  num: '17.5',
  title: 'What Python really uses: Timsort',
  optional: true,
  goal: 'You can find the runs in a list, and say when `sorted` needs few compares.',
  mins: 12,
  steps: [
    { t: 'h', text: 'What is inside sorted()?' },
    { t: 'p', text: 'You have used `sorted` many times. Tim Peters wrote its method for Python, so it is called Timsort. It has a neat trick, and you can catch it working.' },
    { t: 'q', id: 'spark-count', type: 'predict', level: 2,
      q: 'This class counts each compare that `sorted` makes. The list has 1,000 items, all in order already. Guess the count.',
      code: py`
        class Card:
            count = 0
            def __init__(self, value):
                self.value = value
            def __lt__(self, other):
                Card.count = Card.count + 1
                return self.value < other.value

        cards = [Card(n) for n in range(1000)]
        sorted(cards)
        print(Card.count)
      `,
      options: [
        '999',
        { text: '4932', why: 'That is what our merge sort takes here, since it always splits and merges. `sorted` looks for order first.' },
        { text: '499500', why: 'That is the selection sort count, with nearly every pair compared. `sorted` avoids that.' },
      ],
      answer: 0,
      explain: '`sorted` walks along the list once. It sees that each item is in order, so it stops after 999 compares.',
      hints: ['How many neighbour pairs does a list of 1,000 items have?'],
    },
    { t: 'words', items: [
      { word: 'run', means: 'A stretch of a list that is already in order.' },
      { word: 'Timsort', means: 'The sort inside Python. It finds runs, then merges them.', say: 'TIM-sort' },
      { word: 'adaptive', means: 'Takes fewer steps when the input is already partly in order.', say: 'uh-DAP-tiv' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a messy bookshelf. Some stretches are already in order. A smart helper keeps those stretches and joins them. No book needs to come out alone. Unlike a helper, Python can also flip a backwards stretch in one go.' },
    { t: 'viz', name: 'm17-timsort-runs', caption: 'Find each run, then merge them. Then try a sorted list, a backwards list, and a list with ties.' },
    { t: 'q', id: 'count-runs', type: 'mcq', level: 1,
      q: 'Count the rising runs by hand in `[1, 3, 5, 2, 4]`. How many are there?',
      options: [
        { text: '1', why: 'The order breaks when 5 is followed by 2. So a new run starts at 2.' },
        '2',
        { text: '5', why: 'That counts each item as its own run. A run keeps going while the order holds.' },
      ],
      answer: 1,
      explain: 'The runs are `[1, 3, 5]` and `[2, 4]`. A merge of those 2 finishes the job.',
      hints: ['Walk along the list. Where does the next value drop?'],
    },
    { t: 'code', caption: 'Python calls `__lt__` for each `<`, so this counts every compare. Change the lists and guess first.',
      code: py`
        class Card:
            count = 0
            def __init__(self, value):
                self.value = value
            def __lt__(self, other):
                Card.count = Card.count + 1
                return self.value < other.value

        def compares(values):
            Card.count = 0
            sorted([Card(v) for v in values])
            return Card.count

        up = list(range(1000))
        print("sorted", compares(up))
        print("backwards", compares(up[::-1]))
        print("two runs", compares(up[500:] + up[:500]))
        print("mixed", compares([i * 379 % 1000 for i in up]))
      `,
      output: 'sorted 999\nbackwards 999\ntwo runs 1026\nmixed 8625',
    },
    { t: 'p', text: 'That is what [[adaptive]] means. A list with a lot of order takes far fewer compares. A mixed list has few long runs, so it takes about n log n.' },
    { t: 'q', id: 'tie-order', type: 'predict', level: 2,
      q: 'A merge sends ties to the left, so `sorted` keeps ties in order. What will the screen show?',
      code: py`
        kids = [("Ann", 3), ("Bo", 1), ("Cy", 3), ("Di", 1)]
        def score(kid):
            return kid[1]
        for kid in sorted(kids, key=score):
            print(kid[0])
      `,
      options: [
        { text: 'Bo\nDi\nCy\nAnn', why: 'This flips the tied kids. Ann comes before Cy in the list, and a tie keeps that order.' },
        'Bo\nDi\nAnn\nCy',
        { text: 'Ann\nBo\nCy\nDi', why: 'That is A to Z order. With `key=score`, Python compares the scores.' },
      ],
      answer: 1,
      explain: 'The scores of 1 go first, and Bo was before Di. Then the scores of 3 go next, and Ann was before Cy.',
      hints: ['Who has the lower score? Put them first.', 'Among kids with the same score, keep the list order.'],
    },
    { t: 'code', caption: 'Both tools use Timsort. `sorted` makes a new list. `list.sort` changes the list and hands back `None`.',
      code: py`
        nums = [3, 1, 2]
        print(sorted(nums))
        print(nums)
        print(nums.sort())
        print(nums)
      `,
      output: '[1, 2, 3]\n[3, 1, 2]\nNone\n[1, 2, 3]',
    },
    { t: 'cost', title: 'How fast is sorted()?', items: [
      { op: '`sorted`, worst case', cost: 'O(n log n)', why: 'From the Python docs. `list.sort` is the same. It sits on the floor.' },
      { op: 'A list in order', cost: 'About n', why: 'You saw 999 compares above. The docs only say it uses existing order.' },
    ] },
    { t: 'trap', think: 'Timsort always takes about n steps.',
      real: 'Only a list with long runs gets that bonus. A mixed list still takes about n log n compares, because of the floor.',
    },
    { t: 'table', caption: 'Which tool fits?', head: ['The job says', 'Pick'], rows: [
      ['Sort a list, any list', '`sorted` or `list.sort`'],
      ['"Only 0, 1 and 2" or "scores from 0 to 100"', 'Counting sort'],
      ['"k-th smallest" or "median"', 'Quickselect, from lesson 17.3'],
      ['"Count pairs out of order"', 'Merge sort, with a counter'],
    ] },
    { t: 'tip', title: 'So why learn the others?', text: 'In real work, start with `sorted`. Its ideas came from merge sort and insertion sort, so now you can see inside it. Other jobs, like finding one spot with quickselect, need those ideas too.' },
  ],
  recap: [
    'A run is a stretch that is already in order.',
    'Timsort finds runs and merges them, so order saves steps.',
    'Start with `sorted`, unless the job calls for another tool.',
  ],
  practice: [
    { id: 'what-run', type: 'mcq', level: 1,
      q: 'Which list is one single rising run?',
      options: [
        '`[2, 2, 5, 9]`',
        { text: '`[2, 5, 4, 9]`', why: 'The 4 comes after a 5, so the order breaks there.' },
        { text: '`[9, 5, 2, 2]`', why: 'This goes down, so it is not rising. And a tie would stop a falling run.' },
      ],
      answer: 0,
      explain: 'Each value is the same as the one before it or bigger. Ties do not break a rising run.',
      hints: ['Check each neighbour pair.'],
    },
    { id: 'fewest-compares', type: 'mcq', level: 2,
      q: 'All these lists have 1,000 items. Which one makes `sorted` use the fewest compares?',
      options: [
        { text: 'A list in a mixed-up order', why: 'A mixed list has few long runs, so it takes about n log n compares.' },
        'The numbers 1 to 1,000, in order',
        { text: 'Every list takes the same number', why: 'That would be true of a sort that always splits in half. Timsort is adaptive.' },
      ],
      answer: 1,
      explain: 'A sorted list is one long run. `sorted` sees that after one walk along the list.',
      hints: ['Which list has the fewest runs?'],
    },
    { id: 'fix-sort-none', type: 'fix', level: 2,
      q: 'This should show the sorted list, but it shows `None`. Fix one line.',
      code: py`
        nums = [3, 1, 2]
        nums = nums.sort()
        print(nums)
      `,
      answer: py`
        nums = [3, 1, 2]
        nums.sort()
        print(nums)
      `,
      wantOutput: '[1, 2, 3]',
      explain: '`list.sort` changes the list and hands back `None`. So do not put a name on its answer.',
      hints: ['What does `list.sort` hand back?', 'Or use `sorted`, which hands back a new list.'],
    },
    { id: 'write-count-runs', type: 'write', level: 2,
      q: 'Write `count_runs(items)`. It gives back how many rising runs the list has. An empty list has 0.',
      starter: py`
        def count_runs(items):
            # Your code here.
            return 0
      `,
      answer: py`
        def count_runs(items):
            if len(items) == 0:
                return 0
            runs = 1
            for i in range(1, len(items)):
                if items[i] < items[i - 1]:
                    runs = runs + 1
            return runs
      `,
      tests: [
        { label: 'count_runs([])', call: 'count_runs([])', want: '0' },
        { label: 'count_runs([7])', call: 'count_runs([7])', want: '1' },
        { label: 'count_runs([1, 2, 2, 3])', call: 'count_runs([1, 2, 2, 3])', want: '1' },
        { label: 'count_runs([1, 3, 2, 4])', call: 'count_runs([1, 3, 2, 4])', want: '2' },
        { label: 'count_runs([3, 2, 1])', call: 'count_runs([3, 2, 1])', want: '3' },
      ],
      explain: 'A list with items has at least 1 run. Each drop starts a new one.',
      hints: ['Handle the empty list first.', 'Compare each item with the one before it.', 'Add 1 only when the value drops.'],
    },
    { id: 'match-tools', type: 'match', level: 2,
      q: 'Match each job to the best tool.',
      pairs: [
        ['Sort a list of names', '`sorted`'],
        ['Sort 1 million scores from 0 to 100', 'Counting sort'],
        ['Count the pairs that are out of order', 'Merge sort, with a counter'],
      ],
      explain: 'Use `sorted` by default. Small whole numbers suit counting sort. Merge sort can count as it merges.',
      hints: ['Which job has a small set of whole numbers?'],
    },
    { id: 'write-run-sort', type: 'write', level: 3,
      q: 'Stretch: write `run_sort(items)`. Cut the list into rising runs, then merge them until one is left. The `merge` function is there for you to use.',
      starter: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]

        def run_sort(items):
            # Your code here.
            return items
      `,
      answer: py`
        def merge(left, right):
            out = []
            i = 0
            j = 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    out.append(left[i])
                    i = i + 1
                else:
                    out.append(right[j])
                    j = j + 1
            return out + left[i:] + right[j:]

        def run_sort(items):
            if len(items) == 0:
                return []
            runs = [[items[0]]]
            for x in items[1:]:
                if x >= runs[-1][-1]:
                    runs[-1].append(x)
                else:
                    runs.append([x])
            while len(runs) > 1:
                first = runs.pop(0)
                second = runs.pop(0)
                runs.insert(0, merge(first, second))
            return runs[0]
      `,
      tests: [
        { label: 'run_sort([1, 3, 2, 4])', call: 'run_sort([1, 3, 2, 4])', want: '[1, 2, 3, 4]' },
        { label: 'run_sort([])', call: 'run_sort([])', want: '[]' },
        { label: 'run_sort([5])', call: 'run_sort([5])', want: '[5]' },
        { label: 'run_sort([3, 2, 1])', call: 'run_sort([3, 2, 1])', want: '[1, 2, 3]' },
        { label: 'run_sort([2, 2, 1, 2])', call: 'run_sort([2, 2, 1, 2])', want: '[1, 2, 2, 2]' },
      ],
      explain: 'Each drop starts a new run. Merging 2 runs at a time always leaves sorted runs, so one sorted run remains.',
      hints: ['Keep a list of runs. Start it with one run that holds the first item.', 'If x is at least the last value of the last run, it joins that run.', 'Then merge the first 2 runs, until only one is left.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 17.3
Course.lesson('m17-fast-sorts', {
  id: '17-5-quickselect',
  num: '17.3',
  title: 'Quickselect: find one spot with no full sort',
  goal: 'You can find the k-th smallest item with quickselect, with no full sort.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Do you need to sort it all?' },
    { t: 'q', id: 'spark-min', type: 'mcq', level: 1,
      q: 'You want only the smallest item of a list. Do you need to sort the whole list?',
      options: [
        'No. One walk with `min` is enough',
        { text: 'Yes. You cannot know without a sort', why: 'A sort works, but it does far more than you asked. `min` looks at each item once.' },
        { text: 'Yes, because a sort is always the fastest way', why: 'A sort costs O(n log n), and `min` costs O(n). Do not pay for work you do not need.' },
      ],
      answer: 0,
      explain: 'You asked for one item, so you pay for one walk. The same idea can work for other spots too.',
      hints: ['How does `min` find its answer?'],
    },
    { t: 'words', items: [
      { word: 'quickselect', means: 'A way to find one spot of the sorted list, with no full sort.' },
    ] },
    { t: 'p', text: 'After a partition, the pivot is in its final spot. You saw that in lesson 17.2. Say you want spot 3 of the sorted list. You only need the pile that holds spot 3. That is [[quickselect]].' },
    { t: 'analogy', title: 'Picture this', text: 'Back to the line of kids. Ann stands in her final spot, and you want the kid in spot 3. If Ann is in spot 2, you never look left of her again. Unlike a sorted line, the other kids can stay out of order.' },
    { t: 'viz', name: 'm17-quickselect', caption: 'Decide which way to go each time. Then change k. Try a k that is too big.' },
    { t: 'code', caption: 'k is a spot in the sorted list, so k = 0 means the smallest. Try other values of k.',
      code: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < len(left):
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left) - 1)

        nums = [4, 8, 2, 6, 1, 9]
        print(select(nums, 0))
        print(select(nums, 3))
        print(select(nums, 5))
      `,
      output: '1\n6\n9',
    },
    { t: 'q', id: 'fill-select', type: 'fill', level: 2,
      q: 'Fill the gaps. The first gap says when to search left. The second gap is the new k in the right pile.',
      code: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < ____:
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left) - ____)

        print(select([5, 3, 7, 1], 2))
      `,
      blanks: [['len(left)'], ['1']],
      output: '5',
      explain: 'Spots below `len(left)` are in the left pile. For the right pile, skip the left pile and the pivot.',
      hints: ['How many spots does the left pile fill?', 'The right pile starts after the left pile and after 1 more item. Which item?'],
    },
    { t: 'big', text: 'Keep only the pile that holds your spot. The other pile never needs any more work.' },
    { t: 'q', id: 'which-pile', type: 'mcq', level: 2,
      q: 'The pivot landed on spot 4, and you want spot 1. What happens next?',
      options: [
        'Search the left pile, with the same k',
        { text: 'Search the right pile', why: 'The right pile holds the spots after 4. Spot 1 comes before it.' },
        { text: 'Stop. The pivot is the answer', why: 'That happens only when k equals the spot of the pivot. Here it is on spot 4.' },
      ],
      answer: 0,
      explain: 'Spots below 4 are all in the left pile. Its spots start at 0, as the whole list does, so k stays 1.',
      hints: ['Is spot 1 before or after spot 4?'],
    },
    { t: 'p', text: 'Count for 8 items with even piles. The rounds touch 8, then 4, 2 and 1 items. That is 15 steps, which is under 2 x 8.' },
    { t: 'code', caption: 'Each row shows n, the compares for quickselect, then the compares for a full quicksort. Change the sizes, and guess first.',
      code: py`
        def pick_count(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            count = len(rest)
            if k < len(left):
                return count + pick_count(left, k)
            if k == len(left):
                return count
            return count + pick_count(right, k - len(left) - 1)

        def sort_count(items):
            if len(items) <= 1:
                return 0
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            a = sort_count(left)
            b = sort_count(right)
            return len(rest) + a + b

        for n in [64, 256, 1024]:
            nums = [i * 37 % n for i in range(n)]
            print(n, pick_count(nums, n // 2), sort_count(nums))
      `,
      output: '64 206 348\n256 1215 2826\n1024 12073 22092',
    },
    { t: 'cost', title: 'How fast is quickselect?', items: [
      { op: 'Quickselect, usual case', cost: 'O(n)', why: 'Even piles give under 2n steps. A standard result.' },
      { op: 'Quickselect, worst case', cost: 'O(n^2)', why: 'One pile stays empty each time, as in quicksort.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Cue words for quickselect: "k-th smallest", "k-th largest", "median". You want one spot, and you do not need the rest in order.' },
    { t: 'trap',
      think: 'Quickselect sorts the list, so I can read the other spots too.',
      real: 'It places only the spot you asked for. The other items may still be out of order. If you need many spots, sort the list once.',
    },
  ],
  recap: [
    'You can find one spot with quickselect, with no full sort.',
    'You can say which pile to search, and what k becomes.',
    'You know it usually takes O(n) steps, and O(n^2) at worst.',
  ],
  practice: [
    { id: 'cue-quickselect', type: 'mcq', level: 1,
      q: 'Which job fits quickselect best?',
      options: [
        'Find the middle value of 1 million numbers',
        { text: 'Put 1 million names in order', why: 'You need every spot there, so sort the list.' },
        { text: 'Find the smallest number', why: '`min` does this in one walk, with far less code.' },
      ],
      answer: 0,
      explain: 'The middle value is one spot of the sorted list. You do not need the other spots in order.',
      hints: ['Which job asks for one spot, and not the smallest?'],
    },
    { id: 'select-predict', type: 'predict', level: 1,
      q: 'k = 1 means the second smallest. Type what the screen will show.',
      code: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < len(left):
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left) - 1)

        print(select([7, 2, 9, 4], 1))
      `,
      answer: '4',
      explain: 'In order, the list is 2, 4, 7, 9. Spot 1 holds 4. The pivot 7 lands on spot 2, so the code goes left.',
      hints: ['Write the list in order. Which item is at spot 1?'],
    },
    { id: 'new-k', type: 'mcq', level: 2,
      q: 'The left pile has 3 items, and the pivot comes next. You want spot 6. What is k in the right pile?',
      options: [
        { text: '3', why: 'That takes away the left pile only. The pivot fills a spot too.' },
        '2',
        { text: '6', why: 'The right pile has its own spots, and they start at 0.' },
      ],
      answer: 1,
      explain: 'The left pile fills spots 0 to 2, and the pivot fills spot 3. So spot 6 is 2 spots into the right pile.',
      hints: ['Which spots do the left pile and the pivot fill?', 'Work out `k - len(left) - 1`.'],
    },
    { id: 'fix-new-k', type: 'fix', level: 2,
      q: 'This `select` goes wrong when it searches the right pile. The last line forgets something. Fix it.',
      code: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < len(left):
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left))
      `,
      answer: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < len(left):
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left) - 1)
      `,
      tests: [
        { label: 'select([4, 8, 2, 6, 1, 9], 3)', call: 'select([4, 8, 2, 6, 1, 9], 3)', want: '6' },
        { label: 'select([4, 8, 2, 6, 1, 9], 5)', call: 'select([4, 8, 2, 6, 1, 9], 5)', want: '9' },
        { label: 'select([4, 8, 2, 6, 1, 9], 0)', call: 'select([4, 8, 2, 6, 1, 9], 0)', want: '1' },
      ],
      explain: 'The right pile comes after the left pile and after the pivot. So take away both, not only the left pile.',
      hints: ['Which items come before the right pile?', 'The pivot fills one spot too.'],
    },
    { id: 'median-of', type: 'write', level: 2,
      q: 'Write `median(items)`. The list has an odd length. It gives back the middle value of the sorted list. Use `select`, not a sort.',
      starter: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < len(left):
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left) - 1)

        def median(items):
            # Your code here.
            return None
      `,
      answer: py`
        def select(items, k):
            pivot = items[0]
            rest = items[1:]
            left = [x for x in rest if x < pivot]
            right = [x for x in rest if x >= pivot]
            if k < len(left):
                return select(left, k)
            if k == len(left):
                return pivot
            return select(right, k - len(left) - 1)

        def median(items):
            return select(items, len(items) // 2)
      `,
      tests: [
        { label: 'median([9, 1, 5])', call: 'median([9, 1, 5])', want: '5' },
        { label: 'median([7])', call: 'median([7])', want: '7' },
        { label: 'median([4, 8, 2, 6, 1])', call: 'median([4, 8, 2, 6, 1])', want: '4' },
        { label: 'median([3, 3, 3])', call: 'median([3, 3, 3])', want: '3' },
      ],
      explain: 'With an odd length, the middle spot is `len(items) // 2`. So you ask `select` for that one spot.',
      hints: ['Which spot is the middle of 5 items?', 'Call `select(items, len(items) // 2)`.'],
    },
    { id: 'kth-largest', type: 'write', level: 3,
      q: 'Stretch: write `kth_largest(items, k)` with quickselect. `k = 1` means the biggest, and `k = 2` means the second biggest.',
      starter: py`
        def kth_largest(items, k):
            # Your code here.
            return None
      `,
      answer: py`
        def kth_largest(items, k):
            pivot = items[0]
            rest = items[1:]
            big = [x for x in rest if x > pivot]
            small = [x for x in rest if x <= pivot]
            if k <= len(big):
                return kth_largest(big, k)
            if k == len(big) + 1:
                return pivot
            return kth_largest(small, k - len(big) - 1)
      `,
      tests: [
        { label: 'kth_largest([3, 9, 1, 7], 1)', call: 'kth_largest([3, 9, 1, 7], 1)', want: '9' },
        { label: 'kth_largest([3, 9, 1, 7], 2)', call: 'kth_largest([3, 9, 1, 7], 2)', want: '7' },
        { label: 'kth_largest([3, 9, 1, 7], 4)', call: 'kth_largest([3, 9, 1, 7], 4)', want: '1' },
        { label: 'kth_largest([4, 4, 2], 2)', call: 'kth_largest([4, 4, 2], 2)', want: '4' },
        { label: 'kth_largest([5], 1)', call: 'kth_largest([5], 1)', want: '5' },
      ],
      explain: 'You can flip the piles, with the bigger items first. Or you can call `select` with spot `len(items) - k`.',
      hints: ['Make one pile of bigger items, and one of the rest.', 'If the big pile has at least k items, the answer is in there.', 'Going to the other pile, subtract the big pile and the pivot from k.'],
    },
  ],
});
