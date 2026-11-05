/* Module 6: Dictionaries and Sets. Part 1 (Learn Python). */
Course.module({
  id: 'm06-dicts-sets',
  num: 6, part: 1, level: 'B',
  title: 'Dictionaries and Sets',
  blurb: 'Find things by name, drop repeats, and count anything.',
  needs: ['m05-lists-strings'],
});

Course.lesson('m06-dicts-sets', {
  id: '6-1-dict-basics',
  num: '6.1',
  title: 'Dicts: find a value by its key',
  goal: 'You can make a dict, look up values by key, and loop over pairs.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How do you find the pears?' },
    { t: 'p', text: 'A list finds things by spot number. But you often want to ask by name, like "how many pears?"' },
    { t: 'q', id: 'list-no-names', type: 'mcq', level: 1,
      q: 'A list holds 3 apples, 5 pears and 7 kiwis: `stock = [3, 5, 7]`. How do you find the pears?',
      options: [
        { text: 'You must remember that pears are at spot 1.', why: '' },
        { text: 'You ask for `stock[2]`, because pears come second.', why: 'List counting starts at 0, so the second item is at spot 1.' },
        { text: 'The list knows which number is the pears.', why: 'The list holds only numbers. It has no idea what they count.' },
      ],
      answer: 0,
      explain: 'A list only knows spot numbers, so you must remember what each spot means. A dict fixes this.',
      hints: ['Does the list hold the word pears anywhere?', 'Look at what is inside the brackets. It is only numbers.'],
    },
    { t: 'analogy', title: 'Picture this', text: 'At a coat check, you hand over a ticket. The helper goes straight to your coat. Unlike a coat check, a dict keeps the coat after you look.' },
    { t: 'words', items: [
      { word: 'dict', means: 'Pairs of keys and values, like a word and its meaning. Short for dictionary.', say: 'dikt' },
      { word: 'key', means: 'The label you use to look up a value in a dict.' },
    ] },
    { t: 'p', text: 'A [[dict]] holds pairs. Each pair has a [[key]] and a [[value]]. You give the key, and Python gives you the value.' },
    { t: 'steps', title: 'Make a dict and use it', items: [
      { label: 'Make it', text: 'Curly brackets hold the pairs. A colon joins each key to its value.', code: 'stock = {"apple": 3, "pear": 5}' },
      { label: 'Look up', text: 'Put the key in square brackets.', code: 'print(stock["pear"])' },
      { label: 'Add or change', text: 'A new key adds a pair. A key that is already there gets a new value.', code: 'stock["kiwi"] = 7\nstock["apple"] = 9' },
    ] },
    { t: 'viz', name: 'm06-dict-lookup', caption: 'Step through it. Guess before you go on.' },
    { t: 'code', caption: 'Run it. Then add a plum with the value 2 and run again.',
      code: py`
        stock = {"apple": 3, "pear": 5}
        print(stock["pear"])
        stock["kiwi"] = 7
        stock["apple"] = 9
        print(stock)
      `,
      output: "5\n{'apple': 9, 'pear': 5, 'kiwi': 7}",
    },
    { t: 'q', id: 'key-new-value', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        ages = {"Mia": 10, "Sam": 12}
        ages["Mia"] = 11
        print(ages["Mia"])
      `,
      options: [
        { text: '10', why: 'The second line runs too. The new value replaces the old one.' },
        { text: '11', why: '' },
        { text: '10 11', why: 'A key points to one value at a time. A dict does not keep the old value.' },
      ],
      answer: 1,
      explain: 'The key "Mia" now points to 11. The 10 is gone.',
      hints: ['Line 2 uses a key that is already there.', 'How many values can one key point to?'],
    },
    { t: 'h', text: 'What if the key is not there?' },
    { t: 'trap', think: 'A missing key gives an empty answer.', real: 'Python stops with a `KeyError`. That means: this key is not in the dict.', code: 'stock = {"apple": 3}\nprint(stock["plum"])   # KeyError' },
    { t: 'p', text: 'You have 2 safe ways to ask. `in` tells you if a [[key]] is there. `get` gives the value, or a backup value if the key is missing.' },
    { t: 'code', caption: 'Run it. With no backup, `get` gives `None`, which means "nothing here".',
      code: py`
        stock = {"apple": 3, "pear": 5}
        print("plum" in stock)
        print(stock.get("pear", 0))
        print(stock.get("plum", 0))
        print(stock.get("plum"))
      `,
      output: 'False\n5\n0\nNone',
    },
    { t: 'q', id: 'in-looks-at-keys', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        stock = {"apple": 3, "pear": 5}
        print(3 in stock)
        print("apple" in stock)
      `,
      options: [
        { text: 'True\nTrue', why: 'The word `in` looks at keys only. 3 is a value, so the first answer is False.' },
        { text: 'False\nTrue', why: '' },
        { text: 'True\nFalse', why: 'These two are swapped. "apple" is a key, and 3 is a value.' },
      ],
      answer: 1,
      explain: 'The word `in` checks the keys of a dict. It does not look at the values.',
      hints: ['Which side of the colon does `in` look at?', '"apple" is on the left of the colon. 3 is on the right.'],
    },
    { t: 'tip', title: 'Why a dict is quick', text: 'A list looks at items one by one. A dict goes almost straight to the key, most of the time. You will learn to measure this in module 8.' },
    { t: 'h', text: 'How do you visit every pair?' },
    { t: 'p', text: 'A `for` loop over a dict gives you each key. Add `items()` to get the key and the value together. The loop hands over 2 values, so you give it 2 names.' },
    { t: 'viz', name: 'm06-dict-loop', caption: 'Watch the order. It is the order the pairs were added.' },
    { t: 'code', caption: 'Run it. Then add a new pair at the end of the dict. Where does it print?',
      code: py`
        stock = {"pear": 5, "apple": 3, "kiwi": 7}
        for fruit in stock:
            print(fruit)
        for fruit, count in stock.items():
            print(fruit, count)
      `,
      output: 'pear\napple\nkiwi\npear 5\napple 3\nkiwi 7',
    },
    { t: 'q', id: 'fill-items', type: 'fill', level: 2,
      q: 'Fill the gap so the loop gets each name and each score.',
      code: 'points = {"Ann": 4, "Ben": 7}\nfor name, score in points.____():\n    print(name, score)',
      blanks: ['items'],
      output: 'Ann 4\nBen 7',
      explain: '`items()` hands over each key and value as a pair.',
      why: 'Think about the word for "all the pairs". It starts with i.',
      hints: ['You want keys and values together.', 'The word is on the loop in the code above: `stock.items()`.'],
    },
    { t: 'big', text: 'A dict finds a value by its key, not by a spot number.' },
  ],
  recap: [
    'You can make a dict with keys and values.',
    'You can use `in` and `get` for missing keys.',
    'You can loop over pairs with `items()`.',
  ],
  practice: [
    { id: 'match-dict-tools', type: 'match', level: 1,
      q: 'Match each piece of code to what it does.',
      pairs: [
        ['`d["a"]`', 'Gives the value, or stops with a KeyError'],
        ['`d.get("a", 0)`', 'Gives the value, or the backup 0'],
        ['`"a" in d`', 'Says True if the key is there'],
        ['`d.items()`', 'Gives every pair, one at a time'],
      ],
      explain: 'Each tool asks about keys. Only `d["a"]` stops when the key is missing.',
      hints: ['Which one can stop with an error?', 'Which one has a backup value?'],
    },
    { id: 'loop-gives-keys', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'd = {"a": 1, "b": 2}\nfor x in d:\n    print(x)',
      options: [
        { text: 'a\nb', why: '' },
        { text: '1\n2', why: 'A loop over a dict gives the keys, not the values.' },
        { text: 'a 1\nb 2', why: 'That needs `items()` and 2 names. This loop has one name and no `items()`.' },
      ],
      answer: 0,
      explain: 'A `for` loop over a dict gives you each key, in the order they were added.',
      hints: ['Keys or values: which does a plain loop give?'],
    },
    { id: 'get-adds-nothing', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'd = {"a": 1}\nprint(d.get("b", 5))\nprint(len(d))',
      options: [
        { text: '5\n1', why: '' },
        { text: '5\n2', why: 'The tool `get` only reads. It does not add "b" to the dict.' },
        { text: 'None\n1', why: 'This `get` has a backup of 5, so it gives 5, not `None`.' },
      ],
      answer: 0,
      explain: '`get` gives the backup and leaves the dict alone. The dict still has 1 pair.',
      hints: ['Does `get` change the dict?', 'Count the pairs in `d` after line 2.'],
    },
    { id: 'no-spot-numbers', type: 'predict', level: 2,
      q: 'What happens when this runs?',
      code: 'd = {"a": 1, "b": 2}\nprint(d[0])',
      expectError: true,
      options: [
        { text: '1', why: 'A dict is not a list. 0 is not a spot number here. Python looks for a key called 0.' },
        { text: 'a', why: 'A dict has no spot 0. Python looks for a key called 0, and there is none.' },
        { text: 'KeyError', why: '' },
      ],
      answer: 2,
      explain: 'The square brackets hold a key. No key is 0, so Python stops with a KeyError.',
      hints: ['What goes inside the square brackets of a dict?', 'Is 0 one of the keys?'],
    },
    { id: 'fix-phone-book', type: 'fix', level: 2,
      q: 'The function `find` should give 0 when a name is missing. It stops with a KeyError. Fix it.',
      code: 'phones = {"Mia": 5551, "Sam": 5552}\n\ndef find(name):\n    return phones[name]',
      answer: 'phones = {"Mia": 5551, "Sam": 5552}\n\ndef find(name):\n    return phones.get(name, 0)',
      tests: [
        { label: 'find("Mia") gives 5551', call: 'find("Mia")', want: '5551' },
        { label: 'find("Zed") gives 0', call: 'find("Zed")', want: '0' },
      ],
      explain: '`get` gives the value when the key is there, and the backup when it is not.',
      hints: ['Which tool has a backup value?', 'Use `phones.get(name, 0)` in place of `phones[name]`.'],
    },
    { id: 'write-pets', type: 'write', level: 2,
      q: 'Make a dict called `pets`. The key "cat" has the value 2. The key "dog" has the value 1. Then print the value for "cat".',
      starter: 'pets = {}\n',
      answer: 'pets = {"cat": 2, "dog": 1}\nprint(pets["cat"])',
      tests: [{ label: 'pets has both pairs', check: 'pets == {"cat": 2, "dog": 1}' }],
      wantOutput: '2',
      explain: 'Curly brackets hold the pairs, and square brackets look up a key.',
      hints: ['A pair looks like `"cat": 2`.', 'Put a comma between the pairs.', 'To print, use `pets["cat"]`.'],
    },
    { id: 'write-best-score', type: 'write', level: 3,
      q: 'Write `best(points)`. It gets a dict of names and scores. It gives back the name with the top score.',
      starter: 'def best(points):\n    # Your code here. pass means: do nothing yet.\n    pass\n',
      answer: 'def best(points):\n    top_name = None\n    top_score = None\n    for name, score in points.items():\n        if top_score is None or score > top_score:\n            top_name = name\n            top_score = score\n    return top_name',
      tests: [
        { label: 'Ben has the top score', call: 'best({"Ann": 4, "Ben": 7, "Cy": 5})', want: '"Ben"' },
        { label: 'Zoe is the only one', call: 'best({"Zoe": 1})', want: '"Zoe"' },
        { label: 'A low score can still win', call: 'best({"Ann": -3, "Ben": -1})', want: '"Ben"' },
      ],
      explain: 'Loop over the pairs and remember the best name so far. This is the "biggest" loop from module 3.',
      hints: ['Loop with `for name, score in points.items():`.', 'Keep 2 names: the best name so far and its score.', 'Start the best score at `None`, and check for it with `is None`. Scores can be below 0.'],
    },
  ],
});

Course.lesson('m06-dicts-sets', {
  id: '6-2-sets',
  num: '6.2',
  title: 'Sets: no repeats allowed',
  goal: 'You can remove repeats with a set and join 2 sets with `|` and `&`.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How do you keep each colour once?' },
    { t: 'p', text: 'Your friends name their top colours. Some pick the same one. You want each colour once.' },
    { t: 'analogy', title: 'Picture this', text: 'Think of a guest list for a party. Writing Ann twice does not bring 2 Anns. Unlike a paper list, this one keeps no order.' },
    { t: 'words', items: [
      { word: 'set', means: 'A group of things with no repeats and no order.' },
    ] },
    { t: 'viz', name: 'm06-set-add', caption: 'Watch what happens when "red" comes back.' },
    { t: 'p', text: 'A [[set]] drops repeats by itself. To clean up a list, hand the list to `set()`.' },
    { t: 'steps', title: 'Clean up a list', items: [
      { label: 'Start with the list', text: 'It can hold repeats.', code: 'colours = ["red", "blue", "red"]' },
      { label: 'Make a set', text: 'The repeats drop out. The list stays as it was.', code: 'unique = set(colours)' },
      { label: 'Use it', text: 'Count it, or sort it into a new list.', code: 'print(sorted(unique))' },
    ] },
    { t: 'code', caption: 'Run it. `sorted` puts the set in order so you can read it.',
      code: py`
        colours = ["red", "blue", "red", "green", "blue"]
        unique = set(colours)
        print(len(colours))
        print(len(unique))
        print(sorted(unique))
      `,
      output: "5\n3\n['blue', 'green', 'red']",
    },
    { t: 'q', id: 'set-repeats', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'nums = {2, 2, 2, 5}\nprint(len(nums))',
      options: [
        { text: '2', why: '' },
        { text: '4', why: 'A set does not keep repeats. The three 2s count as one thing.' },
        { text: '1', why: 'Only the repeats go away. 2 and 5 are different, so both stay.' },
      ],
      answer: 0,
      explain: 'The set holds 2 and 5. That is 2 things.',
      hints: ['Write the numbers down, but only once each.', 'How many different numbers are there?'],
    },
    { t: 'p', text: 'Curly brackets with no colons make a set. `add` puts one more thing in. `in` asks if something is there.' },
    { t: 'code', caption: 'Run it. Then add "cow" and guess what the last line prints.',
      code: py`
        seen = {"cat", "dog"}
        seen.add("fish")
        seen.add("cat")
        print(len(seen))
        print("cat" in seen)
        print("cow" in seen)
      `,
      output: '3\nTrue\nFalse',
    },
    { t: 'trap', think: 'A set keeps things in the order you typed them.', real: 'A set promises no order. A set of words can print in a new order when you reload this page. Use `sorted` when order matters.' },
    { t: 'q', id: 'set-no-spots', type: 'predict', level: 2,
      q: 'What happens when this runs?',
      code: 's = {"a", "b"}\nprint(s[0])',
      expectError: true,
      options: [
        { text: 'a', why: 'A list has spot numbers, but a set has none. It keeps no order.' },
        { text: 'b', why: 'A set has no spots, so nothing is first or second.' },
        { text: 'TypeError', why: '' },
      ],
      answer: 2,
      explain: 'A set has no spot numbers. Python stops with a TypeError when you ask for one.',
      hints: ['Does a set keep things in order?', 'If there is no order, what would spot 0 mean?'],
    },
    { t: 'tip', title: 'An empty set needs set()', text: '`{}` makes an empty dict, not an empty set. Write `set()` for an empty set.' },
    { t: 'h', text: 'How do you join 2 sets?' },
    { t: 'words', items: [
      { word: 'union', means: 'Everything from both groups, with no repeats.', say: 'YOON-yun' },
      { word: 'intersection', means: 'Only the things that are in both groups.', say: 'in-ter-SEK-shun' },
    ] },
    { t: 'viz', name: 'm06-set-join', caption: 'Ben and Cy go to both clubs. Guess each answer first.' },
    { t: 'table', caption: 'Two [[operator]] symbols for sets', head: ['Code', 'Name', 'You get'],
      rows: [
        ['`a | b`', '[[union]]', 'Things in `a` or in `b`'],
        ['`a & b`', '[[intersection]]', 'Things in both `a` and `b`'],
      ],
    },
    { t: 'tip', title: 'A way to remember', text: 'Read `|` as "or". Read `&` as "and". The `|` key is often above Enter, and you press Shift for it.' },
    { t: 'code', caption: 'Run it. Then add "Eli" to music and guess what changes.',
      code: py`
        art = {"Ann", "Ben", "Cy"}
        music = {"Ben", "Cy", "Dee"}
        print(sorted(art | music))
        print(sorted(art & music))
      `,
      output: "['Ann', 'Ben', 'Cy', 'Dee']\n['Ben', 'Cy']",
    },
    { t: 'q', id: 'count-join', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'a = {1, 2, 3}\nb = {3, 4}\nprint(len(a | b))\nprint(len(a & b))',
      options: [
        { text: '5\n1', why: 'A union has no repeats. The 3 is in both sets, but it counts once.' },
        { text: '4\n1', why: '' },
        { text: '1\n4', why: 'These two are swapped. The `|` gives everything, and `&` gives only what they share.' },
      ],
      answer: 1,
      explain: 'The union is 1, 2, 3 and 4. The intersection is only 3.',
      hints: ['Write out `a | b` first. Do not write 3 twice.', 'Which number is in both sets?'],
    },
    { t: 'q', id: 'fill-both-pets', type: 'fill', level: 2,
      q: 'Fill the gap to print the people who have a cat and a dog.',
      code: 'cats = {"Mia", "Sam", "Zoe"}\ndogs = {"Sam", "Zoe", "Lee"}\nprint(sorted(cats ____ dogs))',
      blanks: ['&'],
      output: "['Sam', 'Zoe']",
      explain: 'The `&` keeps only the names in both sets.',
      why: 'You want only the people in both sets. Which symbol reads as "and"?',
      hints: ['"Both" is the clue.', 'Read `&` as "and".'],
    },
    { t: 'tip', title: 'One more: take away', text: 'The code `a - b` gives the things in `a` that are not in `b`. Try it in the box above.' },
    { t: 'tip', title: 'Why a set is quick', text: 'To use `in`, a list looks at items one by one. A set goes almost straight there, most of the time. You will learn to measure this in module 8.' },
    { t: 'big', text: 'A set holds each thing once. Use it when you only care if something is there.' },
  ],
  recap: [
    'You can remove repeats with `set()`.',
    'You can get everything from 2 sets with `|`.',
    'You can get what 2 sets share with `&`.',
  ],
  practice: [
    { id: 'match-set-tools', type: 'match', level: 1,
      q: 'Match each piece of code to what it gives you.',
      pairs: [
        ['`a | b`', 'Everything from both sets'],
        ['`a & b`', 'Only what both sets share'],
        ['`set(nums)`', 'The items of a list, with no repeats'],
        ['`{}`', 'An empty dict'],
      ],
      explain: 'Read `|` as "or" and `&` as "and". An empty set needs `set()`, because `{}` is a dict.',
      hints: ['Which symbol reads as "and"?', 'Curly brackets with nothing inside make a dict.'],
    },
    { id: 'join-makes-new', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'a = {1, 2}\nb = {3}\nc = a | b\nprint(len(a))\nprint(len(c))',
      options: [
        { text: '3\n3', why: 'The `|` makes a new set and leaves `a` alone. It does not change `a`.' },
        { text: '2\n3', why: '' },
        { text: '2\n2', why: 'The new set `c` has everything from both sets. That is 3 things.' },
      ],
      answer: 1,
      explain: 'The name `c` gets a new set with 3 things. The set `a` still has 2.',
      hints: ['Does `a | b` change `a`?', 'Which name is the new set stuck on?'],
    },
    { id: 'order-count-different', type: 'order', level: 2,
      q: 'Put the lines in order. The program prints how many different words there are.',
      lines: ['words = ["hi", "yo", "hi"]', 'unique = set(words)', 'print(len(unique))'],
      extra: ['print(len(words))'],
      output: '2',
      explain: 'First make the list, then make a set from it, then count the set.',
      hints: ['You cannot use a name before it exists.', 'Count the set, not the list.'],
    },
    { id: 'which-tool', type: 'mcq', level: 2,
      q: 'You only want to know if a name is on the guest list. Which tool fits best?',
      options: [
        { text: 'A set', why: '' },
        { text: 'A list', why: 'A list works, but it keeps repeats and looks at names one by one.' },
        { text: 'A dict', why: 'A dict is for pairs. Here you have names and nothing to pair them with.' },
      ],
      answer: 0,
      explain: 'A set holds each name once, and `in` tells you if a name is there.',
      hints: ['Do you need a value for each name?', 'Do you need an order?'],
    },
    { id: 'fix-both-clubs', type: 'fix', level: 2,
      q: 'The function `both` should give only what 2 sets share. It gives too much. Fix it.',
      code: 'def both(a, b):\n    return a | b',
      answer: 'def both(a, b):\n    return a & b',
      tests: [
        { label: 'both({1, 2}, {2, 3}) gives {2}', call: 'both({1, 2}, {2, 3})', want: '{2}' },
        { label: 'Nothing shared gives an empty set', call: 'both({1}, {2})', want: 'set()' },
      ],
      explain: 'The `|` gives everything, and the `&` gives only what the sets share.',
      hints: ['Which symbol reads as "and"?', 'Swap `|` for `&`.'],
    },
    { id: 'write-count-different', type: 'write', level: 2,
      q: 'Write `how_many(items)`. It gets a list and gives back how many different items it has.',
      starter: 'def how_many(items):\n    # Your code here. pass means: do nothing yet.\n    pass\n',
      answer: 'def how_many(items):\n    return len(set(items))',
      tests: [
        { label: '"a", "b", "a" has 2 different items', call: 'how_many(["a", "b", "a"])', want: '2' },
        { label: 'An empty list has 0', call: 'how_many([])', want: '0' },
        { label: 'Three 7s count as 1', call: 'how_many([7, 7, 7])', want: '1' },
      ],
      explain: '`set()` drops the repeats, and `len` counts what is left.',
      hints: ['Make a set from the list first.', 'Use `len` on the set.'],
    },
    { id: 'write-only-first', type: 'write', level: 3,
      q: 'Write `only_first(a, b)`. It gets 2 lists. It gives back a sorted list of the things in `a` but not in `b`. The list has no repeats.',
      starter: 'def only_first(a, b):\n    # Your code here. pass means: do nothing yet.\n    pass\n',
      answer: 'def only_first(a, b):\n    return sorted(set(a) - set(b))',
      tests: [
        { label: 'Repeats and shared items go away', call: 'only_first([1, 2, 2, 3], [2])', want: '[1, 3]' },
        { label: 'All shared gives an empty list', call: 'only_first(["a"], ["a"])', want: '[]' },
        { label: 'The answer is sorted', call: 'only_first([3, 1, 2], [])', want: '[1, 2, 3]' },
      ],
      explain: 'Turn both lists into sets, take away with `-`, then sort the answer into a list.',
      hints: ['The `-` works on sets, not on lists.', 'Make `set(a)` and `set(b)` first.', '`sorted` gives you back a list.'],
    },
  ],
});

Course.lesson('m06-dicts-sets', {
  id: '6-3-counting',
  num: '6.3',
  title: 'Counting with a dict',
  goal: 'You can count with a dict, `Counter` or `defaultdict`, and say why lists cannot be keys.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How many of each letter?' },
    { t: 'p', text: 'You want to count the letters in "banana". You do not know which letters will come. A [[dict]] can grow as you go.' },
    { t: 'q', id: 'first-count-fails', type: 'predict', level: 2,
      q: 'Here is a first try. What happens when this runs?',
      code: 'counts = {}\ncounts["a"] = counts["a"] + 1\nprint(counts)',
      expectError: true,
      options: [
        { text: "{'a': 1}", why: 'Python works out the right side first. There is no "a" key to read yet.' },
        { text: "{'a': 0}", why: 'A dict does not start a new key at 0 by itself. It stops with an error.' },
        { text: 'KeyError', why: '' },
      ],
      answer: 2,
      explain: 'The right side runs first. It reads `counts["a"]`, and that key is not there yet.',
      hints: ['Which side of `=` runs first?', 'What does the dict hold at the start?'],
    },
    { t: 'steps', title: 'The counting recipe', items: [
      { label: 'Start empty', text: 'Make a dict with no pairs.', code: 'counts = {}' },
      { label: 'Visit each thing', text: 'A `for` loop gives you one letter at a time.', code: 'for ch in "banana":' },
      { label: 'Add 1', text: 'The `get` gives 0 the first time, and the count so far after that.', code: 'counts[ch] = counts.get(ch, 0) + 1' },
    ] },
    { t: 'viz', name: 'm06-count-letters', caption: 'Step through it. Then type your own word and watch again.' },
    { t: 'code', caption: 'Run it. Then change the word to your own name.',
      code: py`
        counts = {}
        for ch in "banana":
            counts[ch] = counts.get(ch, 0) + 1
        print(counts)
      `,
      output: "{'b': 1, 'a': 3, 'n': 2}",
    },
    { t: 'q', id: 'trace-count', type: 'trace', level: 2,
      q: 'Follow the loop. Write `ch` and its count after each trip.',
      code: 'counts = {}\nfor ch in "aba":\n    counts[ch] = counts.get(ch, 0) + 1\n    print(ch, counts[ch])',
      head: ['ch', 'counts[ch]'],
      rows: [['a', '1'], ['b', '1'], ['a', '2']],
      given: 1,
      verify: 'counts = {}\nfor ch in "aba":\n    counts[ch] = counts.get(ch, 0) + 1\n    print(ch, counts[ch])',
      explain: 'The letter a comes back on the third trip. Its count goes from 1 to 2.',
      hints: ['The count for b starts at 0, not at the count for a.', 'Each key has its own count.'],
    },
    { t: 'h', text: 'Can Python do the counting for you?' },
    { t: 'words', items: [
      { word: 'Counter', means: 'A kind of dict that counts things for you.' },
      { word: 'defaultdict', means: 'A kind of dict that fills in a missing key by itself.', say: 'dee-FAULT-dikt' },
      { word: 'hashable', means: 'Safe to use as a dict key or a set item, because it cannot change.', say: 'HASH-uh-bul' },
    ] },
    { t: 'p', text: 'People count things all the time, so Python has ready-made tools. You bring them in with [[import]]. [[Counter]] does the whole recipe in one line.' },
    { t: 'code', caption: 'Run it. `most_common(1)` gives the top 1 thing and its count.',
      code: py`
        from collections import Counter
        letters = Counter("banana")
        print(letters)
        print(letters["a"])
        print(letters["z"])
        print(letters.most_common(1))
      `,
      output: "Counter({'a': 3, 'n': 2, 'b': 1})\n3\n0\n[('a', 3)]",
    },
    { t: 'q', id: 'counter-missing', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'from collections import Counter\nc = Counter(["hi", "yo", "hi"])\nprint(c["hi"])\nprint(c["no"])',
      options: [
        { text: '2\n0', why: '' },
        { text: '1\n0', why: 'Look again at the list. "hi" is in it 2 times, and `Counter` counts each one.' },
        { text: '2\nNone', why: 'A `Counter` gives 0 for something it never saw. It has counted none of them.' },
      ],
      answer: 0,
      explain: '"hi" came 2 times and "no" came 0 times. A `Counter` gives 0 for a missing key.',
      hints: ['How many times is "hi" in the list?', 'How many times is "no" in the list?'],
    },
    { t: 'p', text: 'A [[defaultdict]] fills in a missing key by itself. You tell it how to start. `int` starts at 0, and `list` starts with an empty list.' },
    { t: 'code', caption: 'Run it. `dict(...)` turns the answer into a plain dict for printing.',
      code: py`
        from collections import defaultdict
        counts = defaultdict(int)
        for ch in "banana":
            counts[ch] = counts[ch] + 1
        print(dict(counts))
        groups = defaultdict(list)
        for word in ["ant", "bee", "ape"]:
            groups[word[0]].append(word)
        print(dict(groups))
      `,
      output: "{'b': 1, 'a': 3, 'n': 2}\n{'a': ['ant', 'ape'], 'b': ['bee']}",
    },
    { t: 'table', caption: 'What each tool does with a missing key', head: ['Code', 'You get', 'Adds the key?'],
      rows: [
        ['`d["x"]`', 'A KeyError', 'No'],
        ['`d.get("x", 0)`', 'The backup, 0', 'No'],
        ['`Counter()["x"]`', '0', 'No'],
        ['`defaultdict(int)["x"]`', '0', 'Yes'],
      ],
    },
    { t: 'h', text: 'Why can a list not be a key?' },
    { t: 'analogy', title: 'Picture this', text: 'Think of the coat check again. What if your ticket number kept changing? The helper would go to the wrong hook. So a key must not change.' },
    { t: 'p', text: 'Python turns each key into a spot number. The recipe for this is called a [[hash]]. A key must be [[hashable]]: it must stay the same. Module 11 shows you more.' },
    { t: 'viz', name: 'm06-hashable-keys', caption: 'This is a first look. You do not need the details yet.' },
    { t: 'code', caption: 'A tuple cannot change, so it works as a key.',
      code: py`
        spots = {}
        spots[(1, 2)] = "tree"
        print(spots[(1, 2)])
      `,
      output: 'tree',
    },
    { t: 'code', caption: 'A list can change, so Python stops here. "unhashable" means it cannot be a key.',
      code: py`
        spots = {}
        spots[[1, 2]] = "tree"
      `,
      error: true,
    },
    { t: 'q', id: 'which-not-key', type: 'mcq', level: 2,
      q: 'Which one can NOT be a dict key?',
      options: [
        { text: '`"cat"`', why: 'A string cannot change, so it makes a good key.' },
        { text: '`(1, 2)`', why: 'A tuple of numbers cannot change, so it is hashable.' },
        { text: '`[1, 2]`', why: '' },
        { text: '`7`', why: 'A number cannot change, so it makes a good key.' },
      ],
      answer: 2,
      explain: 'A list can change, so it is not [[hashable]]. Python stops with a TypeError.',
      hints: ['Which of these can you change after you make it?', 'You can `append` to one of them.'],
    },
    { t: 'big', text: 'To count things, use the thing as the key and its count as the value.' },
  ],
  recap: [
    'You can count things with `get` and a dict.',
    'You can use `Counter` and `defaultdict` to save work.',
    'You can say why a list cannot be a key.',
  ],
  practice: [
    { id: 'match-counting', type: 'match', level: 1,
      q: 'Match each tool to what it does.',
      pairs: [
        ['`counts.get(ch, 0)`', 'Gives the count so far, or 0'],
        ['`Counter("aab")`', 'Counts every letter in one go'],
        ['`defaultdict(int)`', 'Starts each missing key at 0'],
        ['`defaultdict(list)`', 'Starts each missing key with an empty list'],
      ],
      explain: 'Each tool saves you from a KeyError in its own way.',
      hints: ['Which one counts in one go, with no loop?', '`int` means start at 0.'],
    },
    { id: 'most-common', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'from collections import Counter\nc = Counter("hello")\nprint(c.most_common(1))',
      options: [
        { text: "[('l', 2)]", why: '' },
        { text: 'l', why: 'The tool `most_common` gives a list of pairs, not one letter.' },
        { text: "[('h', 1)]", why: 'The biggest count comes first. "h" comes first in the word, but "l" has the top count.' },
      ],
      answer: 0,
      explain: 'The letter l comes 2 times, more than any other. You get a list with one pair in it.',
      hints: ['Which letter comes the most times in "hello"?', 'Look back at what `most_common(1)` printed for "banana".'],
    },
    { id: 'defaultdict-adds', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: 'from collections import defaultdict\nd = defaultdict(int)\nprint(d["x"])\nprint(len(d))',
      options: [
        { text: '0\n1', why: '' },
        { text: '0\n0', why: 'That is what `get` does. A `defaultdict` adds the missing key when you look at it.' },
        { text: 'None\n0', why: 'The `int` tells it to start at 0, not `None`. It also adds the key.' },
      ],
      answer: 0,
      explain: 'Looking at a missing key adds it, with the value 0. So the dict now has 1 pair.',
      hints: ['Think of the lesson table about missing keys.', 'Does a `defaultdict` add the key?'],
    },
    { id: 'fix-word-count', type: 'fix', level: 2,
      q: 'The function `count` should count the words in a list. It stops with a KeyError. Fix it.',
      code: 'def count(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts[w] + 1\n    return counts',
      answer: 'def count(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts',
      tests: [
        { label: '"a", "b", "a" gives a: 2 and b: 1', call: 'count(["a", "b", "a"])', want: '{"a": 2, "b": 1}' },
        { label: 'An empty list gives an empty dict', call: 'count([])', want: '{}' },
      ],
      explain: 'The first time, `counts[w]` is not there. `get` gives 0 for that first time.',
      hints: ['Which part reads a key that may be missing?', 'Use `counts.get(w, 0)` on the right side.'],
    },
    { id: 'fill-group-list', type: 'fill', level: 2,
      q: 'Fill the gap so each key starts with an empty list.',
      code: 'from collections import defaultdict\ngroups = defaultdict(____)\nfor n in [1, 2, 3, 4]:\n    groups[n % 2].append(n)\nprint(dict(groups))',
      blanks: ['list'],
      output: '{1: [1, 3], 0: [2, 4]}',
      explain: 'The `list` tells it to start each new key with an empty list. Then `append` works.',
      why: 'The code calls `append`. Which kind of thing has `append`?',
      hints: ['You do not type brackets here.', 'What kind of thing can you `append` to?'],
    },
    { id: 'write-word-counter', type: 'write', level: 2,
      q: 'Write `count_words(text)`. It splits the text into words and gives back a dict of word counts.',
      starter: 'def count_words(text):\n    # Your code here. pass means: do nothing yet.\n    pass\n',
      answer: 'def count_words(text):\n    counts = {}\n    for word in text.split():\n        counts[word] = counts.get(word, 0) + 1\n    return counts',
      tests: [
        { label: '"hi yo hi" gives hi: 2 and yo: 1', call: 'count_words("hi yo hi")', want: '{"hi": 2, "yo": 1}' },
        { label: '"a" gives a: 1', call: 'count_words("a")', want: '{"a": 1}' },
      ],
      explain: '`split` gives you the words. Then the counting recipe does the rest.',
      hints: ['`text.split()` gives a list of words.', 'Use the same recipe as the letters.', '`Counter` works here too.'],
    },
    { id: 'write-first-single', type: 'write', level: 3,
      q: 'Write `first_single(word)`. It gives back the first letter that comes only once. If there is none, it gives back `None`.',
      starter: 'def first_single(word):\n    # Your code here. pass means: do nothing yet.\n    pass\n',
      answer: 'from collections import Counter\n\ndef first_single(word):\n    counts = Counter(word)\n    for ch in word:\n        if counts[ch] == 1:\n            return ch\n    return None',
      tests: [
        { label: 'In "swiss", w is the first single letter', call: 'first_single("swiss")', want: '"w"' },
        { label: 'In "cat", c is the first single letter', call: 'first_single("cat")', want: '"c"' },
        { label: '"aabb" has none', call: 'first_single("aabb") is None', want: 'True' },
      ],
      explain: 'First count every letter. Then walk the word in order, and stop at the first count of 1.',
      hints: ['You need 2 loops, or `Counter` and 1 loop.', 'Count first, then loop over the word again.', 'Use `return` as soon as a count is 1.'],
    },
  ],
});
