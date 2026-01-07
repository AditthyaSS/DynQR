import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use fallback values during build time to prevent errors
  // The actual values will be used at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // During build, if no env vars, return a dummy client that won't be used
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a minimal client that won't throw during static generation
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
