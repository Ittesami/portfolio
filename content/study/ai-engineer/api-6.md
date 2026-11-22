Modern Claude models can **think before they answer**: they reason privately (planning, checking, trying approaches) and then write the reply. **Effort** controls how much.

## Adaptive thinking

With **adaptive thinking**, the model decides *whether* and *how much* to think for each request. Easy questions get a quick answer; hard ones get careful reasoning.

```ts
const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  thinking: { type: "adaptive", display: "summarized" },
  output_config: { effort: "high" },
  messages: [{ role: "user", content: "A bat and ball cost £1.10 in total. The bat costs £1 more than the ball. How much is the ball?" }],
});

for (const block of response.content) {
  if (block.type === "thinking") console.log("THINKING:", block.thinking);
  if (block.type === "text") console.log("ANSWER:", block.text);
}
```

- On **Opus 5.5**, thinking is always on (omitting `thinking` means adaptive). You can't turn it off; you lower **effort** instead.
- **`display`** controls what you see, not what happens. The default on current models is `"omitted"`: thinking blocks arrive with empty text. `"summarized"` returns a readable summary. The raw chain of thought is never exposed.
- **Thinking tokens are billed as output**, whether or not you display them.

Older tutorials use `thinking: { type: "enabled", budget_tokens: N }`. That's the old fixed-budget style and is **rejected** on current models; use adaptive + effort.

## Effort

`output_config.effort` trades thoroughness for tokens and speed:

| Effort | Behaviour | Good for |
|---|---|---|
| `low` | Little or no thinking, short and direct | Chat, simple extraction, classification, sub-agents |
| `medium` | Moderate | Many everyday tasks (Opus 5.5's **default**) |
| `high` | Careful reasoning | Intelligence-sensitive work, multi-step tool use |
| `xhigh` | Very thorough | Most coding and agentic work |
| `max` | Everything it's got | When correctness matters far more than cost |

Lower effort also means **fewer, more consolidated tool calls** and terser replies. Effort affects the whole response, not just thinking.

Opus 5.5 defaults to `medium`, while most other current models default to `high`, so **set it explicitly** rather than relying on the default.

## How to choose

1. Start at `high` for anything hard.
2. Try `medium` and `low` on your eval set. Keep the lowest level that holds quality.
3. Tune **per route**: your chat endpoint might run at `low` and your code-review agent at `xhigh`.
4. Compare **cost per completed task**, not per request; a cheap answer that needs a retry isn't cheap.

Before switching to a smaller model to save money, try **the same model at lower effort**: on the newest models, low effort often matches older models at high effort.

## Thinking in multi-turn and tool use

- Pass thinking blocks back **unchanged** in the conversation (append the full `response.content`). Models use them to keep their reasoning consistent across tool calls.
- Don't edit or reorder earlier blocks; current models check the history wasn't tampered with.
- Between tool calls, models can write short progress notes; on current models these come back as thinking blocks too.

## Streaming thinking

Thinking streams first. With `display: "omitted"` the user sees a pause, then the answer. For a chat UI, either show a "thinking…" indicator or use `"summarized"` and render the summary.

## Check yourself

1. Does `display: "omitted"` reduce cost?
2. Your extraction route is slow and pricey on Opus 5.5 at `high`. What do you try first?
3. Why might old code with `budget_tokens` fail on Opus 5.5?

### Answers

1. No. Thinking still happens and is billed the same; `display` only controls visibility.
2. Lower effort (`medium`, then `low`) and check quality on an eval; only then consider a smaller model.
3. Fixed thinking budgets were replaced by adaptive thinking plus effort; `budget_tokens` returns a 400 on current models.
