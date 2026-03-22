'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function init() {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.replace('/login')
          return
        }

        setUserEmail(session.user.email ?? '')
      } catch (err) {
        console.error('[dashboard] Init failed:', err)
        router.replace('/login')
        return
      }

      setLoading(false)
    }

    init()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </nav>
        <div className="mx-auto max-w-content px-4 py-8">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4">
          <Link href="/dashboard" className="font-display text-xl text-foreground">
            Monolith Industries
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              Log out
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-content px-4 py-8">{children}</main>
      <Toaster position="bottom-right" />
    </div>
  )
}
