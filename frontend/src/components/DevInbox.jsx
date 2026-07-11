import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const DevInbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);

  const fetchEmails = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/emails`);
      const data = res.data || [];
      setEmails(data.reverse()); // Show newest first
      
      if (data.length > prevCount) {
        if (!isOpen) {
          setUnreadCount(prev => prev + (data.length - prevCount));
        }
        setPrevCount(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch dev emails:', err);
    }
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [prevCount, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Helper to find links in body and convert to anchor tags
  const renderBodyWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary rounded-pill px-3 py-1 my-1 d-inline-block fw-semibold text-white text-decoration-none"
            style={{ fontSize: '0.8rem' }}
          >
            <i className="bi bi-box-arrow-up-right me-1"></i> Open Reset/Verify Link
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={handleToggle}
        className="btn btn-dark rounded-circle position-fixed shadow d-flex align-items-center justify-content-center"
        style={{
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #1f1f1f 0%, #3a3a3a 100%)',
          border: '2px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <i className="bi bi-envelope-fill fs-4 text-white"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
            style={{ fontSize: '0.75rem', padding: '0.35em 0.65em' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Sidebar Drawer */}
      {isOpen && (
        <div
          className="position-fixed shadow-lg d-flex flex-column"
          style={{
            bottom: '90px',
            right: '20px',
            width: '400px',
            height: '500px',
            zIndex: 9998,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            fontFamily: "'Outfit', sans-serif",
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            className="p-3 text-white d-flex align-items-center justify-content-between"
            style={{ background: 'linear-gradient(135deg, #2b2b2b 0%, #111111 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-terminal-fill text-warning"></i>
              <h6 className="mb-0 fw-bold">Developer Mailbox</h6>
              <span className="badge bg-secondary-subtle text-dark small" style={{ fontSize: '0.68rem' }}>Mock Inbox</span>
            </div>
            <div className="d-flex gap-2">
              <button onClick={fetchEmails} className="btn btn-sm btn-outline-light border-0 p-1">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button onClick={handleToggle} className="btn btn-sm btn-outline-light border-0 p-1">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-grow-1 overflow-y-auto p-3 d-flex flex-column gap-3" style={{ background: '#f8f9fa' }}>
            {emails.length === 0 ? (
              <div className="text-center my-auto text-muted py-5">
                <i className="bi bi-mailbox display-4 opacity-50 mb-3 d-block"></i>
                <p className="small mb-1 fw-semibold">No emails sent yet</p>
                <p className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                  Trigger a registration verification or forgot password link to see it here.
                </p>
              </div>
            ) : (
              emails.map((email, idx) => (
                <div
                  key={idx}
                  className="card border-0 shadow-sm p-3 position-relative"
                  style={{
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #111111'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-dark-subtle text-dark small" style={{ fontSize: '0.7rem' }}>
                      To: {email.to}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                      {new Date(email.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.88rem' }}>
                    {email.subject}
                  </h6>
                  <div
                    className="text-secondary small bg-light p-2.5 rounded-3 mb-1 text-start"
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      maxHeight: '120px',
                      overflowY: 'auto'
                    }}
                  >
                    {renderBodyWithLinks(email.body)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Simple animations injection */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default DevInbox;
