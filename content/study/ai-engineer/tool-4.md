Some tools are **run by Anthropic** instead of by you. You just declare them; results come back in the same response. No loop on your side.

## The main server tools

| Tool | `type` | What it does |
|---|---|---|
| **Web search** | `web_search_20260209` | Searches the web and returns results with sources |
| **Web fetch** | `web_fetch_20260209` | Fetches the full content of a URL (only URLs already in the conversation) |
| **Code execution** | `code_execution_20260521` | Runs code (bash, Python) in a sandbox: analysis, charts, file processing |

(Tool type names include a date version; the docs list the latest for each model.)

## Web search

```ts
const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  tools: [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: 5,                                    // cap searches per request
      allowed_domains: ["docs.aws.amazon.com", "aws.amazon.com"],   // optional
    },
  ],
  messages: [{ role: "user", content: "What changed in the AWS Free Tier this year?" }],
});
```

The response contains `server_tool_use` blocks (what it searched), `web_search_tool_result` blocks (what it found) and `text` blocks **with citations** to the pages. You pay for the searches plus the tokens of the results it reads.

Use `allowed_domains` *or* `blocked_domains` to keep it on trustworthy sources.

## Web fetch

Fetches a full page or PDF the conversation already mentions (the user pasted a link, or a search returned it). It can't invent URLs, which limits data-exfiltration tricks.

```ts
tools: [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 3 }]
```

The current web search/fetch versions do **dynamic filtering**: the model runs code behind the scenes to filter large pages down to what matters, so it reads fewer tokens. Don't also declare the code execution tool with them.

## Code execution

```ts
tools: [{ type: "code_execution_20260521", name: "code_execution" }]
```

The model writes and runs code in an isolated container, sees the output and iterates. Great for:

- Data analysis on a CSV you upload (Files API)
- Exact maths and statistics (no "mental arithmetic" errors)
- Making charts and files (results downloadable via the Files API)

## Handling the responses

- Errors **don't throw**: a failed search returns HTTP 200 with an error object inside the result block (e.g. `max_uses_exceeded`). Check before indexing.
- **`pause_turn`**: a long server-tool turn may pause. Send the conversation back (with the assistant content) to let it continue. Recent SDK tool runners handle this for you.

```ts
while (response.stop_reason === "pause_turn") {
  messages.push({ role: "assistant", content: response.content });
  response = await client.messages.create({ model, max_tokens, tools, messages });
}
```

## Server vs client tools

| | Client tools (yours) | Server tools |
|---|---|---|
| Runs on | Your server | Anthropic's infrastructure |
| You write | Schema + handler + loop | Just the declaration |
| Access to your data | Yes | No (public web, sandbox) |
| Examples | `get_todos`, `send_email` | web search, code execution |

You can mix both in one request.

## Safety

Web content is **untrusted**: a page can contain instructions aimed at the model ("ignore your instructions and..."). Keep powerful client tools (sending email, deleting data) behind confirmation when the model has been reading the web (Safety module).

## Check yourself

1. Do you need a tool loop for web search?
2. Why can't web fetch retrieve any URL it likes?
3. A search fails. Does the SDK throw an exception?

### Answers

1. No. It runs on Anthropic's side and results come back in the same response (apart from handling `pause_turn`).
2. It only fetches URLs already in the conversation, which stops it being tricked into sending data to arbitrary addresses.
3. No. You get HTTP 200 with an error object in the tool result block; check for it.
