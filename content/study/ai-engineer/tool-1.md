**Tool use** (also called function calling) lets the model ask **your code** to do things: look up data, call an API, run a calculation, write to a database. It's the foundation of every agent.

## The key idea

The model **never runs anything itself**. It only *asks*. Your code decides whether to run the tool, runs it, and sends back the result.

```
 you ──► request (+ tool definitions) ──► Claude
                                            │ "I need get_weather({city: 'Dhaka'})"
 you ◄── stop_reason: "tool_use" ◄──────────┘
  │ run get_weather("Dhaka") → "31°C, humid"
 you ──► request (+ history + tool_result) ──► Claude
                                                │ "It's 31°C and humid in Dhaka."
 you ◄── stop_reason: "end_turn" ◄──────────────┘
```

## 1. Define tools

Each tool has a **name**, a **description** and an **input schema** (JSON Schema):

```ts
const tools: Anthropic.Tool[] = [
  {
    name: "get_todos",
    description:
      "Get the user's to-do items. Use this when the user asks what they need to do, " +
      "what's due, or about a specific task. Returns a list of items with title, due date and done status.",
    input_schema: {
      type: "object",
      properties: {
        due: { type: "string", enum: ["today", "this_week", "overdue", "all"], description: "Which items to return" },
      },
      required: ["due"],
    },
  },
];
```

**The description is the most important part.** It's how the model decides *when* to use the tool and *how* to fill the inputs. Say what it does, when to use it, what each input means and what it returns. Several sentences is normal.

## 2. The loop

```ts
const messages: Anthropic.MessageParam[] = [{ role: "user", content: "What's overdue?" }];

for (;;) {
  const response = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, tools, messages });
  messages.push({ role: "assistant", content: response.content });     // keep tool_use blocks

  if (response.stop_reason !== "tool_use") break;                    // finished (or max_tokens/refusal)

  const results: Anthropic.ToolResultBlockParam[] = [];
  for (const block of response.content) {
    if (block.type !== "tool_use") continue;
    try {
      const output = await runTool(block.name, block.input);           // YOUR code
      results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(output) });
    } catch (err) {
      results.push({ type: "tool_result", tool_use_id: block.id, content: String(err), is_error: true });
    }
  }
  messages.push({ role: "user", content: results });                 // ALL results in ONE user message
}
```

The `tool_use` block looks like:

```json
{ "type": "tool_use", "id": "toolu_01A...", "name": "get_todos", "input": { "due": "overdue" } }
```

Each `tool_result` must reference its `tool_use_id`.

## Rules that trip people up

- **Send back the assistant's full content**, including `tool_use` blocks, before the results.
- **One result per tool call**, all in **one** user message. Splitting results across messages teaches the model to stop making parallel calls.
- **Errors are results too.** Return `is_error: true` with a helpful message ("No task with id 17. Use get_todos to list ids.") so the model can recover. Don't drop the result.
- **Parse `input` as an object**; never string-match the raw JSON.
- **Validate inputs** before acting. The model's output is untrusted: check types, ranges, permissions.

## Controlling tool use

`tool_choice` options:

| Value | Meaning |
|---|---|
| `{ type: "auto" }` (default) | Model decides whether to call tools |
| `{ type: "none" }` | Don't call tools this turn |
| `{ type: "any" }` / `{ type: "tool", name }` | Force a call. **Rejected on Opus 5.5 and Sonnet 5.5**; steer with instructions instead |

## Designing good tools

- **Few, well-described tools** beat many overlapping ones.
- **Meaningful names** (`search_orders`, not `tool3`).
- **Return what the model needs**, concise and readable; not a 5,000-line JSON dump.
- **Make dangerous tools explicit** ("Deletes permanently. Only use after the user confirms.") and add a confirmation step in your app.

## Check yourself

1. Who actually executes a tool?
2. The model called three tools in one turn. How do you return the results?
3. A tool fails because the id doesn't exist. What do you send back?

### Answers

1. Your code. The model only requests the call.
2. Three `tool_result` blocks, each with its `tool_use_id`, together in a single user message.
3. A `tool_result` with `is_error: true` and a message explaining the problem and how to fix it.
