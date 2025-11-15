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
  markProfileSetupComplete,
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
      className={`rounded-[12px] px-6 py-[18px] text-left font-nunito text-[18px] font-semibold transition-all ${
        selected
          ? 'bg-ellieBlue text-white shadow-[0_15px_35px_rgba(50,122,173,0.25)]'
          : 'bg-[rgba(121,100,160,0.05)] text-ellieNavy hover:bg-ellieBlue/10'
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
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previousUrlRef = useRef<string | null>(null);

  const navigate = useNavigate();
  const { ensureFreshAccessToken, session } = useAuth();
  const { profile, isLoading: isProfileLoading, refreshProfile } = useProfile();
  const persistSetupFlag = () => {
    if (session?.userId) {
      markProfileSetupComplete(session.userId);
    }
  };
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    revokeObjectUrl();
    previousUrlRef.current = objectUrl;
    setAvatarPreview(objectUrl);
    setAvatarFile(file);
  };

  const handleRemoveAvatar = () => {
    revokeObjectUrl();
    setAvatarPreview(null);
    setAvatarFile(null);
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

    setFirstName(profile.first_name ?? '');
    setLastName(profile.last_name ?? '');
    setCompanyName(profile.company ?? '');
    setPosition(profile.position ?? '');
    setSelectedTeam(apiAudienceToLocal(profile.audience));
    setSelectedHelp(decodeMultiSelect(profile.company_notes, HELP_OPTION_VALUES));
    setSelectedGoals(decodeMultiSelect(profile.purpose, GOAL_OPTION_VALUES));
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
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`${apiBaseUrl}/accounts/me/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        let message = 'Unable to save your profile.';
        if (responseData && typeof responseData === 'object') {
          if (typeof responseData.error === 'string') {
            message = responseData.error;
          } else {
            const fieldErrors = Object.entries(responseData as Record<string, unknown>)
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

      persistSetupFlag();
      await refreshProfile();

      if (redirectToDashboard) {
        navigate('/dashboard', { replace: true });
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

  return (
    <div className="bg-white pb-[80px] pt-[40px] lg:pb-[120px] lg:pt-[60px]">
      <div className="container-ellie flex flex-col gap-[40px] lg:gap-[60px]">
        <div className="max-w-[760px]">
          <h1 className="font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[45px]">
            Setup Profile & Preferences
          </h1>
          <p className="mt-3 font-nunito text-[18px] leading-[1.5] text-[#545454] lg:text-[22px]">
            Let’s get Ellie personalized for your best experience.
          </p>
        </div>

        <div className="grid gap-[24px] lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
          {/* Profile Form */}
          <section className="flex flex-col gap-6 rounded-[18px] bg-[#F4F8FB] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)]">
            <div className="relative mx-auto flex h-[184px] w-[184px] items-center justify-center">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Profile avatar preview"
                    className="h-full w-full rounded-[18px] object-cover shadow-[0_10px_30px_rgba(20,20,20,0.15)]"
                  />
                  <button
                    type="button"
                    className="absolute left-3 bottom-3 h-[35px] w-[38px] transition hover:opacity-90"
                    aria-label="Change avatar"
                    onClick={handleUploadClick}
                    disabled={disableInputs}
                  >
                    <img src={uploadButtonGraphic} alt="" className="h-full w-full" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 h-[35px] w-[35px] transition hover:opacity-90"
                    aria-label="Remove avatar"
                    onClick={handleRemoveAvatar}
                    disabled={disableInputs}
                  >
                    <img src={removeButtonGraphic} alt="" className="h-full w-full" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[18px] border-2 border-dashed border-[#A7B0C5] bg-white text-center font-nunito text-[16px] text-ellieNavy transition hover:border-ellieBlue hover:bg-ellieBlue/5"
                  disabled={disableInputs}
                >
                  <span className="text-[34px]">📁</span>
                  <span className="font-extrabold">Upload profile photo</span>
                  <span className="text-[14px] text-[#7A86A1]">PNG or JPG (max 5MB)</span>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={disableInputs}
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={disableInputs}
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
              />
              <input
                type="text"
                placeholder="Company name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                disabled={disableInputs}
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
              />
              <input
                type="text"
                placeholder="Your position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                disabled={disableInputs}
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
              />
            </div>
          </section>

          {/* Preferences */}
          <section className="flex flex-col gap-6">
            <div className="rounded-[18px] bg-[rgba(121,100,160,0.05)] p-6">
              <h2 className="font-nunito text-[22px] font-bold text-ellieBlack lg:text-[25px]">
                Who are you setting Ellie up for?
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

            <div className="rounded-[18px] bg-[rgba(121,100,160,0.05)] p-6">
              <h2 className="font-nunito text-[22px] font-bold text-ellieBlack lg:text-[25px]">
                Where will Ellie help you the most?
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

            <div className="rounded-[18px] bg-[rgba(121,100,160,0.05)] p-6">
              <h2 className="font-nunito text-[22px] font-bold text-ellieBlack lg:text-[25px]">
                What are your top goals with Ellie?
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

            <div className="flex flex-col gap-4 rounded-[18px] bg-[rgba(121,100,160,0.05)] p-6">
              <button
                type="button"
                onClick={() => submitProfile(true)}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue disabled:cursor-not-allowed disabled:opacity-60 lg:text-[20px]"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={() => {
                  persistSetupFlag();
                  navigate('/dashboard');
                }}
                disabled={isSubmitting}
                className="font-nunito text-[18px] font-extrabold text-ellieNavy underline decoration-transparent transition hover:decoration-current disabled:opacity-50"
              >
                Skip for now?
              </button>

              {statusMessage && (
                <div
                  className={`rounded-[12px] border px-4 py-3 font-nunito text-[15px] ${
                    statusMessage.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-green-200 bg-green-50 text-green-700'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}
              {isProfileLoading && !profile && (
                <p className="font-nunito text-[15px] text-ellieGray">Loading your profile...</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

