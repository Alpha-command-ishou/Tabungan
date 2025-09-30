import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Table, Button } from 'react-bootstrap';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                const res = await axios.get(`http://localhost:5000/api/admin/user/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setUser(res.data.user);
                setTransactions(res.data.transactions);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
                if (err.response && err.response.status === 404) {
                    setError('User not found.');
                } else if (err.response && err.response.status === 403) {
                    setError('Access denied.');
                } else {
                    setError('Failed to fetch user details.');
                }
            }
        };

        fetchUserDetails();
    }, [id, navigate]);

    const handleResetPassword = async () => {
        if (window.confirm('Are you sure you want to reset this user\'s password? A new password will be generated.')) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post(`http://localhost:5000/api/admin/reset-password/${id}`, {}, {
                    headers: { 'x-auth-token': token }
                });
                alert(`Password reset successful! New password: ${res.data.newPassword}`);
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.msg || 'Failed to reset password.');
            }
        }
    };

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger" className="text-center mt-5">{error}</Alert>;
    }

    if (!user) {
        return <Alert variant="warning" className="text-center mt-5">User data not available.</Alert>;
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>User Details</h2>
                <Button variant="warning" onClick={handleResetPassword}>
                    Reset Password
                </Button>
            </div>
            <Card className="shadow-sm mb-4">
                <Card.Header>Profile Information</Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item><strong>Name:</strong> {user.name}</ListGroup.Item>
                        <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
                        <ListGroup.Item><strong>Role:</strong> {user.role}</ListGroup.Item>
                        <ListGroup.Item><strong>Joined Date:</strong> {new Date(user.created_at).toLocaleDateString()}</ListGroup.Item>
                    </ListGroup>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Header>Transaction History</Card.Header>
                <Card.Body>
                    {transactions.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(trans => (
                                    <tr key={trans.id}>
                                        <td>{new Date(trans.created_at).toLocaleString()}</td>
                                        <td>{trans.type}</td>
                                        <td>Rp{trans.amount.toLocaleString()}</td>
                                        <td>{trans.description}</td>
                                        <td>{trans.category || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="text-center">No transactions found for this user.</p>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default UserDetails;
