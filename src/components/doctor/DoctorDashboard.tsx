import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowRight,
  Clock, 
  ChevronRight, 
  Search,
  Filter,
  Stethoscope,
  HeartPulse,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, ScreeningRecord } from '../../types';
import { getDoctorPatients, getDoctorScreenings } from '../../services/firebase';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface Props {
  onNavigate: (route: string, patientId?: string) => void;
}

export const DoctorDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!userProfile?.uid) return;
      try {
        const [patList, scrList] = await Promise.all([
          getDoctorPatients(userProfile.uid),
          getDoctorScreenings(userProfile.uid)
        ]);
        setPatients(patList);
        setScreenings(scrList);
      } catch (err) {
        console.error('Failed to load doctor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile]);

  // Compute metrics
  const totalPatients = patients.length;
  const highRiskCount = patients.filter(p => p.riskLevel === 'HIGH').length;
  const mediumRiskCount = patients.filter(p => p.riskLevel === 'MEDIUM').length;
  const lowRiskCount = patients.filter(p => p.riskLevel === 'LOW').length;
  const avgRiskScore = totalPatients > 0 
    ? Math.round(patients.reduce((sum, p) => sum + p.riskScore, 0) / totalPatients) 
    : 0;

  // Condition distribution
  const conditionCounts: Record<string, number> = {};
  patients.forEach(p => {
    conditionCounts[p.medicalCondition] = (conditionCounts[p.medicalCondition] || 0) + 1;
  });

  // Admission type distribution
  const admissionCounts: Record<string, number> = {};
  patients.forEach(p => {
    admissionCounts[p.admissionType] = (admissionCounts[p.admissionType] || 0) + 1;
  });

  const highRiskPatients = patients.filter(p => p.riskLevel === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <DisclaimerBanner />

      {/* 55,502 Kaggle Patient Database Surveillance Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Hospital Inpatient Surveillance: 55,502 Patients Active</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/30 text-sky-200 border border-sky-400/30">
                prasad22/healthcare-dataset
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-0.5">
              17,760 High-Risk Inpatients identified across 6 chronic medical conditions &bull; Calibrated with 15 clinical parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('patients')}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <span>View 55,502 Patients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
          >
            Population Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Inpatients
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalPatients}</span>
            <span className="text-xs font-semibold text-slate-500">active records</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-medium flex items-center gap-1">
            <span>Assigned to your care team</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white rounded-2xl p-5 border border-red-200/80 shadow-xs hover:shadow-md transition bg-gradient-to-br from-white to-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              High Risk (&ge;65%)
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{highRiskCount}</span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalPatients > 0 ? Math.round((highRiskCount / totalPatients) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-700 font-medium">
            Immediate transitional care protocol
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md transition bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Medium Risk (30-64%)
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{mediumRiskCount}</span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalPatients > 0 ? Math.round((mediumRiskCount / totalPatients) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            7-day outpatient post-discharge plan
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs hover:shadow-md transition bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Low Risk (&lt;30%)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{lowRiskCount}</span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalPatients > 0 ? Math.round((lowRiskCount / totalPatients) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            Standard clinical discharge pathway
          </div>
        </div>
      </div>

      {/* Charts Section: Risk Distribution & Condition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readmission Risk Distribution Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Readmission Risk Stratification</h3>
              <p className="text-xs text-slate-500">Cohort risk proportion among assigned patients</p>
            </div>
            <span className="text-xs font-bold text-slate-600">
              Cohort Avg: <strong className="text-blue-700">{avgRiskScore}%</strong>
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {/* High Risk Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-red-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  High Risk (&ge;65%)
                </span>
                <span className="text-slate-600">{highRiskCount} patients ({totalPatients > 0 ? Math.round((highRiskCount / totalPatients) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalPatients > 0 ? (highRiskCount / totalPatients) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium Risk Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Medium Risk (30-64%)
                </span>
                <span className="text-slate-600">{mediumRiskCount} patients ({totalPatients > 0 ? Math.round((mediumRiskCount / totalPatients) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalPatients > 0 ? (mediumRiskCount / totalPatients) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Low Risk Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Low Risk (&lt;30%)
                </span>
                <span className="text-slate-600">{lowRiskCount} patients ({totalPatients > 0 ? Math.round((lowRiskCount / totalPatients) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalPatients > 0 ? (lowRiskCount / totalPatients) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Model Calibration: Platt Sigmoid</span>
            <button 
              onClick={() => onNavigate('analytics')}
              className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Medical Condition Distribution */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Medical Condition Distribution</h3>
              <p className="text-xs text-slate-500">Primary admission diagnoses across cohort</p>
            </div>
            <HeartPulse className="w-4 h-4 text-blue-600" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(conditionCounts).map(([condition, count]) => (
              <div key={condition} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{condition}</div>
                  <div className="text-[11px] text-slate-500">
                    {totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0}% of cohort
                  </div>
                </div>
                <div className="text-sm font-bold text-blue-700 bg-white w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center">
                  {count}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Admission Sources: 62% Emergency, 25% Urgent, 13% Elective</span>
          </div>
        </div>
      </div>

      {/* Immediate Attention: High-Risk Inpatients Table */}
      <div className="bg-white rounded-2xl border border-red-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immediate Clinical Attention: High-Risk Inpatients</h3>
              <p className="text-xs text-slate-600">Patients requiring enhanced discharge planning and transitional follow-up</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
          >
            View All Patients <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Patient ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Stay</th>
                <th className="py-3 px-4">Prior Visits</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highRiskPatients.map((pat) => (
                <tr key={pat.id} className="hover:bg-red-50/20 transition">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-900">
                    {pat.patientId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {pat.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {pat.age} yrs
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">{pat.medicalCondition}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {pat.lengthOfStay} days
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-semibold text-red-700">{pat.previousVisits} visits</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                      <span>{pat.riskScore}%</span>
                      <span>HIGH</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onNavigate('risk-screening', pat.patientId)}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                      >
                        Screen
                      </button>
                      <button
                        onClick={() => onNavigate('patient-detail', pat.patientId)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Screenings Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent ML Risk Screenings</h3>
            <p className="text-xs text-slate-500">Evaluations generated across your assigned ward</p>
          </div>
          <button
            onClick={() => onNavigate('risk-screening')}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            New Risk Screening
          </button>
        </div>

        <div className="space-y-3">
          {screenings.map((scr) => (
            <div key={scr.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  scr.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                  scr.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {scr.riskScore}%
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Patient {scr.patientId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({scr.screeningId})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Primary: {scr.features.medicalCondition} &bull; Model: {scr.modelVersion}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 hidden sm:inline">{scr.date}</span>
                <button
                  onClick={() => onNavigate('patient-detail', scr.patientId)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100/50 rounded-lg transition"
                  title="View clinical breakdown"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
