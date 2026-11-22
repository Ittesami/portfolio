**RAG (retrieval-augmented generation)** means: find the most relevant pieces of your data, put them in the prompt, and let the model answer from them. **Embeddings** are how you find "relevant" by **meaning**, not just matching words.

## Why RAG

Models don't know your private or recent data, and you can't fit everything into every prompt. RAG gives each question just the text it needs.

```
 INDEXING (once, and when data changes)
 documents ─► split into chunks ─► embed each chunk ─► store vectors + text

 ANSWERING (every question)
 question ─► embed ─► find nearest chunk vectors ─► top k chunks
                                                       │
                       prompt = instructions + chunks + question ─► model ─► answer (+ citations)
```

## What an embedding is

An **embedding model** turns text into a vector of fixed length (e.g. 1,024 numbers). It's trained so that texts with **similar meaning** get vectors that **point in similar directions**.

```
"How do I reset my password?"      → [0.12, -0.53, 0.88, ...]
"I forgot my login details"        → [0.10, -0.49, 0.91, ...]   ← close
"Best biryani in Dhaka"            → [-0.71, 0.22, 0.05, ...]   ← far
```

No shared words between the first two, yet they're close. That's the point.

## Measuring similarity

**Cosine similarity**: the cosine of the angle between two vectors; 1 = same direction, 0 = unrelated.

```ts
function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
```

Many embedding models output **normalised** vectors (length 1), so the dot product equals the cosine.

## Getting embeddings

Anthropic doesn't offer its own embedding model; its docs point to **Voyage AI** (now part of MongoDB), which has strong general, code, finance and multilingual models. Other options: OpenAI's embedding models, Cohere, or open models from Hugging Face run yourself (ML module).

```ts
// Voyage AI over HTTP
const res = await fetch("https://api.voyageai.com/v1/embeddings", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ input: ["How do I reset my password?"], model: "voyage-3.5", input_type: "query" }),
});
const { data } = await res.json();
const vector = data[0].embedding;
```

Notes:

- Many models distinguish **`query`** from **`document`** inputs; use the right one at index time vs question time.
- **Use the same model** for indexing and querying; vectors from different models aren't comparable. Changing model means re-embedding everything.
- Embedding is cheap compared with generation, but batch your calls.

## Vector search

Comparing a query with every vector is fine for a few thousand chunks. Beyond that, **vector databases** use approximate nearest-neighbour (ANN) indexes such as **HNSW** to find the top k quickly, trading a little accuracy for big speed (lesson 3).

## Where pure vector search falls short

- **Exact terms**: product codes, error messages, names ("ERR_429_XQ") are better matched by keyword search.
- **Short or vague queries** retrieve loosely related chunks.
- **Chunks without context** ("It increased by 3%") embed poorly.

Lessons 4 and 5 fix these with hybrid search, reranking and contextual retrieval.

## Check yourself

1. What does an embedding capture that keyword search misses?
2. Why must you use the same embedding model for documents and queries?
3. What does cosine similarity of 1 mean?

### Answers

1. Meaning: texts that say the same thing in different words end up close together.
2. Each model has its own vector space; vectors from different models can't be compared meaningfully.
3. The vectors point in exactly the same direction (maximally similar).
