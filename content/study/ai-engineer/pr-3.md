**Agent Skills** package expertise as folders the model can load **when it needs them**: instructions, scripts and reference files for a specific kind of task (making a spreadsheet, following your house style, deploying your app).

## What a skill looks like

```
weekly-review/
├── SKILL.md              ← required: name, description, instructions
├── template.md           ← optional reference files
└── scripts/
    └── gather.py         ← optional code the agent can run
```

```markdown
---
name: weekly-review
description: Write Ittehad's weekly review from Daily data. Use when asked for a weekly review, week summary or "how did my week go".
---

# Weekly review

1. Get the last 7 days of workouts, prayers, to-dos and study progress.
2. Follow the structure in template.md.
3. Keep it under 300 words; end with three focus points for next week.
```

## How skills work: progressive disclosure

Skills don't fill the context up front:

```
1. At start: only each skill's NAME + DESCRIPTION are loaded      (a few dozen tokens each)
2. A task matches a description → the agent reads SKILL.md         (the instructions)
3. If needed → it opens extra files or runs scripts                (only what it uses)
```

So you can install dozens of skills and pay almost nothing until one is used. This is why the **description** matters most: it decides when the skill triggers. Say what the skill does **and when to use it**.

## Skills vs other tools

| | Skill | MCP server | System prompt | Tool |
|---|---|---|---|---|
| Is | Instructions + files + scripts | A service exposing tools/data | Always-on instructions | One function |
| Loaded | On demand | Tools listed up front | Always | Schema always |
| Best for | Procedures, know-how, templates | Access to external systems | Rules for every request | A single action |

They combine well: a skill can explain *how* to use an MCP server's tools for a particular workflow.

## Where skills run

- **Claude Code**: put skills in `.claude/skills/` (project) or your user skills folder. Claude uses them automatically when relevant.
- **Claude apps (claude.ai, Desktop)**: Anthropic provides skills (Word, Excel, PowerPoint, PDF), and you can upload your own.
- **Claude API**: attach skills to a request via a container with the code execution tool; Anthropic's document skills let the model create `.docx`, `.xlsx`, `.pptx` and PDF files you download through the Files API.
- **Agent SDK and Managed Agents** support skills too.

## Writing good skills

- **One job per skill**, with a sharp description that names trigger phrases.
- **Keep SKILL.md short**; move long reference material into separate files the agent opens only when needed.
- **Scripts for deterministic work** (parsing, calculations, file conversion) instead of asking the model to do it in its head.
- **Concrete steps and examples** of good output.
- **Test it**: give the agent tasks that should and shouldn't trigger it, and check it follows the steps.

## Safety

Skills can contain **code the agent runs**. Only install skills from sources you trust, and read them first, as you would any script.

## Check yourself

1. Why is a skill's description so important?
2. What does "progressive disclosure" mean for skills?
3. When would you choose an MCP server over a skill?

### Answers

1. Only the name and description are loaded up front; the description decides whether the agent opens the skill for a task.
2. Information is loaded in stages: description first, then SKILL.md when relevant, then extra files or scripts only if needed.
3. When the agent needs access to an external system or live data (an API, a database); skills package know-how and procedures.
