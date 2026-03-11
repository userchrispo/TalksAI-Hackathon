import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { PaperPlaneRight, Paperclip, MicrophoneStage } from '@phosphor-icons/react';
import { useAppContext } from '../context/useAppContext';

void motion;

const springTrans = { type: "spring", stiffness: 100, damping: 20 };

const aiResponses = [
  {
    question: "Can I make payroll next Friday?",
    headline: <>Yes, but it will be <span className="underline decoration-2 underline-offset-4 decoration-zinc-300">tight</span>.</>,
    rows: [
      { label: "Bank today", value: "$10,421.84" },
      { label: "Payroll cost", value: "-$6,192.50" },
      { label: "Remaining after payroll", value: "$4,229.34" },
    ],
    summary: "You can cover payroll, but your remaining balance will be below your $8,000 safety threshold. Consider sending invoice reminders to your top 2 clients today."
  },
  {
    question: "Who owes me money?",
    headline: <>You have <span className="underline decoration-2 underline-offset-4 decoration-zinc-300">4 outstanding invoices</span> totaling $12,042.88.</>,
    rows: [
      { label: "Smith Auto Group", value: "$3,000.00 | 14 days late" },
      { label: "Martinez Fleet Svc", value: "$4,250.00 | 7 days late" },
      { label: "Coastal Towing", value: "$2,892.88 | Due tomorrow" },
      { label: "Elm St. Garage", value: "$1,900.00 | Due in 3 days" },
    ],
    summary: "Smith Auto Group is your biggest risk. They usually pay 10 to 14 days late, so sending a reminder now is one of the cleanest ways to protect next week's cash flow."
  },
  {
    question: "Can I afford to hire a junior tech?",
    headline: <>Hiring now is <span className="underline decoration-2 underline-offset-4 decoration-zinc-300">moderately risky</span>.</>,
    rows: [
      { label: "Avg monthly revenue", value: "$28,400.00" },
      { label: "Current monthly costs", value: "-$21,800.00" },
      { label: "Junior tech salary", value: "-$3,200.00/mo" },
    ],
    summary: "Adding $3,200 per month in salary would leave only a slim buffer. Consider waiting until January when revenue historically peaks, or hiring part-time first."
  },
  {
    question: "What happens if sales drop 20%?",
    headline: <>A 20% drop would put you in the <span className="underline decoration-2 underline-offset-4 decoration-zinc-300">danger zone within 6 weeks</span>.</>,
    rows: [
      { label: "Current monthly revenue", value: "$28,400.00" },
      { label: "Revenue at -20%", value: "$22,720.00" },
      { label: "Monthly shortfall", value: "-$5,680.00" },
    ],
    summary: "At a 20% drop, you'd burn through your cash reserve in about 45 days. Start building a 2-month emergency buffer now and identify which 3 clients are most at risk of churning."
  }
];

export const Assistant = () => {
  const { notify, profile, balance, bankConnection, problems } = useAppContext();
  const [messages, setMessages] = useState([
    { type: 'user', text: 'Can I afford to buy 50 sets of trailer tires today?' },
    {
      type: 'ai',
      headline: <>Buying 50 sets of trailer tires today is <span className="underline decoration-2 underline-offset-4 decoration-zinc-300">not recommended</span>.</>,
      rows: [
        { label: "Bank today", value: "$10,421.84" },
        { label: "Payroll this Thursday", value: "-$6,192.50" },
        { label: "Largest client invoice", value: "Usually pays 10-14 days late" },
      ],
      summary: "High chance of overdraft by Friday if you buy now. Consider waiting until payment clears or asking for 50% upfront on the next three jobs."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "Can I make payroll next Friday?",
    "Who owes me money?",
    "Can I afford to hire a junior tech?",
    "What happens if sales drop 20%?"
  ];

  const buildFallbackReply = (question) => {
    const match = aiResponses.find((response) => response.question.toLowerCase() === question.toLowerCase());
    if (match) {
      return {
        headline: match.headline,
        rows: match.rows,
        summary: match.summary,
      };
    }

    return {
      headline: 'Here is the latest read on your cash position.',
      rows: [
        { label: 'Current balance', value: `$${balance.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Safe to spend', value: `$${balance.safe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Current runway', value: `${balance.runwayDays} days` },
      ],
      summary: `Based on ${profile.shopName}'s current financials, keep your reserve above $8,000 before making a large move. If you want, I can compare this against payroll, invoices, or supplier costs next.`,
    };
  };

  const buildContextPayload = () => ({
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
    activeProblems: problems.map((problem) => ({
      category: problem.category,
      severity: problem.severity,
      title: problem.title,
      description: problem.desc,
    })),
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

  const handleSend = (text) => {
    const question = text || inputValue;
    if (!question.trim() || isTyping) return;

    setMessages(prev => [...prev, { type: 'user', text: question }]);
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
          },
        ]);
        notify(
          /Missing Groq API key|Groq rejected the API key|Groq rate limit|timed out/i.test(errorMessage)
            ? errorMessage
            : 'Groq is unavailable right now. Showing the demo fallback instead.',
          'warning',
        );
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative max-w-4xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-center shrink-0 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl tracking-tight font-medium text-zinc-950 mb-2">AI Copilot</h1>
          <p className="text-zinc-500">Conversational insights into your financial future.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 flex flex-col gap-12 pr-4 no-scrollbar pt-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            msg.type === 'user' ? (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springTrans}
                className="flex justify-end"
              >
                <div className="bg-white border-2 border-zinc-100 rounded-[2rem] rounded-tr-xl px-8 py-5 max-w-xl text-[16px] font-medium text-zinc-900 shadow-sm">
                  {msg.text}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springTrans, delay: 0.1 }}
                className="flex justify-start"
              >
                <Card className="max-w-2xl w-full p-10 border border-zinc-200 bg-white shadow-sm">
                  <div className="mb-8 flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-600"></span>
                    </span>
                    <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Analysis Complete</p>
                  </div>
                  
                  <h3 className="text-3xl font-medium tracking-tight mb-10 text-zinc-950">
                    {msg.headline}
                  </h3>
                  
                  <div className="flex flex-col gap-0 mb-10 border border-zinc-200 rounded-3xl overflow-hidden bg-white divide-y divide-zinc-200">
                    {msg.rows.map((row, rowIndex) => (
                      <div key={rowIndex} className={`flex justify-between items-center text-[16px] p-6 ${rowIndex % 2 === 0 ? 'bg-zinc-50/50' : 'bg-white'}`}>
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
                    {msg.summary}
                  </motion.p>
                </Card>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-100 rounded-[2rem] px-8 py-5 flex items-center gap-2">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-2 h-2 bg-zinc-400 rounded-full" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, ...springTrans }}
        className="shrink-0 pt-6"
      >
        <div className="flex gap-3 overflow-x-auto mb-6 pb-2 no-scrollbar">
          {suggestions.map((suggestion) => (
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
            placeholder="Ask about your cash flow..." 
            className="w-full bg-transparent border-none pl-6 pr-36 py-4 focus:outline-none focus:ring-0 text-[16px] font-medium"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
