import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import { Bell, X } from "lucide-react";
import { HRRealtimeContext } from "../context/RealtimeContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const revision = useContext(HRRealtimeContext);
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    api
      .get("/notifications")
      .then((response) => setItems(response.data.notifications ?? []))
      .catch(() => setItems([]));
  }, [user?.id, revision]);

  if (!user) return null;

  const unreadCount = items.filter((item) => !item.isRead).length;

  const openNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      await api.patch(`/notifications/${item.id}/read`);
      setItems((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    }

    setOpen(false);
    navigate(item.link);
  };

  const dismissNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Could not dismiss notification.", error);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete("/notifications");
      setItems([]);
    } catch (error) {
      console.error("Could not clear notifications.", error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Notifications</h2>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => void clearNotifications()}
                  className="text-xs font-medium text-violet-600 hover:text-violet-800"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close notifications"
                title="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 border-b px-3 py-3 hover:bg-slate-50 ${
                    item.isRead ? "bg-white" : "bg-violet-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void openNotification(item)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block font-medium">{item.title}</span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {item.message}
                    </span>
                    <span className="mt-2 block text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void dismissNotification(item.id)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    aria-label={`Dismiss notification: ${item.title}`}
                    title="Dismiss notification"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
