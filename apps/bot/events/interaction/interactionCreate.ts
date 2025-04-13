import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  Interaction,
} from "discord.js";
import type { Yurnabot } from "@/index";

export async function execute(client: Yurnabot, interaction: Interaction) {
  // ===== BUTTON LOGIK =====
  if (interaction.isButton()) {
    const userChannel = interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel;
    const response = {
      content: "❌ Du musst in einem Voice-Channel sein, um diese Aktion zu nutzen.",
      flags: ["Ephemeral"] as const,
    };
    if (!userChannel) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
      return;
    }

    if (interaction.customId === "vc_rename") {
      const modal = new ModalBuilder()
        .setCustomId("vc_rename_modal")
        .setTitle("🔤 Channel umbenennen");

      const input = new TextInputBuilder()
        .setCustomId("new_channel_name")
        .setLabel("Neuer Channel-Name")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("z. B. Besprechung A")
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
      modal.addComponents(row);
      return await interaction.showModal(modal);
    }

    if (interaction.customId === "vc_limit") {
      const modal = new ModalBuilder()
        .setCustomId("vc_limit_modal")
        .setTitle("👥 Nutzerlimit setzen");

      const input = new TextInputBuilder()
        .setCustomId("new_user_limit")
        .setLabel("Maximale Anzahl Nutzer (0 = unbegrenzt)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("z. B. 5")
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
      modal.addComponents(row);
      return await interaction.showModal(modal);
    }
  }

  // ===== MODAL LOGIK =====
  if (interaction.isModalSubmit()) {
    const userChannel = interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel;
    const response = {
      content: "❌ Du musst in einem Voice-Channel sein, um diese Aktion zu nutzen.",
      flags: ["Ephemeral"] as const,
    };
    if (!userChannel) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
      return;
    }

    if (interaction.customId === "vc_rename_modal") {
      const newName = interaction.fields.getTextInputValue("new_channel_name");
      await userChannel.setName(newName);
      await interaction.reply({
        content: `✅ Channel wurde in \`${newName}\` umbenannt.`,
        flags: ["Ephemeral"] as const,
      });
      return;
    }

    if (interaction.customId === "vc_limit_modal") {
      const input = interaction.fields.getTextInputValue("new_user_limit");
      const parsed = parseInt(input);

      if (isNaN(parsed) || parsed < 0 || parsed > 99) {
        await interaction.reply({
          content: "❌ Bitte gib eine gültige Zahl zwischen 0 und 99 ein.",
          flags: ["Ephemeral"] as const,
        });
        return;
      }

      await userChannel.setUserLimit(parsed);
      await interaction.reply({
        content:
          parsed === 0
            ? "👥 Nutzerlimit entfernt (unbegrenzt)."
            : `👥 Nutzerlimit wurde auf **${parsed}** gesetzt.`,
        flags: ["Ephemeral"] as const,
      });
      return;
    }
  }
}

export default {
  name: "interactionCreate",
  execute,
};
