# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General
The project is a charity site for a local Community Men In Sheds
Eleventy frontend with a Sanity CMS backend.

data types:
@cms/schemaTypes/project.js
@cms/schemaTypes/facility.js
@cms/schemaTypes/partner.js
@cms/schemaTypes/event.js

## Repository structure

Two independent sub-projects:

- `site/` — Eleventy 3.x static site (Nunjucks templates)
- `cms/` — Sanity Studio v5 (content management UI)

All commands below should be run from within their respective subdirectory.

## Commands

### Site (`cd site/`)

```bash
npm start        # eleventy --serve + sanity-watch (live reload with Sanity data)
npm run build    # fetch Sanity data then build static output to public/
```

There are no tests or linting configured.

### CMS (`cd cms/`)

```bash
yarn dev         # run Sanity Studio locally
yarn build       # build studio for deployment
yarn deploy      # deploy studio to Sanity-hosted URL
```

## Site architecture

**Data flow**: At build time, `scripts/sanity-fetch.js` queries Sanity via GROQ and writes `src/_data/projects.json`, `facilities.json`, `partners.json` and the event files (`events.json`, `upcomingEvents.json`, `pastEvents.json`). Eleventy reads that JSON as global data — no JS data files. In dev, `scripts/sanity-watch.js` opens a real-time Sanity listener and rewrites the JSON on every content change, which triggers Eleventy's file watcher to rebuild.

**Events** are split at fetch time into upcoming (ascending) and past (descending), using the `Europe/London` calendar day. An event counts as upcoming for the whole of its start day. The split is build-time only, so an event moves to Past when the site is next rebuilt.

**CSS**: All stylesheets live in `src/css/` and are concatenated into a single `bundle.css` via `src/bundle.njk` (a Nunjucks template with `permalink: bundle.css`). There is no CSS preprocessor or bundler — utility classes are defined in `src/css/utility.css` using custom breakpoint prefixes (`md:grid-cols-3`, `lg:flex`).

**Templates**: Nunjucks. `src/_includes/base.njk` is the shell layout (header, footer, nav). Pages extend it via frontmatter `layout: "base.njk"`. Partials are in `src/partials/`.

**Per-content-type pages**: Individual project, facility and event pages are generated from `src/projects/project.njk`, `src/activities/activity.njk` and `src/events/event.njk` using Eleventy pagination (`pagination.data: ..., size: 1`), one page per Sanity document. The events index (`src/events.njk`) lists upcoming events, while `src/events/past.njk` paginates past events nine per page.

## Sanity schema

Sanity project ID: `ah6pphsm`, dataset: `production`.

Current schema types (in `cms/schemaTypes/`):
- `project` — title, slug (from title), content (portable text / rich text), images (sortable image gallery, with hotspot)
- `facility` — title, slug (from title), content (portable text / rich text), images (sortable image gallery, with hotspot)
- `partner` — title, content (portable text / rich text), images (sortable image gallery, with hotspot)
- `event` — title, slug (from title), startsAt (required datetime), content (portable text / rich text), images (sortable image gallery, with hotspot)

Rich text (`content` field) is converted to HTML in `scripts/sanity-fetch.js` using `@portabletext/to-html` and stored as `contentHtml` alongside the raw blocks.

**Images** are served directly from the Sanity CDN. `scripts/sanity-fetch.js` flattens each document's `images` array to `[{ _key, url }]` in the editor-defined order (images without an asset are dropped), and listing pages use the first image as the cover. Append `?w=600&auto=format` (or similar) to an image `url` for automatic resizing and format optimisation.

## Environment variables

`SANITY_READ_TOKEN` — optional Sanity API token. Only required if the dataset is set to private in the Sanity dashboard. Not currently needed.
