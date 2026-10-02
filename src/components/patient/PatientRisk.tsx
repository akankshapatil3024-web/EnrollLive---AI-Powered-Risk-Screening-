import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Pill, 
  PhoneCall, 
  Calendar,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord } from '../../types';
import { getPatientRecordForUser } from '../../services/firebase';
import { predictReadmissionRisk } from '../../services/mlEngine';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const PatientRisk: React.FC = () => {
  const { userProfile } = useAuth();
  const [record, setRecord] = useState<PatientRecord | null>(null);

  useEffect(() => {
    async function load() {
      if (!userProfile?.uid) return;
      const data = await getPatientRecordForUser(userProfile.uid, userProfile.patientId);
      setRecord(data);
    }
    load();
  }, [userProfile]);

  if (!record) return null;

  const evaluation = predictReadmissionRisk({
    age: record.age,
    gender: record.gender,
    medicalCondition: record.medicalCondition,
    admissionType: record.admissionType,
    lengthOfStay: record.lengthOfStay,
    previousVisits: record.previousVisits,
    numMedications: record.numMedications,
    numProcedures: record.numProcedures,
    numDiagnoses: record.numDiagnoses
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      {/* Main Score Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Personal Readmission Risk Assessment
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Understanding Your Post-Discharge Health Risk
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated on {record.lastScreeningDate} by your attending physician
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <div className={`text-4xl font-extrabold ${
              record.riskLevel === 'HIGH' ? 'text-red-600' :
              record.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {record.riskScore}%
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${
                record.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                record.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {record.riskLevel} RISK
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">30-day forecast</span>
            </div>
          </div>
        </div>

        {/* What This Risk Means (Patient Education) */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            What Influenced Your Score?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hospital readmission prediction evaluates patterns from thousands of patients with similar health conditions to identify where extra support can prevent unexpected complications.
          </p>

          <div className="space-y-3">
            {evaluation.contributingFactors.map((factor, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{factor.factor}</div>
                  <div className="text-slate-600 mt-0.5">{factor.description}</div>
                </div>
                <span className={`font-semibold shrink-0 ${factor.impactScore < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {factor.impactScore < 0 ? 'Protective factor' : 'Key factor'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Steps You Can Take */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Steps to Support Your Smooth Recovery at Home
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950">
              <span className="font-bold block mb-1">1. Keep Your 48-Hour Phone Appointment</span>
              <span>A nurse will call you to check on how you are feeling and answer questions about your recovery.</span>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950">
              <span className="font-bold block mb-1">2. Follow Your Medication Schedule</span>
              <span>Take all prescribed medicines exactly as instructed. Do not stop or skip doses without consulting your doctor.</span>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950">
              <span className="font-bold block mb-1">3. Attend Outpatient Follow-up</span>
              <span>Keep your scheduled outpatient appointment next week to review blood tests and physical recovery.</span>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950">
              <span className="font-bold block mb-1">4. Watch for Warning Signs</span>
              <span>Contact the hospital helpline immediately if you experience shortness of breath, sudden weight changes, or dizziness.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
