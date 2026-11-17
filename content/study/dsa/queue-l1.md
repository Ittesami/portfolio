A **queue** is a line: you join at the back and leave from the front. First in, first out (**FIFO**). A **deque** ("deck", double-ended queue) lets you add and remove at **both** ends.

## Use `collections.deque`, not a list

Removing from the front of a list (`pop(0)`) shifts every item: O(n). A `deque` is built for both ends:

| Operation | `deque` | `list` |
|---|---|---|
| Add to back `append(x)` | O(1) | O(1) |
| Remove from front `popleft()` | **O(1)** | `pop(0)` is **O(n)** |
| Add to front `appendleft(x)` | O(1) | `insert(0, x)` is O(n) |
| Remove from back `pop()` | O(1) | O(1) |
| Peek front / back | `q[0]`, `q[-1]` | |

```python
from collections import deque

q = deque()
q.append("a")       # join the back
q.append("b")
q.append("c")       # deque(['a', 'b', 'c'])
q.popleft()         # 'a' leaves first
q[0]                # 'b' is next
```

(`queue.Queue` is a different thing, for sharing work between threads. In LeetCode, use `deque`.)

## Where queues show up

- **Breadth-first search (BFS):** explore a tree or graph level by level, nearest first. This is the big one; you'll use it in trees and graphs.
- **Processing in arrival order:** print jobs, requests, messages.
- **Sliding windows over a stream:** keep only the recent items.

## Example: recent events in the last 10 seconds

> Each time an event arrives at time `t` (always increasing), return how many events happened in the last 10 seconds, including this one.

```python
from collections import deque

class RecentEvents:
    def __init__(self):
        self.times = deque()

    def add(self, t):
        self.times.append(t)
        while self.times[0] < t - 10:   # too old: drop from the front
            self.times.popleft()
        return len(self.times)

r = RecentEvents()
r.add(1)    # 1
r.add(5)    # 2
r.add(12)   # 2  (1 is now too old)
```

Each time is added once and removed at most once, so it's **amortised O(1)** per call. That's the shape of **Number of Recent Calls**.

## Example: BFS preview

BFS uses a queue so the nearest things are processed first:

```python
from collections import deque

def bfs_order(start, neighbours):
    seen = {start}
    q = deque([start])
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in neighbours[node]:
            if nxt not in seen:
                seen.add(nxt)
                q.append(nxt)
    return order
```

You'll use exactly this shape in the trees and graphs modules.

## A queue from two stacks

A classic interview question: build a queue using only stacks (push to top, pop from top).

Idea: use an **in** stack for new items and an **out** stack for removing. When `out` is empty and you need the front, pour everything from `in` into `out`. Pouring reverses the order, so the oldest item ends up on top of `out`.

```
push 1, 2, 3  →  in: [1, 2, 3]   out: []
pop           →  pour: in: []   out: [3, 2, 1]  → pop 1 ✓
push 4        →  in: [4]        out: [3, 2]
pop           →  out not empty → pop 2 ✓
```

Each item is poured at most once, so every operation is **amortised O(1)**. That's **Implement Queue using Stacks**.

## Monotonic deque

A deque can also be kept in order (like a monotonic stack), dropping from the back anything that can never be the answer again, and from the front anything that has left the window. This gives the **maximum of every window** in O(n) overall. It's the idea behind **Sliding Window Maximum** (a Hard problem): keep indexes in the deque, with their values decreasing, so the front is always the current window's maximum.

## Check yourself

1. Why is `list.pop(0)` a bad idea inside a loop?
2. In the two-stacks queue, when do you pour from `in` to `out`?
3. Why does BFS use a queue and not a stack?

### Answers

1. It's O(n) each time, so a loop of n pops becomes O(n²). `deque.popleft()` is O(1).
2. Only when `out` is empty and you need to pop or peek. Pouring while `out` still has items would put newer items on top of older ones.
3. A queue processes things in the order they were found, which is nearest first (level by level). A stack would go deep first (that's DFS).
