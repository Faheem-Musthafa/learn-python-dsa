/* Module 20: Heaps and Priority Queues. Part 3 (Trees, graphs and clever ideas). */
Course.module({
  id: 'm20-heaps',
  num: 20, part: 3, level: 'I',
  title: 'Heaps and Priority Queues',
  blurb: 'Always get the most urgent item next, with a tree that lives in a list.',
  needs: ['m09-arrays', 'm18-trees'],
});

// ---------------------------------------------------------------- lesson 20.1
Course.lesson('m20-heaps', {
  id: '20-1-tree-in-a-list',
  num: '20.1',
  title: 'A heap: a tree that lives in a list',
  goal: 'You can find a spot\'s parent and children, and test if a list is a heap.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Who should go next?' },
    { t: 'p', text: 'Three people wait at a hospital. Ann came first, with a sore toe. Bo came next, with a broken arm. Cy came last, and cannot breathe well.' },
    { t: 'q', id: 'spark-who', type: 'mcq', level: 1,
      q: 'A canteen line serves whoever came first. Who should the hospital see first?',
      options: [
        { text: 'Ann', why: 'That is a queue: first come, first served. A hospital goes by who is most urgent.' },
        { text: 'Bo', why: 'A broken arm is urgent. But not being able to breathe is more urgent.' },
        'Cy',
      ],
      answer: 2,
      explain: 'Cy came last, but Cy is the most urgent. So the order they came in does not decide.',
      hints: ['Which of the 3 cannot wait?'],
    },
    { t: 'words', items: [
      { word: 'priority queue', means: 'A waiting list where the most urgent item leaves next.', say: 'pry-OR-it-ee KYOO' },
      { word: 'heap', means: 'A tree stored in a list, where the top item is the smallest.', say: 'HEEP' },
      { word: 'heap rule', means: 'Every parent is no bigger than its children.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[priority queue]] is a hospital waiting room. Each person gets a number, and 1 means most urgent. The lowest number goes next. Unlike a nurse, a [[heap]] does not know the whole order. It only knows who is next.' },
    { t: 'h', text: 'Why not use a plain list?' },
    { t: 'p', text: 'Keep the numbers in a plain list, and `min` finds the lowest. Count how many items it must look at, every time someone leaves.' },
    { t: 'q', id: 'count-min', type: 'trace', level: 2,
      q: '`remove` takes one item out of a list. Fill in who leaves next, and how many items `min` looked at.',
      code: py`
        waiting = [5, 2, 8, 1]
        while len(waiting) > 0:
            looks = len(waiting)
            next_one = min(waiting)
            waiting.remove(next_one)
            print(next_one, looks)
      `,
      head: ['next_one', 'looks'],
      rows: [['1', '4'], ['2', '3'], ['5', '2'], ['8', '1']],
      given: 1,
      verify: 'waiting = [5, 2, 8, 1]\nwhile len(waiting) > 0:\n    looks = len(waiting)\n    next_one = min(waiting)\n    waiting.remove(next_one)\n    print(next_one, looks)',
      explain: '`min` must look at every item, or it could miss the lowest. That is 4 + 3 + 2 + 1 looks for 4 people.',
      hints: ['`min` looks at everyone who is still waiting.', 'One person leaves on each trip.'],
    },
    { t: 'p', text: 'A sorted list has the opposite trouble. Taking the lowest is quick, but each new arrival must shift others along. A [[heap]] is cheap at both jobs. Lesson 20.2 shows how much.' },
    { t: 'h', text: 'How can a tree live in a list?' },
    { t: 'p', text: 'Remember that a list is a row of numbered lockers. Read a tree one level at a time, from left to right. Put each value in the next locker. Now you need no arrows.' },
    { t: 'viz', name: 'm20-tree-list', caption: 'Answer each question, and check the sum against the tree. Then pick another spot. Try the root, and try a leaf.' },
    { t: 'big', text: 'A heap is a tree stored in a list. Simple sums take the place of arrows.' },
    { t: 'steps', title: 'The 3 sums, for the item in spot i', noun: 'Sum', items: [
      { label: 'Left child', text: 'Double the spot, then add 1.', code: 'left = 2 * i + 1' },
      { label: 'Right child', text: 'It is always next to the left child.', code: 'right = 2 * i + 2' },
      { label: 'Parent', text: 'Take away 1, then halve and round down.', code: 'parent = (i - 1) // 2' },
    ] },
    { t: 'tip', title: 'Why do the sums work?', text: 'The list fills with no gaps. Before the children of spot i come the root, and 2 children for each earlier spot. That makes 2 * i + 1 items, so the left child lands at that spot.' },
    { t: 'code', caption: 'Run it. Then set i to 0, and to 2. Guess the 4 values before you run.',
      code: py`
        heap = [2, 5, 3, 9, 6, 4]
        i = 1
        print("value:", heap[i])
        print("left:", heap[2 * i + 1])
        print("right:", heap[2 * i + 2])
        print("parent:", heap[(i - 1) // 2])
      `,
      output: 'value: 5\nleft: 9\nright: 6\nparent: 2',
    },
    { t: 'q', id: 'parent-of-4', type: 'predict', level: 2,
      q: 'Which spot is the parent of spot 4?',
      code: py`
        i = 4
        print((i - 1) // 2)
      `,
      options: [
        '1',
        { text: '2', why: 'You may have left out the minus 1. `4 // 2` is 2, but the children of spot 2 are spots 5 and 6.' },
        { text: '1.5', why: 'One `/` would give 1.5. `//` drops the part after the point, and a spot must be whole.' },
      ],
      answer: 0,
      explain: '4 - 1 is 3, and `3 // 2` is 1. Check it: the children of spot 1 are spots 3 and 4.',
      hints: ['Work out the brackets first.', '`//` drops any part after the point.'],
    },
    { t: 'q', id: 'fill-sums', type: 'fill', level: 2,
      q: 'Fill the gaps, so all 3 functions give the right spot.',
      code: py`
        def left(i):
            return 2 * i + ____

        def right(i):
            return 2 * i + ____

        def parent(i):
            return (i - ____) // 2

        print(left(2), right(2), parent(2))
      `,
      blanks: ['1', '2', '1'],
      output: '5 6 0',
      explain: 'The children of spot 2 are spots 5 and 6. Its parent is spot 0, the root.',
      hints: ['The list starts at spot 0. So the root has children at spots 1 and 2.'],
    },
    { t: 'trap',
      think: 'The sums always give a real spot.',
      real: 'A leaf has no children, so its sum goes past the end. Then Python stops with an IndexError. So check `2 * i + 1 < len(heap)` first.',
      code: py`
        heap = [2, 5, 3]
        heap[2 * 1 + 1]   # spot 3: IndexError
      `,
    },
    { t: 'code', caption: 'The root has no parent, but look what the sum gives. Python gives no warning here. So never ask for the parent of spot 0.',
      code: py`
        heap = [2, 5, 3]
        i = 0
        print((i - 1) // 2)
        print(heap[(i - 1) // 2])
      `,
      output: '-1\n3',
    },
    { t: 'h', text: 'What makes a list a heap?' },
    { t: 'p', text: 'Any list can be drawn as a tree. It is a heap only if it keeps the [[heap rule]]. Each item must be at least as big as its parent. The rule says nothing about items side by side.' },
    { t: 'viz', name: 'm20-check-heap', caption: 'Decide for each pair. Then try a list that is sorted, one that breaks the rule, and one with repeats.' },
    { t: 'code', caption: 'Each item checks its parent once. Try your own lists. Guess first.',
      code: py`
        def is_heap(h):
            for i in range(1, len(h)):
                parent = (i - 1) // 2
                if h[parent] > h[i]:
                    return False
            return True

        print(is_heap([1, 4, 2, 7, 5, 3]))
        print(is_heap([1, 2, 3, 4, 5, 6]))
        print(is_heap([3, 1, 2]))
        print(is_heap([]))
      `,
      output: 'True\nTrue\nFalse\nTrue',
    },
    { t: 'q', id: 'is-it-a-heap', type: 'predict', level: 2,
      q: 'The root is the smallest here. Is the whole list a heap?',
      code: py`
        def is_heap(h):
            for i in range(1, len(h)):
                parent = (i - 1) // 2
                if h[parent] > h[i]:
                    return False
            return True

        print(is_heap([2, 6, 3, 7, 5]))
      `,
      options: [
        { text: 'True', why: 'You may be checking the root only. The rule holds for every parent, and spot 1 holds 6 with a child of 5.' },
        'False',
        { text: 'IndexError', why: 'The loop only looks up at parents. Every parent spot is real, so no index goes too far.' },
      ],
      answer: 1,
      explain: 'Spot 4 holds 5. Its parent is spot 1, which holds 6. A parent is bigger than its child, so the rule breaks.',
      hints: ['Draw the tree, or use the parent sum on spot 4.'],
    },
    { t: 'p', text: 'So a heap is **not** a sorted list. Every sorted list keeps the rule, but most heaps are not sorted. Run this to see it.' },
    { t: 'code', caption: 'A real heap, and the proof that it is not sorted. Spot 1 does not hold the second smallest.',
      code: py`
        h = [1, 4, 2, 7, 5, 3]
        print(h == sorted(h))
        print("h[1] is", h[1])
        print("second smallest is", sorted(h)[1])
      `,
      output: 'False\nh[1] is 4\nsecond smallest is 2',
    },
    { t: 'trap',
      think: '`h[1]` is the second smallest.',
      real: 'The second smallest is always a child of the root. But it may be on either side, so check spot 1 and spot 2. Only `h[0]` has a promise.',
    },
    { t: 'h', text: 'How tall can the tree get?' },
    { t: 'p', text: 'Each level fills before the next one starts, so the tree never grows thin and tall. Each level holds twice as many as the last. Count the levels for some sizes.' },
    { t: 'code', caption: 'A million items fit in 20 levels. Try other sizes.',
      code: py`
        def levels(n):
            count = 0
            while n > 0:
                n = n // 2
                count = count + 1
            return count

        for n in [1, 3, 7, 15, 1000, 1000000]:
            print(n, "items:", levels(n), "levels")
      `,
      output: '1 items: 1 levels\n3 items: 2 levels\n7 items: 3 levels\n15 items: 4 levels\n1000 items: 10 levels\n1000000 items: 20 levels',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Look at the smallest, `h[0]`', cost: 'O(1)', why: 'It is always in spot 0, so one jump gets it.' },
      { op: 'Find a parent or a child', cost: 'O(1)', why: 'One sum, then one jump to that locker.' },
      { op: 'Test if a list is a heap', cost: 'O(n)', why: 'Each item checks its parent once.' },
      { op: 'Find some other value in a heap', cost: 'O(n)', why: 'The rule does not say which side to go. So you may walk the whole list.' },
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Look for "most urgent next", "smallest next" or "highest score next". Items keep arriving, and you keep taking the best one. That is a priority queue.' },
  ],
  recap: [
    'You can find a parent and children with 3 sums.',
    'You can test a list with the heap rule.',
    'You can say why a heap is not sorted.',
  ],
  practice: [
    { id: 'match-sums', type: 'match', level: 1,
      q: 'Match each piece of code to what it finds, for the item in spot i.',
      pairs: [
        ['`2 * i + 1`', 'The spot of the left child'],
        ['`2 * i + 2`', 'The spot of the right child'],
        ['`(i - 1) // 2`', 'The spot of the parent'],
        ['`h[0]`', 'The smallest item'],
      ],
      explain: 'The first 3 are sums on spot numbers. The last one needs no sum, as the top is always spot 0.',
      hints: ['The right child is one spot after the left child.'],
    },
    { id: 'read-child', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        heap = [1, 3, 2, 8, 4]
        i = 1
        print(heap[2 * i + 2])
      `,
      answer: '4',
      explain: '2 * 1 + 2 is 4, so this reads spot 4. Spot 4 holds a 4.',
      hints: ['Work out the sum first. Spots count from 0.'],
    },
    { id: 'which-is-heap', type: 'mcq', level: 2,
      q: 'Which list is a heap?',
      options: [
        { text: '`[3, 5, 4, 1]`', why: 'Spot 3 holds 1, and its parent in spot 1 holds 5. The smallest must be on top.' },
        '`[3, 5, 4, 9]`',
        { text: '`[5, 3, 4, 9]`', why: 'The root holds 5, but its child in spot 1 holds 3. A parent cannot be bigger.' },
      ],
      answer: 1,
      explain: 'Spot 0 holds 3, with children 5 and 4. Spot 1 holds 5, with child 9. Every parent is small enough.',
      hints: ['Check the top first. Then check each pair of parent and child.'],
    },
    { id: 'where-biggest', type: 'mcq', level: 2,
      q: 'A heap has many different numbers. Where can the biggest one be?',
      options: [
        { text: 'In spot 1', why: 'You may be thinking the list is in some order near the top. Spot 1 has children, and they cannot be smaller.' },
        { text: 'In the last spot, always', why: 'You may be thinking of a sorted list. A heap has no order from side to side.' },
        'In any spot with no children',
      ],
      answer: 2,
      explain: 'If the biggest had a child, that child would be smaller, and the rule would break. So it must be a leaf, and any leaf will do.',
      hints: ['Can the biggest number have a child?'],
    },
    { id: 'fix-children', type: 'fix', level: 2,
      q: '`children(heap, i)` should give the values of the children that exist. It crashes on leaves. Fix it.',
      code: py`
        def children(heap, i):
            left = 2 * i + 1
            right = 2 * i + 2
            return [heap[left], heap[right]]
      `,
      answer: py`
        def children(heap, i):
            found = []
            for spot in [2 * i + 1, 2 * i + 2]:
                if spot < len(heap):
                    found.append(heap[spot])
            return found
      `,
      tests: [
        { label: 'children([2, 5, 3, 9, 6], 1)', call: 'children([2, 5, 3, 9, 6], 1)', want: '[9, 6]' },
        { label: 'children([2, 5, 3, 9], 1)', call: 'children([2, 5, 3, 9], 1)', want: '[9]' },
        { label: 'children([2, 5, 3], 2)', call: 'children([2, 5, 3], 2)', want: '[]' },
        { label: 'children([7], 0)', call: 'children([7], 0)', want: '[]' },
      ],
      explain: 'A child sum can go past the end. So check each spot against `len(heap)` before you open it.',
      hints: ['What is the left spot when i is the last spot?', 'Start an empty list, then add each child that really exists.'],
    },
    { id: 'write-parent', type: 'write', level: 2,
      q: 'Write `parent_value(heap, i)`. It hands back the value of the parent of spot i. The root has no parent, so hand back `None` for spot 0.',
      starter: py`
        def parent_value(heap, i):
            # Your code here.
            return -1
      `,
      answer: py`
        def parent_value(heap, i):
            if i == 0:
                return None
            return heap[(i - 1) // 2]
      `,
      tests: [
        { label: 'parent_value([2, 5, 3, 9], 3)', call: 'parent_value([2, 5, 3, 9], 3)', want: '5' },
        { label: 'parent_value([2, 5, 3, 9], 2)', call: 'parent_value([2, 5, 3, 9], 2)', want: '2' },
        { label: 'parent_value([2, 5, 3, 9], 0)', call: 'parent_value([2, 5, 3, 9], 0)', want: 'None' },
      ],
      explain: 'Spot 0 needs its own check. Without it, the sum gives -1, and Python hands back the last item.',
      hints: ['Handle spot 0 first.', 'The parent is at `(i - 1) // 2`.'],
    },
    { id: 'path-up', type: 'write', level: 3,
      q: 'Stretch: write `path_up(i)`. It hands back the spots you pass, going from spot i up to the root.',
      starter: py`
        def path_up(i):
            # Your code here.
            return []
      `,
      answer: py`
        def path_up(i):
            path = [i]
            while i > 0:
                i = (i - 1) // 2
                path.append(i)
            return path
      `,
      tests: [
        { label: 'path_up(5)', call: 'path_up(5)', want: '[5, 2, 0]' },
        { label: 'path_up(6)', call: 'path_up(6)', want: '[6, 2, 0]' },
        { label: 'path_up(1)', call: 'path_up(1)', want: '[1, 0]' },
        { label: 'path_up(0)', call: 'path_up(0)', want: '[0]' },
        { label: 'path_up(14)', call: 'path_up(14)', want: '[14, 6, 2, 0]' },
      ],
      explain: 'Start with i in the list. Then keep moving to the parent until you reach spot 0.',
      hints: ['Keep going while i is more than 0.', 'Change i with the parent sum, then add it to the list.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 20.2
Course.lesson('m20-heaps', {
  id: '20-2-heapq',
  num: '20.2',
  title: 'heapq: push, pop and heapify',
  goal: 'You can use heappush, heappop and heapify, and say what each one costs.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What does Python store when you push?' },
    { t: 'p', text: 'Python has a box of heap tools called `heapq`. It works on a plain list. Guess what this list looks like after 4 pushes.' },
    { t: 'q', id: 'spark-push', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        import heapq

        h = []
        for x in [5, 3, 8, 1]:
            heapq.heappush(h, x)
        print(h)
      `,
      options: [
        { text: '[1, 3, 5, 8]', why: 'You may expect a sorted list. A heap only keeps the heap rule, so it does less work.' },
        { text: '[5, 3, 8, 1]', why: 'You may think a push only adds at the end. The new item then climbs if it must.' },
        '[1, 3, 8, 5]',
      ],
      answer: 2,
      explain: 'The 1 starts at the end, then climbs past 5 and 3. The 8 stays put. So the list is a heap, but not sorted.',
      hints: ['The list starts empty. Add one number at a time, and keep each parent small.'],
    },
    { t: 'words', items: [
      { word: 'min-heap', means: 'A heap with the smallest item on top. `heapq` makes this kind.' },
    ] },
    { t: 'h', text: 'How does a push work?' },
    { t: 'steps', title: 'Push in 3 moves', items: [
      { label: 'Add at the end', text: 'The new item takes the next free spot, so the list has no gaps.', code: 'h.append(x)' },
      { label: 'Find the parent', text: 'Use the parent sum from lesson 20.1.', code: 'p = (i - 1) // 2' },
      { label: 'Climb or stop', text: 'If the parent is bigger, swap and go again. If not, stop.', code: 'if h[p] <= h[i]:\n    break' },
    ] },
    { t: 'viz', name: 'm20-push', caption: 'Decide each move. Then push a big number, a tie, and the smallest number of all. Try an empty heap too.' },
    { t: 'q', id: 'order-climb', type: 'order', level: 2,
      q: 'A 1 has been added to spot 3, and now it must climb. Put the lines in order. One line does not belong.',
      lines: [
        'h = [2, 5, 3, 1]',
        'i = 3',
        'while i > 0:',
        '    p = (i - 1) // 2',
        '    if h[p] <= h[i]:',
        '        break',
        '    h[p], h[i] = h[i], h[p]',
        '    i = p',
        'print(h)',
      ],
      extra: ['    i = i - 1'],
      output: '[1, 2, 3, 5]',
      explain: 'Find the parent, test it, swap, then move i up to the parent. Moving i down by 1 would land on a spot that is not the parent.',
      hints: ['What must exist before you can compare?', 'After a swap, the item sits in the parent spot.'],
    },
    { t: 'h', text: 'How does a pop work?' },
    { t: 'steps', title: 'Pop in 3 moves', items: [
      { label: 'Save the top', text: 'Spot 0 holds the smallest. That is your answer.', code: 'top = h[0]' },
      { label: 'Move the last item up', text: 'Only the last spot can leave with no gap. So that item goes to the top.', code: 'last = h.pop()\nh[0] = last' },
      { label: 'Sink', text: 'It swaps with its **smaller** child, until the rule holds again.' },
    ] },
    { t: 'viz', name: 'm20-pop', caption: 'Choose each move. Then try one item, and an empty heap. Try a tie between 2 children: `1, 2, 2, 5, 6, 3, 4`.' },
    { t: 'q', id: 'smaller-child', type: 'mcq', level: 2,
      q: 'The top holds 9, and its children are 3 and 5. Which child swaps with the 9?',
      options: [
        '3',
        { text: '5', why: 'Then 5 would be the parent of 3. A parent cannot be bigger than its child.' },
        { text: 'Either one', why: 'Only the smaller child can sit above the other child and keep the rule.' },
      ],
      answer: 0,
      explain: 'The smaller child goes up, because it is no bigger than the other child. So the rule holds.',
      hints: ['After the swap, the child that went up is a parent of the other one.'],
    },
    { t: 'p', text: 'Real `heapq` code orders its compares a little differently. It still ends with the same list as these pictures. Next, make a heap from a whole list in one go. `heapify` fixes the small trees first.' },
    { t: 'viz', name: 'm20-heapify', caption: 'Guess each move, and watch the swaps count. Then try `7, 6, 5, 4, 3, 2, 1`, one of the hardest lists for this size.' },
    { t: 'code', caption: 'Real heapq output. The list is not sorted, and `nums[1]` is not the second smallest. Guess each line first.',
      code: py`
        import heapq

        nums = [9, 4, 7, 1, 8, 2]
        heapq.heapify(nums)
        print(nums)
        print(nums == sorted(nums))
        print("nums[1] is", nums[1])
        print("second smallest is", sorted(nums)[1])
        print(heapq.heappop(nums))
        heapq.heappush(nums, 3)
        print(nums)
        print(nums[0])
      `,
      output: '[1, 4, 2, 9, 8, 7]\nFalse\nnums[1] is 4\nsecond smallest is 2\n1\n[2, 4, 3, 9, 8, 7]\n2',
    },
    { t: 'trap',
      think: '`h = heapq.heapify(nums)` gives me the heap.',
      real: '`heapify` changes the list in place and hands back `None`. So `h` names `None`. Write `heapq.heapify(nums)` on its own line, then use `nums`.',
      code: py`
        h = heapq.heapify(nums)   # h is None
      `,
    },
    { t: 'code', error: true, caption: 'An empty heap has no top. So check `len(h) > 0` before you pop.',
      code: py`
        import heapq

        h = []
        print(heapq.heappop(h))
      `,
    },
    { t: 'h', text: 'Count the swaps, then name the cost' },
    { t: 'q', id: 'count-push', type: 'trace', level: 2,
      q: 'Push 8, then 6, 4 and 2 into an empty heap. Each new item is the smallest so far. Fill in the list and the swaps. Write each list with no spaces, like `[6,8]`.',
      code: py`
        import heapq

        h = []
        for x in [8, 6, 4, 2]:
            heapq.heappush(h, x)
            print(x, h)
      `,
      head: ['x', 'h', 'swaps'],
      rows: [['8', '[8]', '0'], ['6', '[6,8]', '1'], ['4', '[4,8,6]', '1'], ['2', '[2,4,6,8]', '2']],
      given: 1,
      verify: 'h = []\nfor x in [8, 6, 4, 2]:\n    h.append(x)\n    i = len(h) - 1\n    swaps = 0\n    while i > 0:\n        p = (i - 1) // 2\n        if h[p] <= h[i]:\n            break\n        h[p], h[i] = h[i], h[p]\n        i = p\n        swaps = swaps + 1\n    print(x, str(h).replace(" ", ""), swaps)',
      explain: 'The worst case climbs all the way up. So the swaps are at most one less than the number of levels.',
      hints: ['Each new item is the smallest, so it climbs to the top.', 'Count the levels it passes. Spot 3 has spot 1, then spot 0, above it.'],
    },
    { t: 'code', caption: 'Each push here is the worst case: a new smallest item climbs all the way up. Try other sizes.',
      code: py`
        def push(h, x):
            h.append(x)
            i = len(h) - 1
            swaps = 0
            while i > 0:
                p = (i - 1) // 2
                if h[p] <= h[i]:
                    break
                h[p], h[i] = h[i], h[p]
                i = p
                swaps = swaps + 1
            return swaps

        for size in [4, 16, 256, 4096]:
            h = list(range(1, size))
            print(size, "items:", push(h, 0), "swaps")
      `,
      output: '4 items: 2 swaps\n16 items: 4 swaps\n256 items: 8 swaps\n4096 items: 12 swaps',
    },
    { t: 'p', text: 'The heap grew 1024 times, but the swaps only went from 2 to 12. That is [[O(log n)]]. Now compare `heapify` with one push per item, on the same list.' },
    { t: 'code', caption: '`__lt__` runs on each `<`, so `tally` counts compares in real heapq. Each line shows n, then pushes, then heapify.',
      code: py`
        import heapq

        tally = [0]

        class Num:
            def __init__(self, v):
                self.v = v
            def __lt__(self, other):
                tally[0] = tally[0] + 1
                return self.v < other.v

        for n in [8, 64, 512, 4096]:
            tally[0] = 0
            h = []
            for v in range(n, 0, -1):
                heapq.heappush(h, Num(v))
            pushes = tally[0]
            tally[0] = 0
            h = [Num(v) for v in range(n, 0, -1)]
            heapq.heapify(h)
            print(n, pushes, tally[0])
      `,
      output: '8 13 8\n64 264 89\n512 3595 758\n4096 40974 6131',
    },
    { t: 'p', text: 'With `heapify`, 8 times the items means about 8 times the compares. That is O(n). Most items sit near the bottom, and they have few levels to sink.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`h[0]`', cost: 'O(1)', why: 'The smallest is always in spot 0.' },
      { op: '`heappush`', cost: 'O(log n)', why: 'The new item climbs one level at a time, and the levels are few.' },
      { op: '`heappop`', cost: 'O(log n)', why: 'The moved item sinks one level at a time.' },
      { op: '`heapify`', cost: 'O(n)', why: 'Most items are near the bottom, so they sink only a little.' },
      { op: '`x in h`', cost: 'O(n)', why: 'A heap has no help for this, so Python walks the list.' },
    ] },
    { t: 'table', caption: 'Which waiting list should you use?', head: ['Kept as', 'Add one', 'Take the smallest'], rows: [
      ['Plain list', 'O(1) amortized', 'O(n)'],
      ['Sorted list, big to small', 'O(n)', 'O(1)'],
      ['Heap', 'O(log n)', 'O(log n)'],
    ] },
  ],
  recap: [
    'You can push, pop and heapify a list.',
    'You can say how a push climbs and a pop sinks.',
    'You can name the cost of each tool.',
  ],
  practice: [
    { id: 'match-tools', type: 'match', level: 1,
      q: 'Match each tool to what it does.',
      pairs: [
        ['`heappush(h, x)`', 'Adds an item, then climbs'],
        ['`heappop(h)`', 'Takes the smallest away'],
        ['`heapify(h)`', 'Turns a list into a heap, in place'],
        ['`h[0]`', 'Looks at the smallest, and leaves it there'],
      ],
      explain: 'Only `heappop` takes an item away. `h[0]` looks, and changes nothing.',
      hints: ['Which one changes nothing at all?'],
    },
    { id: 'pop-then-show', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        import heapq

        h = [2, 7, 4]
        print(heapq.heappop(h))
        print(h)
      `,
      answer: '2\n[4, 7]',
      explain: '2 comes out. The last item, 4, moves to the top. It is smaller than 7, so it stays.',
      hints: ['The last item goes to the top, then sinks if it must.'],
    },
    { id: 'forgot-heapify', type: 'predict', level: 2,
      q: 'This list was never made into a heap. What will the screen show?',
      code: py`
        import heapq

        h = [5, 1]
        heapq.heappush(h, 3)
        print(h[0])
      `,
      options: [
        { text: '1', why: 'You may think `heappush` fixes the whole list. It only works if the list is already a heap.' },
        '3',
        { text: '5', why: 'The new 3 starts in spot 2, and its parent is the 5. So they swap.' },
      ],
      answer: 1,
      explain: 'The 3 climbs past the 5, but the 1 stays in spot 1. So `h[0]` is not the smallest. Use `heapify` first.',
      hints: ['The parent of spot 2 is spot 0.', 'Does the 1 ever move?'],
    },
    { id: 'is-second', type: 'mcq', level: 2,
      q: 'After `heapify`, a list is `[1, 6, 2, 8, 7]`. Where is the second smallest?',
      options: [
        { text: 'Spot 1', why: 'This is the common mistake. The heap makes no promise about spot 1, and it holds 6 here.' },
        'Spot 2',
        { text: 'You cannot find it in a heap', why: 'You can. It is always a child of the root, so check both spots 1 and 2.' },
      ],
      answer: 1,
      explain: 'The second smallest is a child of the root. The children hold 6 and 2, so 2 in spot 2 is the one.',
      hints: ['Which spots are children of the root?'],
    },
    { id: 'fix-empty', type: 'fix', level: 2,
      q: '`next_job(h)` should take the smallest item, or hand back `None` if the heap is empty. It crashes on an empty heap. Fix it.',
      code: py`
        import heapq

        def next_job(h):
            return heapq.heappop(h)
      `,
      answer: py`
        import heapq

        def next_job(h):
            if len(h) == 0:
                return None
            return heapq.heappop(h)
      `,
      tests: [
        { label: 'next_job([2, 5, 3])', call: 'next_job([2, 5, 3])', want: '2' },
        { label: 'next_job([7])', call: 'next_job([7])', want: '7' },
        { label: 'next_job([])', call: 'next_job([])', want: 'None' },
      ],
      explain: 'An empty heap has no top, so `heappop` stops with an IndexError. Check the length first.',
      hints: ['What does `heappop` do on an empty list?', 'Test `len(h) == 0` before you pop.'],
    },
    { id: 'in-order', type: 'write', level: 2,
      q: 'Write `in_order(nums)` with `heapq`. It hands back a new list, from small to big. It must not change `nums`.',
      starter: py`
        import heapq

        def in_order(nums):
            # Your code here.
            return []
      `,
      answer: py`
        import heapq

        def in_order(nums):
            h = list(nums)
            heapq.heapify(h)
            out = []
            while len(h) > 0:
                out.append(heapq.heappop(h))
            return out
      `,
      tests: [
        { label: 'in_order([3, 9, 5])', call: 'in_order([3, 9, 5])', want: '[3, 5, 9]' },
        { label: 'in_order([4, 4, 1])', call: 'in_order([4, 4, 1])', want: '[1, 4, 4]' },
        { label: 'in_order([])', call: 'in_order([])', want: '[]' },
        { label: 'nums stays the same', check: '(lambda a: (in_order(a), a == [3, 1, 2])[1])([3, 1, 2])' },
      ],
      explain: '`heapify` works in place, so make a copy first. Each pop then hands back the smallest item left.',
      hints: ['`list(nums)` makes a copy.', 'Pop until the heap is empty.'],
    },
    { id: 'my-push', type: 'write', level: 3,
      q: 'Stretch: write your own `push(h, x)`, with no `heapq`. `h` is a heap. Add x so that it stays a heap.',
      starter: py`
        def push(h, x):
            # Your code here.
            pass
      `,
      answer: py`
        def push(h, x):
            h.append(x)
            i = len(h) - 1
            while i > 0:
                p = (i - 1) // 2
                if h[p] <= h[i]:
                    break
                h[p], h[i] = h[i], h[p]
                i = p
      `,
      tests: [
        { label: 'x climbs to the top', check: '(lambda h: (push(h, 1), h == [1, 2, 3, 5])[1])([2, 5, 3])' },
        { label: 'x stays at the end', check: '(lambda h: (push(h, 9), h == [2, 5, 3, 9])[1])([2, 5, 3])' },
        { label: 'x climbs one level', check: '(lambda h: (push(h, 4), h == [2, 4, 3, 5])[1])([2, 5, 3])' },
        { label: 'A tie stops the climb', check: '(lambda h: (push(h, 5), h == [2, 5, 3, 5])[1])([2, 5, 3])' },
        { label: 'An empty heap', check: '(lambda h: (push(h, 7), h == [7])[1])([])' },
      ],
      explain: 'Add at the end, then swap with the parent while the parent is bigger. Spot 0 has no parent, so stop there.',
      hints: ['Start with `h.append(x)`.', 'Loop while `i > 0`, and find the parent each time.', 'Stop as soon as the parent is not bigger.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 20.3
Course.lesson('m20-heaps', {
  id: '20-3-max-ties-top-k',
  num: '20.3',
  title: 'Biggest first, fair ties, and the top k',
  goal: 'You can make a max-heap, break ties fairly, and keep the k biggest items.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What if you want the biggest first?' },
    { t: 'p', text: 'You have some game scores, and the highest should go first. Try `heapq` as it comes.' },
    { t: 'q', id: 'spark-biggest', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        import heapq

        h = []
        for score in [40, 95, 70]:
            heapq.heappush(h, score)
        print(heapq.heappop(h))
      `,
      options: [
        '40',
        { text: '95', why: 'You may think a Python heap gives the biggest first. `heapq` keeps the smallest on top.' },
        { text: '70', why: 'You may be thinking of the last item pushed. A pop always takes spot 0.' },
      ],
      answer: 0,
      explain: '`heapq` only makes min-heaps, so the smallest comes out first. That is the opposite of what you want here.',
      hints: ['Which item is always in spot 0?'],
    },
    { t: 'words', items: [
      { word: 'max-heap', means: 'A heap with the biggest item on top. Each parent is at least as big as its children.' },
      { word: 'tie-breaker', means: 'An extra value that decides who goes first when 2 items tie.' },
      { word: 'top k', means: 'The k biggest items in a group. k is any whole number you choose.' },
    ] },
    { t: 'trap',
      think: 'A Python heap gives the biggest first.',
      real: '`heapq` only makes a [[min-heap]]. To get a [[max-heap]], store the negative of each number. The biggest number becomes the smallest negative, so it rises to the top.',
    },
    { t: 'code', caption: 'Flip the sign going in, and flip it again coming out. Add your own scores.',
      code: py`
        import heapq

        h = []
        for score in [40, 95, 70]:
            heapq.heappush(h, -score)
        print(h)
        print(-h[0])
        print(-heapq.heappop(h))
        print(-heapq.heappop(h))
      `,
      output: '[-95, -40, -70]\n95\n95\n70',
    },
    { t: 'q', id: 'forgot-flip', type: 'predict', level: 2,
      q: 'This code pushes negatives, but forgets one thing. What will the screen show?',
      code: py`
        import heapq

        h = []
        for score in [3, 9, 5]:
            heapq.heappush(h, -score)
        print(heapq.heappop(h))
      `,
      options: [
        { text: '9', why: 'You may be expecting the score back. But the code never flips the sign coming out.' },
        '-9',
        { text: '3', why: '`heapq` is still a min-heap. Here the smallest item is -9, not 3.' },
      ],
      answer: 1,
      explain: 'The heap holds -9, -5 and -3. The smallest is -9. To get the score back, write `-heapq.heappop(h)`.',
      hints: ['What numbers are really in the list?', 'Which of them is smallest?'],
    },
    { t: 'tip', title: 'Words cannot be flipped', text: 'A minus sign only works on numbers. So this trick works for scores, not for names. Python 3.14 adds `heappush_max`, but this site runs Python 3.13, so it is not here.' },
    { t: 'h', text: 'What if 2 items tie?' },
    { t: 'p', text: 'A [[priority queue]] often stores (priority, task). Tuples compare item by item, so a tie on priority makes Python compare the tasks. That can be unfair. It can also crash.' },
    { t: 'code', caption: 'Zed came first, but Ann comes out first. A is before Z, so Python chose by the name.',
      code: py`
        import heapq

        h = []
        heapq.heappush(h, (2, "Zed"))
        heapq.heappush(h, (2, "Ann"))
        print(heapq.heappop(h))
      `,
      output: "(2, 'Ann')",
    },
    { t: 'code', error: true, caption: 'Python has no rule for `<` on 2 dicts. Read the message, then read on for the fix.',
      code: py`
        import heapq

        h = []
        heapq.heappush(h, (2, {"name": "Zed"}))
        heapq.heappush(h, (2, {"name": "Ann"}))
      `,
    },
    { t: 'p', text: 'The fix is a [[tie-breaker]]. Put a count between the priority and the task. The count goes up by 1 for each new item, so 2 counts never tie.' },
    { t: 'viz', name: 'm20-tie-break', caption: 'Guess who goes next. Then type your own jobs. Try all the same priority, and try only one job.' },
    { t: 'code', caption: 'Ties now go in the order they came. Python never compares 2 tasks, so dicts work too.',
      code: py`
        import heapq

        jobs = [(2, "Zed"), (1, "Mo"), (2, "Ann")]
        h = []
        count = 0
        for priority, task in jobs:
            heapq.heappush(h, (priority, count, task))
            count = count + 1

        while len(h) > 0:
            priority, order, task = heapq.heappop(h)
            print(task)
      `,
      output: 'Mo\nZed\nAnn',
    },
    { t: 'q', id: 'tuple-compare', type: 'predict', level: 2,
      q: 'Tuples compare item by item. What will the screen show?',
      code: py`
        a = (2, 0, "Zed")
        b = (2, 1, "Ann")
        print(a < b)
      `,
      options: [
        'True',
        { text: 'False', why: 'You may be comparing the names, as "Ann" comes before "Zed". Python stops at the first items that differ, which are 0 and 1.' },
        { text: 'TypeError', why: 'Numbers compare with numbers, and Python stops before the names. So nothing goes wrong.' },
      ],
      answer: 0,
      explain: 'The first items tie at 2. The next items are 0 and 1, and 0 is smaller. So Python never looks at the names.',
      hints: ['Compare the first items. Do they tie?', 'Then compare the second items.'],
    },
    { t: 'h', text: 'How do you keep only the best few?' },
    { t: 'p', text: 'Scores arrive one at a time, and you want the 3 biggest. So you keep 3 numbers and throw the rest away.' },
    { t: 'q', id: 'spark-keep', type: 'mcq', level: 1,
      q: 'You are keeping 9, 7 and 5. A new 6 arrives. Which number do you throw away?',
      options: [
        { text: '9', why: 'That is the best one so far. You want to keep the biggest numbers.' },
        '5',
        { text: '6', why: '6 beats the 5 you are keeping. So the 6 earns a place.' },
      ],
      answer: 1,
      explain: 'The 5 is the smallest of the 4. So you always need to find the smallest of what you keep. A min-heap does that.',
      hints: ['After this, you want the 3 biggest of 9, 7, 6 and 5.'],
    },
    { t: 'big', text: 'To keep the biggest, use a min-heap. The smallest kept item is the first to go.' },
    { t: 'viz', name: 'm20-top-k', caption: 'Say who leaves each time. Then try k bigger than the list, k of 0, an empty list, and repeats.' },
    { t: 'code', caption: 'Push each one, then pop if the heap is too big. Try other values of k. Try k = 0.',
      code: py`
        import heapq

        def top_k(items, k):
            h = []
            for x in items:
                heapq.heappush(h, x)
                if len(h) > k:
                    heapq.heappop(h)
            return sorted(h, reverse=True)

        print(top_k([4, 9, 1, 7, 5, 8], 3))
        print(top_k([4, 9], 5))
        print(top_k([], 3))
        print(top_k([7, 7, 7], 2))
      `,
      output: '[9, 8, 7]\n[9, 4]\n[]\n[7, 7]',
    },
    { t: 'q', id: 'count-top', type: 'predict', level: 2,
      q: 'Count by hand first. With 6 items and k of 2, how many pushes and pops are there?',
      code: py`
        items = [4, 9, 1, 7, 5, 8]
        k = 2
        pushes = 0
        pops = 0
        size = 0
        for x in items:
            pushes = pushes + 1
            size = size + 1
            if size > k:
                pops = pops + 1
                size = size - 1
        print(pushes, pops)
      `,
      options: [
        { text: '6 6', why: 'You may think each push has a pop. The first 2 items fit in the heap, so they stay.' },
        '6 4',
        { text: '2 2', why: 'k limits what you keep, not what you look at. Every item gets pushed once.' },
      ],
      answer: 1,
      explain: 'All 6 items get pushed. The heap may hold 2, so 4 must leave. Each step works on a tiny tree.',
      hints: ['Every item gets pushed.', 'How many items are left at the end?'],
    },
    { t: 'p', text: 'The tree never holds more than k + 1 items, so each step stays short. Sorting everything pays for all n. For one job on a short list, `sorted` is still fine.' },
    { t: 'code', caption: 'Python has these ready-made. They do this job for you.',
      code: py`
        import heapq

        scores = [4, 9, 1, 7, 5, 8]
        print(heapq.nlargest(3, scores))
        print(heapq.nsmallest(2, scores))
      `,
      output: '[9, 8, 7]\n[1, 4]',
    },
    { t: 'tip', title: 'Other tools for this job', text: 'For only the biggest, use `max`. If k is close to the size of the list, use `sorted`. For one spot in a list you already have, quickselect from lesson 17.3 works too.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Push or pop, with negatives or tuples', cost: 'O(log n)', why: 'A heap does the same work. Only the items look different.' },
      { op: 'Top k of n items', cost: 'O(n log k)', why: 'n items each pay for a short climb, in a tree of about k items.' },
      { op: '`sorted`, then take k', cost: 'O(n log n)', why: 'This pays for putting all n items in order.' },
    ] },
    { t: 'table', caption: 'How to spot each one', head: ['If the problem says...', 'Think of...'], rows: [
      ['"biggest first", "highest score next"', 'Max-heap, using negatives'],
      ['"most urgent next", "first come on a tie"', 'Priority queue: (priority, count, task)'],
      ['"k largest", "top 10", "best few"', 'Min-heap that keeps k items'],
      ['"k smallest", "closest few"', 'Max-heap that keeps k items, using negatives'],
      ['One short list, once', '`sorted` is fine'],
    ] },
  ],
  recap: [
    'You can make a max-heap with negative numbers.',
    'You can break ties with (priority, count, task).',
    'You can keep the k biggest with a small min-heap.',
  ],
  practice: [
    { id: 'which-heap', type: 'mcq', level: 1,
      q: 'You want to keep the 5 **smallest** numbers as they arrive. What fits best?',
      options: [
        { text: 'A min-heap of 5 items', why: 'A min-heap shows you the smallest, but you must throw away the biggest of the 5.' },
        'A max-heap of 5 items',
        { text: 'A max-heap of all the items', why: 'That works, but it keeps every item. You only need to keep 5.' },
      ],
      answer: 1,
      explain: 'When a 6th number comes, the biggest of the 6 must go. A max-heap of 5 has that one on top.',
      hints: ['Which number do you throw away when a new one arrives?'],
    },
    { id: 'nlargest', type: 'predict', level: 1,
      q: 'k is bigger than the list here. Type what the screen will show.',
      code: py`
        import heapq

        print(heapq.nlargest(4, [6, 2]))
      `,
      answer: '[6, 2]',
      explain: 'You asked for 4, but there are only 2. So you get them all, biggest first. Nothing crashes.',
      hints: ['How many items does the list have?'],
    },
    { id: 'big-first', type: 'write', level: 2,
      q: 'Write `biggest_first(nums)` with `heapq`. It hands back a new list, from big to small. Use negative numbers.',
      starter: py`
        import heapq

        def biggest_first(nums):
            # Your code here.
            return []
      `,
      answer: py`
        import heapq

        def biggest_first(nums):
            h = []
            for n in nums:
                heapq.heappush(h, -n)
            out = []
            while len(h) > 0:
                out.append(-heapq.heappop(h))
            return out
      `,
      tests: [
        { label: 'biggest_first([3, 9, 5])', call: 'biggest_first([3, 9, 5])', want: '[9, 5, 3]' },
        { label: 'biggest_first([4, 4, 1])', call: 'biggest_first([4, 4, 1])', want: '[4, 4, 1]' },
        { label: 'biggest_first([-2, 7])', call: 'biggest_first([-2, 7])', want: '[7, -2]' },
        { label: 'biggest_first([])', call: 'biggest_first([])', want: '[]' },
      ],
      explain: 'Flip the sign going in, so the biggest comes out first. Then flip it again coming out.',
      hints: ['Push `-n` for each number.', 'Pop until the heap is empty, and flip each one back.'],
    },
    { id: 'fix-ties', type: 'fix', level: 2,
      q: '`serve(jobs)` crashes when 2 jobs tie, as the tasks are dicts. Add a count, so ties go in the order they came.',
      code: py`
        import heapq

        def serve(jobs):
            h = []
            for priority, task in jobs:
                heapq.heappush(h, (priority, task))
            names = []
            while len(h) > 0:
                item = heapq.heappop(h)
                names.append(item[1]["name"])
            return names
      `,
      answer: py`
        import heapq

        def serve(jobs):
            h = []
            count = 0
            for priority, task in jobs:
                heapq.heappush(h, (priority, count, task))
                count = count + 1
            names = []
            while len(h) > 0:
                item = heapq.heappop(h)
                names.append(item[2]["name"])
            return names
      `,
      tests: [
        { label: 'One job', call: 'serve([(2, {"name": "Zed"})])', want: '["Zed"]' },
        { label: 'No ties', call: 'serve([(2, {"name": "Zed"}), (1, {"name": "Mo"})])', want: '["Mo", "Zed"]' },
        { label: 'A tie', call: 'serve([(2, {"name": "Zed"}), (1, {"name": "Mo"}), (2, {"name": "Ann"})])', want: '["Mo", "Zed", "Ann"]' },
        { label: 'No jobs', call: 'serve([])', want: '[]' },
      ],
      explain: 'The count sits before the task, and it never repeats. So Python never has to compare 2 dicts.',
      hints: ['Make each tuple (priority, count, task).', 'The task is now at index 2 of the tuple.'],
    },
    { id: 'fix-top', type: 'fix', level: 2,
      q: '`top_k` should keep the k **biggest**, but it keeps the k smallest. Fix it.',
      code: py`
        import heapq

        def top_k(items, k):
            h = []
            for x in items:
                heapq.heappush(h, -x)
                if len(h) > k:
                    heapq.heappop(h)
            return sorted([-x for x in h], reverse=True)
      `,
      answer: py`
        import heapq

        def top_k(items, k):
            h = []
            for x in items:
                heapq.heappush(h, x)
                if len(h) > k:
                    heapq.heappop(h)
            return sorted(h, reverse=True)
      `,
      tests: [
        { label: 'top_k([4, 9, 1, 7], 2)', call: 'top_k([4, 9, 1, 7], 2)', want: '[9, 7]' },
        { label: 'top_k([4, 9], 5)', call: 'top_k([4, 9], 5)', want: '[9, 4]' },
        { label: 'top_k([], 2)', call: 'top_k([], 2)', want: '[]' },
        { label: 'top_k([3, 3, 1], 2)', call: 'top_k([3, 3, 1], 2)', want: '[3, 3]' },
      ],
      explain: 'With negatives, the pop throws away the biggest number. To keep the biggest, the pop must throw away the smallest.',
      hints: ['Which number does the pop remove?', 'Use a plain min-heap, with no minus signs.'],
    },
    { id: 'kth', type: 'write', level: 2,
      q: 'Write `kth_largest(items, k)` with a heap of k items. k of 1 means the biggest. You can trust that k is not too big.',
      starter: py`
        import heapq

        def kth_largest(items, k):
            # Your code here.
            return 0
      `,
      answer: py`
        import heapq

        def kth_largest(items, k):
            h = []
            for x in items:
                heapq.heappush(h, x)
                if len(h) > k:
                    heapq.heappop(h)
            return h[0]
      `,
      tests: [
        { label: 'kth_largest([3, 9, 1, 7], 1)', call: 'kth_largest([3, 9, 1, 7], 1)', want: '9' },
        { label: 'kth_largest([3, 9, 1, 7], 2)', call: 'kth_largest([3, 9, 1, 7], 2)', want: '7' },
        { label: 'kth_largest([3, 9, 1, 7], 4)', call: 'kth_largest([3, 9, 1, 7], 4)', want: '1' },
        { label: 'kth_largest([4, 4, 2], 2)', call: 'kth_largest([4, 4, 2], 2)', want: '4' },
      ],
      explain: 'The heap holds the k biggest, with the smallest of them on top. That top is the k-th largest.',
      hints: ['Use the same loop as `top_k`.', 'Which spot holds the smallest of the k biggest?'],
    },
    { id: 'last-stone', type: 'write', level: 3,
      q: 'Stretch: you have stones of different weights. On each turn, smash the 2 heaviest. If they differ, a stone of the difference goes back. Write `last_stone(stones)`. It hands back the weight left, or 0.',
      starter: py`
        import heapq

        def last_stone(stones):
            # Your code here.
            return -1
      `,
      answer: py`
        import heapq

        def last_stone(stones):
            h = [-s for s in stones]
            heapq.heapify(h)
            while len(h) > 1:
                a = -heapq.heappop(h)
                b = -heapq.heappop(h)
                if a != b:
                    heapq.heappush(h, -(a - b))
            if len(h) > 0:
                return -h[0]
            return 0
      `,
      tests: [
        { label: 'last_stone([5, 3, 8, 2])', call: 'last_stone([5, 3, 8, 2])', want: '2' },
        { label: 'last_stone([4, 4])', call: 'last_stone([4, 4])', want: '0' },
        { label: 'last_stone([7])', call: 'last_stone([7])', want: '7' },
        { label: 'last_stone([])', call: 'last_stone([])', want: '0' },
        { label: 'last_stone([6, 1, 1, 1])', call: 'last_stone([6, 1, 1, 1])', want: '3' },
      ],
      explain: 'You keep taking the biggest, and items keep coming back. So a max-heap fits, using negative numbers.',
      hints: ['Make a list of negatives, then `heapify` it.', 'Loop while at least 2 stones are left.', 'After the loop, the heap holds 1 stone or none.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 20.5 (bonus)
Course.lesson('m20-heaps', {
  id: '20-4-heapsort',
  num: '20.5',
  title: 'Bonus: heapsort',
  optional: true,
  goal: 'You can sort a list in place with a heap, and compare heapsort with other sorts.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Can a heap speed up selection sort?' },
    { t: 'p', text: 'In lesson 12.1, [[selection sort]] finds the smallest, puts it first, and repeats. Finding the smallest means walking the rest of the list. A heap hands you the smallest with no walk.' },
    { t: 'q', id: 'spark-walks', type: 'mcq', level: 1,
      q: 'Selection sort works on 8 items. How many compares does its first pass need?',
      options: [
        { text: '1', why: 'That is what a heap needs, to read its top. A plain list has no promise about its order.' },
        { text: '4', why: 'You may be thinking of binary search, which halves. This list has no order, so no half can be skipped.' },
        '7',
      ],
      answer: 2,
      explain: 'The first item is compared with each of the other 7. Later passes need 6, then 5, and so on.',
      hints: ['How many other items must the first one meet?'],
    },
    { t: 'code', caption: 'This is heapsort, the short way: heapify, then pop until empty. Try repeats, and an empty list.',
      code: py`
        import heapq

        def heap_sorted(items):
            h = list(items)
            heapq.heapify(h)
            out = []
            while len(h) > 0:
                out.append(heapq.heappop(h))
            return out

        print(heap_sorted([3, 8, 5, 1, 6]))
        print(heap_sorted([2, 2, 1]))
        print(heap_sorted([]))
      `,
      output: '[1, 3, 5, 6, 8]\n[1, 2, 2]\n[]',
    },
    { t: 'p', text: 'That needs a second list. Can the list sort itself, [[in place]]? The trick is to use a [[max-heap]], and let the sorted part grow from the back.' },
    { t: 'words', items: [
      { word: 'heapsort', means: 'Make a heap, then keep moving its top into the sorted part.', say: 'HEEP-sort' },
    ] },
    { t: 'big', text: 'The heap shrinks from the back, and the sorted part grows into that room.' },
    { t: 'steps', title: 'Heapsort in 3 moves', items: [
      { label: 'Make a max-heap', text: 'The biggest item goes to spot 0.', code: 'for i in range(n // 2 - 1, -1, -1):\n    sink(a, i, n)' },
      { label: 'Swap top and last', text: 'The biggest now sits in its final spot, so the heap ends one spot sooner.', code: 'a[0], a[end] = a[end], a[0]' },
      { label: 'Sink the new top', text: 'This fixes the heap. Then repeat from move 2.', code: 'sink(a, 0, end)' },
    ] },
    { t: 'viz', name: 'm20-heapsort', caption: 'Choose each move. Watch the sorted part grow in the list as the tree shrinks. Then try repeats, and a list already in order.' },
    { t: 'q', id: 'why-max', type: 'mcq', level: 2,
      q: 'Why does the in-place way use a max-heap, not a min-heap?',
      options: [
        'The back of the list must fill first, and the biggest item belongs there',
        { text: 'A max-heap is always faster', why: 'They do the same work. Only the direction of the compare differs.' },
        { text: 'Python only has max-heaps', why: '`heapq` makes min-heaps. Here you write your own `sink`, so you choose.' },
      ],
      answer: 0,
      explain: 'Spots free up at the back. The biggest item belongs at the back, so the top must hold the biggest.',
      hints: ['Which end of the list becomes free as the heap shrinks?'],
    },
    { t: 'code', caption: 'Here is the whole thing, with no second list. `end` tells `sink` where the heap stops.',
      code: py`
        def sink(a, i, end):
            while 2 * i + 1 < end:
                c = 2 * i + 1
                if c + 1 < end and a[c + 1] > a[c]:
                    c = c + 1
                if a[i] >= a[c]:
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        def heapsort(a):
            n = len(a)
            for i in range(n // 2 - 1, -1, -1):
                sink(a, i, n)
            for end in range(n - 1, 0, -1):
                a[0], a[end] = a[end], a[0]
                sink(a, 0, end)

        nums = [3, 8, 5, 1, 6]
        heapsort(nums)
        print(nums)
      `,
      output: '[1, 3, 5, 6, 8]',
    },
    { t: 'q', id: 'first-swap', type: 'predict', level: 2,
      q: 'This list is already a max-heap. Now swap the top and the last. What does it look like, before any sink?',
      code: py`
        a = [8, 6, 5, 1, 3]
        end = len(a) - 1
        a[0], a[end] = a[end], a[0]
        print(a)
      `,
      options: [
        '[3, 6, 5, 1, 8]',
        { text: '[6, 3, 5, 1, 8]', why: 'That is after the sink as well. The question stops before any sink.' },
        { text: '[8, 6, 5, 1, 3]', why: 'You may have missed the swap. This line changes spot 0 and the last spot.' },
      ],
      answer: 0,
      explain: 'The 8 and the 3 change places. The 8 is now final. The 3 sits on top, and it will sink next.',
      hints: ['Only 2 spots change.'],
    },
    { t: 'h', text: 'Count the compares' },
    { t: 'p', text: 'You counted 7 for the first pass of selection sort. So 8 items take 7 + 6 + 5 + 4 + 3 + 2 + 1 compares. That makes 28. Now let code count heapsort too.' },
    { t: 'code', caption: 'Each `>` is one compare. These lists run from small to big. Try other sizes.',
      code: py`
        tally = [0]

        def bigger(x, y):
            tally[0] = tally[0] + 1
            return x > y

        def sink(a, i, end):
            while 2 * i + 1 < end:
                c = 2 * i + 1
                if c + 1 < end and bigger(a[c + 1], a[c]):
                    c = c + 1
                if not bigger(a[c], a[i]):
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        def heapsort(a):
            n = len(a)
            for i in range(n // 2 - 1, -1, -1):
                sink(a, i, n)
            for end in range(n - 1, 0, -1):
                a[0], a[end] = a[end], a[0]
                sink(a, 0, end)

        for n in [8, 64, 512, 4096]:
            tally[0] = 0
            heapsort(list(range(n)))
            pick = n * (n - 1) // 2
            print(n, "selection:", pick, "heapsort:", tally[0])
      `,
      output: '8 selection: 28 heapsort: 27\n64 selection: 2016 heapsort: 593\n512 selection: 130816 heapsort: 7958\n4096 selection: 8386560 heapsort: 88835',
    },
    { t: 'p', text: 'At 8 items, they nearly tie. A clever sort does not always win on a tiny list. But at 4096 items, heapsort needs about 94 times fewer compares.' },
    { t: 'cost', title: 'How fast is heapsort?', items: [
      { op: 'Time, in all cases', cost: 'O(n log n)', why: 'n items each sink through about log n levels.' },
      { op: 'Extra memory', cost: 'O(1)', why: 'It sorts in place, with no second list.' },
      { op: 'Making the first heap', cost: 'O(n)', why: 'This is the same work as `heapify`, from lesson 20.2.' },
    ] },
    { t: 'h', text: 'Does it keep ties in order?' },
    { t: 'p', text: 'Remember [[stable]] sorts from lesson 12.3: items that tie keep the order they came in. Heapsort moves items in long jumps, and those jumps can pass a tie.' },
    { t: 'code', caption: 'This sorts by grade only. Ann and Bo tie, and Ann came first. Look who comes first now.',
      code: py`
        def sink(a, i, end):
            while 2 * i + 1 < end:
                c = 2 * i + 1
                if c + 1 < end and a[c + 1][0] > a[c][0]:
                    c = c + 1
                if a[i][0] >= a[c][0]:
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        def heapsort(a):
            n = len(a)
            for i in range(n // 2 - 1, -1, -1):
                sink(a, i, n)
            for end in range(n - 1, 0, -1):
                a[0], a[end] = a[end], a[0]
                sink(a, 0, end)

        kids = [(2, "Ann"), (2, "Bo"), (1, "Cy")]
        heapsort(kids)
        print(kids)
      `,
      output: "[(1, 'Cy'), (2, 'Bo'), (2, 'Ann')]",
    },
    { t: 'table', caption: 'Which sort does what?', head: ['Sort', 'Worst case', 'Extra memory', 'Keeps ties in order?'], rows: [
      ['Merge sort', 'O(n log n)', 'O(n)', 'Yes'],
      ['Quicksort', 'O(n^2)', 'Depends on the code', 'Not usually'],
      ['Heapsort', 'O(n log n)', 'O(1)', 'No'],
      ['`sorted`', 'O(n log n)', 'O(n)', 'Yes'],
    ] },
    { t: 'tip', title: 'What should you use in real code?', text: 'Use `sorted`. It keeps ties in order, and it needs few compares on partly sorted lists. Heapsort helps when memory is tight and a slow worst case is not allowed.' },
    { t: 'tip', title: 'How to spot it', text: 'Look for "sort with no extra list" and "never slow, even in the worst case". If you only need the top few, stop early: that is the top k pattern from lesson 20.3.' },
  ],
  recap: [
    'You can sort a list in place with a max-heap.',
    'You can say why the sorted part grows from the back.',
    'You can compare heapsort with merge sort and quicksort.',
  ],
  practice: [
    { id: 'match-parts', type: 'match', level: 1,
      q: 'Match each part of the heapsort list to what it means.',
      pairs: [
        ['Spot 0', 'The biggest item still in the heap'],
        ['Spot `end`', 'The next spot to be made final'],
        ['Past `end`', 'The sorted part'],
      ],
      explain: 'The heap is at the front, and the sorted part is at the back. `end` marks where one stops.',
      hints: ['Which part never changes again?'],
    },
    { id: 'is-stable', type: 'mcq', level: 1,
      q: 'You must keep ties in the order they came. Which sort should you pick?',
      options: [
        { text: 'Heapsort', why: 'Heapsort is not stable. Its long jumps can pass an item that ties.' },
        '`sorted`',
        { text: 'Either, they both keep ties', why: 'Only `sorted` promises that. You saw heapsort swap Ann and Bo.' },
      ],
      answer: 1,
      explain: 'Python\'s `sorted` is stable, so ties keep their order. Heapsort makes no such promise.',
      hints: ['Think back to Ann and Bo.'],
    },
    { id: 'after-sink', type: 'predict', level: 2,
      q: 'Type what the screen will show. `end` is 4, so the 8 in spot 4 is safe.',
      code: py`
        def sink(a, i, end):
            while 2 * i + 1 < end:
                c = 2 * i + 1
                if c + 1 < end and a[c + 1] > a[c]:
                    c = c + 1
                if a[i] >= a[c]:
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        a = [3, 6, 5, 1, 8]
        sink(a, 0, 4)
        print(a)
      `,
      answer: '[6, 3, 5, 1, 8]',
      explain: 'The children of the 3 are 6 and 5, so the bigger one, 6, goes up. The 3 then has one child, 1, so it stops.',
      hints: ['The bigger child goes up.', 'Spot 4 is past `end`, so it is not a child here.'],
    },
    { id: 'order-loop', type: 'order', level: 2,
      q: 'Put the lines of `heapsort` in order. One line does not belong.',
      lines: [
        'def heapsort(a):',
        '    n = len(a)',
        '    for i in range(n // 2 - 1, -1, -1):',
        '        sink(a, i, n)',
        '    for end in range(n - 1, 0, -1):',
        '        a[0], a[end] = a[end], a[0]',
        '        sink(a, 0, end)',
      ],
      extra: ['        sink(a, 0, n)'],
      run: false,
      explain: 'First make the heap. Then swap and sink. The sink stops at `end`, so it leaves the sorted part alone.',
      hints: ['Which comes first, the heap or the swaps?', 'Should a sink touch the sorted part?'],
    },
    { id: 'fix-end', type: 'fix', level: 2,
      q: 'This heapsort gives a wrong answer, because `sink` pulls the sorted items back into the heap. Fix it.',
      code: py`
        def sink(a, i, end):
            while 2 * i + 1 < len(a):
                c = 2 * i + 1
                if c + 1 < len(a) and a[c + 1] > a[c]:
                    c = c + 1
                if a[i] >= a[c]:
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        def heapsort(a):
            n = len(a)
            for i in range(n // 2 - 1, -1, -1):
                sink(a, i, n)
            for end in range(n - 1, 0, -1):
                a[0], a[end] = a[end], a[0]
                sink(a, 0, end)
      `,
      answer: py`
        def sink(a, i, end):
            while 2 * i + 1 < end:
                c = 2 * i + 1
                if c + 1 < end and a[c + 1] > a[c]:
                    c = c + 1
                if a[i] >= a[c]:
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        def heapsort(a):
            n = len(a)
            for i in range(n // 2 - 1, -1, -1):
                sink(a, i, n)
            for end in range(n - 1, 0, -1):
                a[0], a[end] = a[end], a[0]
                sink(a, 0, end)
      `,
      tests: [
        { label: 'Sorts 5 numbers', check: '(lambda a: (heapsort(a), a == [1, 3, 5, 6, 8])[1])([3, 8, 5, 1, 6])' },
        { label: 'Sorts repeats', check: '(lambda a: (heapsort(a), a == [1, 2, 2, 3])[1])([2, 3, 2, 1])' },
        { label: 'Sorts an empty list', check: '(lambda a: (heapsort(a), a == [])[1])([])' },
        { label: 'Sorts one item', check: '(lambda a: (heapsort(a), a == [4])[1])([4])' },
      ],
      explain: 'Items past `end` are final. So `sink` must stop at `end`, not at the end of the whole list.',
      hints: ['`sink` is handed `end`. Does it use it?', 'Look at both places that use `len(a)`.'],
    },
    { id: 'sort-down', type: 'write', level: 3,
      q: 'Stretch: write `sort_down(a)`. It sorts the list in place from **big to small**, with heapsort. Use a min-heap this time.',
      starter: py`
        def sort_down(a):
            # Your code here.
            pass
      `,
      answer: py`
        def sink(a, i, end):
            while 2 * i + 1 < end:
                c = 2 * i + 1
                if c + 1 < end and a[c + 1] < a[c]:
                    c = c + 1
                if a[i] <= a[c]:
                    return
                a[i], a[c] = a[c], a[i]
                i = c

        def sort_down(a):
            n = len(a)
            for i in range(n // 2 - 1, -1, -1):
                sink(a, i, n)
            for end in range(n - 1, 0, -1):
                a[0], a[end] = a[end], a[0]
                sink(a, 0, end)
      `,
      tests: [
        { label: 'Sorts 5 numbers', check: '(lambda a: (sort_down(a), a == [8, 6, 5, 3, 1])[1])([3, 8, 5, 1, 6])' },
        { label: 'Sorts repeats', check: '(lambda a: (sort_down(a), a == [3, 2, 2, 1])[1])([2, 3, 2, 1])' },
        { label: 'Sorts an empty list', check: '(lambda a: (sort_down(a), a == [])[1])([])' },
        { label: 'Sorts one item', check: '(lambda a: (sort_down(a), a == [4])[1])([4])' },
      ],
      explain: 'With a min-heap, the smallest goes to the back first. So the list ends up big to small. Only 2 compares change.',
      hints: ['Copy `sink` and `heapsort` from the lesson.', 'Flip the 2 compares inside `sink`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 20.4
Course.lesson('m20-heaps', {
  id: '20-5-merge-median',
  num: '20.4',
  title: 'Merge many lists, and the running median',
  goal: 'You can merge k sorted lists with a heap, and track a running median with 2.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How do you merge many sorted lists?' },
    { t: 'q', id: 'spark-front', type: 'mcq', level: 1,
      q: 'You have `[4, 6]`, `[1, 9]` and `[7, 8]`. Each is sorted. Which items must you look at, to find the smallest of all?',
      options: [
        { text: 'All 6 items', why: 'Each list is sorted, so its smallest item is at its front. The others cannot win yet.' },
        'Only the 3 fronts',
        { text: 'Only the first list', why: 'The first list may not hold the smallest. Here the second list does.' },
      ],
      answer: 1,
      explain: 'The fronts are 4, 1 and 7. Nothing behind a front can beat it, so the smallest of all is 1.',
      hints: ['Where is the smallest item of one sorted list?'],
    },
    { t: 'words', items: [
      { word: 'k-way merge', means: 'Join k sorted lists into 1 sorted list.' },
      { word: 'median', means: 'The middle value when items are in order. With an even count, it is halfway between the 2 middle ones.', say: 'MEE-dee-un' },
    ] },
    { t: 'p', text: 'In lesson 17.1 you merged 2 sorted piles by comparing the 2 top cards. In a [[k-way merge]], k top cards need comparing each time. A heap can hold those top cards for you.' },
    { t: 'viz', name: 'm20-merge-k', caption: 'Say which value goes next. Then try an empty list, one long list, and a value that appears in 2 lists.' },
    { t: 'q', id: 'tuple-front', type: 'mcq', level: 2,
      q: 'Why does each tuple hold `which` and `spot`, not only the value?',
      options: [
        { text: 'They make the code faster', why: 'They add work. The real reason is that the code must find where the value came from.' },
        'So you know which list sends the next item',
        { text: 'So the heap can sort the lists', why: 'The lists are sorted already. The heap only picks the smallest front.' },
      ],
      answer: 1,
      explain: '`which` and `spot` say where the value came from, so the next item can go in. `which` also settles ties, before Python reaches `spot`.',
      hints: ['After a value leaves, what must go in the heap next?'],
    },
    { t: 'code', caption: 'The heap never holds more than k tuples. Try an empty list, and a repeat.',
      code: py`
        import heapq

        def merge_k(lists):
            h = []
            for which in range(len(lists)):
                row = lists[which]
                if len(row) > 0:
                    heapq.heappush(h, (row[0], which, 0))
            out = []
            while len(h) > 0:
                value, which, spot = heapq.heappop(h)
                out.append(value)
                row = lists[which]
                spot = spot + 1
                if spot < len(row):
                    heapq.heappush(h, (row[spot], which, spot))
            return out

        print(merge_k([[1, 4, 7], [2, 5], [3, 6]]))
        print(merge_k([[], [2, 2], [1]]))
        print(merge_k([]))
      `,
      output: '[1, 2, 3, 4, 5, 6, 7]\n[1, 2, 2]\n[]',
    },
    { t: 'q', id: 'merge-trust', type: 'predict', level: 2,
      q: '`heapq.merge` does this job for you. But the first list here is not sorted. What will the screen show?',
      code: py`
        import heapq

        print(list(heapq.merge([3, 1], [2])))
      `,
      options: [
        { text: '[1, 2, 3]', why: 'You may think merge sorts for you. It only compares the fronts, and it trusts each list to be in order.' },
        '[2, 3, 1]',
        { text: 'TypeError', why: 'Python gives no warning. It runs fine, and gives a list out of order.' },
      ],
      answer: 1,
      explain: 'The fronts are 3 and 2, so 2 goes first. Then only `[3, 1]` is left, and it comes out as it stands.',
      hints: ['Compare only the fronts.', 'What is left after the 2 goes out?'],
    },
    { t: 'h', text: 'How do you find the middle, as numbers arrive?' },
    { t: 'p', text: 'Numbers keep coming, and you want the [[median]] after each one. Sorting each time is a lot of work. You only need the items next to the middle.' },
    { t: 'big', text: 'Keep the smaller half in a max-heap. Keep the bigger half in a min-heap. The middle sits at their tops.' },
    { t: 'viz', name: 'm20-two-heaps', caption: 'Choose a side for each number. Then try numbers in order, all the same, and one number alone.' },
    { t: 'q', id: 'trace-median', type: 'trace', level: 2,
      q: 'Add 5, then 1, then 9. low holds negatives. Fill in both lists, and the median, after each number. Write each list with no spaces, like `[-5,-1]`.',
      code: py`
        import heapq

        low = []
        high = []
        for x in [5, 1, 9]:
            if len(low) == 0 or x <= -low[0]:
                heapq.heappush(low, -x)
            else:
                heapq.heappush(high, x)
            if len(low) > len(high) + 1:
                heapq.heappush(high, -heapq.heappop(low))
            elif len(high) > len(low):
                heapq.heappush(low, -heapq.heappop(high))
      `,
      head: ['x', 'low', 'high', 'median'],
      rows: [['5', '[-5]', '[]', '5'], ['1', '[-1]', '[5]', '3.0'], ['9', '[-5,-1]', '[9]', '5']],
      given: 1,
      verify: 'import heapq\nlow = []\nhigh = []\nfor x in [5, 1, 9]:\n    if len(low) == 0 or x <= -low[0]:\n        heapq.heappush(low, -x)\n    else:\n        heapq.heappush(high, x)\n    if len(low) > len(high) + 1:\n        heapq.heappush(high, -heapq.heappop(low))\n    elif len(high) > len(low):\n        heapq.heappush(low, -heapq.heappop(high))\n    if len(low) > len(high):\n        m = -low[0]\n    else:\n        m = (-low[0] + high[0]) / 2\n    print(x, str(low).replace(" ", ""), str(high).replace(" ", ""), m)',
      explain: 'After 1, low has too many, so the 5 moves to high. After 9, high has too many, so the 5 moves back.',
      hints: ['low may hold one more than high, but no more than that.', 'With level sides, the median is halfway between the 2 tops. `/` always gives a float, like `3.0`.'],
    },
    { t: 'code', caption: 'Each new number costs a few pushes and pops. Each median is one look at the tops.',
      code: py`
        import heapq

        low = []    # smaller half, as negatives
        high = []   # bigger half

        def add(x):
            if len(low) == 0 or x <= -low[0]:
                heapq.heappush(low, -x)
            else:
                heapq.heappush(high, x)
            if len(low) > len(high) + 1:
                heapq.heappush(high, -heapq.heappop(low))
            elif len(high) > len(low):
                heapq.heappush(low, -heapq.heappop(high))

        def median():
            if len(low) > len(high):
                return -low[0]
            return (-low[0] + high[0]) / 2

        for x in [5, 1, 9, 3, 7]:
            add(x)
            print("added", x, "median", median())
      `,
      output: 'added 5 median 5\nadded 1 median 3.0\nadded 9 median 5\nadded 3 median 4.0\nadded 7 median 5',
    },
    { t: 'trap',
      think: 'The 2 heaps can stay any size.',
      real: 'The middle sits at the tops only if the sizes match, or low has one extra. Skip the balance step, and the median comes out wrong.',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Merge k lists, n items in all', cost: 'O(n log k)', why: 'n items each pass through a heap of at most k tuples.' },
      { op: 'Running median, add a number', cost: 'O(log n)', why: 'A few pushes and pops.' },
      { op: 'Running median, read it', cost: 'O(1)', why: 'One look at the top of each heap.' },
    ] },
    { t: 'table', caption: 'How to spot each pattern', head: ['If the problem says...', 'Think of...'], rows: [
      ['"merge k sorted lists"', 'Heap of fronts: (value, which, spot)'],
      ['"median so far", "as numbers arrive"', 'Two heaps, kept level'],
      ['"median" of one fixed list', 'Sort it, or quickselect from lesson 17.3'],
    ] },
  ],
  recap: [
    'You can merge sorted lists with a heap of fronts.',
    'You can keep a median with 2 level heaps.',
    'You can spot both patterns from their cue words.',
  ],
  practice: [
    { id: 'merge-size', type: 'mcq', level: 1,
      q: 'You merge 5 sorted lists, with 1000 items in all. What is the most tuples the heap can hold?',
      options: [
        { text: '1000', why: 'You may think all the items go in at once. Each list only has one front in the heap.' },
        '5',
        { text: '200', why: 'That is the items per list, if the lists are even. The heap only holds fronts.' },
      ],
      answer: 1,
      explain: 'Each list has at most one item in the heap. A new item from a list goes in only after its last one came out.',
      hints: ['How many items from one list can wait in the heap at once?'],
    },
    { id: 'median-even', type: 'predict', level: 2,
      q: 'What will the screen show? low holds negatives.',
      code: py`
        low = [-4, -1]
        high = [7, 9]
        print((-low[0] + high[0]) / 2)
      `,
      options: [
        { text: '1.5', why: 'You may have used -1. In low, the top is spot 0, which holds -4. That means the biggest of low is 4.' },
        '5.5',
        { text: '4', why: 'That is the top of low only. With level sides, the median is halfway between both tops.' },
      ],
      answer: 1,
      explain: 'The tops mean 4 and 7. Halfway between them is 5.5.',
      hints: ['What does `-low[0]` give?'],
    },
    { id: 'fix-balance', type: 'fix', level: 2,
      q: '`medians(nums)` gives wrong answers, because one side can grow too big. Add the missing step.',
      code: py`
        import heapq

        def medians(nums):
            low = []
            high = []
            out = []
            for x in nums:
                if len(low) == 0 or x <= -low[0]:
                    heapq.heappush(low, -x)
                else:
                    heapq.heappush(high, x)
                if len(low) > len(high):
                    out.append(-low[0])
                else:
                    out.append((-low[0] + high[0]) / 2)
            return out
      `,
      answer: py`
        import heapq

        def medians(nums):
            low = []
            high = []
            out = []
            for x in nums:
                if len(low) == 0 or x <= -low[0]:
                    heapq.heappush(low, -x)
                else:
                    heapq.heappush(high, x)
                if len(low) > len(high) + 1:
                    heapq.heappush(high, -heapq.heappop(low))
                elif len(high) > len(low):
                    heapq.heappush(low, -heapq.heappop(high))
                if len(low) > len(high):
                    out.append(-low[0])
                else:
                    out.append((-low[0] + high[0]) / 2)
            return out
      `,
      tests: [
        { label: 'medians([5])', call: 'medians([5])', want: '[5]' },
        { label: 'medians([5, 1, 9])', call: 'medians([5, 1, 9])', want: '[5, 3.0, 5]' },
        { label: 'medians([1, 2, 3, 4])', call: 'medians([1, 2, 3, 4])', want: '[1, 1.5, 2, 2.5]' },
        { label: 'medians([4, 3, 2, 1])', call: 'medians([4, 3, 2, 1])', want: '[4, 3.5, 3, 2.5]' },
      ],
      explain: 'The tops hold the middle only if the sides are level, or low has one extra. So level them on each trip.',
      hints: ['After a push, compare the 2 lengths.', 'Move one item across if a side has too many. Flip its sign as it crosses.'],
    },
    { id: 'merge-write', type: 'write', level: 2,
      q: 'Write `merge_k(lists)` with a heap of (value, which, spot) tuples. Each list is sorted. Some may be empty.',
      starter: py`
        import heapq

        def merge_k(lists):
            # Your code here.
            return []
      `,
      answer: py`
        import heapq

        def merge_k(lists):
            h = []
            for which in range(len(lists)):
                row = lists[which]
                if len(row) > 0:
                    heapq.heappush(h, (row[0], which, 0))
            out = []
            while len(h) > 0:
                value, which, spot = heapq.heappop(h)
                out.append(value)
                row = lists[which]
                spot = spot + 1
                if spot < len(row):
                    heapq.heappush(h, (row[spot], which, spot))
            return out
      `,
      tests: [
        { label: 'Three lists', call: 'merge_k([[2, 8], [1, 9], [3]])', want: '[1, 2, 3, 8, 9]' },
        { label: 'An empty list inside', call: 'merge_k([[], [4, 6], []])', want: '[4, 6]' },
        { label: 'A repeat in 2 lists', call: 'merge_k([[5], [5, 7]])', want: '[5, 5, 7]' },
        { label: 'No lists', call: 'merge_k([])', want: '[]' },
      ],
      explain: 'The heap holds one front per list. Each time a value leaves, the same list sends its next item.',
      hints: ['Push the first item of each list that has one.', 'Pop until the heap is empty.', 'After a pop, check that the list has another item.'],
    },
    { id: 'top-words', type: 'write', level: 2,
      q: 'Write `top_words(words, k)`. It hands back the k most common words, most common first. Use `Counter` and `heapq.nlargest`. On a tie, the word that is later in the alphabet goes first.',
      starter: py`
        import heapq
        from collections import Counter

        def top_words(words, k):
            # Your code here.
            return []
      `,
      answer: py`
        import heapq
        from collections import Counter

        def top_words(words, k):
            pairs = []
            for word, n in Counter(words).items():
                pairs.append((n, word))
            best = heapq.nlargest(k, pairs)
            return [word for n, word in best]
      `,
      tests: [
        { label: 'One winner', call: 'top_words(["hi", "yo", "hi", "ok", "hi", "yo"], 1)', want: '["hi"]' },
        { label: 'Two words', call: 'top_words(["hi", "yo", "hi", "ok", "hi", "yo"], 2)', want: '["hi", "yo"]' },
        { label: 'A tie', call: 'top_words(["ab", "cd"], 2)', want: '["cd", "ab"]' },
        { label: 'No words', call: 'top_words([], 3)', want: '[]' },
      ],
      explain: 'Put the count first, so tuples compare by count. On a tie, Python compares the words next.',
      hints: ['`Counter(words).items()` gives each word and its count.', 'Make tuples of (count, word), then ask `nlargest` for k.', 'Take the word out of each tuple at the end.'],
    },
    { id: 'running-medians', type: 'write', level: 3,
      q: 'Stretch: write `running_medians(nums)`. It hands back a list of the median after each number. Use 2 heaps.',
      starter: py`
        import heapq

        def running_medians(nums):
            low = []
            high = []
            out = []
            # Your code here.
            return out
      `,
      answer: py`
        import heapq

        def running_medians(nums):
            low = []
            high = []
            out = []
            for x in nums:
                if len(low) == 0 or x <= -low[0]:
                    heapq.heappush(low, -x)
                else:
                    heapq.heappush(high, x)
                if len(low) > len(high) + 1:
                    heapq.heappush(high, -heapq.heappop(low))
                elif len(high) > len(low):
                    heapq.heappush(low, -heapq.heappop(high))
                if len(low) > len(high):
                    out.append(-low[0])
                else:
                    out.append((-low[0] + high[0]) / 2)
            return out
      `,
      tests: [
        { label: 'running_medians([5, 1, 9, 3])', call: 'running_medians([5, 1, 9, 3])', want: '[5, 3.0, 5, 4.0]' },
        { label: 'running_medians([2, 2, 2])', call: 'running_medians([2, 2, 2])', want: '[2, 2.0, 2]' },
        { label: 'running_medians([1, 2, 3, 4])', call: 'running_medians([1, 2, 3, 4])', want: '[1, 1.5, 2, 2.5]' },
        { label: 'running_medians([])', call: 'running_medians([])', want: '[]' },
      ],
      explain: 'There are 3 parts to each trip: pick a side, level the heaps, then read the tops.',
      hints: ['Copy the shape of `add` from the lesson.', 'low may hold one more than high.', 'Read the median at the end of each trip.'],
    },
  ],
});
