# Theme Customization & Forking Guide

This repository is designed to be forked and customized in minutes as a high-performance, dark-mode, minimalist personal portfolio and writing theme.

---

## 5-Minute Quick Start

### 1. Profile and Career Data
All personal details, employment history, competencies, and education are centralized in a single JSON file:
- File: [`src/data/profile.json`](./src/data/profile.json)
- Template: [`src/data/profile.example.json`](./src/data/profile.example.json)

Edit `src/data/profile.json` with your own details:
- **`name`**: Your full name (automatically updates header, copyright, and metadata).
- **`title`**: Your role or designation (e.g., "Staff Software Engineer").
- **`company`**: Your current organization or affiliation.
- **`location`**: Displayed on the glowing status badge (e.g., "San Francisco, CA").
- **`bio`**: Your executive introduction summary.
- **`experience`**: Array of companies, dates, roles, high-impact summaries, and expandable bullet points.
- **`focus`**: Core competencies rendered as high-density tactile cards.
- **`education`**: Degrees, GPAs, and collapsible achievement honors.
- **`links`**: Contact links (LinkedIn, GitHub, email with one-click copy button).

### 2. Avatar Photo
- Replace [`public/avatar.jpg`](./public/avatar.jpg) with your own profile image.
- The theme automatically applies a subtle monochrome grayscale treatment with brightness and contrast tuning.

### 3. Adding Projects and Essays
Projects and essays are fully modular:
1. Create a markdown file in [`src/content/essays/`](./src/content/essays/) (e.g., `my-project.md`).
2. Register it in [`src/data/projects.tsx`](./src/data/projects.tsx):
   ```tsx
   import myMarkdown from '../content/essays/my-project.md?raw';

   export const projects: ProjectItem[] = [
     {
       id: 'my-project',
       slug: 'my-project',
       title: 'My Project Title',
       tag: 'NEW', // Optional pill tag (e.g., 'WIP', 'ESSAY')
       markdown: myMarkdown,
       icon: (
         <svg viewBox="0 0 10 10" className="w-full h-full fill-current">
           <rect x="2" y="2" width="6" height="6" />
         </svg>
       ),
     },
     // ...
   ];
   ```
3. That is it:
   - It appears in the Projects section on the homepage.
   - It routes automatically to `/writing/my-project`.
   - The build script automatically outputs static folders for direct HTTP 200 routing on GitHub Pages.

### 4. SEO & Meta Tags
Update your name, title, and social links in [`index.html`](./index.html):
- `<title>` and `<meta name="description">`
- Open Graph tags (`og:title`, `og:description`, `og:url`)
- Structured Data (`application/ld+json`)

### 5. Web Analytics (Optional)
Cloudflare Web Analytics is pre-configured with SPA support in [`index.html`](./index.html). To track your own traffic:
1. Create a free site tag in Cloudflare Web Analytics.
2. Replace the token in `index.html`:
   ```html
   <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "YOUR_TOKEN_HERE", "spa": true}'></script>
   ```

---

## Architecture Overview

```text
src/
├── types/
│   ├── profile.ts          # Typed schema with JSDoc comments
│   └── project.ts          # ProjectItem definition
├── data/
│   ├── profile.json        # Single source of truth for resume & bio
│   ├── profile.example.json# Clean starter template for forkers
│   └── projects.tsx        # Central project/essay registry
├── content/
│   └── essays/             # Markdown content files (.md)
├── components/
│   ├── Header.tsx          # Dynamic avatar and glowing status badge
│   ├── WritingSection.tsx  # Dynamic project grid
│   ├── Experience.tsx      # Timeline with expandable bullet points
│   ├── Focus.tsx           # Tactile competency cards
│   ├── Education.tsx       # Degree list with collapsible honors
│   ├── Connect.tsx         # Footer with one-click email copy & copyright
│   ├── EssayReader.tsx     # Markdown reader with progress bar & keyboard shortcuts
│   └── CardDeckBackground.tsx # High-density interactive flipping canvas
└── scripts/
    ├── postbuild.js        # Discovers essays and outputs GitHub Pages static routes
    └── fetch-analytics.js  # CLI analytics reporter
```

---

## Build & Deployment

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```

### GitHub Pages Deployment
A GitHub Actions workflow is included in `.github/workflows/deploy.yml` that builds and deploys to GitHub Pages automatically whenever you push to `main`.
