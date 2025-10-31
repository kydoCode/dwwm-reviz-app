const axios = require('axios');

const API_URL = 'http://localhost:3000';
let authToken = '';

async function testSecurity() {
    console.log('\n🔐 TESTS DE SÉCURITÉ\n');
    let passed = 0, failed = 0;

    try {
        await axios.post(`${API_URL}/api/auth/login`, { username: 'wrong', password: 'wrong' });
        console.log('❌ Test 1: Login invalide devrait échouer');
        failed++;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Test 1: Login invalide bloqué');
            passed++;
        } else { console.log('❌ Test 1: Erreur'); failed++; }
    }

    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, { username: 'admin', password: 'admin12345' });
        authToken = res.data.token;
        console.log('✅ Test 2: Login valide réussi');
        passed++;
    } catch (error) { console.log('❌ Test 2: Login échoué'); failed++; }

    try {
        await axios.get(`${API_URL}/api/questions`);
        console.log('❌ Test 3: API sans token devrait échouer');
        failed++;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Test 3: API sans token bloquée');
            passed++;
        } else { console.log('❌ Test 3: Erreur'); failed++; }
    }

    try {
        await axios.get(`${API_URL}/api/questions`, { headers: { Authorization: `Bearer ${authToken}` } });
        console.log('✅ Test 4: API avec token réussie');
        passed++;
    } catch (error) { console.log('❌ Test 4: Échoué'); failed++; }

    try {
        const res = await axios.get(`${API_URL}/health`);
        if (res.data.status === 'ok') {
            console.log('✅ Test 5: Health check OK');
            passed++;
        } else { console.log('❌ Test 5: Health invalide'); failed++; }
    } catch (error) { console.log('❌ Test 5: Health échoué'); failed++; }

    console.log(`\n📊 Résultat: ${passed}/${passed + failed} tests réussis\n`);
    return passed === passed + failed;
}

if (require.main === module) {
    testSecurity().then(success => process.exit(success ? 0 : 1));
}

module.exports = testSecurity;
