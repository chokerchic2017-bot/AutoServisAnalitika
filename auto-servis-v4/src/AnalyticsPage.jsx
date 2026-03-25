import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatPrice } from './ui.jsx'

const MONTHS_SQ = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj']
const MONTHS_MK = ['Јан','Фев','Мар','Апр','Мај','Јун','Јул','Авг','Сеп','Окт','Ное','Дек']
const COLORS = ['#f5a623','#27ae60','#3498db','#e74c3c','#9b59b6','#e67e22','#1abc9c','#34495e','#f39c12','#d35400']

export default function AnalyticsPage({ jobs, customers, parts, t, fp, lang }) {
  const [period, setPeriod] = useState(6)
  const monthNames = lang === 'mk' ? MONTHS_MK : MONTHS_SQ

  const analytics = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now.getFullYear(), now.getMonth() - period, 1)
    const recentJobs = jobs.filter(j => new Date(j.created_at) >= cutoff)
    const doneJobs = recentJobs.filter(j => j.status === 'done')

    // Monthly revenue & customer data
    const monthly = {}
    for (let i = 0; i < period; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (period - 1 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      monthly[key] = { month: monthNames[d.getMonth()], revenue: 0, customers: new Set(), jobs: 0, partsUsed: 0 }
    }

    doneJobs.forEach(j => {
      const d = new Date(j.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (monthly[key]) {
        monthly[key].revenue += (j.services || []).reduce((s,v) => s + (v.price || 0), 0)
        monthly[key].customers.add(j.customer_name)
        monthly[key].jobs++
        monthly[key].partsUsed += (j.parts_used || []).length
      }
    })

    const revenueData = Object.values(monthly).map(m => ({ name: m.month, value: m.revenue }))
    const customerData = Object.values(monthly).map(m => ({ name: m.month, value: m.customers.size }))
    const partsData = Object.values(monthly).map(m => ({ name: m.month, value: m.partsUsed }))

    // Top services
    const svcCount = {}
    doneJobs.forEach(j => (j.services || []).forEach(s => { svcCount[s.name] = (svcCount[s.name] || 0) + 1 }))
    const topServices = Object.entries(svcCount).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, value: count }))

    // Top customers
    const custSpend = {}
    doneJobs.forEach(j => {
      const total = (j.services || []).reduce((s,v) => s + (v.price || 0), 0)
      custSpend[j.customer_name] = (custSpend[j.customer_name] || 0) + total
    })
    const topCustomers = Object.entries(custSpend).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([name, spend]) => ({ name, value: spend }))

    // Totals
    const totalRev = doneJobs.reduce((s,j) => s + (j.services || []).reduce((s2,v) => s2 + (v.price || 0), 0), 0)
    const avgPerJob = doneJobs.length > 0 ? Math.round(totalRev / doneJobs.length) : 0
    const uniqueCustomers = new Set(doneJobs.map(j => j.customer_name)).size

    return { revenueData, customerData, partsData, topServices, topCustomers, totalRev, avgPerJob, uniqueCustomers, totalJobs: doneJobs.length }
  }, [jobs, period, lang])

  const chartStyle = { fontSize: 11, fill: '#888' }

  return (
    <div>
      {/* Period selector + Summary cards */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
            <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:1}}>{t.totalRevenue}</div>
            <div style={{fontSize:20,fontWeight:800,color:'#f5a623',marginTop:2}}>{fp(analytics.totalRev)}</div>
          </div>
          <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
            <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:1}}>{t.avgPerJob}</div>
            <div style={{fontSize:20,fontWeight:800,color:'#3498db',marginTop:2}}>{fp(analytics.avgPerJob)}</div>
          </div>
          <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
            <div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:1}}>{t.totalCustomers}</div>
            <div style={{fontSize:20,fontWeight:800,color:'#27ae60',marginTop:2}}>{analytics.uniqueCustomers}</div>
          </div>
        </div>
        <div style={{display:'flex',background:'#1a1a1a',borderRadius:6,overflow:'hidden',border:'1px solid #333'}}>
          {[{v:6,l:t.last6},{v:12,l:t.last12}].map(p => (
            <button key={p.v} onClick={()=>setPeriod(p.v)} style={{padding:'6px 14px',border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:period===p.v?'#f5a623':'transparent',color:period===p.v?'#111':'#888'}}>{p.l}</button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:16,marginBottom:16}}>
        <h3 style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>💰 {t.monthlyRevenue}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={analytics.revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
            <XAxis dataKey="name" tick={chartStyle}/>
            <YAxis tick={chartStyle} width={60}/>
            <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',borderRadius:6,color:'#eee',fontSize:12}} formatter={(v)=>fp(v)}/>
            <Bar dataKey="value" fill="#f5a623" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customers Chart */}
      <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:16,marginBottom:16}}>
        <h3 style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>👤 {t.monthlyCustomers}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analytics.customerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
            <XAxis dataKey="name" tick={chartStyle}/>
            <YAxis tick={chartStyle} width={30}/>
            <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',borderRadius:6,color:'#eee',fontSize:12}}/>
            <Line type="monotone" dataKey="value" stroke="#27ae60" strokeWidth={2} dot={{fill:'#27ae60',r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Top Services Pie */}
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:16}}>
          <h3 style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>🔧 {t.topServices}</h3>
          {analytics.topServices.length > 0 ? (
            <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={analytics.topServices} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {analytics.topServices.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Pie><Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',borderRadius:6,color:'#eee',fontSize:11}}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
              {analytics.topServices.map((s,i) => (
                <span key={i} style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:COLORS[i%COLORS.length]+'22',color:COLORS[i%COLORS.length]}}>{s.name} ({s.value})</span>
              ))}
            </div>
            </>
          ) : <div style={{textAlign:'center',padding:40,color:'#555',fontSize:12}}>—</div>}
        </div>

        {/* Top Customers */}
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:16}}>
          <h3 style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>🏆 {t.topCustomers}</h3>
          {analytics.topCustomers.length > 0 ? (
            <div style={{display:'grid',gap:4}}>
              {analytics.topCustomers.map((c,i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 10px',background:'#252525',borderRadius:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:12,fontWeight:800,color:COLORS[i%COLORS.length],width:20}}>{i+1}</span>
                    <span style={{fontSize:12,color:'#eee'}}>{c.name}</span>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:'#f5a623'}}>{fp(c.value)}</span>
                </div>
              ))}
            </div>
          ) : <div style={{textAlign:'center',padding:40,color:'#555',fontSize:12}}>—</div>}
        </div>
      </div>

      {/* Parts Used Chart */}
      {analytics.partsData.some(d => d.value > 0) && (
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:8,padding:16,marginTop:16}}>
          <h3 style={{fontSize:12,color:'#888',textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>🔩 {t.partsUsedAnalytics}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics.partsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
              <XAxis dataKey="name" tick={chartStyle}/>
              <YAxis tick={chartStyle} width={30}/>
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',borderRadius:6,color:'#eee',fontSize:12}}/>
              <Bar dataKey="value" fill="#3498db" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
