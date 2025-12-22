import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '../sidebar';
import removeButtonIcon from '../../assets/profile-setup-removeButton.svg';
import greenTickIcon from '../../assets/green white tick.png';
import microsoftIcon from '../../assets/microsoft-icon.png';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { apiAudienceToLocal, decodeMultiSelect, encodeMultiSelect, localAudienceToApi } from '../../utils/profileForm';

const USE_CASE_OPTIONS = [
  { value: 'notes', label: 'Meeting notes and transcriptions' },
  { value: 'actions', label: 'Action items and follow-ups' },
  { value: 'collab', label: 'Team collaboration' },
  { value: 'clients', label: 'Client meetings' },
];

const USE_CASE_VALUES = USE_CASE_OPTIONS.map((option) => option.value);

function GoogleIcon(): JSX.Element {
  return (
    <span className="block h-5 w-5">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
          fill="#EA4335"
        />
      </svg>
    </span>
  );
}

export function PreferencesPage(): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usageType, setUsageType] = useState<'company' | 'personal'>('company');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [companyNote, setCompanyNote] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | undefined>(undefined);
  const [ssoProvider, setSsoProvider] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousUrlRef = useRef<string | null>(null);

  const { ensureFreshAccessToken } = useAuth();
  const { profile, isLoading: isProfileLoading, refreshProfile } = useProfile();
  const apiBaseUrl = getApiBaseUrl();

  const revokeObjectUrl = () => {
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }
  };

  // Auto-save avatar (upload or remove)
  const saveAvatarOnly = async (file: File | null, isRemoving: boolean = false) => {
    if (!apiBaseUrl) {
      return;
    }

    setIsSavingAvatar(true);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }

      const formData = new FormData();
      if (isRemoving) {
        // To remove avatar, send empty string
        formData.append('avatar', '');
      } else if (file) {
        formData.append('avatar', file);
      }

      const response = await fetch(`${apiBaseUrl}/accounts/me/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let responseData: unknown;
      try {
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          responseData = text ? JSON.parse(text) : null;
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        responseData = null;
      }

      if (!response.ok) {
        let message = 'Unable to update avatar.';
        if (responseData && typeof responseData === 'object' && responseData !== null) {
          const data = responseData as Record<string, unknown>;
          if ('error' in data && typeof data.error === 'string') {
            message = data.error;
          } else if ('detail' in data && typeof data.detail === 'string') {
            message = data.detail;
          }
        }
        throw new Error(message);
      }

      // Update preview with server response
      if (responseData && typeof responseData === 'object' && responseData !== null) {
        const data = responseData as Record<string, unknown>;
        if ('avatar_url' in data) {
          if (isRemoving || data.avatar_url === null || data.avatar_url === '') {
            revokeObjectUrl();
            setAvatarPreview(null);
          } else if (typeof data.avatar_url === 'string') {
            revokeObjectUrl();
            setAvatarPreview(data.avatar_url);
          }
        }
      }
      setAvatarFile(null);
      await refreshProfile();
    } catch (error) {
      console.error('Failed to save avatar:', error);
      // Revert preview on error
      if (isRemoving) {
        setAvatarPreview(profile?.avatar_url ?? null);
      } else {
        revokeObjectUrl();
        setAvatarPreview(profile?.avatar_url ?? null);
        setAvatarFile(null);
      }
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    revokeObjectUrl();
    previousUrlRef.current = objectUrl;
    setAvatarPreview(objectUrl);
    setAvatarFile(file);
    
    // Auto-save avatar - pass file directly, avatarFile state is for tracking
    void avatarFile; // Suppress unused variable warning
    await saveAvatarOnly(file, false);
  };

  const handleRemoveAvatar = async () => {
    // Auto-save avatar removal
    await saveAvatarOnly(null, true);
    
    revokeObjectUrl();
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleUseCase = (value: string) => {
    setSelectedUseCases((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  useEffect(() => {
    return () => {
      revokeObjectUrl();
    };
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFirstName(profile.first_name ?? '');
    setLastName(profile.last_name ?? '');
    setCompanyName(profile.company ?? '');
    setRole(profile.position ?? '');
    setCompanyNote(profile.company_notes ?? '');
    setSelectedUseCases(decodeMultiSelect(profile.purpose, USE_CASE_VALUES));
    setUsageType(apiAudienceToLocal(profile.audience) === 'personal' ? 'personal' : 'company');
    revokeObjectUrl();
    setAvatarPreview(profile.avatar_url ?? null);
    setAvatarFile(null);
    setProfileEmail(profile.email ?? undefined);
    setSsoProvider(profile.sso_provider ?? undefined);
  }, [profile]);

  const handleSaveChanges = async () => {
    if (!apiBaseUrl) {
      setStatusMessage({ type: 'error', text: 'API base URL is not configured.' });
      return;
    }

    setStatusMessage(null);
    setIsSaving(true);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }

      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('company', companyName.trim());
      formData.append('position', role.trim());
      formData.append('company_notes', companyNote.trim());
      const audienceLocal: 'team' | 'personal' = usageType === 'personal' ? 'personal' : 'team';
      formData.append('audience', localAudienceToApi(audienceLocal));
      formData.append('purpose', encodeMultiSelect(selectedUseCases));
      // Don't include avatar in regular save - it's auto-saved separately

      const response = await fetch(`${apiBaseUrl}/accounts/me/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header when using FormData - browser will set it with boundary
        },
        body: formData,
      });

      let responseData: unknown;
      try {
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // Handle non-JSON responses (unlikely but possible)
          const text = await response.text();
          responseData = text ? JSON.parse(text) : null;
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        responseData = null;
      }

      if (!response.ok) {
        let message = 'Unable to update your profile.';
        if (responseData && typeof responseData === 'object' && responseData !== null) {
          const data = responseData as Record<string, unknown>;
          if ('error' in data && typeof data.error === 'string') {
            message = data.error;
          } else if ('detail' in data && typeof data.detail === 'string') {
            message = data.detail;
          } else {
            const fieldErrors = Object.entries(data)
              .map(([field, value]) => {
                if (Array.isArray(value)) {
                  return `${field}: ${value.join(', ')}`;
                }
                if (typeof value === 'string') {
                  return `${field}: ${value}`;
                }
                return null;
              })
              .filter(Boolean)
              .join(' | ');
            if (fieldErrors) {
              message = fieldErrors;
            }
          }
        }
        throw new Error(message);
      }

      setStatusMessage({ type: 'success', text: 'Profile updated successfully.' });
      await refreshProfile();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong while saving your profile.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
  const disableInputs = isSaving || isSavingAvatar;
  const showInitialLoading = isProfileLoading && !profile;

  const normalizedProvider = (ssoProvider ?? '').toLowerCase();
  const ssoStatus =
    normalizedProvider === 'google'
      ? { icon: <GoogleIcon />, text: 'Google account connected' }
      : normalizedProvider === 'microsoft' || normalizedProvider === 'azure'
        ? { icon: <img src={microsoftIcon} alt="Microsoft" className="w-5 h-5 object-contain" />, text: 'Microsoft account connected' }
        : null;

  return (
    <DashboardLayout
      activeTab="/preferences"
      userName={displayName}
      userEmail={profileEmail}
      userAvatar={avatarPreview ?? undefined}
    >
      <div className="w-full min-h-full bg-white">
        <div className="px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-nunito text-xs font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </a>
              </li>
              <li className="text-ellieGray">/</li>
              <li className="text-ellieBlue">Profile & Preferences</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-spaceGrotesk text-4xl font-bold text-ellieBlack mb-8">
            Profile & Preferences
          </h1>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section: Profile Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="font-nunito text-xl font-bold text-ellieBlack mb-6">
                Profile Settings
              </h2>

              {/* Profile Picture */}
              <div className="mb-6 flex items-start gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <>
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-60"
                        aria-label="Remove profile picture"
                        onClick={handleRemoveAvatar}
                        disabled={disableInputs}
                      >
                        <img
                          src={removeButtonIcon}
                          alt="Remove"
                          className="w-4 h-4 object-contain"
                        />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disableInputs}
                      className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#A7B0C5] bg-white text-center font-nunito text-xs text-ellieNavy transition hover:border-ellieBlue hover:bg-ellieBlue/5 disabled:opacity-60"
                    >
                      <span className="text-lg">📁</span>
                      <span className="font-semibold">Upload photo</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disableInputs}
                    className="px-4 py-2 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    Upload Image
                  </button>
                )}
              </div>

              {/* Name Fields */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-nunito text-sm font-medium text-ellieBlack mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={disableInputs}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block font-nunito text-sm font-medium text-ellieBlack mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={disableInputs}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Microsoft Account Connection */}
              {ssoStatus && (
                <div className="mb-6 flex items-center gap-2">
                  {ssoStatus.icon}
                  <span className="font-nunito text-sm font-medium text-ellieBlack">
                    {ssoStatus.text}
                  </span>
                  <img
                    src={greenTickIcon}
                    alt="Connected"
                    className="w-5 h-5 object-contain"
                  />
                </div>
              )}

              {/* Delete Account Button */}
              <button
                type="button"
                className="w-full px-4 py-2.5 rounded-lg bg-red-500 text-white font-nunito text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>

            {/* Right Section: Preferences */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="font-nunito text-xl font-bold text-ellieBlack mb-6">
                Preferences
              </h2>

              {/* How do you want to use Invite Ellie? */}
              <div className="mb-6">
                <h3 className="font-nunito text-sm font-semibold text-ellieBlack mb-4">
                  How do you want to use Invite Ellie?
                </h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUsageType('company')}
                    disabled={disableInputs}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-nunito text-sm font-semibold transition-colors ${
                      usageType === 'company'
                        ? 'bg-ellieBlue text-white'
                        : 'bg-white text-ellieGray border border-gray-300 hover:border-gray-400'
                    } ${disableInputs ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Company or team
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsageType('personal')}
                    disabled={disableInputs}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-nunito text-sm font-semibold transition-colors ${
                      usageType === 'personal'
                        ? 'bg-ellieBlue text-white'
                        : 'bg-white text-ellieGray border border-gray-300 hover:border-gray-400'
                    } ${disableInputs ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Personal Use
                  </button>
                </div>
              </div>

              {/* Help Ellie know more about you! */}
              <div className="mb-6">
                <h3 className="font-nunito text-sm font-semibold text-ellieBlack mb-4">
                  Help Ellie know more about you!
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-nunito text-sm font-medium text-ellieBlack mb-2">
                      Company name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={disableInputs}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block font-nunito text-sm font-medium text-ellieBlack mb-2">
                      Your role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={disableInputs}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm disabled:opacity-60"
                    >
                      <option value="">Select your role</option>
                      <option value="ceo">CEO</option>
                      <option value="manager">Manager</option>
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-nunito text-sm font-medium text-ellieBlack mb-2">
                      Add a brief note about your company/role <span className="text-ellieGray">(Optional)</span>
                    </label>
                    <textarea
                      value={companyNote}
                      onChange={(e) => setCompanyNote(e.target.value)}
                      rows={2}
                      disabled={disableInputs}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm resize-none disabled:opacity-60"
                      placeholder="Enter your note here..."
                    />
                  </div>
                </div>
              </div>

              {/* How will you mostly use Ellie? */}
              <div>
                <h3 className="font-nunito text-sm font-semibold text-ellieBlack mb-4">
                  How will you mostly use Ellie? <span className="text-ellieGray font-normal">(Select one or more)</span>
                </h3>
                <div className="space-y-2">
                  {USE_CASE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUseCases.includes(option.value)}
                        onChange={() => toggleUseCase(option.value)}
                        disabled={disableInputs}
                        className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue disabled:opacity-60"
                      />
                      <span className="font-nunito text-sm text-ellieBlack">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-8 flex flex-col gap-3 justify-end items-end">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {statusMessage && (
              <div
                className={`w-full lg:w-auto rounded-lg border px-4 py-2 font-nunito text-sm ${
                  statusMessage.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-green-200 bg-green-50 text-green-700'
                }`}
              >
                {statusMessage.text}
              </div>
            )}
            {showInitialLoading && <p className="font-nunito text-sm text-ellieGray">Loading profile...</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

