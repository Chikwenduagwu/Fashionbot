const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const MODEL = 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b';

// Your SYSTEM_PROMPT here (customized for fashion shop)

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  console.log('Received message:', userMessage); // For debugging
  try {
    const response = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150, // Reduce for faster response
      temperature: 0.7
    }, {
      headers: { Authorization: `Bearer ${FIREWORKS_API_KEY}` }
    });

    const aiReply = response.data.choices[0].message.content;
    ctx.reply(aiReply);
  } catch (error) {
    console.error('AI Error:', error.message); // Log for Vercel
    ctx.reply('Oops, something went wrong. Try again!');
  }
});

module.exports = bot; // Export for webhook

// In a separate api/index.js or adjust webhook.js to include handler
async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Webhook Error:', err);
      res.status(500).json({ error: 'Internal error' });
    }
  } else {
    res.status(200).json({ message: 'Bot is running' });
  }
}

module.exports = handler; // Vercel calls this
