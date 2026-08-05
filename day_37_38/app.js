const sync = require("./modules/sync");
const utils = require("./modules/utils");

utils.printBanner();

const command = process.argv[2];
const fileName = process.argv[3];

switch (command) {
  case "sync":
    sync.startSync();
    break;

  case "list":
    sync.listFiles();
    break;

  case "delete":
    if (!fileName) {
      console.log("Please provide a file name.");
      break;
    }

    sync.deleteFile(fileName);
    break;

  case "logs":
    logger.showLogs();
    break;

  case "stats":
    sync.stats();
    break;

  case "help":
    console.log("Available Commands");
    console.log("-------------------------");
    console.log("node app.js sync");
    console.log("node app.js list");
    console.log("node app.js delete filename");
    console.log("node app.js logs");
    console.log("node app.js stats");
    break;

  default:
    console.log("Unknown Command");
}
