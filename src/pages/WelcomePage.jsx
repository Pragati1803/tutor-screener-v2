import { useState } from 'react';

export default function WelcomePage({ onStart }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [checked, setChecked] = useState(false);
  const canStart = name.trim() && role.trim() && checked;

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="logo-mark"><span>C</span></div>
        <h1>Cuemath Tutor Interview</h1>
        <p className="subtitle">
          You'll have a short voice conversation with Aria, our AI interviewer.
          The session takes about 8–10 minutes. Speak naturally — we're looking for your teaching style.
        </p>
        <div className="steps">
          <div className="step"><span className="step-num">01</span><span>Aria asks you 4–5 questions</span></div>
          <div className="step"><span className="step-num">02</span><span>You answer by speaking aloud</span></div>
          <div className="step"><span className="step-num">03</span><span>We generate a structured report</span></div>
        </div>
        <div className="form-group">
          <label>Your full name</label>
          <input type="text" placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Subject you teach / want to teach</label>
          <input type="text" placeholder="e.g. Middle school math" value={role} onChange={e => setRole(e.target.value)} />
        </div>
        <label className="checkbox-label">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
          <span>I allow this session to be recorded and assessed by Cuemath</span>
        </label>
        <div className="browser-note">⚠ Use <strong>Google Chrome</strong> for best voice support. Allow microphone access when prompted.</div>
        <button className="start-btn" disabled={!canStart} onClick={() => onStart({ name: name.trim(), role: role.trim() })}>
          Begin Interview →
        </button>
      </div>
    </div>
  );
}
