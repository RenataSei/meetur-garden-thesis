import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function TwoFactorSetup() {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState('initial'); // 'initial' | 'scanning' | 'success'
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Note: Adjust the URL path if your user routes are named differently (e.g., /api/users)
  const API_URL = '/api/user'; 

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/2fa/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setQrCode(data.qrCodeUrl);
        setStep('scanning');
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    }
    setLoading(false);
  };

  const verifySetup = async () => {
    if (token.length !== 6) {
      setError("Token must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/2fa/verify-setup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ token })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep('success');
      } else {
        setError(data.error || 'Invalid token, try again.');
      }
    } catch (err) {
      setError('Network error during verification.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151', maxWidth: '400px', color: '#f3f4f6' }}>
      <h3 style={{ marginTop: 0, color: '#4ade80' }}>🔒 Two-Factor Authentication</h3>
      
      {error && <div style={{ background: '#ef444433', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>{error}</div>}

      {step === 'initial' && (
        <div>
          <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>
            Protect your garden data with an extra layer of security. We support Google Authenticator, Authy, and other TOTP apps.
          </p>
          <button onClick={generateQRCode} disabled={loading} className="btn btn--blue" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Generating...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>1. Scan this code with your Authenticator app</p>
          <div style={{ background: 'white', padding: '10px', display: 'inline-block', borderRadius: '8px', margin: '15px 0' }}>
            {qrCode && <img src={qrCode} alt="2FA QR Code" style={{ width: '150px', height: '150px' }} />}
          </div>
          
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>2. Enter the 6-digit code below to confirm</p>
          <input 
            type="text" 
            placeholder="000000" 
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: 'white', fontSize: '20px', textAlign: 'center', letterSpacing: '4px', marginBottom: '15px' }}
          />
          <button onClick={verifySetup} disabled={loading || token.length < 6} className="btn btn--green" style={{ width: '100%' }}>
            {loading ? 'Verifying...' : 'Verify & Save'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
          <h4 style={{ margin: 0, color: '#8fd081' }}>2FA Enabled Successfully!</h4>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '10px' }}>Your account is now protected.</p>
        </div>
      )}
    </div>
  );
}