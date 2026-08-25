import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar__brand">Playblocks</div>
      <div className="navbar__links">
        <NavLink to="/playbooks/new">Create Playbook</NavLink>
        <NavLink to="/simulate">Simulate Event</NavLink>
      </div>
      <div className="navbar__user">
        <span>{user.email}</span>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
