The **Model Context Protocol (MCP)** is an open standard for connecting AI applications to tools and data. Write an integration once as an **MCP server**, and any MCP-capable app (Claude Code, Claude Desktop, claude.ai, your own agent, many IDEs) can use it.

## The problem it solves

Without MCP, every app needs its own integration for every service:

```
3 apps × 4 services = 12 custom integrations

With MCP:  apps speak MCP ─┬─ GitHub server
                          ├─ Postgres server
                          ├─ Google Drive server
                          └─ your own server
3 + 4 = 7 pieces, and every new server works everywhere
```

It's often compared to **USB-C for AI**: one standard plug.

## The three roles

| Role | What it is | Example |
|---|---|---|
| **Host** | The AI app the user works in | Claude Code, Claude Desktop |
| **Client** | The connector inside the host, one per server | Built into the host |
| **Server** | A program exposing capabilities | A GitHub server, your Daily server |

## What a server can offer

| Primitive | Controlled by | What it is | Example |
|---|---|---|---|
| **Tools** | The model | Functions the model can call | `create_issue`, `get_todos` |
| **Resources** | The app/user | Data the app can read into context | A file, a database row, `daily://todos/today` |
| **Prompts** | The user | Reusable prompt templates, often slash commands | `/weekly-review` |

Tools are by far the most used. Clients can also offer servers things, e.g. **sampling** (a server asks the host's model to generate text) and **elicitation** (a server asks the user for input).

## How it talks

MCP uses **JSON-RPC 2.0** messages over a **transport**:

| Transport | How | Use for |
|---|---|---|
| **stdio** | The host starts the server as a local process and talks over stdin/stdout | Local tools on your machine |
| **Streamable HTTP** | The server runs as a web service; the client sends HTTP requests (with optional streaming) | Remote/shared servers, hosted integrations |

A session goes:

```
client ── initialize (versions, capabilities) ──► server
client ── tools/list ──► server   → [{name, description, inputSchema}, ...]
          (the host gives these tools to the model)
model wants a tool → client ── tools/call {name, arguments} ──► server → result
```

From the model's point of view, MCP tools are just tools; the host translates between MCP and the model's tool-use format.

## Security model

An MCP server runs with whatever access you give it, so:

- **Only install servers you trust**; a malicious server can do anything its process can.
- Servers' **tool descriptions and results** go into the model's context and can carry prompt injection.
- Hosts ask for **approval** before tool calls; keep that on for anything with side effects.
- Remote servers should use **OAuth** for authentication, not shared secrets in URLs.

## Where MCP fits

| Need | Use |
|---|---|
| Tools for one app you're building | Plain tool use in your code is simpler |
| Tools you want in Claude Code, Desktop **and** your app | An MCP server |
| Using existing integrations (GitHub, Slack, databases) | Install an existing MCP server |

Docs and the specification: [modelcontextprotocol.io](https://modelcontextprotocol.io).

## Check yourself

1. What are the three things an MCP server can expose, and who controls each?
2. Which transport would you use for a server that only runs on your laptop?
3. Why should you be careful installing a random MCP server?

### Answers

1. Tools (the model), resources (the application), prompts (the user).
2. stdio.
3. It runs code with your permissions and its tool descriptions/results go into the model's context, so it could steal data or inject instructions.
