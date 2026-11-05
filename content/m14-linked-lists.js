/* Module 14: Linked Lists. Part 2 (First data structures and algorithms). */
(function () {
  /* Python that many programs share. The learner sees it in full each time. */
  const NODE = py`
    class Node:
        def __init__(self, value):
            self.value = value
            self.next = None
  `;
  const HELPERS = NODE + '\n\n' + py`
    def build(values):
        head = None
        for v in reversed(values):
            node = Node(v)
            node.next = head
            head = node
        return head

    def show(head):
        items = []
        node = head
        while node is not None:
            items.append(node.value)
            node = node.next
        return items
  `;
  const LL = NODE + '\n\n' + py`
    class LinkedList:
        def __init__(self):
            self.head = None

        def add_front(self, value):
            new = Node(value)
            new.next = self.head
            self.head = new

        def to_list(self):
            items = []
            node = self.head
            while node is not None:
                items.append(node.value)
                node = node.next
            return items
  `;
  const withNode = code => NODE + '\n\n' + code;
  const withHelpers = code => HELPERS + '\n\n' + code;
  const withLL = code => LL + '\n\n' + code;

  Course.module({
    id: 'm14-linked-lists',
    num: 14, part: 2, level: 'I',
    title: 'Linked Lists',
    blurb: 'Link nodes into a chain, change its arrows in the right order, and learn when a list is better.',
    needs: ['m07-classes', 'm08-big-o'],
  });

  // ---------------------------------------------------------------- lesson 14.1
  Course.lesson('m14-linked-lists', {
    id: '14-1-why-linked-lists',
    num: '14.1',
    title: 'Why link nodes into a chain?',
    goal: 'You can build a linked list and say when it beats a Python list.',
    mins: 13,
    steps: [
      { t: 'h', text: 'What does adding at the front cost?' },
      { t: 'p', text: 'Say you add numbers at the front of a list, again and again. You know `insert(0, x)` from module 9. Count what it must do.' },
      { t: 'q', id: 'count-moves', type: 'mcq', level: 1,
        q: 'The list `[3, 8, 2, 6]` gets `insert(0, 9)`. Count by hand. How many old items must move?',
        options: [
          { text: '1', why: 'You may think only spot 0 changes. But a list keeps its items side by side, so each one needs a new spot.' },
          '4',
          { text: '5', why: 'That counts the 9 as well. The 9 is new, so it goes in once. Only the 4 old items move.' },
        ],
        answer: 1,
        explain: 'All 4 old items move one spot right. That is why `insert(0, x)` is O(n).',
        hints: ['Write the list out. Where must the 3 go to make room?', 'Then where must the 8 go?'],
      },
      { t: 'analogy', title: 'Back to the treasure hunt', text: 'You met this hunt in lesson 7.3. Each clue says where the next clue is. To add a clue at the start, write one that names the old first clue. No other clue changes. Unlike a real hunt, nothing is hidden. An arrow says where a node lives in memory.' },
      { t: 'words', items: [
        { word: 'linked list', means: 'A chain of nodes. Each one points to the next.' },
        { word: 'head', means: 'The name on the first node of a chain. It is your only way in.' },
      ] },
      { t: 'viz', name: 'm14-front-race', caption: 'Count the work on each side. Then type your own numbers and count again.' },
      { t: 'q', id: 'long-chain', type: 'mcq', level: 2,
        q: 'A [[linked list]] has 1000 nodes. You add one node at the front. How many arrows change?',
        options: [
          '2',
          { text: '1000', why: 'That is what a list must do with its items. A chain leaves its old nodes alone.' },
          { text: '1', why: 'The new node gets an arrow. But `head` must move too, or nobody can find the new node.' },
        ],
        answer: 0,
        explain: 'The new node gets an arrow, and `head` moves to it. The size of the chain makes no difference.',
        hints: ['Look back at the picture. Which arrows changed?', 'Did any old node change?'],
      },
      { t: 'code', caption: 'This does the same work as `insert(0, x)`, and counts each move. Double the items, and the moves double.',
        code: py`
          def list_add_front(items, x):
              moves = 0
              items.append(None)
              i = len(items) - 1
              while i > 0:
                  items[i] = items[i - 1]
                  moves = moves + 1
                  i = i - 1
              items[0] = x
              return moves

          print(list_add_front([3, 8, 2, 6], 9))
          print(list_add_front([0] * 8, 9))
          print(list_add_front([0] * 16, 9))
        `,
        output: '4\n8\n16',
      },
      { t: 'big', text: 'A [[linked list]] adds at the front by changing 2 arrows. A list moves every item.' },

      { t: 'h', text: 'How do you build one?' },
      { t: 'p', text: 'You need 2 classes. `Node` is the same as in lesson 7.3. `LinkedList` keeps the [[head]], and that is all it must keep.' },
      { t: 'steps', title: 'Add a node at the front', items: [
        { label: 'Start empty', text: 'A new linked list has no nodes yet. So `head` is `None`.', code: 'self.head = None' },
        { label: 'Point the new node at the chain', text: 'The new node takes the old first node as its next. If the chain is empty, that is `None`.', code: 'new = Node(value)\nnew.next = self.head' },
        { label: 'Move head', text: 'Now the new node comes first.', code: 'self.head = new' },
      ] },
      { t: 'viz', name: 'm14-add-front', caption: 'Each number goes in at the front. Guess the final order, then try your own numbers.' },
      { t: 'code', caption: '`to_list` walks the chain and copies each value into a list, so `print` can show it. Add a fourth number.',
        code: withLL(py`
          ll = LinkedList()
          ll.add_front(2)
          ll.add_front(8)
          ll.add_front(3)
          print(ll.to_list())
          print(ll.head.value)
        `),
        output: '[3, 8, 2]\n3',
      },
      { t: 'q', id: 'front-order', type: 'predict', level: 2,
        q: 'What will the screen show?',
        code: withLL(py`
          ll = LinkedList()
          ll.add_front("a")
          ll.add_front("b")
          ll.add_front("c")
          print(ll.to_list())
        `),
        options: [
          { text: "['a', 'b', 'c']", why: 'You may think a new node joins the end, as with `append`. `add_front` puts each one first.' },
          "['c', 'b', 'a']",
          { text: "['c']", why: 'Each new node keeps an arrow to the old first node. So the older nodes stay in the chain.' },
        ],
        answer: 1,
        explain: 'Each new node goes first. So "c", the last one added, ends up at the head.',
        hints: ['Which node is first after the first call?', 'Where does "b" go, compared with "a"?'],
      },
      { t: 'q', id: 'fill-add-front', type: 'fill', level: 2,
        q: 'Fill the gaps in `add_front`, so that the program prints `[7, 5]`.',
        code: withNode(py`
          class LinkedList:
              def __init__(self):
                  self.head = None

              def add_front(self, value):
                  new = Node(value)
                  new.next = ____
                  self.head = ____

          ll = LinkedList()
          ll.add_front(5)
          ll.add_front(7)
          print([ll.head.value, ll.head.next.value])
        `),
        blanks: ['self.head', 'new'],
        output: '[7, 5]',
        explain: 'First the new node takes the old first node as its next. Then `head` moves to the new node.',
        hints: ['What should come right after the new node?', 'Which node is first when you finish?'],
      },

      { t: 'h', text: 'So is a linked list always better?' },
      { t: 'p', text: 'No. A list has numbered spots, so it can jump straight to spot 3. A chain has no numbers. To reach spot 3, you walk from the [[head]].' },
      { t: 'viz', name: 'm14-read-race', caption: 'Change the spot. Try spot 0, the last spot, and a spot that is not there.' },
      { t: 'q', id: 'hops-to-last', type: 'mcq', level: 2,
        q: 'A chain has 1000 nodes. You start at the head. How many arrows do you follow to reach the last node?',
        options: [
          { text: '1', why: 'That is a list, with its numbered spots. A chain has no way to jump.' },
          '999',
          { text: '1000', why: 'That counts the nodes, not the arrows. You start on the first node, so you need one fewer.' },
        ],
        answer: 1,
        explain: 'You start on the first node. Each of the other 999 nodes takes one arrow to reach.',
        hints: ['Try a chain with 3 nodes first. How many arrows are there?'],
      },
      { t: 'code', caption: 'This counts the arrows followed on the way to spot k. Try other spots, and guess first.',
        code: withNode(py`
          def get(head, k):
              hops = 0
              node = head
              while hops < k:
                  node = node.next
                  hops = hops + 1
              print("hops:", hops)
              return node.value

          head = Node(3)
          head.next = Node(8)
          head.next.next = Node(2)
          head.next.next.next = Node(6)
          print(get(head, 0))
          print(get(head, 3))
        `),
        output: 'hops: 0\n3\nhops: 3\n6',
      },
      { t: 'cost', title: 'How fast is it?', items: [
        { op: 'Add at the front of a list', cost: 'O(n)', why: 'Every item moves. You counted 4 moves for 4 items.' },
        { op: 'Add at the front of a chain', cost: 'O(1)', why: 'You change 2 arrows, however long the chain is.' },
        { op: 'Read spot k of a list', cost: 'O(1)', why: 'The list jumps straight to that spot.' },
        { op: 'Read spot k of a chain', cost: 'O(n)', why: 'You follow k arrows, and k can be as big as the chain.' },
      ] },
      { t: 'trap',
        think: 'A linked list is faster than a Python list at everything.',
        real: 'It wins at the front, but it loses at reading a spot by number. Each node is a whole object too. So it takes more memory than one list spot.',
        code: py`
          items[500]        # one jump
          get(head, 500)    # 500 hops
        `,
      },
      { t: 'tip', title: 'How to recognize it', text: 'Does a problem keep adding or removing at the front? Does it never read by spot number? A chain fits that job.' },
      { t: 'tip', title: 'Why learn it, then?', text: 'Python has no built-in linked list, and you will often use a plain list. But the idea of nodes and arrows comes back in trees and graphs.' },
    ],
    recap: [
      'You can build a linked list with 2 classes.',
      'You can add at the front by changing 2 arrows.',
      'You know a list wins at reading a spot by number.',
    ],
    practice: [
      { id: 'empty-head', type: 'mcq', level: 1,
        q: 'You make a new `LinkedList()` and add nothing. What is its `head`?',
        options: [
          { text: '0', why: 'You may be thinking of a counter. `head` is meant to name a node, not to count.' },
          { text: 'An empty node', why: 'No node exists yet. `__init__` makes no `Node` at all.' },
          '`None`',
        ],
        answer: 2,
        explain: '`None` means nothing here. With no nodes, there is nothing for `head` to point at.',
        hints: ['Look at what `__init__` does.'],
      },
      { id: 'match-parts', type: 'match', level: 1,
        q: 'Match each job to the cost you counted.',
        pairs: [
          ['Add at the front of a chain', 'O(1), 2 arrows change'],
          ['Add at the front of a list', 'O(n), every item moves'],
          ['Read spot k of a list', 'O(1), one jump'],
          ['Read spot k of a chain', 'O(n), walk from the head'],
        ],
        explain: 'A chain is quick at the front. A list is quick at reading any spot.',
        hints: ['Start with the one where nothing else has to move.'],
      },
      { id: 'walk-spot', type: 'predict', level: 2,
        q: 'What will the screen show?',
        code: withLL(py`
          ll = LinkedList()
          ll.add_front(4)
          ll.add_front(1)
          ll.add_front(6)
          print(ll.head.next.value)
        `),
        options: [
          { text: '6', why: 'That is `ll.head.value`. The `.next` follows one arrow away from the head.' },
          '1',
          { text: '4', why: '4 went in first, so it ended up last. One `.next` from the head does not reach it.' },
        ],
        answer: 1,
        explain: 'The chain is 6, then 1, then 4. One arrow from the head lands on 1.',
        hints: ['Write the chain out after each call.', 'Then start at the head and follow one arrow.'],
      },
      { id: 'fix-lost-chain', type: 'fix', level: 2,
        q: 'This should print `[8, 2]`, but the 2 goes missing. Fix `add_front`.',
        code: withLL(py`
          ll = LinkedList()
          ll.add_front(2)
          ll.add_front(8)
          print(ll.to_list())
        `).replace('        new.next = self.head\n', ''),
        answer: withLL(py`
          ll = LinkedList()
          ll.add_front(2)
          ll.add_front(8)
          print(ll.to_list())
        `),
        wantOutput: '[8, 2]',
        explain: 'The new node must hold on to the old first node before `head` moves. Otherwise the old chain is lost.',
        hints: ['After the second call, what is `new.next`?', 'Add one line before `self.head = new`.'],
      },
      { id: 'write-len', type: 'write', level: 2,
        q: 'Write `__len__`, so that `len(ll)` counts the nodes. An empty chain has length 0.',
        starter: withNode(py`
          class LinkedList:
              def __init__(self):
                  self.head = None

              def add_front(self, value):
                  new = Node(value)
                  new.next = self.head
                  self.head = new

              def __len__(self):
                  # Walk the chain and count.
                  return -1
        `),
        answer: withNode(py`
          class LinkedList:
              def __init__(self):
                  self.head = None

              def add_front(self, value):
                  new = Node(value)
                  new.next = self.head
                  self.head = new

              def __len__(self):
                  total = 0
                  node = self.head
                  while node is not None:
                      total = total + 1
                      node = node.next
                  return total
        `),
        tests: [
          { label: 'An empty chain has length 0', call: 'len(LinkedList())', want: '0' },
          { label: 'One node', call: '(lambda l: (l.add_front(1), len(l))[1])(LinkedList())', want: '1' },
          { label: 'Three nodes', call: '(lambda l: (l.add_front(1), l.add_front(2), l.add_front(3), len(l))[3])(LinkedList())', want: '3' },
        ],
        explain: 'The walking loop visits each node once, so add 1 on each turn. With no nodes, the loop never runs.',
        hints: ['Start a total at 0, and start `node` at `self.head`.', 'Loop while `node is not None`, and follow `node.next` each turn.'],
      },
      { id: 'write-pop-front', type: 'write', level: 3,
        q: 'Stretch: write `pop_front`. It takes the first node out of the chain and gives back its value. On an empty chain, it gives back `None`.',
        starter: withNode(py`
          class LinkedList:
              def __init__(self):
                  self.head = None

              def add_front(self, value):
                  new = Node(value)
                  new.next = self.head
                  self.head = new

              def pop_front(self):
                  # Your code here.
                  return -1
        `),
        answer: withNode(py`
          class LinkedList:
              def __init__(self):
                  self.head = None

              def add_front(self, value):
                  new = Node(value)
                  new.next = self.head
                  self.head = new

              def pop_front(self):
                  if self.head is None:
                      return None
                  value = self.head.value
                  self.head = self.head.next
                  return value
        `),
        tests: [
          { label: 'An empty chain gives None', check: 'LinkedList().pop_front() is None' },
          { label: 'It gives back the first value', call: '(lambda l: (l.add_front(1), l.add_front(2), l.pop_front())[2])(LinkedList())', want: '2' },
          { label: 'The next value is now first', call: '(lambda l: (l.add_front(1), l.add_front(2), l.pop_front(), l.head.value)[3])(LinkedList())', want: '1' },
          { label: 'Taking the only node leaves head as None', check: '(lambda l: (l.add_front(1), l.pop_front(), l.head is None)[2])(LinkedList())' },
        ],
        explain: 'Save the value first, because moving `head` drops that node. This takes the same few steps at any size, so it is O(1).',
        hints: ['Check for an empty chain first.', 'Put a name on the value before you move `head`.', 'Move `head` with `self.head = self.head.next`.'],
      },
    ],
  });

  // ---------------------------------------------------------------- lesson 14.2
  Course.lesson('m14-linked-lists', {
    id: '14-2-walk-insert-delete',
    num: '14.2',
    title: 'Walk, insert and delete',
    goal: 'You can search a chain, insert a node safely, and delete a node.',
    mins: 15,
    steps: [
      { t: 'h', text: 'How do you find a value?' },
      { t: 'p', text: 'You walked a chain in lesson 7.3. Now you stop when you find what you want. From here on, a function takes `head` and works from there. Inside a `LinkedList`, it would use `self.head`.' },
      { t: 'words', items: [
        { word: 'traverse', means: 'Walk along a chain and visit each node once.', say: 'truh-VERS' },
        { word: 'rewire', means: 'Change where an arrow points.' },
        { word: 'tail', means: 'The last node of a chain. Its next is None.' },
      ] },
      { t: 'code', caption: 'To [[traverse|traverse]] the chain, follow the arrows. This one counts each look. `build` makes the chain from a list. `reversed(values)` goes through the list from its end, so the first value lands in front. Try other targets.',
        code: withHelpers(py`
          def find(head, target):
              looks = 0
              node = head
              while node is not None:
                  looks = looks + 1
                  if node.value == target:
                      print("found, looks:", looks)
                      return
                  node = node.next
              print("not there, looks:", looks)

          head = build([4, 7, 2, 9])
          find(head, 4)
          find(head, 9)
          find(head, 5)
        `),
        output: 'found, looks: 1\nfound, looks: 4\nnot there, looks: 4',
      },
      { t: 'q', id: 'looks-missing', type: 'mcq', level: 1,
        q: 'The chain holds 4, 7, 2, 9. Count by hand. How many nodes do you look at when the target is not there?',
        options: [
          { text: '1', why: 'You cannot tell after one look. The target could be further along the chain.' },
          { text: '0', why: 'The chain does not know what it holds. You must walk it to find out.' },
          '4',
        ],
        answer: 2,
        explain: 'You must look at every node before you can say no. So the worst case is O(n), the same as `x in items`.',
        hints: ['When can you be sure the value is not there?'],
      },

      { t: 'h', text: 'Which arrow do you change first?' },
      { t: 'p', text: 'Now add a new node after a node called `node`. You must [[rewire]] 2 arrows. Which goes first? Guess before you look.' },
      { t: 'q', id: 'spark-early', type: 'predict', level: 2,
        q: 'The chain is 1, then 2. This code changes `a.next` first. What will the screen show?',
        code: withNode(py`
          a = Node(1)
          a.next = Node(2)
          new = Node(9)
          a.next = new
          new.next = a.next
          print(new.next.value)
        `),
        options: [
          { text: '2', why: 'You may think `a.next` still leads to 2. But the line before moved it to `new`.' },
          '9',
          { text: 'None', why: '`new.next` starts as `None`, but the last line changes it to what `a.next` points at.' },
        ],
        answer: 1,
        explain: 'Once `a.next` is `new`, the line `new.next = a.next` makes `new` point at itself. The 2 is lost.',
        hints: ['What does `a.next` point at after `a.next = new` runs?', 'So what does `new.next` get on the next line?'],
      },
      { t: 'viz', name: 'm14-insert-early', caption: 'Here is what goes wrong, one arrow at a time. Try other numbers, and a different spot.' },
      { t: 'big', text: 'Set the new arrow first. [[Rewire|rewire]] the old arrow last. Then the rest of the chain is never lost.' },
      { t: 'viz', name: 'm14-insert-safe', caption: 'The same job with the lines swapped. Try the last spot too.' },
      { t: 'steps', title: 'Insert after a node', items: [
        { label: 'Make the node', text: 'The new node starts with `None` in its next.', code: 'new = Node(value)' },
        { label: 'Hold on to the rest', text: 'The new node takes what comes after `node`. Nothing is lost yet.', code: 'new.next = node.next' },
        { label: 'Join it in', text: 'Now `node` can let go of its old arrow.', code: 'node.next = new' },
      ] },
      { t: 'code', caption: 'Insert 5 after the 8, then 1 after the last node. Add a third insert of your own.',
        code: withHelpers(py`
          def insert_after(node, value):
              new = Node(value)
              new.next = node.next
              node.next = new

          head = build([3, 8, 2])
          insert_after(head.next, 5)
          print(show(head))
          insert_after(head.next.next.next, 1)
          print(show(head))
        `),
        output: '[3, 8, 5, 2]\n[3, 8, 5, 2, 1]',
      },
      { t: 'q', id: 'order-insert', type: 'order', level: 2,
        q: 'Put the lines in order, so that no node gets lost. One line is not needed.',
        lines: [
          'def insert_after(node, value):',
          '    new = Node(value)',
          '    new.next = node.next',
          '    node.next = new',
        ],
        extra: ['    new = node.next'],
        explain: 'First the new node holds on to the rest. Only then can `node` point at the new node.',
        hints: ['Make the node before you use it.', 'Which arrow is safe to set while `node.next` still leads to the rest?'],
      },

      { t: 'h', text: 'How do you delete a node?' },
      { t: 'p', text: 'To delete a node, make the node before it skip over it. So you need a name on the node before. Call it `prev`, and call the one you are looking at `cur`.' },
      { t: 'viz', name: 'm14-delete', caption: 'Try a value in the middle, the first value, the last value, and one that is not there.' },
      { t: 'code', caption: 'Deleting the first node is a special case, because no node comes before it.',
        code: withHelpers(py`
          def delete(head, target):
              if head is None:
                  return None
              if head.value == target:
                  return head.next
              prev = head
              cur = head.next
              while cur is not None:
                  if cur.value == target:
                      prev.next = cur.next
                      return head
                  prev = cur
                  cur = cur.next
              return head

          print(show(delete(build([3, 8, 2]), 8)))
          print(show(delete(build([3, 8, 2]), 3)))
          print(show(delete(build([3, 8, 2]), 2)))
          print(show(delete(build([3, 8, 2]), 7)))
          print(show(delete(build([]), 7)))
        `),
        output: '[3, 2]\n[8, 2]\n[3, 8]\n[3, 8, 2]\n[]',
      },
      { t: 'table', caption: 'The [[edge cases|edge case]] to check each time', head: ['The chain or target', 'What delete must do'], rows: [
        ['The chain is empty', 'Give back `None`. There is nothing to do.'],
        ['The first node matches', 'Give back `head.next`. Its next is the new head.'],
        ['The last node matches', '`prev.next` gets `None`, and that is fine.'],
        ['The value is not there', 'The loop ends and the chain stays the same.'],
        ['The value is there twice', 'This code deletes the first one only.'],
      ] },
      { t: 'q', id: 'delete-twice', type: 'predict', level: 2,
        q: 'The value 5 is there twice. What will the screen show?',
        code: withHelpers(py`
          def delete(head, target):
              if head is None:
                  return None
              if head.value == target:
                  return head.next
              prev = head
              cur = head.next
              while cur is not None:
                  if cur.value == target:
                      prev.next = cur.next
                      return head
                  prev = cur
                  cur = cur.next
              return head

          print(show(delete(build([1, 5, 7, 5]), 5)))
        `),
        options: [
          { text: '[1, 7]', why: 'That would delete every 5. The `return head` line ends the function after the first one.' },
          '[1, 7, 5]',
          { text: '[1, 5, 7]', why: 'The walk starts at the head, so it finds the first 5 before the second.' },
        ],
        answer: 1,
        explain: 'The function returns right after the first match. So the second 5 stays.',
        hints: ['Which 5 does the walk reach first?', 'What does the function do right after it deletes a node?'],
      },
      { t: 'trap',
        think: 'Once a node is deleted, I must wipe it somehow.',
        real: 'You only stop pointing at it. With no arrow and no name left, nothing can reach it. Then Python can free that memory.',
        code: py`
          prev.next = cur.next   # that is all
        `,
      },
      { t: 'tip', title: 'How to recognize it', text: 'If a problem says "remove" or "insert before", you need the node before. So walk with 2 names, `prev` and `cur`.' },
      { t: 'cost', title: 'How fast is it?', items: [
        { op: 'Walk to find a value', cost: 'O(n)', why: 'You counted 4 looks for 4 nodes when the value was not there.' },
        { op: 'Insert after a node you already hold', cost: 'O(1)', why: 'You change 2 arrows and walk nowhere.' },
        { op: 'Insert at spot k, or delete a value', cost: 'O(n)', why: 'The arrows are quick. The walk to get there is not.' },
        { op: 'Add at the end', cost: 'O(n)', why: 'You walk to the [[tail]]. If you keep a name on the tail, it becomes O(1).' },
      ] },
      { t: 'tip', title: 'Be careful with O(1)', text: 'People say "linked lists insert in O(1)". That is true only once you hold the node. Finding it first is still O(n).' },
    ],
    recap: [
      'You can walk a chain and stop at a value.',
      'You set the new arrow first, then the old one.',
      'You can delete with prev and cur, and handle the head.',
    ],
    practice: [
      { id: 'which-first', type: 'mcq', level: 1,
        q: 'You are adding `new` after `node`. Which line must run first?',
        options: [
          '`new.next = node.next`',
          { text: '`node.next = new`', why: 'This drops the only arrow to the rest of the chain. Then `new` has nothing to hold on to.' },
          { text: 'Either one', why: 'Order matters here. Each line uses what the other line changes.' },
        ],
        answer: 0,
        explain: 'While `node.next` still leads to the rest, `new` can take that arrow. Then `node` can safely change.',
        hints: ['Which line would lose the rest of the chain?'],
      },
      { id: 'insert-result', type: 'predict', level: 2,
        q: 'What will the screen show?',
        code: withHelpers(py`
          def insert_after(node, value):
              new = Node(value)
              new.next = node.next
              node.next = new

          head = build([1, 2])
          insert_after(head, 7)
          insert_after(head, 8)
          print(show(head))
        `),
        options: [
          { text: '[1, 7, 8, 2]', why: 'Both inserts go right after the head, not after the last new node. So 8 lands before 7.' },
          '[1, 8, 7, 2]',
          { text: '[1, 8, 2]', why: 'The second insert does not replace the 7. The 8 holds on to it with its next arrow.' },
        ],
        answer: 1,
        explain: 'Each insert goes right after the head. So the 8 sits between 1 and 7.',
        hints: ['Write the chain after each insert.'],
      },
      { id: 'trace-delete', type: 'trace', level: 2,
        q: 'Delete 2 from the chain 3, 8, 2, 6. Fill in the values of `prev` and `cur` at each check of the `if` line.',
        code: py`
          prev = head
          cur = head.next
          while cur is not None:
              if cur.value == target:
                  prev.next = cur.next
                  break
              prev = cur
              cur = cur.next
        `,
        head: ['check', 'prev', 'cur'],
        rows: [['1', '3', '8'], ['2', '8', '2']],
        given: 1,
        verify: withHelpers(py`
          head = build([3, 8, 2, 6])
          target = 2
          prev = head
          cur = head.next
          check = 1
          while cur is not None:
              print(check, prev.value, cur.value)
              if cur.value == target:
                  prev.next = cur.next
                  break
              prev = cur
              cur = cur.next
              check = check + 1
        `),
        explain: '`prev` stays one node behind `cur`. When `cur` reaches 2, `prev` is on the 8, so the 8 can skip over it.',
        hints: ['Both names move one node per turn.', 'The walk stops when `cur` reaches 2.'],
      },
      { id: 'fix-insert-order', type: 'fix', level: 2,
        q: 'The chain should be 1, 9, 2. Python shows 1 9 9, because 2 lines are in the wrong order. Fix them.',
        code: withNode(py`
          def insert_after(node, value):
              new = Node(value)
              node.next = new
              new.next = node.next

          a = Node(1)
          a.next = Node(2)
          insert_after(a, 9)
          print(a.value, a.next.value, a.next.next.value)
        `),
        answer: withNode(py`
          def insert_after(node, value):
              new = Node(value)
              new.next = node.next
              node.next = new

          a = Node(1)
          a.next = Node(2)
          insert_after(a, 9)
          print(a.value, a.next.value, a.next.next.value)
        `),
        wantOutput: '1 9 2',
        explain: '`new` must take the old arrow before `node` lets go of it. Otherwise `new` points at itself.',
        hints: ['What does `node.next` point at when the last line of the function runs?', 'Swap the 2 arrow lines.'],
      },
      { id: 'fix-delete-head', type: 'fix', level: 2,
        q: 'Deleting the first value does nothing here. Fix `delete`, so that all 3 tests pass.',
        code: withHelpers(py`
          def delete(head, target):
              if head is None:
                  return None
              prev = head
              cur = head.next
              while cur is not None:
                  if cur.value == target:
                      prev.next = cur.next
                      return head
                  prev = cur
                  cur = cur.next
              return head
        `),
        answer: withHelpers(py`
          def delete(head, target):
              if head is None:
                  return None
              if head.value == target:
                  return head.next
              prev = head
              cur = head.next
              while cur is not None:
                  if cur.value == target:
                      prev.next = cur.next
                      return head
                  prev = cur
                  cur = cur.next
              return head
        `),
        tests: [
          { label: 'Delete the first value', call: 'show(delete(build([3, 8]), 3))', want: '[8]' },
          { label: 'Delete the only value', call: 'show(delete(build([3]), 3))', want: '[]' },
          { label: 'Delete a later value', call: 'show(delete(build([3, 8]), 8))', want: '[3]' },
        ],
        explain: 'The loop starts at the second node, so it never checks the first. The first node needs its own check.',
        hints: ['Which node does `cur` look at first?', 'Check `head.value` before the loop, and give back `head.next`.'],
      },
      { id: 'write-add-back', type: 'write', level: 2,
        q: 'Write `add_back(head, value)`. It adds a node at the end and gives back the head. An empty chain must work too.',
        starter: withHelpers(py`
          def add_back(head, value):
              # Your code here.
              return head
        `),
        answer: withHelpers(py`
          def add_back(head, value):
              new = Node(value)
              if head is None:
                  return new
              node = head
              while node.next is not None:
                  node = node.next
              node.next = new
              return head
        `),
        tests: [
          { label: 'Add to a chain of 2', call: 'show(add_back(build([1, 2]), 3))', want: '[1, 2, 3]' },
          { label: 'Add to a chain of 1', call: 'show(add_back(build([1]), 5))', want: '[1, 5]' },
          { label: 'Add to an empty chain', call: 'show(add_back(None, 5))', want: '[5]' },
        ],
        explain: 'Walk until `node.next` is `None`. That node is the [[tail]], so point it at the new node. An empty chain has no tail, so the new node is the head.',
        hints: ['Check for an empty chain first.', 'Loop while `node.next is not None`, so you stop on the last node.'],
      },
      { id: 'write-insert-sorted', type: 'write', level: 3,
        q: 'Stretch: the chain is in order, smallest first. Write `insert_sorted(head, value)`. It keeps the order and gives back the head.',
        starter: withHelpers(py`
          def insert_sorted(head, value):
              # Your code here.
              return head
        `),
        answer: withHelpers(py`
          def insert_sorted(head, value):
              new = Node(value)
              if head is None or value <= head.value:
                  new.next = head
                  return new
              node = head
              while node.next is not None and node.next.value < value:
                  node = node.next
              new.next = node.next
              node.next = new
              return head
        `),
        tests: [
          { label: 'Into the middle', call: 'show(insert_sorted(build([1, 3, 7]), 5))', want: '[1, 3, 5, 7]' },
          { label: 'Before the head', call: 'show(insert_sorted(build([4, 6]), 2))', want: '[2, 4, 6]' },
          { label: 'At the end', call: 'show(insert_sorted(build([4, 6]), 9))', want: '[4, 6, 9]' },
          { label: 'Into an empty chain', call: 'show(insert_sorted(None, 3))', want: '[3]' },
          { label: 'A value already there', call: 'show(insert_sorted(build([2, 4]), 4))', want: '[2, 4, 4]' },
        ],
        explain: 'The head is a special case, because the new node becomes first. Otherwise, stop on the node before the place, then join in the safe order.',
        hints: ['When does the new node go first?', 'Walk while the next value is smaller than the new value.', 'Then use `new.next = node.next`, followed by `node.next = new`.'],
      },
    ],
  });

  // ---------------------------------------------------------------- lesson 14.3
  Course.lesson('m14-linked-lists', {
    id: '14-3-reverse-dummy',
    num: '14.3',
    title: 'Reverse a chain, and the dummy node trick',
    goal: 'You can reverse a chain, and use a dummy node to protect the head.',
    mins: 15,
    steps: [
      { t: 'h', text: 'How do you turn a chain around?' },
      { t: 'p', text: 'The chain goes 1, 2, 3, 4. You want 4, 3, 2, 1. You could make new nodes. But you can also leave each node where it is and turn its arrow around.' },
      { t: 'q', id: 'count-arrows', type: 'mcq', level: 1,
        q: 'A chain has 4 nodes. Count by hand. How many next arrows must change to reverse it? Remember that the first node must end up with `None`.',
        options: [
          { text: '3', why: 'There are 3 arrows between nodes. But the old last node also changes, from `None` to an arrow.' },
          '4',
          { text: '8', why: 'Each node has one next, so each node changes once. Nothing changes twice.' },
        ],
        answer: 1,
        explain: 'Each of the 4 nodes gets a new next, so 4 changes. That makes reversing O(n).',
        hints: ['Write down what each node points at now.', 'Then write what each one must point at after.'],
      },
      { t: 'words', items: [
        { word: 'in place', means: 'You change the thing you already have, and build no copy.' },
        { word: 'dummy node', means: 'A spare node put before the head. It holds no real value and is never shown.' },
      ] },
      { t: 'analogy', title: 'The treasure hunt again', text: 'Rewrite each clue so that it names the clue before it. But once you rewrite a clue, its old message is gone. So first read where it was sending you. Unlike a real clue, a node keeps its fact. Only its arrow changes.' },
      { t: 'steps', title: 'Turn one arrow', items: [
        { label: 'Save the way ahead', text: 'Put a name on the node after `cur`, before its arrow changes.', code: 'next = cur.next' },
        { label: 'Turn the arrow', text: 'Now `cur` points back at the node behind it.', code: 'cur.next = prev' },
        { label: 'Move prev up', text: 'The node you finished is now the one behind.', code: 'prev = cur' },
        { label: 'Move cur up', text: 'Use the name you saved to step forward.', code: 'cur = next' },
      ] },
      { t: 'viz', name: 'm14-reverse', caption: 'One arrow turns on each trip. Guess before each step, then try 1 number, or none.' },
      { t: 'code', caption: 'This reverses the chain [[in place|in place]]: no new nodes. It works on an empty chain and on a chain of one too.',
        code: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  next = cur.next
                  cur.next = prev
                  prev = cur
                  cur = next
              return prev

          print(show(reverse(build([1, 2, 3, 4]))))
          print(show(reverse(build([7]))))
          print(show(reverse(build([]))))
        `),
        output: '[4, 3, 2, 1]\n[7]\n[]',
      },
      { t: 'tip', title: 'A note on the name next', text: 'Python has a built-in tool called `next`. Using it as a name here hides that tool inside this function. This code does not need the tool, so that is fine. The arrow `cur.next` is a different thing.' },
      { t: 'q', id: 'trace-reverse', type: 'trace', level: 2,
        q: 'Reverse the chain 1, 2, 3. Fill in the names after each trip. Write the value of the node, or None.',
        code: py`
          while cur is not None:
              next = cur.next
              cur.next = prev
              prev = cur
              cur = next
        `,
        head: ['trip', 'next', 'prev', 'cur'],
        rows: [['1', '2', '1', '2'], ['2', '3', '2', '3'], ['3', 'None', '3', 'None']],
        given: 1,
        verify: withHelpers(py`
          def name(node):
              return None if node is None else node.value

          prev = None
          cur = build([1, 2, 3])
          trip = 1
          while cur is not None:
              next = cur.next
              cur.next = prev
              prev = cur
              cur = next
              print(trip, name(next), name(prev), name(cur))
              trip = trip + 1
        `),
        explain: 'Each trip, all 3 names move one node forward. When `cur` is `None`, `prev` is on the new first node.',
        hints: ['`prev` takes the old value of `cur`.', '`cur` takes the value of `next`.'],
      },
      { t: 'h', text: 'What if you skip the first line?' },
      { t: 'p', text: 'Here is the same mistake as in the last lesson. The arrow changes too early, so the rest of the chain is lost. See it for yourself.' },
      { t: 'viz', name: 'm14-reverse-early', caption: 'There is no next name in this code. Watch what happens to the nodes ahead of cur.' },
      { t: 'q', id: 'predict-early-reverse', type: 'predict', level: 2,
        q: 'This reverse has no `next` name. What will the screen show?',
        code: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  cur.next = prev
                  prev = cur
                  cur = cur.next
              return prev

          print(show(reverse(build([1, 2, 3]))))
        `),
        options: [
          { text: '[3, 2, 1]', why: 'That needs a saved way ahead. Here `cur.next` is already changed when `cur` tries to follow it.' },
          '[1]',
          { text: '[]', why: 'The first node is still there. `prev` still names it, so the function gives it back.' },
        ],
        answer: 1,
        explain: 'On the first trip, `cur.next` becomes `None`. Then `cur = cur.next` makes `cur` `None`, so the loop ends after one trip.',
        hints: ['What does `cur.next` point at after `cur.next = prev` runs?', 'So where does `cur` go on the last line of the loop?'],
      },
      { t: 'q', id: 'order-reverse', type: 'order', level: 2,
        q: 'Put the lines in order. One line is not needed, because it follows an arrow that has already changed.',
        lines: [
          'def reverse(head):',
          '    prev, cur = None, head',
          '    while cur is not None:',
          '        next = cur.next',
          '        cur.next = prev',
          '        prev = cur',
          '        cur = next',
          '    return prev',
        ],
        extra: ['        cur = cur.next'],
        explain: 'Save the way ahead, turn the arrow, then move both names. At the end, `prev` is on the new head.',
        hints: ['Which line must run before the arrow changes?', 'Move `prev` before `cur`, or you lose where `cur` was.'],
      },
      { t: 'trap',
        think: 'After `reverse(head)`, the name `head` means the new first node.',
        real: 'The name `head` did not move, so it is still on the old first node. That node is the last one now. Save the answer: `head = reverse(head)`.',
        code: py`
          head = reverse(head)
        `,
      },
      { t: 'cost', title: 'How fast is reversing?', items: [
        { op: 'Reverse a chain of n nodes', cost: 'O(n)', why: 'You counted one arrow per node. Each trip takes the same few steps.' },
        { op: 'Extra memory it needs', cost: 'O(1)', why: 'You use 3 names, however long the chain is. No new nodes.' },
      ] },

      { t: 'h', text: 'Why does the first node need extra code?' },
      { t: 'p', text: 'Say you must remove every node with a certain value. Each node needs a `prev` to skip it. But the first node has no node before it. So you would write it twice.' },
      { t: 'p', text: 'A [[dummy node]] fixes this. Put a spare node before the head. Now every real node has a node before it. At the end, the real head is `dummy.next`.' },
      { t: 'viz', name: 'm14-dummy', caption: 'Try a chain where every value matches, like 4,4,4 with target 4.' },
      { t: 'code', caption: 'No special case for the first node. Each test has a tricky chain. Try your own.',
        code: withHelpers(py`
          def remove_all(head, target):
              dummy = Node(0)
              dummy.next = head
              prev = dummy
              while prev.next is not None:
                  if prev.next.value == target:
                      prev.next = prev.next.next
                  else:
                      prev = prev.next
              return dummy.next

          print(show(remove_all(build([5, 7, 5, 2]), 5)))
          print(show(remove_all(build([4, 4, 4]), 4)))
          print(show(remove_all(build([1, 2]), 9)))
          print(show(remove_all(build([]), 1)))
        `),
        output: '[7, 2]\n[]\n[1, 2]\n[]',
      },
      { t: 'q', id: 'fill-dummy', type: 'fill', level: 2,
        q: 'Fill the gaps, so that this removes the first node with no special case.',
        code: withHelpers(py`
          def remove_first(head):
              dummy = Node(0)
              dummy.next = ____
              dummy.next = dummy.next.next
              return ____

          print(show(remove_first(build([6, 3]))))
        `),
        blanks: ['head', 'dummy.next'],
        output: '[3]',
        explain: 'The dummy points at the real head. At the end, whatever follows the dummy is the new head.',
        hints: ['What should come right after the dummy?', 'Do you give back `head`, or what follows the dummy?'],
      },
      { t: 'tip', title: 'How to recognize these patterns', text: 'Words like "reverse" or "in place" call for `prev`, `cur` and `next`. Words like "the first node may change", "remove" or "merge" call for a dummy node.' },
    ],
    recap: [
      'You can reverse a chain with prev, cur and next.',
      'You save the way ahead before you turn an arrow.',
      'You can use a dummy node to avoid a head special case.',
    ],
    practice: [
      { id: 'why-save', type: 'mcq', level: 1,
        q: 'Why does `reverse` run `next = cur.next` first?',
        options: [
          'The next line changes `cur.next`, and that is the only way to the rest',
          { text: 'To make a copy of the next node', why: 'Nothing gets copied. `next` is one more name on the same node.' },
          { text: 'So the loop can count the nodes', why: 'This code has no count. The name is there to keep the rest of the chain.' },
        ],
        answer: 0,
        explain: 'Once `cur.next` changes, the rest of the chain has no arrow to it. The name `next` keeps hold of it.',
        hints: ['What happens to `cur.next` on the following line?'],
      },
      { id: 'stale-head', type: 'predict', level: 2,
        q: 'The code puts the name `new` on the answer, not `head`. What will the screen show?',
        code: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  next = cur.next
                  cur.next = prev
                  prev = cur
                  cur = next
              return prev

          head = build([1, 2, 3])
          new = reverse(head)
          print(show(new))
          print(show(head))
        `),
        options: [
          { text: '[3, 2, 1]\n[3, 2, 1]', why: 'You may think `head` moved too. But it stays on the node holding 1, which is now last.' },
          { text: '[3, 2, 1]\n[1, 2, 3]', why: 'You may think `reverse` made a copy. It changed the arrows of the only chain there is.' },
          '[3, 2, 1]\n[1]',
        ],
        answer: 2,
        explain: '`head` still names the node holding 1. That node is now last, so a walk from it shows only `[1]`.',
        hints: ['Which node does `head` name after the call?', 'What does that node point at now?'],
      },
      { id: 'fix-return', type: 'fix', level: 2,
        q: 'This reverse gives back nothing. All the arrows are right, but the last line is wrong. Fix it.',
        code: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  next = cur.next
                  cur.next = prev
                  prev = cur
                  cur = next
              return cur
        `),
        answer: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  next = cur.next
                  cur.next = prev
                  prev = cur
                  cur = next
              return prev
        `),
        tests: [
          { label: 'Reverse 3 nodes', call: 'show(reverse(build([1, 2, 3])))', want: '[3, 2, 1]' },
          { label: 'Reverse 1 node', call: 'show(reverse(build([5])))', want: '[5]' },
          { label: 'Reverse an empty chain', call: 'show(reverse(None))', want: '[]' },
        ],
        explain: 'The loop ends when `cur` is `None`. At that moment, `prev` is on the new first node.',
        hints: ['What is `cur` when the loop stops?', 'Which name is on a real node at the end?'],
      },
      { id: 'fix-order', type: 'fix', level: 2,
        q: 'This reverse keeps only one node. Add the line that is missing, and use it.',
        code: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  cur.next = prev
                  prev = cur
                  cur = cur.next
              return prev
        `),
        answer: withHelpers(py`
          def reverse(head):
              prev = None
              cur = head
              while cur is not None:
                  next = cur.next
                  cur.next = prev
                  prev = cur
                  cur = next
              return prev
        `),
        tests: [
          { label: 'Reverse 3 nodes', call: 'show(reverse(build([1, 2, 3])))', want: '[3, 2, 1]' },
          { label: 'Reverse 2 nodes', call: 'show(reverse(build([8, 9])))', want: '[9, 8]' },
          { label: 'Reverse an empty chain', call: 'show(reverse(None))', want: '[]' },
        ],
        explain: 'Save `cur.next` before it changes, and use that saved name to step forward.',
        hints: ['What does `cur.next` point at on the last line of the loop?', 'Put a name on it at the top of the loop.'],
      },
      { id: 'write-remove-small', type: 'write', level: 2,
        q: 'Write `remove_small(head, limit)`. It removes every node with a value below `limit`, and gives back the head. Use a dummy node.',
        starter: withHelpers(py`
          def remove_small(head, limit):
              # Your code here.
              return head
        `),
        answer: withHelpers(py`
          def remove_small(head, limit):
              dummy = Node(0)
              dummy.next = head
              prev = dummy
              while prev.next is not None:
                  if prev.next.value < limit:
                      prev.next = prev.next.next
                  else:
                      prev = prev.next
              return dummy.next
        `),
        tests: [
          { label: 'Small values in the middle', call: 'show(remove_small(build([5, 1, 6, 2]), 3))', want: '[5, 6]' },
          { label: 'A small value first', call: 'show(remove_small(build([1, 5]), 3))', want: '[5]' },
          { label: 'Every value is small', call: 'show(remove_small(build([1, 2]), 3))', want: '[]' },
          { label: 'An empty chain', call: 'show(remove_small(None, 3))', want: '[]' },
        ],
        explain: 'The dummy gives the first node a node before it. When you remove a node, `prev` stays, because the new `prev.next` may be small too.',
        hints: ['Start `prev` on the dummy.', 'Look at `prev.next.value` each time.', 'Move `prev` only when you keep a node.'],
      },
      { id: 'write-merge', type: 'write', level: 3,
        q: 'Stretch: 2 chains are in order, smallest first. Write `merge(a, b)`. It joins them into one chain in order, and gives back its head.',
        starter: withHelpers(py`
          def merge(a, b):
              # Hint: a dummy node gives you a place to start.
              return None
        `),
        answer: withHelpers(py`
          def merge(a, b):
              dummy = Node(0)
              tail = dummy
              while a is not None and b is not None:
                  if a.value <= b.value:
                      tail.next = a
                      a = a.next
                  else:
                      tail.next = b
                      b = b.next
                  tail = tail.next
              if a is not None:
                  tail.next = a
              else:
                  tail.next = b
              return dummy.next
        `),
        tests: [
          { label: 'Two chains of 3', call: 'show(merge(build([1, 4, 6]), build([2, 3, 9])))', want: '[1, 2, 3, 4, 6, 9]' },
          { label: 'One empty chain', call: 'show(merge(None, build([2, 5])))', want: '[2, 5]' },
          { label: 'Both empty', call: 'show(merge(None, None))', want: '[]' },
          { label: 'Equal values', call: 'show(merge(build([1, 1]), build([1])))', want: '[1, 1, 1]' },
        ],
        explain: 'Take the smaller front node each time and join it after `tail`. When one chain runs out, the other is already in order. So join it all at once.',
        hints: ['Start with `dummy = Node(0)` and `tail = dummy`.', 'While both chains have nodes, join the smaller front node after `tail`.', 'When one chain runs out, point `tail.next` at the other.'],
      },
    ],
  });

  // ---------------------------------------------------------------- lesson 14.4
  Course.lesson('m14-linked-lists', {
    id: '14-4-fast-slow-doubly',
    num: '14.4',
    title: 'Bonus: fast and slow, two-way chains, and which to use',
    goal: 'You can find the middle of a chain, spot a cycle, and pick the right tool.',
    mins: 15,
    optional: true,
    steps: [
      { t: 'h', text: 'How do you find the middle in one walk?' },
      { t: 'p', text: 'A chain does not know its length. You could walk once to count, then walk again to the middle. But one walk is enough, with 2 names.' },
      { t: 'q', id: 'spark-middle', type: 'mcq', level: 1,
        q: 'Two walkers start at the first of 5 nodes. One follows 1 arrow per turn, and the other follows 2. Count by hand. Where is the slow one when the fast one reaches the last node?',
        options: [
          { text: 'On the second node', why: 'That is after one turn. The fast one needs 2 turns to follow 4 arrows.' },
          'On the third node',
          { text: 'On the last node', why: 'The slow one moves half as far. It only gets halfway.' },
        ],
        answer: 1,
        explain: 'The fast one follows 4 arrows in 2 turns. In those 2 turns, the slow one follows 2 arrows and lands on the middle.',
        hints: ['How many arrows are there from the first node to the last?', 'How many turns does the fast one need for that?'],
      },
      { t: 'words', items: [
        { word: 'fast and slow pointers', means: 'Two names that walk a chain at different speeds, often 2 arrows and 1 arrow.' },
        { word: 'cycle', means: 'A chain whose arrows lead back to an earlier node, so it never reaches None.', say: 'SY-kul' },
        { word: 'doubly linked list', means: 'A chain whose nodes each have 2 arrows: one to the next, and one to the node before.', say: 'DUB-lee' },
      ] },
      { t: 'analogy', title: 'Two friends on the treasure hunt', text: 'Two friends follow the clues. One reads 1 clue per turn. The other reads 2. When the fast friend runs out of clues, the slow friend is halfway. Unlike real friends, they cannot see each other. The code only checks if they stand on the same node.' },
      { t: 'viz', name: 'm14-middle', caption: 'Try an even count, like 4 numbers. There are 2 middles then. Which one does slow land on?' },
      { t: 'code', caption: 'With an even count, slow lands on the second of the 2 middles. Try other chains.',
        code: withHelpers(py`
          def middle(head):
              slow = head
              fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              return slow

          print(middle(build([3, 8, 2, 6, 5])).value)
          print(middle(build([3, 8, 2, 6])).value)
          print(middle(build([7])).value)
          print(middle(build([])))
        `),
        output: '2\n2\n7\nNone',
      },
      { t: 'trap',
        think: 'Checking `fast.next` is enough in the loop line.',
        real: 'On an even chain, `fast` ends up as `None`. Then `fast.next` makes Python stop. Check `fast is not None` first, because `and` stops early when the left side is False.',
        code: py`
          while fast is not None and fast.next is not None:
        `,
      },

      { t: 'h', text: 'What if a chain never ends?' },
      { t: 'p', text: 'A bug can make an arrow point back at an earlier node. Then the chain has a [[cycle]]. A walking loop never reaches `None`, so it never stops.' },
      { t: 'code', caption: 'We added a safety counter, so this one stops after 8 trips. See how 2 and 3 repeat.',
        code: withNode(py`
          a = Node(1)
          b = Node(2)
          c = Node(3)
          a.next = b
          b.next = c
          c.next = b

          node = a
          trips = 0
          while node is not None and trips < 8:
              print(node.value)
              node = node.next
              trips = trips + 1
          print("I stopped it for you.")
        `),
        output: '1\n2\n3\n2\n3\n2\n3\n2\nI stopped it for you.',
      },
      { t: 'p', text: 'Use [[fast and slow pointers|fast and slow pointers]] again. With no cycle, the fast one reaches `None`. With a cycle, the fast one comes round behind the slow one and catches it.' },
      { t: 'viz', name: 'm14-cycle', caption: 'Change where the last node points. Use -1 for no cycle. Then count the turns.' },
      { t: 'q', id: 'why-meet', type: 'mcq', level: 2,
        q: 'Inside a cycle, the fast one is 3 nodes behind the slow one. What happens to that gap on each turn?',
        options: [
          { text: 'It stays at 3', why: 'They move at different speeds, so the gap cannot stay the same.' },
          'It shrinks by 1',
          { text: 'It shrinks by 2', why: 'The fast one follows 2 arrows, but the slow one also follows 1. So the fast one gains only 1.' },
        ],
        answer: 1,
        explain: 'Fast gains 1 node per turn. So the gap goes 3, 2, 1, 0, and fast cannot jump over slow.',
        hints: ['Fast moves 2 forward. Slow moves 1 forward. What is the difference?'],
      },
      { t: 'code', caption: 'All 3 nodes hold 1. So the code uses `is`: it wants the very same node, not equal values. Change where `c.next` points.',
        code: withNode(py`
          def has_cycle(head):
              slow = head
              fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
                  if slow is fast:
                      return True
              return False

          a = Node(1)
          b = Node(1)
          c = Node(1)
          a.next = b
          b.next = c
          print(has_cycle(a))
          c.next = b
          print(has_cycle(a))
          print(has_cycle(None))
        `),
        output: 'False\nTrue\nFalse',
      },
      { t: 'tip', title: 'How to recognize it', text: 'Do you see "middle of the chain", "has a loop" or "cycle"? Reach for fast and slow pointers. A similar trick solves "the nth from the end".' },
      { t: 'cost', title: 'How fast is it?', items: [
        { op: 'Find the middle', cost: 'O(n)', why: 'Fast walks the chain once. Only 2 names are needed.' },
        { op: 'Check for a cycle', cost: 'O(n)', why: 'Slow walks into the cycle, and fast catches it within one lap of the cycle.' },
        { op: 'Check with a set of seen nodes', cost: 'O(n)', why: 'It works too, but the set grows with the chain. Fast and slow needs only 2 names.' },
      ] },

      { t: 'h', text: 'What if arrows go both ways?' },
      { t: 'p', text: 'In a [[doubly linked list]], each node also has a `.prev` arrow. So you can walk backwards. You can also delete a node you hold, without walking to find the one before.' },
      { t: 'viz', name: 'm14-doubly', caption: 'Pick a spot to remove. Try the first spot and the last spot too.' },
      { t: 'code', caption: 'A chain keeps a name on both ends. `show_back` walks from the tail with `.prev`. Remove another node.',
        code: py`
          class DNode:
              def __init__(self, value):
                  self.value = value
                  self.prev = None
                  self.next = None

          class Chain:
              def __init__(self):
                  self.head = None
                  self.tail = None

              def add_back(self, value):
                  new = DNode(value)
                  new.prev = self.tail
                  if self.tail is None:
                      self.head = new
                  else:
                      self.tail.next = new
                  self.tail = new
                  return new

              def remove(self, node):
                  if node.prev is None:
                      self.head = node.next
                  else:
                      node.prev.next = node.next
                  if node.next is None:
                      self.tail = node.prev
                  else:
                      node.next.prev = node.prev

              def show_back(self):
                  items = []
                  node = self.tail
                  while node is not None:
                      items.append(node.value)
                      node = node.prev
                  return items

          c = Chain()
          c.add_back(3)
          n = c.add_back(8)
          c.add_back(2)
          print(c.show_back())
          c.remove(n)
          print(c.show_back())
        `,
        output: '[2, 8, 3]\n[2, 3]',
      },
      { t: 'q', id: 'doubly-cost', type: 'mcq', level: 2,
        q: 'What does the `.prev` arrow cost you?',
        options: [
          'Each node takes more memory, and each insert or delete has more arrows to change',
          { text: 'Nothing. It is always better', why: 'No tool is free. Each node must keep one more arrow, and each change must keep it right.' },
          { text: 'Reading a spot gets slower', why: 'Reading a spot was already a walk. An extra arrow does not make that walk longer.' },
        ],
        answer: 0,
        explain: 'A two-way chain does more work to stay correct. Use it only if you need to walk back or remove nodes you already hold.',
        hints: ['What must each node now store?'],
      },

      { t: 'h', text: 'List or linked list?' },
      { t: 'p', text: 'Here is the honest answer. In Python, use a list unless you have a clear reason not to. Compare the costs from this module.' },
      { t: 'table', caption: 'Costs side by side', head: ['Job', 'Python list', 'Linked list'], rows: [
        ['Read spot k', 'O(1)', 'O(n), walk there'],
        ['Add or remove at the front', 'O(n), every item moves', 'O(1)'],
        ['Add at the end', 'O(1) amortized', 'O(n), or O(1) with a tail name'],
        ['Remove at the end', 'O(1)', 'O(n), or O(1) if two-way with a tail'],
        ['Find a value', 'O(n)', 'O(n)'],
        ['Insert in the middle', 'O(n), items move', 'O(n), walk there. Then O(1).'],
      ] },
      { t: 'big', text: 'A list wins most jobs in Python. A linked list wins only when you change the front or hold the node already.' },
      { t: 'p', text: 'Need to add and remove quickly at both ends? Python has `collections.deque`, at O(1) on both ends. You will use it in the next module. Reading the middle of it is O(n).' },
      { t: 'tip', title: 'Where it stops being a treasure hunt', text: 'A real hunt has one path. Nodes can do more. Let the arrows branch out, and you get a tree. Let them lead anywhere, and you get a graph. Both come later.' },
    ],
    recap: [
      'You can find the middle with fast and slow pointers.',
      'You can spot a cycle when fast meets slow.',
      'You can say when to use a list or a chain.',
    ],
    practice: [
      { id: 'pick-tool', type: 'mcq', level: 1,
        q: 'Your program reads items by their spot number, thousands of times. Which tool fits?',
        options: [
          'A Python list',
          { text: 'A linked list', why: 'You may think linked lists are always faster. Reading a spot means walking from the head each time.' },
          { text: 'A doubly linked list', why: 'A second arrow does not help. You would still walk to reach a spot.' },
        ],
        answer: 0,
        explain: 'A list reads any spot in O(1). A chain must walk there in O(n).',
        hints: ['Which one has numbered spots?'],
      },
      { id: 'match-winner', type: 'match', level: 1,
        q: 'Match each job to the tool that does it best.',
        pairs: [
          ['Read spot 500', 'A list, O(1)'],
          ['Add at the front, with a tool you write', 'A chain, O(1)'],
          ['Find a value, with neither one sorted', 'Neither. Both are O(n).'],
          ['Add and remove at both ends in real code', '`collections.deque`, O(1)'],
        ],
        explain: 'Each tool has its own strength. For real Python code, `deque` already covers the ends.',
        hints: ['Start with the job that needs a jump to a numbered spot.'],
      },
      { id: 'even-middle', type: 'predict', level: 2,
        q: 'What will the screen show?',
        code: withHelpers(py`
          def middle(head):
              slow = head
              fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              return slow

          print(middle(build([1, 2, 3, 4, 5, 6])).value)
        `),
        options: [
          { text: '3', why: 'That is the first of the 2 middles. This loop stops only when `fast` is `None`, so slow moves once more.' },
          '4',
          { text: '6', why: 'That is where fast heads. Slow moves half as far.' },
        ],
        answer: 1,
        explain: 'Slow moves 3 times: 2, 3, 4. Then fast is `None`, so the loop stops.',
        hints: ['Write down both names after each turn.'],
      },
      { id: 'trace-fast-slow', type: 'trace', level: 2,
        q: 'The chain is 1, 2, 3, 4, 5. Fill in the value at `slow` and at `fast` after each turn.',
        code: py`
          while fast is not None and fast.next is not None:
              slow = slow.next
              fast = fast.next.next
        `,
        head: ['turn', 'slow', 'fast'],
        rows: [['start', '1', '1'], ['1', '2', '3'], ['2', '3', '5']],
        given: 1,
        verify: withHelpers(py`
          slow = build([1, 2, 3, 4, 5])
          fast = slow
          print("start", slow.value, fast.value)
          turn = 1
          while fast is not None and fast.next is not None:
              slow = slow.next
              fast = fast.next.next
              print(turn, slow.value, fast.value)
              turn = turn + 1
        `),
        explain: 'Fast follows 2 arrows per turn, and slow follows 1. Fast lands on the last node, so `fast.next` is `None` and the loop stops.',
        hints: ['Fast moves twice as far as slow.', 'Does the loop run again when fast is on the last node?'],
      },
      { id: 'fix-even-crash', type: 'fix', level: 2,
        q: 'Python stops on even chains with an `AttributeError`. Fix the `while` line.',
        code: withHelpers(py`
          def middle(head):
              slow = head
              fast = head
              while fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              return slow
        `),
        answer: withHelpers(py`
          def middle(head):
              slow = head
              fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              return slow
        `),
        tests: [
          { label: 'A chain of 3', call: 'middle(build([1, 2, 3])).value', want: '2' },
          { label: 'A chain of 4', call: 'middle(build([1, 2, 3, 4])).value', want: '3' },
          { label: 'An empty chain', check: 'middle(None) is None' },
        ],
        explain: 'On an even chain, `fast` jumps onto `None`, and `None` has no `.next`. So check `fast` itself first.',
        hints: ['What is `fast` after its last jump on an even chain?', 'Add a check for `fast is not None`, with `and`, on the left.'],
      },
      { id: 'write-cycle-size', type: 'write', level: 3,
        q: 'Stretch: write `cycle_size(head)`. If the chain has a cycle, it gives back how many nodes are in the cycle. If not, it gives back 0.',
        starter: withNode(py`
          def cycle_size(head):
              # Find where slow and fast meet.
              # Then walk around once and count.
              return -1

          def looped(values, back):
              nodes = [Node(v) for v in values]
              for i in range(len(nodes) - 1):
                  nodes[i].next = nodes[i + 1]
              if back >= 0:
                  nodes[-1].next = nodes[back]
              return nodes[0]
        `),
        answer: withNode(py`
          def cycle_size(head):
              slow = head
              fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
                  if slow is fast:
                      size = 1
                      node = slow.next
                      while node is not slow:
                          size = size + 1
                          node = node.next
                      return size
              return 0

          def looped(values, back):
              nodes = [Node(v) for v in values]
              for i in range(len(nodes) - 1):
                  nodes[i].next = nodes[i + 1]
              if back >= 0:
                  nodes[-1].next = nodes[back]
              return nodes[0]
        `),
        tests: [
          { label: 'No cycle', call: 'cycle_size(looped([1, 2, 3], -1))', want: '0' },
          { label: 'A cycle of 2 nodes', call: 'cycle_size(looped([1, 2, 3, 4], 2))', want: '2' },
          { label: 'The whole chain is a cycle', call: 'cycle_size(looped([1, 2, 3], 0))', want: '3' },
          { label: 'One node points at itself', call: 'cycle_size(looped([1], 0))', want: '1' },
          { label: 'An empty chain', call: 'cycle_size(None)', want: '0' },
        ],
        explain: 'When slow and fast meet, you stand on a node inside the cycle. Walk until you come back to it, and count the steps.',
        hints: ['Start from the `has_cycle` code.', 'Once they meet, stay on that node and walk with a new name.', 'Stop when the new name is the same node again. Use `is`.'],
      },
      { id: 'write-nth-from-end', type: 'write', level: 3,
        q: 'Stretch: write `nth_from_end(head, n)`. It gives back the value of the nth node from the end. 1 means the last. There are always at least n nodes.',
        starter: withHelpers(py`
          def nth_from_end(head, n):
              # Use 2 names with a gap of n nodes between them.
              return None
        `),
        answer: withHelpers(py`
          def nth_from_end(head, n):
              front = head
              for i in range(n):
                  front = front.next
              back = head
              while front is not None:
                  front = front.next
                  back = back.next
              return back.value
        `),
        tests: [
          { label: 'The last node', call: 'nth_from_end(build([3, 8, 2, 6]), 1)', want: '6' },
          { label: 'Second from the end', call: 'nth_from_end(build([3, 8, 2, 6]), 2)', want: '2' },
          { label: 'The first node', call: 'nth_from_end(build([3, 8, 2, 6]), 4)', want: '3' },
          { label: 'A chain of one', call: 'nth_from_end(build([9]), 1)', want: '9' },
        ],
        explain: 'Both names move at the same speed, so the gap of n stays the same. When `front` falls off the end, `back` is n nodes from it.',
        hints: ['Move one name forward n times first.', 'Then move both names, one arrow each, until the front one is `None`.', 'Read the value at the back one.'],
      },
    ],
  });
})();
