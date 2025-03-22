require('dotenv').config();
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.HYPERBOLIC_API_KEY;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API Key. Check environment variables.' });
  }

  try {
    const response = await axios.post(
      'https://api.hyperbolic.xyz/v1/chat/completions',
      {
        messages: [{ role: "user", content: message }],
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return res.status(200).json({ reply: response.data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'Unexpected API response structure' });
    }
  } catch (error) {
    console.error("AI API request failed:", error.response?.data || error.message);
    return res.status(500).json({ error: 'AI API request failed' });
  }
}
