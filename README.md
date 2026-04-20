# Daily Intel — Deployment Guide

A beautiful web app that displays your AI-curated daily business and investment news digest.
Claude posts the digest here automatically after each run.

---

## Step 1 — Push to GitHub

1. Create a new GitHub repository (e.g., `daily-intel`)
2. Upload all these files to it (drag & drop the folder contents into GitHub)
3. Make the repo **private** if you don't want others to see your API key setup

---

## Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (free account works)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"** and select your `daily-intel` repo
4. Click **Deploy** — Vercel will build it automatically (takes ~1 min)
5. You'll get a URL like `https://daily-intel-abc123.vercel.app`

---

## Step 3 — Add Vercel KV (the database)

Your site needs somewhere to store digests. Vercel KV is free and takes 2 minutes.

1. In your Vercel project dashboard, click **"Storage"** tab
2. Click **"Create Database"** → choose **KV**
3. Name it `daily-intel-kv`, click **Create**
4. Vercel automatically adds the KV environment variables to your project ✓

---

## Step 4 — Set Your API Key

This is the secret password Claude uses to post digests to your site.

1. In Vercel dashboard → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `DIGEST_API_KEY`
   - **Value:** Pick any long random string, e.g., `di-k8x2m9p4n7q3r6s1t5`
   - Apply to: **Production, Preview, Development**
3. Click **Save**
4. In Vercel → **Deployments** → click the three dots on latest deploy → **Redeploy** (so the new env var takes effect)

---

## Step 5 — Configure Claude to post here

Tell Claude (in the same conversation after running a digest):

> "Post the digest to Daily Intel at `https://your-site.vercel.app` using API key `your-api-key-here`"

Or add a line to your Claude general instructions:

```
My Daily Intel site URL: https://your-site.vercel.app
My Daily Intel API key: your-api-key-here
After running the news digest, always post it to Daily Intel automatically.
```

---

## How Claude Posts to the Site

When you run the daily-news-digest skill and want it posted, Claude sends this API call:

```bash
POST https://your-site.vercel.app/api/digest
x-api-key: your-api-key-here
Content-Type: application/json

{
  "date": "2026-04-17",
  "marketPulse": "Iran ceasefire announcement triggered a sharp risk-on rally...",
  "stories": [
    {
      "rank": 1,
      "headline": "S&P 500 Hits Record Above 7,100 on Iran Ceasefire",
      "summary": "The S&P 500 crossed 7,100 for the first time...",
      "source": "CNBC",
      "url": "https://cnbc.com/...",
      "topic": "Markets"
    }
  ],
  "watchList": [
    { "ticker": "NVDA", "note": "Manufacturing expansion announced" }
  ]
}
```

---

## Your Site URLs

| URL | What it shows |
|-----|---------------|
| `https://your-site.vercel.app` | Today's (latest) digest |
| `https://your-site.vercel.app/2026-04-17` | A specific date |
| `https://your-site.vercel.app/api/digest` | JSON API — latest + all dates |
| `https://your-site.vercel.app/api/digest/2026-04-17` | JSON for a specific date |

---

## Updating the Site

If you ever want to change the design, just edit the component files and push to GitHub.
Vercel automatically rebuilds and redeploys within ~1 minute.

---

## Troubleshooting

**"Unauthorized" error when posting:**
→ Check that your `DIGEST_API_KEY` env var matches the key Claude is using.

**Site shows "No digest yet today":**
→ Run `do the news digest` in Claude and ask it to post to Daily Intel.

**KV errors in Vercel logs:**
→ Make sure you created the KV database in Step 3 and redeployed after.

**Build fails:**
→ Make sure all files were uploaded correctly. Check the Vercel build logs for the specific error.
