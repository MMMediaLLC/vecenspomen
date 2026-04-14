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

  const isShort = mainText.trim().split(/\s+/).length < 15;

  const prompt = `Си асистент за пишување меморијални текстови на македонски јазик. Твоја задача е да ${isShort ? 'го прошириш и разработиш' : 'го подобриш'} следниот текст во целосна, достоинствена порака.

КОНТЕКСТ:
- Тип на објава: ${type || 'ТАЖНА ВЕСТ'}
- Починат: ${fullName || ''}
${isShort ? `
БИДЕЈЌИ ТЕКСТОТ Е КРАТОК — прошири го во 3-5 реченици кои природно произлегуваат од дадените зборови. Користи го контекстот (тип на објава, ime на починатиот) за да создадеш топла, смислена порака. Сепак, не измислувај конкретни факти кои ги нема.
` : ''}
СТИЛ И ТОН:
- Достоинствен, тивок и емотивно смирен — никогаш мелодраматичен
- Топол и искрен, со длабока почит кон починатиот
- Формален македонски јазик, без разговорни изрази
- Јасни реченици — без непотребни украсувања
- Чувство на вечна меморија и љубов

СТРОГО ЗАБРАНЕТО:
- Никакви клише фрази ("отиде во подобар свет", "нека му е лесна земјата")
- Никакви религиозни изрази освен ако веќе ги има во оригиналот
- Никакво претерување или хиперболи

ФОРМАТ:
- Врати САМО финалниот текст, без воведи, објаснувања или коментари
- Зачувај ги сите имиња, датуми и факти од оригиналот точно

Оригинален текст: "${mainText}"

Подобрена верзија:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[RefineText] Gemini error:', response.status, errText);
      let errMsg = `Gemini ${response.status}`;
      try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
      return res.status(500).json({ error: errMsg });
    }

    const data = await response.json();
    console.log('[RefineText] Gemini response:', JSON.stringify(data).slice(0, 500));
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!refined) {
      const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || 'unknown';
      console.error('[RefineText] No refined text. Reason:', reason, JSON.stringify(data).slice(0, 300));
      return res.status(500).json({ error: `AI не врати резултат (${reason}).` });
    }

    return res.status(200).json({ refined });
  } catch (err) {
    console.error('[RefineText] Error:', err.message);
    return res.status(500).json({ error: 'Настана грешка при обработка.' });
  }
}
