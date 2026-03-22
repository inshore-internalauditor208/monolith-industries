'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useOtpFlow } from '@/hooks/use-otp-flow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SignupForm() {
  const {
    email,
    setEmail,
    otp,
    setOtp,
    step,
    loading,
    error,
    resendCooldown,
    handleSendOtp,
    handleVerifyOtp,
    handleResend,
    handleChangeEmail,
  } = useOtpFlow()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="font-display text-5xl text-zinc-50">Monolith Industries</h1>
          <p className="mt-3 text-zinc-400">Create your account</p>
        </div>

        {step === 'otp' ? (
          <div className="space-y-4">
            <p className="text-lg font-medium text-zinc-50">Check your email</p>
            <p className="text-sm text-zinc-400">
              We sent a code to <span className="text-zinc-200">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={8}
                required
                className="h-11 border-zinc-700 bg-zinc-800 text-center text-lg tracking-widest text-zinc-50 placeholder:text-zinc-500 focus:border-indigo-600"
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-500"
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </Button>
            </form>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-sm text-zinc-500 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-sm text-zinc-500 hover:text-zinc-300"
              >
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-zinc-700 bg-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-indigo-600"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !email}
              className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {loading ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        )}

        <p className="text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-300 hover:text-zinc-100">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
