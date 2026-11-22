## What you're building

**Ask my notes**: a question box that answers from your own study notes (the DSA and AWS lesson notes in this app, this AI course's notes, and your MSc notes), with citations to the exact note and section.

```
? When should I use a heap instead of sorting?

Use a heap when you only need the top k items or keep adding items while
repeatedly taking the smallest/largest: O(log n) per push/pop vs re-sorting [1].
For a one-off full ordering, sorting is simpler [1][2].

[1] DSA › Heaps › When to use a heap
[2] DSA › Big-O › Sorting costs
```

## Steps

1. **Collect** the markdown in `content/study/**` plus any MSc notes (export to markdown/text).
2. **Chunk** by heading with the chunker from the chunking lesson; keep `source`, `course`, `heading`.
3. **Embed** with Voyage AI (or another model); store chunks in a MongoDB collection `noteChunks`.
4. **Index**: an Atlas vector index (with a `course` filter field) and an Atlas Search index on `text` for keyword search.
5. **Retrieve**: vector top 30 + keyword top 30 → RRF → top 8. (Reranking as a stretch.)
6. **Generate**: pass the 8 chunks as a custom-content document with `citations: { enabled: true }`; system prompt says answer only from the notes and say when they don't cover it.
7. **Evaluate**: 30 hand-written questions with the correct note sections. Report recall@8 for vector-only vs hybrid.
8. **Re-index** only changed files (store a hash per file).

## Done when

- [ ] All notes are chunked, embedded and searchable
- [ ] Answers cite the right note sections
- [ ] Questions outside your notes get "my notes don't cover this"
- [ ] A results table shows recall@8 for vector-only vs hybrid
- [ ] Re-running the indexer after editing one note only re-embeds that note

## Stretch goals

- Add a reranker and contextual retrieval; extend the results table.
- Build it into Daily as a Study page ("Ask my notes"), behind `isAdmin`.
- Add a course filter dropdown that uses the metadata filter.
- Use it as a tool (`search_notes`) in the Daily assistant from the Tool use project.
