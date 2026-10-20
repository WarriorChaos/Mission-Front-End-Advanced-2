import { createRecord, deleteRecord, getAll, getById, replaceRecord, updateRecord } from './client';

const resource = 'orders';

export const getOrders = () => getAll(resource);
export const getOrder = (id) => getById(resource, id);
export const getOrdersForUser = async (userId) => {
  if (userId === null || userId === undefined || String(userId).trim() === '') {
    throw new Error('ID pengguna API tidak tersedia; silakan masuk kembali.');
  }

  const orders = await getOrders();
  return orders.filter((order) => String(order.userId) === String(userId));
};
export const createOrder = (order) => createRecord(resource, order);
export const replaceOrder = (id, order) => replaceRecord(resource, id, order);
export const updateOrder = (id, changes) => updateRecord(resource, id, changes);
export const deleteOrder = async (id, userId) => {
  if (id === null || id === undefined || String(id).trim() === '') {
    throw new Error('Tidak dapat menghapus pesanan: ID record MockAPI tidak tersedia.');
  }
  if (userId === null || userId === undefined || String(userId).trim() === '') {
    throw new Error('Tidak dapat menghapus pesanan: ID pengguna API tidak tersedia.');
  }

  const order = await getOrder(id);
  if (String(order?.userId) !== String(userId)) {
    throw new Error('Tidak dapat menghapus pesanan yang bukan milik akun Anda.');
  }
  if (order.status !== 'Dibatalkan') {
    throw new Error('Hanya pesanan berstatus Dibatalkan yang dapat dihapus.');
  }

  return deleteRecord(resource, order.id);
};
