When you have lots of requests and don't need answers immediately, the **Message Batches API** processes them asynchronously at **50% of the normal price**.

## How it works

```
1. create batch  (up to many thousands of requests, each with a custom_id)
2. Anthropic processes them in the background (most batches finish within an hour; the limit is 24 h)
3. poll until processing_status is "ended"
4. download results (each keyed by custom_id, in ANY order)
```

Each request in a batch is a normal Messages request: any model, system prompt, tools, images, structured output, caching.

## Create

```ts
const batch = await client.messages.batches.create({
  requests: logs.map((log) => ({
    custom_id: log.id,                          // your id, to match results back
    params: {
      model: "claude-haiku-5-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: log.text }],
    },
  })),
});
console.log(batch.id, batch.processing_status);   // "in_progress"
```

## Poll

```ts
let status = await client.messages.batches.retrieve(batch.id);
while (status.processing_status !== "ended") {
  await new Promise((r) => setTimeout(r, 60_000));      // check every minute
  status = await client.messages.batches.retrieve(batch.id);
}
console.log(status.request_counts);                     // succeeded, errored, expired, canceled
```

## Results

```ts
for await (const item of await client.messages.batches.results(batch.id)) {
  if (item.result.type === "succeeded") {
    const text = item.result.message.content.find((b) => b.type === "text")?.text;
    save(item.custom_id, text);
  } else {
    console.warn(item.custom_id, item.result.type);      // errored | expired | canceled
  }
}
```

**Match by `custom_id`, never by position**: results don't come back in the order you sent them.

## When to use batches

| Good fit | Not a fit |
|---|---|
| Classifying or tagging thousands of items | Chat or anything a user waits for |
| Running an eval suite | Agent loops (each step depends on the last) |
| Contextual retrieval for a whole corpus | Requests needing results in seconds |
| Nightly summaries, report generation | |
| Generating synthetic test data | |

## Combine with caching

Batches and prompt caching stack: a batch of 5,000 requests sharing one long system prompt gets the 50% batch discount **and** cache reads on the shared prefix (cache hits in batches are best-effort, as requests may run at different times).

## Practical tips

- **Retry the failures**: collect `errored`/`expired` ids and submit them in a new batch.
- **Validate first**: send 5 requests normally to check the prompt before a 10,000-request batch.
- **Track the batch id** (in a file or database) in case your script stops.
- Batches have their own rate limits, separate from normal requests, so they don't eat your live traffic's capacity.

## Check yourself

1. How much cheaper are batches?
2. Results arrive in a different order from your requests. How do you match them?
3. Should a support chatbot use batches?

### Answers

1. 50% off normal prices.
2. By `custom_id`.
3. No. Users need answers in seconds; batches can take up to 24 hours.
