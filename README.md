# vijayjag-repo.github.io

My personal site: https://vijayjag-repo.github.io/

Plain static HTML/CSS/JS — no build step, no framework, deployed as-is by GitHub Pages.

## Structure

- `index.html` — the whole page (hero, about, experience, skills, projects)
- `assets/css/main.css` — all styling and the design tokens (`:root` at the top)
- `assets/js/main.js` — nav scroll-spy and reveal-on-scroll, no dependencies

## Editing

- **Add a role**: copy a `<li class="timeline__item">` block in the experience section.
- **Add a project**: copy an `<article class="project-card">` block in the projects section.
- **Preview locally**: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`.

Push to `main` and GitHub Pages redeploys automatically.
