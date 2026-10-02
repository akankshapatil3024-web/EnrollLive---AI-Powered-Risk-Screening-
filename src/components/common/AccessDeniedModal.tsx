import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessDeniedModal: React.FC = () => {
  const { accessDeniedMessage, clearAccessDenied, role } = useAuth();

  if (!accessDeniedMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-100 max-w-md w-full p-6 text-center transform transition-all scale-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {accessDeniedMessage}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-left flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Security Enforcement:</span> Role-based authorization strictly prevents access to non-authorized records or clinical dashboards.
          </div>
        </div>

        <button
          onClick={clearAccessDenied}
          className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Return to Authorized {role === 'DOCTOR' ? 'Doctor' : 'Patient'} Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-blue-50/80 border-b border-blue-100 text-blue-900 px-4 py-2 text-xs flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>
          <strong>Clinical Decision Support Notice:</strong> EnrollLive provides predictive readmission risk scoring and does not replace professional medical judgment or diagnosis.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-sm border border-blue-800/40 my-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-800/50 rounded-lg text-blue-300 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-blue-200 uppercase">
            Predictive Decision-Support Platform Notice
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            EnrollLive is an AI-powered predictive hospital readmission risk screening and decision-making platform. It is <strong>NOT</strong> a medical diagnosis system and does not replace the professional clinical judgment of licensed physicians or multidisciplinary discharge teams.
          </p>
        </div>
      </div>
    </div>
  );
};
