import { useState, useRef } from 'react';
import { DashboardLayout } from '../sidebar';
import greenTickIcon from '../../assets/green white tick.png';

export function SettingsPage(): JSX.Element {
  const [autoJoinMeetings, setAutoJoinMeetings] = useState(true);
  const [showMeetingReminders, setShowMeetingReminders] = useState(false);
  const [notifyTranscriptsReady, setNotifyTranscriptsReady] = useState(true);
  const [notifyActionItems, setNotifyActionItems] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('english-usa');
  const [driveUrl, setDriveUrl] = useState('https://www.figma.com/design/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?...');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <DashboardLayout activeTab="/settings" userName="Mike Volkin" userEmail="mikevolkin@email.com">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-3 md:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-nunito text-xs font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </a>
              </li>
              <li className="text-ellieGray">/</li>
              <li className="text-ellieBlue">Settings</li>
            </ol>
          </nav>

          {/* Page Title with Save Changes Button */}
          <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack">
              Settings
            </h1>
            <button
              type="button"
              className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* General Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
              <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack mb-4 md:mb-6">
                General Settings
              </h2>
              
              <div className="space-y-4 md:space-y-6">
                {/* Auto-join Ellie for meetings */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                      Auto-join Ellie for meetings
                    </h3>
                    <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed">
                      Automatically allow Ellie to join your meetings and take notes when scheduled.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoJoinMeetings(!autoJoinMeetings)}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:ring-offset-2 ${
                      autoJoinMeetings ? 'bg-ellieBlue' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={autoJoinMeetings}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 md:h-6 md:w-6 transform rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        autoJoinMeetings ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show meeting reminders */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                      Show meeting reminders
                    </h3>
                    <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed">
                      Receive a reminder before your meeting starts so you're always prepared.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMeetingReminders(!showMeetingReminders)}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:ring-offset-2 ${
                      showMeetingReminders ? 'bg-ellieBlue' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={showMeetingReminders}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 md:h-6 md:w-6 transform rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        showMeetingReminders ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcription Settings - Swapped with Notification in desktop */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm lg:order-2">
              <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack mb-4 md:mb-6">
                Transcription Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                    Default Language
                  </label>
                  <p className="font-nunito text-xs md:text-sm text-ellieGray mb-3">
                    Please choose your default language.
                  </p>
                  <div className="relative">
                    <select
                      value={defaultLanguage}
                      onChange={(e) => setDefaultLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm md:text-base appearance-none pr-10"
                    >
                      <option value="english-usa">English USA</option>
                      <option value="english-uk">English UK</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="chinese">Chinese</option>
                      <option value="japanese">Japanese</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <span className="text-xl">🇺🇸</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings - Swapped with Transcription in desktop */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm lg:order-3">
              <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack mb-4 md:mb-6">
                Notification Settings
              </h2>
              
              <div className="space-y-4 md:space-y-6">
                {/* Notify when transcripts are ready */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                      Notify when transcripts are ready
                    </h3>
                    <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed">
                      Get a notification as soon as Ellie finishes processing your meeting notes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyTranscriptsReady(!notifyTranscriptsReady)}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:ring-offset-2 ${
                      notifyTranscriptsReady ? 'bg-ellieBlue' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={notifyTranscriptsReady}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 md:h-6 md:w-6 transform rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        notifyTranscriptsReady ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Notify for assigned action items */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                      Notify for assigned action items
                    </h3>
                    <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed">
                      Be alerted anytime a new task or follow-up is assigned to you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyActionItems(!notifyActionItems)}
                    className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:ring-offset-2 ${
                      notifyActionItems ? 'bg-ellieBlue' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={notifyActionItems}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 md:h-6 md:w-6 transform rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        notifyActionItems ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm lg:order-4">
              <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack mb-4 md:mb-6">
                Security Settings
              </h2>
              
              <div className="space-y-4">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 md:py-3 rounded-lg bg-ellieBlue text-white font-nunito text-sm md:text-base font-semibold hover:opacity-90 transition-opacity"
                >
                  Send via email
                </button>
                
                <div>
                  <label className="block font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 pr-10 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm md:text-base"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ellieGray hover:text-ellieBlack"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showPassword ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42L21 21M12 12l.01.01"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                    Re-enter new password
                  </label>
                  <div className="relative">
                    <input
                      type={showReEnterPassword ? 'text' : 'password'}
                      value={reEnterPassword}
                      onChange={(e) => setReEnterPassword(e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 pr-10 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm md:text-base"
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowReEnterPassword(!showReEnterPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ellieGray hover:text-ellieBlack"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showReEnterPassword ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42L21 21M12 12l.01.01"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full px-4 py-2.5 md:py-3 rounded-lg bg-ellieBlue text-white font-nunito text-sm md:text-base font-semibold hover:opacity-90 transition-opacity"
                >
                  Continue and Login
                </button>
              </div>
            </div>

            {/* Connected Drive for Recorded Meetings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
              <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack mb-4 md:mb-6">
                Connected Drive for Recorded Meetings
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="w-full px-4 py-2.5 md:py-3 pr-10 rounded-lg border border-gray-300 bg-white text-ellieBlack focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm md:text-base"
                    placeholder="Enter drive URL"
                  />
                  {driveUrl && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <img
                        src={greenTickIcon}
                        alt="Connected"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload documents/files */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm lg:col-span-2">
              <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack mb-4 md:mb-6">
                Upload documents/files
              </h2>
              
              <div className="space-y-4">
                <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed">
                  This would help Ellie understand and give relevant insights based of what you upload.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 md:p-12 text-center cursor-pointer hover:border-ellieBlue transition-colors"
                >
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-[#7864A0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <p className="font-nunito text-sm md:text-base text-ellieBlack font-medium">
                    Drop files here for Upload from computer
                  </p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                        >
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFiles = [...uploadedFiles];
                              newFiles.splice(index, 1);
                              setUploadedFiles(newFiles);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

