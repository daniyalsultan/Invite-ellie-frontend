import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { GradientLoader } from '../common/GradientLoader';
import logo from '../../assets/logo.svg';

/**
 * Where a workspace invitation link lands.
 *
 * Deliberately outside ProtectedRoute: the person may have no account yet, or
 * be signed in as someone else, and they should see who invited them to what
 * before doing anything about it. Joining is always an explicit step — being
 * in a workspace means colleagues can see the meetings you record there.
 */

type InviteState = 'pending' | 'expired' | 'revoked' | 'not_found';

interface InvitePreview {
  state: InviteState;
  workspace_id?: string;
  workspace_name?: string;
  email?: string;
  role?: string;
  invited_by?: string;
}

export const PENDING_INVITE_KEY = 'ellie_pending_invite';

export function InviteAcceptPage(): JSX.Element {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, ensureFreshAccessToken } = useAuth();
  const { profile } = useProfile();
  const apiBaseUrl = getApiBaseUrl();

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const response = await fetch(`${apiBaseUrl}/invites/${encodeURIComponent(token)}/`, {
          headers: { Accept: 'application/json' },
        });
        const data = (await response.json()) as InvitePreview;
        if (!cancelled) {
          setInvite(data.state ? data : { state: 'not_found' });
        }
      } catch {
        if (!cancelled) {
          setError('We could not load this invitation. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, token]);

  const accept = useCallback(async (): Promise<void> => {
    setIsAccepting(true);
    setError(null);
    try {
      const authToken = await ensureFreshAccessToken();
      if (!authToken) {
        throw new Error('Your session has expired. Sign in again to accept.');
      }
      const response = await fetch(`${apiBaseUrl}/invites/${encodeURIComponent(token)}/accept/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'We could not accept this invitation.');
      }
      // The membership reaches recall-server before this responds, so the
      // workspace already has its meetings by the time it loads.
      localStorage.removeItem(PENDING_INVITE_KEY);
      navigate(`/workspaces/${data.workspace_id}`, { replace: true });
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : 'We could not accept this invitation.');
    } finally {
      setIsAccepting(false);
    }
  }, [apiBaseUrl, ensureFreshAccessToken, navigate, token]);

  const rememberAndGo = (path: string, state?: { from: string }): void => {
    // Survives the round trip through email verification, where the link
    // itself is lost.
    try {
      localStorage.setItem(PENDING_INVITE_KEY, token);
    } catch {
      /* private browsing: the link in the email still works */
    }
    navigate(path, state ? { state } : undefined);
  };

  if (isLoading || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ellieSurface">
        <GradientLoader label="Loading your invitation..." />
      </div>
    );
  }

  const shell = (children: JSX.Element): JSX.Element => (
    <div className="flex min-h-screen items-center justify-center bg-ellieSurface px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="Ellie" className="h-10 w-10" />
          <span className="font-spaceGrotesk text-lg font-bold text-ellieBlue">Invite Ellie</span>
        </div>
        {children}
      </div>
    </div>
  );

  const message = (title: string, body: string): JSX.Element =>
    shell(
      <>
        <h1 className="font-nunito text-xl font-extrabold text-ellieBlack">{title}</h1>
        <p className="mt-3 font-nunito text-sm text-ellieGray">{body}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full rounded-lg bg-ellieBlue px-4 py-3 font-nunito text-sm font-semibold text-white transition-colors hover:bg-ellieBlue/90"
        >
          Go to Invite Ellie
        </button>
      </>
    );

  if (!invite || invite.state === 'not_found') {
    return message('This invitation link is not valid', 'Ask whoever invited you to send a new one.');
  }
  if (invite.state === 'revoked') {
    return message('This invitation was withdrawn', 'Ask whoever invited you to send a new one.');
  }
  if (invite.state === 'expired') {
    return message(
      'This invitation has expired',
      `Invitations to ${invite.workspace_name ?? 'a workspace'} last 7 days. Ask for a new one and it will work straight away.`
    );
  }

  const invitedEmail = (invite.email ?? '').toLowerCase();
  const signedInEmail = (profile?.email ?? '').toLowerCase();
  const wrongAccount = isAuthenticated && signedInEmail && signedInEmail !== invitedEmail;

  return shell(
    <>
      <h1 className="font-nunito text-xl font-extrabold text-ellieBlack">
        {invite.invited_by ? `${invite.invited_by} invited you` : 'You have been invited'}
      </h1>
      <p className="mt-3 font-nunito text-sm text-ellieGray">
        Join <span className="font-semibold text-ellieBlack">{invite.workspace_name}</span> as{' '}
        {invite.role === 'owner' ? 'an owner' : 'a member'}. You will see the meetings in this workspace, and
        can record your own into it.
      </p>
      <p className="mt-2 font-nunito text-xs text-ellieGray">Invitation sent to {invite.email}</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 font-nunito text-sm text-red-700">
          {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => rememberAndGo('/login', { from: `/invite/${token}` })}
            className="w-full rounded-lg bg-ellieBlue px-4 py-3 font-nunito text-sm font-semibold text-white transition-colors hover:bg-ellieBlue/90"
          >
            Sign in to accept
          </button>
          <button
            type="button"
            onClick={() =>
              rememberAndGo(`/signup?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(invite.email ?? '')}`)
            }
            className="w-full rounded-lg border border-ellieBlue px-4 py-3 font-nunito text-sm font-semibold text-ellieBlue transition-colors hover:bg-ellieBlue/5"
          >
            Create an account
          </button>
          <p className="font-nunito text-xs text-ellieGray">
            Use {invite.email} — an invitation can only be accepted by the address it was sent to.
          </p>
        </div>
      )}

      {wrongAccount && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 font-nunito text-sm text-amber-800">
          You are signed in as {profile?.email}. This invitation was sent to {invite.email}. Sign out and sign
          back in with that address to accept it.
        </div>
      )}

      {isAuthenticated && !wrongAccount && (
        <button
          type="button"
          onClick={() => void accept()}
          disabled={isAccepting}
          className="mt-6 w-full rounded-lg bg-ellieBlue px-4 py-3 font-nunito text-sm font-semibold text-white transition-colors hover:bg-ellieBlue/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAccepting ? 'Joining...' : `Join ${invite.workspace_name}`}
        </button>
      )}
    </>
  );
}
