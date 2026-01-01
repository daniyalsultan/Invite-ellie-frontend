import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import notificationsIcon from '../../assets/noti.png';

export function NotificationBell(): JSX.Element {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: { id: string; meeting_id: string | null; read: boolean }) => {
    if (!notification.read) {
      void markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.meeting_id) {
      navigate(`/unresolved-meetings?meeting=${notification.meeting_id}`);
    } else {
      navigate('/unresolved-meetings');
    }
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-lg bg-blue-50 hover:opacity-80 transition-opacity"
        aria-label="Notifications"
      >
        <img
          src={notificationsIcon}
          alt="Notifications"
          className="w-5 h-5 object-contain"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-[10px] border border-[#E3E7F2] bg-white shadow-[0_25px_55px_rgba(31,47,70,0.14)] z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-nunito text-base font-bold text-ellieBlack">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="font-nunito text-xs text-ellieBlue hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-nunito text-sm text-ellieGray">No notifications</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-nunito text-sm font-semibold text-ellieBlack mb-1">
                        {notification.meeting_title}
                      </p>
                      <p className="font-nunito text-xs text-ellieGray mb-2">
                        {notification.message}
                      </p>
                      <p className="font-nunito text-xs text-ellieGray">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/unresolved-meetings');
                }}
                className="font-nunito text-sm text-ellieBlue hover:underline"
              >
                View all unresolved meetings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

