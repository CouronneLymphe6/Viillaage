/**
 * Service Gemini AI
 * Gère les appels à l'API Google Gemini pour la génération de contenu
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-flash-lite-latest'; // Version LITE = plus économique
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface GeminiResponse {
    text: string;
    success: boolean;
    error?: string;
}

/**
 * Génère du contenu avec Gemini AI
 * @param prompt Le prompt à envoyer à l'IA
 * @param maxRetries Nombre de tentatives en cas d'échec
 * @returns La réponse générée par l'IA
 */
export async function generateContent(
    prompt: string,
    maxRetries: number = 3
): Promise<GeminiResponse> {
    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY non définie dans .env');
        return {
            text: '',
            success: false,
            error: 'Clé API Gemini non configurée',
        };
    }

    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048, // Increased for richer daily summaries
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                lastError = `API Error ${response.status}: ${errorData}`;
                console.error(`❌ Tentative ${attempt}/${maxRetries} échouée:`, lastError);

                // Attendre avant de réessayer (backoff exponentiel)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }

                return {
                    text: '',
                    success: false,
                    error: lastError,
                };
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                lastError = 'Aucune réponse générée par l\'IA';
                console.error(`❌ Tentative ${attempt}/${maxRetries}:`, lastError);

                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }

                return {
                    text: '',
                    success: false,
                    error: lastError,
                };
            }

            const generatedText = data.candidates[0].content.parts[0].text;

            return {
                text: generatedText,
                success: true,
            };
        } catch (error) {
            lastError = error instanceof Error ? error.message : 'Erreur inconnue';
            console.error(`❌ Tentative ${attempt}/${maxRetries} échouée:`, lastError);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }
        }
    }

    return {
        text: '',
        success: false,
        error: lastError || 'Échec après plusieurs tentatives',
    };
}

/**
 * Génère un résumé des activités quotidiennes du village
 */
export interface DailySummaryResponse {
    title?: string;
    content?: string;
    text?: string;
    success: boolean;
    error?: string;
}

export async function generateDailySummary(stats: {
    date: string;
    totalMessages: number;
    activeChannels: number;
    topTopics: string[];
    popularMessages: string[];
    newAlerts: number;
    alertTypes: string[];
    resolvedAlerts: number;
    alertDetails: string[];
    officialAnnouncements: number;
    officialTopics: string[];
    newEvents: number;
    upcomingEvents: number;
    eventDetails: string[];
    proPosts: number;
    newProducts: number;
    activeBusinesses: string[];
    newListings: number;
    listingCategories: string[];
}, weather?: any): Promise<DailySummaryResponse> {
    // Note: Le paramètre weather est conservé pour la compatibilité mais ignoré.

    const prompt = `Tu es le rédacteur de "LES POTINS DE BEAUPUY", la gazette quotidienne de l'application Village de Beaupuy (31850).

Ton rôle : Écrire un résumé DÉTAILLÉ et VIVANT de ce qu'il s'est passé HIER dans le village, comme un journal local que les habitants auraient plaisir à lire chaque matin avec leur café.

⚠️ CRUCIAL :
- Ne te contente PAS de répéter les chiffres
- RACONTE ce qui s'est passé avec des DÉTAILS CONCRETS
- Utilise les vrais noms, les vraies dates, les vraies descriptions
- Écris comme un JOURNALISTE LOCAL, pas comme un bot

📊 DONNÉES D'HIER (${stats.date}) :

📬 MESSAGERIE (${stats.totalMessages} messages sur ${stats.activeChannels} canaux) :
${stats.topTopics.length > 0 ? `Sujets détectés : ${stats.topTopics.join(', ')}` : ''}
${(stats as any).messageSnippets ? `\nExtraits des discussions :\n${(stats as any).messageSnippets}` : ''}
${stats.popularMessages.length > 0 ? `\nMessages populaires :\n${stats.popularMessages.join('\n')}` : ''}

🚨 SÉCURITÉ (${stats.newAlerts} alertes(s)) :
${(stats as any).alertDetailedList || stats.alertDetails.join('\n')}
${stats.resolvedAlerts > 0 ? `\n✅ ${stats.resolvedAlerts} alerte(s) résolue(s)` : ''}

📢 OFFICIEL : ${stats.officialAnnouncements} annonce(s) officielles.
${stats.officialTopics.length > 0 ? `Sujets : ${stats.officialTopics.join(', ')}` : ''}

📅 ÉVÉNEMENTS : ${stats.newEvents} nouvel(aux) événement(s) créé(s).
${(stats as any).eventDetailedList || stats.eventDetails.join('\n')}
${stats.upcomingEvents > 0 ? `\n🔜 ${stats.upcomingEvents} événement(s) à venir prochainement` : ''}

🏪 VIE LOCALE (Commerces & Associations) :
${stats.proPosts} publication(s) de professionnels.
${(stats as any).proPostDetails || ''}
${stats.activeBusinesses.length > 0 ? `\nCommerçants actifs : ${stats.activeBusinesses.join(', ')}` : ''}
${stats.newProducts > 0 ? `\n🆕 ${stats.newProducts} nouveau(x) produit(s)/service(s)` : ''}

🛍️ MARCHÉ : ${stats.newListings} nouvelle(s) annonce(s).
${stats.listingCategories.length > 0 ? `Catégories : ${stats.listingCategories.join(', ')}` : ''}

📝 CONSIGNES DE RÉDACTION (STRICTES) :

1. **TON** : Chaleureux, factuel, utile. Tu connais tout le monde au village. Tu RACONTES ce qui s'est passé comme tu le ferais à un voisin.

2. **LONGUEUR** : 200-300 mots. C'EST IMPORTANT ! Les habitants veulent LIRE quelque chose, pas juste 2 lignes.

3. **STRUCTURE** :
   - Introduction accrocheuse (météo de l'activité du village)
   - 2-4 paragraphes détaillés
   - Conclusion avec un clin d'œil ou une invitation

4. **DÉTAILS OBLIGATOIRES** :
   
   🚨 **ALERTES** :
   NE DIS JAMAIS : "1 alerte signalée"
   ✅ DIS PLUTÔT : "Marie Dupont a signalé hier soir une activité suspecte rue des Lilas vers 22h. L'alerte a été prise en charge par les voisins et la situation est revenue à la normale."
   
   📅 **ÉVÉNEMENTS** :
   NE DIS JAMAIS : "1 événement créé"
   ✅ DIS PLUTÔT : "L'association du village organise la Grande Fête du 14 Juillet ! Rendez-vous le samedi 13 juillet sur la place de la Mairie pour un apéro convivial suivi d'un feu d'artifice. Pierre Martin, président de l'association, promet une belle soirée."
   
   🏪 **COMMERCES** :
   NE DIS JAMAIS : "1 publication"
   ✅ DIS PLUTÔT : "La Boulangerie du Village annonce de bonnes nouvelles : des croissants aux amandes font leur apparition cette semaine ! Jean, le boulanger, recommande de passer tôt car il n'en fait qu'une fournée par jour."
   
   💬 **MESSAGERIE** :
   ✅ Synthétise l'AMBIANCE : "Les discussions ont tourné autour de l'organisation du vide-grenier du mois prochain. Sophie et Thomas ont proposé d'aider pour la logistique."

5. **SI C'EST CALME** :
   "Une journée paisible hier à Beaupuy. Pas de grandes nouvelles, juste la vie qui suit son cours tranquille. Profitez-en pour consulter l'agenda des événements à venir ou faire un tour sur le marché local !"

6. **EXEMPLES DE BON STYLE** :
   ❌ MAUVAIS : "Hier, 3 alertes ont été créées et 2 événements."
   ✅ BON : "Journée mouvementée hier au village ! Marie a signalé une voiture suspecte stationnée rue des Roses, vite identifiée comme celle d'un visiteur. Plus tard, l'association a dévoilé les détails de la Fête de la Musique du 21 juin — programme alléchant en vue !"

7. **FORMAT DE RÉPONSE (JSON STRICT)** :
{
  "title": "Un titre accrocheur style journal (ex: 'Alerte colis suspect et Fête à venir', 'Beaupuy se prépare pour le vide-grenier', 'Journée tranquille au village')",
  "content": "Le résumé complet DÉTAILLÉ de 200-300 mots avec tous les détails concrets, noms, dates, descriptions..."
}

🎯 OBJECTIF : Que les habitants se disent "Ah super, je sais ce qui s'est passé hier !" et prennent PLAISIR à lire.`;

    const result = await generateContent(prompt);

    if (!result.success) {
        return { success: false, error: result.error };
    }

    try {
        // Nettoyage des balises markdown json si présentes
        const cleanJson = result.text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
            success: true,
            title: parsed.title,
            content: parsed.content,
            text: cleanJson // Fallback
        };
    } catch (error) {
        console.error("Erreur parsing Gemini:", error);
        // Fallback: retourner le texte brut mais essayer de nettoyer un peu
        return {
            success: true,
            title: "L'Essentiel de Beaupuy",
            content: result.text.replace(/```json\n?|\n?```/g, ''),
            text: result.text
        };
    }
}

/**
 * Génère une revue de presse locale
 */
export async function generatePressReview(articles: Array<{
    title: string;
    source: string;
    publishedAt: string;
    snippet: string;
    url: string;
}>, date: string): Promise<GeminiResponse> {
    const articlesText = articles.length > 0
        ? articles.map((article, i) => `
${i + 1}. ${article.title}
   Source : ${article.source}
   Date : ${article.publishedAt}
   Extrait : ${article.snippet}
   Lien : ${article.url}
`).join('\n')
        : 'Aucun article trouvé';

    const prompt = `Tu es un journaliste local spécialisé dans l'actualité de **Beaupuy 31850** (Haute-Garonne, à l'est de Toulouse) et UNIQUEMENT ses communes voisines directes : Balma, Mons, Lavalette, Montrabé, Pin-Balma.

⚠️ IMPORTANT : NE PAS confondre avec :
- Beaupuy (Lot-et-Garonne, 47200)
- D'autres Beaupuy en France
Concentre-toi UNIQUEMENT sur Beaupuy 31850 et ses 5 communes voisines listées ci-dessus.

Voici ${articles.length} articles d'actualités locales récents :

${articlesText}

Ta mission : Rédiger une revue de presse synthétique et pertinente pour les habitants de Beaupuy 31850.

CONSIGNES :
1. Résume en 120-150 mots les actualités pertinentes pour Beaupuy
2. Priorise :
   - Actualités de Beaupuy en premier
   - Puis communes limitrophes
   - Puis actualités régionales impactant la zone
3. Structure :
   - Titre accrocheur (si actualité majeure)
   - 2-3 points d'actualité maximum
   - Ton informatif mais accessible
4. Si AUCUN article pertinent :
   Réponds : "Aucune actualité locale majeure hier dans la presse pour Beaupuy et ses environs. Restez connectés pour les prochaines nouvelles !"
5. Cite les sources entre parenthèses : (La Dépêche)
6. Ne mentionne QUE les articles fournis
7. Évite le sensationnalisme

Exemple :
"Travaux sur la D112 : La route reliant Beaupuy à Balma sera partiellement fermée cette semaine pour rénovation (La Dépêche). À Castelmaurou, le nouveau complexe sportif a ouvert ses portes avec succès (France Bleu). La métropole toulousaine annonce un renforcement des transports en commun vers l'est toulousain, bénéficiant aux habitants de Beaupuy (Actu Toulouse)."

Rédige maintenant la revue de presse :`;

    return generateContent(prompt);
}
