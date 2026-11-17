**Recursion** is a function that solves a problem by calling **itself** on a smaller version of the same problem. Trees, graphs, backtracking and dynamic programming all build on it, so it's worth getting comfortable with.

## The two parts

Every recursive function needs:

1. **A base case:** the smallest input, answered directly, with no further calls. Without it, the function never stops.
2. **A recursive case:** break the problem into a smaller one, call yourself on it, and use the result.

```python
def factorial(n):
    if n <= 1:                 # base case
        return 1
    return n * factorial(n - 1)    # recursive case: a smaller n

factorial(4)   # 4 × 3 × 2 × 1 = 24
```

## What actually happens: the call stack

Each call waits for the one it made, so the calls pile up on the **call stack**, then unwind:

```
factorial(4)
  → 4 * factorial(3)
          → 3 * factorial(2)
                  → 2 * factorial(1)
                          → 1            base case
                  ← 2 * 1 = 2
          ← 3 * 2 = 6
  ← 4 * 6 = 24
```

The deepest point has n calls waiting, so this uses **O(n) space**, even though there's no list in sight.

Python stops recursion at about **1000 levels** (`RecursionError`). For deeper inputs, either rewrite with a loop/stack, or raise the limit with `sys.setrecursionlimit(10**6)` (fine on LeetCode, risky elsewhere).

## How to think recursively

Don't try to trace every call in your head. Instead, **trust** that the function already works for smaller inputs, and ask:

> If I had the answer for the smaller problem, how would I get the answer for mine?

```python
def total(nums):
    if not nums:               # base: an empty list sums to 0
        return 0
    return nums[0] + total(nums[1:])     # first item + the sum of the rest
```

(Here `nums[1:]` copies the list each time, making it O(n²). In real code, pass an index instead: `total(nums, i)`.)

## A faster example: power

Computing xⁿ by multiplying n times is O(n). Recursion can halve the problem instead:

```python
def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)          # solve the half once…
    if n % 2 == 0:
        return half * half           # …and reuse it
    return half * half * x

power(2, 10)   # 1024, in about log₂(10) ≈ 4 calls
```

**O(log n)**, the same halving idea as binary search.

## Recursion that branches

When a function calls itself **more than once**, the calls form a tree, and the cost can explode:

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)    # two calls each time
```

```
                fib(5)
            /           \
        fib(4)          fib(3)
        /    \          /    \
    fib(3)  fib(2)   fib(2)  fib(1)
     ...
```

`fib(3)` and `fib(2)` are computed again and again: O(2ⁿ). Saving answers you've already computed (**memoisation**) fixes it. That's the start of the dynamic programming module.

## Common mistakes

- **No base case, or one that's never reached** (e.g. `n - 2` jumping past `n == 1`): infinite recursion.
- **Forgetting to `return`** the recursive call's result: the function returns `None`.
- **Expensive slices** (`nums[1:]`) in every call: pass indexes instead.

## Check yourself

1. What are the two parts every recursive function needs?
2. What's the space complexity of `factorial(n)`, and why?
3. Why is the simple recursive `fib(n)` so slow?

### Answers

1. A base case (answered directly) and a recursive case (calls itself on a smaller input).
2. O(n): n calls are waiting on the call stack at the deepest point.
3. It calls itself twice per call and recomputes the same values many times, about 2ⁿ calls. Memoisation brings it down to O(n).
