# @minute-bot/sdk

Le contrat public pour écrire un plugin [Minute Bot](https://github.com/AlexisTak/minute_bot) :
la classe `Plugin`, le `PluginContext` transmis à ses hooks, et le schéma du manifeste
`plugin.json`.

## Installation

```bash
npm install @minute-bot/sdk discord.js
```

`discord.js` est une dépendance paire (`peerDependency`) — installez-la vous-même, ce SDK ne
choisit pas la version à votre place.

## Écrire un plugin

```typescript
import { Plugin, type PluginContext } from '@minute-bot/sdk';

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
| `discord` | permission `discord` | Envoyer des messages, gérer des rôles, modérer |
| `http` | permission `network` | Client HTTP avec timeout |
| `routes` | permission `http-server` | Déclaré, pas encore implémenté côté bot |
| `database` | permission `database` | Déclaré, pas encore implémenté côté bot |

Chaque membre soumis à permission n'est exposé que si le manifeste du plugin déclare la
permission correspondante — y accéder sans l'avoir déclarée est une erreur au runtime, côté bot.

## Cycle de vie

`onLoad?(context)` (optionnel) → `onEnable(context)` (obligatoire, où l'on enregistre commandes et
événements) → ... → `onDisable?()` (optionnel, pour un nettoyage que le bot ne fait pas déjà tout
seul).

## Licence

MIT — voir [`LICENSE`](LICENSE).
