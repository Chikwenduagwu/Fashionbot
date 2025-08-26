const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const MODEL = 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b';

// System prompt for your fashion shop
const SYSTEM_PROMPT = `
You are a virtual assistant for Wisdom Fashion Hub, a trendy clothing store specializing in affordable streetwear for men and women. 
Only answer questions related to the shop, such as products, sizes, prices, opening hours, operations, returns, shipping, promotions, or styling advice. 
If the question is off-topic (e.g., about crypto, tech, politics), politely respond: "Sorry, I'm here to help with fashion shop inquiries only. Ask about our latest arrivals or hours!"
Keep responses helpful, witty, and under 200 words. Use a friendly tone.
Shop details: 
- Opening hours: Mon-Fri 10AM-8PM, Sat-Sun 11AM-6PM.
- Operations: Online orders ship within 2 days; in-store pickup available; we accept credit cards and cash.
- Products: T-shirts $20-30, jeans $40-60; men's and women's streetwear; brands like UrbanTrend.
- FAQs: Returns within 14 days with receipt; free shipping on orders over $50; custom orders available with 1-week lead time.
`;

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  console.log('Received message:', userMessage); // Debug log
  try {
    const response = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 100, // Reduced for faster response
      temperature: 0.7
    }, {
      headers: { Authorization: `Bearer ${FIREWORKS_API_KEY}` }
    });

    const aiReply = response.data.choices[0].message.content;
    ctx.reply(aiReply);
  } catch (error) {
    console.error('AI Error:', error.message); // Log for Vercel
    ctx.reply('Oops, something went wrong. Try again or contact the shop owner!');
  }
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  console.log('Webhook invoked:', req.method, req.url); // Debug
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('ok');
    } catch (error) {
      console.error('Webhook Error:', error.message);
      res.status(500).send('Internal error');
    }
  } else {
    res.status(200).send('Bot is running');
  }
};
