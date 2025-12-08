'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return (
        <>
            <style jsx global>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                    .auth-buttons { display: none !important; } /* On cache aussi les boutons auth header sur mobile, ils seront dans le menu */
                }
                @media (min-width: 769px) {
                    .mobile-toggle { display: none !important; }
                    .mobile-menu { display: none !important; }
                }
            `}</style>

            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                transition: 'all 0.3s ease',
                padding: scrolled ? 'var(--spacing-md) var(--spacing-xl)' : 'var(--spacing-lg) var(--spacing-xl)',
                backgroundColor: scrolled || menuOpen ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
                borderBottom: scrolled || menuOpen ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', zIndex: 1001 }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'var(--primary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}>
                            V
                        </div>
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'var(--text-main)',
                            letterSpacing: '-0.5px'
                        }}>
                            Viillaage
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="desktop-nav" style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                        <Link href="#features" style={{
                            textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem'
                        }}>
                            Fonctionnalités
                        </Link>
                        <Link href="#roles" style={{
                            textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem'
                        }}>
                            Ensemble
                        </Link>
                        <Link href="/contact" style={{
                            textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.95rem'
                        }}>
                            Contact
                        </Link>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="auth-buttons" style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <Link href="/login">
                            <button style={{
                                padding: '8px 20px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}>
                                Connexion
                            </button>
                        </Link>
                        <Link href="/register">
                            <button style={{
                                padding: '8px 20px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                Rejoindre
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Toggle Button */}
                    <button
                        className="mobile-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            display: 'none', // Managed by media query
                            flexDirection: 'column',
                            gap: '5px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 1001,
                            padding: '5px'
                        }}
                    >
                        <span style={{ width: '24px', height: '2px', backgroundColor: 'var(--text-main)', transition: '0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
                        <span style={{ width: '24px', height: '2px', backgroundColor: 'var(--text-main)', transition: '0.3s', opacity: menuOpen ? 0 : 1 }}></span>
                        <span style={{ width: '24px', height: '2px', backgroundColor: 'var(--text-main)', transition: '0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {menuOpen && (
                    <div className="mobile-menu" style={{
                        position: 'fixed',
                        top: '60px',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        padding: 'var(--spacing-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-md)',
                        boxShadow: 'var(--shadow-md)',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <Link href="#features" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.1rem', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            Fonctionnalités
                        </Link>
                        <Link href="#roles" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.1rem', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            Ensemble
                        </Link>
                        <Link href="/contact" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.1rem', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            Contact
                        </Link>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ width: '100%' }}>
                                <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent', fontWeight: '600' }}>
                                    Connexion
                                </button>
                            </Link>
                            <Link href="/register" onClick={() => setMenuOpen(false)} style={{ width: '100%' }}>
                                <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '600' }}>
                                    Rejoindre mon village
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
