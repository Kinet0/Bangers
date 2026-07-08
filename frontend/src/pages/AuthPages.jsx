import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPages() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTarget = searchParams.get('redirect') || 'dashboard';

  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone
        });
      }
      navigate(`/${redirectTarget}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        {/* Toggle headers */}
        <div style={styles.toggleRow}>
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{ ...styles.toggleBtn, borderBottomColor: isLogin ? 'var(--accent-color)' : 'transparent', color: isLogin ? '#fff' : 'var(--text-secondary)' }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{ ...styles.toggleBtn, borderBottomColor: !isLogin ? 'var(--accent-color)' : 'transparent', color: !isLogin ? '#fff' : 'var(--text-secondary)' }}
          >
            Create Account
          </button>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="name@example.com"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Phone Contact Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-control"
                placeholder="555-0100"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
            {loading ? 'Authenticating...' : isLogin ? 'Access Account' : 'Register Profile'}
          </button>
        </form>

        {isLogin ? (
          <div style={styles.infoFooter}>
            <p style={styles.infoText}>
              Testing credentials:<br />
              Customer: <code>customer@aurawear.com</code> / any password<br />
              Admin Staff: <code>admin@aurawear.com</code> / any password
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '80px',
    paddingBottom: '100px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  toggleRow: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
  },
  toggleBtn: {
    flex: 1,
    padding: '16px 0',
    fontSize: '1rem',
    fontWeight: 500,
    borderBottom: '2px solid transparent',
    transition: 'var(--transition-smooth)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px 0',
    marginTop: '16px',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: '0.85rem',
    marginTop: '8px',
  },
  infoFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  infoText: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    lineHeight: 1.5,
  }
};
