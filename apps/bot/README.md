![Header](/docs/assets/Yurna_Banner.png?raw=true)

<p align="center">
 <a href="https://yurna.info/server"><img src="https://img.shields.io/discord/605270655058968576?color=%234552ef&logo=discord&label=Discord&style=flat&logoColor=fff" alt="Discord" /></a>
 <a href="https://www.npmjs.com/package/discord.js"><img src="https://img.shields.io/badge/Discord.js-v14-%234552ef?style=flat&logo=npm&logoColor=fff" alt="Discord.js" /></a>
 <a href="https://yurna.info/"><img src="https://img.shields.io/github/actions/workflow/status/blackzacktech/yurna.info/codeql-analysis.yml?branch=master&style=flat&label=CodeQL&logo=github&color=%234552ef" alt="CodeQL Checks" /></a>
 <a href="https://yurna.info"><img src="https://img.shields.io/github/license/blackzacktech/yurna.info?style=flat&;logo=github&label=License&color=%234552ef" alt="GitHub License" /></a>
</p>

## 🤖 Self-Hosting

1. Clone [this repository](https://github.com/blackzacktech/yurna.info) `git clone https://github.com/blackzacktech/yurna.info.git`
2. Go to `/packages/database/` directory and follow [Database Setup](/packages/database/README.md) tutorial
3. Grab a Discord Bot token and client secret on [Discord's developer portal](https://discord.com/developers/applications) [Tutorial](#-discord-credentials)
4. Create new file or edit existing `.env` file in root directory of the project
5. In `.env` file set this values:
   - `TOKEN` - Discord bot token [[Tutorial](#-discord-token)]
   - `SECRET` - Random string (min. length = 32 chars)
   - `CLIENT_SECRET` - Discord bot secret [[Tutorial](#-discord-secret)]
   - Database URLs [[Tutorial](/packages/database/README.md)]
     - `DATABASE_URL` - Main database URL
     - `DIRECT_URL` - Direct database URL (optional)
6. Run `pnpm i` to install all dependencies
7. Go to `/packages/config/` directory and change values in `/configs/bot.js` to your values
8. Go back to main directory and run `pnpm run dev --filter=bot` or `pnpm run deploy --filter=bot` to start bot
9. That's it! You can now invite your bot to your server and use it!

## 🔒 Example `.env` file

```
TOKEN=DISCORD_BOT_TOKEN
SECRET=SECRET_STRING
CLIENT_SECRET=DISCORD_BOT_SECRET

# ... Database credentials
```

> [!WARNING]
> This file should be in **root directory** of the project. This file is **super secret**, better to not share it!

---

## ⚙️ System Requirements

Ensure your setup meets these prerequisites before setting up yurna.info:

- `PostgreSQL 14x` or higher
- `Node.js 18x` or higher
- `(Any)` Linux x64¹
- `~512MB` of RAM (minimum)
- `~3GB` of hard drive space (minimum)

> [!NOTE]
> 1: Debian based distros are recommended, Dashboard can also run on Windows and MacOS but it's not recommended.

## 🔓 Tokens tutorials

### 🔏 Discord Token

1. Go to <a href="https://discordapp.com/developers/applications)">Discord Developer Portal</a>
2. At the top right of the screen, click "New application" and assign it a name. Next in the left part of the screen on the navigation bar, find "Bot" then click it and find button named "Add Bot"
3. After confirming the bot creation, click the "Copy token" button
4. Paste your token in `.env` file - `TOKEN=BOT_TOKEN`

### 🔓 Discord Bot Secret

1. Go to <a href="https://discordapp.com/developers/applications)">Discord Developer Portal</a>
2. In the left part of the screen on the bar, find "OAuth2" then click it
3. Find section named "Client Secret", under the bot secret click "Copy" button
4. Paste client secret to `.env` - `CLIENT_SECRET=CLIENT_SECRET`

## 📝 Contributors

- [**@blackzacktech**](https://github.com/blackzacktech) - Hosting support and it´s me. -hehe-

## ⁉️ Issues

If you have any issues with the bot please create [new issue here](https://github.com/blackzacktech/yurna.info/issues).
When creating new issue please provide as much information as possible. If you can, please provide logs from console.

## 📥 Pull Requests

When submitting a pull request:

- Clone the repo.
- Create a branch off of `master` and give it a meaningful name (e.g. `my-awesome-new-feature`).
- Open a [pull request](https://github.com/blackzacktech/yurna.info/pulls) on [GitHub](https://github.com) and describe the feature or fix.

We will review your pull request as soon as possible. We might suggest some changes or improvements.

## 📋 License

This project is licensed under the MIT. See the [LICENSE](https://github.com/blackzacktech/yurna.info/blob/master/license.md) file for details
