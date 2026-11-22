Production AI systems need **guardrails** (checks around the model) and a plan for when things go wrong: refusals, bad outputs, outages.

## Guardrails: checks before and after

```
user input ──► input checks ──► model ──► output checks ──► user / action
```

**Input checks**

- **Size limits**: cap message length and attachment size.
- **Rate limits per user**: protect your budget and the service.
- **Scope classification**: a cheap Haiku call ("Is this about the user's studies? yes/no") to redirect off-topic requests, if your app has a narrow purpose.
- **Personal data**: detect and strip what you don't need to send.

**Output checks**

- **Schema validation** (structured outputs make this nearly free).
- **Business rules in code**: amounts in range, dates in the future, ids that exist.
- **Content checks**: banned phrases, competitor names, links to unexpected domains.
- **Grounding check** for RAG: does the answer cite sources? A judge call can verify claims against them for high-stakes answers.

Code checks are cheap and deterministic, so use them wherever possible; model-based checks add cost and latency, so use them where needed.

## Refusals

A model may decline (`stop_reason: "refusal"`). Handle it explicitly:

```ts
if (response.stop_reason === "refusal") {
  log("refusal", { category: response.stop_details?.category, requestId: response.id });
  return "Sorry, I can't help with that one. Try rephrasing, or ask something else.";
}
```

- Don't retry the identical request in a loop.
- **False refusals** on harmless requests happen (security, medicine, chemistry topics). Reduce them with context in the system prompt explaining the legitimate use ("This is a tool for a cybersecurity course..."), and with **server-side fallbacks** on models that support them (`fallbacks: "default"` reruns the request on a fallback model in the same call).
- Log refusal categories to spot patterns.

## Fallbacks for failures

| Failure | Fallback |
|---|---|
| 429 / 529 / 5xx after SDK retries | Queue and retry later; or switch to another model; or a friendly "busy, try again" |
| Timeout | Shorter request, smaller model, or async job with notification |
| Invalid output | Retry once with the error message in the prompt; then fail gracefully |
| Model refuses | Fallback model, or polite message |
| Feature unavailable | Degrade: show search results without an AI summary |

**Graceful degradation**: the app should still work, in reduced form, when the AI part doesn't. Your Daily food log should still save the text even if the AI estimate fails.

## Timeouts and budgets

- Set **per-route timeouts** (a chat reply: 30–60 s; a background job: minutes).
- For agents: **max steps**, a **token or dollar budget**, and a **wall-clock limit**. Stop and report rather than loop forever.
- Task budgets (beta, on recent models) let you tell the model its token budget so it paces itself and finishes cleanly.

## Defensive prompting

- Give the model **permission to say "I don't know"** or "I can't do that".
- Define what to do with **out-of-scope** requests.
- Ask for **uncertainty**: a confidence field, or "flag anything you're unsure about".

## Check yourself

1. Name two input checks and two output checks.
2. What should your app do when the model refuses?
3. What does graceful degradation mean for an AI feature?

### Answers

1. Input: size limit, per-user rate limit, scope classification, PII stripping. Output: schema validation, business-rule checks, content checks, grounding checks.
2. Log it (with category), show a polite message, not retry blindly; consider fallbacks or adding legitimate context if refusals are false positives.
3. The rest of the app keeps working when the AI fails; the user gets a reduced but functional experience instead of an error.
