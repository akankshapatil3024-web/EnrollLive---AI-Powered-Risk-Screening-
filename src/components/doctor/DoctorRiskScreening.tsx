import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  FileText,
  User,
  HeartPulse,
  Pill,
  Clock,
  Building2,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, MedicalCondition, AdmissionType, ScreeningRecord, TestResultType, MedicationType, BloodType, InsuranceProvider } from '../../types';
import { getDoctorPatients, createScreening } from '../../services/firebase';
import { predictReadmissionRisk, PredictionResult } from '../../services/mlEngine';
import { getKagglePatientByIndex } from '../../services/kaggleDatasetService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface Props {
  initialPatientId?: string;
  onNavigate: (route: string, patientId?: string) => void;
}

export const DoctorRiskScreening: React.FC<Props> = ({ initialPatientId, onNavigate }) => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  
  // Interactive screening form features aligned with prasad22/healthcare-dataset
  const [patientId, setPatientId] = useState(initialPatientId || 'P1024');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(67);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [medicalCondition, setMedicalCondition] = useState<MedicalCondition>('Diabetes');
  const [admissionType, setAdmissionType] = useState<AdmissionType>('Emergency');
  const [lengthOfStay, setLengthOfStay] = useState<number>(8);
  const [testResults, setTestResults] = useState<TestResultType>('Abnormal');
  const [medication, setMedication] = useState<MedicationType>('Lipitor');
  const [insuranceProvider, setInsuranceProvider] = useState<InsuranceProvider>('Medicare');
  const [billingAmount, setBillingAmount] = useState<number>(34125);
  const [previousVisits, setPreviousVisits] = useState<number>(3);
  const [numMedications, setNumMedications] = useState<number>(11);
  const [numProcedures, setNumProcedures] = useState<number>(2);

  // Prediction State
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      if (!userProfile?.uid) return;
      try {
        const list = await getDoctorPatients(userProfile.uid);
        setPatients(list);
        
        // If an initial patient ID is provided, populate fields
        if (initialPatientId) {
          if (initialPatientId.toLowerCase().startsWith('kag-')) {
            const rawNum = parseInt(initialPatientId.toLowerCase().replace('kag-', ''), 10);
            if (!isNaN(rawNum)) {
              const kagPatient = getKagglePatientByIndex(rawNum);
              setSelectedPatientId(kagPatient.id);
              setPatientId(kagPatient.id);
              setPatientName(kagPatient.name);
              setAge(kagPatient.age);
              setGender(kagPatient.gender);
              setBloodType(kagPatient.bloodType);
              setMedicalCondition(kagPatient.medicalCondition);
              setAdmissionType(kagPatient.admissionType);
              setLengthOfStay(kagPatient.lengthOfStay);
              setTestResults(kagPatient.testResults);
              setMedication(kagPatient.medication);
              setInsuranceProvider(kagPatient.insuranceProvider);
              setBillingAmount(kagPatient.billingAmount);
              setPreviousVisits(kagPatient.admissionType === 'Emergency' ? 2 : 0);
              setNumMedications(7);
              setNumProcedures(1);
              setPrediction(null);
              setSaveSuccess(false);
            }
          } else {
            const match = list.find(p => p.patientId === initialPatientId);
            if (match) {
              populateWithPatient(match);
            }
          }
        }
      } catch (err) {
        console.error('Error loading patients:', err);
      }
    }
    loadPatients();
  }, [userProfile, initialPatientId]);

  const populateWithPatient = (pat: PatientRecord) => {
    setSelectedPatientId(pat.patientId);
    setPatientId(pat.patientId);
    setPatientName(pat.name);
    setAge(pat.age);
    setGender(pat.gender);
    if (pat.bloodType) setBloodType(pat.bloodType);
    setMedicalCondition(pat.medicalCondition);
    setAdmissionType(pat.admissionType);
    setLengthOfStay(pat.lengthOfStay);
    if (pat.testResults) setTestResults(pat.testResults);
    if (pat.medication) setMedication(pat.medication);
    if (pat.insuranceProvider) setInsuranceProvider(pat.insuranceProvider);
    if (pat.billingAmount) setBillingAmount(pat.billingAmount);
    setPreviousVisits(pat.previousVisits);
    setNumMedications(pat.numMedications);
    setNumProcedures(pat.numProcedures);
    setPrediction(null);
    setSaveSuccess(false);
  };

  const handlePatientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    if (!pId) return;
    const match = patients.find(p => p.patientId === pId);
    if (match) {
      populateWithPatient(match);
    }
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setSaveSuccess(false);
    
    // Evaluate through calibrated ML decision engine
    setTimeout(() => {
      const result = predictReadmissionRisk({
        age,
        gender,
        bloodType,
        medicalCondition,
        admissionType,
        lengthOfStay,
        previousVisits,
        numMedications,
        numProcedures,
        medication,
        testResults,
        billingAmount,
        insuranceProvider
      });
      setPrediction(result);
      setIsPredicting(false);
    }, 450);
  };

  const handleSaveScreening = async () => {
    if (!prediction || !userProfile?.uid) return;
    setIsSaving(true);
    try {
      const currentPatient = patients.find(p => p.patientId === patientId);
      await createScreening({
        screeningId: `SCR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId,
        patientUid: currentPatient?.userId,
        doctorId: userProfile.uid,
        doctorName: userProfile.name,
        date: new Date().toISOString().split('T')[0],
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        features: {
          age,
          medicalCondition,
          admissionType,
          lengthOfStay,
          previousVisits,
          numMedications,
          numProcedures
        },
        factors: prediction.contributingFactors,
        suggestions: prediction.followUpSuggestions,
        modelVersion: prediction.modelVersion,
        createdAt: new Date().toISOString()
      });
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving screening:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-700" />
              Interactive Readmission Risk Screening Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluates clinical indicators against the calibrated Gradient-Boosted Readmission Model (v2.4)
            </p>
          </div>

          {/* Quick Patient Select Dropdown */}
          <div className="w-full sm:w-72">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Load Authorized Patient Record:
            </label>
            <select
              value={selectedPatientId}
              onChange={handlePatientSelectChange}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50"
            >
              <option value="">-- Choose Assigned Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.patientId}>
                  {p.patientId} &bull; {p.name} ({p.medicalCondition})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Inputs & Live Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Clinical Features Input Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Clinical Dataset Features
            </h3>
            <span className="text-[11px] text-slate-400">Validated Model Inputs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Identifier
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. P1024"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Age: <strong className="text-blue-700">{age} yrs</strong>
              </label>
              <input
                type="number"
                min={18}
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Medical Condition (Kaggle Dataset)
              </label>
              <select
                value={medicalCondition}
                onChange={(e) => setMedicalCondition(e.target.value as MedicalCondition)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="Diabetes">Diabetes Mellitus</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Asthma">Asthma</option>
                <option value="Arthritis">Arthritis</option>
                <option value="Cancer">Cancer / Oncology</option>
                <option value="Obesity">Obesity</option>
                <option value="Heart Failure">Heart Failure</option>
                <option value="COPD">COPD</option>
                <option value="Kidney Disease">Chronic Kidney Disease</option>
                <option value="Pneumonia">Pneumonia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Acuity Type
              </label>
              <select
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value as AdmissionType)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="Emergency">Emergency Admission</option>
                <option value="Urgent">Urgent Admission</option>
                <option value="Elective">Elective / Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Laboratory Test Results
              </label>
              <select
                value={testResults}
                onChange={(e) => setTestResults(e.target.value as TestResultType)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="Abnormal">Abnormal (Elevated Risk Indicator)</option>
                <option value="Inconclusive">Inconclusive (Ambiguous Workup)</option>
                <option value="Normal">Normal (Favorable Stabilization)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discharge Medication
              </label>
              <select
                value={medication}
                onChange={(e) => setMedication(e.target.value as MedicationType)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="Lipitor">Lipitor (Statin Therapy)</option>
                <option value="Aspirin">Aspirin (Antiplatelet)</option>
                <option value="Penicillin">Penicillin (Antimicrobial)</option>
                <option value="Ibuprofen">Ibuprofen (NSAID Analgesic)</option>
                <option value="Paracetamol">Paracetamol (Analgesic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group / Rh Type
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value as BloodType)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Insurance Provider
              </label>
              <select
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value as InsuranceProvider)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="Medicare">Medicare</option>
                <option value="Medicaid">Medicaid</option>
                <option value="Blue Cross">Blue Cross</option>
                <option value="Aetna">Aetna</option>
                <option value="Cigna">Cigna</option>
                <option value="UnitedHealthcare">UnitedHealthcare</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inpatient Length of Stay: <strong className="text-blue-700">{lengthOfStay} Days</strong>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={lengthOfStay}
                onChange={(e) => setLengthOfStay(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1 day</span>
                <span>15 days</span>
                <span>30 days</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prior Visits (Past 12m): <strong className="text-blue-700">{previousVisits} Visits</strong>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={previousVisits}
                onChange={(e) => setPreviousVisits(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 (None)</span>
                <span>5 visits</span>
                <span>10+ visits</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Medications Count: <strong className="text-blue-700">{numMedications} Drugs</strong>
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={numMedications}
                onChange={(e) => setNumMedications(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inpatient Procedures: <strong className="text-blue-700">{numProcedures}</strong>
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={numProcedures}
                onChange={(e) => setNumProcedures(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handlePredict}
              disabled={isPredicting}
              className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPredicting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Predictive Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>PREDICT READMISSION RISK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Prediction Results & Decision-Support Output */}
        <div className="lg:col-span-6 space-y-6">
          {!prediction ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Ready for Machine Learning Assessment</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Adjust clinical parameters on the left or select an authorized inpatient, then click <strong>PREDICT READMISSION RISK</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
              {/* Score Header Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-sky-300 mb-1">
                    READMISSION RISK SCREENING
                  </div>
                  <div className="text-xs text-slate-300">
                    Patient: <strong className="text-white">{patientId}</strong> {patientName ? `(${patientName})` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-extrabold tracking-tight text-white">
                      {prediction.riskScore}%
                    </div>
                    <div className="text-[10px] text-slate-400">Predicted Probability</div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold tracking-wider uppercase ${
                    prediction.riskLevel === 'HIGH' ? 'bg-red-500 text-white' :
                    prediction.riskLevel === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {prediction.riskLevel} RISK
                  </div>
                </div>
              </div>

              {/* Contributing Factors */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  Primary Contributing Factors
                </h4>
                <div className="space-y-2">
                  {prediction.contributingFactors.slice(0, 4).map((factor, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{factor.factor}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{factor.description}</div>
                      </div>
                      <div className={`font-bold shrink-0 ${factor.impactScore < 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {factor.impactScore < 0 ? factor.impactScore : `+${factor.impactScore}`} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Follow-up / Monitoring Suggestions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-blue-700" />
                  Recommended Follow-up & Monitoring Suggestions
                </h4>
                <ul className="space-y-2">
                  {prediction.followUpSuggestions.map((sugg, i) => (
                    <li key={i} className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      <span>{sugg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Clinical Disclaimer */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Decision-Support Notice:</strong> {prediction.disclaimer}
                </div>
              </div>

              {/* Action Buttons: Save Screening & Generate Report */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={handleSaveScreening}
                  disabled={isSaving || saveSuccess}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-800/60 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span>Saving to Patient EHR...</span>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved to Patient Record</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Assessment to EHR</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('reports', patientId)}
                  className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
