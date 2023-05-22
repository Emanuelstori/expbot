const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const configdev = require(`../../config/development`);
const configprod = require(`../../config/production`);
let calculateXP = require(`../../helpers/calculateXP`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getxpstatus")
    .setDescription("Exibe o status que deseja buscar.")
    .setDMPermission(true)
    .addStringOption((option) =>
      option.setName("id").setDescription("get user by id").setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("membro")
        .setDescription("Define o usuário que deseja ver o status.")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    let username = interaction.options.getUser("membro") || interaction.user;
    if (username.bot) return;
    percent = 0.99;
    const length = 70;
    const fillLength = Math.floor(length * percent);
    const fillChar = "|";
    const spaceChar = " ";
    const filledString =
      fillChar.repeat(fillLength) + spaceChar.repeat(length - fillLength);

    const responseEmbed = new EmbedBuilder()
      .setColor("#3a7c7c")
      .setTitle(`Level x EM DESENVOLVIMENTO`)
      .setDescription(
        "```" + filledString + "```" + `\n x% para o próximo level.\n`
      )
      .setFooter({
        text: `${username.tag}!`,
        iconURL: username.displayAvatarURL(),
      });

    //interaction.reply({ embeds: [responseEmbed] });
    interaction.reply("Em desenvolvimento.");
  },
};

function getProgressToNextLevel(level, xp) {
  try {
    const levels = configdev.xp.levels;
    let grapLevelStats = levels.findIndex((obj) => {
      obj[0].level == level;
    });

    if (!grapLevelStats || grapLevelStats == -1) {
      console.log("caiu aq");
      return 0;
    }
    let currentLevelXp;
    let nextLevelXp;
    levels[grapLevelStats].forEach((item) => {
      currentLevelXp = item.xp_total_points;
    });
    levels[grapLevelStats + 1].forEach((item) => {
      nextLevelXp = item.xp_total_points;
    });
    const calculo = (
      ((((xp - currentLevelXp) /
        (nextLevelXp - currentLevelXp - currentLevelXp)) *
        100) /
        2) *
      0.01
    ).toFixed(2);
    const resu = parseFloat(calculo).toFixed(2);
    return resu;

    const teste = currentLevelXp / currentLevelXp;
    const teste2 = nextLevelXp / currentLevelXp;
    //return Math.round((teste * 100) / teste2);
    const resposta = (nextLevelXp - currentLevelXp) / 100;
    return Math.round(resposta);
  } catch (e) {
    console.log(e);
  }
}
