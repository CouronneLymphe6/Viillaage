'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
    { label: 'Fil d\'actualité', href: '/feed', icon: '📰' },
    { label: 'Tableau de bord', href: '/dashboard', icon: '🏠' },
    { label: 'Alertes & Sécurité', href: '/alerts', icon: '🚨' },
    { label: 'Les Pros', href: '/village', icon: '🏪' },
    { label: 'Les Assos', href: '/associations', icon: '🤝' },
    { label: 'Messagerie', href: '/messages', icon: '💬' },
    { label: 'Agenda', href: '/events', icon: '📅' },
    { label: 'Panneau', href: '/official', icon: '📢' },
    { label: 'Le Marché', href: '/market', icon: '🛒' },
    { label: 'Mon Compte', href: '/profile', icon: '👤' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Hamburger Button - Mobile Only */}
            <button
                onClick={toggleMenu}
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 1001,
                    display: 'none',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '8px',
                    backgroundColor: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                }}
                className="hamburger-btn"
            >
                <span style={{ width: '24px', height: '3px', backgroundColor: 'var(--text-main)', borderRadius: '2px', transition: 'all 0.3s' }}></span>
                <span style={{ width: '24px', height: '3px', backgroundColor: 'var(--text-main)', borderRadius: '2px', transition: 'all 0.3s' }}></span>
                <span style={{ width: '24px', height: '3px', backgroundColor: 'var(--text-main)', borderRadius: '2px', transition: 'all 0.3s' }}></span>
            </button>

            {/* Overlay - Mobile Only */}
            {isOpen && (
                <div
                    onClick={closeMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                        display: 'none',
                    }}
                    className="sidebar-overlay"
                />
            )}

            {/* Sidebar */}
            <aside
                style={{
                    width: '250px',
                    backgroundColor: 'var(--secondary)',
                    borderRight: '1px solid var(--border)',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--spacing-md)',
                    zIndex: 1000,
                    transition: 'transform 0.3s ease-in-out',
                }}
                className={`sidebar ${isOpen ? 'open' : ''}`}
            >
                <div style={{ marginBottom: 'var(--spacing-xl)', paddingLeft: 'var(--spacing-xs)' }}>
                    <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Viillaage</h1>
                </div>

                <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMenu}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: isActive ? 'var(--background)' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? '600' : '400',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                    }}
                >
                    <span>🚪</span> Déconnexion
                </button>
            </aside>

            {/* CSS for responsive behavior */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .hamburger-btn {
                        display: flex !important;
                    }

                    .sidebar {
                        transform: translateX(-100%);
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .sidebar-overlay {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    );
}
