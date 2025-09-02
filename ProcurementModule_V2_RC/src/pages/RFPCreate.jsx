import React from 'react'
import { useNavigate } from 'react-router-dom'
import { load, save } from '../lib/store.js'
import SelectAllList from '../components/SelectAllList.jsx'
import MultiSelect from '../components/MultiSelect.jsx'

const GLOBALS = ['Footings','Foundation Walls','Slab on Grade','Rebar','Vapor Barrier']
const MODEL_ITEMS = { 'Townhome A':['Kitchen Rough-in','Bathroom Rough-in'], 'Townhome B':['Kitchen Rough-in','Basement Rough-in'], 'SF24':['Garage'], 'SF28':['Basement Dev.'] }
const UNIT_RATES = ['Concrete (m³)','Rebar (kg)','Formwork (m²)']

export default function RFPCreate(){
  const nav = useNavigate()
  const state = load()
  const [form, setForm] = React.useState({ title:'', projects:[], models:[], dueDate:'', invitedVendorIds:[] })
  const [sel, setSel] = React.useState({ globals:{}, unitRates:{}, models: {} })

  // prepare model selection map
  React.useEffect(()=>{ const map={}; for(const m of (form.models||[])){ map[m] = sel.models?.[m] || {} } setSel(s=>({...s, models: map})) }, [form.models])

  function toggle(cat, key, checked){ setSel(s => ({ ...s, [cat]: { ...(s[cat]||{}), [key]: checked } })) }
  function toggleModelItem(model, item, checked){ setSel(s => ({ ...s, models: { ...(s.models||{}), [model]: { ...(s.models?.[model]||{}), [item]: checked } } })) }

  function create(){
    const s = load(); const id = 'RFP-' + String(s.counters.rfp).padStart(3,'0'); s.counters.rfp += 1
    const selected = {
      globals: Object.keys(sel.globals||{}).filter(k=>sel.globals[k]).map(name=>({ name })),
      models: Object.fromEntries(Object.keys(sel.models||{}).map(m => [m, Object.keys(sel.models[m]||{}).filter(k=>sel.models[m][k]).map(name=>({ name }))])),
      unitRates: Object.keys(sel.unitRates||{}).filter(k=>sel.unitRates[k]).map(name=>({ name })),
    }
    s.rfps.push({ id, title: form.title || id, projects: form.projects, models: form.models, dueDate: form.dueDate, items: selected, invitedVendorIds: form.invitedVendorIds, bids: [] })
    save(s); nav(`/rfps/${id}`)
  }

  const vendors = state.vendors

  return (<div>
    <div className="toolbar" style={{display:'flex', gap:12, alignItems:'center'}}><h2 style={{margin:0}}>Create RFP</h2><div style={{flex:1}}/><button className="btn" onClick={create}>Start RFP</button></div>
    <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
      <div style={{display:'grid', gap:12}}>
        <div className="card" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          <div><div>Title</div><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><div>Projects</div><MultiSelect options={state.projects} value={form.projects} onChange={vals=>setForm(f=>({...f,projects:vals}))} placeholder="Select projects…"/></div>
          <div><div>Due Date</div><input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></div>
        </div>
        <div className="card">
          <div style={{display:'grid', gap:12}}>
            <SelectAllList title="Global Items" items={GLOBALS} selected={sel.globals} onToggle={(it,ch)=>toggle('globals', it, ch)} />
            <div>
              <div style={{margin:'8px 0'}}><b>Models</b></div>
              <MultiSelect options={state.models} value={form.models} onChange={vals=>setForm(f=>({...f,models:vals}))} placeholder="Select models…"/>
              {(form.models||[]).map(m => (
                <div key={m} style={{marginTop:10}}>
                  <SelectAllList title={`Model: ${m}`} items={MODEL_ITEMS[m]||[]} selected={sel.models?.[m]||{}} onToggle={(it,ch)=>toggleModelItem(m,it,ch)} />
                </div>
              ))}
            </div>
            <SelectAllList title="Unit Rate Items" items={UNIT_RATES} selected={sel.unitRates} onToggle={(it,ch)=>toggle('unitRates', it, ch)} />
          </div>
        </div>
      </div>
      <div style={{display:'grid', gap:12}}>
        <div className="card">
          <div><b>Invite Vendors</b></div>
          {vendors.map(v => (
            <label key={v.id} style={{display:'flex', gap:8, alignItems:'center'}}>
              <input type="checkbox" checked={form.invitedVendorIds.includes(v.id)} onChange={e=>{
                const val = e.target.checked
                setForm(f=>({ ...f, invitedVendorIds: val ? [...f.invitedVendorIds, v.id] : f.invitedVendorIds.filter(x=>x!==v.id) }))
              }}/>
              <span>{v.name} <span className="small">({v.trade})</span></span>
            </label>
          ))}
        </div>
        <div className="card small">Vendors and later the vendor bid form will see the exact same item structure.</div>
      </div>
    </div>
  </div>)
}
