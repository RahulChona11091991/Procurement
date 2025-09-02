import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function Dashboard(){
  const nav = useNavigate()
  const tiles = [
    { title:'Vendors & Documents', path:'/vendors', icon:'📑' },
    { title:'Create RFP', path:'/rfps/new', icon:'📣' },
    { title:'RFPs & Bids', path:'/rfps', icon:'🧾' },
  ]
  return (<div>
    <h2>Dashboard</h2>
    <div className="tiles">{tiles.map(t=>(<div key={t.title} className="tile" onClick={()=>nav(t.path)}><h3>{t.title}</h3><div style={{fontSize:56}}>{t.icon}</div></div>))}</div>
  </div>)
}
