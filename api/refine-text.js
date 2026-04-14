// api/refine-text.js
// Server-side Gemini AI text refinement — API key never exposed to browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI системот моментално не е достапен.' });
  }

  const { mainText, fullName, type } = req.body || {};
  if (!mainText?.trim()) {
    return res.status(400).json({ error: 'Нема текст за обработка.' });
  }

  const prompt = `Напиши достоен, формален и емотивно смирен текст за меморијално известување на македонски јазик. Тип: ${type || 'ТАЖНА ВЕСТ'}. Починат: ${fullName || ''}. Оригинален текст: "${mainText}". Врати само финалниот текст без воведни фрази или objаснувања.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[RefineText] Gemini error:', err);
      return res.status(500).json({ error: 'Грешка при обработка на текстот.' });
    }

    const data = await response.json();
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!refined) {
      return res.status(500).json({ error: 'AI не врати резултат.' });
    }

    return res.status(200).json({ refined });
  } catch (err) {
    console.error('[RefineText] Error:', err.message);
    return res.status(500).json({ error: 'Настана грешка при обработка.' });
  }
}
