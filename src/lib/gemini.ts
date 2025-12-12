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
                        maxOutputTokens: 1024,
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

    const prompt = `Tu es le correspondant local de l'application "Village" à Beaupuy (31850).
Ta mission : Rédiger "L'Essentiel de la Veille", un résumé DÉTAILLÉ et NARRATIF de l'activité d'HIER.

⚠️ IMPORTANT : Ne te contente PAS de répéter les chiffres. RACONTE ce qu'il s'est passé avec des DÉTAILS CONCRETS.

DONNÉES D'HIER (${stats.date}) :

📬 MESSAGERIE (${stats.totalMessages} messages sur ${stats.activeChannels} canaux) :
${stats.topTopics.length > 0 ? `Sujets détectés : ${stats.topTopics.join(', ')}` : ''}
${(stats as any).messageSnippets ? `Extraits des discussions :\n${(stats as any).messageSnippets}` : ''}

🚨 SÉCURITÉ (${stats.newAlerts} alerte(s)) :
${(stats as any).alertDetailedList || stats.alertDetails.join('\n')}
${stats.resolvedAlerts > 0 ? `\n✅ ${stats.resolvedAlerts} alerte(s) résolue(s)` : ''}

📢 OFFICIEL : ${stats.officialAnnouncements} annonce(s) officielles.
${stats.officialTopics.length > 0 ? `Sujets : ${stats.officialTopics.join(', ')}` : ''}

📅 AGENDA : ${stats.newEvents} nouvel(aux) événement(s) créé(s).
${(stats as any).eventDetailedList || stats.eventDetails.join('\n')}
${stats.upcomingEvents > 0 ? `\n🔜 ${stats.upcomingEvents} événement(s) à venir prochainement` : ''}

🏪 VIE LOCALE (Pros & Assos) :
${stats.proPosts} publication(s) de professionnels.
${(stats as any).proPostDetails || ''}
${stats.activeBusinesses.length > 0 ? `\nCommerçants actifs : ${stats.activeBusinesses.join(', ')}` : ''}
${stats.newProducts > 0 ? `\n🆕 ${stats.newProducts} nouveau(x) produit(s)/service(s)` : ''}

🛍️ MARCHÉ : ${stats.newListings} nouvelle(s) annonce(s).
${stats.listingCategories.length > 0 ? `Catégories : ${stats.listingCategories.join(', ')}` : ''}

CONSIGNES DE RÉDACTION :
1. TON : "Esprit Village". Bienveillant, factuel, utile. Tu es un voisin bien informé qui RACONTE ce qu'il s'est passé.
2. FORMAT : 2-4 paragraphes. Max 150 mots. Style JOURNALISTIQUE et NARRATIF.
3. PRÉCISION ABSOLUE :
   ⚠️ **POUR LES ALERTES** : 
   - NE DIS JAMAIS juste "1 alerte signalée"
   - DIS PLUTÔT : "Une alerte [TYPE D'ALERTE] a été signalée hier par [NOM]. [BREF RÉSUMÉ DE LA SITUATION]"
   - Exemple : "Marie a signalé une activité suspecte rue des Lilas hier soir. Soyez vigilants."
   
   📅 **POUR LES ÉVÉNEMENTS** : 
   - NE DIS JAMAIS juste "1 événement créé"
   - DIS PLUTÔT : "[NOM DE L'ÉVÉNEMENT] est prévu le [DATE]. [BREF DÉTAIL]"
   - Exemple : "La Fête de la Saint-Jean est programmée le 24 juin par l'association du village."
   
   🏪 **POUR LES PROS** :
   - NE DIS JAMAIS juste "1 publication"
   - DIS PLUTÔT : "[NOM DU COMMERCE] a annoncé [QUOI]"
   - Exemple : "La Boulangerie du Village propose des croissants aux amandes cette semaine."
   
   💬 **POUR LA MESSAGERIE** :
   - Synthétise l'AMBIANCE ou les SUJETS si tu les identifies
   - Exemple : "Les voisins ont échangé sur l'organisation du vide-grenier et la météo clémente à venir."

4. SI C'EST CALME : "Une journée calme hier à Beaupuy. Profitez-en pour consulter l'agenda ou le marché !"

5. STRUCTURE JSON OBLIGATOIRE :
{
  "title": "Titre accrocheur qui résume l'info principale (ex: 'Alerte Sécurité et Fête à venir', 'Journée calme au village'...)",
  "content": "Le résumé NARRATIF avec les DÉTAILS CONCRETS..."
}`;

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
