import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/register', { name, email, password });
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.msg);
      } else {
        setError('Server error');
      }
    }
  };

  return (
    <div className="bg-primary min-vh-100 d-flex align-items-center justify-content-center">
      <Card style={{ width: '25rem' }} className="p-4 shadow-lg">
        <div className="text-center mb-4">
          <FaPiggyBank size={50} className="text-primary mb-2" />
          <h2>SecureSave</h2>
        </div>
        <h4 className="text-center mb-4">Sign Up</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSignup}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Sign Up
          </Button>
        </Form>
        <div className="text-center mt-3">
          Already have an account? <a href="/">Sign In</a>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
