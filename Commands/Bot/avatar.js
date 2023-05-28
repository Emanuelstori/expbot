const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Exibe o avatar do membro.")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("membro")
        .setDescription("Pega o membro para exibir o avatar.")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    if (interaction.channelId.toString() != "612121513960669227") return;
    const membro = interaction.options.getUser("membro") || interaction.user;
    console.log(membro.displayAvatarURL({ size: 2048 }));
    const avatarEmbed = new EmbedBuilder()
      .setColor("Red")
      .setImage(membro.displayAvatarURL({ size: 2048 }))
      .setFooter({
        text: `O ${interaction.user.tag} ta na tua maldade!`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    interaction.reply({ embeds: [avatarEmbed] });
  },
};
