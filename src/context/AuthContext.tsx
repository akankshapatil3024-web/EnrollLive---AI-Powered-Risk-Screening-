/**
 * Authentication Context for EnrollLive
 * Enforces Role-Based Access Control (DOCTOR vs PATIENT)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  getUserProfile, 
  saveUserProfile, 
  DEMO_USERS, 
  DEMO_DOCTOR_ID, 
  DEMO_PATIENT_P1024_ID, 
  DEMO_PATIENT_P1028_ID,
  seedInitialFirestoreData 
} from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  accessDeniedMessage: string | null;
  clearAccessDenied: () => void;
  setAccessDenied: (msg: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, role: UserRole, name: string, patientId?: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  loginAsDemoUser: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Initialize and check persistent auth
  useEffect(() => {
    // Seed initial database demo records if needed
    seedInitialFirestoreData();

    // Check localStorage for demo user session if present
    const cachedDemoUid = localStorage.getItem('enrolllive_active_demo_uid');
    if (cachedDemoUid && DEMO_USERS[cachedDemoUid]) {
      setUserProfile(DEMO_USERS[cachedDemoUid]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            // Default new profile if not yet created in Firestore
            profile = {
              uid: user.uid,
              email: user.email || '',
              role: 'PATIENT', // Default safe minimal privilege
              name: user.displayName || user.email?.split('@')[0] || 'User',
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(profile);
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      } else {
        // If no auth and no demo user, leave as unauthenticated
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('enrolllive_active_demo_uid');
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfile(cred.user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        throw new Error('User account exists but has no verified profile or role.');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    selectedRole: UserRole, 
    name: string, 
    patientId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('enrolllive_active_demo_uid');
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        role: selectedRole,
        name,
        patientId: selectedRole === 'PATIENT' ? (patientId || `P${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
        specialty: selectedRole === 'DOCTOR' ? 'General Medicine & Hospitalist' : undefined,
        department: selectedRole === 'DOCTOR' ? 'Acute Inpatient Care' : undefined,
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(newProfile);
      setUserProfile(newProfile);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (fallbackRole: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('enrolllive_active_demo_uid');
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      let profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        profile = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          role: fallbackRole,
          name: cred.user.displayName || 'Authorized User',
          patientId: fallbackRole === 'PATIENT' ? `P${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          specialty: fallbackRole === 'DOCTOR' ? 'Internal Medicine' : undefined,
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(profile);
      }
      setUserProfile(profile);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const demoUser = DEMO_USERS[uid];
      if (demoUser) {
        localStorage.setItem('enrolllive_active_demo_uid', uid);
        setUserProfile(demoUser);
        setCurrentUser(null); // Simulated local authenticated profile
      } else {
        throw new Error('Demo profile not found.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('enrolllive_active_demo_uid');
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setAccessDenied = (msg: string) => {
    setAccessDeniedMessage(msg);
  };

  const clearAccessDenied = () => {
    setAccessDeniedMessage(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      role: userProfile?.role || null,
      isLoading,
      error,
      accessDeniedMessage,
      clearAccessDenied,
      setAccessDenied,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginAsDemoUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
