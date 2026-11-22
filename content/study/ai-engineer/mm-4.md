Sending a 20 MB PDF as base64 on every request is slow and wasteful. The **Files API** lets you **upload once** and refer to the file by ID afterwards.

## How it works

```
1. POST /v1/files      (upload)      → { id: "file_011C..." }
2. POST /v1/messages   (use it)      → { type: "document", source: { type: "file", file_id } }
3. ... reuse the same id in as many requests as you like
4. DELETE /v1/files/:id              (when you're done)
```

Files are stored in your organisation's workspace until you delete them. Upload, list and delete are **free**; you pay the normal input tokens when a file is used in a message.

## Upload

```ts
import Anthropic, { toFile } from "@anthropic-ai/sdk";
import fs from "node:fs";

const client = new Anthropic();

const uploaded = await client.files.upload({
  file: await toFile(fs.createReadStream("aws-study-guide.pdf"), "aws-study-guide.pdf", {
    type: "application/pdf",
  }),
});
console.log(uploaded.id, uploaded.size_bytes);
```

## Use

```ts
const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 4000,
  messages: [
    {
      role: "user",
      content: [
        { type: "document", source: { type: "file", file_id: uploaded.id }, title: "AWS study guide" },
        { type: "text", text: "What does the exam guide say about the shared responsibility model?" },
      ],
    },
  ],
});
```

The **block type must match the file**: `document` for PDFs and text, `image` for images.

## Manage

```ts
for await (const f of client.files.list()) console.log(f.id, f.filename);
await client.files.delete(uploaded.id);
```

Keep a record (e.g. in MongoDB) of which file id belongs to which source document, so you don't upload duplicates.

## When to use it

| Situation | Approach |
|---|---|
| One-off question about a file | Base64 inline is fine |
| Many questions about the same file | Files API + prompt caching |
| Files produced by tools (code execution makes a chart) | Download them through the Files API |
| Agents and skills working with files | Files API (they read and write files by id) |

## Files API + caching

These solve different problems:

- **Files API** saves *upload bandwidth*: you don't resend the bytes.
- **Prompt caching** saves *money and latency*: the model doesn't reprocess the tokens.

For "chat with this document", use both: reference the file by id at the start of the prompt and add a cache breakpoint after it.

## Availability note

The Files API is on Anthropic's own API (and some partner platforms); it isn't on every cloud platform. Older code uses `client.beta.files` with a beta header; the API is now stable at `client.files`.

## Check yourself

1. Does uploading a file cost tokens?
2. What's the difference between what the Files API saves and what caching saves?
3. You uploaded a PNG. Which content block type do you use?

### Answers

1. No. Upload is free; you pay input tokens when it's used in a message.
2. Files API avoids resending the bytes; caching avoids paying full price to reprocess the same tokens.
3. An `image` block with `source: { type: "file", file_id }`.
