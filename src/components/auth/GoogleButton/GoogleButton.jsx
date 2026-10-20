import './GoogleButton.css';

export default function GoogleButton({ text = 'Masuk dengan Google', onClick }) {
  return (
    <button className="google-button" onClick={onClick} type="button">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <g clipPath="url(#clip0)">
          <path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.28h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.59z" fill="#4285F4"/>
          <path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.13-4.07 1.13-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.395 20.83 7.705 24 12.255 24z" fill="#34A853"/>
          <path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V7.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" fill="#FBBC05"/>
          <path d="M12.255 5.92c1.66 0 3.15.57 4.32 1.69l3.25-3.25C18.205 1.27 15.495 0 12.255 0 7.705 0 3.395 3.17 1.545 7.62l3.98 3.09c.95-2.85 3.6-4.79 6.73-4.79z" fill="#EA4335"/>
        </g>
      </svg>
      <span>{text}</span>
    </button>
  );
}
