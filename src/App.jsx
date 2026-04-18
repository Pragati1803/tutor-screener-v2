import { useState } from 'react';
import WelcomePage from './pages/WelcomePage';
import InterviewPage from './pages/InterviewPage';
import ThankYouPage from './pages/ThankYouPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

export default function App() {
  const [view, setView] = useState('welcome');
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);

  function handleStart(info) { setCandidate(info); setView('interview'); }
  function handleComplete(data, cand) { setAssessment(data); setCandidate(cand); setView('thankyou'); }
  function handleViewResults() { setView('results'); }
  function handleRestart() { setView('welcome'); setCandidate(null); setAssessment(null); }

  return (
    <div className="app">
      {view === 'welcome'  && <WelcomePage onStart={handleStart} />}
      {view === 'interview' && <InterviewPage candidate={candidate} onComplete={handleComplete} />}
      {view === 'thankyou' && <ThankYouPage candidate={candidate} onViewResults={handleViewResults} />}
      {view === 'results'  && <ResultsPage assessment={assessment} candidate={candidate} onRestart={handleRestart} />}
    </div>
  );
}
