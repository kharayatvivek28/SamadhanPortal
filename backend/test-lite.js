import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testLiteLatest() {
  try {
    const list = await genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' }).generateContent('Hi');
    console.log('gemini-flash-lite-latest SUCCESS:', list.response.text());
  } catch (e) {
    console.error('gemini-flash-lite-latest FAIL:', e.message);
  }
}

testLiteLatest();
