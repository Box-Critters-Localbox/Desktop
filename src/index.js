const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("node:path");
const fs = require("fs");

const { login, changeState } = require("./discord");
const { startServer, stopServer } = require("./server");

const IS_DEV = !app.isPackaged;
let PORT = null;

const getResourcePath = (relativePath) => {
  const basePath = IS_DEV ? app.getAppPath() : process.resourcesPath;
  return path.join(basePath, relativePath);
};

const setupApp = () => {
  app.setName("Localbox");

  app.setAboutPanelOptions({
    iconPath: "../icons/default.jpg",
    applicationName: "Localbox",
    applicationVersion: "1.0.0",
    website: "https://github.com/Box-Critters-Localbox/Desktop",
  });
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setTitle("Localbox");
  win.loadFile(getResourcePath("public/index.html"));
  win.maximize();

  win.on("page-title-updated", function (e) {
    e.preventDefault();
  });

  win.on("closed", () => {
    stopServer();
  });
};

app.whenReady().then(() => {
  let executableName = "Localbox";
  if (process.platform === "win32") executableName += ".exe";

  startServer(getResourcePath(executableName)).then((port) => {
    PORT = port;
  });

  setupApp();
  createWindow();

  /*
  const menu = Menu.buildFromTemplate([
    {
      label: "Localbox",
      submenu: [
        {
          role: "about",
          label: "About"
        },
        {
          label: "GitHub Repository",
          click: () => shell.openExternal('https://github.com/Box-Critters-Localbox/Desktop')
        },
        {
          type: "separator"
        },
        {
          role: "quit",
          label: "Quit"
        }
      ]
    },
    {
      label: "Party Switcher",
      submenu: []
    }
  ]);
  //Menu.setApplicationMenu(menu);
  */
});

app.on("will-quit", () => {
  stopServer();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/*
  IPC Handlers
*/
ipcMain.handle("get-port", () => PORT);

ipcMain.handle("start-rpc", (event, nickname, room) => {
  login(nickname, room);
});

ipcMain.handle("update-rpc", (event, state) => {
  changeState(state);
});
