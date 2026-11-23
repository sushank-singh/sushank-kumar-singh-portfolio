import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const publicRoot = join(root, 'public');
const port = Number(process.env.PORT || 3000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};
const pageRoutes = {
  '/about': 'about.html',
  '/game': 'game.html',
  '/scouting': 'scouting.html',
  '/academics': 'academics.html',
  '/achievements': 'achievements.html',
  '/film': 'film.html',
  '/media': 'media.html',
  '/contact': 'contact.html',
};

const server = createServer(async (req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = normalize(requestPath).replace(/^([.][.][/\\])+/, '');
  const relativePath = pageRoutes[safePath] || (safePath === '/' ? 'index.html' : safePath.replace(/^[/\\]+/, ''));
  const requested = join(root, relativePath);
  const publicRequested = join(publicRoot, relativePath);
  try {
    const candidate = await stat(requested).then(() => requested).catch(() => publicRequested);
    const info = await stat(candidate);
    if (info.isDirectory()) throw new Error('directory');
    const content = await readFile(candidate);
    res.writeHead(200, { 'Content-Type': types[extname(candidate)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch {
    if (!extname(requestPath)) {
      const content = await readFile(join(root, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  }
});

server.listen(port, '0.0.0.0', () => console.log(`CourtCode listening on ${port}`));
