import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, ProgressBar, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaMinus } from 'react-icons/fa';

const GoalDetail = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const fetchGoalDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/goal/${goalId}`, {
        headers: { 'x-auth-token': token }
      });
      setGoal(res.data.goal);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch goal details.');
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoalDetails();
  }, [fetchGoalDetails]);

  const handleDeposit = async () => {
    if (depositAmount <= 0) {
      setDepositError('Amount must be greater than 0.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/goal/deposit', {
        goalId,
        amount: depositAmount
      }, {
        headers: { 'x-auth-token': token }
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositError('');
      fetchGoalDetails();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to deposit.';
      setDepositError(msg);
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) {
      setWithdrawError('Amount must be greater than 0.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/goal/withdraw', {
        goalId,
        amount: withdrawAmount
      }, {
        headers: { 'x-auth-token': token }
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawError('');
      fetchGoalDetails();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to withdraw.';
      setWithdrawError(msg);
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!goal) return <Alert variant="warning">Goal not found.</Alert>;

  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{goal.name}</h2>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="mb-1 text-muted">Target Amount</p>
              <h4>Rp {parseFloat(goal.target_amount).toLocaleString('id-ID')}</h4>
            </div>
            <div>
              <p className="mb-1 text-muted">Current Amount</p>
              <h4>Rp {parseFloat(goal.current_amount).toLocaleString('id-ID')}</h4>
            </div>
            <div>
              <p className="mb-1 text-muted">Remaining</p>
              <h4>Rp {(parseFloat(goal.target_amount) - parseFloat(goal.current_amount)).toLocaleString('id-ID')}</h4>
            </div>
          </div>
          <div className="mb-3">
            <ProgressBar now={progress} label={`${progress.toFixed(2)}%`} />
          </div>
          <div className="d-flex justify-content-end">
            <Button variant="success" onClick={() => setShowDepositModal(true)} className="me-2">
              <FaPlus /> Deposit
            </Button>
            <Button variant="warning" onClick={() => setShowWithdrawModal(true)}>
              <FaMinus /> Withdraw
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {}
      <Modal show={showDepositModal} onHide={() => setShowDepositModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Deposit to {goal.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {depositError && <Alert variant="danger">{depositError}</Alert>}
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount to deposit"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDepositModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleDeposit}>
            Deposit
          </Button>
        </Modal.Footer>
      </Modal>

      {}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Withdraw from {goal.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {withdrawError && <Alert variant="danger">{withdrawError}</Alert>}
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleWithdraw}>
            Withdraw
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GoalDetail;
