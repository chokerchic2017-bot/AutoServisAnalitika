import { useState, useEffect } from 'react'
import { adminGetUsers, adminCreateUser, adminToggleUser, adminDeleteUser, adminResetPassword, adminGetStats, changePassword } from './supabase.js'

export default function AdminPage({ user, onLogout, lang, setLang }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ users:0, activeUsers:0, totalJobs:0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showPwChange, setShowPwChange] = useState(false)
  const [form, setForm] = useState({ username:'', password:'', shopName:'' })
  const [pwForm, setPwForm] = useState({ old:'', new1:'', new2:'' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const t = {
    mk: { title:'Админ Панел', logout:'Одјави се', totalUsers:'Корисници', activeUsers:'Активни', totalJobs:'Сервиси', createUser:'+ Нов корисник', username:'Корисничко име', password:'Лозинка', shopName:'Име на сервис', create:'Креирај', cancel:'Откажи', activate:'Активирај', deactivate:'Деактивирај', delete:'Избриши', deleteConfirm:'Избриши го корисникот и сите негови податоци?', resetPw:'Ресетирај лозинка', resetTo:'Нова лозинка', reset:'Ресетирај', active:'Активен', inactive:'Неактивен', searchPh:'Барај...', noUsers:'Нема корисници', created:'Креиран', jobs:'Сервиси', userExists:'Корисничкото име веќе постои!', success:'Успешно!', changePw:'Промени лозинка', oldPw:'Стара лозинка', newPw:'Нова лозинка', confirmPw:'Потврди лозинка', pwMismatch:'Лозинките не се исти!', pwWrong:'Старата лозинка е погрешна!', pwChanged:'Лозинката е променета!', pwShort:'Мин. 4 карактери' },
    sq: { title:'Paneli Admin', logout:'Dil', totalUsers:'Përdorues', activeUsers:'Aktiv', totalJobs:'Servise', createUser:'+ Përdorues i ri', username:'Emri', password:'Fjalëkalimi', shopName:'Emri i servisit', create:'Krijo', cancel:'Anulo', activate:'Aktivizo', deactivate:'Çaktivizo', delete:'Fshi', deleteConfirm:'Fshi përdoruesin dhe të gjitha të dhënat?', resetPw:'Reseto fjalëkalimin', resetTo:'Fjalëkalim i ri', reset:'Reseto', active:'Aktiv', inactive:'Joaktiv', searchPh:'Kërko...', noUsers:'Nuk ka përdorues', created:'Krijuar', jobs:'Servise', userExists:'Emri ekziston!', success:'Sukses!', changePw:'Ndrysho fjalëkalimin', oldPw:'Fjalëkalimi i vjetër', newPw:'Fjalëkalimi i ri', confirmPw:'Konfirmo', pwMismatch:'Fjalëkalimet nuk përputhen!', pwWrong:'Fjalëkalimi i vjetër gabim!', pwChanged:'Fjalëkalimi u ndryshua!', pwShort:'Min. 4 karaktere' },
  }[lang] || {}

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
    const { data, error } = await adminCreateUser(form.username, form.password, form.shopName || 'Авто Сервис')
    if (error) { setErr(error.message?.includes('duplicate') ? t.userExists : error.message); return }
    setShowCreate(false); setForm({ username:'', password:'', shopName:'' }); load()
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

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.username.toLowerCase().includes(q) || u.shop_name?.toLowerCase().includes(q)
  })

  return (
    <div style={{minHeight:'100vh',background:'#111',color:'#eee',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <header style={{background:'#1a1a1a',borderBottom:'2px solid #e74c3c',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:54,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>🛡️</span>
          <span style={{fontSize:15,fontWeight:800,color:'#e74c3c',letterSpacing:2,textTransform:'uppercase'}}>{t.title}</span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{display:'flex',background:'#111',borderRadius:5,overflow:'hidden',border:'1px solid #333'}}>
            {[['mk','МК'],['sq','SQ']].map(([c,l])=><button key={c} onClick={()=>setLang(c)} style={{padding:'4px 10px',border:'none',cursor:'pointer',fontSize:10,fontWeight:700,background:lang===c?'#f5a623':'transparent',color:lang===c?'#111':'#888'}}>{l}</button>)}
          </div>
          <button onClick={()=>setShowPwChange(true)} style={{padding:'5px 10px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:11}}>{t.changePw}</button>
          <button onClick={onLogout} style={{padding:'5px 10px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:11}}>{t.logout}</button>
        </div>
      </header>

      {msg && <div style={{background:'rgba(39,174,96,0.15)',borderBottom:'1px solid rgba(39,174,96,0.3)',padding:'8px 16px',textAlign:'center',color:'#27ae60',fontSize:13,fontWeight:600}}>{msg}</div>}

      <main style={{maxWidth:1000,margin:'0 auto',padding:'16px 16px 60px'}}>
        {/* Stats */}
        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:24}}>
          {[{icon:'👤',label:t.totalUsers,value:stats.users,color:'#f5a623'},{icon:'✅',label:t.activeUsers,value:stats.activeUsers,color:'#27ae60'},{icon:'🔧',label:t.totalJobs,value:stats.totalJobs,color:'#3498db'}].map((s,i)=>
            <div key={i} style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'16px 20px',flex:'1 1 140px',minWidth:130}}>
              <div style={{fontSize:24,marginBottom:5}}>{s.icon}</div>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.5,color:'#888',marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPh} style={{padding:'8px 14px',background:'#1a1a1a',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:13,width:240,outline:'none'}}/>
          <div style={{display:'flex',gap:8}}>
            <button onClick={load} style={{padding:'8px 14px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:12}}>↻</button>
            <button onClick={()=>{setShowCreate(true);setErr('')}} style={{padding:'8px 16px',background:'#f5a623',border:'none',borderRadius:4,color:'#111',cursor:'pointer',fontSize:12,fontWeight:700}}>{t.createUser}</button>
          </div>
        </div>

        {/* User list */}
        {loading ? <div style={{textAlign:'center',padding:50,color:'#555'}}>...</div> :
          filtered.length === 0 ? <div style={{textAlign:'center',padding:50,color:'#555',background:'#1a1a1a',borderRadius:8,border:'1px dashed #333'}}><div style={{fontSize:36,marginBottom:8}}>👤</div>{t.noUsers}</div> :
          <div style={{display:'grid',gap:8}}>{filtered.map(u => (
            <div key={u.id} style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'14px 18px',borderLeft:u.is_active?'4px solid #27ae60':'4px solid #e67e22',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <div style={{flex:'1 1 200px'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:15}}>🏪 {u.shop_name}</span>
                  <span style={{fontSize:9,padding:'2px 8px',borderRadius:99,fontWeight:700,textTransform:'uppercase',background:u.is_active?'rgba(39,174,96,0.15)':'rgba(230,126,34,0.15)',color:u.is_active?'#27ae60':'#e67e22'}}>{u.is_active?t.active:t.inactive}</span>
                </div>
                <div style={{fontSize:12,color:'#888'}}>👤 {u.username}</div>
                <div style={{fontSize:11,color:'#666'}}>{t.created}: {new Date(u.created_at).toLocaleDateString('mk-MK')}</div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <button onClick={()=>handleReset(u.id)} style={{padding:'6px 12px',background:'#333',border:'none',borderRadius:4,color:'#3498db',cursor:'pointer',fontSize:11}}>{t.resetPw}</button>
                <button onClick={()=>adminToggleUser(u.id,!u.is_active).then(load)} style={{padding:'6px 12px',border:'none',borderRadius:4,cursor:'pointer',fontSize:11,fontWeight:600,background:u.is_active?'#c0392b':'#27ae60',color:'#fff'}}>{u.is_active?t.deactivate:t.activate}</button>
                <button onClick={()=>handleDelete(u.id)} style={{padding:'6px 12px',background:'#333',border:'none',borderRadius:4,color:'#c0392b',cursor:'pointer',fontSize:11}}>{t.delete}</button>
              </div>
            </div>
          ))}</div>
        }
      </main>

      {/* Create User Modal */}
      {showCreate && <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}} onClick={()=>setShowCreate(false)}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#1e1e1e',border:'1px solid #333',borderRadius:10,padding:28,width:'92%',maxWidth:400}}>
          <h3 style={{color:'#f5a623',fontSize:16,marginBottom:20}}>{t.createUser}</h3>
          {err && <div style={{background:'rgba(192,57,43,0.15)',border:'1px solid rgba(192,57,43,0.3)',borderRadius:6,padding:'8px 12px',marginBottom:14,color:'#e74c3c',fontSize:12}}>{err}</div>}
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.username} *</label><input value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/></div>
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.password} *</label><input value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/></div>
          <div style={{marginBottom:20}}><label style={{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:5}}>{t.shopName}</label><input value={form.shopName} onChange={e=>setForm(p=>({...p,shopName:e.target.value}))} placeholder="Авто Сервис" style={{width:'100%',padding:'10px 12px',background:'#111',border:'1px solid #333',borderRadius:4,color:'#eee',fontSize:14,outline:'none'}}/></div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>setShowCreate(false)} style={{padding:'10px 20px',background:'#333',border:'none',borderRadius:4,color:'#eee',cursor:'pointer',fontSize:13}}>{t.cancel}</button>
            <button onClick={handleCreate} style={{padding:'10px 20px',background:'#f5a623',border:'none',borderRadius:4,color:'#111',cursor:'pointer',fontSize:13,fontWeight:700}}>{t.create}</button>
          </div>
        </div>
      </div>}

      {/* Change Own Password */}
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
