const fs = require("fs");
const logger = require("./logger");
const utils = require("./utils");

const SOURCE = "./source";
const BACKUP = "./backup";

function startSync() {
  console.log("Sync started...");

  utils.ensureFolder(SOURCE);
  utils.ensureFolder(BACKUP);

  const files = fs.readdirSync(SOURCE);

  if (files.length === 0) {
    console.log("No files found in source folder.");
    return;
  }
  let completed = 0;

  files.forEach((file) => {
    const sourceFile = `${SOURCE}/${file}`;
    const backupFile = `${BACKUP}/${file}`;

    // fs.copyFileSync(sourceFile, backupFile);
    // logger.emit(" copied", file);
    const readStream = fs.createReadStream(sourceFile);
    const writeStream = fs.createWriteStream(backupFile);

    readStream.on("data", (chunk) => {
      console.log(`Reading ${chunk.length} bytes from ${file}`);
    });
    readStream.pipe(writeStream);

    writeStream.on("finish", () => {
      logger.emit("fileCopied", file);
      completed++;

      if (completed === files.length) {
        logger.emit("syncCompleted", completed);
      }
    });

    readStream.on("error", () => {
      console.log("Error reading file:", file);
    });

    writeStream.on("error", () => {
      console.log("Error writing file:", file);
    });
  });
}

function listFiles() {
  utils.ensureFolder(SOURCE);

  const files = fs.readdirSync(SOURCE);

  console.log("\nFiles Inside Source Folder\n");

  if (files.length === 0) {
    console.log("No Files Found");
    return;
  }

  files.forEach((file) => {
    const stats = fs.statSync(`${SOURCE}/${file}`);

    console.log(file + " | " + stats.size + " Bytes");
  });
}

function deleteFile(fileName) {
  const filePath = `${BACKUP}/${fileName}`;

  if (!fs.existsSync(filePath)) {
    console.log("File not found.");
    return;
  }

  fs.unlinkSync(filePath);

  logger.emit("fileDeleted", fileName);
}

function stats() {
  utils.ensureFolder(SOURCE);
  utils.ensureFolder(BACKUP);

  const sourceFiles = fs.readdirSync(SOURCE);
  const backupFiles = fs.readdirSync(BACKUP);

  let totalSize = 0;

  sourceFiles.forEach((file) => {
    const info = fs.statSync(`${SOURCE}/${file}`);
    totalSize += info.size;
  });

  console.log("\nProject Statistics");
  console.log("-----------------------");
  console.log("Source Files :", sourceFiles.length);
  console.log("Backup Files :", backupFiles.length);
  console.log("Total Size   :", totalSize, "Bytes");
}

module.exports = {
  startSync,
  listFiles,
  deleteFile,
  stats,
};
