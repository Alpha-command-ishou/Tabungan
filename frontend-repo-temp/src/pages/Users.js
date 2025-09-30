import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Pagination, Form, Button } from 'react-bootstrap';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const usersPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                const res = await axios.get(`http://localhost:5000/api/admin-users?page=${currentPage}&limit=${usersPerPage}&search=${searchQuery}`, {
                    headers: { 'x-auth-token': token }
                });
                setUsers(res.data.users);

                const totalCount = res.data.totalCount;
                setTotalPages(Math.ceil(totalCount / usersPerPage));

                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/');
            }
        };
        fetchUsers();
    }, [navigate, currentPage, searchQuery, usersPerPage]);

    const handleDetailClick = (userId) => {
        navigate(`/admin/user-details/${userId}`);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <h2 className="mb-4">Users</h2>
            <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Users List</span>
                    <Form.Control
                        type="text"
                        placeholder="Search users..."
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
                                <th>Name</th>
                                <th>Email</th>
                                <th>Total Savings</th>
                                <th>Role</th>
                                <th>Joined Date</th>
                                <th>Action</th> {}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{(currentPage - 1) * usersPerPage + index + 1}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>Rp{(user.total_savings || 0).toLocaleString()}</td>
                                        <td>{user.role}</td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <Button variant="info" size="sm" onClick={() => handleDetailClick(user.id)}>
                                                Detail
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
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

export default Users;
