async function calculateXP(xp_call, xp_chat, xp_bonus) {
  let XP_total = (xp_call + xp_chat + xp_bonus) * 10;
  let xp_bonus_points = XP_total * 0.6;
  let xp_chat_points = XP_total * 0.25;
  let xp_voice_points = XP_total * 0.15;
  let xp_total_points = xp_bonus_points + xp_chat_points + xp_voice_points;
  let level = 0;

  if (xp_total_points >= 1600) {
    level = 5;
  }

  if (xp_total_points >= 4800) {
    level = 10;
  }

  if (xp_total_points >= 14400) {
    level = 20;
  }

  if (xp_total_points >= 43200) {
    level = 30;
  }

  if (xp_total_points >= 129600) {
    level = 40;
  }

  if (xp_total_points >= 388800) {
    level = 50;
  }

  if (xp_total_points >= 1166400) {
    level = 60;
  }

  if (xp_total_points >= 3499200) {
    level = 70;
  }

  if (xp_total_points >= 10497600) {
    level = 80;
  }

  if (xp_total_points >= 31492800) {
    level = 90;
  }

  if (xp_total_points >= 94478400) {
    level = 100;
  }
  return {
    level: level,
    xp_total: XP_total,
    xp_bonus: xp_bonus_points,
    xp_chat: xp_chat_points,
    xp_voice: xp_voice_points,
    xp_total_points: xp_total_points,
  };
}

module.exports = calculateXP;
