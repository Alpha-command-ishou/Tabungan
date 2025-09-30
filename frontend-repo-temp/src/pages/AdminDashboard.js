import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Form, Pagination, Alert } from 'react-bootstrap';
import { FaUsers, FaMoneyBillWave, FaUserPlus } from 'react-icons/fa';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalActivityCount, setTotalActivityCount] = useState(0);
  const [error, setError] = useState('');
  const transactionsPerPage = 10;
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/admin-dashboard?page=${currentPage}&limit=${transactionsPerPage}&search=${searchQuery}`, {
        headers: { 'x-auth-token': token }
      });
      setDashboardData(res.data);
      setRecentActivity(Array.isArray(res.data.recentActivity) ? res.data.recentActivity : []);
      setTotalActivityCount(res.data.totalActivityCount || 0);
      setLoading(false);
      setError('');
    } catch (err) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError(err.response?.data?.msg || 'Failed to fetch dashboard data.');
      }
    }
  }, [navigate, currentPage, transactionsPerPage, searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDashboardData();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchDashboardData, searchQuery]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5"><Alert variant="danger">{error}</Alert></div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-5">Error fetching data.</div>;
  }

  const { totalUsers, totalSavings, newUsersToday } = dashboardData;
  const indexOfFirstTransaction = (currentPage - 1) * transactionsPerPage;
  const totalPages = Math.ceil(totalActivityCount / transactionsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <FaUsers size={40} className="text-primary mb-3 card-icon" />
              <h5 className="text-muted">Total Users</h5>
              <h1 className="fw-bold">{totalUsers}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <FaMoneyBillWave size={40} className="text-success mb-3 card-icon" />
              <h5 className="text-muted">Total Savings</h5>
              <h1 className="fw-bold">Rp{(totalSavings || 0).toLocaleString()}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <FaUserPlus size={40} className="text-info mb-3 card-icon" />
              <h5 className="text-muted">New Users Today</h5>
              <h1 className="fw-bold">{newUsersToday}</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          Recent Activity
          <Form.Control
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '250px' }}
          />
        </Card.Header>
        <ListGroup variant="flush" className="table-recent-activity">
          {recentActivity.length > 0 ? (
            <ListGroup.Item className="d-flex bg-light fw-bold">
              <Col md={1}>#</Col>
              <Col md={2}>User Name</Col>
              <Col md={3}>Email</Col>
              <Col md={2}>Type</Col>
              <Col md={2}>Amount</Col>
              <Col md={2}>Category</Col>
            </ListGroup.Item>
          ) : (
            <ListGroup.Item>No recent activity.</ListGroup.Item>
          )}
          {recentActivity.length > 0 && recentActivity.map((activity, index) => (
            <ListGroup.Item key={index}>
              <Row>
                <Col md={1}>{indexOfFirstTransaction + index + 1}</Col>
                <Col md={2}>{activity.name}</Col>
                <Col md={3}>{activity.email}</Col>
                <Col md={2} className={activity.type === 'deposit' ? 'text-success' : 'text-danger'}>
                  {activity.type}
                </Col>
                <Col md={2} className={activity.type === 'deposit' ? 'text-success' : 'text-danger'}>
                  {activity.type === 'deposit' ? '+' : '-'}Rp{activity.amount.toLocaleString()}
                </Col>
                <Col md={2}>{activity.category || 'N/A'}</Col>
              </Row>
            </ListGroup.Item>
          ))}
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

export default AdminDashboard;
