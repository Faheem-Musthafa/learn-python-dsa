# Writing a Stepwise lesson

Read this before writing any content. It is the contract between writers and the app.

## Files

- `content/<module-id>.js`: one module and its lessons. Example: `content/m03-loops.js`.
- `content/viz/<module-id>.js`: that module's moving pictures (visuals). Prefix every visual name with the module id, for example `m03-loop-trace`.
- Run `node tools/build-manifest.mjs` after adding a file. Run `node tools/check.mjs --only m03` to check one module. Fix every ERROR. Fix WARNINGS unless you have a reason not to.
- Read `assets/js/viz.js` (the Scene API) before writing any visual. Read `docs/research/02-pedagogy.md` sections 2 to 5 for the lesson template and the writing rules.

## Module

```js
Course.module({
  id: 'm03-loops',          // same id as the file name
  num: 3, part: 1, level: 'B',
  title: 'Loops',
  blurb: 'Make the computer repeat steps, without writing them again.',
  needs: ['m02-decisions'], // soft note only. Nothing is locked.
});
```

Parts: `1` Learn Python. `2` First data structures and algorithms. `3` Trees, graphs and clever ideas. `4` Advanced.

## Lesson

```js
Course.lesson('m03-loops', {
  id: '3-1-while-loops',   // lower-case letters, digits, hyphens. Unique in the whole course.
  num: '3.1',
  title: 'While loops: repeat until done',
  goal: 'You can make a loop that repeats until a rule says stop.',   // one sentence, testable
  mins: 12,
  steps: [ /* blocks, below */ ],
  recap: [ 'You can write a while loop.', 'You can say when a loop stops.', 'You can find a loop that never ends.' ],
  practice: [ /* questions, below */ ],
});
```

## Blocks (the `steps` array, in reading order)

| `t` | Fields | Use it for |
|---|---|---|
| `h` | `text` | A section heading, as a question or a plain goal. |
| `p` | `text` | A paragraph. At most 3 sentences. |
| `list` | `items`, `ordered` | Steps the reader follows. |
| `words` | `items: [{word, means, say}]` | New terms, at most 3 per lesson. Put it before the first use. |
| `analogy` | `title`, `text` | The everyday picture. Say where it stops being true. |
| `big` | `text` | The one big idea of the lesson. Use at most once per lesson. |
| `tip` | `title`, `text` | Something useful to know. |
| `trap` | `think`, `real`, `code` | A common mistake and what really happens. |
| `steps` | `title`, `noun`, `items: [{label, text, code}]` | A worked example in named steps. The page numbers them. See "Worked examples" below. |
| `table` | `caption`, `head`, `rows` | Small tables. |
| `cost` | `title`, `items: [{op, cost, why}]` | "How fast is it?" cards. |
| `code` | `code`, `output`, `stdin`, `caption`, `run`, `error`, `timeout` | Python the reader can run. `run: false` shows it read-only. `error: true` means it must fail. |
| `viz` | `name`, `params`, `caption`, `auto` | A moving picture. `name` is a registered visual. |
| `q` | a question (see below) | A question inside the lesson. Give it an `id`. |

Text marks: `` `code` `` for code, `**bold**`, and `[[term]]` or `[[shown words|term]]` for a word that links to the word list. Every `[[term]]` must exist in the word list (`content/glossary.js` or a `words` block).

Code in files: write it with the `py` tag so indentation stays correct:

```js
code: py`
  total = 0
  for n in range(3):
      total = total + n
  print(total)
`,
```

### Worked examples (`steps`)

Write only the words in `label`. The page adds the number and the word "Step" by itself, so the numbers always match the order.

```js
{ t: 'steps', title: 'Make a dict and use it', items: [
  { label: 'Make it', text: '...', code: '...' },     // shows as "Step 1: Make it"
  { label: 'Look up', text: '...' },                  // shows as "Step 2: Look up"
] }
```

Never start a label with "Step 1:", "Move 1:" or similar. `check.mjs` reports that as an error. If the items are not steps in order, set `noun` on the block: `noun: 'Recipe'` shows "Recipe 1: Sum".

## Questions

Every question has `id` (unique in the lesson), `type`, `level` (1 Warm-up, 2 Core, 3 Stretch), `q` (the question in plain words), `explain` (why the answer is right, 1 to 2 sentences), and `hints` (an array of 1 to 3 clues, from gentle to clear).

| `type` | Fields | Notes |
|---|---|---|
| `mcq` | `options: [{text, why}]` or strings, `answer` (index) | `why` explains the mistake behind each wrong option. Every wrong option needs one. |
| `predict` | `code`, `options` (strings, as for `mcq`) **or** `answer` (typed output), `explain`, `why` | The learner guesses the output, then presses Run. The real output must equal the answer. Use `expectError: true` when the code should fail. |
| `order` | `lines` (in the right order), `extra` (wrong lines to mix in), `output`, `explain` | Parsons problem. Lines keep their indentation. |
| `fill` | `code` with `____` gaps, `blanks` (one answer per gap, or an array of accepted answers), `output`, `explain`, `why` | |
| `write` | `starter`, `answer` (a correct solution), `tests`, `wantOutput`, `stdin`, `explain` | Auto-checked. Each test is `{label, call, want}` (expression compared with `want`) or `{label, check}` (a true/false expression). |
| `fix` | `code` (buggy program), `answer` (fixed program), `tests`, `wantOutput`, `explain` | The buggy code must fail its tests. The answer must pass them. |
| `trace` | `code`, `head`, `rows`, `given` (how many rows are filled in), `verify` (Python that prints the rows), `explain` | A table of values, line by line. Cell values have no spaces. |
| `match` | `pairs: [[left, right], ...]`, `explain` | 3 to 5 pairs. |

Wrong answers must match a real mistake from the misconception list in `docs/research/02-pedagogy.md` section 6. Name the mistake in the `why`.

## Visuals (moving pictures)

```js
Viz.register('m03-loop-count', {
  title: 'A loop counts up',
  size: [560, 230],                     // your drawing space. The stage fits itself to what you draw.
  code: 'n = 0\nwhile n < 3:\n    print(n)\n    n = n + 1',
  inputs: [                              // optional. The learner can change these.
    { key: 'limit', label: 'Stop before', type: 'number', value: 3, min: 1, max: 6 },
  ],
  build(s, p) {
    s.box('n', 120, 110, 0, { w: 60, h: 60 });
    s.text('lbl', 120, 60, 'n', { size: 16 });
    s.snap('n starts at 0.', { line: 1, vars: { n: 0 } });
    // ... one change per snap ...
  },
});
```

Scene API (from `assets/js/viz.js`): `box`, `circle`, `text`, `glyph`, `bar`, `pointer`, `area`, `edge`, `row`, `layoutTree`, `set`, `get`, `del`, `tone` (`default`, `active`, `ok`, `bad`, `warn`, `accent`, `muted`), `swap`, `pulse`, `cue`, `clearTones`, `snap`.

Rules for visuals:

- **One change per frame.** A frame is one step the reader can follow.
- Each frame's `say` is one short sentence (under 20 words). Keep narration in the present tense.
- `line` is the 1-based line of `code` that runs in this frame. `vars` shows the current values. `out` is the text on screen so far.
- At least one `ask` every 3 to 5 frames, before the decisive step: `ask: {q, options, answer, why}`. `answer` is the index of the correct option. `why` explains it.
- Use at most 35 frames. Keep the data small: 4 to 6 items, depth 3 at most, `n` at most 5.
- Put the input in `inputs` when the learner should change it (a list, a number). Build with `build(s, p)` and read `p.key`.
- Never rely on colour alone. Use a label, a shape or a position as well.
- **The stage fits itself.** The player works out the box around every item in every frame of a build and shows just that, with a small margin. So content fills the stage and does not jump between frames. Do not pad a scene with far-away labels: a label at the far edge makes everything else smaller. Keep labels close to what they name. `check.mjs` warns if the content is over 620 units wide.
- **Text must fit its box.** A value in a `box` or `circle` uses a code font at size 19, so each letter takes about 11.4 units. A box holds `(w - 4) / 11.4` letters: `w: 52` holds 4, `w: 100` holds 8, `w: 264` holds 22. Make the box wider, or set `size` (at `size: 14`, each letter takes 8.4). `check.mjs` reports text that does not fit as an error.
- **Leave room around labels.** On a phone the stage shrinks, but labels stop shrinking at 10 pixels. A scene 560 units wide on a 320 pixel screen draws a 13-size label at about size 18. So leave about 40% spare width beside small labels in wide scenes, and 18 units of height for each line of them.
- Put area labels clear of the items inside the area. The label sits in the top-left corner, so start items about 30 units below the top of the area.
- **How things look.** A value in a `box`, `circle` or `bar` is a solid tile on a dark stage, and its tone sets its colour and a second cue (lift, a check, a cross, a ring, or a dashed outline). A large empty `box` with things placed on it (70 units or wider, and something centred on it) draws as a dark tray, so the labels on it stay readable. A `text` placed on a bright tile takes the tile's text colour by itself. A `pointer` is a coloured tag. An `area` is a dark well, so use one for any place that holds things (a queue, a pile, a sorted part).
- **Motion is worked out from your frames.** You do not ask for it. A tone that becomes `active` gets a ring, and a compare link if exactly one other item is `active` or `warn`. Two items trading places arc past each other. An item that moves far arcs and lands. A row sliding together stays plain. A new shape whose text matches a lit shape flies out of it, and a removed shape whose text matches a newly lit one flies into it. A tone that becomes `ok` gets a ring, `muted` sinks, `bad` shakes. A lit edge gets a dot running towards what is new. On the last step, 2 or more `ok` items get one wave. All of this is skipped when the learner jumps, and for No movement and reduced motion.
- **Use `s.cue` only when the change alone cannot show the meaning.** Call it before `snap`, and it applies to that frame: `s.cue('compare', a, b)`, `s.cue('carry', from, to, text)` (a value travels to where it is used), `s.cue('discard', ids)`, `s.cue('found', id)`, `s.cue('wave', ids)`, `s.cue('quiet')` (no motion effects on this step). A cue changes only how a step moves, never what it shows. `check.mjs` reports a cue that names an item not in the frame.
- A `number` input must have `min` and `max`. The page holds typed values inside them.
- With fixed `code` and no `inputs`, the last `out` must equal what the code really prints. `check.mjs` warns if it does not.

## Writing rules (10-year-old reading level)

- Average sentence: 10 words. No sentence over 16 words.
- At most 150 words before the first picture, code or question.
- One idea per sentence. Active voice. Present tense. Talk to "you".
- Teach the word before the technical name. Put the plain meaning first in the word box.
- No "simply", "just", "easy", "obviously", "trivial", "clearly", "basically". No em dashes.
- Warm, short feedback. Never say "wrong!" or "you made an error". Say "Python got confused on line 4" instead.

## Lesson shape (about 12 minutes)

1. Remember: retrieval comes from the warm-up (automatic), so start with the goal.
2. A question or picture that gets the learner guessing.
3. One worked example with named steps and an animation.
4. Word box (at most 3 new terms).
5. Predict the output, then run it.
6. Parsons or fill-in, then a bug to fix.
7. Modify something, then write 1 to 3 lines yourself.
8. A trap box (a common mistake).
9. Recap: 3 can-do points.

Targets per lesson: at least 1 moving picture, at least 2 runnable code blocks, at least 3 questions inside the lesson, 5 to 7 practice questions (at least 1 write or fix, at least 1 Stretch).

## Checking

```
node tools/build-manifest.mjs
node tools/check.mjs --only m03
```

`node tools/check.mjs --pyodide` runs the same checks in Pyodide, which is the Python 3.13 that learners really get. `node tools/check.mjs --compare` lists any program whose result differs between Pyodide and your local Python.

The check runs every Python program in your lessons, so every output and answer is true. A lesson is done when `check.mjs --only` shows no errors for its module. Its warnings should be gone, or you should say why they stay.

## Rules learned from reviewing Part II

The checker cannot catch these. A reviewer found each one in real lessons.

- **Check hidden costs in your own code against your Big-O claim.** `out = out + [x]` in a loop is O(n^2), even when the lesson says O(n). Slices held by waiting recursive calls use O(n^2) memory. Measure when unsure.
- **Test any claim like "stays below n" at larger n**, not only on the tiny example.
- **Deep recursion can crash Python in the browser.** `@cache` or `lru_cache` recursion over about 300 deep crashes and restarts Python rather than raising `RecursionError`. Keep those examples under 300 deep, or use a dict or a loop. Never promise a clean `RecursionError` from a cached function.
- **Use the right word for cost.** Say "amortized" for list `append`, as lesson 8.4 defines it. Say "on average" for dict and set.
- **Use only Python taught earlier.** Lessons so far use `len(x) == 0`, not `if not x`, and do not use `del`. If a lesson needs something new, teach it there.
- **O(2^n) means doubling.** Lesson 8.3 teaches it that way. If real growth differs, as with Fibonacci at about 1.6 times per step, say so.
- **String hashes change when Python starts, not on each Run.** Python stays alive until the page reloads.
- **Lesson numbers changed.** Quickselect is lesson 17.3. Binary search pitfalls are in 10.5. Read and write pointers are in 13.4. Check the real lesson before you cite it.
- **Watch lesson length.** Three lessons had to be split because they ran past 20 minutes. Count frames as well as words.

## Rules learned from reviewing Part I

- **Keep the name-tag model everywhere.** Lesson 1.2 teaches that a variable is a name tag on a value. Never write that a variable "holds" or "stores" a value, or that a value "goes into" a name. Say "x is a name tag on 3", or "x now names 3". The same goes for parameters and attributes, and for pictures: draw a tag with an arrow, not a value inside a box with the variable's name on it. A list spot, a dict entry and a node's value box may hold things, because those are containers.
- **Python features must be taught before they are used.** `%`, `//`, `*` and `nums[i] = x` are now taught in lessons 1.2 and 5.1. A feature you need that no earlier lesson teaches must be taught in your lesson.
- **`/` always gives a float.** `6 / 2` is `3.0`. Say so, and do not write "gives 3".
- **Make `write` checks hard to pass by accident.** Test more than one input, and include edge cases such as 0 and empty.
- **Set and string-hash order changes when the page reloads**, not on each Run. Sort before printing.

## Rules learned from reviewing Part III

- **Search the whole course for a feature's first use** before you claim to teach it, or before you use it untaught. Example: `grep -l "reversed(" content/*.js`.
- **Check every branch of templated narration**, not only the default input. A sentence like "the other child went up" is wrong when there is 1 child.
- **State the answer format in every `trace` question.** Cells need an exact match, so tell the learner to write `[6,8]`, `empty` or `3.0`.
- **Make "how to spot it" tables match the code shown.** Do not promise what the lesson's code does not do.
- **Test what a `write` question asks for.** If it says "leave the board as it was", add a test for that.
