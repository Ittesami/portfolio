## What you're building

An agent that takes a research question, **searches the web**, reads the best sources and writes a **short cited brief**.

```
$ research "What are the trade-offs of MongoDB Atlas Vector Search vs pgvector?"

Searching... (4 searches, 6 pages read)

# MongoDB Atlas Vector Search vs pgvector
**Bottom line:** ...
## Key differences
- Hosting and ops ... [1]
- Filtering and hybrid search ... [2][3]
...
## Sources
[1] https://...
```

## Steps

1. **Tools:** `web_search_20260209` (`max_uses: 6`) and `web_fetch_20260209` (`max_uses: 6`). Both are server tools, so no handlers.
2. **System prompt:** the brief's audience (you, an engineer), structure (bottom line, key points, open questions, sources), length (~400 words), rules (prefer official docs and recent sources, say when sources disagree, never cite something you didn't read).
3. **Loop** until `end_turn`, handling `pause_turn` by sending the content back.
4. **Show progress:** print each `server_tool_use` (the queries and URLs) as it happens; stream the final text.
5. **Collect citations** from the text blocks and print a numbered source list.
6. **Save** each brief as markdown in a `briefs/` folder with the date and cost.
7. **Effort:** try `medium` vs `high` on the same question; compare quality, number of searches and cost.

## Done when

- [ ] Five different questions produce briefs with real, working source links
- [ ] Every claim has a citation
- [ ] Progress (queries, pages) is visible while it runs
- [ ] Cost per brief is printed and stays under a limit you set
- [ ] One brief deliberately on a topic with conflicting sources says they disagree

## Stretch goals

- Add `allowed_domains` presets ("docs only", "news").
- Add a client tool `save_note` that writes key facts to your Daily study notes.
- Make it a two-step workflow: Haiku plans the search queries, Opus writes the brief. Is it cheaper? As good?
