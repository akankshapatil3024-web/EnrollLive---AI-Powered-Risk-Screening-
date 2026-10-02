import React, { useState, useEffect } from 'react';
import { User, Shield, Mail, Calendar, Phone, MapPin, Building, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord } from '../../types';
import { getPatientRecordForUser } from '../../services/firebase';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const PatientProfile: React.FC = () => {
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

  return (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-emerald-700/20 ring-4 ring-emerald-50">
            {record?.name?.charAt(0) || userProfile?.name?.charAt(0) || 'P'}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900">{record?.name || userProfile?.name}</h2>
              <span className="self-center sm:self-auto px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                Patient ID: {record?.patientId || userProfile?.patientId || 'P1024'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active Hospital Recovery Record &bull; {record?.roomNumber || 'Acute Inpatient Ward'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                Condition: <strong>{record?.medicalCondition || 'Heart Failure'}</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {userProfile?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Personal Health Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Attending Physician</span>
              <span className="font-bold text-slate-900 text-sm">{record?.assignedDoctorName || 'Dr. Sarah Jenkins, MD'}</span>
              <p className="text-slate-500 mt-0.5">Department of Acute Inpatient Care</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Hospital Stay Duration</span>
              <span className="font-bold text-blue-900 text-sm">{record?.lengthOfStay || 8} Days</span>
              <p className="text-slate-500 mt-0.5">Admission: {record?.admissionType || 'Emergency'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Documented Primary Diagnosis</span>
              <span className="font-bold text-slate-800">{record?.primaryDiagnosis || 'Heart failure, unspecified with fluid overload'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Privacy & Data Isolation</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Protected Health Record (PHR)
              </span>
              <p className="text-slate-500 mt-0.5">
                Your medical data is strictly restricted to your account and assigned care team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
