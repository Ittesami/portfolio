A **tree** is made of nodes connected by edges, branching from one top node with no cycles. In a **binary tree**, each node has at most two children: `left` and `right`.

```
        1          ← root
       / \
      2   3
     / \    \
    4   5    6     ← 4, 5, 6 are leaves (no children)
```

## Words you need

| Term | Meaning (for the tree above) |
|---|---|
| Root | the top node (1) |
| Parent / child | 2 is the parent of 4 and 5 |
| Leaf | a node with no children (4, 5, 6) |
| Subtree | a node plus everything below it (2, 4, 5) |
| Depth of a node | edges from the root (depth of 5 is 2) |
| Height of the tree | edges on the longest root-to-leaf path (2) |
| Balanced | left and right heights differ by at most 1 at every node |

(Some problems count nodes instead of edges for depth; read the problem's definition.)

## The node

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3, None, TreeNode(6)))
```

## Depth-first traversals (DFS)

DFS goes as deep as possible down one branch before backing up. There are three orders, depending on **when you visit the node itself**:

```python
def preorder(node):          # node, left, right
    if not node:
        return
    print(node.val)
    preorder(node.left)
    preorder(node.right)

def inorder(node):           # left, node, right
    if not node:
        return
    inorder(node.left)
    print(node.val)
    inorder(node.right)

def postorder(node):         # left, right, node
    if not node:
        return
    postorder(node.left)
    postorder(node.right)
    print(node.val)
```

For the tree above:

| Order | Output | Typical use |
|---|---|---|
| Pre-order | 1 2 4 5 3 6 | copying a tree, saving it |
| In-order | 4 2 5 1 3 6 | sorted order in a **BST** (next module) |
| Post-order | 4 5 2 6 3 1 | when a node needs its children's answers first (heights, sizes, deleting) |

## The key recursive idea

Most tree problems are solved by this thought:

> If I knew the answer for my **left** subtree and my **right** subtree, how would I combine them into the answer for **me**?

Plus a **base case** for an empty tree (`None`).

```python
def count_nodes(node):
    if not node:
        return 0                                      # empty tree
    return 1 + count_nodes(node.left) + count_nodes(node.right)

def tree_sum(node):
    if not node:
        return 0
    return node.val + tree_sum(node.left) + tree_sum(node.right)

def contains(node, target):
    if not node:
        return False
    return node.val == target or contains(node.left, target) or contains(node.right, target)
```

Trust the recursion: don't trace every call in your head. Check the base case, check the combine step, and it works for every size.

## Returning more than one thing

Sometimes a node needs one value from its children (like a height) but the problem asks for something else (like the longest path anywhere). Then the recursive function **returns** one thing and **updates an outside variable** with the other:

```python
def longest_path_through_any_node(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)     # a path that bends at this node
        return 1 + max(left, right)        # what the parent needs
    height(root)
    return best
```

That's the shape of **Diameter of Binary Tree**.

## Complexity

Every node is visited once: **O(n) time**. The space is the recursion depth, which is the **height** h: O(log n) for a balanced tree, O(n) for a tree that's a straight line.

## How this helps with the module's problems

- **Maximum Depth:** combine as `1 + max(left depth, right depth)`.
- **Invert Binary Tree:** swap each node's children, then invert both subtrees.
- **Same Tree:** two trees are the same if the roots match and both pairs of subtrees are the same. Mind the cases where one side is `None` and the other isn't.
- **Diameter:** the "return one thing, update another" shape above. (It's very close to a full answer, so try writing it without looking.)
- **Level Order Traversal:** the next lesson (BFS).

## Check yourself

1. Which traversal visits the node after both its children?
2. What's the base case in almost every recursive tree function?
3. What's the space complexity of DFS on a tree shaped like a straight line of n nodes?

### Answers

1. Post-order.
2. The empty tree: `if not node: return <answer for empty>`.
3. O(n): the recursion goes n levels deep.
