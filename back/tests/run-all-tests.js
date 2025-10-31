const testSecurity = require('./security.test');

async function runAllTests() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   DWWM ReviZ - Suite de Tests          ║');
    console.log('╚══════════════════════════════════════════╝');
    
    const securityPassed = await testSecurity();
    
    console.log('\n╔══════════════════════════════════════════╗');
    if (securityPassed) {
        console.log('║   ✅ TOUS LES TESTS RÉUSSIS             ║');
    } else {
        console.log('║   ❌ CERTAINS TESTS ONT ÉCHOUÉ          ║');
    }
    console.log('╚══════════════════════════════════════════╝\n');
    
    process.exit(securityPassed ? 0 : 1);
}

runAllTests();
