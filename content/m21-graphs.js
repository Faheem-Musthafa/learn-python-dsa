/* Module 21: Graphs. Part 3 (Trees, graphs and clever ideas). */
Course.module({
  id: 'm21-graphs',
  num: 21, part: 3, level: 'I',
  title: 'Graphs',
  blurb: 'Map friends, roads and game levels as dots and lines, then search them.',
  needs: ['m06-dicts-sets', 'm15-stacks-queues', 'm16-recursion', 'm18-trees'],
});

/* ------------------------------------------------------------------ 21.1 */
Course.lesson('m21-graphs', {
  id: '21-1-graphs-and-lists',
  num: '21.1',
  title: 'Graphs in life, and how to store them',
  goal: 'You can draw a small graph and store it in a dict as an adjacency list.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What do friends, roads and game levels share?' },
    { t: 'p', text: 'Ann knows Bo. A road joins 2 towns. A door joins 2 rooms in a game. Each one is made of things, and links between them.' },
    { t: 'q', id: 'spark-lines', type: 'mcq', level: 1,
      q: 'Ann knows Bo and Cy. Bo also knows Cy. Draw a dot for each person and a line for each pair who know each other. How many lines do you draw?',
      options: [
        '3',
        { text: '2', why: 'That counts only the lines from Ann. Bo and Cy need a line as well.' },
        { text: '6', why: 'That counts each friendship from both sides. One friendship is one line.' },
      ],
      answer: 0,
      explain: 'The pairs are Ann and Bo, Ann and Cy, and Bo and Cy. So you draw 3 lines.',
      hints: ['Write down each pair once.'],
    },
    { t: 'words', items: [
      { word: 'edge', means: 'A line that joins 2 nodes in a graph.' },
      { word: 'directed', say: 'dye-REK-tid', means: 'Each edge is a one-way arrow. With two-way lines, a graph is undirected.' },
      { word: 'adjacency list', say: 'uh-JAY-sun-see list', means: 'A dict. Each node is a key, and its value lists its neighbours.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A [[graph]] is a friend map. Each person is a dot, and each friendship is a line. On a map of a town, the distance on paper matters. Here, only the links count, so you can draw the dots anywhere.' },
    { t: 'big', text: 'A [[graph]] is [[nodes|node]] joined by [[edges|edge]]. To store it, give each node a list of its neighbours.' },
    { t: 'steps', title: 'Turn a drawing into a dict', items: [
      { label: 'Give each node a key', text: 'Every node needs a key, even a node with no edges.', code: 'graph = {"A": [], "B": [], "C": []}' },
      { label: 'Add each edge from both ends', text: 'A two-way line goes in 2 lists.', code: 'graph["A"].append("B")\ngraph["B"].append("A")' },
      { label: 'Ask it questions', text: 'Who are the neighbours? Is there an edge? How many neighbours?', code: 'graph["A"]\n"B" in graph["A"]\nlen(graph["A"])' },
    ] },
    { t: 'viz', name: 'm21-adj-build', caption: 'Guess before each edge. Then switch to one-way arrows. Try a repeated edge, and try no edges.' },
    { t: 'code', caption: 'Each list holds the neighbours of one node. Add an edge between Bo and Di, and guess the new output first.',
      output: "['Bo', 'Cy']\nTrue\nFalse\n2",
      code: py`
        graph = {
            "Ann": ["Bo", "Cy"],
            "Bo": ["Ann", "Cy"],
            "Cy": ["Ann", "Bo", "Di"],
            "Di": ["Cy"],
        }
        print(graph["Ann"])
        print("Cy" in graph["Di"])
        print("Di" in graph["Ann"])
        print(len(graph["Bo"]))
      `,
    },
    { t: 'q', id: 'read-list', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        graph = {"A": ["B", "C"], "B": ["A"], "C": ["A"]}
        print(len(graph["A"]))
        print(graph["C"])
      `,
      options: [
        "2\n['A']",
        { text: "3\n['A']", why: 'That counts the keys in the dict. `graph["A"]` is only the list of neighbours of A, and it holds 2.' },
        { text: "2\n['A', 'B']", why: 'That thinks B and C are joined. The list for C holds only A.' },
      ],
      answer: 0,
      explain: 'A has 2 neighbours. The list for C holds only A.',
      hints: ['Find the list for A, and count what is in it.'],
    },

    { t: 'h', text: 'Arrows, or no arrows?' },
    { t: 'p', text: 'A friendship goes both ways. You can follow a star who does not follow you, so that link goes one way. A one-way link is a [[directed]] edge, and it goes in only 1 list.' },
    { t: 'code', caption: 'Mia follows Sam, but Sam follows nobody. Make Sam follow Mia too, then run it again.',
      output: "True\nFalse",
      code: py`
        follows = {"Mia": ["Sam"], "Sam": []}
        print("Sam" in follows["Mia"])
        print("Mia" in follows["Sam"])
      `,
    },
    { t: 'q', id: 'one-or-two', type: 'mcq', level: 2,
      q: 'You add one road between Ash and Elm, and cars can drive both ways. How many entries do you add to the adjacency list?',
      options: [
        { text: '1', why: 'That is the rule for a one-way arrow. With only 1 entry, Elm would not know about Ash.' },
        '2',
        { text: '4', why: 'One road makes 1 entry in each of the 2 lists. No other list changes.' },
      ],
      answer: 1,
      explain: 'Ash goes in the list for Elm, and Elm goes in the list for Ash.',
      hints: ['Which lists must know about this road?'],
    },
    { t: 'trap', think: 'one entry is enough for a two-way edge.',
      real: 'The search starts from a list. If only A knows about B, then a search from B cannot reach A.',
      code: 'graph = {"A": ["B"], "B": []}   # one entry\nprint("A" in graph["B"])         # False',
    },
    { t: 'q', id: 'tree-is-graph', type: 'mcq', level: 2,
      q: 'You met [[trees|tree]] in module 18. Which sentence is true?',
      options: [
        'A tree is one kind of graph: it has one top node and no way to go round in a loop.',
        { text: 'A tree is not a graph, because it has a root.', why: 'A root is only one node with a special job. A tree still has nodes and edges, so it is a graph.' },
        { text: 'A graph must have a root, as a tree does.', why: 'A graph needs no top node. You can start a search from any node.' },
      ],
      answer: 0,
      explain: 'A tree has nodes and edges, so it is a graph. It has extra rules: one top node and no loops.',
      hints: ['What is a tree made of?'],
    },

    { t: 'h', text: 'Could you use a table instead?' },
    { t: 'p', text: 'You can also store a graph as a [[grid]] of 0s and 1s. A 1 in row A, column B means an edge from A to B. This grid is called an adjacency matrix.' },
    { t: 'code', caption: 'The same 3 nodes, stored as a grid. Row 0 and column 1 tell you about nodes 0 and 1.',
      output: "1\n0\n9",
      code: py`
        matrix = [
            [0, 1, 1],
            [1, 0, 0],
            [1, 0, 0],
        ]
        print(matrix[0][1])
        print(matrix[1][2])
        print(len(matrix) * len(matrix))
      `,
    },
    { t: 'q', id: 'count-cells', type: 'mcq', level: 2,
      q: 'Count by hand. A graph has 4 nodes and 3 two-way edges. The list needs 2 entries per edge. How many cells does the grid need, and how many entries does the list need?',
      options: [
        '16 cells and 6 entries',
        { text: '4 cells and 3 entries', why: 'A grid has a row and a column for each node. So 4 nodes means 4 x 4 cells.' },
        { text: '16 cells and 3 entries', why: 'The cells are right. But each two-way edge goes in 2 lists, so 3 edges make 6 entries.' },
      ],
      answer: 0,
      explain: 'The grid has 4 x 4 cells. The lists hold 2 entries for each of the 3 edges.',
      hints: ['How many rows and columns does the grid have?'],
    },
    { t: 'cost', title: 'List or grid? V is the number of nodes. E is the number of edges.', items: [
      { op: 'Memory for an adjacency list', cost: 'O(V + E)', why: 'One key per node, and at most 2 entries per edge.' },
      { op: 'Memory for an adjacency matrix', cost: 'O(V^2)', why: 'You counted 16 cells for 4 nodes, even with few edges.' },
      { op: 'Is there an edge from A to B? (list)', cost: 'O(V)', why: 'You may read the whole list for A. It can hold every other node.' },
      { op: 'Is there an edge from A to B? (grid)', cost: 'O(1)', why: 'You go straight to one cell.' },
    ] },
    { t: 'tip', title: 'Which should you pick?', text: 'Most graphs have few edges per node, so this course uses the adjacency list. Some edges also carry a number, like the km of a road. You will meet those in the next lesson.' },
    { t: 'tip', title: 'A shortcut you already know', text: 'A [[defaultdict]] makes the empty list for you, so `graph[a].append(b)` always works. But a node with no edges never gets a key. Add it yourself with `graph["F"] = []`.' },
  ],
  recap: [
    'You can name the nodes and edges in a drawing.',
    'You can store a graph as a dict of lists.',
    'You can add a two-way edge to both lists.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[edge]]', 'A line that joins 2 nodes'],
        ['[[directed]]', 'Edges are one-way arrows'],
        ['[[adjacency list]]', 'Each node has a list of its neighbours'],
      ],
      explain: 'An edge is a link. Directed tells you it has a direction. An adjacency list is one way to store them all.',
      hints: ['Which word has to do with arrows?'],
    },
    { id: 'which-directed', type: 'mcq', level: 1,
      q: 'Which of these needs a [[directed]] graph?',
      options: [
        'Who follows who online',
        { text: 'Who shares a desk with who', why: 'Sharing a desk goes both ways. If you share with Bo, Bo shares with you.' },
        { text: 'Which towns share a two-way road', why: 'The road works in both directions, so a line with no arrow fits.' },
      ],
      answer: 0,
      explain: 'Following goes one way. The person you follow may not follow you.',
      hints: ['Which link can go one way only?'],
    },
    { id: 'predict-entries', type: 'predict', level: 2,
      q: 'This graph has two-way edges. What will the screen show? Type it.',
      code: py`
        graph = {"A": ["B", "C"], "B": ["A"], "C": ["A"], "D": []}
        total = 0
        for node in graph:
            total = total + len(graph[node])
        print(total)
        print(total // 2)
      `,
      answer: '4\n2',
      why: 'The first number adds up every list. Each two-way edge is in 2 lists, so the second number is the edges.',
      explain: 'The lists hold 2, 1, 1 and 0 entries, which is 4. Each edge counts twice, so there are 2 edges.',
      hints: ['Add up the length of each list.', 'What does D add?'],
    },
    { id: 'fill-add', type: 'fill', level: 2,
      q: 'Fill the gaps, so the edge is added from both ends.',
      code: py`
        graph = {"A": [], "B": []}
        a = "A"
        b = "B"
        graph[____].append(b)
        graph[b].append(____)
        print(graph)
      `,
      blanks: ['a', 'a'],
      output: "{'A': ['B'], 'B': ['A']}",
      explain: 'b goes in the list for a, and a goes in the list for b.',
      hints: ['Whose list gets b?', 'Whose name goes in the list for b?'],
    },
    { id: 'write-build', type: 'write', level: 2,
      q: 'Write `build(pairs)`. It gets a list of pairs, like `[("A", "B")]`. It returns a two-way adjacency list as a dict.',
      starter: 'def build(pairs):\n    graph = {}\n    # Your code here\n    return graph\n',
      answer: 'def build(pairs):\n    graph = {}\n    for a, b in pairs:\n        if a not in graph:\n            graph[a] = []\n        if b not in graph:\n            graph[b] = []\n        graph[a].append(b)\n        graph[b].append(a)\n    return graph\n',
      tests: [
        { label: 'One edge goes in 2 lists', call: 'build([("A", "B")])', want: '{"A": ["B"], "B": ["A"]}' },
        { label: '2 edges share a node', call: 'build([("A", "B"), ("A", "C")])', want: '{"A": ["B", "C"], "B": ["A"], "C": ["A"]}' },
        { label: 'No pairs gives an empty dict', call: 'build([])', want: '{}' },
      ],
      explain: 'Make the key the first time you see a node. Then add the edge to both lists.',
      hints: ['Loop with `for a, b in pairs:`.', 'If a key is missing, set it to an empty list first.', 'Append `b` to the list for `a`, and `a` to the list for `b`.'],
    },
    { id: 'write-most', type: 'write', level: 2,
      q: 'Write `most_friends(graph)`. It returns the node with the most neighbours. On a tie, keep the first one. For an empty graph, return `None`.',
      starter: 'def most_friends(graph):\n    # Your code here\n    return "?"\n',
      answer: 'def most_friends(graph):\n    best = None\n    for node in graph:\n        if best is None or len(graph[node]) > len(graph[best]):\n            best = node\n    return best\n',
      tests: [
        { label: 'Bo has the most', call: 'most_friends({"Ann": ["Bo"], "Bo": ["Ann", "Cy"], "Cy": ["Bo"]})', want: '"Bo"' },
        { label: 'A tie keeps the first', call: 'most_friends({"A": ["B"], "B": ["A"]})', want: '"A"' },
        { label: 'An empty graph gives None', call: 'most_friends({})', want: 'None' },
        { label: 'A node with no edges still counts', call: 'most_friends({"Z": []})', want: '"Z"' },
      ],
      explain: 'Keep the best node so far. Replace it only when a list is strictly longer, so a tie keeps the first.',
      hints: ['Start with `best = None`.', 'Compare `len(graph[node])` with `len(graph[best])`.'],
    },
    { id: 'write-copy', type: 'write', level: 3,
      q: 'Stretch: write `copy_graph(graph)`. It returns a new dict with new lists. A change to the copy must not touch the old graph.',
      starter: 'def copy_graph(graph):\n    # Your code here\n    return graph\n',
      answer: 'def copy_graph(graph):\n    new = {}\n    for node in graph:\n        new[node] = graph[node].copy()\n    return new\n',
      tests: [
        { label: 'The copy holds the same edges', call: 'copy_graph({"A": ["B"], "B": ["A"]})', want: '{"A": ["B"], "B": ["A"]}' },
        { label: 'The dict is new', check: '(lambda g: copy_graph(g) is not g)({"A": []})' },
        { label: 'Each list is new', check: '(lambda g: copy_graph(g)["A"] is not g["A"])({"A": ["B"], "B": ["A"]})' },
        { label: 'An empty graph works', call: 'copy_graph({})', want: '{}' },
      ],
      explain: 'A plain copy of the dict would share the same lists. So you make a new list for each node.',
      hints: ['`new = graph` only adds a second name tag.', '`x.copy()` makes a new list from `x`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 21.2 */
Course.lesson('m21-graphs', {
  id: '21-2-bfs-layers',
  num: '21.2',
  title: 'BFS: layers and the fewest steps',
  goal: 'You can use BFS to find the fewest edges from one node to every other node.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How many steps away is everyone?' },
    { t: 'p', text: 'You did [[BFS]] on a tree in module 18, with a [[deque]]. A graph has no top node, so you pick where to start. It can also loop, so you need one new tool.' },
    { t: 'q', id: 'spark-fewest', type: 'mcq', level: 1,
      q: 'Roads: A to B, A to C, B to D, C to D, D to E. What is the fewest number of roads from A to E?',
      options: [
        '3',
        { text: '2', why: 'A has no road to D. You need to pass through B or C first.' },
        { text: '4', why: 'That counts the towns on the route, not the roads between them.' },
      ],
      answer: 0,
      explain: 'A to B to D to E uses 3 roads. No route is shorter.',
      hints: ['Draw it. Then count the lines, not the dots.'],
    },
    { t: 'words', items: [
      { word: 'visited', means: 'A set of nodes you have already found, so you never add them twice.' },
      { word: 'layer', means: 'All the nodes that are the same number of edges from the start.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Drop a stone in a pond. A ripple spreads out, ring by ring. BFS spreads the same way: first 1 edge away, then 2. Unlike water, it moves along edges only, and it serves one node at a time.' },
    { t: 'viz', name: 'm21-bfs', caption: 'Guess each time it asks. Then choose a new start. Try a path to a node with no road to it.' },
    { t: 'big', text: 'BFS reaches every [[layer]] before the next one. So the first time it finds a node, it has used the fewest edges.' },
    { t: 'steps', title: 'BFS on a graph', items: [
      { label: 'Set up', text: 'Put the start in the queue and in [[visited]]. Its distance is 0.', code: 'visited = {start}\ndist = {start: 0}\nqueue = deque([start])' },
      { label: 'Serve the front', text: 'Take the node at the front. The oldest one leaves first.', code: 'node = queue.popleft()' },
      { label: 'Look at each neighbour', text: 'If it is new, mark it right away. It is 1 edge past this node.', code: 'if other not in visited:\n    visited.add(other)\n    dist[other] = dist[node] + 1\n    queue.append(other)' },
      { label: 'Stop when the queue is empty', text: 'Now every node you can reach has its distance.' },
    ] },
    { t: 'code', caption: 'This is the graph from the question. Change the start to "E", and guess the numbers first.',
      output: "{'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 3}",
      code: py`
        from collections import deque

        def bfs(graph, start):
            visited = {start}
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                node = queue.popleft()
                for other in graph[node]:
                    if other not in visited:
                        visited.add(other)
                        dist[other] = dist[node] + 1
                        queue.append(other)
            return dist

        graph = {
            "A": ["B", "C"],
            "B": ["A", "D"],
            "C": ["A", "D"],
            "D": ["B", "C", "E"],
            "E": ["D"],
        }
        print(bfs(graph, "A"))
      `,
    },
    { t: 'q', id: 'trace-queue', type: 'trace', level: 2,
      q: 'Fill in the table. Each row is one trip around the `while` loop. Queue letters have no spaces. Write `empty` when nothing waits.',
      code: py`
        graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
        visited = {"A"}
        queue = deque(["A"])
        while len(queue) > 0:
            node = queue.popleft()
            for other in graph[node]:
                if other not in visited:
                    visited.add(other)
                    queue.append(other)
      `,
      head: ['node', 'queue_after'],
      rows: [
        ['A', 'BC'],
        ['B', 'CD'],
        ['C', 'D'],
        ['D', 'empty'],
      ],
      given: 1,
      verify: py`
        from collections import deque
        graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
        visited = {"A"}
        queue = deque(["A"])
        while len(queue) > 0:
            node = queue.popleft()
            for other in graph[node]:
                if other not in visited:
                    visited.add(other)
                    queue.append(other)
            print(node, "".join(queue) or "empty")
      `,
      explain: 'D joins only once, when B finds it. When C looks, D is in [[visited]] already.',
      hints: ['New nodes join at the back.', 'When C looks at D, is D already in visited?'],
    },
    { t: 'q', id: 'count-looks', type: 'mcq', level: 2,
      q: 'Count by hand. A two-way graph has 5 nodes and 4 edges. Each node leaves the queue once. Each edge is in 2 lists. How many neighbour checks does BFS make?',
      options: [
        { text: '4', why: 'That counts each edge once. BFS reads it from both ends, because it is in 2 lists.' },
        '8',
        { text: '25', why: 'That is 5 x 5, as if every node checks every node. BFS only reads the real lists.' },
      ],
      answer: 1,
      explain: 'Each of the 4 edges is read from both ends. That makes 8 checks.',
      hints: ['How many list entries do 4 edges make?'],
    },
    { t: 'cost', title: 'How fast is BFS? V is nodes, E is edges.', items: [
      { op: 'Time for BFS', cost: 'O(V + E)', why: 'Each node leaves the queue once. Each list entry gets read once. That counts set checks as O(1), which is true on average.' },
      { op: 'Memory for BFS', cost: 'O(V)', why: 'The queue, visited and dist each hold each node at most once.' },
      { op: '`queue.popleft()` and `other in visited`', cost: 'O(1)', why: 'A deque and a set make these fast. `in` on a set is O(1) on average.' },
    ] },

    { t: 'h', text: 'When should you mark a node?' },
    { t: 'trap', think: 'I can add a node to visited when it leaves the queue.',
      real: 'Then 2 neighbours can both add the same node, because neither sees a mark yet. Mark it when it joins the queue.',
      code: 'visited.add(other)    # mark first\nqueue.append(other)   # then queue it',
    },
    { t: 'h', text: 'How do you get the route, not only the number?' },
    { t: 'p', text: 'When a node finds a new neighbour, write down who found it. Then walk back from the end, and flip the list.' },
    { t: 'code', caption: 'Each entry in `came_from` says who found that node. Try a route from "B" to "C". Then add a node with no edges, and ask for it.',
      output: "['A', 'B', 'D', 'E']",
      code: py`
        from collections import deque

        def route(graph, start, end):
            came_from = {start: None}
            queue = deque([start])
            while len(queue) > 0:
                node = queue.popleft()
                for other in graph[node]:
                    if other not in came_from:
                        came_from[other] = node
                        queue.append(other)
            if end not in came_from:
                return []
            path = []
            at = end
            while at is not None:
                path.append(at)
                at = came_from[at]
            path.reverse()
            return path

        graph = {
            "A": ["B", "C"],
            "B": ["A", "D"],
            "C": ["A", "D"],
            "D": ["B", "C", "E"],
            "E": ["D"],
        }
        print(route(graph, "A", "E"))
      `,
    },
    { t: 'q', id: 'came-from-visited', type: 'mcq', level: 2,
      q: 'This code has no `visited` set. Why can it still stop?',
      options: [
        'The keys of `came_from` do the job of visited.',
        { text: 'Graphs never have loops.', why: 'This graph has a loop: A, B, D, C and back to A. Something must stop the search from going round.' },
        { text: '`deque` skips repeats by itself.', why: 'A deque keeps whatever you add, even repeats. The check on `came_from` keeps repeats out.' },
      ],
      answer: 0,
      explain: 'A node gets a key the moment it is found. So `other not in came_from` asks the same question as visited.',
      hints: ['Look at the `if` line. What does it check?'],
    },

    { t: 'h', text: 'When does BFS get it wrong?' },
    { t: 'words', items: [
      { word: 'weighted', say: 'WAY-tid', means: 'Each edge has a number on it, like km or cost.' },
    ] },
    { t: 'p', text: 'BFS counts edges. It never reads a number on an edge. So a route with few long roads can beat a route with many short roads.' },
    { t: 'viz', name: 'm21-weighted', caption: 'Pick the route BFS takes. Then change the km. Try all the roads at 1, and try a short direct road.' },
    { t: 'tip', title: 'The rule to remember', text: 'BFS gives the shortest path only when every edge counts the same. For a [[weighted]] graph, you need a different search, and a later module teaches it.' },
    { t: 'table', caption: 'How to spot BFS', head: ['If the problem says...', 'Think of...'], rows: [
      ['"fewest moves", "fewest steps"', 'BFS from the start'],
      ['"level by level", "friends of friends"', 'BFS, with one layer at a time'],
      ['"shortest", and every move costs the same', 'BFS is safe'],
      ['"cheapest", with costs or km on the edges', 'Not plain BFS'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'If the start is also the end, the answer is 0 edges. If no path exists, the node gets no distance. A node with no edges has an empty list, so the loop does nothing.' },
  ],
  recap: [
    'You can run BFS with a queue and a visited set.',
    'You can find the fewest edges and the route.',
    'You can say why BFS fails with numbers on edges.',
  ],
  practice: [
    { id: 'weighted-claim', type: 'mcq', level: 1,
      q: 'Your friend says, "BFS finds the shortest path in any graph." What do you say?',
      options: [
        'Only when every edge counts the same.',
        { text: 'Yes, in any graph at all.', why: 'BFS counts edges and ignores any numbers on them. Many short roads can beat 1 long road.' },
        { text: 'Only in a tree.', why: 'BFS finds the fewest edges in any graph. A tree is not needed, only equal edges.' },
      ],
      answer: 0,
      explain: 'BFS always finds the fewest edges. That is the shortest route only if each edge costs the same.',
      hints: ['What does BFS count?'],
    },
    { id: 'predict-dist', type: 'predict', level: 2,
      q: 'What will the screen show? Type it. Nodes D and E have no road to A.',
      code: py`
        from collections import deque

        graph = {"A": ["B"], "B": ["A", "C"], "C": ["B"], "D": ["E"], "E": ["D"]}
        dist = {"A": 0}
        queue = deque(["A"])
        while len(queue) > 0:
            node = queue.popleft()
            for other in graph[node]:
                if other not in dist:
                    dist[other] = dist[node] + 1
                    queue.append(other)
        print(dist["C"])
        print("E" in dist)
      `,
      answer: '2\nFalse',
      why: 'C is 2 edges from A. BFS can never reach E, so E never gets a key.',
      explain: 'A to B to C is 2 edges. No path leads to E, so it is not in `dist`.',
      hints: ['Walk the edges from A.', 'Can you ever get from A to D?'],
    },
    { id: 'order-bfs', type: 'order', level: 2, run: false,
      q: 'Put the lines of BFS in order. `graph` and `start` already exist, and `deque` is imported.',
      lines: [
        'visited = {start}',
        'queue = deque([start])',
        'while len(queue) > 0:',
        '    node = queue.popleft()',
        '    for other in graph[node]:',
        '        if other not in visited:',
        '            visited.add(other)',
        '            queue.append(other)',
      ],
      extra: ['    node = queue.pop()'],
      explain: 'The extra line takes from the back, which would make a stack. BFS serves the front.',
      hints: ['Set up the 2 names before the loop.', 'Which line takes from the front of a deque?'],
    },
    { id: 'fix-pop', type: 'fix', level: 2,
      q: '`dist["D"]` should be 2, because A to B to D is 2 edges. This code gets 3. One word is wrong. Fix it.',
      code: 'from collections import deque\n\ndef bfs(graph, start):\n    visited = {start}\n    dist = {start: 0}\n    queue = deque([start])\n    while len(queue) > 0:\n        node = queue.pop()\n        for other in graph[node]:\n            if other not in visited:\n                visited.add(other)\n                dist[other] = dist[node] + 1\n                queue.append(other)\n    return dist\n',
      answer: 'from collections import deque\n\ndef bfs(graph, start):\n    visited = {start}\n    dist = {start: 0}\n    queue = deque([start])\n    while len(queue) > 0:\n        node = queue.popleft()\n        for other in graph[node]:\n            if other not in visited:\n                visited.add(other)\n                dist[other] = dist[node] + 1\n                queue.append(other)\n    return dist\n',
      tests: [
        { label: 'D is 2 edges from A', call: 'bfs({"A": ["B", "C"], "B": ["D"], "C": ["E"], "E": ["D"], "D": []}, "A")["D"]', want: '2' },
        { label: 'E is 2 edges from A', call: 'bfs({"A": ["B", "C"], "B": ["D"], "C": ["E"], "E": ["D"], "D": []}, "A")["E"]', want: '2' },
        { label: 'One node alone has dist 0', call: 'bfs({"A": []}, "A")', want: '{"A": 0}' },
      ],
      explain: '`pop()` takes the newest node, so the search dives deep and breaks the layers. `popleft()` keeps them in order.',
      hints: ['Which end of the line should be served first?', 'Look at the line that takes a node from the queue.'],
    },
    { id: 'write-fewest', type: 'write', level: 2,
      q: 'Write `fewest_edges(graph, a, b)`. It returns the fewest edges from `a` to `b`. If no path exists, it returns -1.',
      starter: 'from collections import deque\n\ndef fewest_edges(graph, a, b):\n    # Your code here\n    return 0\n',
      answer: 'from collections import deque\n\ndef fewest_edges(graph, a, b):\n    dist = {a: 0}\n    queue = deque([a])\n    while len(queue) > 0:\n        node = queue.popleft()\n        for other in graph[node]:\n            if other not in dist:\n                dist[other] = dist[node] + 1\n                queue.append(other)\n    return dist.get(b, -1)\n',
      tests: [
        { label: 'A to D is 2', call: 'fewest_edges({"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}, "A", "D")', want: '2' },
        { label: 'A node to itself is 0', call: 'fewest_edges({"A": ["B"], "B": []}, "A", "A")', want: '0' },
        { label: 'No path gives -1', call: 'fewest_edges({"A": ["B"], "B": [], "C": []}, "A", "C")', want: '-1' },
        { label: 'A loop does not trap it', call: 'fewest_edges({"A": ["B"], "B": ["C"], "C": ["A", "D"], "D": []}, "A", "D")', want: '3' },
      ],
      explain: 'Run BFS with a `dist` dict. If `b` never got a key, then no path reaches it.',
      hints: ['Start with `dist = {a: 0}`.', 'Copy the shape of the BFS loop.', '`dist.get(b, -1)` gives -1 for a missing key.'],
    },
    { id: 'write-within', type: 'write', level: 2,
      q: 'Friends of friends: write `near(graph, start, k)`. It returns a sorted list of the nodes at most `k` edges from `start`. Leave out `start` itself.',
      starter: 'from collections import deque\n\ndef near(graph, start, k):\n    # Your code here\n    return []\n',
      answer: 'from collections import deque\n\ndef near(graph, start, k):\n    dist = {start: 0}\n    queue = deque([start])\n    while len(queue) > 0:\n        node = queue.popleft()\n        for other in graph[node]:\n            if other not in dist:\n                dist[other] = dist[node] + 1\n                queue.append(other)\n    found = []\n    for node in dist:\n        if node != start and dist[node] <= k:\n            found.append(node)\n    return sorted(found)\n',
      tests: [
        { label: 'k = 1 gives direct friends', call: 'near({"A": ["B"], "B": ["A", "C"], "C": ["B", "D"], "D": ["C"]}, "A", 1)', want: '["B"]' },
        { label: 'k = 2 adds friends of friends', call: 'near({"A": ["B"], "B": ["A", "C"], "C": ["B", "D"], "D": ["C"]}, "A", 2)', want: '["B", "C"]' },
        { label: 'k = 0 gives nobody', call: 'near({"A": ["B"], "B": ["A"]}, "A", 0)', want: '[]' },
        { label: 'A node with no edges has nobody near', call: 'near({"A": []}, "A", 5)', want: '[]' },
      ],
      explain: 'BFS gives each node its distance. Then keep the ones within `k`, and leave out the start.',
      hints: ['Get `dist` with BFS first.', 'Loop over `dist`, and keep `dist[node] <= k`.', 'Skip `start`, then return `sorted(found)`.'],
    },
    { id: 'write-route', type: 'write', level: 3,
      q: 'Stretch: write `route(graph, a, b)`. It returns one shortest route as a list of nodes. If no route exists, it returns `[]`.',
      starter: 'from collections import deque\n\ndef route(graph, a, b):\n    # Your code here\n    return None\n',
      answer: 'from collections import deque\n\ndef route(graph, a, b):\n    came_from = {a: None}\n    queue = deque([a])\n    while len(queue) > 0:\n        node = queue.popleft()\n        for other in graph[node]:\n            if other not in came_from:\n                came_from[other] = node\n                queue.append(other)\n    if b not in came_from:\n        return []\n    path = []\n    at = b\n    while at is not None:\n        path.append(at)\n        at = came_from[at]\n    path.reverse()\n    return path\n',
      tests: [
        { label: 'A straight line', call: 'route({"A": ["B"], "B": ["C"], "C": []}, "A", "C")', want: '["A", "B", "C"]' },
        { label: 'It takes the short way', call: 'route({"A": ["B", "D"], "B": ["C"], "C": ["D"], "D": []}, "A", "D")', want: '["A", "D"]' },
        { label: 'From a node to itself', call: 'route({"A": ["B"], "B": []}, "A", "A")', want: '["A"]' },
        { label: 'No route gives an empty list', call: 'route({"A": [], "B": []}, "A", "B")', want: '[]' },
      ],
      explain: 'Save who found each node. Walk back from the end to the start, then flip the list.',
      hints: ['Use `came_from = {a: None}`.', 'If `b` is not a key, return `[]`.', 'Follow `came_from` until you reach `None`, then reverse.'],
    },
  ],
});

/* ------------------------------------------------------------------ 21.3 */
Course.lesson('m21-graphs', {
  id: '21-3-dfs-visited',
  num: '21.3',
  title: 'DFS: go deep, and mark where you have been',
  goal: 'You can write DFS with a visited set, and say why cycles need it.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What if the search can go round in a circle?' },
    { t: 'p', text: 'On a tree in module 18, [[DFS]] always ended. A tree has no way back up. A graph can lead you back to where you were.' },
    { t: 'q', id: 'spark-forever', type: 'predict', level: 2, expectError: true,
      q: 'A has an edge to B, and B has an edge back to A. This search has no marks. What happens?',
      code: py`
        graph = {"A": ["B"], "B": ["A"]}

        def walk(node):
            for other in graph[node]:
                walk(other)

        walk("A")
      `,
      options: [
        { text: 'It ends after A and B', why: 'That expects it to know where it has been. Nothing in this code remembers that.' },
        { text: 'It does nothing at all', why: 'The last line calls `walk("A")`. So the calls do start.' },
        'It stops with a RecursionError',
      ],
      answer: 2,
      explain: 'A calls B, B calls A, and so on. The pile of calls grows until Python stops it.',
      hints: ['Follow the calls by hand for 4 turns.', 'Does the pile ever shrink?'],
    },
    { t: 'words', items: [
      { word: 'cycle', say: 'SY-kul', means: 'A path of edges that leads back to a node it has already been on.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'You explore a maze with chalk. You mark the wall at each spot. You never enter a spot with a mark. Unlike you, DFS needs no map home, because the pile of calls remembers the way back.' },
    { t: 'viz', name: 'm21-no-visited', caption: 'Start with no visited, then turn it on. Try all 3 graphs. Why does the chain end with no marks?' },
    { t: 'big', text: 'A [[cycle]] can trap a search for ever. Mark each node the moment you reach it, and skip any node with a mark.' },
    { t: 'steps', title: 'Write DFS on a graph', items: [
      { label: 'Mark it', text: 'Add the node to [[visited]] first, before anything else.', code: 'visited.add(node)' },
      { label: 'Look at each neighbour', text: 'Go through its list, in order.', code: 'for other in graph[node]:' },
      { label: 'Go deep', text: 'If the neighbour has no mark, call the function on it. This node waits on the pile.', code: 'if other not in visited:\n    dfs(other)' },
    ] },
    { t: 'viz', name: 'm21-dfs', caption: 'Choose a start. Say where DFS goes next before you step. Then try a graph with 2 separate parts.' },
    { t: 'code', caption: 'Change `dfs("A")` to `dfs("E")`, and guess the order first. Try removing the edge between D and E too.',
      output: 'A\nB\nD\nC\nE',
      code: py`
        graph = {
            "A": ["B", "C"],
            "B": ["A", "D"],
            "C": ["A", "D"],
            "D": ["B", "C", "E"],
            "E": ["D"],
        }
        visited = set()

        def dfs(node):
            visited.add(node)
            print(node)
            for other in graph[node]:
                if other not in visited:
                    dfs(other)

        dfs("A")
      `,
    },
    { t: 'q', id: 'predict-dfs', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        graph = {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}
        visited = set()

        def dfs(node):
            visited.add(node)
            print(node)
            for other in graph[node]:
                if other not in visited:
                    dfs(other)

        dfs("A")
      `,
      options: [
        { text: 'A\nB\nC\nD', why: 'That is BFS order, layer by layer. DFS finishes all of B, including D, before it looks at C.' },
        'A\nB\nD\nC',
        { text: 'A\nC\nB\nD', why: 'That starts with the last neighbour. The `for` loop goes through the list from the front.' },
      ],
      answer: 1,
      explain: 'From A it goes to B, then deep to D. D is a dead end, so it comes back to A, and then visits C.',
      hints: ['Which neighbour of A comes first in the list?', 'Does DFS finish B before it looks at C?'],
    },
    { t: 'h', text: 'Stack or queue?' },
    { t: 'table', caption: 'The same job, 2 ways', head: ['', 'BFS', 'DFS'], rows: [
      ['Holds the waiting nodes in', 'A queue: oldest first', 'A stack: newest first'],
      ['Moves', 'Layer by layer', 'Deep, then back'],
      ['Gives you', 'Fewest edges', 'Can I get there? What can I reach?'],
      ['Time', 'O(V + E)', 'O(V + E)'],
    ] },
    { t: 'q', id: 'count-dfs', type: 'mcq', level: 2,
      q: 'Count by hand. A two-way chain goes A, B, C, D. That is 4 nodes and 3 edges. How many `for` loop turns does `dfs("A")` make in all?',
      options: [
        { text: '3', why: 'That counts each edge once. Each two-way edge is in 2 lists, and the loop reads them both.' },
        '6',
        { text: '16', why: 'That is 4 x 4, as if each node looks at every node. The loop only reads the real list.' },
      ],
      answer: 1,
      explain: 'The lists have 1, 2, 2 and 1 entries. Each one gets read once, so that makes 6.',
      hints: ['Write out the list for each node.'],
    },
    { t: 'cost', title: 'How much does DFS cost? V is nodes, E is edges.', items: [
      { op: 'Time for DFS', cost: 'O(V + E)', why: 'Each node runs once. Each list entry gets read once, as you counted. Set checks are O(1) on average.' },
      { op: 'Memory for DFS', cost: 'O(V)', why: 'On a long chain, every node waits on the pile at once.' },
    ] },

    { t: 'h', text: 'What if the graph is very deep?' },
    { t: 'p', text: 'Each call waits on the pile. On a long chain, the pile can hit the [[recursion]] limit from module 16. Your own list can act as the stack, and it has no such limit.' },
    { t: 'code', caption: 'Both search a chain of 3000 nodes. The first hits the limit. The second keeps its stack in a list. Try 300 nodes.',
      output: 'The pile got too tall.\nList stack visited 3000',
      code: py`
        size = 3000
        graph = {}
        for n in range(size - 1):
            graph[n] = [n + 1]
        graph[size - 1] = []

        def dfs(node, visited):
            visited.add(node)
            for other in graph[node]:
                if other not in visited:
                    dfs(other, visited)

        def dfs_list(start):
            visited = set()
            stack = [start]
            while len(stack) > 0:
                node = stack.pop()
                if node not in visited:
                    visited.add(node)
                    for other in reversed(graph[node]):
                        stack.append(other)
            return visited

        try:
            dfs(0, set())
        except RecursionError:
            print("The pile got too tall.")
        print("List stack visited", len(dfs_list(0)))
      `,
    },
    { t: 'tip', title: 'Why reversed?', text: '`reversed(x)` goes through a list from its end. A stack serves the newest first. So you push the neighbours backwards, and the first one comes out first.' },
    { t: 'table', caption: 'How to spot DFS', head: ['If the problem says...', 'Think of...'], rows: [
      ['"can you reach", "is there a path"', 'DFS or BFS. Either one works.'],
      ['"all paths", "every route"', 'DFS that takes off its marks as it walks back, as in module 19'],
      ['"how deep", "explore everything"', 'DFS'],
      ['"fewest steps"', 'BFS, because DFS may find a long route first'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'A node with an edge to itself is safe, because it already has a mark. A node with no path from the start is never visited. A node with no edges prints only itself.' },
  ],
  recap: [
    'You can write DFS with a visited set.',
    'You can say why a cycle needs marks.',
    'You can pick a queue or a stack for the job.',
  ],
  practice: [
    { id: 'tree-no-marks', type: 'mcq', level: 1,
      q: 'DFS on a tree in module 18 needed no visited set. Why does a graph need one?',
      options: [
        'A graph can have a cycle, so a search can come back to a node.',
        { text: 'A graph has more nodes than a tree.', why: 'Size is not the reason. A tiny graph of 2 nodes can still trap a search.' },
        { text: 'Python needs a set to run DFS.', why: 'Python does not ask for a set. You add it to stop the search from going round.' },
      ],
      answer: 0,
      explain: 'Calls on a tree only go down from parent to child. A cycle can lead you back, so you need marks.',
      hints: ['What can a graph do that a tree cannot?'],
    },
    { id: 'predict-order', type: 'predict', level: 2,
      q: 'What will the screen show? Type each node on its own line.',
      code: py`
        graph = {1: [2, 3], 2: [1, 4], 3: [1], 4: [2]}
        visited = set()

        def dfs(node):
            visited.add(node)
            print(node)
            for other in graph[node]:
                if other not in visited:
                    dfs(other)

        dfs(1)
      `,
      answer: '1\n2\n4\n3',
      why: 'From 1 it goes to 2, then deep to 4. It comes back and only then visits 3.',
      explain: 'DFS finishes everything through 2, including 4, before it turns to 3.',
      hints: ['What is the first neighbour of 1?', 'When 4 ends, which call carries on?'],
    },
    { id: 'order-dfs', type: 'order', level: 2,
      q: 'Put the lines in order, so `dfs` prints A, then B.',
      lines: [
        'graph = {"A": ["B"], "B": ["A"]}',
        'visited = set()',
        'def dfs(node):',
        '    visited.add(node)',
        '    print(node)',
        '    for other in graph[node]:',
        '        if other not in visited:',
        '            dfs(other)',
        'dfs("A")',
      ],
      extra: ['    visited = set()'],
      output: 'A\nB',
      explain: 'The extra line makes a new empty set in each call. Then no call can see the marks of another call.',
      hints: ['The set must be made once, outside the function.'],
    },
    { id: 'fix-no-mark', type: 'fix', level: 2,
      q: 'This search stops with a RecursionError on any cycle. It is missing one line. Fix it, so `count(graph, "A")` gives the number of nodes it can reach.',
      code: 'def visit(graph, node, visited):\n    for other in graph[node]:\n        if other not in visited:\n            visit(graph, other, visited)\n\ndef count(graph, start):\n    visited = set()\n    visit(graph, start, visited)\n    return len(visited)\n',
      answer: 'def visit(graph, node, visited):\n    visited.add(node)\n    for other in graph[node]:\n        if other not in visited:\n            visit(graph, other, visited)\n\ndef count(graph, start):\n    visited = set()\n    visit(graph, start, visited)\n    return len(visited)\n',
      tests: [
        { label: 'A cycle of 3 gives 3', call: 'count({"A": ["B"], "B": ["C"], "C": ["A"]}, "A")', want: '3' },
        { label: 'One lone node gives 1', call: 'count({"A": []}, "A")', want: '1' },
        { label: 'It only counts what it can reach', call: 'count({"A": ["B"], "B": [], "C": []}, "A")', want: '2' },
      ],
      explain: 'Nothing ever went into `visited`, so every check said "not visited". Mark the node first.',
      hints: ['Which line puts a node in `visited`?', 'Add `visited.add(node)` as the first line of `visit`.'],
    },
    { id: 'write-reach', type: 'write', level: 2,
      q: 'Write `can_reach(graph, a, b, visited)`. It returns `True` if a path of edges leads from `a` to `b`. Pass a new `set()` for `visited` when you call it.',
      starter: 'def can_reach(graph, a, b, visited):\n    # Your code here\n    return False\n',
      answer: 'def can_reach(graph, a, b, visited):\n    if a == b:\n        return True\n    visited.add(a)\n    for other in graph[a]:\n        if other not in visited:\n            if can_reach(graph, other, b, visited):\n                return True\n    return False\n',
      tests: [
        { label: 'A path of 2 edges', call: 'can_reach({"A": ["B"], "B": ["C"], "C": []}, "A", "C", set())', want: 'True' },
        { label: 'One-way: no path back', call: 'can_reach({"A": ["B"], "B": []}, "B", "A", set())', want: 'False' },
        { label: 'A cycle does not trap it', call: 'can_reach({"A": ["B"], "B": ["A"], "C": []}, "A", "C", set())', want: 'False' },
        { label: 'A node reaches itself', call: 'can_reach({"A": []}, "A", "A", set())', want: 'True' },
      ],
      explain: 'The base case is `a == b`. Otherwise mark `a`, and ask each unmarked neighbour. One True is enough.',
      hints: ['If `a == b`, return `True` straight away.', 'Add `a` to `visited`, then loop over its neighbours.', 'Only return `False` after the loop ends.'],
    },
    { id: 'write-paths', type: 'write', level: 3,
      q: 'Stretch: this graph has arrows and no [[cycle]], so no marks are needed. Write `count_paths(graph, a, b)`. It returns how many different routes go from `a` to `b`.',
      starter: 'def count_paths(graph, a, b):\n    # Your code here\n    return 0\n',
      answer: 'def count_paths(graph, a, b):\n    if a == b:\n        return 1\n    total = 0\n    for other in graph[a]:\n        total = total + count_paths(graph, other, b)\n    return total\n',
      tests: [
        { label: '2 routes round a diamond', call: 'count_paths({"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}, "A", "D")', want: '2' },
        { label: '1 straight route', call: 'count_paths({"A": ["B"], "B": []}, "A", "B")', want: '1' },
        { label: 'No route gives 0', call: 'count_paths({"A": [], "B": []}, "A", "B")', want: '0' },
        { label: 'A node to itself is 1 route', call: 'count_paths({"A": []}, "A", "A")', want: '1' },
      ],
      explain: 'Reaching `b` counts as 1 route. Every other node adds up the routes from each of its neighbours.',
      hints: ['What is the base case?', 'Add up the answer for each neighbour.'],
    },
  ],
});

/* ------------------------------------------------------------------ 21.4 */
Course.lesson('m21-graphs', {
  id: '21-4-grids-are-graphs',
  num: '21.4',
  title: 'Grids are graphs',
  goal: 'You can treat a grid as a graph, then fill an area or count islands.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Where are the nodes in a game map?' },
    { t: 'p', text: 'A game map is often a [[grid]]. Each cell can be a node. Each cell has an edge to the cells beside it. So you get a graph, with no dict to build.' },
    { t: 'q', id: 'spark-corner', type: 'mcq', level: 1,
      q: 'In a 3 by 3 grid, you can step up, down, left or right. How many cells can you step to from the top left corner?',
      options: [
        '2',
        { text: '3', why: 'That counts the corner cell at (1, 1) too. Moves across a corner do not count here.' },
        { text: '4', why: 'A cell in the middle has 4. Up and left go off the grid from here.' },
      ],
      answer: 0,
      explain: 'You can only step right or down. Up and left are off the grid.',
      hints: ['Which of the 4 directions stay on the grid?'],
    },
    { t: 'words', items: [
      { word: 'flood fill', means: 'Start at one cell, and spread to every joined cell of the same kind.' },
      { word: 'island', means: 'A group of land cells joined by up, down, left or right.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Use the paint bucket in a drawing app. Click once, and the paint spreads until it meets a wall. Real paint spreads all at once. A [[flood fill]] does it one cell at a time.' },
    { t: 'steps', title: 'Find the cells next to a cell', items: [
      { label: 'List the 4 moves', text: 'Each pair changes the row and the column.', code: 'moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]' },
      { label: 'Work out the new spot', text: 'Add the move to where you are.', code: 'nr = r + dr\nnc = c + dc' },
      { label: 'Check it is on the grid', text: 'Do this before you read the cell. `0 <= nr < rows` asks 2 things: is `nr` at least 0, and is it below `rows`?', code: 'if 0 <= nr < rows and 0 <= nc < cols:' },
      { label: 'Check it is land', text: 'Water is not joined to anything.', code: 'if grid[nr][nc] == 1:' },
    ] },
    { t: 'code', caption: 'This is your neighbour finder. Try the cell (0, 0), then try (1, 1), and guess first.',
      output: '[(0, 1), (2, 1), (1, 0)]',
      code: py`
        grid = [
            [1, 1, 0],
            [1, 1, 0],
            [0, 1, 0],
        ]

        rows = len(grid)
        cols = len(grid[0])
        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def land_next_to(r, c):
            found = []
            for dr, dc in moves:
                nr = r + dr
                nc = c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    if grid[nr][nc] == 1:
                        found.append((nr, nc))
            return found

        print(land_next_to(1, 1))
      `,
    },
    { t: 'trap', think: 'going off the top of the grid gives an error, so a mistake will show up.',
      real: 'Row -1 is no error in Python. A -1 index means the last row. So the search can jump to the far side with no warning.',
      code: 'grid = [[1, 0], [0, 7]]\nprint(grid[-1][1])   # prints 7, no error',
    },
    { t: 'q', id: 'negative-wrap', type: 'predict', level: 2,
      q: 'This code has no check for going off the grid. What will the screen show?',
      code: py`
        grid = [[1, 2, 3],
                [4, 5, 6]]
        r = 0
        c = 0
        print(grid[r - 1][c])
      `,
      options: [
        '4',
        { text: 'IndexError', why: 'You may expect row -1 to fail. Python reads a -1 index as the last row.' },
        { text: '1', why: 'That thinks `r - 1` stays at 0. It is -1, which means the last row.' },
      ],
      answer: 0,
      explain: '`r - 1` is -1, which is the last row. Spot 0 of that row holds 4.',
      hints: ['What is `grid[-1]`?'],
    },
    { t: 'viz', name: 'm21-flood', caption: 'Choose a start cell. Try water, a single cell, and a grid that is all land.' },
    { t: 'big', text: 'A cell is a node, and the 4 moves are its [[edges|edge]]. BFS and DFS work the same way, with `(row, col)` as the node.' },
    { t: 'code', caption: 'Use BFS, and the result is the fewest steps through a maze. 1 is open and 0 is a wall. Block (1, 1) and run it again.',
      output: '6\n-1',
      code: py`
        from collections import deque

        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def land_next_to(grid, r, c):
            found = []
            for dr, dc in moves:
                nr = r + dr
                nc = c + dc
                if 0 <= nr < len(grid):
                    if 0 <= nc < len(grid[0]):
                        if grid[nr][nc] == 1:
                            found.append((nr, nc))
            return found

        def maze(grid, start, end):
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                if (r, c) == end:
                    return dist[end]
                for spot in land_next_to(grid, r, c):
                    if spot not in dist:
                        dist[spot] = dist[(r, c)] + 1
                        queue.append(spot)
            return -1

        grid = [
            [1, 1, 1, 1],
            [0, 1, 0, 1],
            [0, 1, 1, 1],
            [1, 0, 0, 1],
        ]
        print(maze(grid, (0, 0), (3, 3)))
        print(maze(grid, (0, 0), (3, 0)))
      `,
    },
    { t: 'q', id: 'count-grid', type: 'mcq', level: 2,
      q: 'Count by hand. A grid has 2 rows and 3 columns, and it is all land. Each cell leaves the queue once, and looks in 4 directions. How many looks is that?',
      options: [
        { text: '6', why: 'That is one look per cell. Each cell looks 4 ways, even if some go off the grid.' },
        '24',
        { text: '36', why: 'That is 6 x 6, as if each cell looks at every cell. It only looks 4 ways.' },
      ],
      answer: 1,
      explain: '2 x 3 is 6 cells, and 6 x 4 is 24 looks.',
      hints: ['How many cells are there?', 'Then times that by 4.'],
    },
    { t: 'cost', title: 'How much does a grid search cost? R is rows, C is columns.', items: [
      { op: 'Time to fill or search', cost: 'O(R x C)', why: 'Each cell runs once, and each makes 4 looks, as you counted. Set checks are O(1) on average.' },
      { op: 'Memory', cost: 'O(R x C)', why: 'The visited set can hold every cell.' },
    ] },

    { t: 'h', text: 'How many islands are there?' },
    { t: 'p', text: 'Scan each cell, in order. When you find land with no mark, you have found a new island. Add 1 to the count, then flood fill that island. Now the scan never counts it again.' },
    { t: 'tip', title: 'A short way to add', text: '`count += 1` means the same as `count = count + 1`. Python works out the new value, then moves the name to it. `-=` takes away in the same way.' },
    { t: 'viz', name: 'm21-islands', caption: 'Predict the count first. Try cells that touch only at a corner. Try all land, and try all water.' },
    { t: 'code', caption: 'Change one 0 to a 1, so 2 islands join up. Guess the count first.',
      output: '3',
      code: py`
        grid = [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 1],
            [0, 1, 0, 0],
        ]
        seen = set()

        def fill(r, c):
            if r < 0 or c < 0:
                return
            if r >= len(grid) or c >= len(grid[0]):
                return
            if grid[r][c] == 0 or (r, c) in seen:
                return
            seen.add((r, c))
            fill(r - 1, c)
            fill(r + 1, c)
            fill(r, c - 1)
            fill(r, c + 1)

        count = 0
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == 1:
                    if (r, c) not in seen:
                        count += 1
                        fill(r, c)
        print(count)
      `,
    },
    { t: 'q', id: 'islands-fill', type: 'fill', level: 2,
      q: 'Fill the gaps, so a new island adds 1 to the count, and then gets marked.',
      code: py`
        grid = [[1, 0, 1]]
        seen = set()

        def fill(r, c):
            if c < 0 or c >= 3 or grid[r][c] == 0 or (r, c) in seen:
                return
            seen.add((r, c))
            fill(r, c - 1)
            fill(r, c + 1)

        count = 0
        for c in range(3):
            if grid[0][c] == 1 and (0, c) not in ____:
                count += 1
                ____(0, c)
        print(count)
      `,
      blanks: ['seen', 'fill'],
      output: '2',
      explain: 'Skip land that is already marked. For new land, add 1 and then mark the whole island.',
      hints: ['Which set holds the marks?', 'Which function marks a whole island?'],
    },
    { t: 'table', caption: 'How to spot a grid search', head: ['If the problem says...', 'Think of...'], rows: [
      ['"islands", "regions", "areas"', 'Scan, then fill each new one'],
      ['"fill", "spread", "paint"', 'Flood fill, with DFS or BFS'],
      ['"fewest moves through a maze"', 'BFS'],
      ['"how many minutes until it spreads"', 'BFS from many starts at once'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'Try an empty grid, 1 cell, all water and all land. Try a start on water. On a big grid of land, recursion can hit its limit. BFS or a list stack is safer there.' },
  ],
  recap: [
    'You can find the cells next to a cell, safely.',
    'You can fill an area with DFS or BFS.',
    'You can count islands by scanning and filling.',
  ],
  practice: [
    { id: 'diag', type: 'mcq', level: 1,
      q: 'In this grid, the 1s touch only at a corner. With up, down, left and right moves, how many [[islands|island]] are there? The rows are `[1, 0]` and `[0, 1]`.',
      options: [
        '2',
        { text: '1', why: 'That counts a corner as joined. With only 4 moves, you cannot step across a corner.' },
        { text: '4', why: 'That counts every cell. A 0 is water, so it is not an island.' },
      ],
      answer: 0,
      explain: 'The 2 land cells are not joined by any of the 4 moves. So each one is its own island.',
      hints: ['Can you step from (0, 0) to (1, 1) with one of the 4 moves?'],
    },
    { id: 'predict-count', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        grid = [[1, 1],
                [0, 1]]
        total = 0
        r = 0
        c = 1
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr = r + dr
            nc = c + dc
            if 0 <= nr < 2 and 0 <= nc < 2:
                total += grid[nr][nc]
        print(total)
      `,
      answer: '2',
      why: 'From (0, 1), up and right go off the grid. Down and left both hold a 1.',
      explain: 'The cell (1, 1) holds 1, and the cell (0, 0) holds 1. So the total is 2.',
      hints: ['Which 2 of the moves stay on the grid?'],
    },
    { id: 'fix-bounds', type: 'fix', level: 2,
      q: '`count_land(grid, r, c)` should count land next to a cell. It gets the corner wrong, because a -1 index wraps around. Fix the check.',
      code: 'def count_land(grid, r, c):\n    total = 0\n    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n        nr = r + dr\n        nc = c + dc\n        if nr < len(grid) and nc < len(grid[0]):\n            total += grid[nr][nc]\n    return total\n',
      answer: 'def count_land(grid, r, c):\n    total = 0\n    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n        nr = r + dr\n        nc = c + dc\n        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):\n            total += grid[nr][nc]\n    return total\n',
      tests: [
        { label: 'The top left corner has 0 land next to it', call: 'count_land([[1, 0], [0, 1]], 0, 0)', want: '0' },
        { label: 'A middle cell has 4', call: 'count_land([[0, 1, 0], [1, 0, 1], [0, 1, 0]], 1, 1)', want: '4' },
        { label: 'A 1 by 1 grid has none', call: 'count_land([[1]], 0, 0)', want: '0' },
      ],
      explain: 'The old check let -1 through. `0 <= nr` and `0 <= nc` keep the search on the grid.',
      hints: ['What happens to `nr` when `r` is 0 and `dr` is -1?', 'Write `0 <= nr < len(grid)`.'],
    },
    { id: 'write-flood', type: 'write', level: 2,
      q: 'Write `paint(grid, r, c, new)`. It changes the cell at `(r, c)` and all joined cells of the same value to `new`. Then it returns the grid.',
      starter: 'def paint(grid, r, c, new):\n    # Your code here\n    return grid\n',
      answer: 'def paint(grid, r, c, new):\n    old = grid[r][c]\n    if old == new:\n        return grid\n    spread(grid, r, c, old, new)\n    return grid\n\ndef spread(grid, r, c, old, new):\n    if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]):\n        return\n    if grid[r][c] != old:\n        return\n    grid[r][c] = new\n    spread(grid, r - 1, c, old, new)\n    spread(grid, r + 1, c, old, new)\n    spread(grid, r, c - 1, old, new)\n    spread(grid, r, c + 1, old, new)\n',
      tests: [
        { label: 'It fills the joined area', call: 'paint([[1, 1, 0], [0, 1, 0]], 0, 0, 5)', want: '[[5, 5, 0], [0, 5, 0]]' },
        { label: 'It stops at other values', call: 'paint([[1, 0, 1]], 0, 0, 7)', want: '[[7, 0, 1]]' },
        { label: 'The same colour changes nothing', call: 'paint([[2, 2]], 0, 0, 2)', want: '[[2, 2]]' },
        { label: 'One cell works', call: 'paint([[3]], 0, 0, 4)', want: '[[4]]' },
      ],
      explain: 'A painted cell no longer holds the old value, so it acts as its own mark. If old equals new, return early, or the search never ends.',
      hints: ['Save the old value first.', 'Write a helper function that calls itself 4 times.', 'What if the new value is the same as the old value?'],
    },
    { id: 'write-islands', type: 'write', level: 2,
      q: 'Write `count_islands(grid)`. In the grid, 1 is land and 0 is water. An empty grid has 0 islands.',
      starter: 'def count_islands(grid):\n    # Your code here\n    return -1\n',
      answer: 'def fill(grid, r, c, seen):\n    if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]):\n        return\n    if grid[r][c] == 0 or (r, c) in seen:\n        return\n    seen.add((r, c))\n    fill(grid, r - 1, c, seen)\n    fill(grid, r + 1, c, seen)\n    fill(grid, r, c - 1, seen)\n    fill(grid, r, c + 1, seen)\n\ndef count_islands(grid):\n    seen = set()\n    count = 0\n    for r in range(len(grid)):\n        for c in range(len(grid[r])):\n            if grid[r][c] == 1 and (r, c) not in seen:\n                count += 1\n                fill(grid, r, c, seen)\n    return count\n',
      tests: [
        { label: '3 islands', call: 'count_islands([[1, 1, 0], [0, 0, 1], [1, 0, 1]])', want: '3' },
        { label: 'Corners do not join', call: 'count_islands([[1, 0], [0, 1]])', want: '2' },
        { label: 'All water gives 0', call: 'count_islands([[0, 0], [0, 0]])', want: '0' },
        { label: 'An empty grid gives 0', call: 'count_islands([])', want: '0' },
        { label: 'All land is 1 island', call: 'count_islands([[1, 1], [1, 1]])', want: '1' },
      ],
      explain: 'Each land cell with no mark starts a new island. The fill marks the rest of it, so it never counts twice.',
      hints: ['Write `fill(grid, r, c, seen)` first.', 'Loop over each row and column.', 'Count only land that is not in `seen`.'],
    },
    { id: 'write-spread', type: 'write', level: 3,
      q: 'Stretch: 2 is a sick plant, 1 is healthy and 0 is empty. Each minute, sickness spreads to healthy plants up, down, left and right. Write `minutes(grid)`. It returns the minutes until all plants are sick, or -1 if some never get sick.',
      starter: 'from collections import deque\n\ndef minutes(grid):\n    # Your code here\n    return 0\n',
      answer: 'from collections import deque\n\ndef minutes(grid):\n    queue = deque()\n    healthy = 0\n    for r in range(len(grid)):\n        for c in range(len(grid[r])):\n            if grid[r][c] == 2:\n                queue.append((r, c, 0))\n            elif grid[r][c] == 1:\n                healthy += 1\n    most = 0\n    while len(queue) > 0:\n        r, c, t = queue.popleft()\n        most = max(most, t)\n        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n            nr = r + dr\n            nc = c + dc\n            if 0 <= nr < len(grid) and 0 <= nc < len(grid[nr]):\n                if grid[nr][nc] == 1:\n                    grid[nr][nc] = 2\n                    healthy -= 1\n                    queue.append((nr, nc, t + 1))\n    if healthy > 0:\n        return -1\n    return most\n',
      tests: [
        { label: 'A row of 3 takes 2 minutes', call: 'minutes([[2, 1, 1]])', want: '2' },
        { label: '2 sick plants spread together', call: 'minutes([[2, 1, 1, 2]])', want: '1' },
        { label: 'A gap keeps a plant safe', call: 'minutes([[2, 0, 1]])', want: '-1' },
        { label: 'No healthy plants takes 0', call: 'minutes([[2, 0], [0, 2]])', want: '0' },
        { label: 'No plants at all takes 0', call: 'minutes([[0]])', want: '0' },
      ],
      explain: 'Put all the sick plants in the queue at the start, with time 0. BFS then spreads from all of them together, in layers.',
      hints: ['Start the queue with every sick plant.', 'Keep the time with each cell, like `(r, c, t)`.', 'Count the healthy plants, and check at the end.'],
    },
  ],
});

/* ------------------------------------------------------------------ 21.5 */
Course.lesson('m21-graphs', {
  id: '21-5-components-cycles',
  num: '21.5',
  title: 'Separate groups, and finding cycles',
  goal: 'You can count the separate groups in a graph, and check a graph for a cycle.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How many separate groups are there?' },
    { t: 'p', text: 'A class has 6 children. Some know each other. Some know nobody. You want to know how many friend groups there are.' },
    { t: 'q', id: 'spark-groups', type: 'mcq', level: 1,
      q: 'Edges: A to B, B to C, and D to E. Node F has no edges. How many separate groups are there?',
      options: [
        '3',
        { text: '2', why: 'That leaves out F. A node on its own is a group of 1.' },
        { text: '6', why: 'That counts each node. A, B and C are all joined, so they make 1 group.' },
      ],
      answer: 0,
      explain: 'The groups are A, B and C, then D and E, then F on its own.',
      hints: ['Which nodes can reach each other?'],
    },
    { t: 'words', items: [
      { word: 'connected component', say: 'kuh-NEK-tid kum-POH-nunt', means: 'A group of nodes that can all reach each other, with no edge to anyone outside.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Think of friend groups at school. Ask one child to pass a note on. The note reaches their whole group, and nobody else. Unlike real groups, a node is only ever in one [[connected component]].' },
    { t: 'viz', name: 'm21-components', caption: 'Say when a new group starts. Then try no edges, one node, and no nodes.' },
    { t: 'big', text: 'One search finds one whole group. So loop over every node, and start a search from each node with no mark.' },
    { t: 'code', caption: 'Add an edge between C and D, and guess the count. Then remove F from the dict.',
      output: '3',
      code: py`
        graph = {
            "A": ["B"],
            "B": ["A", "C"],
            "C": ["B"],
            "D": ["E"],
            "E": ["D"],
            "F": [],
        }

        def spread(graph, node, visited):
            visited.add(node)
            for other in graph[node]:
                if other not in visited:
                    spread(graph, other, visited)

        count = 0
        visited = set()
        for node in graph:
            if node not in visited:
                count += 1
                spread(graph, node, visited)
        print(count)
      `,
    },
    { t: 'q', id: 'count-steps-groups', type: 'mcq', level: 2,
      q: 'Count by hand. In the code above, how many times does `spread` run in all? Remember that the graph has 6 nodes.',
      options: [
        '6',
        { text: '3', why: 'That counts only the calls from the main loop. `spread` also calls itself for each new node.' },
        { text: '36', why: 'That is 6 x 6, as if each group search starts over. Marks stop any node from running twice.' },
      ],
      answer: 0,
      explain: 'Each node gets marked once, and `spread` runs once for each mark. Together, all the searches cost the same as one.',
      hints: ['How many times can one node be marked?'],
    },
    { t: 'cost', title: 'How much does it cost? V is nodes, E is edges.', items: [
      { op: 'Count the groups', cost: 'O(V + E)', why: 'The marks are shared. Each node runs once and each list entry is read once. Set checks are O(1) on average.' },
      { op: 'Check for a cycle', cost: 'O(V + E)', why: 'It is the same search, with one extra check for each neighbour.' },
    ] },

    { t: 'h', text: 'How do you find a cycle on two-way edges?' },
    { t: 'p', text: 'While you search, you may see a neighbour with a mark. That usually means a second way to reach it, so there is a [[cycle]]. There is one catch: the node you came from also has a mark.' },
    { t: 'viz', name: 'm21-cycle-two-way', caption: 'Guess each time. Then try a straight line, one edge, and a cycle in the second group.' },
    { t: 'code', caption: 'Remove "D" from the list for B, and "B" from the list for D. Is there still a cycle?',
      output: 'True',
      code: py`
        graph = {
            "A": ["B"],
            "B": ["A", "C", "D"],
            "C": ["B", "D"],
            "D": ["B", "C"],
        }
        visited = set()

        def check(node, came):
            visited.add(node)
            for other in graph[node]:
                if other == came:
                    continue
                if other in visited:
                    return True
                if check(other, node):
                    return True
            return False

        print(check("A", None))
      `,
    },
    { t: 'q', id: 'why-parent', type: 'mcq', level: 2,
      q: 'Why does `check` skip the node it came from?',
      options: [
        'A two-way edge is in both lists. Going back uses the same edge, so it is no cycle.',
        { text: 'That node has no neighbours.', why: 'It has at least this node as a neighbour. It gets skipped because you came along that same edge.' },
        { text: 'It makes the search faster.', why: 'Speed is not the reason. Without the skip, the check says True for a plain line of 2 nodes.' },
      ],
      answer: 0,
      explain: 'B is in the list for A, and A is in the list for B. Without the skip, every edge would look like a cycle.',
      hints: ['What does a graph with only 1 edge look like in the dict?'],
    },

    { t: 'h', text: 'Why are arrows different?' },
    { t: 'p', text: 'With arrows, 2 paths can meet at one node with no loop at all. So a mark alone proves nothing. You also need to know which nodes are on the path you are walking right now.' },
    { t: 'viz', name: 'm21-cycle-arrows', caption: 'The first graph has no cycle, even though D gets reached twice. Then add D>A, and run it again.' },
    { t: 'trap', think: 'if I reach a node with a mark, there must be a cycle.',
      real: 'That is true on two-way edges, once you skip the node you came from. With arrows, it can be false: A>B, A>C, B>D and C>D reach D twice, with no loop.',
    },
    { t: 'table', caption: 'Which check do you use?', head: ['Graph', 'Cycle when you see...'], rows: [
      ['Two-way edges', 'A marked node that is not where you came from'],
      ['One-way arrows', 'A node that is on your current path'],
    ] },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"separate groups", "how many networks"', 'Count the components'],
      ['"are they all joined up?"', 'The answer is yes if the count is 1'],
      ['"loop", "goes round", "stuck waiting"', 'Check for a cycle'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'A graph with no nodes has 0 groups. Each lone node is a group. Search from every node, because a cycle can hide in another group.' },
  ],
  recap: [
    'You can count groups with a loop and a search.',
    'You can find a cycle on two-way edges.',
    'You can find a cycle on one-way arrows.',
  ],
  practice: [
    { id: 'lone-nodes', type: 'mcq', level: 1,
      q: 'A graph has 4 nodes and no edges. How many [[connected components|connected component]] does it have?',
      options: [
        '4',
        { text: '0', why: 'That thinks a group needs an edge. A lone node is a group of 1.' },
        { text: '1', why: 'That thinks all the nodes belong together. With no edges, no node can reach another.' },
      ],
      answer: 0,
      explain: 'No node can reach any other. So each one is its own group.',
      hints: ['Can A reach B?'],
    },
    { id: 'predict-loop', type: 'predict', level: 2,
      q: 'What will the screen show? Type it.',
      code: py`
        graph = {"A": ["B"], "B": ["A"], "C": ["D"], "D": ["C"]}
        visited = set()

        def spread(node):
            visited.add(node)
            for other in graph[node]:
                if other not in visited:
                    spread(other)

        starts = []
        for node in graph:
            if node not in visited:
                starts.append(node)
                spread(node)
        print(starts)
      `,
      answer: "['A', 'C']",
      why: 'A marks B, so B starts nothing. C is the next node with no mark.',
      explain: 'Each group gets one start. `spread("A")` marks A and B. `spread("C")` marks C and D.',
      hints: ['Which nodes get marked by `spread("A")`?'],
    },
    { id: 'fix-one-start', type: 'fix', level: 2,
      q: '`count_groups(graph)` should count every group. It always gives 1, because the search only starts once. Fix the loop.',
      code: 'def spread(graph, node, visited):\n    visited.add(node)\n    for other in graph[node]:\n        if other not in visited:\n            spread(graph, other, visited)\n\ndef count_groups(graph):\n    visited = set()\n    count = 0\n    for node in graph:\n        if node not in visited:\n            count += 1\n            spread(graph, node, visited)\n            return count\n    return count\n',
      answer: 'def spread(graph, node, visited):\n    visited.add(node)\n    for other in graph[node]:\n        if other not in visited:\n            spread(graph, other, visited)\n\ndef count_groups(graph):\n    visited = set()\n    count = 0\n    for node in graph:\n        if node not in visited:\n            count += 1\n            spread(graph, node, visited)\n    return count\n',
      tests: [
        { label: '2 groups give 2', call: 'count_groups({"A": ["B"], "B": ["A"], "C": []})', want: '2' },
        { label: '3 lone nodes give 3', call: 'count_groups({"A": [], "B": [], "C": []})', want: '3' },
        { label: 'No nodes give 0', call: 'count_groups({})', want: '0' },
      ],
      explain: 'The `return` inside the loop ended the function after the first group. It belongs after the loop.',
      hints: ['How many times does the `for` loop get to run?', 'Move a `return` out of the loop.'],
    },
    { id: 'write-biggest', type: 'write', level: 2,
      q: 'Write `biggest_group(graph)`. It returns how many nodes are in the largest [[connected component]]. With no nodes, it returns 0.',
      starter: 'def biggest_group(graph):\n    # Your code here\n    return -1\n',
      answer: 'def spread(graph, node, visited):\n    visited.add(node)\n    for other in graph[node]:\n        if other not in visited:\n            spread(graph, other, visited)\n\ndef biggest_group(graph):\n    visited = set()\n    best = 0\n    for node in graph:\n        if node not in visited:\n            before = len(visited)\n            spread(graph, node, visited)\n            best = max(best, len(visited) - before)\n    return best\n',
      tests: [
        { label: 'Groups of 3 and 1', call: 'biggest_group({"A": ["B"], "B": ["A", "C"], "C": ["B"], "D": []})', want: '3' },
        { label: 'Lone nodes give 1', call: 'biggest_group({"A": [], "B": []})', want: '1' },
        { label: 'No nodes give 0', call: 'biggest_group({})', want: '0' },
      ],
      explain: 'The size of `visited` grows by the size of the group. So measure it before and after each search.',
      hints: ['Write the `spread` function first.', 'Save `len(visited)` before each search.', 'Keep the biggest growth you see.'],
    },
    { id: 'write-cycle', type: 'write', level: 2,
      q: 'Write `has_cycle(graph)` for two-way edges. It returns `True` if any group has a [[cycle]]. A helper `check` is a good idea.',
      starter: 'def has_cycle(graph):\n    # Your code here\n    return None\n',
      answer: 'def check(graph, node, came, visited):\n    visited.add(node)\n    for other in graph[node]:\n        if other == came:\n            continue\n        if other in visited:\n            return True\n        if check(graph, other, node, visited):\n            return True\n    return False\n\ndef has_cycle(graph):\n    visited = set()\n    for node in graph:\n        if node not in visited:\n            if check(graph, node, None, visited):\n                return True\n    return False\n',
      tests: [
        { label: 'A triangle has a cycle', call: 'has_cycle({"A": ["B", "C"], "B": ["A", "C"], "C": ["A", "B"]})', want: 'True' },
        { label: 'A line has none', call: 'has_cycle({"A": ["B"], "B": ["A", "C"], "C": ["B"]})', want: 'False' },
        { label: 'A cycle in the second group counts', call: 'has_cycle({"X": [], "A": ["B", "C"], "B": ["A", "C"], "C": ["A", "B"]})', want: 'True' },
        { label: 'No nodes means no cycle', call: 'has_cycle({})', want: 'False' },
      ],
      explain: 'Skip the node you came from. Any other marked neighbour means a cycle. Loop over all nodes, to cover every group.',
      hints: ['Give `check` 4 inputs: graph, node, came and visited.', 'Use `if other == came:` then `continue`.', 'Call `check` from a loop over every node.'],
    },
    { id: 'write-cycle-arrows', type: 'write', level: 3,
      q: 'Stretch: write `arrow_cycle(graph)` for one-way arrows. It returns `True` if the arrows make a [[cycle]] anywhere.',
      starter: 'def arrow_cycle(graph):\n    # Your code here\n    return None\n',
      answer: 'def check(graph, node, visited, on_path):\n    visited.add(node)\n    on_path.add(node)\n    for other in graph[node]:\n        if other in on_path:\n            return True\n        if other not in visited:\n            if check(graph, other, visited, on_path):\n                return True\n    on_path.remove(node)\n    return False\n\ndef arrow_cycle(graph):\n    visited = set()\n    on_path = set()\n    for node in graph:\n        if node not in visited:\n            if check(graph, node, visited, on_path):\n                return True\n    return False\n',
      tests: [
        { label: 'A ring has a cycle', call: 'arrow_cycle({"A": ["B"], "B": ["C"], "C": ["A"]})', want: 'True' },
        { label: 'A diamond has none', call: 'arrow_cycle({"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []})', want: 'False' },
        { label: '2 arrows between 2 nodes make one', call: 'arrow_cycle({"A": ["B"], "B": ["A"]})', want: 'True' },
        { label: 'An arrow to itself is a cycle', call: 'arrow_cycle({"A": ["A"]})', want: 'True' },
        { label: 'A second group is checked too', call: 'arrow_cycle({"A": [], "B": ["C"], "C": ["B"]})', want: 'True' },
      ],
      explain: 'A node joins `on_path` when its call starts, and leaves when its call ends. Reaching a node on the path means you went round.',
      hints: ['Use 2 sets: `visited` and `on_path`.', 'Remove the node from `on_path` before you return False.'],
    },
  ],
});

/* ------------------------------------------------------------------ 21.6 */
Course.lesson('m21-graphs', {
  id: '21-6-topological-sort',
  num: '21.6',
  title: 'Topological sort: an order that obeys the rules',
  goal: 'You can order jobs so every rule holds, or show that no order works.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What must come first?' },
    { t: 'p', text: 'Socks go on before shoes. Pants go on before shoes. Draw each rule as an arrow. It goes from the first job to the job that waits.' },
    { t: 'q', id: 'spark-dress', type: 'mcq', level: 1,
      q: 'Rules: socks before shoes, and pants before shoes. Which order breaks a rule?',
      options: [
        'socks, shoes, pants',
        { text: 'socks, pants, shoes', why: 'This one is fine. Shoes come after both socks and pants.' },
        { text: 'pants, socks, shoes', why: 'This one is fine too. The rules never say which of socks or pants comes first.' },
      ],
      answer: 0,
      explain: 'Shoes come before pants here, and the rule says pants come first.',
      hints: ['Check each rule against each order.'],
    },
    { t: 'words', items: [
      { word: 'in-degree', say: 'in dih-GREE', means: 'How many arrows point at a node. Here, it is how many jobs must finish first.' },
      { word: 'topological order', say: 'top-uh-LOJ-ih-kul', means: 'A list of jobs where every job comes after the jobs it needs.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Getting dressed has rules, like socks before shoes. Any job with nothing left to wait for can go next. Unlike getting dressed, some sets of rules can never work.' },
    { t: 'viz', name: 'm21-topo', caption: 'Guess at each step. Then pick "Rules that clash". Then type your own arrows, and try a job on its own.' },
    { t: 'big', text: 'Do any job with [[in-degree]] 0. Then cross out its arrows. If jobs are left and none has 0, there is a [[cycle]].' },
    { t: 'steps', title: 'Find the order', items: [
      { label: 'Count the arrows in', text: 'Each job gets a count of the arrows pointing at it.', code: 'need[later] += 1' },
      { label: 'Queue the free jobs', text: 'A count of 0 means nothing has to come first.', code: 'if need[job] == 0:\n    queue.append(job)' },
      { label: 'Do a job, and lower the counts', text: 'Take a job from the queue. Each job after it now waits for one less. `-=` takes away, as `+=` adds.', code: 'need[later] -= 1' },
      { label: 'Compare the lengths', text: 'If the order is shorter than the list of jobs, a cycle stopped you.', code: 'len(order) < len(graph)' },
    ] },
    { t: 'code', caption: 'Each list holds the jobs that come after a job. Add a rule, like coat before socks, and guess first.',
      output: "['socks', 'pants', 'shirt', 'shoes', 'belt', 'coat']",
      code: py`
        from collections import deque

        def topo(graph):
            need = {}
            for job in graph:
                need[job] = 0
            for job in graph:
                for later in graph[job]:
                    need[later] += 1
            queue = deque()
            for job in graph:
                if need[job] == 0:
                    queue.append(job)
            order = []
            while len(queue) > 0:
                job = queue.popleft()
                order.append(job)
                for later in graph[job]:
                    need[later] -= 1
                    if need[later] == 0:
                        queue.append(later)
            if len(order) < len(graph):
                return None
            return order

        graph = {
            "socks": ["shoes"],
            "pants": ["shoes", "belt"],
            "shirt": ["belt", "coat"],
            "shoes": [],
            "belt": ["coat"],
            "coat": [],
        }
        print(topo(graph))
      `,
    },
    { t: 'q', id: 'count-in', type: 'trace', level: 2,
      q: 'Fill in the [[in-degree]] of each job. The arrows are in the code. Count the arrows that point at each job.',
      code: py`
        graph = {"A": ["C"], "B": ["C", "D"], "C": ["D"], "D": []}
      `,
      head: ['job', 'in_degree'],
      rows: [
        ['A', '0'],
        ['B', '0'],
        ['C', '2'],
        ['D', '2'],
      ],
      given: 1,
      verify: py`
        graph = {"A": ["C"], "B": ["C", "D"], "C": ["D"], "D": []}
        need = {}
        for job in graph:
            need[job] = 0
        for job in graph:
            for later in graph[job]:
                need[later] += 1
        for job in graph:
            print(job, need[job])
      `,
      explain: 'A and B appear in no list. C is in 2 lists, and so is D.',
      hints: ['Look for each job inside the lists, not as a key.'],
    },
    { t: 'q', id: 'count-steps-topo', type: 'mcq', level: 2,
      q: 'Count by hand. This graph has 4 jobs and 4 arrows. How many times does `need[later] -= 1` run?',
      options: [
        { text: '16', why: 'That is 4 x 4. The line runs once for each arrow, not for each pair of jobs.' },
        '4',
        { text: '2', why: 'That counts only jobs with arrows coming in. Each arrow lowers a count once.' },
      ],
      answer: 1,
      explain: 'Each job leaves the queue once. So each arrow gets used once, and there are 4 of them.',
      hints: ['How many times does each arrow get crossed out?'],
    },
    { t: 'cost', title: 'How fast is it? V is jobs, E is arrows.', items: [
      { op: 'Time for topological sort', cost: 'O(V + E)', why: 'Each job enters the queue once. Each arrow is used once, as you counted. Dict lookups are O(1) on average.' },
      { op: 'Memory', cost: 'O(V)', why: 'The counts, queue and order each hold each job at most once.' },
    ] },

    { t: 'h', text: 'What if the rules make a loop?' },
    { t: 'p', text: 'Say a coat needs a shirt, and a shirt needs a coat. Each one waits for the other, so neither can go first. No order works.' },
    { t: 'q', id: 'predict-clash', type: 'predict', level: 2,
      q: 'A needs B, and B needs A. C has no rules. What will the screen show?',
      code: py`
        from collections import deque

        graph = {"A": ["B"], "B": ["A"], "C": []}
        need = {"A": 1, "B": 1, "C": 0}
        queue = deque(["C"])
        order = []
        while len(queue) > 0:
            job = queue.popleft()
            order.append(job)
            for later in graph[job]:
                need[later] -= 1
                if need[later] == 0:
                    queue.append(later)
        print(order)
        print(len(order) < len(graph))
      `,
      options: [
        "['C']\nTrue",
        { text: "['C', 'A', 'B']\nFalse", why: 'That thinks A or B can start. Each one still needs the other, so neither count reaches 0.' },
        { text: "[]\nTrue", why: 'C has no rules, so it can go. Only A and B are stuck.' },
      ],
      answer: 0,
      explain: 'Only C ever has a count of 0. The order has 1 job out of 3, and that gap shows the [[cycle]].',
      hints: ['Which job starts in the queue?', 'Does the count for A ever reach 0?'],
    },
    { t: 'code', caption: 'Coat needs a shirt, and shirt needs a coat. Hat has no rules. Delete one arrow from the loop, and run it again.',
      output: "['hat']\nNo order works.",
      code: py`
        from collections import deque

        graph = {
            "coat": ["shirt"],
            "shirt": ["coat"],
            "hat": [],
        }
        need = {}
        for job in graph:
            need[job] = 0
        for job in graph:
            for later in graph[job]:
                need[later] += 1
        queue = deque()
        for job in graph:
            if need[job] == 0:
                queue.append(job)
        order = []
        while len(queue) > 0:
            job = queue.popleft()
            order.append(job)
            for later in graph[job]:
                need[later] -= 1
                if need[later] == 0:
                    queue.append(later)
        print(order)
        if len(order) < len(graph):
            print("No order works.")
      `,
    },
    { t: 'trap', think: 'topological sort gives an order for any graph with arrows.',
      real: 'It works only if the arrows have no cycle. On a cycle, the queue empties early. Always compare the length of the order with the number of jobs.',
      code: 'if len(order) < len(graph):\n    return None',
    },
    { t: 'q', id: 'many-answers', type: 'mcq', level: 2,
      q: 'Rules: A before C, and B before C. Your code gives A, B, C. Your friend gets B, A, C. Who is right?',
      options: [
        'Both are right.',
        { text: 'Only A, B, C is right.', why: 'That thinks a sort has only one answer. The rules say nothing about A and B, so either can go first.' },
        { text: 'Neither is right.', why: 'Both lists put C after A and after B. So both obey every rule.' },
      ],
      answer: 0,
      explain: 'A graph can have many right orders. To test one, check that every rule holds.',
      hints: ['Do the rules say anything about A and B?'],
    },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"prerequisites", "must come before"', 'Topological sort'],
      ['"order of tasks", "build order"', 'Topological sort'],
      ['"can you finish them all?"', 'Check for a cycle, by comparing lengths'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'With no jobs, the order is empty. With no rules, any order works. A job that needs itself is a cycle. The same rule written twice counts twice, and also comes off twice, so it stays safe.' },
  ],
  recap: [
    'You can work out the in-degree of each job.',
    'You can build an order with a queue.',
    'You can spot a cycle from a short order.',
  ],
  practice: [
    { id: 'match-terms', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[in-degree]]', 'How many arrows point at a node'],
        ['[[topological order]]', 'Each job comes after the jobs it needs'],
        ['[[cycle]]', 'Arrows that lead back to where they started'],
      ],
      explain: 'The in-degree counts the waits. A topological order obeys every rule. A cycle makes that order impossible.',
      hints: ['Which word has "in" in it?'],
    },
    { id: 'which-first', type: 'mcq', level: 1,
      q: 'Rules: wash before dry, dry before fold. Which job has an [[in-degree]] of 0?',
      options: [
        'wash',
        { text: 'dry', why: 'One arrow points at dry, from wash. So it has to wait.' },
        { text: 'fold', why: 'That has it the wrong way round. Fold waits for dry, so it has an arrow in.' },
      ],
      answer: 0,
      explain: 'No rule makes wash wait for anything. So wash can go first.',
      hints: ['Which job has no arrow pointing at it?'],
    },
    { id: 'fill-topo', type: 'fill', level: 2,
      q: 'Fill the gaps. When a job is done, each later job waits for one less. At 0, that job joins the queue.',
      code: py`
        from collections import deque

        graph = {"a": ["b"], "b": []}
        need = {"a": 0, "b": 1}
        queue = deque(["a"])
        order = []
        while len(queue) > 0:
            job = queue.popleft()
            order.append(job)
            for later in graph[job]:
                need[later] ____ 1
                if need[later] == ____:
                    queue.append(later)
        print(order)
      `,
      blanks: ['-=', '0'],
      output: "['a', 'b']",
      explain: 'Lower the count by 1. A count of 0 means nothing is left to wait for.',
      hints: ['Does the count go up or down?', 'What count means "ready"?'],
    },
    { id: 'fix-no-check', type: 'fix', level: 2,
      q: '`topo` should return `None` when no order works. On a cycle, it gives back a short list. Add the missing check.',
      code: 'from collections import deque\n\ndef topo(graph):\n    need = {}\n    for job in graph:\n        need[job] = 0\n    for job in graph:\n        for later in graph[job]:\n            need[later] += 1\n    queue = deque()\n    for job in graph:\n        if need[job] == 0:\n            queue.append(job)\n    order = []\n    while len(queue) > 0:\n        job = queue.popleft()\n        order.append(job)\n        for later in graph[job]:\n            need[later] -= 1\n            if need[later] == 0:\n                queue.append(later)\n    return order\n',
      answer: 'from collections import deque\n\ndef topo(graph):\n    need = {}\n    for job in graph:\n        need[job] = 0\n    for job in graph:\n        for later in graph[job]:\n            need[later] += 1\n    queue = deque()\n    for job in graph:\n        if need[job] == 0:\n            queue.append(job)\n    order = []\n    while len(queue) > 0:\n        job = queue.popleft()\n        order.append(job)\n        for later in graph[job]:\n            need[later] -= 1\n            if need[later] == 0:\n                queue.append(later)\n    if len(order) < len(graph):\n        return None\n    return order\n',
      tests: [
        { label: 'A cycle gives None', call: 'topo({"A": ["B"], "B": ["A"]})', want: 'None' },
        { label: 'Part of a cycle gives None', call: 'topo({"X": [], "A": ["B"], "B": ["A"]})', want: 'None' },
        { label: 'A good plan gives its order', call: 'topo({"A": ["B"], "B": []})', want: '["A", "B"]' },
        { label: 'No jobs gives an empty order', call: 'topo({})', want: '[]' },
      ],
      explain: 'A short order means some jobs never reached 0. Those jobs are stuck on a cycle.',
      hints: ['Compare `len(order)` with `len(graph)`.', 'Do it after the loop, before the last return.'],
    },
    { id: 'write-finish', type: 'write', level: 2,
      q: 'Write `can_finish(courses, rules)`. `courses` is a list of names. Each rule `(a, b)` means take `a` before `b`. Return `True` if you can take them all.',
      starter: 'from collections import deque\n\ndef can_finish(courses, rules):\n    # Your code here\n    return None\n',
      answer: 'from collections import deque\n\ndef can_finish(courses, rules):\n    graph = {}\n    need = {}\n    for c in courses:\n        graph[c] = []\n        need[c] = 0\n    for a, b in rules:\n        graph[a].append(b)\n        need[b] += 1\n    queue = deque()\n    for c in courses:\n        if need[c] == 0:\n            queue.append(c)\n    done = 0\n    while len(queue) > 0:\n        c = queue.popleft()\n        done += 1\n        for later in graph[c]:\n            need[later] -= 1\n            if need[later] == 0:\n                queue.append(later)\n    return done == len(courses)\n',
      tests: [
        { label: 'A chain works', call: 'can_finish(["art", "bio", "cook"], [("art", "bio"), ("bio", "cook")])', want: 'True' },
        { label: 'A loop of 2 fails', call: 'can_finish(["art", "bio"], [("art", "bio"), ("bio", "art")])', want: 'False' },
        { label: 'No rules works', call: 'can_finish(["art", "bio"], [])', want: 'True' },
        { label: 'No courses works', call: 'can_finish([], [])', want: 'True' },
        { label: 'A course that needs itself fails', call: 'can_finish(["art"], [("art", "art")])', want: 'False' },
      ],
      explain: 'Build the graph and the counts from the rules. Then run the queue, and see if every course got done.',
      hints: ['Make `graph` and `need` from the list of courses first.', 'For each rule, append and add 1.', 'Return `done == len(courses)`.'],
    },
    { id: 'write-valid', type: 'write', level: 2,
      q: 'Write `obeys(order, rules)`. Each rule `(a, b)` means `a` comes before `b`. Return `True` if the list `order` obeys every rule. Every job appears once.',
      starter: 'def obeys(order, rules):\n    # Your code here\n    return None\n',
      answer: 'def obeys(order, rules):\n    spot = {}\n    for i in range(len(order)):\n        spot[order[i]] = i\n    for a, b in rules:\n        if spot[a] > spot[b]:\n            return False\n    return True\n',
      tests: [
        { label: 'A good order', call: 'obeys(["a", "b", "c"], [("a", "c"), ("b", "c")])', want: 'True' },
        { label: 'Another good order', call: 'obeys(["b", "a", "c"], [("a", "c"), ("b", "c")])', want: 'True' },
        { label: 'A bad order', call: 'obeys(["c", "a", "b"], [("a", "c")])', want: 'False' },
        { label: 'No rules', call: 'obeys(["x"], [])', want: 'True' },
      ],
      explain: 'Save the spot of each job in a dict. Then each rule is one quick compare.',
      hints: ['Build a dict from job to index.', 'Return False the moment a rule fails.'],
    },
    { id: 'write-rounds', type: 'write', level: 3,
      q: 'Stretch: jobs with nothing left to wait for can all run in the same round. Write `rounds(graph)`. It returns how many rounds all the jobs need. If a cycle stops you, it returns -1.',
      starter: 'def rounds(graph):\n    # Your code here\n    return 0\n',
      answer: 'def rounds(graph):\n    need = {}\n    for job in graph:\n        need[job] = 0\n    for job in graph:\n        for later in graph[job]:\n            need[later] += 1\n    ready = []\n    for job in graph:\n        if need[job] == 0:\n            ready.append(job)\n    done = 0\n    count = 0\n    while len(ready) > 0:\n        count += 1\n        done += len(ready)\n        next_ready = []\n        for job in ready:\n            for later in graph[job]:\n                need[later] -= 1\n                if need[later] == 0:\n                    next_ready.append(later)\n        ready = next_ready\n    if done < len(graph):\n        return -1\n    return count\n',
      tests: [
        { label: 'A chain of 3 takes 3', call: 'rounds({"A": ["B"], "B": ["C"], "C": []})', want: '3' },
        { label: 'No rules takes 1', call: 'rounds({"A": [], "B": []})', want: '1' },
        { label: 'A diamond takes 3', call: 'rounds({"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []})', want: '3' },
        { label: 'A cycle gives -1', call: 'rounds({"A": ["B"], "B": ["A"]})', want: '-1' },
        { label: 'No jobs takes 0', call: 'rounds({})', want: '0' },
      ],
      explain: 'This is BFS in layers. Each round is one layer of jobs with a count of 0.',
      hints: ['Keep a list of jobs ready this round.', 'Build a new list for the next round.', 'Count the jobs done, to spot a cycle.'],
    },
  ],
});
