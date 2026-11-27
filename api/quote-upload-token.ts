import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { randomUUID } from 'node:crypto';

const APP_ID = 'maidstone';

function makePrefix(): string {
  return `leads/${APP_ID}/${Date.now()}-${randomUUID().slice(0, 8)}/`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const body = (await readJsonBody(req)) as HandleUploadBody;

    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const ALLOWED_EXTS = [
          '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic',
          '.dwg', '.doc', '.docx', '.xls', '.xlsx',
          '.zip', '.msg', '.txt', '.csv',
        ];
        const MAX_BYTES = 18 * 1024 * 1024;

        let filename = '';
        try {
          const p = JSON.parse(clientPayload || '{}');
          if (typeof p?.filename === 'string') filename = p.filename;
        } catch {
          filename = '';
        }

        const lower = filename.toLowerCase();
        const ok = ALLOWED_EXTS.some((ext) => lower.endsWith(ext));
        if (!ok) {
          throw new Error('file_type_not_allowed');
        }
        return {
          allowedContentTypes: [
            'application/pdf',
            'image/jpeg', 'image/png', 'image/webp', 'image/heic',
            'image/vnd.dwg', 'application/x-dwg', 'application/acad',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip', 'application/x-zip-compressed',
            'application/vnd.ms-outlook', 'message/rfc822',
            'text/plain', 'text/csv',
          ],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          pathnamePrefix: makePrefix(),
          tokenPayload: JSON.stringify({ app: APP_ID }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          console.log('[quote-upload]', {
            app: APP_ID,
            url: blob.url,
            size: blob.size ?? null,
            tokenPayload,
          });
        } catch {
          /* noop */
        }
      },
    });

    return res.status(200).json(json);
  } catch (err: any) {
    const msg = String(err?.message || err);
    const code =
      msg === 'file_type_not_allowed' ? 415 :
      msg === 'maximum_size_exceeded' ? 413 :
      400;
    return res.status(code).json({ ok: false, error: msg });
  }
}

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return req.body; }
  }
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
    });
    req.on('error', reject);
  });
}
