import React from 'react';
import { NotificationItem } from '../../types';
import { dbStore } from '../../services/db/store';
import { X, Bell, Check, CheckCheck } from 'lucide-react';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onRefresh,
}) => {
  const handleMarkRead = (id: string) => {
    dbStore.markNotificationRead(id);
    onRefresh();
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.is_read) {
        dbStore.markNotificationRead(n.id);
      }
    });
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              In-App Notifications
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  notif.is_read
                    ? 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400'
                    : 'bg-neutral-950 border-amber-500/30 text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-neutral-100 flex items-center gap-1.5">
                    {!notif.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {new Date(notif.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="leading-relaxed text-neutral-300">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
