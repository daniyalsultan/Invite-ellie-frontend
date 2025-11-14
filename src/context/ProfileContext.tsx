import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
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
};

type ProfileContextValue = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }): JSX.Element {
  const { isAuthenticated, ensureFreshAccessToken } = useAuth();
  const apiBaseUrl = getApiBaseUrl();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !apiBaseUrl) {
      setProfile(null);
      return;
    }

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
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your profile.');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, ensureFreshAccessToken, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [isAuthenticated, refreshProfile]);

  const value: ProfileContextValue = {
    profile,
    isLoading,
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

