AI engineering interviews increasingly include an **LLM system design** round: "Design a support assistant for an online shop" or "Design a system that answers questions over 10 million documents". This is how to approach them and what to practise.

## A framework for any question

1. **Clarify** (5 min): users, scale (requests per day), latency needs, data (size, how often it changes, sensitivity), accuracy needs, budget.
2. **Simplest version first**: one model call with a good prompt. Would it work? Why not?
3. **Architecture**: draw it. Where data comes from, retrieval, model calls, tools, storage.
4. **Deep dive** on the hardest part (usually retrieval, agent reliability or cost).
5. **Evaluation**: how you'd know it works, offline and in production.
6. **Production concerns**: cost, latency, safety, privacy, monitoring, failure modes.
7. **Trade-offs and next steps**.

## Topics to be ready for

| Topic | Be able to explain |
|---|---|
| Model choice | Capability vs cost vs latency; routing; when to use small models |
| RAG | Chunking, embeddings, hybrid search, reranking, contextual retrieval, freshness, access control |
| Long context vs RAG | When each wins; cost with and without caching |
| Agents | When to use one, tool design, loops and budgets, multi-agent trade-offs |
| Evals | Building datasets, code vs LLM graders, judge calibration, regression testing |
| Cost | Token maths, caching, batching, effort, model cascades |
| Latency | Streaming, TTFT, parallel calls, smaller models |
| Safety | Prompt injection, the lethal trifecta, least privilege, confirmations |
| Privacy | Data minimisation, retention, PII handling |
| Prompting vs RAG vs fine-tuning | The decision guide (ML lesson 4) |

## Practice questions

1. Design a customer-support assistant for an e-commerce site with 50,000 orders a day.
2. Design "chat with your documents" for a law firm (confidential, citations essential).
3. Design a system to classify 5 million product reviews per day by topic and sentiment.
4. Design a coding agent that fixes failing CI builds automatically.
5. Design a meeting assistant that transcribes, summarises and creates action items.
6. Your RAG chatbot gives wrong answers 15% of the time. How do you find and fix the cause?
7. Your LLM bill tripled last month. Walk through how you'd investigate and cut it.
8. How would you evaluate a summarisation feature with no reference summaries?

For each, practise **out loud** for 30–40 minutes, then compare with your notes from this course. Mock interviews with a friend (or with Claude playing a strict interviewer) help a lot.

## Worked sketch: question 3

- **Clarify**: 5M/day, results needed next day → not latency-sensitive. Fixed label set.
- **Simplest**: Haiku 5.5 with structured outputs (enum labels) via **Batches** (50% off) with a **cached** system prompt and examples.
- **Cost**: ~300 input + 30 output tokens each → 1.5B input + 150M output tokens/day. On Haiku 5.5 ($0.10 / $0.50 per M) with the 50% batch discount: (1.5B × $0.10 + 150M × $0.50) ÷ 2 ≈ **$110 a day**, less with caching on the shared prefix. The same on Opus 5.5 would be about $4,500 a day.
- **Better at scale**: label 50K with Haiku, check a sample by hand, then **train a small classifier** (distillation) for near-zero marginal cost; use the LLM only for low-confidence cases.
- **Eval**: 1,000 hand-labelled reviews; per-class precision/recall; weekly drift checks.

## Done when

- [ ] You've answered all 8 practice questions out loud, timed
- [ ] You have a one-page cheat sheet of key numbers (prices, token rules of thumb, caching/batch discounts)
- [ ] You can explain both capstones' architecture and trade-offs in 5 minutes each
