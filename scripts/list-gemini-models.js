// Script pour lister les modèles Gemini disponibles
const fs = require('fs');
const path = require('path');

// Lire le fichier .env manuellement
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) {
                    process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
                }
            }
        }
    } catch (error) {
        console.error('❌ Impossible de lire le fichier .env:', error.message);
        process.exit(1);
    }
}

async function listModels() {
    loadEnv();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ Clé API non trouvée');
        process.exit(1);
    }

    console.log('📋 Liste des modèles Gemini disponibles...\n');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ ERREUR:', response.status, response.statusText);
            console.error('Détails:', error);
            console.log('\n💡 Votre clé API semble invalide ou n\'a pas les bonnes permissions.');
            console.log('   Vérifiez sur: https://aistudio.google.com/app/apikey\n');
            process.exit(1);
        }

        const data = await response.json();

        console.log('✅ Modèles disponibles:\n');
        data.models.forEach(model => {
            console.log(`  - ${model.name}`);
            console.log(`    Méthodes: ${model.supportedGenerationMethods.join(', ')}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        process.exit(1);
    }
}

listModels();
