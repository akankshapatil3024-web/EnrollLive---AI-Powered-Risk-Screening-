import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Stethoscope, 
  Pill, 
  Calendar,
  Building,
  User,
  HeartPulse,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, ScreeningRecord } from '../../types';
import { getPatientByIdForDoctor, getDoctorScreenings } from '../../services/firebase';
import { predictReadmissionRisk } from '../../services/mlEngine';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface Props {
  patientId: string;
  onNavigate: (route: string, patientId?: string) => void;
}

export const DoctorPatientDetail: React.FC<Props> = ({ patientId, onNavigate }) => {
  const { userProfile, setAccessDenied } = useAuth();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [patientScreenings, setPatientScreenings] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      if (!userProfile?.uid) return;
      try {
        const found = await getPatientByIdForDoctor(patientId, userProfile.uid);
        if (!found) {
          setAccessDenied(`Unauthorized: Patient ${patientId} is not assigned to Dr. ${userProfile.name}. Access to non-authorized patient files is strictly prohibited.`);
          onNavigate('patients');
          return;
        }
        setPatient(found);

        // Load screening history for this specific patient
        const allScreenings = await getDoctorScreenings(userProfile.uid);
        const filtered = allScreenings.filter(s => s.patientId === found.patientId);
        setPatientScreenings(filtered);
      } catch (err) {
        console.error('Error loading patient record:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [patientId, userProfile]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Retrieving authorized patient chart...</p>
      </div>
    );
  }

  if (!patient) return null;

  // Real ML explainability factors evaluated dynamically for this patient's features
  const mlEvaluation = predictReadmissionRisk({
    age: patient.age,
    gender: patient.gender,
    medicalCondition: patient.medicalCondition,
    admissionType: patient.admissionType,
    lengthOfStay: patient.lengthOfStay,
    previousVisits: patient.previousVisits,
    numMedications: patient.numMedications,
    numProcedures: patient.numProcedures,
    numDiagnoses: patient.numDiagnoses
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <DisclaimerBanner />

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <button
          onClick={() => onNavigate('patients')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Patients</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('risk-screening', patient.patientId)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Run New Screening</span>
          </button>
          <button
            onClick={() => onNavigate('reports', patient.patientId)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Clinical Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Patient Information & Risk Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Patient Clinical Information */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {patient.patientId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {patient.roomNumber || 'Acute Ward'} &bull; Inpatient Encounter
              </p>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              patient.status === 'Inpatient' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {patient.status}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Patient Demographics & Encounter Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Age & Gender</span>
                <span className="text-xs font-bold text-slate-800">{patient.age} years &bull; {patient.gender}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Admission Acuity</span>
                <span className="text-xs font-bold text-slate-800">{patient.admissionType}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Current Length of Stay</span>
                <span className="text-xs font-bold text-blue-900">{patient.lengthOfStay} Days</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Prior Acute Visits (12m)</span>
                <span className={`text-xs font-bold ${patient.previousVisits >= 2 ? 'text-red-700' : 'text-slate-800'}`}>
                  {patient.previousVisits} Visits
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Active Medications</span>
                <span className="text-xs font-bold text-slate-800">{patient.numMedications} Regimens</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Inpatient Procedures</span>
                <span className="text-xs font-bold text-slate-800">{patient.numProcedures} Completed</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Primary Medical Diagnosis
            </h3>
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
              <div className="font-bold text-blue-900">{patient.medicalCondition}</div>
              <div className="text-blue-800 mt-0.5 font-medium">{patient.primaryDiagnosis}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Comorbid diagnoses count: <strong>{patient.numDiagnoses}</strong> documented ICD-10 co-conditions.
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Attending: <strong>{patient.assignedDoctorName}</strong></span>
            <span>Last Evaluated: <strong>{patient.lastScreeningDate}</strong></span>
          </div>
        </div>

        {/* Right: Predictive Risk Score & Visual Gauge */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Predicted 30-Day Readmission Risk
              </span>
              <span className="text-[11px] font-mono text-slate-400">{mlEvaluation.modelVersion}</span>
            </div>

            {/* Risk Gauge Visual Indicator */}
            <div className="my-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={
                      patient.riskLevel === 'HIGH' ? '#ef4444' :
                      patient.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
                    }
                    strokeWidth="14"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * patient.riskScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-extrabold ${
                    patient.riskLevel === 'HIGH' ? 'text-red-600' :
                    patient.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {patient.riskScore}%
                  </span>
                  <span className={`text-[11px] font-bold tracking-wider uppercase mt-0.5 ${
                    patient.riskLevel === 'HIGH' ? 'text-red-700' :
                    patient.riskLevel === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {patient.riskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500 font-medium">
                Calibrated 95% Confidence Interval: [{mlEvaluation.confidenceInterval[0]}% &ndash; {mlEvaluation.confidenceInterval[1]}%]
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Interpretation:</strong> Probability score represents the likelihood of unplanned inpatient or emergency readmission within 30 days post-discharge without proactive intervention.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Decision support assistance &bull; Attending physician maintains final clinical authority
          </div>
        </div>
      </div>

      {/* "WHY THIS RISK?" - Real Dynamic Machine Learning Contributing Factors */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              WHY THIS RISK? &mdash; Explainable Model Contributions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Features weighted by predictive importance from trained gradient-boosted decision function
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Real Model Features
          </span>
        </div>

        <div className="space-y-3">
          {mlEvaluation.contributingFactors.map((factor, idx) => {
            const isNegative = factor.impactScore < 0;
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isNegative 
                    ? 'bg-emerald-50/50 border-emerald-100' 
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    isNegative ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isNegative ? '-' : '+'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{factor.factor}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white border text-slate-500">
                        {factor.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      {factor.description}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:shrink-0 self-end sm:self-auto">
                  <div className={`text-xs font-extrabold ${isNegative ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isNegative ? factor.impactScore : `+${factor.impactScore}`} pts
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isNegative ? 'Protective factor' : 'Risk driver'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Follow-up / Monitoring Suggestions */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-blue-700" />
            Recommended Decision-Support Monitoring Suggestions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mlEvaluation.followUpSuggestions.map((sugg, i) => (
              <div key={i} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </div>
                <span>{sugg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Screenings for this Patient */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Patient Screening History ({patientScreenings.length} evaluations)
        </h3>

        {patientScreenings.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No previous screenings on record for this patient.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {patientScreenings.map((scr) => (
              <div key={scr.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    scr.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                    scr.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {scr.riskScore}% {scr.riskLevel}
                  </span>
                  <span className="font-semibold text-slate-800">
                    Screening {scr.screeningId} &bull; {scr.date}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Evaluated by: {scr.doctorName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
