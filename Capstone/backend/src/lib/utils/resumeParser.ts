import fs from "fs";
import path from "path";

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const parseResume = async (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase();

  // PDF
  if (extension === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  // DOCX
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });
    return result.value.trim();
  }
  throw new Error("Unsupported resume file format");
};
