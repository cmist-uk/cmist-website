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
const eventsFile = path.join(__dirname, '../src/_data/events.json')
const upcomingEventsFile = path.join(__dirname, '../src/_data/upcomingEvents.json')
const pastEventsFile = path.join(__dirname, '../src/_data/pastEvents.json')

const timeZone = 'Europe/London'

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone,
})
const dayFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone })
const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone })
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone,
})

// ISO date key (YYYY-MM-DD) for a given instant, in the site's timezone.
function dateKey(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(date)
  const part = type => parts.find(item => item.type === type).value
  return `${part('year')}-${part('month')}-${part('day')}`
}

async function fetchAndWrite() {
  const [projects, facilities, partners, events] = await Promise.all([
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
    client.fetch(`
      *[_type == "event" && defined(startsAt) && defined(slug.current)] | order(startsAt asc) {
        title,
        "slug": slug.current,
        startsAt,
        content,
        "file": file {
          "url": asset->url,
          "originalFilename": asset->originalFilename
        },
        "images": images[]{ "_key": _key, "url": asset->url }
      }
    `),
  ])

  const normalise = doc => {
    const normalised = {
      ...doc,
      // Images are stored in editor-defined order; the first is the cover image.
      images: (doc.images ?? []).filter(image => image.url),
      contentHtml: doc.content ? toHTML(doc.content) : '',
    }

    if (doc.file) {
      normalised.file = doc.file.url
        ? {
            url: doc.file.url,
            filename: doc.file.originalFilename || decodeURIComponent(doc.file.url.split('/').pop()),
          }
        : null
    }

    return normalised
  }

  const projectData = projects.map(normalise)
  fs.writeFileSync(projectsFile, JSON.stringify(projectData, null, 2))
  console.log(`[sanity] fetched ${projectData.length} project(s)`)

  const facilityData = facilities.map(normalise)
  fs.writeFileSync(facilitiesFile, JSON.stringify(facilityData, null, 2))
  console.log(`[sanity] fetched ${facilityData.length} facilit(ies)`)

  const partnerData = partners.map(normalise)
  fs.writeFileSync(partnersFile, JSON.stringify(partnerData, null, 2))
  console.log(`[sanity] fetched ${partnerData.length} partner(s)`)

  const today = dateKey(new Date())
  const eventData = events
    .filter(event => !Number.isNaN(Date.parse(event.startsAt)))
    .map(event => {
      const start = new Date(event.startsAt)
      return {
        ...normalise(event),
        startsAt: start.toISOString(),
        dateLabel: longDateFormatter.format(start),
        dayLabel: dayFormatter.format(start),
        monthLabel: monthFormatter.format(start),
        timeLabel: timeFormatter.format(start),
        // An event stays "upcoming" for the whole of its calendar day.
        isUpcoming: dateKey(start) >= today,
      }
    })

  const upcomingEvents = eventData
    .filter(event => event.isUpcoming)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  const pastEvents = eventData
    .filter(event => !event.isUpcoming)
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))

  // All events, for the individual detail pages.
  fs.writeFileSync(eventsFile, JSON.stringify(eventData, null, 2))
  fs.writeFileSync(upcomingEventsFile, JSON.stringify(upcomingEvents, null, 2))
  fs.writeFileSync(pastEventsFile, JSON.stringify(pastEvents, null, 2))
  console.log(
    `[sanity] fetched ${eventData.length} event(s) — ${upcomingEvents.length} upcoming, ${pastEvents.length} past`
  )
}

module.exports = { fetchAndWrite }

if (require.main === module) {
  fetchAndWrite().catch(err => { console.error(err); process.exit(1) })
}
