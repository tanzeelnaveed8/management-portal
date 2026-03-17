

// hooks/useCEONotifications.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NOTIFICATION_TYPES } from '../lib/notifications/notificationTypes';
          

export function useCEONotifications() {
     const [notifications, setNotifications] = useState([]);
     const [unreadCount, setUnreadCount] = useState(0);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [filters, setFilters] = useState({
          type: 'all',
          readStatus: 'all',
          dateRange: 'week'
     });
     const router = useRouter();

     // Fetch notifications
     const fetchNotifications = useCallback(async () => {
          try {
               setLoading(true);
               const response = await fetch('/api/ceo/notifications', {
                    credentials: 'include'
               });

               if (!response.ok) {
                    if (response.status === 401) {
                         router.push('/login');
                         return;
                    }
                    throw new Error('Failed to fetch notifications');
               }

               const data = await response.json();
               setNotifications(data.notifications || []);
               setUnreadCount(data.unreadCount || 0);
               setError(null);
          } catch (err) {
               console.error('Notifications fetch error:', err);
               setError(err.message);
          } finally {
               setLoading(false);
          }
     }, [router]);

     // Mark notification as read
     const markAsRead = useCallback(async (notificationId) => {
          try {
               const response = await fetch('/api/ceo/notifications', {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ notificationId })
               });

               if (!response.ok) {
                    throw new Error('Failed to mark notification as read');
               }

               // Update local state
               setNotifications(prev =>
                    prev.map(n =>
                         n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                    )
               );
               setUnreadCount(prev => Math.max(0, prev - 1));

               return { success: true };
          } catch (err) {
               console.error('Mark as read error:', err);
               return { success: false, error: err.message };
          }
     }, []);

     // Mark all as read
     const markAllAsRead = useCallback(async () => {
          try {
               const response = await fetch('/api/ceo/notifications', {
                    method: 'PATCH',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ markAllAsRead: true })
               });

               if (!response.ok) {
                    throw new Error('Failed to mark all as read');
               }

               // Update local state
               setNotifications(prev =>
                    prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
               );
               setUnreadCount(0);

               return { success: true };
          } catch (err) {
               console.error('Mark all as read error:', err);
               return { success: false, error: err.message };
          }
     }, []);

     // Filter notifications based on current filters
     const filteredNotifications = useCallback(() => {
          return notifications.filter(notification => {
               // Filter by type
               if (filters.type !== 'all' && notification.type !== filters.type) {
                    return false;
               }

               // Filter by read status
               if (filters.readStatus === 'unread' && notification.isRead) {
                    return false;
               }
               if (filters.readStatus === 'read' && !notification.isRead) {
                    return false;
               }

               // Filter by date range
               if (filters.dateRange !== 'all') {
                    const now = new Date();
                    const notifDate = new Date(notification.createdAt);
                    const daysDiff = Math.floor((now - notifDate) / (1000 * 60 * 60 * 24));

                    if (filters.dateRange === 'today' && daysDiff > 1) return false;
                    if (filters.dateRange === 'week' && daysDiff > 7) return false;
                    if (filters.dateRange === 'month' && daysDiff > 30) return false;
               }

               return true;
          });
     }, [notifications, filters]);

     // Get notification statistics
     const getStats = useCallback(() => {
          const total = notifications.length;
          const unread = unreadCount;
          const byType = {};

          notifications.forEach(n => {
               byType[n.type] = (byType[n.type] || 0) + 1;
          });

          return {
               total,
               unread,
               read: total - unread,
               byType
          };
     }, [notifications, unreadCount]);

     // Handle notification click
     const handleNotificationClick = useCallback(async (notification) => {
          if (!notification.isRead) {
               await markAsRead(notification.id);
          }

          if (notification.link) {
               router.push(notification.link);
          }
     }, [markAsRead, router]);

     // Setup polling for real-time updates
     useEffect(() => {
          fetchNotifications();

          const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

          return () => clearInterval(interval);
     }, [fetchNotifications]);

     return {
          notifications: filteredNotifications(),
          allNotifications: notifications,
          unreadCount,
          loading,
          error,
          filters,
          setFilters,
          markAsRead,
          markAllAsRead,
          handleNotificationClick,
          getStats,
          refetch: fetchNotifications
     };
}