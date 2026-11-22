When users ask questions about documents, they need to **trust** the answer. **Citations** make Claude point to the exact passages it used, so every claim can be checked.

## How it works

Enable citations on each document block. The response is then split into several `text` blocks; the ones that make claims carry a `citations` list pointing to the exact source text.

```ts
const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 4000,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: pdf },
          title: "Tenancy agreement",
          citations: { enabled: true },
        },
        { type: "text", text: "How much notice do I need to give to end the tenancy?" },
      ],
    },
  ],
});
```

A response looks like:

```json
"content": [
  { "type": "text", "text": "You need to give " },
  {
    "type": "text",
    "text": "two months' written notice",
    "citations": [{
      "type": "page_location",
      "cited_text": "The Tenant must give not less than two months' notice in writing...",
      "document_index": 0,
      "document_title": "Tenancy agreement",
      "start_page_number": 4,
      "end_page_number": 5
    }]
  },
  { "type": "text", "text": ", ending on the last day of a rental period." }
]
```

## Location types

| Document type | Citation type | Points to |
|---|---|---|
| Plain text | `char_location` | Start/end character index |
| PDF | `page_location` | Start/end page (1-indexed) |
| Custom content (your own chunks) | `content_block_location` | Which of your blocks |

`cited_text` is the exact quoted text, and it **doesn't count towards output tokens**.

## Rendering citations

```ts
let html = "";
const sources: string[] = [];
for (const block of response.content) {
  if (block.type !== "text") continue;
  html += block.text;
  for (const c of block.citations ?? []) {
    sources.push(c.cited_text);
    html += `<sup>[${sources.length}]</sup>`;
  }
}
// then list sources[] under the answer, linking to page numbers where available
```

## Custom content: citing your own chunks

For RAG, pass retrieved chunks as **custom content** so citations point to *your* chunk IDs, not character offsets:

```ts
{
  type: "document",
  source: {
    type: "content",
    content: [
      { type: "text", text: "Chunk 17: Refunds are available within 30 days..." },
      { type: "text", text: "Chunk 42: Digital products can't be refunded once downloaded..." },
    ],
  },
  title: "Help centre",
  citations: { enabled: true },
}
```

Citations then use `content_block_location` with the block index, so you can link back to the original article.

## Why use the feature rather than "please cite"

- Citations are **guaranteed to point at real text** in your documents (it can't make up a quote).
- They're more reliable than prompting for quotes, and you get machine-readable locations.

## Limits

- Enable citations on **all** documents in a request or none.
- **Not compatible with structured outputs** in the same request (you'll get an error).
- Images inside PDFs can't be cited, only text.

## Check yourself

1. What's the citation type for a PDF?
2. Do `cited_text` tokens cost output tokens?
3. You want both citations and a strict JSON response. What's the problem?

### Answers

1. `page_location`.
2. No.
3. Citations and structured outputs can't be used together; get the cited answer first, then extract JSON in a second call (or parse the citation blocks yourself).
