const scenarioPresets = {
  'simulate-runway-pressure': {
    id: 'simulate-runway-pressure',
    label: 'Payroll runway pressure - next Friday',
    question: 'What if collections slip before next Friday payroll?',
    summary:
      'A tighter collections week before payroll removes about $3,000 per month of near-term cash cushion. It is the fastest way to pressure-test the buffer around payroll.',
    monthlyImpact: 3000,
  },
  'simulate-hire': {
    id: 'simulate-hire',
    label: 'New hire - full-time technician',
    question: 'What if I hire another technician?',
    summary:
      'Hiring another technician adds roughly $4,500 per month in salary and benefits. It compresses the fall runway unless collections improve at the same time.',
    monthlyImpact: 4500,
  },
  'simulate-price-increase': {
    id: 'simulate-price-increase',
    label: 'Price increase - 10% across services',
    question: 'What if I raise prices by 10%?',
    summary:
      'A 10% price increase adds about $2,800 per month in revenue at the current volume. It is one of the cleaner upside moves in this demo.',
    monthlyImpact: -2800,
  },
  'simulate-sales-drop': {
    id: 'simulate-sales-drop',
    label: 'Sales drop - 20%',
    question: 'What happens if sales drop 20%?',
    summary:
      'A 20% sales drop removes roughly $5,600 per month in revenue. That is enough to shrink the reserve quickly unless collections tighten at the same time.',
    monthlyImpact: 5600,
  },
  'simulate-client-loss': {
    id: 'simulate-client-loss',
    label: 'Client loss - largest account',
    question: 'What if my biggest client stops paying?',
    summary:
      'Losing the biggest client removes roughly $6,000 per month in revenue. That is the sharpest downside case in the current book of business.',
    monthlyImpact: 6000,
  },
  'simulate-parts-cost-rise': {
    id: 'simulate-parts-cost-rise',
    label: 'Parts cost increase - another 8%',
    question: 'What if parts costs rise another 8%?',
    summary:
      'Another 8% jump in parts costs would cut monthly cash contribution by roughly $1,600 unless pricing moves quickly with it.',
    monthlyImpact: 1600,
  },
  'simulate-insurance-delay': {
    id: 'simulate-insurance-delay',
    label: 'Insurance payouts delayed - 2 weeks',
    question: 'What if insurance claim payments are delayed by 2 weeks?',
    summary:
      'A two-week delay in insurance claim payouts would tighten short-term cash by about $2,800 per month equivalent until collections catch up.',
    monthlyImpact: 2800,
  },
  'simulate-equipment-purchase': {
    id: 'simulate-equipment-purchase',
    label: 'Equipment purchase - $15,000 financed',
    question: 'Can I afford a new alignment machine this month?',
    summary:
      'A $15,000 equipment purchase financed over 6 months adds about $2,500 per month. The forecast stays above the target minimum, but only narrowly.',
    monthlyImpact: 2500,
  },
  'simulate-second-lift-and-tech': {
    id: 'simulate-second-lift-and-tech',
    label: 'Second lift + technician expansion',
    question: 'What if I buy a second lift and hire another technician?',
    summary:
      'A second lift plus another technician adds roughly $7,000 per month before the extra capacity pays back. It is the most aggressive growth case in the demo.',
    monthlyImpact: 7000,
  },
  'stabilize-cash': {
    id: 'stabilize-cash',
    label: 'Collections sprint + spend freeze',
    question: 'What if I tighten collections and freeze optional spend for 30 days?',
    summary:
      'Pulling in receivables faster and trimming small discretionary costs protects the safety floor by adding about $1,200 of monthly breathing room.',
    monthlyImpact: -1200,
  },
};

const scenarioActionAliases = {
  'simulate-revenue-dip': 'simulate-sales-drop',
  'simulate-revenue-lift': 'simulate-price-increase',
};

const assistantPromptScenarioActions = {
  'payroll-next-friday': 'simulate-runway-pressure',
  'hire-junior-tech': 'simulate-hire',
  'sales-drop-twenty': 'simulate-sales-drop',
  'alignment-machine-this-month': 'simulate-equipment-purchase',
  'raise-brake-pricing': 'simulate-price-increase',
  'cash-buffer-for-parts': 'simulate-runway-pressure',
  'insurance-payout-delay': 'simulate-insurance-delay',
};

const simulatorPromptScenarioActions = {
  'hire-technician': 'simulate-hire',
  'raise-prices-ten': 'simulate-price-increase',
  'biggest-client-stops-paying': 'simulate-client-loss',
  'buy-lift-fifteen': 'simulate-equipment-purchase',
  'parts-cost-rise-eight': 'simulate-parts-cost-rise',
  'insurance-claims-delayed': 'simulate-insurance-delay',
  'second-lift-and-tech': 'simulate-second-lift-and-tech',
};

const scenarioActionLabels = {
  'simulate-runway-pressure': 'Pressure-test the runway',
  'simulate-hire': 'Apply hiring scenario',
  'simulate-price-increase': 'Test pricing scenario',
  'simulate-sales-drop': 'Stress-test sales drop',
  'simulate-client-loss': 'Stress-test client loss',
  'simulate-parts-cost-rise': 'Stress-test supplier costs',
  'simulate-insurance-delay': 'Stress-test payout delay',
  'simulate-equipment-purchase': 'Test equipment scenario',
  'simulate-second-lift-and-tech': 'Stress-test expansion plan',
  'stabilize-cash': 'Apply buffer plan',
};

function resolvePromptScenarioAction(promptId, promptCatalog) {
  if (!promptId) {
    return null;
  }

  if (promptCatalog === 'simulator') {
    return simulatorPromptScenarioActions[promptId] || null;
  }

  return assistantPromptScenarioActions[promptId] || null;
}

export function resolveScenarioActionId(actionId) {
  return scenarioActionAliases[actionId] || actionId;
}

export function getScenarioPreset(actionId) {
  return scenarioPresets[resolveScenarioActionId(actionId)] || null;
}

export function getScenarioActionLabel(actionId) {
  return scenarioActionLabels[resolveScenarioActionId(actionId)] || 'Run in simulator';
}

export function findScenarioActionForQuestion(question, promptId = null, promptCatalog = 'assistant') {
  const promptMatch = resolvePromptScenarioAction(promptId, promptCatalog);
  if (promptMatch) {
    return promptMatch;
  }

  const lower = String(question || '').toLowerCase();

  if (!lower.trim()) {
    return null;
  }

  if (/(lift|equipment|machine|alignment)/.test(lower) && /(hire|technician|tech|employee|staff)/.test(lower)) {
    return 'simulate-second-lift-and-tech';
  }

  if (/(hire|technician|tech|employee|staff)/.test(lower)) {
    return 'simulate-hire';
  }

  if (/(alignment|machine|lift|equipment|tooling|service line)/.test(lower)) {
    return 'simulate-equipment-purchase';
  }

  if (/(insurance|claim|payout|delay)/.test(lower)) {
    return 'simulate-insurance-delay';
  }

  if (/biggest client|client stops paying|customer stops paying|stop paying|lose.*client|lose.*customer/.test(lower)) {
    return 'simulate-client-loss';
  }

  if (/(sales drop|drop 20|sales|churn)/.test(lower)) {
    return 'simulate-sales-drop';
  }

  if (/(parts cost|parts costs|supplier|cost rise)/.test(lower)) {
    return 'simulate-parts-cost-rise';
  }

  if (/(price|pricing|margin|quote|brake)/.test(lower)) {
    return 'simulate-price-increase';
  }

  if (/(payroll|runway|cash|reserve|buffer|spend|collections|parts)/.test(lower)) {
    return 'simulate-runway-pressure';
  }

  return null;
}

export function buildScenarioFromAction(actionId, overrides = {}) {
  const preset = getScenarioPreset(actionId);
  if (!preset) {
    return null;
  }

  return {
    question: overrides.question ?? preset.question,
    label: overrides.label ?? preset.label,
    summary: overrides.summary ?? preset.summary,
    monthlyImpact: overrides.monthlyImpact ?? preset.monthlyImpact,
    source: overrides.source ?? 'action',
  };
}

export function buildScenarioFromQuestion(question, options = {}) {
  const actionId =
    options.actionId
    || findScenarioActionForQuestion(question, options.promptId, options.promptCatalog);

  if (!actionId) {
    return null;
  }

  return buildScenarioFromAction(actionId, {
    question,
    source: options.source,
  });
}
