import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const keys = [
    { name: 'GEMINI_API_KEY_1', value: process.env.GEMINI_API_KEY_1 },
    { name: 'GEMINI_API_KEY_2', value: process.env.GEMINI_API_KEY_2 },
    { name: 'GEMINI_API_KEY_3', value: process.env.GEMINI_API_KEY_3 },
  ];
  
  const report = keys.map(k => ({
    name: k.name,
    configured: !!k.value,
    length: k.value?.length || 0,
    prefix: k.value ? `${k.value.substring(0, 8)}...` : 'NOT SET',
  }));

  return res.status(200).json({
    model: 'gemini-flash-lite-latest (with automated failover to gemini-3.5-flash)',
    keysConfigured: report.filter(k => k.configured).length,
    keys: report,
    note: 'Google Gemini API keys (supports AIza... and AQ... formats with multi-model failover).',
  });
}
