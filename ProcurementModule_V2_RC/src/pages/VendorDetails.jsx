import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { load } from '../lib/store.js';
import './VendorDocuments.css';
import './Vendors.css';

const DOCUMENT_TYPES = {
  MSA: 'Master Service Agreement',
  WA: 'Work Authorization',
  GL: 'General Liability',
  WCB: 'Workers Compensation',
  EO: 'Executive Order',
  Other: 'Other'
};

export default function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = load();
  const vendor = state.vendors.find(v => v.id === id);
  const documents = state.documents[id] || [];
  
  if (!vendor) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Vendor Not Found</h1>
          <button className="btn secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const renderDocumentSection = (type) => {
    const docs = documents.filter(doc => doc.type === type);
    if (docs.length === 0) return null;
    
    return (
      <div key={type} className="document-section">
        <h3>{DOCUMENT_TYPES[type] || type}</h3>
        <table className="document-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, index) => (
              <tr key={index} className={getExpiryClass(doc.validTo)}>
                <td>{doc.files?.[0]?.name || 'No file'}</td>
                <td>{doc.validFrom || 'N/A'}</td>
                <td>{doc.validTo || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${getExpiryClass(doc.validTo) || 'active'}`}>
                    {getExpiryStatus(doc.validTo)}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm"
                    onClick={() => handleViewDocument(doc.files?.[0])}
                    disabled={!doc.files?.length}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const getExpiryClass = (endDate) => {
    if (!endDate) return '';
    const daysRemaining = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 30) return 'expiring';
    return '';
  };

  const getExpiryStatus = (endDate) => {
    if (!endDate) return 'Active';
    const daysRemaining = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysRemaining < 0) return 'Expired';
    if (daysRemaining <= 30) return 'Expiring Soon';
    return 'Active';
  };

  const handleViewDocument = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), '_blank');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{vendor.name}</h1>
        <div className="header-actions">
          <Link to={`/vendors/${id}/edit`} className="btn primary">
            Edit Vendor
          </Link>
          <button className="btn secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
      
      <div className="page-content">
        <div className="vendor-details-card">
          <div className="vendor-info">
            <div className="info-section">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Contact Person</label>
                  <div>{vendor.contact || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div>
                    {vendor.email ? (
                      <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                    ) : 'N/A'}
                  </div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div>{vendor.phone || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <label>Location</label>
                  <div>{vendor.city || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>Business Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Trade</label>
                  <div>{vendor.trade || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <div>
                    <span className={`status-badge ${vendor.status || 'active'}`}>
                      {vendor.status || 'active'}
                    </span>
                  </div>
                </div>
                <div className="info-item full-width">
                  <label>Classification Codes</label>
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
              </div>
            </div>
            
            {vendor.notes && (
              <div className="info-section">
                <h3>Notes</h3>
                <div className="notes">
                  {vendor.notes}
                </div>
              </div>
            )}
          </div>
          
          <div className="documents-section">
            <div className="section-header">
              <h2>Documents</h2>
              <Link to={`/procurement/contracts/${id}`} className="btn primary">
                Manage Documents
              </Link>
            </div>
            
            {documents.length > 0 ? (
              <div className="document-sections">
                {Object.keys(DOCUMENT_TYPES).map(type => renderDocumentSection(type))}
              </div>
            ) : (
              <div className="no-documents">
                <p>No documents found for this vendor.</p>
                <Link to={`/procurement/contracts/${id}`} className="btn primary">
                  Upload Documents
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
