## What you're building

A proper eval suite for the **meal-log parser** from the Prompting project, then use it to choose the best prompt, model and effort on evidence.

```
$ npm run eval -- --prompt v3 --model claude-haiku-5-5

Meal parser eval · 80 cases (dev 56 / test 24) · prompt v3 · haiku-5-5
                     dev     test
kcal within ±20%     82%     79%
protein within ±25%  77%     75%
schema valid        100%    100%
totals add up        98%    100%
judge: items correct 4.3/5   4.2/5
cost  $0.0009 / case · p50 1.1 s
Failures written to results/2026-12-01-v3-haiku.json
```

## Steps

1. **Grow the set to ~80 cases** from your real logs. For each, write the reference: items and your best estimate of kcal and protein (use labels, a nutrition database, or careful estimates). Tag cases: typical, vague, South Asian dishes, edge, adversarial.
2. **Split** 70/30 into dev and test files. Don't look at test outputs while tuning.
3. **Runner**: one command that runs every case through a chosen prompt version, model and effort, and saves all outputs with tokens, cost and latency.
4. **Code graders**: schema valid, totals add up, kcal and protein within tolerance, empty/adversarial inputs produce zero items.
5. **LLM judge** for "are the identified items and portions sensible?" (1–5 with a rubric). Calibrate it on 20 cases you grade by hand.
6. **Report**: the table above, plus a list of failures to read.
7. **Experiments**, one change at a time, logged in a table:
   - 2–3 prompt improvements based on failures
   - Haiku 5.5 vs Sonnet 5.5 vs Opus 5.5
   - effort low vs medium
8. **Cache** the system prompt and examples; confirm `cache_read_input_tokens` in the logs.
9. **Batch** one full run with the Batches API and compare the cost.

## Done when

- [ ] 80 cases with references, split into dev and test
- [ ] `npm run eval` produces the summary and a failures file
- [ ] The judge's grades agree with yours on most of the 20 calibration cases
- [ ] An experiment log with at least 5 rows, each with quality, cost and latency
- [ ] A short written decision: which prompt/model/effort you'd ship, and why

## Stretch goals

- Run the rule-based estimator (`lib/food-estimate.js`) through the same eval as a baseline row.
- A GitHub Action that runs the dev eval on every prompt change and fails if the score drops.
- Try a hybrid: rule-based first, LLM only when its confidence is low. Score the combination.
