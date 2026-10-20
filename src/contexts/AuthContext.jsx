import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContextValue';
import { createUser, getUserByEmail, updateUser as updateApiUser } from '../services/api/users';

function getStoredUser() {
  const storedUser = localStorage.getItem('videobelajar_user');
  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    if (!user || typeof user !== 'object') {
      throw new Error('Stored user must be an object.');
    }
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    localStorage.removeItem('videobelajar_user');
    return null;
  }
}

function toSessionUser(record) {
  return {
    id: String(record.id),
    name: record.name || '',
    email: record.email || '',
    phone: record.phone || '',
    gender: record.gender || 'Perempuan',
    loginTime: record.loginTime || new Date().toISOString()
  };
}

function persistUser(user) {
  localStorage.setItem('videobelajar_user', JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('videobelajar_user')));

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const record = user.id
          ? null
          : await getUserByEmail(user.email);
        const restoredUser = user.id
          ? user
          : record
            ? toSessionUser(record)
            : null;
        if (active) {
          setUser(restoredUser);
          if (restoredUser) {
            persistUser(restoredUser);
          } else {
            localStorage.removeItem('videobelajar_user');
          }
        }
      } catch (error) {
        console.error('Unable to restore API user session:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, [user]);

  const login = async (email, password) => {
    if (!email?.trim() || !password) {
      return null;
    }

    const record = await getUserByEmail(email);
    if (!record) {
      return null;
    }

    const userData = toSessionUser({
      ...record,
      loginTime: new Date().toISOString()
    });
    setUser(userData);
    persistUser(userData);
    return userData;
  };

  const register = async (fullName, email, phone, password, confirmPassword) => {
    if (!fullName || !email || !phone || !password || password !== confirmPassword) {
      return null;
    }

    const record = await createUser({
      name: fullName,
      email: email.trim(),
      phone,
      gender: 'Perempuan',
      loginTime: new Date().toISOString()
    });
    const userData = toSessionUser(record);
    setUser(userData);
    persistUser(userData);
    return userData;
  };

  const updateUser = async (updates) => {
    if (!user?.email) {
      throw new Error('Sesi pengguna tidak tersedia. Silakan masuk kembali.');
    }

    const record = user.id
      ? null
      : await getUserByEmail(user.email);
    const userId = user.id || record?.id;
    if (userId === null || userId === undefined) {
      throw new Error('Pengguna tidak ditemukan di resource users. Silakan masuk kembali.');
    }

    const profileUpdates = Object.fromEntries(
      ['name', 'email', 'phone', 'gender']
        .filter((field) => updates[field] !== undefined)
        .map((field) => [field, updates[field]])
    );
    const updatedRecord = await updateApiUser(userId, profileUpdates);
    const userData = toSessionUser(updatedRecord);
    setUser(userData);
    persistUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('videobelajar_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      updateUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
