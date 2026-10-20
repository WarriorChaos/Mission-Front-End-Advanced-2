import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import AuthCard from '../components/auth/AuthCard/AuthCard';
import Input from '../components/common/Input/Input';
import PasswordInput from '../components/common/PasswordInput/PasswordInput';
import Button from '../components/common/Button/Button';
import AuthDivider from '../components/auth/AuthDivider/AuthDivider';
import GoogleButton from '../components/auth/GoogleButton/GoogleButton';
import Header from '../components/layout/Header/Header';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi harus sama');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    // Attempt registration
    try {
      const user = await register(
        formData.fullName,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword
      );
      if (user) {
        navigate('/');
      } else {
        setError('Pendaftaran gagal. Silahkan cek data Anda dan coba lagi');
      }
    } catch (requestError) {
      setError(`Pendaftaran gagal: ${requestError.message}`);
    }
  };

  const handleGoogleRegister = async () => {
    // Placeholder untuk Google registration - gunakan email dummy untuk demo
    try {
      const user = await login('user@gmail.com', 'googlepass')
        || await register('Google User', 'user@gmail.com', '08123456789', 'googlepass', 'googlepass');
      if (user) {
        navigate('/');
      }
    } catch (requestError) {
      setError(`Pendaftaran simulasi gagal: ${requestError.message}`);
    }
  };

  return (
    <>
    <Header logoOnly />
    <div className="register-page">
      <AuthCard className="auth-page-container">
        <div className="auth-header">
          <h1 className="auth-title">Pendaftaran Akun</h1>
          <p className="auth-subtitle">Yuk, daftarkan akunmu sekarang juga!</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            value={formData.fullName}
            onChange={handleChange}
            name="fullName"
            required
          />

          <Input
            label="E-Mail"
            type="email"
            placeholder="Masukkan email Anda"
            value={formData.email}
            onChange={handleChange}
            name="email"
            required
          />

          <div className="form-group-phone">
            <label className="phone-input-label">
              No. Hp <span className="input-required">*</span>
            </label>
            <div className="phone-input-group">
              <div className="country-code">
                <span className="country-flag">🇮🇩</span>
                <span className="country-code-text">+62</span>
              </div>
              <input
                type="tel"
                placeholder="8xxxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                name="phone"
                className="phone-control"
                required
              />
            </div>
          </div>

          <PasswordInput
            label="Kata Sandi"
            placeholder="Masukkan kata sandi Anda"
            value={formData.password}
            onChange={handleChange}
            name="password"
            required
          />

          <PasswordInput
            label="Konfirmasi Kata Sandi"
            placeholder="Konfirmasi kata sandi Anda"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            required
          />

          <div className="auth-forgot-password">
            <Link to="#lupa-password" className="forgot-link">Lupa Password?</Link>
          </div>

          <Button
            variant="primary"
            fullWidth
            type="submit"
          >
            Daftar
          </Button>

          <Button
            variant="secondary"
            fullWidth
            type="button"
            onClick={() => navigate('/login')}
          >
            Masuk
          </Button>
        </form>

        <AuthDivider />

        <GoogleButton 
          text="Daftar dengan Google"
          onClick={handleGoogleRegister}
        />
      </AuthCard>
    </div>
    </>
  );
}
