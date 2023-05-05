const fs = require("fs");
const path = "database/callinfo.json";

const usuariosAtivos = {};
const mutadosRecentemente = {};

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
    async function connected(idUsuario) {
      usuariosAtivos[idUsuario] = {
        horaConexao: performance.now(),
        tempoAtivo: 0,
      };
      usuariosAtivos[idUsuario] = {
        horaConexao: performance.now(),
        tempoAtivo: 0,
      };
    }

    async function disconnected(idUsuario) {
      const horaDesconexao = performance.now();
      const usuarioAtivo = usuariosAtivos[idUsuario];
      usuarioAtivo.tempoAtivo += horaDesconexao - usuarioAtivo.horaConexao;
      saveData(idUsuario, getCallTime(idUsuario));
      delete usuariosAtivos[idUsuario];
    }
  },
};

function getCallTime(idUsuario) {
  const usuarioAtivo = usuariosAtivos[idUsuario];
  const tempoTotalMilissegundos = usuarioAtivo.tempoAtivo;
  const tempoTotalSegundos = Math.floor(tempoTotalMilissegundos / 1000);
  return tempoTotalSegundos;
}

// Função para armazenar os dados em um arquivo JSON
function saveData(id, tempo) {
  let data = {};

  // Verifica se o arquivo JSON existe e o lê
  if (fs.existsSync(path)) {
    const json = fs.readFileSync(path);
    data = JSON.parse(json);
  }

  // Verifica se já existe um registro para o usuário
  if (data.hasOwnProperty(id)) {
    // Se existir, soma o tempo novo ao tempo existente
    data[id].tempo += tempo;
  } else {
    // Se não existir, cria um novo registro
    data[id] = { id, tempo };
  }

  // Salva o objeto de dados atualizado no arquivo JSON
  fs.writeFileSync(path, JSON.stringify(data));
}
