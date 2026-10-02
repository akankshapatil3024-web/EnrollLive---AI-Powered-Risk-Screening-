import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  BarChart3, 
  BrainCircuit, 
  FileText, 
  User, 
  LogOut, 
  HeartPulse, 
  History, 
  Bell, 
  Settings, 
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({ 
  currentRoute, 
  onRouteChange, 
  mobileOpen, 
  onCloseMobile 
}) => {
  const { role, logout, userProfile } = useAuth();

  const handleNav = (route: string) => {
    onRouteChange(route);
    onCloseMobile();
  };

  const doctorNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'risk-screening', label: 'Risk Screening', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'model-performance', label: 'Model Performance', icon: BrainCircuit },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const patientNavItems = [
    { id: 'my-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'my-profile', label: 'My Profile', icon: User },
    { id: 'my-risk', label: 'My Risk', icon: HeartPulse },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'my-history', label: 'My Screening History', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const items = role === 'DOCTOR' ? doctorNavItems : patientNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 
        bg-gradient-to-b from-[#0a192f] via-[#0d2346] to-[#09152b]
        text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 ring-2 ring-blue-400/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-wider text-white">ENROLLLIVE</span>
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-300 block">
                Decision Platform
              </span>
            </div>
          </div>
          
          <p className="text-[11px] text-blue-200/70 mt-2.5 leading-snug font-normal">
            AI-Powered Predictive Hospital Readmission Risk Screening and Decision-Making Platform
          </p>

          <div className="mt-3.5 pt-2.5 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Workspace:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
              role === 'DOCTOR' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
            }`}>
              {role === 'DOCTOR' ? 'Doctor Portal' : `Patient (${userProfile?.patientId || 'Portal'})`}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="text-[10px] font-bold text-blue-400/60 uppercase tracking-wider px-3 pb-1">
            Navigation Menu
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                    : 'text-slate-300 hover:text-white hover:bg-white/8'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-blue-300/80 group-hover:text-sky-300'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Clinical Disclaimer Box & Logout */}
        <div className="p-4 border-t border-blue-900/60 bg-blue-950/40">
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-xl p-2.5 mb-3 text-[10px] text-blue-200/80 leading-tight">
            <span className="font-semibold text-white">Notice:</span> Assistive predictive model. Does not replace professional clinical diagnosis.
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
