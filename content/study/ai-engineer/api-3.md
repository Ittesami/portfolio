Two building blocks turn a single question into an application: the **system prompt** (who the model is and the rules it follows) and **multi-turn history** (what's been said).

## The system prompt

`system` is a top-level field, separate from `messages`. It sets the role, rules, context and output style for the whole conversation.

```ts
const response = await client.messages.create({
  model: "claude-haiku-5-5",
  max_tokens: 1000,
  system:
    "You are a patient maths tutor for A Level students. " +
    "Explain step by step. Never just give the final answer; ask the student to try the next step.",
  messages: [{ role: "user", content: "How do I integrate x·e^x?" }],
});
```

Good system prompts say:

- **Role and audience**: "a tutor for A Level students".
- **Goal**: what a good response achieves.
- **Rules and limits**: what to do and not do, and *why* (models follow reasons better than bare rules).
- **Format**: length, structure, tone.
- **Stable context**: product facts, a style guide, today's policies.

Put **stable** material in the system prompt and **per-request** material (the user's question, retrieved documents) in messages. That also helps prompt caching later.

## The API is stateless

The model remembers nothing between calls. To have a conversation, **you send the whole history every time**:

```ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const history: Anthropic.MessageParam[] = [];

async function chat(userText: string) {
  history.push({ role: "user", content: userText });
  const response = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 2000,
    system: "You are a concise study buddy.",
    messages: history,
  });
  history.push({ role: "assistant", content: response.content });  // keep the full blocks
  return response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

console.log(await chat("My name is Ittehad and I'm learning RAG."));
console.log(await chat("What's my name and what am I learning?"));   // it knows: we resent turn 1
```

Rules:

- The first message must be `user`. Roles normally alternate `user` / `assistant`.
- Append the assistant's **full `content`** (all blocks), not just the text. Later features (thinking, tool use, compaction) depend on getting their blocks back unchanged.
- Use the SDK's types (`Anthropic.MessageParam`) rather than inventing your own.

## Growing history = growing cost

Turn 10 resends turns 1–9. Options when history gets long:

| Approach | How |
|---|---|
| **Prompt caching** | Cache the unchanged prefix; repeated tokens cost ~10% (later module) |
| **Trim** | Keep the system prompt + the last N turns |
| **Summarise** | Replace old turns with a short summary |
| **Server-side compaction** | The API summarises old context for you automatically (Tool use module) |

## Mid-conversation instructions

Sometimes your app needs to tell the model something new partway through ("the user switched to exam mode"). Editing the top-level `system` would break caching. Current models accept a **system message inside `messages`**, after a user turn:

```ts
messages: [
  ...history,
  { role: "user", content: "Quiz me." },
  { role: "system", content: "Exam mode: ask one question at a time, no hints." },
]
```

It carries the same authority as the system prompt (users can't fake it) and keeps the cached history intact.

## Check yourself

1. Where should a 3,000-word product manual go: system prompt or user message? Why?
2. Why must you send the earlier turns with every request?
3. Why append `response.content` rather than just the text?

### Answers

1. Usually the system prompt (or early in the prompt): it's stable across requests, so it can be cached and acts as background for every turn.
2. The API is stateless; the model only sees what's in the current request.
3. The content can include non-text blocks (thinking, tool use, compaction) that must be sent back unchanged for later turns to work.
