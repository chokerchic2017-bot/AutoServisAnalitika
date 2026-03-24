import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(url || '', key || '')

// ─── AUTH (simple table lookup) ───
export const login = async (username, password) => {
  const { data, error } = await supabase
    .from('users').select('*')
    .eq('username', username).eq('password', password).single()
  if (error || !data) return null
  return data
}

export const changePassword = async (userId, newPassword) => {
  const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', userId)
  return !error
}

// ─── ADMIN ───
export const adminGetUsers = async () => {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  return data || []
}

export const adminCreateUser = async (username, password, shopName) => {
  const { data, error } = await supabase.from('users')
    .insert({ username, password, shop_name: shopName, role: 'user', is_active: true })
    .select().single()
  return { data, error }
}

export const adminToggleUser = async (id, isActive) => {
  return supabase.from('users').update({ is_active: isActive }).eq('id', id)
}

export const adminDeleteUser = async (id) => {
  await supabase.from('jobs').delete().eq('user_id', id)
  await supabase.from('customers').delete().eq('user_id', id)
  await supabase.from('users').delete().eq('id', id)
}

export const adminResetPassword = async (id, newPassword) => {
  return supabase.from('users').update({ password: newPassword }).eq('id', id)
}

export const adminGetStats = async () => {
  const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user')
  const { count: activeUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('is_active', true)
  const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  return { users: users || 0, activeUsers: activeUsers || 0, totalJobs: totalJobs || 0 }
}

// ─── SHOP DATA ───
export const getJobs = async (userId) => {
  const { data } = await supabase.from('jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}

export const createJob = async (job) => {
  const { data, error } = await supabase.from('jobs').insert(job).select().single()
  return { data, error }
}

export const updateJob = async (id, updates) => {
  return supabase.from('jobs').update(updates).eq('id', id)
}

export const deleteJobApi = async (id) => {
  return supabase.from('jobs').delete().eq('id', id)
}

export const getCustomers = async (userId) => {
  const { data } = await supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}

export const createCustomer = async (c) => {
  return supabase.from('customers').insert(c)
}

export const updateUser = async (id, updates) => {
  return supabase.from('users').update(updates).eq('id', id)
}

export const subscribeJobs = (userId, cb) => {
  const ch = supabase.channel(`jobs-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${userId}` }, () => cb())
    .subscribe()
  return () => supabase.removeChannel(ch)
}
