module.exports = {
    apps: [
      {
        name: "yurna",
        command: "pnpm run deploy", // Passe den Pfad zu deiner Bot-Datei an
        env: {
          NODE_ENV: "production",
          PORT: 3008
        },
        watch: true, // Aktiviert automatisches Neustarten bei Dateiänderungen
        autorestart: true, // Bei Absturz automatisch neustarten
        restart_delay: 5000, // 5 Sekunden Pause zwischen Neustarts bei Fehlern
      }
    ]
  }
  