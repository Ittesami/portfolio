## What you're building

An MCP server exposing your **fitness and study data** from the portfolio's MongoDB, so Claude Code (and later Claude Desktop or the API) can answer questions like:

- "How many times did I train legs this month, and what's my squat trend?"
- "What's next in my AI engineer course, and how far through am I?"
- "Plan my study for the week around my gym days."

## Steps

1. **New repo/folder** `daily-mcp` with `@modelcontextprotocol/sdk`, `zod` and `mongodb`. Read `MONGODB_URI` from the environment.
2. **Read-only tools** first:
   - `get_workouts(from, to)`: date, exercises, sets
   - `get_exercise_history(exercise, limit)`: best set per session, for trends
   - `get_bodyweight(from, to)`
   - `get_courses()`: each course with done/total and the next item
   - `get_course_detail(slug)`: modules and status per item
3. **One resource**: `daily://plan/this-week`, the current fitness plan.
4. **One prompt**: `weekly-review`, which asks for a review of training and study for the past 7 days using the tools.
5. **Test** every tool in the MCP Inspector.
6. **Connect** to Claude Code: `claude mcp add daily -e MONGODB_URI=... -- npx tsx src/server.ts`.
7. **Ask** the three example questions above and check the answers against the Daily app.

## Done when

- [ ] All tools work in the Inspector, with clear descriptions
- [ ] Claude Code answers the three questions correctly from real data
- [ ] The server never writes to the database
- [ ] Nothing logs to stdout; the connection string isn't in the code
- [ ] Bad inputs (unknown exercise, bad dates) return helpful errors

## Stretch goals

- Add a write tool `log_bodyweight(kg)` with validation and a confirmation-friendly description.
- Run it over Streamable HTTP with a bearer token and use it from the API via the MCP connector.
- Reuse the same tool functions for the Daily assistant (Tool use project), so both share one code path.
