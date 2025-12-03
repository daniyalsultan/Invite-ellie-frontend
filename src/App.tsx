import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/landing/Header';
import { LandingPage } from './components/landing/LandingPage';
import { SetupProfilePage } from './components/setupProfile/SetupProfilePage';
import { ComingSoonPage } from './components/comingSoon/ComingSoonPage';
import { SignupPage } from './components/signup/SignupPage';
import { ConfirmSignupPage } from './components/signup/ConfirmSignupPage';
import { LoginPage } from './components/login/LoginPage';
import { ResetPasswordPage } from './components/resetpassword/ResetPasswordPage';
import { NewPasswordPage } from './components/resetpassword/NewPasswordPage';
import { SSOCallbackPage } from './components/auth/SSOCallbackPage';
import { IntegrationsPage } from './components/integrations';
import { PreferencesPage } from './components/preferences';
import { SettingsPage } from './components/settings';
import { NotificationsPage } from './components/notifications';
import { DashboardPage } from './components/dashboard';
import { WorkspacePage, CreateWorkspacePage, WorkspaceViewPage } from './components/workspace';
import { TranscriptionsPage } from './components/transcriptions';
import { MeetingRecordingsPage } from './components/meetingrecordings';
import { MeetingViewPage } from './components/meetingView';
import { SearchResultsPage } from './components/search';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ChatBot } from './components/chatbot';

function ScrollToHash(): null {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (location.hash.startsWith('#access_token=')) {
      return;
    }

    const element = document.querySelector(location.hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location]);

  return null;
}

function AuthRedirectHandler(): null {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Supabase email confirmation redirect from /auth/confirm
    if (location.pathname === '/auth/confirm' && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const token = hashParams.get('token');
      const type = hashParams.get('type');
      const email = hashParams.get('email');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (errorCode) {
        const message = errorDescription || 'Invalid or expired confirmation link.';
        navigate(`/confirm-signup?error=${encodeURIComponent(message)}`, { replace: true });
        return;
      }

      if (type === 'email' && token) {
        const params = new URLSearchParams();
        params.set('token', token);
        if (email) {
          params.set('email', email);
        }
        navigate(`/confirm-signup?${params.toString()}`, { replace: true });
        return;
      }
    }

    // Handle password recovery redirects
    if (location.hash && location.hash.startsWith('#')) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (type === 'recovery') {
        const params = new URLSearchParams();
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken) {
          params.set('access_token', accessToken);
        }
        if (refreshToken) {
          params.set('refresh_token', refreshToken);
        }
        params.set('notice', 'recovery');
        navigate(`/new-password?${params.toString()}`, { replace: true });
        return;
      }

      if (errorCode === 'otp_expired') {
        const message = errorDescription || 'Your recovery link has expired. Please request a new one.';
        navigate(`/new-password?error=${encodeURIComponent(message)}`, { replace: true });
      }
    }
  }, [location, navigate]);

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
    location.pathname.startsWith('/transcriptions') ||
    location.pathname.startsWith('/meeting-recordings') ||
    location.pathname.startsWith('/meeting-view') ||
    location.pathname.startsWith('/search-results');

  return (
    <div className="min-h-screen bg-white">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm-signup" element={<ConfirmSignupPage />} />
        <Route path="/auth/confirm" element={<ConfirmSignupPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/auth/callback" element={<SSOCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/setup-profile" element={<SetupProfilePage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspaces" element={<WorkspacePage />} />
          <Route path="/create-workspace" element={<CreateWorkspacePage />} />
          <Route path="/workspaces/:workspaceId" element={<WorkspaceViewPage />} />
          <Route path="/transcriptions" element={<TranscriptionsPage />} />
          <Route path="/meeting-recordings" element={<MeetingRecordingsPage />} />
          <Route path="/meeting-view" element={<MeetingViewPage />} />
        </Route>
        
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ChatBot />
      <AuthRedirectHandler />
      <ScrollToHash />
    </div>
  );
}

export default App;
