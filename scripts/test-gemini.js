// Script de test pour vérifier la clé API Gemini
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

async function testGeminiAPI() {
    loadEnv();

    const apiKey = process.env.GEMINI_API_KEY;

    console.log('🔍 Vérification de la clé API Gemini...\n');

    // Vérifier si la clé existe
    if (!apiKey) {
        console.error('❌ ERREUR: La clé API Gemini n\'est pas définie dans le fichier .env');
        console.log('   Ajoutez cette ligne dans votre fichier .env :');
        console.log('   GEMINI_API_KEY=votre_clé_ici\n');
        process.exit(1);
    }

    console.log('✅ Clé API trouvée dans .env');
    console.log(`   Longueur: ${apiKey.length} caractères`);
    console.log(`   Début: ${apiKey.substring(0, 10)}...`);

    // Test de connexion à l'API
    console.log('\n🌐 Test de connexion à l\'API Gemini...\n');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Dis simplement "Bonjour de Beaupuy !" en une phrase.'
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ ERREUR API:', response.status, response.statusText);
            console.error('   Détails:', error);
            console.log('\n💡 Vérifiez que votre clé API est correcte sur: https://aistudio.google.com/app/apikey\n');
            process.exit(1);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        console.log('✅ Connexion réussie !');
        console.log('🤖 Réponse de Gemini:', aiResponse);
        console.log('\n🎉 Tout fonctionne parfaitement ! Vous pouvez utiliser Gemini dans votre application.\n');

    } catch (error) {
        console.error('❌ ERREUR lors du test:', error.message);
        console.log('\n💡 Vérifiez votre connexion internet et votre clé API.\n');
        process.exit(1);
    }
}

testGeminiAPI();
