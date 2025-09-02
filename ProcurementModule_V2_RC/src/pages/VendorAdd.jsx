import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { load, save, uid } from '../lib/store';
import './VendorDocuments.css';

export default function VendorAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    city: '',
    contact: '',
    email: '',
    phone: '',
    classificationCodes: [],
    notes: '',
    status: 'active',
    documents: {
      msa: null,
      wcb: null,
      insurance: null,
      workAuthorizations: []
    }
  });
  
  const [availableCodes, setAvailableCodes] = useState(load().classificationCodes || []);
  const [newCode, setNewCode] = useState('');
  
  const fileInputs = useRef({
    msa: null,
    wcb: null,
    insurance: null,
    workAuth: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setNewCode(code);
  };
  
  const addCode = (e) => {
    e.preventDefault();
    if (newCode && !formData.classificationCodes.includes(newCode)) {
      setFormData(prev => ({
        ...prev,
        classificationCodes: [...prev.classificationCodes, newCode]
      }));
      setNewCode('');
    }
  };
  
  const removeCode = (codeToRemove) => {
    setFormData(prev => ({
      ...prev,
      classificationCodes: prev.classificationCodes.filter(code => code !== codeToRemove)
    }));
  };
  
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: reader.result.split(',')[1] // Store base64 encoded data
      };
      
      setFormData(prev => {
        const newDocuments = { ...prev.documents };
        if (type === 'workAuth') {
          newDocuments.workAuthorizations = [...(newDocuments.workAuthorizations || []), fileData];
        } else {
          newDocuments[type] = fileData;
        }
        return {
          ...prev,
          documents: newDocuments
        };
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const removeDocument = (type, index = null) => {
    setFormData(prev => {
      const newDocuments = { ...prev.documents };
      if (type === 'workAuth' && index !== null) {
        newDocuments.workAuthorizations = newDocuments.workAuthorizations.filter((_, i) => i !== index);
      } else {
        newDocuments[type] = null;
      }
      return {
        ...prev,
        documents: newDocuments
      };
    });
  };
  
  const triggerFileInput = (type) => {
    if (fileInputs.current[type]) {
      fileInputs.current[type].click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.trade || !formData.contact || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Load current state
    const state = load();
    
    // Create new vendor with documents
    const newVendor = {
      id: uid('v'),
      name: formData.name.trim(),
      trade: formData.trade.trim(),
      city: formData.city.trim(),
      contact: formData.contact.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      classificationCodes: [...formData.classificationCodes],
      notes: formData.notes.trim(),
      status: formData.status,
      rating: 0, // New vendors start with 0 rating
      documents: { ...formData.documents }
    };

    // Update state
    const updatedState = {
      ...state,
      vendors: [...state.vendors, newVendor]
    };

    // Save to localStorage
    save(updatedState);
    
    // Show success message
    alert('Vendor added successfully!');
    
    // Navigate back to vendors list
    navigate('/vendors');
  };

  const renderDocumentSection = (type, label, multiple = false) => {
    const documents = multiple ? 
      (formData.documents.workAuthorizations || []) : 
      (formData.documents[type] ? [formData.documents[type]] : []);
    
    return (
      <div className="document-section">
        <h3>{label}</h3>
        <div className="document-list">
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <div key={index} className="document-item">
                <span className="document-name">
                  {doc.name} ({(doc.size / 1024).toFixed(1)} KB)
                </span>
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeDocument(multiple ? 'workAuth' : type, multiple ? index : null)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="no-documents">No {label} uploaded</div>
          )}
        </div>
        <input
          type="file"
          ref={el => fileInputs.current[type] = el}
          onChange={(e) => handleFileChange(type, e)}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <button 
          type="button" 
          className="btn secondary"
          onClick={() => triggerFileInput(type)}
        >
          Upload {label}
        </button>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add New Vendor</h1>
      </div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Add New Vendor</h2>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group col-md-6">
                <label>Trade *</label>
                <input
                  type="text"
                  name="trade"
                  value={formData.trade}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group col-md-6">
                <label>Contact Person *</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group col-md-6">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Classification Codes</label>
              <div className="d-flex mb-2">
                <select 
                  className="form-control mr-2"
                  value={newCode}
                  onChange={handleCodeChange}
                >
                  <option value="">Select a code</option>
                  {availableCodes.map(code => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={addCode}
                  disabled={!newCode}
                >
                  Add Code
                </button>
              </div>
              <div className="selected-codes">
                {formData.classificationCodes.map(code => (
                  <span key={code} className="badge badge-primary mr-2 mb-2 p-2 d-inline-flex align-items-center">
                    {code}
                    <button 
                      type="button" 
                      className="close ml-2" 
                      onClick={() => removeCode(code)}
                      style={{fontSize: '1rem'}}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                name="status" 
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                className="form-control"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="document-uploads">
              <h3>Required Documents</h3>
              {renderDocumentSection('msa', 'Master Service Agreement (MSA)')}
              {renderDocumentSection('wcb', 'Workers Compensation Board (WCB)')}
              {renderDocumentSection('insurance', 'Insurance Certificate')}
              {renderDocumentSection('workAuth', 'Work Authorization', true)}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">
              Save Vendor
            </button>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => navigate('/vendors')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
