'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
    { label: 'Accueil', href: '/feed', icon: '🏠' },
    // Dashboard supprimé
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

    return (
        <>
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
                }}
                className="sidebar"
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
                    .sidebar {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
