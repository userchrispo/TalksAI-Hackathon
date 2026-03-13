import { cwd } from 'node:process';
import { handleApiRequest } from '../server/groqProxy.mjs';

export default async function handler(req, res) {
  return handleApiRequest(req, res, cwd());
}
