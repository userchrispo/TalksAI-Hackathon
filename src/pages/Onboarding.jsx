import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  Storefront, User, ArrowRight, ArrowLeft, CheckCircle, 
  Scissors, Wrench, Car, ForkKnife, ShoppingCart, Lightning,
  SpinnerGap, Bank, ShieldCheck, MapPin, Phone, CurrencyDollar,
  Buildings, UsersThree, Receipt, CalendarBlank
} from '@phosphor-icons/react';
import { useAppContext } from '../context/useAppContext';

void motion;

const spring = { type: "spring", stiffness: 100, damping: 20 };

const businessTypes = [
  { id: 'auto', icon: Car, label: 'Auto Shop', desc: 'Repair, body work, detailing' },
  { id: 'coming_soon', icon: Storefront, label: 'Other Businesses', desc: 'More service industries coming soon', disabled: true },
];

const prefillData = {
  auto: {
    shopName: 'Vance Auto Body', ownerName: 'Evelyn Vance', email: 'evelyn@vanceauto.ca',
    phone: '(416) 847-1928', address: '4217 Dundas St W, Toronto, ON M6S 2S3',
    employees: '6', yearsInBusiness: '8', monthlyRevenue: '$28,400',
    rent: '$3,200', payroll: '$12,800', supplies: '$4,600', insurance: '$1,400',
    trackingMethod: 'spreadsheet', safeMin: '$8,000'
  },
  barber: {
    shopName: 'Crown Cuts Studio', ownerName: 'Marcus Webb', email: 'marcus@crowncuts.ca',
    phone: '(604) 293-8174', address: '1842 Commercial Dr, Vancouver, BC V5N 4A5',
    employees: '4', yearsInBusiness: '3', monthlyRevenue: '$18,200',
    rent: '$2,800', payroll: '$7,200', supplies: '$1,800', insurance: '$900',
    trackingMethod: 'nothing', safeMin: '$5,000'
  },
  restaurant: {
    shopName: 'Ember Kitchen', ownerName: 'Sofia Reyes', email: 'sofia@emberkitchen.ca',
    phone: '(514) 641-3092', address: '709 Rue Saint-Denis, Montr\u00e9al, QC H2S 2R7',
    employees: '12', yearsInBusiness: '5', monthlyRevenue: '$52,800',
    rent: '$5,500', payroll: '$22,400', supplies: '$14,200', insurance: '$2,100',
    trackingMethod: 'quickbooks', safeMin: '$15,000'
  },
  retail: {
    shopName: 'Gradient Supply Co.', ownerName: 'Theo Langston', email: 'theo@gradientsupply.ca',
    phone: '(403) 529-4061', address: '328 17th Ave SW, Calgary, AB T2S 0A7',
    employees: '3', yearsInBusiness: '2', monthlyRevenue: '$22,600',
    rent: '$4,100', payroll: '$5,400', supplies: '$8,200', insurance: '$750',
    trackingMethod: 'spreadsheet', safeMin: '$6,000'
  },
  trades: {
    shopName: 'Ironside Plumbing', ownerName: 'Nadia Kowalski', email: 'nadia@ironsideplumb.ca',
    phone: '(613) 873-4519', address: '1105 Bank St, Ottawa, ON K1S 3X4',
    employees: '8', yearsInBusiness: '11', monthlyRevenue: '$41,200',
    rent: '$1,800', payroll: '$18,600', supplies: '$6,400', insurance: '$2,200',
    trackingMethod: 'accountant', safeMin: '$10,000'
  },
  other: {
    shopName: 'My Business', ownerName: 'Your Name', email: 'you@business.ca',
    phone: '(416) 555-1234', address: '123 Main St, Toronto, ON M5V 2T6',
    employees: '5', yearsInBusiness: '4', monthlyRevenue: '$30,000',
    rent: '$2,500', payroll: '$10,000', supplies: '$3,500', insurance: '$1,000',
    trackingMethod: 'spreadsheet', safeMin: '$7,500'
  },
};

const trackingOptions = [
  { id: 'nothing', label: "I don't track it", desc: 'Flying blind - we can fix that' },
  { id: 'spreadsheet', label: 'Spreadsheets', desc: 'Excel, Google Sheets, etc.' },
  { id: 'quickbooks', label: 'QuickBooks / Xero', desc: 'Accounting software' },
  { id: 'accountant', label: 'My accountant handles it', desc: 'Outsourced bookkeeping' },
];

const banks = [
  { name: 'TD Canada Trust', color: '#34A853' },
  { name: 'RBC', color: '#005DAA' },
  { name: 'Scotiabank', color: '#EC111A' },
  { name: 'BMO', color: '#0075BE' },
  { name: 'CIBC', color: '#BB0B28' },
  { name: 'Desjardins', color: '#3B8230' },
];

const StepDot = ({ active, completed }) => (
  <div className={`h-1.5 rounded-full transition-all duration-500 ${
    completed ? 'bg-zinc-900 w-1.5' : active ? 'bg-zinc-900 w-8' : 'bg-zinc-200 w-1.5'
  }`} />
);

const FormInput = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">{label}</label>
    <div className="relative">
      {Icon ? <Icon size={16} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /> : null}
      <input {...props} className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-[15px] font-medium transition-shadow`} />
    </div>
  </div>
);

const TOTAL_STEPS = 5;

function buildRegistrationData(regState) {
  return {
    shopName: regState.shopName || '',
    ownerName: regState.ownerName || '',
    email: regState.email || '',
    phone: '', address: '',
    employees: '', yearsInBusiness: '',
    monthlyRevenue: '', rent: '', payroll: '', supplies: '', insurance: '',
    trackingMethod: 'nothing', safeMin: '$5,000',
  };
}

export const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOnboarding } = useAppContext();
  const regState = location.state;
  const isRegistering = regState?.fromRegister === true;

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState('auto');
  const [formData, setFormData] = useState(
    isRegistering ? buildRegistrationData(regState) : prefillData.auto,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState(1);
  const [bankConnecting, setBankConnecting] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState('TD Canada Trust');
  const [connectionSource, setConnectionSource] = useState('bank');

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setFormData(prefillData[typeId]);
    setBankConnected(false);
    setSelectedBankName('TD Canada Trust');
    setConnectionSource('bank');
  };

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleNext = () => {
    setDirection(1);
    if (step === TOTAL_STEPS - 1) {
      setIsProcessing(true);
      window.setTimeout(() => {
        completeOnboarding({
          businessType: selectedType,
          formData,
          bankName: selectedBankName,
          bankSource: connectionSource,
        });
        navigate('/app/dashboard');
      }, 1800);
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const handleBankConnect = (bankName) => {
    setBankConnecting(true);
    setSelectedBankName(bankName);
    setConnectionSource('bank');
    window.setTimeout(() => {
      setBankConnecting(false);
      setBankConnected(true);
    }, 1500);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="font-semibold text-zinc-950 tracking-tight text-xl">TALKS AI</span>
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <StepDot key={i} active={step === i} completed={step > i} />
            ))}
          </div>
        </motion.div>

        <div className="relative overflow-hidden min-h-[540px]">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && !isProcessing && (
              <motion.div key="s0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={spring} className="w-full">
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-zinc-950 mb-3">What kind of business do you run?</h1>
                  <p className="text-zinc-500 text-[15px] max-w-md mx-auto">Our AI specializes itself based on your industry - custom alerts, language, and forecasting models.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                  {businessTypes.map((type) => {
                    const BusinessIcon = type.icon;
                    return (
                      <motion.button key={type.id} whileTap={type.disabled ? {} : { scale: 0.98 }}
                        onClick={() => !type.disabled && handleTypeSelect(type.id)}
                        disabled={type.disabled}
                        className={`flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
                          type.disabled 
                            ? 'border-zinc-200/50 bg-zinc-50/50 opacity-60 cursor-not-allowed' 
                            : selectedType === type.id 
                                ? 'border-zinc-900 bg-zinc-950 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] cursor-pointer' 
                                : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-pointer'
                        }`}
                      >
                        {selectedType === type.id && !type.disabled && (
                          <motion.div 
                            layoutId="active-outline"
                            className="absolute inset-0 border-2 border-zinc-900 rounded-2xl pointer-events-none"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          selectedType === type.id && !type.disabled ? 'bg-zinc-800' : 'bg-zinc-100/80 border border-zinc-200/60'
                        }`}>
                          <BusinessIcon size={24} weight={selectedType === type.id && !type.disabled ? "fill" : "duotone"} className={selectedType === type.id && !type.disabled ? 'text-white' : 'text-zinc-500'} />
                        </div>
                        <div className="min-w-0 pr-8">
                          <div className={`font-semibold text-[16px] tracking-tight ${type.disabled ? 'text-zinc-500' : ''}`}>{type.label}</div>
                          <div className={`text-[14px] leading-relaxed mt-0.5 ${selectedType === type.id && !type.disabled ? 'text-zinc-400' : 'text-zinc-500'}`}>{type.desc}</div>
                        </div>
                        {selectedType === type.id && !type.disabled && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-6 top-1/2 -translate-y-1/2">
                            <CheckCircle size={24} weight="fill" className="text-white shrink-0" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && !isProcessing && (
              <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={spring} className="w-full">
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-zinc-950 mb-3">Tell us about your business</h1>
                  <p className="text-zinc-500 text-[15px] max-w-md mx-auto">We've pre-filled some details. Edit anything that doesn't match.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput label="Business Name" icon={Storefront} type="text" value={formData.shopName} onChange={e => update('shopName', e.target.value)} />
                    <FormInput label="Owner Name" icon={User} type="text" value={formData.ownerName} onChange={e => update('ownerName', e.target.value)} />
                    <FormInput label="Email" type="email" value={formData.email} onChange={e => update('email', e.target.value)} />
                    <FormInput label="Phone" icon={Phone} type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} />
                    <div className="md:col-span-2">
                      <FormInput label="Business Address" icon={MapPin} type="text" value={formData.address} onChange={e => update('address', e.target.value)} />
                    </div>
                    <FormInput label="Number of Employees" icon={UsersThree} type="text" value={formData.employees} onChange={e => update('employees', e.target.value)} />
                    <FormInput label="Years in Business" icon={CalendarBlank} type="text" value={formData.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && !isProcessing && (
              <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={spring} className="w-full">
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-zinc-950 mb-3">Your monthly finances</h1>
                  <p className="text-zinc-500 text-[15px] max-w-md mx-auto">Rough estimates are fine - the AI will refine these once it sees real data.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">Avg Monthly Revenue</label>
                    <div className="relative max-w-xs">
                      <CurrencyDollar size={16} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input type="text" value={formData.monthlyRevenue} onChange={e => update('monthlyRevenue', e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-[15px] font-medium font-mono transition-shadow" />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-4">Monthly Expenses Breakdown</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { key: 'rent', label: 'Rent', icon: Buildings },
                      { key: 'payroll', label: 'Payroll', icon: UsersThree },
                      { key: 'supplies', label: 'Supplies', icon: Receipt },
                      { key: 'insurance', label: 'Insurance', icon: ShieldCheck },
                    ].map(({ key, label, icon: ExpenseIcon }) => {
                      void ExpenseIcon;
                      return (
                      <div key={key} className="flex flex-col">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <ExpenseIcon size={12} weight="bold" /> {label}
                        </label>
                        <input type="text" value={formData[key]} onChange={e => update(key, e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-[14px] font-medium font-mono transition-shadow" />
                      </div>
                    )})}
                  </div>

                  <p className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-4">How do you track your finances today?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {trackingOptions.map(opt => (
                      <button key={opt.id} onClick={() => update('trackingMethod', opt.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.trackingMethod === opt.id ? 'border-zinc-900 bg-zinc-950 text-white' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400'
                        }`}
                      >
                        <div className={`font-medium text-[14px] ${formData.trackingMethod === opt.id ? 'text-white' : 'text-zinc-900'}`}>{opt.label}</div>
                        <div className={`text-[12px] mt-0.5 ${formData.trackingMethod === opt.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && !isProcessing && (
              <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={spring} className="w-full">
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-zinc-950 mb-3">Connect your bank</h1>
                  <p className="text-zinc-500 text-[15px] max-w-md mx-auto">Securely link your business checking account via Plaid so the AI can analyze real transactions.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  {!bankConnected ? (
                    <>
                      <div className="flex items-center gap-3 mb-6 px-1">
                        <ShieldCheck size={18} weight="fill" className="text-zinc-400" />
                        <span className="text-[13px] text-zinc-500 font-medium">Connected via Plaid. 256-bit encrypted. Read-only access. We never store credentials.</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {banks.map(bank => (
                          <motion.button key={bank.name} whileTap={{ scale: 0.97 }}
                            onClick={() => handleBankConnect(bank.name)}
                            disabled={bankConnecting}
                            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white transition-all text-left disabled:opacity-50"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bank.color + '15' }}>
                              <Bank size={18} weight="fill" style={{ color: bank.color }} />
                            </div>
                            <span className="text-[13px] font-medium text-zinc-800 truncate">{bank.name}</span>
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {bankConnecting && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-6 flex items-center justify-center gap-3 py-4"
                          >
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                              <SpinnerGap size={20} weight="bold" className="text-zinc-500" />
                            </motion.div>
                            <span className="text-sm text-zinc-600 font-medium">Connecting securely via Plaid...</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="button"
                        onClick={() => {
                          setConnectionSource('csv');
                          setSelectedBankName('CSV Upload');
                          setBankConnected(true);
                        }}
                        className="mt-6 text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors w-full text-center"
                      >
                        Skip for now - I'll upload a CSV instead
                      </button>
                    </>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring} className="text-center py-8">
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle size={32} weight="fill" className="text-zinc-900" />
                      </motion.div>
                      <h3 className="text-xl font-medium text-zinc-950 mb-2">
                        {selectedBankName} {connectionSource === 'bank' ? 'connected via Plaid' : 'loaded'}
                      </h3>
                      <p className="text-zinc-500 text-[14px]">
                        {connectionSource === 'bank'
                          ? 'Last 12 months of transactions imported successfully.'
                          : 'Sample CSV data imported successfully.'}
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-mono font-semibold text-zinc-900 text-lg">847</div>
                          <div className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Transactions</div>
                        </div>
                        <div className="w-px h-8 bg-zinc-200" />
                        <div className="text-center">
                          <div className="font-mono font-semibold text-zinc-900 text-lg">12</div>
                          <div className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Months</div>
                        </div>
                        <div className="w-px h-8 bg-zinc-200" />
                        <div className="text-center">
                          <div className="font-mono font-semibold text-zinc-900 text-lg">23</div>
                          <div className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Vendors</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && !isProcessing && (
              <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={spring} className="w-full">
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-zinc-950 mb-3">Your AI is ready</h1>
                  <p className="text-zinc-500 text-[15px] max-w-md mx-auto">Based on your business, here's how TALKS AI will work for you.</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100">
                    <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center">
                      <Lightning size={22} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-950 text-[16px]">AI specialized for: {businessTypes.find(t => t.id === selectedType)?.label}</h3>
                      <p className="text-zinc-500 text-sm">{formData.shopName} - {formData.ownerName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {getAIFeatures(selectedType).map((feature, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: index * 0.08 }} className="flex items-start gap-3">
                        <CheckCircle size={20} weight="fill" className="text-zinc-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[15px] font-medium text-zinc-900">{feature.title}</span>
                          <p className="text-[13px] text-zinc-500 mt-0.5">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div key="proc" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={spring}
                className="w-full flex flex-col items-center justify-center min-h-[400px]"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="mb-8">
                  <SpinnerGap size={40} weight="bold" className="text-zinc-900" />
                </motion.div>
                <h2 className="text-2xl font-medium tracking-tight text-zinc-950 mb-3">Setting up your AI</h2>
                <p className="text-zinc-500 text-[15px] text-center max-w-sm">
                  Configuring forecasting models for {formData.shopName}. This takes just a moment.
                </p>
                <div className="mt-10 space-y-3 w-full max-w-xs">
                  {[
                    { label: 'Analyzing industry patterns', delay: 0 },
                    { label: 'Importing transaction history', delay: 0.6 },
                    { label: 'Calibrating cash flow models', delay: 1.2 },
                    { label: 'Generating first forecast', delay: 1.8 },
                  ].map((item, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: item.delay, ...spring }} className="flex items-center gap-3">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: item.delay + 0.3, type: "spring", stiffness: 200 }}>
                        <CheckCircle size={18} weight="fill" className="text-zinc-400" />
                      </motion.div>
                      <span className="text-sm text-zinc-600 font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-4 mt-8">
            <div className="flex items-center justify-between">
              <button onClick={step > 0 ? handleBack : () => navigate(isRegistering ? '/' : '/auth')}
                className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft size={16} weight="bold" /> {step > 0 ? 'Back' : isRegistering ? 'Back to home' : 'Back to login'}
              </button>
              <Button magnetic variant="primary" className="h-[52px] px-8 text-[15px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]" onClick={handleNext}>
                {step === TOTAL_STEPS - 1 ? 'Launch Dashboard' : 'Continue'} <ArrowRight size={16} weight="bold" className="ml-2" />
              </Button>
            </div>
            {step === 0 && !isRegistering && (
              <p className="text-center text-sm text-zinc-400">
                Want your own workspace?{' '}
                <button type="button" onClick={() => navigate('/auth')} className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors">
                  Sign up instead
                </button>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

function getAIFeatures(type) {
  const features = {
    auto: [
      { title: 'Parts cost tracking', desc: 'Monitors supplier price changes and alerts you to adjust quotes automatically.' },
      { title: 'Payroll forecasting', desc: 'Predicts payroll impact on cash flow based on your tech schedules.' },
      { title: 'Slow season alerts', desc: 'Warns you 30 days before historically slow periods so you can build reserves.' },
      { title: 'Invoice follow-ups', desc: 'Tracks which fleet clients are late payers and reminds you to collect.' },
    ],
    barber: [
      { title: 'Chair rental tracking', desc: 'Monitors payments from booth renters and flags any missed payments.' },
      { title: 'Walk-in vs. appointment revenue', desc: 'Shows revenue breakdown so you can optimize scheduling.' },
      { title: 'Product inventory alerts', desc: 'Tracks styling product costs and warns when margins are dropping.' },
      { title: 'Seasonal demand forecasting', desc: 'Predicts busy periods (holidays, prom season) so you can staff up.' },
    ],
    restaurant: [
      { title: 'Food cost monitoring', desc: 'Tracks ingredient costs against menu prices in real-time.' },
      { title: 'Staff scheduling impact', desc: 'Shows how overtime and extra shifts affect your weekly cash flow.' },
      { title: 'Catering revenue tracking', desc: 'Separates catering income from dine-in for accurate forecasting.' },
      { title: 'Vendor payment timing', desc: 'Optimizes when to pay food suppliers to maintain cash reserves.' },
    ],
    retail: [
      { title: 'Inventory cash impact', desc: 'Shows how much cash is tied up in unsold inventory at any time.' },
      { title: 'Seasonal sales forecasting', desc: 'Predicts revenue spikes for holiday and clearance periods.' },
      { title: 'Supplier payment optimization', desc: 'Recommends the best time to reorder based on your cash position.' },
      { title: 'Shrinkage tracking', desc: 'Monitors unexpected losses and their impact on monthly margins.' },
    ],
    trades: [
      { title: 'Job costing analysis', desc: 'Breaks down material + labor costs per job to find your most profitable work.' },
      { title: 'Invoice aging alerts', desc: 'Flags clients who consistently pay late so you can require deposits.' },
      { title: 'Equipment purchase timing', desc: 'Recommends when you can safely buy new tools without cash risk.' },
      { title: 'Seasonal workload prep', desc: 'Warns about slow seasons so you can line up maintenance contracts.' },
    ],
    other: [
      { title: 'Cash flow forecasting', desc: 'Predicts your balance 30, 60, and 90 days out based on current patterns.' },
      { title: 'Bill overlap detection', desc: 'Alerts you when multiple large payments hit the same week.' },
      { title: 'Revenue trend analysis', desc: 'Spots declining or growing revenue patterns before you notice them.' },
      { title: 'Safe spending limits', desc: 'Calculates exactly how much you can spend today without risk.' },
    ],
  };
  return features[type] || features.other;
}
