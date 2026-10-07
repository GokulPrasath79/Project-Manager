import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setToken, clearToken, getToken, setUnauthorizedHandler } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const endSession = useCallback(async (message = '') => {
    await clearToken();
    setUser(null);
    setNotice(message);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(endSession);
    (async () => {
      if (await getToken()) {
        try { setUser((await api('/auth/me')).user); } catch { /* 401 handled; offline keeps login screen */ }
      }
      setLoading(false);
    })();
  }, [endSession]);

  const authenticate = async (path, body) => {
    const d = await api(path, { method: 'POST', body, auth: false });
    await setToken(d.token);
    setNotice('');
    setUser(d.user);
  };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* clear locally regardless */ }
    await endSession();
  };

  return (
    <Ctx.Provider value={{ user, loading, notice, login: (b) => authenticate('/auth/login', b), register: (b) => authenticate('/auth/register', b), logout }}>
      {children}
    </Ctx.Provider>
  );
}
