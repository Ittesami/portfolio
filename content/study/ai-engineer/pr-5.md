You've built the pieces; now ship them. This lesson covers deploying AI features in **Next.js on Vercel** (what your portfolio uses) and the **AWS** equivalent.

## The architecture

```
Browser (React)
   │  fetch("/api/chat", stream)
   ▼
Next.js route handler on Vercel (Node.js, Fluid compute)
   ├── auth + rate limit + input validation
   ├── retrieval (MongoDB Atlas vector search)
   ├── Claude API (streaming) ── tools ── your data
   └── log usage, cost, latency
   │  streamed text
   ▼
Browser renders tokens as they arrive
```

## Streaming chat route (Next.js App Router)

```js
// app/api/chat/route.js
import Anthropic from "@anthropic-ai/sdk";
import { isAdmin, unauthorised } from "@/lib/auth";

const client = new Anthropic();
export const maxDuration = 60;            // seconds this function may run

export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { messages } = await request.json();
  if (!Array.isArray(messages) || JSON.stringify(messages).length > 50_000) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const stream = client.messages.stream({
    model: "claude-sonnet-5-5",
    max_tokens: 4000,
    system: "You are the assistant inside Daily...",
    messages,
  });
  request.signal.addEventListener("abort", () => stream.abort());   // user closed the tab

  const body = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      stream.on("text", (t) => controller.enqueue(enc.encode(t)));
      try {
        const final = await stream.finalMessage();
        await logUsage("chat", final);                                // your logging
      } catch {
        controller.enqueue(enc.encode("\n\n(Something went wrong. Please try again.)"));
      }
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
```

**Libraries**: the **Vercel AI SDK** (`ai` package) offers React hooks (`useChat`) and stream helpers that do much of this, with an Anthropic provider. Use it if you want less plumbing; the raw version above shows what's happening.

## Vercel specifics

- **Node.js runtime** is the default and supports streaming; you don't need the Edge runtime.
- **Function duration**: set `maxDuration` for longer AI calls. Very long agent work belongs in a background job (a queue/workflow) or Managed Agents, not a single request.
- **Environment variables**: `ANTHROPIC_API_KEY` in Project Settings (Production and Preview separately).
- **Preview deployments** let you test AI changes on a real URL before production.
- **AI Gateway** (optional): one endpoint for many providers, with spend tracking, fallbacks and observability.

## On AWS

| Piece | AWS option |
|---|---|
| Hosting the Next.js app | Amplify Hosting, or containers on App Runner / ECS |
| API route alternative | Lambda (with response streaming) behind API Gateway or a function URL |
| Claude access | Anthropic API directly, or **Amazon Bedrock** (Claude via your AWS account, IAM auth, AWS billing) |
| Secrets | Secrets Manager / SSM Parameter Store |
| Long jobs | SQS + Lambda, Step Functions |
| Vector search | Your existing Atlas, or OpenSearch / Aurora with pgvector |

**Bedrock** is attractive when a company already runs on AWS: no separate vendor account, data stays in their AWS setup, IAM permissions. Use the SDK's Bedrock client; model ids differ slightly, and feature availability can lag the direct API.

## Production checklist

- [ ] API key only on the server; per-environment keys
- [ ] Auth on every AI route; per-user rate limits
- [ ] Input size limits and output validation
- [ ] Streaming with abort handling
- [ ] Timeouts and friendly error messages
- [ ] Prompt caching for stable prefixes
- [ ] Usage/cost logging and a spend alert
- [ ] Eval suite run before deploying prompt/model changes
- [ ] Prompt versions in code, reviewed like code

## Check yourself

1. Do you need the Edge runtime to stream on Vercel?
2. A task takes 10 minutes. Should it run in a route handler?
3. Why might a company choose Bedrock over the direct Anthropic API?

### Answers

1. No. The default Node.js runtime streams fine.
2. No. Use a background job (queue, workflow) or a hosted agent, and notify the user when it's done.
3. They're already on AWS: IAM-based access, AWS billing and procurement, data and governance within their AWS environment.
