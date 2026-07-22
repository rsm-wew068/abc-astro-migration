# Setup — what you actually need to do

The site is **self-contained**: all content and images live in the repo, so it
builds and deploys with no external services. The only things that need an
account are (1) hosting and (2) two optional add-ons — the contact form's email
delivery and the AI blog pipeline. R2 is **not** required to launch.

---

## 1. Launch the site (required) — hosting

Deploy the repo to **Cloudflare Pages** (free, commercial-OK):

1. Create a free **Cloudflare account**; add `abcabinet.us` (switch its
   nameservers to Cloudflare).
2. **Pages → Create → Connect to Git**, pick this repo.
   - Build command: `npm run build`
   - Output directory: `dist`
3. Point `abcabinet.us` at the Pages project (Cloudflare does this in a click).

That's it — the whole site (all pages, all images) is live. Nothing else needed
to see it working.

> Not tied to Cloudflare: any static host (Netlify, etc.) works the same —
> `npm run build`, serve `dist/`. Cloudflare is recommended so hosting + the
> contact form + (later) R2 all live in one account.

---

## 2. Contact form email (optional — needed only to receive form submissions)

The `/contact` form posts to a Cloudflare Pages Function that emails
**office@abcabinet.us** via [Resend](https://resend.com). Until a key is set, the
form works but just logs (doesn't deliver).

In **Cloudflare Pages → Settings → Environment variables**, add:

```
RESEND_API_KEY = <from resend.com — free tier>
CONTACT_FROM   = website@abcabinet.us   (optional; a verified Resend sender)
```

Verify `abcabinet.us` as a sending domain in Resend (a few DNS records) so mail
isn't marked spam.

---

## 3. AI blog pipeline (optional — only when you want AI-generated blog posts)

The blog templates work today with committed sample posts. To auto-generate new
posts *and their images*, you need object storage for the **blog images only**
(they grow fast — everything else stays in git):

1. Create an **R2 bucket** (e.g. `abcabinet-blog`) + an **R2 API token** (S3
   auth) → Access Key ID, Secret, and endpoint
   `https://<account_id>.r2.cloudflarestorage.com`.
2. Expose it publicly: connect `cdn.abcabinet.us` (R2 → Custom Domains), or use
   the free `r2.dev` URL to start.
3. Fill `pipeline/.env` (see `pipeline/.env.example`) with `S3_*`, plus
   `OPENAI_API_KEY` (images) and either `ANTHROPIC_API_KEY` or `ant auth login`
   (text). Then `npm run generate -- "a topic"`.

For scheduled/cloud generation, add those as **GitHub Actions secrets**
(`.github/workflows/generate.yml` runs it in the cloud, not on your machine).

---

## Summary

| Goal | Needs |
|---|---|
| **See the site live** | Cloudflare Pages + domain. Nothing else. |
| **Receive contact-form emails** | `RESEND_API_KEY` |
| **Auto-generate blog posts** | R2 bucket + `OPENAI_API_KEY` + Claude auth |

Images for the site's pages (about, service, events, gallery, portfolio, etc.)
are already in the repo — **no image hosting needed to launch.**
