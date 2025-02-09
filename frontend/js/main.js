// Global variables
let token = null;
let selectedHeroId = null;
let currentRunId = null; // ID du DungeonRun si on est dans un donjon
let currentHp = 100;
const maxHp = 100;

// Les URLs de nos microservices (à adapter selon config)
const AUTH_SERVICE_URL = 'http://localhost:3000/auth-gateway/api/v1/auth';
const HERO_SERVICE_URL = 'http://localhost:3000/heroes-gateway/api/v1/heroes';
const DUNGEON_SERVICE_URL = 'http://localhost:3000/dungeons-gateway/api/v1/dungeons';
const COMBAT_SERVICE_URL = 'http://localhost:3000/combats-gateway/api/v1/combats';

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
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    try {
        const resp = await fetch(`${AUTH_SERVICE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, "confirm-password": confirmPassword })
        });
        if (!resp.ok) {
            const errData = await resp.json();
            showMessage(`Erreur inscription: ${JSON.stringify(errData.errors.map(err => err.msg).join(",<br>")) || resp.statusText}`, true);
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
        if (resp.ok && data.accessToken) {  // <-- Utilisation de accessToken ici
            token = data.accessToken;
            showMessage("Connecté avec succès !", false);

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
    const userId = "633f1e2a3b8f9c1234567890"; // userId en dur pour test
    try {
        const resp = await fetch(`${HERO_SERVICE_URL}/get-heroes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

    const userId = "633f1e2a3b8f9c1234567890";

    try {
        const resp = await fetch(`${HERO_SERVICE_URL}/create-hero`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: heroName })
        });
        const data = await resp.json();
        if (!resp.ok) {
            showMessage(`Erreur création héros: ${data.error || resp.statusText}`, true);
            return;
        }
        showMessage(`Héros créé: ${data.name}`, false);

        createHeroForm.reset();
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
    dungeonSelect.innerHTML = '<option value="">Chargement...</option>';
    try {
        const resp = await fetch(`${DUNGEON_SERVICE_URL}/get-dungeons`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            const errData = await resp.json();
            showMessage(`Erreur chargement donjons: ${errData.error}`, true);
            dungeonSelect.innerHTML = '';
            return;
        }
        const dungeons = await resp.json();
        dungeonData = dungeons; // Stockage global
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
        const resp = await fetch(`${DUNGEON_SERVICE_URL}/enter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
        dungeonRunInfo.classList.remove('hidden');
        dungeonRunText.textContent = 'Tu viens d’entrer dans le donjon. Position = 0';
        document.getElementById("healthContainer").classList.remove("hidden");
        // Retrouver l’objet dungeon dans dungeonData
        currentDungeon = dungeonData.find(d => d._id === dungeonId);
        // Afficher la carte du donjon
        renderDungeonMap(currentDungeon, data);
    } catch (error) {
        showMessage('Erreur réseau lors de l’entrée dans le donjon.', true);
        console.error(error);
    }
});

function renderDungeonMap(dungeon, run) {
    const dungeonMap = document.getElementById('dungeonMap');
    dungeonMap.innerHTML = ''; // Effacer l'ancienne carte
    if (!dungeon || !dungeon.layout) return;

    const numRows = dungeon.layout.length;
    const numCols = dungeon.layout[0].length;

    // Configuration du conteneur en grille
    dungeonMap.style.display = 'grid';
    dungeonMap.style.gridTemplateColumns = `repeat(${numCols}, 50px)`;
    dungeonMap.style.gap = '2px';

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const cellType = dungeon.layout[i][j];
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('flex', 'items-center', 'justify-center', 'border', 'text-sm', 'font-bold');
            cellDiv.style.width = '50px';
            cellDiv.style.height = '50px';

            // Couleur de fond en fonction du type de cellule
            if (cellType === 'FLOOR') {
                cellDiv.classList.add('bg-gray-200');
            } else if (cellType === 'ENNEMY') {
                cellDiv.classList.add('bg-red-300');
            } else if (cellType === 'BOSS') {
                cellDiv.classList.add('bg-red-600', 'text-white');
            } else if (cellType === 'DOOR') {
                cellDiv.classList.add('bg-yellow-400');
                cellDiv.textContent = '🚪';
            }

            // Marquer la position du héros
            if (run && run.lastPos && run.lastPos.x === i && run.lastPos.y === j) {
                cellDiv.textContent = '🙂'; // Marqueur du héros
                cellDiv.classList.add('border-4', 'border-green-500');
            } else {
                cellDiv.textContent = cellType.charAt(0); // Première lettre du type
            }

            // Ajout d'un écouteur de clic sur la cellule
            cellDiv.addEventListener('click', () => {
                // Par exemple, vous pouvez calculer le déplacement nécessaire pour aller sur cette case
                // et appeler une fonction moveTo(i, j) qui s'occupera d'envoyer la requête.
                moveTo(i, j, run);
            });

            dungeonMap.appendChild(cellDiv);
        }
    }
}

// Fonction pour mettre à jour la barre de vie
function updateHealthBar(hpChange) {
    currentHp -= hpChange;

    // S'assurer que la vie ne descend pas en dessous de 0
    if (currentHp < 0) currentHp = 0;

    // Mettre à jour l'affichage
    const healthBar = document.getElementById('healthBar');
    const healthText = document.getElementById('healthText');
    const healthPercentage = (currentHp / maxHp) * 100;

    healthBar.style.width = `${healthPercentage}%`;
    healthText.textContent = `${currentHp} / ${maxHp}`;

    // Changer la couleur en fonction de la santé
    if (healthPercentage > 50) {
        healthBar.style.backgroundColor = '#4CAF50'; // Vert
    } else if (healthPercentage > 20) {
        healthBar.style.backgroundColor = '#FFC107'; // Orange
    } else {
        healthBar.style.backgroundColor = '#F44336'; // Rouge
    }
}

// Modifier ta fonction de combat pour mettre à jour la barre de vie
async function handleCombat() {
    const moves = ['rock', 'paper', 'scissors'];
    const playerMove = moves[Math.floor(Math.random() * moves.length)];

    try {
        const resp = await fetch(`${COMBAT_SERVICE_URL}/attack`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                runId: currentRunId,
                playerMove: playerMove
            })
        });

        const data = await resp.json();
        if (!resp.ok) {
            showMessage(`Erreur combat: ${data.error}`, true);
            return;
        }

        showMessage(`${data.message} (Ton coup: ${playerMove}, Ennemi: ${data.enemyMove})`, false);

        if (data.hpLost !== 0) {
            // Mettre à jour la barre de vie visuellement
            updateHealthBar(data.hpLost);

            // Envoyer la mise à jour au backend
            const heroResp = await fetch(`${HERO_SERVICE_URL}/update-hp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    heroId: selectedHeroId,
                    hpChange: -data.hpLost
                })
            });

            if (!heroResp.ok) {
                const err = await heroResp.json();
                showMessage(`Erreur mise à jour HP: ${err.error}`, true);
            }

            if (currentHp <= 0) {
                // Supprimer le héros
                const deleteResp = await fetch(`${HERO_SERVICE_URL}/delete-hero/${selectedHeroId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!deleteResp.ok) {
                    const err = await deleteResp.json();
                    showMessage(`Erreur suppression héros: ${err.error}`, true);
                }

                currentRunId = null;
                selectedHeroId = null;
                currentHp = maxHp;
                document.getElementById("healthContainer").classList.add("hidden");
                dungeonPanel.classList.add('hidden');
                heroPanel.classList.remove('hidden');
                showMessage('Votre héros est mort et a été supprimé.', false);
                loadHeroes();
                return;
            }
        }

        // Recharger les infos du héros
        loadHeroes();

    } catch (error) {
        showMessage('Erreur réseau lors du combat.', true);
        console.error(error);
    }
}


function moveTo(targetX, targetY, run) {
    if (!run) {
        showMessage('Aucune run active.', true);
        return;
    }

    const moveX = targetX - run.lastPos.x;
    const moveY = targetY - run.lastPos.y;

    if (Math.abs(moveX) > 1 || Math.abs(moveY) > 1) {
        showMessage('Déplacement trop grand ! Vous ne pouvez bouger qu\'une case à la fois.', true);
        return;
    }


    fetch(`${DUNGEON_SERVICE_URL}/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ runId: currentRunId, moveX, moveY })
    })
        .then(resp => resp.json().then(data => ({ ok: resp.ok, data })))
        .then(({ ok, data }) => {
            if (!ok) {
                showMessage(`Erreur déplacement: ${data.error || ''}`, true);
                return;
            }

            showMessage(data.message, false);

            if (data.finished && data.rewards) {
                fetch(`${HERO_SERVICE_URL}/update-hero`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        heroId: selectedHeroId,
                        gold: data.rewards.gold,
                        level: data.rewards.level
                    })
                })
                .then(response => response.json())
                .then(result => {
                    showMessage(`Vous avez gagné ${data.rewards.gold} gold et ${data.rewards.level} level !`, false);
                    currentRunId = null;
                    
                    // Ajout de cette partie pour rediriger vers la sélection des héros
                    if (data.shouldRedirect) {
                        dungeonPanel.classList.add('hidden');
                        heroPanel.classList.remove('hidden');
                        document.getElementById("healthContainer").classList.add("hidden");
                        loadHeroes();
                    }
                });
            }

            if (data.inCombat) {
                handleCombat();
            }

            dungeonRunText.textContent = `Position actuelle : x=${data.run.lastPos.x}, y=${data.run.lastPos.y}`;
            if (currentDungeon) {
                renderDungeonMap(currentDungeon, data.run);
            }
        })
        .catch(error => {
            showMessage('Erreur réseau lors du déplacement.', true);
            console.error(error);
        });
}

// Se déplacer dans le donjon
const btnMove = document.getElementById('btnMove');
btnMove.addEventListener('click', async () => {
    if (!currentRunId) {
        showMessage('Aucune run active.', true);
        return;
    }
    try {
        const resp = await fetch(`${DUNGEON_SERVICE_URL}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ runId: currentRunId, moveX: 1, moveY: 0 })
        });
        const data = await resp.json();
        if (!resp.ok) {
            showMessage(`Erreur déplacement: ${data.error || resp.statusText}`, true);
            return;
        }
        showMessage(data.message, false);
        dungeonRunText.textContent = `Position actuelle : x=${data.run.lastPos.x}, y=${data.run.lastPos.y}`;
        if (currentDungeon) {
            renderDungeonMap(currentDungeon, data.run);
        }
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
