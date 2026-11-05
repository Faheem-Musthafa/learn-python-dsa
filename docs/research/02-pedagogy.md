# 02 - Pedagogy Research: Rules for Lesson Writers

Course: free web Python + DSA, zero to advanced, 10-year-old reading level, local-only (no accounts, no backend).
Status key for sources: **[F]** = abstract/page fetched this session. **[K]** = cited from my knowledge, URL not fetched; check before quoting numbers.

Bottom line (read this if nothing else):
1. Watching an animation teaches little. **What the learner does with it** matters more than what it shows (Hundhausen 2002 [F]).
2. Order of a lesson: retrieve -> worked example -> predict -> small practice (Parsons/fill-in/fix) -> write one tiny program -> schedule review.
3. Every wrong answer in every question must map to a named misconception, and feedback must explain *why*, not just "wrong".
4. Plain words first, technical word second, same technical word forever after. Technical words are taught, never hidden.
5. Motivation = competence + choice + visible mastery. No loss-aversion streaks, hearts, or leaderboards.

---

## 1. The evidence in brief

Strength: **Strong** = many studies/meta-analyses, replicated. **Moderate** = several good studies, or strong in other subjects but thinner for programming/children. **Weak** = few studies, small samples, or mostly teacher reports. **Mixed** = results conflict.

| Technique | What the evidence says | Strength | Source |
|---|---|---|---|
| Algorithm animation (passive watching) | In 24 experiments, results were mixed. Biggest finding: *how* students use a visualization has more impact than *what* it shows. Pure watching shows no reliable gain. | Strong (that passive = weak); Moderate (why) | Hundhausen, Douglas, Stasko 2002 |
| Engagement taxonomy | Levels: no viewing, viewing, responding (answer questions), changing (alter input/params), constructing (build own), presenting (explain to others). Learning gains cluster at *responding and above*. Taxonomy is theory-driven; later studies mostly support it, with caveats. | Moderate | Naps et al. 2002; Myller et al. 2009 |
| Worked examples | Novices learn more from studying solved examples than from solving the same problems (the worked-example effect). Decades of evidence, mostly maths/science; supported in programming. | Strong | Sweller & Cooper 1985; Renkl 2014 |
| Expertise reversal | The same scaffolds *hurt* once the learner knows the material. So scaffolds must fade. | Strong | Kalyuga et al. 2003 |
| Subgoal labels | Naming the *purpose* of each step group ("get the input", "check each item") improved novice problem solving and transfer in several studies. A later 3-field study found the effect varied, so not guaranteed. | Moderate / Mixed | Margulieux & Catrambone 2016; Margulieux et al. 2018 |
| Parsons problems (drag mixed-up lines into order) | Same learning gain as writing or fixing code, in significantly less time, lower load, retention equal after 1 week. Studies are mostly teens/adults; few with children ~10. | Moderate | Ericson, Margulieux, Rick 2017; Ericson et al. 2022 review |
| Adaptive Parsons (get easier after failing) | Same learning in less time, fewer give-ups. | Weak-Moderate | Ericson dissertation 2018 |
| PRIMM (Predict, Run, Investigate, Modify, Make) | Teachers report better understanding and talk; quasi-experimental classroom data are positive. No large randomized trials. Good *structure*, not proven *magic*. | Weak-Moderate | Sentance, Waite, Kallia 2019 |
| Read/trace before write | Students who cannot trace code rarely write it well; tracing skill predicts writing. Mostly correlational, so causation is not proven; teaching tracing explicitly is still low-risk. | Moderate (correlational) | Lister et al. 2004; Lopez et al. 2008 |
| Notional machine (an explicit model of what the computer does) | Many novice errors come from a wrong picture of what runs and where values live. Sorva argues the model should be an explicit learning goal. Direct tests of which picture is best are thin. | Moderate (theory + reviews) | Sorva 2013 |
| Retrieval practice (testing yourself) | Beats rereading across ages and subjects. Meta-analysis effect about g = 0.5. Mostly facts; less proven for code-writing. | Strong | Dunlosky 2013; Rowland 2014 |
| Spaced practice | Spreading practice over days beats cramming. Best gap grows with how long you want to remember, but exact schedules are not settled. | Strong (spacing); Weak (exact intervals) | Cepeda 2006, 2008; Dunlosky 2013 |
| Interleaving (mixing topics) | Helps discrimination between problem types, but Dunlosky rated it "low" for lack of evidence in real classrooms. Use lightly in review only. | Weak-Moderate | Dunlosky 2013 |
| Productive failure (try before being taught) | Meta-analysis of 166 comparisons: overall benefit around g = 0.36 for conceptual understanding, mostly maths/science, teens. Little evidence for 10-year-olds or for programming. Risk: frustration. | Moderate for older learners; Weak for this audience | Sinha & Kapur 2021 |
| Immediate, elaborated feedback | Explaining *why* beats "right/wrong" or "try again", especially for novices. Timing: immediate is better for hard tasks and novices; delay can suit easy tasks. Too-long feedback is ignored. | Moderate | Shute 2008 |
| Segmenting animations (learner-paced chunks) | Learner-paced short segments beat one continuous animation, strongest for novices and fast/complex material; includes elementary-school children. Reverses for experts. | Moderate | Mayer & Fiorella 2014; Hasler, Kersten, Sweller 2007 |
| Full learner control of animation | Novices do not always choose well. Control of *pace* helps; wide-open control is mixed. | Mixed | Hasler et al. 2007; Mayer & Fiorella 2014 |
| Cognitive load theory (one new idea at a time, remove clutter) | Well-supported theory with many experiments; underlies the three rows above. | Strong (theory) | Sweller et al. 2011 |
| Plain language (short sentences, active voice) | Federal guidance: average 15-20 words. Readability formulas (Flesch-Kincaid) are rough: they punish long words, not hard ideas. Our 10-year-old limits below are *design choices*, not research constants. | Moderate (practice); Weak (exact numbers) | OPM / plainlanguage.gov |
| Dyslexia-friendly layout | Left-aligned text, 1.5 line spacing, 12-14pt+, extra letter spacing help. Extra-large letter spacing improved dyslexic children's reading in a controlled study. "Dyslexia fonts" (e.g. OpenDyslexic) have little reliable evidence. | Moderate (spacing); Weak (special fonts) | BDA style guide; Zorzi et al. 2012; Wery & Diliberto 2017 |
| Extrinsic rewards (points, badges) | Across 128 studies, expected tangible rewards reduced later free-choice interest (d about -0.2 to -0.4); effect larger in children. Verbal positive feedback *raised* interest (d about +0.3). | Strong | Deci, Koestner, Ryan 1999 |
| Streaks / gamification | Gamification overall: small, inconsistent positive effects. Streaks specifically: no good causal studies on children. Duolingo studies describe "gamification misuse" (grinding easy lessons to save a streak). Treat as unproven and risky. | Weak / Mixed | Mogavi et al. 2022 (secondary); Hamari et al. 2014 [K] |
| Self-Determination Theory | Motivation lasts when people feel competent, have choice, and feel connected. Broad support, mostly self-report. | Moderate | Ryan & Deci 2000 |

**Honest gaps**: almost nothing was tested on ~10-year-olds learning Python *and* algorithms from a free self-paced site with no teacher. Most evidence is from teens/university students or from teacher-led classrooms. Where we apply it to children, that is inference. We therefore (a) keep tasks short, (b) log nothing remotely, and (c) tell the team to treat these rules as hypotheses to test with 5-10 real kids.

---

## 2. Recommended LESSON TEMPLATE

Target: one concept per lesson, **10-15 minutes**, 8-11 interactive items, **max 3 new technical terms**, max ~150 words of reading before the first interaction.

| # | Section | What goes in it | Why (evidence) |
|---|---|---|---|
| 0 | **Goal line** | One sentence: "After this lesson you can ____." Kid wording, a verb you can test. | Cognitive load: tells learner what to attend to |
| 1 | **Warm-up (Remember)** | 2-3 questions from *earlier* lessons (due items first, see section 7). No new info. No timer. | Retrieval + spacing (Strong) |
| 2 | **Spark** | A tiny puzzle or picture question using the new idea. "What do you think happens?" Wrong guesses are normal, shown no penalty. Max 1 minute. | Mild productive failure / prediction; keep short because PF is weak for this age |
| 3 | **Worked example** | ONE complete example, narrated step by step in an animation (section 4). Steps grouped under 2-4 **subgoal labels** ("Step 1: Make a name", "Step 2: Put a value in it"). Code left, "memory" picture right, output below. | Worked-example effect; subgoal labels; notional machine |
| 4 | **Word box** | 1-3 new terms: plain meaning, then the word, then how to say it. Real term used from here on. | Section 5 |
| 5 | **Predict-Run-Look (PRIMM P-R-I)** | Show new short code. Learner picks the output. Then presses Run. Then 1 "Investigate" question: "Which line made this happen?" | PRIMM; reading/tracing before writing |
| 6 | **Build it (guided)** | Parsons problem OR fill-in-the-blank. Same shape as the worked example, new surface story. | Parsons efficiency; completion problems fade scaffolds |
| 7 | **Spot the bug** | Short wrong program; learner finds and fixes the line. The bug is *the lesson's misconception*. | Misconception confrontation (Sorva; Qian & Lehman) |
| 8 | **Try it (Modify, then Make)** | Change one thing in working code and predict first. Then write 1-3 lines from scratch (the only "write" item). | PRIMM M-M |
| 9 | **Trap box** | "Many people think ____. Here is what really happens." One picture + one sentence. Placed *after* they have met the idea, and *also* triggered by wrong answers. | Refutation of misconception |
| 10 | **Recap** | 3 bullet points, max 10 words each, plus "Say it in your own words" with 3 sentence options (one correct, two plausible). | Self-explanation; retrieval |
| 11 | **Schedule** | Silent: add the lesson's skills to the review queue (section 7). Show "You will see this again in 2 days". | Spacing |

### Rules for the template
- **Fade scaffolds across a unit.** Lesson 1 of a topic: full worked example + Parsons. Lesson 3: example shorter, fill-in replaced by "write it". Final lesson: only a problem. Offer a "Hide hints" toggle (expertise reversal).
- **One idea, one lesson.** If a section needs "and also", split the lesson.
- **Same example skeleton across a unit.** Change the story (cats, pizzas) but keep the code shape, so learners see the pattern, not the surface.
- **Concrete first, then abstract.** Show `age = 10` with a picture before "a variable stores a value".
- **Real code, real errors.** Show the actual Python error message once, and translate it ("IndexError means: that spot does not exist").
- **No dead ends.** Every question has a hint ladder (section 3). Never block progress forever; after 3 tries show the answer and queue a fresh version later.
- **Time box.** If a lesson will exceed 15 minutes, split it.
- **DSA lessons add a "Race" step** after the worked example: learner counts steps by hand for tiny input (n = 4) before Big-O words appear.

### Lesson-writer checklist (paste into every lesson PR)
- [ ] Goal line is testable. [ ] <= 3 new terms, each in Word box. [ ] Worked example has subgoal labels.
- [ ] >= 2 predict questions before any write task. [ ] Every wrong option maps to a listed misconception.
- [ ] Feedback explains why, <= 2 sentences + optional "Show me" animation. [ ] Reading level checked (section 5).
- [ ] Trap box matches a misconception in section 6. [ ] Review items tagged with skill IDs.

---

## 3. PRACTICE QUESTION TYPES

### Which type, when, how many (per 10-15 minute lesson)

| Type | Use it when | Per lesson | Avoid when |
|---|---|---|---|
| **Remember (retrieval)** | Start of every lesson; any review | 2-3 | Never skip |
| **Predict the output** | First contact with any new syntax or behavior; always *before* running | 2-3 | Never skip |
| **Trace table** (fill variable values line by line) | Loops, conditions, recursion, any state change | 1 | Lesson 1 (too heavy) |
| **Parsons** (drag lines; 1D first, indentation later; 0-2 distractors) | Learning order/structure of a pattern (loop shape, if/else, function) | 1-2 | When the learner has no pattern yet (show example first) |
| **Fill in the blank** (completion) | Bridge between worked example and writing | 1 | Late in a unit (scaffold too heavy) |
| **Fix the bug** | After the idea is known; target one misconception | 1 | Before they can read the code |
| **Match / sort** (term <-> meaning, input <-> output) | Vocabulary, Big-O names | 0-1 | As the only practice |
| **Write code** (1-5 lines, auto-checked by tests) | End of lesson, later in unit | 1 | First lesson on a topic (do Modify first) |
| **Order the steps of an algorithm** (Parsons for pictures/pseudocode) | DSA lessons | 1 | Before they saw one run |
| **Explain** (pick the best sentence) | Recap | 1 | Free text (no teacher to grade it) |

Target mix: ~30% predict/trace, ~25% Parsons/fill-in, ~15% fix-bug, ~15% remember, ~10% write, ~5% match.

### Parsons rules
- 3-7 lines for ages 10+. Max 1 distractor in first 5 Parsons, max 2 later; distractors are *misconception lines* (`if x = 5:`), not random noise.
- Provide indentation as a second step only after plain ordering is solved.
- Show the program's goal in words and the expected output above the blocks.
- Give "Check" with line-level feedback: highlight the *first* wrong line, not the whole thing.
- If stuck after 2 checks: "Show one correct line".

### Writing good wrong answers (distractors)
1. Every distractor = one named misconception (section 6) or one realistic slip. Tag it in the question file: `distractor: {text, misconception: "M11-off-by-one"}`.
2. All options similar length and style; no "none of the above"; no "all of the above".
3. Include the output a misconception *predicts* (e.g. printing 1 2 3 4 5 for `range(5)` printing 0 1 2 3 4).
4. 3 options for ages 10 (max 4). Randomize order. Never make the correct answer the longest.
5. No trick wording. If a question needs reading twice to parse, simplify the question.
6. In code-output questions, use small numbers and short names (`a`, `count`, `score`).

### Feedback rules (Shute 2008: explain, keep short, nudge)
- **Correct:** "Yes. `range(5)` starts at 0 and stops *before* 5." (1 sentence explaining *why*; do not just say "Great job!")
- **Wrong, first try:** do not reveal the answer. Give a **hint**: point at the place. "Look at line 3. What is `x` right after it runs?"
- **Wrong, second try:** name the likely thought and fix it. "You may have thought `=` asks a question. In Python, `=` *puts a value in a name*. `==` asks."
- **After 3 tries:** show the answer with the step animation, say "Let us try a new one", and queue a *different* version for review.
- Each distractor has its own pre-written feedback line. Generic "Incorrect" is banned.
- Feedback max 2 sentences, grade 4 reading, includes the technical word once.
- Tone: about the code, not the person. Banned: "Wrong!", "Easy!", "Just", "Obviously", "Silly". Preferred: "Not yet", "Close", "Python does this instead".
- Immediate for new material; for review (spaced) items, show result right after the answer but let the learner try again once before showing the explanation.
- **No lives, no hearts, no point loss for wrong answers.** Wrong answers feed the review queue instead.

### Auto-grading code
- Test by behavior (outputs for several inputs), never exact text match of code.
- Show *which test* failed with input and expected/got: "With n = 3 you printed 6, expected 9."
- Run in-browser (Pyodide or similar) so no backend is needed. Time limit 2 seconds; infinite-loop message in plain words.

---

## 4. HOW ANIMATIONS MUST BEHAVE (teach, not entertain)

Basis: Hundhausen 2002 (use matters), Naps 2002 (engage at responding+), Mayer segmenting/signaling, Hasler 2007 (children, learner-paced segments), Sorva 2013 (notional machine).

### Required controls
- **Step Next / Step Back / Reset** always visible. **Back is mandatory** (re-reading a step is how learners recover from overload).
- Auto-play is **optional**, off by default, with Pause and 3 speeds. It must pause at every prediction point.
- Keyboard: Right/Left arrows, Space. Touch: big (44px+) buttons.
- **Never** a non-stoppable intro, auto-advancing carousel, or sound-only information.
- Respect `prefers-reduced-motion`: swap motion for instant state changes with a highlight.

### Predict before reveal
- At least **one prediction per 3-5 steps**, and always before the first decisive step (swap, comparison result, loop exit, return value).
- Prompt: "What will happen next?" with 2-3 choices, or "Click the box that changes".
- Wrong guess: do **not** punish. Show the real step, then one sentence: "Python did X because Y."
- Learner can skip predictions after first completion (expertise reversal).

### Segment length
- One step = **one change** (one value moves, one comparison, one line runs).
- A segment = **4-7 steps**, ending with a pause and a checkpoint ("Ready?" or a mini question). No continuous run longer than ~10 seconds.
- Overall animation: aim for <= 4 segments. If more, split the lesson.
- Use tiny data: 4-6 items for sorting/searching, depth <= 3 for trees, `n` <= 5 for recursion. Offer a "bigger input" button *after* understanding (the "Changing" level).

### What is on screen
- Three panes, same layout in every lesson (consistency lowers load): **Code** (current line highlighted), **Memory/names** (name tags with arrows to value boxes), **Output**. A **trace table** can toggle on.
- Highlight (signaling) only what changes in this step; dim everything else. Colour is never the only cue (add shape, label, position). Colour-blind-safe palette.
- Words sit **next to** the thing they describe (not in a legend elsewhere).
- No decoration: no bouncing characters, confetti, music, or sound effects inside explanations.
- Show comparisons and swaps explicitly ("is 3 < 5? yes").
- Show the *invariant* in words for algorithms ("everything left of the line is sorted").

### Narration
- **Captions are primary**: <= 20 words per step, <= 12 words per sentence, present tense, active voice. Appear with the step; stay until the next step.
- Optional **read aloud** toggle (helps weak readers). Do not play audio and show identical full captions at the same time by default (redundancy effect); let the learner choose, with captions always available.
- Say *why*, not only *what*: not "Move i to 2" but "i moves to 2 so we look at the next item."
- Narration uses only terms already taught; first use of a new term links to its Word box.

### Engagement ladder (build this into every algorithm animation)
1. **View** (step through) - minimum.
2. **Respond** - predictions and checkpoint questions (required).
3. **Change** - learner edits the input array or one parameter and re-runs (required for each DSA lesson).
4. **Construct** - Parsons of the algorithm steps, or learner drags items to simulate a step (required once per unit).
5. **Present** - "Explain it to a friend": pick the correct sentence order. Optional.

If a lesson ships only level 1, it fails review.

---

## 5. WRITING RULES FOR 10-YEAR-OLDS

### Hard limits (reading text, not code)
| Rule | Limit |
|---|---|
| Average sentence | <= 10 words |
| Longest sentence | 16 words (rare) |
| Paragraph | <= 3 sentences, <= 45 words |
| Reading before first interaction | <= 150 words |
| Flesch-Kincaid grade of prose | <= 5 (smoke test only; ignore taught terms and code) |
| New technical terms per lesson | <= 3 |
| Syllables | Prefer 1-2 syllable words; 3+ only for taught terms |
| Voice | Active. "You write a loop", not "A loop is written" |
| Person | Talk to "you". Use "we" only for "let us look". |
| Tense | Present |
| Ideas per sentence | One |
| Lists | Steps as numbered lists, one action each |
| Numbers | Digits for values (`3`), small words in prose avoided: write "3 items" |
| Idioms/slang | None ("piece of cake", "under the hood", "off by one" must be explained or avoided in prose) |
| Humor | Light, never at the learner's expense; never in error feedback |
| Banned words | simply, just, easy, obviously, trivial, clearly, basically, of course, simple (as judgment) |
| Metaphors | One per concept, used consistently, with the mismatch stated ("Unlike a box, a name tag can move") |

### Layout (dyslexia-friendly, BDA)
- Body text >= 18px (about 14pt), line height 1.5, left-aligned, never justified, line length 45-70 characters.
- Paragraph spacing >= 1.5 x line height; extra letter-spacing about 0.04-0.06em on body text.
- Headings >= 20% larger, bold; no italics or ALL CAPS blocks; no underline except links.
- Plain sans-serif for prose; clear monospace for code with distinct `0/O`, `1/l/I`. **Do not rely on a "dyslexia font"** (weak evidence); give a user setting for font size, spacing and a warm background tint.
- High contrast (WCAG AA minimum); avoid pure white-on-black glare; offer a light/dark pair.
- Every image/animation has a text equivalent. Don't put key info only in colour.
- Allow "Read to me" via the browser speech engine.

### How technical words are taught (not hidden)
Pattern: **Meet -> Name -> Use -> Check -> Recall**
1. **Meet** the idea in plain words and a picture: "A name tag stuck on a value."
2. **Name** it in a Word box: "This is called a **variable** (say: VAIR-ee-uh-bul)." Show the plain meaning beside the term every time it is in a Word box.
3. **Use** the same word in every later lesson. No synonyms ("list" always "list", never "array" in prose; mention "also called array in other languages" once).
4. **Check** with a vocabulary match item in the same lesson.
5. **Recall**: the term enters spaced review as its own skill ("What do we call a name tag for a value?" -> variable).
- Tap/hover glossary on *every* later use, showing the first plain explanation.
- Code keywords are never renamed: kids must see `def`, `for`, `IndexError` as they are, and each gets a plain "means" line.
- Max 3 new terms per lesson; a term's second-use reminders fade after 3 correct uses.
- Intro order: concrete word picture -> term -> definition -> example in code. Never lead with the definition.

### Jargon -> first plain explanation (use as the starting sentence; all <= 15 words)
| Term | First plain explanation |
|---|---|
| program | A list of steps for the computer, written in a language it knows. |
| code | The words and symbols you type to give the computer steps. |
| Python | A language for telling the computer what to do. |
| run | Tell the computer to follow your steps now. |
| bug | A mistake in code that makes it do the wrong thing. |
| debug | Find a mistake in code and fix it. |
| error message | The computer saying "I got stuck, and here is where." |
| syntax | The spelling and punctuation rules of code. |
| comment | A note for people. The computer skips it. |
| print | Show something on the screen. |
| output | What the program shows or gives back. |
| input | What goes into the program, like a name you type. |
| variable | A name tag stuck on a value so you can find it later. |
| value | A piece of information, like 7 or "cat". |
| assignment | Sticking a name tag on a value. We write `x = 7`. |
| string | Text. Letters and symbols inside quote marks. |
| integer (int) | A whole number, like 4 or -2. |
| float | A number with a point, like 3.5. |
| boolean | A value that is only True or False. |
| expression | A bit of code that works out to one value, like `2 + 3`. |
| operator | A symbol that does a job, like `+` or `>`. |
| condition | A question the program asks, with a True or False answer. |
| if / else | Do this if the answer is yes. Do that if it is no. |
| loop | A way to repeat steps without writing them again. |
| iterate | Go through things one at a time, in order. |
| iteration | One trip around a loop. |
| list | Things in a row, in order, held in one name. |
| element / item | One thing inside a list. |
| index | The number that tells which spot in a list. Counting starts at 0. |
| dictionary | Pairs of keys and values, like a word and its meaning. |
| key | The label you use to look up a value in a dictionary. |
| function | A named mini-program you can use again and again. |
| call (a function) | Ask a function to do its job now. |
| parameter | A name tag inside a function for something you give it. |
| argument | The real value you hand to a function when you call it. |
| return | Hand an answer back from a function to the code that asked. |
| scope | Where in the code a name can be seen. |
| module / import | A box of ready-made tools you can bring into your program. |
| method | A function that belongs to a thing, like `name.upper()`. |
| object | A thing in memory with data and tools, like a list or a string. |
| immutable | Cannot be changed after it is made. Strings are immutable. |
| None | A value that means "nothing here". |
| indentation | Spaces at the start of a line. In Python they show what belongs together. |
| nested | Put inside something of the same kind, like a loop in a loop. |
| algorithm | A clear set of steps that solves a problem. |
| pseudocode | Steps written in plain words, before real code. |
| data structure | A way to organise data so some jobs are fast. |
| array | A row of items in numbered spots. Python lists work like this. |
| pointer / reference | An arrow that shows where a thing lives in memory. |
| node | One box in a chain or tree that holds a value and arrows to others. |
| linked list | A chain of nodes. Each one points to the next. |
| stack | A pile. You add and take from the top only (last in, first out). |
| queue | A line. First in, first out. |
| tree | Boxes joined from one top box down, like a family tree. |
| graph | Dots (nodes) joined by lines (edges). |
| hash / hash table | A fast address book: a recipe turns a key into a spot to look. |
| sorting | Putting things in order, like small to big. |
| searching | Looking for one item in a group. |
| binary search | Look in the middle, then throw away the half that cannot have it. |
| recursion | A function that solves a problem by calling a smaller copy of itself. |
| base case | The smallest case, where the function stops calling itself. |
| call stack | The pile of unfinished function calls the computer remembers. |
| brute force | Try every possibility until one works. |
| greedy | Always take the best-looking choice right now. |
| dynamic programming | Save answers to small parts so you never solve them twice. |
| memoization | Writing down an answer so you can look it up next time. |
| time complexity | How the number of steps grows when the input grows. |
| Big-O | A short way to write how fast the steps grow. |
| O(1) | Always the same number of steps, no matter how big the input. |
| O(n) | Steps grow in line with the input: twice the items, twice the steps. |
| O(n^2) | Steps grow like the input times itself: double the items, 4x the steps. |
| O(log n) | Steps grow very slowly: doubling the input adds only one step. |
| space complexity | How much extra memory the steps need as the input grows. |
| traversal | Visiting every item in a structure once. |
| BFS / DFS | Explore by layers (BFS) or by going deep first (DFS). |
| edge case | A strange input that can break your code, like an empty list. |
| constant | A value that never changes while the program runs. |

(Writers: add new rows to this table as terms appear. Builder agent should expose it as the glossary data file.)

### 8 before / after rewrites
| # | Before (textbook) | After (10-year-old) |
|---|---|---|
| 1 | A variable is a named memory location that stores a value which may change during execution. | A **variable** is a name tag stuck on a value. You can move the tag to a new value later. |
| 2 | Iterate over the sequence using a for loop to access each element. | A `for` loop visits every item in a list, one by one. Each visit is called an **iteration**. |
| 3 | Indexing in Python is zero-based, so the final element resides at position len(a) - 1. | Counting starts at 0. A list with 5 items has spots 0, 1, 2, 3, 4. The last spot is 4. |
| 4 | The function returns None implicitly if no return statement is encountered. | If a function has no `return`, it hands back `None`. That means "nothing". |
| 5 | Binary search has logarithmic time complexity, O(log n), because it halves the search space each iteration. | Binary search cuts the pile in half each time. A pile of 1,000 needs only about 10 looks. We write this **O(log n)**. |
| 6 | Recursion is a technique wherein a function invokes itself with a reduced problem until a base case is satisfied. | Recursion: a function solves a big problem by asking a smaller copy of itself. It stops at the smallest problem, the **base case**. |
| 7 | A hash table uses a hash function to map keys to indices, enabling average constant-time lookups. | A **hash table** is a fast address book. A recipe (the hash) turns a key into a spot number, so Python goes straight there. |
| 8 | Passing a mutable object to a function permits in-place modification via reference semantics. | When you give a list to a function, the function gets the *same* list, not a copy. If it changes the list, your list changes too. |

### Plain-language process
1. Draft -> 2. run Flesch-Kincaid/length script on prose only (strip code and Word-box terms) -> 3. replace every word not in the allowed list or the lesson's glossary -> 4. read aloud; any sentence you breathe in the middle of is too long -> 5. test with 2-3 children (or an adult reading as a 5th grader): "tell me in your own words".
- **Allowed word list** = the ~2,000 most common English words plus lesson glossary terms. Maintain it as `wordlist.txt`; lint prose against it and flag the rest.

---

## 6. TOP 25 PYTHON NOVICE MISCONCEPTIONS

Sources: Sorva 2013; Qian & Lehman 2017; Swidan et al. 2018 (children); du Boulay 1986 (superbug). Prevalence numbers vary by study, so priority below is by how commonly the literature reports them and how early they appear.
**Addressing pattern** (every one): *Predict* (question that exposes it) -> *Confront* (animation shows the real step) -> *Name the rule* (one sentence) -> *Spot-the-bug* item -> *Review item* in the queue.

| # | Misconception | How a lesson should address it |
|---|---|---|
| 1 | `=` means "equals" like maths; `x = 5` states a fact, order is symmetrical | Read `=` aloud as "gets" / "put in". Animate right side computed first, then name tag moves. Predict: `a = 3; b = a; a = 5; print(b)`. |
| 2 | `==` and `=` are interchangeable (`if x = 5:`) | Side by side table: `=` does, `==` asks. Fix-the-bug with `if x = 5`. Show the real SyntaxError. |
| 3 | `x = x + 1` is impossible/contradictory | Trace with name tag: "work out right side, then stick the tag on the result". Do it as a 3-step animation. |
| 4 | A variable holds several values/keeps old values ("history") | Animation removes old value from the tag. Predict: `x=2; x=7; print(x)`. |
| 5 | Variable is a box that contains the value (and `b = a` copies the thing) | Use name tag + arrow from lesson 1. For lists show two tags on one list (`b = a`). Caveat: box model is simpler but breaks at lists; commit to tags early. |
| 6 | Assignment links variables: after `b = a`, changing `a` changes `b` (or "a = b" is lazy/live) | Predict with numbers, then with lists (where sharing *is* real). Contrast side by side. |
| 7 | Computer runs lines in any order / uses a later line | Trace with highlighted current line. Parsons "order the lines". |
| 8 | Defining a function (`def`) runs it | Animation: `def` only makes a recipe; nothing prints until the call. Predict output. |
| 9 | `print` and `return` are the same; `return` shows something on screen | Two-function demo: one prints, one returns; show screen vs hand-back. Predict `x = f()` then `print(x)`. Show `None`. |
| 10 | Code after `return` still runs; or a function without `return` gives nothing | Animation: function ends at `return`. Fix-the-bug where unreachable code exists. |
| 11 | Parameter names must match variable names in the caller; inputs and parameters are "the same thing" | Call with a differently named variable; show the arg copied onto the parameter's tag. |
| 12 | Variables made in a function are visible everywhere (scope) | Show walls around function. Predict error `NameError`. Translate error to plain words. |
| 13 | `range(5)` goes 1..5 (or includes 5); off-by-one | Show number line with `0 1 2 3 4` and "stops before 5". Predict, then Fix-the-bug. Provide `range(a, b)` rule: "includes a, stops before b". |
| 14 | Index starts at 1; last index = `len`; negative indexes are errors | Boxed row numbered from 0; `len=5, last=4`. Trigger `IndexError`, then translate. Show `-1` as "count from the end". |
| 15 | The loop variable stays the same / loop repeats identical output | Trace table showing `i` change each turn. Predict `for i in range(3): print(i)` vs `print("hi")`. |
| 16 | Code after a loop (not indented) runs inside it, or the reverse | Highlight the indented block; animation with colored block. Parsons with indentation. |
| 17 | `while` stops the instant the condition becomes false mid-body; condition checked only once | Step animation: condition checked at top each time; show body finishes first. Trace table. |
| 18 | `while` loops stop on their own / infinite loop is not a bug | Demo "forever" safely (auto stop with plain message). Ask "what changes the condition?" |
| 19 | `if`, `elif`, `else` all run; separate `if`s equal `elif` | Show a flow picture with one path chosen; predict with two `if`s vs `if/elif`. |
| 20 | `if x == 1 or 2:` means "x is 1 or 2" (English-like conditions); `and`/`or` confused | Show the expression evaluates parts separately. Fix-the-bug; teach `x == 1 or x == 2`. Truth table game. |
| 21 | `"5" + "5"` is 10; `input()` gives a number; quotes irrelevant; `print(hello)` vs `print("hello")` | Types strip: show "5" vs 5 with type label. Predict `+` on strings. Show `TypeError`. Name tag vs text. |
| 22 | `/` vs `//` and `%`; "integer division" and float surprises | Number-line demo; predict `7 // 2`, `7 % 2`, `7 / 2`. Real-life share-out analogy (sweets among kids). |
| 23 | Methods change the thing: `s.upper()` changes `s`; `x = my_list.append(1)` stores the list | Show string immutability (new value, old one stays). Show `append` returns `None`. Fix-the-bug. |
| 24 | The computer understands intent (superbug): comments, names like `total` are "meaningful" to Python; it "knows what I meant" | Early lesson: computer follows *only* the exact steps. Rename variable to `banana`, program still works. Comment out the real code, nothing changes. Spelling/case-sensitivity bug. |
| 25 | Recursion = loop back to top; each call shares one set of variables; base case optional | Animate call stack with separate frames; trace `factorial(3)`. Predict output when the base case is missing (RecursionError, safe). |

**DSA misconceptions to add as a second list** (lessons must cover them even though outside the top 25): bigger `n` always means slower ("O" is a count of steps, not seconds); "faster algorithm always better for tiny inputs"; sorted list is needed for linear search; hash table lookup is always O(1) (collisions); stack and queue are "the same list"; tree depth = number of nodes; binary search works on unsorted data.

**Tactics that cut across all 25**
- Use **Predict first** so the wrong model is visible before correction (refutation works better than telling).
- Keep **Python Tutor-style** trace (names -> arrows -> values) in every lesson that changes state.
- Make misconception tags a field on every question so analytics (local) can show "you often mix up `=` and `==`".
- When a learner picks a misconception-linked wrong answer twice, auto-insert a mini lesson (one animation + two questions) next session.

---

## 7. SPACED REVIEW AND MASTERY (local only, no accounts)

Evidence is strong that spacing and retrieval work; the exact schedule below is a **sensible default, not proven optimal** (Cepeda: best gap grows with the retention goal but as a shrinking fraction). Make intervals configurable constants.

### Data model (store in localStorage/IndexedDB; export/import JSON file as backup)
```
skill: {
  id: "py.loops.range-stop",
  box: 0..5,            // spacing box
  dueAt: ISO date,
  streakCorrect: int,   // consecutive correct first-try answers
  correctDays: [dates], // distinct days with a correct answer
  lastResult: "ok"|"hint"|"wrong",
  attempts: int, misconceptionHits: {id: count}
}
```
Each skill has 3-6 question variants (different surface) so the same answer cannot be memorised. Review shows an unseen variant first.

### Intervals (expanding)
| Box | Next review after a correct answer |
|---|---|
| 0 (new, learned today) | same session end, then 1 day |
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 14 days |
| 5 | 30 days, then every 60 days (kept as "mastered" maintenance) |

- Correct first try, no hint: box +1.
- Correct after hint or 2nd try: stay in box; due again in 1 day.
- Wrong: box -> max(0, box - 2); due next session; flag misconception tag; show worked mini example before the retry.
- Skipped/"don't know": same as wrong, no penalty. Never lose lesson completion.
- Interleave: review queue mixes up to 3 skills from different lessons in one set (light interleaving, Dunlosky "low evidence", so keep it modest). New-lesson warm-up takes the 2-3 most overdue skills.
- **Cap review at 8-10 items (about 5 minutes) per day.** Overflow rolls to tomorrow; oldest/lowest box first. Never show a "backlog of 247" counter.
- If the user is away: don't penalize. On return, soft-restart: reset overdue skills to box = max(1, box - 1) and rebuild a gentle queue; say "Welcome back! Let us warm up."

### What counts as "mastered" (per skill)
All three must hold:
1. **3 correct first-try answers** on *different variants*.
2. On **at least 2 different days** (at least 1 day apart) including one answer *without a hint ladder*.
3. **One transfer item** correct: a new surface that was not in the lesson (e.g. changed variable names or story, or a "write it" item instead of multiple choice).

Display states (kid wording): **Seen** -> **Practising** -> **Strong** (box >= 3 and criteria 1-3) -> **Rock solid** (box 5, retained after 30 days).
- Lose "Strong" back to "Practising" only after two wrong answers within 14 days, not one slip.
- A **unit** is "complete" when all its skills are >= Strong; a **unit test** appears at the end with a mixed set (no time limit, no grade; a "what to review" list).
- Prereq gating: soft only. Suggest "do this first" but never lock (SDT autonomy).

### Progress display
- Skill map showing state per skill; per unit "% Strong". Show **days practised (cumulative)**, never "days in a row".
- "Today's review: 6 ready" with a button. Optional reminder text, never guilt copy.
- Local-only caveat: clearing browser data erases progress. Provide a one-click "Save my progress" (download JSON) and "Load" button, and a friendly note on the home page.

---

## 7b. MOTIVATION RULES (non-manipulative)

Basis: SDT (competence, autonomy, relatedness); Deci 1999 (tangible rewards undermine interest, praise informs); streak evidence weak.

- **Competence**: show visible skill growth; pick tasks with ~70-85% expected success; make hard parts feel solvable via hint ladders. Praise *process and specifics*: "You spotted that the loop never changed `i`." (verbal feedback raised interest, d about +0.3).
- **Autonomy**: learner chooses next lesson from 2-3 options, can skip/redo, can hide hints, can reorder only within a unit. "Make-your-own" mini projects at unit ends (draw with Turtle-like output, quiz maker, tiny game).
- **Relatedness (no accounts)**: character/narrator "guide" with consistent warm voice; optional "Explain to someone" sharing of printed certificate-free summary. Do not fake social proof.
- **No**: streak-loss warnings, hearts/lives, countdown timers, leaderboards, XP for time spent, random loot, "don't break your streak" copy, confetti on every click, comparison with others, paywall-like pressure.
- **Allowed with care**: a *cumulative* "days practised" counter, a **weekly goal** (e.g. 3 of 7 days) that never resets to zero, small badges for *skills mastered* (informational, not tradable), end-of-lesson "what you can now do" statement.
- Unexpected tangible rewards harm less than expected ones, but avoid them anyway; the rule is informational praise and visible mastery.
- Errors framed as information: "Bugs are normal. Even experts fix bugs every day."
- Optional "Calm mode": no animation, no timers, large text.
- Review ethics: if a design choice makes the learner come back *because they fear losing something* rather than because they want to learn, remove it.

---

## 8. SOURCES

**Algorithm visualization and engagement**
- Hundhausen, Douglas, Stasko (2002). A Meta-Study of Algorithm Visualization Effectiveness. J. Visual Languages & Computing 13(3). [F] https://www.sciencedirect.com/science/article/pii/S1045926X02902375 ; PDF https://s3.amazonaws.com/publicationslist.org/data/helplab/ref-52/JVLC-AVMetaStudy.pdf
- Naps et al. (2002). Exploring the role of visualization and engagement in computer science education. ITiCSE WG report. [F] https://dl.acm.org/doi/pdf/10.1145/960568.782998
- Naps, Röβling, et al. / Myller et al. (2009). Extending the Engagement Taxonomy. [F] https://dl.acm.org/doi/pdf/10.1145/1513593.1513600
- Sorva, Karavirta, Malmi (2013). A review of generic program visualization systems for introductory programming education. ACM TOCE 13(4). [K] https://doi.org/10.1145/2490822
- Python Tutor (Guo 2013), design reference for the names/arrows trace. [K] https://pythontutor.com

**Novice programming pedagogy**
- Ericson, Margulieux, Rick (2017). Solving Parsons problems versus fixing and writing code. Koli Calling. [F] https://dl.acm.org/doi/10.1145/3141880.3141895 ; summary https://computinged.wordpress.com/2017/11/17/parsons-problems-have-same-learning-gains-as-writing-or-fixing-code-in-less-time-koli-calling-2017-preview/
- Ericson et al. (2022). Parsons Problems and Beyond: Systematic Literature Review. [F] https://juholeinonen.com/assets/pdf/ericson2022parsons.pdf
- Sentance, Waite, Kallia (2019). Teaching computer programming with PRIMM. Computer Science Education. [K] https://doi.org/10.1080/08993408.2019.1608781 ; PRIMM project page [F] https://computingeducationresearch.org/projects/primm/ ; teacher experiences [F] https://dl.acm.org/doi/10.1145/3287324.3287477
- Margulieux & Catrambone (2016). Improving problem solving with subgoal labels in expository text and worked examples. Learning and Instruction. [F] https://www.sciencedirect.com/science/article/abs/pii/S095947521530044X ; Margulieux, Morrison, Decker (2015/2018) [F] https://dl.acm.org/doi/10.1145/2787622.2787733 ; summary of the 3-field variation study https://laurenmarg.com/2018/09/23/article-summary-margulieux-et-al-2018varying-effects-of-subgoal-labels-in-3-stem-fields/
- Lister et al. (2004). A multi-national study of reading and tracing skills in novice programmers. SIGCSE Bulletin 36(4). [K] https://doi.org/10.1145/1041624.1041673
- Lopez et al. (2008). Relationships between reading, tracing and writing skills in introductory programming. ICER. [K] https://doi.org/10.1145/1404520.1404531
- Luxton-Reilly et al. (2018). Introductory programming: a systematic literature review. ITiCSE WG. [F] https://dl.acm.org/doi/10.1145/3293881.3295779
- Sorva (2013). Notional machines and introductory programming education. ACM TOCE 13(2). [F] https://dl.acm.org/doi/10.1145/2483710.2483713

**Misconceptions**
- Qian & Lehman (2017). Students' misconceptions and other difficulties in introductory programming. ACM TOCE 18(1). [F] https://dl.acm.org/doi/10.1145/3077618
- Swidan, Hermans, Smit (2018). Programming misconceptions for school students. ICER. [F] https://www.semanticscholar.org/paper/Programming-Misconceptions-for-School-Students-Swidan-Hermans/8d4a3d681ec2f784c94110a055a876252f822a0f
- Prevalence of Programming Misconceptions in Primary School Students. [F] https://www.research-collection.ethz.ch/bitstreams/89559bcd-9a1e-45c4-b678-8fa2f18cc373/download
- Unplugged, Scratch, and Python: tracing primary students' misconceptions. [F] https://dl.acm.org/doi/full/10.1145/3702652.3744225
- du Boulay (1986). Some difficulties of learning to program (superbug). [K] https://doi.org/10.2190/3LFX-9RRF-67T8-UVK9

**Learning science**
- Dunlosky et al. (2013). Improving Students' Learning With Effective Learning Techniques. Psych Science in the Public Interest. [F] https://pubmed.ncbi.nlm.nih.gov/26173288/
- Cepeda et al. (2006). Distributed practice in verbal recall tasks. Psych Bulletin. [K] https://doi.org/10.1037/0033-2909.132.3.354 ; Cepeda et al. (2008). Spacing effects in learning: a temporal ridgeline of optimal retention. Psych Science. [K] https://doi.org/10.1111/j.1467-9280.2008.02209.x
- Rowland (2014). The effect of testing versus restudy on retention: a meta-analytic review. Psych Bulletin. [K] https://doi.org/10.1037/a0037559
- Sweller & Cooper (1985). The use of worked examples as a substitute for problem solving. Cognition and Instruction. [K] https://doi.org/10.1207/s1532690xci0201_3
- Kalyuga, Ayres, Chandler, Sweller (2003). The expertise reversal effect. Educational Psychologist. [F] https://mrbartonmaths.com/resourcesnew/8.%20Research/Explicit%20Instruction/The%20Expertise%20Reversal%20Effect.pdf
- Renkl (2014). Toward an instructionally oriented theory of example-based learning. Cognitive Science. [K] https://doi.org/10.1111/cogs.12086
- Sinha & Kapur (2021). When problem solving followed by instruction works: evidence for productive failure. Review of Educational Research. [F] https://janfasen.nl/wp-content/uploads/2023/05/Sinha-and-Kapur-PS-I.pdf
- Shute (2008). Focus on formative feedback. Review of Educational Research 78(1). [F] https://myweb.fsu.edu/vshute/pdf/shute%202007_f.pdf
- Mayer & Fiorella (2014). Principles for managing essential processing in multimedia learning (segmenting, signaling, pacing). In Cambridge Handbook of Multimedia Learning. [F] https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning/A9E77D0172F905AC957689D1771E2888
- Hasler, Kersten, Sweller (2007). Learner control, cognitive load and instructional animation. Applied Cognitive Psychology 21. [K, cited within Mayer & Fiorella F] https://doi.org/10.1002/acp.1345
- Sweller, Ayres, Kalyuga (2011). Cognitive Load Theory. Springer. [K] https://doi.org/10.1007/978-1-4419-8126-4

**Plain language and accessibility**
- OPM Plain Language (sentence length averages 15-20 words, active voice). [F] https://www.opm.gov/information-management/plain-language/
- Digital.gov plain language guide series. [F] https://digital.gov/guides/plain-language
- Federal Plain Language Guidelines (PDF). [F] https://wid.org/wp-content/uploads/2022/03/FederalPLGuidelines.pdf
- British Dyslexia Association Style Guide. [F] https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide
- Zorzi et al. (2012). Extra-large letter spacing improves reading in dyslexia. PNAS. [F] https://ccnl.psy.unipd.it/publications/publications_folder/extra-large-letter-spacing-improves-reading-in-dyslexia
- Wery & Diliberto (2017). Effect of a specialized dyslexia font, OpenDyslexic, on reading rate and accuracy. Annals of Dyslexia. [K] https://doi.org/10.1007/s11881-016-0127-1

**Motivation**
- Deci, Koestner, Ryan (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. Psych Bulletin 125(6). [F] https://pubmed.ncbi.nlm.nih.gov/10589297/ ; full text https://selfdeterminationtheory.org/wp-content/uploads/2014/04/1999_DeciKoestnerRyan_Meta.pdf
- Ryan & Deci (2000). Self-determination theory and the facilitation of intrinsic motivation. American Psychologist. [K] https://doi.org/10.1037/0003-066X.55.1.68
- Hamari, Koivisto, Sarsa (2014). Does gamification work? A literature review of empirical studies. HICSS. [K] https://doi.org/10.1109/HICSS.2014.377
- Mogavi et al. (2022) on Duolingo "gamification misuse" (secondary summary). [F] https://www.taalhammer.com/gamification-in-language-learning-apps/

*Note*: all [K] items should be spot-checked before external quotation. No streak-specific causal study on children was found.
