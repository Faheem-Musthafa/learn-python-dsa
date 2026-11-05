/* Module 23: Union-Find and Spanning Trees. Part 4 (Advanced). */
Course.module({
  id: 'm23-union-find',
  num: 23, part: 4, level: 'A',
  title: 'Union-Find and Spanning Trees',
  blurb: 'Keep track of who is in which group, then join every town for the lowest cost.',
  needs: ['m12-simple-sorts', 'm20-heaps', 'm21-graphs'],
});

// ---------------------------------------------------------------- lesson 23.1
Course.lesson('m23-union-find', {
  id: '23-1-find-and-union',
  num: '23.1',
  title: 'Same group? Find and union',
  goal: 'You can join groups with a parent list, and check if 2 items share a group.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Are these 2 in the same club?' },
    { t: 'p', text: 'Six children are numbered 0 to 5. Each one starts in a club of 1. All day, 2 clubs merge, and someone asks: are these 2 in the same club?' },
    { t: 'q', id: 'spark-chain', type: 'mcq', level: 1,
      q: 'Merges so far: 0 with 1, then 1 with 2, then 3 with 4. Are 0 and 2 in the same club?',
      options: [
        'Yes, they are joined through 1',
        { text: 'No, nobody merged 0 with 2', why: 'You may be looking for one merge that names both. But a merge joins whole clubs, so they chain up.' },
        { text: 'It depends on the order', why: 'Order changes nothing here. Once 2 clubs merge, they stay merged.' },
      ],
      answer: 0,
      explain: '0 joined 1, then that club joined 2. So 0, 1 and 2 are one club.',
      hints: ['Write the clubs after each merge.'],
    },
    { t: 'p', text: 'You could run a search from lesson 21.5 after each merge. But merges keep coming, so you would search again and again. There is a better tool for this.' },
    { t: 'words', items: [
      { word: 'union-find', say: 'YOON-yun find', means: 'A tool that keeps items in groups. It answers "same group?", and it joins 2 groups.' },
      { word: 'parent list', means: 'A list where spot i holds the item that i points up to.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Each club has one captain. To ask "same club?", ask 2 children who their captain is. Same captain means same club. To merge, one captain agrees to follow the other. Unlike a real child, an item only knows the one above it. So it walks up to the captain. And real clubs can split, but [[union-find]] cannot.' },
    { t: 'p', text: 'In code, a captain is a [[root]]. In lesson 18.1, arrows went down to the children. Here each arrow goes up, from a child to its parent. So a root is the one item that is its own parent.' },
    { t: 'big', text: 'Same root means same group. To join 2 groups, point one root at the other root.' },
    { t: 'h', text: 'How does find reach the root?' },
    { t: 'p', text: 'The [[parent list]] is all you store. `find` follows the arrows up until an item is its own parent.' },
    { t: 'code', caption: 'Spot 2 holds 1, and spot 1 holds 0. So 2 leads up to 0. Try other items.',
      code: py`
        parent = [0, 0, 1, 3, 3, 5]

        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        print(find(parent, 2))
        print(find(parent, 4))
        print(find(parent, 5))
        print(find(parent, 2) == find(parent, 1))
        print(find(parent, 2) == find(parent, 4))
      `,
      output: '0\n3\n5\nTrue\nFalse',
    },
    { t: 'q', id: 'count-hops', type: 'trace', level: 2,
      q: 'Count by hand. The list is `[0, 0, 1, 2]`, and you call `find` on 3. A hop is one trip up an arrow. Fill in each line.',
      code: py`
        parent = [0, 0, 1, 2]
        x = 3
        hops = 0
        print(hops, x, parent[x])
        while parent[x] != x:
            x = parent[x]
            hops += 1
            print(hops, x, parent[x])
      `,
      head: ['hops', 'x', 'parent[x]'],
      rows: [['0', '3', '2'], ['1', '2', '1'], ['2', '1', '0'], ['3', '0', '0']],
      given: 1,
      verify: 'parent = [0, 0, 1, 2]\nx = 3\nhops = 0\nprint(hops, x, parent[x])\nwhile parent[x] != x:\n    x = parent[x]\n    hops += 1\n    print(hops, x, parent[x])',
      explain: 'x goes 3, 2, 1, 0. At 0, `parent[0]` is 0, so the loop ends after 3 hops.',
      hints: ['x moves to `parent[x]` on each trip.', 'The loop stops when both columns show the same number.'],
    },
    { t: 'h', text: 'How does union join 2 groups?' },
    { t: 'steps', title: 'Union in 3 moves', items: [
      { label: 'Find both roots', text: 'Walk up from each item. Never join the items themselves.', code: 'ra = find(parent, a)\nrb = find(parent, b)' },
      { label: 'Check for one group', text: 'The same root means they are already together. Hand back False.', code: 'if ra == rb:\n    return False' },
      { label: 'Point one root at the other', text: 'Only one spot changes. All the items below that root come along.', code: 'parent[rb] = ra\nreturn True' },
    ] },
    { t: 'viz', name: 'm23-groups', caption: 'See how the list and the trees change together. Then try 1 item, and try `3-3`.' },
    { t: 'code', caption: 'This is the run from the picture. True means 2 groups became 1. Add your own unions.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra == rb:
                return False
            parent[rb] = ra
            return True

        parent = list(range(6))
        print(union(parent, 0, 1))
        print(union(parent, 2, 3))
        print(union(parent, 1, 3))
        print(union(parent, 0, 3))
        print(parent)
      `,
      output: 'True\nTrue\nTrue\nFalse\n[0, 0, 0, 2, 4, 5]',
    },
    { t: 'h', text: 'What if you join the items, not the roots?' },
    { t: 'q', id: 'join-items', type: 'predict', level: 2,
      q: '0 and 1 are together. 2 and 3 are together. This code tries to merge them with `parent[3] = 1`. What will the screen show?',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        parent = [0, 0, 2, 2]
        parent[3] = 1
        print(find(parent, 2) == find(parent, 3))
      `,
      options: [
        { text: 'True', why: 'You may think 2 and 3 stay together. But 3 has only 1 arrow, and it now points at 1.' },
        'False',
        { text: 'IndexError', why: 'Every spot here is real, so no index goes past the end. The bug is quieter than that.' },
      ],
      answer: 1,
      explain: '3 now leads up to 0. But 2 is still its own root, so 2 got left behind.',
      hints: ['Walk up from 3 with the new list.', 'Walk up from 2. Does anything point it at the others?'],
    },
    { t: 'viz', name: 'm23-wrong-join', caption: 'See who gets left behind. Then switch to `good_union`. Also try `0-1, 1-0` with the bug.' },
    { t: 'trap',
      think: 'To join a and b, I can write `parent[b] = a`.',
      real: 'That moves b, and only what hangs below b. The rest of its old group stays behind. It can even make a loop, so `find` never ends. Always find both roots first.',
      code: py`
        parent[b] = a                 # moves only b and what is below it
        parent[find(parent, b)] = find(parent, a)  # moves the whole group
      `,
    },
    { t: 'cost', title: 'How much does it cost, so far?', items: [
      { op: 'Make the list', cost: 'O(n)', why: 'Each of the n items gets one spot.' },
      { op: '`find`, worst case', cost: 'O(n)', why: 'You counted this: a tall chain means one hop for nearly every item.' },
      { op: '`union`, worst case', cost: 'O(n)', why: 'It calls `find` twice, then changes one spot.' },
    ] },
    { t: 'p', text: 'That worst case is a real problem. Lesson 23.2 fixes it with 2 small changes.' },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"same group?", "are they connected?"', 'Union-find'],
      ['links arrive one at a time', 'Union-find, with no new search each time'],
      ['"which link was not needed?"', 'Union-find: `union` hands back False'],
      ['"show me the path between them"', 'BFS or DFS. Union-find knows no paths.'],
      ['"remove this link"', 'Not union-find. Groups can only merge.'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'Calling `union(parent, 3, 3)` is safe and hands back False. An item with no links is a group of 1. Each True lowers the group count by exactly 1.' },
  ],
  recap: [
    'You can read a parent list and walk up to a root.',
    'You can join 2 groups by joining their roots.',
    'You can spot "same group" problems.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['root', 'An item that is its own parent'],
        ['parent list', 'Spot i holds the item above i'],
        ['find', 'Walks up to the root'],
        ['union', 'Points one root at another root'],
      ],
      explain: 'Find walks up, and union joins 2 roots. The parent list is all the data there is.',
      hints: ['Which one changes the list?'],
    },
    { id: 'read-find', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        parent = [1, 1, 1, 4, 4]
        print(find(parent, 0), find(parent, 3))
      `,
      answer: '1 4',
      explain: 'Spot 0 holds 1, and 1 is its own parent. Spot 3 holds 4, and 4 is its own parent.',
      hints: ['Start at spot 0, and read what it holds.'],
    },
    { id: 'why-roots', type: 'mcq', level: 2,
      q: 'Why does `union` change the parent of a root, and not of the item you named?',
      options: [
        'A root brings its whole group along, and nobody gets left behind.',
        { text: 'It is faster to write.', why: 'Speed is not the point. Pointing an item instead gives wrong answers, even on small lists.' },
        { text: 'Only roots are allowed in `parent`.', why: 'Every item has a spot in `parent`. A root is only special because it points at itself.' },
      ],
      answer: 0,
      explain: 'Every item in a group leads up to its root. So moving the root moves them all.',
      hints: ['What points at a root?'],
    },
    { id: 'fill-union', type: 'fill', level: 2,
      q: 'Fill the gaps, so `union` joins 2 groups and says if it did.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, a, b):
            ra = find(parent, ____)
            rb = find(parent, b)
            if ra == rb:
                return ____
            parent[____] = ra
            return True

        parent = [0, 1, 2]
        print(union(parent, 0, 2), union(parent, 2, 0), parent)
      `,
      blanks: ['a', 'False', 'rb'],
      output: 'True False [0, 1, 0]',
      explain: 'Find both roots. If they are the same, hand back False. Otherwise, root rb goes under root ra.',
      hints: ['The second line finds the root of b. What does the first line find?', 'Which name is the root that moves?'],
    },
    { id: 'fix-join', type: 'fix', level: 2,
      q: 'This `union` joins the items. After 3 unions, 0 and 2 should share a root, but they do not. Fix it.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, a, b):
            parent[b] = a
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra != rb:
                parent[rb] = ra
      `,
      tests: [
        { label: '0 and 2 join through 1 and 3', call: '(lambda p: (union(p, 0, 1), union(p, 2, 3), union(p, 1, 3), find(p, 0) == find(p, 2))[3])([0, 1, 2, 3])', want: 'True' },
        { label: '2 and 3 stay together', call: '(lambda p: (union(p, 2, 3), union(p, 0, 3), find(p, 2) == find(p, 3))[2])([0, 1, 2, 3])', want: 'True' },
        { label: '0 and 1 stay apart with no link', call: '(lambda p: (union(p, 2, 3), find(p, 0) == find(p, 1))[1])([0, 1, 2, 3])', want: 'False' },
      ],
      explain: 'Find both roots, then point one root at the other. That way, the whole group moves.',
      hints: ['What happens to the old parent of b?', 'Call `find` twice, and change only a root.'],
    },
    { id: 'count-clubs', type: 'write', level: 2,
      q: 'Write `count_clubs(n, merges)`. There are n children, numbered from 0. `merges` is a list of pairs. It hands back how many clubs there are at the end.',
      starter: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def count_clubs(n, merges):
            parent = list(range(n))
            # Your code here.
            return -1
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def count_clubs(n, merges):
            parent = list(range(n))
            count = n
            for a, b in merges:
                ra = find(parent, a)
                rb = find(parent, b)
                if ra != rb:
                    parent[rb] = ra
                    count -= 1
            return count
      `,
      tests: [
        { label: '5 children, 2 merges', call: 'count_clubs(5, [(0, 1), (3, 4)])', want: '3' },
        { label: 'A repeat merge changes nothing', call: 'count_clubs(4, [(0, 1), (1, 0), (2, 3), (3, 2)])', want: '2' },
        { label: 'A loop of merges', call: 'count_clubs(3, [(0, 1), (1, 2), (2, 0)])', want: '1' },
        { label: 'No merges', call: 'count_clubs(4, [])', want: '4' },
        { label: 'No children', call: 'count_clubs(0, [])', want: '0' },
      ],
      explain: 'Start with n clubs. Each merge of 2 different roots makes one club fewer.',
      hints: ['Start a count at n.', 'Only lower the count when the 2 roots differ.', 'Use `for a, b in merges:` to read each pair.'],
    },
    { id: 'spare-road', type: 'write', level: 3,
      q: 'Stretch: roads arrive one at a time. Write `first_spare(n, roads)`. It hands back the first road whose 2 towns were already joined. If no road is spare, it hands back None.',
      starter: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def first_spare(n, roads):
            # Your code here.
            return -1
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def first_spare(n, roads):
            parent = list(range(n))
            for a, b in roads:
                ra = find(parent, a)
                rb = find(parent, b)
                if ra == rb:
                    return (a, b)
                parent[rb] = ra
            return None
      `,
      tests: [
        { label: 'A triangle', call: 'first_spare(3, [(0, 1), (1, 2), (0, 2)])', want: '(0, 2)' },
        { label: 'The spare comes first in the list', call: 'first_spare(4, [(0, 1), (1, 0), (2, 3)])', want: '(1, 0)' },
        { label: 'A longer way round', call: 'first_spare(5, [(0, 1), (2, 3), (1, 2), (3, 4), (4, 0)])', want: '(4, 0)' },
        { label: 'No spare road', call: 'first_spare(4, [(0, 1), (1, 2), (2, 3)])', want: 'None' },
        { label: 'No roads', call: 'first_spare(2, [])', want: 'None' },
      ],
      explain: 'If both towns share a root, some path already joins them. So this road closes a cycle.',
      hints: ['Make the parent list first.', 'Check the roots before you join them.', 'Hand back the pair as soon as the roots match.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 23.2
Course.lesson('m23-union-find', {
  id: '23-2-compress-and-size',
  num: '23.2',
  title: 'Two tricks: path compression and union by size',
  goal: 'You can add both tricks to union-find, and say what each one changes and never changes.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Why can find get slow?' },
    { t: 'p', text: 'The `union` from lesson 23.1 can build a tall thin tree. Then `find` must walk up every arrow. Guess how bad it gets.' },
    { t: 'q', id: 'spark-tall', type: 'predict', level: 1,
      q: 'These unions run in an unlucky order. What will the screen show?',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra != rb:
                parent[rb] = ra

        parent = list(range(4))
        union(parent, 1, 0)
        union(parent, 2, 1)
        union(parent, 3, 2)
        print(parent)
      `,
      options: [
        '[1, 2, 3, 3]',
        { text: '[0, 0, 0, 0]', why: 'That is the flat tree you would like. But each root goes under the new item, so the tree gets taller.' },
        { text: '[1, 0, 1, 2]', why: 'You may be writing a into the spot of b. union writes the root ra into the spot of root rb.' },
      ],
      answer: 0,
      explain: 'First 0 goes under 1, then 1 under 2, then 2 under 3. So it is a chain of 3 hops from 0.',
      hints: ['After the first union, spot 0 holds 1.', 'Next, the root of 1 is still 1. It goes under 2.'],
    },
    { t: 'words', items: [
      { word: 'path compression', say: 'kum-PRESH-un', means: 'After a find, point every item on the walk straight at the root.' },
      { word: 'union by size', means: 'When 2 groups join, put the root of the smaller group under the bigger one.' },
    ] },
    { t: 'analogy', title: 'Back to the clubs', text: 'You walk up to learn who your captain is. On your way back, you tell each child you met: "This is our captain." Next time, they go straight there. When clubs merge, the small club follows the big captain. So fewer children get a longer walk. Unlike real children, the list never forgets.' },
    { t: 'h', text: 'Trick 1: flatten the path as you walk' },
    { t: 'p', text: 'Now `find` makes 2 walks. The first walk finds the root. The second walk points each item on the path straight at it.' },
    { t: 'viz', name: 'm23-compress', caption: 'Watch the bottom row closely. Then try a root as x, and a list like `0, 0`.' },
    { t: 'q', id: 'after-squash', type: 'predict', level: 2,
      q: 'Guess the 2 lines. The first shows the root. The second shows the list after the find.',
      code: py`
        def find(parent, x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root

        parent = [1, 2, 3, 3, 4]
        print(find(parent, 0))
        print(parent)
      `,
      options: [
        '3\n[3, 3, 3, 3, 4]',
        { text: '3\n[1, 2, 3, 3, 4]', why: 'You may think find only reads. This find also writes to the list on its second walk.' },
        { text: '4\n[4, 4, 4, 4, 4]', why: '4 is its own root, and nothing leads to it. Path compression never moves an item to another group.' },
      ],
      answer: 0,
      explain: 'The walk goes 0, 1, 2, 3. Then 0, 1 and 2 get pointed at 3. Item 4 was not on the path.',
      hints: ['Walk up from 0 first.', 'Which spots did the walk pass through?'],
    },
    { t: 'trap',
      think: 'Path compression changes the answers, since it changes the list.',
      real: 'It changes the arrows, but never the groups. Each item had a root before, and it has the same root after. Only the walk gets shorter.',
    },
    { t: 'p', text: 'Now let Python count the hops. Each test makes a chain of n items, then calls `find` once on each item.' },
    { t: 'code', caption: 'The columns are n, then hops with no trick, then hops with the trick. Try 2000.',
      code: py`
        def plain_find(parent, x):
            hops = 0
            while parent[x] != x:
                x = parent[x]
                hops += 1
            return x, hops

        def squash_find(parent, x):
            root, hops = plain_find(parent, x)
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root, hops

        def total_hops(n, find):
            parent = list(range(1, n)) + [n - 1]
            total = 0
            for x in range(n):
                root, hops = find(parent, x)
                total += hops
            return total

        for n in [10, 100, 1000]:
            a = total_hops(n, plain_find)
            b = total_hops(n, squash_find)
            print(n, a, b)
      `,
      output: '10 45 17\n100 4950 197\n1000 499500 1997',
    },
    { t: 'h', text: 'Trick 2: the small tree goes under' },
    { t: 'p', text: 'Compression helps after the walk. Union by size stops a tree from getting tall at all. Each root keeps a count of its group in a second list, `size`.' },
    { t: 'viz', name: 'm23-size', caption: 'Say which root goes under. Then pick "No rule" and run the same unions. Try `0-1, 2-3, 4-5, 0-2, 0-4`.' },
    { t: 'q', id: 'fill-size', type: 'fill', level: 2,
      q: 'Fill the gaps. The bigger root stays on top, and its size grows.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, size, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra == rb:
                return False
            if size[ra] ____ size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[____] += size[rb]
            return True

        parent = [0, 1, 2]
        size = [1, 1, 1]
        union(parent, size, 0, 1)
        union(parent, size, 2, 0)
        print(parent, size)
      `,
      blanks: ['<', 'ra'],
      output: '[0, 0, 0] [3, 1, 1]',
      explain: 'If ra is the smaller one, swap the names. Then ra is the root that stays, and its size grows.',
      hints: ['The swap should happen when ra is the smaller root.', 'Which root keeps a meaningful size?'],
    },
    { t: 'h', text: 'What does "almost O(1)" mean?' },
    { t: 'p', text: 'Union by size alone keeps trees short. An item gets 1 hop further only when its group at least doubles. So 1000 items need about 10 hops at most.' },
    { t: 'big', text: 'Together, the 2 tricks make each call almost O(1), shared out over many calls.' },
    { t: 'p', text: 'Here is a result that experts have proved. We state it here and do not prove it, as the proof is long. Over a long run of calls, each call costs about alpha(n) steps.' },
    { t: 'p', text: 'alpha(n) is a number that grows very, very slowly. For any list a real computer could hold, it is 4 or less. It does grow in theory, so "almost O(1)" is more honest than "O(1)".' },
    { t: 'code', caption: 'A test with both tricks. It shows n, the average hops per find, and the most for one find. `round(x, 2)` keeps 2 places. Try 20000.',
      code: py`
        def find(parent, x):
            root = x
            hops = 0
            while parent[root] != root:
                root = parent[root]
                hops += 1
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root, hops

        def union(parent, size, a, b):
            ra, h1 = find(parent, a)
            rb, h2 = find(parent, b)
            if ra != rb:
                if size[ra] < size[rb]:
                    ra, rb = rb, ra
                parent[rb] = ra
                size[ra] += size[rb]
            return h1 + h2

        def test(n):
            parent = list(range(n))
            size = [1] * n
            total = 0
            calls = 0
            most = 0
            step = 1
            while step < n:
                for i in range(0, n - step, 2 * step):
                    total += union(parent, size, i, i + step)
                    calls += 2
                step = step * 2
            for k in range(n):
                root, hops = find(parent, k * 7919 % n)
                total += hops
                calls += 1
                most = max(most, hops)
            return round(total / calls, 2), most

        for n in [10, 100, 1000, 10000]:
            print(n, test(n))
      `,
      output: '10 (0.5, 3)\n100 (0.64, 6)\n1000 (0.66, 7)\n10000 (0.67, 11)',
    },
    { t: 'p', text: 'The test only shows one run, so it proves nothing by itself. But look at both numbers. One find can still take 11 hops, yet the average stays small. That is what [[amortized]] means, as in lesson 8.4.' },
    { t: 'cost', title: 'How much does it cost? n is the number of items.', items: [
      { op: '`find` with no tricks, worst case', cost: 'O(n)', why: 'A chain makes you walk past nearly every item.' },
      { op: '`find` with union by size, worst case', cost: 'O(log n)', why: 'A tree of n items is at most about log n hops tall.' },
      { op: 'Both tricks, amortized', cost: 'almost O(1)', why: 'This is the known result above. It is an average over many calls.' },
      { op: 'Memory', cost: 'O(n)', why: 'There are 2 lists, with one spot for each item.' },
    ] },
    { t: 'tip', title: 'Why no recursion here?', text: 'Many books write `parent[x] = find(parent, parent[x])`. That is shorter, but a long chain can pass the recursion limit of 1000. Two loops never have that problem.' },
    { t: 'table', caption: 'What each trick changes', head: ['Trick', 'Changes', 'Never changes'], rows: [
      ['Path compression', 'Arrows on the path walked', 'Which group an item is in'],
      ['Union by size', 'Which root goes under', 'Which groups get joined'],
    ] },
  ],
  recap: [
    'You can write find with 2 walks.',
    'You can put the smaller group under the bigger one.',
    'You can say why "almost O(1)" is an average.',
  ],
  practice: [
    { id: 'answers-same', type: 'mcq', level: 1,
      q: 'You run `find(parent, 7)` with path compression. What can change?',
      options: [
        'Some spots in the parent list',
        { text: 'The group that 7 belongs to', why: 'This is the common mix-up. The arrows move, but every item keeps the same root.' },
        { text: 'Which items are roots', why: 'A root stays a root. Only items on the path get a new parent, and none of them is a root.' },
      ],
      answer: 0,
      explain: 'Items on the walk now point straight at the root. Nothing joins or leaves the group.',
      hints: ['Which line in `find` writes to the list?'],
    },
    { id: 'list-after', type: 'predict', level: 2,
      q: 'Type what the screen will show.',
      code: py`
        def find(parent, x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root

        parent = [1, 2, 2, 0]
        find(parent, 3)
        print(parent)
      `,
      answer: '[2, 2, 2, 2]',
      explain: 'The walk goes 3, 0, 1, 2. So 3, 0 and 1 now point at 2.',
      hints: ['Walk up from 3 first.'],
    },
    { id: 'fix-size', type: 'fix', level: 2,
      q: 'This `union` adds the size to the wrong spot. So later unions compare the wrong numbers. Fix it.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, size, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra == rb:
                return False
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[a] += size[rb]
            return True
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def union(parent, size, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra == rb:
                return False
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
            return True
      `,
      tests: [
        { label: 'The root counts 3 items', call: '(lambda p, s: (union(p, s, 1, 0), union(p, s, 2, 0), s[find(p, 2)])[2])([0, 1, 2], [1, 1, 1])', want: '3' },
        { label: 'The root counts 4 items', call: '(lambda p, s: (union(p, s, 0, 1), union(p, s, 2, 3), union(p, s, 3, 1), s[find(p, 3)])[3])([0, 1, 2, 3], [1, 1, 1, 1])', want: '4' },
        { label: 'A repeat adds nothing', call: '(lambda p, s: (union(p, s, 0, 1), union(p, s, 1, 0), s[find(p, 1)])[2])([0, 1], [1, 1])', want: '2' },
      ],
      explain: 'The root that stays on top is ra. Its size must grow, and a may not even be a root.',
      hints: ['After the swap, which name is the root on top?', 'Is `a` always a root?'],
    },
    { id: 'write-squash', type: 'write', level: 2,
      q: 'Write `find(parent, x)` with path compression. Use 2 loops. It hands back the root, and every item on the walk ends up pointing at it.',
      starter: py`
        def find(parent, x):
            # Your code here.
            return -1
      `,
      answer: py`
        def find(parent, x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root
      `,
      tests: [
        { label: 'It finds the root', call: 'find([1, 2, 3, 3], 0)', want: '3' },
        { label: 'A root finds itself', call: 'find([0, 0], 0)', want: '0' },
        { label: 'The path gets flat', call: '(lambda p: (find(p, 0), p)[1])([1, 2, 3, 3])', want: '[3, 3, 3, 3]' },
        { label: 'Other items stay put', call: '(lambda p: (find(p, 1), p)[1])([1, 2, 2, 4, 4])', want: '[1, 2, 2, 4, 4]' },
        { label: 'A long chain is fine', call: '(lambda n: find(list(range(1, n)) + [n - 1], 0))(5000)', want: '4999' },
      ],
      explain: 'The first loop only reads. The second loop saves the next item in `up` before it changes the arrow.',
      hints: ['Find the root first, with no changes.', 'Then walk again from x, until x reaches the root.', 'Save `parent[x]` before you overwrite it.'],
    },
    { id: 'same-person', type: 'write', level: 3,
      q: 'Stretch: each library card lists phone numbers. 2 cards that share a number belong to one person. Write `count_people(cards)`, which hands back how many people there are.',
      starter: py`
        def count_people(cards):
            # Your code here.
            return -1
      `,
      answer: py`
        def find(parent, x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root

        def count_people(cards):
            parent = list(range(len(cards)))
            first_card = {}
            count = len(cards)
            for i in range(len(cards)):
                for phone in cards[i]:
                    if phone in first_card:
                        ra = find(parent, first_card[phone])
                        rb = find(parent, i)
                        if ra != rb:
                            parent[rb] = ra
                            count -= 1
                    else:
                        first_card[phone] = i
            return count
      `,
      tests: [
        { label: 'One shared number', call: 'count_people([["111", "222"], ["222"], ["333"]])', want: '2' },
        { label: 'A chain of 3 cards', call: 'count_people([["1"], ["1", "2"], ["2", "3"]])', want: '1' },
        { label: 'Nothing shared', call: 'count_people([["1"], ["2"]])', want: '2' },
        { label: 'A card with no numbers', call: 'count_people([[], ["1"]])', want: '2' },
        { label: 'No cards', call: 'count_people([])', want: '0' },
        { label: 'A number twice on a card', call: 'count_people([["1", "1"]])', want: '1' },
      ],
      explain: 'Cards are the items. A dict remembers the first card with each number. A repeat means 2 cards join.',
      hints: ['Make each card one item, by its index.', 'Use a dict from phone number to the first card that had it.', 'Start the count at the number of cards.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 23.3
Course.lesson('m23-union-find', {
  id: '23-3-kruskal',
  num: '23.3',
  title: 'Kruskal: join every town for the least cost',
  goal: 'You can run Kruskal by hand and in code, and say when no answer exists.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How do you join all the towns for less?' },
    { t: 'p', text: 'Some towns need roads, and each road has a price. You must be able to drive from any town to any other. You want the lowest total price.' },
    { t: 'q', id: 'spark-three', type: 'mcq', level: 1,
      q: 'Roads for sale: A-B costs 1, B-C costs 2, A-C costs 3. Which roads do you buy?',
      options: [
        'A-B and B-C, for 3 in all',
        { text: 'All 3 roads, for 6 in all', why: 'You may want every road. But once A-B and B-C exist, you can already drive from A to C.' },
        { text: 'A-C and B-C, for 5 in all', why: 'That does join all 3 towns. But A-B costs less than A-C, so you pay too much.' },
      ],
      answer: 0,
      explain: 'A-B and B-C reach all 3 towns. The third road would only close a [[cycle]].',
      hints: ['Do you ever need a road that closes a loop?'],
    },
    { t: 'words', items: [
      { word: 'spanning tree', say: 'SPAN-ing tree', means: 'Edges that join all the nodes, with no cycle. For n nodes, that is n - 1 edges.' },
      { word: 'minimum spanning tree', say: 'MIN-ih-mum', means: 'The spanning tree with the lowest total of edge weights.' },
      { word: "Kruskal's algorithm", say: 'KRUS-kulz', means: 'Go through the edges from cheapest up. Keep each edge that joins 2 groups.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A road builder holds a price list, cheapest first. They read down it, and buy any road that joins 2 towns not yet linked. Unlike a real road plan, this one only cares about the total price. A trip between 2 towns may end up long.' },
    { t: 'big', text: 'Sort the roads by cost. Keep a road if it joins 2 groups. Skip it if it closes a cycle.' },
    { t: 'p', text: 'The hard part is spotting a cycle. A road closes one when its 2 towns are already in one group. That is the question [[union-find]] answers.' },
    { t: 'viz', name: 'm23-kruskal', caption: 'Say keep or skip for each road. Then try a tie: `A-B 5, B-C 5, A-C 5`. Then try 2 islands: `A-B 2, C-D 2`.' },
    { t: 'q', id: 'kruskal-by-hand', type: 'trace', level: 2,
      q: 'Run it by hand. The roads are in order of cost. Write each road like `B-C`, then `yes` or `no` for kept, then the total after it.',
      code: py`
        roads = [(1, "A", "B"), (2, "B", "C"),
                 (3, "A", "C"), (4, "C", "D")]
        # Keep a road only if it joins 2 groups.
      `,
      head: ['road', 'kept', 'total'],
      rows: [['A-B', 'yes', '1'], ['B-C', 'yes', '3'], ['A-C', 'no', '3'], ['C-D', 'yes', '7']],
      given: 1,
      verify: 'parent = {"A": "A", "B": "B", "C": "C", "D": "D"}\ndef find(x):\n    while parent[x] != x:\n        x = parent[x]\n    return x\ntotal = 0\nfor w, a, b in [(1, "A", "B"), (2, "B", "C"), (3, "A", "C"), (4, "C", "D")]:\n    if find(a) != find(b):\n        parent[find(b)] = find(a)\n        total += w\n        print(a + "-" + b, "yes", total)\n    else:\n        print(a + "-" + b, "no", total)',
      explain: 'After A-B and B-C, the towns A, B and C are one group. So A-C would close a cycle. C-D brings in D.',
      hints: ['Keep a list of the groups as you go.', 'Are A and C in one group after 2 roads?'],
    },
    { t: 'h', text: 'What does it look like in Python?' },
    { t: 'p', text: 'Towns have names here, so `parent` and `size` are dicts. `find` and `union` do not change at all, as `parent[x]` reads the same. Each road is a tuple with the cost first, so `sorted` goes by cost.' },
    { t: 'code', caption: 'These are the roads from the picture. Change a price and guess the new total. Then take away C-D and D-E.',
      code: py`
        def find(parent, x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while x != root:
                up = parent[x]
                parent[x] = root
                x = up
            return root

        def union(parent, size, a, b):
            ra = find(parent, a)
            rb = find(parent, b)
            if ra == rb:
                return False
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
            return True

        def kruskal(towns, roads):
            parent = {}
            size = {}
            for t in towns:
                parent[t] = t
                size[t] = 1
            total = 0
            kept = []
            for w, a, b in sorted(roads):
                if union(parent, size, a, b):
                    kept.append((a, b))
                    total += w
            if len(kept) < len(towns) - 1:
                return None
            return total, kept

        roads = [(1, "A", "F"), (2, "B", "C"), (3, "A", "B"),
                 (4, "A", "C"), (5, "E", "F"), (6, "C", "E"),
                 (7, "C", "D"), (8, "D", "E")]
        print(kruskal("ABCDEF", roads))
        print(kruskal("ABC", [(1, "A", "B")]))
        print(kruskal("A", []))
      `,
      output: "(18, [('A', 'F'), ('B', 'C'), ('A', 'B'), ('E', 'F'), ('C', 'D')])\nNone\n(0, [])",
    },
    { t: 'q', id: 'cheapest-three', type: 'mcq', level: 2,
      q: 'The roads are A-B 1, B-C 1, A-C 1 and C-D 5. A friend says 4 towns need 3 roads. So they buy the 3 cheapest. What goes wrong?',
      options: [
        'The 3 cheapest make a loop, and D stays cut off.',
        { text: 'Nothing. The total is 3, the lowest it can be.', why: 'The count is right, but 3 roads in a loop only reach 3 towns. Town D has no road at all.' },
        { text: 'C-D is too dear to ever buy.', why: 'C-D is the only road to D. So any plan that reaches D must buy it.' },
      ],
      answer: 0,
      explain: 'A road that closes a cycle joins nothing new. So skip it, and the right total is 1 + 1 + 5, which is 7.',
      hints: ['Draw the 3 cheapest roads. Can you reach D?'],
    },
    { t: 'h', text: 'Why is the cheapest road safe to keep?' },
    { t: 'p', text: 'This is a [[greedy]] rule, and lesson 22.1 showed that greedy can lie. So it needs a reason. It is the same swap reason as lesson 22.3.' },
    { t: 'steps', title: 'The swap reason for roads', items: [
      { label: 'Pick the road', text: 'Kruskal reaches a road that joins 2 groups. Call it the new road.' },
      { label: 'Take a best plan', text: 'Take a best plan with all the roads kept so far. Say it leaves out the new road. Add it, and a cycle appears.' },
      { label: 'Find another road on the cycle', text: 'The cycle leaves the group at one end of the new road. So it must come back by another road. That road also joins 2 groups, so Kruskal has not reached it yet. Kruskal reads cheapest first, so it costs the same or more.' },
      { label: 'Swap them', text: 'Take that other road out. All towns stay joined, and the total does not go up. So keeping the new road is safe.' },
    ] },
    { t: 'h', text: 'Count the work' },
    { t: 'p', text: 'In your hand run, each road got one look. Now let Python count. You can also stop early, once you have n - 1 roads.' },
    { t: 'code', caption: 'It shows looks, then kept roads. The last road was never needed. Try 2 islands, where it reads every road.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def count_work(towns, roads):
            parent = {}
            for t in towns:
                parent[t] = t
            looks = 0
            kept = 0
            for w, a, b in sorted(roads):
                if kept == len(towns) - 1:
                    break
                looks += 1
                ra = find(parent, a)
                rb = find(parent, b)
                if ra != rb:
                    parent[rb] = ra
                    kept += 1
            return looks, kept

        roads = [(1, "A", "F"), (2, "B", "C"), (3, "A", "B"),
                 (4, "A", "C"), (5, "E", "F"), (6, "C", "E"),
                 (7, "C", "D"), (8, "D", "E")]
        print(count_work("ABCDEF", roads))
        islands = [(1, "A", "B"), (2, "C", "D")]
        print(count_work("ABCD", islands))
      `,
      output: '(7, 5)\n(2, 2)',
    },
    { t: 'cost', title: 'How much does it cost? E is the number of roads.', items: [
      { op: 'Sort the roads', cost: 'O(E log E)', why: 'This is the sort from lesson 12.3. It is the biggest part.' },
      { op: 'One `union` for each road, amortized', cost: 'almost O(1)', why: 'This is the known result from lesson 23.2.' },
      { op: 'All together', cost: 'O(E log E)', why: 'The sort costs more than all the unions.' },
    ] },
    { t: 'list', items: [
      'What if the towns cannot all be joined? Fewer than n - 1 roads get kept, so hand back None.',
      'What if 2 roads cost the same? You may get a different tree, but the same total.',
      'What if there is one town? You need 0 roads, and the total is 0.',
      'What if a road goes from a town to itself? Both ends share a root, so it gets skipped.',
    ] },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"connect all", "join every house"', 'A minimum spanning tree'],
      ['"lowest total cost of cable or roads"', 'A minimum spanning tree'],
      ['"shortest trip from A to B"', 'Not this. The tree has the lowest total, but one trip can be long.'],
    ] },
  ],
  recap: [
    'You can run Kruskal by hand, with keep or skip.',
    'You can use union-find to spot a cycle.',
    'You can tell when no spanning tree exists.',
  ],
  practice: [
    { id: 'how-many-roads', type: 'mcq', level: 1,
      q: 'There are 7 towns. How many roads does a [[spanning tree]] have?',
      options: [
        { text: '7', why: 'That is one road for each town. The seventh road would always close a cycle.' },
        '6',
        { text: '21', why: 'That is every possible pair of towns. A tree needs far fewer.' },
      ],
      answer: 1,
      explain: 'The first town needs no road. Each other town needs 1 road to join.',
      hints: ['How many roads do 2 towns need? And 3?'],
    },
    { id: 'tree-not-trip', type: 'mcq', level: 2,
      q: 'Roads: A-B 2, B-C 2, A-C 3. Kruskal keeps A-B and B-C. How long is the trip from A to C on those roads?',
      options: [
        '4, even though the unused road costs 3',
        { text: '3, as Kruskal finds the shortest trips', why: 'This is the common mix-up. Kruskal gets the lowest total for all roads, not the shortest trip for one pair.' },
        { text: 'You cannot get from A to C', why: 'A spanning tree joins every town. You go through B.' },
      ],
      answer: 0,
      explain: 'A to B to C is 2 + 2. The tree has the lowest total, but one trip can be longer.',
      hints: ['Which roads are in the tree?'],
    },
    { id: 'predict-total', type: 'predict', level: 2,
      q: 'Type what the screen will show. A tie is hiding in here.',
      code: py`
        parent = {"A": "A", "B": "B", "C": "C"}

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x

        total = 0
        for w, a, b in sorted([(4, "A", "C"), (4, "A", "B"), (4, "B", "C")]):
            if find(a) != find(b):
                parent[find(b)] = find(a)
                total += w
        print(total)
      `,
      answer: '8',
      explain: 'All 3 roads tie. The first 2 join all 3 towns, and the last one closes a cycle.',
      hints: ['A spanning tree of 3 towns has 2 roads.'],
    },
    { id: 'fix-no-check', type: 'fix', level: 2,
      q: 'This code keeps every road, even one that closes a cycle. Fix it, so it gives the lowest total.',
      code: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def lowest_total(towns, roads):
            parent = {}
            for t in towns:
                parent[t] = t
            total = 0
            for w, a, b in sorted(roads):
                ra = find(parent, a)
                rb = find(parent, b)
                parent[rb] = ra
                total += w
            return total
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def lowest_total(towns, roads):
            parent = {}
            for t in towns:
                parent[t] = t
            total = 0
            for w, a, b in sorted(roads):
                ra = find(parent, a)
                rb = find(parent, b)
                if ra != rb:
                    parent[rb] = ra
                    total += w
            return total
      `,
      tests: [
        { label: 'A triangle', call: 'lowest_total("ABC", [(1, "A", "B"), (2, "B", "C"), (3, "A", "C")])', want: '3' },
        { label: 'A cheap cycle, then a dear road', call: 'lowest_total("ABCD", [(1, "A", "B"), (1, "B", "C"), (1, "A", "C"), (5, "C", "D")])', want: '7' },
        { label: 'No cycle at all', call: 'lowest_total("AB", [(4, "A", "B")])', want: '4' },
      ],
      explain: 'Only join and pay if the roots differ. The same root means this road closes a cycle.',
      hints: ['What should happen when ra equals rb?', 'Put both of the last 2 lines inside one `if`.'],
    },
    { id: 'write-kruskal', type: 'write', level: 2,
      q: 'Six towns need cables. Write `lowest_cost(towns, cables)`. Each cable is `(cost, a, b)`. It hands back the lowest total, or -1 if the towns cannot all be joined.',
      starter: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def lowest_cost(towns, cables):
            parent = {}
            for t in towns:
                parent[t] = t
            # Your code here.
            return 0
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def lowest_cost(towns, cables):
            parent = {}
            for t in towns:
                parent[t] = t
            total = 0
            kept = 0
            for w, a, b in sorted(cables):
                ra = find(parent, a)
                rb = find(parent, b)
                if ra != rb:
                    parent[rb] = ra
                    total += w
                    kept += 1
            if kept < len(towns) - 1:
                return -1
            return total
      `,
      tests: [
        { label: 'Six towns', call: 'lowest_cost("PQRSTU", [(9, "P", "Q"), (2, "Q", "R"), (4, "P", "R"), (7, "R", "S"), (3, "S", "T"), (5, "T", "U"), (6, "S", "U"), (8, "Q", "U")])', want: '21' },
        { label: 'Cut in 2', call: 'lowest_cost("ABCD", [(1, "A", "B"), (1, "C", "D")])', want: '-1' },
        { label: 'One town', call: 'lowest_cost("A", [])', want: '0' },
        { label: 'Two towns, 2 cables', call: 'lowest_cost("AB", [(8, "A", "B"), (3, "A", "B")])', want: '3' },
        { label: 'A town with no cable', call: 'lowest_cost("ABC", [(2, "A", "B")])', want: '-1' },
      ],
      explain: 'Sort, then keep each cable that joins 2 groups. A count of kept cables tells you if all towns joined.',
      hints: ['Loop with `for w, a, b in sorted(cables):`.', 'Add to the total only when the 2 roots differ.', 'n towns need n - 1 kept cables.'],
    },
    { id: 'some-built', type: 'write', level: 3,
      q: 'Stretch: some roads are already built, and they are free. Write `extra_cost(towns, built, roads)`. `built` is a list of pairs, and `roads` is a list of `(cost, a, b)`. It hands back the least extra to pay, or -1.',
      starter: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def extra_cost(towns, built, roads):
            # Your code here.
            return 0
      `,
      answer: py`
        def find(parent, x):
            while parent[x] != x:
                x = parent[x]
            return x

        def extra_cost(towns, built, roads):
            parent = {}
            for t in towns:
                parent[t] = t
            groups = len(towns)
            for a, b in built:
                ra = find(parent, a)
                rb = find(parent, b)
                if ra != rb:
                    parent[rb] = ra
                    groups -= 1
            total = 0
            for w, a, b in sorted(roads):
                ra = find(parent, a)
                rb = find(parent, b)
                if ra != rb:
                    parent[rb] = ra
                    groups -= 1
                    total += w
            if groups > 1:
                return -1
            return total
      `,
      tests: [
        { label: 'One built road helps', call: 'extra_cost("ABC", [("A", "C")], [(1, "A", "B"), (2, "B", "C"), (9, "A", "C")])', want: '1' },
        { label: 'All built already', call: 'extra_cost("AB", [("A", "B")], [(5, "A", "B")])', want: '0' },
        { label: 'Nothing built', call: 'extra_cost("ABC", [], [(1, "A", "B"), (2, "B", "C")])', want: '3' },
        { label: 'Built roads make a cycle', call: 'extra_cost("ABCD", [("A", "B"), ("B", "C"), ("C", "A")], [(6, "A", "D")])', want: '6' },
        { label: 'It cannot be done', call: 'extra_cost("ABC", [("A", "B")], [])', want: '-1' },
      ],
      explain: 'Join the built roads first, at no cost. Then run Kruskal on the rest as usual.',
      hints: ['Count the groups, starting at the number of towns.', 'Handle `built` with no change to the total.', 'At the end, one group means success.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 23.4
Course.lesson('m23-union-find', {
  id: '23-4-prim',
  num: '23.4',
  title: 'Prim: grow one tree with a heap',
  goal: 'You can run Prim with heapq, skip out-of-date entries, and choose Prim or Kruskal.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What if you grow out from one town?' },
    { t: 'p', text: 'Kruskal buys roads all over the map, and the pieces join up later. There is another way. Start in one town, and grow one tree outwards.' },
    { t: 'q', id: 'spark-grow', type: 'mcq', level: 1,
      q: 'Your tree has A and C. Roads leading out: A-B costs 4, C-B costs 2, C-D costs 6. Which road do you buy next?',
      options: [
        'C-B, as it is the cheapest road leading out',
        { text: 'C-D, as C is the newest town', why: 'You may think only the newest town counts. Any town in the tree can grow a road.' },
        { text: 'A-B, as A is where you started', why: 'The start is not special now. Only the price of the road counts.' },
      ],
      answer: 0,
      explain: 'Look at every road from the tree to a town outside it. Then take the cheapest one.',
      hints: ['Which of the 3 prices is lowest?'],
    },
    { t: 'words', items: [
      { word: "Prim's algorithm", say: 'PRIMZ', means: 'Grow one tree from a start. Always add the cheapest road from the tree to a new town.' },
      { word: 'stale entry', say: 'stayl', means: 'A heap entry that is out of date, as its town has already joined the tree.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of your land growing on a map. Each turn, you buy the cheapest road that leads off your land to a new town. Unlike real land, the map never gets a new road, and you never sell one.' },
    { t: 'big', text: 'Each turn, take the cheapest road from the tree to a town outside it.' },
    { t: 'p', text: 'You need the cheapest of many roads, again and again. That is a job for a [[min-heap]]. Each entry is a tuple, `(cost, town)`, so the lowest cost comes out first.' },
    { t: 'viz', name: 'm23-prim', caption: 'These are the same roads as lesson 23.3. Say what comes out. Then pick another start, and try `A-B 2, C-D 2`.' },
    { t: 'q', id: 'why-stale', type: 'mcq', level: 2,
      q: 'The heap pops `(4, "B")`, but B is already in the tree. Why was that entry still in the heap?',
      options: [
        'It went in before B joined by a cheaper road. A heap cannot remove it early.',
        { text: 'The code has a bug.', why: 'This is normal. The fix is to skip the entry when it comes out, and the code does that.' },
        { text: 'B must join twice.', why: 'Each town joins once. A second join would close a cycle, and add extra cost.' },
      ],
      answer: 0,
      explain: '`heapq` can only pop the top. So an old entry waits until it reaches the top, and then you skip it.',
      hints: ['Which `heapq` tools have you met? Can any remove from the middle?'],
    },
    { t: 'code', caption: 'Same map, same total as Kruskal. Change the start to "D", and guess first. Then cut the map in 2.',
      code: py`
        import heapq

        def prim(graph, start):
            in_tree = set()
            heap = [(0, start)]
            total = 0
            while len(heap) > 0:
                w, town = heapq.heappop(heap)
                if town in in_tree:
                    continue
                in_tree.add(town)
                total += w
                for other, cost in graph[town]:
                    if other not in in_tree:
                        heapq.heappush(heap, (cost, other))
            return total, len(in_tree)

        graph = {
            "A": [("B", 3), ("C", 4), ("F", 1)],
            "B": [("A", 3), ("C", 2)],
            "C": [("A", 4), ("B", 2), ("D", 7), ("E", 6)],
            "D": [("C", 7), ("E", 8)],
            "E": [("C", 6), ("D", 8), ("F", 5)],
            "F": [("A", 1), ("E", 5)],
        }
        print(prim(graph, "A"))
      `,
      output: '(18, 6)',
    },
    { t: 'q', id: 'prim-by-hand', type: 'trace', level: 2,
      q: 'Run it by hand from A. Roads: A-B 5, A-C 1, B-C 2. Fill in each pop. Write a pop like `1,C`, with no space. Write `join`, or `skip` when the town is already in the tree.',
      code: py`
        graph = {
            "A": [("B", 5), ("C", 1)],
            "B": [("A", 5), ("C", 2)],
            "C": [("A", 1), ("B", 2)],
        }
        # The heap starts as [(0, "A")].
      `,
      head: ['popped', 'action', 'total'],
      rows: [['0,A', 'join', '0'], ['1,C', 'join', '1'], ['2,B', 'join', '3'], ['5,B', 'skip', '3']],
      given: 1,
      verify: 'import heapq\ngraph = {"A": [("B", 5), ("C", 1)], "B": [("A", 5), ("C", 2)], "C": [("A", 1), ("B", 2)]}\nin_tree = set()\nheap = [(0, "A")]\ntotal = 0\nwhile len(heap) > 0:\n    w, town = heapq.heappop(heap)\n    name = str(w) + "," + town\n    if town in in_tree:\n        print(name, "skip", total)\n        continue\n    in_tree.add(town)\n    total += w\n    print(name, "join", total)\n    for other, cost in graph[town]:\n        if other not in in_tree:\n            heapq.heappush(heap, (cost, other))',
      explain: 'A pushes (5, B) and (1, C). C pushes (2, B). So B joins for 2, and the old (5, B) is stale.',
      hints: ['After A joins, which 2 entries go in?', 'After C joins, the heap holds 2 entries for B.'],
    },
    { t: 'q', id: 'fill-skip', type: 'fill', level: 2,
      q: 'Fill the gaps. The code must skip a [[stale entry]], and push only roads that lead outside.',
      code: py`
        import heapq

        graph = {"A": [("B", 2)], "B": [("A", 2)]}
        in_tree = set()
        heap = [(0, "A")]
        total = 0
        while len(heap) > 0:
            w, town = heapq.heappop(heap)
            if town ____ in_tree:
                continue
            in_tree.add(town)
            total += w
            for other, cost in graph[town]:
                if other ____ in_tree:
                    heapq.heappush(heap, (cost, other))
        print(total)
      `,
      blanks: ['in', 'not in'],
      output: '2',
      explain: 'A town in the tree gets skipped when popped. Only a town outside the tree is worth pushing.',
      hints: ['When should `continue` run?', 'Which towns are worth a road?'],
    },
    { t: 'trap',
      think: 'A popped entry always brings a new town.',
      real: 'Not with `heapq`. A town can have many entries, one for each road to it. Without the skip, you pay for a stale road too. So the total comes out too big.',
      code: py`
        if town in in_tree:
            continue    # leave this line out, and the total is wrong
      `,
    },
    { t: 'h', text: 'Count the heap work' },
    { t: 'p', text: 'Before naming a cost, count. Each road goes in the heap at most once, from the side that joined first. So the pops stay close to the number of roads.' },
    { t: 'code', caption: 'Each town has roads to its next 3 towns. The columns are towns, roads, pushes and pops. Try 2000.',
      code: py`
        import heapq

        def count_work(n):
            graph = {}
            for t in range(n):
                graph[t] = []
            roads = 0
            for t in range(n):
                for step in [1, 2, 3]:
                    if t + step < n:
                        cost = (t * 7 + step * 13) % 50
                        graph[t].append((t + step, cost))
                        graph[t + step].append((t, cost))
                        roads += 1
            in_tree = set()
            heap = [(0, 0)]
            pushes = 0
            pops = 0
            while len(heap) > 0:
                w, town = heapq.heappop(heap)
                pops += 1
                if town in in_tree:
                    continue
                in_tree.add(town)
                for other, cost in graph[town]:
                    if other not in in_tree:
                        heapq.heappush(heap, (cost, other))
                        pushes += 1
            return n, roads, pushes, pops

        for n in [10, 100, 1000]:
            print(count_work(n))
      `,
      output: '(10, 24, 24, 25)\n(100, 294, 294, 295)\n(1000, 2994, 2994, 2995)',
    },
    { t: 'cost', title: 'How much does it cost? E is roads, and V is towns.', items: [
      { op: 'One push or pop', cost: 'O(log E)', why: 'The heap holds at most about E entries.' },
      { op: 'All pushes and pops', cost: 'O(E log E)', why: 'There are at most about E of each. You saw that in the count.' },
      { op: 'Books often write it this way', cost: 'O(E log V)', why: 'E is at most V times V, so log E is at most 2 log V.' },
      { op: 'Check `in in_tree`, on average', cost: 'O(1)', why: 'It is a set.' },
    ] },
    { t: 'table', caption: 'Kruskal or Prim?', head: ['', 'Kruskal', 'Prim'], rows: [
      ['Starts with', 'A list of edges', 'An adjacency list'],
      ['Grows', 'Many small groups that merge', 'One tree'],
      ['Tools', 'Sort and union-find', 'Heap and set'],
      ['Cannot join all towns', 'Keeps fewer than n - 1 roads', 'Reaches only one group'],
    ] },
    { t: 'tip', title: 'Do they give the same tree?', text: 'They always give the same total. With ties, the trees can differ, and both are right. With no ties, there is only one minimum tree, so they match.' },
    { t: 'list', items: [
      'What if the towns cannot all be joined? Check that `len(in_tree)` equals `len(graph)`.',
      'What if there is one town with no roads? The total is 0.',
      'Does the start change the answer? It changes the order, but not the total.',
    ] },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"connect all points" and gives no edge list', 'Prim. Work out each cost as you go.'],
      ['you already have an adjacency list', 'Prim fits well'],
      ['you already have a list of edges', 'Kruskal fits well'],
    ] },
  ],
  recap: [
    'You can run Prim by hand with a heap.',
    'You can skip a stale entry, and say why it exists.',
    'You can choose between Prim and Kruskal.',
  ],
  practice: [
    { id: 'entry-means', type: 'mcq', level: 1,
      q: 'What does the heap entry `(4, "D")` mean?',
      options: [
        'Town D can join the tree by a road that costs 4.',
        { text: 'Town D is 4 roads from the start.', why: 'You may be thinking of BFS. The number here is the price of one road, not a count of roads.' },
        { text: 'D is at spot 4 in the heap.', why: 'Spots in a heap are not stored in the entries. The 4 is a cost.' },
      ],
      answer: 0,
      explain: 'The tuple pairs a cost with a town. Tuples compare by cost first, so the cheapest comes out first.',
      hints: ['What gets pushed in `heappush(heap, (cost, other))`?'],
    },
    { id: 'prim-small', type: 'predict', level: 2,
      q: 'Type what the screen will show.',
      code: py`
        import heapq

        graph = {
            "P": [("Q", 6), ("R", 2)],
            "Q": [("P", 6), ("R", 3)],
            "R": [("P", 2), ("Q", 3)],
        }
        in_tree = set()
        heap = [(0, "P")]
        total = 0
        while len(heap) > 0:
            w, town = heapq.heappop(heap)
            if town in in_tree:
                continue
            in_tree.add(town)
            total += w
            for other, cost in graph[town]:
                if other not in in_tree:
                    heapq.heappush(heap, (cost, other))
        print(total)
      `,
      answer: '5',
      explain: 'R joins for 2, then Q joins for 3. The old entry (6, Q) gets skipped.',
      hints: ['What are the 2 cheapest roads that join all 3 towns?'],
    },
    { id: 'pick-tool', type: 'mcq', level: 2,
      q: 'You get a big list of `(cost, a, b)` edges, and a union-find you already wrote. Which fits best?',
      options: [
        'Kruskal, as it starts from a list of edges',
        { text: 'Prim, as it is always faster', why: 'Neither one always wins. Both cost about the same here. Prim would need an adjacency list built first.' },
        { text: 'BFS, as it finds the cheapest roads', why: 'BFS counts edges and never reads a cost. It cannot find the lowest total.' },
      ],
      answer: 0,
      explain: 'You sort the edges, then use union-find to spot a cycle. All the parts are ready.',
      hints: ['What does each one start with?'],
    },
    { id: 'fix-stale', type: 'fix', level: 2,
      q: 'This `prim` gives a total that is too big, as it pays for stale entries. Fix it.',
      code: py`
        import heapq

        def prim(graph, start):
            in_tree = set()
            heap = [(0, start)]
            total = 0
            while len(heap) > 0:
                w, town = heapq.heappop(heap)
                in_tree.add(town)
                total += w
                for other, cost in graph[town]:
                    if other not in in_tree:
                        heapq.heappush(heap, (cost, other))
            return total
      `,
      answer: py`
        import heapq

        def prim(graph, start):
            in_tree = set()
            heap = [(0, start)]
            total = 0
            while len(heap) > 0:
                w, town = heapq.heappop(heap)
                if town in in_tree:
                    continue
                in_tree.add(town)
                total += w
                for other, cost in graph[town]:
                    if other not in in_tree:
                        heapq.heappush(heap, (cost, other))
            return total
      `,
      tests: [
        { label: 'A triangle', call: 'prim({"A": [("B", 5), ("C", 1)], "B": [("A", 5), ("C", 2)], "C": [("A", 1), ("B", 2)]}, "A")', want: '3' },
        { label: 'One road', call: 'prim({"A": [("B", 4)], "B": [("A", 4)]}, "A")', want: '4' },
        { label: 'One town', call: 'prim({"A": []}, "A")', want: '0' },
      ],
      explain: 'A town can have many entries. Only the first one popped counts, and the rest are stale.',
      hints: ['What should happen if the popped town is already in the tree?', 'Add 2 lines right after the pop.'],
    },
    { id: 'write-prim', type: 'write', level: 2,
      q: 'Write `prim_total(graph, start)`. It hands back the lowest total, or None if some towns cannot be reached.',
      starter: py`
        import heapq

        def prim_total(graph, start):
            in_tree = set()
            heap = [(0, start)]
            total = 0
            # Your code here.
            return total
      `,
      answer: py`
        import heapq

        def prim_total(graph, start):
            in_tree = set()
            heap = [(0, start)]
            total = 0
            while len(heap) > 0:
                w, town = heapq.heappop(heap)
                if town in in_tree:
                    continue
                in_tree.add(town)
                total += w
                for other, cost in graph[town]:
                    if other not in in_tree:
                        heapq.heappush(heap, (cost, other))
            if len(in_tree) < len(graph):
                return None
            return total
      `,
      tests: [
        { label: 'Four towns', call: 'prim_total({"W": [("X", 2), ("Y", 7)], "X": [("W", 2), ("Y", 3), ("Z", 9)], "Y": [("W", 7), ("X", 3), ("Z", 4)], "Z": [("X", 9), ("Y", 4)]}, "W")', want: '9' },
        { label: 'The start does not change it', call: 'prim_total({"W": [("X", 2), ("Y", 7)], "X": [("W", 2), ("Y", 3), ("Z", 9)], "Y": [("W", 7), ("X", 3), ("Z", 4)], "Z": [("X", 9), ("Y", 4)]}, "Z")', want: '9' },
        { label: 'Two islands', call: 'prim_total({"A": [("B", 1)], "B": [("A", 1)], "C": []}, "A")', want: 'None' },
        { label: 'One town', call: 'prim_total({"A": []}, "A")', want: '0' },
      ],
      explain: 'Keep popping until the heap is empty. Then compare the size of the tree with the number of towns.',
      hints: ['Copy the loop shape from the lesson.', 'Skip a town that is already in the tree.', 'Check `len(in_tree)` after the loop.'],
    },
    { id: 'join-points', type: 'write', level: 3,
      q: 'Stretch: `points` is a list of `(x, y)` tuples. The cost to join 2 points is the gap in x plus the gap in y. Write `join_points(points)`, which hands back the lowest total. `abs(n)` drops the minus sign from n.',
      starter: py`
        import heapq

        def join_points(points):
            # Your code here.
            return -1
      `,
      answer: py`
        import heapq

        def join_points(points):
            if len(points) == 0:
                return 0
            in_tree = set()
            heap = [(0, 0)]
            total = 0
            while len(heap) > 0:
                w, i = heapq.heappop(heap)
                if i in in_tree:
                    continue
                in_tree.add(i)
                total += w
                for j in range(len(points)):
                    if j not in in_tree:
                        gap_x = abs(points[i][0] - points[j][0])
                        gap_y = abs(points[i][1] - points[j][1])
                        heapq.heappush(heap, (gap_x + gap_y, j))
            return total
      `,
      tests: [
        { label: 'Four points', call: 'join_points([(0, 0), (0, 3), (4, 3), (9, 9)])', want: '18' },
        { label: 'Three points', call: 'join_points([(0, 0), (5, 5), (5, 0)])', want: '10' },
        { label: 'Two points in one spot', call: 'join_points([(2, 2), (2, 2)])', want: '0' },
        { label: 'One point', call: 'join_points([(1, 1)])', want: '0' },
        { label: 'No points', call: 'join_points([])', want: '0' },
      ],
      explain: 'Every pair has a road, so no adjacency list is needed. Work out each cost when a point joins.',
      hints: ['Use the index of each point as its town name.', 'Start with `heap = [(0, 0)]`.', 'For each point outside the tree, push its cost from point i.'],
    },
  ],
});
