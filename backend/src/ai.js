const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function sanitizeDescription(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPrompt(title, tags = [], description = '') {
  const safeDescription = sanitizeDescription(description);
  const safeTags = Array.isArray(tags) && tags.length ? tags.join(', ') : 'none';

  return `Analyze this note and return ONLY valid JSON with these exact keys:
{
  "summary": "2-3 sentence overview",
  "action_items": ["action1", "action2"],
  "suggested_title": "concise title"
}

Title: ${title || '(untitled)'}
Tags: ${safeTags}
Content: ${safeDescription}`;
}

export async function generateNoteAI({ title, tags, description }) {
  if (!GEMINI_KEY && !OPENAI_KEY) {
    throw new Error('No AI API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env.');
  }

  const prompt = buildPrompt(title, tags, description);

  if (GEMINI_KEY) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini request failed: ${res.status} ${res.statusText} - ${body}`);
    }

    const data = await res.json();
    let txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Strip markdown code block formatting if present
    txt = txt.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Try to extract JSON from the response if it contains extra text
    const jsonStart = txt.indexOf('{');
    const jsonEnd = txt.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      txt = txt.substring(jsonStart, jsonEnd + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(txt || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Text that failed to parse:', txt);
      throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }

    return {
      summary: parsed.summary || '',
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
      suggested_title: parsed.suggested_title || '',
    };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${res.statusText} - ${body}`);
  }

  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(txt || '{}');

  return {
    summary: parsed.summary || '',
    action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    suggested_title: parsed.suggested_title || '',
  };
}
