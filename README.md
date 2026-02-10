# 🌐 Mini Social App - Réseau Social Complet

Une application de réseau social moderne avec backend Node.js + Frontend React.

## 🎯 Fonctionnalités Réalisées

### ✅ Backend (Node.js + Express + MongoDB)
1. **Authentification**
   - Register/Login avec JWT
   - Middleware auth sécurisé
   - Token refresh support

2. **Pagination**
   - Posts paginés (page/limit)
   - Commentaires paginés
   - Utilisateurs paginés

3. **Follow/Followers**
   - Suivre/Unfollower utilisateurs
   - Voir followers/following
   - Prévention auto-follow

4. **Messages Directs**
   - Envoyer des messages
   - Conversations paginées
   - Status "en ligne"
   - Notifications de messages
   - Soft delete bidirectionnel

5. **Notifications**
   - Notifications pour messages
   - Notifications pour follows
   - Marquer comme lues

6. **Validation Joi**
   - Register/Login validation
   - Post/Comment validation
   - Message validation
   - Erreurs formatées

7. **Sécurité**
   - Bcrypt password hashing
   - JWT authentication
   - Ownership verification
   - Validation des données

### ✅ Frontend (React + Vite + Tailwind)
1. **Pages**
   - Login (connexion)
   - Register (inscription)
   - Feed (fil d'actualité)
   - Messages (conversations)
   - Notifications
   - Profil utilisateur

2. **Composants**
   - Navbar avec navigation
   - Forms avec validation
   - Cards pour posts/messages
   - Modals pour followers/following
   - Layout responsive

3. **State Management**
   - Zustand pour auth
   - Zustand pour posts, users, messages
   - Local storage persist

4. **Styling**
   - Tailwind CSS
   - Sky Blue theme (#0EA5E9)
   - Responsive design
   - Animations

5. **Integration API**
   - Axios avec interceptors
   - JWT auto-injection
   - Error handling
   - Loading states

---

## 🚀 Démarrage Rapide

### Backend
```bash
cd introNode
npm install
npm start
# Serveur sur http://localhost:5000
```

Variables d'environnement (.env):
```
MONGO_URI=mongodb://localhost:27017/social_app
JWT_SECRET=votre_secret_jwt
PORT=5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend sur http://localhost:5173
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Users
- `GET /api/auth/` - Tous les utilisateurs
- `GET /api/auth/:id` - Utilisateur par ID
- `PUT /api/auth/:id` - Mettre à jour utilisateur
- `DELETE /api/auth/:id` - Supprimer compte

### Follow
- `POST /api/auth/:id/follow` - Suivre utilisateur
- `DELETE /api/auth/:id/follow` - Arrêter de suivre
- `GET /api/auth/:id/followers` - Récupérer followers (pagié)
- `GET /api/auth/:id/following` - Récupérer following (paginé)

### Posts
- `GET /api/posts?page=1&limit=10` - Tous les posts (paginé)
- `GET /api/posts/:id` - Post détail avec commentaires
- `GET /api/posts/user/:userId?page=1&limit=10` - Posts d'un user (paginé)
- `POST /api/posts` - Créer post (avec image)
- `PUT /api/posts/:id` - Mettre à jour post
- `DELETE /api/posts/:id` - Supprimer post
- `POST /api/posts/:id/like` - Like/Unlike post

### Comments
- `GET /api/comments?page=1&limit=10` - Tous les commentaires (paginé)
- `GET /api/comments/:id` - Commentaire détail
- `POST /api/comments` - Créer commentaire
- `PUT /api/comments/:id` - Mettre à jour commentaire
- `DELETE /api/comments/:id` - Supprimer commentaire

### Messages
- `POST /api/messages` - Envoyer message
- `GET /api/messages?page=1&limit=10` - Conversations (paginé)
- `GET /api/messages/:userId?page=1&limit=20` - Conversation avec user (paginé)
- `PATCH /api/messages/:id/read` - Marquer comme lu
- `DELETE /api/messages/:id` - Supprimer message (soft delete)

### Notifications
- `GET /api/notifications?page=1&limit=20` - Notifications (paginé)
- `PATCH /api/notifications/:id/read` - Marquer comme lue
- `PATCH /api/notifications/read-all` - Marquer toutes comme lues
- `DELETE /api/notifications/:id` - Supprimer notification
- `GET /api/users/online-status` - Statut en ligne des users

---

## 🎨 Design System

### Couleurs Sky Blue
```
Sky-500: #0EA5E9 (Principal)
Sky-600: #0284C7 (Hover/Active)
Sky-700: #0369A1 (Dark)
```

### Components Tailwind
- Buttons: `bg-sky-500 hover:bg-sky-600`
- Inputs: `border-sky-200 focus:ring-sky-500`
- Cards: `bg-white shadow-lg rounded-2xl`
- Navbar: `bg-gradient-to-r from-sky-600 to-sky-700`

---

## 📁 Structure du Projet

```
intro Node/
├── backend (Node.js + Express)
│   ├── src/
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── post.model.js
│   │   │   ├── comment.model.js
│   │   │   ├── message.model.js
│   │   │   └── notification.model.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── validations/
│   │   │   └── schemas.js (Joi validation)
│   │   ├── services/
│   │   ├── config/
│   │   └── app.js
│   ├── package.json
│   └── server.js
│
└── frontend (React + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── auth/
    │   │   ├── feed/
    │   │   ├── profile/
    │   │   ├── messages/
    │   │   ├── notifications/
    │   │   └── common/
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── FeedPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── MessagesPage.jsx
    │   │   └── NotificationsPage.jsx
    │   ├── hooks/
    │   ├── store/
    │   │   └── authStore.js (Zustand)
    │   ├── services/
    │   │   └── api.js (Axios)
    │   ├── App.jsx
    │   ├── index.css (Tailwind)
    │   └── main.jsx
    └── package.json
```

---

## 🛠️ Technologies Utilisées

### Backend
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB + Mongoose 8.19.2
- **Auth**: JWT + Bcrypt
- **Validation**: Joi
- **File Upload**: Multer
- **CORS**: Express CORS

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + PostCSS
- **State**: Zustand
- **HTTP**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Dates**: date-fns

---

## ✅ Checklist de Fonctionnement

### Backend
- [x] Authentification JWT
- [x] Modèles Mongoose (User, Post, Comment, Message, Notification)
- [x] Contrôleurs pour toutes les fonctionnalités
- [x] Routes protégées avec middleware auth
- [x] Pagination sur posts/comments/messages
- [x] Follow/Followers system
- [x] Messages directs avec soft delete
- [x] Notifications
- [x] Validation Joi
- [x] CORS configuré

### Frontend
- [x] Pages Login/Register
- [x] Navbar avec navigation
- [x] ProtectedRoute avec redirects
- [x] Zustand stores (auth)
- [x] Axios service avec JWT interceptor
- [x] Tailwind CSS + Sky Blue theme
- [x] Responsive design
- [ ] Feed Page complète (posts, pagination)
- [ ] Profile Page complète (follow button)
- [ ] Messages Page complète (conversations)
- [ ] Notifications Page complète

---

## 🔐 Sécurité

- ✅ Passwords hashés avec bcrypt (10 rounds)
- ✅ JWT tokens avec 1h expiration
- ✅ Ownership verification (delete/update)
- ✅ Soft delete pour messages (bidirectionnel)
- ✅ Validation Joi stricte
- ✅ CORS restrictif
- ✅ Prevention d'auto-follow
- ✅ Prevention de suppression d'autres comptes

---

## 🚀 Prochaines Étapes

1. **Implémenter Feed Page complètement**
   - Liste des posts avec pagination
   - Créer/supprimer posts
   - Like/unlike posts
   - Commentaires

2. **Implémenter Profile Page**
   - Afficher profil utilisateur
   - Follow/Unfollow button
   - Followers/Following modals
   - Posts de l'utilisateur

3. **Implémenter Messages Page**
   - Liste conversations
   - Chat window
   - Envoyer/supprimer messages
   - Online status

4. **Implémenter Notifications Page**
   - Liste notifications
   - Marquer comme lues
   - Distinguish message vs follow

5. **Améliorations**
   - WebSockets pour temps réel
   - Rate limiting
   - Refresh tokens
   - Tests (Jest/Vitest)
   - Dark mode
   - Recherche avancée
   - Hashtags et mentions

---

## 📝 Notes

- Base URL API: `http://localhost:5000/api`
- Token stocké en localStorage (à sécuriser)
- CORS actuellement limité à front local
- Tous les endpoints protégés nécessitent JWT en header `Authorization: Bearer <token>`

---

**Développé avec ❤️ en [Date]**
