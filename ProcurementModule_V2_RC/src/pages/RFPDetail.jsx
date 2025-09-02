import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { load, save } from '../lib/store.js'
import { createWorkAuthorization } from '../lib/waPackage.js'

export default function RFPDetail(){
  const { id } = useParams()
  const [state, setState] = React.useState(load())
  const rfp = state.rfps.find(r => r.id === id)
  const [awardedVendor, setAwardedVendor] = React.useState(rfp?.awardedTo || null)

  // Get all bids for a specific vendor
  function getVendorBid(vendorId) {
    return (state.bids || []).find(b => b.rfpId === id && b.vendorId === vendorId);
  }

  // Calculate total bid amount for a vendor
  function calculateVendorTotal(vendorId) {
    const bid = getVendorBid(vendorId);
    if (!bid?.items) return 0;
    
    let total = 0;
    
    // Sum globals
    if (bid.items.globals) {
      total += bid.items.globals.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    }
    
    // Sum model items
    if (bid.items.models) {
      Object.values(bid.items.models).forEach(modelItems => {
        total += modelItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
      });
    }
    
    // Sum unit rates
    if (bid.items.unitRates) {
      total += bid.items.unitRates.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    }
    
    return total;
  }

  const [decision, setDecision] = React.useState({ 
    accepted: { globals: {}, models: {}, unitRates: {} },
    rejected: { globals: {}, models: {}, unitRates: {} }
  });

  function updateDecision(vendorId, category, model, name, price, action) {
    setDecision(d => {
      const next = JSON.parse(JSON.stringify(d));
      const otherAction = action === 'accepted' ? 'rejected' : 'accepted';
      const path = category === 'models' 
        ? [action, 'models', model, name]
        : [action, category, name];
      
      const otherPath = category === 'models'
        ? [otherAction, 'models', model, name]
        : [otherAction, category, name];
      
      // Remove from the other action's state if it exists there
      if (category === 'models') {
        if (next[otherAction].models[model]?.[name]) {
          delete next[otherAction].models[model][name];
        }
      } else if (next[otherAction][category]?.[name]) {
        delete next[otherAction][category][name];
      }
      
      // Toggle the action if it's already set, otherwise set it
      if (category === 'models') {
        next[action].models[model] = next[action].models[model] || {};
        if (next[action].models[model][name]?.vendorId === vendorId) {
          delete next[action].models[model][name];
        } else {
          next[action].models[model][name] = { vendorId, name, price };
        }
      } else {
        if (next[action][category]?.[name]?.vendorId === vendorId) {
          delete next[action][category][name];
        } else {
          next[action][category][name] = { vendorId, name, price };
        }
      }
      
      return next;
    });
  }

  function acceptLine(vendorId, category, model, name, price) {
    updateDecision(vendorId, category, model, name, price, 'accepted');
  }

  function rejectLine(vendorId, category, model, name, price) {
    updateDecision(vendorId, category, model, name, price, 'rejected');
  }
  
  // Check if an item is accepted for a vendor
  function isItemAccepted(vendorId, category, model, name) {
    if (category === 'models') {
      return decision.accepted.models[model]?.[name]?.vendorId === vendorId;
    }
    return decision.accepted[category]?.[name]?.vendorId === vendorId;
  }

  // Check if an item is rejected for a vendor
  function isItemRejected(vendorId, category, model, name) {
    if (category === 'models') {
      return decision.rejected.models[model]?.[name]?.vendorId === vendorId;
    }
    return decision.rejected[category]?.[name]?.vendorId === vendorId;
  }

  // Get the status of an item (accepted, rejected, or null)
  function getItemStatus(vendorId, category, model, name) {
    if (isItemAccepted(vendorId, category, model, name)) return 'accepted';
    if (isItemRejected(vendorId, category, model, name)) return 'rejected';
    return null;
  }

  function awardTender(vendorId) {
    const s = load();
    const rfpIndex = s.rfps.findIndex(r => r.id === id);
    if (rfpIndex === -1) return;
    
    s.rfps[rfpIndex].awardedTo = vendorId;
    s.rfps[rfpIndex].awardedAt = new Date().toISOString();
    save(s);
    setState(s);
    setAwardedVendor(vendorId);
    
    // Auto-generate WA if there are selected items
    const hasSelections = Object.keys(decision.globals).length > 0 || 
                         Object.keys(decision.models).length > 0 ||
                         Object.keys(decision.unitRates).length > 0;
    
    if (hasSelections) {
      generateWA(vendorId);
    }
  }

  async function generateWA(vendorId = null) {
    try {
      const vendor = state.vendors.find(v => v.id === (vendorId || awardedVendor));
      if (!vendor) {
        alert('Please select a vendor to award the tender to first.');
        return;
      }

      // Initialize selections with empty arrays/objects
      const selections = {
        globals: [],
        models: {},
        unitRates: []
      };

      // Process accepted items from decisions
      const acceptedGlobals = Object.values(decision.accepted?.globals || {});
      const acceptedModels = Object.entries(decision.accepted?.models || {}).reduce((acc, [model, items]) => {
        acc[model] = Object.values(items || {});
        return acc;
      }, {});
      const acceptedUnitRates = Object.values(decision.accepted?.unitRates || {});

      // If we have accepted items, use them
      if (acceptedGlobals.length > 0 || Object.keys(acceptedModels).length > 0 || acceptedUnitRates.length > 0) {
        selections.globals = acceptedGlobals;
        selections.models = acceptedModels;
        selections.unitRates = acceptedUnitRates;
      } else {
        // Fall back to all items from the vendor's bid
        const bid = getVendorBid(vendor.id);
        if (bid?.items) {
          selections.globals = Array.isArray(bid.items.globals) ? bid.items.globals : [];
          selections.models = bid.items.models || {};
          selections.unitRates = Array.isArray(bid.items.unitRates) ? bid.items.unitRates : [];
        }
      }

      const s = load();
      const waNum = 'WA-' + String(s.counters.wa).padStart(3, '0');
      s.counters.wa += 1;
      save(s);
      setState(s);
      
      // Ensure vendor has all required properties
      const vendorDetails = {
        ...vendor,
        name: vendor.name || 'Not Provided',
        contactPerson: vendor.contactPerson || 'Not Provided',
        email: vendor.email || 'Not Provided',
        phone: vendor.phone || 'Not Provided',
        trade: vendor.trade || 'General',
        address: vendor.address || 'Not Provided'
      };
      
      // Ensure RFP has all required properties
      const rfpDetails = {
        ...rfp,
        id: rfp.id || 'N/A',
        projects: Array.isArray(rfp.projects) ? rfp.projects : [],
        dueDate: rfp.dueDate || 'Not Specified',
        awardedTo: vendor.id,
        awardedAt: new Date().toISOString()
      };
      
      console.log('Generating WA with:', { vendor: vendorDetails, rfp: rfpDetails, selections, waNumber: waNum });
      
      await createWorkAuthorization({ 
        vendor: vendorDetails,
        rfp: rfpDetails,
        selections,
        waNumber: waNum
      });
      
      // Update RFP with WA reference
      const rfpIndex = s.rfps.findIndex(r => r.id === id);
      if (rfpIndex !== -1) {
        s.rfps[rfpIndex].workAuthorization = waNum;
        save(s);
        setState(s);
      }
    } catch (error) {
      console.error('Error in generateWA:', error);
      alert(`Failed to generate work authorization: ${error.message}`);
    }
    
  }

  if (!rfp) return <div>RFP not found.</div>

  return (<div>
    <div className="toolbar" style={{display:'flex', alignItems:'center', gap:12}}>
      <h2 style={{margin:0}}>RFP {rfp.id}</h2>
      <div style={{flex:1}}/>
      <Link to={`/rfps/${id}/edit`} className="btn secondary">Edit RFP</Link>
      {awardedVendor ? (
        <button 
          className="btn" 
          onClick={() => generateWA()}
          title="Generate Work Authorization for awarded vendor"
        >
          Generate Work Authorization
        </button>
      ) : (
        <button 
          className="btn secondary" 
          disabled 
          title="Please award the tender to a vendor first"
        >
          Generate Work Authorization
        </button>
      )}
    </div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom: '1rem'}}>
      <div className="card"><b>Projects:</b> {(rfp.projects||[]).join(', ') || '-'}</div>
      <div className="card"><b>Bids Received:</b> {(state.bids||[]).filter(b=>b.rfpId===id).length}</div>
    </div>

    <div className="card" style={{marginBottom: '2rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3 style={{margin: 0}}>Vendor Bids Summary</h3>
        {awardedVendor && (
          <div style={{color: 'green', fontWeight: 'bold'}}>
            Awarded to: {state.vendors.find(v => v.id === awardedVendor)?.name}
          </div>
        )}
      </div>
      <table style={{width: '100%'}}>
        <thead>
          <tr>
            <th style={{textAlign: 'left'}}>Vendor</th>
            <th style={{textAlign: 'right'}}>Total Bid Amount</th>
            <th style={{textAlign: 'center'}}>Status</th>
            <th style={{textAlign: 'right'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(rfp.invitedVendorIds || []).map(vendorId => {
            const vendor = state.vendors.find(v => v.id === vendorId);
            const bid = getVendorBid(vendorId);
            const total = calculateVendorTotal(vendorId);
            
            return (
              <tr key={vendorId}>
                <td>{vendor?.name || 'Unknown Vendor'}</td>
                <td style={{textAlign: 'right'}}>
                  {bid ? `$${total.toFixed(2)}` : 'No bid submitted'}
                </td>
                <td style={{textAlign: 'right'}}>
                  {bid ? (
                    <div style={{color: 'green', textAlign: 'center'}}>
                      {awardedVendor === vendorId ? 'Awarded' : 'Submitted'}
                    </div>
                  ) : (
                    <span style={{color: 'gray', textAlign: 'center'}}>Pending</span>
                  )}
                </td>
                <td style={{textAlign: 'right'}}>
                  {bid && (
                    <button 
                      className={`btn ${awardedVendor === vendorId ? 'secondary' : ''}`}
                      onClick={() => awardTender(vendorId)}
                      disabled={awardedVendor === vendorId}
                    >
                      {awardedVendor === vendorId ? 'Awarded' : 'Award Tender'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <h3>Compare & Accept: Global Items</h3>
    <table><thead><tr><th>Item</th>{(rfp.invitedVendorIds||[]).map(vid=>(<th key={vid}>{state.vendors.find(v=>v.id===vid)?.name}</th>))}</tr></thead>
    <tbody>{(rfp.items.globals||[]).map(it => (<tr key={it.name}>
      <td>{it.name}</td>
      {(rfp.invitedVendorIds||[]).map(vid => {
        const bid = getVendorBid(vid);
        const line = bid?.items?.globals?.find(l => l.name === it.name);
        return (
          <td key={vid}>
            {line ? (
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div>${line.price || '-'}</div>
                <div style={{display: 'flex', gap: '4px'}}>
                  <button 
                    className={`btn ${getItemStatus(vid, 'globals', null, it.name) === 'accepted' ? 'accepted' : 'secondary'}`} 
                    onClick={() => acceptLine(vid, 'globals', null, it.name, line.price)}
                    style={getItemStatus(vid, 'globals', null, it.name) === 'accepted' ? {backgroundColor: '#4CAF50', color: 'white', flex: 1} : {flex: 1}}
                  >
                    {getItemStatus(vid, 'globals', null, it.name) === 'accepted' ? '✓' : 'Accept'}
                  </button>
                  <button 
                    className={`btn ${getItemStatus(vid, 'globals', null, it.name) === 'rejected' ? 'rejected' : 'secondary'}`} 
                    onClick={() => rejectLine(vid, 'globals', null, it.name, line.price)}
                    style={getItemStatus(vid, 'globals', null, it.name) === 'rejected' ? {backgroundColor: '#f44336', color: 'white', flex: 1} : {flex: 1}}
                  >
                    {getItemStatus(vid, 'globals', null, it.name) === 'rejected' ? '✕' : 'Reject'}
                  </button>
                </div>
              </div>
            ) : (
              <span className="small">—</span>
            )}
          </td>
        );
      })}
    </tr>))}</tbody></table>

    <h3>Compare & Accept: Model Items</h3>
    {Object.keys(rfp.items.models||{}).map(model => (
      <div key={model} style={{marginBottom:12}}>
        <div style={{fontWeight:700, margin:'8px 0'}}>Model: {model}</div>
        <table><thead><tr><th>Item</th>{(rfp.invitedVendorIds||[]).map(vid=>(<th key={vid}>{state.vendors.find(v=>v.id===vid)?.name}</th>))}</tr></thead>
        <tbody>{(rfp.items.models[model]||[]).map(it => (<tr key={it.name}>
          <td>{it.name}</td>
          {(rfp.invitedVendorIds||[]).map(vid => {
            const bid = getVendorBid(vid);
            const modelItems = bid?.items?.models?.[model] || [];
            const line = modelItems.find(x => x.name === it.name);
            return (
              <td key={vid}>
                {line ? (
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div>${line.price || '-'}</div>
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button 
                        className={`btn ${getItemStatus(vid, 'models', model, it.name) === 'accepted' ? 'accepted' : 'secondary'}`} 
                        onClick={() => acceptLine(vid, 'models', model, it.name, line.price)}
                        style={getItemStatus(vid, 'models', model, it.name) === 'accepted' ? {backgroundColor: '#4CAF50', color: 'white', flex: 1} : {flex: 1}}
                      >
                        {getItemStatus(vid, 'models', model, it.name) === 'accepted' ? '✓' : 'Accept'}
                      </button>
                      <button 
                        className={`btn ${getItemStatus(vid, 'models', model, it.name) === 'rejected' ? 'rejected' : 'secondary'}`} 
                        onClick={() => rejectLine(vid, 'models', model, it.name, line.price)}
                        style={getItemStatus(vid, 'models', model, it.name) === 'rejected' ? {backgroundColor: '#f44336', color: 'white', flex: 1} : {flex: 1}}
                      >
                        {getItemStatus(vid, 'models', model, it.name) === 'rejected' ? '✕' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="small">—</span>
                )}
              </td>
            );
          })}
        </tr>))}</tbody></table>
      </div>
    ))}

    <h3>Compare & Accept: Unit Rates</h3>
    <table><thead><tr><th>Item</th>{(rfp.invitedVendorIds||[]).map(vid=>(<th key={vid}>{state.vendors.find(v=>v.id===vid)?.name}</th>))}</tr></thead>
    <tbody>{(rfp.items.unitRates||[]).map(it => (<tr key={it.name}>
      <td>{it.name}</td>
      {(rfp.invitedVendorIds||[]).map(vid => {
        const bid = getVendorBid(vid);
        const line = bid?.items?.unitRates?.find(l => l.name === it.name);
        return (
          <td key={vid}>
            {line ? (
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div>${line.price || '-'}</div>
                <div style={{display: 'flex', gap: '4px'}}>
                  <button 
                    className={`btn ${getItemStatus(vid, 'unitRates', null, it.name) === 'accepted' ? 'accepted' : 'secondary'}`} 
                    onClick={() => acceptLine(vid, 'unitRates', null, it.name, line.price)}
                    style={getItemStatus(vid, 'unitRates', null, it.name) === 'accepted' ? {backgroundColor: '#4CAF50', color: 'white', flex: 1} : {flex: 1}}
                  >
                    {getItemStatus(vid, 'unitRates', null, it.name) === 'accepted' ? '✓' : 'Accept'}
                  </button>
                  <button 
                    className={`btn ${getItemStatus(vid, 'unitRates', null, it.name) === 'rejected' ? 'rejected' : 'secondary'}`} 
                    onClick={() => rejectLine(vid, 'unitRates', null, it.name, line.price)}
                    style={getItemStatus(vid, 'unitRates', null, it.name) === 'rejected' ? {backgroundColor: '#f44336', color: 'white', flex: 1} : {flex: 1}}
                  >
                    {getItemStatus(vid, 'unitRates', null, it.name) === 'rejected' ? '✕' : 'Reject'}
                  </button>
                </div>
              </div>
            ) : (
              <span className="small">—</span>
            )}
          </td>
        );
      })}
    </tr>))}</tbody></table>
  </div>)
}
