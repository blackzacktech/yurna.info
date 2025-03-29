import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '@yurna/types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const command: Command = {
  name: 'ticket-info',
  description: 'Zeigt Informationen über das aktuelle Ticket an',
  async execute(interaction: ChatInputCommandInteraction) {
    const { client, channel } = interaction;
    if (!channel) return;

    // Ticket-Manager aus dem Client holen
    const ticketManager = client['tickets'];
    if (!ticketManager) {
      await interaction.reply({
        content: 'Das Ticket-System ist derzeit nicht verfügbar.',
        ephemeral: true
      });
      return;
    }

    // Prüfen, ob der aktuelle Kanal ein Ticket ist
    const ticketId = await ticketManager.getTicketIdFromChannel(channel);
    if (!ticketId) {
      await interaction.reply({
        content: 'Dieser Kanal ist kein Ticket.',
        ephemeral: true
      });
      return;
    }

    // Ticket-Daten abrufen
    const ticket = await ticketManager.getTicket(ticketId, true);
    if (!ticket) {
      await interaction.reply({
        content: 'Dieses Ticket konnte nicht gefunden werden.',
        ephemeral: true
      });
      return;
    }

    // Prioritäts-Labels und -Farben
    const priorityData = {
      LOW: { label: 'Niedrig', color: 0x3498db },
      NORMAL: { label: 'Normal', color: 0x2ecc71 },
      HIGH: { label: 'Hoch', color: 0xf39c12 },
      URGENT: { label: 'Dringend', color: 0xe74c3c }
    };

    // Informations-Embed erstellen
    const embed = new EmbedBuilder()
      .setTitle(`Ticket #${ticket.number}`)
      .setColor(priorityData[ticket.priority]?.color || 0x7289da)
      .addFields(
        { name: 'Status', value: ticket.open ? '🟢 Offen' : '🔴 Geschlossen', inline: true },
        { name: 'Kategorie', value: ticket.category?.name || 'Unbekannt', inline: true },
        { name: 'Priorität', value: priorityData[ticket.priority]?.label || 'Normal', inline: true },
        { name: 'Erstellt von', value: `<@${ticket.createdById}>`, inline: true },
        { name: 'Erstellt vor', value: formatDistanceToNow(ticket.createdAt, { locale: de, addSuffix: true }), inline: true }
      );

    // Zusätzliche Felder, wenn vorhanden
    if (ticket.claimedById) {
      embed.addFields({ name: 'Beansprucht von', value: `<@${ticket.claimedById}>`, inline: true });
    }

    if (ticket.topic) {
      embed.addFields({ name: 'Thema', value: ticket.topic });
    }

    // Antworten auf Fragen hinzufügen, falls vorhanden
    if (ticket.answers && ticket.answers.length > 0) {
      const answerFields = ticket.answers.map(answer => {
        return {
          name: answer.question?.label || 'Frage',
          value: answer.value || 'Keine Antwort'
        };
      });

      embed.addFields(...answerFields.slice(0, 10)); // Maximal 10 Antworten anzeigen
    }

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
