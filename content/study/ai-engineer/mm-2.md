You can send **PDFs** directly. Claude reads both the **text** and the **visual layout** of each page, so tables, charts and scanned pages work too.

## How PDF support works

For each page, the API extracts the text **and** renders the page as an image. The model sees both, which is why it can read a chart that has no text layer, or a table whose layout matters.

Consequences:

- **Cost:** each page costs text tokens **plus** image tokens; typically around 1,500–3,000 tokens per page, more for dense pages.
- **Limits:** up to 32 MB per request and 600 pages (fewer on smaller-context models). Check the docs for current limits.
- Very long PDFs: split them, or use the text only for bulk work and send pages as needed.

## Sending a PDF

```ts
import fs from "node:fs";

const pdf = fs.readFileSync("aws-study-guide.pdf").toString("base64");

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
          title: "AWS CLF-C02 study guide",
        },
        { type: "text", text: "List the four exam domains and their weights as a table." },
      ],
    },
  ],
});
```

The document block goes **before** the text, as with long documents. A PDF can also be sent by URL (`source: { type: "url", url }`) or by Files API id (lesson 4).

## Plain text documents

You can send text the same way, which is useful when you want document features like titles and citations:

```ts
{
  type: "document",
  source: { type: "text", media_type: "text/plain", data: notesText },
  title: "My DSA notes",
}
```

## Other formats

Word, Excel and HTML aren't sent directly as documents. Convert them first:

| Format | Convert with |
|---|---|
| `.docx` | `mammoth` (JS) or `python-docx` → text/markdown |
| `.xlsx` / `.csv` | Parse to rows; send as CSV text or a markdown table |
| HTML pages | Strip to readable text (e.g. `@mozilla/readability`) |
| Scans/photos | Send as images, or combine into a PDF |

## Prompting with documents

- Use the techniques from **Long documents**: question last, ask for quotes first.
- Point to locations: "In the table on page 12, ...".
- For forms and invoices, combine with **structured outputs** to extract fields.
- Turn on **Citations** (next lesson) when you need to show where an answer came from.

## Cost-saving pattern

If you ask many questions about the same PDF:

1. **Upload once** with the Files API (no re-sending megabytes of base64).
2. Put the document at the start and **cache** it (prompt caching): later questions read it at ~10% of the price.

## Check yourself

1. Why can Claude read a chart in a PDF that has no text layer?
2. A 200-page PDF: roughly how many input tokens?
3. How do you ask questions about a `.docx` file?

### Answers

1. Each page is also rendered as an image, so the model sees the chart visually.
2. Very roughly 300K–600K tokens (1,500–3,000 per page); count it with the token-counting endpoint.
3. Convert it to text or markdown first (e.g. with mammoth), then send it as text or a text document block.
