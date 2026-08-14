import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { FullScreenLoader } from '../common/GradientLoader';

const FIRST_LOGIN_ROUTES = ['/choose-plan', '/setup-profile', '/billing/success', '/connect-integrations'];

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isInitializing } = useAuth();
  const { profile, error: profileError } = useProfile();
  const location = useLocation();

  const isFirstLoginRoute = FIRST_LOGIN_ROUTES.includes(location.pathname);
  const isFirstLogin = profile?.first_login === true;
  const hasPaidPlan =
    profile?.subscription_plan != null &&
    profile.subscription_plan !== '' &&
    profile.subscription_plan !== 'free';

  if (isInitializing) {
    return <FullScreenLoader label="For unforgettable meetings!" />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }

  // Hold the loader until the first profile load settles. Gating on
  // "profile not yet available" (rather than isLoading) keeps pages from
  // mounting in the gap before ProfileContext's fetch effect flips
  // isLoading on — that gap caused pages to mount, fire their data
  // fetches, unmount behind the loader, then remount and fetch again.
  // It also stops background profile refreshes from unmounting the app.
  if (profile === null && profileError === null && !isFirstLoginRoute) {
    return <FullScreenLoader label="For unforgettable meetings!" />;
  }

  if (isFirstLogin && !isFirstLoginRoute) {
    if (hasPaidPlan) {
      return <Navigate to="/setup-profile" replace />;
    }
    return <Navigate to="/choose-plan" replace />;
  }

  return <Outlet />;
}
