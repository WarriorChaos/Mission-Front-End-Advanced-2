import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './coursesSlice';
import ordersReducer from './ordersSlice';

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    orders: ordersReducer
  }
});
