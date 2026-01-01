import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationsPage(): JSX.Element {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: { id: string; meeting_id: string | null; read: boolean }) => {
    if (!notification.read) {
      void markAsRead(notification.id);
    }
    if (notification.meeting_id) {
      navigate(`/unresolved-meetings?meeting=${notification.meeting_id}`);
    } else {
      navigate('/unresolved-meetings');
    }
  };

  return (
    <DashboardLayout activeTab="/notifications">
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
              <li className="text-ellieBlue">Notifications</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 px-3 py-1 bg-orange-500 text-white text-sm font-nunito font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="font-nunito text-sm text-ellieBlue hover:underline font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <p className="font-nunito text-base md:text-lg text-ellieGray">
                No notifications yet
              </p>
              <p className="font-nunito text-sm text-ellieGray mt-2">
                You'll see notifications here when you have unresolved meetings that need folder assignment.
              </p>
              <button
                type="button"
                onClick={() => navigate('/unresolved-meetings')}
                className="mt-4 px-6 py-2 bg-ellieBlue text-white rounded-lg font-nunito font-semibold hover:opacity-90 transition-opacity"
              >
                View Unresolved Meetings
              </button>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left bg-[#E8F4F8] border border-[#CAE8E3] rounded-lg p-4 md:p-6 hover:bg-[#D8E8F0] transition-colors cursor-pointer ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Orange Dot for unread */}
                    {!notification.read && (
                      <div className="flex-shrink-0 mt-1">
                        <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-orange-500 rounded-full block"></span>
                      </div>
                    )}
                    {notification.read && (
                      <div className="flex-shrink-0 mt-1 w-2 h-2 md:w-2.5 md:h-2.5"></div>
                    )}

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-1 md:mb-2">
                        {notification.meeting_title}
                      </h3>
                      <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <p className="font-nunito text-xs text-ellieGray">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {/* Mark as Read Button */}
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void markAsRead(notification.id);
                        }}
                        className="flex-shrink-0 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

