import { createRecord, deleteRecord, getAll, getById, replaceRecord, updateRecord } from './client';

const resource = 'courses';

export const getCourses = () => getAll(resource);
export const getCourse = (id) => getById(resource, id);
export const createCourse = (course) => createRecord(resource, course);
export const replaceCourse = (id, course) => replaceRecord(resource, id, course);
export const updateCourse = (id, changes) => updateRecord(resource, id, changes);
export const deleteCourse = (id) => deleteRecord(resource, id);
