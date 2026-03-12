import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle, Lightning, Minus, PaperPlaneRight, Play, Plus, SpinnerGap } from '@phosphor-icons/react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/useAppContext';
import { cn } from '../utils';

void motion;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } },
};

const scenarioSuggestions = [
  'What if I hire another technician?',
  'What if I raise prices by 10%?',
  'What if my biggest client stops paying?',
  'What if I buy a $15,000 lift?',
];

const fallbackScenarios = {
  hire: {
    monthlyImpact: 4500,
    aiText: 'Hiring another technician adds roughly $4,500 per month in salary and benefits. It compresses the fall runway unless collections improve at the same time.',
    label: 'New hire - full-time technician',
  },
  prices: {
    monthlyImpact: -2800,
    aiText: 'A 10% price increase adds about $2,800 per month in revenue at the current volume. It is one of the cleaner upside moves in this demo.',
    label: 'Price increase - 10% across services',
  },
  client: {
    monthlyImpact: 6000,
    aiText: 'Losing the biggest client removes roughly $6,000 per month in revenue. That is the sharpest downside case in the current book of business.',
    label: 'Client loss - largest account',
  },
  equipment: {
    monthlyImpact: 2500,
    aiText: 'A $15,000 equipment purchase financed over 6 months adds about $2,500 per month. The forecast stays above the target minimum, but only narrowly.',
    label: 'Equipment - financed over 6 months',
  },
  default: {
    monthlyImpact: 3000,
    aiText: 'Based on your prompt, the simulator estimated a $3,000 monthly drag. Use the controls to stress-test how much room the shop really has.',
    label: 'Custom scenario',
  },
};

function formatCurrency(value, digits = 0) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatImpact(value) {
  if (value === 0) {
    return '$0/mo';
  }

  const sign = value > 0 ? '-' : '+';
  return `${sign}${formatCurrency(Math.abs(value))}/mo`;
}

function formatModelName(model) {
  return String(model || '')
    .split('/')
    .pop()
    ?.replace(/^openai\//, '')
    .replace(/^gpt-oss-/, 'GPT OSS ')
    .replace(/^qwen-/, 'Qwen ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Groq';
}

function matchScenario(input) {
  const lower = input.toLowerCase();

  if (lower.includes('hire') || lower.includes('employee') || lower.includes('technician') || lower.includes('staff')) {
    return fallbackScenarios.hire;
  }

  if (lower.includes('price') || lower.includes('raise') || lower.includes('charge more') || lower.includes('increase')) {
    return fallbackScenarios.prices;
  }

  if (lower.includes('client') || lower.includes('customer') || lower.includes('stop paying') || lower.includes('lose') || lower.includes('leave')) {
    return fallbackScenarios.client;
  }

  if (lower.includes('buy') || lower.includes('purchase') || lower.includes('equipment') || lower.includes('lift') || lower.includes('machine') || lower.includes('van') || lower.includes('truck')) {
    return fallbackScenarios.equipment;
  }

  return fallbackScenarios.default;
}

export const Simulator = () => {
  const navigate = useNavigate();
  const {
    applyScenario,
    bankConnection,
    clearScenario,
    financialMetrics,
    notify,
    problems,
    profile,
    scenarioMonthOptions,
    scenarioState,
    setScenarioStartMonth,
    simulatorTrajectory,
    takeAction,
  } = useAppContext();
  const [whatIfInput, setWhatIfInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiHealth, setAiHealth] = useState({
    status: 'checking',
    configured: false,
    model: '',
  });
  const [statusBanner, setStatusBanner] = useState({
    tone: 'neutral',
    message: 'Checking live AI connection...',
  });

  useEffect(() => {
    let isCancelled = false;

    fetch('/api/health')
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Could not reach the local AI health check.');
        }

        if (isCancelled) {
          return;
        }

        setAiHealth({
          status: 'ready',
          configured: Boolean(data?.configured),
          model: data?.model || '',
        });

        setStatusBanner({
          tone: data?.configured ? 'live' : 'warning',
          message: data?.configured
            ? `Live Groq ready${data?.model ? ` using ${formatModelName(data.model)}` : ''}.`
            : 'Groq is not configured yet. The simulator will use demo fallback responses.',
        });
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setAiHealth({
          status: 'error',
          configured: false,
          model: '',
        });

        setStatusBanner({
          tone: 'warning',
          message: 'Could not reach the local AI backend. Restart `npm run dev` and refresh the page.',
        });
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const displayedResult =
    aiResult
    || (Math.abs(scenarioState.monthlyImpact) >= 100
      ? {
          label: scenarioState.label,
          aiText: scenarioState.summary,
          monthlyImpact: scenarioState.monthlyImpact,
          meta: {
            source: scenarioState.source,
          },
        }
      : null);

  const riskAction =
    problems.find((problem) => problem.category === 'Late Payer')
      ? { label: 'Clear late payer risk', actionId: 'collect-late-invoice', href: '/app/problems' }
      : problems.find((problem) => problem.category === 'Cash Crunch')
        ? { label: 'Apply payment plan', actionId: 'defer-overlap-bills', href: '/app/problems' }
        : { label: 'Open dashboard', href: '/app/dashboard' };

  const lowestScenarioPoint = Math.min(...simulatorTrajectory.map((point) => point.scenario));
  const lastScenarioPoint = simulatorTrajectory[simulatorTrajectory.length - 1]?.scenario ?? financialMetrics.currentCash;
  const scenarioNarrative =
    Math.abs(scenarioState.monthlyImpact) < 100
      ? 'You are viewing the shared baseline forecast with no extra scenario applied yet.'
      : scenarioState.monthlyImpact >= 0
        ? `This scenario removes about ${formatCurrency(Math.abs(scenarioState.monthlyImpact))} per month starting in ${scenarioState.startMonth}.`
        : `This scenario adds about ${formatCurrency(Math.abs(scenarioState.monthlyImpact))} per month starting in ${scenarioState.startMonth}.`;

  const runSharedScenario = (scenarioInput, options = {}) => {
    applyScenario(
      {
        question: options.question ?? whatIfInput,
        label: scenarioInput.label,
        summary: scenarioInput.aiText,
        monthlyImpact: scenarioInput.monthlyImpact,
        startMonth: scenarioState.startMonth,
        source: options.source || scenarioInput?.meta?.source || 'manual',
      },
      { silent: true },
    );
  };

  const handleImpactChange = (nextAmount) => {
    const normalized = Math.max(-10000, Math.min(20000, Number(nextAmount) || 0));

    runSharedScenario(
      {
        label:
          scenarioState.label && scenarioState.label !== 'Baseline forecast'
            ? scenarioState.label
            : 'Manual scenario',
        aiText:
          displayedResult?.aiText
          || 'Manual controls are adjusting the shared forecast for the next six months.',
        monthlyImpact: normalized,
      },
      { source: 'manual' },
    );
  };

  const runScenario = (text) => {
    if (!text.trim()) {
      const fallback = fallbackScenarios.default;
      setAiResult(fallback);
      runSharedScenario(fallback, { question: 'Default scenario', source: 'fallback' });
      setStatusBanner({
        tone: 'neutral',
        message: 'Ran the built-in demo scenario. Add a question to hit the live model.',
      });
      notify('Ran the default scenario.');
      return;
    }

    setIsThinking(true);
    setAiResult(null);
    setStatusBanner({
      tone: 'neutral',
      message: aiHealth.configured
        ? `Sending your scenario to Groq${aiHealth.model ? ` using ${formatModelName(aiHealth.model)}` : ''}...`
        : 'Trying the AI backend now. If it is unavailable, the simulator will fall back to the built-in demo logic.',
    });

    fetch('/api/scenario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: text,
        context: {
          shop: {
            name: profile.shopName,
            owner: profile.ownerName,
            businessType: profile.businessType,
            employees: profile.employees,
            monthlyRevenue: financialMetrics.monthlyRevenue,
            fixedCosts: financialMetrics.fixedCosts,
          },
          bankConnection: {
            name: bankConnection.name,
            source: bankConnection.source,
            lastSynced: bankConnection.lastSynced,
          },
          financialMetrics: {
            currentCash: financialMetrics.currentCash,
            safeToSpend: financialMetrics.safeToSpend,
            runwayDays: financialMetrics.runwayDays,
            pendingInvoices: financialMetrics.pendingInvoices,
            upcomingBills: financialMetrics.upcomingBills,
            projectedMonthlyNet: financialMetrics.projectedMonthlyNet,
          },
          activeScenario: {
            label: scenarioState.label,
            monthlyImpact: scenarioState.monthlyImpact,
            startMonth: scenarioState.startMonth,
          },
          activeProblems: problems.map((problem) => ({
            category: problem.category,
            severity: problem.severity,
            title: problem.title,
            description: problem.desc,
          })),
        },
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Scenario request failed.');
        }

        return data;
      })
      .then((result) => {
        setAiResult(result);
        runSharedScenario(result, { question: text, source: result?.meta?.source || 'groq' });
        setStatusBanner({
          tone: 'live',
          message: `Live AI response received${result?.meta?.model ? ` from ${formatModelName(result.meta.model)}` : ''}.`,
        });
      })
      .catch((error) => {
        const fallback = matchScenario(text);
        const errorMessage = error instanceof Error ? error.message : 'Scenario analysis is unavailable right now.';
        setAiResult(fallback);
        runSharedScenario(fallback, { question: text, source: 'fallback' });
        setStatusBanner({
          tone: 'warning',
          message: `${errorMessage} Showing the built-in demo fallback instead.`,
        });
        notify(
          /Missing Groq API key|Groq rejected the API key|Groq rate limit|timed out/i.test(errorMessage)
            ? errorMessage
            : 'Groq is unavailable for scenarios right now. Showing the demo fallback instead.',
          'warning',
        );
      })
      .finally(() => {
        setIsThinking(false);
      });
  };

  const handleSuggestionClick = (suggestion) => {
    setWhatIfInput(suggestion);
    runScenario(suggestion);
  };

  const handleScenarioAction = (action) => {
    if (action.actionId) {
      takeAction(action.actionId);
    }

    if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <div className="pb-20 pt-4 max-w-6xl mx-auto">
      <div className="mb-12 flex flex-col gap-5 md:flex-row md:justify-between md:items-end border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-4xl tracking-tighter font-medium text-zinc-950 mb-2">Growth Simulator</h1>
          <p className="text-zinc-500">Test business decisions against the same 6-month forecast the dashboard is using.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="neutral">What-If Lab</Badge>
          <Badge
            className={cn(
              aiHealth.status === 'ready' && aiHealth.configured && 'bg-emerald-50 border-emerald-200 text-emerald-800',
              (!aiHealth.configured || aiHealth.status === 'error') && 'bg-amber-50 border-amber-200 text-amber-800',
              aiHealth.status === 'checking' && 'bg-zinc-100 border-zinc-200 text-zinc-700',
            )}
          >
            {aiHealth.status === 'checking'
              ? 'Checking AI'
              : aiHealth.configured
                ? `Live AI${aiHealth.model ? ` - ${formatModelName(aiHealth.model)}` : ''}`
                : 'Demo Fallback'}
          </Badge>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="mb-8"
      >
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-4">
            <Lightning size={18} weight="fill" className="text-zinc-400" />
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Ask a what-if question</span>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={whatIfInput}
              onChange={(event) => setWhatIfInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && runScenario(whatIfInput)}
              placeholder="What if I hire another employee? What if sales drop 20%?"
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-3.5 text-[15px] font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
            />
            <Button
              variant="primary"
              className="px-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              onClick={() => runScenario(whatIfInput)}
              disabled={isThinking}
            >
              {isThinking ? <SpinnerGap size={18} weight="bold" className="animate-spin" /> : <PaperPlaneRight size={18} weight="fill" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {scenarioSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-300 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {statusBanner?.message ? (
              <motion.div
                key={`${statusBanner.tone}-${statusBanner.message}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                className={cn(
                  'mt-5 rounded-2xl border px-4 py-3 text-sm font-medium',
                  statusBanner.tone === 'live' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                  statusBanner.tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
                  statusBanner.tone === 'neutral' && 'border-zinc-200 bg-zinc-50 text-zinc-700',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">
                    {statusBanner.tone === 'live' ? (
                      <CheckCircle size={16} weight="fill" className="text-emerald-700" />
                    ) : isThinking ? (
                      <SpinnerGap size={16} weight="bold" className="animate-spin text-zinc-500" />
                    ) : (
                      <Lightning size={16} weight="fill" className={statusBanner.tone === 'warning' ? 'text-amber-700' : 'text-zinc-500'} />
                    )}
                  </span>
                  <p>{statusBanner.message}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {isThinking || displayedResult ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="mt-5 pt-5 border-t border-zinc-100"
              >
                {isThinking ? (
                  <div className="flex items-center gap-3 py-2">
                    <SpinnerGap size={16} weight="bold" className="text-zinc-400 animate-spin" />
                    <span className="text-sm text-zinc-500 font-medium">AI is analyzing your scenario...</span>
                  </div>
                ) : displayedResult ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} weight="fill" className="text-zinc-400" />
                      <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{displayedResult.label}</span>
                    </div>
                    <p className="text-[15px] text-zinc-600 leading-relaxed">{displayedResult.aiText}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <span className="text-xs font-semibold text-zinc-500">Impact:</span>
                      <span className="text-sm font-mono font-semibold text-zinc-900">{formatImpact(displayedResult.monthlyImpact)}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button variant="primary" onClick={() => handleScenarioAction({ href: '/app/dashboard' })}>
                        View on dashboard
                      </Button>
                      <Button variant="outline" onClick={() => handleScenarioAction(riskAction)}>
                        {riskAction.label}
                      </Button>
                      {Math.abs(scenarioState.monthlyImpact) >= 100 ? (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            clearScenario({ message: 'Scenario reset to the baseline forecast.' });
                            setAiResult(null);
                            setStatusBanner({
                              tone: 'neutral',
                              message: 'Returned to the shared baseline forecast.',
                            });
                          }}
                        >
                          Reset scenario
                        </Button>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col h-full !p-8 border-2 border-zinc-100 hover:border-zinc-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-medium tracking-tight text-zinc-950">Manual Controls</h2>
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">
                {Math.abs(scenarioState.monthlyImpact) >= 100 ? 'Applied' : 'Baseline'}
              </span>
            </div>

            <div className="mb-10">
              <label className="block text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Monthly Impact</label>
              <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                <button onClick={() => handleImpactChange(scenarioState.monthlyImpact - 500)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-sm">
                  <Minus weight="bold" />
                </button>
                <div className="flex-1 text-center font-mono text-3xl font-medium tracking-tight text-zinc-950">
                  {formatImpact(scenarioState.monthlyImpact)}
                </div>
                <button onClick={() => handleImpactChange(scenarioState.monthlyImpact + 500)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-sm">
                  <Plus weight="bold" />
                </button>
              </div>
            </div>

            <div className="mb-12">
              <label className="block text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Start Month</label>
              <select
                value={scenarioState.startMonth}
                onChange={(event) => setScenarioStartMonth(event.target.value)}
                className="w-full bg-white p-4 rounded-xl border border-zinc-200 text-[16px] font-medium text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 appearance-none shadow-sm"
              >
                {scenarioMonthOptions.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <Button className="w-full py-4 text-[15px] shadow-md border-zinc-900" variant="primary" onClick={() => runScenario(whatIfInput)}>
                Run Simulation <Play weight="fill" className="ml-2" />
              </Button>
              {Math.abs(scenarioState.monthlyImpact) >= 100 ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    clearScenario({ message: 'Scenario reset to the baseline forecast.' });
                    setAiResult(null);
                    setStatusBanner({
                      tone: 'neutral',
                      message: 'Returned to the shared baseline forecast.',
                    });
                  }}
                >
                  Reset to baseline
                </Button>
              ) : null}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-2 flex flex-col gap-6">
          <Card className="h-[400px] flex flex-col p-8 border border-zinc-200 pb-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-medium tracking-tight text-zinc-950">Projected Cash Balance</h3>
              <div className="flex gap-6 text-sm font-medium">
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-zinc-300"></div>
                  Current
                </div>
                <div className="flex items-center gap-2 text-zinc-950">
                  <div className="w-4 h-0.5 bg-zinc-950"></div>
                  Simulated
                </div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0 bg-white pt-2 pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulatorTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f4f4f5" />
                  <ReferenceArea y1={0} y2={financialMetrics.safetyFloor} fill="#f43f5e" fillOpacity={0.03} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa', fontFamily: 'monospace' }} tickFormatter={(value) => `$${value / 1000}k`} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontWeight: 500, color: '#09090b', fontFamily: 'monospace' }}
                    formatter={(value) => [formatCurrency(value, 2), '']}
                    labelStyle={{ color: '#71717a', marginBottom: '4px', fontSize: '12px', fontFamily: 'sans-serif' }}
                    cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }}
                  />
                  <Line type="monotone" dataKey="base" stroke="#d4d4d8" strokeWidth={2} strokeDasharray="6 6" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="scenario" stroke="#09090b" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#09090b', strokeWidth: 0 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-[1.5] p-8 bg-white border border-zinc-200">
              <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Lowest point</span>
              <p className="text-4xl font-medium tracking-tighter mb-2 mt-4 font-mono text-zinc-950">
                {formatCurrency(lowestScenarioPoint, 2)}
              </p>
              <p className="text-[13px] text-zinc-600 font-semibold bg-zinc-100 inline-block px-3 py-1.5 rounded-lg mt-2 border border-zinc-200">
                {lowestScenarioPoint < financialMetrics.safetyFloor ? 'Drops below target minimum.' : 'Within safe range.'}
              </p>
            </Card>
            <Card className="flex-[2.5] p-8 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">AI Recommendation</span>
              <p className="text-zinc-600 text-[16px] leading-relaxed mt-4">
                <span className="font-semibold text-zinc-950">Current runway:</span> {financialMetrics.runwayDays} days. {scenarioNarrative}{' '}
                The ending simulated balance is {formatCurrency(lastScenarioPoint, 2)}, and the shared safety floor stays at {formatCurrency(financialMetrics.safetyFloor, 2)}.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
