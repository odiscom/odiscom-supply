import { createClient } from '@supabase/supabase-js'

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) throw new Error('Server-side Supabase credentials are not configured.')

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function requireAdmin(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return false

  const admin = createSupabaseAdmin()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user?.email) return false

  const { data } = await admin.from('admin_users').select('id').eq('email', user.email.toLowerCase()).maybeSingle()
  return Boolean(data)
}
