import type { VercelRequest, VercelResponse } from '@vercel/node';
import { performAIExplanation } from '../src/ai/serverExplanation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { outcome, reason, carePathwayTemplate, language, caregiverContext } = req.body || {};
    const apiKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean) as string[];
    
    console.log('[HEALNEST BACKEND DEBUG] /api/explain called.');
    console.log(`[HEALNEST BACKEND DEBUG] Available API keys: ${apiKeys.length}`);
    
    const result = await performAIExplanation(apiKeys, outcome, reason, carePathwayTemplate, language || 'en', caregiverContext);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[HEALNEST BACKEND DEBUG] /api/explain Error:', err);
    return res.status(500).json({ error: 'Explanation failed', message: String(err) });
  }
}
