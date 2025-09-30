import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Image, Button } from 'react-bootstrap';
import { FaUserCircle, FaBars, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ role, toggleSidebar, isSidebarOpen }) => {
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { 'x-auth-token': token }
        });
        setProfilePhotoUrl(res.data.profile_photo_url);
      } catch (err) {
        console.error('Failed to fetch profile photo:', err);
      }
    };
    
    if (role === 'user') {
      fetchProfilePhoto();
    }
    
  }, [navigate, role]);

  return (
    <Navbar bg="white" className="shadow-sm p-3 justify-content-between">
      <Button variant="link" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaArrowLeft size={20} /> : <FaBars size={20} />}
      </Button>
      <Nav>
        {role === 'user' && (
          <Nav.Item>
            <Link to="/profile" className="d-block">
              {profilePhotoUrl ? (
                <Image src={profilePhotoUrl} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
              ) : (
                <FaUserCircle size={40} className="text-muted" />
              )}
            </Link>
          </Nav.Item>
        )}
      </Nav>
    </Navbar>
  );
};

export default Header;