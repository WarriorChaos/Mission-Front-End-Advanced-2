import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiGlobe,
  FiPlayCircle,
  FiUsers
} from 'react-icons/fi';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import AlreadyOwnedModal from '../components/common/AlreadyOwnedModal';
import CourseCard from '../components/home/CourseCard/CourseCard';
import { formatCurrency } from '../data/mockData';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { hasPurchasedCourse } from '../data/userPurchases';
import { getDevelopmentCurriculumByCourseId } from '../data/curricula';
import { getCurriculumByCourseId } from '../services/api/curricula';
import './CourseDetailPage.css';

const reviewQuotes = [
  'Materinya terstruktur dan mudah diikuti. Saya bisa langsung menerapkan apa yang dipelajari ke pekerjaan sehari-hari.',
  'Penjelasan tutornya jelas dan praktis. Kelas ini membantu saya lebih percaya diri mengembangkan kemampuan baru.'
];

function RatingStars({ rating }) {
  return (
    <span className="rating-stars" aria-hidden="true">
      {[...Array(5)].map((_, index) => {
        const starClass = index < Math.floor(rating)
          ? 'is-filled'
          : index < rating
            ? 'is-half'
            : 'is-empty';
        return <span className={`rating-star ${starClass}`} key={index}>★</span>;
      })}
    </span>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [showOwnedNotice, setShowOwnedNotice] = useState(false);
  const [openModule, setOpenModule] = useState(0);
  const [curriculumState, setCurriculumState] = useState({
    courseId: null,
    data: null,
    error: ''
  });
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders();
  const course = courses.find(
    (item) => String(item.id) === String(courseId) || item.slug === courseId
  );
  const isCourseOwned = course ? hasPurchasedCourse(orders, course.id) : false;
  const relatedCourses = courses.filter((item) => String(item.id) !== String(course?.id)).slice(0, 3);
  const normalizedCourseId = course ? String(course.id) : null;

  useEffect(() => {
    if (!normalizedCourseId) {
      return undefined;
    }

    let isCurrent = true;
    getCurriculumByCourseId(normalizedCourseId)
      .then((curriculum) => {
        if (!isCurrent) {
          return;
        }
        setCurriculumState({
          courseId: normalizedCourseId,
          data: curriculum || getDevelopmentCurriculumByCourseId(normalizedCourseId) || null,
          error: ''
        });
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }
        setCurriculumState({
          courseId: normalizedCourseId,
          data: null,
          error: error instanceof Error ? error.message : 'Kurikulum gagal dimuat.'
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [normalizedCourseId]);

  const activeCurriculumState = curriculumState.courseId === normalizedCourseId
    ? curriculumState
    : { courseId: normalizedCourseId, data: null, error: '' };
  const curriculumLoading = Boolean(normalizedCourseId && curriculumState.courseId !== normalizedCourseId);
  const curriculumModules = Array.isArray(activeCurriculumState.data?.modules)
    ? [...activeCurriculumState.data.modules].sort((left, right) => left.order - right.order)
    : [];
  const courseModules = curriculumModules.length > 0
    ? curriculumModules
    : (Array.isArray(course?.modules) ? course.modules.map((title, index) => ({
      id: `${index}-${title}`,
      title,
      order: index + 1,
      items: []
    })) : []);

  const handlePurchase = () => {
    if (!course || ordersLoading || ordersError) {
      return;
    }
    if (hasPurchasedCourse(orders, course.id)) {
      setShowOwnedNotice(true);
      return;
    }
    navigate(`/checkout/${course.id}`);
  };

  if (coursesLoading || ordersLoading) {
    return <div className="flow-page"><Header /><main className="page-shell"><p role="status">Memuat detail course...</p></main><Footer /></div>;
  }

  if (coursesError || ordersError || !course) {
    const message = coursesError || ordersError || 'Course tidak ditemukan.';
    return <div className="flow-page"><Header /><main className="page-shell"><p role="alert">Detail course gagal dimuat: {message}</p></main><Footer /></div>;
  }

  return (
    <div className="flow-page course-detail-page">
      <Header />
      <main className="course-detail-layout">
        <nav className="course-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <span>{course.category}</span>
          <span aria-hidden="true">/</span>
          <span className="breadcrumb-current">{course.title}</span>
        </nav>

        <section
          className="course-hero"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(15, 17, 20, .88), rgba(15, 17, 20, .58)), url("${course.image}")` }}
        >
          <div className="course-hero-copy">
            <h1>{course.title}</h1>
            <p>Belajar bersama tutor profesional di Video Course. Kapanpun, di manapun.</p>
            <div className="course-hero-rating" aria-label={`Rating ${course.rating} dari 5`}>
              <RatingStars rating={course.rating} />
              <span className="rating-value">{course.rating.toFixed(1)}</span>
              <span className="rating-count">({course.reviews} ulasan)</span>
            </div>
          </div>
        </section>

        <div className="course-detail-columns">
          <div className="course-detail-main">
            <section className="course-info-panel">
              <h2>Deskripsi</h2>
              <p>{course.description}</p>
            </section>

            <section className="course-info-panel">
              <h2>Belajar bersama Tutor Profesional</h2>
              <div className="tutor-grid">
                {[0, 1].map((tutor) => (
                  <article className="tutor-card" key={`${course.id}-tutor-${tutor}`}>
                    <div className="tutor-heading">
                      <span className="person-avatar" aria-hidden="true">
                        {course.instructor.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                      </span>
                      <div>
                        <h3>{course.instructor}</h3>
                        <p>{course.instructorRole}</p>
                      </div>
                    </div>
                    <p className="tutor-bio">
                      Berpengalaman membagikan wawasan praktis dan mendampingi peserta membangun kemampuan profesional.
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="course-info-panel curriculum-panel">
              <h2>Kamu akan Mempelajari</h2>
              <div className="curriculum-list">
                {curriculumLoading ? (
                  <p className="curriculum-unavailable" role="status">Memuat rincian materi...</p>
                ) : activeCurriculumState.error ? (
                  <p className="curriculum-unavailable" role="alert">
                    Rincian materi gagal dimuat: {activeCurriculumState.error}
                  </p>
                ) : courseModules.length > 0 ? courseModules.map((module, index) => {
                  const isOpen = openModule === index;
                  const items = Array.isArray(module.items)
                    ? [...module.items].sort((left, right) => left.order - right.order)
                    : [];
                  return (
                    <div className={`curriculum-module ${isOpen ? 'is-open' : ''}`} key={module.id}>
                      <button
                        type="button"
                        className="curriculum-toggle"
                        onClick={() => setOpenModule(isOpen ? -1 : index)}
                        aria-expanded={isOpen}
                      >
                        <span>{module.title}</span>
                        <FiChevronDown aria-hidden="true" />
                      </button>
                      {isOpen && (
                        <div className="curriculum-lessons">
                          {items.length > 0
                            ? items.map((item) => (
                              <div className="curriculum-lesson" key={item.id}>
                                <FiCheckCircle aria-hidden="true" />
                                <span>{item.title}</span>
                              </div>
                            ))
                            : (
                              <p className="curriculum-unavailable">
                                Rincian materi untuk modul ini belum tersedia.
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="curriculum-unavailable">Daftar materi course belum tersedia.</p>
                )}
              </div>
              {Array.isArray(course.learning) && course.learning.length > 0 && (
                <div className="course-learning-objectives">
                  <h3>Tujuan Pembelajaran</h3>
                  <ul>
                    {course.learning.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="course-info-panel">
              <div className="reviews-heading">
                <h2>Rating dan Review</h2>
                <div className="reviews-overall">
                  <RatingStars rating={course.rating} />
                  <strong>{course.rating.toFixed(1)}</strong>
                  <span>{course.reviews} ulasan</span>
                </div>
              </div>
              <div className="review-grid">
                {['Nadia Putri', 'Rizky Pratama'].map((name, index) => (
                  <article className="review-card" key={name}>
                    <div className="tutor-heading">
                      <span className="person-avatar review-avatar" aria-hidden="true">
                        {name.split(' ').map((part) => part[0]).join('')}
                      </span>
                      <div>
                        <h3>{name}</h3>
                        <p>Alumni kelas</p>
                      </div>
                    </div>
                    <p className="review-copy">{reviewQuotes[index]}</p>
                    <div className="review-score">
                      <RatingStars rating={course.rating} />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="course-purchase-panel">
            <h2>{course.title}</h2>
            <div className="purchase-price">
              <strong>{formatCurrency(course.price)}</strong>
              <del>{formatCurrency(course.oldPrice)}</del>
              <span>Diskon {course.discount}%</span>
            </div>
            <p className="limited-offer">Penawaran spesial untuk belajar lebih baik!</p>
            <button type="button" className="purchase-button" onClick={handlePurchase}>
              {isCourseOwned ? 'Kelas Sudah Tersedia' : 'Beli Sekarang'}
            </button>

            <h3>Kelas Ini Sudah Termasuk</h3>
            <div className="purchase-features">
              <span><FiCheckCircle aria-hidden="true" /> Ujian Akhir</span>
              <span><FiPlayCircle aria-hidden="true" /> {course.lessons} Video</span>
              <span><FiBookOpen aria-hidden="true" /> {course.modules.length} Modul</span>
              <span><FiCheckCircle aria-hidden="true" /> Sertifikat</span>
              <span><FiUsers aria-hidden="true" /> Akses Selamanya</span>
            </div>

            <h3>Bahasa Pengantar</h3>
            <p className="course-language"><FiGlobe aria-hidden="true" /> Bahasa Indonesia</p>
          </aside>
        </div>

        <section className="related-courses">
          <div className="related-heading">
            <div>
              <h2>Video Pembelajaran Terkait Lainnya</h2>
              <p>Ekspansi pengetahuan Anda dengan rekomendasi spesial kami</p>
            </div>
          </div>
          <div className="related-grid">
            {relatedCourses.map((relatedCourse) => (
              <Link
                key={String(relatedCourse.id)}
                to={`/course/${relatedCourse.id}`}
                className="related-course-link"
              >
                <CourseCard
                  {...relatedCourse}
                  instructor={{
                    name: relatedCourse.instructor,
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'
                  }}
                  instructorRole={relatedCourse.instructorRole}
                  reviews={relatedCourse.reviews}
                  price={formatCurrency(relatedCourse.price)}
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
      {showOwnedNotice && <AlreadyOwnedModal />}
      <Footer />
    </div>
  );
}
