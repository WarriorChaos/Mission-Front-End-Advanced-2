import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCourses } from '../services/api/courses';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      return await getCourses();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Course gagal dimuat.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().courses;
      return status !== 'loading' && status !== 'succeeded';
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: '',
  status: 'idle'
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.status = 'loading';
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = '';
        state.status = 'succeeded';
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Course gagal dimuat.';
        state.status = 'failed';
      });
  }
});

export default coursesSlice.reducer;
