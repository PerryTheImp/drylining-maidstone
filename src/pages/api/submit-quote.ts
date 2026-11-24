// Quote submission endpoint — receives JSON form metadata + Vercel Blob URLs
// for any attached files. The actual file upload happens client-side via
// /api/quote-upload-token → direct PUT to Vercel Blob, so this endpoint only
// sees a small JSON body (no 4.5MB serverless body limit problem).
//
// Body shape:
//   {
//     name, phone, email, service, details, source, city, landing_path,
//     file_urls: [{ filename, url, size, mime }]
//   }
//
// Forwards to the existing Google Apps Script lead pipeline (same as the
// non-attached form path) and optionally emails the owner via SendGrid.
//
// Astro APIRoute style — same pattern as the working /api/twilio/voice.

export const prerender = false;

const APPS_SCRIPT_URL =
  // Inlined so a misconfigured env doesn't silently drop leads.
  'https://script.google.com/macros/s/AKfycbx2ROgDcHu3ArLmfqPETQYCkFn_5YP6fy1WfZMbynAZsoARpnMRntm5iLlgKSFSJBkG/exec';

const FREEPHONE = '0800 820 3850';

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  };
}

function asString(v: any, max = 500): string {
  if (v == null) return '';
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

async function sendNotificationEmail(payload: any): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.LEAD_NOTIFY_FROM || 'leads@drylininglincoln.co.uk';
  if (!apiKey || !to) return; // best-effort, no-op if not configured

  const files = (payload.file_urls || []) as Array<{ filename: string; url: string; size: number; mime: string }>;
  const fileLines = files.length
    ? files.map((f, i) => `  ${i + 1}. ${f.filename} (${Math.round((f.size || 0) / 1024)} KB) — ${f.url}`).join('\n')
    : '  (none)';

  const subject = `New quote lead: ${asString(payload.name) || 'Unknown'} — ${asString(payload.service) || 'General'}`;
  const text = [
    `New quote submission from ${asString(payload.landing_path) || 'the site'}.`,
    '',
    `Name:    ${asString(payload.name)}`,
    `Phone:   ${asString(payload.phone)}`,
    `Email:   ${asString(payload.email)}`,
    `Service: ${asString(payload.service)}`,
    `City:    ${asString(payload.city)}`,
    `Source:  ${asString(payload.source)}`,
    '',
    'Details:',
    asString(payload.details),
    '',
    'Attachments:',
    fileLines,
    '',
    `Reply directly to this email or call FREEPHONE ${FREEPHONE}.`,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#222">
      <h2 style="margin:0 0 16px">New quote submission</h2>
      <p style="color:#666;margin:0 0 16px">From <code>${asString(payload.landing_path) || '/'}</code></p>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td><strong>${asString(payload.name)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td><a href="tel:${asString(payload.phone)}">${asString(payload.phone)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${asString(payload.email)}">${asString(payload.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Service</td><td>${asString(payload.service)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">City</td><td>${asString(payload.city)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Source</td><td>${asString(payload.source)}</td></tr>
      </table>
      <h3 style="margin:24px 0 8px">Details</h3>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:6px;font-family:inherit">${asString(payload.details)}</pre>
      <h3 style="margin:24px 0 8px">Attachments (${files.length})</h3>
      ${
        files.length
          ? `<ol style="padding-left:20px">${files
              .map((f) => `<li><a href="${f.url}">${f.filename}</a> <span style="color:#666">(${Math.round((f.size || 0) / 1024)} KB)</span></li>`)
              .join('')}</ol>`
          : '<p style="color:#999">No attachments.</p>'
      }
      <p style="margin-top:24px;color:#666">Reply directly or call FREEPHONE ${FREEPHONE}.</p>
    </div>
  `.trim();

  try {
    const sg = await import('@sendgrid/mail');
    sg.default.setApiKey(apiKey);
    await sg.default.send({
      to,
      from,
      subject,
      text,
      html,
      replyTo: asString(payload.email) || undefined,
    });
  } catch (err: any) {
    console.error('sendgrid_failed', err?.message || err);
  }
}

async function forwardToAppsScript(payload: any): Promise<{ ok: boolean; status?: number }> {
  // Apps Script doesn't accept CORS preflight, so POST as text/plain to dodge it.
  const body = JSON.stringify(payload);
  try {
    const r = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body,
    });
    return { ok: r.ok, status: r.status };
  } catch (err: any) {
    console.error('apps_script_forward_failed', err?.message || err);
    return { ok: false };
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST({ request }: { request: Request }) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders() },
    });
  }

  const payload = {
    name: asString(body.name),
    phone: asString(body.phone),
    email: asString(body.email),
    service: asString(body.service),
    details: asString(body.details, 5000),
    source: asString(body.source) || 'dryliningmaidstone.co.uk',
    city: asString(body.city) || 'Maidstone',
    landing_path: asString(body.landing_path),
    upload_id: asString(body.upload_id),
    file_urls: Array.isArray(body.file_urls) ? body.file_urls : [],
    form_variant: asString(body.form_variant) || 'with-attachments',
    submitted_at: new Date().toISOString(),
  };

  // Minimal validation — at least one contact field.
  if (!payload.name && !payload.phone && !payload.email) {
    return new Response(JSON.stringify({ error: 'missing_contact' }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders() },
    });
  }

  // Forward and notify in parallel — both are best-effort.
  const [forward] = await Promise.all([
    forwardToAppsScript(payload),
    sendNotificationEmail(payload),
  ]);

  return new Response(
    JSON.stringify({ ok: true, forwarded: forward.ok, file_count: payload.file_urls.length }),
    { status: 200, headers: { 'content-type': 'application/json', ...corsHeaders() } }
  );
}
