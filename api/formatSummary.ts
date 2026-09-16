import type { VercelRequest, VercelResponse } from '@vercel/node';
import { performSummaryFormatting } from '../src/ai/serverFormatSummary';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context, result: assessResult, language, caregiverContext } = req.body || {};
    const apiKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean) as string[];
    
    const summaryText = await performSummaryFormatting(context, assessResult, language || 'en', apiKeys, caregiverContext);
    return res.status(200).json({ summary: summaryText });
  } catch (err) {
    console.error('[HEALNEST BACKEND DEBUG] /api/formatSummary Error:', err);
    return res.status(500).json({ error: 'Formatting failed', message: String(err) });
  }
}
