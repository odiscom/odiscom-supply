import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const navItems = [
  { href: '/supplier', label: 'Dashboard' },
  { href: '/supplier/products', label: 'Products & Pricing' },
  { href: '/supplier/profile', label: 'Profile' },
]

export default function SupplierShell({ title, children }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/supplier/login')
        return
      }
      setUser(data.session.user)
      setChecking(false)
    }
    checkSession()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/supplier/login')
  }

  if (checking) return <main className="min-h-screen bg-slate-50 p-10 text-slate-600">Checking supplier session...</main>

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden w-72 bg-slate-950 text-white md:flex md:flex-col">
        <div className="border-b border-slate-800 p-6">
          <div className="text-xl font-bold">Odiscom Supply</div>
          <div className="mt-1 text-xs text-slate-400">Supplier Portal</div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded-xl px-4 py-3 text-sm font-semibold ${router.pathname === item.href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
          <div className="mb-3 truncate">{user?.email}</div>
          <button onClick={signOut} className="w-full rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <header className="border-b bg-white px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
              <p className="text-sm text-slate-500">Manage your supplier profile, products, costs, lead times, and availability.</p>
            </div>
            <Link href="/" className="text-sm font-semibold text-blue-700">View site</Link>
          </div>
          <nav className="mt-4 flex gap-2 md:hidden">
            {navItems.map((item) => <Link key={item.href} href={item.href} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{item.label}</Link>)}
          </nav>
        </header>
        <section className="p-6">{children}</section>
      </main>
    </div>
  )
}
