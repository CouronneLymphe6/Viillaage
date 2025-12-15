export default function Constitution() {
    const currentYear = new Date().getFullYear();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--primary)', textAlign: 'center' }}>
                📜 La Constitution de Viillaage
            </h1>

            <div style={{
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)',
                backgroundColor: '#e8f5e9',
                borderLeft: '4px solid #4caf50',
                borderRadius: 'var(--radius-md)'
            }}>
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1.05rem' }}>
                    <strong>Bienvenue sur Viillaage</strong><br />
                    Viillaage est un espace numérique dédié à la vie locale.
                    Il a été créé pour simplifier le quotidien, renforcer les liens entre habitants, et valoriser celles et ceux qui font vivre la commune.
                </p>
            </div>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🌱 L'esprit Viillaage
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage n'est pas un réseau social classique.
                    Ce n'est ni un espace de buzz, ni un lieu de conflit.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    C'est un outil collectif, pensé pour :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>mieux s'informer</li>
                    <li>mieux s'entraider</li>
                    <li>mieux vivre ensemble, localement</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🏡 Le local avant tout
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Tout ce qui est publié sur Viillaage doit avoir un lien direct avec la vie du village ou du quartier.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ color: '#4caf50' }}>✓ Infos pratiques, événements, entraide, alertes, initiatives locales : oui.</strong>
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#f44336' }}>✗ Sujets sans lien avec le territoire : non.</strong>
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🤝 Respect et bienveillance
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Sur Viillaage :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>chacun s'exprime librement, dans le respect</li>
                    <li>les désaccords sont possibles, les attaques personnelles ne le sont pas</li>
                    <li>les échanges doivent rester courtois et constructifs</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontWeight: '600' }}>
                    Les propos insultants, agressifs, discriminatoires ou menaçants n'ont pas leur place ici.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    📣 Une information responsable
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Chaque utilisateur est responsable de ce qu'il publie.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Merci de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>éviter les rumeurs et les accusations</li>
                    <li>vérifier les informations avant de les partager</li>
                    <li>rester factuel, surtout pour les alertes</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontStyle: 'italic' }}>
                    Viillaage vise à informer, pas à inquiéter.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🚫 Pas de polémiques inutiles
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage n'est pas un espace de débats politiques nationaux, idéologiques ou polémiques.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ color: '#4caf50' }}>✓ Les informations municipales et locales sont les bienvenues.</strong>
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#f44336' }}>✗ Les affrontements, provocations ou campagnes partisanes ne le sont pas.</strong>
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🛒 Les professionnels sur Viillaage
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Les commerces, artisans et services locaux sont des acteurs à part entière de la vie du village.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Ils peuvent :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                    <li>se présenter</li>
                    <li>informer</li>
                    <li>partager ponctuellement leurs actualités ou initiatives</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Ils s'engagent à :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>éviter toute communication intrusive</li>
                    <li>respecter les habitants et les espaces de discussion</li>
                    <li>privilégier la proximité plutôt que la publicité agressive</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🔒 Vie privée et confiance
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage respecte la vie privée de chacun.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Il est demandé de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>ne pas publier d'informations personnelles sur autrui</li>
                    <li>ne pas partager de contenus sans consentement</li>
                    <li>utiliser Viillaage dans un esprit de confiance et de respect mutuel</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🛡️ Un espace modéré
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage est modéré afin de préserver un environnement sain et utile.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    La modération peut :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>intervenir en cas de non-respect des règles</li>
                    <li>retirer un contenu inapproprié</li>
                    <li>rappeler le cadre si nécessaire</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontStyle: 'italic' }}>
                    L'objectif n'est pas de sanctionner, mais de protéger la communauté.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🌿 Une plateforme qui évolue
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage est un projet vivant.
                    Il évolue avec les usages, les besoins locaux et les retours des habitants.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Les règles peuvent s'adapter, tout en conservant l'esprit initial.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    🤍 La règle essentielle
                </h2>
                <div style={{
                    padding: 'var(--spacing-lg)',
                    backgroundColor: '#fff3e0',
                    borderLeft: '4px solid #ff9800',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    <p style={{ margin: 0, lineHeight: '1.8', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        Avant de publier, pose-toi simplement cette question :
                    </p>
                    <p style={{ margin: '8px 0 0 0', lineHeight: '1.8', fontSize: '1.15rem', fontStyle: 'italic', color: '#e65100' }}>
                        "Est-ce utile ou positif pour la vie du village ?"
                    </p>
                </div>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '1.05rem' }}>
                    Si la réponse est oui, tu es au bon endroit.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    ✔️ En utilisant Viillaage
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    En t'inscrivant, tu acceptes la Constitution de Viillaage et tu contribues à faire de cet espace un outil agréable, utile et respectueux pour tous.
                </p>
            </section>

            <div style={{
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-xl)',
                backgroundColor: '#e8f5e9',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    Merci de faire vivre Viillaage 🌱
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Dernière mise à jour : Décembre {currentYear}</strong><br />
                    Version 1.0
                </p>
            </div>
        </div>
    );
}
