import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createOrder as createOrderRequest,
  deleteOrder as deleteOrderRequest,
  getOrdersForUser,
  updateOrder as updateOrderRequest
} from '../services/api/orders';

function normalizeUserId(userId) {
  if (userId === null || userId === undefined || String(userId).trim() === '') {
    throw new Error('ID pengguna API tidak tersedia; silakan masuk kembali.');
  }

  return String(userId);
}

function sameRecordId(left, right) {
  return left !== null
    && left !== undefined
    && right !== null
    && right !== undefined
    && String(left) === String(right);
}

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const normalizedUserId = normalizeUserId(userId);
      const orders = await getOrdersForUser(normalizedUserId);
      return { userId: normalizedUserId, orders };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Pesanan gagal dimuat.');
    }
  },
  {
    condition: ({ userId, force = false }, { getState }) => {
      if (userId === null || userId === undefined || String(userId).trim() === '') {
        return false;
      }
      const { userId: currentUserId, status } = getState().orders;
      const normalizedUserId = String(userId);
      return !(currentUserId === normalizedUserId
        && (status === 'loading' || (status === 'succeeded' && !force)));
    }
  }
);

export const createUserOrder = createAsyncThunk(
  'orders/createUserOrder',
  async ({ userId, order }) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!sameRecordId(order?.userId, normalizedUserId)) {
      throw new Error('Pesanan tidak sesuai dengan pengguna yang sedang masuk.');
    }
    const createdOrder = await createOrderRequest(order);
    if (
      createdOrder?.id === null
      || createdOrder?.id === undefined
      || String(createdOrder.id).trim() === ''
    ) {
      throw new Error('API tidak mengembalikan ID pesanan setelah pesanan dibuat.');
    }
    if (!sameRecordId(createdOrder?.userId, normalizedUserId)) {
      throw new Error('API tidak mengonfirmasi kepemilikan pesanan.');
    }
    return createdOrder;
  }
);

export const updateUserOrder = createAsyncThunk(
  'orders/updateUserOrder',
  async ({ userId, id, changes }, { getState }) => {
    const normalizedUserId = normalizeUserId(userId);
    const state = getState().orders;
    const existingOrder = state.userId === normalizedUserId
      ? state.data.find((order) => sameRecordId(order.id, id))
      : null;
    if (!existingOrder || !sameRecordId(existingOrder.userId, normalizedUserId)) {
      throw new Error('Pesanan tidak ditemukan atau bukan milik akun Anda.');
    }
    if (changes?.userId !== undefined && !sameRecordId(changes.userId, normalizedUserId)) {
      throw new Error('Pesanan tidak dapat dipindahkan ke akun pengguna lain.');
    }

    const order = await updateOrderRequest(id, changes);
    if (!sameRecordId(order?.id, id)) {
      throw new Error('API tidak mengembalikan ID pesanan yang diperbarui.');
    }
    if (!sameRecordId(order?.userId, normalizedUserId)) {
      throw new Error('API tidak mengonfirmasi kepemilikan pesanan.');
    }
    return order;
  }
);

export const deleteUserOrder = createAsyncThunk(
  'orders/deleteUserOrder',
  async ({ userId, id }, { getState }) => {
    const normalizedUserId = normalizeUserId(userId);
    const state = getState().orders;
    const existingOrder = state.userId === normalizedUserId
      ? state.data.find((order) => sameRecordId(order.id, id))
      : null;
    if (!existingOrder || !sameRecordId(existingOrder.userId, normalizedUserId)) {
      throw new Error('Pesanan tidak ditemukan atau bukan milik akun Anda.');
    }

    await deleteOrderRequest(id, normalizedUserId);
    return { userId: normalizedUserId, id };
  }
);

const initialState = {
  data: [],
  loading: false,
  error: '',
  status: 'idle',
  userId: null,
  requestId: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearUserOrders(state) {
      state.data = [];
      state.loading = false;
      state.error = '';
      state.status = 'idle';
      state.userId = null;
      state.requestId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state, action) => {
        const userId = String(action.meta.arg.userId);
        if (state.userId !== userId) {
          state.data = [];
          state.error = '';
        }
        state.userId = userId;
        state.loading = true;
        state.status = 'loading';
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        if (
          state.userId !== action.payload.userId
          || state.requestId !== action.meta.requestId
        ) return;
        state.data = action.payload.orders;
        state.loading = false;
        state.error = '';
        state.status = 'succeeded';
        state.requestId = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        const argUserId = action.meta.arg?.userId;
        const userId = argUserId === null || argUserId === undefined
          ? null
          : String(argUserId);
        if (state.userId !== userId || state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload || action.error.message || 'Pesanan gagal dimuat.';
        state.status = 'failed';
        state.requestId = null;
      })
      .addCase(createUserOrder.fulfilled, (state, action) => {
        const order = action.payload;
        if (state.userId !== String(order.userId)) return;
        if (!state.data.some((item) => sameRecordId(item.id, order.id))) {
          state.data.push(order);
        }
      })
      .addCase(updateUserOrder.fulfilled, (state, action) => {
        const order = action.payload;
        if (state.userId !== String(order.userId)) return;
        state.data = state.data.map((item) =>
          sameRecordId(item.id, order.id) ? order : item
        );
      })
      .addCase(deleteUserOrder.fulfilled, (state, action) => {
        if (state.userId !== action.payload.userId) return;
        state.data = state.data.filter((item) => !sameRecordId(item.id, action.payload.id));
      });
  }
});

export const { clearUserOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
