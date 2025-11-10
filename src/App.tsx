import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/landing/Header';
import { LandingPage } from './components/landing/LandingPage';
import { SetupProfilePage } from './components/setupProfile/SetupProfilePage';
import { ComingSoonPage } from './components/comingSoon/ComingSoonPage';
import { SignupPage } from './components/signup/SignupPage';
import { LoginPage } from './components/login/LoginPage';
import { ResetPasswordPage } from './components/resetpassword/ResetPasswordPage';
import { NewPasswordPage } from './components/resetpassword/NewPasswordPage';
import { IntegrationsPage } from './components/integrations';
import { PreferencesPage } from './components/preferences';
import { SettingsPage } from './components/settings';
import { NotificationsPage } from './components/notifications';
import { DashboardPage } from './components/dashboard';
import { WorkspacePage, CreateWorkspacePage, WorkspaceViewPage } from './components/workspace';
import { TranscriptionsPage } from './components/transcriptions';
import { MeetingRecordingsPage } from './components/meetingrecordings';
import { MeetingViewPage } from './components/meetingView';

function ScrollToHash(): null {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location]);

  return null;
}

function App(): JSX.Element {
  const location = useLocation();
  const hideHeader =
    location.pathname === '/coming-soon' ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/integrations') ||
    location.pathname.startsWith('/preferences') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/notifications') ||
    location.pathname.startsWith('/workspaces') ||
    location.pathname.startsWith('/create-workspace') ||
    location.pathname.startsWith('/workspaces/workspace-view') ||
    location.pathname.startsWith('/transcriptions') ||
    location.pathname.startsWith('/meeting-recordings') ||
    location.pathname.startsWith('/meeting-view');

  return (
    <div className="min-h-screen bg-white">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup-profile" element={<SetupProfilePage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/workspaces" element={<WorkspacePage />} />
        <Route path="/create-workspace" element={<CreateWorkspacePage />} />
        <Route path="/workspaces/workspace-view" element={<WorkspaceViewPage />} />
        <Route path="/transcriptions" element={<TranscriptionsPage />} />
        <Route path="/meeting-recordings" element={<MeetingRecordingsPage />} />
        <Route path="/meeting-view" element={<MeetingViewPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ScrollToHash />
    </div>
  );
}

export default App;