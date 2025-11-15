import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { hasCompletedProfileSetup, markProfileSetupComplete } from '../../utils/profileForm';
import { FullScreenLoader } from '../common/GradientLoader';

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isInitializing, session } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const location = useLocation();

  const isSetupRoute = location.pathname === '/setup-profile';
  const userId = session?.userId ?? null;

  const hasProfileName =
    Boolean(profile?.first_name?.trim()) && Boolean(profile?.last_name?.trim());

  useEffect(() => {
    if (userId && hasProfileName) {
      markProfileSetupComplete(userId);
    }
  }, [hasProfileName, userId]);

  const completedOnce = userId ? hasCompletedProfileSetup(userId) : false;
  const needsSetup = !isProfileLoading && !hasProfileName && !completedOnce;

  if (isInitializing || (isProfileLoading && !isSetupRoute)) {
    return <FullScreenLoader label="For unforgettable meetings!" />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }

  if (needsSetup && !isSetupRoute) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/setup-profile" replace state={{ from: redirectTo }} />;
  }

  return <Outlet />;
}
