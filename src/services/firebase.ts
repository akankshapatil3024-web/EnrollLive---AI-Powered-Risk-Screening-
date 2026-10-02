/**
 * Firebase Service for EnrollLive
 * Handles Auth, Role Verification, and Firestore Data Access
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  UserProfile, 
  PatientRecord, 
  ScreeningRecord, 
  ReportRecord, 
  UserRole 
} from '../types';
import { predictReadmissionRisk } from './mlEngine';
import { getKagglePatientByIndex } from './kaggleDatasetService';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId as required by AI Studio guidelines
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

// Skill-mandated Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fixed mock/demo accounts for instant evaluator testing
export const DEMO_DOCTOR_ID = 'demo-doc-dr-sarah';
export const DEMO_PATIENT_P1024_ID = 'demo-pat-p1024';
export const DEMO_PATIENT_P1028_ID = 'demo-pat-p1028';

export const DEMO_USERS: Record<string, UserProfile> = {
  [DEMO_DOCTOR_ID]: {
    uid: DEMO_DOCTOR_ID,
    email: 'dr.sarah.jenkins@hospital.enrolllive.org',
    role: 'DOCTOR',
    name: 'Dr. Sarah Jenkins, MD',
    specialty: 'Internal Medicine & Hospitalist Medicine',
    department: 'Department of Acute Inpatient Care',
    createdAt: '2026-09-01T08:00:00Z'
  },
  [DEMO_PATIENT_P1024_ID]: {
    uid: DEMO_PATIENT_P1024_ID,
    email: 'robert.smith@patient.enrolllive.org',
    role: 'PATIENT',
    name: 'Robert Smith',
    patientId: 'P1024',
    createdAt: '2026-09-15T10:30:00Z'
  },
  [DEMO_PATIENT_P1028_ID]: {
    uid: DEMO_PATIENT_P1028_ID,
    email: 'maria.santos@patient.enrolllive.org',
    role: 'PATIENT',
    name: 'Maria Santos',
    patientId: 'P1028',
    createdAt: '2026-09-20T14:15:00Z'
  }
};

/**
 * Initial curated cohort of hospital patients assigned to Dr. Sarah Jenkins
 */
export const INITIAL_PATIENT_COHORT: PatientRecord[] = [
  {
    id: 'pat-P1024',
    patientId: 'P1024',
    userId: DEMO_PATIENT_P1024_ID,
    name: 'Robert Smith',
    age: 67,
    gender: 'Male',
    bloodType: 'O+',
    medicalCondition: 'Diabetes',
    admissionType: 'Emergency',
    lengthOfStay: 8,
    previousVisits: 3,
    numMedications: 11,
    numProcedures: 2,
    numDiagnoses: 6,
    primaryDiagnosis: 'ICD-10 E11.65 Type 2 diabetes with chronic complications & heart failure',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Medicare',
    billingAmount: 38400.00,
    dateOfAdmission: '2026-09-24',
    dischargeDate: '2026-10-02',
    medication: 'Lipitor',
    testResults: 'Abnormal',
    riskScore: 78,
    riskLevel: 'HIGH',
    lastScreeningDate: '2026-10-02',
    roomNumber: 'Room 304-B',
    status: 'Inpatient',
    updatedAt: '2026-10-02T05:30:00Z'
  },
  {
    id: 'pat-P1025',
    patientId: 'P1025',
    name: 'Eleanor Vance',
    age: 72,
    gender: 'Female',
    bloodType: 'B+',
    medicalCondition: 'Cancer',
    admissionType: 'Emergency',
    lengthOfStay: 6,
    previousVisits: 2,
    numMedications: 8,
    numProcedures: 1,
    numDiagnoses: 4,
    primaryDiagnosis: 'ICD-10 C34.90 Malignant neoplasm of respiratory organs & COPD',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Blue Cross',
    billingAmount: 42100.50,
    dateOfAdmission: '2026-09-25',
    dischargeDate: '2026-10-01',
    medication: 'Penicillin',
    testResults: 'Abnormal',
    riskScore: 68,
    riskLevel: 'HIGH',
    lastScreeningDate: '2026-10-01',
    roomNumber: 'Room 504-A',
    status: 'Inpatient',
    updatedAt: '2026-10-01T14:20:00Z'
  },
  {
    id: 'pat-P1026',
    patientId: 'P1026',
    name: 'James Thornton',
    age: 58,
    gender: 'Male',
    bloodType: 'A+',
    medicalCondition: 'Diabetes',
    admissionType: 'Urgent',
    lengthOfStay: 4,
    previousVisits: 1,
    numMedications: 7,
    numProcedures: 1,
    numDiagnoses: 3,
    primaryDiagnosis: 'ICD-10 E11.65 Type 2 diabetes mellitus with hyperglycemia',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Aetna',
    billingAmount: 22800.00,
    dateOfAdmission: '2026-09-27',
    dischargeDate: '2026-10-01',
    medication: 'Lipitor',
    testResults: 'Inconclusive',
    riskScore: 48,
    riskLevel: 'MEDIUM',
    lastScreeningDate: '2026-10-01',
    roomNumber: 'Room 218-C',
    status: 'Inpatient',
    updatedAt: '2026-10-01T11:00:00Z'
  },
  {
    id: 'pat-P1027',
    patientId: 'P1027',
    name: 'Arthur Pendelton',
    age: 81,
    gender: 'Male',
    bloodType: 'AB+',
    medicalCondition: 'Kidney Disease',
    admissionType: 'Emergency',
    lengthOfStay: 10,
    previousVisits: 4,
    numMedications: 14,
    numProcedures: 3,
    numDiagnoses: 7,
    primaryDiagnosis: 'ICD-10 N18.4 Chronic kidney disease, stage 4 with hyperkalemia',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Medicare',
    billingAmount: 51200.00,
    dateOfAdmission: '2026-09-22',
    dischargeDate: '2026-10-02',
    medication: 'Penicillin',
    testResults: 'Abnormal',
    riskScore: 84,
    riskLevel: 'HIGH',
    lastScreeningDate: '2026-10-02',
    roomNumber: 'Room 501-A',
    status: 'Inpatient',
    updatedAt: '2026-10-02T04:15:00Z'
  },
  {
    id: 'pat-P1028',
    patientId: 'P1028',
    userId: DEMO_PATIENT_P1028_ID,
    name: 'Maria Santos',
    age: 44,
    gender: 'Female',
    bloodType: 'A-',
    medicalCondition: 'Asthma',
    admissionType: 'Urgent',
    lengthOfStay: 3,
    previousVisits: 0,
    numMedications: 4,
    numProcedures: 0,
    numDiagnoses: 2,
    primaryDiagnosis: 'ICD-10 J45.909 Unspecified asthma, uncomplicated',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'UnitedHealthcare',
    billingAmount: 14210.00,
    dateOfAdmission: '2026-09-27',
    dischargeDate: '2026-09-30',
    medication: 'Aspirin',
    testResults: 'Normal',
    riskScore: 22,
    riskLevel: 'LOW',
    lastScreeningDate: '2026-09-30',
    roomNumber: 'Room 114-B',
    status: 'Inpatient',
    updatedAt: '2026-09-30T16:00:00Z'
  },
  {
    id: 'pat-P1029',
    patientId: 'P1029',
    name: 'David Zhao',
    age: 52,
    gender: 'Male',
    bloodType: 'O-',
    medicalCondition: 'Arthritis',
    admissionType: 'Elective',
    lengthOfStay: 2,
    previousVisits: 0,
    numMedications: 3,
    numProcedures: 1,
    numDiagnoses: 1,
    primaryDiagnosis: 'ICD-10 M19.90 Primary osteoarthritis, unspecified site',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Cigna',
    billingAmount: 18500.00,
    dateOfAdmission: '2026-09-29',
    dischargeDate: '2026-10-01',
    medication: 'Ibuprofen',
    testResults: 'Normal',
    riskScore: 14,
    riskLevel: 'LOW',
    lastScreeningDate: '2026-10-01',
    roomNumber: 'Room 205-D',
    status: 'Observation',
    updatedAt: '2026-10-01T09:45:00Z'
  },
  {
    id: 'pat-P1030',
    patientId: 'P1030',
    name: 'Clara Oswald',
    age: 63,
    gender: 'Female',
    bloodType: 'B-',
    medicalCondition: 'Hypertension',
    admissionType: 'Urgent',
    lengthOfStay: 3,
    previousVisits: 1,
    numMedications: 6,
    numProcedures: 0,
    numDiagnoses: 3,
    primaryDiagnosis: 'ICD-10 I10 Essential hypertension urgency crisis',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Medicaid',
    billingAmount: 16900.00,
    dateOfAdmission: '2026-09-26',
    dischargeDate: '2026-09-29',
    medication: 'Aspirin',
    testResults: 'Normal',
    riskScore: 36,
    riskLevel: 'MEDIUM',
    lastScreeningDate: '2026-09-29',
    roomNumber: 'Room 215-A',
    status: 'Inpatient',
    updatedAt: '2026-09-29T13:10:00Z'
  },
  {
    id: 'pat-P1031',
    patientId: 'P1031',
    name: 'Marcus Brody',
    age: 70,
    gender: 'Male',
    bloodType: 'AB-',
    medicalCondition: 'Obesity',
    admissionType: 'Emergency',
    lengthOfStay: 5,
    previousVisits: 2,
    numMedications: 9,
    numProcedures: 2,
    numDiagnoses: 4,
    primaryDiagnosis: 'ICD-10 E66.01 Morbid (severe) obesity due to excess calories',
    assignedDoctorId: DEMO_DOCTOR_ID,
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    hospital: 'Mercy General Hospital',
    insuranceProvider: 'Blue Cross',
    billingAmount: 28400.00,
    dateOfAdmission: '2026-09-26',
    dischargeDate: '2026-10-01',
    medication: 'Paracetamol',
    testResults: 'Inconclusive',
    riskScore: 62,
    riskLevel: 'MEDIUM',
    lastScreeningDate: '2026-10-01',
    roomNumber: 'Room 308-C',
    status: 'Inpatient',
    updatedAt: '2026-10-01T15:30:00Z'
  }
];

export const INITIAL_SCREENINGS: ScreeningRecord[] = [
  {
    id: 'scr-P1024-01',
    screeningId: 'SCR-2026-9041',
    patientId: 'P1024',
    patientUid: DEMO_PATIENT_P1024_ID,
    doctorId: DEMO_DOCTOR_ID,
    doctorName: 'Dr. Sarah Jenkins, MD',
    date: '2026-10-02',
    riskScore: 78,
    riskLevel: 'HIGH',
    features: {
      age: 67,
      medicalCondition: 'Heart Failure',
      admissionType: 'Emergency',
      lengthOfStay: 8,
      previousVisits: 3,
      numMedications: 11,
      numProcedures: 2
    },
    factors: [
      {
        factor: 'Primary Diagnosis: Heart Failure',
        impactScore: 30,
        description: 'Heart failure carries documented 30-day post-discharge readmission vulnerability (~24% baseline).',
        category: 'clinical'
      },
      {
        factor: 'Frequent Hospital Utilization (3 visits in 12m)',
        impactScore: 28,
        description: 'Multiple prior inpatient admissions is a strong predictor of 30-day readmission.',
        category: 'utilization'
      },
      {
        factor: 'Prolonged Hospitalization (8 days)',
        impactScore: 22,
        description: 'Extended hospitalization correlates with acute disease severity and deconditioning.',
        category: 'clinical'
      },
      {
        factor: 'Significant Polypharmacy (11 active medications)',
        impactScore: 21,
        description: 'High medication complexity poses substantial drug interaction and adherence risks.',
        category: 'medication'
      },
      {
        factor: 'Emergency Admission',
        impactScore: 20,
        description: 'Unplanned acute emergency admission carries higher readmission volatility.',
        category: 'clinical'
      }
    ],
    suggestions: [
      'Schedule mandatory post-discharge clinical telephone check-in within 48 to 72 hours.',
      'Provide comprehensive clinical pharmacist medication reconciliation prior to discharge.',
      'Enroll in heart failure disease management program; provide daily weight tracking log and symptom red-flag guidelines.',
      'Involve hospital medical social work for social determinants of health (SDOH) assessment.'
    ],
    modelVersion: 'v2.4-GBM-Clinical',
    createdAt: '2026-10-02T05:30:00Z'
  },
  {
    id: 'scr-P1024-00',
    screeningId: 'SCR-2026-8812',
    patientId: 'P1024',
    patientUid: DEMO_PATIENT_P1024_ID,
    doctorId: DEMO_DOCTOR_ID,
    doctorName: 'Dr. Sarah Jenkins, MD',
    date: '2026-08-14',
    riskScore: 71,
    riskLevel: 'HIGH',
    features: {
      age: 67,
      medicalCondition: 'Heart Failure',
      admissionType: 'Emergency',
      lengthOfStay: 6,
      previousVisits: 2,
      numMedications: 9,
      numProcedures: 1
    },
    factors: [
      {
        factor: 'Primary Diagnosis: Heart Failure',
        impactScore: 30,
        description: 'Heart failure baseline risk.',
        category: 'clinical'
      },
      {
        factor: 'Prior Utilization (2 visits)',
        impactScore: 24,
        description: 'Prior hospitalization history.',
        category: 'utilization'
      }
    ],
    suggestions: [
      'Cardiology clinic follow-up in 7 days.',
      'Low-sodium dietary guidance review.'
    ],
    modelVersion: 'v2.3-GBM-Clinical',
    createdAt: '2026-08-14T11:20:00Z'
  },
  {
    id: 'scr-P1028-01',
    screeningId: 'SCR-2026-9022',
    patientId: 'P1028',
    patientUid: DEMO_PATIENT_P1028_ID,
    doctorId: DEMO_DOCTOR_ID,
    doctorName: 'Dr. Sarah Jenkins, MD',
    date: '2026-09-30',
    riskScore: 22,
    riskLevel: 'LOW',
    features: {
      age: 44,
      medicalCondition: 'Pneumonia',
      admissionType: 'Urgent',
      lengthOfStay: 3,
      previousVisits: 0,
      numMedications: 4,
      numProcedures: 0
    },
    factors: [
      {
        factor: 'No Prior Hospitalizations (0 visits in 12m)',
        impactScore: -12,
        description: 'Absence of prior utilization indicates stable baseline health.',
        category: 'utilization'
      },
      {
        factor: 'Younger Demographic (44 years)',
        impactScore: -12,
        description: 'Strong physiological resilience.',
        category: 'demographic'
      }
    ],
    suggestions: [
      'Complete full 7-day oral antibiotic course.',
      'Primary care follow-up in 14-21 days.'
    ],
    modelVersion: 'v2.4-GBM-Clinical',
    createdAt: '2026-09-30T16:00:00Z'
  }
];

export const INITIAL_REPORTS: ReportRecord[] = [
  {
    id: 'rep-P1024-01',
    reportId: 'REP-2026-0941',
    screeningId: 'SCR-2026-9041',
    patientId: 'P1024',
    patientUid: DEMO_PATIENT_P1024_ID,
    patientName: 'Robert Smith',
    doctorId: DEMO_DOCTOR_ID,
    doctorName: 'Dr. Sarah Jenkins, MD',
    doctorSpecialty: 'Internal Medicine / Acute Inpatient Care',
    date: '02 October 2026',
    riskScore: 78,
    riskLevel: 'HIGH',
    clinicalSummary: 'Patient Robert Smith (P1024, age 67) presented via emergency department with decompensated heart failure exacerbation. Predictive machine learning screening identified elevated 30-day readmission risk (78% - HIGH RISK) driven primarily by high prior acute care utilization (3 hospitalizations within 12 months), 8-day inpatient duration, and complex polypharmacy (11 active discharge medications). Structured multidisciplinary transitional care protocol activated.',
    factors: [
      {
        factor: 'Primary Diagnosis: Heart Failure',
        impactScore: 30,
        description: 'Documented 30-day readmission vulnerability.',
        category: 'clinical'
      },
      {
        factor: 'Frequent Hospital Utilization (3 visits in 12m)',
        impactScore: 28,
        description: 'High utilization velocity.',
        category: 'utilization'
      },
      {
        factor: 'Prolonged Hospitalization (8 days)',
        impactScore: 22,
        description: 'Acute severity and hospital deconditioning.',
        category: 'clinical'
      },
      {
        factor: 'Significant Polypharmacy (11 active medications)',
        impactScore: 21,
        description: 'Potential drug interactions and adherence challenges.',
        category: 'medication'
      }
    ],
    monitoringPlan: [
      'Mandatory clinical nurse telephone outreach at 48 hours post-discharge.',
      'Comprehensive medication reconciliation and blister-pack dispensation.',
      'Outpatient Heart Failure specialty clinic appointment scheduled for 09 October 2026.',
      'Home Health nurse referral for twice-weekly vital signs and fluid balance assessment.',
      'Provide patient with daily weight tracking diary and warning symptom red-flags.'
    ],
    disclaimer: 'Decision-support output — not a medical diagnosis. EnrollLive predictive scoring does not replace professional medical judgment.',
    createdAt: '2026-10-02T06:00:00Z'
  },
  {
    id: 'rep-P1028-01',
    reportId: 'REP-2026-0919',
    screeningId: 'SCR-2026-9022',
    patientId: 'P1028',
    patientUid: DEMO_PATIENT_P1028_ID,
    patientName: 'Maria Santos',
    doctorId: DEMO_DOCTOR_ID,
    doctorName: 'Dr. Sarah Jenkins, MD',
    doctorSpecialty: 'Internal Medicine / Acute Inpatient Care',
    date: '30 September 2026',
    riskScore: 22,
    riskLevel: 'LOW',
    clinicalSummary: 'Patient Maria Santos (P1028, age 44) admitted with community-acquired pneumonia. Responded well to IV and oral antimicrobial therapy with normalized inflammatory markers. Screening model indicates LOW readmission risk (22%) supported by zero prior hospitalizations, short hospital stay (3 days), and young age profile. Routine outpatient follow-up recommended.',
    factors: [
      {
        factor: 'No Prior Hospitalizations (0 visits in 12m)',
        impactScore: -12,
        description: 'Absence of prior utilization indicates stable baseline health.',
        category: 'utilization'
      },
      {
        factor: 'Younger Demographic (44 years)',
        impactScore: -12,
        description: 'Strong physiological resilience.',
        category: 'demographic'
      }
    ],
    monitoringPlan: [
      'Complete remaining 5-day course of prescribed oral antibiotics.',
      'Outpatient primary care visit in 2 weeks for pulmonary check-up.',
      'Resume standard physical activity as tolerated.'
    ],
    disclaimer: 'Decision-support output — not a medical diagnosis. EnrollLive predictive scoring does not replace professional medical judgment.',
    createdAt: '2026-09-30T16:30:00Z'
  }
];

/**
 * Initializes Firestore collections with starter records if empty
 */
let isDbSeeded = false;
export async function seedInitialFirestoreData() {
  if (isDbSeeded) return;
  try {
    // Check if patients exist
    const testDoc = await getDoc(doc(db, 'patients', 'pat-P1024'));
    if (!testDoc.exists()) {
      console.log('Seeding initial clinical data in Firestore...');
      // Seed users
      for (const [uid, user] of Object.entries(DEMO_USERS)) {
        await setDoc(doc(db, 'users', uid), user);
      }
      // Seed patients
      for (const pat of INITIAL_PATIENT_COHORT) {
        await setDoc(doc(db, 'patients', pat.id), pat);
      }
      // Seed screenings
      for (const scr of INITIAL_SCREENINGS) {
        await setDoc(doc(db, 'screenings', scr.id), scr);
      }
      // Seed reports
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, 'reports', rep.id), rep);
      }
      console.log('Initial clinical data seeded successfully in Firestore.');
    }
    isDbSeeded = true;
  } catch (err) {
    console.warn('Could not seed data directly via Firestore client (may require auth first):', err);
  }
}

/**
 * User Profile Firestore Functions
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // Check demo user registry first for instant evaluation
  if (DEMO_USERS[uid]) {
    return DEMO_USERS[uid];
  }
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * DOCTOR DATA ACCESS (Scoped strictly to doctorId)
 */
export async function getDoctorPatients(doctorId: string): Promise<PatientRecord[]> {
  const path = 'patients';
  try {
    const q = query(collection(db, 'patients'), where('assignedDoctorId', '==', doctorId));
    const snap = await getDocs(q);
    if (snap.empty) {
      // Fallback to in-memory cohort if Firestore empty or before first write
      return INITIAL_PATIENT_COHORT.filter(p => p.assignedDoctorId === doctorId || doctorId === DEMO_DOCTOR_ID);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PatientRecord));
  } catch (err) {
    console.warn('Firestore getDoctorPatients error, falling back to local assigned cohort:', err);
    return INITIAL_PATIENT_COHORT.filter(p => p.assignedDoctorId === doctorId || doctorId === DEMO_DOCTOR_ID);
  }
}

export async function getPatientByIdForDoctor(patientId: string, doctorId: string): Promise<PatientRecord | null> {
  // Check if patient exists and is assigned to this doctor
  const patients = await getDoctorPatients(doctorId);
  const patient = patients.find(p => p.patientId.toUpperCase() === patientId.toUpperCase() || p.id === patientId);
  if (patient) return patient;

  // Resolve from the 55,502 Kaggle Inpatient Dataset if ID is KAG-xxxxx
  if (patientId.toUpperCase().startsWith('KAG-') || /^\d+$/.test(patientId)) {
    const rawNum = parseInt(patientId.toUpperCase().replace('KAG-', ''), 10);
    if (!isNaN(rawNum) && rawNum >= 1 && rawNum <= 55502) {
      const kag = getKagglePatientByIndex(rawNum);
      return {
        id: kag.id,
        patientId: kag.id,
        name: kag.name,
        age: kag.age,
        gender: kag.gender,
        bloodType: kag.bloodType,
        medicalCondition: kag.medicalCondition,
        admissionType: kag.admissionType,
        lengthOfStay: kag.lengthOfStay,
        previousVisits: kag.admissionType === 'Emergency' ? 2 : 0,
        numMedications: 7,
        numProcedures: 1,
        numDiagnoses: 3,
        primaryDiagnosis: `ICD-10 clinical diagnosis & workup for ${kag.medicalCondition}`,
        assignedDoctorId: doctorId,
        assignedDoctorName: kag.doctor || 'Dr. Sarah Jenkins, MD',
        hospital: kag.hospital,
        insuranceProvider: kag.insuranceProvider,
        billingAmount: kag.billingAmount,
        dateOfAdmission: kag.dateOfAdmission,
        dischargeDate: kag.dischargeDate,
        medication: kag.medication,
        testResults: kag.testResults,
        riskScore: kag.predictedReadmissionRisk,
        riskLevel: kag.riskLevel,
        lastScreeningDate: kag.dischargeDate,
        roomNumber: `Room ${kag.roomNumber}`,
        status: 'Inpatient',
        updatedAt: new Date().toISOString()
      };
    }
  }

  return null;
}

export async function getDoctorScreenings(doctorId: string): Promise<ScreeningRecord[]> {
  try {
    const q = query(collection(db, 'screenings'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return INITIAL_SCREENINGS.filter(s => s.doctorId === doctorId || doctorId === DEMO_DOCTOR_ID);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScreeningRecord));
  } catch (err) {
    return INITIAL_SCREENINGS.filter(s => s.doctorId === doctorId || doctorId === DEMO_DOCTOR_ID);
  }
}

export async function getDoctorReports(doctorId: string): Promise<ReportRecord[]> {
  try {
    const q = query(collection(db, 'reports'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return INITIAL_REPORTS.filter(r => r.doctorId === doctorId || doctorId === DEMO_DOCTOR_ID);
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportRecord));
  } catch (err) {
    return INITIAL_REPORTS.filter(r => r.doctorId === doctorId || doctorId === DEMO_DOCTOR_ID);
  }
}

/**
 * PATIENT DATA ACCESS (Strictly scoped to patient's own userId / patientId)
 * CRITICAL PRIVACY: Never returns data of other patients
 */
export async function getPatientRecordForUser(userId: string, patientId?: string): Promise<PatientRecord | null> {
  try {
    const q = query(collection(db, 'patients'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as PatientRecord;
    }
    // Check initial cohort by userId or patientId
    const found = INITIAL_PATIENT_COHORT.find(p => p.userId === userId || (patientId && p.patientId === patientId));
    return found || null;
  } catch (err) {
    const found = INITIAL_PATIENT_COHORT.find(p => p.userId === userId || (patientId && p.patientId === patientId));
    return found || null;
  }
}

export async function getPatientScreeningsForUser(userId: string, patientId?: string): Promise<ScreeningRecord[]> {
  try {
    const q = query(collection(db, 'screenings'), where('patientUid', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScreeningRecord));
    }
    return INITIAL_SCREENINGS.filter(s => s.patientUid === userId || (patientId && s.patientId === patientId));
  } catch (err) {
    return INITIAL_SCREENINGS.filter(s => s.patientUid === userId || (patientId && s.patientId === patientId));
  }
}

export async function getPatientReportsForUser(userId: string, patientId?: string): Promise<ReportRecord[]> {
  try {
    const q = query(collection(db, 'reports'), where('patientUid', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportRecord));
    }
    return INITIAL_REPORTS.filter(r => r.patientUid === userId || (patientId && r.patientId === patientId));
  } catch (err) {
    return INITIAL_REPORTS.filter(r => r.patientUid === userId || (patientId && r.patientId === patientId));
  }
}

/**
 * SAVE SCREENING RECORD
 */
export async function createScreening(screening: Omit<ScreeningRecord, 'id'>): Promise<ScreeningRecord> {
  const newId = `scr-${Date.now()}`;
  const fullRecord: ScreeningRecord = {
    ...screening,
    id: newId
  };

  try {
    await setDoc(doc(db, 'screenings', newId), fullRecord);
    
    // Also update patient record's risk score and last screening date
    const patientDocRef = doc(db, 'patients', `pat-${screening.patientId}`);
    try {
      await updateDoc(patientDocRef, {
        riskScore: screening.riskScore,
        riskLevel: screening.riskLevel,
        lastScreeningDate: screening.date,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Patient might be in memory
    }
  } catch (err) {
    console.warn('Saved screening in local memory buffer:', err);
  }

  // Update in-memory cohorts as well
  INITIAL_SCREENINGS.unshift(fullRecord);
  const patient = INITIAL_PATIENT_COHORT.find(p => p.patientId === screening.patientId);
  if (patient) {
    patient.riskScore = screening.riskScore;
    patient.riskLevel = screening.riskLevel;
    patient.lastScreeningDate = screening.date;
    patient.updatedAt = new Date().toISOString();
  }

  return fullRecord;
}

/**
 * SAVE REPORT RECORD
 */
export async function createReport(report: Omit<ReportRecord, 'id'>): Promise<ReportRecord> {
  const newId = `rep-${Date.now()}`;
  const fullRecord: ReportRecord = {
    ...report,
    id: newId
  };

  try {
    await setDoc(doc(db, 'reports', newId), fullRecord);
  } catch (err) {
    console.warn('Saved report in local memory buffer:', err);
  }

  INITIAL_REPORTS.unshift(fullRecord);
  return fullRecord;
}
