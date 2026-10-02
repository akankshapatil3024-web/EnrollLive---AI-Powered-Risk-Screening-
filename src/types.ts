/**
 * EnrollLive Data Types & Interfaces
 */

export type UserRole = 'DOCTOR' | 'PATIENT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type MedicalCondition = 
  | 'Diabetes'
  | 'Hypertension'
  | 'Asthma'
  | 'Arthritis'
  | 'Cancer'
  | 'Obesity'
  | 'Heart Failure'
  | 'COPD'
  | 'Kidney Disease'
  | 'Pneumonia'
  | 'Post-Surgical'
  | 'Coronary Artery Disease';

export type AdmissionType = 'Emergency' | 'Elective' | 'Urgent' | 'Trauma';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type MedicationType = 'Aspirin' | 'Lipitor' | 'Penicillin' | 'Paracetamol' | 'Ibuprofen';

export type TestResultType = 'Normal' | 'Abnormal' | 'Inconclusive';

export type InsuranceProvider = 'Medicare' | 'Medicaid' | 'Blue Cross' | 'Aetna' | 'Cigna' | 'UnitedHealthcare';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  patientId?: string; // For patient role (e.g. 'P1024')
  specialty?: string; // For doctor role (e.g. 'Internal Medicine / Cardiology')
  department?: string; // e.g. 'Acute Inpatient Care'
  avatarUrl?: string;
  createdAt: string;
}

export interface PatientRecord {
  id: string; // Document ID
  patientId: string; // Clinical Identifier (e.g., 'P1024')
  userId?: string; // Linked patient Firebase UID (if registered)
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType?: BloodType;
  medicalCondition: MedicalCondition;
  admissionType: AdmissionType;
  lengthOfStay: number; // Days in hospital (Discharge Date - Date of Admission)
  previousVisits: number; // Emergency / inpatient visits in prior 12 months
  numMedications: number; // Active discharge medications
  numProcedures: number; // Inpatient procedures during current stay
  numDiagnoses: number; // Comorbidities count
  primaryDiagnosis: string; // e.g. 'ICD-10 E11.65 Type 2 Diabetes Mellitus'
  assignedDoctorId: string; // Doctor's UID
  assignedDoctorName: string;
  hospital?: string; // e.g. 'Mercy General Hospital'
  insuranceProvider?: InsuranceProvider;
  billingAmount?: number;
  dateOfAdmission?: string;
  dischargeDate?: string;
  medication?: MedicationType;
  testResults?: TestResultType;
  riskScore: number; // 0 to 100 percentage
  riskLevel: RiskLevel;
  lastScreeningDate: string;
  roomNumber?: string;
  status: 'Inpatient' | 'Discharged' | 'Observation';
  updatedAt: string;
}

export interface KaggleHealthcareRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  bloodType: BloodType;
  medicalCondition: MedicalCondition;
  dateOfAdmission: string;
  doctor: string;
  hospital: string;
  insuranceProvider: InsuranceProvider;
  billingAmount: number;
  roomNumber: number;
  admissionType: AdmissionType;
  dischargeDate: string;
  medication: MedicationType;
  testResults: TestResultType;
  lengthOfStay: number;
  predictedReadmissionRisk: number;
  riskLevel: RiskLevel;
}

export interface ContributingFactor {
  factor: string;
  impactScore: number; // Positive increases risk, negative decreases
  description: string;
  category: 'clinical' | 'utilization' | 'demographic' | 'medication';
}

export interface ScreeningRecord {
  id: string;
  screeningId: string;
  patientId: string;
  patientUid?: string;
  doctorId: string;
  doctorName: string;
  date: string;
  riskScore: number;
  riskLevel: RiskLevel;
  features: {
    age: number;
    medicalCondition: string;
    admissionType: string;
    lengthOfStay: number;
    previousVisits: number;
    numMedications: number;
    numProcedures: number;
  };
  factors: ContributingFactor[];
  suggestions: string[];
  modelVersion: string;
  notes?: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reportId: string;
  screeningId: string;
  patientId: string;
  patientUid?: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  date: string;
  riskScore: number;
  riskLevel: RiskLevel;
  clinicalSummary: string;
  factors: ContributingFactor[];
  monitoringPlan: string[];
  disclaimer: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
  type: 'alert' | 'info' | 'success';
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  sampleSize: number;
  testSetSize: number;
  featuresCount: number;
  algorithm: string;
  lastTrained: string;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  rocCurveData: Array<{
    fpr: number;
    tpr: number;
    threshold: number;
  }>;
  featureImportance: Array<{
    feature: string;
    importance: number;
    clinicalRationale: string;
  }>;
}
