'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[var(--background)]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">Nešto je pošlo po krivu</h1>
        <p className="text-[var(--muted-foreground)] mb-8">Došlo je do neočekivane greške. Molimo pokušajte ponovo.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Pokušaj ponovo
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="w-4 h-4" />
            Početna
          </Link>
        </div>
      </div>
    </div>
  )
}
