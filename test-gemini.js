// Test rapide des modèles Gemini disponibles
const API_KEY = 'AIzaSyDbuPc9RPb4jBFjqCNF3CdQJKr6RQv9d1k';
const models = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function testModel(model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }]
            })
        });

        if (response.ok) {
            console.log(`✅ ${model} FONCTIONNE !`);
            return true;
        } else {
            console.log(`❌ ${model}: ${response.status} ${await response.text()}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${model}: ${error.message}`);
        return false;
    }
}

(async () => {
    console.log('🔍 Test des modèles Gemini...\n');
    for (const model of models) {
        await testModel(model);
    }
})();
