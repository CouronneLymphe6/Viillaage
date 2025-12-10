/**
 * Récupère la météo pour Beaupuy (31850) via Open-Meteo (gratuit, sans clé API)
 */
export async function getWeatherForBeaupuy(): Promise<{
    current: { temp: number; condition: string; code: number };
    morning: { temp: number; condition: string; code: number };
    noon: { temp: number; condition: string; code: number };
    evening: { temp: number; condition: string; code: number };
    success: boolean;
}> {
    try {
        // Coordonnées de Beaupuy 31850
        const lat = 43.6567;
        const lon = 1.5356;

        // On demande la météo courante ET horaire pour extraire 8h, 12h, 20h
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&hourly=temperature_2m,weathercode&timezone=Europe/Paris&forecast_days=1`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API Météo indisponible');
        }

        const data = await response.json();

        // Codes météo (label court)
        const getWeatherLabel = (code: number) => {
            const codes: { [key: number]: string } = {
                0: 'Ensoleillé', 1: 'Peu nuageux', 2: 'Partiel.', 3: 'Nuageux',
                45: 'Brouillard', 48: 'Givre',
                51: 'Bruine', 53: 'Bruine', 55: 'Bruine',
                61: 'Pluie', 63: 'Pluie', 65: 'Pluie',
                71: 'Neige', 73: 'Neige', 75: 'Neige',
                80: 'Averses', 81: 'Averses', 82: 'Averses',
                95: 'Orage', 96: 'Orage', 99: 'Orage'
            };
            return codes[code] || 'Variable';
        };

        // Extraction des index horaires (0h à 23h)
        // 8h = index 8, 12h = index 12, 20h = index 20
        const getForecast = (hour: number) => ({
            temp: Math.round(data.hourly.temperature_2m[hour]),
            code: data.hourly.weathercode[hour],
            condition: getWeatherLabel(data.hourly.weathercode[hour])
        });

        return {
            current: {
                temp: Math.round(data.current.temperature_2m),
                code: data.current.weathercode,
                condition: getWeatherLabel(data.current.weathercode)
            },
            morning: getForecast(8),
            noon: getForecast(12),
            evening: getForecast(20),
            success: true,
        };
    } catch (error) {
        console.error('❌ Erreur récupération météo:', error);
        return {
            current: { temp: 0, condition: '', code: 0 },
            morning: { temp: 0, condition: '', code: 0 },
            noon: { temp: 0, condition: '', code: 0 },
            evening: { temp: 0, condition: '', code: 0 },
            success: false
        };
    }
}
