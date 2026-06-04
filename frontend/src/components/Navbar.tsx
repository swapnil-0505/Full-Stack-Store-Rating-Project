import React from 'react';
import { LogOut, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" style={{ cursor: 'pointer' }}>
          <Star size={22} style={{ fill: 'url(#brand-grad)' }} />
          <svg width="0" height="0">
            <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </svg>
          <span style={{ marginLeft: '8px' }}>StoreRating</span>
        </div>
        
        <div className="navbar-user">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span className="navbar-user-name" style={{ fontWeight: 600, color: '#ffffff' }}>{user.name}</span>
            <span className="navbar-user-role">{user.role}</span>
          </div>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
