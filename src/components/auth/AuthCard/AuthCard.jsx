import './AuthCard.css';

export default function AuthCard({ children, className = '' }) {
  return (
    <div className={`auth-container ${className}`.trim()}>
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}
