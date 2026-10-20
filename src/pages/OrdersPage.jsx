import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';
import { formatCurrency } from '../data/mockData';
import { useUserOrders } from '../hooks/useUserOrders';
import './FlowPages.css';

const orderCategories = ['Berhasil', 'Menunggu', 'Dibatalkan'];

const sideMenu = [
  { label: 'Profil Saya', to: '/profile' },
  { label: 'Kelas Saya', to: '/classes' },
  { label: 'Pesanan Saya', to: '/orders' }
];

function getOrderCategory(status) {
  if (status === 'Berhasil') return 'Berhasil';
  if (status === 'Dibatalkan' || status === 'Gagal') return 'Dibatalkan';
  return 'Menunggu';
}

function getDisplayedStatus(status) {
  if (status === 'Belum Bayar') return 'Belum Bayar';
  return getOrderCategory(status);
}

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    updateOrder,
    deleteOrder
  } = useUserOrders();
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState('');
  const [actionError, setActionError] = useState('');

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('id');
    return orders.filter((order) => {
      const matchesCategory = !activeCategory || getOrderCategory(order.status) === activeCategory;
      const matchesSearch = !normalizedSearch
        || order.title.toLocaleLowerCase('id').includes(normalizedSearch)
        || (order.orderNumber || '').toLocaleLowerCase('id').includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, orders, searchTerm]);

  const cancelOrder = async (order) => {
    setUpdatingOrderId(String(order.id));
    setActionError('');
    try {
      const cancelledOrder = await updateOrder(order.id, { status: 'Dibatalkan' });
      if (cancelledOrder.status !== 'Dibatalkan') {
        throw new Error('API tidak mengonfirmasi pembatalan pesanan.');
      }
    } catch (requestError) {
      setActionError(`Pesanan gagal dibatalkan: ${requestError.message}`);
    } finally {
      setUpdatingOrderId('');
    }
  };

  const removeOrder = async (order) => {
    const confirmed = window.confirm(
      `Hapus pesanan ${order.orderNumber || 'ini'} dari riwayat? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setDeletingOrderId(String(order.id));
    setActionError('');
    try {
      await deleteOrder(order.id);
    } catch (requestError) {
      setActionError(`Pesanan gagal dihapus dari riwayat: ${requestError.message}`);
    } finally {
      setDeletingOrderId('');
    }
  };

  return (
    <div className="flow-page">
      <Header />
      <main className="page-shell orders-shell">
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

        <section className="content-panel orders-content-panel">
          <div className="filter-bar">
            <div className="tab-set orders-filter-tabs" aria-label="Filter pesanan">
              {orderCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`tab-button${activeCategory === category ? ' active' : ''}`}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory((current) => current === category ? null : category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <input
              className="search-box orders-search"
              type="search"
              placeholder="Cari kelas atau invoice"
              aria-label="Cari kelas atau nomor invoice"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="order-list">
            {loading && <p role="status">Memuat pesanan...</p>}
            {error && <p role="alert">Pesanan gagal dimuat: {error}</p>}
            {actionError && <p role="alert">{actionError}</p>}
            {!loading && !error && filteredOrders.length ? filteredOrders.map((order) => {
              const category = getOrderCategory(order.status);
              const canCancel = category === 'Menunggu';
              const canDelete = order.status === 'Dibatalkan';
              const orderActionPending = updatingOrderId === String(order.id)
                || deletingOrderId === String(order.id);

              return (
                <div className="order-card" key={String(order.id)}>
                  <div className="order-card-header">
                    <span className="meta">No. Invoice: {order.orderNumber || 'Tidak tersedia'}</span>
                    <span className={`order-status ${
                      category === 'Berhasil'
                        ? 'status-success'
                        : category === 'Menunggu'
                          ? 'status-warning'
                          : 'status-danger'
                    }`}>
                      {getDisplayedStatus(order.status)}
                    </span>
                  </div>

                  <div className="order-course-row">
                    <div className="order-course-image-wrap">
                      <img
                        src={order.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                        alt={order.title}
                      />
                    </div>

                    <div className="order-course-text">
                      <h4>{order.title}</h4>
                      <div className="meta">Waktu Pemesanan: {order.date}</div>
                      {order.method && <div className="meta">Metode: {order.method}</div>}
                    </div>

                    <div className="order-price-box">
                      <span className="price-label">Harga</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                  </div>

                  <div className="order-total-row">
                    <span>Total Pembayaran</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                  {(canCancel || canDelete) && (
                    <div className="order-actions">
                      {canCancel && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => cancelOrder(order)}
                          disabled={orderActionPending}
                        >
                          {updatingOrderId === String(order.id) ? 'Membatalkan...' : 'Batalkan Pembelian'}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => removeOrder(order)}
                          disabled={orderActionPending}
                        >
                          {deletingOrderId === String(order.id) ? 'Menghapus...' : 'Hapus dari Riwayat'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : !loading && !error ? (
              <p className="empty-state">Tidak ada pesanan pada kategori ini.</p>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
