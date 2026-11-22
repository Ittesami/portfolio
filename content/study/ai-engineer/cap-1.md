## The brief

Build and deploy one complete application that combines **RAG, tool use and evals**: the core skills employers look for. It should solve a real problem, ideally one you have.

## Requirements

| Area | Must have |
|---|---|
| **RAG** | Your own corpus, chunked and indexed; hybrid search; citations in answers |
| **Tools** | At least 3 tools, including one that writes data (with confirmation) |
| **Evals** | 50+ cases covering retrieval (recall@k) and answers (code checks + calibrated judge); dev/test split |
| **Production** | Deployed, streaming, auth or rate limits, cost logging, prompt caching |
| **Safety** | Prompt-injection cases in the eval; least-privilege tools |

## Ideas

- **Study companion**: RAG over all your course notes and MSc material; tools to create quizzes, log study sessions and schedule revision into Daily.
- **Tutoring assistant**: for your teaching. RAG over syllabus and past papers; tools to log what each student covered (your Teaching tracker), generate homework, draft parent updates.
- **Fitness coach**: RAG over training guides; tools that read your workout history and update next week's plan.

Pick the one you'll actually use; you'll find more bugs and real eval cases.

## Milestones

1. **Week 1**: scope, corpus, a 20-case eval, a working CLI prototype.
2. **Week 2**: retrieval pipeline with recall measured; tools working.
3. **Week 3**: web UI, streaming, deployment, logging, caching.
4. **Week 4**: grow the eval to 50+, run experiments (model, effort, retrieval settings), fix failures, write it up (cap-3).

## Done when

- [ ] Live URL (or a demo video if private data)
- [ ] Clean public repo (no secrets), README with architecture diagram
- [ ] Eval command and a results table in the README
- [ ] Cost per typical interaction known and documented
- [ ] You've used it yourself for at least a week
