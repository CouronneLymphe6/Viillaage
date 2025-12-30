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

            {/* Mobile Hamburger Menu - Top Left */}
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 1002,
            }} className="hamburger-menu-container">
                <MobileHamburgerMenu />
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
                    .main-content {
                        margin-left: 0 !important;
                        width: 100% !important;
                        padding: 20px !important;
                        padding-top: 70px !important;
                        padding-bottom: 80px !important; /* Space for bottom nav */
                        box-sizing: border-box !important;
                    }
                    
                    .notification-bell-container {
                        top: 16px !important;
                        right: 16px !important;
                    }

                    .hamburger-menu-container {
                        top: 16px !important;
                        left: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
