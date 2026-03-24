import { useState, useEffect } from 'react'
import { login as apiLogin } from './supabase.js'
import AdminPage from './AdminPage.jsx'
import ShopPortal from './ShopPortal.jsx'

const SESSION_KEY = 'autoservis-session'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('mk')

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) { try { setUser(JSON.parse(saved)) } catch {} }
    setLoading(false)
  }, [])

  const handleLogin = async (username, password) => {
    const u = await apiLogin(username, password)
    if (!u) return false
    if (!u.is_active && u.role !== 'admin') return 'inactive'
    setUser(u)
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    return true
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const updateUserState = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111',color:'#f5a623',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:48,marginBottom:16}}>⚙</div><div style={{fontSize:14,letterSpacing:3}}>...</div></div>
    </div>
  )

  if (!user) return <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} />
  if (user.role === 'admin') return <AdminPage user={user} onLogout={handleLogout} lang={lang} setLang={setLang} />
  return <ShopPortal user={user} onLogout={handleLogout} onUserUpdate={updateUserState} lang={lang} setLang={setLang} />
}

// ─── LOGIN PAGE ───
function LoginPage({ onLogin, lang, setLang }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    mk: { title:'Авто Сервис', sub:'Портал за автосервиси', username:'Корисничко име', password:'Лозинка', login:'Најави се', wrong:'Погрешно корисничко име или лозинка.', inactive:'Акаунтот е деактивиран. Контактирај го администраторот.' },
    sq: { title:'Auto Servis', sub:'Portal për auto-servise', username:'Emri i përdoruesit', password:'Fjalëkalimi', login:'Identifikohu', wrong:'Emri ose fjalëkalimi i gabuar.', inactive:'Llogaria është çaktivizuar. Kontaktoni administratorin.' },
  }[lang] || { title:'Auto Servis', sub:'Car service portal', username:'Username', password:'Password', login:'Sign in', wrong:'Wrong username or password.', inactive:'Account deactivated. Contact admin.' }

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await onLogin(username, password)
    if (res === 'inactive') setError(t.inactive)
    else if (!res) setError(t.wrong)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111',padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{fontSize:52,marginBottom:8}}>⚙</div>
          <h1 style={{fontSize:26,fontWeight:800,color:'#f5a623',letterSpacing:3,textTransform:'uppercase',margin:0}}>{t.title}</h1>
          <p style={{color:'#666',fontSize:13,marginTop:8}}>{t.sub}</p>
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:22}}>
          <div style={{display:'flex',background:'#1a1a1a',borderRadius:6,overflow:'hidden',border:'1px solid #333'}}>
            {[['mk','МК'],['sq','SQ']].map(([c,l])=><button key={c} onClick={()=>setLang(c)} style={{padding:'6px 14px',border:'none',cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,background:lang===c?'#f5a623':'transparent',color:lang===c?'#111':'#888'}}>{l}</button>)}
          </div>
        </div>

        <form onSubmit={submit} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:12,padding:28}}>
          {error && <div style={{background:'rgba(192,57,43,0.15)',border:'1px solid rgba(192,57,43,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:18,color:'#e74c3c',fontSize:13}}>{error}</div>}

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:6}}>{t.username}</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username"
              style={{width:'100%',padding:'12px 14px',background:'#111',border:'1px solid #333',borderRadius:6,color:'#eee',fontSize:14,outline:'none'}} />
          </div>

          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:1,color:'#888',marginBottom:6}}>{t.password}</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"
              style={{width:'100%',padding:'12px 14px',background:'#111',border:'1px solid #333',borderRadius:6,color:'#eee',fontSize:14,outline:'none'}} />
          </div>

          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'14px',background:'#f5a623',color:'#111',border:'none',borderRadius:6,fontSize:15,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?.6:1,letterSpacing:.5}}>
            {loading ? '...' : t.login}
          </button>
        </form>
      </div>
    </div>
  )
}
