const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN); // Securely uses env var
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const MODEL = 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b';

// System prompt to restrict to fashion shop topics (customize with your details)
const SYSTEM_PROMPT = `
You are a virtual assistant for [Your Fashion Shop Name, e.g., Wisdom Fashion Hub], a trendy clothing store specializing in [briefly describe, e.g., affordable streetwear for men and women]. 
Only answer questions related to the shop, such as products, sizes, prices, opening hours, operations, returns, shipping, promotions, or styling advice. 
If the question is off-topic (e.g., about crypto, tech, politics, or anything unrelated), politely respond: "Sorry, I'm here to help with fashion shop inquiries only. Ask about our latest arrivals or hours!"
Keep responses helpful, witty, and under 200 words. Use a friendly tone.
Shop details: 
- Opening hours: [Add your hours, e.g., Mon-Fri 10AM-8PM, Sat-Sun 11AM-6PM].
- Operations: [e.g., Online orders ship within 2 days; in-store pickup available; we accept credit cards and cash].
- Products: [e.g., T-shirts $20-30, jeans $40-60; brands like XYZ; categories: men's, women's, accessories].
- Other FAQs: [Add 3-5 key ones, e.g., "Returns within 14 days with receipt."; "Free shipping on orders over $50."; "Custom orders available with 1-week lead time."].
`;

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  try {
    const response = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7 // Balanced creativity
    }, {
      headers: { Authorization: `Bearer ${FIREWORKS_API_KEY}` }
    });

    const aiReply = response.data.choices[0].message.content;
    ctx.reply(aiReply);
  } catch (error) {
    console.error(error);
    ctx.reply('Oops, something went wrong. Try again or contact the shop owner!');
  }
});

// For Vercel: Set up webhook
app.post('/api/webhook', bot.webhookCallback('/api/webhook'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
