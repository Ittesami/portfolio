Without streaming, the user stares at nothing until the whole answer is ready. With **streaming**, words appear as they're generated. It's the single biggest improvement to how fast an AI feature *feels*.

## How it works

Instead of one JSON response, the server sends **server-sent events (SSE)**: a stream of small events over one open HTTP connection.

```
event: message_start         → the message begins (id, model, input usage)
event: content_block_start   → a new block starts (text, thinking, tool_use...)
event: content_block_delta   → a chunk: {"type":"text_delta","text":"Recur"}
event: content_block_delta   → {"type":"text_delta","text":"sion is"}
...
event: content_block_stop
event: message_delta         → stop_reason and final output usage
event: message_stop
```

## In the SDK

```ts
const stream = client.messages.stream({
  model: "claude-haiku-5-5",
  max_tokens: 4000,
  messages: [{ role: "user", content: "Write a short poem about gradient descent." }],
});

stream.on("text", (text) => process.stdout.write(text));   // each chunk as it arrives

const final = await stream.finalMessage();                  // the complete Message at the end
console.log("\n", final.stop_reason, final.usage);
```

- `.on("text", ...)` gives you text deltas only, the easy case.
- `finalMessage()` waits for the end and returns the same object `create()` would have. Use it rather than stitching chunks together yourself.
- You can also iterate raw events: `for await (const event of stream) { ... }`.

Python:

```python
with client.messages.stream(model="claude-haiku-5-5", max_tokens=4000,
                            messages=[{"role": "user", "content": "..."}]) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
    final = stream.get_final_message()
```

## When to stream

- **Anything a person watches**: chat, writing assistants.
- **Long outputs** even in back-end jobs: large `max_tokens` without streaming risks HTTP timeouts, so the SDKs push you to stream them (and `finalMessage()` means you lose nothing).
- Not needed for short machine-to-machine calls (a 10-token classification).

## Streaming to the browser (Next.js)

Your route handler streams from Anthropic and forwards the text to the browser:

```js
// app/api/chat/route.js
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

export async function POST(request) {
  const { messages } = await request.json();
  const stream = client.messages.stream({ model: "claude-haiku-5-5", max_tokens: 4000, messages });

  const body = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      stream.on("text", (t) => controller.enqueue(enc.encode(t)));
      try {
        await stream.finalMessage();
      } catch (err) {
        controller.enqueue(enc.encode("\n[error]"));
      }
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
```

```js
// client side
const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages }) });
const reader = res.body.getReader();
const dec = new TextDecoder();
for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  setReply((r) => r + dec.decode(value, { stream: true }));
}
```

Streaming works on Vercel's normal Node.js runtime; you don't need the Edge runtime. Libraries like the Vercel AI SDK wrap this pattern if you'd rather not write it.

## Gotchas

- **Errors can happen mid-stream** (overload, network). The HTTP status was already 200, so handle errors inside the stream, not just the status code.
- **Thinking** streams as `thinking` blocks before the text. On current models its text is empty by default, which looks like a pause; request a summary (`display: "summarized"`) if you want to show it (lesson 6).
- Users may close the tab: stop the upstream stream (`stream.abort()`) so you don't pay for output nobody reads.

## Check yourself

1. What does streaming improve: total time, or perceived speed?
2. Why should a back-end job with `max_tokens: 64000` stream even though no one is watching?
3. What does `finalMessage()` give you?

### Answers

1. Perceived speed (time to first visible word); total generation time is about the same.
2. Very long non-streaming requests can hit HTTP timeouts; streaming keeps the connection active.
3. The complete Message (content, stop_reason, usage), as if you'd called `create()`.
