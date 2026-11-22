A project without a write-up is invisible to employers. A good **case study** shows how you think: the problem, the decisions, the trade-offs and the evidence.

## Structure (aim for 800–1,500 words)

1. **Summary** (3 sentences): what it is, who it's for, the headline result.
2. **The problem**: why it matters; what you did before.
3. **Architecture**: a diagram (boxes and arrows: UI → API → retrieval → model → tools → data) and a paragraph on each part.
4. **Key decisions and trade-offs**: the interesting part. For example:
   - Why hybrid search instead of vector only (with your recall numbers)
   - Why Sonnet 5.5 at medium effort instead of Opus (eval scores vs cost)
   - Why a workflow with one agentic step rather than a full agent
5. **Evaluation**: how you measured quality; your results table; what improved it most.
6. **Cost and performance**: cost per interaction, latency, caching hit rate.
7. **Safety**: prompt-injection defences, permissions, privacy.
8. **What I'd do next**: honest limitations and next steps.
9. **Links**: live demo or video, repo.

## Tips

- **Numbers beat adjectives**: "recall@8 went from 0.71 to 0.88 with hybrid search and reranking" beats "much better retrieval".
- **Show one failure** you found and how you fixed it. It's the most convincing part.
- **Screenshots or a 60-second video** of it working.
- Keep the README technical and the portfolio page readable for non-engineers (a recruiter reads the summary; an engineer reads the trade-offs).

## Where to publish

- A project page on your portfolio (add a projects section to `lib/profile-data.js`)
- The repo README
- A LinkedIn post summarising it with the diagram

## Done when

- [ ] A case study page for each capstone on your portfolio
- [ ] Each has a diagram, a results table and a cost figure
- [ ] Repos are public (or a demo video if data is private) with READMEs linking back
