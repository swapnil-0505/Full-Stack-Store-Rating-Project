import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table } from '../components/Table';
import type { Column } from '../components/Table';
import { StarRating } from '../components/StarRating';
import { 
  Store as StoreIcon, Star, Users, 
  Settings, Key, CheckCircle, AlertCircle 
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { apiFetch, updatePassword } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<'store' | 'profile'>('store');

  // Stats State
  const [storeData, setStoreData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile/Password Update State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Store Owner Data
  const fetchStoreData = async () => {
    try {
      setLoadingStats(true);
      const res = await apiFetch('/owners/store-stats');
      if (res.ok) {
        const data = await res.json();
        setStoreData(data.store);
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalRatings(data.totalRatings);
      }
    } catch (err) {
      console.error('Error fetching owner store data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'store') fetchStoreData();
  }, [activeTab]);

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8 || newPassword.length > 16 || !/[A-Z]/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
      setPasswordMsg({ type: 'error', text: 'Password must be 8-16 chars, with 1 uppercase and 1 special char.' });
      return;
    }

    try {
      await updatePassword(currPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  // Flattened structure for Table sorting support
  const tableData = reviews.map((rev) => ({
    id: rev.ratingId,
    name: rev.user.name,
    email: rev.user.email,
    address: rev.user.address,
    rating: rev.rating,
    date: new Date(rev.createdAt).toLocaleDateString(),
  }));

  // Define Columns for Reviews Table
  const reviewColumns: Column<any>[] = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'rating', 
      label: 'Rating Given', 
      sortable: true,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.rating}</span>
          <StarRating rating={r.rating} size={14} />
        </div>
      )
    },
    { key: 'date', label: 'Submitted On', sortable: true },
  ];

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {storeData ? `Manage metrics and reviews for ${storeData.name}` : 'Overview of owned store ratings'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('store')} className={`btn ${activeTab === 'store' ? 'btn-primary' : 'btn-secondary'}`}>Store Overview</button>
          <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}><Settings size={16} /></button>
        </div>
      </div>

      {/* Tabs Render */}

      {/* STORE METRICS TAB */}
      {activeTab === 'store' && (
        <div>
          {loadingStats ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Loading store ratings...</p>
          ) : (
            <div>
              {/* Store KPI Overview */}
              <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="glass-card stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)' }}><Star size={24} /></div>
                  <div>
                    <div className="stat-number">{averageRating || 'Unrated'}</div>
                    <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Average Rating</span>
                      <StarRating rating={Math.round(averageRating)} size={12} />
                    </div>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon"><Users size={24} /></div>
                  <div>
                    <div className="stat-number">{totalRatings}</div>
                    <div className="stat-label">Total Reviews</div>
                  </div>
                </div>
              </div>

              {/* Review details Table */}
              <div className="glass-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StoreIcon size={18} color="var(--primary)" />
                  User Review Directory
                </h3>
                <Table columns={reviewColumns} data={tableData} emptyMessage="No ratings have been submitted for your store yet" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROFILE / PASSWORD TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} />
              Update Owner Account Password
            </h3>

            {passwordMsg && (
              <div className={`alert ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Must be 8-16 characters with at least one uppercase letter and one special character.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default OwnerDashboard;
