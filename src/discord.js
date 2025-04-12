const discordRPC = require("discord-rpc");

const CLIENT_ID = "1345580676149280840";
let RPC = null;
let STATE = null;

function displayString(string) {
  return string
    .split(" ")
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
};

function login(nickname, room) {
  RPC = new discordRPC.Client({
    transport: "ipc",
  });

  const start = new Date();
  RPC.on("ready", () => {
    STATE = {
      details: "Exploring the " + displayString(room),
      state: "Playing as " + nickname,
      startTimestamp: start,
      largeImageKey: "main",
    };

    RPC.setActivity(STATE);
  });
  RPC.login({ clientId: CLIENT_ID }).catch(console.error);
};

function changeState(state) {
  if (!STATE) return;
  STATE.details = state;
  RPC.setActivity(STATE);
};

module.exports = { login, changeState };