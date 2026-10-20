import { Link } from 'react-router-dom';
import '../../pages/FlowPages.css';

export default function AlreadyOwnedModal() {
  return (
    <div className="success-modal-backdrop">
      <section
        className="success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-owned-title"
      >
        <div className="success-modal-icon" aria-hidden="true">✓</div>
        <p className="success-modal-eyebrow">Kelas tersedia</p>
        <h2 id="course-owned-title">Kelas sudah tersedia</h2>
        <p>Kelas ini sudah Anda miliki. Silakan buka Kelas Saya untuk mulai belajar.</p>
        <div className="result-actions">
          <Link to="/classes" className="primary-button">Buka Kelas Saya</Link>
          <Link to="/" className="secondary-button">Jelajahi Kelas</Link>
        </div>
      </section>
    </div>
  );
}
