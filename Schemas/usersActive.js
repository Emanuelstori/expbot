var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var usersActive = new Schema({
  id: String,
  horaConexao: Number,
  tempoAtivo: Number,
});
module.exports = mongoose.model("callexp", usersActive);
