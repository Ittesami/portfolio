**Dynamic programming (DP)** solves a problem by breaking it into smaller sub-problems, solving each **once**, and **saving** the answers so they're never recomputed. It turns many exponential solutions into polynomial ones.

DP fits when both of these hold:

1. **Overlapping sub-problems:** the same smaller question comes up again and again.
2. **Optimal substructure:** the best answer can be built from the best answers to smaller questions.

## From slow recursion to DP: Fibonacci

`fib(n) = fib(n - 1) + fib(n - 2)`, with `fib(0) = 0`, `fib(1) = 1`.

**Plain recursion, O(2ⁿ):** recomputes the same values over and over (see the recursion lesson).

**Top-down: memoisation, O(n).** Same recursion, but remember every answer:

```python
from functools import cache

@cache                      # stores fib(k) the first time it's computed
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

fib(80)   # instant
```

**Bottom-up: tabulation, O(n).** Fill a table from the smallest case upwards, no recursion:

```python
def fib(n):
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

**Space-optimised, O(1) space:** each step only needs the last two values:

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

All four give the same answers; they're just faster and leaner, in that order.

## The five steps for any DP problem

1. **State:** what does `dp[i]` (or `dp[i][j]`) mean, in words? This is the hardest and most important step. Write it down.
2. **Recurrence:** how is `dp[i]` built from smaller states?
3. **Base cases:** the smallest states, answered directly.
4. **Order:** fill states so everything a state needs is already computed (usually smallest first).
5. **Answer:** which state holds the final answer? (Often `dp[n]`, sometimes `max(dp)`.)

## Worked example: unique paths in a grid

> A robot starts top-left of an `m × n` grid and moves only right or down. How many paths reach the bottom-right?

1. **State:** `dp[r][c]` = number of paths from the start to cell (r, c).
2. **Recurrence:** you can only arrive from above or from the left: `dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`.
3. **Base cases:** the first row and first column have exactly 1 path each (straight line).
4. **Order:** row by row, left to right.
5. **Answer:** `dp[m - 1][n - 1]`.

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]          # first row/column are 1
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]

unique_paths(3, 3)   # 6
```

```
1  1  1
1  2  3
1  3  6   ← answer
```

O(m · n) time. Trying every path by recursion would be exponential.

## Spotting a DP problem

- "**How many ways** to…"
- "**Minimum / maximum** cost / profit / length…"
- "**Can you** reach / make / partition…"
- Choices at each step, where a greedy "always take the best now" choice can be wrong.

## A useful way in

Write the **brute-force recursion** first (what are my choices at this step?), see that it repeats work, add `@cache`. That's already a correct DP. Converting it to a bottom-up table is an optional next step.

## How this helps with the module's problems

- **Climbing Stairs:** to reach step i, your last move was 1 or 2 steps, so it's Fibonacci in disguise.
- **Min Cost Climbing Stairs:** `dp[i]` = cheapest cost to stand on step i; you arrived from i − 1 or i − 2.
- **House Robber:** at each house, either **rob** it (and add the best from two houses back) or **skip** it (keep the best from the previous house).
- **Coin Change:** `dp[a]` = fewest coins to make amount a; try every coin as the last one: `dp[a] = 1 + min(dp[a - coin])`. Start with "infinity" for impossible amounts.
- **Longest Increasing Subsequence:** `dp[i]` = length of the longest increasing subsequence **ending at** i; look at every earlier `j` with a smaller value. O(n²), which is fine here (there's a clever O(n log n) version with binary search, worth reading afterwards).

## Check yourself

1. What two properties make a problem suitable for DP?
2. What's the difference between memoisation and tabulation?
3. In "unique paths", why is `dp[r][c] = dp[r-1][c] + dp[r][c-1]`?

### Answers

1. Overlapping sub-problems and optimal substructure.
2. Memoisation is top-down: the normal recursion plus a cache. Tabulation is bottom-up: fill a table in order from the base cases, with no recursion.
3. The robot can only enter cell (r, c) from the cell above or the cell to the left, so the paths to it are the paths to those two cells added together.
