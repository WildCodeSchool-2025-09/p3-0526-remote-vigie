# p3-0526-remote-vigie

Ce projet est un monorepo JS, suivant l'architecture React-Express-MySQL telle qu'enseignée à la Wild Code School (v7.2.4) :

```mermaid
sequenceDiagram
    box Web Client
    participant React as React
    participant Fetcher as Fetcher
    end
    box Web Server
    participant Express as Express
    participant Module as Module
    end
    box DB Server
    participant DB as MySQL Server
    end

    React-)Fetcher: event
    activate Fetcher
    Fetcher-)Express: requête (HTTP)
    activate Express
    Express-)Module: appel
    activate Module
    Module-)DB: requête SQL
    activate DB
    DB--)Module: données
    deactivate DB
    Module--)Express: json
    deactivate Module
    Express--)Fetcher: réponse HTTP
    deactivate Express
    Fetcher--)React: render
    deactivate Fetcher
```

Il est pré-configuré avec un ensemble d'outils pour aider les étudiants à produire du code de qualité industrielle, tout en restant un outil pédagogique :

- **Concurrently** : Permet d'exécuter plusieurs commandes simultanément dans le même terminal.
- **Vite** : Alternative à _Create-React-App_, offrant une expérience plus fluide avec moins d'outils.
- **Biome** : Alternative à _ESlint_ et _Prettier_, assurant la qualité du code selon des règles choisies.
- **Supertest** : Bibliothèque pour tester les serveurs HTTP en node.js.

## Table des Matières

- [p3-0526-remote-vigie](#name)
  - [Table des Matières](#table-des-matières)
  - [Installation \& Utilisation](#installation--utilisation)
  - [Les choses à retenir](#les-choses-à-retenir)
    - [Commandes de Base](#commandes-de-base)
    - [Structure des Dossiers](#structure-des-dossiers)
    - [Mettre en place la base de données](#mettre-en-place-la-base-de-données)
    - [Remplir les lieux utiles de la carte](#remplir-les-lieux-utiles-de-la-carte)
    - [Simuler une progression de badges](#simuler-une-progression-de-badges)
    - [Activer la connexion Google](#activer-la-connexion-google)
    - [Développer la partie back-end](#développer-la-partie-back-end)
    - [REST](#rest)
    - [Autres Bonnes Pratiques](#autres-bonnes-pratiques)
  - [FAQ](#faq)
    - [Installation avec Docker](#installation-avec-docker)
      - [Mode développement](#mode-développement)
      - [Installation de nouvelles dépendances](#installation-de-nouvelles-dépendances)
      - [Accéder à la base de données](#accéder-à-la-base-de-données)
    - [Déploiement avec Traefik](#déploiement-avec-traefik)
    - [Variables d'environnement spécifiques](#variables-denvironnement-spécifiques)
    - [Logs](#logs)
    - [Contribution](#contribution)

## Installation & Utilisation

1. Installez le plugin **Biome** dans VSCode et configurez-le.
2. Clonez ce dépôt, puis accédez au répertoire cloné.
3. Exécutez la commande `npm install`.
4. Créez des fichiers d'environnement (`.env`) dans les répertoires `server` et `client` : vous pouvez copier les fichiers `.env.sample` comme modèles (**ne les supprimez pas**).

## Les choses à retenir

### Commandes de Base

| Commande               | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `npm install`          | Installe les dépendances pour le client et le serveur                       |
| `npm run db:migrate`   | Met à jour la base de données à partir d'un schéma défini                   |
| `npm run sync:places --workspace=server` | Remplit les lieux utiles de la carte depuis OpenStreetMap (voir [Remplir les lieux utiles](#remplir-les-lieux-utiles-de-la-carte)) |
| `npm run dev`          | Démarre les deux serveurs (client et serveur) dans un seul terminal         |
| `npm run check`        | Exécute les outils de validation (linting et formatage)                     |
| `npm run test`         | Exécute les tests unitaires et d'intégration                                |

### Structure des Dossiers

```plaintext
my-project/
│
├── server/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── item/
│   │   │   │   ├── itemActions.ts
│   │   │   │   └── itemRepository.ts
│   │   │   └── ...
│   │   ├── app.ts
│   │   ├── main.ts
│   │   └── router.ts
│   ├── database/
│   │   ├── client.ts
│   │   └── schema.sql
│   ├── tests/
│   ├── .env
│   └── .env.sample
│
└── client/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.tsx
    ├── .env
    └── .env.sample
```

### Mettre en place la base de données

**Créer et remplir le fichier `.env`** dans le dossier `server` :

```plaintext
DB_HOST=localhost
DB_PORT=3306
DB_USER=not_root
DB_PASSWORD=password
DB_NAME=my_database
```

**Les variables sont utilisés** dans `server/database/client.ts` :

```typescript
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

import mysql from "mysql2/promise";

const client = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT as number | undefined,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

export default client;
```

**Créer une table** dans `server/database/schema.sql` :

```sql
CREATE TABLE item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES user(id)
);
```

**Insérer des données** dans `server/database/schema.sql` :

```sql
INSERT INTO item (title, user_id) VALUES
  ('Sample Item 1', 1),
  ('Sample Item 2', 2);
```

**Synchroniser la BDD avec le schema** :

```sh
npm run db:migrate
```

### Remplir les lieux utiles de la carte

La carte affiche des lieux utiles (pompiers, vétérinaires, hôpitaux, pharmacies, police)
stockés dans la table `useful_place`. Ni `db:migrate` ni `db:seed` ne la remplissent : elle
se remplit **à la main** depuis OpenStreetMap (API Overpass), avec le script `sync:places`.

À faire une première fois, puis à chaque `npm run db:migrate` (la migration vide la base,
`useful_place` comprise) :

```sh
# toutes les catégories
npm run sync:places --workspace=server

# seulement certaines catégories
npm run sync:places --workspace=server -- fire_station veterinary
```

Catégories : `fire_station`, `veterinary`, `hospital`, `pharmacy`, `police`.

- Le serveur de la base doit tourner et le `.env` de `server` être rempli. Une connexion à
  Internet est nécessaire.
- L'API Overpass est publique et parfois indisponible ou surchargée : le script réessaie une
  fois par catégorie, et une catégorie en échec n'empêche pas les suivantes. En fin de
  script, il liste les catégories en échec et affiche la commande pour les relancer seules.
- Le script peut être relancé sans risque : les lieux sont mis à jour, pas dupliqués, et
  ceux qui ont disparu d'OpenStreetMap sont retirés (sauf si plus de la moitié d'une
  catégorie serait supprimée : le script refuse alors la suppression).
- Vérifier le résultat :

  ```sql
  SELECT category, COUNT(*) FROM useful_place GROUP BY category;
  ```

### Simuler une progression de badges

Pour voir la page « Mes badges » sans passer des heures à créer des signalements, le script
`simulate:badges` ajoute de l'activité fictive à un utilisateur existant (développement
uniquement : le script refuse de tourner en production).

```sh
# depuis /server : ajoute l'activité fictive (relançable, repart du même état)
npm run simulate:badges -- <pseudo>

# retire l'activité fictive, les badges et tous les votes de l'utilisateur
npm run simulate:badges -- <pseudo> reset
```

- L'activité fictive est repérable : signalements et commentaires portent le contenu
  `badge-test`.
- Les badges atteints ne sont attribués qu'à la **connexion** : après le script, il faut se
  reconnecter. Le script affiche la progression de chaque badge.
- `reset` supprime **tous** les votes de l'utilisateur, y compris les vrais, et ses badges.

### Activer la connexion Google

Le bouton « Continuer avec Google » (pages de connexion et d'inscription) a besoin de
3 variables dans le `.env` de `server`. Sans elles, le bouton redirige vers Google, qui
refuse la connexion.

```sh
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3310/api/auth/google/callback
```

- **Les valeurs** : elles viennent du projet « Vigie » de la console Google Cloud. Les
  demander à Julien en **message privé**. Le secret ne doit jamais être commité ni posté
  dans un canal de groupe.
- **Compte de test** : tant que l'application est en mode test chez Google, seuls les
  comptes ajoutés comme *utilisateurs test* peuvent se connecter. Toute l'équipe y est
  ajoutée ; pour un nouveau compte, demander à Julien.
- **Base de données** : la connexion Google utilise la table `oauth_account`. Après avoir
  récupéré la branche, relancer `npm run db:migrate` puis `npm run db:seed`.
- **En production** : l'adresse de retour devient
  `https://<domaine>/api/auth/google/callback`. Elle doit être ajoutée aux *URI de
  redirection autorisés* du client OAuth dans la console Google, et reportée dans
  `GOOGLE_REDIRECT_URI`. `CLIENT_URL` doit pointer vers l'adresse publique du front :
  c'est là que le serveur renvoie l'utilisateur après Google.

### Activer les notifications push

Les notifications push (alerte sur l'appareil même navigateur fermé) ont besoin de 3 variables
dans le `.env` de `server`. Sans elles, le push est simplement désactivé : le centre de
notifications et les e-mails continuent de fonctionner.

```sh
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:vous@exemple.fr
```

- **Générer une paire de clés** (depuis `/server`) : `npx web-push generate-vapid-keys`.
  Chacun peut générer la sienne pour son poste. `VAPID_SUBJECT` est un contact (`mailto:…`
  ou une URL `https://…`) transmis aux services de push (Google, Mozilla, Apple) : mettre une
  vraie adresse, Apple rejette les valeurs bidon.
- **Au démarrage du serveur**, le journal indique `Web Push activé`, ou `Web Push désactivé`
  avec la raison (variable manquante, clé invalide, clé publique qui ne correspond pas à la
  clé privée).
- **Tester en local** : le service worker n'est enregistré qu'en production, donc pas avec
  `npm run dev`. Faire `npm run build --workspace=client` (**pas** `npm run build` à la
  racine : il lance aussi `db:migrate`, qui efface la base), puis `npm run start`, et ouvrir
  `http://localhost:3310`. Le navigateur autorise le push sur `localhost` (Chrome, Firefox de
  bureau), sans HTTPS. Sur iPhone il faut le site en HTTPS **et** ajouté à l'écran d'accueil (iOS 16.4
  minimum).
- **Envoyer un push de test** (depuis `/server`) : `npm run push:test -- <pseudo> [incident|danger|resolved|comment|mention] [ville]`.
  Envoie à tous les appareils enregistrés de l'utilisateur le contenu réel du cas choisi, et
  indique le résultat par appareil. Le lien ouvre le dernier incident de la base. Sur Chrome et
  Firefox, rien ne s'affiche si une fenêtre de Vigie est visible : passer sur un autre onglet
  avant d'envoyer.
- **En production** : générer **une seule paire** et la conserver en lieu sûr. **Ne jamais la
  régénérer** : un abonnement est lié à la clé publique avec laquelle il a été créé, changer
  de clé rend tous les abonnements inutilisables (chaque utilisateur devrait se réabonner).
  `VAPID_SUBJECT` y est l'URL `https://` du site. Les 3 variables s'ajoutent comme les
  [variables d'environnement spécifiques](#variables-denvironnement-spécifiques), et il faut
  prévenir le formateur. Après le déploiement, vérifier la ligne `Web Push activé` dans les
  [logs](#logs).
- **Désactiver l'appareil courant** : depuis « Mon profil », réglage « Alertes sur cet
  appareil ». Un appareil devenu injoignable est retiré automatiquement au premier envoi
  refusé par le service de push (réponse 404 ou 410).

### Développer la partie back-end

**Créer une route** dans `server/app/router.ts` :

```typescript
// ...

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define item-related routes
import itemActions from "./modules/item/itemActions";

router.get("/api/items", itemActions.browse);

/* ************************************************************************* */

// ...
```

**Définir une action** dans `server/app/modules/item/itemActions.ts` :

```typescript
import type { RequestHandler } from "express";

import itemRepository from "./itemRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const items = await itemRepository.readAll();

    res.json(items);
  } catch (err) {
    next(err);
  }
};

export default { browse };
```

**Accéder aux données** dans `server/app/modules/item/itemRepository.ts` :

```typescript
import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

interface Item {
  id: number;
  title: string;
  user_id: number;
}

class ItemRepository {
  async readAll() {
    const [rows] = await databaseClient.query<Rows>("select * from item");

    return rows as Item[];
  }
}

export default new ItemRepository();
```

**Ajouter un middleware** 

```typescript
// ...

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define item-related routes
import itemActions from "./modules/item/itemActions";

const foo: RequestHandler = (req, res, next) => {
  req.message = "hello middleware";

  next();
}

router.get("/api/items", foo, itemActions.browse);

/* ************************************************************************* */

// ...
```

`req.message` sera disponible dans `itemActions.browse`.

⚠️ La propriété `message` doit être ajoutée dans `src/types/express/index.d.ts` :

```diff
// to make the file a module and avoid the TypeScript error
export type {};

declare global {
  namespace Express {
    export interface Request {
      /* ************************************************************************* */
      // Add your custom properties here, for example:
      //
      // user?: { ... };
      /* ************************************************************************* */
+      message: string;
    }
  }
}
```

### REST

| Opération | Méthode | Chemin d'URL | Corps de la requête | SQL    | Réponse (Succès)               | Réponse (Erreur)                                                       |
|-----------|---------|--------------|---------------------|--------|--------------------------------|------------------------------------------------------------------------|
| Browse    | GET     | /items       |                     | SELECT | 200 (OK), liste des items.     |                                                                        |
| Read      | GET     | /items/:id   |                     | SELECT | 200 (OK), un item.             | 404 (Not Found), si id invalide.                                       |
| Add       | POST    | /items       | Données de l'item   | INSERT | 201 (Created), id d'insertion. | 400 (Bad Request), si corps invalide.                                  |
| Edit      | PUT     | /items/:id   | Données de l'item   | UPDATE | 204 (No Content).              | 400 (Bad Request), si corps invalide. 404 (Not Found), si id invalide. |
| Destroy   | DELETE  | /items/:id   |                     | DELETE | 204 (No Content).              | 404 (Not Found), si id invalide.                                       |

### Autres Bonnes Pratiques

- **Sécurité** :
  - Validez et échappez toujours les entrées des utilisateurs.
  - Utilisez HTTPS pour toutes les communications réseau.
  - Stockez les mots de passe de manière sécurisée en utilisant des hash forts (ex : argon2).
  - Revoyez et mettez à jour régulièrement les dépendances.

- **Code** :
  - Suivez les principes SOLID pour une architecture de code propre et maintenable.
  - Utilisez TypeScript pour bénéficier de la vérification statique des types.
  - Adoptez un style de codage cohérent avec Biome.
  - Écrivez des tests pour toutes les fonctionnalités critiques.

## FAQ

### Installation avec Docker
> ⚠️ Prérequis : Vous devez avoir installé Docker et Docker Compose sur votre machine.  
> Suivez les instructions ici : [Docker Installation](https://docs.docker.com/get-docker/).

Lorsque Docker est installé et démarré, exécutez la commande suivante pour construire l'image Docker et démarrer les conteneurs :
```bash
docker compose up -d --build
```
La partie _client_ de l'application sera accessible à l'adresse http://localhost:3000 et la partie _serveur_ à l'adresse http://localhost:3310.  
Pour arrêter et supprimer les conteneurs, exécutez :
```bash
docker compose down
```

#### Mode développement
Les dépendances (du dossier `node_modules`) sont installées dans le conteneur Docker et ne seront pas visibles directement. Si vous utilisez un IDE comme VSCode et que vous souhaitez modifier des fichiers de votre application, vous devez installer les dépendances localement pour prévenir toute erreur de fichiers manquants.  
```bash
npm install
```

#### Installation de nouvelles dépendances
Pour installer de nouvelles dépendances, procédez en local comme d'habitude avec `npm install <package-name>`, puis, synchronisez les dépendances dans le conteneur Docker avec la commande suivante :
```bash
docker compose exec web sh -c "npm install"
```

#### Accéder à la base de données
Pour vous connecter à la base de données avec votre terminal, exécutez la commande suivante :
```bash
docker compose exec database sh -c "mysql -uuser -ppassword js_template_fullstack"
```

### Déploiement avec Traefik

> ⚠️ Prérequis : Vous devez avoir installé et configuré Traefik sur votre VPS au préalable. Suivez les instructions ici : [VPS Traefik Starter Kit](https://github.com/WildCodeSchool/vps-traefik-starter-kit/).

Pour le déploiement, ajoutez les secrets suivants dans la section `secrets` → `actions` du dépôt GitHub :

- `SSH_HOST` : Adresse IP de votre VPS
- `SSH_USER` : Identifiant SSH pour votre VPS
- `SSH_PASSWORD` : Mot de passe de connexion SSH pour votre VPS

Et une variable publique dans `/settings/variables/actions` :

- `PROJECT_NAME` : Le nom du projet utilisé pour créer le sous-domaine.

> ⚠️ Avertissement : Les underscores ne sont pas autorisés car ils peuvent causer des problèmes avec le certificat Let's Encrypt.

L'URL de votre projet sera `https://${PROJECT-NAME}.${subdomain}.wilders.dev/`.

### Variables d'environnement spécifiques

Les étudiants doivent utiliser le modèle fourni dans le fichier `*.env.sample*` en suivant la convention `<PROJECT_NAME><SPECIFIC_NAME>=<THE_VARIABLE>`.

> ⚠️ **Avertissement:** Le `PROJECT_NAME` doit correspondre à celui utilisé dans la variable publique Git.

Pour l'ajouter lors du déploiement, suivez ces deux étapes :

1. Ajoutez la variable correspondante dans le fichier `docker-compose.prod.yml` (comme montré dans l'exemple : `PROJECT_NAME_SPECIFIC_NAME: ${PROJECT_NAME_SPECIFIC_NAME}`).
2. Connectez-vous à votre serveur via SSH. Ouvrez le fichier `.env` global dans Traefik (`nano ./traefik/data/.env`). Ajoutez la variable avec la valeur correcte et sauvegardez le fichier.

Après cela, vous pouvez lancer le déploiement automatique. Docker ne sera pas rafraîchi pendant ce processus.

### Logs

Pour accéder aux logs de votre projet en ligne (pour suivre le déploiement ou surveiller les erreurs), connectez-vous à votre VPS (`ssh user@host`). Ensuite, allez dans votre projet spécifique et exécutez `docker compose logs -t -f`.

### Contribution

Nous accueillons avec plaisir les contributions ! Veuillez suivre ces étapes pour contribuer :

1. **Fork** le dépôt.
2. **Clone** votre fork sur votre machine locale.
3. Créez une nouvelle branche pour votre fonctionnalité ou bug fix (`git switch -c feature/your-feature-name`).
4. **Commit** vos modifications (`git commit -m 'Add some feature'`).
5. **Push** vers votre branche (`git push origin feature/your-feature-name`).
6. Créez une **Pull Request** sur le dépôt principal.

**Guide de Contribution** :

- Assurez-vous que votre code respecte les standards de codage en exécutant `npm run check` avant de pousser vos modifications.
- Ajoutez des tests pour toute nouvelle fonctionnalité ou correction de bug.
- Documentez clairement vos modifications dans la description de la pull request.
