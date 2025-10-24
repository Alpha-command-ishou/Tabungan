import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Row, Col, Alert, Image, Button, Spinner, InputGroup, Modal } from 'react-bootstrap';
// Tambahkan FaEdit, FaSave, FaTimes
import { FaUserCircle, FaUpload, FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa'; 

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // State baru untuk fitur ganti nama
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/profile', {
        headers: { 'x-auth-token': token },
      });
      setProfileData(res.data);
      // Inisialisasi newName dengan nama saat ini
      setNewName(res.data.name); 
      setLoading(false);
    } catch (err) {
      console.error('Fetch profile error:', err);
      if (err.response && err.response.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError('Failed to fetch profile data.');
      }
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
  };

  // Handler untuk mengaktifkan/menonaktifkan mode edit nama
  const handleToggleEditName = () => {
    setIsEditingName(!isEditingName);
    // Reset newName jika batal edit
    if (isEditingName && profileData) {
      setNewName(profileData.name);
    }
    setError('');
  };

  // Handler untuk memperbarui nama (dan potensi data profil lainnya)
  const handleUpdateProfile = async () => {
    if (!newName || newName.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }
    if (newName.trim() === profileData.name.trim()) {
      setIsEditingName(false);
      return; // Tidak ada perubahan nama, batalkan update
    }

    setUpdatingProfile(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await axios.put('http://localhost:5000/api/profile', { name: newName }, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });
      
      setProfileData(res.data); // Update data profil dari respon server
      alert('Profile updated successfully!');
      setIsEditingName(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile.');
      // Kembalikan nama ke nilai sebelum update jika gagal
      if (profileData) {
        setNewName(profileData.name);
      }
    } finally {
      setUpdatingProfile(false);
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setUploading(true);
    setError('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profile_photo', selectedFile);

    try {
      await axios.post('http://localhost:5000/api/profile/photo', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile photo updated successfully!');
      setSelectedFile(null);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    const token = localStorage.getItem('token');
    const confirmDelete = window.confirm('Are you sure you want to delete your profile photo?');

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/profile/photo', {
        headers: { 'x-auth-token': token },
      });
      alert('Profile photo deleted successfully!');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete photo.');
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleImageClick = () => {
    if (profileData.profile_photo_url) {
      handleOpenModal();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">User Profile</h2>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="text-center py-4 bg-primary text-white">
              <div className="mb-3">
                {profileData.profile_photo_url ? (
                  <Image
                    src={profileData.profile_photo_url}
                    roundedCircle
                    style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer', border: '3px solid white' }}
                    onClick={handleImageClick}
                    alt="User profile photo"
                  />
                ) : (
                  <FaUserCircle size={120} className="text-white" />
                )}
              </div>
              <h4 className="mb-0">{profileData.name}</h4>
              <p className="mb-0">{profileData.email}</p>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-4">
                    <h5 className="mb-3 text-secondary">Account Information</h5>
                    <Form>
                      {/* Fitur Ganti Nama */}
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <InputGroup>
                          <Form.Control 
                            type="text" 
                            value={isEditingName ? newName : profileData.name} 
                            readOnly={!isEditingName} 
                            onChange={(e) => setNewName(e.target.value)}
                            isInvalid={isEditingName && newName.trim().length < 3}
                          />
                          <Button 
                            variant={isEditingName ? "outline-secondary" : "outline-primary"} 
                            onClick={handleToggleEditName}
                            disabled={updatingProfile}
                          >
                            {isEditingName ? <FaTimes /> : <FaEdit />}
                          </Button>
                          {isEditingName && (
                            <Button 
                              variant="success" 
                              onClick={handleUpdateProfile} 
                              disabled={newName.trim() === profileData.name.trim() || newName.trim().length < 3 || updatingProfile}
                            >
                              {updatingProfile ? <Spinner animation="border" size="sm" /> : <FaSave />}
                            </Button>
                          )}
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          Name must be at least 3 characters.
                        </Form.Control.Feedback>
                      </Form.Group>
                      {/* Akhir Fitur Ganti Nama */}

                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" value={profileData.email} readOnly />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Joined On</Form.Label>
                        <Form.Control type="text" value={new Date(profileData.created_at).toLocaleDateString()} readOnly />
                      </Form.Group>
                    </Form>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-4">
                    <h5 className="mb-3 text-secondary">Manage Profile Photo</h5>
                    <Form>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Upload New Photo</Form.Label>
                        <InputGroup>
                          <Form.Control type="file" onChange={handleFileChange} />
                          <Button onClick={handleUpload} disabled={!selectedFile || uploading} variant="primary">
                            {uploading ? <Spinner animation="border" size="sm" /> : <FaUpload />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                      {profileData.profile_photo_url && (
                        <div className="d-grid gap-2">
                          <Button variant="danger" onClick={handleDeletePhoto}>
                            <FaTrashAlt className="me-2" /> Delete Photo
                          </Button>
                        </div>
                      )}
                    </Form>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={profileData?.profile_photo_url} fluid alt="User profile photo enlarged" />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Profile;