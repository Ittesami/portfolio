If you can't see what each call costs, you can't control it. Track tokens from day one.

## Read usage on every response

```ts
const r = await client.messages.create({ /* ... */ });
console.log(r.usage);
// {
//   input_tokens: 1450,                  // uncached input, full price
//   cache_creation_input_tokens: 0,      // written to the cache (~1.25× price)
//   cache_read_input_tokens: 0,          // read from the cache (~0.1× price)
//   output_tokens: 320                   // includes thinking tokens
// }
```

## A cost helper

```ts
// $ per million tokens; check the pricing page and keep this table up to date
const PRICES: Record<string, { in: number; out: number }> = {
  "claude-opus-5-5":   { in: 4.0, out: 20.0 },
  "claude-sonnet-5-5": { in: 2.0, out: 10.0 },
  "claude-haiku-5-5":  { in: 0.1, out: 0.5 },
};

export function costUSD(model: string, u: Anthropic.Usage): number {
  const p = PRICES[model];
  if (!p) return NaN;
  const cacheWrite = u.cache_creation_input_tokens ?? 0;
  const cacheRead = u.cache_read_input_tokens ?? 0;
  return (
    (u.input_tokens * p.in + cacheWrite * p.in * 1.25 + cacheRead * p.in * 0.1 + u.output_tokens * p.out) / 1e6
  );
}
```

(The 1.25× write multiplier is for the default 5-minute cache; a 1-hour cache costs more to write. Caching is covered in the Evals, cost and speed module.)

## Counting tokens before you send

The **token counting** endpoint tells you how many input tokens a request would use, free, without running the model:

```ts
const { input_tokens } = await client.messages.countTokens({
  model: "claude-opus-5-5",
  system: bigSystemPrompt,
  messages,
});
if (input_tokens > 200_000) {
  // trim history or retrieve less before sending
}
```

Use it to:

- Check a document fits before sending it.
- Estimate the cost of a job before running it on 10,000 items.
- Decide when to trim or summarise a long conversation.

Don't use OpenAI's `tiktoken` or "characters ÷ 4" for anything precise: Claude uses its own tokenizer, and newer models can count differently from older ones.

## Track spend over time

For anything you deploy:

1. **Log per call:** timestamp, route/feature, model, input/output/cache tokens, cost, latency, `stop_reason`, request id.
2. **Aggregate:** cost per day, per feature, per user.
3. **Alert:** a spend limit in the Console, plus your own alert if a feature suddenly costs 10× more (often a loop bug).

The **Console's Usage and Cost pages** show totals by model and API key. Separate keys or workspaces per project make those numbers meaningful.

## Where tokens hide

| Hidden cost | Why |
|---|---|
| Long system prompts | Sent on **every** call |
| Tool definitions | Each tool's schema is input tokens on every call |
| Conversation history | Grows each turn |
| Thinking | Billed as output even when not displayed |
| Images and PDFs | Converted to many tokens (a PDF page can be 1,500–3,000) |
| Agent loops | Each tool round-trip resends the whole context |

## Check yourself

1. A response shows `cache_read_input_tokens: 50000`. Roughly what fraction of normal price did those cost?
2. How can you know a 300-page PDF's token count without paying to run it?
3. Your assistant's cost per conversation doubled after adding 15 tools. Why?

### Answers

1. About 10% of the normal input price.
2. Send it to the token-counting endpoint (`countTokens`), which is free.
3. Tool definitions are input tokens on every request, so 15 schemas add to every turn; caching them or loading tools on demand (tool search) helps.
