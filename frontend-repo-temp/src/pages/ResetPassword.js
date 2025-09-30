import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        email,
        token,
        newPassword,
      });
      setMessage(res.data.msg);
      setError('');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password.');
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
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
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
