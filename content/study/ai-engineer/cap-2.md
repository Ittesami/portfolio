## The brief

Build an **agent that automates a real, recurring task for you**, end to end, safely. The point is reliability: it should run regularly and you should trust its output.

## Ideas

| Agent | What it does |
|---|---|
| **Weekly review** | Every Sunday, reads Daily (workouts, prayers, to-dos, study, teaching), writes a review with next week's focus, and emails or posts it to you |
| **Teaching admin** | After each week, drafts per-student progress notes from your Teaching tracker and flags unmarked or rescheduled classes |
| **Job hunt scout** | Searches job boards daily for AI engineer roles matching your profile, scores them against your CV, writes a shortlist with reasons |
| **Repo maintainer** | Weekly, updates dependencies in your portfolio repo in a branch, runs the build, opens a PR with a summary (Agent SDK) |

## Requirements

- **Real trigger**: a schedule (cron, a scheduled Managed Agents deployment, GitHub Actions) or an event.
- **Appropriate harness**: choose and justify Tool Runner, Agent SDK or Managed Agents.
- **Guardrails**: max steps, a budget, least-privilege tools, human approval before anything irreversible (sending to others, merging, deleting).
- **Observability**: every run logged with steps, tool calls, cost and outcome.
- **Evaluation**: a definition of "good output" with a rubric, checked on at least 10 runs (judge + your own review).
- **Failure handling**: what happens when a tool fails, the model refuses or the budget runs out; you get notified, not silence.

## Milestones

1. Do the task **by hand** once, writing down every step. That's your spec.
2. Build it as a **workflow** first; only make parts agentic where the steps truly vary.
3. Add guardrails, logging and notifications.
4. Run it for **two weeks**; review every output; turn bad outputs into eval cases and fix.

## Done when

- [ ] Runs on its own schedule without you
- [ ] Two weeks of logged runs, with cost per run
- [ ] A rubric and at least 10 graded runs
- [ ] Nothing irreversible happens without your approval
- [ ] Write-up done (next task)
