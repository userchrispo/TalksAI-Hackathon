import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Warning, WarningCircle, CalendarBlank, Circle } from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';

void motion;

const mockData = [
  { date: '1', actual: 12492.10 },
  { date: '5', actual: 13511.05 },
  { date: '10', actual: 9012.42 },
  { date: '15', actual: 10588.90 },
  { date: 'Today', actual: 4528.16, forecast: 4528.16 },
  { date: '20', forecast: 2011.50 },
  { date: '25', forecast: 3591.22 },
  { date: '30', forecast: -512.40 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

export const Dashboard = () => {
  const { balance, profile, bankConnection } = useAppContext();

  return (
    <motion.div 
      className="pb-20 pt-4 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end mb-12 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-4xl tracking-tight font-medium text-zinc-950 mb-2">Overview</h1>
          <p className="text-zinc-500 text-lg">
            {profile.shopName} is connected via {bankConnection.name}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600 border border-zinc-300 rounded-lg px-4 py-2 hover:bg-zinc-50 transition-colors font-medium">
          <CalendarBlank size={18} />
          <span>Next 30 days</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <motion.div variants={itemVariants} className="lg:col-span-8" id="important">
          <Card className="h-full flex flex-col pt-6 bg-zinc-50/50">
            <h2 className="text-2xl font-light tracking-tight mb-8 text-zinc-900 leading-none">Important things</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 -mx-8 px-8 flex-1">
              <div className="flex flex-col gap-5 py-4 md:py-0 md:pr-8">
                <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Today</span>
                <Link to="/app/problems" className="block w-full text-left group">
                  <div className="flex items-start gap-2.5 hover:bg-zinc-100/80 p-1.5 -ml-1.5 rounded-lg transition-colors">
                    <span className="shrink-0 mt-0.5"><Warning weight="regular" className="text-zinc-900" size={16} /></span>
                    <p className="text-sm text-zinc-800 leading-snug">
                      Payroll is out in 3 days. Send a quick reminder texts to Smith Auto Group to get their $3,000 paid today so you have enough cash.
                    </p>
                  </div>
                </Link>
                <Link to="/app/assistant" className="block w-full text-left group">
                  <div className="flex items-start gap-2.5 hover:bg-zinc-100/80 p-1.5 -ml-1.5 rounded-lg transition-colors">
                    <span className="shrink-0 mt-0.5"><Circle weight="regular" className="text-zinc-400" size={16} /></span>
                    <p className="text-sm text-zinc-800 leading-snug">
                      Great news: 3 customers paid today. Your bank balance grew by $4,200.
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-5 py-4 md:py-0 md:px-8">
                <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">This week</span>
                <Link to="/app/assistant" className="block w-full text-left group">
                  <div className="flex items-start gap-2.5 hover:bg-zinc-100/80 p-1.5 -ml-1.5 rounded-lg transition-colors">
                    <span className="shrink-0 mt-0.5"><Warning weight="regular" className="text-zinc-900" size={16} /></span>
                    <p className="text-sm text-zinc-800 leading-snug">
                      Your parts supplier raised prices by 8%. Make sure to increase your customer quotes next week so you don't lose money.
                    </p>
                  </div>
                </Link>

                <Link to="/app/assistant" className="block w-full text-left group">
                  <div className="flex items-start gap-2.5 hover:bg-zinc-100/80 p-1.5 -ml-1.5 rounded-lg transition-colors">
                    <span className="shrink-0 mt-0.5"><Circle weight="regular" className="text-zinc-400" size={16} /></span>
                    <p className="text-sm text-zinc-800 leading-snug">
                      Check your mail. A new $1,200 insurance bill showed up for November.
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-5 py-4 md:py-0 md:pl-8">
                <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">This month</span>
                <Link to="/app/simulator" className="block w-full text-left group">
                  <div className="flex items-start gap-2.5 hover:bg-zinc-100/80 p-1.5 -ml-1.5 rounded-lg transition-colors">
                    <span className="shrink-0 mt-0.5"><WarningCircle weight="fill" className="text-zinc-950" size={16} /></span>
                    <p className="text-sm text-zinc-800 leading-snug">
                      Cash looks tight around the 18th because rent and taxes hit the same week. Hold off on buying new tools until the 25th.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between group">
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
                ${Math.floor(balance.safe).toLocaleString()}<span className="text-3xl text-zinc-400">.{(balance.safe % 1).toFixed(2).substring(2)}</span>
              </motion.h2>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Reserving funds for all fixed costs and expected bills over the next 14 days.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mb-8 block">
        <Card className="flex flex-col h-[520px] p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-medium tracking-tight">30-day Cash Trajectory</h3>
            <div className="flex gap-6 text-sm text-zinc-500 font-medium">
              <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-zinc-950"></div> Actual</div>
              <div className="flex items-center gap-2"><div className="w-4 h-0.5 border-t-2 border-dashed border-zinc-400"></div> Forecast</div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 bg-white border border-zinc-100 rounded-xl pt-4 pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} horizontal={true} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#a1a1aa', fontFamily: 'monospace' }} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', fontWeight: 500, color: '#09090b', padding: '12px 16px', fontFamily: 'monospace' }}
                  formatter={(value) => [`$${value}`, '']}
                  labelStyle={{ color: '#71717a', marginBottom: '8px', fontSize: '13px', fontFamily: 'sans-serif' }}
                  cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine y={0} stroke="#18181b" strokeWidth={1} strokeDasharray="3 3" />
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
            <p className="text-4xl font-medium font-mono tracking-tighter mb-2 text-zinc-950">${balance.pendingInvoices.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm font-medium text-zinc-600">Average delay: 11.4 days</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="flex flex-col border-t border-zinc-200 pt-6">
            <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Upcoming Bills (7 Days)</span>
            <p className="text-4xl font-medium font-mono tracking-tighter mb-2 text-zinc-950">${balance.upcomingBills.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm font-medium text-zinc-600">4 invoices scheduled</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="flex flex-col border-t border-zinc-200 pt-6">
            <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase mb-4">Current Runway</span>
            <p className="text-4xl font-medium tracking-tighter mb-2 text-zinc-950">{balance.runwayDays} <span className="text-2xl text-zinc-400 font-light tracking-tight">Days</span></p>
            <p className="text-sm font-medium text-zinc-600">Until projected minimum capacity</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
