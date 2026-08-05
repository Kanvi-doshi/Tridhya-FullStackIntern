const fs = require("fs");

function printBanner() {
  console.log("\n===============================");
  console.log("   FILE SYNCHRONIZATION TOOL");
  console.log("===============================\n");
}

function ensureFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    console.log(folder + " folder created.");
  }
}

module.exports = {
  printBanner,
  ensureFolder,
};
