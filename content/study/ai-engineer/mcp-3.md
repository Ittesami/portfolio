You can use MCP servers in two main places: **Claude Code** (local, interactive) and **the Claude API** (your own apps, via the MCP connector).

## In Claude Code

Add servers with the CLI:

```bash
# Local server started as a process (stdio)
claude mcp add study -- npx tsx ./study-mcp/src/server.ts

# Remote server over HTTP
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

claude mcp list          # what's connected
claude mcp remove study
```

**Scopes** decide who gets the server:

| Scope | Stored in | Who gets it |
|---|---|---|
| local (default) | Your user settings, for this project | Just you, this project |
| project | `.mcp.json` in the repo | Everyone who clones the repo |
| user | Your user settings | You, in every project |

A project-scoped `.mcp.json` is a nice way to share a team's tools; never put secrets in it (use environment variables).

Inside a session, `/mcp` shows server status and handles OAuth logins for remote servers. Claude asks permission before calling tools; you can allow trusted ones permanently.

## In the Claude API: the MCP connector

The **MCP connector** lets a Messages API request connect directly to a **remote** MCP server. Anthropic's side calls the server's tools for you, so you don't write a tool loop or an MCP client.

```ts
const response = await client.beta.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  betas: ["mcp-client-2025-11-20"],
  mcp_servers: [
    {
      type: "url",
      url: "https://daily.example.com/mcp",
      name: "daily",
      authorization_token: process.env.DAILY_MCP_TOKEN,   // if the server needs auth
    },
  ],
  tools: [{ type: "mcp_toolset", mcp_server_name: "daily" }],   // BOTH halves are required
  messages: [{ role: "user", content: "What's on my to-do list today?" }],
});
```

You need **both** `mcp_servers` (where the server is) **and** a matching `mcp_toolset` entry in `tools` (which tools to enable; you can allow or block individual ones). Only remote servers work here (the API can't start a process on your laptop).

The response includes `mcp_tool_use` and `mcp_tool_result` blocks so you can show what happened.

## Other ways

- **Managed Agents** can attach MCP servers to a hosted agent (Production module).
- The **Claude Agent SDK** accepts MCP server configs, including servers defined in-process in your code.
- **claude.ai and Claude Desktop** let users add remote servers as **connectors**.
- You can also write your own MCP **client** with the MCP SDK and translate tools into Messages API tools yourself; only do that when you need full control.

## Choosing

| You want | Use |
|---|---|
| Your tools while coding | Claude Code + local stdio server |
| An app that uses a hosted MCP server | API MCP connector |
| A hosted agent with integrations | Managed Agents + MCP |
| Tools that only your app uses | Plain tool use, no MCP needed |

## Check yourself

1. What two parts does an MCP connector request need?
2. Can the API's MCP connector use a stdio server on your laptop?
3. Which Claude Code scope shares a server with everyone who clones the repo?

### Answers

1. An entry in `mcp_servers` (url, name) and an `mcp_toolset` tool with the same server name (plus the beta header).
2. No. It only connects to remote servers reachable by URL.
3. The project scope (`.mcp.json` in the repo).
