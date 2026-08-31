import React, { useEffect, useState } from 'react';
import { Menu, User, LogOut, Bell, X } from 'lucide-react';
import { useGarageStore } from '../stores/garageStore';

const Header = ({ currentUser, onLogout, onMenuToggle }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useGarageStore((state) => state.notifications);
  const loadNotifications = useGarageStore((state) => state.loadNotifications);
  const markNotificationRead = useGarageStore((state) => state.markNotificationRead);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const timer = setInterval(() => loadNotifications().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, [loadNotifications]);
  const roleColors = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    mechanic: 'bg-green-100 text-green-700',
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
          <button onClick={onMenuToggle} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="truncate text-lg font-bold text-gray-800 sm:text-2xl">
            <span className="sm:hidden">GarageMS</span>
            <span className="hidden sm:inline">Garage Management System</span>
          </h1>
        </div>

        <div className="flex shrink-0 items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative rounded-lg p-2 hover:bg-gray-100"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-xs font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-1.5rem))] rounded-xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="font-semibold text-gray-800">Notifications</h2>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No notifications yet</p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => !item.read && markNotificationRead(item.id)}
                        className={`block w-full border-b px-4 py-3 text-left last:border-0 ${item.read ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{item.body}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="hidden items-center space-x-3 rounded-lg bg-gray-100 px-4 py-2 sm:flex">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
              <p
                className={`text-xs capitalize px-2 py-0.5 rounded-full inline-block mt-0.5 ${roleColors[currentUser?.role] || 'bg-gray-100 text-gray-700'}`}
              >
                {currentUser?.role}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden font-medium sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
