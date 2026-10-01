import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import uploadButtonGraphic from '../../assets/profile-setup-uploadButton.svg';
import removeButtonGraphic from '../../assets/profile-setup-removeButton.svg';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import {
  apiAudienceToLocal,
  decodeMultiSelect,
  encodeMultiSelect,
  localAudienceToApi,
} from '../../utils/profileForm';

type Option = {
  value: string;
  label: string;
};

const TEAM_OPTIONS: Option[] = [
  { value: 'team', label: 'Company or team' },
  { value: 'personal', label: 'Personal Use' },
];

const HELP_OPTIONS: Option[] = [
  { value: 'internal', label: '📅 Internal team meetings' },
  { value: 'clients', label: '🤝 Client or sales calls' },
  { value: 'workshops', label: '🧑‍🏫 Workshops or training' },
  { value: 'brainstorm', label: '💡 Brainstorming sessions' },
  { value: 'reviews', label: '🗣 1-on-1s or performance reviews' },
  { value: 'interviews', label: '🧾 Interviews or research discussions' },
];

const GOAL_OPTIONS: Option[] = [
  { value: 'notes', label: '✅ Automatically take meeting notes' },
  { value: 'summaries', label: '🕒 Get concise meeting summaries' },
  { value: 'reminders', label: '🔔 Track and remind me of action items' },
  { value: 'share', label: '📂 Share summaries with my team' },
  { value: 'insights', label: '📊 Get insights or analytics from past meetings' },
];


function ChoiceButton({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-[16px] bg-white px-5 py-4 text-left font-dmSans text-[1rem] font-semibold text-ie-text transition-all focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ie-blue ${
        selected
          ? 'bg-ie-tBlue/50 ring-2 ring-inset ring-ie-blue'
          : 'ring-1 ring-inset ring-ie-line hover:bg-ie-bgAlt'
      }`}
    >
      {option.label}
    </button>
  );
}

const HELP_OPTION_VALUES = HELP_OPTIONS.map((option) => option.value);
const GOAL_OPTION_VALUES = GOAL_OPTIONS.map((option) => option.value);

export function SetupProfilePage(): JSX.Element {
  const [selectedTeam, setSelectedTeam] = useState<'team' | 'personal'>('team');
  const [selectedHelp, setSelectedHelp] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previousUrlRef = useRef<string | null>(null);
  const hasInitializedFieldsRef = useRef(false);

  const navigate = useNavigate();
  const { ensureFreshAccessToken } = useAuth();
  const { profile, isLoading: isProfileLoading, refreshProfile } = useProfile();
  const apiBaseUrl = getApiBaseUrl();

  const toggleHelp = (value: string) => {
    setSelectedHelp((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleGoal = (value: string) => {
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

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
    // Auto-save avatar removal - saveAvatarOnly handles state updates
    await saveAvatarOnly(null, true);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

    // Only sync all fields on initial load to avoid wiping user input
    if (!hasInitializedFieldsRef.current) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setCompanyName(profile.company ?? '');
      setPosition(profile.position ?? '');
      setSelectedTeam(apiAudienceToLocal(profile.audience));
      setSelectedHelp(decodeMultiSelect(profile.company_notes, HELP_OPTION_VALUES));
      setSelectedGoals(decodeMultiSelect(profile.purpose, GOAL_OPTION_VALUES));
      hasInitializedFieldsRef.current = true;
    }

    // Always update avatar preview when profile changes (after avatar save)
    revokeObjectUrl();
    setAvatarPreview(profile.avatar_url ?? null);
    setAvatarFile(null);
  }, [profile]);

  const submitProfile = async (redirectToDashboard: boolean) => {
    if (!apiBaseUrl) {
      setStatusMessage({ type: 'error', text: 'API base URL is not configured.' });
      return;
    }

    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }

      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('company', companyName.trim());
      formData.append('position', position.trim());
      formData.append('audience', localAudienceToApi(selectedTeam));
      formData.append('company_notes', encodeMultiSelect(selectedHelp));
      formData.append('purpose', encodeMultiSelect(selectedGoals));
      // Set first_login to false after profile setup
      // Keep show_tour as true so the tour shows after redirecting to dashboard
      formData.append('first_login', 'false');
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
        let message = 'Unable to save your profile.';
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

      setStatusMessage({ type: 'success', text: 'Profile saved successfully!' });

      await refreshProfile();

      if (redirectToDashboard) {
        navigate('/connect-integrations', { replace: true });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong while saving your profile.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableInputs = isSubmitting;
  const disableAvatarButtons = isSubmitting || isSavingAvatar;

  return (
    <div className="ie-page pb-[80px] pt-[32px] lg:pb-[110px] lg:pt-[56px]">
      <div className="ie-wrap flex flex-col gap-10 lg:gap-[56px]">
        <div className="max-w-[760px]">
          <h1 className="ie-title">
            Setup Profile & Preferences
          </h1>
          <p className="ie-lede mt-4">
            Let’s get Ellie personalized for your best experience.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
          {/* Profile Form */}
          <section className="ie-card flex flex-col gap-6 p-6 lg:p-7">
            <div className="relative mx-auto flex h-[184px] w-[184px] items-center justify-center">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Profile avatar preview"
                    className="h-full w-full rounded-[20px] object-cover ring-1 ring-ie-line shadow-[0_16px_36px_-20px_rgba(27,36,72,0.45)]"
                  />
                  <button
                    type="button"
                    className="absolute left-3 bottom-3 h-[35px] w-[38px] transition hover:opacity-90"
                    aria-label="Change avatar"
                    onClick={handleUploadClick}
                    disabled={disableAvatarButtons}
                  >
                    <img src={uploadButtonGraphic} alt="" className="h-full w-full" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 h-[35px] w-[35px] transition hover:opacity-90"
                    aria-label="Remove avatar"
                    onClick={handleRemoveAvatar}
                    disabled={disableAvatarButtons}
                  >
                    <img src={removeButtonGraphic} alt="" className="h-full w-full" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-[rgba(34,47,97,0.22)] bg-ie-bgAlt text-center text-[0.95rem] text-ie-text transition hover:border-ie-blue hover:bg-ie-tBlue/50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={disableAvatarButtons}
                >
                  <span className="text-[34px]">📁</span>
                  <span className="font-semibold">Upload profile photo</span>
                  <span className="text-[0.85rem] text-ie-muted">PNG or JPG (max 5MB)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={disableInputs}
                className="ie-input"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={disableInputs}
                className="ie-input"
              />
              <input
                type="text"
                placeholder="Company name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                disabled={disableInputs}
                className="ie-input"
              />
              <input
                type="text"
                placeholder="Your position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                disabled={disableInputs}
                className="ie-input"
              />
            </div>
          </section>

          {/* Preferences */}
          <section className="flex flex-col gap-6">
            <div className="ie-card p-6 lg:p-7">
              <h2 className="ie-subtitle">
                Who are you setting Ellie up for?
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {TEAM_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    option={option}
                    selected={selectedTeam === option.value}
                    onSelect={() => {
                      if (disableInputs) return;
                      setSelectedTeam(option.value as 'team' | 'personal');
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="ie-card p-6 lg:p-7">
              <h2 className="ie-subtitle">
                Where will Ellie help you the most?
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {HELP_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    option={option}
                    selected={selectedHelp.includes(option.value)}
                    onSelect={() => {
                      if (disableInputs) return;
                      toggleHelp(option.value);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="ie-card p-6 lg:p-7">
              <h2 className="ie-subtitle">
                What are your top goals with Ellie?
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {GOAL_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    option={option}
                    selected={selectedGoals.includes(option.value)}
                    onSelect={() => {
                      if (disableInputs) return;
                      toggleGoal(option.value);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="ie-card flex flex-col gap-4 p-6 lg:p-7">
              <button
                type="button"
                onClick={() => submitProfile(true)}
                disabled={isSubmitting}
                className="ie-btn-primary w-full py-[17px] text-[1.05rem]"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>

              {statusMessage && (
                <div
                  className={statusMessage.type === 'error' ? 'ie-error' : 'ie-success'}
                  role={statusMessage.type === 'error' ? 'alert' : 'status'}
                >
                  {statusMessage.text}
                </div>
              )}
              {isProfileLoading && !profile && (
                <p className="text-[0.95rem] text-ie-muted">Loading your profile...</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

