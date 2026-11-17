The two ways to explore a graph are **BFS** (breadth-first: nearest first, with a queue) and **DFS** (depth-first: one path as far as it goes, with recursion or a stack). Both visit every reachable node once: **O(V + E) time**.

## BFS: nearest first

```python
from collections import deque

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)      # mark when you ADD to the queue
                q.append(nxt)
    return order
```

Mark nodes as visited **when you add them** to the queue, not when you pop them; otherwise the same node can be queued several times.

### BFS gives shortest paths (when edges have no weights)

Because BFS explores in rings of distance 1, then 2, then 3, the first time it reaches a node is along a shortest path:

```python
from collections import deque

def distances_from(graph, start):
    dist = {start: 0}
    q = deque([start])
    while q:
        node = q.popleft()
        for nxt in graph[node]:
            if nxt not in dist:
                dist[nxt] = dist[node] + 1
                q.append(nxt)
    return dist
```

"Fewest steps", "minimum moves", "shortest path" in an **unweighted** graph or grid → BFS. (With weights, you need Dijkstra's algorithm, which uses a heap.)

### Multi-source BFS

Start BFS from **several** nodes at once by putting them all in the queue at the beginning (with distance 0). The rings then spread from all of them together. That's how **Rotting Oranges** works: all rotten oranges start in the queue, and each BFS level is one minute.

## DFS: go deep

Recursive:

```python
def dfs(graph, node, visited):
    visited.add(node)
    for nxt in graph[node]:
        if nxt not in visited:
            dfs(graph, nxt, visited)
```

Iterative, with a stack (avoids Python's recursion limit on huge graphs):

```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        for nxt in graph[node]:
            if nxt not in visited:
                stack.append(nxt)
    return visited
```

## Counting connected components

Loop over **every** node; each time you find one that's not visited yet, that's a new component, so explore all of it:

```python
def count_components(n, graph):
    visited = set()
    count = 0
    for node in range(n):
        if node not in visited:
            count += 1
            dfs(graph, node, visited)   # marks the whole component
    return count
```

## On a grid: flood fill

> Starting from a cell, recolour every connected cell of the same colour.

```python
def flood_fill(image, sr, sc, new_color):
    old = image[sr][sc]
    if old == new_color:
        return image
    rows, cols = len(image), len(image[0])

    def fill(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return                    # outside the grid
        if image[r][c] != old:
            return                    # different colour (or already filled)
        image[r][c] = new_color       # recolouring also marks it as visited
        fill(r + 1, c)
        fill(r - 1, c)
        fill(r, c + 1)
        fill(r, c - 1)

    fill(sr, sc)
    return image
```

Note the trick: changing the cell itself works as the "visited" mark, so there's no separate set. Count how many times you have to *start* a fill and you're counting components on a grid. That's the core of **Number of Islands**.

## Copying a graph

To clone a graph, walk it (BFS or DFS) and keep a dict **old node → new node**. The dict is both your `visited` set and the way to connect new nodes to each other. That's **Clone Graph**.

## BFS or DFS?

| Need | Use |
|---|---|
| Shortest path / fewest steps (unweighted) | BFS |
| Spreading in rounds ("minutes", "levels") | BFS (multi-source if many starts) |
| Just visit everything / count components | either; DFS is shorter to write |
| Explore whole paths, detect cycles, topological order | DFS (or Kahn's BFS, next lesson) |

## How this helps with the module's problems

- **Find if Path Exists:** BFS or DFS from `source`; is `destination` visited?
- **Number of Islands:** count how many flood fills you start.
- **Clone Graph:** traversal plus an old → new dict.
- **Rotting Oranges:** multi-source BFS, counting levels as minutes; check at the end that no fresh orange is left.
- **Course Schedule:** the next lesson (topological sort / cycle detection).

## Check yourself

1. Why does BFS find the shortest path in an unweighted graph?
2. In BFS, why mark a node visited when it's added to the queue rather than when it's removed?
3. How do you count connected components?

### Answers

1. It explores all nodes at distance 1, then 2, and so on, so the first time it reaches a node, no shorter path exists.
2. Otherwise a node can be added to the queue several times (from several neighbours) before it's processed, wasting work.
3. Loop over every node; each unvisited node you find starts a new component, which you then explore fully (BFS/DFS) to mark all of it.
