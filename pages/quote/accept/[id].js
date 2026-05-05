import { useRouter } from 'next/router'
import { useState } from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function AcceptQuotePage() {
  const router = useRouter()
  const { id } = router.query
  const [done, setDone] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)

  async function acceptQuote() {
    const res = await fetch(`/api/quotes/${id}/accept`, { method: 'POST' })
    const data = await res.json()
    if (data.success) { setDone(true); setOrderNumber(data.orderNumber) }
    else alert(data.message || 'Error accepting quote')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow p-8 max-w-xl w-full text-center">
          {done ? (
            <>
              <h1 className="text-3xl font-bold mb-4">Quote Accepted</h1>
              <p className="text-gray-600">Thank you. Our team will begin processing your order.</p>
              <p className="mt-4 font-mono text-blue-600">{orderNumber}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">Accept Your Quote</h1>
              <p className="text-gray-600 mb-6">Click below to approve this quote and begin fulfillment.</p>
              <button onClick={acceptQuote} className="bg-blue-600 text-white px-6 py-3 rounded font-semibold">Accept Quote</button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
