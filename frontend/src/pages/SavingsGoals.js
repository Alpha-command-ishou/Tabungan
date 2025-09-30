import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Button, ProgressBar, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlusCircle, FaTrashAlt } from 'react-icons/fa';

const SavingsGoals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchGoals = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            const res = await axios.get('http://localhost:5000/api/user-dashboard', {
                headers: { 'x-auth-token': token }
            });
            setGoals(res.data.goals);
            setLoading(false);
        } catch (err) {
            console.error(err);
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setNewGoal({ name: '', target_amount: '' });
        setError('');
    };

    const handleChange = (e) => {
        setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newGoal.name || !newGoal.target_amount) {
            setError('Please fill in all fields.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/add-goal', newGoal, {
                headers: { 'x-auth-token': token }
            });
            handleCloseModal();
            fetchGoals();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add new goal.');
        }
    };

    const handleDeleteGoal = async (goalId) => {
        if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.delete(`http://localhost:5000/api/goal/${goalId}`, {
                    headers: { 'x-auth-token': token }
                });
                alert(res.data.msg);
                fetchGoals();
            } catch (err) {
                alert(err.response?.data?.msg || 'Error deleting goal. Please try again.');
            }
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const colors = ['#007bff', '#28a745', '#17a2b8', '#ffc107', '#dc3545'];

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Savings Goals</h2>
                <Button variant="primary" onClick={handleShowModal}>
                    <FaPlusCircle className="me-2" /> Add a new goal
                </Button>
            </div>
            <Row>
                {goals.length > 0 ? (
                    goals.map((goal, index) => (
                        <Col md={4} key={goal.id} className="mb-4">
                            <Card className="shadow-sm savings-goal-card h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <Card.Title className="mb-0">{goal.name}</Card.Title>
                                        {}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeleteGoal(goal.id)}
                                        >
                                            <FaTrashAlt />
                                        </Button>
                                    </div>
                                    <Card.Text className="text-muted">
                                        Rp{goal.current_amount.toLocaleString()} / Rp{goal.target_amount.toLocaleString()}
                                    </Card.Text>
                                    <ProgressBar
                                        now={(goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0)}
                                        className="mb-2"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                        label={`${(goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0).toFixed(0)}%`}
                                    />
                                    <Button as={Link} to={`/savings-goals/${goal.id}`} variant="outline-primary" className="w-100">
                                        View
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <p>No savings goals found.</p>
                    </Col>
                )}
            </Row>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Goal</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Goal Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newGoal.name}
                                onChange={handleChange}
                                placeholder="e.g., Vacation Fund"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Target Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="target_amount"
                                value={newGoal.target_amount}
                                onChange={handleChange}
                                placeholder="e.g., 5000000"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Goal
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default SavingsGoals;
