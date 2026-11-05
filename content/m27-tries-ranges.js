/* Module 27: Tries and Range Trees. Part 4 (Advanced). */
(function () {
  /* Python that many programs share. The learner sees it in full each time. */
  const ADD = py`
    END = "$"

    def add(trie, word):
        node = trie
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node[END] = True
  `;
  const FIND = py`
    def find_node(trie, text):
        node = trie
        for ch in text:
            if ch not in node:
                return None
            node = node[ch]
        return node
  `;
  const ASK = py`
    def has_word(trie, word):
        node = find_node(trie, word)
        return node is not None and END in node

    def starts_with(trie, text):
        return find_node(trie, text) is not None
  `;
  const COLLECT = py`
    def collect(node, sofar, found):
        if END in node:
            found.append(sofar)
        for ch in sorted(node):
            if ch != END:
                collect(node[ch], sofar + ch, found)

    def suggest(trie, start):
        found = []
        node = find_node(trie, start)
        if node is not None:
            collect(node, start, found)
        return found
  `;
  const COUNT_ADD = py`
    END = "$"

    def add(trie, word):
        node = trie
        node["count"] = node.get("count", 0) + 1
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
            node["count"] = node.get("count", 0) + 1
        node[END] = True
  `;
  const SHORTEN = py`
    def shorten(trie, word):
        node = trie
        sofar = ""
        for ch in word:
            if ch not in node:
                return word
            node = node[ch]
            sofar = sofar + ch
            if END in node:
                return sofar
        return word
  `;
  const ON_BOARD = py`
    MOVES = [(1, 0), (-1, 0), (0, 1), (0, -1)]

    def on_board(board, r, c):
        if r < 0 or c < 0:
            return False
        return r < len(board) and c < len(board[0])
  `;
  const FEN = py`
    def size(i):
        return i & -i

    def add(boxes, i, change):
        while i < len(boxes):
            boxes[i] = boxes[i] + change
            i = i + size(i)

    def total(boxes, i):
        answer = 0
        while i > 0:
            answer = answer + boxes[i]
            i = i - size(i)
        return answer
  `;
  const FEN_BUILD = py`
    def make_boxes(nums):
        boxes = [0] * (len(nums) + 1)
        for spot in range(len(nums)):
            add(boxes, spot + 1, nums[spot])
        return boxes
  `;
  const SEG = py`
    class SegNode:
        def __init__(self, lo, hi):
            self.lo = lo
            self.hi = hi
            self.total = 0
            self.left = None
            self.right = None

    def build(nums, lo, hi):
        node = SegNode(lo, hi)
        if hi - lo == 1:
            node.total = nums[lo]
            return node
        mid = (lo + hi) // 2
        node.left = build(nums, lo, mid)
        node.right = build(nums, mid, hi)
        node.total = node.left.total + node.right.total
        return node
  `;
  const QUERY = py`
    def query(node, a, b):
        if b <= node.lo or node.hi <= a:
            return 0
        if a <= node.lo and node.hi <= b:
            return node.total
        left = query(node.left, a, b)
        right = query(node.right, a, b)
        return left + right
  `;
  const UPDATE = py`
    def update(node, i, value):
        if node.hi - node.lo == 1:
            node.total = value
            return
        if i < node.left.hi:
            update(node.left, i, value)
        else:
            update(node.right, i, value)
        node.total = node.left.total + node.right.total
  `;
  const MIN = py`
    class MinNode:
        def __init__(self, lo, hi):
            self.lo = lo
            self.hi = hi
            self.best = 0
            self.left = None
            self.right = None

    def build_min(nums, lo, hi):
        node = MinNode(lo, hi)
        if hi - lo == 1:
            node.best = nums[lo]
            return node
        mid = (lo + hi) // 2
        node.left = build_min(nums, lo, mid)
        node.right = build_min(nums, mid, hi)
        node.best = min(node.left.best, node.right.best)
        return node
  `;
  const SMALLEST = py`
    def smallest(node, a, b):
        if b <= node.lo or node.hi <= a:
            return float("inf")
        if a <= node.lo and node.hi <= b:
            return node.best
        left = smallest(node.left, a, b)
        right = smallest(node.right, a, b)
        return min(left, right)
  `;
  const join = (...parts) => parts.join('\n\n') + '\n';

  Course.module({
    id: 'm27-tries-ranges',
    num: 27, part: 4, level: 'A',
    title: 'Tries and Range Trees',
    blurb: 'Share the starts of words, and keep group totals, so big questions take only a few steps.',
    needs: ['m06-dicts-sets', 'm13-array-patterns', 'm18-trees'],
  });

  /* ---------------------------------------------------------------- 27.1 */
  Course.lesson('m27-tries-ranges', {
    id: '27-1-trie-dicts',
    num: '27.1',
    title: 'Tries: words that share their starts',
    goal: 'You can build a trie from dicts, and test for a word or a start.',
    mins: 14,
    steps: [
      { t: 'h', text: 'How does a phone guess your word?' },
      { t: 'p', text: 'Type `c` on a phone, and it offers many words. Type `ca`, and the choices shrink. Each letter cuts the list down.' },
      { t: 'analogy', title: 'Picture autocomplete', text: 'Each letter you type is one step down a path. Words that begin the same walk the same path, until they split. It stops being true in one way. A phone also guesses which word you like best. Our tree only knows which words exist.' },
      { t: 'q', id: 'spark-scan', type: 'mcq', level: 1,
        q: 'Count by hand. A plain list holds `car`, `dog`, `cat`, `ant` and `cart`. You want every word that starts with `ca`. How many words must you look at?',
        options: [
          '5',
          { text: '3', why: 'That counts the answers. You still have to look at `dog` and `ant` to know they do not fit.' },
          { text: '2', why: 'That counts the letters in `ca`. A plain list has no order to help you, so each word needs a look.' },
        ],
        answer: 0,
        explain: 'A plain list gives no clue about where the words are. So you look at all 5.',
        hints: ['Could `dog` start with `ca`? How do you know?'],
      },
      { t: 'code', caption: 'One look for each word. Add 5 more words to the list, and guess the new count.',
        output: "['car', 'cat', 'cart']\nlooks: 5",
        code: py`
          words = ["car", "dog", "cat", "ant", "cart"]
          start = "ca"
          looks = 0
          found = []
          for w in words:
              looks = looks + 1
              if w[:len(start)] == start:
                  found.append(w)
          print(found)
          print("looks:", looks)
        `,
      },
      { t: 'words', items: [
        { word: 'trie', say: 'try', means: 'A tree of letters. Words that start the same share a path.' },
        { word: 'prefix', say: 'PREE-fix', means: 'The first letters of a word. `ca` is a prefix of `cat`.' },
        { word: 'end mark', means: 'A note in a box. It says a whole word stops here.' },
      ] },
      { t: 'p', text: 'A [[prefix sum]] adds up the front part of a list. A [[prefix]] is the front part of a word. Now look at a [[trie]] grow. A `$` in a box is the [[end mark]].' },
      { t: 'viz', name: 'm27-trie-grow', caption: 'Guess how many new boxes each word needs. Then type your own words. Try `to top tap`, and try one word twice.' },
      { t: 'big', text: 'Words that start the same share one path. An [[end mark]] says where a whole word stops.' },
      { t: 'q', id: 'count-boxes', type: 'mcq', level: 2,
        q: 'Count by hand. A trie holds `sun` and `sum`. How many boxes does it need, leaving out the top box?',
        options: [
          '4',
          { text: '6', why: 'That gives each word its own letters. But `sun` and `sum` share the `s` and the `u`.' },
          { text: '3', why: 'That forgets the split. After `su`, the words need 2 different boxes.' },
        ],
        answer: 0,
        explain: '`s` and `u` are shared. Then `n` and `m` each get a box. That makes 4.',
        hints: ['Which letters do the 2 words share?'],
      },

      { t: 'h', text: 'How do you build a trie in Python?' },
      { t: 'p', text: 'A dict value can be another dict. So each box is a dict, and its keys are the letters that come next. The key `"$"` is the [[end mark]], because no word has it.' },
      { t: 'code', caption: 'Each `[...]` steps one box down. Try `trie["c"]["a"]["t"]`, and guess first.',
        output: "{'a': {'t': {'$': True}}}\n{'t': {'$': True}}\nTrue\nFalse",
        code: py`
          trie = {"c": {"a": {"t": {"$": True}}}}
          print(trie["c"])
          print(trie["c"]["a"])
          print("t" in trie["c"]["a"])
          print("x" in trie["c"])
        `,
      },
      { t: 'steps', title: 'Add one word to the trie', items: [
        { label: 'Start at the top', text: '`node` is a name tag on the top dict.', code: 'node = trie' },
        { label: 'Make a box if it is missing', text: 'Never replace a box that is there. It may hold other words.', code: 'if ch not in node:\n    node[ch] = {}' },
        { label: 'Step down', text: 'The tag moves to the next box. The top dict stays where it is.', code: 'node = node[ch]' },
        { label: 'Mark the end', text: 'Once the letters run out, the tag names the last box.', code: 'node[END] = True' },
      ] },
      { t: 'q', id: 'predict-dict', type: 'predict', level: 2,
        q: 'Both words share `c`, then `a`. What will the screen show?',
        code: join(ADD, py`
          trie = {}
          add(trie, "cat")
          add(trie, "car")
          print(trie)
        `),
        options: [
          "{'c': {'a': {'t': {'$': True}, 'r': {'$': True}}}}",
          { text: "{'cat': True, 'car': True}", why: 'That is a plain dict of whole words. `add` makes one box for each letter.' },
          { text: "{'c': {'a': {'r': {'$': True}}}}", why: 'That thinks the second word replaces the first. The `if` keeps boxes that are there already.' },
        ],
        answer: 0,
        explain: 'The `a` box has 2 keys, `t` and `r`. Each of them leads to its own box with an end mark.',
        hints: ['Does `add` make a second `c`?'],
      },
      { t: 'q', id: 'fill-add', type: 'fill', level: 2,
        q: 'Fill the gaps, so `add` keeps old boxes and steps down.',
        code: py`
          END = "$"

          def add(trie, word):
              node = trie
              for ch in word:
                  if ch ____ node:
                      node[ch] = {}
                  node = ____
              node[END] = True

          trie = {}
          add(trie, "ox")
          add(trie, "on")
          print(sorted(trie["o"]))
        `,
        blanks: ['not in', ['node[ch]']],
        output: "['n', 'x']",
        explain: 'Make a box only if the letter is missing. Then move the tag down to that box.',
        hints: ['Which words test that a key is missing?', 'The tag moves to the box for `ch`.'],
      },

      { t: 'h', text: 'How do you ask the trie a question?' },
      { t: 'p', text: 'Walk the letters from the top. If a letter has no box, the answer is no. If the walk ends safely, your question decides what you check.' },
      { t: 'viz', name: 'm27-trie-walk', caption: 'Say each answer before it shows. Then compare `has_word` and `starts_with` on `ca`. Try a word that runs past the end, like `catch`.' },
      { t: 'code', caption: 'One walk answers both questions. Add `add(trie, "ca")`, and guess what changes.',
        output: 'True\nFalse\nTrue\nFalse',
        code: join(ADD, FIND, ASK, py`
          trie = {}
          for w in ["car", "cart", "cat"]:
              add(trie, w)
          print(has_word(trie, "cat"))
          print(has_word(trie, "ca"))
          print(starts_with(trie, "ca"))
          print(starts_with(trie, "dog"))
        `),
      },
      { t: 'trap',
        think: 'if the walk ends safely, the word is in the trie.',
        real: 'The path for `ca` exists, because `car` passes through it. But nobody added `ca`. Only the [[end mark]] says a word stops here.',
        code: py`
          return find_node(trie, word) is not None   # wrong for has_word
          return node is not None and END in node    # right
        `,
      },
      { t: 'q', id: 'count-walk', type: 'mcq', level: 2,
        q: 'Count by hand. How many letters does the walk check for `cart`, if the trie holds 4 words? And if it holds 4000 words?',
        options: [
          '4 and 4',
          { text: '4 and 4000', why: 'That is how a plain list works. The walk only checks the letters of `cart`, and never reads other words.' },
          { text: '1 and 1', why: 'Each letter takes one look in a dict, and `cart` has 4 letters.' },
        ],
        answer: 0,
        explain: 'One check for each letter of `cart`. The other words sit on paths the walk never takes.',
        hints: ['Which boxes does the walk visit?'],
      },
      { t: 'code', caption: 'Each row shows the words, the looks in a list, and the steps in a trie. Try the start `"aab"`, and guess first.',
        output: '10 10 2\n1000 1000 2',
        code: join(ADD, py`
          def list_looks(words, start):
              looks = 0
              found = []
              for w in words:
                  looks = looks + 1
                  if w[:len(start)] == start:
                      found.append(w)
              return looks

          def walk_steps(trie, text):
              node = trie
              steps = 0
              for ch in text:
                  steps = steps + 1
                  if ch not in node:
                      return steps
                  node = node[ch]
              return steps

          letters = "abcdefghij"
          words = []
          for a in letters:
              for b in letters:
                  for c in letters:
                      words.append(a + b + c)

          for group in [words[:10], words]:
              trie = {}
              for w in group:
                  add(trie, w)
              looks = list_looks(group, "aa")
              print(len(group), looks, walk_steps(trie, "aa"))
        `),
      },
      { t: 'cost', title: 'How fast is it, with L letters?', items: [
        { op: '`add` one word', cost: 'O(L) on average', why: 'One dict look-up per letter, as you counted. Each look-up is O(1) on average.' },
        { op: '`has_word` or `starts_with`', cost: 'O(L) on average', why: 'The same walk. The number of other words does not matter.' },
        { op: 'Find a start in a plain list of n words', cost: 'O(n x L)', why: 'One look per word, and each look can compare up to L letters.' },
      ] },
      { t: 'tip', title: 'When is a trie worth it?', text: 'Do you only ask if a whole word is here? A set does that fast on average. A trie wins when you ask about the starts of many words. It does cost memory, because each box is a whole dict. A plain list of the same words can be smaller.' },
      { t: 'tip', title: 'Odd cases to test', text: 'Adding a word twice changes nothing. Adding `""` puts the mark on the top box. `Cat` and `cat` take different paths. A word may also end inside a longer one, like `car` in `cart`. Then the middle box has a mark and more letters below.' },
      { t: 'tip', title: 'How to recognize it', text: 'Look for **many words**, **starts with**, **prefix** or **autocomplete**. Those are the clues for a [[trie]].' },
    ],
    recap: [
      'You can add words to a trie made of dicts.',
      'You can tell a whole word from a start.',
      'You can say why the walk ignores other words.',
    ],
    practice: [
      { id: 'match-words', type: 'match', level: 1,
        q: 'Match each word to what it means.',
        pairs: [
          ['[[trie]]', 'A tree of letters with shared starts'],
          ['[[prefix]]', 'The first letters of a word'],
          ['[[end mark]]', 'A note that says a whole word stops here'],
        ],
        explain: 'The trie is the whole tree. A prefix is a path from the top. The end mark sits in a box.',
        hints: ['Which one is a part of a word?'],
      },
      { id: 'type-walk', type: 'predict', level: 2,
        q: 'What will the screen show? Type it, with one answer per line.',
        code: join(ADD, FIND, ASK, py`
          trie = {}
          add(trie, "bat")
          add(trie, "batch")
          print(has_word(trie, "batc"))
          print(starts_with(trie, "batc"))
          print(has_word(trie, "bat"))
        `),
        answer: 'False\nTrue\nTrue',
        why: '`batc` is a path on the way to `batch`, so it is a start. It has no end mark. `bat` was added, so it has one.',
        explain: 'A box can have an end mark and more letters below it. The `t` box in `bat` has both.',
        hints: ['Which boxes have an end mark?'],
      },
      { id: 'pick-trie', type: 'mcq', level: 2,
        q: 'Which job fits a trie best?',
        options: [
          'A search box shows words as you type each letter',
          { text: 'Check if one word is on a banned list', why: 'That asks about a whole word. A set does this well, so a trie adds nothing.' },
          { text: 'Find the biggest number in a list', why: 'That thinks a trie suits any data. It works on words, and one pass finds the biggest number.' },
        ],
        answer: 0,
        explain: 'As you type, each letter is one more step down the trie. So "starts with" is the clue.',
        hints: ['Which job asks about the start of a word?'],
      },
      { id: 'fix-wipe', type: 'fix', level: 2,
        q: 'After adding `car` and `cat`, `car` has gone missing. Fix `add`.',
        code: py`
          END = "$"

          def add(trie, word):
              node = trie
              for ch in word:
                  node[ch] = {}
                  node = node[ch]
              node[END] = True

          trie = {}
          add(trie, "car")
          add(trie, "cat")
        `,
        answer: py`
          END = "$"

          def add(trie, word):
              node = trie
              for ch in word:
                  if ch not in node:
                      node[ch] = {}
                  node = node[ch]
              node[END] = True

          trie = {}
          add(trie, "car")
          add(trie, "cat")
        `,
        tests: [
          { label: 'car is still there', check: '"$" in trie["c"]["a"].get("r", {})' },
          { label: 'cat is there too', check: '"$" in trie["c"]["a"].get("t", {})' },
          { label: 'Only one c box is on top', check: 'len(trie) == 1' },
        ],
        explain: 'Each new `{}` threw away the old box and all that hung below it. Check for the key first.',
        hints: ['What happens to the old `c` box when `cat` arrives?', 'Make a box only when the letter is missing.'],
      },
      { id: 'write-count-boxes', type: 'write', level: 2,
        q: 'Write `count_boxes(node)`. It returns how many letter boxes sit below `node`. Skip the end mark key.',
        starter: join(ADD, py`
          def count_boxes(node):
              # Your code here.
              return None

          trie = {}
          add(trie, "car")
          add(trie, "cat")
          small = {}
          add(small, "a")
        `),
        answer: join(ADD, py`
          def count_boxes(node):
              count = 0
              for key in node:
                  if key != END:
                      count = count + 1 + count_boxes(node[key])
              return count

          trie = {}
          add(trie, "car")
          add(trie, "cat")
          small = {}
          add(small, "a")
        `),
        tests: [
          { label: 'car and cat need 4 boxes', call: 'count_boxes(trie)', want: '4' },
          { label: 'One letter needs 1 box', call: 'count_boxes(small)', want: '1' },
          { label: 'An empty trie has none', call: 'count_boxes({})', want: '0' },
        ],
        explain: 'Each letter key is one box, plus everything below it. This is the "ask, then join" shape from lesson 18.4.',
        hints: ['Loop over the keys of the dict.', 'Skip `END`, since it is not a letter.', 'Add 1, plus what the call below gives back.'],
      },
      { id: 'write-shared-start', type: 'write', level: 3,
        q: 'Stretch: write `shared_start(words)`. It returns the longest start that all the words share. Build a trie. Then walk down while a box has one key, unless that key is the end mark.',
        starter: join(ADD, py`
          def shared_start(words):
              # Your code here.
              return None
        `),
        answer: join(ADD, py`
          def shared_start(words):
              trie = {}
              for w in words:
                  add(trie, w)
              node = trie
              sofar = ""
              while len(node) == 1 and END not in node:
                  ch = list(node)[0]
                  sofar = sofar + ch
                  node = node[ch]
              return sofar
        `),
        tests: [
          { label: 'train, trail, trap', call: 'shared_start(["train", "trail", "trap"])', want: '"tra"' },
          { label: 'No shared letters', call: 'shared_start(["ant", "bee"])', want: '""' },
          { label: 'One word ends early', call: 'shared_start(["car", "cart"])', want: '"car"' },
          { label: 'The same word twice', call: 'shared_start(["tea", "tea"])', want: '"tea"' },
          { label: 'No words at all', call: 'shared_start([])', want: '""' },
        ],
        explain: 'A box with 2 keys means the words split there. An end mark means a word stops there. Either one ends the shared part.',
        hints: ['What is the test for "only one key"?', '`list(node)[0]` gives the only key.', 'Add the letter to `sofar`, then step down.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 27.2 */
  Course.lesson('m27-tries-ranges', {
    id: '27-2-trie-jobs',
    num: '27.2',
    title: 'Trie jobs: suggest, count, shorten',
    goal: 'You can list and count words with a start, and cut words to stems.',
    mins: 14,
    steps: [
      { t: 'h', text: 'Which words start with `ca`?' },
      { t: 'p', text: 'Walk down to the box for `ca`. Every word below that box starts with `ca`. So many jobs have 2 parts: walk to a box, then work from there.' },
      { t: 'q', id: 'spark-below', type: 'mcq', level: 1,
        q: 'A trie holds `car`, `care`, `cat` and `dog`. Which boxes can hold end marks for words that start with `ca`?',
        options: [
          'Only boxes below the box for `ca`',
          { text: 'Every box in the trie', why: 'That forgets the walk. The path to `dog` never passes through `ca`.' },
          { text: 'Only the box for `ca`', why: 'That box is where the words start to split. Their end marks sit lower down.' },
        ],
        answer: 0,
        explain: 'To start with `ca`, a word must pass through that box. So all its end marks sit below.',
        hints: ['Could `dog` reach the box for `ca`?'],
      },
      { t: 'viz', name: 'm27-trie-suggest', caption: 'Say which word comes next. Then try an empty start, a whole word, and a start that is not there.' },
      { t: 'p', text: 'This walk is [[preorder]], from lesson 18.2: visit the box, then the boxes below. It uses `sorted`, so letters come in alphabet order. So the words come out in dictionary order.' },
      { t: 'code', caption: 'Real autocomplete also shows only a few words. The `[:3]` keeps the first 3. Try the start `"do"`, then `"x"`.',
        output: "['car', 'care', 'cart', 'cat']\n['car', 'care', 'cart']",
        code: join(ADD, FIND, COLLECT, py`
          trie = {}
          for w in ["cat", "car", "dog", "cart", "care"]:
              add(trie, w)
          print(suggest(trie, "ca"))
          print(suggest(trie, "ca")[:3])
        `),
      },
      { t: 'q', id: 'predict-order', type: 'predict', level: 2,
        q: 'Look at the order. What will the screen show?',
        code: join(ADD, FIND, COLLECT, py`
          trie = {}
          for w in ["tops", "to", "tap", "top"]:
              add(trie, w)
          print(suggest(trie, "t"))
        `),
        options: [
          "['tap', 'to', 'top', 'tops']",
          { text: "['tops', 'to', 'tap', 'top']", why: 'That keeps the order they were added. `sorted` picks the letters, so adding order does not matter.' },
          { text: "['to', 'top', 'tops', 'tap']", why: 'That goes by length of path. But `a` sorts before `o`, so `tap` comes first.' },
        ],
        answer: 0,
        explain: 'Below `t`, the letter `a` comes before `o`. And `to` comes before `top`, as the shorter word is met first.',
        hints: ['Which letter comes first below `t`?'],
      },

      { t: 'h', text: 'What if you only need the count?' },
      { t: 'p', text: 'You could list the words, then count them. But that visits every box below, each time you ask. So pay once when you add: each box keeps a count of the words through it.' },
      { t: 'viz', name: 'm27-trie-count', caption: 'Guess each count first. Then add a repeated word. Does it count twice?' },
      { t: 'code', caption: 'Each box has one extra key, `"count"`. It has many letters, so no single letter can clash with it. Add `"cap"`, and guess the count for `"ca"`.',
        output: '3\n1\n4\n0',
        code: join(COUNT_ADD, FIND, py`
          def count_starts(trie, start):
              node = find_node(trie, start)
              if node is None:
                  return 0
              return node.get("count", 0)

          trie = {}
          for w in ["car", "cat", "care", "dog"]:
              add(trie, w)
          print(count_starts(trie, "ca"))
          print(count_starts(trie, "do"))
          print(count_starts(trie, ""))
          print(count_starts(trie, "x"))
        `),
      },
      { t: 'tip', title: 'Same deal as prefix sums', text: 'Lesson 13.3 paid once to build, so each [[query]] was fast. This is the same deal. Adding costs a little more, and counting is one short walk. A repeated word counts twice, so check `has_word` first if that is wrong for your job.' },

      { t: 'h', text: 'Can a trie shorten words?' },
      { t: 'words', items: [
        { word: 'stem', means: 'A short start that longer words grow from. `play` is the stem of `player`.' },
      ] },
      { t: 'p', text: 'Here is a job: swap each word in a sentence for its shortest [[stem]]. Put the stems in a trie. Then walk each word, and stop at the first end mark.' },
      { t: 'viz', name: 'm27-stem-walk', caption: 'Decide what happens at the end mark. Then try a word with no stem, and a word shorter than its stem.' },
      { t: 'code', caption: 'Add the stem `"pl"`, and guess the new sentence.',
        output: 'the play re a game',
        code: join(ADD, SHORTEN, py`
          trie = {}
          for stem in ["play", "player", "re", "run"]:
              add(trie, stem)

          sentence = "the players rerun a game"
          short = []
          for word in sentence.split():
              short.append(shorten(trie, word))
          print(" ".join(short))
        `),
      },
      { t: 'q', id: 'shortest-stem', type: 'mcq', level: 2,
        q: 'The stems are `play` and `player`. Why does `players` become `play`?',
        options: [
          'The walk reaches the end mark for `play` first, and returns',
          { text: '`player` was never added to the trie', why: 'It was added. But the walk returns at `play`, so it never gets there.' },
          { text: '`sorted` puts the shortest stem first', why: 'This code has no `sorted`. The walk meets letters in the order of the word.' },
        ],
        answer: 0,
        explain: 'A shorter stem always sits higher on the same path. So the first mark you meet is the shortest.',
        hints: ['Which end mark comes first on the way down?'],
      },

      { t: 'cost', title: 'How fast are these jobs?', items: [
        { op: 'Count words with a start of p letters', cost: 'O(p) on average', why: 'One short walk, then one read of the count.' },
        { op: 'List the m boxes below a start', cost: 'O(p + m x L) on average', why: 'The walk, then one visit per box. Each `sofar + ch` copies up to L letters.' },
        { op: 'Shorten a word of L letters', cost: 'O(L) on average', why: 'The walk stops at the first mark, or at the end of the word.' },
      ] },
      { t: 'trap',
        think: 'a loop over a box only meets letters.',
        real: 'The box also has its end mark, and perhaps a count. Skip those keys. Otherwise your code treats `True` as a box.',
        code: py`
          for ch in sorted(node):
              if ch != END:          # skip the mark
                  collect(node[ch], sofar + ch, found)
        `,
      },
      { t: 'tip', title: 'How to recognize it', text: 'Look for **suggest words**, **how many start with** or **shortest start**. Walk to the box first. Then ask what the job needs from there. Also test an empty start, a start that is not there, and a repeated word.' },
    ],
    recap: [
      'You can walk to a box, then list the words below it.',
      'You can keep a count in each box.',
      'You can stop at the first end mark to find a stem.',
    ],
    practice: [
      { id: 'match-jobs', type: 'match', level: 1,
        q: 'Match each job to what it does after the walk.',
        pairs: [
          ['List the words with a start', 'Visit every box below'],
          ['Count the words with a start', 'Read one number in the box'],
          ['Cut a word to its stem', 'Return at the first end mark'],
        ],
        explain: 'All 3 walk the letters first. Only the work after that changes.',
        hints: ['Which job needs only one number?'],
      },
      { id: 'type-shorten', type: 'predict', level: 2,
        q: 'What will the screen show? Type it, with one word per line.',
        code: join(ADD, SHORTEN, py`
          trie = {}
          for stem in ["sea", "sun"]:
              add(trie, stem)
          print(shorten(trie, "seaside"))
          print(shorten(trie, "su"))
          print(shorten(trie, "moon"))
        `),
        answer: 'sea\nsu\nmoon',
        why: '`seaside` meets the mark at `sea`. `su` runs out before any mark. `moon` has no `m` box at all.',
        explain: 'A word stays whole in 2 cases: its letters run out, or the trie has no box for the next letter.',
        hints: ['Where is the first end mark on the way down `seaside`?', 'Does `su` reach an end mark?'],
      },
      { id: 'count-twice', type: 'mcq', level: 2,
        q: 'You run `add(trie, "cat")` 2 times, with the counting `add`. What does `count_starts(trie, "ca")` give?',
        options: [
          '2',
          { text: '1', why: 'That thinks the box knows the word is a repeat. The count goes up on each `add`, every time.' },
          { text: '0', why: 'The word is there, so the count cannot be 0. Each `add` passes through the `ca` box.' },
        ],
        answer: 0,
        explain: 'Every call to `add` walks the path and adds 1 to each box. To count each word once, test `has_word` first.',
        hints: ['What does the counting line do on each pass?'],
      },
      { id: 'fix-collect', type: 'fix', level: 2,
        q: '`suggest` stops with a TypeError. A loop treats the end mark as a box. Fix `collect`.',
        code: join(ADD, FIND, py`
          def collect(node, sofar, found):
              if END in node:
                  found.append(sofar)
              for ch in sorted(node):
                  collect(node[ch], sofar + ch, found)

          def suggest(trie, start):
              found = []
              node = find_node(trie, start)
              if node is not None:
                  collect(node, start, found)
              return found

          trie = {}
          for w in ["pen", "pet", "pig"]:
              add(trie, w)
        `),
        answer: join(ADD, FIND, py`
          def collect(node, sofar, found):
              if END in node:
                  found.append(sofar)
              for ch in sorted(node):
                  if ch != END:
                      collect(node[ch], sofar + ch, found)

          def suggest(trie, start):
              found = []
              node = find_node(trie, start)
              if node is not None:
                  collect(node, start, found)
              return found

          trie = {}
          for w in ["pen", "pet", "pig"]:
              add(trie, w)
        `),
        tests: [
          { label: 'Words that start with pe', call: 'suggest(trie, "pe")', want: '["pen", "pet"]' },
          { label: 'A whole word', call: 'suggest(trie, "pig")', want: '["pig"]' },
          { label: 'A missing start', call: 'suggest(trie, "z")', want: '[]' },
        ],
        explain: '`node["$"]` is `True`, not a dict. So the call below crashes on `END in True`. Skip that key.',
        hints: ['What is `node[END]`?', 'Skip the key when `ch` is `END`.'],
      },
      { id: 'write-shorten-all', type: 'write', level: 2,
        q: 'Write `shorten_all(stems, sentence)`. It makes a trie of the stems. It gives back the sentence, with each word cut to its shortest stem.',
        starter: join(ADD, SHORTEN, py`
          def shorten_all(stems, sentence):
              # Your code here.
              return None
        `),
        answer: join(ADD, SHORTEN, py`
          def shorten_all(stems, sentence):
              trie = {}
              for stem in stems:
                  add(trie, stem)
              short = []
              for word in sentence.split():
                  short.append(shorten(trie, word))
              return " ".join(short)
        `),
        tests: [
          { label: 'Some words have stems', call: 'shorten_all(["fish", "boat"], "boats and fishes")', want: '"boat and fish"' },
          { label: 'The shortest stem wins', call: 'shorten_all(["ab", "abc"], "abcd")', want: '"ab"' },
          { label: 'No stems at all', call: 'shorten_all([], "keep me")', want: '"keep me"' },
          { label: 'An empty sentence', call: 'shorten_all(["a"], "")', want: '""' },
        ],
        explain: 'Add the stems first. Then split the sentence, shorten each word, and join them again with spaces.',
        hints: ['Build the trie with a loop.', 'Use `sentence.split()`.', 'Use `" ".join(short)` at the end.'],
      },
      { id: 'write-top-three', type: 'write', level: 3,
        q: 'Stretch: real autocomplete should not read every word. Finish `collect_some`, so it stops as soon as `found` has 3 words. The test counts the visits.',
        starter: join(ADD, FIND, py`
          counts = {"visits": 0}

          def collect_some(node, sofar, found):
              counts["visits"] = counts["visits"] + 1
              if END in node:
                  found.append(sofar)
              for ch in sorted(node):
                  if ch != END:
                      collect_some(node[ch], sofar + ch, found)

          def top_three(trie, start):
              found = []
              node = find_node(trie, start)
              if node is not None:
                  collect_some(node, start, found)
              return found

          trie = {}
          for w in ["cab", "cad", "cam", "can", "cap", "car", "cat"]:
              add(trie, w)
          first = top_three(trie, "ca")
          used = counts["visits"]
          small = top_three(trie, "cab")
          none = top_three(trie, "z")
        `),
        answer: join(ADD, FIND, py`
          counts = {"visits": 0}

          def collect_some(node, sofar, found):
              counts["visits"] = counts["visits"] + 1
              if END in node:
                  found.append(sofar)
              for ch in sorted(node):
                  if ch != END and len(found) < 3:
                      collect_some(node[ch], sofar + ch, found)

          def top_three(trie, start):
              found = []
              node = find_node(trie, start)
              if node is not None:
                  collect_some(node, start, found)
              return found

          trie = {}
          for w in ["cab", "cad", "cam", "can", "cap", "car", "cat"]:
              add(trie, w)
          first = top_three(trie, "ca")
          used = counts["visits"]
          small = top_three(trie, "cab")
          none = top_three(trie, "z")
        `),
        tests: [
          { label: 'The first 3 words', call: 'first', want: '["cab", "cad", "cam"]' },
          { label: 'It stops early', check: 'used <= 4' },
          { label: 'Fewer than 3 words is fine', call: 'small', want: '["cab"]' },
          { label: 'A missing start gives nothing', call: 'none', want: '[]' },
        ],
        explain: 'Check the length before each call down. Then the walk never opens a box it does not need. Slicing with `[:3]` gives the same words, but it still reads them all.',
        hints: ['Where does the walk go down?', 'Only go down while `len(found) < 3`.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 27.4 */
  Course.lesson('m27-tries-ranges', {
    id: '27-3-fenwick',
    num: '27.4',
    title: 'Fenwick trees: when the list keeps changing',
    goal: 'You can say why prefix sums struggle with changes, and code a Fenwick tree instead.',
    mins: 15,
    steps: [
      { t: 'h', text: 'What if the scores change?' },
      { t: 'p', text: 'In lesson 13.3, a prefix list answered each [[range sum]] in one step. That lesson warned you about a list that keeps changing. Now let us count what a change costs.' },
      { t: 'q', id: 'spark-fixes', type: 'mcq', level: 2,
        q: 'Count by hand. `nums` is `[4, 1, 3, 2, 6, 5]`, and `prefix` is `[0, 4, 5, 8, 10, 16, 21]`. Spot 0 gets 2 more points. How many prefix totals must change?',
        options: [
          { text: '1', why: 'That fixes only one total. But every later total includes spot 0 as well.' },
          '6',
          { text: '7', why: '`prefix[0]` is the total before any item. It stays 0.' },
        ],
        answer: 1,
        explain: 'Every total from `prefix[1]` to `prefix[6]` includes spot 0. That makes 6.',
        hints: ['Which totals include spot 0?'],
      },
      { t: 'viz', name: 'm27-prefix-break', caption: 'Guess the fixes, then watch the steps box. Try spot 5, then an empty list.' },
      { t: 'code', caption: 'Now use 1000 items. Change the spot, and guess the steps first.',
        output: 'steps for spot 0: 1000\nsteps for spot 999: 1',
        code: py`
          def fix_steps(nums, spot):
              prefix = [0]
              for n in nums:
                  prefix.append(prefix[-1] + n)
              steps = 0
              for i in range(spot + 1, len(prefix)):
                  prefix[i] = prefix[i] + 5
                  steps = steps + 1
              return steps

          nums = [1] * 1000
          print("steps for spot 0:", fix_steps(nums, 0))
          print("steps for spot 999:", fix_steps(nums, 999))
        `,
      },
      { t: 'table', caption: 'Each way has one weak side, with n items', head: ['Way', 'Change one item', 'One range sum'], rows: [
        ['Plain list', '1 step', 'up to n steps'],
        ['Prefix list', 'up to n steps', '1 step'],
      ] },
      { t: 'analogy', title: 'Picture a tournament scoreboard', text: 'A board shows a total for each pair of teams, then each pair of pairs. If one team scores, only the few boards above it change. To total some teams, you read a few boards. In a real tournament, losers go home. Here every team stays in.' },
      { t: 'big', text: 'Keep totals for groups, not for every start. Then one change touches only a few groups.' },
      { t: 'words', items: [
        { word: 'Fenwick tree', say: 'FEN-wick', means: 'A list of boxes. Each box keeps the total of a small group of items.' },
        { word: 'update', means: 'Change one item in a list.' },
      ] },
      { t: 'p', text: 'A [[Fenwick tree]] keeps only some of the boards. It is named after Peter Fenwick. It looks like a plain list, but each box covers a group. We count items from 1 here, as `prefix[1]` meant the first item.' },
      { t: 'viz', name: 'm27-fen-boxes', caption: 'Say how far each box reaches. Then look up from item 3. Try fewer items too.' },
      { t: 'q', id: 'box-twelve', type: 'mcq', level: 2,
        q: 'Use the rule from the picture. Box 12 ends at item 12. How many items does it cover?',
        options: [
          '4',
          { text: '12', why: 'Only a box numbered 1, 2, 4, 8 or 16 reaches back to item 1.' },
          { text: '2', why: '2 does divide 12, but so does 4. Take the biggest of 1, 2, 4, 8 that divides it.' },
        ],
        answer: 0,
        explain: '4 divides 12 with nothing left over, and 8 does not. So box 12 covers items 9 to 12.',
        hints: ['Try 8, then 4, then 2, then 1.'],
      },

      { t: 'h', text: 'What is `i & -i`?' },
      { t: 'p', text: 'Code needs that box size fast. Python can get it with `i & -i`. This is a trick, and it uses how computers store numbers as 0s and 1s.' },
      { t: 'tip', title: 'An honest note', text: 'Nearly nobody sees why this works at first, and you do not need to yet. Use it as a rule, and test it. In lesson 6.2, `&` was for sets. On whole numbers it has a different job.' },
      { t: 'code', caption: 'Run the test. Does the trick match the rule from the picture? Try up to 32.',
        output: '1 1 1\n2 2 2\n3 1 1\n4 4 4\n5 1 1\n6 2 2\n7 1 1\n8 8 8\n12 4 4',
        code: py`
          def size(i):
              return i & -i

          def by_hand(i):
              best = 1
              for power in [2, 4, 8, 16]:
                  if i % power == 0:
                      best = power
              return best

          for i in [1, 2, 3, 4, 5, 6, 7, 8, 12]:
              print(i, size(i), by_hand(i))
        `,
      },

      { t: 'h', text: 'How do you add up the first i items?' },
      { t: 'p', text: 'Start at box i. It covers the last `size(i)` items of what you want. So jump back by that size, and read the box that ends there.' },
      { t: 'viz', name: 'm27-fen-total', caption: 'Pick the next box before you step. Then try `i` = 8, `i` = 0, and your own numbers.' },
      { t: 'code', caption: '`total(boxes, i)` means the same as `prefix[i]`. So a range sum is still 2 totals and a take-away. Try `add(boxes, 1, 10)` before the prints.',
        output: '[0, 4, 5, 3, 10, 6, 11, 2, 30]\n21\n12',
        code: join(FEN, FEN_BUILD, py`
          nums = [4, 1, 3, 2, 6, 5, 2, 7]
          boxes = make_boxes(nums)
          print(boxes)
          print(total(boxes, 6))
          print(total(boxes, 5) - total(boxes, 1))
        `),
      },
      { t: 'q', id: 'order-total', type: 'order', level: 2,
        q: 'Put the lines in order, to make `total`.',
        lines: [
          'def total(boxes, i):',
          '    answer = 0',
          '    while i > 0:',
          '        answer = answer + boxes[i]',
          '        i = i - (i & -i)',
          '    return answer',
        ],
        extra: ['        i = i + (i & -i)'],
        explain: 'To add up, you jump back toward item 1. The extra line jumps forward, which is the move for a change.',
        hints: ['Read the box first, then jump.', 'Which way is item 1?'],
      },

      { t: 'h', text: 'How do you change one item?' },
      { t: 'p', text: 'You saw that boxes 3, 4 and 8 cover item 3. Only those need fixing. Going forward with `i + size(i)` lands on exactly those. This is the second part of the trick, so test it too.' },
      { t: 'viz', name: 'm27-fen-add', caption: 'Pick the next box. Compare the count with the 6 fixes a prefix list needed. Try item 1 and item 8.' },
      { t: 'code', caption: 'This test compares the jumps with what the picture says, for every item up to 64. Change 64 to a bigger number, and run it again.',
        output: 'item 3 boxes: [3, 4, 8, 16, 32, 64]\nall match: True',
        code: py`
          def size(i):
              return i & -i

          def jumps(item, n):
              seen = []
              i = item
              while i <= n:
                  seen.append(i)
                  i = i + size(i)
              return seen

          def covers(box, item):
              return box - size(box) < item <= box

          def from_picture(item, n):
              seen = []
              for box in range(1, n + 1):
                  if covers(box, item):
                      seen.append(box)
              return seen

          n = 64
          ok = True
          for item in range(1, n + 1):
              if jumps(item, n) != from_picture(item, n):
                  ok = False
          print("item 3 boxes:", jumps(3, n))
          print("all match:", ok)
        `,
      },
      { t: 'q', id: 'count-jumps', type: 'mcq', level: 2,
        q: 'Count by hand. A Fenwick tree has 8 boxes. Item 1 changes. Which boxes change?',
        options: [
          '1, 2, 4 and 8',
          { text: 'All 8 boxes', why: 'That is the prefix list way. Odd boxes like 3 and 5 do not cover item 1.' },
          { text: 'Only box 1', why: 'Boxes 2, 4 and 8 reach back to item 1, so their totals change too.' },
        ],
        answer: 0,
        explain: 'Start at 1. The size doubles each time: 1 + 1 is 2, 2 + 2 is 4, and 4 + 4 is 8.',
        hints: ['Use `i + size(i)`, starting at 1.'],
      },
      { t: 'code', caption: 'A race on 1000 items: 100 changes to the first item, and 100 sums of the whole list. The counts skip the first build. Change the 100s, and guess first.',
        output: 'plain list: 100100\nprefix list: 100100\nfenwick: 1600',
        code: join(FEN, FEN_BUILD, py`
          n = 1000
          nums = [1] * n
          rounds = 100

          # Plain list: a change is 1 step, a sum walks all n.
          plain = 0
          for r in range(rounds):
              nums[0] = nums[0] + 1
              plain = plain + 1
              answer = 0
              for x in nums:
                  answer = answer + x
                  plain = plain + 1

          # Prefix list: a change fixes all n, a sum is 1 step.
          prefix = [0]
          for x in nums:
              prefix.append(prefix[-1] + x)
          pre = 0
          for r in range(rounds):
              for i in range(1, n + 1):
                  prefix[i] = prefix[i] + 1
                  pre = pre + 1
              answer = prefix[n] - prefix[0]
              pre = pre + 1

          # Fenwick: count one step per box touched.
          boxes = make_boxes(nums)
          fen = 0
          for r in range(rounds):
              i = 1
              while i <= n:
                  boxes[i] = boxes[i] + 1
                  fen = fen + 1
                  i = i + size(i)
              i = n
              while i > 0:
                  fen = fen + 1
                  i = i - size(i)

          print("plain list:", plain)
          print("prefix list:", pre)
          print("fenwick:", fen)
        `),
      },
      { t: 'cost', title: 'How fast is it, with n items?', items: [
        { op: 'Change one item', cost: 'O(log n)', why: 'You counted 4 boxes for 8 items. In 1000 items, it is 10 boxes at most.' },
        { op: 'Add up the first i items', cost: 'O(log n)', why: 'Each jump clears one more group. In 1000 items, it is 9 boxes at most.' },
        { op: 'Build with n calls to `add`', cost: 'O(n log n)', why: 'Each of the n items costs one `add`.' },
      ] },
      { t: 'trap',
        think: 'item numbers can start at 0, like list spots.',
        real: 'Then `i & -i` is 0, so `i` never moves and the loop never ends. Box 0 is not used. To change list spot `s`, call `add` with `s + 1`.',
        code: py`
          add(boxes, 0, 5)       # never ends!
          add(boxes, s + 1, 5)   # right
        `,
      },
      { t: 'tip', title: 'How to recognize it', text: 'Look for **many range totals** and **the list also changes**. If the list stays the same, use a prefix list, as it is simpler. A Fenwick tree works because totals can be undone with a take-away. The next lesson shows what to do when they cannot.' },
    ],
    recap: [
      'You can count the steps a prefix list needs after a change.',
      'You can read which items a box covers.',
      'You can use `i & -i` to change an item and add up items.',
    ],
    practice: [
      { id: 'match-fen', type: 'match', level: 1,
        q: 'Match each part to what it does.',
        pairs: [
          ['`i & -i`', 'Gives how many items box i covers'],
          ['`i = i - size(i)`', 'Jumps back, to add up items'],
          ['`i = i + size(i)`', 'Jumps on, to fix the boxes for a change'],
        ],
        explain: 'Going back collects groups toward item 1. Going forward finds every box that covers an item.',
        hints: ['Which way is item 1?'],
      },
      { id: 'trace-total', type: 'trace', level: 2,
        q: 'Trace `total(boxes, 13)`. Fill in `i` and `size(i)` each time round the loop. `i & -i` is the biggest of 1, 2, 4, 8, 16 that divides `i`.',
        code: py`
          i = 13
          while i > 0:
              s = i & -i
              i = i - s
        `,
        head: ['i', 'size'],
        rows: [['13', '1'], ['12', '4'], ['8', '8']],
        given: 1,
        verify: py`
          i = 13
          while i > 0:
              s = i & -i
              print(i, s)
              i = i - s
        `,
        explain: '13 is odd, so its size is 1. Then 12 has size 4, and 8 has size 8. That lands on 0, so the loop stops.',
        hints: ['12 divides by 4, but not by 8.', 'What is 12 - 4?'],
      },
      { id: 'type-boxes', type: 'predict', level: 2,
        q: 'What will the screen show? Work out each box from what it covers.',
        code: join(FEN, FEN_BUILD, py`
          boxes = make_boxes([3, 1, 4, 2])
          print(boxes)
        `),
        answer: '[0, 3, 4, 4, 10]',
        why: 'Box 1 covers item 1, which is 3. Box 2 covers items 1 and 2, so 4. Box 3 covers item 3, so 4. Box 4 covers them all, so 10.',
        explain: 'Spot 0 stays unused. Each other box is the total of the items it covers.',
        hints: ['Box 2 covers 2 items.', 'Box 4 covers 4 items.'],
      },
      { id: 'pick-tool', type: 'mcq', level: 2,
        q: 'A game has 5000 players. Scores change all the time, and you often need the total of a range of players. Which fits best?',
        options: [
          'A Fenwick tree',
          { text: 'A prefix list', why: 'That fits a list that stays the same. Each score change could fix up to 5000 totals here.' },
          { text: 'A plain list', why: 'Changes are fast, but each range total could add up to 5000 items.' },
        ],
        answer: 0,
        explain: 'Both jobs happen often. Here a change takes about 13 steps, and a range total about twice that. Both beat 5000.',
        hints: ['Which words say the list changes?'],
      },
      { id: 'fix-new-value', type: 'fix', level: 2,
        q: '`set_item` should make a spot hold a new value. But `add` wants the difference, not the new value. Fix the call on the last line of `set_item`.',
        code: join(FEN, FEN_BUILD, py`
          def set_item(nums, boxes, spot, value):
              change = value - nums[spot]
              nums[spot] = value
              add(boxes, spot + 1, value)

          nums = [5, 5, 5, 5]
          boxes = make_boxes(nums)
          set_item(nums, boxes, 1, 7)
        `),
        answer: join(FEN, FEN_BUILD, py`
          def set_item(nums, boxes, spot, value):
              change = value - nums[spot]
              nums[spot] = value
              add(boxes, spot + 1, change)

          nums = [5, 5, 5, 5]
          boxes = make_boxes(nums)
          set_item(nums, boxes, 1, 7)
        `),
        tests: [
          { label: 'The first 2 items now add up to 12', call: 'total(boxes, 2)', want: '12' },
          { label: 'All 4 items add up to 22', call: 'total(boxes, 4)', want: '22' },
          { label: 'The first item is unchanged', call: 'total(boxes, 1)', want: '5' },
        ],
        explain: 'A box keeps a running total. So it must grow by the difference, which is 7 - 5 here. Adding all of 7 counts the old 5 twice.',
        hints: ['How much did the spot really grow?', 'Use the name `change`, already worked out on line 2.'],
      },
      { id: 'write-range', type: 'write', level: 2,
        q: 'Write `range_sum(boxes, a, b)`. It gives the total of `nums[a:b]`, using `total`. Spot b stays out, as in a slice.',
        starter: join(FEN, FEN_BUILD, py`
          def range_sum(boxes, a, b):
              # Your code here.
              return None

          boxes = make_boxes([4, 1, 3, 2, 6])
        `),
        answer: join(FEN, FEN_BUILD, py`
          def range_sum(boxes, a, b):
              return total(boxes, b) - total(boxes, a)

          boxes = make_boxes([4, 1, 3, 2, 6])
        `),
        tests: [
          { label: 'nums[1:4] adds up to 6', call: 'range_sum(boxes, 1, 4)', want: '6' },
          { label: 'The whole list adds up to 16', call: 'range_sum(boxes, 0, 5)', want: '16' },
          { label: 'An empty range gives 0', call: 'range_sum(boxes, 2, 2)', want: '0' },
          { label: 'nums[4:5] is the last item', call: 'range_sum(boxes, 4, 5)', want: '6' },
        ],
        explain: '`total(boxes, i)` means the same as `prefix[i]`. So use the subtraction from lesson 13.3.',
        hints: ['What did `prefix[b] - prefix[a]` give in lesson 13.3?'],
      },
      { id: 'write-scoreboard', type: 'write', level: 3,
        q: 'Stretch: finish the class `Scores`. `change(spot, value)` makes a spot hold a new value. `range_sum(a, b)` gives the total of `nums[a:b]`. Keep your own copy of the numbers.',
        starter: join(FEN, FEN_BUILD, py`
          class Scores:
              def __init__(self, nums):
                  self.nums = list(nums)
                  self.boxes = make_boxes(nums)

              def change(self, spot, value):
                  # Your code here.
                  return None

              def range_sum(self, a, b):
                  # Your code here.
                  return None

          game = Scores([4, 1, 3, 2])
          before = game.range_sum(1, 3)
          game.change(1, 10)
          after = game.range_sum(1, 3)
          whole = game.range_sum(0, 4)
          game.change(1, 10)
          same = game.range_sum(0, 4)
        `),
        answer: join(FEN, FEN_BUILD, py`
          class Scores:
              def __init__(self, nums):
                  self.nums = list(nums)
                  self.boxes = make_boxes(nums)

              def change(self, spot, value):
                  diff = value - self.nums[spot]
                  self.nums[spot] = value
                  add(self.boxes, spot + 1, diff)

              def range_sum(self, a, b):
                  return total(self.boxes, b) - total(self.boxes, a)

          game = Scores([4, 1, 3, 2])
          before = game.range_sum(1, 3)
          game.change(1, 10)
          after = game.range_sum(1, 3)
          whole = game.range_sum(0, 4)
          game.change(1, 10)
          same = game.range_sum(0, 4)
        `),
        tests: [
          { label: 'Before the change', call: 'before', want: '4' },
          { label: 'After the change', call: 'after', want: '13' },
          { label: 'The whole list after it', call: 'whole', want: '19' },
          { label: 'Setting the same value again changes nothing', call: 'same', want: '19' },
          { label: 'The copy of the numbers is kept right', call: 'game.nums', want: '[4, 10, 3, 2]' },
        ],
        explain: 'Work out the difference before you replace the old value. Then call `add` with `spot + 1`, because boxes count from 1.',
        hints: ['Find `value - self.nums[spot]` first.', 'Then update `self.nums[spot]`.', 'Boxes count from 1, so use `spot + 1`.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 27.5 */
  Course.lesson('m27-tries-ranges', {
    id: '27-4-segment-tree',
    num: '27.5',
    title: 'Segment trees: the whole scoreboard',
    goal: 'You can build a segment tree, and answer a range query with its 3 cases.',
    mins: 14,
    steps: [
      { t: 'h', text: 'Can a Fenwick tree find the smallest?' },
      { t: 'p', text: 'A Fenwick tree gets a range sum by taking one total from another. Now the question is new: what is the smallest score from spot a to spot b?' },
      { t: 'q', id: 'spark-undo', type: 'mcq', level: 2,
        q: 'The smallest of the first 6 items is 1. The smallest of the first 2 items is also 1. What is the smallest of items 3 to 6?',
        options: [
          'You cannot tell from those 2 facts',
          { text: '0, since 1 - 1 is 0', why: 'That treats a smallest like a total. Take-aways undo a sum, but they do not undo a smallest.' },
          { text: '1, the same as before', why: 'That 1 may sit in the first 2 items. Items 3 to 6 could all be bigger.' },
        ],
        answer: 0,
        explain: 'The 1 might be in the first 2 items. Then you know nothing about the rest. So this job needs a new tool.',
        hints: ['Where could that 1 be sitting?'],
      },
      { t: 'analogy', title: 'Back to the tournament', text: 'Now keep every board: each team, each pair, each pair of pairs, up to one top board. To answer for a range of teams, read a few boards. A real tournament stops there. Here a box can hold a total or a smallest, and nobody leaves.' },
      { t: 'words', items: [
        { word: 'segment tree', say: 'SEG-ment', means: 'A tree where each node keeps an answer for one stretch of a list.' },
      ] },
      { t: 'p', text: 'We start with totals, as they are familiar. The next lesson finds the smallest. Each node knows its stretch, `lo` up to `hi`. As in a slice, `hi` is left out.' },
      { t: 'p', text: 'A [[leaf]] covers 1 item. Any other node splits its stretch in half, and joins the answers of its 2 children.' },
      { t: 'viz', name: 'm27-seg-build', caption: 'Say each total before it shows. The small label under a box is its stretch. Then try 8 numbers, 1 number, and an empty list.' },
      { t: 'code', caption: 'This is a binary tree, as in lesson 18.1, with `lo` and `hi` added. Print `root.right.total` too, and guess first.',
        output: '21\n8\n0 3',
        code: join(SEG, py`
          nums = [4, 1, 3, 2, 6, 5]
          root = build(nums, 0, len(nums))
          print(root.total)
          print(root.left.total)
          print(root.left.lo, root.left.hi)
        `),
      },
      { t: 'tip', title: 'The Fenwick link', text: 'Remember the Fenwick boxes? They are this picture with each right child left out. A right child can be worked out by a take-away. That is why Fenwick needs fewer boxes, but only works for jobs that can be undone.' },

      { t: 'h', text: 'How do you answer a range question?' },
      { t: 'steps', title: 'Each box you visit is one of 3 cases', noun: 'Case', items: [
        { label: 'All outside', text: 'This stretch and the range share no spots. Give back 0, and go no lower.', code: 'if b <= node.lo or node.hi <= a:\n    return 0' },
        { label: 'All inside', text: 'The whole stretch is wanted. Its total is ready, so use it.', code: 'if a <= node.lo and node.hi <= b:\n    return node.total' },
        { label: 'Part inside', text: 'Ask both children, then join their answers.', code: 'left = query(node.left, a, b)\nright = query(node.right, a, b)\nreturn left + right' },
      ] },
      { t: 'viz', name: 'm27-seg-query', caption: 'Name the case before each box opens. A tick means all inside, and a cross means all outside. Then try the whole list, a = b, and a after b.' },
      { t: 'big', text: 'A box that is all inside answers for everything below it. So most of the tree stays unread.' },
      { t: 'q', id: 'name-case', type: 'mcq', level: 2,
        q: 'The range is `1:5`. Which case is box `4:8`?',
        options: [
          'Part inside',
          { text: 'All outside', why: 'Spot 4 is in both. The range `1:5` leaves out only spot 5 and later.' },
          { text: 'All inside', why: 'Spots 5, 6 and 7 are not wanted. So its ready total is too big.' },
        ],
        answer: 0,
        explain: 'Spot 4 is wanted, and spots 5 to 7 are not. So the box must ask its children.',
        hints: ['Which spots does `4:8` cover?', 'Which of those are in `1:5`?'],
      },
      { t: 'q', id: 'count-whole', type: 'mcq', level: 2,
        q: 'Count by hand. A tree covers 8 items. How many boxes does `query(root, 0, 8)` visit?',
        options: [
          '1',
          { text: '8', why: 'That adds up each item. But the top box is all inside, so its total is ready.' },
          { text: '15', why: 'That visits every box. The first case that fits ends the call at once.' },
        ],
        answer: 0,
        explain: 'The top box covers `0:8`, and all of it is wanted. So it answers, and nothing below is read.',
        hints: ['Which case is the top box?'],
      },
      { t: 'code', caption: 'Each row shows the range, its total, and the boxes visited. Try `(3, 4)`, and guess first.',
        output: '(0, 8) 36 1\n(1, 7) 27 11\n(2, 2) 0 5',
        code: join(SEG, py`
          counts = {"visits": 0}

          def query(node, a, b):
              counts["visits"] = counts["visits"] + 1
              if b <= node.lo or node.hi <= a:
                  return 0
              if a <= node.lo and node.hi <= b:
                  return node.total
              left = query(node.left, a, b)
              right = query(node.right, a, b)
              return left + right

          nums = [1, 2, 3, 4, 5, 6, 7, 8]
          root = build(nums, 0, 8)
          for a, b in [(0, 8), (1, 7), (2, 2)]:
              counts["visits"] = 0
              answer = query(root, a, b)
              print((a, b), answer, counts["visits"])
        `),
      },
      { t: 'code', caption: 'Now grow the list. Each row shows the items, all the boxes, and the most boxes a range visited. Try a list of 2048.',
        output: '8 15 11\n64 127 23\n1024 2047 39',
        code: join(SEG, py`
          counts = {"visits": 0}

          def query(node, a, b):
              counts["visits"] = counts["visits"] + 1
              if b <= node.lo or node.hi <= a:
                  return 0
              if a <= node.lo and node.hi <= b:
                  return node.total
              left = query(node.left, a, b)
              right = query(node.right, a, b)
              return left + right

          for n in [8, 64, 1024]:
              root = build([1] * n, 0, n)
              worst = 0
              for a in range(1, n // 2):
                  counts["visits"] = 0
                  query(root, a, n // 2 + a)
                  worst = max(worst, counts["visits"])
              print(n, 2 * n - 1, worst)
        `),
      },
      { t: 'cost', title: 'How fast is it, with n items?', items: [
        { op: 'Build', cost: 'O(n)', why: 'You counted 2n - 1 boxes, and each one joins once.' },
        { op: 'One range query', cost: 'O(log n)', why: 'At most about 4 boxes per level. The code showed 39 visits for 1024 items.' },
      ] },
      { t: 'trap',
        think: 'a segment tree always beats adding up with a loop.',
        real: 'On a tiny list, it does not. For `(1, 7)` on 8 items, the code visited 11 boxes. A loop adds only 6 items. The tree pays off when lists are long.',
      },
      { t: 'tip', title: 'Odd cases to test', text: 'An empty list has no tree, so check for it before you build. An empty range like `(2, 2)` gives 0. A list of 1 is a single [[leaf]], and it is also the top box.' },
    ],
    recap: [
      'You can build a segment tree from the bottom up.',
      'You can name the 3 cases of a range query.',
      'You can say why a query reads only a few boxes.',
    ],
    practice: [
      { id: 'match-cases', type: 'match', level: 1,
        q: 'The range is `2:6`. Match each box to its case.',
        pairs: [
          ['Box `2:4`', 'All inside'],
          ['Box `6:8`', 'All outside'],
          ['Box `0:4`', 'Part inside'],
        ],
        explain: 'Box `6:8` starts where the range stops, and `6` is left out. Box `0:4` has spots 0 and 1, which are not wanted.',
        hints: ['Spot 6 is left out of the range.'],
      },
      { id: 'count-boxes-tree', type: 'mcq', level: 1,
        q: 'A list has 5 items. How many boxes does its segment tree have?',
        options: [
          '9',
          { text: '5', why: 'That counts only the leaves. Every join needs a box as well.' },
          { text: '10', why: 'That is 2 x 5. But each join uses 2 boxes to make 1, so it is 1 fewer.' },
        ],
        answer: 0,
        explain: 'There are 5 leaves and 4 joins. That is 2 x 5 - 1, which is 9.',
        hints: ['How many leaves are there?', 'A tree with n leaves has n - 1 joins.'],
      },
      { id: 'type-query', type: 'predict', level: 2,
        q: 'What will the screen show? Type it, with one number per line.',
        code: join(SEG, QUERY, py`
          root = build([2, 7, 1, 3], 0, 4)
          print(query(root, 1, 3))
          print(query(root, 0, 4))
          print(query(root, 3, 3))
        `),
        answer: '8\n13\n0',
        why: 'First 7 + 1 is 8. The whole list is 13. The range `3:3` holds no items, so it gives 0.',
        explain: 'Spot 3 is left out of `1:3`. The top box answers `0:4` at once.',
        hints: ['Which spots does `1:3` cover?'],
      },
      { id: 'fix-outside', type: 'fix', level: 2,
        q: '`query` stops with an AttributeError. It reaches a leaf and asks for `node.left`. One test forgets that `hi` is left out. Fix the first `if`.',
        code: join(SEG, py`
          def query(node, a, b):
              if b < node.lo or node.hi < a:
                  return 0
              if a <= node.lo and node.hi <= b:
                  return node.total
              left = query(node.left, a, b)
              right = query(node.right, a, b)
              return left + right

          root = build([4, 1, 3, 2], 0, 4)
        `),
        answer: join(SEG, QUERY, py`
          root = build([4, 1, 3, 2], 0, 4)
        `),
        tests: [
          { label: 'nums[1:3] adds up to 4', call: 'query(root, 1, 3)', want: '4' },
          { label: 'nums[2:4] adds up to 5', call: 'query(root, 2, 4)', want: '5' },
          { label: 'An empty range gives 0', call: 'query(root, 2, 2)', want: '0' },
        ],
        explain: 'Box `0:2` and range `2:4` share no spots, as the box leaves out spot 2. So outside must use `<=`.',
        hints: ['Do box `0:2` and range `2:4` share a spot?', 'Use `<=` in both parts of the first `if`.'],
      },
      { id: 'write-case', type: 'write', level: 2,
        q: 'Write `which_case(lo, hi, a, b)`. It returns `"outside"`, `"inside"` or `"part"` for a box `lo:hi` and a range `a:b`.',
        starter: py`
          def which_case(lo, hi, a, b):
              # Your code here.
              return None
        `,
        answer: py`
          def which_case(lo, hi, a, b):
              if b <= lo or hi <= a:
                  return "outside"
              if a <= lo and hi <= b:
                  return "inside"
              return "part"
        `,
        tests: [
          { label: 'Box 2:4 in range 2:6', call: 'which_case(2, 4, 2, 6)', want: '"inside"' },
          { label: 'Box 6:8 and range 2:6', call: 'which_case(6, 8, 2, 6)', want: '"outside"' },
          { label: 'Box 0:4 and range 2:6', call: 'which_case(0, 4, 2, 6)', want: '"part"' },
          { label: 'Box 0:2 and range 2:6', call: 'which_case(0, 2, 2, 6)', want: '"outside"' },
          { label: 'Any box and an empty range', call: 'which_case(0, 4, 2, 2)', want: '"part"' },
        ],
        explain: 'Test outside first, then inside. Anything left over must be part inside. An empty range inside a box is "part", and the children sort it out.',
        hints: ['Copy the 2 tests from `query`.', 'What is left when both tests fail?'],
      },
      { id: 'write-pieces', type: 'write', level: 3,
        q: 'Stretch: write `pieces(node, a, b)`. It returns a list of `(lo, hi)` pairs, one for each box that is all inside. Go from left to right. These boxes answer the range.',
        starter: join(SEG, py`
          def pieces(node, a, b):
              # Your code here.
              return None

          root = build([4, 1, 3, 2, 6, 5], 0, 6)
        `),
        answer: join(SEG, py`
          def pieces(node, a, b):
              if b <= node.lo or node.hi <= a:
                  return []
              if a <= node.lo and node.hi <= b:
                  return [(node.lo, node.hi)]
              return pieces(node.left, a, b) + pieces(node.right, a, b)

          root = build([4, 1, 3, 2, 6, 5], 0, 6)
        `),
        tests: [
          { label: 'The whole list is one box', call: 'pieces(root, 0, 6)', want: '[(0, 6)]' },
          { label: 'The range 1:5 from the picture', call: 'pieces(root, 1, 5)', want: '[(1, 3), (3, 4), (4, 5)]' },
          { label: 'One spot', call: 'pieces(root, 2, 3)', want: '[(2, 3)]' },
          { label: 'An empty range', call: 'pieces(root, 3, 3)', want: '[]' },
        ],
        explain: 'It has the 3 cases of `query`, with lists in place of numbers. Outside gives an empty list, and the join puts the 2 lists together.',
        hints: ['Outside gives `[]`.', 'Inside gives a list with one pair.', 'The join uses `+` on 2 lists.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 27.6 */
  Course.lesson('m27-tries-ranges', {
    id: '27-5-seg-update',
    num: '27.6',
    title: 'Segment trees: change an item, find the smallest',
    goal: 'You can update a segment tree, and change its join to find the smallest.',
    mins: 13,
    steps: [
      { t: 'h', text: 'What if one item changes?' },
      { t: 'p', text: 'A prefix list had to fix nearly every total. A segment tree has many boxes too. So how many of them go wrong?' },
      { t: 'q', id: 'count-path', type: 'mcq', level: 2,
        q: 'Count by hand. A list of 8 items has a tree of 4 levels. How many boxes cover one spot?',
        options: [
          '4',
          { text: '15', why: 'That is every box in the tree. Only the boxes above the item cover it.' },
          { text: '8', why: 'That is the number of leaves. One item has one leaf, and one path above it.' },
        ],
        answer: 0,
        explain: 'Stretches on one level do not overlap. So each level has one box that covers the spot.',
        hints: ['How many boxes on each level cover one spot?'],
      },
      { t: 'p', text: 'Only those boxes are wrong. They form one path from the top down to a [[leaf]]. So walk down, set the leaf, and join again on the way back.' },
      { t: 'viz', name: 'm27-seg-update', caption: 'Pick the side, then work out each new total. Try the first spot, the last spot, and a list of 1.' },
      { t: 'big', text: 'One change fixes one path, and a path has one box per level.' },
      { t: 'q', id: 'fill-update', type: 'fill', level: 2,
        q: 'Fill the gaps. The last gap is the line people forget.',
        code: join(SEG, py`
          def update(node, i, value):
              if node.hi - node.lo == 1:
                  node.total = ____
                  return
              if i < node.left.hi:
                  update(node.left, i, value)
              else:
                  update(node.right, i, value)
              node.total = node.left.total + ____

          root = build([1, 2, 3, 4], 0, 4)
          update(root, 2, 10)
          print(root.total)
        `),
        blanks: ['value', 'node.right.total'],
        output: '17',
        explain: 'The leaf takes the new value. Each box above then joins its children again, and 1 + 2 + 10 + 4 is 17.',
        hints: ['What does the leaf hold after the change?', 'A total joins both children.'],
      },
      { t: 'code', caption: 'A range that misses spot 1 stays the same. Update a different spot, and guess the answers first.',
        output: '21\n8\n29\n16\n11',
        code: join(SEG, QUERY, UPDATE, py`
          nums = [4, 1, 3, 2, 6, 5]
          root = build(nums, 0, len(nums))
          print(root.total)
          print(query(root, 0, 3))
          update(root, 1, 9)
          print(root.total)
          print(query(root, 0, 3))
          print(query(root, 4, 6))
        `),
      },
      { t: 'trap',
        think: 'after setting the leaf, the job is done.',
        real: 'Every box above still holds the old total. The join line after the 2 calls fixes them, one by one, on the way back.',
        code: py`
          update(node.left, i, value)
          # Without the next line, the top stays out of date.
          node.total = node.left.total + node.right.total
        `,
      },
      { t: 'code', caption: 'Each row shows the items, then the boxes one change fixes. Try spot `n - 1`, and try 2048 items.',
        output: '8 4\n64 7\n1024 11',
        code: join(SEG, py`
          counts = {"fixed": 0}

          def update(node, i, value):
              counts["fixed"] = counts["fixed"] + 1
              if node.hi - node.lo == 1:
                  node.total = value
                  return
              if i < node.left.hi:
                  update(node.left, i, value)
              else:
                  update(node.right, i, value)
              node.total = node.left.total + node.right.total

          for n in [8, 64, 1024]:
              root = build([1] * n, 0, n)
              counts["fixed"] = 0
              update(root, 0, 5)
              print(n, counts["fixed"])
        `),
      },
      { t: 'cost', title: 'How fast is a change, with n items?', items: [
        { op: 'Change one item', cost: 'O(log n)', why: 'One box per level. You counted 4 boxes for 8 items, and the code showed 11 for 1024.' },
      ] },

      { t: 'h', text: 'What about the smallest?' },
      { t: 'p', text: 'As in lesson 18.4, only the join line changes. Use `min` where you used `+`. An outside box must not win, so it gives back `float("inf")`. That is a value bigger than any number.' },
      { t: 'viz', name: 'm27-seg-min', params: { nums: '5 2 8 1', a: 1, b: 3 }, caption: 'The same 3 cases, with a new join. Then try a range that holds no items, and read the answer.' },
      { t: 'code', caption: 'Now `node.best` names the smallest in that stretch. Try `smallest(root, 0, 2)`, and guess first.',
        output: '2\n1\ninf',
        code: join(MIN, SMALLEST, py`
          root = build_min([5, 2, 8, 1], 0, 4)
          print(smallest(root, 1, 3))
          print(smallest(root, 0, 4))
          print(smallest(root, 2, 2))
        `),
      },
      { t: 'q', id: 'why-inf', type: 'mcq', level: 2,
        q: 'Why does an outside box return `float("inf")`, and not 0?',
        options: [
          '`min` would pick 0, even though no such item is in the range',
          { text: 'Python cannot compare 0 with other numbers', why: 'It can. That is the trouble: 0 would beat every real value above 0.' },
          { text: '`inf` is faster to work out than 0', why: 'Speed is not the reason. The value must lose every `min`.' },
        ],
        answer: 0,
        explain: 'An outside box has nothing to say, so its answer must lose. `inf` is bigger than any real value, so `min` never picks it over one.',
        hints: ['What is `min(0, 5)`?'],
      },
      { t: 'table', caption: 'How to recognize it: which tool fits?', head: ['The problem says', 'Think about'], rows: [
        ['Many range totals, a list that stays the same', 'Prefix list'],
        ['Many range totals, and the list changes', 'Fenwick tree'],
        ['Smallest or biggest in a range, and the list changes', '[[Segment tree|segment tree]]'],
      ] },
      { t: 'tip', title: 'One idea for later', text: 'What if a whole range changes at once? A box can keep a note: add 5 to all below. It passes the note down only when asked. This idea is called lazy propagation. You do not need it here.' },
    ],
    recap: [
      'You can change one item and fix one path.',
      'You can change the join to find the smallest.',
      'You can pick a prefix list, a Fenwick tree or a segment tree.',
    ],
    practice: [
      { id: 'match-joins', type: 'match', level: 1,
        q: 'Match each job to its join line, and what an outside box gives back.',
        pairs: [
          ['Total of a range', '`left + right`, and outside gives 0'],
          ['Smallest in a range', '`min(left, right)`, and outside gives `float("inf")`'],
          ['Biggest in a range', '`max(left, right)`, and outside gives `-float("inf")`'],
        ],
        explain: 'An outside box gives back a value that changes nothing. Adding 0 changes nothing, and `inf` loses every `min`.',
        hints: ['What value leaves a sum unchanged?'],
      },
      { id: 'pick-seg', type: 'mcq', level: 2,
        q: 'A weather app keeps 10000 daily highs. Old days get fixed now and then. People ask for the lowest high between 2 dates. Which fits best?',
        options: [
          'A segment tree that keeps the smallest',
          { text: 'A Fenwick tree', why: 'A Fenwick range needs a take-away to undo a part. A smallest cannot be undone that way.' },
          { text: 'A prefix list', why: 'That only adds up, and each fix could touch 10000 totals.' },
        ],
        answer: 0,
        explain: '"Lowest" plus "fixed now and then" is the clue. A segment tree handles both in O(log n).',
        hints: ['Can a smallest be undone with a take-away?'],
      },
      { id: 'type-update', type: 'predict', level: 2,
        q: 'What will the screen show? Type it, with one number per line.',
        code: join(SEG, QUERY, UPDATE, py`
          root = build([2, 7, 1, 3], 0, 4)
          print(query(root, 1, 3))
          update(root, 2, 5)
          print(query(root, 1, 3))
          print(root.total)
        `),
        answer: '8\n12\n17',
        why: 'First 7 + 1 is 8. Then spot 2 becomes 5, so 7 + 5 is 12. The whole list is now 2 + 7 + 5 + 3.',
        explain: 'Spot 3 is left out of the range `1:3`. `update` also fixes the top box, so `root.total` is right.',
        hints: ['Which spots does `1:3` cover?', 'After the update, spot 2 holds 5.'],
      },
      { id: 'fix-rejoin', type: 'fix', level: 2,
        q: 'After `update`, the leaf is right but the top total is out of date. Fix `update`.',
        code: join(SEG, py`
          def update(node, i, value):
              if node.hi - node.lo == 1:
                  node.total = value
                  return
              if i < node.left.hi:
                  update(node.left, i, value)
              else:
                  update(node.right, i, value)

          root = build([1, 2, 3], 0, 3)
          update(root, 0, 10)
          one = build([4], 0, 1)
          update(one, 0, 9)
        `),
        answer: join(SEG, UPDATE, py`
          root = build([1, 2, 3], 0, 3)
          update(root, 0, 10)
          one = build([4], 0, 1)
          update(one, 0, 9)
        `),
        tests: [
          { label: 'The top total is 15', call: 'root.total', want: '15' },
          { label: 'The left box is 10', call: 'root.left.total', want: '10' },
          { label: 'A list of 1 still works', call: 'one.total', want: '9' },
        ],
        explain: 'Each box on the path must join its children again after the call below it returns.',
        hints: ['Which line in `build` joins the children?', 'Put the same line after the `if` and `else`.'],
      },
      { id: 'write-biggest', type: 'write', level: 2,
        q: 'Write `biggest(node, a, b)`. It returns the biggest of `nums[a:b]`. Here `node.best` names the biggest in that stretch. For an outside box, return `-float("inf")`.',
        starter: py`
          class MaxNode:
              def __init__(self, lo, hi):
                  self.lo = lo
                  self.hi = hi
                  self.best = 0
                  self.left = None
                  self.right = None

          def build_max(nums, lo, hi):
              node = MaxNode(lo, hi)
              if hi - lo == 1:
                  node.best = nums[lo]
                  return node
              mid = (lo + hi) // 2
              node.left = build_max(nums, lo, mid)
              node.right = build_max(nums, mid, hi)
              node.best = max(node.left.best, node.right.best)
              return node

          def biggest(node, a, b):
              # Your code here.
              return None

          root = build_max([3, 9, 2, 7, 4], 0, 5)
        `,
        answer: py`
          class MaxNode:
              def __init__(self, lo, hi):
                  self.lo = lo
                  self.hi = hi
                  self.best = 0
                  self.left = None
                  self.right = None

          def build_max(nums, lo, hi):
              node = MaxNode(lo, hi)
              if hi - lo == 1:
                  node.best = nums[lo]
                  return node
              mid = (lo + hi) // 2
              node.left = build_max(nums, lo, mid)
              node.right = build_max(nums, mid, hi)
              node.best = max(node.left.best, node.right.best)
              return node

          def biggest(node, a, b):
              if b <= node.lo or node.hi <= a:
                  return -float("inf")
              if a <= node.lo and node.hi <= b:
                  return node.best
              left = biggest(node.left, a, b)
              right = biggest(node.right, a, b)
              return max(left, right)

          root = build_max([3, 9, 2, 7, 4], 0, 5)
        `,
        tests: [
          { label: 'The whole list', call: 'biggest(root, 0, 5)', want: '9' },
          { label: 'Spots 2, 3, 4', call: 'biggest(root, 2, 5)', want: '7' },
          { label: 'One spot', call: 'biggest(root, 4, 5)', want: '4' },
          { label: 'Spots 0, 1', call: 'biggest(root, 0, 2)', want: '9' },
        ],
        explain: 'Copy the 3 cases from `smallest`. Then use `max`, and make outside boxes lose with `-float("inf")`.',
        hints: ['Start from the 3 cases of `query`.', 'The join line uses `max`.'],
      },
      { id: 'write-update-min', type: 'write', level: 3,
        q: 'Stretch: write `update_min(node, i, value)` for the tree that keeps the smallest. Then a list can change, and `smallest` still gives the right answer.',
        starter: join(MIN, SMALLEST, py`
          def update_min(node, i, value):
              # Your code here.
              return None

          root = build_min([5, 2, 8, 1], 0, 4)
          update_min(root, 3, 9)
          first = smallest(root, 0, 4)
          update_min(root, 1, 7)
          second = smallest(root, 0, 4)
          third = smallest(root, 1, 3)
          one = build_min([6], 0, 1)
          update_min(one, 0, 3)
        `),
        answer: join(MIN, SMALLEST, py`
          def update_min(node, i, value):
              if node.hi - node.lo == 1:
                  node.best = value
                  return
              if i < node.left.hi:
                  update_min(node.left, i, value)
              else:
                  update_min(node.right, i, value)
              node.best = min(node.left.best, node.right.best)

          root = build_min([5, 2, 8, 1], 0, 4)
          update_min(root, 3, 9)
          first = smallest(root, 0, 4)
          update_min(root, 1, 7)
          second = smallest(root, 0, 4)
          third = smallest(root, 1, 3)
          one = build_min([6], 0, 1)
          update_min(one, 0, 3)
        `),
        tests: [
          { label: 'The 1 became 9, so 2 is smallest', call: 'first', want: '2' },
          { label: 'The 2 became 7, so 5 is smallest', call: 'second', want: '5' },
          { label: 'Spots 1 and 2 hold 7 and 8', call: 'third', want: '7' },
          { label: 'A list of 1', call: 'one.best', want: '3' },
        ],
        explain: 'It has the shape of `update`, with `best` in place of `total`. When the old smallest grows, the join finds the new one.',
        hints: ['Copy the shape of `update`.', 'Set `node.best` at the leaf.', 'Join with `min` on the way back.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 27.3 */
  Course.lesson('m27-tries-ranges', {
    id: '27-6-grid-words',
    num: '27.3',
    title: 'One last trie job: many words in a grid',
    goal: 'You can walk a grid and a trie together, to find many words at once.',
    mins: 12,
    steps: [
      { t: 'h', text: 'Can you find many words in a grid?' },
      { t: 'p', text: 'Lesson 19.5 found one word in a grid. For many words, you could run that search once per word. But `car`, `cart` and `care` all repeat the same first steps. A [[trie]] lets them share those steps.' },
      { t: 'q', id: 'spark-share', type: 'mcq', level: 2,
        q: 'Count by hand. You search for `car`, `cart` and `care`, one word at a time. How many times do you walk the path `c`, `a`, `r`?',
        options: [
          { text: '1', why: 'That is the trie way. Word by word, each search starts again from nothing.' },
          '3',
          { text: '9', why: 'That counts letters. The question asks how many times the whole path is walked.' },
        ],
        answer: 1,
        explain: 'Each of the 3 searches walks `c`, `a`, `r` for itself. With a trie, they share 1 walk.',
        hints: ['How many searches start from nothing?'],
      },
      { t: 'viz', name: 'm27-grid-trie', caption: 'Answer "what happens next?" as you go. Then try a word that is not there, and a grid with no matches.' },
      { t: 'big', text: 'When the trie has no box for the next letter, no word can go that way. So stop at once.' },
      { t: 'steps', title: 'One step of the walk', items: [
        { label: 'Check the letter', text: 'If this box has no key for the cell, no word goes this way.', code: 'ch = board[r][c]\nif ch not in node:\n    return' },
        { label: 'Step down the trie', text: 'Move the tag down, and add the letter. An end mark means you found a word.', code: 'node = node[ch]\nsofar = sofar + ch\nif END in node:\n    found.add(sofar)' },
        { label: 'Choose, explore, un-choose', text: 'These are the moves from lesson 19.5. The mark stops this path from using the cell twice.', code: 'board[r][c] = "#"\nfor dr, dc in MOVES:\n    find(r + dr, c + dc, node, sofar)\nboard[r][c] = ch' },
      ] },
      { t: 'code', caption: 'Add `"tea"` and `"ore"` to the words, and guess which ones it finds. Found words go in a set, so sort before you print.',
        output: "['car', 'cat', 'core', 'dog']",
        code: join(ADD, ON_BOARD, py`
          board = [
              ["c", "a", "t"],
              ["o", "r", "e"],
              ["d", "o", "g"],
          ]
          found = set()

          def find(r, c, node, sofar):
              if not on_board(board, r, c):
                  return
              ch = board[r][c]
              if ch not in node:
                  return
              node = node[ch]
              sofar = sofar + ch
              if END in node:
                  found.add(sofar)
              board[r][c] = "#"
              for dr, dc in MOVES:
                  find(r + dr, c + dc, node, sofar)
              board[r][c] = ch

          trie = {}
          for w in ["cat", "car", "core", "dog", "door"]:
              add(trie, w)
          for r in range(3):
              for c in range(3):
                  find(r, c, trie, "")
          print(sorted(found))
        `),
      },
      { t: 'q', id: 'why-go-on', type: 'mcq', level: 2,
        q: 'The walk finds `car`. Why does the code not return right there?',
        options: [
          'A longer word, like `care`, may go on from that box',
          { text: 'It needs to find `car` a second time', why: 'One find is enough, and the set keeps one copy. The walk goes on for other words.' },
          { text: 'Python does not allow a `return` there', why: 'It does. But a return would miss every word that starts with `car`.' },
        ],
        answer: 0,
        explain: 'An end mark can sit part way down a path. So note the word, and keep walking.',
        hints: ['Could a box have an end mark and more letters below?'],
      },
      { t: 'q', id: 'predict-grid', type: 'predict', level: 2,
        q: 'Each cell can be used once per path. What will the screen show?',
        code: join(ADD, ON_BOARD, py`
          board = [["a", "b"]]
          found = set()

          def find(r, c, node, sofar):
              if not on_board(board, r, c):
                  return
              ch = board[r][c]
              if ch not in node:
                  return
              node = node[ch]
              sofar = sofar + ch
              if END in node:
                  found.add(sofar)
              board[r][c] = "#"
              for dr, dc in MOVES:
                  find(r + dr, c + dc, node, sofar)
              board[r][c] = ch

          trie = {}
          for w in ["ab", "ba", "aba"]:
              add(trie, w)
          for c in range(2):
              find(0, c, trie, "")
          print(sorted(found))
        `),
        options: [
          "['ab', 'ba']",
          { text: "['ab', 'aba', 'ba']", why: 'That uses the `a` cell twice. The `#` mark stops a path from going back.' },
          { text: "['ab']", why: 'That only starts from the first cell. The loop also starts a walk from `b`.' },
        ],
        answer: 0,
        explain: '`ab` and `ba` each use 2 cells. `aba` would need a second `a`, and this grid has only one.',
        hints: ['How many `a` cells are there?'],
      },
      { t: 'code', caption: 'One step means one grid cell compared. Both ways find the same words. Add more words that share starts, and guess which count grows faster.',
        output: "['car', 'care', 'cat', 'core', 'dog', 'rat']\nword by word: 162\nwith a trie: 52",
        code: join(ADD, ON_BOARD, py`
          board = [
              ["c", "a", "t"],
              ["o", "r", "e"],
              ["d", "o", "g"],
          ]
          words = ["cat", "car", "cart", "care", "core", "cord"]
          words = words + ["corn", "dog", "door", "dot", "dig"]
          words = words + ["rat", "rag"]
          counts = {"steps": 0}

          def one(word, r, c, k):
              if k == len(word):
                  return True
              if not on_board(board, r, c):
                  return False
              counts["steps"] = counts["steps"] + 1
              if board[r][c] != word[k]:
                  return False
              keep = board[r][c]
              board[r][c] = "#"
              hit = False
              for dr, dc in MOVES:
                  if one(word, r + dr, c + dc, k + 1):
                      hit = True
                      break
              board[r][c] = keep
              return hit

          def has(word):
              for r in range(3):
                  for c in range(3):
                      if one(word, r, c, 0):
                          return True
              return False

          def find(r, c, node, sofar, found):
              if not on_board(board, r, c):
                  return
              counts["steps"] = counts["steps"] + 1
              ch = board[r][c]
              if ch not in node:
                  return
              node = node[ch]
              sofar = sofar + ch
              if END in node:
                  found.add(sofar)
              board[r][c] = "#"
              for dr, dc in MOVES:
                  find(r + dr, c + dc, node, sofar, found)
              board[r][c] = ch

          slow = []
          for w in words:
              if has(w):
                  slow.append(w)
          print(sorted(slow))
          print("word by word:", counts["steps"])

          counts["steps"] = 0
          trie = {}
          for w in words:
              add(trie, w)
          found = set()
          for r in range(3):
              for c in range(3):
                  find(r, c, trie, "", found)
          print("with a trie:", counts["steps"])
        `),
      },
      { t: 'cost', title: 'How fast is it?', items: [
        { op: 'Build the trie', cost: 'O(all letters) on average', why: 'Each letter of each word takes one dict look-up, as in lesson 27.1.' },
        { op: 'Grid search, with words of up to L letters', cost: 'O(cells x L x 3^L) at worst', why: 'The 3^L limit is from lesson 19.5. Each `sofar + ch` also copies up to L letters. Real walks stop far sooner. You counted 52 steps, not 162.' },
      ] },
      { t: 'trap',
        think: 'I can skip putting the letter back, since the walk has moved on.',
        real: 'Then other paths find `#` in that cell, and they miss real words. The last line of `find` must run on every walk back.',
        code: py`
          board[r][c] = "#"
          for dr, dc in MOVES:
              find(r + dr, c + dc, node, sofar)
          board[r][c] = ch       # put it back
        `,
      },
      { t: 'tip', title: 'How to recognize it', text: 'Look for **find all the words**, **a list of words** and **a grid**. Many words with shared starts point to a [[trie]]. For one word, the plain search from lesson 19.5 is enough.' },
    ],
    recap: [
      'You can walk a grid and a trie side by side.',
      'You can say why a found word does not end the walk.',
      'You can count the steps a trie saves.',
    ],
    practice: [
      { id: 'match-grid', type: 'match', level: 1,
        q: 'Match each line to what it does.',
        pairs: [
          ['`if ch not in node:`', 'Asks if any word goes this way'],
          ['`board[r][c] = "#"`', 'Stops this path from using the cell again'],
          ['`board[r][c] = ch`', 'Gives the cell back to other paths'],
        ],
        explain: 'The first line stops a walk early. The other 2 are the choose and un-choose moves.',
        hints: ['Which line puts a letter back?'],
      },
      { id: 'why-set', type: 'mcq', level: 2,
        q: 'Why is `found` a set, not a list?',
        options: [
          'Two paths can spell one word, and a set keeps one copy',
          { text: 'A set keeps the words in order', why: 'A set has no order you can rely on. That is why the code sorts before printing.' },
          { text: 'A list cannot hold words', why: 'A list can hold words. But it would hold a repeat as well.' },
        ],
        answer: 0,
        explain: 'In a grid with 2 `a` cells, `at` might be found twice. The set still keeps one `at`.',
        hints: ['What happens if a word is found twice?'],
      },
      { id: 'order-step', type: 'order', level: 2,
        q: 'Put the lines in order. `step` gives the next trie box for a cell. It gives None if no word goes that way.',
        lines: [
          'def step(board, r, c, node):',
          '    ch = board[r][c]',
          '    if ch not in node:',
          '        return None',
          '    return node[ch]',
        ],
        extra: ['    node = {}'],
        explain: 'Read the letter first, then test it. The extra line would throw the current box away.',
        hints: ['You need `ch` before you can test it.'],
      },
      { id: 'type-found', type: 'predict', level: 2,
        q: 'What will the screen show? Type it.',
        code: join(ADD, ON_BOARD, py`
          board = [["s", "e"], ["a", "t"]]
          found = set()

          def find(r, c, node, sofar):
              if not on_board(board, r, c):
                  return
              ch = board[r][c]
              if ch not in node:
                  return
              node = node[ch]
              sofar = sofar + ch
              if END in node:
                  found.add(sofar)
              board[r][c] = "#"
              for dr, dc in MOVES:
                  find(r + dr, c + dc, node, sofar)
              board[r][c] = ch

          trie = {}
          for w in ["sea", "set", "sat", "tea"]:
              add(trie, w)
          for r in range(2):
              for c in range(2):
                  find(r, c, trie, "")
          print(sorted(found))
        `),
        answer: "['sat', 'set']",
        why: '`s` touches `e` and `a`, so `set` and `sat` work. `sea` fails, because `e` and `a` sit corner to corner. `tea` fails for the same reason.',
        explain: 'Moves go up, down, left or right only. A corner step is not a move.',
        hints: ['Draw the 2 by 2 grid.', 'Is `e` next to `a`?'],
      },
      { id: 'fix-putback', type: 'fix', level: 2,
        q: 'This search misses words, because a letter never comes back. Fix `find`.',
        code: join(ADD, ON_BOARD, py`
          def grid_words(board, words):
              trie = {}
              for w in words:
                  add(trie, w)
              found = set()

              def find(r, c, node, sofar):
                  if not on_board(board, r, c):
                      return
                  ch = board[r][c]
                  if ch not in node:
                      return
                  node = node[ch]
                  sofar = sofar + ch
                  if END in node:
                      found.add(sofar)
                  board[r][c] = "#"
                  for dr, dc in MOVES:
                      find(r + dr, c + dc, node, sofar)

              for r in range(len(board)):
                  for c in range(len(board[0])):
                      find(r, c, trie, "")
              return sorted(found)
        `),
        answer: join(ADD, ON_BOARD, py`
          def grid_words(board, words):
              trie = {}
              for w in words:
                  add(trie, w)
              found = set()

              def find(r, c, node, sofar):
                  if not on_board(board, r, c):
                      return
                  ch = board[r][c]
                  if ch not in node:
                      return
                  node = node[ch]
                  sofar = sofar + ch
                  if END in node:
                      found.add(sofar)
                  board[r][c] = "#"
                  for dr, dc in MOVES:
                      find(r + dr, c + dc, node, sofar)
                  board[r][c] = ch

              for r in range(len(board)):
                  for c in range(len(board[0])):
                      find(r, c, trie, "")
              return sorted(found)
        `),
        tests: [
          { label: 'Two walks share a cell', call: 'grid_words([["t", "o"], ["a", "p"]], ["top", "tap", "pot"])', want: '["pot", "tap", "top"]' },
          { label: 'A one-row grid', call: 'grid_words([["a", "b"]], ["ab", "ba"])', want: '["ab", "ba"]' },
          { label: 'The board is left as it was', check: '(lambda b: (grid_words(b, ["ab"]), b)[1])([["a", "b"]]) == [["a", "b"]]' },
        ],
        explain: 'Without the last line, each cell stays `#` for good. So later walks cannot use it.',
        hints: ['Which line un-chooses?', 'Put the letter back after the `for` loop.'],
      },
      { id: 'write-grid-words', type: 'write', level: 3,
        q: 'Stretch: write `grid_words(board, words)` yourself. It returns a sorted list of the words in the grid. Each word can use a cell only once.',
        starter: join(ADD, ON_BOARD, py`
          def grid_words(board, words):
              # Your code here.
              return None
        `),
        answer: join(ADD, ON_BOARD, py`
          def grid_words(board, words):
              trie = {}
              for w in words:
                  add(trie, w)
              found = set()

              def find(r, c, node, sofar):
                  if not on_board(board, r, c):
                      return
                  ch = board[r][c]
                  if ch not in node:
                      return
                  node = node[ch]
                  sofar = sofar + ch
                  if END in node:
                      found.add(sofar)
                  board[r][c] = "#"
                  for dr, dc in MOVES:
                      find(r + dr, c + dc, node, sofar)
                  board[r][c] = ch

              for r in range(len(board)):
                  for c in range(len(board[0])):
                      find(r, c, trie, "")
              return sorted(found)
        `),
        tests: [
          { label: 'Three words are there, one is not', call: 'grid_words([["t", "o"], ["a", "p"]], ["top", "tap", "pot", "cat"])', want: '["pot", "tap", "top"]' },
          { label: 'A cell cannot be used twice', call: 'grid_words([["a", "b"]], ["aba", "ab"])', want: '["ab"]' },
          { label: 'No words to find', call: 'grid_words([["x"]], [])', want: '[]' },
          { label: 'A word and a longer word', call: 'grid_words([["c", "a", "r", "t"]], ["car", "cart"])', want: '["car", "cart"]' },
          { label: 'The board is left as it was', check: '(lambda b: (grid_words(b, ["ab"]), b)[1])([["a", "b"]]) == [["a", "b"]]' },
        ],
        explain: 'Write `find` inside `grid_words`, as lesson 19.1 showed. A found word does not stop the walk, because a longer word may go on.',
        hints: ['Build the trie first.', 'Use a set for `found`.', 'Put the letter back at the end of `find`.'],
      },
    ],
  });
})();
