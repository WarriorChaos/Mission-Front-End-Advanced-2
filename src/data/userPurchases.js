export function sameRecordId(left, right) {
  return left !== null
    && left !== undefined
    && right !== null
    && right !== undefined
    && String(left) === String(right);
}

export function hasPurchasedCourse(orders, courseId) {
  return orders.some(
    (order) => sameRecordId(order.courseId, courseId) && order.status === 'Berhasil'
  );
}

export function createOrderNumber() {
  return `VB-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
