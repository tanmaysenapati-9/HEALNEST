import type { VercelRequest, VercelResponse } from '@vercel/node';
import { performAIChat } from '../src/ai/serverChat';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { history, newMessage, language } = req.body || {};
    const apiKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(Boolean) as string[];

    console.log(`[HEALNEST CHAT API] /api/chat called. Keys configured: ${apiKeys.length}. Message: "${String(newMessage).substring(0, 80)}"`);

    if (apiKeys.length === 0) {
      console.error('[HEALNEST CHAT API] No API keys found in environment. Check .env file for GEMINI_API_KEY_1.');
      return res.status(200).json({ response: 'HEALNEST AI is temporarily offline. Please check that API keys are configured in your .env file.' });
    }

    const responseText = await performAIChat(apiKeys, history || [], newMessage, language || 'en');
    console.log(`[HEALNEST CHAT API] Response ready, length: ${responseText.length}`);
    return res.status(200).json({ response: responseText });
  } catch (err) {
    console.error('[HEALNEST BACKEND DEBUG] /api/chat Error:', err);
    return res.status(200).json({ response: 'HEALNEST AI is temporarily unavailable. Please try again shortly, or use the Symptom Checker for structured guidance.' });
  }
}
