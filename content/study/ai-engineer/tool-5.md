"Agent" is the most over-used word in AI. Often the right answer is **not** to build one. This lesson is about choosing the simplest design that works.

## Three tiers

| Tier | Who controls the flow | Example |
|---|---|---|
| **Single call** | — | Summarise this email |
| **Workflow** | **Your code** runs fixed steps, some calling a model | Extract → validate → translate → save |
| **Agent** | **The model** decides which tools to call, in what order, until done | "Research this topic and write a brief" |

Agents are flexible but **slower, pricier and less predictable**. Workflows are predictable and cheap. Move up a tier only when the lower one can't do the job.

## Common workflow patterns

These come from Anthropic's "Building effective agents" guide; most real systems are combinations.

**1. Prompt chaining**: each step's output feeds the next, with checks in between.

```
outline ──► check outline ──► draft ──► edit for tone
```

**2. Routing**: classify the input, then send it to a specialised prompt or model.

```
ticket ──► classifier ──┬─► billing prompt
                        ├─► technical prompt (Opus + tools)
                        └─► FAQ answer (Haiku)
```

**3. Parallelisation**: run independent sub-tasks at once (sectioning), or the same task several times and vote.

**4. Orchestrator–workers**: one model breaks the task into sub-tasks dynamically and hands them to workers, then combines results.

**5. Evaluator–optimiser**: one call produces, another critiques against criteria, loop until it passes.

## When an agent is justified

Ask four questions. Build an agent only if **all** are yes:

1. **Complexity:** is the task multi-step and hard to specify in advance?
2. **Value:** is the outcome worth the extra cost and latency?
3. **Viability:** can the model actually do this kind of task well?
4. **Cost of error:** can mistakes be caught and fixed (tests, review, undo)?

"Fix failing tests in this repo" passes all four. "Extract the invoice number" fails the first.

## Anatomy of an agent

```
┌───────────────────────────────┐
│ goal + instructions + tools   │
└──────────────┬────────────────┘
               ▼
     ┌───► model decides ────┐
     │         │             │
     │    calls tools     done? ──► answer
     │         │
     └── observe results ◄───┘
```

It's the tool loop from lesson 1, run until the model decides it's finished. The engineering is in:

- **Good tools** with clear descriptions and helpful errors.
- **Clear goals** and a definition of done.
- **Guardrails**: max iterations, budgets, confirmation for risky actions.
- **Context management** for long runs (next lesson).
- **Observability**: log every step so you can see why it went wrong.

## Hosting options

| Option | You write | Who runs the loop |
|---|---|---|
| Manual loop | Everything | You |
| Tool Runner | Tools | SDK, on your server |
| **Managed Agents** | Agent config + your tools | Anthropic hosts the loop and a sandbox (Agents in production) |
| Claude Agent SDK | Prompt + options | The Claude Code harness, on your server |

## Check yourself

1. Translating product descriptions into five languages: workflow or agent?
2. Name the pattern: "a cheap model labels each email, then each label has its own prompt".
3. What safeguards should every agent have?

### Answers

1. A workflow (parallel calls, one per language); the steps are fixed and known in advance.
2. Routing.
3. A max number of steps or a budget, confirmation for risky or irreversible actions, input validation in tools, and logging of every step.
