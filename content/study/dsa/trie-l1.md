A **trie** (say "try", from re*trie*val), also called a **prefix tree**, stores words letter by letter in a tree. Words that start the same way **share** the same path. It answers "is this a word?" and "does any word start with this?" in time proportional to the **word's length**, no matter how many words are stored.

## The shape

Storing `cat`, `car`, `cart`, `dog`:

```
            (root)
           /      \
          c        d
          |        |
          a        o
         / \       |
        t*  r*     g*
            |
            t*
```

`*` marks "a word ends here". The mark matters: `car` is a word, but `ca` isn't, even though its path exists.

## The node

Each node has:

- `children`: a dict from a letter to the next node,
- `is_end`: does a word end at this node?

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
```

## Inserting a word

Walk down letter by letter, creating nodes that don't exist yet, and mark the last one:

```python
class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True
```

## Searching (try it yourself)

`search(word)` and `starts_with(prefix)` use the **same walk** without creating nodes:

- If a letter is missing from `children` along the way → not found.
- If you reach the end of the input:
  - for `search`, the answer is the last node's `is_end` (the path exists, but is it a whole word?);
  - for `starts_with`, the answer is simply yes.

Writing those two methods is the **Implement Trie** problem: about ten lines with the walk above as a guide.

## Costs

| Operation | Time (L = word length) |
|---|---|
| insert | O(L) |
| search | O(L) |
| starts_with | O(L) |
| Space | up to O(total letters stored), shared prefixes are stored once |

Compare with a set of words: `word in set` is also about O(L) (hashing reads the word), but a set **can't** answer "any word starting with `ca`?" without checking every word.

## Where tries are used

- Autocomplete and search suggestions (find the prefix node, then collect the words below it).
- Spell checkers.
- Word games and grid word search (stop exploring the grid as soon as the prefix isn't in the trie).

## Wildcards

> Search where `.` matches any single letter: `c.t`.

When you hit a `.`, you can't follow one child: you have to try **every** child and see if any of them leads to a match. That's a small **recursive DFS** from that node:

- normal letter → follow that one child (or fail),
- `.` → try each child with the rest of the pattern,
- end of the pattern → return `is_end`.

That's **Design Add and Search Words**.

## Check yourself

1. Why does each node need `is_end` and not just the path?
2. What's the time to check whether `"apple"` is in a trie holding a million words?
3. What can a trie do that a set of words can't do quickly?

### Answers

1. A path can exist because of a longer word (`car` makes the path `c-a`), but that doesn't make `ca` a word. `is_end` records where real words end.
2. O(5): it depends on the word's length, not on how many words are stored.
3. Prefix questions: "is any word starting with this?" or "list all words with this prefix" without scanning every word.
