//v2
export const config = { runtime: 'edge' };

const QUESTION_BANK = {
  math: [
    "Can you walk me through how you'd explain fractions to a 9-year-old who has never heard the term before?",
    "How would you teach the concept of negative numbers to a young student who finds it confusing?",
    "A student keeps making the same mistake in long division. How do you help them without making them feel bad?",
    "How would you explain the Pythagoras theorem to a 12-year-old using a real-life example?",
    "How do you make multiplication tables fun and engaging for a child who dreads them?",
    "A student says they hate word problems. How do you change their mindset?",
    "How would you explain what a percentage is to a 10-year-old using something from daily life?",
    "How do you teach algebra to a student who struggles with abstract thinking?",
  ],
  science: [
    "How would you explain photosynthesis to an 8-year-old using something they can see every day?",
    "A student doesn't understand why the sky is blue. How do you explain it simply?",
    "How would you make the concept of atoms and molecules tangible for a young learner?",
    "How do you explain Newton's laws of motion in a way a 10-year-old would remember?",
    "A student is confused about the difference between a chemical and physical change. How do you clarify?",
    "How would you teach the water cycle in an engaging and memorable way?",
    "How do you explain gravity to a child who asks why we don't fall off the Earth?",
    "A student finds biology boring. How do you make the human body exciting to learn about?",
  ],
  english: [
    "How would you help a student who struggles with reading comprehension understand a passage better?",
    "A student can't understand the difference between 'their', 'there', and 'they're'. How do you teach it?",
    "How do you make creative writing exciting for a student who says they have nothing to write about?",
    "How would you explain what a metaphor is to a 10-year-old using examples from their life?",
    "A student finds Shakespeare impossible to understand. How do you make it accessible?",
    "How do you help a shy student improve their spoken English confidence?",
    "How would you teach essay structure to a student who writes everything in one long paragraph?",
    "A student makes the same grammar mistakes repeatedly. What's your approach to correcting them?",
  ],
  history: [
    "How do you make historical events feel relevant and exciting to students who think history is boring?",
    "How would you explain the causes of World War 1 to a 12-year-old in simple terms?",
    "A student struggles to remember dates and timelines. What techniques do you use to help them?",
    "How do you teach history from multiple perspectives without confusing young learners?",
    "How would you explain what colonialism is to a 10-year-old in an age-appropriate way?",
    "A student asks why we need to study things that happened hundreds of years ago. What do you say?",
    "How would you make a lesson about ancient civilizations come alive for a distracted student?",
    "How do you handle sensitive historical topics like slavery or war with young children?",
  ],
  geography: [
    "How would you explain the difference between weather and climate to a 9-year-old?",
    "A student can't visualize what a contour map means. How do you explain it?",
    "How do you make learning about different countries and cultures engaging for young students?",
    "How would you explain why earthquakes happen using simple, everyday language?",
    "A student struggles to understand time zones. How do you make it click for them?",
    "How do you teach map reading skills to a student who has never used a map before?",
    "How would you explain the concept of ecosystems to a 10-year-old?",
    "A student asks why some countries are rich and others are poor. How do you answer that honestly?",
  ],
  coding: [
    "How would you explain what a variable is to a 10-year-old who has never coded before?",
    "A student can't understand what a loop does. How do you explain it using a real-life analogy?",
    "How do you make coding feel creative and fun rather than just mechanical for young learners?",
    "How would you explain the concept of debugging to a frustrated student whose code won't work?",
    "A student asks why they need to learn coding. How do you motivate them?",
    "How do you explain what a function is to a student using something from everyday life?",
    "A student is overwhelmed by error messages. How do you teach them to read and handle errors?",
    "How would you introduce the concept of algorithms to a complete beginner using a non-coding example?",
  ],
  physics: [
    "How would you explain the concept of force and motion to a student using a simple experiment?",
    "A student doesn't understand the difference between speed and velocity. How do you clarify?",
    "How do you make electricity and circuits understandable for a 12-year-old?",
    "How would you explain what energy is and why it matters using everyday examples?",
    "A student struggles with the concept of waves — sound and light. How do you teach it simply?",
    "How do you explain magnetism to a young student in a way that sparks curiosity?",
    "A student finds thermodynamics confusing. How do you break it down?",
    "How would you explain why objects float or sink using something in the kitchen?",
  ],
  chemistry: [
    "How would you explain the periodic table to a student who finds it overwhelming?",
    "A student can't understand what a chemical reaction is. How do you explain it simply?",
    "How do you make acids and bases understandable using everyday examples like lemon juice?",
    "How would you explain what atoms and molecules are to a complete beginner?",
    "A student confuses mixtures and compounds. How do you clarify the difference?",
    "How do you make balancing chemical equations feel logical rather than confusing?",
    "How would you explain oxidation and reduction in simple terms to a 14-year-old?",
    "A student is nervous about lab experiments. How do you make them feel safe and confident?",
  ],
  default: [
    "How would you explain a difficult concept from your subject to a 10-year-old who has never seen it before?",
    "A student has been stuck on the same problem for 5 minutes and looks frustrated. What do you do?",
    "How do you keep a student engaged when they find your subject boring or too hard?",
    "Tell me about a time you explained something difficult to someone. How did you approach it?",
    "Why do you want to teach this subject to young kids specifically?",
    "A student says they're just not good at your subject and wants to give up. What do you say?",
    "How do you adapt your teaching style when a student isn't responding to your usual approach?",
    "How do you make your subject feel relevant and exciting to a disinterested student?",
  ],
};

function getQuestionsForSubject(subject) {
  if (!subject) return QUESTION_BANK.default;
  const s = subject.toLowerCase();
  if (s.includes('math') || s.includes('maths') || s.includes('algebra') || s.includes('calculus') || s.includes('arithmetic')) return QUESTION_BANK.math;
  if (s.includes('science') || s.includes('biology') || s.includes('life science')) return QUESTION_BANK.science;
  if (s.includes('english') || s.includes('literature') || s.includes('language') || s.includes('writing') || s.includes('grammar')) return QUESTION_BANK.english;
  if (s.includes('history') || s.includes('social studies') || s.includes('civics')) return QUESTION_BANK.history;
  if (s.includes('geo')) return QUESTION_BANK.geography;
  if (s.includes('cod') || s.includes('program') || s.includes('computer') || s.includes('software')) return QUESTION_BANK.coding;
  if (s.includes('physics')) return QUESTION_BANK.physics;
  if (s.includes('chem')) return QUESTION_BANK.chemistry;
  return QUESTION_BANK.default;
}

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { messages, candidateName, candidateSubject } = await req.json();

    const questions = pickRandom(getQuestionsForSubject(candidateSubject), 5);
    const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

    const SYSTEM_PROMPT = `You are Aria, a warm and professional AI interviewer for Cuemath — an online tutoring platform. You are interviewing ${candidateName || 'the candidate'} who wants to teach ${candidateSubject || 'their subject'}.

You have exactly 5 questions to ask. Ask them one at a time in order. Here are your 5 questions for this session:
${questionList}

RULES:
- Ask ONE question at a time. Wait for their answer before asking the next.
- After they answer, respond naturally to what they said (acknowledge, briefly comment if relevant), then ask the next question.
- If their answer is very short or vague, gently follow up: "Could you give me a specific example of that?"
- After they answer all 5 questions, say a warm closing like: "That's all my questions — thank you so much ${candidateName || ''}! It was wonderful speaking with you. We'll be in touch soon. Best of luck!"
- Keep YOUR responses to 1-3 sentences max. You are speaking aloud, not writing.
- Never use bullet points, lists, or numbered items in your responses.
- Sound warm, human, and encouraging — not robotic.
- Start by warmly greeting ${candidateName || 'the candidate'} and diving into question 1.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
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
