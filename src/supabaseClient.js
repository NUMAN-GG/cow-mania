import { createClient } from '@supabase/supabase-js'

// Temporary test credentials (aap baad me apni Supabase details daal sakte hain)
const supabaseUrl = 'https://reomnldwvlkorfklalhu.supabase.co'
const supabaseAnonKey = 'sb_publishable_o9a11rF7b6t7RK0Rvwd07g_aLXFiL88'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)