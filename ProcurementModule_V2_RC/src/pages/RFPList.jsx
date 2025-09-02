import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { load, save } from '../lib/store.js'
export default function RFPList(){
  const [state, setState] = useState(load());
  const rfps = Array.isArray(state.rfps) ? state.rfps : [];
  const navigate = useNavigate();

  const handleDelete = (rfpId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this RFP? This action cannot be undone.')) {
      const updatedState = {
        ...state,
        rfps: state.rfps.filter(rfp => rfp.id !== rfpId)
      };
      save(updatedState);
      setState(updatedState);
    }
  };

  return (
    <div>
      <div className="toolbar" style={{display:'flex', alignItems:'center', gap:12}}>
        <h2 style={{margin:0}}>RFPs</h2>
        <div style={{flex:1}}/>
        <Link className="btn" to="/rfps/new">Create RFP</Link>
      </div>
      
      {rfps.length === 0 ? (
        <div className="card">No RFPs yet. Click <b>Create RFP</b> to start one.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>RFP #</th>
              <th>Projects</th>
              <th>Due</th>
              <th>Invited</th>
              <th>Bids</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rfps.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{(r.projects||[]).join(', ')}</td>
                <td>{r.dueDate || '-'}</td>
                <td>{r.invitedVendorIds?.length || 0}</td>
                <td>{r.bids?.length || 0}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Link className="btn secondary" to={`/rfps/${r.id}`}>Open</Link>
                  <button 
                    className="btn danger" 
                    onClick={(e) => handleDelete(r.id, e)}
                    style={{ padding: '4px 8px', fontSize: '0.9em' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
