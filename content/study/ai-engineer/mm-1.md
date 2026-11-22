Claude can **see**: you can send images alongside text and ask about them. Receipts, screenshots, charts, handwritten notes, photos of food, whiteboards, UI mock-ups.

## How it works

An image is cut into patches; each patch becomes a vector like a token embedding, and the model attends over image and text together. So an image **costs tokens**, roughly in proportion to its size:

```
tokens ≈ (width_px × height_px) / 750
```

A 1000×1000 image is about 1,300 tokens. Very large images are scaled down automatically, so sending a 6000-pixel photo costs time to upload without improving the answer. Resize to around 1,500 px on the long side before sending.

Supported formats: **JPEG, PNG, GIF (first frame), WebP**. There are limits on size per image and images per request; check the docs' Vision page for the current numbers.

## Sending an image

Three ways to provide it:

```ts
// 1. By URL (the API fetches it)
{ type: "image", source: { type: "url", url: "https://example.com/receipt.jpg" } }

// 2. Base64 (you read the file)
import fs from "node:fs";
const data = fs.readFileSync("receipt.jpg").toString("base64");
{ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }

// 3. A file uploaded once with the Files API (lesson 4)
{ type: "image", source: { type: "file", file_id: "file_..." } }
```

A full request:

```ts
const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 2000,
  messages: [
    {
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
        { type: "text", text: "List each item and price on this receipt, then the total." },
      ],
    },
  ],
});
```

**Put images before the question** that refers to them, like long documents. With several images, label them in text ("Image 1:", "Image 2:") so you can refer to them.

## What vision is good at

| Good | Watch out |
|---|---|
| Reading printed and handwritten text | Very small text in a big image (crop or zoom first) |
| Charts, tables, diagrams | Precise measurements (exact pixel positions, angles) |
| Describing scenes, objects, UI layouts | Counting many small, similar objects |
| Comparing two images | Identifying specific real people (it won't) |
| Screenshots of code or errors | Spatial reasoning in complex scenes |

## Combine with structured outputs

Vision plus a schema gives you a reliable extractor:

```ts
const Receipt = z.object({
  merchant: z.string(),
  date: z.string().describe("YYYY-MM-DD"),
  items: z.array(z.object({ name: z.string(), price: z.number() })),
  total: z.number(),
});
// messages.parse({ ..., output_config: { format: zodOutputFormat(Receipt) } })
```

## Tips

- **Crop** to the region that matters; it saves tokens and improves accuracy.
- Ask it to **describe what it sees first** for complex images, then answer.
- For documents, a **PDF** (next lesson) often works better than photos of pages: it gives both the text layer and the page image.
- Images from users are **untrusted input**: an image can contain written instructions ("ignore previous instructions..."). See the Safety module.

## Check yourself

1. Roughly how many tokens is an 800×600 image?
2. Why resize a 12-megapixel phone photo before sending?
3. Where should the image go relative to your question?

### Answers

1. About 640 tokens (800 × 600 ÷ 750).
2. It gets scaled down anyway, so the extra pixels only slow the upload; resizing yourself saves bandwidth and time.
3. Before the question, in the same user message.
