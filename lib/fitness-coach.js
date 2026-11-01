import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";
import { weekDates } from "./fitness";
import { nutritionTargets } from "./nutrition";

// Weekly planning with Claude: reviews the past weeks of logged workouts and
// writes the next 7-day plan as structured JSON. Needs ANTHROPIC_API_KEY.

const MODEL = "claude-opus-5-5";

export const PlanSchema = z.object({
  review: z.object({
    summary: z.string().describe("2-4 sentences on how the previous week(s) went. Say so plainly if there is no history yet."),
    highlights: z.array(z.string()).describe("Concrete wins: PRs, consistency, volume increases. Empty if none."),
    adjustments: z.array(z.string()).describe("What changes this week and why, tied to the logged data."),
  }),
  weekSummary: z.string().describe("One or two sentences describing this week's plan."),
  days: z
    .array(
      z.object({
        date: z.string().describe("YYYY-MM-DD, one entry per day of the week in order"),
        title: z.string().describe('Short name, e.g. "Upper A" or "Rest"'),
        rest: z.boolean(),
        focus: z.string().describe("Muscles or goal for the day; for rest days, light activity suggestions"),
        warmup: z.string(),
        exercises: z.array(
          z.object({
            exerciseId: z.string().describe("id from the exercise library, or empty string if none fits"),
            name: z.string(),
            sets: z.number().int(),
            target: z.string().describe('Reps or time per set, e.g. "8-10 reps" or "30-45 s"'),
            load: z.string().describe('Suggested weight or effort, e.g. "40 kg", "light, 2-3 reps in reserve", "bodyweight"'),
            restSeconds: z.number().int(),
            notes: z.string().describe("Form cue or progression note; empty string if none"),
          }),
        ),
        cooldown: z.string(),
      }),
    )
    .describe("Exactly 7 days, Monday to Sunday"),
  progressionRules: z.array(z.string()),
  recoveryTips: z.array(z.string()),
  eating: z
    .array(z.string())
    .describe("2-4 points on last week's food log vs the daily targets: rough protein/calorie read, gaps, one or two concrete changes. Empty if nothing was logged."),
  sleep: z
    .array(z.string())
    .describe("1-3 points on last week's sleep log: average hours, consistency, one concrete change. Empty if nothing was logged."),
});

const SYSTEM = `You are an experienced strength coach writing a weekly training plan for one person, who logs every workout in their own tracker.

How to plan:
- Fit the plan to their profile: goal, experience level, equipment and how many days a week they can train. Put training days so muscle groups get at least 48 hours before being trained hard again, and spread rest days sensibly.
- For a beginner trying to gain weight and muscle: mostly compound lifts, 3 sets per exercise is plenty, rep ranges around 6-12 for compounds and 10-15 for isolation, 1-3 reps in reserve, technique before load. Keep cardio light so it doesn't eat into recovery.
- Use their logged history. When an exercise has been done, prescribe a concrete load based on the last sets: if they hit the top of the rep range on every set, add a small step (about 2.5 kg upper body, 5 kg lower body); if they missed reps, repeat the load. When there is no history, describe how to choose a starting weight instead of guessing a number.
- Compare last week's plan with what was actually logged, notice skipped sessions or exercises, and adjust: if they missed a lot, make the week more doable rather than piling it on.
- Only use exercises from the library when possible, and copy their id exactly. If something essential isn't in the library, use an empty id.
- Rest days get rest: true, an empty exercises list, and light activity ideas in focus (walking, mobility).
- Be specific and brief. No medical claims; tell them to stop and get checked if something hurts.

They also log what they eat and how they sleep. Use those logs too:
- Food: compare what they ate with their daily targets (given). Estimate protein and calories from the descriptions and say plainly when an estimate is rough. They don't eat vegetables, so suggest changes using meat, eggs, rice, bread, milk, yogurt and fruit. If they're struggling to gain, add easy calories (an extra glass of milk, another egg, a bigger rice portion) before anything else.
- Sleep: muscle is built during recovery. Note average hours and how consistent bedtimes are, and suggest one realistic change. Aim for 7-9 hours.
- Connect the dots when it's useful (for example, short sleep before a missed session).`;

function compactWorkouts(workouts) {
  return workouts.map((w) => ({
    date: w.date,
    exercises: w.entries.map((e) => ({
      name: e.name,
      sets: e.sets.map((s) =>
        e.type === "timed"
          ? `${s.seconds}s${s.distance ? ` ${s.distance}km` : ""}`
          : `${s.reps}${s.weight ? `x${s.weight}kg` : " reps"}`,
      ),
    })),
    notes: w.notes || undefined,
  }));
}

export class CoachError extends Error {}

export async function generateWeeklyPlan({ weekStart, today, profile, exercises, workouts, history, previousPlan, bodyweights, meals = [], sleep = [] }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new CoachError("Add ANTHROPIC_API_KEY to your environment variables to let Claude plan your week.");
  }
  const client = new Anthropic();
  const dates = weekDates(weekStart);

  // The library rarely changes, so it sits in a cached block ahead of the per-week data.
  const library = exercises.map((e) => `${e.id} | ${e.name} | ${e.category} | ${e.equipment} | ${e.type}`).join("\n");
  const weekData = {
    today,
    planWeek: { start: dates[0], end: dates[6], dates },
    profile,
    dailyTargets: nutritionTargets(profile),
    bodyweightLog: bodyweights,
    foodLogLast7Days: meals.map((m) => ({ date: m.date, time: m.time, ate: m.text })),
    sleepLogLast14Nights: sleep.map((s) => ({
      wokeUp: s._id,
      bedtime: s.bedtime,
      wakeTime: s.wakeTime,
      hours: Math.round((s.minutes / 60) * 10) / 10,
      quality: s.quality ?? undefined,
      note: s.note || undefined,
    })),
    previousWeekPlan: previousPlan
      ? { weekStart: previousPlan._id, days: previousPlan.days.map((d) => ({ date: d.date, title: d.title, rest: d.rest, exercises: d.exercises.map((x) => `${x.name} ${x.sets}x${x.target}`) })) }
      : null,
    loggedWorkoutsLast4Weeks: compactWorkouts(workouts),
    exerciseHistory: history.slice(0, 40).map((h) => ({
      name: h.name,
      sessions: h.sessions,
      lastDate: h.lastDate,
      lastSets: compactWorkouts([{ date: h.lastDate, entries: [{ name: h.name, type: h.type, sets: h.lastSets }] }])[0].exercises[0].sets,
    })),
  };

  let response;
  try {
    response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "high", format: betaZodOutputFormat(PlanSchema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Exercise library (id | name | muscle group | equipment | type):\n${library}`, cache_control: { type: "ephemeral" } },
            {
              type: "text",
              text: `Plan the week ${dates[0]} to ${dates[6]} using this data:\n${JSON.stringify(weekData, null, 1)}`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new CoachError("Claude rejected the API key. Check ANTHROPIC_API_KEY.");
    if (err instanceof Anthropic.RateLimitError) throw new CoachError("Claude is rate limited right now. Try again in a minute.");
    if (err instanceof Anthropic.APIConnectionError) throw new CoachError("Couldn't reach Claude. Check the server's internet connection.");
    if (err instanceof Anthropic.APIError) throw new CoachError(`Claude returned an error (${err.status}). Try again.`);
    throw err;
  }

  if (response.stop_reason === "refusal") throw new CoachError("Claude declined to write this plan. Try again or adjust your profile notes.");
  if (response.stop_reason === "max_tokens") throw new CoachError("The plan came back incomplete. Try again.");
  const plan = response.parsed_output;
  if (!plan) throw new CoachError("Claude's plan couldn't be read. Try again.");

  // Pin the plan to the requested week, whatever dates came back.
  const days = dates.map((date, i) => {
    const day = plan.days.find((d) => d.date === date) ?? plan.days[i];
    if (!day) return { date, title: "Rest", rest: true, focus: "Rest and recover.", warmup: "", exercises: [], cooldown: "" };
    const known = new Set(exercises.map((e) => e.id));
    return {
      ...day,
      date,
      exercises: day.rest ? [] : day.exercises.map((x) => ({ ...x, exerciseId: known.has(x.exerciseId) ? x.exerciseId : "" })),
    };
  });

  return { ...plan, days, model: response.model, usage: response.usage };
}
