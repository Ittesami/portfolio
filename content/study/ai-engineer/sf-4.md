When an AI feature misbehaves in production, you need to see **what it saw, what it did, and why**. That's **observability**: structured logs, traces and metrics.

## Why AI needs more than normal logging

A traditional bug has a stack trace. An AI "bug" is often a correct HTTP 200 with a bad answer, caused by:

- the wrong chunks retrieved,
- a tool returning something odd,
- a prompt change two days ago,
- a model upgrade,
- one user's unusual input.

To debug, you need the **whole chain** for that request.

## What to record per model call

| Field | Why |
|---|---|
| Request id, timestamp, route/feature, user (or hashed id) | Find it later |
| Model, effort, prompt version | Explain behaviour changes |
| Input, output, cache tokens; cost | Spend tracking |
| Latency (time to first token, total) | Performance |
| `stop_reason`, errors, retries | Failures |
| Tool calls (name, input, result size, duration) | Agent debugging |
| Retrieved chunk ids and scores (RAG) | Retrieval debugging |
| Full prompt and output (sampled, redacted) | Reproduce and build evals |

Give every prompt a **version** (`meal-parser@v3`) and log it; that's how you connect a quality drop to a change.

## Traces and spans

A **trace** is one user request end to end; **spans** are its steps:

```
trace: POST /api/assistant  (2.8 s)
├── span: retrieve notes            (180 ms, 8 chunks)
├── span: claude messages.create    (1.6 s, 4,210 in / 312 out, tool_use)
│   └── span: tool get_todos        (40 ms)
└── span: claude messages.create    (0.9 s, 4,600 in / 140 out, end_turn)
```

You see instantly where the time and tokens went.

## OpenTelemetry

**OpenTelemetry (OTel)** is the open standard for traces, metrics and logs. Instrument once, send to any backend (Grafana, Honeycomb, Datadog, Langfuse, Vercel's tracing...).

- On Vercel/Next.js, `@vercel/otel` sets up OTel with a few lines in `instrumentation.ts`.
- The Anthropic SDKs can emit spans for API calls, with token counts and model as attributes (see the SDK's OpenTelemetry docs).
- Add your own spans around retrieval and tools:

```ts
import { trace } from "@opentelemetry/api";
const tracer = trace.getTracer("daily-assistant");

async function retrieve(query: string) {
  return tracer.startActiveSpan("retrieve_notes", async (span) => {
    try {
      const chunks = await search(query);
      span.setAttribute("rag.chunks", chunks.length);
      return chunks;
    } finally {
      span.end();
    }
  });
}
```

You don't need OTel on day one: a structured JSON log line per call in MongoDB is a fine start. Move to OTel when you have several services or need proper dashboards.

## Metrics and alerts

Watch these over time:

- **Cost per day / per feature**: alert on sudden jumps (often a loop bug).
- **Error and refusal rate**.
- **Latency** (median and 95th percentile).
- **Quality signals**: thumbs up/down, eval scores on a sampled slice of live traffic.

## From logs to evals

The best eval cases come from production. Make it easy to **flag** a bad interaction (a thumbs-down button) and copy it, with its full context, into your eval set.

## Managed Agents

Hosted agents have a **session viewer** in the Console showing every event, tool call and result, with no setup.

## Check yourself

1. What's a trace, and what's a span?
2. Why log the prompt version with every call?
3. What metric would catch an agent stuck in a loop?

### Answers

1. A trace is one request end to end; spans are the timed steps inside it (retrieval, each model call, each tool).
2. To link quality or cost changes to the prompt change that caused them.
3. Cost (or tokens/tool calls) per request or per day, with an alert on sudden spikes.
