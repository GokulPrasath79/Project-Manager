import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Taskyard</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </nav>
        <div className="who">
          <div className="who-name">{user.fullName}</div>
          <div className="who-mail">{user.email}</div>
          <button className="btn ghost-light" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
