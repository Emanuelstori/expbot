var cron = require("node-cron");
const calculateXP = require("../../helpers/calculateXP.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("BOT online");
    try {
      const updateDb = require("../../helpers/updateDb.js");
      await updateDb.updateDb(client);
    } catch (err) {
      console.log(err);
    }
    cron.schedule("*/5 * * * *", async () => {
      try {
        const updateDb = require("../../helpers/updateDb.js");
        await updateDb.updateDb(client);
      } catch (err) {
        console.log(err);
      }
    });
  },
};
