/* Module 9: Arrays and Python Lists. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm09-arrays',
  num: 9, part: 2, level: 'B',
  title: 'Arrays and Python Lists',
  blurb: 'See how a list sits in memory, and which jobs make it work hard.',
  needs: ['m05-lists-strings', 'm08-big-o'],
});

// ---------------------------------------------------------------- lesson 9.1
Course.lesson('m09-arrays', {
  id: '9-1-memory-lockers',
  num: '9.1',
  title: 'Memory, lockers and how a list grows',
  goal: 'You can say why reading a spot takes one step, and what a full list does.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How does Python reach spot 900 so fast?' },
    { t: 'p', text: 'You have used lists since Module 5. Now you can look inside one. Here is a puzzle first. Make your best guess.' },
    { t: 'q', id: 'spark-jump', type: 'mcq', level: 1,
      q: 'A list has 1,000 items. Python runs `nums[900]`. How many items does it look at?',
      options: [
        { text: '900', why: 'You may think Python walks from the start. An index jumps there with no walking.' },
        '1',
        { text: '1,000', why: 'You may be thinking of `x in nums`, which can check every item. An index goes to one spot.' },
      ],
      answer: 1,
      explain: 'Python works out where spot 900 is, then goes there. It looks at 1 item.',
      hints: ['Think of the lockers from Module 5.', 'If you know the locker number, do you need to open the others?'],
    },
    { t: 'words', items: [
      { word: 'memory', means: 'Where the computer keeps values while a program runs. Think of a very long row of numbered lockers.' },
      { word: 'array', means: 'A row of items in numbered spots. Python lists work like this.', say: 'uh-RAY' },
      { word: 'amortized', means: 'Shared out. A rare slow step, spread over many quick ones, costs little each.', say: 'AM-or-tized' },
    ] },
    { t: 'analogy', title: 'Picture this', text: '[[Memory]] is a very long row of numbered lockers. An [[array]] takes lockers that sit side by side. Unlike a real locker, a list spot holds an arrow to its value.' },
    { t: 'p', text: 'All arrows are the same size, so every spot takes the same room. That is the secret. If you know where the row starts, one sum finds any spot.' },
    { t: 'steps', title: 'Find nums[3] in 3 steps', items: [
      { label: 'Know the start', text: 'The list remembers where its row begins. Say it begins at memory spot 100.' },
      { label: 'Do one sum', text: 'Add the index to the start.', code: '100 + 3   # gives 103' },
      { label: 'Jump there', text: 'Python goes straight to spot 103. It skips every other spot.' },
    ] },
    { t: 'viz', name: 'm09-jump', caption: 'Guess each time it asks. Then type your own list and k. Try a k that is too big, and a k below 0.' },
    { t: 'q', id: 'count-sums', type: 'mcq', level: 2,
      q: 'Count the sums by hand. How many does `nums[3]` need with 4 items? And with 4,000 items?',
      options: [
        '1 and 1',
        { text: '4 and 4,000', why: 'That counts every item in the list. The sum uses only the start and the index.' },
        { text: '3 and 3', why: 'You may think Python walks past spots 0, 1 and 2. It does one sum and jumps.' },
      ],
      answer: 0,
      explain: 'The sum is the same size for any list. So we say a read is **O(1)**.',
      hints: ['What goes into the sum?', 'Does the length of the list appear in the sum?'],
    },
    { t: 'code', caption: 'Reading and changing a spot both jump straight there. Change the index, and guess first.',
      code: py`
        nums = [40, 15, 72, 8, 33]
        print(nums[3])     # one jump
        nums[3] = 9        # one jump, then a change
        print(nums)
        print(len(nums))   # the list keeps its own count
      `,
      output: '8\n[40, 15, 72, 9, 33]\n5',
    },
    { t: 'tip', title: 'Real memory numbers', text: 'In real memory, each spot takes up a few numbers, not 1. So the true sum also multiplies. It is still one quick sum.' },
    { t: 'q', id: 'fill-sum', type: 'fill', level: 2,
      q: 'A row starts at memory spot 200. Fill the gap so the code finds index 3.',
      code: 'start = 200\nk = 3\nspot = start + ____\nprint(spot)',
      blanks: ['k'],
      output: '203',
      explain: 'The place is the start plus the index. So index 3 sits at spot 203.',
      hints: ['Which name is on the index?'],
    },
    { t: 'h', text: 'What if the row is full?' },
    { t: 'p', text: 'The lockers next to your row may belong to something else. The items must stay side by side. So a full list gets a bigger row and moves everything over.' },
    { t: 'p', text: 'Moving is slow work, so Python plans ahead. It takes spare lockers each time. Most appends then drop into a spare spot, and nothing else moves.' },
    { t: 'viz', name: 'm09-grow', caption: 'Watch the moves count. Then try 8 adds, and compare moves with appends.' },
    { t: 'p', text: 'This code does the same count, with no lists at all. It keeps only the numbers. It uses the same doubling rule as the picture.' },
    { t: 'code', caption: 'Change 8 to 16 and to 100. Guess first. Moves stay under 2 times the appends.',
      code: py`
        room = 1
        used = 0
        moves = 0
        for i in range(8):
            if used == room:
                moves = moves + used
                room = room * 2
            used = used + 1
        print("appends:", used)
        print("moves:", moves)
      `,
      output: 'appends: 8\nmoves: 7',
    },
    { t: 'q', id: 'count-moves', type: 'predict', level: 2,
      q: 'Follow the code by hand. What will the screen show?',
      code: py`
        room = 1
        used = 0
        moves = 0
        for i in range(4):
            if used == room:
                moves = moves + used
                room = room * 2
            used = used + 1
        print(moves)
      `,
      options: [
        { text: '0', why: 'The first append fits, but the row fills up when i is 1. Then items must move.' },
        '3',
        { text: '6', why: 'You may be adding a move for every item on every trip. Moves happen only when the row is full.' },
      ],
      answer: 1,
      explain: 'The row is full when i is 1, and 1 item moves. It is full again when i is 2, and 2 items move.',
      hints: ['Write room and used after each trip.', 'Moves grow only on trips where used equals room.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`nums[k]`', cost: 'O(1)', why: 'Read or change. One sum, then one jump.' },
      { op: '`len`', cost: 'O(1)', why: 'The list keeps its own count.' },
      { op: '`append`', cost: 'O(1)', why: 'Amortized. Most appends use a spare spot, and a rare one moves every item.' },
    ] },
    { t: 'p', text: 'So that rare move is shared out over many cheap appends. That is what [[amortized]] means. One single append can still be slow, but a long run of them is not.' },
    { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
      ['"the item at spot k", "the last item"', 'An index. It is one jump.'],
      ['"how many items?"', '`len`. There is no need to count them.'],
      ['"add items one by one"', '`append`. You do not need to plan the size first.'],
    ] },
    { t: 'trap',
      think: 'A list is a chain. To reach spot 50, Python walks past 50 items.',
      real: 'A list is one row, side by side, so Python jumps. Chains do exist. You build one in Module 14.',
      code: py`
        nums = [0] * 1000
        print(nums[900])   # one jump, no walking
      `,
    },
    { t: 'tip', title: 'Does Python really double?', text: 'No. We double here to keep the sums neat. Real Python adds about 1 spare spot for every 8 items. So it moves items more often. The moves for each append still stay small, so append is still O(1) amortized.' },
    { t: 'tip', title: 'Where the lockers picture stops', text: 'A real row of lockers cannot grow. A Python list can, because it moves to a bigger row by itself. Your name for the list still works after the move.' },
  ],
  recap: [
    'One sum finds any spot, so reading is O(1).',
    'A full list moves to a bigger row.',
    'Spare room makes append O(1) amortized.',
  ],
  practice: [
    { id: 'which-one-step', type: 'mcq', level: 1,
      q: 'Which line takes one step, even in a huge list?',
      options: [
        '`nums[500]`',
        { text: '`x in nums`', why: 'This one looks at items one by one. You see why in the next lesson.' },
        { text: '`nums.copy()`', why: 'A copy must make a new spot for every item, so it grows with the list.' },
      ],
      answer: 0,
      explain: 'An index needs one sum and one jump, however long the list is.',
      hints: ['Which line knows the spot number already?'],
    },
    { id: 'match-jobs', type: 'match', level: 1,
      q: 'Match each job to the work it does.',
      pairs: [
        ['`nums[k]`', 'One sum, then one jump'],
        ['`len(nums)`', 'Reads a count the list keeps'],
        ['append, with spare room', 'Drops into a free spot'],
        ['append, with a full row', 'Moves every item to a bigger row'],
      ],
      explain: 'Only the full row is slow work. It also happens rarely.',
      hints: ['Which job has to touch every item?'],
    },
    { id: 'full-row-moves', type: 'mcq', level: 2,
      q: 'A list has room for 4, and it holds 4 items. You append one more. How many items must move?',
      options: [
        { text: '1', why: 'The new item is not the only one that travels. The whole row must stay side by side.' },
        { text: '0', why: 'That is true when there is a spare spot. Here the row is full.' },
        '4',
      ],
      answer: 2,
      explain: 'The 4 old items all move to the bigger row. Then the new item drops in.',
      hints: ['Items must stay side by side.', 'How many items are in the old row?'],
    },
    { id: 'alias-after-move', type: 'predict', level: 2,
      q: 'The list grows many times here. What will the screen show?',
      code: py`
        a = [1]
        b = a
        for i in range(20):
            a.append(i)
        print(len(b))
        print(a is b)
      `,
      options: [
        { text: '1\nFalse', why: 'You may think a move makes a new list. The list moves its row, but it stays the same list.' },
        '21\nTrue',
        { text: '21\nFalse', why: 'The row inside moves, but a and b still name one list. So `is` says True.' },
      ],
      answer: 1,
      explain: 'A move changes where the row is, not which list it is. Both names still see every item.',
      hints: ['How many lists does this code make?', 'Think back to `b = a` in Module 5.'],
    },
    { id: 'fix-empty-spot', type: 'fix', level: 2,
      q: 'This should make a list holding 5, but Python stops. Fix line 2.',
      code: py`
        nums = []
        nums[0] = 5
        print(nums)
      `,
      answer: py`
        nums = []
        nums.append(5)
        print(nums)
      `,
      wantOutput: '[5]',
      explain: 'A spot must exist before you can change it. `append` makes a new spot.',
      hints: ['How many spots does an empty list have?', 'Which tool adds a new spot?'],
    },
    { id: 'safe-get', type: 'write', level: 2,
      q: 'Write `safe_get(nums, k)`. It gives back the item at index k, or `None` if that spot does not exist. k is never below 0.',
      starter: py`
        def safe_get(nums, k):
            # Your code here.
            return 0
      `,
      answer: py`
        def safe_get(nums, k):
            if k < len(nums):
                return nums[k]
            return None
      `,
      tests: [
        { label: 'safe_get([4, 7], 1)', call: 'safe_get([4, 7], 1)', want: '7' },
        { label: 'safe_get([4, 7], 2)', call: 'safe_get([4, 7], 2)', want: 'None' },
        { label: 'safe_get([], 0)', call: 'safe_get([], 0)', want: 'None' },
        { label: 'safe_get([9], 0)', call: 'safe_get([9], 0)', want: '9' },
      ],
      explain: 'Python makes this same check before each read. The last spot is one less than the length.',
      hints: ['Which numbers are safe for k?', 'Compare k with `len(nums)`.'],
    },
    { id: 'moves-for', type: 'write', level: 3,
      q: 'Stretch: write `moves_for(n)`. It gives back how many moves n appends make. The row starts with room for 1 and doubles when full.',
      starter: py`
        def moves_for(n):
            # Your code here.
            return 0
      `,
      answer: py`
        def moves_for(n):
            room = 1
            used = 0
            moves = 0
            for i in range(n):
                if used == room:
                    moves = moves + used
                    room = room * 2
                used = used + 1
            return moves
      `,
      tests: [
        { label: 'moves_for(1)', call: 'moves_for(1)', want: '0' },
        { label: 'moves_for(4)', call: 'moves_for(4)', want: '3' },
        { label: 'moves_for(5)', call: 'moves_for(5)', want: '7' },
        { label: 'moves_for(9)', call: 'moves_for(9)', want: '15' },
      ],
      explain: 'Moves happen only when the row is full, and the row doubles each time. So moves stay under 2 times n.',
      hints: ['You saw this loop earlier in the lesson.', 'Keep 3 names: room, used and moves.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 9.2
Course.lesson('m09-arrays', {
  id: '9-2-what-is-slow',
  num: '9.2',
  title: 'What is slow: moving, copying and walking',
  goal: 'You can count the work behind insert, pop, a slice and `x in nums`.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Can one line hide many steps?' },
    { t: 'p', text: 'A line of code looks small. But you must count what it makes the computer do. Try this one.' },
    { t: 'q', id: 'spark-insert', type: 'mcq', level: 1,
      q: '`nums` has 4 items. `nums.insert(0, 99)` puts 99 at the front. How many items must move?',
      options: [
        { text: '0', why: 'You may think the front is free. Items sit side by side, so spot 0 is taken.' },
        { text: '1', why: 'Only the old first item? It would land on the next item. That one must move too.' },
        '4',
      ],
      answer: 2,
      explain: 'Every item moves one spot right, to free spot 0.',
      hints: ['Spot 0 is taken. Where can its item go?', 'That next spot is taken too.'],
    },
    { t: 'words', items: [
      { word: 'shift', means: 'Move an item one spot over, to make room or close a gap.' },
      { word: 'scan', means: 'Look at items one by one, from the start, until you find what you want.' },
    ] },
    { t: 'analogy', title: 'Lockers again', text: 'There can be no empty locker in the middle of the row. So to free locker 0, every owner moves one door along. Unlike real people, the items never get tired, but each [[shift]] is still a step.' },
    { t: 'big', text: 'One line of code can hide many steps. Count the items it must touch.' },
    { t: 'steps', title: 'Insert at the front', items: [
      { label: 'Start at the end', text: 'The last item moves first. It has a free spot to go to.' },
      { label: 'Work back', text: 'Each item moves right, into the spot that is now free.' },
      { label: 'Drop it in', text: 'Spot 0 is free now, so the new item goes there.' },
    ] },
    { t: 'viz', name: 'm09-shift', caption: 'Type your own list. Try at = 0, then an at in the middle, then the length of your list.' },
    { t: 'q', id: 'count-shifts', type: 'trace', level: 2,
      q: 'Count by hand. The list has 4 items. How many items move for `nums.insert(at, 9)`?',
      code: py`
        nums = [1, 2, 3, 4]
        nums.insert(at, 9)
      `,
      head: ['at', 'moves'],
      rows: [['0', '4'], ['1', '3'], ['2', '2'], ['3', '1'], ['4', '0']],
      given: 1,
      verify: 'nums = [1, 2, 3, 4]\nfor at in range(5):\n    print(at, len(nums[at:]))',
      explain: 'Every item from spot `at` onward moves. The nearer the end, the fewer there are.',
      hints: ['List the spots from `at` to the end.', 'Count how many there are.'],
    },
    { t: 'h', text: 'What if you keep taking from the front?' },
    { t: 'p', text: '`pop(0)` closes the gap each time. So a loop that empties a list from the front does a lot of work. This code counts it.' },
    { t: 'code', caption: 'Each `pop(0)` shifts all the items left behind it. Guess the third number before you run it.',
      code: py`
        def drain(size):
            nums = [0] * size
            moves = 0
            while len(nums) > 0:
                moves = moves + len(nums) - 1
                nums.pop(0)
            return moves

        print(drain(4))
        print(drain(8))
        print(drain(1000))
      `,
      output: '6\n28\n499500',
    },
    { t: 'p', text: 'Twice the items gave about 4 times the moves. That is **O(n^2)**, from one small line in a loop. Taking from the end with `nums.pop()` shifts nothing.' },
    { t: 'tip', title: 'A tool for later', text: 'Module 15 shows `collections.deque`. It can add and take at both ends in O(1). Use it when the front is busy.' },
    { t: 'h', text: 'Does a slice cost anything?' },
    { t: 'p', text: 'You met slices in Module 5. A slice makes a new list, so Python must copy each item it takes.' },
    { t: 'code', caption: 'part is a true copy. So a change to part leaves nums alone.',
      code: py`
        nums = [5, 6, 7, 8, 9]
        part = nums[1:4]
        part[0] = 99
        print(part)
        print(nums)
      `,
      output: '[99, 7, 8]\n[5, 6, 7, 8, 9]',
    },
    { t: 'q', id: 'slice-count', type: 'mcq', level: 2,
      q: 'How many items does `nums[2:6]` copy?',
      options: [
        { text: '6', why: 'That is the stop number. Python takes only the spots from start up to the stop.' },
        { text: '5', why: 'This counts the stop spot too. A slice stops before its stop number.' },
        '4',
      ],
      answer: 2,
      explain: 'It copies spots 2, 3, 4 and 5. In general, `nums[i:j]` copies `j - i` items.',
      hints: ['Write out the spots in the slice.', 'Spot 6 stays out.'],
    },
    { t: 'h', text: 'Is `x in nums` one step?' },
    { t: 'p', text: 'A jump needs the spot number. With `x in nums` you know the value, but not the spot. So Python must [[scan]].' },
    { t: 'viz', name: 'm09-walk', caption: 'Pick a target near the start, one near the end, then one that is not there. Watch looks.' },
    { t: 'q', id: 'count-looks', type: 'predict', level: 2,
      q: 'How many looks does this take? Count by hand first.',
      code: py`
        nums = [4, 9, 2, 9]
        looks = 0
        for x in nums:
            looks = looks + 1
            if x == 9:
                break
        print(looks)
      `,
      options: [
        { text: '1', why: 'That would mean 9 is in spot 0. Python starts at spot 0 and finds 4 there.' },
        '2',
        { text: '4', why: 'The `break` stops the loop at the first 9. It never reaches the second one.' },
      ],
      answer: 1,
      explain: 'Python looks at 4, then at 9. Then it stops, because it found one.',
      hints: ['Follow the loop one trip at a time.', 'What does `break` do?'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`append`, `pop()`', cost: 'O(1)', why: 'The end is free, so nothing shifts. Append is amortized.' },
      { op: '`insert(k, x)`, `pop(k)`', cost: 'O(n - k)', why: 'Every item after spot k shifts. At the front, that is O(n).' },
      { op: '`nums[i:j]`', cost: 'O(j - i)', why: 'It copies each item in the piece.' },
      { op: '`x in nums`, `min`, `max`', cost: 'O(n)', why: 'Python may have to look at every item.' },
      { op: '`copy()`', cost: 'O(n)', why: 'It copies every item.' },
    ] },
    { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
      ['"take from the front" many times', 'Every `pop(0)` shifts. Try the end, or `deque` from Module 15.'],
      ['"is it in the list?" many times', 'Each `in` scans. Make a set first, from Module 6.'],
      ['"cut a piece" inside a loop', 'Each slice copies. Use index numbers instead.'],
      ['"add to the end"', '`append` is cheap. Go ahead.'],
    ] },
    { t: 'trap',
      think: 'A loop with `in` inside it is only one loop, so it is O(n).',
      real: 'The `in` hides a second loop. With 3 items in each list, that can be 3 x 3 = 9 looks.',
      code: py`
        for x in a:      # n trips
            if x in b:   # up to n looks each trip
                print(x)
      `,
    },
  ],
  recap: [
    'Insert and pop shift every item after their spot.',
    'A slice copies each item it takes.',
    '`x in nums` scans, so it is O(n).',
  ],
  practice: [
    { id: 'no-shift', type: 'mcq', level: 1,
      q: 'Which line shifts no items at all?',
      options: [
        { text: '`nums.insert(0, 5)`', why: 'The front is taken, so every item shifts right.' },
        { text: '`nums.pop(0)`', why: 'This leaves a gap at the front, so every other item shifts left.' },
        '`nums.append(5)`',
      ],
      answer: 2,
      explain: 'The new item goes after the last one. No item is in its way.',
      hints: ['Which end has free room?'],
    },
    { id: 'pop-seven', type: 'mcq', level: 2,
      q: 'A list has 10 items. How many items shift for `nums.pop(7)`?',
      options: [
        { text: '7', why: 'That counts the items before spot 7. Those items stay where they are.' },
        { text: '3', why: 'You may be counting spot 7 too. That item leaves, so it does not shift.' },
        '2',
      ],
      answer: 2,
      explain: 'The spots are 0 to 9. Only spots 8 and 9 sit after spot 7.',
      hints: ['Write the last few spots: 7, 8, 9.', 'Which ones come after the item that leaves?'],
    },
    { id: 'slice-not-linked', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        a = [1, 2, 3]
        b = a[:2]
        a[0] = 7
        print(b)
      `,
      options: [
        { text: '[7, 2]', why: 'You may think a slice stays joined to the list. It is a copy, made before the change.' },
        '[1, 2]',
        { text: '[7, 2, 3]', why: 'This is the whole list a. The slice took only 2 items.' },
      ],
      answer: 1,
      explain: 'The slice copied 1 and 2 into a new list. Later changes to a stay away from it.',
      hints: ['Does a slice make a new list?'],
    },
    { id: 'pick-cheap', type: 'mcq', level: 2,
      q: 'You must check 1,000 names against a list of 1,000 friends. Which is the cheapest plan?',
      options: [
        { text: 'Use `name in friends` for each name', why: 'Each `in` can scan all 1,000 friends. That can reach 1,000 x 1,000 looks.' },
        'Make a set of friends, then use `in` on the set',
        { text: 'Slice the list first, then use `in`', why: 'A slice adds copying. The scan is still there.' },
      ],
      answer: 1,
      explain: '`in` on a set is O(1) on average. So you do about 1,000 quick checks.',
      hints: ['Which kind of `in` does not scan?', 'Think back to Module 6.'],
    },
    { id: 'fix-moves', type: 'fix', level: 2,
      q: '`insert_moves` should count how many items shift. For a list of 4 and at = 0, it should give 4. Fix it.',
      code: py`
        def insert_moves(size, at):
            return size - at - 1
      `,
      answer: py`
        def insert_moves(size, at):
            return size - at
      `,
      tests: [
        { label: 'insert_moves(4, 0)', call: 'insert_moves(4, 0)', want: '4' },
        { label: 'insert_moves(4, 3)', call: 'insert_moves(4, 3)', want: '1' },
        { label: 'insert_moves(4, 4)', call: 'insert_moves(4, 4)', want: '0' },
        { label: 'insert_moves(0, 0)', call: 'insert_moves(0, 0)', want: '0' },
      ],
      explain: 'The item at spot `at` moves too, so nothing is left out. That gives `size - at`.',
      hints: ['Count by hand for size 4 and at 3.', 'Does the item in spot `at` itself move?'],
    },
    { id: 'count-looks-write', type: 'write', level: 2,
      q: 'Write `count_looks(nums, target)`. It scans from the start, and gives back how many items it looked at. Stop when you find target.',
      starter: py`
        def count_looks(nums, target):
            # Your code here.
            return 0
      `,
      answer: py`
        def count_looks(nums, target):
            looks = 0
            for x in nums:
                looks = looks + 1
                if x == target:
                    break
            return looks
      `,
      tests: [
        { label: 'count_looks([4, 7, 1], 7)', call: 'count_looks([4, 7, 1], 7)', want: '2' },
        { label: 'Not found looks at all', call: 'count_looks([4, 7, 1], 9)', want: '3' },
        { label: 'Duplicates stop at the first', call: 'count_looks([5, 5], 5)', want: '1' },
        { label: 'An empty list', call: 'count_looks([], 1)', want: '0' },
      ],
      explain: 'Count first, then check. If the target is missing, the loop looks at every item.',
      hints: ['Start a count at 0.', 'Add 1 on each trip, then ask if you found it.', 'Use `break` to stop early.'],
    },
    { id: 'merge-two', type: 'write', level: 3,
      q: 'Stretch: `a` and `b` are both in order. Write `merge(a, b)`. It gives back one new list in order. Do not use `sorted`.',
      starter: py`
        def merge(a, b):
            # Use an index for each list.
            return []
      `,
      answer: py`
        def merge(a, b):
            out = []
            i = 0
            j = 0
            while i < len(a) and j < len(b):
                if a[i] <= b[j]:
                    out.append(a[i])
                    i = i + 1
                else:
                    out.append(b[j])
                    j = j + 1
            while i < len(a):
                out.append(a[i])
                i = i + 1
            while j < len(b):
                out.append(b[j])
                j = j + 1
            return out
      `,
      tests: [
        { label: 'merge([1, 4], [2, 3])', call: 'merge([1, 4], [2, 3])', want: '[1, 2, 3, 4]' },
        { label: 'Ties', call: 'merge([1, 1], [1])', want: '[1, 1, 1]' },
        { label: 'One empty list', call: 'merge([], [5, 6])', want: '[5, 6]' },
        { label: 'Both empty', call: 'merge([], [])', want: '[]' },
        { label: 'Different lengths', call: 'merge([9], [1, 2, 3])', want: '[1, 2, 3, 9]' },
      ],
      explain: 'Each step takes the smaller front item and appends it. No item shifts, so this is O(len(a) + len(b)).',
      hints: ['Keep an index i for a and an index j for b.', 'Compare `a[i]` with `b[j]`, and append the smaller.', 'When one list runs out, add what is left of the other.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 9.3
Course.lesson('m09-arrays', {
  id: '9-3-in-place-edits',
  num: '9.3',
  title: 'In-place edits: reverse, rotate, clean and flip',
  goal: 'You can reverse, rotate and clean a list in place, and flip a square grid.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Can you change a list with no second list?' },
    { t: 'p', text: 'A second list takes extra memory. Some tasks tell you not to use one. You already know the tool for this job, from Module 5.' },
    { t: 'q', id: 'spark-flip', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        a = [1, 2, 3, 4]
        a[0], a[3] = a[3], a[0]
        a[1], a[2] = a[2], a[1]
        print(a)
      `,
      options: [
        { text: '[1, 2, 3, 4]', why: 'Each line swaps a different pair, so the swaps do not undo each other.' },
        { text: '[4, 2, 3, 1]', why: 'That is only the first line. The second line swaps the 2 and the 3 as well.' },
        '[4, 3, 2, 1]',
      ],
      answer: 2,
      explain: 'The ends trade places, then the middle pair does. The list is now reversed, with no second list.',
      hints: ['Write the list again after each line.'],
    },
    { t: 'words', items: [
      { word: 'in place', means: 'Changing the list itself, with no second list.' },
      { word: 'write index', means: 'A name that marks the next spot to write to.' },
      { word: 'matrix', means: 'Another name for a grid. It is a list of lists.', say: 'MAY-triks' },
    ] },
    { t: 'analogy', title: 'Lockers again', text: 'Two friends stand at the two ends of the row. They trade what is in their lockers, then each step inward. Unlike real friends, Python trades only the arrows, so no value gets copied.' },
    { t: 'viz', name: 'm09-reverse', caption: 'Guess when the loop stops. Then try an even count, an odd count, one item and no items.' },
    { t: 'q', id: 'count-swaps', type: 'mcq', level: 2,
      q: 'Count by hand. How many swaps does this take for 6 items? And for 7 items?',
      options: [
        { text: '6 and 7', why: 'One swap fixes 2 items at once, so you need about half as many.' },
        '3 and 3',
        { text: '3 and 4', why: 'The middle item of 7 has nobody to trade with. It is already in place.' },
      ],
      answer: 1,
      explain: 'Each swap fixes 2 items. With 7 items, the middle one stays where it is.',
      hints: ['How many items does one swap fix?', 'What happens to the middle item?'],
    },
    { t: 'code', caption: 'Each swap fixes 2 items, so n items take about n / 2 swaps. Try other lists.',
      code: py`
        def flip(a):
            left = 0
            right = len(a) - 1
            swaps = 0
            while left < right:
                a[left], a[right] = a[right], a[left]
                left = left + 1
                right = right - 1
                swaps = swaps + 1
            return swaps

        nums = [1, 2, 3, 4, 5, 6]
        print(flip(nums), nums)
        one = [7]
        print(flip(one), one)
        none = []
        print(flip(none), none)
      `,
      output: '3 [6, 5, 4, 3, 2, 1]\n0 [7]\n0 []',
    },
    { t: 'tip', title: 'Python has this built in', text: '`nums.reverse()` does the same job [[in place]]. Like `append`, it changes the list and hands back `None`.' },
    { t: 'h', text: 'How do you rotate a list?' },
    { t: 'p', text: 'Rotate means the last k items jump to the front, and the rest move along. Moving items one at a time is slow. A clever trick uses 3 flips.' },
    { t: 'steps', title: 'Rotate [1, 2, 3, 4, 5] by 2', items: [
      { label: 'Flip it all', text: 'The last 2 items are now at the front, but backwards.', code: '[5, 4, 3, 2, 1]' },
      { label: 'Flip the first k', text: 'Now those 2 items face the right way.', code: '[4, 5, 3, 2, 1]' },
      { label: 'Flip the rest', text: 'The others face the right way too.', code: '[4, 5, 1, 2, 3]' },
    ] },
    { t: 'code', caption: 'k % n handles a k bigger than the list. Rotating 5 items by 7 is the same as by 2.',
      code: py`
        def flip_part(a, i, j):
            while i < j:
                a[i], a[j] = a[j], a[i]
                i = i + 1
                j = j - 1

        def rotate(a, k):
            n = len(a)
            if n == 0:
                return
            k = k % n
            flip_part(a, 0, n - 1)
            flip_part(a, 0, k - 1)
            flip_part(a, k, n - 1)

        nums = [1, 2, 3, 4, 5]
        rotate(nums, 7)
        print(nums)
      `,
      output: '[4, 5, 1, 2, 3]',
    },
    { t: 'q', id: 'rotate-big-k', type: 'mcq', level: 2,
      q: 'You rotate `[1, 2, 3]` by 4. What do you get?',
      options: [
        { text: 'An IndexError', why: 'The `k % n` line stops k from going past the end. So there is no bad index.' },
        '[3, 1, 2]',
        { text: '[1, 2, 3]', why: 'That is what a rotate by 3 gives. 4 % 3 is 1, so one item jumps.' },
      ],
      answer: 1,
      explain: 'A rotate by 3 brings the list back to the start. So 4 acts like 1, and the 3 jumps to the front.',
      hints: ['Work out 4 % 3.'],
    },
    { t: 'h', text: 'How do you remove duplicates in place?' },
    { t: 'p', text: 'Popping each duplicate shifts all the items after it, and that adds up. A [[write index]] does one trip instead. Good items get written forward, and the leftovers leave from the end.' },
    { t: 'viz', name: 'm09-keep', caption: 'Follow x and w. Everything before w is kept. Try your own list with lots of repeats.' },
    { t: 'code', caption: 'Writing behind the reader is safe here. w can never pass the spot being read.',
      code: py`
        def clean(nums):
            seen = set()
            w = 0
            for x in nums:
                if x not in seen:
                    seen.add(x)
                    nums[w] = x
                    w = w + 1
            while len(nums) > w:
                nums.pop()

        a = [3, 1, 3, 2, 1]
        clean(a)
        print(a)
        b = [5, 5, 5]
        clean(b)
        print(b)
      `,
      output: '[3, 1, 2]\n[5]',
    },
    { t: 'q', id: 'fill-write', type: 'fill', level: 2,
      q: 'This keeps only the numbers above 0. Fill the gaps. Use the same shape as above.',
      code: py`
        nums = [3, -1, 4, 0, 5]
        w = 0
        for x in nums:
            if x > 0:
                nums[____] = x
                w = w + ____
        while len(nums) > w:
            nums.pop()
        print(nums)
      `,
      blanks: ['w', '1'],
      output: '[3, 4, 5]',
      explain: 'Each good item goes at spot w. Then w steps on to the next free spot.',
      hints: ['Which name marks the next spot to write?', 'How far does w move after each write?'],
    },
    { t: 'h', text: 'How do you flip a grid in place?' },
    { t: 'p', text: 'You met grids in Module 5. A grid is also called a [[matrix]]. To turn rows into columns, each cell trades with its mirror across the diagonal.' },
    { t: 'viz', name: 'm09-transpose', caption: 'Guess which pair trades next. Then try a grid with 4 rows and 4 columns.' },
    { t: 'q', id: 'fix-twice', type: 'fix', level: 2,
      q: 'This should turn rows into columns, but the grid does not change. Fix one line.',
      code: py`
        grid = [[1, 2],
                [3, 4]]
        for r in range(2):
            for c in range(2):
                grid[r][c], grid[c][r] = grid[c][r], grid[r][c]
        print(grid)
      `,
      answer: py`
        grid = [[1, 2],
                [3, 4]]
        for r in range(2):
            for c in range(r + 1, 2):
                grid[r][c], grid[c][r] = grid[c][r], grid[r][c]
        print(grid)
      `,
      wantOutput: '[[1, 3], [2, 4]]',
      explain: 'With c from 0, each pair trades twice, and that undoes the swap. Starting at r + 1 visits each pair once.',
      hints: ['How many times does the pair (0, 1) and (1, 0) trade?', 'Make c start one past the diagonal.'],
    },
    { t: 'tip', title: 'Only for square grids', text: 'This needs as many rows as columns. With 2 rows of 3, `grid[2][0]` does not exist, so Python stops with an `IndexError`. Build a new grid for that case.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Reverse in place', cost: 'O(n)', why: 'About n / 2 swaps, and no second list.' },
      { op: 'Rotate with 3 flips', cost: 'O(n)', why: 'Each flip touches each item at most once.' },
      { op: 'Clean with a write index', cost: 'O(n)', why: 'One trip. Each `in` on a set is O(1) on average. The set takes extra memory.' },
      { op: 'Flip an n by n grid', cost: 'O(n^2)', why: 'It visits about half of the n x n cells.' },
    ] },
    { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
      ['"in place", "no second list"', 'Swaps, or a write index.'],
      ['"reverse", "both ends"', 'Two indexes that step inward.'],
      ['"remove" and "keep the order"', 'A write index, then pop the leftovers.'],
      ['"shift by k", "rotate"', 'Three flips, and remember `k % n`.'],
      ['"rows become columns"', 'Swap across the diagonal.'],
    ] },
    { t: 'trap',
      think: 'I can pop items while I walk through the list with an index.',
      real: 'A pop shifts the next item back into your spot. Then `i + 1` jumps over it, so it gets skipped.',
      code: py`
        i = 0
        while i < len(nums):
            if nums[i] == 0:
                nums.pop(i)   # next item shifts into spot i
            i = i + 1         # and now it gets skipped
      `,
    },
  ],
  recap: [
    'You can reverse a list with swaps from both ends.',
    'You can clean a list with a write index.',
    'You can flip a square grid across its diagonal.',
  ],
  practice: [
    { id: 'what-in-place', type: 'mcq', level: 1,
      q: 'Which line changes `nums` in place?',
      options: [
        { text: '`new = sorted(nums)`', why: '`sorted` makes a second list. nums stays as it was.' },
        '`nums.reverse()`',
        { text: '`part = nums[1:]`', why: 'A slice makes a second list. nums stays as it was.' },
      ],
      answer: 1,
      explain: '`reverse` changes the list itself, and makes no new list.',
      hints: ['Which line makes no second list?'],
    },
    { id: 'reverse-none', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        nums = [1, 2, 3]
        x = nums.reverse()
        print(x)
      `,
      options: [
        { text: '[3, 2, 1]', why: 'You may think `reverse` hands back the list. It changes the list and hands back None.' },
        { text: '[1, 2, 3]', why: 'That is neither one here. x names what `reverse` hands back.' },
        'None',
      ],
      answer: 2,
      explain: 'Like `append`, `reverse` changes the list in place and hands back `None`.',
      hints: ['Think back to `x = nums.append(4)`.'],
    },
    { id: 'swaps-nine', type: 'predict', level: 2,
      q: 'This loop counts the swaps for 9 items. Type what the screen will show.',
      code: py`
        nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        left = 0
        right = len(nums) - 1
        swaps = 0
        while left < right:
            left = left + 1
            right = right - 1
            swaps = swaps + 1
        print(swaps)
      `,
      answer: '4',
      why: 'The ends step inward until they meet at the middle item.',
      explain: 'Each swap fixes 2 items, and the middle item stays. So 9 items take 4 swaps.',
      hints: ['How many pairs can you make from 9 items?'],
    },
    { id: 'fix-skip', type: 'fix', level: 2,
      q: '`drop_zeros` should remove every 0, but it misses some. Fix it.',
      code: py`
        def drop_zeros(nums):
            i = 0
            while i < len(nums):
                if nums[i] == 0:
                    nums.pop(i)
                i = i + 1
      `,
      answer: py`
        def drop_zeros(nums):
            i = 0
            while i < len(nums):
                if nums[i] == 0:
                    nums.pop(i)
                else:
                    i = i + 1
      `,
      tests: [
        { label: 'Two zeros in a row', check: '(lambda a: (drop_zeros(a), a)[1] == [1])([0, 0, 1])' },
        { label: 'Only zeros', check: '(lambda a: (drop_zeros(a), a)[1] == [])([0, 0, 0])' },
        { label: 'No zeros', check: '(lambda a: (drop_zeros(a), a)[1] == [2, 3])([2, 3])' },
        { label: 'An empty list', check: '(lambda a: (drop_zeros(a), a)[1] == [])([])' },
      ],
      explain: 'After a pop, a new item sits in spot i. So i should move on only when nothing was popped.',
      hints: ['After `pop(i)`, what is in spot i?', 'Should i grow on that trip?'],
    },
    { id: 'move-zeros', type: 'write', level: 2,
      q: 'Write `move_zeros(nums)`. It moves every 0 to the end, in place. The other items keep their order.',
      starter: py`
        def move_zeros(nums):
            # Use a write index.
            return None
      `,
      answer: py`
        def move_zeros(nums):
            w = 0
            for x in nums:
                if x != 0:
                    nums[w] = x
                    w = w + 1
            while w < len(nums):
                nums[w] = 0
                w = w + 1
      `,
      tests: [
        { label: 'Zeros in the middle', check: '(lambda a: (move_zeros(a), a)[1] == [1, 2, 0, 0])([0, 1, 0, 2])' },
        { label: 'No zeros', check: '(lambda a: (move_zeros(a), a)[1] == [3, 4])([3, 4])' },
        { label: 'Only zeros', check: '(lambda a: (move_zeros(a), a)[1] == [0, 0])([0, 0])' },
        { label: 'An empty list', check: '(lambda a: (move_zeros(a), a)[1] == [])([])' },
      ],
      explain: 'Write each item that is not 0 forward. Then fill every spot from w onward with 0.',
      hints: ['Copy the shape of `clean`, but with no set.', 'After the loop, which spots still need a 0?'],
    },
    { id: 'rotate-grid', type: 'write', level: 3,
      q: 'Stretch: write `turn(grid)`. It turns a square grid a quarter turn clockwise, in place. Flip it over the diagonal, then reverse each row.',
      starter: py`
        def turn(grid):
            # Your code here.
            return None
      `,
      answer: py`
        def turn(grid):
            n = len(grid)
            for r in range(n):
                for c in range(r + 1, n):
                    grid[r][c], grid[c][r] = grid[c][r], grid[r][c]
            for row in grid:
                row.reverse()
      `,
      tests: [
        { label: '2 by 2', check: '(lambda g: (turn(g), g)[1] == [[3, 1], [4, 2]])([[1, 2], [3, 4]])' },
        { label: '3 by 3', check: '(lambda g: (turn(g), g)[1] == [[7, 4, 1], [8, 5, 2], [9, 6, 3]])([[1, 2, 3], [4, 5, 6], [7, 8, 9]])' },
        { label: '1 by 1', check: '(lambda g: (turn(g), g)[1] == [[5]])([[5]])' },
      ],
      explain: 'The flip turns rows into columns. Reversing each row then gives the quarter turn.',
      hints: ['Start with the flip from this lesson.', 'A loop over the rows can call `row.reverse()`.'],
    },
    { id: 'spiral', type: 'write', level: 3,
      q: 'Stretch: write `spiral(grid)`. It gives back the values in a clockwise spiral, starting at the top left. The grid need not be square.',
      starter: py`
        def spiral(grid):
            # Keep 4 walls: top, bottom, left and right.
            return []
      `,
      answer: py`
        def spiral(grid):
            out = []
            if len(grid) == 0:
                return out
            top = 0
            bottom = len(grid) - 1
            left = 0
            right = len(grid[0]) - 1
            while top <= bottom and left <= right:
                for c in range(left, right + 1):
                    out.append(grid[top][c])
                top = top + 1
                for r in range(top, bottom + 1):
                    out.append(grid[r][right])
                right = right - 1
                if top <= bottom:
                    for c in range(right, left - 1, -1):
                        out.append(grid[bottom][c])
                    bottom = bottom - 1
                if left <= right:
                    for r in range(bottom, top - 1, -1):
                        out.append(grid[r][left])
                    left = left + 1
            return out
      `,
      tests: [
        { label: '2 by 2', call: 'spiral([[1, 2], [3, 4]])', want: '[1, 2, 4, 3]' },
        { label: '3 by 3', call: 'spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]])', want: '[1, 2, 3, 6, 9, 8, 7, 4, 5]' },
        { label: 'One row', call: 'spiral([[1, 2, 3]])', want: '[1, 2, 3]' },
        { label: 'One column', call: 'spiral([[1], [2], [3]])', want: '[1, 2, 3]' },
        { label: 'No rows', call: 'spiral([])', want: '[]' },
      ],
      explain: 'Walk along each wall, then move that wall inward. The checks stop you going back over a lone row or column.',
      hints: ['Walk the top row, then move the top wall down.', 'Then do the right side, the bottom and the left.', 'Check top <= bottom before you walk the bottom row.'],
    },
  ],
});
