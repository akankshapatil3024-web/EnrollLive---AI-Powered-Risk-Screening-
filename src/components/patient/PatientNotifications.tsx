import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Pill, Calendar, HeartPulse } from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const PatientNotifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'assessment',
      title: 'Your latest risk assessment has been updated.',
      desc: 'Dr. Sarah Jenkins reviewed your recovery metrics and updated your transitional care profile to 78% (HIGH RISK). Please review your follow-up plan.',
      date: 'Today at 08:30 AM',
      icon: HeartPulse,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 2,
      type: 'followup',
      title: 'Please review your follow-up information.',
      desc: 'A clinical transitional nurse is scheduled to call you for a check-in within 48 to 72 hours following discharge. Please verify that your contact phone is accessible.',
      date: 'Yesterday at 04:15 PM',
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-700'
    },
    {
      id: 3,
      type: 'medication',
      title: 'Medication Reconciliation Verified',
      desc: 'Clinical pharmacy completed reconciliation for your 11 active discharge prescriptions. Discharge instructions are available in your portal.',
      date: '30 Sep 2026',
      icon: Pill,
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 4,
      type: 'appointment',
      title: 'Heart Failure Outpatient Clinic Reminder',
      desc: 'Your in-person post-discharge cardiology clinic visit is set for Friday, 09 October 2026 at 10:00 AM.',
      date: '28 Sep 2026',
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-700'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-700" />
              Notifications & Health Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Important alerts and reminders regarding your hospital discharge recovery
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {notifications.length} Alerts
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
