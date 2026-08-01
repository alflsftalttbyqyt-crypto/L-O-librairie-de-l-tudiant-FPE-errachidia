import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uvdavvjqmjmlvtlkmhou.supabase.co'
const supabaseAnonKey = 'sb_publishable_w3bY6CDxjzBghRR0tN3UbQ_MLgDCkK9'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
