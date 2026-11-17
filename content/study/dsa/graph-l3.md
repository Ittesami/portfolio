A **topological sort** puts the nodes of a **directed** graph in an order where every edge points forward: if A → B ("A must come before B"), A appears before B. It's how build systems, package managers and course planners decide an order.

```
socks → shoes
pants → shoes
pants → belt
shirt → belt → jacket

one valid order: socks, pants, shirt, shoes, belt, jacket
```

There can be many valid orders. There's **no** valid order if the graph has a **cycle** (A before B before A), so topological sort only works on a **DAG** (directed acyclic graph). That also makes it a cycle detector.

## Kahn's algorithm (BFS with in-degrees)

The **in-degree** of a node is how many edges point into it: how many things must come before it.

1. Count every node's in-degree.
2. Put every node with in-degree 0 (nothing required first) in a queue.
3. Repeatedly take a node from the queue and add it to the order. "Remove" its outgoing edges: decrease each neighbour's in-degree, and if one drops to 0, it's now free, so queue it.
4. If the order contains **all** nodes, it's valid. If not, the leftover nodes are stuck waiting on each other: there's a **cycle**.

```python
from collections import deque, defaultdict

def topo_order(n, edges):          # edges: (a, b) means a must come before b
    graph = defaultdict(list)
    indegree = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indegree[b] += 1

    q = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)

    return order if len(order) == n else None    # None: there's a cycle

topo_order(4, [(0, 1), (0, 2), (1, 3), (2, 3)])  # [0, 1, 2, 3]
topo_order(2, [(0, 1), (1, 0)])                  # None (cycle)
```

### Walkthrough

Edges `0→1, 0→2, 1→3, 2→3`; in-degrees `[0, 1, 1, 2]`.

| Step | Take | In-degrees after | Queue | Order |
|---|---|---|---|---|
| start | | [0, 1, 1, 2] | [0] | [] |
| 1 | 0 | [0, 0, 0, 2] | [1, 2] | [0] |
| 2 | 1 | [0, 0, 0, 1] | [2] | [0, 1] |
| 3 | 2 | [0, 0, 0, 0] | [3] | [0, 1, 2] |
| 4 | 3 | | [] | [0, 1, 2, 3] ✓ |

**O(V + E)** time and space.

## The DFS way (cycle detection with three colours)

DFS can also detect cycles in a directed graph by tracking each node's state:

- **unvisited**,
- **visiting** (it's on the current DFS path),
- **done** (it and everything after it are finished).

If DFS reaches a node that's **visiting**, it has come back round to its own path: a cycle. Adding nodes to a list when they become **done**, then reversing that list, also gives a topological order.

Kahn's is usually easier to get right; knowing both helps in interviews.

## Watch the edge direction

Problems phrase prerequisites differently. "To take course 1 you must take course 0", given as `[1, 0]`, means the edge goes **0 → 1**. Draw one example before coding: a reversed edge silently gives a reversed order (cycle checks still work, but orders come out backwards).

## How this helps with the module's problems

- **Course Schedule:** can you finish every course? Build the graph from the prerequisite pairs (mind the direction) and check whether Kahn's algorithm processes all of them, which is the same as "is there no cycle?".

## Check yourself

1. Why can't a graph with a cycle be topologically sorted?
2. In Kahn's algorithm, what does it mean if the final order is shorter than the number of nodes?
3. What's the time complexity of Kahn's algorithm?

### Answers

1. In a cycle, each node must come before the next, all the way round to itself, so no order satisfies every edge.
2. Some nodes never reached in-degree 0: they're stuck in or behind a cycle.
3. O(V + E): each node is queued once and each edge is looked at once.
