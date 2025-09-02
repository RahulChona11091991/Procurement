const KEY = 'rohit-procurement-fresh-v1'
const init = {
  projects: ['Glenridding', 'Arbours of Keswick', 'Hawks Ridge', 'Aurora Heights'],
  models: ['Townhome A', 'Townhome B', 'SF24', 'SF28'],
  // Sample classification codes
  classificationCodes: [
    'CON-100', 'CON-200', 'CON-300', // Concrete
    'ELE-100', 'ELE-200', 'ELE-300', // Electrical
    'HVC-100', 'HVC-200', 'HVC-300', // HVAC
    'PLM-100', 'PLM-200', 'PLM-300', // Plumbing
    'FRM-100', 'FRM-200', 'FRM-300'  // Framing
  ],
  
  vendors: [
    { 
      id: 'v1', 
      name: 'BlueSky Concrete Ltd.', 
      trade: 'Concrete', 
      city: 'Edmonton',
      email: 'concrete@bluesky.ca',
      contact: 'John Smith',
      phone: '(780) 123-4567',
      classificationCodes: ['CON-100', 'CON-200'],
      notes: 'Specializes in foundation work',
      status: 'active',
      rating: 4.5
    },
    { 
      id: 'v2', 
      name: 'NorthPeak Electrical', 
      trade: 'Electrical', 
      city: 'Calgary',
      email: 'info@northpeakelec.com',
      contact: 'Sarah Johnson',
      phone: '(403) 987-6543',
      classificationCodes: ['ELE-100', 'ELE-200', 'ELE-300'],
      notes: '24/7 emergency service available',
      status: 'active',
      rating: 4.8
    },
    { 
      id: 'v3', 
      name: 'Polar HVAC', 
      trade: 'HVAC', 
      city: 'Edmonton',
      email: 'service@polarhvac.ca',
      contact: 'Mike Wilson',
      phone: '(780) 555-1234',
      classificationCodes: ['HVC-100', 'HVC-200'],
      notes: 'Specializes in commercial HVAC systems',
      status: 'active',
      rating: 4.2
    },
  ],
  documents: { // vendorId -> doc[]
    v1: [
      { id: 'wa-001', type: 'WA', projects: ['Glenridding'], models: ['Townhome A'], validFrom: '2025-06-01', validTo: '2025-12-31', files: [], supersedes: [], supersededBy: null, items: [{ name: 'Footings', price: 120 }] },
      { id: 'MSA-2025', type: 'MSA', projects: [], models: [], validFrom: '2025-01-01', validTo: '2026-12-31', files: [] },
    ]
  },
  rfps: [],   // {id, title, projects[], models[], dueDate, items: {globals, models, unitRates}, invitedVendorIds[], bids[]}
  bids: [],   // {id, rfpId, vendorId, submittedAt, status, items: {globals, models, unitRates}}
  counters: { rfp: 1, wa: 2, bid: 1 }
}
export function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || init }catch{return init} }
export function save(state){ localStorage.setItem(KEY, JSON.stringify(state)) }
export function uid(prefix = 'id') { 
  return prefix + '-' + Math.random().toString(36).slice(2, 9) 
}

// Bid management functions
export function submitBid(bidData) {
  const state = load();
  const bidId = `bid-${state.counters.bid++}`;
  
  const newBid = {
    id: bidId,
    rfpId: bidData.rfpId,
    vendorId: bidData.vendorId,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    items: bidData.items
  };
  
  // Remove existing bid if it exists
  const updatedBids = state.bids.filter(b => 
    !(b.rfpId === bidData.rfpId && b.vendorId === bidData.vendorId)
  );
  
  // Add new bid
  state.bids = [...updatedBids, newBid];
  save(state);
  
  return newBid;
}

export function getVendorBids(vendorId) {
  const state = load();
  return state.bids.filter(bid => bid.vendorId === vendorId);
}

export function getRFPBids(rfpId) {
  const state = load();
  return state.bids.filter(bid => bid.rfpId === rfpId);
}

export function getVendorRFPs(vendorId) {
  const state = load();
  return state.rfps.filter(rfp => rfp.invitedVendorIds?.includes(vendorId));
}

export function getBidById(bidId) {
  const state = load();
  return state.bids.find(bid => bid.id === bidId);
}
