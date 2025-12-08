import React from 'react';

const roles = [
    {
        title: "Habitant",
        description: "Accédez aux actualités, participez aux événements et échangez avec vos voisins."
    },
    {
        title: "Commerce / Artisan",
        description: "Fiche publique, visibilité locale et outils de communication dédiés."
    },
    {
        title: "Mairie / Admin",
        description: "Gérez votre village, modérez les contenus et diffusez les informations officielles."
    }
];

export default function Roles() {
    return (
        <section id="roles" style={{
            padding: 'var(--spacing-xl) var(--spacing-md)',
            backgroundColor: 'var(--secondary)',
            scrollMarginTop: '100px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', fontSize: '2.5rem' }}>
                    Un espace pour chacun
                </h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 'var(--spacing-lg)',
                }}>
                    {roles.map((role, index) => (
                        <div key={index} style={{
                            flex: '1 1 300px',
                            maxWidth: '350px',
                            padding: 'var(--spacing-lg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>{role.title}</h3>
                            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>{role.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
