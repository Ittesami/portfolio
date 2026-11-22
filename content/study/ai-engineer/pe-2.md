The most important prompting skill is boring: **say exactly what you want, and give the context needed to do it well.**

## The new-colleague test

Imagine handing your prompt to a brilliant colleague who has **never seen your project**. Could they do the task perfectly from what you wrote? If they'd need to ask questions, the model is guessing those answers.

**Vague:**

```
Summarise this meeting transcript.
```

**Clear:**

```
Summarise this meeting transcript for team members who missed it.

Write:
1. Decisions made (bullets, one line each)
2. Action items as "owner: task (due date)"
3. Open questions

Under 200 words. Skip small talk and anything already decided last week.
```

The second says **who it's for**, **what to include**, **the structure**, **the length** and **what to leave out**.

## Give the context and the reason

Models generalise from reasons far better than from bare rules.

| Rule only | Rule with reason |
|---|---|
| Never use ellipses. | This text is read aloud by a text-to-speech engine, so never use ellipses; it can't pronounce them. |
| Keep it short. | Users read this on a phone notification, so keep it under 120 characters. |

With the reason, the model also handles cases your rule didn't mention (no "etc." or emoji in the speech example either).

## Say what to do, not only what not to do

"Don't use markdown" works less well than "Write in plain flowing paragraphs." Positive instructions give it a target.

## Be specific about the output

- **Length:** words, sentences, bullets ("3 bullets of at most 12 words").
- **Format:** JSON, a table, markdown or plain text (for strict JSON, use structured outputs, lesson 6).
- **Tone and audience:** "for a 15-year-old", "formal, for a client".
- **What "done" means:** "Return only the corrected code, no explanation."

## Ask for exactly what you want done

Modern models follow instructions **literally**. "Can you suggest some changes?" may get suggestions rather than edits. If you want the change made, say "Rewrite the function to...". If you want lots of effort or extra features, ask for them explicitly.

## Roles

A role in the system prompt focuses the model's knowledge and tone:

```ts
system: "You are a senior backend engineer reviewing pull requests for security issues. " +
        "Be specific: name the line, the risk and the fix."
```

Roles help most when they bring **domain expertise** and a **point of view**. "You are a helpful assistant" adds nothing.

## Avoid over-emphasis

Older models needed "IMPORTANT!!!" to pay attention. Current ones follow instructions closely, and shouting makes them over-apply a rule. Use normal language; reserve emphasis for the one thing that truly matters, and explain why.

## Iterate like an engineer

1. Write the prompt.
2. Run it on **several realistic inputs**, including awkward ones.
3. Note each failure, fix the prompt, re-run **all** inputs (fixing one case can break another).
4. Keep the inputs: they become your eval set (Evals module).

The Console's Workbench and its **prompt improver** are handy for fast iteration.

## Check yourself

1. Rewrite "Make this email better" so it passes the new-colleague test.
2. Why add a reason to an instruction?
3. You asked "Could you look at this function?" and got a description instead of a fix. Why?

### Answers

1. Something like: "Rewrite this email to a client about a delayed delivery. Keep it polite and under 120 words, apologise once, give the new date (12 Dec) and offer a 10% discount. Return only the email."
2. The model understands the goal, applies the rule more sensibly, and covers related cases you didn't list.
3. Current models take requests literally; "look at" isn't "fix". Ask directly: "Fix the bug in this function and return the corrected code."
