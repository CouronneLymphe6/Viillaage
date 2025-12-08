'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);

            // Explicitly register SW if not found
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    return registration.pushManager.getSubscription();
                })
                .then(subscription => {
                    setIsSubscribed(!!subscription);
                })
                .catch(err => console.error("SW Registration failed:", err));
        }
    }, []);

    const subscribeToPush = async () => {
        try {
            // Explicitly register SW if not found
            const registration = await navigator.serviceWorker.register('/sw.js');

            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!publicKey) {
                console.error("VAPID Public Key not found");
                alert("Configuration manquante (Clé VAPID).");
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Send to backend
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription),
            });

            setIsSubscribed(true);
            setPermission('granted');
            alert("Notifications activées avec succès !");
        } catch (error) {
            console.error("Error subscribing to push:", error);
            alert("Erreur lors de l'activation des notifications.");
        }
    };

    if (!isSupported || permission === 'granted' || permission === 'denied') {
        return null;
    }

    return (
        <div style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={20} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    Activez les notifications pour ne rien rater du village !
                </span>
            </div>
            <button
                onClick={subscribeToPush}
                style={{
                    backgroundColor: 'white',
                    color: 'var(--primary)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                Activer
            </button>
        </div>
    );
}
