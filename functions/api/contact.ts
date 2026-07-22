/**
 * Cloudflare Pages Function — handles the /contact form POST.
 * Works alongside the static Astro build (no SSR adapter needed).
 *
 * Env (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY   Resend API key for delivery
 *   CONTACT_TO       recipient address (defaults to office@abcabinet.us)
 *   CONTACT_FROM     verified sender (e.g. website@abcabinet.us)
 *
 * If RESEND_API_KEY is unset, the submission is accepted and logged (so the
 * form works end-to-end in preview) — wire the key to actually deliver mail.
 */
interface Env {
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
}

// All inquiries go straight to the office inbox.
const CONTACT_TO = 'office@abcabinet.us';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData();

  // Honeypot — bots fill hidden fields; humans don't.
  if (form.get('website')) return json({ ok: true });

  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  const message = String(form.get('message') || '').trim();
  if (!name || !email || !message) {
    return json({ ok: false, error: 'Missing required fields' }, 400);
  }

  const fields = ['name', 'email', 'phone', 'company', 'site', 'interest', 'message'];
  const body = fields
    .map((f) => `${f}: ${String(form.get(f) || '')}`)
    .join('\n');

  if (!env.RESEND_API_KEY) {
    console.log('[contact] (no RESEND_API_KEY) submission:\n' + body);
    return json({ ok: true, delivered: false });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'website@abcabinet.us',
      to: CONTACT_TO,
      reply_to: email,
      subject: `New project inquiry — ${name}`,
      text: body,
    }),
  });

  if (!res.ok) return json({ ok: false, error: 'Delivery failed' }, 502);
  return json({ ok: true, delivered: true });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
