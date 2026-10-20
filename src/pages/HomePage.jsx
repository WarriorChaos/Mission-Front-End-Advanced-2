import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import CourseCard from '../components/home/CourseCard/CourseCard';
import Button from '../components/common/Button/Button';
import { useCourses } from '../hooks/useCourses';
import './HomePage.css';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('semua-kelas');
  const navigate = useNavigate();
  const { courses, loading, error } = useCourses();

  const categories = [
    { id: 'semua-kelas', label: 'Semua Kelas' },
    { id: 'pemasaran', label: 'Pemasaran' },
    { id: 'desain', label: 'Desain' },
    { id: 'teknologi', label: 'Teknologi' },
    { id: 'bisnis', label: 'Bisnis' }
  ];

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'semua-kelas') return courses;
    return courses.filter((course) => course.category === activeCategory);
  }, [activeCategory, courses]);

  return (
    <div className="home-page">
      <Header />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Revolusi Pembelajaran: Temukan Ilmu Baru melalui Platform Video Interaktif!</h1>
          <p className="hero-description">
            Temukan ilmu baru yang menarik dan mendalam melalui koleksi video pembelajaran berkualitas tinggi.
            Tidak hanya itu, Anda juga dapat berpartisipasi dalam sesi interaktif yang akan meningkatkan pemahaman Anda.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Temukan Video Course untuk Dipelajari!
          </Button>
        </div>
      </section>

      <section className="courses-section" id="courses">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Koleksi Video Pembelajaran Unggulan</h2>
            <p className="section-subtitle">Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!</p>
          </div>

          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="course-grid">
            {loading && <p role="status">Memuat course...</p>}
            {error && <p role="alert">Course gagal dimuat: {error}</p>}
            {!loading && !error && filteredCourses.map((course) => {
              const cardCourse = {
                ...course,
                image: course.image,
                instructor: {
                  name: course.instructor,
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop'
                },
                instructorRole: course.instructorRole,
                rating: course.rating,
                reviews: `${course.rating.toFixed(1)} (${course.reviews})`,
                price: `Rp ${Math.round(course.price / 1000)}K`,
                description: course.description
              };

              return (
                <Link key={String(course.id)} to={`/course/${course.id}`} className="course-link-card">
                  <CourseCard {...cardCourse} />
                </Link>
              );
            })}
            {!loading && !error && filteredCourses.length === 0
              && <p className="empty-state">Belum ada course pada kategori ini.</p>}
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Mau Belajar Lebih Banyak?</h2>
            <p className="newsletter-description">
              Daftarkan email Anda untuk mendapatkan informasi terbaru dan penawaran spesial dari program-program terbaik kami.
            </p>
            <div className="newsletter-form">
              <input type="email" placeholder="Masukkan Email Anda" className="newsletter-input" />
              <Button variant="primary">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
