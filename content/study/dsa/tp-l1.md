**Two pointers** means walking through an array (or string) with two indexes at once, instead of two nested loops. It often turns O(n²) into **O(n) time with O(1) extra space**.

There are two main shapes.

## Shape 1: from both ends, moving inwards

Start one pointer at the left end and one at the right, and move them towards each other.

```
[ 1, 3, 4, 6, 8, 11 ]
  ↑                ↑
  L                R
```

This works when **looking at the two ends tells you which pointer to move**, usually because the array is **sorted**, or because you're comparing a sequence with its mirror (palindromes).

### Example: is a string a palindrome?

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

is_palindrome("racecar")   # True
is_palindrome("rocket")    # False
```

### Example: squares of a sorted array, still sorted

`[-4, -1, 0, 3, 10]` → `[0, 1, 9, 16, 100]`. The biggest square is at **one of the two ends** (a big negative or a big positive), so compare the ends and fill the answer from the back:

```python
def sorted_squares(nums):
    n = len(nums)
    result = [0] * n
    left, right = 0, n - 1
    for pos in range(n - 1, -1, -1):          # fill from the end
        if abs(nums[left]) > abs(nums[right]):
            result[pos] = nums[left] ** 2
            left += 1
        else:
            result[pos] = nums[right] ** 2
            right -= 1
    return result
```

O(n) instead of squaring and sorting, O(n log n).

### Why moving one pointer is safe

In a sorted array, if `nums[L] + nums[R]` is **too big**, then `nums[R]` is too big to pair with *anything* still in range (everything else is ≥ `nums[L]`). So you can throw `R` away and move it left. If the sum is **too small**, the same argument throws `L` away. Each step discards one candidate for good, so there are at most n steps.

## Shape 2: same direction (slow and fast)

Both pointers start at the left. The **fast** one explores; the **slow** one marks where the "kept" part ends.

### Example: remove duplicates from a sorted array, in place

```python
def remove_duplicates(nums):
    if not nums:
        return 0
    slow = 0                              # last position of the kept part
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:      # new value: keep it
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1                       # length of the kept part

nums = [1, 1, 2, 3, 3, 3, 4]
remove_duplicates(nums)    # 4, nums starts with [1, 2, 3, 4]
```

Walkthrough of the first steps:

| fast | nums[fast] | nums[slow] | action | kept part |
|---|---|---|---|---|
| 1 | 1 | 1 | skip | [1] |
| 2 | 2 | 1 | keep → slow = 1 | [1, 2] |
| 3 | 3 | 2 | keep → slow = 2 | [1, 2, 3] |
| 4 | 3 | 3 | skip | [1, 2, 3] |

The same "fast and slow" idea appears again in linked lists (finding the middle, detecting cycles).

## When to reach for two pointers

- The array is **sorted** (or you can sort it first, O(n log n)) and you're looking for a pair or triple.
- You compare **both ends** (palindromes, reversing).
- You must work **in place** with O(1) extra space (removing, partitioning).

## How this helps with the module's problems

- **Valid Palindrome:** shape 1. Skip characters that aren't letters or digits (`ch.isalnum()`) and compare lowercase.
- **Two Sum II (sorted input):** shape 1, with the "why moving is safe" argument above.
- **3Sum:** sort first, then fix one number and run two pointers on the rest. The tricky part is skipping duplicate values so you don't report the same triple twice.
- **Container With Most Water:** shape 1. The area is limited by the *shorter* wall. Which pointer could possibly give a bigger area if you move it?

## Check yourself

1. Why do two pointers from both ends need a sorted array for pair-sum problems?
2. What's the time and space complexity of `remove_duplicates` above?
3. For 3Sum, why sort first if sorting costs O(n log n)?

### Answers

1. Sorting is what tells you which pointer to move: if the sum is too big, only moving the right pointer left can make it smaller.
2. O(n) time (one pass) and O(1) extra space (it works in place).
3. The rest of the algorithm is O(n²) (fix one number, two-pointer the rest), so O(n log n) for sorting doesn't change the total, and sorting is what makes two pointers and skipping duplicates possible.
