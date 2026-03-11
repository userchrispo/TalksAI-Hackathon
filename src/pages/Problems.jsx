import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Warning, TrendUp, WarningCircle, ArrowUpRight, CheckCircle, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useAppContext } from '../context/useAppContext';

void motion;

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const filters = ["All", "Cash Crunch", "Late Payer", "Rising Costs"];

export const Problems = () => {
  const { problems, resolveProblem } = useAppContext();
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filteredProblems = activeFilter === 'All'
    ? problems
    : problems.filter((problem) => problem.category === activeFilter);

  const getIcon = (category) => {
    if (category === 'Cash Crunch') return <Warning weight="fill" size={24} className="text-zinc-900" />;
    if (category === 'Late Payer') return <WarningCircle weight="fill" size={24} className="text-zinc-600" />;
    return <TrendUp weight="fill" size={24} className="text-zinc-400" />;
  };

  return (
    <div className="pb-20 pt-4 max-w-5xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-4xl tracking-tight font-medium text-zinc-950 mb-2">Radar</h1>
          <p className="text-zinc-500">Triage list of potential cash flow problems.</p>
        </div>
        
        <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-zinc-200 mt-4 md:mt-0 shadow-sm gap-1.5">
          {filters.map((filter) => (
            <button 
              key={filter}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeFilter === filter
                  ? 'bg-zinc-100/50 shadow-sm border-zinc-200 text-zinc-950' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProblems.map((risk, index) => {
            const isExpanded = expandedId === risk.id;

            return (
              <motion.div variants={itemVariants} key={risk.id} layout exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                <Card className="flex flex-col gap-8 p-10 items-start relative overflow-hidden group hover:border-zinc-300">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${index === 0 ? 'bg-zinc-900' : 'bg-transparent'}`}></div>
                  <div className="flex flex-col gap-8 md:flex-row w-full">
                    <div className="md:w-1/4 pt-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                          {getIcon(risk.category)}
                        </div>
                        <Badge variant={risk.badge}>{risk.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2">
                      <h3 className="text-2xl font-medium tracking-tight mb-4 text-zinc-950">{risk.title}</h3>
                      <p className="text-[16px] text-zinc-500 leading-relaxed max-w-prose">{risk.desc}</p>
                      {isExpanded ? (
                        <div className="mt-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-600 leading-7">
                          This risk is part of the live demo flow. Resolve it to update the dashboard totals and clear the alert from the sidebar.
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="md:w-1/4 flex flex-col items-start md:items-end justify-center h-full gap-5 pt-2 w-full mt-4 md:mt-0">
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto bg-white py-3 hover:bg-zinc-950 hover:text-white transition-colors"
                        onClick={() => resolveProblem(risk.id, `Resolved: ${risk.action}`)}
                      >
                        {risk.action}
                      </Button>
                      <button
                        type="button"
                        className="text-[13px] text-zinc-400 font-semibold tracking-widest hover:text-zinc-900 flex items-center gap-1.5 transition-colors uppercase"
                        onClick={() => setExpandedId(isExpanded ? null : risk.id)}
                      >
                        {isExpanded ? 'Hide details' : 'View details'}
                        {isExpanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredProblems.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-200 rounded-3xl mt-4">
            <CheckCircle size={48} weight="fill" className="text-zinc-300 mb-6" />
            <h3 className="text-xl font-medium text-zinc-900 mb-2">No risks in this filter</h3>
            <p className="text-zinc-500">
              {problems.length === 0
                ? 'Your cash flow is stable and all problems have been resolved.'
                : 'Try switching filters to review the remaining alerts.'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
