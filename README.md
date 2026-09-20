# Portfolio: Aritro Banerjee

Live URL: https://aritrobanerjee.github.io/

A minimalist, high-density, dark-mode portfolio and writing theme built with React 18, TypeScript, Tailwind CSS, and Vite. Designed to be completely data-driven and easily forkable as a personal portfolio theme.

---

## Forking as a Theme

Want to use this design for your own website? See the [Theme Customization Guide](./THEME_SETUP.md) for 5-minute setup instructions and starter templates.

---

## Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Typography**: Geist, Geist Mono, Inter
- **Markdown & Writing**: react-markdown + remark-gfm
- **Deployment**: GitHub Pages via GitHub Actions
- **Analytics**: Cloudflare Web Analytics (SPA mode) + GraphQL CLI reporter

---

## Architecture & Data Flow

- `src/data/profile.json` - Single source of truth for resume experience, competencies, education, and contact links
- `src/data/profile.example.json` - Starter template for theme forkers
- `src/data/projects.tsx` - Central project and essay registry with pixel icons and markdown imports
- `src/content/essays/` - Markdown long-form essays and case studies
- `src/components/Header.tsx` - Dynamic header with monochrome avatar and glowing status LED
- `src/components/WritingSection.tsx` - Dynamic project grid mapping over `projects.tsx`
- `src/components/Experience.tsx` - Nested company timeline with expandable role achievements
- `src/components/Focus.tsx` - High-density competency cards
- `src/components/Education.tsx` - Academic degrees and collapsible honors
- `src/components/Connect.tsx` - Configurable footer with one-click email copy
- `src/components/EssayReader.tsx` - Reader view with reading progress bar and keyboard shortcuts (`esc`, `t`)
- `src/components/CardDeckBackground.tsx` - High-density interactive flipping canvas
- `scripts/postbuild.js` - Auto-discovers essays and generates direct HTTP 200 routes for GitHub Pages

---

## Commands

```bash
# Start local Vite development server
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview

# Pull Cloudflare Web Analytics via GraphQL
npm run analytics
```
