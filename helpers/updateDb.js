const chatData = require("../database/chatinfo.json");
const callData = require("../database/callinfo.json");
const { pool } = require("../database/connection/postgres");
const multiply = 0.1;
let especifico = true;
let bonusAmount = 5;
let updatedUsers = [];
const config = require(`../config/${process.env.MODE}`);
let levels = config.roles.levels;

async function updateDb(client) {
  try {
    // Atualização com base no arquivo JSON 'callinfo.json'
    for (let userId in callData) {
      let xpCall = parseInt(callData[userId]); // Converter para número

      if (!isNaN(xpCall)) {
        // Verifica se é um número válido
        try {
          await pool.query(
            "INSERT INTO production.members (id_discord, xp_call) VALUES ($1, COALESCE($2, 0)) ON CONFLICT (id_discord) DO UPDATE SET xp_call = members.xp_call + EXCLUDED.xp_call",
            [userId, xpCall]
          );
          updatedUsers.push(userId);
          console.log(`Usuário ${userId} atualizado com sucesso.`);
        } catch (error) {
          console.error(`Erro ao atualizar o usuário ${userId}:`, error);
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
        console.log(typeof xpChat + " " + xpChat);
        console.log(typeof userId + " " + userId);
        try {
          await pool.query(
            "INSERT INTO production.members (id_discord, xp_chat) VALUES ($1, COALESCE($2, 0)) ON CONFLICT (id_discord) DO UPDATE SET xp_chat = members.xp_chat + EXCLUDED.xp_chat",
            [userId, xpChat]
          );
          updatedUsers.push(userId);
          console.log(`Usuário ${userId} atualizado com sucesso.`);
        } catch (error) {
          console.error(`Erro ao atualizar o usuário ${userId}:`, error);
        }
      } else {
        console.error(
          `Valor inválido encontrado para xpChat do usuário ${userId}`
        );
      }
    }

    // Verificação da condição específica e adição do bônus
    for (let userId in chatData) {
      try {
        await pool.query(
          "UPDATE production.members SET xp_bonus = xp_bonus + $1 WHERE id_discord = $2",
          [bonusAmount, userId]
        );
        updatedUsers.push(userId);
        console.log(`Bônus adicionado para o usuário ${userId}`);
      } catch (error) {
        console.error(
          `Erro ao adicionar bônus para o usuário ${userId}:`,
          error
        );
      }
    }

    updateRoles(updatedUsers, client).then(() => {
      try {
        const fs = require("fs");

        // Limpar chatinfo.json
        fs.writeFile("database/chatinfo.json", "{}", (err) => {
          if (err) {
            console.error("Erro ao limpar chatinfo.json", err);
          } else {
            console.log("chatinfo.json limpo com sucesso.");
          }
        });

        // Limpar callinfo.json
        fs.writeFile("database/callinfo.json", "{}", (err) => {
          if (err) {
            console.error("Erro ao limpar callinfo.json", err);
          } else {
            console.log("callinfo.json limpo com sucesso.");
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function updateRoles(updatedUsers, client) {
  // Busca os dados atualizados do PostgreSQL
  let updatealldatafinal = [];
  let levelRoles = Object.values(levels);

  if (updatedUsers.length > 0) {
    const calculateXP = require("../helpers/calculateXP.js");

    try {
      for (let userId of updatedUsers) {
        const query =
          "SELECT id_discord, xp_chat, xp_call, xp_bonus FROM production.members WHERE id_discord = $1::varchar;";
        const result = await pool.query(query, [userId.toString()]);
        const updatedUserData = result.rows[0];

        if (updatedUserData) {
          const { xp_chat, xp_call, xp_bonus } = updatedUserData;
          let alldata = await calculateXP(
            parseInt(xp_chat),
            parseInt(xp_call),
            parseInt(xp_bonus)
          );
          console.log(alldata.level);
          updatealldatafinal.push({
            id: updatedUserData.id_discord,
            level: alldata.level,
          });
        }
      }

      console.log(updatealldatafinal);

      for (let item of updatealldatafinal) {
        let { level } = item;
        let roleId = levels[level];

        if (!roleId) continue;

        console.log(`Level ${level} corresponds to role ID ${roleId}`);

        if (!client) {
          console.log("Client not found");
          return;
        }

        let guild = client.guilds.cache.get(config.guildId);
        let member = await guild.members.fetch(item.id.toString());

        if (!member) continue;
        if (guild) {
          // Verifica se o membro já possui o cargo correspondente ao level
          if (member.roles.cache.has(roleId)) {
            console.log(
              `O membro já possui o cargo correspondente ao level ${level}`
            );
            continue;
          }

          // Remover cargos de level antigos
          let oldLevelRoles = levelRoles.filter((roleId) =>
            member.roles.cache.has(roleId)
          );
          await member.roles.remove(oldLevelRoles);

          const role = await guild.roles.cache.get(roleId);

          if (role) {
            try {
              member.roles.add(role);
              console.log(`Cargo atribuído ao membro: ${member}`);
            } catch (error) {
              console.error(`Erro ao atribuir cargo ao membro: ${error}`);
            }
          } else {
            console.error(
              `Cargo com ID '${roleId}' não encontrado no servidor`
            );
          }
        } else {
          console.error(`Servidor com ID '${config.guildId}' não encontrado`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

async function testConnection() {
  try {
    // Testar a conexão com o banco de dados
    const testQuery = "SELECT NOW()";
    const testResult = await pool.query(testQuery);
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
    console.log("Resultado da consulta:", testResult.rows);

    // Resto do código...
  } catch (error) {
    console.error("Erro ao atualizar o banco de dados:", error);
  }
}

async function testando(client) {
  console.log(config.guildId);
  const guild = client.guilds.cache.get(config.guildId);
  if (guild) {
    console.log(guild);
  } else {
    console.log("Guilda não encontrada."); // A guilda não foi encontrada
  }
}

module.exports = { updateDb, testando };
