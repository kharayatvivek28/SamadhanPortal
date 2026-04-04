/**
 * AI Service — Centralized Gemini API integration
 * Provides chat, rephrase, translate, detect language, and category suggestion
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─── System Prompts ──────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are a helpful government complaint assistant for the Samadhan Portal — a transparent complaint redressal system. Your role:
- Help users register complaints and navigate the website
- Answer FAQs about the complaint process
- Explain how to track complaints
- Be polite, concise, and actionable
- Available departments: Water Supply, Electricity, Roads & Infrastructure, Sanitation, Public Safety
- Keep responses under 100 words
- If asked about something unrelated to government complaints, politely redirect`;

const REPHRASE_PROMPT = `Rewrite the following complaint in a clear, polite, and formal way suitable for a government complaint portal. Keep it concise and structured. Maintain the core issue and facts. Do not add fictional details. Return ONLY the rewritten text, no explanations or headers.`;

const TRANSLATE_PROMPT = `Translate the following text into {targetLanguage}. Keep meaning accurate and simple. Return ONLY the translated text, no explanations, headers, or original text.`;

const DETECT_LANGUAGE_PROMPT = `Detect the language of the following text. Return ONLY one of these exact strings: "en" for English, "hi" for Hindi, "pa" for Punjabi. If unsure, return "en".`;

const SUGGEST_CATEGORY_PROMPT = `Based on the following complaint text, suggest the most appropriate government department from this list: Water Supply, Electricity, Roads & Infrastructure, Sanitation, Public Safety. Return ONLY the department name, nothing else.`;

// ─── Gemini Model Helper ─────────────────────────────────────────────────────

/**
 * Get a configured Gemini model instance
 * @param {string} systemInstruction - System prompt for the model
 * @returns {GenerativeModel}
 */
const getModel = (systemInstruction) => {
  return genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    systemInstruction,
  });
};

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Chat with AI — sends user message with conversation history
 * @param {string} message - User's current message
 * @param {Array} history - Previous messages [{role: 'user'|'model', parts: [{text}]}]
 * @returns {Promise<string>} AI response text
 */
export const chatWithAI = async (message, history = []) => {
  try {
    const model = getModel(CHAT_SYSTEM_PROMPT);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    throw new Error('Failed to get AI response. Please try again.');
  }
};

/**
 * Rephrase complaint text to be formal and clear
 * @param {string} text - Original complaint text
 * @returns {Promise<string>} Rephrased complaint
 */
export const rephraseComplaint = async (text) => {
  try {
    const model = getModel(REPHRASE_PROMPT);
    const result = await model.generateContent(text);
    return result.response.text();
  } catch (error) {
    console.error('Rephrase Error:', error.message);
    throw new Error('Failed to rephrase complaint. Please try again.');
  }
};

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language name (e.g., "Hindi", "Punjabi", "English")
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLanguage) => {
  try {
    const prompt = TRANSLATE_PROMPT.replace('{targetLanguage}', targetLanguage);
    const model = getModel(prompt);
    const result = await model.generateContent(text);
    return result.response.text();
  } catch (error) {
    console.error('Translate Error:', error.message);
    throw new Error('Failed to translate text. Please try again.');
  }
};

/**
 * Detect the language of input text
 * @param {string} text - Text to detect language of
 * @returns {Promise<string>} Language code: "en", "hi", or "pa"
 */
export const detectLanguage = async (text) => {
  try {
    const model = getModel(DETECT_LANGUAGE_PROMPT);
    const result = await model.generateContent(text);
    const lang = result.response.text().trim().toLowerCase();
    // Validate response is one of expected codes
    if (['en', 'hi', 'pa'].includes(lang)) return lang;
    return 'en'; // default fallback
  } catch (error) {
    console.error('Detect Language Error:', error.message);
    return 'en'; // Safe fallback
  }
};

/**
 * Suggest complaint category/department based on text
 * @param {string} text - Complaint description text
 * @returns {Promise<string>} Suggested department name
 */
export const suggestCategory = async (text) => {
  try {
    const model = getModel(SUGGEST_CATEGORY_PROMPT);
    const result = await model.generateContent(text);
    return result.response.text().trim();
  } catch (error) {
    console.error('Suggest Category Error:', error.message);
    throw new Error('Failed to suggest category.');
  }
};
