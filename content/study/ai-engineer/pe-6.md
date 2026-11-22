When code consumes a model's output, "please return JSON" isn't good enough: sooner or later you get a stray sentence, a missing field or invalid syntax. **Structured outputs** make the API **guarantee** a response that matches your JSON Schema.

## How it works

You pass a JSON Schema in `output_config.format`. The API uses **constrained decoding**: at each step, tokens that would break the schema can't be chosen. The result always parses and always has the required fields with the right types.

## With Zod (TypeScript)

```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic();

const Meal = z.object({
  items: z.array(
    z.object({
      food: z.string(),
      grams: z.number(),
      kcal: z.number(),
      protein_g: z.number(),
    }),
  ),
  total_kcal: z.number(),
  total_protein_g: z.number(),
  confidence: z.enum(["low", "medium", "high"]),
});

const response = await client.messages.parse({
  model: "claude-haiku-5-5",
  max_tokens: 4000,
  messages: [{ role: "user", content: "Log: 3 eggs, 2 slices of toast with butter, a black coffee" }],
  output_config: { format: zodOutputFormat(Meal) },
});

const meal = response.parsed_output;   // typed; null if parsing failed
if (!meal) throw new Error("No structured output");
console.log(meal.total_kcal, meal.items);
```

`messages.parse()` sends the schema and validates the reply into a typed object. Python has the same with Pydantic models.

## Without a helper

```ts
const response = await client.messages.create({
  model: "claude-haiku-5-5",
  max_tokens: 4000,
  messages: [{ role: "user", content: "..." }],
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: { label: { type: "string", enum: ["billing", "technical", "other"] } },
        required: ["label"],
        additionalProperties: false,
      },
    },
  },
});
const data = JSON.parse(response.content.find((b) => b.type === "text")!.text);
```

(Older code uses a top-level `output_format` parameter; that's deprecated in favour of `output_config.format`.)

## Two flavours

| Feature | Guarantees | Use when |
|---|---|---|
| **JSON outputs** (`output_config.format`) | The **response** matches your schema | You want data back: extraction, classification |
| **Strict tool use** (`strict: true` on a tool) | **Tool inputs** match the tool's schema | The model calls your functions (Tool use module) |

## Schema design tips

- **Describe fields** (`z.string().describe("ISO date, e.g. 2026-11-22")`). Descriptions guide the content; the schema only guarantees the shape.
- **Enums** for fixed categories.
- **Allow uncertainty**: a `confidence` field, or `null`/"unknown" options, so the model isn't forced to invent values.
- Put a **reasoning field first** if you want it to explain before deciding; fields are generated in order.
- Keep schemas reasonably simple; some advanced JSON Schema features aren't supported (the docs list the limits).

## What it doesn't guarantee

- **Correct values.** `kcal: 9000` for an egg is valid JSON. Validate ranges in code, and use evals for accuracy.
- **No refusal or truncation.** Check `stop_reason`: if it's `max_tokens` or `refusal`, the output may be incomplete or missing.
- Structured outputs **can't be combined with Citations** in the same request.

## Check yourself

1. Why is "Respond only with JSON" in the prompt not enough for production?
2. Which feature do you use to make tool arguments match a schema?
3. The schema is satisfied but values are often wrong. What next?

### Answers

1. Prompting raises the odds but doesn't guarantee it; occasional invalid or extra text will break your parser. Structured outputs enforce the schema.
2. Strict tool use: `strict: true` on the tool definition.
3. Improve the prompt (descriptions, examples, context), add range validation in code, and measure with an eval.
