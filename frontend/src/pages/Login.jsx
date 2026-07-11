import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState(null);
  const [forgotError, setForgotError] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Decode JWT ID token to extract user info (no library needed)
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      // Decode the ID token to get user info
      const decoded = decodeJwt(credentialResponse.credential);
      if (!decoded || !decoded.email) {
        throw new Error('Failed to decode Google credentials');
      }

      // Send user info to our backend
      const backendRes = await axios.post(`${API_URL}/auth/google`, {
        email: decoded.email,
        firstName: decoded.given_name || decoded.name || 'Google',
        lastName: decoded.family_name || 'User',
      });
      const data = backendRes.data;

      // Store auth data
      localStorage.setItem('fs_token', data.token);
      localStorage.setItem('fs_user', JSON.stringify({
        email: data.email, firstName: data.firstName,
        lastName: data.lastName, role: data.role, id: data.userId
      }));
      navigate(data.role === 'ADMIN' ? '/admin' : (data.role === 'DELIVERY_PERSON' ? '/delivery' : (data.role === 'AGENCY' ? '/agency' : '/')));
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Google SSO login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const response = await login(email, password);
      navigate(response.role === 'ADMIN' ? '/admin' : (response.role === 'DELIVERY_PERSON' ? '/delivery' : (response.role === 'AGENCY' ? '/agency' : '/')));
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotError(null);
    setForgotLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      setForgotMsg(response.data.message || 'Password reset link sent to your email.');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to request password reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container py-5 text-center">
      <div className="glass-panel p-5 text-start" style={{ maxWidth: '420px', margin: '0 auto' }}>
        
        {showForgot ? (
          <div>
            <h4 className="fw-bold mb-1 text-center">Forgot Password</h4>
            <p className="text-secondary small mb-4 text-center">
              Enter your email address and we'll send a link to reset your password.
            </p>
            {forgotMsg && <div className="alert alert-success small py-2">{forgotMsg}</div>}
            {forgotError && <div className="alert alert-danger small py-2">{forgotError}</div>}
            <form onSubmit={handleForgotPassword} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input type="email" className="form-control" placeholder="name@email.com"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={forgotLoading} className="btn btn-premium w-100 rounded-pill py-2 mt-2">
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button"
                onClick={() => { setShowForgot(false); setForgotMsg(null); setForgotError(null); }}
                className="btn btn-link text-decoration-none text-center text-muted small mt-2 w-100">
                Return to Login
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h4 className="fw-bold mb-1 text-center">Sign In</h4>
            <p className="text-secondary small mb-4 text-center">Welcome back! Access your profile dashboard.</p>

            {errorMsg && (
              <div className="alert alert-danger py-2 small border-0 mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input type="email" className="form-control" placeholder="name@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input type="password" className="form-control" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="text-end">
                <button type="button" onClick={() => setShowForgot(true)}
                  className="btn btn-link p-0 text-decoration-none small text-muted" style={{ fontSize: '0.8rem' }}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" disabled={loading} className="btn btn-premium w-100 rounded-pill py-2 mt-2">
                {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : 'Login'}
              </button>

              <div className="d-flex align-items-center my-3 text-secondary">
                <hr className="flex-grow-1 my-0 opacity-25" />
                <span className="px-3 small" style={{ fontSize: '0.72rem' }}>OR CONTINUE WITH</span>
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

              <p className="text-center small text-secondary mt-3 mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none text-primary fw-semibold">Register</Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
