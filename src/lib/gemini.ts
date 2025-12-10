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
Ta mission : Rédiger "L'Essentiel de la Veille", un résumé court et informatif de l'activité d'HIER.

DONNÉES D'HIER (${stats.date}) :

📬 MESSAGERIE (${stats.totalMessages} messages) :
${stats.topTopics.length > 0 ? `Sujets détectés : ${stats.topTopics.join(', ')}` : ''}
${(stats as any).messageSnippets ? `Extraits des discussions :\n${(stats as any).messageSnippets}` : ''}

🚨 SÉCURITÉ (${stats.newAlerts} nouvelles) :
${(stats as any).alertDetailedList || stats.alertDetails.join('\n')}

📢 OFFICIEL : ${stats.officialAnnouncements} annonces.
Sujets : ${stats.officialTopics.join(', ')}

📅 AGENDA : ${stats.newEvents} nouveaux événements créés.
${(stats as any).eventDetailedList || stats.eventDetails.join('\n')}

🏪 VIE LOCALE (Pros & Assos) :
${stats.proPosts} publications de pros.
${(stats as any).proPostDetails || ''}

🛍️ MARCHÉ : ${stats.newListings} nouvelles annonces.

CONSIGNES DE RÉDACTION :
1. TON : "Esprit Village". Bienveillant, factuel, utile. Tu es un voisin bien informé.
2. FORMAT : Un paragraphe fluide ou 2-3 points clés. Max 100 mots.
3. PRÉCISION :
   - Pour les ALERTES : Dis "Une alerte de [Nom] a été signalée concernant [Sujet]". NE DIS PAS "non résolue" ou "en attente". Indique juste le fait.
   - Pour les PROS/ASSOS : Mentionne explicitement qui a posté quoi si c'est pertinent (ex: "La Boulangerie X propose...").
   - Pour la MESSAGERIE : Synthétise l'ambiance ou les sujets principaux si tu les identifies dans les extraits.
4. SI C'EST CALME : "Une journée calme hier à Beaupuy. Profitez-en pour consulter l'agenda !"
5. STRUCTURE JSON OBLIGATOIRE :
{
  "title": "Titre accrocheur (ex: Alerte Voisinage, Nouveaux Événements...)",
  "content": "Le résumé rédigé..."
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
