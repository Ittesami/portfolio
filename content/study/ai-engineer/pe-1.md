Anthropic publishes a free, hands-on **prompt engineering tutorial** as Jupyter notebooks in its `courses` repository. It's the best way to build intuition before the rest of this module.

## What's in it

The interactive tutorial has around nine chapters plus appendices, each with exercises that check your answer automatically:

| Part | Topics |
|---|---|
| Beginner | How prompts are structured, being clear and direct, assigning roles |
| Intermediate | Separating data from instructions, formatting output, thinking step by step, using examples |
| Advanced | Avoiding hallucinations, building complex prompts for real use cases (chatbots, legal, finance, coding) |
| Appendix | Chaining prompts, tool use, search and retrieval |

The same repository also has courses on the API fundamentals, real-world prompting, prompt evaluations and tool use. The **prompt evaluations** course pairs well with the Evals module later.

## How to work through it

1. Clone [github.com/anthropics/courses](https://github.com/anthropics/courses) and open the prompt engineering tutorial folder.
2. Make a Python venv and install the requirements (see Python for AI work).
3. Put your API key in the notebook's setup cell via an environment variable, not pasted in.
4. **Switch the model to a current one.** The notebooks may name an older model; use `claude-haiku-5-5` for cheap runs. If a cell uses `temperature` or a prefilled assistant turn, remove it: current models reject both. Treat those exercises as "achieve the same thing with instructions".
5. Do every exercise before looking at the hint. Save prompts you're proud of in your learning repo.

Budget: about 4–6 hours in total; it costs very little on Haiku.

## What to take away

The tutorial's core lessons, which the rest of this module goes deeper on:

1. **Be clear and direct.** Write as if briefing a smart new colleague with no context.
2. **Give the model a role** when it helps ("You are a data analyst...").
3. **Separate instructions from data** using XML tags like `<document>...</document>`.
4. **Specify the output format** precisely.
5. **Let it think** before answering hard questions (now built in as adaptive thinking).
6. **Show examples** of what good looks like.
7. **Give it an out**: "If the answer isn't in the document, say so" cuts hallucination.
8. **Break big tasks into steps** (prompt chaining).

## A note on older advice

Prompting changes as models improve. Things the older tutorials stress that matter less now:

- **"Think step by step"** tricks: current models think on their own (adaptive thinking).
- **Shouting** (CAPITALS, "CRITICAL", "YOU MUST"): modern models follow instructions closely; over-emphasis can make them over-apply a rule. Explain *why* instead.
- **Prefilling** the assistant's reply to force a format: not supported on current models; use structured outputs.

The fundamentals (clarity, context, examples, structure) haven't changed.

## Check yourself

1. Why wrap a pasted document in XML tags?
2. What's an "out", and what does it prevent?
3. A notebook cell uses `temperature=0`. What do you do on a current model?

### Answers

1. So the model can tell your instructions apart from the data, and you can refer to it by name ("the text in `<document>`").
2. Explicit permission to say "I don't know" or "not in the document"; it reduces made-up answers.
3. Remove it (current models reject sampling parameters) and get consistency from clear instructions, examples or structured output.
