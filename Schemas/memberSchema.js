var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var memberSchema = new Schema({
  _id: String,
  roles: [String],
  level: String,
  xp: {
    xp_voice: Number,
    xp_chat: Number,
    xp_bonus: Number,
  },
});
module.exports = mongoose.model("members", memberSchema);
