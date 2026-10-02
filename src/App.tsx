/**
 * ENROLLLIVE
 * AI-Powered Predictive Hospital Readmission Risk Screening and Decision-Making Platform
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AccessDeniedModal } from './components/common/AccessDeniedModal';
import { ModelLimitationsModal } from './components/common/ModelLimitationsModal';

// Doctor Views
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { DoctorPatients } from './components/doctor/DoctorPatients';
import { DoctorPatientDetail } from './components/doctor/DoctorPatientDetail';
import { DoctorRiskScreening } from './components/doctor/DoctorRiskScreening';
import { DoctorAnalytics } from './components/doctor/DoctorAnalytics';
import { DoctorModelPerformance } from './components/doctor/DoctorModelPerformance';
import { DoctorReports } from './components/doctor/DoctorReports';
import { DoctorProfile } from './components/doctor/DoctorProfile';

// Patient Views
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PatientProfile } from './components/patient/PatientProfile';
import { PatientRisk } from './components/patient/PatientRisk';
import { PatientReports } from './components/patient/PatientReports';
import { PatientHistory } from './components/patient/PatientHistory';
import { PatientNotifications } from './components/patient/PatientNotifications';
import { PatientSettings } from './components/patient/PatientSettings';

const MainLayout: React.FC = () => {
  const { userProfile, role, isLoading, setAccessDenied } = useAuth();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [activePatientId, setActivePatientId] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [limitationsModalOpen, setLimitationsModalOpen] = useState<boolean>(false);

  // Route mapping helpers
  const routeToUrl = (route: string, patientId?: string): string => {
    switch (route) {
      case 'dashboard': return '/doctor/dashboard';
      case 'patients': return '/doctor/patients';
      case 'patient-detail': return patientId ? `/doctor/patients?id=${patientId}` : '/doctor/patients';
      case 'risk-screening': return patientId ? `/doctor/risk-screening?id=${patientId}` : '/doctor/risk-screening';
      case 'analytics': return '/doctor/analytics';
      case 'model-performance': return '/doctor/model-performance';
      case 'reports': return patientId ? `/doctor/reports?id=${patientId}` : '/doctor/reports';
      case 'profile': return '/doctor/profile';
      case 'my-dashboard': return '/patient/dashboard';
      case 'my-profile': return '/patient/profile';
      case 'my-risk': return '/patient/risk';
      case 'my-reports': return '/patient/reports';
      case 'my-history': return '/patient/history';
      case 'notifications': return '/patient/notifications';
      case 'settings': return '/patient/settings';
      default: return role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard';
    }
  };

  const urlToRoute = (hashUrl: string): { route: string; patientId?: string } => {
    const clean = hashUrl.replace(/^#\/?/, '').toLowerCase();
    const [pathPart, queryPart] = clean.split('?');
    let patientId: string | undefined;
    if (queryPart) {
      const match = queryPart.match(/id=([^&]+)/);
      if (match) patientId = match[1];
    }

    if (pathPart.includes('doctor')) {
      if (pathPart.includes('patient-detail') || (pathPart.includes('patients') && patientId)) return { route: 'patient-detail', patientId };
      if (pathPart.includes('patients')) return { route: 'patients' };
      if (pathPart.includes('risk-screening')) return { route: 'risk-screening', patientId };
      if (pathPart.includes('analytics')) return { route: 'analytics' };
      if (pathPart.includes('model-performance')) return { route: 'model-performance' };
      if (pathPart.includes('reports')) return { route: 'reports', patientId };
      if (pathPart.includes('profile')) return { route: 'profile' };
      return { route: 'dashboard' };
    }

    if (pathPart.includes('patient')) {
      if (pathPart.includes('profile')) return { route: 'my-profile' };
      if (pathPart.includes('risk')) return { route: 'my-risk' };
      if (pathPart.includes('reports')) return { route: 'my-reports' };
      if (pathPart.includes('history')) return { route: 'my-history' };
      if (pathPart.includes('notifications')) return { route: 'notifications' };
      if (pathPart.includes('settings')) return { route: 'settings' };
      return { route: 'my-dashboard' };
    }

    return { route: role === 'DOCTOR' ? 'dashboard' : 'my-dashboard' };
  };

  // Sync route on role change or direct URL hash entry
  useEffect(() => {
    if (!role) return;

    const evaluateCurrentHash = () => {
      const currentHash = window.location.hash;
      if (!currentHash) {
        const defaultRoute = role === 'DOCTOR' ? 'dashboard' : 'my-dashboard';
        setCurrentRoute(defaultRoute);
        window.location.hash = `#${routeToUrl(defaultRoute)}`;
        return;
      }

      const { route: parsedRoute, patientId: parsedId } = urlToRoute(currentHash);

      // Check role authorization for URL
      const isDoctorRoute = [
        'dashboard', 'patients', 'patient-detail', 'risk-screening', 
        'analytics', 'model-performance', 'reports', 'profile'
      ].includes(parsedRoute);

      const isPatientRoute = [
        'my-dashboard', 'my-profile', 'my-risk', 'my-reports', 
        'my-history', 'notifications', 'settings'
      ].includes(parsedRoute);

      if (role === 'PATIENT' && isDoctorRoute) {
        setAccessDenied('Access Denied: You are not authorized to access this page. Patients are restricted to their personal health record.');
        setCurrentRoute('my-dashboard');
        window.location.hash = '#/patient/dashboard';
        return;
      }

      if (role === 'DOCTOR' && isPatientRoute) {
        setAccessDenied('Access Denied: Doctor account active. Individual patient records must be accessed via your authorized Patients roster.');
        setCurrentRoute('dashboard');
        window.location.hash = '#/doctor/dashboard';
        return;
      }

      setCurrentRoute(parsedRoute);
      if (parsedId) setActivePatientId(parsedId);
    };

    evaluateCurrentHash();
    window.addEventListener('hashchange', evaluateCurrentHash);
    return () => window.removeEventListener('hashchange', evaluateCurrentHash);
  }, [role]);

  // Robust Route Protection Navigation Handler
  const handleNavigate = (route: string, patientId?: string) => {
    setActivePatientId(patientId);

    // Doctor Route Protection
    const doctorOnlyRoutes = [
      'dashboard', 
      'patients', 
      'patient-detail', 
      'risk-screening', 
      'analytics', 
      'model-performance', 
      'reports', 
      'profile'
    ];

    // Patient Route Protection
    const patientOnlyRoutes = [
      'my-dashboard', 
      'my-profile', 
      'my-risk', 
      'my-reports', 
      'my-history', 
      'notifications', 
      'settings'
    ];

    if (role === 'PATIENT' && doctorOnlyRoutes.includes(route)) {
      setAccessDenied('Access Denied: You are not authorized to access this page. Redirecting to your personal Patient Dashboard.');
      setCurrentRoute('my-dashboard');
      window.location.hash = '#/patient/dashboard';
      return;
    }

    if (role === 'DOCTOR' && patientOnlyRoutes.includes(route)) {
      setAccessDenied('Access Denied: Doctor account active. Individual patient records must be accessed via your assigned Patients roster.');
      setCurrentRoute('dashboard');
      window.location.hash = '#/doctor/dashboard';
      return;
    }

    setCurrentRoute(route);
    window.location.hash = `#${routeToUrl(route, patientId)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-blue-200">
          Initializing EnrollLive Clinical Security...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!userProfile) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Role-Specific Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={(r) => handleNavigate(r)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all">
        {/* Top Header Bar */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenLimitations={() => setLimitationsModalOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* DOCTOR ROUTES */}
          {role === 'DOCTOR' && (
            <>
              {currentRoute === 'dashboard' && (
                <DoctorDashboard onNavigate={handleNavigate} />
              )}
              {currentRoute === 'patients' && (
                <DoctorPatients onNavigate={handleNavigate} />
              )}
              {currentRoute === 'patient-detail' && activePatientId && (
                <DoctorPatientDetail 
                  patientId={activePatientId} 
                  onNavigate={handleNavigate} 
                />
              )}
              {currentRoute === 'risk-screening' && (
                <DoctorRiskScreening 
                  initialPatientId={activePatientId} 
                  onNavigate={handleNavigate} 
                />
              )}
              {currentRoute === 'analytics' && (
                <DoctorAnalytics onNavigate={handleNavigate} />
              )}
              {currentRoute === 'model-performance' && (
                <DoctorModelPerformance />
              )}
              {currentRoute === 'reports' && (
                <DoctorReports 
                  initialPatientId={activePatientId} 
                  onNavigate={handleNavigate} 
                />
              )}
              {currentRoute === 'profile' && (
                <DoctorProfile />
              )}
            </>
          )}

          {/* PATIENT ROUTES */}
          {role === 'PATIENT' && (
            <>
              {currentRoute === 'my-dashboard' && (
                <PatientDashboard onNavigate={handleNavigate} />
              )}
              {currentRoute === 'my-profile' && (
                <PatientProfile />
              )}
              {currentRoute === 'my-risk' && (
                <PatientRisk />
              )}
              {currentRoute === 'my-reports' && (
                <PatientReports />
              )}
              {currentRoute === 'my-history' && (
                <PatientHistory />
              )}
              {currentRoute === 'notifications' && (
                <PatientNotifications />
              )}
              {currentRoute === 'settings' && (
                <PatientSettings />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AccessDeniedModal />
      <ModelLimitationsModal
        isOpen={limitationsModalOpen}
        onClose={() => setLimitationsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
