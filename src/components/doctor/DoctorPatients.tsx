import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Eye, 
  Plus, 
  Users,
  ShieldCheck,
  HeartPulse,
  Database,
  Building,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, RiskLevel } from '../../types';
import { getDoctorPatients } from '../../services/firebase';
import { 
  queryKagglePatients, 
  TOTAL_KAGGLE_PATIENTS 
} from '../../services/kaggleDatasetService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface Props {
  onNavigate: (route: string, patientId?: string) => void;
}

export const DoctorPatients: React.FC<Props> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [viewScope, setViewScope] = useState<'assigned' | 'all-hospital'>('all-hospital');
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [admissionFilter, setAdmissionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'riskScore' | 'name' | 'age' | 'lengthOfStay'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination for assigned
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const itemsPerPage = 8;

  useEffect(() => {
    async function loadPatients() {
      if (!userProfile?.uid) return;
      try {
        const list = await getDoctorPatients(userProfile.uid);
        setPatients(list);
      } catch (err) {
        console.error('Error fetching authorized patients:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, [userProfile]);

  // Query 55,502 dataset when in 'all-hospital' mode
  const kaggleQueryResult = useMemo(() => {
    if (viewScope !== 'all-hospital') return null;
    return queryKagglePatients({
      searchQuery,
      condition: conditionFilter,
      admissionType: admissionFilter,
      riskLevel: riskFilter,
      page: currentPage,
      pageSize: itemsPerPage
    });
  }, [viewScope, searchQuery, conditionFilter, admissionFilter, riskFilter, currentPage]);

  // Apply filters for assigned patients mode
  const filteredAssignedPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || patient.riskLevel === riskFilter;
    const matchesCondition = conditionFilter === 'ALL' || patient.medicalCondition === conditionFilter;
    const matchesAdmission = admissionFilter === 'ALL' || patient.admissionType === admissionFilter;

    return matchesSearch && matchesRisk && matchesCondition && matchesAdmission;
  });

  const sortedAssignedPatients = [...filteredAssignedPatients].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'riskScore') comparison = a.riskScore - b.riskScore;
    else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'age') comparison = a.age - b.age;
    else if (sortBy === 'lengthOfStay') comparison = a.lengthOfStay - b.lengthOfStay;
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalAssignedPages = Math.ceil(sortedAssignedPatients.length / itemsPerPage) || 1;
  const paginatedAssignedPatients = sortedAssignedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'riskScore' | 'name' | 'age' | 'lengthOfStay') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleJumpPage = (e: React.FormEvent, maxPages: number) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= maxPages) {
      setCurrentPage(p);
      setJumpPageInput('');
    }
  };

  const conditions = ['Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Cancer', 'Obesity', 'Heart Failure', 'COPD', 'Kidney Disease'];

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <DisclaimerBanner />

      {/* Scope Selector Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                Inpatient Patient Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {viewScope === 'all-hospital' ? `${TOTAL_KAGGLE_PATIENTS.toLocaleString()} Patients` : `${patients.length} Inpatients`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {viewScope === 'all-hospital'
                ? `Browsing full Kaggle Healthcare Dataset (${TOTAL_KAGGLE_PATIENTS.toLocaleString()} patients) & ML readmission predictions`
                : `Active acute inpatient ward assigned to Dr. ${userProfile?.name?.replace(/^Dr\.\s*/, '') || 'Physician'}`
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Scope Toggle */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => { setViewScope('all-hospital'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewScope === 'all-hospital'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>55,502 Dataset Patients</span>
              </button>
              <button
                type="button"
                onClick={() => { setViewScope('assigned'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewScope === 'assigned'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>My Assigned Ward ({patients.length})</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate('risk-screening')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Launch Screening</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={viewScope === 'all-hospital' ? "Search 55,502 patients (e.g. KAG-00042, name, hospital)..." : "Search assigned inpatients..."}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-white"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk (≥65%)</option>
              <option value="MEDIUM">Medium Risk (30-64%)</option>
              <option value="LOW">Low Risk (&lt;30%)</option>
            </select>
          </div>

          {/* Medical Condition Filter */}
          <div>
            <select
              value={conditionFilter}
              onChange={(e) => { setConditionFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-white"
            >
              <option value="ALL">All Conditions</option>
              {conditions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Admission Type Filter */}
          <div>
            <select
              value={admissionFilter}
              onChange={(e) => { setAdmissionFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-white"
            >
              <option value="ALL">All Admission Types</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Elective">Elective</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Jump Page */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div>
            {viewScope === 'all-hospital' ? (
              <span>
                Indexing <strong>{TOTAL_KAGGLE_PATIENTS.toLocaleString()}</strong> admissions &bull; Showing Page <strong>{currentPage}</strong> of <strong>{kaggleQueryResult?.totalPages.toLocaleString()}</strong> (~{kaggleQueryResult?.totalRecords.toLocaleString()} matching)
              </span>
            ) : (
              <span>
                Showing <strong>{sortedAssignedPatients.length}</strong> matching assigned patients (Page <strong>{currentPage}</strong> of <strong>{totalAssignedPages}</strong>)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(searchQuery || riskFilter !== 'ALL' || conditionFilter !== 'ALL' || admissionFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRiskFilter('ALL');
                  setConditionFilter('ALL');
                  setAdmissionFilter('ALL');
                  setCurrentPage(1);
                }}
                className="text-blue-700 hover:text-blue-900 font-semibold underline mr-2"
              >
                Reset Filters
              </button>
            )}

            {/* Jump to Page input for 55,502 mode */}
            {viewScope === 'all-hospital' && kaggleQueryResult && (
              <form onSubmit={(e) => handleJumpPage(e, kaggleQueryResult.totalPages)} className="flex items-center gap-1.5">
                <span className="text-slate-400">Page:</span>
                <input
                  type="number"
                  min={1}
                  max={kaggleQueryResult.totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder={`1-${kaggleQueryResult.totalPages}`}
                  className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs text-center"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Patient Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Patient Details</th>
                <th className="py-3.5 px-3">Age / Sex</th>
                <th className="py-3.5 px-3">Blood</th>
                <th className="py-3.5 px-4">Medical Condition</th>
                <th className="py-3.5 px-3">Admission</th>
                <th className="py-3.5 px-3">Stay (Days)</th>
                <th className="py-3.5 px-3">Medication</th>
                <th className="py-3.5 px-3">Test Results</th>
                <th className="py-3.5 px-4">Readmission Risk</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* ALL-HOSPITAL 55,502 DATASET MODE */}
              {viewScope === 'all-hospital' && kaggleQueryResult && (
                kaggleQueryResult.records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      No records match the active search criteria in the {TOTAL_KAGGLE_PATIENTS.toLocaleString()} patient dataset.
                    </td>
                  </tr>
                ) : (
                  kaggleQueryResult.records.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/20 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-blue-700 font-mono font-bold">
                          {p.id} &bull; Rm {p.roomNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {p.age}y &bull; {p.gender}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                        {p.bloodType}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{p.medicalCondition}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.admissionType === 'Emergency' ? 'bg-red-50 text-red-700 border border-red-200' :
                          p.admissionType === 'Urgent' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {p.admissionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        {p.lengthOfStay} Days
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {p.medication}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.testResults === 'Abnormal' ? 'bg-red-100 text-red-700' :
                          p.testResults === 'Inconclusive' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.testResults}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                          p.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span>{p.predictedReadmissionRisk}%</span>
                          <span>{p.riskLevel}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate('risk-screening', p.id)}
                            className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1 shadow-2xs"
                            title="Screen patient in predictive ML engine"
                          >
                            <Activity className="w-3 h-3" />
                            <span>Screen</span>
                          </button>
                          <button
                            onClick={() => onNavigate('patient-detail', p.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition flex items-center gap-1"
                            title="View patient clinical file"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Chart</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}

              {/* ASSIGNED WARD MODE */}
              {viewScope === 'assigned' && (
                paginatedAssignedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      No assigned patients found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedAssignedPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-blue-50/20 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{patient.name}</div>
                        <div className="text-[11px] text-blue-700 font-mono font-bold">
                          {patient.patientId} &bull; {patient.roomNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {patient.age}y &bull; {patient.gender}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                        {patient.bloodType || 'O+'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{patient.medicalCondition}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          patient.admissionType === 'Emergency' ? 'bg-red-50 text-red-700 border border-red-200' :
                          patient.admissionType === 'Urgent' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {patient.admissionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        {patient.lengthOfStay} Days
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {patient.medication || 'Lipitor'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          patient.testResults === 'Abnormal' ? 'bg-red-100 text-red-700' :
                          patient.testResults === 'Inconclusive' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {patient.testResults || 'Normal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          patient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                          patient.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span>{patient.riskScore}%</span>
                          <span>{patient.riskLevel}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate('risk-screening', patient.patientId)}
                            className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1 shadow-2xs"
                          >
                            <Activity className="w-3 h-3" />
                            <span>Screen</span>
                          </button>
                          <button
                            onClick={() => onNavigate('patient-detail', patient.patientId)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Chart</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            {viewScope === 'all-hospital' && kaggleQueryResult ? (
              <span>
                Page <strong>{currentPage}</strong> of <strong>{kaggleQueryResult.totalPages.toLocaleString()}</strong> ({itemsPerPage} per page)
              </span>
            ) : (
              <span>
                Page <strong>{currentPage}</strong> of <strong>{totalAssignedPages}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed font-medium text-[11px]"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 font-mono font-bold bg-white border border-slate-200 rounded-lg">
              {currentPage}
            </span>
            <button
              disabled={viewScope === 'all-hospital' && kaggleQueryResult ? currentPage >= kaggleQueryResult.totalPages : currentPage >= totalAssignedPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={viewScope === 'all-hospital' && kaggleQueryResult ? currentPage >= kaggleQueryResult.totalPages : currentPage >= totalAssignedPages}
              onClick={() => setCurrentPage(viewScope === 'all-hospital' && kaggleQueryResult ? kaggleQueryResult.totalPages : totalAssignedPages)}
              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed font-medium text-[11px]"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
