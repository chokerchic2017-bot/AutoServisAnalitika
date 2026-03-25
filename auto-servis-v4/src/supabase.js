import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(url || '', key || '')

// ─── AUTH ───
export const login = async (username, password) => {
  const { data } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single()
  return data || null
}
export const changePassword = async (userId, pw) => {
  const { error } = await supabase.from('users').update({ password: pw }).eq('id', userId)
  return !error
}

// ─── ADMIN ───
export const adminGetUsers = async () => {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  return data || []
}
export const adminCreateUser = async (username, password, shopName, subMonths) => {
  const exp = new Date(); exp.setMonth(exp.getMonth() + (subMonths || 1))
  const { data, error } = await supabase.from('users').insert({ username, password, shop_name: shopName, role: 'user', is_active: true, subscription_months: subMonths || 1, subscription_expires: exp.toISOString() }).select().single()
  return { data, error }
}
export const adminToggleUser = async (id, active) => supabase.from('users').update({ is_active: active }).eq('id', id)
export const adminDeleteUser = async (id) => {
  await supabase.from('parts').delete().eq('user_id', id)
  await supabase.from('jobs').delete().eq('user_id', id)
  await supabase.from('customers').delete().eq('user_id', id)
  await supabase.from('users').delete().eq('id', id)
}
export const adminResetPassword = async (id, pw) => supabase.from('users').update({ password: pw }).eq('id', id)
export const adminRenewSubscription = async (id, months) => {
  const exp = new Date(); exp.setMonth(exp.getMonth() + months)
  return supabase.from('users').update({ subscription_months: months, subscription_expires: exp.toISOString() }).eq('id', id)
}
export const adminGetStats = async () => {
  const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user')
  const { count: activeUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('is_active', true)
  const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  return { users: users || 0, activeUsers: activeUsers || 0, totalJobs: totalJobs || 0 }
}

// ─── JOBS ───
export const getJobs = async (userId) => {
  const { data } = await supabase.from('jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}
export const createJob = async (job) => {
  const { data, error } = await supabase.from('jobs').insert(job).select().single()
  return { data, error }
}
export const updateJob = async (id, updates) => supabase.from('jobs').update(updates).eq('id', id)
export const deleteJobApi = async (id) => supabase.from('jobs').delete().eq('id', id)

// ─── CUSTOMERS (with car info) ───
export const getCustomers = async (userId) => {
  const { data } = await supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}
export const createCustomer = async (c) => supabase.from('customers').insert(c)
export const updateCustomer = async (id, updates) => supabase.from('customers').update(updates).eq('id', id)

// ─── PARTS / INVENTORY ───
export const getParts = async (userId) => {
  const { data } = await supabase.from('parts').select('*').eq('user_id', userId).order('description', { ascending: true })
  return data || []
}
export const createPart = async (part) => {
  const { data, error } = await supabase.from('parts').insert(part).select().single()
  return { data, error }
}
export const updatePart = async (id, updates) => supabase.from('parts').update(updates).eq('id', id)
export const deletePart = async (id) => supabase.from('parts').delete().eq('id', id)
export const decreasePartStock = async (id, qty) => {
  const { data: part } = await supabase.from('parts').select('quantity').eq('id', id).single()
  if (part) {
    const newQty = Math.max(0, part.quantity - qty)
    return supabase.from('parts').update({ quantity: newQty }).eq('id', id)
  }
}

// ─── USER SETTINGS ───
export const updateUser = async (id, updates) => supabase.from('users').update(updates).eq('id', id)

// ─── REALTIME ───
export const subscribeJobs = (userId, cb) => {
  const ch = supabase.channel(`jobs-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${userId}` }, () => cb())
    .subscribe()
  return () => supabase.removeChannel(ch)
}
