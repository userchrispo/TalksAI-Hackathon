import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, Minus, Play, Lightning, PaperPlaneRight, SpinnerGap, CheckCircle } from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useAppContext } from '../context/useAppContext';
import { cn } from '../utils';

void motion;

const mockData = [
  { month: 'Jun', base: 10421.10, scenario: 10421.10 },
  { month: 'Jul', base: 12841.05, scenario: 11094.22 },
  { month: 'Aug', base: 11018.42, scenario: 6018.42 },
  { month: 'Sep', base: 14299.90, scenario: 5299.90 },
  { month: 'Oct', base: 16112.16, scenario: 4112.16 },
  { month: 'Nov', base: 18911.50, scenario: 6911.50 },
  { month: 'Dec', base: 20188.22, scenario: 12188.22 },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

const scenarioSuggestions = [
  "What if I hire another technician?",
  "What if I raise prices by 10%?",
  "What if my biggest client stops paying?",
  "What if I buy a $15,000 lift?",
];

const scenarioResponses = {
  hire: {
    monthlyImpact: 4500,
    aiText: "Hiring another technician would add about $4,500 per month in salary and benefits. Based on your current runway, that puts pressure on Oct-Nov. Consider hiring part-time first or waiting until January when seasonal revenue picks back up.",
    label: "New hire - full-time technician"
  },
  prices: {
    monthlyImpact: -2800,
    aiText: "A 10% price increase on your current volume would add about $2,800 per month in revenue. Your cash position stays healthy throughout, so this is one of the safer moves in the demo.",
    label: "Price increase - 10% across services"
  },
  client: {
    monthlyImpact: 6000,
    aiText: "Losing your biggest client would remove roughly $6,000 per month in revenue. That puts the account into the danger zone by September, so diversifying now is the safer story.",
    label: "Client loss - largest account"
  },
  equipment: {
    monthlyImpact: 2500,
    aiText: "A $15,000 equipment purchase financed over 6 months adds about $2,500 per month. The runway stays above the target minimum, but only narrowly in October.",
    label: "Equipment - financed over 6 months"
  },
  default: {
    monthlyImpact: 3000,
    aiText: "Based on your scenario, the simulator estimated an impact of about $3,000 per month on cash flow. Use the controls to pressure-test how much room the shop really has.",
    label: "Custom scenario"
  }
};

function matchScenario(input) {
  const lower = input.toLowerCase();
  if (lower.includes('hire') || lower.includes('employee') || lower.includes('technician') || lower.includes('staff') || lower.includes('barber')) return scenarioResponses.hire;
  if (lower.includes('price') || lower.includes('raise') || lower.includes('charge more') || lower.includes('increase')) return scenarioResponses.prices;
  if (lower.includes('client') || lower.includes('customer') || lower.includes('stop paying') || lower.includes('lose') || lower.includes('leave')) return scenarioResponses.client;
  if (lower.includes('buy') || lower.includes('purchase') || lower.includes('equipment') || lower.includes('lift') || lower.includes('machine') || lower.includes('van') || lower.includes('truck')) return scenarioResponses.equipment;
  return scenarioResponses.default;
}

export const Simulator = () => {
  const { balance, updateExpenses, notify, profile, bankConnection, problems } = useAppContext();
  const [monthlyImpact, setMonthlyImpact] = useState(3000);
  const [whatIfInput, setWhatIfInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [startMonth, setStartMonth] = useState('August 2026');
  const [aiHealth, setAiHealth] = useState({
    status: 'checking',
    configured: false,
    model: '',
  });
  const [statusBanner, setStatusBanner] = useState({
    tone: 'neutral',
    message: 'Checking live AI connection...',
  });
  
  const dynamicMapData = mockData.map((point) => ({
    ...point,
    scenario: point.base - (monthlyImpact * (mockData.indexOf(point) * 0.5))
  }));

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

  const buildFallbackScenario = (text) => matchScenario(text || '');

  const buildScenarioContext = () => ({
    shop: {
      name: profile.shopName,
      owner: profile.ownerName,
      businessType: profile.businessType,
      employees: profile.employees,
      monthlyRevenue: profile.monthlyRevenue,
      trackingMethod: profile.trackingMethod,
    },
    bankConnection: {
      name: bankConnection.name,
      source: bankConnection.source,
      lastSynced: bankConnection.lastSynced,
    },
    balance: {
      current: balance.current,
      safeToSpend: balance.safe,
      pendingInvoices: balance.pendingInvoices,
      upcomingBills: balance.upcomingBills,
      runwayDays: balance.runwayDays,
    },
    startMonth,
    activeProblems: problems.map((problem) => ({
      category: problem.category,
      severity: problem.severity,
      title: problem.title,
      description: problem.desc,
    })),
  });

  const handleImpactChange = (nextAmount) => {
    const normalized = Math.max(-10000, Math.min(20000, Number(nextAmount) || 0));
    setMonthlyImpact(normalized);
    updateExpenses(normalized);
  };

  const runScenario = (text) => {
    if (!text.trim()) {
      const fallback = buildFallbackScenario('default');
      setAiResult(fallback);
      handleImpactChange(fallback.monthlyImpact);
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
        context: buildScenarioContext(),
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
        handleImpactChange(result.monthlyImpact);
        setStatusBanner({
          tone: 'live',
          message: `Live AI response received${result?.meta?.model ? ` from ${formatModelName(result.meta.model)}` : ''}.`,
        });
      })
      .catch((error) => {
        const fallback = buildFallbackScenario(text);
        const errorMessage = error instanceof Error ? error.message : 'Scenario analysis is unavailable right now.';
        setAiResult(fallback);
        handleImpactChange(fallback.monthlyImpact);
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

  return (
    <div className="pb-20 pt-4 max-w-6xl mx-auto">
      <div className="mb-12 flex justify-between items-end border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-4xl tracking-tighter font-medium text-zinc-950 mb-2">Growth Simulator</h1>
          <p className="text-zinc-500">Test business decisions against your 6-month forecasted runway.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="neutral">What-If Lab</Badge>
          <Badge className={cn(
            aiHealth.status === 'ready' && aiHealth.configured && 'bg-emerald-50 border-emerald-200 text-emerald-800',
            (!aiHealth.configured || aiHealth.status === 'error') && 'bg-amber-50 border-amber-200 text-amber-800',
            aiHealth.status === 'checking' && 'bg-zinc-100 border-zinc-200 text-zinc-700',
          )}>
            {aiHealth.status === 'checking'
              ? 'Checking AI'
              : aiHealth.configured
                ? `Live AI${aiHealth.model ? ` - ${formatModelName(aiHealth.model)}` : ''}`
                : 'Demo Fallback'}
          </Badge>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
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
              onChange={e => setWhatIfInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runScenario(whatIfInput)}
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
            {statusBanner?.message && (
              <motion.div
                key={`${statusBanner.tone}-${statusBanner.message}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className={cn(
                  "mt-5 rounded-2xl border px-4 py-3 text-sm font-medium",
                  statusBanner.tone === 'live' && "border-emerald-200 bg-emerald-50 text-emerald-900",
                  statusBanner.tone === 'warning' && "border-amber-200 bg-amber-50 text-amber-900",
                  statusBanner.tone === 'neutral' && "border-zinc-200 bg-zinc-50 text-zinc-700",
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
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(isThinking || aiResult) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="mt-5 pt-5 border-t border-zinc-100"
              >
                {isThinking ? (
                  <div className="flex items-center gap-3 py-2">
                    <SpinnerGap size={16} weight="bold" className="text-zinc-400 animate-spin" />
                    <span className="text-sm text-zinc-500 font-medium">AI is analyzing your scenario...</span>
                  </div>
                ) : aiResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} weight="fill" className="text-zinc-400" />
                      <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{aiResult.label}</span>
                    </div>
                    <p className="text-[15px] text-zinc-600 leading-relaxed">{aiResult.aiText}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <span className="text-xs font-semibold text-zinc-500">Impact:</span>
                      <span className="text-sm font-mono font-semibold text-zinc-900">
                        {formatImpact(aiResult.monthlyImpact)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col h-full !p-8 border-2 border-zinc-100 hover:border-zinc-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-medium tracking-tight text-zinc-950">Manual Controls</h2>
              <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">Active</span>
            </div>
            
            <div className="mb-10">
              <label className="block text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Monthly Impact</label>
              <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                <button onClick={() => handleImpactChange(monthlyImpact - 500)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-sm">
                  <Minus weight="bold" />
                </button>
                <div className="flex-1 text-center font-mono text-3xl font-medium tracking-tight text-zinc-950">
                  {formatImpact(monthlyImpact)}
                </div>
                <button onClick={() => handleImpactChange(monthlyImpact + 500)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-sm">
                  <Plus weight="bold" />
                </button>
              </div>
            </div>

            <div className="mb-12">
              <label className="block text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Start Month</label>
              <select value={startMonth} onChange={(event) => setStartMonth(event.target.value)} className="w-full bg-white p-4 rounded-xl border border-zinc-200 text-[16px] font-medium text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 appearance-none shadow-sm">
                <option>August 2026</option>
                <option>September 2026</option>
                <option>October 2026</option>
              </select>
            </div>

            <Button className="w-full mt-auto py-4 text-[15px] shadow-md border-zinc-900" variant="primary" onClick={() => runScenario(whatIfInput)}>
              Run Simulation <Play weight="fill" className="ml-2" />
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-2 flex flex-col gap-6">
          <Card className="h-[400px] flex flex-col p-8 border border-zinc-200 pb-12">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-medium tracking-tight text-zinc-950">Projected Cash Balance</h3>
               <div className="flex gap-6 text-sm font-medium">
                 <div className="flex items-center gap-2 text-zinc-400"><div className="w-4 h-0.5 border-t-2 border-dashed border-zinc-300"></div> Current</div>
                 <div className="flex items-center gap-2 text-zinc-950"><div className="w-4 h-0.5 bg-zinc-950"></div> Simulated</div>
               </div>
            </div>
            <div className="flex-1 w-full min-h-0 bg-white pt-2 pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicMapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f4f4f5" />
                  <ReferenceArea y1={0} y2={4000} fill="#f43f5e" fillOpacity={0.03} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa', fontFamily: 'monospace' }} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontWeight: 500, color: '#09090b', fontFamily: 'monospace' }}
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
                ${Math.floor(Math.min(...dynamicMapData.map(d => d.scenario))).toLocaleString()}
                <span className="text-xl text-zinc-400">.{Math.abs(Math.min(...dynamicMapData.map(d => d.scenario)) % 1).toFixed(2).substring(2)}</span>
              </p>
              <p className="text-[13px] text-zinc-600 font-semibold bg-zinc-100 inline-block px-3 py-1.5 rounded-lg mt-2 border border-zinc-200">
                {Math.min(...dynamicMapData.map(d => d.scenario)) < 4000 ? 'Drops below target minimum.' : 'Within safe range.'}
              </p>
            </Card>
            <Card className="flex-[2.5] p-8 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">AI Recommendation</span>
              <p className="text-zinc-600 text-[16px] leading-relaxed mt-4">
                <span className="font-semibold text-zinc-950">Current runway:</span> {balance.runwayDays} days. {monthlyImpact >= 0 ? `Adding ${formatCurrency(Math.abs(monthlyImpact))} monthly` : `Improving cash flow by ${formatCurrency(Math.abs(monthlyImpact))} monthly`} in {startMonth} {monthlyImpact >= 0 ? 'puts more pressure on your reserves during the slow season.' : 'gives the shop extra room during the slow season.'} Safe if you keep at least <span className="font-mono font-semibold text-zinc-900">{profileSafeMinimum(balance.safe)}</span> in reserve.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function profileSafeMinimum(safeValue) {
  return `$${Math.max(8000, safeValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
