A **hash map** (Python `dict`) stores key → value pairs and finds any key in **O(1) on average**. A **hash set** (Python `set`) is the same thing without values: it just answers "have I seen this?". Together they are the single most useful tool for speeding up array problems.

## How hashing works

1. A **hash function** turns the key into a big number: `hash("cat")` → `-4396185931`.
2. That number is reduced to a slot in an internal array: `index = hash(key) % capacity`.
3. The value is stored in that slot. Looking up the key repeats steps 1–2 and goes straight to the slot, so there's no searching.

```
capacity 8
"cat" → hash → … % 8 = 3     slots: [_, _, _, ("cat", 4), _, _, _, _]
"dog" → hash → … % 8 = 6
```

### Collisions

Two keys can land in the same slot. Python handles this by probing for another free slot (other languages chain a small list in each slot). Either way, as long as the table isn't too full, lookups stay O(1) on average.

### Resizing

When the table gets about two-thirds full, Python allocates a bigger one and re-inserts everything. Like list appends, that's O(n) occasionally and **amortised O(1)**.

**Worst case** is O(n) if everything collides, but with Python's built-in hashing you can treat lookups as O(1).

## What can be a key

Keys must be **hashable**, which in practice means **immutable**:

- ✓ `int`, `str`, `float`, `tuple` (of hashable things), `frozenset`
- ✗ `list`, `dict`, `set` (they can change, so their hash would change)

To use a list as a key, convert it: `tuple(my_list)`.

## The Python tools

```python
seen = set()
seen.add(5)
5 in seen               # True, O(1)

d = {}
d["a"] = 1
d.get("b", 0)           # 0: a default instead of a KeyError

from collections import Counter, defaultdict
Counter("banana")       # Counter({'a': 3, 'n': 2, 'b': 1})

groups = defaultdict(list)
groups["x"].append(1)   # no need to create the list first
```

| Operation | dict / set |
|---|---|
| Insert, lookup, delete | O(1) average |
| Loop over all items | O(n) |
| Memory | O(n) |

## Pattern 1: "have I seen it before?"

```python
def first_repeat(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return x
        seen.add(x)
    return None
```

O(n) instead of the O(n²) "compare with everything before it".

## Pattern 2: counting

```python
from collections import Counter

def first_unique_char(s):
    counts = Counter(s)          # O(n)
    for i, ch in enumerate(s):   # O(n)
        if counts[ch] == 1:
            return i
    return -1

first_unique_char("leetcode")   # 0 ('l')
first_unique_char("aabb")       # -1
```

Counting is also how you compare two collections ignoring order: two strings are anagrams exactly when their character counts match.

## Pattern 3: remember where you saw it (value → index)

Store each value with its index as you go. Then "is there an earlier item that pairs with this one?" is a single dict lookup. This is the key idea behind **Two Sum**: for each number, which *other* number would you need, and have you seen it already?

## Pattern 4: grouping by a key

Put items that share a "signature" in the same bucket:

```python
from collections import defaultdict

def group_by_length(words):
    groups = defaultdict(list)
    for w in words:
        groups[len(w)].append(w)
    return list(groups.values())

group_by_length(["hi", "cat", "no", "dog"])   # [['hi', 'no'], ['cat', 'dog']]
```

For **Group Anagrams**, the question is what signature all anagrams share. (Sorted letters, or a tuple of 26 letter counts, both work as dict keys.)

## How this helps with the module's problems

- **Contains Duplicate:** pattern 1.
- **Valid Anagram:** pattern 2. Compare counts.
- **Two Sum:** pattern 3.
- **Group Anagrams:** pattern 4, with a signature as the key.
- **Top K Frequent Elements:** count first (pattern 2), then pick the top k. A heap works (heap module), and so does "bucket sort": a list where index = frequency.

## Check yourself

1. Why can't a list be a dict key, but a tuple can?
2. What's the average time to check `x in my_set`? And `x in my_list`?
3. How would you check if two strings are anagrams in O(n)?

### Answers

1. Keys must be hashable. A list can change after it's stored, which would change its hash and lose it in the table. Tuples can't change.
2. Set: O(1) on average. List: O(n).
3. Count the characters of each (e.g. `Counter(a) == Counter(b)`); they're anagrams if the counts are equal. Sorting both is O(n log n).
