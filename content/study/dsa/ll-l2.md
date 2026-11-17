The **fast and slow pointer** technique (also called "tortoise and hare") moves two pointers through a linked list at **different speeds**, usually 1 step and 2 steps. It finds middles and cycles in **O(n) time and O(1) space**, without counting the length or storing nodes.

## Finding the middle

When `fast` (2 steps) reaches the end, `slow` (1 step) has gone half as far: it's in the middle.

```python
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

```
1 → 2 → 3 → 4 → 5
s/f
    s   f
        s       f        fast.next is None → stop, slow = 3 ✓
```

For an even length (`1 → 2 → 3 → 4`), this returns the **second** middle (3). If you need the first middle (useful when splitting a list in half), loop `while fast.next and fast.next.next` instead.

## Detecting a cycle

If the last node points back into the list, a normal walk never ends. With two speeds:

- No cycle: `fast` reaches `None`.
- A cycle: both pointers end up going round the loop. `fast` gains one step on `slow` every move, so it must eventually **land on the same node** as `slow`; it can't jump over it, because the gap shrinks by exactly 1 each time.

```
1 → 2 → 3 → 4
        ↑   ↓
        6 ← 5
```

So the check is: move them, and if `slow is fast` at any point, there's a cycle. That's **Linked List Cycle** (Floyd's algorithm). Write it using the `middle` loop as your starting shape.

(The simpler alternative is a `set` of visited nodes: O(n) space. Fast/slow does it in O(1).)

## The fixed-gap version: n-th from the end

Same idea, but **same speed with a head start**. To *remove* a node you need the node **before** it, so start both pointers on a **dummy** node in front of the head:

1. Move `fast` n steps ahead.
2. Move both one step at a time while `fast.next` exists (until `fast` is on the last node).
3. `slow` is now on the node just **before** the n-th from the end, so `slow.next = slow.next.next` removes it.

```
remove the 2nd from the end of  D → 1 → 2 → 3 → 4 → 5   (D = dummy)

fast moves 2 ahead:   slow = D, fast = 2
both move:            (1, 3) → (2, 4) → (3, 5)   fast is on the last node: stop
slow = 3, the node before 4 → unlink 4  ✓
```

The gap between them stays exactly n nodes, so when `fast` is on the last node, `slow` is n nodes behind it: one before the n-th from the end. The dummy also covers removing the head itself (with n = 5 above, `slow` never leaves the dummy). That's **Remove Nth Node From End of List** in one pass.

## Combining patterns

Harder list problems are usually small patterns glued together. **Reorder List** (`1 → 2 → 3 → 4 → 5` becomes `1 → 5 → 2 → 4 → 3`) is:

1. Find the middle (fast/slow).
2. Reverse the second half (previous lesson).
3. Merge the two halves by alternating nodes.

Each step on its own is short. Solve them one at a time and test each.

## Check yourself

1. In `middle`, why is the loop condition `fast and fast.next`?
2. Why can't `fast` skip over `slow` inside a cycle?
3. For "n-th from the end", why start from a dummy node when removing?

### Answers

1. `fast` moves two steps, so both `fast` and `fast.next` must exist; otherwise `fast.next.next` would fail on `None`.
2. Each move, `fast` goes 2 and `slow` goes 1, so the gap between them changes by exactly 1. A gap that shrinks by 1 each step must hit 0.
3. To delete a node you need the one before it. Starting from a dummy gives every node, the head included, a node before it, so `slow` can stop there.
