'use client'

import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client. Safe to use in client components —
// only the public URL and anon key are exposed, and Row Level Security
// (see supabase/schema.sql) ensures each user can only touch their own rows.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
