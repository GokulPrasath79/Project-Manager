import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, clearToken, getToken, setUnauthorizedHandler } from './api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());
  const [notice, setNotice] = useState('');

  const endSession = useCallback((message = '') => {
    clearToken();
    setUser(null);
    setNotice(message);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(endSession);
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endSession]);

  const authenticate = async (path, body) => {
    const d = await api(path, { method: 'POST', body, auth: false });
    setToken(d.token);
    setNotice('');
    setUser(d.user);
  };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* token cleared anyway */ }
    endSession();
  };

  return (
    <AuthCtx.Provider
      value={{
        user, loading, notice,
        login: (b) => authenticate('/auth/login', b),
        register: (b) => authenticate('/auth/register', b),
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
