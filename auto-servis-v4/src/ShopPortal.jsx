import { useState, useEffect, useRef, useCallback } from 'react'
import { loadJobs, loadCustomers, loadParts, createJob, updateJob, deleteJob as offDel, createCustomer, updateCustomer, createPart, updatePart, deletePart, decreasePartStock, updateUser, subscribeJobs, changePassword, onSyncStatus, processQueue, fullSync } from './offline.js'
import { T, CAR_BRANDS, SERVICE_IDS, Modal, Inp, Sel, Btn, Stat, PinPrompt, generateId, formatPrice, formatDate, getSvcName } from './ui.jsx'
import InventoryPage from './InventoryPage.jsx'
import AnalyticsPage from './AnalyticsPage.jsx'

const genInvoice = (j,shop,lang) => {
  const t=T[lang]||T.sq;const tot=(j.services||[]).reduce((s,v)=>s+v.price,0);const fp=p=>new Intl.NumberFormat("mk-MK").format(p)+" "+t.den;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t.invoiceLabel}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8f7f4;color:#1a1a1a;padding:40px}.inv{max-width:700px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;overflow:hidden}.hdr{background:#1a1a1a;color:#f5a623;padding:28px;display:flex;justify-content:space-between;align-items:center}.hdr h1{font-size:24px;letter-spacing:2px;text-transform:uppercase}.hdr .n{font-size:13px;color:#ccc;text-align:right}.meta{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px 28px;border-bottom:1px solid #e0e0e0}.meta label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:3px}.meta p{font-size:14px;font-weight:600}table{width:100%;border-collapse:collapse}thead{background:#f0efe8}th{text-align:left;padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #1a1a1a}th:last-child{text-align:right}td{padding:12px 16px;border-bottom:1px solid #eee;font-size:13px}td:last-child{text-align:right;font-weight:600}.tr{background:#1a1a1a;color:#f5a623}.tr td{font-size:16px;font-weight:700;padding:16px;border:none}.ft{padding:20px 28px;text-align:center;font-size:11px;color:#999}</style></head><body><div class="inv"><div class="hdr"><h1>⚙ ${shop}</h1><div class="n">${t.invoiceLabel}<br/>${formatDate(j.created_at)}</div></div><div class="meta"><div><label>${t.client}</label><p>${j.customer_name}</p><p style="font-weight:400;font-size:12px;color:#666">${j.customer_phone||""}</p></div><div><label>${t.vehicle}</label><p>${j.car_brand} ${j.car_model||""}</p><p style="font-weight:400;font-size:12px;color:#666">${j.plates||""} ${j.vin?"VIN: "+j.vin:""} ${j.year?"• "+j.year:""}</p></div></div>${(j.services||[]).length?`<table><thead><tr><th>${t.service}</th><th>${t.price}</th></tr></thead><tbody>${j.services.map(s=>`<tr><td>${s.name}${s.note?`<br><span style="font-size:11px;color:#888">${s.note}</span>`:""}</td><td>${fp(s.price)}</td></tr>`).join("")}${(j.parts_used||[]).length?j.parts_used.map(p=>`<tr><td>🔩 ${p.description} x${p.qty}</td><td>${fp(p.price*p.qty)}</td></tr>`).join(""):""}
<tr class="tr"><td>${t.totalUpper}</td><td>${fp(tot+(j.parts_used||[]).reduce((s,p)=>s+p.price*p.qty,0))}</td></tr></tbody></table>`:""}<div class="ft">${t.thankYou} • ${shop}</div></div></body></html>`
}

export default function ShopPortal({ user:initUser, onLogout, onUserUpdate, lang:initLang, setLang:parentSetLang }) {
  const [usr, setUsr] = useState(initUser)
  const [jobs, setJobs] = useState([])
  const [customers, setCusts] = useState([])
  const [parts, setParts] = useState([])
  const [lang, setLL] = useState(initLang||'sq')
  const [privacy, setPrivacy] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [view, setView] = useState('dashboard')
  const [showJob, setShowJob] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showInv, setShowInv] = useState(null)
  const [showSet, setShowSet] = useState(false)
  const [search, setSearch] = useState('')
  const [syncStatus, setSyncStatus] = useState('synced')
  const [showPhoto, setShowPhoto] = useState(null)
  const [pwForm, setPwForm] = useState({old:'',new1:'',new2:''})
  const [pwErr, setPwErr] = useState('')
  const [pwOk, setPwOk] = useState('')
  const fileRef = useRef(null)

  const setLang = (l) => { setLL(l); parentSetLang?.(l) }
  const t = T[lang]||T.sq
  const fp = (p) => formatPrice(p, lang)
  const brands = [...CAR_BRANDS, t.other]
  const mask = (n) => { if(!privacy||!n)return n; return n.split(" ").map(p=>p[0]+"•".repeat(Math.max(p.length-1,2))).join(" ") }
  const maskP = (p) => { if(!privacy||!p)return p; return p.length<=3?"•••":p.slice(0,3)+"•".repeat(p.length-3) }

  useEffect(() => { onSyncStatus(setSyncStatus) }, [])

  const loadData = useCallback(async () => {
    if (!usr?.id) return
    const [j,c,p] = await Promise.all([loadJobs(usr.id), loadCustomers(usr.id), loadParts(usr.id)])
    setJobs(j); setCusts(c); setParts(p)
  }, [usr?.id])

  useEffect(() => { loadData(); processQueue() }, [loadData])
  useEffect(() => { if(!usr?.id)return; return subscribeJobs(usr.id, loadData) }, [usr?.id, loadData])
  useEffect(() => { const h=()=>{fullSync(usr?.id).then(()=>loadData())}; window.addEventListener('online',h); return()=>window.removeEventListener('online',h) }, [usr?.id, loadData])

  const togglePrivacy = () => { if(!privacy)setPrivacy(true);else if(usr.pin)setShowPin(true);else setPrivacy(false) }
  const pinOk = (v) => { if(v===usr.pin){setPrivacy(false);setShowPin(false);return true}return false }

  // ─── JOB FORM ───
  const emptyJf = {customer_name:"",customer_phone:"",car_brand:CAR_BRANDS[0],car_model:"",plates:"",year:"",vin:"",vin_photo:"",services:[],parts_used:[],notes:""}
  const [jf, setJf] = useState({...emptyJf})
  const [sf, setSf] = useState({typeId:SERVICE_IDS[0],price:"",note:"",customName:""})
  const [showCustPicker, setShowCustPicker] = useState(false)
  const [custSearch, setCustSearch] = useState("")

  const resetForm = () => { setJf({...emptyJf}); setSf({typeId:SERVICE_IDS[0],price:"",note:"",customName:""}); setEditId(null) }
  const openNew = () => { resetForm(); setShowJob(true) }
  const openEdit = (j) => {
    setJf({customer_name:j.customer_name,customer_phone:j.customer_phone||"",car_brand:j.car_brand,car_model:j.car_model||"",plates:j.plates||"",year:j.year||"",vin:j.vin||"",vin_photo:j.vin_photo||"",services:[...(j.services||[])],parts_used:[...(j.parts_used||[])],notes:j.notes||""})
    setEditId(j.id); setSf({typeId:SERVICE_IDS[0],price:"",note:"",customName:""}); setShowJob(true)
  }

  // Repeat customer picker
  const pickCustomer = (c) => {
    setJf(p => ({...p, customer_name:c.name, customer_phone:c.phone||"", car_brand:c.car_brand||p.car_brand, car_model:c.car_model||"", plates:c.plates||"", vin:c.vin||""}))
    setShowCustPicker(false); setCustSearch("")
  }
  const filteredCusts = customers.filter(c => { if(!custSearch)return true; const q=custSearch.toLowerCase(); return c.name.toLowerCase().includes(q)||(c.phone||"").includes(q) })

  // VIN Camera
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]; if(!file)return
    const reader = new FileReader()
    reader.onload = (ev) => { setJf(p => ({...p, vin_photo: ev.target.result})) }
    reader.readAsDataURL(file)
  }

  // Services
  const addSvc = () => { const s={id:generateId(),serviceId:sf.typeId,name:sf.typeId==="custom"?(sf.customName||t.svc_custom):getSvcName(sf.typeId,lang),price:Number(sf.price)||0,note:sf.note}; setJf(p=>({...p,services:[...p.services,s]})); setSf({typeId:SERVICE_IDS[0],price:"",note:"",customName:""}) }
  const rmSvc = (id) => setJf(p=>({...p,services:p.services.filter(s=>s.id!==id)}))

  // Parts from inventory
  const [showPartPicker, setShowPartPicker] = useState(false)
  const addPartToJob = (part) => {
    const existing = jf.parts_used.find(p => p.part_id === part.id)
    if (existing) {
      setJf(p => ({...p, parts_used: p.parts_used.map(pu => pu.part_id === part.id ? {...pu, qty: pu.qty + 1} : pu)}))
    } else {
      setJf(p => ({...p, parts_used: [...p.parts_used, {part_id:part.id, description:part.description, price:part.selling_price, qty:1}]}))
    }
    setShowPartPicker(false)
  }
  const rmPart = (partId) => setJf(p => ({...p, parts_used: p.parts_used.filter(pu => pu.part_id !== partId)}))

  const saveJob = async () => {
    if(!jf.customer_name) return
    const jobData = {customer_name:jf.customer_name,customer_phone:jf.customer_phone,car_brand:jf.car_brand,car_model:jf.car_model,plates:jf.plates,year:jf.year,vin:jf.vin,vin_photo:jf.vin_photo,services:jf.services,parts_used:jf.parts_used,notes:jf.notes}
    if(editId) {
      await updateJob(editId, jobData, usr.id)
    } else {
      await createJob({user_id:usr.id,...jobData,status:'active'})
      // Save/update customer with car info
      const existing = customers.find(c=>c.name===jf.customer_name)
      if(existing) { await updateCustomer(existing.id,{phone:jf.customer_phone,car_brand:jf.car_brand,car_model:jf.car_model,plates:jf.plates,vin:jf.vin},usr.id) }
      else { await createCustomer({user_id:usr.id,name:jf.customer_name,phone:jf.customer_phone,car_brand:jf.car_brand,car_model:jf.car_model,plates:jf.plates,vin:jf.vin}) }
      // Decrease part stock
      for (const pu of jf.parts_used) { await decreasePartStock(pu.part_id, pu.qty, usr.id) }
    }
    setShowJob(false); resetForm(); loadData()
  }
  const complete = async(id) => { await updateJob(id,{status:'done'},usr.id); loadData() }
  const delJob = async(id) => { await offDel(id,usr.id); loadData() }

  const openLink = (j) => { const b=new Blob([genInvoice(j,usr.shop_name,lang)],{type:"text/html"}); window.open(URL.createObjectURL(b),"_blank") }
  const printInv = (j) => { const w=window.open("","_blank","width=800,height=1000"); w.document.write(genInvoice(j,usr.shop_name,lang)); w.document.close(); setTimeout(()=>w.print(),500) }

  // Computed
  const filtered = jobs.filter(j=>{if(!search)return true;const s=search.toLowerCase();return j.customer_name.toLowerCase().includes(s)||j.car_brand.toLowerCase().includes(s)||(j.plates||"").toLowerCase().includes(s)||(j.vin||"").toLowerCase().includes(s)})
  const active = jobs.filter(j=>j.status==="active")
  const done = jobs.filter(j=>j.status==="done")
  const rev = done.reduce((s,j)=>s+(j.services||[]).reduce((s2,v)=>s2+(v.price||0),0)+(j.parts_used||[]).reduce((s2,v)=>s2+(v.price||0)*(v.qty||1),0),0)
  const lowStockParts = parts.filter(p => p.quantity <= (p.low_stock_threshold || 3))

  const nav = [{id:"dashboard",icon:"📊",label:t.dashboard},{id:"jobs",icon:"🔧",label:t.services},{id:"customers",icon:"👤",label:t.customers},{id:"inventory",icon:"🔩",label:t.inventory},{id:"analytics",icon:"📈",label:t.analytics}]

  // ─── INVENTORY HANDLERS ───
  const handleAddPart = async (form) => { await createPart({user_id:usr.id,...form}); loadData() }
  const handleUpdatePart = async (id, updates) => { await updatePart(id, updates, usr.id); loadData() }
  const handleDeletePart = async (id) => { await deletePart(id, usr.id); loadData() }

  return (
    <div style={{minHeight:"100vh",background:"#111",color:"#eee",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* Header */}
      <header style={{background:"#1a1a1a",borderBottom:"2px solid #f5a623",padding:"0 10px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:20}}>⚙</span>
          <span style={{fontSize:13,fontWeight:800,color:"#f5a623",letterSpacing:2,textTransform:"uppercase"}}>{usr.shop_name}</span>
          {syncStatus==='offline'&&<span style={{fontSize:7,background:"#e67e22",color:"#fff",padding:"2px 5px",borderRadius:3,fontWeight:700}}>OFFLINE</span>}
          {syncStatus==='syncing'&&<span style={{fontSize:7,background:"#3498db",color:"#fff",padding:"2px 5px",borderRadius:3,fontWeight:700}}>SYNC</span>}
          {lowStockParts.length>0&&<span style={{fontSize:7,background:"#e74c3c",color:"#fff",padding:"2px 5px",borderRadius:3,fontWeight:700}}>⚠ {lowStockParts.length}</span>}
        </div>
        <div style={{display:"flex",gap:2,alignItems:"center"}}>
          {nav.map(n=><button key={n.id} onClick={()=>setView(n.id)} style={{padding:"4px 7px",border:"none",borderRadius:3,cursor:"pointer",fontSize:10,fontWeight:600,background:view===n.id?"#f5a623":"transparent",color:view===n.id?"#111":"#888"}}><span>{n.icon}</span><span className="header-nav-label" style={{marginLeft:3}}>{n.label}</span></button>)}
          <div style={{width:1,height:20,background:"#333",margin:"0 4px"}}/>
          <div style={{display:"flex",background:"#111",borderRadius:4,overflow:"hidden",border:"1px solid #333"}}>{[["sq","SQ"],["mk","МК"]].map(([c,l])=><button key={c} onClick={()=>setLang(c)} style={{padding:"3px 8px",border:"none",cursor:"pointer",fontSize:9,fontWeight:700,background:lang===c?"#f5a623":"transparent",color:lang===c?"#111":"#888"}}>{l}</button>)}</div>
          <button onClick={togglePrivacy} style={{padding:"3px 7px",border:"none",borderRadius:4,cursor:"pointer",fontSize:13,background:privacy?"#c0392b":"transparent",color:privacy?"#fff":"#666"}}>{privacy?"🔒":"👁"}</button>
          {!privacy&&<button onClick={()=>setShowSet(true)} style={{padding:"3px 6px",border:"none",background:"transparent",color:"#666",cursor:"pointer",fontSize:13}}>⚙️</button>}
          <button onClick={onLogout} style={{padding:"3px 8px",border:"none",background:"#333",borderRadius:3,color:"#eee",cursor:"pointer",fontSize:9}}>{t.logout}</button>
        </div>
      </header>

      {privacy&&<div style={{background:"rgba(192,57,43,0.15)",padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span style={{fontSize:11}}>🔒</span><span style={{fontSize:10,color:"#e74c3c",fontWeight:600}}>{t.privacyOn}</span></div>}

      <main style={{maxWidth:1100,margin:"0 auto",padding:"12px 12px 70px"}}>

        {/* ═══ DASHBOARD ═══ */}
        {view==="dashboard"&&<div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:20}}>
            <Stat icon="🔧" label={t.active} value={active.length}/>
            <Stat icon="✅" label={t.completed} value={privacy?"•••":done.length}/>
            <Stat icon="👤" label={t.customers} value={privacy?"•••":customers.length}/>
            <Stat icon="💰" label={t.revenue} value={privacy?"• • •":fp(rev)}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2 style={{fontSize:12,color:"#888",letterSpacing:1.5,textTransform:"uppercase"}}>{t.activeServices}</h2><Btn onClick={openNew} style={{padding:"6px 12px",fontSize:11}}>{t.newService}</Btn></div>
          {active.length===0?<div style={{textAlign:"center",padding:40,color:"#555",background:"#1a1a1a",borderRadius:8,border:"1px dashed #333"}}><div style={{fontSize:30,marginBottom:6}}>🚗</div><div style={{fontSize:11}}>{t.noActive}</div></div>:
            <div style={{display:"grid",gap:7}}>{active.slice(0,5).map(j=><Card key={j.id} job={j} onDone={complete} onEdit={()=>openEdit(j)} onInv={()=>setShowInv(j)} onDel={delJob} t={t} fp={fp} priv={privacy} mask={mask} maskP={maskP}/>)}</div>}
          {done.length>0&&!privacy&&<><h2 style={{fontSize:12,color:"#888",letterSpacing:1.5,textTransform:"uppercase",margin:"20px 0 10px"}}>{t.recentDone}</h2><div style={{display:"grid",gap:7}}>{done.slice(0,3).map(j=><Card key={j.id} job={j} onEdit={()=>openEdit(j)} onInv={()=>setShowInv(j)} onDel={delJob} done t={t} fp={fp} priv={privacy} mask={mask} maskP={maskP}/>)}</div></>}
        </div>}

        {/* ═══ JOBS ═══ */}
        {view==="jobs"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <h2 style={{fontSize:12,color:"#888",letterSpacing:1.5,textTransform:"uppercase"}}>{t.allServices}</h2>
            <div style={{display:"flex",gap:8,alignItems:"center"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{padding:"6px 10px",background:"#1a1a1a",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:11,width:180,outline:"none"}}/><Btn onClick={openNew} style={{padding:"6px 12px",fontSize:11}}>{t.newService}</Btn></div>
          </div>
          {filtered.length===0?<div style={{textAlign:"center",padding:40,color:"#555"}}>{t.noResults}</div>:
            <div style={{display:"grid",gap:7}}>{filtered.map(j=><Card key={j.id} job={j} onDone={j.status==="active"?complete:null} onEdit={()=>openEdit(j)} onInv={()=>setShowInv(j)} onDel={delJob} done={j.status==="done"} t={t} fp={fp} priv={privacy} mask={mask} maskP={maskP}/>)}</div>}
        </div>}

        {/* ═══ CUSTOMERS ═══ */}
        {view==="customers"&&<div>
          {privacy?<div style={{textAlign:"center",padding:50,color:"#c0392b",background:"#1a1a1a",borderRadius:8,border:"1px solid rgba(192,57,43,0.3)"}}><div style={{fontSize:36,marginBottom:10}}>🔒</div><div style={{fontWeight:700}}>{t.privacyLocked}</div></div>:<>
            <h2 style={{fontSize:12,color:"#888",letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>{t.customersCount} ({customers.length})</h2>
            {customers.length===0?<div style={{textAlign:"center",padding:40,color:"#555",background:"#1a1a1a",borderRadius:8,border:"1px dashed #333"}}><div style={{fontSize:30,marginBottom:6}}>👤</div><div style={{fontSize:11}}>{t.customersAuto}</div></div>:
              <div style={{display:"grid",gap:6}}>{customers.map(c=>{const cj=jobs.filter(j=>j.customer_name===c.name);const ct=cj.reduce((s,j)=>s+(j.services||[]).reduce((s2,v)=>s2+(v.price||0),0),0);const lastJ=cj[0];return(<div key={c.id} style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:10,color:"#888"}}>{c.phone||t.noPhone}{c.car_brand?` • 🚗 ${c.car_brand} ${c.car_model||""}`:""}{c.vin?` • VIN: ${c.vin.slice(0,8)}...`:""}</div>{lastJ&&<div style={{fontSize:9,color:"#666",marginTop:2}}>{t.lastService}: {formatDate(lastJ.created_at)} — {(lastJ.services||[]).map(s=>s.name).join(", ")||"—"}</div>}</div>
                <div style={{display:"flex",gap:14}}><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#888",textTransform:"uppercase"}}>{t.servicesLabel}</div><div style={{fontWeight:700,color:"#f5a623"}}>{cj.length}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#888",textTransform:"uppercase"}}>{t.totalLabel}</div><div style={{fontWeight:700,color:"#f5a623"}}>{fp(ct)}</div></div></div>
              </div>)})}</div>}
          </>}
        </div>}

        {/* ═══ INVENTORY ═══ */}
        {view==="inventory"&&<InventoryPage parts={parts} onAdd={handleAddPart} onUpdate={handleUpdatePart} onDelete={handleDeletePart} t={t} fp={fp} privacy={privacy}/>}

        {/* ═══ ANALYTICS ═══ */}
        {view==="analytics"&&(privacy?<div style={{textAlign:"center",padding:50,color:"#c0392b",background:"#1a1a1a",borderRadius:8,border:"1px solid rgba(192,57,43,0.3)"}}><div style={{fontSize:36,marginBottom:10}}>🔒</div><div style={{fontWeight:700}}>{t.privacyLocked}</div></div>:<AnalyticsPage jobs={jobs} customers={customers} parts={parts} t={t} fp={fp} lang={lang}/>)}
      </main>

      {/* ═══ JOB MODAL ═══ */}
      <Modal open={showJob} onClose={()=>{setShowJob(false);resetForm()}} title={editId?t.editServiceTitle:t.newServiceTitle}>
        {/* Repeat customer picker */}
        {!editId && customers.length>0 && <div style={{marginBottom:14}}>
          <button onClick={()=>setShowCustPicker(!showCustPicker)} style={{background:"#222",border:"1px solid #444",borderRadius:6,padding:"8px 14px",color:"#f5a623",cursor:"pointer",fontSize:11,fontWeight:600,width:"100%",textAlign:"left"}}>🔄 {t.selectCustomer}</button>
          {showCustPicker && <div style={{background:"#1a1a1a",border:"1px solid #333",borderRadius:6,marginTop:6,maxHeight:180,overflow:"auto"}}>
            <input value={custSearch} onChange={e=>setCustSearch(e.target.value)} placeholder={t.searchPlaceholder} autoFocus style={{width:"100%",padding:"8px 10px",background:"#111",border:"none",borderBottom:"1px solid #333",color:"#eee",fontSize:12,outline:"none"}}/>
            {filteredCusts.map(c=>{
              const lastJ = jobs.filter(j=>j.customer_name===c.name)[0]
              return <button key={c.id} onClick={()=>pickCustomer(c)} style={{display:"block",width:"100%",padding:"8px 12px",background:"transparent",border:"none",borderBottom:"1px solid #222",color:"#eee",cursor:"pointer",textAlign:"left",fontSize:12}}>
                <span style={{fontWeight:700}}>{c.name}</span>
                <span style={{color:"#888",marginLeft:8}}>{c.car_brand} {c.car_model} {c.plates?`• ${c.plates}`:""}</span>
                {lastJ&&<div style={{fontSize:10,color:"#666"}}>{t.lastService}: {formatDate(lastJ.created_at)}</div>}
              </button>
            })}
          </div>}
        </div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <Inp label={t.customerName} value={jf.customer_name} onChange={e=>setJf(p=>({...p,customer_name:e.target.value}))} placeholder={t.customerNamePh}/>
          <Inp label={t.phone} value={jf.customer_phone} onChange={e=>setJf(p=>({...p,customer_phone:e.target.value}))} placeholder={t.phonePh}/>
          <Sel label={t.brand} value={jf.car_brand} onChange={e=>setJf(p=>({...p,car_brand:e.target.value}))} options={brands.map(b=>({value:b,label:b}))}/>
          <Inp label={t.model} value={jf.car_model} onChange={e=>setJf(p=>({...p,car_model:e.target.value}))} placeholder={t.modelPh}/>
          <Inp label={t.plates} value={jf.plates} onChange={e=>setJf(p=>({...p,plates:e.target.value}))} placeholder={t.platesPh}/>
          <Inp label={t.year} value={jf.year} onChange={e=>setJf(p=>({...p,year:e.target.value}))} placeholder={t.yearPh}/>
        </div>
        {/* VIN + Camera */}
        <div style={{display:"flex",gap:8,alignItems:"end"}}>
          <div style={{flex:1}}><Inp label={t.vin} value={jf.vin} onChange={e=>setJf(p=>({...p,vin:e.target.value}))} placeholder={t.vinPh}/></div>
          <div style={{marginBottom:14}}>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()} style={{padding:"9px 12px",background:"#333",border:"none",borderRadius:4,color:"#f5a623",cursor:"pointer",fontSize:12}}>{t.vinPhoto}</button>
          </div>
        </div>
        {jf.vin_photo && <div style={{marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
          <img src={jf.vin_photo} alt="VIN" style={{height:60,borderRadius:4,border:"1px solid #333",cursor:"pointer"}} onClick={()=>setShowPhoto(jf.vin_photo)}/>
          <button onClick={()=>setJf(p=>({...p,vin_photo:""}))} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontSize:11}}>{t.removePhoto}</button>
        </div>}

        {/* Services */}
        <div style={{borderTop:"1px solid #333",margin:"10px 0",paddingTop:10}}>
          <label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:8,fontWeight:700}}>{t.addServices}</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:6,alignItems:"end"}}>
            <Sel label={t.serviceType} value={sf.typeId} onChange={e=>setSf(p=>({...p,typeId:e.target.value}))} options={SERVICE_IDS.map(id=>({value:id,label:getSvcName(id,lang)}))}/>
            <Inp label={t.priceDen} type="number" value={sf.price} onChange={e=>setSf(p=>({...p,price:e.target.value}))} placeholder="0" style={{width:100}}/>
            <Btn onClick={addSvc} style={{marginBottom:14,padding:"9px 14px"}}>+</Btn>
          </div>
          {sf.typeId==="custom"&&<Inp label={t.customServiceName} value={sf.customName} onChange={e=>setSf(p=>({...p,customName:e.target.value}))} placeholder={t.customServicePh}/>}
        </div>

        {/* Parts from inventory */}
        {parts.length>0&&<div style={{marginBottom:10}}>
          <button onClick={()=>setShowPartPicker(!showPartPicker)} style={{background:"#222",border:"1px solid #444",borderRadius:6,padding:"8px 14px",color:"#3498db",cursor:"pointer",fontSize:11,fontWeight:600}}>🔩 {t.addPartFromInv}</button>
          {showPartPicker&&<div style={{background:"#1a1a1a",border:"1px solid #333",borderRadius:6,marginTop:6,maxHeight:160,overflow:"auto"}}>
            {parts.filter(p=>p.quantity>0).map(p=><button key={p.id} onClick={()=>addPartToJob(p)} style={{display:"block",width:"100%",padding:"8px 12px",background:"transparent",border:"none",borderBottom:"1px solid #222",color:"#eee",cursor:"pointer",textAlign:"left",fontSize:12}}>
              <span style={{fontWeight:600}}>{p.description}</span><span style={{color:"#888",marginLeft:8}}>({p.quantity} {t.quantity})</span><span style={{color:"#27ae60",marginLeft:8}}>{fp(p.selling_price)}</span>
            </button>)}
          </div>}
        </div>}

        {/* Service + Parts list */}
        {(jf.services.length>0||jf.parts_used.length>0)&&<div style={{background:"#111",borderRadius:6,padding:10,marginBottom:10}}>
          {jf.services.map(s=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #222"}}><div><span style={{fontWeight:600,fontSize:12}}>{s.name}</span>{s.note&&<span style={{fontSize:9,color:"#666",marginLeft:6}}>{s.note}</span>}</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#f5a623",fontWeight:700,fontSize:12}}>{fp(s.price)}</span><button onClick={()=>rmSvc(s.id)} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontSize:14}}>✕</button></div></div>)}
          {jf.parts_used.map(pu=><div key={pu.part_id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #222"}}><div><span style={{fontSize:12}}>🔩 {pu.description}</span><span style={{color:"#888",fontSize:11,marginLeft:6}}>x{pu.qty}</span></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#3498db",fontWeight:700,fontSize:12}}>{fp(pu.price*pu.qty)}</span><button onClick={()=>rmPart(pu.part_id)} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontSize:14}}>✕</button></div></div>)}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,fontWeight:800,fontSize:14}}><span>{t.total}</span><span style={{color:"#f5a623"}}>{fp(jf.services.reduce((s,v)=>s+v.price,0)+jf.parts_used.reduce((s,v)=>s+v.price*v.qty,0))}</span></div>
        </div>}

        <Inp label={t.noteOptional} value={jf.notes} onChange={e=>setJf(p=>({...p,notes:e.target.value}))} placeholder={t.noteDetailsPh}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn variant="secondary" onClick={()=>{setShowJob(false);resetForm()}}>{t.cancel}</Btn><Btn onClick={saveJob} style={{opacity:!jf.customer_name?.4:1}}>{t.saveService}</Btn></div>
      </Modal>

      {/* ═══ INVOICE ═══ */}
      <Modal open={!!showInv} onClose={()=>setShowInv(null)} title={t.invoice}>{showInv&&<div>
        <div style={{background:"#fff",color:"#1a1a1a",borderRadius:6,padding:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",borderBottom:"2px solid #1a1a1a",paddingBottom:10,marginBottom:10}}><div style={{fontSize:15,fontWeight:800}}>⚙ {usr.shop_name}</div><div style={{textAlign:"right",fontSize:10,color:"#666"}}>{t.invoiceLabel}<br/>{formatDate(showInv.created_at)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12,fontSize:11}}>
            <div><div style={{fontSize:8,textTransform:"uppercase",color:"#999"}}>{t.client}</div><div style={{fontWeight:700}}>{showInv.customer_name}</div><div style={{color:"#666"}}>{showInv.customer_phone}</div></div>
            <div><div style={{fontSize:8,textTransform:"uppercase",color:"#999"}}>{t.vehicle}</div><div style={{fontWeight:700}}>{showInv.car_brand} {showInv.car_model}</div><div style={{color:"#666"}}>{showInv.plates}{showInv.vin?` • VIN: ${showInv.vin}`:""}{showInv.year?` • ${showInv.year}`:""}</div></div>
          </div>
          {showInv.vin_photo&&<div style={{marginBottom:10}}><img src={showInv.vin_photo} alt="VIN" style={{height:50,borderRadius:4,cursor:"pointer"}} onClick={()=>setShowPhoto(showInv.vin_photo)}/></div>}
          {((showInv.services||[]).length>0||(showInv.parts_used||[]).length>0)?<>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{borderBottom:"2px solid #eee"}}><th style={{textAlign:"left",padding:"4px 0",fontSize:8,textTransform:"uppercase",color:"#999"}}>{t.service}</th><th style={{textAlign:"right",padding:"4px 0",fontSize:8,textTransform:"uppercase",color:"#999"}}>{t.price}</th></tr></thead><tbody>
              {(showInv.services||[]).map(s=><tr key={s.id} style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:"6px 0"}}>{s.name}</td><td style={{textAlign:"right",fontWeight:600}}>{fp(s.price)}</td></tr>)}
              {(showInv.parts_used||[]).map(p=><tr key={p.part_id} style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:"6px 0"}}>🔩 {p.description} x{p.qty}</td><td style={{textAlign:"right",fontWeight:600}}>{fp(p.price*p.qty)}</td></tr>)}
            </tbody></table>
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid #1a1a1a",marginTop:4,fontSize:14,fontWeight:800}}><span>{t.totalUpper}</span><span style={{color:"#d4880f"}}>{fp((showInv.services||[]).reduce((s,v)=>s+v.price,0)+(showInv.parts_used||[]).reduce((s,v)=>s+v.price*v.qty,0))}</span></div>
          </>:<div style={{padding:12,textAlign:"center",color:"#999",fontSize:11}}>{t.noServicesYet}</div>}
          <div style={{textAlign:"center",fontSize:9,color:"#bbb",marginTop:8}}>{t.thankYou}</div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn onClick={()=>openLink(showInv)} style={{fontSize:11,padding:"6px 12px"}}>{t.openAsLink}</Btn><Btn variant="ghost" onClick={()=>printInv(showInv)} style={{fontSize:11,padding:"6px 12px"}}>{t.printImage}</Btn></div>
      </div>}</Modal>

      {/* Photo viewer */}
      {showPhoto&&<div style={{position:"fixed",inset:0,zIndex:1200,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowPhoto(null)}><img src={showPhoto} alt="Photo" style={{maxWidth:"90%",maxHeight:"90vh",borderRadius:8}}/></div>}

      {/* Settings */}
      <Modal open={showSet} onClose={()=>setShowSet(false)} title={t.settings}>
        <Inp label={t.shopNameLabel} value={usr.shop_name} onChange={async e=>{const n=e.target.value;setUsr(p=>({...p,shop_name:n}));await updateUser(usr.id,{shop_name:n})}}/>
        <div style={{borderTop:"1px solid #333",paddingTop:10,marginTop:4,marginBottom:10}}>
          <label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:6,fontWeight:700}}>{t.pinSection}</label>
          <div style={{display:"flex",gap:8,alignItems:"end"}}>
            <Inp label={t.pinLabel} type="password" inputMode="numeric" maxLength={4} value={usr.pin||""} onChange={async e=>{const v=e.target.value.replace(/\D/g,"").slice(0,4);setUsr(p=>({...p,pin:v}));await updateUser(usr.id,{pin:v})}} placeholder={t.pinPh} style={{flex:1}}/>
            {usr.pin&&<Btn variant="secondary" onClick={async()=>{setUsr(p=>({...p,pin:""}));await updateUser(usr.id,{pin:""})}} style={{marginBottom:14,fontSize:10}}>{t.pinRemove}</Btn>}
          </div>
        </div>
        <div style={{borderTop:"1px solid #333",paddingTop:10}}>
          <label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:6,fontWeight:700}}>{t.changePw}</label>
          {pwErr&&<div style={{background:"rgba(192,57,43,0.15)",borderRadius:4,padding:"5px 10px",marginBottom:8,color:"#e74c3c",fontSize:11}}>{pwErr}</div>}
          {pwOk&&<div style={{background:"rgba(39,174,96,0.15)",borderRadius:4,padding:"5px 10px",marginBottom:8,color:"#27ae60",fontSize:11}}>{pwOk}</div>}
          <Inp label={t.oldPw} type="password" value={pwForm.old} onChange={e=>{setPwForm(p=>({...p,old:e.target.value}));setPwErr('')}}/>
          <Inp label={t.newPw} type="password" value={pwForm.new1} onChange={e=>{setPwForm(p=>({...p,new1:e.target.value}));setPwErr('')}}/>
          <Inp label={t.confirmPw} type="password" value={pwForm.new2} onChange={e=>{setPwForm(p=>({...p,new2:e.target.value}));setPwErr('')}}/>
          <Btn onClick={async()=>{setPwErr('');setPwOk('');if(pwForm.new1!==pwForm.new2){setPwErr(t.pwMismatch);return}if(pwForm.new1.length<4){setPwErr(t.pwShort);return}if(pwForm.old!==usr.password){setPwErr(t.pwWrong);return}const ok=await changePassword(usr.id,pwForm.new1);if(ok){setUsr(p=>({...p,password:pwForm.new1}));onUserUpdate?.({password:pwForm.new1});setPwForm({old:'',new1:'',new2:''});setPwOk(t.pwChanged)}}} style={{fontSize:11}}>OK</Btn>
        </div>
      </Modal>

      <PinPrompt open={showPin} onClose={()=>setShowPin(false)} onOk={pinOk} t={t}/>
    </div>
  )
}

// ─── JOB CARD ───
function Card({job,onDone,onEdit,onInv,onDel,done,t,fp,priv,mask,maskP}){
  const svcs=job.services||[];const pu=job.parts_used||[];const tot=svcs.reduce((s,v)=>s+(v.price||0),0)+pu.reduce((s,v)=>s+(v.price||0)*(v.qty||1),0);const has=svcs.length>0||pu.length>0;
  return(<div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 14px",borderLeft:done?"4px solid #27ae60":has?"4px solid #f5a623":"4px solid #555"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
      <div style={{flex:"1 1 180px",minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontWeight:700,fontSize:13}}>{mask(job.customer_name)}</span><span style={{fontSize:8,padding:"2px 6px",borderRadius:99,fontWeight:700,textTransform:"uppercase",background:done?"rgba(39,174,96,0.15)":"rgba(245,166,35,0.15)",color:done?"#27ae60":"#f5a623"}}>{done?t.done:t.activeStatus}</span></div>
        <div style={{fontSize:11,color:"#999",display:"flex",gap:8,flexWrap:"wrap"}}><span>🚗 {job.car_brand} {job.car_model}</span>{job.plates&&<span>📋 {maskP(job.plates)}</span>}{job.vin&&<span style={{fontSize:10}}>VIN: {priv?"•••":job.vin.slice(0,10)+"..."}</span>}</div>
        <div style={{fontSize:10,color:"#666",marginTop:3,display:"flex",gap:4,flexWrap:"wrap"}}>
          {has?<>{svcs.map(s=><span key={s.id} style={{background:"#252525",padding:"1px 6px",borderRadius:3}}>{s.name}</span>)}{pu.map(p=><span key={p.part_id} style={{background:"#1a2a3a",padding:"1px 6px",borderRadius:3,color:"#3498db"}}>🔩{p.description}</span>)}</>:<span style={{fontStyle:"italic"}}>{t.noServicesYet}</span>}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:800,color:"#f5a623"}}>{priv?"• • •":has?fp(tot):"—"}</div>
        <div style={{fontSize:9,color:"#666"}}>{formatDate(job.created_at)}</div>
        <div style={{display:"flex",gap:4,marginTop:4,justifyContent:"flex-end",flexWrap:"wrap"}}>
          {onDone&&<button onClick={()=>onDone(job.id)} style={{background:"#27ae60",border:"none",color:"#fff",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10,fontWeight:600}}>{t.finish}</button>}
          <button onClick={onEdit} style={{background:"#333",border:"none",color:"#f5a623",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10}}>{t.editBtn}</button>
          {!priv&&<button onClick={onInv} style={{background:"#333",border:"none",color:"#eee",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10}}>{t.invoiceBtn}</button>}
          {!priv&&<button onClick={()=>{if(window.confirm(t.deleteConfirm))onDel(job.id)}} style={{background:"#333",border:"none",color:"#c0392b",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10}}>✕</button>}
        </div>
      </div>
    </div>
  </div>)
}
