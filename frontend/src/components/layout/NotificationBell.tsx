import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, getAuthHeaders } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/api";
import { io, Socket } from "socket.io-client";

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiFetch("/api/notifications", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  // Socket.io connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    fetchNotifications();

    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join", user._id);
    });

    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all as read
  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read", {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  if (!isAuthenticated) return null;

  const typeEmoji: Record<string, string> = {
    status_update: "📋",
    admin_reply: "💬",
    resolution: "✅",
    assignment: "📌",
    general: "🔔",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
        whileTap={{ scale: 0.9 }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 mt-2 w-80 bg-card rounded-lg border shadow-lg z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 20).map((n, i) => (
                  <motion.div
                    key={n._id}
                    className={`px-4 py-3 border-b last:border-0 flex gap-3 items-start hover:bg-muted/50 transition-colors ${
                      !n.isRead ? "bg-primary/5" : ""
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <span className="text-base shrink-0 mt-0.5">{typeEmoji[n.type] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
