import { useState, useRef } from 'react';
import { DashboardLayout } from '../sidebar';
import mikeImage from '../../assets/mike.jpg';
import removeButtonIcon from '../../assets/profile-setup-removeButton.svg';
import greenTickIcon from '../../assets/green white tick.png';
import microsoftIcon from '../../assets/microsoft-icon.png';

export function PreferencesPage(): JSX.Element {
  const [firstName, setFirstName] = useState('Mike');
  const [lastName, setLastName] = useState('Volkin');
  const [usageType, setUsageType] = useState<'company' | 'personal'>('company');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [companyNote, setCompanyNote] = useState('');
  const [profileImage, setProfileImage] = useState(mikeImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <DashboardLayout activeTab="/preferences" userName="Mike Volkin" userEmail="mikevolkin@email.com">
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
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Remove profile picture"
                    onClick={() => setProfileImage(mikeImage)}
                  >
                    <img
                      src={removeButtonIcon}
                      alt="Remove"
                      className="w-4 h-4 object-contain"
                    />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Upload Image
                </button>
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Microsoft Account Connection */}
              <div className="mb-6 flex items-center gap-2">
                <img
                  src={microsoftIcon}
                  alt="Microsoft"
                  className="w-5 h-5 object-contain"
                />
                <span className="font-nunito text-sm font-medium text-ellieBlack">
                  Microsoft Account Connected
                </span>
                <img
                  src={greenTickIcon}
                  alt="Connected"
                  className="w-5 h-5 object-contain"
                />
              </div>

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
                    className={`flex-1 px-4 py-2.5 rounded-lg font-nunito text-sm font-semibold transition-colors ${
                      usageType === 'company'
                        ? 'bg-ellieBlue text-white'
                        : 'bg-white text-ellieGray border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Company or team
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsageType('personal')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-nunito text-sm font-semibold transition-colors ${
                      usageType === 'personal'
                        ? 'bg-ellieBlue text-white'
                        : 'bg-white text-ellieGray border border-gray-300 hover:border-gray-400'
                    }`}
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-nunito text-sm font-medium text-ellieBlack mb-2">
                      Your role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm resize-none"
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue"
                    />
                    <span className="font-nunito text-sm text-ellieBlack">Meeting notes and transcriptions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue"
                    />
                    <span className="font-nunito text-sm text-ellieBlack">Action items and follow-ups</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue"
                    />
                    <span className="font-nunito text-sm text-ellieBlack">Team collaboration</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue"
                    />
                    <span className="font-nunito text-sm text-ellieBlack">Client meetings</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

