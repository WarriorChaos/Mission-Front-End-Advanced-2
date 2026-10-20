import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCircle,
  FiGlobe,
  FiPlayCircle
} from 'react-icons/fi';
import AlreadyOwnedModal from '../components/common/AlreadyOwnedModal';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import { formatCurrency, paymentMethods } from '../data/mockData';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { hasPurchasedCourse } from '../data/userPurchases';
import './CheckoutPayment.css';

const paymentGroups = [
  { id: 'bank', title: 'Transfer Bank' },
  { id: 'ewallet', title: 'E-Wallet' },
  { id: 'card', title: 'Kartu Kredit/Debit' }
];

const paymentLogoSources = {
  bca: "/payment-logos/bca.svg",
  bni: "/payment-logos/bni.svg",
  bri: "/payment-logos/bri.svg",
  mandiri: "/payment-logos/mandiri.svg",
  dana: "/payment-logos/dana.svg",
  ovo: "/payment-logos/ovo.svg",
  linkaja: "/payment-logos/linkaja.svg",
  shopeepay: "/payment-logos/shopeepay.svg",
  mastercard: "/payment-logos/mastercard.svg",
  visa: "/payment-logos/visa.svg",
  jcb: "/payment-logos/jcb.svg",
};

function PaymentLogo({ method, compact = false }) {
  const logoSrc = paymentLogoSources[method.id];

  return (
    <span
      className={`payment-logo payment-logo--${method.id}${compact ? " payment-logo--compact" : ""}`}
      aria-label={method.name}
    >
      {logoSrc ? (
        <img
          className="payment-logo-image"
          src={logoSrc}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <span>{method.logo}</span>
      )}
    </span>
  );
}

export default function CheckoutPage() {
  const { courseId } = useParams();
  const [selectedMethod, setSelectedMethod] = useState('bca');
  const [expandedGroups, setExpandedGroups] = useState({
    bank: true,
    ewallet: true,
    card: true
  });
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders();
  const course = courses.find(
    (item) => String(item.id) === String(courseId) || item.slug === courseId
  );

  if (coursesLoading || ordersLoading) {
    return <div className="flow-page"><Header /><main className="page-shell"><p role="status">Memuat checkout...</p></main><Footer /></div>;
  }

  if (coursesError || ordersError || !course) {
    const message = coursesError || ordersError || 'Course tidak ditemukan.';
    return <div className="flow-page"><Header /><main className="page-shell"><p role="alert">Checkout gagal dimuat: {message}</p></main><Footer /></div>;
  }

  if (hasPurchasedCourse(orders, course.id)) {
    return <AlreadyOwnedModal />;
  }

  const total = course.price + 7000;

  const toggleGroup = (groupId) => {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId]
    }));
  };

  return (
    <div className="flow-page payment-flow-page">
      <Header />
      <div className="payment-progress" aria-label="Langkah pembayaran">
        <span className="payment-progress-step is-active"><FiCircle aria-hidden="true" /> Pilih Metode</span>
        <span className="payment-progress-line" />
        <span className="payment-progress-step"><FiCircle aria-hidden="true" /> Bayar</span>
        <span className="payment-progress-line" />
        <span className="payment-progress-step"><FiCircle aria-hidden="true" /> Selesai</span>
      </div>
      <main className="page-shell checkout-shell checkout-payment-layout">
        <div className="checkout-payment-main">
          <section className="method-panel payment-selection-panel">
            <div className="method-panel-heading">
              <h1>Metode Pembayaran</h1>
            </div>

            {paymentGroups.map((group) => {
              const isExpanded = expandedGroups[group.id];
              const groupMethods = paymentMethods.filter((method) => method.group === group.id);
              return (
                <section className="payment-method-group" key={group.id}>
                  <button
                    type="button"
                    className="payment-group-toggle"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>{group.title}</span>
                    <FiChevronDown aria-hidden="true" />
                  </button>
                  {isExpanded && (
                    <div className="payment-provider-list">
                      {groupMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            className={`payment-provider-option${isSelected ? ' is-selected' : ''}`}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedMethod(method.id)}
                          >
                            <span className="payment-provider-name">
                              <PaymentLogo method={method} compact />
                              <span>{method.name}</span>
                            </span>
                            {isSelected
                              ? <FiCheck className="payment-selected-check" aria-label="Dipilih" />
                              : <FiCircle className="payment-unselected-circle" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </section>

          <section className="checkout-order-summary">
            <h2>Ringkasan Pesanan</h2>
            <div className="checkout-summary-row">
              <span>Video Learning: {course.title}</span>
              <strong>{formatCurrency(course.price)}</strong>
            </div>
            <div className="checkout-summary-row">
              <span>Biaya Admin</span>
              <strong>{formatCurrency(7000)}</strong>
            </div>
            <div className="checkout-summary-total">
              <span>Total Pembayaran</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <Link
              className="primary-button checkout-continue-button"
              to={`/payment/${course.id}?method=${selectedMethod}`}
            >
              Lanjutkan Pembayaran
            </Link>
          </section>
        </div>

        <aside className="checkout-course-card">
          <img src={course.image} alt={course.title} />
          <h2>{course.title}</h2>
          <div className="checkout-course-price">
            <strong>{formatCurrency(course.price)}</strong>
            <del>{formatCurrency(course.oldPrice)}</del>
            <span>Diskon {course.discount}%</span>
          </div>
          <h3>Kelas Ini Sudah Termasuk</h3>
          <div className="checkout-course-features">
            <span><FiCheckCircle aria-hidden="true" /> Ujian Akhir</span>
            <span><FiPlayCircle aria-hidden="true" /> {course.lessons} Video</span>
            <span><FiBookOpen aria-hidden="true" /> {course.modules.length} Modul</span>
            <span><FiAward aria-hidden="true" /> Sertifikat</span>
            <span><FiGlobe aria-hidden="true" /> Bahasa Indonesia</span>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
