import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nkfxzgwhxahrwmrjzojo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZnh6Z3doeGFocndtcmp6b2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTMyMTksImV4cCI6MjA2Njc2OTIxOX0.3y6VEjrcJWaRmssy5VZw5mfr7yFvtAGTmODlQrESzX4'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Test connection immediately
console.log('🔌 Supabase client initialized:', SUPABASE_URL)

export default supabase