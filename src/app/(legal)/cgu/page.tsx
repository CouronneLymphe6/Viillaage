export default function CGU() {
    const currentYear = new Date().getFullYear();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--primary)' }}>
                Conditions Générales d'Utilisation
            </h1>

            <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)', fontStyle: 'italic' }}>
                Date d'entrée en vigueur : Décembre {currentYear}
            </p>

            <div style={{
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)',
                backgroundColor: '#fff3cd',
                borderLeft: '4px solid #ffc107',
                borderRadius: 'var(--radius-md)'
            }}>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                    <strong>Important :</strong> Veuillez lire attentivement ces Conditions Générales d'Utilisation avant
                    d'utiliser Viillaage. En accédant ou en utilisant notre plateforme, vous acceptez d'être lié par ces conditions.
                </p>
            </div>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    1. Objet et champ d'application
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les modalités
                    et conditions dans lesquelles Viillaage (ci-après "Viillaage", "nous", "notre") met à disposition des
                    utilisateurs (ci-après "Utilisateur", "vous", "votre") sa plateforme de réseau social local accessible à
                    l'adresse [URL du site].
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Les CGU s'appliquent à tous les utilisateurs de la plateforme, qu'ils soient simples visiteurs,
                    utilisateurs inscrits, professionnels ou administrateurs.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    2. Acceptation des CGU
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    <strong>L'utilisation de Viillaage implique l'acceptation pleine et entière des présentes CGU.</strong>
                    Si vous n'acceptez pas ces conditions, vous devez vous abstenir d'utiliser la plateforme.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Nous nous réservons le droit de modifier les CGU à tout moment. Les utilisateurs seront informés de
                    toute modification substantielle par email ou notification sur la plateforme. L'utilisation continue de
                    Viillaage après ces modifications constitue votre acceptation des nouvelles CGU.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    3. Description du service
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage est un réseau social local permettant aux habitants d'une même commune de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Échanger des informations et communiquer avec leurs voisins</li>
                    <li>Découvrir et suivre les commerces et associations locales</li>
                    <li>Être informé des événements de leur commune</li>
                    <li>Accéder aux informations officielles de la mairie</li>
                    <li>Participer à la vie locale de leur village</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    4. Conditions d'accès et d'inscription
                </h2>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', color: 'var(--primary)' }}>
                    4.1. Conditions d'accès
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    L'accès à Viillaage est réservé :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                    <li>Aux personnes physiques âgées de 16 ans révolus (ou 13 ans avec autorisation parentale)</li>
                    <li>Aux personnes morales (entreprises, associations, collectivités)</li>
                    <li>Disposant de la pleine capacité juridique</li>
                </ul>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', color: 'var(--primary)' }}>
                    4.2. Création de compte
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Pour utiliser Viillaage, vous devez créer un compte en fournissant des informations exactes, complètes et
                    à jour. Vous vous engagez à :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Fournir des informations d'identification véridiques</li>
                    <li>Ne créer qu'un seul compte par personne physique</li>
                    <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                    <li>Informer immédiatement Viillaage de toute utilisation non autorisée de votre compte</li>
                    <li>Mettre à jour vos informations en cas de changement</li>
                </ul>

                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontWeight: '600' }}>
                    Vous êtes entièrement responsable de toute activité effectuée depuis votre compte.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    5. Règles d'utilisation et obligations de l'utilisateur
                </h2>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', color: 'var(--primary)' }}>
                    5.1. Comportement interdit
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Il est strictement interdit de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Publier du contenu illégal, diffamatoire, injurieux, obscène, pornographique, violent ou discriminatoire</li>
                    <li>Harceler, intimider, menacer ou porter atteinte à la vie privée d'autrui</li>
                    <li>Usurper l'identité d'une personne ou d'une entité</li>
                    <li>Publier du contenu portant atteinte aux droits de propriété intellectuelle de tiers</li>
                    <li>Diffuser du spam, des chaînes de messages ou du contenu publicitaire non sollicité</li>
                    <li>Propager des virus, malwares ou tout code malveillant</li>
                    <li>Tenter d'accéder de manière non autorisée au système ou aux comptes d'autres utilisateurs</li>
                    <li>Collecter des données personnelles d'autres utilisateurs sans leur consentement</li>
                    <li>Utiliser des robots, scrapers ou tout moyen automatisé pour accéder au service</li>
                    <li>Créer de faux comptes ou manipuler les métriques (likes, followers, etc.)</li>
                </ul>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)', color: 'var(--primary)' }}>
                    5.2. Contenu utilisateur
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous conservez l'entière propriété intellectuelle de vos contenus. Toutefois, en publiant du contenu sur
                    Viillaage, vous accordez à Viillaage une licence mondiale, non exclusive, gratuite, cessible et transférable
                    pour utiliser, reproduire, distribuer, modifier, adapter, publier, traduire, créer des œuvres dérivées,
                    afficher et exécuter ce contenu en relation avec le fonctionnement et la promotion du service.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Vous garantissez détenir tous les droits nécessaires sur les contenus que vous publiez et que ces contenus
                    ne violent aucun droit de tiers ni aucune loi applicable.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    6. Modération et suppression de contenu
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage se réserve le droit, sans préavis ni obligation de justification, de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Modérer, éditer, refuser ou supprimer tout contenu qui ne respecte pas les présentes CGU</li>
                    <li>Suspendre ou résilier l'accès de tout utilisateur en cas de violation des CGU</li>
                    <li>Signaler aux autorités compétentes tout contenu illicite</li>
                    <li>Conserver les preuves nécessaires pour toute procédure judiciaire</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>
                    La modération ne confère aucune obligation générale de surveillance à Viillaage, qui agit en tant
                    qu'hébergeur au sens de la LCEN.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    7. Disponibilité et modifications du service
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage s'efforce d'assurer l'accessibilité du service 24h/24 et 7j/7, mais ne peut garantir une
                    disponibilité ininterrompue en raison de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Opérations de maintenance, mises à jour ou améliorations</li>
                    <li>Pannes techniques, interruptions de connexion internet</li>
                    <li>Cas de force majeure</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>
                    Viillaage se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment,
                    temporairement ou définitivement, sans préavis.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    8. Limitation de responsabilité
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    <strong>Viillaage agit en qualité d'hébergeur</strong> et ne saurait être tenu responsable du contenu
                    publié par les utilisateurs, sauf s'il n'agit pas promptement pour retirer ou rendre inaccessible
                    tout contenu manifestement illicite après en avoir été informé.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    <strong>Dans les limites autorisées par la loi</strong>, Viillaage ne pourra être tenu responsable de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Tout dommage direct ou indirect résultant de l'utilisation ou de l'impossibilité d'utiliser le service</li>
                    <li>La perte de données, d'opportunités commerciales ou de profits</li>
                    <li>Les interactions entre utilisateurs (rencontres, transactions, litiges)</li>
                    <li>L'exactitude, la fiabilité ou l'actualité des informations publiées par les utilisateurs</li>
                    <li>Les virus ou autres composants nuisibles transmis via le service</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    9. Propriété intellectuelle
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Tous les éléments de Viillaage (logiciels, bases de données, textes, graphismes, logos, icônes, sons,
                    vidéos, architecture, structure) sont la propriété exclusive de Viillaage et sont protégés par les lois
                    françaises et internationales relatives à la propriété intellectuelle.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>
                    Toute reproduction, représentation, modification ou exploitation non autorisée constitue une contrefaçon
                    sanctionnée par le Code de la propriété intellectuelle.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    10. Résiliation
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Viillaage se réserve le droit de suspendre ou supprimer votre compte, avec ou sans préavis, en cas de :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Violation des présentes CGU</li>
                    <li>Activité frauduleuse ou illicite</li>
                    <li>Demande des autorités compétentes</li>
                    <li>Inactivité prolongée (plus de 24 mois)</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>
                    En cas de résiliation, certains contenus peuvent être conservés conformément à nos obligations légales
                    ou pour des raisons de sécurité.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    11. Protection des données personnelles
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Le traitement de vos données personnelles est décrit en détail dans notre{' '}
                    <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        Politique de Confidentialité
                    </a>, qui fait partie intégrante des présentes CGU.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    12. Droit applicable et règlement des litiges
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Les présentes CGU sont régies par le droit français.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    En cas de litige, nous vous invitons à nous contacter en priorité à l'adresse <strong>contact@viillaage.fr</strong>
                    afin de rechercher une solution amiable.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Conformément à l'article L.612-1 du Code de la consommation, vous avez également le droit de recourir
                    gratuitement à un médiateur de la consommation.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    À défaut de résolution amiable, tout litige relèvera de la compétence exclusive des tribunaux français,
                    sauf dispositions impératives contraires.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    13. Dispositions diverses
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Si une disposition des présentes CGU est déclarée nulle ou inapplicable, les autres dispositions
                    resteront en vigueur.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Le fait pour Viillaage de ne pas exercer un droit prévu par les présentes CGU ne constitue pas une
                    renonciation à ce droit.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    14. Contact
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Pour toute question concernant les présentes CGU, vous pouvez nous contacter :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)', listStyle: 'none' }}>
                    <li>• Par email : <strong>contact@viillaage.fr</strong></li>
                    <li>• Via notre <a href="/contact" style={{ color: 'var(--primary)' }}>formulaire de contact</a></li>
                </ul>
            </section>

            <div style={{
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-xl)',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Dernière mise à jour : Décembre {currentYear}</strong><br />
                    Version 1.0
                </p>
            </div>
        </div>
    );
}
