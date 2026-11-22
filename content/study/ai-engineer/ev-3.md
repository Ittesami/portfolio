With an eval and a grader, improving a prompt becomes a loop you can run with confidence: **change one thing, measure, keep or revert**. The trap to avoid is **overfitting** to your eval cases.

## The improvement loop

```
1. Run the eval → baseline score + failing cases
2. Read the failures; group them by cause ("misses portion words", "invents brands")
3. Change ONE thing aimed at the biggest group
4. Re-run the WHOLE eval
5. Better overall? keep. Worse or same? revert.
6. Record it (version, change, score) and repeat
```

Keep a log:

| Version | Change | Train score | Notes |
|---|---|---|---|
| v1 | Baseline | 72% | Fails on vague portions |
| v2 | Added portion conventions | 81% | Fixed 6, broke 1 (raita) |
| v3 | Added raita example | 83% | |
| v4 | Switched to Sonnet 5.5 | 86% | +$0.0004 per log |

## What to change

Roughly in order of impact:

1. **Missing context or instructions**: the failure often shows the model didn't know something you assumed.
2. **Ambiguity**: two readings of an instruction; make it precise.
3. **Examples**: add one showing the failing pattern done right.
4. **Output format**: structured outputs, clearer schema descriptions.
5. **Model and effort**: more capable model or higher effort for hard cases.
6. **Architecture**: split into steps, add retrieval, add a tool (e.g. a nutrition database lookup instead of memory).

## Overfitting

If you tune until every eval case passes, you may have just **memorised the eval**: special-case instructions ("if the input mentions raita, use 70 kcal") that don't generalise.

Prevent it with a **train / test split**:

```
eval set (100 cases)
├── train / dev (70)   ← look at these, tune against them
└── test (30)          ← don't look; run only to confirm a change generalises
```

- Tune on the dev set only.
- Check the test set occasionally. If dev goes up and test doesn't, you're overfitting.
- When you add cases, add them to both sets.

Also:

- **Prefer general fixes** over case-specific rules.
- Watch for instructions that only exist to satisfy one example.

## Noise

Model outputs vary between runs. Before believing a 2% difference:

- Run each version **several times** (e.g. 3) and average.
- Check that the difference is bigger than the run-to-run spread.
- Grow the eval set; more cases = less noise.

## Measure the whole picture

A prompt that's 2% more accurate but 3× slower and pricier may not be better. Track per version:

- **Quality** (overall and by category)
- **Cost per case** (tokens × price)
- **Latency** (median and slowest)

## Automate it

Make the eval a single command (`npm run eval`) that prints a summary table and saves results to a timestamped file. Then run it:

- before merging any prompt or model change,
- when upgrading models,
- on a schedule, if the system depends on changing data.

## Check yourself

1. Dev score rises from 80% to 92%; test score stays at 79%. What's happening?
2. Why change only one thing at a time?
3. Version B is 1% better than A on a 50-case eval run once. Ship it?

### Answers

1. Overfitting: the changes fit the dev cases but don't generalise.
2. So you know which change caused the improvement or regression.
3. Not yet. One case's difference on a single run is noise; repeat runs and/or add cases, and compare cost and latency too.
