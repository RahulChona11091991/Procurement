import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { load } from '../lib/store.js';

export default function VendorDashboard() {
  const { vendorId } = useParams();
  const [rfps, setRfps] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = load();
    const vendorData = state.vendors.find(v => v.id === vendorId);
    
    if (vendorData) {
      setVendor(vendorData);
      // Get RFPs where this vendor is invited
      const vendorRfps = state.rfps.filter(rfp => 
        rfp.invitedVendorIds?.includes(vendorId)
      ).map(rfp => ({
        ...rfp,
        hasBid: state.bids?.some(bid => bid.rfpId === rfp.id && bid.vendorId === vendorId) || false
      }));
      
      setRfps(vendorRfps);
    }
    setLoading(false);
  }, [vendorId]);

  if (loading) return <div>Loading...</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Welcome, {vendor.name}</h1>
            <div className="small">Trade: {vendor.trade}</div>
          </div>
          <Link to={`/vendor/contracts/${vendorId}`} className="btn primary" style={{ alignSelf: 'flex-start' }}>
            View Contracts
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Your RFPs</h2>
        {rfps.length === 0 ? (
          <p>No RFPs found for your company.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>RFP #</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rfps.map((rfp) => (
                  <tr key={rfp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{rfp.id}</td>
                    <td style={{ padding: '0.75rem' }}>{rfp.title || rfp.id}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(rfp.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${rfp.hasBid ? 'success' : 'warning'}`}>
                        {rfp.hasBid ? 'Bid Submitted' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <Link to={`/vendor/rfp/${rfp.id}/${vendorId}`} className="btn small">
                        {rfp.hasBid ? 'View/Edit Bid' : 'Submit Bid'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
