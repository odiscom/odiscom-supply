import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function BadMaterialUploadSlugRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/material-upload')
  }, [router])

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Redirecting to material upload...
    </main>
  )
}
