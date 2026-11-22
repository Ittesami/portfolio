## What you're building

A parser that turns a free-text food log ("2 rotis, dal, a mango lassi") into structured nutrition data, then compares it with the **rule-based estimator** your Daily app already uses (`lib/food-estimate.js`).

```
input:  "chicken biryani (big plate), raita, 1 can coke"
output: {
  "items": [
    { "food": "chicken biryani", "grams": 450, "kcal": 720, "protein_g": 32 },
    { "food": "raita", "grams": 100, "kcal": 70, "protein_g": 4 },
    { "food": "cola", "grams": 330, "kcal": 140, "protein_g": 0 }
  ],
  "total_kcal": 930, "total_protein_g": 36, "confidence": "medium",
  "assumptions": ["'big plate' taken as 450 g"]
}
```

## Steps

1. **Collect 30 real logs** from your meals collection (export a sample), including messy ones: typos, Bangla words, vague portions ("a bit of rice").
2. **Write the schema** with Zod: items (food, grams, kcal, protein_g), totals, `confidence`, and `assumptions` (a list of strings), so guesses are visible.
3. **Write the system prompt**: who it's for (a fitness tracker), portion conventions (a roti ≈ 40 g, a plate of rice ≈ 250 g cooked), what to do when unsure (estimate, lower confidence, record the assumption), South Asian dishes included.
4. **Add 3 examples** covering an easy log, a vague one and one with a dish the estimator doesn't know.
5. **Run all 30** through `messages.parse()` with Haiku 5.5. Save inputs and outputs to a JSON file.
6. **Compare** with `lib/food-estimate.js` on the same 30 logs: a table of kcal and protein from each, and the difference.
7. **Sanity checks in code**: totals equal the sum of items; no item over 2,000 kcal; protein ≤ grams.

## Done when

- [ ] 30 logs parsed, every output valid against the schema
- [ ] A comparison table (rule-based vs LLM) with notes on where each wins
- [ ] Code checks flag impossible values
- [ ] Prompt, schema and results committed to your learning repo

## What to look for

- Where does the rule-based estimator fail completely (unknown dishes)? Where is it more consistent?
- Does the LLM give the **same answer twice** for the same log? Run five logs three times each.
- What does it cost per log? (Likely a tiny fraction of a cent on Haiku.)

Keep the 30 logs and your best-guess correct values: they become the **eval set** for the Evals module project.

## Stretch goals

- Try Sonnet 5.5 and Opus 5.5 on the same logs: is the accuracy gain worth the price?
- Add an API route in Daily: when the rule-based estimator has low confidence, fall back to the LLM.
- Accept a photo of a meal as well as text (Images module).
