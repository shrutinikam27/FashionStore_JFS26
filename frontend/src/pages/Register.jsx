import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// Indian mobile: optional +91, then 10 digits starting with 7/8/9
const validatePhone = (val) => /^(\+91)?[789]\d{9}$/.test(val.replace(/\s/g, ''));

const passwordRules = [
  { id: 'length',  label: 'At least 8 characters',                   test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter (A-Z)',      test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'At least one number (0-9)',                test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'At least one special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const Register = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone,           setPhone]           = useState('');
  const [showPwRules,     setShowPwRules]     = useState(false);

  const [loading,    setLoading]    = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg,   setErrorMsg]   = useState(null);

  const pwChecks  = passwordRules.map((r) => ({ ...r, passed: r.test(password) }));
  const allPassed = pwChecks.every((r) => r.passed);

  // Decode JWT to extract user info
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch { return null; }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const decoded = decodeJwt(credentialResponse.credential);
      if (!decoded || !decoded.email) throw new Error('Failed to decode Google credentials');

      const backendRes = await axios.post('http://localhost:8080/api/auth/google', {
        email: decoded.email,
        firstName: decoded.given_name || decoded.name || 'Google',
        lastName: decoded.family_name || 'User',
      });
      const data = backendRes.data;
      localStorage.setItem('fs_token', data.token);
      localStorage.setItem('fs_user', JSON.stringify({
        email: data.email, firstName: data.firstName,
        lastName: data.lastName, role: data.role, id: data.userId
      }));
      navigate(data.role === 'ADMIN' ? '/admin' : '/');
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Google SSO registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!allPassed) {
      setErrorMsg('Please make sure your password meets all the requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }
    if (phone && !validatePhone(phone)) {
      setErrorMsg('Please enter a valid Indian mobile number starting with 7, 8, or 9.');
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, password, firstName, lastName, phone);
      setSuccessMsg(response.message || 'Registration successful!');
      setFirstName(''); setLastName(''); setEmail('');
      setPassword(''); setConfirmPassword(''); setPhone('');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setErrorMsg('An account with this email address already exists. Please log in or use a different email.');
      } else {
        setErrorMsg(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 text-center">
      <div className="glass-panel p-5 text-start" style={{ maxWidth: '480px', margin: '0 auto' }}>

        {successMsg ? (
          <div className="text-center">
            <i className="bi bi-patch-check-fill text-success display-3 mb-3"></i>
            <h4 className="fw-bold">Account Created!</h4>
            <p className="text-secondary small mb-4">{successMsg}</p>
            <Link to="/login" className="btn btn-premium rounded-pill px-4">
              Go to Login
            </Link>
          </div>
        ) : (
          <div>
            <h4 className="fw-bold mb-1 text-center">Create Account</h4>
            <p className="text-secondary small mb-4 text-center">Register to start saving styles and checkout orders.</p>

            {errorMsg && (
              <div className="alert alert-danger py-2 small border-0 mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errorMsg}
                {errorMsg.includes('already exists') && (
                  <div className="mt-2">
                    <Link to="/login" className="alert-link fw-semibold">Click here to Login →</Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {/* Name row */}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">First Name</label>
                  <input
                    type="text" className="form-control" placeholder="John"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    required pattern="^[A-Za-z]+$" title="Only letters allowed"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Last Name</label>
                  <input
                    type="text" className="form-control" placeholder="Doe"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    required pattern="^[A-Za-z]+$" title="Only letters allowed"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email" className="form-control" placeholder="name@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>

              {/* Password */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className={`form-control ${password && (allPassed ? 'is-valid' : 'is-invalid')}`}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setShowPwRules(true); }}
                  onFocus={() => setShowPwRules(true)}
                  required
                />
                {/* Live password rules checklist */}
                {showPwRules && (
                  <div className="mt-2 p-2 rounded" style={{ background: 'rgba(0,0,0,0.04)', fontSize: '0.78rem' }}>
                    {pwChecks.map((rule) => (
                      <div
                        key={rule.id}
                        className={`d-flex align-items-center gap-2 mb-1 ${rule.passed ? 'text-success' : 'text-secondary'}`}
                      >
                        <i className={`bi ${rule.passed ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${confirmPassword && (confirmPassword === password ? 'is-valid' : 'is-invalid')}`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && confirmPassword !== password && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-x-circle-fill me-1"></i>Passwords do not match
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ fontSize: '0.88rem' }}>+91</span>
                  <input
                    type="tel"
                    className={`form-control ${phone && (validatePhone(phone) ? 'is-valid' : 'is-invalid')}`}
                    placeholder="7XXXXXXXXX / 8XXXXXXXXX / 9XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    pattern="(\+91)?[789]\d{9}"
                    title="Enter a valid Indian mobile number starting with 7, 8, or 9"
                  />
                </div>
                {phone && !validatePhone(phone) && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-x-circle-fill me-1"></i>
                    Must be a 10-digit number starting with 7, 8, or 9 (e.g. 9876543210 or +919876543210)
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn btn-premium w-100 rounded-pill py-2 mt-1">
                {loading
                  ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  : 'Create Account'}
              </button>

              <div className="d-flex align-items-center my-1 text-secondary">
                <hr className="flex-grow-1 my-0 opacity-25" />
                <span className="px-3 small" style={{ fontSize: '0.72rem' }}>OR REGISTER WITH</span>
                <hr className="flex-grow-1 my-0 opacity-25" />
              </div>

              {/* Google's official Sign-In button */}
              <div className="d-flex justify-content-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg('Google sign-in failed. Please try again.')}
                  shape="pill"
                  size="large"
                  width="350"
                  text="continue_with"
                  theme="outline"
                />
              </div>

              <p className="text-center small text-secondary mt-1 mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none text-primary fw-semibold">Login</Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
