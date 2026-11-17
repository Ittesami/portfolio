**Backtracking** builds every possible answer **one choice at a time**. After exploring a choice, it **undoes** it and tries the next one. It's how you generate all subsets, permutations and combinations, and solve puzzles like Sudoku and N-Queens.

## The decision tree

Every backtracking problem is a tree of choices. Generating all strings of length 3 from `a`/`b`:

```
                    ""
             /               \
           "a"               "b"
         /     \           /     \
      "aa"    "ab"      "ba"    "bb"
      /  \    /  \      /  \    /  \
   aaa  aab aba abb  baa  bab bba bbb      ← the 8 answers (leaves)
```

Backtracking is a DFS of this tree.

## The template: choose, explore, un-choose

```python
def backtrack(path, choices):
    if path is a complete answer:
        results.append(path.copy())    # copy! path keeps changing
        return
    for choice in choices:
        if choice is not allowed:
            continue                   # prune
        path.append(choice)            # 1. choose
        backtrack(path, next_choices)  # 2. explore
        path.pop()                     # 3. un-choose (backtrack)
```

The `pop()` puts `path` back exactly as it was, so the next choice starts clean. That one line is what makes it *back*tracking.

## Example: combinations of k numbers from 1..n

> All ways to pick 2 numbers from 1..4: `[1,2] [1,3] [1,4] [2,3] [2,4] [3,4]`.

To avoid repeats like `[2,1]`, only choose numbers **bigger** than the last one: pass a `start`.

```python
def combine(n, k):
    results = []
    path = []

    def backtrack(start):
        if len(path) == k:
            results.append(path.copy())
            return
        for x in range(start, n + 1):
            path.append(x)          # choose
            backtrack(x + 1)        # explore with bigger numbers only
            path.pop()              # un-choose

    backtrack(1)
    return results

combine(4, 2)   # [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
```

Trace the start: path `[1]` → `[1, 2]` saved → pop → `[1, 3]` saved → pop → `[1, 4]` saved → pop → pop 1 → `[2]` → …

## Pruning

Cutting off branches that can't lead to an answer makes backtracking far faster. In `combine`, if there aren't enough numbers left to reach length k, stop early:

```python
for x in range(start, n - (k - len(path)) + 2):
```

In sum problems, if the running total is already too big (and numbers are positive), stop that branch.

## The three classic shapes

| Problem | What changes between them |
|---|---|
| **Subsets** | every node of the tree is an answer (save at each call, not only at full length); pass `start` so each element is used once and order doesn't matter |
| **Combinations** | save when the path reaches the target length or sum; pass `start` |
| **Permutations** | order matters, so every unused element is a choice at each level; track `used` (a set or boolean list) instead of `start` |

And one twist:

- **Elements can be reused** (like Combination Sum): recurse with the **same** index (`backtrack(i)`), not `i + 1`.

## Complexity

Backtracking is exponential, because the number of answers is: 2ⁿ subsets, n! permutations. That's fine, because the constraints are small (n ≤ 10–20). If you see small n and "all possible", think backtracking.

## How this helps with the module's problems

- **Subsets:** the subsets shape. Two styles work: "include or exclude each element", or the `start` loop.
- **Permutations:** the permutations shape with a `used` tracker.
- **Combination Sum:** the combinations shape, keeping a running sum, reusing the same index, and stopping when the sum goes over the target (sorting the candidates first makes that pruning cleaner).

## Check yourself

1. Why do you append `path.copy()` instead of `path`?
2. What does the `start` index prevent in combinations?
3. How does Combination Sum allow reusing a number?

### Answers

1. `path` is one list that keeps changing; saving it directly would store the same list many times, which ends up empty. A copy freezes it.
2. It stops the same combination in a different order (`[2, 1]` after `[1, 2]`), because each step only chooses later numbers.
3. By recursing with the same index (`backtrack(i)`) instead of `i + 1`, so the same number can be chosen again.
