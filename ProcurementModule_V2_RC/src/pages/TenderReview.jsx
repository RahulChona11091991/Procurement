import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { load } from '../lib/store.js'
export default function TenderReview(){
  const nav = useNavigate()
  const { rfpId, token } = useParams()
  const rfp = load().rfps.find(r=>r.id===rfpId)
  if (!rfp) return <div>RFP not found.</div>
  return (<div>
    <h2>Tender Review</h2>
    <div className="card">
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
        <div><b>Projects</b><div>{(rfp.projects||[]).join(', ')||'-'}</div></div>
        <div><b>Due Date</b><div>{rfp.dueDate||'-'}</div></div>
        <div><b>Title</b><div>{rfp.title||rfp.id}</div></div>
      </div>
      <div style={{marginTop:8}}><b>Global Items</b><div className="chips">{(rfp.items.globals||[]).map(i=><span key={i.name} className="chip">{i.name}</span>)}</div></div>
      {Object.keys(rfp.items.models||{}).map(m=>(<div key={m} style={{marginTop:8}}><b>Model {m}</b><div className="chips">{(rfp.items.models[m]||[]).map(i=><span key={i.name} className="chip">{i.name}</span>)}</div></div>))}
      <div style={{marginTop:8}}><b>Unit Rates</b><div className="chips">{(rfp.items.unitRates||[]).map(i=><span key={i.name} className="chip">{i.name}</span>)}</div></div>
    </div>
    <div style={{display:'flex', justifyContent:'flex-end', marginTop:12}}>
      <button className="btn" onClick={()=>nav(`/vendor/bid/${encodeURIComponent(rfpId)}/${encodeURIComponent(token)}/submit`)}>Start Bid</button>
    </div>
  </div>)
}
