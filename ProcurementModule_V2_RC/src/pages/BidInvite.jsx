import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { load } from '../lib/store.js'
export default function BidInvite(){
  const nav = useNavigate()
  const { rfpId, token } = useParams()
  const rfp = load().rfps.find(r=>r.id===rfpId)
  return (<div>
    <h2>Invitation to Bid</h2>
    {!rfp ? <div className="small">RFP not found.</div> : (
      <div className="card">
        <div><b>RFP #</b> {rfp.id}</div>
        <div><b>Projects</b> {(rfp.projects||[]).join(', ')}</div>
        <div><b>Due</b> {rfp.dueDate||'-'}</div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:12}}>
          <button className="btn secondary" onClick={()=>nav(`/vendor/bid/${encodeURIComponent(rfpId)}/${encodeURIComponent(token)}/review`)}>Review Tender</button>
          <button className="btn" onClick={()=>nav(`/vendor/bid/${encodeURIComponent(rfpId)}/${encodeURIComponent(token)}/submit`)}>Start Bid</button>
        </div>
      </div>
    )}
  </div>)
}
