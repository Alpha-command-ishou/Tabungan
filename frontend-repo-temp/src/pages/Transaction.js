import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const Transaction = () => {
  const { walletId } = useParams();
  const [transactionData, setTransactionData] = useState({
    type: 'deposit',
    amount: '',
    destinationWalletId: '',
    description: ''
  });
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWallets = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/wallets', {
        headers: { 'x-auth-token': token }
      });
      setWallets(res.data);
      if (res.data.length > 0) {
        setTransactionData(prev => ({
          ...prev,
          destinationWalletId: res.data.find(w => w.id !== parseInt(walletId))?.id || ''
        }));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
      setError('Failed to load wallets. Please try again.');
      setLoading(false);
    }
  }, [navigate, walletId]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransactionData(prev => {
      const updatedData = { ...prev, [name]: value };

      if (updatedData.type === 'transfer' && !updatedData.destinationWalletId) {
        updatedData.destinationWalletId = wallets.find(w => w.id !== parseInt(walletId))?.id || '';
      }
      return updatedData;
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    const { type, amount, destinationWalletId, description } = transactionData;
    const finalAmount = parseFloat(amount);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const sourceWallet = wallets.find(w => w.id === parseInt(walletId));

    if (sourceWallet && (type === 'withdrawal' || type === 'transfer') && finalAmount > sourceWallet.balance) {
      setError('Insufficient funds in the selected wallet.');
      return;
    }

    if (type === 'transfer' && parseInt(walletId) === parseInt(destinationWalletId)) {
      setError('Source and destination wallets cannot be the same for a transfer.');
      return;
    }

    try {
      const payload = {
        type,
        amount: finalAmount,
        sourceWalletId: parseInt(walletId),
        destinationWalletId: type === 'transfer' ? parseInt(destinationWalletId) : null,
        description,
      };

      const res = await axios.post('http://localhost:5000/api/transaction', payload, {
        headers: { 'x-auth-token': token }
      });
      setSuccess(res.data.msg);
      setError('');
      setTransactionData(prev => ({
        ...prev,
        amount: '',
        description: ''
      }));
      fetchWallets();
    } catch (err) {
      setError(err.response?.data?.msg || 'Transaction failed.');
      setSuccess('');
    }
  };

  const selectedWallet = wallets.find(w => w.id === parseInt(walletId));

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /> Loading wallets...</div>;
  }

  if (!selectedWallet) {
    return <div className="text-center mt-5"><Alert variant="danger">Wallet not found.</Alert></div>;
  }

  return (
    <>
      <h2 className="mb-4">Add Transaction for {selectedWallet.name}</h2>
      <Row className="mb-4 justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5>Current Balance: <span className="text-primary">Rp{(selectedWallet.balance || 0).toLocaleString()}</span></h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Type</Form.Label>
                  <Form.Select name="type" value={transactionData.type} onChange={handleChange} required>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={transactionData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            {transactionData.type === 'transfer' && (
              <Form.Group className="mb-3">
                <Form.Label>Destination Wallet</Form.Label>
                <Form.Select name="destinationWalletId" value={transactionData.destinationWalletId} onChange={handleChange} required>
                  {wallets.filter(wallet => wallet.id !== parseInt(walletId)).map(wallet => (
                    <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={transactionData.description}
                onChange={handleChange}
                placeholder=""
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Submit Transaction
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default Transaction;
