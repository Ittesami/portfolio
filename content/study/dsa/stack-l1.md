A **stack** is a pile: you add to the top and take from the top. The last thing in is the first thing out (**LIFO**). Think of a stack of plates, or the "undo" button.

## Operations

| Operation | Meaning | Python (list) | Cost |
|---|---|---|---|
| push | put on top | `stack.append(x)` | O(1) |
| pop | take from top | `stack.pop()` | O(1) |
| peek | look at top | `stack[-1]` | O(1) |
| is empty | | `not stack` | O(1) |

A Python list is a perfect stack, as long as you only use the **end**. Always check it's not empty before `pop()` or `stack[-1]`, or you'll get an `IndexError`.

```python
stack = []
stack.append(1)
stack.append(2)
stack.append(3)     # [1, 2, 3]  top is 3
stack.pop()         # 3          [1, 2]
stack[-1]           # 2
```

## Where stacks show up

- **Undo / back button:** the most recent action is undone first.
- **The call stack:** when a function calls another, the caller waits on a stack until the callee returns. That's why deep recursion can "overflow the stack".
- **Matching pairs:** brackets, HTML tags. The most recently opened thing must be closed first.
- **Expression evaluation:** calculators.
- **Depth-first search** without recursion (graphs module).

## Example: remove adjacent duplicates

> Repeatedly remove two equal letters next to each other: `"abbaca"` → `"ca"`.

The stack holds the letters kept so far. When the new letter matches the top, they cancel out:

```python
def remove_adjacent_duplicates(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()          # cancel the pair
        else:
            stack.append(ch)
    return "".join(stack)
```

| ch | stack after |
|---|---|
| a | [a] |
| b | [a, b] |
| b | [a] (b cancels b) |
| a | [] (a cancels a) |
| c | [c] |
| a | [c, a] |

Result: `"ca"`. O(n) time, O(n) space.

## Example: evaluating with a stack

Stacks naturally handle "work on the two most recent things". To evaluate an expression written in postfix style, `2 3 + 4 *` (meaning (2 + 3) × 4):

1. Numbers are pushed.
2. An operator pops the two most recent numbers, combines them, and pushes the result.

```
2      → [2]
3      → [2, 3]
+      → pop 3, pop 2, push 5 → [5]
4      → [5, 4]
*      → pop 4, pop 5, push 20 → [20]
```

Watch the order when popping: the **first** pop is the **right-hand** operand. That matters for `-` and `/`.

## Stack with extra info

Sometimes you push more than the value, for example a pair `(value, something_about_the_stack_so_far)`. Storing that extra info **at push time** lets you answer questions about the whole stack in O(1) later, because when you pop, the info for the remaining stack is already sitting on the new top.

## How this helps with the module's problems

- **Valid Parentheses:** push opening brackets; on a closing bracket, the top must be its matching opener. At the end, the stack must be empty.
- **Min Stack:** "stack with extra info": what extra value would you store with each push so `getMin()` is O(1) even after pops?
- **Evaluate Reverse Polish Notation:** exactly the evaluation example above. Watch the operand order, and that division truncates toward zero (`int(a / b)` in Python).
- **Daily Temperatures:** the next lesson (monotonic stacks).

## Check yourself

1. Why is a Python list a good stack but a bad queue?
2. In Valid Parentheses, what should the stack look like at the end for a valid string?
3. With postfix `8 2 -`, which number is popped first, and what's the result?

### Answers

1. Stacks only touch the end, where `append` and `pop` are O(1). A queue removes from the front, and `pop(0)` is O(n).
2. Empty: every opener has been matched and popped.
3. `2` is popped first (it's the right-hand operand), then `8`, so the result is `8 - 2 = 6`.
