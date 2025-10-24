// UserDetails.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Table, Button, Form, Row, Col } from 'react-bootstrap'; // Import Row, Col

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [newRole, setNewRole] = useState('');
    const [updateStatus, setUpdateStatus] = useState({ success: '', error: '' });

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
                setNewRole(res.data.user.role); 
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

    // Fungsi handler untuk reset password
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
    
    // Fungsi handler untuk mengubah role
    const handleRoleUpdate = async (e) => {
        e.preventDefault();
        setUpdateStatus({ success: '', error: '' });
        
        if (newRole === user.role) {
            setUpdateStatus({ error: 'Role is already set to this value.', success: '' });
            return;
        }

        if (!window.confirm(`Are you sure you want to change the role to ${newRole}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/admin/user/${id}/role`, { role: newRole }, {
                headers: { 'x-auth-token': token }
            });
            
            setUser(prevUser => ({ ...prevUser, role: newRole }));
            setUpdateStatus({ success: res.data.msg, error: '' });
        } catch (err) {
            console.error(err);
            setNewRole(user.role); 
            setUpdateStatus({ success: '', error: err.response?.data?.msg || 'Failed to update user role.' });
        }
    };
    
    // START: Fungsi handler untuk menghapus pengguna
    const handleDeleteUser = async () => {
        if (window.confirm('WARNING! Are you absolutely sure you want to delete this user? This action is irreversible.')) {
            try {
                const token = localStorage.getItem('token');
                
                // Tambahkan endpoint DELETE di server.js! (Lihat Catatan di bawah)
                const res = await axios.delete(`http://localhost:5000/api/admin/user/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                
                alert('User deleted successfully!');
                navigate('/admin-users'); // Arahkan kembali ke daftar pengguna setelah penghapusan
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.msg || 'Failed to delete user. Check server logs.');
            }
        }
    };
    // END: Fungsi handler untuk menghapus pengguna

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
            <Row className="d-flex justify-content-between align-items-center mb-4">
                <Col>
                    <h2>User Details: {user.name}</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="warning" onClick={handleResetPassword} className="me-2">
                        Reset Password
                    </Button>
                    {/* Tombol Hapus Pengguna */}
                    <Button variant="danger" onClick={handleDeleteUser}>
                        Delete User
                    </Button>
                </Col>
            </Row>
            
            {/* Tampilkan pesan status update role */}
            {updateStatus.success && <Alert variant="success">{updateStatus.success}</Alert>}
            {updateStatus.error && <Alert variant="danger">{updateStatus.error}</Alert>}
            
            <Card className="shadow-sm mb-4">
                <Card.Header>Profile Information</Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item><strong>Name:</strong> {user.name}</ListGroup.Item>
                        <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
                        <ListGroup.Item><strong>Joined Date:</strong> {new Date(user.created_at).toLocaleDateString()}</ListGroup.Item>
                    </ListGroup>
                    
                    {/* Form untuk mengubah role */}
                    <Form onSubmit={handleRoleUpdate} className="mt-3 p-3 border rounded">
                        <Form.Group controlId="userRole" className="d-flex align-items-center">
                            <Form.Label className="me-3 mb-0" style={{ width: '100px' }}>
                                <strong>Role:</strong>
                            </Form.Label>
                            <Form.Select 
                                value={newRole} 
                                onChange={(e) => setNewRole(e.target.value)}
                                className="me-3"
                                style={{ maxWidth: '200px' }}
                                // Nonaktifkan jika pengguna mencoba mengubah role-nya sendiri
                                disabled={localStorage.getItem('userId') === id} 
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                            <Button variant="primary" type="submit"
                                // Nonaktifkan jika pengguna mencoba mengubah role-nya sendiri
                                disabled={localStorage.getItem('userId') === id}
                            >
                                Update Role
                            </Button>
                        </Form.Group>
                        {localStorage.getItem('userId') === id && (
                             <Form.Text className="text-danger">You cannot change your own role via this endpoint.</Form.Text>
                        )}
                    </Form>
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