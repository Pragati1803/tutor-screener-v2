export const config = { runtime: 'edge' };

const ASSESSMENT_PROMPT = `You are an expert hiring assessor for Cuemath. Review this interview transcript and assess the candidate.

You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no backticks. Just raw JSON.

The JSON must follow this exact structure:
{"dimensions":{"clarity":{"score":4,"justification":"Clear explanation given","quote":"short quote here"},"warmth":{"score":4,"justification":"Warm and encouraging tone","quote":"short quote here"},"simplification":{"score":4,"justification":"Good use of simple language","quote":"short quote here"},"fluency":{"score":4,"justification":"Fluent English throughout","quote":"short quote here"},"handling_confusion":{"score":4,"justification":"Handled confusion well","quote":"short quote here"}},"recommendation":"PASS","summary":"Two sentence summary here."}

Rules:
- scores are integers 1-5
- recommendation is exactly one of: PASS, REVIEW, REJECT
- quotes are short (under 10 words) taken directly from the transcript
- NO markdown, NO backticks, NO explanation outside the JSON`;

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
        max_tokens: 1200,
        temperature: 0.1,
        messages: [
          { role: 'system', content: ASSESSMENT_PROMPT },
          { role: 'user', content: `Here is the interview transcript to assess:\n\n${transcript}` },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Groq error', detail: data }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    let text = data.choices[0].message.content.trim();
    // Strip markdown if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    // Extract outermost JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const jsonStr = text.slice(start, end + 1);
    const assessment = JSON.parse(jsonStr);

    return new Response(JSON.stringify(assessment), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
