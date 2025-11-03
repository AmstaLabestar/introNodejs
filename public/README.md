# Frontend de test - IntroNode

Ceci est une petite Single Page Application (SPA) en HTML/CSS/JS (Bootstrap) pour tester l'API présente dans ce dépôt.

Comment l'utiliser

1. Lancer ton serveur Node (depuis la racine du repo) :

```powershell
npm install
npm run dev   # ou npm start si tu utilises node server.js
```

2. Ouvrir `public/index.html` dans un navigateur.

Notes
- Le frontend suppose que l'API est disponible à la base `/api/users` sur le même hôte (ex: http://localhost:5000/api/users).
- Le frontend stocke le JWT dans `localStorage` pour les requêtes protégées.
