import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import { useAuth } from '../contexts/useAuth';
import { defaultProfile } from '../data/mockData';
import { getUser, getUserByEmail } from '../services/api/users';
import './FlowPages.css';

const sideMenu = [
  { label: 'Profil Saya', to: '/profile' },
  { label: 'Kelas Saya', to: '/classes' },
  { label: 'Pesanan Saya', to: '/orders' }
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(() => ({
    ...defaultProfile,
    ...user,
    password: ''
  }));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const record = user?.id
          ? await getUser(user.id)
          : user?.email
            ? await getUserByEmail(user.email)
            : null;
        if (!record) {
          throw new Error('Pengguna tidak ditemukan di resource users.');
        }
        if (active) {
          setProfile((current) => ({
            ...current,
            name: record.name || '',
            email: record.email || '',
            phone: record.phone || '',
            gender: record.gender || 'Perempuan',
            password: ''
          }));
        }
      } catch (requestError) {
        if (active) setError(`Profil gagal dimuat: ${requestError.message}`);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (!saved) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSaved(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [saved]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    const { name, email, phone, gender } = profile;
    setSaving(true);
    setError('');
    try {
      const updatedUser = await updateUser({ name, email, phone, gender });
      setProfile((current) => ({ ...current, ...updatedUser, password: '' }));
      setSaved(true);
    } catch (requestError) {
      setError(`Profil gagal disimpan: ${requestError.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flow-page">
      <Header />
      <main className="page-shell profile-shell">
        <aside className="sidebar-panel">
          <div className="side-menu">
            {sideMenu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `side-item${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="profile-card">
          {profileLoading && <p role="status">Memuat profil...</p>}
          <div className="profile-avatar">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
              alt="Foto profil"
            />
            <div>
              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-email">{profile.email}</p>
              <button type="button" className="secondary-button" style={{ marginTop: 12 }}>Ganti Foto Profil</button>
            </div>
          </div>

          <div className="profile-form">
            <div className="field field--full">
              <label htmlFor="name">Nama Lengkap</label>
              <input id="name" name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input id="email" name="email" type="email" value={profile.email} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="phone">No. Hp</label>
              <input id="phone" name="phone" value={profile.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="gender">Jenis Kelamin</label>
              <select id="gender" name="gender" value={profile.gender} onChange={handleChange}>
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-Laki</option>
              </select>
            </div>
            <div className="field field--full">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value="" readOnly autoComplete="off" />
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            {saved && <span role="status">Perubahan profil berhasil disimpan.</span>}
            {error && <span role="alert">{error}</span>}
          </div>
        </section>
      </main>
      {saved && (
        <div className="success-modal-backdrop" onClick={() => setSaved(false)}>
          <section
            className="success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-saved-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="success-modal-close"
              aria-label="Tutup notifikasi"
              onClick={() => setSaved(false)}
            >
              ×
            </button>
            <div className="success-modal-icon" aria-hidden="true">✓</div>
            <p className="success-modal-eyebrow">Profil diperbarui</p>
            <h2 id="profile-saved-title">Perubahan profil berhasil disimpan</h2>
            <p>Informasi profil terbaru Anda sudah tersimpan.</p>
            <button type="button" className="primary-button" onClick={() => setSaved(false)}>
              Mengerti
            </button>
          </section>
        </div>
      )}
      <Footer />
    </div>
  );
}
