import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Storefront, LinkBreak, User, ShieldCheck, CheckCircle, SignOut } from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/useAppContext';

void motion;

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

export const Settings = () => {
  const navigate = useNavigate();
  const {
    profile,
    bankConnection,
    updateProfile,
    updateFinancialSettings,
    updateBankConnection,
    logout,
  } = useAppContext();

  const [profileForm, setProfileForm] = useState(profile);
  const [financialForm, setFinancialForm] = useState({
    safeMin: profile.safeMin,
    defaultInvoiceDelayDays: '14',
  });

  const handleProfileSave = () => {
    updateProfile(profileForm);
  };

  const handleFinancialSave = () => {
    updateFinancialSettings(financialForm);
  };

  const handleDisconnect = () => {
    updateBankConnection(
      {
        connected: true,
        name: 'CSV Upload',
        source: 'csv',
        lastSynced: 'CSV imported',
      },
      'Bank connection replaced with CSV demo.',
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div 
      variants={stagger} initial="hidden" animate="show"
      className="pb-20 pt-4 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeIn} className="mb-12 border-b border-zinc-200 pb-8">
        <h1 className="text-4xl tracking-tighter font-medium text-zinc-950 mb-2">Settings</h1>
        <p className="text-zinc-500">Manage your account and financial parameters.</p>
      </motion.div>

      <div className="flex flex-col gap-10">
        <motion.section variants={fadeIn}>
          <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase mb-6 flex items-center gap-2">
            <User size={16} weight="bold" /> Account Profile
          </h2>
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">Business Name</label>
                <input type="text" value={profileForm.shopName} onChange={(event) => setProfileForm((current) => ({ ...current, shopName: event.target.value }))} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-[15px] font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">Owner Name</label>
                <input type="text" value={profileForm.ownerName} onChange={(event) => setProfileForm((current) => ({ ...current, ownerName: event.target.value }))} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-[15px] font-medium" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">Email Address</label>
                <input type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-[15px] font-medium" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button variant="primary" className="px-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)]" onClick={handleProfileSave}>Save Changes</Button>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeIn}>
          <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase mb-6 flex items-center gap-2">
            <Storefront size={16} weight="bold" /> Financial Defaults
          </h2>
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
            <p className="text-sm text-zinc-500 mb-8 max-w-prose leading-relaxed">
              These baselines tell the AI your minimum risk tolerance. If forecasted cash drops below the Safe Minimum, alerts will fire.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">Safe Minimum Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-medium">$</span>
                  <input type="text" value={financialForm.safeMin.replace('$', '').replace(/,/g, '')} onChange={(event) => setFinancialForm((current) => ({ ...current, safeMin: `$${event.target.value}` }))} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono text-[15px] font-medium transition-shadow" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">Default Invoice Delay</label>
                <div className="relative">
                  <input type="number" value={financialForm.defaultInvoiceDelayDays} onChange={(event) => setFinancialForm((current) => ({ ...current, defaultInvoiceDelayDays: event.target.value }))} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono text-[15px] font-medium transition-shadow" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">days</span>
                </div>
                <p className="text-[13px] text-zinc-400 mt-2">AI uses this buffer when modeling incoming payments.</p>
              </div>
            </div>
            <div className="mt-10 flex justify-end pt-6 border-t border-zinc-100">
              <Button variant="primary" className="px-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)]" onClick={handleFinancialSave}>Update Parameters</Button>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeIn}>
          <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase mb-6 flex items-center gap-2">
            <ShieldCheck size={16} weight="bold" /> Bank Connections
          </h2>
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} weight="duotone" className="text-zinc-700" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-zinc-950 text-[15px]">{bankConnection.name}</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 text-zinc-600 text-[11px] font-bold uppercase tracking-widest rounded-md border border-zinc-200">
                    <CheckCircle size={12} weight="fill" className="text-emerald-500" /> {bankConnection.source === 'bank' ? 'Connected' : 'CSV Demo'}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">Last synced: {bankConnection.lastSynced}</p>
              </div>
            </div>
            <Button variant="outline" className="text-zinc-600 bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm whitespace-nowrap" onClick={handleDisconnect}>
              <LinkBreak size={16} className="mr-2" /> Switch to CSV Demo
            </Button>
          </div>
        </motion.section>

        <motion.section variants={fadeIn} className="pt-4">
          <div className="border border-zinc-200 rounded-[2rem] p-8 md:p-10 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-zinc-950 text-[15px] mb-1">Log out of TALKS AI</h3>
              <p className="text-sm text-zinc-500">This clears the saved demo state and returns you to the landing page.</p>
            </div>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 shadow-sm whitespace-nowrap"
              onClick={handleLogout}
            >
              <SignOut size={16} className="mr-2" /> Log Out
            </Button>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};
