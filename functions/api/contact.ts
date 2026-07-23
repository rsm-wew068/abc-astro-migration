/**
 * Cloudflare Pages Function — handles the /contact form POST and delivers it
 * with **Cloudflare Email** (the send_email binding), so no third-party service
 * or API key is needed.
 *
 * Setup (one time, in the Cloudflare dashboard):
 *  1. Email → Email Routing: enable it for abcabinet.us and verify a destination
 *     inbox (e.g. office@abcabinet.us forwarding to your real mailbox).
 *  2. Pages → this project → Settings → Functions → add a "Send email" binding
 *     named EMAIL, with destination address = that verified address.
 *  3. Set env var CONTACT_TO = the verified destination (defaults below).
 *
 * If the EMAIL binding isn't configured yet, the submission is accepted and
 * logged (so the form works in preview) rather than erroring.
 */
import { EmailMessage } from 'cloudflare:email';

interface Env {
  EMAIL?: { send: (msg: EmailMessage) => Promise<void> };
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

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

  const to = env.CONTACT_TO || 'office@abcabinet.us';
  const from = env.CONTACT_FROM || 'website@abcabinet.us';
  const fields = ['name', 'email', 'phone', 'company', 'site', 'interest', 'message'];
  const body = fields.map((f) => `${f}: ${String(form.get(f) || '')}`).join('\n');

  if (!env.EMAIL) {
    console.log('[contact] (no EMAIL binding) submission:\n' + body);
    return json({ ok: true, delivered: false });
  }

  const mime = [
    `From: American Built Cabinets <${from}>`,
    `To: <${to}>`,
    `Reply-To: ${name} <${email}>`,
    `Subject: New project inquiry — ${name}`.replace(/—/g, '-'),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\r\n');

  try {
    await env.EMAIL.send(new EmailMessage(from, to, mime));
    return json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[contact] email send failed:', (err as Error).message);
    return json({ ok: false, error: 'Delivery failed' }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
