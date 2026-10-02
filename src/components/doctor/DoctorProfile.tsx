import React from 'react';
import { User, Stethoscope, Building, Mail, Shield, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const DoctorProfile: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-blue-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-700/20 ring-4 ring-blue-50">
            {userProfile?.name?.charAt(0) || 'D'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900">{userProfile?.name}</h2>
              <span className="self-center sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Verified Attending Physician
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {userProfile?.specialty || 'Internal Medicine & Hospitalist Medicine'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {userProfile?.department || 'Department of Acute Inpatient Care'}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {userProfile?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials and Role Authorization Info */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Clinical Security & Access Privileges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-800 block mb-1">Assigned Cohort Privilege</span>
              <p className="text-slate-600 leading-snug">
                Authorized to view, screen, and generate clinical readmission reports for patients assigned to your care service.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-800 block mb-1">Cryptographic Role Validation</span>
              <p className="text-slate-600 leading-snug">
                Verified role: <code className="font-mono font-bold text-blue-700">DOCTOR</code> enforced through Firestore security rules.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>Audit Trail:</strong> All readmission risk screening events and report generation actions are immutably logged with timestamp, physician UID, and ML model version identifier.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
