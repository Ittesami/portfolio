# Ittehad Rahman — portfolio

Next.js (App Router) site with its backend in the same app.

## Run locally

```bash
npm install
npm run dev
```

## Structure

- `app/page.js`: the page, rendered on the server from `getProfile()`
- `components/Intro.js`: the opening animation (client component)
- `lib/profile-data.js`: built-in site content, used while no database is connected
- `lib/mongodb.js`: shared MongoDB connection (returns `null` until configured)
- `app/api/profile`: `GET` site content as JSON
- `app/api/contact`: `POST {name, email, message}` saves to the `messages` collection
- `app/api/health`: `GET` shows whether the database is reachable
- `legacy/index.html`: the original single-file version, kept for reference

## Adding photos

Put images (jpg, png, webp, avif, gif) in `public/photos/`. They appear on the site automatically.

- `avatar.jpg` (or `me.jpg`) becomes the profile picture.
- Everything else goes in the gallery, in file-name order. The first one also fills the photo tile at the top.
- File names become captions: `01-nepal-mountains.jpg` shows as "Nepal mountains". Leading numbers only set the order. Camera names like `IMG_2041.jpg` get no caption.
- `GET /api/photos` returns the current list.
- `/photos` shows every photo with its optional title, date and description.

### Photo details (title, date, description)

All three are optional and stored in the MongoDB `photos` collection, keyed by file name.

- Edit them at `/admin/photos` (not linked from the site, hidden from search engines). Enter the `ADMIN_TOKEN` from `.env.local` once per browser tab, then save each photo. Changes show on the site immediately.
- Or call the API directly: `PUT /api/photos` with header `Authorization: Bearer <ADMIN_TOKEN>` and body `{ "file": "01-nepal-trek.jpg", "title": "...", "date": "2024-03-12", "description": "..." }`. Empty values clear a field.
- With no title saved, the title comes from the file name.

Set `ADMIN_TOKEN` on your host too when you deploy, or saving will be refused there.

`npm run build` records the list in `lib/photos-manifest.json` first, because hosts like Vercel can't read the `public` folder at runtime. After adding photos, rebuild/redeploy for them to appear on the live site.

## Connecting MongoDB

1. `.env.local` already points at the Atlas cluster. Replace `<db_password>` in `MONGODB_URI` with the database user's password.
2. Run `npm run seed`. It creates the `portfolio` database with two collections: `profile` (site content, `_id: "main"`) and `messages` (contact form submissions).
3. Edit that document in MongoDB to change the site. Pages revalidate every 60 seconds.

Until then the site shows the built-in content and the contact form answers
"not connected yet" (HTTP 503), pointing visitors to the email address.

## Deploying

Works on Vercel or any Node host (`npm run build && npm start`). Set `MONGODB_URI`
and `MONGODB_DB` as environment variables on the host. On MongoDB Atlas, allow the
host's IP addresses (for Vercel, `0.0.0.0/0` or their integration).
