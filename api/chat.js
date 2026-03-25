export default async function handler(req, res) {
  try {
    const { method } = req;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (method === 'OPTIONS') {
      return res.status(200).setHeader('Access-Control-Allow-Headers', 'Content-Type').headers(corsHeaders).send();
    }

    if (method !== 'POST') {
      return res.status(405).setHeader('Allow', 'POST').headers(corsHeaders).send('Method Not Allowed');
    }

    if (!req.body || !req.body.input || !req.body.genre || !req.body.tone || !req.body.style) {
      return res.status(400).headers(corsHeaders).json({ error: 'Invalid request body' });
    }

    const { input, genre, tone, style } = req.body;
    const systemPrompt = `Generate a ${genre} story/poem in the style of ${style} with a ${tone} tone. Use the following prompt: ${input}`;
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return res.status(200).headers(corsHeaders).json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).headers({ 'Access-Control-Allow-Origin': '*' }).json({ error: 'Internal Server Error' });
  }
}