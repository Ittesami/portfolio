A **heap** gives you the **smallest** (or largest) item instantly, and lets you add and remove items in **O(log n)**. It's the data structure behind a **priority queue**: "always serve the most important thing next".

## The shape and the rule

A heap is a **complete binary tree** (every level full except the last, which fills from the left) with one rule:

- **Min-heap:** every parent is **≤** its children, so the smallest item is at the root.
- **Max-heap:** every parent is ≥ its children.

```
        1
      /   \
     3     2
    / \   /
   7   4 5
```

Unlike a BST, there's no left/right ordering: 3 and 2 can be either way round. Only "parent ≤ children" matters, which is all you need to find the minimum.

## Stored in a plain list

Because the tree is complete, it fits in a list with no gaps:

```
index:  0  1  2  3  4  5
value: [1, 3, 2, 7, 4, 5]

children of i:  2i + 1 and 2i + 2
parent of i:    (i - 1) // 2
```

## How push and pop work

- **Push:** add the item at the end, then **sift up**: swap it with its parent while it's smaller. At most one swap per level: O(log n).
- **Pop the min:** take the root, move the **last** item to the root, then **sift down**: swap it with its smaller child while it's bigger than that child: O(log n).
- **Peek:** the root, `heap[0]`: O(1).
- **Heapify** a whole list in place: O(n) (cheaper than n pushes).

## Python's `heapq`

`heapq` turns a normal list into a **min-heap**:

```python
import heapq

h = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
h[0]                  # 1: the smallest, O(1)
heapq.heappop(h)      # 1, O(log n)
heapq.heappop(h)      # 3

nums = [5, 1, 8, 3]
heapq.heapify(nums)   # in place, O(n)
heapq.nsmallest(2, [5, 1, 8, 3])   # [1, 3]
```

**Max-heap:** there's no built-in one. Push **negated** numbers and negate again when you pop:

```python
h = []
for x in [5, 1, 8]:
    heapq.heappush(h, -x)
-heapq.heappop(h)     # 8
```

**Priorities:** push tuples. They're compared by the first item, then the second if there's a tie:

```python
tasks = []
heapq.heappush(tasks, (2, "write report"))
heapq.heappush(tasks, (1, "fix bug"))
heapq.heappop(tasks)  # (1, 'fix bug')
```

| Operation | Cost |
|---|---|
| peek min `h[0]` | O(1) |
| push / pop | O(log n) |
| heapify a list | O(n) |
| search for an arbitrary item | O(n): heaps aren't for searching |

## Pattern: top k with a heap of size k

> The k largest numbers from a huge list.

Sorting is O(n log n). Better: keep a **min-heap of the k largest seen so far**. Its root is the smallest of them, the one to evict when something bigger arrives.

```python
import heapq

def k_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)      # drop the smallest of the k + 1
    return sorted(h, reverse=True)

k_largest([3, 1, 5, 12, 2, 11], 3)   # [12, 11, 5]
```

O(n log k) time, O(k) space. With k much smaller than n, that's a big win. Note the twist: **for the k largest, use a min-heap** (and for the k smallest, a max-heap).

## Other heap patterns

- **Merge k sorted lists:** push the first item of each list; pop the smallest, push the next item from its list.
- **Running median:** a max-heap for the lower half and a min-heap for the upper half.
- **Dijkstra's shortest path** (weighted graphs): always expand the closest unvisited node next.

## How this helps with the module's problems

- **Kth Largest Element in a Stream:** keep a min-heap of size k; the answer is always `h[0]`.
- **Last Stone Weight:** a max-heap (negated numbers): pop the two heaviest, push back the difference.
- **K Closest Points to Origin:** the top-k pattern, keyed on distance (you don't need the square root to compare distances).
- **Kth Largest Element in an Array:** the top-k pattern; the answer is the root at the end.

## Check yourself

1. Where is the smallest item in a min-heap, and how fast can you read it?
2. To keep the k largest items, which kind of heap do you use, and why?
3. How do you get a max-heap from `heapq`?

### Answers

1. At the root, `h[0]`, in O(1).
2. A min-heap of size k: its root is the smallest of your k candidates, which is exactly the one to throw out when a bigger item comes along.
3. Push negated values (`-x`) and negate when you pop.
