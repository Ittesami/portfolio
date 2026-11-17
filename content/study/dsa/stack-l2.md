A **monotonic stack** is a normal stack that you keep **in order** (always increasing or always decreasing from bottom to top). Before pushing, you pop everything that would break the order. It answers "**next greater / next smaller element**" questions in **O(n)** instead of O(n²).

## The problem it solves

> For each number, find the next number to its right that is bigger. If there isn't one, use −1.

`[2, 1, 2, 4, 3]` → `[4, 2, 4, -1, -1]`

Brute force: for each item, scan right until you find a bigger one, O(n²).

## The idea

Walk left to right. The stack holds the items that are **still waiting** for their next greater element.

When a new number arrives, it is the answer for every waiting item that is **smaller** than it. Pop those, record the answer, then push the new number (it's now waiting too).

Because each new number first pops everything smaller than itself, everything left underneath it is bigger or equal. So the waiting items are always in **decreasing** order from bottom to top, and the smallest waiting item is always on top, which is exactly the one to check next.

Store **indexes**, not values, so you know where to write each answer.

```python
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []                       # indexes, values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            j = stack.pop()
            result[j] = x            # x is the next greater for j
        stack.append(i)
    return result                    # anything left on the stack: -1

next_greater([2, 1, 2, 4, 3])        # [4, 2, 4, -1, -1]
```

## Walkthrough

| i | x | pops (index → answer) | stack after (values) |
|---|---|---|---|
| 0 | 2 | — | [2] |
| 1 | 1 | — | [2, 1] |
| 2 | 2 | 1 → 2 | [2, 2] |
| 3 | 4 | 2 → 4, 0 → 4 | [4] |
| 4 | 3 | — | [4, 3] |

Indexes 3 and 4 are never popped, so they stay −1.

## Why it's O(n)

Every index is pushed once and popped at most once. The `while` loop's total work across the whole run is at most n pops: **O(n) time, O(n) space**.

## The four variations

| You want… | Keep the stack… | Pop while the top is… |
|---|---|---|
| Next **greater** to the right | decreasing | smaller than x |
| Next **smaller** to the right | increasing | bigger than x |
| Previous greater / smaller | same idea; the answer is what's on top *after* popping, before pushing | |
| Distance to the next greater | store indexes; distance = `i - j` | |

The last row is exactly what **Daily Temperatures** asks for.

## Spotting it

Words like "next warmer day", "next greater", "how many days until", "span", "nearest smaller to the left", or "largest rectangle in a histogram" (a famous harder one) all point to a monotonic stack.

## How this helps with the module's problems

- **Daily Temperatures:** next greater element, but the answer is the **distance** in days, not the value. Store indexes and compute `i - j` when you pop.

## Check yourself

1. Why store indexes on the stack instead of values?
2. For "next smaller element", what order should the stack be kept in?
3. What answer do items still on the stack at the end get?

### Answers

1. So you know which position to write the answer into (and you can still read the value with `nums[j]`, and compute distances).
2. Increasing: pop while the top is bigger than the new number.
3. The "not found" value (−1 or 0, depending on the problem): nothing to their right was bigger.
