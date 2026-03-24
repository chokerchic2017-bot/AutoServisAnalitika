import { useState, useEffect, useRef, useCallback } from 'react'
import { getJobs, createJob, updateJob, deleteJobApi, getCustomers, createCustomer, updateUser, subscribeJobs, changePassword } from './supabase.js'

const CAR_BRANDS = ["Volkswagen","Opel","Mercedes-Benz","BMW","Audi","Renault","Peugeot","Citroën","Fiat","Škoda","Seat","Toyota","Hyundai","Kia","Ford","Nissan","Honda","Mazda","Dacia","Chevrolet","Suzuki","Mitsubishi","Volvo","Land Rover","Jeep","Alfa Romeo","Lancia","Porsche","Mini"];
const SERVICE_IDS = ["oil","brakes","tires","filter_air","filter_oil","filter_cabin","battery","spark","timing","suspension","ac","diagnostic","alignment","clutch","exhaust","custom"];

const T = {
  mk: {
    other:"Друго",dashboard:"Табла",services:"Сервиси",customers:"Клиенти",active:"Активни",completed:"Завршени",revenue:"Приход",activeServices:"Активни Сервиси",newService:"+ Нов Сервис",noActive:"Нема активни сервиси. Додади нов!",recentDone:"Последни Завршени",allServices:"Сите Сервиси",searchPlaceholder:"Барај по име, марка, таблици...",noResults:"Нема резултати",customersCount:"Клиенти",customersAuto:"Клиентите автоматски се додаваат при нов сервис",noPhone:"Нема телефон",servicesLabel:"Сервиси",totalLabel:"Вкупно",newServiceTitle:"Нов Сервис",editServiceTitle:"Измени Сервис",customerName:"Име на клиент *",customerNamePh:"Пр. Марко Петров",phone:"Телефон",phonePh:"07X XXX XXX",brand:"Марка *",model:"Модел",modelPh:"Пр. Golf 7",plates:"Таблици",platesPh:"Пр. SK-1234-AB",year:"Година",yearPh:"2018",addServices:"Додади Услуги (опционо — може и подоцна)",serviceType:"Тип",priceDen:"Цена (ден)",customServiceName:"Име на услуга",customServicePh:"Опис на услугата...",noteOptional:"Забелешка (опционо)",noteDetailsPh:"Детали за делот, итн.",total:"Вкупно:",serviceNote:"Забелешка за сервис",generalNotesPh:"Генерални забелешки...",cancel:"Откажи",saveService:"Зачувај",invoice:"Фактура",invoiceLabel:"Фактура",client:"Клиент",vehicle:"Возило",platesLabel:"Таблици",yearLabel:"Год",service:"Услуга",price:"Цена",totalUpper:"Вкупно",noteLabel:"Забелешка",thankYou:"Ви благодариме за довербата!",openAsLink:"📄 Линк",printImage:"🖨️ Печати",copyHTML:"📋 Копирај",htmlCopied:"HTML копиран!",settings:"Поставки",shopNameLabel:"Име на сервис",done:"завршен",activeStatus:"активен",finish:"✓ Заврши",invoiceBtn:"📄",editBtn:"✏️",deleteConfirm:"Избриши?",den:"ден.",noServicesYet:"Нема услуги",logout:"Одјави се",
    svc_oil:"Замена на масло",svc_brakes:"Кочници",svc_tires:"Гуми",svc_filter_air:"Филтер воздух",svc_filter_oil:"Филтер масло",svc_filter_cabin:"Филтер кабина",svc_battery:"Батерија",svc_spark:"Свеќици",svc_timing:"Ланец/Ремен",svc_suspension:"Амортизери",svc_ac:"Клима",svc_diagnostic:"Дијагностика",svc_alignment:"Нивелација",svc_clutch:"Квачило",svc_exhaust:"Ауспух",svc_custom:"Друг сервис",
    privacyOn:"Приватен режим ВКЛУЧЕН",privacyLocked:"🔒 Заклучено",pinLabel:"ПИН (4 цифри)",pinPh:"4-цифрен ПИН",pinSet:"ПИН поставен",pinNotSet:"Нема ПИН",pinRequired:"Внеси ПИН",pinWrong:"Погрешен ПИН!",pinRemove:"Отстрани",pinSection:"ПИН за приватност",changePw:"Промени лозинка",oldPw:"Стара лозинка",newPw:"Нова лозинка",confirmPw:"Потврди",pwMismatch:"Не се исти!",pwWrong:"Погрешна стара лозинка!",pwChanged:"Лозинката е променета!",pwShort:"Мин. 4 карактери",
  },
  sq: {
    other:"Tjetër",dashboard:"Paneli",services:"Serviset",customers:"Klientët",active:"Aktive",completed:"Përfunduar",revenue:"Të ardhura",activeServices:"Serviset Aktive",newService:"+ Servis i Ri",noActive:"Nuk ka servise aktive.",recentDone:"Përfunduara",allServices:"Të Gjitha",searchPlaceholder:"Kërko...",noResults:"Nuk ka rezultate",customersCount:"Klientët",customersAuto:"Klientët shtohen automatikisht",noPhone:"Pa telefon",servicesLabel:"Servise",totalLabel:"Gjithsej",newServiceTitle:"Servis i Ri",editServiceTitle:"Ndrysho Servisin",customerName:"Emri *",customerNamePh:"P.sh. Arben Krasniqi",phone:"Telefoni",phonePh:"07X XXX XXX",brand:"Marka *",model:"Modeli",modelPh:"P.sh. Golf 7",plates:"Targat",platesPh:"P.sh. SK-1234-AB",year:"Viti",yearPh:"2018",addServices:"Shto Shërbime (opsionale)",serviceType:"Lloji",priceDen:"Çmimi (den)",customServiceName:"Emri i shërbimit",customServicePh:"Përshkrim...",noteOptional:"Shënim (opsionale)",noteDetailsPh:"Detaje...",total:"Gjithsej:",serviceNote:"Shënim",generalNotesPh:"Shënime...",cancel:"Anulo",saveService:"Ruaj",invoice:"Fatura",invoiceLabel:"Fatura",client:"Klienti",vehicle:"Automjeti",platesLabel:"Targat",yearLabel:"Viti",service:"Shërbimi",price:"Çmimi",totalUpper:"Gjithsej",noteLabel:"Shënim",thankYou:"Ju faleminderit!",openAsLink:"📄 Link",printImage:"🖨️ Printo",copyHTML:"📋 Kopjo",htmlCopied:"Kopjuar!",settings:"Cilësimet",shopNameLabel:"Emri i servisit",done:"përfunduar",activeStatus:"aktiv",finish:"✓ Përfundo",invoiceBtn:"📄",editBtn:"✏️",deleteConfirm:"Fshi?",den:"den.",noServicesYet:"Pa shërbime",logout:"Dil",
    svc_oil:"Ndërrimi vajit",svc_brakes:"Frena",svc_tires:"Goma",svc_filter_air:"Filtri ajrit",svc_filter_oil:"Filtri vajit",svc_filter_cabin:"Filtri kabinës",svc_battery:"Bateria",svc_spark:"Kandela",svc_timing:"Zinxhiri",svc_suspension:"Amortizatorët",svc_ac:"Klima",svc_diagnostic:"Diagnostikimi",svc_alignment:"Balancimi",svc_clutch:"Friksioni",svc_exhaust:"Shkarkuesi",svc_custom:"Tjetër",
    privacyOn:"Modaliteti privat AKTIV",privacyLocked:"🔒 E kyçur",pinLabel:"PIN (4 shifra)",pinPh:"PIN 4-shifror",pinSet:"PIN vendosur",pinNotSet:"Nuk ka PIN",pinRequired:"Vendos PIN-in",pinWrong:"PIN i gabuar!",pinRemove:"Hiq",pinSection:"PIN privatësi",changePw:"Ndrysho fjalëkalimin",oldPw:"Fjalëkalimi vjetër",newPw:"Fjalëkalimi ri",confirmPw:"Konfirmo",pwMismatch:"Nuk përputhen!",pwWrong:"Fjalëkalim vjetër gabim!",pwChanged:"U ndryshua!",pwShort:"Min. 4 karaktere",
  }
};

const generateId = () => Date.now().toString(36)+Math.random().toString(36).substr(2,5);
const formatPrice = (p,l) => new Intl.NumberFormat("mk-MK").format(p)+" "+(T[l]?.den||"ден.");
const formatDate = (d) => new Date(d).toLocaleDateString("mk-MK",{day:"2-digit",month:"2-digit",year:"numeric"});
const getSvcName = (id,l) => T[l]?.[`svc_${id}`]||id;

const genInvoice = (job,shop,lang) => {
  const t=T[lang]||T.mk; const tot=job.services.reduce((s,v)=>s+v.price,0);
  const fp=p=>new Intl.NumberFormat("mk-MK").format(p)+" "+t.den;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t.invoiceLabel}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8f7f4;color:#1a1a1a;padding:40px}.inv{max-width:700px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;overflow:hidden}.hdr{background:#1a1a1a;color:#f5a623;padding:28px;display:flex;justify-content:space-between;align-items:center}.hdr h1{font-size:24px;letter-spacing:2px;text-transform:uppercase}.hdr .n{font-size:13px;color:#ccc;text-align:right}.meta{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px 28px;border-bottom:1px solid #e0e0e0}.meta label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:3px}.meta p{font-size:14px;font-weight:600}table{width:100%;border-collapse:collapse}thead{background:#f0efe8}th{text-align:left;padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #1a1a1a}th:last-child{text-align:right}td{padding:12px 16px;border-bottom:1px solid #eee;font-size:13px}td:last-child{text-align:right;font-weight:600}.tr{background:#1a1a1a;color:#f5a623}.tr td{font-size:16px;font-weight:700;padding:16px;border:none}.ft{padding:20px 28px;text-align:center;font-size:11px;color:#999}</style></head><body><div class="inv"><div class="hdr"><h1>⚙ ${shop}</h1><div class="n">${t.invoiceLabel}<br/>${formatDate(job.created_at)}</div></div><div class="meta"><div><label>${t.client}</label><p>${job.customer_name}</p><p style="font-weight:400;font-size:12px;color:#666">${job.customer_phone||""}</p></div><div><label>${t.vehicle}</label><p>${job.car_brand} ${job.car_model||""}</p><p style="font-weight:400;font-size:12px;color:#666">${job.plates||""} ${job.year?"• "+job.year:""}</p></div></div>${job.services.length?`<table><thead><tr><th>${t.service}</th><th>${t.price}</th></tr></thead><tbody>${job.services.map(s=>`<tr><td>${s.name}${s.note?`<br><span style="font-size:11px;color:#888">${s.note}</span>`:""}</td><td>${fp(s.price)}</td></tr>`).join("")}<tr class="tr"><td>${t.totalUpper}</td><td>${fp(tot)}</td></tr></tbody></table>`:""}<div class="ft">${t.thankYou} • ${shop}</div></div></body></html>`;
};

// ─── UI ───
function Modal({open,onClose,title,children}){if(!open)return null;return(<div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#1e1e1e",border:"1px solid #333",borderRadius:8,width:"95%",maxWidth:580,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.5)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #333"}}><h2 style={{fontSize:17,color:"#f5a623",letterSpacing:1}}>{title}</h2><button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:20,cursor:"pointer"}}>✕</button></div><div style={{padding:"18px 22px"}}>{children}</div></div></div>)}
function Inp({label,...p}){return(<div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:5}}>{label}</label>}<input {...p} style={{width:"100%",padding:"9px 12px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:13,outline:"none",...(p.style||{})}}/></div>)}
function Sel({label,options,...p}){return(<div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:5}}>{label}</label>}<select {...p} style={{width:"100%",padding:"9px 12px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:13,outline:"none",...(p.style||{})}}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>)}
function Btn({children,variant="primary",...p}){const s={primary:{background:"#f5a623",color:"#111",fontWeight:700},secondary:{background:"#333",color:"#eee"},danger:{background:"#c0392b",color:"#fff"},ghost:{background:"transparent",color:"#f5a623",border:"1px solid #f5a623"}};return<button {...p} style={{padding:"9px 18px",border:"none",borderRadius:4,fontSize:12,cursor:"pointer",letterSpacing:.5,...s[variant],...(p.style||{})}}>{children}</button>}
function Stat({icon,label,value}){return(<div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"14px 18px",flex:"1 1 130px",minWidth:120}}><div style={{fontSize:22,marginBottom:5}}>{icon}</div><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:"#888",marginBottom:3}}>{label}</div><div style={{fontSize:20,fontWeight:800,color:"#f5a623"}}>{value}</div></div>)}

function PinPrompt({open,onClose,onOk,t}){const[v,setV]=useState("");const[e,setE]=useState(false);const r=useRef();useEffect(()=>{if(open){setV("");setE(false);setTimeout(()=>r.current?.focus(),100)}},[open]);if(!open)return null;const go=()=>{onOk(v)?null:setE(true)};return(<div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#1e1e1e",border:"1px solid #333",borderRadius:12,padding:28,width:"90%",maxWidth:320,textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>🔒</div><div style={{fontSize:13,color:"#ccc",marginBottom:16}}>{t.pinRequired}</div><input ref={r} type="password" inputMode="numeric" maxLength={4} value={v} onChange={x=>{setV(x.target.value.replace(/\D/g,"").slice(0,4));setE(false)}} onKeyDown={x=>x.key==="Enter"&&go()} style={{width:"100%",padding:12,background:"#111",border:e?"2px solid #c0392b":"2px solid #333",borderRadius:8,color:"#eee",fontSize:26,textAlign:"center",letterSpacing:12,outline:"none"}}/>{e&&<div style={{color:"#c0392b",fontSize:11,marginTop:6}}>{t.pinWrong}</div>}<div style={{display:"flex",gap:10,marginTop:16,justifyContent:"center"}}><Btn variant="secondary" onClick={onClose}>{t.cancel}</Btn><Btn onClick={go}>OK</Btn></div></div></div>)}

// ─── SHOP PORTAL ───
export default function ShopPortal({ user: initialUser, onLogout, onUserUpdate, lang: initialLang, setLang: parentSetLang }) {
  const [usr, setUsr] = useState(initialUser);
  const [jobs, setJobs] = useState([]);
  const [customers, setCusts] = useState([]);
  const [lang, setLangLocal] = useState(initialLang || 'mk');
  const [privacy, setPrivacy] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [view, setView] = useState('dashboard');
  const [showJob, setShowJob] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showInv, setShowInv] = useState(null);
  const [showSet, setShowSet] = useState(false);
  const [search, setSearch] = useState('');
  const [pwForm, setPwForm] = useState({ old:'', new1:'', new2:'' });
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState('');

  const setLang = (l) => { setLangLocal(l); parentSetLang?.(l); };
  const t = T[lang] || T.mk;
  const fp = (p) => formatPrice(p, lang);
  const brands = [...CAR_BRANDS, t.other];
  const mask = (n) => { if(!privacy||!n)return n; return n.split(" ").map(p=>p[0]+"•".repeat(Math.max(p.length-1,2))).join(" "); };
  const maskP = (p) => { if(!privacy||!p)return p; return p.length<=3?"•••":p.slice(0,3)+"•".repeat(p.length-3); };

  // Load data
  const loadData = useCallback(async () => {
    if (!usr?.id) return;
    const [j, c] = await Promise.all([getJobs(usr.id), getCustomers(usr.id)]);
    setJobs(j); setCusts(c);
  }, [usr?.id]);

  useEffect(() => { loadData() }, [loadData]);
  useEffect(() => {
    if (!usr?.id) return;
    return subscribeJobs(usr.id, loadData);
  }, [usr?.id, loadData]);

  // Privacy
  const togglePrivacy = () => { if(!privacy)setPrivacy(true); else if(usr.pin)setShowPin(true); else setPrivacy(false); };
  const pinOk = (v) => { if(v===usr.pin){setPrivacy(false);setShowPin(false);return true}return false };

  // Job form
  const [jf, setJf] = useState({customer_name:"",customer_phone:"",car_brand:CAR_BRANDS[0],car_model:"",plates:"",year:"",services:[],notes:""});
  const [sf, setSf] = useState({typeId:SERVICE_IDS[0],price:"",note:"",customName:""});

  const resetForm = () => { setJf({customer_name:"",customer_phone:"",car_brand:CAR_BRANDS[0],car_model:"",plates:"",year:"",services:[],notes:""}); setSf({typeId:SERVICE_IDS[0],price:"",note:"",customName:""}); setEditId(null); };
  const openNew = () => { resetForm(); setShowJob(true); };
  const openEdit = (j) => { setJf({customer_name:j.customer_name,customer_phone:j.customer_phone||"",car_brand:j.car_brand,car_model:j.car_model||"",plates:j.plates||"",year:j.year||"",services:[...(j.services||[])],notes:j.notes||""}); setEditId(j.id); setSf({typeId:SERVICE_IDS[0],price:"",note:"",customName:""}); setShowJob(true); };
  const addSvc = () => { const s={id:generateId(),serviceId:sf.typeId,name:sf.typeId==="custom"?(sf.customName||t.svc_custom):getSvcName(sf.typeId,lang),price:Number(sf.price)||0,note:sf.note}; setJf(p=>({...p,services:[...p.services,s]})); setSf({typeId:SERVICE_IDS[0],price:"",note:"",customName:""}); };
  const rmSvc = (id) => setJf(p=>({...p,services:p.services.filter(s=>s.id!==id)}));

  const saveJob = async () => {
    if(!jf.customer_name) return;
    if(editId) {
      await updateJob(editId, { customer_name:jf.customer_name, customer_phone:jf.customer_phone, car_brand:jf.car_brand, car_model:jf.car_model, plates:jf.plates, year:jf.year, services:jf.services, notes:jf.notes });
    } else {
      await createJob({ user_id:usr.id, customer_name:jf.customer_name, customer_phone:jf.customer_phone, car_brand:jf.car_brand, car_model:jf.car_model, plates:jf.plates, year:jf.year, services:jf.services, notes:jf.notes, status:'active' });
      if(!customers.find(c=>c.name===jf.customer_name)) { await createCustomer({user_id:usr.id, name:jf.customer_name, phone:jf.customer_phone}); }
    }
    setShowJob(false); resetForm(); loadData();
  };
  const complete = async(id) => { await updateJob(id, {status:'done'}); loadData(); };
  const delJob = async(id) => { await deleteJobApi(id); loadData(); };

  // Invoice
  const openLink = (j) => { const b=new Blob([genInvoice(j,usr.shop_name,lang)],{type:"text/html"}); window.open(URL.createObjectURL(b),"_blank"); };
  const printInv = (j) => { const w=window.open("","_blank","width=800,height=1000"); w.document.write(genInvoice(j,usr.shop_name,lang)); w.document.close(); setTimeout(()=>w.print(),500); };

  // Computed
  const filtered = jobs.filter(j=>{ if(!search)return true; const s=search.toLowerCase(); return j.customer_name.toLowerCase().includes(s)||j.car_brand.toLowerCase().includes(s)||(j.plates||"").toLowerCase().includes(s); });
  const active = jobs.filter(j=>j.status==="active");
  const done = jobs.filter(j=>j.status==="done");
  const rev = done.reduce((s,j)=>s+(j.services||[]).reduce((s2,v)=>s2+v.price,0),0);

  const nav = [{id:"dashboard",icon:"📊",label:t.dashboard},{id:"jobs",icon:"🔧",label:t.services},{id:"customers",icon:"👤",label:t.customers}];

  return (
    <div style={{minHeight:"100vh",background:"#111",color:"#eee",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <header style={{background:"#1a1a1a",borderBottom:"2px solid #f5a623",padding:"0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>⚙</span><span style={{fontSize:14,fontWeight:800,color:"#f5a623",letterSpacing:2,textTransform:"uppercase"}}>{usr.shop_name}</span></div>
        <div style={{display:"flex",gap:2,alignItems:"center"}}>
          {nav.map(n=><button key={n.id} onClick={()=>setView(n.id)} style={{padding:"5px 10px",border:"none",borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:600,background:view===n.id?"#f5a623":"transparent",color:view===n.id?"#111":"#888"}}><span style={{marginRight:3}}>{n.icon}</span><span className="header-nav-label">{n.label}</span></button>)}
          <div style={{width:1,height:22,background:"#333",margin:"0 5px"}}/>
          <div style={{display:"flex",background:"#111",borderRadius:5,overflow:"hidden",border:"1px solid #333"}}>{[["mk","МК"],["sq","SQ"]].map(([c,l])=><button key={c} onClick={()=>setLang(c)} style={{padding:"4px 10px",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:lang===c?"#f5a623":"transparent",color:lang===c?"#111":"#888"}}>{l}</button>)}</div>
          <button onClick={togglePrivacy} style={{padding:"4px 9px",border:"none",borderRadius:5,cursor:"pointer",fontSize:14,marginLeft:2,background:privacy?"#c0392b":"transparent",color:privacy?"#fff":"#666"}}>{privacy?"🔒":"👁"}</button>
          {!privacy&&<button onClick={()=>setShowSet(true)} style={{padding:"5px 8px",border:"none",background:"transparent",color:"#666",cursor:"pointer",fontSize:14}}>⚙️</button>}
          <button onClick={()=>{onLogout()}} style={{padding:"5px 10px",border:"none",background:"#333",borderRadius:4,color:"#eee",cursor:"pointer",fontSize:10,marginLeft:4}}>{t.logout}</button>
        </div>
      </header>

      {privacy&&<div style={{background:"rgba(192,57,43,0.15)",borderBottom:"1px solid rgba(192,57,43,0.3)",padding:"5px 14px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span style={{fontSize:12}}>🔒</span><span style={{fontSize:10,color:"#e74c3c",fontWeight:600}}>{t.privacyOn}</span></div>}

      <main style={{maxWidth:1100,margin:"0 auto",padding:"14px 14px 70px"}}>
        {view==="dashboard"&&<div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:22}}>
            <Stat icon="🔧" label={t.active} value={active.length}/>
            <Stat icon="✅" label={t.completed} value={privacy?"•••":done.length}/>
            <Stat icon="👤" label={t.customers} value={privacy?"•••":customers.length}/>
            <Stat icon="💰" label={t.revenue} value={privacy?"• • •":fp(rev)}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:13,color:"#888",letterSpacing:1.5,textTransform:"uppercase"}}>{t.activeServices}</h2><Btn onClick={openNew} style={{padding:"7px 14px",fontSize:11}}>{t.newService}</Btn></div>
          {active.length===0?<div style={{textAlign:"center",padding:45,color:"#555",background:"#1a1a1a",borderRadius:8,border:"1px dashed #333"}}><div style={{fontSize:32,marginBottom:8}}>🚗</div><div style={{fontSize:12}}>{t.noActive}</div></div>:
            <div style={{display:"grid",gap:8}}>{active.slice(0,5).map(j=><Card key={j.id} job={j} onDone={complete} onEdit={()=>openEdit(j)} onInv={()=>setShowInv(j)} onDel={delJob} t={t} fp={fp} priv={privacy} mask={mask} maskP={maskP}/>)}</div>}
          {done.length>0&&!privacy&&<><h2 style={{fontSize:13,color:"#888",letterSpacing:1.5,textTransform:"uppercase",margin:"24px 0 10px"}}>{t.recentDone}</h2><div style={{display:"grid",gap:8}}>{done.slice(0,3).map(j=><Card key={j.id} job={j} onEdit={()=>openEdit(j)} onInv={()=>setShowInv(j)} onDel={delJob} done t={t} fp={fp} priv={privacy} mask={mask} maskP={maskP}/>)}</div></>}
        </div>}

        {view==="jobs"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <h2 style={{fontSize:13,color:"#888",letterSpacing:1.5,textTransform:"uppercase"}}>{t.allServices}</h2>
            <div style={{display:"flex",gap:8,alignItems:"center"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{padding:"7px 10px",background:"#1a1a1a",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:11,width:200,outline:"none"}}/><Btn onClick={openNew} style={{padding:"7px 14px",fontSize:11}}>{t.newService}</Btn></div>
          </div>
          {filtered.length===0?<div style={{textAlign:"center",padding:45,color:"#555"}}>{t.noResults}</div>:
            <div style={{display:"grid",gap:8}}>{filtered.map(j=><Card key={j.id} job={j} onDone={j.status==="active"?complete:null} onEdit={()=>openEdit(j)} onInv={()=>setShowInv(j)} onDel={delJob} done={j.status==="done"} t={t} fp={fp} priv={privacy} mask={mask} maskP={maskP}/>)}</div>}
        </div>}

        {view==="customers"&&<div>
          {privacy?<div style={{textAlign:"center",padding:60,color:"#c0392b",background:"#1a1a1a",borderRadius:8,border:"1px solid rgba(192,57,43,0.3)"}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><div style={{fontSize:14,fontWeight:700}}>{t.privacyLocked}</div></div>:<>
            <h2 style={{fontSize:13,color:"#888",letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>{t.customersCount} ({customers.length})</h2>
            {customers.length===0?<div style={{textAlign:"center",padding:45,color:"#555",background:"#1a1a1a",borderRadius:8,border:"1px dashed #333"}}><div style={{fontSize:32,marginBottom:8}}>👤</div><div style={{fontSize:12}}>{t.customersAuto}</div></div>:
              <div style={{display:"grid",gap:6}}>{customers.map(c=>{const cj=jobs.filter(j=>j.customer_name===c.name);const ct=cj.reduce((s,j)=>s+(j.services||[]).reduce((s2,v)=>s2+v.price,0),0);return(<div key={c.id} style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><div><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:10,color:"#888"}}>{c.phone||t.noPhone}</div></div><div style={{display:"flex",gap:14}}><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#888",textTransform:"uppercase"}}>{t.servicesLabel}</div><div style={{fontWeight:700,color:"#f5a623",fontSize:13}}>{cj.length}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#888",textTransform:"uppercase"}}>{t.totalLabel}</div><div style={{fontWeight:700,color:"#f5a623",fontSize:13}}>{fp(ct)}</div></div></div></div>)})}</div>}
          </>}
        </div>}
      </main>

      {/* Job Modal */}
      <Modal open={showJob} onClose={()=>{setShowJob(false);resetForm()}} title={editId?t.editServiceTitle:t.newServiceTitle}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <Inp label={t.customerName} value={jf.customer_name} onChange={e=>setJf(p=>({...p,customer_name:e.target.value}))} placeholder={t.customerNamePh} list="cl"/><datalist id="cl">{customers.map(c=><option key={c.id} value={c.name}/>)}</datalist>
          <Inp label={t.phone} value={jf.customer_phone} onChange={e=>setJf(p=>({...p,customer_phone:e.target.value}))} placeholder={t.phonePh}/>
          <Sel label={t.brand} value={jf.car_brand} onChange={e=>setJf(p=>({...p,car_brand:e.target.value}))} options={brands.map(b=>({value:b,label:b}))}/>
          <Inp label={t.model} value={jf.car_model} onChange={e=>setJf(p=>({...p,car_model:e.target.value}))} placeholder={t.modelPh}/>
          <Inp label={t.plates} value={jf.plates} onChange={e=>setJf(p=>({...p,plates:e.target.value}))} placeholder={t.platesPh}/>
          <Inp label={t.year} value={jf.year} onChange={e=>setJf(p=>({...p,year:e.target.value}))} placeholder={t.yearPh}/>
        </div>
        <div style={{borderTop:"1px solid #333",margin:"12px 0",paddingTop:12}}>
          <label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:8,fontWeight:700}}>{t.addServices}</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:6,alignItems:"end"}}>
            <Sel label={t.serviceType} value={sf.typeId} onChange={e=>setSf(p=>({...p,typeId:e.target.value}))} options={SERVICE_IDS.map(id=>({value:id,label:getSvcName(id,lang)}))}/>
            <Inp label={t.priceDen} type="number" value={sf.price} onChange={e=>setSf(p=>({...p,price:e.target.value}))} placeholder="0" style={{width:100}}/>
            <Btn onClick={addSvc} style={{marginBottom:14,padding:"9px 14px"}}>+</Btn>
          </div>
          {sf.typeId==="custom"&&<Inp label={t.customServiceName} value={sf.customName} onChange={e=>setSf(p=>({...p,customName:e.target.value}))} placeholder={t.customServicePh}/>}
          <Inp label={t.noteOptional} value={sf.note} onChange={e=>setSf(p=>({...p,note:e.target.value}))} placeholder={t.noteDetailsPh}/>
        </div>
        {jf.services.length>0&&<div style={{background:"#111",borderRadius:6,padding:10,marginBottom:12}}>{jf.services.map(s=><div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #222"}}><div><span style={{fontWeight:600,fontSize:12}}>{s.name}</span>{s.note&&<div style={{fontSize:9,color:"#666"}}>{s.note}</div>}</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#f5a623",fontWeight:700,fontSize:12}}>{fp(s.price)}</span><button onClick={()=>rmSvc(s.id)} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontSize:14}}>✕</button></div></div>)}<div style={{display:"flex",justifyContent:"space-between",paddingTop:8,fontWeight:800,fontSize:14}}><span>{t.total}</span><span style={{color:"#f5a623"}}>{fp(jf.services.reduce((s,v)=>s+v.price,0))}</span></div></div>}
        <div style={{marginBottom:12}}><label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:5}}>{t.serviceNote}</label><textarea value={jf.notes} onChange={e=>setJf(p=>({...p,notes:e.target.value}))} rows={2} style={{width:"100%",padding:"9px 12px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:12,outline:"none",resize:"vertical"}} placeholder={t.generalNotesPh}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn variant="secondary" onClick={()=>{setShowJob(false);resetForm()}}>{t.cancel}</Btn><Btn onClick={saveJob} style={{opacity:!jf.customer_name?.4:1}}>{t.saveService}</Btn></div>
      </Modal>

      {/* Invoice */}
      <Modal open={!!showInv} onClose={()=>setShowInv(null)} title={t.invoice}>{showInv&&<div>
        <div style={{background:"#fff",color:"#1a1a1a",borderRadius:6,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",borderBottom:"2px solid #1a1a1a",paddingBottom:12,marginBottom:12}}><div style={{fontSize:16,fontWeight:800}}>⚙ {usr.shop_name}</div><div style={{textAlign:"right",fontSize:10,color:"#666"}}><div style={{fontWeight:700,fontSize:12,color:"#1a1a1a"}}>{t.invoiceLabel}</div>{formatDate(showInv.created_at)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14,fontSize:11}}><div><div style={{fontSize:8,textTransform:"uppercase",letterSpacing:1,color:"#999"}}>{t.client}</div><div style={{fontWeight:700}}>{showInv.customer_name}</div><div style={{color:"#666"}}>{showInv.customer_phone}</div></div><div><div style={{fontSize:8,textTransform:"uppercase",letterSpacing:1,color:"#999"}}>{t.vehicle}</div><div style={{fontWeight:700}}>{showInv.car_brand} {showInv.car_model}</div><div style={{color:"#666"}}>{showInv.plates}{showInv.year&&` • ${showInv.year}`}</div></div></div>
          {showInv.services?.length>0?<><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{borderBottom:"2px solid #eee"}}><th style={{textAlign:"left",padding:"5px 0",fontSize:8,textTransform:"uppercase",color:"#999"}}>{t.service}</th><th style={{textAlign:"right",padding:"5px 0",fontSize:8,textTransform:"uppercase",color:"#999"}}>{t.price}</th></tr></thead><tbody>{showInv.services.map(s=><tr key={s.id} style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:"7px 0"}}>{s.name}{s.note&&<div style={{fontSize:9,color:"#999"}}>{s.note}</div>}</td><td style={{textAlign:"right",fontWeight:600}}>{fp(s.price)}</td></tr>)}</tbody></table><div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:"2px solid #1a1a1a",marginTop:4,fontSize:15,fontWeight:800}}><span>{t.totalUpper}</span><span style={{color:"#d4880f"}}>{fp(showInv.services.reduce((s,v)=>s+v.price,0))}</span></div></>:<div style={{padding:14,textAlign:"center",color:"#999",fontSize:11}}>{t.noServicesYet}</div>}
          <div style={{textAlign:"center",fontSize:9,color:"#bbb",marginTop:10}}>{t.thankYou}</div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}><Btn onClick={()=>openLink(showInv)} style={{fontSize:11,padding:"7px 14px"}}>{t.openAsLink}</Btn><Btn variant="ghost" onClick={()=>printInv(showInv)} style={{fontSize:11,padding:"7px 14px"}}>{t.printImage}</Btn></div>
      </div>}</Modal>

      {/* Settings */}
      <Modal open={showSet} onClose={()=>setShowSet(false)} title={t.settings}>
        <Inp label={t.shopNameLabel} value={usr.shop_name} onChange={async e=>{const n=e.target.value;setUsr(p=>({...p,shop_name:n}));await updateUser(usr.id,{shop_name:n})}}/>
        <div style={{borderTop:"1px solid #333",paddingTop:12,marginTop:6,marginBottom:12}}>
          <label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:8,fontWeight:700}}>{t.pinSection}</label>
          <div style={{display:"flex",gap:8,alignItems:"end"}}>
            <Inp label={t.pinLabel} type="password" inputMode="numeric" maxLength={4} value={usr.pin||""} onChange={async e=>{const v=e.target.value.replace(/\D/g,"").slice(0,4);setUsr(p=>({...p,pin:v}));await updateUser(usr.id,{pin:v})}} placeholder={t.pinPh} style={{flex:1}}/>
            {usr.pin&&<Btn variant="secondary" onClick={async()=>{setUsr(p=>({...p,pin:""}));await updateUser(usr.id,{pin:""})}} style={{marginBottom:14,fontSize:11}}>{t.pinRemove}</Btn>}
          </div>
          <div style={{fontSize:10,color:usr.pin?"#27ae60":"#888",marginTop:-6}}>{usr.pin?`✓ ${t.pinSet}`:t.pinNotSet}</div>
        </div>
        <div style={{borderTop:"1px solid #333",paddingTop:12}}>
          <label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:8,fontWeight:700}}>{t.changePw}</label>
          {pwErr&&<div style={{background:"rgba(192,57,43,0.15)",borderRadius:4,padding:"6px 10px",marginBottom:10,color:"#e74c3c",fontSize:11}}>{pwErr}</div>}
          {pwOk&&<div style={{background:"rgba(39,174,96,0.15)",borderRadius:4,padding:"6px 10px",marginBottom:10,color:"#27ae60",fontSize:11}}>{pwOk}</div>}
          <Inp label={t.oldPw} type="password" value={pwForm.old} onChange={e=>{setPwForm(p=>({...p,old:e.target.value}));setPwErr('')}}/>
          <Inp label={t.newPw} type="password" value={pwForm.new1} onChange={e=>{setPwForm(p=>({...p,new1:e.target.value}));setPwErr('')}}/>
          <Inp label={t.confirmPw} type="password" value={pwForm.new2} onChange={e=>{setPwForm(p=>({...p,new2:e.target.value}));setPwErr('')}}/>
          <Btn onClick={async()=>{
            setPwErr('');setPwOk('');
            if(pwForm.new1!==pwForm.new2){setPwErr(t.pwMismatch);return}
            if(pwForm.new1.length<4){setPwErr(t.pwShort);return}
            if(pwForm.old!==usr.password){setPwErr(t.pwWrong);return}
            const ok=await changePassword(usr.id,pwForm.new1);
            if(ok){setUsr(p=>({...p,password:pwForm.new1}));onUserUpdate?.({password:pwForm.new1});setPwForm({old:'',new1:'',new2:''});setPwOk(t.pwChanged);setTimeout(()=>setPwOk(''),3000)} else {setPwErr('Error')}
          }} style={{fontSize:11}}>OK</Btn>
        </div>
      </Modal>

      <PinPrompt open={showPin} onClose={()=>setShowPin(false)} onOk={pinOk} t={t}/>
    </div>
  );
}

function Card({job,onDone,onEdit,onInv,onDel,done,t,fp,priv,mask,maskP}){
  const svcs=job.services||[];const tot=svcs.reduce((s,v)=>s+v.price,0);const has=svcs.length>0;
  return(<div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"12px 14px",borderLeft:done?"4px solid #27ae60":has?"4px solid #f5a623":"4px solid #555"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
      <div style={{flex:"1 1 180px",minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span style={{fontWeight:700,fontSize:14}}>{mask(job.customer_name)}</span><span style={{fontSize:8,padding:"2px 6px",borderRadius:99,fontWeight:700,textTransform:"uppercase",background:done?"rgba(39,174,96,0.15)":"rgba(245,166,35,0.15)",color:done?"#27ae60":"#f5a623"}}>{done?t.done:t.activeStatus}</span></div>
        <div style={{fontSize:11,color:"#999",display:"flex",gap:8,flexWrap:"wrap"}}><span>🚗 {job.car_brand} {job.car_model}</span>{job.plates&&<span>📋 {maskP(job.plates)}</span>}{job.year&&<span>📅 {job.year}</span>}</div>
        <div style={{fontSize:10,color:"#666",marginTop:4,display:"flex",gap:5,flexWrap:"wrap"}}>{has?svcs.map(s=><span key={s.id} style={{background:"#252525",padding:"1px 6px",borderRadius:3}}>{s.name}</span>):<span style={{fontStyle:"italic"}}>{t.noServicesYet}</span>}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:800,color:"#f5a623"}}>{priv?"• • •":has?fp(tot):"—"}</div>
        <div style={{fontSize:9,color:"#666"}}>{formatDate(job.created_at)}</div>
        <div style={{display:"flex",gap:4,marginTop:5,justifyContent:"flex-end",flexWrap:"wrap"}}>
          {onDone&&<button onClick={()=>onDone(job.id)} style={{background:"#27ae60",border:"none",color:"#fff",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10,fontWeight:600}}>{t.finish}</button>}
          <button onClick={onEdit} style={{background:"#333",border:"none",color:"#f5a623",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10}}>{t.editBtn}</button>
          {!priv&&<button onClick={onInv} style={{background:"#333",border:"none",color:"#eee",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10}}>{t.invoiceBtn}</button>}
          {!priv&&<button onClick={()=>{if(window.confirm(t.deleteConfirm))onDel(job.id)}} style={{background:"#333",border:"none",color:"#c0392b",borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10}}>✕</button>}
        </div>
      </div>
    </div>
  </div>);
}
