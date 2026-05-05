import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-slate-900 text-white font-bold rounded px-3 py-2">OS</div>
          <span className="font-bold text-lg text-gray-800 tracking-wide">Odiscom Supply</span>
        </Link>
        <nav className="flex gap-6 text-gray-700 font-medium text-sm">
          <Link href="/shop">Shop</Link>
          <Link href="/quote">Request Quote</Link>
          <Link href="/admin/quotes">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
