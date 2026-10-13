# CMIST Website

This is the website for Community Men in Sheds Taunton (CMIST). It is made up of three parts that work together:

- **The public website** — what visitors see at https://www.cmist.uk/
- **The CMS (editing screen)** — where content is updated, at https://cmist-cms.netlify.app/
- **Sanity** — the content service where the actual content is stored.

The website and the CMS are both hosted on Netlify, but Netlify is just a generic hosting
provider. Unlike the old Wix site, this is not tied to any one provider: the site is a set of
files that could be hosted anywhere, and the content is stored separately from the website
itself.

There is a small amount of dependency on Sanity, since the content lives in Sanity's system.
However, because the website and the content are kept separate, the website can be pointed at
a different content source in the future without having to rebuild it from scratch. The
content would need to be moved, but the website itself would carry on working.

## How it fits together

1. You log into the CMS and edit content there.
2. You click **Publish**.
3. Sanity sends a notification (a "webhook") to Netlify.
4. Netlify rebuilds the public website and pulls in the newest content.
5. The changes appear on https://www.cmist.uk/ within a few minutes.

## Editing content

The CMS lets you edit two types of content: **Projects** and **Facilities** currently. New content types can
easily be added in future.

### Logging in

1. Go to https://cmist-cms.netlify.app/
2. Sign in with your Sanity account (Google, GitHub, or email). If necessary, request an invite from David (davidnorth@gmail.com)
3. You will see the content types listed on the left-hand side.

### Projects

Each project is a story about work the Shed has done (for example, "Workshop Restoration"). It has four fields:

| Field | What it's for |
| --- | --- |
| **Headline** | The project's title. Required. |
| **URL Slug** | The web address it appears at. This is filled in automatically from the headline. |
| **Body Content** | The main text, written in a rich-text editor. |
| **Featured Images** | One or more photos shown with the project. The first image is used as the cover on the projects list and homepage. |

### Facilities

Each facility describes a workshop, machine, or space available to members. It has four fields:

| Field | What it's for |
| --- | --- |
| **Name** | The facility's name. Required. |
| **URL Slug** | Filled in automatically from the name. |
| **Description** | The main text, written in a rich-text editor. |
| **Photos** | One or more images shown with the facility. The first image is used as the cover on the activities page. |

### Steps for a typical edit

1. Log in to the CMS.
2. Click **Projects** or **Facilities** in the left menu.
3. Click an existing item to edit it, or click **Create new** to add one.
4. Make your changes to the text and images.
5. Click **Publish** to make the change live.

### Adding images

- Images are uploaded and stored in the CMS's media library.
- When you add an image to **Featured Images** or **Photos**, you can browse the media library or upload a new image.
- You can crop the image using the small handles in the editor.
- To change the order, drag an image by its handle — the first image in the list is used as the cover on listing pages.
- Images are served automatically by Sanity, so you don't need to resize them yourself.

## What can't be edited in the CMS

Some pages are written in code rather than stored as content, so they can't be changed in the CMS:

- **Home**
- **About**
- **Partners**
- **Contact**

Changes to those pages, or to the layout, navigation, colours, or styling, need a developer.

## Where the code lives

The code is kept in a Git repository on GitHub: https://github.com/davidnorth/cmist-website

It is currently public and held under a personal account. This means any change to the
website code has to be committed and pushed to that repository before it takes effect.
Netlify builds the site from that repository, so a change isn't live until it has been pushed
there. We can easily move the repository to a different account or organisation in future if needed. CMIST
has complete ownership of the code.

## Code structure

The code is split into two folders, with the content itself stored separately in Sanity (not in this codebase):

| Folder | What it is |
| --- | --- |
| `site/` | The public website: pages, layout, styles, and images. |
| `cms/` | The Sanity Studio: the editing screen and its content structure. |

Inside the site:

- `site/src/` — the pages of the website.
- `site/src/css/` — the stylesheets.
- `site/src/media/images/` — static images used on the site (logo, icons, photos).
- `site/src/_includes/` and `site/src/partials/` — shared layout and reusable page sections.

Inside the CMS:

- `cms/schemaTypes/` — defines the fields for **Project** and **Facility**.

## Other things to know

- **Contact form** — messages from the contact page are handled by a service called Formspree.
- **Map** — the map on the contact page uses OpenStreetMap.

## Technical reference

For anyone doing technical work:

- **Netlify build settings** are in `netlify.toml` at the project root. It builds from the `site/` folder and publishes the `_site` output.
- **Code repository** — https://github.com/davidnorth/cmist-website (Git). Netlify builds the site from this repository.
- **Sanity** project ID is `ah6pphsm`, dataset `production`.
- The webhook that triggers a rebuild on content changes is configured in the Sanity dashboard, not in the code.
- Code changes go live when they are committed and pushed to GitHub. There is currently no automatic hook from GitHub to Netlify, so a rebuild is triggered manually in the Netlify dashboard (or a Netlify build hook could be added to the GitHub repository).

Commands (run from the relevant folder):

```bash
cd site
npm run build    # fetch content from Sanity, then build the static site
npm start        # run the site locally with live Sanity updates

cd cms
yarn dev         # run the Sanity Studio locally
```
