## What you're building

A chat assistant inside your **Daily** app that can read and update your own data: to-dos, workouts, study progress, prayers, classes.

```
you › What's left today, and how's my AWS course going?
assistant › You have 2 to-dos due today: "renew passport" and "email landlord".
            AWS: 31 of 56 items done. Next up: Module 11 lesson 3, AWS cost tools.
you › Add "buy protein" for tomorrow and mark the passport one done.
assistant › Done: added "buy protein" (due Mon 23 Nov) and ticked off "renew passport".
```

## Steps

1. **Route handler** `app/api/admin/assistant/route.js`, protected by `isAdmin` like the rest of Daily. The API key stays server-side.
2. **Read tools** (safe): `get_todos(due)`, `get_study_progress(course?)`, `get_workouts(from, to)`, `get_teaching_week(date)`. Reuse the functions in `lib/` the existing APIs use.
3. **Write tools** (careful): `add_todo(title, dueDate?)`, `complete_todo(id)`. Use `strict: true` schemas and validate in the handler.
4. **Tool runner** with `betaZodTool`, model Opus 5.5 (try Sonnet 5.5 too), effort `medium`.
5. **System prompt** with today's date and time zone, your schedule (gym Fri/Mon/Tue, work Sat–Mon), and rules: confirm before deleting anything; say exactly what changed after a write.
6. **Chat UI** as a new Daily page, streaming the reply. Show a small "used get_todos" line for each tool call so you can see what it did.
7. **Limits:** max 10 tool rounds per message; reject messages over 4,000 characters.

## Done when

- [ ] Questions about each data type are answered from real data, not guessed
- [ ] Adding and completing to-dos works and shows up in the To-do page
- [ ] It asks before any destructive action
- [ ] Tool calls are visible in the UI
- [ ] Only you (logged in) can use it

## Stretch goals

- A weekly review: "Summarise my week" pulls workouts, prayers, to-dos and classes into one report.
- Memory tool for preferences ("I like reminders in the morning").
- Turn the same tools into an MCP server (next module's project) and use them from Claude Code.
