const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Mostra o ping ai fecho xara!")
    .setDMPermission(false),

  async execute(interaction, client) {
    interaction.reply({
      content: `O ping do bagui ai é **${client.ws.ping}ms**. Qualquer coisa aciona nois, tmj!`,
    });
  },
};
