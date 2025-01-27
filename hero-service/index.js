<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Jeu - Microservices Demo</title>
  <!-- Import Tailwind CSS via CDN -->
  <link
    href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.3/dist/tailwind.min.css"
    rel="stylesheet"
  />
  <style>
    /* Pour gérer la transition d'affichage, purement optionnelle */
    .hidden {
      display: none;
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-blue-700 text-white py-4 mb-4 shadow">
    <div class="container mx-auto px-4">
      <h1 class="text-2xl font-bold">Microservices Game Demo</h1>
    </div>
  </header>

  <!-- Main container -->
  <main class="container mx-auto px-4 flex-grow space-y-8">
    <!-- Message area (pour feedback utilisateur) -->
    <div id="messageArea" class="my-2 text-center"></div>

    <!-- 1) Register / Login Panel -->
    <div class="bg-white rounded shadow p-6" id="authPanel">
      <h2 class="text-xl font-semibold mb-4 text-blue-600">Authentification</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Register Form -->
        <div class="p-4 border-r border-gray-200">
          <h3 class="text-lg font-semibold mb-2">Créer un compte</h3>
          <form id="registerForm" class="space-y-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="registerUsername"
                class="w-full border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                placeholder="Choisis un username"
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="registerPassword"
                class="w-full border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                placeholder="Choisis un mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Créer mon compte
            </button>
          </form>
        </div>

        <!-- Login Form -->
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Se connecter</h3>
          <form id="loginForm" class="space-y-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="loginUsername"
                class="w-full border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                placeholder="Ton username"
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="loginPassword"
                class="w-full border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                placeholder="Ton mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- 2) Hero Panel -->
    <div class="bg-white rounded shadow p-6 hidden" id="heroPanel">
      <h2 class="text-xl font-semibold mb-4 text-blue-600">Mes Héros</h2>
      <div class="flex flex-col md:flex-row md:space-x-8">
        <!-- List Heroes -->
        <div class="md:w-1/2 mb-4 md:mb-0">
          <h3 class="text-lg font-semibold mb-2">Liste de mes héros</h3>
          <button
            id="btnReloadHeroes"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Recharger
          </button>
          <ul id="heroList" class="space-y-2"></ul>
        </div>
        
        <!-- Create Hero Form -->
        <div class="md:w-1/2">
          <h3 class="text-lg font-semibold mb-2">Créer un nouveau héros</h3>
          <form id="createHeroForm" class="space-y-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700">Nom du héros</label>
              <input
                type="text"
                id="heroName"
                class="w-full border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                placeholder="Ex: Conan"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Créer Héros
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- 3) Dungeon Panel -->
    <div class="bg-white rounded shadow p-6 hidden" id="dungeonPanel">
      <h2 class="text-xl font-semibold mb-4 text-blue-600">Donjons</h2>
      <div>
        <h3 class="text-lg font-semibold mb-2">Liste des donjons disponibles</h3>
        <button
          id="btnReloadDungeons"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        >
          Recharger Donjons
        </button>
        <select id="dungeonSelect" class="border-gray-300 rounded p-2 mr-2">
          <!-- On va y injecter la liste des donjons -->
        </select>
        <button
          id="btnEnterDungeon"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Entrer
        </button>
      </div>
      <div id="dungeonRunInfo" class="mt-4 hidden">
        <p class="text-gray-700" id="dungeonRunText"></p>
        <button
          id="btnMove"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-2"
        >
          Avancer
        </button>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-4 mt-4">
    <div class="container mx-auto px-4 text-center">
      <p class="text-sm">
        &copy; 2025 - Microservices Game Demo
      </p>
    </div>
  </footer>

  <!-- JS Logic -->
  <script>
    // Global variables
    let token = null;
    let selectedHeroId = null;
    let currentRunId = null; // ID du DungeonRun si on est dans un donjon

    // Les URLs de nos microservices (à adapter selon config)
    const AUTH_SERVICE_URL = 'http://localhost:3001';
    const HERO_SERVICE_URL = 'http://localhost:3003';
    const DUNGEON_SERVICE_URL = 'http://localhost:3004';

    // DOM elements
    const messageArea = document.getElementById('messageArea');
    const authPanel = document.getElementById('authPanel');
    const heroPanel = document.getElementById('heroPanel');
    const dungeonPanel = document.getElementById('dungeonPanel');
    const heroList = document.getElementById('heroList');
    const dungeonSelect = document.getElementById('dungeonSelect');
    const dungeonRunInfo = document.getElementById('dungeonRunInfo');
    const dungeonRunText = document.getElementById('dungeonRunText');

    // --------------------------------------------------------
    // 1) REGISTER
    // --------------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value.trim();
      const password = document.getElementById('registerPassword').value;
      try {
        const resp = await fetch(`${AUTH_SERVICE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (!resp.ok) {
          const errData = await resp.json();
          showMessage(`Erreur inscription: ${errData.error || resp.statusText}`, true);
          return;
        }
        const data = await resp.json();
        showMessage(`Inscription réussie: ${data.message}`, false);
      } catch (error) {
        showMessage('Erreur réseau lors de l’inscription.', true);
        console.error(error);
      }
    });

    // --------------------------------------------------------
    // 2) LOGIN
    // --------------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        const resp = await fetch(`${AUTH_SERVICE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (resp.ok && data.token) {
          token = data.token;
          showMessage(`Connecté avec succès !<br>Token = <code>${token}</code>`, false);
          // On masque le panel auth, on affiche le panel héros
          authPanel.classList.add('hidden');
          heroPanel.classList.remove('hidden');
        } else {
          showMessage(`Échec de la connexion: ${data.error || 'Inconnu'}`, true);
        }
      } catch (error) {
        showMessage('Erreur réseau lors de la connexion.', true);
        console.error(error);
      }
    });

    // --------------------------------------------------------
    // 3) GESTION DES HÉROS
    // --------------------------------------------------------
    const btnReloadHeroes = document.getElementById('btnReloadHeroes');
    btnReloadHeroes.addEventListener('click', loadHeroes);

    async function loadHeroes() {
      heroList.innerHTML = 'Chargement...';
      try {
        const resp = await fetch(`${HERO_SERVICE_URL}/heroes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        if (!resp.ok) {
          const err = await resp.json();
          showMessage(`Erreur load heroes: ${err.error}`, true);
          heroList.innerHTML = '';
          return;
        }
        const heroes = await resp.json();
        renderHeroList(heroes);
      } catch (error) {
        console.error(error);
        showMessage('Erreur réseau lors du chargement des héros.', true);
        heroList.innerHTML = '';
      }
    }

    function renderHeroList(heroes) {
      heroList.innerHTML = '';
      if (!heroes.length) {
        heroList.innerHTML = '<li class="text-gray-500">Aucun héros</li>';
        return;
      }
      heroes.forEach(hero => {
        const li = document.createElement('li');
        li.classList.add('p-2', 'border', 'border-gray-300', 'rounded', 'cursor-pointer', 'hover:bg-gray-100');
        li.textContent = `${hero.name} (Lvl ${hero.level}) - HP: ${hero.hp} - Gold: ${hero.gold}`;
        li.addEventListener('click', () => {
          selectedHeroId = hero._id;
          showMessage(`Héros sélectionné : ${hero.name}`, false);
          // Afficher le panel dungeon
          dungeonPanel.classList.remove('hidden');
        });
        heroList.appendChild(li);
      });
    }

    // Création de héros
    const createHeroForm = document.getElementById('createHeroForm');
    createHeroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const heroName = document.getElementById('heroName').value.trim();
      try {
        const resp = await fetch(`${HERO_SERVICE_URL}/heroes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ name: heroName })
        });
        const data = await resp.json();
        if (!resp.ok) {
          showMessage(`Erreur création héros: ${data.error || resp.statusText}`, true);
          return;
        }
        showMessage(`Héros créé: ${data.name}`, false);
        // Réinitialiser le formulaire
        createHeroForm.reset();
        // Recharger la liste
        loadHeroes();
      } catch (error) {
        showMessage('Erreur réseau lors de la création du héros.', true);
        console.error(error);
      }
    });

    // --------------------------------------------------------
    // 4) GESTION DES DONJONS
    // --------------------------------------------------------
    const btnReloadDungeons = document.getElementById('btnReloadDungeons');
    btnReloadDungeons.addEventListener('click', loadDungeons);

    async function loadDungeons() {
      // Vide le select
      dungeonSelect.innerHTML = '<option value="">Chargement...</option>';
      try {
        const resp = await fetch(`${DUNGEON_SERVICE_URL}/dungeons`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        if (!resp.ok) {
          const errData = await resp.json();
          showMessage(`Erreur chargement donjons: ${errData.error}`, true);
          dungeonSelect.innerHTML = '';
          return;
        }
        const dungeons = await resp.json();
        dungeonSelect.innerHTML = '';
        if (!dungeons.length) {
          dungeonSelect.innerHTML = '<option>Aucun donjon disponible</option>';
          return;
        }
        dungeons.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d._id;
          opt.textContent = d.name;
          dungeonSelect.appendChild(opt);
        });
      } catch (error) {
        showMessage('Erreur réseau lors du chargement des donjons.', true);
        console.error(error);
      }
    }

    // Entrer dans un donjon
    const btnEnterDungeon = document.getElementById('btnEnterDungeon');
    btnEnterDungeon.addEventListener('click', async () => {
      if (!selectedHeroId) {
        showMessage('Sélectionne d’abord un héros.', true);
        return;
      }
      const dungeonId = dungeonSelect.value;
      if (!dungeonId) {
        showMessage('Sélectionne un donjon.', true);
        return;
      }
      try {
        const resp = await fetch(`${DUNGEON_SERVICE_URL}/dungeons/enter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            heroId: selectedHeroId,
            dungeonId: dungeonId
          })
        });
        const data = await resp.json();
        if (!resp.ok) {
          showMessage(`Erreur entrée donjon: ${data.error || resp.statusText}`, true);
          return;
        }
        currentRunId = data._id; // l’ID du DungeonRun
        showMessage(`DungeonRun créé pour le donjon: ${dungeonId}`, false);
        // On montre le panel move
        dungeonRunInfo.classList.remove('hidden');
        dungeonRunText.textContent = 'Tu viens d’entrer dans le donjon. Position = 0';
      } catch (error) {
        showMessage('Erreur réseau lors de l’entrée dans le donjon.', true);
        console.error(error);
      }
    });

    // Se déplacer dans le donjon
    const btnMove = document.getElementById('btnMove');
    btnMove.addEventListener('click', async () => {
      if (!currentRunId) {
        showMessage('Aucune run active.', true);
        return;
      }
      try {
        const resp = await fetch(`${DUNGEON_SERVICE_URL}/dungeons/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ runId: currentRunId })
        });
        const data = await resp.json();
        if (!resp.ok) {
          showMessage(`Erreur déplacement: ${data.error || resp.statusText}`, true);
          return;
        }
        // On affiche le résultat
        showMessage(data.message, false);
        dungeonRunText.textContent = JSON.stringify(data.run, null, 2);

        // Si le donjon est terminé, on reset la run
        if (data.run && data.run.finished) {
          currentRunId = null;
          showMessage('Donjon terminé !', false);
        }
      } catch (error) {
        showMessage('Erreur réseau lors du déplacement.', true);
        console.error(error);
      }
    });

    // --------------------------------------------------------
    // UTILITAIRE D’AFFICHAGE DE MESSAGES
    // --------------------------------------------------------
    function showMessage(msg, isError = false) {
      messageArea.innerHTML = `<div class="${
        isError ? 'text-red-600' : 'text-green-600'
      } font-semibold my-4 text-center">${msg}</div>`;
    }
  </script>
</body>
</html>
