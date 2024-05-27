//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

export async function messageReactionAdd(client, reaction, user) {
 if (user.bot) return;

 // Fetch vollständige Objekte, falls sie teilweise sind
 if (reaction.partial) await reaction.fetch();
 if (reaction.message.partial) await reaction.message.fetch();

 // Vermeidung von Reaktionen auf Nachrichten in Direktnachrichten
 if (!reaction.message.guild) return;

 const channelConfig = client.config.channels[reaction.message.channel.id];
 if (channelConfig && channelConfig[reaction.message.id]) {
  const roleConfig = channelConfig[reaction.message.id].find((role) => role.emoji === reaction.emoji.toString() || (role.emoji.includes(":") && role.emoji.split(":")[2].slice(0, -1) === reaction.emoji.id));

  if (roleConfig) {
   const role = reaction.message.guild.roles.cache.get(roleConfig.id);
   if (!role) {
    console.error(`Role not found for ID: ${roleConfig.id}`);
    return; // Sicherstellen, dass die Rolle existiert
   }

   const member = reaction.message.guild.members.cache.get(user.id);
   if (!member) {
    console.error(`Member not found for ID: ${user.id}`);
    return; // Sicherstellen, dass das Mitglied existiert
   }

   member.roles.add(role).catch((error) => console.error(`Error adding role: ${error}`));
  }
 }
}

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
