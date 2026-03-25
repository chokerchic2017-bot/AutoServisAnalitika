import { useState } from 'react'
import { Modal, Inp, Btn } from './ui.jsx'

export default function InventoryPage({ parts, onAdd, onUpdate, onDelete, t, fp, privacy }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ serial_number:'', description:'', quantity:0, buying_price:0, selling_price:0, low_stock_threshold:3 })
  const [search, setSearch] = useState('')

  const reset = () => { setForm({ serial_number:'', description:'', quantity:0, buying_price:0, selling_price:0, low_stock_threshold:3 }); setEditId(null) }
  const openNew = () => { reset(); setShowForm(true) }
  const openEdit = (p) => { setForm({ serial_number:p.serial_number||'', description:p.description, quantity:p.quantity, buying_price:p.buying_price, selling_price:p.selling_price, low_stock_threshold:p.low_stock_threshold||3 }); setEditId(p.id); setShowForm(true) }

  const save = () => {
    if (!form.description) return
    if (editId) { onUpdate(editId, { serial_number:form.serial_number, description:form.description, quantity:Number(form.quantity), buying_price:Number(form.buying_price), selling_price:Number(form.selling_price), low_stock_threshold:Number(form.low_stock_threshold) }) }
    else { onAdd({ serial_number:form.serial_number, description:form.description, quantity:Number(form.quantity), buying_price:Number(form.buying_price), selling_price:Number(form.selling_price), low_stock_threshold:Number(form.low_stock_threshold) }) }
    setShowForm(false); reset()
  }

  const filtered = parts.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.description.toLowerCase().includes(q) || (p.serial_number||'').toLowerCase().includes(q)
  })

  const lowStockCount = parts.filter(p => p.quantity <= (p.low_stock_threshold || 3)).length
  const totalValue = parts.reduce((s,p) => s + p.quantity * p.selling_price, 0)

  return (
    <div>
      {/* Stats */}
      <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:20}}>
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'14px 18px',flex:'1 1 130px'}}>
          <div style={{fontSize:20,marginBottom:4}}>🔩</div>
          <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:1.5,color:'#888',marginBottom:2}}>{t.inventory}</div>
          <div style={{fontSize:20,fontWeight:800,color:'#f5a623'}}>{parts.length}</div>
        </div>
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'14px 18px',flex:'1 1 130px'}}>
          <div style={{fontSize:20,marginBottom:4}}>⚠️</div>
          <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:1.5,color:'#888',marginBottom:2}}>{t.lowStock}</div>
          <div style={{fontSize:20,fontWeight:800,color:lowStockCount>0?'#e74c3c':'#27ae60'}}>{lowStockCount}</div>
        </div>
        {!privacy && <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'14px 18px',flex:'1 1 130px'}}>
          <div style={{fontSize:20,marginBottom:4}}>💰</div>
          <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:1.5,color:'#888',marginBottom:2}}>{t.totalLabel}</div>
          <div style={{fontSize:20,fontWeight:800,color:'#f5a623'}}>{fp(totalValue)}</div>
        </div>}
      </div>

      {/* Controls */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{padding:'7px 10px',background:'#1a1a1a',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:11,width:200,outline:'none'}}/>
        <Btn onClick={openNew} style={{padding:'7px 14px',fontSize:11}}>{t.addPart}</Btn>
      </div>

      {/* Parts List */}
      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:45,color:'#555',background:'#1a1a1a',borderRadius:8,border:'1px dashed #333'}}>
          <div style={{fontSize:32,marginBottom:8}}>🔩</div>
          <div style={{fontSize:12}}>{t.noParts}</div>
        </div>
      ) : (
        <div style={{display:'grid',gap:6}}>
          {filtered.map(p => {
            const isLow = p.quantity <= (p.low_stock_threshold || 3)
            return (
              <div key={p.id} style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'12px 16px',borderLeft:isLow?'4px solid #e74c3c':'4px solid #27ae60',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div style={{flex:'1 1 200px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontWeight:700,fontSize:14}}>{p.description}</span>
                    {isLow && <span style={{fontSize:8,padding:'2px 6px',borderRadius:99,fontWeight:700,background:'rgba(231,76,60,0.15)',color:'#e74c3c',textTransform:'uppercase'}}>⚠ {t.lowStock}</span>}
                  </div>
                  {p.serial_number && <div style={{fontSize:11,color:'#888'}}>🏷️ {p.serial_number}</div>}
                  <div style={{display:'flex',gap:16,marginTop:4,fontSize:12}}>
                    <span style={{color:'#f5a623',fontWeight:700}}>{t.quantity}: {p.quantity}</span>
                    {!privacy && <span style={{color:'#888'}}>{t.buyPrice}: {fp(p.buying_price)}</span>}
                    {!privacy && <span style={{color:'#27ae60'}}>{t.sellPrice}: {fp(p.selling_price)}</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:4,alignItems:'center'}}>
                  {/* Quick quantity adjust */}
                  <button onClick={()=>onUpdate(p.id, {quantity: Math.max(0, p.quantity - 1)})} style={{background:'#333',border:'none',color:'#e74c3c',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontSize:14,fontWeight:700}}>−</button>
                  <span style={{color:'#eee',fontWeight:700,fontSize:14,minWidth:28,textAlign:'center'}}>{p.quantity}</span>
                  <button onClick={()=>onUpdate(p.id, {quantity: p.quantity + 1})} style={{background:'#333',border:'none',color:'#27ae60',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontSize:14,fontWeight:700}}>+</button>
                  <div style={{width:1,height:20,background:'#333',margin:'0 4px'}}/>
                  <button onClick={()=>openEdit(p)} style={{background:'#333',border:'none',color:'#f5a623',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontSize:10}}>✏️</button>
                  <button onClick={()=>{if(window.confirm(t.deleteConfirm))onDelete(p.id)}} style={{background:'#333',border:'none',color:'#c0392b',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontSize:10}}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={()=>{setShowForm(false);reset()}} title={editId?t.editPart:t.addPart}>
        <Inp label={t.serialNumber} value={form.serial_number} onChange={e=>setForm(p=>({...p,serial_number:e.target.value}))} placeholder="SN-12345"/>
        <Inp label={`${t.description} *`} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder={t.description}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <Inp label={t.quantity} type="number" min="0" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))}/>
          <Inp label={t.threshold} type="number" min="0" value={form.low_stock_threshold} onChange={e=>setForm(p=>({...p,low_stock_threshold:e.target.value}))}/>
          <Inp label={t.buyPrice} type="number" min="0" value={form.buying_price} onChange={e=>setForm(p=>({...p,buying_price:e.target.value}))}/>
          <Inp label={t.sellPrice} type="number" min="0" value={form.selling_price} onChange={e=>setForm(p=>({...p,selling_price:e.target.value}))}/>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
          <Btn variant="secondary" onClick={()=>{setShowForm(false);reset()}}>{t.cancel}</Btn>
          <Btn onClick={save} style={{opacity:!form.description?.4:1}}>{t.saveService}</Btn>
        </div>
      </Modal>
    </div>
  )
}
