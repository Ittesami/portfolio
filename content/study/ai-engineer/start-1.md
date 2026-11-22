This course takes you from **your first API call** to **deployed agents with RAG and evals**. It's built for someone who already codes (JavaScript/Next.js, Python) and has the ML theory from an MSc, and wants the **practical engineering** side of building with large language models.

## What an AI engineer actually does

An AI engineer builds **products on top of models**, not the models themselves. The day-to-day work is:

| Work | What it means | Module |
|---|---|---|
| **Calling models well** | Requests, streaming, errors, cost, picking a model | The Claude API |
| **Instructing them** | Prompts that give reliable, structured output | Prompt engineering |
| **Feeding them** | Images, PDFs, your own data (RAG) | Images and PDFs, RAG |
| **Letting them act** | Tools, agents, MCP servers | Tool use, MCP |
| **Proving it works** | Evals, measuring cost and speed | Evals |
| **Shipping safely** | Prompt injection, secrets, logging, deployment | Safety, Production |

A machine-learning engineer trains and tunes models. An AI engineer mostly **composes** them: the model is a component, like a database, and the skill is in the system around it.

## How the course is laid out

```
Foundations ─► Claude API ─► Prompting ─► Images & PDFs
                                  │
                                  ▼
           Tool use & agents ─► MCP ─► RAG ─► Evals ─► Safety ─► Production
                                                                     │
ML foundations (run alongside, any time)                             ▼
                                                              Capstones & career
```

- **Do the modules in order** up to Evals. Each one builds on the last: tools need the API, RAG needs prompting, evals need something to evaluate.
- **ML foundations** is a side track. Do a lesson whenever your MSc covers something related.
- Safety and Production can be read together.

## How each module works

1. **Lessons** (with notes like this one): read the note, run the code snippets yourself, answer the "Check yourself" questions at the end. Mark the lesson **done** only once you could explain it to someone else.
2. **Project** at the end of each module: a small, real thing you build using only what that module taught. Most projects use **your own data** (food log, fitness, study notes), so they're useful as well as practice.
3. **Capstones** at the end combine everything into two portfolio pieces.

Every project note has the same parts: **what you're building**, **steps**, **done when** (a checklist), and **stretch goals**.

## Pace

| Pace | Hours a week | Time to finish |
|---|---|---|
| Steady | 5–6 | about 4 months |
| Fast | 10+ | about 8 weeks |

A sensible rhythm: two or three lessons on weekdays, the module project at the weekend.

## Tools you'll use

- **Language:** TypeScript/JavaScript (matches your Next.js portfolio) for most of it, Python for the ML module and anywhere a library is Python-only.
- **SDK:** `@anthropic-ai/sdk` (TypeScript) or `anthropic` (Python), the official Anthropic SDKs.
- **Docs:** [platform.claude.com/docs](https://platform.claude.com/docs) is the reference. When a note and the docs disagree, the docs win; the API changes fast.
- **Claude Code** for writing code with an agent, and later as a library (Agent SDK).
- **MongoDB Atlas** (you already use it) for vector search in the RAG module.

## Keeping costs low

You pay per token. Learning costs very little if you're careful:

- Use **Claude Haiku 5.5** (`claude-haiku-5-5`, $0.10 per million input tokens) for experiments and bulk runs; switch to **Opus 5.5** when quality matters.
- Set a **monthly spend limit** in the Claude Console before you start (next task).
- Keep `max_tokens` sensible while testing, and print `usage` on every response so you see what each call costs.

## The rule that matters most

> Build something, measure it, then improve it.

Most beginners tweak prompts by feel. The habit that separates engineers is **evaluating** changes against real examples (the Evals module). Start saving interesting inputs and outputs from your very first project; they become your first eval set.

## Check yourself

1. What's the main difference between an AI engineer and an ML engineer?
2. Which module must you finish before RAG, and why?
3. Which model should you default to for cheap experiments?

### Answers

1. An AI engineer builds products and systems around existing models (prompts, tools, retrieval, evals, deployment); an ML engineer trains and tunes the models themselves.
2. Prompt engineering (and the API before it): RAG is "put the right text into the prompt", so you need to know how to structure prompts and long documents first.
3. Claude Haiku 5.5, because it's by far the cheapest; move up to Opus 5.5 when you need the quality.
