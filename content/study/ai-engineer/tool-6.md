Agents read a lot: tool results, files, web pages. A long run can fill even a 1M-token window, and long contexts are slow and expensive. **Context management** keeps the model focused on what matters.

## The problem

Every turn of an agent loop resends the whole conversation. After 50 tool calls with big results:

- **Cost** grows with every turn (all those tokens again).
- **Latency** grows.
- **Quality** can drop: important instructions get buried under old tool output.
- Eventually you hit the **context limit**.

## Strategy 1: keep tool results small

The cheapest fix is at the source:

- Return **only what's needed** (top 10 results, not 500; the relevant fields, not whole records).
- **Paginate**: let the model ask for more.
- **Summarise** large outputs in the tool itself.

## Strategy 2: context editing (clear old results)

**Context editing** automatically removes old tool results (or old thinking) from the conversation before the model sees it, keeping a note that something was cleared. The model can call the tool again if it needs the data.

```ts
const response = await client.beta.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  betas: ["context-management-2025-06-27"],
  context_management: { edits: [{ type: "clear_tool_uses_20250919" }] },
  tools,
  messages,
});
```

Good when old results are no longer relevant (pages already read, searches already used).

## Strategy 3: compaction (summarise old context)

**Compaction** has the API **summarise** earlier parts of the conversation automatically when it gets near a threshold (by default around 150K tokens), replacing them with a compact summary.

```ts
const response = await client.beta.messages.create({
  betas: ["compact-2026-01-12"],
  model: "claude-opus-5-5",
  max_tokens: 16000,
  context_management: { edits: [{ type: "compact_20260112" }] },
  messages,
});
messages.push({ role: "assistant", content: response.content });   // MUST keep the full content
```

The response may include a **compaction block**; you must send it back on the next request (that's how the API knows what was summarised). Appending only the text would silently lose it.

| | Context editing | Compaction |
|---|---|---|
| What happens | Old tool results/thinking **removed** | Old turns **summarised** |
| Keeps | Everything else verbatim | A summary of what happened |
| Best for | Tool-heavy loops | Very long conversations |

## Strategy 4: memory (keep things outside the context)

The **memory tool** gives the model a small file store it reads and writes across sessions: notes, progress, learned preferences. Your code provides the storage.

```ts
tools: [{ type: "memory_20250818", name: "memory" }]
```

The model calls it with commands like view, create and edit on files in a `/memories` directory; your handler stores them (on disk, in MongoDB...). Next session, the model checks its memory first. The SDK has helpers to implement the handler.

Use it for: long projects spanning many sessions, user preferences, "what did I try last time".

## Strategy 5: sub-agents

Give a reading-heavy sub-task to a **separate** model call (often a cheaper model) and get back only a short summary. The main agent's context stays clean. (Multi-agent patterns, Production module.)

## Also useful

- **Prompt caching** doesn't shrink context but makes repeated context cheap.
- **Message threads** (beta) let the API keep the conversation briefly so each request sends only new messages.

## Check yourself

1. What's the difference between context editing and compaction?
2. After enabling compaction, you append only `response.content[0].text` to history. What breaks?
3. Which strategy helps an agent remember a user's preferences next week?

### Answers

1. Context editing deletes old tool results or thinking; compaction replaces earlier conversation with a summary.
2. The compaction block is lost, so the API can't apply the compacted history on the next request; always append the full content.
3. The memory tool (persistent storage outside the context window).
