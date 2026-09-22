import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import {
  WorkspaceMember,
  WorkspaceRole,
  changeWorkspaceMemberRole,
  inviteToWorkspace,
  leaveWorkspace,
  listWorkspaceMembers,
  removeWorkspaceMember,
  resendWorkspaceInvite,
  revokeWorkspaceInvite,
} from './workspaceApi';

/**
 * Who is in this workspace, and who has been invited.
 *
 * Owner-only controls are hidden from members, but that is only tidiness: the
 * API refuses them regardless, including the rules that keep a workspace from
 * losing its last owner.
 */

interface Props {
  workspaceId: string;
  workspaceName: string;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function WorkspaceMembersPanel({ workspaceId, workspaceName }: Props): JSX.Element {
  const { ensureFreshAccessToken } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const withToken = useCallback(async <T,>(work: (token: string) => Promise<T>): Promise<T> => {
    const token = await ensureFreshAccessToken();
    if (!token) throw new Error('Your session has expired. Sign in again.');
    return work(token);
  }, [ensureFreshAccessToken]);

  const load = useCallback(async (): Promise<void> => {
    try {
      const rows = await withToken((token) => listWorkspaceMembers(token, workspaceId));
      setMembers(rows);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load members.');
    } finally {
      setIsLoading(false);
    }
  }, [withToken, workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo(() => members.filter((m) => m.status === 'active'), [members]);
  const invited = useMemo(() => members.filter((m) => m.status === 'invited'), [members]);
  const me = useMemo(() => active.find((m) => m.profile_id === profile?.id), [active, profile?.id]);
  const isOwner = me?.role === 'owner';
  const ownerCount = active.filter((m) => m.role === 'owner').length;

  const run = async (id: string, work: (token: string) => Promise<unknown>, done: string): Promise<void> => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await withToken(work);
      setNotice(done);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  const invite = async (): Promise<void> => {
    const email = inviteEmail.trim();
    if (!email) return;
    setIsInviting(true);
    setError(null);
    setNotice(null);
    try {
      await withToken((token) => inviteToWorkspace(token, workspaceId, email, inviteRole));
      setNotice(`Invitation sent to ${email}. It expires in 7 days.`);
      setInviteEmail('');
      setInviteRole('member');
      setIsInviteOpen(false);
      await load();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Could not send that invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const leave = async (): Promise<void> => {
    if (!me) return;
    if (!window.confirm(`Leave ${workspaceName}? You will lose access to its meetings.`)) return;
    setBusyId(me.id);
    setError(null);
    try {
      await withToken((token) => leaveWorkspace(token, workspaceId));
      navigate('/workspaces', { replace: true });
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : 'Could not leave this workspace.');
      setBusyId(null);
    }
  };

  const roleLabel = (member: WorkspaceMember): string => (member.role === 'owner' ? 'Owner' : 'Member');

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-nunito text-base font-extrabold text-ellieBlack md:text-lg">People</h2>
          <p className="font-nunito text-xs text-ellieGray">
            Everyone here can see this workspace&apos;s meetings and record into it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white transition-colors hover:bg-ellieBlue/90"
            >
              Invite people
            </button>
          )}
          {me && (
            <button
              type="button"
              onClick={() => void leave()}
              disabled={busyId === me.id}
              className="rounded-lg border border-gray-200 px-4 py-2 font-nunito text-sm font-semibold text-ellieGray transition-colors hover:text-ellieBlack disabled:opacity-60"
            >
              Leave
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-nunito text-sm text-green-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-nunito text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded bg-gray-100" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-nunito text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-ellieGray">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Joined</th>
                {isOwner && <th className="py-2 pr-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {active.map((member) => (
                <tr key={member.id} className="border-b border-gray-50 text-ellieBlack">
                  <td className="py-3 pr-4">
                    {member.name || '—'}
                    {member.profile_id === profile?.id && <span className="ml-2 text-xs text-ellieGray">(you)</span>}
                  </td>
                  <td className="py-3 pr-4 text-ellieGray">{member.email}</td>
                  <td className="py-3 pr-4">{roleLabel(member)}</td>
                  <td className="py-3 pr-4 text-ellieGray">Active</td>
                  <td className="py-3 pr-4 text-ellieGray">{formatDate(member.joined_at)}</td>
                  {isOwner && (
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void run(
                              member.id,
                              (token) =>
                                changeWorkspaceMemberRole(
                                  token, workspaceId, member.id,
                                  member.role === 'owner' ? 'member' : 'owner'
                                ),
                              member.role === 'owner'
                                ? `${member.email} is now a member.`
                                : `${member.email} is now an owner.`
                            )
                          }
                          disabled={busyId === member.id || (member.role === 'owner' && ownerCount === 1)}
                          title={member.role === 'owner' && ownerCount === 1
                            ? 'A workspace needs at least one owner'
                            : undefined}
                          className="rounded border border-gray-200 px-3 py-1 text-xs font-semibold text-ellieGray transition-colors hover:text-ellieBlack disabled:opacity-40"
                        >
                          {member.role === 'owner' ? 'Make member' : 'Make owner'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove ${member.email} from ${workspaceName}?`)) {
                              void run(member.id, (token) => removeWorkspaceMember(token, workspaceId, member.id),
                                `${member.email} no longer has access.`);
                            }
                          }}
                          disabled={busyId === member.id || (member.role === 'owner' && ownerCount === 1)}
                          className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {invited.map((member) => (
                <tr key={member.id} className="border-b border-gray-50 text-ellieBlack">
                  <td className="py-3 pr-4 text-ellieGray">—</td>
                  <td className="py-3 pr-4 text-ellieGray">{member.email}</td>
                  <td className="py-3 pr-4">{roleLabel(member)}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Invited
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ellieGray">
                    {member.invite_expires_at ? `Expires ${formatDate(member.invite_expires_at)}` : '—'}
                  </td>
                  {isOwner && (
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void run(member.id, (token) => resendWorkspaceInvite(token, workspaceId, member.id),
                              `Invitation resent to ${member.email}.`)
                          }
                          disabled={busyId === member.id}
                          className="rounded border border-gray-200 px-3 py-1 text-xs font-semibold text-ellieGray transition-colors hover:text-ellieBlack disabled:opacity-40"
                        >
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void run(member.id, (token) => revokeWorkspaceInvite(token, workspaceId, member.id),
                              `Invitation to ${member.email} withdrawn.`)
                          }
                          disabled={busyId === member.id}
                          className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-nunito text-lg font-extrabold text-ellieBlack">Invite to {workspaceName}</h3>
            <p className="mt-2 font-nunito text-sm text-ellieGray">
              They will get an email with a link to accept. It expires in 7 days, and only that address can use it.
            </p>
            <label className="mt-4 block font-nunito text-sm font-semibold text-ellieBlack" htmlFor="invite-email">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="colleague@company.com"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-nunito text-sm focus:border-ellieBlue focus:outline-none"
            />
            <label className="mt-4 block font-nunito text-sm font-semibold text-ellieBlack" htmlFor="invite-role">
              Role
            </label>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as WorkspaceRole)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-nunito text-sm focus:border-ellieBlue focus:outline-none"
            >
              <option value="member">Member — can see and record meetings</option>
              <option value="owner">Owner — can also invite, remove and rename</option>
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 font-nunito text-sm font-semibold text-ellieGray"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void invite()}
                disabled={isInviting || !inviteEmail.trim()}
                className="rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white disabled:opacity-60"
              >
                {isInviting ? 'Sending...' : 'Send invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
