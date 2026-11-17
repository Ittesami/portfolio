A **graph** is a set of **nodes** (also called vertices) connected by **edges**. Trees and linked lists are special graphs; general graphs can have cycles, and any node can connect to any other. Road maps, friendships, course prerequisites, web links and grids are all graphs.

```
  A ─── B
  │   ╱ │
  │  ╱  │
  C ─── D      E      (E has no edges: its own component)
```

## Words you need

| Term | Meaning |
|---|---|
| Undirected | an edge works both ways (friendship) |
| Directed | an edge has a direction, A → B (follows, prerequisites) |
| Weighted | edges have a cost (distance, time) |
| Neighbours | the nodes directly connected to a node |
| Degree | how many edges a node has (in-degree / out-degree when directed) |
| Path | a sequence of edges from one node to another |
| Cycle | a path that comes back to where it started |
| Connected component | a group of nodes all reachable from each other (above: {A, B, C, D} and {E}) |
| DAG | a Directed Acyclic Graph: directed, with no cycles (prerequisites must be one) |

## Representation 1: adjacency list (use this by default)

For each node, a list of its neighbours. In Python, a dict of lists:

```python
from collections import defaultdict

edges = [("A", "B"), ("A", "C"), ("B", "C"), ("B", "D"), ("C", "D")]

graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)      # leave this line out for a directed graph

graph["B"]   # ['A', 'C', 'D']
```

Problems often give nodes as numbers `0..n-1` with an edge list; then a list of lists works too:

```python
n = 4
edges = [[0, 1], [1, 2], [2, 3]]
graph = [[] for _ in range(n)]
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)
```

**Don't forget isolated nodes** (like E): they have no edges, so they never appear in the edge list. If you loop over nodes, loop over `range(n)`, not over the dict's keys.

## Representation 2: adjacency matrix

An n × n grid where `matrix[u][v] = 1` if there's an edge.

```
    A  B  C  D
A [ 0, 1, 1, 0 ]
B [ 1, 0, 1, 1 ]
C [ 1, 1, 0, 1 ]
D [ 0, 1, 1, 0 ]
```

| | Adjacency list | Adjacency matrix |
|---|---|---|
| Space | O(V + E) | O(V²) |
| Is there an edge u–v? | O(degree) | **O(1)** |
| Loop over u's neighbours | **O(degree)** | O(V) |
| Good for | most problems (sparse graphs) | small or very dense graphs |

(V = number of nodes, E = number of edges.) **Number of Provinces** gives you a matrix directly.

## Representation 3: a grid is a graph

Every cell is a node; its neighbours are the cells up, down, left and right. You don't build anything: you compute the neighbours on the fly.

```python
grid = [
    ["1", "1", "0"],
    ["0", "1", "0"],
    ["0", "0", "1"],
]
rows, cols = len(grid), len(grid[0])
DIRECTIONS = [(1, 0), (-1, 0), (0, 1), (0, -1)]

def neighbours(r, c):
    for dr, dc in DIRECTIONS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:     # stay inside the grid
            yield nr, nc
```

Islands, flood fill, mazes and "rotting oranges" are all grid graphs.

## Always track "visited"

Unlike a tree, a graph can lead you back to a node you've already seen (cycles, or two paths to the same node). Without a `visited` set, a search can loop forever or do the same work many times. Every graph traversal in the next lesson starts with one.

## Check yourself

1. Why is an adjacency list usually better than a matrix?
2. In an undirected graph, how many times does each edge appear in an adjacency list?
3. Why do graph searches need a `visited` set when tree searches don't?

### Answers

1. It uses O(V + E) space instead of O(V²), and looping over a node's neighbours only touches real edges. Most real graphs are sparse.
2. Twice: once in each endpoint's list.
3. Trees have no cycles and exactly one path to each node. Graphs can have cycles and several paths, so without `visited` you'd revisit nodes or loop forever.
