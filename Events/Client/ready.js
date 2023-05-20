const config = require(`../../config/${process.env.MODE}`);
const memberDb = require("../../Schemas/memberSchema.js");
var cron = require('node-cron');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const guild = client.guilds.resolve(config.guildId);
    const allMembers = await guild.members.fetch();

    allMembers.forEach(async (element) => {
      if (!element.user.bot) {
        let result = await memberDb.findOne({ _id: element.user.id });
        let member = guild.members.cache.get(element.user.id);
        let userRoles = [...member.roles.cache.keys()];
        let levels = Object.values(config.roles.levels);

        if (result) {
          for (const value of result.roles) {
            if (!userRoles.includes(value) && levels.includes(value)) {
              const key = Object.keys(config.roles.levels).find(
                (key) => config.roles.levels[key] === value
              );

              if (key) {
                const role = guild.roles.cache.find(
                  (role) => role.id === value
                );
                member.roles.add(role);
                console.log(`${element.user.id} level ${key}`);
              }
            }
          }
        } else {
          //insert user db
        }
      }
    });

    console.log("BOT online");
  },
};

cron.schedule('* * */2 * * * ', ()=>{
  //logica insert db
})