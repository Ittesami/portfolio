Production AI code spends a surprising amount of effort on **what goes wrong**. This lesson covers the failures you'll actually hit and how to handle each.

## Two kinds of failure

1. **The request fails** (an HTTP error): the SDK throws.
2. **The request succeeds but the answer isn't usable**: check `stop_reason`.

## HTTP errors and the SDK's error classes

```ts
import Anthropic from "@anthropic-ai/sdk";

try {
  const r = await client.messages.create({ /* ... */ });
} catch (err) {
  if (err instanceof Anthropic.BadRequestError) {          // 400: fix the request
  } else if (err instanceof Anthropic.AuthenticationError) { // 401: bad key
  } else if (err instanceof Anthropic.NotFoundError) {     // 404: wrong model name?
  } else if (err instanceof Anthropic.RateLimitError) {    // 429: slow down
  } else if (err instanceof Anthropic.APIError) {          // anything else from the API (5xx, 529)
    console.error(err.status, err.message);
  } else {
    throw err;                                             // network or your own bug
  }
}
```

Check **most specific first**, and never string-match error messages.

## Retries

| Retry? | Errors |
|---|---|
| ✅ Yes, with backoff | 429, 500, 529, timeouts, connection resets |
| ❌ No | 400, 401, 403, 404, 413 |

The SDK **already retries** retryable errors **twice** with exponential backoff, honouring the `retry-after` header. Adjust per client:

```ts
const client = new Anthropic({ maxRetries: 4, timeout: 60_000 });   // TypeScript timeout is in ms
```

Don't wrap your own retry loop around the SDK's without thinking: 3 of yours × 3 of the SDK's = 9 attempts.

**Exponential backoff with jitter**: wait 1 s, 2 s, 4 s… plus a random bit, so many clients don't retry in sync.

## Rate limits

Limits are per organisation, measured in **requests per minute** and **input/output tokens per minute**, and rise as your usage tier grows. Response headers (`anthropic-ratelimit-*`) tell you how much is left.

To stay under them:

- **Cap concurrency** (a queue or semaphore), don't fire 500 requests at once.
- **Prompt caching**: cached tokens don't count against input-token limits the same way, which effectively raises your throughput.
- **Batches** for bulk work: they have their own, separate capacity.

## Stop reasons: checking a "successful" response

| `stop_reason` | Meaning | Handle it by |
|---|---|---|
| `end_turn` | Finished normally | Use it |
| `max_tokens` | Cut off at your limit | Raise `max_tokens`, ask for less, or continue |
| `stop_sequence` | Hit one of your `stop_sequences` | Expected, if you set them |
| `tool_use` | Wants to call a tool | Run the tool, send the result (Tool use module) |
| `pause_turn` | A long server-side tool turn paused | Send the content back to let it continue |
| `refusal` | Declined for safety reasons | See below |

**Always check `stop_reason` before trusting `content`.** A truncated JSON object will fail to parse; a refusal has no useful answer.

## Refusals

The model's safety systems may decline (`stop_reason: "refusal"`, still HTTP 200). On current models `stop_details` explains it:

```ts
if (r.stop_reason === "refusal") {
  console.log(r.stop_details?.category, r.stop_details?.explanation);
  // show a polite message; don't retry the same request in a loop
}
```

Classifiers sometimes misfire on harmless requests (security questions, chemistry homework). On Opus 5.5, Sonnet 5.5 and Fable 5.2 you can opt in to **server-side fallbacks**: if the model declines, the API reruns the request on a fallback model within the same call.

```ts
const r = await client.beta.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",          // let the API pick a suitable fallback model
  messages: [{ role: "user", content: "..." }],
});
```

## A checklist for every model call in production

- [ ] Typed error handling, with retries left to the SDK
- [ ] A timeout that suits the route
- [ ] `stop_reason` checked before using `content`
- [ ] A friendly message for the user on failure (never a raw stack trace)
- [ ] The request id (`r.id` / the `request-id` header) logged, for debugging

## Check yourself

1. You get a 404 on every call after changing models. Likely cause?
2. Should you retry a 400?
3. Your JSON parse fails on some replies. What do you check first?

### Answers

1. A wrong or misspelt model ID.
2. No. The request is invalid; retrying sends the same bad request.
3. `stop_reason`: if it's `max_tokens`, the reply was truncated. (Structured outputs, Prompting module, also guarantee valid JSON.)
