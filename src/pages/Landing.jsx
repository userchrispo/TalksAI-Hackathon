import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNav } from '../components/layout/TopNav';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Warning, ArrowRight, Target, Funnel, ChartLineUp, Lightning, CaretRight, CheckCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../lib/appRoutes';

void motion;

const prompts = [
  "Can I make payroll next Friday?",
  "Who owes me money right now?",
  "What if sales drop 20% next month?",
  "Can I afford to hire another tech?",
];

/* â”€â”€ Animation variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};
const slideUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 18, delay: 0.1 } }
};

/* â”€â”€ Typewriter micro-component (isolated, perpetual) â”€â”€ */
const TypewriterPrompts = React.memo(() => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = prompts[idx];
    let timeout;
    if (!isDeleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 60);
    } else if (!isDeleting && text.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 30);
    } else if (isDeleting && text.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setIdx((prev) => (prev + 1) % prompts.length);
      }, 0);
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, idx]);

  return (
    <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <Lightning size={18} weight="fill" className="text-zinc-400 shrink-0" />
      <span className="text-[15px] text-zinc-600 font-medium truncate">{text}</span>
      <motion.span 
        animate={{ opacity: [1, 0] }} 
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="w-[2px] h-5 bg-zinc-400 shrink-0"
      />
    </div>
  );
});

/* â”€â”€ Shimmer bar (perpetual, isolated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ShimmerBar = React.memo(({ width = "100%", delay = 0 }) => (
  <div className={`h-3 rounded-lg bg-zinc-100 relative overflow-hidden`} style={{ width }}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/60 to-transparent"
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 2.5, repeat: Infinity, delay, ease: "linear" }}
    />
  </div>
));

/* â”€â”€ Breathing status dot (perpetual, isolated) â”€â”€ */
const BreathingDot = React.memo(({ color = "bg-emerald-500" }) => (
  <span className="flex h-2.5 w-2.5 relative">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-40`} />
    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
  </span>
));

/* â”€â”€ Priority list items (auto-reorder simulation) â”€â”€ */
const AlertItems = React.memo(() => {
  const items = [
    { id: 1, text: "Smith Auto - $3,000 overdue 14d", priority: "high" },
    { id: 2, text: "Tax + rent overlap on the 18th", priority: "high" },
    { id: 3, text: "Parts vendor raised prices 8%", priority: "med" },
  ];
  const [order, setOrder] = useState(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder(prev => {
        const copy = [...prev];
        const first = copy.shift();
        copy.push(first);
        return copy;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {order.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-zinc-100 rounded-xl"
          >
            <BreathingDot color={item.priority === "high" ? "bg-zinc-900" : "bg-zinc-400"} />
            <span className="text-[13px] text-zinc-700 font-medium truncate">{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/*  LANDING PAGE                                      */
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const Landing = () => {
  return (
    <div className="min-h-[100dvh] bg-[#fafafa] overflow-hidden selection:bg-zinc-900 selection:text-white font-sans relative">
      <TopNav />

      {/* â”€â”€â”€ HERO: Asymmetric Split Layout â”€â”€â”€ */}
      <section className="relative z-10 pt-32 pb-20 md:pt-44 md:pb-32 px-6 lg:px-12 max-w-[1400px] mx-auto min-h-[100dvh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center w-full">
          
          {/* Left: Copy â€” left-aligned per SKILL Rule 3 */}
          <motion.div 
            variants={stagger} initial="hidden" animate="show"
            className="lg:col-span-5 flex flex-col items-start"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-10 border border-zinc-200 bg-white rounded-full pl-2 pr-4 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="bg-zinc-900 text-white font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest">New</div>
              <span className="text-zinc-600 text-sm font-medium">AI Cash Flow Engine is live</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-6xl font-medium tracking-tighter text-zinc-950 leading-[1.05] mb-8"
            >
              See your cash flow
              <br />
              <span className="text-zinc-400">before it happens.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-base md:text-lg text-zinc-500 mb-12 max-w-[38ch] leading-relaxed"
            >
              The AI-powered dashboard for small businesses. Stop guessing - know exactly what you can spend today, this week, and this month.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to={APP_ROUTES.auth}>
                <Button magnetic variant="primary" className="h-[52px] px-8 text-[15px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">Start free trial</Button>
              </Link>
              <Link to={APP_ROUTES.demo}>
                <Button magnetic variant="outline" className="h-[52px] px-8 text-[15px]">View live demo</Button>
              </Link>
            </motion.div>

            {/* Hackathon badge */}
            <motion.div variants={fadeIn} className="flex items-center gap-3 mt-14 pt-8 border-t border-zinc-200 w-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm text-zinc-500 font-medium">Built during the <span className="text-zinc-900 font-semibold">Tribe Black Youth AI Hackathon 2026</span></p>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard Mockup with perpetual micro-animations */}
          <motion.div 
            className="lg:col-span-7"
            variants={slideUp} initial="hidden" animate="show"
          >
            <div className="border border-zinc-200/80 rounded-[2.5rem] bg-white p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden">
              
              {/* Row 1: Metric + AI Alert */}
              <div className="grid grid-cols-12 gap-4 mb-4">
                {/* Safe to Spend tile */}
                <div className="col-span-12 md:col-span-7 bg-zinc-50 rounded-[1.5rem] p-6 border border-zinc-100 flex flex-col justify-between min-h-[160px]">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Safe to spend</span>
                    <BreathingDot color="bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-4xl md:text-5xl font-mono font-medium tracking-tighter text-zinc-950">$14,528<span className="text-2xl text-zinc-300">.16</span></h2>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Over the next 7 days</p>
                  </div>
                </div>

                {/* AI Copilot alert tile */}
                <div className="col-span-12 md:col-span-5 bg-zinc-950 text-white rounded-[1.5rem] p-6 flex flex-col justify-between min-h-[160px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">AI Copilot</span>
                    <Warning weight="fill" className="text-zinc-400" size={18} />
                  </div>
                  <p className="text-[14px] font-medium leading-relaxed text-zinc-200 mt-4">
                    Vendor payout #4091 will overdraft your account by Friday. Delay or split it.
                  </p>
                </div>
              </div>

              {/* Row 2: Typewriter + Alert list */}
              <div className="grid grid-cols-12 gap-4">
                {/* AI input mockup with typewriter */}
                <div className="col-span-12 md:col-span-7 rounded-[1.5rem] flex flex-col gap-3">
                  <TypewriterPrompts />
                  <div className="flex gap-3">
                    <ShimmerBar width="60%" delay={0} />
                    <ShimmerBar width="35%" delay={0.8} />
                  </div>
                  <ShimmerBar width="80%" delay={1.6} />
                </div>

                {/* Priority alerts â€” auto-reordering */}
                <div className="col-span-12 md:col-span-5">
                  <AlertItems />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€â”€ FEATURES: Asymmetric 2fr / 1fr Grid â”€â”€â”€ */}
      <section id="features" className="relative z-10 py-32 md:py-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            className="max-w-2xl mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-zinc-950 mb-6 leading-[1.05]">Built for clarity.<br/>Scaled for your shop.</h2>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-[42ch]">
              We replaced generic bar charts with real AI modeling. Every number you see is backed by thousands of transaction simulations.
            </p>
          </motion.div>

          {/* Asymmetric grid: 2fr / 1fr â€” no 3-equal-cards per SKILL Rule */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 lg:gap-8 mb-6 lg:mb-8">
            
            {/* Wide: AI Cash Prediction */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
              className="border border-zinc-200 rounded-[2.5rem] p-10 lg:p-14 relative overflow-hidden flex flex-col group min-h-[480px] bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-shadow duration-700"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center">
                  <Target size={24} weight="duotone" className="text-zinc-800" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Core Engine</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium tracking-tight mb-4 text-zinc-950">AI Cash Prediction</h3>
              <p className="text-zinc-500 leading-relaxed text-[16px] mb-10 max-w-[42ch]">
                Our engine learns from your transaction history, seasonal patterns, and upcoming bills to give you one clear "Safe to Spend" number every morning.
              </p>
              
              {/* Floating card mockup */}
              <div className="mt-auto relative flex-1 min-h-[120px]">
                <motion.div 
                  className="absolute bottom-0 right-0 w-[85%] bg-zinc-50 border border-zinc-200 rounded-tl-[2rem] rounded-tr-[2rem] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]"
                  initial={{ y: 20, opacity: 0.8 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">7-Day Forecast</span>
                    <BreathingDot color="bg-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-medium tracking-tighter text-zinc-950">$14,528</span>
                    <span className="text-sm font-mono text-zinc-400">.16</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <ShimmerBar width="100%" delay={0.2} />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Tall narrow: Radar / Alerts */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
              className="border border-zinc-200 rounded-[2.5rem] relative overflow-hidden flex flex-col bg-zinc-950 text-white min-h-[480px] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-shadow duration-700"
            >
              <div className="p-10 lg:p-12 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
                    <Warning size={24} weight="duotone" className="text-zinc-300" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Radar</span>
                </div>
                <h3 className="text-2xl font-medium tracking-tight mb-4 text-white">Problem Detection</h3>
                <p className="text-zinc-400 leading-relaxed text-[15px] mb-8 max-w-[28ch]">
                  Surfaces overlapping bills and late clients before they become emergencies.
                </p>
              </div>
              
              {/* Live alert strip */}
              <div className="border-t border-zinc-800 px-8 py-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 block mb-1">Active Alert</span>
                  <span className="font-mono text-[15px] font-medium tracking-tight text-zinc-200">Tax + Rent Overlap</span>
                </div>
                <BreathingDot color="bg-zinc-400" />
              </div>
            </motion.div>
          </div>

          {/* Bottom row: 1fr / 2fr â€” reversed asymmetry */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 lg:gap-8">
            
            {/* Narrow: Growth Simulator */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
              className="border border-zinc-200 rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden flex flex-col bg-white min-h-[360px] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-shadow duration-700"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center">
                  <ChartLineUp size={24} weight="duotone" className="text-zinc-800" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Simulator</span>
              </div>
              <h3 className="text-2xl font-medium tracking-tight mb-4 text-zinc-950">What-If Scenarios</h3>
              <p className="text-zinc-500 leading-relaxed text-[15px] max-w-[28ch]">
                Drag a slider, see the impact instantly. Test hiring, purchases, or revenue dips before committing.
              </p>

              {/* Mini chart mockup */}
              <div className="flex items-end gap-1.5 mt-auto pt-8">
                {[40, 55, 35, 48, 62, 30, 45, 58, 42, 50].map((h, i) => (
                  <motion.div 
                    key={i}
                    className="flex-1 bg-zinc-100 rounded-t-md"
                    style={{ height: `${h}%`, minHeight: 8 }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.06 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Wide: Upload / Onboarding */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
              className="border border-zinc-200 rounded-[2.5rem] p-10 lg:p-14 bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 min-h-[360px] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-shadow duration-700"
            >
              <div className="lg:w-1/2">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center">
                    <Funnel size={24} weight="duotone" className="text-zinc-800" />
                  </div>
                  <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Onboarding</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight mb-4 text-zinc-950">Zero-Friction Uploads</h3>
                <p className="text-zinc-500 leading-relaxed text-[16px] max-w-[36ch]">
                  Drop your bank CSV. Our AI parses and categorizes your entire spending history - no manual tagging needed.
                </p>
              </div>
              <div className="lg:w-1/2 w-full h-[200px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 group hover:border-zinc-400 transition-colors duration-300">
                <Funnel size={32} weight="thin" className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                <span className="font-mono text-zinc-400 text-sm font-medium">Drop statements here</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ HOW IT WORKS: 3-Step Horizontal Flow â”€â”€â”€ */}
      <section id="how-it-works" className="py-32 md:py-40 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            className="max-w-2xl mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-zinc-950 mb-6 leading-[1.05]">Three steps.<br/>Five minutes.</h2>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-[42ch]">
              From uploading your first bank statement to seeing your cash flow future - it takes less time than making coffee.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
            {[
              { step: "01", title: "Upload your data", desc: "Drag and drop your bank CSV or connect your account. Our AI reads and categorizes everything automatically." },
              { step: "02", title: "Get your forecast", desc: "Within seconds, see your Safe to Spend number, upcoming cash crunches, and an AI-prioritized action list." },
              { step: "03", title: "Make better decisions", desc: "Ask the AI questions, run what-if scenarios, and resolve problems before they cost you money." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 60, damping: 18, delay: i * 0.12 }}
                className="py-8 md:py-0 md:px-10 first:md:pl-0 last:md:pr-0"
              >
                <span className="text-xs font-mono font-semibold text-zinc-300 tracking-widest mb-6 block">{item.step}</span>
                <h3 className="text-xl font-medium tracking-tight mb-3 text-zinc-950">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-[15px] max-w-[30ch]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ PRICING â”€â”€â”€ */}
      <section id="pricing" className="py-32 md:py-40 bg-white border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Copy */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
              className="lg:col-span-5"
            >
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-zinc-950 mb-6 leading-[1.05]">Simple pricing.</h2>
              <p className="text-lg text-zinc-500 leading-relaxed max-w-[32ch]">No complicated tiers. Get the clarity you need to grow your business.</p>
            </motion.div>

            {/* Right: Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="border border-zinc-200 rounded-[2.5rem] p-10 lg:p-14 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)]">
                <Badge variant="neutral" className="mb-8 px-4 rounded-full">Founder Launch Cohort</Badge>
                <div className="text-[72px] md:text-[84px] font-medium tracking-tighter mb-8 flex items-baseline">
                  Free <span className="text-[16px] text-zinc-400 tracking-widest ml-4 font-semibold uppercase">for beta</span>
                </div>
                
                <ul className="flex flex-col gap-5 mb-12 text-[16px] font-medium text-zinc-600">
                  {[
                    "AI Assistant - ask anything about your finances",
                    "Visual Dashboard with 30-day cash trajectory",
                    "What-If Simulator for hiring, purchases, scenarios",
                    "Unlimited bank statement uploads",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={20} weight="fill" className="text-zinc-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to={APP_ROUTES.auth}>
                  <Button magnetic variant="primary" className="w-full h-[56px] text-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">Join the Beta</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* â”€â”€â”€ FOOTER â”€â”€â”€ */}
      <footer className="py-16 bg-white border-t border-zinc-200 font-medium">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-start md:items-center gap-8 text-sm text-zinc-500">
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-950 tracking-tight text-lg mb-1">TALKS AI</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Link to={APP_ROUTES.privacy} className="hover:text-zinc-950 transition-colors">Privacy Notice</Link>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-zinc-950 transition-colors">Pricing</a>
            <Link to={APP_ROUTES.auth} className="hover:text-zinc-950 transition-colors">Start free trial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
