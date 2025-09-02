import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { load } from '../lib/store.js';
import '../pages/contracts/Contracts.css';
import './Vendors.css';

export default function Vendors() {
  const state = load();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter vendors by name or classification codes
  const filteredVendors = state.vendors.filter(vendor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const vendorName = vendor.name.toLowerCase();
    const classificationCodes = vendor.classificationCodes || [];
    
    // Check if search term matches vendor name or any classification code
    return (
      vendorName.includes(searchLower) ||
      classificationCodes.some(code => 
        code.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="vendors-container">
      <div className="toolbar" style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
        <h2 style={{margin: 0}}>Vendors</h2>
        <div style={{flex: 1}} />
        <Link className="btn" to="/vendors/new">Add Vendor</Link>
        <Link className="btn secondary" to="/rfps">RFPs</Link>
      </div>
      
      <div className="search-container" style={{marginBottom: '20px'}}>
        <input 
          type="text" 
          placeholder="Search by vendor name or classification code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{
            padding: '10px 15px',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div className="table-responsive">
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Classification Codes</th>
              <th>Trade</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length > 0 ? (
              filteredVendors.map(vendor => (
                <tr key={vendor.id}>
                  <td><b>{vendor.name}</b></td>
                  <td>
                    <div className="classification-codes">
                      {vendor.classificationCodes && vendor.classificationCodes.length > 0 ? (
                        vendor.classificationCodes.map((code, index) => (
                          <span key={index} className="badge badge-primary mr-1 mb-1">
                            {code}
                          </span>
                        ))
                      ) : 'N/A'}
                    </div>
                  </td>
                  <td>{vendor.trade || 'N/A'}</td>
                  <td>{vendor.city || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${vendor.status || 'active'}`}>
                      {vendor.status || 'active'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link 
                        to={`/procurement/contracts/${vendor.id}`} 
                        className="btn primary"
                        style={{ minWidth: '100px' }}
                      >
                        Contracts
                      </Link>
                      <Link 
                        to={`/vendors/${vendor.id}`} 
                        className="btn"
                        style={{ minWidth: '80px' }}
                      >
                        View
                      </Link>
                      <Link 
                        to={`/vendors/${vendor.id}/edit`} 
                        className="btn secondary"
                        style={{ minWidth: '80px' }}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No vendors found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
