**Contextual retrieval** is a technique Anthropic published to fix one of RAG's biggest weaknesses: **chunks that lose their meaning when cut out of their document**.

## The problem

Take a chunk from a company report:

```
"The company's revenue grew by 3% over the previous quarter."
```

Which company? Which quarter? The embedding can't know, so a search for "ACME Q2 2023 revenue growth" may miss it, and BM25 has no "ACME" to match.

## The fix: add context to every chunk before indexing

For each chunk, ask a cheap model to write a short note situating it in its document, and **prepend** that note before embedding **and** before BM25 indexing:

```
"This chunk is from ACME Corp's Q2 2023 SEC filing, in the section on financial results.
The company's revenue grew by 3% over the previous quarter."
```

The prompt (from Anthropic's write-up, lightly adapted):

```
<document>
{{WHOLE_DOCUMENT}}
</document>
Here is the chunk we want to situate within the whole document:
<chunk>
{{CHUNK_CONTENT}}
</chunk>
Please give a short succinct context to situate this chunk within the overall document
for the purposes of improving search retrieval of the chunk.
Answer only with the succinct context and nothing else.
```

## Making it cheap: prompt caching

The whole document is the same for every chunk in it, so put it first and **cache** it. Each chunk's call then pays full price only for the chunk and the short answer:

```ts
for (const chunk of chunks) {
  const r = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 200,
    system: [
      { type: "text", text: `<document>\n${doc}\n</document>`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: `<chunk>\n${chunk.text}\n</chunk>\nGive a short succinct context to situate this chunk within the document for search retrieval. Answer only with the context.` }],
  });
  chunk.context = r.content.find((b) => b.type === "text")?.text ?? "";
  chunk.indexed = `${chunk.context}\n\n${chunk.text}`;     // embed + BM25 this; show chunk.text to the model
}
```

Process one document's chunks together so the cache stays warm (the default cache lives about 5 minutes). For big corpora, the **Batches API** halves the cost again.

## How much it helps

Anthropic's experiments across several datasets reported fewer **failed retrievals** (top-20 missing the right chunk):

| Setup | Reduction in failed retrievals |
|---|---|
| Contextual embeddings | about 35% |
| Contextual embeddings + contextual BM25 | about 49% |
| + reranking | about 67% |

Your results will differ, so measure on your data (next lesson).

## When to use it

- Documents where chunks depend on context: reports, legal docs, long articles, transcripts.
- Less needed for self-contained items (FAQ entries, product records).

## Related ideas

- **Cheap version**: prepend the document title and section heading (you did this in the chunking lesson).
- **Parent-document retrieval**: search small chunks, but put their larger parent section into the prompt.
- **If the whole corpus fits in context** (under a couple of hundred thousand tokens), consider skipping RAG and using long context with caching.

## Check yourself

1. Why does "revenue grew by 3%" retrieve badly on its own?
2. Why is prompt caching essential for contextual retrieval?
3. Do you show the model the added context, the original chunk, or both at answer time?

### Answers

1. It lacks the entities and time period it refers to, so neither its embedding nor its keywords match questions that mention them.
2. Every chunk's call includes the whole document; caching it means the document is billed at ~10% after the first call.
3. You index the context + chunk; at answer time showing both works well, though many show the original chunk with its source metadata.
