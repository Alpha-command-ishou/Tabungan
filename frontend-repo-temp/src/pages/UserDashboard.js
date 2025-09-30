import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, ListGroup, ProgressBar, Button, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaTrashAlt } from 'react-icons/fa';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);
  const navigate = useNavigate();
  
  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const dashboardRes = await axios.get('http://localhost:5000/api/user-dashboard', {
        headers: { 'x-auth-token': token }
      });
      setDashboardData(dashboardRes.data);

      const walletsRes = await axios.get('http://localhost:5000/api/wallets', {
        headers: { 'x-auth-token': token }
      });
      const totalBalance = walletsRes.data.reduce((acc, wallet) => acc + parseFloat(wallet.balance), 0);
      setTotalWalletBalance(totalBalance);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
  };
  
  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/goal/${goalId}`, {
          headers: { 'x-auth-token': token }
        });
        alert('Goal deleted successfully!');
        setSelectedGoal(null);
        fetchDashboardData();
      } catch (err) {
        console.error(err);
        alert('Error deleting goal. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /> Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-5">Error fetching data.</div>;
  }

  const { goals } = dashboardData;
  
  let progressPercentage = 0;
  let pieData = [];

  const colors = ['#007bff', '#28a745', '#17a2b8', '#ffc107', '#dc3545', '#f0f0f0'];

  if (selectedGoal) {
    progressPercentage = (selectedGoal.current_amount / selectedGoal.target_amount) * 100;
    pieData = [
      { name: selectedGoal.name, value: selectedGoal.current_amount },
      { name: 'Remaining', value: selectedGoal.target_amount - selectedGoal.current_amount }
    ];
  } else {
    const totalCurrentAmount = goals.reduce((acc, goal) => acc + goal.current_amount, 0);
    const totalTargetAmount = goals.reduce((acc, goal) => acc + goal.target_amount, 0);
    const totalRemaining = totalTargetAmount > 0 ? totalTargetAmount - totalCurrentAmount : 0;
    
    progressPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    pieData = goals.map(goal => ({
      name: goal.name,
      value: goal.current_amount
    }));
    if (totalRemaining > 0) {
      pieData.push({ name: 'Remaining', value: totalRemaining });
    }
  }

  return (
    <>
      <h2 className="mb-4">Dashboard</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="text-muted">Total Savings Balance</h5>
              <h1 className="fw-bold text-primary">Rp{(dashboardData.user.total_goals_savings || 0).toLocaleString()}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="text-muted">Goal Progress</h5>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  {pieData.length > 0 ? (
                    <>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={30}
                        outerRadius={45}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`Rp${value.toLocaleString()}`, name]} />
                    </>
                  ) : (
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-muted">No Goals</text>
                  )}
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <h3 className="fw-bold">{progressPercentage.toFixed(0)}%</h3>
                <p className="text-muted">of {selectedGoal ? selectedGoal.name : 'total goal'} reached</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              {}
              <h5 className="text-muted">Total Wallets Balance</h5>
              <h1 className="fw-bold text-primary">Rp{(totalWalletBalance || 0).toLocaleString()}</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="text-muted">My Savings Goals</h5>
              <ListGroup variant="flush">
                {goals.slice(0, 3).map((goal, index) => (
                  <ListGroup.Item
                    key={goal.id}
                    className="d-flex justify-content-between align-items-center"
                    action
                    onClick={() => handleGoalClick(goal)}
                  >
                    <div>
                      <strong>{goal.name}</strong>
                      <ProgressBar
                        now={(goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0)}
                        className="mt-2"
                        style={{ backgroundColor: colors[index % colors.length] }}
                        label={`${(goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0).toFixed(0)}%`}
                      />
                    </div>
                    <div>
                      <span>Rp{goal.current_amount.toLocaleString()} / Rp{goal.target_amount.toLocaleString()}</span>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="ms-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal.id);
                        }}
                      >
                        <FaTrashAlt />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UserDashboard;
