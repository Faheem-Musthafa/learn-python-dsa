/* Module 28: Putting It All Together. Part 4 (Advanced). The last module.
 * Earlier work is named by module number, because lesson numbers can change.
 */
Course.module({
  id: 'm28-capstone',
  num: 28, part: 4, level: 'A',
  title: 'Putting It All Together',
  blurb: 'Learn a way to start any problem, pick the right tool, then build a maze solver.',
  needs: ['m21-graphs', 'm25-dp-one'],
});

/* ------------------------------------------------------------------ 28.1 */
Course.lesson('m28-capstone', {
  id: '28-1-a-way-to-solve',
  num: '28.1',
  title: 'A repeatable way to solve a problem',
  goal: 'You can take a new problem through 4 steps: examples, slow way, better way, odd cases.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What do you do with a problem you have never seen?' },
    { t: 'p', text: 'Strong programmers do not know every answer. They have a way to start. You will learn that way here, and you will use it twice.' },
    { t: 'q', id: 'spark-first-move', type: 'mcq', level: 1,
      q: 'You read a new problem, and you have no idea how to solve it. What should you do first?',
      options: [
        'Work out 2 small examples by hand.',
        { text: 'Start typing code as fast as you can.', why: 'Code written too early often solves the wrong problem. You may not know the real rules yet.' },
        { text: 'Hunt for the cleverest trick.', why: 'A trick is hard to find before you understand the job. Clever ideas come later, from examples.' },
      ],
      answer: 0,
      explain: 'Small examples show what the problem really asks. They also become your first tests.',
      hints: ['What could you do with no code at all?'],
    },
    { t: 'words', items: [
      { word: 'brute force', means: 'Try every possibility until one works.' },
      { word: 'edge case', means: 'A strange input that can break your code, like an empty list.' },
    ] },
    { t: 'big', text: 'Understand it, try the slow way, find the better way, then test odd cases.' },
    { t: 'steps', title: 'The 4 steps for any problem', items: [
      { label: 'Understand', text: 'Write 2 or 3 small examples. Work out each answer by hand.' },
      { label: 'Try the slow way', text: 'Use [[brute force]] first. Slow and right beats clever and wrong. Count its steps.' },
      { label: 'Find the better way', text: 'Ask what work gets repeated. Then look for a tool that stops the repeat.' },
      { label: 'Test odd cases', text: 'Try each [[edge case]]: empty, one item, all the same, and very big.' },
    ] },

    { t: 'h', text: 'Walk one problem through the 4 steps' },
    { t: 'p', text: 'A game card has a new price each day. You can buy it once, then sell it once on a later day.' },
    { t: 'p', text: 'What is the most you can gain? If you cannot gain, the answer is 0.' },
    { t: 'p', text: 'Step 1 is to try an example, with prices 5, 2, 6, 1 and 4. A quick idea is to take the biggest price, then subtract the smallest. Test that idea.' },
    { t: 'q', id: 'quick-idea', type: 'predict', level: 2,
      q: 'What does the quick idea say? Then check it against the rules.',
      code: py`
        prices = [5, 2, 6, 1, 4]
        print(max(prices) - min(prices))
      `,
      options: [
        '5',
        { text: '4', why: 'That is the true answer, but this code does not work it out. It takes 6 and subtracts 1.' },
        { text: '6', why: 'That is only the biggest price. The code then takes away the smallest price.' },
      ],
      answer: 0,
      explain: 'It says 5, but that means buying at 1 and selling at 6. The 1 comes after the 6, so the example shows the idea breaks a rule.',
      hints: ['What is the biggest price? What is the smallest?', 'Which of those 2 days comes first?'],
    },
    { t: 'viz', name: 'm28-method', caption: 'Answer each question as it comes. Then change the prices. Try a list that only falls.' },
    { t: 'p', text: 'Step 2 in code is a loop inside a loop. Step 3 asks what got repeated. Only the lowest old price can matter, so one name, `low`, can stand for them all.' },
    { t: 'code', caption: 'The slow way counts `checks`, and the better way counts `steps`. Both give the same best rise. Add another size.',
      output: '10 45 10\n100 4950 100\n1000 499500 1000',
      code: py`
        def count_checks(prices):
            checks = 0
            best = 0
            for i in range(len(prices)):
                for j in range(i + 1, len(prices)):
                    checks += 1
                    best = max(best, prices[j] - prices[i])
            return best, checks

        def count_steps(prices):
            steps = 0
            low = prices[0]
            best = 0
            for price in prices:
                steps += 1
                if price - low > best:
                    best = price - low
                if price < low:
                    low = price
            return best, steps

        for size in [10, 100, 1000]:
            prices = [(i * 7) % 11 for i in range(size)]
            a, checks = count_checks(prices)
            b, steps = count_steps(prices)
            if a == b:
                print(size, checks, steps)
      `,
    },
    { t: 'cost', title: 'How fast is it? n is the number of days.', items: [
      { op: 'The slow way', cost: 'O(n^2)', why: 'A loop inside a loop. You counted about n x n / 2 pairs.' },
      { op: 'The better way', cost: 'O(n)', why: 'One walk. Each day takes one step.' },
      { op: 'Extra memory, both ways', cost: 'O(1)', why: 'Only a few names, however long the list is.' },
    ] },
    { t: 'p', text: 'Step 4 tests odd cases. This version looks finished. So try it on an empty list.' },
    { t: 'q', id: 'odd-empty', type: 'predict', level: 2,
      q: 'There are no prices at all. What happens?',
      code: py`
        def best_rise(prices):
            low = prices[0]
            best = 0
            for price in prices:
                if price - low > best:
                    best = price - low
                if price < low:
                    low = price
            return best

        print(best_rise([]))
      `,
      options: [
        { text: '0', why: 'That is the answer you want, but the code never gets there. `prices[0]` runs first.' },
        'IndexError',
        { text: 'None', why: 'A function hands back None when it ends with no `return`. This one stops at its first line.' },
      ],
      answer: 1,
      expectError: true,
      explain: 'An empty list has no spot 0. So Python stops with an `IndexError`. That is why step 4 matters.',
      hints: ['What does the first line of the function ask for?'],
    },
    { t: 'code', caption: 'The fix is 2 lines. Each `assert` from Module 4 stops the program if a test fails. Add a test of your own.',
      output: 'All tests pass.',
      code: py`
        def best_rise(prices):
            if len(prices) == 0:
                return 0
            low = prices[0]
            best = 0
            for price in prices:
                if price - low > best:
                    best = price - low
                if price < low:
                    low = price
            return best

        assert best_rise([5, 2, 6, 1, 4]) == 4
        assert best_rise([]) == 0
        assert best_rise([7]) == 0
        assert best_rise([9, 7, 5]) == 0
        assert best_rise([4, 4]) == 0
        print("All tests pass.")
      `,
    },
    { t: 'trap', think: 'my code gave the right answer for my example, so it is correct.',
      real: 'One example proves very little. The bug above stayed hidden until the empty list. Every odd case you test is one less surprise later.',
    },

    { t: 'h', text: 'Now you do the next one' },
    { t: 'p', text: 'Go through a list from left to right. Find the first item you have already seen. If nothing repeats, the answer is `None`.' },
    { t: 'q', id: 'next-understand', type: 'mcq', level: 2,
      q: 'Step 1: understand. What is the answer for `[3, 1, 4, 1, 3]`?',
      options: [
        '1',
        { text: '3', why: 'You may be looking for the first item that has a copy later. But walking along, the second 1 comes before the second 3.' },
        { text: 'None', why: 'Both 1 and 3 repeat in this list. `None` is only for a list with no repeats.' },
      ],
      answer: 0,
      explain: 'Walk along: 3, 1, 4, then 1 again. That 1 is the first item you have already seen.',
      hints: ['Walk the list with your finger, and say each item.', 'Stop as soon as you say one for the second time.'],
    },
    { t: 'q', id: 'next-slow', type: 'predict', level: 2,
      q: 'Step 2: count the slow way. It compares each item with all the items before it. Nothing repeats here. How many compares does it make?',
      code: py`
        items = [5, 6, 7, 8]
        compares = 0
        for i in range(len(items)):
            for j in range(i):
                compares += 1
        print(compares)
      `,
      options: [
        { text: '4', why: 'That would be one compare for each item. Later items must look back at more items.' },
        '6',
        { text: '16', why: 'That is 4 x 4. But an item only looks back, so it never compares with itself or later items.' },
      ],
      answer: 1,
      explain: 'The items look back at 0, 1, 2 and 3 others. That adds up to 6, and it grows like n x n.',
      hints: ['How many items does the first one look back at?', 'Add 0 + 1 + 2 + 3.'],
    },
    { t: 'q', id: 'next-better', type: 'mcq', level: 2,
      q: 'Step 3: find the better way. The repeated work is asking "have I seen this?" Which tool makes that question fast?',
      options: [
        'A set of the items seen so far.',
        { text: 'Sort the list first.', why: 'A sort loses the order. "First" depends on the order, so you could get the wrong item.' },
        { text: 'Binary search.', why: 'Binary search needs a sorted list. This list must stay in its own order.' },
      ],
      answer: 0,
      explain: '`x in seen` takes about 1 step on average for a set, as Module 11 showed. For a list, it walks every item.',
      hints: ['Which structure answers "is it in here?" in about 1 step?'],
    },
    { t: 'q', id: 'next-write', type: 'write', level: 2,
      q: 'Step 4: write it and pass the odd cases. Write `first_repeat(items)` using a set. It hands back the first item already seen, or `None`.',
      starter: py`
        def first_repeat(items):
            seen = set()
            # Your code here.
            return "?"
      `,
      answer: py`
        def first_repeat(items):
            seen = set()
            for x in items:
                if x in seen:
                    return x
                seen.add(x)
            return None
      `,
      tests: [
        { label: 'The second 1 comes before the second 3', call: 'first_repeat([3, 1, 4, 1, 3])', want: '1' },
        { label: 'Nothing repeats', call: 'first_repeat([2, 4, 6])', want: 'None' },
        { label: 'An empty list', call: 'first_repeat([])', want: 'None' },
        { label: 'One item', call: 'first_repeat([9])', want: 'None' },
        { label: 'All the same', call: 'first_repeat([7, 7, 7])', want: '7' },
        { label: 'It works on words too', call: 'first_repeat(["ant", "bee", "ant"])', want: '"ant"' },
        { label: 'It uses a set, so 300 items need very few compares', check: '(lambda T: (lambda a: first_repeat(a) is None and T.n < 2000)([T(i) for i in range(300)]))(type("T", (), {"n": 0, "__init__": lambda s, v: setattr(s, "v", v), "__hash__": lambda s: hash(s.v), "__eq__": lambda s, o: (setattr(type(s), "n", type(s).n + 1), s.v == o.v)[1]}))' },
      ],
      explain: 'Check the set before you add. If you add first, every item looks as if you have seen it.',
      hints: ['Walk the list with a `for` loop.', 'Is `x` already in `seen`? Then hand it back.', 'Otherwise add `x` to `seen`. After the loop, return `None`.'],
    },
    { t: 'tip', title: 'When you get stuck', text: 'Go back one step. A stuck better way often means you need another example. There is no shame in the slow way. If the input is small, it may be all you need.' },
  ],
  recap: [
    'You can write small examples before any code.',
    'You can write the slow way, and count its steps.',
    'You can find repeated work, and test odd cases.',
  ],
  practice: [
    { id: 'match-steps', type: 'match', level: 1,
      q: 'Match each step to what you do in it.',
      pairs: [
        ['Understand', 'Work out small examples by hand'],
        ['Try the slow way', 'Write brute force, and count its steps'],
        ['Find the better way', 'Stop the repeated work with a tool'],
        ['Test odd cases', 'Try empty, one item and all the same'],
      ],
      explain: 'The order matters. Each step gives you what the next step needs.',
      hints: ['Which step needs no code at all?'],
    },
    { id: 'pick-odd-case', type: 'mcq', level: 1,
      q: 'Your function finds the average of a list with `sum(nums) / len(nums)`. Which odd case will crash it?',
      options: [
        'An empty list',
        { text: 'A list of negative numbers', why: 'Negative numbers add and divide with no trouble. Nothing here breaks on them.' },
        { text: 'A list of 1000 numbers', why: 'A long list only takes more steps. It does not break the sum or the division.' },
      ],
      answer: 0,
      explain: 'An empty list has a length of 0. Dividing by 0 gives a `ZeroDivisionError`.',
      hints: ['What is `len(nums)` when there is nothing in the list?'],
    },
    { id: 'why-slow-first', type: 'mcq', level: 2,
      q: 'Why write the slow way, if you plan to replace it?',
      options: [
        'It shows you understand the job, and it can check your faster code.',
        { text: 'The slow way always ends up being fast enough.', why: 'Sometimes it does, for small inputs. But on large inputs, O(n^2) can be far too slow.' },
        { text: 'Python runs code faster the second time.', why: 'Python does not learn from your first try. Only a better way of working cuts the steps.' },
      ],
      answer: 0,
      explain: 'Do the slow way and the better way agree on many inputs? Then you can trust the better one.',
      hints: ['How can you test a clever function?'],
    },
    { id: 'fix-lowest-first', type: 'fix', level: 2,
      q: 'This `best_rise` picks its low before the walk starts. So it can "buy" after it sells. Fix it.',
      code: py`
        def best_rise(prices):
            if len(prices) == 0:
                return 0
            low = min(prices)
            best = 0
            for price in prices:
                if price - low > best:
                    best = price - low
            return best
      `,
      answer: py`
        def best_rise(prices):
            if len(prices) == 0:
                return 0
            low = prices[0]
            best = 0
            for price in prices:
                if price - low > best:
                    best = price - low
                if price < low:
                    low = price
            return best
      `,
      tests: [
        { label: 'The lowest price comes after the highest', call: 'best_rise([5, 2, 6, 1, 4])', want: '4' },
        { label: 'Prices only fall', call: 'best_rise([9, 7, 5])', want: '0' },
        { label: 'Prices only rise', call: 'best_rise([1, 2, 8])', want: '7' },
        { label: 'An empty list', call: 'best_rise([])', want: '0' },
      ],
      explain: '`low` must mean the lowest price so far. So start with the first price, and move it during the walk.',
      hints: ['On day 0, which prices are you allowed to know?', 'Start `low` at `prices[0]`, then update it in the loop.'],
    },
    { id: 'write-longest-run', type: 'write', level: 2,
      q: 'Use the 4 steps. Write `longest_run(items)`. It hands back the length of the longest stretch of equal items side by side. An empty list gives 0.',
      starter: py`
        def longest_run(items):
            # Your code here.
            return -1
      `,
      answer: py`
        def longest_run(items):
            best = 0
            run = 0
            for i in range(len(items)):
                if i > 0 and items[i] == items[i - 1]:
                    run += 1
                else:
                    run = 1
                best = max(best, run)
            return best
      `,
      tests: [
        { label: 'A run in the middle', call: 'longest_run([1, 1, 2, 2, 2, 3])', want: '3' },
        { label: 'A run at the very end', call: 'longest_run([4, 5, 5])', want: '2' },
        { label: 'A run at the start', call: 'longest_run([6, 6, 6, 1])', want: '3' },
        { label: 'An empty list', call: 'longest_run([])', want: '0' },
        { label: 'One item', call: 'longest_run([8])', want: '1' },
        { label: 'No 2 items match', call: 'longest_run([1, 2, 3])', want: '1' },
      ],
      explain: 'Keep a count of the current run, and restart it at 1 when the item changes. Update `best` on every trip, so a run at the end still counts.',
      hints: ['Try `[4, 5, 5]` by hand first.', 'Keep 2 names: `run` for now, and `best` for the longest so far.', 'Update `best` inside the loop, not only when a run ends.'],
    },
    { id: 'write-rise-days', type: 'write', level: 3,
      q: 'Stretch: write `rise_days(prices)`. Hand back `(buy_day, sell_day)` for the best rise, or `None` if you cannot gain. If 2 pairs tie, keep the one found first on a walk from the left.',
      starter: py`
        def rise_days(prices):
            # Your code here.
            return "?"
      `,
      answer: py`
        def rise_days(prices):
            if len(prices) == 0:
                return None
            low_day = 0
            best = 0
            answer = None
            for day in range(len(prices)):
                rise = prices[day] - prices[low_day]
                if rise > best:
                    best = rise
                    answer = (low_day, day)
                if prices[day] < prices[low_day]:
                    low_day = day
            return answer
      `,
      tests: [
        { label: 'Buy on day 1, sell on day 2', call: 'rise_days([5, 2, 6, 1, 4])', want: '(1, 2)' },
        { label: 'The low moves, and the best pair uses it', call: 'rise_days([9, 8, 1, 7])', want: '(2, 3)' },
        { label: 'Prices only fall', call: 'rise_days([4, 3, 2])', want: 'None' },
        { label: 'An empty list', call: 'rise_days([])', want: 'None' },
        { label: 'One day', call: 'rise_days([3])', want: 'None' },
        { label: 'Equal prices give no gain', call: 'rise_days([5, 5])', want: 'None' },
      ],
      explain: 'Keep the day of the low, not the price. When a rise wins, save both days as a tuple.',
      hints: ['Name the low day `low_day`, and read its price with `prices[low_day]`.', 'Save `(low_day, day)` when a rise beats `best`.', 'If no rise ever wins, `answer` is still `None`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.2 */
Course.lesson('m28-capstone', {
  id: '28-2-which-tool-fits',
  num: '28.2',
  title: 'Which tool fits? Read the cue words',
  goal: 'You can read a short problem, spot its cue words, and pick the tool that fits.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How do you know which tool to reach for?' },
    { t: 'p', text: 'A real problem never says which tool to use. But its words give clues. This lesson is mostly practice, and every wrong pick teaches you something.' },
    { t: 'viz', name: 'm28-tool-flow', caption: 'Answer each question. Then pick 2 more problems from the list and try again. Which question decided the tool?' },
    { t: 'big', text: 'First ask what the problem is about. Then ask what it wants.' },

    { t: 'h', text: 'Round 1: spot the cue' },
    { t: 'q', id: 'pick-hash', type: 'mcq', level: 1,
      q: 'Which word appears the most in this story?',
      options: [
        'Count each word in a dict.',
        { text: 'Two pointers from both ends.', why: 'Pointers look for a pair in a sorted list. Here you must keep a count for each word.' },
        { text: 'Backtracking.', why: 'Backtracking tries different choices. Here there is nothing to choose, only words to count.' },
      ],
      answer: 0,
      explain: '"The most" of each kind means counting. A dict keeps one count for each word.',
      hints: ['What do you need to keep for each word?'],
    },
    { t: 'q', id: 'pick-two-pointers', type: 'mcq', level: 1,
      q: 'A sorted list holds prices. Find 2 prices that add up to exactly 20, with no extra memory.',
      options: [
        { text: 'Sliding window.', why: 'A window watches items side by side. The 2 prices here can be far apart.' },
        'Two pointers from both ends.',
        { text: 'A heap.', why: 'A heap keeps the smallest item ready. The list is already sorted, so a heap adds nothing.' },
      ],
      answer: 1,
      explain: 'The cue is "sorted" with "2 that add up". Too big moves the right pointer, and too small moves the left one.',
      hints: ['Module 13, array patterns, has this one.', 'What does "sorted" let you do with a total that is too big?'],
    },
    { t: 'q', id: 'pick-window', type: 'mcq', level: 2,
      q: 'A shop has a list of daily sales. Find the best 7 days in a row.',
      options: [
        'Sliding window.',
        { text: 'A heap for the 7 biggest days.', why: 'A heap gives the 7 biggest days, but they may be far apart. "In a row" rules that out.' },
        { text: 'Binary search.', why: 'Sales are not sorted, and there is no target to find.' },
      ],
      answer: 0,
      explain: '"In a row" means side by side. Slide the 7 days along, adding one day and dropping one.',
      hints: ['Which words matter most: "best 7" or "in a row"?'],
    },
    { t: 'q', id: 'pick-prefix', type: 'mcq', level: 2,
      q: 'Daily rain figures never change. You must answer 5000 questions like "How much rain fell from day a to day b?"',
      options: [
        { text: 'A new sum for each question.', why: 'That works, but each question walks many days. With 5000 questions, the work adds up fast.' },
        { text: 'A Fenwick tree.', why: 'Fenwick trees are for lists that keep changing. This list never changes, so a simpler tool does it.' },
        'Prefix sums.',
      ],
      answer: 2,
      explain: 'Add once, then each question takes one subtraction. "Many ranges" and "never changes" are the cues.',
      hints: ['Does the list ever change?', 'Which tool from Module 13 adds once and answers fast?'],
    },
    { t: 'q', id: 'pick-answer-search', type: 'mcq', level: 2,
      q: 'A printer must finish 40 jobs by noon. Find the slowest print speed that still finishes in time.',
      options: [
        { text: 'Greedy.', why: 'Greedy needs a safe choice at each step. Here you pick one speed, then test it.' },
        'Binary search on the answer.',
        { text: 'Backtracking.', why: 'Backtracking is for building many arrangements. Here you only need one number.' },
      ],
      answer: 1,
      explain: 'If a speed works, every faster speed works too. So the speeds go No, No, Yes, Yes, and you can search them.',
      hints: ['If speed 10 finishes in time, what about speed 11?'],
    },

    { t: 'h', text: 'Round 2: two tools look right' },
    { t: 'q', id: 'pick-bfs', type: 'mcq', level: 2,
      q: 'Find the fewest train changes from home to the park. Every change counts the same.',
      options: [
        'BFS.',
        { text: 'Dijkstra.', why: 'Dijkstra also gets it right, but it is the bigger tool. With no costs, a plain queue is enough.' },
        { text: 'DFS.', why: 'DFS goes deep first. It finds a way, but not always the one with the fewest changes.' },
      ],
      answer: 0,
      explain: 'Equal steps with "fewest" is the cue for BFS. It reaches each place by layers.',
      hints: ['Do the links have different costs?'],
    },
    { t: 'q', id: 'pick-dijkstra', type: 'mcq', level: 2,
      q: 'Each road has its own toll. Find the cheapest way to the coast.',
      options: [
        { text: 'BFS.', why: 'BFS finds the fewest roads, but it does not look at tolls. A longer way can cost less.' },
        { text: 'Topological sort.', why: 'That gives an order for tasks with rules. Here you want a cheapest route.' },
        'Dijkstra with a heap.',
      ],
      answer: 2,
      explain: '"Toll" and "cheapest" are the cues. A heap always hands you the next cheapest place.',
      hints: ['Do the links have different costs?'],
    },
    { t: 'q', id: 'pick-backtracking', type: 'mcq', level: 2,
      q: 'List every 3 letter code from A, B, C and D. No letter can repeat.',
      options: [
        'Backtracking.',
        { text: 'Dynamic programming.', why: 'DP is great at counting the codes. But the problem asks you to list each one.' },
        { text: 'Greedy.', why: 'Greedy makes one best choice and moves on. That finds one code, not all of them.' },
      ],
      answer: 0,
      explain: '"List every" is the cue. Choose a letter, explore, then un-choose it.',
      hints: ['Does it want a count, or each code?'],
    },
    { t: 'q', id: 'pick-dp', type: 'mcq', level: 2,
      q: 'Your coins are 1, 3 and 4. What is the fewest coins that make 6?',
      options: [
        { text: 'Greedy: take the biggest coin first.', why: 'Greedy takes 4, then 1, then 1. That is 3 coins, but 3 + 3 uses only 2.' },
        'Dynamic programming.',
        { text: 'Binary search.', why: 'There is no sorted row to search, and no row of No, then Yes.' },
      ],
      answer: 1,
      explain: 'The same small questions repeat: what is the fewest for 5, 4 and 3? A table saves each answer.',
      hints: ['Try the biggest coin first by hand. Does it win?'],
    },
    { t: 'p', text: 'You can check that last pick in code. A wrong tool often gives an answer that looks fine.' },
    { t: 'code', caption: 'Run it. Then try the coins 1, 5 and 10, where greedy is safe. Then try 1, 6 and 10 with 12.',
      output: '3\n2',
      code: py`
        def greedy_coins(coins, amount):
            count = 0
            for coin in sorted(coins, reverse=True):
                count += amount // coin
                amount = amount % coin
            return count

        def table_coins(coins, amount):
            fewest = [0] + [amount + 1] * amount
            for a in range(1, amount + 1):
                for coin in coins:
                    if coin <= a:
                        new = fewest[a - coin] + 1
                        fewest[a] = min(fewest[a], new)
            return fewest[amount]

        print(greedy_coins([1, 3, 4], 6))
        print(table_coins([1, 3, 4], 6))
      `,
    },
    { t: 'q', id: 'pick-topo', type: 'mcq', level: 2,
      q: 'To build a house, the walls need the floor first, and the roof needs the walls. Find a safe order for 30 jobs like these.',
      options: [
        { text: 'Sort the jobs by name.', why: 'A sort needs something to compare. Names say nothing about which job must go first.' },
        'Topological sort.',
        { text: 'Union-find.', why: 'Union-find says if 2 jobs are in one group. It gives no order.' },
      ],
      answer: 1,
      explain: '"Needs first" is the cue. It lists a job only after everything it needs.',
      hints: ['Module 21, graphs, has an order that obeys rules.'],
    },
    { t: 'q', id: 'pick-two-heaps', type: 'mcq', level: 2,
      q: 'Numbers keep arriving. After each one, say the middle value of all the numbers so far.',
      options: [
        'Two heaps.',
        { text: 'A full sort after each number.', why: 'That is right but slow. It redoes all the work for each new number.' },
        { text: 'A stack.', why: 'A stack only gives the newest number. The middle one can be anywhere.' },
      ],
      answer: 0,
      explain: 'One heap keeps the small half, and the other keeps the big half. The middle sits on top of them.',
      hints: ['Module 20, heaps, solved a running median.'],
    },
    { t: 'trap', think: 'the word "shortest" always means Dijkstra.',
      real: 'Ask what you are counting. Steps that all cost the same mean BFS. Different costs mean Dijkstra. A slightly different word can change the tool.',
    },
    { t: 'p', text: 'Picking the right tool saves real work. These 2 functions solve the same job on a sorted list. Count their checks.' },
    { t: 'code', caption: 'The target is -1, so no pair exists. Both must give up. Try a bigger list.',
      output: 'loop in a loop: 499500\ntwo pointers: 999',
      code: py`
        def pair_loops(nums, target):
            checks = 0
            for i in range(len(nums)):
                for j in range(i + 1, len(nums)):
                    checks += 1
                    if nums[i] + nums[j] == target:
                        return checks
            return checks

        def pair_pointers(nums, target):
            lo = 0
            hi = len(nums) - 1
            checks = 0
            while lo < hi:
                checks += 1
                total = nums[lo] + nums[hi]
                if total == target:
                    return checks
                if total < target:
                    lo += 1
                else:
                    hi -= 1
            return checks

        nums = list(range(0, 2000, 2))
        print("loop in a loop:", pair_loops(nums, -1))
        print("two pointers:", pair_pointers(nums, -1))
      `,
    },
    { t: 'table', caption: 'Your cue card. Each tool, and the words that point to it.', head: ['If the problem says...', 'Think of...'], rows: [
      ['"count", "duplicate", "anagram", "pair that adds to"', 'A dict or a set (Modules 6, 11)'],
      ['"sorted" with "pair", or "palindrome", or "in place"', 'Two pointers (Module 13)'],
      ['"loop in a chain", "middle of a chain"', 'Fast and slow pointers (Module 14)'],
      ['"longest" or "shortest" part, "in a row"', 'Sliding window (Module 13)'],
      ['Many range totals on a list that stays the same', 'Prefix sums (Module 13)'],
      ['"sorted", or "smallest value that works"', 'Binary search (Module 10)'],
      ['"brackets", "undo", "next bigger"', 'A stack (Module 15)'],
      ['"fewest moves", "level by level"', 'BFS, with a queue (Modules 18, 21)'],
      ['"all paths", "depth", "islands"', 'DFS, with recursion (Modules 18, 21)'],
      ['"list every" way or arrangement', 'Backtracking (Module 19)'],
      ['"k biggest", "median", "merge k lists"', 'A heap (Module 20)'],
      ['"overlap", "meetings", ranges', 'Sort, then sweep (Module 22)'],
      ['"the most", with a safe rule', 'Greedy (Module 22)'],
      ['"needs first", "order of tasks"', 'Topological sort (Module 21)'],
      ['"same group", "connect"', 'Union-find (Module 23)'],
      ['Costs on links, "cheapest route"', 'Dijkstra (Module 24)'],
      ['"how many ways", "lowest cost", repeated choices', 'Dynamic programming (Modules 25, 26)'],
      ['Many words, "starts with"', 'A trie (Module 27)'],
    ] },
    { t: 'tip', title: 'A cue is a clue, not a rule', text: 'Cue words point to a tool to try first. Does it feel wrong on a small example? Then ask what the problem really wants.' },
  ],
  recap: [
    'You can spot the cue words in a problem.',
    'You can say why a near miss is the wrong tool.',
    'You can check a pick on a small example.',
  ],
  practice: [
    { id: 'match-cues', type: 'match', level: 1,
      q: 'Match each cue to its tool.',
      pairs: [
        ['"every bracket has a partner"', 'A stack'],
        ['"words that start with"', 'A trie'],
        ['"a loop in a chain"', 'Fast and slow pointers'],
        ['"meetings that overlap"', 'Sort, then sweep'],
        ['"are they in the same group?"', 'Union-find'],
      ],
      explain: 'Each cue says what the problem wants. The tool is the structure that makes that job quick.',
      hints: ['Start with the one you are sure of.'],
    },
    { id: 'pick-islands', type: 'mcq', level: 1,
      q: 'A photo is a grid of light and dark squares. How many separate dark areas does it have?',
      options: [
        'Scan the grid, then fill each new area with DFS.',
        { text: 'Dijkstra.', why: 'Dijkstra finds the cheapest route. There is no route or cost here, only areas to count.' },
        { text: 'A heap.', why: 'A heap keeps the smallest item ready. No square is more urgent than another.' },
      ],
      answer: 0,
      explain: 'This is the islands problem in a new story. A new story does not change the tool.',
      hints: ['Which problem from Module 21 is this in disguise?'],
    },
    { id: 'pick-greedy', type: 'mcq', level: 2,
      q: 'You want to watch the most films at a festival. Some overlap, and each film has a start and an end.',
      options: [
        { text: 'Backtracking, to try every group.', why: 'That is right but far too slow. It tries about 2^n groups, and a safe rule exists.' },
        'Greedy: always take the film that ends first.',
        { text: 'Two pointers.', why: 'Nothing here is a pair in a sorted list. You are keeping or dropping each film.' },
      ],
      answer: 1,
      explain: 'Module 22 showed why this rule is safe. Ending first leaves the most time for the rest.',
      hints: ['Which question from Module 22 is this in disguise?'],
    },
    { id: 'pick-union', type: 'mcq', level: 2,
      q: 'People become friends one pair at a time. After each new pair, you must say how many friend groups there are.',
      options: [
        { text: 'A new DFS after each pair.', why: 'That gives the right answer, but it repeats all the work for each new pair.' },
        { text: 'Topological sort.', why: 'That is for tasks with an order. Friendship has no direction or order.' },
        'Union-find.',
      ],
      answer: 2,
      explain: '"Same group" with links that arrive over time is the cue. Each union joins 2 groups into 1.',
      hints: ['Which structure from Module 23 joins groups?'],
    },
    { id: 'fix-wrong-end', type: 'fix', level: 2,
      q: 'The problem says "fewest stops", so this should be BFS. But one wrong word turned it into something else. Fix it.',
      code: py`
        from collections import deque

        def fewest_stops(graph, start, end):
            dist = {start: 0}
            line = deque([start])
            while len(line) > 0:
                node = line.pop()
                for other in graph[node]:
                    if other not in dist:
                        dist[other] = dist[node] + 1
                        line.append(other)
            return dist.get(end, -1)
      `,
      answer: py`
        from collections import deque

        def fewest_stops(graph, start, end):
            dist = {start: 0}
            line = deque([start])
            while len(line) > 0:
                node = line.popleft()
                for other in graph[node]:
                    if other not in dist:
                        dist[other] = dist[node] + 1
                        line.append(other)
            return dist.get(end, -1)
      `,
      tests: [
        { label: 'A short way and a long way both exist', call: 'fewest_stops({"A": ["B", "C"], "B": ["T"], "C": ["D"], "D": ["T"], "T": []}, "A", "T")', want: '2' },
        { label: 'One line of stops', call: 'fewest_stops({"A": ["B"], "B": ["C"], "C": []}, "A", "C")', want: '2' },
        { label: 'No way there', call: 'fewest_stops({"A": [], "B": []}, "A", "B")', want: '-1' },
        { label: 'Already there', call: 'fewest_stops({"A": []}, "A", "A")', want: '0' },
      ],
      explain: '`pop` takes the newest stop, so the search goes deep like DFS. `popleft` takes the oldest, which gives BFS its layers.',
      hints: ['A queue should give back the oldest item. Which end is that?', 'Only one word on one line needs to change.'],
    },
    { id: 'write-rain', type: 'write', level: 2,
      q: 'Rain figures never change, and you get many questions. Write `make_totals(rain)`, so `totals[i]` is the total of the first i days. Then write `between(totals, a, b)` for days a to b. Day b counts too.',
      starter: py`
        def make_totals(rain):
            totals = [0]
            # Your code here.
            return totals

        def between(totals, a, b):
            # Your code here.
            return -1
      `,
      answer: py`
        def make_totals(rain):
            totals = [0]
            for r in rain:
                totals.append(totals[-1] + r)
            return totals

        def between(totals, a, b):
            return totals[b + 1] - totals[a]
      `,
      tests: [
        { label: 'make_totals adds as it goes', call: 'make_totals([3, 1, 4])', want: '[0, 3, 4, 8]' },
        { label: 'make_totals on no days', call: 'make_totals([])', want: '[0]' },
        { label: 'Days 1 to 3', call: 'between(make_totals([3, 1, 4, 1, 5]), 1, 3)', want: '6' },
        { label: 'One day only', call: 'between(make_totals([3, 1, 4, 1, 5]), 2, 2)', want: '4' },
        { label: 'From the very first day', call: 'between(make_totals([3, 1, 4, 1, 5]), 0, 4)', want: '14' },
      ],
      explain: 'Take the total up to day b, then take away the total before day a. Each question takes one step.',
      hints: ['`totals[-1]` is the last total so far.', 'The total through day b is `totals[b + 1]`.', 'Take away `totals[a]`, the total before day a.'],
    },
    { id: 'write-no-repeat', type: 'write', level: 3,
      q: 'Stretch: pick the tool, then write it. `longest_no_repeat(songs)` hands back the length of the longest stretch side by side with no song twice. It must stay fast on 20000 songs.',
      starter: py`
        def longest_no_repeat(songs):
            # Your code here.
            return -1
      `,
      answer: py`
        def longest_no_repeat(songs):
            last_seen = {}
            left = 0
            best = 0
            for right in range(len(songs)):
                song = songs[right]
                if song in last_seen and last_seen[song] >= left:
                    left = last_seen[song] + 1
                last_seen[song] = right
                best = max(best, right - left + 1)
            return best
      `,
      tests: [
        { label: 'A repeat cuts the stretch', call: 'longest_no_repeat(["a", "b", "a", "c", "b"])', want: '3' },
        { label: 'All the same', call: 'longest_no_repeat(["x", "x", "x"])', want: '1' },
        { label: 'No repeats', call: 'longest_no_repeat(["p", "q", "r"])', want: '3' },
        { label: 'An empty list', call: 'longest_no_repeat([])', want: '0' },
        { label: 'An old repeat outside the window', call: 'longest_no_repeat(["a", "b", "b", "a"])', want: '2' },
        { label: '20000 different songs', call: 'longest_no_repeat(list(range(20000)))', want: '20000' },
      ],
      explain: 'The cue is "longest stretch side by side", so use a sliding window. A dict of last spots lets the left edge jump past a repeat.',
      hints: ['Which tool fits "longest stretch side by side"?', 'Keep a dict from each song to the last spot you saw it.', 'Move `left` only if that last spot is inside the window.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.3 */
Course.lesson('m28-capstone', {
  id: '28-3-bits-and-xor',
  num: '28.3',
  title: 'Bits: numbers as rows of switches',
  goal: 'You can read binary, use `&`, `|` and `^`, and find a lonely number with XOR.',
  mins: 15,
  steps: [
    { t: 'h', text: 'What does a computer really store?' },
    { t: 'p', text: 'Deep down, a computer stores only tiny switches. Each one is off or on. Every number you have used is a row of them.' },
    { t: 'q', id: 'spark-switches', type: 'mcq', level: 1,
      q: 'You have a row of 4 switches. Each one can be off or on. How many different patterns can you make?',
      options: [
        { text: '4', why: 'That is the number of switches. Each new switch doubles the patterns, as it can be off or on.' },
        { text: '8', why: 'That is the count for 3 switches. One more switch doubles it again.' },
        '16',
      ],
      answer: 2,
      explain: 'Each switch doubles the count: 2, 4, 8, 16. That is why a few switches can show big numbers.',
      hints: ['How many patterns does 1 switch have? How about 2?'],
    },
    { t: 'words', items: [
      { word: 'bit', means: 'One switch. It is 0 for off and 1 for on.' },
      { word: 'binary', say: 'BY-nuh-ree', means: 'A way to write numbers using only 0 and 1.' },
      { word: 'XOR', say: 'EX-or', means: 'A rule for 2 bits: the answer is 1 if they differ.' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'Each switch has a worth: 1, 2, 4, 8 and so on. Add up the worth of those that are on. Real switches sit anywhere. A [[bit]] gets its worth only from its place in the row.' },
    { t: 'viz', name: 'm28-binary', caption: 'Say if each switch goes on. Then try 0, 32, 63 and your age.' },
    { t: 'p', text: 'That is [[binary]]. `bin` turns a number into binary text. It adds `0b` at the front, to mark it as binary.' },
    { t: 'code', caption: 'Going the other way, `int` with a 2 reads binary text. `0b` also works in your code. Try your age.',
      output: '0b1101\n13\n13',
      code: py`
        print(bin(13))
        print(int("1101", 2))
        print(0b1101)
      `,
    },
    { t: 'q', id: 'read-bin', type: 'predict', level: 2,
      q: 'What will the screen show? Work it out from the switches: 6 is 4 + 2.',
      code: py`
        print(bin(6))
      `,
      options: [
        '0b110',
        { text: '0b011', why: 'That has the switches backward. The biggest worth comes first, so 4 is on the left.' },
        { text: '0b6', why: 'Binary has only 0 and 1. A 6 cannot appear in it.' },
      ],
      answer: 0,
      explain: 'The switches worth 4 and 2 are on, and the 1 is off. So it reads 110.',
      hints: ['Which switches add up to 6?'],
    },

    { t: 'h', text: 'How do you do maths on bits?' },
    { t: 'p', text: 'In Module 6, `&` and `|` worked on sets. On whole numbers, they work on bits. They go one column at a time.' },
    { t: 'table', caption: 'The bit operators', head: ['Write', 'A column gives 1 when...', 'Example'], rows: [
      ['`a & b` (AND)', 'both bits are 1', '`6 & 3` is `2`'],
      ['`a | b` (OR)', 'at least one bit is 1', '`6 | 3` is `7`'],
      ['`a ^ b` (XOR)', 'the 2 bits differ', '`6 ^ 3` is `5`'],
    ] },
    { t: 'viz', name: 'm28-bit-ops', caption: 'Predict each column. Then change the operator. Try a = b with XOR.' },
    { t: 'q', id: 'and-predict', type: 'predict', level: 2,
      q: '12 is 1100, and 10 is 1010. What will the screen show?',
      code: py`
        print(12 & 10)
        print(12 ^ 10)
      `,
      options: [
        { text: '8\n8', why: 'The first line is right. But XOR gives 1 where the bits differ, and that is 0110.' },
        '8\n6',
        { text: '14\n6', why: 'The 14 is OR, which you get from `|`. AND needs both bits to be 1.' },
      ],
      answer: 1,
      explain: 'AND keeps only the shared column, 1000, which is 8. XOR keeps the columns that differ, 0110, which is 6.',
      hints: ['Write 1100 over 1010, and go column by column.'],
    },
    { t: 'trap', think: '`2 ^ 3` means 2 to the power of 3, so it gives 8.',
      real: 'In Python, `^` is XOR, and `2 ^ 3` is 1. The power sign is `**`, so `2 ** 3` is 8. Python raises no error here, so this bug stays hidden.',
      code: py`
        print(2 ^ 3)    # 1
        print(2 ** 3)   # 8
      `,
    },
    { t: 'p', text: 'The last switch has a worth of 1, so it is on for every odd number. So `n & 1` is 1 for odd and 0 for even.' },
    { t: 'q', id: 'fill-odd', type: 'fill', level: 2,
      q: 'Fill the gap, so the code prints only the odd numbers.',
      code: py`
        for n in [4, 7, 10, 13]:
            if n & ____ == 1:
                print(n)
      `,
      blanks: ['1'],
      output: '7\n13',
      explain: '`n & 1` looks at only the last switch. That switch is on for odd numbers.',
      hints: ['Which switch decides if a number is odd?'],
    },

    { t: 'h', text: 'What can XOR do that nothing else can?' },
    { t: 'p', text: '[[XOR]] has 3 handy rules.' },
    { t: 'list', items: ['`x ^ x` is 0, as no column differs.', '`x ^ 0` is x, as nothing changes.', 'The order of the numbers does not matter.'] },
    { t: 'big', text: 'XOR a number with itself, and it cancels. So pairs vanish, and a lonely number stays.' },
    { t: 'viz', name: 'm28-xor-lonely', caption: 'Work out x when it asks. Then try no pairs, 3 copies of one number, and an empty list.' },
    { t: 'code', caption: 'Every number here has a partner, except one. Add a pair, and guess first.',
      output: '4\n0',
      code: py`
        def lonely(nums):
            x = 0
            for n in nums:
                x = x ^ n
            return x

        print(lonely([4, 1, 2, 1, 2]))
        print(lonely([7, 7]))
      `,
    },
    { t: 'q', id: 'xor-three', type: 'predict', level: 2,
      q: 'Now 5 appears 3 times. What will the screen show?',
      code: py`
        x = 0
        for n in [5, 5, 5]:
            x = x ^ n
        print(x)
      `,
      options: [
        { text: '0', why: 'You may expect all of them to cancel. Only pairs cancel, so the third 5 stays.' },
        '5',
        { text: '15', why: 'That adds them up. XOR compares bits, and it never carries.' },
      ],
      answer: 1,
      explain: 'The first two 5s cancel to 0. Then `0 ^ 5` is 5.',
      hints: ['Go one trip at a time: 0, then 5, then ...'],
    },
    { t: 'cost', title: 'How fast is it? n is how many numbers.', items: [
      { op: 'Find the lonely number with XOR', cost: 'O(n)', why: 'One walk. Each number takes one step.' },
      { op: 'Extra memory for XOR', cost: 'O(1)', why: 'Only the name `x`. A set of seen numbers would use O(n).' },
      { op: 'One `&`, `|` or `^` on small numbers', cost: 'O(1)', why: 'Computers do these in one go on numbers of normal size.' },
    ] },
    { t: 'h', text: 'Shifts: slide the whole row' },
    { t: 'p', text: '`<<` slides the bits left, and `>>` slides them right. A slide left doubles the number, as each bit moves to a bigger place. A slide right is the same as `// 2`.' },
    { t: 'code', caption: 'Try `1 << 10`. That doubles 1 ten times.',
      output: '10\n2\n8',
      code: py`
        print(5 << 1)
        print(5 >> 1)
        print(1 << 3)
      `,
    },
    { t: 'tip', title: 'Back to Module 27', text: 'Fenwick trees used `i & -i` as a rule. It gives the last switch that is on. For 12, which is 1100, it gives 100, which is 4. Now you can test it with `bin`.' },
    { t: 'tip', title: 'A swap you may see', text: 'Some people swap 2 names with 3 XOR lines. In Python, write `a, b = b, a`, as Module 5 showed. It is clearer, and nobody needs to work it out.' },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"every number appears twice, except one"', 'XOR them all'],
      ['"odd or even" in a tight loop', '`n & 1`'],
      ['"a power of 2"', 'A number with only 1 switch on'],
      ['"on or off" for a few small things', 'One bit for each thing'],
    ] },
  ],
  recap: [
    'You can read a small number in binary.',
    'You can work out `&`, `|` and `^` column by column.',
    'You can find a lonely number with XOR.',
  ],
  practice: [
    { id: 'match-ops', type: 'match', level: 1,
      q: 'Match each operator to its rule for one column.',
      pairs: [
        ['`&`', 'Both bits are 1'],
        ['`|`', 'At least one bit is 1'],
        ['`^`', 'The 2 bits differ'],
        ['`<<`', 'Slide all bits left'],
      ],
      explain: 'The first 3 work one column at a time. The shift moves the whole row.',
      hints: ['Which one do you read as "differ"?'],
    },
    { id: 'typed-or', type: 'predict', level: 1,
      q: 'Type what the screen will show. 12 is 1100, and 5 is 0101.',
      code: py`
        print(12 | 5)
      `,
      answer: '13',
      why: 'A column gives 1 if either bit is 1. That makes 1101, which is 8 + 4 + 1.',
      explain: 'OR keeps every switch that is on in either number. 1101 is 13.',
      hints: ['Write the 2 numbers in columns.', 'Then add the worth of each 1.'],
    },
    { id: 'power-mistake', type: 'mcq', level: 2,
      q: 'A program uses `size = 2 ^ 4` to get 16, but `size` comes out as 6. What went wrong?',
      options: [
        '`^` is XOR. The power sign is `**`.',
        { text: 'The numbers are too small for `^`.', why: '`^` works on any whole number. It did what it always does, which is XOR.' },
        { text: 'Python should have raised an error.', why: 'XOR is a real operator, so Python sees no mistake here. It cannot guess what you meant.' },
      ],
      answer: 0,
      explain: '`2 ^ 4` compares 0010 with 0100, which gives 0110, or 6. Use `2 ** 4` for 16.',
      hints: ['What does `^` mean in Python?'],
    },
    { id: 'fix-lonely', type: 'fix', level: 2,
      q: 'This `lonely` should find the one number with no partner. It gives wrong answers. Fix it.',
      code: py`
        def lonely(nums):
            x = 1
            for n in nums:
                x = x ^ n
            return x
      `,
      answer: py`
        def lonely(nums):
            x = 0
            for n in nums:
                x = x ^ n
            return x
      `,
      tests: [
        { label: 'One lonely number', call: 'lonely([3, 8, 3])', want: '8' },
        { label: 'The lonely one comes first', call: 'lonely([9, 2, 2])', want: '9' },
        { label: 'Only one number', call: 'lonely([6])', want: '6' },
        { label: 'Every number has a partner', call: 'lonely([4, 4])', want: '0' },
      ],
      explain: '`x ^ 0` is x, so 0 is the safe start. Starting at 1 flips the last switch of the answer.',
      hints: ['Which start value leaves a number unchanged?'],
    },
    { id: 'write-power-of-two', type: 'write', level: 2,
      q: 'A power of 2 has exactly one switch on, like 1, 2, 4 and 8. Write `is_power_of_two(n)`. It hands back True or False. Use a loop with `n & 1` and `n >> 1`.',
      starter: py`
        def is_power_of_two(n):
            on = 0
            # Your code here.
            return "?"
      `,
      answer: py`
        def is_power_of_two(n):
            on = 0
            while n > 0:
                on += n & 1
                n = n >> 1
            return on == 1
      `,
      tests: [
        { label: '1 is 2 to the power of 0', call: 'is_power_of_two(1)', want: 'True' },
        { label: '64 has one switch on', call: 'is_power_of_two(64)', want: 'True' },
        { label: '6 has 2 switches on', call: 'is_power_of_two(6)', want: 'False' },
        { label: '0 has no switches on', call: 'is_power_of_two(0)', want: 'False' },
        { label: 'A very big power', call: 'is_power_of_two(1 << 40)', want: 'True' },
        { label: 'A big number that is not', call: 'is_power_of_two((1 << 40) + 1)', want: 'False' },
      ],
      explain: 'Count the switches that are on, by reading the last bit and sliding right. Exactly 1 means a power of 2.',
      hints: ['`n & 1` reads the last switch.', '`n >> 1` drops the last switch.', 'Keep going while `n > 0`, then check the count.'],
    },
    { id: 'write-missing', type: 'write', level: 3,
      q: 'Stretch: a list holds the numbers from 0 to n, in any order, but one is missing. So the list has n items. Write `missing(nums)` with XOR. Use no sort, set or sum.',
      starter: py`
        def missing(nums):
            # Your code here.
            return -1
      `,
      answer: py`
        def missing(nums):
            x = len(nums)
            for i in range(len(nums)):
                x = x ^ i ^ nums[i]
            return x
      `,
      tests: [
        { label: 'The middle one is missing', call: 'missing([3, 0, 1])', want: '2' },
        { label: '0 is missing', call: 'missing([1, 2])', want: '0' },
        { label: 'The biggest is missing', call: 'missing([1, 0])', want: '2' },
        { label: 'The list is empty, so 0 is missing', call: 'missing([])', want: '0' },
        { label: 'A longer list', call: 'missing([5, 2, 0, 3, 1, 6])', want: '4' },
      ],
      explain: 'XOR every number from 0 to n with every item. Each number that is present appears twice and cancels. The missing one stays.',
      hints: ['Think of the numbers 0 to n as partners for the list items.', 'Start `x` at `len(nums)`, which is n.', 'On each trip, XOR in both `i` and `nums[i]`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.4 */
Course.lesson('m28-capstone', {
  id: '28-4-modulo-and-gcd',
  num: '28.4',
  title: 'Modulo and gcd: wrap around, and cut down fast',
  goal: 'You can wrap around a ring with `%`, and find a gcd in very few steps.',
  mins: 13,
  steps: [
    { t: 'h', text: 'What comes after 11 on a clock?' },
    { t: 'p', text: 'A clock has no 13. After the top, it starts again. Code needs this all the time, and you already know the tool that does it.' },
    { t: 'q', id: 'spark-clock', type: 'predict', level: 1,
      q: 'It is 10 on a clock with spots 0 to 11. What spot is 5 hours later?',
      code: py`
        print((10 + 5) % 12)
      `,
      options: [
        '3',
        { text: '15', why: 'That is 10 + 5, with no wrap. A clock with spots 0 to 11 has no spot 15.' },
        { text: '1', why: 'That is 15 // 12, how many full turns. `%` gives what is left after them.' },
      ],
      answer: 0,
      explain: '15 shared into groups of 12 leaves 3. So the hand stops at 3.',
      hints: ['`%` gives what is left over.'],
    },
    { t: 'words', items: [
      { word: 'modulo', say: 'MOD-yuh-low', means: 'What is left after sharing out into equal groups. Python writes it `%`.' },
      { word: 'gcd', say: 'jee see dee', means: 'The biggest whole number that divides 2 numbers with nothing left. It stands for greatest common divisor.' },
    ] },
    { t: 'p', text: 'You met `%` in Module 1, and in the hash buckets of Module 11. Its full name is [[modulo]]. Now see it as a walk around a ring.' },
    { t: 'viz', name: 'm28-clock', caption: 'Guess where the hand stops. Then try 60 steps on a ring of 5. Whole laps change nothing.' },
    { t: 'big', text: '`%` throws away whole laps. Only what is left moves the hand.' },
    { t: 'code', caption: 'Each line uses a wrap. Change the size of the ring, and the list.',
      output: 'last digit: 4\nnext player: 0\nnext player: 1',
      code: py`
        print("last digit:", 1234 % 10)

        players = 3
        turn = 2
        turn = (turn + 1) % players
        print("next player:", turn)
        turn = (turn + 1) % players
        print("next player:", turn)
      `,
    },
    { t: 'q', id: 'wrap-index', type: 'fill', level: 2,
      q: 'Fill the gap, so the walk goes round the list and never leaves it.',
      code: py`
        colours = ["red", "blue", "green"]
        for step in range(5):
            print(colours[step % ____])
      `,
      blanks: [['3', 'len(colours)']],
      output: 'red\nblue\ngreen\nred\nblue',
      explain: 'The list has 3 spots. So `step % 3` gives 0, 1, 2, then 0, 1 again.',
      hints: ['How many spots does the list have?'],
    },
    { t: 'trap', think: '`-1 % 5` gives -1, as the sign stays.',
      real: 'In Python, the answer takes the sign of the number on the right. So `-1 % 5` is 4, one step back on the ring. Some other languages give -1.',
      code: py`
        print(-1 % 5)   # 4
        print(4 % 5)    # 4
      `,
    },
    { t: 'p', text: 'Python whole numbers can grow as big as they need to. Other languages run out of room. So a problem may ask for the answer `% 1000`.' },
    { t: 'p', text: 'You can use `%` as you go. The last digits depend only on the last digits.' },
    { t: 'code', caption: 'This is the stair count from Module 25. `%` at each step keeps every number small. The answer matches. Try 2000 stairs.',
      output: '89\n89',
      code: py`
        def stairs(n):
            ways = [1, 1]
            for i in range(2, n + 1):
                ways.append(ways[i - 1] + ways[i - 2])
            return ways[n]

        def stairs_small(n):
            ways = [1, 1]
            for i in range(2, n + 1):
                ways.append((ways[i - 1] + ways[i - 2]) % 1000)
            return ways[n]

        print(stairs(10) % 1000)
        print(stairs_small(10))
      `,
    },

    { t: 'h', text: 'What is the biggest number that divides both?' },
    { t: 'p', text: 'A floor is 48 wide and 18 long. What is the biggest square tile that fills it with no cuts? You need the biggest number that divides both, which is the [[gcd]].' },
    { t: 'q', id: 'slow-gcd', type: 'predict', level: 2,
      q: 'The slow way counts down from the smaller number. How many tries does it take here?',
      code: py`
        a = 48
        b = 18
        d = min(a, b)
        tries = 1
        while a % d != 0 or b % d != 0:
            d -= 1
            tries += 1
        print(d, tries)
      `,
      options: [
        '6 13',
        { text: '6 6', why: 'The answer is 6, but it does not start at 6. It starts at 18 and counts down.' },
        { text: '18 1', why: '18 divides 18, but it does not divide 48 with nothing left.' },
      ],
      answer: 0,
      explain: 'It tries 18, 17, and on down to 6. That is 13 tries. With big numbers, it can take millions.',
      hints: ['It starts at 18. How many numbers are there from 18 down to 6?'],
    },
    { t: 'p', text: 'A Greek writer named Euclid wrote down a far better way, over 2000 years ago. Replace the pair `a, b` with `b, a % b`.' },
    { t: 'p', text: 'Any number that divides both a and b also divides what is left. So the gcd stays the same, and the numbers shrink.' },
    { t: 'viz', name: 'm28-gcd', caption: 'Work out each remainder. Then try a smaller than b, 0 and 5, and 987 with 610.' },
    { t: 'code', caption: 'Count the rounds and compare. `math` has its own `gcd`, as you see in the last line. Try your own big numbers.',
      output: '(6, 3)\n(1, 2)\n(21, 3)\n6',
      code: py`
        import math

        def gcd(a, b):
            rounds = 0
            while b > 0:
                a, b = b, a % b
                rounds += 1
            return a, rounds

        print(gcd(48, 18))
        print(gcd(1000000, 999999))
        print(gcd(1071, 462))
        print(math.gcd(48, 18))
      `,
    },
    { t: 'q', id: 'trace-gcd', type: 'trace', level: 2,
      q: 'Trace `gcd(30, 12)`. Write a and b at the start of each trip. Add one last row for when b is 0.',
      code: py`
        a = 30
        b = 12
        while b > 0:
            a, b = b, a % b
      `,
      head: ['a', 'b'],
      rows: [['30', '12'], ['12', '6'], ['6', '0']],
      given: 1,
      verify: 'a = 30\nb = 12\nprint(a, b)\nwhile b > 0:\n    a, b = b, a % b\n    print(a, b)',
      explain: '30 % 12 is 6. Then 12 % 6 is 0, so the loop stops. The answer is a, which is 6.',
      hints: ['The new a is the old b.', 'The new b is the old a % b.'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'One `%`, on numbers of normal size', cost: 'O(1)', why: 'It does not walk anything.' },
      { op: 'The slow gcd', cost: 'O(min(a, b))', why: 'It may count all the way down from the smaller number.' },
      { op: 'Euclid gcd', cost: 'O(log min(a, b))', why: 'Every 2 rounds, a at least halves. So the halving idea from Module 8 applies.' },
    ] },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"wrap around", "in a circle", "next turn"', '`(i + 1) % size`'],
      ['"the last digit"', '`n % 10`'],
      ['"give the answer % 1000"', 'Use `%` at each step'],
      ['"biggest tile", "simplest fraction", "biggest equal groups"', 'The gcd'],
    ] },
    { t: 'tip', title: 'Odd cases to test', text: 'Try a smaller than b. Try one number as 0: `gcd(0, 5)` is 5. `gcd(0, 0)` is 0 in Python. And `% 0` stops with a `ZeroDivisionError`.' },
  ],
  recap: [
    'You can wrap a walk around a ring with `%`.',
    'You can write gcd with `a, b = b, a % b`.',
    'You can say why Euclid takes so few steps.',
  ],
  practice: [
    { id: 'match-mod', type: 'match', level: 1,
      q: 'Match each line to what it gives.',
      pairs: [
        ['`17 % 5`', '2'],
        ['`20 % 5`', '0'],
        ['`3 % 5`', '3'],
        ['`-1 % 5`', '4'],
      ],
      explain: '`%` gives what is left after whole groups of 5. Going back 1 from 0 on a ring of 5 lands on 4.',
      hints: ['Picture a ring of 5 spots.'],
    },
    { id: 'typed-gcd', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        import math
        print(math.gcd(14, 21))
      `,
      answer: '7',
      why: '7 divides 14 and 21 with nothing left. Nothing bigger divides both.',
      explain: 'The numbers that divide 14 are 1, 2, 7 and 14. Of these, 1 and 7 also divide 21, and 7 is bigger.',
      hints: ['List the numbers that divide 14.'],
    },
    { id: 'why-euclid', type: 'mcq', level: 2,
      q: 'Why does `gcd(a, b)` equal `gcd(b, a % b)`?',
      options: [
        'A number that divides both a and b also divides what is left over.',
        { text: 'Because `%` always gives the gcd.', why: '`48 % 18` is 12, but the gcd is 6. It takes more rounds to reach the gcd.' },
        { text: 'Because b is always the answer.', why: 'b changes each round, and the loop ends when b is 0. The answer is a at that point.' },
      ],
      answer: 0,
      explain: 'What is left over is a, minus some copies of b. So anything dividing a and b divides that too.',
      hints: ['What is `a % b`, in terms of a and copies of b?'],
    },
    { id: 'fix-gcd', type: 'fix', level: 2,
      q: 'This `gcd` loses the old `b`, so it gives wrong answers. Fix it with one line.',
      code: py`
        def gcd(a, b):
            while b > 0:
                b = a % b
                a = b
            return a
      `,
      answer: py`
        def gcd(a, b):
            while b > 0:
                a, b = b, a % b
            return a
      `,
      tests: [
        { label: 'gcd(48, 18)', call: 'gcd(48, 18)', want: '6' },
        { label: 'a smaller than b', call: 'gcd(12, 30)', want: '6' },
        { label: 'No shared divisor but 1', call: 'gcd(17, 5)', want: '1' },
        { label: 'One number is 0', call: 'gcd(5, 0)', want: '5' },
        { label: 'The other number is 0', call: 'gcd(0, 5)', want: '5' },
      ],
      explain: 'Line by line, the first line replaces b before a can use it. Writing both on one line works out both new values first.',
      hints: ['What does `a = b` get, after b has changed?', 'Module 5 showed a swap on one line.'],
    },
    { id: 'write-simplify', type: 'write', level: 2,
      q: 'Write `simplify(top, bottom)`. It hands back the smallest whole numbers for that fraction, as a tuple. So 6 over 8 gives `(3, 4)`. Write your own gcd, or use `math.gcd`.',
      starter: py`
        def simplify(top, bottom):
            # Your code here.
            return "?"
      `,
      answer: py`
        import math

        def simplify(top, bottom):
            g = math.gcd(top, bottom)
            return top // g, bottom // g
      `,
      tests: [
        { label: '6 over 8', call: 'simplify(6, 8)', want: '(3, 4)' },
        { label: 'Already as small as it goes', call: 'simplify(3, 7)', want: '(3, 7)' },
        { label: 'A whole number', call: 'simplify(10, 5)', want: '(2, 1)' },
        { label: 'Big numbers', call: 'simplify(1071, 462)', want: '(51, 22)' },
        { label: '0 on top', call: 'simplify(0, 9)', want: '(0, 1)' },
        { label: 'The numbers stay whole, with no point', check: 'all(type(x) is int for x in simplify(6, 8))' },
      ],
      explain: 'Divide top and bottom by their gcd. Use `//`, as `/` always gives a float.',
      hints: ['Find the gcd first.', 'Use `//` for both divisions, so you get whole numbers.'],
    },
    { id: 'write-gears', type: 'write', level: 3,
      q: 'Stretch: 2 gears touch, with a teeth and b teeth. They start at a marked spot. Write `teeth_until_match(a, b)`. It hands back how many teeth pass before both marks line up again.',
      starter: py`
        def teeth_until_match(a, b):
            # Your code here.
            return -1
      `,
      answer: py`
        def gcd(a, b):
            while b > 0:
                a, b = b, a % b
            return a

        def teeth_until_match(a, b):
            return a * b // gcd(a, b)
      `,
      tests: [
        { label: '4 teeth and 6 teeth', call: 'teeth_until_match(4, 6)', want: '12' },
        { label: 'The same gear twice', call: 'teeth_until_match(5, 5)', want: '5' },
        { label: 'No shared divisor', call: 'teeth_until_match(7, 3)', want: '21' },
        { label: 'One divides the other', call: 'teeth_until_match(10, 2)', want: '10' },
        { label: 'Big gears', call: 'teeth_until_match(1071, 462)', want: '23562' },
      ],
      explain: 'You want the smallest number that both a and b divide. That is a x b, divided by their gcd.',
      hints: ['Try 4 and 6 by hand. List 4, 8, 12 and 6, 12.', 'The answer must divide evenly by both a and b.', '`a * b` counts the gcd twice, so divide by it once.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.5 */
Course.lesson('m28-capstone', {
  id: '28-5-primes-and-the-sieve',
  num: '28.5',
  title: 'Primes and the sieve',
  goal: 'You can test if a number is prime, and sieve for all primes up to n.',
  mins: 12,
  steps: [
    { t: 'h', text: 'Which numbers cannot be shared out?' },
    { t: 'p', text: 'You can share 12 sweets into 2, 3, 4 or 6 equal groups. But 13 sweets only share out as 1 group of 13, or 13 groups of 1. A number like 13 has a name.' },
    { t: 'words', items: [
      { word: 'prime', means: 'A whole number above 1 that only 1 and itself divide with nothing left.' },
      { word: 'sieve', say: 'SIV', means: 'A kitchen tool with holes. Here it means a way to remove what you do not want.' },
    ] },
    { t: 'q', id: 'spark-prime', type: 'mcq', level: 1,
      q: 'Which list holds only [[prime]] numbers?',
      options: [
        '2, 3, 5, 7',
        { text: '1, 2, 3, 5', why: '1 is not prime. A prime must be above 1. That keeps some maths rules tidy.' },
        { text: '3, 5, 7, 9', why: '9 is 3 x 3, so 3 divides it. Odd does not mean prime.' },
      ],
      answer: 0,
      explain: 'Each of these has only 2 divisors: 1 and itself. And 2 is the only even prime.',
      hints: ['Check each number. Does anything other than 1 and itself divide it?'],
    },
    { t: 'h', text: 'How do you test one number?' },
    { t: 'p', text: 'The slow way tries every number below n. But divisors come in pairs, like 4 x 9 for 36. If one is big, the other is small, so you can stop when `d * d` passes n.' },
    { t: 'code', caption: '`checks` counts the divides. Try a bigger prime, like 1000003. Then try a number that is not prime.',
      output: '97 True 95 8\n1000 False 1 1\n1 False 0 0',
      code: py`
        def slow_prime(n):
            if n < 2:
                return False, 0
            checks = 0
            for d in range(2, n):
                checks += 1
                if n % d == 0:
                    return False, checks
            return True, checks

        def is_prime(n):
            if n < 2:
                return False, 0
            checks = 0
            d = 2
            while d * d <= n:
                checks += 1
                if n % d == 0:
                    return False, checks
                d += 1
            return True, checks

        for n in [97, 1000, 1]:
            a, slow = slow_prime(n)
            b, fast = is_prime(n)
            print(n, b, slow, fast)
      `,
    },
    { t: 'q', id: 'stop-point', type: 'predict', level: 2,
      q: 'How many values of d does the loop try for 49? Count by hand first.',
      code: py`
        n = 49
        d = 2
        tries = 0
        while d * d <= n:
            tries += 1
            if n % d == 0:
                break
            d += 1
        print(d, tries)
      `,
      options: [
        '7 6',
        { text: '7 48', why: 'That is the slow way. It would try all the numbers below 49, but this stops at 7.' },
        { text: '49 48', why: 'It stops long before 49. 7 x 7 is 49, so d = 7 divides it.' },
      ],
      answer: 0,
      explain: 'd goes 2, 3, 4, 5, 6, 7. That is 6 tries, and 7 divides 49, so it stops.',
      hints: ['When does `d * d` reach 49?'],
    },
    { t: 'q', id: 'fix-edge-prime', type: 'mcq', level: 2,
      q: 'A friend writes `is_prime` with no `n < 2` check. What does it say about 1?',
      options: [
        'It says True, as the loop never runs. That is a bug.',
        { text: 'It says False, as 1 is not prime.', why: 'That is the truth, but the code needs a check to know it. With no check, the loop skips and it ends on True.' },
        { text: 'It crashes on 1.', why: 'Nothing crashes. `2 * 2 <= 1` is False, so the loop makes no trips.' },
      ],
      answer: 0,
      explain: 'That is an odd case from the start of this module. Testing 0 and 1 catches it.',
      hints: ['Does the loop run at all when n is 1?'],
    },

    { t: 'h', text: 'What if you need every prime up to 1000?' },
    { t: 'p', text: 'You could test each number in turn. A better way is to cross out what cannot be prime, and keep the rest. A [[sieve]] works like that.' },
    { t: 'analogy', title: 'Picture this', text: 'Each number is a child in a line. Each prime calls out its multiples, and those children sit down. Whoever is still standing at the end is prime. Unlike real children, no number ever gets bored.' },
    { t: 'big', text: 'Each prime crosses out its own multiples. Whatever nobody crosses out is prime.' },
    { t: 'viz', name: 'm28-sieve', caption: 'Say what each step will do. Then try n = 2, 9 and 40.' },
    { t: 'code', caption: 'Each `True` spot means "still alive". The third value in `range` is the jump, as in Module 3. Try n = 100.',
      output: '[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]',
      code: py`
        def sieve(n):
            alive = [True] * (n + 1)
            primes = []
            for p in range(2, n + 1):
                if alive[p]:
                    primes.append(p)
                    for m in range(p * p, n + 1, p):
                        alive[m] = False
            return primes

        print(sieve(30))
      `,
    },
    { t: 'q', id: 'order-sieve', type: 'order', level: 2,
      q: 'Put the lines in order, to count the primes up to 10. The screen should show 4.',
      lines: [
        'n = 10',
        'alive = [True] * (n + 1)',
        'count = 0',
        'for p in range(2, n + 1):',
        '    if alive[p]:',
        '        count += 1',
        '        for m in range(p * p, n + 1, p):',
        '            alive[m] = False',
        'print(count)',
      ],
      output: '4',
      explain: 'Everything starts alive. Each p still alive is a prime, and it crosses out its multiples.',
      hints: ['The name `alive` must exist before the loop.', '`print` goes last, with no indent.'],
    },
    { t: 'h', text: 'Count the work' },
    { t: 'code', caption: 'Test one by one, or use a sieve? Both give the same count. Compare the steps as n grows.',
      output: '100 25 236 104\n1000 168 5288 1411\n10000 1229 117527 16981',
      code: py`
        def by_testing(n):
            count = 0
            steps = 0
            for x in range(2, n + 1):
                d = 2
                prime = True
                while d * d <= x:
                    steps += 1
                    if x % d == 0:
                        prime = False
                        break
                    d += 1
                if prime:
                    count += 1
            return count, steps

        def by_sieve(n):
            alive = [True] * (n + 1)
            count = 0
            steps = 0
            for p in range(2, n + 1):
                if alive[p]:
                    count += 1
                    for m in range(p * p, n + 1, p):
                        alive[m] = False
                        steps += 1
            return count, steps

        for n in [100, 1000, 10000]:
            a, s1 = by_testing(n)
            b, s2 = by_sieve(n)
            print(n, b, s1, s2)
      `,
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Test one number', cost: 'O(sqrt n)', why: 'd stops once `d * d` passes n. sqrt n is the number that, times itself, gives n.' },
      { op: 'The sieve', cost: 'O(n log log n)', why: 'This is the known result. In practice, the crossings grow only a little faster than n.' },
      { op: 'Memory for the sieve', cost: 'O(n)', why: 'It keeps one True or False for each number.' },
    ] },
    { t: 'trap', think: 'each prime must start crossing out from `p + p`.',
      real: 'Numbers like `3 x 2` were crossed out when p was 2. The first new one for p is `p x p`. Starting there skips work, and the answer stays the same.',
      code: py`
        for m in range(p * p, n + 1, p):
            alive[m] = False
      `,
    },
    { t: 'table', caption: 'How to spot it', head: ['If the problem says...', 'Think of...'], rows: [
      ['"is this number prime?", once or a few times', 'Test up to `d * d <= n`'],
      ['"all primes up to n", "how many primes"', 'A sieve'],
      ['"the factors of n"', 'Divide by d, up to `d * d <= n`'],
    ] },
  ],
  recap: [
    'You can test a number by trying d up to `d * d <= n`.',
    'You can write a sieve with a list of True and False.',
    'You can say why crossing starts at `p * p`.',
  ],
  practice: [
    { id: 'count-to-30', type: 'mcq', level: 1,
      q: 'You run a sieve up to 30. Which one is the last prime the program uses to cross anything out?',
      options: [
        { text: '2', why: '2 does cross out many numbers. But 3 and 5 still have new numbers to cross out.' },
        '5',
        { text: '29', why: '29 is prime, but `29 * 29` is far past 30. So it crosses out nothing.' },
      ],
      answer: 1,
      explain: '`5 * 5` is 25, which is still in range. `7 * 7` is 49, which is past 30.',
      hints: ['A prime crosses things out only if `p * p` is 30 or less.'],
    },
    { id: 'typed-sieve', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        alive = [True] * 11
        for m in range(4, 11, 2):
            alive[m] = False
        print(alive[8], alive[9])
      `,
      answer: 'False True',
      why: 'The loop takes 4, 6, 8 and 10. It never touches 9.',
      explain: '8 is a multiple of 2, so it is crossed out. 9 is not touched by this loop.',
      hints: ['Write out what `range(4, 11, 2)` gives.'],
    },
    { id: 'fix-sieve-end', type: 'fix', level: 2,
      q: 'This `sieve` leaves n out of the answer when n is prime. Fix it.',
      code: py`
        def sieve(n):
            alive = [True] * (n + 1)
            primes = []
            for p in range(2, n):
                if alive[p]:
                    primes.append(p)
                    for m in range(p * p, n + 1, p):
                        alive[m] = False
            return primes
      `,
      answer: py`
        def sieve(n):
            alive = [True] * (n + 1)
            primes = []
            for p in range(2, n + 1):
                if alive[p]:
                    primes.append(p)
                    for m in range(p * p, n + 1, p):
                        alive[m] = False
            return primes
      `,
      tests: [
        { label: 'n is prime', call: 'sieve(7)', want: '[2, 3, 5, 7]' },
        { label: 'n is not prime', call: 'sieve(10)', want: '[2, 3, 5, 7]' },
        { label: 'The smallest prime', call: 'sieve(2)', want: '[2]' },
        { label: 'Below the smallest prime', call: 'sieve(1)', want: '[]' },
      ],
      explain: '`range` stops before its end. So `range(2, n)` never looks at n itself.',
      hints: ['What is the last value in `range(2, n)`?'],
    },
    { id: 'write-count-primes', type: 'write', level: 2,
      q: 'Write `count_primes(a, b)`. It counts the primes from a to b, and a and b count too. It must use a sieve, and stay fast for b = 100000.',
      starter: py`
        def count_primes(a, b):
            alive = [True] * (b + 1)
            # Your code here.
            return -1
      `,
      answer: py`
        def count_primes(a, b):
            alive = [True] * (b + 1)
            count = 0
            for p in range(2, b + 1):
                if alive[p]:
                    if p >= a:
                        count += 1
                    for m in range(p * p, b + 1, p):
                        alive[m] = False
            return count
      `,
      tests: [
        { label: 'From 1 to 10', call: 'count_primes(1, 10)', want: '4' },
        { label: 'Both ends are prime', call: 'count_primes(11, 13)', want: '2' },
        { label: 'No primes in this range', call: 'count_primes(24, 28)', want: '0' },
        { label: 'One number that is prime', call: 'count_primes(2, 2)', want: '1' },
        { label: 'Below 2 there are none', call: 'count_primes(0, 1)', want: '0' },
        { label: 'A big range', call: 'count_primes(1, 100000)', want: '9592' },
      ],
      explain: 'Run the whole sieve, because small primes still cross out big numbers. Count a prime only if it is at least a.',
      hints: ['Use the sieve from this lesson, with b as the top.', 'Add 1 only when `p >= a`.'],
    },
    { id: 'write-factors', type: 'write', level: 3,
      q: 'Stretch: write `factors(n)`. It hands back the list of primes that multiply to give n, from small to big. So `factors(12)` is `[2, 2, 3]`. For n below 2, it hands back `[]`.',
      starter: py`
        def factors(n):
            found = []
            # Your code here.
            return "?"
      `,
      answer: py`
        def factors(n):
            found = []
            d = 2
            while d * d <= n:
                if n % d == 0:
                    found.append(d)
                    n = n // d
                else:
                    d += 1
            if n > 1:
                found.append(n)
            return found
      `,
      tests: [
        { label: '12 is 2 x 2 x 3', call: 'factors(12)', want: '[2, 2, 3]' },
        { label: 'A prime has only itself', call: 'factors(13)', want: '[13]' },
        { label: 'A power of 2', call: 'factors(16)', want: '[2, 2, 2, 2]' },
        { label: '1 has no prime factors', call: 'factors(1)', want: '[]' },
        { label: 'A big prime stays fast', call: 'factors(1000003)', want: '[1000003]' },
        { label: 'A big number with a big factor', call: 'factors(2 * 1000003)', want: '[2, 1000003]' },
      ],
      explain: 'Divide out each d for as long as it fits. Whatever is left above 1 is itself a prime.',
      hints: ['Use `while d * d <= n`, as in `is_prime`.', 'If d divides n, save d and make n smaller. Keep d the same.', 'After the loop, n may still be above 1. If so, it is prime.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.6 */
const M28_NEIGHBOURS = py`
  def neighbours(grid, r, c):
      found = []
      for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
          nr = r + dr
          nc = c + dc
          if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):
              if grid[nr][nc] != "#":
                  found.append((nr, nc))
      return found
`;
const M28_PRICE = py`
  def price(grid, r, c):
      if grid[r][c] in "123456789":
          return int(grid[r][c])
      return 1
`;

Course.lesson('m28-capstone', {
  id: '28-6-maze-read',
  num: '28.6',
  title: 'Capstone, part 1: read a maze and find the neighbours',
  goal: 'You can read a maze from text, and list the open cells next to any cell.',
  mins: 14,
  steps: [
    { t: 'h', text: 'What are you building?' },
    { t: 'p', text: 'You will build a maze solver from plain text. It finds the fewest steps to the exit, then prints the route. Then it finds the cheapest route when some cells cost more.' },
    { t: 'table', caption: 'Five stages. Each one uses a tool you already have.', head: ['Stage', 'What it does', 'Your tools'], rows: [
      ['1', 'Read the maze', 'Strings and grids, Module 5'],
      ['2', 'Find the neighbours of a cell', 'Grids as graphs, Module 21'],
      ['3', 'Count the fewest steps', 'BFS with a queue, Modules 15 and 21'],
      ['4', 'Walk back and print the route', 'Who found whom, Module 21'],
      ['5', 'Stretch: find the cheapest route', 'Dijkstra with a heap, Modules 20 and 24'],
    ] },
    { t: 'p', text: '`S` is the start, and `E` is the exit. `#` is a wall, and `.` is open floor. You may step up, down, left or right.' },
    { t: 'q', id: 'spark-which-tool', type: 'mcq', level: 1,
      q: 'Find the fewest steps from S to E. Each step costs the same. Which tool fits?',
      options: [
        'BFS.',
        { text: 'DFS.', why: 'DFS goes deep first, so it can find a long way before a short one. The cue "fewest" needs layers.' },
        { text: 'Dijkstra.', why: 'Dijkstra gets it right, but it is the bigger tool. With equal steps, a queue is enough.' },
      ],
      answer: 0,
      explain: '"Fewest steps" with equal costs is the cue for BFS. Now watch it run on a maze of your own.',
      hints: ['Do the steps have different costs?'],
    },
    { t: 'viz', name: 'm28-maze', caption: 'Count by eye, then watch the layers. Now edit the maze: type your own rows, split by a slash.' },

    { t: 'h', text: 'Stage 1: read the maze' },
    { t: 'p', text: 'You met `split()` in Module 5. It cuts text at spaces, and at new lines too. So it turns a maze into a list of rows.' },
    { t: 'p', text: 'Three quote marks, `"""`, let a string run over many lines. That suits a maze.' },
    { t: 'code', caption: 'A list of strings works as a grid. `grid[1][2]` means row 1, then spot 2 in that row. Try other cells.',
      output: "['S.#', '..#', '#.E']\n#\n3 3",
      code: py`
        text = """
        S.#
        ..#
        #.E
        """
        grid = text.split()
        print(grid)
        print(grid[1][2])
        print(len(grid), len(grid[0]))
      `,
    },
    { t: 'q', id: 'stage-1-read', type: 'write', level: 2,
      q: 'Stage 1: write `read_maze(text)`. It hands back 3 things: the grid, the `(row, col)` of `S`, and the `(row, col)` of `E`. If a letter is missing, use `None` for it.',
      starter: py`
        def read_maze(text):
            grid = text.split()
            start = None
            end = None
            # Look at every cell here.
            return grid, start, end
      `,
      answer: py`
        def read_maze(text):
            grid = text.split()
            start = None
            end = None
            for r in range(len(grid)):
                for c in range(len(grid[r])):
                    if grid[r][c] == "S":
                        start = (r, c)
                    if grid[r][c] == "E":
                        end = (r, c)
            return grid, start, end
      `,
      tests: [
        { label: 'A small maze', call: 'read_maze("S.\\n.E")', want: '(["S.", ".E"], (0, 0), (1, 1))' },
        { label: 'S is not in the corner', call: 'read_maze("..S\\n#E#")', want: '(["..S", "#E#"], (0, 2), (1, 1))' },
        { label: 'E comes before S', call: 'read_maze("E.S")', want: '(["E.S"], (0, 2), (0, 0))' },
        { label: 'One column', call: 'read_maze("S\\n.\\n.\\nE")', want: '(["S", ".", ".", "E"], (0, 0), (3, 0))' },
        { label: 'E is missing', call: 'read_maze("S.#")', want: '(["S.#"], (0, 0), None)' },
        { label: 'Both are missing', call: 'read_maze("..#")', want: '(["..#"], None, None)' },
      ],
      explain: 'A loop in a loop visits every cell once. A tuple like `(r, c)` keeps the 2 numbers together.',
      hints: ['Loop over each row, then each spot in that row.', 'Compare `grid[r][c]` with `"S"` and with `"E"`.', 'Save the spot with `start = (r, c)`.'],
    },

    { t: 'h', text: 'Stage 2: find the neighbours' },
    { t: 'p', text: 'From any cell, try 4 moves. A move counts only if it stays on the grid and misses the walls. Run this first with no checks at all.' },
    { t: 'code', caption: 'This cell is in the middle, so all 4 moves stay on the grid. Now try r = 0 and c = 0. Guess first.',
      output: '0 1 .\n2 1 .\n1 0 .\n1 2 #',
      code: py`
        grid = ["S.#", "..#", "#.E"]
        r = 1
        c = 1
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr = r + dr
            nc = c + dc
            print(nr, nc, grid[nr][nc])
      `,
    },
    { t: 'q', id: 'wrap-trap', type: 'predict', level: 2,
      q: 'This check forgets to test for going below 0. What will the screen show?',
      code: py`
        grid = ["S#", "#.", ".#"]
        r = 0
        c = 0
        nr = r - 1
        if nr < len(grid) and grid[nr][c] != "#":
            print("step to row", nr)
        else:
            print("blocked")
      `,
      options: [
        { text: 'blocked', why: 'You may expect row -1 to be blocked. But it is below `len(grid)`, and -1 means the last row.' },
        'step to row -1',
        { text: 'IndexError', why: 'You may expect row -1 to fail. Python reads a -1 index as the last row.' },
      ],
      answer: 1,
      explain: 'Row -1 is the last row, and spot 0 there is open. So the walk jumps through the top of the maze.',
      hints: ['What is `grid[-1]`?'],
    },
    { t: 'q', id: 'stage-2-neighbours', type: 'write', level: 2,
      q: 'Stage 2: write `neighbours(grid, r, c)`. It hands back a list of the open cells next to `(r, c)`, as tuples. `S` and `E` count as open. Stay on the grid.',
      starter: py`
        def neighbours(grid, r, c):
            found = []
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr = r + dr
                nc = c + dc
                # Your code here.
            return found
      `,
      answer: M28_NEIGHBOURS,
      tests: [
        { label: 'A middle cell has 4', call: 'sorted(neighbours(["...", "...", "..."], 1, 1))', want: '[(0, 1), (1, 0), (1, 2), (2, 1)]' },
        { label: 'A corner has 2', call: 'sorted(neighbours(["...", "...", "..."], 2, 2))', want: '[(1, 2), (2, 1)]' },
        { label: 'Walls do not count', call: 'sorted(neighbours(["#.#", "#.#"], 0, 1))', want: '[(1, 1)]' },
        { label: 'Row -1 must not wrap to the last row', call: 'neighbours(["S#", "#.", ".#"], 0, 0)', want: '[]' },
        { label: 'Column -1 must not wrap to the last column', call: 'neighbours(["S#.", "###"], 0, 0)', want: '[]' },
        { label: 'S and E count as open', call: 'sorted(neighbours(["SE", ".."], 1, 0))', want: '[(0, 0), (1, 1)]' },
        { label: 'One cell has none', call: 'neighbours(["S"], 0, 0)', want: '[]' },
      ],
      explain: 'Check the edges first, so you never read a cell that is off the grid. Then check for a wall.',
      hints: ['`0 <= nr < len(grid)` checks the row.', 'Use `len(grid[0])` for the column.', 'Then keep the cell if it is not `"#"`.'],
    },
    { t: 'cost', title: 'How fast is it? R is rows, C is columns.', items: [
      { op: 'Read the maze', cost: 'O(R x C)', why: 'It visits each cell once.' },
      { op: 'Neighbours of one cell', cost: 'O(1)', why: 'It always makes 4 looks.' },
    ] },
    { t: 'tip', title: 'Test it like a real program', text: 'Try a maze with no E. Try a row that is shorter than the others. What should your program do? The choice is yours, and that is real design.' },
  ],
  recap: [
    'You can turn text into a grid of rows.',
    'You can find S and E with a loop in a loop.',
    'You can list the neighbours of a cell safely.',
  ],
  practice: [
    { id: 'why-split', type: 'mcq', level: 1,
      q: 'What does `"S.#\\n..E".split()` give?',
      options: [
        '`["S.#", "..E"]`',
        { text: '`["S", ".", "#", ".", ".", "E"]`', why: '`split` does not cut between letters. With nothing in the brackets, it cuts at spaces and new lines.' },
        { text: '`"S.#..E"`', why: '`split` hands back a list, not one string.' },
      ],
      answer: 0,
      explain: 'The `\\n` is a new line, so `split` cuts there. You get one string for each row.',
      hints: ['Where does `split()` cut?'],
    },
    { id: 'read-cell', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        grid = ["S.#", "..#", "#.E"]
        print(grid[2][0], grid[1][1])
      `,
      answer: '# .',
      why: 'Row 2, spot 0 is `#`. Row 1, spot 1 is `.`.',
      explain: 'The first number picks the row, and the second picks the spot in it.',
      hints: ['Row numbers start at 0, from the top.'],
    },
    { id: 'fix-edges', type: 'fix', level: 2,
      q: 'This `neighbours` lets the walk go off the top and off the left side. Fix the check.',
      code: py`
        def neighbours(grid, r, c):
            found = []
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr = r + dr
                nc = c + dc
                if nr < len(grid) and nc < len(grid[0]):
                    if grid[nr][nc] != "#":
                        found.append((nr, nc))
            return found
      `,
      answer: M28_NEIGHBOURS,
      tests: [
        { label: 'Row -1 does not wrap', call: 'neighbours(["S#", "#.", ".#"], 0, 0)', want: '[]' },
        { label: 'Column -1 does not wrap', call: 'neighbours(["S#.", "###"], 0, 0)', want: '[]' },
        { label: 'A middle cell still finds 4', call: 'sorted(neighbours(["...", "...", "..."], 1, 1))', want: '[(0, 1), (1, 0), (1, 2), (2, 1)]' },
        { label: 'The far corner stays on the grid', call: 'sorted(neighbours(["..", ".."], 1, 1))', want: '[(0, 1), (1, 0)]' },
      ],
      explain: 'The old check lets -1 through, and a -1 index is the last row or column. So test `0 <=` too.',
      hints: ['What is `nr` when `r` is 0 and `dr` is -1?', 'Write `0 <= nr < len(grid)`, and the same for `nc`.'],
    },
    { id: 'write-count-open', type: 'write', level: 2,
      q: 'Write `count_open(grid)`. It hands back how many cells are not walls. `S` and `E` count.',
      starter: py`
        def count_open(grid):
            # Your code here.
            return -1
      `,
      answer: py`
        def count_open(grid):
            total = 0
            for row in grid:
                for ch in row:
                    if ch != "#":
                        total += 1
            return total
      `,
      tests: [
        { label: 'A wall in the middle', call: 'count_open(["S#E"])', want: '2' },
        { label: 'All open', call: 'count_open(["S.", ".E"])', want: '4' },
        { label: 'All walls', call: 'count_open(["##", "##"])', want: '0' },
        { label: 'An empty maze', call: 'count_open([])', want: '0' },
        { label: 'Different rows', call: 'count_open(["S..#", "#..#", "##.E"])', want: '7' },
      ],
      explain: 'A string works in a `for` loop, so you can walk each row letter by letter.',
      hints: ['Loop over the rows, then over the letters in each row.', 'Add 1 when the letter is not `"#"`.'],
    },
    { id: 'write-dead-ends', type: 'write', level: 3,
      q: 'Stretch: a dead end is an open cell with exactly 1 open neighbour. Write `dead_ends(grid)`, which counts them. `neighbours` is ready for you.',
      starter: M28_NEIGHBOURS + '\n\n' + py`
        def dead_ends(grid):
            # Your code here.
            return -1
      `,
      answer: M28_NEIGHBOURS + '\n\n' + py`
        def dead_ends(grid):
            total = 0
            for r in range(len(grid)):
                for c in range(len(grid[r])):
                    if grid[r][c] != "#":
                        if len(neighbours(grid, r, c)) == 1:
                            total += 1
            return total
      `,
      tests: [
        { label: 'A hall has 2 ends', call: 'dead_ends(["S.E"])', want: '2' },
        { label: 'Lone cells are not dead ends', call: 'dead_ends(["S#E"])', want: '0' },
        { label: 'A room has none', call: 'dead_ends(["..", ".."])', want: '0' },
        { label: 'Walls never count', call: 'dead_ends(["###", "#.#", "###"])', want: '0' },
        { label: 'A maze with 3', call: 'dead_ends(["S..", "#.#", "#.E"])', want: '3' },
      ],
      explain: 'You already wrote the hard part. Reuse `neighbours` for each open cell, and check the length of its list.',
      hints: ['Skip the walls first.', 'Call `neighbours(grid, r, c)` for each open cell.', 'A dead end has a list of length 1.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.7 */
Course.lesson('m28-capstone', {
  id: '28-7-maze-search',
  num: '28.7',
  title: 'Capstone, part 2: count the fewest steps, then find the route',
  goal: 'You can count the fewest steps with BFS, and walk back to find the route.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Stage 3: count the fewest steps' },
    { t: 'p', text: 'The cue words are "fewest steps", and each step costs the same. So BFS is the tool. A dict from each cell to its steps also acts as your visited list.' },
    { t: 'viz', name: 'm28-maze', params: { maze: 'S.#E / ..#. / ..#.' }, caption: 'This maze has no way out. See how the search ends. Then open one wall, and watch again.' },
    { t: 'q', id: 'why-first-shortest', type: 'mcq', level: 2,
      q: 'BFS reaches E for the first time, with 7 steps. Could another route still be shorter?',
      options: [
        'No. Cells come out of the queue in order of their steps.',
        { text: 'Yes, so it must search every cell first.', why: 'DFS might need that. With a queue, every cell at 6 steps or fewer has already come out.' },
        { text: 'Yes, if the other route has fewer walls.', why: 'Walls are never stepped on, so they do not change the count. Only steps count.' },
      ],
      answer: 0,
      explain: 'A shorter route would have reached E in an earlier layer. It did not, so 7 is the fewest.',
      hints: ['What order do the layers come out in?'],
    },
    { t: 'q', id: 'stage-3-bfs', type: 'write', level: 2,
      q: 'Stage 3: write `fewest_steps(grid, start, end)`. It hands back the fewest steps, or -1 if there is no way out. Use the plan from the picture.',
      starter: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def fewest_steps(grid, start, end):
            dist = {start: 0}
            queue = deque([start])
            # Your code here.
            return -2
      `,
      answer: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def fewest_steps(grid, start, end):
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                if (r, c) == end:
                    return dist[end]
                for spot in neighbours(grid, r, c):
                    if spot not in dist:
                        dist[spot] = dist[(r, c)] + 1
                        queue.append(spot)
            return -1
      `,
      tests: [
        { label: 'One way through', call: 'fewest_steps(["S.#.", ".##.", "...E"], (0, 0), (2, 3))', want: '5' },
        { label: 'No way out', call: 'fewest_steps(["S#E"], (0, 0), (0, 2))', want: '-1' },
        { label: 'Walls close off the exit', call: 'fewest_steps(["S.#E", "..#.", "..#."], (0, 0), (0, 3))', want: '-1' },
        { label: 'An open room needs the shortest way', call: 'fewest_steps(["S....", ".....", ".....", ".....", "....E"], (0, 0), (4, 4))', want: '8' },
        { label: 'A short way and a long way', call: 'fewest_steps(["S..#.", "..###", ".#...", "...#.", "##..E"], (0, 0), (4, 4))', want: '8' },
        { label: 'S is already at the exit', call: 'fewest_steps(["S"], (0, 0), (0, 0))', want: '0' },
        { label: 'A long hall of 51 steps', call: 'fewest_steps(["S" + "." * 50 + "E"], (0, 0), (0, 51))', want: '51' },
        { label: 'A wide room is not too slow', call: 'fewest_steps(["." * 12] * 12, (0, 0), (11, 11))', want: '22' },
      ],
      explain: 'The queue gives cells in order of their steps. So the first time you reach the exit, no shorter way exists.',
      hints: ['Loop `while len(queue) > 0`, and use `popleft`.', 'If this cell is the end, hand back its steps.', 'A new spot gets `dist[(r, c)] + 1`, and joins the queue.'],
    },
    { t: 'code', caption: 'Here are stages 1, 2 and 3 joined up. Change the maze. Try one with no way out.',
      output: '7\n-1',
      code: py`
        from collections import deque

        def read_maze(text):
            grid = text.split()
            start = None
            end = None
            for r in range(len(grid)):
                for c in range(len(grid[r])):
                    if grid[r][c] == "S":
                        start = (r, c)
                    if grid[r][c] == "E":
                        end = (r, c)
            return grid, start, end

        def neighbours(grid, r, c):
            found = []
            moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            for dr, dc in moves:
                nr = r + dr
                nc = c + dc
                if 0 <= nr < len(grid):
                    if 0 <= nc < len(grid[0]):
                        if grid[nr][nc] != "#":
                            found.append((nr, nc))
            return found

        def fewest_steps(grid, start, end):
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                if (r, c) == end:
                    return dist[end]
                for spot in neighbours(grid, r, c):
                    if spot not in dist:
                        dist[spot] = dist[(r, c)] + 1
                        queue.append(spot)
            return -1

        maze = """
        S..#.
        ##.#.
        .....
        .###E
        """
        grid, start, end = read_maze(maze)
        print(fewest_steps(grid, start, end))

        grid, start, end = read_maze("S#E")
        print(fewest_steps(grid, start, end))
      `,
    },
    { t: 'h', text: 'A number is good. A route is better.' },
    { t: 'p', text: 'Your solver says "7 steps", but a person wants to see them. In Module 21, each cell wrote down who found it. Follow those notes back from the exit.' },
    { t: 'q', id: 'spark-who-found', type: 'mcq', level: 2,
      q: 'BFS is done, and `came_from` has an entry for each cell it found. Where should the walk back start?',
      options: [
        'At the exit, following `came_from` to the start.',
        { text: 'At the start, following `came_from` to the exit.', why: 'Each note points back to the cell that found it. So notes lead toward the start, and never forward.' },
        { text: 'At the cell with the biggest number.', why: 'A dead end can have a bigger number than the exit. Only the exit leads you along the route.' },
      ],
      answer: 0,
      explain: 'Each cell has one note, which says who found it. So from the exit, there is only one way back.',
      hints: ['Which way does a `came_from` note point?'],
    },
    { t: 'viz', name: 'm28-maze-route', caption: 'Say who found each cell. Then change the maze, and try one with no way out.' },
    { t: 'code', caption: 'Here are some notes after a search. Follow them by hand first. Then change a note and run it.',
      output: '[(0, 0), (0, 1), (1, 1)]',
      code: py`
        came_from = {
            (0, 0): None,
            (0, 1): (0, 0),
            (1, 1): (0, 1),
        }
        path = []
        at = (1, 1)
        while at is not None:
            path.append(at)
            at = came_from[at]
        path.reverse()
        print(path)
      `,
    },
    { t: 'h', text: 'Stage 4: find the route' },
    { t: 'q', id: 'stage-4-route', type: 'write', level: 2,
      q: 'Stage 4: write `find_route(grid, start, end)`. It hands back the list of cells from start to end, on a shortest route. If there is no way out, it hands back `[]`.',
      starter: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def find_route(grid, start, end):
            came_from = {start: None}
            queue = deque([start])
            # Your code here.
            return "?"
      `,
      answer: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def find_route(grid, start, end):
            came_from = {start: None}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                for spot in neighbours(grid, r, c):
                    if spot not in came_from:
                        came_from[spot] = (r, c)
                        queue.append(spot)
            if end not in came_from:
                return []
            path = []
            at = end
            while at is not None:
                path.append(at)
                at = came_from[at]
            path.reverse()
            return path
      `,
      tests: [
        { label: 'A straight hall', call: 'find_route(["S.E"], (0, 0), (0, 2))', want: '[(0, 0), (0, 1), (0, 2)]' },
        { label: 'Only one way through', call: 'find_route(["S#", ".#", ".E"], (0, 0), (2, 1))', want: '[(0, 0), (1, 0), (2, 0), (2, 1)]' },
        { label: 'No way out gives an empty list', call: 'find_route(["S#E"], (0, 0), (0, 2))', want: '[]' },
        { label: 'S is at the exit', call: 'find_route(["S"], (0, 0), (0, 0))', want: '[(0, 0)]' },
        { label: 'An open room: a route to the far corner', check: '(lambda g, s, e: (lambda p: p[0] == s and p[-1] == e and len(p) == 6 and all(abs(a[0] - b[0]) + abs(a[1] - b[1]) == 1 for a, b in zip(p, p[1:])) and all(g[r][c] != "#" for r, c in p))(find_route(g, s, e)))(["....", "....", "...."], (0, 0), (2, 3))' },
        { label: 'An open room: this route must stay short', check: '(lambda g, s, e: (lambda p: p[0] == s and p[-1] == e and len(p) == 3 and all(abs(a[0] - b[0]) + abs(a[1] - b[1]) == 1 for a, b in zip(p, p[1:])))(find_route(g, s, e)))(["....", "....", "...."], (0, 0), (2, 0))' },
        { label: 'A maze with a choice: valid, shortest, misses walls', check: '(lambda g, s, e: (lambda p: p[0] == s and p[-1] == e and len(p) == 9 and all(abs(a[0] - b[0]) + abs(a[1] - b[1]) == 1 for a, b in zip(p, p[1:])) and all(g[r][c] != "#" for r, c in p))(find_route(g, s, e)))(["S..#.", "..###", ".#...", "...#.", "##..E"], (0, 0), (4, 4))' },
      ],
      explain: 'First the search writes each note. Then the walk back follows the notes from the exit. The flip puts the start first.',
      hints: ['When a new spot joins the queue, set `came_from[spot] = (r, c)`.', 'If `end` has no note, hand back `[]`.', 'Walk back with `at`, then call `path.reverse()`.'],
    },
    { t: 'cost', title: 'How fast is it? R is rows, C is columns.', items: [
      { op: 'BFS over the maze', cost: 'O(R x C)', why: 'Each cell joins the queue once, and looks 4 ways. Dict checks are O(1) on average.' },
      { op: 'The walk back', cost: 'O(R x C)', why: 'At worst, the route visits every cell once.' },
    ] },
  ],
  recap: [
    'You can count the fewest steps with BFS.',
    'You can say why the first way found is shortest.',
    'You can walk back through `came_from` to get a route.',
  ],
  practice: [
    { id: 'flip-why', type: 'mcq', level: 1,
      q: 'After the walk back, why do you call `path.reverse()`?',
      options: [
        'The walk starts at the exit, so the list runs backward.',
        { text: 'BFS finds cells in the wrong order.', why: 'BFS finds cells in the right order for its layers. The walk back is what starts from the exit.' },
        { text: 'Python lists are kept backward.', why: 'A list keeps the order you add things. The first thing you added here was the exit.' },
      ],
      answer: 0,
      explain: 'The first cell added to `path` is the exit. So you must flip the list to start at S.',
      hints: ['Which cell gets added to `path` first?'],
    },
    { id: 'trace-layers', type: 'trace', level: 2,
      q: 'BFS runs on `["S.", "#E"]`. Fill in each cell as it leaves the queue. Write a cell as `r,c` with no spaces, then its steps.',
      code: py`
        grid = ["S.", "#E"]
        start = (0, 0)
        dist = {start: 0}
        queue = deque([start])
      `,
      head: ['cell', 'steps'],
      rows: [['0,0', '0'], ['0,1', '1'], ['1,1', '2']],
      given: 1,
      verify: 'from collections import deque\ngrid = ["S.", "#E"]\nstart = (0, 0)\ndist = {start: 0}\nqueue = deque([start])\nwhile len(queue) > 0:\n    r, c = queue.popleft()\n    print(str(r) + "," + str(c), dist[(r, c)])\n    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n        nr = r + dr\n        nc = c + dc\n        if 0 <= nr < 2 and 0 <= nc < 2 and grid[nr][nc] != "#":\n            if (nr, nc) not in dist:\n                dist[(nr, nc)] = dist[(r, c)] + 1\n                queue.append((nr, nc))',
      explain: 'S can only step right, as there is a wall below. Then `(0, 1)` steps down to E, at 2 steps.',
      hints: ['What is next to S?', 'Each new cell has one more step than the cell that found it.'],
    },
    { id: 'order-bfs', type: 'order', level: 2,
      q: 'Put the lines in order, to make the loop of your search. One line does not belong.',
      run: false,
      lines: [
        'while len(queue) > 0:',
        '    r, c = queue.popleft()',
        '    if (r, c) == end:',
        '        return dist[end]',
        '    for spot in neighbours(grid, r, c):',
        '        if spot not in dist:',
        '            dist[spot] = dist[(r, c)] + 1',
        '            queue.append(spot)',
      ],
      extra: ['    r, c = queue.pop()'],
      explain: '`popleft` takes the oldest cell, which keeps the layers in order. A cell gets its number when it joins the queue.',
      hints: ['The `while` line comes first.', 'A queue gives back its oldest item. Which line does that?'],
    },
    { id: 'trace-walk-back', type: 'trace', level: 2,
      q: 'Trace the walk back from `(1, 1)`. Write a cell as `r,c` with no spaces, or `None`. Each row shows the cell added, then `at` after the move.',
      code: py`
        came_from = {(0, 0): None, (0, 1): (0, 0), (1, 1): (0, 1)}
        at = (1, 1)
        path = []
        while at is not None:
            path.append(at)
            at = came_from[at]
      `,
      head: ['added', 'at_after'],
      rows: [['1,1', '0,1'], ['0,1', '0,0'], ['0,0', 'None']],
      given: 1,
      verify: 'came_from = {(0, 0): None, (0, 1): (0, 0), (1, 1): (0, 1)}\nname = lambda t: "None" if t is None else str(t[0]) + "," + str(t[1])\nat = (1, 1)\nwhile at is not None:\n    next_at = came_from[at]\n    print(name(at), name(next_at))\n    at = next_at',
      explain: 'Each note leads one cell closer to the start. The start has the note `None`, so the loop ends there.',
      hints: ['Read `came_from[(1, 1)]` first.', 'The start points to `None`.'],
    },
    { id: 'fix-steps', type: 'fix', level: 2,
      q: 'This search says 1 for any exit it can reach. It forgets the steps so far. Fix one line.',
      code: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def fewest_steps(grid, start, end):
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                if (r, c) == end:
                    return dist[end]
                for spot in neighbours(grid, r, c):
                    if spot not in dist:
                        dist[spot] = 1
                        queue.append(spot)
            return -1
      `,
      answer: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def fewest_steps(grid, start, end):
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                if (r, c) == end:
                    return dist[end]
                for spot in neighbours(grid, r, c):
                    if spot not in dist:
                        dist[spot] = dist[(r, c)] + 1
                        queue.append(spot)
            return -1
      `,
      tests: [
        { label: 'A hall of 3 steps', call: 'fewest_steps(["S..E"], (0, 0), (0, 3))', want: '3' },
        { label: 'E right next to S', call: 'fewest_steps(["SE"], (0, 0), (0, 1))', want: '1' },
        { label: 'Around a corner', call: 'fewest_steps(["S#", ".E"], (0, 0), (1, 1))', want: '2' },
        { label: 'No way out', call: 'fewest_steps(["S#E"], (0, 0), (0, 2))', want: '-1' },
      ],
      explain: 'A new cell is one step past the cell that found it. So add 1 to that cell\'s number.',
      hints: ['Look at the line that sets `dist[spot]`.', 'Which cell found `spot`?'],
    },
    { id: 'fix-no-reverse', type: 'fix', level: 2,
      q: 'This walk back gives the route the wrong way round. It also crashes on some mazes. Fix both.',
      code: py`
        def walk_back(came_from, end):
            path = []
            at = end
            while at is not None:
                path.append(at)
                at = came_from[at]
            return path
      `,
      answer: py`
        def walk_back(came_from, end):
            if end not in came_from:
                return []
            path = []
            at = end
            while at is not None:
                path.append(at)
                at = came_from[at]
            path.reverse()
            return path
      `,
      tests: [
        { label: 'Start comes first', call: 'walk_back({"S": None, "A": "S", "E": "A"}, "E")', want: '["S", "A", "E"]' },
        { label: 'The end has no note, so there is no route', call: 'walk_back({"S": None}, "E")', want: '[]' },
        { label: 'Start and end are the same', call: 'walk_back({"S": None}, "S")', want: '["S"]' },
      ],
      explain: 'A cell the search never reached has no note. So check that first. Then flip the list before you hand it back.',
      hints: ['What happens if `end` is not a key?', 'Which line puts the start first?'],
    },
    { id: 'write-nearest-exit', type: 'write', level: 3,
      q: 'Stretch: this maze has many exits, all marked `E`. Write `nearest_exit(grid, start)`. It hands back the fewest steps to any `E`, or -1 if none can be reached.',
      starter: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def nearest_exit(grid, start):
            # Your code here.
            return -2
      `,
      answer: 'from collections import deque\n\n' + M28_NEIGHBOURS + '\n\n' + py`
        def nearest_exit(grid, start):
            dist = {start: 0}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                if grid[r][c] == "E":
                    return dist[(r, c)]
                for spot in neighbours(grid, r, c):
                    if spot not in dist:
                        dist[spot] = dist[(r, c)] + 1
                        queue.append(spot)
            return -1
      `,
      tests: [
        { label: 'One exit is nearer', call: 'nearest_exit(["E...S.E"], (0, 4))', want: '2' },
        { label: 'The far exit is the only open one', call: 'nearest_exit(["E#S...E"], (0, 2))', want: '4' },
        { label: 'No exit can be reached', call: 'nearest_exit(["S#E"], (0, 0))', want: '-1' },
        { label: 'No exits at all', call: 'nearest_exit(["S.."], (0, 0))', want: '-1' },
        { label: 'The nearer exit is around a wall', call: 'nearest_exit(["S#E", "...", "E##"], (0, 0))', want: '2' },
      ],
      explain: 'BFS reaches cells in order of steps. So the first `E` to leave the queue is the nearest one.',
      hints: ['You do not need to find all the exits first.', 'Check `grid[r][c]` as each cell leaves the queue.', 'Hand back its steps as soon as you see an `E`.'],
    },
  ],
});

/* ------------------------------------------------------------------ 28.8 */
Course.lesson('m28-capstone', {
  id: '28-8-maze-costs-where-next',
  num: '28.8',
  title: 'Capstone, part 3: print the route, add costs, and where next',
  goal: 'You can print a route, find a cheapest route, and name what to learn next.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Stage 4, last part: show the route' },
    { t: 'p', text: 'A list of cells is hard to read. So print the maze, with stars on the route. A set of route cells makes each check about 1 step.' },
    { t: 'q', id: 'stage-4-draw', type: 'write', level: 2,
      q: 'Write `draw_route(grid, path)`. It hands back a new list of strings, with `*` on each `.` of the path. `S`, `E` and walls stay as they are. Do not change `grid`.',
      starter: py`
        def draw_route(grid, path):
            on_route = set(path)
            rows = []
            # Your code here.
            return rows
      `,
      answer: py`
        def draw_route(grid, path):
            on_route = set(path)
            rows = []
            for r in range(len(grid)):
                row = ""
                for c in range(len(grid[r])):
                    if (r, c) in on_route and grid[r][c] == ".":
                        row += "*"
                    else:
                        row += grid[r][c]
                rows.append(row)
            return rows
      `,
      tests: [
        { label: 'Stars on the floor of the route', call: 'draw_route(["S.E"], [(0, 0), (0, 1), (0, 2)])', want: '["S*E"]' },
        { label: 'Other floor stays as dots', call: 'draw_route(["S..", ".#.", "..E"], [(0, 0), (1, 0), (2, 0), (2, 1), (2, 2)])', want: '["S..", "*#.", "**E"]' },
        { label: 'No route means no stars', call: 'draw_route(["S#E"], [])', want: '["S#E"]' },
        { label: 'S and E next to each other', call: 'draw_route(["SE"], [(0, 0), (0, 1)])', want: '["SE"]' },
        { label: 'The grid stays as it was', check: '(lambda g: (draw_route(g, [(0, 0), (0, 1), (0, 2)]), g == ["S.E"])[1])(["S.E"])' },
        { label: 'It gives a new list, not the old one', check: '(lambda g: draw_route(g, []) is not g)(["S.E"])' },
      ],
      explain: 'Strings cannot change, so build a new string for each row. Set lookups keep each check to about 1 step on average.',
      hints: ['Build each row with `row = ""` and `row += ...`.', 'Put a `*` only if the cell is on the route and is a `.`.', 'Add each finished row to `rows`.'],
    },

    { t: 'h', text: 'Stage 5: what if some cells cost more?' },
    { t: 'p', text: 'Now a digit in the maze is a price, like mud or a toll. Each other open cell costs 1, and your start costs nothing. Fewest steps no longer means lowest cost.' },
    { t: 'q', id: 'cost-by-hand', type: 'mcq', level: 2,
      q: 'The maze rows are `S9E` and `111`. Going through the 9 takes 2 steps. Going around takes 4 steps. What does each route cost?',
      options: [
        'Through costs 10. Around costs 4.',
        { text: 'Through costs 2. Around costs 4.', why: 'That counts steps, not prices. The 9 costs 9 to step on, and E costs 1.' },
        { text: 'Through costs 9. Around costs 3.', why: 'That leaves out the exit. Stepping onto E costs 1 too.' },
      ],
      answer: 0,
      explain: 'Through is 9 + 1, which is 10. Around is 1 + 1 + 1 + 1, which is 4. The longer way is cheaper.',
      hints: ['Add the price of each cell you step on.', 'E costs 1, and the start costs nothing.'],
    },
    { t: 'code', caption: 'Add up each route in code. Then change a price, and guess which route wins.',
      output: '10\n4',
      code: py`
        def price(grid, r, c):
            if grid[r][c] in "123456789":
                return int(grid[r][c])
            return 1

        grid = ["S9E", "111"]
        through = [(0, 1), (0, 2)]
        around = [(1, 0), (1, 1), (1, 2), (0, 2)]
        for route in [through, around]:
            total = 0
            for r, c in route:
                total += price(grid, r, c)
            print(total)
      `,
    },
    { t: 'viz', name: 'm28-maze-costs', caption: 'Choose which cell comes off next. Then raise or lower a price. Can you make both routes cost the same?' },
    { t: 'q', id: 'stage-5-cheapest', type: 'write', level: 3,
      q: 'Stage 5, a Stretch: write `cheapest(grid, start, end)`. It hands back the lowest total cost, or -1 if there is no way out. `price` and `neighbours` are ready for you.',
      starter: 'import heapq\n\n' + M28_NEIGHBOURS + '\n\n' + M28_PRICE + '\n\n' + py`
        def cheapest(grid, start, end):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            # Your code here.
            return -2
      `,
      answer: 'import heapq\n\n' + M28_NEIGHBOURS + '\n\n' + M28_PRICE + '\n\n' + py`
        def cheapest(grid, start, end):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, spot = heapq.heappop(heap)
                if spot in finished:
                    continue
                finished.add(spot)
                if spot == end:
                    return cost
                r, c = spot
                for nr, nc in neighbours(grid, r, c):
                    new = cost + price(grid, nr, nc)
                    cell = (nr, nc)
                    if cell not in best or new < best[cell]:
                        best[cell] = new
                        heapq.heappush(heap, (new, cell))
            return -1
      `,
      tests: [
        { label: 'Around the costly cell is cheaper', call: 'cheapest(["S9E", "111"], (0, 0), (0, 2))', want: '4' },
        { label: 'The only way costs what it costs', call: 'cheapest(["S2E", "#5#"], (0, 0), (0, 2))', want: '3' },
        { label: 'A costly cell can still be worth it', call: 'cheapest(["S3E", "999"], (0, 0), (0, 2))', want: '4' },
        { label: 'A long way can beat a short way', call: 'cheapest(["S9.E", "1.9.", "1111"], (0, 0), (0, 3))', want: '7' },
        { label: 'No way out', call: 'cheapest(["S#E"], (0, 0), (0, 2))', want: '-1' },
        { label: 'S is at the exit', call: 'cheapest(["S"], (0, 0), (0, 0))', want: '0' },
        { label: 'Plain floor costs 1 for each step', call: 'cheapest(["S" + "." * 30 + "E"], (0, 0), (0, 31))', want: '31' },
        { label: 'It must take the cheap row, not the first row', call: 'cheapest(["S5555E", "111111"], (0, 0), (0, 5))', want: '7' },
      ],
      explain: 'Pop the cheapest cell, and its cost is final. Each neighbour then gets a cost through this cell, if that beats its best.',
      hints: ['Start like Module 24: pop, then skip if finished, then mark.', 'If the popped spot is the end, its cost is the answer.', '`new = cost + price(grid, nr, nc)`. Push when it beats the best so far.'],
    },
    { t: 'p', text: 'Here is the whole solver, all in one place. It is under 100 lines. You learned every part of it in this course.' },
    { t: 'code', caption: 'Your solver, end to end. Change the maze, and run it. Try no way out, then try a digit in the way.',
      output: '7 steps\nS**#.\n##*#.\n..***\n.###E\ncost 7',
      code: py`
        import heapq
        from collections import deque

        def read_maze(text):
            grid = text.split()
            start = None
            end = None
            for r in range(len(grid)):
                for c in range(len(grid[r])):
                    if grid[r][c] == "S":
                        start = (r, c)
                    if grid[r][c] == "E":
                        end = (r, c)
            return grid, start, end

        def neighbours(grid, r, c):
            found = []
            moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            for dr, dc in moves:
                nr = r + dr
                nc = c + dc
                if 0 <= nr < len(grid):
                    if 0 <= nc < len(grid[0]):
                        if grid[nr][nc] != "#":
                            found.append((nr, nc))
            return found

        def find_route(grid, start, end):
            came_from = {start: None}
            queue = deque([start])
            while len(queue) > 0:
                r, c = queue.popleft()
                for spot in neighbours(grid, r, c):
                    if spot not in came_from:
                        came_from[spot] = (r, c)
                        queue.append(spot)
            if end not in came_from:
                return []
            path = []
            at = end
            while at is not None:
                path.append(at)
                at = came_from[at]
            path.reverse()
            return path

        def draw_route(grid, path):
            on_route = set(path)
            rows = []
            for r in range(len(grid)):
                row = ""
                for c in range(len(grid[r])):
                    if (r, c) in on_route and grid[r][c] == ".":
                        row += "*"
                    else:
                        row += grid[r][c]
                rows.append(row)
            return rows

        def price(grid, r, c):
            if grid[r][c] in "123456789":
                return int(grid[r][c])
            return 1

        def cheapest(grid, start, end):
            best = {start: 0}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, spot = heapq.heappop(heap)
                if spot in finished:
                    continue
                finished.add(spot)
                if spot == end:
                    return cost
                r, c = spot
                for nr, nc in neighbours(grid, r, c):
                    new = cost + price(grid, nr, nc)
                    cell = (nr, nc)
                    if cell not in best or new < best[cell]:
                        best[cell] = new
                        heapq.heappush(heap, (new, cell))
            return -1

        maze = """
        S..#.
        ##.#.
        .....
        .###E
        """
        grid, start, end = read_maze(maze)
        path = find_route(grid, start, end)
        if len(path) == 0:
            print("no way out")
        else:
            print(len(path) - 1, "steps")
            for row in draw_route(grid, path):
                print(row)
            print("cost", cheapest(grid, start, end))
      `,
    },
    { t: 'cost', title: 'How fast is it? V is cells, E is links.', items: [
      { op: 'BFS', cost: 'O(V + E)', why: 'Each cell joins once, and each link gets one look. Here E is at most 4 x V.' },
      { op: 'Dijkstra with a heap', cost: 'O((V + E) log V)', why: 'Each push and pop takes about log steps, as Module 24 showed.' },
      { op: 'Drawing the route', cost: 'O(V)', why: 'One look at each cell. A set makes each check O(1) on average.' },
    ] },

    { t: 'h', text: 'How far you have come' },
    { t: 'p', text: 'When you started this course, `print` was new. Now you have built a program that finds its way through any maze you type. That is a long way to have come.' },
    { t: 'list', items: [
      'You can write Python that reads text, makes choices and repeats.',
      'You can count steps, and say how code grows.',
      'You can use lists, dicts, stacks, queues, heaps, trees and graphs.',
      'You can write search, sort, recursion, BFS, Dijkstra and a table of small answers.',
      'You can read a new problem, and pick a tool from its cue words.',
      'You can test your own code, and find out why it broke.',
    ] },
    { t: 'h', text: 'Where next?' },
    { t: 'p', text: 'This course left out some big ideas on purpose. You now know enough to read about them. Here are 4 real topics, and what each one builds on.' },
    { t: 'table', caption: 'Ideas you can look up now', head: ['Topic', 'What it is about', 'It builds on'], rows: [
      ['B-trees', 'Trees with many children at each node. Databases use them to make few slow disk reads.', 'Trees, Module 18'],
      ['Max flow', 'How much can move through a network of pipes at one time?', 'Graphs, Module 21'],
      ['A* (say "A star")', 'Dijkstra plus a good guess of the distance left. It often checks far fewer cells.', 'Your maze solver'],
      ['NP-hardness', 'Problems where nobody knows a fast way. Trying all choices can take far too long.', 'Backtracking, Module 19'],
    ] },
    { t: 'p', text: 'The best next step is to build something of your own. One small program you care about teaches more than any list.' },
    { t: 'list', ordered: true, items: [
      'Grow this solver. Add many exits, or make a game where you walk the maze yourself.',
      'Build something new and small: a quiz, a word finder, or a bus route map.',
      'Solve one problem a week. Name the tool from its cue words first, then write it.',
      'Go back to a lesson that felt hard. It may feel different now.',
      'Try a free practice site for coding problems. Ask an adult before you make an account.',
    ] },
    { t: 'p', text: 'You will get stuck again. Everyone who writes code does. When it happens, write a small example, try the slow way, and keep going.' },
  ],
  recap: [
    'You can draw a route on a maze with stars.',
    'You can find the cheapest route with Dijkstra.',
    'You can name 4 topics to read about next.',
  ],
  practice: [
    { id: 'pick-tool-final', type: 'mcq', level: 1,
      q: 'A delivery robot crosses a town grid. Grass cells cost more battery than road cells. Which tool finds the route that uses the least battery?',
      options: [
        { text: 'BFS.', why: 'BFS counts steps and ignores the battery cost. A route with few steps could cross lots of grass.' },
        'Dijkstra with a heap.',
        { text: 'A trie.', why: 'A trie keeps words that share their starts. A grid of costs has no words.' },
      ],
      answer: 1,
      explain: 'Cells with different costs, and a "least" to find, are the cues for Dijkstra.',
      hints: ['Do the steps all cost the same?'],
    },
    { id: 'predict-draw', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        grid = ["S.", ".E"]
        on_route = {(0, 0), (1, 0), (1, 1)}
        for r in range(2):
            row = ""
            for c in range(2):
                if (r, c) in on_route and grid[r][c] == ".":
                    row += "*"
                else:
                    row += grid[r][c]
            print(row)
      `,
      options: [
        'S.\n*E',
        { text: 'S*\n*E', why: '`(0, 1)` is not on the route. So that cell stays a dot.' },
        { text: '*.\n**', why: 'Only a `.` becomes a star. `S` and `E` stay as they are.' },
      ],
      answer: 0,
      explain: 'Only `(1, 0)` is both on the route and a dot. So it is the only star.',
      hints: ['Which cells on the route show a dot?'],
    },
    { id: 'final-cost', type: 'mcq', level: 2,
      q: 'Dijkstra pops a cell with cost 6. Could a later route reach that cell for less?',
      options: [
        'No. Every cell still in the heap costs at least 6, and prices are never below 0.',
        { text: 'Yes, so you must keep updating it.', why: 'A later route starts from a cost of 6 or more, then adds a price. It can never end below 6.' },
        { text: 'Only if the grid is big.', why: 'Size makes no difference here. Prices of 0 or more are what make the cost final.' },
      ],
      answer: 0,
      explain: 'The heap gives the smallest first, and walking on can only add cost. So the popped cost is final.',
      hints: ['What is true of everything left in the heap?'],
    },
    { id: 'write-route-cost', type: 'write', level: 2,
      q: 'Write `route_cost(grid, path)`. It adds up the price of each cell on the path, but not the first cell. `price` is ready for you. An empty path costs 0.',
      starter: M28_PRICE + '\n\n' + py`
        def route_cost(grid, path):
            # Your code here.
            return -1
      `,
      answer: M28_PRICE + '\n\n' + py`
        def route_cost(grid, path):
            total = 0
            for r, c in path[1:]:
                total += price(grid, r, c)
            return total
      `,
      tests: [
        { label: 'A digit and the exit', call: 'route_cost(["S3E"], [(0, 0), (0, 1), (0, 2)])', want: '4' },
        { label: 'Plain floor costs 1 each', call: 'route_cost(["S..E"], [(0, 0), (0, 1), (0, 2), (0, 3)])', want: '3' },
        { label: 'The first cell is free', call: 'route_cost(["9.E"], [(0, 0), (0, 1), (0, 2)])', want: '2' },
        { label: 'An empty path', call: 'route_cost(["S#E"], [])', want: '0' },
        { label: 'Only the start', call: 'route_cost(["S"], [(0, 0)])', want: '0' },
      ],
      explain: 'Skip the first cell with the slice `path[1:]`. Then add the price of each cell you step on.',
      hints: ['`path[1:]` is the path without its first cell.', 'A tuple can be unpacked in the loop: `for r, c in ...`.'],
    },
    { id: 'fix-price-digit', type: 'fix', level: 2,
      q: 'This `price` crashes on floor cells, and on `S` and `E`. Each of those should cost 1. Fix it.',
      code: py`
        def price(grid, r, c):
            return int(grid[r][c])
      `,
      answer: M28_PRICE,
      tests: [
        { label: 'A digit costs its value', call: 'price(["S7"], 0, 1)', want: '7' },
        { label: 'Floor costs 1', call: 'price(["."], 0, 0)', want: '1' },
        { label: 'The exit costs 1', call: 'price(["E"], 0, 0)', want: '1' },
        { label: 'The start costs 1 if you ask', call: 'price(["S"], 0, 0)', want: '1' },
      ],
      explain: '`int(".")` stops with a `ValueError`. So check that the letter is a digit before you turn it into a number.',
      hints: ['What does `int(".")` do?', 'Use `in "123456789"` to check first.'],
    },
    { id: 'write-cheapest-route', type: 'write', level: 3,
      q: 'Stretch: write `cheapest_route(grid, start, end)`. Hand back the cells on a cheapest route. Give `[]` if there is no way out. Join your Dijkstra with `came_from`.',
      starter: 'import heapq\n\n' + M28_NEIGHBOURS + '\n\n' + M28_PRICE + '\n\n' + py`
        def cheapest_route(grid, start, end):
            # Your code here.
            return "?"
      `,
      answer: 'import heapq\n\n' + M28_NEIGHBOURS + '\n\n' + M28_PRICE + '\n\n' + py`
        def cheapest_route(grid, start, end):
            best = {start: 0}
            came_from = {start: None}
            heap = [(0, start)]
            finished = set()
            while len(heap) > 0:
                cost, spot = heapq.heappop(heap)
                if spot in finished:
                    continue
                finished.add(spot)
                r, c = spot
                for nr, nc in neighbours(grid, r, c):
                    new = cost + price(grid, nr, nc)
                    cell = (nr, nc)
                    if cell not in best or new < best[cell]:
                        best[cell] = new
                        came_from[cell] = spot
                        heapq.heappush(heap, (new, cell))
            if end not in came_from:
                return []
            path = []
            at = end
            while at is not None:
                path.append(at)
                at = came_from[at]
            path.reverse()
            return path
      `,
      tests: [
        { label: 'It goes around the costly cell', call: 'cheapest_route(["S9E", "111"], (0, 0), (0, 2))', want: '[(0, 0), (1, 0), (1, 1), (1, 2), (0, 2)]' },
        { label: 'It pays when that is cheaper', call: 'cheapest_route(["S3E", "999"], (0, 0), (0, 2))', want: '[(0, 0), (0, 1), (0, 2)]' },
        { label: 'No way out', call: 'cheapest_route(["S#E"], (0, 0), (0, 2))', want: '[]' },
        { label: 'S is at the exit', call: 'cheapest_route(["S"], (0, 0), (0, 0))', want: '[(0, 0)]' },
        { label: 'A cheap way around, past a costly cell', call: 'cheapest_route(["S1", "91", "1E"], (0, 0), (2, 1))', want: '[(0, 0), (0, 1), (1, 1), (2, 1)]' },
      ],
      explain: 'When a cell gets a new best cost, write down who gave it. Then walk back from the exit, as you did for BFS.',
      hints: ['Set `came_from` for that cell in the same place you set `best`.', 'After the loop, check that `end` has a note.', 'Walk back, then flip.'],
    },
  ],
});
