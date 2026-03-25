import { useState, useEffect } from 'react'
import { adminGetUsers, adminCreateUser, adminToggleUser, adminDeleteUser, adminResetPassword, adminRenewSubscription, adminGetStats, changePassword } from './supabase.js'

const SUB_OPTIONS = [
  { value: 1, mk: '1 месец', sq: '1 muaj' },
  { value: 3, mk: '3 месеци', sq: '3 muaj' },
  { value: 6, mk: '6 месеци', sq: '6 muaj' },
  { value: 12, mk: '1 година', sq: '1 vit' },
]

const getSubStatus = (expiresStr) => {
  if (!expiresStr) return 'unknown'
  const now = new Date()
  const exp = new Date(expiresStr)
  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 7) return 'critical'  // expires within 7 days
  if (daysLeft <= 30) return 'warning'  // expires within 30 days
  return 'ok'
}

const getDaysLeft = (expiresStr) => {
  if (!expiresStr) return 0
  return Math.ceil((new Date(expiresStr) - new Date()) / (1000 * 60 * 60 * 24))
}

const formatExpiry = (expiresStr) => {
  if (!expiresStr) return '—'
  return new Date(expiresStr).toLocaleDateString('mk-MK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminPage({ user, onLogout, lang, setLang }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ users:0, activeUsers:0, totalJobs:0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | expiring | expired
  const [showCreate, setShowCreate] = useState(false)
  const [showPwChange, setShowPwChange] = useState(false)
  const [showRenew, setShowRenew] = useState(null) // userId to renew
  const [renewMonths, setRenewMonths] = useState(1)
  const [form, setForm] = useState({ username:'', password:'', shopName:'', subMonths: 1 })
  const [pwForm, setPwForm] = useState({ old:'', new1:'', new2:'' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const t = {
    mk: {
      title:'Админ Панел', logout:'Одјави се', totalUsers:'Корисници', activeUsers:'Активни',
      totalJobs:'Сервиси', expiringSoon:'Истекува скоро',
      createUser:'+ Нов корисник', username:'Корисничко име', password:'Лозинка',
      shopName:'Име на сервис', subscription:'Претплата', create:'Креирај', cancel:'Откажи',
      activate:'Активирај', deactivate:'Деактивирај', delete:'Избриши',
      deleteConfirm:'Избриши го корисникот и сите негови податоци?',
      resetPw:'Ресетирај лозинка', resetTo:'Нова лозинка', renew:'Продолжи', renewTitle:'Продолжи претплата',
      renewFor:'Продолжи за', active:'Активен', inactive:'Неактивен',
      searchPh:'Барај...', noUsers:'Нема корисници', created:'Креиран',
      userExists:'Корисничкото име веќе постои!', success:'Успешно!',
      changePw:'Промени лозинка', oldPw:'Стара лозинка', newPw:'Нова лозинка',
      confirmPw:'Потврди лозинка', pwMismatch:'Лозинките не се исти!',
      pwWrong:'Старата лозинка е погрешна!', pwChanged:'Лозинката е променета!',
      pwShort:'Мин. 4 карактери', expires:'Истекува', expired:'Истечена',
      daysLeft:'дена', filterAll:'Сите', filterExpiring:'Истекува скоро', filterExpired:'Истечени',
      renewed:'Претплатата е продолжена!',
    },
    sq: {
      title:'Paneli Admin', logout:'Dil', totalUsers:'Përdorues', activeUsers:'Aktiv',
      totalJobs:'Servise', expiringSoon:'Skadon së shpejti',
      createUser:'+ Përdorues i ri', username:'Emri', password:'Fjalëkalimi',
      shopName:'Emri i servisit', subscription:'Abonimin', create:'Krijo', cancel:'Anulo',
      activate:'Aktivizo', deactivate:'Çaktivizo', delete:'Fshi',
      deleteConfirm:'Fshi përdoruesin dhe të gjitha të dhënat?',
      resetPw:'Reseto fjalëkalimin', resetTo:'Fjalëkalim i ri', renew:'Rinovoj', renewTitle:'Rinovoj abonimin',
      renewFor:'Rinovoj për', active:'Aktiv', inactive:'Joaktiv',
      searchPh:'Kërko...', noUsers:'Nuk ka përdorues', created:'Krijuar',
      userExists:'Emri ekziston!', success:'Sukses!',
      changePw:'Ndrysho fjalëkalimin', oldPw:'Fjalëkalimi vjetër', newPw:'Fjalëkalimi ri',
      confirmPw:'Konfirmo', pwMismatch:'Nuk përputhen!',
      pwWrong:'Fjalëkalim vjetër gabim!', pwChanged:'U ndryshua!',
      pwShort:'Min. 4 karaktere', expires:'Skadon', expired:'Skaduar',
      daysLeft:'ditë', filterAll:'Të gjitha', filterExpiring:'Skadon shpejt', filterExpired:'Skaduar',
      renewed:'Abonimet u rinovua!',
    },
  }[lang] || {}

  const subLabel = (months) => SUB_OPTIONS.find(s => s.value === months)?.[lang] || `${months}m`

  const load = async () => {
    setLoading(true)
    const [u, s] = await Promise.all([adminGetUsers(), adminGetStats()])
    setUsers(u.filter(x => x.role !== 'admin'))
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setErr('')
    if (!form.username || !form.password) return
    if (form.password.length < 4) { setErr(t.pwShort); return }
    const { data, error } = await adminCreateUser(form.username, form.password, form.shopName || 'Авто Сервис', form.subMonths)
    if (error) { setErr(error.message?.includes('duplicate') ? t.userExists : error.message); return }
    setShowCreate(false); setForm({ username:'', password:'', shopName:'', subMonths: 1 }); load()
  }

  const handleRenew = async () => {
    if (!showRenew) return
    await adminRenewSubscription(showRenew, renewMonths)
    setShowRenew(null)
    setMsg(t.renewed); setTimeout(() => setMsg(''), 3000)
    load()
  }

  const handleReset = async (userId) => {
    const pw = prompt(t.resetTo + ':')
    if (!pw || pw.length < 4) return
    await adminResetPassword(userId, pw)
    setMsg(t.success); setTimeout(() => setMsg(''), 2000)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm(t.deleteConfirm)) return
    await adminDeleteUser(userId)
    load()
  }

  const handleChangePw = async () => {
    setErr('')
    if (pwForm.new1 !== pwForm.new2) { setErr(t.pwMismatch); return }
    if (pwForm.new1.length < 4) { setErr(t.pwShort); return }
    if (pwForm.old !== user.password) { setErr(t.pwWrong); return }
    await changePassword(user.id, pwForm.new1)
    setShowPwChange(false); setPwForm({ old:'', new1:'', new2:'' })
    setMsg(t.pwChanged); setTimeout(() => setMsg(''), 3000)
  }

  // Filter & search
  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !search || u.username.toLowerCase().includes(q) || u.shop_name?.toLowerCase().includes(q)
    if (!matchSearch) return false
    if (filter === 'expiring') return getSubStatus(u.subscription_expires) === 'warning' || getSubStatus(u.subscription_expires) === 'critical'
    if (filter === 'expired') return getSubStatus(u.subscription_expires) === 'expired'
    return true
  })

  const expiringCount = users.filter(u => {
    const s = getSubStatus(u.subscription_expires)
    return s === 'warning' || s === 'critical' || s === 'expired'
  }).length

  const subStatusStyle = (status) => {
    switch(status) {
      case 'expired': return { bg: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.3)' }
      case 'critical': return { bg: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.3)' }
      case 'warning': return { bg: 'rgba(230,126,34,0.15)', color: '#e67e22', border: '1px solid rgba(230,126,34,0.3)' }
      default: return { bg: 'rgba(39,174,96,0.1)', color: '#27ae60', border: '1px solid rgba(39,174,96,0.2)' }
    }
  }

  const subStatusText = (u) => {
    const status = getSubStatus(u.subscription_expires)
    const days = getDaysLeft(u.subscription_expires)
    if (status === 'expired') return `⛔ ${t.expired} (${Math.abs(days)} ${t.daysLeft})`
    if (status === 'critical') return `🔴 ${days} ${t.daysLeft}`
    if (status === 'warning') return `🟡 ${days} ${t.daysLeft}`
    return `✅ ${days} ${t.daysLeft}`
  }

  return (
    <div style={{minHeight:'100vh',background:'#111',color:'#eee',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* Header */}
      <header style={{background:'#1a1a1a',borderBottom:'2px solid #e74c3c',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:54,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>🛡️</span>
          <span style={{fontSize:15,fontWeight:800,color:'#e74c3c',letterSpacing:2,textTransform:'uppercase'}}>{t.title}</span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{display:'flex',background:'#111',borderRadius:5,overflow:'hidden',border:'1px solid #333'}}>
            {[['mk','МК'],['sq','SQ']].map(([c,l])=><button key={c} onClick={()=>setLang(c)} style={{padding:'4px 10px',border:'none',cursor:'pointer',fontSize:10,fontWeight:700,background:lang===c?'#f5a623':'transparent',color:lang===c?'#111':'#888'}}>{l}</button>)}
          </div>
          <button onClick={()=>{setShowPwChange(true);setErr('')}} style={{padding:'5px 10px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:11}}>{t.changePw}</button>
          <button onClick={onLogout} style={{padding:'5px 10px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:11}}>{t.logout}</button>
        </div>
      </header>

      {msg && <div style={{background:'rgba(39,174,96,0.15)',borderBottom:'1px solid rgba(39,174,96,0.3)',padding:'8px 16px',textAlign:'center',color:'#27ae60',fontSize:13,fontWeight:600}}>{msg}</div>}

      <main style={{maxWidth:1000,margin:'0 auto',padding:'16px 16px 60px'}}>
        {/* Stats */}
        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:24}}>
          {[
            {icon:'👤',label:t.totalUsers,value:stats.users,color:'#f5a623'},
            {icon:'✅',label:t.activeUsers,value:stats.activeUsers,color:'#27ae60'},
            {icon:'⚠️',label:t.expiringSoon,value:expiringCount,color:expiringCount>0?'#e74c3c':'#888'},
            {icon:'🔧',label:t.totalJobs,value:stats.totalJobs,color:'#3498db'},
          ].map((s,i)=>
            <div key={i} style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'16px 20px',flex:'1 1 130px',minWidth:120}}>
              <div style={{fontSize:24,marginBottom:5}}>{s.icon}</div>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.5,color:'#888',marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPh} style={{padding:'8px 14px',background:'#1a1a1a',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:13,width:200,outline:'none'}}/>
            {/* Filter tabs */}
            <div style={{display:'flex',background:'#1a1a1a',borderRadius:6,overflow:'hidden',border:'1px solid #333'}}>
              {[
                {id:'all',label:t.filterAll},
                {id:'expiring',label:t.filterExpiring},
                {id:'expired',label:t.filterExpired},
              ].map(f => (
                <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                  padding:'6px 12px',border:'none',cursor:'pointer',fontSize:11,fontWeight:600,
                  background:filter===f.id?'#f5a623':'transparent',
                  color:filter===f.id?'#111':'#888'
                }}>{f.label}</button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={load} style={{padding:'8px 14px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:12}}>↻</button>
            <button onClick={()=>{setShowCreate(true);setErr('')}} style={{padding:'8px 16px',background:'#f5a623',border:'none',borderRadius:4,color:'#111',cursor:'pointer',fontSize:12,fontWeight:700}}>{t.createUser}</button>
          </div>
        </div>

        {/* User list */}
        {loading ? <div style={{textAlign:'center',padding:50,color:'#555'}}>...</div> :
          filtered.length === 0 ? <div style={{textAlign:'center',padding:50,color:'#555',background:'#1a1a1a',borderRadius:8,border:'1px dashed #333'}}><div style={{fontSize:36,marginBottom:8}}>👤</div>{t.noUsers}</div> :
          <div style={{display:'grid',gap:8}}>{filtered.map(u => {
            const status = getSubStatus(u.subscription_expires)
            const ss = subStatusStyle(status)
            return (
              <div key={u.id} style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'14px 18px',borderLeft:u.is_active?status==='expired'?'4px solid #e74c3c':status==='critical'?'4px solid #e74c3c':status==='warning'?'4px solid #e67e22':'4px solid #27ae60':'4px solid #555',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                <div style={{flex:'1 1 200px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:15}}>🏪 {u.shop_name}</span>
                    <span style={{fontSize:9,padding:'2px 8px',borderRadius:99,fontWeight:700,textTransform:'uppercase',background:u.is_active?'rgba(39,174,96,0.15)':'rgba(100,100,100,0.15)',color:u.is_active?'#27ae60':'#888'}}>{u.is_active?t.active:t.inactive}</span>
                  </div>
                  <div style={{fontSize:12,color:'#888',marginBottom:3}}>👤 {u.username}</div>
                  {/* Subscription bar */}
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,background:ss.bg,border:ss.border,borderRadius:6,padding:'5px 12px',marginTop:2}}>
                    <span style={{fontSize:11,color:ss.color,fontWeight:600}}>{subStatusText(u)}</span>
                    <span style={{fontSize:10,color:'#888'}}>•</span>
                    <span style={{fontSize:10,color:'#999'}}>{t.expires}: {formatExpiry(u.subscription_expires)}</span>
                    <span style={{fontSize:10,color:'#888'}}>•</span>
                    <span style={{fontSize:10,color:'#999'}}>{subLabel(u.subscription_months)}</span>
                  </div>
                  <div style={{fontSize:10,color:'#666',marginTop:4}}>{t.created}: {new Date(u.created_at).toLocaleDateString('mk-MK')}</div>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  <button onClick={()=>{setShowRenew(u.id);setRenewMonths(u.subscription_months||1)}} style={{padding:'6px 12px',background:'#27ae60',border:'none',borderRadius:4,color:'#fff',cursor:'pointer',fontSize:11,fontWeight:600}}>{t.renew}</button>
                  <button onClick={()=>handleReset(u.id)} style={{padding:'6px 12px',background:'#333',border:'none',borderRadius:4,color:'#3498db',cursor:'pointer',fontSize:11}}>{t.resetPw}</button>
                  <button onClick={()=>adminToggleUser(u.id,!u.is_active).then(load)} style={{padding:'6px 12px',border:'none',borderRadius:4,cursor:'pointer',fontSize:11,fontWeight:600,background:u.is_active?'#c0392b':'#27ae60',color:'#fff'}}>{u.is_active?t.deactivate:t.activate}</button>
                  <button onClick={()=>handleDelete(u.id)} style={{padding:'6px 12px',background:'#333',border:'none',borderRadius:4,color:'#c0392b',cursor:'pointer',fontSize:11}}>{t.delete}</button>
                </div>
              </div>
            )
          })}</div>
        }
      </main>

      {/* ═══ CREATE USER MODAL ═══ */}
      {showCreate && <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}} onClick={()=>setShowCreate(false)}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#1e1e1e',border:'1px solid #333',borderRadius:10,padding:28,width:'92%',maxWidth:420}}>
          <h3 style={{color:'#f5a623',fontSize:16,marginBottom:20}}>{t.createUser}</h3>
          {err && <div style={{background:'rgba(192,57,43,0.15)',border:'1px solid rgba(192,57,43,0.3)',borderRadius:6,padding:'8px 12px',marginBottom:14,color:'#e74c3c',fontSize:12}}>{err}</div>}
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.username} *</label>
            <input value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.password} *</label>
            <input value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.shopName}</label>
            <input value={form.shopName} onChange={e=>setForm(p=>({...p,shopName:e.target.value}))} placeholder="Авто Сервис" style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#f5a623',marginBottom:5,fontWeight:700}}>{t.subscription}</label>
            <div style={{display:'flex',gap:6}}>
              {SUB_OPTIONS.map(opt => (
                <button key={opt.value} onClick={()=>setForm(p=>({...p,subMonths:opt.value}))} style={{
                  flex:1,padding:'10px 4px',border:'none',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600,
                  background:form.subMonths===opt.value?'#f5a623':'#222',
                  color:form.subMonths===opt.value?'#111':'#888',
                  transition:'all .15s'
                }}>{opt[lang] || `${opt.value}m`}</button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>setShowCreate(false)} style={{padding:'10px 20px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:13}}>{t.cancel}</button>
            <button onClick={handleCreate} style={{padding:'10px 20px',background:'#f5a623',border:'none',borderRadius:4,color:'#111',cursor:'pointer',fontSize:13,fontWeight:700}}>{t.create}</button>
          </div>
        </div>
      </div>}

      {/* ═══ RENEW SUBSCRIPTION MODAL ═══ */}
      {showRenew && <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}} onClick={()=>setShowRenew(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#1e1e1e',border:'1px solid #333',borderRadius:10,padding:28,width:'92%',maxWidth:380,textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:10}}>🔄</div>
          <h3 style={{color:'#f5a623',fontSize:16,marginBottom:20}}>{t.renewTitle}</h3>
          <div style={{display:'flex',gap:6,marginBottom:20}}>
            {SUB_OPTIONS.map(opt => (
              <button key={opt.value} onClick={()=>setRenewMonths(opt.value)} style={{
                flex:1,padding:'12px 4px',border:'none',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600,
                background:renewMonths===opt.value?'#27ae60':'#222',
                color:renewMonths===opt.value?'#fff':'#888',
              }}>{opt[lang] || `${opt.value}m`}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={()=>setShowRenew(null)} style={{padding:'10px 20px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:13}}>{t.cancel}</button>
            <button onClick={handleRenew} style={{padding:'10px 20px',background:'#27ae60',border:'none',borderRadius:4,color:'#fff',cursor:'pointer',fontSize:13,fontWeight:700}}>{t.renew}</button>
          </div>
        </div>
      </div>}

      {/* ═══ CHANGE OWN PASSWORD ═══ */}
      {showPwChange && <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)'}} onClick={()=>setShowPwChange(false)}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#1e1e1e',border:'1px solid #333',borderRadius:10,padding:28,width:'92%',maxWidth:380}}>
          <h3 style={{color:'#f5a623',fontSize:16,marginBottom:20}}>{t.changePw}</h3>
          {err && <div style={{background:'rgba(192,57,43,0.15)',border:'1px solid rgba(192,57,43,0.3)',borderRadius:6,padding:'8px 12px',marginBottom:14,color:'#e74c3c',fontSize:12}}>{err}</div>}
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.oldPw}</label><input type="password" value={pwForm.old} onChange={e=>setPwForm(p=>({...p,old:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/></div>
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.newPw}</label><input type="password" value={pwForm.new1} onChange={e=>setPwForm(p=>({...p,new1:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/></div>
          <div style={{marginBottom:20}}><label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.confirmPw}</label><input type="password" value={pwForm.new2} onChange={e=>setPwForm(p=>({...p,new2:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/></div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>{setShowPwChange(false);setErr('')}} style={{padding:'10px 20px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:13}}>{t.cancel}</button>
            <button onClick={handleChangePw} style={{padding:'10px 20px',background:'#f5a623',border:'none',borderRadius:4,color:'#111',cursor:'pointer',fontSize:13,fontWeight:700}}>OK</button>
          </div>
        </div>
      </div>}
    </div>
  )
}
