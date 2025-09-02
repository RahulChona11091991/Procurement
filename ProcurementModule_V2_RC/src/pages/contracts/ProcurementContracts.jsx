import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DocumentTiles from './DocumentTiles';
import './Contracts.css';

const ProcurementContracts = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, this would be fetched from an API
  useEffect(() => {
    // Simulate API call
    const fetchVendors = async () => {
      // Mock data
      const mockVendors = [
        { id: '1', name: 'ABC Construction' },
        { id: '2', name: 'XYZ Supplies' },
        { id: '3', name: 'Best Builders Inc.' },
      ];
      
      setVendors(mockVendors);
      
      if (vendorId && vendorId !== 'all') {
        const selectedVendor = mockVendors.find(v => v.id === vendorId);
        setVendor(selectedVendor);
      } else if (vendorId === 'all') {
        setVendor({ id: 'all', name: 'All Vendors' });
      }
      
      setIsLoading(false);
    };

    fetchVendors();
  }, [vendorId]);

  const handleVendorChange = (e) => {
    const selectedVendorId = e.target.value;
    if (selectedVendorId) {
      window.location.href = `/procurement/contracts/${selectedVendorId}`;
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <h1>Contract Management</h1>
        <div className="vendor-selector">
          <select 
            value={vendor?.id || ''} 
            onChange={handleVendorChange}
            className="form-control"
          >
            <option value="all">All Vendors</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {vendor && (
        <div className="vendor-info">
          <h2>{vendor.name}</h2>
          {vendor.id !== 'all' && (
            <div className="vendor-actions">
              <Link 
                to={`/procurement/contracts/new/msa/update`} 
                className="btn primary"
              >
                + Add New Contract
              </Link>
            </div>
          )}
        </div>
      )}

      <DocumentTiles vendorId={vendor?.id} isVendor={false} />
    </div>
  );
};

export default ProcurementContracts;
