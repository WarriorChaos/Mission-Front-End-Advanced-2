import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { useAuth } from '../contexts/useAuth';
import { getCourseLearningProgress, readCompletedStepIds } from '../data/learningProgress';
import { getDevelopmentCurriculumByCourseId } from '../data/curricula';
import { getCurriculumByCourseId } from '../services/api/curricula';
import './FlowPages.css';

const statusClass = {
  Selesai: 'status-success',
  'Sedang Berjalan': 'status-warning'
};

const sideMenu = [
  { label: 'Profil Saya', to: '/profile' },
  { label: 'Kelas Saya', to: '/classes' },
  { label: 'Pesanan Saya', to: '/orders' }
];

export default function ClassesPage() {
  const { user } = useAuth();
  const { orders, loading, error } = useUserOrders();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const purchasedOrders = useMemo(
    () => orders.filter((order) => order.status === 'Berhasil'),
    [orders]
  );
  const purchasedClasses = [...new Map(
    purchasedOrders.map((order) => [
      String(order.courseId),
      courses.find((course) =>
        String(course.id) === String(order.courseId) || course.slug === order.courseId
      )
    ])
  ).entries()]
    .filter(([, course]) => course)
    .map(([courseId, course]) => ({
      id: `purchase-${courseId}`,
      courseId: course.id,
      title: course.title,
      teacher: course.instructor,
      status: 'Sedang Berjalan',
      progress: 0,
      duration: course.duration,
      lessons: course.lessons,
      image: course.image
    }));
  const purchasedCourseIdsKey = purchasedClasses.map((item) => String(item.courseId)).sort().join(',');
  const [curriculumState, setCurriculumState] = useState({
    userId: null,
    courseIdsKey: '',
    data: {}
  });
  const [activeTab, setActiveTab] = useState('Semua Kelas');
  const curriculaLoaded = curriculumState.userId === String(user?.id)
    && curriculumState.courseIdsKey === purchasedCourseIdsKey;
  const completedStepIds = readCompletedStepIds(user?.id);

  useEffect(() => {
    if (
      loading
      || coursesLoading
      || !user?.id
      || !purchasedCourseIdsKey
    ) {
      return undefined;
    }

    let isCurrent = true;
    const courseIds = purchasedCourseIdsKey.split(',');
    Promise.all(courseIds.map(async (courseId) => {
      try {
        const curriculum = await getCurriculumByCourseId(courseId)
          || getDevelopmentCurriculumByCourseId(courseId)
          || null;
        return [courseId, { curriculum, error: '' }];
      } catch (curriculumError) {
        return [courseId, {
          curriculum: null,
          error: curriculumError instanceof Error
            ? curriculumError.message
            : 'Kurikulum gagal dimuat.'
        }];
      }
    })).then((entries) => {
      if (isCurrent) {
        setCurriculumState({
          userId: String(user.id),
          courseIdsKey: purchasedCourseIdsKey,
          data: Object.fromEntries(entries)
        });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [loading, coursesLoading, user?.id, purchasedCourseIdsKey]);

  const classesWithProgress = purchasedClasses.map((item) => {
    const curriculumEntry = curriculumState.data[String(item.courseId)];
    const progress = getCourseLearningProgress(
      item.courseId,
      curriculumEntry?.curriculum,
      completedStepIds
    );
    return {
      ...item,
      progress: progress.progress,
      status: progress.isComplete ? 'Selesai' : 'Sedang Berjalan',
      curriculumError: curriculaLoaded ? curriculumEntry?.error : ''
    };
  });
  const filteredClasses = classesWithProgress.filter((item) =>
    activeTab === 'Semua Kelas' || item.status === activeTab
  );

  return (
    <div className="flow-page">
      <Header />
      <main className="page-shell classes-shell">
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

        <section className="content-panel">
          <div className="filter-bar">
            <div className="tab-set">
              {['Semua Kelas', 'Sedang Berjalan', 'Selesai'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab-button${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="class-list">
            {coursesLoading && <p role="status">Memuat data course...</p>}
            {coursesError && <p role="alert">Course gagal dimuat: {coursesError}</p>}
            {loading && <p role="status">Memuat kelas...</p>}
            {error && <p role="alert">Kelas gagal dimuat: {error}</p>}
            {!loading && !coursesLoading && purchasedCourseIdsKey && !curriculaLoaded
              && <p role="status">Memuat progress belajar...</p>}
            {!loading && !error && !coursesLoading && !coursesError && curriculaLoaded && filteredClasses.length ? filteredClasses.map((item) => (
              <div className="class-card" key={item.id}>
                <img src={item.image} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <div className="meta">{item.teacher}</div>
                  <div className="meta">{item.duration} • {item.lessons} Video</div>
                  {item.curriculumError && (
                    <p className="meta" role="alert">
                      Progress course gagal dimuat: {item.curriculumError}
                    </p>
                  )}
                  <div className="progress-wrap">
                    <div className="progress-label">
                      <span>Progress Kelas: {item.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`order-status ${statusClass[item.status] || 'status-info'}`}>{item.status}</span>
                  <div style={{ marginTop: 16 }}>
                    <Link to={`/learn/${encodeURIComponent(String(item.courseId))}`} className="primary-button">
                      Lanjutkan Pembelajaran
                    </Link>
                  </div>
                </div>
              </div>
            )) : !loading && !error && !coursesLoading && !coursesError && curriculaLoaded
              && <p className="empty-state">Belum ada kelas pada kategori ini.</p>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
