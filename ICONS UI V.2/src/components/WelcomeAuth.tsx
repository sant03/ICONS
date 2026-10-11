import React, { useState } from 'react';
import { ViewMode, ThemeMode } from '../types';
import { 
  LayoutGrid, 
  LogIn, 
  UserPlus, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Key, 
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Building,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';

interface WelcomeAuthProps {
  initialSubMode?: 'welcome' | 'login' | 'register';
  onAuthenticate: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const WelcomeAuth: React.FC<WelcomeAuthProps> = ({
  initialSubMode = 'welcome',
  onAuthenticate,
  theme,
  onToggleTheme
}) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>(initialSubMode);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('Freddy60');
  const [password, setPassword] = useState('••••••••');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate();
  };

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate();
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] flex flex-col justify-between p-4 md:p-8 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Top navbar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[var(--bg-secondary)] rounded-[14px] flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">PlastyFreddy</h1>
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              INVENTORY MANAGEMENT INFRASTRUCTURE
            </p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm flex items-center gap-2 text-xs font-medium"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span className="hidden sm:inline">{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto w-full my-auto z-10 py-8">
        {/* VIEW 1: WELCOME SCREEN */}
        {mode === 'welcome' && (
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl p-8 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mx-auto flex items-center justify-center shadow-inner">
              <LayoutGrid className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-mono font-semibold border border-cyan-500/20">
                ICONS (SISTEMA DE CONTROL DE INVENTARIO)
              </span>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mt-4 tracking-tight">
                Welcome
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto">
                Please sign in to your account or create a new one to manage your inventory.
              </p>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <button
                onClick={() => setMode('login')}
                className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4" />
                  <span>LOG IN</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setMode('register')}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] font-semibold text-sm flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-cyan-500" />
                  <span>CREATE ACCOUNT</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-4">
              <span className="font-mono">v2.4.0 — PROD_STABLE</span>
              <span>•</span>
              <a href="#privacy" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN MODAL / CARD */}
        {mode === 'login' && (
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center space-y-1">
                <button
                  onClick={() => setMode('welcome')}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 mx-auto mb-3 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Inicio</span>
                </button>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Log in</h2>
                <p className="text-xs text-[var(--text-muted)]">Sign in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleSubmitLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Password</label>
                    <a href="#forgot" className="text-xs font-semibold text-cyan-500 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>LOG IN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-[var(--border-color)] text-center space-y-3">
                <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Authorized personnel only</span>
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-cyan-500 font-semibold hover:underline cursor-pointer"
                  >
                    Contact administrator / Register
                  </button>
                </p>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
              <span>V2.4.0 — PROD_STABLE_EN</span>
              <div className="flex gap-3">
                <a href="#support" className="hover:underline">Support</a>
                <a href="#privacy" className="hover:underline">Privacy</a>
                <a href="#terms" className="hover:underline">Terms</a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CREATE ACCOUNT / REGISTER */}
        {mode === 'register' && (
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  Create a new account
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Join our enterprise network to manage system resources.
                </p>
              </div>
              <button
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-cyan-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            <form onSubmit={handleSubmitRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-500" />
                    <span>First Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    defaultValue="Freddy"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Last Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    defaultValue="Potes"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    defaultValue="1985-04-12"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    # Age
                  </label>
                  <input
                    type="number"
                    defaultValue={39}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
                    <span># ID (CC)</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="109848102"
                    placeholder="Enter document ID"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Role</span>
                  </label>
                  <select className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500">
                    <option value="Admin">Administrator</option>
                    <option value="Manager">Inventory Manager</option>
                    <option value="Sales">Sales Assistant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Phone</span>
                  </label>
                  <input
                    type="text"
                    defaultValue="+57 300 000 0000"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    defaultValue="freddy@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-[var(--text-secondary)] leading-tight cursor-pointer">
                  <span className="font-semibold text-[var(--text-primary)]">I agree to the Terms of Service and Privacy Policy.</span>
                  <br />
                  <span className="text-[11px] text-[var(--text-muted)]">
                    By creating an account, you acknowledge that your data will be managed according to internal security protocols.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>CREATE ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="w-3 h-3" /> AUTH SERVICE: ONLINE
              </span>
              <span>ENCRYPTION: AES-256</span>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
              <a href="#security" className="hover:text-cyan-500">Security Center</a>
              <span>•</span>
              <a href="#compliance" className="hover:text-cyan-500">Compliance</a>
              <span>•</span>
              <a href="#help" className="hover:text-cyan-500">Help Desk</a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-[11px] text-[var(--text-muted)] z-10 font-mono">
        © 2026 PLASTYFREDDY SYSTEMA DE CONTROL DE INVENTARIO. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
};
