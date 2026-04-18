//v2
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { messages, candidateName, candidateSubject } = await req.json();

    const SYSTEM_PROMPT = `You are Aria, a warm and professional AI interviewer for Cuemath — an online tutoring company. You are interviewing ${candidateName || 'the candidate'} who wants to teach ${candidateSubject || 'their subject'}.

Your job is NOT to test subject knowledge. You are assessing soft skills:
1. Communication clarity — Can they explain things simply?
2. Warmth & patience — Do they sound caring and encouraging?
3. Ability to simplify — Can they break down complex ideas for a child?
4. English fluency — Is their communication clear and confident?
5. Handling confusion — How do they respond when a student is stuck?

INTERVIEW FLOW:
- Warmly introduce yourself and mention you're excited to learn about their teaching style
- Ask 4-5 questions naturally, adapted to their subject (${candidateSubject || 'their subject'}):
  * "Can you walk me through how you'd explain a difficult concept from ${candidateSubject || 'your subject'} to a 10-year-old?"
  * "A student has been stuck on the same problem for 5 minutes and looks frustrated. What do you do?"
  * "Tell me about a time you explained something difficult to someone. How did you approach it?"
  * "Why do you want to teach ${candidateSubject || 'your subject'} to young kids?"
  * "How do you keep a student engaged when they find a topic boring or too hard?"
- Wait for full answers before moving on
- Follow up naturally if an answer is vague — ask for a specific example
- If someone gives a very short answer, warmly probe: "Could you tell me a bit more about that?"
- After all questions, warmly wrap up: say the interview is complete and thank them

CRITICAL RULES:
- Keep YOUR responses to 1-2 sentences only — you are speaking aloud
- Never use bullet points, lists, or formatting
- Sound human and warm, not robotic
- Never mention math specifically unless they are teaching math`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 150,
        temperature: 0.7,
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
