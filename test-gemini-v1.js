// Test avec API v1 au lieu de v1beta
const API_KEY = 'AIzaSyDbuPc9RPb4jBFjqCNF3CdQJKr6RQv9d1k';

async function testV1() {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Dis bonjour' }] }]
            })
        });

        console.log('Status:', response.status);
        const data = await response.text();
        console.log('Response:', data);
    } catch (error) {
        console.log('Erreur:', error.message);
    }
}

testV1();
