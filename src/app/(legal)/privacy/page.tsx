export default function Privacy() {
    const currentYear = new Date().getFullYear();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--primary)' }}>
                Politique de Confidentialité et Protection des Données (RGPD)
            </h1>

            <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontStyle: 'italic' }}>
                Date de dernière mise à jour : Décembre {currentYear}
            </p>

            <div style={{
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)',
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid var(--primary)',
                borderRadius: 'var(--radius-md)'
            }}>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                    <strong>Viillaage</strong> attache une grande importance à la protection de vos données personnelles.
                    Cette politique décrit comment nous collectons, utilisons, stockons et protégeons vos informations
                    conformément au Règlement Général sur la Protection des Données (RGPD 2016/679) et à la loi Informatique
                    et Libert és modifiée.
                </p>
            </div>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    1. Identité du responsable du traitement
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Le responsable du traitement de vos données personnelles est :<br /><br />

                    <strong>[Raison sociale ou nom]</strong><br />
                    [Adresse complète]<br />
                    Email : contact@viillaage.fr<br />
                    SIRET : [Numéro]<br /><br />

                    Délégué à la Protection des Données (DPO) :<br />
                    Email : <strong>dpo@viillaage.fr</strong><br />
                    Adresse postale : [Adresse DPO]
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    2. Données personnelles collectées
                </h2>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', color: 'var(--primary)' }}>
                    2.1. Données fournies directement par vous
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Lors de la création de votre compte et de l'utilisation de nos services, nous collectons :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li><strong>Informations d'identité :</strong> Nom, prénom, pseudonyme, email</li>
                    <li><strong>Informations de profil :</strong> Photo de profil, biographie, date de naissance (optionnel)</li>
                    <li><strong>Informations de localisation :</strong> Nom du  village, code postal</li>
                    <li><strong>Coordonnées :</strong> Adresse postale, numéro de téléphone (optionnels)</li>
                    <li><strong>Contenus générés :</strong> Publications, commentaires, messages, photos, vidéos</li>
                    <li><strong>Informations professionnelles :</strong> Pour les comptes professionnels (raison sociale, SIRET, secteur d'activité)</li>
                </ul>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)', color: 'var(--primary)' }}>
                    2.2. Données collectées automatiquement
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Lors de votre navigation sur Viillaage, nous collectons automatiquement :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li><strong>Données de connexion :</strong> Adresse IP, type de navigateur, système d'exploitation</li>
                    <li><strong>Données de navigation :</strong> Pages visitées, durée de visite, liens cliqués</li>
                    <li><strong>Données d'interaction :</strong> Likes, commentaires, partages, abonnements</li>
                    <li><strong>Cookies et technologies similaires :</strong> Voir notre <a href="/cookies" style={{ color: 'var(--primary)' }}>Politique des Cookies</a></li>
                    <li><strong>Données de géolocalisation :</strong> Si vous nous y autorisez explicitement</li>
                </ul>

                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)', color: 'var(--primary)' }}>
                    2.3. Données provenant de tiers
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Si vous vous inscrivez via un service tiers (Google, Facebook), nous recevons les informations autorisées
                    par ce service (nom, email, photo de profil).
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    3. Finalités du traitement et bases légales
                </h2>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--background)' }}>
                                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Finalité</th>
                                <th style={{ padding: 'var(--spacing-sm)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Base légale</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Création et gestion de votre compte</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Exécution du contrat</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Fourniture des services de réseau social</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Exécution du contrat</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Communication (notifications, newsletters)</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Consentement / Intérêt légitime</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Modération des contenus</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Intérêt légitime / Obligation légale</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Amélioration du service et analyses statistiques</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Intérêt légitime</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Sécurité et prévention de la fraude</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Intérêt légitime / Obligation légale</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Respect de nos obligations légales</td>
                                <td style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)' }}>Obligation légale</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    4. Destinataires de vos données
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vos données personnelles sont accessibles à :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li><strong>Personnel de Viillaage :</strong> Dans le cadre strict de leurs fonctions (développement, support, modération)</li>
                    <li><strong>Autres utilisateurs :</strong> Pour les données de profil public que vous choisissez de partager</li>
                    <li><strong>Prestataires techniques :</strong> Hébergement (serveurs sécurisés), maintenance, outils d'analyse</li>
                    <li><strong>Autorités publiques :</strong> Sur réquisition judiciaire ou dans le cadre d'obligations légales</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>
                    <strong>Nous ne vendons jamais vos données personnelles à des tiers.</strong>
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    5. Transferts de données hors UE
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Vos données personnelles sont hébergées et traitées au sein de l'Union Européenne. En cas de transfert
                    hors UE, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types de
                    la Commission européenne, Privacy Shield, ou décision d'adéquation).
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    6. Durée de conservation des données
                </h2>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li><strong>Compte actif :</strong> Pendant toute la durée d'utilisation de votre compte</li>
                    <li><strong>Après suppression du compte :</strong> 3 ans pour les données nécessaires à nos obligations légales et comptables</li>
                    <li><strong>Données de connexion (logs) :</strong> 12 mois conformément à la LCEN</li>
                    <li><strong>Cookies :</strong> 13 mois maximum</li>
                    <li><strong>Données de modération :</strong> 1 an après le traitement du signalement</li>
                    <li><strong>Preuves pour contentieux :</strong> Durée de prescription légale applicable (5 ans en général)</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    7. Vos droits sur vos données personnelles
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Conformément au RGPD, vous disposez des droits suivants :
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', color: 'var(--primary)' }}>
                    ✓ Droit d'accès (Article 15 RGPD)
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez obtenir une copie des données personnelles que nous détenons à votre sujet.
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit de rectification (Article 16 RGPD)
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez demander la correction de vos données inexactes ou incomplètes.
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit à l'effacement / "Droit à l'oubli" (Article 17 RGPD)
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez demander la suppression de vos données dans certains cas (retrait du consentement,
                    données non nécessaires, opposition au traitement).
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit à la limitation du traitement (Article 18 RGPD)
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez demander le gel temporaire de vos données dans certaines situations.
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit à la portabilité (Article 20 RGPD)
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez recevoir vos données dans un format structuré et couramment utilisé, et les transmettre
                    à un autre responsable de traitement.
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit d'opposition (Article 21 RGPD)
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Vous pouvez vous opposer à tout moment au traitement de vos données pour des raisons tenant à votre
                    situation particulière (sauf si nous avons des motifs légitimes impérieux).
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit de retirer votre consentement
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Lorsque le traitement est fondé sur votre consentement, vous pouvez le retirer à tout moment.
                </p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--primary)' }}>
                    ✓ Droit de définir des directives post-mortem
                </h3>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Vous pouvez définir des directives relatives à la conservation, effacement et communication de vos
                    données après votre décès.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    8. Comment exercer vos droits ?
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Pour exercer l'un de vos droits, vous pouvez :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)', listStyle: 'none' }}>
                    <li>• <strong>Nous contacter par email :</strong> dpo@viillaage.fr</li>
                    <li>• <strong>Par courrier postal :</strong> Viillaage - DPO, [Adresse]</li>
                    <li>• <strong>Depuis votre compte :</strong> Paramètres {'->'} Confidentialité et données</li>
                </ul>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontWeight: '600' }}>
                    Nous nous engageons à répondre à votre demande dans un délai maximum d'<strong>1 mois</strong> (prorogeable
                    de 2 mois en cas de complexité).
                </p>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Pour garantir la sécurité de vos données, nous pourrons vous demander une preuve d'identité avant
                    de traiter votre demande.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    9. Sécurité de vos données
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger
                    vos données personnelles :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                    <li>Chiffrement des données sensibles (HTTPS/SSL)</li>
                    <li>Authentification sécurisée (hashage des mots de passe avec bcrypt)</li>
                    <li>Accès aux données limité et contrôlé</li>
                    <li>Sauvegardes régulières et sécurisées</li>
                    <li>Surveillance et détection des intrusions</li>
                    <li>Formation du personnel aux bonnes pratiques de sécurité</li>
                    <li>Procédures de notification en cas de violation de données</li>
                </ul>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    10. Mineurs
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Viillaage est accessible aux personnes âgées de 16 ans minimum. Pour les mineurs de 13 à 15 ans,
                    l'autorisation d'un titulaire de l'autorité parentale est requise. Nous ne collectons pas sciemment
                    de données personnelles d'enfants de moins de 13 ans. Si vous pensez qu'un mineur a fourni des
                    informations sans autorisation, contactez-nous immédiatement.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    11. Cookies et technologies similaires
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Pour plus d'informations sur notre utilisation des cookies, consultez notre{' '}
                    <a href="/cookies" style={{ color: 'var(--primary)', fontWeight: '600' }}>Politique des Cookies</a>.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    12. Modifications de la politique de confidentialité
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Nous pouvons modifier cette politique de confidentialité à tout moment. Toute modification substantielle
                    vous sera notifiée par email ou par une notification sur la plateforme au moins 30 jours avant son entrée
                    en vigueur. Nous vous encourageons à consulter régulièrement cette page.
                </p>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    13. Droit de réclamation auprès de la CNIL
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Si vous estimez, après nous avoir contactés, que vos droits sur vos données ne sont pas respectés,
                    vous pouvez adresser une réclamation (plainte) à la CNIL :
                </p>
                <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: 'var(--spacing-md)'
                }}>
                    <p style={{ margin: 0, lineHeight: '1.6' }}>
                        <strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong><br />
                        3 Place de Fontenoy - TSA 80715<br />
                        75334 PARIS CEDEX 07<br />
                        Téléphone : 01 53 73 22 22<br />
                        Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                            www.cnil.fr
                        </a><br />
                        Formulaire de réclamation en ligne : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                            www.cnil.fr/fr/plaintes
                        </a>
                    </p>
                </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-main)' }}>
                    14. Contact
                </h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    Pour toute question concernant cette politique de confidentialité ou le traitement de vos données :
                </p>
                <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)', listStyle: 'none' }}>
                    <li>• <strong>Email :</strong> dpo@viillaage.fr</li>
                    <li>• <strong>Courrier :</strong> Viillaage - DPO, [Adresse complète]</li>
                    <li>• <strong>Formulaire :</strong> <a href="/contact" style={{ color: 'var(--primary)' }}>Page de contact</a></li>
                </ul>
            </section>

            <div style={{
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-xl)',
                backgroundColor: '#e3f2fd',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    <strong>Nous nous engageons à protéger votre vie privée et à traiter vos données avec la plus
                        grande transparence.</strong>
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Dernière mise à jour : Décembre {currentYear} - Version 1.0
                </p>
            </div>
        </div>
    );
}
