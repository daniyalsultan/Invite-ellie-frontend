import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import dashboardIcon from '../../assets/dashboard.png';
import workspaceIcon from '../../assets/workspace.png';
import transcriptionIcon from '../../assets/transcription.png';
import logo from '../../assets/logo.svg';
// import manageRecordingsIcon from '../../assets/manage recordings.png';
import notificationsIcon from '../../assets/notifications.png';
import preferencesIcon from '../../assets/preferences.png';
import integrationsIcon from '../../assets/integrations.png';
import exportIcon from '../../assets/icon-share.png';
import settingsIcon from '../../assets/settings.png';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  activeTab?: string;
}

interface SidebarItem {
  label: string;
  path: string;
  icon: string;
  hasNotification?: boolean;
}

export function Sidebar({ activeTab }: SidebarProps): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = activeTab || location.pathname;
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Listen for mobile menu toggle event from header
  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggleMobileMenu', handleToggle);
    return () => window.removeEventListener('toggleMobileMenu', handleToggle);
  }, []);

  // Top 4 items
  const topItems: SidebarItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: dashboardIcon },
    { label: 'Work Spaces', path: '/workspaces', icon: workspaceIcon },
    { label: 'Transcriptions', path: '/transcriptions', icon: transcriptionIcon },
    { label: 'Ellie Meeting Assistant', path: '/ask-ellie', icon: logo },
    // { label: 'Meeting Recordings', path: '/meeting-recordings', icon: manageRecordingsIcon },
  ];

  // Bottom 4 items
  const bottomItems: SidebarItem[] = [
    { label: 'Notifications', path: '/notifications', icon: notificationsIcon, hasNotification: true },
    { label: 'Preferences', path: '/preferences', icon: preferencesIcon },
    { label: 'Integrations', path: '/integrations', icon: integrationsIcon },
    { label: 'Slack Notion Export', path: '/slack-notion-export', icon: exportIcon },
    { label: 'Settings', path: '/settings', icon: settingsIcon },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    if (path === '/workspaces') {
      return currentPath.startsWith('/workspaces');
    }
    return currentPath.startsWith(path);
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const active = isActive(item.path);
    return (
      <li key={item.path}>
        <Link
          to={item.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg font-nunito text-sm font-medium transition-colors
            ${
              active
                ? 'bg-ellieBlue text-white'
                : 'bg-gray-100 text-ellieBlack hover:bg-gray-200'
            }
          `}
        >
          <img
            src={item.icon}
            alt={`${item.label} icon`}
            className="w-5 h-5 object-contain"
            style={
              active
                ? { filter: 'brightness(0) invert(1)', opacity: 1 }
                : { opacity: 0.7 }
            }
          />
          <span>{item.label}</span>
          {item.hasNotification && (
            <span
              className={`w-2 h-2 rounded-full ${
                active ? 'bg-white' : 'bg-orange-500'
              }`}
            ></span>
          )}
        </Link>
      </li>
    );
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-gray-100 border-r border-gray-200 h-full flex flex-col
          fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="flex-1 py-6 px-4 flex flex-col justify-between">
          {/* Top 4 items */}
          <ul className="space-y-1">
            {topItems.map(renderSidebarItem)}
          </ul>

          {/* Bottom 4 items */}
          <div className="space-y-4">
            <ul className="space-y-1">
              {bottomItems.map(renderSidebarItem)}
            </ul>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 font-nunito text-sm font-medium text-ellieBlack transition-colors hover:bg-gray-200"
            >
              <svg
                className="h-5 w-5 text-ellieBlack opacity-70"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25L19.5 12l-3.75 3.75" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12H8.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5a7.5 7.5 0 110-15" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

