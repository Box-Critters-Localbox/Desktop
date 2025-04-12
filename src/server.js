const { spawn } = require("child_process");
const fs = require("fs");
const net = require("net");
const os = require("os");

let serverProcess = null;

function getAvailablePort(start = 3000, end = 65535) {
  return new Promise((resolve, reject) => {
    const port = Math.floor(Math.random() * (end - start + 1)) + start;
    const server = net.createServer();

    server.listen(port, () => {
      server.once("close", () => {
        resolve(port);
      });
      server.close();
    });

    server.on("error", () => {
      getAvailablePort(start, end).then(resolve).catch(reject);
    });
  });
}

async function startServer(executablePath) {
  if (!fs.existsSync(executablePath)) {
    throw new Error("Localbox executable not found at:", executablePath);
  }

  const PORT = await getAvailablePort(3000, 65535); // Avoid ports below 1024

  console.log(`Starting server on port ${PORT}...`);

  serverProcess = spawn(executablePath, [`--port=${PORT}`], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("Server output:", output);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error("Server error:", data.toString());
  });

  serverProcess.on("close", (code) => {
    console.log(
      `Server process exited ${code != null ? "with code " + code : ""}`
    );
    serverProcess = null;
  });

  return PORT;
}

function stopServer() {
  if (serverProcess) {
    console.log("Killing server process...");

    if (process.platform === "win32") {
      // Windows
      const taskkill = spawn("taskkill", [
        "/pid",
        serverProcess.pid,
        "/f",
        "/t",
      ]);

      taskkill.on("close", (code) => {
        if (code !== 0) {
          console.error(
            `taskkill exited with code ${code}.  The server process may ` +
              `not have been terminated.`
          );
        } else {
          console.log("Server process terminated successfully on Windows.");
        }
      });
    } else {
      // macOS and Linux
      serverProcess.kill("SIGTERM");

      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          console.log(
            "Server termination with SIGTERM failed, attempting SIGKILL"
          );
          serverProcess.kill("SIGKILL");
        }
      }, 2000);
    }
  }
}

module.exports = {
  startServer,
  stopServer,
};
