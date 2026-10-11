import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../website/dist');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security check: avoid directory traversal
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // 1. Try direct file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }

  // 2. Try with .html extension (clean URLs like /privacy, /terms)
  let htmlPath = filePath + '.html';
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    return sendFile(res, htmlPath);
  }

  // 3. Try directory index (e.g. / -> /index.html)
  let indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
    return sendFile(res, indexPath);
  }

  // 4. Fallback: 404.html
  const notFoundPath = path.join(DIST_DIR, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(notFoundPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, HOST, () => {
  console.log(`Community website dev server running at http://${HOST}:${PORT}`);
});
