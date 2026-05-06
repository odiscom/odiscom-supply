import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded bg-slate-900 px-3 py-2 font-bold text-white">OS</div>
          <span className="text-lg font-bold tracking-wide text-gray-800">Odiscom Supply</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/shop">Shop</Link>
          <Link href="/material-upload">Upload BOM</Link>
          <Link href="/quote">Request Quote</Link>
          <Link href="/account">Account</Link>
          <Link href="/supplier/login">Supplier</Link>
          <Link href="/admin" className="rounded-lg bg-slate-900 px-4 py-2 text-white">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
