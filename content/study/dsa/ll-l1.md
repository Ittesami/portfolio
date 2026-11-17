A **linked list** is a chain of **nodes**. Each node holds a value and a pointer to the next node. Unlike an array, the nodes can be anywhere in memory; only the pointers connect them.

```
head
 ↓
[3 | •]──→[7 | •]──→[1 | •]──→ None
 val next
```

## The node

LeetCode gives you this class:

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# build 3 → 7 → 1
head = ListNode(3, ListNode(7, ListNode(1)))
```

## Walking the list

There's no `head[2]`. To reach a node, follow the pointers from the head:

```python
def print_list(head):
    node = head
    while node:                 # stop at None
        print(node.val)
        node = node.next

def length(head):
    count = 0
    while head:
        count += 1
        head = head.next
    return count
```

## Linked list vs array

| Operation | Array (list) | Linked list |
|---|---|---|
| Read the i-th item | **O(1)** | O(n), walk from the head |
| Insert/delete at the front | O(n) | **O(1)** |
| Insert/delete after a node you have | O(n) (shift) | **O(1)** (re-point) |
| Search for a value | O(n) | O(n) |
| Extra memory | none | one pointer per node |

Linked lists win when you add and remove a lot at known positions; arrays win when you need to jump to positions.

## Changing pointers

Every linked-list operation is just re-pointing `next`. **Draw it** before you code it: boxes and arrows on paper prevent most bugs.

Insert `5` after the node `a`:

```python
new = ListNode(5)
new.next = a.next     # 1. new points to what came after a
a.next = new          # 2. a points to new
```

Do them in that order. If you set `a.next = new` first, you lose the rest of the list.

Delete the node after `a`:

```python
a.next = a.next.next  # skip over it
```

## The dummy head trick

Deleting or inserting at the **head** is a special case (there's no node before it). A **dummy** node placed in front of the head removes the special case:

> Remove every node with value `x`.

```python
def remove_value(head, x):
    dummy = ListNode(0, head)     # dummy → head → …
    prev = dummy
    while prev.next:
        if prev.next.val == x:
            prev.next = prev.next.next   # unlink it, stay put
        else:
            prev = prev.next             # move on
    return dummy.next             # the real head (may have changed)
```

Without the dummy, you'd need extra code for "the head itself has value x". Use a dummy any time the head might change: merging, removing, partitioning.

## Reversing: the core pointer pattern

Reversing a list in place is the most important linked-list skill, because many harder problems use it as a step. You walk the list keeping three pointers:

- `prev`: the part already reversed (starts as `None`),
- `curr`: the node you're working on,
- `nxt`: saved so you don't lose the rest of the list.

At each node: save `curr.next`, point `curr` back at `prev`, then move `prev` and `curr` one step forward.

```
None ← 3    7 → 1 → None
       ↑    ↑
     prev  curr
```

Try writing it yourself from that description: it's the **Reverse Linked List** problem. Draw three nodes on paper and move the arrows by hand first.

## Doubly linked lists

Each node also has `prev`. You can walk both ways and delete a node in O(1) if you have a pointer to it. Used in LRU caches and browser history. More pointers to keep in sync, so more care.

## How this helps with the module's problems

- **Reverse Linked List:** the three-pointer pattern above (or recursion).
- **Merge Two Sorted Lists:** use a dummy head and a `tail` pointer; repeatedly attach the smaller of the two front nodes.
- **Linked List Cycle**, **Remove Nth Node From End**, **Reorder List:** the next lesson (fast and slow pointers).

## Check yourself

1. Why is reading the 1000th item slow in a linked list?
2. When inserting a new node after `a`, why must `new.next = a.next` come first?
3. What problem does a dummy head solve?

### Answers

1. There's no address arithmetic; you have to follow 999 `next` pointers from the head: O(n).
2. Setting `a.next = new` first overwrites the only pointer to the rest of the list, so it's lost.
3. It gives the head a node before it, so inserting or deleting at the head works like anywhere else, and you return `dummy.next` as the (possibly new) head.
