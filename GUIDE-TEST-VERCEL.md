# 🧪 Guide de Test Vercel - Démarche Structurée

## 📋 Vue d'ensemble

### Architecture actuelle
```
Repository: dwwm-reviz-app
├── Branche main (développement)
├── Branche prod (production stable)
└── Branche feature/cors-fix-test (tests en cours)

Déploiements Vercel:
├── Backend Production: dwwm-reviz-app-backend.vercel.app
├── Frontend Production: dwwm-reviz-app-frontend.vercel.app
├── Backend Test: dwwm-reviz-app-backend-[hash].vercel.app
└── Frontend Test: dwwm-reviz-app-frontend-[hash].vercel.app
```

---

## 🎯 Étape 1 : Préparation des Tests

### 1.1 Vérifier l'état actuel
```bash
# Vérifier la branche active
git branch

# Doit afficher: * feature/cors-fix-test
```

### 1.2 URLs de référence
- **Backend Test**: `https://dwwm-reviz-app-backend-d1dusfqjh-kydokody-gmailcoms-projects.vercel.app`
- **Frontend Test**: `https://dwwm-reviz-app-frontend-azti0gbvf-kydokody-gmailcoms-projects.vercel.app`
- **Page de diagnostic**: `/test-cors.html`

---

## 🔍 Étape 2 : Tests Backend Isolé

### 2.1 Test direct du backend
```bash
# Test 1: Health endpoint
curl https://dwwm-reviz-app-backend-d1dusfqjh-kydokody-gmailcoms-projects.vercel.app/health

# Attendu: {"status":"ok","timestamp":"2025-10-31T..."}
```

### 2.2 Vérification des logs Vercel
1. **Vercel Dashboard** → `dwwm-reviz-app-backend`
2. **Deployments** → Cliquer sur le déploiement de test
3. **Runtime Logs** → Vérifier absence d'erreurs rate limiting

**✅ Critères de validation:**
- Status 200 sur `/health`
- Timestamp récent (< 5 min)
- Aucune erreur `ValidationError: The 'Forwarded' header`

---

## 🌐 Étape 3 : Tests CORS Frontend → Backend

### 3.1 Test via page de diagnostic
**URL**: `https://dwwm-reviz-app-frontend-azti0gbvf-kydokody-gmailcoms-projects.vercel.app/test-cors.html`

### 3.2 Séquence de tests
1. **Test Health Endpoint** → Clic
2. **Test Login Endpoint** → Clic  
3. **Test CORS Preflight** → Clic

### 3.3 Résultats attendus
```
✅ Health OK: {"status":"ok","timestamp":"..."}
✅ Login endpoint accessible (401 attendu pour mauvais credentials)
✅ CORS Preflight: 200
📋 CORS Headers: {
  "access-control-allow-origin": "https://dwwm-reviz-app-frontend-kmpmzcoh4...",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization"
}
```

---

## 🚨 Étape 4 : Diagnostic des Échecs

### 4.1 Si "Failed to fetch"
**Cause**: CORS toujours bloqué

**Actions**:
1. Vérifier que le backend de test est bien déployé depuis `feature/cors-fix-test`
2. Vérifier les logs backend pour erreurs CORS
3. Tester manuellement: `curl -H "Origin: https://dwwm-reviz-app-frontend-kmpmzcoh4..." -X OPTIONS [backend-url]/api/auth/login`

### 4.2 Si "500 Internal Server Error"
**Cause**: Problème serveur (rate limiting, MongoDB, etc.)

**Actions**:
1. Vérifier les Runtime Logs Vercel
2. Vérifier la connexion MongoDB Atlas
3. Vérifier les variables d'environnement

### 4.3 Si "MongoDB timeout"
**Cause**: IPs Vercel non whitelistées

**Actions**:
1. MongoDB Atlas → Network Access
2. Vérifier présence des IPs Vercel:
   - `76.76.19.0/24`
   - `76.223.126.0/24` 
   - `64.23.132.0/24`

---

## ✅ Étape 5 : Validation et Merge

### 5.1 Critères de succès
- [ ] Backend répond (health = 200)
- [ ] CORS autorise les requêtes frontend
- [ ] Login endpoint accessible (même si 401/500 pour credentials)
- [ ] Aucune erreur CORS dans la console

### 5.2 Si tests OK → Merger en production
```bash
# Retour sur prod
git checkout prod

# Merge de la correction
git merge feature/cors-fix-test

# Remettre l'URL de production normale
# Éditer front/js/api-config.js:
# PRODUCTION_URL: 'https://dwwm-reviz-app-backend.vercel.app'

# Commit et push
git add .
git commit -m "fix: CORS corrigé pour production"
git push origin prod
```

### 5.3 Si tests KO → Rollback
```bash
# Revenir sur prod
git checkout prod

# Supprimer la branche de test
git branch -D feature/cors-fix-test

# Analyser les logs et recommencer
```

---

## 📊 Étape 6 : Validation Production

### 6.1 Après merge en prod
**URLs finales**:
- Backend: `https://dwwm-reviz-app-backend.vercel.app`
- Frontend: `https://dwwm-reviz-app-frontend.vercel.app`

### 6.2 Tests de non-régression
1. **Login fonctionnel**: `https://dwwm-reviz-app-frontend.vercel.app/login.html`
2. **Admin panel**: `https://dwwm-reviz-app-frontend.vercel.app/admin.html`
3. **Timer et questions**: Fonctionnalités métier

---

## 🔧 Outils de Debug

### Console Browser (F12)
```javascript
// Vérifier l'URL API utilisée
console.log(window.API_BASE_URL);

// Test manuel CORS
fetch(window.API_BASE_URL + '/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Curl Tests
```bash
# Test CORS preflight
curl -H "Origin: https://dwwm-reviz-app-frontend.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://dwwm-reviz-app-backend.vercel.app/api/auth/login

# Test POST avec CORS
curl -H "Origin: https://dwwm-reviz-app-frontend.vercel.app" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"email":"test","password":"test"}' \
     https://dwwm-reviz-app-backend.vercel.app/api/auth/login
```

---

## 📝 Checklist Finale

### Avant de valider
- [ ] Backend de test répond
- [ ] Frontend de test peut appeler le backend
- [ ] Pas d'erreurs CORS dans la console
- [ ] MongoDB connecté (pas de timeout)
- [ ] Variables d'environnement correctes

### Après validation
- [ ] Merge dans prod effectué
- [ ] URL de production restaurée
- [ ] Tests de non-régression OK
- [ ] Branche de test supprimée
- [ ] Documentation mise à jour

---

**Auteur**: Kydo  
**Date**: 2025-10-31  
**Contexte**: Debug CORS déploiement Vercel