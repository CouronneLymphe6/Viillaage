/**
 * Service Gemini AI
 * Gère les appels à l'API Google Gemini pour la génération de contenu
 */

import { logger } from './logger';

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
                logger.error(`Gemini API attempt ${attempt}/${maxRetries} failed:`, lastError);

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
                logger.error(`Gemini no response attempt ${attempt}/${maxRetries}:`, lastError);

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
            logger.error(`Gemini attempt ${attempt}/${maxRetries} failed:`, lastError);

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

    const prompt = `Tu es le rédacteur en chef de "LA GAZETTE DE BEAUPUY", le journal quotidien de l'application Village de Beaupuy (31850).

Ton rôle : Écrire un article de GAZETTE LOCALE détaillé et vivant sur ce qu'il s'est passé HIER dans le village, dans le style d'un vrai journal de village que les habitants auraient plaisir à lire chaque matin.

⚠️ STYLE GAZETTE OBLIGATOIRE :
- Écris comme un VRAI JOURNALISTE LOCAL, pas comme un bot
- Utilise un ton JOURNALISTIQUE : informatif, précis, mais chaleureux
- RACONTE les faits avec des DÉTAILS CONCRETS (noms, lieux, heures, descriptions)
- Structure ton article comme dans un VRAI JOURNAL LOCAL
- Ne te contente JAMAIS de répéter des chiffres secs

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

📝 CONSIGNES DE RÉDACTION (STYLE GAZETTE) :

1. **TON JOURNALISTIQUE** : 
   - Écris comme dans La Dépêche du Midi ou France Bleu
   - Factuel mais engageant
   - Utilise des formulations de presse locale : "Hier à Beaupuy...", "Les habitants ont...", "L'association annonce..."

2. **LONGUEUR** : 200-300 mots minimum. Les lecteurs veulent un VRAI ARTICLE, pas un tweet.

3. **STRUCTURE D'ARTICLE** :
   - **Chapô** (1-2 phrases) : L'essentiel en ouverture
   - **Corps** (2-4 paragraphes) : Développement avec détails
   - **Chute** : Conclusion ou ouverture vers l'avenir

4. **EXEMPLES DE STYLE GAZETTE** :
   
   ❌ MAUVAIS (style bot) : 
   "Hier, 3 alertes ont été créées et 2 événements."
   
   ✅ BON (style gazette) : 
   "Journée animée hier à Beaupuy. En début de soirée, Marie Dupont a signalé une voiture suspecte stationnée rue des Roses. L'alerte a rapidement été levée : il s'agissait d'un visiteur égaré. Côté vie associative, l'association culturelle a dévoilé le programme de la Fête de la Musique du 21 juin. Au programme : concerts, food trucks et animations pour toute la famille."

5. **TRAITEMENT PAR RUBRIQUE** :
   
   🚨 **FAITS DIVERS** : Raconte l'histoire complète
   "Marie Dupont a signalé hier soir vers 22h une activité suspecte rue des Lilas. Les voisins se sont mobilisés et la situation est revenue à la normale."
   
   📅 **AGENDA** : Donne tous les détails pratiques
   "L'association du village organise la Grande Fête du 14 Juillet. Rendez-vous le samedi 13 juillet dès 19h sur la place de la Mairie pour un apéro convivial, suivi d'un feu d'artifice à 23h. Pierre Martin, président, promet 'une belle soirée familiale'."
   
   🏪 **VIE ÉCONOMIQUE** : Mets en avant les acteurs locaux
   "La Boulangerie du Village lance une nouveauté gourmande : des croissants aux amandes maison. Jean, le boulanger, conseille de passer tôt car la production est limitée à une fournée quotidienne."

6. **SI JOURNÉE CALME** :
   "Journée paisible hier à Beaupuy. Pas de grandes nouvelles, le village profite de cette accalmie. L'occasion de consulter l'agenda des événements à venir ou de découvrir les nouvelles annonces du marché local."

7. **FORMAT DE RÉPONSE (JSON STRICT)** :
{
  "title": "Un titre de gazette accrocheur (ex: 'Alerte levée rue des Roses, la Fête de la Musique se précise', 'Beaupuy se mobilise pour le vide-grenier', 'Une journée tranquille au village')",
  "content": "L'article complet de 200-300 mots, structuré comme un vrai article de presse locale avec chapô, développement et chute"
}

🎯 OBJECTIF : Que les habitants se disent "C'est comme lire le journal local !" et prennent PLAISIR à découvrir ce qui s'est passé hier.`;

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
        logger.error("Erreur parsing Gemini:", error);
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
