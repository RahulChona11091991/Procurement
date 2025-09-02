import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { load, save } from '../lib/store.js'
import SelectAllList from '../components/SelectAllList.jsx'
import MultiSelect from '../components/MultiSelect.jsx'

const GLOBALS = ['Footings','Foundation Walls','Slab on Grade','Rebar','Vapor Barrier']
const MODEL_ITEMS = { 'Townhome A':['Kitchen Rough-in','Bathroom Rough-in'], 'Townhome B':['Kitchen Rough-in','Basement Rough-in'], 'SF24':['Garage'], 'SF28':['Basement Dev.'] }
const UNIT_RATES = ['Concrete (m³)','Rebar (kg)','Formwork (m²)']

export default function RFPEdit(){
  const { id } = useParams()
  const nav = useNavigate()
  const state = load()
  const rfp = state.rfps.find(r => r.id === id)
  
  const [form, setForm] = React.useState({ 
    title: '', 
    projects: [], 
    models: [], 
    dueDate: '', 
    invitedVendorIds: [] 
  })
  
  const [sel, setSel] = React.useState({ globals: {}, unitRates: {}, models: {} })

  // Initialize form with RFP data
  useEffect(() => {
    if (rfp) {
      setForm({
        title: rfp.title || '',
        projects: [...(rfp.projects || [])],
        models: [...(rfp.models || [])],
        dueDate: rfp.dueDate || '',
        invitedVendorIds: [...(rfp.invitedVendorIds || [])]
      });

      // Initialize selected items
      const selectedItems = rfp.items || { globals: [], models: {}, unitRates: [] }
      
      // Initialize globals
      const globals = {}
      selectedItems.globals?.forEach(item => { globals[item.name] = true })
      
      // Initialize unit rates
      const unitRates = {}
      selectedItems.unitRates?.forEach(item => { unitRates[item.name] = true })
      
      // Initialize models
      const models = {}
      Object.entries(selectedItems.models || {}).forEach(([model, items]) => {
        models[model] = {}
        items.forEach(item => { models[model][item.name] = true })
      })
      
      setSel({ globals, unitRates, models })
    }
  }, [rfp])
  
  // Update model selection map when models change
  useEffect(() => { 
    const map = { ...sel.models }
    form.models.forEach(model => { 
      if (!map[model]) map[model] = {} 
    })
    // Remove models that are no longer selected
    Object.keys(map).forEach(model => {
      if (!form.models.includes(model)) delete map[model]
    })
    setSel(s => ({ ...s, models: map })) 
  }, [form.models])

  function toggle(cat, key, checked) { 
    setSel(s => ({ ...s, [cat]: { ...(s[cat] || {}), [key]: checked } })) 
  }

  function toggleModelItem(model, item, checked) { 
    setSel(s => ({
      ...s, 
      models: { 
        ...s.models, 
        [model]: { 
          ...(s.models?.[model] || {}), 
          [item]: checked 
        } 
      } 
    })) 
  }

  function updateRFP() {
    const s = load()
    const rfpIndex = s.rfps.findIndex(r => r.id === id)
    if (rfpIndex === -1) return

    const selected = {
      globals: Object.keys(sel.globals || {}).filter(k => sel.globals[k]).map(name => ({ name })),
      models: Object.fromEntries(Object.keys(sel.models || {}).map(m => [
        m, 
        Object.keys(sel.models[m] || {}).filter(k => sel.models[m][k]).map(name => ({ name }))
      ])),
      unitRates: Object.keys(sel.unitRates || {}).filter(k => sel.unitRates[k]).map(name => ({ name }))
    }

    s.rfps[rfpIndex] = {
      ...s.rfps[rfpIndex],
      title: form.title || id,
      projects: form.projects,
      models: form.models,
      dueDate: form.dueDate,
      items: selected,
      invitedVendorIds: form.invitedVendorIds
    }
    
    save(s)
    nav(`/rfps/${id}`)
  }

  if (!rfp) return <div>RFP not found.</div>

  return (
    <div>
      <div className="toolbar" style={{display:'flex', gap:12, alignItems:'center'}}>
        <h2 style={{margin:0}}>Edit RFP {id}</h2>
        <div style={{flex:1}}/>
        <button className="btn" onClick={updateRFP}>Save Changes</button>
      </div>
      
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <div style={{display:'grid', gap:12}}>
          <div className="card" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
            <div>
              <div>Title</div>
              <input 
                value={form.title} 
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
              />
            </div>
            <div>
              <div>Projects</div>
              <MultiSelect 
                options={state.projects} 
                value={form.projects} 
                onChange={vals => setForm(f => ({ ...f, projects: vals }))} 
                placeholder="Select projects…"
              />
            </div>
            <div>
              <div>Due Date</div>
              <input 
                type="date" 
                value={form.dueDate} 
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} 
              />
            </div>
          </div>
          
          <div className="card">
            <div style={{display:'grid', gap:12}}>
              <SelectAllList 
                title="Global Items" 
                items={GLOBALS} 
                selected={sel.globals} 
                onToggle={(it, ch) => toggle('globals', it, ch)} 
              />
              
              <div>
                <div style={{margin:'8px 0'}}><b>Models</b></div>
                <MultiSelect 
                  options={state.models} 
                  value={form.models} 
                  onChange={vals => setForm(f => ({ ...f, models: vals }))} 
                  placeholder="Select models…"
                />
                
                {form.models.map(model => (
                  <div key={model} style={{marginTop: 10}}>
                    <SelectAllList 
                      title={`Model: ${model}`} 
                      items={MODEL_ITEMS[model] || []} 
                      selected={sel.models?.[model] || {}} 
                      onToggle={(it, ch) => toggleModelItem(model, it, ch)} 
                    />
                  </div>
                ))}
              </div>
              
              <SelectAllList 
                title="Unit Rate Items" 
                items={UNIT_RATES} 
                selected={sel.unitRates} 
                onToggle={(it, ch) => toggle('unitRates', it, ch)} 
              />
            </div>
          </div>
        </div>
        
        <div style={{display:'grid', gap:12}}>
          <div className="card">
            <div><b>Invite Vendors</b></div>
            {state.vendors.map(v => (
              <label key={v.id} style={{display:'flex', gap:8, alignItems:'center'}}>
                <input 
                  type="checkbox" 
                  checked={form.invitedVendorIds.includes(v.id)} 
                  onChange={e => {
                    const val = e.target.checked
                    setForm(f => ({ 
                      ...f, 
                      invitedVendorIds: val 
                        ? [...f.invitedVendorIds, v.id] 
                        : f.invitedVendorIds.filter(x => x !== v.id) 
                    }))
                  }}
                />
                <span>{v.name} <span className="small">({v.trade})</span></span>
              </label>
            ))}
          </div>
          
          <div className="card small">
            <div><b>Summary</b></div>
            <div>Projects: {form.projects.length}</div>
            <div>Models: {form.models.length}</div>
            <div>Global Items: {Object.values(sel.globals || {}).filter(Boolean).length}</div>
            <div>Unit Rates: {Object.values(sel.unitRates || {}).filter(Boolean).length}</div>
            <div>Vendors Invited: {form.invitedVendorIds.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
