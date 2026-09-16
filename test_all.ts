import { performAIExtraction } from './src/ai/serverExtractor.js';
async function run() {
  const keys: string[] = []; // Fallback to heuristic
  const res1 = await performAIExtraction(keys, 'I have a fever and headache', 'en');
  console.log('EN:', res1.category);
  const res2 = await performAIExtraction(keys, 'मुझे बुखार है', 'hi');
  console.log('HI:', res2.category);
  const res3 = await performAIExtraction(keys, 'என் பல் வலிக்கிறது', 'ta');
  console.log('TA:', res3.category);
}
run();
