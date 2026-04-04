/**
 * AI Routes — Chat, Rephrase, Translate, and Category Suggestion
 * These are public endpoints (no auth required for chatbot accessibility)
 */
import express from 'express';
import {
  handleChat,
  handleRephrase,
  handleTranslate,
  handleSuggestCategory,
} from '../controllers/aiController.js';

const router = express.Router();

// Chatbot conversation endpoint
router.post('/chat', handleChat);

// Complaint rephrase endpoint
router.post('/rephrase', handleRephrase);

// Text translation endpoint
router.post('/translate', handleTranslate);

// Auto-suggest complaint category
router.post('/suggest-category', handleSuggestCategory);

export default router;
