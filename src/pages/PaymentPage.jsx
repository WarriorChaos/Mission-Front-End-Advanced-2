import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiCopy, FiGlobe, FiBookOpen, FiCheckCircle, FiPlayCircle, FiUsers, FiCircle } from 'react-icons/fi';
import AlreadyOwnedModal from '../components/common/AlreadyOwnedModal';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import { formatCurrency, paymentMethods, paymentMethodAliases } from '../data/mockData';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { useAuth } from '../contexts/useAuth';
import { createOrderNumber, hasPurchasedCourse, sameRecordId } from '../data/userPurchases';
import './CheckoutPayment.css';


const paymentLogoSources = {
  bca: "/payment-logos/bca.svg",
  bni: "/payment-logos/bni.svg",
  bri: "/payment-logos/bri.svg",
  mandiri: "/payment-logos/mandiri.svg",
  dana: "/payment-logos/dana.svg",
  ovo: "/payment-logos/ovo.svg",
  linkaja: "/payment-logos/linkaja.svg",
  shopeepay: "/payment-logos/shopeepay.svg",
  visa: "/payment-logos/visa.svg",
  mastercard: "/payment-logos/mastercard.svg",
  jcb: "/payment-logos/jcb.svg",
};

const bankNames = {
  bca: 'BCA',
  bni: 'BNI',
  bri: 'BRI',
  mandiri: 'Mandiri'
};

const bankPrefixes = {
  bca: '11739',
  bni: '988',
  bri: '88810',
  mandiri: '70012'
};

const walletPrefixes = {
  dana: '8808',
  ovo: '39358',
  linkaja: '09110',
  shopeepay: '893'
};

function createPaymentGuides(methodId, methodName) {
  if (bankNames[methodId]) {
    const bank = bankNames[methodId];
    return [
      {
        id: 'atm',
        title: `ATM ${bank}`,
        instructions: [
          `Masukkan kartu ATM ${bank} dan pilih menu transaksi atau pembayaran.`,
          'Pilih menu Transfer / Virtual Account sesuai pilihan yang tersedia.',
          `Pilih ${bank} Virtual Account, lalu masukkan nomor Virtual Account di atas.`,
          'Pastikan nama dan nominal pembayaran sudah sesuai, kemudian konfirmasi.',
          'Simpan bukti transaksi setelah pembayaran berhasil.'
        ]
      },
      {
        id: 'mobile',
        title: `Mobile Banking ${bank}`,
        instructions: [
          `Buka aplikasi mobile banking ${bank} dan login.`,
          'Pilih menu Transfer atau Pembayaran, lalu pilih Virtual Account.',
          `Masukkan nomor Virtual Account ${bank} dan periksa detail tagihan.`,
          'Konfirmasi pembayaran menggunakan PIN atau metode verifikasi aplikasi.',
          'Pembayaran selesai. Simpan bukti transaksi Anda.'
        ]
      },
      {
        id: 'internet',
        title: `Internet Banking ${bank}`,
        instructions: [
          `Login ke layanan Internet Banking ${bank}.`,
          'Pilih menu transfer atau pembayaran Virtual Account.',
          `Masukkan nomor Virtual Account ${bank}, lalu lanjutkan.`,
          'Periksa nama penerima dan nominal pembayaran sebelum konfirmasi.',
          'Masukkan kode verifikasi transaksi untuk menyelesaikan pembayaran.'
        ]
      }
    ];
  }

  if (methodId === 'visa' || methodId === 'mastercard' || methodId === 'jcb') {
    return [{
      id: 'card',
      title: `Kartu Kredit/Debit ${methodName}`,
      instructions: [
        `Siapkan kartu kredit atau debit berlogo ${methodName} yang aktif untuk transaksi online.`,
        'Pilih Bayar Sekarang untuk melanjutkan simulasi pembayaran yang aman.',
        'Ikuti verifikasi dari bank penerbit kartu apabila diminta.',
        'Pembayaran kartu akan diproses secara instan.'
      ]
    }];
  }

  const walletGuides = {
    dana: {
      title: 'Bayar dengan DANA',
      instructions: ['Buka aplikasi DANA dan pilih menu Kirim atau Bayar.', 'Pilih Virtual Account, lalu pilih bank tujuan yang tertera pada aplikasi.', 'Masukkan nomor pembayaran DANA di atas dan periksa detail tagihan.', 'Konfirmasi menggunakan PIN DANA untuk menyelesaikan pembayaran.']
    },
    ovo: {
      title: 'Bayar dengan OVO',
      instructions: ['Buka aplikasi OVO dan pastikan saldo Anda mencukupi.', 'Pilih menu Transfer, lalu pilih tujuan Virtual Account.', 'Masukkan nomor pembayaran OVO di atas dan periksa detail tagihan.', 'Konfirmasi transaksi dengan memasukkan security code OVO.']
    },
    linkaja: {
      title: 'Bayar dengan LinkAja',
      instructions: ['Buka aplikasi LinkAja dan pilih menu Kirim Uang atau Bayar.', 'Pilih pembayaran Virtual Account dari daftar metode.', 'Masukkan nomor pembayaran LinkAja di atas dan periksa detail pesanan.', 'Masukkan PIN LinkAja untuk mengonfirmasi pembayaran.']
    },
    shopeepay: {
      title: 'Bayar dengan ShopeePay',
      instructions: ['Buka aplikasi Shopee dan masuk ke menu ShopeePay.', 'Pilih Bayar atau Transfer, lalu pilih Virtual Account.', 'Masukkan nomor pembayaran ShopeePay di atas dan periksa tagihan.', 'Konfirmasi pembayaran menggunakan PIN ShopeePay.']
    }
  };

  return [{ id: 'wallet', ...walletGuides[methodId] }];
}


function PaymentLogo({ method }) {
  const logoSrc = paymentLogoSources[method.id];

  return (
    <span
      className={`payment-logo payment-logo--${method.id}`}
      aria-label={method.name}
    >
      {logoSrc ? (
        <img
          className="payment-logo-image"
          src={logoSrc}
          alt={method.name}
        />
      ) : (
        <span>{method.logo}</span>
      )}
    </span>
  );
}


export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    createOrder: createUserOrder,
    updateOrder: updateUserOrder
  } = useUserOrders();
  const course = courses.find(
    (item) => String(item.id) === String(courseId) || item.slug === courseId
  );
  const requestedMethod = searchParams.get('method');
  const selectedMethod = paymentMethods.some((method) => method.id === requestedMethod)
    ? requestedMethod
    : paymentMethodAliases[requestedMethod] || 'bca';
  const selectedProvider = paymentMethods.find((method) => method.id === selectedMethod);
  const guides = createPaymentGuides(selectedMethod, selectedProvider.name);
  const isBank = selectedProvider.group === 'bank';
  const isWallet = selectedProvider.group === 'ewallet';
  const account = isBank
    ? `${bankPrefixes[selectedMethod]} 081234567890`
    : isWallet
      ? `${walletPrefixes[selectedMethod]} 081234567890`
      : '';
  const subtotal = course?.price ?? 0;
  const adminFee = 7000;
  const total = subtotal + adminFee;
  const [expandedGuides, setExpandedGuides] = useState(() => (
    Object.fromEntries(guides.map((guide) => [guide.id, true]))
  ));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (coursesLoading || ordersLoading) {
    return <div className="flow-page"><Header /><main className="page-shell"><p role="status">Memuat pembayaran...</p></main><Footer /></div>;
  }

  if (coursesError || ordersError || !course) {
    const message = coursesError || ordersError || 'Course tidak ditemukan.';
    return <div className="flow-page"><Header /><main className="page-shell"><p role="alert">Pembayaran gagal dimuat: {message}</p></main><Footer /></div>;
  }

  if (hasPurchasedCourse(orders, course.id)) {
    return <AlreadyOwnedModal />;
  }

  const handlePay = async () => {
    if (!user?.id) {
      setSubmitError('ID pengguna API tidak tersedia. Silakan masuk kembali.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const createdAt = new Date();
    const orderData = {
      courseId: String(course.id),
      userId: String(user.id),
      title: course.title,
      image: course.image,
      teacher: course.instructor,
      duration: course.duration,
      lessons: course.lessons,
      total,
      status: 'Belum Bayar',
      date: new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short'
      }).format(createdAt),
      method: selectedProvider.name
    };

    try {
      const existingPendingOrder = orders.find(
        (order) => sameRecordId(order.courseId, course.id) && order.status === 'Belum Bayar'
      );
      const order = existingPendingOrder
        ? await updateUserOrder(existingPendingOrder.id, {
          ...orderData,
          orderNumber: existingPendingOrder.orderNumber
        })
        : await createUserOrder({
          ...orderData,
          orderNumber: createOrderNumber()
        });
      navigate(`/payment-result/${course.id}/pending?method=${selectedMethod}&order=${encodeURIComponent(String(order.id))}`);
    } catch (requestError) {
      setSubmitError(`Pesanan gagal disimpan: ${requestError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account);
    } catch (error) {
      console.error('Failed to copy payment account:', error);
    }
  };

  const toggleGuide = (guideId) => {
    setExpandedGuides((current) => ({
      ...current,
      [guideId]: !current[guideId]
    }));
  };

  return (
    <div className="flow-page payment-flow-page">
      <Header />
      <div className="payment-progress" aria-label="Langkah pembayaran">
        <span className="payment-progress-step is-complete"><FiCheckCircle aria-hidden="true" /> Pilih Metode</span>
        <span className="payment-progress-line is-complete" />
        <span className="payment-progress-step is-active"><FiCheckCircle aria-hidden="true" /> Bayar</span>
        <span className="payment-progress-line" />
        <span className="payment-progress-step"><FiCircle aria-hidden="true" /> Selesai</span>
      </div>

      <main className="page-shell checkout-shell checkout-payment-layout payment-detail-layout">
        <div className="checkout-payment-main">
          <section className="payment-detail-panel">
            <h1>Metode Pembayaran</h1>
            <div className="payment-method-summary">
              <PaymentLogo method={selectedProvider} />
              <div>
                <h2>{isBank ? `Bayar Melalui Virtual Account ${bankNames[selectedMethod]}` : guides[0].title}</h2>
                {isBank || isWallet
                  ? <p>Gunakan nomor pembayaran berikut untuk menyelesaikan pesanan Anda.</p>
                  : <p>Pembayaran aman menggunakan kartu kredit atau debit.</p>}
              </div>
            </div>
            {account && (
              <div className="payment-account-card">
                <div>
                  <span>Nomor Virtual Account</span>
                  <strong>{account}</strong>
                </div>
                <button type="button" className="copy-button" onClick={handleCopy}>
                  <FiCopy aria-hidden="true" /> Salin
                </button>
              </div>
            )}

            <h2 className="payment-guide-heading">Tata Cara Pembayaran</h2>
            <div className="payment-guide-list">
              {guides.map((guide) => {
                const isExpanded = expandedGuides[guide.id];
                return (
                  <section className="payment-guide" key={guide.id}>
                    <button
                      type="button"
                      className="payment-guide-toggle"
                      onClick={() => toggleGuide(guide.id)}
                      aria-expanded={isExpanded}
                    >
                      <span>{guide.title}</span>
                      <FiChevronDown aria-hidden="true" />
                    </button>
                    {isExpanded && (
                      <ol className="payment-guide-steps">
                        {guide.instructions.map((instruction) => (
                          <li key={instruction}>{instruction}</li>
                        ))}
                      </ol>
                    )}
                  </section>
                );
              })}
            </div>
          </section>

          <section className="checkout-order-summary payment-order-summary">
            <h2>Ringkasan Pesanan</h2>
            <div className="checkout-summary-row">
              <span>Video Learning: {course.title}</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="checkout-summary-row">
              <span>Biaya Admin</span>
              <strong>{formatCurrency(adminFee)}</strong>
            </div>
            <div className="checkout-summary-total">
              <span>Total Pembayaran</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div className="payment-action-buttons">
              <Link className="secondary-button" to={`/checkout/${course.id}`}>
                Ganti Metode Pembayaran
              </Link>
              <button type="button" className="primary-button" onClick={handlePay} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Bayar Sekarang'}
              </button>
            </div>
            {submitError && <p role="alert">{submitError}</p>}
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
            <span><FiCheckCircle aria-hidden="true" /> Sertifikat</span>
            <span><FiUsers aria-hidden="true" /> Akses Selamanya</span>
          </div>
          <h3>Bahasa Pengantar</h3>
          <p className="checkout-course-language"><FiGlobe aria-hidden="true" /> Bahasa Indonesia</p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
