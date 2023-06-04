const fs = require("fs");
const POINTS_FILE = "database/callinfo.json";

const usuariosAtivos = {};
const mutadosRecentemente = {};

// Verifica se o arquivo existe, cria um arquivo vazio se não existir
if (!fs.existsSync(POINTS_FILE)) {
  fs.writeFileSync(POINTS_FILE, "{}");
}

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldState, newState, c) {
    const { performance } = require("perf_hooks");
    let connection = !usuariosAtivos.hasOwnProperty(newState.id);
    let disconnection = !newState.channelId;

    if (connection) {
      connected(newState.id);
    }
    if (disconnection) {
      disconnected(newState.id);
    }
    if (!connection && !disconnection) {
      if (newState.selfMute) {
        if (!mutadosRecentemente[newState.id]) {
          mutadosRecentemente[newState.id] = true;

          const usuarioAtivo = usuariosAtivos[newState.id];
          const horaMute = performance.now();
          usuarioAtivo.tempoAtivo += horaMute - usuarioAtivo.horaConexao;
          console.log(usuarioAtivo);

          setTimeout(() => {
            delete mutadosRecentemente[newState.id];
          }, 30000); // espera 5 segundos antes de remover o ID da lista
        }
      }
    }
  },
};

function connected(idUsuario) {
  usuariosAtivos[idUsuario] = {
    horaConexao: performance.now(),
    tempoAtivo: 0,
  };
}

function disconnected(idUsuario) {
  const horaDesconexao = performance.now();
  const usuarioAtivo = usuariosAtivos[idUsuario];
  usuarioAtivo.tempoAtivo += horaDesconexao - usuarioAtivo.horaConexao;
  try {
    pointsData = JSON.parse(fs.readFileSync(POINTS_FILE));
  } catch (err) {
    console.error(`Erro ao carregar o arquivo ${POINTS_FILE}: ${err}`);
    return;
  }
  let userPoints = pointsData[idUsuario] || 0;
  userPoints += getCallTime(idUsuario)/2;
  if(userPoints <0) userPoints = 0;
  saveData(idUsuario, userPoints);
  delete usuariosAtivos[idUsuario];
}

function getCallTime(idUsuario) {
  const usuarioAtivo = usuariosAtivos[idUsuario];
  const tempoTotalMilissegundos = usuarioAtivo.tempoAtivo;
  const tempoTotalSegundos = Math.floor(tempoTotalMilissegundos / 1000);
  return tempoTotalSegundos;
}

function saveData(id, pontos) {
  let pointsData;
  try {
    pointsData = JSON.parse(fs.readFileSync(POINTS_FILE));
  } catch (err) {
    console.error(`Erro ao carregar o arquivo ${POINTS_FILE}: ${err}`);
    return;
  }
  pointsData[id] = parseInt(pontos);
  try {
    fs.writeFileSync(POINTS_FILE, JSON.stringify(pointsData));
    console.log(`Pontos atualizados para o usuário ${id}: ${pontos}`);
  } catch (err) {
    console.error(
      `Erro ao salvar os pontos do usuário ${id} no arquivo ${POINTS_FILE}: ${pontos}`
    );
  }
}
