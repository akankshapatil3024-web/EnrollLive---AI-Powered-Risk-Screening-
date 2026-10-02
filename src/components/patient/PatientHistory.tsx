import React, { useState, useEffect } from 'react';
import { History, Calendar, HeartPulse, Activity, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ScreeningRecord } from '../../types';
import { getPatientScreeningsForUser } from '../../services/firebase';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const PatientHistory: React.FC = () => {
  const { userProfile } = useAuth();
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userProfile?.uid) return;
      try {
        const list = await getPatientScreeningsForUser(userProfile.uid, userProfile.patientId);
        setScreenings(list);
      } catch (err) {
        console.error('Error fetching patient screenings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile]);

  return (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-700" />
          My Readmission Risk Screening History
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of machine learning risk assessments conducted by your care team
        </p>

        <div className="mt-6 space-y-4">
          {screenings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">No screening assessments on record.</p>
          ) : (
            screenings.map((scr) => (
              <div key={scr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                    scr.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                    scr.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {scr.riskScore}%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Screening Assessment &bull; {scr.date}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Doctor: {scr.doctorName} &bull; Model: {scr.modelVersion}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Ref: {scr.screeningId}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    scr.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                    scr.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {scr.riskLevel} RISK
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
