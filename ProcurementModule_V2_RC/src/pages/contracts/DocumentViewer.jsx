import React from 'react';
import { useParams, Link } from 'react-router-dom';

const DocumentViewer = ({ isVendor = false, vendorId }) => {
  const { documentType } = useParams();
  
  // Mock data - in a real app, this would come from an API
  const documentData = {
    msa: {
      title: 'Master Service Agreement',
      referenceNumber: 'MSA-2023-001',
      effectiveDate: '2023-01-15',
      expiryDate: '2024-12-31',
      status: 'Valid',
      fileUrl: '/documents/msa.pdf'
    },
    wa: {
      title: 'Work Authorization',
      referenceNumber: 'WA-2023-045',
      effectiveDate: '2023-03-20',
      expiryDate: '2023-12-31',
      status: 'Expiring Soon',
      project: 'Project Phoenix',
      classCode: 'CC-1001',
      fileUrl: '/documents/wa.pdf'
    },
    wcb: {
      title: 'Workers Compensation Board',
      referenceNumber: 'WCB-987654',
      effectiveDate: '2022-01-01',
      expiryDate: '2023-06-30',
      status: 'Expired',
      fileUrl: '/documents/wcb.pdf'
    },
    insurance: {
      title: 'Insurance & Errors & Omissions',
      effectiveDate: '2023-01-01',
      expiryDate: '2024-06-30',
      status: 'Valid',
      fileUrl: '/documents/insurance.pdf'
    }
  };

  const doc = documentData[documentType] || {};
  const backUrl = isVendor 
    ? `/vendor/dashboard/${vendorId}` 
    : `/procurement/contracts/${vendorId || ''}`;

  return (
    <div className="document-viewer">
      <div className="document-header">
        <Link to={backUrl} className="btn secondary">
          &larr; Back to {isVendor ? 'Dashboard' : 'Contracts'}
        </Link>
        <h2>{doc.title || 'Document Not Found'}</h2>
        <div className="document-meta">
          {doc.referenceNumber && (
            <div><strong>Reference #:</strong> {doc.referenceNumber}</div>
          )}
          <div><strong>Status:</strong> <span className={`status-${doc.status.toLowerCase().replace(' ', '-')}`}>
            {doc.status}
          </span></div>
          <div><strong>Effective Date:</strong> {doc.effectiveDate}</div>
          <div><strong>Expiry Date:</strong> {doc.expiryDate}</div>
          {doc.project && <div><strong>Project:</strong> {doc.project}</div>}
          {doc.classCode && <div><strong>Class Code:</strong> {doc.classCode}</div>}
        </div>
      </div>
      
      <div className="document-content">
        {doc.fileUrl ? (
          <iframe 
            src={doc.fileUrl} 
            title={doc.title}
            style={{ width: '100%', height: '80vh', border: '1px solid #ddd' }}
          />
        ) : (
          <div className="no-document">No document available</div>
        )}
      </div>
      
      {!isVendor && (
        <div className="document-actions">
          <Link 
            to={`/procurement/contracts/${vendorId || 'new'}/${documentType}/update`} 
            className="btn primary"
          >
            Update Document
          </Link>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
