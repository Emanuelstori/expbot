const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require(`../../config/${process.env.MODE}`);
const memberDb = require(`./../../Schemas/memberSchema`);
let calculateXP = require(`../../helpers/calculateXP`);
const { xp } = require("../../config/production");

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
    let user = interaction.options.getUser("membro") || interaction.user;
    if (user.bot) return;
    
    const memberInfo = await memberDb.findOne({_id: user.id});
    console.log(memberInfo);
    const {xp_voice, xp_bonus, xp_chat} = memberInfo.xp;
    const xp_status = await calculateXP(xp_voice, xp_chat, xp_bonus);

    if (xp_status.level == 100) {
      interaction.reply("Você já está no nível máximo");
      return
    }

    const currentLevelIndex = config.xp.levels.findIndex(m => m.level == xp_status.level);
    let currentLevel = config.xp.levels[currentLevelIndex];
    let nextLevel = config.xp.levels[currentLevelIndex + 1]; 

    if (!currentLevel){currentLevel = {xp_total: 0}}

    console.log(`level: ${xp_status.level}\n
                total xp: ${xp_status.xp_total}`);

    let percent = (((xp_status.xp_total - currentLevel.xp_total) * 100) / (nextLevel.xp_total - currentLevel.xp_total) * 0.01).toFixed(2);

    console.log(percent);
    
    const length = 34;
    const fillLength = Math.floor(length * percent);
    const fillChar = "|";
    const spaceChar = " ";
    const filledString =
      fillChar.repeat(fillLength) + spaceChar.repeat(length - fillLength);

    const responseEmbed = new EmbedBuilder()
      .setColor("#3a7c7c")
      .setTitle(`Level ${xp_status.level}`)
      .setDescription(
        "```" + filledString + "```" + `\n 
        ${xp_status.xp_total}/${nextLevel.xp_total} - lvl ${nextLevel.level}\n
        ${percent * 100}% para o próximo level.\n`
      )
      .setFooter({
        text: `${user.tag}!`,
        iconURL: user.displayAvatarURL(),
      });

    interaction.reply({ embeds: [responseEmbed] });
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
