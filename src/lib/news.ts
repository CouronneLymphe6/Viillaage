/**
 * Service Google News
 * Récupère les actualités locales via Google News RSS
 */

export interface NewsArticle {
    title: string;
    source: string;
    publishedAt: string;
    snippet: string;
    url: string;
    relevanceScore: number;
}

// Communes de Beaupuy et environs
const NEARBY_CITIES = [
    'Beaupuy',
    'Balma',
    'Mons',
    'Pin-Balma',
    'Lavalette',
    'Montrabé',
    'Mondouzil',
    'Rouffiac-Tolosan',
    'Castelmaurou',
];

/**
 * Calcule le score de pertinence d'un article
 */
function calculateRelevance(article: { title: string; description: string }): number {
    let score = 0;
    const content = `${article.title} ${article.description}`.toLowerCase();

    // Beaupuy mentionné = très pertinent
    if (content.includes('beaupuy')) {
        score += 10;
    }

    // Code postal 31850
    if (content.includes('31850')) {
        score += 8;
    }

    // Communes limitrophes
    NEARBY_CITIES.forEach(city => {
        if (content.includes(city.toLowerCase())) {
            score += city === 'Beaupuy' ? 10 : 5;
        }
    });

    // Mots-clés locaux
    const localKeywords = [
        'est toulousain',
        'balma-gramont',
        'métropole',
        'haute-garonne',
        '31',
    ];

    localKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
            score += 2;
        }
    });

    return score;
}

/**
 * Parse un flux RSS
 */
async function parseRSS(url: string): Promise<any[]> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; VillageApp/1.0)',
            },
        });

        if (!response.ok) {
            console.error(`❌ Erreur RSS ${url}:`, response.status);
            return [];
        }

        const xmlText = await response.text();

        // Parser XML simple (pour RSS)
        const items: any[] = [];
        // Utilisation de [\s\S] au lieu du flag 's' pour la compatibilité
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;

        let match;
        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemXml = match[1];

            const title = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
                itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';

            const description = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
                itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';

            const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';

            const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';

            const source = itemXml.match(/<source>([\s\S]*?)<\/source>/)?.[1] ||
                (url.includes('google') ? 'Google News' : 'RSS Feed');

            if (title && link) {
                items.push({
                    title: title.trim(),
                    description: description.trim().replace(/<[^>]*>/g, ''), // Retirer les balises HTML
                    link: link.trim(),
                    pubDate: pubDate.trim(),
                    source: source.trim(),
                });
            }
        }

        return items;
    } catch (error) {
        console.error(`❌ Erreur parsing RSS ${url}:`, error);
        return [];
    }
}

/**
 * Récupère les actualités locales via Google News RSS
 */
export async function fetchLocalNews(date?: Date): Promise<NewsArticle[]> {
    const targetDate = date || new Date();
    targetDate.setDate(targetDate.getDate() - 1); // Hier par défaut

    const allArticles: NewsArticle[] = [];

    // Requêtes de recherche pour Google News RSS
    const searchQueries = [
        'Beaupuy 31850',
        'Beaupuy Haute-Garonne',
        'Balma actualité',
        'Mons 31280',
        'Lavalette 31590',
        'Montrabé',
        'Est Toulousain',
    ];

    // Google News RSS URLs
    const rssUrls = searchQueries.map(query =>
        `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`
    );

    // Récupérer les articles de toutes les sources
    const results = await Promise.allSettled(
        rssUrls.map(url => parseRSS(url))
    );

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const items = result.value;

            items.forEach(item => {
                const relevanceScore = calculateRelevance({
                    title: item.title,
                    description: item.description,
                });

                // Ne garder que les articles pertinents (score >= 5)
                if (relevanceScore >= 5) {
                    // Vérifier si l'article n'est pas déjà dans la liste
                    const exists = allArticles.some(a => a.url === item.link);

                    if (!exists) {
                        allArticles.push({
                            title: item.title,
                            source: item.source || 'Google News',
                            publishedAt: item.pubDate || new Date().toISOString(),
                            snippet: item.description.substring(0, 200),
                            url: item.link,
                            relevanceScore,
                        });
                    }
                }
            });
        }
    });

    // Trier par pertinence et date
    allArticles.sort((a, b) => {
        // D'abord par pertinence
        if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }
        // Puis par date
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Limiter à 10 articles maximum
    return allArticles.slice(0, 10);
}

/**
 * Récupère les actualités depuis des sources locales spécifiques
 */
export async function fetchFromLocalSources(): Promise<NewsArticle[]> {
    const sources = [
        {
            name: 'La Dépêche du Midi',
            rss: 'https://www.ladepeche.fr/rss.xml',
        },
        // Ajouter d'autres sources RSS locales si disponibles
    ];

    const allArticles: NewsArticle[] = [];

    for (const source of sources) {
        try {
            const items = await parseRSS(source.rss);

            items.forEach(item => {
                const relevanceScore = calculateRelevance({
                    title: item.title,
                    description: item.description,
                });

                if (relevanceScore >= 5) {
                    allArticles.push({
                        title: item.title,
                        source: source.name,
                        publishedAt: item.pubDate || new Date().toISOString(),
                        snippet: item.description.substring(0, 200),
                        url: item.link,
                        relevanceScore,
                    });
                }
            });
        } catch (error) {
            console.error(`❌ Erreur source ${source.name}:`, error);
        }
    }

    return allArticles;
}
