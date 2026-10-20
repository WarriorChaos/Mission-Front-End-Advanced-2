import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import { paymentMethods, paymentMethodAliases } from '../data/mockData';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { sameRecordId } from '../data/userPurchases';
import './FlowPages.css';

export default function PaymentResultPage() {
  const { courseId, status } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    updateOrder: updateUserOrder
  } = useUserOrders();
  const course = courses.find(
    (item) => String(item.id) === String(courseId) || item.slug === courseId
  );
  const requestedMethod = searchParams.get('method');
  const methodId = paymentMethods.some((item) => item.id === requestedMethod)
    ? requestedMethod
    : paymentMethodAliases[requestedMethod] || paymentMethods[0].id;
  const method = paymentMethods.find((item) => item.id === methodId) || paymentMethods[0];
  const orderId = searchParams.get('order');
  const order = orders.find((item) => sameRecordId(item.id, orderId));
  const isPending = status === 'pending' && order?.status === 'Belum Bayar';
  const isCancelled = order?.status === 'Dibatalkan';
  const isSuccess = status === 'success'
    && course
    && sameRecordId(order?.courseId, course.id)
    && order?.status === 'Berhasil';
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  if (coursesLoading || ordersLoading) {
    return <div className="flow-page"><Header /><main className="page-shell"><p role="status">Memuat status pembayaran...</p></main><Footer /></div>;
  }

  if (coursesError || ordersError || !course) {
    const message = coursesError || ordersError || 'Course tidak ditemukan.';
    return <div className="flow-page"><Header /><main className="page-shell"><p role="alert">Status pembayaran gagal dimuat: {message}</p></main><Footer /></div>;
  }

  const refreshPaymentStatus = async () => {
    if (!order?.id || order.status !== 'Belum Bayar') {
      return;
    }

    setUpdating(true);
    setError('');
    try {
      const updatedOrder = await updateUserOrder(order.id, { status: 'Berhasil' });
      if (updatedOrder.status !== 'Berhasil') {
        throw new Error('API tidak mengonfirmasi status Berhasil.');
      }
    } catch (requestError) {
      setError(`Status pembayaran gagal diperbarui: ${requestError.message}`);
      setUpdating(false);
      return;
    }
    setUpdating(false);
    navigate(`/payment-result/${course.id}/success?method=${method.id}&order=${orderId}`);
  };

  const title = isSuccess
    ? 'Pembayaran Berhasil!'
    : isCancelled
      ? 'Pembelian Dibatalkan'
      : 'Pembayaran Tertunda';

  return (
    <div className="flow-page">
      <Header />
      <main className="page-shell">
        <div className="result-card">
          <div className={`result-check${isSuccess ? '' : ' result-check--pending'}`} aria-hidden="true">
            {isSuccess ? '✓' : isCancelled ? '×' : '!'}
          </div>
          <h2>{title}</h2>
          <p>
            {isSuccess
              ? `Kelas ${course.title} sudah ditambahkan ke Kelas Saya. Detail transaksi tersimpan di Pesanan Saya.`
              : isCancelled
                ? 'Pesanan ini sudah dibatalkan dan tidak dapat dilanjutkan.'
                : isPending
                  ? 'Pembayaran Anda masih diproses. Tekan refresh untuk memeriksa kembali status pembayaran.'
                  : 'Transaksi tidak ditemukan. Silakan periksa Pesanan Saya.'}
          </p>
          {error && <p role="alert">{error}</p>}
          <div className="result-actions">
            <Link to="/orders" className="primary-button">Lihat Pesanan Saya</Link>
            {isSuccess && <Link to="/classes" className="secondary-button">Buka Kelas Saya</Link>}
            {isPending && (
              <button type="button" className="secondary-button" onClick={refreshPaymentStatus} disabled={updating}>
                {updating ? 'Memperbarui...' : 'Refresh Status Pembayaran'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
