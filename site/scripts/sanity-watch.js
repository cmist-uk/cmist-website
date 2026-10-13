const { createClient } = require('@sanity/client')
const { fetchAndWrite } = require('./sanity-fetch')

const client = createClient({
  projectId: 'ah6pphsm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN,
})

fetchAndWrite()

console.log('[sanity] Listening for changes...')

const subscription = client.listen('*[_type in ["project", "facility", "partner"]]').subscribe(event => {
  console.log(`[sanity] ${event.type} — "${event.result?.title ?? event.documentId}"`)
  fetchAndWrite().catch(console.error)
})

process.on('SIGINT', () => {
  subscription.unsubscribe()
  process.exit(0)
})
