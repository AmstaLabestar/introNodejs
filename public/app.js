// === CONFIGURATION DE BASE ===
const BASE_API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000'; // Pour les images

// --- NOUVELLES UTILITIES DE NOTIFICATION (DAISYUI) ---

/**
 * Affiche une notification de type 'toast' DaisyUI.
 * @param {string} message - Le message à afficher.
 * @param {'success'|'error'|'warning'|'info'} type - Le type de notification (couleur DaisyUI).
 * @param {number} duration - Durée d'affichage en ms.
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Crée le conteneur du toast s'il n'existe pas
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        // Positionne le toast en bas à droite (responsive) et assure qu'il est au-dessus de tout
        toastContainer.className = 'toast toast-end toast-bottom sm:toast-end z-50'; 
        document.body.appendChild(toastContainer);
    }

    const alertClass = `alert alert-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';

    const toast = document.createElement('div');
    toast.className = alertClass + ' cursor-pointer'; // Permet de cliquer pour fermer
    toast.innerHTML = `
        <span class="text-lg">${icon}</span>
        <span>${message}</span>
    `;
    
    // Ajoute un écouteur pour fermer le toast si on clique dessus
    toast.addEventListener('click', () => toast.remove());
    
    // Ajoute le toast au conteneur
    toastContainer.appendChild(toast);

    // Supprime le toast après la durée spécifiée
    setTimeout(() => {
        toast.remove();
    }, duration);
}


// === AUTH UTILITIES ===
function getToken() {
    return localStorage.getItem('authToken');
}
function getUserId() {
    return localStorage.getItem('currentUserId');
}

/**
 * Met à jour les boutons de navigation en utilisant les classes Tailwind/DaisyUI.
 */
function updateNavButtons(isAuthenticated) {
    const username = localStorage.getItem('username') || 'Utilisateur';
    const btnLogin = document.getElementById('btn-login-nav');
    const btnSignup = document.getElementById('btn-signup-nav');
    const btnLogout = document.getElementById('btn-logout-nav');
    const welcome = document.getElementById('welcome-message');

    // Afficher/Cacher les boutons de connexion/inscription
    btnLogin.classList.toggle('hidden', isAuthenticated);
    btnSignup.classList.toggle('hidden', isAuthenticated);
    
    // Afficher/Cacher le bouton de déconnexion et le message de bienvenue
    btnLogout.classList.toggle('hidden', !isAuthenticated);
    welcome.classList.toggle('hidden', !isAuthenticated);
    
    if (isAuthenticated) {
        welcome.classList.add('sm:inline-block');
        welcome.textContent = `Bienvenue, ${username} !`;
    } else {
        welcome.classList.remove('sm:inline-block');
    }
}

// === API FETCH (centralisé - MISE À JOUR pour utiliser showNotification) ===
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${BASE_API_URL}/${endpoint}`, { ...options, headers });
        if (!res.ok) {
            let err;
            try {
                err = await res.json();
            } catch {
                err = { message: `API error: ${res.status}` };
            }
            
            // Notification d'erreur de l'API
            showNotification('Erreur: ' + (err.message || `API error: ${res.status}`), 'error', 5000); 
            
            // Logique de déconnexion si 401
            if (res.status === 401) {
                logout(false); // Utilise 'false' pour éviter une boucle de notification
                return null; 
            }

            throw new Error(err.message || `API error: ${res.status}`);
        }
        if (res.status === 204) return null;
        return await res.json();
    } catch (e) {
        console.error('Fetch Error:', e.message);
        // Seulement si l'erreur n'est PAS un 401 déjà géré, notifie une erreur réseau/générique.
        if (!e.message.includes('401') && !e.message.includes('token')) {
             showNotification('Erreur réseau ou CORS: ' + e.message, 'error', 5000);
        }
        return null;
    }
}


// === RENDER LOGIN / SIGNUP (Utilisation des classes DaisyUI) ===
function renderToAppRoot(html) {
    document.getElementById('app-root').innerHTML = html;
}

function renderLoginForm() {
    updateNavButtons(false);
    renderToAppRoot(`
    <div class="card bg-white shadow-xl p-6 md:p-8 w-full">
      <h3 class="text-2xl font-bold text-center mb-6">Connexion</h3>
      <form id="login-form" class="space-y-4">
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Email</span></div>
          <input type="email" id="login-email" class="input input-bordered w-full" required>
        </label>
        
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Mot de passe</span></div>
          <input type="password" id="login-password" class="input input-bordered w-full" required>
        </label>
        
        <button type="submit" class="btn btn-primary w-full mt-6">Se connecter</button>
        <p class="mt-4 text-center text-sm text-gray-500">
            Pas encore de compte ? 
            <a href="#" onclick="renderSignupForm()" class="link link-hover link-primary">Inscrivez-vous</a>
        </p>
      </form>
    </div>
    `);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function renderSignupForm() {
    updateNavButtons(false);
    renderToAppRoot(`
    <div class="card bg-white shadow-xl p-6 md:p-8 w-full">
      <h3 class="text-2xl font-bold text-center mb-6">Inscription</h3>
      <form id="signup-form" class="space-y-4">
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Nom d'utilisateur</span></div>
          <input type="text" id="signup-username" class="input input-bordered w-full" required>
        </label>

        <label class="form-control w-full">
          <div class="label"><span class="label-text">Email</span></div>
          <input type="email" id="signup-email" class="input input-bordered w-full" required>
        </label>
        
        <label class="form-control w-full">
          <div class="label"><span class="label-text">Mot de passe</span></div>
          <input type="password" id="signup-password" class="input input-bordered w-full" required>
        </label>

        <label class="form-control w-full">
          <div class="label"><span class="label-text">Confirmer le mot de passe</span></div>
          <input type="password" id="signup-password-confirm" class="input input-bordered w-full" required>
        </label>
        
        <button type="submit" class="btn btn-success w-full mt-6">S'inscrire</button>
        <p class="mt-4 text-center text-sm text-gray-500">
            Déjà un compte ? 
            <a href="#" onclick="renderLoginForm()" class="link link-hover link-primary">Connectez-vous</a>
        </p>
      </form>
    </div>
    `);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

// === LOGIN / SIGNUP HANDLERS (MISE À JOUR) ===
async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;

    if (password !== confirmPassword) {
        showNotification("Les mots de passe ne correspondent pas.", 'warning');
        return;
    }

    const data = await apiFetch('auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, confirmPassword })
    });

    if (data) {
        showNotification('Inscription réussie ! Connectez-vous maintenant.', 'success');
        renderLoginForm();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const data = await apiFetch('auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (data && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('currentUserId', data.user._id || data.user.id);
        showNotification('Connexion réussie !', 'success');
        checkAuthAndLoadFeed();
    }
}

function logout(notify = true) {
    localStorage.clear();
    if (notify) showNotification('Déconnexion réussie', 'info');
    renderLoginForm();
}

// === POSTS & FEED (inchangés) ===
async function loadFeed() {
    try {
        const posts = await apiFetch('posts', { method: 'GET' });
        
        if (!posts) {
            if (!getToken()) renderLoginForm();
            return;
        }

        // Charger les commentaires pour chaque post
        for (const post of posts) {
            try {
                const commentsData = await apiFetch(`posts/${post._id}`);
                if (commentsData) {
                    post.comments = commentsData.comments || [];
                    post.commentsCount = commentsData.commentsCount || 0;
                } else {
                    post.comments = [];
                    post.commentsCount = 0;
                }
            } catch (error) {
                console.error(`Erreur chargement commentaires pour post ${post._id}:`, error);
                post.comments = [];
                post.commentsCount = 0;
            }
        }

        renderFeed(posts);
        
        // Rendre les commentaires après avoir affiché le feed
        posts.forEach(p => {
            if (p.comments && p.comments.length > 0) {
                renderComments(p._id, p.comments);
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement du feed:', error);
        if (!getToken()) renderLoginForm();
    }
}


function renderFeed(posts) {
    updateNavButtons(true);
    const currentUserId = getUserId();
    
    // Bouton pour ouvrir la modal (lié à la checkbox de DaisyUI par l'attribut for)
    let html = `
        <label for="createPostModalToggle" class="btn btn-success mb-6 w-full">
            Créer une publication
        </label>
    `;
    
    if (posts.length === 0) {
        html += '<p class="text-center text-gray-500">Aucune publication pour le moment.</p>';
    }

    posts.forEach(post => {
        const liked = post.likes && post.likes.includes(currentUserId);
        const isOwner = post.user && (post.user._id === currentUserId || post.user.id === currentUserId);
        const likesCount = post.likes ? post.likes.length : 0;
        const commentsCount = post.commentsCount || 0;

        html += `
        <div class="card bg-white shadow-xl mb-6 post-card">
          <div class="card-body p-4 sm:p-6">
            <h5 class="card-title text-xl mb-2">${post.title || '(Sans titre)'}</h5>
            <p class="text-sm text-gray-500 mb-2">${post.description || ''}</p>
            
            ${post.imageUrl ? `<img src="${BASE_URL}${post.imageUrl}" class="rounded-lg mb-4 post-img" alt="image du post">` : ''}
            
            <p class="text-base mb-3" id="post-content-${post._id}">${post.content || ''}</p>

            <div class="flex space-x-2 mb-4">
                ${isOwner ? `
                <button class="btn btn-sm btn-warning" onclick="editPost('${post._id}')">✏️ Modifier</button>
                <button class="btn btn-sm btn-error" onclick="deletePost('${post._id}')">🗑️ Supprimer</button>
                ` : ''}
            </div>
            
            <div class="card-actions justify-start border-t pt-4">
                <button class="btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}" onclick="toggleLike('${post._id}')">
                    ${liked ? '❤️' : '🤍'} ${likesCount}
                </button>
                
                <button class="btn btn-sm btn-outline" onclick="toggleCommentInput('${post._id}')">
                    💬 Commenter (${commentsCount})
                </button>
            </div>

            <div id="comment-section-${post._id}" class="comment-input-group hidden mt-4 pt-4 border-t">
              <div class="flex space-x-2 mb-2">
                <input type="text" id="comment-input-${post._id}" class="input input-bordered input-sm w-full" placeholder="Écrire un commentaire...">
                <button class="btn btn-primary btn-sm" onclick="handleAddComment('${post._id}')">Envoyer</button>
              </div>
              <div id="comments-list-${post._id}" class="mt-2 space-y-2"></div>
            </div>
          </div>
        </div>
        `;
    });

    renderToAppRoot(html);
}

function toggleCommentInput(postId) {
    const section = document.getElementById(`comment-section-${postId}`);
    section.classList.toggle('hidden');
}

// === POST HANDLERS (MISE À JOUR) ===

// Fonction pour fermer la modal DaisyUI en manipulant la checkbox
function closeCreatePostModal() {
    const modalToggle = document.getElementById('createPostModalToggle');
    if (modalToggle) {
        modalToggle.checked = false;
    }
}

async function handleCreatePost() {
    const form = document.getElementById('create-post-form');
    const formData = new FormData();

    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const imageFile = document.getElementById('post-image').files[0];

    if (!content && !imageFile) {
        showNotification("Veuillez saisir un texte ou choisir une image.", 'warning');
        return;
    }

    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (content) formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    const token = getToken();

    try {
        const res = await fetch(`${BASE_API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
             // Le toast d'erreur est déjà géré dans apiFetch, mais on peut le mettre ici pour plus de spécificité si on veut
            // showNotification('Erreur lors de la création du post: ' + (errorData.message || 'Inconnue'), 'error', 5000);
            throw new Error(errorData.message || 'Erreur lors de la création du post.');
        }

        const data = await res.json();
        console.log('Post créé avec succès:', data);

        closeCreatePostModal(); 
        form.reset();
        await loadFeed();
        
        showNotification('Publication créée avec succès !', 'success');
    } catch (e) {
        console.error('Erreur lors de la création du post:', e);
        // Le showNotification pour l'erreur est déjà dans le bloc if (!res.ok) ou dans apiFetch.
    }
}

async function deletePost(postId) {
    if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return;
    
    const data = await apiFetch(`posts/${postId}`, { method: 'DELETE' });
    
    if (data === null) { // Un DELETE réussi retourne souvent null ou 204
        showNotification('Post supprimé avec succès', 'success');
        await loadFeed();
    }
}

function editPost(postId) {
    const contentEl = document.getElementById(`post-content-${postId}`);
    const oldContent = contentEl.textContent;
    const newContent = prompt('Modifier votre post:', oldContent);
    if (newContent && newContent.trim() !== oldContent) {
        apiFetch(`posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify({ content: newContent })
        }).then(() => {
             showNotification('Post modifié avec succès.', 'success', 2000);
             loadFeed();
        });
    }
}

// === LIKE HANDLER (inchangé) ===
async function toggleLike(postId) {
    const data = await apiFetch(`posts/${postId}/like`, { method: 'POST' });
    if (data) loadFeed();
}

// === COMMENT HANDLERS (MISE À JOUR) ===
async function handleAddComment(postId) {
    const content = document.getElementById(`comment-input-${postId}`).value;
    if (!content.trim()) {
        showNotification("Le commentaire ne peut pas être vide.", 'warning');
        return;
    }

    const data = await apiFetch('comments', {
        method: 'POST',
        body: JSON.stringify({
            content,
            author: getUserId(),
            post: postId
        })
    });

    if (data) {
        document.getElementById(`comment-input-${postId}`).value = '';
        showNotification("Commentaire ajouté !", 'success', 1500);
        loadFeed();
    }
}

function renderComments(postId, comments) {
    const container = document.getElementById(`comments-list-${postId}`);
    if (!container) return;
    
    container.innerHTML = '';
    const currentUserId = getUserId();

    comments.forEach(c => {
        if (!c.author) return;
        const isOwner = c.author._id === currentUserId || c.author.id === currentUserId;
        container.innerHTML += `
        <div class="p-2 border rounded-lg bg-base-100 flex justify-between items-center text-sm">
            <p>
                <span class="font-bold text-primary">${c.author.username}</span>: 
                <span id="comment-content-${c._id}">${c.content}</span>
            </p>
            ${isOwner ? `
            <div class="flex space-x-1 ml-2 flex-shrink-0">
                <button class="btn btn-xs btn-warning" onclick="editComment('${c._id}', '${postId}')">✏️</button>
                <button class="btn btn-xs btn-error" onclick="deleteComment('${c._id}', '${postId}')">🗑️</button>
            </div>
            ` : ''}
        </div>
        `;
    });
}

async function deleteComment(commentId, postId) {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;
    const data = await apiFetch(`comments/${commentId}`, { method: 'DELETE' });
    if (data === null) {
        showNotification("Commentaire supprimé.", 'success', 1500);
        loadFeed();
    }
}

function editComment(commentId, postId) {
    const contentEl = document.getElementById(`comment-content-${commentId}`);
    const oldContent = contentEl.textContent;
    const newContent = prompt('Modifier votre commentaire:', oldContent);
    if (newContent && newContent.trim() !== oldContent) {
        apiFetch(`comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({ content: newContent })
        }).then(() => {
            showNotification('Commentaire modifié.', 'success', 1500);
            loadFeed();
        });
    }
}

// === INITIALISATION ===
function checkAuthAndLoadFeed() {
    if (getToken()) loadFeed();
    else renderLoginForm();
}

checkAuthAndLoadFeed();