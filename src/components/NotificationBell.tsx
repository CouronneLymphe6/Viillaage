'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notifications count only (lightweight)
    const fetchNotificationsCount = async () => {
        if (isLoading) return; // Prevent concurrent requests

        try {
            const response = await fetch('/api/notifications/count');
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    // Fetch full notifications (called when dropdown opens)
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            // Initial load: only count
            fetchNotificationsCount();
            // Poll for NEW notifications every 60 seconds (was 30, now optimized)
            const interval = setInterval(fetchNotificationsCount, 60000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true }),
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
            setShowDropdown(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ALERT': return '🚨';
            case 'BUSINESS': return '🏪';
            case 'MARKET': return '🛒';
            case 'MESSAGE': return '💬';
            default: return '🔔';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInMinutes < 1) return "À l'instant";
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Il y a ${diffInDays}j`;
        return date.toLocaleDateString('fr-FR');
    };

    if (!session) return null;

    return (
        <div style={{ position: 'relative', zIndex: 1002 }}>
            {/* Bell Icon */}
            <button
                onClick={() => {
                    const newState = !showDropdown;
                    setShowDropdown(newState);
                    // Fetch full notifications ONLY when opening dropdown
                    if (newState && notifications.length === 0) {
                        fetchNotifications();
                    }
                }}
                style={{
                    position: 'relative',
                    background: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)', // Village Green
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>

                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        border: '2px solid white',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowDropdown(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998,
                        }}
                    />

                    {/* Notifications Panel */}
                    <div style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        width: '400px',
                        maxWidth: '90vw',
                        backgroundColor: 'var(--secondary)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        zIndex: 999,
                        maxHeight: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                                Notifications {unreadCount > 0 && `(${unreadCount})`}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div style={{
                            overflowY: 'auto',
                            maxHeight: '500px',
                        }}>
                            {notifications.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'var(--text-secondary)',
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔕</div>
                                    <p>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            padding: '14px 16px',
                                            borderBottom: '1px solid var(--border)',
                                            cursor: notification.link ? 'pointer' : 'default',
                                            backgroundColor: notification.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (notification.link) {
                                                e.currentTarget.style.backgroundColor = 'var(--border)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = notification.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.1)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>
                                                    {notification.title}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                                    {notification.message}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {getTimeAgo(notification.createdAt)}
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--primary)',
                                                    flexShrink: 0,
                                                }}></div>
                                            )}
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
