Set this up once, before the API module. It takes about 30 minutes.

## 1. Create a Claude Console account

Go to [platform.claude.com](https://platform.claude.com) and sign up. The **Console** is where you manage API keys, billing, usage and the **Workbench** (a playground for trying prompts without code).

## 2. Add credit and a spend limit

1. In **Billing**, add a small amount of credit (a few dollars goes a long way with Haiku).
2. In **Limits**, set a **monthly spend limit**. If a bug loops forever, this caps the damage.

## 3. Create an API key

1. **API keys → Create key**. Name it after where it's used, e.g. `laptop-learning`.
2. Copy it once; the Console won't show it again.
3. Store it in an environment file, **never in code**:

```
# .env.local  (already in .gitignore in a Next.js project)
ANTHROPIC_API_KEY=sk-ant-...
```

The SDKs read `ANTHROPIC_API_KEY` automatically, so your code never mentions the key.

**If a key ever leaks** (pushed to GitHub, pasted in a chat): delete it in the Console straight away and make a new one. Leaked keys get found and abused within minutes.

## 4. Make a learning repo

```bash
mkdir ai-engineer && cd ai-engineer
git init
npm init -y
npm install @anthropic-ai/sdk zod
npm install -D typescript tsx @types/node
echo "node_modules\n.env*" > .gitignore
```

- `tsx` runs TypeScript files directly: `npx tsx src/hello.ts`.
- `zod` describes data shapes; you'll use it for tools and structured output.

For Python work later:

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install anthropic
```

One folder per module (`01-api/`, `02-prompting/`…) keeps the projects tidy and becomes a nice GitHub portfolio.

## 5. Try the Workbench

In the Console's **Workbench**, type a prompt, pick a model and run it. Then use **Get code** to see the exact API request. It's the fastest way to test a prompt idea before writing code.

## 6. Install Claude Code (optional, recommended)

Claude Code is a coding agent in your terminal. You'll use it as a tool now, and as a library in the Production module. Follow the install steps at [code.claude.com](https://code.claude.com/docs).

## Done when

- [ ] You can see your spend limit in the Console
- [ ] `ANTHROPIC_API_KEY` is in `.env.local`, and `.env*` is in `.gitignore`
- [ ] The learning repo exists with the SDK installed
- [ ] You've run one prompt in the Workbench
