import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Database,
  LockKey,
  ShieldCheck,
  Sparkle,
  UserCircleGear,
} from '@phosphor-icons/react';
import { TopNav } from '../components/layout/TopNav';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { APP_ROUTES } from '../lib/appRoutes';

void motion;

const spring = { type: "spring", stiffness: 70, damping: 18 };

const sections = [
  {
    icon: ShieldCheck,
    eyebrow: 'Account Creation',
    title: 'What TalksAI collects when you create an account',
    body: 'When you create a TalksAI account, we generate a secure workspace profile tied to your name, email address, and login credentials. That profile lets you sign in, manage connected tools, and receive personalized financial insights inside the product.',
  },
  {
    icon: Database,
    eyebrow: 'Financial Data',
    title: 'The business information you choose to share',
    body: 'TalksAI analyzes business financial information that you provide directly. This can include manually entered metrics such as revenue, expenses, and cash flow, uploaded summaries or spreadsheets, and information shared through connected platforms such as Wave Accounting or QuickBooks.',
  },
  {
    icon: Sparkle,
    eyebrow: 'Platform Use',
    title: 'How TalksAI uses your information',
    body: 'We use the information associated with your workspace to authenticate your account, analyze business performance, generate AI-powered recommendations, and improve the reliability of the platform. TalksAI does not sell your information or use your financial data for advertising.',
  },
  {
    icon: UserCircleGear,
    eyebrow: 'Your Controls',
    title: 'What stays in your control',
    body: 'You decide which financial tools to connect, what information to upload, and when to disconnect integrations. You may also request deletion of your account and associated data when you no longer want to use TalksAI.',
  },
  {
    icon: LockKey,
    eyebrow: 'AI Transparency',
    title: 'How to interpret AI-generated insights',
    body: 'TalksAI uses AI to surface decision-support insights, summaries, forecasts, and suggested actions. These outputs are designed to help business owners make faster decisions, but they are not a substitute for professional accounting, legal, or financial advice.',
  },
];

const usageItems = [
  'authenticate and maintain your TalksAI account',
  'analyze your business financial metrics and connected records',
  'generate cash-flow forecasts, recommendations, and AI responses',
  'support product reliability, debugging, and service improvement',
];

const sourceItems = [
  'manual entry of business metrics such as revenue, expenses, or cash flow',
  'uploaded statements, summaries, or spreadsheets',
  'secure integrations with accounting or finance tools you choose to connect',
  'sample business data used only when you intentionally enter demo mode',
];

export const PrivacyNotice = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] font-sans text-zinc-950">
      <TopNav showSections={false} />

      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 mb-10"
          >
            <section className="border border-zinc-200 rounded-[2.5rem] bg-white p-8 md:p-12 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
              <Badge variant="neutral" className="rounded-full px-4 mb-6">Privacy Notice</Badge>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">Last updated March 13, 2026</p>
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.02] mb-6">
                Privacy, consent, and clarity for every TalksAI workspace.
              </h1>
              <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-[44rem]">
                This notice explains what information TalksAI collects, how it is used, and what choices you keep when you create an account and use the platform. It is written to support both the live product and the guided demo experience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
                {[
                  ['Who this covers', 'Anyone creating an account or using the demo workspace'],
                  ['Primary purpose', 'Secure access plus AI-powered financial decision support'],
                  ['What we do not do', 'We do not sell user data or use financial data for advertising'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 px-5 py-5">
                    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-400 mb-2">{label}</p>
                    <p className="text-sm font-medium text-zinc-700 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="border border-zinc-200 rounded-[2.5rem] bg-zinc-950 text-white p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-5">At a glance</p>
              <div className="space-y-5">
                {[
                  'Your account profile is created from basic signup details such as your name, email address, and credentials.',
                  'Financial insights are generated from information you enter, upload, or connect through approved integrations.',
                  'Demo mode uses sample business data so judges and testers can explore the product safely.',
                  'Live AI insights are designed to help decision-making, not replace licensed professional advice.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} weight="fill" className="text-zinc-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-800">
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  By creating an account, you acknowledge that you have read this notice and consent to the collection and use of your information as described below.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={APP_ROUTES.auth}>
                    <Button variant="primary" className="w-full sm:w-auto">Create account</Button>
                  </Link>
                  <Link to={APP_ROUTES.home} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                    <ArrowLeft size={16} weight="bold" />
                    Back to home
                  </Link>
                </div>
              </div>
            </aside>
          </motion.div>

          <section className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.08 }}
              className="border border-zinc-200 rounded-[2.5rem] bg-white p-8 md:p-10"
            >
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-400 mb-5">Information sources</p>
              <ul className="space-y-4">
                {sourceItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-zinc-900 shrink-0" />
                    <p className="text-sm md:text-[15px] text-zinc-600 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 border-t border-zinc-200">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-400 mb-5">How your information may be used</p>
                <ul className="space-y-4">
                  {usageItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle size={16} weight="fill" className="text-zinc-400 mt-1 shrink-0" />
                      <p className="text-sm md:text-[15px] text-zinc-600 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.14 }}
              className="space-y-6"
            >
              {sections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <article
                    key={section.title}
                    className="border border-zinc-200 rounded-[2rem] bg-white p-7 md:p-8 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.15)]"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                        <SectionIcon size={22} weight="duotone" className="text-zinc-800" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-400">{section.eyebrow}</p>
                        <h2 className="text-xl md:text-2xl font-medium tracking-tight text-zinc-950">{section.title}</h2>
                      </div>
                    </div>
                    <p className="text-sm md:text-[15px] text-zinc-600 leading-relaxed">{section.body}</p>
                  </article>
                );
              })}
            </motion.div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="mt-8 border border-zinc-200 rounded-[2.5rem] bg-white px-8 py-8 md:px-10 md:py-10"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-400 mb-4">Consent</p>
            <p className="text-base md:text-lg text-zinc-700 leading-relaxed max-w-[70rem]">
              By creating a TalksAI account, connecting financial tools, or uploading financial information into your workspace,
              you confirm that you have read and understood this Privacy Notice and consent to the collection and use of your
              information for secure account access, platform functionality, and AI-powered financial insights.
            </p>
          </motion.section>
        </div>
      </main>
    </div>
  );
};
