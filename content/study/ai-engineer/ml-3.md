**Hugging Face** is the hub for open models and datasets. You can download and run models yourself, which is useful for embeddings, small classifiers, private data, and learning how models work inside.

## What's on the Hub

| Thing | Examples |
|---|---|
| **Models** | Open LLMs, embedding models, rerankers, image and speech models |
| **Datasets** | Text classification sets, Q&A sets, code, instruction data |
| **Spaces** | Hosted demos (Gradio/Streamlit apps) |

Each model has a **model card**: what it's for, how it was trained, its licence and limitations. **Read the licence**: some open models restrict commercial use.

## Running a model with transformers

```python
# pip install transformers torch
from transformers import pipeline

classify = pipeline("sentiment-analysis")                 # downloads a small default model
print(classify("The new gym routine is brilliant but the 6am starts are brutal."))

zero_shot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print(zero_shot("I was charged twice this month", candidate_labels=["billing", "technical", "account"]))
```

`pipeline` handles tokenisation, the model and post-processing. Models download once and are cached locally.

## Embeddings with sentence-transformers

For RAG, an open embedding model means no per-call cost and your text never leaves your machine:

```python
# pip install sentence-transformers
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")   # small, fast, 384 dimensions
docs = ["CloudTrail records API calls for auditing.",
        "CloudWatch collects metrics and logs.",
        "A heap gives O(log n) push and pop."]
doc_vecs = model.encode(docs, normalize_embeddings=True)
q = model.encode("Which service audits who did what in my account?", normalize_embeddings=True)
print(util.cos_sim(q, doc_vecs))      # highest score for the CloudTrail sentence
```

Small models like this are a good learning tool; larger open embedding models compete with hosted ones. The **MTEB leaderboard** on Hugging Face compares embedding models on many tasks.

## Looking inside a model

```python
from transformers import AutoTokenizer, AutoModel
tok = AutoTokenizer.from_pretrained("bert-base-uncased")
print(tok.tokenize("Tokenization is surprisingly useful"))   # see the subword pieces
model = AutoModel.from_pretrained("bert-base-uncased", output_attentions=True)
# outputs.attentions holds attention weights for every layer and head
```

Seeing real tokens and attention maps makes the Foundations lesson concrete.

## Open vs hosted models

| | Open models (self-run) | Hosted frontier models (Claude) |
|---|---|---|
| Capability | Good for focused tasks; behind the frontier on hard reasoning | State of the art |
| Cost | Hardware/hosting; no per-token fee | Per token |
| Privacy | Data stays on your machines | Sent to the provider (under their terms) |
| Ops | You run GPUs, scaling, updates | None |
| Customisation | Full fine-tuning possible | Prompting, tools, RAG |

A common split: **open models for embeddings, reranking and small classifiers**; **frontier models for reasoning, writing, coding and agents**.

## Running bigger models locally

Tools like **Ollama** and **llama.cpp** run quantised open LLMs on a laptop. Quantisation stores weights in fewer bits (e.g. 4-bit) to cut memory, with some quality loss. Fun to experiment with; for production quality, compare against hosted models with your evals.

## Check yourself

1. What should you check on a model card before using a model in a product?
2. Why might you choose an open embedding model for your notes RAG?
3. What is quantisation?

### Answers

1. Its intended use, licence (commercial use allowed?), training data and known limitations.
2. No per-call cost, and private notes never leave your machine; quality can be good enough for personal search.
3. Storing model weights with fewer bits (e.g. 4-bit instead of 16-bit) to reduce memory and speed up inference, at some cost to accuracy.
