export const config = { runtime: 'edge' };

const ASSESSMENT_PROMPT = `You are an expert hiring assessor for Cuemath. Review this interview transcript and assess the candidate.

Respond ONLY in this exact JSON format with no extra text or markdown:
{"dimensions":{"clarity":{"score":0,"justification":"","quote":""},"warmth":{"score":0,"justification":"","quote":""},"simplification":{"score":0,"justification":"","quote":""},"fluency":{"score":0,"justification":"","quote":""},"handling_confusion":{"score":0,"justification":"","quote":""}},"recommendation":"PASS","summary":""}

Scores are 1-5. recommendation must be exactly PASS, REVIEW, or REJECT.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { transcript } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        system: ASSESSMENT_PROMPT,
        messages: [{ role: 'user', content: `Interview transcript:\n\n${transcript}\n\nAssess this candidate.` }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI error', detail: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const assessment = JSON.parse(clean);

    return new Response(JSON.stringify(assessment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
