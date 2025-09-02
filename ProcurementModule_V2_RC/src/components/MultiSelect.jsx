import React from 'react'
export default function MultiSelect({ options=[], value=[], onChange, placeholder='Select…' }){
  const [open,setOpen]=React.useState(false); const ref=React.useRef(null)
  React.useEffect(()=>{ const onDoc=e=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', onDoc); return ()=>document.removeEventListener('mousedown', onDoc) },[])
  const toggle = v => value.includes(v) ? onChange(value.filter(x=>x!==v)) : onChange([...value, v])
  return (<div ref={ref} style={{position:'relative'}}>
    <button type="button" className="btn secondary" onClick={()=>setOpen(o=>!o)} style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
      <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value.length? value.join(', '): placeholder}</span><span>▾</span>
    </button>
    {open && <div style={{position:'absolute', zIndex:20, top:'calc(100% + 6px)', left:0, right:0, background:'#fff', border:'1px solid var(--border)', borderRadius:12, maxHeight:260, overflow:'auto', boxShadow:'0 8px 24px rgba(0,0,0,.08)'}}>
      {options.map(opt => (<label key={opt} style={{display:'flex', gap:8, alignItems:'center', padding:'8px 10px'}}><input type="checkbox" checked={value.includes(opt)} onChange={()=>toggle(opt)} /><span>{opt}</span></label>))}
    </div>}
    {value.length>0 && <div className="chips" style={{marginTop:8}}>{value.map(v=><span key={v} className="chip">{v}</span>)}</div>}
  </div>)
}
