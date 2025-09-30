import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, ListGroup, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Wallets = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');
    const [shareWalletEmail, setShareWalletEmail] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState(null);

    const fetchWallets = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication failed. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/api/wallets', {
                headers: {
                    'x-auth-token': token
                }
            });
            setWallets(res.data);
            setLoading(false);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch wallets.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleAddWallet = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/wallets', { name: newWalletName }, {
                headers: { 'x-auth-token': token }
            });
            setNewWalletName('');
            setShowAddModal(false);
            fetchWallets();
        } catch (err) {
            console.error(err);
            setError('Failed to create wallet.');
        }
    };

    const handleShareWallet = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/wallets/${selectedWalletId}/share`, { email: shareWalletEmail }, {
                headers: { 'x-auth-token': token }
            });
            setShareWalletEmail('');
            setShowShareModal(false);
            alert('Wallet shared successfully!');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Failed to share wallet.');
        }
    };

    const handleDeleteWallet = async (walletId) => {
        if (window.confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/wallets/${walletId}`, {
                    headers: { 'x-auth-token': token }
                });
                alert('Wallet deleted successfully!');
                fetchWallets();
            } catch (err) {
                console.error(err);
                const errorMessage = err.response?.data?.msg || 'Failed to delete wallet.';
                alert(errorMessage);
            }
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                    Your Wallets
                    <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                        + Add Wallet
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {wallets.length > 0 ? (
                        <ListGroup variant="flush">
                            {wallets.map(wallet => (
                                <ListGroup.Item key={wallet.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{wallet.name}</h6>
                                        <small>Balance: Rp{wallet.balance.toLocaleString()}</small>
                                    </div>
                                    <div className="d-flex flex-wrap justify-content-end">
                                        <Link to={`/transaction-history/${wallet.id}`}>
                                            <Button variant="info" size="sm" className="me-2 mb-2 mb-md-0">
                                                Transaction History
                                            </Button>
                                        </Link>
                                        <Link to={`/transactions/${wallet.id}`}>
                                            <Button variant="success" size="sm" className="me-2 mb-2 mb-md-0">
                                                Add Transaction
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => {
                                                setSelectedWalletId(wallet.id);
                                                setShowShareModal(true);
                                            }}
                                            className="me-2 mb-2 mb-md-0"
                                        >
                                            Share
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center">No wallets found. Create a new one to get started!</div>
                    )}
                </Card.Body>
            </Card>

            {}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Wallet</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddWallet}>
                        <Form.Group className="mb-3">
                            <Form.Label>Wallet Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newWalletName}
                                onChange={(e) => setNewWalletName(e.target.value)}
                                placeholder="e.g., Savings, Daily Expenses"
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Create Wallet
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {}
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Share Wallet</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleShareWallet}>
                        <Form.Group className="mb-3">
                            <Form.Label>User Email to Share with</Form.Label>
                            <Form.Control
                                type="email"
                                value={shareWalletEmail}
                                onChange={(e) => setShareWalletEmail(e.target.value)}
                                placeholder="e.g., user@example.com"
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Share Wallet
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Wallets;