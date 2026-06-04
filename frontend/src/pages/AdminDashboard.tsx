import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table } from '../components/Table';
import type { Column } from '../components/Table';
import { StarRating } from '../components/StarRating';
import { 
  Users, Store as StoreIcon, Star, Plus, Shield, 
  Settings, Key, CheckCircle, AlertCircle 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { apiFetch, updatePassword } = useAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'users' | 'profile'>('overview');

  // Stats State
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });

  // Profile/Password Update State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Users Listing & Adding State
  const [users, setUsers] = useState<any[]>([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stores Listing & Adding State
  const [stores, setStores] = useState<any[]>([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerAddress: '',
  });
  const [storeMsg, setStoreMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await apiFetch('/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams();
      if (userFilters.name) params.append('name', userFilters.name);
      if (userFilters.email) params.append('email', userFilters.email);
      if (userFilters.address) params.append('address', userFilters.address);
      if (userFilters.role) params.append('role', userFilters.role);

      const res = await apiFetch(`/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const params = new URLSearchParams();
      if (storeFilters.name) params.append('name', storeFilters.name);
      if (storeFilters.email) params.append('email', storeFilters.email);
      if (storeFilters.address) params.append('address', storeFilters.address);

      const res = await apiFetch(`/admin/stores?${params.toString()}`);
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
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userFilters]);

  useEffect(() => {
    if (activeTab === 'stores') fetchStores();
  }, [activeTab, storeFilters]);

  // Handle Add User Form Submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);

    // Strict Validations
    if (userForm.name.trim().length < 20 || userForm.name.trim().length > 60) {
      setUserMsg({ type: 'error', text: 'Name must be between 20 and 60 characters.' });
      return;
    }
    if (userForm.address.trim().length > 400) {
      setUserMsg({ type: 'error', text: 'Address cannot exceed 400 characters.' });
      return;
    }
    if (userForm.password.length < 8 || userForm.password.length > 16 || !/[A-Z]/.test(userForm.password) || !/[^a-zA-Z0-9]/.test(userForm.password)) {
      setUserMsg({ type: 'error', text: 'Password must be 8-16 chars with at least 1 uppercase and 1 special char.' });
      return;
    }

    try {
      const res = await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUserMsg({ type: 'success', text: 'User created successfully.' });
        setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
        fetchUsers();
        fetchStats();
      } else {
        setUserMsg({ type: 'error', text: data.error || 'Failed to create user.' });
      }
    } catch (err: any) {
      setUserMsg({ type: 'error', text: 'Server error creating user.' });
    }
  };

  // Handle Add Store Form Submission
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreMsg(null);

    // Store validations
    if (storeForm.storeName.trim().length < 20 || storeForm.storeName.trim().length > 60) {
      setStoreMsg({ type: 'error', text: 'Store name must be between 20 and 60 characters.' });
      return;
    }
    if (storeForm.storeAddress.trim().length > 400) {
      setStoreMsg({ type: 'error', text: 'Store address cannot exceed 400 characters.' });
      return;
    }

    // Owner validations
    if (storeForm.ownerName.trim().length < 20 || storeForm.ownerName.trim().length > 60) {
      setStoreMsg({ type: 'error', text: 'Owner name must be between 20 and 60 characters.' });
      return;
    }
    if (storeForm.ownerAddress.trim().length > 400) {
      setStoreMsg({ type: 'error', text: 'Owner address cannot exceed 400 characters.' });
      return;
    }
    const pw = storeForm.ownerPassword;
    if (pw.length < 8 || pw.length > 16 || !/[A-Z]/.test(pw) || !/[^a-zA-Z0-9]/.test(pw)) {
      setStoreMsg({ type: 'error', text: 'Owner password must be 8-16 chars with at least 1 uppercase and 1 special char.' });
      return;
    }

    try {
      const res = await apiFetch('/admin/stores', {
        method: 'POST',
        body: JSON.stringify(storeForm),
      });
      const data = await res.json();
      if (res.ok) {
        setStoreMsg({ type: 'success', text: 'Store and Owner account created successfully.' });
        setStoreForm({
          storeName: '',
          storeEmail: '',
          storeAddress: '',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: '',
          ownerAddress: '',
        });
        fetchStores();
        fetchStats();
      } else {
        setStoreMsg({ type: 'error', text: data.error || 'Failed to create store.' });
      }
    } catch (err) {
      setStoreMsg({ type: 'error', text: 'Server error creating store.' });
    }
  };

  // Handle Update Password Submission
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    // Validation
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

  // Define Columns for Users Table
  const userColumns: Column<any>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (u) => (
        <span className="navbar-user-role" style={{
          background: u.role === 'admin' ? 'rgba(16, 185, 129, 0.15)' : u.role === 'store_owner' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 58, 237, 0.15)',
          color: u.role === 'admin' ? 'var(--success)' : u.role === 'store_owner' ? 'var(--gold)' : 'var(--primary)',
          borderColor: 'transparent',
        }}>
          {u.role}
        </span>
      )
    },
    {
      key: 'storeRating',
      label: 'Store Rating',
      sortable: true,
      render: (u) => {
        if (u.role !== 'store_owner') return <span style={{ color: 'var(--text-muted)' }}>-</span>;
        if (!u.store) return <span style={{ color: 'var(--text-muted)' }}>No Store</span>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>{u.storeRating || 0}</span>
            <StarRating rating={Math.round(u.storeRating || 0)} size={14} />
          </div>
        );
      }
    }
  ];

  // Define Columns for Stores Table
  const storeColumns: Column<any>[] = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'averageRating',
      label: 'Average Rating',
      sortable: true,
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>{s.averageRating || 'Unrated'}</span>
          <StarRating rating={Math.round(s.averageRating || 0)} size={14} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({s.ratingsCount})</span>
        </div>
      )
    }
  ];

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage registered users, stores, and oversee ratings</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('overview')} className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}>Overview</button>
          <button onClick={() => setActiveTab('stores')} className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}>Stores</button>
          <button onClick={() => setActiveTab('users')} className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}>Users</button>
          <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}><Settings size={16} /></button>
        </div>
      </div>

      {/* Tabs Render */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats KPI Widgets */}
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-icon"><Users size={24} /></div>
              <div>
                <div className="stat-number">{loadingStats ? '...' : stats.users}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-icon"><StoreIcon size={24} /></div>
              <div>
                <div className="stat-number">{loadingStats ? '...' : stats.stores}</div>
                <div className="stat-label">Total Stores</div>
              </div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-icon"><Star size={24} /></div>
              <div>
                <div className="stat-number">{loadingStats ? '...' : stats.ratings}</div>
                <div className="stat-label">Submitted Ratings</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--primary)" />
              System Overview & Operations
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Welcome to the StoreRating management back-office. Use the navigation buttons above to add new business locations, create store owners, register normal or administrative accounts, and search or sort records instantly.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setActiveTab('stores')} className="btn btn-primary"><Plus size={16} /> Add Store</button>
              <button onClick={() => setActiveTab('users')} className="btn btn-secondary"><Plus size={16} /> Add User</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STORES TAB */}
      {activeTab === 'stores' && (
        <div className="dashboard-grid">
          {/* Add Store Form */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StoreIcon size={18} />
              Register Store & Owner
            </h3>

            {storeMsg && (
              <div className={`alert ${storeMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {storeMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{storeMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAddStore}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Store Details</h4>
              <div className="form-group">
                <label className="form-label">Store Name ({storeForm.storeName.length}/60)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  placeholder="Min 20 characters"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Store Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={storeForm.storeEmail}
                  onChange={(e) => setStoreForm({ ...storeForm, storeEmail: e.target.value })}
                  placeholder="store@domain.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Store Address</label>
                <textarea
                  required
                  className="form-input"
                  style={{ minHeight: '60px' }}
                  value={storeForm.storeAddress}
                  onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
                  placeholder="Max 400 characters"
                />
              </div>

              <h4 style={{ color: 'var(--gold)', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Store Owner Account</h4>
              <div className="form-group">
                <label className="form-label">Owner Name ({storeForm.ownerName.length}/60)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={storeForm.ownerName}
                  onChange={(e) => setStoreForm({ ...storeForm, ownerName: e.target.value })}
                  placeholder="Min 20 characters"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={storeForm.ownerEmail}
                  onChange={(e) => setStoreForm({ ...storeForm, ownerEmail: e.target.value })}
                  placeholder="owner@domain.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={storeForm.ownerPassword}
                  onChange={(e) => setStoreForm({ ...storeForm, ownerPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Owner Address</label>
                <textarea
                  required
                  className="form-input"
                  style={{ minHeight: '60px' }}
                  value={storeForm.ownerAddress}
                  onChange={(e) => setStoreForm({ ...storeForm, ownerAddress: e.target.value })}
                  placeholder="Max 400 characters"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Store & Owner</button>
            </form>
          </div>

          {/* Stores Listing */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>Store Listings</h3>
            
            {/* Filter Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search by Name"
                className="form-input"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Search by Email"
                className="form-input"
                value={storeFilters.email}
                onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Search by Address"
                className="form-input"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
              />
            </div>

            {loadingStores ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading stores...</p>
            ) : (
              <Table columns={storeColumns} data={stores} emptyMessage="No stores match the search criteria" />
            )}
          </div>
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeTab === 'users' && (
        <div className="dashboard-grid">
          {/* Add User Form */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} />
              Add Admin/Normal User
            </h3>

            {userMsg && (
              <div className={`alert ${userMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {userMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{userMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Full Name ({userForm.name.length}/60)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Min 20 characters"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="user@domain.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  required
                  className="form-input"
                  style={{ minHeight: '85px' }}
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  placeholder="Max 400 characters"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="user">Normal User</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create User</button>
            </form>
          </div>

          {/* Users Listing */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>All Registered Users</h3>
            
            {/* Filter Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Name"
                className="form-input"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Email"
                className="form-input"
                value={userFilters.email}
                onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address"
                className="form-input"
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
              />
              <select
                className="form-select"
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>

            {loadingUsers ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading users...</p>
            ) : (
              <Table columns={userColumns} data={users} emptyMessage="No users match the search filters" />
            )}
          </div>
        </div>
      )}

      {/* 4. PROFILE / SETTINGS TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} />
              Update Administrator Password
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
export default AdminDashboard;
