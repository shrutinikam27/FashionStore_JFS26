import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!token) {
      setErrorMsg('Password reset token is missing.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 text-center">
      <div className="glass-panel p-5 text-start max-w-md mx-auto" style={{ maxWidth: '450px', margin: '0 auto' }}>
        {success ? (
          <div className="text-center">
            <i className="bi bi-shield-check text-success display-3 mb-3"></i>
            <h4 className="fw-bold">Password Updated!</h4>
            <p className="text-secondary small mb-4">
              Your password has been reset successfully. You can now log in using your new credentials.
            </p>
            <Link to="/login" className="btn btn-premium rounded-pill px-4">
              Login Now
            </Link>
          </div>
        ) : (
          <div>
            <h4 className="fw-bold mb-1 text-center">Reset Password</h4>
            <p className="text-secondary small mb-4 text-center">Enter your new account password below.</p>
            
            {errorMsg && (
              <div className="alert alert-danger py-2 small border-0 mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold text-secondary">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-premium w-100 rounded-pill py-2.5 mt-2">
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
