**Managed Agents** (beta) is Anthropic's hosted agent platform. Anthropic runs the **agent loop** *and* a **sandbox container** where the agent's tools execute. You define the agent once, then start **sessions** whenever you need it to work.

## The core objects

```
Agent (create once, versioned)          Environment            Session (every run)
├── model                                ├── container setup    ├── references an agent (+ version)
├── system prompt                        ├── networking rules   ├── its own container workspace
├── tools (bash, files, web, yours)      └── packages           ├── stream of events
├── MCP servers, skills                                          └── you send messages / tool results
└── settings
```

| Object | What it is |
|---|---|
| **Agent** | A stored, versioned config: model, system prompt, tools, MCP servers, skills |
| **Environment** | The container template: networking (e.g. which hosts it may reach), installed packages |
| **Session** | One run of an agent: its own workspace, conversation and event stream |
| **Vault** | Stored secrets substituted into outgoing requests, so the sandbox never holds the real values |

**Agents are persistent**: create them once (ideally from config files in git, synced with the `ant` CLI) and store their ids. Your app then only creates sessions with the stored agent id. Never create a new agent on every request.

## How a session works

1. Your app creates a session for an agent.
2. It sends a user message (the task).
3. The agent works: thinks, runs bash and file tools in its container, searches the web, calls your MCP servers or custom tools.
4. Your app **streams events** (messages, tool use, results, status) and shows progress.
5. If the agent calls one of **your custom tools**, it pauses; your app runs it and sends the result back.
6. The session goes idle when the task is done; you can send follow-ups.

## Why use it instead of hosting your own

- **No infrastructure**: no servers for the loop, no containers to manage, no state storage.
- **Long-running** work without HTTP timeouts.
- **Sandboxed execution** for bash and code.
- **Versioned agents**: sessions pin to a version, so you can update the agent safely.
- Extras: scheduled runs (deployments on a cron schedule), **outcomes** (a grader iterates the agent's work against your rubric until it passes), multi-agent workflows, memory stores.

Trade-offs:

- It's **beta**, so APIs can change.
- You pay for **session runtime** on top of tokens.
- Session history is stored until you delete it; check data and compliance needs (it isn't available under zero data retention today).
- Available on Anthropic's API (and some partner platforms); not everywhere.

## Example uses

- A **research agent** your app kicks off; the user gets a report when it finishes.
- A **nightly job**: "every morning, check my sites for broken links and summarise".
- A **data analyst** that loads an uploaded CSV in its container, runs Python and returns charts.
- A **support agent** with your MCP tools for orders and refunds.

## Permissions and safety

- **Networking**: limit which hosts the container can reach.
- **Tool permission policies**: always allow, always ask, or let the server evaluate each call automatically.
- **Vault credentials** for API keys, rather than putting secrets in prompts or files.
- Custom tools run in **your** code, so validate their inputs as always.

## Where to start

Read the Managed Agents overview in the docs, then try a **quickstart template** in the Console (e.g. a deep researcher). The `claude-api` docs and SDKs (`client.beta.agents`, `client.beta.sessions`) cover the code.

## Check yourself

1. What's the difference between an agent and a session?
2. Why shouldn't you create a new agent for every request?
3. Name two costs or constraints of Managed Agents.

### Answers

1. The agent is a stored, versioned configuration; a session is one run of it with its own container and conversation.
2. Agents are persistent configs; creating them per request wastes calls, loses versioning and clutters your account. Create once, reuse the id.
3. It's in beta; session runtime is billed on top of tokens; session data is retained until deleted (no zero data retention); not on every platform.
