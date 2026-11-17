An **array** stores items **next to each other in memory**, in order. It is the most used data structure there is, and most problems start with one.

## Why indexing is O(1)

Because items sit side by side and are all the same size, the computer can jump straight to any position:

```
address of item i = start address + i × item size
```

So `arr[0]` and `arr[999999]` take the same time. That's the array's superpower: **random access in O(1)**.

The cost: inserting or deleting in the **middle** means shifting everything after it.

```
insert 9 at index 1:
[4, 7, 2, 5]  →  [4, _, 7, 2, 5]  →  [4, 9, 7, 2, 5]
                     every item after index 1 moves one place
```

## Python lists are dynamic arrays

A Python `list` is an array that resizes itself (it grows by over-allocating, so `append` is amortised O(1)).

| Operation | Cost |
|---|---|
| Read / write `lst[i]` | O(1) |
| `append(x)` / `pop()` at the end | O(1) amortised |
| `insert(i, x)` / `pop(i)` in the middle or front | O(n) |
| `x in lst`, `lst.index(x)` | O(n) |
| `lst.sort()` | O(n log n) |
| `lst[a:b]` | O(b − a), it makes a copy |
| `lst.reverse()`, `lst[::-1]` | O(n) |

Rule of thumb: **add and remove at the end**. If you need the front too, use `collections.deque` (queue module).

## Strings are arrays of characters

`s[i]` is O(1), and you loop over a string like a list. But Python strings are **immutable**: you can't change `s[0]`. "Changing" a string builds a new one, O(n). To build a string piece by piece, append to a list and `"".join()` at the end.

## Technique 1: prefix sums

Problem: answer many questions like "what's the sum of `nums[i..j]`?". Adding each range up is O(n) per question.

Instead, build `prefix` once, where `prefix[k]` is the sum of the first `k` items:

```python
nums   = [3, 1, 4, 1, 5]
prefix = [0, 3, 4, 8, 9, 14]   # prefix[0] = 0, then running totals

def build_prefix(nums):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    return prefix

def range_sum(prefix, i, j):        # sum of nums[i..j], inclusive
    return prefix[j + 1] - prefix[i]

p = build_prefix(nums)
range_sum(p, 1, 3)   # 1 + 4 + 1 = 6  →  p[4] - p[1] = 9 - 3 = 6
```

Building is O(n); every query after that is **O(1)**.

The same idea works with products, counts, or "prefix from the left and from the right", which is the key idea behind **Product of Array Except Self**.

## Technique 2: in-place work with swaps

Many array problems want O(1) extra space. Swapping is the main tool:

```python
def reverse_in_place(arr):
    i, j = 0, len(arr) - 1
    while i < j:
        arr[i], arr[j] = arr[j], arr[i]   # Python swap
        i += 1
        j -= 1
```

That's also your first two-pointer pattern (a later module).

## Technique 3: loop with indexes

```python
for i, x in enumerate(nums):     # index and value together
    ...
for i in range(1, len(nums)):    # compare each item with the one before
    if nums[i] > nums[i - 1]:
        ...
```

## 2D arrays (grids)

A grid is a list of rows. `grid[r][c]` is row `r`, column `c`.

```python
rows, cols = 3, 4
grid = [[0] * cols for _ in range(rows)]   # correct

bad = [[0] * cols] * rows                  # WRONG: 3 references to the same row
bad[0][0] = 1                              # changes every row's first item!
```

Loop over every cell:

```python
for r in range(rows):
    for c in range(cols):
        ...
```

Grids come back in the graphs module (islands, flood fill).

## How this helps with the module's problems

- **Product of Array Except Self:** you can't use division. Think "product of everything to the left" × "product of everything to the right" (prefix and suffix products).
- The other problems in this module are mostly about **hashing**, the next lesson.

## Check yourself

1. Why is `lst.insert(0, x)` slow but `lst.append(x)` fast?
2. Using the prefix array `[0, 2, 5, 9, 14]`, what's the sum of `nums[1..3]`?
3. What's wrong with `grid = [[0] * 3] * 3`?

### Answers

1. Inserting at the front shifts all n items one place (O(n)); appending at the end usually just writes into spare space (amortised O(1)).
2. `prefix[4] - prefix[1] = 14 - 2 = 12`.
3. It creates one row and three references to it, so changing a cell in one row changes it in all rows. Use `[[0] * 3 for _ in range(3)]`.
