// Returns a one-time upload token for direct browser → Vercel Blob uploads.
// This bypasses Vercel's 4.5MB serverless function body limit (Vercel Blob
// accepts streaming uploads up to 500MB).
//
// Browser flow:
//   1. POST {type: 'blob.generate-client-token', payload: {pathname, ...}} here
//   2. Receive {clientToken, uploadUrl}
//   3. PUT file directly to uploadUrl (large body, no serverless limit)
//   4. Receive {url} from Vercel Blob
//   5. POST the URL + form metadata to /api/submit-quote to finalize
//
// Astro APIRoute style — same pattern as the working /api/twilio/voice.

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const prerender = false;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'application/vnd.autocad.dwg', 'application/x-dwg', 'image/vnd.dwg', 'application/acad',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
  'application/vnd.ms-outlook', 'application/CDFV2',
  'text/plain', 'text/csv',
]);

const ALLOWED_EXT = new Set([
  'pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic',
  'dwg', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'msg', 'txt', 'csv',
]);

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file
const PATH_PREFIX = 'leads/maidstone/';

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST({ request }: { request: Request }) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders() },
    });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safe = String(pathname || '').replace(/^\/+/, '');
        if (!safe.startsWith(PATH_PREFIX)) {
          throw new Error('Pathname must start with ' + PATH_PREFIX);
        }
        if (safe.length > 250) {
          throw new Error('Pathname too long');
        }
        const ext = (safe.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXT.has(ext)) {
          throw new Error('Unsupported file type');
        }
        return {
          maximumSizeInBytes: MAX_FILE_BYTES,
          allowedContentTypes: [...ALLOWED_MIME],
          tokenPayload: JSON.stringify({ uploadedAt: Date.now() }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const ctx = tokenPayload ? JSON.parse(tokenPayload) : {};
          console.log('blob_uploaded', { url: blob.url, pathname: blob.pathname, ...ctx });
        } catch {
          console.log('blob_uploaded', { url: blob.url, pathname: blob.pathname });
        }
      },
    });

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders() },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'token_failed' }),
      { status: 400, headers: { 'content-type': 'application/json', ...corsHeaders() } }
    );
  }
}
