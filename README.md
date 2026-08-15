# @la_minute_code/sdk

Le contrat public pour écrire un plugin [Minute Bot](https://github.com/AlexisTak/minute_bot) :
la classe `Plugin`, le `PluginContext` transmis à ses hooks, et le schéma du manifeste
`plugin.json`.

> **Statut : pré-1.0.** Tant que la version majeure est `0`, une rupture de compatibilité
> incrémente la version mineure (voir [`CHANGELOG.md`](CHANGELOG.md)) — `0.2.0` a par exemple cassé
> le contrat de `0.1.x`. Épinglez une version mineure exacte (`~0.2.0`, pas `^0.2.0`) tant que le
> paquet n'a pas atteint `1.0.0`.

## Installation

```bash
npm install @la_minute_code/sdk@~0.2.0 discord.js
```

`discord.js` est une dépendance paire (`peerDependency`) — installez-la vous-même, ce SDK ne
choisit pas la version à votre place.

## Écrire un plugin

```typescript
import { Plugin, type PluginContext } from '@la_minute_code/sdk';

export default class HelloPlugin extends Plugin {
  readonly name = 'hello-plugin';

  async onEnable(context: PluginContext): Promise<void> {
    context.commands.register({
      name: 'hello',
      description: 'Répond bonjour',
      execute(invocation) {
        return invocation.reply('Bonjour !');
      },
    });
  }
}
```

Chaque plugin a besoin d'un manifeste `plugin.json` à côté de son code — voir `parseManifest` et
`manifestSchema`, exportés par ce package, pour son schéma exact (validé avec
[Zod](https://zod.dev)).

## `PluginContext`

Transmis à `onEnable` (et `onLoad`, s'il est défini) :

| Membre | Toujours disponible | Rôle |
|---|---|---|
| `logger` | oui | Logger scopé au plugin |
| `config` | oui | Configuration persistée, isolée par plugin |
| `cache` | oui | Cache en mémoire, recréé à chaque activation |
| `commands` | permission `commands` | Enregistrer des commandes slash |
| `events` | permission `events` | S'abonner aux événements du bot |
| `tasks` | permission `tasks` | Planifier des tâches récurrentes |
| `discord.read` | permission `discord:read` | Lire guildes, membres, salons |
| `discord.send` | permission `discord:send` | Envoyer des messages et des embeds |
| `discord.roles` | permission `discord:roles` | Ajouter/retirer des rôles |
| `discord.moderate` | permission `discord:moderate` | Expulser, bannir |
| `http` | permission `network` | Client HTTP avec timeout |
| `routes` | permission `http-server` | Déclaré, pas encore implémenté côté bot |
| `database` | permission `database` | Déclaré, pas encore implémenté côté bot |

Chaque membre soumis à permission n'est exposé que si le manifeste du plugin déclare la
permission correspondante — y accéder sans l'avoir déclarée est une erreur au runtime, côté bot.
Les quatre espaces de noms de `discord` sont gouvernés séparément : demander `discord:send`
n'ouvre aucun droit de modération.

Le champ `main` du manifeste doit rester un chemin **relatif** au dossier du plugin, pointant
vers un fichier `.js`/`.ts` : les chemins absolus, les remontées `..` et les URLs sont rejetés à
la validation.

## Cycle de vie

`onLoad?(context)` (optionnel) → `onEnable(context)` (obligatoire, où l'on enregistre commandes et
événements) → ... → `onDisable?()` (optionnel, pour un nettoyage que le bot ne fait pas déjà tout
seul).

## Développement

```bash
pnpm install
pnpm verify
```

`pnpm verify` enchaîne `typecheck`, `test` et `build`. Elle tourne à trois moments : en local
avant chaque push (hook `pre-push` livré dans [`.githooks/`](.githooks/), activé par le script
`prepare` à chaque `pnpm install` — `git push --no-verify` passe outre) ; sur GitHub Actions à
chaque push sur `main` et sur chaque pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), ce qui couvre les contributions
externes que le hook local ne voit jamais ; et comme `prepublishOnly`, donc une publication est
toujours précédée de la suite complète.

La publication, elle, reste automatisée : pousser un tag `v*` déclenche
[`.github/workflows/release.yml`](.github/workflows/release.yml), qui publie sur npm avec
provenance. Publier à la main fonctionne aussi, mais le paquet ne porte alors aucune attestation
de build vérifiable.

## Licence

MIT — voir [`LICENSE`](LICENSE).
