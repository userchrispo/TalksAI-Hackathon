import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  Circle,
  Lightning,
  ShieldCheck,
  SpinnerGap,
  TrendUp,
  WarningCircle,
  Wrench,
} from '@phosphor-icons/react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/useAppContext';
import { PROMPT_KINDS } from '../lib/aiAccess';
import { APP_ROUTES } from '../lib/appRoutes';
import { buildScenarioFromAction } from '../lib/scenarioPresets';

void motion;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

function formatMoney(value, digits = 0) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatAppliedTime(value) {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function buildFixPlan(problem, financialMetrics, scenarioState, bankConnection) {
  if (!problem) {
    return null;
  }

  if (problem.id === 1) {
    return {
      id: problem.id,
      tone: 'warning',
      sourceLabel: 'Cash Protection',
      focus: 'Prevent the tax and rent overlap from hitting the same week.',
      impactLabel: 'Expected near-term relief',
      impactValue: '+$900',
      confidence: 'High confidence',
      primaryAction: {
        label: 'Apply payment plan',
        actionId: 'defer-overlap-bills',
      },
      secondaryAction: {
        label: 'Stress-test in simulator',
        actionId: 'simulate-runway-pressure',
        href: APP_ROUTES.simulator,
      },
      metrics: [
        { label: 'Current safe to spend', value: formatMoney(financialMetrics.safeToSpend, 2) },
        { label: 'Upcoming bills', value: formatMoney(financialMetrics.upcomingBills, 2) },
        { label: 'Runway', value: `${financialMetrics.runwayDays} days` },
      ],
      steps: [
        {
          title: 'Split the tax timing',
          detail: 'Move part of the tax bill outside the rent window so the bank balance does not get hit twice in the same week.',
        },
        {
          title: 'Protect the safety floor',
          detail: `Keep at least ${formatMoney(financialMetrics.safetyFloor)} untouched while the overlap week clears.`,
        },
        {
          title: 'Delay non-essential spend',
          detail: 'Hold equipment or optional vendor payouts until collections land after the 18th.',
        },
      ],
      fallbackCard: {
        headline: 'Split the tax and rent week before the 18th.',
        summary:
          'The cleanest fix is a short payment plan that pushes part of the tax load outside the rent week. That keeps the balance from dipping negative and protects the reserve target.',
        rows: [
          { label: 'Overlap risk', value: 'Tax + rent in same week' },
          { label: 'Expected relief', value: '+$900 near-term buffer' },
          { label: 'Best next move', value: 'Apply payment plan' },
        ],
      },
      aiPrompt: `Give me the best practical fix for this cash crunch: ${problem.title}. The shop has ${formatMoney(financialMetrics.currentCash, 2)} in cash, ${formatMoney(financialMetrics.upcomingBills, 2)} in upcoming bills, ${financialMetrics.runwayDays} days of runway, and the current scenario is "${scenarioState.label}".`,
      context: {
        problem,
        financialMetrics,
        bankConnection,
        scenarioState,
      },
    };
  }

  if (problem.id === 2) {
    return {
      id: problem.id,
      tone: 'warning',
      sourceLabel: 'Collections Recovery',
      focus: 'Pull the overdue invoice forward before next week tightens.',
      impactLabel: 'Expected near-term relief',
      impactValue: '+$3,000',
      confidence: 'High confidence',
      primaryAction: {
        label: 'Mark reminder sent',
        actionId: 'collect-late-invoice',
      },
      secondaryAction: {
        label: 'Open risk radar',
        href: APP_ROUTES.problems,
      },
      metrics: [
        { label: 'Pending invoices', value: formatMoney(financialMetrics.pendingInvoices, 2) },
        { label: 'Safe to spend', value: formatMoney(financialMetrics.safeToSpend, 2) },
        { label: 'Runway', value: `${financialMetrics.runwayDays} days` },
      ],
      steps: [
        {
          title: 'Send the reminder today',
          detail: 'The fastest fix is to trigger collections immediately so the invoice lands before payroll pressure increases.',
        },
        {
          title: 'Escalate if they slip again',
          detail: 'Move repeat offenders to a tighter collections cadence or require partial payment before the next job.',
        },
        {
          title: 'Use recovered cash to protect payroll',
          detail: 'Treat the recovered invoice as reserve protection, not fresh spending room.',
        },
      ],
      fallbackCard: {
        headline: 'Collect the Smith Auto invoice before next week.',
        summary:
          'This is the highest-confidence fix in the current forecast. Pulling in the overdue $3,000 invoice lifts the buffer faster than cutting spend elsewhere.',
        rows: [
          { label: 'Invoice at risk', value: '$3,000 overdue' },
          { label: 'Expected relief', value: '+$3,000 cash in bank' },
          { label: 'Best next move', value: 'Send reminder now' },
        ],
      },
      aiPrompt: `Give me the best practical fix for this late payer issue: ${problem.title}. The shop currently has ${formatMoney(financialMetrics.pendingInvoices, 2)} in pending invoices, ${formatMoney(financialMetrics.currentCash, 2)} in cash, and ${financialMetrics.runwayDays} days of runway.`,
      context: {
        problem,
        financialMetrics,
        bankConnection,
        scenarioState,
      },
    };
  }

  return {
    id: problem.id,
    tone: 'neutral',
    sourceLabel: 'Margin Repair',
    focus: 'Recover the supplier increase before it erodes another month of margin.',
    impactLabel: 'Expected monthly lift',
    impactValue: '+$650',
    confidence: 'Medium confidence',
    primaryAction: {
      label: 'Apply pricing update',
      actionId: 'update-pricing',
    },
    secondaryAction: {
      label: 'Open AI Assistant',
      href: APP_ROUTES.assistant,
    },
    metrics: [
      { label: 'Projected monthly net', value: formatMoney(financialMetrics.projectedMonthlyNet, 2) },
      { label: 'Fixed costs', value: formatMoney(financialMetrics.fixedCosts, 2) },
      { label: 'Current scenario', value: scenarioState.label },
    ],
    steps: [
      {
        title: 'Adjust quotes this week',
        detail: 'Raise brake pad and labor pricing fast enough to stop the supplier increase from compounding into the next month.',
      },
      {
        title: 'Watch acceptance rate',
        detail: 'If close rates soften, start with the highest-margin services instead of changing every line item at once.',
      },
      {
        title: 'Recheck the forecast after the update',
        detail: 'The simulator and dashboard should reflect the new monthly contribution immediately once pricing is applied.',
      },
    ],
    fallbackCard: {
      headline: 'Raise pricing enough to absorb the supplier increase.',
      summary:
        'The supplier cost jump is small enough to repair with a targeted pricing update. Recover the margin now so it does not keep dragging the shared forecast month after month.',
      rows: [
        { label: 'Margin leak', value: 'Supplier increase still active' },
        { label: 'Expected monthly lift', value: '+$650' },
        { label: 'Best next move', value: 'Apply pricing update' },
      ],
    },
    aiPrompt: `Give me the best practical fix for this margin issue: ${problem.title}. The shop is running at ${formatMoney(financialMetrics.projectedMonthlyNet, 2)} projected monthly net with ${formatMoney(financialMetrics.fixedCosts, 2)} of fixed costs.`,
    context: {
      problem,
      financialMetrics,
      bankConnection,
      scenarioState,
    },
  };
}

function getToneStyles(tone) {
  if (tone === 'warning') {
    return {
      badge: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <WarningCircle size={18} weight="fill" className="text-amber-700" />,
      accent: 'border-amber-200 bg-amber-50/70',
    };
  }

  if (tone === 'neutral') {
    return {
      badge: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <TrendUp size={18} weight="fill" className="text-blue-700" />,
      accent: 'border-blue-200 bg-blue-50/70',
    };
  }

  return {
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle size={18} weight="fill" className="text-emerald-700" />,
    accent: 'border-emerald-200 bg-emerald-50/70',
  };
}

export const AIFixes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    accessMode,
    bankConnection,
    financialMetrics,
    fixHistory,
    hasFullAiAccess,
    isDemoMode,
    notify,
    problems,
    profile,
    scenarioState,
    takeAction,
  } = useAppContext();
  const [aiState, setAiState] = useState({
    planId: null,
    status: 'idle',
    card: null,
  });
  const [refreshCount, setRefreshCount] = useState(0);

  const selectedProblemId = Number(searchParams.get('problem'));
  const fixPlans = problems.map((problem) => buildFixPlan(problem, financialMetrics, scenarioState, bankConnection)).filter(Boolean);
  const selectedPlan = fixPlans.find((plan) => plan.id === selectedProblemId) || fixPlans[0] || null;
  const selectedProblem = problems.find((problem) => problem.id === selectedPlan?.id) || null;
  const requestedFromRadar =
    location.state?.from === 'problems'
    && Number(location.state?.generatedProblemId) === selectedPlan?.id;
  const selectedPlanId = selectedPlan?.id ?? null;
  const selectedPlanPrompt = selectedPlan?.aiPrompt ?? '';
  const fallbackCardSnapshot = JSON.stringify(selectedPlan?.fallbackCard ?? null);
  const selectedProblemSnapshot = JSON.stringify(
    selectedProblem
      ? {
          category: selectedProblem.category,
          severity: selectedProblem.severity,
          title: selectedProblem.title,
          description: selectedProblem.desc,
        }
      : null,
  );
  const activeScenarioSnapshot = JSON.stringify({
    label: scenarioState.label,
    monthlyImpact: scenarioState.monthlyImpact,
    startMonth: scenarioState.startMonth,
    source: scenarioState.source,
  });
  const toneStyles = getToneStyles(selectedPlan?.tone || 'neutral');
  const aiStatus =
    !selectedPlan
      ? 'idle'
      : aiState.planId !== selectedPlanId
        ? isDemoMode
          ? 'demo'
          : 'loading'
        : aiState.status;
  const aiCard =
    !selectedPlan
      ? null
      : isDemoMode
        ? selectedPlan.fallbackCard
        : aiState.planId === selectedPlanId
          ? aiState.card
          : null;

  useEffect(() => {
    let isCancelled = false;

    if (!selectedPlanId || !selectedPlanPrompt) {
      return undefined;
    }

    const selectedProblemContext = selectedProblemSnapshot ? JSON.parse(selectedProblemSnapshot) : null;
    const activeScenarioContext = JSON.parse(activeScenarioSnapshot);

    if (isDemoMode) {
      return undefined;
    }

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: selectedPlanPrompt,
        accessMode,
        promptKind: PROMPT_KINDS.custom,
        promptId: null,
        context: {
          shop: {
            name: profile.shopName,
            owner: profile.ownerName,
            businessType: profile.businessType,
            employees: profile.employees,
          },
          financialMetrics: {
            currentCash: financialMetrics.currentCash,
            safeToSpend: financialMetrics.safeToSpend,
            runwayDays: financialMetrics.runwayDays,
            pendingInvoices: financialMetrics.pendingInvoices,
            upcomingBills: financialMetrics.upcomingBills,
            projectedMonthlyNet: financialMetrics.projectedMonthlyNet,
            safetyFloor: financialMetrics.safetyFloor,
          },
          bankConnection: {
            name: bankConnection.name,
            source: bankConnection.source,
            lastSynced: bankConnection.lastSynced,
          },
          activeScenario: activeScenarioContext,
          selectedProblem: selectedProblemContext,
        },
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'AI fix request failed.');
        }

        return data;
      })
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setAiState({
          planId: selectedPlanId,
          status: 'ready',
          card: {
            headline: data.headline,
            summary: data.summary,
            rows: Array.isArray(data.rows) ? data.rows : [],
            source: 'live',
          },
        });
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Live AI is unavailable right now.';
        setAiState({
          planId: selectedPlanId,
          status: 'error',
          card: {
            headline: 'Live AI brief unavailable',
            summary: 'We could not load the live AI fix brief right now. Try again in a moment.',
            rows: [],
            source: 'unavailable',
          },
        });

        notify(
          /Missing Groq API key|Groq rejected the API key|Groq rate limit|timed out/i.test(message)
            ? message
            : 'Live AI is unavailable right now. Try again in a moment.',
          'warning',
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [
    bankConnection.lastSynced,
    bankConnection.name,
    bankConnection.source,
    financialMetrics.currentCash,
    financialMetrics.pendingInvoices,
    financialMetrics.projectedMonthlyNet,
    financialMetrics.runwayDays,
    financialMetrics.safeToSpend,
    financialMetrics.safetyFloor,
    financialMetrics.upcomingBills,
    notify,
    profile.businessType,
    profile.employees,
    profile.ownerName,
    profile.shopName,
    accessMode,
    activeScenarioSnapshot,
    fallbackCardSnapshot,
    isDemoMode,
    refreshCount,
    selectedPlanId,
    selectedPlanPrompt,
    selectedProblemSnapshot,
  ]);

  const handlePlanChange = (planId) => {
    navigate(`${APP_ROUTES.fixes}?problem=${planId}`);
  };

  const handlePrimaryAction = () => {
    if (!selectedPlan?.primaryAction?.actionId) {
      return;
    }

    takeAction(selectedPlan.primaryAction.actionId, {
      source: 'ai-fixes',
      title: selectedPlan.primaryAction.label,
      detail: selectedPlan.focus,
      impact: selectedPlan.impactValue,
    });
  };

  const handleSecondaryAction = () => {
    if (!selectedPlan?.secondaryAction) {
      return;
    }

    if (selectedPlan.secondaryAction.actionId) {
      takeAction(selectedPlan.secondaryAction.actionId);
    }

    if (selectedPlan.secondaryAction.href) {
      const scenarioPreset = selectedPlan.secondaryAction.actionId && selectedPlan.secondaryAction.href === APP_ROUTES.simulator
        ? buildScenarioFromAction(selectedPlan.secondaryAction.actionId, { source: 'action' })
        : null;

      if (scenarioPreset) {
        navigate(selectedPlan.secondaryAction.href, {
          state: {
            simulatorActionId: selectedPlan.secondaryAction.actionId,
            simulatorQuestion: scenarioPreset.question,
            from: 'fixes',
          },
        });
        return;
      }

      navigate(selectedPlan.secondaryAction.href);
    }
  };

  const handleRetryBrief = () => {
    if (!hasFullAiAccess) {
      return;
    }

    setRefreshCount((current) => current + 1);
  };

  if (!fixPlans.length) {
    return (
      <motion.div
        className="pb-20 pt-4 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-10 border-b border-zinc-200 pb-8">
          <h1 className="text-4xl tracking-tight font-medium text-zinc-950 mb-2">AI Fixes</h1>
          <p className="text-zinc-500">Every risk from Potential Problems turns into a repair plan here.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="flex flex-col items-center text-center p-12 border-2 border-dashed border-zinc-200 shadow-none">
            <CheckCircle size={44} weight="fill" className="text-zinc-300 mb-5" />
            <h2 className="text-2xl font-medium tracking-tight text-zinc-950 mb-3">No active issues to generate fixes for</h2>
            <p className="text-zinc-500 max-w-xl leading-relaxed">
              Potential Problems is clear right now, so there is nothing new for the AI Fixes workspace to generate. Head back to radar or run a downside scenario if you want to pressure-test the model.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="primary" onClick={() => navigate(APP_ROUTES.problems)}>
                Open Potential Problems
              </Button>
              <Button variant="outline" onClick={() => navigate(APP_ROUTES.simulator)}>
                Open simulator
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                <CheckCircle size={18} weight="fill" className="text-zinc-700" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-tight text-zinc-950">Applied fixes</h3>
                <p className="text-sm text-zinc-500">Recent actions the workspace has already pushed into the forecast.</p>
              </div>
            </div>

            {fixHistory.length ? (
              <div className="space-y-4">
                {fixHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[15px] font-medium text-zinc-950">{entry.title}</p>
                          <Badge variant="neutral">{entry.source === 'ai-fixes' ? 'AI Fixes' : 'App'}</Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-500">{entry.detail}</p>
                      </div>
                      <div className="text-left md:text-right">
                        {entry.impact ? (
                          <p className="text-sm font-semibold text-zinc-950">{entry.impact}</p>
                        ) : null}
                        <p className="text-xs uppercase tracking-widest text-zinc-400 mt-1">{formatAppliedTime(entry.appliedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center">
                <p className="text-sm text-zinc-500">No fixes have been applied yet.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pb-20 pt-4 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-10 text-left">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-zinc-200 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl tracking-tighter font-medium text-zinc-950 mb-3">AI Fixes</h1>
            <p className="text-[15px] leading-relaxed text-zinc-500 max-w-2xl">
              Every risk from Potential Problems turns into a focused repair plan here. Open a risk, generate the fix, and then apply it back into the shared forecast.
            </p>
          </div>
          <Badge className={`${toneStyles.badge} self-start md:self-auto py-1.5 px-3`}>
            <Lightning size={14} weight="fill" className="mr-2" />
            {aiStatus === 'ready'
              ? 'Live generated fix'
              : isDemoMode
                ? 'Guided demo fix'
                : aiStatus === 'error'
                  ? 'Retry live fix'
                  : 'Generating fix'}
          </Badge>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[2.5rem] border border-slate-200/50 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">Open fix requests</p>
            <p className="text-4xl font-medium tracking-tighter text-zinc-950 font-mono">{fixPlans.length}</p>
            <p className="text-[13px] text-zinc-500 mt-2">Active radar issues needing attention</p>
          </div>
          <div className="rounded-[2.5rem] border border-slate-200/50 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">Current generated fix</p>
            <p className="text-2xl font-medium tracking-tight text-zinc-950 truncate">{selectedProblem?.category || 'No selection'}</p>
            <p className="text-[13px] text-zinc-500 mt-2">{selectedPlan.impactLabel}: <span className="text-emerald-600 font-medium font-mono">{selectedPlan.impactValue}</span></p>
          </div>
          <div className="rounded-[2.5rem] border border-slate-200/50 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">Applied fixes</p>
            <p className="text-4xl font-medium tracking-tighter text-zinc-950 font-mono">{fixHistory.length}</p>
            <p className="text-[13px] text-zinc-500 mt-2">Resolved actions pushed into the model</p>
          </div>
        </div>
      </motion.div>

      {requestedFromRadar ? (
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="border-zinc-950 bg-zinc-950 text-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-2">Generated From Potential Problems</p>
                <h2 className="text-2xl font-medium tracking-tight">Fix generated for {selectedProblem?.category}</h2>
                <p className="text-zinc-300 mt-2 max-w-3xl">
                  {selectedProblem?.title} now has a focused repair plan below. Review the recommendation, then apply it to clear the issue from radar.
                </p>
              </div>
              <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-white hover:bg-white hover:text-zinc-950" onClick={() => navigate(APP_ROUTES.problems)}>
                Back to Potential Problems
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}

      <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {fixPlans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handlePlanChange(plan.id)}
              className={`group text-left rounded-[2.5rem] border p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[260px] ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-950 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] -translate-y-1'
                  : 'border-slate-200/50 bg-white hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex flex-col h-full w-full">
                <div className="flex items-start justify-between mb-5">
                  <Badge className={`px-3 py-1 text-xs font-medium ${isSelected ? 'border-zinc-800 bg-zinc-900 text-white' : getToneStyles(plan.tone).badge}`}>
                    {problems.find((problem) => problem.id === plan.id)?.category}
                  </Badge>
                  <span className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {isSelected ? 'Active' : 'Ready'}
                  </span>
                </div>
                
                <div className="flex-1 mb-6">
                  <h3 className={`text-[17px] font-medium tracking-tight leading-snug mb-2 ${isSelected ? 'text-white' : 'text-zinc-950'}`}>
                    {plan.focus}
                  </h3>
                  <p className={`text-[13px] leading-relaxed line-clamp-2 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {problems.find((problem) => problem.id === plan.id)?.title}
                  </p>
                </div>
                
                <div className={`mt-auto rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ${isSelected ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50/50 group-hover:bg-zinc-100/50 group-hover:border-zinc-200'}`}>
                  <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.impactLabel}</p>
                  <p className={`text-xl font-medium tracking-tight font-mono ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>{plan.impactValue}</p>
                </div>
              </div>
            </button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <Card className={`p-8 border-2 ${toneStyles.accent}`} diffusion>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-sm">
                    {toneStyles.icon}
                  </span>
                  <Badge className={`${toneStyles.badge} px-3 py-1`}>{selectedPlan.sourceLabel}</Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-zinc-950 mb-3 leading-snug">{selectedPlan.focus}</h2>
                <p className="text-[16px] leading-relaxed text-zinc-600 max-w-xl">
                  {problems.find((problem) => problem.id === selectedPlan.id)?.title}
                </p>
              </div>

              <div className="rounded-[2rem] border-2 border-white bg-white px-6 py-5 shadow-sm min-w-[240px] flex shrink-0 flex-col items-start md:items-end md:text-right">
                <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-2">{selectedPlan.impactLabel}</p>
                <p className="text-4xl font-medium tracking-tighter text-zinc-950 font-mono text-emerald-600">{selectedPlan.impactValue}</p>
                <p className="text-[13px] font-medium text-emerald-700 mt-2 bg-emerald-50 px-2 py-1 rounded-lg">{selectedPlan.confidence}</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {selectedPlan.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md px-5 py-4 flex flex-col justify-between">
                  <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-3">{metric.label}</p>
                  <p className="text-xl font-medium tracking-tight text-zinc-950 font-mono">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" onClick={handlePrimaryAction}>
                {selectedPlan.primaryAction.label}
              </Button>
              <Button variant="outline" onClick={handleSecondaryAction}>
                {selectedPlan.secondaryAction.label}
              </Button>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                <Wrench size={18} weight="fill" className="text-zinc-700" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-tight text-zinc-950">Fix playbook</h3>
                <p className="text-sm text-zinc-500">Use this sequence to stabilize the issue before it spreads into the rest of the forecast.</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedPlan.steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-900">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-zinc-950">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <Card className="p-8" diffusion>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/50 bg-slate-50">
                  {aiStatus === 'loading' ? (
                    <SpinnerGap size={20} weight="bold" className="animate-spin text-zinc-500" />
                  ) : (
                    <Lightning size={20} weight="fill" className="text-zinc-700" />
                  )}
                </span>
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-zinc-950">Generated explanation</h3>
                  <p className="text-[13px] text-zinc-500 mt-1">
                    {aiStatus === 'ready'
                      ? 'Live response from Groq using the shared forecast context.'
                      : aiStatus === 'demo'
                        ? 'Showing the built-in guided explanation for demo mode.'
                      : aiStatus === 'loading'
                        ? 'Refreshing the live fix explanation now.'
                        : 'Live AI is unavailable right now. Retry to regenerate the signed-in explanation.'}
                  </p>
                </div>
              </div>
              <Badge variant="neutral" className="self-start md:self-auto py-1 px-3">
                {aiStatus === 'ready'
                  ? 'Live Groq'
                  : aiStatus === 'demo'
                    ? 'Demo only'
                    : aiStatus === 'error'
                      ? 'Retry needed'
                      : 'App Model'}
              </Badge>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50/50 p-6 md:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-emerald-400/0"></div>
              <h4 className="text-2xl font-medium tracking-tight text-zinc-950 mb-6 max-w-2xl leading-snug">
                {aiCard?.headline || (aiStatus === 'loading' ? 'Generating the live fix explanation...' : 'Live AI brief unavailable')}
              </h4>

              {aiCard?.rows?.length ? (
                <div className="space-y-3 mb-8">
                  {aiCard.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white px-5 py-4">
                      <span className="text-[13px] font-medium text-zinc-500">{row.label}</span>
                      <span className="text-[14px] font-medium text-zinc-950 text-right max-w-[60%]">{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <p className="text-[15px] leading-relaxed text-zinc-600 max-w-3xl">
                {aiCard?.summary || (aiStatus === 'loading'
                  ? 'Pulling a live explanation for this repair plan now.'
                  : 'We could not load a live explanation for this fix.')}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" onClick={handlePrimaryAction}>
                Apply this fix
              </Button>
              {aiStatus === 'error' ? (
                <Button variant="outline" onClick={handleRetryBrief}>
                  Retry live explanation
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => navigate(APP_ROUTES.assistant)}>
                Ask a follow-up <ArrowRight size={16} weight="bold" className="ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="p-8" diffusion>
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/50 bg-slate-50">
                <ShieldCheck size={20} weight="fill" className="text-zinc-700" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-tight text-zinc-950">Why this fix is prioritized</h3>
                <p className="text-[13px] text-zinc-500 mt-1">The app is weighting this issue against live cash, invoice timing, and runway pressure.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200/50 bg-white px-6 py-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Circle size={10} weight="fill" className="text-zinc-400" />
                  <p className="text-[14px] font-medium text-zinc-900">Current cash position</p>
                </div>
                <p className="text-[13px] leading-relaxed text-zinc-500">
                  The shop is carrying {formatMoney(financialMetrics.currentCash, 2)} in cash with {formatMoney(financialMetrics.safeToSpend, 2)} free above the reserve floor.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/50 bg-white px-6 py-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ChartLineUp size={14} weight="fill" className="text-zinc-500" />
                  <p className="text-[14px] font-medium text-zinc-900">Runway pressure</p>
                </div>
                <p className="text-[13px] leading-relaxed text-zinc-500">
                  The forecast currently shows {financialMetrics.runwayDays} days of runway, so the fastest fixes should protect cash before new spending or growth moves.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/50 bg-white px-6 py-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendUp size={14} weight="fill" className="text-zinc-500" />
                  <p className="text-[14px] font-medium text-zinc-900">Scenario awareness</p>
                </div>
                <p className="text-[13px] leading-relaxed text-zinc-500">
                  The active scenario is <span className="font-medium text-zinc-900">{scenarioState.label}</span>, so the AI fix is being framed against the same six-month model the simulator is using.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8" diffusion>
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                <CheckCircle size={18} weight="fill" className="text-zinc-700" />
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-tight text-zinc-950">Applied fixes</h3>
                <p className="text-sm text-zinc-500">A running log of changes already pushed into the shared forecast.</p>
              </div>
            </div>

            {fixHistory.length ? (
              <div className="space-y-4">
                {fixHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 px-5 py-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[15px] font-medium text-zinc-950">{entry.title}</p>
                        <Badge variant="neutral">{entry.source === 'ai-fixes' ? 'AI Fixes' : 'App'}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-zinc-500">{entry.detail}</p>
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-zinc-400">
                        <span>{entry.impact || 'Forecast updated'}</span>
                        <span>{formatAppliedTime(entry.appliedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center">
                <p className="text-sm text-zinc-500">Apply one of the fixes above and it will show up here for judges to review.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
