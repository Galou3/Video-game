# Comment lancer l'application
- **Lancer la commande `docker compose up` puis ouvrir dans son navigateur le fichier `index.html` disponible dans `/frontend`.**
- **Si le docker compose ne marche pas, lancer les deux scripts bash `common-mongo-for-testing.sh` puis `common-rabbitmq-for-testing.sh`, aller ensuite dans chaque répertoire et lancer la commande `npm install` puis `npm run dev` dans cet ordre :**
   - `/api-gateway`
   - `/auth-service`
   - `/dungeon-service`
   - `/combat-service`
   - `/hero-service`

## Technologies
- **Base de données**: MongoDB
- **ORM**: Mongoose
- **Message Broker**: RabbitMQ
- **Framework Backend**: Express.js
- **Frontend**: HTML5, Tailwind CSS

## Bases de Données
- **Auth Service**: `auth`
- **Heroes Service**: `heroes`
- **Combats Service**: `heroes` (partage la même base que Heroes Service)
- **Dungeons Service**: `dungeons`

### Entités en base
- **user**, correspondant à un utilisateur du jeu
- **userRefreshToken**, correspondant au token de connexion du joueur afin de rafraîchir le token d'accès
- **dungeon**, correspondant à un donjon avec toutes les différentes cases du donjon
- **dungeonRun**, correspondant à une partie en cours lié à un **user** et un **hero** permettant la sauvegarde de l'avancée de la partie
- **hero**, correspondant à un hero avec des hp, gold, level

## Queue et Messages
### Queues
- `DUNGEON_QUEUE` correspondant à la queue pour les évènements relatifs au donjon
- `COMBAT_QUEUE` correspondant à la queue pour les évènements relatifs au combat

### Events
- `combat.end` lorsqu'un combat arrive à son issue
- `dungeon.loot` après un combat afin de récupérer des objets dans le niveau

---

## API Gateway
- **Port**: 3000
- **Base URL**: `http://localhost:3000`

### Routes Proxy
- `/auth-gateway/*` -> Auth Service (3001)
- `/heroes-gateway/*` -> Heroes Service (3002)
- `/dungeons-gateway/*` -> Dungeons Service (3003)
- `/combats-gateway/*` -> Combats Service (3004)

---

## Auth Service
- **Port**: 3001
- **Base URL**: `http://localhost:3001/api/v1/auth`

### Routes
1. **POST /register**
   - Crée un nouvel utilisateur
   - Body: `{ username, password }`

2. **POST /login**
   - Authentifie un utilisateur
   - Body: `{ username, password }`
   - Retourne: `{ accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt }`

3. **POST /refresh-token**
   - Rafraîchit le token d'accès
   - Header: `Authorization: Bearer <refreshToken>`

---

## Heroes Service
- **Port**: 3002
- **Base URL**: `http://localhost:3002/api/v1/heroes`

### Routes
1. **GET /get-heroes**
   - Récupère tous les héros de l'utilisateur
   - Header: `x-user-id`

2. **POST /create-hero**
   - Crée un nouveau héros
   - Header: `x-user-id`
   - Body: `{ name, power }`

3. **GET /get-hero/:id**
   - Récupère un héros spécifique
   - Header: `x-user-id`

4. **POST /update-hp**
   - Met à jour les points de vie d'un héros
   - Header: `x-user-id`
   - Body: `{ heroId, hpChange }`

5. **POST /update-hero**
   - Met à jour les informations d'un héros
   - Header: `x-user-id`
   - Body: `{ heroId, gold, level, hp }`

6. **DELETE /delete-hero/:id**
   - Supprime un héros
   - Header: `x-user-id`

---

## Dungeons Service
- **Port**: 3003
- **Base URL**: `http://localhost:3003/api/v1/dungeons`

### Routes
1. **GET /get-dungeons**
   - Récupère tous les donjons disponibles

2. **POST /enter**
   - Entre dans un donjon
   - Header: `x-user-id`
   - Body: `{ heroId, dungeonId }`

3. **POST /move**
   - Déplace le héros dans le donjon
   - Header: `x-user-id`
   - Body: `{ runId, moveX, moveY }`

---

## Combats Service
- **Port**: 3004
- **Base URL**: `http://localhost:3004/api/v1/combats`

### Routes
1. **POST /attack**
   - Effectue une attaque dans un combat
   - Body: `{ runId, playerMove }`
   - Retourne: `{ result, enemyMove, hpLost }`

---

## Frontend
- **Port**: 80
- **Base URL**: `http://localhost`

### Pages
1. **/**
   - Page principale avec :
     - Formulaire d'authentification
     - Gestion des héros
     - Interface des donjons
     - Barre de vie
