import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/useAuth';
import {
  clearUserOrders,
  createUserOrder,
  deleteUserOrder,
  fetchUserOrders,
  updateUserOrder
} from '../store/ordersSlice';

export function useUserOrders() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const userId = user?.id === null || user?.id === undefined ? null : String(user.id);
  const orderState = useSelector((state) => state.orders);

  useEffect(() => {
    if (userId === null) {
      dispatch(clearUserOrders());
      return;
    }
    dispatch(fetchUserOrders({ userId }));
  }, [dispatch, userId]);

  const refresh = useCallback(() => {
    if (userId !== null) {
      dispatch(fetchUserOrders({ userId, force: true }));
    }
  }, [dispatch, userId]);

  const createOrder = useCallback((order) =>
    dispatch(createUserOrder({ userId, order })).unwrap(), [dispatch, userId]);
  const updateOrder = useCallback((id, changes) =>
    dispatch(updateUserOrder({ userId, id, changes })).unwrap(), [dispatch, userId]);
  const deleteOrder = useCallback((id) =>
    dispatch(deleteUserOrder({ userId, id })).unwrap(), [dispatch, userId]);

  const isCurrentUser = userId !== null && orderState.userId === userId;
  const loading = userId !== null && (!isCurrentUser || orderState.loading);

  return {
    orders: isCurrentUser ? orderState.data : [],
    loading,
    error: isCurrentUser && !loading ? orderState.error : '',
    refresh,
    createOrder,
    updateOrder,
    deleteOrder
  };
}
