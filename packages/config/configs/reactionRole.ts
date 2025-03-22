export const reactionRoleConfig = {
    channels: {
        //! ➤ willkommen - Channel
        "980255114189234236": {
            // Regeln Akzeptiert
            "1102549886844543027": [
                {
                    ids: ["605274288869736470"], // @Regeln Akzeptiert
                    emoji: "<:moderatorbadge:1098279112948326590>",
                },
            ],
        },

        //! ➤ Rollen bekommen - Channel
        "605272156653223966": {
            // Bist du über oder unter 18:
            "1101252391657017384": [
                {
                    ids: ["611622998121644043"], // @-18
                    emoji: "<:left:992801521324527698>",
                },
                {
                    ids: ["611621276590800925"], // @+18
                    emoji: "<:right:992801519944609813>",
                },
            ],

            // Darf man dir privat Nachrichten schicken:
            "1101249129390289004": [
                {
                    ids: ["605341627913076746"], // @ja
                    emoji: "0️⃣",
                },
                {
                    ids: ["605342184354349056"], // @nein
                    emoji: "1️⃣",
                },
            ],

            // Extra Rollen:
            "1102548013865504889": [
                {
                    ids: ["1008450618026885150"], // @Forum
                    emoji: "<:thread:1098279507397464104>",
                },
                {
                    ids: ["612906852853874688"], // @Zitate
                    emoji: "✍",
                },
                {
                    ids: ["1102537972382978058"], // @Updates
                    emoji: "<:stagechannel:1098279508735426571>",
                },
            ],

            // Name Color:
            "1102551417543208990": [
                {
                    ids: ["611623538608308235"], // @Gelb
                    emoji: "0️⃣",
                },
                {
                    ids: ["608751464478801962"], // @Grün-Gelb
                    emoji: "1️⃣",
                },
                {
                    ids: ["720055734305554503"], // @Grün
                    emoji: "2️⃣",
                },
                {
                    ids: ["767847208128741407"], // @Mint-Grün
                    emoji: "3️⃣",
                },
                {
                    ids: ["767847607866753064"], // @Türkis
                    emoji: "4️⃣",
                },
                {
                    ids: ["718525185459748947"], // @Hellblau
                    emoji: "5️⃣",
                },
                {
                    ids: ["608750703216820445"], // @Blau
                    emoji: "6️⃣",
                },
                {
                    ids: ["616416678733021215"], // @Violett
                    emoji: "7️⃣",
                },
                {
                    ids: ["610238169291423754"], // @Pink
                    emoji: "8️⃣",
                },
                {
                    ids: ["623989736729739275"], // @Magenta
                    emoji: "9️⃣",
                },
                {
                    ids: ["779844349592731718"], // @Rot
                    emoji: "🔟",
                },
            ],
        },

        //! ➤ NEUE REACTIONS ROLLEN FÜR DEN 104TH SERVER
        "1346258156388614226": { // Server ID
            "1350938975744823351": [ // Nachricht ID
                {
                    ids: ["1346261278045372486", "1346606055614058596"], // @104th Soldat & @Cadet
                    emoji: "🐺",
                    exclusive: true
                },
                {
                    ids: ["1350551605291909151"], // @Zivilist
                    emoji: "🪽",
                    exclusive: true
                },
            ],
        },
    },
};
