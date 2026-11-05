/* Module 22: Greedy and Intervals. Part 3 (Trees, graphs and clever ideas). */
Course.module({
  id: 'm22-greedy',
  num: 22, part: 3, level: 'I',
  title: 'Greedy and Intervals',
  blurb: 'Take the best-looking choice each time, and learn when that rule tells the truth.',
  needs: ['m12-simple-sorts', 'm20-heaps'],
});

// ---------------------------------------------------------------- lesson 22.1
Course.lesson('m22-greedy', {
  id: '22-1-greedy-idea',
  num: '22.1',
  title: 'Greedy: when it works and when it lies',
  goal: 'You can run a greedy rule by hand and find an input that breaks it.',
  mins: 15,
  steps: [
    { t: 'h', text: 'Which coin would you grab first?' },
    { t: 'p', text: 'You must pay 6 cents with coins worth 1, 3 and 4. You want to use as few coins as you can. A friend has a rule: always take the biggest coin that fits.' },
    { t: 'q', id: 'first-try', type: 'mcq', level: 1,
      q: 'Follow the rule by hand. The coins are 1, 3 and 4. The amount is 6. How many coins does the rule use?',
      options: [
        { text: '2', why: '3 + 3 does use 2 coins. But the rule grabs the 4 first, so it never reaches 3 + 3.' },
        '3',
        { text: '6', why: 'That is six 1s. The rule takes the biggest coin that fits, not the smallest.' },
      ],
      answer: 1,
      explain: '4 fits, and 2 is left. 3 is too big. 1 fits, then 1 fits again. That is 4 + 1 + 1, so 3 coins.',
      hints: ['Start with the biggest coin. Does 4 fit in 6?', 'How much is left after the 4? Which coins fit in that?'],
    },
    { t: 'p', text: 'Did you spot that 3 + 3 also makes 6? That uses only 2 coins. So the rule gave a worse answer, and it felt so sensible.' },
    { t: 'words', items: [
      { word: 'greedy', means: 'Always take the best-looking choice right now, and never go back.' },
      { word: 'counterexample', means: 'One input that shows a rule gives a wrong answer.', say: 'COWN-ter-ex-am-pull' },
    ] },
    { t: 'analogy', title: 'Picture this', text: 'A bowl holds many candies. You may take 3, and you grab the biggest you see each time. That works, because one grab does not change the next. Coins are different. Taking the 4 leaves 2, and that spoils the next grabs. Here the candy picture stops being true.' },
    { t: 'viz', name: 'm22-coins', caption: 'Say what greedy does at each step. Then try coins 1 5 10 50. Try coins 3 5 with amount 6.' },
    { t: 'code', caption: 'This is the same rule in Python. `None` means the rule got stuck. Change the coins and run it.',
      code: py`
        def greedy_coins(coins, amount):
            used = []
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    used.append(coin)
            if amount > 0:
                return None
            return used

        print(greedy_coins([1, 3, 4], 6))
        print(greedy_coins([1, 5, 10, 50], 18))
        print(greedy_coins([3, 5], 6))
        print(greedy_coins([4, 6], 0))
      `,
      output: '[4, 1, 1]\n[10, 5, 1, 1, 1]\nNone\n[]',
    },
    { t: 'q', id: 'stuck', type: 'predict', level: 2,
      q: 'The coins are 6 and 4, and the amount is 8. What will the screen show?',
      code: py`
        def greedy_coins(coins, amount):
            used = []
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    used.append(coin)
            if amount > 0:
                return None
            return used

        print(greedy_coins([6, 4], 8))
      `,
      options: [
        { text: '[4, 4]', why: 'That is the best mix, but greedy never looks for it. It grabs the 6 first and never goes back.' },
        { text: '[6, 2]', why: 'There is no 2 coin here. The code can only use coins from the list.' },
        'None',
      ],
      answer: 2,
      explain: 'Greedy takes the 6, and 2 is left. No coin fits in 2, so it hands back `None`. Yet 4 + 4 makes 8.',
      hints: ['Which coin does the loop try first?', 'After the 6, how much is left? Does any coin fit?'],
    },
    { t: 'h', text: 'How often does greedy lie?' },
    { t: 'p', text: 'Here is the odd part. With coins 1, 3 and 4, greedy is right on most amounts. That makes its lies hard to spot.' },
    { t: 'viz', name: 'm22-coin-hunt', caption: 'Each column is one amount. Guess before you look. Then type coins 1 4 5.' },
    { t: 'q', id: 'count-mixes', type: 'mcq', level: 1,
      q: 'To find the best answer, you can try every mix. Count by hand: coins 1 and 3, amount 4. Going coin by coin, how many ways reach exactly 4?',
      options: [
        { text: '2', why: 'You may have counted 1 + 3 and 3 + 1 as one way. Going coin by coin, they are 2 different paths.' },
        '3',
        { text: '4', why: 'Write them out: 1+1+1+1, 1+3 and 3+1. There are no others.' },
      ],
      answer: 1,
      explain: 'The paths are 1+1+1+1, 1+3 and 3+1. Trying every mix must walk all of them.',
      hints: ['Start with 1. What can come next?', 'Then start with 3. What is left?'],
    },
    { t: 'code', caption: 'This code tries every mix, so it always finds the best. Each row shows the amount, greedy, then best. You do not need to write this one yet.',
      code: py`
        def greedy_coins(coins, amount):
            used = []
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    used.append(coin)
            return used

        def best_count(coins, amount):
            if amount == 0:
                return 0
            best = None
            for coin in coins:
                if coin <= amount:
                    rest = best_count(coins, amount - coin)
                    if rest is not None:
                        if best is None or rest + 1 < best:
                            best = rest + 1
            return best

        coins = [1, 3, 4]
        for amount in range(1, 11):
            g = len(greedy_coins(coins, amount))
            b = best_count(coins, amount)
            print(amount, g, b)
      `,
      output: '1 1 1\n2 2 2\n3 1 1\n4 1 1\n5 2 2\n6 3 2\n7 2 2\n8 2 2\n9 3 3\n10 4 3',
    },
    { t: 'big', text: 'A greedy rule is a guess until you have a reason. One counterexample proves it wrong. Many good tests never prove it right.' },
    { t: 'trap',
      think: 'Greedy passed my 5 tests, so it must be right.',
      real: 'With coins 1, 3 and 4, greedy passes amounts 1 to 5. Then amount 6 breaks it. You need a reason, not only tests.',
      code: py`
        print(greedy_coins([1, 3, 4], 5))   # [4, 1], the best
        print(greedy_coins([1, 3, 4], 6))   # [4, 1, 1], but 3 + 3 wins
      `,
    },
    { t: 'code', caption: 'Why not always try every mix? Count the calls. Each row shows the amount, then the calls. Greedy needs only one step per coin.',
      code: py`
        def tries(coins, amount):
            calls = 1
            for coin in coins:
                if coin <= amount:
                    calls = calls + tries(coins, amount - coin)
            return calls

        for amount in [5, 10, 15, 20]:
            print(amount, tries([1, 3, 4], amount))
      `,
      output: '5 15\n10 168\n15 1869\n20 20736',
    },
    { t: 'h', text: 'When can you trust greedy?' },
    { t: 'p', text: 'Look at coins 1, 5, 10 and 50. A 5 is five 1s, a 10 is two 5s, and a 50 is five 10s. Here greedy is always right, and you can see why.' },
    { t: 'steps', title: 'Why the biggest coin is safe here', items: [
      { label: 'Swap small coins for a big one', text: 'Say a mix holds five 1s. Swap them for one 5. The total stays the same, with fewer coins.', code: '1 + 1 + 1 + 1 + 1   # the same as 5' },
      { label: 'Do it for every size', text: 'Two 5s swap for one 10. Five 10s swap for one 50. So a best mix never holds that many.' },
      { label: 'Add up what can stay', text: 'A best mix holds at most four 1s, one 5 and four 10s. Those add up to 49.', code: '4 + 5 + 40   # 49' },
      { label: 'So the big coin is a must', text: 'For 50 or more, a best mix must hold a 50. So greedy is safe to take it. The same idea works for each smaller coin.' },
    ] },
    { t: 'p', text: 'Now you can see why coins 1, 3 and 4 break. A 4 is not a whole number of 3s. Two 3s make 6, and no swap to 4s keeps that total.' },
    { t: 'q', id: 'which-coins', type: 'mcq', level: 2,
      q: 'Which coins have this swap reason, so greedy is always right?',
      options: [
        '1, 2, 4, 8',
        { text: '1, 3, 4', why: 'You may trust it because it starts with 1. But 4 is not a whole number of 3s, and amount 6 breaks it.' },
        { text: '1, 4, 5', why: 'Bigger coins can still lie. 5 is not a whole number of 4s. For 8, greedy takes 5 + 1 + 1 + 1, but 4 + 4 wins.' },
      ],
      answer: 0,
      explain: '2 is two 1s. 4 is two 2s. 8 is two 4s. So every small group can swap up for a bigger coin.',
      hints: ['Divide each coin by the next smaller one.', 'Does it come out as a whole number each time?'],
    },
    { t: 'tip', title: 'Is that the only safe set?', text: 'No. Coins 1, 5, 10 and 25 also work with greedy. Yet 25 is not a whole number of 10s, so their reason takes longer. Without a reason, keep hunting for a counterexample.' },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Greedy coins', cost: 'O(k log k + c)', why: 'Sort k kinds of coin, then take c coins, one step each.' },
      { op: 'Try every mix', cost: 'O(k^a)', why: 'For amount a, each call can branch into k more. That is an upper limit. With 1, 3 and 4, calls grow about 1.6 times per extra cent.' },
    ] },
    { t: 'tip', title: 'How to spot greedy', text: 'Look for these words: **maximum number of**, **fewest**, **as many as you can**. Test a rule on tiny inputs and hunt for a counterexample. Found none? Look for a swap reason. Found one? Use another tool. Module 25 brings a better tool for these coins.' },
  ],
  recap: [
    'You can run a greedy rule by hand.',
    'You can show a rule is wrong with one counterexample.',
    'You can give a swap reason when greedy is safe.',
  ],
  practice: [
    { id: 'what-greedy', type: 'mcq', level: 1,
      q: 'What makes a rule greedy?',
      options: [
        'It takes the best-looking choice now and never goes back',
        { text: 'It tries every choice and keeps the best', why: 'That is brute force. Greedy looks at one choice at each step.' },
        { text: 'It always gives the best answer', why: 'This is the big trap. Greedy is fast, but it can lie, as coins 1, 3 and 4 show.' },
      ],
      answer: 0,
      explain: 'Greedy decides at each step and never undoes a choice. That is what makes it fast, and what makes it risky.',
      hints: ['Think of the candy bowl. Do you ever put one back?'],
    },
    { id: 'predict-coins', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        def greedy_coins(coins, amount):
            used = []
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    used.append(coin)
            return used

        print(greedy_coins([1, 5, 10], 17))
      `,
      answer: '[10, 5, 1, 1]',
      why: '10 fits, and 7 is left. 10 is too big now, so 5 fits, and 2 is left. Then 1 and 1.',
      explain: 'Greedy takes 10, then 5, then two 1s. That adds up to 17.',
      hints: ['Start with the biggest coin.', 'Keep track of how much is left.'],
    },
    { id: 'one-bad-test', type: 'mcq', level: 2,
      q: 'A greedy rule passes 100 tests and fails 1. What do you know?',
      options: [
        { text: 'It is almost always fine, so it is right', why: 'A rule that fails once is a wrong rule. Passing many tests does not cancel a counterexample.' },
        'The rule is wrong',
        { text: 'The failed test must be a mistake', why: 'If the test is correct, the rule is what broke. One good counterexample is proof.' },
      ],
      answer: 1,
      explain: 'One counterexample is enough to prove a rule wrong. Lots of passes never prove it right.',
      hints: ['How many counterexamples does it take?'],
    },
    { id: 'fix-order', type: 'fix', level: 2,
      q: 'This greedy code uses far too many coins for `[1, 5, 10]` and 16. It should give `[10, 5, 1]`. Fix it.',
      code: py`
        def greedy_coins(coins, amount):
            used = []
            for coin in coins:
                while amount >= coin:
                    amount = amount - coin
                    used.append(coin)
            return used
      `,
      answer: py`
        def greedy_coins(coins, amount):
            used = []
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    used.append(coin)
            return used
      `,
      tests: [
        { label: 'Coins 1, 5, 10, amount 16', call: 'greedy_coins([1, 5, 10], 16)', want: '[10, 5, 1]' },
        { label: 'Coins 10, 5, 1, amount 16', call: 'greedy_coins([10, 5, 1], 16)', want: '[10, 5, 1]' },
        { label: 'Amount 0', call: 'greedy_coins([1, 2], 0)', want: '[]' },
      ],
      explain: 'The loop must try the biggest coin first. `sorted` with `reverse=True` makes that order, whatever order the list came in.',
      hints: ['Which coin does the loop try first?', 'Look at how the lesson wrote the `for` line.'],
    },
    { id: 'swap-rule', type: 'write', level: 2,
      q: 'Write `swap_safe(coins)`. Sort the coins from small to big. Give back True if each coin divides the next one with nothing left over.',
      starter: py`
        def swap_safe(coins):
            # Your code here.
            return None
      `,
      answer: py`
        def swap_safe(coins):
            coins = sorted(coins)
            for i in range(1, len(coins)):
                if coins[i] % coins[i - 1] != 0:
                    return False
            return True
      `,
      tests: [
        { label: 'Coins 1, 5, 10, 50', call: 'swap_safe([1, 5, 10, 50])', want: 'True' },
        { label: 'Coins 1, 3, 4', call: 'swap_safe([1, 3, 4])', want: 'False' },
        { label: 'Mixed-up order', call: 'swap_safe([8, 1, 4, 2])', want: 'True' },
        { label: 'One coin', call: 'swap_safe([3])', want: 'True' },
        { label: 'No coins', call: 'swap_safe([])', want: 'True' },
      ],
      explain: 'Sort first, then check each neighbour with `%`. A leftover means the swap reason breaks.',
      hints: ['Sort the coins first.', '`a % b` is 0 when b divides a with nothing left over.', 'Start the loop at 1, so `coins[i - 1]` is real.'],
    },
    { id: 'first-lie', type: 'write', level: 3,
      q: 'Stretch: write `first_lie(coins, limit)`. Test amounts 1 up to `limit`. Give back the first amount where greedy loses to `best_count`. Getting stuck when a mix exists counts as losing. If there is none, give back None. Both helpers are ready for you.',
      starter: py`
        def greedy_count(coins, amount):
            count = 0
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    count = count + 1
            if amount > 0:
                return None
            return count

        def best_count(coins, amount):
            if amount == 0:
                return 0
            best = None
            for coin in coins:
                if coin <= amount:
                    rest = best_count(coins, amount - coin)
                    if rest is not None:
                        if best is None or rest + 1 < best:
                            best = rest + 1
            return best

        def first_lie(coins, limit):
            # Your code here.
            return 0
      `,
      answer: py`
        def greedy_count(coins, amount):
            count = 0
            for coin in sorted(coins, reverse=True):
                while amount >= coin:
                    amount = amount - coin
                    count = count + 1
            if amount > 0:
                return None
            return count

        def best_count(coins, amount):
            if amount == 0:
                return 0
            best = None
            for coin in coins:
                if coin <= amount:
                    rest = best_count(coins, amount - coin)
                    if rest is not None:
                        if best is None or rest + 1 < best:
                            best = rest + 1
            return best

        def first_lie(coins, limit):
            for amount in range(1, limit + 1):
                g = greedy_count(coins, amount)
                b = best_count(coins, amount)
                if b is not None:
                    if g is None or g > b:
                        return amount
            return None
      `,
      tests: [
        { label: 'Coins 1, 3, 4 lie at 6', call: 'first_lie([1, 3, 4], 10)', want: '6' },
        { label: 'Coins 1, 4, 5 lie at 8', call: 'first_lie([1, 4, 5], 10)', want: '8' },
        { label: 'Coins 3, 5 get stuck at 6', call: 'first_lie([3, 5], 10)', want: '6' },
        { label: 'Coins 1, 5, 10 never lie here', call: 'first_lie([1, 5, 10], 12)', want: 'None' },
        { label: 'A limit too small to see it', call: 'first_lie([1, 3, 4], 5)', want: 'None' },
      ],
      explain: 'Skip amounts no mix can make. Then greedy lies if it got stuck, or if it used more coins than the best.',
      hints: ['Loop over `range(1, limit + 1)`.', 'If `best_count` gives None, no mix exists, so greedy did not lie.', 'A lie means `g is None or g > b`.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 22.2
Course.lesson('m22-greedy', {
  id: '22-2-sort-then-sweep',
  num: '22.2',
  title: 'Sort, then sweep: merging and rooms',
  goal: 'You can merge intervals and count the rooms you need, using sort then sweep.',
  mins: 13,
  steps: [
    { t: 'h', text: 'Can one kid go to both clubs?' },
    { t: 'p', text: 'Draw each club as a bar on a timeline. Art club runs from 1 to 4. Chess club runs from 4 to 6.' },
    { t: 'q', id: 'both-clubs', type: 'mcq', level: 1,
      q: 'Art ends at 4, and chess starts at 4. Can one kid go to both?',
      options: [
        'Yes. Art ends right when chess starts',
        { text: 'No. They both use the time 4', why: 'A shared number looks like a clash. But art is over at 4, so no time is shared.' },
      ],
      answer: 0,
      explain: 'The bars touch at one point, but they share no time. Python needs you to decide this with `<` or `<=`.',
      hints: ['What is art doing the moment chess starts?'],
    },
    { t: 'words', items: [
      { word: 'interval', means: 'A stretch of time with a start and an end, like 2 to 5.', say: 'IN-ter-vul' },
      { word: 'overlap', means: 'Two intervals overlap if they share some time.' },
      { word: 'sweep', means: 'Walk along sorted items once, from the left to the right.' },
    ] },
    { t: 'table', caption: 'Four ways 2 bars can sit', head: ['Bars', 'Name', 'Do they share time?'], rows: [
      ['`1-3` and `5-6`', 'Apart', 'No. There is a gap.'],
      ['`1-3` and `2-5`', 'Overlap', 'Yes, from 2 to 3.'],
      ['`1-3` and `3-6`', 'Touching', 'No. They meet at 3.'],
      ['`1-6` and `2-3`', 'Contained', 'Yes. One sits inside.'],
    ] },
    { t: 'analogy', title: 'Picture this', text: 'This is still the candy bowl. You go along in order, decide on each bar, and never go back. Unlike candy, you do not pick by size. Sorting decides what you see next.' },
    { t: 'h', text: 'How do you join bars that overlap?' },
    { t: 'p', text: 'A sports hall gets booked many times. You want its busy stretches. So you merge bars that overlap or touch into one block.' },
    { t: 'viz', name: 'm22-merge', caption: 'Decide what each bar does. This list has touching and contained bars. Then try `1-10 2-3 4-5`, `2-4 2-4`, `1-2 3-4`, and an empty box.' },
    { t: 'q', id: 'count-looks', type: 'mcq', level: 1,
      q: 'Count by hand. The bars `1-2`, `3-4`, `5-6` and `7-8` are sorted. How many bars does the sweep look at?',
      options: [
        '4',
        { text: '6', why: 'That is the number of pairs, which you counted in module 13. The sweep compares each bar with the last block only.' },
        { text: '16', why: 'That is 4 times 4. The sweep has no loop inside its loop.' },
      ],
      answer: 0,
      explain: 'Each bar gets one look, then one check against the last block. So 4 bars take 4 looks.',
      hints: ['How many loops does `merge` have?'],
    },
    { t: 'code', caption: 'Read each line and see which case it tests. Then try your own bars.',
      code: py`
        def merge(meetings):
            merged = []
            for start, end in sorted(meetings):
                if len(merged) > 0 and start <= merged[-1][1]:
                    merged[-1][1] = max(merged[-1][1], end)
                else:
                    merged.append([start, end])
            return merged

        print(merge([(5, 6), (1, 3), (2, 5), (8, 10), (8, 9)]))
        print(merge([]))
        print(merge([(2, 4)]))
        print(merge([(1, 2), (3, 4)]))
        print(merge([(1, 3), (3, 5)]))
        print(merge([(1, 10), (2, 3)]))
      `,
      output: '[[1, 6], [8, 10]]\n[]\n[[2, 4]]\n[[1, 2], [3, 4]]\n[[1, 5]]\n[[1, 10]]',
    },
    { t: 'q', id: 'no-sort', type: 'predict', level: 2,
      q: 'Someone removed `sorted`. The bars are in the order 5-6, 1-2, 2-5. What will the screen show?',
      code: py`
        def merge(meetings):
            merged = []
            for start, end in meetings:
                if len(merged) > 0 and start <= merged[-1][1]:
                    merged[-1][1] = max(merged[-1][1], end)
                else:
                    merged.append([start, end])
            return merged

        print(merge([(5, 6), (1, 2), (2, 5)]))
      `,
      options: [
        { text: '[[1, 6]]', why: 'That is the right answer, and it needs the sort. Python only follows the steps you wrote.' },
        '[[5, 6]]',
        { text: '[[5, 6], [1, 2], [2, 5]]', why: 'Bar 1-2 starts at 1, and 1 <= 6. So the code merges it instead of adding it.' },
      ],
      answer: 1,
      explain: 'Without the sort, 1 and 2 are both `<= 6`. So both bars get merged into 5-6, and the time from 1 to 5 is lost.',
      hints: ['The first bar makes the block 5-6.', 'Is 1 <= 6? What does the code do then?'],
    },
    { t: 'p', text: 'So the sort does real work. After it, no later bar starts before the last block. That means only the last block can touch the next bar.' },
    { t: 'h', text: 'How many rooms do you need?' },
    { t: 'p', text: 'Say every meeting must happen, and you want the fewest rooms. Sweep by start time. Keep the end time of each open room in a [[heap]], so `ends[0]` is the soonest.' },
    { t: 'viz', name: 'm22-rooms', caption: 'Decide if each meeting can use a room again. Then try `1-3 1-3 1-3`, `1-2 2-3 3-4`, and one meeting.' },
    { t: 'code', caption: 'The heap gives the soonest end at once. Each meeting pushes one end, and may pop one.',
      code: py`
        import heapq

        def rooms_needed(meetings):
            ends = []
            for start, end in sorted(meetings):
                if len(ends) > 0 and ends[0] <= start:
                    heapq.heappop(ends)
                heapq.heappush(ends, end)
            return len(ends)

        day = [(1, 4), (2, 5), (4, 7), (5, 8), (6, 9)]
        print(rooms_needed(day))
        print(rooms_needed([]))
        print(rooms_needed([(1, 3), (1, 3), (1, 3)]))
        print(rooms_needed([(1, 10), (2, 3), (3, 4)]))
      `,
      output: '3\n0\n3\n2',
    },
    { t: 'q', id: 'touch-rooms', type: 'predict', level: 2,
      q: 'These 3 meetings touch end to end. What will the screen show?',
      code: py`
        import heapq

        def rooms_needed(meetings):
            ends = []
            for start, end in sorted(meetings):
                if len(ends) > 0 and ends[0] <= start:
                    heapq.heappop(ends)
                heapq.heappush(ends, end)
            return len(ends)

        print(rooms_needed([(1, 3), (3, 5), (5, 7)]))
      `,
      options: [
        '1',
        { text: '2', why: 'A room frees at 3, right when the next meeting starts. That room is used again each time.' },
        { text: '3', why: 'You may think touching needs a new room. But `ends[0] <= start` lets the same room carry on.' },
      ],
      answer: 0,
      explain: 'Each time, the old end equals the new start. So the heap pops one end and pushes one, and it stays at size 1.',
      hints: ['Is 3 <= 3?', 'How big is the heap after each meeting?'],
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Check every pair of bars', cost: 'O(n^2)', why: 'n bars make about n x n / 2 pairs.' },
      { op: 'Sort, then merge', cost: 'O(n log n)', why: 'The sort is the big part. You counted one look per bar after it.' },
      { op: 'Count rooms with a heap', cost: 'O(n log n)', why: 'n bars each push and may pop, and each costs O(log n).' },
    ] },
    { t: 'tip', title: 'How to spot sort, then sweep', text: 'Look for these words: **overlap**, **meetings**, **schedule**, **at the same time**, **busy times**, **fewest rooms**. Draw the bars first. Then ask which sort order makes the next choice clear.' },
  ],
  recap: [
    'You can merge bars, including touching and contained ones.',
    'You can say why the sort must come first.',
    'You can count rooms with a heap of end times.',
  ],
  practice: [
    { id: 'name-kind', type: 'mcq', level: 1,
      q: 'What do the bars `2-8` and `3-5` do?',
      options: [
        { text: 'Touch', why: 'Touching bars meet at one point, like 2-3 and 3-5. These share time from 3 to 5.' },
        'One is contained in the other',
        { text: 'Stay apart', why: 'Apart bars leave a gap. Here 3 comes before 8, so they share time.' },
      ],
      answer: 1,
      explain: '`3-5` starts after 2 and ends before 8. So it sits fully inside `2-8`.',
      hints: ['Draw both bars on a line from 0 to 10.'],
    },
    { id: 'predict-merge', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        def merge(meetings):
            merged = []
            for start, end in sorted(meetings):
                if len(merged) > 0 and start <= merged[-1][1]:
                    merged[-1][1] = max(merged[-1][1], end)
                else:
                    merged.append([start, end])
            return merged

        print(merge([(6, 8), (1, 3), (2, 4)]))
      `,
      answer: '[[1, 4], [6, 8]]',
      why: 'After sorting, 1-3 and 2-4 share time, so they become 1-4. Then 6 is past 4, so 6-8 stays apart.',
      explain: 'Sorted, the bars are 1-3, 2-4, 6-8. The first 2 merge into 1-4, and 6-8 is a new block.',
      hints: ['Sort the bars first.', 'Is 2 <= 3? Is 6 <= 4?'],
    },
    { id: 'fix-shrink', type: 'fix', level: 2,
      q: '`merge([(1, 10), (2, 3)])` should keep the block 1-10. Instead it shrinks to 1-3. Fix it so the end never gets smaller.',
      code: py`
        def merge(meetings):
            merged = []
            for start, end in sorted(meetings):
                if len(merged) > 0 and start <= merged[-1][1]:
                    merged[-1][1] = end
                else:
                    merged.append([start, end])
            return merged
      `,
      answer: py`
        def merge(meetings):
            merged = []
            for start, end in sorted(meetings):
                if len(merged) > 0 and start <= merged[-1][1]:
                    merged[-1][1] = max(merged[-1][1], end)
                else:
                    merged.append([start, end])
            return merged
      `,
      tests: [
        { label: 'A contained bar', call: 'merge([(1, 10), (2, 3)])', want: '[[1, 10]]' },
        { label: 'An overlap', call: 'merge([(1, 3), (2, 5)])', want: '[[1, 5]]' },
        { label: 'Touching bars', call: 'merge([(1, 3), (3, 5)])', want: '[[1, 5]]' },
        { label: 'Bars apart', call: 'merge([(1, 2), (4, 5)])', want: '[[1, 2], [4, 5]]' },
        { label: 'No bars', call: 'merge([])', want: '[]' },
      ],
      explain: 'A contained bar ends before the block does. `max` keeps whichever end is later.',
      hints: ['Which line changes the end of the block?', 'Which end should win, the old one or the new one?'],
    },
    { id: 'can-go-all', type: 'write', level: 2,
      q: 'Write `no_clashes(meetings)`. It gives back True if one person can go to all the meetings. Touching is fine.',
      starter: py`
        def no_clashes(meetings):
            # Your code here.
            return None
      `,
      answer: py`
        def no_clashes(meetings):
            ordered = sorted(meetings)
            for i in range(1, len(ordered)):
                if ordered[i][0] < ordered[i - 1][1]:
                    return False
            return True
      `,
      tests: [
        { label: 'Bars apart', call: 'no_clashes([(5, 6), (1, 3)])', want: 'True' },
        { label: 'An overlap', call: 'no_clashes([(1, 4), (3, 5)])', want: 'False' },
        { label: 'Touching is fine', call: 'no_clashes([(3, 5), (1, 3)])', want: 'True' },
        { label: 'A contained bar', call: 'no_clashes([(1, 9), (2, 3)])', want: 'False' },
        { label: 'One meeting', call: 'no_clashes([(1, 2)])', want: 'True' },
        { label: 'No meetings', call: 'no_clashes([])', want: 'True' },
      ],
      explain: 'After sorting, a clash always shows up between neighbours. So one sweep is enough.',
      hints: ['Sort first.', 'Compare each start with the end of the bar before it.', 'Use `<`, since touching is fine.'],
    },
    { id: 'order-rooms', type: 'order', level: 2,
      q: 'Put the lines in order to count the rooms for these meetings. Start with the import.',
      lines: [
        'import heapq',
        'def rooms(day):',
        '    ends = []',
        '    for start, end in sorted(day):',
        '        if len(ends) > 0 and ends[0] <= start:',
        '            heapq.heappop(ends)',
        '        heapq.heappush(ends, end)',
        '    return len(ends)',
        'print(rooms([(2, 6), (1, 3), (3, 5)]))',
      ],
      extra: ['        if len(ends) > 0 and ends[0] > start:'],
      output: '2',
      explain: '1-3 opens a room. 2-6 needs a second room. 3-5 uses the first room again, so 2 rooms are enough.',
      hints: ['You pop when a room is free. When is a room free?', 'The push happens for every meeting, so it sits outside the `if`.'],
    },
    { id: 'free-times', type: 'write', level: 3,
      q: 'Stretch: write `free_times(meetings)`. It gives back the gaps between busy times, as a list of pairs. Touching bars leave no gap.',
      starter: py`
        def free_times(meetings):
            # Your code here.
            return None
      `,
      answer: py`
        def free_times(meetings):
            gaps = []
            last_end = None
            for start, end in sorted(meetings):
                if last_end is not None and start > last_end:
                    gaps.append((last_end, start))
                if last_end is None or end > last_end:
                    last_end = end
            return gaps
      `,
      tests: [
        { label: 'One gap', call: 'free_times([(6, 8), (1, 3), (2, 4)])', want: '[(4, 6)]' },
        { label: 'A contained bar', call: 'free_times([(1, 10), (2, 3), (12, 13)])', want: '[(10, 12)]' },
        { label: 'Touching bars', call: 'free_times([(1, 3), (3, 5)])', want: '[]' },
        { label: 'One meeting', call: 'free_times([(2, 4)])', want: '[]' },
        { label: 'No meetings', call: 'free_times([])', want: '[]' },
      ],
      explain: 'Sweep by start, and remember the latest end so far. A start past that end means a gap.',
      hints: ['Sort first, as in `merge`.', 'Keep the latest end you have seen. A contained bar must not shrink it.', 'A gap runs from that end to the next start.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 22.3
Course.lesson('m22-greedy', {
  id: '22-3-most-meetings',
  num: '22.3',
  title: 'The most meetings: why ends first is safe',
  goal: 'You can pick the most meetings with ends first, and explain why that rule is safe.',
  mins: 15,
  steps: [
    { t: 'h', text: 'How do you fit the most meetings?' },
    { t: 'p', text: 'You can be in one meeting at a time. You want to go to as many as you can. Three greedy rules sound good.' },
    { t: 'q', id: 'starts-by-hand', type: 'mcq', level: 1,
      q: 'Try one rule by hand. The meetings are `0-9`, `1-4` and `4-8`. Take the one that starts first, then skip clashes. How many do you go to?',
      options: [
        '1',
        { text: '2', why: '`1-4` and `4-8` do fit together. But the rule took `0-9` first, and it clashes with both.' },
        { text: '3', why: '`0-9` shares time with both of the others. So you cannot go to all 3.' },
      ],
      answer: 0,
      explain: 'The rule takes `0-9`, since it starts first. Both other meetings clash with it, so you go to 1.',
      hints: ['Which meeting starts first?', 'Does `1-4` share time with it?'],
    },
    { t: 'viz', name: 'm22-activity', caption: 'Run it with starts first. Then change the rule to shortest first, then ends first. Keep the same meetings. Which rule wins?' },
    { t: 'p', text: 'Starts first lost to one long meeting. Shortest first lost to a short bar in the wrong spot. Ends first won here, but one win is no proof.' },
    { t: 'analogy', title: 'Picture this', text: 'Back to the candy bowl. The best-looking candy here is the meeting that ends first, since it leaves the most time. Unlike candy, a big bar is not a prize. It eats your day.' },
    { t: 'big', text: 'The meeting that ends first is always safe to take. Swap it into any best plan, and the plan stays as big.' },
    { t: 'words', items: [
      { word: 'exchange argument', means: 'A reason that swaps a choice for the greedy one and shows nothing gets worse.', say: 'ex-CHAYNJ AR-gyoo-ment' },
    ] },
    { t: 'steps', title: 'The swap reason, in plain words', items: [
      { label: 'Find the early bar', text: 'Find the meeting that ends first. Call it the early bar.' },
      { label: 'Take any best plan', text: 'Look at the first meeting in that plan. It ends with the early bar, or after it.' },
      { label: 'Swap it in', text: 'Take that meeting out and put the early bar in. The rest of the plan starts after the old first meeting ended. So the early bar cannot clash.' },
      { label: 'Do it again', text: 'The plan has the same size. Cross out what clashes with the early bar. The same reason works on what is left.' },
    ] },
    { t: 'viz', name: 'm22-swap-reason', caption: 'Watch one swap. Then try `2-5 1-3 5-6 5-8`, and two bars that end together, like `1-4 2-4 4-6`.' },
    { t: 'q', id: 'why-no-clash', type: 'mcq', level: 2,
      q: 'A best plan starts with `2-6`, then `6-8`. The early bar is `1-3`. Why can `1-3` replace `2-6`?',
      options: [
        '`1-3` ends before `6-8` starts',
        { text: '`1-3` is shorter than `2-6`', why: 'Length is not the reason. Shortest first can lose. What counts is when the bar ends.' },
        { text: '`1-3` starts first', why: 'Starts first can lose too. The swap works since the early bar ends no later.' },
      ],
      answer: 0,
      explain: 'The rest of the plan starts at 6 or later, and `1-3` ends at 3. So nothing clashes, and the plan keeps its size.',
      hints: ['When does the rest of the plan start?', 'When does `1-3` end?'],
    },
    { t: 'code', caption: 'A [[sort key]] picks the end time. In this order, kept meetings run left to right. So one number, `free_at`, is enough to check.',
      code: py`
        def end_time(m):
            return m[1]

        def most_meetings(meetings):
            count = 0
            free_at = 0
            for start, end in sorted(meetings, key=end_time):
                if start >= free_at:
                    count = count + 1
                    free_at = end
            return count

        print(most_meetings([(0, 9), (1, 4), (3, 5), (4, 8)]))
        print(most_meetings([]))
        print(most_meetings([(2, 4)]))
        print(most_meetings([(1, 4), (4, 7)]))
        print(most_meetings([(2, 4), (2, 4)]))
      `,
      output: '2\n0\n1\n2\n1',
    },
    { t: 'q', id: 'strict-test', type: 'predict', level: 2,
      q: 'This code uses `>` in its test. The second meeting starts right when the first one ends. What will the screen show?',
      code: py`
        def end_time(m):
            return m[1]

        count = 0
        free_at = 0
        day = [(1, 4), (4, 7)]
        for start, end in sorted(day, key=end_time):
            if start > free_at:
                count = count + 1
                free_at = end
        print(count)
      `,
      options: [
        '1',
        { text: '2', why: 'That is the right count, but it needs `>=`. Here 4 > 4 is False, so the second meeting gets skipped.' },
        { text: '0', why: 'The first meeting starts at 1, and 1 > 0 is True. So it does get counted.' },
      ],
      answer: 0,
      explain: 'The first meeting counts, and `free_at` becomes 4. Then 4 > 4 is False, so the code skips a meeting you could go to.',
      hints: ['Is 1 > 0?', 'Is 4 > 4?'],
    },
    { t: 'trap',
      think: 'Touching is a clash, so I should write `start > free_at`.',
      real: 'Touching is fine for one person. With `>`, you lose the second meeting. A meeting at 0 also fails, since `free_at` starts at 0.',
      code: py`
        if start >= free_at:   # 4 >= 4, so you can go
      `,
    },
    { t: 'h', text: 'Can the swap reason work on a new job?' },
    { t: 'p', text: 'You have 10 coins to spend. Toys cost 6, 2, 5 and 3. You want as many toys as you can get. The greedy rule says: buy the cheapest toy left.' },
    { t: 'q', id: 'trace-toys', type: 'trace', level: 2,
      q: 'Count by hand. Fill in what the loop prints.',
      code: py`
        money = 10
        for price in sorted([6, 2, 5, 3]):
            if price > money:
                break
            money = money - price
            print(price, money)
      `,
      head: ['price', 'money'],
      rows: [['2', '8'], ['3', '5'], ['5', '0']],
      given: 1,
      verify: 'money = 10\nfor price in sorted([6, 2, 5, 3]):\n    if price > money:\n        break\n    money = money - price\n    print(price, money)',
      explain: 'You buy 3 toys and spend all 10. The 6 costs too much by then, so the loop stops.',
      hints: ['`sorted` gives 2, 3, 5, 6. Take away each price.', 'After the 5, money is 0. Can you buy the 6?'],
    },
    { t: 'p', text: 'Here is the [[exchange argument]]. Take any shopping list. If it skips a cheap toy and holds one that costs more, swap them. The list costs the same or less, and it holds as many toys.' },
    { t: 'code', caption: 'One step means one look at a price. Check the empty list, the toy you cannot buy, and the repeats.',
      code: py`
        def most_toys(prices, money):
            count = 0
            steps = 0
            for price in sorted(prices):
                steps = steps + 1
                if price > money:
                    break
                money = money - price
                count = count + 1
            return count, steps

        print(most_toys([6, 2, 5, 3], 10))
        print(most_toys([], 10))
        print(most_toys([20], 10))
        print(most_toys([2, 2, 2], 4))
      `,
      output: '(3, 4)\n(0, 0)\n(0, 1)\n(2, 3)',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Try every plan of n meetings', cost: 'O(2^n)', why: 'Each meeting is in or out, so each new one doubles the plans.' },
      { op: 'Sort by end, then sweep', cost: 'O(n log n)', why: 'The sort is the big part. You counted one look per bar after it.' },
      { op: 'Buy the cheapest toys', cost: 'O(n log n)', why: 'The sort is the big part here too.' },
    ] },
    { t: 'table', caption: 'What touching bars mean in each job', head: ['Job', 'For `1-3` and `3-5`', 'The test in the code'], rows: [
      ['Merge busy times', 'They become one block, 1-5.', '`start <= last_end`'],
      ['Most meetings', 'You can go to both.', '`start >= free_at`'],
      ['Count rooms', 'One room is enough.', '`ends[0] <= start`'],
    ] },
    { t: 'tip', title: 'How to spot it', text: 'Look for these words: **the most meetings**, **maximum number of**, **fewest to remove**. Try sorting by end. Then ask if a swap reason holds, or hunt for a counterexample.' },
    { t: 'q', id: 'match-jobs', type: 'match', level: 2,
      q: 'Match each job to its plan.',
      pairs: [
        ['Join the busy times', 'Sort by start, then merge into the last block'],
        ['Go to the most meetings', 'Sort by end, then keep what does not clash'],
        ['Use the fewest rooms', 'Sort by start, with a heap of end times'],
      ],
      explain: 'All three sort, then sweep once. The job decides the sort order and what you keep track of.',
      hints: ['Which job needs the swap reason you saw?', 'Which job needs to know the soonest end?'],
    },
  ],
  recap: [
    'You can test a greedy rule on bars and catch it losing.',
    'You can pick the most meetings by sorting by end.',
    'You can give the swap reason in plain words.',
  ],
  practice: [
    { id: 'why-ends-first', type: 'mcq', level: 1,
      q: 'Why does ends first beat shortest first?',
      options: [
        'It always leaves the most time for what comes next',
        { text: 'Short meetings are never in a best plan', why: 'Short meetings are often in a best plan. The trouble is one short bar that clashes with 2 others.' },
        { text: 'It tries every plan and keeps the best', why: 'That is brute force. Ends first looks at each bar once and never goes back.' },
      ],
      answer: 0,
      explain: 'The meeting that ends first frees you the soonest. The swap reason shows that this choice never costs you a meeting.',
      hints: ['What does the early bar leave you with?'],
    },
    { id: 'predict-most', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        def end_time(m):
            return m[1]

        day = [(5, 9), (1, 2), (2, 6)]
        count = 0
        free_at = 0
        for start, end in sorted(day, key=end_time):
            if start >= free_at:
                count = count + 1
                free_at = end
        print(count)
      `,
      answer: '2',
      why: 'By end, the order is 1-2, 2-6, 5-9. You keep 1-2, and 2-6 touches it. Then 5 is before 6, so 5-9 gets skipped.',
      explain: 'You go to 1-2 and 2-6. The meeting 5-9 clashes with 2-6.',
      hints: ['Sort by end first.', 'Is 5 >= 6?'],
    },
    { id: 'fix-key', type: 'fix', level: 2,
      q: '`most_meetings([(0, 10), (1, 4), (4, 7)])` gives 1, but you can go to 2. Fix the sort.',
      code: py`
        def end_time(m):
            return m[1]

        def most_meetings(meetings):
            count = 0
            free_at = 0
            for start, end in sorted(meetings):
                if start >= free_at:
                    count = count + 1
                    free_at = end
            return count
      `,
      answer: py`
        def end_time(m):
            return m[1]

        def most_meetings(meetings):
            count = 0
            free_at = 0
            for start, end in sorted(meetings, key=end_time):
                if start >= free_at:
                    count = count + 1
                    free_at = end
            return count
      `,
      tests: [
        { label: 'One long bar in the way', call: 'most_meetings([(0, 10), (1, 4), (4, 7)])', want: '2' },
        { label: 'A short bar in the way', call: 'most_meetings([(1, 4), (3, 5), (4, 8)])', want: '2' },
        { label: 'No meetings', call: 'most_meetings([])', want: '0' },
      ],
      explain: 'Plain `sorted` uses the start first. That is the starts first rule, which lost to one long meeting.',
      hints: ['Which rule does plain `sorted` follow here?', 'A sort key can pick the end time.'],
    },
    { id: 'order-most', type: 'order', level: 2,
      q: 'Put the lines in order. They count the most meetings one person can go to. The list is already sorted by end.',
      lines: [
        'def most(ordered):',
        '    count, free_at = 0, 0',
        '    for start, end in ordered:',
        '        if start >= free_at:',
        '            count, free_at = count + 1, end',
        '    return count',
        'print(most([(2, 3), (3, 4), (1, 9)]))',
      ],
      extra: ['        if start > free_at:'],
      output: '2',
      explain: 'By end, the order is 2-3, 3-4, 1-9. You keep the first 2, since they touch. Then 1-9 clashes.',
      hints: ['The function comes first, and the call comes last.', 'Touching is fine. Which test allows that?'],
    },
    { id: 'fill-most', type: 'fill', level: 2,
      q: 'Fill the gaps, so this counts the most meetings one person can go to.',
      code: 'def end_time(m):\n    return m[1]\n\nmeetings = [(1, 8), (2, 3), (3, 6), (6, 7)]\ncount = 0\nfree_at = 0\nfor start, end in sorted(meetings, key=____):\n    if start >= ____:\n        count = count + 1\n        free_at = end\nprint(count)',
      blanks: ['end_time', 'free_at'],
      output: '3',
      explain: 'Ends first gives 2-3, 3-6 and 6-7. The long 1-8 clashes, so it gets skipped.',
      hints: ['Which function picks out the end time?', 'Which name remembers when you are free?'],
    },
    { id: 'fewest-cancel', type: 'write', level: 3,
      q: 'Stretch: write `fewest_to_cancel(meetings)`. It gives back the fewest meetings to cancel, so that the rest have no clashes.',
      starter: py`
        def fewest_to_cancel(meetings):
            # Your code here.
            return None
      `,
      answer: py`
        def end_time(m):
            return m[1]

        def fewest_to_cancel(meetings):
            kept = 0
            free_at = 0
            for start, end in sorted(meetings, key=end_time):
                if start >= free_at:
                    kept = kept + 1
                    free_at = end
            return len(meetings) - kept
      `,
      tests: [
        { label: 'One long bar in the way', call: 'fewest_to_cancel([(0, 10), (1, 4), (4, 7)])', want: '1' },
        { label: 'Nothing clashes', call: 'fewest_to_cancel([(1, 2), (2, 3)])', want: '0' },
        { label: 'The same bar 3 times', call: 'fewest_to_cancel([(1, 2), (1, 2), (1, 2)])', want: '2' },
        { label: 'No meetings', call: 'fewest_to_cancel([])', want: '0' },
        { label: 'Three clashes in a row', call: 'fewest_to_cancel([(1, 3), (2, 4), (3, 5)])', want: '1' },
      ],
      explain: 'Cancelling the fewest is the same as keeping the most. So run ends first, then take the kept count from the total.',
      hints: ['What is the link between kept and cancelled?', 'You already know how to keep the most.', 'The answer is the total minus the kept count.'],
    },
  ],
});

// ---------------------------------------------------------------- lesson 22.4
Course.lesson('m22-greedy', {
  id: '22-4-greedy-classics',
  num: '22.4',
  title: 'Greedy classics: stones, cookies and a gas trip',
  goal: 'You can solve the stones, cookies and gas problems, and say why each rule works.',
  mins: 15,
  optional: true,
  steps: [
    { t: 'h', text: 'Can you cross the river?' },
    { t: 'p', text: 'Stones sit in a row across a river. The number on a stone is the longest leap you can make from it. You may always leap shorter.' },
    { t: 'q', id: 'cross-hand', type: 'mcq', level: 1,
      q: 'Try it by hand. The stones are `[2, 3, 0, 1]`. Can you reach the last stone?',
      options: [
        'Yes. Leap 1, then leap 2',
        { text: 'No. A leap of 2 lands on the 0', why: 'You may leap shorter. A leap of 1 lands on the 3, and that gets you across.' },
      ],
      answer: 0,
      explain: 'From stone 0, leap 1 to stone 1. From there, you can leap up to 3, so stone 3 is in range.',
      hints: ['You do not have to take the longest leap.'],
    },
    { t: 'p', text: 'So the tempting rule, "always take your longest leap", lies. It lands on the 0 and gets stuck. A safer greedy idea is this: forget which leap to make. Keep track of the farthest stone you could reach.' },
    { t: 'analogy', title: 'Picture this', text: 'The candy here is your **reach**, not your leap. At each stone, you grab the farthest reach on offer. You never lose it, because a long leap can also stop short. Candy does not work like that, so the picture stops here.' },
    { t: 'viz', name: 'm22-jump', caption: 'Work out reach at each stone. Then try `3 1 1 0 2`, `0`, `1 0 2`, and an empty box.' },
    { t: 'code', caption: 'Compare the tempting rule with the reach rule. They disagree on the first list.',
      code: py`
        def longest_leap(stones):
            i = 0
            while i < len(stones) - 1:
                if stones[i] == 0:
                    return False
                i = i + stones[i]
            return True

        def can_cross(stones):
            reach = 0
            for i in range(len(stones)):
                if i > reach:
                    return False
                reach = max(reach, i + stones[i])
            return True

        for stones in [[2, 3, 0, 1], [3, 1, 1, 0, 2], [0], []]:
            print(longest_leap(stones), can_cross(stones))
      `,
      output: 'False True\nFalse False\nTrue True\nTrue True',
    },
    { t: 'p', text: 'Here is why reach is safe. Every stone up to `reach` can be stood on, since a long leap can stop short. So if `i` is past `reach`, no path gets there.' },
    { t: 'h', text: 'Who gets which cookie?' },
    { t: 'p', text: 'Each kid needs a cookie of at least some size. Each cookie feeds one kid. You want to feed as many kids as you can. The rule: give the smallest cookie that fits to the kid with the smallest need.' },
    { t: 'viz', name: 'm22-cookies', caption: 'Decide what each cookie does. Then try no cookies, and needs `2 2 2` with cookies `2 2`.' },
    { t: 'steps', title: 'The swap reason for cookies', items: [
      { label: 'A cookie too small', text: 'If a cookie is too small for the smallest need, it fits nobody. So you lose nothing by skipping it.' },
      { label: 'A different plan', text: 'Say a plan gives this cookie to a hungrier kid. The smallest need gets a bigger one.' },
      { label: 'Swap the two cookies', text: 'The hungrier kid gets the bigger cookie, which still fits. The smallest need gets this one, which fits too. The count stays the same.' },
    ] },
    { t: 'code', caption: 'After sorting, each cookie gets one look. `k` counts the kids you have fed.',
      code: py`
        def fed_kids(kids, cookies):
            kids = sorted(kids)
            cookies = sorted(cookies)
            k = 0
            for cookie in cookies:
                if k < len(kids) and cookie >= kids[k]:
                    k = k + 1
            return k

        print(fed_kids([2, 5, 3, 7], [3, 1, 6, 4]))
        print(fed_kids([], [1, 2]))
        print(fed_kids([3], []))
        print(fed_kids([2, 2, 2], [2, 2]))
        print(fed_kids([1], [9, 9]))
      `,
      output: '3\n0\n0\n2\n1',
    },
    { t: 'q', id: 'biggest-first', type: 'predict', level: 2,
      q: 'This code gives the biggest cookies out first, each to the next kid in sorted order. What will the screen show?',
      code: py`
        kids = [1, 5]
        cookies = sorted([6, 1], reverse=True)
        fed = 0
        for i in range(len(cookies)):
            if cookies[i] >= kids[i]:
                fed = fed + 1
        print(fed)
      `,
      options: [
        '1',
        { text: '2', why: 'Smallest first does feed 2: cookie 1 to need 1, and cookie 6 to need 5. This code wastes the 6 on need 1.' },
        { text: '0', why: 'The first check is 6 >= 1, which is True. So at least one kid gets fed.' },
      ],
      answer: 0,
      explain: 'Cookie 6 goes to the kid who needs 1. Then cookie 1 cannot feed the kid who needs 5. Small with small feeds both.',
      hints: ['Which cookie meets which kid?', 'Is 1 >= 5?'],
    },
    { t: 'h', text: 'Where do you start the trip?' },
    { t: 'p', text: 'Gas stations sit in a ring. At each one, you pick up some gas, then burn some to reach the next. You start with an empty tank. Which station lets you drive the full ring?' },
    { t: 'viz', name: 'm22-gas', caption: 'Watch the tank. Then try gas `2 2` with cost `3 3`, and gas `0 0 9` with cost `3 3 3`.' },
    { t: 'q', id: 'trace-gas', type: 'trace', level: 2,
      q: 'Count by hand. Gas is `[2, 1, 4]`, and cost is `[3, 2, 1]`. Fill in each station.',
      code: py`
        gas = [2, 1, 4]
        cost = [3, 2, 1]
        start = 0
        tank = 0
        for i in range(3):
            tank = tank + gas[i] - cost[i]
            if tank < 0:
                start = i + 1
                tank = 0
            print(i, tank, start)
      `,
      head: ['i', 'tank', 'start'],
      rows: [['0', '0', '1'], ['1', '0', '2'], ['2', '3', '2']],
      given: 1,
      verify: 'gas = [2, 1, 4]\ncost = [3, 2, 1]\nstart = 0\ntank = 0\nfor i in range(3):\n    tank = tank + gas[i] - cost[i]\n    if tank < 0:\n        start = i + 1\n        tank = 0\n    print(i, tank, start)',
      explain: 'Stations 0 and 1 each run dry. So start moves to 2. That took 3 looks, and trying every start could take 9.',
      hints: ['At station 1: 0 + 1 - 2 is below 0.', 'When the tank drops below 0, it goes back to 0 and start moves on.'],
    },
    { t: 'steps', title: 'Why the jump is safe', items: [
      { label: 'You ran dry at station i', text: 'You started at `start` and ran dry at station i. Every stop along the way kept the tank at 0 or more.' },
      { label: 'A later start has less gas', text: 'Starting at a stop in between means no gas carried in from earlier. So you reach i with the same or less.' },
      { label: 'So all of them fail', text: 'None of those stops can get past i. The next start worth trying is i + 1.' },
      { label: 'Enough gas in all', text: 'If total gas covers total cost, the last start works. Its leftover covers the part you skipped.' },
    ] },
    { t: 'code', caption: '`sum` adds up a list. That check catches a trip that no start can finish. Then one walk is enough.',
      code: py`
        def best_start(gas, cost):
            if sum(gas) < sum(cost):
                return None
            start = 0
            tank = 0
            for i in range(len(gas)):
                tank = tank + gas[i] - cost[i]
                if tank < 0:
                    start = i + 1
                    tank = 0
            return start

        print(best_start([1, 5, 2, 4], [3, 2, 4, 1]))
        print(best_start([2, 2], [3, 3]))
        print(best_start([0, 0, 9], [3, 3, 3]))
        print(best_start([3], [3]))
      `,
      output: '1\nNone\n2\n0',
    },
    { t: 'cost', title: 'How fast is it?', items: [
      { op: 'Stones with reach', cost: 'O(n)', why: 'One look at each stone.' },
      { op: 'Cookies', cost: 'O(n log n)', why: 'Sorting both rows is the big part. The walk after it is O(n).' },
      { op: 'Gas: try every start', cost: 'O(n^2)', why: 'n starts, and each can drive past n stations.' },
      { op: 'Gas: one walk', cost: 'O(n)', why: 'You counted one look per station.' },
    ] },
    { t: 'tip', title: 'How to spot these', text: 'Look for these words: **can you reach**, **as many as you can**, **which start works**. Ask what one number you can carry along. Then look for a swap or skip reason. If you cannot find one, do not trust the rule.' },
    { t: 'q', id: 'match-reason', type: 'match', level: 2,
      q: 'Match each problem to its reason.',
      pairs: [
        ['Stones', 'A long leap can also stop short'],
        ['Cookies', 'Swap cookies, and everyone is still fed'],
        ['Gas', 'Stops between start and the dry spot fail too'],
      ],
      explain: 'Each greedy rule here comes with a reason. The reason is what makes it safe to trust.',
      hints: ['Which problem has a tank?', 'Which problem has leaps?'],
    },
  ],
  recap: [
    'You can track reach to see if a row of stones can be crossed.',
    'You can match small with small and say why that is safe.',
    'You can find a gas start in one walk.',
  ],
  practice: [
    { id: 'why-reach', type: 'mcq', level: 1,
      q: 'Why can `can_cross` trust every stone up to `reach`?',
      options: [
        'A long leap can also stop short',
        { text: 'All the stones hold big numbers', why: 'The numbers can be anything, even 0. The reason is about leaping shorter.' },
        { text: 'The stones are sorted', why: 'Nothing here is sorted. This greedy rule needs no sort at all.' },
      ],
      answer: 0,
      explain: 'If you can leap 4, you can also leap 1, 2 or 3. So every stone up to the farthest one is in range.',
      hints: ['Does a stone with 4 on it force a leap of 4?'],
    },
    { id: 'predict-cross', type: 'predict', level: 1,
      q: 'Type what the screen will show.',
      code: py`
        def can_cross(stones):
            reach = 0
            for i in range(len(stones)):
                if i > reach:
                    return False
                reach = max(reach, i + stones[i])
            return True

        print(can_cross([1, 0, 2]))
      `,
      answer: 'False',
      why: 'Stone 0 gives reach 1. Stone 1 holds 0, so reach stays 1. Then i is 2, which is past reach.',
      explain: 'reach goes to 1 and stays there. Stone 2 is past it, so the answer is False.',
      hints: ['Write down reach at each stone.', 'Is 2 > 1?'],
    },
    { id: 'gas-skip', type: 'mcq', level: 2,
      q: 'You started at station 2 and ran dry at station 5. Which station should you try next?',
      options: [
        { text: 'Station 3', why: 'You may think one step on is the safe choice. But station 3 reaches 5 with the same gas or less, so it fails too.' },
        'Station 6',
        { text: 'Station 0', why: 'Stations before 2 already failed. That is why the walk moved on to 2.' },
      ],
      answer: 1,
      explain: 'Every stop from 2 to 5 fails at 5 or sooner. So the next start worth trying is 6.',
      hints: ['What does the code set `start` to?'],
    },
    { id: 'fix-cookies', type: 'fix', level: 2,
      q: '`fed_kids([1], [1, 2])` crashes after the only kid is fed. Fix the check.',
      code: py`
        def fed_kids(kids, cookies):
            kids = sorted(kids)
            cookies = sorted(cookies)
            k = 0
            for cookie in cookies:
                if cookie >= kids[k]:
                    k = k + 1
            return k
      `,
      answer: py`
        def fed_kids(kids, cookies):
            kids = sorted(kids)
            cookies = sorted(cookies)
            k = 0
            for cookie in cookies:
                if k < len(kids) and cookie >= kids[k]:
                    k = k + 1
            return k
      `,
      tests: [
        { label: 'More cookies than kids', call: 'fed_kids([1], [1, 2])', want: '1' },
        { label: 'No kids', call: 'fed_kids([], [3])', want: '0' },
        { label: 'No cookies', call: 'fed_kids([3], [])', want: '0' },
        { label: 'A mixed case', call: 'fed_kids([4, 1], [2, 5, 1])', want: '2' },
      ],
      explain: 'Once every kid is fed, `k` equals `len(kids)`, and `kids[k]` is past the end. So check `k` first.',
      hints: ['What is `k` after the last kid is fed?', 'Python checks the left side of `and` first.'],
    },
    { id: 'write-cross', type: 'write', level: 2,
      q: 'Write `farthest(stones)`. It gives back the biggest index you can reach from stone 0. Stop walking if a stone is past your reach.',
      starter: py`
        def farthest(stones):
            # Your code here.
            return -1
      `,
      answer: py`
        def farthest(stones):
            reach = 0
            for i in range(len(stones)):
                if i > reach:
                    return reach
                reach = max(reach, i + stones[i])
            return min(reach, len(stones) - 1)
      `,
      tests: [
        { label: 'Stuck at stone 1', call: 'farthest([1, 0, 2])', want: '1' },
        { label: 'All the way', call: 'farthest([2, 1, 3, 0, 1])', want: '4' },
        { label: 'Not past the end', call: 'farthest([9, 1])', want: '1' },
        { label: 'One stone', call: 'farthest([0])', want: '0' },
      ],
      explain: 'This is the reach loop with a new answer. `min` keeps the index inside the list.',
      hints: ['Start from the `can_cross` loop.', 'What should you hand back when `i > reach`?', 'A big number can push reach past the last stone.'],
    },
    { id: 'order-gas', type: 'order', level: 2,
      q: 'Put the lines in order to find the start station.',
      lines: [
        'def walk(gas, cost):',
        '    start, tank = 0, 0',
        '    for i in range(len(gas)):',
        '        tank = tank + gas[i] - cost[i]',
        '        if tank < 0:',
        '            start, tank = i + 1, 0',
        '    return start',
        'print(walk([1, 4, 2], [2, 1, 3]))',
      ],
      extra: ['            start, tank = 0, 0'],
      output: '1',
      explain: 'Station 0 runs dry, so start moves to 1. From there, the tank stays at 0 or more.',
      hints: ['What must exist before the loop?', 'The tank resets when it drops below 0.'],
    },
    { id: 'fewest-leaps', type: 'write', level: 3,
      q: 'Stretch: write `fewest_leaps(stones)`. You can always get across. Give back the fewest leaps from stone 0 to the last stone.',
      starter: py`
        def fewest_leaps(stones):
            # Your code here.
            return -1
      `,
      answer: py`
        def fewest_leaps(stones):
            leaps = 0
            edge = 0
            far = 0
            for i in range(len(stones) - 1):
                far = max(far, i + stones[i])
                if i == edge:
                    leaps = leaps + 1
                    edge = far
            return leaps
      `,
      tests: [
        { label: 'Leap 1, then leap 2', call: 'fewest_leaps([2, 3, 0, 1])', want: '2' },
        { label: 'One big leap', call: 'fewest_leaps([4, 1, 1, 1, 1])', want: '1' },
        { label: 'One step at a time', call: 'fewest_leaps([1, 1, 1])', want: '2' },
        { label: 'Already there', call: 'fewest_leaps([5])', want: '0' },
      ],
      explain: 'Think in rings. `edge` is the end of what this leap can reach. When `i` gets there, you must leap, and `far` is the best new edge.',
      hints: ['Keep 2 numbers: the end of this leap, and the farthest seen so far.', 'When `i` reaches the end of this leap, you must leap again.', 'Stop the loop before the last stone.'],
    },
  ],
});
