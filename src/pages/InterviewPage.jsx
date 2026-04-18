import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { sendMessage, assessInterview } from '../api';

const PHASES = { LOADING: 'loading', ARIA_SPEAKING: 'aria_speaking', LISTENING: 'listening', PROCESSING: 'processing', DONE: 'done' };

export default function InterviewPage({ candidate, onComplete }) {
  const [phase, setPhase] = useState(PHASES.LOADING);
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [statusText, setStatusText] = useState('Starting your interview…');
  const [liveText, setLiveText] = useState('');
  const [pulseLevel, setPulseLevel] = useState(0);
  const { isListening, isSpeaking, speak, startListening } = useSpeech();
  const isInterviewDone = useRef(false);
  const pulseRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const messagesRef = useRef([]);
  const questionCountRef = useRef(0);

  useEffect(() => {
    if (isListening) {
      pulseRef.current = setInterval(() => setPulseLevel(Math.random()), 120);
    } else {
      clearInterval(pulseRef.current);
      setPulseLevel(0);
    }
    return () => clearInterval(pulseRef.current);
  }, [isListening]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const ariaSpeak = useCallback((text, afterSpeak) => {
    setPhase(PHASES.ARIA_SPEAKING);
    setStatusText('Aria is speaking…');
    speak(text, afterSpeak);
  }, [speak]);

  const processAnswer = useCallback(async (candidateText) => {
    const currentMessages = messagesRef.current;
    const currentCount = questionCountRef.current;

    if (!candidateText || !candidateText.trim()) {
      setStatusText('Didn\'t catch that — please speak clearly and try again');
      setTimeout(() => listenToCandidate(), 2000);
      return;
    }

    setPhase(PHASES.PROCESSING);
    setStatusText('Processing…');
    setLiveText('');

    const userMsg = { role: 'user', content: candidateText };
    const updatedMessages = [...currentMessages, userMsg];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setTranscript(prev => [...prev, { speaker: 'You', text: candidateText }]);

    try {
      const { reply } = await sendMessage(updatedMessages, candidate);
      const assistantMsg = { role: 'assistant', content: reply };
      const finalMessages = [...updatedMessages, assistantMsg];
      messagesRef.current = finalMessages;
      setMessages(finalMessages);
      setTranscript(prev => [...prev, { speaker: 'Aria', text: reply }]);

      const newCount = currentCount + 1;
      questionCountRef.current = newCount;
      setQuestionCount(newCount);

      const isDone =
        reply.toLowerCase().includes('interview is complete') ||
        reply.toLowerCase().includes('that concludes') ||
        reply.toLowerCase().includes('thank you for') ||
        reply.toLowerCase().includes('best of luck') ||
        newCount >= 6;

      if (isDone && !isInterviewDone.current) {
        isInterviewDone.current = true;
        ariaSpeak(reply, async () => {
          setPhase(PHASES.DONE);
          setStatusText('Generating your assessment…');
          const fullTranscript = finalMessages
            .filter(m => m.role !== 'user' || !m.content.includes('Please start the interview'))
            .map(m => `${m.role === 'user' ? candidate.name : 'Aria'}: ${m.content}`)
            .join('\n');
          const assessment = await assessInterview(fullTranscript);
          onComplete(assessment, candidate);
        });
      } else {
        ariaSpeak(reply, () => listenToCandidate());
      }
    } catch (err) {
      console.error(err);
      setStatusText('Error — retrying…');
      setTimeout(() => listenToCandidate(), 2000);
    }
  }, [ariaSpeak, candidate, onComplete]);

  const listenToCandidate = useCallback(() => {
    setPhase(PHASES.LISTENING);
    setStatusText('Your turn — speak your answer (speak for as long as you need)');
    setLiveText('');

    startListening(
      (interim) => setLiveText(interim),
      (finalText) => processAnswer(finalText)
    );
  }, [startListening, processAnswer]);

  useEffect(() => {
    const initMessages = [{
      role: 'user',
      content: `Hi, my name is ${candidate.name} and I want to teach ${candidate.role}. Please start the interview.`,
    }];

    (async () => {
      try {
        const { reply } = await sendMessage(initMessages, candidate);
        const aiMsg = { role: 'assistant', content: reply };
        const msgs = [...initMessages, aiMsg];
        messagesRef.current = msgs;
        setMessages(msgs);
        setTranscript([{ speaker: 'Aria', text: reply }]);
        ariaSpeak(reply, () => listenToCandidate());
      } catch (err) {
        setStatusText('Could not connect. Error: ' + err.message);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseIcon = { loading: '⏳', aria_speaking: '🔊', listening: '🎙', processing: '⚙️', done: '✅' }[phase];

  return (
    <div className="interview-page">
      <div className="aria-panel">
        <div className={`aria-avatar ${isSpeaking ? 'speaking' : ''} ${isListening ? 'dim' : ''}`}>
          <div className="aria-inner">A</div>
          {isSpeaking && (<><div className="ring ring-1"/><div className="ring ring-2"/><div className="ring ring-3"/></>)}
        </div>
        <div className="aria-name">Aria</div>
        <div className="aria-title">AI Interviewer · Cuemath</div>
        <div className="status-pill">
          <span className="status-icon">{phaseIcon}</span>
          <span>{statusText}</span>
        </div>
        {phase === PHASES.LISTENING && (
          <div className="mic-viz">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="mic-bar" style={{ height: `${12 + Math.random() * pulseLevel * 40}px` }} />
            ))}
          </div>
        )}
        {phase === PHASES.LISTENING && (
          <button
            onClick={() => {
              if (recognitionRef && recognitionRef.current) recognitionRef.current.stop();
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.25rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '99px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit'
            }}
          >
            Done Speaking ✓
          </button>
        )}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min((questionCount / 5) * 100, 100)}%` }} />
        </div>
        <div className="progress-label">Question {Math.min(questionCount + 1, 5)} of 5</div>
      </div>

      <div className="transcript-panel">
        <div className="transcript-header">Live Transcript</div>
        <div className="transcript-scroll">
          {transcript.map((entry, i) => (
            <div key={i} className={`transcript-entry ${entry.speaker === 'Aria' ? 'aria' : 'candidate'}`}>
              <div className="entry-speaker">{entry.speaker}</div>
              <div className="entry-text">{entry.text}</div>
            </div>
          ))}
          {liveText && (
            <div className="transcript-entry candidate live">
              <div className="entry-speaker">You (speaking…)</div>
              <div className="entry-text">{liveText}<span className="cursor">|</span></div>
            </div>
          )}
          {phase === PHASES.DONE && (
            <div className="transcript-entry system">
              <div className="entry-text">Interview complete. Generating assessment…</div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}
