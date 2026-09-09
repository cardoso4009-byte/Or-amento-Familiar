'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/controle')
  }, [router])

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
      <p>Carregando o controle financeiro familiar...</p>
    </main>
  )
}
