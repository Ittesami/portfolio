A **sliding window** is a range `[left, right]` over an array or string that moves forward, keeping a running summary (a sum, a count, a set) of what's inside. It solves "best **contiguous** subarray / substring" problems in **O(n)** instead of checking every range in O(n²).

Keyword to spot: **contiguous**, "subarray", "substring", "consecutive", "window".

## Fixed-size window

> The largest sum of any `k` consecutive numbers.

Brute force sums each window from scratch: O(n · k). Instead, slide: add the new item on the right, remove the old item on the left.

```
nums = [2, 1, 5, 1, 3, 2], k = 3
[2 1 5] 1 3 2   sum 8
2 [1 5 1] 3 2   sum 8 - 2 + 1 = 7
2 1 [5 1 3] 2   sum 7 - 1 + 3 = 9   ← best
2 1 5 [1 3 2]   sum 9 - 5 + 2 = 6
```

```python
def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]   # add new, drop old
        best = max(best, window)
    return best
```

## Variable-size window

> The longest subarray with sum ≤ `S` (all numbers positive).

Template: **grow** the window by moving `right` every step. While the window breaks the rule, **shrink** it by moving `left`. After shrinking, the window is valid, so record the answer.

```python
def longest_sum_at_most(nums, S):
    left = 0
    total = 0
    best = 0
    for right, x in enumerate(nums):
        total += x                       # grow
        while total > S:                 # broken: shrink
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)   # window is valid
    return best

longest_sum_at_most([3, 1, 2, 1, 4, 2], 5)   # 3  ([1, 2, 1])
```

## Window + hash map

Often the window's "summary" is a count of what's inside.

> The longest substring with at most `k` distinct characters.

```python
from collections import defaultdict

def longest_k_distinct(s, k):
    counts = defaultdict(int)
    left = 0
    best = 0
    for right, ch in enumerate(s):
        counts[ch] += 1
        while len(counts) > k:           # too many distinct characters
            counts[s[left]] -= 1
            if counts[s[left]] == 0:
                del counts[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best

longest_k_distinct("eceba", 2)   # 3 ("ece")
```

## Why it's O(n)

The `while` inside the `for` looks like O(n²), but it isn't: `left` only ever moves forward, so across the whole run it moves at most n times. Every item is added once and removed at most once: **O(n) total**.

## The template to remember

```python
left = 0
for right in range(len(arr)):
    add arr[right] to the window
    while the window is invalid:
        remove arr[left] from the window
        left += 1
    update the answer with the window [left, right]
```

For "shortest window that satisfies X", flip it: shrink **while the window is valid**, and record the answer inside the `while`.

## How this helps with the module's problems

- **Best Time to Buy and Sell Stock:** a two-pointer or window idea: track the lowest price seen so far (the "buy" end) as the window moves right, and the best profit if you sold today.
- **Longest Substring Without Repeating Characters:** variable window; the window is invalid when a character appears twice (a set or a count map).
- **Longest Repeating Character Replacement:** variable window with counts. Key insight: the window is valid when `window length − count of its most frequent character ≤ k` (those are the characters you'd replace).

## Check yourself

1. Which word in a problem is the biggest hint for a sliding window?
2. Why doesn't the inner `while` make the algorithm O(n²)?
3. Why does the "sum ≤ S" window need all numbers to be positive?

### Answers

1. "Contiguous" (subarray, substring, consecutive).
2. `left` only moves forward and never past `right`, so the inner loop runs at most n times in total across the whole algorithm.
3. With negatives, growing the window can make the sum smaller, so "shrink while too big" is no longer correct: a valid window might be hiding behind an invalid one. (Problems with negatives often need prefix sums and a hash map instead.)
