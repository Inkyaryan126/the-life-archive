# Life Archive

Life Archive is an MVP web app for creating a private or public digital archive of a person's life. An archive can hold journal entries, photos, videos, voice notes, songs, lessons, and other memories. Each archive has a QR page that points to a random-memory experience for physical keepsakes such as cards, plaques, frames, or memorial items.

This version uses local JSON persistence and does not include Supabase yet.

## Local Development

Install dependencies:

```bash
npm install
```

Create a local env file if you want QR codes to use a specific base URL:

```bash
cp .env.example .env.local
```

For normal local testing, you can either leave `NEXT_PUBLIC_SITE_URL` unset or set it to your local dev URL:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful demo routes:

```text
/archive/maya-rivera
/archive/dustin-sigley
/archive/dustin-sigley/qr
/archive/dustin-sigley/random
```

## Required Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://thelifearchive.vip
```

This value is used when generating QR destination URLs. In production, set it to the public domain so QR codes point to the live site instead of a Vercel preview URL or localhost.

## Persistence

The MVP stores archives and memories in:

```text
data/life-archive.json
```

This is intentionally simple for the MVP and founder demo. On Vercel, file writes inside the deployment are not durable long-term storage. The seeded demo archives will work, but user-created archives should move to Supabase or another database before real public use.

## Vercel Deployment Notes

1. Push the project to a GitHub repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the framework preset as **Next.js**.
4. Set the production environment variable:

```bash
NEXT_PUBLIC_SITE_URL=https://thelifearchive.vip
```

5. Deploy.
6. In Vercel project settings, add these domains:

```text
thelifearchive.vip
www.thelifearchive.vip
```

7. Configure DNS at Porkbun to point the domain to Vercel.
8. After DNS verifies, test:

```text
https://thelifearchive.vip
https://thelifearchive.vip/archive/dustin-sigley/qr
https://thelifearchive.vip/archive/dustin-sigley/random
```

## Production Caveat

Do not treat local JSON persistence as production storage. Supabase should be added before accepting real user-created archives, uploaded media, authentication, or private archive access.
