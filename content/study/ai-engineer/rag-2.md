You don't embed whole documents; you split them into **chunks**. How you split has a bigger effect on RAG quality than almost any other choice.

## Why chunk

- An embedding of a 50-page document is a blurry average; a question about page 37 won't match it well.
- You only want to put **relevant** passages in the prompt, not whole documents.
- Embedding models have input limits.

But chunks that are **too small** lose context ("It was approved in March." — what was?).

## Strategies

| Strategy | How | Good for |
|---|---|---|
| **Fixed size** | Every N tokens (e.g. 400), with overlap (e.g. 50) | Quick baseline, uniform text |
| **Recursive** | Split on paragraphs, then sentences, then words, until under the size limit | General text; the usual default |
| **Structure-aware** | Split on headings, sections, functions, slides | Markdown, docs, code, HTML |
| **Semantic** | Split where the topic changes (embedding similarity between sentences drops) | Long unstructured text |
| **Document-level** | One chunk per small item | FAQs, product entries, notes |

## Overlap

Overlap repeats the end of one chunk at the start of the next, so a sentence near a boundary isn't cut off from its context.

```
chunk 1: [......................|overlap]
chunk 2:                  [overlap|......................]
```

10–20% is typical.

## A simple markdown chunker

Your study notes are markdown, so split on headings first:

```ts
function chunkMarkdown(md: string, source: string, maxChars = 2000) {
  const sections = md.split(/\n(?=## )/);          // keep each "## heading" with its text
  const title = md.match(/^# (.*)/m)?.[1] ?? source;
  const chunks = [];
  for (const section of sections) {
    const heading = section.match(/^## (.*)/)?.[1] ?? "Introduction";
    for (let i = 0; i < section.length; i += maxChars - 200) {          // 200-char overlap
      chunks.push({
        source,
        heading,
        text: `${title} > ${heading}\n\n${section.slice(i, i + maxChars)}`,   // prepend context
      });
    }
  }
  return chunks;
}
```

Prepending the **document title and heading** to each chunk is a cheap version of contextual retrieval (lesson 5).

## Store metadata with each chunk

```json
{
  "text": "AI Engineer > Prompt caching\n\nCaching is a prefix match...",
  "embedding": [ ... ],
  "source": "ai-engineer/ev-4.md",
  "course": "ai-engineer",
  "heading": "Prompt caching",
  "updatedAt": "2026-11-22"
}
```

Metadata lets you **filter** ("only AWS notes"), **cite** sources, and **re-index** just what changed.

## Choosing a size

There's no universal answer. Typical starting points: **200–800 tokens** per chunk. Then **measure** (lesson 6): build 20–50 question/answer pairs and compare recall at different sizes. Things that shift the answer:

- Questions about specific facts → smaller chunks.
- Questions needing explanation → larger chunks.
- Structured docs → follow the structure rather than a fixed size.

## Special content

- **Tables**: keep a table in one chunk with its header; or convert rows to sentences.
- **Code**: split by function or class, keep the file path in the chunk.
- **PDFs**: extract text per page; keep page numbers for citations.
- **Conversations/emails**: one message or thread per chunk, with sender and date.

## Check yourself

1. What goes wrong if chunks are too large? Too small?
2. Why add overlap?
3. Why store the source and heading with each chunk?

### Answers

1. Too large: embeddings get vague and prompts fill with irrelevant text. Too small: chunks lose the context needed to understand or match them.
2. So information near a chunk boundary still appears with its surrounding context in at least one chunk.
3. For filtering, citations, giving the model context, and re-indexing changed documents.
