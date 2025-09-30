import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const TransactionHistory = () => {
    const { walletId } = useParams();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('monthly');
    const navigate = useNavigate();

    const fetchTransactions = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/transactions/filter?timeframe=${timeframe}&walletId=${walletId}`, {
                headers: { 'x-auth-token': token }
            });
            setTransactions(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
            }
        }
    }, [timeframe, navigate, walletId]);

    useEffect(() => {
        if (walletId) {
            fetchTransactions();
        } else {
            setLoading(false);
        }
    }, [fetchTransactions, walletId]);

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /> Loading...</div>;
    }

    const aggregateDataByTimeframe = (data, tf) => {
        return data.reduce((acc, trans) => {
            const date = moment(trans.created_at);
            let key;

            if (tf === 'weekly') {
                key = date.startOf('isoWeek').format('YYYY-MM-DD');
            } else if (tf === 'monthly') {
                key = date.format('YYYY-MM');
            } else {
                key = date.format('YYYY');
            }

            if (!acc[key]) {
                acc[key] = { name: key, deposits: 0, withdrawals: 0 };
            }

            if (trans.type === 'deposit') {
                acc[key].deposits += trans.amount;
            } else if (trans.type === 'withdrawal') {
                acc[key].withdrawals += trans.amount;
            }
            return acc;
        }, {});
    };

    const aggregatedData = aggregateDataByTimeframe(transactions, timeframe);
    const transactionChartData = Object.values(aggregatedData);

    const calculateCumulativeBalance = (data) => {
        let currentBalance = 0;
        return data.map(item => {
            currentBalance += (item.deposits - item.withdrawals);
            return { ...item, balance: currentBalance };
        });
    };

    const cumulativeChartData = calculateCumulativeBalance(transactionChartData);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Transaction History</h2>
            <Card className="shadow-sm mb-4">
                <Card.Header>Transaction History Graph</Card.Header>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={4} className="d-flex align-items-center">
                            <Form.Label className="me-2 mb-0">View:</Form.Label>
                            <Form.Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </Form.Select>
                        </Col>
                    </Row>
                    {cumulativeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={cumulativeChartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" stroke="#007bff" width={100} tickFormatter={(value) => `Rp${value.toLocaleString()}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" width={100} tickFormatter={(value) => `Rp${value.toLocaleString()}`} />
                                <Tooltip formatter={(value) => `Rp${value.toLocaleString()}`} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="balance" stroke="#007bff" name="Total Balance" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line yAxisId="right" type="monotone" dataKey="deposits" stroke="#28a745" name="Total Deposits" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line yAxisId="right" type="monotone" dataKey="withdrawals" stroke="#dc3545" name="Total Withdrawals" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Alert variant="info" className="text-center">No transaction data for this period.</Alert>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default TransactionHistory;
