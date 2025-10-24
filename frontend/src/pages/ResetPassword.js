import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Gunakan useLocation untuk mengakses query params
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1. Ambil Email dan Token dari URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlEmail = params.get('email');
    const urlToken = params.get('token');

    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setToken(urlToken);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('New password and confirmation do not match.');
    }

    if (!email || !token || !newPassword) {
        return setError('All fields are required.');
    }

    try {
      // Memanggil endpoint /api/reset-password di backend
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        email,
        token,
        newPassword
      });
      
      setMessage(res.data.msg + " You will be redirected to Sign In.");
      setError('');
      setTimeout(() => navigate('/'), 3000); 

    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password. Token may be invalid or expired.');
      setMessage('');
    }
  };

  return (
    <div className="bg-primary min-vh-100 d-flex align-items-center justify-content-center">
      <Card style={{ width: '25rem' }} className="p-4 shadow-lg">
        <div className="text-center mb-4">
          <FaPiggyBank size={50} className="text-primary mb-2" />
          <h2>SecureSave</h2>
        </div>
        <h4 className="text-center mb-4">Reset Password</h4>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Field Email: Diisi otomatis jika ada di URL */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!email} // Non-aktifkan jika sudah diisi dari URL
              className={email ? 'bg-light' : ''}
            />
          </Form.Group>
          
          {/* Field Token: Diisi otomatis jika ada di URL */}
          <Form.Group className="mb-3">
            <Form.Label>Reset Token</Form.Label>
            <Form.Control
              type="text"
              placeholder="Paste the reset token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              readOnly={!!token} // Non-aktifkan jika sudah diisi dari URL
              className={token ? 'bg-light' : ''}
            />
            <Form.Text className="text-muted">
              Token expires in 1 hour.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Reset Password
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/">Back to Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;