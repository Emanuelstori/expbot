const memberDb = require("../Schemas/memberSchema");
const chatData = require("../database/chatinfo.json");
const callData = require("../database/callinfo.json");
let especifico = true;
let bonusAmount = 5;
let updatedUsers = [];
const config = require(`../config/${process.env.MODE}`);
let levels = config.roles.levels;

const client = require("../index.js");

async function updateDb() {
  try {
    // Atualização com base no arquivo JSON 'callinfo.json'
    for (let userId in callData) {
      let xpCall = parseInt(callData[userId]); // Converter para número

      if (!isNaN(xpCall)) {
        // Verifica se é um número válido
        const existingUser = await memberDb.findOne({ _id: userId });

        if (existingUser) {
          // Usuário já existe, então atualiza os valores de xp
          if (!existingUser.xp.xp_voice) existingUser.xp.xp_voice = 0;
          existingUser.xp.xp_voice = existingUser.xp.xp_voice + xpCall;

          if (especifico) {
            // Verifica se a condição específica é verdadeira
            if (!existingUser.xp.xp_bonus) existingUser.xp.xp_bonus = 0;
            existingUser.xp.xp_bonus += bonusAmount; // Adicione o valor do bônus aqui
          }

          await existingUser.save();
          updatedUsers.push(existingUser);
          console.log(`Usuário ${userId} atualizado com sucesso.`);
        } else {
          // Usuário não existe, então cria um novo documento
          const newUser = new memberDb({
            _id: userId,
            xp: { xp_voice: xpCall },
          });
          await newUser.save();
          updatedUsers.push(newUser);
          console.log(`Novo usuário ${userId} criado com sucesso.`);
        }
      } else {
        console.error(
          `Valor inválido encontrado para xpCall do usuário ${userId}`
        );
      }
    }

    // Atualização com base no arquivo JSON 'chatinfo.json'
    for (let userId in chatData) {
      const xpChat = parseInt(chatData[userId]); // Converter para número

      if (!isNaN(xpChat)) {
        // Verifica se é um número válido
        const existingUser = await memberDb.findOne({ _id: userId });

        if (existingUser) {
          // Usuário já existe, então atualiza os valores de xp
          if (!existingUser.xp.xp_chat) existingUser.xp.xp_chat = 0;
          existingUser.xp.xp_chat = existingUser.xp.xp_chat + xpChat;

          if (especifico) {
            // Verifica se a condição específica é verdadeira
            if (!existingUser.xp.xp_bonus) existingUser.xp.xp_bonus = 0;
            existingUser.xp.xp_bonus += bonusAmount; // Adicione o valor do bônus aqui
          }

          await existingUser.save();
          updatedUsers.push(existingUser);
          console.log(`Usuário ${userId} atualizado com sucesso.`);
        } else {
          // Usuário não existe, então cria um novo documento
          const newUser = new memberDb({
            _id: userId,
            xp: { xp_chat: xpChat },
          });
          await newUser.save();
          updatedUsers.push(newUser);
          console.log(`Novo usuário ${userId} criado com sucesso.`);
        }
      } else {
        console.error(
          `Valor inválido encontrado para xpChat do usuário ${userId}`
        );
      }
    }

    // Verificação da condição específica e adição do bônus
    for (let userId in chatData) {
      const existingUser = await memberDb.findOne({ _id: userId });

      if (existingUser && existingUser.especifico === true) {
        // Verifica se a condição específica é verdadeira
        if (!existingUser.xp.xp_bonus) existingUser.xp.xp_bonus = 0;
        existingUser.xp.xp_bonus += bonusAmount; // Adicione o valor do bônus aqui

        await existingUser.save();
        updatedUsers.push(existingUser);
        console.log(`Bônus adicionado para o usuário ${userId}`);
      }
    }

    // Busca os dados atualizados do MongoDB
    let updatealldatafinal = [];
    if (updatedUsers.length > 0) {
      const calculateXP = require("../helpers/calculateXP.js");
      const updatedUsersData = await memberDb.find({
        _id: { $in: updatedUsers.map((user) => user._id) },
      });
      if (updatedUsersData) {
        for (let data of updatedUsersData) {
          const { xp_chat, xp_voice, xp_bonus } = data.xp;
          let alldata = await calculateXP(xp_chat, xp_voice, xp_bonus);
          updatealldatafinal.push({ id: data._id, level: alldata.level });
        }
        // ...
        for (let item of updatealldatafinal) {
          let { level } = item;
          let roleId = levels[level];
          if (!roleId) return;
          console.log(`Level ${level} corresponds to role ID ${roleId}`);
          const guild = client.guilds.cache.get(config.guildId);
          if (guild) {
            const role = guild.roles.cache.get(roleId); // Obtém o objeto Role (cargo) pelo ID
            let member = guild.members.cache.get(item.id);
            if (role) {
              try {
                // Filtra os cargos do membro para remover apenas os cargos de levels anteriores
                const previousRoles = [...member.roles.cache.values()];
                const previousLevelRoles = previousRoles.filter((r) =>
                  Object.values(levels).includes(r.id)
                );

                // Remove os cargos de levels anteriores
                await member.roles.remove(previousLevelRoles);

                // Adiciona o novo cargo
                await member.roles.add(role);

                console.log(
                  `Cargos de levels anteriores removidos para o membro ${member.user.tag}`
                );
                console.log(
                  `Cargo '${role.name}' atribuído com sucesso ao membro ${member.user.tag}`
                );
              } catch (error) {
                console.error(`Erro ao atribuir cargo ao membro: ${error}`);
              }
            } else {
              console.error(
                `Cargo com ID '${roleId}' não encontrado no servidor`
              );
            }
          } else {
            console.error(`Servidor com ID '${guildId}' não encontrado`);
          }
        }
        // ...
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar o banco de dados:", error);
  }
}

module.exports = updateDb;
