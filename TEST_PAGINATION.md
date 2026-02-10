# 📋 Guide de Test - Pagination

## 🚀 Démarrer le serveur
```bash
npm start
```

## 🧪 Tests Manuels avec cURL

### 1. Test getPosts() - Première page
```bash
curl http://localhost:5000/api/posts?page=1&limit=5
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "content": "...", "user": {...}, "likes": [...] },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalCount": 25,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Test getPosts() - Deuxième page
```bash
curl http://localhost:5000/api/posts?page=2&limit=5
```

**Vérifier:**
- `data` contient les éléments 6-10 (différents de la page 1)
- `pagination.page` = 2
- `pagination.hasPrev` = true
- `pagination.hasNext` = true (si totalPages > 2)

### 3. Test getPosts() - Sans paramètres (defaults)
```bash
curl http://localhost:5000/api/posts
```

**Vérifier:**
- `pagination.page` = 1
- `pagination.limit` = 10

### 4. Test getPosts() - Limit trop haut (should clamp à 50)
```bash
curl http://localhost:5000/api/posts?limit=100
```

**Vérifier:**
- `pagination.limit` = 50 (clamped)

### 5. Test getPosts() - Page invalide (should default)
```bash
curl http://localhost:5000/api/posts?page=0
```

**Vérifier:**
- `pagination.page` = 1

### 6. Test getUserPosts() - Posts d'un utilisateur
```bash
curl http://localhost:5000/api/posts/user/:userId?page=1&limit=10
```

**Vérifier:**
- Tous les posts retournés appartiennent à cet utilisateur

### 7. Test getComments() - Commentaires paginés
```bash
curl http://localhost:5000/api/comments?page=1&limit=10
```

**Vérifier:**
- Format de réponse identique
- Structure de `pagination` correcte

---

## ✅ Checklist de Validation

- [ ] getPosts() retourne format avec `success`, `data`, `pagination`
- [ ] getUserPosts() fonctionne avec pagination
- [ ] getComments() fonctionne avec pagination
- [ ] Page defaults à 1
- [ ] Limit defaults à 10
- [ ] Limit clamped à 50 max
- [ ] Page négative defaults à 1
- [ ] hasNext = true quand page < totalPages
- [ ] hasPrev = true quand page > 1
- [ ] totalPages = Math.ceil(totalCount / limit)

---

## 📝 Notes
- Ne pas oublier d'avoir des données en DB pour tester
- Les endpoints acceptent toujours les query params
- Format standardisé dans toute l'API
