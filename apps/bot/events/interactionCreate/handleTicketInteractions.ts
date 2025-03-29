import { ButtonInteraction, Client, Interaction, ModalSubmitInteraction } from 'discord.js';
import prismaClient from '@yurna/database';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, client: Client) {
    // Nur fortfahren, wenn es sich um eine ButtonInteraction handelt
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    // Ticket-Manager-Instanz aus dem Client holen
    const ticketManager = client['tickets'];
    if (!ticketManager) return;

    try {
      // Button-Interaktionen verarbeiten
      if (interaction.isButton()) {
        await handleButtonInteraction(interaction, ticketManager);
      }

      // Modal-Interaktionen verarbeiten
      if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction, ticketManager);
      }
    } catch (error) {
      console.error('Fehler bei der Ticket-Interaktion:', error);
      
      // Nur antworten, wenn die Interaktion noch nicht beantwortet wurde
      if (interaction.replied || interaction.deferred) return;
      
      await interaction.reply({
        content: 'Bei der Verarbeitung deiner Anfrage ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};

/**
 * Verarbeitet Button-Interaktionen für Tickets
 */
async function handleButtonInteraction(interaction: ButtonInteraction, ticketManager: any) {
  const customId = interaction.customId;

  // Ticket-bezogene Buttons verarbeiten
  if (customId.startsWith('ticket:')) {
    const [, action, ...args] = customId.split(':');

    switch (action) {
      case 'create':
        // Format: ticket:create:categoryId
        if (args.length > 0) {
          const categoryId = parseInt(args[0]);
          await ticketManager.create({
            categoryId,
            interaction,
          });
        }
        break;

      case 'claim':
        await ticketManager.claim(interaction);
        break;

      case 'close':
        await ticketManager.beforeRequestClose(interaction);
        break;

      case 'confirm-close':
        await ticketManager.acceptClose(interaction);
        break;

      case 'cancel-close':
        await interaction.reply({
          content: 'Ticket-Schließung abgebrochen.',
          ephemeral: true
        });
        break;

      case 'transcript':
        // Hier die Transkript-Funktionalität implementieren
        break;

      default:
        await interaction.reply({
          content: 'Unbekannte Ticket-Aktion.',
          ephemeral: true
        });
        break;
    }
  }
}

/**
 * Verarbeitet Modal-Übermittlungen für Tickets
 */
async function handleModalSubmit(interaction: ModalSubmitInteraction, ticketManager: any) {
  const customId = interaction.customId;

  // Ticket-bezogene Modals verarbeiten
  if (customId === 'close-ticket-modal') {
    const reason = interaction.fields.getTextInputValue('close-reason');
    await ticketManager.requestClose(interaction, reason);
  } else if (customId.startsWith('ticket-questions:')) {
    // Format: ticket-questions:categoryId
    const categoryId = parseInt(customId.split(':')[1]);
    
    // Antworten aus dem Modal extrahieren
    const answers: { questionId: string; value: string }[] = [];
    
    for (const [key, value] of interaction.fields.fields) {
      if (key.startsWith('question:')) {
        const questionId = key.split(':')[1];
        answers.push({
          questionId,
          value: value.value
        });
      }
    }

    // Ticket mit den Antworten erstellen
    await ticketManager.createTicket({
      categoryId,
      createdBy: interaction.user,
      guild: interaction.guild,
      answers
    });

    await interaction.reply({
      content: 'Dein Ticket wurde erstellt!',
      ephemeral: true
    });
  }
}
