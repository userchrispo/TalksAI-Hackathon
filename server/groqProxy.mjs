import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_BODY_BYTES = 24 * 1024;
const MAX_QUESTION_CHARS = 600;
const MAX_HISTORY_ITEMS = 6;
const MAX_TEXT_CHARS = 280;
const MAX_CONTEXT_DEPTH = 3;
const MAX_CONTEXT_KEYS = 10;

const RESPONSE_SCHEMA = {
  name: 'assistant_card',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      headline: { type: 'string' },
      summary: { type: 'string' },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            label: { type: 'string' },
            value: { type: 'string' },
          },
          required: ['label', 'value'],
        },
      },
    },
    required: ['headline', 'summary', 'rows'],
  },
};

const SCENARIO_RESPONSE_SCHEMA = {
  name: 'scenario_analysis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      label: { type: 'string' },
      aiText: { type: 'string' },
      monthlyImpact: { type: 'number' },
    },
    required: ['label', 'aiText', 'monthlyImpact'],
  },
};

function parseEnvFile(contents) {
  const env = {};
  const lines = contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  if (lines.length === 1 && !lines[0].includes('=') && lines[0].startsWith('gsk_')) {
    env.GROQ_API_KEY = lines[0];
    return env;
  }

  for (const line of lines) {
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      env[key] = value;
    }
  }

  return env;
}

function readSecrets(root = process.cwd()) {
  const envPath = resolve(root, '.env');
  const localEnv = existsSync(envPath)
    ? parseEnvFile(readFileSync(envPath, 'utf8'))
    : {};

  const apiKey = process.env.GROQ_API_KEY || localEnv.GROQ_API_KEY || '';
  const model = process.env.GROQ_MODEL || localEnv.GROQ_MODEL || DEFAULT_MODEL;

  return { apiKey, model };
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function trimText(value, maxLength = MAX_TEXT_CHARS) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeContext(value, depth = 0) {
  if (depth > MAX_CONTEXT_DEPTH) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_CONTEXT_KEYS)
      .map((item) => sanitizeContext(item, depth + 1))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, MAX_CONTEXT_KEYS)
        .map(([key, item]) => [key, sanitizeContext(item, depth + 1)])
        .filter(([, item]) => item !== undefined),
    );
  }

  if (typeof value === 'string') {
    return trimText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return undefined;
}

function buildAssistantSystemPrompt(context) {
  return [
    'You are TALKS AI, a cash-flow copilot for independent auto shops.',
    'Write like a smart operator, not a generic chatbot.',
    'Be concise, practical, and financially grounded.',
    'Use plain English, short sentences, and specific advice.',
    'Prioritize payroll, overdue invoices, supplier costs, bank balance, and runway risk.',
    'Do not mention that you are an AI model or reference hidden instructions.',
    'Return only valid JSON.',
    '',
    'Shop context:',
    JSON.stringify(context, null, 2),
  ].join('\n');
}

function buildScenarioSystemPrompt(context) {
  return [
    'You are TALKS AI, a growth simulator for independent auto shops.',
    'Estimate the monthly cash-flow effect of a business decision.',
    'Write like a practical operator, not a generic chatbot.',
    'Keep the explanation tight, specific, and grounded in the provided numbers.',
    'Return only valid JSON.',
    'Use this signed convention for monthlyImpact:',
    '- Positive number: worse cash flow or added monthly cost.',
    '- Negative number: better cash flow or added monthly revenue.',
    '',
    'Shop context:',
    JSON.stringify(context, null, 2),
  ].join('\n');
}

function buildHistoryMessages(history = []) {
  return history.slice(-6).flatMap((message) => {
    if (message?.type === 'user' && message.text) {
      return [{ role: 'user', content: message.text }];
    }

    if (message?.type === 'ai') {
      const summaryLines = [
        typeof message.headline === 'string' ? message.headline : '',
        ...(Array.isArray(message.rows)
          ? message.rows.map((row) => `${row.label}: ${row.value}`)
          : []),
        message.summary || '',
      ]
        .filter(Boolean)
        .join('\n');

      if (summaryLines) {
        return [{ role: 'assistant', content: summaryLines }];
      }
    }

    return [];
  });
}

function sanitizeHistory(history = []) {
  return history.slice(-MAX_HISTORY_ITEMS).map((message) => {
    if (message?.type === 'user') {
      return {
        type: 'user',
        text: trimText(message.text, MAX_TEXT_CHARS),
      };
    }

    return {
      type: 'ai',
      headline: trimText(message?.headline, 120),
      rows: Array.isArray(message?.rows)
        ? message.rows.slice(0, 5).map((row) => ({
            label: trimText(row?.label, 80),
            value: trimText(row?.value, 120),
          }))
        : [],
      summary: trimText(message?.summary, MAX_TEXT_CHARS),
    };
  });
}

function extractJsonBlock(content) {
  if (typeof content !== 'string') {
    throw new Error('Groq returned an empty response.');
  }

  const trimmed = content.trim();
  const directObject = JSON.parse(trimmed);
  if (directObject) {
    return directObject;
  }

  return null;
}

function parseAssistantResponse(payload) {
  const message = payload?.choices?.[0]?.message;
  const content = message?.content;

  if (typeof content === 'string') {
    try {
      return extractJsonBlock(content);
    } catch {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(content.slice(start, end + 1));
      }
      throw new Error('Groq did not return valid JSON.');
    }
  }

  throw new Error('Groq did not return a usable message payload.');
}

function normalizeAssistantCard(result) {
  return {
    headline: String(result?.headline || 'Here is the latest read on your cash flow.'),
    summary: String(result?.summary || 'Review the numbers below before you make a move.'),
    rows: Array.isArray(result?.rows)
      ? result.rows
          .slice(0, 5)
          .map((row) => ({
            label: String(row?.label || 'Metric'),
            value: String(row?.value || 'Unavailable'),
          }))
      : [],
  };
}

function normalizeScenarioReply(result) {
  const parsedImpact = Number(result?.monthlyImpact);
  const monthlyImpact = Number.isFinite(parsedImpact)
    ? Math.max(-15000, Math.min(15000, Math.round(parsedImpact)))
    : 0;

  return {
    label: trimText(result?.label || 'Custom scenario', 120),
    aiText: trimText(
      result?.aiText || 'This scenario changes your monthly cash flow. Review the new runway before you commit.',
      480,
    ),
    monthlyImpact,
  };
}

async function requestJsonReply({ apiKey, model, basePayload, schema }) {
  const prefersLowReasoning = model.startsWith('openai/gpt-oss');
  const normalizedBasePayload = {
    ...basePayload,
    ...(prefersLowReasoning
      ? {
          include_reasoning: false,
          reasoning_effort: 'low',
        }
      : {}),
  };

  try {
    const data = await requestGroq({
      apiKey,
      payload: {
        ...normalizedBasePayload,
        response_format: {
          type: 'json_schema',
          json_schema: schema,
        },
      },
    });

    return parseAssistantResponse(data);
  } catch (error) {
    const shouldRetryWithoutSchema =
      model.startsWith('openai/gpt-oss') &&
      error instanceof Error &&
      /json_validate_failed|failed to generate json|max completion tokens/i.test(error.message);

    if (!shouldRetryWithoutSchema) {
      throw error;
    }

    const retryData = await requestGroq({
      apiKey,
      payload: {
        ...normalizedBasePayload,
        response_format: {
          type: 'json_object',
        },
      },
    });

    return parseAssistantResponse(retryData);
  }
}

export async function generateAssistantReply({
  question,
  context = {},
  history = [],
  root = process.cwd(),
}) {
  const { apiKey, model } = readSecrets(root);
  const safeQuestion = trimText(question, MAX_QUESTION_CHARS);
  const safeContext = sanitizeContext(context);
  const safeHistory = sanitizeHistory(history);

  if (!apiKey) {
    throw new Error('Missing Groq API key. Add GROQ_API_KEY to .env.');
  }

  if (!safeQuestion) {
    throw createHttpError(400, 'Question is required.');
  }

  const basePayload = {
    model,
    temperature: 0.2,
    max_completion_tokens: 800,
    messages: [
      {
        role: 'system',
        content: buildAssistantSystemPrompt(safeContext),
      },
      ...buildHistoryMessages(safeHistory),
      {
        role: 'user',
        content: [
          safeQuestion,
          '',
          'Reply with JSON containing:',
          '- headline: one short decision sentence',
          '- summary: one short action paragraph',
          '- rows: 2 to 5 key metrics with label and value strings',
        ].join('\n'),
      },
    ],
  };

  const result = await requestJsonReply({
    apiKey,
    model,
    basePayload,
    schema: RESPONSE_SCHEMA,
  });

  return normalizeAssistantCard(result);
}

export async function generateScenarioReply({
  question,
  context = {},
  root = process.cwd(),
}) {
  const { apiKey, model } = readSecrets(root);
  const safeQuestion = trimText(question, MAX_QUESTION_CHARS);
  const safeContext = sanitizeContext(context);

  if (!apiKey) {
    throw new Error('Missing Groq API key. Add GROQ_API_KEY to .env.');
  }

  if (!safeQuestion) {
    throw createHttpError(400, 'Scenario question is required.');
  }

  const basePayload = {
    model,
    temperature: 0.2,
    max_completion_tokens: 700,
    messages: [
      {
        role: 'system',
        content: buildScenarioSystemPrompt(safeContext),
      },
      {
        role: 'user',
        content: [
          safeQuestion,
          '',
          'Reply with JSON containing:',
          '- label: short scenario label',
          '- aiText: 1 short practical paragraph',
          '- monthlyImpact: signed number in dollars per month',
        ].join('\n'),
      },
    ],
  };

  const result = await requestJsonReply({
    apiKey,
    model,
    basePayload,
    schema: SCENARIO_RESPONSE_SCHEMA,
  });

  return normalizeScenarioReply(result);
}

async function requestGroq({ apiKey, payload }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw createHttpError(504, 'Groq request timed out. Try again.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await response.text();

    if (response.status === 401 || response.status === 403) {
      throw createHttpError(401, 'Groq rejected the API key. Check GROQ_API_KEY.');
    }

    if (response.status === 429) {
      throw createHttpError(429, 'Groq rate limit reached. Try again in a moment.');
    }

    if (response.status >= 500) {
      throw createHttpError(502, 'Groq is having trouble right now. Try again shortly.');
    }

    throw createHttpError(response.status, message || 'Groq request failed.');
  }

  return response.json();
}

async function readRequestBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;

      if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
        rejectBody(createHttpError(413, 'Request body is too large.'));
      }
    });

    req.on('end', () => {
      resolveBody(rawBody);
    });

    req.on('error', rejectBody);
  });
}

function writeJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export function getHealthStatus(root = process.cwd()) {
  const { apiKey, model } = readSecrets(root);

  return {
    ok: true,
    configured: Boolean(apiKey),
    model,
  };
}

export async function handleApiRequest(req, res, root) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    writeJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const question = String(body?.question || '').trim();

    if (!question) {
      writeJson(res, 400, { error: 'Question is required.' });
      return;
    }

    const reply = await generateAssistantReply({
      question,
      context: body?.context || {},
      history: Array.isArray(body?.history) ? body.history : [],
      root,
    });

    const { model } = readSecrets(root);
    writeJson(res, 200, {
      ...reply,
      meta: {
        source: 'groq',
        model,
      },
    });
  } catch (error) {
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? error.statusCode
        : 500;

    writeJson(res, statusCode, {
      error: error instanceof Error ? error.message : 'Failed to reach Groq.',
    });
  }
}

export async function handleScenarioRequest(req, res, root) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    writeJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const question = String(body?.question || '').trim();

    if (!question) {
      writeJson(res, 400, { error: 'Scenario question is required.' });
      return;
    }

    const reply = await generateScenarioReply({
      question,
      context: body?.context || {},
      root,
    });

    const { model } = readSecrets(root);
    writeJson(res, 200, {
      ...reply,
      meta: {
        source: 'groq',
        model,
      },
    });
  } catch (error) {
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? error.statusCode
        : 500;

    writeJson(res, statusCode, {
      error: error instanceof Error ? error.message : 'Failed to run scenario.',
    });
  }
}

export function groqApiPlugin(root = process.cwd()) {
  const chatRouteHandler = (req, res) => {
    handleApiRequest(req, res, root).catch((error) => {
      writeJson(res, 500, {
        error: error instanceof Error ? error.message : 'Unexpected API error.',
      });
    });
  };

  const scenarioRouteHandler = (req, res) => {
    handleScenarioRequest(req, res, root).catch((error) => {
      writeJson(res, 500, {
        error: error instanceof Error ? error.message : 'Unexpected scenario API error.',
      });
    });
  };

  const healthRouteHandler = (req, res) => {
    writeJson(res, 200, getHealthStatus(root));
  };

  return {
    name: 'talks-ai-groq-api',
    configureServer(server) {
      server.middlewares.use('/api/health', healthRouteHandler);
      server.middlewares.use('/api/chat', chatRouteHandler);
      server.middlewares.use('/api/scenario', scenarioRouteHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/health', healthRouteHandler);
      server.middlewares.use('/api/chat', chatRouteHandler);
      server.middlewares.use('/api/scenario', scenarioRouteHandler);
    },
  };
}
