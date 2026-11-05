/* Module 5: Lists, Tuples and Strings. Part 1 (Learn Python). */
Course.module({
  id: 'm05-lists-strings',
  num: 5, part: 1, level: 'B',
  title: 'Lists, Tuples and Strings',
  blurb: 'Keep many things in one name, and change them with care.',
  needs: ['m04-functions'],
});

// ---------------------------------------------------------------- lesson 5.1
Course.lesson('m05-lists-strings', {
  id: '5-1-lists',
  num: '5.1',
  title: 'Lists: many things in one name',
  goal: 'You can read or change any spot, cut a piece, and add or remove items.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What if you have 5 pets?' },
    { t: 'p', text: 'So far, one name is on one value. Now say you want to keep 5 pet names. You do not want 5 variables in your code.' },
    { t: 'words', items: [
      { word: 'list', means: 'Things in a row, in order, under one name.' },
      { word: 'index', means: 'The number that tells which spot in a list. Counting starts at 0.', say: 'IN-deks' },
      { word: 'slice', means: 'A piece cut from a list. It is a new list.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[list]] is a row of numbered lockers. You can jump straight to any locker if you know its number. Unlike most lockers, the numbers start at 0.' },
    { t: 'code', caption: 'Square brackets make a list. Run it, then add a new pet.',
      code: py`
        pets = ["ant", "bee", "cat", "dog"]
        print(pets)
        print(pets[0])
        print(pets[2])
        print(len(pets))
      `,
      output: "['ant', 'bee', 'cat', 'dog']\nant\ncat\n4",
    },
    { t: 'p', text: 'The number in square brackets is the [[index]]. It picks one spot. `len` counts the items.' },
    { t: 'q', id: 'spot-one', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        pets = ["ant", "bee", "cat"]
        print(pets[1])
      `,
      options: [
        { text: 'ant', why: 'You may be counting from 1. Python counts from 0, so spot 0 holds ant.' },
        'bee',
        { text: 'pets[1]', why: 'With no quote marks, Python looks up the value. It does not show the words.' },
      ],
      answer: 1,
      explain: 'Counting starts at 0. So spot 1 is the second item, bee.',
      hints: ['Write 0, 1, 2 under the three items.', 'Which item has the 1 under it?'],
    },
    { t: 'viz', name: 'm05-list-index', caption: 'Answer each question to move on. Then change your pick and try a number that is too big.' },
    { t: 'h', text: 'What happens at a spot that is not there?' },
    { t: 'code', error: true, caption: 'Run it. Python stops and tells you why.',
      code: py`
        pets = ["ant", "bee", "cat"]
        print(pets[3])
      `,
    },
    { t: 'p', text: '`IndexError` means: that spot does not exist. A list of 3 items has spots 0, 1 and 2. The last index is always one less than the count.' },
    { t: 'h', text: 'How do you change one spot?' },
    { t: 'p', text: 'Put the index on the left of `=`. That spot now means the new value. The other spots stay as they are.' },
    { t: 'code', caption: 'Run it. Then change a different spot.',
      code: py`
        pets = ["ant", "bee", "cat"]
        pets[1] = "owl"
        print(pets)
      `,
      output: "['ant', 'owl', 'cat']",
    },
    { t: 'h', text: 'How do you cut a piece from a list?' },
    { t: 'steps', title: 'Read a slice in 3 steps', items: [
      { label: 'Find the start', text: 'The first number is where the [[slice]] starts.', code: 'pets[1:3]   # starts at spot 1' },
      { label: 'Find the stop', text: 'The second number is where it stops. That spot stays out.', code: 'pets[1:3]   # stops before spot 3' },
      { label: 'Take the items', text: 'You get spots 1 and 2, in a new list.', code: "['bee', 'cat']" },
    ] },
    { t: 'viz', name: 'm05-slice', caption: 'Change start and stop, and guess the slice each time.' },
    { t: 'code', caption: 'Leave out a number, and the slice runs to that end of the list.',
      code: py`
        pets = ["ant", "bee", "cat", "dog", "elk"]
        print(pets[1:3])
        print(pets[:2])
        print(pets[3:])
        print(pets[-2:])
      `,
      output: "['bee', 'cat']\n['ant', 'bee']\n['dog', 'elk']\n['dog', 'elk']",
    },
    { t: 'q', id: 'fill-slice', type: 'fill', level: 2,
      q: 'Fill the gaps so the screen shows `[6, 7]`.',
      code: 'nums = [5, 6, 7, 8]\nprint(nums[____:____])',
      blanks: ['1', '3'],
      output: '[6, 7]',
      explain: '6 is at spot 1 and 7 is at spot 2. The stop is 3, so the slice ends before spot 3.',
      hints: ['Write the index under each number first.', 'The stop is one more than the last spot you want.'],
    },
    { t: 'h', text: 'How do you add and remove items?' },
    { t: 'p', text: 'A list can grow and shrink. `append`, `pop` and `insert` are tools that belong to the list. A dot joins the list to its tool.' },
    { t: 'viz', name: 'm05-list-change', caption: 'Step through it. Watch which items move.' },
    { t: 'code', caption: 'pop(0) takes the item at spot 0. Try other numbers.',
      code: py`
        nums = [10, 20, 30]
        nums.append(40)
        print(nums)
        last = nums.pop()
        print(last)
        first = nums.pop(0)
        print(first)
        nums.insert(0, 5)
        print(nums)
      `,
      output: '[10, 20, 30, 40]\n40\n10\n[5, 20, 30]',
    },
    { t: 'tip', title: 'Lockers again', text: 'Adding or removing at the end is quick. `insert(0, x)` and `pop(0)` must move every other item, and that takes work.' },
    { t: 'q', id: 'order-fruit', type: 'order', level: 2,
      q: 'Put the lines in order. Make a list, add pear at the end, then show the last item.',
      lines: ['fruit = ["fig", "plum"]', 'fruit.append("pear")', 'print(fruit[-1])'],
      extra: ['fruit = append("pear")'],
      output: 'pear',
      explain: 'First the list must exist. Then append adds pear. Spot -1 is the last item.',
      hints: ['You cannot change a list before you make it.', 'append comes after a dot, right after the name of the list.'],
    },
    { t: 'trap', think: '`x = nums.append(4)` puts the new list in x.',
      real: '`append` changes the list and hands back `None`. So x is on `None`, which means nothing here.',
      code: py`
        nums = [1, 2]
        x = nums.append(3)
        print(x)      # None
        print(nums)   # [1, 2, 3]
      `,
    },
    { t: 'tip', title: 'A better start for biggest', text: 'In lesson 3.3, `biggest` starts at 0. That fails if every number is below 0. Now you can start at the first item: `biggest = nums[0]`.' },
  ],
  recap: [
    'You can read any spot, and -1 is the last.',
    'A slice stops before its stop number.',
    'append, pop and insert change the list.',
  ],
  practice: [
    { id: 'last-index', type: 'mcq', level: 1,
      q: 'A list has 6 items. What is the index of the last spot, counting from the front?',
      options: [
        { text: '6', why: 'That is the count. Counting starts at 0, so the last spot is one less.' },
        '5',
        { text: '1', why: 'That is the second spot. The first spot is 0, and the last is near the count.' },
      ],
      answer: 1,
      explain: 'The spots are 0, 1, 2, 3, 4 and 5. So the last index is 5.',
      hints: ['Write the spots out, starting at 0.'],
    },
    { id: 'neg-two', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: 'letters = ["a", "b", "c", "d"]\nprint(letters[-2])',
      answer: 'c',
      explain: '-1 is the last item, d. So -2 is the one before it, c.',
      hints: ['A negative index counts from the end.', 'Start at d and call it -1. Then step back one.'],
    },
    { id: 'slice-out', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'n = [2, 4, 6, 8, 10]\nprint(n[1:4])',
      options: [
        { text: '[2, 4, 6, 8]', why: 'You may be counting from 1. Spot 0 holds 2, so spot 1 holds 4.' },
        '[4, 6, 8]',
        { text: '[4, 6, 8, 10]', why: 'This keeps the stop spot. A slice stops before its stop number.' },
      ],
      answer: 1,
      explain: 'The slice takes spots 1, 2 and 3. It stops before spot 4.',
      hints: ['Write the index under each number.', 'Spot 4 stays out of the slice.'],
    },
    { id: 'chain', type: 'predict', level: 2,
      q: 'Follow each line. What will the screen show?',
      code: 'a = [1, 2]\na.append(3)\na.insert(0, 9)\na.pop()\nprint(a)',
      options: [
        { text: '[9, 1, 2, 3]', why: 'This forgets the pop line. pop takes the last item out.' },
        { text: '[1, 9, 2]', why: 'This puts 9 at spot 1. insert(0, 9) puts it at spot 0, the front.' },
        '[9, 1, 2]',
      ],
      answer: 2,
      explain: 'The list goes [1, 2, 3], then [9, 1, 2, 3]. Then pop takes the 3 away.',
      hints: ['Write the list again after each line.'],
    },
    { id: 'fix-last', type: 'fix', level: 2,
      q: 'This code should show the last score, but Python stops. Fix it.',
      code: 'scores = [5, 8, 9]\nprint(scores[3])',
      answer: 'scores = [5, 8, 9]\nprint(scores[-1])',
      wantOutput: '9',
      explain: 'A list of 3 items has spots 0, 1 and 2. Spot -1 or spot 2 gives the last one.',
      hints: ['Which spots does this list have?', 'The last index is one less than the count.'],
    },
    { id: 'ends', type: 'write', level: 2,
      q: 'Write a function `ends(items)`. It gives back a new list with the first item and the last item.',
      starter: 'def ends(items):\n    # Your code here.\n    return []\n',
      answer: 'def ends(items):\n    return [items[0], items[-1]]\n',
      tests: [
        { label: 'ends([1, 2, 3])', call: 'ends([1, 2, 3])', want: '[1, 3]' },
        { label: 'ends(["a", "b"])', call: 'ends(["a", "b"])', want: '["a", "b"]' },
        { label: 'ends([7])', call: 'ends([7])', want: '[7, 7]' },
      ],
      explain: 'Spot 0 is the first item and spot -1 is the last. Square brackets build the new list.',
      hints: ['Which index is first? Which is last?', 'You can write a list with two items inside, like `[x, y]`.'],
    },
    { id: 'rotate', type: 'write', level: 3,
      q: 'Stretch: write `rotate(items)`. It moves the first item to the end, then gives back the list.',
      starter: 'def rotate(items):\n    # Your code here.\n    return items\n',
      answer: 'def rotate(items):\n    first = items.pop(0)\n    items.append(first)\n    return items\n',
      tests: [
        { label: 'rotate([1, 2, 3])', call: 'rotate([1, 2, 3])', want: '[2, 3, 1]' },
        { label: 'rotate(["a", "b"])', call: 'rotate(["a", "b"])', want: '["b", "a"]' },
        { label: 'rotate([5])', call: 'rotate([5])', want: '[5]' },
      ],
      explain: '`pop(0)` takes the first item and hands it back. `append` puts it at the end.',
      hints: ['Take the first item out, and stick a name on it.', 'Which tool adds an item at the end?'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 5.2
Course.lesson('m05-lists-strings', {
  id: '5-2-mutation-aliasing',
  num: '5.2',
  title: 'Two names, one list',
  goal: 'You can tell when two names share one list, and you can make a second list.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Does b = a make a second list?' },
    { t: 'p', text: 'Here is a small puzzle. Make your best guess. A wrong guess is fine here.' },
    { t: 'q', id: 'spark-share', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        a = [1, 2, 3]
        b = a
        b.append(4)
        print(a)
      `,
      options: [
        { text: '[1, 2, 3]', why: 'You may think `b = a` makes a copy. It does not, so a sees the change.' },
        '[1, 2, 3, 4]',
        { text: '[1, 2, 3, 4, 4]', why: 'append runs once here, so 4 goes in once.' },
      ],
      answer: 1,
      explain: '`b = a` makes no new list. a and b are two names for one list.',
      hints: ['How many lists does this code make?', 'Look for square brackets. They appear once.'],
    },
    { t: 'words', items: [
      { word: 'alias', means: 'A second name for the same thing.', say: 'AY-lee-us' },
      { word: 'mutate', means: 'Change a thing in place. It stays the same thing.', say: 'MYOO-tate' },
      { word: 'copy', means: 'A new list with the same items in it.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Picture one dog with two name tags, Rex and Buddy. Put a hat on Rex, and Buddy wears it too. Unlike a dog, a list can lose a tag and still be there.' },
    { t: 'big', text: '`b = a` makes a second name, not a second list.' },
    { t: 'viz', name: 'm05-two-tags', caption: 'Follow the arrows. Each arrow shows which list a name means.' },
    { t: 'p', text: 'So b is an [[alias]] of a. `append` will [[mutate]] the list, and every name for that list sees the change.' },
    { t: 'h', text: 'Why do numbers seem to act in another way?' },
    { t: 'p', text: 'You cannot mutate a number. `y = y + 1` makes a new value and moves the tag y. The tag x stays where it was.' },
    { t: 'code', caption: 'Run it. x stays 5, because only the tag y moved.',
      code: py`
        x = 5
        y = x
        y = y + 1
        print(x)
        print(y)
      `,
      output: '5\n6',
    },
    { t: 'q', id: 'moved-tag', type: 'predict', level: 2,
      q: 'This time `=` moves a tag. What will the screen show?',
      code: py`
        a = [1, 2]
        b = a
        a = [9]
        print(b)
      `,
      options: [
        { text: '[9]', why: 'You may think `b = a` links the names forever. It does not. Only the tag a moved.' },
        { text: '[1, 2, 9]', why: '`a = [9]` adds nothing. It makes a new list and moves the tag a.' },
        '[1, 2]',
      ],
      answer: 2,
      explain: '`a = [9]` moves the tag a to a new list. b still names the old list.',
      hints: ['Does `a = [9]` change a list, or move a tag?'],
    },
    { t: 'table', caption: 'What each line really does', head: ['Line', 'What it does'], rows: [
      ['`b = a`', 'Adds a second name. No new list.'],
      ['`b.append(4)`', 'Changes the list. All its names see it.'],
      ['`b = [9]`', 'Moves the name b to a new list.'],
      ['`b = a.copy()`', 'Makes a new list, and b names it.'],
    ] },
    { t: 'h', text: 'How do you make a second list?' },
    { t: 'steps', title: 'Keep a safe spare', items: [
      { label: 'Make the copy', text: 'Use `copy`, or a slice with no numbers. Both make a new list.', code: 'spare = a.copy()\nalso = a[:]' },
      { label: 'Change the first list', text: 'Now change a as much as you like.', code: 'a.append(4)' },
      { label: 'Check the spare', text: 'The [[copy]] stays as it was.', code: 'print(spare)' },
    ] },
    { t: 'code', caption: 'Run it. `==` asks: same items? `is` asks: same list?',
      code: py`
        a = [1, 2]
        b = a
        c = a.copy()
        print(a == c)
        print(a is b)
        print(a is c)
      `,
      output: 'True\nTrue\nFalse',
    },
    { t: 'tip', title: 'A copy makes one new list', text: 'If the items are lists too, both lists still share those items. Lesson 5.5 shows this with grids.' },
    { t: 'h', text: 'What if a function gets your list?' },
    { t: 'p', text: 'When you give a list to a function, it gets the same list, not a copy. If it changes the list, your list changes too.' },
    { t: 'code', caption: 'The parameter stars is one more name for the list mine.',
      code: py`
        def add_star(stars):
            stars.append("*")

        mine = ["*"]
        add_star(mine)
        print(mine)
      `,
      output: "['*', '*']",
    },
    { t: 'q', id: 'fix-backup', type: 'fix', level: 2,
      q: 'backup should keep the old scores. Now it changes too. Fix one line.',
      code: 'scores = [3, 5]\nbackup = scores\nscores.append(9)\nprint(backup)',
      answer: 'scores = [3, 5]\nbackup = scores.copy()\nscores.append(9)\nprint(backup)',
      wantOutput: '[3, 5]',
      explain: '`scores.copy()` makes a new list. Later changes to scores stay away from it.',
      hints: ['How many lists does this code make?', 'backup needs its own list. Use `copy` or a slice.'],
    },
    { t: 'trap', think: '`b = a` gives me a spare list I can change safely.',
      real: 'Both names mean one list, so your change shows up in both. Use `a.copy()` for a spare.',
      code: py`
        a = [1]
        b = a        # second name
        c = a.copy() # second list
      `,
    },
  ],
  recap: [
    'b = a adds a name, not a list.',
    'A change to the list shows through every name.',
    'copy() or [:] makes a true second list.',
  ],
  practice: [
    { id: 'which-copy', type: 'mcq', level: 1,
      q: 'Which line makes a copy of the list a?',
      options: [
        { text: '`b = a`', why: 'This adds a second name. There is still one list.' },
        '`b = a.copy()`',
        { text: '`b == a`', why: '`==` asks a question: are the items the same? It makes nothing new.' },
        { text: '`b = a.append(1)`', why: '`append` changes a and hands back None. So b is on None.' },
      ],
      answer: 1,
      explain: '`copy` makes a new list with the same items.',
      hints: ['Which line makes something new?'],
    },
    { id: 'number-tag', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: 'x = 2\ny = x\nx = 7\nprint(y)',
      answer: '2',
      explain: '`x = 7` moves only the tag x. The tag y stays on 2.',
      hints: ['Which tag moves on line 3?'],
    },
    { id: 'slice-copy', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'a = [1, 2]\nb = a[:]\nb.append(3)\nprint(a, b)',
      options: [
        { text: '[1, 2, 3] [1, 2, 3]', why: 'That would be true for `b = a`. A slice makes a new list.' },
        '[1, 2] [1, 2, 3]',
        { text: '[1, 2] [1, 2]', why: 'append does change b. It adds 3 to the list that b names.' },
      ],
      answer: 1,
      explain: '`a[:]` makes a new list. So append changes only the list that b names.',
      hints: ['Does `a[:]` make a new list?'],
    },
    { id: 'func-same', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'def drop(box):\n    box.pop()\n\nitems = [1, 2]\ndrop(items)\nprint(items)',
      options: [
        { text: '[1, 2]', why: 'You may think the function gets a copy. It gets the same list.' },
        '[1]',
        { text: '[2]', why: 'pop with no number takes the last item, not the first.' },
      ],
      answer: 1,
      explain: 'box and items are two names for one list. pop takes out the last item.',
      hints: ['Is box a new list, or a new name?'],
    },
    { id: 'with-extra', type: 'write', level: 2,
      q: 'Write `with_extra(items, x)`. It gives back a new list with x at the end. The list items must not change.',
      starter: 'def with_extra(items, x):\n    # Make a copy first.\n    return None\n',
      answer: 'def with_extra(items, x):\n    new = items.copy()\n    new.append(x)\n    return new\n',
      tests: [
        { label: 'with_extra([1, 2], 3)', call: 'with_extra([1, 2], 3)', want: '[1, 2, 3]' },
        { label: 'with_extra([], 5)', call: 'with_extra([], 5)', want: '[5]' },
        { label: 'The first list stays the same', check: '(lambda a: (with_extra(a, 9), a)[1] == [1, 2])([1, 2])' },
      ],
      explain: 'The copy is a new list. So append leaves the first list alone.',
      hints: ['First make a copy and give it a name.', 'Add x to the copy, and hand the copy back.'],
    },
    { id: 'fix-bonus', type: 'fix', level: 2,
      q: 'mine should stay `[1, 2]`, but it changes. Fix the function.',
      code: 'def add_bonus(scores):\n    new = scores\n    new.append(10)\n    return new\n\nmine = [1, 2]\nbonus = add_bonus(mine)\nprint(mine)\nprint(bonus)',
      answer: 'def add_bonus(scores):\n    new = scores.copy()\n    new.append(10)\n    return new\n\nmine = [1, 2]\nbonus = add_bonus(mine)\nprint(mine)\nprint(bonus)',
      wantOutput: '[1, 2]\n[1, 2, 10]',
      explain: '`new = scores` adds a name to the same list. `scores.copy()` makes a second list.',
      hints: ['How many lists are there inside the function?', 'Change the line that makes new.'],
    },
    { id: 'grid-share', type: 'predict', level: 3,
      q: 'Stretch: a list can hold lists. What will the screen show?',
      code: 'row = [0, 0]\ngrid = [row, row]\nrow[0] = 5\nprint(grid)',
      options: [
        { text: '[[5, 0], [0, 0]]', why: 'You may think each spot holds its own row. Both spots hold the same list.' },
        { text: '[[0, 0], [0, 0]]', why: 'You may think grid took copies. It holds the list that row names.' },
        '[[5, 0], [5, 0]]',
      ],
      answer: 2,
      explain: 'grid holds one list two times. A change to that list shows up in both spots.',
      hints: ['How many lists with two zeros does this code make?'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 5.3
Course.lesson('m05-lists-strings', {
  id: '5-3-tuples-unpacking',
  num: '5.3',
  title: 'Tuples, unpacking and the swap',
  goal: 'You can make a tuple, name each item, and swap two values in one line.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Can two names trade values?' },
    { t: 'p', text: 'The tag a is on 3, and the tag b is on 7. You want them to trade values. Here is a first try.' },
    { t: 'q', id: 'spark-swap', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        a = 3
        b = 7
        a = b
        b = a
        print(a, b)
      `,
      options: [
        { text: '7 3', why: 'That is the swap you want. But `a = b` moves the tag off the 3, so b can never find it.' },
        '7 7',
        { text: '3 7', why: 'This says nothing changed. But `a = b` does move the tag a to 7.' },
      ],
      answer: 1,
      explain: 'After `a = b`, a is 7. Then `b = a` gives b that same 7.',
      hints: ['Write down a and b after each line.'],
    },
    { t: 'viz', name: 'm05-swap-wrong', caption: 'Watch what happens to the 3.' },
    { t: 'h', text: 'What is a tuple?' },
    { t: 'words', items: [
      { word: 'tuple', means: 'A row of items, like a list, but it can never change.', say: 'TUH-pull' },
      { word: 'unpack', means: 'Give each item of a row its own name, in one line.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[tuple]] is like a sealed pack of pens. You can look at each pen and count them. You cannot swap a pen out. Unlike a real pack, it can never be opened.' },
    { t: 'code', caption: 'Round brackets and commas make a tuple. Index, len and loops all work.',
      code: py`
        point = (3, 7)
        print(point)
        print(point[0])
        print(len(point))
        for n in point:
            print(n)
      `,
      output: '(3, 7)\n3\n2\n3\n7',
    },
    { t: 'code', error: true, caption: 'Run it. Python will not let you change a tuple.',
      code: py`
        point = (3, 7)
        point[0] = 9
      `,
    },
    { t: 'p', text: '`TypeError` here means: a tuple cannot change. Use a tuple for things that belong together, like x and y on a map.' },
    { t: 'h', text: 'How do you unpack a tuple?' },
    { t: 'p', text: 'Put names on the left, with commas. Python gives the first item to the first name, and so on.' },
    { t: 'code', caption: 'Each name gets one item. Try adding a third item and a third name.',
      code: py`
        point = (3, 7)
        x, y = point
        print(x)
        print(y)
      `,
      output: '3\n7',
    },
    { t: 'q', id: 'unpack-three', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'day, month, year = (5, 11, 2026)\nprint(month)',
      options: [
        { text: '5', why: 'That is the first item. month is the second name, so it gets the second item.' },
        '11',
        { text: '(5, 11, 2026)', why: 'Each name gets one item. month does not get the whole tuple.' },
      ],
      answer: 1,
      explain: 'Names and items pair up in order. month is second, so it gets 11.',
      hints: ['Pair each name with one item, from left to right.'],
    },
    { t: 'h', text: 'Now you can swap' },
    { t: 'steps', title: 'How the swap works', items: [
      { label: 'Build the right side', text: 'Python makes a tuple from the values of b and a.', code: 'b, a   # makes (7, 3)' },
      { label: 'Unpack to the left', text: 'The first name gets the first item. The second name gets the second.', code: 'a, b = (7, 3)' },
    ] },
    { t: 'viz', name: 'm05-swap-right', caption: 'The tuple holds both values, so neither one gets lost.' },
    { t: 'q', id: 'fill-swap', type: 'fill', level: 2,
      q: 'Fill the gaps so x and y trade values.',
      code: 'x = 1\ny = 2\nx, y = ____, ____\nprint(x, y)',
      blanks: ['y', 'x'],
      output: '2 1',
      explain: 'The right side uses the old values. So x gets the old y, and y gets the old x.',
      hints: ['The first name on the left should get the value of y.'],
    },
    { t: 'q', id: 'trace-temp', type: 'trace', level: 2,
      q: 'Here is the long way to swap, with a spare name t. Fill in the table.',
      code: 'a = 3\nb = 7\nt = a\na = b\nb = t',
      head: ['line', 'a', 'b', 't'],
      rows: [['1', '3', '-', '-'], ['2', '3', '7', '-'], ['3', '3', '7', '3'], ['4', '7', '7', '3'], ['5', '7', '3', '3']],
      given: 1,
      verify: 'a = 3\nprint(1, a, "-", "-")\nb = 7\nprint(2, a, b, "-")\nt = a\nprint(3, a, b, t)\na = b\nprint(4, a, b, t)\nb = t\nprint(5, a, b, t)',
      explain: 't saves the old a. So the 3 is still there when b needs it.',
      hints: ['Only one name changes on each line.', 'Line 3 sticks the tag t on the 3, so the 3 is not lost.'],
    },
    { t: 'h', text: 'Where else does unpacking help?' },
    { t: 'p', text: 'A function can hand back a tuple. A loop can unpack each pair in a list. `min` and `max` find the smallest and biggest.' },
    { t: 'code', caption: 'Change the numbers and the pairs, then run it again.',
      code: py`
        def low_high(nums):
            return min(nums), max(nums)

        low, high = low_high([4, 9, 2])
        print(low, high)

        pairs = [("Ann", 3), ("Bo", 5)]
        for name, score in pairs:
            print(name, score)
      `,
      output: '2 9\nAnn 3\nBo 5',
    },
    { t: 'trap', think: 'I can unpack a tuple into any number of names.',
      real: 'The count must match. Python stops with a `ValueError` if there are too many or too few names.',
      code: py`
        a, b = (1, 2, 3)   # ValueError
      `,
    },
    { t: 'tip', title: 'The comma makes the tuple', text: '`(5)` is only the number 5. `(5,)` is a tuple with one item. The comma does the work.' },
  ],
  recap: [
    'A tuple is a row that can never change.',
    'Unpacking gives each item its own name.',
    '`a, b = b, a` swaps two values.',
  ],
  practice: [
    { id: 'which-tuple', type: 'mcq', level: 1,
      q: 'Which line makes a tuple?',
      options: [
        '`t = (1, 2)`',
        { text: '`t = [1, 2]`', why: 'Square brackets make a list. A list can change.' },
        { text: '`t = 1 2`', why: 'With no comma, Python gets confused. Commas keep the items apart.' },
      ],
      answer: 0,
      explain: 'Round brackets and a comma make a tuple.',
      hints: ['Think about which kind of brackets a list uses.'],
    },
    { id: 'tuple-change', type: 'predict', level: 1,
      q: 'What happens when this runs?',
      code: 't = (1, 2)\nt[0] = 5\nprint(t)',
      expectError: true,
      options: [
        { text: '(5, 2)', why: 'That is what a list would do. A tuple can never change.' },
        { text: '(1, 2)', why: 'Python does not skip the bad line. It stops there with an error.' },
        'TypeError',
      ],
      answer: 2,
      explain: 'A tuple cannot change, so Python stops with a `TypeError` on line 2.',
      hints: ['Is a tuple allowed to change?'],
    },
    { id: 'old-values', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'a, b = 1, 2\na, b = b, a + b\nprint(a, b)',
      options: [
        { text: '2 4', why: 'This uses the new a to work out `a + b`. The whole right side uses the old values.' },
        '2 3',
        { text: '1 3', why: 'a does change. It gets the first item on the right, which is the old b.' },
      ],
      answer: 1,
      explain: 'The right side runs first, with a as 1 and b as 2. It makes (2, 3).',
      hints: ['Work out the whole right side before any name changes.'],
    },
    { id: 'fix-swap', type: 'fix', level: 2,
      q: 'This code should swap x and y, but it loses a value. Fix it.',
      code: 'x = 1\ny = 2\nx = y\ny = x\nprint(x, y)',
      answer: 'x = 1\ny = 2\nx, y = y, x\nprint(x, y)',
      wantOutput: '2 1',
      explain: '`x, y = y, x` works out both values first. Then both names change.',
      hints: ['What is x after line 3?', 'Replace lines 3 and 4 with one line that uses commas.'],
    },
    { id: 'first-last-tuple', type: 'write', level: 2,
      q: 'Write `first_last(items)`. It hands back a tuple with the first item and the last item.',
      starter: 'def first_last(items):\n    # Your code here.\n    return None\n',
      answer: 'def first_last(items):\n    return items[0], items[-1]\n',
      tests: [
        { label: 'first_last([1, 2, 3])', call: 'first_last([1, 2, 3])', want: '(1, 3)' },
        { label: 'first_last(["a", "b"])', call: 'first_last(["a", "b"])', want: '("a", "b")' },
      ],
      explain: 'A comma in a `return` line makes a tuple.',
      hints: ['Spot 0 is first and spot -1 is last.', 'Write `return`, then two values with a comma between them.'],
    },
    { id: 'swap-ends', type: 'write', level: 3,
      q: 'Stretch: write `swap_ends(items)`. It swaps the first and last items of the list, then gives back the list.',
      starter: 'def swap_ends(items):\n    # Your code here.\n    return items\n',
      answer: 'def swap_ends(items):\n    items[0], items[-1] = items[-1], items[0]\n    return items\n',
      tests: [
        { label: 'swap_ends([1, 2, 3])', call: 'swap_ends([1, 2, 3])', want: '[3, 2, 1]' },
        { label: 'swap_ends(["a", "b"])', call: 'swap_ends(["a", "b"])', want: '["b", "a"]' },
        { label: 'swap_ends([5])', call: 'swap_ends([5])', want: '[5]' },
      ],
      explain: 'The swap works on spots in a list too. The right side saves both values first.',
      hints: ['Spots work like names here: `items[0]` can go on the left of `=`.', 'Use the same shape as `a, b = b, a`.'],
    },
    { id: 'total-pairs', type: 'write', level: 3,
      q: 'Stretch: `pairs` is a list of (name, score) tuples. Write `total(pairs)` to add up all the scores.',
      starter: 'def total(pairs):\n    # Your code here.\n    return None\n',
      answer: 'def total(pairs):\n    result = 0\n    for name, score in pairs:\n        result = result + score\n    return result\n',
      tests: [
        { label: 'total([("Ann", 3), ("Bo", 5)])', call: 'total([("Ann", 3), ("Bo", 5)])', want: '8' },
        { label: 'total([("Cy", 4)])', call: 'total([("Cy", 4)])', want: '4' },
        { label: 'total([])', call: 'total([])', want: '0' },
      ],
      explain: 'The loop unpacks each pair. Then you add each score to a running total.',
      hints: ['Start a total at 0.', 'Use `for name, score in pairs:` to unpack each pair.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 5.4
Course.lesson('m05-lists-strings', {
  id: '5-4-strings-comprehensions',
  num: '5.4',
  title: 'Strings, split and join, and short lists',
  goal: 'You can split and join text, and build or sort a list in one line.',
  mins: 12,
  steps: [
    { t: 'h', text: 'A string is a row of letters' },
    { t: 'p', text: 'A [[string]] works a lot like a list of letters. Index, slice and `len` all work on it.' },
    { t: 'code', caption: 'Run it. Then try your own word.',
      code: py`
        word = "robot"
        print(word[0])
        print(word[-1])
        print(word[1:3])
        print(len(word))
      `,
      output: 'r\nt\nob\n5',
    },
    { t: 'q', id: 'spark-letter', type: 'predict', level: 1,
      q: 'A list lets you change one spot. Can a string do that? What happens here?',
      code: py`
        word = "cat"
        word[0] = "b"
        print(word)
      `,
      expectError: true,
      options: [
        { text: 'bat', why: 'That is what a list would do. A string cannot change, not even one letter.' },
        { text: 'cat', why: 'Python does not skip the line. It stops there with an error.' },
        'TypeError',
      ],
      answer: 2,
      explain: 'A string cannot change once it is made. Python stops with a `TypeError`.',
      hints: ['Think about the tuple from the last lesson.'],
    },
    { t: 'words', items: [
      { word: 'immutable', means: 'Cannot be changed after it is made. Strings are immutable.', say: 'im-MYOO-tuh-bul' },
      { word: 'list comprehension', means: 'A short way to build a new list from a loop, in one line.', say: 'com-pre-HEN-shun' },
      { word: 'sort key', means: 'A function that tells `sorted` what to compare.' },
    ] },
    { t: 'p', text: 'Strings are [[immutable]], and so are tuples. `upper` cannot change a string. It makes a new one and hands it back.' },
    { t: 'viz', name: 'm05-string-new', caption: 'Watch the tag move. The string in the box never changes.' },
    { t: 'trap', think: '`s.upper()` changes s.',
      real: 'A string never changes. `upper` makes a new string, and you must save it with a name.',
      code: py`
        s = "hi"
        s.upper()       # new string is lost
        print(s)        # hi
        s = s.upper()   # save it
        print(s)        # HI
      `,
    },
    { t: 'h', text: 'How do you cut text into words?' },
    { t: 'p', text: '`split` cuts a string into a list. `join` does the opposite. It glues a list of strings into one string.' },
    { t: 'viz', name: 'm05-split-join', caption: 'split makes a list. join makes a string.' },
    { t: 'code', caption: 'With nothing in the brackets, split cuts at the spaces.',
      code: py`
        line = "I like cats"
        words = line.split()
        print(words)
        print(len(words))
        print("_".join(words))
      `,
      output: "['I', 'like', 'cats']\n3\nI_like_cats",
    },
    { t: 'q', id: 'join-glue', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'print("-".join(["a", "b", "c"]))',
      options: [
        { text: 'a-b-c-', why: 'The glue goes between items only. There is none after the last one.' },
        'a-b-c',
        { text: "['a', 'b', 'c']", why: 'join hands back one string, not a list.' },
      ],
      answer: 1,
      explain: 'The string before the dot is the glue. It goes between each pair of items.',
      hints: ['How many gaps are there between 3 items?'],
    },
    { t: 'tip', title: 'The glue comes first', text: 'Write `"-".join(words)`, not `words.join("-")`. join glues strings only, so a list of numbers will not work.' },
    { t: 'h', text: 'Can you build a list in one line?' },
    { t: 'p', text: 'You often loop over a list to build a new one. A [[list comprehension]] says the same thing in one line.' },
    { t: 'steps', title: 'Read it in 3 parts', items: [
      { label: 'Say what goes in', text: 'Each new item is n times 10.', code: 'n * 10' },
      { label: 'Say where it comes from', text: 'n takes each value from nums.', code: 'for n in nums' },
      { label: 'Wrap it up', text: 'Square brackets make it a list.', code: '[n * 10 for n in nums]' },
    ] },
    { t: 'viz', name: 'm05-comp-build', caption: 'Change times and guess again.' },
    { t: 'code', caption: 'The loop and the one-liner give the same list. An if keeps only some items.',
      code: py`
        nums = [1, 2, 3, 4]
        big = []
        for n in nums:
            big.append(n * 10)
        print(big)
        short = [n * 10 for n in nums]
        print(short)
        keep = [n for n in nums if n > 2]
        print(keep)
      `,
      output: '[10, 20, 30, 40]\n[10, 20, 30, 40]\n[3, 4]',
    },
    { t: 'q', id: 'fill-comp', type: 'fill', level: 2,
      q: 'Fill the gap to build a list of squares.',
      code: 'nums = [1, 2, 3]\nsq = [n * n ____ n in nums]\nprint(sq)',
      blanks: ['for'],
      output: '[1, 4, 9]',
      explain: 'A list comprehension has the same `for` as a loop. It goes after the new item.',
      hints: ['It is the word that starts a loop over a list.'],
    },
    { t: 'h', text: 'Can you sort by your own rule?' },
    { t: 'p', text: '`sorted` gives you a new list in order. The old list stays as it was. A [[sort key]] lets you pick what to compare.' },
    { t: 'code', caption: 'key=len means: sort by the length of each word. Try your own key function.',
      code: py`
        words = ["kiwi", "fig", "banana"]
        print(sorted(words))
        print(sorted(words, key=len))
        print(words)

        def last_letter(word):
            return word[-1]

        print(sorted(words, key=last_letter))
      `,
      output: "['banana', 'fig', 'kiwi']\n['fig', 'kiwi', 'banana']\n['kiwi', 'fig', 'banana']\n['banana', 'fig', 'kiwi']",
    },
    { t: 'p', text: 'Python calls the key function on each item. It sorts by those answers, and the items stay as they are. Items that tie keep their order.' },
    { t: 'q', id: 'sort-len', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'print(sorted(["bee", "ox", "cat"], key=len))',
      options: [
        { text: "['bee', 'cat', 'ox']", why: 'That is A to Z order. With key=len, Python compares lengths.' },
        "['ox', 'bee', 'cat']",
        { text: '[2, 3, 3]', why: 'The key only decides the order. The items stay as words.' },
      ],
      answer: 1,
      explain: 'ox has 2 letters, so it goes first. bee and cat tie, so they keep their order.',
      hints: ['How many letters does each word have?'],
    },
  ],
  recap: [
    'Strings never change. Their tools make new strings.',
    'split makes a list. join makes a string.',
    'You can build lists in one line and sort by a key.',
  ],
  practice: [
    { id: 'upper-lost', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: 's = "hello"\ns.upper()\nprint(s)',
      answer: 'hello',
      explain: '`upper` makes a new string, but no name is on it. s still names "hello".',
      hints: ['Does `upper` change s? Look at what line 2 saves.'],
    },
    { id: 'match-tools', type: 'match', level: 1,
      q: 'Match each tool to its job.',
      pairs: [
        ['`split`', 'Cuts a string into a list'],
        ['`join`', 'Glues a list into a string'],
        ['`sorted`', 'Gives a new list in order'],
        ['`upper`', 'Gives a new string in capitals'],
      ],
      explain: 'Each of these tools makes something new. The thing you started with stays the same.',
      hints: ['Which two tools are opposites?'],
    },
    { id: 'fill-split-join', type: 'fill', level: 2,
      q: 'Fill the gaps so the screen shows `a+b+c`.',
      code: 'parts = "a,b,c".____(",")\nprint("+".____(parts))',
      blanks: ['split', 'join'],
      output: 'a+b+c',
      explain: '`split` cuts at each comma. `join` glues the pieces with a plus sign.',
      hints: ['One tool cuts. The other glues.'],
    },
    { id: 'sorted-new', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'a = [3, 1, 2]\nb = sorted(a)\nprint(a)\nprint(b)',
      options: [
        { text: '[1, 2, 3]\n[1, 2, 3]', why: '`sorted` does not change a. It makes a new list.' },
        '[3, 1, 2]\n[1, 2, 3]',
        { text: '[3, 1, 2]\nNone', why: '`sorted` hands back a list. `append` is the kind of tool that hands back None.' },
      ],
      answer: 1,
      explain: '`sorted` makes a new list in order. a stays as it was.',
      hints: ['Does `sorted` change the list you give it?'],
    },
    { id: 'fix-key', type: 'fix', level: 2,
      q: 'This should sort the names, shortest first. Python stops on the sort line. Fix it.',
      code: 'names = ["Zed", "Al", "Bea"]\nprint(sorted(names, key=len()))',
      answer: 'names = ["Zed", "Al", "Bea"]\nprint(sorted(names, key=len))',
      wantOutput: "['Al', 'Zed', 'Bea']",
      explain: 'Give `sorted` the function itself, with no round brackets. `sorted` calls it for each item.',
      hints: ['Who should call len: you, or sorted?', 'Take away the round brackets after len.'],
    },
    { id: 'evens', type: 'write', level: 2,
      q: 'Write `evens(nums)` using a list comprehension. It gives back only the even numbers.',
      starter: 'def evens(nums):\n    # Your code here.\n    return []\n',
      answer: 'def evens(nums):\n    return [n for n in nums if n % 2 == 0]\n',
      tests: [
        { label: 'evens([1, 2, 3, 4])', call: 'evens([1, 2, 3, 4])', want: '[2, 4]' },
        { label: 'evens([6])', call: 'evens([6])', want: '[6]' },
        { label: 'evens([5, 7])', call: 'evens([5, 7])', want: '[]' },
      ],
      explain: 'The `if` part keeps only the items that pass. `n % 2 == 0` is true for even numbers.',
      hints: ['Start from `[n for n in nums]`.', 'Add `if n % 2 == 0` at the end, inside the brackets.'],
    },
    { id: 'initials', type: 'write', level: 3,
      q: 'Stretch: write `initials(name)`. For "Sam Lee" it gives back "SL". Use split, a list comprehension and join.',
      starter: 'def initials(name):\n    # Your code here.\n    return ""\n',
      answer: 'def initials(name):\n    letters = [w[0] for w in name.split()]\n    return "".join(letters)\n',
      tests: [
        { label: 'initials("Sam Lee")', call: 'initials("Sam Lee")', want: '"SL"' },
        { label: 'initials("Mia Rose Hall")', call: 'initials("Mia Rose Hall")', want: '"MRH"' },
        { label: 'initials("Zed")', call: 'initials("Zed")', want: '"Z"' },
      ],
      explain: 'split gives the words. The comprehension takes the first letter of each. join glues them with no gap.',
      hints: ['`name.split()` gives a list of words.', '`w[0]` is the first letter of a word w.', 'An empty string `""` is glue with no gap.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 5.5
Course.lesson('m05-lists-strings', {
  id: '5-5-grids',
  num: '5.5',
  title: 'Grids: lists inside lists',
  goal: 'You can read any spot in a grid, loop over it, and build one safely.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How do you keep a game board in code?' },
    { t: 'p', text: 'A game board has rows and columns. One flat list cannot show that. But a list can hold anything, and that includes other lists.' },
    { t: 'q', id: 'spark-len', type: 'predict', level: 1,
      q: 'This list holds lists. What will the screen show?',
      code: py`
        board = [[1, 2, 3], [4, 5, 6]]
        print(len(board))
      `,
      options: [
        { text: '6', why: 'You may be counting the numbers. `len` counts only the items of the outer list.' },
        { text: '3', why: 'That is the length of one inner list. The name board means the outer list.' },
        '2',
      ],
      answer: 2,
      explain: 'The outer list holds 2 items, and each item is a list.',
      hints: ['Look at the outer square brackets. What is right inside them?', 'Count the lists, not the numbers.'],
    },
    { t: 'words', items: [
      { word: 'grid', means: 'Values in rows and columns, kept as a list of lists. Also called a matrix.' },
      { word: 'row', means: 'One list inside a grid. It goes across.' },
      { word: 'column', means: 'The items at the same spot in every row. They go down.', say: 'COL-um' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[grid]] is a wall of lockers, with one row above another. First you pick the row. Then you pick the locker in that row. Unlike real lockers, each row can have its own length.' },
    { t: 'big', text: 'A [[grid]] is a list of [[rows|row]]. In `grid[row][col]`, the row always comes first.' },
    { t: 'steps', title: 'Read grid[1][0] in 3 steps', items: [
      { label: 'Start at the grid', text: 'This grid holds 2 rows, and each row holds 3 items.', code: 'grid = [[7, 2, 9],\n        [4, 8, 5]]' },
      { label: 'Pick the row', text: 'The first index picks a row. You get a plain list back.', code: 'grid[1]      # [4, 8, 5]' },
      { label: 'Pick the spot', text: 'The second index picks a spot in that list.', code: 'grid[1][0]   # 4' },
    ] },
    { t: 'viz', name: 'm05-grid-read', caption: 'Make a guess each time it asks. Then type a new row and col, and try a number that is too big.' },
    { t: 'p', text: 'You can change a spot too. `grid[0][2] = 1` finds row 0, then changes spot 2 in that row.' },
    { t: 'code', caption: '`len(grid)` counts the rows. `len(grid[0])` counts the items in row 0. Change the indexes, then guess and run again.',
      code: py`
        grid = [[7, 2, 9],
                [4, 8, 5]]
        print(grid[1])
        print(grid[1][0])
        print(len(grid))
        print(len(grid[0]))
        grid[0][2] = 1
        print(grid)
      `,
      output: '[4, 8, 5]\n4\n2\n3\n[[7, 2, 1], [4, 8, 5]]',
    },
    { t: 'q', id: 'row-comes-first', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        grid = [[1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]]
        print(grid[2][0])
      `,
      options: [
        { text: '3', why: 'You read the column first. The row comes first, so 2 picks the row.' },
        { text: '4', why: 'You may be counting rows from 1. Index 2 is the third row.' },
        '7',
      ],
      answer: 2,
      explain: '`grid[2]` is the row `[7, 8, 9]`. Spot 0 of that row holds 7.',
      hints: ['Which row does `grid[2]` give you? Write it down.', 'Now find spot 0 of that row.'],
    },
    { t: 'h', text: 'How do you visit every spot?' },
    { t: 'p', text: 'You met [[nested]] loops in module 3, and they fit a grid well. The outer loop goes over the rows. The inner loop goes over one row.' },
    { t: 'code', caption: 'Here `row` is a whole list, and `n` is one item in it. Add a third row and run it again.',
      code: py`
        grid = [[7, 2, 9],
                [4, 8, 5]]
        for row in grid:
            for n in row:
                print(n)
      `,
      output: '7\n2\n9\n4\n8\n5',
    },
    { t: 'p', text: 'Sometimes you need to know where you are, as well as the value. Then you loop over index numbers. Name them `r` for the row and `c` for the column.' },
    { t: 'code', caption: '`range(len(grid))` gives the row numbers 0 and 1. `range(len(grid[0]))` gives the column numbers 0, 1 and 2.',
      code: py`
        grid = [[7, 2, 9],
                [4, 8, 5]]
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                print(r, c, grid[r][c])
      `,
      output: '0 0 7\n0 1 2\n0 2 9\n1 0 4\n1 1 8\n1 2 5',
    },
    { t: 'q', id: 'trace-grid', type: 'trace', level: 2,
      q: 'Follow the loops. Fill in r, c and the value for each trip.',
      code: py`
        g = [[3, 1],
             [6, 2]]
        for r in range(2):
            for c in range(2):
                print(g[r][c])
      `,
      head: ['r', 'c', 'value'],
      rows: [['0', '0', '3'], ['0', '1', '1'], ['1', '0', '6'], ['1', '1', '2']],
      given: 1,
      verify: 'g = [[3, 1], [6, 2]]\nfor r in range(2):\n    for c in range(2):\n        print(r, c, g[r][c])',
      explain: 'r stays the same while c goes all the way. Then r moves on, and c starts over.',
      hints: ['Which one changes first, r or c?', 'Look up `g[r]` first. Then find spot c in that row.'],
    },
    { t: 'h', text: 'How do you build a grid of zeros?' },
    { t: 'p', text: '`[0] * 3` makes the list `[0, 0, 0]`. The `*` repeats what is in the list. So `[[0] * 3] * 3` looks like it makes 3 rows.' },
    { t: 'q', id: 'spark-zeros', type: 'predict', level: 2,
      q: 'One line changes one spot. What will the screen show?',
      code: py`
        grid = [[0] * 3] * 3
        grid[0][0] = 5
        print(grid)
      `,
      options: [
        { text: '[[5, 0, 0], [0, 0, 0], [0, 0, 0]]', why: 'You may think `* 3` makes 3 rows. It makes 3 names for one row.' },
        '[[5, 0, 0], [5, 0, 0], [5, 0, 0]]',
        { text: '[[5, 5, 5], [5, 5, 5], [5, 5, 5]]', why: 'Only spot 0 changes. The other 2 spots in the row stay 0.' },
      ],
      answer: 1,
      explain: 'There is only one row here, and all 3 spots name it. So the 5 shows up 3 times.',
      hints: ['How many times does `[0] * 3` run?', 'Think back to `b = a`. Does it make a new list?'],
    },
    { t: 'viz', name: 'm05-grid-share', caption: 'Follow the arrows. Each arrow shows which row a spot means.' },
    { t: 'p', text: 'Think back to `b = a`. It adds a second name, not a second list. The `* 3` does the same, so its 3 spots are [[aliases|alias]] of one row.' },
    { t: 'tip', title: 'Why is [0] * 3 safe?', text: 'All 3 spots share one 0, but you cannot [[mutate]] a number. So `row[0] = 5` moves only spot 0 to a new value. You can mutate a row, so a shared row causes trouble.' },
    { t: 'steps', title: 'Build a grid the safe way', items: [
      { label: 'Make a new row on each trip', text: 'Inside a loop, `[0] * 3` runs again each time. So each row is a new list.', code: 'grid = []\nfor r in range(3):\n    grid.append([0] * 3)' },
      { label: 'Say it in one line', text: 'A [[list comprehension]] does the same job.', code: 'grid = [[0] * 3 for r in range(3)]' },
    ] },
    { t: 'code', caption: 'Remember that `is` asks: same list? Run it. Then make a grid with 2 rows and 4 columns.',
      code: py`
        bad = [[0] * 3] * 3
        print(bad[0] is bad[1])
        good = [[0] * 3 for r in range(3)]
        print(good[0] is good[1])
        good[0][0] = 5
        print(good)
      `,
      output: 'True\nFalse\n[[5, 0, 0], [0, 0, 0], [0, 0, 0]]',
    },
    { t: 'trap',
      think: '`[[0] * 3] * 3` gives me 3 rows I can change one at a time.',
      real: 'It gives you 3 names for 1 row, so a change shows in every row. Make each row inside a loop.',
      code: py`
        bad = [[0] * 3] * 3                 # 1 row
        good = [[0] * 3 for r in range(3)]  # 3 rows
      `,
    },
    { t: 'tip', title: 'Copying a grid', text: '`grid.copy()` makes a new outer list, but the rows inside stay shared. To copy the rows too, use `[row.copy() for row in grid]`.' },
  ],
  recap: [
    'You can read a spot with `grid[row][col]`, row first.',
    'You can visit every spot with a loop inside a loop.',
    'You can build a grid with a new list for each row.',
  ],
  practice: [
    { id: 'which-read', type: 'mcq', level: 1,
      q: 'Which code reads row 2, column 0 of `grid`?',
      options: [
        '`grid[2][0]`',
        { text: '`grid[0][2]`', why: 'This reads row 0, column 2. The row comes first.' },
        { text: '`grid[2, 0]`', why: 'Each index needs its own square brackets. Python stops with a `TypeError` here.' },
      ],
      answer: 0,
      explain: 'The first brackets pick the row. The second brackets pick the spot in that row.',
      hints: ['Which comes first, the row or the column?'],
    },
    { id: 'count-columns', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        g = [[1, 2, 3],
             [4, 5, 6]]
        print(len(g[0]))
      `,
      answer: '3',
      why: '`g[0]` is one row, so `len` counts the items in that row.',
      explain: '`g[0]` is the row `[1, 2, 3]`. It holds 3 items.',
      hints: ['What is `g[0]`?', 'Count the items in that row.'],
    },
    { id: 'nested-output', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        g = [[1, 2],
             [3, 4]]
        for row in g:
            for n in row:
                print(n)
      `,
      options: [
        { text: '1\n3\n2\n4', why: 'This goes down the columns. The outer loop goes over the rows, so row 0 finishes first.' },
        '1\n2\n3\n4',
        { text: '[1, 2]\n[3, 4]', why: 'That would be `print(row)`. Here the inner loop prints one item at a time.' },
      ],
      answer: 1,
      explain: 'The inner loop goes all the way across row 0. Then it goes across row 1.',
      hints: ['What is `row` on the first trip of the outer loop?', 'The inner loop finishes that whole row before anything else.'],
    },
    { id: 'fix-shared-row', type: 'fix', level: 2,
      q: 'Only row 1 should change, but row 0 changes too. Fix the line that builds the grid.',
      code: py`
        grid = [[0] * 2] * 2
        grid[1][0] = 7
        print(grid)
      `,
      answer: py`
        grid = [[0] * 2 for r in range(2)]
        grid[1][0] = 7
        print(grid)
      `,
      wantOutput: '[[0, 0], [7, 0]]',
      explain: 'The loop runs `[0] * 2` again on each trip. So each spot gets its own row.',
      hints: ['How many rows does line 1 really make?', 'Make a new row on each trip of a loop.', 'Try `[[0] * 2 for r in range(2)]`.'],
    },
    { id: 'grid-total', type: 'write', level: 2,
      q: 'Write `grid_total(grid)`. It adds up every number in the grid and gives back the total.',
      starter: py`
        def grid_total(grid):
            # Your code here.
            return None
      `,
      answer: py`
        def grid_total(grid):
            total = 0
            for row in grid:
                for n in row:
                    total = total + n
            return total
      `,
      tests: [
        { label: 'grid_total([[1, 2], [3, 4]])', call: 'grid_total([[1, 2], [3, 4]])', want: '10' },
        { label: 'grid_total([[1, 2, 3]])', call: 'grid_total([[1, 2, 3]])', want: '6' },
        { label: 'grid_total([])', call: 'grid_total([])', want: '0' },
      ],
      explain: 'The outer loop gives each row. The inner loop gives each number in that row.',
      hints: ['Start a total at 0.', 'Use one loop over the rows, and one loop inside it over the numbers.'],
    },
    { id: 'make-grid', type: 'write', level: 2,
      q: 'Write `make_grid(rows, cols)`. It gives back a grid of zeros, and each row must be its own list.',
      starter: py`
        def make_grid(rows, cols):
            # Your code here.
            return []
      `,
      answer: py`
        def make_grid(rows, cols):
            return [[0] * cols for r in range(rows)]
      `,
      tests: [
        { label: 'make_grid(2, 3)', call: 'make_grid(2, 3)', want: '[[0, 0, 0], [0, 0, 0]]' },
        { label: 'make_grid(3, 1)', call: 'make_grid(3, 1)', want: '[[0], [0], [0]]' },
        { label: 'Each row is its own list', check: '(lambda g: g[0] is not g[1])(make_grid(2, 2))' },
      ],
      explain: 'The `[0] * cols` part runs once per row. So each row is a new list.',
      hints: ['Which number goes after `[0] *`, and which goes in `range`?', 'Each row has cols items, and there are rows rows.', 'Use the shape `[[0] * 3 for r in range(3)]`.'],
    },
    { id: 'copy-grid', type: 'write', level: 3,
      q: 'Stretch: write `copy_grid(grid)`. It gives back a new grid with its own rows. A change to the new grid must leave the old one alone.',
      starter: py`
        def copy_grid(grid):
            # Your code here.
            return []
      `,
      answer: py`
        def copy_grid(grid):
            return [row.copy() for row in grid]
      `,
      tests: [
        { label: 'copy_grid([[1, 2], [3]])', call: 'copy_grid([[1, 2], [3]])', want: '[[1, 2], [3]]' },
        { label: 'The outer list is new', check: '(lambda g: copy_grid(g) is not g)([[1, 2]])' },
        { label: 'Each row is new', check: '(lambda g: copy_grid(g)[0] is not g[0])([[1, 2]])' },
      ],
      explain: '`row.copy()` makes a new list for each row. `grid.copy()` alone would share the rows.',
      hints: ['Does `grid.copy()` copy the rows inside?', 'You need a copy of each row.', 'Go over the rows in a list comprehension, and use `row.copy()`.'],
    },
  ],
});
