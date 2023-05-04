const { disconnect } = require("process");
const config = require(`../../config/production`);

const usersActive = require("./../../Schemas/usersActive");

const CallExpModel = usersActive;

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

          // Atualiza o tempoAtivo do usuário no banco de dados
          await CallExpModel.findOneAndUpdate(
            { id: newState.id },
            { tempoAtivo: usuarioAtivo.tempoAtivo },
            { new: true }
          );
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
      const usuarioAtivo = new CallExpModel({
        id: idUsuario,
        horaConexao: performance.now(),
        tempoAtivo: 0,
      });
      try {
        await usuarioAtivo.save();
        console.log("Usuário ativo salvo com sucesso.");
      } catch (err) {
        console.log(err);
      }
    }

    async function disconnected(idUsuario) {
      const horaDesconexao = performance.now();
      const usuarioAtivo = usuariosAtivos[idUsuario];
      usuarioAtivo.tempoAtivo += horaDesconexao - usuarioAtivo.horaConexao;
      console.log(usuarioAtivo);
      delete usuariosAtivos[idUsuario];
      try {
        const deletedUser = await CallExpModel.findOneAndDelete({
          id: idUsuario,
        });
        console.log(deletedUser);
      } catch (err) {
        console.error(`Mongoose delete error: ${err}`);
      }
    }
  },
};
