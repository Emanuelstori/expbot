const fs = require("fs");
const POINTS_FILE = "database/chatinfo.json";

// Verifica se o arquivo existe, cria um arquivo vazio se não existir
if (!fs.existsSync(POINTS_FILE)) {
  fs.writeFileSync(POINTS_FILE, "{}");
}

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    // Carrega os dados do arquivo JSON
    let pointsData = {};
    try {
      pointsData = JSON.parse(fs.readFileSync(POINTS_FILE));
    } catch (err) {
      console.error(`Erro ao carregar o arquivo ${POINTS_FILE}: ${err}`);
      return;
    }

    // Obtém o ID do autor da mensagem
    const userId = message.author.id;

    // Verifica se o usuário já tem pontos no arquivo
    let userPoints = pointsData[userId] || 0;

    // Adiciona um ponto ao usuário
    userPoints= userPoints+10;

    // Atualiza o número de pontos do usuário no arquivo
    pointsData[userId] = userPoints;

    // Escreve os dados atualizados no arquivo
    try {
      fs.writeFileSync(POINTS_FILE, JSON.stringify(pointsData));
      console.log(`Pontos atualizados para o usuário ${userId}: ${userPoints}`);
    } catch (err) {
      console.error(`Erro ao salvar os pontos do usuário ${userId} no arquivo ${POINTS_FILE}: ${err}`);
    }
  },
};
