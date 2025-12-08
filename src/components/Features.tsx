import React from 'react';

const features = [
    {
        title: "Sécurité & Entraide",
        description: "Signalements géolocalisés, alertes sécurité et solidarité citoyenne.",
        icon: "🛡️"
    },
    {
        title: "Vie du Village",
        description: "Agenda des fêtes, événements de la mairie et des associations.",
        icon: "🎉"
    },
    {
        title: "Commerces Locaux",
        description: "Découvrez les artisans et commerçants de votre commune.",
        icon: "🏪"
    },
    {
        title: "Messagerie",
        description: "Discutez en direct avec vos voisins et restez connecté à votre entourage.",
        icon: "💬"
    },
    {
        title: "Le Marché",
        description: "Petites annonces entre voisins : vendez, donnez, échangez.",
        icon: "🤝"
    }
];

export default function Features() {
    return (
        <section id="features" style={{
            padding: 'var(--spacing-xl) var(--spacing-md)',
            backgroundColor: 'var(--background)',
            scrollMarginTop: '100px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem' }}>
                    Tout votre village dans votre poche
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)',
                }}>
                    {features.map((feature, index) => (
                        <div key={index} style={{
                            backgroundColor: 'var(--secondary)',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-sm)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-sm)' }}>{feature.icon}</div>
                            <h3 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary-dark)' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
