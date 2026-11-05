/* Module 13: Array Patterns. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm13-array-patterns',
  num: 13, part: 2, level: 'I',
  title: 'Array Patterns',
  blurb: 'Three clever ways to walk along a list, so you do far fewer steps.',
  needs: ['m09-arrays', 'm10-searching', 'm12-simple-sorts'],
});

// ---------------------------------------------------------------- lesson 13.1
Course.lesson('m13-array-patterns', {
  id: '13-1-two-pointers',
  num: '13.1',
  title: 'Two pointers: walk from both ends',
  goal: 'You can find a pair in a sorted list with two pointers.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Which two numbers add up to your target?' },
    { t: 'p', text: 'You have 10 coins to spend. A shop sells toys at these prices, lowest first: 1, 3, 4, 6, 8, 11. You want 2 toys that cost exactly 10.' },
    { t: 'p', text: 'The plain way tests every pair. First, count the pairs yourself on a smaller list.' },
    { t: 'q', id: 'count-pairs', type: 'mcq', level: 1,
      q: 'The list is `[2, 3, 5, 9]`. Write out every pair. How many different pairs are there?',
      options: [
        { text: '4', why: 'That is the number of items. Each item can have more than one partner.' },
        '6',
        { text: '12', why: 'This counts 2 with 3 and 3 with 2 as two pairs. They are the same pair.' },
        { text: '16', why: 'That is 4 times 4. It counts each pair twice, and pairs items with themselves.' },
      ],
      answer: 1,
      explain: '2 has 3 partners. 3 has 2 new ones. 5 has 1 new one. And 3 + 2 + 1 is 6.',
      hints: ['Start with 2. Who can it pair with?', 'Next is 3. It is already paired with 2, so do not count that again.'],
    },
    { t: 'viz', name: 'm13-pair-slow', caption: 'Answer each question and watch the steps box. Then try target 19 and target 100.' },
    { t: 'code', caption: 'This is the same slow way, with a step counter. One step means one pair tested. Change the target and run it.',
      code: py`
        def slow_pair(nums, target):
            steps = 0
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    steps = steps + 1
                    if nums[i] + nums[j] == target:
                        return nums[i], nums[j], steps
            return None, None, steps

        prices = [1, 3, 4, 6, 8, 11]
        print(slow_pair(prices, 10))
        print(slow_pair(prices, 19))
        print(slow_pair(prices, 100))
      `,
      output: '(4, 6, 10)\n(8, 11, 15)\n(None, None, 15)',
    },
    { t: 'p', text: 'With 6 items, the worst case is 5 + 4 + 3 + 2 + 1, which is 15 steps. Double the items, and the steps grow about 4 times. That is [[O(n^2)]].' },
    { t: 'h', text: 'Can a sorted list save you work?' },
    { t: 'words', items: [
      { word: 'two pointers', means: 'Two index numbers that walk along one list, so you can skip useless checks.' },
      { word: 'palindrome', means: 'A word that reads the same both ways, like "level".', say: 'PAL-in-drome' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Remember the two friends at the two ends of the row, from module 9? Now the row holds toys, sorted by price. Too much money? The friend with the costly toy steps in. Too little? The friend with the cheap toy steps in. This stops working if the row is mixed up. Then a step tells them nothing.' },
    { t: 'big', text: 'In a sorted list, each check rules out one item for good. So n items need at most n - 1 checks.' },
    { t: 'p', text: 'This is like [[binary search]], which throws away half the items after each check. Two pointers throw away only one item. But they find a pair, and binary search looks for one value.' },
    { t: 'steps', title: 'Why is each move safe?', items: [
      { label: 'Add the two ends', text: 'Use the smallest item and the biggest item. You want 10.', code: '1 + 11   # 12, too big' },
      { label: 'Too big? Rule out the big one', text: '1 is the smallest partner 11 could have. It is still too big. So 11 fails with every item.', code: 'right = right - 1' },
      { label: 'Too small? Rule out the small one', text: 'Now 1 + 8 is 9. And 8 is the biggest partner left. So 1 fails with every item.', code: 'left = left + 1' },
      { label: 'Stop when they meet', text: 'If both pointers sit on one item, no pair is left to test.', code: 'while left < right:' },
    ] },
    { t: 'viz', name: 'm13-pair-pointers', caption: 'Decide which pointer moves each time. Then try target 19, a list with repeats, one number, and an empty list.' },
    { t: 'q', id: 'trace-pointers', type: 'trace', level: 2,
      q: 'Count by hand. The list is `[2, 3, 5, 9]` and the target is 14. Fill in each check.',
      code: py`
        nums = [2, 3, 5, 9]
        left = 0
        right = 3
        while left < right:
            total = nums[left] + nums[right]
            print(left, right, total)
            if total == 14:
                break
            if total < 14:
                left = left + 1
            else:
                right = right - 1
      `,
      head: ['left', 'right', 'total'],
      rows: [['0', '3', '11'], ['1', '3', '12'], ['2', '3', '14']],
      given: 1,
      verify: 'nums = [2, 3, 5, 9]\nleft = 0\nright = 3\nwhile left < right:\n    total = nums[left] + nums[right]\n    print(left, right, total)\n    if total == 14:\n        break\n    if total < 14:\n        left = left + 1\n    else:\n        right = right - 1',
      explain: 'That is 3 checks. The slow way needs all 6 pairs to reach 5 + 9.',
      hints: ['Is 11 too small or too big for 14?', 'Too small means left moves. right stays on 3.'],
    },
    { t: 'code', caption: 'Now run the pointers on the toy prices. Compare these counts with the slow way above.',
      code: py`
        def find_pair(nums, target):
            left = 0
            right = len(nums) - 1
            steps = 0
            while left < right:
                steps = steps + 1
                total = nums[left] + nums[right]
                if total == target:
                    return nums[left], nums[right], steps
                if total < target:
                    left = left + 1
                else:
                    right = right - 1
            return None, None, steps

        prices = [1, 3, 4, 6, 8, 11]
        print(find_pair(prices, 10))
        print(find_pair(prices, 19))
        print(find_pair(prices, 100))
        print(find_pair([], 5))
        print(find_pair([7], 14))
      `,
      output: '(4, 6, 5)\n(8, 11, 5)\n(None, None, 5)\n(None, None, 0)\n(None, None, 0)',
    },
    { t: 'p', text: 'The gap looks small with 6 items. Now race them on bigger lists. The target -1 has no pair, so both ways do their worst.' },
    { t: 'code', caption: 'These counts are the same on every computer. Each row shows n, then the slow steps, then the pointer steps.',
      code: py`
        def slow_steps(nums, target):
            steps = 0
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    steps = steps + 1
                    if nums[i] + nums[j] == target:
                        return steps
            return steps

        def pointer_steps(nums, target):
            left = 0
            right = len(nums) - 1
            steps = 0
            while left < right:
                steps = steps + 1
                total = nums[left] + nums[right]
                if total == target:
                    return steps
                if total < target:
                    left = left + 1
                else:
                    right = right - 1
            return steps

        for n in [10, 100, 1000]:
            nums = list(range(n))
            slow = slow_steps(nums, -1)
            fast = pointer_steps(nums, -1)
            print(n, slow, fast)
      `,
      output: '10 45 9\n100 4950 99\n1000 499500 999',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Test every pair', cost: 'O(n^2)', why: 'n items make about n x n / 2 pairs.' },
      { op: 'Two pointers on a sorted list', cost: 'O(n)', why: 'Each check moves one pointer inward, so there are at most n - 1 checks.' },
      { op: 'Sort first, then two pointers', cost: 'O(n log n)', why: 'The sort is the big part. The walk after it costs only O(n).' },
    ] },
    { t: 'q', id: 'mixed-up', type: 'predict', level: 2,
      q: 'This list holds 1 + 8 and 3 + 6, and both make 9. But the list is not sorted. What will the screen show?',
      code: py`
        def has_pair(nums, target):
            left = 0
            right = len(nums) - 1
            while left < right:
                total = nums[left] + nums[right]
                if total == target:
                    return True
                if total < target:
                    left = left + 1
                else:
                    right = right - 1
            return False

        print(has_pair([1, 8, 3, 6], 9))
      `,
      options: [
        { text: 'True', why: 'You may think the pointers work on any list. On a mixed-up list, they rule out items that could work.' },
        'False',
        { text: 'IndexError', why: 'The pointers stay inside the list, so nothing goes out of range. The answer is only wrong.' },
      ],
      answer: 1,
      explain: '1 + 6 is too small, so 1 goes. 8 + 6 is too big, so 6 goes. 8 + 3 is too big, so 3 goes. The pointers meet with no pair.',
      hints: ['Follow it by hand. Start with 1 + 6.', 'Which item does each check throw away?'],
    },
    { t: 'trap',
      think: 'Two pointers work on any list.',
      real: 'They need a sorted list. On a mixed-up list, they can miss a pair that is there. So sort first.',
      code: py`
        nums = sorted([1, 8, 3, 6])   # [1, 3, 6, 8]
      `,
    },
    { t: 'tip', title: 'Do you have to sort?', text: 'Sorting costs O(n log n), and the items move. A set can find a pair with no sorting, as in module 11. That takes O(n) on average, but it uses extra memory. Two pointers need only 2 extra numbers.' },
    { t: 'tip', title: 'How to spot two pointers', text: 'Look for these words: **sorted**, **pair**, **two numbers that add to**, **[[palindrome]]**, **reverse**. Do you compare the two ends? Then walk in from both ends.' },
    { t: 'q', id: 'which-job', type: 'mcq', level: 2,
      q: 'Which job fits two pointers best?',
      options: [
        'Check if a word is a palindrome',
        { text: 'Find the biggest number in a mixed-up list', why: 'One loop and a best-so-far is enough here. A second pointer adds nothing, since no pair is compared.' },
        { text: 'Look up the price of a toy by its name', why: 'That is a job for a dict. A name goes straight to its value, with no walking.' },
      ],
      answer: 0,
      explain: 'A palindrome compares its first and last letters, then moves both inward. That is two pointers from both ends.',
      hints: ['Which job compares two spots at the same time?'],
    },
  ],
  recap: [
    'You can find a pair in a sorted list in O(n) with two pointers.',
    'You can say why each pointer move is safe, and why the list must be sorted.',
    'You can spot a job where two pointers walk in from both ends.',
  ],
  practice: [
    { id: 'why-sorted', type: 'mcq', level: 1,
      q: 'Why does the pair search need a sorted list?',
      options: [
        'So one check can rule out an item for good',
        { text: 'So the code can use index numbers', why: 'Index numbers work on any list. The order is what makes a check useful.' },
        { text: 'So the pointers do not go out of range', why: '`left < right` keeps them in range on any list. Being in range does not make the answer right.' },
      ],
      answer: 0,
      explain: 'In sorted order, the ends are the smallest and biggest items left. So "too big" tells you the big item can never work.',
      hints: ['What does "too big" tell you about the item at right?'],
    },
    { id: 'count-checks', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        nums = [1, 2, 4, 7]
        left = 0
        right = 3
        steps = 0
        while left < right:
            steps = steps + 1
            total = nums[left] + nums[right]
            if total == 6:
                break
            if total < 6:
                left = left + 1
            else:
                right = right - 1
        print(steps)
      `,
      answer: '3',
      why: '1 + 7 is 8, so right moves. Then 1 + 4 is 5, so left moves. Then 2 + 4 is 6, so that is 3 checks.',
      explain: '1 + 7 is too big. 1 + 4 is too small. 2 + 4 is 6. So the loop runs 3 times.',
      hints: ['Write down each total.', 'Add 1 to steps before each total is tested.'],
    },
    { id: 'order-reverse', type: 'order', level: 2,
      q: 'Put the lines in order to reverse the list in place. Two pointers swap the ends, then step inward.',
      lines: [
        'nums = [1, 2, 3, 4]',
        'left, right = 0, len(nums) - 1',
        'while left < right:',
        '    nums[left], nums[right] = nums[right], nums[left]',
        '    left, right = left + 1, right - 1',
        'print(nums)',
      ],
      extra: ['    left, right = left - 1, right + 1'],
      output: '[4, 3, 2, 1]',
      explain: 'Each swap fixes both ends. The pointers then step inward until they meet.',
      hints: ['Which line must come before the loop can start?', 'Do the pointers walk inward or outward?'],
    },
    { id: 'fix-meet', type: 'fix', level: 2,
      q: '`has_pair([5], 10)` says True, but one item is not a pair. Fix the loop.',
      code: py`
        def has_pair(nums, target):
            left = 0
            right = len(nums) - 1
            while left <= right:
                total = nums[left] + nums[right]
                if total == target:
                    return True
                if total < target:
                    left = left + 1
                else:
                    right = right - 1
            return False
      `,
      answer: py`
        def has_pair(nums, target):
            left = 0
            right = len(nums) - 1
            while left < right:
                total = nums[left] + nums[right]
                if total == target:
                    return True
                if total < target:
                    left = left + 1
                else:
                    right = right - 1
            return False
      `,
      tests: [
        { label: 'has_pair([5], 10) is False', call: 'has_pair([5], 10)', want: 'False' },
        { label: 'has_pair([1, 4, 6], 10) is True', call: 'has_pair([1, 4, 6], 10)', want: 'True' },
        { label: 'has_pair([1, 3, 9], 6) is False', call: 'has_pair([1, 3, 9], 6)', want: 'False' },
        { label: 'has_pair([], 3) is False', call: 'has_pair([], 3)', want: 'False' },
      ],
      explain: 'With `<=`, both pointers can sit on one item and add it to itself. With `<`, the loop stops when they meet.',
      hints: ['What are left and right when the list has one item?', 'Should the loop run when left equals right?'],
    },
    { id: 'palindrome', type: 'write', level: 2,
      q: 'Write `is_palindrome(word)` with two pointers. It gives back True if the word reads the same both ways.',
      starter: py`
        def is_palindrome(word):
            # Your code here.
            return None
      `,
      answer: py`
        def is_palindrome(word):
            left = 0
            right = len(word) - 1
            while left < right:
                if word[left] != word[right]:
                    return False
                left = left + 1
                right = right - 1
            return True
      `,
      tests: [
        { label: 'is_palindrome("level")', call: 'is_palindrome("level")', want: 'True' },
        { label: 'is_palindrome("noon")', call: 'is_palindrome("noon")', want: 'True' },
        { label: 'is_palindrome("cat")', call: 'is_palindrome("cat")', want: 'False' },
        { label: 'is_palindrome("ab")', call: 'is_palindrome("ab")', want: 'False' },
        { label: 'is_palindrome("a")', call: 'is_palindrome("a")', want: 'True' },
        { label: 'is_palindrome("")', call: 'is_palindrome("")', want: 'True' },
      ],
      explain: 'One different pair of letters ends the job. If the pointers meet with no difference, the word is a palindrome.',
      hints: ['Start left at 0 and right at the last spot.', 'If two letters differ, return False at once.', 'Move both pointers inward after each match.'],
    },
    { id: 'count-below', type: 'write', level: 3,
      q: 'Stretch: write `count_below(nums, target)`. `nums` is sorted. It counts the pairs whose total is below target. Use two pointers, with no loop inside a loop.',
      starter: py`
        def count_below(nums, target):
            # Your code here.
            return 0
      `,
      answer: py`
        def count_below(nums, target):
            left = 0
            right = len(nums) - 1
            count = 0
            while left < right:
                if nums[left] + nums[right] < target:
                    count = count + right - left
                    left = left + 1
                else:
                    right = right - 1
            return count
      `,
      tests: [
        { label: 'count_below([1, 2, 3, 4], 6)', call: 'count_below([1, 2, 3, 4], 6)', want: '4' },
        { label: 'count_below([1, 2, 3], 100)', call: 'count_below([1, 2, 3], 100)', want: '3' },
        { label: 'count_below([5, 6], 3)', call: 'count_below([5, 6], 3)', want: '0' },
        { label: 'count_below([1, 1, 1], 3)', call: 'count_below([1, 1, 1], 3)', want: '3' },
        { label: 'count_below([], 3)', call: 'count_below([], 3)', want: '0' },
      ],
      explain: 'When the two ends are below target, left works with every item up to right. So one check counts many pairs.',
      hints: ['Test the two ends. Is their total below target?', 'If it is, left pairs with every item up to right. That is `right - left` pairs.', 'Then left is done, so move it. If not, right is too big, so move it.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 13.2
Course.lesson('m13-array-patterns', {
  id: '13-2-sliding-window',
  num: '13.2',
  title: 'Sliding window: keep what you already added',
  goal: 'You can slide or stretch a window to find the best run in a list.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What is your best 3 days in a row?' },
    { t: 'p', text: 'You save coins each day: 4, 2, 7, 1, 6, 3. What is the most you saved in any 3 days in a row? First, count the work on a smaller list.' },
    { t: 'q', id: 'count-adds', type: 'mcq', level: 1,
      q: 'The list is `[4, 2, 7, 1]`. You add up each run of 2 items in a row, starting from 0 each time. How many adds is that?',
      options: [
        { text: '3', why: 'That is the number of runs. Each run needs 2 adds.' },
        { text: '4', why: 'That is the number of items. Some items get added twice.' },
        '6',
        { text: '8', why: 'That is 4 runs of 2. But only 3 runs fit: the last run starts at spot 2.' },
      ],
      answer: 2,
      explain: 'The runs are 4 and 2, then 2 and 7, then 7 and 1. That is 3 runs with 2 adds each.',
      hints: ['Write out each run of 2.', 'Count the runs, then times by 2.'],
    },
    { t: 'words', items: [
      { word: 'window', means: 'A run of items side by side, with none skipped.' },
      { word: 'sliding window', means: 'A window that moves along a list, changing only at its edges.' },
      { word: 'subarray', means: 'A piece of a list with no gaps. In a string, the same thing is a substring.', say: 'SUB-a-ray' },
    ] },
    { t: 'viz', name: 'm13-window-slow', caption: 'Watch the steps box. Then change k, and try a k bigger than the list.' },
    { t: 'code', caption: 'One step means one add. Change k and guess the step count before you run it.',
      code: py`
        def slow_best(nums, k):
            steps = 0
            best = None
            for start in range(len(nums) - k + 1):
                total = 0
                for j in range(start, start + k):
                    total = total + nums[j]
                    steps = steps + 1
                if best is None or total > best:
                    best = total
            return best, steps

        coins = [4, 2, 7, 1, 6, 3]
        print(slow_best(coins, 3))
      `,
      output: '(14, 12)',
    },
    { t: 'p', text: 'Look at the first two windows: 4, 2, 7 and then 2, 7, 1. The 2 and the 7 are in both. The slow way adds them again, and that is the wasted work.' },
    { t: 'analogy', title: 'Picture this', text: 'You sit on a slow train, and the window shows 3 houses. When the train moves, one new house comes into view and one goes out. The other houses stay. A real train window never changes size, though. Later in this lesson, ours will.' },
    { t: 'big', text: 'When a [[window]] moves one spot, only 2 things change: one item leaves and one item enters.' },
    { t: 'steps', title: 'Find the best run in 3 moves', items: [
      { label: 'Add the first window', text: 'The tool `sum` adds up a list. This costs k steps, but you do it only once.', code: 'total = sum(nums[:k])' },
      { label: 'Slide one spot', text: '`nums[i]` enters on the right. `nums[i - k]` leaves on the left.', code: 'total = total + nums[i] - nums[i - k]' },
      { label: 'Keep the best', text: 'After each slide, compare the new total with the best so far.', code: 'best = max(best, total)' },
    ] },
    { t: 'q', id: 'next-total', type: 'mcq', level: 2,
      q: 'The window holds 4, 2, 7, so its total is 13. It slides one spot. 4 leaves and 1 enters. What is the new total?',
      options: [
        { text: '14', why: 'This adds the 1 but forgets to take out the 4. Then the total covers 4 items, not 3.' },
        { text: '9', why: 'This takes out the 4 but forgets to add the 1. Then the total covers only 2 items.' },
        '10',
      ],
      answer: 2,
      explain: '13 - 4 + 1 is 10. And 2 + 7 + 1 is 10 too, but that took 3 adds.',
      hints: ['Take away what leaves. Add what enters.'],
    },
    { t: 'viz', name: 'm13-window-slide', caption: 'Work out each new total before the box does. Then try k = 1, k = 6, and all the same numbers.' },
    { t: 'q', id: 'trace-window', type: 'trace', level: 2,
      q: 'Count by hand with k = 2. The first window is 3 and 5, so total and best both start at 8.',
      code: py`
        nums = [3, 5, 2, 9]
        k = 2
        total = 8
        best = 8
        for i in range(k, len(nums)):
            total = total + nums[i] - nums[i - k]
            best = max(best, total)
            print(i, total, best)
      `,
      head: ['i', 'total', 'best'],
      rows: [['2', '7', '8'], ['3', '11', '11']],
      given: 1,
      verify: 'nums = [3, 5, 2, 9]\nk = 2\ntotal = 8\nbest = 8\nfor i in range(k, len(nums)):\n    total = total + nums[i] - nums[i - k]\n    best = max(best, total)\n    print(i, total, best)',
      explain: 'At i = 3, 9 enters and 5 leaves. 7 + 9 - 5 is 11, and that beats 8.',
      hints: ['When i is 3, which item enters?', 'nums[i - k] is nums[1], which holds 5.'],
    },
    { t: 'code', caption: 'One step means one add or one take-away. So each slide costs 2 steps. Try other values of k.',
      code: py`
        def best_run(nums, k):
            if k > len(nums):
                return None, 0
            total = sum(nums[:k])
            steps = k
            best = total
            for i in range(k, len(nums)):
                total = total + nums[i] - nums[i - k]
                steps = steps + 2
                best = max(best, total)
            return best, steps

        coins = [4, 2, 7, 1, 6, 3]
        print(best_run(coins, 3))
        print(best_run(coins, 1))
        print(best_run(coins, 9))
        big = list(range(1000))
        print(best_run(big, 100))
      `,
      output: '(14, 9)\n(7, 11)\n(None, 0)\n(94950, 1900)',
    },
    { t: 'table', caption: 'Step counts for the best run', head: ['n', 'k', 'Slow way', 'Window'], rows: [
      ['6', '1', '6', '11'],
      ['6', '3', '12', '9'],
      ['1000', '100', '90100', '1900'],
    ] },
    { t: 'tip', title: 'Does the window always win?', text: 'No. With k = 1 it takes more steps, since each slide costs 2. The window wins when the list and k are both big. Small inputs can fool you, so count the steps as n grows.' },
    { t: 'trap',
      think: 'A window finds the best 3 items anywhere in the list.',
      real: 'A window only covers items side by side. For the best 3 items from anywhere, sort the list and take the end.',
      code: py`
        coins = [4, 2, 7, 1, 6, 3]
        print(sorted(coins)[-3:])   # [4, 6, 7] from anywhere
      `,
    },
    { t: 'h', text: 'What if the window can stretch?' },
    { t: 'p', text: 'Sometimes nobody gives you the size. Find the longest run of letters with no repeats. In "robots", the answer is "bots", which has 4 letters.' },
    { t: 'code', caption: 'The slow way starts at each letter and walks until it hits a repeat. One step means one letter looked at.',
      code: py`
        def slow_longest(word):
            steps = 0
            best = 0
            for start in range(len(word)):
                seen = set()
                for letter in word[start:]:
                    steps = steps + 1
                    if letter in seen:
                        break
                    seen.add(letter)
                best = max(best, len(seen))
            return best, steps

        print(slow_longest("robots"))
        print(slow_longest("abcdefghijklmnopqrstuvwxyz"))
      `,
      output: '(4, 17)\n(26, 351)',
    },
    { t: 'p', text: 'This is where the train picture stops being true, because now the window can stretch. **right** grows it, one letter at a time. When the rule breaks, **left** shrinks it until the rule holds again.' },
    { t: 'viz', name: 'm13-window-stretch', caption: 'Watch left when a letter repeats. Then try aaaa, abba, one letter, and your own name.' },
    { t: 'code', caption: 'The tool `seen.remove` takes one letter out of the set. One step means one letter in or one letter out.',
      code: py`
        def longest(word):
            seen = set()
            left = 0
            best = 0
            steps = 0
            for right in range(len(word)):
                while word[right] in seen:
                    seen.remove(word[left])
                    left = left + 1
                    steps = steps + 1
                seen.add(word[right])
                steps = steps + 1
                best = max(best, right - left + 1)
            return best, steps

        print(longest("robots"))
        print(longest("abcdefghijklmnopqrstuvwxyz"))
        print(longest(""))
      `,
      output: '(4, 8)\n(26, 26)\n(0, 0)',
    },
    { t: 'q', id: 'while-in-for', type: 'mcq', level: 2,
      q: 'This code has a `while` inside a `for`. For a word of n letters, how many times can left move in the whole run?',
      options: [
        'At most n times',
        { text: 'About n x n times', why: 'A loop inside a loop often means that, but not here. left never goes back, so it can only walk the word once.' },
        { text: 'Only once', why: 'left can move many times. Look how far it moved in "robots" for one repeat.' },
      ],
      answer: 0,
      explain: 'left only moves forward, and it stops at the end of the word. So each letter enters once and leaves once.',
      hints: ['Does left ever move backward?', 'How far can a pointer walk if it only moves forward?'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Add every window again', cost: 'O(n x k)', why: 'About n windows, with k adds in each.' },
      { op: 'Fixed sliding window', cost: 'O(n)', why: 'k adds once, then 2 steps for each slide.' },
      { op: 'Try every start for the longest run', cost: 'O(n^2)', why: 'The worst case is when nothing repeats, so each start walks to the end.' },
      { op: 'Stretchy window', cost: 'O(n)', why: 'right and left only move forward, so there are at most 2 x n moves. Each set step is O(1) on average.' },
    ] },
    { t: 'tip', title: 'How to spot a sliding window', text: 'Look for these words: **k in a row**, **consecutive** (which means side by side), **[[subarray]]**, **substring**, **longest**, **shortest**, **at most**. A size is given? Use a fixed window. Longest or shortest with a rule? Use a stretchy window.' },
    { t: 'tip', title: 'Where the stretchy window stops working', text: 'For sums, the numbers must be 0 or more. Then growing never lowers the total, and shrinking never raises it. A negative number breaks this, so the shrink rule stops being safe.' },
  ],
  recap: [
    'You can slide a fixed window by taking one item out and adding one in.',
    'You can grow a window with right, and shrink it with left when a rule breaks.',
    'You can spot the cue words, and you know a window needs items side by side.',
  ],
  practice: [
    { id: 'what-subarray', type: 'mcq', level: 1,
      q: 'The list is `[1, 2, 3, 4]`. Which one is NOT a subarray?',
      options: [
        { text: '[2, 3]', why: '2 and 3 sit side by side in the list, so this is a subarray.' },
        '[1, 2, 4]',
        { text: '[1, 2, 3, 4]', why: 'The whole list has no gaps, so it counts as a subarray too.' },
      ],
      answer: 1,
      explain: '`[1, 2, 4]` skips the 3. A subarray has no gaps.',
      hints: ['Look for the one that skips an item.'],
    },
    { id: 'one-slide', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        nums = [5, 1, 4, 8]
        k = 3
        total = 10
        i = 3
        total = total + nums[i] - nums[i - k]
        print(total)
      `,
      answer: '13',
      why: '`nums[i - k]` is `nums[0]`, which holds 5. So 10 + 8 - 5 is 13.',
      explain: '8 enters and 5 leaves. 10 + 8 - 5 is 13, and 1 + 4 + 8 is 13 too.',
      hints: ['What is `i - k`?', 'Add the item at spot 3. Take away the item at spot 0.'],
    },
    { id: 'match-pattern', type: 'match', level: 2,
      q: 'Match each job to the idea that fits it.',
      pairs: [
        ['Most coins in 5 days in a row', 'Fixed window'],
        ['Longest run of letters with no repeats', 'Stretchy window'],
        ['Two prices in a sorted list that add to 20', 'Two pointers'],
        ['Best 3 scores from anywhere in the list', 'Sort, then take the end'],
      ],
      explain: '"In a row" with a size means a fixed window. "Longest" with a rule means a stretchy one. "Anywhere" means no window at all.',
      hints: ['Which jobs need items side by side?', 'Is the size given, or do you have to find it?'],
    },
    { id: 'fill-slide', type: 'fill', level: 2,
      q: 'Fill the gaps so the window slides, then keeps the best total.',
      code: 'nums = [2, 6, 1, 5, 8]\nk = 2\ntotal = nums[0] + nums[1]\nbest = total\nfor i in range(____, len(nums)):\n    total = total + nums[i] - nums[i - ____]\n    best = max(best, total)\nprint(best)',
      blanks: ['k', 'k'],
      output: '13',
      explain: 'The first new item is at spot k. The item that leaves is k spots behind the one that enters.',
      hints: ['Which spot holds the first item outside the first window?', 'How far behind `i` is the item that leaves?'],
    },
    { id: 'fix-shrink', type: 'fix', level: 2,
      q: '`longest("robots")` should give 4, but this gives 5. The window drops only one letter. Fix it.',
      code: py`
        def longest(word):
            seen = set()
            left = 0
            best = 0
            for right in range(len(word)):
                if word[right] in seen:
                    seen.remove(word[left])
                    left = left + 1
                seen.add(word[right])
                best = max(best, right - left + 1)
            return best
      `,
      answer: py`
        def longest(word):
            seen = set()
            left = 0
            best = 0
            for right in range(len(word)):
                while word[right] in seen:
                    seen.remove(word[left])
                    left = left + 1
                seen.add(word[right])
                best = max(best, right - left + 1)
            return best
      `,
      tests: [
        { label: 'longest("robots")', call: 'longest("robots")', want: '4' },
        { label: 'longest("abba")', call: 'longest("abba")', want: '2' },
        { label: 'longest("aaa")', call: 'longest("aaa")', want: '1' },
        { label: 'longest("")', call: 'longest("")', want: '0' },
      ],
      explain: 'The old letter may be far along the window. A `while` keeps dropping until it is gone, but an `if` drops only one.',
      hints: ['When o repeats in "robots", which letters must leave?', 'How many times does an `if` run? How about a `while`?'],
    },
    { id: 'write-best-run', type: 'write', level: 2,
      q: 'Write `best_run(nums, k)`, where k is 1 or more. It gives back the biggest total of k items in a row. If k is bigger than the list, it gives back None.',
      starter: py`
        def best_run(nums, k):
            # Your code here.
            return 0
      `,
      answer: py`
        def best_run(nums, k):
            if k > len(nums):
                return None
            total = sum(nums[:k])
            best = total
            for i in range(k, len(nums)):
                total = total + nums[i] - nums[i - k]
                best = max(best, total)
            return best
      `,
      tests: [
        { label: 'best_run([3, 5, 2, 9], 2)', call: 'best_run([3, 5, 2, 9], 2)', want: '11' },
        { label: 'The best run is the first one', call: 'best_run([9, 8, 1, 1], 2)', want: '17' },
        { label: 'The window is the whole list', call: 'best_run([1, 2, 3], 3)', want: '6' },
        { label: 'k is bigger than the list', call: 'best_run([1, 2], 5)', want: 'None' },
        { label: 'An empty list', call: 'best_run([], 1)', want: 'None' },
        { label: 'Numbers below 0', call: 'best_run([-5, -1, -3], 2)', want: '-4' },
      ],
      explain: 'Start best at the first total, not at 0, so negative totals still work. Each slide takes one item out and adds one in.',
      hints: ['Deal with k bigger than the list first.', 'Use `sum(nums[:k])` for the first window.', 'Start `i` at k. The item leaving is `nums[i - k]`.'],
    },
    { id: 'longest-under', type: 'write', level: 3,
      q: 'Stretch: write `longest_under(nums, limit)`. All the numbers are 0 or more. Give back the length of the longest run whose total is at most limit.',
      starter: py`
        def longest_under(nums, limit):
            # Your code here.
            return 0
      `,
      answer: py`
        def longest_under(nums, limit):
            left = 0
            total = 0
            best = 0
            for right in range(len(nums)):
                total = total + nums[right]
                while total > limit:
                    total = total - nums[left]
                    left = left + 1
                best = max(best, right - left + 1)
            return best
      `,
      tests: [
        { label: 'longest_under([2, 1, 3, 2, 1, 4], 6)', call: 'longest_under([2, 1, 3, 2, 1, 4], 6)', want: '3' },
        { label: 'longest_under([1, 1, 1, 5, 1], 3)', call: 'longest_under([1, 1, 1, 5, 1], 3)', want: '3' },
        { label: 'Every number is too big', call: 'longest_under([5, 6], 4)', want: '0' },
        { label: 'The whole list fits', call: 'longest_under([1, 2], 9)', want: '2' },
        { label: 'An empty list', call: 'longest_under([], 5)', want: '0' },
      ],
      explain: 'right adds one number each time. While the total is over the limit, left takes numbers out. The rule here is "total at most limit".',
      hints: ['Use the same shape as `longest`, with a total in place of the set.', 'Add `nums[right]` first. Then shrink while the total is too big.', 'The window length is `right - left + 1`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 13.3
Course.lesson('m13-array-patterns', {
  id: '13-3-prefix-sums',
  num: '13.3',
  title: 'Prefix sums: add once, answer fast',
  goal: 'You can build a prefix list and use it to answer range sums in one step.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Can you answer 100 questions fast?' },
    { t: 'p', text: 'A game keeps your points for each round: 4, 1, 3, 2, 6, 5. Your friend keeps asking for totals. What is the total from round 1 up to round 5? What about round 2 up to round 4?' },
    { t: 'words', items: [
      { word: 'range sum', means: 'The total of the items from one spot up to another.' },
      { word: 'query', means: 'One question you ask about some data, like "what is this total?"', say: 'KWEER-ee' },
      { word: 'prefix sum', means: 'The total of all the items before a spot.' },
    ] },
    { t: 'q', id: 'count-queries', type: 'mcq', level: 1,
      q: 'Count by hand. The list is `[3, 1, 4, 2]`. Three queries ask for `nums[0:4]`, `nums[1:3]` and `nums[0:4]`. If you add each one up, how many adds is that?',
      options: [
        { text: '3', why: 'That is the number of queries. Each query needs many adds.' },
        { text: '4', why: 'That is one query of the whole list. There are 3 queries here.' },
        '10',
        { text: '12', why: 'That says each query covers 4 items. But `nums[1:3]` covers only 2, since spot 3 stays out.' },
      ],
      answer: 2,
      explain: 'The first query needs 4 adds, the second needs 2, and the third needs 4. So that is 10.',
      hints: ['How many items does `nums[1:3]` hold?', 'Add up the sizes of the 3 slices.'],
    },
    { t: 'code', caption: 'Here is the slow way, with a step counter. One step means one add. Add another query and guess the new count.',
      code: py`
        nums = [4, 1, 3, 2, 6, 5]
        asks = [(0, 6), (1, 5), (2, 4)]
        steps = 0

        for a, b in asks:
            total = 0
            for i in range(a, b):
                total = total + nums[i]
                steps = steps + 1
            print(a, b, total)

        print("steps:", steps)
      `,
      output: '0 6 21\n1 5 12\n2 4 5\nsteps: 12',
    },
    { t: 'analogy', title: 'Picture this', text: 'A long road has signs that say how far you are from the start. To find the distance between two signs, you subtract. You do not walk it. This stops being true if the list changes: a road stays put, but one changed item makes many totals wrong.' },
    { t: 'big', text: 'The total from spot a up to spot b is `prefix[b] - prefix[a]`. Spot b stays out, the same as in a slice.' },
    { t: 'steps', title: 'Build the signs, then read them', items: [
      { label: 'Start with 0', text: 'Before any item, the total is 0. This makes spot 0 work like every other spot.', code: 'prefix = [0]' },
      { label: 'Add one item at a time', text: 'Each new total is the last total plus the next item.', code: 'for n in nums:\n    prefix.append(prefix[-1] + n)' },
      { label: 'Read what it means', text: '`prefix[i]` is the total of the first i items. So it has one more spot than nums.', code: '# nums   [4, 1, 3]\n# prefix [0, 4, 5, 8]' },
    ] },
    { t: 'viz', name: 'm13-prefix-build', caption: 'Work out each total before it shows. Then try negative numbers, one number, and an empty list.' },
    { t: 'q', id: 'build-prefix', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        nums = [2, 5, 1]
        prefix = [0]
        for n in nums:
            prefix.append(prefix[-1] + n)
        print(prefix)
      `,
      options: [
        { text: '[2, 7, 8]', why: 'You may have skipped the 0 that the list starts with. prefix has one more spot than nums.' },
        { text: '[0, 2, 5, 1]', why: 'That copies each item. Each new spot adds the item to the last total.' },
        '[0, 2, 7, 8]',
      ],
      answer: 2,
      explain: 'It starts at 0. Then 0 + 2 is 2, 2 + 5 is 7, and 7 + 1 is 8.',
      hints: ['What is in prefix before the loop?', 'Each new value is the last value plus n.'],
    },
    { t: 'h', text: 'Why does the subtraction work?' },
    { t: 'p', text: '`prefix[5]` covers spots 0 to 4. `prefix[1]` covers spot 0. Take one from the other, and spots 1 to 4 are left.' },
    { t: 'viz', name: 'm13-range-race', caption: 'Pick the right subtraction, and compare the two step boxes. Then change a and b. Try a = b, and try a after b.' },
    { t: 'q', id: 'pick-range', type: 'mcq', level: 2,
      q: 'Here `prefix` is `[0, 4, 5, 8, 10, 16, 21]`. Which line gives the total of `nums[2:5]`?',
      options: [
        '`prefix[5] - prefix[2]`',
        { text: '`prefix[4] - prefix[2]`', why: 'This covers only spots 2 and 3. You may have aimed at the last item, but `prefix[4]` stops before spot 4.' },
        { text: '`prefix[5] - prefix[1]`', why: 'This also counts spot 1. `prefix[1]` takes away too little, since it covers only spot 0.' },
      ],
      answer: 0,
      explain: 'Use the same two numbers as the slice. `prefix[5] - prefix[2]` is 16 - 5, which is 11.',
      hints: ['Look at the two numbers in the slice.', '`nums[a:b]` matches `prefix[b] - prefix[a]`.'],
    },
    { t: 'code', caption: 'Same queries as the slow way. One step means one add or one take-away. Compare with the 12 steps above.',
      code: py`
        nums = [4, 1, 3, 2, 6, 5]
        asks = [(0, 6), (1, 5), (2, 4)]
        steps = 0

        prefix = [0]
        for n in nums:
            prefix.append(prefix[-1] + n)
            steps = steps + 1

        for a, b in asks:
            print(a, b, prefix[b] - prefix[a])
            steps = steps + 1

        print("steps:", steps)
      `,
      output: '0 6 21\n1 5 12\n2 4 5\nsteps: 9',
    },
    { t: 'p', text: 'Now race on a list of 1000 items, where each query covers the whole list. Try it with 1 query, then with 100.' },
    { t: 'code', caption: 'Each row shows the slow steps, then the prefix steps. Change the 100, and guess first.',
      code: py`
        def slow_steps(nums, asks):
            steps = 0
            for a, b in asks:
                total = 0
                for i in range(a, b):
                    total = total + nums[i]
                    steps = steps + 1
            return steps

        def prefix_steps(nums, asks):
            steps = 0
            prefix = [0]
            for n in nums:
                prefix.append(prefix[-1] + n)
                steps = steps + 1
            for a, b in asks:
                answer = prefix[b] - prefix[a]
                steps = steps + 1
            return steps

        nums = list(range(1000))
        one = [(0, 1000)]
        many = [(0, 1000)] * 100
        print(slow_steps(nums, one), prefix_steps(nums, one))
        print(slow_steps(nums, many), prefix_steps(nums, many))
      `,
      output: '1000 1001\n100000 1100',
    },
    { t: 'p', text: 'With one query, the prefix list does not help at all. It pays off when the [[queries|query]] are many.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'One range sum with a loop', cost: 'O(n)', why: 'It adds b - a items, and that can be the whole list.' },
      { op: 'Build the prefix list', cost: 'O(n)', why: 'One add per item, done once. It also holds n + 1 extra numbers.' },
      { op: 'One range sum with prefix', cost: 'O(1)', why: 'Two look-ups by index and one take-away, however long the list is.' },
      { op: 'Change one item, then rebuild', cost: 'O(n)', why: 'A change near the start makes nearly every total wrong.' },
    ] },
    { t: 'trap',
      think: '`prefix[b] - prefix[a]` includes the item at spot b.',
      real: 'Spot b stays out, the same as in a slice. If a question says both ends count, use `b + 1`.',
      code: py`
        total = prefix[b] - prefix[a]       # like nums[a:b]
        total = prefix[b + 1] - prefix[a]   # a to b, both in
      `,
    },
    { t: 'tip', title: 'What about negative numbers?', text: 'Prefix sums work with them. The stretchy window from lesson 13.2 needs numbers of 0 or more for sums. Subtraction has no such limit. Later, module 27 shows how to handle a list that keeps changing.' },
    { t: 'h', text: 'Which pattern fits?' },
    { t: 'table', caption: 'Read the question. Look for these words.', head: ['You see', 'Try'], rows: [
      ['sorted, pair, palindrome, reverse, in place', 'Two pointers'],
      ['k in a row, consecutive', 'Fixed window'],
      ['longest or shortest run with a rule', 'Stretchy window'],
      ['many range totals, a list that stays the same', 'Prefix sums'],
    ] },
    { t: 'q', id: 'match-cues', type: 'match', level: 2,
      q: 'Match each job to the pattern that fits it best.',
      pairs: [
        ['Total of `nums[a:b]`, asked 500 times', 'Prefix sums'],
        ['Biggest total of 7 days in a row', 'Fixed window'],
        ['Shortest run with total at least 20', 'Stretchy window'],
        ['Is this word a palindrome?', 'Two pointers'],
      ],
      explain: '"Asked 500 times" points to prefix sums. "In a row" with a size points to a fixed window. "Shortest" points to a stretchy one.',
      hints: ['Which job has many queries on a list that stays the same?', 'Which job compares both ends of something?'],
    },
  ],
  recap: [
    'You can build a prefix list that starts with 0.',
    'You can answer any range sum with `prefix[b] - prefix[a]`.',
    'You know prefix sums pay off with many queries on a list that stays the same.',
  ],
  practice: [
    { id: 'read-prefix', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        nums = [5, 2, 8]
        prefix = [0]
        for n in nums:
            prefix.append(prefix[-1] + n)
        print(prefix[2])
      `,
      answer: '7',
      why: '`prefix[2]` is the total of the first 2 items, and 5 + 2 is 7.',
      explain: 'prefix is `[0, 5, 7, 15]`, and spot 2 holds 7.',
      hints: ['Write out the whole prefix list first.'],
    },
    { id: 'mean-prefix', type: 'mcq', level: 1,
      q: 'What does `prefix[4]` mean?',
      options: [
        'The total of the first 4 items',
        { text: 'The item at spot 4', why: 'That would be `nums[4]`. The prefix list holds totals, not items.' },
        { text: 'The total of spots 0 to 4', why: 'That is 5 items, so one too many. `prefix[4]` stops before spot 4.' },
      ],
      answer: 0,
      explain: '`prefix[i]` adds up the i items before spot i. So `prefix[4]` covers spots 0, 1, 2 and 3.',
      hints: ['What does `prefix[0]` hold? How many items does that cover?'],
    },
    { id: 'stale-prefix', type: 'predict', level: 2,
      q: 'One item changes after the prefix list is built. What will the screen show?',
      code: py`
        nums = [1, 2, 3]
        prefix = [0]
        for n in nums:
            prefix.append(prefix[-1] + n)
        nums[0] = 100
        print(prefix[2] - prefix[0])
      `,
      options: [
        { text: '102', why: 'You may think prefix follows nums. It is a separate list of old totals, and nothing updates it.' },
        '3',
        { text: 'IndexError', why: 'Spots 2 and 0 are both in the list, so nothing is out of range. The answer is only out of date.' },
      ],
      answer: 1,
      explain: 'prefix still holds the old totals, so the answer is stale. To fix it, you must build prefix again, and that costs O(n).',
      hints: ['Does changing nums touch prefix?'],
    },
    { id: 'fill-build', type: 'fill', level: 2,
      q: 'Fill the gaps. The screen should show the total of `nums[1:3]`.',
      code: 'nums = [6, 2, 9, 4]\nprefix = [____]\nfor n in nums:\n    prefix.append(prefix[-1] + n)\nprint(prefix[____] - prefix[1])',
      blanks: ['0', '3'],
      output: '11',
      explain: 'The list starts with 0. Then `prefix[3] - prefix[1]` is 17 - 6, which is 11.',
      hints: ['What is the total before any item?', 'Use the same numbers as the slice `nums[1:3]`.'],
    },
    { id: 'fix-both-ends', type: 'fix', level: 2,
      q: '`between` should add spots a to b, with both ends included. It leaves out spot b. Fix it.',
      code: py`
        def between(prefix, a, b):
            return prefix[b] - prefix[a]
      `,
      answer: py`
        def between(prefix, a, b):
            return prefix[b + 1] - prefix[a]
      `,
      tests: [
        { label: 'Spots 0 to 1 of [4, 1, 3]', call: 'between([0, 4, 5, 8], 0, 1)', want: '5' },
        { label: 'Spots 1 to 2 of [4, 1, 3]', call: 'between([0, 4, 5, 8], 1, 2)', want: '4' },
        { label: 'Spot 2 alone', call: 'between([0, 4, 5, 8], 2, 2)', want: '3' },
      ],
      explain: '`prefix[b]` stops before spot b. To include spot b, use `prefix[b + 1]`.',
      hints: ['Which spots does `prefix[b]` cover?', 'You need the total that also covers spot b.'],
    },
    { id: 'write-build', type: 'write', level: 2,
      q: 'Write `build_prefix(nums)`. It gives back the prefix list, starting with 0.',
      starter: py`
        def build_prefix(nums):
            # Your code here.
            return []
      `,
      answer: py`
        def build_prefix(nums):
            prefix = [0]
            for n in nums:
                prefix.append(prefix[-1] + n)
            return prefix
      `,
      tests: [
        { label: 'build_prefix([4, 1, 3])', call: 'build_prefix([4, 1, 3])', want: '[0, 4, 5, 8]' },
        { label: 'build_prefix([]) is [0]', call: 'build_prefix([])', want: '[0]' },
        { label: 'build_prefix([7])', call: 'build_prefix([7])', want: '[0, 7]' },
        { label: 'Numbers below 0 work', call: 'build_prefix([2, -5, 3])', want: '[0, 2, -3, 0]' },
      ],
      explain: 'Start with `[0]`. Then each item adds one new total to the end.',
      hints: ['What goes in the list before the loop?', '`prefix[-1]` is the last total so far.'],
    },
    { id: 'evens-in', type: 'write', level: 3,
      q: 'Stretch: write `evens_in(nums, asks)`. Each ask is a pair `(a, b)`. Give back a list that says how many even numbers are in each `nums[a:b]`. Build one prefix list, with no loop inside a query.',
      starter: py`
        def evens_in(nums, asks):
            # Your code here.
            return []
      `,
      answer: py`
        def evens_in(nums, asks):
            prefix = [0]
            for n in nums:
                if n % 2 == 0:
                    prefix.append(prefix[-1] + 1)
                else:
                    prefix.append(prefix[-1])
            return [prefix[b] - prefix[a] for a, b in asks]
      `,
      tests: [
        { label: 'Two queries', call: 'evens_in([1, 2, 4, 5, 6], [(0, 5), (1, 3)])', want: '[3, 2]' },
        { label: 'A query with no even numbers', call: 'evens_in([1, 3, 5], [(0, 3)])', want: '[0]' },
        { label: 'An empty range', call: 'evens_in([2, 4], [(1, 1)])', want: '[0]' },
        { label: 'No queries', call: 'evens_in([2, 4], [])', want: '[]' },
      ],
      explain: 'The prefix idea works for counts too. Each spot holds how many even numbers came before it.',
      hints: ['Think of each even number as a 1, and each odd number as a 0.', 'Build prefix from those 1s and 0s.', 'Each answer is `prefix[b] - prefix[a]`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 13.4
Course.lesson('m13-array-patterns', {
  id: '13-4-read-and-write',
  num: '13.4',
  title: 'Read and write pointers: clean a list in place',
  goal: 'You can remove repeats from a sorted list in place, with 2 pointers.',
  mins: 13,
  steps: [
    { t: 'h', text: 'What if both pointers walk the same way?' },
    { t: 'p', text: 'In lesson 13.2, left and right both walked forward. Now use that idea on a new job. A sorted list has repeats, and you must remove them [[in place]]. The plain way deletes each repeat, but then every later item must shift.' },
    { t: 'code', caption: 'One step means one look at an item, or one item that shifts. Add a longer list of 4s and run it.',
      code: py`
        def slow_clean(nums):
            steps = 0
            i = 1
            while i < len(nums):
                steps = steps + 1
                if nums[i] == nums[i - 1]:
                    steps = steps + len(nums) - i - 1
                    nums.pop(i)
                else:
                    i = i + 1
            return steps

        print(slow_clean([2, 2, 5, 5, 7, 8]))
        print(slow_clean([4, 4, 4, 4, 4, 4]))
      `,
      output: '11\n15',
    },
    { t: 'p', text: 'Now the two friends from lesson 13.1 start at the same end. **read** walks ahead and looks at each item. **write** marks the next spot to fill, like the [[write index]] in module 9. The list is sorted, so repeats sit side by side, and you need no set.' },
    { t: 'viz', name: 'm13-clean', caption: 'Say if each item is new or a repeat. Then try all the same numbers, all different numbers, and one number.' },
    { t: 'big', text: 'read looks at every item. write moves only when an item stays.' },
    { t: 'q', id: 'trace-read-write', type: 'trace', level: 2,
      q: 'Count by hand. The list is `[1, 1, 2, 3, 3]`. Fill in the value read sees, and write after that trip.',
      code: py`
        nums = [1, 1, 2, 3, 3]
        write = 1
        for read in range(1, len(nums)):
            value = nums[read]
            if value != nums[write - 1]:
                nums[write] = value
                write = write + 1
            print(read, value, write)
      `,
      head: ['read', 'value', 'write'],
      rows: [['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '3', '3']],
      given: 1,
      verify: 'nums = [1, 1, 2, 3, 3]\nwrite = 1\nfor read in range(1, len(nums)):\n    value = nums[read]\n    if value != nums[write - 1]:\n        nums[write] = value\n        write = write + 1\n    print(read, value, write)\n',
      explain: 'write moves only for a new value. It ends at 3, because 3 different values stay.',
      hints: ['The last kept value sits right before write.', 'Is this value the same as the last kept value? Then write stays.'],
    },
    { t: 'code', caption: 'nums[:count] is the clean part. The rest of the list is old leftovers. Run it, then try `[4, 4, 4, 4, 4, 4]`.',
      code: py`
        def clean(nums):
            if len(nums) == 0:
                return 0, 0
            write = 1
            steps = 0
            for read in range(1, len(nums)):
                steps = steps + 1
                if nums[read] != nums[write - 1]:
                    nums[write] = nums[read]
                    write = write + 1
                    steps = steps + 1
            return write, steps

        nums = [2, 2, 5, 5, 7, 8]
        count, steps = clean(nums)
        print(count, steps)
        print(nums[:count])
        print(nums)
      `,
      output: '4 8\n[2, 5, 7, 8]\n[2, 5, 7, 8, 7, 8]',
    },
    { t: 'cost', title: 'Removing repeats', items: [
      { op: 'Delete each repeat with pop(i)', cost: 'O(n^2)', why: '`nums.pop(i)` costs O(n - i), and you may do it about n times.' },
      { op: 'read and write pointers', cost: 'O(n)', why: 'read passes each item once, and each item is copied at most once.' },
    ] },
    { t: 'q', id: 'leftovers', type: 'predict', level: 2,
      q: 'The function keeps the list the same length. What will the screen show?',
      code: py`
        def clean(nums):
            write = 1
            for read in range(1, len(nums)):
                if nums[read] != nums[write - 1]:
                    nums[write] = nums[read]
                    write = write + 1
            return write

        nums = [1, 1, 2]
        print(clean(nums))
        print(nums)
      `,
      options: [
        { text: '2\n[1, 2]', why: 'You may think the leftovers vanish. Copying a value never makes the list shorter.' },
        '2\n[1, 2, 2]',
        { text: '3\n[1, 1, 2]', why: 'The second 1 is a repeat, so it is not kept. And the 2 gets copied into spot 1.' },
      ],
      answer: 1,
      explain: 'The 2 is copied into spot 1, but it also stays in spot 2. The clean part is the first 2 items.',
      hints: ['Which value gets copied, and into which spot?', 'Does anything make the list shorter?'],
    },
    { t: 'tip', title: 'How to spot it', text: 'Look for **in place**, **remove repeats** or **keep some items**. Do you keep some items, in order? Then walk the same way. Do you compare the two ends? Then walk in from both ends, as in lesson 13.1.' },
    { t: 'q', id: 'which-way', type: 'mcq', level: 2,
      q: 'Which job fits read and write pointers best?',
      options: [
        'Remove every 0 from a list, in place, and keep the order',
        { text: 'Find 2 prices in a sorted list that add to 20', why: 'That job compares both ends. So walk in from both ends, as in lesson 13.1.' },
        { text: 'Find the biggest total of 3 items in a row', why: 'Items in a row point to a window, as in lesson 13.2.' },
      ],
      answer: 0,
      explain: 'read checks each item, and write fills the next spot with each item you keep.',
      hints: ['Which job keeps some items and drops others?'],
    },
  ],
  recap: [
    'You can clean a sorted list in place with read and write.',
    'You can say what the leftovers at the end of the list are.',
    'You can say why this is O(n), and why deleting each repeat is O(n^2).',
  ],
  practice: [
    { id: 'what-write-marks', type: 'mcq', level: 1,
      q: 'What does write mark?',
      options: [
        'The next spot to fill',
        { text: 'The item being checked', why: 'That is read. It walks ahead and looks at each item.' },
        { text: 'The last spot in the list', why: 'write starts near the front. It moves only when an item stays.' },
      ],
      answer: 0,
      explain: 'Everything before write is the clean part. So write is where the next kept item goes.',
      hints: ['Which pointer moves on every trip? Which one does not?'],
    },
    { id: 'fill-clean', type: 'fill', level: 2,
      q: 'Fill the gaps. This counts the different values in a sorted list. write marks the next spot to fill.',
      code: 'nums = [3, 3, 4, 9, 9]\nwrite = 1\nfor read in range(1, len(nums)):\n    if nums[read] != nums[____]:\n        nums[____] = nums[read]\n        write = write + 1\nprint(write)',
      blanks: [['write - 1', 'write-1'], 'write'],
      output: '3',
      explain: 'The last value you kept sits right before write. A new value goes into the spot at write.',
      hints: ['write is the next free spot. So where is the last value you kept?', 'Which pointer marks the spot to fill?'],
    },
    { id: 'kept-count', type: 'predict', level: 2,
      q: 'Type what the screen will show.',
      code: py`
        nums = [5, 5, 5, 6, 6]
        write = 1
        for read in range(1, len(nums)):
            if nums[read] != nums[write - 1]:
                nums[write] = nums[read]
                write = write + 1
        print(write)
      `,
      answer: '2',
      explain: 'The first 5 stays, and the 5s after it are skipped. The first 6 is new, so write moves once. The second 6 is skipped.',
      hints: ['How many different values does the list hold?'],
    },
    { id: 'fix-stuck-write', type: 'fix', level: 2,
      q: '`clean([1, 1, 2, 3])` should give 3, but it gives 1. One line is missing. Fix it.',
      code: py`
        def clean(nums):
            if len(nums) == 0:
                return 0
            write = 1
            for read in range(1, len(nums)):
                if nums[read] != nums[write - 1]:
                    nums[write] = nums[read]
            return write
      `,
      answer: py`
        def clean(nums):
            if len(nums) == 0:
                return 0
            write = 1
            for read in range(1, len(nums)):
                if nums[read] != nums[write - 1]:
                    nums[write] = nums[read]
                    write = write + 1
            return write
      `,
      tests: [
        { label: 'clean([1, 1, 2, 3])', call: 'clean([1, 1, 2, 3])', want: '3' },
        { label: 'clean([7, 7])', call: 'clean([7, 7])', want: '1' },
        { label: 'clean([])', call: 'clean([])', want: '0' },
      ],
      explain: 'After each kept item, write must move on. If not, the next kept item lands on top of this one.',
      hints: ['Does write ever change?', 'Add 1 to write right after you fill its spot.'],
    },
    { id: 'remove-value', type: 'write', level: 2,
      q: 'Write `remove_value(nums, x)`. It moves every item that is not x to the front, in order, in place. It gives back how many it kept. The list may be in any order.',
      starter: py`
        def remove_value(nums, x):
            # Your code here.
            return 0
      `,
      answer: py`
        def remove_value(nums, x):
            write = 0
            for read in range(len(nums)):
                if nums[read] != x:
                    nums[write] = nums[read]
                    write = write + 1
            return write
      `,
      tests: [
        { label: 'remove_value([3, 1, 3, 2], 3)', call: 'remove_value([3, 1, 3, 2], 3)', want: '2' },
        { label: 'The kept items come first, in order', check: '(lambda a: a[:remove_value(a, 3)] == [1, 2])([3, 1, 3, 2])' },
        { label: 'Every item matches', call: 'remove_value([4, 4], 4)', want: '0' },
        { label: 'No item matches', call: 'remove_value([1, 2], 9)', want: '2' },
        { label: 'An empty list', call: 'remove_value([], 1)', want: '0' },
      ],
      explain: 'Here the first item may go too, so write and read both start at 0. Each item you keep goes into the spot at write.',
      hints: ['Should write start at 0 or at 1 here?', 'Copy `nums[read]` to the spot at write when it is not x.', 'Give back write at the end.'],
    },
    { id: 'write-clean', type: 'write', level: 3,
      q: 'Stretch: write `clean(nums)`. Remove repeats from the sorted list in place, and give back how many values you kept.',
      starter: py`
        def clean(nums):
            # Your code here.
            return 0
      `,
      answer: py`
        def clean(nums):
            if len(nums) == 0:
                return 0
            write = 1
            for read in range(1, len(nums)):
                if nums[read] != nums[write - 1]:
                    nums[write] = nums[read]
                    write = write + 1
            return write
      `,
      tests: [
        { label: 'clean([1, 1, 2, 3, 3])', call: 'clean([1, 1, 2, 3, 3])', want: '3' },
        { label: 'clean([]) with no crash', call: 'clean([])', want: '0' },
        { label: 'clean([6])', call: 'clean([6])', want: '1' },
        { label: 'clean([4, 4, 4])', call: 'clean([4, 4, 4])', want: '1' },
        { label: 'The same list holds the clean part', check: '(lambda a: a[:clean(a)] == [1, 2, 5])([1, 1, 2, 5, 5])' },
      ],
      explain: 'read finds each new value, and it goes into the spot at write. At the end, write equals the number of values kept.',
      hints: ['Handle the empty list first.', 'The first item always stays, so start write and read at 1.', 'Compare with `nums[write - 1]`, the last value you kept.'],
    },
  ],
});
