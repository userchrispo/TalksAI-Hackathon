import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { APP_ROUTES } from '../lib/appRoutes';
import {
  EnvelopeSimple, Lock, Storefront, User, ArrowRight,
  Eye, EyeSlash, Lightning, ShieldCheck, ChartLineUp, Warning
} from '@phosphor-icons/react';

void motion;

const spring = { type: "spring", stiffness: 100, damping: 20 };

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: spring },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const FormInput = ({ label, icon: Icon, type = 'text', showToggle, ...props }) => {
  const [visible, setVisible] = useState(false);
  const resolvedType = showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <motion.div variants={fadeIn}>
      <label className="block text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-2">{label}</label>
      <div className="relative">
        {Icon ? <Icon size={16} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /> : null}
        <input
          type={resolvedType}
          className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl ${Icon ? 'pl-10' : 'pl-4'} ${showToggle ? 'pr-12' : 'pr-4'} py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-[15px] font-medium transition-shadow`}
          {...props}
        />
        {showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            {visible ? <EyeSlash size={18} weight="regular" /> : <Eye size={18} weight="regular" />}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
};

const features = [
  { icon: Lightning, title: 'AI Cash Prediction', desc: 'Know exactly what you can spend today.' },
  { icon: Warning, title: 'Problem Detection', desc: 'Catch overlapping bills before they hurt.' },
  { icon: ChartLineUp, title: 'What-If Simulator', desc: 'Test hiring, purchases, or revenue dips.' },
];

export const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    shopName: '', ownerName: '', email: '', password: '', confirmPassword: '',
  });

  const updateLogin = (key, val) => setLoginForm((prev) => ({ ...prev, [key]: val }));
  const updateRegister = (key, val) => setRegisterForm((prev) => ({ ...prev, [key]: val }));

  const handleLogin = (e) => {
    e.preventDefault();
    setFormError('');

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      navigate('/setup', {
        state: {
          authFlow: 'login',
          shopName: '',
          ownerName: loginForm.email.split('@')[0],
          email: loginForm.email,
        },
      });
    }, 1200);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setFormError('');

    if (!registerForm.shopName.trim() || !registerForm.ownerName.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (registerForm.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      navigate('/setup', {
        state: {
          authFlow: 'register',
          shopName: registerForm.shopName,
          ownerName: registerForm.ownerName,
          email: registerForm.email,
        },
      });
    }, 1200);
  };

  const slideVariants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  };

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] flex font-sans">

      {/* Left: Branding Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...spring, delay: 0.1 }}
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-zinc-950 text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
      >
        <div className="relative z-10">
          <Link to="/" className="font-semibold text-xl tracking-tight text-white mb-20 block">
            TALKS AI
          </Link>

          <div className="mt-20">
            <h2 className="text-3xl xl:text-4xl font-medium tracking-tighter leading-[1.1] mb-6">
              See your cash flow
              <br />
              <span className="text-zinc-500">before it happens.</span>
            </h2>
            <p className="text-zinc-400 text-[15px] leading-relaxed max-w-[32ch]">
              The AI-powered dashboard for small businesses. Stop guessing, start knowing.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-6">
            {features.map((feature, i) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                    <FeatureIcon size={20} weight="duotone" className="text-zinc-300" />
                  </div>
                  <div>
                    <span className="text-[14px] font-medium text-zinc-200">{feature.title}</span>
                    <p className="text-[13px] text-zinc-500 mt-0.5">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 mt-auto pt-12">
          <ShieldCheck size={16} weight="fill" className="text-zinc-600" />
          <span className="text-[13px] text-zinc-600 font-medium">256-bit encrypted. Your data stays private.</span>
        </div>

        {/* Background decorative element */}
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-zinc-900/50 rounded-full blur-3xl" />
      </motion.div>

      {/* Right: Auth Forms */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden font-semibold text-xl tracking-tight text-zinc-950 mb-10 block text-center">
            TALKS AI
          </Link>

          {/* Tab switcher */}
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-10 relative">
            <button
              type="button"
              onClick={() => { setMode('login'); setFormError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 ${
                mode === 'login' ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setFormError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 ${
                mode === 'register' ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Create account
            </button>
            <motion.div
              layoutId="auth-tab-indicator"
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm"
              style={{ left: mode === 'login' ? '6px' : 'calc(50% + 0px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Forms */}
          <div className="relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              {mode === 'login' && !isSubmitting && (
                <motion.form
                  key="login"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring}
                  onSubmit={handleLogin}
                  className="w-full"
                >
                  <h1 className="text-3xl font-medium tracking-tighter text-zinc-950 mb-2">Welcome back</h1>
                  <p className="text-zinc-500 text-[15px] mb-10">Sign in to your TALKS AI workspace.</p>

                  <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
                    <FormInput
                      label="Email address"
                      icon={EnvelopeSimple}
                      type="email"
                      placeholder="you@business.com"
                      value={loginForm.email}
                      onChange={(e) => updateLogin('email', e.target.value)}
                    />
                    <FormInput
                      label="Password"
                      icon={Lock}
                      type="password"
                      showToggle
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => updateLogin('password', e.target.value)}
                    />
                  </motion.div>

                  {formError ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 font-medium mt-4"
                    >
                      {formError}
                    </motion.p>
                  ) : null}

                  <div className="flex justify-end mt-4">
                    <button type="button" className="text-xs text-zinc-400 hover:text-zinc-700 font-medium transition-colors">Forgot password?</button>
                  </div>

                  <Button
                    magnetic
                    variant="primary"
                    type="submit"
                    className="w-full h-[52px] text-[15px] mt-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  >
                    Log in <ArrowRight size={16} weight="bold" className="ml-2" />
                  </Button>

                  <p className="text-center text-sm text-zinc-400 mt-6">
                    <button type="button" onClick={() => { setMode('register'); setFormError(''); }} className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors">
                      Don't have an account? Sign up
                    </button>
                  </p>
                </motion.form>
              )}

              {mode === 'register' && !isSubmitting && (
                <motion.form
                  key="register"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring}
                  onSubmit={handleRegister}
                  className="w-full"
                >
                  <h1 className="text-3xl font-medium tracking-tighter text-zinc-950 mb-2">Create your workspace</h1>
                  <p className="text-zinc-500 text-[15px] mb-10">Get started with TALKS AI in under a minute.</p>

                  <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormInput
                        label="Business name"
                        icon={Storefront}
                        placeholder="Vance Auto Body"
                        value={registerForm.shopName}
                        onChange={(e) => updateRegister('shopName', e.target.value)}
                      />
                      <FormInput
                        label="Your name"
                        icon={User}
                        placeholder="Evelyn Vance"
                        value={registerForm.ownerName}
                        onChange={(e) => updateRegister('ownerName', e.target.value)}
                      />
                    </div>
                    <FormInput
                      label="Email address"
                      icon={EnvelopeSimple}
                      type="email"
                      placeholder="you@business.com"
                      value={registerForm.email}
                      onChange={(e) => updateRegister('email', e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormInput
                        label="Password"
                        icon={Lock}
                        type="password"
                        showToggle
                        placeholder="Min. 6 characters"
                        value={registerForm.password}
                        onChange={(e) => updateRegister('password', e.target.value)}
                      />
                      <FormInput
                        label="Confirm password"
                        icon={Lock}
                        type="password"
                        showToggle
                        placeholder="Re-enter password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => updateRegister('confirmPassword', e.target.value)}
                      />
                    </div>
                  </motion.div>

                  {formError ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 font-medium mt-4"
                    >
                      {formError}
                    </motion.p>
                  ) : null}

                  <Button
                    magnetic
                    variant="primary"
                    type="submit"
                    className="w-full h-[52px] text-[15px] mt-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  >
                    Create account <ArrowRight size={16} weight="bold" className="ml-2" />
                  </Button>

                  <p className="text-xs text-zinc-400 leading-relaxed mt-5">
                    By creating an account, you agree to the{' '}
                    <Link to={APP_ROUTES.privacy} className="text-zinc-700 font-medium hover:text-zinc-950 transition-colors">
                      Privacy Notice
                    </Link>{' '}
                    and consent to the collection and use of your information to power secure access and AI-generated financial insights.
                  </p>

                  <p className="text-center text-sm text-zinc-400 mt-6">
                    <button type="button" onClick={() => { setMode('login'); setFormError(''); }} className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors">
                      Already have an account? Log in
                    </button>
                  </p>
                </motion.form>
              )}

              {isSubmitting && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={spring}
                  className="flex flex-col items-center justify-center min-h-[400px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                  >
                    <Lightning size={36} weight="fill" className="text-zinc-900" />
                  </motion.div>
                  <h2 className="text-2xl font-medium tracking-tight text-zinc-950 mb-3">
                    {mode === 'login' ? 'Signing you in' : 'Setting up your workspace'}
                  </h2>
                  <p className="text-zinc-500 text-[15px] text-center max-w-xs">
                    {mode === 'login'
                      ? 'Loading your dashboard and financial data.'
                      : 'Configuring your AI copilot. This takes just a moment.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Demo link */}
          {!isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 pt-8 border-t border-zinc-200 text-center"
            >
              <p className="text-sm text-zinc-400 mb-3">Want to explore with sample data first?</p>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
              >
                View Demo Instead <ArrowRight size={14} weight="bold" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
