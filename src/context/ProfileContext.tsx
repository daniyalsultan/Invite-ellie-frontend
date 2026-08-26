import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from '../utils/apiBaseUrl';

type UserProfile = {
  id?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  company?: string | null;
  company_notes?: string | null;
  position?: string | null;
  audience?: string | null;
  purpose?: string | null;
  sso_provider?: string | null;
  first_login?: boolean;
  show_tour?: boolean;
  auto_join_meetings?: boolean;
  subscription_status?: string | null;
  subscription_plan?: string | null;
  stripe_subscription_id?: string | null;
};

type ProfileContextValue = {
  profile: UserProfile | null;
  isLoading: boolean;
  /** False until the first profile load settles, however it settles. */
  isInitialized: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }): JSX.Element {
  const { isAuthenticated, ensureFreshAccessToken } = useAuth();
  const apiBaseUrl = getApiBaseUrl();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !apiBaseUrl) {
      latestRequestIdRef.current += 1;
      setProfile(null);
      setIsInitialized(true);
      return;
    }

    const requestId = ++latestRequestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }

      const response = await fetch(`${apiBaseUrl}/accounts/me/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load your profile.');
      }

      const data = (await response.json()) as UserProfile;
      if (requestId === latestRequestIdRef.current) {
        setProfile(data);
      }
    } catch (err) {
      if (requestId === latestRequestIdRef.current) {
        setError(err instanceof Error ? err.message : 'Unable to load your profile.');
        // Deliberately keep any profile we already have. A background refresh
        // that fails (flaky network, a dropped connection) should not blank
        // out a working session.
      }
    } finally {
      // Not guarded by requestId: once any attempt settles the app has enough
      // to render, and a superseded request must not leave this false forever.
      setIsInitialized(true);
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiBaseUrl, ensureFreshAccessToken, isAuthenticated]);

  useEffect(() => {
    latestRequestIdRef.current += 1;

    if (isAuthenticated) {
      void refreshProfile();
    } else {
      setProfile(null);
      setError(null);
      setIsInitialized(true);
    }
  }, [isAuthenticated, refreshProfile]);

  const value: ProfileContextValue = {
    profile,
    isLoading,
    isInitialized,
    error,
    refreshProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

