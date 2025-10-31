const crypto = require('crypto');

console.log('\n🔐 GÉNÉRATION DES SECRETS POUR LA PRODUCTION\n');
console.log('='.repeat(60));

// Générer JWT Secret (64 caractères minimum)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET (à copier dans Vercel) :');
console.log(jwtSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Copiez ce secret dans les variables d\'environnement Vercel');
console.log('⚠️  Ne partagez JAMAIS ce secret publiquement\n');
