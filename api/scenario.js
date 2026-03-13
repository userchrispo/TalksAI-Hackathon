import { cwd } from 'node:process';
import { handleScenarioRequest } from '../server/groqProxy.mjs';

export default async function handler(req, res) {
  return handleScenarioRequest(req, res, cwd());
}
