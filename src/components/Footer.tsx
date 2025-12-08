'use client';

import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            backgroundColor: '#2d3748',
            color: '#e2e8f0',
            padding: 'var(--spacing-xl) var(--spacing-md)',
            marginTop: 'auto',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {/* Main Footer Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-xl)',
                    marginBottom: 'var(--spacing-lg)',
                }}>
                    {/* About Section */}
                    <div>
                        <h4 style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            marginBottom: 'var(--spacing-md)',
                            fontWeight: '700',
                        }}>
                            Viillaage
                        </h4>
                        <p style={{
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            color: '#cbd5e0',
                        }}>
                            Le réseau social de votre commune. Connectez-vous avec vos voisins,
                            découvrez les commerces locaux et restez informé de la vie de votre village.
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 style={{
                            color: 'white',
                            fontSize: '1rem',
                            marginBottom: 'var(--spacing-md)',
                            fontWeight: '600',
                        }}>
                            Informations légales
                        </h4>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)',
                        }}>
                            <li>
                                <Link href="/legal" style={{
                                    color: '#cbd5e0',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#cbd5e0'}
                                >
                                    Mentions légales
                                </Link>
                            </li>
                            <li>
                                <Link href="/cgu" style={{
                                    color: '#cbd5e0',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#cbd5e0'}
                                >
                                    Conditions Générales d'Utilisation
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" style={{
                                    color: '#cbd5e0',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#cbd5e0'}
                                >
                                    Politique de Confidentialité (RGPD)
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 style={{
                            color: 'white',
                            fontSize: '1rem',
                            marginBottom: 'var(--spacing-md)',
                            fontWeight: '600',
                        }}>
                            Aide & Support
                        </h4>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)',
                        }}>
                            <li>
                                <Link href="/contact" style={{
                                    color: '#cbd5e0',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#cbd5e0'}
                                >
                                    Nous contacter
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid #4a5568',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-md)',
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#a0aec0',
                    }}>
                        © {currentYear} Viillaage. Tous droits réservés.
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        fontSize: '0.85rem',
                        color: '#a0aec0',
                    }}>
                        <span>Fait avec ❤️ pour votre commune</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
