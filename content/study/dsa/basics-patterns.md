Solving a problem is a skill you can practise, not a talent. Follow the same steps every time and you'll get stuck far less, and you'll know what to do when you are stuck.

## The six steps

### 1. Understand it

- Restate the problem in your own words.
- Work through the given examples **by hand**.
- Ask about edge cases: empty input? one item? negatives? duplicates? already sorted? very large numbers?
- Read the constraints. They tell you the target complexity (see the Big-O lesson).

### 2. Brute force first

Find **any** correct solution, even a slow one, and say its complexity. This gives you something that works, and the slow part usually points at the fix.

### 3. Find the bottleneck

Ask: what work am I repeating? Usually it's one of:

- Searching for something again and again → remember it in a **hash map/set**.
- Re-adding the same range → **prefix sums** or a **sliding window**.
- Checking pairs in a sorted array → **two pointers**.
- Re-solving the same sub-problem → **dynamic programming**.

### 4. Pick a pattern

Clues in the problem statement point to a pattern:

| If the problem says… | Try… |
|---|---|
| "sorted array", "find a pair" | Two pointers, binary search |
| "contiguous subarray / substring", "longest / shortest window" | Sliding window |
| "count", "frequency", "seen before", "duplicates" | Hash map / set |
| "next greater / smaller element" | Monotonic stack |
| "matching brackets", "undo", "most recent" | Stack |
| "k largest / smallest", "top k", "merge k sorted" | Heap |
| "minimum in a sorted/monotonic range", "find a boundary" | Binary search |
| "tree" | DFS (recursion) or BFS (level by level) |
| "grid", "islands", "connected", "shortest path (no weights)" | BFS / DFS on a graph |
| "prerequisites", "order of tasks" | Topological sort |
| "all combinations / permutations / subsets" | Backtracking |
| "number of ways", "min / max cost", "can you reach" | Dynamic programming |
| "prefix", "words starting with" | Trie |

### 5. Write the code

Write it cleanly, with good names. Small helper functions are fine.

### 6. Test it, then state the complexity

- Run your examples by hand through the code.
- Run the edge cases from step 1.
- Say the time and space complexity out loud. In an interview, this is expected.

## Worked example

> Given a list of numbers and a number `k`, is there a pair whose **difference** is exactly `k`?

**Understand:** `[1, 5, 3, 4, 2]`, `k = 3` → yes (5 − 2 = 3, also 4 − 1). Edge cases: fewer than 2 numbers → no. `k = 0` → need a repeated number.

**Brute force:** check every pair, O(n²).

```python
def has_diff(nums, k):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if i != j and nums[i] - nums[j] == k:
                return True
    return False
```

**Bottleneck:** for each `x`, the inner loop is just *searching* for `x - k` (or `x + k`). Searching is what a set is for.

**Better:** one pass with a set, O(n) time and O(n) space.

```python
def has_diff(nums, k):
    seen = set()
    for x in nums:
        if x - k in seen or x + k in seen:
            return True
        seen.add(x)
    return False
```

**Test:** `[1, 5, 3, 4, 2]`, `k = 3`: see 1; see 5 (2? 8? no); see 3; see 4 (1 is in seen) → True. ✓

This "brute force → spot the repeated search → use a set or map" move is the most common improvement in the arrays and hashing module.

## How to practise on LeetCode

- **Time-box it.** Try for 25–30 minutes. If you're stuck, read one hint, try again, then read a solution if you need to. Struggling a bit is how it sticks; struggling for two hours isn't.
- **Re-solve it later.** If you needed help, mark it "In progress" and solve it again from scratch in a few days. Only then tick it off.
- **Write a note** on each problem in this app: the pattern, the key idea in one line, the complexity, and what tripped you up. These notes are what you'll revise from before interviews.
- **Say it out loud.** Explain your solution as if to an interviewer. If you can't explain why it works, you don't fully own it yet.

## Check yourself

1. You see "find the longest substring that…". Which pattern do you try first?
2. Why write a brute-force solution if you know it's too slow?
3. Your solution has a loop with `if target - x in nums_list`. What would you change?

### Answers

1. Sliding window: "substring" means contiguous.
2. It proves you understand the problem, gives you something correct to test against, and the repeated work in it usually shows you how to speed it up.
3. `in` on a list is O(n). Use a set (or a dict if you need indexes) so the lookup is O(1).
