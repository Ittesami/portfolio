Everything you build goes through one endpoint: **`POST /v1/messages`**. Tools, images, PDFs, structured output and thinking are all options on this same request.

## Your first request

```ts
// src/hello.ts — run with: npx tsx --env-file=.env.local src/hello.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-haiku-5-5",
  max_tokens: 1000,
  messages: [{ role: "user", content: "Explain recursion to a 10-year-old in 3 sentences." }],
});

for (const block of response.content) {
  if (block.type === "text") console.log(block.text);
}
console.log(response.usage);
```

Python is the same shape:

```python
import anthropic
client = anthropic.Anthropic()
r = client.messages.create(
    model="claude-haiku-5-5", max_tokens=1000,
    messages=[{"role": "user", "content": "Explain recursion to a 10-year-old in 3 sentences."}],
)
print(r.content[0].text)
```

## The three required fields

| Field | What it is |
|---|---|
| `model` | Which model, by exact ID (`claude-opus-5-5`, `claude-haiku-5-5`, ...) |
| `max_tokens` | The most output tokens it may produce. A hard ceiling: if hit, the reply is cut off |
| `messages` | The conversation so far: a list of `{ role, content }`, starting with `user` |

## What comes back

```json
{
  "id": "msg_01...",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-5-5",
  "content": [{ "type": "text", "text": "Recursion is when..." }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 21, "output_tokens": 74 }
}
```

- **`content` is a list of blocks**, not a string. Today it's one `text` block; later you'll see `thinking`, `tool_use` and others mixed in. Always loop and check `block.type`; don't assume `content[0].text`.
- **`stop_reason`** says why it stopped: `end_turn` (finished), `max_tokens` (cut off), `tool_use`, `refusal`, and a few more (lesson 7).
- **`usage`** is what you're billed for. Log it.

## Content can be blocks too

`content` in your messages can be a plain string, or a list of blocks, which is how you'll send images and documents:

```ts
messages: [{
  role: "user",
  content: [
    { type: "text", text: "What's in this receipt?" },
    // { type: "image", source: {...} }   ← Images module
  ],
}]
```

## Choosing max_tokens

- Too low and answers get **truncated** (`stop_reason: "max_tokens"`).
- You only pay for tokens actually generated, so a generous limit doesn't cost more by itself.
- Sensible defaults: around **16,000** for normal requests; up to **64,000+** when streaming long output (non-streaming requests that run very long can hit HTTP timeouts, so stream those).
- Small values (e.g. 50) are fine when you know the answer is short, like a classification label.

## Things that no longer exist on current models

You'll see these in older tutorials:

- **Prefill** (putting the start of the assistant's reply in the last message) returns an error on current models. Use instructions or structured output instead.
- **`temperature` / `top_p` / `top_k`** sampling settings are rejected on current models. Control behaviour with the prompt and the `effort` setting.
- The old **Text Completions** API (`prompt: "\n\nHuman: ..."`) is gone; everything is Messages.

## Check yourself

1. What type is `response.content`, and why shouldn't you read `content[0].text` blindly?
2. A reply ends mid-sentence and `stop_reason` is `max_tokens`. What do you change?
3. Does setting `max_tokens: 16000` cost more than `max_tokens: 1000` for a 200-token answer?

### Answers

1. A list of content blocks. The first block might be `thinking` or `tool_use`, not `text`, so filter by `type`.
2. Raise `max_tokens` (and stream if it's large), or ask for a shorter answer.
3. No. You pay for tokens generated (200), not for the limit.
