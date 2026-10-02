import React, { useState, useEffect } from 'react';
import { FileText, Printer, Calendar, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReportRecord } from '../../types';
import { getPatientReportsForUser } from '../../services/firebase';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const PatientReports: React.FC = () => {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userProfile?.uid) return;
      try {
        const list = await getPatientReportsForUser(userProfile.uid, userProfile.patientId);
        setReports(list);
        if (list.length > 0) setSelectedReport(list[0]);
      } catch (err) {
        console.error('Error fetching patient reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="no-print">
        <DisclaimerBanner />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs no-print">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700" />
          My Clinical Discharge & Risk Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Formal decision-support reports prepared by your hospital care team
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-200">
          No reports have been released for your account yet. Check back following your discharge review.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Report list */}
          <div className="lg:col-span-4 space-y-2 no-print">
            {reports.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`w-full text-left p-4 rounded-xl border text-xs transition ${
                  selectedReport?.id === rep.id 
                    ? 'bg-blue-50/80 border-blue-300 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{rep.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rep.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                    rep.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {rep.riskScore}% {rep.riskLevel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Physician: {rep.doctorName}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Full report view */}
          <div className="lg:col-span-8">
            {selectedReport && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 no-print">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Ref: {selectedReport.reportId}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Report</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Hospital Discharge Readmission Report</h3>
                    <p className="text-xs text-slate-500">Date: {selectedReport.date} &bull; Prepared by {selectedReport.doctorName}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Clinical Summary:</span>
                    <p className="text-slate-600 leading-relaxed">{selectedReport.clinicalSummary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Your Recommended Home Care Instructions:
                    </h4>
                    <div className="space-y-2">
                      {selectedReport.monitoringPlan.map((step, i) => (
                        <div key={i} className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Notice:</strong> {selectedReport.disclaimer}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
