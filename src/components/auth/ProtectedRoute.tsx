import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { FullScreenLoader } from '../common/GradientLoader';

const FIRST_LOGIN_ROUTES = ['/choose-plan', '/setup-profile', '/billing/success', '/connect-integrations'];

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isInitializing } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const location = useLocation();

  const isFirstLoginRoute = FIRST_LOGIN_ROUTES.includes(location.pathname);
  const isFirstLogin = profile?.first_login === true;
  const hasPaidPlan =
    profile?.subscription_plan != null &&
    profile.subscription_plan !== '' &&
    profile.subscription_plan !== 'free';

  if (isInitializing || (isProfileLoading && !isFirstLoginRoute)) {
    return <FullScreenLoader label="For unforgettable meetings!" />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }

  if (isFirstLogin && !isFirstLoginRoute) {
    if (hasPaidPlan) {
      return <Navigate to="/setup-profile" replace />;
    }
    return <Navigate to="/choose-plan" replace />;
  }

  return <Outlet />;
}
