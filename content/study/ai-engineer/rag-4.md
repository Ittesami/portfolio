Vector search finds text with similar **meaning** but can miss **exact terms**. Keyword search is the opposite. **Hybrid search** combines them, and a **reranker** then puts the best results on top.

## Keyword search: BM25

**BM25** is the classic ranking used by search engines. It scores a chunk higher when:

- it contains the query's words,
- those words are **rare** across the collection (matching "pgvector" means more than matching "the"),
- and the chunk isn't padded out (length is normalised).

It shines on names, codes, error messages and jargon: `ERR_CONNECTION_RESET`, `CLF-C02`, `$vectorSearch`.

## Why combine them

| Query | Vector search | BM25 |
|---|---|---|
| "how do I stop paying for unused servers" | ✅ finds "rightsizing idle EC2 instances" | ❌ no shared words |
| "what is S3 Glacier Deep Archive" | ⚠️ may return other storage classes | ✅ exact phrase |

Run **both**, then merge the two ranked lists.

## Merging: reciprocal rank fusion (RRF)

Scores from the two methods aren't comparable, so merge by **rank**:

```
RRF score(doc) = Σ over each list   1 / (k + rank in that list)        (k ≈ 60)
```

```ts
function rrf(lists: string[][], k = 60) {
  const scores = new Map<string, number>();
  for (const list of lists) {
    list.forEach((id, i) => scores.set(id, (scores.get(id) ?? 0) + 1 / (k + i + 1)));
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

const merged = rrf([vectorResultIds, bm25ResultIds]);
```

A document ranked well by both comes out on top.

In MongoDB: **Atlas Search** provides BM25-style full-text search, and recent versions add a rank-fusion stage to combine it with `$vectorSearch` in one pipeline. In Postgres: full-text search (`tsvector`) plus pgvector, merged in SQL or code.

## Reranking

Retrieval models embed the query and each document **separately**, which is fast but approximate. A **reranker** (cross-encoder) reads the query **and** each candidate **together** and scores relevance directly. It's much more accurate, and too slow to run on everything, so:

```
hybrid search → top 50 candidates → reranker → top 5–10 → prompt
```

Options: Voyage AI and Cohere offer rerank APIs; open-source cross-encoders run locally; or use a cheap LLM (Haiku) to score candidates, which is flexible but slower.

```ts
const res = await fetch("https://api.voyageai.com/v1/rerank", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, documents: candidates.map((c) => c.text), model: "rerank-2.5", top_k: 8 }),
});
const { data } = await res.json();        // [{ index, relevance_score }, ...]
const top = data.map((d) => candidates[d.index]);
```

## The full retrieval pipeline

```
question
  ├─► embed ─► vector search (top 50) ─┐
  └─► BM25 search (top 50) ────────────┴─► RRF merge ─► rerank ─► top 8 ─► prompt
```

Each step should **earn its place**: measure recall with and without it (lesson 6).

## Check yourself

1. Which search finds "ERR_429_XQ" more reliably, and why?
2. Why does RRF use ranks rather than scores?
3. Why not rerank the whole collection?

### Answers

1. BM25 (keyword): it matches the exact rare token, which embeddings may blur.
2. Vector similarity scores and BM25 scores are on different scales; ranks are comparable.
3. Rerankers score each query–document pair with a heavy model, which is far too slow and costly for every chunk; they're for refining a short candidate list.
