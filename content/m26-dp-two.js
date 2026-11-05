/* Module 26: Dynamic Programming II. Part 4 (Advanced). */
Course.module({
  id: 'm26-dp-two',
  num: 26, part: 4, level: 'A',
  title: 'Dynamic Programming II',
  blurb: 'Fill a table of small answers to solve grids, packing and word puzzles.',
  needs: ['m25-dp-one'],
});

// ---------------------------------------------------------------- lesson 26.1
Course.lesson('m26-dp-two', {
  id: '26-1-grid-dp',
  num: '26.1',
  title: 'Grid DP: count the paths, then find the cheapest',
  goal: 'You can fill a grid table by hand, and name the 2 cells each answer reads.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How many ways can a robot cross a grid?' },
    { t: 'p', text: 'A robot stands in the top left square of a grid. It wants the bottom right square. It can step only right or down.' },
    { t: 'q', id: 'spark-count', type: 'mcq', level: 1,
      q: 'The grid has 2 rows and 3 columns. Trace with your finger. How many different paths are there?',
      options: [
        { text: '2', why: 'You may have found only the 2 paths along the edges. One path also steps down in the middle.' },
        '3',
        { text: '6', why: '2 x 3 counts the squares. A path is a whole route, not one square.' },
      ],
      answer: 1,
      explain: 'Right, right, down. Right, down, right. Down, right, right. That makes 3.',
      hints: ['Every path has 2 steps right and 1 step down.', 'Where can the 1 step down go?'],
    },
    { t: 'p', text: 'Listing works on a tiny grid. A 10 by 10 grid has 48620 paths, and nobody wants to list those. So you use the DP recipe, and save small answers.' },
    { t: 'words', items: [
      { word: 'grid DP', means: 'DP with a table shaped like the grid. Each cell holds the answer for that spot.' },
      { word: 'obstacle', means: 'A blocked cell that no path can use.', say: 'OB-stuh-kul' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Go back to the wall of sticky notes. Now the notes sit in rows and columns. Each new note reads the note above it and the note to its left. A real wall lets you stick notes anywhere. Here the picture stops being true, as those 2 notes must come first.' },
    { t: 'big', text: 'Every path into a [[cell]] takes its last step from above or from the left. So add those 2 answers.' },
    { t: 'steps', title: 'The recipe for counting paths', noun: 'Part', items: [
      { label: 'State', text: 'This is what one cell means. `ways[r][c]` is the number of paths from the start to row r, column c.' },
      { label: 'Transition', text: 'Each cell reads 2 cells that are already done.', code: 'ways[r][c] = ways[r - 1][c] + ways[r][c - 1]' },
      { label: 'Base case', text: 'There is 1 way to stand at the start. A cell with nothing above or to its left counts that side as 0.', code: 'ways[0][0] = 1' },
      { label: 'Order', text: 'Fill row by row, and left to right in each row. Then above and left are always ready.' },
    ] },
    { t: 'viz', name: 'm26-paths', caption: 'Answer before each cell fills. Then block a cell: type 1,1 and try 0,1. Try 1 row as well.' },
    { t: 'q', id: 'read-cells', type: 'mcq', level: 2,
      q: 'Which cells does `ways[2][3]` read?',
      options: [
        '`ways[1][3]` and `ways[2][2]`',
        { text: '`ways[3][3]` and `ways[2][4]`', why: 'Those are below and to the right. The robot never comes from there, and they are not filled yet.' },
        { text: '`ways[1][2]` only', why: 'That is the cell up and to the left. The robot has no diagonal step.' },
      ],
      answer: 0,
      explain: 'Above means one row less. Left means one column less.',
      hints: ['Which number changes for the cell above?', 'Keep the row the same for the cell to the left.'],
    },
    { t: 'code', caption: 'Here is the table in code, with a check for each side. Run it, then try 4 rows and 4 columns.',
      code: py`
        def path_table(rows, cols):
            ways = [[0] * cols for r in range(rows)]
            for r in range(rows):
                for c in range(cols):
                    if r == 0 and c == 0:
                        ways[r][c] = 1
                    else:
                        above = 0
                        left = 0
                        if r > 0:
                            above = ways[r - 1][c]
                        if c > 0:
                            left = ways[r][c - 1]
                        ways[r][c] = above + left
            return ways

        for row in path_table(3, 4):
            print(row)
      `,
      output: '[1, 1, 1, 1]\n[1, 2, 3, 4]\n[1, 3, 6, 10]',
    },
    { t: 'q', id: 'wall-predict', type: 'predict', level: 2,
      q: 'In this grid, 1 marks an [[obstacle]]. What will the screen show?',
      code: py`
        def count_paths(grid):
            rows = len(grid)
            cols = len(grid[0])
            ways = [[0] * cols for r in range(rows)]
            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] == 1:
                        ways[r][c] = 0
                    elif r == 0 and c == 0:
                        ways[r][c] = 1
                    else:
                        above = 0
                        left = 0
                        if r > 0:
                            above = ways[r - 1][c]
                        if c > 0:
                            left = ways[r][c - 1]
                        ways[r][c] = above + left
            return ways[rows - 1][cols - 1]

        print(count_paths([[0, 1, 0],
                           [0, 0, 0]]))
      `,
      options: [
        { text: '3', why: 'That is the count with no wall. A blocked cell gets 0, so it passes on nothing.' },
        '1',
        { text: '0', why: 'A wall does not stop every path. The robot can step down first, then go right.' },
      ],
      answer: 1,
      explain: 'Only down, right, right still works. The other 2 paths use the blocked cell.',
      hints: ['A blocked cell has 0 paths through it.', 'Try each path with your finger.'],
    },
    { t: 'h', text: 'What if each cell has a price?' },
    { t: 'p', text: 'Now the robot pays for every cell it stands on, including the start. You want the cheapest path. You do not add the 2 ways in, because the robot uses only one of them.' },
    { t: 'q', id: 'hand-cheapest', type: 'mcq', level: 2,
      q: 'The top row costs 1 and 5. The bottom row costs 2 and 1. What is the cheapest total?',
      options: [
        { text: '7', why: 'That is the path that goes right first: 1 + 5 + 1. Check the other path too.' },
        '4',
        { text: '9', why: 'That adds all 4 prices. The robot stands on only 3 cells.' },
      ],
      answer: 1,
      explain: 'Going down first costs 1 + 2 + 1 = 4. Going right first costs 7.',
      hints: ['There are only 2 paths. Add up each one.'],
    },
    { t: 'viz', name: 'm26-min-path', caption: 'The 2 looks cheap, yet that way leads to the 9s. Change the prices, or try a single row.' },
    { t: 'q', id: 'fill-min', type: 'fill', level: 2,
      q: 'Fill the gap, so each cell pays its price plus the cheaper way in.',
      code: py`
        cost = [[1, 5],
                [2, 1]]
        best = [[1, 6],
                [3, 0]]
        best[1][1] = cost[1][1] + ____(best[0][1], best[1][0])
        print(best[1][1])
      `,
      blanks: ['min'],
      output: '4',
      explain: 'The robot arrives by one way, so it picks the cheaper. `min` hands back the smaller number.',
      hints: ['You want the smaller of 2 numbers.', 'Which built-in gives the smallest?'],
    },
    { t: 'trap',
      think: 'If I read `best[r - 1][c]` when r is 0, Python will warn me.',
      real: 'No. `best[-1]` is the last row, so Python hands back a wrong number with no error. Treat the top row and left column on their own.',
      code: py`
        best = [[1, 2], [9, 9]]
        print(best[0 - 1][0])   # 9, from the last row
      `,
    },
    { t: 'q', id: 'count-cells', type: 'mcq', level: 2,
      q: 'Count before we name it. A table has 4 rows and 5 columns. Each cell takes one step. How many steps?',
      options: [
        { text: '9', why: 'That adds the rows and columns. Each of the 4 rows has 5 cells to fill.' },
        '20',
        { text: '35', why: 'That is how many paths there are. You fill cells, and you do not walk every path.' },
      ],
      answer: 1,
      explain: '4 rows of 5 cells make 20 cells, and each one is filled once.',
      hints: ['How many cells are in one row?', 'How many rows are there?'],
    },
    { t: 'p', text: 'Now compare with plain recursion, which walks every path again and again. The list `calls` counts its calls. Compare that with the cell count.' },
    { t: 'code', caption: 'A size of 5 means 5 rows and 5 columns. Run it, and add a size of 11.',
      code: py`
        calls = [0]

        def paths(r, c):
            calls[0] = calls[0] + 1
            if r == 0 or c == 0:
                return 1
            return paths(r - 1, c) + paths(r, c - 1)

        for size in [3, 5, 8, 10]:
            calls[0] = 0
            answer = paths(size - 1, size - 1)
            print(size, "paths:", answer)
            print("  calls:", calls[0], "cells:", size * size)
      `,
      output: '3 paths: 6\n  calls: 11 cells: 9\n5 paths: 70\n  calls: 139 cells: 25\n8 paths: 3432\n  calls: 6863 cells: 64\n10 paths: 48620\n  calls: 97239 cells: 100',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Fill the table', cost: 'O(rows x cols)', why: 'Each cell is filled once. Each read of a list spot is O(1).' },
      { op: 'Memory for the table', cost: 'O(rows x cols)', why: 'You keep one number per cell.' },
      { op: 'Plain recursion', cost: 'Far more', why: 'It grows with the number of paths, and that grows very fast.' },
    ] },
    { t: 'table', caption: 'How to spot grid DP', head: ['If the problem says...', 'Think of...'], rows: [
      ['"only right or down", "how many paths"', 'Add above and left'],
      ['"cheapest path", "only right or down"', 'Price + min of above and left'],
      ['"most coins", "only right or down"', 'Value + max of above and left'],
      ['"may move in any direction"', 'Not this. Paths can loop, so no fill order exists. Think of BFS (module 21) or Dijkstra (module 24).'],
    ] },
  ],
  recap: [
    'You can state the recipe for a grid table.',
    'You can fill cells by hand from above and left.',
    'You can handle blocked cells, a single row, and the edges.',
  ],
  practice: [
    { id: 'one-row', type: 'mcq', level: 1,
      q: 'A grid has 1 row and 5 columns. How many paths cross it?',
      options: [
        '1',
        { text: '5', why: 'That counts the cells. All 5 cells are on the same single path.' },
        { text: '0', why: 'The robot can reach the end. It has only one choice at each step: right.' },
      ],
      answer: 0,
      explain: 'The robot can only step right, so there is one path.',
      hints: ['Can the robot ever step down here?'],
    },
    { id: 'trace-table', type: 'trace', level: 2,
      q: 'Fill in the table for 2 rows and 3 columns, cell by cell.',
      code: py`
        ways = [[1, 1, 1], [1, 0, 0]]
        for r in range(2):
            for c in range(3):
                if r > 0 and c > 0:
                    ways[r][c] = ways[r - 1][c] + ways[r][c - 1]
                print(r, c, ways[r][c])
      `,
      head: ['r', 'c', 'ways'],
      rows: [['0', '0', '1'], ['0', '1', '1'], ['0', '2', '1'], ['1', '0', '1'], ['1', '1', '2'], ['1', '2', '3']],
      given: 2,
      verify: 'ways = [[1, 1, 1], [1, 0, 0]]\nfor r in range(2):\n    for c in range(3):\n        if r > 0 and c > 0:\n            ways[r][c] = ways[r - 1][c] + ways[r][c - 1]\n        print(r, c, ways[r][c])',
      explain: 'The last cell reads 1 from above and 2 from the left. So 3 paths reach it, as you counted at the start.',
      hints: ['The edges are all 1.', 'For r 1 and c 1, add the cell above and the cell to the left.'],
    },
    { id: 'which-tool', type: 'mcq', level: 2,
      q: 'A robot can step up, down, left or right. You want its fewest steps across a grid. Why does grid DP fit badly?',
      options: [
        { text: 'The grid is too big for a table', why: 'Size is not the problem. Even a tiny grid has this trouble.' },
        'Each cell could need a cell that is not done yet',
        { text: 'DP cannot find a smallest number', why: 'DP finds smallest numbers often, as cheapest path shows. The trouble is the order.' },
      ],
      answer: 1,
      explain: 'With all 4 moves, paths can loop, so no fill order works. BFS from module 21 fits this problem.',
      hints: ['Think about the Order part of the recipe.', 'Could 2 cells each need the other one first?'],
    },
    { id: 'fix-negative', type: 'fix', level: 2,
      q: 'This function should find the cheapest total, but it reads past the edges. Fix it.',
      code: py`
        def cheapest(cost):
            rows = len(cost)
            cols = len(cost[0])
            best = [[0] * cols for r in range(rows)]
            for r in range(rows):
                for c in range(cols):
                    if r == 0 and c == 0:
                        best[r][c] = cost[r][c]
                    else:
                        up = best[r - 1][c]
                        lf = best[r][c - 1]
                        best[r][c] = cost[r][c] + min(up, lf)
            return best[rows - 1][cols - 1]
      `,
      answer: py`
        def cheapest(cost):
            rows = len(cost)
            cols = len(cost[0])
            best = [[0] * cols for r in range(rows)]
            for r in range(rows):
                for c in range(cols):
                    if r == 0 and c == 0:
                        best[r][c] = cost[r][c]
                    elif r == 0:
                        best[r][c] = cost[r][c] + best[r][c - 1]
                    elif c == 0:
                        best[r][c] = cost[r][c] + best[r - 1][c]
                    else:
                        up = best[r - 1][c]
                        lf = best[r][c - 1]
                        best[r][c] = cost[r][c] + min(up, lf)
            return best[rows - 1][cols - 1]
      `,
      tests: [
        { label: 'cheapest([[1, 2], [3, 4]])', call: 'cheapest([[1, 2], [3, 4]])', want: '7' },
        { label: 'cheapest([[5]])', call: 'cheapest([[5]])', want: '5' },
        { label: 'cheapest([[1, 2, 3]])', call: 'cheapest([[1, 2, 3]])', want: '6' },
        { label: 'cheapest([[1], [2], [3]])', call: 'cheapest([[1], [2], [3]])', want: '6' },
        { label: 'cheapest([[1, 2, 1], [3, 9, 9], [1, 1, 1]])', call: 'cheapest([[1, 2, 1], [3, 9, 9], [1, 1, 1]])', want: '7' },
      ],
      explain: 'A negative index reads the far side of the table, and those cells still hold 0. The top row has one way in, and so does the left column.',
      hints: ['What does `best[r - 1][c]` read when r is 0?', 'Add one case for r == 0 and one for c == 0.'],
    },
    { id: 'write-count', type: 'write', level: 2,
      q: 'Write `count_paths(grid)`. In the grid, 1 means blocked and 0 means free. Hand back how many paths reach the bottom right.',
      starter: py`
        def count_paths(grid):
            rows = len(grid)
            cols = len(grid[0])
            # Your code here.
            return 0
      `,
      answer: py`
        def count_paths(grid):
            rows = len(grid)
            cols = len(grid[0])
            ways = [[0] * cols for r in range(rows)]
            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] == 1:
                        ways[r][c] = 0
                    elif r == 0 and c == 0:
                        ways[r][c] = 1
                    else:
                        above = 0
                        left = 0
                        if r > 0:
                            above = ways[r - 1][c]
                        if c > 0:
                            left = ways[r][c - 1]
                        ways[r][c] = above + left
            return ways[rows - 1][cols - 1]
      `,
      tests: [
        { label: 'no walls, 2 by 2', call: 'count_paths([[0, 0], [0, 0]])', want: '2' },
        { label: 'no walls, 3 by 3', call: 'count_paths([[0, 0, 0], [0, 0, 0], [0, 0, 0]])', want: '6' },
        { label: 'wall in the middle', call: 'count_paths([[0, 0, 0], [0, 1, 0], [0, 0, 0]])', want: '2' },
        { label: 'wall on the top row', call: 'count_paths([[0, 1, 0], [0, 0, 0]])', want: '1' },
        { label: 'blocked start', call: 'count_paths([[1, 0], [0, 0]])', want: '0' },
        { label: 'blocked end', call: 'count_paths([[0, 0], [0, 1]])', want: '0' },
        { label: 'one cell', call: 'count_paths([[0]])', want: '1' },
      ],
      explain: 'A blocked cell stays 0, so it passes on nothing. Checking the wall first also covers a blocked start.',
      hints: ['Build the table the safe way, with a new list for each row.', 'Check for a wall first, then the start, then the normal case.', 'Use `above = 0` and `left = 0`, then read them only if `r > 0` and `c > 0`.'],
    },
    { id: 'most-coins', type: 'write', level: 3,
      q: 'Stretch: write `most_coins(grid)`. The robot steps right or down, and takes the coins in each cell. A cell of -1 is a wall. Hand back the most coins, or -1 if no path exists.',
      starter: py`
        def most_coins(grid):
            rows = len(grid)
            cols = len(grid[0])
            # Your code here.
            return 0
      `,
      answer: py`
        def most_coins(grid):
            rows = len(grid)
            cols = len(grid[0])
            best = [[-1] * cols for r in range(rows)]
            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] == -1:
                        continue
                    if r == 0 and c == 0:
                        best[r][c] = grid[r][c]
                        continue
                    came = -1
                    if r > 0:
                        came = max(came, best[r - 1][c])
                    if c > 0:
                        came = max(came, best[r][c - 1])
                    if came >= 0:
                        best[r][c] = came + grid[r][c]
            return best[rows - 1][cols - 1]
      `,
      tests: [
        { label: 'small grid', call: 'most_coins([[1, 3], [2, 1]])', want: '5' },
        { label: '3 by 3', call: 'most_coins([[0, 5, 0], [2, 0, 9], [1, 1, 1]])', want: '15' },
        { label: 'wall forces a way round', call: 'most_coins([[1, -1], [2, 3]])', want: '6' },
        { label: 'no path', call: 'most_coins([[1, -1], [-1, 3]])', want: '-1' },
        { label: 'blocked start', call: 'most_coins([[-1, 2], [3, 4]])', want: '-1' },
        { label: 'one cell', call: 'most_coins([[4]])', want: '4' },
        { label: 'one row', call: 'most_coins([[1, 2, 3]])', want: '6' },
      ],
      explain: 'Use -1 in the table for "cannot reach". A cell counts only if some way in reached it. So 0 coins stays different from no path.',
      hints: ['Start the whole table at -1, meaning "cannot reach".', 'Use `max` on the cells you can read.', 'Add this cell\'s coins only if some way in is 0 or more.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 26.2
Course.lesson('m26-dp-two', {
  id: '26-2-knapsack',
  num: '26.2',
  title: 'Knapsack: take it or skip it, and which way the loop runs',
  goal: 'You can fill a knapsack table, and pick the loop direction that fits the rules.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What would you pack in a small bag?' },
    { t: 'p', text: 'Your bag holds 4 kg. A book weighs 3 kg and is worth 4 points. A ball weighs 2 kg and is worth 3. A kite weighs 2 kg and is also worth 3.' },
    { t: 'q', id: 'spark-pack', type: 'mcq', level: 1,
      q: 'You have one of each item. What is the highest value that fits?',
      options: [
        { text: '4', why: 'That is the greedy way: grab the most valuable item first. The book leaves only 1 kg, so nothing else fits.' },
        '6',
        { text: '10', why: 'All 3 items weigh 7 kg together, and the bag holds only 4.' },
      ],
      answer: 1,
      explain: 'The ball and the kite weigh 4 kg together, and they are worth 6.',
      hints: ['Try the book first. How much room is left?', 'Now try leaving the book out.'],
    },
    { t: 'words', items: [
      { word: '0/1 knapsack', means: 'Pack a bag for the most value. Each item goes in once or not at all.', say: 'NAP-sack' },
      { word: 'unbounded knapsack', means: 'Pack a bag for the most value. Each item can go in many times.', say: 'un-BOWN-ded' },
      { word: 'capacity', means: 'The most a bag can hold. Code often calls it `cap`.', say: 'kuh-PASS-ih-tee' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Back to the wall of notes. Each row of notes brings in one more item. Each column is a bag of a different size. Here the picture of a bag stops being true: a real bag also cares about shape, and here only weight counts.' },
    { t: 'steps', title: 'The recipe for 0/1 knapsack', noun: 'Part', items: [
      { label: 'State', text: '`best[i][c]` is the highest value using the first i items in a bag of size c.' },
      { label: 'Transition', text: 'Skip the item and read the cell above. Or take it, and read the row above at c - weight. Keep the bigger.', code: 'skip = best[i - 1][c]\ntake = best[i - 1][c - weight] + value' },
      { label: 'Base case', text: 'With no items, the value is 0. That fills row 0.' },
      { label: 'Order', text: 'Fill row by row. Each row reads only the row above it.' },
    ] },
    { t: 'viz', name: 'm26-knap-table', caption: 'A, B and C are the book, ball and kite. Say your answer before each cell fills. Then pack your own items.' },
    { t: 'q', id: 'take-cell', type: 'mcq', level: 2,
      q: 'Item 2 weighs 3. Which cell does "take" read to fill `best[2][5]`?',
      options: [
        '`best[1][2]`',
        { text: '`best[2][2]`', why: 'That cell is in the same row, so it may already hold item 2. Then you would pack item 2 twice.' },
        { text: '`best[1][5]`', why: 'That cell is the skip choice. Taking the item uses up 3 kg of the bag.' },
      ],
      answer: 0,
      explain: 'Take the item, and 5 - 3 = 2 kg are left. The earlier items fill those 2 kg, so read row 1.',
      hints: ['How much room is left after you take it?', 'Which row holds only the earlier items?'],
    },
    { t: 'code', caption: 'This is the table from the picture. Run it. Then change the bag to 5, and guess first.',
      code: py`
        items = [(3, 4), (2, 3), (2, 3)]
        cap = 4
        n = len(items)
        best = [[0] * (cap + 1) for i in range(n + 1)]
        for i in range(1, n + 1):
            weight, value = items[i - 1]
            for c in range(cap + 1):
                best[i][c] = best[i - 1][c]
                if c >= weight:
                    take = best[i - 1][c - weight] + value
                    best[i][c] = max(best[i][c], take)
        for row in best:
            print(row)
      `,
      output: '[0, 0, 0, 0, 0]\n[0, 0, 0, 4, 4]\n[0, 0, 3, 4, 4]\n[0, 0, 3, 4, 6]',
    },
    { t: 'q', id: 'count-knap', type: 'mcq', level: 2,
      q: 'Count before we name it. There are 3 items, and the bag holds 4. How many cells does the table have?',
      options: [
        { text: '12', why: 'You left out 2 lines: the row for no items, and the column for bag size 0.' },
        '20',
        { text: '7', why: 'That adds 3 and 4. The table has a cell for each row and column pair.' },
      ],
      answer: 1,
      explain: 'There are 3 + 1 rows and 4 + 1 columns, so 4 x 5 = 20 cells.',
      hints: ['Row 0 means no items at all.', 'Column 0 means a bag of size 0.'],
    },
    { t: 'h', text: 'How can one row do the job?' },
    { t: 'p', text: 'Each row reads only the row above it. So you can keep one list, and write each new row over the old one. A danger comes with that. The list now holds old values and new values side by side.' },
    { t: 'big', text: 'Right to left reads old values, so each item goes in once. Left to right reads new values, so items can repeat.' },
    { t: 'viz', name: 'm26-knap-row', caption: 'Run it right to left first. Then choose left to right, and watch bag 4. The letters show what each bag holds.' },
    { t: 'code', caption: 'One line changes between the 2 functions. Run it, then add an item of your own.',
      code: py`
        def pack_once(items, cap):
            best = [0] * (cap + 1)
            for weight, value in items:
                for c in range(cap, weight - 1, -1):
                    take = best[c - weight] + value
                    best[c] = max(best[c], take)
            return best[cap]

        def pack_many(items, cap):
            best = [0] * (cap + 1)
            for weight, value in items:
                for c in range(weight, cap + 1):
                    take = best[c - weight] + value
                    best[c] = max(best[c], take)
            return best[cap]

        items = [(2, 3), (3, 5)]
        print(pack_once(items, 6))
        print(pack_many(items, 6))
      `,
      output: '8\n10',
    },
    { t: 'q', id: 'predict-direction', type: 'predict', level: 2,
      q: 'One item weighs 1 and is worth 2. The bag holds 3. What will the screen show?',
      code: py`
        best = [0] * 4
        for c in range(1, 4):
            take = best[c - 1] + 2
            best[c] = max(best[c], take)
        print(best[3])
      `,
      options: [
        { text: '2', why: 'That is the answer for one of each item. This loop runs left to right, so it reads the new values.' },
        '6',
        { text: '4', why: 'Keep going: bag 3 reads bag 2, and bag 2 already holds 4. So the item goes in a third time.' },
      ],
      answer: 1,
      explain: 'Bag 1 gets 2, bag 2 reads that and gets 4, and bag 3 gets 6. The item went in 3 times.',
      hints: ['Write `best` after each trip.', 'Which way does `range(1, 4)` run?'],
    },
    { t: 'trap',
      think: 'The loop direction is a matter of style. The same cells get filled.',
      real: 'The direction changes the answer. In one row, left to right lets an item pack again and again. Use it only when items never run out.',
      code: py`
        for c in range(cap, weight - 1, -1):  # each item once
        for c in range(weight, cap + 1):      # items can repeat
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Time for either knapsack', cost: 'O(items x cap)', why: 'Each item visits each bag size once.' },
      { op: 'Memory for the full table', cost: 'O(items x cap)', why: 'You keep one number per cell.' },
      { op: 'Memory for one row', cost: 'O(cap)', why: 'You keep one number per bag size. You lose the table, so you cannot walk back.' },
    ] },
    { t: 'tip', title: 'A big bag costs a lot', text: 'The table grows with the bag size, not only the item count. 10 items and a bag of 1000000 need 10000000 steps. Watch out for huge limits.' },
    { t: 'table', caption: 'How to spot knapsack', head: ['If the problem says...', 'Think of...'], rows: [
      ['"most value", "at most this weight", "one of each"', '0/1 knapsack: right to left'],
      ['"as many as you like", "endless supply"', 'Unbounded: left to right'],
      ['"fewest coins for this amount"', 'The same shape as unbounded. Coins never run out.'],
      ['"take a part of an item"', 'Not this. A greedy rule fits better: best value per kg first.'],
    ] },
  ],
  recap: [
    'You can fill a knapsack table with skip and take.',
    'You can squeeze the table into one row.',
    'You can pick the direction: once, or many times.',
  ],
  practice: [
    { id: 'match-cues', type: 'match', level: 1,
      q: 'Match each problem to what fits it.',
      pairs: [
        ['One of each toy, and a box that holds 10 kg', 'Loop right to left'],
        ['Buy any number of each sweet with 5 coins', 'Loop left to right'],
        ['Take the first item that looks best', 'Greedy, and it may fail'],
      ],
      explain: 'One of each means 0/1. Any number means unbounded. Grabbing the best-looking item gave only 4 in the book example.',
      hints: ['Can the same item go in twice?'],
    },
    { id: 'too-heavy', type: 'predict', level: 1,
      q: 'The only item is too heavy. Type what the screen will show.',
      code: py`
        def pack_once(items, cap):
            best = [0] * (cap + 1)
            for weight, value in items:
                for c in range(cap, weight - 1, -1):
                    take = best[c - weight] + value
                    best[c] = max(best[c], take)
            return best[cap]

        print(pack_once([(5, 9)], 4))
      `,
      answer: '0',
      why: 'The loop is `range(4, 4, -1)`, and that makes no trips.',
      explain: 'The inner loop makes no trips, so the row stays all 0. Nothing crashes.',
      hints: ['Write out `range(4, 4, -1)`.', 'Stop comes before any step is taken.'],
    },
    { id: 'trace-row', type: 'trace', level: 2,
      q: 'One item weighs 2 and is worth 3. Follow the right to left loop.',
      code: py`
        best = [0, 0, 0, 0, 0]
        for c in range(4, 1, -1):
            take = best[c - 2] + 3
            best[c] = max(best[c], take)
            print(c, take, best[c])
      `,
      head: ['c', 'take', 'best[c]'],
      rows: [['4', '3', '3'], ['3', '3', '3'], ['2', '3', '3']],
      given: 1,
      verify: 'best = [0, 0, 0, 0, 0]\nfor c in range(4, 1, -1):\n    take = best[c - 2] + 3\n    best[c] = max(best[c], take)\n    print(c, take, best[c])',
      explain: 'When c is 4, the loop reads `best[2]`, and that is still 0. So the item goes in only once.',
      hints: ['Going down from 4, is `best[2]` written yet?'],
    },
    { id: 'fix-direction', type: 'fix', level: 2,
      q: 'You have one of each item, but this code packs some twice. Fix it.',
      code: py`
        def pack_once(items, cap):
            best = [0] * (cap + 1)
            for weight, value in items:
                for c in range(weight, cap + 1):
                    take = best[c - weight] + value
                    best[c] = max(best[c], take)
            return best[cap]
      `,
      answer: py`
        def pack_once(items, cap):
            best = [0] * (cap + 1)
            for weight, value in items:
                for c in range(cap, weight - 1, -1):
                    take = best[c - weight] + value
                    best[c] = max(best[c], take)
            return best[cap]
      `,
      tests: [
        { label: 'one item, room for 2', call: 'pack_once([(2, 3)], 4)', want: '3' },
        { label: 'book, ball and kite', call: 'pack_once([(3, 4), (2, 3), (2, 3)], 4)', want: '6' },
        { label: 'small items', call: 'pack_once([(1, 1), (1, 1)], 3)', want: '2' },
        { label: 'no items', call: 'pack_once([], 5)', want: '0' },
        { label: 'too heavy', call: 'pack_once([(9, 9)], 3)', want: '0' },
      ],
      explain: 'Left to right reads values this item already changed. Right to left reads only old values.',
      hints: ['Which way should the loop run for one of each?', 'Stop before `weight - 1`, so `c` can equal `weight`.'],
    },
    { id: 'write-many', type: 'write', level: 2,
      q: 'Write `pack_many(items, cap)`. Each item is a pair `(weight, value)`, and you can pack any number of each. Hand back the highest value.',
      starter: py`
        def pack_many(items, cap):
            best = [0] * (cap + 1)
            # Your code here.
            return 0
      `,
      answer: py`
        def pack_many(items, cap):
            best = [0] * (cap + 1)
            for weight, value in items:
                for c in range(weight, cap + 1):
                    take = best[c - weight] + value
                    best[c] = max(best[c], take)
            return best[cap]
      `,
      tests: [
        { label: 'one item, repeated', call: 'pack_many([(2, 3)], 5)', want: '6' },
        { label: '2 items', call: 'pack_many([(2, 3), (3, 5)], 6)', want: '10' },
        { label: 'mix of 2', call: 'pack_many([(2, 3), (3, 5)], 5)', want: '8' },
        { label: 'too heavy', call: 'pack_many([(9, 9)], 3)', want: '0' },
        { label: 'no items', call: 'pack_many([], 5)', want: '0' },
        { label: 'empty bag', call: 'pack_many([(1, 1)], 0)', want: '0' },
      ],
      explain: 'Going left to right lets a bag read a smaller bag that already holds this item.',
      hints: ['Unpack each pair with `for weight, value in items:`.', 'Start the inner loop at `weight`.', 'Hand back `best[cap]`.'],
    },
    { id: 'which-items', type: 'write', level: 3,
      q: 'Stretch: write `which_items(items, cap)` for one of each. Build the full table, then walk back up it. Hand back the list of item indexes you packed, smallest first.',
      starter: py`
        def which_items(items, cap):
            n = len(items)
            best = [[0] * (cap + 1) for i in range(n + 1)]
            # Fill the table. Then walk back from best[n][cap].
            return []
      `,
      answer: py`
        def which_items(items, cap):
            n = len(items)
            best = [[0] * (cap + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                weight, value = items[i - 1]
                for c in range(cap + 1):
                    best[i][c] = best[i - 1][c]
                    if c >= weight:
                        take = best[i - 1][c - weight] + value
                        best[i][c] = max(best[i][c], take)
            picked = []
            c = cap
            for i in range(n, 0, -1):
                if best[i][c] != best[i - 1][c]:
                    picked.append(i - 1)
                    c = c - items[i - 1][0]
            picked.reverse()
            return picked
      `,
      tests: [
        { label: 'ball and kite', call: 'which_items([(3, 4), (2, 3), (2, 3)], 4)', want: '[1, 2]' },
        { label: 'first 2 items', call: 'which_items([(1, 1), (2, 5), (3, 2)], 3)', want: '[0, 1]' },
        { label: 'too heavy', call: 'which_items([(5, 5)], 4)', want: '[]' },
        { label: 'exact fit', call: 'which_items([(2, 3)], 2)', want: '[0]' },
        { label: 'no items', call: 'which_items([], 4)', want: '[]' },
      ],
      explain: 'If a cell beats the one above, it took item i - 1. Then you move to the room that was left. This walk needs the full table.',
      hints: ['Fill the table as the lesson does.', 'Go from row n up to row 1, with `c` starting at `cap`.', 'If `best[i][c]` differs from the cell above, add `i - 1` and take its weight off `c`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 26.3
Course.lesson('m26-dp-two', {
  id: '26-3-lcs',
  num: '26.3',
  title: 'Longest common subsequence: what 2 words share',
  goal: 'You can fill an LCS table for 2 words, and name the cells each cell reads.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What do 2 words have in common?' },
    { t: 'p', text: 'Lesson 25.6 made a [[subsequence]] from a list of numbers. Words work too. Cross out any letters you like, and the letters you keep stay in order.' },
    { t: 'q', id: 'spark-cross', type: 'mcq', level: 1,
      q: 'You can cross letters out of PLANT, but you cannot move them. Which can you make?',
      options: [
        'PAT',
        { text: 'TAP', why: 'It has the right letters, but T comes after P in PLANT. You cannot change the order.' },
        { text: 'PAIN', why: 'PLANT has no I. You can only cross letters out, not add them.' },
      ],
      answer: 0,
      explain: 'Cross out L and N from PLANT, and PAT is left.',
      hints: ['Read PLANT from left to right.', 'Do the letters come in that order?'],
    },
    { t: 'words', items: [
      { word: 'LCS', means: 'Longest common subsequence: the longest subsequence that 2 words share.' },
      { word: 'diagonal', means: 'The cell one up and one to the left.', say: 'die-AG-uh-nul' },
    ] },
    { t: 'q', id: 'hand-lcs', type: 'mcq', level: 2,
      q: 'Now try by hand. The words are ANT and TAN. How long is their [[LCS]]?',
      options: [
        { text: '3', why: 'They share 3 letters, but the order differs. T comes last in ANT and first in TAN.' },
        '2',
        { text: '1', why: 'Look for 2 letters in the same order in both words. Try A and N.' },
      ],
      answer: 1,
      explain: 'AN is in both words, in order. No 3 letters are in the same order in both.',
      hints: ['Try every pair of letters from ANT.', 'Does the pair also appear in that order in TAN?'],
    },
    { t: 'analogy', title: 'Picture this', text: 'Back to the wall of notes. Word a runs down the side, and word b runs across the top. Each note compares the start of a with the start of b. A wall has no row for nothing, but this table does: a spare row and column for an empty word.' },
    { t: 'big', text: 'Look at the last letters. If they match, use both. If not, drop one and keep the better answer.' },
    { t: 'steps', title: 'The recipe for LCS', noun: 'Part', items: [
      { label: 'State', text: '`t[i][j]` uses the first i letters of a and the first j letters of b. It holds their LCS length.' },
      { label: 'Transition', text: 'A match reads the [[diagonal]] and adds 1. No match reads above and left, and keeps the bigger.', code: 'if a[i - 1] == b[j - 1]:\n    t[i][j] = t[i - 1][j - 1] + 1\nelse:\n    t[i][j] = max(t[i - 1][j], t[i][j - 1])' },
      { label: 'Base case', text: 'An empty word shares nothing. So row 0 and column 0 are all 0. That spare row shifts the letters, so row i uses `a[i - 1]`.' },
      { label: 'Order', text: 'Fill row by row, left to right. Above, left and diagonal are then ready.' },
    ] },
    { t: 'viz', name: 'm26-lcs', caption: 'Answer before each cell fills. Then type your own 2 words, up to 5 letters each. Try an empty word and 2 words that match.' },
    { t: 'q', id: 'read-which', type: 'mcq', level: 2,
      q: 'The letters at `a[i - 1]` and `b[j - 1]` are different. What does the cell read?',
      options: [
        { text: 'Only the diagonal', why: 'The diagonal is for a match. With no match, at least one last letter goes unused.' },
        'Above and left, and it keeps the bigger',
        { text: 'Above and left, and it adds them', why: 'Adding would count the same letters twice. Each cell holds one length, so pick the better.' },
      ],
      answer: 1,
      explain: 'One last letter goes unused. Above drops the letter from a, and left drops the letter from b.',
      hints: ['Which letter can you drop?', 'You want the longest, so which built-in fits?'],
    },
    { t: 'code', caption: 'This prints the whole table. Run it, then change the words. Capital and small letters count as different.',
      code: py`
        def lcs_table(a, b):
            n = len(a)
            m = len(b)
            t = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        t[i][j] = t[i - 1][j - 1] + 1
                    else:
                        t[i][j] = max(t[i - 1][j], t[i][j - 1])
            return t

        for row in lcs_table("ANT", "TAN"):
            print(row)
      `,
      output: '[0, 0, 0, 0]\n[0, 0, 1, 1]\n[0, 0, 1, 2]\n[0, 1, 1, 2]',
    },
    { t: 'q', id: 'count-lcs', type: 'mcq', level: 2,
      q: 'Count before we name it. Word a has 4 letters, and word b has 3. How many cells need a compare?',
      options: [
        { text: '7', why: 'That adds the lengths. Each letter of a meets each letter of b.' },
        '12',
        { text: '20', why: 'That counts the spare row and column too. Those are the base case, with no compare.' },
      ],
      answer: 1,
      explain: 'Each of the 4 letters meets each of the 3 letters. So 4 x 3 = 12 compares.',
      hints: ['Row 0 and column 0 need no compare.'],
    },
    { t: 'p', text: 'Now see why the table is worth it. Each letter of a word is kept or crossed out. So one more letter doubles the choices, and n letters give 2^n.' },
    { t: 'code', caption: 'This counts steps for 2 words of the same length. Add 30 to the list and run it.',
      code: py`
        for n in [3, 5, 10, 20]:
            ways = 1
            for k in range(n):
                ways = ways * 2
            print(n, "letters:")
            print("  ways to cross out:", ways)
            print("  table compares:", n * n)
      `,
      output: '3 letters:\n  ways to cross out: 8\n  table compares: 9\n5 letters:\n  ways to cross out: 32\n  table compares: 25\n10 letters:\n  ways to cross out: 1024\n  table compares: 100\n20 letters:\n  ways to cross out: 1048576\n  table compares: 400',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Fill the LCS table', cost: 'O(n x m)', why: 'Each letter of a meets each letter of b once.' },
      { op: 'Memory for the table', cost: 'O(n x m)', why: 'You keep one number per cell, and you need them to walk back.' },
      { op: 'Trying every subsequence', cost: 'O(2^n)', why: 'One more letter doubles what you must try.' },
    ] },
    { t: 'trap',
      think: 'The shared letters must sit side by side.',
      real: 'No. A subsequence may have gaps, so ACE is inside ABCDE. Letters side by side make a substring, and that is a different problem.',
      code: py`
        word = "ABCDE"
        print("ACE" in word)   # False: "in" wants side by side
      `,
    },
    { t: 'table', caption: 'How to spot LCS', head: ['If the problem says...', 'Think of...'], rows: [
      ['"longest shared part", "in the same order"', 'LCS table'],
      ['"keep the order, but gaps are fine"', 'LCS table'],
      ['"compare 2 versions of a text"', 'LCS is the idea behind it'],
      ['"side by side", "with no gaps"', 'Not LCS. That is a different problem, called a substring.'],
    ] },
  ],
  recap: [
    'You can explain a subsequence and an LCS.',
    'You can fill the table: match reads the diagonal, no match reads 2 cells.',
    'You can cope with empty words and different lengths.',
  ],
  practice: [
    { id: 'not-subseq', type: 'mcq', level: 1,
      q: 'Which one is NOT a subsequence of STREAM?',
      options: [
        { text: 'STEM', why: 'Cross out R and A. S, T, E and M stay in order, so this one works.' },
        { text: 'TEA', why: 'T, E and A appear in this order in STREAM, so this one works.' },
        'MEAT',
      ],
      answer: 2,
      explain: 'M comes last in STREAM, so nothing can follow it. The order matters.',
      hints: ['Move your finger left to right through STREAM.', 'Can you ever go back?'],
    },
    { id: 'no-shared', type: 'predict', level: 1,
      q: 'These words share no letters. Type what the screen will show.',
      code: py`
        a = "DOG"
        b = "CAT"
        t = [[0] * 4 for i in range(4)]
        for i in range(1, 4):
            for j in range(1, 4):
                if a[i - 1] == b[j - 1]:
                    t[i][j] = t[i - 1][j - 1] + 1
                else:
                    t[i][j] = max(t[i - 1][j], t[i][j - 1])
        print(t[3][3])
      `,
      answer: '0',
      why: 'No letters match, so the code never adds 1.',
      explain: 'With no match, every cell keeps the bigger of 2 zeros. So the answer stays 0.',
      hints: ['Does the `if` line ever come true?'],
    },
    { id: 'repeats', type: 'predict', level: 2,
      q: 'These words use repeated letters. What will the screen show?',
      code: py`
        a = "ABAB"
        b = "BABA"
        n = len(a)
        m = len(b)
        t = [[0] * (m + 1) for i in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if a[i - 1] == b[j - 1]:
                    t[i][j] = t[i - 1][j - 1] + 1
                else:
                    t[i][j] = max(t[i - 1][j], t[i][j - 1])
        print(t[n][m])
      `,
      options: [
        { text: '4', why: 'Both words have 2 As and 2 Bs. But they start with different letters, so all 4 cannot line up.' },
        '3',
        { text: '2', why: 'Try for more. ABA is inside both words.' },
      ],
      answer: 1,
      explain: 'ABA is in both words, in order. So is BAB. No shared part has 4 letters.',
      hints: ['Cross out the last B of ABAB.', 'Is what is left inside BABA?'],
    },
    { id: 'trace-small', type: 'trace', level: 2,
      q: 'The words are AB and BA. Fill in each cell of the table.',
      code: py`
        a = "AB"
        b = "BA"
        t = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        for i in range(1, 3):
            for j in range(1, 3):
                if a[i - 1] == b[j - 1]:
                    t[i][j] = t[i - 1][j - 1] + 1
                else:
                    t[i][j] = max(t[i - 1][j], t[i][j - 1])
                print(i, j, t[i][j])
      `,
      head: ['i', 'j', 't[i][j]'],
      rows: [['1', '1', '0'], ['1', '2', '1'], ['2', '1', '1'], ['2', '2', '1']],
      given: 1,
      verify: 'a = "AB"\nb = "BA"\nt = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]\nfor i in range(1, 3):\n    for j in range(1, 3):\n        if a[i - 1] == b[j - 1]:\n            t[i][j] = t[i - 1][j - 1] + 1\n        else:\n            t[i][j] = max(t[i - 1][j], t[i][j - 1])\n        print(i, j, t[i][j])',
      explain: 'They share one letter at a time, A or B, but not both in order. So the answer is 1.',
      hints: ['For i 1 and j 2, compare A with A.', 'For i 2 and j 2, compare B with A.'],
    },
    { id: 'fix-index', type: 'fix', level: 2,
      q: 'This code crashes. It reads the wrong letters as well. Fix it.',
      code: py`
        def lcs_len(a, b):
            n = len(a)
            m = len(b)
            t = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i] == b[j]:
                        t[i][j] = t[i - 1][j - 1] + 1
                    else:
                        t[i][j] = max(t[i - 1][j], t[i][j - 1])
            return t[n][m]
      `,
      answer: py`
        def lcs_len(a, b):
            n = len(a)
            m = len(b)
            t = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        t[i][j] = t[i - 1][j - 1] + 1
                    else:
                        t[i][j] = max(t[i - 1][j], t[i][j - 1])
            return t[n][m]
      `,
      tests: [
        { label: 'lcs_len("ANT", "TAN")', call: 'lcs_len("ANT", "TAN")', want: '2' },
        { label: 'lcs_len("CAT", "CAT")', call: 'lcs_len("CAT", "CAT")', want: '3' },
        { label: 'lcs_len("A", "B")', call: 'lcs_len("A", "B")', want: '0' },
        { label: 'lcs_len("", "CAT")', call: 'lcs_len("", "CAT")', want: '0' },
      ],
      explain: 'The table has a spare row and column. So row i means the letter at index i - 1.',
      hints: ['What is `a[i]` when i equals `len(a)`?', 'Take 1 off both indexes.'],
    },
    { id: 'write-lcs', type: 'write', level: 2,
      q: 'Write `share_count(a, b)`. It hands back the LCS length of 2 words.',
      starter: py`
        def share_count(a, b):
            # Your code here.
            return 0
      `,
      answer: py`
        def share_count(a, b):
            n = len(a)
            m = len(b)
            t = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        t[i][j] = t[i - 1][j - 1] + 1
                    else:
                        t[i][j] = max(t[i - 1][j], t[i][j - 1])
            return t[n][m]
      `,
      tests: [
        { label: 'share_count("BIRD", "BARD")', call: 'share_count("BIRD", "BARD")', want: '3' },
        { label: 'share_count("ANT", "TAN")', call: 'share_count("ANT", "TAN")', want: '2' },
        { label: 'share_count("ABC", "ABC")', call: 'share_count("ABC", "ABC")', want: '3' },
        { label: 'share_count("ABC", "XYZ")', call: 'share_count("ABC", "XYZ")', want: '0' },
        { label: 'share_count("", "ABC")', call: 'share_count("", "ABC")', want: '0' },
        { label: 'share_count("aB", "AB")', call: 'share_count("aB", "AB")', want: '1' },
      ],
      explain: 'Make a table with one spare row and column. A match reads the diagonal, and any other cell reads above and left.',
      hints: ['The table needs `len(a) + 1` rows and `len(b) + 1` columns.', 'Compare `a[i - 1]` with `b[j - 1]`.', 'Hand back the bottom right cell.'],
    },
    { id: 'lcs-word', type: 'write', level: 3,
      q: 'Stretch: write `lcs_word(a, b)`. It hands back the shared letters, not the length. Fill the table, then walk back from the last cell.',
      starter: py`
        def lcs_word(a, b):
            n = len(a)
            m = len(b)
            t = [[0] * (m + 1) for i in range(n + 1)]
            # Fill the table. Then walk back from t[n][m].
            return ""
      `,
      answer: py`
        def lcs_word(a, b):
            n = len(a)
            m = len(b)
            t = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        t[i][j] = t[i - 1][j - 1] + 1
                    else:
                        t[i][j] = max(t[i - 1][j], t[i][j - 1])
            word = ""
            i = n
            j = m
            while i > 0 and j > 0:
                if a[i - 1] == b[j - 1]:
                    word = a[i - 1] + word
                    i = i - 1
                    j = j - 1
                elif t[i - 1][j] >= t[i][j - 1]:
                    i = i - 1
                else:
                    j = j - 1
            return word
      `,
      tests: [
        { label: 'lcs_word("PLANT", "PANTS")', call: 'lcs_word("PLANT", "PANTS")', want: '"PANT"' },
        { label: 'lcs_word("ABCDE", "ACE")', call: 'lcs_word("ABCDE", "ACE")', want: '"ACE"' },
        { label: 'lcs_word("ABC", "DEF")', call: 'lcs_word("ABC", "DEF")', want: '""' },
        { label: 'lcs_word("", "X")', call: 'lcs_word("", "X")', want: '""' },
        { label: 'lcs_word("SAME", "SAME")', call: 'lcs_word("SAME", "SAME")', want: '"SAME"' },
      ],
      explain: 'A match gives you a letter, so go up the diagonal. With no match, go to whichever cell the answer came from.',
      hints: ['Start with `i = n` and `j = m`.', 'On a match, put the letter at the front of your word.', 'With no match, move to the bigger of above and left.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 26.5 (bonus)
Course.lesson('m26-dp-two', {
  id: '26-4-space-and-subset-sum',
  num: '26.5',
  title: 'Keep one row, and solve subset-sum',
  goal: 'You can shrink a table to one row, and use it to answer a subset-sum question.',
  mins: 15,
  optional: true,
  steps: [
    { t: 'h', text: 'Do you need the whole table?' },
    { t: 'p', text: 'A table of 1000 rows and 1000 columns has 1000000 cells. Often you need only the last answer. So look at what each row really reads.' },
    { t: 'q', id: 'spark-rows', type: 'mcq', level: 1,
      q: 'You are filling row 7 of the path table from lesson 26.1. Which earlier rows does it read?',
      options: [
        { text: 'All rows from 0 to 6', why: 'You may think the whole table feeds each cell. The rule reads only above and left.' },
        'Only row 6',
        { text: 'None', why: 'Each cell reads the cell above it, and that is in row 6.' },
      ],
      answer: 1,
      explain: 'A cell reads above and left. Above is in row 6, and left is in row 7. Rows 0 to 5 can go.',
      hints: ['Which cells does `ways[r][c]` read?'],
    },
    { t: 'words', items: [
      { word: 'rolling row', means: 'Keep one list, and write each new row over the old one.' },
      { word: 'subset-sum', means: 'A puzzle: can some of these numbers add up to a target?' },
      { word: 'partition', means: 'Split all the numbers into 2 groups with the same total.', say: 'par-TISH-un' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'On your wall of notes, you only ever read the last row. So peel off the older rows, and write each new row over the last one. A real note is either old or new. A list can hold half new and half old values at once, so watch that part.' },
    { t: 'viz', name: 'm26-rolling', caption: 'Before each write, the spot still holds the value from above. Change the rows and columns.' },
    { t: 'code', caption: 'The answers match the table from lesson 26.1. Run it, then try bigger sizes.',
      code: py`
        def count_paths(rows, cols):
            row = [1] * cols
            for r in range(1, rows):
                for c in range(1, cols):
                    row[c] = row[c] + row[c - 1]
            return row[cols - 1]

        print(count_paths(3, 4))
        print(count_paths(5, 5))
        print(count_paths(1000, 2))
      `,
      output: '10\n70\n1000',
    },
    { t: 'q', id: 'row-order', type: 'mcq', level: 2,
      q: 'In this rolling row for paths, the loop runs left to right. Why is that right here?',
      options: [
        'The cell needs the new left value and the old above value',
        { text: 'All loops must run left to right', why: 'The 0/1 knapsack row runs right to left. Each problem has its own direction.' },
        { text: 'It does not matter here', why: 'It does. Right to left would read the old left value, from the row above.' },
      ],
      answer: 0,
      explain: 'Left is in the same row, so it must already be new. The spot itself is still the old value from above.',
      hints: ['Which cell is in the same row?', 'Is that cell written before this one?'],
    },
    { t: 'h', text: 'What if a cell needs the diagonal?' },
    { t: 'p', text: 'LCS reads the diagonal, and one list would write over it too soon. So keep 2 lists: the row before, and the row you are filling. Make a new list for each row.' },
    { t: 'code', caption: 'Memory now follows the length of b. Run it with your own words.',
      code: py`
        def lcs_small(a, b):
            prev = [0] * (len(b) + 1)
            for i in range(1, len(a) + 1):
                cur = [0] * (len(b) + 1)
                for j in range(1, len(b) + 1):
                    if a[i - 1] == b[j - 1]:
                        cur[j] = prev[j - 1] + 1
                    else:
                        cur[j] = max(prev[j], cur[j - 1])
                prev = cur
            return prev[len(b)]

        print(lcs_small("ANT", "TAN"))
        print(lcs_small("PLANT", "PANTS"))
        print(lcs_small("", "PANTS"))
      `,
      output: '2\n4\n0',
    },
    { t: 'trap',
      think: 'One row is always better, since it uses less memory.',
      real: 'You lose the old rows. You get the final number. But you cannot walk back to see the path or the letters. Keep the table if you need those.',
    },
    { t: 'h', text: 'Can some numbers add up to a target?' },
    { t: 'p', text: 'Here is a puzzle with one row. You have the numbers 3, 5 and 2. Can some of them add up to 7? Each number can be used once, so it works like 0/1 knapsack.' },
    { t: 'q', id: 'hand-subset', type: 'mcq', level: 2,
      q: 'Try it by hand. The numbers are 3, 5 and 2. Which target can you NOT make?',
      options: [
        { text: '7', why: '5 + 2 makes 7, so this one works.' },
        { text: '8', why: '3 + 5 makes 8, so this one works.' },
        '9',
      ],
      answer: 2,
      explain: 'The totals you can make are 0, 2, 3, 5, 7, 8 and 10. There is no 9.',
      hints: ['List every group of these numbers.', 'There are only 8 groups, and one is the empty group.'],
    },
    { t: 'steps', title: 'The recipe for subset-sum', noun: 'Part', items: [
      { label: 'State', text: '`can[c]` is True if some of the numbers so far add up to c.' },
      { label: 'Transition', text: 'For a number n, c works if c - n already worked.', code: 'if can[c - n]:\n    can[c] = True' },
      { label: 'Base case', text: 'Picking nothing makes 0. So `can[0]` is True.' },
      { label: 'Order', text: 'Take the numbers one by one. Loop right to left, so each number is used once.' },
    ] },
    { t: 'viz', name: 'm26-subset', caption: 'Say what comes next. Then try numbers 2 with target 4, and then 2, 2 with target 4. Try target 0.' },
    { t: 'code', caption: 'A partition is subset-sum in disguise. If the total is even, look for half of it.',
      code: py`
        def can_make(nums, target):
            can = [False] * (target + 1)
            can[0] = True
            for n in nums:
                for c in range(target, n - 1, -1):
                    if can[c - n]:
                        can[c] = True
            return can[target]

        def can_split(nums):
            total = sum(nums)
            if total % 2 == 1:
                return False
            return can_make(nums, total // 2)

        print(can_make([3, 5, 2], 7))
        print(can_make([3, 5, 2], 9))
        print(can_split([1, 5, 2, 4]))
        print(can_split([1, 2, 4]))
      `,
      output: 'True\nFalse\nTrue\nFalse',
    },
    { t: 'q', id: 'count-subset', type: 'mcq', level: 2,
      q: 'Count before we name it. The numbers are 1, 2 and 3, and the target is 4. How many trips does the inner loop make in all?',
      options: [
        { text: '7', why: 'That adds 3 numbers and the target of 4. Each number walks the row on its own.' },
        '9',
        { text: '15', why: 'That is 3 numbers times 5 spots. But the loop stops once c is below the number.' },
      ],
      answer: 1,
      explain: 'The number 1 makes 4 trips, 2 makes 3, and 3 makes 2. That is 9, and it can never pass 3 x 4.',
      hints: ['Write `range(4, n - 1, -1)` for each number.', 'Count the values for n = 1, then n = 2, then n = 3.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Subset-sum, time', cost: 'O(n x target)', why: 'Each of the n numbers walks the row once.' },
      { op: 'Subset-sum, memory', cost: 'O(target)', why: 'One True or False for each total.' },
      { op: 'Rolling row for paths, memory', cost: 'O(cols)', why: 'One number per column, instead of O(rows x cols).' },
      { op: 'Time, with one row', cost: 'No change', why: 'You still work out every cell. You only keep fewer of them.' },
    ] },
    { t: 'table', caption: 'How to spot these', head: ['If the problem says...', 'Think of...'], rows: [
      ['"can some of these add up to"', 'Subset-sum'],
      ['"split into 2 equal groups"', 'Partition: subset-sum for half the total'],
      ['"memory is tight", and only the final number matters', 'Rolling row'],
      ['"show the path" or "which items"', 'Keep the whole table'],
    ] },
  ],
  recap: [
    'You can turn a path table into a rolling row.',
    'You can say what you lose when you keep one row.',
    'You can solve subset-sum and partition with one row.',
  ],
  practice: [
    { id: 'lose-what', type: 'mcq', level: 1,
      q: 'What do you lose when you keep only one row?',
      options: [
        'The way to walk back through the table',
        { text: 'The right final answer', why: 'The final number stays the same. One row only keeps fewer old values.' },
        { text: 'Some of the speed', why: 'The time stays about the same. You still work out every cell.' },
      ],
      answer: 0,
      explain: 'The old rows are gone, so you cannot trace which cells led to the answer.',
      hints: ['What does a walk back need to read?'],
    },
    { id: 'target-zero', type: 'predict', level: 1,
      q: 'The target is 0. Type what the screen will show.',
      code: py`
        def can_make(nums, target):
            can = [False] * (target + 1)
            can[0] = True
            for n in nums:
                for c in range(target, n - 1, -1):
                    if can[c - n]:
                        can[c] = True
            return can[target]

        print(can_make([4, 6], 0))
      `,
      answer: 'True',
      why: 'Picking no numbers at all makes a total of 0.',
      explain: 'The base case makes `can[0]` True. The empty group counts, so no number is needed.',
      hints: ['What does the base case say?'],
    },
    { id: 'fix-up-loop', type: 'fix', level: 2,
      q: 'This code says one 2 can make 4. It uses numbers twice. Fix it.',
      code: py`
        def can_make(nums, target):
            can = [False] * (target + 1)
            can[0] = True
            for n in nums:
                for c in range(n, target + 1):
                    if can[c - n]:
                        can[c] = True
            return can[target]
      `,
      answer: py`
        def can_make(nums, target):
            can = [False] * (target + 1)
            can[0] = True
            for n in nums:
                for c in range(target, n - 1, -1):
                    if can[c - n]:
                        can[c] = True
            return can[target]
      `,
      tests: [
        { label: 'can_make([2], 4)', call: 'can_make([2], 4)', want: 'False' },
        { label: 'can_make([2, 2], 4)', call: 'can_make([2, 2], 4)', want: 'True' },
        { label: 'can_make([3, 5, 2], 7)', call: 'can_make([3, 5, 2], 7)', want: 'True' },
        { label: 'can_make([3, 5, 2], 9)', call: 'can_make([3, 5, 2], 9)', want: 'False' },
        { label: 'can_make([], 0)', call: 'can_make([], 0)', want: 'True' },
        { label: 'can_make([], 3)', call: 'can_make([], 3)', want: 'False' },
      ],
      explain: 'Left to right reads spots this number already turned True. Right to left reads only old spots.',
      hints: ['Which way must the loop run for use-once?', 'Stop before `n - 1`, so c can equal n.'],
    },
    { id: 'fix-shared-list', type: 'fix', level: 2,
      q: 'This LCS keeps 2 lists, but it makes only one new list. `prev` and `cur` become 2 names for one list. Fix it.',
      code: py`
        def lcs_small(a, b):
            prev = [0] * (len(b) + 1)
            cur = [0] * (len(b) + 1)
            for i in range(1, len(a) + 1):
                for j in range(1, len(b) + 1):
                    if a[i - 1] == b[j - 1]:
                        cur[j] = prev[j - 1] + 1
                    else:
                        cur[j] = max(prev[j], cur[j - 1])
                prev = cur
            return prev[len(b)]
      `,
      answer: py`
        def lcs_small(a, b):
            prev = [0] * (len(b) + 1)
            for i in range(1, len(a) + 1):
                cur = [0] * (len(b) + 1)
                for j in range(1, len(b) + 1):
                    if a[i - 1] == b[j - 1]:
                        cur[j] = prev[j - 1] + 1
                    else:
                        cur[j] = max(prev[j], cur[j - 1])
                prev = cur
            return prev[len(b)]
      `,
      tests: [
        { label: 'lcs_small("ANT", "TAN")', call: 'lcs_small("ANT", "TAN")', want: '2' },
        { label: 'lcs_small("AAB", "AB")', call: 'lcs_small("AAB", "AB")', want: '2' },
        { label: 'lcs_small("AA", "A")', call: 'lcs_small("AA", "A")', want: '1' },
        { label: 'lcs_small("AB", "AB")', call: 'lcs_small("AB", "AB")', want: '2' },
        { label: 'lcs_small("AB", "BB")', call: 'lcs_small("AB", "BB")', want: '1' },
        { label: 'lcs_small("AA", "AAA")', call: 'lcs_small("AA", "AAA")', want: '2' },
        { label: 'lcs_small("", "A")', call: 'lcs_small("", "A")', want: '0' },
      ],
      explain: 'After `prev = cur`, both names point at one list. Then writing `cur[j]` also changes what `prev[j - 1]` reads. A new list for each row fixes that.',
      hints: ['Think back to lesson 5.5 and shared rows.', 'Move the `cur = ...` line inside the outer loop.'],
    },
    { id: 'write-split', type: 'write', level: 2,
      q: 'Write `can_split(nums)`. It hands back True if the numbers can split into 2 groups with the same total. `can_make` is ready for you to call.',
      starter: py`
        def can_make(nums, target):
            can = [False] * (target + 1)
            can[0] = True
            for n in nums:
                for c in range(target, n - 1, -1):
                    if can[c - n]:
                        can[c] = True
            return can[target]

        def can_split(nums):
            # Your code here.
            return False
      `,
      answer: py`
        def can_make(nums, target):
            can = [False] * (target + 1)
            can[0] = True
            for n in nums:
                for c in range(target, n - 1, -1):
                    if can[c - n]:
                        can[c] = True
            return can[target]

        def can_split(nums):
            total = sum(nums)
            if total % 2 == 1:
                return False
            return can_make(nums, total // 2)
      `,
      tests: [
        { label: 'can_split([1, 5, 2, 4])', call: 'can_split([1, 5, 2, 4])', want: 'True' },
        { label: 'can_split([1, 2, 4])', call: 'can_split([1, 2, 4])', want: 'False' },
        { label: 'even total, no split', call: 'can_split([1, 1, 4])', want: 'False' },
        { label: 'can_split([3, 3])', call: 'can_split([3, 3])', want: 'True' },
        { label: 'can_split([])', call: 'can_split([])', want: 'True' },
        { label: 'can_split([7])', call: 'can_split([7])', want: 'False' },
      ],
      explain: 'An odd total cannot be halved. If one group reaches half the total, the other group also gets half.',
      hints: ['What if the total is odd?', 'Each group must add up to half the total.', 'Call `can_make(nums, total // 2)`.'],
    },
    { id: 'smallest-gap', type: 'write', level: 3,
      q: 'Stretch: write `smallest_gap(nums)`. Split all the numbers into 2 groups. Hand back the smallest possible difference between the group totals.',
      starter: py`
        def smallest_gap(nums):
            # Your code here.
            return 0
      `,
      answer: py`
        def smallest_gap(nums):
            total = sum(nums)
            half = total // 2
            can = [False] * (half + 1)
            can[0] = True
            for n in nums:
                for c in range(half, n - 1, -1):
                    if can[c - n]:
                        can[c] = True
            for c in range(half, -1, -1):
                if can[c]:
                    return total - 2 * c
            return total
      `,
      tests: [
        { label: 'smallest_gap([1, 5, 2, 4])', call: 'smallest_gap([1, 5, 2, 4])', want: '0' },
        { label: 'smallest_gap([2, 2, 3])', call: 'smallest_gap([2, 2, 3])', want: '1' },
        { label: 'smallest_gap([1, 6, 11, 5])', call: 'smallest_gap([1, 6, 11, 5])', want: '1' },
        { label: 'smallest_gap([7])', call: 'smallest_gap([7])', want: '7' },
        { label: 'smallest_gap([1, 1, 9])', call: 'smallest_gap([1, 1, 9])', want: '7' },
        { label: 'smallest_gap([])', call: 'smallest_gap([])', want: '0' },
      ],
      explain: 'Find every total up to half. The biggest True spot c gives groups of c and total - c. So the gap is total - 2 x c.',
      hints: ['Build `can` for totals up to half of the sum.', 'Then look down from half for the first True spot.', 'If one group has c, the other has `total - c`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 26.4
Course.lesson('m26-dp-two', {
  id: '26-5-edit-distance',
  num: '26.4',
  title: 'Edit distance: the fewest changes between 2 words',
  goal: 'You can fill an edit distance table, and say which edit each cell means.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How close are 2 words?' },
    { t: 'p', text: 'A spell checker sees "kat", and it offers "cat". How does it know those are close? It counts the changes needed to get from one word to the other.' },
    { t: 'q', id: 'spark-edits', type: 'mcq', level: 1,
      q: 'You can add a letter, remove a letter, or swap one letter for another. Each costs 1. What is the fewest to turn CAT into CUTS?',
      options: [
        { text: '1', why: 'One change is not enough. The A must change, and an S must come in as well.' },
        '2',
        { text: '4', why: 'That is typing the whole word again. C and T can stay as they are.' },
      ],
      answer: 1,
      explain: 'Swap A for U, and you have CUT. Add S, and you have CUTS.',
      hints: ['Which letters can stay?', 'Count only what must change.'],
    },
    { t: 'words', items: [
      { word: 'edit', means: 'One change to a word: add a letter, remove a letter, or swap one letter for another.' },
      { word: 'edit distance', means: 'The fewest edits that turn one word into another.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Back to the wall of notes, laid out as for LCS. Each note now holds a count of edits, and smaller is better. Real typing has a cursor that moves. Here the picture stops being true: moving costs nothing, and only letter changes count.' },
    { t: 'big', text: 'Look at the last letters. If they are the same, keep them for free. If not, pay 1 edit and take the cheapest of 3 choices.' },
    { t: 'table', caption: 'Each choice reads one cell. The word a runs down, and b runs across.', head: ['Edit', 'Cell it reads', 'What is left to do'], rows: [
      ['Remove the last letter of a', 'above, `d[i - 1][j]`', 'Turn a shorter a into b'],
      ['Add the last letter of b', 'left, `d[i][j - 1]`', 'Turn a into a shorter b'],
      ['Swap one for the other', 'diagonal, `d[i - 1][j - 1]`', 'Turn shorter a into shorter b'],
    ] },
    { t: 'steps', title: 'The recipe for edit distance', noun: 'Part', items: [
      { label: 'State', text: '`d[i][j]` uses the first i letters of a and the first j letters of b. It holds the fewest edits from one to the other.' },
      { label: 'Transition', text: 'Same letters copy the [[diagonal]]. Different letters pay 1 and read all 3 cells.', code: 'if a[i - 1] == b[j - 1]:\n    d[i][j] = d[i - 1][j - 1]\nelse:\n    d[i][j] = 1 + min(remove, add, swap)' },
      { label: 'Base case', text: 'To reach an empty word, remove every letter. So `d[i][0]` is i. From an empty word, add every letter. So `d[0][j]` is j.' },
      { label: 'Order', text: 'Fill row by row, left to right, as you did for LCS.' },
    ] },
    { t: 'viz', name: 'm26-edit', caption: 'Answer before each cell fills. Then type your own 2 words, up to 5 letters each. Try one empty word.' },
    { t: 'q', id: 'which-add', type: 'mcq', level: 2,
      q: 'You read the cell to the left, `d[i][j - 1]`. Which edit does that mean?',
      options: [
        'Add the last letter of b',
        { text: 'Remove the last letter of a', why: 'That one reads above, where a is one letter shorter. Going left makes b shorter.' },
        { text: 'Swap the 2 letters', why: 'A swap uses up one letter from each word. So it reads the diagonal.' },
      ],
      answer: 0,
      explain: 'Left means b is one letter shorter. So you solve that first, and then add the missing letter.',
      hints: ['Which word gets shorter when j goes down by 1?'],
    },
    { t: 'code', caption: 'This prints the whole table for the picture. Run it, then try your own words.',
      code: py`
        def edit_table(a, b):
            n = len(a)
            m = len(b)
            d = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(n + 1):
                d[i][0] = i
            for j in range(m + 1):
                d[0][j] = j
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        remove = d[i - 1][j]
                        add = d[i][j - 1]
                        swap = d[i - 1][j - 1]
                        d[i][j] = 1 + min(remove, add, swap)
            return d

        for row in edit_table("SUN", "SING"):
            print(row)
      `,
      output: '[0, 1, 2, 3, 4]\n[1, 0, 1, 2, 3]\n[2, 1, 1, 2, 3]\n[3, 2, 2, 1, 2]',
    },
    { t: 'q', id: 'same-length', type: 'predict', level: 2,
      q: 'These words have the same length. All 3 letters are in a new spot. What will the screen show?',
      code: py`
        a = "ABC"
        b = "BCA"
        d = [[0] * 4 for i in range(4)]
        for i in range(4):
            d[i][0] = i
        for j in range(4):
            d[0][j] = j
        for i in range(1, 4):
            for j in range(1, 4):
                if a[i - 1] == b[j - 1]:
                    d[i][j] = d[i - 1][j - 1]
                else:
                    remove = d[i - 1][j]
                    add = d[i][j - 1]
                    swap = d[i - 1][j - 1]
                    d[i][j] = 1 + min(remove, add, swap)
        print(d[3][3])
      `,
      options: [
        { text: '3', why: 'You may think same length means swaps only. 3 swaps do work, but there is a shorter way.' },
        '2',
        { text: '0', why: 'They share letters, but the order differs. Letters in a new order still cost edits.' },
      ],
      answer: 1,
      explain: 'Remove the A from the front, and BC is left. Add an A at the end, and you have BCA.',
      hints: ['Which letters are side by side in both words?', 'Can you keep BC?'],
    },
    { t: 'code', caption: 'This is a tiny spell check. It scores each word against what you typed. Change the typed word and run it.',
      code: py`
        def distance(a, b):
            n = len(a)
            m = len(b)
            d = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(n + 1):
                d[i][0] = i
            for j in range(m + 1):
                d[0][j] = j
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        remove = d[i - 1][j]
                        add = d[i][j - 1]
                        swap = d[i - 1][j - 1]
                        d[i][j] = 1 + min(remove, add, swap)
            return d[n][m]

        typed = "kat"
        for word in ["cat", "kite", "dog", ""]:
            print(word, distance(typed, word))
      `,
      output: 'cat 1\nkite 2\ndog 3\n 3',
    },
    { t: 'q', id: 'count-edit', type: 'mcq', level: 2,
      q: 'Count before we name it. The words have 5 and 3 letters. How many cells compare 2 letters?',
      options: [
        { text: '8', why: 'That adds the lengths. Each letter of a meets each letter of b.' },
        '15',
        { text: '24', why: 'That counts the base row and column too. Those need no compare.' },
      ],
      answer: 1,
      explain: 'Each of the 5 letters meets each of the 3 letters, so 15 cells compare.',
      hints: ['The top row and left column come from the base case.'],
    },
    { t: 'table', caption: 'LCS and edit distance side by side', head: ['Part', 'LCS', 'Edit distance'], rows: [
      ['Goal', 'Longest, so use `max`', 'Fewest, so use `min`'],
      ['Row 0 and column 0', 'All 0', '0, 1, 2, and so on'],
      ['Letters match', 'Diagonal + 1', 'Diagonal, with no cost'],
      ['Letters differ', 'Above or left', '1 + above, left or diagonal'],
    ] },
    { t: 'trap',
      think: 'The top row and left column are all 0, as in LCS.',
      real: 'Not here. Turning 3 letters into no letters takes 3 edits. With zeros there, the code says that any word turns into an empty word for free.',
      code: py`
        d = [[0, 1, 2],   # top row: add each letter
             [1, 0, 0],   # left column: remove each
             [2, 0, 0]]
        print(d[2][0])
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Fill the table', cost: 'O(n x m)', why: 'Each letter of a meets each letter of b once. Each cell does a few O(1) reads.' },
      { op: 'Memory for the table', cost: 'O(n x m)', why: 'You keep one number per cell, and you need them to list the edits.' },
    ] },
    { t: 'table', caption: 'How to spot edit distance', head: ['If the problem says...', 'Think of...'], rows: [
      ['"fewest changes", "add, remove or replace"', 'Edit distance'],
      ['"did you mean?", "close to this word"', 'Edit distance to each word in a list'],
      ['"longest shared part, in order"', 'LCS instead'],
    ] },
    { t: 'tip', title: 'Words of very different lengths', text: 'The answer is never smaller than the length gap. Each edit changes the length by 1 at most. Use that to check your table.' },
  ],
  recap: [
    'You can state the base row and column for edit distance.',
    'You can say which edit each of the 3 cells means.',
    'You can tell when to use LCS and when to use edit distance.',
  ],
  practice: [
    { id: 'match-edits', type: 'match', level: 1,
      q: 'Match each cell to the edit it stands for.',
      pairs: [
        ['`d[i - 1][j]` (above)', 'Remove a letter'],
        ['`d[i][j - 1]` (left)', 'Add a letter'],
        ['`d[i - 1][j - 1]` (diagonal)', 'Swap a letter'],
      ],
      explain: 'Above makes a shorter. Left makes b shorter. The diagonal makes both shorter.',
      hints: ['Which word gets shorter in each cell?'],
    },
    { id: 'from-empty', type: 'predict', level: 1,
      q: 'Word a is empty. Type what the screen will show.',
      code: py`
        a = ""
        b = "HEY"
        d = [[0] * (len(b) + 1) for i in range(len(a) + 1)]
        for i in range(len(a) + 1):
            d[i][0] = i
        for j in range(len(b) + 1):
            d[0][j] = j
        print(d[len(a)][len(b)])
      `,
      answer: '3',
      why: 'From no letters, you add each of the 3 letters.',
      explain: 'The table has one row, the base case. Its last cell is 3.',
      hints: ['How many letters must you add?'],
    },
    { id: 'either-way', type: 'mcq', level: 2,
      q: 'Going from CAT to CART takes 1 edit. How many does CART to CAT take?',
      options: [
        '1',
        { text: '2', why: 'You may think going back costs more. A remove undoes an add, and each costs 1.' },
        { text: 'It depends on the table', why: 'Every edit can be undone by one edit. So both ways give the same number.' },
      ],
      answer: 0,
      explain: 'Add R one way, and remove R the other way. Edit distance is the same in both directions.',
      hints: ['What undoes an add?'],
    },
    { id: 'trace-edit', type: 'trace', level: 2,
      q: 'The words are AB and B. Fill in each cell that compares 2 letters.',
      code: py`
        a = "AB"
        b = "B"
        d = [[0, 1], [1, 0], [2, 0]]
        for i in range(1, 3):
            j = 1
            if a[i - 1] == b[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = 1 + min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1])
            print(i, a[i - 1], d[i][j])
      `,
      head: ['i', 'letter', 'd[i][1]'],
      rows: [['1', 'A', '1'], ['2', 'B', '1']],
      given: 1,
      verify: 'a = "AB"\nb = "B"\nd = [[0, 1], [1, 0], [2, 0]]\nfor i in range(1, 3):\n    j = 1\n    if a[i - 1] == b[j - 1]:\n        d[i][j] = d[i - 1][j - 1]\n    else:\n        d[i][j] = 1 + min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1])\n    print(i, a[i - 1], d[i][j])',
      explain: 'B matches B, so that cell copies the diagonal, which is 1. That one edit removes the A.',
      hints: ['For i 2, the letters are the same.', 'Then read `d[1][0]`, the diagonal.'],
    },
    { id: 'fix-base', type: 'fix', level: 2,
      q: 'This code left out the base case. It says any word turns into an empty word for free. Fix it.',
      code: py`
        def distance(a, b):
            n = len(a)
            m = len(b)
            d = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        remove = d[i - 1][j]
                        add = d[i][j - 1]
                        swap = d[i - 1][j - 1]
                        d[i][j] = 1 + min(remove, add, swap)
            return d[n][m]
      `,
      answer: py`
        def distance(a, b):
            n = len(a)
            m = len(b)
            d = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(n + 1):
                d[i][0] = i
            for j in range(m + 1):
                d[0][j] = j
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        remove = d[i - 1][j]
                        add = d[i][j - 1]
                        swap = d[i - 1][j - 1]
                        d[i][j] = 1 + min(remove, add, swap)
            return d[n][m]
      `,
      tests: [
        { label: 'distance("CAT", "")', call: 'distance("CAT", "")', want: '3' },
        { label: 'distance("", "HI")', call: 'distance("", "HI")', want: '2' },
        { label: 'distance("CAT", "CUTS")', call: 'distance("CAT", "CUTS")', want: '2' },
        { label: 'distance("ABC", "BCA")', call: 'distance("ABC", "BCA")', want: '2' },
        { label: 'distance("SAME", "SAME")', call: 'distance("SAME", "SAME")', want: '0' },
      ],
      explain: 'Without the base case, every path starts from a free 0. Counting the letters in the top row and left column fixes that.',
      hints: ['What should `d[i][0]` be?', 'Add 2 short loops before the main loops.'],
    },
    { id: 'write-distance', type: 'write', level: 2,
      q: 'Write `distance(a, b)`. It hands back the edit distance between 2 words.',
      starter: py`
        def distance(a, b):
            # Your code here.
            return 0
      `,
      answer: py`
        def distance(a, b):
            n = len(a)
            m = len(b)
            d = [[0] * (m + 1) for i in range(n + 1)]
            for i in range(n + 1):
                d[i][0] = i
            for j in range(m + 1):
                d[0][j] = j
            for i in range(1, n + 1):
                for j in range(1, m + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        remove = d[i - 1][j]
                        add = d[i][j - 1]
                        swap = d[i - 1][j - 1]
                        d[i][j] = 1 + min(remove, add, swap)
            return d[n][m]
      `,
      tests: [
        { label: 'distance("SUN", "SING")', call: 'distance("SUN", "SING")', want: '2' },
        { label: 'distance("DOG", "CAT")', call: 'distance("DOG", "CAT")', want: '3' },
        { label: 'distance("", "")', call: 'distance("", "")', want: '0' },
        { label: 'distance("TREE", "")', call: 'distance("TREE", "")', want: '4' },
        { label: 'distance("ROAD", "BROAD")', call: 'distance("ROAD", "BROAD")', want: '1' },
        { label: 'distance("cat", "CAT")', call: 'distance("cat", "CAT")', want: '3' },
      ],
      explain: 'Set the base row and column first. Then same letters copy the diagonal. Different letters pay 1 plus the smallest of 3 cells.',
      hints: ['Build the table with `len(a) + 1` rows.', 'Fill the base row and column with 2 short loops.', 'Different letters: `1 + min(above, left, diagonal)`.'],
    },
    { id: 'spell-check', type: 'write', level: 3,
      q: 'Stretch: write `closest(word, options)`. It hands back the word from the list `options` with the smallest edit distance to `word`. In a tie, keep the earlier one. `distance` is ready for you to call.',
      starter: py`
        def distance(a, b):
            d = [[0] * (len(b) + 1) for i in range(len(a) + 1)]
            for i in range(len(a) + 1):
                d[i][0] = i
            for j in range(len(b) + 1):
                d[0][j] = j
            for i in range(1, len(a) + 1):
                for j in range(1, len(b) + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        d[i][j] = 1 + min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1])
            return d[len(a)][len(b)]

        def closest(word, options):
            # Your code here.
            return ""
      `,
      answer: py`
        def distance(a, b):
            d = [[0] * (len(b) + 1) for i in range(len(a) + 1)]
            for i in range(len(a) + 1):
                d[i][0] = i
            for j in range(len(b) + 1):
                d[0][j] = j
            for i in range(1, len(a) + 1):
                for j in range(1, len(b) + 1):
                    if a[i - 1] == b[j - 1]:
                        d[i][j] = d[i - 1][j - 1]
                    else:
                        d[i][j] = 1 + min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1])
            return d[len(a)][len(b)]

        def closest(word, options):
            best_word = options[0]
            best_count = distance(word, options[0])
            for option in options:
                count = distance(word, option)
                if count < best_count:
                    best_word = option
                    best_count = count
            return best_word
      `,
      tests: [
        { label: 'closest("kat", ["dog", "cat", "kit"])', call: 'closest("kat", ["dog", "cat", "kit"])', want: '"cat"' },
        { label: 'closest("hat", ["hut", "hot"])', call: 'closest("hat", ["hut", "hot"])', want: '"hut"' },
        { label: 'closest("tree", ["tree", "three"])', call: 'closest("tree", ["tree", "three"])', want: '"tree"' },
        { label: 'closest("sun", ["moon"])', call: 'closest("sun", ["moon"])', want: '"moon"' },
        { label: 'closest("", ["abc", "a"])', call: 'closest("", ["abc", "a"])', want: '"a"' },
      ],
      explain: 'Keep the best word so far and its count. Use `<`, not `<=`, so a tie keeps the earlier word.',
      hints: ['Start with the first option as your best.', 'Call `distance` for each option.', 'Change your best only when the new count is smaller.'],
    },
  ],
});
