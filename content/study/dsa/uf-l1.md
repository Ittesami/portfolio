**Union-find** (also called a **disjoint set union**, DSU) keeps track of items split into groups, and answers two questions very fast:

- **find(x):** which group is x in?
- **union(x, y):** merge x's group and y's group.

It's the go-to tool for "are these two things connected?" when connections are **added over time**.

## The idea

Each group is a little tree, and the **root** is the group's representative. `parent[x]` points towards the root; a root points to itself.

```
start: every item is its own group
parent = [0, 1, 2, 3, 4]

union(0, 1): root of 1 now points to root of 0
union(2, 3)
union(1, 3): root of 3's group (2) now points to root of 1's group (0)

      0          4
     / \
    1   2
        |
        3
find(3) → 3 → 2 → 0     so 3 is in group 0
```

Two items are in the same group exactly when `find` gives the same root.

## The code, with both speed-ups

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.groups = n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                 # already in the same group
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra              # union by size: attach the smaller tree
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.groups -= 1
        return True
```

Two tricks keep the trees almost flat:

1. **Path compression:** after `find(x)` walks up to the root, every node on that path is pointed straight at the root, so next time it's one step.
2. **Union by size (or rank):** attach the smaller tree under the bigger one, so trees don't grow tall.

With both, each operation is effectively **O(1)** (technically O(α(n)), the inverse Ackermann function, which is below 5 for any input size you'll ever see).

## Example: number of connected components

```python
def count_components(n, edges):
    dsu = DSU(n)
    for a, b in edges:
        dsu.union(a, b)
    return dsu.groups

count_components(5, [[0, 1], [1, 2], [3, 4]])   # 2: {0, 1, 2} and {3, 4}
```

You could do the same with BFS/DFS. Union-find shines when edges arrive **one at a time** and you need the answer after each one, or when you need to know whether an edge joins two **already-connected** nodes.

## Detecting a cycle in an undirected graph

Add edges one by one. If `union(a, b)` returns **False**, a and b were already connected, so this edge closes a **cycle**. That's exactly what **Redundant Connection** asks for.

## Where else it appears

- **Kruskal's minimum spanning tree:** sort edges by weight and add each one unless it would make a cycle.
- Grouping accounts or emails that share an identifier.
- Grid problems where land is added over time ("number of islands II").

## How this helps with the module's problems

- **Number of Provinces:** the input is an adjacency matrix; union every connected pair, then count the groups. (DFS works too: try both.)
- **Redundant Connection:** the first edge whose `union` fails is the answer.

## Check yourself

1. What does it mean if `find(a) == find(b)`?
2. What do path compression and union by size each prevent?
3. How does union-find spot a cycle in an undirected graph?

### Answers

1. a and b are in the same group (connected).
2. Both stop the trees from becoming tall chains: path compression flattens paths as you use them, and union by size never hangs a big tree under a small one.
3. When adding an edge between two nodes that already have the same root, they were already connected, so the new edge closes a cycle.
