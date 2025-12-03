import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar } from './Sidebar';
import searchIcon from '../../assets/Vector.png';
import { useProfile } from '../../context/ProfileContext';
import reactLogo from '../../assets/user.png';

export interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DashboardLayout({
  children,
  activeTab,
  userName,
  userEmail,
  userAvatar,
}: DashboardLayoutProps): JSX.Element {
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const derivedName =
    userName ??
    ([profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || undefined);
  const derivedEmail = userEmail ?? profile?.email ?? undefined;
  const derivedAvatar = userAvatar ?? profile?.avatar_url ?? reactLogo;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader userName={derivedName} userEmail={derivedEmail} userAvatar={derivedAvatar} />
      
      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 py-3 bg-white">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for meetings, notes, transcriptions....."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-sm"
          />
          <img
            src={searchIcon}
            alt="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 object-contain pointer-events-none"
          />
        </form>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

