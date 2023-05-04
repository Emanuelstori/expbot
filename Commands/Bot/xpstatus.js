const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const configdev = require(`../../config/development`);
const configprod = require(`../../config/production`);

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
    if (interaction.options.getString("id")) {
      try {
        username = await client.users.fetch(
          interaction.options.getString("id")
        );
      } catch (e) {
        interaction.reply("Usuário não encontrado.");
        return;
      }
    }
    const memberDb = require("../../Schemas/memberSchema.js");

    const result = await memberDb.findOne({ _id: username.id });

    const searchKeyByValue = (value, obj) => {
      for (let key in obj) {
        if (obj[key] === value) {
          return key;
        }
      }
      return null;
    };
    let valueToFind = result.roles[0];
    let key =
      searchKeyByValue(valueToFind, configdev.roles.levels) ||
      searchKeyByValue(valueToFind, configprod.roles.levels);
    for (let i = 1; i < result.roles.length; i++) {
      valueToFind = result.roles[i];
      if (key != null) {
        break;
      }
      key =
        searchKeyByValue(valueToFind, configdev.roles.levels) ||
        searchKeyByValue(valueToFind, configprod.roles.levels);
    }

    let xpvoz = result.xp.xp_voice ? result.xp.xp_voice : 0;
    let xpchat = result.xp.xp_chat ? result.xp.xp_chat : 0;
    let xpbonus = result.xp.xp_bonus ? result.xp.xp_bonus : 0;

    const totalxp = calculateXP(key, xpvoz, xpchat, xpbonus);
    //const percent = getProgressToNextLevel(key, 129600);
    const percent = getProgressToNextLevel(
      key,
      parseInt(totalxp.xp_total_points)
    );

    const length = 70;
    const fillLength = Math.floor(length * percent);
    const fillChar = "|";
    const spaceChar = " ";
    const filledString =
      fillChar.repeat(fillLength) + spaceChar.repeat(length - fillLength);

    const avatarEmbed = new EmbedBuilder()
      .setColor("#3a7c7c")
      .setTitle(`Level ${key}`)
      .setDescription(
        "```" +
          filledString +
          "```" +
          `\n ${percent * 100}% para o próximo level.\n`
      )
      .setFooter({
        text: `${username.tag}!`,
        iconURL: username.displayAvatarURL(),
      });

    interaction.reply({ embeds: [avatarEmbed] });
  },
};
function calculateXP(level, xp_call, xp_chat, xp_bonus) {
  let XP_total = (xp_call + xp_chat + xp_bonus) * 10;
  let xp_bonus_points = XP_total * 0.6;
  let xp_chat_points = XP_total * 0.25;
  let xp_voice_points = XP_total * 0.15;
  let xp_total_points = xp_bonus_points + xp_chat_points + xp_voice_points;

  return {
    level: level,
    xp_total: XP_total,
    xp_bonus: xp_bonus_points,
    xp_chat: xp_chat_points,
    xp_voice: xp_voice_points,
    xp_total_points: xp_total_points,
  };
}

function getProgressToNextLevel(level, xp) {
  const levels = configdev.xp.levels;
  let grapLevelStats = levels.findIndex((obj) => obj[0].level == level);
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
}
