Some tasks are too big or too broad for one agent's context: researching ten topics, reviewing a whole codebase, processing hundreds of documents. **Multi-agent** systems split the work across several model instances.

## Orchestrator and workers

The most useful pattern:

```
                  ┌───────────────────────┐
user task ──────► │ Orchestrator (lead)   │  plans, delegates, combines
                  └──┬────────┬────────┬──┘
                     ▼        ▼        ▼
                 worker 1  worker 2  worker 3      each: fresh context, focused sub-task
                     │        │        │
                     └── short summaries back ──► lead writes the final answer
```

- The **lead** breaks the task into sub-tasks, gives each worker clear instructions, and combines their results.
- **Workers** each start with a **clean context**, do heavy reading or tool use, and return a **compact summary**.
- The lead's context stays small: it sees summaries, not every page each worker read.

## Why it helps

| Benefit | Because |
|---|---|
| **Breadth** | Workers explore in parallel (faster, more ground covered) |
| **Clean contexts** | Each worker focuses on one thing; the lead isn't drowned in detail |
| **Cost control** | Workers can use a cheaper model (Haiku 5.5 or Sonnet 5.5) while the lead uses Opus 5.5 |

## The costs

- **Many more tokens** overall (each worker has its own context); Anthropic's research system found multi-agent runs used several times the tokens of a single chat.
- **Coordination failures**: workers duplicate effort, misunderstand the brief, or return the wrong level of detail.
- **Harder to debug**: you need tracing across agents.

So use it when the task is **broad and parallelisable** and valuable enough. Many tasks are better with a single agent.

## Making it work

- **Write precise briefs** for each worker: objective, scope, output format, what *not* to do, where to stop.
- **Specify the return format** ("at most 200 words: findings, sources, open questions").
- **Scale effort to the task**: one worker for a simple question, several for broad research. Tell the lead this explicitly.
- **Avoid shared mutable state**; workers return results, the lead combines them.
- **Trace everything**.

## Building it

| Option | How |
|---|---|
| **Your own code** | Lead = a model with a `delegate(task)` tool; each call runs a worker (a separate Messages API loop) and returns its summary |
| **Claude Agent SDK** | Define **sub-agents** (name, description, tools, prompt); the main agent delegates to them |
| **Managed Agents** | Multi-agent configs with worker agents and workflows run on Anthropic's side |

A minimal hand-rolled delegate tool:

```ts
const delegate = betaZodTool({
  name: "delegate",
  description: "Give a focused research sub-task to a worker. Use for independent sub-questions; run several in parallel.",
  inputSchema: z.object({ task: z.string(), output_format: z.string() }),
  run: async ({ task, output_format }) => {
    const result = await client.beta.messages.toolRunner({
      model: "claude-haiku-5-5",
      max_tokens: 8000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: `${task}\n\nReturn: ${output_format}` }],
    });
    return result.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  },
});
```

## Other multi-agent patterns

- **Pipeline**: agent A's output feeds agent B (draft → review).
- **Evaluator–optimiser**: one produces, another critiques, repeat.
- **Debate / voting**: several answer independently, then compare (expensive; for high-stakes decisions).

## Check yourself

1. Why do workers return summaries instead of everything they read?
2. When is a multi-agent system *not* worth it?
3. Which model would you use for workers and which for the lead?

### Answers

1. To keep the lead's context small and focused; it needs the findings, not the raw material.
2. When the task is narrow, sequential or cheap; the extra tokens and coordination aren't justified.
3. Typically a cheaper model (Haiku 5.5 or Sonnet 5.5) for workers and the strongest (Opus 5.5) for the lead; measure to confirm.
