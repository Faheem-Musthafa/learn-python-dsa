/* Module 11: Hash Tables. Part 2 (First data structures and algorithms). */
Course.module({
  id: 'm11-hash-tables',
  num: 11, part: 2, level: 'I',
  title: 'Hash Tables',
  blurb: 'See how a dict finds a key so fast, then use that speed to solve real problems.',
  needs: ['m06-dicts-sets', 'm08-big-o', 'm10-searching'],
});

// ---------------------------------------------------------------- lesson 11.1
Course.lesson('m11-hash-tables', {
  id: '11-1-hash-functions',
  num: '11.1',
  title: 'Hash functions and collisions',
  goal: 'You can work out a key\'s bucket by hand and explain a collision.',
  mins: 13,
  steps: [
    { t: 'h', text: 'How does a dict go straight to a key?' },
    { t: 'p', text: 'Linear search looks at every item. Binary search needs a sorted list. A [[dict]] needs neither, and it usually goes straight to the key.' },
    { t: 'q', id: 'which-rule', type: 'mcq', level: 1,
      q: 'A coat check has 5 numbered hooks. Which rule lets the helper find your coat again in one look?',
      options: [
        { text: 'Pick a hook at random', why: 'A random pick gives a new hook next time. The helper would not know where to look.' },
        { text: 'Use the next free hook', why: 'That puts the coat away. But later the helper must check hook after hook.' },
        { text: 'Work out the hook from your name', why: '' },
      ],
      answer: 2,
      explain: 'The same name gives the same hook every time. So the helper can work it out again later.',
      hints: ['The helper must find the same hook later.', 'Which rule gives the same hook twice?'],
    },
    { t: 'analogy', title: 'Picture this', text: 'Think of the coat check from module 6. This helper has a rule: your name gives your hook number. Unlike a real coat check, nobody hands out tickets. The key itself gives the number.' },
    { t: 'words', items: [
      { word: 'hash function', means: 'A recipe that turns a key into a number. The same key always gives the same number.' },
      { word: 'bucket', means: 'One numbered spot in a hash table, like one hook at the coat check.' },
    ] },
    { t: 'p', text: 'A [[hash table]] is a row of [[buckets|bucket]]. A [[hash function]] picks the bucket for each key. Here is a recipe we made up for this course.' },
    { t: 'steps', title: 'Our teaching recipe for "cat" with 5 buckets', items: [
      { label: 'Get a code for each letter', text: 'Every letter has a code number. `ord` gives you that number.', code: 'ord("c")   # 99\nord("a")   # 97\nord("t")   # 116' },
      { label: 'Add the codes', text: 'The total for "cat" is 312.', code: '99 + 97 + 116   # 312' },
      { label: 'Fit it to the buckets', text: 'The `%` gives what is left after dividing. With 5 buckets, the answer is always 0 to 4.', code: '312 % 5   # 2' },
    ] },
    { t: 'viz', name: 'm11-hash-function', caption: 'Guess each time it asks. Then type your own key. Try a capital letter, or no letters at all.' },
    { t: 'code', caption: 'Run it. Then add a line for your own name.',
      code: py`
        def bucket_for(key, buckets):
            total = 0
            for ch in key:
                total = total + ord(ch)
            return total % buckets

        print(bucket_for("cat", 5))
        print(bucket_for("dog", 5))
        print(bucket_for("cat", 5))
        print(bucket_for("", 5))
      `,
      output: '2\n4\n2\n0',
    },
    { t: 'q', id: 'pick-bucket', type: 'predict', level: 2,
      q: 'Here, `ord("h")` is 104 and `ord("i")` is 105. What will the screen show?',
      code: py`
        total = ord("h") + ord("i")
        print(total % 5)
      `,
      options: [
        { text: '209', why: 'That is the total. The last step still has to fit it to the buckets with `%`.' },
        { text: '41', why: 'That is how many times 5 goes into 209. The `%` gives what is left, not that.' },
        { text: '4', why: '' },
      ],
      answer: 2,
      explain: '104 + 105 is 209. 5 goes into 209 41 times, with 4 left over.',
      hints: ['Add the 2 codes first.', 'What is 5 times 41? How far is that from 209?'],
    },
    { t: 'tip', title: 'Real recipes are different', text: 'Python has its own recipe, called `hash`. It mixes the letters far better than ours. Its answers for strings also change each time Python starts. So this course uses our recipe, to keep every answer the same.' },
    { t: 'h', text: 'What if 2 keys land in the same bucket?' },
    { t: 'q', id: 'cat-act', type: 'predict', level: 2,
      q: '"cat" and "act" have the same letters. What will the screen show?',
      code: py`
        def bucket_for(key, buckets):
            total = 0
            for ch in key:
                total = total + ord(ch)
            return total % buckets

        print(bucket_for("cat", 5))
        print(bucket_for("act", 5))
      `,
      options: [
        { text: '2\n2', why: '' },
        { text: '2\n3', why: 'You may think order matters. Adding gives the same total in any order.' },
        { text: '2\nKeyError', why: 'Nothing is wrong here. The recipe gives a bucket number for any string.' },
      ],
      answer: 0,
      explain: 'Both keys add up to 312, so both go to bucket 2.',
      hints: ['Is 99 + 97 + 116 the same as 97 + 99 + 116?'],
    },
    { t: 'words', items: [
      { word: 'collision', means: 'When 2 different keys land in the same bucket.', say: 'kuh-LIZH-un' },
    ] },
    { t: 'trap',
      think: 'A [[collision]] is an error, so the program will crash.',
      real: 'A collision is normal. There are far more possible keys than buckets, so some keys must share. Every hash table plans for it.',
    },
    { t: 'p', text: 'Think of 2 coats on one hook. The helper goes to the hook, then reads the name tags. That is the first way to handle a [[collision]].' },
    { t: 'viz', name: 'm11-chain', caption: 'Watch "act" join "cat". Then change Find to a key that is not there.' },
    { t: 'code', caption: 'Here is "share the bucket" in code. Each bucket is a list. Run it, then add "owl" to the keys.',
      code: py`
        def bucket_for(key, buckets):
            total = 0
            for ch in key:
                total = total + ord(ch)
            return total % buckets

        buckets = [[] for i in range(5)]
        for key in ["cat", "dog", "act"]:
            b = bucket_for(key, 5)
            buckets[b].append(key)
        print(buckets)
        print("act" in buckets[bucket_for("act", 5)])
        print("emu" in buckets[bucket_for("emu", 5)])
      `,
      output: "[[], [], ['cat', 'act'], [], ['dog']]\nTrue\nFalse",
    },
    { t: 'q', id: 'count-looks-share', type: 'mcq', level: 2,
      q: 'Count by hand. Bucket 2 holds "cat", then "act". Bucket 4 holds "dog". How many looks to find "act"?',
      options: [
        { text: '1', why: 'The recipe finds the bucket, not the key. You still check the keys inside it.' },
        { text: '2', why: '' },
        { text: '3', why: 'You never visit bucket 4. The recipe sends you straight to bucket 2.' },
      ],
      answer: 1,
      explain: 'First you look at "cat", and it does not match. Then you look at "act". That is 2 looks.',
      hints: ['Which bucket does the recipe send you to?', 'Check each key in that bucket, in order.'],
    },
    { t: 'p', text: 'Now each bucket holds one key. If a bucket is taken, the key walks on to the next. At the end, it wraps around.' },
    { t: 'viz', name: 'm11-probe', caption: 'Watch "owl" walk past 2 taken buckets. Then see why an empty bucket means "stop".' },
    { t: 'table', caption: '2 ways to handle a collision', head: ['Way', 'Putting a key in', 'Finding a key'],
      rows: [
        ['Share the bucket', 'The key joins the list in its bucket.', 'Check each key in that one bucket.'],
        ['Try the next bucket', 'Walk on until a bucket is free.', 'Walk the same path, and stop at an empty bucket.'],
      ],
    },
    { t: 'q', id: 'empty-means-stop', type: 'mcq', level: 2,
      q: 'You use "try the next bucket". You look for a key and reach an empty bucket. Why can you stop?',
      options: [
        { text: 'The key would have stopped there when it went in.', why: '' },
        { text: 'The table is full.', why: 'An empty bucket means it is not full. There is still room.' },
        { text: 'Empty buckets end the table.', why: 'The table goes on after it. But your key cannot be past this spot.' },
      ],
      answer: 0,
      explain: 'A key walks only until it finds a free bucket. So it cannot be past an empty one.',
      hints: ['Think about the path the key took when it went in.'],
    },
    { t: 'cost', title: 'How many looks does it take?', items: [
      { op: 'Work out the bucket', cost: 'O(1)', why: 'The steps depend on the letters in the key, not on how many keys you store.' },
      { op: 'Find a key, with keys spread out', cost: 'A few looks', why: 'You check only the few keys near that bucket.' },
      { op: 'Find a key, with every key in one bucket', cost: 'O(n)', why: 'You may check every key. Lesson 11.2 looks at this.' },
    ] },
    { t: 'big', text: 'The same key always gives the same bucket. That is how Python goes straight there.' },
  ],
  recap: [
    'You can work out a bucket with the codes and `%`.',
    'You can say why 2 keys may share a bucket.',
    'You can name 2 ways to handle a collision.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[hash function]]', 'A recipe that turns a key into a number'],
        ['[[bucket]]', 'One numbered spot in a hash table'],
        ['[[collision]]', 'Two different keys land in one spot'],
        ['`%`', 'Gives what is left after dividing'],
      ],
      explain: 'The recipe makes a number. The `%` fits it to the buckets. Sometimes 2 keys land together.',
      hints: ['Which one is a symbol you type?', 'Which one is a thing that happens, not a thing you make?'],
    },
    { id: 'remainder-fits', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'print(10 % 4)\nprint(8 % 4)',
      options: [
        { text: '2\n0', why: '' },
        { text: '2\n2', why: 'That is `//`, how many times 4 goes in. The `%` gives what is left over.' },
        { text: '2.5\n2.0', why: 'That is `/`, plain dividing. The `%` gives what is left over.' },
      ],
      answer: 0,
      explain: '4 goes into 10 twice, with 2 left over. 4 goes into 8 exactly, with 0 left over.',
      hints: ['What is 2 times 4? How far is that from 10?'],
    },
    { id: 'random-recipe', type: 'mcq', level: 2,
      q: 'A friend writes a recipe that picks a random bucket for each key. What goes wrong?',
      options: [
        { text: 'Too many keys land in one bucket.', why: 'Random picks spread keys quite well. The trouble comes when you look for one.' },
        { text: 'Python stops with an error.', why: 'A random number is a fine bucket number, so nothing stops. The trouble is finding the key later.' },
        { text: 'The same key gets a new bucket next time, so you cannot find it.', why: '' },
      ],
      answer: 2,
      explain: 'A hash function must give the same number for the same key. If not, the key is lost.',
      hints: ['What happens when you look for that key later?'],
    },
    { id: 'fix-total', type: 'fix', level: 2,
      q: '`bucket_for("dog", 5)` should give 4. It gives the wrong bucket. Fix the function.',
      code: 'def bucket_for(key, buckets):\n    total = 0\n    for ch in key:\n        total = ord(ch)\n    return total % buckets',
      answer: 'def bucket_for(key, buckets):\n    total = 0\n    for ch in key:\n        total = total + ord(ch)\n    return total % buckets',
      tests: [
        { label: '"dog" with 5 buckets gives 4', call: 'bucket_for("dog", 5)', want: '4' },
        { label: '"cat" with 5 buckets gives 2', call: 'bucket_for("cat", 5)', want: '2' },
        { label: 'An empty key gives 0', call: 'bucket_for("", 5)', want: '0' },
      ],
      explain: 'The bug replaces the total on each trip, so only the last letter counts. Each code must add to the total.',
      hints: ['What is in `total` after the loop? Follow it for 2 letters.', 'Each trip should add to the total, not replace it.'],
    },
    { id: 'trace-next', type: 'trace', level: 2,
      q: 'Follow the "try the next bucket" way. Fill in where each key starts and where it lands.',
      code: py`
        slots = [None] * 5
        for key, start in [("cat", 2), ("dog", 4),
                           ("act", 2), ("owl", 3)]:
            b = start
            while slots[b] is not None:
                b = (b + 1) % 5
            slots[b] = key
            print(key, start, b)
      `,
      head: ['key', 'start', 'lands'],
      rows: [['cat', '2', '2'], ['dog', '4', '4'], ['act', '2', '3'], ['owl', '3', '0']],
      given: 1,
      verify: 'slots = [None] * 5\nfor key, start in [("cat", 2), ("dog", 4), ("act", 2), ("owl", 3)]:\n    b = start\n    while slots[b] is not None:\n        b = (b + 1) % 5\n    slots[b] = key\n    print(key, start, b)',
      explain: '"act" finds bucket 2 taken and lands in 3. "owl" finds 3 and 4 taken, so it wraps to 0.',
      hints: ['Keep a list of which buckets are taken.', 'After bucket 4, the next bucket is 0.'],
    },
    { id: 'write-first-letter', type: 'write', level: 2,
      q: 'Write `by_first(key, buckets)`. It uses only the first letter: take its code, then use `%`. An empty key gives 0.',
      starter: 'def by_first(key, buckets):\n    # Your code here\n    pass\n',
      answer: 'def by_first(key, buckets):\n    if key == "":\n        return 0\n    return ord(key[0]) % buckets',
      tests: [
        { label: '"cat" with 5 buckets gives 4', call: 'by_first("cat", 5)', want: '4' },
        { label: '"cow" lands with "cat"', call: 'by_first("cow", 5)', want: '4' },
        { label: 'An empty key gives 0', call: 'by_first("", 5)', want: '0' },
      ],
      explain: 'This recipe works, but every word with the same first letter collides. Good recipes use every letter.',
      hints: ['`key[0]` is the first letter. An empty string has no spot 0.', 'Check for the empty key first.', '`ord(key[0]) % buckets` does the rest.'],
    },
    { id: 'write-fill-table', type: 'write', level: 3,
      q: 'Write `fill(keys, size)`. It gives back a list of `size` slots. Use the "try the next bucket" way, with `bucket_for`. Empty slots hold `None`. Assume every key fits.',
      starter: 'def bucket_for(key, buckets):\n    total = 0\n    for ch in key:\n        total = total + ord(ch)\n    return total % buckets\n\ndef fill(keys, size):\n    # Your code here\n    pass\n',
      answer: 'def bucket_for(key, buckets):\n    total = 0\n    for ch in key:\n        total = total + ord(ch)\n    return total % buckets\n\ndef fill(keys, size):\n    slots = [None] * size\n    for key in keys:\n        b = bucket_for(key, size)\n        while slots[b] is not None:\n            b = (b + 1) % size\n        slots[b] = key\n    return slots',
      tests: [
        { label: 'No collision', call: 'fill(["cat", "dog"], 5)', want: '[None, None, "cat", None, "dog"]' },
        { label: '"act" moves on to the next slot', call: 'fill(["cat", "act"], 5)', want: '[None, None, "cat", "act", None]' },
        { label: '"god" wraps around to slot 0', call: 'fill(["dog", "god"], 5)', want: '["god", None, None, None, "dog"]' },
        { label: 'No keys gives only empty slots', call: 'fill([], 2)', want: '[None, None]' },
      ],
      explain: 'Each key starts at its bucket and walks on while the slot is taken. The `%` makes it wrap around.',
      hints: ['Start with `slots = [None] * size`.', 'Use a `while` loop that runs while the slot is taken.', 'Move on with `b = (b + 1) % size`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 11.2
Course.lesson('m11-hash-tables', {
  id: '11-2-how-dict-works',
  num: '11.2',
  title: 'How dict and set work, and why O(1) is "average"',
  goal: 'You can say why finding a key is O(1) on average, and when it gets slower.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Is a dict always fast?' },
    { t: 'q', id: 'always-fast', type: 'mcq', level: 1,
      q: 'A table holds 1,000 keys. A poor recipe puts them all in one bucket. How many looks might you need?',
      options: [
        { text: '1', why: 'That is true when keys spread out. In one long bucket, you check keys one by one.' },
        { text: 'About 10', why: 'That is binary search, which needs sorted items. A bucket is not sorted.' },
        { text: '1,000', why: '' },
      ],
      answer: 2,
      explain: 'All the keys are in one bucket. So the key you want could be the last of 1,000.',
      hints: ['Does the recipe still help if every key gets the same bucket?'],
    },
    { t: 'words', items: [
      { word: 'chaining', means: 'Handling a collision by letting keys share a bucket, in a list.', say: 'CHAY-ning' },
      { word: 'probing', means: 'Handling a collision by trying other buckets until one is free.', say: 'PROH-bing' },
      { word: 'average case', means: 'The usual number of steps, shared out over many tries.' },
    ] },
    { t: 'p', text: 'You met 2 ways in lesson 11.1. "Share the bucket" is called [[chaining]]. "Try the next bucket" is called [[probing]]. Python uses probing, but it hops around in its own pattern.' },
    { t: 'h', text: 'Count the looks by hand' },
    { t: 'q', id: 'trace-looks', type: 'trace', level: 2,
      q: 'This table uses chaining. The first key in a bucket takes 1 look, and the next takes 2. Fill in the looks for each key.',
      code: py`
        buckets = [["cat", "pig"], ["fox"],
                   ["dog", "owl"], ["hen"]]
        for b in buckets:
            for i in range(len(b)):
                print(b[i], i + 1)
      `,
      head: ['key', 'looks'],
      rows: [['cat', '1'], ['pig', '2'], ['fox', '1'], ['dog', '1'], ['owl', '2'], ['hen', '1']],
      given: 1,
      verify: 'buckets = [["cat", "pig"], ["fox"], ["dog", "owl"], ["hen"]]\nfor b in buckets:\n    for i in range(len(b)):\n        print(b[i], i + 1)',
      explain: 'The looks add up to 8 for 6 keys. That is about 1.3 looks for each key.',
      hints: ['You skip the other buckets, so they do not count.', 'A key that is second in its bucket takes 2 looks.'],
    },
    { t: 'p', text: 'That 1.3 is the [[average case]]: the looks added up, then shared out over the keys. Some keys take 2 looks. None takes 6.' },
    { t: 'viz', name: 'm11-good-bad', caption: 'Compare the 2 recipes. Then try more buckets, and only 1 bucket.' },
    { t: 'h', text: 'Why do the buckets stay short?' },
    { t: 'p', text: 'More keys could mean longer buckets. So a table gets more buckets as it fills up. Below, our own rule is "double when full". Python has its own rule, and it grows sooner than that.' },
    { t: 'viz', name: 'm11-grow', caption: 'Watch "dog" move when the size changes. Then add a fifth key and watch it grow again.' },
    { t: 'q', id: 'why-move', type: 'mcq', level: 2,
      q: 'A table grows from 2 buckets to 4. Why must every key go in again?',
      options: [
        { text: 'The recipe uses `% size`, and the size changed.', why: '' },
        { text: 'Python tidies keys into sorted order.', why: 'A dict never sorts its keys. The new size is what changes the bucket numbers.' },
        { text: 'The old keys were deleted.', why: 'No key is lost. Each one goes to the bucket that fits the new size.' },
      ],
      answer: 0,
      explain: 'For example, 314 % 2 is 0, but 314 % 4 is 2. A key may need a new bucket.',
      hints: ['Look at the last line of the recipe. What does it divide by?'],
    },
    { t: 'tip', title: 'Is growing slow?', text: 'Yes, one grow moves every key. But it happens rarely, so the cost shared over all keys stays small. This is the same idea as [[amortized]] cost in module 8.' },
    { t: 'big', text: 'A good recipe and a growing table keep buckets short. That is why finding a key is O(1) on average.' },
    { t: 'cost', title: 'How fast is a dict or a set?', items: [
      { op: '`key in d`, `d[key]`, `d.get(key)`', cost: 'O(1) average', why: 'Keys spread out, so you check only a few.' },
      { op: '`d[key] = value`, `del d[key]`', cost: 'O(1) average', why: 'It finds the spot in the same way.' },
      { op: '`x in s`, `s.add(x)`', cost: 'O(1) average', why: 'A set is a hash table with keys and no values.' },
      { op: 'Any of these, if every key hashes the same', cost: 'O(n)', why: 'This is the [[worst case]]. You may check every key.' },
      { op: 'Loop over `d` or `s`', cost: 'O(n)', why: 'You visit every key once.' },
      { op: '`x in a_list`', cost: 'O(n)', why: 'A list has no recipe, so it checks item after item.' },
    ] },
    { t: 'h', text: 'What is Python\'s own recipe?' },
    { t: 'code', caption: 'Run it. `hash` is the recipe Python really uses. It stays the same while Python keeps running. A small whole number is its own hash.',
      code: py`
        print(hash("cat") == hash("cat"))
        print(hash((1, 2)) == hash((1, 2)))
        print(hash(7))
      `,
      output: 'True\nTrue\n7',
    },
    { t: 'trap',
      think: '`hash("cat")` is always the same number, so I can save it for later.',
      real: 'Python mixes a secret number into string hashes. It picks a new one each time Python starts. On this page, that means when you reload. So the same word can get a new hash later. Never save it.',
      code: 'print(hash("cat"))   # New number when Python restarts',
    },
    { t: 'q', id: 'hash-list', type: 'predict', level: 2,
      q: 'Remember lesson 6.3. What happens when this runs?',
      code: py`
        print(hash((1, 2)) == hash((1, 2)))
        print(hash([1, 2]))
      `,
      expectError: true,
      options: [
        { text: 'True\nTrue', why: 'The second line has no `==` in it, and a list has no hash at all.' },
        { text: 'True, then a TypeError', why: '' },
        { text: 'A TypeError on the first line', why: 'A tuple cannot change, so it is [[hashable]]. The first line works.' },
      ],
      answer: 1,
      explain: 'A list can change, so it is not [[hashable]]. Python stops with a TypeError.',
      hints: ['Which of these 2 can change: a tuple or a list?'],
    },
    { t: 'h', text: 'Can you see the worst case in a real dict?' },
    { t: 'p', text: 'Yes, if you force it. Python asks a key for its hash by calling `__hash__`. Then `__eq__` compares keys. So each `__eq__` call is one look, and we can count them.' },
    { t: 'code', caption: 'Each key has its own hash in `good`. Every key has hash 7 in `bad`. Guess both counts, then run it. Try 200 keys too.',
      code: py`
        looks = [0]

        class Key:
            def __init__(self, n, h):
                self.n = n
                self.h = h
            def __hash__(self):
                return self.h
            def __eq__(self, other):
                looks[0] = looks[0] + 1
                return self.n == other.n

        good = {}
        bad = {}
        for n in range(100):
            good[Key(n, n)] = n
            bad[Key(n, 7)] = n

        looks[0] = 0
        print(Key(99, 99) in good, looks[0])
        looks[0] = 0
        print(Key(99, 7) in bad, looks[0])
      `,
      output: 'True 1\nTrue 100',
    },
    { t: 'tip', title: 'Will this happen to you?', text: 'Almost never. Python\'s own recipe spreads strings, numbers and tuples well. So you can trust a dict to be fast.' },
    { t: 'trap',
      think: 'A dict keeps its keys in sorted order.',
      real: 'A dict keeps the order you added the keys. It does not sort them. A set promises no order at all.',
      code: 'print(list({"pear": 1, "apple": 2}))   # pear comes first',
    },
  ],
  recap: [
    'You can count looks by hand and work out the average.',
    'You can say when a dict gets slow.',
    'You can say why you should never save a string hash.',
  ],
  practice: [
    { id: 'match-terms', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[chaining]]', 'Keys share a bucket, in a list'],
        ['[[probing]]', 'Try other buckets until one is free'],
        ['[[average case]]', 'The usual steps, shared over many tries'],
        ['`hash`', 'The recipe Python itself uses'],
      ],
      explain: 'Chaining and probing are 2 ways to handle a collision. The average case is why we say O(1) with care.',
      hints: ['Which one means looking for a free spot?'],
    },
    { id: 'order-not-sorted', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: 'd = {"b": 1, "a": 2, "c": 3}\nprint(list(d))',
      options: [
        { text: "['a', 'b', 'c']", why: 'A dict does not sort its keys. It keeps the order you added them.' },
        { text: "['b', 'a', 'c']", why: '' },
        { text: '[1, 2, 3]', why: 'A list made from a dict holds the keys, not the values.' },
      ],
      answer: 1,
      explain: 'A dict keeps its keys in the order you added them.',
      hints: ['Which key went in first?'],
    },
    { id: 'which-is-slow', type: 'mcq', level: 2,
      q: 'Each of these holds a million items. Which job may take about a million steps?',
      options: [
        { text: '`x in a_set`', why: 'A set goes almost straight to the spot, on average. It is O(1) on average.' },
        { text: '`d[key]`', why: 'A dict goes almost straight to the key, on average. It is O(1) on average.' },
        { text: '`x in a_list`', why: '' },
      ],
      answer: 2,
      explain: 'A list has no recipe, so `in` checks item after item. That is O(n).',
      hints: ['Which one has no hash recipe?'],
    },
    { id: 'fix-list-key', type: 'fix', level: 2,
      q: '`mark(x, y)` should remember a spot on a map. It stops with a TypeError. Fix the key.',
      code: 'def mark(x, y):\n    spots = {}\n    spots[[x, y]] = "tree"\n    return spots',
      answer: 'def mark(x, y):\n    spots = {}\n    spots[(x, y)] = "tree"\n    return spots',
      tests: [
        { label: 'mark(1, 2) uses the tuple (1, 2) as its key', call: 'mark(1, 2)', want: '{(1, 2): "tree"}' },
        { label: 'mark(0, 0) works too', call: 'mark(0, 0)', want: '{(0, 0): "tree"}' },
      ],
      explain: 'A list can change, so it has no hash. A tuple cannot change, so it can be a key.',
      hints: ['Which kind of row cannot change?', 'Swap the square brackets of the key for round ones.'],
    },
    { id: 'write-average', type: 'write', level: 2,
      q: 'Write `average_looks(buckets)`. It gets a list of buckets. It gives back the average looks per key. No keys gives 0.',
      starter: 'def average_looks(buckets):\n    # Your code here\n    pass\n',
      answer: 'def average_looks(buckets):\n    total = 0\n    keys = 0\n    for b in buckets:\n        for i in range(len(b)):\n            total = total + i + 1\n            keys = keys + 1\n    if keys == 0:\n        return 0\n    return total / keys',
      tests: [
        { label: 'One key in each bucket gives 1', call: 'average_looks([["a"], ["b"]])', want: '1' },
        { label: '3 keys in one bucket gives 2', call: 'average_looks([["a", "b", "c"], []])', want: '2' },
        { label: 'The table from the lesson gives 8 / 6', call: 'average_looks([["cat", "pig"], ["fox"], ["dog", "owl"], ["hen"]])', want: '8 / 6' },
        { label: 'An empty table gives 0', call: 'average_looks([[], []])', want: '0' },
      ],
      explain: 'A key at index `i` takes `i + 1` looks. Add them all, then divide by the number of keys.',
      hints: ['Use 2 loops: one over the buckets, one over the keys.', 'A key at index `i` takes `i + 1` looks.', 'Check for 0 keys before you divide.'],
    },
    { id: 'lost-key', type: 'predict', level: 3,
      q: 'This key changes its hash after it goes in. What will the screen show?',
      code: py`
        class Key:
            def __init__(self, h):
                self.h = h
            def __hash__(self):
                return self.h

        k = Key(1)
        d = {k: "tree"}
        k.h = 2
        print(k in d)
        print(len(d))
      `,
      options: [
        { text: 'True\n1', why: 'Python looks in the bucket for the new hash. The pair sits in the old one.' },
        { text: 'False\n0', why: 'The pair is still in the dict. Python cannot find it, but it did not go away.' },
        { text: 'False\n1', why: '' },
      ],
      answer: 2,
      explain: 'The pair is still inside, but Python looks in the wrong place. This is why a key must not change.',
      hints: ['Where did the pair go in? Where does Python look now?', 'Does changing `k.h` take the pair out of the dict?'],
    },
    { id: 'write-worst', type: 'write', level: 3,
      q: 'Write `worst_looks(keys, size)`. It puts the keys in buckets with `bucket_for` and chaining. It gives back the size of the longest bucket. That is the worst case in looks.',
      starter: 'def bucket_for(key, buckets):\n    total = 0\n    for ch in key:\n        total = total + ord(ch)\n    return total % buckets\n\ndef worst_looks(keys, size):\n    # Your code here\n    pass\n',
      answer: 'def bucket_for(key, buckets):\n    total = 0\n    for ch in key:\n        total = total + ord(ch)\n    return total % buckets\n\ndef worst_looks(keys, size):\n    counts = [0] * size\n    for key in keys:\n        b = bucket_for(key, size)\n        counts[b] = counts[b] + 1\n    return max(counts)',
      tests: [
        { label: '"cat" and "act" share a bucket', call: 'worst_looks(["cat", "act", "dog"], 5)', want: '2' },
        { label: 'Spread-out keys give 1', call: 'worst_looks(["cat", "dog"], 5)', want: '1' },
        { label: 'One bucket holds them all', call: 'worst_looks(["cat", "dog", "owl"], 1)', want: '3' },
        { label: 'No keys gives 0', call: 'worst_looks([], 4)', want: '0' },
      ],
      explain: 'You only need a count for each bucket. The biggest count is the worst case.',
      hints: ['Start with `counts = [0] * size`.', 'Add 1 to the count for each key\'s bucket.', '`max` gives the biggest count.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 11.4 (bonus)
{
  const RECIPE = py`
    def bucket_for(key, size):
        total = 0
        for ch in key:
            total = total + ord(ch)
        return total % size
  `;
  const INIT = py`
    class HashMap:
        def __init__(self, size):
            self.buckets = [[] for i in range(size)]
  `;
  const PUT = `
    def put(self, key, value):
        b = bucket_for(key, len(self.buckets))
        for pair in self.buckets[b]:
            if pair[0] == key:
                pair[1] = value
                return
        self.buckets[b].append([key, value])`;
  const GET = `
    def get(self, key):
        b = bucket_for(key, len(self.buckets))
        for pair in self.buckets[b]:
            if pair[0] == key:
                return pair[1]
        return None`;
  const WHOLE = `${RECIPE}\n\n${INIT}\n${PUT}\n${GET}`;

  Course.lesson('m11-hash-tables', {
    id: '11-3-build-hashmap',
    num: '11.4',
    title: 'Build a tiny HashMap class',
    optional: true,
    goal: 'You can build a small hash table class with `put` and `get`, and handle a collision.',
    mins: 13,
    steps: [
      { t: 'h', text: 'Can you build your own dict?' },
      { t: 'p', text: 'You would never need to, because Python gives you `dict`. But building one shows you every step. This lesson uses [[chaining]], the "share the bucket" way.' },
      { t: 'q', id: 'spark-shared', type: 'predict', level: 2,
        q: 'You need a list of empty buckets. Remember lesson 5.5. What will the screen show?',
        code: py`
          buckets = [[]] * 3
          buckets[0].append("cat")
          print(buckets)
        `,
        options: [
          { text: "[['cat'], [], []]", why: 'You may think `* 3` makes 3 lists. It makes 3 names for 1 list.' },
          { text: "[['cat'], ['cat'], ['cat']]", why: '' },
          { text: "['cat', [], []]", why: '`append` adds inside the list at spot 0. It does not replace that spot.' },
        ],
        answer: 1,
        explain: 'All 3 spots name one list, so every bucket shows "cat". Make each bucket inside a loop.',
        hints: ['How many lists does `[[]] * 3` really make?', 'Think back to the grid of zeros.'],
      },
      { t: 'words', items: [
        { word: 'HashMap', means: 'Another name for a hash table with keys and values. A Python dict is one.', say: 'HASH-map' },
      ] },
      { t: 'analogy', title: 'Picture this', text: 'Back to the coat check. `put` hangs a coat on its hook, and `get` finds it again. Unlike a real helper, `get` leaves the coat on the hook.' },
      { t: 'steps', title: 'The plan for a HashMap', items: [
        { label: 'Make the buckets', text: 'Each bucket is its own empty list. The loop makes a new list each time.', code: 'self.buckets = [[] for i in range(size)]' },
        { label: 'Find the bucket', text: 'Both `put` and `get` start the same way, with our recipe.', code: 'b = bucket_for(key, len(self.buckets))' },
        { label: 'Check each pair', text: 'A bucket holds pairs, like `["cat", 3]`. Compare the key in each one.', code: 'for pair in self.buckets[b]:\n    if pair[0] == key:' },
        { label: 'Act on what you find', text: '`put` changes the value or adds a pair. `get` gives back the value or `None`.' },
      ] },
      { t: 'viz', name: 'm11-hashmap', caption: 'Follow the code as it runs. Then try your key as "cat", or use only 1 bucket.' },
      { t: 'code', caption: 'First, only the buckets and `put`. Run it and read the buckets. Which bucket holds 2 pairs?',
        code: `${RECIPE}\n\n${INIT}\n${PUT}\n\nm = HashMap(5)\nm.put("cat", 3)\nm.put("dog", 5)\nm.put("act", 7)\nprint(m.buckets)`,
        output: "[[], [], [['cat', 3], ['act', 7]], [], [['dog', 5]]]",
      },
      { t: 'code', caption: 'Here is the whole class, with `get`. Run it. Then add a key of your own and print it.',
        code: `${WHOLE}\n\nm = HashMap(5)\nm.put("cat", 3)\nm.put("act", 7)\nm.put("cat", 9)\nprint(m.get("cat"))\nprint(m.get("act"))\nprint(m.get("emu"))\nprint(m.buckets)`,
        output: "9\n7\nNone\n[[], [], [['cat', 9], ['act', 7]], [], []]",
      },
      { t: 'q', id: 'fill-replace', type: 'fill', level: 2,
        q: 'Fill the gaps so `put` changes the value when the key is already there.',
        code: 'bucket = [["cat", 3], ["act", 7]]\nkey = "act"\nvalue = 8\nfor pair in bucket:\n    if pair[____] == key:\n        pair[____] = value\nprint(bucket)',
        blanks: ['0', '1'],
        output: "[['cat', 3], ['act', 8]]",
        explain: 'Spot 0 of a pair holds the key. Spot 1 holds the value.',
        why: 'A pair looks like `["cat", 3]`. Which spot holds the key?',
        hints: ['The key comes first in a pair.', 'List counting starts at 0.'],
      },
      { t: 'q', id: 'order-find', type: 'order', level: 2,
        q: 'Put the lines in order. `find` looks through one bucket and gives back the value, or `None`.',
        lines: [
          'def find(bucket, key):',
          '    for pair in bucket:',
          '        if pair[0] == key:',
          '            return pair[1]',
          '    return None',
          'print(find([["cat", 3], ["act", 7]], "act"))',
        ],
        extra: ['        return None'],
        output: '7',
        explain: '`return None` comes after the loop. Inside the loop, it would give up after the first pair.',
        hints: ['Check every pair before you give up.', 'How far is the last `return None` indented?'],
      },
      { t: 'trap',
        think: '`put` can always add a new pair at the end of the bucket.',
        real: 'Then one key has 2 pairs. `get` stops at the first pair, so it gives back the old value. Check for the key first.',
        code: 'm.put("cat", 3)\nm.put("cat", 9)\nprint(m.get("cat"))   # Must print 9, not 3',
      },
      { t: 'cost', title: 'How fast is our HashMap?', items: [
        { op: '`bucket_for`', cost: 'O(1)', why: 'The steps depend on the key\'s letters, not on how many keys you store.' },
        { op: '`put` and `get`, keys spread out', cost: 'O(1) average', why: 'Each bucket holds only a few pairs.' },
        { op: '`put` and `get`, every key in one bucket', cost: 'O(n)', why: 'You may check every pair.' },
      ] },
      { t: 'tip', title: 'How does a real table differ?', text: 'A real one calls Python\'s `hash` in place of our recipe. So it can use numbers and tuples as keys. It also grows when it fills up, as the last practice question shows.' },
      { t: 'big', text: 'A hash table is a recipe, a row of buckets, and a short search.' },
    ],
    recap: [
      'You can make buckets that do not share one list.',
      'You can write `put` so it changes or adds a pair.',
      'You can write `get` so a missing key gives `None`.',
    ],
    practice: [
      { id: 'match-parts', type: 'match', level: 1,
        q: 'Match each part of the HashMap to its job.',
        pairs: [
          ['`bucket_for`', 'Picks the bucket for a key'],
          ['`pair[0]`', 'The key in a pair'],
          ['`pair[1]`', 'The value in a pair'],
          ['`put`', 'Changes a value or adds a pair'],
        ],
        explain: 'The recipe picks the bucket. Each pair holds a key at spot 0 and a value at spot 1.',
        hints: ['Which spot comes first in `["cat", 3]`?'],
      },
      { id: 'pair-is-same', type: 'predict', level: 2,
        q: 'What will the screen show?',
        code: 'bucket = [["cat", 3]]\nfor pair in bucket:\n    pair[1] = 9\nprint(bucket)',
        options: [
          { text: "[['cat', 3]]", why: 'The name `pair` is not a copy. It is a second name for the list inside the bucket.' },
          { text: "[['cat', 9]]", why: '' },
          { text: "[['cat', 3], ['cat', 9]]", why: 'Setting `pair[1]` changes one spot. It does not add anything to the bucket.' },
        ],
        answer: 1,
        explain: '`pair` names the same list that sits in the bucket. So the change shows in the bucket too.',
        hints: ['Does a `for` loop make a copy of each item?'],
      },
      { id: 'fix-shared-buckets', type: 'fix', level: 2,
        q: 'Every bucket shows the same pair. Fix `__init__` so each bucket is its own list.',
        code: `${RECIPE}\n\nclass HashMap:\n    def __init__(self, size):\n        self.buckets = [[]] * size\n${PUT}\n\nm = HashMap(5)\nm.put("cat", 3)\nprint(m.buckets)`,
        answer: `${RECIPE}\n\nclass HashMap:\n    def __init__(self, size):\n        self.buckets = [[] for i in range(size)]\n${PUT}\n\nm = HashMap(5)\nm.put("cat", 3)\nprint(m.buckets)`,
        wantOutput: "[[], [], [['cat', 3]], [], []]",
        explain: '`[[]] * size` makes many names for one list. A loop makes a new list each time.',
        hints: ['Remember the grid of zeros from lesson 5.5.', 'Use `[[] for i in range(size)]`.'],
      },
      { id: 'fix-no-replace', type: 'fix', level: 2,
        q: 'After 2 `put` calls with one key, `get` gives the old value. Fix `put`.',
        code: `${RECIPE}\n\n${INIT}\n\n    def put(self, key, value):\n        b = bucket_for(key, len(self.buckets))\n        self.buckets[b].append([key, value])\n${GET}\n\nm = HashMap(5)\nm.put("cat", 3)\nm.put("cat", 9)\nm.put("act", 7)\nprint(m.get("cat"))\nprint(m.get("act"))`,
        answer: `${RECIPE}\n\n${INIT}\n${PUT}\n${GET}\n\nm = HashMap(5)\nm.put("cat", 3)\nm.put("cat", 9)\nm.put("act", 7)\nprint(m.get("cat"))\nprint(m.get("act"))`,
        wantOutput: '9\n7',
        explain: '`put` must check the bucket first. If the key is there, it changes the value and stops.',
        hints: ['Loop over the pairs in the bucket before you append.', 'If `pair[0] == key`, set `pair[1] = value` and `return`.'],
      },
      { id: 'write-has', type: 'write', level: 2,
        q: 'Add a method `has(self, key)`. It gives back `True` if the key is in the table, and `False` if not.',
        starter: `${WHOLE}\n\n    def has(self, key):\n        # Your code here\n        pass\n\nm = HashMap(5)\nm.put("cat", 3)\nprint(m.has("cat"))\nprint(m.has("act"))`,
        answer: `${WHOLE}\n\n    def has(self, key):\n        b = bucket_for(key, len(self.buckets))\n        for pair in self.buckets[b]:\n            if pair[0] == key:\n                return True\n        return False\n\nm = HashMap(5)\nm.put("cat", 3)\nprint(m.has("cat"))\nprint(m.has("act"))`,
        wantOutput: 'True\nFalse',
        explain: '"act" goes to the same bucket as "cat", but no pair has that key. So `has` must compare the keys.',
        hints: ['Start the same way as `get`.', 'Why can you not use `get` here? A value might be `None`.', 'Return `False` after the loop, not inside it.'],
      },
      { id: 'write-remove', type: 'write', level: 3,
        q: 'Add a method `remove(self, key)`. It takes the pair out and gives back `True`. If the key is missing, it gives back `False`.',
        starter: `${WHOLE}\n\n    def remove(self, key):\n        # Your code here\n        pass\n\nm = HashMap(5)\nm.put("cat", 3)\nm.put("act", 7)\nprint(m.remove("cat"))\nprint(m.remove("cat"))\nprint(m.get("cat"))\nprint(m.get("act"))`,
        answer: `${WHOLE}\n\n    def remove(self, key):\n        bucket = self.buckets[bucket_for(key, len(self.buckets))]\n        for pair in bucket:\n            if pair[0] == key:\n                bucket.remove(pair)\n                return True\n        return False\n\nm = HashMap(5)\nm.put("cat", 3)\nm.put("act", 7)\nprint(m.remove("cat"))\nprint(m.remove("cat"))\nprint(m.get("cat"))\nprint(m.get("act"))`,
        wantOutput: 'True\nFalse\nNone\n7',
        explain: 'Find the bucket, then find the pair, then take it out. "act" must stay, even in the same bucket.',
        hints: ['Name the bucket first, so the code stays short.', 'A list has a `remove` method.', 'Return right after you remove, because the loop must not go on.'],
      },
      { id: 'write-grow', type: 'write', level: 3,
        q: 'Add a method `grow(self)`. It doubles the buckets, and every pair goes in again. Afterwards, `get` must still work.',
        starter: `${WHOLE}\n\n    def grow(self):\n        # Your code here\n        pass\n\nm = HashMap(2)\nm.put("cat", 3)\nm.put("dog", 5)\nm.grow()\nprint(len(m.buckets))\nprint(m.get("cat"))\nprint(m.get("dog"))\nprint(m.buckets)`,
        answer: `${WHOLE}\n\n    def grow(self):\n        old = self.buckets\n        self.buckets = [[] for i in range(len(old) * 2)]\n        for bucket in old:\n            for pair in bucket:\n                self.put(pair[0], pair[1])\n\nm = HashMap(2)\nm.put("cat", 3)\nm.put("dog", 5)\nm.grow()\nprint(len(m.buckets))\nprint(m.get("cat"))\nprint(m.get("dog"))\nprint(m.buckets)`,
        wantOutput: "4\n3\n5\n[[['cat', 3]], [], [['dog', 5]], []]",
        explain: 'Keep the old buckets, make twice as many new ones, then `put` each old pair. The new size picks new buckets.',
        hints: ['Save the old list with `old = self.buckets`.', 'Make the new buckets with a loop, as in `__init__`.', 'Two loops visit every old pair. Call `self.put` for each one.'],
      },
    ],
  });
}

// ---------------------------------------------------------------- lesson 11.3
Course.lesson('m11-hash-tables', {
  id: '11-4-lookup-patterns',
  num: '11.3',
  title: 'Lookup patterns: Two Sum and friends',
  goal: 'You can spot when a dict or set helps, then solve Two Sum, repeats and anagrams.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Which 2 numbers add up to the target?' },
    { t: 'words', items: [
      { word: 'Two Sum', means: 'A famous puzzle: find 2 items in a list that add up to a target.' },
      { word: 'anagram', means: 'A word made by moving the letters of another word, like "pots" and "stop".', say: 'AN-uh-gram' },
      { word: 'cue word', means: 'A word in a problem that hints at the right tool.', say: 'kyoo' },
    ] },
    { t: 'p', text: 'In [[Two Sum]], you get a list of numbers and a target. You give back the indexes of 2 items that add up to the target. The first idea is to try every pair.' },
    { t: 'q', id: 'count-pairs', type: 'mcq', level: 1,
      q: 'Count by hand. The list is `[a, b, c, d]`, and no pair works. How many pairs do you try?',
      options: [
        { text: '4', why: 'That counts the items. Each item pairs with several others.' },
        { text: '6', why: '' },
        { text: '16', why: 'That is 4 times 4. It counts each pair twice, and pairs an item with itself.' },
      ],
      answer: 1,
      explain: 'The pairs are ab, ac, ad, bc, bd and cd. That is 3 + 2 + 1, which is 6.',
      hints: ['Write them out: ab, ac, and so on.', 'Do not count ba, because it is the same pair as ab.'],
    },
    { t: 'viz', name: 'm11-two-sum-loops', caption: 'Watch the steps counter climb. Then try a target no pair can make.' },
    { t: 'h', text: 'Can a dict do better?' },
    { t: 'p', text: 'Look at each number once. Work out the partner it needs. Then ask: "Have I passed that partner already?" A dict can answer in about 1 look.' },
    { t: 'steps', title: 'The dict recipe for Two Sum', items: [
      { label: 'Start with an empty dict', text: 'It will remember each number you pass, and its index.', code: 'seen = {}' },
      { label: 'Work out the partner', text: 'If the target is 12 and you hold 7, you need 5.', code: 'need = target - nums[i]' },
      { label: 'Ask the dict first', text: 'If the partner is there, you are done.', code: 'if need in seen:\n    return [seen[need], i]' },
      { label: 'Then remember this number', text: 'Do this last, so a number cannot pair with itself.', code: 'seen[nums[i]] = i' },
    ] },
    { t: 'viz', name: 'm11-two-sum-dict', caption: 'Same numbers, same target. Compare the steps. Then try `3 3` with target 6, and `3 4` with target 6.' },
    { t: 'q', id: 'trace-two-sum', type: 'trace', level: 2,
      q: 'The list is `[6, 1, 4]` and the target is 5. Follow the dict recipe. Fill in `need`, and whether it is in `seen`.',
      code: py`
        nums = [6, 1, 4]
        target = 5
        seen = {}
        for i in range(len(nums)):
            need = target - nums[i]
            print(i, need, need in seen)
            seen[nums[i]] = i
      `,
      head: ['i', 'need', 'in seen?'],
      rows: [['0', '-1', 'False'], ['1', '4', 'False'], ['2', '1', 'True']],
      given: 1,
      verify: 'nums = [6, 1, 4]\ntarget = 5\nseen = {}\nfor i in range(len(nums)):\n    need = target - nums[i]\n    print(i, need, need in seen)\n    seen[nums[i]] = i',
      explain: 'By the last trip, `seen` holds 6 and 1. The 4 needs a 1, and the dict has it.',
      hints: ['`need` is 5 minus the number at `i`.', 'Which numbers has the loop passed so far?'],
    },
    { t: 'h', text: 'How big is the speed-up?' },
    { t: 'code', caption: 'This is the race. The only pair that works is the last 2 numbers. Guess the counts for 1,000 items, then run it.',
      code: py`
        def loop_steps(nums, target):
            steps = 0
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    steps = steps + 1
                    if nums[i] + nums[j] == target:
                        return steps
            return steps

        def dict_steps(nums, target):
            seen = {}
            steps = 0
            for i in range(len(nums)):
                steps = steps + 1
                if target - nums[i] in seen:
                    return steps
                seen[nums[i]] = i
            return steps

        for n in [10, 100, 1000]:
            nums = list(range(n))
            target = (n - 2) + (n - 1)
            slow = loop_steps(nums, target)
            fast = dict_steps(nums, target)
            print(n, slow, fast)
      `,
      output: '10 45 10\n100 4950 100\n1000 499500 1000',
    },
    { t: 'big', text: 'A dict turns "check every pair" into "ask once for each item". That is 499,500 steps cut to 1,000.' },
    { t: 'cost', title: 'Two Sum: how many steps for n items?', items: [
      { op: 'Double loop', cost: 'O(n^2)', why: 'In the worst case you try every pair. Twice the items means 4 times the steps.' },
      { op: 'Dict', cost: 'O(n) average', why: 'One trip through the list, with an O(1) average look on each step.' },
      { op: 'Extra memory for the dict', cost: 'O(n)', why: 'You pay with memory for each number you remember. The double loop needs almost none.' },
    ] },
    { t: 'trap',
      think: 'I can put the number in `seen` first, then ask for its partner.',
      real: 'Then a number can pair with itself. With `[3, 4]` and target 6, the 3 finds itself and gives `[0, 0]`. Always ask first, then remember.',
    },
    { t: 'tip', title: 'Test the corner cases', text: 'Try an empty list and a list with one item. Try `[3, 3]` with target 6, where the same value is used by 2 items. Try a target no pair can make, and negative numbers.' },
    { t: 'h', text: 'Where else does this trick work?' },
    { t: 'p', text: 'One question comes up again and again: "Have I seen this?" To spot a repeat, use a [[set]], because you need only keys.' },
    { t: 'q', id: 'first-repeat', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        seen = set()
        for x in [5, 8, 2, 8, 5]:
            if x in seen:
                print(x)
                break
            seen.add(x)
      `,
      options: [
        { text: '5', why: 'The 5 comes first in the list, but it repeats later. The 8 is the first to come back.' },
        { text: '8', why: '' },
        { text: '8\n5', why: 'The `break` ends the loop at the first repeat. The last 5 is never reached.' },
      ],
      answer: 1,
      explain: 'The loop passes 5, 8 and 2. The next 8 is already in `seen`, so it prints and stops.',
      hints: ['Follow what is in `seen` on each trip.', 'What does `break` do?'],
    },
    { t: 'p', text: 'To check 2 words for an [[anagram]], count the letters of each with [[Counter]]. To group many words, use one key for all anagrams: the letters in sorted order.' },
    { t: 'viz', name: 'm11-group-anagrams', caption: 'Each word finds its group in one step. Type your own words, with a repeat, or a word that matches nothing.' },
    { t: 'code', caption: 'Run it. `Counter` compares letter counts, so "aab" and "abb" are not anagrams. `groups.values()` gives the values of a dict, with no keys.',
      code: py`
        from collections import Counter, defaultdict

        print(Counter("stop") == Counter("pots"))
        print(Counter("aab") == Counter("abb"))

        groups = defaultdict(list)
        for word in ["stop", "pots", "ring", "grin", "tops"]:
            key = "".join(sorted(word))
            groups[key].append(word)
        print(list(groups.values()))
      `,
      output: "True\nFalse\n[['stop', 'pots', 'tops'], ['ring', 'grin']]",
    },
    { t: 'h', text: 'How do you know when to use this?' },
    { t: 'p', text: 'Read the problem and look for a [[cue word]]. Also ask if you are searching a list inside a loop. A dict or set can often replace that search.' },
    { t: 'table', caption: 'How to recognize a lookup pattern', head: ['Cue words', 'Pattern', 'Tool'],
      rows: [
        ['"pair that adds to"', 'Ask for the partner', '`dict`: number to index'],
        ['"duplicate", "repeat", "seen before"', 'Have I seen this?', '`set`'],
        ['"count", "how many of each", "most common"', 'Count things', '`Counter` or `dict`'],
        ['"anagram", "same letters"', 'Compare the counts', '`Counter`'],
        ['"group by"', 'Same key, same group', '`defaultdict(list)`'],
      ],
    },
    { t: 'q', id: 'pick-pattern', type: 'mcq', level: 2,
      q: 'A problem says: "Find out if any student name is on the list twice." Which tool fits best?',
      options: [
        { text: 'A double loop that compares every pair of names', why: 'That works, but it takes O(n^2) steps. A set answers in one trip.' },
        { text: 'A set of the names seen so far', why: '' },
        { text: 'Binary search on the names', why: 'Binary search needs a sorted list, and it finds one value. Here you ask about every name.' },
      ],
      answer: 1,
      explain: '"On the list twice" means a repeat. A set tells you if you have seen a name before.',
      hints: ['Which cue word in the table is close to "twice"?'],
    },
  ],
  recap: [
    'You can solve Two Sum in one trip with a dict.',
    'You can spot repeats with a set.',
    'You can group words with a sorted key.',
  ],
  practice: [
    { id: 'match-cues', type: 'match', level: 1,
      q: 'Match each problem to the tool that fits.',
      pairs: [
        ['"Any repeats in this list?"', 'A set of items seen so far'],
        ['"Which 2 numbers add up to 10?"', 'A dict of number to index'],
        ['"How many of each word?"', 'A `Counter`'],
        ['"Put the words into groups by first letter"', 'A `defaultdict(list)`'],
      ],
      explain: 'Each problem has a cue word, and the cue word points to the tool.',
      hints: ['Which ones need only keys, with no value?', 'Which one needs a list for each key?'],
    },
    { id: 'fix-two-sum', type: 'fix', level: 2,
      q: '`two_sum([3, 5], 6)` should give `None`. It gives `[0, 0]`, because 3 pairs with itself. Fix it.',
      code: 'def two_sum(nums, target):\n    seen = {}\n    for i in range(len(nums)):\n        seen[nums[i]] = i\n        need = target - nums[i]\n        if need in seen:\n            return [seen[need], i]\n    return None',
      answer: 'def two_sum(nums, target):\n    seen = {}\n    for i in range(len(nums)):\n        need = target - nums[i]\n        if need in seen:\n            return [seen[need], i]\n        seen[nums[i]] = i\n    return None',
      tests: [
        { label: 'A number cannot pair with itself', call: 'two_sum([3, 5], 6)', want: 'None' },
        { label: '2 items with the same value can pair', call: 'two_sum([3, 3], 6)', want: '[0, 1]' },
        { label: 'A normal pair works', call: 'two_sum([1, 4, 6], 10)', want: '[1, 2]' },
        { label: 'An empty list gives None', call: 'two_sum([], 6)', want: 'None' },
      ],
      explain: 'Ask first, then remember. When you ask, `seen` must hold only the numbers before this one.',
      hints: ['What is in `seen` when you ask about the 3?', 'Move the line `seen[nums[i]] = i` down.'],
    },
    { id: 'write-has-repeat', type: 'write', level: 2,
      q: 'Write `has_repeat(items)`. It gives back `True` if any item comes twice, and `False` if not. Use a set in one trip.',
      starter: 'def has_repeat(items):\n    # Your code here\n    pass\n',
      answer: 'def has_repeat(items):\n    seen = set()\n    for x in items:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False',
      tests: [
        { label: '[1, 2, 1] has a repeat', call: 'has_repeat([1, 2, 1])', want: 'True' },
        { label: '[1, 2, 3] has none', call: 'has_repeat([1, 2, 3])', want: 'False' },
        { label: 'An empty list has none', call: 'has_repeat([])', want: 'False' },
        { label: 'One item has none', call: 'has_repeat(["a"])', want: 'False' },
      ],
      explain: 'Each `in` on a set is O(1) on average. So the whole trip is O(n) on average.',
      hints: ['Start with `seen = set()`.', 'Ask first, then add.', 'Return `False` after the loop ends.'],
    },
    { id: 'fix-anagram', type: 'fix', level: 2,
      q: '`is_anagram("aab", "abb")` should give `False`. It gives `True`, because a set drops repeats. Fix it.',
      code: 'def is_anagram(a, b):\n    return set(a) == set(b)',
      answer: 'from collections import Counter\n\ndef is_anagram(a, b):\n    return Counter(a) == Counter(b)',
      tests: [
        { label: '"aab" and "abb" have different counts', call: 'is_anagram("aab", "abb")', want: 'False' },
        { label: '"stop" and "pots" match', call: 'is_anagram("stop", "pots")', want: 'True' },
        { label: '"to" and "tot" have different lengths', call: 'is_anagram("to", "tot")', want: 'False' },
        { label: '2 empty words match', call: 'is_anagram("", "")', want: 'True' },
      ],
      explain: 'Anagrams need the same letters, the same number of times. A `Counter` keeps the counts, and a set loses them.',
      hints: ['What does a set do with repeats?', 'Use `Counter` from `collections`, or compare `sorted(a)` and `sorted(b)`.'],
    },
    { id: 'write-first-unique', type: 'write', level: 2,
      q: 'Write `first_unique(nums)`. It gives back the first number that comes only once. If there is none, it gives back `None`.',
      starter: 'def first_unique(nums):\n    # Your code here\n    pass\n',
      answer: 'from collections import Counter\n\ndef first_unique(nums):\n    counts = Counter(nums)\n    for n in nums:\n        if counts[n] == 1:\n            return n\n    return None',
      tests: [
        { label: '[4, 7, 4, 9, 7, 2] gives 9', call: 'first_unique([4, 7, 4, 9, 7, 2])', want: '9' },
        { label: 'All repeats gives None', call: 'first_unique([1, 1])', want: 'None' },
        { label: 'An empty list gives None', call: 'first_unique([])', want: 'None' },
        { label: 'The first number can win', call: 'first_unique([3, 1, 1])', want: '3' },
      ],
      explain: 'Count everything first. Then walk the list in order, and stop at the first count of 1.',
      hints: ['You met this recipe in module 6.', 'Count first, then loop over the list again.'],
    },
    { id: 'write-pair-values', type: 'write', level: 3,
      q: 'Write `pair_for(nums, target)`. It gives back the 2 numbers, as a list, not their indexes. Keep them in list order. If no pair works, give back `None`. Use a set.',
      starter: 'def pair_for(nums, target):\n    # Your code here\n    pass\n',
      answer: 'def pair_for(nums, target):\n    seen = set()\n    for n in nums:\n        need = target - n\n        if need in seen:\n            return [need, n]\n        seen.add(n)\n    return None',
      tests: [
        { label: '[4, 9, 2, 7, 5] with target 12', call: 'pair_for([4, 9, 2, 7, 5], 12)', want: '[7, 5]' },
        { label: '2 equal numbers can pair', call: 'pair_for([6, 6], 12)', want: '[6, 6]' },
        { label: 'A number cannot pair with itself', call: 'pair_for([6], 12)', want: 'None' },
        { label: 'Negative numbers work', call: 'pair_for([-3, 8, 1], 5)', want: '[-3, 8]' },
      ],
      explain: 'You no longer need the indexes, so a set is enough. The partner you saw earlier comes first in the list.',
      hints: ['This is the Two Sum recipe with a set in place of the dict.', 'Which number came first: `need` or `n`?'],
    },
    { id: 'write-group-anagrams', type: 'write', level: 3,
      q: 'Write `group_words(words)`. It gives back a list of groups, and each group holds words that are anagrams. Keep the order you first see them.',
      starter: 'def group_words(words):\n    # Your code here\n    pass\n',
      answer: 'from collections import defaultdict\n\ndef group_words(words):\n    groups = defaultdict(list)\n    for word in words:\n        key = "".join(sorted(word))\n        groups[key].append(word)\n    return list(groups.values())',
      tests: [
        { label: 'Two groups of anagrams', call: 'group_words(["tea", "bat", "ate", "tab"])', want: '[["tea", "ate"], ["bat", "tab"]]' },
        { label: 'A word with no partner has its own group', call: 'group_words(["sun"])', want: '[["sun"]]' },
        { label: 'No words gives an empty list', call: 'group_words([])', want: '[]' },
        { label: 'A repeat stays in the group', call: 'group_words(["no", "on", "no"])', want: '[["no", "on", "no"]]' },
      ],
      explain: 'All anagrams have the same sorted letters. So that string works as the key for their group.',
      hints: ['`"".join(sorted(word))` makes the key.', 'A `defaultdict(list)` starts each group for you.', '`groups.values()` gives the groups. Wrap it in `list`.'],
    },
  ],
});
