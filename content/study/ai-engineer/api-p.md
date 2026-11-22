## What you're building

A terminal chat app that streams Claude's replies and prints what each reply cost.

```
you › Explain attention in two sentences.
claude › Attention lets each token look at every other token and decide how much...
         [haiku-5-5 · 18 in / 61 out · $0.0000323 · total $0.0001]
you › /model opus
switched to claude-opus-5-5
you › /quit
```

It practises everything in this module: requests, system prompts, history, streaming, model choice, effort, errors and usage.

## Steps

1. **Read a line** from the terminal in a loop (Node's `readline/promises`).
2. **Keep history** as `Anthropic.MessageParam[]`; push the user's turn, then the assistant's full `content` after each reply.
3. **Stream** with `client.messages.stream(...)`, printing `text` deltas, then `await stream.finalMessage()`.
4. **Cost line** after each reply using the `costUSD` helper from the last lesson, plus a running total.
5. **Commands:**
   - `/model haiku|sonnet|opus` switches model
   - `/effort low|medium|high` sets `output_config.effort`
   - `/system <text>` replaces the system prompt
   - `/clear` empties the history
   - `/quit` exits and prints the session total
6. **Errors:** catch `Anthropic.RateLimitError` and `Anthropic.APIError`, print a friendly line, and keep the loop running. Remove the user's last turn from history if the call failed.
7. **Stop reasons:** if `stop_reason` is `max_tokens`, print a note that the reply was cut off.

A skeleton to start from:

```ts
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "node:readline/promises";

const client = new Anthropic();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const history: Anthropic.MessageParam[] = [];
let model = "claude-haiku-5-5";
let total = 0;

for (;;) {
  const line = (await rl.question("you › ")).trim();
  if (line === "/quit") break;
  // TODO: other commands
  history.push({ role: "user", content: line });
  try {
    process.stdout.write("claude › ");
    const stream = client.messages.stream({ model, max_tokens: 4000, messages: history });
    stream.on("text", (t) => process.stdout.write(t));
    const msg = await stream.finalMessage();
    history.push({ role: "assistant", content: msg.content });
    // TODO: cost line, stop_reason check
  } catch (err) {
    history.pop();
    console.error("\n(error)", err instanceof Anthropic.APIError ? err.status : err);
  }
}
rl.close();
```

## Done when

- [ ] Replies stream word by word
- [ ] The model remembers earlier turns
- [ ] Each reply shows tokens and cost; `/quit` shows the session total
- [ ] `/model` and `/effort` work
- [ ] Unplugging the network (or a bad model name) prints an error without crashing
- [ ] The API key is only in `.env.local`

## Stretch goals

- Save and load conversations to a JSON file (`/save`, `/load`).
- Show summarised thinking in grey when `/think on` is set (`thinking: { type: "adaptive", display: "summarized" }`).
- Warn when the conversation passes 100K input tokens, using `countTokens`.
- Compare the same question across Haiku, Sonnet and Opus side by side, with cost and time for each.
