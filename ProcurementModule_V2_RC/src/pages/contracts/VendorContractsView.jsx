import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { load } from '../../lib/store';
import DocumentTiles from './DocumentTiles';
import './Contracts.css';

const VendorContractsView = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState({
    msa: { status: 'Not Uploaded', expiry: null },
    workAuthorization: { status: 'Not Uploaded', expiry: null },
    wcb: { status: 'Not Uploaded', expiry: null },
    insurance: { status: 'Not Uploaded', expiry: null },
    eo: { status: 'Not Uploaded', expiry: null }
  });

  useEffect(() => {
    // Simulate loading data
    const loadData = () => {
      const state = load();
      const vendorData = state.vendors.find(v => v.id === vendorId);
      
      if (vendorData) {
        setVendor(vendorData);
        
        // Get documents for this vendor
        const vendorDocs = state.documents?.[vendorId] || [];
        
        // Process documents to update status
        const updatedDocs = {
          msa: { status: 'Not Uploaded', expiry: null },
          workAuthorization: { status: 'Not Uploaded', expiry: null },
          wcb: { status: 'Not Uploaded', expiry: null },
          insurance: { status: 'Not Uploaded', expiry: null },
          eo: { status: 'Not Uploaded', expiry: null }
        };
        
        // Process each document and update the corresponding document type
        vendorDocs.forEach(doc => {
          const docType = doc.type?.toLowerCase();
          const expiry = doc.validTo || doc.expiryDate;
          
          // Determine document status based on expiry date
          let status = 'Valid';
          if (expiry) {
            const today = new Date();
            const expiryDate = new Date(expiry);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
              status = 'Expired';
            } else if (daysUntilExpiry <= 30) {
              status = 'Expiring Soon';
            }
          } else if (doc.status) {
            status = doc.status;
          }
          
          // Update the appropriate document type
          if (docType.includes('msa')) {
            updatedDocs.msa = { status, expiry };
          } else if (docType.includes('wa') || docType.includes('work auth')) {
            updatedDocs.workAuthorization = { status, expiry };
          } else if (docType.includes('wcb')) {
            updatedDocs.wcb = { status, expiry };
          } else if (docType.includes('insur') || docType.includes('gl')) {
            updatedDocs.insurance = { status, expiry };
          } else if (docType.includes('eo') || docType.includes('error')) {
            updatedDocs.eo = { status, expiry };
          }
        });
        
        setDocuments(updatedDocs);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [vendorId]);

  if (isLoading) {
    return <div className="loading">Loading vendor information...</div>;
  }

  if (!vendor) {
    return <div className="error">Vendor not found.</div>;
  }

  // Prepare documents array for DocumentTiles component
  const documentTiles = [
    { 
      id: 'msa', 
      name: 'MSA', 
      status: documents.msa.status, 
      expiry: documents.msa.expiry 
    },
    { 
      id: 'wa', 
      name: 'Work Authorization', 
      status: documents.workAuthorization.status, 
      expiry: documents.workAuthorization.expiry 
    },
    { 
      id: 'wcb', 
      name: 'WCB', 
      status: documents.wcb.status, 
      expiry: documents.wcb.expiry 
    },
    { 
      id: 'insurance', 
      name: 'Insurance', 
      status: documents.insurance.status, 
      expiry: documents.insurance.expiry 
    },
    { 
      id: 'eo', 
      name: 'Errors & Omissions', 
      status: documents.eo.status, 
      expiry: documents.eo.expiry 
    }
  ];

  return (
    <div className="vendor-contracts-view">
      <div className="page-header">
        <h1>{vendor.name}</h1>
        <div className="vendor-meta">
          <div><strong>Vendor ID:</strong> {vendor.id}</div>
          {vendor.classificationCode && (
            <div><strong>Classification Code:</strong> {vendor.classificationCode}</div>
          )}
          {vendor.trade && <div><strong>Trade:</strong> {vendor.trade}</div>}
          {vendor.city && <div><strong>Location:</strong> {vendor.city}</div>}
        </div>
      </div>
      
      <div className="contracts-section">
        <h2>Contract Documents</h2>
        <p className="section-description">
          View and manage contract documents for {vendor.name}. Click on any document to view details or upload new versions.
        </p>
        
        <DocumentTiles vendorId={vendorId} isVendor={false} documents={documentTiles} />
      </div>
      
      <div className="page-actions">
        <Link to="/vendors" className="btn secondary">
          Back to Vendors
        </Link>
        <Link to={`/vendor/contracts/${vendorId}/profile`} className="btn primary">
          View My Profile
        </Link>
        <Link to={`/vendors/${vendorId}`} className="btn">
          View Vendor Details
        </Link>
      </div>
    </div>
  );
};

export default VendorContractsView;
