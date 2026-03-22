import { PgBoss } from 'pg-boss'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

async function main() {
  const boss = new PgBoss(DATABASE_URL!)
  boss.on('error', console.error)

  await boss.start()
  console.log('[worker] pg-boss started')

  // ─── Register your job queues here ───
  //
  // Example:
  //
  // await boss.createQueue('my_job', {
  //   retryLimit: 3,
  //   retryDelay: 10,
  //   retryBackoff: true,
  // })
  //
  // await boss.work('my_job', async ([job]) => {
  //   console.log(`[worker] my_job ${job.id}`)
  //   await handleMyJob(job.data)
  // })

  console.log('[worker] listening for jobs...')

  process.on('SIGTERM', async () => {
    console.log('[worker] shutting down...')
    await boss.stop({ graceful: true, timeout: 30000 })
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('[worker] shutting down...')
    await boss.stop({ graceful: true, timeout: 30000 })
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('[worker] fatal error:', err)
  process.exit(1)
})
