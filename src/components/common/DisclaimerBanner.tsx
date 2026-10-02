import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-xs border border-blue-800/40 my-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-800/50 rounded-lg text-blue-300 mt-0.5 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-wide text-blue-200 uppercase">
            Predictive Decision-Support Platform Notice
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
            EnrollLive is an AI-powered predictive hospital readmission risk screening and decision-making platform. It is <strong>NOT</strong> a medical diagnosis system and does not replace the professional clinical judgment of licensed physicians or multidisciplinary discharge teams.
          </p>
        </div>
      </div>
    </div>
  );
};
