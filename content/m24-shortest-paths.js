/* Module 24: Shortest Paths. Part 4 (Advanced). */
Course.module({
  id: 'm24-shortest-paths',
  num: 24, part: 4, level: 'A',
  title: 'Shortest Paths',
  blurb: 'Find the cheapest route when each road or bus ride has its own price.',
  needs: ['m20-heaps', 'm21-graphs'],
});

/* ------------------------------------------------------------------ 24.1 */
Course.lesson('m24-shortest-paths', {
  id: '24-1-cheapest-first',
  num: '24.1',
  title: 'When BFS is not enough: cheapest first',
  goal: 'You can find the cheapest route on a small weighted graph by hand.',
  mins: 14,
  steps: [
    { t: 'h', text: 'Can BFS find the cheapest trip?' },
    { t: 'p', text: 'In lesson 21.2, [[BFS]] found the route with the fewest edges. Now each bus ride has a fare in coins. You want the fewest coins, not the fewest rides.' },
    { t: 'viz', name: 'm24-bfs-wrong', caption: 'Answer each question. Then pick a new goal and change a fare. Try A-B at 1, and try A-C at 20.' },
    { t: 'q', id: 'why-bfs-misses', type: 'mcq', level: 1,
      q: 'Why did BFS miss the cheaper route?',
      options: [
        'It counts edges, and it never reads the fares.',
        { text: 'BFS has a bug in it.', why: 'BFS does its own job well: it finds the fewest edges. The job here is a different one.' },
        { text: 'The stops are not sorted.', why: 'BFS does not need sorted stops. It would miss this route in any order, because fares play no part in it.' },
      ],
      answer: 0,
      explain: 'BFS answers "fewest edges". That is the right answer only when every edge counts the same.',
      hints: ['What does BFS count as it spreads out?'],
    },
    { t: 'h', text: 'How do you store a fare?' },
    { t: 'p', text: 'In lesson 21.1, each node had a list of neighbours. In a [[weighted]] graph, each neighbour comes with its number. So the list holds pairs, like `("B", 4)`.' },
    { t: 'code', caption: 'This is the bus map from the picture. Unpack each pair with `other, price`. Try `graph["D"]`, and guess first.',
      output: 'A 1\nB 2\nD 5',
      code: py`
        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("A", 4), ("C", 2), ("D", 1)],
            "C": [("A", 1), ("B", 2), ("D", 5)],
            "D": [("B", 1), ("C", 5), ("E", 3)],
            "E": [("D", 3)],
        }
        for other, price in graph["C"]:
            print(other, price)
      `,
    },
    { t: 'q', id: 'read-pairs', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        graph = {"A": [("B", 4), ("C", 1)], "B": [], "C": []}
        for other, price in graph["A"]:
            if price < 3:
                print(other)
      `,
      options: [
        'C',
        { text: 'B', why: 'B is first in the list, but its price is 4. The `if` only lets through a price under 3.' },
        { text: '1', why: 'The code prints `other`, which names the stop. `price` is the number in the pair.' },
      ],
      answer: 0,
      explain: 'The pair for C has a price of 1, and that is under 3. So only C prints.',
      hints: ['Which pair has a price under 3?', 'Which name does `print` use?'],
    },
    { t: 'h', text: 'What is the better idea?' },
    { t: 'words', items: [
      { word: 'path cost', means: 'All the numbers on a route, added up.' },
      { word: 'finished', means: 'A stop whose cost can never get lower. It is final.' },
      { word: 'Dijkstra', say: 'DIKE-struh', means: 'A search that finishes the cheapest stop next. It is named after Edsger Dijkstra.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Picture a bus map with a fare on each ride. You cross off stops, cheapest to reach first. You ride one bus at a time, but this search keeps many routes open at once.' },
    { t: 'big', text: 'Finish the cheapest stop you know about. Fares are never below 0, so no other route can beat it.' },
    { t: 'steps', title: 'Finish the cheapest stop next', items: [
      { label: 'Start the table', text: 'The start costs 0. Other stops have no cost yet.', code: 'best = {start: 0}' },
      { label: 'Pick', text: 'Choose the stop with the lowest cost that is not [[finished]]. Now it is finished.' },
      { label: 'Try its edges', text: 'For each neighbour, add the fare to the cost so far. Keep the new cost if it is lower.', code: 'new = best[node] + price' },
      { label: 'Repeat', text: 'Stop when every stop you found is finished.' },
    ] },
    { t: 'viz', name: 'm24-cheapest-first', caption: 'Pick each stop before the picture does. Then choose a new start and change a fare. Try a fare of 0.' },
    { t: 'q', id: 'why-final', type: 'mcq', level: 2,
      q: 'The open stops are P at 3, Q at 5 and R at 9. You finish P. Why can no later route reach P for less?',
      options: [
        'Any other route passes through Q or R, so it already costs at least 5.',
        { text: 'P was found first, and the first cost is final.', why: 'The first cost is not final. In the picture, B first showed 4 and later dropped to 3.' },
        { text: 'P has the fewest edges from the start.', why: 'That is the BFS way of thinking. Edge counts play no part here, only coins.' },
      ],
      answer: 0,
      explain: 'Going on from Q or R can only add coins, because fares are never below 0. So nothing can drop under 3.',
      hints: ['What does a route through Q cost, at the very least?'],
    },
    { t: 'q', id: 'order-try-edges', type: 'order', level: 2,
      q: 'Put the lines in order, so the code tries every edge from A. One line does not belong.',
      lines: [
        'graph = {"A": [("B", 2), ("C", 7)], "B": [], "C": []}',
        'best = {"A": 0}',
        'node = "A"',
        'for other, price in graph[node]:',
        '    new = best[node] + price',
        '    if other not in best or new < best[other]:',
        '        best[other] = new',
        'print(best)',
      ],
      extra: ['    new = price'],
      output: "{'A': 0, 'B': 2, 'C': 7}",
      explain: 'The new cost adds the fare to the cost so far. A fare alone forgets the trip that got you here.',
      hints: ['Make the table before you loop.', 'A route costs everything so far, plus this fare.'],
    },
    { t: 'code', caption: 'The same steps in Python. `looks` counts each table row you read. Change a fare, and guess the new table first.',
      output: "looks: 17\n{'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}",
      code: py`
        def cheapest(graph, start):
            best = {start: 0}
            finished = set()
            looks = 0
            while len(finished) < len(best):
                node = None
                for n in best:
                    looks = looks + 1
                    if n not in finished:
                        if node is None or best[n] < best[node]:
                            node = n
                finished.add(node)
                for other, price in graph[node]:
                    new = best[node] + price
                    if other not in best or new < best[other]:
                        best[other] = new
            print("looks:", looks)
            return best

        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("A", 4), ("C", 2), ("D", 1)],
            "C": [("A", 1), ("B", 2), ("D", 5)],
            "D": [("B", 1), ("C", 5), ("E", 3)],
            "E": [("D", 3)],
        }
        print(cheapest(graph, "A"))
      `,
    },
    { t: 'trap', think: 'the first cost I find for a stop is its final cost.',
      real: 'A cost is final only when the stop is finished. Here B starts at 4, then drops to 3.',
      code: 'best = {"A": 0, "B": 4, "C": 1}   # after A\nbest["B"] = 3                     # after C',
    },
    { t: 'h', text: 'Count the looks by hand' },
    { t: 'q', id: 'count-looks', type: 'mcq', level: 2,
      q: 'A map has 4 stops. You finish 1 stop per trip, and each trip reads the table. The table never has more than 4 rows. What is the most rows you read in all?',
      options: [
        { text: '4', why: 'That counts the trips only. Each trip may read every row.' },
        { text: '8', why: 'That adds 4 and 4. It is 4 trips with up to 4 rows each, so you multiply.' },
        '16',
      ],
      answer: 2,
      explain: '4 trips times 4 rows is 16. The code above read 17 rows for 5 stops, and its limit was 25.',
      hints: ['How many trips are there? How many rows on each trip?'],
    },
    { t: 'cost', title: 'How fast is this way? V is stops, E is edges.', items: [
      { op: 'Pick the next stop', cost: 'O(V)', why: 'You read the table, and it can have a row for each stop.' },
      { op: 'All the picks together', cost: 'O(V^2)', why: 'You counted this: V trips, with up to V rows each.' },
      { op: 'All the edge tries', cost: 'O(E)', why: 'Each stop finishes once, so each list entry gets read once.' },
    ] },
    { t: 'p', text: 'Reading the whole table on each trip is slow for a big map. The next lesson hands that job to a [[heap]].' },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"fewest moves", and each move counts the same', 'BFS'],
      ['"cheapest", "least time", "shortest km"', 'Dijkstra'],
      ['Numbers on edges, none below 0', 'Dijkstra'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'If the start is also the goal, the cost is 0. If no route reaches a stop, it never joins `best`. A fare of 0 is fine. On a tie, either stop can go first, and the costs stay the same.' },
  ],
  recap: [
    'You can say why BFS misses cheap routes.',
    'You can store fares as pairs in a list.',
    'You can finish the cheapest stop next, by hand.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['[[path cost]]', 'All the numbers on a route, added up'],
        ['[[finished]]', 'A stop whose cost can never get lower'],
        ['[[Dijkstra]]', 'A search that finishes the cheapest stop next'],
      ],
      explain: 'A path cost is a total. A finished stop has a final total. Dijkstra is the search that gets you there.',
      hints: ['Which word means a final cost?'],
    },
    { id: 'which-search', type: 'mcq', level: 1,
      q: 'Which job needs [[Dijkstra]], not plain BFS?',
      options: [
        'Find the quickest drive, when each road takes its own number of minutes.',
        { text: 'Find the fewest moves for a knight on a chess board.', why: 'Each move counts the same here. So BFS is right, and it is the faster tool.' },
        { text: 'Find how many friends of friends someone has.', why: 'Each link counts the same, so BFS layers answer this. There are no numbers on the edges.' },
      ],
      answer: 0,
      explain: 'Minutes on the roads make this a [[weighted]] graph. So counting edges is not enough.',
      hints: ['Which job has a different number on each edge?'],
    },
    { id: 'trace-finish', type: 'trace', level: 2,
      q: 'Run the idea by hand. Fill in each stop as it finishes, with its final cost.',
      code: py`
        graph = {
            "S": [("P", 6), ("Q", 2)],
            "P": [("T", 1)],
            "Q": [("P", 3), ("T", 8)],
            "T": [],
        }
      `,
      head: ['finish', 'cost'],
      rows: [['S', '0'], ['Q', '2'], ['P', '5'], ['T', '6']],
      given: 1,
      verify: py`
        graph = {
            "S": [("P", 6), ("Q", 2)],
            "P": [("T", 1)],
            "Q": [("P", 3), ("T", 8)],
            "T": [],
        }
        best = {"S": 0}
        finished = set()
        while len(finished) < len(best):
            node = None
            for n in best:
                if n not in finished:
                    if node is None or best[n] < best[node]:
                        node = n
            finished.add(node)
            print(node, best[node])
            for other, price in graph[node]:
                new = best[node] + price
                if other not in best or new < best[other]:
                    best[other] = new
      `,
      explain: 'P first shows 6, and it drops to 5 through Q. T first shows 10 through Q, and it drops to 6 through P.',
      hints: ['After S, the table has P at 6 and Q at 2. Which is lowest?', 'Finishing Q changes the cost of P.'],
    },
    { id: 'write-path-cost', type: 'write', level: 2,
      q: 'Write `path_cost(graph, route)`. `route` is a list of stops in order. Return the [[path cost]]. A route with 1 stop costs 0. Every ride in the route exists.',
      starter: 'def path_cost(graph, route):\n    # Your code here\n    return "?"\n',
      answer: 'def path_cost(graph, route):\n    total = 0\n    for i in range(len(route) - 1):\n        for other, price in graph[route[i]]:\n            if other == route[i + 1]:\n                total = total + price\n    return total\n',
      tests: [
        { label: '2 rides add up', call: 'path_cost({"X": [("Y", 3)], "Y": [("Z", 4)], "Z": []}, ["X", "Y", "Z"])', want: '7' },
        { label: 'It picks the right pair', call: 'path_cost({"X": [("Y", 3), ("Z", 9)], "Y": [], "Z": []}, ["X", "Z"])', want: '9' },
        { label: 'Only 1 stop costs 0', call: 'path_cost({"X": []}, ["X"])', want: '0' },
        { label: 'Going there and back counts twice', call: 'path_cost({"X": [("Y", 2)], "Y": [("X", 2)]}, ["X", "Y", "X"])', want: '4' },
      ],
      explain: 'Walk along the route, one ride at a time. For each ride, find the pair for the next stop and add its price.',
      hints: ['Loop `i` over `range(len(route) - 1)`.', 'Go through `graph[route[i]]`, and look for `route[i + 1]`.'],
    },
    { id: 'fix-first-final', type: 'fix', level: 2,
      q: 'This code treats the first cost as final. So B and D come out too high. Fix one line.',
      code: py`
        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("D", 1)],
            "C": [("B", 2)],
            "D": [],
        }

        def cheapest(graph, start):
            best = {start: 0}
            finished = set()
            while len(finished) < len(best):
                node = None
                for n in best:
                    if n not in finished:
                        if node is None or best[n] < best[node]:
                            node = n
                finished.add(node)
                for other, price in graph[node]:
                    new = best[node] + price
                    if other not in best:
                        best[other] = new
            return best
      `,
      answer: py`
        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("D", 1)],
            "C": [("B", 2)],
            "D": [],
        }

        def cheapest(graph, start):
            best = {start: 0}
            finished = set()
            while len(finished) < len(best):
                node = None
                for n in best:
                    if n not in finished:
                        if node is None or best[n] < best[node]:
                            node = n
                finished.add(node)
                for other, price in graph[node]:
                    new = best[node] + price
                    if other not in best or new < best[other]:
                        best[other] = new
            return best
      `,
      tests: [
        { label: 'B costs 3 through C', call: 'cheapest(graph, "A")["B"]', want: '3' },
        { label: 'D costs 4', call: 'cheapest(graph, "A")["D"]', want: '4' },
        { label: 'A start with no edges still works', call: 'cheapest(graph, "D")', want: '{"D": 0}' },
      ],
      explain: 'The table must also accept a lower cost for a stop it already knows. So add `or new < best[other]`.',
      hints: ['What happens when a cheaper way to B turns up?', 'Change the `if` line, so a lower cost also counts.'],
    },
    { id: 'write-city-map', type: 'write', level: 3,
      q: 'Stretch: here is a small city map. Write `cheapest_cost(graph, start, goal)`. Return the lowest path cost from start to goal, or `None` if no route exists. Read the whole table on each trip.',
      starter: 'def cheapest_cost(graph, start, goal):\n    # Your code here\n    return "?"\n',
      answer: 'def cheapest_cost(graph, start, goal):\n    best = {start: 0}\n    finished = set()\n    while len(finished) < len(best):\n        node = None\n        for n in best:\n            if n not in finished:\n                if node is None or best[n] < best[node]:\n                    node = n\n        finished.add(node)\n        for other, km in graph[node]:\n            new = best[node] + km\n            if other not in best or new < best[other]:\n                best[other] = new\n    if goal in best:\n        return best[goal]\n    return None\n',
      tests: [
        { label: 'The route with more roads wins', call: 'cheapest_cost({"Mill": [("Park", 9), ("Bank", 2)], "Bank": [("Park", 3)], "Park": []}, "Mill", "Park")', want: '5' },
        { label: 'A one-way road cannot go back', call: 'cheapest_cost({"Mill": [("Park", 9)], "Park": []}, "Park", "Mill")', want: 'None' },
        { label: 'Start and goal are the same', call: 'cheapest_cost({"Mill": []}, "Mill", "Mill")', want: '0' },
        { label: 'A road of 0 km is fine', call: 'cheapest_cost({"A": [("B", 0)], "B": [("C", 2)], "C": []}, "A", "C")', want: '2' },
        { label: 'A cost drops after it first appears', call: 'cheapest_cost({"A": [("B", 8), ("C", 1)], "C": [("B", 1)], "B": [("D", 1)], "D": []}, "A", "D")', want: '3' },
      ],
      explain: 'Build the whole table with the steps from this lesson. Then look the goal up in it.',
      hints: ['Start from the `cheapest` code in this lesson.', 'A stop with no route never joins `best`.', 'End with `if goal in best:`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 24.2 */
Course.lesson('m24-shortest-paths', {
  id: '24-2-dijkstra-heapq',
  num: '24.2',
  title: 'Dijkstra with heapq: skip the stale entries',
  goal: 'You can write Dijkstra with `heapq`, skip stale entries, and use it on a grid.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Can a heap pick the next stop?' },
    { t: 'p', text: 'In lesson 24.1, you read the whole table to find the next stop. A [[min-heap]] hands you the smallest item at once. So keep `(cost, stop)` tuples in a heap.' },
    { t: 'q', id: 'spark-two-entries', type: 'predict', level: 1,
      q: 'B got cheaper, so it was pushed a second time. What will the screen show?',
      code: py`
        import heapq

        h = []
        heapq.heappush(h, (4, "B"))
        heapq.heappush(h, (1, "C"))
        heapq.heappush(h, (3, "B"))
        print(heapq.heappop(h))
        print(heapq.heappop(h))
        print(h)
      `,
      options: [
        "(1, 'C')\n(3, 'B')\n[(4, 'B')]",
        { text: "(1, 'C')\n(3, 'B')\n[]", why: 'You may think the new B replaced the old one. A heap keeps every item you push, so (4, "B") is still there.' },
        { text: "(1, 'C')\n(4, 'B')\n[(3, 'B')]", why: 'You may think the first one pushed comes out first. A heap goes by size, so (3, "B") beats (4, "B").' },
      ],
      answer: 0,
      explain: 'Tuples compare the first item first, so the costs decide. After 2 pops, the old (4, "B") is still waiting.',
      hints: ['A pop always takes the smallest.', 'Did anything ever remove (4, "B")?'],
    },
    { t: 'words', items: [
      { word: 'stale entry', say: 'STAYL', means: 'An old item in the heap, for a stop that is already finished.' },
    ] },
    { t: 'p', text: '`heapq` has no tool to change an item in the middle. So when a stop gets cheaper, you push a new tuple. The old one stays behind and becomes a [[stale entry]].' },
    { t: 'big', text: 'Push a new tuple when a cost drops. When a tuple for a finished stop comes off, skip it.' },
    { t: 'steps', title: 'Dijkstra with a heap', items: [
      { label: 'Set up', text: 'The table and the heap both start with the start stop.', code: 'best = {start: 0}\nheap = [(0, start)]\nfinished = set()' },
      { label: 'Pop the smallest', text: 'This replaces reading the whole table.', code: 'cost, node = heapq.heappop(heap)' },
      { label: 'Skip if stale', text: 'A [[finished]] stop already has its final cost.', code: 'if node in finished:\n    continue\nfinished.add(node)' },
      { label: 'Try each edge', text: 'When a cost drops, update the table and push.', code: 'new = cost + price\nif other not in best or new < best[other]:\n    best[other] = new\n    heapq.heappush(heap, (new, other))' },
    ] },
    { t: 'viz', name: 'm24-dijkstra', caption: 'Guess when it asks, and watch for a stale entry. Then pick a new start and change a fare. Try closing D-E.' },
    { t: 'code', caption: 'This is the same map. Try a start of "E". Then close a road, by removing it from both lists.',
      output: "{'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}",
      code: py`
        import heapq

        def dijkstra(graph, start):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, node = heapq.heappop(heap)
                if node in finished:
                    continue
                finished.add(node)
                for other, price in graph[node]:
                    new = cost + price
                    if other not in best or new < best[other]:
                        best[other] = new
                        heapq.heappush(heap, (new, other))
            return best

        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("A", 4), ("C", 2), ("D", 1)],
            "C": [("A", 1), ("B", 2), ("D", 5)],
            "D": [("B", 1), ("C", 5), ("E", 3)],
            "E": [("D", 3)],
        }
        print(dijkstra(graph, "A"))
      `,
    },
    { t: 'q', id: 'trace-pops', type: 'trace', level: 2,
      q: 'Fill in each pop, in order. Write `skip` for a stale entry and `finish` for the rest.',
      code: py`
        graph = {
            "A": [("B", 5), ("C", 1)],
            "B": [],
            "C": [("B", 1)],
        }
      `,
      head: ['cost', 'node', 'action'],
      rows: [['0', 'A', 'finish'], ['1', 'C', 'finish'], ['2', 'B', 'finish'], ['5', 'B', 'skip']],
      given: 1,
      verify: py`
        import heapq
        graph = {
            "A": [("B", 5), ("C", 1)],
            "B": [],
            "C": [("B", 1)],
        }
        best = {"A": 0}
        heap = [(0, "A")]
        finished = set()
        while len(heap) > 0:
            cost, node = heapq.heappop(heap)
            if node in finished:
                print(cost, node, "skip")
                continue
            print(cost, node, "finish")
            finished.add(node)
            for other, price in graph[node]:
                new = cost + price
                if other not in best or new < best[other]:
                    best[other] = new
                    heapq.heappush(heap, (new, other))
      `,
      explain: 'B joins at 5, then again at 2 through C. The (2, "B") comes off first and finishes B. So (5, "B") is stale.',
      hints: ['After A, the heap has (1, "C") and (5, "B").', 'C pushes (2, "B"). Which B comes off first?'],
    },
    { t: 'h', text: 'Does the skip change the answer?' },
    { t: 'p', text: 'Run the search with the skip, then without it. `checks` counts each edge you try. Guess first: which number changes?' },
    { t: 'code', caption: 'The table is the same both times. Only the work grows. Change a fare and run it again.',
      output: "({'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}, 12)\n({'A': 0, 'B': 3, 'C': 1, 'D': 4, 'E': 7}, 18)",
      code: py`
        import heapq

        def dijkstra(graph, start, skip):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            checks = 0
            while len(heap) > 0:
                cost, node = heapq.heappop(heap)
                if skip and node in finished:
                    continue
                finished.add(node)
                for other, price in graph[node]:
                    checks = checks + 1
                    new = cost + price
                    if other not in best or new < best[other]:
                        best[other] = new
                        heapq.heappush(heap, (new, other))
            return best, checks

        graph = {
            "A": [("B", 4), ("C", 1)],
            "B": [("A", 4), ("C", 2), ("D", 1)],
            "C": [("A", 1), ("B", 2), ("D", 5)],
            "D": [("B", 1), ("C", 5), ("E", 3)],
            "E": [("D", 3)],
        }
        print(dijkstra(graph, "A", True))
        print(dijkstra(graph, "A", False))
      `,
    },
    { t: 'trap', think: 'a stale entry would make my answer wrong, so the skip is what keeps it right.',
      real: 'With fares of 0 or more, an old cost can never beat the table. So the skip keeps the answer the same and cuts the work.',
    },
    { t: 'tip', title: 'Another skip you may see', text: 'Some code writes `if cost > best[node]: continue` and has no `finished` set. With no fare below 0, it skips the very same entries.' },
    { t: 'h', text: 'Count the pushes by hand' },
    { t: 'q', id: 'count-pushes', type: 'mcq', level: 2,
      q: 'The bus map has 12 list entries. Each stop finishes once, so each entry gets read once. Each read can push at most 1 tuple. The start is pushed too. What is the most pushes this map can have?',
      options: [
        { text: '5', why: 'That is one push per stop. But a stop can be pushed again when its cost drops, as B was.' },
        { text: '7', why: 'That is how many this run made, with these fares. Other fares can push more, so it is not the limit.' },
        '13',
      ],
      answer: 2,
      explain: '12 reads can push at most 12 tuples, and the start is 1 more. So the heap never sees more than 13 pushes.',
      hints: ['Add the start to the 12 reads.'],
    },
    { t: 'cost', title: 'How fast is it? V is stops, E is edges.', items: [
      { op: 'Dijkstra with a heap', cost: 'O((V + E) log V)', why: 'Each list entry can push once. Each push or pop takes about log steps. Log E is at most 2 log V, so we write log V.' },
      { op: 'One heap push or pop', cost: 'O(log n)', why: 'You met this in module 20. An item only climbs or sinks one path.' },
      { op: 'Memory', cost: 'O(V + E)', why: 'The table has a row per stop. The heap has at most one tuple per list entry, plus 1.' },
    ] },
    { t: 'tip', title: 'Which way wins?', text: 'Try the formulas on 1000 stops with about 3 edges each. Reading the table gives about 1000000 steps. The heap gives about 40000. On 10 stops, the table wins, 100 to about 130. It can also win when nearly every stop joins every stop.' },
    { t: 'h', text: 'A grid with costs is a graph too' },
    { t: 'p', text: 'In lesson 21.4, grid cells were nodes. Now each cell has a cost to step on, like mud or grass. You want the cheapest walk from the top left to the bottom right.' },
    { t: 'viz', name: 'm24-grid', caption: 'Say which cell comes off next. Then type your own costs. Try `5` on its own, and try all 1s.' },
    { t: 'code', caption: 'You can walk in all 4 directions. Once the goal comes off the heap, its cost is final, so `return` stops early.',
      output: '11\n5\n11',
      code: py`
        import heapq

        def cheapest_walk(grid):
            rows = len(grid)
            cols = len(grid[0])
            moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            best = {(0, 0): grid[0][0]}
            heap = [(grid[0][0], 0, 0)]
            finished = set()
            while len(heap) > 0:
                cost, r, c = heapq.heappop(heap)
                if (r, c) in finished:
                    continue
                finished.add((r, c))
                if r == rows - 1 and c == cols - 1:
                    return cost
                for dr, dc in moves:
                    nr = r + dr
                    nc = c + dc
                    if 0 <= nr < rows and 0 <= nc < cols:
                        new = cost + grid[nr][nc]
                        spot = (nr, nc)
                        if spot not in best or new < best[spot]:
                            best[spot] = new
                            heapq.heappush(heap, (new, nr, nc))

        print(cheapest_walk([[2, 7, 1], [3, 8, 2], [1, 1, 4]]))
        print(cheapest_walk([[5]]))
        print(cheapest_walk([[1, 9, 1, 1, 1],
                             [1, 9, 1, 9, 1],
                             [1, 1, 1, 9, 1]]))
      `,
    },
    { t: 'q', id: 'grid-up', type: 'mcq', level: 2,
      q: 'Look at the last grid in the code. Why must the walk be able to go up?',
      options: [
        'The cheap cells bend back up around the 9s.',
        { text: 'A heap only works if you can move up.', why: 'The heap does not care about directions. It only cares about costs.' },
        { text: 'Going up always costs less.', why: 'The cost comes from the cell, not the direction. Here the up move is cheap because those cells are 1s.' },
      ],
      answer: 0,
      explain: 'A walk with only right and down moves must cross a 9. The walk that goes up in the middle avoids them all.',
      hints: ['Trace the 1s with your finger, from the top left.'],
    },
    { t: 'tip', title: 'Why this grid has no stale entries', text: 'A cell costs the same to enter from every side. So the first cost found for a cell is already its lowest. Keep the skip anyway, as most graphs need it.' },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"cheapest route", "least time", costs on edges', 'Dijkstra with a heap'],
      ['A grid where each cell has its own cost', 'Dijkstra, with cells as nodes'],
      ['Stop as soon as one goal is reached', 'Return when the goal comes off the heap'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'Every stop needs a key in the graph, even with no edges. A stop with no route never joins `best`. On a tie in cost, Python compares the names. Names compare fine, but dicts would crash, as lesson 20.3 showed.' },
  ],
  recap: [
    'You can keep (cost, stop) tuples in a heap.',
    'You can skip a stale entry, and say why.',
    'You can run Dijkstra on a cost grid.',
  ],
  practice: [
    { id: 'what-is-stale', type: 'mcq', level: 1,
      q: 'What is a [[stale entry]]?',
      options: [
        'An old tuple for a stop that is already finished.',
        { text: 'A stop that no route can reach.', why: 'A stop with no route never gets into the heap at all. A stale entry is in the heap.' },
        { text: 'The smallest tuple in the heap.', why: 'The smallest tuple is the top. It may be stale or fresh, as size alone does not tell you.' },
      ],
      answer: 0,
      explain: 'When a cost drops, the old tuple stays in the heap. When it comes off, its stop is finished already.',
      hints: ['Where does it live, and how old is it?'],
    },
    { id: 'why-cost-first', type: 'mcq', level: 2,
      q: 'Why is the tuple `(cost, stop)`, and not `(stop, cost)`?',
      options: [
        'Tuples compare the first item first, and the heap must order by cost.',
        { text: 'Python only lets a number go first in a tuple.', why: 'A tuple can hold items in any order. The order only decides how 2 tuples compare.' },
        { text: 'It makes no difference.', why: 'With `(stop, cost)`, the heap would pop by name. So the next stop would not be the cheapest.' },
      ],
      answer: 0,
      explain: 'In lesson 20.3, tuples compared item by item. Putting the cost first makes the cheapest come off first.',
      hints: ['Which item does Python compare first?'],
    },
    { id: 'predict-stale-count', type: 'predict', level: 2,
      q: 'This run counts its stale entries. What will the screen show? Type it.',
      code: py`
        import heapq

        graph = {
            "S": [("T", 9), ("U", 1)],
            "U": [("T", 3)],
            "T": [],
        }
        best = {"S": 0}
        heap = [(0, "S")]
        finished = set()
        stale = 0
        while len(heap) > 0:
            cost, node = heapq.heappop(heap)
            if node in finished:
                stale = stale + 1
                continue
            finished.add(node)
            for other, price in graph[node]:
                new = cost + price
                if other not in best or new < best[other]:
                    best[other] = new
                    heapq.heappush(heap, (new, other))
        print(best["T"], stale)
      `,
      answer: '4 1',
      why: 'T joins at 9, then at 4 through U. The 4 finishes T, so the 9 comes off as a stale entry.',
      explain: 'The cheapest cost for T is 1 + 3 = 4. The old (9, "T") comes off last and gets skipped once.',
      hints: ['How many times does T join the heap?', 'Which T comes off first?'],
    },
    { id: 'fix-forgot-so-far', type: 'fix', level: 2,
      q: 'This code gives costs that are too low. It forgets the trip so far. Fix one line.',
      code: py`
        import heapq

        def dijkstra(graph, start):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, node = heapq.heappop(heap)
                if node in finished:
                    continue
                finished.add(node)
                for other, price in graph[node]:
                    new = price
                    if other not in best or new < best[other]:
                        best[other] = new
                        heapq.heappush(heap, (new, other))
            return best
      `,
      answer: py`
        import heapq

        def dijkstra(graph, start):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, node = heapq.heappop(heap)
                if node in finished:
                    continue
                finished.add(node)
                for other, price in graph[node]:
                    new = cost + price
                    if other not in best or new < best[other]:
                        best[other] = new
                        heapq.heappush(heap, (new, other))
            return best
      `,
      tests: [
        { label: '2 rides add up', call: 'dijkstra({"A": [("B", 2)], "B": [("C", 3)], "C": []}, "A")["C"]', want: '5' },
        { label: 'The cheaper route wins', call: 'dijkstra({"A": [("B", 9), ("C", 1)], "C": [("B", 2)], "B": []}, "A")["B"]', want: '3' },
        { label: 'A start with no edges', call: 'dijkstra({"A": []}, "A")', want: '{"A": 0}' },
      ],
      explain: 'A route costs everything so far, plus this fare. So `new` must be `cost + price`.',
      hints: ['What does a route to `other` really cost?', 'Look at the line that sets `new`.'],
    },
    { id: 'write-network-delay', type: 'write', level: 2,
      q: 'Computers pass a message along one-way cables. Each pair `(other, minutes)` is a cable. Write `all_heard(cables, start)`. Return the minutes until the last computer gets the message, or -1 if one never does.',
      starter: 'import heapq\n\ndef all_heard(cables, start):\n    # Your code here\n    return "?"\n',
      answer: 'import heapq\n\ndef all_heard(cables, start):\n    best = {start: 0}\n    heap = [(0, start)]\n    finished = set()\n    while len(heap) > 0:\n        cost, node = heapq.heappop(heap)\n        if node in finished:\n            continue\n        finished.add(node)\n        for other, minutes in cables[node]:\n            new = cost + minutes\n            if other not in best or new < best[other]:\n                best[other] = new\n                heapq.heappush(heap, (new, other))\n    if len(best) < len(cables):\n        return -1\n    return max(best.values())\n',
      tests: [
        { label: 'The last one takes the longest route', call: 'all_heard({"P": [("Q", 2), ("R", 7)], "Q": [("R", 1)], "R": [("S", 4)], "S": []}, "P")', want: '7' },
        { label: 'One computer cannot be reached', call: 'all_heard({"P": [("Q", 2)], "Q": [], "R": []}, "P")', want: '-1' },
        { label: 'Only one computer', call: 'all_heard({"P": []}, "P")', want: '0' },
        { label: 'A one-way cable cannot go back', call: 'all_heard({"P": [], "Q": [("P", 1)]}, "P")', want: '-1' },
      ],
      explain: 'The message reaches each computer at its cheapest cost. So the answer is the biggest value in the table.',
      hints: ['Run Dijkstra to build the table.', 'If the table has fewer keys than `cables`, someone was missed.', '`max(best.values())` gives the biggest cost.'],
    },
    { id: 'write-route', type: 'write', level: 3,
      q: 'Stretch: write `cheapest_route(graph, start, goal)`. Return the list of stops on a cheapest route. If no route exists, return `[]`. Use `came_from`, as in lesson 21.2.',
      starter: 'import heapq\n\ndef cheapest_route(graph, start, goal):\n    # Your code here\n    return "?"\n',
      answer: 'import heapq\n\ndef cheapest_route(graph, start, goal):\n    best = {start: 0}\n    came_from = {start: None}\n    heap = [(0, start)]\n    finished = set()\n    while len(heap) > 0:\n        cost, node = heapq.heappop(heap)\n        if node in finished:\n            continue\n        finished.add(node)\n        for other, price in graph[node]:\n            new = cost + price\n            if other not in best or new < best[other]:\n                best[other] = new\n                came_from[other] = node\n                heapq.heappush(heap, (new, other))\n    if goal not in best:\n        return []\n    path = []\n    at = goal\n    while at is not None:\n        path.append(at)\n        at = came_from[at]\n    path.reverse()\n    return path\n',
      tests: [
        { label: 'The route with more rides wins', call: 'cheapest_route({"A": [("B", 9), ("C", 1)], "C": [("B", 2)], "B": []}, "A", "B")', want: '["A", "C", "B"]' },
        { label: 'No route gives an empty list', call: 'cheapest_route({"A": [], "B": []}, "A", "B")', want: '[]' },
        { label: 'Start and goal are the same', call: 'cheapest_route({"A": [("B", 1)], "B": []}, "A", "A")', want: '["A"]' },
        { label: 'came_from updates when a cost drops', call: 'cheapest_route({"A": [("B", 5), ("C", 1)], "C": [("B", 1)], "B": [("D", 1)], "D": []}, "A", "D")', want: '["A", "C", "B", "D"]' },
      ],
      explain: 'Each time a cost drops, write down who gave that cost. Then walk back from the goal and flip the list.',
      hints: ['Set `came_from[other] = node` in the same place as `best[other] = new`.', 'Stop walking back when you reach `None`.', '`path.reverse()` flips the list in place.'],
    },
    { id: 'write-walls', type: 'write', level: 3,
      q: 'Stretch: in this cost grid, a 0 is a wall. Write `cheapest_walk(grid)`. Return the cheapest walk from top left to bottom right. Return -1 if walls block every way. You pay for the start cell too.',
      starter: 'import heapq\n\ndef cheapest_walk(grid):\n    # Your code here\n    return "?"\n',
      answer: 'import heapq\n\ndef cheapest_walk(grid):\n    rows = len(grid)\n    cols = len(grid[0])\n    if grid[0][0] == 0:\n        return -1\n    moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]\n    best = {(0, 0): grid[0][0]}\n    heap = [(grid[0][0], 0, 0)]\n    finished = set()\n    while len(heap) > 0:\n        cost, r, c = heapq.heappop(heap)\n        if (r, c) in finished:\n            continue\n        finished.add((r, c))\n        if r == rows - 1 and c == cols - 1:\n            return cost\n        for dr, dc in moves:\n            nr = r + dr\n            nc = c + dc\n            if 0 <= nr < rows and 0 <= nc < cols:\n                if grid[nr][nc] != 0:\n                    new = cost + grid[nr][nc]\n                    spot = (nr, nc)\n                    if spot not in best or new < best[spot]:\n                        best[spot] = new\n                        heapq.heappush(heap, (new, nr, nc))\n    return -1\n',
      tests: [
        { label: 'It walks around the wall', call: 'cheapest_walk([[1, 0, 1], [1, 0, 1], [1, 1, 1]])', want: '5' },
        { label: 'It may need a costly cell to get through', call: 'cheapest_walk([[1, 0], [8, 1]])', want: '10' },
        { label: 'Walls block the way', call: 'cheapest_walk([[1, 0], [0, 1]])', want: '-1' },
        { label: 'The walk must go up to get past', call: 'cheapest_walk([[1, 0, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 1, 0, 1]])', want: '11' },
        { label: 'One cell costs itself', call: 'cheapest_walk([[6]])', want: '6' },
      ],
      explain: 'A wall is a cell you never step on, so it never joins the heap. If the heap runs out, no walk exists.',
      hints: ['Start from `cheapest_walk` in this lesson.', 'Skip a neighbour when its cell is 0.', 'Add `return -1` after the loop.'],
    },
  ],
});

/* ------------------------------------------------------------------ 24.3 */
Course.lesson('m24-shortest-paths', {
  id: '24-3-negative-edges',
  num: '24.3',
  title: 'Negative edges: when Dijkstra fails',
  goal: 'You can show Dijkstra failing on a negative edge, and get the right answer with Bellman-Ford.',
  mins: 15,
  optional: true,
  steps: [
    { t: 'h', text: 'What if a ride pays you?' },
    { t: 'p', text: 'Say one ride gives you 2 coins back. Its fare is -2. Here the bus map stops being true, as real fares never pay you. Graphs can still have such edges, like a game move that gives you energy.' },
    { t: 'q', id: 'by-hand', type: 'mcq', level: 1,
      q: 'One-way rides: A to B is 2. A to C is 3. C to B is -2. B to D is 1. Add it up by hand. What is the cheapest cost from A to D?',
      options: [
        { text: '3', why: 'That is A, B, D. It looks cheapest at first, but the -2 makes another route lower.' },
        '2',
        { text: '6', why: 'That adds every fare but treats -2 as 2. A fare of -2 takes coins off the total.' },
      ],
      answer: 1,
      explain: 'A, C, B, D costs 3 - 2 + 1, which is 2. A, B, D costs 3.',
      hints: ['There are 2 routes. Add up each one.'],
    },
    { t: 'code', caption: 'This is the Dijkstra code from lesson 24.2, on that map. Compare D with your answer. Then set the fare to -1.',
      output: "{'A': 0, 'B': 1, 'C': 3, 'D': 3}",
      code: py`
        import heapq

        def dijkstra(graph, start):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, node = heapq.heappop(heap)
                if node in finished:
                    continue
                finished.add(node)
                for other, price in graph[node]:
                    new = cost + price
                    if other not in best or new < best[other]:
                        best[other] = new
                        heapq.heappush(heap, (new, other))
            return best

        graph = {
            "A": [("B", 2), ("C", 3)],
            "B": [("D", 1)],
            "C": [("B", -2)],
            "D": [],
        }
        print(dijkstra(graph, "A"))
      `,
    },
    { t: 'viz', name: 'm24-neg-dijkstra', caption: 'Find the step that goes wrong. Then set the fare to -1, then -2, then 2.' },
    { t: 'big', text: 'Dijkstra promises a finished stop can never get cheaper. A negative edge can break that promise.' },
    { t: 'q', id: 'which-step', type: 'mcq', level: 2,
      q: 'Where does the run go wrong?',
      options: [
        'B finishes at 2, then gets cheaper. D never hears the news.',
        { text: 'The heap pops in the wrong order.', why: 'The heap always pops the smallest, and it did so here. The trouble is what the code believes about finished stops.' },
        { text: 'Python cannot add negative numbers.', why: 'Python adds them fine: 3 + -2 is 1. The table even shows B at 1.' },
      ],
      answer: 0,
      explain: 'B was finished, so the code tried its edges once, at cost 2. Then (1, "B") was thrown away, so D stayed at 3.',
      hints: ['Look at the table when (1, B) comes off the heap.'],
    },
    { t: 'tip', title: 'What about the other skip?', text: 'Lesson 24.2 showed `if cost > best[node]: continue`. That code tries B again, so it gets D right on this map. But then nothing is final, so the Dijkstra promise is gone. Its work can double with each few stops you add. On a loop that pays you, it never stops.' },
    { t: 'trap', think: 'Dijkstra got my map right, so a negative edge is fine there.',
      real: 'One right answer proves nothing. With the fare at -1, the code above is right by luck. Dijkstra is only safe when no edge is below 0. So with any negative edge, use the next tool.',
    },
    { t: 'h', text: 'How can you get the right answer?' },
    { t: 'words', items: [
      { word: 'Bellman-Ford', means: 'A search that tries every edge, round after round, until nothing changes.' },
      { word: 'negative cycle', means: 'A loop of edges that adds up to less than 0.', say: 'SY-kul' },
      { word: 'Floyd-Warshall', means: 'A way to find the cheapest cost between every pair of stops.', say: 'FLOYD WOR-shawl' },
    ] },
    { t: 'p', text: '[[Bellman-Ford]] drops the heap and the [[finished]] set. It trusts nothing as final. It keeps trying every edge until a whole round changes nothing.' },
    { t: 'steps', title: 'Bellman-Ford', items: [
      { label: 'Start the table', text: 'The start costs 0, the same as before.', code: 'best = {start: 0}' },
      { label: 'Try every edge', text: 'Skip an edge if its first stop has no cost yet. Keep any lower cost.', code: 'if a in best:\n    new = best[a] + price' },
      { label: 'Repeat the round', text: 'Stop when a round changes nothing.' },
      { label: 'Watch the limit', text: 'A plain route uses at most V - 1 edges. So if round V still changes something, a [[negative cycle]] is there.' },
    ] },
    { t: 'viz', name: 'm24-bellman-ford', caption: 'Guess before each edge. Then try a new start, and add the ride from D to C at -1.' },
    { t: 'code', caption: 'Edges are a plain list here. Change the order of the list, and guess first how many rounds it takes.',
      output: "{'A': 0, 'B': 1, 'C': 3, 'D': 2}",
      code: py`
        def bellman_ford(nodes, edges, start):
            best = {start: 0}
            for turn in range(len(nodes)):
                changed = False
                for a, b, price in edges:
                    if a in best:
                        new = best[a] + price
                        if b not in best or new < best[b]:
                            best[b] = new
                            changed = True
                if not changed:
                    return best
            return None

        edges = [
            ("B", "D", 1),
            ("A", "B", 2),
            ("A", "C", 3),
            ("C", "B", -2),
        ]
        print(bellman_ford("ABCD", edges, "A"))
      `,
    },
    { t: 'q', id: 'why-rounds', type: 'mcq', level: 2,
      q: 'A map has 4 stops and no [[negative cycle]]. Why are 3 rounds always enough to get the costs right?',
      options: [
        'A cheapest route has at most 3 edges. Each round gets at least 1 more right.',
        { text: 'Each round finishes 1 stop for good.', why: 'That is the Dijkstra idea. Here no stop is ever finished, and any cost can still change.' },
        { text: 'The edges are in a good order.', why: 'The order changes how many rounds you need, but 3 is the limit for any order.' },
      ],
      answer: 0,
      explain: 'A route with no loops visits each stop once. So 4 stops means at most 3 edges. A round fixes at least the next edge on it.',
      hints: ['How many edges join 4 stops in a line?'],
    },
    { t: 'q', id: 'count-tries', type: 'mcq', level: 2,
      q: 'Count by hand. The code allows V rounds. The map has 4 stops and 5 edges. What is the most edge tries it can make?',
      options: [
        { text: '9', why: 'That adds 4 and 5. Every round tries all 5 edges, so you multiply.' },
        '20',
        { text: '25', why: 'That is 5 x 5, as if there were 5 rounds. The rounds come from the stops, and there are 4.' },
      ],
      answer: 1,
      explain: '4 rounds with 5 edges each is 20 tries. With a negative loop, the picture makes all 20.',
      hints: ['How many rounds? How many edges per round?'],
    },
    { t: 'cost', title: 'How fast is it? V is stops, E is edges.', items: [
      { op: 'Bellman-Ford', cost: 'O(V x E)', why: 'You counted this: up to V rounds, with E tries each.' },
      { op: 'Dijkstra with a heap', cost: 'O((V + E) log V)', why: 'It is much faster on big maps, but it needs every edge to be 0 or more.' },
    ] },
    { t: 'h', text: 'What if a loop pays you?' },
    { t: 'p', text: 'Add a ride from D to C at -1. Now C, B, D and back to C adds up to -2. Each trip round the loop gets cheaper, so no cheapest cost exists.' },
    { t: 'code', caption: 'The table still changes in round 4, so the code returns `None`. Set the D to C fare to 5, and guess first.',
      output: 'None',
      code: py`
        def bellman_ford(nodes, edges, start):
            best = {start: 0}
            for turn in range(len(nodes)):
                changed = False
                for a, b, price in edges:
                    if a in best:
                        new = best[a] + price
                        if b not in best or new < best[b]:
                            best[b] = new
                            changed = True
                if not changed:
                    return best
            return None

        edges = [
            ("B", "D", 1),
            ("A", "B", 2),
            ("A", "C", 3),
            ("C", "B", -2),
            ("D", "C", -1),
        ]
        print(bellman_ford("ABCD", edges, "A"))
      `,
    },
    { t: 'trap', think: 'any negative edge makes a negative cycle.',
      real: 'A cycle counts only if its whole loop adds up to less than 0. The first map has a -2 and no loop at all, so its answer is fine.',
    },
    { t: 'h', text: 'What about every pair of stops?' },
    { t: 'p', text: '[[Floyd-Warshall]] fills a table with the cost from every stop to every stop. It asks one question, over and over: is it cheaper to go through this middle stop? It uses 3 loops inside each other.' },
    { t: 'q', id: 'middle-stop', type: 'mcq', level: 2,
      q: 'The table says A to D costs 9. It says A to C costs 2, and C to D costs 4. What should the table say for A to D now?',
      options: [
        '6, by going through C',
        { text: '9, as the first cost is final', why: 'Nothing is final here. A cheaper way through a middle stop always replaces the old cost.' },
        { text: '15, adding all 3', why: 'You take the lower of 2 choices: the old cost, or A to C plus C to D. You do not add them all.' },
      ],
      answer: 0,
      explain: 'Going through C costs 2 + 4 = 6. That beats 9, so the table changes.',
      hints: ['Which is lower: 9, or 2 + 4?'],
    },
    { t: 'cost', title: 'The cost of asking about every pair', items: [
      { op: 'Floyd-Warshall', cost: 'O(V^3)', why: 'Each of the 3 loops goes over every stop.' },
    ] },
    { t: 'table', caption: 'Which tool should you pick?', head: ['If the problem has...', 'Think of...'], rows: [
      ['No numbers, or all edges count the same', 'BFS'],
      ['Numbers, none below 0', 'Dijkstra'],
      ['Some numbers below 0, or "at most k rides"', 'Bellman-Ford'],
      ['"Find a loop that gains"', 'Bellman-Ford, with its last round'],
      ['A small map, and you need every pair', 'Floyd-Warshall'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'A map with no edges stops after 1 round. A stop with no route never joins `best`. A negative cycle that the start cannot reach does no harm, as those edges are skipped.' },
  ],
  recap: [
    'You can show Dijkstra failing on a negative edge.',
    'You can run Bellman-Ford round by round.',
    'You can spot a negative cycle with an extra round.',
  ],
  practice: [
    { id: 'match-tools', type: 'match', level: 1,
      q: 'Match each problem to its tool.',
      pairs: [
        ['Fewest moves, each move counts the same', 'BFS'],
        ['Cheapest route, with no cost below 0', '[[Dijkstra]]'],
        ['Cheapest route, with some costs below 0', '[[Bellman-Ford]]'],
        ['Cheapest cost for every pair of stops', '[[Floyd-Warshall]]'],
      ],
      explain: 'Each tool trades speed for what it can handle. Pick the fastest one that fits the problem.',
      hints: ['Start with the one that has no costs at all.'],
    },
    { id: 'promise', type: 'mcq', level: 1,
      q: 'Which promise does a negative edge break?',
      options: [
        'A finished stop can never get cheaper.',
        { text: 'A heap pops the smallest item.', why: 'The heap still does that with negative numbers. -3 comes off before 1.' },
        { text: 'Every stop needs a key in the graph.', why: 'That rule has nothing to do with the fares. It is about how you store the graph.' },
      ],
      answer: 0,
      explain: 'With fares of 0 or more, going further can only add coins. A negative fare can take coins off later.',
      hints: ['Which idea from lesson 24.1 needed fares of 0 or more?'],
    },
    { id: 'predict-rounds', type: 'predict', level: 2,
      q: 'This code counts rounds, including the last one that changes nothing. What will the screen show? Type it.',
      code: py`
        edges = [("C", "D", 1), ("B", "C", 1), ("A", "B", 1)]
        best = {"A": 0}
        rounds = 0
        changed = True
        while changed:
            changed = False
            rounds = rounds + 1
            for a, b, price in edges:
                if a in best:
                    new = best[a] + price
                    if b not in best or new < best[b]:
                        best[b] = new
                        changed = True
        print(rounds, best["D"])
      `,
      answer: '4 3',
      why: 'The list is backwards, so each round reaches only 1 more stop. Round 4 changes nothing, and that ends the loop.',
      explain: 'Round 1 finds B, round 2 finds C, and round 3 finds D. Round 4 changes nothing. D costs 3.',
      hints: ['In round 1, which edge has a first stop with a cost?', 'Write the table after each round.'],
    },
    { id: 'fix-missing-check', type: 'fix', level: 2,
      q: 'This code crashes with a `KeyError` on an edge whose first stop has no cost yet. Fix it, so that edge gets skipped for now.',
      code: py`
        def bellman_ford(nodes, edges, start):
            best = {start: 0}
            for turn in range(len(nodes)):
                changed = False
                for a, b, price in edges:
                    new = best[a] + price
                    if b not in best or new < best[b]:
                        best[b] = new
                        changed = True
                if not changed:
                    return best
            return None
      `,
      answer: py`
        def bellman_ford(nodes, edges, start):
            best = {start: 0}
            for turn in range(len(nodes)):
                changed = False
                for a, b, price in edges:
                    if a in best:
                        new = best[a] + price
                        if b not in best or new < best[b]:
                            best[b] = new
                            changed = True
                if not changed:
                    return best
            return None
      `,
      tests: [
        { label: 'A backwards edge list works', call: 'bellman_ford("ABC", [("B", "C", 1), ("A", "B", 1)], "A")', want: '{"A": 0, "B": 1, "C": 2}' },
        { label: 'A negative edge works', call: 'bellman_ford("ABC", [("A", "B", 5), ("A", "C", 2), ("C", "B", -1)], "A")["B"]', want: '1' },
        { label: 'A stop with no route stays out', call: 'bellman_ford("ABC", [("C", "B", 1)], "A")', want: '{"A": 0}' },
        { label: 'A negative cycle gives None', call: 'bellman_ford("AB", [("A", "B", 1), ("B", "A", -2)], "A")', want: 'None' },
      ],
      explain: 'With no cost for `a`, there is nothing to add the fare to. So check `if a in best:` first.',
      hints: ['Which name is missing from `best`?', 'Put the 4 lines that use `best[a]` inside an `if`.'],
    },
    { id: 'write-has-cycle', type: 'write', level: 2,
      q: 'Write `has_gain_loop(nodes, edges, start)`. Return `True` if the start can reach a [[negative cycle]], and `False` if not. Each edge is `(a, b, price)`.',
      starter: 'def has_gain_loop(nodes, edges, start):\n    # Your code here\n    return "?"\n',
      answer: 'def has_gain_loop(nodes, edges, start):\n    best = {start: 0}\n    for turn in range(len(nodes)):\n        changed = False\n        for a, b, price in edges:\n            if a in best:\n                new = best[a] + price\n                if b not in best or new < best[b]:\n                    best[b] = new\n                    changed = True\n        if not changed:\n            return False\n    return True\n',
      tests: [
        { label: 'A loop of -1 is found', call: 'has_gain_loop("AB", [("A", "B", 2), ("B", "A", -3)], "A")', want: 'True' },
        { label: 'A loop of 0 does not count', call: 'has_gain_loop("AB", [("A", "B", 3), ("B", "A", -3)], "A")', want: 'False' },
        { label: 'A negative edge with no loop', call: 'has_gain_loop("ABC", [("A", "B", 2), ("B", "C", -5)], "A")', want: 'False' },
        { label: 'The start cannot reach the loop', call: 'has_gain_loop("ABC", [("B", "C", -2), ("C", "B", 1)], "A")', want: 'False' },
        { label: 'No edges at all', call: 'has_gain_loop("A", [], "A")', want: 'False' },
      ],
      explain: 'Run up to V rounds. If a round changes nothing, no loop is there. If round V still changes the table, one is.',
      hints: ['Start from `bellman_ford` in this lesson.', 'Return `False` where it returned `best`.', 'Return `True` where it returned `None`.'],
    },
    { id: 'floyd-why', type: 'mcq', level: 2,
      q: 'A map has 10 stops. You need the cheapest cost for every pair. Count the checks: 3 loops over 10 stops. How many is that?',
      options: [
        { text: '30', why: 'That adds 10 three times. Loops inside each other multiply.' },
        { text: '100', why: 'That is 2 loops. Floyd-Warshall has a third loop, for the middle stop.' },
        '1000',
      ],
      answer: 2,
      explain: '10 x 10 x 10 is 1000. That is why this tool suits small maps.',
      hints: ['Each loop runs in full for each trip of the loop around it.'],
    },
    { id: 'write-k-rides', type: 'write', level: 3,
      q: 'Stretch: you may take at most `k` rides. Write `cheapest_rides(edges, start, goal, k)`. Return the lowest cost, or -1 if no route fits. Do `k` rounds. Each round must read only the costs from the round before.',
      starter: 'def cheapest_rides(edges, start, goal, k):\n    # Your code here\n    return "?"\n',
      answer: 'def cheapest_rides(edges, start, goal, k):\n    best = {start: 0}\n    for turn in range(k):\n        new_best = best.copy()\n        for a, b, price in edges:\n            if a in best:\n                new = best[a] + price\n                if b not in new_best or new < new_best[b]:\n                    new_best[b] = new\n        best = new_best\n    if goal in best:\n        return best[goal]\n    return -1\n',
      tests: [
        { label: '1 ride must take the costly direct route', call: 'cheapest_rides([("A", "C", 9), ("A", "B", 2), ("B", "C", 3)], "A", "C", 1)', want: '9' },
        { label: '2 rides can take the cheap route', call: 'cheapest_rides([("A", "C", 9), ("A", "B", 2), ("B", "C", 3)], "A", "C", 2)', want: '5' },
        { label: 'One round cannot chain 2 rides', call: 'cheapest_rides([("A", "B", 1), ("B", "C", 1)], "A", "C", 1)', want: '-1' },
        { label: 'No rides, and the goal is the start', call: 'cheapest_rides([("A", "B", 1)], "A", "A", 0)', want: '0' },
        { label: 'A goal with no route', call: 'cheapest_rides([("A", "B", 1)], "A", "Z", 5)', want: '-1' },
      ],
      explain: 'After round 1, the table knows every route of 1 ride. After round k, it knows routes of up to k rides. The copy stops 2 rides from chaining in 1 round.',
      hints: ['`best.copy()` makes a new dict for this round.', 'Read from `best`, and write to `new_best`.', 'Set `best = new_best` at the end of each round.'],
    },
  ],
});
