export default function ThankYouPage({ candidate, onViewResults }) {
  return (
    <div className="thankyou-page">
      <div className="thankyou-card">
        <div className="thankyou-icon">🎉</div>
        <div className="logo-mark" style={{ margin: '0 auto 1.5rem' }}><span>C</span></div>
        <h1>Thank you, {candidate?.name}!</h1>
        <p className="thankyou-subtitle">
          Your interview with Aria is complete. We really enjoyed learning about your teaching style and passion for <strong>{candidate?.role}</strong>.
        </p>

        <div className="thankyou-steps">
          <div className="thankyou-step">
            <div className="step-icon">📋</div>
            <div>
              <div className="step-title">Application received</div>
              <div className="step-desc">Your interview has been recorded and assessed</div>
            </div>
          </div>
          <div className="thankyou-step">
            <div className="step-icon">🔍</div>
            <div>
              <div className="step-title">Under review</div>
              <div className="step-desc">Our team will review your assessment within 2–3 business days</div>
            </div>
          </div>
          <div className="thankyou-step">
            <div className="step-icon">📬</div>
            <div>
              <div className="step-title">We'll reach out</div>
              <div className="step-desc">If selected, you'll hear from us via email with next steps</div>
            </div>
          </div>
        </div>

        <div className="thankyou-note">
          In the meantime, feel free to explore Cuemath's teaching resources and curriculum at <span style={{color: 'var(--cue-blue)'}}>cuemath.com</span>
        </div>

        <button className="start-btn" onClick={onViewResults} style={{ marginTop: '1.5rem' }}>
          View Your Assessment Report →
        </button>
      </div>
    </div>
  );
}
