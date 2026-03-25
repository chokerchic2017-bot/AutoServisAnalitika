import * as db from './supabase.js'

const JOBS_KEY = (u) => `off-jobs-${u}`
const CUSTS_KEY = (u) => `off-custs-${u}`
const PARTS_KEY = (u) => `off-parts-${u}`
const QUEUE_KEY = 'off-queue'
const getL = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const setL = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const getQ = () => getL(QUEUE_KEY) || []
const setQ = (q) => setL(QUEUE_KEY, q)
const addQ = (a) => { const q = getQ(); q.push({ ...a, ts: Date.now() }); setQ(q) }
const on = () => navigator.onLine

let statusCb = null
export const onSyncStatus = (cb) => { statusCb = cb }
const notify = (s) => statusCb?.(s)

export const loadJobs = async (uid) => {
  const local = getL(JOBS_KEY(uid)) || []
  if (on()) { try { const r = await db.getJobs(uid); if (r) { setL(JOBS_KEY(uid), r); notify('synced'); return r } } catch { notify('offline') } } else notify('offline')
  return local
}
export const loadCustomers = async (uid) => {
  const local = getL(CUSTS_KEY(uid)) || []
  if (on()) { try { const r = await db.getCustomers(uid); if (r) { setL(CUSTS_KEY(uid), r); return r } } catch {} }
  return local
}
export const loadParts = async (uid) => {
  const local = getL(PARTS_KEY(uid)) || []
  if (on()) { try { const r = await db.getParts(uid); if (r) { setL(PARTS_KEY(uid), r); return r } } catch {} }
  return local
}

export const createJob = async (job) => {
  const uid = job.user_id; const tid = 'temp-' + Date.now() + Math.random().toString(36).substr(2, 5)
  const lj = { ...job, id: tid, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  const jobs = getL(JOBS_KEY(uid)) || []; jobs.unshift(lj); setL(JOBS_KEY(uid), jobs)
  if (on()) { try { const { data } = await db.createJob(job); if (data) { const u = getL(JOBS_KEY(uid)) || []; const i = u.findIndex(j => j.id === tid); if (i >= 0) u[i] = data; setL(JOBS_KEY(uid), u); notify('synced'); return { data } } } catch { addQ({ type: 'createJob', payload: job, tid }); notify('offline') } } else { addQ({ type: 'createJob', payload: job, tid }); notify('offline') }
  return { data: lj }
}
export const updateJob = async (id, updates, uid) => {
  const jobs = getL(JOBS_KEY(uid)) || []; const i = jobs.findIndex(j => j.id === id); if (i >= 0) { jobs[i] = { ...jobs[i], ...updates }; setL(JOBS_KEY(uid), jobs) }
  if (on() && !id.startsWith('temp-')) { try { await db.updateJob(id, updates); notify('synced') } catch { addQ({ type: 'updateJob', payload: { id, updates }, uid }); notify('offline') } } else { addQ({ type: 'updateJob', payload: { id, updates }, uid }); notify('offline') }
}
export const deleteJob = async (id, uid) => {
  const jobs = getL(JOBS_KEY(uid)) || []; setL(JOBS_KEY(uid), jobs.filter(j => j.id !== id))
  if (on() && !id.startsWith('temp-')) { try { await db.deleteJobApi(id); notify('synced') } catch { addQ({ type: 'deleteJob', payload: { id }, uid }) } } else if (!id.startsWith('temp-')) { addQ({ type: 'deleteJob', payload: { id }, uid }) }
}
export const createCustomer = async (c) => {
  const uid = c.user_id; const l = getL(CUSTS_KEY(uid)) || []; l.unshift({ ...c, id: 'temp-' + Date.now(), created_at: new Date().toISOString() }); setL(CUSTS_KEY(uid), l)
  if (on()) { try { await db.createCustomer(c) } catch { addQ({ type: 'createCustomer', payload: c }) } } else addQ({ type: 'createCustomer', payload: c })
}
export const updateCustomer = async (id, updates, uid) => {
  const custs = getL(CUSTS_KEY(uid)) || []; const i = custs.findIndex(c => c.id === id); if (i >= 0) { custs[i] = { ...custs[i], ...updates }; setL(CUSTS_KEY(uid), custs) }
  if (on() && !id.startsWith('temp-')) { try { await db.updateCustomer(id, updates) } catch { addQ({ type: 'updateCustomer', payload: { id, updates } }) } }
}
export const createPart = async (part) => {
  const uid = part.user_id; const l = getL(PARTS_KEY(uid)) || []; const lp = { ...part, id: 'temp-' + Date.now(), created_at: new Date().toISOString() }; l.unshift(lp); setL(PARTS_KEY(uid), l)
  if (on()) { try { const { data } = await db.createPart(part); if (data) { const u = getL(PARTS_KEY(uid)) || []; const i = u.findIndex(p => p.id === lp.id); if (i >= 0) u[i] = data; setL(PARTS_KEY(uid), u) } } catch { addQ({ type: 'createPart', payload: part }) } } else addQ({ type: 'createPart', payload: part })
  return { data: lp }
}
export const updatePart = async (id, updates, uid) => {
  const parts = getL(PARTS_KEY(uid)) || []; const i = parts.findIndex(p => p.id === id); if (i >= 0) { parts[i] = { ...parts[i], ...updates }; setL(PARTS_KEY(uid), parts) }
  if (on() && !id.startsWith('temp-')) { try { await db.updatePart(id, updates) } catch { addQ({ type: 'updatePart', payload: { id, updates } }) } }
}
export const deletePart = async (id, uid) => {
  const parts = getL(PARTS_KEY(uid)) || []; setL(PARTS_KEY(uid), parts.filter(p => p.id !== id))
  if (on() && !id.startsWith('temp-')) { try { await db.deletePart(id) } catch { addQ({ type: 'deletePart', payload: { id } }) } }
}
export const decreasePartStock = async (id, qty, uid) => {
  const parts = getL(PARTS_KEY(uid)) || []; const i = parts.findIndex(p => p.id === id); if (i >= 0) { parts[i].quantity = Math.max(0, parts[i].quantity - qty); setL(PARTS_KEY(uid), parts) }
  if (on() && !id.startsWith('temp-')) { try { await db.decreasePartStock(id, qty) } catch { addQ({ type: 'decreasePartStock', payload: { id, qty } }) } }
}
export const updateUser = async (uid, updates) => {
  if (on()) { try { await db.updateUser(uid, updates); notify('synced') } catch { addQ({ type: 'updateUser', payload: { uid, updates } }); notify('offline') } } else addQ({ type: 'updateUser', payload: { uid, updates } })
}

export const processQueue = async () => {
  const q = getQ(); if (!q.length || !on()) return; notify('syncing'); const fail = []
  for (const a of q) { try { switch (a.type) {
    case 'createJob': await db.createJob(a.payload); break
    case 'updateJob': if (!a.payload.id.startsWith('temp-')) await db.updateJob(a.payload.id, a.payload.updates); break
    case 'deleteJob': if (!a.payload.id.startsWith('temp-')) await db.deleteJobApi(a.payload.id); break
    case 'createCustomer': await db.createCustomer(a.payload); break
    case 'updateCustomer': if (!a.payload.id.startsWith('temp-')) await db.updateCustomer(a.payload.id, a.payload.updates); break
    case 'createPart': await db.createPart(a.payload); break
    case 'updatePart': if (!a.payload.id.startsWith('temp-')) await db.updatePart(a.payload.id, a.payload.updates); break
    case 'deletePart': if (!a.payload.id.startsWith('temp-')) await db.deletePart(a.payload.id); break
    case 'decreasePartStock': if (!a.payload.id.startsWith('temp-')) await db.decreasePartStock(a.payload.id, a.payload.qty); break
    case 'updateUser': await db.updateUser(a.payload.uid, a.payload.updates); break
  }} catch { fail.push(a) } }
  setQ(fail); notify(fail.length ? 'error' : 'synced')
}

export const fullSync = async (uid) => {
  if (!on()) return false; await processQueue()
  const [j, c, p] = await Promise.all([db.getJobs(uid), db.getCustomers(uid), db.getParts(uid)])
  if (j) setL(JOBS_KEY(uid), j); if (c) setL(CUSTS_KEY(uid), c); if (p) setL(PARTS_KEY(uid), p)
  notify('synced'); return true
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { notify('syncing'); processQueue() })
  window.addEventListener('offline', () => notify('offline'))
}

export { login, changePassword, adminGetUsers, adminCreateUser, adminToggleUser, adminDeleteUser, adminResetPassword, adminRenewSubscription, adminGetStats, subscribeJobs } from './supabase.js'
