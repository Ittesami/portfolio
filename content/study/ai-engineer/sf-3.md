AI features move data to a third-party API, store prompts and outputs in logs, and sometimes hold API keys inside agents. Handle all three deliberately.

## Secrets

You covered API keys in the API module. The extra rules for AI systems:

- **Never put secrets in prompts.** Anything in the context can end up in an output, a log, or a prompt-injection exfiltration. If a tool needs a credential, the **tool's code** holds it, not the model.
- **Agents get their own credentials** with the least access needed (a read-only database user, a scoped GitHub token).
- **Hosted agents** (Managed Agents) can use **vaults**: secrets stored by Anthropic and injected only when the agent's requests leave the sandbox, so the agent's environment holds just a placeholder.
- **Rotate** keys regularly and on any suspicion of a leak.

## Privacy: what you send

Before sending user data to a model, ask:

1. **Do I need to send it?** Send the minimum: the question and the relevant records, not the whole profile.
2. **Can I remove identifiers?** Replace names, emails, phone numbers with placeholders when the task doesn't need them.
3. **Has the user agreed?** Your privacy policy should say data is processed by an AI provider.
4. **Special categories** (health, religion, finances, children's data) deserve extra care and may have legal requirements (GDPR in the UK/EU).

Your Daily app holds prayers, workouts and health data. Only send what a feature needs, and only for you.

## Data retention: what providers keep

Read the provider's data policies, and know the options:

- Anthropic's commercial API terms say API inputs and outputs aren't used to train models by default.
- API data is retained for a limited period for safety and abuse monitoring; check the current policy for the exact period.
- **Zero data retention (ZDR)** arrangements exist for eligible organisations; some newer features aren't ZDR-eligible (the docs mark which).
- Stored things (Files API uploads, batch results, hosted agent sessions) persist **until you delete them**. Clean up.

Facts here change, so check the current privacy and retention pages before making promises to users.

## Your own logs

Your logs are often a bigger privacy risk than the provider:

- **Log metadata by default** (model, tokens, latency, cost, status); log full prompts and outputs only where needed, e.g. for evals.
- **Redact** personal data before storing.
- **Set a retention period** and delete old logs automatically (a MongoDB TTL index does this).
- **Restrict access** to logs as tightly as the original data.

```js
// delete AI request logs after 30 days
await db.collection("aiLogs").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
```

## Where inference runs

Some customers require processing in a particular region. The API offers controls for where inference runs (e.g. an `inference_geo` option on supported models), and cloud platforms (Bedrock, Vertex AI, Foundry) let you pick regions. Check availability per model.

## A checklist for each AI feature

- [ ] What personal data does it send? Is all of it necessary?
- [ ] Are secrets kept out of prompts and held only by tool code?
- [ ] What do we log, for how long, and who can read it?
- [ ] Are uploaded files and sessions deleted when no longer needed?
- [ ] Does the privacy policy cover it?

## Check yourself

1. A tool needs a database password. Where should the password live?
2. What should you log by default for each model call?
3. How do you make MongoDB delete logs after 30 days?

### Answers

1. In the tool's server-side code/environment (or a vault for hosted agents), never in the prompt.
2. Metadata: model, token counts, cost, latency, stop reason, request id, status; not full content unless needed.
3. A TTL index on the timestamp field with `expireAfterSeconds` set to 30 days.
