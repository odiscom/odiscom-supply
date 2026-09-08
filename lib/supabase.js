import { createClient } from '@supabase/supabase-js'
let client
export const supabase = new Proxy({}, {get(_target,key) {
  if(!client) {
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,keyValue=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if(!url || !keyValue) throw new Error('Application database is not configured.')
    client=createClient(url,keyValue)
  }
  const value=client[key]
  return typeof value === 'function' ? value.bind(client) : value
}})
