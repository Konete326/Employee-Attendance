"use client";

import { useState, useEffect } from "react";
import { Bell, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark each unread notification as read
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n._id}/read`, { method: "PUT" })
        )
      );
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--neu-surface)] transition-colors"
      >
        <Bell size={20} className="text-[var(--neu-text)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--neu-danger)] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--neu-surface)] rounded-xl shadow-lg border border-[var(--neu-border)] z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-[var(--neu-border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--neu-text)]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[var(--neu-accent)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-[var(--neu-text-secondary)]">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-[var(--neu-border)] cursor-pointer hover:bg-[var(--neu-surface-light)] transition-colors ${
                      !notification.isRead ? "bg-[var(--neu-accent)]/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notification.type === "error"
                            ? "bg-[var(--neu-danger)]"
                            : notification.type === "success"
                            ? "bg-[var(--neu-success)]"
                            : notification.type === "warning"
                            ? "bg-[var(--neu-warning)]"
                            : "bg-[var(--neu-accent)]"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--neu-text)] truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-[var(--neu-text-secondary)] line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--neu-text-muted)] mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
