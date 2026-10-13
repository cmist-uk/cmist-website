const { createClient } = require('@sanity/client')
const { toHTML } = require('@portabletext/to-html')
const fs = require('fs')
const path = require('path')

const client = createClient({
  projectId: 'ah6pphsm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN,
})

const projectsFile = path.join(__dirname, '../src/_data/projects.json')
const facilitiesFile = path.join(__dirname, '../src/_data/facilities.json')
const partnersFile = path.join(__dirname, '../src/_data/partners.json')

async function fetchAndWrite() {
  const [projects, facilities, partners] = await Promise.all([
    client.fetch(`
      *[_type == "project"] | order(_createdAt desc) {
        title,
        "slug": slug.current,
        content,
        "images": images[]{ "_key": _key, "url": asset->url }
      }
    `),
    client.fetch(`
      *[_type == "facility"] | order(_createdAt asc) {
        title,
        "slug": slug.current,
        content,
        "images": images[]{ "_key": _key, "url": asset->url }
      }
    `),
    client.fetch(`
      *[_type == "partner"] | order(_createdAt asc) {
        title,
        content,
        "images": images[]{ "_key": _key, "url": asset->url }
      }
    `),
  ])

  const normalise = doc => ({
    ...doc,
    // Images are stored in editor-defined order; the first is the cover image.
    images: (doc.images ?? []).filter(image => image.url),
    contentHtml: doc.content ? toHTML(doc.content) : '',
  })

  const projectData = projects.map(normalise)
  fs.writeFileSync(projectsFile, JSON.stringify(projectData, null, 2))
  console.log(`[sanity] fetched ${projectData.length} project(s)`)

  const facilityData = facilities.map(normalise)
  fs.writeFileSync(facilitiesFile, JSON.stringify(facilityData, null, 2))
  console.log(`[sanity] fetched ${facilityData.length} facilit(ies)`)

  const partnerData = partners.map(normalise)
  fs.writeFileSync(partnersFile, JSON.stringify(partnerData, null, 2))
  console.log(`[sanity] fetched ${partnerData.length} partner(s)`)
}

module.exports = { fetchAndWrite }

if (require.main === module) {
  fetchAndWrite().catch(err => { console.error(err); process.exit(1) })
}
