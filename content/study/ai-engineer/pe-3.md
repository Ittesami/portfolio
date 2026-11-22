A few good **examples** often teach the model more than a page of instructions. This is called **few-shot** or **multishot prompting**.

## Why examples work

Instructions describe what you want; examples **show** it: the format, the tone, the level of detail, how to treat edge cases. The model picks up patterns you'd struggle to put into words.

## Basic pattern

```
Classify each customer message as billing, technical, account or other.
Reply with the label only.

<examples>
<example>
<message>I was charged twice this month</message>
<label>billing</label>
</example>
<example>
<message>The app crashes when I upload a photo</message>
<label>technical</label>
</example>
<example>
<message>How do I change my email address?</message>
<label>account</label>
</example>
</examples>

<message>{{USER_MESSAGE}}</message>
```

Wrapping examples in `<example>` tags keeps them separate from the real input and from your instructions.

## What makes examples good

| Quality | Why |
|---|---|
| **Relevant** | Look like your real inputs (same length, style, messiness) |
| **Diverse** | Cover different cases, so the model learns the rule, not one surface pattern |
| **Include edge cases** | Show the tricky ones: empty input, two categories at once, sarcasm |
| **Consistent** | Same format every time; inconsistency teaches inconsistency |
| **3–5 is usually enough** | More helps for complex formats, but costs tokens on every call |

## The over-copying trap

Models copy examples **closely**. If every example summary starts "This article explains...", every output will too. If all examples are short, long inputs get short outputs.

Fixes:

- Vary the examples in the ways you want outputs to vary.
- Say what's essential and what's incidental: "Examples show the format; length should match the input."

## Examples of reasoning

For tasks that need judgement, show the reasoning, not just the answer:

```
<example>
<review>Food was great but we waited an hour for a table.</review>
<analysis>Positive about food, negative about service. Mixed overall.</analysis>
<sentiment>mixed</sentiment>
</example>
```

## Multi-turn examples

You can also put examples in as earlier conversation turns (a user message and an assistant reply per example). This works well for chat-style tasks and keeps examples visually identical to real use.

## Examples vs other tools

| Need | Best tool |
|---|---|
| A strict JSON shape | **Structured outputs** (guaranteed), lesson 6 |
| A tone or style | Examples |
| Hard-to-describe judgement | Examples with reasoning |
| Lots of varied knowledge | RAG (retrieve relevant examples per request) |

**Dynamic few-shot** combines the last two: store hundreds of labelled examples, retrieve the 3–5 most similar to each new input, and put those in the prompt.

## Check yourself

1. All five of your examples are positive reviews. What will go wrong?
2. Why put examples in XML tags?
3. Your outputs all start with exactly the same phrase. Why, and what do you do?

### Answers

1. The model may be biased towards "positive" and won't have seen how to handle negative or mixed reviews; make the examples diverse.
2. To separate them clearly from instructions and from the real input.
3. The examples all start that way and the model is copying them; vary the openings or say the examples show format only.
