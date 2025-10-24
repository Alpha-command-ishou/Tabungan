import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      setTimeout(() => {
        if (res.data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }, 500);
      
    } catch (err) {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary min-vh-100 d-flex align-items-center justify-content-center">
      <Card style={{ width: '25rem' }} className="p-4 shadow-lg">
        <div className="text-center mb-4">
          <FaPiggyBank size={50} className="text-primary mb-2" />
          <h2>Smart Savings</h2>
        </div>
        <h4 className="text-center mb-4">Log In</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Form>
        <div id="forgot-password-container" className="text-center mt-3">
          <Link to="/forgot-password" className="text-decoration-none">
            Forgot Password?
          </Link>
        </div>
        <div className="text-center mt-3">
          New User? <Link to="/signup">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
