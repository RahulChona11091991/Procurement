import React from 'react'
import { useParams } from 'react-router-dom'
import { load, save, uid } from '../lib/store.js'
export default function BidSubmit(){
  const { rfpId, token } = useParams()
  const [state,setState]=React.useState(load())
  const rfp = state.rfps.find(r=>r.id===rfpId)
  const [vendorId,setVendorId]=React.useState(state.vendors[0]?.id || 'v1')
  const [ack,setAck]=React.useState(false)
  const [lines,setLines]=React.useState({ globals:[], models:[], unitRates:[] })

  React.useEffect(()=>{
    if(!rfp) return
    const g = (rfp.items.globals||[]).map(i=>({ name:i.name, price:'' }))
    const m = Object.keys(rfp.items.models||{}).map(model => ({ model, items: (rfp.items.models[model]||[]).map(i=>({ name:i.name, price:'' })) }))
    const u = (rfp.items.unitRates||[]).map(i=>({ name:i.name, price:'' }))
    setLines({ globals:g, models:m, unitRates:u })
  }, [rfpId])

  function setPrice(cat, model, name, price){
    setLines(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (cat==='globals') { const i=next.globals.findIndex(x=>x.name===name); if(i>=0) next.globals[i].price=price }
      if (cat==='unitRates') { const i=next.unitRates.findIndex(x=>x.name===name); if(i>=0) next.unitRates[i].price=price }
      if (cat==='models') { const mi=next.models.findIndex(x=>x.model===model); if(mi>=0){ const ii=next.models[mi].items.findIndex(x=>x.name===name); if(ii>=0) next.models[mi].items[ii].price=price } }
      return next
    })
  }

  function submit(){
    if(!rfp) return alert('RFP not found')
    if(!ack) return alert('Please acknowledge terms.')
    const bid = { id: uid('bid'), rfpId, vendorId, lines, status:'submitted' }
    const s = load(); s.bids.push(bid); save(s); setState(s); alert('Bid submitted!')
  }

  if (!rfp) return <div>RFP not found.</div>
  return (<div>
    <h2>Submit Bid – {rfp.id}</h2>
    <div className="small">Projects: {(rfp.projects||[]).join(', ')||'-'} · Due: {rfp.dueDate||'-'}</div>
    <div className="card">
      <div><b>Choose your company</b></div>
      <select value={vendorId} onChange={e=>setVendorId(e.target.value)}>
        {state.vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
    </div>

    <h3>Global Items</h3>
    <table><thead><tr><th>Item</th><th style={{width:200}}>Price ($)</th></tr></thead><tbody>
      {lines.globals.map(l=>(<tr key={l.name}><td>{l.name}</td><td><input type="number" step="0.01" value={l.price} onChange={e=>setPrice('globals',null,l.name,e.target.value)} /></td></tr>))}
    </tbody></table>

    {lines.models.map(m => (<div key={m.model}>
      <h3>Model: {m.model}</h3>
      <table><thead><tr><th>Item</th><th style={{width:200}}>Price ($)</th></tr></thead><tbody>
        {m.items.map(it => (<tr key={it.name}><td>{it.name}</td><td><input type="number" step="0.01" value={it.price} onChange={e=>setPrice('models',m.model,it.name,e.target.value)} /></td></tr>))}
      </tbody></table>
    </div>))}

    <h3>Unit Rate Items</h3>
    <table><thead><tr><th>Item</th><th style={{width:200}}>Price ($)</th></tr></thead><tbody>
      {lines.unitRates.map(l=>(<tr key={l.name}><td>{l.name}</td><td><input type="number" step="0.01" value={l.price} onChange={e=>setPrice('unitRates',null,l.name,e.target.value)} /></td></tr>))}
    </tbody></table>

    <div className="card" style={{marginTop:12}}>
      <label style={{display:'flex', gap:8, alignItems:'center'}}><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)} />I acknowledge the terms and I’m authorized to submit.</label>
    </div>
    <div style={{display:'flex', justifyContent:'flex-end', gap:12, marginTop:12}}>
      <button className="btn" onClick={submit}>Submit Bid</button>
    </div>
  </div>)
}
