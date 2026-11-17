A **binary search tree (BST)** is a binary tree with one rule, at **every** node:

> everything in the **left** subtree is **smaller**, and everything in the **right** subtree is **bigger**.

```
          8
        /   \
       3     10
      / \      \
     1   6      14
        / \     /
       4   7   13
```

Because of that rule, searching works like binary search: at each node you know which half to go to.

## Searching

```python
def search(node, target):
    while node:
        if target == node.val:
            return node
        node = node.left if target < node.val else node.right
    return None
```

Looking for 7: 8 → (smaller) 3 → (bigger) 6 → (bigger) 7 ✓. Four steps, not eight.

## Inserting

Walk down as if searching; where you fall off the tree is where the new value goes.

```python
def insert(node, val):
    if not node:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node
```

## Deleting (three cases)

1. **A leaf:** just remove it.
2. **One child:** replace the node with its child.
3. **Two children:** copy in the **in-order successor** (the smallest value in the right subtree: go right once, then left as far as possible), then delete that successor from the right subtree (it has at most one child, so it's case 1 or 2).

## How fast is it?

Every operation walks one path from the root: **O(h)**, where h is the height.

| Tree shape | Height | Search / insert / delete |
|---|---|---|
| Balanced | log n | **O(log n)** |
| Inserted in sorted order (a "stick") | n | **O(n)**, no better than a list |

```
insert 1, 2, 3, 4 in order:
1
 \
  2
   \
    3
     \
      4        ← really a linked list
```

Real libraries use **self-balancing** trees (red-black, AVL) to keep the height at O(log n). For interviews, knowing why balance matters is usually enough.

## The superpower: in-order is sorted

An **in-order** traversal (left, node, right) of a BST visits the values in **sorted order**: `1 3 4 6 7 8 10 13 14` for the tree above. Many BST problems become easy once you think "it's a sorted list in disguise":

- the k-th smallest is the k-th node of an in-order traversal;
- a tree is a valid BST if its in-order traversal is strictly increasing.

## The classic trap

Checking only that `left.val < node.val < right.val` for each node is **not enough**:

```
      5
     / \
    1   6
       / \
      3   7      ← 3 < 6, fine locally… but 3 is in 5's RIGHT subtree, so it must be > 5 ✗
```

The rule is about whole subtrees. Pass down the allowed range instead: every node has a `(low, high)` window it must fit in. Going left tightens `high` to the parent's value; going right tightens `low`.

## How this helps with the module's problems

- **Search in a BST:** the `search` function above.
- **Validate BST:** pass `(low, high)` bounds down the recursion, or check the in-order traversal is strictly increasing.
- **Lowest Common Ancestor in a BST:** start at the root. If both values are smaller, the answer is on the left; if both are bigger, on the right; otherwise this node is where their paths split, and that's the answer.
- **Kth Smallest:** in-order traversal, stop at the k-th node.

## Check yourself

1. Why is a BST search O(log n) only when the tree is balanced?
2. What do you get from an in-order traversal of a BST?
3. Why isn't comparing each node with its two children enough to validate a BST?

### Answers

1. Search walks one root-to-leaf path, which is the height. Balanced, the height is about log n; badly unbalanced (sorted inserts), it's n.
2. All the values in sorted (increasing) order.
3. The rule applies to whole subtrees: a node deep in the right subtree must be bigger than every ancestor it's to the right of, not just its parent.
