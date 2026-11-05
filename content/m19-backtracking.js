/* Module 19: Backtracking. Part 3 (Trees, graphs and clever ideas). */
Course.module({
  id: 'm19-backtracking',
  num: 19, part: 3, level: 'I',
  title: 'Backtracking',
  blurb: 'Try a choice, walk back when it stops helping, and try the next one.',
  needs: ['m16-recursion', 'm18-trees'],
});

/* ------------------------------------------------------------------ 19.1 */
Course.lesson('m19-backtracking', {
  id: '19-1-choose-explore-unchoose',
  num: '19.1',
  title: 'Choose, explore, un-choose',
  goal: 'You can list every answer with choose, explore, un-choose, and spot a missing undo.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How do you try every choice?' },
    { t: 'p', text: 'A secret code has 2 spots. Each spot holds A or B. You want a list of every code, with none missed. Try it on paper first.' },
    { t: 'q', id: 'spark-count', type: 'mcq', level: 1,
      q: 'Write the codes down. AA is one of them. How many codes are there?',
      options: [
        { text: '2', why: 'That counts the letters. A code fills 2 spots, so each letter can meet each letter.' },
        { text: '3', why: 'That treats AB and BA as one code. In a code, the order matters, so they are 2 codes.' },
        '4',
      ],
      answer: 2,
      explain: 'They are AA, AB, BA and BB. The first spot has 2 choices, and each of those has 2 more.',
      hints: ['Start with the codes that begin with A.', 'Now write the ones that begin with B.'],
    },
    { t: 'words', items: [
      { word: 'decision tree', means: 'A tree of choices. Each fork is a choice, and each leaf is a finished answer.' },
      { word: 'backtracking', say: 'BACK-track-ing', means: 'Try a choice, follow it to the end, then walk back and try the next one.' },
      { word: 'un-choose', means: 'Undo your last choice, so the next choice starts clean.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of a maze with forks. You pick a way and walk on. At a dead end, you walk back to the last fork and try the next way. A maze differs in 2 ways. You stop at the exit, but [[backtracking]] can go on to find every answer. And code must undo a choice by hand.' },
    { t: 'big', text: 'At every fork, do 3 things: choose, explore, [[un-choose]]. Then the next choice starts clean.' },
    { t: 'viz', name: 'm19-choose-undo', caption: 'Answer each question. Watch the path row when UN-CHOOSE shows up. Then try 3 letters, 1 spot, or no letters.' },
    { t: 'steps', title: 'The 3 moves, and a stop rule', items: [
      { label: 'Stop when it is full', text: 'This is the [[base case]] from lesson 16.1. A full path is a leaf of the [[decision tree]], so it is one answer.', code: 'if spot == 2:\n    print(path)\n    return' },
      { label: 'Choose', text: 'Add one letter to the end of the path.', code: 'path.append(letter)' },
      { label: 'Explore', text: 'Call the function again, for the next spot. It goes on down the tree.', code: 'explore(spot + 1)' },
      { label: 'Un-choose', text: 'Take that letter off again. Now the loop can try its next letter in the same spot.', code: 'path.pop()' },
    ] },
    { t: 'code', caption: 'Run it. Line by line, it is the picture you stepped through. Now change "AB" to "ABC", and guess the number of lines first.',
      output: "['A', 'A']\n['A', 'B']\n['B', 'A']\n['B', 'B']",
      code: py`
        path = []

        def explore(spot):
            if spot == 2:
                print(path)
                return
            for letter in "AB":
                path.append(letter)  # choose
                explore(spot + 1)    # explore
                path.pop()           # un-choose

        explore(0)
      `,
    },
    { t: 'q', id: 'empty-at-end', type: 'predict', level: 2,
      q: 'The search is over. What does the last line print?',
      code: py`
        path = []

        def explore(spot):
            if spot == 2:
                return
            for letter in "AB":
                path.append(letter)
                explore(spot + 1)
                path.pop()

        explore(0)
        print(path)
      `,
      options: [
        { text: "['B', 'B']", why: 'That is the last leaf. After it, 2 pops still run, so those letters come off.' },
        '[]',
        { text: "['A', 'A', 'B', 'B']", why: 'That thinks letters pile up. Each append has a pop, so the list never keeps them.' },
      ],
      answer: 1,
      explain: 'Every choose has a matching un-choose. So path ends as it began, and it is empty.',
      hints: ['Count the appends and the pops. Are they equal?'],
    },
    { t: 'q', id: 'order-coins', type: 'order', level: 2,
      q: 'Put the lines in order. The program lists every result of 2 coin flips, H or T. Here `path` is handed in.',
      lines: [
        'def explore(path, spot):',
        '    if spot == 2:',
        '        print(path)',
        '        return',
        '    for coin in "HT":',
        '        path.append(coin)',
        '        explore(path, spot + 1)',
        '        path.pop()',
        'explore([], 0)',
      ],
      extra: ['        path = []'],
      output: "['H', 'H']\n['H', 'T']\n['T', 'H']\n['T', 'T']",
      explain: 'Inside the loop, the order is choose, explore, un-choose. The extra line would point `path` at a new list and lose the old one.',
      hints: ['The stop rule comes before the loop.', 'What goes right after `path.append(coin)`?'],
    },

    { t: 'h', text: 'What if you forget to un-choose?' },
    { t: 'q', id: 'spark-no-pop', type: 'predict', level: 2,
      q: 'This code has no `path.pop()`. Take a guess. What does the screen show?',
      code: py`
        path = []

        def explore(spot):
            if spot == 2:
                print(path)
                return
            for letter in "AB":
                path.append(letter)
                explore(spot + 1)

        explore(0)
      `,
      options: [
        { text: "['A', 'A']\n['A', 'B']\n['B', 'A']\n['B', 'B']", why: 'That thinks returning from a call also undoes the append. Only `pop` takes an item off.' },
        { text: "['A', 'A']", why: 'That thinks it stops at the first leaf. The loops carry on, and path keeps growing.' },
        "['A', 'A']\n['A', 'A', 'B']\n['A', 'A', 'B', 'B', 'A']\n['A', 'A', 'B', 'B', 'A', 'B']",
      ],
      answer: 2,
      explain: 'It still prints 4 lines, one per leaf. But nothing leaves path, so old letters stay in every line after the first.',
      hints: ['After the first line, what is still in path?', 'The next append adds to that.'],
    },
    { t: 'viz', name: 'm19-no-undo', caption: 'Same code, same tree, no pop. Red boxes are letters that should have left. Compare each printed line with the leaf.' },
    { t: 'trap',
      think: 'when a call ends, Python also undoes what that call did to `path`.',
      real: 'Each [[frame]] has its own `spot`, so `spot` comes back by itself (lesson 16.2). But every call shares one `path` list, as in lesson 5.2. Only `pop` takes an item off.',
      code: 'path.append(letter)\nexplore(spot + 1)\npath.pop()   # write this line, or the letter stays',
    },
    { t: 'q', id: 'fill-undo', type: 'fill', level: 2,
      q: 'Fill the gaps. This should print X and then Y, each as a list.',
      code: py`
        path = []

        def explore(spot):
            if spot == 1:
                print(path)
                return
            for letter in "XY":
                path.____(letter)
                explore(spot + 1)
                path.____()

        explore(0)
      `,
      blanks: ['append', 'pop'],
      output: "['X']\n['Y']",
      explain: '`append` makes the choice, and `pop` undoes it. Then Y gets the empty spot.',
      hints: ['What adds to the end of a list?', 'What takes the last item off?'],
    },

    { t: 'h', text: 'How much work is it?' },
    { t: 'q', id: 'count-nine', type: 'mcq', level: 2,
      q: 'Count by hand. Say you have 3 letters and 2 spots. How many leaves does the tree have?',
      options: [
        { text: '5', why: 'That adds 3 and 2. Each first letter has its own 3 next letters, so you times them.' },
        { text: '6', why: 'That does 3 x 2. It would need 3 forks with 2 ways each, but each fork here has 3 ways.' },
        '9',
      ],
      answer: 2,
      explain: 'The first spot has 3 choices. Each of them has 3 more, and 3 x 3 is 9. Set the picture to ABC to check.',
      hints: ['Draw the top of the tree. How many forks are on the next row?'],
    },
    { t: 'code', caption: 'This counts leaves, with 2 letters. Each new spot doubles them. Run it, then try "ABC".', output: '1 2\n2 4\n3 8\n4 16\n5 32',
      code: py`
        path = []
        count = {"leaves": 0}

        def explore(spot, size):
            if spot == size:
                count["leaves"] = count["leaves"] + 1
                return
            for letter in "AB":
                path.append(letter)
                explore(spot + 1, size)
                path.pop()

        for size in [1, 2, 3, 4, 5]:
            count["leaves"] = 0
            explore(0, size)
            print(size, count["leaves"])
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`path.append(x)`', cost: 'O(1) amortized', why: 'Quick nearly every time, as in lesson 8.4.' },
      { op: '`path.pop()`', cost: 'O(1)', why: 'So one un-choose is cheap, however long the list is.' },
      { op: 'How many codes, with k letters and n spots', cost: 'O(k^n)', why: 'You counted 4 leaves for 2 spots, and 8 for 3. Each new spot times the leaves by k.' },
      { op: 'Printing every code', cost: 'O(n x k^n)', why: 'Each code has n letters to write out.' },
    ] },
    { t: 'code', caption: 'Try the odd cases. No spots gives one empty answer. No letters gives no answers. One letter gives one long path.',
      output: "no spots\n[]\nno letters\none letter\n['A', 'A', 'A']",
      code: py`
        path = []

        def explore(letters, spot, size):
            if spot == size:
                print(path)
                return
            for letter in letters:
                path.append(letter)
                explore(letters, spot + 1, size)
                path.pop()

        print("no spots")
        explore("AB", 0, 0)
        print("no letters")
        explore("", 0, 2)
        print("one letter")
        explore("A", 0, 3)
      `,
    },
    { t: 'tip', title: 'How to recognize it', text: 'Look for these words: **all**, **every**, **list the ways**, **all arrangements**. If a problem wants each answer written out, think of a tree of choices. Then use choose, explore, un-choose.' },
    { t: 'tip', title: 'Is this the same as brute force?', text: 'So far, it visits every leaf, so it costs the same as [[brute force]]. Lesson 19.4 shows the big difference: backtracking can walk away from a bad path early.' },
    { t: 'tip', title: 'A function inside a function', text: 'The practice writes `def explore` inside another `def`. The inner function can read the outer names, like `letters`. It can also change an outer list, like `results`. This keeps each search tidy.' },
  ],
  recap: [
    'You can draw a decision tree for a small problem.',
    'You can write choose, explore, un-choose in the right order.',
    'You can say why a missing pop gives wrong lists.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[decision tree]]', 'A tree of choices, with answers at the leaves'],
        ['[[backtracking]]', 'Try a choice, then walk back and try the next'],
        ['[[un-choose]]', 'Undo the last choice'],
      ],
      explain: 'The tree is the map. Backtracking is the walk. Un-choose is the step that lets you walk back.',
      hints: ['Which one is a picture, and which one is a single step?'],
    },
    { id: 'loop-order', type: 'mcq', level: 1,
      q: 'What order do the 3 lines go in, inside the loop?',
      options: [
        'append, explore, pop',
        { text: 'append, pop, explore', why: 'That takes the choice off before exploring. So the deeper calls never see it.' },
        { text: 'pop, explore, append', why: 'That removes an older choice first. It also leaves the new letter on the path at the end.' },
      ],
      answer: 0,
      explain: 'Make the choice, go as deep as it leads, then undo it. In that order, the next letter starts clean.',
      hints: ['Which line must the deeper calls be able to see?'],
    },
    { id: 'predict-two-menus', type: 'predict', level: 2,
      q: 'Here each spot has its own letters. What does the screen show?',
      code: py`
        menus = ["AB", "C"]
        path = []

        def explore(spot):
            if spot == 2:
                print("".join(path))
                return
            for letter in menus[spot]:
                path.append(letter)
                explore(spot + 1)
                path.pop()

        explore(0)
      `,
      options: [
        'AC\nBC',
        { text: 'AB\nC', why: 'That prints the menus. Each answer takes one letter from each menu.' },
        { text: 'AC\nBC\nCA\nCB', why: 'That lets the spots swap. Spot 0 only reads "AB", and spot 1 only reads "C".' },
      ],
      answer: 0,
      explain: 'Spot 0 can be A or B. Spot 1 can only be C. So there are 2 x 1 answers.',
      hints: ['Which letters can spot 0 hold?', 'Which letters can spot 1 hold?'],
    },
    { id: 'trace-size', type: 'trace', level: 2,
      q: 'Fill in one row for each move. Write the size of `path` right after that move.',
      code: py`
        menus = ["A", "XY"]
        path = []

        def explore(spot):
            if spot == 2:
                return
            for letter in menus[spot]:
                path.append(letter)  # choose
                explore(spot + 1)
                path.pop()           # undo

        explore(0)
      `,
      head: ['move', 'letter', 'size'],
      rows: [
        ['choose', 'A', '1'],
        ['choose', 'X', '2'],
        ['undo', 'X', '1'],
        ['choose', 'Y', '2'],
        ['undo', 'Y', '1'],
        ['undo', 'A', '0'],
      ],
      given: 2,
      verify: py`
        menus = ["A", "XY"]
        path = []
        def explore(spot):
            if spot == 2:
                return
            for letter in menus[spot]:
                path.append(letter)
                print("choose", letter, len(path))
                explore(spot + 1)
                path.pop()
                print("undo", letter, len(path))
        explore(0)
      `,
      explain: 'The size goes up with each choose and down with each undo. It ends at 0, where it began.',
      hints: ['After X comes off, which letter does the same loop try next?', 'A comes off last.'],
    },
    { id: 'fix-no-pop', type: 'fix', level: 2,
      q: 'This should print `XX`, `XY`, `YX` and `YY`. One line is missing, so the strings keep growing. Add it.',
      code: 'path = []\n\ndef explore(spot):\n    if spot == 2:\n        print("".join(path))\n        return\n    for letter in "XY":\n        path.append(letter)\n        explore(spot + 1)\n\nexplore(0)\n',
      answer: 'path = []\n\ndef explore(spot):\n    if spot == 2:\n        print("".join(path))\n        return\n    for letter in "XY":\n        path.append(letter)\n        explore(spot + 1)\n        path.pop()\n\nexplore(0)\n',
      wantOutput: 'XX\nXY\nYX\nYY',
      explain: 'Without `path.pop()`, each letter stays on the path. With it, every choice gets undone.',
      hints: ['Which of the 3 moves is missing?', 'Add `path.pop()` inside the loop, after the call.'],
    },
    { id: 'write-codes', type: 'write', level: 2,
      q: 'Write `codes(letters, size)`. It returns a list of every code, as strings. So `codes("AB", 2)` gives `["AA", "AB", "BA", "BB"]`.',
      starter: 'def codes(letters, size):\n    results = []\n    path = []\n\n    def explore(spot):\n        # Your code here.\n        pass\n\n    explore(0)\n    return results\n',
      answer: 'def codes(letters, size):\n    results = []\n    path = []\n\n    def explore(spot):\n        if spot == size:\n            results.append("".join(path))\n            return\n        for letter in letters:\n            path.append(letter)\n            explore(spot + 1)\n            path.pop()\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'codes("AB", 2)', call: 'codes("AB", 2)', want: '["AA", "AB", "BA", "BB"]' },
        { label: 'codes("XYZ", 1)', call: 'codes("XYZ", 1)', want: '["X", "Y", "Z"]' },
        { label: 'No spots gives one empty code', call: 'codes("AB", 0)', want: '[""]' },
        { label: 'No letters gives no codes', call: 'codes("", 2)', want: '[]' },
      ],
      explain: 'The stop rule saves one finished code. The loop does choose, explore, un-choose.',
      hints: ['When `spot == size`, join `path` into a string and save it.', 'The loop is the same shape as in the lesson.', '`"".join(path)` turns the list into a string.'],
    },
    { id: 'write-keypad', type: 'write', level: 3,
      q: 'Stretch: on an old phone, each number key holds some letters. Write `spell(keys)`. It returns every string the pressed keys can spell. So `spell("23")` gives `["AC", "AD", "BC", "BD"]`.',
      starter: 'PAD = {"2": "AB", "3": "CD", "4": "EFG"}\n\ndef spell(keys):\n    results = []\n    path = []\n    # Your code here.\n    return results\n',
      answer: 'PAD = {"2": "AB", "3": "CD", "4": "EFG"}\n\ndef spell(keys):\n    results = []\n    path = []\n\n    def explore(spot):\n        if spot == len(keys):\n            results.append("".join(path))\n            return\n        for letter in PAD[keys[spot]]:\n            path.append(letter)\n            explore(spot + 1)\n            path.pop()\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'spell("23")', call: 'spell("23")', want: '["AC", "AD", "BC", "BD"]' },
        { label: 'spell("4")', call: 'spell("4")', want: '["E", "F", "G"]' },
        { label: 'spell("42") has 6 answers', call: 'len(spell("42"))', want: '6' },
      ],
      explain: 'Each spot reads its own letters from `PAD`. Everything else is choose, explore, un-choose.',
      hints: ['One spot for each key pressed.', 'The choices at this spot are `PAD[keys[spot]]`.', 'Stop when `spot == len(keys)`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 19.2 */
Course.lesson('m19-backtracking', {
  id: '19-2-subsets-copy',
  num: '19.2',
  title: 'Every group, saved with a copy',
  goal: 'You can list all subsets, and save each answer with a copy.',
  mins: 13,
  steps: [
    { t: 'h', text: 'How many groups can you pick?' },
    { t: 'p', text: 'You have 2 items, A and B. You may keep any of them, or none. Each pick you could make is one group.' },
    { t: 'q', id: 'spark-groups', type: 'mcq', level: 1,
      q: 'Count by hand. How many groups can you make from A and B? Picking nothing counts.',
      options: [
        { text: '2', why: 'That counts the items. A group can also hold both of them, or neither.' },
        { text: '3', why: 'That leaves out the empty group. Picking nothing is one of the choices.' },
        '4',
      ],
      answer: 2,
      explain: 'The groups are [], [A], [B] and [A, B]. A has 2 choices, and so does B. And 2 x 2 is 4.',
      hints: ['Does A go in, or not? Does B go in, or not?'],
    },
    { t: 'words', items: [
      { word: 'subset', say: 'SUB-set', means: 'Any group you can pick from some items. Empty is fine, and so is all of them.' },
    ] },
    { t: 'p', text: 'Back in the maze, each item is a fork with 2 ways: take it, or skip it. After the last item, you reach a leaf. That leaf is one [[subset]].' },
    { t: 'viz', name: 'm19-subsets', caption: 'Left means take, and right means skip. Line 6 saves a copy, and soon you will see why. Then try ABC, 1 item, none, or AA.' },
    { t: 'code', caption: 'Run it. Skip comes after the un-choose, so that side has no A in it. Then add "C", and guess how many answers.',
      output: "[['A', 'B'], ['A'], ['B'], []]",
      code: py`
        items = ["A", "B"]
        results = []
        path = []

        def explore(i):
            if i == len(items):
                results.append(path.copy())
                return
            path.append(items[i])  # take
            explore(i + 1)
            path.pop()             # un-choose
            explore(i + 1)         # skip

        explore(0)
        print(results)
      `,
    },
    { t: 'q', id: 'fill-skip', type: 'fill', level: 2,
      q: 'Fill the gaps, so the program counts the subsets of 3 items. It should print 8.',
      code: py`
        items = [1, 2, 3]
        results = []
        path = []

        def explore(i):
            if i == len(items):
                results.append(path.copy())
                return
            path.append(items[i])
            explore(____)
            path.____()
            explore(i + 1)

        explore(0)
        print(len(results))
      `,
      blanks: [['i + 1', 'i+1'], 'pop'],
      output: '8',
      explain: 'Both calls move on to the next item. The pop goes between them, so the skip side starts clean.',
      hints: ['Which item comes next after item `i`?', 'What undoes `append`?'],
    },

    { t: 'h', text: 'Why save a copy?' },
    { t: 'p', text: 'Saving looks like one small job. But it hides a bug that hits nearly everyone here. Make a guess first.' },
    { t: 'q', id: 'spark-live', type: 'predict', level: 2,
      q: 'This saves `path`, with no `.copy()`. What does the last line print?',
      code: py`
        items = ["A", "B"]
        results = []
        path = []

        def explore(i):
            if i == len(items):
                results.append(path)
                return
            path.append(items[i])
            explore(i + 1)
            path.pop()
            explore(i + 1)

        explore(0)
        print(results)
      `,
      options: [
        { text: "[['A', 'B'], ['A'], ['B'], []]", why: 'That thinks `append` keeps what the list holds right now. It keeps the list itself, which goes on changing.' },
        '[[], [], [], []]',
        { text: '[]', why: 'That thinks nothing was saved. `results` does get 4 items, but all 4 are the same list.' },
      ],
      answer: 1,
      explain: 'All 4 items in `results` are the one list called `path`. The search ends with `path` empty, so they all look empty.',
      hints: ['How many lists does this code make for `path`?', 'What does `path` hold when the search ends?'],
    },
    { t: 'viz', name: 'm19-live-list', caption: 'Each arrow means "this is really path". Watch all the arrows when path changes. Answer before each step.' },
    { t: 'trap',
      think: '`results.append(path)` saves what `path` holds right now.',
      real: 'It saves `path` itself. So `results` gets more names for one list. It is like the dog with 2 name tags in lesson 5.2. Each later pop changes them all.',
      code: 'results.append(path)         # an alias: it keeps changing\nresults.append(path.copy())  # a true copy: it stays',
    },
    { t: 'viz', name: 'm19-true-copy', caption: 'One word changes everything. Each copy is a new list, so it has no arrow to path.' },
    { t: 'code', caption: 'Run it. Remember that `is` asks: same list? The [[alias]] changes with `path`, and the [[copy]] does not.',
      output: "[[]]\n[['A']]\nTrue\nFalse",
      code: py`
        path = ["A"]
        live = []
        safe = []
        live.append(path)
        safe.append(path.copy())
        path.pop()
        print(live)
        print(safe)
        print(live[0] is path)
        print(safe[0] is path)
      `,
    },
    { t: 'q', id: 'fix-live', type: 'fix', level: 2,
      q: '`groups` should give back every subset, but the lists come back empty. Fix one line.',
      code: 'def groups(items):\n    results = []\n    path = []\n\n    def explore(i):\n        if i == len(items):\n            results.append(path)\n            return\n        path.append(items[i])\n        explore(i + 1)\n        path.pop()\n        explore(i + 1)\n\n    explore(0)\n    return results\n',
      answer: 'def groups(items):\n    results = []\n    path = []\n\n    def explore(i):\n        if i == len(items):\n            results.append(path.copy())\n            return\n        path.append(items[i])\n        explore(i + 1)\n        path.pop()\n        explore(i + 1)\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'groups([7, 8])', call: 'groups([7, 8])', want: '[[7, 8], [7], [8], []]' },
        { label: 'groups([]) has one empty group', call: 'groups([])', want: '[[]]' },
      ],
      explain: '`path.copy()` makes a new list that stays as it is. A slice, `path[:]`, works too.',
      hints: ['Which line saves an answer?', 'Save a new list, not `path` itself.'],
    },

    { t: 'h', text: 'How much work is it?' },
    { t: 'code', caption: 'This counts the leaves of the tree. You counted 4 for 2 items. Each new item doubles them.',
      output: '1 2\n2 4\n3 8\n4 16\n5 32\n6 64',
      code: py`
        count = {"leaves": 0}

        def explore(i, n):
            if i == n:
                count["leaves"] = count["leaves"] + 1
                return
            explore(i + 1, n)  # take
            explore(i + 1, n)  # skip

        for n in [1, 2, 3, 4, 5, 6]:
            count["leaves"] = 0
            explore(0, n)
            print(n, count["leaves"])
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'How many subsets n items have', cost: 'O(2^n)', why: 'You counted 4 for 2 items, and 8 for 3. Each item doubles the leaves.' },
      { op: 'One `path.copy()`', cost: 'O(n)', why: 'A copy takes one step per item in `path`. A pop is only O(1).' },
      { op: 'Saving every subset', cost: 'O(n x 2^n)', why: 'Each of the 2^n leaves makes a copy of up to n items.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **all groups**, **all subsets**, or **pick any of**. Then use take or skip. Also test the odd cases. An empty list has 1 subset, which is empty. Repeated items give repeated answers, and lesson 19.4 fixes that.' },
  ],
  recap: [
    'You can list all subsets with take or skip.',
    'You can say why `results.append(path)` gives empty lists.',
    'You can save an answer with a copy.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each idea to what it means.',
      pairs: [
        ['[[subset]]', 'Any group picked from the items'],
        ['`results.append(path)`', 'Saves another name for one list'],
        ['`results.append(path.copy())`', 'Saves a new list that stays the same'],
      ],
      explain: 'A subset picks some items. Only a copy keeps an answer safe from later changes.',
      hints: ['Which line makes a new list?'],
    },
    { id: 'pick-subset', type: 'mcq', level: 1,
      q: 'A problem says: "List every way to pick toppings for a pizza. Any number is fine." Which fork fits?',
      options: [
        'Take this topping, or skip it',
        { text: 'Which topping goes on first?', why: 'That makes order count. Ham then egg is the same pizza as egg then ham.' },
        { text: 'Is the list sorted?', why: 'That is a question for binary search, which finds one thing. This wants every group.' },
      ],
      answer: 0,
      explain: '"Any number" and "pick" point to subsets. Each topping is a fork with 2 ways.',
      hints: ['Does the order of the toppings matter?'],
    },
    { id: 'predict-copy-len', type: 'predict', level: 2,
      q: 'What does this print?',
      code: py`
        path = [1, 2]
        saved = []
        saved.append(path)
        saved.append(path.copy())
        path.append(3)
        print(saved)
      `,
      options: [
        '[[1, 2, 3], [1, 2]]',
        { text: '[[1, 2], [1, 2]]', why: 'That treats the first save as a copy. It is `path` itself, so it sees the new 3.' },
        { text: '[[1, 2, 3], [1, 2, 3]]', why: 'That treats the second save as an alias. `path.copy()` made a new list before the 3 arrived.' },
      ],
      answer: 0,
      explain: 'The first item is `path`, so it changes. The second is a copy, made before the change.',
      hints: ['Which of the two saved items is the same list as `path`?'],
    },
    { id: 'fix-pop-place', type: 'fix', level: 2,
      q: '`groups([1, 2])` should have 4 answers, with no repeats. The `pop` is in the wrong place. Fix it.',
      code: 'def groups(items):\n    results = []\n    path = []\n\n    def explore(i):\n        if i == len(items):\n            results.append(path.copy())\n            return\n        path.append(items[i])\n        explore(i + 1)\n        explore(i + 1)\n        path.pop()\n\n    explore(0)\n    return results\n',
      answer: 'def groups(items):\n    results = []\n    path = []\n\n    def explore(i):\n        if i == len(items):\n            results.append(path.copy())\n            return\n        path.append(items[i])\n        explore(i + 1)\n        path.pop()\n        explore(i + 1)\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'groups([1, 2])', call: 'groups([1, 2])', want: '[[1, 2], [1], [2], []]' },
        { label: 'groups([5])', call: 'groups([5])', want: '[[5], []]' },
      ],
      explain: 'The second call is the skip. It must run after the pop, or the item is still in `path`.',
      hints: ['Which call is the skip?', 'Is the item still in `path` during the skip?'],
    },
    { id: 'write-subsets', type: 'write', level: 2,
      q: 'Write `subsets(items)`. It returns every subset, with take before skip. So `subsets(["x"])` gives `[["x"], []]`.',
      starter: 'def subsets(items):\n    results = []\n    path = []\n    # Your code here.\n    return results\n',
      answer: 'def subsets(items):\n    results = []\n    path = []\n\n    def explore(i):\n        if i == len(items):\n            results.append(path.copy())\n            return\n        path.append(items[i])\n        explore(i + 1)\n        path.pop()\n        explore(i + 1)\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'subsets(["x"])', call: 'subsets(["x"])', want: '[["x"], []]' },
        { label: 'subsets([4, 5])', call: 'subsets([4, 5])', want: '[[4, 5], [4], [5], []]' },
        { label: 'subsets([]) has one answer', call: 'subsets([])', want: '[[]]' },
        { label: '3 items give 8 answers', call: 'len(subsets([1, 2, 3]))', want: '8' },
      ],
      explain: 'Each item gets one fork. Take it and explore, pop it, then explore again without it.',
      hints: ['Write an inner function `explore(i)`.', 'Stop when `i == len(items)`, and save a copy.', 'Then: append, explore, pop, explore.'],
    },
    { id: 'write-size-k', type: 'write', level: 3,
      q: 'Stretch: write `groups_of(items, k)`. It returns only the subsets with exactly `k` items, with take before skip.',
      starter: 'def groups_of(items, k):\n    results = []\n    path = []\n    # Your code here.\n    return results\n',
      answer: 'def groups_of(items, k):\n    results = []\n    path = []\n\n    def explore(i):\n        if i == len(items):\n            if len(path) == k:\n                results.append(path.copy())\n            return\n        path.append(items[i])\n        explore(i + 1)\n        path.pop()\n        explore(i + 1)\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'groups_of([1, 2, 3], 2)', call: 'groups_of([1, 2, 3], 2)', want: '[[1, 2], [1, 3], [2, 3]]' },
        { label: 'k of 0 gives one empty group', call: 'groups_of([1, 2], 0)', want: '[[]]' },
        { label: 'k too big gives no groups', call: 'groups_of([1], 2)', want: '[]' },
      ],
      explain: 'The search is the same. A leaf now saves only if its path has the right size.',
      hints: ['Keep the take and skip code as it is.', 'Check the size at the leaf.', 'Inside the stop rule, add `if len(path) == k:`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 19.3 */
Course.lesson('m19-backtracking', {
  id: '19-3-permutations',
  num: '19.3',
  title: 'Every order',
  goal: 'You can list every order of some items, and say when `x in path` breaks.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How do you list every order?' },
    { t: 'words', items: [
      { word: 'permutation', say: 'per-myoo-TAY-shun', means: 'All the items in one order. AB and BA are 2 permutations.' },
    ] },
    { t: 'p', text: 'A [[permutation]] uses every item once, and the order matters. It is the same maze, with a new fork. Each fork now asks: which free item comes next?' },
    { t: 'q', id: 'count-orders', type: 'mcq', level: 2,
      q: 'Count by hand. How many orders do A, B and C have? ABC is one.',
      options: [
        { text: '3', why: 'That counts first letters only. Each first letter has more than one order after it.' },
        '6',
        { text: '8', why: 'That is the number of subsets, from take or skip. Here every item must be used.' },
      ],
      answer: 1,
      explain: 'The first spot has 3 choices, the next has 2, and the last has 1. And 3 x 2 x 1 is 6.',
      hints: ['How many items can go first?', 'One is used now. How many can go second?'],
    },
    { t: 'viz', name: 'm19-permutations', caption: 'Each letter slides down when chosen. The un-choose slides it back, so it is free again. Then try AB, or AAB.' },
    { t: 'code', caption: 'Run it. Then give `items` a fourth letter, and guess how many lines print.',
      output: "['A', 'B', 'C']\n['A', 'C', 'B']\n['B', 'A', 'C']\n['B', 'C', 'A']\n['C', 'A', 'B']\n['C', 'B', 'A']",
      code: py`
        items = ["A", "B", "C"]
        results = []
        path = []

        def explore():
            if len(path) == len(items):
                results.append(path.copy())
                return
            for x in items:
                if x in path:
                    continue
                path.append(x)  # choose
                explore()
                path.pop()      # un-choose

        explore()
        for answer in results:
            print(answer)
      `,
    },
    { t: 'q', id: 'order-orders', type: 'order', level: 2,
      q: 'Put the lines in order. The program prints every order of 1 and 2.',
      lines: [
        'def orders(items, path):',
        '    if len(path) == len(items):',
        '        print(path)',
        '    for x in items:',
        '        if x not in path:',
        '            path.append(x)',
        '            orders(items, path)',
        '            path.pop()',
        'orders([1, 2], [])',
      ],
      extra: ['            path = []'],
      output: '[1, 2]\n[2, 1]',
      explain: 'A full path prints. Then no item is free, so the loop does nothing and the call ends.',
      hints: ['Check for a full path before the loop.', 'Choose, explore, un-choose go inside the `if`.'],
    },
    { t: 'table', caption: 'Which one is it?', head: ['', 'Subsets', 'Permutations'], rows: [
      ['What the fork asks', 'Take it or skip it?', 'Which free item is next?'],
      ['Does order matter?', 'No', 'Yes'],
      ['A leaf is reached when', 'Every item was decided', 'Every item is used'],
      ['Answers for 3 items', '8', '6'],
    ] },
    { t: 'code', caption: 'This counts the leaves. Each fork has one fewer way than the last. By 6 items, there are 720 orders, but only 64 subsets.',
      output: '1 1\n2 2\n3 6\n4 24\n5 120\n6 720',
      code: py`
        count = {"leaves": 0}

        def explore(used, n):
            if used == n:
                count["leaves"] = count["leaves"] + 1
                return
            for way in range(n - used):
                explore(used + 1, n)

        for n in [1, 2, 3, 4, 5, 6]:
            count["leaves"] = 0
            explore(0, n)
            print(n, count["leaves"])
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'How many orders n items have', cost: 'O(n!)', why: 'n! means n x (n - 1) x ... x 1. You counted 3 x 2 x 1 = 6 for 3 items.' },
      { op: 'One `x in path` check', cost: 'O(n)', why: 'It may look at every item in `path`.' },
      { op: 'The whole search, as written', cost: 'At most O(n^2 x n!)', why: 'Each fork loops over n items, and each check takes up to n steps.' },
    ] },
    { t: 'q', id: 'predict-repeat', type: 'predict', level: 2,
      q: 'Now `items` has a repeat. How many answers does the search save?',
      code: py`
        items = ["A", "A", "B"]
        results = []
        path = []

        def explore():
            if len(path) == len(items):
                results.append(path.copy())
                return
            for x in items:
                if x in path:
                    continue
                path.append(x)
                explore()
                path.pop()

        explore()
        print(len(results))
      `,
      options: [
        { text: '6', why: 'That would be right if each A counted as its own item. But `x in path` compares values, and both are A.' },
        { text: '3', why: 'That counts AAB, ABA and BAA. They need 2 As in `path`, and the check blocks the second one.' },
        '0',
      ],
      answer: 2,
      explain: 'Once one A is in `path`, the other A looks used. So no path ever reaches 3 items.',
      hints: ['Can `path` ever hold 2 As?'],
    },
    { t: 'trap',
      think: 'the `x in path` check works for any items.',
      real: 'It only works if all items differ. For repeats, track used spots in a list of True and False. The Stretch question at the end has you build that.',
    },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **all orders**, **arrangements**, **line up** or **rearrange**. Then ask which item is next. Also test the odd cases. An empty list has 1 order, which is empty. One item has 1 order.' },
  ],
  recap: [
    'You can list all permutations with choose, explore, un-choose.',
    'You can tell subsets and permutations apart from the words.',
    'You can say why a repeat breaks the `x in path` check.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each question to what it fits.',
      pairs: [
        ['Take it or skip it?', 'A fork for subsets'],
        ['Which free item is next?', 'A fork for permutations'],
        ['Is this item in `path`?', 'The check for used items'],
      ],
      explain: 'Both searches use the same 3 moves. Only the question at each fork changes.',
      hints: ['Which one must use every item?'],
    },
    { id: 'pick-pattern', type: 'mcq', level: 1,
      q: 'A problem says: "List every way to line up 4 friends for a photo." Which one is it?',
      options: [
        'Permutations',
        { text: 'Subsets', why: 'Subsets leave some items out, and order does not count. Here all 4 are in the photo, and order counts.' },
        { text: 'Binary search', why: 'Binary search finds one thing in a sorted list. This wants every line-up written out.' },
      ],
      answer: 0,
      explain: '"Line up" means order counts. "4 friends" means everyone is used. That is a permutation.',
      hints: ['Does anyone get left out of the photo?', 'Does the order matter?'],
    },
    { id: 'predict-count', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        items = ["X", "Y", "Z"]
        results = []
        path = []

        def explore():
            if len(path) == len(items):
                results.append(path.copy())
                return
            for x in items:
                if x not in path:
                    path.append(x)
                    explore()
                    path.pop()

        explore()
        print(len(results))
      `,
      answer: '6',
      why: 'The first spot has 3 choices, the next has 2, and the last has 1.',
      explain: '3 x 2 x 1 is 6, so `results` holds 6 lists.',
      hints: ['How many items can go first?', 'One is used now. How many can go second?'],
    },
    { id: 'fix-no-check', type: 'fix', level: 2,
      q: '`orders([1, 2])` should give 2 answers, but an item gets picked twice. A check is missing. Add it.',
      code: 'def orders(items):\n    results = []\n    path = []\n\n    def explore():\n        if len(path) == len(items):\n            results.append(path.copy())\n            return\n        for x in items:\n            path.append(x)\n            explore()\n            path.pop()\n\n    explore()\n    return results\n',
      answer: 'def orders(items):\n    results = []\n    path = []\n\n    def explore():\n        if len(path) == len(items):\n            results.append(path.copy())\n            return\n        for x in items:\n            if x in path:\n                continue\n            path.append(x)\n            explore()\n            path.pop()\n\n    explore()\n    return results\n',
      tests: [
        { label: 'orders([1, 2])', call: 'orders([1, 2])', want: '[[1, 2], [2, 1]]' },
        { label: 'orders([3])', call: 'orders([3])', want: '[[3]]' },
      ],
      explain: 'Without the check, the search makes codes like the ones in lesson 19.1. The check keeps each item to one use per path.',
      hints: ['What stops an item from being picked twice?', 'Add `if x in path: continue` at the top of the loop.'],
    },
    { id: 'write-orders', type: 'write', level: 2,
      q: 'Write `orders(items)`. It returns every order of the items, which all differ. So `orders([1, 2])` gives `[[1, 2], [2, 1]]`.',
      starter: 'def orders(items):\n    results = []\n    path = []\n    # Your code here.\n    return results\n',
      answer: 'def orders(items):\n    results = []\n    path = []\n\n    def explore():\n        if len(path) == len(items):\n            results.append(path.copy())\n            return\n        for x in items:\n            if x not in path:\n                path.append(x)\n                explore()\n                path.pop()\n\n    explore()\n    return results\n',
      tests: [
        { label: 'orders([1, 2])', call: 'orders([1, 2])', want: '[[1, 2], [2, 1]]' },
        { label: 'orders(["a"])', call: 'orders(["a"])', want: '[["a"]]' },
        { label: 'orders([]) has one empty order', call: 'orders([])', want: '[[]]' },
        { label: '4 items give 24 orders', call: 'len(orders([1, 2, 3, 4]))', want: '24' },
      ],
      explain: 'The loop tries each free item. A full path is one finished order, so save a copy of it.',
      hints: ['Stop when `len(path) == len(items)`.', 'Skip any item already in `path`.', 'Then: append, explore, pop.'],
    },
    { id: 'write-used', type: 'write', level: 3,
      q: 'Stretch: `x in path` fails when items repeat. Write `orders2(items)`, which tracks used spots in a list of True and False. So `orders2(["A", "A"])` gives `[["A", "A"], ["A", "A"]]`.',
      starter: 'def orders2(items):\n    results = []\n    path = []\n    used = [False] * len(items)\n    # Your code here.\n    return results\n',
      answer: 'def orders2(items):\n    results = []\n    path = []\n    used = [False] * len(items)\n\n    def explore():\n        if len(path) == len(items):\n            results.append(path.copy())\n            return\n        for i in range(len(items)):\n            if not used[i]:\n                used[i] = True\n                path.append(items[i])\n                explore()\n                path.pop()\n                used[i] = False\n\n    explore()\n    return results\n',
      tests: [
        { label: 'orders2(["A", "A"])', call: 'orders2(["A", "A"])', want: '[["A", "A"], ["A", "A"]]' },
        { label: 'orders2([1, 2])', call: 'orders2([1, 2])', want: '[[1, 2], [2, 1]]' },
        { label: 'Three items, with a repeat, give 6 answers', call: 'len(orders2(["A", "A", "B"]))', want: '6' },
      ],
      explain: 'A choice now changes 2 things, `path` and `used`. So the un-choose must undo both.',
      hints: ['Loop over spots with `range(len(items))`.', 'Choosing sets `used[i] = True` and appends the item.', 'Un-choosing pops, and sets `used[i] = False`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 19.4 */
Course.lesson('m19-backtracking', {
  id: '19-4-combination-sum',
  num: '19.4',
  title: 'Add up to a target, and cut dead ends',
  goal: 'You can find groups that add to a target, skip repeats, and stop bad paths early.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Which numbers add up to a target?' },
    { t: 'p', text: 'You have stickers worth 2 points and 3 points. You may use each kind many times. You want exactly 6 points.' },
    { t: 'q', id: 'spark-six', type: 'mcq', level: 1,
      q: 'Count by hand. How many different groups make 6? A group of 2, 3 is the same as 3, 2.',
      options: [
        { text: '1', why: 'That finds one group and stops. You may use a kind again, so there are more ways to look.' },
        '2',
        { text: '3', why: 'That may count one group twice, in 2 orders. Here the order does not make a new group.' },
      ],
      answer: 1,
      explain: 'The groups are [2, 2, 2] and [3, 3]. Using 2 and 3 together gives 5 or 7 or 8, never 6.',
      hints: ['Try all 2s. Then try all 3s.', 'Can a group with both a 2 and a 3 make 6?'],
    },
    { t: 'words', items: [
      { word: 'combination', say: 'kom-bih-NAY-shun', means: 'A group where order does not matter. [2, 3] and [3, 2] are one combination.' },
      { word: 'prune', say: 'PROON', means: 'Stop going down a path, because you already know it cannot work.' },
    ] },
    { t: 'steps', noun: 'Idea', title: 'What is new in this search', items: [
      { label: 'Keep track of left', text: '`left` is how much you still need. Each choice takes some away. At 0, you have an answer.', code: 'explore(i, left - nums[i])' },
      { label: 'Never go back in the list', text: '`start` says where the loop begins. Once you move past 2, you cannot pick 2 again. So [3, 2] can never appear after [2, 3].', code: 'for i in range(start, len(nums)):' },
      { label: 'Hand over i, not i + 1', text: 'Passing `i` lets the next call pick the same number again.', code: 'explore(i, left - nums[i])' },
    ] },
    { t: 'viz', name: 'm19-combo-sum', caption: 'Each circle shows left. A number on a line is the choice. Red means it went past 0. Count the calls, then change the target.' },
    { t: 'code', caption: 'Run it. Then change the target to 7, and guess the answers first.',
      output: '[[2, 2, 2], [3, 3]]',
      code: py`
        nums = [2, 3]
        target = 6
        results = []
        path = []

        def explore(start, left):
            if left < 0:
                return
            if left == 0:
                results.append(path.copy())
                return
            for i in range(start, len(nums)):
                path.append(nums[i])  # choose
                explore(i, left - nums[i])
                path.pop()            # un-choose

        explore(0, target)
        print(results)
      `,
    },
    { t: 'q', id: 'why-start', type: 'predict', level: 2,
      q: 'Here the loop starts at 0, not at `start`. What does it print?',
      code: py`
        nums = [1, 2]
        results = []
        path = []

        def explore(left):
            if left == 0:
                results.append(path.copy())
                return
            if left < 0:
                return
            for i in range(0, len(nums)):
                path.append(nums[i])
                explore(left - nums[i])
                path.pop()

        explore(3)
        print(results)
      `,
      options: [
        { text: '[[1, 1, 1], [1, 2]]', why: 'That is what `start` would give. With no `start`, the loop can go back to a smaller number.' },
        '[[1, 1, 1], [1, 2], [2, 1]]',
        { text: '[[1, 2], [2, 1]]', why: 'That leaves out all 1s. Nothing stops 1 from being picked 3 times.' },
      ],
      answer: 1,
      explain: 'With no `start`, [2, 1] shows up as well as [1, 2]. That is one [[combination]], listed twice.',
      hints: ['After choosing 2, can the loop pick 1 here?'],
    },

    { t: 'h', text: 'Can you leave a path early?' },
    { t: 'p', text: 'In the maze, you walked up to each wall to find it was a wall. But if you can see the wall from the fork, why walk there? If a number is bigger than `left`, that choice cannot work.' },
    { t: 'q', id: 'count-saved', type: 'mcq', level: 2,
      q: 'Sort the numbers small to big. One number is bigger than `left`. What about the numbers after it?',
      options: [
        'They are too big as well',
        { text: 'They might still fit', why: 'That forgets the sort. Later numbers can only be the same size or bigger.' },
        { text: 'You must try them to be sure', why: 'Trying them is the extra work you want to avoid. The sort already tells you the answer.' },
      ],
      answer: 0,
      explain: 'In a sorted list, every later number is at least as big. So `break` can stop the whole loop.',
      hints: ['What does sorted tell you about later numbers?'],
    },
    { t: 'viz', name: 'm19-prune', caption: 'Same numbers, one new check. A dashed line with an x is a call that never happens. Compare the calls with the last picture.' },
    { t: 'code', caption: 'Both searches find the same 4 answers. Run it to compare the calls. Then try a bigger target, like 30.',
      output: 'plain 79\npruned 40',
      code: py`
        def search(nums, target, prune):
            count = {"calls": 0}

            def explore(start, left):
                count["calls"] = count["calls"] + 1
                if left <= 0:
                    return
                for i in range(start, len(nums)):
                    if prune and nums[i] > left:
                        break
                    explore(i, left - nums[i])

            explore(0, target)
            return count["calls"]

        print("plain", search([5, 7, 8, 9], 25, False))
        print("pruned", search([5, 7, 8, 9], 25, True))
      `,
    },
    { t: 'big', text: '[[Brute force]] builds every full answer, then checks it. [[Backtracking]] checks as it goes, and walks away early.' },
    { t: 'trap',
      think: 'I can use `break` on any list.',
      real: 'It only works on a sorted list. If a small number sits after a big one, `break` never reaches it. So call `nums.sort()` first.',
      code: 'nums = [5, 2]\n# left is 2. 5 is too big, so break.\n# The 2 never gets a try, and an answer is lost.',
    },

    { t: 'h', text: 'What if the list has repeats?' },
    { t: 'p', text: 'Now each sticker can be used once, and two stickers can have the same value. Say you have 1, 1 and 2. Which groups make 3?' },
    { t: 'code', caption: 'Run it. Each number is used once, so the call hands over `i + 1`. But the same group shows up twice.',
      output: '[[1, 2], [1, 2]]',
      code: py`
        nums = [1, 1, 2]
        results = []
        path = []

        def explore(start, left):
            if left == 0:
                results.append(path.copy())
                return
            for i in range(start, len(nums)):
                if nums[i] > left:
                    break
                path.append(nums[i])
                explore(i + 1, left - nums[i])
                path.pop()

        explore(0, 3)
        print(results)
      `,
    },
    { t: 'p', text: 'Here is the rule. At one fork, try each value once. If this number equals the one before, and both are at this fork, skip it. Going deeper may still use it.' },
    { t: 'viz', name: 'm19-skip-dups', caption: 'A dashed line with = is a skipped repeat. Try 1 1 with target 2, because that answer really does need both 1s.' },
    { t: 'q', id: 'why-i-start', type: 'mcq', level: 2,
      q: 'The check says `i > start`. Why not `i > 0`?',
      options: [
        { text: 'They mean the same thing', why: 'They differ when `start` is above 0. A deeper call has `start` above 0, and its first number must get a try.' },
        '`i > 0` would also block a number going deeper, like the second 1 in [1, 1]',
        { text: '`i > 0` would crash at the end of the list', why: 'No crash happens. The trouble is lost answers, which is harder to spot.' },
      ],
      answer: 1,
      explain: 'In a deeper call, the first number sits at `start`. It is not a repeat at this fork, so it must get a try.',
      hints: ['Try [1, 1] with target 2. Which answer needs both 1s?'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: '`nums.sort()` first', cost: 'O(n log n)', why: 'This is small next to the search, and it makes the prune and the skip possible.' },
      { op: 'Each number used once, saving answers', cost: 'O(n x 2^n)', why: 'Each number is take or skip at worst, as in lesson 19.2. Each save copies up to n items.' },
      { op: 'A prune', cost: 'Same worst case', why: 'A bad input may have few paths to cut. But it often cuts a lot, like the calls you just counted.' },
    ] },
    { t: 'code', caption: 'Test the odd cases. A target of 0 has one answer: choose nothing. With no numbers, or no fit, there are no answers.',
      output: '[[]]\n[]\n[]\n[[4, 4]]',
      code: py`
        def groups(nums, target):
            nums = sorted(nums)
            results = []
            path = []

            def explore(start, left):
                if left == 0:
                    results.append(path.copy())
                    return
                for i in range(start, len(nums)):
                    if nums[i] > left:
                        break
                    path.append(nums[i])
                    explore(i, left - nums[i])
                    path.pop()

            explore(0, target)
            return results

        print(groups([2, 3], 0))
        print(groups([], 5))
        print(groups([4], 3))
        print(groups([4], 8))
      `,
    },
    { t: 'tip', title: 'Numbers must be above 0', text: 'A 0 would never make `left` smaller. So the calls would never end, and you would get a RecursionError. Remove zeros before you start.' },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **all groups that add up to**, **make this total**, or **each number used once**. Sort first. Use `i` if a number can repeat, and `i + 1` if it cannot. If the input has repeats, skip them at the same fork.' },
  ],
  recap: [
    'You can use start and left to list each group once.',
    'You can prune with break on a sorted list.',
    'You can skip a repeat at the same fork.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each piece of code to its job.',
      pairs: [
        ['`left - nums[i]`', 'Works out how much you still need'],
        ['`range(start, len(nums))`', 'Stops the search going back to earlier numbers'],
        ['`if nums[i] > left: break`', 'A prune that stops the loop early'],
        ['`if i > start and nums[i] == nums[i - 1]`', 'Spots a repeat at the same fork'],
      ],
      explain: 'Each line has one job. Together they list each [[combination]] once, with little wasted work.',
      hints: ['Which one mentions `break`?'],
    },
    { id: 'i-or-next', type: 'mcq', level: 1,
      q: 'A problem says each card can be used only once. What does the call hand over?',
      options: [
        '`explore(i + 1, left - nums[i])`',
        { text: '`explore(i, left - nums[i])`', why: 'Handing over `i` lets the next call pick the same card again. That is for when repeats are allowed.' },
        { text: '`explore(0, left - nums[i])`', why: 'Starting at 0 lets the search go back. Then it can reuse cards, and list one group in many orders.' },
      ],
      answer: 0,
      explain: 'The next call must start after this card. So this card cannot be picked again.',
      hints: ['Where should the next call start, if this card is used up?'],
    },
    { id: 'predict-once', type: 'predict', level: 2,
      q: 'Each number is used once here. What does it print?',
      code: py`
        nums = [1, 2, 3]
        results = []
        path = []

        def explore(start, left):
            if left == 0:
                results.append(path.copy())
                return
            for i in range(start, len(nums)):
                if nums[i] > left:
                    break
                path.append(nums[i])
                explore(i + 1, left - nums[i])
                path.pop()

        explore(0, 3)
        print(results)
      `,
      options: [
        '[[1, 2], [3]]',
        { text: '[[1, 1, 1], [1, 2], [3]]', why: 'That reuses 1. The call hands over `i + 1`, so each number gets one use.' },
        { text: '[[1, 2], [2, 1], [3]]', why: 'That goes back in the list. The loop begins at `start`, so 1 cannot come after 2.' },
      ],
      answer: 0,
      explain: 'From 1, only 2 and 3 are left, and 1 + 2 is 3. The number 3 is an answer alone.',
      hints: ['After choosing 1, where does the next loop begin?'],
    },
    { id: 'fix-unsorted', type: 'fix', level: 2,
      q: '`groups([3, 2], 2)` should find one answer, the list `[2]`. It finds none, because `break` needs a sorted list. Add one line.',
      code: 'def groups(nums, target):\n    results = []\n    path = []\n\n    def explore(start, left):\n        if left == 0:\n            results.append(path.copy())\n            return\n        for i in range(start, len(nums)):\n            if nums[i] > left:\n                break\n            path.append(nums[i])\n            explore(i, left - nums[i])\n            path.pop()\n\n    explore(0, target)\n    return results\n',
      answer: 'def groups(nums, target):\n    nums = sorted(nums)\n    results = []\n    path = []\n\n    def explore(start, left):\n        if left == 0:\n            results.append(path.copy())\n            return\n        for i in range(start, len(nums)):\n            if nums[i] > left:\n                break\n            path.append(nums[i])\n            explore(i, left - nums[i])\n            path.pop()\n\n    explore(0, target)\n    return results\n',
      tests: [
        { label: 'groups([3, 2], 2)', call: 'groups([3, 2], 2)', want: '[[2]]' },
        { label: 'groups([3, 2], 6)', call: 'groups([3, 2], 6)', want: '[[2, 2, 2], [3, 3]]' },
        { label: 'groups([], 1)', call: 'groups([], 1)', want: '[]' },
      ],
      explain: 'Once the list is sorted, every number after a too-big one is too big as well. So `break` is safe.',
      hints: ['Where should the numbers be sorted?', 'At the top, add `nums = sorted(nums)`.'],
    },
    { id: 'fix-i-zero', type: 'fix', level: 2,
      q: '`once([1, 1], 2)` should find the group `[1, 1]`. It finds nothing, because the repeat check blocks too much. Fix it.',
      code: 'def once(nums, target):\n    nums = sorted(nums)\n    results = []\n    path = []\n\n    def explore(start, left):\n        if left == 0:\n            results.append(path.copy())\n            return\n        for i in range(start, len(nums)):\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            if nums[i] > left:\n                break\n            path.append(nums[i])\n            explore(i + 1, left - nums[i])\n            path.pop()\n\n    explore(0, target)\n    return results\n',
      answer: 'def once(nums, target):\n    nums = sorted(nums)\n    results = []\n    path = []\n\n    def explore(start, left):\n        if left == 0:\n            results.append(path.copy())\n            return\n        for i in range(start, len(nums)):\n            if i > start and nums[i] == nums[i - 1]:\n                continue\n            if nums[i] > left:\n                break\n            path.append(nums[i])\n            explore(i + 1, left - nums[i])\n            path.pop()\n\n    explore(0, target)\n    return results\n',
      tests: [
        { label: 'once([1, 1], 2)', call: 'once([1, 1], 2)', want: '[[1, 1]]' },
        { label: 'once([1, 1, 2], 3)', call: 'once([1, 1, 2], 3)', want: '[[1, 2]]' },
        { label: 'once([2, 2], 3)', call: 'once([2, 2], 3)', want: '[]' },
      ],
      explain: 'A repeat counts only at the same fork, which means past `start`. The first number at a fork always gets a try.',
      hints: ['What is `start` in the deeper call?', 'Compare `i` with `start`, not with 0.'],
    },
    { id: 'write-groups', type: 'write', level: 2,
      q: 'Write `make_total(nums, target)`. It returns each group that adds to `target`, and numbers may repeat. All numbers are above 0 and differ. Use a prune.',
      starter: 'def make_total(nums, target):\n    nums = sorted(nums)\n    results = []\n    path = []\n    # Your code here.\n    return results\n',
      answer: 'def make_total(nums, target):\n    nums = sorted(nums)\n    results = []\n    path = []\n\n    def explore(start, left):\n        if left == 0:\n            results.append(path.copy())\n            return\n        for i in range(start, len(nums)):\n            if nums[i] > left:\n                break\n            path.append(nums[i])\n            explore(i, left - nums[i])\n            path.pop()\n\n    explore(0, target)\n    return results\n',
      tests: [
        { label: 'make_total([3, 2], 6)', call: 'make_total([3, 2], 6)', want: '[[2, 2, 2], [3, 3]]' },
        { label: 'make_total([4, 5], 9)', call: 'make_total([4, 5], 9)', want: '[[4, 5]]' },
        { label: 'No group fits', call: 'make_total([2], 3)', want: '[]' },
        { label: 'A target of 0', call: 'make_total([1], 0)', want: '[[]]' },
      ],
      explain: 'The inner function takes `start` and `left`. When `left` is 0, save a copy. Hand over `i`, so numbers can repeat.',
      hints: ['Write `explore(start, left)`.', 'Break if `nums[i] > left`.', 'Call `explore(i, left - nums[i])` between the append and the pop.'],
    },
    { id: 'write-once', type: 'write', level: 3,
      q: 'Stretch: write `unique_groups(items)`. It returns every subset once, even if `items` has repeats. Sort first. So `unique_groups([1, 1])` gives `[[], [1], [1, 1]]`.',
      starter: 'def unique_groups(items):\n    items = sorted(items)\n    results = []\n    path = []\n    # Your code here.\n    return results\n',
      answer: 'def unique_groups(items):\n    items = sorted(items)\n    results = []\n    path = []\n\n    def explore(start):\n        results.append(path.copy())\n        for i in range(start, len(items)):\n            if i > start and items[i] == items[i - 1]:\n                continue\n            path.append(items[i])\n            explore(i + 1)\n            path.pop()\n\n    explore(0)\n    return results\n',
      tests: [
        { label: 'unique_groups([1, 1])', call: 'unique_groups([1, 1])', want: '[[], [1], [1, 1]]' },
        { label: 'unique_groups([2, 1, 2])', call: 'unique_groups([2, 1, 2])', want: '[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]' },
        { label: 'unique_groups([])', call: 'unique_groups([])', want: '[[]]' },
      ],
      explain: 'Here every call saves `path`, since any group is an answer. The loop then adds one more number, and skips repeats at this fork.',
      hints: ['Save a copy at the top of every call.', 'Loop from `start`, and hand over `i + 1`.', 'Skip when `i > start` and the number equals the one before.'],
    },
  ],
});

/* ------------------------------------------------------------------ 19.5 */
Course.lesson('m19-backtracking', {
  id: '19-5-word-search',
  num: '19.5',
  title: 'Find a word in a grid',
  goal: 'You can find a word in a grid by marking cells, exploring, and putting letters back.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Can you find a word in a grid?' },
    { t: 'p', text: 'Here is a grid of letters. A word is a path of cells, and each step goes up, down, left or right. No cell can be used twice in one word.' },
    { t: 'code', run: false, code: 'C A R\nA T S\nR E D' },
    { t: 'q', id: 'spark-word', type: 'mcq', level: 1,
      q: 'Use your finger. Which word can you find in this grid?',
      options: [
        'CARS',
        { text: 'CAST', why: 'S is not next to either A. Steps go only up, down, left or right.' },
        { text: 'CEDAR', why: 'E does not touch C. Each step must go to a cell right next to the last one.' },
      ],
      answer: 0,
      explain: 'Go right from C to A, right to R, then down to S. Each step goes to a cell next to the last.',
      hints: ['Start on the C. Which cells touch it?'],
    },
    { t: 'p', text: 'This is the same maze. Each cell is a fork with up to 4 ways. A used cell is a wall, for this path only. Walking back must take that wall down.' },
    { t: 'viz', name: 'm19-word-search', caption: 'A # marks a cell in the path. Watch it turn back into a letter at each UN-CHOOSE. Then try CART, CAC and C.' },
    { t: 'steps', title: 'Choose, explore, un-choose on a grid', items: [
      { label: 'Choose', text: 'Save the letter, and write `#` in the cell. No path can match `#`, so this path cannot use the cell again.', code: 'keep = board[r][c]\nboard[r][c] = "#"' },
      { label: 'Explore', text: 'Try the next letter in each of the 4 cells around this one. Stop as soon as one works.', code: 'for dr, dc in MOVES:\n    if find(r + dr, c + dc, k + 1):' },
      { label: 'Un-choose', text: 'Put the letter back, so other paths can use the cell.', code: 'board[r][c] = keep' },
    ] },
    { t: 'code', caption: 'Run it. Add a word of your own to the list. Which cells does it use?',
      output: 'CARS True\nCART False\nCAC False',
      code: py`
        board = [
            ["C", "A", "R"],
            ["A", "T", "S"],
            ["R", "E", "D"],
        ]
        MOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def on_board(r, c):
            if r < 0 or c < 0:
                return False
            return r < len(board) and c < len(board[0])

        def find(word, r, c, k):
            if k == len(word):
                return True
            if not on_board(r, c):
                return False
            if board[r][c] != word[k]:
                return False
            keep = board[r][c]
            board[r][c] = "#"         # choose
            found = False
            for dr, dc in MOVES:
                if find(word, r + dr, c + dc, k + 1):
                    found = True
                    break
            board[r][c] = keep        # un-choose
            return found

        def has_word(word):
            for r in range(len(board)):
                for c in range(len(board[0])):
                    if find(word, r, c, 0):
                        return True
            return False

        for word in ["CARS", "CART", "CAC"]:
            print(word, has_word(word))
      `,
    },
    { t: 'q', id: 'why-not-found', type: 'mcq', level: 2,
      q: 'Why is CAC not found? The grid has a C, and it has an A next to it.',
      options: [
        { text: 'Python cannot match a word that repeats a letter', why: 'Repeats are fine. But the grid would need a second C next to the A.' },
        'The C cell holds # while the path is on it, and no other C is nearby',
        { text: 'The word is too short', why: 'Short words work too. CA would be found.' },
      ],
      answer: 1,
      explain: 'The path marks C with `#`. So the last step cannot use that cell again, and the grid has only one C.',
      hints: ['What does the C cell hold when the path reaches the A?'],
    },
    { t: 'code', caption: 'This grid holds TOTE. One line is missing, so the search says False. Add `board[r][c] = keep` before the return, and run it again.',
      output: 'False',
      code: py`
        board = [["T", "O", "T"], ["E", "A", "R"]]
        MOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def find(word, r, c, k):
            if k == len(word):
                return True
            if r < 0 or c < 0 or r > 1 or c > 2:
                return False
            if board[r][c] != word[k]:
                return False
            keep = board[r][c]
            board[r][c] = "#"
            found = False
            for dr, dc in MOVES:
                if find(word, r + dr, c + dc, k + 1):
                    found = True
                    break
            # The un-choose should go here.
            return found

        print(find("TOTE", 0, 0, 0) or find("TOTE", 0, 2, 0))
      `,
    },
    { t: 'q', id: 'fill-putback', type: 'fill', level: 2,
      q: 'Fill the gaps, so the cell is marked and then gets its letter back. It should print `True`, then `T`.',
      code: py`
        board = [["T", "O"]]

        def find(word, c, k):
            if k == len(word):
                return True
            if c > 1 or board[0][c] != word[k]:
                return False
            keep = board[0][c]
            board[0][c] = ____
            found = find(word, c + 1, k + 1)
            board[0][c] = ____
            return found

        print(find("TO", 0, 0))
        print(board[0][0])
      `,
      blanks: [['"#"', "'#'"], 'keep'],
      output: 'True\nT',
      explain: 'The `#` is the choice. `keep` names the letter, so the un-choose can put it back.',
      hints: ['What mark does a used cell get?', 'Which name is on the old letter?'],
    },
    { t: 'trap',
      think: 'a dead end has nothing to clean up, so the `#` can stay.',
      real: 'The `#` stays for all later paths. Above, the first try goes T, O, T and gets stuck. The right path needs those same cells in another order, and they all still say `#`.',
    },
    { t: 'q', id: 'count-ways', type: 'mcq', level: 2,
      q: 'Count by hand. After the first step, how many ways can a path go at most?',
      options: [
        { text: '4', why: 'That counts the cell you came from. It holds `#`, so that way is closed.' },
        '3',
        { text: '1', why: 'That can happen in a corner. The question asks for the most.' },
      ],
      answer: 1,
      explain: 'A cell has 4 sides at most, and one side leads back to a `#`. That leaves 3 ways.',
      hints: ['A cell has 4 sides. Which side is closed already?'],
    },

    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Marking a cell, or putting its letter back', cost: 'O(1)', why: 'Writing to one spot in a list is one step.' },
      { op: 'Word search, with L letters in the word', cost: 'O(cells x 3^L)', why: 'Each cell may start a path. You counted at most 3 ways at each step.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **find a path in a grid** or **use each cell once**. A used cell gets a mark, and the mark must come off when you walk back.' },
    { t: 'tip', title: 'Odd cases to test', text: 'An empty word is found right away, because it has no letters to match. A letter that the grid lacks gives False. A word longer than the grid has cells can never fit.' },
  ],
  recap: [
    'You can mark a grid cell, explore, and put the letter back.',
    'You can say why a leftover mark gives a wrong answer.',
    'You can spot a grid search from its words.',
  ],
  practice: [
    { id: 'match-moves', type: 'match', level: 1,
      q: 'Match each move to its code in word search.',
      pairs: [
        ['Choose', '`board[r][c] = "#"`'],
        ['Explore', '`find(r + dr, c + dc, k + 1)`'],
        ['Un-choose', '`board[r][c] = keep`'],
      ],
      explain: 'It is the same 3 moves from lesson 19.1. Only the thing you undo has changed.',
      hints: ['Which line puts the letter back?'],
    },
    { id: 'pick-grid', type: 'mcq', level: 1,
      q: 'Which problem fits this kind of search?',
      options: [
        'Can a snake spell a name on a letter board, using each square once?',
        { text: 'What is the biggest number in one row of a grid?', why: 'A loop over the row does that. There are no choices to undo.' },
        { text: 'How many cells of a grid hold the letter A?', why: 'A nested loop counts those. No path is being built.' },
      ],
      answer: 0,
      explain: '"Spell" means a path. "Each square once" means marks, and they come off when you walk back.',
      hints: ['Which one builds a path, step by step?'],
    },
    { id: 'predict-found', type: 'predict', level: 2,
      q: 'Only moves right and down are used here. What does it print?',
      code: py`
        board = [["A", "B"], ["C", "D"]]

        def find(word, r, c, k):
            if k == len(word):
                return True
            if r > 1 or c > 1:
                return False
            if board[r][c] != word[k]:
                return False
            if find(word, r + 1, c, k + 1):
                return True
            return find(word, r, c + 1, k + 1)

        print(find("ACD", 0, 0, 0))
        print(find("ABC", 0, 0, 0))
      `,
      options: [
        { text: 'True\nTrue', why: 'That lets the path go from B to C. They only touch at a corner, and moves go right or down.' },
        'True\nFalse',
        { text: 'False\nFalse', why: 'That misses A, C, D. A goes down to C, and C goes right to D.' },
      ],
      answer: 1,
      explain: 'A, C, D is one step down, then one right. B and C touch only at a corner, so A, B, C fails.',
      hints: ['Draw the 2 by 2 grid.', 'Is C next to B?'],
    },
    { id: 'fix-tote', type: 'fix', level: 2,
      q: '`has_word("TOTE")` should be True. A used cell never gets its letter back. Fix `find`.',
      code: 'board = [["T", "O", "T"], ["E", "A", "R"]]\nMOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]\n\ndef find(word, r, c, k):\n    if k == len(word):\n        return True\n    if r < 0 or c < 0 or r > 1 or c > 2:\n        return False\n    if board[r][c] != word[k]:\n        return False\n    keep = board[r][c]\n    board[r][c] = "#"\n    found = False\n    for dr, dc in MOVES:\n        if find(word, r + dr, c + dc, k + 1):\n            found = True\n            break\n    return found\n\ndef has_word(word):\n    for r in range(2):\n        for c in range(3):\n            if find(word, r, c, 0):\n                return True\n    return False\n',
      answer: 'board = [["T", "O", "T"], ["E", "A", "R"]]\nMOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]\n\ndef find(word, r, c, k):\n    if k == len(word):\n        return True\n    if r < 0 or c < 0 or r > 1 or c > 2:\n        return False\n    if board[r][c] != word[k]:\n        return False\n    keep = board[r][c]\n    board[r][c] = "#"\n    found = False\n    for dr, dc in MOVES:\n        if find(word, r + dr, c + dc, k + 1):\n            found = True\n            break\n    board[r][c] = keep\n    return found\n\ndef has_word(word):\n    for r in range(2):\n        for c in range(3):\n            if find(word, r, c, 0):\n                return True\n    return False\n',
      tests: [
        { label: 'TOTE is found', call: 'has_word("TOTE")', want: 'True' },
        { label: 'A word that is not there', call: 'has_word("TOAD")', want: 'False' },
        { label: 'The board is back as it was', check: 'has_word("TOTE") and board == [["T", "O", "T"], ["E", "A", "R"]]' },
      ],
      explain: 'Putting the letter back lets the second try use those cells. The board also ends as it began.',
      hints: ['`keep` is saved but never used.', 'Add `board[r][c] = keep` before `return found`.'],
    },
    { id: 'write-neighbours', type: 'write', level: 2,
      q: 'Write `next_cells(r, c, rows, cols)`. It returns the cells that touch `(r, c)` and are on the board. Use the order down, up, right, left.',
      starter: 'MOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]\n\ndef next_cells(r, c, rows, cols):\n    # Your code here.\n    return []\n',
      answer: 'MOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]\n\ndef next_cells(r, c, rows, cols):\n    cells = []\n    for dr, dc in MOVES:\n        nr = r + dr\n        nc = c + dc\n        if nr >= 0 and nc >= 0 and nr < rows and nc < cols:\n            cells.append((nr, nc))\n    return cells\n',
      tests: [
        { label: 'A corner has 2', call: 'next_cells(0, 0, 2, 2)', want: '[(1, 0), (0, 1)]' },
        { label: 'The middle has 4', call: 'next_cells(1, 1, 3, 3)', want: '[(2, 1), (0, 1), (1, 2), (1, 0)]' },
        { label: 'A 1 by 1 board has none', call: 'next_cells(0, 0, 1, 1)', want: '[]' },
      ],
      explain: 'Add each move to the cell. Keep the result only if it is still on the board.',
      hints: ['Loop with `for dr, dc in MOVES:`.', 'Work out the new row and new column.', 'Check all 4 edges before you append.'],
    },
    { id: 'write-has-word', type: 'write', level: 3,
      q: 'Stretch: write `has_word(board, word)`. It returns `True` if the word is a path in the grid, using each cell once. Leave the board as it was.',
      starter: 'def has_word(board, word):\n    # Your code here.\n    return None\n',
      answer: 'def has_word(board, word):\n    moves = [(1, 0), (-1, 0), (0, 1), (0, -1)]\n\n    def find(r, c, k):\n        if k == len(word):\n            return True\n        if r < 0 or c < 0:\n            return False\n        if r >= len(board) or c >= len(board[0]):\n            return False\n        if board[r][c] != word[k]:\n            return False\n        keep = board[r][c]\n        board[r][c] = "#"\n        found = False\n        for dr, dc in moves:\n            if find(r + dr, c + dc, k + 1):\n                found = True\n                break\n        board[r][c] = keep\n        return found\n\n    for r in range(len(board)):\n        for c in range(len(board[0])):\n            if find(r, c, 0):\n                return True\n    return False\n',
      tests: [
        { label: 'A path that bends', call: 'has_word([["S", "U"], ["N", "X"]], "USN")', want: 'True' },
        { label: 'A word that is not there', call: 'has_word([["S", "U"], ["N", "X"]], "NUS")', want: 'False' },
        { label: 'A word going down', call: 'has_word([["S", "X"], ["U", "N"]], "SUN")', want: 'True' },
        { label: 'No cell used twice', call: 'has_word([["A", "B"]], "ABA")', want: 'False' },
        { label: 'TOTE needs the un-choose', call: 'has_word([["T", "O", "T"], ["E", "A", "R"]], "TOTE")', want: 'True' },
        { label: 'An empty word', call: 'has_word([["A"]], "")', want: 'True' },
        { label: 'The board ends as it began', check: '(lambda b: (has_word(b, "SUN"), b == [["S", "X"], ["U", "N"]])[1])([["S", "X"], ["U", "N"]])' },
      ],
      explain: 'Try each cell as a start. Mark it, explore 4 ways, and always put the letter back before you return.',
      hints: ['Write an inner function `find(r, c, k)`.', 'Check the word end first, then the edges, then the letter.', 'Then: mark, loop over the moves, put back, return.'],
    },
  ],
});

/* ------------------------------------------------------------------ 19.6 */
Course.lesson('m19-backtracking', {
  id: '19-6-n-queens',
  num: '19.6',
  title: 'Place the queens',
  goal: 'You can place queens on a small board, one row at a time, undoing each try.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Can you place the queens?' },
    { t: 'q', id: 'spark-two', type: 'mcq', level: 1,
      q: 'A chess queen attacks along her row, her column and both diagonals. Can 2 queens share a 2 by 2 board with no attack?',
      options: [
        { text: 'Yes, put them in opposite corners', why: 'Opposite corners are on one diagonal, so they attack each other.' },
        'No, any 2 squares share a line',
      ],
      answer: 1,
      explain: 'On this board, any 2 squares share a row, a column or a diagonal.',
      hints: ['Put one queen in a corner. Which squares can she reach?'],
    },
    { t: 'words', items: [
      { word: 'N-Queens', say: 'en queens', means: 'A puzzle: put n queens on an n by n board, so no queen can attack another.' },
    ] },
    { t: 'p', text: 'Only 1 queen fits in each row. So place one row at a time, and write down the column for each. A row with no safe square is a dead end in the maze.' },
    { t: 'code', caption: '`queens[r]` is the column of the queen in row r. `abs` drops the minus sign. On a diagonal, the distance across equals the distance down.',
      output: 'False\nFalse\nTrue',
      code: py`
        def safe(queens, row, col):
            for r in range(row):
                c = queens[r]
                if c == col:
                    return False
                if abs(c - col) == row - r:
                    return False
            return True

        queens = [0]              # one queen: row 0, column 0
        print(safe(queens, 1, 0)) # same column
        print(safe(queens, 1, 1)) # on a diagonal
        print(safe(queens, 1, 2)) # no clash
      `,
    },
    { t: 'q', id: 'predict-safe', type: 'predict', level: 2,
      q: 'A queen sits in row 0, column 1. Is row 2, column 3 safe?',
      code: py`
        def safe(queens, row, col):
            for r in range(row):
                c = queens[r]
                if c == col or abs(c - col) == row - r:
                    return False
            return True

        print(safe([1], 2, 3))
      `,
      options: [
        { text: 'True', why: 'That looks at the column only. Columns 1 and 3 differ, but look at the diagonal too.' },
        'False',
      ],
      answer: 1,
      explain: 'The distance across is 2, and the distance down is 2. So the new queen is on the same diagonal.',
      hints: ['Work out 3 - 1, and 2 - 0.'],
    },
    { t: 'viz', name: 'm19-queens', caption: 'An x marks an attacked square. When a row is all x, the queen above must lift. Then try n = 3, n = 2 and n = 1.' },
    { t: 'code', caption: 'Run it. Stopping at the first answer lets `return True` skip the pop. Then try n = 3, which has no answer.',
      output: '. Q . .\n. . . Q\nQ . . .\n. . Q .',
      code: py`
        n = 4
        queens = []

        def safe(row, col):
            for r in range(row):
                c = queens[r]
                if c == col or abs(c - col) == row - r:
                    return False
            return True

        def solve(row):
            if row == n:
                return True
            for col in range(n):
                if safe(row, col):
                    queens.append(col)  # choose
                    if solve(row + 1):  # explore
                        return True
                    queens.pop()        # un-choose
            return False

        if solve(0):
            for col in queens:
                line = ["."] * n
                line[col] = "Q"
                print(" ".join(line))
        else:
            print("No answer")
      `,
    },
    { t: 'q', id: 'fill-solve', type: 'fill', level: 2,
      q: 'Fill the gaps in `solve`, so a queen goes on and comes off. It should print `[1, 3, 0, 2]`.',
      code: py`
        n = 4
        queens = []

        def safe(row, col):
            for r in range(row):
                c = queens[r]
                if c == col or abs(c - col) == row - r:
                    return False
            return True

        def solve(row):
            if row == n:
                return True
            for col in range(n):
                if safe(row, col):
                    queens.____(col)
                    if solve(row + 1):
                        return True
                    queens.____()
            return False

        solve(0)
        print(queens)
      `,
      blanks: ['append', 'pop'],
      output: '[1, 3, 0, 2]',
      explain: 'It is the same choose and un-choose as in lesson 19.1. Only the name of the list has changed.',
      hints: ['What adds to the end of a list?', 'What takes the last item off?'],
    },
    { t: 'q', id: 'dead-row', type: 'mcq', level: 2,
      q: 'Every square in a row is attacked. Which queen must move?',
      options: [
        { text: 'The very first queen', why: 'That throws away too much. Only the latest choice is undone first, and older ones wait.' },
        'The queen in the row above',
        { text: 'No queen moves, and the search ends', why: 'That gives up too soon. The row above may still have another column to try.' },
      ],
      answer: 1,
      explain: 'The call for this row returns False. Then the call above pops its queen and tries its next column.',
      hints: ['Which choice was made last?'],
    },
    { t: 'code', caption: 'This finds all answers and counts squares tried. `**` means to the power, so the last number counts boards with 1 queen per row.',
      output: '3 0 18 27\n4 2 60 256\n5 10 220 3125\n6 4 894 46656',
      code: py`
        def count_all(n):
            queens = []
            tally = {"tried": 0, "answers": 0}

            def safe(row, col):
                for r in range(row):
                    c = queens[r]
                    if c == col or abs(c - col) == row - r:
                        return False
                return True

            def solve(row):
                if row == n:
                    tally["answers"] = tally["answers"] + 1
                    return
                for col in range(n):
                    tally["tried"] = tally["tried"] + 1
                    if safe(row, col):
                        queens.append(col)
                        solve(row + 1)
                        queens.pop()

            solve(0)
            return tally

        for n in [3, 4, 5, 6]:
            t = count_all(n)
            print(n, t["answers"], t["tried"], n ** n)
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'One call to `safe`', cost: 'O(n)', why: 'It looks at each earlier queen once.' },
      { op: 'N-Queens, finding all answers', cost: 'At most O(n^2 x n!)', why: 'Row 0 has n columns, and the next has fewer free ones. Each square tried also runs `safe`.' },
    ] },
    { t: 'tip', title: 'How to recognize it', text: 'Look for **place them so none clash** or **fill in the puzzle**. Sudoku is one of these. Fill one spot at a time, and check it. Undo it when a later spot has no choice left.' },
    { t: 'tip', title: 'Odd cases to test', text: 'A 1 by 1 board has one answer. Boards of size 2 and 3 have none. So the search ends with an empty list, and it says so.' },
  ],
  recap: [
    'You can check if a queen is safe by column and diagonal.',
    'You can place queens row by row, and lift one at a dead end.',
    'You can say why going row by row is a prune.',
  ],
  practice: [
    { id: 'match-code', type: 'match', level: 1,
      q: 'Match each piece of code to its job.',
      pairs: [
        ['`queens[r]`', 'The column of the queen in row r'],
        ['`c == col`', 'Checks for the same column'],
        ['`abs(c - col) == row - r`', 'Checks for the same diagonal'],
        ['`queens.pop()`', 'Lifts the last queen off the board'],
      ],
      explain: 'The list holds one column per row. The checks use it, and `pop` undoes the last choice.',
      hints: ['Which one uses both distances?'],
    },
    { id: 'why-one-per-row', type: 'mcq', level: 1,
      q: 'The queen code tries one queen per row. Why does `safe` not check rows?',
      options: [
        'Each row only ever gets one queen, so rows cannot clash',
        { text: 'Queens cannot attack along a row', why: 'They can. The code avoids that clash by how it places them, so no check is needed.' },
        { text: 'It forgot to, and it is a bug', why: 'It is no bug. The search never puts 2 queens in one row, so the check would always pass.' },
      ],
      answer: 0,
      explain: 'Going row by row is a big prune all by itself. A board with 2 queens in a row never gets built.',
      hints: ['Can the code ever put 2 queens in row 1?'],
    },
    { id: 'predict-safe-2', type: 'predict', level: 2,
      q: 'Queens sit in row 0, column 1 and row 1, column 3. Is row 2, column 0 safe? Type what prints.',
      code: py`
        def safe(queens, row, col):
            for r in range(row):
                c = queens[r]
                if c == col or abs(c - col) == row - r:
                    return False
            return True

        print(safe([1, 3], 2, 0))
      `,
      answer: 'True',
      why: 'Column 0 is new. The first queen is 1 across and 2 down. The second is 3 across and 1 down.',
      explain: 'No column matches, and the distances differ for both queens. So the square is safe.',
      hints: ['Check the queen in row 0, then the queen in row 1.'],
    },
    { id: 'fix-count-pop', type: 'fix', level: 2,
      q: '`count_boards(4)` should be 2, but `queens` never shrinks. A move is missing. Add it.',
      code: 'def safe(queens, row, col):\n    for r in range(row):\n        c = queens[r]\n        if c == col or abs(c - col) == row - r:\n            return False\n    return True\n\ndef count_boards(n):\n    queens = []\n\n    def solve(row):\n        if row == n:\n            return 1\n        total = 0\n        for col in range(n):\n            if safe(queens, row, col):\n                queens.append(col)\n                total = total + solve(row + 1)\n        return total\n\n    return solve(0)\n',
      answer: 'def safe(queens, row, col):\n    for r in range(row):\n        c = queens[r]\n        if c == col or abs(c - col) == row - r:\n            return False\n    return True\n\ndef count_boards(n):\n    queens = []\n\n    def solve(row):\n        if row == n:\n            return 1\n        total = 0\n        for col in range(n):\n            if safe(queens, row, col):\n                queens.append(col)\n                total = total + solve(row + 1)\n                queens.pop()\n        return total\n\n    return solve(0)\n',
      tests: [
        { label: 'n = 4', call: 'count_boards(4)', want: '2' },
        { label: 'n = 3', call: 'count_boards(3)', want: '0' },
        { label: 'n = 1', call: 'count_boards(1)', want: '1' },
      ],
      explain: 'Without the pop, old queens stay in the list, and `safe` reads the wrong columns.',
      hints: ['Which of the 3 moves is missing?', 'Add `queens.pop()` after the call.'],
    },
    { id: 'write-safe', type: 'write', level: 2,
      q: 'Write `safe(queens, row, col)`. `queens[r]` is the column of the queen in row r. It returns `True` if no queen shares the column or a diagonal.',
      starter: 'def safe(queens, row, col):\n    # Your code here.\n    return None\n',
      answer: 'def safe(queens, row, col):\n    for r in range(row):\n        c = queens[r]\n        if c == col or abs(c - col) == row - r:\n            return False\n    return True\n',
      tests: [
        { label: 'Same column', call: 'safe([2], 1, 2)', want: 'False' },
        { label: 'On a diagonal', call: 'safe([0], 2, 2)', want: 'False' },
        { label: 'The other diagonal', call: 'safe([3], 1, 2)', want: 'False' },
        { label: 'A clash with the second queen', call: 'safe([0, 2], 2, 1)', want: 'False' },
        { label: 'Safe square', call: 'safe([1, 3], 2, 0)', want: 'True' },
        { label: 'An empty board', call: 'safe([], 0, 0)', want: 'True' },
      ],
      explain: 'Check each earlier row. Same column or equal distances mean a clash. If no row clashes, the square is safe.',
      hints: ['Loop over `r` in `range(row)`.', 'The column check is `queens[r] == col`.', 'The diagonal check is `abs(queens[r] - col) == row - r`.'],
    },
    { id: 'write-count', type: 'write', level: 3,
      q: 'Stretch: write `count_boards(n)`. It returns how many ways there are to place n queens. `safe` is written for you. Do not stop at the first answer.',
      starter: 'def safe(queens, row, col):\n    for r in range(row):\n        c = queens[r]\n        if c == col or abs(c - col) == row - r:\n            return False\n    return True\n\ndef count_boards(n):\n    queens = []\n    # Your code here.\n    return 0\n',
      answer: 'def safe(queens, row, col):\n    for r in range(row):\n        c = queens[r]\n        if c == col or abs(c - col) == row - r:\n            return False\n    return True\n\ndef count_boards(n):\n    queens = []\n\n    def solve(row):\n        if row == n:\n            return 1\n        total = 0\n        for col in range(n):\n            if safe(queens, row, col):\n                queens.append(col)\n                total = total + solve(row + 1)\n                queens.pop()\n        return total\n\n    return solve(0)\n',
      tests: [
        { label: 'n = 1', call: 'count_boards(1)', want: '1' },
        { label: 'n = 2', call: 'count_boards(2)', want: '0' },
        { label: 'n = 3', call: 'count_boards(3)', want: '0' },
        { label: 'n = 4', call: 'count_boards(4)', want: '2' },
        { label: 'n = 5', call: 'count_boards(5)', want: '10' },
      ],
      explain: 'A full board counts as 1. Each call adds up the counts from its safe columns. The pop always runs, since nothing returns early.',
      hints: ['When `row == n`, return 1.', 'Keep a `total` inside each call.', 'Add `solve(row + 1)` between the append and the pop.'],
    },
  ],
});
