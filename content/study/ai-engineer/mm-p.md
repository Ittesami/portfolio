## What you're building

A command-line (or Daily page) tool that answers questions about your **AWS Cloud Practitioner study guide PDF**, with **citations** showing the page each answer came from.

```
? What's the difference between CloudTrail and CloudWatch?

CloudWatch monitors performance and metrics of your resources [1], while
CloudTrail records API calls made in your account for auditing [2].

[1] p. 23: "Amazon CloudWatch ... monitor resources and applications ..."
[2] p. 24: "AWS CloudTrail ... records user activity and API usage ..."

(0 cached → 41,200 cached tokens · $0.02)
```

## Steps

1. **Upload** the PDF once with the Files API; save the `file_id` in a small JSON file so you don't upload it again.
2. **Ask** in a loop: each request has the document block (by `file_id`, `citations: { enabled: true }`) followed by the question.
3. **Cache** the document: add `cache_control: { type: "ephemeral" }` on the document block. Check `usage.cache_read_input_tokens` is non-zero from the second question on.
4. **Render** the answer with numbered citation markers and a source list (page numbers + quoted text), using the loop from the Citations lesson.
5. **System prompt**: answer only from the guide; if the guide doesn't cover it, say so; keep answers short, exam-focused.
6. **Test** with 10 questions: 7 the guide answers, 3 it doesn't (e.g. "What's the capital of Peru?").

## Done when

- [ ] The PDF is uploaded once and reused by id
- [ ] Every factual sentence in an answer has at least one citation with a page number
- [ ] Out-of-scope questions get "the guide doesn't cover this", not an invented answer
- [ ] The second and later questions show cache reads, and cost visibly less

## Stretch goals

- Add your own AWS lesson notes from this app (`content/study/aws-clf/*.md`) as extra text documents; cite them too.
- Turn it into an admin page in Daily under Study.
- Generate a 5-question quiz from a chosen chapter with structured outputs (note: in a separate call, since citations and structured outputs can't be combined).
