Writing the tool loop by hand teaches you how it works. After that, let the SDK's **Tool Runner** write it for you.

## What the Tool Runner does

It's a helper in the regular Anthropic SDK that:

1. Sends the request with your tools.
2. When the model asks for a tool, **runs your function**.
3. Sends the result back.
4. Repeats until the model stops calling tools, then returns the final message.

You write **only the tool functions**.

## With Zod (TypeScript)

```ts
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();

const getTodos = betaZodTool({
  name: "get_todos",
  description: "Get the user's to-dos. Use when they ask what to do or what's due.",
  inputSchema: z.object({
    due: z.enum(["today", "this_week", "overdue", "all"]).describe("Which items to return"),
  }),
  run: async ({ due }) => {
    const items = await fetchTodos(due);            // your code
    return JSON.stringify(items);
  },
});

const addTodo = betaZodTool({
  name: "add_todo",
  description: "Add a to-do item. Use when the user asks you to remember or add a task.",
  inputSchema: z.object({ title: z.string(), dueDate: z.string().optional().describe("YYYY-MM-DD") }),
  run: async (input) => JSON.stringify(await createTodo(input)),
});

const final = await client.beta.messages.toolRunner({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  tools: [getTodos, addTodo],
  messages: [{ role: "user", content: "What's overdue? Also add 'renew passport' for Friday." }],
});

console.log(final.content);
```

The Zod schema becomes the JSON Schema automatically, and `run` receives **typed, validated** input.

Python is similar with a decorator:

```python
from anthropic import beta_tool

@beta_tool
def get_todos(due: str) -> str:
    """Get the user's to-dos. due: today, this_week, overdue or all."""
    return json.dumps(fetch_todos(due))

runner = client.beta.messages.tool_runner(model="claude-opus-5-5", max_tokens=16000,
                                          tools=[get_todos], messages=[...])
final = runner.until_done()
```

## Iterating step by step

You can loop over the runner to see each turn (for logging, a progress UI or stopping early):

```ts
const runner = client.beta.messages.toolRunner({ /* same params */ });
for await (const message of runner) {
  for (const b of message.content) if (b.type === "tool_use") console.log("calling", b.name, b.input);
}
const final = await runner;   // or runner.done()
```

The runner also supports streaming, and hooks for approval gates, changing results, and error handling.

## Mixing in server tools

Server tools (next lesson) can go in the same `tools` list; they run on Anthropic's side, so they have no `run` function:

```ts
tools: [getTodos, { type: "web_search_20260209", name: "web_search", max_uses: 3 }]
```

## Tool Runner vs the Agent SDK

These sound similar but are different products:

| | Tool Runner | Claude Agent SDK |
|---|---|---|
| Package | The normal `@anthropic-ai/sdk` | `@anthropic-ai/claude-agent-sdk` |
| Tools | Only ones **you** define | Built-in file, bash, search tools + yours |
| What it is | A loop helper over the Messages API | Claude Code as a library |
| Covered in | This lesson | Agents in production |

## When to write the loop yourself

- You need control the runner doesn't give (custom retry rules, unusual turn structure).
- You want to avoid beta helpers.
- You're learning (write it by hand once, as in lesson 1).

## Check yourself

1. What do you still write when using the Tool Runner?
2. How do you see which tools are called, turn by turn?
3. Is the Tool Runner the same as the Claude Agent SDK?

### Answers

1. The tool definitions and their `run` functions (plus the initial request).
2. Iterate over the runner with `for await` and log `tool_use` blocks in each message.
3. No. The Tool Runner loops over your own tools via the Messages API; the Agent SDK is the full Claude Code harness with built-in tools.
