import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Pagination, Form } from 'react-bootstrap';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const transactionsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      try {

        const res = await axios.get(`http://localhost:5000/api/admin-transactions?page=${currentPage}&limit=${transactionsPerPage}&search=${searchQuery}`, {
          headers: { 'x-auth-token': token }
        });
        setTransactions(res.data.transactions);

        const totalCount = res.data.totalCount;
        setTotalPages(Math.ceil(totalCount / transactionsPerPage));
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate('/');
      }
    };
    fetchTransactions();
  }, [navigate, currentPage, searchQuery, transactionsPerPage]);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <>
      <h2 className="mb-4">Transactions</h2>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Transactions List</span>
          <Form.Control
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '250px' }}
          />
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td>{(currentPage - 1) * transactionsPerPage + index + 1}</td>
                    <td>{transaction.name}</td>
                    <td className={transaction.type === 'deposit' ? 'text-success' : 'text-danger'}>
                      {transaction.type}
                    </td>
                    <td className={transaction.type === 'deposit' ? 'text-success' : 'text-danger'}>
                      {transaction.type === 'deposit' ? '+' : '-'}Rp{transaction.amount.toLocaleString()}
                    </td>
                    <td>{transaction.category || 'N/A'}</td>
                    <td>{transaction.description}</td>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </Table>
          {}
          {totalPages > 1 && (
            <Pagination className="mt-3 justify-content-center">
              {[...Array(totalPages).keys()].map(page => (
                <Pagination.Item key={page + 1} active={page + 1 === currentPage} onClick={() => paginate(page + 1)}>
                  {page + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminTransactions;
