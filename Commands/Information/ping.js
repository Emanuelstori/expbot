const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping do bot!")
    .setDMPermission(false),

  async execute(interaction, client) {
    interaction.reply({
      content: `O ping do bot é **${client.ws.ping}ms**. Qualquer coisa entre em contato com o Emanuelstor#4176`,
    });
  },
};
