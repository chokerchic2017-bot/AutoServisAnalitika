// ─── SHARED UI + TRANSLATIONS ───
import { useState, useEffect, useRef } from 'react'

export const CAR_BRANDS = ["Volkswagen","Opel","Mercedes-Benz","BMW","Audi","Renault","Peugeot","Citroën","Fiat","Škoda","Seat","Toyota","Hyundai","Kia","Ford","Nissan","Honda","Mazda","Dacia","Chevrolet","Suzuki","Mitsubishi","Volvo","Land Rover","Jeep","Alfa Romeo","Lancia","Porsche","Mini"];
export const SERVICE_IDS = ["oil","brakes","tires","filter_air","filter_oil","filter_cabin","battery","spark","timing","suspension","ac","diagnostic","alignment","clutch","exhaust","custom"];
export const generateId = () => Date.now().toString(36)+Math.random().toString(36).substr(2,5);
export const formatPrice = (p,l) => new Intl.NumberFormat("mk-MK").format(p)+" "+(T[l]?.den||"den.");
export const formatDate = (d) => new Date(d).toLocaleDateString("mk-MK",{day:"2-digit",month:"2-digit",year:"numeric"});
export const getSvcName = (id,l) => T[l]?.[`svc_${id}`]||id;

export const T = {
  sq: {
    other:"Tjetër",dashboard:"Paneli",services:"Serviset",customers:"Klientët",inventory:"Pjesët",analytics:"Analitika",
    active:"Aktive",completed:"Përfunduar",revenue:"Të ardhura",activeServices:"Serviset Aktive",newService:"+ Servis i Ri",
    noActive:"Nuk ka servise aktive.",recentDone:"Përfunduara",allServices:"Të Gjitha",searchPlaceholder:"Kërko...",noResults:"Nuk ka rezultate",
    customersCount:"Klientët",customersAuto:"Klientët shtohen automatikisht",noPhone:"Pa telefon",
    servicesLabel:"Servise",totalLabel:"Gjithsej",
    newServiceTitle:"Servis i Ri",editServiceTitle:"Ndrysho Servisin",
    customerName:"Emri i klientit *",customerNamePh:"P.sh. Arben Krasniqi",
    phone:"Telefoni",phonePh:"07X XXX XXX",brand:"Marka *",model:"Modeli",modelPh:"P.sh. Golf 7",
    plates:"Targat",platesPh:"P.sh. SK-1234-AB",year:"Viti",yearPh:"2018",
    vin:"VIN numri",vinPh:"P.sh. WVWZZZ3CZWE123456",vinPhoto:"📷 Foto e dokumentit",viewPhoto:"Shiko foton",removePhoto:"Hiq foton",
    addServices:"Shto Shërbime (opsionale)",serviceType:"Lloji",priceDen:"Çmimi (den)",
    customServiceName:"Emri",customServicePh:"Përshkrim...",
    noteOptional:"Shënim (opsionale)",noteDetailsPh:"Detaje...",total:"Gjithsej:",
    serviceNote:"Shënim",generalNotesPh:"Shënime...",cancel:"Anulo",saveService:"Ruaj",
    invoice:"Fatura",invoiceLabel:"Fatura",client:"Klienti",vehicle:"Automjeti",platesLabel:"Targat",yearLabel:"Viti",
    service:"Shërbimi",price:"Çmimi",totalUpper:"Gjithsej",noteLabel:"Shënim",thankYou:"Ju faleminderit!",
    openAsLink:"📄 Link",printImage:"🖨️ Printo",htmlCopied:"Kopjuar!",
    settings:"Cilësimet",shopNameLabel:"Emri i servisit",done:"përfunduar",activeStatus:"aktiv",
    finish:"✓ Përfundo",invoiceBtn:"📄",editBtn:"✏️",deleteConfirm:"Fshi?",den:"den.",
    noServicesYet:"Pa shërbime",logout:"Dil",
    svc_oil:"Ndërrimi vajit",svc_brakes:"Frena",svc_tires:"Goma",svc_filter_air:"Filtri ajrit",
    svc_filter_oil:"Filtri vajit",svc_filter_cabin:"Filtri kabinës",svc_battery:"Bateria",
    svc_spark:"Kandela",svc_timing:"Zinxhiri",svc_suspension:"Amortizatorët",svc_ac:"Klima",
    svc_diagnostic:"Diagnostikimi",svc_alignment:"Balancimi",svc_clutch:"Friksioni",svc_exhaust:"Shkarkuesi",svc_custom:"Tjetër",
    privacyOn:"Modaliteti privat AKTIV",privacyLocked:"🔒 E kyçur",
    pinLabel:"PIN (4 shifra)",pinPh:"PIN 4-shifror",pinSet:"PIN vendosur",pinNotSet:"Nuk ka PIN",
    pinRequired:"Vendos PIN-in",pinWrong:"PIN i gabuar!",pinRemove:"Hiq",pinSection:"PIN privatësi",
    changePw:"Ndrysho fjalëkalimin",oldPw:"Fjalëkalimi vjetër",newPw:"Fjalëkalimi ri",confirmPw:"Konfirmo",
    pwMismatch:"Nuk përputhen!",pwWrong:"Gabim!",pwChanged:"U ndryshua!",pwShort:"Min. 4 karaktere",
    // Inventory
    invTitle:"Inventari i Pjesëve",addPart:"+ Pjesë e re",serialNumber:"Nr. Serik",description:"Përshkrimi",
    quantity:"Sasia",buyPrice:"Çmimi blerjes",sellPrice:"Çmimi shitjes",lowStock:"Sasi e ulët!",
    noParts:"Nuk ka pjesë në inventar",editPart:"Ndrysho",deletePart:"Fshi",threshold:"Pragu minim",
    addPartFromInv:"Shto pjesë nga inventari",partsUsed:"Pjesët e përdorura",
    // Analytics
    monthlyRevenue:"Të ardhurat mujore",monthlyCustomers:"Klientët mujor",topServices:"Shërbimet top",
    topCustomers:"Klientët top",partsUsedAnalytics:"Pjesët e përdorura",totalRevenue:"Gjithsej të ardhura",
    avgPerJob:"Mesatarja/punë",totalCustomers:"Gjithsej klientë",period:"Periudha",last6:"6 muaj",last12:"12 muaj",
    repeatCustomer:"Klient i përsëritur",selectCustomer:"Zgjidh klientin ekzistues",lastService:"Servisi fundit",
  },
  mk: {
    other:"Друго",dashboard:"Табла",services:"Сервиси",customers:"Клиенти",inventory:"Делови",analytics:"Аналитика",
    active:"Активни",completed:"Завршени",revenue:"Приход",activeServices:"Активни Сервиси",newService:"+ Нов Сервис",
    noActive:"Нема активни сервиси.",recentDone:"Последни Завршени",allServices:"Сите Сервиси",searchPlaceholder:"Барај...",noResults:"Нема резултати",
    customersCount:"Клиенти",customersAuto:"Клиентите автоматски се додаваат",noPhone:"Нема телефон",
    servicesLabel:"Сервиси",totalLabel:"Вкупно",
    newServiceTitle:"Нов Сервис",editServiceTitle:"Измени Сервис",
    customerName:"Име на клиент *",customerNamePh:"Пр. Марко Петров",
    phone:"Телефон",phonePh:"07X XXX XXX",brand:"Марка *",model:"Модел",modelPh:"Пр. Golf 7",
    plates:"Таблици",platesPh:"Пр. SK-1234-AB",year:"Година",yearPh:"2018",
    vin:"ВИН број",vinPh:"Пр. WVWZZZ3CZWE123456",vinPhoto:"📷 Фото од документ",viewPhoto:"Погледни фото",removePhoto:"Отстрани фото",
    addServices:"Додади Услуги (опционо — може подоцна)",serviceType:"Тип",priceDen:"Цена (ден)",
    customServiceName:"Име",customServicePh:"Опис...",
    noteOptional:"Забелешка (опционо)",noteDetailsPh:"Детали...",total:"Вкупно:",
    serviceNote:"Забелешка",generalNotesPh:"Забелешки...",cancel:"Откажи",saveService:"Зачувај",
    invoice:"Фактура",invoiceLabel:"Фактура",client:"Клиент",vehicle:"Возило",platesLabel:"Таблици",yearLabel:"Год",
    service:"Услуга",price:"Цена",totalUpper:"Вкупно",noteLabel:"Забелешка",thankYou:"Ви благодариме!",
    openAsLink:"📄 Линк",printImage:"🖨️ Печати",htmlCopied:"Копирано!",
    settings:"Поставки",shopNameLabel:"Име на сервис",done:"завршен",activeStatus:"активен",
    finish:"✓ Заврши",invoiceBtn:"📄",editBtn:"✏️",deleteConfirm:"Избриши?",den:"ден.",
    noServicesYet:"Нема услуги",logout:"Одјави се",
    svc_oil:"Замена на масло",svc_brakes:"Кочници",svc_tires:"Гуми",svc_filter_air:"Филтер воздух",
    svc_filter_oil:"Филтер масло",svc_filter_cabin:"Филтер кабина",svc_battery:"Батерија",
    svc_spark:"Свеќици",svc_timing:"Ланец/Ремен",svc_suspension:"Амортизери",svc_ac:"Клима",
    svc_diagnostic:"Дијагностика",svc_alignment:"Нивелација",svc_clutch:"Квачило",svc_exhaust:"Ауспух",svc_custom:"Друг сервис",
    privacyOn:"Приватен режим ВКЛУЧЕН",privacyLocked:"🔒 Заклучено",
    pinLabel:"ПИН (4 цифри)",pinPh:"4-цифрен ПИН",pinSet:"ПИН поставен",pinNotSet:"Нема ПИН",
    pinRequired:"Внеси ПИН",pinWrong:"Погрешен ПИН!",pinRemove:"Отстрани",pinSection:"ПИН за приватност",
    changePw:"Промени лозинка",oldPw:"Стара лозинка",newPw:"Нова лозинка",confirmPw:"Потврди",
    pwMismatch:"Не се исти!",pwWrong:"Погрешно!",pwChanged:"Променета!",pwShort:"Мин. 4 карактери",
    invTitle:"Инвентар на Делови",addPart:"+ Нов дел",serialNumber:"Сериски бр.",description:"Опис",
    quantity:"Количина",buyPrice:"Набавна цена",sellPrice:"Продажна цена",lowStock:"Мала количина!",
    noParts:"Нема делови во инвентар",editPart:"Измени",deletePart:"Избриши",threshold:"Минимален праг",
    addPartFromInv:"Додади дел од инвентар",partsUsed:"Употребени делови",
    monthlyRevenue:"Месечен приход",monthlyCustomers:"Месечни клиенти",topServices:"Топ услуги",
    topCustomers:"Топ клиенти",partsUsedAnalytics:"Употребени делови",totalRevenue:"Вкупен приход",
    avgPerJob:"Просек/сервис",totalCustomers:"Вкупно клиенти",period:"Период",last6:"6 месеци",last12:"12 месеци",
    repeatCustomer:"Повторен клиент",selectCustomer:"Избери постоечки клиент",lastService:"Последен сервис",
  }
};

// ─── UI COMPONENTS ───
export function Modal({open,onClose,title,children}){if(!open)return null;return(<div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#1e1e1e",border:"1px solid #333",borderRadius:8,width:"95%",maxWidth:600,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.5)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #333"}}><h2 style={{fontSize:16,color:"#f5a623",letterSpacing:1}}>{title}</h2><button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:20,cursor:"pointer"}}>✕</button></div><div style={{padding:"16px 20px"}}>{children}</div></div></div>)}
export function Inp({label,...p}){return(<div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:5}}>{label}</label>}<input {...p} style={{width:"100%",padding:"9px 12px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:13,outline:"none",...(p.style||{})}}/></div>)}
export function Sel({label,options,...p}){return(<div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1,color:"#888",marginBottom:5}}>{label}</label>}<select {...p} style={{width:"100%",padding:"9px 12px",background:"#111",border:"1px solid #333",borderRadius:4,color:"#eee",fontSize:13,outline:"none",...(p.style||{})}}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>)}
export function Btn({children,variant="primary",...p}){const s={primary:{background:"#f5a623",color:"#111",fontWeight:700},secondary:{background:"#333",color:"#eee"},danger:{background:"#c0392b",color:"#fff"},ghost:{background:"transparent",color:"#f5a623",border:"1px solid #f5a623"},success:{background:"#27ae60",color:"#fff",fontWeight:600}};return<button {...p} style={{padding:"9px 18px",border:"none",borderRadius:4,fontSize:12,cursor:"pointer",letterSpacing:.5,...s[variant],...(p.style||{})}}>{children}</button>}
export function Stat({icon,label,value}){return(<div style={{background:"#1e1e1e",border:"1px solid #2a2a2a",borderRadius:8,padding:"14px 18px",flex:"1 1 130px",minWidth:120}}><div style={{fontSize:22,marginBottom:5}}>{icon}</div><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:"#888",marginBottom:3}}>{label}</div><div style={{fontSize:20,fontWeight:800,color:"#f5a623"}}>{value}</div></div>)}
export function PinPrompt({open,onClose,onOk,t}){const[v,setV]=useState("");const[e,setE]=useState(false);const r=useRef();useEffect(()=>{if(open){setV("");setE(false);setTimeout(()=>r.current?.focus(),100)}},[open]);if(!open)return null;const go=()=>{onOk(v)?null:setE(true)};return(<div style={{position:"fixed",inset:0,zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#1e1e1e",border:"1px solid #333",borderRadius:12,padding:28,width:"90%",maxWidth:320,textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>🔒</div><div style={{fontSize:13,color:"#ccc",marginBottom:16}}>{t.pinRequired}</div><input ref={r} type="password" inputMode="numeric" maxLength={4} value={v} onChange={x=>{setV(x.target.value.replace(/\D/g,"").slice(0,4));setE(false)}} onKeyDown={x=>x.key==="Enter"&&go()} style={{width:"100%",padding:12,background:"#111",border:e?"2px solid #c0392b":"2px solid #333",borderRadius:8,color:"#eee",fontSize:26,textAlign:"center",letterSpacing:12,outline:"none"}}/>{e&&<div style={{color:"#c0392b",fontSize:11,marginTop:6}}>{t.pinWrong}</div>}<div style={{display:"flex",gap:10,marginTop:16,justifyContent:"center"}}><Btn variant="secondary" onClick={onClose}>{t.cancel}</Btn><Btn onClick={go}>OK</Btn></div></div></div>)}
