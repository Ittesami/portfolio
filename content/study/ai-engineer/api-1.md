An **API key** is a password that lets code spend money on your account. Treat it like one.

## How authentication works

Every request carries your key in a header (`x-api-key`). The SDK adds it for you, reading the `ANTHROPIC_API_KEY` environment variable:

```ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();   // no key in the code: it comes from the environment
```

## Where keys live

| Place | OK? | Why |
|---|---|---|
| `.env.local` on your machine (git-ignored) | ✅ | Never leaves your laptop |
| Vercel / AWS environment variables | ✅ | Encrypted, injected at runtime on the server |
| Hard-coded in source | ❌ | Ends up in git history forever |
| Client component / browser JS | ❌ | Anyone can open DevTools and copy it |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | ❌ | `NEXT_PUBLIC_` variables are **shipped to the browser** |

## The server-side pattern

```
Browser ──fetch("/api/chat")──► Your route handler ──SDK + key──► Anthropic
          (no key)               (key from env)
```

Your route handler is also where you add things the browser can't be trusted with: **login checks**, **rate limits per user**, **input size limits**, logging.

```js
// app/api/chat/route.js
import Anthropic from "@anthropic-ai/sdk";
import { isAdmin, unauthorised } from "@/lib/auth";

const client = new Anthropic();

export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();          // only you can spend your money
  const { message } = await request.json();
  if (typeof message !== "string" || message.length > 4000) {
    return Response.json({ error: "Message too long." }, { status: 400 });
  }
  // ... call client.messages.create
}
```

A public endpoint with no limits is a free AI service for anyone who finds it.

## On Vercel

```bash
vercel env add ANTHROPIC_API_KEY production
```

Or **Project → Settings → Environment Variables** in the dashboard. Redeploy afterwards so the new value is picked up.

## Good habits

- **One key per place** (laptop, Vercel production, CI). If one leaks, you delete just that one.
- **Workspaces** in the Console let you separate projects, each with its own keys and spend limit.
- **Spend limits** cap the worst case.
- If a key is exposed: **delete it first**, then investigate. Rotating takes a minute; abuse can cost hundreds.
- Secret scanners (GitHub push protection) catch many leaks; don't rely on them.

## Other ways to authenticate

You'll mostly use API keys, but know these exist:

- **`ant auth login`** (the Anthropic CLI) stores a login profile the SDKs pick up on your own machine, so you don't even need a key in `.env` while developing.
- **Cloud platforms** (Amazon Bedrock, Google Vertex AI, Microsoft Foundry) offer Claude using their own credentials (AWS IAM, Google ADC), with platform-specific clients.
- **Workload identity federation** lets servers swap a cloud identity token for short-lived credentials, so no long-lived key exists at all.

## Check yourself

1. Why is `NEXT_PUBLIC_ANTHROPIC_API_KEY` dangerous?
2. You accidentally pushed a key to a public repo and deleted the commit. Are you safe?
3. Name two checks your route handler should do before calling the model.

### Answers

1. Next.js inlines `NEXT_PUBLIC_` variables into the JavaScript sent to browsers, so the key becomes public.
2. No. It's still in git history and may already have been scraped; delete the key in the Console and create a new one.
3. Authentication (is this user allowed?), input validation/size limits, and per-user rate limiting.
