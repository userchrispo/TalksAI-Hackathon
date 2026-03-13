import { cwd } from 'node:process';
import { getHealthStatus } from '../server/groqProxy.mjs';

export default function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const accessMode = (() => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      return url.searchParams.get('accessMode') || undefined;
    } catch {
      return undefined;
    }
  })();

  res.end(JSON.stringify(getHealthStatus(cwd(), accessMode)));
}
