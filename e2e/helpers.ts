const MAILPIT_URL = 'http://127.0.0.1:54324'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for e2e tests. Check .env.test')
}

interface MailpitMessage {
  ID: string
  To: { Address: string }[]
  Subject: string
}

interface MailpitSearchResponse {
  messages: MailpitMessage[]
}

interface MailpitMessageDetail {
  Text: string
}

async function assertOk(res: Response, context: string) {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${context}: ${res.status} ${body}`)
  }
}

/**
 * Fetch the latest OTP code from Mailpit for a given email address.
 */
export async function getOtpFromMailpit(email: string): Promise<string> {
  let messages: MailpitMessage[] = []
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${MAILPIT_URL}/api/v1/search?query=to:${encodeURIComponent(email)}`)
    await assertOk(res, `Mailpit search for ${email}`)
    const data: MailpitSearchResponse = await res.json()
    messages = data.messages || []
    if (messages.length > 0) break
    await new Promise((r) => setTimeout(r, 500))
  }

  if (messages.length === 0) {
    throw new Error(`No emails found for ${email} in Mailpit`)
  }

  const latest = messages[0]
  const bodyRes = await fetch(`${MAILPIT_URL}/api/v1/message/${latest.ID}`)
  await assertOk(bodyRes, `Mailpit message ${latest.ID}`)
  const body: MailpitMessageDetail = await bodyRes.json()

  const match = body.Text.match(/code:\s*(\d{6,8})/)
  if (!match) {
    throw new Error(`Could not find OTP code in email body: ${body.Text}`)
  }

  return match[1]
}

/**
 * Delete all messages in Mailpit.
 */
export async function clearMailpit(): Promise<void> {
  const res = await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' })
  await assertOk(res, 'Clear Mailpit')
}

/**
 * Delete a Supabase auth user via the admin API.
 */
export async function deleteSupabaseUser(userId: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  })
  await assertOk(res, `Delete user ${userId}`)
}

/**
 * Find a Supabase user by email via admin API.
 */
export async function findUserByEmail(email: string): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  })
  await assertOk(res, 'List users')
  const { users } = await res.json()
  const user = users.find((u: { email: string }) => u.email === email)
  return user?.id ?? null
}

/**
 * Create a confirmed Supabase user (for login tests).
 */
export async function createUser(email: string) {
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, email_confirm: true }),
  })
  await assertOk(userRes, `Create user ${email}`)
  const user = await userRes.json()

  return { userId: user.id as string }
}

/**
 * Cleanup: delete user.
 */
export async function cleanupUser(userId: string): Promise<void> {
  await deleteSupabaseUser(userId)
}
