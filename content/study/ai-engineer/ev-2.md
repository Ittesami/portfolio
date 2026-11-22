Once you have cases, you need to **grade** outputs. Use the simplest grader that measures what you care about: **code first**, an **LLM judge** where code can't judge, and **humans** to check the judges.

## Code-based grading

Fast, free, exact and repeatable. Use it whenever there's an objective answer.

| Check | Example |
|---|---|
| Exact match | Classification label equals `"billing"` |
| Schema valid | Output parses against the Zod schema |
| Numeric range | Total kcal within ±20% of the reference |
| Contains / doesn't contain | Mentions "30 days"; never mentions a competitor |
| Runs / passes tests | Generated code passes unit tests |
| Tool behaviour | The agent called `complete_todo` with id 17 |
| Cost / latency | Under 3 seconds, under $0.01 |

```ts
function gradeMeal(output: Meal, expect: { kcal_min: number; kcal_max: number }) {
  const sum = output.items.reduce((a, i) => a + i.kcal, 0);
  return {
    inRange: output.total_kcal >= expect.kcal_min && output.total_kcal <= expect.kcal_max,
    totalsAddUp: Math.abs(sum - output.total_kcal) < 5,
  };
}
```

## LLM-as-judge

For qualities code can't measure (helpfulness, tone, faithfulness to sources, whether a summary covers the key points), use a model to grade.

```ts
const Verdict = z.object({
  reasoning: z.string(),                       // first, so it reasons before deciding
  faithful: z.boolean(),
  score: z.number().int().min(1).max(5),
});

const judged = await client.messages.parse({
  model: "claude-opus-5-5",
  max_tokens: 2000,
  system: "You grade answers for a study-notes assistant. Be strict and consistent.",
  messages: [{
    role: "user",
    content:
      `<sources>\n${chunks}\n</sources>\n<question>${q}</question>\n<answer>${answer}</answer>\n\n` +
      "Rubric:\n" +
      "- faithful = true only if every claim in the answer is supported by the sources.\n" +
      "- score 5: correct, complete, concise; 3: partly correct or missing key points; 1: wrong or unsupported.\n" +
      "Explain briefly in reasoning, then give the verdict.",
  }],
  output_config: { format: zodOutputFormat(Verdict) },
});
```

## Making judges reliable

- **Specific rubrics**: define each score level with concrete criteria. "Rate 1–10 for quality" is noise.
- **Binary or small scales** (pass/fail, 1–5) are more consistent than 1–100.
- **Reason first, then verdict** (put `reasoning` before the score in the schema).
- **One criterion per judge call** when criteria are independent (faithfulness, tone, completeness).
- **Give the judge a reference answer** when you have one.
- **Use a strong model** to judge, and don't let a model grade its own output without checks; models can favour their own style.
- **Pairwise comparison** ("Which answer is better, A or B?") is often more reliable than absolute scores; **swap the order** and average to cancel position bias.

## Calibrate the judge against yourself

A judge is only useful if it agrees with you:

1. Grade 30 outputs **by hand**.
2. Run the judge on the same 30.
3. Measure agreement. If it's low, read the disagreements and fix the rubric.
4. Repeat until agreement is high, then trust it on the rest.

## Humans

Still the gold standard for subtle quality. Use human review to:

- build and calibrate judges,
- spot-check a random sample regularly,
- decide on launches.

## Cost

An LLM judge doubles (or more) the calls per eval run. Use code checks for everything objective, a cheaper model for simple judgements once calibrated, and the **Batches API** for big runs (50% off).

## Check yourself

1. Grading whether generated JSON matches a schema: code or LLM?
2. Why put `reasoning` before `score` in the judge's schema?
3. How do you know your LLM judge is trustworthy?

### Answers

1. Code. It's objective, free and exact.
2. Fields are generated in order, so the judge reasons before committing to a score, which improves consistency.
3. Compare its grades with your own on a sample and measure agreement; fix the rubric until they agree well.
