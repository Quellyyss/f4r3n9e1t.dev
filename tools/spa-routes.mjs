// GitHub Pages has no SPA rewrites: give every client route its own index.html
// so direct links (/work/<slug>, /viewport) answer 200 instead of the 404 fallback.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'

const config = readFileSync('src/config/site.config.ts', 'utf8')
const slugs = [...config.matchAll(/^\s+slug: '([^']+)'/gm)].map((m) => m[1])
const routes = [...slugs.map((s) => `work/${s}`), 'viewport']
for (const r of routes) {
  mkdirSync(`dist/${r}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${r}/index.html`)
}
copyFileSync('dist/index.html', 'dist/404.html')
console.log(`spa-routes: ${routes.length} routes + 404.html`)
