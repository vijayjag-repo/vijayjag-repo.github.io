# vijayjag-repo.github.io

My personal site: https://vijayjag-repo.github.io/

Plain static HTML/CSS/JS — no build step, no framework, deployed as-is by GitHub Pages.

## Structure

- `index.html` — the whole page (hero, about, experience, skills, contact)
- `assets/css/main.css` — all styling and the design tokens (`:root` at the top)
- `assets/js/main.js` — nav scroll-spy and reveal-on-scroll, no dependencies

## Editing

- **Add a role**: copy a `<li class="role">` block in the experience section.
- **Add projects**: there's a commented-out `<section id="projects">` template at the
  bottom of `index.html` — uncomment it, edit the entries, and add a matching nav
  link in the header.
- **Replace role descriptions**: the current one-liners are intentionally generic
  (stealth work is under NDA). Swap in real bullets when you're ready.
- **Swap the photo**: `assets/img/avatar-punk.png` is the pixel-art avatar
  (regenerate it from `assets/img/profile.jpg` — 24×24 quantize, punk-blue
  `#638596` background, NEAREST upscale). `avatar-64.png` is the favicon;
  `avatar.jpg`/`profile.jpg` are the original photo.
- **Theme**: dark is the default; a toggle in the nav switches to the light
  theme and persists via `localStorage`. First visit follows the OS setting.
  Both palettes are tokens at the top of `main.css`.
- **Tune the palette**: every color is a token in `:root` of `main.css`.
- **Preview locally**: `python3 -m http.server 8000` from the repo root, then open
  `http://localhost:8000`.

Push to `main` and GitHub Pages redeploys automatically.
