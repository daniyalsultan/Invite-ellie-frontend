import { useState } from 'react';
import { DashboardLayout } from '../sidebar';

interface Notification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
}

export function NotificationsPage(): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleMarkAsRead = (id: string): void => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
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
          <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack mb-4 md:mb-6 lg:mb-8">
            Notifications
          </h1>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <p className="font-nunito text-base md:text-lg text-ellieGray">
                No notifications yet
              </p>
              <p className="font-nunito text-sm text-ellieGray mt-2">
                You'll see notifications here when there are updates about your meetings and integrations.
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-[#E8F4F8] border border-[#CAE8E3] rounded-lg p-4 md:p-6 ${
                    notification.isRead ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Orange Dot */}
                    <div className="flex-shrink-0 mt-1">
                      <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-orange-500 rounded-full block"></span>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-1 md:mb-2">
                        {notification.title}
                      </h3>
                      <p className="font-nunito text-xs md:text-sm text-ellieGray leading-relaxed">
                        {notification.description}
                      </p>
                    </div>

                    {/* Mark as Read Button */}
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
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

