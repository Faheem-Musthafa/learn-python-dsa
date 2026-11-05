/* Module 18: Trees and Binary Search Trees. Part 3 (Trees, graphs and clever ideas). */
(function () {
  /* Python that many programs share. The learner sees it in full each time. */
  const NODE = py`
    class TreeNode:
        def __init__(self, value):
            self.value = value
            self.left = None
            self.right = None
  `;
  const FIVE = py`
    root = TreeNode("A")
    root.left = TreeNode("B")
    root.right = TreeNode("C")
    root.left.left = TreeNode("D")
    root.left.right = TreeNode("E")
  `;
  const SEVEN = FIVE + '\n' + py`
    root.right.left = TreeNode("F")
    root.right.right = TreeNode("G")
  `;
  const INSERT = py`
    def insert(node, value):
        if node is None:
            return TreeNode(value)
        if value < node.value:
            node.left = insert(node.left, value)
        elif value > node.value:
            node.right = insert(node.right, value)
        return node
  `;
  const BUILD = py`
    def build(values):
        root = None
        for v in values:
            root = insert(root, v)
        return root
  `;
  const BST = NODE + '\n\n' + INSERT + '\n\n' + BUILD;
  const withNode = (...parts) => [NODE, ...parts].join('\n\n') + '\n';
  const withBst = (...parts) => [BST, ...parts].join('\n\n') + '\n';

  Course.module({
    id: 'm18-trees',
    num: 18, part: 3, level: 'I',
    title: 'Trees and Binary Search Trees',
    blurb: 'Give a node 2 arrows, then walk, search and grow the tree it makes.',
    needs: ['m07-classes', 'm15-stacks-queues', 'm16-recursion'],
  });

  /* ---------------------------------------------------------------- 18.1 */
  Course.lesson('m18-trees', {
    id: '18-1-tree-words',
    num: '18.1',
    title: 'Trees: nodes with 2 arrows',
    goal: 'You can name the root, leaves and height of a tree, and build one in code.',
    mins: 13,
    steps: [
      { t: 'h', text: 'What if a node had 2 arrows?' },
      { t: 'p', text: 'In module 14, each [[node]] had one arrow, so the nodes made a chain. Now give a node 2 arrows. The chain starts to branch, and you get a [[tree]].' },
      { t: 'analogy', title: 'Picture a family tree', text: 'A family tree starts with one person at the top. Arrows lead down to their children, then to their children\'s children. It stops being true in one way. A real child has 2 parents, but a tree node has only 1.' },
      { t: 'q', id: 'spark-family', type: 'mcq', level: 1,
        q: 'One person sits at the top. They have 2 children, and each child has 2 children. How many people is that?',
        options: [
          '7',
          { text: '6', why: 'That leaves out the person at the top. Count 1, then 2, then 4.' },
          { text: '4', why: 'That counts only the bottom row. The rows above count too.' },
        ],
        answer: 0,
        explain: 'Each row is twice as big as the row above it. So 1 + 2 + 4 makes 7.',
        hints: ['Count one row at a time.'],
      },
      { t: 'words', items: [
        { word: 'root', say: 'rhymes with boot', means: 'The top node of a tree. No arrow points at it.' },
        { word: 'leaf', means: 'A node with no children.' },
        { word: 'height', means: 'How many levels a tree has, from the root down.' },
      ] },
      { t: 'p', text: 'The arrows of a node lead to its **children**. The node above them is their **parent**. These words work as they do in a family.' },
      { t: 'viz', name: 'm18-tree-parts', caption: 'Answer each question. Then pick "Like a line", and compare its height with "Bushy".' },
      { t: 'big', text: 'A tree has one [[root]]. Every other node has exactly 1 parent, and the arrows only go down.' },
      { t: 'table', caption: 'Trees in real life', head: ['Thing', 'Its root', 'Its leaves'], rows: [
        ['Folders on a computer', 'The top folder', 'Files'],
        ['A menu with smaller menus', 'The main menu', 'The final choices'],
        ['A web page', 'The whole page', 'Words and pictures'],
      ] },
      { t: 'q', id: 'height-not-count', type: 'mcq', level: 2,
        q: 'A tree has 7 nodes. Must its [[height]] be 7?',
        options: [
          'No. It depends on the shape',
          { text: 'Yes, height counts the nodes', why: 'That mixes up height with the number of nodes. Height counts levels, and one level can hold many nodes.' },
          { text: 'No. With 7 nodes, it is always 3', why: 'That only fits the bushy shape. The same 7 nodes in a line have height 7.' },
        ],
        answer: 0,
        explain: 'Bushy, it has height 3. As a line, it has height 7. Same nodes, different shape.',
        hints: ['Look again at "Bushy" and "Like a line" in the picture.'],
      },

      { t: 'h', text: 'How do you build a tree in Python?' },
      { t: 'p', text: 'Python has no tree type ready to use. So you write a small class, like `Node` in lesson 7.3. The one arrow `next` becomes 2 arrows, `left` and `right`.' },
      { t: 'p', text: 'This shape is a **binary tree**: each node has at most 2 children. Binary means "made of 2".' },
      { t: 'viz', name: 'm18-tree-build', caption: 'Guess where D goes before you step on.' },
      { t: 'code', caption: 'Follow the dots, one arrow at a time. Then give C a left child, and print it.',
        output: 'A\nB\nD\nNone',
        code: withNode(py`
          root = TreeNode("A")
          root.left = TreeNode("B")
          root.right = TreeNode("C")
          root.left.right = TreeNode("D")

          print(root.value)
          print(root.left.value)
          print(root.left.right.value)
          print(root.right.left)
        `),
      },
      { t: 'q', id: 'read-path', type: 'predict', level: 2,
        q: 'Read the last line from the left, one arrow at a time. What will the screen show?',
        code: withNode(py`
          root = TreeNode(1)
          root.left = TreeNode(2)
          root.right = TreeNode(3)
          root.right.left = TreeNode(4)
          print(root.right.left.value)
        `),
        options: [
          '4',
          { text: '3', why: 'That stops after `.right`. The `.left` takes one more step down.' },
          { text: '2', why: 'That takes the left arrow first. The line says `.right` first, so go right and then left.' },
        ],
        answer: 0,
        explain: 'Start at 1. `.right` goes to 3, and `.left` goes to 4.',
        hints: ['Where does `root.right` lead?'],
      },
      { t: 'q', id: 'fill-arrows', type: 'fill', level: 2,
        q: 'Fill the gaps, so B is the left child and C is the right child.',
        code: withNode(py`
          root = TreeNode("A")
          root.____ = TreeNode("B")
          root.____ = TreeNode("C")
          print(root.left.value, root.right.value)
        `),
        blanks: ['left', 'right'],
        output: 'B C',
        explain: 'Each child hangs on one of the 2 arrows. The print line then reads them back.',
        hints: ['The 2 arrows have the names `left` and `right`.'],
      },
      { t: 'q', id: 'off-the-end', type: 'predict', level: 2, expectError: true,
        q: 'B is a [[leaf]]. What happens when this runs?',
        code: withNode(py`
          root = TreeNode("A")
          root.left = TreeNode("B")
          print(root.left.left.value)
        `),
        options: [
          { text: 'None', why: '`root.left.left` is None. But the line then asks None for a `.value`, and None has no value.' },
          { text: 'B', why: 'That thinks the walk stops at the last real node. Python follows every dot you write.' },
          'Python stops with an AttributeError',
        ],
        answer: 2,
        explain: 'AttributeError means: this thing does not have that part. `None` has no `.value`, so check for None first.',
        hints: ['What is `root.left.left`?', 'Can None hold a value?'],
      },
      { t: 'code', caption: 'A function can tell if a node is a [[leaf]]. Try it on `root.right` too, then guess.',
        output: 'False\nTrue',
        code: withNode(py`
          def is_leaf(node):
              return node.left is None and node.right is None

          root = TreeNode("A")
          root.left = TreeNode("B")
          print(is_leaf(root))
          print(is_leaf(root.left))
        `),
      },
      { t: 'q', id: 'count-arrows', type: 'mcq', level: 2,
        q: 'Count by hand. In the picture you built, how many arrows lead from the root to D?',
        options: [
          { text: '1', why: 'One arrow only reaches B. D hangs one level lower.' },
          '2',
          { text: '4', why: 'That counts the nodes in the tree. The walk only passes along one path.' },
        ],
        answer: 1,
        explain: 'A to B is one arrow, and B to D is the second. C is not on the way.',
        hints: ['Put your finger on A, and follow the path to D.'],
      },
      { t: 'cost', title: 'How fast is it?', items: [
        { op: 'Follow one arrow, like `node.left`', cost: 'O(1)', why: 'One arrow takes one step, however big the tree is.' },
        { op: 'Reach a node from the root', cost: 'O(height)', why: 'You counted 2 arrows to reach D. Each level adds at most one more.' },
      ] },
      { t: 'trap',
        think: 'one node can have 2 parents, like a real child.',
        real: 'Then it is not a tree. A walk would reach that node twice. Python gives no warning, so you must keep it to 1 parent.',
        code: 'b.left = d\nc.left = d    # d now has 2 parents, so not a tree',
      },
      { t: 'tip', title: 'Two ways to count height', text: 'We count levels. One node has height 1, and an empty tree has height 0. Some books count arrows instead, so their number is 1 smaller.' },
    ],
    recap: [
      'You can name the root and the leaves.',
      'You can count the height of a tree.',
      'You can link nodes with left and right.',
    ],
    practice: [
      { id: 'match-words', type: 'match', level: 1,
        q: 'Match each word to what it means.',
        pairs: [
          ['[[root]]', 'The top node, with no arrow pointing at it'],
          ['[[leaf]]', 'A node with no children'],
          ['[[height]]', 'How many levels a tree has'],
        ],
        explain: 'The root is at the top, and leaves are at the ends. Height measures from top to bottom.',
        hints: ['Which word goes with a person who has no children in the family tree?'],
      },
      { id: 'parents', type: 'mcq', level: 1,
        q: 'How many parents does the [[root]] have?',
        options: [
          '0',
          { text: '1', why: 'Every other node has 1 parent. The root sits at the very top, so nothing points at it.' },
          { text: '2', why: 'That follows the real family too closely. A tree node never has 2 parents.' },
        ],
        answer: 0,
        explain: 'No arrow points at the root. That is how you can spot it.',
        hints: ['Is anything above the top node?'],
      },
      { id: 'predict-none', type: 'predict', level: 2,
        q: 'What will the screen show? Type it.',
        code: withNode(py`
          root = TreeNode("X")
          root.right = TreeNode("Y")
          print(root.left)
          print(root.right.value)
        `),
        answer: 'None\nY',
        why: 'The left arrow was never set, so it is still None. The right arrow leads to Y.',
        explain: '`__init__` sets both arrows to None. Only the right arrow changes after that.',
        hints: ['What does `self.left` start as?'],
      },
      { id: 'fix-leaf', type: 'fix', level: 2,
        q: '`is_leaf` says True for a node that has one child. Fix the mistake on line 2 of the function.',
        code: withNode(py`
          def is_leaf(node):
              return node.left is None or node.right is None

          tip = TreeNode(1)
          one = TreeNode(2)
          one.left = tip
        `),
        answer: withNode(py`
          def is_leaf(node):
              return node.left is None and node.right is None

          tip = TreeNode(1)
          one = TreeNode(2)
          one.left = tip
        `),
        tests: [
          { label: 'A node with no children is a leaf', call: 'is_leaf(tip)', want: 'True' },
          { label: 'A node with one child is not a leaf', call: 'is_leaf(one)', want: 'False' },
        ],
        explain: 'A leaf has no children at all, so both arrows must be None. That calls for `and`.',
        hints: ['How many arrows must be None for a leaf?', 'Which word means "both": `and` or `or`?'],
      },
      { id: 'write-children', type: 'write', level: 2,
        q: 'Write `child_count(node)`. It returns how many children the node has: 0, 1 or 2.',
        starter: withNode(py`
          def child_count(node):
              # Your code here.
              return None

          a = TreeNode(1)
          b = TreeNode(2)
          c = TreeNode(3)
          a.left = b
          a.right = c
          b.right = TreeNode(4)
        `),
        answer: withNode(py`
          def child_count(node):
              count = 0
              if node.left is not None:
                  count = count + 1
              if node.right is not None:
                  count = count + 1
              return count

          a = TreeNode(1)
          b = TreeNode(2)
          c = TreeNode(3)
          a.left = b
          a.right = c
          b.right = TreeNode(4)
        `),
        tests: [
          { label: 'a has 2 children', call: 'child_count(a)', want: '2' },
          { label: 'b has 1 child', call: 'child_count(b)', want: '1' },
          { label: 'c has no children', call: 'child_count(c)', want: '0' },
        ],
        explain: 'Check each arrow on its own. Use 2 separate `if` lines, because both can be true.',
        hints: ['Start a count at 0.', 'Add 1 for each arrow that is not None.'],
      },
      { id: 'write-leftmost', type: 'write', level: 3,
        q: 'Stretch: write `leftmost(node)`. It follows left arrows as far as they go, and returns the value it ends on. Use a loop, as in lesson 7.3.',
        starter: withNode(py`
          def leftmost(node):
              # Your code here.
              return None

          top = TreeNode(5)
          top.left = TreeNode(3)
          top.left.right = TreeNode(4)
          top.left.left = TreeNode(1)
          lone = TreeNode(9)
        `),
        answer: withNode(py`
          def leftmost(node):
              while node.left is not None:
                  node = node.left
              return node.value

          top = TreeNode(5)
          top.left = TreeNode(3)
          top.left.right = TreeNode(4)
          top.left.left = TreeNode(1)
          lone = TreeNode(9)
        `),
        tests: [
          { label: 'From 5, it ends on 1', call: 'leftmost(top)', want: '1' },
          { label: 'A lone node returns itself', call: 'leftmost(lone)', want: '9' },
          { label: 'From 4, with no left child, it stays', call: 'leftmost(top.left.right)', want: '4' },
        ],
        explain: 'Stop while the left arrow is None, not after you step onto it. Then `node` is still a real node.',
        hints: ['Which test keeps the loop going?', 'Check `node.left`, not `node`.', 'Move with `node = node.left`.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 18.2 */
  Course.lesson('m18-trees', {
    id: '18-2-three-walks',
    num: '18.2',
    title: 'Preorder, inorder, postorder: 3 walks of a tree',
    goal: 'You can write the preorder, inorder and postorder of a small tree, and code each one.',
    mins: 15,
    steps: [
      { t: 'h', text: 'How do you visit every node?' },
      { t: 'p', text: 'A chain has one path, so one name in a loop can walk it. A tree forks. Each child holds a smaller tree, so [[recursion]] fits well. A walk that visits each node once is a [[traversal]].' },
      { t: 'analogy', title: 'Picture a cave', text: 'At each fork, take the left tunnel and go to its end. Then walk back, and try the right tunnel. A real cave can have many tunnels and loops. A tree has at most 2 ways on, and it never loops.' },
      { t: 'q', id: 'spark-walk', type: 'predict', level: 2,
        q: 'Take a guess. Here `print` comes before the 2 calls. What will the screen show?',
        code: withNode(py`
          def walk(node):
              if node is None:
                  return
              print(node.value)
              walk(node.left)
              walk(node.right)

          root = TreeNode("A")
          root.left = TreeNode("B")
          root.right = TreeNode("C")
          root.left.left = TreeNode("D")
          walk(root)
        `),
        options: [
          'A\nB\nD\nC',
          { text: 'A\nB\nC\nD', why: 'That goes level by level. But `walk(node.left)` must finish its whole side before the right call starts.' },
          { text: 'D\nB\nA\nC', why: 'That prints the left side first. Here `print` runs before any call, so A comes first.' },
        ],
        answer: 0,
        explain: 'A prints, then the call for B runs in full, and D comes with it. Only then does C get its turn.',
        hints: ['Which line runs first in `walk(root)`?', 'Does the call for B finish before the call for C starts?'],
      },
      { t: 'words', items: [
        { word: 'preorder', say: 'PREE-order', means: 'Visit a node, then its left side, then its right side.' },
        { word: 'inorder', means: 'Visit the left side, then the node, then the right side.' },
        { word: 'postorder', means: 'Visit the left side, then the right side, then the node.' },
      ] },
      { t: 'big', text: 'All 3 walks take the same route. Only the moment of the visit moves.' },
      { t: 'viz', name: 'm18-traverse', params: { order: 'pre', tree: 'A, B, C, D, E' }, caption: 'Predict each visit. The numbers under the nodes keep count. Then type your own tree, with - for a gap.' },
      { t: 'viz', name: 'm18-traverse', params: { order: 'in', tree: 'A, B, C, D, E' }, caption: 'Same tree, same route. Now each visit waits for the left side.' },
      { t: 'viz', name: 'm18-traverse', params: { order: 'post', tree: 'A, B, C, D, E' }, caption: 'Now each visit waits for both sides. So where does the root land?' },
      { t: 'table', caption: 'One tree, 3 walks', head: ['Walk', 'Visit order', 'The root comes', 'Good for'], rows: [
        ['[[Preorder|preorder]]', '`A B D E C`', 'first', 'Copying a tree, or listing folders from the top'],
        ['[[Inorder|inorder]]', '`D B E A C`', 'between its sides', 'Sorted output, as lesson 18.5 will show'],
        ['[[Postorder|postorder]]', '`D E B C A`', 'last', 'Adding up folder sizes, or deleting a tree'],
      ] },
      { t: 'code', caption: 'This is preorder. Move the `seen.append` line between the 2 calls, and guess the output. Then move it to the end.',
        output: 'A B D E C',
        code: withNode(py`
          def walk(node, seen):
              if node is None:
                  return
              seen.append(node.value)
              walk(node.left, seen)
              walk(node.right, seen)
        `, FIVE, py`
          seen = []
          walk(root, seen)
          print(" ".join(seen))
        `),
      },
      { t: 'tip', title: 'A finger trick for doing it by hand', text: 'Draw a line around the tree, starting left of the root. Preorder marks a node as you pass its left side. Inorder marks it as you pass under it. Postorder marks it as you pass its right side.' },
      { t: 'q', id: 'predict-post', type: 'predict', level: 2,
        q: 'Now the visit comes last. What will the screen show?',
        code: withNode(py`
          def walk(node):
              if node is None:
                  return
              walk(node.left)
              walk(node.right)
              print(node.value)

          root = TreeNode("A")
          root.left = TreeNode("B")
          root.right = TreeNode("C")
          root.left.left = TreeNode("D")
          walk(root)
        `),
        options: [
          { text: 'A\nC\nB\nD', why: 'That thinks the last line runs first and reverses the walk. It runs last, after both sides finish.' },
          'D\nB\nC\nA',
          { text: 'D\nB\nA\nC', why: 'That is inorder. In this code, A waits until C has finished as well.' },
        ],
        answer: 1,
        explain: 'A node prints only when both its sides are done. So D goes first, and the root goes last.',
        hints: ['Which node has nothing to wait for?', 'Does A print before or after C?'],
      },
      { t: 'q', id: 'order-inorder', type: 'order', level: 2,
        q: 'Put the lines in order, to make an inorder walk.',
        lines: [
          'def inorder(node):',
          '    if node is None:',
          '        return',
          '    inorder(node.left)',
          '    print(node.value)',
          '    inorder(node.right)',
        ],
        extra: ['    inorder(node)'],
        explain: 'The print line sits between the 2 calls. The extra line never gets smaller, so it would hit the recursion limit.',
        hints: ['The check for None comes first.', 'Inorder means left, node, right.'],
      },
      { t: 'q', id: 'count-visits', type: 'mcq', level: 2,
        q: 'Count by hand. The tree in the picture has 5 nodes. How many visits does a walk make?',
        options: [
          '5',
          { text: '3', why: 'That is its height. A walk visits every node, not one per level.' },
          { text: '10', why: 'A walk passes some nodes more than once, but it visits each one only once.' },
        ],
        answer: 0,
        explain: 'You counted 1 to 5 under the nodes. One node gets one visit.',
        hints: ['Look at the numbers under the nodes.'],
      },
      { t: 'code', caption: 'Each None also takes a call, which returns at once. Add a node, and guess both counts first.',
        output: 'visits: 5\ncalls: 11',
        code: withNode(py`
          counts = {"visits": 0, "calls": 0}

          def walk(node):
              counts["calls"] = counts["calls"] + 1
              if node is None:
                  return
              counts["visits"] = counts["visits"] + 1
              walk(node.left)
              walk(node.right)
        `, FIVE, py`
          walk(root)
          print("visits:", counts["visits"])
          print("calls:", counts["calls"])
        `),
      },
      { t: 'cost', title: 'How much does a walk cost?', items: [
        { op: 'Time for a walk of n nodes', cost: 'O(n)', why: 'You counted 5 visits for 5 nodes. The quick None calls only add about n more.' },
        { op: 'Memory for the pile of calls', cost: 'O(height)', why: 'The pile holds one [[frame]] per level. A tree shaped like a line makes that n.' },
      ] },
      { t: 'trap',
        think: 'inorder always gives the items in sorted order.',
        real: 'Look at the table: `D B E A C` is not sorted. Inorder sorts only in a special kind of tree, which you meet in lesson 18.5.',
      },
      { t: 'tip', title: 'How to recognize each walk', text: 'Does a parent need to act before its children, like copying? Think preorder. Do children need to answer first, like a folder total? Think postorder. Clue words for all 3 walks are "depth" and "all paths".' },
    ],
    recap: [
      'You can write all 3 visit orders by hand.',
      'You can move one line to change the walk.',
      'You can say why a walk costs O(n).',
    ],
    practice: [
      { id: 'match-orders', type: 'match', level: 1,
        q: 'Match each walk to its order.',
        pairs: [
          ['[[preorder]]', 'node, left side, right side'],
          ['[[inorder]]', 'left side, node, right side'],
          ['[[postorder]]', 'left side, right side, node'],
        ],
        explain: 'The word tells you when the node comes: pre means before, and post means after.',
        hints: ['"Pre" means before. Before what?'],
      },
      { id: 'which-walk', type: 'mcq', level: 2,
        q: 'You need the total size of a folder. Each folder needs the totals of the folders inside it first. Which walk fits?',
        options: [
          { text: 'Preorder', why: 'Preorder acts on the parent first. The parent does not know its total yet.' },
          { text: 'Inorder', why: 'Inorder acts between the 2 sides. So the parent would not have the right side yet.' },
          'Postorder',
        ],
        answer: 2,
        explain: 'Postorder finishes both sides before the node. So each folder already has what it needs.',
        hints: ['Must the children or the parent go first?'],
      },
      { id: 'type-inorder', type: 'predict', level: 2,
        q: 'What will the screen show? Type it, with one letter per line.',
        code: withNode(py`
          def walk(node):
              if node is None:
                  return
              walk(node.left)
              print(node.value)
              walk(node.right)

          root = TreeNode("P")
          root.left = TreeNode("Q")
          root.right = TreeNode("R")
          root.left.right = TreeNode("S")
          walk(root)
        `),
        answer: 'Q\nS\nP\nR',
        why: 'Q has no left child, so Q prints at once. Then its right child S prints, and only then the root.',
        explain: 'The whole left side of P comes first: Q, then S. Then P prints, and R comes last.',
        hints: ['Does Q have a left child?', 'S is on the left side of P.'],
      },
      { id: 'fix-base', type: 'fix', level: 2,
        q: 'This walk stops with an AttributeError. It has no [[base case]]. Fix it.',
        code: withNode(py`
          def preorder(node, seen):
              seen.append(node.value)
              preorder(node.left, seen)
              preorder(node.right, seen)

          def run(node):
              seen = []
              preorder(node, seen)
              return seen

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
        `),
        answer: withNode(py`
          def preorder(node, seen):
              if node is None:
                  return
              seen.append(node.value)
              preorder(node.left, seen)
              preorder(node.right, seen)

          def run(node):
              seen = []
              preorder(node, seen)
              return seen

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
        `),
        tests: [
          { label: 'A tree of 3 gives 1, 2, 3', call: 'run(tree)', want: '[1, 2, 3]' },
          { label: 'An empty tree gives an empty list', call: 'run(None)', want: '[]' },
        ],
        explain: 'Each leaf calls the walk with None. The check stops that call before it reads `.value`.',
        hints: ['What is `node` when a walk steps past a leaf?', 'Put `if node is None: return` at the top.'],
      },
      { id: 'write-postorder', type: 'write', level: 2,
        q: 'Write `postorder(node)`. It returns a list of values in postorder. An empty tree gives `[]`.',
        starter: withNode(py`
          def postorder(node):
              # Your code here.
              return None

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
        `),
        answer: withNode(py`
          def postorder(node):
              if node is None:
                  return []
              return postorder(node.left) + postorder(node.right) + [node.value]

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
        `),
        tests: [
          { label: 'The 4-node tree', call: 'postorder(tree)', want: '[4, 2, 3, 1]' },
          { label: 'A single leaf', call: 'postorder(tree.right)', want: '[3]' },
          { label: 'An empty tree', call: 'postorder(None)', want: '[]' },
        ],
        explain: 'Each call joins the left list and the right list, then adds its own value. Joining makes copies, so this costs more than O(n) on a tall tree.',
        hints: ['What should None return?', 'Lists join with `+`.', 'Your own value goes last, as `[node.value]`.'],
      },
      { id: 'write-leaves', type: 'write', level: 3,
        q: 'Stretch: write `leaves(node)`. It returns a list of only the leaf values, from left to right.',
        starter: withNode(py`
          def leaves(node):
              # Your code here.
              return None

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.right = TreeNode(4)
          tree.right.left = TreeNode(5)
          tree.right.right = TreeNode(6)
        `),
        answer: withNode(py`
          def leaves(node):
              if node is None:
                  return []
              if node.left is None and node.right is None:
                  return [node.value]
              return leaves(node.left) + leaves(node.right)

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.right = TreeNode(4)
          tree.right.left = TreeNode(5)
          tree.right.right = TreeNode(6)
        `),
        tests: [
          { label: 'The whole tree', call: 'leaves(tree)', want: '[4, 5, 6]' },
          { label: 'Starting from a leaf', call: 'leaves(tree.left.right)', want: '[4]' },
          { label: 'An empty tree', call: 'leaves(None)', want: '[]' },
        ],
        explain: 'None gives nothing, and a leaf gives itself. Any other node hands back what its 2 sides found.',
        hints: ['You need 3 cases.', 'The second case is a node with no children.', 'The last case joins the 2 lists.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 18.3 */
  Course.lesson('m18-trees', {
    id: '18-3-level-order',
    num: '18.3',
    title: 'Level order: visit a tree in rings',
    goal: 'You can visit a tree level by level with a deque, and choose wide or deep.',
    mins: 14,
    steps: [
      { t: 'h', text: 'How do you visit the nearest nodes first?' },
      { t: 'p', text: 'The 3 walks in lesson 18.2 all dive deep first. Some jobs need the nodes near the root first.' },
      { t: 'analogy', title: 'Picture ripples in a pond', text: 'Drop a stone in a pond. Rings spread out, and the nearest ring comes first. The root is the stone, and each ring is a level. Real ripples spread all at once. Code visits one node at a time, from left to right.' },
      { t: 'q', id: 'spark-rings', type: 'mcq', level: 1,
        q: 'A is the root. B and C are its children. D, E, F and G are below them. Which order goes ring by ring?',
        options: [
          { text: 'A B D E C F G', why: 'That is preorder. It goes down to D before it looks at C, which is nearer the root.' },
          { text: 'D B E A F C G', why: 'That is inorder. It starts at the bottom, far from the root.' },
          'A B C D E F G',
        ],
        answer: 2,
        explain: 'A is level 1. B and C are level 2. Then D, E, F and G make level 3.',
        hints: ['Which nodes are nearest the root?'],
      },
      { t: 'words', items: [
        { word: 'level order', means: 'Visit the root, then level 2, then level 3, each from left to right.' },
        { word: 'BFS', say: 'B F S', means: 'Explore by layers, nearest first. It is short for breadth-first search.' },
        { word: 'DFS', say: 'D F S', means: 'Explore by going deep first, then coming back. It is short for depth-first search.' },
      ] },
      { t: 'p', text: 'Who goes next? The nodes must wait their turn, in the order they were found. That is a [[queue]], so use the [[deque]] from lesson 15.2. We call it `line` here too.' },
      { t: 'big', text: 'A node joins the line when its parent leaves. So nearer nodes always leave first.' },
      { t: 'steps', title: 'Level order in 3 moves', items: [
        { label: 'Start the line', text: 'Only the root waits at first. Skip this if the tree is empty.', code: 'line.append(root)' },
        { label: 'Serve the front', text: '`popleft` takes the node that has waited longest. Visit it.', code: 'node = line.popleft()\nprint(node.value)' },
        { label: 'Add its children', text: 'They join at the back, left child first. Repeat until the line is empty.', code: 'line.append(node.left)\nline.append(node.right)' },
      ] },
      { t: 'viz', name: 'm18-bfs', caption: 'Guess who leaves each time. Each box drops straight down, because first in is first out. Then try one node, an empty tree, and a tree with gaps.' },
      { t: 'code', caption: 'Each node has `is not None` checks, so None never joins the line. Add a child under C, and guess where it prints.',
        output: 'A\nB\nC\nD\nE',
        code: 'from collections import deque\n\n' + withNode(py`
          def level_order(root):
              line = deque()
              if root is not None:
                  line.append(root)
              while len(line) > 0:
                  node = line.popleft()
                  print(node.value)
                  if node.left is not None:
                      line.append(node.left)
                  if node.right is not None:
                      line.append(node.right)
        `, FIVE, 'level_order(root)'),
      },
      { t: 'q', id: 'trace-line', type: 'trace', level: 2,
        q: 'The tree is `A, B, C, D, E`, where D and E hang under B. Fill in who leaves, and who waits after the children join. Write `none` for an empty line.',
        code: py`
          while len(line) > 0:
              node = line.popleft()
              if node.left is not None:
                  line.append(node.left)
              if node.right is not None:
                  line.append(node.right)
        `,
        head: ['leaves', 'line after'],
        rows: [['A', 'BC'], ['B', 'CDE'], ['C', 'DE'], ['D', 'E'], ['E', 'none']],
        given: 1,
        verify: 'from collections import deque\n\n' + withNode(FIVE, py`
          line = deque([root])
          while len(line) > 0:
              node = line.popleft()
              if node.left is not None:
                  line.append(node.left)
              if node.right is not None:
                  line.append(node.right)
              print(node.value, "".join(n.value for n in line) or "none")
        `),
        explain: 'C leaves before D and E, because C joined first. It has no children, so nobody joins then.',
        hints: ['When B leaves, D and E join behind C.', 'Which node waited longest?'],
      },

      { t: 'h', text: 'What if you take from the other end?' },
      { t: 'q', id: 'pop-guess', type: 'predict', level: 2,
        q: 'Only one word changes: `pop` in place of `popleft`. What will the screen show?',
        code: 'from collections import deque\n\n' + withNode(FIVE, py`
          line = deque()
          line.append(root)
          while len(line) > 0:
              node = line.pop()
              print(node.value)
              if node.left is not None:
                  line.append(node.left)
              if node.right is not None:
                  line.append(node.right)
        `),
        options: [
          { text: 'A\nB\nC\nD\nE', why: 'That is the order for `popleft`. `pop` takes the newest item, not the oldest.' },
          'A\nC\nB\nE\nD',
          { text: 'E\nD\nC\nB\nA', why: 'That thinks the whole tree joins first. Children join only when their parent leaves.' },
        ],
        answer: 1,
        explain: 'After A leaves, C is the newest, so it leaves next. Then B leaves, and E is the newest.',
        hints: ['After A leaves, the line holds B and C. Which is newest?'],
      },
      { t: 'viz', name: 'm18-pile-walk', params: { tree: 'A, B, C, D, E' }, caption: 'Compare this with the last picture. The boxes no longer drop straight down. The tree is walked deep first, on the right side.' },
      { t: 'table', caption: 'The tool sets the walk', head: ['Tool', 'It takes', 'So the walk'], rows: [
        ['A [[queue]], with `popleft`', 'The oldest', 'Goes wide: [[BFS]]'],
        ['A [[stack]], with `pop`', 'The newest', 'Goes deep: [[DFS]]'],
        ['[[Recursion|recursion]]', 'The newest call', 'Goes deep: [[DFS]]. The [[call stack]] is its pile.'],
      ] },

      { t: 'h', text: 'How do you keep the levels apart?' },
      { t: 'p', text: 'Some jobs need each level as its own group. When a level starts, the line holds that whole level and nobody else. So read its length first, and serve that many.' },
      { t: 'code', caption: 'The line `size = len(line)` is the key. `size` stays fixed, even as children join. Run it, then try an empty tree with `levels(None)`.',
        output: "[['A'], ['B', 'C'], ['D', 'E']]",
        code: 'from collections import deque\n\n' + withNode(py`
          def levels(root):
              answer = []
              line = deque()
              if root is not None:
                  line.append(root)
              while len(line) > 0:
                  size = len(line)
                  row = []
                  for i in range(size):
                      node = line.popleft()
                      row.append(node.value)
                      if node.left is not None:
                          line.append(node.left)
                      if node.right is not None:
                          line.append(node.right)
                  answer.append(row)
              return answer
        `, FIVE, 'print(levels(root))'),
      },
      { t: 'q', id: 'count-widest', type: 'mcq', level: 2,
        q: 'Count by hand. Look at "most so far" in the first picture, with 7 nodes. What is the most that wait in the line at once?',
        options: [
          { text: '2', why: 'That is only level 2. The line gets longer as level 3 joins.' },
          '4',
          { text: '7', why: 'That thinks all the nodes wait together. A and B have left by the time F and G join.' },
        ],
        answer: 1,
        explain: 'When C has left, the line holds D, E, F and G. That is the widest level.',
        hints: ['Which level is the widest?'],
      },
      { t: 'cost', title: 'How much does level order cost?', items: [
        { op: 'Time for n nodes', cost: 'O(n)', why: 'Each node joins once and leaves once, and `popleft` is O(1).' },
        { op: 'Memory for the line', cost: 'O(widest level)', why: 'You saw 4 of the 7 waiting. In a full tree, the last level holds about half the nodes.' },
        { op: 'With a list and `pop(0)`', cost: 'O(n) per pop', why: 'Every item slides over. Use a [[deque]] instead.' },
      ] },
      { t: 'trap',
        think: 'BFS and DFS use the same tool, so either end will do.',
        real: 'The end decides the whole walk. Take the oldest, and you go wide. Take the newest, and you go deep.',
      },
      { t: 'table', caption: 'How to recognize it', head: ['The problem says', 'Think about'], rows: [
        ['"level by level", "nearest first", "minimum moves"', '[[BFS]] with a deque'],
        ['"depth", "all paths", "every path to a leaf"', '[[DFS]] with recursion'],
      ] },
    ],
    recap: [
      'You can visit a tree level by level.',
      'You can keep each level as its own group.',
      'You can say which tool makes which walk.',
    ],
    practice: [
      { id: 'match-bfs', type: 'match', level: 1,
        q: 'Match each word to what it means.',
        pairs: [
          ['[[BFS]]', 'Explore nearest first, using a queue'],
          ['[[DFS]]', 'Go deep first, using a stack or recursion'],
          ['[[level order]]', 'BFS on a tree, from left to right'],
        ],
        explain: 'BFS goes wide and DFS goes deep. Level order is what BFS looks like on a tree.',
        hints: ['Which one has a ripple in it?'],
      },
      { id: 'pick-tool', type: 'mcq', level: 2,
        q: 'You want the node closest to the root that has no children. Which fits best?',
        options: [
          'BFS, and stop at the first leaf',
          { text: 'DFS, and stop at the first leaf', why: 'DFS dives deep first, so its first leaf can be far from the root.' },
          { text: 'Sort the nodes, then look at the first one', why: 'Sorting orders values, not distance from the root.' },
        ],
        answer: 0,
        explain: 'BFS visits nearer nodes first. So the first leaf it meets is one of the closest.',
        hints: ['Which walk reaches the near nodes first?'],
      },
      { id: 'type-order', type: 'predict', level: 2,
        q: 'What will the screen show? Type it, with one number per line.',
        code: 'from collections import deque\n\n' + withNode(py`
          root = TreeNode(1)
          root.right = TreeNode(2)
          root.right.left = TreeNode(3)
          root.right.right = TreeNode(4)

          line = deque([root])
          while len(line) > 0:
              node = line.popleft()
              print(node.value)
              if node.left is not None:
                  line.append(node.left)
              if node.right is not None:
                  line.append(node.right)
        `),
        answer: '1\n2\n3\n4',
        why: 'Each level comes in turn, even though 1 has no left child.',
        explain: 'Level 1 is 1, level 2 is 2, and level 3 is 3 and 4. A missing child never joins the line.',
        hints: ['Write out the levels first.'],
      },
      { id: 'fix-empty', type: 'fix', level: 2,
        q: 'This works until the tree is empty. Then it stops with an AttributeError. Fix it.',
        code: 'from collections import deque\n\n' + withNode(py`
          def values(root):
              out = []
              line = deque()
              line.append(root)
              while len(line) > 0:
                  node = line.popleft()
                  out.append(node.value)
                  if node.left is not None:
                      line.append(node.left)
                  if node.right is not None:
                      line.append(node.right)
              return out

          small = TreeNode(1)
          small.left = TreeNode(2)
        `),
        answer: 'from collections import deque\n\n' + withNode(py`
          def values(root):
              out = []
              line = deque()
              if root is not None:
                  line.append(root)
              while len(line) > 0:
                  node = line.popleft()
                  out.append(node.value)
                  if node.left is not None:
                      line.append(node.left)
                  if node.right is not None:
                      line.append(node.right)
              return out

          small = TreeNode(1)
          small.left = TreeNode(2)
        `),
        tests: [
          { label: 'A small tree', call: 'values(small)', want: '[1, 2]' },
          { label: 'An empty tree', call: 'values(None)', want: '[]' },
        ],
        explain: 'With an empty tree, None joined the line. Check first, so the line can start empty.',
        hints: ['What joins the line when `root` is None?', 'Only add the root if it is not None.'],
      },
      { id: 'write-widest', type: 'write', level: 2,
        q: 'Write `widest(root)`. It returns how many nodes the widest level has. An empty tree gives 0.',
        starter: 'from collections import deque\n\n' + withNode(py`
          def widest(root):
              # Your code here.
              return None

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
          tree.right.right = TreeNode(5)
          tree.left.left.left = TreeNode(6)
        `),
        answer: 'from collections import deque\n\n' + withNode(py`
          def widest(root):
              most = 0
              line = deque()
              if root is not None:
                  line.append(root)
              while len(line) > 0:
                  size = len(line)
                  most = max(most, size)
                  for i in range(size):
                      node = line.popleft()
                      if node.left is not None:
                          line.append(node.left)
                      if node.right is not None:
                          line.append(node.right)
              return most

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
          tree.right.right = TreeNode(5)
          tree.left.left.left = TreeNode(6)
        `),
        tests: [
          { label: 'Levels of 1, 2, 2, 1', call: 'widest(tree)', want: '2' },
          { label: 'One node', call: 'widest(tree.right.right)', want: '1' },
          { label: 'An empty tree', call: 'widest(None)', want: '0' },
        ],
        explain: 'Start from the `levels` code. At the top of each level, the line length is that level\'s size.',
        hints: ['Start from the `levels` code.', 'Keep the biggest `size` you see.', '`max(most, size)` keeps the bigger one.'],
      },
      { id: 'write-right-view', type: 'write', level: 3,
        q: 'Stretch: stand on the right of a tree and look left. You see the last node of each level. Write `right_view(root)`, which returns those values as a list.',
        starter: 'from collections import deque\n\n' + withNode(py`
          def right_view(root):
              # Your code here.
              return None

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.right = TreeNode(5)
        `),
        answer: 'from collections import deque\n\n' + withNode(py`
          def right_view(root):
              seen = []
              line = deque()
              if root is not None:
                  line.append(root)
              while len(line) > 0:
                  size = len(line)
                  for i in range(size):
                      node = line.popleft()
                      if i == size - 1:
                          seen.append(node.value)
                      if node.left is not None:
                          line.append(node.left)
                      if node.right is not None:
                          line.append(node.right)
              return seen

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.right = TreeNode(5)
        `),
        tests: [
          { label: 'The last node of each level', call: 'right_view(tree)', want: '[1, 3, 5]' },
          { label: 'One node', call: 'right_view(tree.right)', want: '[3]' },
          { label: 'An empty tree', call: 'right_view(None)', want: '[]' },
        ],
        explain: 'The 5 hangs on the left side, but nothing stands to its right on that level. So a walk that only goes right would miss it.',
        hints: ['Use the `levels` shape.', 'The last node of a level has `i == size - 1`.', 'Children still join for every node.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 18.4 */
  Course.lesson('m18-trees', {
    id: '18-4-tree-jobs',
    num: '18.4',
    title: 'Tree jobs: ask left, ask right, join the answers',
    goal: 'You can solve a tree job by asking both sides and joining their answers.',
    mins: 15,
    steps: [
      { t: 'h', text: 'How many nodes are in this tree?' },
      { t: 'p', text: 'The left child holds a whole tree of its own, and so does the right child. So a big tree job holds 2 smaller copies of the same job. Lesson 16.1 showed you how to handle that.' },
      { t: 'words', items: [
        { word: 'subtree', say: 'SUB-tree', means: 'A node and everything below it. It is a tree too.' },
      ] },
      { t: 'analogy', title: 'Back to the family tree', text: 'A grandparent asks each child how big their part of the family is. Each child asks their own children first. Then each person adds 1 for themselves. A real person may not answer. Here every call answers, and None says 0.' },
      { t: 'q', id: 'spark-count', type: 'predict', level: 2,
        q: 'What will the screen show?',
        code: withNode(py`
          def count(node):
              if node is None:
                  return 0
              left = count(node.left)
              right = count(node.right)
              return 1 + left + right

          root = TreeNode("A")
          root.left = TreeNode("B")
          root.right = TreeNode("C")
          root.left.left = TreeNode("D")
          print(count(root))
        `),
        options: [
          '4',
          { text: '3', why: 'That leaves out the root. The last line adds 1 for the node that is answering.' },
          { text: '2', why: 'That only sees the 2 children of the root. Each child also counts what is below it.' },
        ],
        answer: 0,
        explain: 'D says 1, so B says 2. C says 1. Then A says 1 + 2 + 1, which is 4.',
        hints: ['What does D return?', 'Work from the bottom up.'],
      },
      { t: 'steps', title: 'Any tree job in 3 questions', items: [
        { label: 'What is the smallest job?', text: 'The [[base case]] is usually None. An empty tree has 0 nodes.', code: 'if node is None:\n    return 0' },
        { label: 'What are the smaller copies?', text: 'One [[subtree]] on each side. Trust each call to give the right answer.', code: 'left = count(node.left)\nright = count(node.right)' },
        { label: 'How do you join the answers?', text: 'This line changes from job to job. Here, add both, and add 1 for yourself.', code: 'return 1 + left + right' },
      ] },
      { t: 'viz', name: 'm18-count', caption: 'Say each answer before it travels up. Then try an empty tree, one node, and your own shape.' },
      { t: 'big', text: 'Ask the left [[subtree]]. Ask the right [[subtree]]. Join the answers. Only the join line changes.' },
      { t: 'q', id: 'fill-sum', type: 'fill', level: 2,
        q: 'Fill the gaps. `total` adds up every value in the tree.',
        code: withNode(py`
          def total(node):
              if node is None:
                  return ____
              left = total(node.left)
              right = total(node.right)
              return node.value + ____ + right

          root = TreeNode(5)
          root.left = TreeNode(2)
          root.right = TreeNode(3)
          print(total(root))
        `),
        blanks: ['0', 'left'],
        output: '10',
        explain: 'An empty tree adds up to 0. Each node then adds its own value to both answers.',
        hints: ['What is the total of nothing?', 'Which answer is still missing from the last line?'],
      },

      { t: 'h', text: 'How tall is it?' },
      { t: 'p', text: 'Only the join line changes. Two sides sit next to each other, so their levels do not add up. Take the taller side, and add 1 for your own level.' },
      { t: 'viz', name: 'm18-height', caption: 'Each node says how tall its part is. Then try a bushy tree of 7, and a line. Which has more height?' },
      { t: 'q', id: 'height-visits', type: 'mcq', level: 2,
        q: 'Does `height` need to visit every node?',
        options: [
          'Yes. A node cannot know which side is taller until both answer',
          { text: 'No. It follows only the tallest path', why: 'It has no way to know that path in advance. It must ask both sides to find it.' },
          { text: 'No. It only looks at the leaves', why: 'A leaf answers 1, but its parent must still join the answers. Every node does that.' },
        ],
        answer: 0,
        explain: 'In the picture, every node answered once. So finding the height takes as many calls as counting.',
        hints: ['Look at the labels in the picture. Did any node stay silent?'],
      },
      { t: 'cost', title: 'How much do these jobs cost?', items: [
        { op: '`count` and `height`', cost: 'O(n)', why: 'You saw each node answer once. Twice the nodes means twice the calls.' },
        { op: 'Memory for the pile', cost: 'O(height)', why: 'The pile holds one [[frame]] per level at most.' },
      ] },

      { t: 'h', text: 'What if the join line changes the tree?' },
      { t: 'p', text: 'A job can also change the tree as it goes. A **mirror** swaps left and right at every node. Each swap moves a whole [[subtree]], not only one node.' },
      { t: 'viz', name: 'm18-mirror', caption: 'Say what lands on the left before each swap. Try a tree where one side is missing.' },
      { t: 'code', caption: 'The swap line changes both arrows at once, as you swapped list items in module 9. Mirror it twice, and guess the result.',
        output: '1 3 2',
        code: withNode(py`
          def mirror(node):
              if node is None:
                  return
              node.left, node.right = node.right, node.left
              mirror(node.left)
              mirror(node.right)

          root = TreeNode(1)
          root.left = TreeNode(2)
          root.right = TreeNode(3)
          mirror(root)
          print(root.value, root.left.value, root.right.value)
        `),
      },
      { t: 'trap',
        think: 'I can swap with 2 lines: `node.left = node.right`, then `node.right = node.left`.',
        real: 'The first line loses the old left [[subtree]]. Then both arrows point at the right side. Swap them on one line instead.',
        code: 'node.left = node.right\nnode.right = node.left    # same node as the line above!',
      },

      { t: 'h', text: 'Are 2 trees the same?' },
      { t: 'p', text: 'Now the job takes 2 trees, so you walk them side by side. Each call compares one spot in each tree. There are 3 ways to get a quick answer.' },
      { t: 'viz', name: 'm18-same', caption: 'The start has the same values in a different shape. Then type 2 matching trees, or make one empty.' },
      { t: 'code', caption: 'Check the None cases first, so reading `.value` is safe. Change a value, and guess the answer.',
        output: 'True\nFalse',
        code: withNode(py`
          def same(a, b):
              if a is None and b is None:
                  return True
              if a is None or b is None:
                  return False
              if a.value != b.value:
                  return False
              left_ok = same(a.left, b.left)
              return left_ok and same(a.right, b.right)

          x = TreeNode(1)
          x.left = TreeNode(2)
          y = TreeNode(1)
          y.left = TreeNode(2)
          z = TreeNode(1)
          z.right = TreeNode(2)
          print(same(x, y))
          print(same(x, z))
        `),
      },
      { t: 'q', id: 'same-shape', type: 'predict', level: 2,
        q: 'Both trees hold the same values, and have the same preorder. Are they the same tree? What will the screen show?',
        code: withNode(py`
          def same(a, b):
              if a is None and b is None:
                  return True
              if a is None or b is None:
                  return False
              if a.value != b.value:
                  return False
              left_ok = same(a.left, b.left)
              return left_ok and same(a.right, b.right)

          p = TreeNode(1)
          p.left = TreeNode(2)
          q = TreeNode(1)
          q.right = TreeNode(2)
          print(same(p, q))
        `),
        options: [
          { text: 'True', why: 'That compares only the values. A tree is its values and its shape too.' },
          'False',
          { text: 'An error', why: 'The None checks come first. So `.value` is only read from 2 real nodes.' },
        ],
        answer: 1,
        explain: 'The 2 is on the left in one tree and on the right in the other. So the second `if` returns False.',
        hints: ['Compare `p.left` with `q.left`.'],
      },
      { t: 'cost', title: 'How much do these cost?', items: [
        { op: '`mirror`', cost: 'O(n)', why: 'Every node swaps once.' },
        { op: '`same`', cost: 'O(n) at most', why: 'The picture stopped early at the first difference. Two matching trees need every check.' },
      ] },
      { t: 'tip', title: 'How to recognize it', text: 'Clue words are "depth", "how many", "total", "mirror" and "same tree". Ask yourself: if I had the answers for both sides, could I work out mine? If so, this pattern fits.' },
    ],
    recap: [
      'You can answer the 3 questions for a tree job.',
      'You can write count, height and mirror.',
      'You can compare 2 trees, shape and values.',
    ],
    practice: [
      { id: 'match-join', type: 'match', level: 1,
        q: 'Match each job to its join line.',
        pairs: [
          ['Count the nodes', '`1 + left + right`'],
          ['Find the height', '`1 + max(left, right)`'],
          ['Add up the values', '`node.value + left + right`'],
        ],
        explain: 'The rest of the function stays the same. Only the join line changes.',
        hints: ['Which job needs only the taller side?'],
      },
      { id: 'mirror-predict', type: 'mcq', level: 2,
        q: 'You mirror a tree, then mirror it again. What do you get?',
        options: [
          'The tree you started with',
          { text: 'A new shape, turned twice as far', why: 'A swap undoes itself. Swapping the same 2 arrows twice puts them back.' },
          { text: 'An empty tree', why: 'Mirror only swaps arrows. It never removes a node.' },
        ],
        answer: 0,
        explain: 'Every node swaps twice. So each arrow ends up back where it began.',
        hints: ['What happens if you swap 2 things, then swap them again?'],
      },
      { id: 'type-height', type: 'predict', level: 2,
        q: 'What will the screen show? Type it.',
        code: withNode(py`
          def height(node):
              if node is None:
                  return 0
              return 1 + max(height(node.left), height(node.right))

          root = TreeNode(1)
          root.left = TreeNode(2)
          root.right = TreeNode(3)
          root.right.right = TreeNode(4)
          root.right.right.left = TreeNode(5)
          print(height(root))
        `),
        answer: '4',
        why: 'The path 1, 3, 4, 5 has 4 levels. The tree has 5 nodes, but height counts levels.',
        explain: 'The tallest path is 1, then 3, then 4, then 5. That is 4 levels.',
        hints: ['Find the longest path from the root down.'],
      },
      { id: 'fix-height', type: 'fix', level: 2,
        q: '`height` gives the wrong answer for a tree with 2 sides. It adds them together. Fix the last line.',
        code: withNode(py`
          def height(node):
              if node is None:
                  return 0
              return 1 + height(node.left) + height(node.right)

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
        `),
        answer: withNode(py`
          def height(node):
              if node is None:
                  return 0
              return 1 + max(height(node.left), height(node.right))

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
        `),
        tests: [
          { label: 'A tree of 3 with 2 levels', call: 'height(tree)', want: '2' },
          { label: 'A single leaf', call: 'height(tree.left)', want: '1' },
          { label: 'An empty tree', call: 'height(None)', want: '0' },
        ],
        explain: 'This code counted nodes. Sides sit next to each other, so only the taller one counts.',
        hints: ['What is this code really counting?', 'Use `max` on the 2 answers.'],
      },
      { id: 'write-count-leaves', type: 'write', level: 2,
        q: 'Write `count_leaves(node)`. It returns how many leaves the tree has.',
        starter: withNode(py`
          def count_leaves(node):
              # Your code here.
              return None

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
        `),
        answer: withNode(py`
          def count_leaves(node):
              if node is None:
                  return 0
              if node.left is None and node.right is None:
                  return 1
              return count_leaves(node.left) + count_leaves(node.right)

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
        `),
        tests: [
          { label: 'This tree has 2 leaves', call: 'count_leaves(tree)', want: '2' },
          { label: 'One node is one leaf', call: 'count_leaves(tree.right)', want: '1' },
          { label: 'An empty tree has none', call: 'count_leaves(None)', want: '0' },
        ],
        explain: 'None gives 0, and a leaf gives 1. Any other node adds what its 2 sides found.',
        hints: ['You need 2 base cases.', 'A node that is not a leaf does not count itself.'],
      },
      { id: 'write-invert', type: 'write', level: 2,
        q: 'Write `mirror(node)` from memory. It swaps left and right at every node, and returns the node. It should return None for an empty tree.',
        starter: withNode(py`
          def mirror(node):
              # Your code here.
              return None

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
          mirror(tree)
        `),
        answer: withNode(py`
          def mirror(node):
              if node is None:
                  return None
              node.left, node.right = node.right, node.left
              mirror(node.left)
              mirror(node.right)
              return node

          tree = TreeNode(1)
          tree.left = TreeNode(2)
          tree.right = TreeNode(3)
          tree.left.left = TreeNode(4)
          mirror(tree)
        `),
        tests: [
          { label: 'The root\'s left is now 3', call: 'tree.left.value', want: '3' },
          { label: 'The root\'s right is now 2', call: 'tree.right.value', want: '2' },
          { label: 'The 4 moved to the far right', call: 'tree.right.right.value', want: '4' },
          { label: 'An empty tree', check: 'mirror(None) is None' },
        ],
        explain: 'Swap the 2 arrows on one line, then do the same for each child. Return the node at the end.',
        hints: ['Check for None first.', 'Write the swap as `a, b = b, a`.', 'Then call `mirror` on both children.'],
      },
      { id: 'write-symmetric', type: 'write', level: 3,
        q: 'Stretch: a tree is symmetric if its left side is the mirror of its right side. Write `is_symmetric(root)`. Use a helper that compares 2 trees, like `same`, but crosses over.',
        starter: withNode(py`
          def is_symmetric(root):
              # Your code here.
              return None

          yes = TreeNode(1)
          yes.left = TreeNode(2)
          yes.right = TreeNode(2)
          yes.left.left = TreeNode(3)
          yes.right.right = TreeNode(3)

          no = TreeNode(1)
          no.left = TreeNode(2)
          no.right = TreeNode(2)
          no.left.left = TreeNode(3)
          no.right.left = TreeNode(3)
        `),
        answer: withNode(py`
          def mirrored(a, b):
              if a is None and b is None:
                  return True
              if a is None or b is None:
                  return False
              if a.value != b.value:
                  return False
              outer = mirrored(a.left, b.right)
              return outer and mirrored(a.right, b.left)

          def is_symmetric(root):
              if root is None:
                  return True
              return mirrored(root.left, root.right)

          yes = TreeNode(1)
          yes.left = TreeNode(2)
          yes.right = TreeNode(2)
          yes.left.left = TreeNode(3)
          yes.right.right = TreeNode(3)

          no = TreeNode(1)
          no.left = TreeNode(2)
          no.right = TreeNode(2)
          no.left.left = TreeNode(3)
          no.right.left = TreeNode(3)
        `),
        tests: [
          { label: 'A true mirror', call: 'is_symmetric(yes)', want: 'True' },
          { label: 'Same values, wrong shape', call: 'is_symmetric(no)', want: 'False' },
          { label: 'An empty tree', call: 'is_symmetric(None)', want: 'True' },
          { label: 'One node', call: 'is_symmetric(yes.left.left)', want: 'True' },
        ],
        explain: 'The left of one side must match the right of the other. So the helper crosses over at each call.',
        hints: ['Copy the shape of `same`.', 'Compare `a.left` with `b.right`.', 'Then compare `a.right` with `b.left`.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 18.5 */
  Course.lesson('m18-trees', {
    id: '18-5-binary-search-tree',
    num: '18.5',
    title: 'Binary search trees: throw away a side',
    goal: 'You can search and insert in a binary search tree, and say what sets its speed.',
    mins: 15,
    steps: [
      { t: 'h', text: 'Can a tree search like binary search?' },
      { t: 'p', text: 'In lesson 10.1, each guess threw away half of the numbers. A tree can do that too, if it keeps a rule about where each number goes.' },
      { t: 'words', items: [
        { word: 'binary search tree', means: 'A binary tree with smaller values on each left side, and bigger values on each right.' },
        { word: 'lopsided', say: 'LOP-side-id', means: 'Much taller on one side than on the other.' },
      ] },
      { t: 'analogy', title: 'Picture 20 Questions', text: 'Each yes or no rules out a big part of the answers. A good player splits the choices near half. Here it stops being true: a tree cannot pick its questions. Its shape comes from the insert order, and a poor shape rules out almost nothing.' },
      { t: 'big', text: 'At every node, the whole left side is smaller, and the whole right side is bigger.' },
      { t: 'q', id: 'rule-deep', type: 'mcq', level: 2,
        q: 'The root holds 5. Its left child holds 3. The right child of that 3 holds 9. Does this follow the rule?',
        options: [
          { text: 'Yes. 9 is bigger than its parent 3', why: 'That checks only the parent. The rule covers the whole side, and 9 sits on the left side of 5.' },
          'No. 9 is on the left side of 5, but it is bigger than 5',
          { text: 'No. A left child must always be a leaf', why: 'A left child can have its own children. The problem here is the size of 9.' },
        ],
        answer: 1,
        explain: 'Everything on the left of 5 must be smaller than 5. The rule holds for every node, not only for a parent and child.',
        hints: ['Which side of the root is 9 on?'],
      },
      { t: 'viz', name: 'm18-bst-search', caption: 'Choose each move before it happens. Then change the target. Try one that is not there, like 45, and try an empty tree.' },
      { t: 'code', caption: 'A loop can do the walking, since the search only ever takes one path. Try a number that is not in the tree.',
        output: 'True\nFalse',
        code: withBst(py`
          def find(node, target):
              while node is not None:
                  if target == node.value:
                      return True
                  if target < node.value:
                      node = node.left
                  else:
                      node = node.right
              return False

          root = build([50, 30, 70, 20, 40])
          print(find(root, 40))
          print(find(root, 45))
        `),
      },
      { t: 'q', id: 'trace-search', type: 'trace', level: 2,
        q: 'The tree comes from inserting 50, 30, 70, 20, 40. Search for 45. Fill in each node you land on, and the way you go next.',
        code: py`
          while node is not None:
              if target == node.value:
                  return True
              if target < node.value:
                  node = node.left
              else:
                  node = node.right
          return False
        `,
        head: ['node', 'go'],
        rows: [['50', 'left'], ['30', 'right'], ['40', 'right']],
        given: 1,
        verify: withBst(py`
          node = build([50, 30, 70, 20, 40])
          target = 45
          while node is not None:
              if target < node.value:
                  print(node.value, "left")
                  node = node.left
              else:
                  print(node.value, "right")
                  node = node.right
        `),
        explain: '45 is smaller than 50, bigger than 30, and bigger than 40. Then the arrow is None, so 45 is not there.',
        hints: ['Is 45 smaller than 50?', 'After 40, the right arrow is None.'],
      },

      { t: 'h', text: 'Where does a new number go?' },
      { t: 'p', text: 'Search for it. The search ends at a None arrow, and that is its spot. If the number is already there, this tree leaves it out.' },
      { t: 'viz', name: 'm18-bst-insert', caption: 'Choose each move. Then type your own order, or a repeat like 4, 4.' },
      { t: 'code', caption: 'Each call returns the top of its [[subtree]], so the parent can point its arrow at it. Change the order, and guess the inorder.',
        output: '1 2 3 4 6',
        code: withNode(INSERT, py`
          def inorder(node, seen):
              if node is None:
                  return
              inorder(node.left, seen)
              seen.append(str(node.value))
              inorder(node.right, seen)

          root = None
          for v in [4, 2, 6, 1, 3]:
              root = insert(root, v)

          seen = []
          inorder(root, seen)
          print(" ".join(seen))
        `),
      },
      { t: 'p', text: 'Did you see that the output is sorted? Inorder takes the smaller side, then the node, then the bigger side. So a [[binary search tree]] always gives sorted output.' },

      { t: 'h', text: 'What if the numbers arrive in order?' },
      { t: 'q', id: 'guess-line', type: 'mcq', level: 2,
        q: 'Take a guess. You insert 1, then 2, then 3, then 4. What shape do you get?',
        options: [
          { text: 'A neat tree, with 2 on top', why: 'A plain binary search tree never moves its nodes. The first number stays the root.' },
          'A line going right, with 1 on top',
          { text: 'A line going left, with 4 on top', why: 'That thinks the newest number goes on top. New numbers always land at the bottom.' },
        ],
        answer: 1,
        explain: 'Each new number is bigger than all the others. So it walks right, past every node, to the end.',
        hints: ['Where does 1 go? Where does 2 go, compared with 1?'],
      },
      { t: 'viz', name: 'm18-bst-insert', params: { order: '1, 2, 3, 4, 5, 6' }, caption: 'Sorted input. The picture shows 4 levels, then lists what lands too deep. Watch the compares climb. Then try 6, 5, 4, 3, 2, 1, and 4, 2, 5, 1, 3, 6.' },
      { t: 'q', id: 'count-line', type: 'mcq', level: 2,
        q: 'Count by hand. You inserted 1, 2, 3, 4 in that order. How many compares does it take to find 4?',
        options: [
          '4',
          { text: '2', why: 'That is the count for a neat tree, where each answer rules out half. In a line, each answer rules out one node.' },
          { text: '1', why: 'That thinks the search starts at 4. It always starts at the root, which holds 1.' },
        ],
        answer: 0,
        explain: 'It compares with 1, 2, 3 and then 4. Nothing gets ruled out on the left, because the left side is empty.',
        hints: ['Which node does the search start at?'],
      },
      { t: 'code', caption: 'Same 15 numbers, 2 insert orders. The count is steps, not seconds, so it is the same on every run. Search for other numbers.',
        output: 'mixed order: 4\nsorted order: 15',
        code: withBst(py`
          def steps(node, target):
              count = 0
              while node is not None:
                  count = count + 1
                  if target == node.value:
                      return count
                  if target < node.value:
                      node = node.left
                  else:
                      node = node.right
              return count

          mixed = build([8, 4, 12, 2, 6, 10, 14,
                         1, 3, 5, 7, 9, 11, 13, 15])
          line = build(list(range(1, 16)))
          print("mixed order:", steps(mixed, 15))
          print("sorted order:", steps(line, 15))
        `),
      },
      { t: 'cost', title: 'How fast is a binary search tree?', items: [
        { op: 'Search or insert', cost: 'O(height)', why: 'Each compare moves down one level. You counted that on your own trees.' },
        { op: 'When the shape is neat', cost: 'O(log n)', why: 'Each level is about twice as wide, so 1,000 numbers need about 10 levels.' },
        { op: 'When it is a line', cost: 'O(n)', why: 'You counted 15 steps for 15 numbers. Sorted input makes this shape.' },
      ] },
      { t: 'trap',
        think: 'a binary search tree is always O(log n).',
        real: 'Only when it stays neat. A [[lopsided]] tree is a chain with extra steps, so it costs O(n). The bonus lesson 18.6 shows the fix.',
      },
      { t: 'table', caption: 'How to choose', head: ['Tool', 'Find a value', 'Add a value', 'Items in order?'], rows: [
        ['[[dict]] or set', 'O(1) on average', 'O(1) on average', 'Not sorted'],
        ['Sorted list with `bisect`', 'O(log n)', 'O(n), because items slide', 'Yes'],
        ['[[binary search tree]]', 'O(height)', 'O(height)', 'Yes, with inorder'],
      ] },
      { t: 'tip', title: 'How to recognize it', text: 'Do you see "keep in order while adding", or "the next bigger value"? Think of this tree. Do you only need "is it there?" A set is faster. Python has no built-in binary search tree, so you write the class yourself.' },
    ],
    recap: [
      'You can state the rule for the whole of each side.',
      'You can search and insert by hand and in code.',
      'You can show why sorted input makes it O(n).',
    ],
    practice: [
      { id: 'match-cost', type: 'match', level: 1,
        q: 'Match each shape to its search cost.',
        pairs: [
          ['A neat tree of n numbers', 'O(log n)'],
          ['A line of n numbers', 'O(n)'],
          ['Any binary search tree', 'O(height)'],
        ],
        explain: 'Every compare moves down one level. So height sets the cost, and shape sets the height.',
        hints: ['What is the height of a line of n numbers?'],
      },
      { id: 'tree-or-bst', type: 'mcq', level: 1,
        q: 'Every binary search tree is a binary tree. Is every binary tree a binary search tree?',
        options: [
          { text: 'Yes, they are 2 names for one thing', why: 'That mixes them up. A binary tree limits only the number of children, not where values go.' },
          'No. Most binary trees do not keep the rule',
          { text: 'Yes, as long as left is smaller than right', why: 'The rule compares with the node, across each whole side. Two children alone do not settle it.' },
        ],
        answer: 1,
        explain: 'A binary tree can hold values in any place. The rule about sides is what makes it a search tree.',
        hints: ['What extra rule does a binary search tree have?'],
      },
      { id: 'type-compare', type: 'predict', level: 2,
        q: 'What will the screen show? Type it. Draw the tree first.',
        code: withBst(py`
          root = build([6, 2, 9, 7])
          print(root.value)
          print(root.right.left.value)
          print(root.left.left)
        `),
        answer: '6\n7\nNone',
        why: '6 goes in first, so it stays the root. 7 is bigger than 6 and smaller than 9.',
        explain: '7 goes right of 6, then left of 9. The 2 is a leaf, so its left arrow is None.',
        hints: ['Which number is the root?', 'Follow 7 down from the root.'],
      },
      { id: 'fix-lost', type: 'fix', level: 2,
        q: 'Only the first number stays in this tree. Each new node is made, then lost. Fix the 2 lines that drop it.',
        code: withNode(py`
          def insert(node, value):
              if node is None:
                  return TreeNode(value)
              if value < node.value:
                  insert(node.left, value)
              elif value > node.value:
                  insert(node.right, value)
              return node

          root = None
          for v in [5, 2, 8]:
              root = insert(root, v)
        `),
        answer: withNode(py`
          def insert(node, value):
              if node is None:
                  return TreeNode(value)
              if value < node.value:
                  node.left = insert(node.left, value)
              elif value > node.value:
                  node.right = insert(node.right, value)
              return node

          root = None
          for v in [5, 2, 8]:
              root = insert(root, v)
        `),
        tests: [
          { label: 'The root stays 5', call: 'root.value', want: '5' },
          { label: '2 is on the left', check: 'root.left is not None and root.left.value == 2' },
          { label: '8 is on the right', check: 'root.right is not None and root.right.value == 8' },
        ],
        explain: 'The call returns a node, but no arrow points at it. Set `node.left` or `node.right` to what comes back.',
        hints: ['What does `insert` return?', 'Which arrow should point at the new node?'],
      },
      { id: 'write-smallest', type: 'write', level: 2,
        q: 'Write `smallest(node)`. It returns the smallest value in a binary search tree. The tree is not empty. Use the rule, so you visit only one path.',
        starter: withBst(py`
          def smallest(node):
              # Your code here.
              return None

          root = build([50, 30, 70, 20, 40])
          lone = build([9])
        `),
        answer: withBst(py`
          def smallest(node):
              while node.left is not None:
                  node = node.left
              return node.value

          root = build([50, 30, 70, 20, 40])
          lone = build([9])
        `),
        tests: [
          { label: 'The smallest of 5 numbers', call: 'smallest(root)', want: '20' },
          { label: 'One node', call: 'smallest(lone)', want: '9' },
          { label: 'A sorted line starts with its smallest', call: 'smallest(build([1, 2, 3]))', want: '1' },
        ],
        explain: 'Smaller values are always on the left. So the leftmost node holds the smallest value.',
        hints: ['Which side holds smaller values?', 'Keep going left until the arrow is None.'],
      },
      { id: 'fix-validate', type: 'fix', level: 3,
        q: 'Stretch: this `is_bst` checks each node against its children only. It says True for the tree with 9 under 3 under 5. Fix it, so each node must fit a low and high limit.',
        code: withNode(py`
          def is_bst(node):
              if node is None:
                  return True
              if node.left is not None and node.left.value >= node.value:
                  return False
              if node.right is not None and node.right.value <= node.value:
                  return False
              return is_bst(node.left) and is_bst(node.right)

          bad = TreeNode(5)
          bad.left = TreeNode(3)
          bad.left.right = TreeNode(9)

          good = TreeNode(5)
          good.left = TreeNode(3)
          good.left.right = TreeNode(4)
          good.right = TreeNode(8)
        `),
        answer: withNode(py`
          def fits(node, low, high):
              if node is None:
                  return True
              if low is not None and node.value <= low:
                  return False
              if high is not None and node.value >= high:
                  return False
              left_ok = fits(node.left, low, node.value)
              return left_ok and fits(node.right, node.value, high)

          def is_bst(node):
              return fits(node, None, None)

          bad = TreeNode(5)
          bad.left = TreeNode(3)
          bad.left.right = TreeNode(9)

          good = TreeNode(5)
          good.left = TreeNode(3)
          good.left.right = TreeNode(4)
          good.right = TreeNode(8)
        `),
        tests: [
          { label: 'The bad tree is caught', call: 'is_bst(bad)', want: 'False' },
          { label: 'The good tree passes', call: 'is_bst(good)', want: 'True' },
          { label: 'An empty tree passes', call: 'is_bst(None)', want: 'True' },
        ],
        explain: 'Going left, the node becomes the new high limit. Going right, it becomes the new low limit.',
        hints: ['Write a helper with 2 extra values, `low` and `high`.', 'Use None for "no limit yet".', 'Going left, pass `node.value` as `high`.'],
      },
      { id: 'write-lca', type: 'write', level: 3,
        q: 'Stretch: the lowest common ancestor of 2 values is the lowest node with both in its [[subtree]]. Write `meet(node, a, b)`, which returns its value. Both values are in the tree.',
        starter: withBst(py`
          def meet(node, a, b):
              # Your code here.
              return None

          root = build([50, 30, 70, 20, 40, 60, 80])
        `),
        answer: withBst(py`
          def meet(node, a, b):
              while node is not None:
                  if a < node.value and b < node.value:
                      node = node.left
                  elif a > node.value and b > node.value:
                      node = node.right
                  else:
                      return node.value
              return None

          root = build([50, 30, 70, 20, 40, 60, 80])
        `),
        tests: [
          { label: 'Both on the left side of 50', call: 'meet(root, 20, 40)', want: '30' },
          { label: 'One on each side of the root', call: 'meet(root, 20, 80)', want: '50' },
          { label: 'One value is the node itself', call: 'meet(root, 30, 20)', want: '30' },
          { label: 'Both on the right side of 50', call: 'meet(root, 60, 80)', want: '70' },
        ],
        explain: 'While both values are on one side, go that way. The first node that splits them is the answer.',
        hints: ['Are both values smaller than this node? Then go left.', 'Are both bigger? Then go right.', 'Otherwise, this node is where their paths split.'],
      },
    ],
  });

  /* ---------------------------------------------------------------- 18.6 */
  Course.lesson('m18-trees', {
    id: '18-6-delete-and-balance',
    num: '18.6',
    optional: true,
    title: 'Bonus: delete a value, and keep a tree balanced',
    goal: 'You can delete from a binary search tree, and explain what a balanced tree promises.',
    mins: 15,
    steps: [
      { t: 'h', text: 'Why is inorder sorted?' },
      { t: 'p', text: 'You saw this in lesson 18.5. Inorder finishes the smaller side, then visits the node, then does the bigger side. That gives you a handy test: if inorder is sorted, the rule still holds.' },
      { t: 'viz', name: 'm18-traverse', params: { order: 'in', tree: '50, 30, 70, 20, 40, 60, 80' }, caption: 'Predict each visit. Then swap 2 numbers in the tree, and see the output stop being sorted.' },

      { t: 'h', text: 'How do you take a value out?' },
      { t: 'p', text: 'Taking a leaf out is quick. But what about a node with 2 children? Its parent has one arrow, and 2 sides need it. Each case below keeps the rule.' },
      { t: 'table', caption: 'The 3 cases of delete', head: ['The node has', 'What you do'], rows: [
        ['No children', 'Take it away. The arrow above becomes None.'],
        ['1 child', 'Lift that child, and all below it, into the empty spot.'],
        ['2 children', 'Copy in the next bigger value, then delete that value lower down.'],
      ] },
      { t: 'viz', name: 'm18-bst-delete', caption: 'The start has 2 children. Then delete 20, then a value that is not there. Try "50, 30, 80, 70" and delete 50.' },
      { t: 'code', caption: 'A leaf has None on both sides, so `node.left is None` handles it too. Change what gets deleted, and guess the inorder.',
        output: '20 30 40 50 60 70 80\n30 40 50 60 70 80\n30 40 60 70 80',
        code: withBst(py`
          def smallest(node):
              while node.left is not None:
                  node = node.left
              return node.value

          def delete(node, value):
              if node is None:
                  return None
              if value < node.value:
                  node.left = delete(node.left, value)
              elif value > node.value:
                  node.right = delete(node.right, value)
              elif node.left is None:
                  return node.right
              elif node.right is None:
                  return node.left
              else:
                  big = smallest(node.right)
                  node.value = big
                  node.right = delete(node.right, big)
              return node

          def inorder(node):
              if node is None:
                  return []
              left = inorder(node.left)
              right = inorder(node.right)
              return left + [str(node.value)] + right

          root = build([50, 30, 70, 20, 40, 60, 80])
          print(" ".join(inorder(root)))
          root = delete(root, 20)
          print(" ".join(inorder(root)))
          root = delete(root, 50)
          print(" ".join(inorder(root)))
        `),
      },
      { t: 'q', id: 'which-replace', type: 'mcq', level: 2,
        q: 'The tree comes from 50, 30, 70, 60, 80. You delete 50, which has 2 children. Which value moves into its spot?',
        options: [
          '60',
          { text: '70', why: '70 is the right child, but 60 sits between 50 and 70. With 70 on top, 60 would need a new home.' },
          { text: '30', why: 'That keeps the left child, but then 30 would have to hold the right side too. The code picks the next bigger value.' },
        ],
        answer: 0,
        explain: '60 is the smallest value on the right side. So it is bigger than the left side, and smaller than the rest of the right.',
        hints: ['Go right once from 50. Then keep going left.'],
      },
      { t: 'trap',
        think: 'I can move any child up into the empty spot.',
        real: 'With 2 children, the other side still needs a home, and the rule can break. Only the next bigger value, or the next smaller one, fits every value around it.',
      },
      { t: 'cost', title: 'How fast is delete?', items: [
        { op: 'Delete a value', cost: 'O(height)', why: 'It walks down once to find the value, then at most to the bottom for the next bigger one.' },
      ] },

      { t: 'h', text: 'How does a tree stay short?' },
      { t: 'p', text: 'Plain inserts never fix a [[lopsided]] tree. A long line is slow, and it can do worse. Recursion on a line needs a tall pile of calls.' },
      { t: 'code', caption: 'Each insert makes one call per node in the line. Near 1000 nodes, the pile passes the limit from lesson 16.2.',
        output: 'Too deep for recursion',
        code: withBst(py`
          line = None
          try:
              for v in range(1, 1100):
                  line = insert(line, v)
              print("All done")
          except RecursionError:
              print("Too deep for recursion")
        `),
      },
      { t: 'words', items: [
        { word: 'balanced tree', means: 'A tree where the 2 sides of every node differ in height by at most 1.', say: 'BAL-unst' },
        { word: 'rotation', say: 'roh-TAY-shun', means: 'A small change of arrows that lifts one node and lowers its parent. The sorted order stays the same.' },
        { word: 'AVL tree', say: 'A V L', means: 'A binary search tree that checks its balance after each change. Rotations fix it.' },
      ] },
      { t: 'viz', name: 'm18-balance', caption: 'Each label shows the heights of the left and right sides. Try 1, 2, 3, 4, 5, 6, 7, then a mixed order, then one number.' },
      { t: 'big', text: 'A [[balanced tree]] keeps its height small, so search stays O(log n) for any insert order.' },
      { t: 'viz', name: 'm18-turn', caption: 'This is the idea of a [[rotation]], in pictures. Try each insert order. The third needs 2 turns.' },
      { t: 'p', text: 'An [[AVL tree]] checks the 2 sides of each node after an insert. If they differ by more than 1, a [[rotation]] fixes that part. You do not need to write this code. Knowing the promise is enough.' },
      { t: 'code', caption: 'You can also build a short tree in one go. If the numbers are sorted, the middle one becomes the root. Then repeat on each half. The slices make copies, which is fine at this size.',
        output: 'line: 500\nbalanced: 9',
        code: withBst(py`
          def height(node):
              if node is None:
                  return 0
              left = height(node.left)
              right = height(node.right)
              return 1 + max(left, right)

          def build_balanced(items):
              if len(items) == 0:
                  return None
              mid = len(items) // 2
              node = TreeNode(items[mid])
              node.left = build_balanced(items[:mid])
              node.right = build_balanced(items[mid + 1:])
              return node

          nums = list(range(1, 501))
          print("line:", height(build(nums)))
          print("balanced:", height(build_balanced(nums)))
        `),
      },
      { t: 'q', id: 'is-balanced', type: 'mcq', level: 2,
        q: 'The root has a left side of height 3, and a right side of height 1. Is this tree balanced?',
        options: [
          { text: 'Yes, as long as both sides have some nodes', why: 'That checks only that both sides exist. The rule also limits how far apart their heights are.' },
          'No. The heights differ by 2',
          { text: 'Yes, a balanced tree only checks its leaves', why: 'The rule applies to every node, and the root is a node.' },
        ],
        answer: 1,
        explain: '3 and 1 differ by 2, and the limit is 1. So this tree breaks the rule at its root.',
        hints: ['What is 3 minus 1?'],
      },
      { t: 'q', id: 'count-balanced', type: 'mcq', level: 2,
        q: 'Count by hand. A balanced tree holds 7 numbers in 3 levels. What is the most compares a search can take?',
        options: [
          '3',
          { text: '7', why: 'That is the count for a line. Here each compare moves down one level, and there are only 3 levels.' },
          { text: '1', why: 'That is the best case, when the root holds the target. The most comes from the bottom level.' },
        ],
        answer: 0,
        explain: 'Each level costs at most one compare. So 3 levels means at most 3 compares.',
        hints: ['How many levels does the search pass through?'],
      },
      { t: 'cost', title: 'What a balanced tree promises', items: [
        { op: 'Search, insert, delete in a plain tree', cost: 'O(n) at worst', why: 'You saw sorted input make a line.' },
        { op: 'The same in a balanced tree', cost: 'O(log n)', why: 'Height stays near log n, so 1,000 numbers need only a few more than 10 levels.' },
      ] },
      { t: 'tip', title: 'What to use in real Python', text: 'Python has no built-in balanced tree. For "is it there?", use a set or a dict. For a sorted list, use `bisect`. Write your own tree to learn how it works, or when a problem hands you one.' },
    ],
    recap: [
      'You can delete a value in all 3 cases.',
      'You can check if a tree is balanced.',
      'You can explain what a rotation is for.',
    ],
    practice: [
      { id: 'match-words', type: 'match', level: 1,
        q: 'Match each word to what it means.',
        pairs: [
          ['[[balanced tree]]', 'The 2 sides of every node differ by at most 1'],
          ['[[rotation]]', 'A small change of arrows that keeps the sorted order'],
          ['[[AVL tree]]', 'A tree that fixes its own balance after each change'],
        ],
        explain: 'Balance is the promise. A rotation is the tool. An AVL tree uses the tool to keep the promise.',
        hints: ['Which word is about arrows?'],
      },
      { id: 'delete-case', type: 'mcq', level: 1,
        q: 'You delete a node that has 1 child. What happens to that child?',
        options: [
          'It moves up, with everything below it',
          { text: 'It gets deleted too', why: 'That would lose values you still want. Only the one value leaves the tree.' },
          { text: 'It goes back to the root and gets inserted again', why: 'That would work, but it costs extra. The child already fits the empty spot.' },
        ],
        answer: 0,
        explain: 'The child was on one side of the parent above, and it stays there. So the rule still holds.',
        hints: ['Is the child on the correct side of the node above?'],
      },
      { id: 'type-delete', type: 'predict', level: 2,
        q: 'What will the screen show? Type it. Draw the tree first.',
        code: withBst(py`
          def smallest(node):
              while node.left is not None:
                  node = node.left
              return node.value

          def delete(node, value):
              if node is None:
                  return None
              if value < node.value:
                  node.left = delete(node.left, value)
              elif value > node.value:
                  node.right = delete(node.right, value)
              elif node.left is None:
                  return node.right
              elif node.right is None:
                  return node.left
              else:
                  big = smallest(node.right)
                  node.value = big
                  node.right = delete(node.right, big)
              return node

          root = build([5, 3, 8, 7, 9])
          root = delete(root, 5)
          print(root.value)
          print(root.right.value)
          print(root.right.left)
        `),
        answer: '7\n8\nNone',
        why: '7 is the next bigger value after 5, so it moves to the root. The old 7 then leaves.',
        explain: 'Going right from 5 gives 8, and going left gives 7. That leaves 8 with no left child.',
        hints: ['Go right once from 5, then keep going left.', 'Which arrow led to the old 7?'],
      },
      { id: 'fix-delete', type: 'fix', level: 2,
        q: 'After this delete, the next bigger value is in the tree twice. Add the one line that takes out the old copy.',
        code: withBst(py`
          def smallest(node):
              while node.left is not None:
                  node = node.left
              return node.value

          def delete(node, value):
              if node is None:
                  return None
              if value < node.value:
                  node.left = delete(node.left, value)
              elif value > node.value:
                  node.right = delete(node.right, value)
              elif node.left is None:
                  return node.right
              elif node.right is None:
                  return node.left
              else:
                  node.value = smallest(node.right)
              return node

          def inorder(node):
              if node is None:
                  return []
              return inorder(node.left) + [node.value] + inorder(node.right)

          root = delete(build([5, 3, 8, 7, 9]), 5)
        `),
        answer: withBst(py`
          def smallest(node):
              while node.left is not None:
                  node = node.left
              return node.value

          def delete(node, value):
              if node is None:
                  return None
              if value < node.value:
                  node.left = delete(node.left, value)
              elif value > node.value:
                  node.right = delete(node.right, value)
              elif node.left is None:
                  return node.right
              elif node.right is None:
                  return node.left
              else:
                  node.value = smallest(node.right)
                  node.right = delete(node.right, node.value)
              return node

          def inorder(node):
              if node is None:
                  return []
              return inorder(node.left) + [node.value] + inorder(node.right)

          root = delete(build([5, 3, 8, 7, 9]), 5)
        `),
        tests: [
          { label: 'No value appears twice', call: 'inorder(root)', want: '[3, 7, 8, 9]' },
          { label: 'A leaf can go', call: 'inorder(delete(build([2, 1, 3]), 1))', want: '[2, 3]' },
          { label: 'A missing value changes nothing', call: 'inorder(delete(build([2, 1]), 9))', want: '[1, 2]' },
        ],
        explain: 'The value was copied up, so the old node must go. Delete it from the right side, where it came from.',
        hints: ['Where is the old copy?', 'Set `node.right` to the result of a delete.'],
      },
      { id: 'write-sorted', type: 'write', level: 2,
        q: 'Write `is_sorted_tree(node)`. It uses inorder to check the rule. It returns True if each value is bigger than the one before it.',
        starter: withNode(py`
          def inorder(node):
              if node is None:
                  return []
              return inorder(node.left) + [node.value] + inorder(node.right)

          def is_sorted_tree(node):
              # Your code here.
              return None

          good = TreeNode(5)
          good.left = TreeNode(3)
          bad = TreeNode(5)
          bad.left = TreeNode(9)
        `),
        answer: withNode(py`
          def inorder(node):
              if node is None:
                  return []
              return inorder(node.left) + [node.value] + inorder(node.right)

          def is_sorted_tree(node):
              items = inorder(node)
              for i in range(1, len(items)):
                  if items[i] <= items[i - 1]:
                      return False
              return True

          good = TreeNode(5)
          good.left = TreeNode(3)
          bad = TreeNode(5)
          bad.left = TreeNode(9)
        `),
        tests: [
          { label: 'A good tree', call: 'is_sorted_tree(good)', want: 'True' },
          { label: 'A bad tree', call: 'is_sorted_tree(bad)', want: 'False' },
          { label: 'An empty tree', call: 'is_sorted_tree(None)', want: 'True' },
        ],
        explain: 'Inorder of a good tree goes up at every step. One step that does not go up breaks the rule.',
        hints: ['Get the inorder list first.', 'Compare each item with the one before it.'],
      },
      { id: 'write-balanced', type: 'write', level: 3,
        q: 'Stretch: write `is_balanced(node)`. It returns True if, at every node, the 2 heights differ by at most 1.',
        starter: withNode(py`
          def height(node):
              if node is None:
                  return 0
              return 1 + max(height(node.left), height(node.right))

          def is_balanced(node):
              # Your code here.
              return None

          good = TreeNode(1)
          good.left = TreeNode(2)
          good.right = TreeNode(3)
          good.left.left = TreeNode(4)

          tall = TreeNode(1)
          tall.left = TreeNode(2)
          tall.left.left = TreeNode(3)

          hidden = TreeNode(1)
          hidden.left = TreeNode(2)
          hidden.right = TreeNode(3)
          hidden.left.left = TreeNode(4)
          hidden.left.left.left = TreeNode(5)
          hidden.right.right = TreeNode(6)
          hidden.right.right.right = TreeNode(7)
        `),
        answer: withNode(py`
          def height(node):
              if node is None:
                  return 0
              return 1 + max(height(node.left), height(node.right))

          def is_balanced(node):
              if node is None:
                  return True
              gap = height(node.left) - height(node.right)
              if gap > 1 or gap < -1:
                  return False
              return is_balanced(node.left) and is_balanced(node.right)

          good = TreeNode(1)
          good.left = TreeNode(2)
          good.right = TreeNode(3)
          good.left.left = TreeNode(4)

          tall = TreeNode(1)
          tall.left = TreeNode(2)
          tall.left.left = TreeNode(3)

          hidden = TreeNode(1)
          hidden.left = TreeNode(2)
          hidden.right = TreeNode(3)
          hidden.left.left = TreeNode(4)
          hidden.left.left.left = TreeNode(5)
          hidden.right.right = TreeNode(6)
          hidden.right.right.right = TreeNode(7)
        `),
        tests: [
          { label: 'Sides differ by 1', call: 'is_balanced(good)', want: 'True' },
          { label: 'A line of 3', call: 'is_balanced(tall)', want: 'False' },
          { label: 'The root looks fine, but lower nodes do not', call: 'is_balanced(hidden)', want: 'False' },
          { label: 'An empty tree', call: 'is_balanced(None)', want: 'True' },
        ],
        explain: 'Checking only the root is not enough. In the third test, the root is fine, but its children are not. This code works out heights many times over, so it costs more than O(n).',
        hints: ['An empty tree is balanced.', 'Subtract one height from the other. The gap can be below 0.', 'Then check both children the same way.'],
      },
    ],
  });
})();
