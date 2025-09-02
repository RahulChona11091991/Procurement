import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { load, save } from '../../lib/store';
import './VendorProfile.css';

export default function VendorProfile() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    trade: '',
    classificationCodes: [],
    status: 'active',
    notes: ''
  });
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    const loadVendorData = () => {
      try {
        const state = load();
        
        // First try exact match
        let vendorData = state.vendors.find(v => v.id === vendorId);
        
        // If not found, try with 'v' prefix if not already present
        if (!vendorData && !vendorId.startsWith('v')) {
          vendorData = state.vendors.find(v => v.id === `v${vendorId}`);
        }
        
        // If still not found, try to find any vendor (for demo purposes)
        if (!vendorData && state.vendors.length > 0) {
          vendorData = state.vendors[0]; // Default to first vendor for demo
        }
        
        if (vendorData) {
          setVendor(vendorData);
          setFormData({
            name: vendorData.name || '',
            contact: vendorData.contact || 'Not provided',
            email: vendorData.email || 'Not provided',
            phone: vendorData.phone || 'Not provided',
            address: vendorData.address || 'Not provided',
            city: vendorData.city || 'Not provided',
            province: vendorData.province || 'Not provided',
            postalCode: vendorData.postalCode || 'Not provided',
            trade: vendorData.trade || 'Not specified',
            classificationCodes: Array.isArray(vendorData.classificationCodes) 
              ? [...vendorData.classificationCodes] 
              : [],
            status: vendorData.status || 'active',
            notes: vendorData.notes || 'No additional notes.'
          });
        } else {
          console.error('No vendor data available');
        }
      } catch (error) {
        console.error('Error loading vendor data:', error);
      }
    };
    
    loadVendorData();
  }, [vendorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCode = () => {
    if (newCode.trim() && !formData.classificationCodes.includes(newCode.trim())) {
      setFormData(prev => ({
        ...prev,
        classificationCodes: [...prev.classificationCodes, newCode.trim()]
      }));
      setNewCode('');
    }
  };

  const handleRemoveCode = (codeToRemove) => {
    setFormData(prev => ({
      ...prev,
      classificationCodes: prev.classificationCodes.filter(code => code !== codeToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const state = load();
    const vendorIndex = state.vendors.findIndex(v => v.id === vendorId);
    
    if (vendorIndex !== -1) {
      const updatedVendors = [...state.vendors];
      updatedVendors[vendorIndex] = {
        ...updatedVendors[vendorIndex],
        ...formData
      };
      
      save({
        ...state,
        vendors: updatedVendors
      });
      
      setVendor(updatedVendors[vendorIndex]);
      setIsEditing(false);
    }
  };

  if (!vendor) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Loading Vendor Profile</h1>
          <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <p>Loading vendor information...</p>
            <button 
              className="btn secondary" 
              onClick={() => navigate(-1)}
              style={{ marginTop: '15px' }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <div className="header-actions">
          <Link to={`/vendor/contracts/${vendorId}`} className="btn secondary">
            Back to Documents
          </Link>
          <button 
            className="btn primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="vendor-profile">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="vendor-form">
            <div className="form-section">
              <h3>Company Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Province/State</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal/Zip Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trade</label>
                  <input
                    type="text"
                    name="trade"
                    value={formData.trade}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Classification Codes</label>
                  <div className="codes-input">
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Add a classification code"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCode())}
                    />
                    <button 
                      type="button" 
                      className="btn btn-sm"
                      onClick={handleAddCode}
                    >
                      Add
                    </button>
                  </div>
                  <div className="codes-list">
                    {formData.classificationCodes.map((code, index) => (
                      <span key={index} className="code-tag">
                        {code}
                        <button 
                          type="button" 
                          className="remove-code"
                          onClick={() => handleRemoveCode(code)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn primary">
                Save Changes
              </button>
              <button 
                type="button" 
                className="btn secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="vendor-details">
            <div className="details-section">
              <h3>Company Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Company Name</span>
                  <span className="detail-value">{vendor.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Person</span>
                  <span className="detail-value">{vendor.contact || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">
                    {vendor.email ? (
                      <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{vendor.phone || 'N/A'}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {[vendor.address, vendor.city, vendor.province, vendor.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trade</span>
                  <span className="detail-value">{vendor.trade || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${vendor.status || 'active'}`}>
                    {vendor.status || 'active'}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Classification Codes</span>
                  <div className="classification-codes">
                    {vendor.classificationCodes?.length > 0 ? (
                      vendor.classificationCodes.map((code, idx) => (
                        <span key={idx} className="badge badge-primary">
                          {code}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">No classification codes</span>
                    )}
                  </div>
                </div>
                {vendor.notes && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Notes</span>
                    <div className="notes">
                      {vendor.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
