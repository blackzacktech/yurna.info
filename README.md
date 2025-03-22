![Header](./docs/assets/Yurna_Banner.png)

<p align="center">
 <a href="https://yurna.info/server"><img src="https://img.shields.io/discord/695282860399001640?color=%234552ef&logo=discord&label=Discord&style=flat&logoColor=fff" alt="Discord" /></a>
 <a href="https://www.npmjs.com/package/discord.js"><img src="https://img.shields.io/badge/Discord.js-v14-%234552ef?style=flat&logo=npm&logoColor=fff" alt="Discord.js" /></a>
 <a href="https://yurna.info/"><img src="https://img.shields.io/github/actions/workflow/status/igorkowalczyk/majo.exe/codeql-analysis.yml?branch=master&style=flat&label=CodeQL&logo=github&color=%234552ef" alt="CodeQL Checks" /></a>
 <a href="https://yurna.info"><img src="https://img.shields.io/github/license/igorkowalczyk/majo.exe?style=flat&;logo=github&label=License&color=%234552ef" alt="GitHub License" /></a>
</p>

## ✨ Features

- ⚙️ **Fully Customizable:** Tailor Yurna.info to your preferences with comprehensive customization options.
- 🌆 **Built-in Dashboard:** Manage your Yurna.info settings effortlessly through our intuitive dashboard.
- 📝 **Easy Configuration:** Streamlined configuration process that makes setting up a breeze.
- 💯 **150+ Commands:** Access over 150 versatile commands to enrich your server's experience.
- 📚 **Easy Hosting:** Effortlessly host Yurna.info on your servers and keep it online 24/7.

## 🔗 Invite

Go to [this link](https://discord.com/oauth2/authorize/?permissions=4294967287&scope=bot%20applications.commands&client_id=980509844962422804) and add the bot (this requires `MANAGE_GUILD` permission) to your server.

[Or to make it easier, visit our website](https://yurna.info/)

## 🖥️ Hosting

We are hosting Yurna.info on our own servers. Yurna.info will be online 24/7. [Invite Yurna here!](https://yurna.info/api/invite)  
However, if you want to host Yurna.info yourself, you can do it. [Check out our tutorials](#-tutorials) to learn how to do it.

<!-- prettier-ignore-start -->
> [!IMPORTANT]
> **This project is not for beginners.** If you are not familiar with Node.js, Prisma, Discord.js or any other technology used in this project, you should not host Yurna.info yourself!
<!-- prettier-ignore-end -->

### 📝 Tutorials

- **[🤖 Bot setup tutorial](/apps/bot/README.md)**
- **[🔩 Dashboard setup tutorial](/apps/dashboard/README.md)**
- **[📝 Database setup tutorial](/packages/database/README.md)**

## ⚙️ System Requirements

Ensure your setup meets these prerequisites before setting up Yurna.info:

- `PostgreSQL 14x` or higher
- `Node.js 18x` or higher
- `(Any)` Linux x64¹
- `~512MB` of RAM (minimum)
- `~3GB` of hard drive space (minimum)

<!-- prettier-ignore-start -->
> [!NOTE]
> 1. Debian based distros are recommended, bot can also run on Windows and MacOS but it's not recommended.
<!-- prettier-ignore-end -->

## 🔒 Global `.env` file

| Variable                    | Description                                              | Required (Bot) | Required (Dashboard) |
| --------------------------- | -------------------------------------------------------- | -------------- | -------------------- |
| `TOKEN`                     | Discord bot token                                        | `✅ Yes`       | `✅ Yes`             |
| `CLIENT_ID`                 | Discord client ID                                        | `✅ Yes`       | `✅ Yes`             |
| `CLIENT_SECRET`             | Discord client secret                                    | `❌ No`        | `✅ Yes`             |
| `DATABASE_URL`              | Main database connection string                          | `✅ Yes`       | `✅ Yes`             |
| `DATABASE_URL_UNPOOLED`     | Non-pooling database connection string                   | `❌ No`        | `❌ No`              |
| `REDIS_URL`                 | Redis Cache connection string                            | `✅ Yes`       | `✅ Yes`             |
| `SECRET`                    | Secret string (minimum 32 characters)                    | `❌ No`        | `✅ Yes`             |
| `NEXTAUTH_URL`              | NextAuth.js URL (e.g., http://localhost:3000)            | `❌ No`        | `✅ Yes`             |
| `NEXT_PUBLIC_URL`           | Next.js public URL (e.g., http://localhost:3000)         | `❌ No`¹       | `✅ Yes`             |
| `HOTJAR_ID`                 | [Hotjar](https://hotjar.com) ID                          | `❌ No`        | `❌ No`              |
| `DISCORD_SUPPORT_SERVER_ID` | Discord support server ID                                | `❌ No`        | `❌ No`²             |
| `TOPGG_API_KEY`             | [top.gg](https://top.gg) API key                         | `❌ No`        | `❌ No`³             |
| `DISCORD_BOT_LIST_API_KEY`  | [discordbotlist.com](https://discordbotlist.com) API key | `❌ No`        | `❌ No`⁴             |

<!-- prettier-ignore-start -->
> [!NOTE]
> 1. `NEXT_PUBLIC_URL` is required only if you want to also host the dashboard.
> 2. `DISCORD_SUPPORT_SERVER_ID` is required only if you want to automatically add users to your own Discord server when they log in to the dashboard. Please note that the bot needs `Manage Server` permission in the server!\
> 3. `TOPGG_API_KEY` is required only if you want to automatically post server count to [top.gg](https://top.gg).
> 4. `DISCORD_BOT_LIST_API_KEY` is required only if you want to automatically post server count, stats and more to [discordbotlist.com](https://discordbotlist.com).

<!-- prettier-ignore-end -->

> [!WARNING]
> There is one global `.env` file for all projects. **Do not create `.env` file in `apps/bot`, `packages/database` or `apps/dashboard` folders!** **This can cause problems and potential security issues.**

## 📝 Contributors

- [**@blackzacktech**](https://github.com/blackzacktech) - Hosting support and it´s me. -hehe-


## ⛔ Hosting Agreement

**By hosting the project, you agree to the following terms:**

1. 📜 **Attribution:**

   - **You are not allowed to claim authorship** or affiliation with the Yurna.info team.
   - **Proper credit must be given** to the original author when hosting the project.
   - **You are not allowed to use the Yurna.info name or logo** in any way that implies affiliation with the Yurna.info team.

2. 💻 **Hosting Rights:**

   - The bot can be hosted on your server, **provided the terms outlined here are respected**.

3. 🚧 **Modifications:**

   - The footer in the Dashboard, such as "Powered by Yurna.info," **must not be modified or removed**.
   - The `/about` command **must not be modified or removed**. This command contains information about the project and its authors.
   - The project's source code **must not be modified in any way that would remove or alter the original attribution**.
   - **The license must be included with any public distribution** of the project or its modified source code.

4. 📦 **Distribution:**

   - **You may not distribute the bot or its modified versions without adhering to the terms** mentioned in this agreement.
   - **Any public release or distribution must include clear attribution** to the original author and a link to the original repository or source.

5. ⚖️ **Compliance:**
   - Failure to comply with these terms may result in a violation of the agreement.
   - **Legal action may be taken** if these terms are not respected.

## ⁉️ Issues

If you have any issues with the page please create [new issue here](https://github.com/blackzacktech/yurna.info/issues). When creating new issue please provide as much information as possible. If you can, please provide logs from console.

We will review your pull request as soon as possible. We might suggest some changes or improvements.

## 📥 Pull Requests

When submitting a pull request:

- Clone the repository (`git clone https://github.com/blackzacktech/yurna.info`)
- Create a branch off of `master` and give it a meaningful name (e.g. `my-awesome-new-feature`).
- Open a [pull request](https://github.com/blackzacktech/yurna.info/pulls) on [GitHub](https://github.com) and describe the feature or fix.

## 📋 License

This project is licensed under the MIT. See the [LICENSE](https://github.com/blackzacktech/yurna.info/blob/master/license.md) file for details

<details>
 <summary>The cake is a lie 🍰</summary>

<a href="https://blackzack.dev">No cake hear</a>

</details>
