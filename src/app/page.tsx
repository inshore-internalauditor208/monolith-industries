import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-zinc-900">
      <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-7xl text-zinc-50 md:text-8xl">Monolith Industries</h1>
        <p className="mt-4 text-xl text-zinc-400 md:text-2xl">
          Production-grade Next.js starter kit.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-flex h-12 items-center rounded-lg bg-indigo-600 px-8 text-lg font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="mt-4 block text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Already have an account? Sign in
        </Link>
      </section>

      <section className="border-t border-zinc-800 px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-zinc-50 md:text-4xl">
            Everything you need to ship.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            Auth, database, background jobs, error monitoring, analytics, and a full design system.
            All wired up and ready to build on.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex h-12 items-center rounded-lg bg-indigo-600 px-8 text-lg font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  )
}
