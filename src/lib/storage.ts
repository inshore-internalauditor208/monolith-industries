import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function getSignedUrl(bucket: string, key: string, expiresIn = 3600) {
  const supabase = getServiceClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(key, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function getSignedUrls(
  bucket: string,
  keys: string[],
  expiresIn = 3600,
): Promise<Record<string, string>> {
  const supabase = getServiceClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(keys, expiresIn)
  if (error) throw error

  const urlMap: Record<string, string> = {}
  for (const item of data) {
    if (item.signedUrl) {
      urlMap[item.path!] = item.signedUrl
    }
  }
  return urlMap
}

export async function createSignedUploadUrl(bucket: string, key: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(key)
  if (error) throw error
  return data
}

export async function deleteStorageObject(bucket: string, keys: string[]) {
  const supabase = getServiceClient()
  const { error } = await supabase.storage.from(bucket).remove(keys)
  if (error) throw error
}
