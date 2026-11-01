# Ittehad Rahman — portfolio and daily tracker

Next.js (App Router) app with its backend in the same project:

- a public portfolio site with a photography page
- a private admin panel at `/admin` with a to-do list, prayer tracker, fitness (coming next) and photo manager

## Run locally

```bash
npm install
npm run dev
```

## Environment variables (`.env.local`)

| Name | What it's for |
| --- | --- |
| `MONGODB_URI` | Atlas connection string (standard `mongodb://` form; see below) |
| `MONGODB_DB` | Database name, `portfolio` |
| `ADMIN_PASSWORD` | Password for logging in at `/admin/login` (8+ characters) |
| `SESSION_SECRET` | Signs login cookies. Changing it logs you out everywhere |
| `ADMIN_TOKEN` | Optional bearer token for scripts calling the admin APIs |
| `ANTHROPIC_API_KEY` | Claude API key, used to write weekly fitness plans |

Set the same variables on your host when you deploy.

## Structure

- `app/page.js`: the portfolio, rendered on the server from `getProfile()` and `getPhotos()`
- `app/photos/page.js`: public photography page
- `app/admin/login`: login page; `app/admin/(panel)/*`: the private panel (login required)
- `components/admin/*`: to-do list, prayer tracker, photo manager and panel layout
- `lib/profile-data.js`: built-in site content, used while no database is connected
- `lib/mongodb.js`: shared MongoDB connection
- `lib/auth.js`: login sessions (signed cookie) and the admin check used by every admin API
- `lib/photos.js`, `lib/todos.js`, `lib/prayers.js`: data logic for each feature

### APIs

Public:
- `GET /api/profile`: site content
- `POST /api/contact`: `{ name, email, message }`, saved to `messages`
- `GET /api/photos`: visible photos with their details
- `GET /api/photo-file/<id>`: an uploaded photo
- `GET /api/health`: whether the database is reachable

Admin (login cookie, or `Authorization: Bearer <ADMIN_TOKEN>`):
- `POST /api/admin/login`, `POST /api/admin/logout`
- `GET, POST /api/admin/todos`; `PATCH, DELETE /api/admin/todos/<id>`
- `GET /api/admin/prayers?date=YYYY-MM-DD`; `PUT /api/admin/prayers` `{ date, prayer, status }`
- `PUT /api/admin/prayers/settings` `{ city, country, method, school }`
- `GET, POST /api/admin/photos` (POST = multipart upload); `PATCH, DELETE /api/admin/photos/<id>`

## Admin panel

Log in at `/admin/login` with `ADMIN_PASSWORD`. Sessions last 30 days. Five wrong passwords lock
logins from that address for 10 minutes.

- **To-do**: tasks with an optional date, time and notes. Filter by open, today (including
  overdue), upcoming, no date and done.
- **Prayers**: Fajr, Dhuhr, Asr, Maghrib and Isha, with Jumu'ah in place of Dhuhr on Fridays.
  Mark each as on time, late or missed (tap again to clear). Includes a 7-day history and a
  next-prayer countdown. Times come from the [Aladhan API](https://aladhan.com/prayer-times-api)
  for your saved location (default Bristol, Moonsighting Committee method, Hanafi Asr). Change
  the city or method under "Location and calculation method"; the city is looked up with
  [Open-Meteo's geocoder](https://open-meteo.com/en/docs/geocoding-api) so typos are caught.
- **Fitness**: see below.
- **Photos**: see below.

## Fitness tracker

Private, at `/admin/fitness`.

- **Exercise library**: 174 built-in exercises (gym machines, barbell, dumbbell, cable, kettlebell,
  bodyweight, bands, cardio, sports, mobility) in the `exercises` collection, from
  `lib/exercise-library.js`. Add your own from the logger ("Can't find it? Add a new exercise").
- **Logging**: strength exercises take sets of reps (+ optional kg); timed ones take minutes/seconds
  (+ optional km). "Log this workout" on a planned day pre-fills its exercises and set counts.
- **Progress**: body-weight log, sessions and total kg lifted per week for 8 weeks, best set per exercise.
- **Profile**: height, weight, goal, experience, equipment, days per week and notes, which the planner reads.
- **Weekly plans with Claude**: "Plan this week with Claude" sends your profile, body weights, the
  last 4 weeks of workouts, per-exercise history and last week's plan to Claude (`claude-opus-5-5`,
  structured output validated with Zod; see `lib/fitness-coach.js`). It reviews how the week went
  and writes a 7-day plan with sets, reps, suggested loads and rest. Plans are stored per week in
  `fitnessPlans` (`_id` = the Monday). Refusal fallbacks are enabled (`fallbacks: "default"`).
  Generating a plan takes about a minute and costs a few cents of API usage.

## Travel

Public at `/travel`: a world map, then one album per trip at `/travel/<trip>`.

- **Map**: rendered on the server as a plain SVG from Natural Earth data (`world-atlas`, `d3-geo`;
  see `lib/world.js`). Countries in `travel.visited` in `lib/profile-data.js` are blue, `travel.home`
  is amber, and every album's country is added automatically. Countries too small to see (like the
  Maldives) get a dot. Codes are ISO 3166-1 numeric, e.g. `"826"` = United Kingdom.
- **Albums**: managed in the admin **Travel** tab. Each trip has a title, country, optional place
  and dates, and a description (blank lines make paragraphs). Upload photos straight into a trip;
  give each a sentence-style title, and optionally a description and date. Pick any photo as the
  album cover (otherwise the first one is used). Stored in the `albums` collection; photos join a
  trip through `photos.albumId`, and album photos don't appear on the Photography page.
- Deleting a trip keeps its photos; they move back to the Photos tab.

## Photos

Two ways to add them:

1. **Upload from the admin panel** (Photos tab). Photos are shrunk in the browser to fit the
   4 MB upload limit, stored in MongoDB (GridFS bucket `photoFiles`), and appear on the site
   immediately. Works on the live site.
2. **Put files in `public/photos/`** and commit them. `avatar.jpg` (or `me.jpg`) becomes the
   profile picture; file names give default titles (`01-nepal-trek.jpg` → "Nepal trek"). These
   need a rebuild/redeploy to show on the live site, because `npm run build` records the list in
   `lib/photos-manifest.json`.

In the Photos tab you can give any photo an optional title, date and description, hide it from
the site, or make it your profile picture. Uploaded photos can also be deleted; folder photos
can only be hidden there (delete the file to remove one).

Order on the site: dated photos newest first, then undated uploads newest first, then folder
photos by file name.

## MongoDB

`npm run seed` creates the `portfolio` database and its collections: `profile` (site content),
`messages`, `photos`, `todos`, `prayers` and `settings`. It overwrites `profile` with
`lib/profile-data.js` but leaves your tasks, prayer log and photos alone.

Use Atlas's standard `mongodb://host1,host2,host3/...` connection string rather than
`mongodb+srv://`: some networks (phone hotspots) block the DNS lookups `+srv` needs.

## Deploying

Works on Vercel or any Node host (`npm run build && npm start`). Set the environment variables
above on the host, and in MongoDB Atlas allow the host's IP addresses under Network Access
(for Vercel, `0.0.0.0/0`).
