import { useState } from 'react';
import './Footer.css';
import {
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaTwitter
} from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import logo from '../../../assets/videobelajar-logo.svg';

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <img
              src={logo}
              alt="Videobelajar"
              className="footer-logo"
            />
            <p className="footer-description">
              Gali Potensi Anda Melalui Pembelajaran Video di hariesok.id!
            </p>
            <p className="footer-address">
              Jl. Usman Effendi No. 50 Lowokwaru, Malang<br />
              +62-877-7123-1234
            </p>
          </div>

          <div
            className={`footer-section ${openSection === 'kategori' ? 'is-open' : ''
              }`}
          >
            <button
              type="button"
              className="footer-section-toggle"
              onClick={() =>
                setOpenSection(
                  openSection === 'kategori' ? null : 'kategori'
                )
              }
              aria-expanded={openSection === 'kategori'}
            >
              <span className="footer-title">Kategori</span>
              <FiChevronRight className="footer-chevron" aria-hidden="true" />
            </button>

            <ul className="footer-links">
              <li><a href="#digital-teknologi">Digital & Teknologi</a></li>
              <li><a href="#pemasaran">Pemasaran</a></li>
              <li><a href="#manajemen">Manajemen Bisnis</a></li>
              <li><a href="#pengembangan-diri">Pengembangan Diri</a></li>
              <li><a href="#desain">Desain</a></li>
            </ul>
          </div>

          <div
            className={`footer-section ${openSection === 'perusahaan' ? 'is-open' : ''
              }`}
          >
            <button
              type="button"
              className="footer-section-toggle"
              onClick={() =>
                setOpenSection(
                  openSection === 'perusahaan' ? null : 'perusahaan'
                )
              }
              aria-expanded={openSection === 'perusahaan'}
            >
              <span className="footer-title">Perusahaan</span>
              <FiChevronRight className="footer-chevron" aria-hidden="true" />
            </button>

            <ul className="footer-links">
              <li><a href="#tentang">Tentang Kami</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#kebijakan">Kebijakan Privasi</a></li>
              <li><a href="#ketentuan">Ketentuan Layanan</a></li>
              <li><a href="#bantuan">Bantuan</a></li>
            </ul>
          </div>

          <div
            className={`footer-section ${openSection === 'komunitas' ? 'is-open' : ''
              }`}
          >
            <button
              type="button"
              className="footer-section-toggle"
              onClick={() =>
                setOpenSection(
                  openSection === 'komunitas' ? null : 'komunitas'
                )
              }
              aria-expanded={openSection === 'komunitas'}
            >
              <span className="footer-title">Komunitas</span>
              <FiChevronRight className="footer-chevron" aria-hidden="true" />
            </button>

            <ul className="footer-links">
              <li><a href="#tips">Tips Sukses</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            ©2023 Gerobak Sayur All Rights Reserved.
          </p>
          <div className="footer-social">
            <a href="#linkedin" className="social-link" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="#facebook" className="social-link" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#instagram" className="social-link" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#twitter" className="social-link" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
