import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirectBase = new URL(request.url).origin

  // Handle PKCE flow (code exchange)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(error.message)}`,
      )
    }
    return NextResponse.redirect(`${redirectBase}/dashboard`)
  }

  // Handle token_hash flow (legacy/email OTP)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'magiclink' | 'recovery' | null

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (error) {
      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(error.message)}`,
      )
    }
    return NextResponse.redirect(`${redirectBase}/dashboard`)
  }

  return NextResponse.redirect(
    `${redirectBase}/login?error=${encodeURIComponent('Missing confirmation parameters')}`,
  )
}
