**Binary search** finds something in a **sorted** list by repeatedly checking the middle and throwing away the half that can't contain it. Each step halves what's left, so it takes **O(log n)**: about 20 steps for a million items, 30 for a billion.

## The idea

Looking for 23 in a sorted list:

```
[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
 lo            mid                hi     mid = 16 < 23 → search the right half
                     lo   mid      hi     mid = 56 > 23 → search the left half
                     lo hi                mid = 23 ✓
```

## Template 1: find an exact value

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1          # search nums[lo..hi], both included
    while lo <= hi:                    # stop when the range is empty
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1               # mid is too small: drop it and everything left
        else:
            hi = mid - 1               # mid is too big: drop it and everything right
    return -1
```

Three rules keep it correct:

1. `lo <= hi` (not `<`), because a one-item range still needs checking.
2. Move **past** mid: `mid + 1` or `mid - 1`. If you set `lo = mid`, a two-item range can loop forever.
3. Return the "not found" value after the loop.

## Template 2: find the first position where something becomes true

Many problems aren't "find x" but "find the **boundary**": the first index where `nums[i] >= target`, the first bad version, the smallest speed that's fast enough. If a condition is false, false, …, then true, true, …, binary search finds the first true.

```python
def first_true(lo, hi, condition):
    # condition is False … False True … True over [lo, hi)
    while lo < hi:                     # range [lo, hi), hi excluded
        mid = (lo + hi) // 2
        if condition(mid):
            hi = mid                   # mid might be the answer: keep it
        else:
            lo = mid + 1               # mid is false: the answer is to the right
    return lo                          # first True (or hi if none)

nums = [1, 3, 3, 5, 8]
first_true(0, len(nums), lambda i: nums[i] >= 4)   # 3 (nums[3] = 5)
```

Notice the different shape: `lo < hi`, and `hi = mid` (not `mid - 1`) because mid could be the answer. Pick one template per problem and stick to its rules. Mixing them is where off-by-one bugs come from.

Python's `bisect` module does template 2 for you on lists:

```python
import bisect
bisect.bisect_left([1, 3, 3, 5, 8], 3)    # 1: first index with value >= 3
bisect.bisect_right([1, 3, 3, 5, 8], 3)   # 3: first index with value > 3
```

## Binary search on the answer

Sometimes there's no array to search. Instead the **answer** is a number in a range, and you can check "is this number good enough?" quickly.

> Minimum eating speed to finish all banana piles within `h` hours.

- Speeds from 1 to max(piles).
- If speed `s` works, every faster speed works too: false … false, true … true.
- So binary search for the first speed that works, checking each in O(n). Total O(n log max).

Recognise it by "minimum X such that…" or "maximum X such that…" with a monotonic yes/no check.

## When the array is rotated

A sorted array rotated, like `[4, 5, 6, 7, 0, 1, 2]`, is no longer fully sorted, but if you split it at any `mid`, **at least one half is sorted**. Compare `nums[mid]` with an end to find out which half that is, then check whether the target (or the minimum) lies in it.

## How this helps with the module's problems

- **Binary Search:** template 1.
- **Search a 2D Matrix:** each row continues the previous one, so treat the whole matrix as one sorted list of `rows × cols` items. Index `mid` maps to `matrix[mid // cols][mid % cols]`.
- **Find Minimum in Rotated Sorted Array:** template 2. Compare `nums[mid]` with `nums[-1]`: is mid in the left (bigger) part or the right (smaller) part?
- **Search in Rotated Sorted Array:** template 1, plus "one half is always sorted".

## Check yourself

1. Why does binary search need sorted (or monotonic) data?
2. In template 1, what goes wrong if you write `lo = mid` instead of `lo = mid + 1`?
3. How many steps does binary search need for about 1,000,000 items?

### Answers

1. Comparing with the middle only tells you which half to drop if everything on one side is smaller and everything on the other side is bigger.
2. When `hi = lo + 1`, `mid` equals `lo`, so `lo = mid` doesn't move and the loop can run forever.
3. About 20 (2²⁰ ≈ 1,000,000).
