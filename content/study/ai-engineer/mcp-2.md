Building an MCP server is like writing tool handlers, wrapped in the official SDK so any MCP host can use them.

## Set up

```bash
mkdir study-mcp && cd study-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript tsx @types/node
```

Set `"type": "module"` in `package.json`.

## A minimal server (stdio)

```ts
// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "study", version: "1.0.0" });

server.registerTool(
  "get_next_lesson",
  {
    title: "Next lesson",
    description: "Get the next unfinished lesson in a study course. Use when the user asks what to study next.",
    inputSchema: { course: z.enum(["dsa", "aws-clf", "ai-engineer"]).describe("Course slug") },
  },
  async ({ course }) => {
    const next = await findNextLesson(course);        // your code: query MongoDB, call your API...
    return { content: [{ type: "text", text: JSON.stringify(next) }] };
  },
);

server.registerResource(
  "courses",
  "study://courses",
  { title: "Courses", description: "All study courses with progress", mimeType: "application/json" },
  async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(await listCourses()) }] }),
);

await server.connect(new StdioServerTransport());
```

Key points:

- `inputSchema` is a map of **Zod** fields; the SDK turns it into JSON Schema and validates arguments.
- Tool results are `{ content: [...] }` with text (or image) items. Return `isError: true` for failures the model should see.
- **Never `console.log` in a stdio server**: stdout *is* the protocol channel. Log to `console.error` (stderr).

(The SDK API changes between versions; older examples use `server.tool(...)`. Check the SDK's README for the version you install.)

## Test it with the Inspector

The **MCP Inspector** is a web UI that connects to your server so you can list and call tools by hand:

```bash
npx @modelcontextprotocol/inspector npx tsx src/server.ts
```

Always test here before connecting it to a host; it shows the exact messages.

## Use it from Claude Code

```bash
claude mcp add study -- npx tsx /full/path/to/study-mcp/src/server.ts
```

Then in Claude Code, ask "What should I study next in the AI course?" and approve the tool call. `claude mcp list` shows connected servers. Environment variables (e.g. `MONGODB_URI`) can be passed with `-e`.

## Remote servers (Streamable HTTP)

To share a server or use it from claude.ai or the API, run it over HTTP instead of stdio. The SDK provides a Streamable HTTP transport you mount in an HTTP server (Express, a Next.js route). A remote server must handle **authentication** (OAuth is the standard for MCP) and should be stateless or manage sessions properly.

## Designing a good server

- **Tools for tasks, not tables**: `get_week_summary` beats exposing raw `find` on every collection.
- **Descriptions are prompts**: say when to use the tool and what comes back.
- **Return concise, readable results**, with ids the model can use in follow-up calls.
- **Read-only by default**; add write tools deliberately, with validation.
- **Helpful errors**: "Unknown course 'aws'. Valid: dsa, aws-clf, ai-engineer."

## Check yourself

1. Why can't you use `console.log` in a stdio MCP server?
2. What tool do you use to test a server before connecting it to Claude?
3. What do you need to add when moving a server from stdio to HTTP?

### Answers

1. stdout carries the JSON-RPC protocol messages; extra output corrupts them. Log to stderr.
2. The MCP Inspector.
3. An HTTP transport (Streamable HTTP) and authentication (normally OAuth), since it's reachable over the network.
