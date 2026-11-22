Two features make tool use production-ready: **strict mode** (inputs always match your schema) and **parallel calls** (several tools in one turn).

## Strict tool use

Normally the model's tool inputs *usually* match your schema. With `strict: true`, the API **guarantees** they do, using the same constrained decoding as structured outputs.

```ts
const tools: Anthropic.Tool[] = [
  {
    name: "log_workout",
    description: "Save a completed gym workout. Use after the user describes what they did.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", format: "date" },
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              sets: { type: "integer" },
              reps: { type: "integer" },
              weight_kg: { type: "number" },
            },
            required: ["name", "sets", "reps", "weight_kg"],
            additionalProperties: false,
          },
        },
      },
      required: ["date", "exercises"],
      additionalProperties: false,
    },
  },
];
```

Requirements: `strict: true` sits on the **tool** (next to `name`), and every object in the schema needs `additionalProperties: false` and a `required` list.

Why it matters: without it, a missing field or a `"sets": "three"` string can crash your handler. With it, you can trust the shape (but still check values make sense: `sets: 400` is valid JSON).

## Parallel tool calls

When calls are independent, the model can make **several in one turn**:

```
user: "Compare the weather in Dhaka and London."
assistant: [tool_use get_weather {city: "Dhaka"}] [tool_use get_weather {city: "London"}]
```

Run them **concurrently** and return **all** results in **one** user message:

```ts
const calls = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

const results = await Promise.all(
  calls.map(async (call): Promise<Anthropic.ToolResultBlockParam> => {
    try {
      return { type: "tool_result", tool_use_id: call.id, content: JSON.stringify(await runTool(call.name, call.input)) };
    } catch (err) {
      return { type: "tool_result", tool_use_id: call.id, content: String(err), is_error: true };
    }
  }),
);
messages.push({ role: "user", content: results });
```

Parallel calls cut the number of round trips, which saves both time and tokens (each round trip resends the context).

- To **turn it off** (e.g. tools that must run in order), set `tool_choice: { type: "auto", disable_parallel_tool_use: true }`: at most one call per turn.
- A prompt line like "When calls don't depend on each other, make them in parallel" encourages it.

## Order of execution

If parallel calls have side effects (two writes to the same record), decide in code whether to run them concurrently or one by one. The model's order in the list is a reasonable sequence to follow.

## Tool results can be rich

`content` in a `tool_result` can be a string, or blocks: text, and also **images** or **documents**. A screenshot tool can return the screenshot as an image block for the model to look at.

## Check yourself

1. What two things must every object in a strict schema have?
2. Why return parallel results in one message instead of one message each?
3. Strict mode is on. Do you still need to validate inputs?

### Answers

1. `additionalProperties: false` and a `required` list.
2. Splitting them discourages future parallel calls and breaks the expected turn structure; one message with all results is the correct format.
3. Yes, for values and permissions (ranges, ownership, dangerous actions); strict only guarantees the shape.
