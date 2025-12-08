'use client';

export default function OfflinePage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '3rem',
                maxWidth: '500px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</h1>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    Vous êtes hors ligne
                </h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
                    Il semble que vous n'ayez pas de connexion internet. Certaines fonctionnalités de Viillaage nécessitent une connexion active.
                </p>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    marginTop: '2rem'
                }}>
                    <p style={{ fontSize: '0.95rem', margin: 0 }}>
                        💡 <strong>Astuce :</strong> Vérifiez votre connexion Wi-Fi ou vos données mobiles, puis rechargez la page.
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '2rem',
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#667eea',
                        background: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Réessayer
                </button>
            </div>
        </div>
    );
}
