**Breadth-first search (BFS)** visits a tree **level by level**: the root, then all nodes at depth 1, then depth 2, and so on. It uses a **queue** so nodes are processed in the order they were discovered.

```
        3
       / \
      9   20
         /  \
        15   7

BFS order: 3, 9, 20, 15, 7
by level:  [3], [9, 20], [15, 7]
```

## Plain BFS

```python
from collections import deque

def bfs(root):
    if not root:
        return []
    order = []
    q = deque([root])
    while q:
        node = q.popleft()          # oldest first
        order.append(node.val)
        if node.left:
            q.append(node.left)
        if node.right:
            q.append(node.right)
    return order
```

## Level by level

Many problems need to know **where one level ends**. The trick: at the start of each round, the queue holds **exactly one whole level**. Take `len(q)` items, which is that level, and their children form the next one.

```python
from collections import deque

def level_averages(root):
    if not root:
        return []
    result = []
    q = deque([root])
    while q:
        size = len(q)               # number of nodes in this level
        total = 0
        for _ in range(size):
            node = q.popleft()
            total += node.val
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        result.append(total / size)
    return result

level_averages(root)   # [3.0, 14.5, 11.0]
```

Swap the body and you get a family of problems: the rightmost node of each level (a "right side view"), the max of each level, zigzag order, the minimum depth (the first level with a leaf).

## BFS or DFS?

| Use BFS when… | Use DFS when… |
|---|---|
| the problem is about **levels** or "row by row" | the answer comes from combining subtrees |
| you want the **shortest** path / minimum depth (BFS finds it first) | you need to explore whole paths (root to leaf) |
| the tree is very deep (DFS recursion could be too deep) | the tree is very wide (BFS's queue holds a whole level) |

## Complexity

Each node is added to and removed from the queue once: **O(n) time**. The queue holds at most one level, which can be up to about n/2 nodes in a full tree: **O(n) space** in the worst case.

## How this helps with the module's problems

- **Binary Tree Level Order Traversal:** the level-by-level template, collecting each level's values into a list instead of averaging them.
- **Maximum Depth** (also in DFS): count how many levels BFS processes.

## Check yourself

1. Why does BFS use a queue?
2. In the level-by-level loop, why save `size = len(q)` before the `for` loop?
3. You need the minimum depth of a tree (the nearest leaf). Why is BFS a good fit?

### Answers

1. So nodes are processed in the order they were found, which is level by level (nearest first).
2. Because the loop adds the next level's nodes to the queue as it goes. Saving the size first means you process exactly this level's nodes.
3. BFS reaches levels in order, so the first leaf it meets is the nearest one; you can stop right there instead of exploring the whole tree.
