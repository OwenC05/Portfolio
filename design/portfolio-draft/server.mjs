import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const packageRoots = Object.fromEntries(['core', 'web'].map((name) => [name, resolve(root, `node_modules/@ui-sdk/${name}`)]));
const imports = {};
const scopes = {};
const defaultTarget = (target) => typeof target === 'string' ? target : target?.default ? defaultTarget(target.default) : undefined;
for (const [name, directory] of Object.entries(packageRoots)) {
  const manifest = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
  for (const [entry, target] of Object.entries(manifest.exports)) {
    const file = defaultTarget(target);
    if (file?.endsWith('.js')) {
      imports[`@ui-sdk/${name}${entry === '.' ? '' : entry.slice(1)}`] = `/packages/${name}/${file.slice(2)}`;
    }
  }
  if (manifest.imports) {
    scopes[`/packages/${name}/`] = Object.fromEntries(Object.entries(manifest.imports).map(([entry, target]) => [entry, `/packages/${name}/${defaultTarget(target).slice(2)}`]));
  }
}
const publicFiles = new Set(['index.html', 'styles.css', 'app.mjs', 'browser-tests.mjs']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8' };
const port = Number(process.env.PORT || 4174);

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') {
      response.writeHead(204).end();
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    let filename;
    if (relative.startsWith('packages/')) {
      const [, name, ...segments] = relative.split('/');
      const directory = packageRoots[name];
      if (!directory) {
        response.writeHead(404).end();
        return;
      }
      filename = resolve(directory, segments.join('/'));
      if (!filename.startsWith(directory + sep)) {
        response.writeHead(403).end();
        return;
      }
    } else if (publicFiles.has(relative)) {
      filename = resolve(root, relative);
    } else {
      response.writeHead(404).end('Not found');
      return;
    }
    let body = await readFile(filename);
    if (relative === 'index.html') {
      body = body.toString().replace('<head>', `<head>\n<script type="importmap">${JSON.stringify({ imports, scopes })}</script>`);
    }
    response.writeHead(200, {
      'Content-Type': types[extname(filename)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 400).end('Unable to load this file');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Portfolio draft: http://127.0.0.1:${port}`));
