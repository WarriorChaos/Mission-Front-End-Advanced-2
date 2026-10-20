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
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!email || !password) {
      setError('Email dan kata sandi harus diisi');
      return;
    }

    // Attempt login
    try {
      const user = await login(email, password);
      if (user) {
        navigate('/');
      } else {
        setError('Email tidak ditemukan. Pastikan Anda sudah mendaftar terlebih dahulu.');
      }
    } catch (requestError) {
      setError(`Login simulasi gagal: ${requestError.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    // Placeholder untuk Google login - gunakan email dummy untuk demo
    try {
      if (await login('user@gmail.com', 'googlepass')) {
        navigate('/');
      } else {
        setError('Akun simulasi Google belum terdaftar. Silakan daftar terlebih dahulu.');
      }
    } catch (requestError) {
      setError(`Login simulasi gagal: ${requestError.message}`);
    }
  };

  return (
    <>
    <Header logoOnly />
    <div className="login-page">
      <AuthCard className="auth-page-container auth-login-container">
        <div className="auth-header">
          <h1 className="auth-title">Masuk ke Akun</h1>
          <p className="auth-subtitle">Yuk, lanjutin belajarmu di videobelajar.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <Input
            label="E-Mail"
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="Masukkan kata sandi Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Masuk
          </Button>

          <Button
            variant="secondary"
            fullWidth
            type="button"
            onClick={() => navigate('/register')}
          >
            Daftar
          </Button>
        </form>

        <AuthDivider />

        <GoogleButton 
          text="Masuk dengan Google"
          onClick={handleGoogleLogin}
        />
      </AuthCard>
    </div>
    </>
  );
}
