/* The moving picture on the home page: a short bubble sort that plays once. */
Viz.register('hero-sort', {
  title: 'Sorting, one swap at a time',
  size: [520, 250],
  build(s) {
    const a = [5, 2, 8, 3, 7, 1];
    const base = 208, gap = 66, left = 95, unit = 19;
    const xOf = i => left + i * gap;
    a.forEach((v, i) => s.bar(`b${v}`, xOf(i), base, v * unit, v, { w: 42 }));
    s.text('floor', 260, 228, 'Biggest bars move to the end', { size: 15, tone: 'muted' });
    s.snap('These 6 numbers are out of order.');
    let swapped = true, end = a.length - 1;
    while (swapped) {
      swapped = false;
      for (let i = 0; i < end; i++) {
        const x = `b${a[i]}`, y = `b${a[i + 1]}`;
        s.tone([x, y], 'active');
        if (a[i] > a[i + 1]) {
          s.snap(`${a[i]} is bigger than ${a[i + 1]}, so they swap.`);
          s.swap(x, y, 26);
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          s.snap(`Now ${a[i]} comes first.`);
          swapped = true;
        } else {
          s.snap(`${a[i]} is smaller than ${a[i + 1]}, so they stay.`);
        }
        s.tone([x, y], 'default');
      }
      s.tone(`b${a[end]}`, 'ok');
      end -= 1;
    }
    a.forEach(v => s.tone(`b${v}`, 'ok'));
    s.snap('Sorted, from small to big. Programs are made of small steps like these.');
  },
});
