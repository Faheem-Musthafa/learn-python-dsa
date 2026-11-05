# 01 - Curriculum Brief: Python + DSA, zero to advanced

Audience: total beginners, wording for a 10-year-old. Researched 2026-11-05 from the sources in section 7 (all pages were fetched and read this session, not recalled). Python docs checked were 3.15.2; local interpreter check was 3.14.7.

**How to use this file:** section 1 is the order to build in. Section 3 is what each writer needs per lesson (analogy, trap, Python tool). Section 4 is the only Big-O truth the course may state. Section 5 has the practice bank.

**Level legend:** B = Beginner, I = Intermediate, A = Advanced. A lesson marked (opt) is optional/bonus; the course is 28 modules, 108 lessons, 100 core.

---

## 1. Recommended syllabus (28 modules, 108 lessons)

### Part I - Python first (modules 1-7, all B). Nothing in DSA starts until module 7 is done.

| # | Module | Lvl | Prereq | Lessons |
|---|---|---|---|---|
| 1 | Hello, Code | B | none | 1.1 What is code? What is an algorithm (a recipe)? 1.2 Your first program: print, variables, types (int, float, str, bool) 1.3 Talking to the computer: input(), f-strings, converting types |
| 2 | Making Decisions | B | 1 | 2.1 True/False and comparing (==, <, !=) 2.2 if / elif / else with and, or, not |
| 3 | Loops | B | 2 | 3.1 while loops 3.2 for loops and range() 3.3 break, continue, nested loops, loop recipes (sum, count, biggest) 3.4 Tracing code by hand with a table (the skill DSA needs most) |
| 4 | Functions, Errors, Tests | B | 3 | 4.1 def, parameters, return 4.2 Scope, and functions calling functions (first picture of the call stack) 4.3 Reading an error message and debugging with print 4.4 try/except and assert (tiny tests) |
| 5 | Lists, Tuples, Strings | B | 4 | 5.1 Lists: index, negative index, slicing, append/pop/insert 5.2 Mutation and aliasing: `b = a` is not a copy 5.3 Tuples, unpacking, swapping `a, b = b, a` 5.4 Strings as read-only sequences; split/join; 2D lists, list comprehensions, sorted(key=) |
| 6 | Dicts and Sets | B | 5 | 6.1 dict: key to value, get, in, looping 6.2 set: no duplicates, union/intersection 6.3 Counting with dict, Counter, defaultdict; what "hashable" means (preview) |
| 7 | Classes and Objects | B | 4, 5 | 7.1 class, object, `__init__`, self 7.2 Methods, `__repr__`, `__len__`, `__eq__`, `__lt__` 7.3 Objects that point at other objects (Node with `.next`, `None`) - the whole reason this module exists before linked lists |

### Part II - Foundations of DSA (modules 8-17)

| # | Module | Lvl | Prereq | Lessons |
|---|---|---|---|---|
| 8 | How Fast Is It? (Big-O) | B | 3, 4 | 8.1 Count steps, not seconds 8.2 O(1), O(n), O(n^2) from loops 8.3 O(log n) (halving) and O(n log n) 8.4 Drop constants; best/worst/average; "amortized" in one sentence 8.5 Space: how much memory |
| 9 | Arrays and Python Lists | B | 5, 8 | 9.1 Memory as a row of numbered lockers; Python list = resizable array 9.2 What is slow: insert/pop at front, slicing copies, `x in list` 9.3 Matrices (2D arrays) and in-place edits (reverse, rotate, remove duplicates) |
| 10 | Searching | B/I | 3, 8, 9 | 10.1 Linear search vs the "guess the number" idea 10.2 Writing binary search without off-by-one bugs 10.3 bisect_left / bisect_right, first/last position, insertion point 10.4 Binary search on the answer (I) |
| 11 | Hash Tables | I | 6, 8, 10 | 11.1 Hash function and collisions (chaining vs probing, in plain words) 11.2 How dict/set work in CPython; why O(1) is "average" 11.3 (opt) Build a tiny HashMap class 11.4 Lookup patterns: Two Sum, duplicates, anagrams, group-by |
| 12 | Elementary Sorting | B/I | 9, 8 | 12.1 Selection sort and bubble sort 12.2 Insertion sort (and why it is fast on nearly-sorted data) 12.3 Python's sorted(), list.sort(), key=, reverse=, stability |
| 13 | Array Patterns | I | 9, 10, 12 | 13.1 Two pointers (opposite ends; same direction) 13.2 Sliding window (fixed, then variable size) 13.3 Prefix sums |
| 14 | Linked Lists | I | 7 | 14.1 Why linked lists exist; Node and LinkedList classes 14.2 Traverse, insert, delete 14.3 Reverse a list; dummy node trick 14.4 (opt) Fast/slow pointers (middle, cycle), doubly linked lists, list vs linked list in Python |
| 15 | Stacks and Queues | I | 9, 14 | 15.1 Stack (LIFO) with a list: push/pop 15.2 Queue (FIFO), why list.pop(0) is a trap, collections.deque 15.3 Classic uses: matching brackets, undo, simulate a line 15.4 Monotonic stack (next bigger number) (I+) |
| 16 | Recursion | I | 4, 15 | 16.1 A function that calls itself: base case + smaller problem 16.2 The call stack in pictures; RecursionError and Python's limit 16.3 Recursion on lists, strings, numbers (sum, reverse, power, palindrome) 16.4 Repeated work (Fibonacci) and memoization with a dict or `functools.cache` |
| 17 | Faster Sorting + Divide and Conquer | I | 12, 16 | 17.1 Divide and conquer; merge sort 17.2 Quicksort, partitioning, quickselect (k-th smallest) 17.3 Why n log n is the floor for comparing sorts; counting sort breaks the rule 17.4 (opt) What Python really uses: Timsort |

### Part III - Core structures and algorithms (modules 18-22)

| # | Module | Lvl | Prereq | Lessons |
|---|---|---|---|---|
| 18 | Trees and Binary Search Trees | I | 7, 15, 16 | 18.1 Trees in real life; words: root, leaf, parent, child, height 18.2 DFS traversals: preorder, inorder, postorder (recursive) 18.3 BFS / level order with deque 18.4 Tree recursion patterns: height, count, mirror, same-tree, lowest common ancestor 18.5 Binary Search Tree: the rule, search, insert 18.6 (opt) BST delete, inorder = sorted, why trees go lopsided, balanced trees (AVL idea only, no code) |
| 19 | Backtracking | I | 16, 18 | 19.1 Decision tree of choices; template choose / explore / un-choose 19.2 Subsets and permutations 19.3 Combination sum, skipping duplicates, pruning 19.4 Grid search: word search, N-Queens (I+) |
| 20 | Heaps and Priority Queues | I | 9, 18 | 20.1 Priority queue idea; heap = tree stored in a list (parent/child index math) 20.2 heapq: heappush, heappop, heapify; max-heap trick 20.3 Top-k, merge k sorted lists, two heaps for running median 20.4 (opt) Heapsort |
| 21 | Graphs | I | 6, 15, 16, 18 | 21.1 Graphs in life (friends, maps, game levels); nodes, edges, directed, weighted; adjacency list vs matrix 21.2 BFS: layers and shortest path in steps 21.3 DFS: go deep, mark visited 21.4 Grids are graphs (islands, flood fill, rotten oranges) 21.5 Connected components and cycle detection 21.6 Topological sort (course prerequisites) |
| 22 | Greedy and Intervals | I | 12, 20 | 22.1 Greedy idea; when greedy works and when it lies (coin example) 22.2 Sort-then-sweep: merge intervals, meeting rooms, activity selection 22.3 (opt) Greedy classics: jump game, gas station, assign cookies |

### Part IV - Advanced (modules 23-28)

| # | Module | Lvl | Prereq | Lessons |
|---|---|---|---|---|
| 23 | Union-Find and Spanning Trees | A | 12, 20, 21 | 23.1 Disjoint sets: "are these two in the same group?" find + union 23.2 Path compression and union by size (why it becomes almost O(1)) 23.3 Kruskal's minimum spanning tree 23.4 Prim's minimum spanning tree with heapq |
| 24 | Shortest Paths | A | 20, 21 | 24.1 Weighted graphs; why BFS stops working; Dijkstra's idea (cheapest-first) 24.2 Dijkstra with heapq (skip stale entries); grid with costs 24.3 (opt) Negative edges: Bellman-Ford; all-pairs: Floyd-Warshall (idea only) |
| 25 | Dynamic Programming I | A | 16, 22 | 25.1 Overlapping subproblems: Fibonacci again 25.2 Top-down (memoization) 25.3 Bottom-up (table) 1D: climbing stairs, house robber 25.4 Coin change (where greedy failed) and longest increasing subsequence 25.5 The DP recipe: state, transition, base case, order |
| 26 | Dynamic Programming II | A | 25 | 26.1 Grid DP (unique paths, min path sum) 26.2 0/1 knapsack and unbounded knapsack 26.3 Longest common subsequence and edit distance 26.4 (opt) Space saving (rolling row), partition/subset-sum |
| 27 | Tries, Fenwick Trees, Segment Trees | A | 6, 13, 18 | 27.1 Trie: autocomplete tree (dict-of-dicts) 27.2 Trie problems: prefix count, word search II, replace words 27.3 Range queries: why prefix sums break on updates; Fenwick (BIT) tree 27.4 Segment tree: build, query, point update; (opt) lazy propagation |
| 28 | Capstone and Toolbox | A | all | 28.1 A repeatable problem-solving method (examples, brute force, improve, test) 28.2 Pattern picker flowchart: "which structure/pattern fits?" 28.3 Bits and math: XOR tricks, gcd, sieve of primes, modulo 28.4 Capstone project (maze solver, route finder, or autocomplete) |

**Count check:** 23 lessons in Part I + 85 in Parts II-IV = 108. Optional (opt): 11.3, 14.4, 17.4, 18.6, 20.4, 22.3, 24.3, 26.4 = 8, so 100 core. Module 27 may be split into "Tries" and "Range queries" (29 modules) if writers prefer.

**Not taught on purpose** (all appear in sources, all out of scope for a first course): B-trees/2-3 trees/skip lists/ISAM/suffix trees (roadmap.sh "complex"), red-black code, max-flow, NP-hardness (Erickson), k-nearest neighbors / Bloom filters (Grokking). Mention in 28.4 "where next".

**Python needed before each DSA module (checklist for writers):**

| DSA module | Must already know |
|---|---|
| 9, 10 | indexing, slicing, loops, functions |
| 11 | dict, set, hashable (6.3) |
| 14 | classes, `None`, attribute access (7.3) |
| 15 | list methods, `collections.deque` import |
| 16 | functions + call stack picture (4.2) |
| 18-19 | classes (Node), recursion |
| 20 | tuples compare element by element (5.3), `import heapq` |
| 21 | dict of lists, deque, set for visited |
| 25 | `functools.cache` / dict memo, 2D lists |
| 27 | dict of dicts, classes |

---

## 2. Where the sources disagree, and what we chose

| Question | What sources do | Our choice and why |
|---|---|---|
| Python vs C first | CS50x teaches C then Python; CS50P and MIT 6.006 (prereq: Python) assume Python | Python only, CS50P order (functions, conditionals, loops, exceptions, tests, classes). One language lowers load for a 10-year-old. |
| Programming before DSA? | roadmap.sh DSA starts with syntax, control structures, functions, OOP basics; MIT warns strongly against starting 6.006 without Python; Erickson's book says it is not a first course | Full 7-module Python block first. Classes come before linked lists, not earlier. |
| When to teach Big-O | Hello Algo: before every data structure. MIT: lecture 1. roadmap.sh: after basic structures. Princeton: after stacks/queues. | Right after Python, before arrays, but only "count steps" (module 8). Formal Omega/Theta skipped; Hello Algo's best/worst/average framing is used. |
| Searching vs sorting first | Grokking: binary search, then selection sort. Hello Algo: searching, then sorting. Princeton and MIT: sorting early | Binary search first. It needs only the word "sorted" and motivates sorting. |
| Where hash tables go | NeetCode: with arrays, first. Grokking: ch.5. Hello Algo: after stacks/queues. MIT: after sorting. | After searching, before sorting (module 11). Two Sum with a dict is the first big speed-up "aha". |
| Elementary vs fast sorts | roadmap.sh lists six sorts in a row. Princeton: elementary, then merge, quick, then priority queues | Princeton order. Heapsort moved to after heaps (opt). |
| Recursion position | Grokking: ch.3, early. roadmap.sh: listed late under techniques. Hello Algo: inside complexity chapter. Erickson: first topic | After stacks/queues, because the call stack is a stack. Before merge sort and trees, which need it. |
| Linked list vs stack/queue first | NeetCode: stack first, linked list later. Hello Algo: arrays and linked lists, then stacks and queues. Princeton: stacks first | Linked lists first (Hello Algo): the Node idea makes "queue with list is slow, deque is the fix" easy to explain. |
| Two pointers / sliding window | NeetCode: right after arrays and hashing. roadmap.sh: last, under techniques | After sorting (module 13): two pointers on sorted data needs sorting; fast/slow reuses the idea in linked lists. |
| Trees vs heaps order | Hello Algo, MIT, NeetCode: trees then heaps | Same. A heap is a tree stored in a list. |
| Tries | NeetCode: right after trees. Princeton: strings chapter. roadmap.sh: "advanced data structures" | Advanced (module 27), as the brief requested. Content is easy; it can be pulled forward later. |
| Backtracking vs graphs | NeetCode: backtracking before graphs. Hello Algo: graphs early, backtracking late. Erickson: recursion, backtracking, DP, greedy, then graphs | After trees, before graphs (NeetCode). It is DFS on a decision tree. |
| Greedy vs DP order | Hello Algo and Erickson: DP then greedy. NeetCode: DP, intervals, greedy. MIT: DP last | Greedy first (module 22), then DP. Kids see greedy fail on coin change, then DP fixes it. |
| Union-Find placement | Princeton Part I: week 1 case study. NeetCode/roadmap.sh: advanced | Advanced, paired with MST so it has a purpose (Kruskal). |
| Shortest paths vs DP | MIT: Dijkstra before DP. NeetCode: graphs, 1D DP, then Advanced Graphs later | Dijkstra (24) before DP (25-26), as MIT. Fits "graph block, then DP block". |
| Balanced trees (AVL, red-black, B-tree) | roadmap.sh, MIT, Princeton, Hello Algo all cover | Concept only, optional lesson 18.6. Python has no built-in balanced tree; no beginner needs the rotations in code. |
| Python time-complexity source | Python Wiki "TimeComplexity" | The wiki page now says it moved. Use docs.python.org/3/builtins/time-complexity.html. |

---

## 3. Per topic: misconceptions, 10-year-old analogy, Python tool

| Topic | Common beginner misconceptions | Everyday analogy | Python tool |
|---|---|---|---|
| Algorithm | "It means math/computers only" | A recipe or LEGO instructions | functions |
| Variables | "A variable is the value itself"; `x = x + 1` looks like a false equation | A labeled box (really a name tag stuck on a value) | assignment |
| Loops / tracing | Off-by-one: `range(5)` ends at 4; loop var survives after loop | Walking up stairs, counting steps; trace table = a scoreboard | for, while, range |
| Functions / call stack | print vs return confusion; locals vanish after the call | A kitchen helper handed a note, returns a plate | def, return |
| Mutation / aliasing | `b = a` copies the list; `[[0]*3]*3` makes 3 independent rows | Two name tags on the same dog; a photo copy is a true copy | `list.copy()`, `copy.deepcopy`, slicing |
| Class / Node | `self` is a keyword; forgetting `None` as "end"; confusing class vs object | Class = cookie cutter, object = cookie | class, `__init__` |
| Big-O | "O(n) means exactly n seconds"; ignores input size; thinks smaller constant always wins; confuses worst vs average | How many pages you flip in a phone book as the book grows | a stopwatch demo with `time.perf_counter` |
| Array / list | "Lists are linked lists"; insert at the front is free | Row of numbered lockers: jump straight to #50, but shifting everyone to make room is work | list; CPython list = resizable array of references |
| Linked list | Thinks it is faster than a list for everything; losing the head when rewriting `.next` | Treasure hunt: each clue tells where the next clue is | own Node class (no built-in) |
| Binary search | Works on unsorted data; `mid` overflow worry (not in Python); infinite loop from `lo = mid` | "Guess my number 1-100": always guess the middle | `bisect.bisect_left/right`, `key=` (3.10+) |
| Hash table / dict | "It keeps things in sorted order" (it keeps insertion order); "always O(1)"; lists can be keys | Coat check: ticket number goes straight to a hook | dict, set |
| Hash collision | "Collisions are errors/crashes" | Two kids with the same birthday share a table, still found | handled inside dict automatically |
| Selection/bubble/insertion sort | Bubble sort is "the good one"; sorting = only for numbers | Sort a hand of cards one at a time (insertion) | `sorted()`, `list.sort()` |
| Python sort | `sort()` returns the new list (it returns `None`); sort is not stable | Sort by grade, then ties stay in line order | `sorted(x, key=..., reverse=...)`; Timsort, stable |
| Merge sort | Merging is "free"; mixes up the split step and the merge step | Two sorted piles of cards combined from the top | recursion + list slicing (note slicing copies) |
| Quicksort | Pivot must be the middle; worst case never happens | Pick one kid, everyone shorter left, taller right | write own; teach quickselect |
| Stack | Mixes up top/bottom; thinks Python has a `Stack` class | Pile of plates, or the browser Back button | list: `append`, `pop` |
| Queue | Uses `list.pop(0)` and thinks it is fine | Line at the school canteen | `collections.deque`: `append`, `popleft` |
| Recursion | "It is magic"; no base case; thinks each call shares one set of variables | Russian dolls; looking up a word that needs another word | functions; `sys.getrecursionlimit()` (1000 default on the 3.14 check) |
| Memoization | "It changes the answer" | Writing answers on a sticky note so you never recompute | dict, `functools.cache` |
| Binary tree | Confuses tree with binary search tree; "left < right always" | Family tree, folder tree | own TreeNode class |
| Tree traversal | Mixes up pre/in/post; BFS vs DFS data structure (queue vs stack) | DFS: explore a cave to the end first. BFS: ripple rings in a pond | recursion; `deque` for BFS |
| BST | "BST is always O(log n)"; sorted insertion builds a straight line | 20 Questions: each answer rules out half | own class (no built-in tree); `sortedcontainers` is third-party, do not require |
| Heap / priority queue | "Heap is a sorted list"; `heap[1]` is second smallest; Python heap is a max-heap | ER triage: sickest first, not first come | `heapq` (min-heap, `heap[0]` smallest); max via negative numbers |
| Graph | A tree is not a graph; forgetting `visited` causes infinite loops; undirected edge needs two entries | Friend map, road map, subway map | dict of lists; `defaultdict(list)` |
| BFS | "BFS finds shortest path in any graph" (only unweighted) | Ripples; "friends of friends" | deque + visited set |
| DFS | Cycles ignored; stack depth ignored | A maze with chalk marks on the wall | recursion or list as stack |
| Topological sort | Thinks it works on graphs with cycles | Getting dressed: socks before shoes | in-degree count + deque |
| Backtracking | Confuses with brute force; forgets to undo the choice (un-choose) | Maze: reach a dead end, walk back to last fork | recursion + list `append/pop` |
| Greedy | "Greedy is always right" | Taking the biggest candy each time | `sorted`, `heapq` |
| Union-Find | Unions the elements, not their roots; thinks path compression changes answers | Clubs: ask the club captain, merge by captains | list of parents |
| Dijkstra | Works with negative weights; confuses with BFS; "first time seen = final" | Cheapest route on a bus map, finalizing nearest stops first | `heapq` with (dist, node) |
| Dynamic programming | "It is just recursion"; hard to see state; fear | Memoization plus a table; build up from small to big | dict/list tables, `functools.cache` |
| Trie | Thinks it is just a set of words | Autocomplete: typing each letter narrows the choices | dict of dicts |
| Fenwick/segment tree | Why not prefix sum? (updates) | Scoreboard in a tournament: winners of pairs, then pairs of pairs | list-based arrays |

**Rules for analogies:** keep one analogy per topic and reuse it for the whole module; always show the failure case (where the analogy stops being true).

---

## 4. Verified Big-O and CPython facts

**Source of truth:** Python docs "Time complexity of operations on built-in types" (the old Python Wiki TimeComplexity page redirects here), plus pages named per row. "Checked" means the stated cost appears on that page. Costs are for CPython and exact built-in types (the page says subclasses may differ).

### list (CPython: dynamic array of references; design FAQ confirms it is a contiguous array, not a linked list)

| Operation | Cost | Status |
|---|---|---|
| `l[k]` get / set | O(1) | Checked |
| `l.append(x)` | O(1) (page footnote [1]: amortized) | Checked; footnote text not in my extract, "amortized" is classic wiki wording and design FAQ says extra space is preallocated |
| `l.pop()` (last) | O(1) | Derived from page: pop(k) costs O(n-k), so k = n-1 is O(1) |
| `l.pop(k)` | O(n - k); `pop(0)` is O(n) | Checked; deque docs also say list `pop(0)` and `insert(0, v)` cost O(n) memory movement |
| `l.insert(k, x)` | O(n - k) | Checked |
| `del l[k]` | O(n - k) | Checked |
| `x in l`, `min`, `max` | O(n) | Checked |
| `len(l)` | O(1) | Checked |
| slice `l[i:j]` | O(j - i) (copies) | Checked |
| `l.copy()`, concatenate `l1 + l2` | O(n), O(len1 + len2) | Checked |
| `l.extend(t)` | O(len(t)) | Checked |
| `l.sort()` | O(n log n) | Checked |
| iteration | O(n) | Checked |

### dict / set (hash tables; average case, assuming good hashing)

| Operation | Cost | Status |
|---|---|---|
| `key in d`, `d[key]`, `d.get`, set, delete | O(1) average; worst case O(n) if every key hashes the same | Checked (page states the worst case) |
| `d.copy()`, iteration | O(n) | Checked |
| `x in s`, `s.add`, `s.remove/discard` | O(1) average | Checked |
| `s1 | s2` | O(len1 + len2) | Checked |
| `s1 & s2` | O(min(len1, len2)) | Checked |
| `s1 - s2` | O(len(s1)) | Checked |
| keys must be hashable; set elements too | - | Checked (stdtypes: set elements must be hashable; design FAQ: mutable keys would break lookup) |
| dict keeps insertion order | - | Checked locally on 3.14.7 (`{'b':1,'a':2}` lists b, a). Not re-quoted from docs this session. |
| keys can't be lists, can be tuples of immutables | - | Teach with hash/mutability reasoning (design FAQ) |

### str, tuple, range

| Operation | Cost | Status |
|---|---|---|
| `s[k]` | O(1) | Checked |
| `s + t` | O(len s + len t) | Checked |
| `x in s`, `s.find(x)` | O(n) in the docs' words | Checked |
| `tuple(t)` copy | O(1) (returns same object) | Checked |
| `x in range(...)`, `r[k]` | O(1) | Checked (range computes items on demand) |

### collections.deque

| Operation | Cost | Status |
|---|---|---|
| `append`, `appendleft`, `pop`, `popleft` | O(1) at either end ("approximately the same O(1) performance in either direction") | Checked |
| `d[0]`, `d[-1]` | O(1) | Checked ("O(1) at both ends") |
| `d[i]` in the middle | O(n) | Checked ("slows to O(n) in the middle") |
| `maxlen` | bounded deque; old items fall off | Checked |
| local timing | 2000 insert-front + pop-front pairs on 200,000 items: list 0.39 s vs deque 0.0002 s | Measured on this machine, 3.14.7 (use as a classroom demo, not a docs claim) |

### heapq (min-heap)

| Operation | Cost | Status |
|---|---|---|
| `heap[0]` is the smallest; heap stored in a list; indexes start at 0, children of k are 2k+1 and 2k+2 | O(1) | Checked |
| `heapify(x)` | O(n) | Docs say "linear time" for `heapify_max`; same for `heapify` (standard) |
| `heappush`, `heappop` | O(log n) | Standard theory, docs page silent in my extract |
| `heappushpop`, `heapreplace` | faster than push then pop | Checked |
| `nlargest(n, it)`, `nsmallest` | like `sorted(it)[:n]`; best for small n; for large n use `sorted()`; for n=1 use `min/max` | Checked (cost O(N log n) is standard theory, not stated) |
| `merge(*sorted_iterables)` | lazy iterator over sorted output | Checked |
| max-heap | `heapify_max`, `heappush_max`, `heappop_max`, `heappushpop_max`, `heapreplace_max` exist; docs say `heappush_max` etc. were added in 3.14 (confirmed present on 3.14.7) | Checked. **Teach negation (push `-x`) as the main method**, mention `*_max` as "newer Pythons" because the in-browser runtime may be older than 3.14 (verify the runtime version). |
| priority-queue tie-breaker | store `(priority, count, task)`, because tuples with equal priority compare the task next and may fail | Checked (docs "Priority Queue Implementation Notes") |

### bisect

| Operation | Cost | Status |
|---|---|---|
| `bisect_left`, `bisect_right`/`bisect` | O(log n) search on a sorted list | Checked (docs say O(log n) search) |
| `bisect_left` splits as `< x` left, `>= x` right; `bisect_right` as `<= x` left, `> x` right | - | Checked; locally `[1,2,2,3]`, x=2 gives 1 and 3 |
| `insort` | O(n) overall (search is O(log n), list insert is O(n)) | Checked, docs say this explicitly |
| `key=` parameter | added in 3.10; key function applies to list items, not to `x` in bisect functions | Checked |
| docs advice | bisection suits ranges; for a single exact value use a dict | Checked |

### sorting and other CPython facts

| Fact | Status |
|---|---|
| `sorted()` / `list.sort()` are stable; "Timsort" is the algorithm; it exploits existing order | Checked (Sorting Techniques HOWTO) |
| `list.sort()` is in-place and returns `None` | Checked locally (docstring on 3.14.7) |
| Sort is O(n log n) worst case | Checked (time-complexity page) |
| Timsort is O(n) on already-sorted input | Standard fact; docs only say it uses existing order. Mention softly. |
| Default recursion limit 1000 | Checked locally: `sys.getrecursionlimit()` returned 1000 on 3.14.7; docs describe `setrecursionlimit` and warn about crashes when set too high |
| Python ints are unlimited in size, but `int(str)` has a default 4300-digit limit | Checked (stdtypes error text shows 4300) |
| Hash randomization: string hashes differ per run ("per-process seed") | Checked (design FAQ) |

### Big-O growth words to teach (Hello Algo list): O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n), O(n!). Best case = lower bound, worst = upper bound; worst case is the one to rely on; average case is hard to derive.

### Course-level "cost card" (printable, one per module)
Array access O(1) | list append O(1) amortized | list insert/pop front O(n) | `in list` O(n) | `in set/dict` O(1) avg | sort O(n log n) | binary search O(log n) | heap push/pop O(log n) | BFS/DFS O(V+E) (Tech Interview Handbook) | Dijkstra with heap O((V+E) log V) (standard) | union-find ~O(1) amortized (standard).

---

## 5. Patterns and practice problems

### 5a. The 18 classic patterns (each gets a "How to recognize it" box)

| # | Pattern | Taught in | Cue words in a problem |
|---|---|---|---|
| 1 | Hash map / frequency counting | 6, 11 | "count", "duplicate", "pair that adds to", "anagram" |
| 2 | Two pointers | 13 | sorted array, "pair", "palindrome", "in place" |
| 3 | Fast and slow pointers | 14 | cycle, middle of list |
| 4 | Sliding window | 13 | "longest/shortest subarray/substring with ..." |
| 5 | Prefix sum | 13 | many range-sum questions |
| 6 | Binary search (and on the answer) | 10 | sorted, "minimum value that works" |
| 7 | Stack / monotonic stack | 15 | brackets, "next greater", undo |
| 8 | Queue / BFS (levels, shortest path in steps) | 15, 18, 21 | "minimum moves", "level by level" |
| 9 | DFS / tree recursion | 16, 18, 21 | "all paths", "depth", "islands" |
| 10 | Backtracking | 19 | "all combinations / permutations / arrangements" |
| 11 | Heap: top-k, k-way merge, two heaps | 20 | "k largest", "median", "merge k lists" |
| 12 | Merge intervals / sort then sweep | 22 | overlapping ranges, meetings |
| 13 | Greedy | 22 | "maximum number of ...", exchange argument |
| 14 | Topological sort | 21 | "prerequisites", "order of tasks" |
| 15 | Union-Find | 23 | "same group", "connect", "redundant edge" |
| 16 | Shortest path (Dijkstra) | 24 | weights/costs, "cheapest route" |
| 17 | Dynamic programming (1D, 2D, knapsack, strings) | 25, 26 | "number of ways", "minimum/maximum cost", overlapping choices |
| 18 | Trie / prefix tree | 27 | many words, "starts with" |

Extras to mention only as names: cyclic sort and k-th element (listed on the roadmap.sh LeetCode-patterns panel), divide and conquer, bit tricks (XOR), A* (module 28 "where next"). The Tech Interview Handbook array guide adds: traverse from the right, precomputation, index-as-hash-key, sort first.

### 5b. Practice problems (3-5 per module; ideas only, write original wording and original data)

| Module | Problem ideas |
|---|---|
| 1 | Print a name banner; swap two variables; convert minutes to hours+minutes; simple tip calculator |
| 2 | Even or odd; leap year; grade letter from score; rock-paper-scissors winner |
| 3 | Multiplication table; sum 1..n; count vowels; FizzBuzz; guess-the-number game |
| 4 | Area of shapes function; is_prime; safe divide with try/except; write 3 asserts for a function; fix a broken program |
| 5 | Reverse a list without reverse(); second largest; rotate a list; is a word a palindrome; transpose a small matrix |
| 6 | Word counter; first non-repeating letter; unique items between two lists; phone book lookup |
| 7 | Pet class; BankAccount with deposit/withdraw; Point class with `__eq__`; Student list sorted by `__lt__` |
| 8 | Count steps of three small loops; rank 5 code snippets by growth; time `x in list` vs `x in set` |
| 9 | Remove duplicates in place; move zeros to end; rotate array; matrix spiral order; merge two sorted lists |
| 10 | Guess-the-number bot (binary); first bad version; search insertion position; square root (integer) by binary search; minimum speed to finish tasks (on the answer) |
| 11 | Two Sum; contains duplicate; valid anagram; group anagrams; first unique character |
| 12 | Sort by hand-tracing 6 numbers; implement selection and insertion sort; sort students by grade then name; check is-sorted |
| 13 | Pair with target sum in sorted array; remove duplicates from sorted array; max sum of k consecutive; longest substring without repeats; range sum query with prefix sums |
| 14 | Reverse a linked list; middle node; detect a cycle; merge two sorted lists; remove nth from end |
| 15 | Valid brackets; reverse a string with a stack; implement queue with two stacks; daily temperatures (next warmer day); recent-calls counter |
| 16 | Factorial; power; sum of digits; reverse a string; fibonacci with memo |
| 17 | Implement merge sort; implement quicksort; k-th largest with quickselect; count inversions; sort colors (3 values) |
| 18 | Max depth; invert tree; same tree; level order; validate BST; lowest common ancestor (BST) |
| 19 | All subsets; all permutations; combination sum; letter combos of a phone keypad; N-Queens (4x4); word search in a grid |
| 20 | Kth largest element; top-k frequent words; merge k sorted lists; running median; last stone weight |
| 21 | Number of islands; rotten oranges / flood fill; clone graph; course schedule (cycle + topo order); shortest path in a maze (BFS) |
| 22 | Merge intervals; meeting rooms (min rooms); non-overlapping intervals; jump game; assign cookies |
| 23 | Number of provinces; redundant connection; accounts merge; build a minimum spanning tree (Kruskal) on 6 towns; connecting all points cheaply (Prim) |
| 24 | Network delay time; cheapest path in a weighted grid; cheapest flights with a stop limit (hint at Bellman-Ford); shortest route on a small city map |
| 25 | Climbing stairs; house robber; min cost climbing stairs; coin change; longest increasing subsequence |
| 26 | Unique paths (with obstacles); min path sum; 0/1 knapsack; longest common subsequence; edit distance |
| 27 | Implement Trie; autocomplete top-3; replace words; word search II; Fenwick range-sum with updates; segment tree range-min |
| 28 | Mixed set: 1 problem per pattern, identified by cue words first, coded second; project ideas listed in 28.4 |

**Also adopt NeetCode's "implement it yourself" list as the lab for each structure:** dynamic array, singly linked list, deque, BST, hash table, heap, graph, disjoint set, segment tree, insertion/merge/quick sort, matrix DFS/BFS, Dijkstra, Prim, Kruskal, topological sort, 0/1 and unbounded knapsack (all listed on its Core Skills page).

**Lesson format for every DSA lesson (suggested, derived from Tech Interview Handbook's per-topic study guide):** overview, picture/animation, Python tool, Big-O card, things to watch out for, corner cases (empty input, 1 or 2 items, duplicates, disconnected graph, cycles), then 3-5 problems.

---

## 6. Source-by-source takeaways (what each one told us)

| Source | What was read | Takeaway used |
|---|---|---|
| roadmap.sh DSA | full node list | Order: pick a language, fundamentals (syntax, control, functions, OOP, pseudocode), basic structures (array, linked list, stack, queue, hash), complexity (Big-O, Theta, Omega), sorting, search, trees (traversal, BST, AVL, B-tree), graphs (BFS/DFS, Dijkstra, Bellman-Ford, MST), advanced (trie, segment tree, Fenwick, disjoint set, suffix trees), techniques (brute force, backtracking, greedy, divide and conquer, recursion, DP, two pointers, sliding window); practice patterns panel |
| roadmap.sh Python | node list | Python basics order: syntax, types, conditionals, casting, exceptions, functions, lists, tuples, sets, dicts, loops, then arrays/linked lists, heaps/stacks/queues, hashmaps, BST, recursion, sorting, then modules, lambdas, OOP, list comprehensions |
| NeetCode roadmap + Core Skills | 18 categories and implement-it list | Category order: Arrays and Hashing, Two Pointers, Binary Search, Stack, Sliding Window, Linked List, Trees, Tries, Heap, Backtracking, Graphs, 1D DP, Intervals, Greedy, Advanced Graphs, Math and Geometry, 2D DP, Bit Manipulation (NeetCode 150 counts: 28 easy, 101 medium, 21 hard) |
| Hello Algo | home + full chapter list + time-complexity page | Order: intro, complexity, data structure basics, arrays/linked lists, stacks/queues, hashing, trees, heaps, graphs, searching, sorting, divide and conquer, backtracking, DP, greedy. Animated, "run code in your browser" model matches our product. Licensed CC BY-NC-SA, so we may use as inspiration but not copy |
| Grokking Algorithms | O'Reilly brief TOC | Chapters: intro (binary search, Big-O), selection sort, recursion, quicksort, hash tables, BFS, Dijkstra, greedy, DP, k-nearest neighbors, where next. Proof that a picture-first, analogy-first, Python-based course works for beginners |
| MIT 6.006 (2020) | syllabus + calendar | Order: intro, data structures, sorting, hashing, linear sorting, binary trees, AVL, heaps, BFS, DFS, weighted shortest paths, Bellman-Ford, Dijkstra, Johnson, DP x4, complexity. Prereq: Python and discrete math, so we need our own Python and math-light block |
| Princeton Algorithms (book + Coursera Part I) | algs4 home, Part I syllabus | Part I: union-find, analysis, stacks/queues, elementary sorts, mergesort, quicksort, priority queues, symbol tables, BST, balanced trees, hash tables. Book also: graphs, MST, shortest paths, strings, tries, B-trees |
| CS50P / CS50x | CS50P home + weeks, CS50x syllabus | CS50P order: functions and variables, conditionals, loops, exceptions, libraries, unit tests, file I/O, regex, OOP. Weekly shorts + problem sets + final project workflow is the model. CS50x weeks page could not be extracted; only its syllabus (C, Python, SQL, web; problem sets + final project) was read |
| Tech Interview Handbook | study-cheatsheet, array, graph pages | Priority list (High: array, string, sorting/searching, matrix, tree, graph; Mid: hash, recursion, linked list, queue, stack, heap, trie, interval; Low: DP, binary, math, geometry). We deliberately teach DP and graphs fully because this course is a learning course, not interview cramming. Gives per-topic template: complexity card, watch-outs, corner cases, techniques |
| Python docs / wiki | time-complexity, collections, heapq, bisect, sorting HOWTO, design FAQ, stdtypes, sys | All of section 4 |
| Erickson, Algorithms (extra) | book page | Not a first course: assumes stacks, queues, hash tables are known. Confirms recursion, backtracking, DP, greedy, then graph algorithms as a good advanced order; includes disjoint sets note. License CC BY 4.0 |

---

## 7. Sources (URLs, all fetched 2026-11-05)

1. roadmap.sh DSA roadmap - https://roadmap.sh/datastructures-and-algorithms
2. roadmap.sh Python roadmap - https://roadmap.sh/python
3. NeetCode roadmap - https://neetcode.io/roadmap ; Core Skills practice - https://neetcode.io/practice?tab=neetcode150
4. Hello Algo (home, English) - https://www.hello-algo.com/en/ ; full chapters - https://www.hello-algo.com/en/chapter_hello_algo/ ; time complexity - https://www.hello-algo.com/en/chapter_computational_complexity/time_complexity/
5. Grokking Algorithms TOC - https://www.oreilly.com/library/view/grokking-algorithms/9781617292231/OEBPS/Text/kindle_split_002.html ; publisher page - https://www.manning.com/books/grokking-algorithms
6. MIT 6.006 Spring 2020 syllabus - https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/syllabus/ ; calendar - https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/calendar/
7. Princeton Algorithms 4th ed. - https://algs4.cs.princeton.edu/home/ ; Coursera Part I - https://www.coursera.org/learn/algorithms-part1
8. CS50P - https://cs50.harvard.edu/python/ ; weeks - https://cs50.harvard.edu/python/weeks/ ; CS50x syllabus - https://cs50.harvard.edu/x/syllabus/
9. Tech Interview Handbook - https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/ ; array - https://www.techinterviewhandbook.org/algorithms/array/ ; graph - https://www.techinterviewhandbook.org/algorithms/graph/
10. Python Wiki TimeComplexity (moved) - https://wiki.python.org/moin/TimeComplexity ; current page - https://docs.python.org/3/builtins/time-complexity.html
11. collections (deque, defaultdict) - https://docs.python.org/3/library/collections.html
12. heapq - https://docs.python.org/3/library/heapq.html
13. bisect - https://docs.python.org/3/library/bisect.html
14. Sorting Techniques HOWTO - https://docs.python.org/3/howto/sorting.html
15. Design and History FAQ (list and dict implementation) - https://docs.python.org/3/faq/design.html
16. Built-in types (set hashability, int string limit) - https://docs.python.org/3/library/stdtypes.html
17. sys (recursion limit) - https://docs.python.org/3/library/sys.html
18. Jeff Erickson, Algorithms - https://jeffe.cs.illinois.edu/teaching/algorithms/

**Gaps and cautions for the team**
- Time-complexity page footnote texts (amortized, etc.) were not visible in my extract; wording above for `append` relies on the page marker plus the design FAQ.
- Heap push/pop O(log n), Dijkstra, union-find costs are standard theory; the Python docs pages do not state them.
- Docs checked are 3.15.2; features marked 3.10 (`bisect key=`) and 3.14 (`*_max` heap functions) need a runtime check before any lesson uses them.
- Dict insertion order, `list.sort()` returning `None` and recursion limit 1000 were confirmed by running Python 3.14.7 locally, not by quoting the docs.
- Hello Algo is CC BY-NC-SA; Erickson's book is CC BY 4.0; do not copy text or figures from either without checking license terms. This brief paraphrases everything.
