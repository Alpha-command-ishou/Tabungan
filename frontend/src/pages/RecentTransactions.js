import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, ListGroup, Form, Pagination, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const RecentTransactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  
  const transactionsPerPage = 10;
  const navigate = useNavigate();

  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/user-dashboard', {
        headers: { 'x-auth-token': token }
      });
      setTransactions(res.data.transactions);
      setLoading(false);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchParams({ q: query, page: 1 });
  };

  const paginate = (pageNumber) => {
    setSearchParams({ q: searchQuery, page: pageNumber });
  };

  const handleDeleteTransaction = async (transactionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/transaction/${transactionId}`, {
        headers: { 'x-auth-token': token }
      });
      // Refresh the transaction list after deletion
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete transaction", err);
      alert("Failed to delete transaction. Please try again.");
    }
  };
  
  const filteredTransactions = transactions.filter(trans =>
    trans.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trans.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trans.category && trans.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (trans.wallet_name && trans.wallet_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <>
      <h2 className="mb-4">Recent Transactions</h2>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Transactions List</span>
          <Form.Control
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '250px' }}
          />
        </Card.Header>
        <ListGroup variant="flush">
          {currentTransactions.length > 0 ? (
            currentTransactions.map((trans, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center recent-transaction-item">
                <div>
                  <strong>{trans.description}</strong>
                  {trans.wallet_name && <span className="text-muted small ms-2 wallet-name">({trans.wallet_name})</span>}
                  <div className="text-muted small">
                    {new Date(trans.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <span className={`transaction-amount me-3 ${trans.type === 'deposit' || trans.type === 'interest' ? 'text-success' : 'text-danger'}`}>
                    {trans.type === 'deposit' || trans.type === 'interest' ? '+' : '-'}
                    Rp{trans.amount.toLocaleString()}
                  </span>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTransaction(trans.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>No recent transactions.</ListGroup.Item>
          )}
        </ListGroup>
        {totalPages > 1 && (
          <Pagination className="mt-3 justify-content-center">
            {[...Array(totalPages).keys()].map(page => (
              <Pagination.Item key={page + 1} active={page + 1 === currentPage} onClick={() => paginate(page + 1)}>
                {page + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        )}
      </Card>
    </>
  );
};

export default RecentTransactions;
