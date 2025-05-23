/* Dashboard related config */
export const dashboardConfig = {
 title: "Yurna.info", // string. Dashboard title, will be shown in browser tab and in search results
 url: "https://yurna.info", // string. Dashboard url, to Disable dashboard, set this to null (Note: when you change it to null the dashboard will not work and commands related to dashboard will not work)
 logo: "/assets/avatar.png", // string. Logo of your bot
 description: "Yurna.info - Discord bot for Fun, Memes, Images, Giveaway, Economy and Anime! Yurna.info serve over 117 commands!", // string. Dashboard description, will be shown in search results
 image: "/opengraph-image", // string. Dashboard open graph image (Note: this is not a url, this is a path to the image/generator, for example: /opengraph-image)
};

// Dashboard redirects
export const dashboardRedirects = [
 {
  source: "/discord",
  destination: "https://discord.gg/PXSCVCwU4f",
  permanent: true,
 },
 {
  source: "/invite",
  destination: "/api/invite",
  permanent: true,
 },
 {
  source: "/support",
  destination: "/discord",
  permanent: true,
 },
 {
  source: "/contact",
  destination: "https://blackzack.dev/contact",
  permanent: true,
 },
 {
  source: "/server",
  destination: "/discord",
  permanent: true,
 },
 {
  source: "/status",
  destination: "http://comming.soon",
  permanent: true,
 },
];

// Dashboard headers
export const dashboardHeaders = [
 {
  source: "/(.*)",
  headers: [
   {
    key: "Referrer-Policy",
    value: "no-referrer",
   },
   {
    key: "X-Content-Type-Options",
    value: "nosniff",
   },
   {
    key: "X-DNS-Prefetch-Control",
    value: "on",
   },
   {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
   },
   {
    key: "X-XSS-Protection",
    value: "1; mode=block",
   },
   {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
   },
  ],
 },
];
