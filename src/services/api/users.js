import { createRecord, deleteRecord, getAll, getById, replaceRecord, updateRecord } from './client';

const resource = 'users';

export const getUsers = () => getAll(resource);
export const getUser = (id) => getById(resource, id);
export const getUserByEmail = async (email) => {
  const normalizedEmail = email.trim().toLocaleLowerCase('en');
  const users = await getUsers();
  return users.find((user) => user.email?.trim().toLocaleLowerCase('en') === normalizedEmail) || null;
};

export const createUser = async (user) => {
  const existingUser = await getUserByEmail(user.email);
  if (existingUser) {
    throw new Error('Email tersebut sudah terdaftar.');
  }
  return createRecord(resource, user);
};

export const replaceUser = (id, user) => replaceRecord(resource, id, user);
export const updateUser = async (id, changes) => {
  if (changes.email) {
    const existingUser = await getUserByEmail(changes.email);
    if (existingUser && String(existingUser.id) !== String(id)) {
      throw new Error('Email tersebut sudah digunakan akun lain.');
    }
  }
  return updateRecord(resource, id, changes);
};
export const deleteUser = (id) => deleteRecord(resource, id);
