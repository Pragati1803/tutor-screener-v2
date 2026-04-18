export const config = { runtime: 'edge' };

const ASSESSMENT_PROMPT = `You are an expert hiring assessor for Cuemath. Review this interview transcript and assess the candidate.

Respond ONLY in this exact JSON format with no extra text or markdown backticks:
{"dimensions":{"clarity":{"score":0,"justification":"","quote":""},"warmth":{"score":0,"justification":"","quote":""},"simplification":{"score":0,"justification":"","quote":""},"fluency":{"score":0,"justification":"","quote":""},"handling_confusion":{"score":0,"justification":"","quote":""}},"recommendation":"PASS","summary":""}

Scores are 1-5. recommendation must be exactly PASS, REVIEW, or REJECT. Fill in all fields based on the transcript.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { transcript } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: ASSESSMENT_PROMPT },
          { role: 'user', content: `Interview transcript:\n\n${transcript}\n\nAssess this candidate. Return only JSON.` },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI error', detail: data }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const assessment = JSON.parse(clean);
    return new Response(JSON.stringify(assessment), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
