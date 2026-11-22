A **vector store** keeps your chunks and their embeddings and finds the nearest ones fast. You already use MongoDB Atlas, which has vector search built in; Postgres has the **pgvector** extension. Both mean no extra database to run.

## How fast search works: ANN and HNSW

Exact search compares the query with every vector: fine for 10,000 chunks, slow for 10 million. **Approximate nearest neighbour (ANN)** indexes trade a little accuracy for big speed.

The common one is **HNSW** (hierarchical navigable small world): a layered graph where each vector links to its near neighbours. Search starts at the sparse top layer, hops closer to the query, and drops down layers, like zooming in on a map.

The knob: how many candidates to examine. More candidates = better recall, slower.

## MongoDB Atlas Vector Search

**1. Store chunks** with an `embedding` array:

```js
await db.collection("noteChunks").insertMany(chunks.map((c, i) => ({ ...c, embedding: vectors[i] })));
```

**2. Create a vector index** (Atlas UI → Search → Create index, or in code):

```js
await db.collection("noteChunks").createSearchIndex({
  name: "notes_vector",
  type: "vectorSearch",
  definition: {
    fields: [
      { type: "vector", path: "embedding", numDimensions: 1024, similarity: "cosine" },
      { type: "filter", path: "course" },
    ],
  },
});
```

`numDimensions` must match your embedding model's output.

**3. Query** with the `$vectorSearch` aggregation stage:

```js
const results = await db.collection("noteChunks").aggregate([
  {
    $vectorSearch: {
      index: "notes_vector",
      path: "embedding",
      queryVector: queryEmbedding,
      numCandidates: 200,          // examined by the ANN search
      limit: 8,                    // returned
      filter: { course: "aws-clf" },
    },
  },
  { $project: { text: 1, source: 1, heading: 1, score: { $meta: "vectorSearchScore" } } },
]).toArray();
```

A common rule of thumb is `numCandidates` around 10–20× `limit`.

## pgvector (Postgres)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE note_chunks (
  id bigserial PRIMARY KEY,
  source text, course text, heading text, text text,
  embedding vector(1024)
);

CREATE INDEX ON note_chunks USING hnsw (embedding vector_cosine_ops);

-- nearest 8 by cosine distance (<=>), filtered
SELECT source, heading, text, 1 - (embedding <=> $1) AS similarity
FROM note_chunks
WHERE course = 'aws-clf'
ORDER BY embedding <=> $1
LIMIT 8;
```

Operators: `<=>` cosine distance, `<->` Euclidean, `<#>` negative inner product. Supabase and Neon offer Postgres with pgvector.

## Choosing

| | Atlas Vector Search | pgvector | Dedicated (Pinecone, Qdrant, Weaviate...) |
|---|---|---|---|
| Fits if you already use | MongoDB | Postgres | Neither / huge scale |
| Filters | Metadata filter fields | Full SQL | Varies |
| Keyword search too | Atlas Search (same platform) | Postgres full-text search | Often built in |
| Ops | Managed | Managed or self-hosted | Managed |

For learning and personal projects, **use the database you already have**.

## Keeping the index fresh

- Store a **hash** of each source file; re-chunk and re-embed only changed ones.
- Delete old chunks for a document before inserting new ones.
- Record the **embedding model name** with each chunk, so a model change triggers a full re-index.

## Check yourself

1. What does `numCandidates` control in `$vectorSearch`?
2. What happens if `numDimensions` doesn't match your embedding model?
3. Which pgvector operator gives cosine distance?

### Answers

1. How many vectors the approximate search examines before returning the top `limit`: more = better recall, slower.
2. Indexing or querying fails (or the index can't be used); it must equal the model's vector length.
3. `<=>`.
