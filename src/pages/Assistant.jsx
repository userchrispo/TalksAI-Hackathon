import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MicrophoneStage, PaperPlaneRight, Paperclip, Sparkle } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/useAppContext';

void motion;

const springTrans = { type: 'spring', stiffness: 100, damping: 20 };

const suggestionPrompts = [
  'Can I make payroll next Friday?',
  'Who owes me money right now?',
  'Can I afford to hire a junior tech?',
  'What happens if sales drop 20%?',
];

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildStarterMessages(financialMetrics, problems) {
  const latePayer = problems.find((problem) => problem.category === 'Late Payer');

  return [
    { type: 'user', text: 'How much room do I have before payroll?' },
    {
      type: 'ai',
      headline: 'You can make payroll, but the buffer is still tighter than it should be.',
      rows: [
        { label: 'Cash in bank', value: formatMoney(financialMetrics.currentCash) },
        { label: 'Safe to spend', value: formatMoney(financialMetrics.safeToSpend) },
        { label: 'Current runway', value: `${financialMetrics.runwayDays} days` },
      ],
      summary: latePayer
        ? 'The cleanest fix is still pulling in the late $3,000 invoice before payroll lands. That change updates every page in the app immediately.'
        : 'The operating model is stable enough to cover payroll, but large purchases should still wait until the next invoice batch lands.',
      actions: latePayer
        ? [
            { id: 'collect-late-invoice', label: 'Mark reminder sent', actionId: 'collect-late-invoice', href: '/app/problems' },
            { id: 'open-simulator', label: 'Pressure-test the runway', href: '/app/simulator' },
          ]
        : [{ id: 'open-simulator', label: 'Pressure-test the runway', href: '/app/simulator' }],
      source: 'shared-forecast',
    },
  ];
}

function buildAssistantActions(question, problems) {
  const lower = question.toLowerCase();
  const actions = [];
  const hasLatePayer = problems.some((problem) => problem.category === 'Late Payer');
  const hasCashCrunch = problems.some((problem) => problem.category === 'Cash Crunch');
  const hasSupplierRisk = problems.some((problem) => problem.category === 'Rising Costs');

  if (/(payroll|afford|buy|cash|reserve|spend)/.test(lower)) {
    if (hasLatePayer) {
      actions.push({ id: 'collect-late-invoice', label: 'Mark reminder sent', actionId: 'collect-late-invoice', href: '/app/problems' });
    }

    actions.push({ id: 'open-simulator', label: 'Run in simulator', href: '/app/simulator' });
  }

  if (/(owe|invoice|late|paid|payer|collections)/.test(lower)) {
    if (hasLatePayer) {
      actions.push({ id: 'resolve-late-payer', label: 'Clear late payer risk', actionId: 'collect-late-invoice', href: '/app/problems' });
    }

    actions.push({ id: 'open-problems', label: 'Open risk radar', href: '/app/problems' });
  }

  if (/(hire|tech|technician|employee|staff)/.test(lower)) {
    actions.push({ id: 'simulate-hire', label: 'Apply hiring scenario', actionId: 'simulate-hire', href: '/app/simulator' });
  }

  if (/(drop|client|customer|sales|churn|stop paying)/.test(lower)) {
    actions.push({ id: 'simulate-revenue-dip', label: 'Stress-test downside', actionId: 'simulate-revenue-dip', href: '/app/simulator' });
  }

  if (/(price|margin|supplier|quote)/.test(lower) && hasSupplierRisk) {
    actions.push({ id: 'update-pricing', label: 'Apply pricing update', actionId: 'update-pricing', href: '/app/assistant' });
  }

  if (hasCashCrunch && actions.length < 2) {
    actions.push({ id: 'defer-overlap-bills', label: 'Apply payment plan', actionId: 'defer-overlap-bills', href: '/app/problems' });
  }

  if (!actions.length) {
    actions.push({ id: 'open-dashboard', label: 'Open dashboard', href: '/app/dashboard' });
    actions.push({ id: 'simulate-revenue-lift', label: 'Test upside plan', actionId: 'simulate-revenue-lift', href: '/app/simulator' });
  }

  return actions.filter((action, index, items) => items.findIndex((candidate) => candidate.id === action.id) === index).slice(0, 2);
}

export const Assistant = () => {
  const navigate = useNavigate();
  const {
    bankConnection,
    financialMetrics,
    notify,
    problems,
    profile,
    recommendationGroups,
    scenarioState,
    takeAction,
  } = useAppContext();
  const [messages, setMessages] = useState(() => buildStarterMessages(financialMetrics, problems));
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const buildFallbackReply = (question) => {
    const actions = buildAssistantActions(question, problems);
    const latePayer = problems.find((problem) => problem.category === 'Late Payer');
    const pricingRisk = problems.find((problem) => problem.category === 'Rising Costs');

    if (/payroll/i.test(question)) {
      return {
        headline: 'Yes, but payroll will land inside your tighter buffer.',
        rows: [
          { label: 'Bank today', value: formatMoney(financialMetrics.currentCash) },
          { label: 'Safe to spend', value: formatMoney(financialMetrics.safeToSpend) },
          { label: 'Reserve target', value: formatMoney(financialMetrics.safetyFloor) },
        ],
        summary: latePayer
          ? 'You can buy more room by collecting the late payer before payroll closes. That is the fastest fix already available in the demo.'
          : 'Payroll is covered, but new equipment or extra payroll should wait until the next invoice batch lands.',
        actions,
      };
    }

    if (/owe|invoice|payer|paid/i.test(question)) {
      return {
        headline: `You still have ${formatMoney(financialMetrics.pendingInvoices)} tied up in receivables.`,
        rows: [
          { label: 'Late payer risk', value: latePayer ? 'Smith Auto Group | $3,000' : 'Cleared' },
          { label: 'Safe to spend', value: formatMoney(financialMetrics.safeToSpend) },
          { label: 'Current runway', value: `${financialMetrics.runwayDays} days` },
        ],
        summary: latePayer
          ? 'Smith Auto Group is still the clearest place to free up cash this week.'
          : 'Collections pressure is lower now, so the next best move is keeping invoices tight and current.',
        actions,
      };
    }

    if (/hire|technician|employee|staff/i.test(question)) {
      return {
        headline: 'Hiring is possible, but it changes the forecast immediately.',
        rows: [
          { label: 'Base monthly net', value: formatMoney(financialMetrics.baseMonthlyNet) },
          { label: 'Projected net after hire', value: formatMoney(financialMetrics.baseMonthlyNet - 3200) },
          { label: 'Current runway', value: `${financialMetrics.runwayDays} days` },
        ],
        summary: 'Use the simulator before you commit so the hiring cost shows up across the dashboard and runway math.',
        actions,
      };
    }

    if (/drop|sales|client|customer|churn/i.test(question)) {
      return {
        headline: 'A sales dip would hit the reserve faster than the current dashboard suggests.',
        rows: [
          { label: 'Current runway', value: `${financialMetrics.runwayDays} days` },
          { label: 'Monthly headroom today', value: formatMoney(financialMetrics.projectedMonthlyNet) },
          { label: 'Open risks', value: `${financialMetrics.activeRiskCount}` },
        ],
        summary: 'Run the downside case and compare it against the late payer and supplier fixes before making any growth decision.',
        actions,
      };
    }

    return {
      headline: 'Here is the latest read on the shared cash position.',
      rows: [
        { label: 'Current balance', value: formatMoney(financialMetrics.currentCash) },
        { label: 'Safe to spend', value: formatMoney(financialMetrics.safeToSpend) },
        { label: 'Current runway', value: `${financialMetrics.runwayDays} days` },
      ],
      summary: pricingRisk
        ? 'The supplier increase is still the cleanest margin fix in the current model.'
        : `Based on ${profile.shopName}'s shared forecast, the next useful move is either stress-testing a downside case or locking in an upside scenario before you spend more cash.`,
      actions,
    };
  };

  const buildContextPayload = () => ({
    shop: {
      name: profile.shopName,
      owner: profile.ownerName,
      businessType: profile.businessType,
      employees: profile.employees,
      monthlyRevenue: financialMetrics.monthlyRevenue,
      fixedCosts: financialMetrics.fixedCosts,
      trackingMethod: profile.trackingMethod,
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
      safetyFloor: financialMetrics.safetyFloor,
    },
    activeScenario: {
      label: scenarioState.label,
      monthlyImpact: scenarioState.monthlyImpact,
      startMonth: scenarioState.startMonth,
      source: scenarioState.source,
    },
    activeProblems: problems.map((problem) => ({
      category: problem.category,
      severity: problem.severity,
      title: problem.title,
      description: problem.desc,
    })),
    recommendations: recommendationGroups.flatMap((group) =>
      group.items.map((item) => ({
        window: group.label,
        title: item.title,
        detail: item.detail,
      })),
    ),
  });

  const buildHistoryPayload = () =>
    messages.map((message) => {
      if (message.type === 'user') {
        return { type: 'user', text: message.text };
      }

      return {
        type: 'ai',
        headline: typeof message.headline === 'string' ? message.headline : 'Analysis shared',
        rows: message.rows || [],
        summary: message.summary || '',
      };
    });

  const handleAction = (action) => {
    if (action.actionId) {
      takeAction(action.actionId);
    }

    if (action.href) {
      navigate(action.href);
    }
  };

  const handleSend = (text) => {
    const question = text || inputValue;
    if (!question.trim() || isTyping) {
      return;
    }

    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    setInputValue('');
    setIsTyping(true);

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        context: buildContextPayload(),
        history: buildHistoryPayload(),
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Groq request failed.');
        }

        return data;
      })
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            headline: data.headline,
            rows: Array.isArray(data.rows) ? data.rows : [],
            summary: data.summary,
            actions: buildAssistantActions(question, problems),
            source: 'groq',
          },
        ]);
      })
      .catch((error) => {
        const fallback = buildFallbackReply(question);
        const errorMessage = error instanceof Error ? error.message : 'Groq is unavailable right now.';
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            headline: fallback.headline,
            rows: fallback.rows,
            summary: fallback.summary,
            actions: fallback.actions,
            source: 'fallback',
          },
        ]);
        notify(
          /Missing Groq API key|Groq rejected the API key|Groq rate limit|timed out/i.test(errorMessage)
            ? errorMessage
            : 'Groq is unavailable right now. Showing the built-in forecast response instead.',
          'warning',
        );
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative max-w-4xl mx-auto w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center shrink-0 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl tracking-tight font-medium text-zinc-950 mb-2">AI Copilot</h1>
          <p className="text-zinc-500">Ask about the same shared forecast the dashboard and simulator are using.</p>
        </div>
        <Badge className="bg-emerald-50 border-emerald-200 text-emerald-900">
          <Sparkle size={14} weight="fill" className="mr-2" />
          Action-ready
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 flex flex-col gap-12 pr-4 no-scrollbar pt-4">
        <AnimatePresence>
          {messages.map((message, index) =>
            message.type === 'user' ? (
              <motion.div
                key={`${message.type}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springTrans}
                className="flex justify-end"
              >
                <div className="bg-white border-2 border-zinc-100 rounded-[2rem] rounded-tr-xl px-8 py-5 max-w-xl text-[16px] font-medium text-zinc-900 shadow-sm">
                  {message.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${message.type}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTrans, delay: 0.1 }}
                className="flex justify-start"
              >
                <Card className="max-w-2xl w-full p-10 border border-zinc-200 bg-white shadow-sm">
                  <div className="mb-8 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-600"></span>
                      </span>
                      <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">
                        {message.source === 'fallback' ? 'Fallback analysis' : 'Shared forecast analysis'}
                      </p>
                    </div>
                    <Badge variant="neutral">{message.source === 'groq' ? 'Live Groq' : 'App Model'}</Badge>
                  </div>

                  <h3 className="text-3xl font-medium tracking-tight mb-10 text-zinc-950">{message.headline}</h3>

                  <div className="flex flex-col gap-0 mb-10 border border-zinc-200 rounded-3xl overflow-hidden bg-white divide-y divide-zinc-200">
                    {message.rows.map((row, rowIndex) => (
                      <div key={`${row.label}-${rowIndex}`} className={`flex justify-between items-center text-[16px] p-6 ${rowIndex % 2 === 0 ? 'bg-zinc-50/50' : 'bg-white'}`}>
                        <span className="text-zinc-500 font-medium">{row.label}</span>
                        <span className="font-semibold text-zinc-900 font-mono tracking-tight text-lg">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-zinc-600 text-[17px] leading-relaxed relative"
                  >
                    {message.summary}
                  </motion.p>

                  {message.actions?.length ? (
                    <div className="mt-8 flex flex-wrap gap-3">
                      {message.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant={action.actionId ? 'primary' : 'outline'}
                          className={action.actionId ? 'px-5 py-3' : 'px-5 py-3 bg-white'}
                          onClick={() => handleAction(action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ),
          )}
        </AnimatePresence>

        {isTyping ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-zinc-100 rounded-[2rem] px-8 py-5 flex items-center gap-2">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-2 h-2 bg-zinc-400 rounded-full" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
            </div>
          </motion.div>
        ) : null}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, ...springTrans }}
        className="shrink-0 pt-6"
      >
        <div className="flex gap-3 overflow-x-auto mb-6 pb-2 no-scrollbar">
          {suggestionPrompts.map((suggestion) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={suggestion}
              className="whitespace-nowrap bg-white border-2 border-zinc-100 text-zinc-600 text-[14px] px-6 py-3 rounded-full transition-colors font-medium hover:text-zinc-950 hover:border-zinc-300 shadow-sm"
              onClick={() => handleSend(suggestion)}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>

        <div className="relative flex items-center shadow-lg rounded-[3rem] bg-white border border-zinc-200 p-3">
          <input
            type="text"
            placeholder="Ask about payroll, invoices, pricing, or runway..."
            className="w-full bg-transparent border-none pl-6 pr-36 py-4 focus:outline-none focus:ring-0 text-[16px] font-medium"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          />
          <div className="absolute right-4 flex gap-2 items-center">
            <button type="button" className="p-3 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-50" onClick={() => notify('Attachment uploads are not wired yet in this demo.')}>
              <Paperclip size={22} weight="regular" />
            </button>
            <button type="button" className="p-3 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-50" onClick={() => notify('Voice capture is coming next.')}>
              <MicrophoneStage size={22} weight="regular" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-zinc-950 text-white rounded-full ml-1 shadow-md hover:bg-zinc-800 transition-colors"
              onClick={() => handleSend()}
              type="button"
            >
              <PaperPlaneRight size={20} weight="fill" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
