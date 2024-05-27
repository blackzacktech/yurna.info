//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

import { ActivityType, PresenceUpdateStatus } from "discord-api-types/v10";

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

const config = {};

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

config.presence = {
 status: PresenceUpdateStatus.Online, // PresenceUpdateStatus. Can be: "Online", "Idle", "DoNotDisturb", "Invisible" or "Offline" (Invisible and Offline are the same)
 activity: {
  // name: "?", // string. Activity name [not required when using custom type (4)
  state: "🔥 Type /help to get started!", // string. Activity state [required when using custom type (4)]
  type: ActivityType.Custom, // ActivityType. Activity type. Can be: "Playing", "Streaming", "Listening", "Watching", "Custom"

  /* Example: Using type 3 (Watching) with custom name
   name: "the world burn", // Note: Name is required when not using custom type (4)!
   type: ActivityType.Watching,
  */
 },
};

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

/*
  Donation links
 */
config.donate = {
 enabled: true, // boolean. Display donations command
 links: [
  {
   name: "Github Sponsors",
   url: "https://github.com/sponsors/blackzacktech",
   icon: "🔗",
  },
 ],
};

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

/*
  Bot emojis
 */
config.emojis = {
 // You must upload the emojis to the server when the bot is!
 success: "<:majo_yes:963333541112987668>", // https://cdn.discordapp.com/emojis/963333541112987668.png
 error: "<:majo_no:963333541226217472>", // https://cdn.discordapp.com/emojis/963333541226217472.png
 giveaway: "<a:giveaway:963333542442590268>", // https://cdn.discordapp.com/emojis/963333542442590268.gif
 discord_logo: "<:discord_logo:963333540630646804>", // https://cdn.discordapp.com/emojis/963333540630646804.png
 member: "<:members:963333541305925692>", // https://cdn.discordapp.com/emojis/963333541305925692.png
 channel: "<:channel:963333540244758578>", // https://cdn.discordapp.com/emojis/963333540244758578.png
 role: "<:member_role:963333541142339605>", // https://cdn.discordapp.com/emojis/963333541142339605.png
 stage_channel: "<:stage_channel:963333542199324692>", // https://cdn.discordapp.com/emojis/963333542199324692.png
 rules_channel: "<:rules_channel:963333541561790474>", // https://cdn.discordapp.com/emojis/963333541561790474.png
 boosts_animated: "<a:booster:963333480899567646>", // https://cdn.discordapp.com/emojis/963333480899567646.gif
 discord_badges: "<a:badges_roll:963333479129550889>", // https://cdn.discordapp.com/emojis/963333479129550889.gif
 status_online: "<:status_online:963333541888929842>", // https://cdn.discordapp.com/emojis/963333541888929842.png
 status_idle: "<:status_idle:963333541846986782>", // https://cdn.discordapp.com/emojis/963333541846986782.png
 status_dnd: "<:status_dnd:963333541813428235>", // https://cdn.discordapp.com/emojis/844882506587176960.png
 status_offline: "<:status_invisible:963333542383869952>", // https://cdn.discordapp.com/emojis/963333542383869952.png
 cpu_icon: "<:cpu:963333540374781972>", // https://cdn.discordapp.com/emojis/963333540374781972.png
 drive_icon: "<:hard_drive:963333540844564540>", // https://cdn.discordapp.com/emojis/963333540844564540.png
 ram_icon: "<:ram:963333541616304128>", // https://cdn.discordapp.com/emojis/963333541616304128.png
 discord_partner: "<:discord_partner:963333540739694602>", // https://cdn.discordapp.com/emojis/963333540739694602.png
 owner_crown: "<:owner:963333541343686696>", // https://cdn.discordapp.com/emojis/856161806199947285.png
 emoji_bar_1: "<:bar_02:963333479184076810>", // https://cdn.discordapp.com/emojis/963333479184076810.png
 emoji_bar_2: "<:bar_01:963333479322517534>", // https://cdn.discordapp.com/emojis/963333479322517534.png
 bot_badge_part_1: "<:bot_badge_02:963333478982754375>", // https://cdn.discordapp.com/emojis/963333478982754375.png
 bot_badge_part_2: "<:bot_badge_01:963333479301545984>", // https://cdn.discordapp.com/emojis/963333479301545984.png
 pikachu: "<:pikachu:963333541507264512>", // https://cdn.discordapp.com/emojis/963333541507264512.png
 loading: "<a:discord_loading:963333542065090630>", // https://cdn.discordapp.com/emojis/963333542065090630.gif
 hypesquad: "<:hypesquad:963333540962009168>", // https://cdn.discordapp.com/emojis/963333540962009168.png
 hypesquad_balance: "<:hypesquad_balance:963333540546752544>", // https://cdn.discordapp.com/emojis/963333540546752544.png
 hypesquad_bravery: "<:hypesquad_bravery:963333540840353882>", // https://cdn.discordapp.com/emojis/963333540840353882.png
 hypesquad_brilliance: "<:hypesquad_brilliance:963333541104586802>", // https://cdn.discordapp.com/emojis/963333541104586802.png
 verified_bot_developer: "<:developer:963333540429303828>", // https://cdn.discordapp.com/emojis/963333540429303828.png
 early_supporter: "<:early_supporter:963333540844552252>", // https://cdn.discordapp.com/emojis/963333540844552252.png
 bug_hunter_1: "<:bug_hunter:963333479452508190>", // https://cdn.discordapp.com/emojis/963333479452508190.png
 bug_hunter_2: "<:bug_hunter_gold:963333479578357830>", // https://cdn.discordapp.com/emojis/963333479578357830.png
 discord_employee: "<:discord_staff:963333540756455444>", // https://cdn.discordapp.com/emojis/963333540756455444.png
 slash_commands: "<:slash_commands:963333541565968384>", // https://cdn.discordapp.com/emojis/963333541565968384.png
 mention: "<:mention:963333541259792384>", // https://cdn.discordapp.com/emojis/963333541259792384.png
 settings: "<:settings:963333541716963348>", // https://cdn.discordapp.com/emojis/963333541716963348.png

 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 // Categories emoji
 categories: [
  {
   name: "general",
   emoji: "🧱",
  },
  {
   name: "moderation",
   emoji: "🛠️",
  },
  {
   name: "fun",
   emoji: "😆",
  },
  {
   name: "utility",
   emoji: "🔧",
  },
  {
   name: "levels",
   emoji: "📈",
  },
  {
   name: "reputation",
   emoji: "👍",
  },
  {
   name: "image",
   emoji: "🖼️",
  },
  {
   name: "giveaway",
   emoji: "🎉",
  },
  {
   name: "ticket",
   emoji: "🎫",
  },
  {
   name: "reaction",
   emoji: "🎭",
  },
 ],

 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 // Log types
 logs: [
  {
   type: "profanity",
   emoji: "🤬",
  },
  {
   type: "embed_color",
   emoji: "🎨",
  },
  {
   type: "command_change",
   emoji: "<:slash_commands:963333541565968384>",
  },
  {
   type: "category_change",
   emoji: "📂",
  },
  {
   type: "public_dashboard",
   emoji: "🔗",
  },
  {
   type: "vanity",
   emoji: "🔗",
  },
 ],

 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 //? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 // Utility emojis
 picture_frame: "🖼️",
 anger: "💢",
 like: "👍",
 dislike: "👎",
 grin: "😁",
 pleading_face: "🥺",
 angry: "😡",
 rage: "🤬",
 drooling_face: "🤤",
 smirk: "😏",
 game_dice: "🎲",
 coin: "🪙",
 sparkles: "✨",
 earth: "🌎",
 clock: "⏰",
 search_glass: "🔍",
 chan: "🍀",
 edit: "📝",
 chat: "💬",
 sadness: "😢",
 flag_gb: ":flag_gb:",
 flag_jp: ":flag_jp:",
 book: "📚",
 counting: "🔢",
 star2: "🌟",
 calendar_spillar: "🗓️",
 star: "⭐",
 barchart: "📊",
 link: "🔗",
 tada: "🎉",
 brain: "🧠",
 magic_ball: "🔮",
 reverse_motherfucker: "↕️",
 reverse_nr_2_motherfucker: "🔀",
 light_bulb: "💡",
 broken_heart: "💔",
 heart: "❤️",
 flushed: "😳",
 facepalm: "🤦",
 sneeze: "🤧",
 input: "📥",
 output: "📤",
 bird: "🐦",
 cat: "🐱",
 koala: "🐨",
 panda: "🐼",
 wink: "😉",
 wastebasket: "🗑️",
 page: "📄",
 ping: "🏓",
 uptime: "⏳",
 package: "📦",
 optical_disk: "💿",
 muscule: "💪",
 stopwatch: "⏱️",
 octo: "🐙",
 rocket: "🚀",
 thinking: "🤔",
 question: "❔",
 tools: "🧰",
 money: "💰",
 music: "🎶",
 rofl: "😆",
 hammer: "🔨",
 bricks: "🧱",
 screw_that: "🔩",
 sign: "🪧",
 lyrics: "📑",
 pause: "⏸️",
 play: "▶",
 skip: "⏭️",
 volume: "🔉",
 pen: "🖊️",
 capital: "🏛️",
 location: "📍",
 currency: "💱",
 globe: "🌐",
 tongue: "👅",
 clap: "👏",
 lock: "🔐",
 game_controller: "🎮",
 weather: "🌤️",
 temperature: "🌡️",
 hot: "🥵",
 tornado: "🌪️",
 humidity: "💦",
 ruler: "📏",
 email: "📧",
 paper_clip: "📎",
 paper_clips: "🖇️",
 flower: "💮",
 arrows_clockwise: "🔃",
 jigsaw: "🧩",
 wave: "👋",
 color: "🎨",
};

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

export const botConfig = config;

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
