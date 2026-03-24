import { useState, useEffect, useRef, useCallback } from "react";
import { loadData, saveData, subscribeToChanges } from "./supabase.js";

const CAR_BRANDS = [
  "Volkswagen","Opel","Mercedes-Benz","BMW","Audi","Renault","Peugeot",
  "Citroën","Fiat","Škoda","Seat","Toyota","Hyundai","Kia","Ford",
  "Nissan","Honda","Mazda","Dacia","Chevrolet","Suzuki","Mitsubishi",
  "Volvo","Land Rover","Jeep","Alfa Romeo","Lancia","Porsche","Mini"
];

// ─── i18n ───
const T = {
  mk: {
    other:"Друго", dashboard:"Табла", services:"Сервиси", customers:"Клиенти",
    active:"Активни", completed:"Завршени", revenue:"Приход",
    activeServices:"Активни Сервиси", newService:"+ Нов Сервис",
    noActive:"Нема активни сервиси. Додади нов!",
    recentDone:"Последни Завршени", allServices:"Сите Сервиси",
    searchPlaceholder:"Барај по име, марка, таблици...", noResults:"Нема резултати",
    customersCount:"Клиенти",
    customersAuto:"Клиентите автоматски се додаваат при нов сервис",
    noPhone:"Нема телефон", servicesLabel:"Сервиси", totalLabel:"Вкупно",
    newServiceTitle:"Нов Сервис", editServiceTitle:"Измени Сервис",
    customerName:"Име на клиент *", customerNamePh:"Пр. Марко Петров",
    phone:"Телефон", phonePh:"07X XXX XXX", brand:"Марка *",
    model:"Модел", modelPh:"Пр. Golf 7",
    plates:"Таблици", platesPh:"Пр. SK-1234-AB",
    year:"Година", yearPh:"2018",
    addServices:"Додади Услуги (опционо — може и подоцна)",
    serviceType:"Тип", priceDen:"Цена (ден)",
    customServiceName:"Име на услуга", customServicePh:"Опис на услугата...",
    noteOptional:"Забелешка (опционо)", noteDetailsPh:"Детали за делот, итн.",
    total:"Вкупно:", serviceNote:"Забелешка за сервис",
    generalNotesPh:"Генерални забелешки...",
    cancel:"Откажи", saveService:"Зачувај",
    invoice:"Фактура", invoiceLabel:"Фактура",
    client:"Клиент", vehicle:"Возило",
    platesLabel:"Таблици", yearLabel:"Год",
    service:"Услуга", price:"Цена", totalUpper:"Вкупно",
    noteLabel:"Забелешка", thankYou:"Ви благодариме за довербата!",
    openAsLink:"📄 Отвори како линк", printImage:"🖨️ Печати / Слика",
    copyHTML:"📋 Копирај HTML", htmlCopied:"HTML копиран!",
    settings:"Поставки", shopNameLabel:"Име на сервис",
    deleteAll:"🗑️ Избриши сè", deleteAllConfirm:"Избриши ги сите податоци?",
    done:"завршен", activeStatus:"активен", finish:"✓ Заврши",
    invoiceBtn:"📄 Фактура", editBtn:"✏️ Измени",
    deleteConfirm:"Избриши?", loading:"Се вчитува...",
    defaultShop:"Авто Сервис", den:"ден.", noServicesYet:"Нема додадено услуги",
    svc_oil:"Замена на масло", svc_brakes:"Кочници",
    svc_tires:"Гуми (монтажа/баланс)", svc_filter_air:"Филтер за воздух",
    svc_filter_oil:"Филтер за масло", svc_filter_cabin:"Филтер за кабина",
    svc_battery:"Батерија", svc_spark:"Свеќици", svc_timing:"Ланец/Ремен",
    svc_suspension:"Траповите/Амортизери", svc_ac:"Клима сервис",
    svc_diagnostic:"Дијагностика", svc_alignment:"Тркалање (нивелација)",
    svc_clutch:"Квачило", svc_exhaust:"Ауспух", svc_custom:"Друг сервис",
    privacyOn:"Приватен режим ВКЛУЧЕН — клиентски податоци се скриени",
    privacyOff:"Приватен режим исклучен",
    privacyLocked:"🔒 Заклучено во приватен режим",
    pinLabel:"ПИН за приватност (4 цифри)", pinPh:"Внеси 4-цифрен ПИН",
    pinSet:"ПИН е поставен", pinNotSet:"Нема ПИН — постави во Поставки",
    pinRequired:"Внеси ПИН за да го исклучиш приватниот режим",
    pinWrong:"Погрешен ПИН!", pinRemove:"Отстрани ПИН",
    pinSection:"ПИН за приватен режим",
    synced:"✓ Синхронизирано", syncError:"⚠ Офлајн режим",
  },
  sq: {
    other:"Tjetër", dashboard:"Paneli", services:"Serviset", customers:"Klientët",
    active:"Aktive", completed:"Përfunduar", revenue:"Të ardhura",
    activeServices:"Serviset Aktive", newService:"+ Servis i Ri",
    noActive:"Nuk ka servise aktive. Shto një të ri!",
    recentDone:"Përfunduara së Fundmi", allServices:"Të Gjitha Serviset",
    searchPlaceholder:"Kërko sipas emrit, markës, targës...", noResults:"Nuk ka rezultate",
    customersCount:"Klientët",
    customersAuto:"Klientët shtohen automatikisht kur krijohet një servis i ri",
    noPhone:"Pa telefon", servicesLabel:"Servise", totalLabel:"Gjithsej",
    newServiceTitle:"Servis i Ri", editServiceTitle:"Ndrysho Servisin",
    customerName:"Emri i klientit *", customerNamePh:"P.sh. Arben Krasniqi",
    phone:"Telefoni", phonePh:"07X XXX XXX", brand:"Marka *",
    model:"Modeli", modelPh:"P.sh. Golf 7",
    plates:"Targat", platesPh:"P.sh. SK-1234-AB",
    year:"Viti", yearPh:"2018",
    addServices:"Shto Shërbime (opsionale — mund edhe më vonë)",
    serviceType:"Lloji", priceDen:"Çmimi (den)",
    customServiceName:"Emri i shërbimit", customServicePh:"Përshkrimi i shërbimit...",
    noteOptional:"Shënim (opsionale)", noteDetailsPh:"Detaje për pjesën, etj.",
    total:"Gjithsej:", serviceNote:"Shënim për servisin",
    generalNotesPh:"Shënime të përgjithshme...",
    cancel:"Anulo", saveService:"Ruaj",
    invoice:"Fatura", invoiceLabel:"Fatura",
    client:"Klienti", vehicle:"Automjeti",
    platesLabel:"Targat", yearLabel:"Viti",
    service:"Shërbimi", price:"Çmimi", totalUpper:"Gjithsej",
    noteLabel:"Shënim", thankYou:"Ju faleminderit për besimin!",
    openAsLink:"📄 Hap si link", printImage:"🖨️ Printo / Foto",
    copyHTML:"📋 Kopjo HTML", htmlCopied:"HTML u kopjua!",
    settings:"Cilësimet", shopNameLabel:"Emri i servisit",
    deleteAll:"🗑️ Fshi të gjitha", deleteAllConfirm:"Fshi të gjitha të dhënat?",
    done:"përfunduar", activeStatus:"aktiv", finish:"✓ Përfundo",
    invoiceBtn:"📄 Fatura", editBtn:"✏️ Ndrysho",
    deleteConfirm:"Fshi?", loading:"Duke u ngarkuar...",
    defaultShop:"Auto Servis", den:"den.", noServicesYet:"Nuk ka shërbime të shtuara",
    svc_oil:"Ndërrimi i vajit", svc_brakes:"Frena",
    svc_tires:"Goma (montim/balancim)", svc_filter_air:"Filtri i ajrit",
    svc_filter_oil:"Filtri i vajit", svc_filter_cabin:"Filtri i kabinës",
    svc_battery:"Bateria", svc_spark:"Kandela", svc_timing:"Zinxhiri/Rripi",
    svc_suspension:"Amortizatorët", svc_ac:"Servisi i klimës",
    svc_diagnostic:"Diagnostikimi", svc_alignment:"Balancimi (nivelimi)",
    svc_clutch:"Friksioni", svc_exhaust:"Shkarkuesi", svc_custom:"Shërbim tjetër",
    privacyOn:"Modaliteti privat AKTIV — të dhënat e klientëve janë të fshehura",
    privacyOff:"Modaliteti privat joaktiv",
    privacyLocked:"🔒 E kyçur në modalitetin privat",
    pinLabel:"PIN për privatësi (4 shifra)", pinPh:"Vendos PIN 4-shifror",
    pinSet:"PIN është vendosur", pinNotSet:"Nuk ka PIN — vendos në Cilësimet",
    pinRequired:"Vendos PIN-in për të çaktivizuar modalitetin privat",
    pinWrong:"PIN i gabuar!", pinRemove:"Hiq PIN-in",
    pinSection:"PIN për modalitetin privat",
    synced:"✓ Sinkronizuar", syncError:"⚠ Modaliteti offline",
  }
};

const SERVICE_IDS = [
  "oil","brakes","tires","filter_air","filter_oil","filter_cabin",
  "battery","spark","timing","suspension","ac","diagnostic",
  "alignment","clutch","exhaust","custom"
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const formatPrice = (price, lang) => new Intl.NumberFormat("mk-MK").format(price) + " " + (T[lang]?.den || "ден.");
const formatDate = (d) => new Date(d).toLocaleDateString("mk-MK", { day:"2-digit", month:"2-digit", year:"numeric" });
const getServiceName = (id, lang) => T[lang]?.[`svc_${id}`] || id;

// ─── INVOICE HTML ───
const generateInvoiceHTML = (job, shopName, lang) => {
  const t = T[lang] || T.mk;
  const total = job.services.reduce((s, sv) => s + sv.price, 0);
  const fmtP = (p) => new Intl.NumberFormat("mk-MK").format(p) + " " + t.den;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t.invoiceLabel} - ${job.customerName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8f7f4;color:#1a1a1a;padding:40px}.inv{max-width:700px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;border-radius:2px;overflow:hidden}.hdr{background:#1a1a1a;color:#f5a623;padding:32px;display:flex;justify-content:space-between;align-items:center}.hdr h1{font-size:28px;letter-spacing:2px;text-transform:uppercase}.hdr .num{font-size:14px;color:#ccc;text-align:right}.meta{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px 32px;border-bottom:1px solid #e0e0e0}.meta-box label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px}.meta-box p{font-size:15px;font-weight:600}table{width:100%;border-collapse:collapse}thead{background:#f0efe8}th{text-align:left;padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #1a1a1a}th:last-child{text-align:right}td{padding:14px 16px;border-bottom:1px solid #eee;font-size:14px}td:last-child{text-align:right;font-weight:600}.total-row{background:#1a1a1a;color:#f5a623}.total-row td{font-size:18px;font-weight:700;padding:18px 16px;border:none}.foot{padding:24px 32px;text-align:center;font-size:12px;color:#999}@media print{body{padding:10px}}</style></head><body>
<div class="inv">
<div class="hdr"><h1>⚙ ${shopName||t.defaultShop}</h1><div class="num">${t.invoiceLabel} #${job.id.slice(-6).toUpperCase()}<br/>${formatDate(job.date)}</div></div>
<div class="meta">
<div class="meta-box"><label>${t.client}</label><p>${job.customerName}</p><p style="font-weight:400;font-size:13px;color:#666">${job.customerPhone||""}</p></div>
<div class="meta-box"><label>${t.vehicle}</label><p>${job.carBrand} ${job.carModel||""}</p><p style="font-weight:400;font-size:13px;color:#666">${job.plates?t.platesLabel+": "+job.plates:""} ${job.year?"• "+t.yearLabel+": "+job.year:""}</p></div>
</div>
${job.services.length>0?`<table><thead><tr><th>${t.service}</th><th>${t.price}</th></tr></thead><tbody>
${job.services.map(s=>`<tr><td>${s.name}${s.note?`<br/><span style="font-size:12px;color:#888">${s.note}</span>`:""}</td><td>${fmtP(s.price)}</td></tr>`).join("")}
<tr class="total-row"><td>${t.totalUpper}</td><td>${fmtP(total)}</td></tr>
</tbody></table>`:""}
${job.notes?`<div style="padding:16px 32px;font-size:13px;color:#666;border-top:1px solid #eee"><strong>${t.noteLabel}:</strong> ${job.notes}</div>`:""}
<div class="foot">${t.thankYou} • ${shopName||t.defaultShop}</div>
</div></body></html>`;
};

// ─── UI COMPONENTS ───
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1e1e1e",border:"1px solid #333",borderRadius:8,width:"95%",maxWidth:600,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid #333"}}>
          <h2 style={{fontSize:18,color:"#f5a623",letterSpacing:1}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer",padding:4}}>✕</button>
        </div>
        <div style={{padding:"20px 24px"}}>{children}</div>
      </div>
    </div>
  );
}
function Input({ label, ...props }) {
  return (<div style={{marginBottom:16}}>
    {label&&<label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:6}}>{label}</label>}
    <input {...props} style={{width:"100%",padding:"10px 14px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:14,outline:"none",...(props.style||{})}}/>
  </div>);
}
function Select({ label, options, ...props }) {
  return (<div style={{marginBottom:16}}>
    {label&&<label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:6}}>{label}</label>}
    <select {...props} style={{width:"100%",padding:"10px 14px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:14,outline:"none",...(props.style||{})}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>);
}
function Btn({ children, variant="primary", ...props }) {
  const s = { primary:{background:"#f5a623",color:"#111",fontWeight:700}, secondary:{background:"#333",color:"#eee"}, danger:{background:"#c0392b",color:"#fff"}, ghost:{background:"transparent",color:"#f5a623",border:"1px solid #f5a623"} };
  return <button {...props} style={{padding:"10px 20px",border:"none",borderRadius:4,fontSize:13,cursor:"pointer",letterSpacing:.5,transition:"opacity .2s",...s[variant],...(props.style||{})}} onMouseEnter={e=>e.target.style.opacity=0.85} onMouseLeave={e=>e.target.style.opacity=1}>{children}</button>;
}
function StatCard({ icon, label, value }) {
  return (<div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"16px 20px",flex:"1 1 140px",minWidth:130}}>
    <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:"#888",marginBottom:4}}>{label}</div>
    <div style={{fontSize:22,fontWeight:800,color:"#f5a623"}}>{value}</div>
  </div>);
}
function LangToggle({ lang, setLang }) {
  return (<div style={{display:"flex",background:"#111",borderRadius:6,overflow:"hidden",border:"1px solid #333"}}>
    {[["mk","МК"],["sq","SQ"]].map(([c,l])=>(<button key={c} onClick={()=>setLang(c)} style={{padding:"6px 12px",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:1,background:lang===c?"#f5a623":"transparent",color:lang===c?"#111":"#888",transition:"all .2s"}}>{l}</button>))}
  </div>);
}
function PinPrompt({ open, onClose, onSuccess, t }) {
  const [val,setVal]=useState("");const[err,setErr]=useState(false);const ref=useRef(null);
  useEffect(()=>{if(open){setVal("");setErr(false);setTimeout(()=>ref.current?.focus(),100)}},[open]);
  const submit=()=>{onSuccess(val)?null:setErr(true)};
  if(!open)return null;
  return (<div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#1e1e1e",border:"1px solid #333",borderRadius:12,padding:32,width:"90%",maxWidth:340,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>🔒</div>
      <div style={{fontSize:14,color:"#ccc",marginBottom:20}}>{t.pinRequired}</div>
      <input ref={ref} type="password" inputMode="numeric" maxLength={4} value={val}
        onChange={e=>{setVal(e.target.value.replace(/\D/g,"").slice(0,4));setErr(false);}}
        onKeyDown={e=>e.key==="Enter"&&submit()}
        style={{width:"100%",padding:14,background:"#111",border:err?"2px solid #c0392b":"2px solid #333",borderRadius:8,color:"#eee",fontSize:28,textAlign:"center",letterSpacing:12,outline:"none"}}/>
      {err&&<div style={{color:"#c0392b",fontSize:12,marginTop:8,fontWeight:600}}>{t.pinWrong}</div>}
      <div style={{display:"flex",gap:12,marginTop:20,justifyContent:"center"}}>
        <Btn variant="secondary" onClick={onClose}>{t.cancel}</Btn>
        <Btn onClick={submit}>OK</Btn>
      </div>
    </div>
  </div>);
}

// ─── MAIN APP ───
export default function App() {
  const DEFAULT_DATA = { shopName:"Авто Сервис", pin:"", jobs:[], customers:[] };
  const [data,setData] = useState(DEFAULT_DATA);
  const [lang,setLang] = useState("mk");
  const [privacy,setPrivacy] = useState(false);
  const [showPinPrompt,setShowPinPrompt] = useState(false);
  const [view,setView] = useState("dashboard");
  const [showJobModal,setShowJobModal] = useState(false);
  const [editingJobId,setEditingJobId] = useState(null);
  const [showInvoice,setShowInvoice] = useState(null);
  const [showSettings,setShowSettings] = useState(false);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [online,setOnline] = useState(true);
  const savingRef = useRef(false);

  const t = T[lang];
  const fp = (p) => formatPrice(p, lang);
  const carBrandsWithOther = [...CAR_BRANDS, t.other];

  // ─── PRIVACY ───
  const maskName = (n) => { if(!privacy||!n)return n; return n.split(" ").map(p=>p.charAt(0)+"•".repeat(Math.max(p.length-1,2))).join(" "); };
  const maskPlates = (p) => { if(!privacy||!p)return p; return p.length<=3?"•••":p.slice(0,3)+"•".repeat(p.length-3); };
  const togglePrivacy = () => {
    if(!privacy){setPrivacy(true)} else {
      if(data.pin){setShowPinPrompt(true)} else {setPrivacy(false)}
    }
  };
  const handlePinSubmit = (entered) => { if(entered===data.pin){setPrivacy(false);setShowPinPrompt(false);return true}return false };

  // ─── PERSISTENCE + REALTIME SYNC ───
  useEffect(() => {
    (async () => {
      const loaded = await loadData();
      if (loaded) {
        setData(loaded);
        if (loaded.lang) setLang(loaded.lang);
      }
      setLoading(false);
    })();

    // Subscribe to realtime changes from other devices
    const unsub = subscribeToChanges((newData) => {
      if (!savingRef.current) {
        setData(newData);
        if (newData.lang) setLang(newData.lang);
      }
    });

    return () => unsub();
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    savingRef.current = true;
    const ok = await saveData({...newData, lang});
    setOnline(ok);
    savingRef.current = false;
  }, [lang]);

  const changeLang = useCallback(async (newLang) => {
    setLang(newLang);
    savingRef.current = true;
    await saveData({...data, lang: newLang});
    savingRef.current = false;
  }, [data]);

  // ─── JOB FORM ───
  const [jf,setJf] = useState({customerName:"",customerPhone:"",carBrand:CAR_BRANDS[0],carModel:"",plates:"",year:"",services:[],notes:"",status:"active"});
  const [svcForm,setSvcForm] = useState({typeId:SERVICE_IDS[0],price:"",note:"",customName:""});

  const resetJobForm = () => {
    setJf({customerName:"",customerPhone:"",carBrand:CAR_BRANDS[0],carModel:"",plates:"",year:"",services:[],notes:"",status:"active"});
    setSvcForm({typeId:SERVICE_IDS[0],price:"",note:"",customName:""});
    setEditingJobId(null);
  };
  const openNewJob = () => { resetJobForm(); setShowJobModal(true); };
  const openEditJob = (job) => {
    setJf({customerName:job.customerName,customerPhone:job.customerPhone||"",carBrand:job.carBrand,carModel:job.carModel||"",plates:job.plates||"",year:job.year||"",services:[...job.services],notes:job.notes||"",status:job.status});
    setEditingJobId(job.id);
    setSvcForm({typeId:SERVICE_IDS[0],price:"",note:"",customName:""});
    setShowJobModal(true);
  };
  const addService = () => {
    const svc = {id:generateId(),serviceId:svcForm.typeId,name:svcForm.typeId==="custom"?(svcForm.customName||t.svc_custom):getServiceName(svcForm.typeId,lang),price:Number(svcForm.price)||0,qty:1,note:svcForm.note};
    setJf(p=>({...p,services:[...p.services,svc]}));
    setSvcForm({typeId:SERVICE_IDS[0],price:"",note:"",customName:""});
  };
  const removeService = (id) => setJf(p=>({...p,services:p.services.filter(s=>s.id!==id)}));
  const saveJob = () => {
    if(!jf.customerName)return;
    if(editingJobId) {
      const updated = data.jobs.map(j=>j.id===editingJobId?{...j,customerName:jf.customerName,customerPhone:jf.customerPhone,carBrand:jf.carBrand,carModel:jf.carModel,plates:jf.plates,year:jf.year,services:jf.services,notes:jf.notes}:j);
      save({...data,jobs:updated});
    } else {
      const job = {...jf,id:generateId(),date:new Date().toISOString()};
      const nd = {...data,jobs:[job,...data.jobs]};
      if(!data.customers.find(c=>c.name===jf.customerName)){nd.customers=[...data.customers,{id:generateId(),name:jf.customerName,phone:jf.customerPhone}]}
      save(nd);
    }
    setShowJobModal(false);resetJobForm();
  };
  const completeJob = (id) => save({...data,jobs:data.jobs.map(j=>j.id===id?{...j,status:"done"}:j)});
  const deleteJob = (id) => save({...data,jobs:data.jobs.filter(j=>j.id!==id)});

  // ─── INVOICE ───
  const openInvoiceLink = (job) => { const b=new Blob([generateInvoiceHTML(job,data.shopName,lang)],{type:"text/html"}); window.open(URL.createObjectURL(b),"_blank"); };
  const printInvoice = (job) => { const w=window.open("","_blank","width=800,height=1000"); w.document.write(generateInvoiceHTML(job,data.shopName,lang)); w.document.close(); w.focus(); setTimeout(()=>w.print(),500); };

  // ─── COMPUTED ───
  const filtered = data.jobs.filter(j=>{if(!search)return true;const s=search.toLowerCase();return j.customerName.toLowerCase().includes(s)||j.carBrand.toLowerCase().includes(s)||(j.plates||"").toLowerCase().includes(s)||(j.carModel||"").toLowerCase().includes(s)});
  const activeJobs = data.jobs.filter(j=>j.status==="active");
  const doneJobs = data.jobs.filter(j=>j.status==="done");
  const totalRevenue = doneJobs.reduce((s,j)=>s+j.services.reduce((s2,sv)=>s2+sv.price,0),0);

  if(loading)return(<div style={{minHeight:"100vh",minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#111",color:"#f5a623"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>⚙</div><div style={{fontSize:14,letterSpacing:3,textTransform:"uppercase"}}>{t.loading}</div></div></div>);

  const navItems=[{id:"dashboard",icon:"📊",label:t.dashboard},{id:"jobs",icon:"🔧",label:t.services},{id:"customers",icon:"👤",label:t.customers}];
  const jcp = {t,fp,privacy,maskName,maskPlates};

  return (
    <div style={{minHeight:"100vh",minHeight:"100dvh",background:"#111",color:"#eee",fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif"}}>

      {/* ═══ HEADER ═══ */}
      <header style={{background:"#1a1a1a",borderBottom:"2px solid #f5a623",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:24}}>⚙</span>
          <span style={{fontSize:15,fontWeight:800,color:"#f5a623",letterSpacing:2,textTransform:"uppercase"}}>{data.shopName}</span>
          {!online&&<span style={{fontSize:9,background:"#c0392b",color:"#fff",padding:"2px 6px",borderRadius:4,marginLeft:4}}>OFFLINE</span>}
        </div>
        <div style={{display:"flex",gap:2,alignItems:"center"}}>
          {navItems.map(n=>(<button key={n.id} onClick={()=>setView(n.id)} style={{padding:"6px 10px",border:"none",borderRadius:4,cursor:"pointer",fontSize:12,fontWeight:600,background:view===n.id?"#f5a623":"transparent",color:view===n.id?"#111":"#888",transition:"all .2s"}}><span style={{marginRight:4}}>{n.icon}</span><span className="header-nav-label">{n.label}</span></button>))}
          <div style={{width:1,height:24,background:"#333",margin:"0 6px"}}/>
          <LangToggle lang={lang} setLang={changeLang}/>
          <button onClick={togglePrivacy} title={privacy?t.privacyOn:t.privacyOff} style={{padding:"5px 10px",border:"none",borderRadius:6,cursor:"pointer",fontSize:15,marginLeft:2,background:privacy?"#c0392b":"transparent",color:privacy?"#fff":"#666",transition:"all .25s",boxShadow:privacy?"0 0 12px rgba(192,57,43,0.4)":"none"}}>{privacy?"🔒":"👁"}</button>
          {!privacy&&<button onClick={()=>setShowSettings(true)} style={{padding:"6px 10px",border:"none",background:"transparent",color:"#666",cursor:"pointer",fontSize:16,marginLeft:2}}>⚙️</button>}
        </div>
      </header>

      {privacy&&<div style={{background:"rgba(192,57,43,0.15)",borderBottom:"1px solid rgba(192,57,43,0.3)",padding:"6px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{fontSize:13}}>🔒</span><span style={{fontSize:11,color:"#e74c3c",fontWeight:600,letterSpacing:.5}}>{t.privacyOn}</span></div>}

      <main style={{maxWidth:1100,margin:"0 auto",padding:"16px 16px 80px"}}>

        {/* ═══ DASHBOARD ═══ */}
        {view==="dashboard"&&(<div>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:24}}>
            <StatCard icon="🔧" label={t.active} value={activeJobs.length}/>
            <StatCard icon="✅" label={t.completed} value={privacy?"•••":doneJobs.length}/>
            <StatCard icon="👤" label={t.customers} value={privacy?"•••":data.customers.length}/>
            <StatCard icon="💰" label={t.revenue} value={privacy?"• • • •":fp(totalRevenue)}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:14,color:"#888",letterSpacing:1.5,textTransform:"uppercase"}}>{t.activeServices}</h2>
            <Btn onClick={openNewJob} style={{padding:"8px 16px",fontSize:12}}>{t.newService}</Btn>
          </div>
          {activeJobs.length===0?(<div style={{textAlign:"center",padding:50,color:"#555",background:"#1a1a1a",borderRadius:8,border:"1px dashed #333"}}><div style={{fontSize:36,marginBottom:10}}>🚗</div><div style={{fontSize:13}}>{t.noActive}</div></div>):(
            <div style={{display:"grid",gap:10}}>{activeJobs.slice(0,5).map(j=><JobCard key={j.id} job={j} onComplete={completeJob} onEdit={()=>openEditJob(j)} onInvoice={()=>setShowInvoice(j)} onDelete={deleteJob} {...jcp}/>)}</div>
          )}
          {doneJobs.length>0&&!privacy&&(<>
            <h2 style={{fontSize:14,color:"#888",letterSpacing:1.5,textTransform:"uppercase",margin:"28px 0 12px"}}>{t.recentDone}</h2>
            <div style={{display:"grid",gap:10}}>{doneJobs.slice(0,3).map(j=><JobCard key={j.id} job={j} onEdit={()=>openEditJob(j)} onInvoice={()=>setShowInvoice(j)} onDelete={deleteJob} done {...jcp}/>)}</div>
          </>)}
        </div>)}

        {/* ═══ JOBS ═══ */}
        {view==="jobs"&&(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <h2 style={{fontSize:14,color:"#888",letterSpacing:1.5,textTransform:"uppercase"}}>{t.allServices}</h2>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{padding:"8px 12px",background:"#1a1a1a",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:12,width:220,outline:"none"}}/>
              <Btn onClick={openNewJob} style={{padding:"8px 16px",fontSize:12}}>{t.newService}</Btn>
            </div>
          </div>
          {filtered.length===0?<div style={{textAlign:"center",padding:50,color:"#555"}}>{t.noResults}</div>:
            <div style={{display:"grid",gap:10}}>{filtered.map(j=><JobCard key={j.id} job={j} onComplete={j.status==="active"?completeJob:null} onEdit={()=>openEditJob(j)} onInvoice={()=>setShowInvoice(j)} onDelete={deleteJob} done={j.status==="done"} {...jcp}/>)}</div>
          }
        </div>)}

        {/* ═══ CUSTOMERS ═══ */}
        {view==="customers"&&(<div>
          {privacy?(<div style={{textAlign:"center",padding:70,color:"#c0392b",background:"#1a1a1a",borderRadius:8,border:"1px solid rgba(192,57,43,0.3)"}}><div style={{fontSize:44,marginBottom:14}}>🔒</div><div style={{fontSize:15,fontWeight:700,marginBottom:8}}>{t.privacyLocked}</div><div style={{fontSize:12,color:"#888"}}>{t.privacyOn}</div></div>):(<>
            <h2 style={{fontSize:14,color:"#888",letterSpacing:1.5,textTransform:"uppercase",marginBottom:16}}>{t.customersCount} ({data.customers.length})</h2>
            {data.customers.length===0?(<div style={{textAlign:"center",padding:50,color:"#555",background:"#1a1a1a",borderRadius:8,border:"1px dashed #333"}}><div style={{fontSize:36,marginBottom:10}}>👤</div><div style={{fontSize:13}}>{t.customersAuto}</div></div>):(
              <div style={{display:"grid",gap:8}}>{data.customers.map(c=>{
                const cJ=data.jobs.filter(j=>j.customerName===c.name);const cT=cJ.reduce((s,j)=>s+j.services.reduce((s2,sv)=>s2+sv.price,0),0);
                return(<div key={c.id} style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                  <div><div style={{fontWeight:700,fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{c.phone||t.noPhone}</div></div>
                  <div style={{display:"flex",gap:16,alignItems:"center"}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>{t.servicesLabel}</div><div style={{fontWeight:700,color:"#f5a623"}}>{cJ.length}</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>{t.totalLabel}</div><div style={{fontWeight:700,color:"#f5a623"}}>{fp(cT)}</div></div>
                  </div>
                </div>)
              })}</div>
            )}
          </>)}
        </div>)}
      </main>

      {/* ═══ JOB MODAL ═══ */}
      <Modal open={showJobModal} onClose={()=>{setShowJobModal(false);resetJobForm()}} title={editingJobId?t.editServiceTitle:t.newServiceTitle}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
          <Input label={t.customerName} value={jf.customerName} onChange={e=>setJf(p=>({...p,customerName:e.target.value}))} placeholder={t.customerNamePh} list="cl"/>
          <datalist id="cl">{data.customers.map(c=><option key={c.id} value={c.name}/>)}</datalist>
          <Input label={t.phone} value={jf.customerPhone} onChange={e=>setJf(p=>({...p,customerPhone:e.target.value}))} placeholder={t.phonePh}/>
          <Select label={t.brand} value={jf.carBrand} onChange={e=>setJf(p=>({...p,carBrand:e.target.value}))} options={carBrandsWithOther.map(b=>({value:b,label:b}))}/>
          <Input label={t.model} value={jf.carModel} onChange={e=>setJf(p=>({...p,carModel:e.target.value}))} placeholder={t.modelPh}/>
          <Input label={t.plates} value={jf.plates} onChange={e=>setJf(p=>({...p,plates:e.target.value}))} placeholder={t.platesPh}/>
          <Input label={t.year} value={jf.year} onChange={e=>setJf(p=>({...p,year:e.target.value}))} placeholder={t.yearPh}/>
        </div>
        <div style={{borderTop:"1px solid #333",margin:"14px 0",paddingTop:14}}>
          <label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:10,fontWeight:700}}>{t.addServices}</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"end"}}>
            <Select label={t.serviceType} value={svcForm.typeId} onChange={e=>setSvcForm(p=>({...p,typeId:e.target.value}))} options={SERVICE_IDS.map(id=>({value:id,label:getServiceName(id,lang)}))}/>
            <Input label={t.priceDen} type="number" value={svcForm.price} onChange={e=>setSvcForm(p=>({...p,price:e.target.value}))} placeholder="0" style={{width:110}}/>
            <Btn onClick={addService} style={{marginBottom:16,padding:"10px 16px"}}>+</Btn>
          </div>
          {svcForm.typeId==="custom"&&<Input label={t.customServiceName} value={svcForm.customName} onChange={e=>setSvcForm(p=>({...p,customName:e.target.value}))} placeholder={t.customServicePh}/>}
          <Input label={t.noteOptional} value={svcForm.note} onChange={e=>setSvcForm(p=>({...p,note:e.target.value}))} placeholder={t.noteDetailsPh}/>
        </div>
        {jf.services.length>0&&<div style={{background:"#111",borderRadius:6,padding:12,marginBottom:14}}>
          {jf.services.map(s=>(<div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #222"}}>
            <div><span style={{fontWeight:600,fontSize:13}}>{s.name}</span>{s.note&&<div style={{fontSize:10,color:"#666"}}>{s.note}</div>}</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#f5a623",fontWeight:700,fontSize:13}}>{fp(s.price)}</span><button onClick={()=>removeService(s.id)} style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer",fontSize:15}}>✕</button></div>
          </div>))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:15}}><span>{t.total}</span><span style={{color:"#f5a623"}}>{fp(jf.services.reduce((s,sv)=>s+sv.price,0))}</span></div>
        </div>}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:6}}>{t.serviceNote}</label>
          <textarea value={jf.notes} onChange={e=>setJf(p=>({...p,notes:e.target.value}))} rows={2} style={{width:"100%",padding:"10px 14px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:13,outline:"none",resize:"vertical"}} placeholder={t.generalNotesPh}/>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="secondary" onClick={()=>{setShowJobModal(false);resetJobForm()}}>{t.cancel}</Btn>
          <Btn onClick={saveJob} style={{opacity:!jf.customerName?.4:1}}>{t.saveService}</Btn>
        </div>
      </Modal>

      {/* ═══ INVOICE ═══ */}
      <Modal open={!!showInvoice} onClose={()=>setShowInvoice(null)} title={t.invoice}>
        {showInvoice&&(<div>
          <div style={{background:"#fff",color:"#1a1a1a",borderRadius:6,padding:20,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"2px solid #1a1a1a",paddingBottom:14,marginBottom:14}}>
              <div style={{fontSize:18,fontWeight:800,letterSpacing:1}}>⚙ {data.shopName}</div>
              <div style={{textAlign:"right",fontSize:11,color:"#666"}}><div style={{fontWeight:700,fontSize:13,color:"#1a1a1a"}}>{t.invoiceLabel}</div>#{showInvoice.id.slice(-6).toUpperCase()}<br/>{formatDate(showInvoice.date)}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16,fontSize:12}}>
              <div><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1,color:"#999",marginBottom:2}}>{t.client}</div><div style={{fontWeight:700}}>{showInvoice.customerName}</div><div style={{color:"#666"}}>{showInvoice.customerPhone}</div></div>
              <div><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1,color:"#999",marginBottom:2}}>{t.vehicle}</div><div style={{fontWeight:700}}>{showInvoice.carBrand} {showInvoice.carModel}</div><div style={{color:"#666"}}>{showInvoice.plates} {showInvoice.year&&`• ${showInvoice.year}`}</div></div>
            </div>
            {showInvoice.services.length>0?(<>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"2px solid #eee"}}><th style={{textAlign:"left",padding:"6px 0",fontSize:9,textTransform:"uppercase",letterSpacing:1,color:"#999"}}>{t.service}</th><th style={{textAlign:"right",padding:"6px 0",fontSize:9,textTransform:"uppercase",letterSpacing:1,color:"#999"}}>{t.price}</th></tr></thead><tbody>
                {showInvoice.services.map(s=>(<tr key={s.id} style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:"8px 0"}}>{s.name}{s.note&&<div style={{fontSize:10,color:"#999"}}>{s.note}</div>}</td><td style={{textAlign:"right",fontWeight:600}}>{fp(s.price)}</td></tr>))}
              </tbody></table>
              <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderTop:"2px solid #1a1a1a",marginTop:6,fontSize:16,fontWeight:800}}><span>{t.totalUpper}</span><span style={{color:"#d4880f"}}>{fp(showInvoice.services.reduce((s,sv)=>s+sv.price,0))}</span></div>
            </>):(<div style={{padding:"16px 0",textAlign:"center",color:"#999",fontSize:12,fontStyle:"italic"}}>{t.noServicesYet}</div>)}
            {showInvoice.notes&&<div style={{fontSize:11,color:"#888",paddingTop:8,borderTop:"1px solid #eee"}}>{t.noteLabel}: {showInvoice.notes}</div>}
            <div style={{textAlign:"center",fontSize:10,color:"#bbb",marginTop:14}}>{t.thankYou}</div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <Btn onClick={()=>openInvoiceLink(showInvoice)} style={{fontSize:12,padding:"8px 16px"}}>{t.openAsLink}</Btn>
            <Btn variant="ghost" onClick={()=>printInvoice(showInvoice)} style={{fontSize:12,padding:"8px 16px"}}>{t.printImage}</Btn>
            <Btn variant="secondary" onClick={()=>{navigator.clipboard.writeText(generateInvoiceHTML(showInvoice,data.shopName,lang)).then(()=>alert(t.htmlCopied)).catch(()=>{})}} style={{fontSize:12,padding:"8px 16px"}}>{t.copyHTML}</Btn>
          </div>
        </div>)}
      </Modal>

      {/* ═══ SETTINGS ═══ */}
      <Modal open={showSettings} onClose={()=>setShowSettings(false)} title={t.settings}>
        <Input label={t.shopNameLabel} value={data.shopName} onChange={e=>save({...data,shopName:e.target.value})}/>
        <div style={{borderTop:"1px solid #333",paddingTop:14,marginTop:8,marginBottom:14}}>
          <label style={{display:"block",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#f5a623",marginBottom:10,fontWeight:700}}>{t.pinSection}</label>
          <div style={{display:"flex",gap:10,alignItems:"end"}}>
            <Input label={t.pinLabel} type="password" inputMode="numeric" maxLength={4} value={data.pin||""} onChange={e=>save({...data,pin:e.target.value.replace(/\D/g,"").slice(0,4)})} placeholder={t.pinPh} style={{flex:1}}/>
            {data.pin&&<Btn variant="secondary" onClick={()=>save({...data,pin:""})} style={{marginBottom:16,whiteSpace:"nowrap",fontSize:12}}>{t.pinRemove}</Btn>}
          </div>
          <div style={{fontSize:11,color:data.pin?"#27ae60":"#888",marginTop:-8}}>{data.pin?`✓ ${t.pinSet}`:t.pinNotSet}</div>
        </div>
        <div style={{borderTop:"1px solid #333",paddingTop:14}}>
          <Btn variant="danger" onClick={()=>{if(window.confirm(t.deleteAllConfirm)){save({shopName:data.shopName,pin:data.pin,jobs:[],customers:[]})}}} style={{fontSize:12}}>{t.deleteAll}</Btn>
        </div>
      </Modal>

      <PinPrompt open={showPinPrompt} onClose={()=>setShowPinPrompt(false)} onSuccess={handlePinSubmit} t={t}/>
    </div>
  );
}

// ─── JOB CARD ───
function JobCard({ job, onComplete, onEdit, onInvoice, onDelete, done, t, fp, privacy, maskName, maskPlates }) {
  const total = job.services.reduce((s,sv)=>s+sv.price,0);
  const has = job.services.length>0;
  return (
    <div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"14px 16px",borderLeft:done?"4px solid #27ae60":has?"4px solid #f5a623":"4px solid #555",transition:"all .2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div style={{flex:"1 1 200px",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <span style={{fontWeight:700,fontSize:15}}>{maskName(job.customerName)}</span>
            <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",background:done?"rgba(39,174,96,0.15)":"rgba(245,166,35,0.15)",color:done?"#27ae60":"#f5a623"}}>{done?t.done:t.activeStatus}</span>
          </div>
          <div style={{fontSize:12,color:"#999",display:"flex",gap:10,flexWrap:"wrap"}}>
            <span>🚗 {job.carBrand} {job.carModel}</span>
            {job.plates&&<span>📋 {maskPlates(job.plates)}</span>}
            {job.year&&<span>📅 {job.year}</span>}
          </div>
          <div style={{fontSize:11,color:"#666",marginTop:5,display:"flex",gap:6,flexWrap:"wrap"}}>
            {has?job.services.map(s=><span key={s.id} style={{background:"#252525",padding:"2px 7px",borderRadius:4}}>{s.name}</span>):
              <span style={{color:"#666",fontStyle:"italic"}}>{t.noServicesYet}</span>}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:17,fontWeight:800,color:"#f5a623"}}>{privacy?"• • •":has?fp(total):"—"}</div>
          <div style={{fontSize:10,color:"#666"}}>{formatDate(job.date)}</div>
          <div style={{display:"flex",gap:5,marginTop:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
            {onComplete&&<button onClick={()=>onComplete(job.id)} style={{background:"#27ae60",border:"none",color:"#fff",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11,fontWeight:600}}>{t.finish}</button>}
            <button onClick={onEdit} style={{background:"#333",border:"none",color:"#f5a623",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11}}>{t.editBtn}</button>
            {!privacy&&<button onClick={onInvoice} style={{background:"#333",border:"none",color:"#eee",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11}}>{t.invoiceBtn}</button>}
            {!privacy&&<button onClick={()=>{if(window.confirm(t.deleteConfirm))onDelete(job.id)}} style={{background:"#333",border:"none",color:"#c0392b",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11}}>✕</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
