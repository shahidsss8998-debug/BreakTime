import { useState, useEffect } from 'react';
import {
  listenToMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability
} from '../../services/menuService';
import AdminSidebar from '../components/AdminSidebar';
import { Utensils, XCircle, X, Plus, Pencil, Trash2, Upload } from 'lucide-react';

const CATEGORIES = ['Burgers', 'Momos', 'Snacks', 'Sandwiches', 'Sides', 'Fried Chicken', 'Drinks', 'Other'];

export default function AdminMenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = { name: '', price: '', category: 'Burgers', description: '', img: '' };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setError('');
    const unsubscribe = listenToMenuItems(
      (menuItems) => {
        setItems(menuItems);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching menu items:', err);
        setError('Failed to fetch menu items. Please check permissions.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size should be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, img: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Item name cannot be empty.');
      return false;
    }
    const priceVal = Number(formData.price);
    if (isNaN(priceVal) || priceVal <= 0) {
      setError('Price must be a positive number.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    setError('');
    if (!validateForm()) return;

    setSaving(true);
    try {
      await addMenuItem({
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category,
        description: formData.description.trim(),
        imageUrl: formData.img
      });
      setShowAddForm(false);
      setFormData(emptyForm);
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add menu item.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setShowAddForm(false);
    setFormData({
      name: item.name || '',
      price: item.price || '',
      category: item.category || 'Burgers',
      description: item.description || '',
      img: item.img || item.imageUrl || ''
    });
    setError('');
  };

  const handleSaveEdit = async () => {
    setError('');
    if (!validateForm()) return;

    setSaving(true);
    try {
      await updateMenuItem(editingId, {
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category,
        description: formData.description.trim(),
        img: formData.img
      });
      setEditingId(null);
      setFormData(emptyForm);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update menu item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId, itemName) => {
    setError('');
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(itemId);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete menu item.');
    }
  };

  const handleToggle = async (itemId, currentAvailable) => {
    try {
      await toggleMenuItemAvailability(itemId, !currentAvailable);
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Utensils size={28} /> Menu Manager</h1>
            <span className="admin-page-count">{items.length} menu items</span>
          </div>
          <button
            className="admin-add-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData(emptyForm);
              setError('');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {showAddForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Item</>}
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={16} /> {error}
          </div>
        )}

        {/* Add / Edit Form */}
        {(showAddForm || editingId) && (
          <div className="admin-menu-form">
            <h3>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
            <div className="admin-menu-form-grid">
              <div className="admin-menu-field">
                <label>Item Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Crispy Chicken Burger" />
              </div>
              <div className="admin-menu-field">
                <label>Price (₹) *</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="120" />
              </div>
              <div className="admin-menu-field">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Optional Dual Image Mode (URL or File Upload) */}
              <div className="admin-menu-field" style={{ gridColumn: '1 / -1' }}>
                <label>Item Image (Optional)</label>

                {formData.img && !formData.img.startsWith('data:') ? (
                  /* Case 1: Image URL is active -> Upload Image option hidden */
                  <div className="image-mode-active">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IMAGE URL</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          name="img"
                          value={formData.img}
                          onChange={handleChange}
                          placeholder="https://images.unsplash.com/..."
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="admin-clear-img-btn"
                          onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                        >
                          <X size={16} /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="image-preview-thumb">
                      <img src={formData.img} alt="URL Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                      <span className="image-preview-label">URL Image Active (File upload hidden)</span>
                    </div>
                  </div>
                ) : formData.img && formData.img.startsWith('data:') ? (
                  /* Case 2: Image File is uploaded -> Image URL option hidden */
                  <div className="image-mode-active">
                    <div className="image-upload-preview-wrap">
                      <div className="image-preview-thumb">
                        <img src={formData.img} alt="Uploaded preview" />
                        <div>
                          <span className="image-preview-label">Uploaded Image File Active</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image URL input hidden</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="admin-clear-img-btn"
                        onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                      >
                        <X size={16} /> Remove Uploaded Image
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Case 3: Neither filled yet -> Show both Image URL & Upload options */
                  <div className="image-mode-select-grid">
                    <div className="image-mode-card">
                      <span className="image-mode-title">Option 1: Enter Image URL</span>
                      <input
                        name="img"
                        value={formData.img}
                        onChange={handleChange}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div className="image-mode-divider">OR</div>

                    <div className="image-mode-card">
                      <span className="image-mode-title">Option 2: Upload Image File</span>
                      <label className="file-upload-dropzone">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        <div className="dropzone-content">
                          <Upload size={20} />
                          <span>Click to Upload Image</span>
                          <small>(PNG, JPG up to 2MB)</small>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-menu-field" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of ingredients..." rows="2" />
              </div>
            </div>
            <button
              className="admin-menu-save-btn"
              onClick={editingId ? handleSaveEdit : handleAdd}
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        )}

        {/* Menu Items List */}
        {loading ? (
          <div className="admin-detail-loading">
            <div className="admin-loading-spinner"></div>
            <p>Loading menu items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="admin-detail-loading">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Utensils size={48} /></div>
            <p>No menu items yet. Click "+ Add Item" to get started.</p>
          </div>
        ) : (
          <div className="admin-menu-list">
            {Object.entries(grouped).map(([category, catItems]) => (
              <div key={category} className="admin-menu-category-section">
                <h3 className="admin-menu-category-title">{category} ({catItems.length})</h3>
                <div className="admin-menu-grid">
                  {catItems.map(item => (
                    <div key={item.id} className={`admin-menu-item-card ${!item.available ? 'unavailable' : ''}`}>
                      <div className="admin-menu-item-img">
                        <img src={item.img || item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} alt={item.name} />
                        <span className={`admin-menu-status-badge ${item.available ? 'available' : 'off'}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="admin-menu-item-info">
                        <div className="admin-menu-item-header">
                          <h4>{item.name}</h4>
                          <span className="admin-menu-item-price">₹{item.price}</span>
                        </div>
                        <p className="admin-menu-item-desc">{item.description || 'No description'}</p>
                        <div className="admin-menu-item-actions">
                          <button
                            className="admin-menu-action-btn edit"
                            onClick={() => handleStartEdit(item)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            className={`admin-menu-action-btn toggle ${item.available ? 'off' : 'on'}`}
                            onClick={() => handleToggle(item.id, item.available)}
                          >
                            {item.available ? 'Hide' : 'Show'}
                          </button>
                          <button
                            className="admin-menu-action-btn delete"
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
