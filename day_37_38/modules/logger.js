const fs = require("fs");
const EventEmitter = require("events");
class Logger extends EventEmitter {}

const LOG_FILE = "./logs.txt";
const logger = new Logger();

function saveLog(message) {
  const time = new Date().toLocaleString();

  fs.appendFileSync(LOG_FILE, `[${time}] ${message}\n`);
}

logger.on("fileCopied", (file) => {
  console.log(`File Copied : ${file}`);
});

logger.on("fileDeleted", (file) => {
  console.log(`File Deleted : ${file}`);
});

logger.on("syncCompleted", (count) => {
  console.log(`Sync Completed`);
  console.log(`Total Files Copied : ${count}`);
  saveLog(`Sync Completed | Total Files Copied : ${count}`);
});

function showLogs() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log("No logs found.");
    return;
  }

  const logs = fs.readFileSync(LOG_FILE, "utf8");
  console.log(logs);
}

module.exports = logger;
