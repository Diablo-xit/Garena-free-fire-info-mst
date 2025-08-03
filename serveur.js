// serveur.js - Garena Free Fire Info (Version finale pour Render)

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const server = require('http').createServer(app);

// === Dossiers de données ===
const UPLOADS_DIR = './uploads';
const USERS_FILE = './users.json';
const POSTS_FILE = './posts.json';

// Créer les dossiers/fichiers si absents
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '{}');
}
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, '[]');
}

// === Configuration de Multer ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// === Middleware ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR)); // Rendre les images accessibles

// === Routes ===

// Page d'accueil
app.get('/', function (req, res) {
  res.send(
    "<!DOCTYPE html>" +
    "<html lang='fr'>" +
    "<head>" +
    "  <meta charset='UTF-8'>" +
    "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
    "  <title>Garena Free Fire Info</title>" +
    "  <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' rel='stylesheet'>" +
    "  <style>" +
    "    * { box-sizing: border-box; margin: 0; padding: 0; }" +
    "    body { font-family: 'Roboto', sans-serif; background: #0f0f1a; color: #fff; line-height: 1.6; }" +
    "    .container { max-width: 900px; margin: 40px auto; padding: 20px; }" +
    "    header { text-align: center; margin-bottom: 30px; }" +
    "    header h1 { font-size: 2.5em; color: #00e676; text-shadow: 0 0 10px rgba(0, 230, 118, 0.5); }" +
    "    .auth-form { background: #1a1a2e; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); margin-bottom: 30px; }" +
    "    input, button { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 6px; }" +
    "    input { background: #2d2d44; color: white; }" +
    "    button { background: #00e676; color: black; font-weight: bold; cursor: pointer; transition: 0.3s; }" +
    "    button:hover { background: #00c853; }" +
    "    .post { background: #1a1a2e; margin: 20px 0; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }" +
    "    .post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }" +
    "    .avatar { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #00e676; }" +
    "    .post img { width: 100%; max-height: 400px; border-radius: 8px; margin-top: 10px; }" +
    "    .publish-form { background: #1a1a2e; padding: 20px; border-radius: 10px; margin-bottom: 20px; display: none; }" +
    "    .publish-form.active { display: block; }" +
    "    .publish-form textarea { width: 100%; padding: 12px; background: #2d2d44; border: none; border-radius: 6px; color: white; height: 100px; resize: none; }" +
    "    .toggle-btn { display: block; width: 100%; background: #1a73e8; color: white; margin-bottom: 15px; font-size: 1.1em; font-weight: bold; }" +
    "    .logout { background: #d32f2f; color: white; text-align: center; padding: 10px; border-radius: 6px; margin-top: 20px; cursor: pointer; }" +
    "    .hidden { display: none; }" +
    "  </style>" +
    "</head>" +
    "<body>" +
    "  <div class='container'>" +
    "    <header>" +
    "      <h1>🔥 Garena Free Fire Info</h1>" +
    "      <p>Restez informés des dernières nouvelles et mises à jour</p>" +
    "    </header>" +

    "    <!-- Inscription -->" +
    "    <div class='auth-form' id='registerForm'>" +
    "      <h2>Inscription</h2>" +
    "      <input type='text' id='regUsername' placeholder='Nom d'utilisateur' required />" +
    "      <input type='password' id='regPassword' placeholder='Mot de passe' required />" +
    "      <label>Photo de profil :</label>" +
    "      <input type='file' id='regAvatar' name='avatar' accept='image/*' required />" +
    "      <button onclick='register()'>S'inscrire</button>" +
    "      <p style='text-align:center; margin-top:10px;'>" +
    "        <a href='#' onclick='showLoginForm()' style='color:#00e676;'>Déjà inscrit ? Connectez-vous</a>" +
    "      </p>" +
    "    </div>" +

    "    <!-- Connexion -->" +
    "    <div class='auth-form hidden' id='loginForm'>" +
    "      <h2>Connexion</h2>" +
    "      <input type='text' id='loginUsername' placeholder='Nom d'utilisateur' required />" +
    "      <input type='password' id='loginPassword' placeholder='Mot de passe' required />" +
    "      <button onclick='login()'>Se connecter</button>" +
    "      <p style='text-align:center;'>" +
    "        <a href='#' onclick='forgotPassword()' style='color:#00e676;'>Mot de passe oublié ?</a>" +
    "      </p>" +
    "      <p style='text-align:center; margin-top:10px;'>" +
    "        <a href='#' onclick='showRegisterForm()' style='color:#00e676;'>Pas encore inscrit ?</a>" +
    "      </p>" +
    "    </div>" +

    "    <!-- Dashboard -->" +
    "    <div class='auth-form hidden' id='dashboard'>" +
    "      <h2>Bienvenue, <span id='welcomeUser'></span> !</h2>" +
    "      <button class='toggle-btn' onclick='togglePublishForm()'>➕ Créer une publication</button>" +
    "      <div class='publish-form' id='publishForm'>" +
    "        <h3>Écrire une publication</h3>" +
    "        <textarea id='postContent' placeholder='Écrivez votre info...'></textarea>" +
    "        <input type='file' id='postImage' accept='image/*' />" +
    "        <button onclick='publish()'>Publier</button>" +
    "        <button type='button' onclick='togglePublishForm()' style='background:#999; margin-top:10px;'>❌ Fermer</button>" +
    "      </div>" +
    "      <div id='postsContainer'></div>" +
    "      <div class='logout' onclick='logout()'>Déconnexion</div>" +
    "    </div>" +
    "  </div>" +

    "  <script>" +
    "    let currentUser = null;" +
    "    function showRegisterForm() {" +
    "      document.getElementById('registerForm').classList.remove('hidden');" +
    "      document.getElementById('loginForm').classList.add('hidden');" +
    "      document.getElementById('dashboard').classList.add('hidden');" +
    "    }" +
    "    function showLoginForm() {" +
    "      document.getElementById('registerForm').classList.add('hidden');" +
    "      document.getElementById('loginForm').classList.remove('hidden');" +
    "      document.getElementById('dashboard').classList.add('hidden');" +
    "    }" +
    "    async function register() {" +
    "      const username = document.getElementById('regUsername').value;" +
    "      const password = document.getElementById('regPassword').value;" +
    "      const avatarInput = document.getElementById('regAvatar');" +
    "      if (!username || !password || !avatarInput.files[0]) {" +
    "        alert('Tous les champs sont requis, y compris la photo de profil');" +
    "        return;" +
    "      }" +
    "      const formData = new FormData();" +
    "      formData.append('username', username);" +
    "      formData.append('password', password);" +
    "      formData.append('avatar', avatarInput.files[0]);" +
    "      const res = await fetch('/register', { method: 'POST', body: formData });" +
    "      const data = await res.json();" +
    "      if (data.success) {" +
    "        alert('Inscription réussie !');" +
    "        showLoginForm();" +
    "      } else {" +
    "        alert('Erreur : ' + data.message);" +
    "      }" +
    "    }" +
    "    async function login() {" +
    "      const username = document.getElementById('loginUsername').value;" +
    "      const password = document.getElementById('loginPassword').value;" +
    "      const res = await fetch('/login', {" +
    "        method: 'POST'," +
    "        headers: { 'Content-Type': 'application/json' }," +
    "        body: JSON.stringify({ username, password })" +
    "      });" +
    "      const data = await res.json();" +
    "      if (data.success) {" +
    "        currentUser = data.username;" +
    "        localStorage.setItem('username', data.username);" +
    "        document.getElementById('welcomeUser').textContent = username;" +
    "        document.getElementById('registerForm').classList.add('hidden');" +
    "        document.getElementById('loginForm').classList.add('hidden');" +
    "        document.getElementById('dashboard').classList.remove('hidden');" +
    "        loadPosts();" +
    "      } else {" +
    "        alert('Erreur : ' + data.message);" +
    "      }" +
    "    }" +
    "    function forgotPassword() {" +
    "      const username = document.getElementById('loginUsername').value || 'utilisateur';" +
    "      alert('Un lien de récupération a été envoyé à ' + username + ' (simulé).');" +
    "    }" +
    "    function togglePublishForm() {" +
    "      const form = document.getElementById('publishForm');" +
    "      form.style.display = form.style.display === 'block' ? 'none' : 'block';" +
    "    }" +
    "    async function publish() {" +
    "      const content = document.getElementById('postContent').value;" +
    "      const imageInput = document.getElementById('postImage');" +
    "      if (!content) { alert('Le texte est obligatoire.'); return; }" +
    "      const formData = new FormData();" +
    "      formData.append('user', currentUser);" +
    "      formData.append('content', content);" +
    "      if (imageInput.files[0]) formData.append('image', imageInput.files[0]);" +
    "      const res = await fetch('/publish', { method: 'POST', body: formData });" +
    "      if (res.ok) {" +
    "        document.getElementById('postContent').value = '';" +
    "        document.getElementById('postImage').value = '';" +
    "        togglePublishForm();" +
    "        loadPosts();" +
    "      }" +
    "    }" +
    "    async function loadPosts() {" +
    "      const res = await fetch('/posts');" +
    "      const data = await res.json();" +
    "      const container = document.getElementById('postsContainer');" +
    "      container.innerHTML = '';" +
    "      data.forEach(post => {" +
    "        const div = document.createElement('div');" +
    "        div.className = 'post';" +
    "        div.innerHTML = " +
    "          `<div class='post-header'>" +
    "            <img class='avatar' src='${post.user.avatar}' alt='Avatar' />" +
    "            <div><strong>${post.user.username}</strong><br><small style='color:#888;'>${new Date(post.date).toLocaleString()}</small></div>" +
    "          </div>" +
    "          <p>${post.content}</p>" +
    "          ${post.image ? `<img src='${post.image}' alt='Image' />` : ''}`;" +
    "        container.appendChild(div);" +
    "      });" +
    "    }" +
    "    function logout() {" +
    "      localStorage.removeItem('username');" +
    "      currentUser = null;" +
    "      document.getElementById('dashboard').classList.add('hidden');" +
    "      showLoginForm();" +
    "    }" +
    "    window.onload = function() {" +
    "      const saved = localStorage.getItem('username');" +
    "      if (saved) {" +
    "        document.getElementById('loginUsername').value = saved;" +
    "      }" +
    "      loadPosts();" +
    "    };" +
    "  </script>" +
    "</body>" +
    "</html>"
  );
});

// === API Routes ===

// Inscription
app.post('/register', upload.single('avatar'), function (req, res) {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));

  if (users[username]) {
    return res.json({ success: false, message: 'Ce nom d’utilisateur existe déjà.' });
  }

  const avatar = '/uploads/' + req.file.filename;
  users[username] = { username: username, password: password, avatar: avatar };
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.json({ success: true });
});

// Connexion
app.post('/login', express.json(), function (req, res) {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users[username];

  if (!user) {
    return res.json({ success: false, message: 'Utilisateur non trouvé.' });
  }
  if (user.password !== password) {
    return res.json({ success: false, message: 'Mot de passe incorrect.' });
  }

  res.json({ success: true, username: user.username });
});

// Publier
app.post('/publish', upload.single('image'), function (req, res) {
  const { user, content } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const author = users[user];
  if (!author) return res.status(403).send();

  const imagePath = req.file ? '/uploads/' + req.file.filename : null;
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  posts.unshift({
    user: author,
    content: content,
    image: imagePath,
    date: new Date().toISOString()
  });
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));

  res.json({ success: true });
});

// Récupérer les publications
app.get('/posts', function (req, res) {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  res.json(posts);
});

// === Démarrage du serveur ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', function () {
  console.log("Garena Free Fire Info démarré sur http://0.0.0.0:" + PORT);
});
