import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { FullScreenLoader } from '../common/GradientLoader';

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isInitializing } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const location = useLocation();

  const isSetupRoute = location.pathname === '/setup-profile';

  // Check if this is first login based on API flag
  const isFirstLogin = profile?.first_login === true;

  if (isInitializing || (isProfileLoading && !isSetupRoute)) {
    return <FullScreenLoader label="For unforgettable meetings!" />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }

  // Redirect to setup profile on first login
  if (isFirstLogin && !isSetupRoute) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/setup-profile" replace state={{ from: redirectTo }} />;
  }

  return <Outlet />;
}
