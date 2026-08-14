import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import d1Icon from '../../assets/d1.jpg';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import {
  WorkspaceRecord,
  listWorkspaces,
} from '../workspace/workspaceApi';
import { listActivities, ActivityRecord } from '../../services/activityApi';
import { DemoTour } from '../demo';

/**
 * Get the recallai backend base URL from environment variable
 */
function getRecallaiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (typeof raw !== 'string' || !raw.trim()) {
    console.warn(
      'VITE_RECALLAI_BASE_URL is not configured. Please set it in your .env file to your backend server URL (e.g., http://16.16.183.96:3003)'
    );
    return null;
  }
  const url = raw.trim().replace(/\/$/, ''); // Remove trailing slash
  return url;
}

/**
 * Build API URL for recallai backend
 */
function buildRecallaiUrl(path: string): string | null {
  const baseUrl = getRecallaiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

interface ActivityItem {
  id: string;
  type: string;
  link: string;
  date: string;
  time: string;
  description?: string;
}

const CREATE_WORKSPACE_ILLUSTRATION = '/assets/dashboard/create-workspace-illustration.svg';
const JOIN_MEETING_ILLUSTRATION = '/assets/dashboard/join-meeting-illustration.svg';


export function DashboardPage(): JSX.Element {
  const location = useLocation();
  const { ensureFreshAccessToken } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const apiBaseUrl = getApiBaseUrl();
  const [meetingId, setMeetingId] = useState('');
  
  // Determine first-time tour state based on API flag
  const firstTimeTourOpen = profile?.show_tour === true;
  
  // Get display name for welcome message
  const displayName = useMemo(() => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.email) {
      // Extract name from email (part before @)
      return profile.email.split('@')[0];
    }
    return 'there';
  }, [profile]);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);
  const [joinMeetingError, setJoinMeetingError] = useState<string | null>(null);
  const [joinMeetingSuccess, setJoinMeetingSuccess] = useState<string | null>(null);
  const [isJoinMeetingModalOpen, setIsJoinMeetingModalOpen] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [meetingNameError, setMeetingNameError] = useState<string | null>(null);
  const [joinMeetingWorkspaceId, setJoinMeetingWorkspaceId] = useState<string | null>(null);

  // Format activity from API to ActivityItem format
  const formatActivity = (activity: ActivityRecord): ActivityItem => {
    const date = new Date(activity.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      id: String(activity.id),
      type: activity.activity_type_display || activity.activity_type,
      link: '#',
      date: formattedDate,
      time: formattedTime,
      description: activity.description || undefined,
    };
  };

  // Fetch activities
  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async (): Promise<void> => {
      setIsActivitiesLoading(true);
      setActivitiesError(null);
      try {
        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate. Please login again.');
        }
        const response = await listActivities(token, {
          ordering: '-timestamp', // Order by most recent first
          page: 1,
        });
        if (isMounted) {
          // Take only the first 3 activities and format them
          const formattedActivities = response.results
            .slice(0, 3)
            .map((activity) => formatActivity(activity));
          setRecentActivity(formattedActivities);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : 'Unable to load activities. Please try again.';
          setActivitiesError(message);
          // Set empty array on error
          setRecentActivity([]);
        }
      } finally {
        if (isMounted) {
          setIsActivitiesLoading(false);
        }
      }
    };

    void fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [ensureFreshAccessToken]);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkspaces = async (): Promise<void> => {
      setIsWorkspacesLoading(true);
      setWorkspacesError(null);
      try {
        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate. Please login again.');
        }
        const response = await listWorkspaces(token, { pageSize: 50, ordering: 'name' });
        if (isMounted) {
          setWorkspaces(response.results);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : 'Unable to load workspaces. Please try again.';
          setWorkspacesError(message);
        }
      } finally {
        if (isMounted) {
          setIsWorkspacesLoading(false);
        }
      }
    };

    void fetchWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [ensureFreshAccessToken]);

  const openJoinMeetingModal = (): void => {
    const trimmedId = meetingId.trim();
    if (!trimmedId) {
      setJoinMeetingError('Please enter a meeting link or ID first');
      return;
    }
    setJoinMeetingError(null);
    setJoinMeetingSuccess(null);
    setMeetingNameError(null);
    setIsJoinMeetingModalOpen(true);

    const lastWorkspaceId = localStorage.getItem('lastSelectedJoinMeetingWorkspaceId');
    if (lastWorkspaceId && workspaces.some((w) => w.id === lastWorkspaceId)) {
      setJoinMeetingWorkspaceId(lastWorkspaceId);
    } else if (workspaces.length > 0) {
      setJoinMeetingWorkspaceId(workspaces[0].id);
    }
  };

  const closeJoinMeetingModal = (): void => {
    setIsJoinMeetingModalOpen(false);
    setMeetingName('');
    setMeetingNameError(null);
    setJoinMeetingWorkspaceId(null);
  };

  const handleJoinMeeting = async (): Promise<void> => {
    const trimmedId = meetingId.trim();
    const trimmedName = meetingName.trim();
    
    if (!trimmedId) {
      setJoinMeetingError('Please enter a meeting link or ID');
      return;
    }
    
    if (!trimmedName) {
      setMeetingNameError('Meeting name is required');
      return;
    }
    
    setIsJoiningMeeting(true);
    setJoinMeetingError(null);
    setJoinMeetingSuccess(null);
    setMeetingNameError(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }

      let meetingUrl = trimmedId;
      if (!trimmedId.startsWith('http://') && !trimmedId.startsWith('https://')) {
        meetingUrl = trimmedId;
      }

      const requestBody: {
        meeting_url: string;
        meeting_name: string;
        workspace_id?: string;
      } = {
        meeting_url: meetingUrl,
        meeting_name: trimmedName,
      };

      if (joinMeetingWorkspaceId) {
        requestBody.workspace_id = joinMeetingWorkspaceId;
      }
      
      // Call the recall server API to join meeting immediately
      // The endpoint exists in the recall server, not in Invite-ellie-backend
      const recallaiUrl = buildRecallaiUrl('/api/join-meeting');
      if (!recallaiUrl) {
        throw new Error('Recall server URL is not configured. Please set VITE_RECALLAI_BASE_URL in your .env file.');
      }
      
      console.log('Joining meeting - API URL:', recallaiUrl);
      console.log('Join meeting request body:', requestBody);
      
      const response = await fetch(recallaiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial page
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join meeting');
      }
      
      if (data.success) {
        if (joinMeetingWorkspaceId) {
          localStorage.setItem('lastSelectedJoinMeetingWorkspaceId', joinMeetingWorkspaceId);
        }

        setJoinMeetingSuccess('Bot is joining the meeting now!');
        setMeetingId(''); // Clear the input
        setMeetingName(''); // Clear the meeting name
        closeJoinMeetingModal(); // Close the modal
        // Don't redirect - just show success notification on dashboard
      } else {
        throw new Error(data.error || 'Failed to join meeting');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to join meeting. Please try again.';
      setJoinMeetingError(message);
    } finally {
      setIsJoiningMeeting(false);
    }
  };

  const handleJoinMeetingKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      openJoinMeetingModal();
    }
  };

  const handleMeetingNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleJoinMeeting();
    }
  };

  // const handleViewActivity = (item: ActivityItem): void => {
  //   // Navigate to meeting view with the link
  //   navigate(`/meeting-view?link=${encodeURIComponent(item.link)}`);
  // };

  // const handleDeleteActivity = (itemId: string): void => {
  //   // Remove the activity item from the list
  //   setRecentActivity((prev) => prev.filter((item) => item.id !== itemId));
  // };

  // Demo query handling: /dashboard?demo1, ?demo2 ... or ?demo=1..4
  const { demoOpen, demoStep } = useMemo(() => {
    const search = location.search || '';
    let step: number | null = null;
    // handle ?demo=1..4
    const params = new URLSearchParams(search);
    const paramDemo = params.get('demo');
    if (paramDemo) {
      const n = Number(paramDemo);
      if (!Number.isNaN(n)) step = Math.min(Math.max(n, 1), 4);
    }
    // handle ?demo1 style (no '=' key/value)
    if (step == null) {
      const m = search.match(/[\?&]demo([1-4])\b/i);
      if (m) step = Number(m[1]);
    }
    return {
      demoOpen: step != null,
      demoStep: step != null ? step - 1 : 0, // convert to 0-based
    };
  }, [location.search]);
  return (
    <React.Fragment>
      <DashboardLayout activeTab="/dashboard">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-3 md:mb-4 lg:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <Link to="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">SUBMENU</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            Welcome, {displayName}!
          </h1>

          <section className="flex flex-col lg:flex-row gap-6 mb-6 lg:mb-8">
            <article className="flex w-full lg:w-[40%] items-center gap-6 rounded-[10px] bg-white px-8 py-6 shadow-[0px_18px_30px_rgba(15,23,42,0.05)]">
              <img
                src={CREATE_WORKSPACE_ILLUSTRATION}
                alt="Illustration of a person creating a workspace"
                className="h-[77px] w-[109px]"
              />
              <div className="space-y-2 flex-1">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                  Create a Workspace
                </h2>
                <p className="max-w-[280px] font-nunito text-[20px] font-medium leading-[1.36] text-[#545454]">
                  Start with creating a workspace for office, a project or an idea.
                </p>
                <Link
                  to="/create-workspace"
                  className="inline-flex mt-4 items-center justify-center rounded-[5px] bg-[#327AAD] px-6 py-3 font-nunito text-base font-extrabold text-white transition hover:bg-[#286996]"
                >
                  Create Workspace
                </Link>
              </div>
            </article>

            <article className="flex w-full lg:w-[60%] items-center gap-8 rounded-[10px] bg-white px-8 py-6 shadow-[0px_18px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center">
                <img
                  src={JOIN_MEETING_ILLUSTRATION}
                  alt="Illustration of people joining a meeting"
                  className="h-[87px] w-[108px]"
                />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                  Join a meeting.
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        id="meeting-id"
                        type="text"
                        placeholder="Enter meeting link or ID"
                        value={meetingId}
                        onChange={(e) => {
                          setMeetingId(e.target.value);
                          setJoinMeetingError(null);
                          setJoinMeetingSuccess(null);
                        }}
                        onKeyDown={handleJoinMeetingKeyDown}
                        disabled={isJoiningMeeting}
                        className="h-[60px] w-full rounded-[5px] border border-[#7964A0] bg-white px-6 font-nunito text-[20px] font-semibold text-[#25324B] placeholder:text-[#25324B]/40 focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openJoinMeetingModal()}
                      disabled={isJoiningMeeting || !meetingId.trim()}
                      className="inline-flex h-[60px] items-center justify-center rounded-[5px] bg-[#327AAD] px-12 font-nunito text-[20px] font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Join now
                    </button>
                  </div>
                  {joinMeetingError && (
                    <div className="rounded-[8px] px-3 py-2 font-nunito text-sm border border-red-200 bg-red-50 text-red-700">
                      {joinMeetingError}
                    </div>
                  )}
                  {joinMeetingSuccess && (
                    <div className="rounded-[8px] px-3 py-2 font-nunito text-sm border border-green-200 bg-green-50 text-green-700">
                      {joinMeetingSuccess}
                    </div>
                  )}
                </div>
              </div>
            </article>
          </section>

          <section className="flex flex-col gap-8 lg:flex-row lg:gap-4">
            <div className="flex flex-col gap-6 rounded-[18px] bg-white px-8 py-8 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] lg:w-[55%]">
              <div className="flex items-center justify-between">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                  Your Workspaces
                </h2>
                <Link
                  to="/create-workspace"
                  className="inline-flex items-center justify-center rounded-[5px] bg-[#327AAD] px-6 py-2 font-nunito text-sm font-extrabold text-white transition hover:bg-[#286996]"
                >
                  + New Workspace
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isWorkspacesLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`ws-skeleton-${index}`}
                      className="flex animate-pulse flex-col gap-4 rounded-[12px] bg-[rgba(50,122,173,0.05)] px-6 py-6 text-center"
                    >
                      <div className="mx-auto h-12 w-12 rounded-full bg-white/60" />
                      <div className="mx-auto h-4 w-24 rounded bg-white/70" />
                    </div>
                  ))
                ) : workspacesError ? (
                  <div className="col-span-full rounded-[12px] border border-red-100 bg-red-50 px-4 py-6 text-center font-nunito text-sm text-red-600">
                    {workspacesError}
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="col-span-full rounded-[12px] border border-dashed border-[#327AAD]/30 px-4 py-6 text-center font-nunito text-sm text-[#25324B]">
                    No workspaces yet. Create one to get started.
                  </div>
                ) : (
                  workspaces.map((ws) => (
                    <Link
                      key={ws.id}
                      to={`/workspace/${ws.id}`}
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-[12px] bg-[rgba(50,122,173,0.05)] px-6 py-6 text-center transition hover:bg-[rgba(50,122,173,0.1)] no-underline"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#327AAD]/10">
                        <img src={d1Icon} alt="" className="h-6 w-6 object-contain" />
                      </div>
                      <span className="block font-nunito text-[18px] font-bold tracking-[-0.02em] text-[#25324B] leading-[1.36]">
                        {ws.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <aside className="flex w-full flex-col gap-6 rounded-[18px] bg-white px-8 py-8 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] lg:w-[45%]">
              <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">Recent Activity</h2>
              <div className="overflow-hidden rounded-[14px]">
                {isActivitiesLoading ? (
                  <div className="px-3 py-6 text-center font-nunito text-sm text-[#545454]">
                    Loading activities...
                  </div>
                ) : activitiesError ? (
                  <div className="px-3 py-6 text-center font-nunito text-sm text-red-600">
                    {activitiesError}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="px-3 py-6 text-center font-nunito text-sm text-[#545454]">
                    No recent activity
                  </div>
                ) : (
                  <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-[#F4F8FB]">
                      <tr className="text-left font-nunito text-sm font-semibold tracking-[-0.02em] text-[#25324B]">
                        <th className="px-3 py-2 w-[60%]">Activity Type</th>
                        <th className="px-3 py-2 w-[40%]">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white font-nunito text-[#25324B]">
                      {recentActivity.map((item) => (
                        <tr key={item.id} className="border-b border-[rgba(102,0,255,0.2)] last:border-0">
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <span className="font-nunito text-sm font-bold tracking-[-0.02em] text-[#25324B]">
                                {item.type}
                              </span>
                              {item.description && (
                                <span className="font-nunito text-xs font-medium text-[#545454]">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1 font-nunito text-xs font-medium text-[#545454]">
                              <span className="tracking-[-0.02em] text-[#25324B]">{item.date}</span>
                              <span>{item.time}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
      {/* Join Meeting Modal */}
      {isJoinMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-sm rounded-[30px] bg-white p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex items-start justify-end">
              <button
                type="button"
                onClick={closeJoinMeetingModal}
                className="text-red-500 transition hover:scale-105 disabled:opacity-60"
                aria-label="Close dialog"
                disabled={isJoiningMeeting}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="font-nunito text-2xl font-extrabold text-[#111928]">Join Meeting</h3>
            <p className="mt-2 font-nunito text-sm text-[#5F6B7A]">
              Enter a meeting name and select a workspace to organize this meeting.
            </p>
            <div className="my-5 border-t border-[#E6E9F2]" />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleJoinMeeting();
              }}
              className="space-y-4 text-left"
            >
              <label className="flex flex-col gap-2 font-nunito text-sm font-semibold text-[#25324B]">
                Meeting Name
                <input
                  type="text"
                  value={meetingName}
                  onChange={(event) => {
                    setMeetingName(event.target.value);
                    setMeetingNameError(null);
                  }}
                  onKeyDown={handleMeetingNameKeyDown}
                  className="rounded-[10px] border border-[#A3AED0] px-4 py-3 font-normal text-[#25324B] placeholder:text-[#A3AED0] focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/30"
                  autoFocus
                  disabled={isJoiningMeeting}
                  placeholder="e.g., Team Standup, Client Call"
                />
              </label>
              {meetingNameError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 font-nunito text-sm text-red-600">
                  {meetingNameError}
                </p>
              )}
              
              {/* Workspace Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-nunito text-sm font-semibold text-[#25324B]">
                  Workspace: <span className="text-xs font-normal text-[#6B7A96]">(Optional)</span>
                </label>
                {isWorkspacesLoading ? (
                  <div className="rounded-[10px] border border-[#A3AED0] px-4 py-3 font-nunito text-sm text-[#6B7A96]">
                    Loading workspaces...
                  </div>
                ) : workspaces.length > 0 ? (
                  <div className="relative">
                    <select
                      value={joinMeetingWorkspaceId || ''}
                      onChange={(event) => {
                        const newWorkspaceId = event.target.value || null;
                        setJoinMeetingWorkspaceId(newWorkspaceId);
                        if (newWorkspaceId) {
                          localStorage.setItem('lastSelectedJoinMeetingWorkspaceId', newWorkspaceId);
                        } else {
                          localStorage.removeItem('lastSelectedJoinMeetingWorkspaceId');
                        }
                      }}
                      className="w-full appearance-none rounded-[10px] border border-[#A3AED0] bg-white px-4 py-3 pr-10 font-nunito text-sm font-normal text-[#25324B] focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/30"
                      disabled={isJoiningMeeting}
                    >
                      <option value="">Select a workspace (Optional)</option>
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg
                        className="h-5 w-5 text-[#327AAD]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-nunito text-[#6B7A96]">
                    No workspaces found.
                  </p>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-[10px] border border-[#E6E9F2]">
                <label className="font-nunito text-xs font-semibold uppercase tracking-wide text-[#6B7A96] mb-1 block">
                  Meeting Link
                </label>
                <p className="font-nunito text-sm text-[#25324B] break-all">
                  {meetingId.trim() || 'No link entered'}
                </p>
              </div>
              {joinMeetingError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 font-nunito text-sm text-red-600">
                  {joinMeetingError}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeJoinMeetingModal}
                  className="rounded-[10px] border border-[#B7C0D6] px-5 py-2 font-nunito text-sm font-semibold text-[#1F2A44] transition hover:bg-[#F7F8FC]"
                  disabled={isJoiningMeeting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#327AAD] px-5 py-3 font-nunito text-base font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60"
                  disabled={isJoiningMeeting || !meetingName.trim()}
                >
                  {isJoiningMeeting ? 'Joining...' : 'Join Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DemoTour
        defaultOpen={demoOpen || firstTimeTourOpen}
        initialStep={demoStep}
        onClose={async () => {
          // Update show_tour flag to false when tour is closed
          if (apiBaseUrl && profile?.show_tour === true) {
            try {
              const token = await ensureFreshAccessToken();
              if (token) {
                const formData = new FormData();
                formData.append('show_tour', 'false');
                await fetch(`${apiBaseUrl}/accounts/me/`, {
                  method: 'PATCH',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                });
                await refreshProfile();
              }
            } catch {
              // Ignore errors - tour will still close
            }
          }
        }}
      />
      
      </DashboardLayout>
    </React.Fragment>
  );
}


