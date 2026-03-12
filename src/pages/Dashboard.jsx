import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CalendarBlank, CheckCircle, Circle, Warning, WarningCircle } from '@phosphor-icons/react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/useAppContext';

void motion;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } },
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getRecommendationIcon(tone, filled = false) {
  if (tone === 'warning') {
    return filled ? <WarningCircle weight="fill" className="text-zinc-950" size={16} /> : <Warning weight="regular" className="text-zinc-900" size={16} />;
  }

  if (tone === 'positive') {
    return <CheckCircle weight="fill" className="text-zinc-500" size={16} />;
  }

  return <Circle weight="regular" className="text-zinc-400" size={16} />;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    bankConnection,
    dashboardTrajectory,
    financialMetrics,
    priorityActions,
    profile,
    recommendationGroups,
    scenarioState,
    takeAction,
  } = useAppContext();

  const handlePriorityAction = (action) => {
    if (action.actionId) {
      takeAction(action.actionId);
    }

    if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <motion.div
      className="pb-20 pt-4 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-5 md:flex-row md:justify-between md:items-end mb-12 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl tracking-tight font-medium text-zinc-950 mb-2">Overview</h1>
          <p className="text-zinc-500 text-lg">
            {profile.shopName} is connected via {bankConnection.name}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-600 border border-zinc-300 rounded-lg px-4 py-2 hover:bg-zinc-50 transition-colors font-medium">
            <CalendarBlank size={18} />
            <span>Next 30 days</span>
          </div>
          {Math.abs(scenarioState.monthlyImpact) >= 100 ? (
            <Badge className={scenarioState.monthlyImpact > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}>
              {scenarioState.label}
            </Badge>
          ) : null}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <motion.div variants={itemVariants} className="lg:col-span-8" id="important">
          <Card className="h-full flex flex-col pt-6 bg-zinc-50/50">
            <div className="flex flex-col gap-2 mb-8">
              <h2 className="text-2xl font-light tracking-tight text-zinc-900 leading-none">Daily brief</h2>
              <p className="text-sm text-zinc-500 max-w-2xl">
                These recommendations are coming from the shared forecast, active risks, and the current scenario state.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 -mx-8 px-8 flex-1">
              {recommendationGroups.map((group, groupIndex) => (
                <div
                  key={group.label}
                  className={groupIndex === 0 ? 'flex flex-col gap-5 py-4 md:py-0 md:pr-8' : groupIndex === 1 ? 'flex flex-col gap-5 py-4 md:py-0 md:px-8' : 'flex flex-col gap-5 py-4 md:py-0 md:pl-8'}
                >
                  <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{group.label}</span>
                  {group.items.map((item, itemIndex) => (
                    <button
                      key={item.id}
                      type="button"
                      className="block w-full text-left group"
                      onClick={() => {
                        if (item.actionId) {
                          takeAction(item.actionId);
                        }

                        if (item.href) {
                          navigate(item.href);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2.5 hover:bg-zinc-100/80 p-1.5 -ml-1.5 rounded-lg transition-colors">
                        <span className="shrink-0 mt-0.5">{getRecommendationIcon(item.tone, groupIndex === 2 && itemIndex === 0)}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-800 leading-snug">{item.title}</p>
                          <p className="text-[13px] text-zinc-500 leading-relaxed mt-1">{item.detail}</p>
                          {item.actionLabel ? (
                            <span className="inline-flex mt-3 text-[12px] font-semibold tracking-widest uppercase text-zinc-500">
                              {item.actionLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-8">
          <Card className="flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-12">
              <span className="text-zinc-500 font-medium tracking-tight">Safe to Spend Today</span>
              <Badge variant="neutral">{bankConnection.source === 'bank' ? 'Verified' : 'CSV Demo'}</Badge>
            </div>
            <div>
              <motion.h2
                className="text-6xl tracking-tighter font-medium text-zinc-950 mb-3 font-mono"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                ${Math.floor(financialMetrics.safeToSpend).toLocaleString()}
                <span className="text-3xl text-zinc-400">.{(financialMetrics.safeToSpend % 1).toFixed(2).substring(2)}</span>
              </motion.h2>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                After bills, risk pressure, and the safety floor of {formatMoney(financialMetrics.safetyFloor)}.
              </p>
              {Math.abs(scenarioState.monthlyImpact) >= 100 ? (
                <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-1">Active scenario</p>
                  <p className="text-sm text-zinc-800">{scenarioState.label}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium tracking-tight text-zinc-950">Best next actions</h3>
              <span className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Live</span>
            </div>
            <div className="flex flex-col gap-4">
              {priorityActions.map((action) => (
                <div key={action.actionId} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900 leading-snug">{action.title}</p>
                  <p className="text-[13px] text-zinc-500 leading-relaxed mt-2">{action.detail}</p>
                  <Button
                    variant={action.tone === 'warning' ? 'primary' : 'outline'}
                    className="mt-4 w-full justify-center"
                    onClick={() => handlePriorityAction(action)}
                  >
                    {action.label}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mb-8 block">
        <Card className="flex flex-col h-[520px] p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-medium tracking-tight">30-day Cash Trajectory</h3>
            <div className="flex gap-6 text-sm text-zinc-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-zinc-950"></div>
                Actual
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-zinc-400"></div>
                Forecast
              </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 bg-white border border-zinc-100 rounded-xl pt-4 pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardTrajectory} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} horizontal stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa', fontFamily: 'monospace' }} tickFormatter={(value) => `$${value / 1000}k`} dx={-10} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    fontWeight: 500,
                    color: '#09090b',
                    padding: '12px 16px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value) => [formatMoney(value), '']}
                  labelStyle={{ color: '#71717a', marginBottom: '8px', fontSize: '13px', fontFamily: 'sans-serif' }}
                  cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine y={financialMetrics.safetyFloor} stroke="#e4e4e7" strokeWidth={1} strokeDasharray="3 3" />
                <ReferenceLine x="Today" stroke="#e4e4e7" strokeWidth={1} />
                <Line type="monotone" dataKey="actual" stroke="#09090b" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#09090b' }} animationDuration={1500} />
                <Line type="monotone" dataKey="forecast" stroke="#a1a1aa" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#a1a1aa' }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col border-t border-zinc-200 pt-6">
            <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Pending Invoices</span>
            <p className="text-4xl font-medium font-mono tracking-tighter mb-2 text-zinc-950">{formatMoney(financialMetrics.pendingInvoices)}</p>
            <p className="text-sm font-medium text-zinc-600">Current collections pool affecting the shared forecast.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex flex-col border-t border-zinc-200 pt-6">
            <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Upcoming Bills (7 Days)</span>
            <p className="text-4xl font-medium font-mono tracking-tighter mb-2 text-zinc-950">{formatMoney(financialMetrics.upcomingBills)}</p>
            <p className="text-sm font-medium text-zinc-600">Near-term obligations that tighten the 30-day view.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex flex-col border-t border-zinc-200 pt-6">
            <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Current Runway</span>
            <p className="text-4xl font-medium tracking-tighter mb-2 text-zinc-950">
              {financialMetrics.runwayDays} <span className="text-2xl text-zinc-400 font-light tracking-tight">Days</span>
            </p>
            <p className="text-sm font-medium text-zinc-600">
              Based on risk pressure, bills, and the current reserve target.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
