import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import searchIcon from '../../assets/Vector.png';
import notificationsIcon from '../../assets/noti.png';
import { useAuth } from '../../context/AuthContext';
import defaultAvatar from '../../assets/user.png';

export interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DashboardHeader({
  userName,
  userEmail,
  userAvatar,
}: DashboardHeaderProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side: Logo and Search (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 flex-1">
            {/* Logo and Tagline */}
            <Link to="/" className="flex items-center gap-4 flex-shrink-0">
              <img src={logo} alt="Invite Ellie" className="h-12 w-12" />
              <div className="flex flex-col">
                <span className="font-spaceGrotesk text-2xl font-bold tracking-tight leading-tight">
                  <span className="text-ellieBlue">Invite</span>{' '}
                  <span className="text-[#7864A0]">Ellie</span>
                </span>
                <span className="font-inter text-sm text-ellieGray leading-tight">
                  For unforgettable meetings
                </span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative ml-4">
              <input
                type="text"
                placeholder="Search for meetings, notes, transcriptions....."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm"
              />
              <img
                src={searchIcon}
                alt="Search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 object-contain"
              />
            </div>
          </div>

          {/* Mobile: Hamburger Menu and Logo in Center */}
          <div className="lg:hidden flex-1 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new Event('toggleMobileMenu'));
              }}
              className="p-2 text-ellieBlue flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link to="/" className="flex items-center flex-1 justify-center">
              <img src={logo} alt="Invite Ellie" className="h-10 w-10" />
            </Link>
          </div>

          {/* Right Side: Notifications, User Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Notification Icon with Rectangle Container */}
            <button
              type="button"
              className="relative p-1 rounded-lg bg-blue-50 hover:opacity-80 transition-opacity"
              aria-label="Notifications"
            >
              <img
                src={notificationsIcon}
                alt="Notifications"
                className="w-5 h-5 object-contain"
              />
              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2"
              >
                {(userName || userEmail) && (
                  <div className="hidden lg:flex flex-col items-start">
                    {userName && (
                      <span className="font-nunito text-sm font-semibold text-ellieBlack leading-tight">
                        {userName}
                      </span>
                    )}
                    {userEmail && (
                      <span className="font-nunito text-xs text-ellieGray leading-tight">
                        {userEmail}
                      </span>
                    )}
                  </div>
                )}
                <img
                  src={userAvatar ?? defaultAvatar}
                  alt={userName ?? 'User avatar'}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                {/* Dropdown Icon */}
                <svg
                  className="w-4 h-4 text-ellieGray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
                {isDropdownOpen && (
                 <div className="absolute right-0 mt-2 w-80 rounded-[10px] border border-[#E3E7F2] bg-white p-5 shadow-[0_25px_55px_rgba(31,47,70,0.14)] z-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={userAvatar ?? defaultAvatar}
                      alt={userName ?? 'User avatar'}
                      className="h-12 w-12 rounded-[8px] object-cover"
                    />
                    <div className="flex flex-col">
                      {userName && (
                        <span className="font-nunito text-base font-extrabold text-[#111928]">
                          {userName}
                        </span>
                      )}
                      {userEmail && (
                        <span className="font-nunito text-sm text-[#6B7A96]">{userEmail}</span>
                      )}
                    </div>
                  </div>
                  <div className="my-4 h-px w-full bg-[#D7E2F0]" />
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/preferences"
                      onClick={() => setIsDropdownOpen(false)}
                      className="rounded-[8px] bg-[#F8F7FC] px-4 py-3 font-nunito text-sm font-bold text-[#111928] transition hover:bg-[#F0EDFC]"
                    >
                      Profile & Preferences
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="rounded-[8px] bg-[#F8F7FC] px-4 py-3 font-nunito text-sm font-bold text-[#111928] transition hover:bg-[#F0EDFC]"
                    >
                      Settings
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 w-full rounded-[8px] bg-[#F8F7FC] px-4 py-3 font-nunito text-sm font-bold text-[#C62828] transition hover:bg-[#FDEEEF]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

