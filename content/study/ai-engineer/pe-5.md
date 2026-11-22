With 1M-token context windows you can paste whole books, codebases or a year of notes into one request. Doing it **well** takes a few techniques.

## Put long documents first, the question last

```
<documents>
  ... 80,000 tokens of reports ...
</documents>

Using the reports above, which quarter had the highest churn, and why?
```

Placing long material **at the top** and your query **at the end** measurably improves answer quality, especially with several documents. It also suits prompt caching: the big, stable part forms the cached prefix and only the question changes.

## Structure multiple documents

```
<documents>
  <document index="1">
    <source>q1-report.pdf</source>
    <document_content>...</document_content>
  </document>
  <document index="2">
    <source>q2-report.pdf</source>
    <document_content>...</document_content>
  </document>
</documents>
```

Metadata (source, date, author) lets the model tell documents apart and cite them.

## Ground answers in quotes

For long documents, ask the model to **find the relevant quotes first**, then answer from them:

```
First, find quotes from the contract relevant to termination and put them in <quotes> tags.
Then answer the question using only those quotes, in <answer> tags.
If no quotes are relevant, say the contract doesn't address it.
```

This cuts through noise and reduces hallucination. The **Citations** feature (Images and PDFs module) does this natively and gives you exact source locations.

## Long context vs RAG

| Approach | When |
|---|---|
| **Put everything in context** | Total size fits comfortably; questions span the whole corpus ("compare all chapters"); simplicity matters |
| **RAG (retrieve the relevant chunks)** | Corpus is far bigger than the window, or changes often; you have many queries and want low cost per query |
| **Both** | Retrieve generously (say 50 chunks), let the long context sort them out |

Remember the costs: a 500K-token prompt costs **$2 per call on Opus 5.5** before caching. With caching, repeat questions on the same documents are about 10× cheaper.

## Practical tips

- **Clean the text**: strip navigation, boilerplate and repeated headers from scraped pages. Noise costs tokens and distracts.
- **Count first** with the token-counting endpoint for big inputs.
- **Be explicit about scope**: "Answer only from these documents, not general knowledge" when that's what you need.
- **Ask for the location**: "Say which document and section the answer comes from."
- For very long **outputs** (a long report), stream and set a high `max_tokens`.

## Check yourself

1. You have 40 PDFs and one question. Where does the question go in the prompt?
2. Why ask for quotes before the answer?
3. Your app answers thousands of different questions about a 5M-token archive. Long context or RAG?

### Answers

1. At the end, after all the documents.
2. It focuses the model on the relevant passages and makes the answer checkable against the source, which reduces hallucination.
3. RAG: the archive is larger than the context window, and retrieving only relevant chunks keeps each query cheap.
