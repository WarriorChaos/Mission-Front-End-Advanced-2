import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexts/useAuth';
import './Header.css';
import logo from '../../../assets/videobelajar-logo.svg';

export default function Header({ logoOnly = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user?.name || 'Pengguna';
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  const menuItems = (
    <>
      <Link to="/profile" className="header-menu-item" onClick={closeMenu}>Profil Saya</Link>
      <Link to="/classes" className="header-menu-item" onClick={closeMenu}>Kelas Saya</Link>
      <Link to="/orders" className="header-menu-item" onClick={closeMenu}>Pesanan Saya</Link>
      <button type="button" className="header-menu-item header-menu-logout" onClick={handleLogout}>
        <span>Keluar</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M10 17l5-5-5-5M15 12H3m9-8h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );

  return (
    <header className={`header ${logoOnly ? 'header--logo-only' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          <Link to={isAuthenticated ? '/' : '/login'} className="header-logo" aria-label="Videobelajar, beranda">
            <img src={logo} alt="Videobelajar" />
          </Link>
          {!logoOnly && <nav className="header-nav header-nav-desktop" aria-label="Navigasi utama">
            {isAuthenticated ? (
              <>
                <Link to="/" className="header-link">Kategori</Link>
                <div className="header-account">
                  <button
                    type="button"
                    className="header-avatar-button"
                    aria-label={`Menu akun ${userName}`}
                    aria-expanded={menuOpen}
                    aria-controls="desktop-account-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <span className="header-avatar" aria-hidden="true">{initials}</span>
                  </button>
                  {menuOpen && (
                    <div className="header-dropdown" id="desktop-account-menu">
                      {menuItems}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="header-link">Masuk</Link>
                <Link to="/register" className="header-link">Daftar</Link>
              </>
            )}
          </nav>}

          {!logoOnly && isAuthenticated && (
            <button
              type="button"
              className={`header-menu-toggle ${menuOpen ? 'is-open' : ''}`}
              aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              aria-expanded={menuOpen}
              aria-controls="mobile-account-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>

        {!logoOnly && isAuthenticated && menuOpen && (
          <nav className="header-mobile-menu" id="mobile-account-menu" aria-label="Menu akun">
            <Link to="/" className="header-menu-item" onClick={closeMenu}>Kategori</Link>
            {menuItems}
          </nav>
        )}
      </div>
    </header>
  );
}
