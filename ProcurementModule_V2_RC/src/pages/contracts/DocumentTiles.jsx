import React from 'react';
import { Link } from 'react-router-dom';
import { format, isBefore, addDays } from 'date-fns';

const DocumentTiles = ({ vendorId, isVendor = false, documents = [] }) => {
  // Document types with descriptions
  const documentTypes = [
    { 
      id: 'msa', 
      name: 'Master Service Agreement (MSA)',
      description: 'The master agreement that outlines the general terms and conditions between the parties.'
    },
    { 
      id: 'wa', 
      name: 'Work Authorization',
      description: 'Authorization for specific work to be performed under the MSA.'
    },
    { 
      id: 'wcb', 
      name: 'WCB Clearance',
      description: 'Workers Compensation Board clearance certificate.'
    },
    { 
      id: 'insurance', 
      name: 'Insurance',
      description: 'General liability and other insurance certificates.'
    },
    { 
      id: 'eo', 
      name: 'Errors & Omissions',
      description: 'Professional liability insurance for errors and omissions.'
    }
  ];

  // Determine status class based on status text and expiry date
  const getStatusClass = (doc) => {
    const status = doc.status || '';
    const statusLower = status.toLowerCase();
    const today = new Date();
    
    // If document has an expiry date, check if it's expired or expiring soon
    if (doc.expiry) {
      try {
        const expiryDate = new Date(doc.expiry);
        
        if (isBefore(expiryDate, today)) {
          return 'status-error';
        }
        
        const warningDate = addDays(today, 30);
        if (isBefore(expiryDate, warningDate)) {
          return 'status-warning';
        }
        
        return 'status-valid';
      } catch (e) {
        console.error('Error parsing expiry date:', e);
      }
    }
    
    // Fall back to status text if no expiry date
    if (statusLower.includes('valid') || statusLower === 'active') return 'status-valid';
    if (statusLower.includes('expir') || statusLower === 'pending') return 'status-warning';
    if (statusLower.includes('expir') || statusLower === 'inactive') return 'status-error';
    return 'status-missing';
  };

  // Format expiry date for display
  const formatExpiry = (expiry) => {
    if (!expiry) return 'No expiry date';
    
    try {
      const date = new Date(expiry);
      return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status text for display
  const getStatusText = (doc) => {
    const status = doc.status || '';
    const today = new Date();
    
    if (doc.expiry) {
      try {
        const expiryDate = new Date(doc.expiry);
        
        if (isBefore(expiryDate, today)) {
          return 'Expired';
        }
        
        const warningDate = addDays(today, 30);
        if (isBefore(expiryDate, warningDate)) {
          return 'Expiring Soon';
        }
        
        return 'Valid';
      } catch (e) {
        console.error('Error parsing expiry date:', e);
      }
    }
    
    return status || 'Not Uploaded';
  };

  // Merge document types with their data
  const mergedDocuments = documentTypes.map(docType => {
    const docData = documents.find(d => d.id === docType.id) || {};
    const status = getStatusText(docData);
    
    return {
      ...docType,
      ...docData,
      status,
      statusClass: getStatusClass({ ...docData, status }),
      formattedExpiry: formatExpiry(docData.expiry)
    };
  });

  return (
    <div className="document-tiles">
      {mergedDocuments.map((doc) => (
        <div key={doc.id} className={`document-tile ${isVendor ? 'vendor-view' : ''}`}>
          <div className="document-link">
            <h3>{doc.name}</h3>
            <span className={`status-badge ${doc.statusClass}`}>
              {doc.status}
            </span>
            <div className="expiry-date">
              {doc.formattedExpiry}
            </div>
            {doc.description && (
              <p className="document-description">{doc.description}</p>
            )}
          </div>
          
          <div className="action-buttons">
            <Link 
              to={isVendor 
                ? `/vendor/contracts/${vendorId}/${doc.id}`
                : `/procurement/contracts/${vendorId}/${doc.id}`}
              className="btn primary"
            >
              View Details
            </Link>
            
            {!isVendor && (
              <Link 
                to={`/procurement/contracts/${vendorId}/${doc.id}/update`}
                className="btn secondary"
              >
                Update
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentTiles;
