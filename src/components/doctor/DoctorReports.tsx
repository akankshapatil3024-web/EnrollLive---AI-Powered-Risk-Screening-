import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Stethoscope, 
  ChevronRight,
  Search,
  Building,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReportRecord, PatientRecord } from '../../types';
import { getDoctorReports, getDoctorPatients, createReport } from '../../services/firebase';
import { predictReadmissionRisk } from '../../services/mlEngine';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface Props {
  initialPatientId?: string;
  onNavigate: (route: string, patientId?: string) => void;
}

export const DoctorReports: React.FC<Props> = ({ initialPatientId, onNavigate }) => {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // New Report Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState(initialPatientId || '');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function loadReports() {
      if (!userProfile?.uid) return;
      try {
        const [repList, patList] = await Promise.all([
          getDoctorReports(userProfile.uid),
          getDoctorPatients(userProfile.uid)
        ]);
        setReports(repList);
        setPatients(patList);

        if (initialPatientId) {
          const match = repList.find(r => r.patientId === initialPatientId);
          if (match) setSelectedReport(match);
          else if (repList.length > 0) setSelectedReport(repList[0]);
        } else if (repList.length > 0) {
          setSelectedReport(repList[0]);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [userProfile, initialPatientId]);

  const handleGenerateReport = async () => {
    if (!targetPatientId || !userProfile?.uid) return;
    setGenerating(true);

    const pat = patients.find(p => p.patientId === targetPatientId);
    if (!pat) {
      alert('Selected patient not found.');
      setGenerating(false);
      return;
    }

    // Run ML prediction to obtain fresh factors & recommendations
    const pred = predictReadmissionRisk({
      age: pat.age,
      gender: pat.gender,
      medicalCondition: pat.medicalCondition,
      admissionType: pat.admissionType,
      lengthOfStay: pat.lengthOfStay,
      previousVisits: pat.previousVisits,
      numMedications: pat.numMedications,
      numProcedures: pat.numProcedures,
      numDiagnoses: pat.numDiagnoses
    });

    const newReportData: Omit<ReportRecord, 'id'> = {
      reportId: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      screeningId: `SCR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: pat.patientId,
      patientUid: pat.userId,
      patientName: pat.name,
      doctorId: userProfile.uid,
      doctorName: userProfile.name,
      doctorSpecialty: userProfile.specialty || 'Internal Medicine / Acute Care',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      riskScore: pred.riskScore,
      riskLevel: pred.riskLevel,
      clinicalSummary: `Inpatient readmission risk evaluation for ${pat.name} (${pat.patientId}, age ${pat.age}) admitted with ${pat.medicalCondition}. Model score indicates a ${pred.riskScore}% (${pred.riskLevel} RISK) 30-day readmission probability. Major drivers include prior utilization (${pat.previousVisits} visits) and length of stay (${pat.lengthOfStay} days). Multidisciplinary discharge follow-up protocol initiated.`,
      factors: pred.contributingFactors,
      monitoringPlan: pred.followUpSuggestions,
      disclaimer: 'Decision-support output — not a medical diagnosis. EnrollLive predictive scoring does not replace professional medical judgment.',
      createdAt: new Date().toISOString()
    };

    try {
      const created = await createReport(newReportData);
      setReports([created, ...reports]);
      setSelectedReport(created);
      setShowGenerateModal(false);
    } catch (err) {
      console.error('Failed to save report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <div className="no-print">
        <DisclaimerBanner />
      </div>

      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              Clinical Readmission Risk Reports
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official discharge decision-support documentation for authorized inpatients
            </p>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Report Workspace: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Report Select List (Hidden during print) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 no-print h-fit">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            Available Reports ({reports.length})
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">No reports generated yet.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition ${
                      isSelected 
                        ? 'bg-blue-50/80 border-blue-300 shadow-xs' 
                        : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rep.patientName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                        rep.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {rep.riskScore}% {rep.riskLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                      ID: {rep.patientId} &bull; {rep.reportId}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{rep.date}</span>
                      <span className="text-slate-500 font-medium">View &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Formal Printable Clinical Report */}
        <div className="lg:col-span-8">
          {!selectedReport ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500 text-xs">
              Select a report from the left list to view or print.
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0">
              {/* Report Action Bar (hidden in print) */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 no-print">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    DocRef: {selectedReport.reportId}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-500">{selectedReport.date}</span>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Clinical Report</span>
                </button>
              </div>

              {/* Printable Document Content */}
              <div className="mt-6 space-y-6">
                {/* Official Hospital Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                  <div>
                    <div className="text-xl font-extrabold tracking-wider text-slate-900">
                      ENROLLLIVE CLINICAL PROTOCOL
                    </div>
                    <div className="text-xs text-slate-500">
                      Hospital Readmission Risk Stratification & Discharge Guidance
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-800">Department of Acute Care</div>
                    <div className="text-slate-500">Date: {selectedReport.date}</div>
                  </div>
                </div>

                {/* Patient & Physician Header Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Information</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedReport.patientName}</div>
                    <div className="text-slate-600 font-mono">Patient ID: {selectedReport.patientId}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Physician</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedReport.doctorName}</div>
                    <div className="text-slate-600">{selectedReport.doctorSpecialty}</div>
                  </div>
                </div>

                {/* Assessment Summary Box */}
                <div className="p-5 rounded-2xl bg-blue-950 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-sky-300 font-bold block mb-1">
                      Readmission Risk Score
                    </span>
                    <div className="text-xs text-slate-300 max-w-sm">
                      Estimated probability of 30-day unplanned post-discharge acute care utilization.
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-extrabold tracking-tight text-white block">
                      {selectedReport.riskScore}%
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase mt-1 ${
                      selectedReport.riskLevel === 'HIGH' ? 'bg-red-500 text-white' :
                      selectedReport.riskLevel === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                    }`}>
                      {selectedReport.riskLevel} RISK
                    </span>
                  </div>
                </div>

                {/* Clinical Summary */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    Clinical Decision-Support Narrative
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {selectedReport.clinicalSummary}
                  </p>
                </div>

                {/* Key Contributing Model Features */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    Key Contributing Risk Factors (Explainable Features)
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.factors.map((f, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900">{f.factor}</span>
                          <p className="text-[11px] text-slate-500">{f.description}</p>
                        </div>
                        <span className={`font-mono font-bold shrink-0 ${f.impactScore < 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {f.impactScore < 0 ? f.impactScore : `+${f.impactScore}`} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Follow-up / Monitoring Plan */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    Discharge Monitoring & Transitional Care Protocol
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.monitoringPlan.map((step, idx) => (
                      <div key={idx} className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Medical Disclaimer */}
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  <strong>Mandatory Clinical Notice:</strong> {selectedReport.disclaimer}
                </div>

                {/* Signature Line */}
                <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <div>Physician Signature: _______________________________</div>
                    <div className="text-[10px] mt-1">{selectedReport.doctorName}</div>
                  </div>
                  <div className="text-right text-[10px]">
                    Generated by EnrollLive Clinical AI &bull; Version 2.4-GBM
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generate Patient Risk Report</h3>
            <p className="text-xs text-slate-500">
              Select an authorized patient to evaluate and generate a discharge decision-support document.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Authorized Inpatient:
              </label>
              <select
                value={targetPatientId}
                onChange={(e) => setTargetPatientId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.patientId}>
                    {p.patientId} &bull; {p.name} ({p.medicalCondition}, {p.riskScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={generating || !targetPatientId}
                className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl transition"
              >
                {generating ? 'Compiling Report...' : 'Compile & Save Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
