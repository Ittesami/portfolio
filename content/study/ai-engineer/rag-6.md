You can't improve retrieval by eye. You need a small test set and a few metrics. This is your first **eval**.

## Evaluate retrieval and generation separately

A wrong RAG answer has two possible causes:

```
question ─► retrieval ─► chunks ─► generation ─► answer
              ▲                        ▲
     "right chunk not found"   "found, but answered badly"
```

Measure **retrieval** first: if the right chunk isn't retrieved, no prompt can fix the answer.

## Build a test set

You need questions paired with the chunk(s) that contain the answer:

```json
[
  { "question": "What does CloudTrail record?", "relevant": ["aws-clf/m10-l1.md#2"] },
  { "question": "When is a heap better than a sorted array?", "relevant": ["dsa/heap-l1.md#1"] }
]
```

Ways to make one:

- **Write 20–50 by hand** from real questions you'd ask. Best quality.
- **Generate** with a model: give it a chunk, ask for a question it answers. Fast; then review and remove bad ones. Watch out: generated questions reuse the chunk's wording, which flatters keyword search.
- **Log real user questions** once something is live.

## Metrics

**Recall@k**: of the relevant chunks, what fraction appear in the top k?

```
relevant: {A, B}    top 5: [C, A, D, E, F]    recall@5 = 1/2 = 0.5
```

The most important RAG retrieval metric: did the right material make it into the prompt?

**Hit rate@k**: fraction of questions with at least one relevant chunk in the top k.

**MRR (mean reciprocal rank)**: average of 1 ÷ (rank of the first relevant chunk). Rewards putting the right chunk near the top.

**Precision@k**: of the top k, what fraction are relevant? Matters when prompt space is tight.

```ts
function recallAtK(retrieved: string[], relevant: string[], k: number) {
  const top = new Set(retrieved.slice(0, k));
  return relevant.filter((r) => top.has(r)).length / relevant.length;
}

const scores = testSet.map((t) => recallAtK(search(t.question), t.relevant, 10));
console.log("recall@10", scores.reduce((a, b) => a + b, 0) / scores.length);
```

## Use it to make decisions

Run the same test set across configurations and keep a table:

| Config | recall@5 | recall@20 | MRR |
|---|---|---|---|
| vector only, 800-token chunks | 0.62 | 0.81 | 0.55 |
| vector only, 300-token chunks | 0.68 | 0.85 | 0.60 |
| hybrid (vector + BM25) | 0.74 | 0.90 | 0.66 |
| hybrid + rerank | 0.83 | 0.90 | 0.78 |
| + contextual retrieval | 0.88 | 0.94 | 0.82 |

(Illustrative numbers.) Now you know which steps are worth their cost.

## Then evaluate answers

Once retrieval is good, check the generated answers:

- **Faithfulness**: is every claim supported by the retrieved chunks? (An LLM judge can check this, Evals module.)
- **Answer correctness**: does it match a reference answer?
- **Refusal when appropriate**: for questions your data can't answer, does it say so?

## Check yourself

1. Top 10 contains 2 of the 4 relevant chunks. What's recall@10?
2. Why evaluate retrieval before tuning the answer prompt?
3. What's a risk of generating test questions from chunks with an LLM?

### Answers

1. 0.5.
2. If the relevant chunks aren't retrieved, the model can't answer correctly no matter how good the prompt is.
3. The questions reuse the chunk's exact wording, so scores look better than they would for real questions (especially for keyword search); review and rewrite them.
