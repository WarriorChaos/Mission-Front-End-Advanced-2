import './AuthDivider.css';

export default function AuthDivider({ text = 'atau' }) {
  return (
    <div className="auth-divider">
      <span className="auth-divider-text">{text}</span>
    </div>
  );
}
