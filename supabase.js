import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Missing Supabase credentials. Check your .env file.')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  realtime: {
    params: { eventsPerSecond: 2 }
  }
})

// ─── Storage Layer (replaces window.storage) ───

const ROW_ID = 'default'

export async function loadData() {
  try {
    const { data, error } = await supabase
      .from('shop_data')
      .select('data')
      .eq('id', ROW_ID)
      .single()

    if (error) throw error
    return data?.data || null
  } catch (err) {
    console.error('Load error:', err)
    // Fallback to localStorage
    const local = localStorage.getItem('autoservis-data')
    return local ? JSON.parse(local) : null
  }
}

export async function saveData(shopData) {
  // Always save to localStorage as backup
  localStorage.setItem('autoservis-data', JSON.stringify(shopData))

  try {
    const { error } = await supabase
      .from('shop_data')
      .upsert({ id: ROW_ID, data: shopData })

    if (error) throw error
    return true
  } catch (err) {
    console.error('Save error:', err)
    return false
  }
}

export function subscribeToChanges(callback) {
  const channel = supabase
    .channel('shop-sync')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'shop_data', filter: `id=eq.${ROW_ID}` },
      (payload) => {
        if (payload.new?.data) {
          callback(payload.new.data)
        }
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
