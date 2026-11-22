When a model doesn't do what you need out of the box, you have three main levers: **prompting**, **RAG** and **fine-tuning**. Choosing the right one (usually in that order) is one of the most common AI engineering decisions, and a classic interview question.

## What each one changes

| Lever | Changes | Analogy |
|---|---|---|
| **Prompting** | The instructions and examples for each request | Briefing an expert well |
| **RAG** | The information available for each request | Handing the expert the right files |
| **Fine-tuning** | The model's weights (behaviour learned from many examples) | Training the expert for months on one job |

## Prompting first

Start here, always. It's instant, cheap to iterate and needs no data pipeline. With today's models, clear instructions, examples, structured outputs and tools solve most problems.

Try more prompting when the model **can** do the task but does it inconsistently or in the wrong style.

## RAG for knowledge

Use RAG when the problem is **missing or changing information**: your company docs, your notes, recent events, anything private.

- Knowledge updates are instant: re-index the document.
- Answers can **cite sources**.
- Access control is possible (retrieve only what this user may see).

Fine-tuning is a poor way to add facts: it's expensive to update, can't cite, and models still hallucinate details they "learned".

## Fine-tuning for behaviour

Fine-tuning can help when you need:

- a **very specific format or style**, consistently, at high volume;
- a **narrow task** done by a **smaller, cheaper, faster** model (distillation: train a small model on a big model's outputs);
- behaviour that's hard to describe but easy to show with thousands of examples.

Costs: you need hundreds to thousands of high-quality examples, a training pipeline, evals, and retraining whenever the base model improves. Frontier models are often not fine-tunable directly by customers (availability depends on the provider and platform); open models are.

## Decision guide

```
Does the model have the knowledge it needs?
├── No → RAG (or tools to fetch it)
└── Yes → Does it behave right with a good prompt + examples?
          ├── Yes → done (prompting)
          └── No → try a stronger model or higher effort
                   ├── fixed → done
                   └── still failing, high volume, lots of examples → consider fine-tuning
```

## They combine

Real systems use several:

- **Prompting + RAG**: the standard pattern for assistants over your data.
- **Fine-tuned small model + RAG**: cheap, fast, domain-specific at scale.
- **Prompting + tools**: agents.

## Also consider

- **Tools** instead of knowledge: a calculator, a database query, an API call give exact, current answers.
- **Long context** instead of RAG when the corpus is small enough (with caching).
- **A classic ML model** for structured prediction (ML lesson 1).

## Interview-style answer

> "I'd start with prompting and evals to see how far the base model gets. If it lacks knowledge, I'd add retrieval so answers are current and citable. Fine-tuning comes last, for narrow, high-volume tasks where I need consistent behaviour or a smaller model, and I have enough good examples to train and evaluate it."

## Check yourself

1. Your assistant doesn't know your company's refund policy. Which lever?
2. Why is fine-tuning a poor way to teach a model facts?
3. You need a cheap model to classify 10 million messages in your house style. What might you do?

### Answers

1. RAG (or put the policy in the prompt if it's short).
2. Facts are costly to update, can't be cited, and the model may still mix them up or hallucinate; retrieval is cheaper, current and verifiable.
3. Label a sample with a strong model (checked with evals), then fine-tune or train a small model on those labels (distillation) and run it at scale, or use a cheap model like Haiku with Batches if quality holds.
