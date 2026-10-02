import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  HelpCircle, 
  Shield, 
  Stethoscope, 
  UserCheck, 
  ChevronDown,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_DOCTOR_ID, DEMO_PATIENT_P1024_ID, DEMO_PATIENT_P1028_ID } from '../../services/firebase';
import { ThemeToggleIcon } from './ThemeToggleIcon';

interface Props {
  onToggleMobileSidebar: () => void;
  onOpenLimitations: () => void;
}

export const Header: React.FC<Props> = ({ onToggleMobileSidebar, onOpenLimitations }) => {
  const { userProfile, role, logout, loginAsDemoUser } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = role === 'DOCTOR' ? [
    { id: 1, title: 'High-Risk Readmission Alert', message: 'Patient P1024 (Robert Smith) predicted at 78% risk.', time: '10m ago' },
    { id: 2, title: 'Screening Completed', message: 'Screening for P1027 Arthur Pendelton generated successfully.', time: '1h ago' }
  ] : [
    { id: 1, title: 'Assessment Updated', message: 'Your post-discharge readmission assessment has been updated by Dr. Jenkins.', time: '2h ago' },
    { id: 2, title: 'Care Reminder', message: 'Please review your 48-hour follow-up telephone schedule.', time: 'Yesterday' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {role === 'DOCTOR' ? (
                <>
                  <span>Welcome, Dr. {userProfile?.name?.replace(/^Dr\.\s*/, '') || 'Physician'}</span>
                  <span className="hidden sm:inline-flex text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Attending Physician
                  </span>
                </>
              ) : (
                <>
                  <span>Welcome, {userProfile?.name || 'Patient'}</span>
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Patient ID: {userProfile?.patientId || 'P1024'}
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {role === 'DOCTOR' 
                ? 'Clinical Decision-Support & Inpatient Readmission Surveillance' 
                : 'Personal Hospital Recovery & Care Continuity Dashboard'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Role Switcher (Crucial for verifying strict segregation) */}
          <div className="relative">
            <button
              onClick={() => { setShowDemoMenu(!showDemoMenu); setShowProfileMenu(false); setShowNotifications(false); }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50 text-slate-700 flex items-center gap-1.5 transition"
              title="Test role authorization segregation"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Test Role:</span>
              <span className="font-bold text-blue-800">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Authorized Account
                </div>
                <button
                  onClick={() => { loginAsDemoUser(DEMO_DOCTOR_ID); setShowDemoMenu(false); }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-3 transition ${
                    role === 'DOCTOR' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Dr. Sarah Jenkins, MD</div>
                    <div className="text-[11px] text-slate-500">Doctor Dashboard (Multi-Patient)</div>
                  </div>
                </button>

                <button
                  onClick={() => { loginAsDemoUser(DEMO_PATIENT_P1024_ID); setShowDemoMenu(false); }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-3 transition mt-1 ${
                    userProfile?.patientId === 'P1024' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Robert Smith (Patient P1024)</div>
                    <div className="text-[11px] text-slate-500">Only P1024 Records Allowed</div>
                  </div>
                </button>

                <button
                  onClick={() => { loginAsDemoUser(DEMO_PATIENT_P1028_ID); setShowDemoMenu(false); }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-3 transition mt-1 ${
                    userProfile?.patientId === 'P1028' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Maria Santos (Patient P1028)</div>
                    <div className="text-[11px] text-slate-500">Only P1028 Records Allowed</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Theme Change Icon */}
          <ThemeToggleIcon />

          {/* Model Scope & Limitations Button */}
          <button
            onClick={onOpenLimitations}
            className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
            title="Model Scope & Limitations"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); setShowDemoMenu(false); }}
              className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all as read</span>
                </div>
                <div className="divide-y divide-slate-100 mt-1 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 text-xs">
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 leading-snug">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowDemoMenu(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{userProfile?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{userProfile?.email}</div>
                  <div className="mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {role}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { onOpenLimitations(); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    Model Limitations & Ethics
                  </button>
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
