'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const RESEND_COOLDOWN_SECONDS = 60

const ERROR_MESSAGES: Record<string, string> = {
  'Email link is invalid or has expired': 'That link has expired. Please request a new one.',
  'Token has expired or is invalid': 'That code has expired. Please request a new one.',
  'Invalid login credentials': 'Invalid code. Please try again.',
  'Missing confirmation parameters': 'Invalid link. Please request a new code.',
}

function friendlyError(message: string): string {
  return ERROR_MESSAGES[message] ?? message
}

export type OtpStep = 'email' | 'otp'

export interface UseOtpFlowReturn {
  email: string
  setEmail: (email: string) => void
  otp: string
  setOtp: (otp: string) => void
  step: OtpStep
  loading: boolean
  error: string | null
  resendCooldown: number
  handleSendOtp: (e: React.FormEvent) => Promise<void>
  handleVerifyOtp: (e: React.FormEvent) => Promise<void>
  handleResend: () => Promise<void>
  handleChangeEmail: () => void
}

export function useOtpFlow(redirectTo = '/dashboard'): UseOtpFlowReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<OtpStep>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Read ?error= from URL on mount
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(friendlyError(urlError))
    }
  }, [searchParams])

  // Clean up cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  const startCooldown = useCallback(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          cooldownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleSendOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        })

        if (authError) {
          setError(friendlyError(authError.message))
          return
        }

        setStep('otp')
        startCooldown()
      } catch (err) {
        console.error('[auth] Failed to send OTP:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [email, startCooldown],
  )

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { error: authError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        })

        if (authError) {
          setError(friendlyError(authError.message))
          return
        }

        router.push(redirectTo)
      } catch (err) {
        console.error('[auth] Failed to verify OTP:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [email, otp, router, redirectTo],
  )

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (authError) {
        setError(friendlyError(authError.message))
        return
      }

      startCooldown()
    } catch (err) {
      console.error('[auth] Failed to resend OTP:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, resendCooldown, startCooldown])

  const handleChangeEmail = useCallback(() => {
    setStep('email')
    setOtp('')
    setError(null)
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current)
      cooldownRef.current = null
    }
    setResendCooldown(0)
  }, [])

  return {
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
  }
}
