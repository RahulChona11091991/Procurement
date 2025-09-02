import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { load, save } from '../lib/store.js';

export default function BidSubmission() {
  const { rfpId, vendorId } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [bids, setBids] = useState({});
  const [existingBid, setExistingBid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const state = load();
    const rfpData = state.rfps.find(r => r.id === rfpId);
    const vendorData = state.vendors.find(v => v.id === vendorId);
    
    if (!rfpData || !vendorData) return;
    
    setRfp(rfpData);
    setVendor(vendorData);
    
    // Check for existing bid
    const bid = state.bids?.find(b => b.rfpId === rfpId && b.vendorId === vendorId);
    if (bid) {
      setExistingBid(bid);
      // Convert bid items to the format expected by the form
      const initialBids = {};
      
      // Process globals
      (bid.items?.globals || []).forEach(item => {
        initialBids[`global_${item.name}`] = item.price || '';
      });
      
      // Process models
      Object.entries(bid.items?.models || {}).forEach(([model, items]) => {
        items.forEach(item => {
          initialBids[`model_${model}_${item.name}`] = item.price || '';
        });
      });
      
      // Process unit rates
      (bid.items?.unitRates || []).forEach(item => {
        initialBids[`unit_${item.name}`] = item.price || '';
      });
      
      setBids(initialBids);
    } else {
      // Initialize empty bids
      const initialBids = {};
      
      // Initialize globals
      (rfpData.items?.globals || []).forEach(item => {
        initialBids[`global_${item.name}`] = '';
      });
      
      // Initialize models
      Object.entries(rfpData.items?.models || {}).forEach(([model, items]) => {
        items.forEach(item => {
          initialBids[`model_${model}_${item.name}`] = '';
        });
      });
      
      // Initialize unit rates
      (rfpData.items?.unitRates || []).forEach(item => {
        initialBids[`unit_${item.name}`] = '';
      });
      
      setBids(initialBids);
    }
  }, [rfpId, vendorId]);

  const handleBidChange = (key, value) => {
    setBids(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Process the bids into the required format
    const bidItems = {
      globals: [],
      models: {},
      unitRates: []
    };
    
    Object.entries(bids).forEach(([key, price]) => {
      if (!price) return;
      
      if (key.startsWith('global_')) {
        const name = key.replace('global_', '');
        bidItems.globals.push({ name, price: parseFloat(price) });
      } 
      else if (key.startsWith('model_')) {
        const [_, model, ...nameParts] = key.split('_');
        const name = nameParts.join('_');
        if (!bidItems.models[model]) bidItems.models[model] = [];
        bidItems.models[model].push({ name, price: parseFloat(price) });
      }
      else if (key.startsWith('unit_')) {
        const name = key.replace('unit_', '');
        bidItems.unitRates.push({ name, price: parseFloat(price) });
      }
    });
    
    // Save the bid
    const state = load();
    const bid = {
      id: `bid-${Date.now()}`,
      rfpId,
      vendorId,
      submittedAt: new Date().toISOString(),
      items: bidItems,
      status: 'submitted'
    };
    
    // Remove existing bid if it exists
    const updatedBids = (state.bids || []).filter(b => 
      !(b.rfpId === rfpId && b.vendorId === vendorId)
    );
    
    // Add new bid
    state.bids = [...updatedBids, bid];
    save(state);
    
    setSubmitting(false);
    setSuccess(true);
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate(`/vendor/dashboard/${vendorId}`);
    }, 2000);
  };

  if (!rfp || !vendor) return <div>Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Submit Bid</h1>
        <div className="small">
          RFP: {rfp.title || rfp.id} | Vendor: {vendor.name}
        </div>
      </div>

      {success ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Bid Submitted Successfully!</h2>
          <p>You will be redirected to your dashboard shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Global Items */}
          {rfp.items?.globals?.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3>Global Items</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {rfp.items.globals.map((item) => (
                  <div key={`global_${item.name}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ flex: 1 }}>{item.name}</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '0.5rem' }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={bids[`global_${item.name}`] || ''}
                        onChange={(e) => handleBidChange(`global_${item.name}`, e.target.value)}
                        style={{ width: '120px', padding: '0.5rem' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Items */}
          {Object.entries(rfp.items?.models || {}).map(([model, items]) => (
            <div key={`model_${model}`} className="card" style={{ marginBottom: '1.5rem' }}>
              <h3>Model: {model}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {items.map((item) => (
                  <div key={`model_${model}_${item.name}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ flex: 1 }}>{item.name}</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '0.5rem' }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={bids[`model_${model}_${item.name}`] || ''}
                        onChange={(e) => handleBidChange(`model_${model}_${item.name}`, e.target.value)}
                        style={{ width: '120px', padding: '0.5rem' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Unit Rates */}
          {rfp.items?.unitRates?.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3>Unit Rates</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {rfp.items.unitRates.map((item) => (
                  <div key={`unit_${item.name}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ flex: 1 }}>{item.name}</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '0.5rem' }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={bids[`unit_${item.name}`] || ''}
                        onChange={(e) => handleBidChange(`unit_${item.name}`, e.target.value)}
                        style={{ width: '120px', padding: '0.5rem' }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn secondary"
              onClick={() => navigate(`/vendor/dashboard/${vendorId}`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
