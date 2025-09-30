import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setMessage(res.data.msg);
      setToken(res.data.token);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send password reset request.');
      setMessage('');
      setToken(null);
    }
  };

  return (
    <div className="bg-primary min-vh-100 d-flex align-items-center justify-content-center">
      <Card style={{ width: '25rem' }} className="p-4 shadow-lg">
        <div className="text-center mb-4">
          <FaPiggyBank size={50} className="text-primary mb-2" />
          <h2>SecureSave</h2>
        </div>
        <h4 className="text-center mb-4">Forgot Password</h4>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {token && (
          <Alert variant="info">
            <strong>Token Simulation:</strong> Copy this token for the next page: <strong>{token}</strong>
          </Alert>
        )}
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
          <Button variant="primary" type="submit" className="w-100">
            Send Reset Link
          </Button>
        </Form>
        <div className="text-center mt-3">
          Remember your password? <Link to="/">Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
