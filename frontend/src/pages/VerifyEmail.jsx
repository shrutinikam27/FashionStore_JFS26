import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setMessage('Missing email verification token.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/auth/verify-email`, {
          params: { token }
        });
        setVerified(true);
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err) {
        setVerified(false);
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    };
    triggerVerification();
  }, [token]);

  return (
    <div className="container py-5 text-center">
      <div className="glass-panel p-5 max-w-md mx-auto" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {loading ? (
          <div>
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5>Verifying Your Email Address...</h5>
            <span className="small text-secondary">Checking validation token with database...</span>
          </div>
        ) : verified ? (
          <div>
            <i className="bi bi-envelope-check-fill text-success display-3 mb-3"></i>
            <h4 className="fw-bold">Email Verified!</h4>
            <p className="text-secondary small mb-4">{message}</p>
            <Link to="/login" className="btn btn-premium rounded-pill px-4 py-2.5">
              Login to Store
            </Link>
          </div>
        ) : (
          <div>
            <i className="bi bi-envelope-exclamation-fill text-danger display-3 mb-3"></i>
            <h4 className="fw-bold">Verification Failed</h4>
            <p className="text-secondary small mb-4">{message}</p>
            <Link to="/" className="btn btn-premium-outline rounded-pill px-4">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
