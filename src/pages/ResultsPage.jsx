const DIM_LABELS = { clarity: 'Communication Clarity', warmth: 'Warmth & Patience', simplification: 'Ability to Simplify', fluency: 'English Fluency', handling_confusion: 'Handling Confusion' };
const DIM_ICONS = { clarity: '💬', warmth: '❤️', simplification: '🧩', fluency: '🗣', handling_confusion: '🧘' };
const COLORS = { PASS: { bg: '#d1fae5', text: '#065f46' }, REVIEW: { bg: '#fef3c7', text: '#92400e' }, REJECT: { bg: '#fee2e2', text: '#991b1b' } };

function ScoreBar({ score }) {
  return (
    <div className="score-bar-wrap">
      {[1,2,3,4,5].map(n => <div key={n} className={`score-dot ${n <= score ? 'filled' : ''}`}/>)}
      <span className="score-num">{score}/5</span>
    </div>
  );
}

export default function ResultsPage({ assessment, candidate, onRestart }) {
  const { dimensions, recommendation, summary } = assessment;
  const rec = COLORS[recommendation] || COLORS.REVIEW;
  const overallScore = Math.round(Object.values(dimensions).reduce((s, d) => s + d.score, 0) / Object.keys(dimensions).length);

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <div className="results-logo">C</div>
          <div>
            <h1>Interview Assessment</h1>
            <p className="results-candidate">{candidate.name} · {candidate.role}</p>
          </div>
          <div className="rec-badge" style={{ background: rec.bg, color: rec.text }}>{recommendation}</div>
        </div>
        <div className="summary-card">
          <div className="summary-score">
            <span className="big-score">{overallScore}</span>
            <span className="score-denom">/5</span>
            <span className="score-label">Overall</span>
          </div>
          <p className="summary-text">{summary}</p>
        </div>
        <div className="dimensions-grid">
          {Object.entries(dimensions).map(([key, data]) => (
            <div key={key} className="dim-card">
              <div className="dim-header">
                <span className="dim-icon">{DIM_ICONS[key]}</span>
                <span className="dim-name">{DIM_LABELS[key]}</span>
              </div>
              <ScoreBar score={data.score} />
              <p className="dim-justification">{data.justification}</p>
              {data.quote && <div className="dim-quote"><span className="quote-mark">"</span>{data.quote}<span className="quote-mark">"</span></div>}
            </div>
          ))}
        </div>
        <div className="results-actions">
          <button className="action-btn primary" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="action-btn secondary" onClick={onRestart}>Start New Interview</button>
        </div>
      </div>
    </div>
  );
}
