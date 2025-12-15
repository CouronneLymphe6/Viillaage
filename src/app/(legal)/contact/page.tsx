'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Contact() {
    const router = useRouter();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    marginBottom: 'var(--spacing-lg)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >
                ← Retour
            </button>

            {/* Hero Section with Photo */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)',
                boxShadow: 'var(--shadow-md)',
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-lg)',
                    textAlign: 'center'
                }}>
                    {/* Photo */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                        <img
                            src="/bruno-founder.png"
                            alt="Bruno Alessi - Fondateur de Viillaage"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <h1 style={{
                            color: 'white',
                            fontSize: '2rem',
                            marginBottom: 'var(--spacing-sm)',
                            fontWeight: '700'
                        }}>
                            👋 Bonjour, je suis Bruno !
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.95)',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Fondateur de Viillaage, je travaille chaque soir et weekend pour améliorer votre expérience locale.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{
                    color: 'var(--primary)',
                    fontSize: '1.5rem',
                    marginBottom: 'var(--spacing-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    💬 Parlons ensemble !
                </h2>

                <p style={{
                    lineHeight: '1.8',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--spacing-lg)',
                    fontSize: '1rem'
                }}>
                    Viillaage est un projet de passion pour renforcer les liens dans nos villages.
                    Je suis à votre écoute pour toute question, suggestion ou problème technique.
                </p>

                {/* Availability */}
                <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#fff3e0',
                    borderLeft: '4px solid #ff9800',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <p style={{
                        margin: 0,
                        color: '#e65100',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                    }}>
                        <strong>🕐 Disponibilité :</strong> Je travaille sur vos problèmes et suggestions tous les soirs et weekends de <strong>22h à minuit</strong> (dans la mesure du possible). N'hésitez pas à me contacter, je vous répondrai dès que possible !
                    </p>
                </div>

                {/* Contact Methods */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    {/* Email */}
                    <div style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            fontSize: '2rem',
                            marginBottom: 'var(--spacing-sm)'
                        }}>📧</div>
                        <h3 style={{
                            color: 'var(--text-main)',
                            fontSize: '1.1rem',
                            marginBottom: 'var(--spacing-xs)'
                        }}>Email</h3>
                        <a
                            href="mailto:spreadtales@gmail.com"
                            style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '500'
                            }}
                        >
                            spreadtales@gmail.com
                        </a>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginTop: 'var(--spacing-xs)',
                            margin: '8px 0 0 0'
                        }}>
                            Privilégié pour les questions détaillées
                        </p>
                    </div>

                    {/* Phone */}
                    <div style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            fontSize: '2rem',
                            marginBottom: 'var(--spacing-sm)'
                        }}>📱</div>
                        <h3 style={{
                            color: 'var(--text-main)',
                            fontSize: '1.1rem',
                            marginBottom: 'var(--spacing-xs)'
                        }}>Téléphone</h3>
                        <a
                            href="tel:+33622975478"
                            style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: '500'
                            }}
                        >
                            06 22 97 54 78
                        </a>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            marginTop: 'var(--spacing-xs)',
                            margin: '8px 0 0 0'
                        }}>
                            Pour les urgences techniques
                        </p>
                    </div>
                </div>

                {/* Message */}
                <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#e8f5e9',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        lineHeight: '1.6'
                    }}>
                        <strong>🌱 Ensemble, faisons grandir Viillaage !</strong><br />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Votre feedback est précieux pour améliorer l'expérience de toute la communauté.
                        </span>
                    </p>
                </div>
            </div>

            {/* FAQ / Tips */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{
                    color: 'var(--primary)',
                    fontSize: '1.3rem',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    💡 Conseils pour me contacter
                </h2>

                <ul style={{
                    lineHeight: '1.8',
                    color: 'var(--text-secondary)',
                    paddingLeft: 'var(--spacing-lg)',
                    margin: 0
                }}>
                    <li><strong>Email</strong> : Idéal pour les questions détaillées, suggestions de fonctionnalités, ou rapports de bugs</li>
                    <li><strong>Téléphone</strong> : Réservé aux urgences techniques (application inaccessible, problème critique)</li>
                    <li><strong>Réponse</strong> : Je m'engage à répondre sous 24-48h maximum</li>
                    <li><strong>Horaires</strong> : Je travaille principalement le soir (22h-minuit) et les weekends</li>
                </ul>
            </div>
        </div>
    );
}
