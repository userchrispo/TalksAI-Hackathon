import { useEffect, useState } from 'react';
import { AppStateContext } from './appState';
import { getAccessModeFlags } from '../lib/aiAccess';
import { buildScenarioFromAction } from '../lib/scenarioPresets';

const STORAGE_KEY = 'talks-ai-demo-state';
const DEFAULT_START_MONTH = 'August 2026';

const defaultProfile = {
  businessType: 'auto',
  shopName: 'Vance Auto Body',
  ownerName: 'Evelyn Vance',
  email: 'evelyn@vanceauto.ca',
  phone: '(416) 847-1928',
  address: '4217 Dundas St W, Toronto, ON M6S 2S3',
  employees: '6',
  yearsInBusiness: '8',
  trackingMethod: 'spreadsheet',
  monthlyRevenue: '$28,400',
  rent: '$3,200',
  payroll: '$12,800',
  supplies: '$4,600',
  insurance: '$1,400',
  safeMin: '$8,000',
};

const defaultBankConnection = {
  connected: true,
  name: 'TD Canada Trust Business',
  source: 'bank',
  isSimulated: false,
  lastSynced: '14 mins ago',
  fileName: null,
  stats: null,
};

const defaultProblems = [
  {
    id: 1,
    category: 'Cash Crunch',
    severity: 'high',
    title: 'Forecast dip below $0 on the 18th due to tax + rent overlap.',
    desc: 'Checking balance predicted to hit -$2,400 on the 18th because quarterly taxes and monthly rent are scheduled in the same week.',
    action: 'Ask AI for fix',
    badge: 'outline',
  },
  {
    id: 2,
    category: 'Late Payer',
    severity: 'high',
    title: 'Invoice #1042 ($3,000) due tomorrow, usually 14 days late.',
    desc: "Smith Auto Group frequently pays late. If delayed, next week's vendor payments will be tight.",
    action: 'Ask AI for fix',
    badge: 'outline',
  },
  {
    id: 3,
    category: 'Rising Costs',
    severity: 'medium',
    title: 'Supplier raised brake pad prices by 8%.',
    desc: "Parts vendor 'BremTech' increased average unit cost over the last 3 orders. Current margins dropping.",
    action: 'Ask AI for fix',
    badge: 'outline',
  },
];

const defaultBalance = {
  current: 10421.84,
  safe: 4528.16,
  runwayDays: 23,
  pendingInvoices: 12042.88,
  upcomingBills: 3104.5,
};

const defaultScenario = {
  question: '',
  label: 'Baseline forecast',
  summary: 'No active scenario is changing the forecast right now.',
  monthlyImpact: 0,
  startMonth: DEFAULT_START_MONTH,
  source: 'baseline',
  updatedAt: null,
};

const defaultFixHistory = [];

const defaultSession = {
  hasWorkspaceAccess: false,
  accessMode: null,
};

const scenarioMonthOptions = [
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
];

function parseCurrency(value, fallback = 0) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  const cleaned = String(value ?? '')
    .replace(/[^0-9.-]/g, '')
    .trim();

  if (!cleaned) {
    return fallback;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value) {
  return Number((Number(value) || 0).toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrency(value, digits = 0) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function monthLabels(startMonth) {
  const parsedDate = new Date(`${startMonth || DEFAULT_START_MONTH} 1`);
  const year = Number.isNaN(parsedDate.getTime()) ? 2026 : parsedDate.getFullYear();
  const month = Number.isNaN(parsedDate.getTime()) ? 7 : parsedDate.getMonth();

  return Array.from({ length: 7 }, (_, index) =>
    new Date(year, month + index, 1).toLocaleString('en-US', { month: 'short' }),
  );
}

function severityWeight(severity) {
  if (severity === 'high') {
    return 2;
  }

  if (severity === 'medium') {
    return 1;
  }

  return 0.5;
}

function createDefaultState() {
  return {
    session: defaultSession,
    fixHistory: defaultFixHistory,
    profile: defaultProfile,
    bankConnection: defaultBankConnection,
    problems: defaultProblems,
    balance: defaultBalance,
    scenario: defaultScenario,
  };
}

function mergeState(rawState) {
  const defaults = createDefaultState();
  const nextSession = {
    ...defaults.session,
    ...(rawState?.session ?? {}),
  };
  const rawBankConnection = rawState?.bankConnection ?? {};
  const nextIsSimulated =
    typeof rawBankConnection.isSimulated === 'boolean'
      ? rawBankConnection.isSimulated
      : nextSession.accessMode === 'demo';

  return {
    ...defaults,
    ...rawState,
    session: nextSession,
    fixHistory: Array.isArray(rawState?.fixHistory) ? rawState.fixHistory : defaults.fixHistory,
    profile: {
      ...defaults.profile,
      ...(rawState?.profile ?? {}),
    },
    bankConnection: {
      ...defaults.bankConnection,
      ...rawBankConnection,
      isSimulated: nextIsSimulated,
    },
    balance: {
      ...defaults.balance,
      ...(rawState?.balance ?? {}),
    },
    scenario: {
      ...defaults.scenario,
      ...(rawState?.scenario ?? {}),
    },
    problems: Array.isArray(rawState?.problems) ? rawState.problems : defaults.problems,
  };
}

function readStoredState() {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    return mergeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

function buildFinancialModel({ profile, balance, problems, scenario, bankConnection, accessMode }) {
  const monthlyRevenue = parseCurrency(profile.monthlyRevenue, 28400);
  const rent = parseCurrency(profile.rent, 3200);
  const payroll = parseCurrency(profile.payroll, 12800);
  const supplies = parseCurrency(profile.supplies, 4600);
  const insurance = parseCurrency(profile.insurance, 1400);
  const safetyFloor = parseCurrency(profile.safeMin, 8000);
  const scenarioImpact = clamp(parseCurrency(scenario.monthlyImpact, 0), -10000, 20000);
  const activeRiskScore = problems.reduce((sum, problem) => sum + severityWeight(problem.severity), 0);
  const fixedCosts = rent + payroll + supplies + insurance;
  const baseMonthlyNet = monthlyRevenue - fixedCosts;
  const projectedMonthlyNet = baseMonthlyNet - scenarioImpact;
  const nearTermCollections = balance.pendingInvoices * 0.48;
  const supplierPressure = problems.some((problem) => problem.category === 'Rising Costs') ? 380 : 0;
  const cashCrunchPressure = problems.some((problem) => problem.category === 'Cash Crunch') ? 1450 : 0;
  const safeToSpend = roundCurrency(
    Math.max(
      0,
      balance.current
        + nearTermCollections
        - balance.upcomingBills
        - safetyFloor
        - activeRiskScore * 180
        - supplierPressure
        - scenarioImpact * 0.55,
    ),
  );
  const runwayReserve = Math.max(
    0,
    balance.current + balance.pendingInvoices * 0.28 - safetyFloor + Math.min(Math.abs(Math.min(scenarioImpact, 0)) * 0.2, 900),
  );
  const dailyPressure = Math.max(
    140,
    (balance.upcomingBills
      + activeRiskScore * 350
      + cashCrunchPressure
      + Math.max(scenarioImpact, 0) * 0.6
      - Math.min(Math.abs(Math.min(scenarioImpact, 0)) * 0.35, 900))
      / 14,
  );
  const runwayDays = clamp(Math.round(runwayReserve / dailyPressure + 7), 0, 90);

  const forecastPressure = activeRiskScore * 850 + cashCrunchPressure;
  const dashboardTrajectory = [
    { date: '1', actual: roundCurrency(balance.current + nearTermCollections * 0.32 - forecastPressure * 0.12) },
    { date: '5', actual: roundCurrency(balance.current + nearTermCollections * 0.42 - forecastPressure * 0.16) },
    {
      date: '10',
      actual: roundCurrency(balance.current + nearTermCollections * 0.08 - balance.upcomingBills * 0.28 - forecastPressure * 0.18),
    },
    {
      date: '15',
      actual: roundCurrency(balance.current + nearTermCollections * 0.14 - balance.upcomingBills * 0.18 - forecastPressure * 0.12),
    },
    { date: 'Today', actual: roundCurrency(balance.current), forecast: roundCurrency(balance.current) },
    {
      date: '20',
      forecast: roundCurrency(
        balance.current
          + nearTermCollections * 0.2
          - balance.upcomingBills * 0.44
          - forecastPressure * 0.36
          - scenarioImpact * 0.35,
      ),
    },
    {
      date: '25',
      forecast: roundCurrency(
        balance.current
          + nearTermCollections * 0.35
          - balance.upcomingBills * 0.62
          - forecastPressure * 0.52
          - scenarioImpact * 0.55,
      ),
    },
    {
      date: '30',
      forecast: roundCurrency(
        balance.current
          + nearTermCollections * 0.48
          - balance.upcomingBills * 0.82
          - forecastPressure * 0.66
          - scenarioImpact * 0.78,
      ),
    },
  ];

  const months = monthLabels(scenario.startMonth);
  const seasonalOffsets = [-250, -500, 150, 450, 800, 600];
  const invoiceReleases = [
    balance.pendingInvoices * 0.08,
    balance.pendingInvoices * 0.05,
    balance.pendingInvoices * 0.03,
    0,
    0,
    0,
  ];
  const billLoads = [balance.upcomingBills * 0.45, balance.upcomingBills * 0.25, 450, 350, 650, 500];
  const baseMonthlyContribution = baseMonthlyNet * 0.42;
  let runningBase = roundCurrency(balance.current);
  let runningScenario = roundCurrency(balance.current);

  const simulatorTrajectory = months.map((month, index) => {
    if (index === 0) {
      return {
        month,
        base: runningBase,
        scenario: runningScenario,
      };
    }

    const baseChange =
      baseMonthlyContribution
      + invoiceReleases[index - 1]
      - billLoads[index - 1]
      + seasonalOffsets[index - 1]
      - activeRiskScore * 160;

    runningBase = roundCurrency(runningBase + baseChange);
    runningScenario = roundCurrency(runningScenario + baseChange - scenarioImpact * 0.78);

    return {
      month,
      base: runningBase,
      scenario: runningScenario,
    };
  });

  const latePayerProblem = problems.find((problem) => problem.category === 'Late Payer');
  const supplierProblem = problems.find((problem) => problem.category === 'Rising Costs');
  const cashCrunchProblem = problems.find((problem) => problem.category === 'Cash Crunch');
  const scenarioIsActive = Math.abs(scenarioImpact) >= 100;
  const isSimulatedData = bankConnection.isSimulated || accessMode === 'demo';
  const isDemoCsv = isSimulatedData && bankConnection.source !== 'bank';
  const csvSourceLabel = bankConnection.fileName || bankConnection.name || (isSimulatedData ? 'Sample CSV dataset' : 'Your uploaded CSV');

  const recommendationGroups = [
    {
      label: 'Today',
      items: [
        latePayerProblem
          ? {
              id: 'late-payer',
              tone: 'warning',
              href: '/app/problems',
              title: `Pull in ${formatCurrency(3000)} from Smith Auto Group before payroll tightens.`,
              detail: 'It is the fastest way to lift the safety buffer without changing payroll or rent timing.',
              actionId: 'collect-late-invoice',
              actionLabel: 'Mark reminder sent',
            }
          : {
              id: 'cash-room',
              tone: safeToSpend < safetyFloor * 0.35 ? 'warning' : 'positive',
              href: '/app/assistant',
              title:
                safeToSpend < safetyFloor * 0.35
                  ? `Only ${formatCurrency(safeToSpend)} is truly free above the safety floor today.`
                  : `${formatCurrency(safeToSpend)} is available above the safety floor today.`,
              detail:
                safeToSpend < safetyFloor * 0.35
                  ? 'Hold non-essential spend until the next collections batch lands.'
                  : 'You can absorb a small operational surprise without dropping below the reserve target.',
            },
        {
          id: 'bank-source',
          tone: !isSimulatedData && bankConnection.source === 'bank' ? 'positive' : 'neutral',
          href: '/app/settings',
          title:
            isSimulatedData && bankConnection.source === 'bank'
              ? `${bankConnection.name} sample feed is loaded for the walkthrough.`
              : isDemoCsv
                ? `${csvSourceLabel} is powering the demo forecast right now.`
                : bankConnection.source === 'bank'
              ? `${bankConnection.name} is synced, so the runway view is using live bank context.`
                : `${csvSourceLabel} is currently powering the shared forecast.`,
          detail:
            isSimulatedData && bankConnection.source === 'bank'
              ? 'This is curated sample data for the demo, so every screen stays consistent without a real bank login.'
              : isDemoCsv
                ? 'This sample transaction history is bundled for the demo and keeps the product story self-contained.'
                : bankConnection.source === 'bank'
              ? 'Use the dashboard and simulator as your live operating view for the next 30 days.'
                : 'The forecast is using your uploaded transaction history until you connect a live bank feed.',
        },
      ],
    },
    {
      label: 'This week',
      items: [
        supplierProblem
          ? {
              id: 'pricing',
              tone: 'warning',
              href: '/app/assistant',
              title: 'Raise brake pad and labor quotes by 6% to recover the supplier increase.',
              detail: 'That margin fix is worth roughly $650 per month in the current operating model.',
              actionId: 'update-pricing',
              actionLabel: 'Apply pricing update',
            }
          : {
              id: 'stress-test',
              tone: 'neutral',
              href: '/app/simulator',
              title: 'Run one downside scenario before pitching the product story.',
              detail: 'Judges will trust the demo more if the app shows what happens when sales or collections slip.',
              actionId: 'simulate-revenue-dip',
              actionLabel: 'Run downside case',
            },
        scenarioIsActive
          ? {
              id: 'active-scenario',
              tone: scenarioImpact > 0 ? 'warning' : 'positive',
              href: '/app/simulator',
              title:
                scenarioImpact > 0
                  ? `${scenario.label} is currently removing about ${formatCurrency(Math.abs(scenarioImpact))}/mo from the forecast.`
                  : `${scenario.label} is currently adding about ${formatCurrency(Math.abs(scenarioImpact))}/mo to the forecast.`,
              detail:
                scenarioImpact > 0
                  ? `Revisit the plan before ${scenario.startMonth} if you do not want the runway to compress.`
                  : `The simulator has already baked the upside into the shared forecast starting in ${scenario.startMonth}.`,
              actionId: scenarioImpact > 0 ? 'clear-scenario' : null,
              actionLabel: scenarioImpact > 0 ? 'Reset scenario' : null,
            }
          : {
              id: 'growth-upside',
              tone: 'neutral',
              href: '/app/simulator',
              title: 'You still have room to test one upside move this week.',
              detail: 'A clean pricing increase or better collections cadence shows up across the dashboard immediately.',
              actionId: 'simulate-revenue-lift',
              actionLabel: 'Apply upside plan',
            },
      ],
    },
    {
      label: 'This month',
      items: [
        cashCrunchProblem
          ? {
              id: 'cash-crunch',
              tone: 'warning',
              href: '/app/problems',
              title: 'Move tax timing or delay new equipment until after the 25th.',
              detail: 'That overlap is the main reason the 30-day view squeezes the buffer in the third week.',
              actionId: 'defer-overlap-bills',
              actionLabel: 'Apply payment plan',
            }
          : {
              id: 'momentum',
              tone: 'positive',
              href: '/app/dashboard',
              title: 'The monthly plan is stable once the live risks stay cleared.',
              detail: 'Keep the weekly collections routine and the operating model remains above the reserve target.',
            },
        projectedMonthlyNet > 0
          ? {
              id: 'growth-capacity',
              tone: 'positive',
              href: '/app/simulator',
              title: `The model still supports growth with about ${formatCurrency(projectedMonthlyNet)} of monthly headroom.`,
              detail: 'Use the simulator before committing to staff, tooling, or another service line.',
              actionId: 'simulate-hire',
              actionLabel: 'Test hiring plan',
            }
          : {
              id: 'stabilize',
              tone: 'warning',
              href: '/app/simulator',
              title: 'The current plan is burning cash too quickly for an aggressive move this month.',
              detail: 'Start with collections and pricing before adding payroll, equipment, or another location.',
              actionId: 'stabilize-cash',
              actionLabel: 'Apply buffer plan',
            },
      ],
    },
  ];

  const priorityActions = recommendationGroups
    .flatMap((group) => group.items)
    .filter((item) => item.actionId)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.actionId === item.actionId) === index)
    .slice(0, 3)
    .map((item) => ({
      actionId: item.actionId,
      href: item.href,
      label: item.actionLabel || 'Apply',
      title: item.title,
      detail: item.detail,
      tone: item.tone,
    }));

  return {
    financialMetrics: {
      currentCash: balance.current,
      safeToSpend,
      runwayDays,
      pendingInvoices: balance.pendingInvoices,
      upcomingBills: balance.upcomingBills,
      safetyFloor,
      monthlyRevenue,
      fixedCosts,
      baseMonthlyNet: roundCurrency(baseMonthlyNet),
      projectedMonthlyNet: roundCurrency(projectedMonthlyNet),
      activeRiskCount: problems.length,
      activeRiskScore,
    },
    dashboardTrajectory,
    simulatorTrajectory,
    recommendationGroups,
    priorityActions,
  };
}

function resolveProblemState(current, id) {
  const nextProblems = current.problems.filter((problem) => problem.id !== id);

  if (id === 1) {
    return {
      ...current,
      problems: nextProblems,
      balance: {
        ...current.balance,
        upcomingBills: roundCurrency(Math.max(0, current.balance.upcomingBills - 900)),
      },
    };
  }

  if (id === 2) {
    return {
      ...current,
      problems: nextProblems,
      balance: {
        ...current.balance,
        current: roundCurrency(current.balance.current + 3000),
        pendingInvoices: roundCurrency(Math.max(0, current.balance.pendingInvoices - 3000)),
      },
    };
  }

  if (id === 3) {
    return {
      ...current,
      problems: nextProblems,
      profile: {
        ...current.profile,
        monthlyRevenue: formatCurrency(parseCurrency(current.profile.monthlyRevenue, 28400) + 650),
      },
    };
  }

  return {
    ...current,
    problems: nextProblems,
  };
}

function createFixHistoryEntry(entry = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: entry.title || 'Fix applied',
    detail: entry.detail || 'A fix was applied to the shared forecast.',
    impact: entry.impact || null,
    problemId: entry.problemId || null,
    actionId: entry.actionId || null,
    source: entry.source || 'app',
    appliedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  const [appState, setAppState] = useState(readStoredState);
  const { session, fixHistory, profile, bankConnection, problems, balance, scenario } = appState;
  const [toasts, setToasts] = useState([]);
  const accessFlags = getAccessModeFlags(session.accessMode);

  const { financialMetrics, dashboardTrajectory, simulatorTrajectory, recommendationGroups, priorityActions } =
    buildFinancialModel({
      profile,
      bankConnection,
      balance,
      problems,
      scenario,
      accessMode: accessFlags.accessMode,
    });

  const derivedBalance = {
    ...balance,
    safe: financialMetrics.safeToSpend,
    runwayDays: financialMetrics.runwayDays,
  };

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const recordFixApplied = (entry) => {
    setAppState((current) => ({
      ...current,
      fixHistory: [createFixHistoryEntry(entry), ...current.fixHistory].slice(0, 12),
    }));
  };

  const updateProfile = (updates, options = {}) => {
    setAppState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...updates,
      },
    }));

    if (!options.silent) {
      addToast(options.message || 'Profile updated.');
    }
  };

  const updateFinancialSettings = (updates) => {
    setAppState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...updates,
      },
    }));

    addToast('Financial defaults updated.');
  };

  const updateBankConnection = (updates, message = 'Bank connection updated.') => {
    setAppState((current) => ({
      ...current,
      bankConnection: {
        ...current.bankConnection,
        ...updates,
      },
    }));
    addToast(message);
  };

  const completeOnboarding = ({ businessType, formData, bankName, bankSource, connectionMeta = null, accessMode = 'demo' }) => {
    const isSimulated = accessMode === 'demo';
    setAppState((current) => ({
      ...current,
      session: {
        hasWorkspaceAccess: true,
        accessMode,
      },
      profile: {
        ...current.profile,
        ...formData,
        businessType,
      },
      bankConnection: {
        connected: true,
        name: bankName || connectionMeta?.fileName || 'CSV Upload',
        source: bankSource || 'csv',
        isSimulated,
        lastSynced:
          accessMode === 'demo'
            ? 'Demo data loaded just now'
            : bankSource === 'bank'
              ? 'Just now'
              : 'CSV uploaded just now',
        fileName: connectionMeta?.fileName || null,
        stats: connectionMeta
          ? {
              transactionCount: connectionMeta.transactionCount ?? 0,
              monthCount: connectionMeta.monthCount ?? 0,
              vendorCount: connectionMeta.vendorCount ?? 0,
            }
          : null,
      },
      scenario: defaultScenario,
    }));

    addToast('Workspace ready.');
  };

  const applyScenario = (nextScenario, options = {}) => {
    setAppState((current) => ({
      ...current,
      scenario: {
        ...current.scenario,
        ...nextScenario,
        label: nextScenario.label || current.scenario.label || defaultScenario.label,
        summary: nextScenario.summary || current.scenario.summary || defaultScenario.summary,
        question: nextScenario.question ?? current.scenario.question,
        monthlyImpact: clamp(parseCurrency(nextScenario.monthlyImpact, current.scenario.monthlyImpact), -10000, 20000),
        startMonth: nextScenario.startMonth || current.scenario.startMonth || DEFAULT_START_MONTH,
        source: nextScenario.source || current.scenario.source || 'manual',
        updatedAt: new Date().toISOString(),
      },
    }));

    if (!options.silent) {
      addToast(options.message || 'Forecast updated.');
    }
  };

  const setScenarioStartMonth = (startMonth) => {
    setAppState((current) => ({
      ...current,
      scenario: {
        ...current.scenario,
        startMonth,
      },
    }));
  };

  const clearScenario = (options = {}) => {
    setAppState((current) => ({
      ...current,
      scenario: {
        ...defaultScenario,
        startMonth: current.scenario.startMonth || DEFAULT_START_MONTH,
      },
    }));

    if (!options.silent) {
      addToast(options.message || 'Returned to the baseline forecast.');
    }
  };

  const resolveProblem = (id, resolutionMessage, options = {}) => {
    let didResolve = false;

    setAppState((current) => {
      const exists = current.problems.some((problem) => problem.id === id);
      if (!exists) {
        return current;
      }

      didResolve = true;
      return resolveProblemState(current, id);
    });

    if (didResolve && !options.silent) {
      addToast(resolutionMessage || 'Action completed successfully.');
    }

    return didResolve;
  };

  const updateExpenses = (amountAdded) => {
    applyScenario(
      {
        label: appState.scenario.label && appState.scenario.label !== defaultScenario.label ? appState.scenario.label : 'Manual scenario',
        summary: 'Manual controls are adjusting the shared forecast for the next six months.',
        monthlyImpact: amountAdded,
        source: 'manual',
      },
      { silent: true },
    );
  };

  const takeAction = (actionId, options = {}) => {
    if (actionId === 'collect-late-invoice') {
      const didResolve = resolveProblem(2, 'Reminder sent and the late payer risk is cleared.');

      if (didResolve) {
        recordFixApplied({
          actionId,
          problemId: 2,
          source: options.source || 'app',
          title: options.title || 'Late payer fix applied',
          detail:
            options.detail
            || 'Marked the reminder sent so the overdue $3,000 invoice is treated as the next cash recovery move.',
          impact: options.impact || '+$3,000 cash recovery',
        });
      }

      if (!didResolve) {
        addToast('The late payer risk is already cleared.', 'warning');
      }

      return didResolve;
    }

    if (actionId === 'defer-overlap-bills') {
      const didResolve = resolveProblem(1, 'Payment plan applied and the tax overlap risk is reduced.');

      if (didResolve) {
        recordFixApplied({
          actionId,
          problemId: 1,
          source: options.source || 'app',
          title: options.title || 'Cash crunch fix applied',
          detail:
            options.detail
            || 'Applied the payment plan so the tax and rent overlap stops squeezing the same week of cash flow.',
          impact: options.impact || '+$900 near-term buffer',
        });
      }

      if (!didResolve) {
        addToast('The cash crunch plan is already applied.', 'warning');
      }

      return didResolve;
    }

    if (actionId === 'update-pricing') {
      const didResolve = resolveProblem(3, 'Pricing guidance applied across the forecast.');

      if (didResolve) {
        recordFixApplied({
          actionId,
          problemId: 3,
          source: options.source || 'app',
          title: options.title || 'Margin repair fix applied',
          detail:
            options.detail
            || 'Applied the pricing update so the supplier increase is recovered inside the shared forecast.',
          impact: options.impact || '+$650 / month',
        });
      }

      if (!didResolve) {
        addToast('Pricing guidance is already reflected in the forecast.', 'warning');
      }

      return didResolve;
    }

    const scenarioPreset = buildScenarioFromAction(actionId, { source: 'action' });
    if (scenarioPreset) {
      applyScenario(scenarioPreset);
      return true;
    }

    if (actionId === 'clear-scenario') {
      clearScenario();
      return true;
    }

    return false;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAppState(createDefaultState());
    addToast('Logged out.');
  };

  const value = {
    session,
    accessMode: accessFlags.accessMode,
    hasWorkspaceAccess: session.hasWorkspaceAccess,
    isDemoMode: accessFlags.isDemoMode,
    hasFullAiAccess: accessFlags.hasFullAiAccess,
    fixHistory,
    profile,
    bankConnection,
    problems,
    balance: derivedBalance,
    scenarioState: scenario,
    scenarioMonthOptions,
    financialMetrics,
    dashboardTrajectory,
    simulatorTrajectory,
    recommendationGroups,
    priorityActions,
    toasts,
    notify: addToast,
    updateProfile,
    updateFinancialSettings,
    updateBankConnection,
    completeOnboarding,
    resolveProblem,
    applyScenario,
    setScenarioStartMonth,
    clearScenario,
    takeAction,
    updateExpenses,
    removeToast,
    logout,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
