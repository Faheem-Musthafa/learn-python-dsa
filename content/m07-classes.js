/* Module 7: Classes and Objects. Part 1 (Learn Python). */
Course.module({
  id: 'm07-classes',
  num: 7, part: 1, level: 'B',
  title: 'Classes and Objects',
  blurb: 'Make your own kinds of things in Python, and link them together.',
  needs: ['m04-functions', 'm05-lists-strings'],
});

// ------------------------------------------------------------------ lesson 7.1
Course.lesson('m07-classes', {
  id: '7-1-class-and-object',
  num: '7.1',
  title: 'Classes: a cookie cutter for objects',
  goal: 'You can write a class with `__init__` and make objects from it.',
  mins: 12,
  steps: [
    { t: 'h', text: 'How do you keep facts together?' },
    { t: 'p', text: 'Say you have 2 pets. Each pet has a name and an age. You could use 4 variables.' },
    { t: 'code', caption: 'This works. But 100 pets would need 200 variables!',
      code: py`
        pet1_name = "Rex"
        pet1_age = 3
        pet2_name = "Mia"
        pet2_age = 5
        print(pet1_name, pet2_age)
      `,
      output: 'Rex 5' },
    { t: 'p', text: 'Here is a better way. Write a plan for a pet once. Then use the plan to make as many pets as you like.' },
    { t: 'analogy', title: 'Picture this', text: 'A cookie cutter is a plan for a cookie. One cutter makes many cookies. Bite one cookie, and the others stay whole. Real cookies all look the same. In Python, each one can hold its own values.' },
    { t: 'words', items: [
      { word: 'class', means: 'The plan for a kind of thing, like a cookie cutter.' },
      { word: 'object', means: 'One thing made from a class, like one cookie.' },
      { word: 'attribute', means: 'A name tag that belongs to an object, like its name or age.', say: 'AT-rib-yoot' },
    ] },
    { t: 'q', id: 'cutter-or-cookie', type: 'mcq', level: 1,
      q: 'In the cookie picture, which one is the [[class]]?',
      options: [
        'The cookie cutter',
        { text: 'One cookie', why: 'One cookie is one thing made from the plan. That is an object. Many people mix up the two.' },
        { text: 'The name on a cookie', why: 'A name kept inside a cookie is an attribute. The class is the plan for all the cookies.' },
      ],
      answer: 0,
      explain: 'The cutter is the plan, so it is the class. Each cookie it makes is an object.',
      hints: ['Which one do you use to make the others?'],
    },
    { t: 'viz', name: 'm07-cookie-cutter', caption: 'Press Play, or use the arrows to step through it. Watch where `self` points.' },

    { t: 'h', text: 'Build a class in 3 moves' },
    { t: 'steps', title: 'The Pet class, one move at a time', noun: 'Move', items: [
      { label: 'Name the plan', text: 'Write `class`, then a name with a capital letter, then a colon.', code: 'class Pet:' },
      { label: 'Write the set-up step', text: '`__init__` runs each time you make an object. `self` means the object being set up right now.',
        code: py`
          class Pet:
              def __init__(self, name, age):
                  self.name = name
                  self.age = age
        ` },
      { label: 'Make objects', text: 'Use the class name like a function. Python runs `__init__` for you and fills in `self`.', code: 'a = Pet("Rex", 3)' },
    ] },
    { t: 'tip', title: 'How to say it', text: '`__init__` has 2 underscores on each side. Say "init". It is short for "initialise", which means "set up".' },
    { t: 'code', caption: 'A dot reads or changes an [[attribute]]. Run it. Then make a third pet and print its name.',
      code: py`
        class Pet:
            def __init__(self, name, age):
                self.name = name
                self.age = age

        a = Pet("Rex", 3)
        b = Pet("Mia", 5)
        print(a.name)
        print(b.age)
        a.age = 4
        print(a.age)
      `,
      output: 'Rex\n5\n4' },
    { t: 'q', id: 'each-has-its-own', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        class Pet:
            def __init__(self, name):
                self.name = name

        a = Pet("Rex")
        b = Pet("Mia")
        a.name = "Max"
        print(b.name)
      `,
      options: [
        { text: 'Mia', why: '' },
        { text: 'Max', why: '`a` and `b` are 2 different objects. A class is a plan, not one shared pet.' },
        { text: 'Rex', why: '`b` starts as "Mia", and nothing changes it. "Rex" belongs to `a`.' },
      ],
      answer: 0,
      explain: 'Each [[object]] keeps its own values. Changing `a.name` leaves `b` alone.',
      hints: ['Which object does line 7 change?', 'Is `b` the same object as `a`?'],
    },
    { t: 'q', id: 'when-init-runs', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        class Bell:
            def __init__(self):
                print("Ding")

        print("Start")
        b = Bell()
        c = Bell()
      `,
      options: [
        { text: 'Ding\nStart\nDing\nDing', why: 'Writing a class does not run `__init__`. It runs only when you make an object.' },
        { text: 'Start\nDing', why: '`__init__` runs once for each new object. This code makes 2 objects.' },
        { text: 'Start\nDing\nDing', why: '' },
      ],
      answer: 2,
      explain: 'The class is only a plan, so Start comes first. Then each new object runs `__init__` once.',
      hints: ['Does writing `def` run the code inside it?', 'Count how many times the code uses `Bell()`.'],
    },

    { t: 'h', text: 'Why do you need self?' },
    { t: 'code', error: true, caption: 'This one stops with an error. Run it and read the last line. `AttributeError` means the object has no [[attribute]] with that name.',
      code: py`
        class Pet:
            def __init__(self, name):
                name = name

        a = Pet("Rex")
        print(a.name)
      ` },
    { t: 'trap',
      think: '`name = name` keeps the name in the object.',
      real: 'It only moves a tag inside `__init__`. That tag is gone when `__init__` ends. Write `self.name = name` instead.',
      code: py`
        class Pet:
            def __init__(self, name):
                self.name = name
      ` },
    { t: 'tip', title: 'Is self a special word?', text: 'No. `self` is an ordinary name, and Python has no rule about it. Python hands the new object to the first parameter, whatever you call it. Everyone writes `self`, so you should too.' },
    { t: 'code', caption: 'Here `me` does the same job as `self`. It works, but please use `self` in your own code.',
      code: py`
        class Pet:
            def __init__(me, name):
                me.name = name

        a = Pet("Rex")
        print(a.name)
      `,
      output: 'Rex' },
    { t: 'q', id: 'build-a-book', type: 'order', level: 2,
      q: 'Put the lines in order. One line is not needed.',
      lines: [
        'class Book:',
        '    def __init__(self, title):',
        '        self.title = title',
        'b = Book("Dune")',
        'print(b.title)',
      ],
      extra: ['        title = title'],
      output: 'Dune',
      explain: 'Write the plan first, then make the object, then read its [[attribute]]. The line `title = title` keeps nothing in the object.',
      hints: ['Python must read the class before it can use it.', 'Which line puts the title inside the object?'],
    },
    { t: 'big', text: 'A class is the plan. An object is one thing made from that plan.' },
  ],
  recap: [
    'You can write a class with `__init__`.',
    'You can make many objects from one class.',
    'You can read and change attributes with a dot.',
  ],
  practice: [
    { id: 'match-words', type: 'match', level: 1,
      q: 'Match each word to what it means.',
      pairs: [
        ['`class`', 'The plan, like a cookie cutter'],
        ['object', 'One thing made from the plan'],
        ['`__init__`', 'The set-up step for each new object'],
        ['`self`', 'The object being set up right now'],
      ],
      explain: 'The class is the plan, and each object comes from it. `__init__` sets up each object, and `self` means that object.',
      hints: ['Start with the two you know best: the cutter and the cookie.'],
    },
    { id: 'how-many-values', type: 'mcq', level: 1,
      q: '`__init__` has 3 parameters: `self`, `name` and `age`. How many values do you type in `Pet(...)`?',
      options: [
        { text: '3', why: 'You do not type `self`. Python fills it in for you.' },
        '2',
        { text: '1', why: '`__init__` needs a name and an age. Python fills in only `self`.' },
      ],
      answer: 1,
      explain: 'You type the name and the age. Python hands over `self` on its own.',
      hints: ['Look at `Pet("Rex", 3)`.', 'Who fills in `self`?'],
    },
    { id: 'fill-car', type: 'fill', level: 2,
      q: 'Fill the gaps, so that the program prints red.',
      code: py`
        class Car:
            def ____(self, colour):
                self.____ = colour

        c = Car("red")
        print(c.colour)
      `,
      blanks: ['__init__', 'colour'],
      output: 'red',
      explain: 'The set-up step is always called `__init__`. The last line reads `c.colour`, so the attribute needs that name.',
      hints: ['What is the name of the set-up step?', 'Look at the last line. Which attribute does it read?'],
    },
    { id: 'fix-score', type: 'fix', level: 2,
      q: 'Python got confused on the last line. Fix the class, so that this prints 7.',
      code: py`
        class Player:
            def __init__(self, name, score):
                self.name = name
                score = score

        p = Player("Ana", 7)
        print(p.score)
      `,
      answer: py`
        class Player:
            def __init__(self, name, score):
                self.name = name
                self.score = score

        p = Player("Ana", 7)
        print(p.score)
      `,
      wantOutput: '7',
      explain: 'Without `self.`, the only tag on the score vanishes when `__init__` ends. `self.score = score` puts a tag on the object.',
      hints: ['Compare the two lines inside `__init__`.', 'One of those lines is missing `self.` at the start.'],
    },
    { id: 'write-point', type: 'write', level: 2,
      q: 'Write a class called `Point`. `Point(2, 5)` should make an object with `x` set to 2 and `y` set to 5.',
      starter: 'class Point:\n    # Write __init__ here. pass means: do nothing yet.\n    pass\n',
      answer: py`
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y
      `,
      tests: [
        { label: 'Point(2, 5).x is 2', call: 'Point(2, 5).x', want: '2' },
        { label: 'Point(2, 5).y is 5', call: 'Point(2, 5).y', want: '5' },
        { label: 'Point(0, 9).y is 9', call: 'Point(0, 9).y', want: '9' },
      ],
      explain: '`__init__` takes `self`, `x` and `y`. It gives the object a tag for each value.',
      hints: ['Start with `def __init__(self, x, y):`.', 'Make each tag with a line like `self.x = x`.'],
    },
    { id: 'two-names-one-pet', type: 'predict', level: 3,
      q: 'Stretch: what will the screen show?',
      code: py`
        class Pet:
            def __init__(self, name):
                self.name = name

        a = Pet("Rex")
        b = a
        b.name = "Max"
        print(a.name)
      `,
      options: [
        { text: 'Rex', why: '`b = a` does not make a copy. It sticks a second name on the same object.' },
        { text: 'Max', why: '' },
        { text: 'Rex\nMax', why: 'The code has one `print`, and an attribute is on one value at a time. The tag left "Rex" behind.' },
      ],
      answer: 1,
      explain: 'There is only one `Pet()` call, so there is only one object. Both `a` and `b` point at it.',
      hints: ['How many times does the code make a new object?', 'Lists work the same way when you write `b = a`.'],
    },
    { id: 'song-list', type: 'write', level: 3,
      q: 'Stretch: a list can hold objects. Finish the class, so that the loop prints each title.',
      starter: py`
        class Song:
            pass

        songs = [Song("Sun"), Song("Rain"), Song("Snow")]
        for s in songs:
            print(s.title)
      `,
      answer: py`
        class Song:
            def __init__(self, title):
                self.title = title

        songs = [Song("Sun"), Song("Rain"), Song("Snow")]
        for s in songs:
            print(s.title)
      `,
      wantOutput: 'Sun\nRain\nSnow',
      explain: 'Each `Song` call makes a new object with its own title. The loop visits each object in the list.',
      hints: ['The code makes each song with one value, so `__init__` needs `self` and `title`.', 'The loop reads `s.title`, so write `self.title = title`.'],
    },
  ],
});

// ------------------------------------------------------------------ lesson 7.2
Course.lesson('m07-classes', {
  id: '7-2-methods',
  num: '7.2',
  title: 'Methods: give your objects jobs to do',
  goal: 'You can write methods, and make `print`, `len`, `==` and `<` work on your objects.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How can an object do a job?' },
    { t: 'p', text: 'You have seen tools that belong to a thing. `name.upper()` asks a string for a capital copy. Now you can write tools for your own class.' },
    { t: 'words', items: [
      { word: 'method', means: 'A function that belongs to a thing, like `name.upper()`.' },
      { word: 'special method', means: 'A method with 2 underscores on each side. Python calls it for you.' },
    ] },
    { t: 'code', caption: 'Run it. Then add a line that calls `a.add(10)`, and guess the new score first.',
      code: py`
        class Player:
            def __init__(self, name):
                self.name = name
                self.score = 0

            def add(self, n):
                self.score = self.score + n

        a = Player("Ana")
        a.add(5)
        a.add(1)
        print(a.score)
      `,
      output: '6' },
    { t: 'p', text: 'A [[method]] sits inside the class. Its first parameter is `self`. When you write `a.add(5)`, the thing before the dot becomes `self`.' },
    { t: 'viz', name: 'm07-method-self', caption: 'Each call changes only the object before the dot.' },
    { t: 'q', id: 'two-counters', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        class Counter:
            def __init__(self):
                self.n = 0

            def up(self):
                self.n = self.n + 1

        a = Counter()
        b = Counter()
        a.up()
        a.up()
        b.up()
        print(a.n, b.n)
      `,
      options: [
        { text: '3 3', why: 'That would mean they share one count. Each object has its own `n`.' },
        { text: '2 1', why: '' },
        { text: '1 1', why: 'A method can run many times. `a.up()` runs twice, so `a.n` goes up twice.' },
      ],
      answer: 1,
      explain: '`a.up()` runs twice and `b.up()` runs once. Each call changes only the object before the dot.',
      hints: ['Count the calls that start with `a.`.', 'Now count the calls that start with `b.`.'],
    },

    { t: 'h', text: 'What happens when you print an object?' },
    { t: 'p', text: 'Python does not know how a Pet should look as text. So it shows the kind of object and where it lives in memory.' },
    { t: 'code', run: false, caption: 'This is not much help to you.',
      code: py`
        class Pet:
            def __init__(self, name):
                self.name = name

        p = Pet("Rex")
        print(p)
        # Shows something like this:
        # <__main__.Pet object at 0x7f3a2c0>
      ` },
    { t: 'p', text: 'You can fix this with a [[special method]]. You write it once, and Python calls it when it needs it. Here are the 4 you need to know.' },
    { t: 'table', caption: 'What you write, and what Python calls',
      head: ['You write', 'Python calls', 'In plain words'],
      rows: [
        ['`print(p)`', '`p.__repr__()`', 'Show `p` as text. "repr" is short for "represent".'],
        ['`len(b)`', '`b.__len__()`', 'Say how many things `b` holds. "len" is short for "length".'],
        ['`a == b`', '`a.__eq__(b)`', 'Ask if `a` and `b` count as equal. "eq" means "equal".'],
        ['`a < b`', '`a.__lt__(b)`', 'Ask if `a` comes before `b`. "lt" means "less than".'],
      ] },
    { t: 'tip', title: 'A small detail', text: '`print` looks for a method called `__str__` first. If there is none, it uses `__repr__`. We write only `__repr__` here.' },
    { t: 'code', caption: 'Now a Bag can show itself and count its things. Run it, then add a third thing.',
      code: py`
        class Bag:
            def __init__(self, owner):
                self.owner = owner
                self.items = []

            def add(self, item):
                self.items.append(item)

            def __repr__(self):
                return "Bag of " + self.owner

            def __len__(self):
                return len(self.items)

        b = Bag("Ana")
        b.add("pen")
        b.add("map")
        print(b)
        print(len(b))
      `,
      output: 'Bag of Ana\n2' },
    { t: 'trap',
      think: '`__repr__` should print the text.',
      real: 'It must `return` the text, and Python does the printing. If you print inside it, Python gets `None` back and stops with a `TypeError`.',
      code: py`
        def __repr__(self):
            return "Bag of " + self.owner
      ` },
    { t: 'q', id: 'fill-repr', type: 'fill', level: 2,
      q: 'Fill the gaps, so that `print` shows Pet Rex.',
      code: py`
        class Pet:
            def __init__(self, name):
                self.name = name

            def ____(self):
                ____ "Pet " + self.name

        print(Pet("Rex"))
      `,
      blanks: ['__repr__', 'return'],
      output: 'Pet Rex',
      explain: '`print` calls `__repr__` to get the text. The method must hand that text back with `return`.',
      hints: ['Which special method shows an object as text?', 'Does it print the text, or hand it back?'],
    },

    { t: 'h', text: 'When are 2 objects equal?' },
    { t: 'q', id: 'same-values-equal', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

        a = Point(1, 2)
        b = Point(1, 2)
        print(a == b)
      `,
      options: [
        { text: 'True', why: 'Python does not look inside the objects. It cannot guess that you want to compare `x` and `y`.' },
        { text: 'False', why: '' },
        { text: 'TypeError', why: '`==` works on any 2 objects. With no rule to use, it asks if they are one object.' },
      ],
      answer: 1,
      explain: 'These are 2 separate objects. With no `__eq__`, `==` only asks if both names point at one object.',
      hints: ['How many objects does this code make?', 'Has anyone told Python what "equal" means for a Point?'],
    },
    { t: 'code', caption: 'Now `__eq__` gives the rule. `other` is the object on the right of `==`.',
      code: py`
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __eq__(self, other):
                same_x = self.x == other.x
                same_y = self.y == other.y
                return same_x and same_y

        a = Point(1, 2)
        b = Point(1, 2)
        c = Point(9, 2)
        print(a == b)
        print(a == c)
      `,
      output: 'True\nFalse' },

    { t: 'h', text: 'Which object comes first?' },
    { t: 'p', text: 'Python cannot guess which Player comes first. `__lt__` gives it the rule. Step through this, then change the scores and try again.' },
    { t: 'viz', name: 'm07-less-than', caption: 'Change the scores above the picture. The answer changes too.' },
    { t: 'code', caption: '`sorted` uses `<` to compare, so `__lt__` lets it sort your objects. Try `>` in place of `<`, and guess first.',
      code: py`
        class Player:
            def __init__(self, name, score):
                self.name = name
                self.score = score

            def __repr__(self):
                return self.name

            def __lt__(self, other):
                return self.score < other.score

        team = [
            Player("Ana", 7),
            Player("Ben", 2),
            Player("Cy", 5),
        ]
        print(sorted(team))
      `,
      output: '[Ben, Cy, Ana]' },
    { t: 'big', text: 'Python turns `a < b` into a method call. You write the method, so you choose the rule.' },
  ],
  recap: [
    'You can write a method that changes an object.',
    'You know the object before the dot becomes `self`.',
    'You can write `__repr__`, `__len__`, `__eq__` and `__lt__`.',
  ],
  practice: [
    { id: 'which-special', type: 'match', level: 1,
      q: 'Match the code you write to the special method Python calls.',
      pairs: [
        ['`print(p)`', '`__repr__`'],
        ['`len(b)`', '`__len__`'],
        ['`a == b`', '`__eq__`'],
        ['`a < b`', '`__lt__`'],
      ],
      explain: 'Each name gives a clue: "len" is length, "eq" is equal, and "lt" is less than.',
      hints: ['Which one means "less than"?'],
    },
    { id: 'method-no-return', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        class Counter:
            def __init__(self):
                self.n = 0

            def up(self):
                self.n = self.n + 1

        a = Counter()
        x = a.up()
        print(x)
      `,
      options: [
        { text: '1', why: 'The method changes `self.n`, but it has no `return`. So it hands back nothing.' },
        { text: '0', why: '`up` has no `return`, so it does not hand back any number at all.' },
        { text: 'None', why: '' },
      ],
      answer: 2,
      explain: 'A method with no `return` hands back `None`, like any function. `self.n` is 1, but `x` is `None`.',
      hints: ['Look for the word `return` inside `up`.', 'What does a function give back if it has no `return`?'],
    },
    { id: 'trace-counters', type: 'trace', level: 2,
      q: 'Fill in the table. Each row shows the values after that call.',
      code: py`
        class Counter:
            def __init__(self):
                self.n = 0

            def up(self):
                self.n = self.n + 1

        a = Counter()
        b = Counter()
        a.up()
        b.up()
        a.up()
      `,
      head: ['call', 'a.n', 'b.n'],
      rows: [
        ['start', '0', '0'],
        ['a.up()', '1', '0'],
        ['b.up()', '1', '1'],
        ['a.up()', '2', '1'],
      ],
      given: 1,
      verify: py`
        class Counter:
            def __init__(self):
                self.n = 0

            def up(self):
                self.n = self.n + 1

        a = Counter()
        b = Counter()
        print("start", a.n, b.n)
        a.up()
        print("a.up()", a.n, b.n)
        b.up()
        print("b.up()", a.n, b.n)
        a.up()
        print("a.up()", a.n, b.n)
      `,
      explain: 'Each call adds 1 to the object before the dot. The other object stays the same.',
      hints: ['Only one number changes in each row.', 'Which object comes before the dot?'],
    },
    { id: 'fix-len', type: 'fix', level: 2,
      q: 'Python got confused on the last line. Fix `__len__`, so that this prints 3 once.',
      code: py`
        class Bag:
            def __init__(self):
                self.items = ["pen", "map", "key"]

            def __len__(self):
                print(len(self.items))

        b = Bag()
        print(len(b))
      `,
      answer: py`
        class Bag:
            def __init__(self):
                self.items = ["pen", "map", "key"]

            def __len__(self):
                return len(self.items)

        b = Bag()
        print(len(b))
      `,
      wantOutput: '3',
      explain: '`len(b)` needs a number handed back. `print` only shows it on the screen, so `__len__` must use `return`.',
      hints: ['What does `__len__` hand back right now?', 'Change `print` to `return`.'],
    },
    { id: 'piggy-bank', type: 'write', level: 2,
      q: 'Add 2 methods to `PiggyBank`. `add(n)` puts in `n` coins. `take(n)` takes out `n` coins.',
      starter: py`
        class PiggyBank:
            def __init__(self):
                self.coins = 0

            # Write add and take here.

        p = PiggyBank()
        p.add(10)
        p.take(3)
        print(p.coins)
      `,
      answer: py`
        class PiggyBank:
            def __init__(self):
                self.coins = 0

            def add(self, n):
                self.coins = self.coins + n

            def take(self, n):
                self.coins = self.coins - n

        p = PiggyBank()
        p.add(10)
        p.take(3)
        print(p.coins)
      `,
      wantOutput: '7',
      tests: [
        { label: 'add puts coins in', check: '(lambda b: (b.add(4), b.coins)[1] == 4)(PiggyBank())' },
        { label: 'take takes coins out', check: '(lambda b: (b.take(4), b.coins)[1] == -4)(PiggyBank())' },
      ],
      explain: 'Each method changes `self.coins`, so the object remembers the new number.',
      hints: ['Start with `def add(self, n):` lined up with `__init__`.', 'Inside it, write `self.coins = self.coins + n`.'],
    },
    { id: 'point-equal', type: 'write', level: 2,
      q: 'Add `__eq__`, so that 2 points are equal when `x` and `y` both match.',
      starter: py`
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            # Write __eq__ here.
      `,
      answer: py`
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __eq__(self, other):
                return self.x == other.x and self.y == other.y
      `,
      tests: [
        { label: 'Point(1, 2) equals Point(1, 2)', check: 'Point(1, 2) == Point(1, 2)' },
        { label: 'Point(1, 2) does not equal Point(1, 3)', check: 'not (Point(1, 2) == Point(1, 3))' },
        { label: 'Point(1, 2) does not equal Point(5, 2)', check: 'not (Point(1, 2) == Point(5, 2))' },
      ],
      explain: '`__eq__` gets `self` and `other`. It returns True only when both values match.',
      hints: ['Start with `def __eq__(self, other):`.', 'Compare `self.x` with `other.x`, and `self.y` with `other.y`. Join them with `and`.'],
    },
    { id: 'sort-students', type: 'write', level: 3,
      q: 'Stretch: add `__lt__`, so that `sorted` puts students in order, from the lowest mark to the highest.',
      starter: py`
        class Student:
            def __init__(self, name, mark):
                self.name = name
                self.mark = mark

            # Write __lt__ here.
      `,
      answer: py`
        class Student:
            def __init__(self, name, mark):
                self.name = name
                self.mark = mark

            def __lt__(self, other):
                return self.mark < other.mark
      `,
      tests: [
        { label: 'Lower mark comes first', check: 'Student("A", 1) < Student("B", 2)' },
        { label: 'Higher mark does not come first', check: 'not (Student("A", 8) < Student("B", 2))' },
        { label: 'sorted puts 3 students in order',
          call: '[s.name for s in sorted([Student("Ana", 9), Student("Ben", 4), Student("Cy", 6)])]',
          want: '["Ben", "Cy", "Ana"]' },
      ],
      explain: '`sorted` compares students with `<`, and `<` calls `__lt__`. Your rule compares the marks.',
      hints: ['Start with `def __lt__(self, other):`.', 'Return the answer to `self.mark < other.mark`.'],
    },
  ],
});

// ------------------------------------------------------------------ lesson 7.3
Course.lesson('m07-classes', {
  id: '7-3-nodes-and-next',
  num: '7.3',
  title: 'Objects that point at other objects',
  goal: 'You can link nodes with `.next`, walk along them with a loop, and stop at `None`.',
  mins: 14,
  steps: [
    { t: 'h', text: 'How can one object find another?' },
    { t: 'p', text: 'An [[attribute]] can point at a number or a string. It can also point at another object. Then one object can lead you to the next one.' },
    { t: 'analogy', title: 'Picture a treasure hunt', text: 'Each clue has a fact on it. It also tells you where the next clue is. The last clue says "the end". Unlike paper clues, nothing gets copied here. Each object only points the way.' },
    { t: 'words', items: [
      { word: 'node', means: 'One box in a chain. It holds a value and an arrow to the next box.', say: 'rhymes with road' },
      { word: 'pointer', means: 'An arrow that shows where a thing lives in memory.' },
      { word: 'None', means: 'A value that means "nothing here". In a chain, it marks the end.' },
    ] },
    { t: 'code', caption: 'A new [[node]] has a value, but no next node yet. So `.next` starts as [[None]].',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(5)
        print(a.value)
        print(a.next)
      `,
      output: '5\nNone' },
    { t: 'viz', name: 'm07-link-nodes', caption: 'Each arrow is a [[pointer]]. Press Play, or step with the arrows.' },
    { t: 'p', text: 'Each dot takes one step. `a.next.next.value` means this: start at `a`, follow 2 arrows, then read the value.' },
    { t: 'q', id: 'same-node', type: 'predict', level: 2,
      q: 'What will the screen show?',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(5)
        b = Node(8)
        a.next = b
        b.value = 99
        print(a.next.value)
      `,
      options: [
        { text: '8', why: '`a.next = b` does not copy `b`. It points at `b` itself, so `a` sees the change.' },
        { text: '99', why: '' },
        { text: 'None', why: '`a.next` starts as `None`, but line 8 points it at `b`.' },
      ],
      answer: 1,
      explain: '`a.next` and `b` are 2 ways to reach one node. Change that node, and both ways show 99.',
      hints: ['How many nodes hold the value 8 at the start?', 'Is `a.next` a copy of `b`, or an arrow to `b`?'],
    },
    { t: 'q', id: 'link-them', type: 'fill', level: 2,
      q: 'Fill the gaps, so that the chain goes 1, then 2, then 3.',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(1)
        b = Node(2)
        c = Node(3)
        a.next = ____
        b.next = ____
        print(a.next.next.value)
      `,
      blanks: ['b', 'c'],
      output: '3',
      explain: 'Each node points at the one after it. `c.next` stays `None`, so the chain ends there.',
      hints: ['Which node comes right after `a`?', 'Which node comes right after `b`?'],
    },

    { t: 'h', text: 'How do you walk to the end?' },
    { t: 'p', text: 'Nobody wants to type `.next.next.next` for 100 nodes. A loop can do the walking. Give the first node the name `head`, then walk with a second name, `node`.' },
    { t: 'viz', name: 'm07-walk-chain', caption: 'Type your own numbers above the picture, with commas between them.' },
    { t: 'code', caption: 'Run it. Then add a fourth node. The loop needs no changes.',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        head = Node(5)
        head.next = Node(8)
        head.next.next = Node(2)

        node = head
        while node is not None:
            print(node.value)
            node = node.next
        print("Done")
      `,
      output: '5\n8\n2\nDone' },
    { t: 'tip', title: 'Reading the loop', text: 'Read `node is not None` like this: "node still points at a real node." Use `is` when you check for `None`.' },
    { t: 'q', id: 'walk-trace', type: 'trace', level: 2,
      q: 'Walk the chain 5, then 8, then 2. Fill in the table for each trip around the loop.',
      code: py`
        node = head
        while node is not None:
            print(node.value)
            node = node.next
      `,
      head: ['trip', 'value of node', 'value of next node'],
      rows: [
        ['1', '5', '8'],
        ['2', '8', '2'],
        ['3', '2', 'None'],
      ],
      given: 1,
      verify: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        head = Node(5)
        head.next = Node(8)
        head.next.next = Node(2)

        node = head
        turn = 1
        while node is not None:
            if node.next is None:
                print(turn, node.value, None)
            else:
                print(turn, node.value, node.next.value)
            node = node.next
            turn = turn + 1
      `,
      explain: 'Each trip moves `node` along one arrow. The last node has `None` after it, so the loop ends after trip 3.',
      hints: ['Trip 2 starts where the arrow from 5 leads.', 'What is in the next box of the last node?'],
    },

    { t: 'h', text: 'What happens at the end of the chain?' },
    { t: 'code', error: true, caption: 'This one stops with an error. `b.next` is `None`, and `None` has no attribute called `value`. `NoneType` is the kind of value that `None` is.',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(5)
        b = Node(8)
        a.next = b
        print(a.next.value)
        print(a.next.next.value)
      ` },
    { t: 'trap',
      think: 'You can walk the chain by moving `head` itself.',
      real: 'Then `head` ends up as `None`, and no name points at the first node. You lose your way back in. Walk with a second name, `node`.',
      code: py`
        # Do not do this.
        while head is not None:
            head = head.next
      ` },
    { t: 'tip', title: 'Coming up', text: 'A chain of nodes is called a [[linked list]]. You will build a full one in a later module. You now know the main idea.' },
    { t: 'big', text: 'An object can point at another object. Follow the arrows, and stop when you reach `None`.' },
  ],
  recap: [
    'You can link nodes with `.next`.',
    'You know `None` marks the end of a chain.',
    'You can walk a chain with a loop.',
  ],
  practice: [
    { id: 'node-words', type: 'match', level: 1,
      q: 'Match each part of a chain to what it does.',
      pairs: [
        ['`.value`', 'What this node holds'],
        ['`.next`', 'The arrow to the next node'],
        ['`None`', 'Nothing here, so the chain ends'],
        ['`head`', 'The name on the first node'],
      ],
      explain: 'A node holds a value and an arrow. The last arrow is `None`, and `head` is where you start.',
      hints: ['Think of a treasure hunt. Which part tells you where to go next?'],
    },
    { id: 'follow-one', type: 'predict', level: 1,
      q: 'What will the screen show?',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        x = Node(4)
        y = Node(6)
        x.next = y
        print(x.next.value)
        print(y.next)
      `,
      options: [
        { text: '4\nNone', why: '`x.next` follows the arrow away from `x`. So it reads the value in `y`, not in `x`.' },
        { text: '6\nNone', why: '' },
        { text: '6\n4', why: 'Arrows go one way only. `y.next` was never set, so it is still `None`.' },
      ],
      answer: 1,
      explain: '`x.next` is the node `y`, which holds 6. `y.next` was never set, so it is `None`.',
      hints: ['Where does the arrow from `x` lead?', 'Does any line set `y.next`?'],
    },
    { id: 'forgot-none', type: 'fix', level: 2,
      q: 'Python got confused on the last line. Fix the class, so that a new node starts with `None` in `.next`.',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value

        a = Node(5)
        print(a.next)
      `,
      answer: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(5)
        print(a.next)
      `,
      wantOutput: 'None',
      explain: 'A node needs `.next` from the start, even with nothing to point at. `None` says "no next node yet".',
      hints: ['Which attribute does the last line read?', 'Add `self.next = None` inside `__init__`.'],
    },
    { id: 'stops-early', type: 'fix', level: 2,
      q: 'This loop misses the last node. Fix the `while` line, so that it prints 5, 8 and 2.',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        head = Node(5)
        head.next = Node(8)
        head.next.next = Node(2)

        node = head
        while node.next is not None:
            print(node.value)
            node = node.next
      `,
      answer: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        head = Node(5)
        head.next = Node(8)
        head.next.next = Node(2)

        node = head
        while node is not None:
            print(node.value)
            node = node.next
      `,
      wantOutput: '5\n8\n2',
      explain: 'The last node has `None` in `.next`, so the old check stops before printing it. Check `node` itself.',
      hints: ['What is `node.next` when `node` is the last node?', 'Check `node`, not `node.next`.'],
    },
    { id: 'link-three', type: 'write', level: 2,
      q: 'Link the 3 nodes, so that the loop prints 1, 2 and 3.',
      starter: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(1)
        b = Node(2)
        c = Node(3)
        # Link the nodes here.

        node = a
        while node is not None:
            print(node.value)
            node = node.next
      `,
      answer: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(1)
        b = Node(2)
        c = Node(3)
        a.next = b
        b.next = c

        node = a
        while node is not None:
            print(node.value)
            node = node.next
      `,
      wantOutput: '1\n2\n3',
      tests: [
        { label: 'a points at b', check: 'a.next is b' },
        { label: 'b points at c', check: 'b.next is c' },
        { label: 'c is the end', check: 'c.next is None' },
      ],
      explain: 'You need 2 arrows for 3 nodes. `c.next` stays `None`, and that stops the loop.',
      hints: ['Write `a.next = b` first.', 'Then link `b` to the node after it.'],
    },
    { id: 'count-nodes', type: 'write', level: 3,
      q: 'Stretch: write `count(head)`. It returns how many nodes are in the chain. An empty chain is `None`, and that has 0 nodes.',
      starter: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(5)
        b = Node(8)
        c = Node(2)
        a.next = b
        b.next = c

        def count(head):
            # Walk the chain and count each node.
            pass
      `,
      answer: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

        a = Node(5)
        b = Node(8)
        c = Node(2)
        a.next = b
        b.next = c

        def count(head):
            total = 0
            node = head
            while node is not None:
                total = total + 1
                node = node.next
            return total
      `,
      tests: [
        { label: 'count(a) is 3', call: 'count(a)', want: '3' },
        { label: 'count(b) is 2', call: 'count(b)', want: '2' },
        { label: 'count(c) is 1', call: 'count(c)', want: '1' },
        { label: 'count(None) is 0', call: 'count(None)', want: '0' },
      ],
      explain: 'The walking loop visits each node once, so add 1 on each trip. With `None`, the loop never runs and the total stays 0.',
      hints: ['Start a total at 0, then use the walking loop.', 'Add 1 to the total inside the loop, then return it after the loop.'],
    },
    { id: 'lost-head', type: 'predict', level: 3,
      q: 'Stretch: this loop moves `head` itself. What will the screen show?',
      code: py`
        class Node:
            def __init__(self, value):
                self.value = value
                self.next = None

            def __repr__(self):
                return str(self.value)

        head = Node(5)
        head.next = Node(8)
        while head is not None:
            head = head.next
        print(head)
      `,
      options: [
        { text: '5', why: 'The loop moves `head`. It does not stay on the first node, so the 5 node is lost.' },
        { text: '8', why: 'The loop runs once more after reaching 8. That last trip moves `head` onto `None`.' },
        { text: 'None', why: '' },
      ],
      answer: 2,
      explain: 'The loop only stops when `head` is `None`. No name points at the first node now, so you cannot reach it.',
      hints: ['When does this loop stop?', 'What must `head` be for the check to say stop?'],
    },
  ],
});
