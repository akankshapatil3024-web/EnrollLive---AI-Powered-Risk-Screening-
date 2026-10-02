import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText, 
  Bell, 
  ArrowRight, 
  Pill, 
  User, 
  CheckCircle2,
  Stethoscope,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, ScreeningRecord, ReportRecord } from '../../types';
import { 
  getPatientRecordForUser, 
  getPatientScreeningsForUser, 
  getPatientReportsForUser 
} from '../../services/firebase';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface Props {
  onNavigate: (route: string) => void;
}

export const PatientDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatientData() {
      if (!userProfile?.uid) return;
      try {
        const [record, scrList, repList] = await Promise.all([
          getPatientRecordForUser(userProfile.uid, userProfile.patientId),
          getPatientScreeningsForUser(userProfile.uid, userProfile.patientId),
          getPatientReportsForUser(userProfile.uid, userProfile.patientId)
        ]);
        setPatientRecord(record);
        setScreenings(scrList);
        setReports(repList);
      } catch (err) {
        console.error('Error fetching patient personalized data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading your private health record...</p>
      </div>
    );
  }

  const latestScreening = screenings.length > 0 ? screenings[0] : null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner Disclaimer */}
      <DisclaimerBanner />

      {/* Patient Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 bg-white/10 px-3 py-1 rounded-full inline-block mb-2">
              My Health Dashboard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {patientRecord?.name || userProfile?.name || 'Patient'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
              Track your hospital recovery journey, understand your personalized readmission risk factors, and stay connected with your care instructions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-right sm:text-right shrink-0">
            <span className="text-[10px] text-blue-200 uppercase font-semibold block">Patient Record ID</span>
            <span className="text-xl font-mono font-bold text-white">
              {patientRecord?.patientId || userProfile?.patientId || 'P1024'}
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold block mt-1">
              &bull; Private Protected Data
            </span>
          </div>
        </div>
      </div>

      {/* Grid: My Profile & Latest Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MY LATEST RISK ASSESSMENT (Crucial Section) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  My Latest Risk Assessment
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Last Updated: <strong className="text-slate-900">{patientRecord?.lastScreeningDate || '02 October 2026'}</strong>
              </span>
            </div>

            {/* Assessment Score Display */}
            <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-inner ${
                  patientRecord?.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 border-2 border-red-200' :
                  patientRecord?.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                }`}>
                  {patientRecord?.riskScore || 78}%
                </div>
                <div>
                  <div className={`text-base font-extrabold uppercase tracking-wide ${
                    patientRecord?.riskLevel === 'HIGH' ? 'text-red-700' :
                    patientRecord?.riskLevel === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {patientRecord?.riskLevel || 'HIGH'} RISK
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs leading-snug">
                    Estimated statistical probability of hospital readmission within 30 days post-discharge.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('my-risk')}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <span>Understand My Risk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Patient-Friendly Explanation */}
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>What does this mean for me?</strong> This score helps your healthcare team create a personalized transition plan to keep you safely recovering at home. It is not a diagnosis.
              </p>
              {patientRecord?.riskLevel === 'HIGH' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 font-medium">
                  Your care team has scheduled an early 48-hour follow-up phone call and home recovery check to ensure your medications are working comfortably.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Evaluated by Dr. {patientRecord?.assignedDoctorName?.replace(/^Dr\.\s*/, '') || 'Attending Physician'}</span>
            <button 
              onClick={() => onNavigate('my-risk')}
              className="text-blue-700 hover:text-blue-900 font-semibold"
            >
              View Detailed Factors &rarr;
            </button>
          </div>
        </div>

        {/* MY PROFILE (Patient Info Card) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  My Profile
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('my-profile')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                View Full Profile
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Legal Name</span>
                <span className="font-bold text-slate-900">{patientRecord?.name || userProfile?.name}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Patient Identifier</span>
                <span className="font-mono font-bold text-blue-900">{patientRecord?.patientId || userProfile?.patientId}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Age & Gender</span>
                <span className="font-bold text-slate-900">{patientRecord?.age || 67} yrs &bull; {patientRecord?.gender || 'Male'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Primary Condition</span>
                <span className="font-bold text-slate-900">{patientRecord?.medicalCondition || 'Heart Failure'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Attending Physician</span>
                <span className="font-bold text-slate-900">{patientRecord?.assignedDoctorName || 'Dr. Sarah Jenkins, MD'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Enrolled in Acute Inpatient Transitional Care Program
          </div>
        </div>
      </div>

      {/* Grid: My Reports & My Screening History & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MY REPORTS (Filtered strictly to this patient) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                My Clinical Reports
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('my-reports')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              All Reports ({reports.length})
            </button>
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">
              Your care team has not finalized a formal discharge report yet.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{rep.date} &bull; Clinical Report</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Prepared by: {rep.doctorName}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('my-reports')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY NOTIFICATIONS & SCREENING TIMELINE */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Health Alerts & Notifications
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('notifications')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-950 block">Your latest risk assessment has been updated.</span>
                <span className="text-[11px] text-blue-800">
                  Dr. Jenkins reviewed your recovery progress and updated your discharge plan.
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block">Please review your follow-up information.</span>
                <span className="text-[11px] text-amber-800">
                  Keep your phone nearby for your scheduled 48-hour post-discharge nurse call.
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-start gap-2.5">
              <Pill className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Medication Reconciliation Complete</span>
                <span className="text-[11px] text-slate-500">
                  Pharmacist verified active medications before hospital departure.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
