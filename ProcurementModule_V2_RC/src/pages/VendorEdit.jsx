import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { load, save } from '../lib/store.js';
import './VendorDocuments.css';
import './Vendors.css';

export default function VendorEdit() {
  const { id } = useParams();
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
  
  const [availableCodes, setAvailableCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  
  const fileInputs = useRef({
    msa: null,
    wcb: null,
    insurance: null,
    workAuth: null
  });

  // Load vendor data when component mounts
  useEffect(() => {
    const state = load();
    const vendor = state.vendors.find(v => v.id === id);
    
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        trade: vendor.trade || '',
        city: vendor.city || '',
        contact: vendor.contact || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        classificationCodes: vendor.classificationCodes || [],
        notes: vendor.notes || '',
        status: vendor.status || 'active',
        documents: vendor.documents || {
          msa: null,
          wcb: null,
          insurance: null,
          workAuthorizations: []
        }
      });
      
      // Set available codes from store
      setAvailableCodes(state.classificationCodes || []);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCodeChange = (e) => {
    setNewCode(e.target.value);
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
      const today = new Date().toISOString().split('T')[0];
      const fileData = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: reader.result.split(',')[1],
        uploadDate: new Date().toISOString(),
        ...(type === 'workAuth' && {
          projectName: '',
          classCode: '',
          startDate: today,
          endDate: ''
        })
      };
      
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          ...(type === 'workAuth' 
            ? { 
                workAuthorizations: [...prev.documents.workAuthorizations, fileData] 
              }
            : { [type]: fileData }
          )
        }
      }));
    };
    
    reader.readAsDataURL(file);
  };
  
  const removeDocument = (type, index = null) => {
    setFormData(prev => {
      const newDocs = { ...prev.documents };
      if (type === 'workAuth' && index !== null) {
        newDocs.workAuthorizations = newDocs.workAuthorizations.filter((_, i) => i !== index);
      } else {
        newDocs[type] = null;
      }
      return { ...prev, documents: newDocs };
    });
  };
  
  const handleDocumentChange = (type, index, field, value) => {
    setFormData(prev => {
      const newDocs = { ...prev.documents };
      if (type === 'workAuth') {
        const updated = [...newDocs.workAuthorizations];
        updated[index] = { ...updated[index], [field]: value };
        newDocs.workAuthorizations = updated;
      } else {
        newDocs[type] = { ...newDocs[type], [field]: value };
      }
      return { ...prev, documents: newDocs };
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.trade || !formData.contact || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    const state = load();
    const vendorIndex = state.vendors.findIndex(v => v.id === id);
    
    if (vendorIndex !== -1) {
      const updatedVendors = [...state.vendors];
      updatedVendors[vendorIndex] = {
        ...updatedVendors[vendorIndex],
        ...formData,
        // Ensure we don't overwrite the ID
        id: updatedVendors[vendorIndex].id
      };
      
      save({
        ...state,
        vendors: updatedVendors
      });
      
      alert('Vendor updated successfully!');
      navigate(`/vendors/${id}`);
    }
  };
  
  const renderDocumentSection = (type, label, multiple = false) => {
    const docs = multiple 
      ? (formData.documents.workAuthorizations || []) 
      : (formData.documents[type] ? [formData.documents[type]] : []);
    
    return (
      <div className="document-section" key={type}>
        <h3>{label}</h3>
        
        {docs.length > 0 ? (
          docs.map((doc, index) => (
            <div key={doc.id || index} className="document-item">
              <div className="document-info">
                <span>{doc.name}</span>
                {doc.uploadDate && (
                  <span className="text-muted">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </span>
                )}
                
                {type === 'workAuth' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={doc.projectName || ''}
                        onChange={(e) => handleDocumentChange(type, index, 'projectName', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Class Code</label>
                      <input
                        type="text"
                        value={doc.classCode || ''}
                        onChange={(e) => handleDocumentChange(type, index, 'classCode', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                )}
                
                <div className="document-actions">
                  <a 
                    href={`data:${doc.type};base64,${doc.data}`} 
                    download={doc.name}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeDocument(type, multiple ? index : null)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-documents">No documents uploaded</div>
        )}
        
        <input
          type="file"
          ref={el => fileInputs.current[type] = el}
          onChange={(e) => handleFileChange(type, e)}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => fileInputs.current[type]?.click()}
        >
          Upload {label}
        </button>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit Vendor</h1>
        <button className="btn secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
      
      <div className="page-content">
        <form onSubmit={handleSubmit} className="vendor-form">
          <div className="form-section">
            <h2>Vendor Information</h2>
            
            <div className="form-row">
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Classification Codes</label>
              <div className="form-row">
                <select
                  value={newCode}
                  onChange={handleCodeChange}
                  className="form-control"
                  style={{ flex: 1 }}
                >
                  <option value="">Select a classification code</option>
                  {availableCodes.map((code, index) => (
                    <option key={index} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCode}
                  disabled={!newCode}
                  className="btn primary"
                  style={{ marginLeft: '10px' }}
                >
                  Add Code
                </button>
              </div>
              
              <div className="selected-codes" style={{ marginTop: '10px' }}>
                {formData.classificationCodes.length > 0 ? (
                  formData.classificationCodes.map((code, index) => (
                    <span key={index} className="badge badge-primary" style={{ margin: '0 5px 5px 0' }}>
                      {code}
                      <button
                        type="button"
                        onClick={() => removeCode(code)}
                        className="close"
                        style={{ marginLeft: '5px' }}
                      >
                        &times;
                      </button>
                    </span>
                  ))
                ) : (
                  <div className="text-muted">No classification codes added</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Additional notes about this vendor..."
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Documents</h2>
            {renderDocumentSection('msa', 'Master Service Agreement (MSA)')}
            {renderDocumentSection('wcb', 'Workers Compensation Board (WCB)')}
            {renderDocumentSection('insurance', 'Insurance Certificate')}
            {renderDocumentSection('workAuth', 'Work Authorizations', true)}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
