import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password rules helper
  const getPasswordRules = () => {
    return {
      length: password.length >= 8 && password.length <= 16,
      upper: /[A-Z]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
  };

  const rules = getPasswordRules();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Front-end validations as per strict requirements
    if (name.trim().length < 20 || name.trim().length > 60) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }

    if (address.trim().length > 400) {
      setError('Address cannot exceed 400 characters.');
      return;
    }

    if (!rules.length || !rules.upper || !rules.special) {
      setError('Password does not meet the complexity requirements.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password, address.trim());
      navigate('/user');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Join us to explore and rate registered stores
        </p>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name ({name.length}/60)</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Min 20 characters required"
            />
            <span style={{ fontSize: '0.75rem', color: name.length >= 20 && name.length <= 60 ? 'var(--success)' : 'var(--text-muted)' }}>
              Must be between 20 and 60 characters.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address ({address.length}/400)</label>
            <textarea
              required
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your complete physical address"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            
            {/* Password checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.length ? 'var(--success)' : 'var(--text-muted)' }}>
                <CheckCircle size={12} style={{ fill: rules.length ? 'rgba(16, 185, 129, 0.1)' : 'none' }} />
                <span>8-16 characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.upper ? 'var(--success)' : 'var(--text-muted)' }}>
                <CheckCircle size={12} style={{ fill: rules.upper ? 'rgba(16, 185, 129, 0.1)' : 'none' }} />
                <span>1 uppercase letter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: rules.special ? 'var(--success)' : 'var(--text-muted)' }}>
                <CheckCircle size={12} style={{ fill: rules.special ? 'rgba(16, 185, 129, 0.1)' : 'none' }} />
                <span>1 special character</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
