import type { VercelRequest, VercelResponse } from '@vercel/node';
import { performAIExtraction } from '../src/ai/serverExtractor';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language } = req.body || {};
    const apiKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean) as string[];
    const result = await performAIExtraction(apiKeys, text, language || 'en');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Extraction failed', message: String(err) });
  }
}
