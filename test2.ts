import { performAIExtraction } from './src/ai/serverExtractor.ts';

async function run() {
  try {
    const keys = ['INVALID_KEY'];
    const result = await performAIExtraction(keys, 'मुझे बुखार है', 'hi');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
