// const BASE_API_URL = 'http://localhost:5000/api'; // change si besoin

// // --- AUTH UTILITIES ---
// function getToken() {
//     return localStorage.getItem('authToken');
// }
// function getUserId() {
//     return localStorage.getItem('currentUserId');
// }
// function updateNavButtons(isAuthenticated) {
//     const username = localStorage.getItem('username') || 'Utilisateur';
//     document.getElementById('btn-login-nav').classList.toggle('d-none', isAuthenticated);
//     document.getElementById('btn-signup-nav').classList.toggle('d-none', isAuthenticated);
//     document.getElementById('btn-logout-nav').classList.toggle('d-none', !isAuthenticated);
//     const welcome = document.getElementById('welcome-message');
//     welcome.classList.toggle('d-none', !isAuthenticated);
//     welcome.textContent = `Bienvenue, ${username} !`;
// }

// // --- API FETCH ---
// async function apiFetch(endpoint, options={}) {
//     const headers = { 'Content-Type': 'application/json', ...options.headers };
//     const token = getToken();
//     if(token) headers['Authorization'] = `Bearer ${token}`;

//     try {
//         const res = await fetch(`${BASE_API_URL}${endpoint}`, { ...options, headers });
//         if(!res.ok) {
//             const err = await res.json();
//             throw new Error(err.message || `API error: ${res.status}`);
//         }
//         if(res.status === 204) return null;
//         return await res.json();
//     } catch(e) {
//         console.error('Fetch Error:', e.message);
//         alert('Erreur: ' + e.message);
//         if(e.message.includes('401') || e.message.includes('token')) logout();
//         return null;
//     }
// }

// // --- RENDER LOGIN / SIGNUP ---
// function renderToAppRoot(html) {
//     document.getElementById('app-root').innerHTML = html;
// }

// function renderLoginForm() {
//     updateNavButtons(false);
//     renderToAppRoot(`
//     <div class="card p-4 shadow-sm">
//       <h3 class="card-title text-center mb-4">Connexion</h3>
//       <form id="login-form">
//         <div class="mb-3">
//           <label for="login-email" class="form-label">Email</label>
//           <input type="email" class="form-control" id="login-email" required>
//         </div>
//         <div class="mb-3">
//           <label for="login-password" class="form-label">Mot de passe</label>
//           <input type="password" class="form-control" id="login-password" required>
//         </div>
//         <button type="submit" class="btn btn-primary w-100">Se connecter</button>
//         <p class="mt-3 text-center">Pas encore de compte ? <a href="#" onclick="renderSignupForm()">Inscrivez-vous</a></p>
//       </form>
//     </div>
//     `);
//     document.getElementById('login-form').addEventListener('submit', handleLogin);
// }

// function renderSignupForm() {
//     updateNavButtons(false);
//     renderToAppRoot(`
//     <div class="card p-4 shadow-sm">
//       <h3 class="card-title text-center mb-4">Inscription</h3>
//       <form id="signup-form">
//         <div class="mb-3">
//           <label for="signup-username" class="form-label">Nom d'utilisateur</label>
//           <input type="text" class="form-control" id="signup-username" required>
//         </div>
//         <div class="mb-3">
//           <label for="signup-email" class="form-label">Email</label>
//           <input type="email" class="form-control" id="signup-email" required>
//         </div>
//         <div class="mb-3">
//           <label for="signup-password" class="form-label">Mot de passe</label>
//           <input type="password" class="form-control" id="signup-password" required>
//         </div>
//         <div class="mb-3">
//     <label for="signup-password-confirm" class="form-label">Confirmer le mot de passe</label>
//     <input type="password" class="form-control" id="signup-password-confirm" required>
// </div>

//         <button type="submit" class="btn btn-success w-100">S'inscrire</button>
//         <p class="mt-3 text-center">Déjà un compte ? <a href="#" onclick="renderLoginForm()">Connectez-vous</a></p>
//       </form>
//     </div>
//     `);
//     document.getElementById('signup-form').addEventListener('submit', handleSignup);
// }

// // --- LOGIN / SIGNUP HANDLERS ---
// async function handleSignup(e) {
//     e.preventDefault();
//     const username = document.getElementById('signup-username').value;
//     const email = document.getElementById('signup-email').value;
//     const password = document.getElementById('signup-password').value;
//     const confirmPassword = document.getElementById('signup-password-confirm').value;

//     const data = await apiFetch('/auth/register', {
//         method:'POST',
//         body: JSON.stringify({ username, email, password,confirmPassword })
//     });

//     if(data) {
//         alert('Inscription réussie ! Connectez-vous maintenant.');
//         renderLoginForm();
//     }
// }

// async function handleLogin(e) {
//     e.preventDefault();
//     const email = document.getElementById('login-email').value;
//     const password = document.getElementById('login-password').value;

//     const data = await apiFetch('/auth/login', {
//         method:'POST',
//         body: JSON.stringify({ email, password })
//     });

//     if(data && data.token) {
//         localStorage.setItem('authToken', data.token);
//         localStorage.setItem('username', data.user.username);
//         localStorage.setItem('currentUserId', data.user.id);
//         alert('Connexion réussie !');
//         checkAuthAndLoadFeed();
//     }
// }

// function logout() {
//     localStorage.clear();
//     alert('Déconnexion réussie');
//     renderLoginForm();
// }

// // --- POSTS & FEED ---
// async function loadFeed() {
//     const posts = await apiFetch('/posts', { method:'GET' });
//     if(posts) renderFeed(posts);
//     else if(!getToken()) renderLoginForm();
// }

// function renderFeed(posts) {
//     updateNavButtons(true);
//     const currentUserId = getUserId();
//     let html = `<button class="btn btn-success mb-4 w-100" data-bs-toggle="modal" data-bs-target="#createPostModal">Créer une publication</button>`;
//     if(posts.length === 0) html += '<p class="text-center text-muted">Aucune publication pour le moment.</p>';

//     posts.forEach(post=>{
//         const liked = post.likes.includes(currentUserId);
//         html += `
//         <div class="card post-card">
//           <div class="card-body">
//             <h5 class="card-title">${post.user.username}</h5>
//             <p class="card-text">${post.content}</p>
//           </div>
//           <div class="card-footer post-footer">
//             <button class="btn btn-sm ${liked?'btn-primary':'btn-outline-primary'}" onclick="toggleLike('${post._id}')">
//               ${liked?'❤️':'🤍'} ${post.likes.length}
//             </button>
//             <button class="btn btn-sm btn-outline-secondary" onclick="toggleCommentInput('${post._id}')">
//               💬 Commenter
//             </button>
//             <div id="comment-section-${post._id}" class="comment-input-group d-none">
//               <input type="text" id="comment-input-${post._id}" class="form-control mb-2" placeholder="Écrire un commentaire...">
//               <button class="btn btn-primary btn-sm w-100" onclick="handleAddComment('${post._id}')">Envoyer</button>
//             </div>
//           </div>
//         </div>
//         `;
//     });

//     renderToAppRoot(html);
// }

// function toggleCommentInput(postId) {
//     const section = document.getElementById(`comment-section-${postId}`);
//     section.classList.toggle('d-none');
// }

// // --- POST HANDLERS ---
// async function handleCreatePost() {
//     const content = document.getElementById('post-content').value;
//     if(!content.trim()) return alert("Le contenu ne peut pas être vide");

//     const data = await apiFetch('/posts', {
//         method:'POST',
//         body: JSON.stringify({ content })
//     });
//     if(data) {
//         const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
//         modal.hide();
//         document.getElementById('post-content').value = '';
//         loadFeed();
//     }
// }

// // --- LIKE HANDLER ---
// async function toggleLike(postId) {
//     const data = await apiFetch(`/posts/${postId}/like`, { method:'POST' });
//     if(data) loadFeed();
// }

// // --- COMMENT HANDLER ---
// async function handleAddComment(postId) {
//     const content = document.getElementById(`comment-input-${postId}`).value;
//     if (!content.trim()) {
//         alert("Le commentaire ne peut pas être vide.");
//         return;
//     }

//     const data = await apiFetch('/comments', {
//         method: 'POST',
//         body: JSON.stringify({
//             content,
//             author: getUserId(), // correspond au schéma
//             post: postId
//         })
//     });

//     if (data) {
//         alert("Commentaire ajouté !");
//         loadFeed(); // recharge le fil pour afficher le nouveau commentaire
//     }
// }

// // --- INITIAL CHECK ---
// function checkAuthAndLoadFeed() {
//     if(getToken()) loadFeed();
//     else renderLoginForm();
// }

// // Démarrage
// checkAuthAndLoadFeed();




const BASE_API_URL = 'http://localhost:5000/api';

// --- AUTH UTILITIES ---
function getToken() {
    return localStorage.getItem('authToken');
}
function getUserId() {
    return localStorage.getItem('currentUserId');
}
function updateNavButtons(isAuthenticated) {
    const username = localStorage.getItem('username') || 'Utilisateur';
    document.getElementById('btn-login-nav').classList.toggle('d-none', isAuthenticated);
    document.getElementById('btn-signup-nav').classList.toggle('d-none', isAuthenticated);
    document.getElementById('btn-logout-nav').classList.toggle('d-none', !isAuthenticated);
    const welcome = document.getElementById('welcome-message');
    welcome.classList.toggle('d-none', !isAuthenticated);
    welcome.textContent = `Bienvenue, ${username} !`;
}

// --- API FETCH ---
async function apiFetch(endpoint, options={}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if(token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${BASE_API_URL}${endpoint}`, { ...options, headers });
        if(!res.ok) {
            const err = await res.json();
            throw new Error(err.message || `API error: ${res.status}`);
        }
        if(res.status === 204) return null;
        return await res.json();
    } catch(e) {
        console.error('Fetch Error:', e.message);
        alert('Erreur: ' + e.message);
        if(e.message.includes('401') || e.message.includes('token')) logout();
        return null;
    }
}

// --- RENDER LOGIN / SIGNUP ---
function renderToAppRoot(html) {
    document.getElementById('app-root').innerHTML = html;
}

function renderLoginForm() {
    updateNavButtons(false);
    renderToAppRoot(`
    <div class="card p-4 shadow-sm">
      <h3 class="card-title text-center mb-4">Connexion</h3>
      <form id="login-form">
        <div class="mb-3">
          <label for="login-email" class="form-label">Email</label>
          <input type="email" class="form-control" id="login-email" required>
        </div>
        <div class="mb-3">
          <label for="login-password" class="form-label">Mot de passe</label>
          <input type="password" class="form-control" id="login-password" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Se connecter</button>
        <p class="mt-3 text-center">Pas encore de compte ? <a href="#" onclick="renderSignupForm()">Inscrivez-vous</a></p>
      </form>
    </div>
    `);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function renderSignupForm() {
    updateNavButtons(false);
    renderToAppRoot(`
    <div class="card p-4 shadow-sm">
      <h3 class="card-title text-center mb-4">Inscription</h3>
      <form id="signup-form">
        <div class="mb-3">
          <label for="signup-username" class="form-label">Nom d'utilisateur</label>
          <input type="text" class="form-control" id="signup-username" required>
        </div>
        <div class="mb-3">
          <label for="signup-email" class="form-label">Email</label>
          <input type="email" class="form-control" id="signup-email" required>
        </div>
        <div class="mb-3">
          <label for="signup-password" class="form-label">Mot de passe</label>
          <input type="password" class="form-control" id="signup-password" required>
        </div>
        <div class="mb-3">
          <label for="signup-password-confirm" class="form-label">Confirmer le mot de passe</label>
          <input type="password" class="form-control" id="signup-password-confirm" required>
        </div>
        <button type="submit" class="btn btn-success w-100">S'inscrire</button>
        <p class="mt-3 text-center">Déjà un compte ? <a href="#" onclick="renderLoginForm()">Connectez-vous</a></p>
      </form>
    </div>
    `);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

// --- LOGIN / SIGNUP HANDLERS ---
async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;

    if(password !== confirmPassword) return alert("Les mots de passe ne correspondent pas.");

    const data = await apiFetch('/auth/register', {
    method:'POST',
    body: JSON.stringify({ username, email, password, confirmPassword })
});


    if(data) {
        alert('Inscription réussie ! Connectez-vous maintenant.');
        renderLoginForm();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const data = await apiFetch('/auth/login', {
        method:'POST',
        body: JSON.stringify({ email, password })
    });

    if(data && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('currentUserId', data.user._id || data.user.id);
        alert('Connexion réussie !');
        checkAuthAndLoadFeed();
    }
}

function logout() {
    localStorage.clear();
    alert('Déconnexion réussie');
    renderLoginForm();
}

// --- POSTS & FEED ---
async function loadFeed() {
    const posts = await apiFetch('/posts', { method:'GET' });
    if(posts) {
        for(const post of posts) {
            const commentsData = await apiFetch(`/posts/${post._id}`); 
            post.comments = commentsData.comments || [];
            post.commentsCount = commentsData.commentsCount || 0;
        }
        renderFeed(posts);
        posts.forEach(p => renderComments(p._id, p.comments));
    } else if(!getToken()) renderLoginForm();
}

function renderFeed(posts) {
    updateNavButtons(true);
    const currentUserId = getUserId();
    let html = `<button class="btn btn-success mb-4 w-100" data-bs-toggle="modal" data-bs-target="#createPostModal">Créer une publication</button>`;
    if(posts.length === 0) html += '<p class="text-center text-muted">Aucune publication pour le moment.</p>';

    posts.forEach(post=>{
        const liked = post.likes.includes(currentUserId);
        const isOwner = post.user._id === currentUserId;

        html += `
        <div class="card post-card mb-3">
          <div class="card-body">
            <h5 class="card-title">${post.user.username}</h5>
            <p class="card-text" id="post-content-${post._id}">${post.content}</p>
            ${isOwner ? `
            <button class="btn btn-sm btn-warning" onclick="editPost('${post._id}')">✏️ Modifier</button>
            <button class="btn btn-sm btn-danger" onclick="deletePost('${post._id}')">🗑️ Supprimer</button>
            ` : ''}
          </div>
          <div class="card-footer post-footer">
            <button class="btn btn-sm ${liked?'btn-primary':'btn-outline-primary'}" onclick="toggleLike('${post._id}')">
              ${liked?'❤️':'🤍'} ${post.likes.length}
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="toggleCommentInput('${post._id}')">
              💬 Commenter (${post.commentsCount || 0})
            </button>
            <div id="comment-section-${post._id}" class="comment-input-group d-none">
              <input type="text" id="comment-input-${post._id}" class="form-control mb-2" placeholder="Écrire un commentaire...">
              <button class="btn btn-primary btn-sm w-100" onclick="handleAddComment('${post._id}')">Envoyer</button>
              <div id="comments-list-${post._id}" class="mt-2"></div>
            </div>
          </div>
        </div>
        `;
    });

    renderToAppRoot(html);
}

function toggleCommentInput(postId) {
    const section = document.getElementById(`comment-section-${postId}`);
    section.classList.toggle('d-none');
}

// --- POST HANDLERS ---
async function handleCreatePost() {
    const content = document.getElementById('post-content').value;
    if(!content.trim()) return alert("Le contenu ne peut pas être vide");

    const data = await apiFetch('/posts', {
        method:'POST',
        body: JSON.stringify({ content })
    });
    if(data) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
        modal.hide();
        document.getElementById('post-content').value = '';
        loadFeed();
    }
}

async function deletePost(postId) {
    if(!confirm('Voulez-vous vraiment supprimer ce post ?')) return;
    const data = await apiFetch(`/posts/${postId}`, { method:'DELETE' });
    if(data) loadFeed();
}

function editPost(postId) {
    const contentEl = document.getElementById(`post-content-${postId}`);
    const oldContent = contentEl.textContent;
    const newContent = prompt('Modifier votre post:', oldContent);
    if(newContent && newContent.trim() !== oldContent) {
        apiFetch(`/posts/${postId}`, {
            method:'PUT',
            body: JSON.stringify({ content: newContent })
        }).then(() => loadFeed());
    }
}

// --- LIKE HANDLER ---
async function toggleLike(postId) {
    const data = await apiFetch(`/posts/${postId}/like`, { method:'POST' });
    if(data) loadFeed();
}

// --- COMMENT HANDLER ---
async function handleAddComment(postId) {
    const content = document.getElementById(`comment-input-${postId}`).value;
    if (!content.trim()) return alert("Le commentaire ne peut pas être vide.");

    const data = await apiFetch('/comments', {
        method: 'POST',
        body: JSON.stringify({
            content,
            author: getUserId(),
            post: postId
        })
    });

    if (data) {
        document.getElementById(`comment-input-${postId}`).value = '';
        loadFeed();
    }
}

function renderComments(postId, comments) {
    const container = document.getElementById(`comments-list-${postId}`);
    container.innerHTML = '';
    const currentUserId = getUserId();

    comments.forEach(c => {
        const isOwner = c.author._id === currentUserId;
        container.innerHTML += `
        <div class="card mb-1">
            <div class="card-body p-2">
                <strong>${c.author.username}</strong>: <span id="comment-content-${c._id}">${c.content}</span>
                ${isOwner ? `
                <button class="btn btn-sm btn-warning ms-2" onclick="editComment('${c._id}', '${postId}')">✏️</button>
                <button class="btn btn-sm btn-danger ms-1" onclick="deleteComment('${c._id}', '${postId}')">🗑️</button>
                ` : ''}
            </div>
        </div>
        `;
    });
}

async function deleteComment(commentId, postId) {
    if(!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;
    const data = await apiFetch(`/comments/${commentId}`, { method:'DELETE' });
    if(data) loadFeed();
}

function editComment(commentId, postId) {
    const contentEl = document.getElementById(`comment-content-${commentId}`);
    const oldContent = contentEl.textContent;
    const newContent = prompt('Modifier votre commentaire:', oldContent);
    if(newContent && newContent.trim() !== oldContent) {
        apiFetch(`/comments/${commentId}`, {
            method:'PUT',
            body: JSON.stringify({ content: newContent })
        }).then(() => loadFeed());
    }
}

// --- INITIAL CHECK ---
function checkAuthAndLoadFeed() {
    if(getToken()) loadFeed();
    else renderLoginForm();
}

// Démarrage
checkAuthAndLoadFeed();
