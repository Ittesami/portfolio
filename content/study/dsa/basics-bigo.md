Big-O describes **how the time (or memory) an algorithm needs grows as the input gets bigger**. It's not about seconds on your laptop. It's about the shape of the growth, so you can compare two solutions before you write either.

## Why it matters

LeetCode inputs are often up to 10⁵ items. A computer does very roughly **10⁸ simple operations a second**. So:

- An O(n) solution on 10⁵ items does about 10⁵ operations: instant.
- An O(n²) solution does 10¹⁰ operations: around 100 seconds, so "Time Limit Exceeded".

The same problem, two approaches, and only one passes. Big-O tells you which, before you code.

## The common classes

| Big-O | Name | Example | Operations when n = 100,000 |
|---|---|---|---|
| O(1) | Constant | Read `arr[5]`, dict lookup | 1 |
| O(log n) | Logarithmic | Binary search | ~17 |
| O(n) | Linear | Loop through a list once | 100,000 |
| O(n log n) | Linearithmic | Sorting | ~1,700,000 |
| O(n²) | Quadratic | Compare every pair | 10,000,000,000 |
| O(2ⁿ) | Exponential | Every subset | impossible |
| O(n!) | Factorial | Every ordering | impossible |

Read the table top to bottom as "fast to slow". Most interview answers land on O(n), O(n log n) or O(log n).

## How to work it out

Count how many times the innermost work runs, as a function of n.

**One loop: O(n).** The body runs once per item.

```python
def total(nums):
    s = 0
    for x in nums:      # runs n times
        s += x          # O(1) each time
    return s            # O(n) overall
```

**A loop inside a loop: O(n²).** For each of the n items, you do n more steps.

```python
def has_pair_with_sum(nums, target):
    n = len(nums)
    for i in range(n):              # n times
        for j in range(i + 1, n):   # up to n times each
            if nums[i] + nums[j] == target:
                return True
    return False                    # O(n²)
```

(It's about n²/2 comparisons, but constants are dropped, so it's still O(n²).)

**Halving each step: O(log n).** If every step throws away half of what's left, you can only halve n about log₂(n) times before 1 is left.

```python
def count_halvings(n):
    steps = 0
    while n > 1:
        n //= 2       # the problem halves
        steps += 1
    return steps      # O(log n): 1,000,000 → about 20 steps
```

**Two loops one after another: add, don't multiply.** O(n) + O(n) = O(n). Loops over two different inputs: O(n + m).

```python
def merge_counts(a, b):
    for x in a: ...    # O(n)
    for y in b: ...    # O(m)
                       # O(n + m)
```

## The three rules

1. **Drop constants.** O(3n) is O(n). O(n/2) is O(n). Big-O cares about growth, not exact counts.
2. **Keep only the biggest term.** O(n² + n + 100) is O(n²). When n is large, n² swamps the rest.
3. **Different inputs, different letters.** Looping over a list of n words, each of length k, is O(n · k), not O(n²).

## Space complexity

The same idea for **extra memory** your algorithm uses (not counting the input itself).

- Using a few variables: O(1) space.
- Building a set or dict of the items: O(n) space.
- Recursion uses the call stack: a recursion that goes n levels deep is O(n) space, even if you never create a list.

There is often a **time–space trade-off**: using an O(n) set to remember what you've seen can turn an O(n²) algorithm into O(n).

## What Python's built-ins cost

You can't reason about your code without knowing these.

| Operation | Cost | Note |
|---|---|---|
| `lst[i]`, `lst[i] = x` | O(1) | |
| `lst.append(x)`, `lst.pop()` | O(1) | amortised (see below) |
| `lst.pop(0)`, `lst.insert(0, x)` | O(n) | shifts everything; use `deque` |
| `x in lst` | O(n) | checks every item |
| `x in st` (set), `d[key]` (dict) | O(1) | on average |
| `lst.sort()`, `sorted(lst)` | O(n log n) | |
| `lst[a:b]` (slice) | O(b − a) | copies |
| `min(lst)`, `max(lst)`, `sum(lst)` | O(n) | |
| `s1 + s2` (strings) | O(len) | strings are immutable |

A classic trap: building a string with `+=` in a loop can be O(n²), because each `+=` copies the whole string. Collect parts in a list and `"".join(parts)` once: O(n).

### Amortised O(1)

A Python list is a dynamic array. When it's full, `append` copies everything into an array twice the size, which is O(n) for that one append. But that only happens after many cheap appends, so averaged over all appends each costs O(1). That average is called **amortised** O(1).

## Read the constraints

LeetCode tells you n. Use it to guess the complexity you need:

| n up to | Aim for |
|---|---|
| 10–12 | O(n!) is OK |
| 20–25 | O(2ⁿ) is OK |
| 500 | O(n³) |
| 10⁴ | O(n²) |
| 10⁵–10⁶ | O(n log n) or O(n) |
| bigger | O(log n) or O(1) |

So if a problem says `1 <= nums.length <= 10^5`, an O(n²) idea won't pass: look for O(n) or O(n log n).

## Check yourself

1. What's the time complexity of a loop from 1 to n where you double `i` each step (`i *= 2`)?
2. You sort a list, then loop through it once. What's the total time complexity?
3. Why is `if x in my_list` inside a `for` loop over `my_list` a problem, and how do you fix it?
4. A recursive function calls itself once with `n - 1` until `n == 0`. What's its space complexity?

### Answers

1. O(log n): `i` doubles, so it reaches n after about log₂(n) steps.
2. O(n log n) + O(n) = O(n log n). Keep the biggest term.
3. `in` on a list is O(n), so inside an O(n) loop it's O(n²) overall. Put the items in a `set` first: lookups become O(1) and the whole thing O(n).
4. O(n): there are n frames on the call stack at the deepest point.
