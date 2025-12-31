'use client';


import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import PushNotificationManager from "@/components/PushNotificationManager";
import { ToastContainer } from "@/components/Toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileHamburgerMenu from "@/components/MobileHamburgerMenu";




export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />

            {/* Mobile Header with Hamburger Menu */}
            <div className="mobile-header" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                backgroundColor: 'white',
                borderBottom: '1px solid var(--border)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                zIndex: 1001,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MobileHamburgerMenu />
                    <h1 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0, fontWeight: 700 }}>Viillaage</h1>
                </div>
            </div>

            {/* Notification Bell - Fixed Top Right */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1002,
            }} className="notification-bell-container">
                <NotificationBell />
            </div>


            <main
                style={{
                    marginLeft: '250px',
                    width: 'calc(100% - 250px)',
                    minHeight: '100vh',
                    backgroundColor: 'var(--background)',
                    padding: 'var(--spacing-lg)',
                    boxSizing: 'border-box',
                }}
                className="main-content"
            >
                <PushNotificationManager />
                <ToastContainer />
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />


            {/* CSS for responsive layout */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-header {
                        display: flex !important;
                    }

                    .main-content {
                        margin-left: 0 !important;
                        width: 100% !important;
                        padding: 20px !important;
                        padding-top: 80px !important; /* Space for mobile header */
                        padding-bottom: 80px !important; /* Space for bottom nav */
                        box-sizing: border-box !important;
                    }
                    
                    .notification-bell-container {
                        top: 12px !important;
                        right: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
