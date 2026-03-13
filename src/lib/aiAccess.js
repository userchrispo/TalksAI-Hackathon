export const ACCESS_MODES = {
  demo: 'demo',
  auth: 'auth',
};

export const PROMPT_KINDS = {
  suggested: 'suggested',
  custom: 'custom',
};

export const DEMO_ASSISTANT_LIMIT_MESSAGE =
  'Demo mode: try one of the suggested prompts. Sign in for full AI assistant access.';

export const DEMO_SIMULATOR_LIMIT_MESSAGE =
  'Demo mode: try one of the suggested scenarios. Sign in for full AI simulator access.';

export const DEMO_ASSISTANT_PROMPTS = [
  { id: 'payroll-next-friday', text: 'Can I make payroll next Friday?' },
  { id: 'owed-money-now', text: 'Who owes me money right now?' },
  { id: 'hire-junior-tech', text: 'Can I afford to hire a junior tech?' },
  { id: 'sales-drop-twenty', text: 'What happens if sales drop 20%?' },
  { id: 'chase-invoices-before-parts', text: 'Which invoices should I chase before ordering parts?' },
  { id: 'alignment-machine-this-month', text: 'Can I afford a new alignment machine this month?' },
  { id: 'raise-brake-pricing', text: 'Should I raise brake service pricing after the supplier increase?' },
  { id: 'cash-buffer-for-parts', text: 'How much cash should I keep before ordering parts for next week?' },
  { id: 'insurance-payout-delay', text: 'Will delayed insurance payouts squeeze us this month?' },
];

export const DEMO_SIMULATOR_PROMPTS = [
  { id: 'hire-technician', text: 'What if I hire another technician?' },
  { id: 'raise-prices-ten', text: 'What if I raise prices by 10%?' },
  { id: 'biggest-client-stops-paying', text: 'What if my biggest client stops paying?' },
  { id: 'buy-lift-fifteen', text: 'What if I buy a $15,000 lift?' },
  { id: 'parts-cost-rise-eight', text: 'What if parts costs rise another 8%?' },
  { id: 'insurance-claims-delayed', text: 'What if insurance claim payments are delayed by 2 weeks?' },
  { id: 'second-lift-and-tech', text: 'What if I buy a second lift and hire another technician?' },
];

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getAccessModeFlags(accessMode) {
  const normalized =
    accessMode === ACCESS_MODES.demo
      ? ACCESS_MODES.demo
      : accessMode === ACCESS_MODES.auth
        ? ACCESS_MODES.auth
        : null;

  return {
    accessMode: normalized,
    isDemoMode: normalized === ACCESS_MODES.demo,
    hasFullAiAccess: normalized === ACCESS_MODES.auth,
  };
}

function isAllowedDemoPrompt(catalog, promptKind, promptId, question) {
  if (promptKind !== PROMPT_KINDS.suggested) {
    return false;
  }

  const matchedPrompt = catalog.find((prompt) => prompt.id === promptId);
  if (!matchedPrompt) {
    return false;
  }

  return normalizeText(matchedPrompt.text) === normalizeText(question);
}

export function isAllowedDemoAssistantPrompt({ promptKind, promptId, question }) {
  return isAllowedDemoPrompt(DEMO_ASSISTANT_PROMPTS, promptKind, promptId, question);
}

export function isAllowedDemoScenarioPrompt({ promptKind, promptId, question }) {
  return isAllowedDemoPrompt(DEMO_SIMULATOR_PROMPTS, promptKind, promptId, question);
}
