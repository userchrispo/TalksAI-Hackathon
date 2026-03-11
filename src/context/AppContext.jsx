import { useEffect, useState } from 'react';
import { AppStateContext } from './appState';

const STORAGE_KEY = 'talks-ai-demo-state';

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
  lastSynced: '14 mins ago',
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
    action: 'Send reminder email',
    badge: 'outline',
  },
  {
    id: 3,
    category: 'Rising Costs',
    severity: 'medium',
    title: 'Supplier raised brake pad prices by 8%.',
    desc: "Parts vendor 'BremTech' increased average unit cost over the last 3 orders. Current margins dropping.",
    action: 'Adjust pricing guidance',
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

function createDefaultState() {
  return {
    profile: defaultProfile,
    bankConnection: defaultBankConnection,
    problems: defaultProblems,
    balance: defaultBalance,
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

    return {
      ...createDefaultState(),
      ...JSON.parse(raw),
    };
  } catch {
    return createDefaultState();
  }
}

export function AppProvider({ children }) {
  const [{ profile, bankConnection, problems, balance }, setAppState] = useState(readStoredState);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile, bankConnection, problems, balance }),
    );
  }, [profile, bankConnection, problems, balance]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
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
    setAppState((current) => {
      const nextProfile = {
        ...current.profile,
        ...updates,
      };
      const previousSafeMin = parseCurrency(current.profile.safeMin, 8000);
      const nextSafeMin = parseCurrency(nextProfile.safeMin, previousSafeMin);
      const safeDelta = previousSafeMin - nextSafeMin;

      return {
        ...current,
        profile: nextProfile,
        balance: {
          ...current.balance,
          safe: Math.max(0, Number((current.balance.safe + safeDelta).toFixed(2))),
          runwayDays: Math.max(0, current.balance.runwayDays + Math.round(safeDelta / 500)),
        },
      };
    });

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

  const completeOnboarding = ({ businessType, formData, bankName, bankSource }) => {
    setAppState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        ...formData,
        businessType,
      },
      bankConnection: {
        connected: true,
        name: bankName || 'CSV Upload',
        source: bankSource || 'csv',
        lastSynced: bankSource === 'bank' ? 'Just now' : 'CSV imported',
      },
    }));

    addToast('Workspace ready.');
  };

  const resolveProblem = (id, resolutionMessage) => {
    setAppState((current) => {
      const nextProblems = current.problems.filter((problem) => problem.id !== id);
      let nextBalance = current.balance;

      if (id === 1) {
        nextBalance = {
          ...current.balance,
          safe: Number((current.balance.safe + 1200).toFixed(2)),
          upcomingBills: Number((current.balance.upcomingBills - 900).toFixed(2)),
        };
      }

      if (id === 2) {
        nextBalance = {
          ...current.balance,
          current: Number((current.balance.current + 3000).toFixed(2)),
          safe: Number((current.balance.safe + 3000).toFixed(2)),
          pendingInvoices: Number((current.balance.pendingInvoices - 3000).toFixed(2)),
          runwayDays: current.balance.runwayDays + 14,
        };
      }

      if (id === 3) {
        nextBalance = {
          ...current.balance,
          safe: Number((current.balance.safe + 650).toFixed(2)),
        };
      }

      return {
        ...current,
        problems: nextProblems,
        balance: nextBalance,
      };
    });

    addToast(resolutionMessage || 'Action completed successfully');
  };

  const updateExpenses = (amountAdded) => {
    const nextAmount = Number(amountAdded) || 0;
    const newRunway = Math.max(0, 23 - Math.floor(nextAmount / 1000));
    setAppState((current) => ({
      ...current,
      balance: {
        ...current.balance,
        runwayDays: newRunway,
      },
    }));
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAppState(createDefaultState());
    addToast('Logged out.');
  };

  const value = {
    profile,
    bankConnection,
    problems,
    balance,
    toasts,
    notify: addToast,
    updateProfile,
    updateFinancialSettings,
    updateBankConnection,
    completeOnboarding,
    resolveProblem,
    updateExpenses,
    removeToast,
    logout,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
