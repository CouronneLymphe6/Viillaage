'use client';

import Link from 'next/link';

export default function Pricing() {
    return (
        <section style={{
            padding: 'var(--spacing-xl) var(--spacing-md)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            textAlign: 'center',
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)', color: 'white' }}>
                    Rejoignez votre communauté
                </h2>
                <p style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-lg)', opacity: 0.9 }}>
                    Participez au lancement de Viillaage et soyez parmi les premiers à créer du lien dans votre commune.
                </p>
                <div style={{
                    marginBottom: 'var(--spacing-xl)',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                }}>
                    L'accès est actuellement ouvert à tous !
                </div>

                <Link href="/register">
                    <button style={{
                        backgroundColor: 'white',
                        color: 'var(--primary)',
                        padding: '16px 48px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Rejoindre mon village
                    </button>
                </Link>
            </div>
        </section>
    );
}
