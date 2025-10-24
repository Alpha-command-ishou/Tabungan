import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaChartBar, FaMoneyBillWave, FaCog, FaSignOutAlt, FaPiggyBank, FaClipboardList, FaWallet } from 'react-icons/fa';

const Sidebar = ({ role, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className={`bg-white p-3 shadow-sm sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="d-flex align-items-center mb-4">
        <FaPiggyBank size={30} className="text-primary me-2" />
        <h5 className="mb-0 text-primary">Smart Savings</h5>
      </div>
      <Nav className="flex-column">
        {role === 'admin' ? (
          <>
            <Nav.Link as={Link} to="/admin-dashboard" className="d-flex align-items-center">
              <FaChartBar className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin-users" className="d-flex align-items-center">
              <FaUser className="me-2" /> Users
            </Nav.Link>
            <Nav.Link as={Link} to="/admin-transactions" className="d-flex align-items-center">
              <FaMoneyBillWave className="me-2" /> Transactions
            </Nav.Link>
            <Nav.Link as={Link} to="/admin-settings" className="d-flex align-items-center">
              <FaCog className="me-2" /> Settings
            </Nav.Link>
          </>
        ) : (
          <>
            <Nav.Link as={Link} to="/user-dashboard" className="d-flex align-items-center">
              <FaChartBar className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/wallets" className="d-flex align-items-center">
              <FaWallet className="me-2" /> Wallets
            </Nav.Link>
            <Nav.Link as={Link} to="/savings-goals" className="d-flex align-items-center">
              <FaMoneyBillWave className="me-2" /> Savings Goals
            </Nav.Link>
            <Nav.Link as={Link} to="/recent-transactions" className="d-flex align-items-center">
              <FaClipboardList className="me-2" /> Recent Transactions
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
              <FaUser className="me-2" /> Profile
            </Nav.Link>
            <Nav.Link as={Link} to="/settings" className="d-flex align-items-center">
              <FaCog className="me-2" /> Settings
            </Nav.Link>
          </>
        )}
      </Nav>
      <div className="mt-auto pt-3">
        <Button variant="danger" onClick={handleLogout} className="w-100">
          <FaSignOutAlt className="me-2" /> Signout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;