The **Claude Agent SDK** is the engine of **Claude Code**, packaged as a library. Instead of writing an agent loop and tools from scratch, you get a battle-tested harness with file, shell and search tools, context management, permissions, hooks, sub-agents and sessions, and drive it from your own code.

## What you get

| Built in | Examples |
|---|---|
| **Tools** | Read, Write, Edit files; Bash; Glob and Grep search; WebSearch and WebFetch |
| **Agent loop** | Plans, calls tools, reads results, keeps going until done |
| **Context management** | Automatic compaction for long runs |
| **Permissions** | Choose which tools are allowed; ask before risky ones |
| **Hooks** | Run your code before/after tool calls (block, log, modify) |
| **Sub-agents** | Delegate focused tasks to separate agents |
| **MCP** | Plug in MCP servers for extra tools |
| **Sessions** | Resume a conversation later |

## A minimal agent

```ts
// npm install @anthropic-ai/claude-agent-sdk
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find any TODO comments in src/ and list them with file and line.",
  options: {
    allowedTools: ["Read", "Grep", "Glob"],     // read-only: it can't change anything
    cwd: "/path/to/project",
  },
})) {
  if (message.type === "result") console.log(message.result);
}
```

`query` streams messages as the agent works (its thoughts, tool calls, results) and ends with a **result** message.

Python is the same idea:

```python
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Find TODO comments in src/ and list them.",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Grep", "Glob"]),
):
    print(message)
```

(Option names differ slightly between the TypeScript and Python packages; follow the SDK docs for the exact fields.)

## Configuring behaviour

- **System prompt**: give it a role and rules for your task.
- **Allowed / disallowed tools**: the main safety lever. A code-review agent needs Read and Grep, not Write or Bash.
- **Permission mode**: how it handles actions that need approval (ask, auto-accept edits, deny).
- **MCP servers**: add your own tools (e.g. the Daily MCP server).
- **Sub-agents**: define specialists ("test-runner", "security-reviewer") it can delegate to.
- **Hooks**: e.g. block any Bash command containing `rm -rf`, or log every file edit.

## Where it fits

| | Messages API + Tool Runner | Agent SDK | Managed Agents |
|---|---|---|---|
| Tools | Only yours | Built-in file/shell/web + yours | Hosted sandbox tools + yours |
| Harness | Thin loop | Full Claude Code harness | Hosted by Anthropic |
| Runs on | Your server | Your server/machine | Anthropic's infrastructure |
| Best for | App features with your own tools | Coding and file-based automation you host | Hosted, long-running agents |

Good uses for the Agent SDK:

- CI bots: fix lint errors, update dependencies, write release notes from commits.
- Repo automation: "generate docs for every API route".
- Internal tools that work on files: process a folder of PDFs into a report.
- Your own coding assistant with custom tools and rules.

## Safety

The Agent SDK can run shell commands and edit files with **your process's permissions**. So:

- Start **read-only**; add Write/Edit/Bash deliberately.
- Run it in a **container or VM** for anything automated, not on your main machine with your credentials.
- Use hooks and permission settings to block dangerous commands.
- Don't point it at untrusted content (issues, web pages) with powerful tools enabled (prompt injection).

Docs: [code.claude.com/docs/en/agent-sdk](https://code.claude.com/docs/en/agent-sdk).

## Check yourself

1. How is the Agent SDK different from the Tool Runner?
2. Which tools would you allow for an agent that reviews code but must not change it?
3. Why run automated Agent SDK jobs in a container?

### Answers

1. The Agent SDK is the full Claude Code harness with built-in file, shell and search tools, context management, permissions and sub-agents; the Tool Runner only loops over tools you define.
2. Read, Grep and Glob (no Write, Edit or Bash).
3. It can run commands and edit files with the process's permissions; a container limits the damage from mistakes or prompt injection.
