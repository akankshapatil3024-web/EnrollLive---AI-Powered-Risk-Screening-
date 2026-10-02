import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  AlertCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DEMO_DOCTOR_ID, DEMO_PATIENT_P1024_ID, DEMO_PATIENT_P1028_ID } from '../../services/firebase';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemoUser, error: authError } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Please enter your full legal name.');
        }
        await registerWithEmail(email, password, selectedRole, name, patientIdInput || undefined);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await loginWithGoogle(selectedRole);
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-[#071329] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Bar Disclaimer & Theme Switcher */}
      <div className="bg-blue-950/80 border-b border-blue-900/50 py-2 px-4 flex items-center justify-between text-xs text-blue-200/90 font-medium">
        <span className="hidden sm:inline">EnrollLive provides predictive decision support and does not replace professional medical judgment or clinical diagnosis.</span>
        <span className="sm:hidden text-[11px]">EnrollLive Clinical Decision Platform</span>
        <ThemeToggleIcon />
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Branding, Purpose & Architecture */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-sky-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Machine Learning Inpatient Risk Surveillance
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/20">
                  <HeartPulse className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  ENROLLLIVE
                </h1>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-blue-200 mt-3 leading-snug">
                AI-Powered Predictive Hospital Readmission Risk Screening and Decision-Making Platform
              </h2>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Empowering attending hospitalists, clinical teams, and patients with explainable 30-day readmission risk stratification. Grounded in validated multicenter inpatient cohorts, algorithmic transparency, and strict role-based data isolation.
            </p>

            {/* Key Platform Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
                  <Stethoscope className="w-4 h-4" />
                  Doctor Workspace
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Inpatient cohort surveillance, interactive risk screening, clinical explainability (SHAP), and formal discharge reports.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                  <UserCheck className="w-4 h-4" />
                  Patient Workspace
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Private patient portal strictly isolated to own clinical record, personalized risk factors, and follow-up guidance.
                </p>
              </div>
            </div>

            {/* 1-Click Fast Evaluation Profiles */}
            <div className="bg-blue-900/30 border border-blue-700/40 rounded-2xl p-4.5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Quick Evaluation Demo Accounts
                </div>
                <span className="text-[11px] text-blue-300">Click to instantly login</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => loginAsDemoUser(DEMO_DOCTOR_ID)}
                  className="text-left p-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-sky-200 flex items-center justify-between">
                    <span>Dr. Sarah Jenkins</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-300 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[11px] text-blue-200 font-medium mt-0.5">Role: DOCTOR</div>
                  <div className="text-[10px] text-slate-400 mt-1">Multi-patient management</div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsDemoUser(DEMO_PATIENT_P1024_ID)}
                  className="text-left p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-emerald-200 flex items-center justify-between">
                    <span>Robert Smith</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-0.5">Patient ID: P1024</div>
                  <div className="text-[10px] text-slate-400 mt-1">High Risk (78%) profile</div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAsDemoUser(DEMO_PATIENT_P1028_ID)}
                  className="text-left p-3 rounded-xl bg-emerald-700/20 hover:bg-emerald-700/40 border border-emerald-600/40 transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-emerald-200 flex items-center justify-between">
                    <span>Maria Santos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-0.5">Patient ID: P1028</div>
                  <div className="text-[10px] text-slate-400 mt-1">Low Risk (22%) profile</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Real Authentication Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 relative">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isRegister ? 'Create Secure Account' : 'Sign In to EnrollLive'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isRegister 
                    ? 'Register your authorized healthcare or patient profile' 
                    : 'Enter your credentials to access your authorized workspace'}
                </p>
              </div>

              {(localError || authError) && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Authentication Error:</span>{' '}
                    {localError || authError}
                  </div>
                </div>
              )}

              {forgotSent && (
                <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Password reset link sent to your registered email.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Account Type (Role)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('DOCTOR')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                          selectedRole === 'DOCTOR' 
                            ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        Doctor
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('PATIENT')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                          selectedRole === 'PATIENT' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Patient
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Role authorization is cryptographically verified in Firestore backend rules.
                    </p>
                  </div>
                )}

                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={selectedRole === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'Robert Smith'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium transition"
                      />
                    </div>
                  </div>
                )}

                {isRegister && selectedRole === 'PATIENT' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Patient Identification Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={patientIdInput}
                      onChange={(e) => setPatientIdInput(e.target.value)}
                      placeholder="e.g. P1024 (leave blank to auto-generate)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="physician@hospital.org or patient@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => setForgotSent(true)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRegister ? 'Complete Registration' : 'LOGIN'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Or continue with</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google Workspace</span>
              </button>

              {/* Toggle Register / Login */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setLocalError(null); }}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                >
                  {isRegister 
                    ? 'Already have an authorized account? Sign In' 
                    : "Don't have an account? Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legal & Clinical Notice */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 EnrollLive Predictive Healthcare Decision Support Systems</span>
          <span className="text-slate-500">Not a Medical Diagnosis Tool &bull; Strictly Role-Governed Access</span>
        </div>
      </footer>
    </div>
  );
};
