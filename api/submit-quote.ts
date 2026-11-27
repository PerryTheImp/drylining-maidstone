import type { VercelRequest, VercelResponse } from '@vercel/node';

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbx2ROgDcHu3ArLmfqPETQYCkFn_5YP6fy1WfZMbynAZsoARpnMRntm5iLlgKSFSJBkG/exec';

const APP_ID = 'maidstone';
const SITE_NAME = 'Drylining Maidstone';
const SITE_DOMAIN = 'dryliningmaidstone.co.uk';
const FREEPHONE = '0800 MAIDSTONE';
const DEFAULT_FROM = 'leads@dryliningmaidstone.co.uk';

const DEFAULT_RECIPIENTS = (process.env.LEAD_NOTIFY_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const DEFAULT_BCC = (process.env.LEAD_NOTIFY_BCC || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const INLINE_ATTACH_MAX_BYTES = 18 * 1024 * 1024;

const MAX_FIELD = 500;
const MAX_LONG_FIELD = 5000;

const ALLOWED_ORIGINS = [
  `https://${SITE_DOMAIN}`,
  `https://www.${SITE_DOMAIN}`,
  'http://localhost:4321',
  'http://localhost:3000',
];

function corsHeaders(req: VercelRequest) {
  const origin = String(req.headers.origin || '');
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function trim(v: unknown, max = MAX_FIELD): string {
  if (typeof v !== 'string') return '';
  const t = v.trim();
  return t.length > max ? t.slice(0, max) : t;
}

type LeadPayload = {
  source?: string;
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  city?: string;
  details?: string;
  page?: string;
  referrer?: string;
  file_urls?: Array<{ filename: string; url: string; size: number; mime: string }>;
  submitted_at?: string;
};

async function forwardToAppsScript(payload: LeadPayload): Promise<boolean> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 5000);
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, app: APP_ID }),
      mode: 'no-cors',
      signal: ctl.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function sendViaSendGrid(payload: LeadPayload): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return false;
  const fromAddr = process.env.LEAD_NOTIFY_FROM || DEFAULT_FROM;
  const toAddrs = DEFAULT_RECIPIENTS.length ? DEFAULT_RECIPIENTS : [fromAddr];
  const bccAddrs = DEFAULT_BCC;

  let sg: any;
  try {
    sg = (await import('@sendgrid/mail')).default;
    sg.setApiKey(apiKey);
  } catch (err) {
    console.error('[submit-quote] SendGrid import failed:', err);
    return false;
  }

  const files = (payload.file_urls || []).filter(
    (f) => f && f.url && f.size > 0 && f.size <= INLINE_ATTACH_MAX_BYTES,
  );

  const text = formatEmail(payload);
  const html = text.replace(/\n/g, '<br>');

  const attachments: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }> = [];
  for (const f of files) {
    try {
      const resp = await fetch(f.url);
      if (!resp.ok) continue;
      const buf = Buffer.from(await resp.arrayBuffer());
      attachments.push({
        content: buf.toString('base64'),
        filename: f.filename || 'attachment',
        type: f.mime || 'application/octet-stream',
        disposition: 'attachment',
      });
    } catch (err) {
      console.warn('[submit-quote] attachment fetch failed', f.url, err);
    }
  }

  try {
    await sg.send({
      to: toAddrs,
      from: fromAddr,
      bcc: bccAddrs.length ? bccAddrs : undefined,
      subject: `New ${SITE_NAME} lead — ${payload.name || 'Unknown'}`,
      text,
      html,
      attachments: attachments.length ? attachments : undefined,
    });
    return true;
  } catch (err) {
    console.error('[submit-quote] SendGrid send failed:', err);
    return false;
  }
}

function formatEmail(p: LeadPayload): string {
  const lines: string[] = [];
  lines.push(`New lead for ${SITE_NAME}`);
  lines.push('----------------------------------------');
  lines.push(`Name:     ${p.name || ''}`);
  lines.push(`Phone:    ${p.phone || ''}`);
  lines.push(`Email:    ${p.email || ''}`);
  if (p.city) lines.push(`City:     ${p.city}`);
  if (p.service) lines.push(`Service:  ${p.service}`);
  if (p.source) lines.push(`Source:   ${p.source}`);
  if (p.page) lines.push(`Page:     ${p.page}`);
  if (p.referrer) lines.push(`Referrer: ${p.referrer}`);
  lines.push('----------------------------------------');
  lines.push('Project details:');
  lines.push(p.details || '(none)');
  lines.push('----------------------------------------');
  if (p.file_urls?.length) {
    lines.push(`Attachments (${p.file_urls.length}):`);
    for (const f of p.file_urls) {
      lines.push(`  - ${f.filename} (${f.size} bytes) ${f.url}`);
    }
    lines.push('----------------------------------------');
  }
  lines.push(`Submitted: ${p.submitted_at || new Date().toISOString()}`);
  lines.push(`Customer: ${SITE_NAME} customer — call ${FREEPHONE} if you cannot reach them.`);
  return lines.join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders(req)['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const headers = corsHeaders(req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  let raw: any = req.body;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = {}; }
  }
  if (!raw || typeof raw !== 'object') raw = {};

  const payload: LeadPayload = {
    source: trim(raw.source),
    name: trim(raw.name, 200),
    phone: trim(raw.phone, 80),
    email: trim(raw.email, 200),
    service: trim(raw.service),
    city: trim(raw.city, 100),
    details: trim(raw.details, MAX_LONG_FIELD),
    page: trim(raw.page, 500),
    referrer: trim(raw.referrer, 500),
    submitted_at:
      typeof raw.submitted_at === 'string' && raw.submitted_at.length < 60
        ? raw.submitted_at
        : new Date().toISOString(),
    file_urls: Array.isArray(raw.file_urls)
      ? raw.file_urls
          .filter((f: any) => f && typeof f === 'object' && typeof f.url === 'string')
          .slice(0, 20)
          .map((f: any) => ({
            filename: trim(f.filename, 200) || 'attachment',
            url: trim(f.url, 1000),
            size: Number.isFinite(+f.size) ? Math.max(0, Math.min(+f.size, 50 * 1024 * 1024)) : 0,
            mime: trim(f.mime, 120) || 'application/octet-stream',
          }))
      : [],
  };

  if (!payload.name || !payload.phone) {
    return res.status(400).json({ ok: false, error: 'missing_contact' });
  }

  const [appsOk, sgOk] = await Promise.all([
    forwardToAppsScript(payload),
    sendViaSendGrid(payload),
  ]);

  return res.status(200).json({
    ok: true,
    forwarded: appsOk,
    email: sgOk,
    file_count: payload.file_urls?.length || 0,
  });
}
