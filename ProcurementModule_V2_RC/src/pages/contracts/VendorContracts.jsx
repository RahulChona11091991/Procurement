import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { load } from '../../lib/store';
import DocumentTiles from './DocumentTiles';
import './Contracts.css';

const VendorContracts = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Simulate API call to fetch vendor data
    const fetchVendorData = () => {
      try {
        const state = load() || {};
        const vendorData = (state.vendors || []).find(v => v.id === vendorId) || {
          id: vendorId,
          name: 'Vendor',
          email: '',
          contact: 'N/A',
          phone: 'N/A',
          trade: 'N/A',
          city: 'N/A'
        };
        
        setVendor(vendorData);
        
        // Get documents for this vendor
        const vendorDocs = (state.documents && state.documents[vendorId]) || [];
        setDocuments(Array.isArray(vendorDocs) ? vendorDocs : []);
      } catch (error) {
        console.error('Error loading vendor data:', error);
        // Set default vendor data if loading fails
        setVendor({
          id: vendorId,
          name: 'Vendor',
          email: '',
          contact: 'N/A',
          phone: 'N/A',
          trade: 'N/A',
          city: 'N/A'
        });
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  if (isLoading) {
    return (
      <div className="contracts-container loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your contract information...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="contracts-container">
        <div className="error-message">
          <h2>Vendor Not Found</h2>
          <p>The requested vendor information could not be loaded.</p>
          <a href="/vendor/login" className="btn primary">Return to Login</a>
        </div>
      </div>
    );
  }

  // Prepare document tiles data
  const documentTiles = [
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

  return (
    <div className="vendor-contracts-view">
      <div className="page-header">
        <h1>My Contracts</h1>
        <p className="welcome-message">
          Welcome back, <strong>{vendor.name}</strong>
        </p>
      </div>
      
      <div className="contracts-section">
        <div className="section-header">
          <h2>Contract Documents</h2>
          <p className="section-description">
            View and manage your contract documents below. Click on any document to view its details.
          </p>
        </div>
        
        <DocumentTiles 
          vendorId={vendor.id} 
          isVendor={true} 
          documents={documentTiles.map(doc => {
            const docData = documents.find(d => d.type?.toLowerCase() === doc.id);
            return {
              ...doc,
              status: docData?.status || 'Not Uploaded',
              expiry: docData?.expiryDate || docData?.validTo
            };
          })}
        />
      </div>
      
      <div className="support-section">
        <h3>Need Help?</h3>
        <p>
          If you have any questions about your contracts or need assistance, 
          please contact our procurement team at{' '}
          <a href="mailto:procurement@example.com" className="support-link">
            procurement@example.com
          </a>.
        </p>
      </div>
      
      <div className="quick-actions">
        <a href="/vendor/dashboard" className="btn secondary">
          Back to Dashboard
        </a>
        <a href="/vendor/profile" className="btn">
          View My Profile
        </a>
      </div>
    </div>
  );
};

export default VendorContracts;
