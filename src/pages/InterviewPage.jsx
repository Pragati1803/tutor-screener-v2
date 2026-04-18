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
  const { isListening, isSpeaking, speak, startListening, stopListening } = useSpeech();
  const isInterviewDone = useRef(false);
  const messagesRef = useRef([]);
  const questionCountRef = useRef(0);
  const pulseRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (isListening) {
      pulseRef.current = setInterval(() => setPulseLevel(Math.random()), 150);
    } else {
      clearInterval(pulseRef.current);
      setPulseLevel(0);
    }
    return () => clearInterval(pulseRef.current);
  }, [isListening]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveText]);

  const ariaSpeak = useCallback((text, afterSpeak) => {
    setPhase(PHASES.ARIA_SPEAKING);
    setStatusText('Aria is speaking…');
    speak(text, afterSpeak);
  }, [speak]);

  const processAnswer = useCallback(async (candidateText) => {
    const currentMessages = messagesRef.current;
    const currentCount = questionCountRef.current;

    if (!candidateText || !candidateText.trim()) {
      setStatusText("Didn't catch that — please try again");
      setTimeout(() => listenToCandidate(), 1500);
      return;
    }

    setPhase(PHASES.PROCESSING);
    setStatusText('Got it — Aria is thinking…');
    setLiveText('');

    const userMsg = { role: 'user', content: candidateText };
    const updatedMessages = [...currentMessages, userMsg];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setTranscript(prev => [...prev, { speaker: candidate.name || 'You', text: candidateText }]);

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
        reply.toLowerCase().includes('best of luck') ||
        reply.toLowerCase().includes("we'll be in touch") ||
        reply.toLowerCase().includes('we will be in touch') ||
        newCount >= 6;

      if (isDone && !isInterviewDone.current) {
        isInterviewDone.current = true;
        ariaSpeak(reply, async () => {
          setPhase(PHASES.DONE);
          setStatusText('Generating your assessment…');
          const fullTranscript = finalMessages
            .filter((m, i) => i > 0)
            .map(m => `${m.role === 'user' ? (candidate.name || 'Candidate') : 'Aria'}: ${m.content}`)
            .join('\n');
          const assessment = await assessInterview(fullTranscript);
          onComplete(assessment, candidate);
        });
      } else {
        ariaSpeak(reply, () => listenToCandidate());
      }
    } catch (err) {
      console.error(err);
      setStatusText('Something went wrong — retrying…');
      setTimeout(() => listenToCandidate(), 2000);
    }
  }, [ariaSpeak, candidate, onComplete]);

  const listenToCandidate = useCallback(() => {
    setPhase(PHASES.LISTENING);
    setStatusText('Your turn — speak your answer');
    setLiveText('');

    startListening(
      (live) => setLiveText(live),       // update display as they speak
      (final) => processAnswer(final)    // called when they stop
    );
  }, [startListening, processAnswer]);

  // Initial greeting
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
        setStatusText('Connection error: ' + err.message);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseIcon = { loading: '⏳', aria_speaking: '🔊', listening: '🎙', processing: '⚙️', done: '✅' }[phase];

  return (
    <div className="interview-page">
      {/* Left panel */}
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
          <>
            <div className="mic-viz">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="mic-bar" style={{ height: `${8 + Math.floor(pulseLevel * 36)}px` }} />
              ))}
            </div>
            <button className="done-btn" onClick={() => stopListening()}>
              Done Speaking ✓
            </button>
          </>
        )}

        <div style={{ marginTop: 'auto', width: '100%' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min((questionCount / 5) * 100, 100)}%` }} />
          </div>
          <div className="progress-label">Question {Math.min(questionCount + 1, 5)} of 5</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="transcript-panel">
        <div className="transcript-header">Live Transcript</div>
        <div className="transcript-scroll">
          {transcript.map((entry, i) => (
            <div key={i} className={`transcript-entry ${entry.speaker === 'Aria' ? 'aria' : 'candidate'}`}>
              <div className="entry-speaker">{entry.speaker}</div>
              <div className="entry-text">{entry.text}</div>
            </div>
          ))}
          {liveText && phase === PHASES.LISTENING && (
            <div className="transcript-entry candidate live">
              <div className="entry-speaker">You (speaking…)</div>
              <div className="entry-text">{liveText}<span className="cursor">|</span></div>
            </div>
          )}
          {phase === PHASES.DONE && (
            <div className="transcript-entry system">
              <div className="entry-text">Interview complete — generating your report…</div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}
