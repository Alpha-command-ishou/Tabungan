import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  
  // State untuk Modal dan Penggantian Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // State untuk Pengaturan Umum (HANYA Dark Mode)
  const [settings, setSettings] = useState({
    dark_mode: false,
  });
  const [settingsError, setSettingsError] = useState('');
  
  // 1. Ambil Pengaturan Saat Ini
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');
      try {
        const res = await axios.get('http://localhost:5000/api/settings', { headers: { 'x-auth-token': token } });
        setSettings({
          dark_mode: res.data.dark_mode === 1,
        });
        document.body.classList.toggle('dark-mode', res.data.dark_mode === 1);
        localStorage.setItem('darkMode', res.data.dark_mode === 1);
      } catch (err) {
        setSettingsError('Failed to load settings.');
        console.error(err);
      }
    };
    fetchSettings();
  }, [navigate]);

  // 2. Handler Perubahan Pengaturan (misalnya Dark Mode)
  const handleSettingChange = async (settingName, value) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    
    // Update state segera (Optimistic UI)
    setSettings(prev => ({
        ...prev,
        [settingName]: value
    }));

    try {
      await axios.post('http://localhost:5000/api/update-setting', 
        { settingName, value: value ? 1 : 0 }, 
        { headers: { 'x-auth-token': token } }
      );
      
      // Khusus Dark Mode, terapkan perubahan pada body
      if (settingName === 'dark_mode') {
        document.body.classList.toggle('dark-mode', value);
        localStorage.setItem('darkMode', value);
      }
      setSettingsError('');
    } catch (err) {
      // Jika error, kembalikan state sebelumnya
      setSettings(prev => ({
        ...prev,
        [settingName]: !value
      }));
      setSettingsError('Failed to update setting.');
      console.error(err);
    }
  };

  // 3. Handler Ganti Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      return setPasswordError('New passwords do not match.');
    }

    if (newPassword.length < 6) {
        return setPasswordError('New password must be at least 6 characters.');
    }

    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    try {
      const res = await axios.post('http://localhost:5000/api/change-password', 
        { currentPassword, newPassword }, 
        { headers: { 'x-auth-token': token } }
      );
      setPasswordSuccess(res.data.msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Tutup modal setelah sukses
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.msg || 'Failed to change password.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Settings</h2>
      
      {settingsError && <Alert variant="danger">{settingsError}</Alert>}

      {/* CARD UMUM */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>General Settings</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Dark Mode</Form.Label>
            <Form.Check 
              type="switch"
              id="dark-mode-switch"
              checked={settings.dark_mode}
              onChange={(e) => handleSettingChange('dark_mode', e.target.checked)}
            />
          </Form.Group>
          
          {/* Hapus semua kode 2FA dan Pertanyaan Keamanan di sini */}
          
        </Card.Body>
      </Card>
      
      {/* CARD KEAMANAN */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>Account Security</Card.Header>
        <Card.Body>
          <Button variant="outline-primary" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
        </Card.Body>
      </Card>

      {/* MODAL CHANGE PASSWORD */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit">Change Password</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Settings;