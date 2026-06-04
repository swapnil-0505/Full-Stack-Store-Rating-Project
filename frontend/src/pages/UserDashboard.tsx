import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';
import { 
  Store as StoreIcon, Search, MapPin, 
  Settings, Key, CheckCircle, AlertCircle 
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { apiFetch, updatePassword } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<'stores' | 'profile'>('stores');

  // Stores State
  const [stores, setStores] = useState<any[]>([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [loadingStores, setLoadingStores] = useState(true);

  // Profile/Password Update State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rating Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Fetch Stores
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.address) params.append('address', filters.address);

      const res = await apiFetch(`/stores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stores') fetchStores();
  }, [activeTab, filters]);

  // Open Modal for rating creation/modification
  const openRatingModal = (store: any) => {
    setSelectedStore(store);
    setUserRating(store.userRating || 5);
    setRatingError(null);
    setModalOpen(true);
  };

  // Submit/Modify Rating
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRatingError(null);

    if (!selectedStore) return;

    const isNew = selectedStore.userRating === null;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await apiFetch('/ratings', {
        method,
        body: JSON.stringify({
          storeId: selectedStore.id,
          rating: userRating,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchStores();
      } else {
        setRatingError(data.error || 'Failed to submit rating.');
      }
    } catch (err) {
      setRatingError('Server error submitting rating.');
    }
  };

  // Delete Rating
  const handleRatingDelete = async (storeId: number) => {
    if (!window.confirm('Are you sure you want to delete your rating?')) return;
    
    try {
      const res = await apiFetch(`/ratings/${storeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchStores();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete rating.');
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Store Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse stores, search details, and share your rating feedback</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('stores')} className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}>Stores</button>
          <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}><Settings size={16} /></button>
        </div>
      </div>

      {/* Tabs Render */}

      {/* STORES LISTING TAB */}
      {activeTab === 'stores' && (
        <div>
          {/* Search Panel */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.75rem' }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search stores by Name..."
                  className="form-input"
                  style={{ border: 'none', background: 'transparent', flex: 1, padding: '0.5rem 0' }}
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.75rem' }}>
                <MapPin size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search stores by Address..."
                  className="form-input"
                  style={{ border: 'none', background: 'transparent', flex: 1, padding: '0.5rem 0' }}
                  value={filters.address}
                  onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Stores Grid Layout */}
          {loadingStores ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Fetching stores directory...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {stores.map((store) => (
                <div key={store.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StoreIcon size={18} color="var(--primary)" />
                      {store.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '1.25rem', minHeight: '40px' }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      {store.address}
                    </p>
                  </div>

                  <div>
                    {/* Ratings display */}
                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Overall Rating</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{store.averageRating || 'Unrated'}</span>
                          <StarRating rating={Math.round(store.averageRating || 0)} size={14} />
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Your Rating</span>
                        {store.userRating !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                            <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1rem' }}>{store.userRating}</span>
                            <StarRating rating={store.userRating} size={14} />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not rated yet</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {store.userRating !== null ? (
                        <>
                          <button
                            onClick={() => openRatingModal(store)}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                          >
                            Modify Rating
                          </button>
                          <button
                            onClick={() => handleRatingDelete(store.id)}
                            className="btn btn-danger"
                            style={{ padding: '0.6rem 0.8rem' }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openRatingModal(store)}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                        >
                          Submit Rating
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {stores.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No stores match your search filters.
                </div>
              )}
            </div>
          )}

          {/* Submit/Modify Rating Modal */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={selectedStore?.userRating !== null ? 'Modify Store Rating' : 'Rate Store'}
          >
            <form onSubmit={handleRatingSubmit}>
              {ratingError && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{ratingError}</span>
                </div>
              )}

              <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                Please select a rating from 1 to 5 stars for <strong style={{ color: '#ffffff' }}>{selectedStore?.name}</strong>:
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
                <StarRating rating={userRating} interactive={true} onRatingChange={setUserRating} size={36} />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Rating</button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* UPDATE PASSWORD TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} />
              Update Account Password
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
export default UserDashboard;
