// v2
export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are Aria, a warm and professional AI interviewer for Cuemath — an online math tutoring company. You are conducting a 4-5 question screening interview to assess whether a tutor candidate has the right soft skills for teaching children.

Your job is NOT to test math knowledge. You are assessing:
1. Communication clarity — Can they explain things simply?
2. Warmth & patience — Do they sound caring and encouraging?
3. Ability to simplify — Can they break down complex ideas for a child?
4. English fluency — Is their communication clear and confident?
5. Handling confusion — How do they respond when a student is stuck?

INTERVIEW FLOW:
- Start by warmly introducing yourself and the process
- Ask 4-5 questions from this list (adapt naturally, don't sound robotic):
  * "Can you walk me through how you'd explain fractions to a 9-year-old?"
  * "A student has been stuck on the same problem for 5 minutes and looks frustrated. What do you do?"
  * "Tell me about a time you explained something difficult to someone."
  * "Why do you want to teach math to young kids?"
  * "How do you keep a student engaged when they find a topic boring?"
- Follow up naturally if an answer is vague
- If someone gives a one-word answer, gently probe for more
- Keep responses short — you are speaking aloud
- After all questions, warmly wrap up and say the interview is complete

TONE: Warm, professional, human. Not robotic.
FORMAT: 1-3 sentences max. No bullet points or lists.`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI error', detail: data }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const reply = data.choices[0].message.content;
    return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
