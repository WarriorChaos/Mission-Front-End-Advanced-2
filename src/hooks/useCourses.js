import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/coursesSlice';

export function useCourses() {
  const dispatch = useDispatch();
  const { data: courses, loading, error, status } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  return { courses, loading: loading || status === 'idle', error };
}
