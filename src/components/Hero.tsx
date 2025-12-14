'use client';

import Link from 'next/link';

export default function Hero() {
    return (
        <section style={{
            padding: 'var(--spacing-xl) var(--spacing-md)',
            paddingTop: '120px', // Acocunt for fixed navbar
            minHeight: '90vh', // Start tall
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background)',
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Gradient Blob */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(0,0,0,0) 70%)', // Primary color tint
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-xl)',
                alignItems: 'center',
                zIndex: 1
            }}>
                {/* Text Content */}
                <div style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        backgroundColor: '#e0e7ff',
                        color: 'var(--primary)',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: 'var(--spacing-md)',
                    }}>
                        👋 Bienvenue sur Viillaage
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        lineHeight: '1.1',
                        marginBottom: 'var(--spacing-md)',
                        letterSpacing: '-1px'
                    }}>
                        Le Réseau Social de <br />
                        <span style={{
                            color: 'var(--primary)',
                            backgroundImage: 'linear-gradient(120deg, var(--primary) 0%, #818cf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block'
                        }}>
                            Votre Village
                        </span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '540px',
                        marginBottom: 'var(--spacing-lg)',
                        lineHeight: '1.6'
                    }}>
                        Connectez-vous avec vos voisins, participez à la vie locale et sécurisez votre communauté dans un espace numérique bienveillant et moderne.
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                        <Link href="/register">
                            <button style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                padding: '16px 36px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(79, 70, 229, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3)';
                                }}
                            >
                                Rejoindre mon village
                            </button>
                        </Link>
                        <Link href="/login">
                            <button style={{
                                backgroundColor: 'white',
                                color: 'var(--text-main)',
                                padding: '16px 36px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border)',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--text-main)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Se connecter
                            </button>
                        </Link>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#cbd5e1',
                                    border: '2px solid white',
                                    marginLeft: i > 1 ? '-10px' : 0
                                }} />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Rejoint par +120 voisins cette semaine
                        </p>
                    </div>
                </div>

                {/* Right Side - Visual Mockup */}
                <div style={{
                    position: 'relative',
                    height: '600px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    perspective: '1000px'
                }}>
                    {/* Abstract Phone/Card UI */}
                    <div style={{
                        width: '320px',
                        height: '580px',
                        backgroundColor: 'white',
                        borderRadius: '40px',
                        border: '8px solid #1e293b',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative',
                        overflow: 'hidden',
                        transform: 'rotateY(-12deg) rotateX(5deg)',
                        transition: 'transform 0.5s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(0) rotateX(0)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(5deg)'}
                    >
                        {/* Fake UI Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700' }}>Beaupuy 📍</div>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9' }} />
                        </div>

                        {/* Fake UI Content */}
                        <div style={{ padding: '20px' }}>
                            {/* Alert Card */}
                            <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '16px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>⚠️ ALERTE QUARTIER</div>
                                <div style={{ height: '8px', width: '80%', backgroundColor: '#fca5a5', borderRadius: '4px', marginBottom: '6px' }} />
                                <div style={{ height: '8px', width: '60%', backgroundColor: '#fca5a5', borderRadius: '4px' }} />
                            </div>

                            {/* Event Card - Fête du Village */}
                            <div style={{ padding: '16px', backgroundColor: '#e0f2fe', borderRadius: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1' }}>🎉 FÊTE DU VILLAGE</div>
                                    <div style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '600' }}>14 Juil.</div>
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>Grand feu d'artifice</div>
                                <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>Rendez-vous place de la mairie à 22h !</div>
                            </div>

                            {/* Post Card */}
                            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
                                    <div>
                                        <div style={{ height: '10px', width: '80px', backgroundColor: '#cbd5e1', borderRadius: '4px', marginBottom: '4px' }} />
                                        <div style={{ height: '8px', width: '40px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                                    </div>
                                </div>
                                <div style={{ height: '120px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '12px', marginBottom: '10px' }} />
                                <div style={{ height: '8px', width: '90%', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '6px' }} />
                                <div style={{ height: '8px', width: '70%', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                            </div>
                        </div>

                        {/* Floating Action Button */}
                        <div style={{
                            position: 'absolute',
                            bottom: '24px',
                            right: '24px',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '24px'
                        }}>+</div>
                    </div>

                    {/* Background Decorative Blob for Phone */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        height: '500px',
                        background: 'var(--primary)',
                        filter: 'blur(80px)',
                        opacity: 0.2,
                        zIndex: -1
                    }} />
                </div>
            </div>
        </section>
    );
}
