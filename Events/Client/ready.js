const config = require(`../../config/${process.env.MODE}`);
const memberDb = require('../../Schemas/memberSchema.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    const guild = client.guilds.resolve(config.guildId);
    const allMembers = await guild.members.fetch();

    allMembers.forEach(async (element) => {
      if (!element.user.bot) {
        const result = await memberDb.findOne({ _id: element.user.id });
        const member = guild.members.cache.get(element.user.id);
        const userRoles = [...member.roles.cache.keys()];
        const levels = Object.values(config.roles.levels);

        for (const value of result.roles) {
          if (!userRoles.includes(value) && levels.includes(value)) {
            const key = Object.keys(config.roles.levels).find(
              (key) => config.roles.levels[key] === value
            );

            if (key) {
              const role = guild.roles.cache.find((role) => role.id === value);
              member.roles.add(role);
              console.log(`${element.user.id} level ${key}`);
            }
          }
        }
      }
    });

    console.log('BOT online');
  },
};
