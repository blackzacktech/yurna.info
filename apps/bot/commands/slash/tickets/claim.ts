import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-claim')
    .setDescription('Beansprucht ein Ticket für dich'),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    // Ticket-Manager-Instanz aus dem Client holen
    const ticketManager = client['tickets'];
    
    if (!ticketManager) {
      await interaction.reply({
        content: 'Das Ticket-System ist derzeit nicht verfügbar.',
        ephemeral: true,
      });
      return;
    }

    try {
      // Die claim-Funktion des TicketManagers aufrufen
      await ticketManager.claim(interaction);
    } catch (error) {
      console.error('Fehler beim Beanspruchen des Tickets:', error);
      await interaction.reply({
        content: 'Beim Beanspruchen des Tickets ist ein Fehler aufgetreten.',
        ephemeral: true,
      });
    }
  }
};
