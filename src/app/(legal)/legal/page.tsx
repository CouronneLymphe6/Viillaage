export default function MentionsLegales() {
    const currentYear = new Date().getFullYear();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--primary)' }}>Mentions Légales</h1>

            <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)', fontStyle: 'italic' }}>
                Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique,
                il est précisé aux utilisateurs du site Viillaage l'identité des différents intervenants dans le cadre de sa
                réalisation et de son suivi.
            </p>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    1. Édition du site
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Le site <strong>Viillaage</strong> (ci-après "le Site") est édité par :<br /><br />

                    <strong>[Raison sociale ou nom du fondateur]</strong><br />
                    [Forme juridique - ex: SARL / SAS / Auto-entrepreneur / Association loi 1901]<br />
                    Capital social de [montant] euros (si applicable)<br />
                    Siège social : [Adresse complète]<br />
                    RCS [Ville] : [Numéro d'immatriculation] (si société)<br />
                    SIRET : [Numéro SIRET]<br />
                    N° TVA intracommunautaire : [Numéro] (si applicable)<br /><br />

                    Téléphone : [Numéro de téléphone]<br />
                    Email : contact@viillaage.fr<br /><br />

                    Directeur de la publication : <strong>[Prénom NOM du directeur de publication]</strong><br />
                    Contact : directeur@viillaage.fr
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    2. Hébergement
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Le Site est hébergé par :<br /><br />

                    <strong>[Nom de l'hébergeur - ex: OVH SAS / Hetzner / etc.]</strong><br />
                    Siège social : [Adresse de l'hébergeur]<br />
                    Téléphone : [Numéro]<br />
                    Site web : [URL de l'hébergeur]
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    3. Délégué à la Protection des Données (DPO)
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous pouvez exercer vos droits
                    en contactant notre Délégué à la Protection des Données :<br /><br />

                    Email : dpo@viillaage.fr<br />
                    Adresse postale : [Adresse DPO]
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    4. Propriété intellectuelle
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    L'ensemble des éléments du Site (structure, textes, graphismes, logiciels, sons, photographies, images,
                    vidéos, charte graphique, marques, logos, etc.) est la propriété exclusive de <strong>Viillaage</strong>,
                    sauf mentions particulières.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments
                    du Site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Toute exploitation non autorisée du Site ou de l'un des éléments qu'il contient sera considérée comme
                    constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants
                    du Code de Propriété Intellectuelle.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    5. Contenus utilisateurs
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Les utilisateurs du Site sont responsables des contenus qu'ils publient. En publiant un contenu,
                    l'utilisateur garantit détenir tous les droits nécessaires sur ce contenu et concède à Viillaage une
                    licence mondiale, non exclusive, gratuite et transférable pour utiliser, reproduire, distribuer,
                    préparer des œuvres dérivées, afficher et exécuter ce contenu dans le cadre du fonctionnement du Service.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    6. Limitation de responsabilité
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    <strong>Viillaage</strong> met tout en œuvre pour offrir aux utilisateurs des informations et/ou outils
                    disponibles et vérifiés, mais ne saurait être tenue pour responsable des erreurs, d'une absence de disponibilité
                    des informations et/ou de la présence de virus sur son site.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Les informations fournies par <strong>Viillaage</strong> le sont à titre indicatif et ne sauraient dispenser
                    l'utilisateur d'une analyse complémentaire et personnalisée.
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    <strong>Viillaage</strong> ne saurait garantir l'exactitude, la complétude, l'actualité des informations
                    diffusées sur son site. En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa
                    responsabilité exclusive.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    7. Liens hypertextes
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Le Site peut contenir des liens hypertextes vers d'autres sites. <strong>Viillaage</strong> n'exerce
                    aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou à leur utilisation.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    8. Droit applicable et attribution de juridiction
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Tout litige en relation avec l'utilisation du site <strong>Viillaage</strong> est soumis au droit français.
                    En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux
                    compétents de [Ville du siège social].
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    9. Médiation
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Conformément à l'article L.612-1 du Code de la consommation, il est rappelé que tout consommateur a le
                    droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige
                    qui l'opposerait à un professionnel.
                </p>
            </section>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                Dernière mise à jour : Décembre {currentYear}
            </p>
        </div>
    );
}
