Picking a model is an engineering decision you should make **with data**, not by habit. This lesson is the map; the Evals module is how you decide.

## The current line-up

| Model | ID | $ in / out per M | Strengths |
|---|---|---|---|
| **Claude Fable 5.2** | `claude-fable-5-2` | 8 / 40 | Most capable; hardest reasoning and very long agentic tasks |
| **Claude Opus 5.5** | `claude-opus-5-5` | 4 / 20 | The default: coding, agents, complex analysis |
| **Claude Sonnet 5.5** | `claude-sonnet-5-5` | 2 / 10 | Fast, strong everyday model at half Opus's price |
| **Claude Haiku 5.5** | `claude-haiku-5-5` | 0.10 / 0.50 | Very cheap and fast: classification, extraction, sub-agents |

All have **1M-token context** and up to **128K output**. Prices and models change; the docs' Models page is the source of truth, and the **Models API** (`client.models.list()`) tells you what's available and each model's limits programmatically.

## Use exact IDs

Always use the exact ID string (`claude-opus-5-5`). Don't invent date suffixes or guess names: a typo is a 404.

## The family pattern

```
             capability ▲
                        │     ● Fable
                        │   ● Opus
                        │ ● Sonnet
                        │● Haiku
                        └──────────────► cost & latency
```

Bigger = smarter, slower, pricier. The skill is putting **each step** of your system on the **cheapest model that does it well**.

## Typical assignments

| Task | Start with |
|---|---|
| Chat assistant with tools | Opus 5.5 (or Sonnet 5.5 if latency matters) |
| Code generation, agents | Opus 5.5 |
| Classify 50,000 support tickets | Haiku 5.5 (+ Batches for 50% off) |
| Extract fields from receipts | Haiku 5.5 or Sonnet 5.5 |
| Summarise a long PDF | Sonnet 5.5 / Opus 5.5 |
| Research agent's reading sub-tasks | Haiku 5.5 workers, Opus 5.5 lead |
| Hardest multi-hour problems | Fable 5.2 |

## Mixing models in one system

```
user message ──► Haiku: "is this a billing, tech or other question?"
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
     canned FAQ  Opus + tools  Sonnet
```

This is called **routing**. Another pattern: **cascading**, where a cheap model tries first and you escalate to a bigger one if a check fails.

Before building a cascade, try the simple alternative: **the best model at lower effort** (next lesson). One model is simpler, and prompt caches are per-model, so a cascade loses cache reuse.

## Things that differ between models

Read the docs' migration notes when you switch models. Recent examples:

- Current Opus and Sonnet models can't be **forced** to call a specific tool (`tool_choice: "any"/"tool"` is rejected); you steer with instructions instead.
- **Thinking** can't be turned off on Opus 5.5; you lower `effort` instead.
- Effort **defaults differ** (Opus 5.5 defaults to `medium`, most others to `high`).
- Some features are only on certain models (fast mode, task budgets).

That's why you pin a model ID in code and **re-run your evals** when you upgrade.

## Refusals and fallbacks

Models occasionally decline a request (`stop_reason: "refusal"`), sometimes wrongly for harmless requests. On Opus 5.5, Sonnet 5.5 and Fable 5.2 you can let the API automatically **retry on a fallback model** when that happens (the `fallbacks` option, lesson 7).

## Check yourself

1. You need to tag 100,000 product reviews as positive/negative/neutral. Which model and API feature?
2. What is routing?
3. You upgrade from one model version to the next. What should you do before shipping?

### Answers

1. Haiku 5.5, via Message Batches (50% cheaper, not time-sensitive); check accuracy on a labelled sample first.
2. Using a cheap classifier step to send each request to the model or path best suited to it.
3. Read the migration notes for breaking changes and re-run your eval suite to confirm quality, cost and latency.
