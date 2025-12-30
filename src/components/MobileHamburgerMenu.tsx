'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    Briefcase,
    Users,
    ShoppingCart,
    MessageCircle,
    Settings,
    Shield
} from 'lucide-react';
import styles from './MobileHamburgerMenu.module.css';

const menuItems = [
    {
        href: '/pros',
        icon: Briefcase,
        label: 'Les Pros',
        description: 'Commerces et artisans'
    },
    {
        href: '/associations',
        icon: Users,
        label: 'Les Assos',
        description: 'Associations du village'
    },
    {
        href: '/marketplace',
        icon: ShoppingCart,
        label: 'Le Marché',
        description: 'Petites annonces'
    },
    {
        href: '/messages',
        icon: MessageCircle,
        label: 'Messagerie',
        description: 'Discussions'
    },
    {
        href: '/settings',
        icon: Settings,
        label: 'Réglages',
        description: 'Paramètres du compte'
    }
];

export default function MobileHamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();
    const isAdmin = session?.user?.role === 'ADMIN';

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Hamburger Button */}
            <button
                className={styles.hamburgerBtn}
                onClick={toggleMenu}
                aria-label="Menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={closeMenu}
                />
            )}

            {/* Drawer Menu */}
            <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
                <div className={styles.drawerHeader}>
                    <h2>Menu</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={closeMenu}
                        aria-label="Fermer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.drawerNav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                                onClick={closeMenu}
                            >
                                <div className={styles.menuIcon}>
                                    <Icon size={22} />
                                </div>
                                <div className={styles.menuText}>
                                    <div className={styles.menuLabel}>{item.label}</div>
                                    <div className={styles.menuDescription}>{item.description}</div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Admin link if user is admin */}
                    {isAdmin && (
                        <>
                            <div className={styles.divider} />
                            <Link
                                href="/admin"
                                className={`${styles.menuItem} ${pathname.startsWith('/admin') ? styles.active : ''}`}
                                onClick={closeMenu}
                            >
                                <div className={styles.menuIcon}>
                                    <Shield size={22} />
                                </div>
                                <div className={styles.menuText}>
                                    <div className={styles.menuLabel}>Administration</div>
                                    <div className={styles.menuDescription}>Gestion du village</div>
                                </div>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
}
