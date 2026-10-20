import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiDownload,
  FiHome,
  FiStar
} from 'react-icons/fi';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import certificateTemplateUrl from '../assets/certificate-template.svg';
import certificateTemplateMarkup from '../assets/certificate-template.svg?raw';
import {
  getCourseCompletionDate,
  getCourseScopedStepId,
  readCompletedStepIds
} from '../data/learningProgress';
import { getDevelopmentCurriculumByCourseId } from '../data/curricula';
import { useAuth } from '../contexts/useAuth';
import { hasPurchasedCourse } from '../data/userPurchases';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { getCurriculumByCourseId } from '../services/api/curricula';
import './CertificatePage.css';

const eligibleItemTypes = new Set(['pretest', 'video', 'summary', 'quiz', 'final_exam']);

function getRequiredStepIds(curriculum) {
  const moduleSteps = (Array.isArray(curriculum?.modules) ? curriculum.modules : [])
    .flatMap((module) => (
      Array.isArray(module.items)
        ? module.items
          .filter((item) => eligibleItemTypes.has(item.type))
          .map((item) => getCourseScopedStepId(
            curriculum.courseId,
            `module-item:${module.id}:${item.id}`
          ))
        : []
    ));
  const courseSteps = (Array.isArray(curriculum?.courseItems) ? curriculum.courseItems : [])
    .filter((item) => eligibleItemTypes.has(item.type))
    .map((item) => getCourseScopedStepId(
      curriculum.courseId,
      `course-item:course:${item.id}`
    ));

  return [...moduleSteps, ...courseSteps];
}

function CertificateArtwork({ courseTitle, participantName, completedAt }) {
  const displayDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' })
    .format(new Date(completedAt));

  return (
    <div className="certificate-artwork" aria-label={`Sertifikat ${courseTitle} untuk ${participantName}`}>
      <img src={certificateTemplateUrl} alt="" />
      <span className="certificate-artwork-logo">videobelajar</span>
      <div className="certificate-artwork-copy">
        <strong className="certificate-artwork-heading">Certificate</strong>
        <strong className="certificate-artwork-subheading">of Completion</strong>
        <span className="certificate-artwork-presented">Proudly presented to</span>
        <span className="certificate-artwork-participant">{participantName}</span>
        <span className="certificate-artwork-description">For successfully completing the course</span>
        <span className="certificate-artwork-course">{courseTitle}</span>
        <span className="certificate-artwork-date">{displayDate}</span>
      </div>
    </div>
  );
}

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function downloadCertificate({ course, participantName, completedAt }) {
  const displayDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' })
    .format(new Date(completedAt));
  const textLayer = `
    <g text-anchor="middle" font-family="Arial, sans-serif">
      <text x="205" y="191" text-anchor="start" fill="#f28b00" font-size="31" font-weight="700">videobelajar</text>
      <text x="800" y="281" fill="#007f40" font-size="84" font-weight="700">Certificate</text>
      <text x="800" y="338" fill="#222325" font-size="43" font-weight="600">of Completion</text>
      <text x="800" y="399" fill="#444" font-size="24">Proudly presented to</text>
      <text x="800" y="489" fill="#f3a900" font-family="Georgia, serif" font-size="62" font-style="italic" textLength="1050" lengthAdjust="spacingAndGlyphs">${escapeSvgText(participantName)}</text>
      <text x="800" y="541" fill="#444" font-size="22">For successfully completing the course</text>
      <text x="800" y="600" fill="#087c42" font-size="32" font-weight="700" textLength="1200" lengthAdjust="spacingAndGlyphs">${escapeSvgText(course.title)}</text>
      <text x="800" y="696" fill="#4a4a4a" font-size="20">${escapeSvgText(displayDate)}</text>
    </g>`;
  const certificateSvg = certificateTemplateMarkup.replace('</svg>', `${textLayer}</svg>`);
  const downloadUrl = URL.createObjectURL(
    new Blob([certificateSvg], { type: 'image/svg+xml;charset=utf-8' })
  );
  const link = document.createElement('a');
  const safeCourseTitle = course.title
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'course';
  link.href = downloadUrl;
  link.download = `Sertifikat-${safeCourseTitle}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function CertificateState({ message, isError = false }) {
  return (
    <main className="certificate-state">
      <p role={isError ? 'alert' : 'status'}>{message}</p>
      <Link to="/classes">Kembali ke Kelas Saya</Link>
    </main>
  );
}

export default function CertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders();
  const [curriculumState, setCurriculumState] = useState({
    courseId: null,
    data: null,
    loading: false,
    error: ''
  });
  const [downloadError, setDownloadError] = useState('');

  const course = courses.find(
    (item) => String(item.id) === String(courseId) || item.slug === courseId
  );
  const hasAccess = course ? hasPurchasedCourse(orders, course.id) : false;
  const normalizedCourseId = course ? String(course.id) : null;

  useEffect(() => {
    if (!normalizedCourseId || !hasAccess || coursesLoading || ordersLoading) {
      return undefined;
    }

    let isCurrent = true;
    getCurriculumByCourseId(normalizedCourseId)
      .then((apiCurriculum) => {
        if (!isCurrent) {
          return;
        }
        setCurriculumState({
          courseId: normalizedCourseId,
          data: apiCurriculum
            || getDevelopmentCurriculumByCourseId(normalizedCourseId)
            || null,
          loading: false,
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
          loading: false,
          error: error instanceof Error ? error.message : 'Kurikulum gagal dimuat.'
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [normalizedCourseId, hasAccess, coursesLoading, ordersLoading]);

  if (coursesLoading || ordersLoading) {
    return <CertificateState message="Memuat sertifikat..." />;
  }
  if (coursesError || ordersError) {
    return <CertificateState message={`Sertifikat gagal dimuat: ${coursesError || ordersError}`} isError />;
  }
  if (!course) {
    return <CertificateState message="Course tidak ditemukan." isError />;
  }
  if (!hasAccess) {
    return <CertificateState message="Anda belum memiliki akses ke course ini." isError />;
  }
  if (curriculumState.courseId !== normalizedCourseId || curriculumState.loading) {
    return <CertificateState message="Memuat kurikulum..." />;
  }
  if (curriculumState.error) {
    return <CertificateState message={`Kurikulum gagal dimuat: ${curriculumState.error}`} isError />;
  }

  const requiredStepIds = getRequiredStepIds(curriculumState.data);
  const completedStepIds = readCompletedStepIds(user?.id);
  const isComplete = requiredStepIds.length > 0
    && requiredStepIds.every((stepId) => completedStepIds[stepId]);
  if (!isComplete) {
    return <CertificateState message="Sertifikat hanya tersedia setelah semua materi wajib diselesaikan." isError />;
  }

  const completionDate = getCourseCompletionDate(normalizedCourseId, user?.id) || new Date().toISOString();
  const instructorName = typeof course.instructor === 'string' && course.instructor.trim()
    ? course.instructor
    : '';
  const instructorRole = typeof course.instructorRole === 'string' && course.instructorRole.trim()
    ? course.instructorRole
    : '';
  const rating = typeof course.rating === 'number' ? course.rating : null;
  const reviews = typeof course.reviews === 'number' ? course.reviews : null;

  return (
    <div className="certificate-page">
      <Header />
      <main className="certificate-main">
        <nav className="certificate-breadcrumb" aria-label="Breadcrumb">
          <Link to="/"><FiHome aria-hidden="true" /><span>Beranda</span></Link>
          <span aria-hidden="true">/</span>
          <span className="certificate-breadcrumb-category">
            {typeof course.category === 'string' && course.category
              ? `${course.category[0].toLocaleUpperCase('id-ID')}${course.category.slice(1)}`
              : ''}
          </span>
          <span aria-hidden="true">/</span>
          <Link className="certificate-breadcrumb-course" to={`/course/${course.id}`} title={course.title}>
            {course.title}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="certificate-breadcrumb-current">Sertifikat</span>
        </nav>

        <article className="certificate-card">
          <div className="certificate-preview">
            <CertificateArtwork
              courseTitle={course.title}
              participantName={user?.name || 'Peserta'}
              completedAt={completionDate}
            />
          </div>

          <div className="certificate-details">
            <div className="certificate-course-info">
              <h1>{course.title}</h1>
              <p className="certificate-description">{course.description}</p>
              {instructorName && (
                <div className="certificate-instructor">
                  <span className="certificate-instructor-avatar" aria-hidden="true">
                    {instructorName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                  </span>
                  <span>
                    <strong>{instructorName}</strong>
                    {instructorRole && <small>{instructorRole}</small>}
                  </span>
                </div>
              )}
              {rating !== null && (
                <div className="certificate-rating">
                  <span className="certificate-stars" aria-label={`Rating ${rating} dari 5`}>
                    {[...Array(5)].map((_, index) => {
                      const starClass = index < Math.floor(rating)
                        ? 'is-filled'
                        : index < rating
                          ? 'is-half'
                          : '';
                      return <FiStar key={index} className={starClass} aria-hidden="true" />;
                    })}
                  </span>
                  <span>{rating.toFixed(1)}</span>
                  {reviews !== null && <span>({reviews} ulasan)</span>}
                </div>
              )}
            </div>
            <div className="certificate-download-area">
              <button
                className="certificate-download-button"
                type="button"
                onClick={() => {
                  setDownloadError('');
                  try {
                    downloadCertificate({
                      course,
                      participantName: user?.name || 'Peserta',
                      completedAt: completionDate
                    });
                  } catch (error) {
                    setDownloadError(error instanceof Error
                      ? error.message
                      : 'File sertifikat gagal dibuat.');
                  }
                }}
              >
                <FiDownload aria-hidden="true" />
                Download Sertifikat
              </button>
              {downloadError && <p className="certificate-download-error" role="alert">{downloadError}</p>}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
