import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateCustomerProfile } from '../services/authService';
import { Pencil, CheckCircle, XCircle, User, MapPin, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addresses: []
  });

  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    if (userProfile || user) {
      setFormData({
        name: userProfile?.name || user?.displayName || '',
        phone: userProfile?.phone || '',
        addresses: userProfile?.addresses || (userProfile?.address ? [userProfile.address] : [])
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) return;
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress.trim()]
    }));
    setNewAddress('');
  };

  const handleRemoveAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      if (user) {
        await updateCustomerProfile(user.uid, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          addresses: formData.addresses,
          address: formData.addresses[0] || ''
        });
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Manage your personal information and saved addresses
            </p>
          </div>
          {!editing ? (
            <button className="profile-edit-btn" onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Pencil size={16} /> Edit Profile
            </button>
          ) : (
            <div className="profile-actions">
              <button className="profile-cancel-btn" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {message.text && (
          <div className={`profile-message ${message.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />} {message.text}
          </div>
        )}

        <div className="profile-grid">
          {/* Personal Info Card */}
          <div className="profile-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> Personal Details</h3>

            <div className="profile-field">
              <label>Email Address</label>
              <p>{user?.email || 'N/A'}</p>
            </div>

            <div className="profile-field">
              <label>Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              ) : (
                <p>{formData.name || 'Not specified'}</p>
              )}
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                />
              ) : (
                <p>{formData.phone || 'Not specified'}</p>
              )}
            </div>
          </div>

          {/* Saved Addresses Card */}
          <div className="profile-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> Saved Addresses</h3>

            {formData.addresses.length === 0 && !editing ? (
              <p className="profile-empty">No addresses saved yet. Click "Edit Profile" to add one.</p>
            ) : (
              <div className="profile-addresses">
                {formData.addresses.map((addr, idx) => (
                  <div key={idx} className="profile-address-item">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {addr}</span>
                    {editing && (
                      <button
                        type="button"
                        className="profile-address-remove"
                        onClick={() => handleRemoveAddress(idx)}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editing && (
              <div className="profile-add-address">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Add new delivery address..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAddress();
                    }
                  }}
                />
                <button type="button" className="profile-add-btn" onClick={handleAddAddress}>
                  + Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
