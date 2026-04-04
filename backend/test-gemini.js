import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('API key not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function run() {
  try {
    const result = await model.generateContent('Say hello in 3 words.');
    console.log('SUCCESS:', result.response.text());
  } catch (error) {
    console.error('ERROR (gemini-2.5-flash):', error.message);
    
    // Fallback test
    try {
      console.log('Trying gemini-2.5-flash-lite...');
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const fallbackResult = await fallbackModel.generateContent('Say hello in 3 words.');
      console.log('SUCCESS (gemini-2.5-flash-lite):', fallbackResult.response.text());
    } catch (e2) {
      console.error('ERROR (gemini-2.5-flash-lite):', e2.message);
    }
  }
}
run();
