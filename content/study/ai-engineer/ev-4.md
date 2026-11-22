Many requests share a large, identical beginning: the same system prompt, tools, documents or conversation history. **Prompt caching** stores that processed prefix, so later requests read it at about **10% of the input price** and start answering faster.

## How it works

The cache is a **prefix match**. The request is processed in this order:

```
tools  →  system  →  messages
```

You mark a point with `cache_control`. Everything **up to that point** is cached. On the next request, if the content up to that point is **byte-for-byte identical**, it's read from the cache.

```
request 1: [tools][system: 20K-token manual][user: question A]
                                      ▲ cache_control → written to cache (1.25× price)
request 2: [tools][system: same manual][user: question B]
                                      ▲ cache hit → read at 0.1× price
```

Any change **before** the breakpoint (one character in the system prompt, a reordered tool) means a miss for everything after it.

## Pricing

| | Price vs normal input |
|---|---|
| Cache write (5-minute lifetime) | 1.25× |
| Cache write (1-hour lifetime) | 2× |
| Cache read | 0.1× |

The 5-minute cache is refreshed each time it's used. It pays off from the **second** request: one write at 1.25× plus reads at 0.1× quickly beats paying 1× every time.

## Using it

**Automatic** (simplest): caches up to the last cacheable block.

```ts
const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 4000,
  cache_control: { type: "ephemeral" },
  system: longManual,
  messages,
});
```

**Explicit breakpoints** (more control, up to 4 per request):

```ts
system: [
  { type: "text", text: longManual, cache_control: { type: "ephemeral" } },              // 5 min
  // or { type: "ephemeral", ttl: "1h" } for traffic that's less frequent
],
```

## Check it's working

```ts
console.log(response.usage.cache_creation_input_tokens);  // written this time
console.log(response.usage.cache_read_input_tokens);      // read from cache
```

If `cache_read_input_tokens` is 0 on repeated requests, something in the prefix changes each time.

## Silent cache-breakers

| Mistake | Fix |
|---|---|
| Current time or date in the system prompt | Put it in the user message, after the breakpoint (or round to the day) |
| A request id or user name early in the prompt | Move per-request data to the end |
| Tools in a different order each time | Sort tools deterministically |
| JSON with keys in random order | Stable serialisation |
| Changing the tool list per request | Keep the tool set stable |
| Switching model or effort mid-conversation | Caches are per model; keep them stable |
| Prefix too short | There's a minimum cacheable length (hundreds to a few thousand tokens depending on model) |

**Design rule:** stable content first, changing content last.

```
[tools (fixed)] [system prompt (fixed)] [documents (fixed per session)] ▲ [history] ▲ [new question]
```

## Where caching pays off most

- Chat with a long system prompt or document ("chat with this PDF")
- Agents: each tool round-trip resends the whole context; caching it cuts cost dramatically
- Contextual retrieval (the same document for every chunk)
- Many-shot prompts with lots of examples
- Evals that run many cases with the same prompt

## Check yourself

1. You put `Today is ${new Date().toISOString()}` at the top of the system prompt. What happens to caching?
2. What does a cache read cost compared with normal input?
3. In what order are request parts processed for caching?

### Answers

1. The prefix changes every request, so nothing is ever read from the cache. Move the timestamp after the breakpoint.
2. About 10% of the normal input price.
3. tools → system → messages.
