'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, AlertTriangle, Calendar, Megaphone, User } from 'lucide-react';
import styles from './MobileBottomNav.module.css';

const navItems = [
    {
        href: '/feed',
        icon: Home,
        label: 'Accueil',
        activePattern: /^\/feed/
    },
    {
        href: '/alerts',
        icon: AlertTriangle,
        label: 'Alertes',
        activePattern: /^\/alerts/
    },
    {
        href: '/events',
        icon: Calendar,
        label: 'Agenda',
        activePattern: /^\/events/
    },
    {
        href: '/official',
        icon: Megaphone,
        label: 'Panneau',
        activePattern: /^\/official/
    },
    {
        href: '/profile',
        icon: User,
        label: 'Profil',
        activePattern: /^\/profile/
    }
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activePattern.test(pathname);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
