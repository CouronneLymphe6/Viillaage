export default function ModerationPage() {
    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-xl)' }}>
                Modération de Contenu
            </h1>

            <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>🛡️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Système de Modération
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', maxWidth: '600px', margin: '0 auto var(--spacing-lg)' }}>
                    Le système de modération permettra de gérer les signalements de contenu, approuver ou supprimer des
                    publications, commentaires et événements signalés, et prendre des mesures contre les utilisateurs
                    contrevenants.
                </p>

                <div style={{
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: 'var(--spacing-xl)'
                }}>
                    <h3 style={{ fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                        Fonctionnalités à venir :
                    </h3>
                    <ul style={{ textAlign: 'left', lineHeight: '2', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                        <li>File d'attente des signalements</li>
                        <li>Revue de contenu signalé</li>
                        <li>Actions de modération (supprimer, approuver)</li>
                        <li>Historique des actions</li>
                        <li>Sanctions utilisateurs</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
