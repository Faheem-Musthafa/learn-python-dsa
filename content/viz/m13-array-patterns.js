/* Visuals for module 13: two pointers, sliding window, prefix sums. Names start with the module id. */
(function () {
  // ------------------------------------------------------------- helpers
  /* Whole numbers from what the learner typed. Anything else is skipped. */
  const readNums = (text, max = 6) =>
    (String(text == null ? '' : text).match(/-?\d+/g) || [])
      .slice(0, max)
      .map(x => Math.max(-99, Math.min(99, parseInt(x, 10))));
  const toInt = (v, lo, hi, d) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
  };
  const show = a => '[' + a.join(', ') + ']';
  const isSorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v);
  const asc = a => a.slice().sort((x, y) => x - y);
  const items = n => (n === 1 ? '1 item' : n + ' items');
  const firstN = n => (n === 1 ? 'first item' : `first ${n} items`);

  /* Options for an ask. Repeats are dropped, and the right one moves around. */
  const pick = (right, wrongs, seed = 0) => {
    const r = String(right);
    const rest = [...new Set(wrongs.map(String))].filter(x => x !== r);
    const at = Math.abs(seed) % (rest.length + 1);
    const options = rest.slice();
    options.splice(at, 0, r);
    return { options, answer: at };
  };

  /* An item the rule has thrown away looks smaller and paler, so colour is not the only clue. */
  const ruleOut = (s, id) => s.set(id, { tone: 'muted', scale: 0.82, opacity: 0.7 });

  const slowPairSteps = (nums, target) => {
    let steps = 0;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        steps += 1;
        if (nums[i] + nums[j] === target) return steps;
      }
    }
    return steps;
  };
  const slowCleanSteps = list => {
    const a = list.slice();
    let steps = 0, i = 1;
    while (i < a.length) {
      steps += 1;
      if (a[i] === a[i - 1]) { steps += a.length - i - 1; a.splice(i, 1); } else i += 1;
    }
    return steps;
  };
  const slowWindowSteps = (n, k) => (k > n ? 0 : (n - k + 1) * k);
  const slowLongestSteps = word => {
    let steps = 0;
    for (let a = 0; a < word.length; a++) {
      const seen = new Set();
      for (let b = a; b < word.length; b++) {
        steps += 1;
        if (seen.has(word[b])) break;
        seen.add(word[b]);
      }
    }
    return steps;
  };

  const NUM_INPUT = value => ({ key: 'nums', label: 'nums (up to 6 numbers)', type: 'text', value, size: 16 });

  // ---------------------------------------------------------- lesson 13.1
  Viz.register('m13-pair-slow', {
    title: 'The slow way tests every pair',
    size: [560, 240],
    code: py`
      def slow_pair(nums, target):
          for i in range(len(nums)):
              for j in range(i + 1, len(nums)):
                  if nums[i] + nums[j] == target:
                      return nums[i], nums[j]
          return None
    `,
    inputs: [
      NUM_INPUT('1 3 4 6 8 11'),
      { key: 'target', label: 'target', type: 'number', value: 10, min: -200, max: 200 },
    ],
    tryInputs: [
      { nums: '', target: 5 }, { nums: '7', target: 7 }, { nums: '2 2 2', target: 4 },
      { nums: '1 2 3', target: 100 }, { nums: '9 1 5 3', target: 8 }, { nums: 'cat', target: 1 },
      { nums: '-5 5 0 -9 9 1', target: 0 }, { nums: '1 2 3 4 5 6 7 8 9', target: 200 },
    ],
    build(s, p) {
      const nums = readNums(p.nums);
      const target = toInt(p.target, -200, 200, 10);
      const n = nums.length;
      const o = { y: 140 };
      const X = i => s.slotX(i, n, o);
      s.row('n', nums, o);
      s.box('tgt', 54, 44, target, { w: 64, h: 40, sub: 'target' });
      s.box('st', 506, 44, 0, { w: 64, h: 40, sub: 'steps' });
      s.text('sum', 280, 44, '', { size: 17, weight: 700 });

      if (n < 2) {
        const say = n === 0 ? 'The list is empty, so there are no pairs.' : 'One item has no partner, so there are no pairs.';
        s.snap(say + ' The answer is None.', { line: 6, vars: { steps: 0 }, out: 'None' });
        return;
      }

      const total = n * (n - 1) / 2;
      const parts = [];
      for (let c = n - 1; c >= 1; c--) parts.push(c);
      let steps = 0;

      s.pointer('pi', X(0), 108, 'i', { dir: 'down' });
      s.tone('n0', 'active');
      const q0 = pick(n - 1, [n, 1, n + 1], n);
      s.snap('i starts on the first item. j will visit each item after it.', {
        line: 2, vars: { i: 0, steps },
        ask: {
          q: 'How many partners can the first item have?',
          options: q0.options, answer: q0.answer,
          why: `It pairs with each of the other ${n - 1}. An item does not pair with itself.`,
        },
      });

      for (let i = 0; i < n - 1; i++) {
        if (i > 0) {
          s.set('pi', { x: X(i) });
          s.del('pj');
          for (let k = 0; k < n; k++) s.tone('n' + k, k < i ? 'muted' : k === i ? 'active' : 'default');
          s.set('sum', { text: '' });
          let ask = null;
          if (i === 1) {
            const q = pick(n - 2, [n - 1, n, n - 3 < 0 ? n + 1 : n - 3], n + 1);
            ask = {
              q: 'i moved on. How many new partners does it have now?',
              options: q.options, answer: q.answer,
              why: `The pair with ${nums[0]} is already tested. Only ${items(n - 2)} wait after i.`,
            };
          } else if (i === 2) {
            const q = pick(total, [n * n, n, n * (n - 1)], n + 2);
            ask = {
              q: `If no pair works, how many pairs will ${n} items need in all?`,
              options: q.options, answer: q.answer,
              why: `Add the partners for each i: ${parts.join(' + ')} is ${total}.`,
            };
          }
          s.snap(`i moves to ${nums[i]}. j starts again right after it.`, { line: 2, vars: { i, steps }, ask });
        }
        for (let j = i + 1; j < n; j++) {
          const t = nums[i] + nums[j];
          steps += 1;
          if (s.has('pj')) s.set('pj', { x: X(j) });
          else s.pointer('pj', X(j), 194, 'j', { dir: 'up' });
          for (let k = i + 1; k < n; k++) s.tone('n' + k, k === j ? 'active' : 'default');
          s.set('st', { text: steps });
          s.set('sum', { text: `${nums[i]} + ${nums[j]} = ${t}` });
          if (t === target) {
            s.tone(['n' + i, 'n' + j], 'ok');
            s.snap(`${nums[i]} + ${nums[j]} is ${target}. Found a pair after ${steps} steps.`, {
              line: 5, vars: { i, j, steps }, out: `(${nums[i]}, ${nums[j]})`,
            });
            return;
          }
          s.snap(j === n - 1
            ? `${nums[i]} + ${nums[j]} is ${t}, not ${target}. j has reached the end.`
            : `${nums[i]} + ${nums[j]} is ${t}, not ${target}. So j moves on.`, { line: 4, vars: { i, j, steps } });
        }
      }

      s.del('pi', 'pj');
      s.set('sum', { text: '' });
      s.clearTones();
      s.snap(`No pair adds up to ${target}. All ${steps} pairs got tested.`, { line: 6, vars: { steps }, out: 'None' });
    },
  });

  Viz.register('m13-pair-pointers', {
    title: 'Two pointers walk in from both ends',
    size: [560, 240],
    code: py`
      def find_pair(nums, target):
          left = 0
          right = len(nums) - 1
          while left < right:
              total = nums[left] + nums[right]
              if total == target:
                  return nums[left], nums[right]
              if total < target:
                  left = left + 1
              else:
                  right = right - 1
          return None
    `,
    inputs: [
      NUM_INPUT('1 3 4 6 8 11'),
      { key: 'target', label: 'target', type: 'number', value: 10, min: -200, max: 200 },
    ],
    tryInputs: [
      { nums: '', target: 5 }, { nums: '7', target: 14 }, { nums: '2 2 2', target: 4 },
      { nums: '2 2 2', target: 5 }, { nums: '1 2 3', target: 100 }, { nums: '9 1 5 3', target: 8 },
      { nums: 'cat', target: 1 }, { nums: '-5 5 0 -9 9 1', target: 0 }, { nums: '1 3', target: 4 },
    ],
    build(s, p) {
      const typed = readNums(p.nums);
      const nums = asc(typed);
      const target = toInt(p.target, -200, 200, 10);
      const n = nums.length;
      const o = { y: 140 };
      const X = i => s.slotX(i, n, o);
      s.row('n', typed, o);
      s.box('tgt', 54, 44, target, { w: 64, h: 40, sub: 'target' });
      s.box('st', 506, 44, 0, { w: 64, h: 40, sub: 'steps' });
      s.text('sum', 280, 44, '', { size: 17, weight: 700 });

      if (n === 0) {
        s.snap('The list is empty, so right is -1. The loop never starts. The answer is None.', { line: 12, vars: { left: 0, right: -1, steps: 0 }, out: 'None' });
        return;
      }
      if (!isSorted(typed)) {
        s.snap('Your list is not sorted. These pointers need sorted order.', { vars: { steps: 0 } });
        nums.forEach((v, i) => s.set('n' + i, { text: v }));
        s.snap('So you sort it first, smallest to biggest.', { vars: { nums: show(nums), steps: 0 } });
      }
      if (n === 1) {
        s.pointer('pl', X(0), 108, 'left', { dir: 'down' });
        s.pointer('pr', X(0), 194, 'right', { dir: 'up' });
        s.snap('left and right sit on the same item. The loop never starts. The answer is None.', { line: 12, vars: { left: 0, right: 0, steps: 0 }, out: 'None' });
        return;
      }

      let left = 0, right = n - 1, steps = 0;
      s.pointer('pl', X(left), 108, 'left', { dir: 'down' });
      s.pointer('pr', X(right), 194, 'right', { dir: 'up' });
      s.snap('left starts on the smallest item. right starts on the biggest.', { line: 3, vars: { left, right, steps } });

      while (left < right) {
        const a = nums[left], b = nums[right], t = a + b;
        steps += 1;
        s.tone(['n' + left, 'n' + right], 'active');
        s.set('st', { text: steps });
        s.set('sum', { text: `${a} + ${b} = ${t}` });
        const answer = t === target ? 2 : t < target ? 0 : 1;
        const why = t === target
          ? `${t} is the target, so this pair is the answer.`
          : t < target
            ? `${t} is too small, even with ${b}, the biggest item left. So ${a} fails with every partner.`
            : `${t} is too big, even with ${a}, the smallest item left. So ${b} fails with every partner.`;
        s.snap(`${a} + ${b} is ${t}. The target is ${target}.`, {
          line: 5, vars: { left, right, total: t, steps },
          ask: {
            q: `The total is ${t}, and the target is ${target}. What happens next?`,
            options: ['left moves right', 'right moves left', 'Stop. This is the pair'],
            answer, why,
          },
        });
        if (t === target) {
          s.tone(['n' + left, 'n' + right], 'ok');
          s.snap(`Found it in ${steps} steps. The slow way took ${slowPairSteps(nums, target)} on this list.`, {
            line: 7, vars: { left, right, steps }, out: `(${a}, ${b})`,
          });
          return;
        }
        if (t < target) {
          ruleOut(s, 'n' + left);
          left += 1;
          s.tone('n' + right, 'default');
          s.set('pl', { x: X(left) });
          s.snap(`${a} is ruled out for good. left moves on.`, { line: 9, vars: { left, right, total: t, steps } });
        } else {
          ruleOut(s, 'n' + right);
          right -= 1;
          s.tone('n' + left, 'default');
          s.set('pr', { x: X(right) });
          s.snap(`${b} is ruled out for good. right moves on.`, { line: 11, vars: { left, right, total: t, steps } });
        }
      }

      s.set('sum', { text: '' });
      s.tone('n' + left, 'active');
      s.snap('left and right meet on one item.', {
        line: 4, vars: { left, right, steps },
        ask: {
          q: 'Both pointers are on the same item. What should the code do?',
          options: ['Add the item to itself', 'Stop. A pair needs 2 items', 'Start again from the ends'],
          answer: 1,
          why: 'Every other item is ruled out, and one item is not a pair. So left < right ends the loop.',
        },
      });
      ruleOut(s, 'n' + left);
      s.snap(`No pair works. That took ${steps} steps. The slow way took ${slowPairSteps(nums, target)}.`, {
        line: 12, vars: { left, right, steps }, out: 'None',
      });
    },
  });

  Viz.register('m13-clean', {
    title: 'Two pointers walk the same way',
    size: [560, 250],
    code: py`
      def clean(nums):
          if len(nums) == 0:
              return 0
          write = 1
          for read in range(1, len(nums)):
              if nums[read] != nums[write - 1]:
                  nums[write] = nums[read]
                  write = write + 1
          return write
    `,
    inputs: [NUM_INPUT('2 2 5 5 7 8')],
    tryInputs: [
      { nums: '' }, { nums: '6' }, { nums: '4 4 4 4 4 4' }, { nums: '1 2 3 4' },
      { nums: '5 1 5 1' }, { nums: 'dog' }, { nums: '-2 -2 0 3 3 3 9 9' },
    ],
    build(s, p) {
      const typed = readNums(p.nums);
      const nums = asc(typed);
      const n = nums.length;
      const o = { y: 150 };
      const X = i => s.slotX(i, n, o);
      s.row('n', typed, o);
      s.box('st', 506, 44, 0, { w: 64, h: 40, sub: 'steps' });
      s.text('note', 240, 44, '', { size: 16, weight: 700 });

      if (n === 0) {
        s.snap('The list is empty, so the code returns 0 at once.', { line: 3, vars: { steps: 0 }, out: '0' });
        return;
      }
      if (!isSorted(typed)) {
        s.snap('Your list is not sorted. Repeats must sit side by side.', { vars: { steps: 0 } });
        nums.forEach((v, i) => s.set('n' + i, { text: v }));
        s.snap('So you sort it first, smallest to biggest.', { vars: { nums: show(nums), steps: 0 } });
      }
      if (n === 1) {
        s.tone('n0', 'ok');
        s.snap('One item has no repeats. The loop has nothing to read. The answer is 1.', { line: 9, vars: { steps: 0 }, out: '1' });
        return;
      }

      let write = 1, steps = 0;
      s.pointer('pw', X(1), 118, 'write', { dir: 'down' });
      s.pointer('pr', X(1), 204, 'read', { dir: 'up' });
      s.tone('n0', 'ok');
      s.snap('The first item always stays. write marks the next spot to fill.', { line: 4, vars: { write, read: 1, steps } });

      for (let read = 1; read < n; read++) {
        const v = nums[read], w = nums[write - 1];
        steps += 1;
        s.set('pr', { x: X(read) });
        if (read > 1 && read - 1 >= write) s.tone('n' + (read - 1), 'muted');
        s.tone('n' + read, 'active');
        s.set('st', { text: steps });
        s.set('note', { text: `Is ${v} different from ${w}?` });
        const isNew = v !== w;
        s.snap(`read looks at ${v}. The last kept value is ${w}.`, {
          line: 6, vars: { write, read, steps },
          ask: {
            q: `read sees ${v}, and the last kept value is ${w}. What happens?`,
            options: ['It is new: copy it to write, then write moves', 'It is a repeat: only read moves on'],
            answer: isNew ? 0 : 1,
            why: isNew ? `${v} differs from ${w}. The list is sorted, so ${v} has not been kept yet.` : `${v} is the same as ${w}, so it is skipped. Nothing gets copied.`,
          },
        });
        if (isNew) {
          steps += 1;
          s.set('st', { text: steps });
          nums[write] = v;
          s.set('n' + write, { text: v, tone: 'ok' });
          s.pulse('n' + write);
          s.snap(read === write
            ? `${v} goes into spot ${write}. It is already there, but this still counts as a step.`
            : `${v} is copied into spot ${write}. That takes one step.`, { line: 7, vars: { write, read, steps } });
          write += 1;
          s.set('pw', { x: X(write) });
          s.snap(`write moves to spot ${write}, the next spot to fill.`, { line: 8, vars: { write, read, steps } });
        } else {
          s.tone('n' + read, 'muted');
          s.snap(`${v} is a repeat. write stays, and read moves on.`, { line: 5, vars: { write, read, steps } });
        }
      }

      s.del('pw', 'pr');
      s.set('note', { text: `Clean part: ${items(write)}` });
      for (let k = 0; k < n; k++) {
        if (k < write) s.tone('n' + k, 'ok');
        else ruleOut(s, 'n' + k);
      }
      s.snap(write === n
        ? 'No repeats here, so the whole list is clean.'
        : `Spots 0 to ${write - 1} are clean. The small boxes are old leftovers.`, { line: 9, vars: { write, steps }, out: String(write) });
      s.snap(`That took ${steps} steps. On this list, the slow way with pop(i) took ${slowCleanSteps(asc(typed))}.`, { line: 9, vars: { write, steps }, out: String(write) });
    },
  });

  // ---------------------------------------------------------- lesson 13.2
  const K_INPUT = { key: 'k', label: 'k (window size)', type: 'number', value: 3, min: 1, max: 6 };
  const WIN = {
    y: 78, h: 96,
    x: (X, start) => X(start) - 34,
    w: k => k * 58 + 10,
  };
  const windowStage = (s, nums, k) => {
    const o = { y: 140 };
    const X = i => s.slotX(i, nums.length, o);
    s.row('n', nums, o);
    s.box('best', 54, 36, 'None', { w: 64, h: 36, sub: 'best' });
    s.box('tot', 150, 36, 0, { w: 64, h: 36, sub: 'total' });
    s.box('st', 506, 36, 0, { w: 64, h: 36, sub: 'steps' });
    s.text('expr', 330, 36, '', { size: 15, weight: 700 });
    if (k <= nums.length) s.area('win', WIN.x(X, 0), WIN.y, WIN.w(k), WIN.h, 'window');
    return X;
  };

  Viz.register('m13-window-slow', {
    title: 'The slow way adds every window again',
    size: [560, 236],
    code: py`
      def slow_best(nums, k):
          best = None
          for start in range(len(nums) - k + 1):
              total = 0
              for j in range(start, start + k):
                  total = total + nums[j]
              if best is None or total > best:
                  best = total
          return best
    `,
    inputs: [NUM_INPUT('4 2 7 1 6 3'), K_INPUT],
    tryInputs: [
      { nums: '', k: 3 }, { nums: '5', k: 1 }, { nums: '5', k: 2 }, { nums: '1 2 3', k: 3 },
      { nums: '3 3 3 3', k: 2 }, { nums: 'fish', k: 1 }, { nums: '-4 -2 -7 -1', k: 2 }, { nums: '99 99 99 99 99 99', k: 6 },
    ],
    build(s, p) {
      const nums = readNums(p.nums);
      const n = nums.length;
      const k = toInt(p.k, 1, 6, 3);
      const X = windowStage(s, nums, k);

      if (k > n) {
        s.snap(`k is ${k}, but the list has ${items(n)}. No window fits, so the answer is None.`, { line: 9, vars: { k, steps: 0 }, out: 'None' });
        return;
      }

      const count = n - k + 1;
      const q0 = pick(count, [n, n - k, count + 1], n + k);
      s.snap(`Each window holds ${items(k)} in a row. It starts at spot 0.`, {
        line: 3, vars: { k, steps: 0 },
        ask: {
          q: `How many windows of ${k} fit in ${items(n)}?`,
          options: q0.options, answer: q0.answer,
          why: `A window can start at spots 0 to ${n - k}. That makes ${count}.`,
        },
      });

      let steps = 0, best = null;
      for (let start = 0; start < count; start++) {
        let total = 0;
        if (start > 0) {
          s.set('win', { x: WIN.x(X, start) });
          s.clearTones();
          s.set('tot', { text: 0 });
          s.set('expr', { text: '' });
          s.del('pj');
          let ask = null;
          if (start === 1 && k >= 2) {
            const q = pick(k - 1, [0, k, k + 1], k);
            ask = {
              q: 'How many items in this window did you already add last time?',
              options: q.options, answer: q.answer,
              why: `The two windows share ${items(k - 1)}. The slow way adds them all over again.`,
            };
          }
          s.snap(`The window moves to spot ${start}. total starts over at 0.`, { line: 4, vars: { k, start, total: 0, steps }, ask });
        }
        const seen = [];
        for (let j = start; j < start + k; j++) {
          total += nums[j];
          steps += 1;
          seen.push(nums[j]);
          if (s.has('pj')) s.set('pj', { x: X(j) });
          else s.pointer('pj', X(j), 194, 'j', { dir: 'up' });
          s.tone('n' + j, 'active');
          s.set('tot', { text: total });
          s.set('st', { text: steps });
          s.set('expr', { text: seen.join(' + ') });
          let say = `Add ${nums[j]}. total is ${total}.`;
          if (j === start + k - 1 && (best === null || total > best)) {
            best = total;
            s.set('best', { text: best, tone: 'ok' });
            say += ' That is the new best.';
          }
          s.snap(say, { line: j === start + k - 1 ? 8 : 6, vars: { k, start, j, total, steps } });
        }
      }
      s.del('pj');
      s.clearTones();
      s.set('expr', { text: '' });
      s.tone('best', 'ok');
      s.snap(`The best total is ${best}. That took ${steps} steps.`, { line: 9, vars: { k, steps }, out: String(best) });
    },
  });

  Viz.register('m13-window-slide', {
    title: 'The window slides and fixes its total',
    size: [560, 236],
    code: py`
      def best_run(nums, k):
          if k > len(nums):
              return None
          total = sum(nums[:k])
          best = total
          for i in range(k, len(nums)):
              total = total + nums[i] - nums[i - k]
              best = max(best, total)
          return best
    `,
    inputs: [NUM_INPUT('4 2 7 1 6 3'), K_INPUT],
    tryInputs: [
      { nums: '', k: 3 }, { nums: '5', k: 1 }, { nums: '5', k: 2 }, { nums: '1 2 3', k: 3 },
      { nums: '3 3 3 3', k: 2 }, { nums: 'fish', k: 1 }, { nums: '-4 -2 -7 -1', k: 2 }, { nums: '0 0 0 0 0 0', k: 1 },
    ],
    build(s, p) {
      const nums = readNums(p.nums);
      const n = nums.length;
      const k = toInt(p.k, 1, 6, 3);
      const X = windowStage(s, nums, k);

      if (k > n) {
        s.snap(`k is ${k}, but the list has ${items(n)}. No window fits, so the answer is None.`, { line: 3, vars: { k, steps: 0 }, out: 'None' });
        return;
      }

      let total = 0;
      for (let i = 0; i < k; i++) { total += nums[i]; s.tone('n' + i, 'active'); }
      let best = total, steps = k;
      s.set('tot', { text: total });
      s.set('st', { text: steps });
      s.set('expr', { text: nums.slice(0, k).join(' + ') });
      s.snap(`First, add the ${items(k)} in the first window. That takes ${k} ${k === 1 ? 'step' : 'steps'}.`, { line: 4, vars: { k, total, steps } });
      s.set('best', { text: best, tone: 'ok' });
      s.snap(`This is the only window so far, so best is ${best}.`, { line: 5, vars: { k, total, best, steps } });

      for (let i = k; i < n; i++) {
        const out = nums[i - k], inn = nums[i];
        const next = total + inn - out;
        s.clearTones();
        s.tone('best', 'ok');
        for (let c = i - k + 1; c < i; c++) s.tone('n' + c, 'active');
        s.tone('n' + (i - k), 'bad');
        s.tone('n' + i, 'warn');
        if (s.has('pi')) s.set('pi', { x: X(i) });
        else s.pointer('pi', X(i), 194, 'i', { dir: 'up' });
        s.set('expr', { text: `${total} - ${out} + ${inn} = ?` });
        const q = pick(next, [total + inn, total - out, total + out + inn], total + i);
        s.snap(`Next, ${out} leaves on the left, and ${inn} enters on the right.`, {
          line: 6, vars: { k, i, total, best, steps },
          ask: i - k < 3 ? {
            q: `The total is ${total}. ${out} leaves and ${inn} enters. What is the new total?`,
            options: q.options, answer: q.answer,
            why: `Take away ${out} and add ${inn}. ${total} - ${out} + ${inn} is ${next}. The others stay counted.`,
          } : null,
        });
        total = next;
        steps += 2;
        s.set('win', { x: WIN.x(X, i - k + 1) });
        s.set('tot', { text: total });
        s.set('st', { text: steps });
        s.set('expr', { text: `${total + out - inn} - ${out} + ${inn} = ${total}` });
        ruleOut(s, 'n' + (i - k));
        s.tone('n' + i, 'active');
        s.snap(`One take-away and one add: 2 steps. total is now ${total}.`, { line: 7, vars: { k, i, total, best, steps } });
        if (total > best) {
          best = total;
          s.set('best', { text: best });
          s.pulse('best');
          s.snap(`${total} beats the old best, so best changes.`, { line: 8, vars: { k, i, total, best, steps } });
        }
      }
      s.del('pi');
      s.clearTones();
      s.tone('best', 'ok');
      s.set('expr', { text: '' });
      s.snap(`The best total is ${best}. That took ${steps} steps. The slow way took ${slowWindowSteps(n, k)}.`, { line: 9, vars: { k, best, steps }, out: String(best) });
    },
  });

  Viz.register('m13-window-stretch', {
    title: 'A stretchy window grows and shrinks',
    size: [560, 250],
    code: py`
      def longest(word):
          seen = set()
          left = 0
          best = 0
          for right in range(len(word)):
              while word[right] in seen:
                  seen.remove(word[left])
                  left = left + 1
              seen.add(word[right])
              best = max(best, right - left + 1)
          return best
    `,
    inputs: [{ key: 'word', label: 'word (up to 8 letters)', type: 'text', value: 'robots', size: 12 }],
    tryInputs: [
      { word: '' }, { word: 'a' }, { word: 'aaaa' }, { word: 'abcdefgh' }, { word: 'abba' },
      { word: 'Aa 1 1' }, { word: 'a much longer sentence here' }, { word: '    ' },
    ],
    build(s, p) {
      const word = String(p.word == null ? '' : p.word).replace(/\s+/g, '').slice(0, 8).split('');
      const n = word.length;
      const o = { y: 150 };
      const X = i => s.slotX(i, n, o);
      s.row('c', word, o);
      s.box('best', 54, 36, 0, { w: 64, h: 36, sub: 'best' });
      s.box('st', 506, 36, 0, { w: 64, h: 36, sub: 'steps' });
      s.text('win', 280, 36, '', { size: 17, weight: 700 });

      if (n === 0) {
        s.snap('The word is empty. The loop never starts, so best stays 0.', { line: 11, vars: { best: 0, steps: 0 }, out: '0' });
        return;
      }

      const box = { y: 96, h: 90 };
      const edges = (l, r) => ({ x: X(l) - 34, w: (r - l + 1) * 58 + 10 });
      let left = 0, best = 0, bestAt = 0, steps = 0;
      const seen = [];
      const vars = right => ({ left, right, seen: '{' + seen.join(', ') + '}', best, steps });
      const label = (l, r) => s.set('win', { text: `window: ${word.slice(l, r + 1).join('')}` });

      s.area('wa', X(0) - 34, box.y, 68, box.h, '', { opacity: 0 });
      s.pointer('pl', X(0), 112, 'left', { dir: 'down' });
      s.pointer('pr', X(0), 208, 'right', { dir: 'up' });
      s.snap('Both ends start at spot 0. The window holds nothing yet.', { line: 5, vars: vars(0) });

      let asked = 0;
      for (let right = 0; right < n; right++) {
        const ch = word[right];
        s.set('pr', { x: X(right) });
        s.tone('c' + right, 'active');
        if (seen.includes(ch)) {
          const q = {
            q: `The window already holds ${ch}. What must the code do first?`,
            options: [`Drop letters from the left until the old ${ch} is gone`, 'Throw the whole window away', `Add ${ch} anyway`],
            answer: 0,
            why: `The rule says no repeats. Dropping from the left keeps as much of the window as it can.`,
          };
          s.tone('c' + right, 'warn');
          s.snap(`right reaches ${ch}. That letter is in the window already.`, { line: 6, vars: vars(right), ask: asked < 3 ? q : null });
          asked += 1;
          let firstDrop = true;
          while (seen.includes(ch)) {
            const gone = word[left];
            const more = gone !== ch;
            const ask = firstDrop && more && asked < 3 ? {
              q: `${gone} is about to leave. Will that be enough?`,
              options: ['Yes. One drop is always enough', `No. The old ${ch} is still in the window`],
              answer: 1,
              why: `The old ${ch} sits further along. So the code uses while, not if, and keeps dropping.`,
            } : null;
            if (ask) {
              asked += 1;
              s.snap(`The first letter to drop is ${gone}.`, { line: 7, vars: vars(right), ask });
            }
            firstDrop = false;
            seen.splice(seen.indexOf(gone), 1);
            ruleOut(s, 'c' + left);
            left += 1;
            steps += 1;
            s.set('st', { text: steps });
            s.set('pl', { x: X(Math.min(left, n - 1)) });
            if (left <= right - 1) {
              const e = edges(left, right - 1);
              s.set('wa', { x: e.x, w: e.w });
              label(left, right - 1);
            } else {
              s.set('wa', { opacity: 0 });
              s.set('win', { text: 'window: empty' });
            }
            s.snap(`${gone} leaves. left moves to spot ${left}. That is one step.`, { line: 8, vars: vars(right) });
          }
        } else if (right === 1 && asked === 0) {
          const q = pick(2, [1, 3], 1);
          s.snap(`right reaches ${ch}. That letter is not in the window.`, {
            line: 6, vars: vars(right),
            ask: {
              q: `No repeat here. How many letters will the window hold now?`,
              options: q.options, answer: q.answer,
              why: `${ch} joins the letter that is already in. So the window grows to 2.`,
            },
          });
          asked += 1;
        }
        seen.push(ch);
        steps += 1;
        s.set('st', { text: steps });
        const e = edges(left, right);
        s.set('wa', { x: e.x, w: e.w, opacity: 1 });
        label(left, right);
        s.tone('c' + right, 'active');
        const size = right - left + 1;
        let say = `${ch} joins. The window holds ${size === 1 ? '1 letter' : size + ' letters'}.`;
        if (size > best) {
          best = size;
          bestAt = left;
          s.set('best', { text: best, tone: 'ok' });
          s.pulse('best');
          say += ' That is the new best.';
        }
        s.snap(say, { line: right === 0 || size === best ? 10 : 9, vars: vars(right) });
      }
      s.del('pl', 'pr');
      const e = edges(bestAt, bestAt + best - 1);
      s.set('wa', { x: e.x, w: e.w, opacity: 1 });
      s.set('win', { text: `longest: ${word.slice(bestAt, bestAt + best).join('')}` });
      word.forEach((_, k) => {
        if (k >= bestAt && k < bestAt + best) s.set('c' + k, { tone: 'ok', scale: 1, opacity: 1 });
        else ruleOut(s, 'c' + k);
      });
      s.snap(`The longest stretch has ${best === 1 ? '1 letter' : best + ' letters'}. That took ${steps} steps. Trying every start took ${slowLongestSteps(word)}.`, { line: 11, vars: { best, steps }, out: String(best) });
    },
  });

  // ---------------------------------------------------------- lesson 13.3
  const prefixOf = nums => nums.reduce((acc, v) => { acc.push(acc[acc.length - 1] + v); return acc; }, [0]);

  Viz.register('m13-prefix-build', {
    title: 'Build the prefix list once',
    size: [560, 264],
    code: py`
      prefix = [0]
      for n in nums:
          prefix.append(prefix[-1] + n)
      print(prefix)
    `,
    inputs: [NUM_INPUT('4 1 3 2 6 5')],
    tryInputs: [{ nums: '' }, { nums: '7' }, { nums: '2 2 2' }, { nums: '-3 5 -1 0' }, { nums: 'hat' }, { nums: '99 99 99 99 99 99 99' }],
    build(s, p) {
      const nums = readNums(p.nums);
      const n = nums.length;
      const pre = prefixOf(nums);
      const oN = { y: 104 }, oP = { y: 200 };
      s.text('ln', 66, 104, 'nums', { size: 15, mono: true });
      s.text('lp', 40, 200, 'prefix', { size: 15, mono: true });
      s.row('n', nums, oN);
      s.row('s', pre.map(() => ''), oP);
      s.box('st', 506, 36, 0, { w: 64, h: 36, sub: 'steps' });
      s.text('expr', 250, 36, '', { size: 16, weight: 700 });

      s.set('s0', { text: 0, tone: 'ok' });
      const shown = i => show(pre.slice(0, i + 1));
      s.snap('prefix starts with one 0. Before any item, the total is 0.', { line: 1, vars: { prefix: shown(0), steps: 0 } });
      if (n === 0) {
        s.snap('The list is empty, so the loop never runs.', { line: 4, vars: { prefix: '[0]', steps: 0 }, out: '[0]' });
        return;
      }

      for (let i = 0; i < n; i++) {
        const before = pre[i], v = nums[i], next = pre[i + 1];
        for (let k = 0; k < i; k++) s.tone('n' + k, 'default');
        s.tone('n' + i, 'active');
        s.tone('s' + i, 'active');
        for (let k = 0; k < i; k++) s.tone('s' + k, 'default');
        s.set('expr', { text: `${before} + ${v} = ?` });
        if (i === 1 || i === 3) {
          const q = pick(next, [v, before, next + v], next + i);
          s.snap(`Next up is ${v}. The last total is ${before}.`, {
            line: 2, vars: { n: v, prefix: shown(i), steps: i },
            ask: {
              q: `The last total is ${before}, and the next item is ${v}. What goes in prefix[${i + 1}]?`,
              options: q.options, answer: q.answer,
              why: `Each new total is the last total plus one item: ${before} + ${v} is ${next}.`,
            },
          });
        }
        s.set('expr', { text: `${before} + ${v} = ${next}` });
        s.set('s' + (i + 1), { text: next, tone: 'ok' });
        s.pulse('s' + (i + 1));
        s.set('st', { text: i + 1 });
        s.snap(`${before} + ${v} is ${next}. One add gives one new total.`, { line: 3, vars: { n: v, prefix: shown(i + 1), steps: i + 1 } });
      }

      s.clearTones();
      s.set('expr', { text: '' });
      const out = show(pre);
      if (n >= 3) {
        const q = pick('The total of the first 3 items', ['The item at spot 3', 'The total of the first 4 items'], 1);
        s.snap(`prefix[3] holds ${pre[3]}.`, {
          line: 4, vars: { prefix: out, steps: n }, out,
          ask: {
            q: 'What does prefix[3] tell you?',
            options: q.options, answer: q.answer,
            why: 'prefix[i] adds up the i items before spot i. So prefix[3] covers spots 0, 1 and 2.',
          },
        });
        s.tone(['n0', 'n1', 'n2'], 'active');
        s.tone('s3', 'ok');
        s.snap(`${nums[0]} + ${nums[1]} + ${nums[2]} is ${pre[3]}. Each box sits at the edge of the items it covers.`, { line: 4, vars: { prefix: out, steps: n }, out });
        s.clearTones();
      }
      s.snap(`${items(n)} gave ${n + 1} totals, for ${n} ${n === 1 ? 'step' : 'steps'}. You only build this once.`, { line: 4, vars: { prefix: out, steps: n }, out });
    },
  });

  Viz.register('m13-range-race', {
    title: 'One range, two ways',
    size: [560, 276],
    code: py`
      total = 0
      for i in range(a, b):
          total = total + nums[i]
      print(total)

      print(prefix[b] - prefix[a])
    `,
    inputs: [
      NUM_INPUT('4 1 3 2 6 5'),
      { key: 'a', label: 'a (start)', type: 'number', value: 1, min: 0, max: 6 },
      { key: 'b', label: 'b (stop before)', type: 'number', value: 5, min: 0, max: 6 },
    ],
    tryInputs: [
      { nums: '', a: 0, b: 0 }, { nums: '7', a: 0, b: 1 }, { nums: '7', a: 3, b: 6 }, { nums: '2 2 2', a: 0, b: 3 },
      { nums: '4 1 3', a: 2, b: 2 }, { nums: '4 1 3 2', a: 3, b: 1 }, { nums: '-3 5 -1 0', a: 0, b: 2 }, { nums: 'hat', a: 1, b: 2 },
      { nums: '4 1 3 2 6 5', a: 0, b: 6 }, { nums: '4 1 3 2 6 5', a: 0, b: 1 },
    ],
    build(s, p) {
      const nums = readNums(p.nums);
      const n = nums.length;
      const pre = prefixOf(nums);
      let a = toInt(p.a, 0, 6, 0), b = toInt(p.b, 0, 6, n);
      const oN = { y: 100 }, oP = { y: 215 };
      const XN = i => s.slotX(i, n, oN);
      const XP = i => s.slotX(i, n + 1, oP);
      s.text('ln', 66, 100, 'nums', { size: 15, mono: true });
      s.text('lp', 40, 215, 'prefix', { size: 15, mono: true });
      s.row('n', nums, oN);
      s.row('s', pre, oP);
      s.box('slow', 54, 34, 0, { w: 64, h: 36, sub: 'slow' });
      s.box('fast', 506, 34, 0, { w: 64, h: 36, sub: 'prefix' });
      s.text('expr', 280, 20, '', { size: 16, weight: 700 });

      const notes = [];
      if (a > n || b > n) {
        a = Math.min(a, n); b = Math.min(b, n);
        notes.push(`The list has ${items(n)}, so a and b must stay at ${n} or less.`);
      }
      if (a > b) {
        const t = a; a = b; b = t;
        notes.push(`a must come first, so a becomes ${a} and b becomes ${b}.`);
      }
      const vars = () => ({ a, b, slow: slowCount, prefix: fastCount });
      let slowCount = 0, fastCount = 0;
      notes.forEach(x => s.snap(x, { vars: vars() }));

      const want = pre[b] - pre[a];
      s.pointer('pa', XP(a), 185, a === b ? 'a, b' : 'a', { dir: 'down' });
      if (a !== b) s.pointer('pb', XP(b), 185, 'b', { dir: 'down' });

      if (a === b) {
        s.snap(`a and b are both ${a}. The range holds nothing, so the total is 0.`, { line: 2, vars: vars(), out: '0' });
        s.tone('s' + a, 'active');
        s.snap(`prefix[${b}] - prefix[${a}] is 0 too. Both ways agree.`, { line: 6, vars: vars(), out: '0\n0' });
        return;
      }

      const len = b - a;
      const q0 = pick(len, [len + 1, n, len > 1 ? len - 1 : n + 1], len + a);
      s.snap(`You want the total from spot ${a} up to spot ${b}. Spot ${b} stays out, like in a slice.`, {
        line: 1, vars: vars(),
        ask: {
          q: 'How many adds will the slow way need?',
          options: q0.options, answer: q0.answer,
          why: `It adds spots ${a} to ${b - 1}, and ${b} - ${a} is ${len}. Spot ${b} stays out.`,
        },
      });

      let total = 0;
      const seen = [];
      for (let i = a; i < b; i++) {
        total += nums[i];
        seen.push(nums[i]);
        slowCount += 1;
        if (s.has('pj')) s.set('pj', { x: XN(i) });
        else s.pointer('pj', XN(i), 68, 'i', { dir: 'down' });
        s.tone('n' + i, 'active');
        s.set('slow', { text: slowCount });
        s.set('expr', { text: `total = ${total}` });
        s.snap(`Add ${nums[i]}. total is ${total}.`, { line: 3, vars: vars() });
      }
      s.del('pj');
      s.snap(`The slow way gets ${total}, after ${slowCount} ${slowCount === 1 ? 'add' : 'adds'}.`, { line: 4, vars: vars(), out: String(total) });

      s.clearTones();
      s.set('expr', { text: '' });
      const q1 = pick(`prefix[${b}] - prefix[${a}]`, [
        `prefix[${b - 1}] - prefix[${a}]`,
        `prefix[${b}] + prefix[${a}]`,
        `prefix[${b}] - prefix[${a + 1}]`,
      ], a + b);
      s.snap('Now the prefix way. It uses the list you built.', {
        line: 6, vars: vars(), out: String(total),
        ask: {
          q: 'Which line gives the same total?',
          options: q1.options, answer: q1.answer,
          why: `prefix[${b}] covers all items before spot ${b}. Take away all items before spot ${a}, and the range is left.`,
        },
      });

      for (let i = 0; i < b; i++) s.tone('n' + i, 'warn');
      s.tone('s' + b, 'active');
      s.set('expr', { text: `prefix[${b}] = ${pre[b]}` });
      s.snap(`prefix[${b}] holds ${pre[b]}. That is the total of the ${firstN(b)}.`, { line: 6, vars: vars(), out: String(total) });

      for (let i = 0; i < a; i++) ruleOut(s, 'n' + i);
      s.tone('s' + a, 'active');
      s.set('expr', { text: `prefix[${a}] = ${pre[a]}` });
      s.snap(a === 0
        ? `prefix[0] holds 0. There is nothing before spot 0 to take away.`
        : `prefix[${a}] holds ${pre[a]}. That covers the ${firstN(a)}, which you do not want.`, { line: 6, vars: vars(), out: String(total) });

      fastCount = 1;
      s.set('fast', { text: fastCount });
      for (let i = a; i < b; i++) s.tone('n' + i, 'ok');
      s.tone('s' + a, 'default');
      s.tone('s' + b, 'ok');
      s.set('expr', { text: `${pre[b]} - ${pre[a]} = ${want}` });
      const out = `${total}\n${want}`;
      s.snap(`One take-away gives ${want}. That is the same answer in one step.`, { line: 6, vars: vars(), out });

      const slowTen = len * 10, fastTen = n + 10;
      const q2 = pick(`Slow ${slowTen}, prefix ${fastTen}`, [`Slow ${slowTen}, prefix 10`, `Slow ${len}, prefix 1`], len);
      s.snap(`Building prefix took ${n} ${n === 1 ? 'add' : 'adds'}, but only once.`, {
        line: 6, vars: vars(), out,
        ask: {
          q: `Your friend asks this same range 10 times. How many steps in all?`,
          options: q2.options, answer: q2.answer,
          why: `Slow pays ${len} each time. Prefix pays ${n} once to build, then 1 each time.`,
        },
      });
      s.snap(`More asks help prefix: slow pays ${len} each ask, and prefix pays 1.`, { line: 6, vars: vars(), out });
    },
  });
})();
