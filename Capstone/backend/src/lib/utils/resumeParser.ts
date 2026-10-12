import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const parseResume = async (buffer: Buffer, originalName: string) => {
  const extension = path.extname(originalName).toLowerCase();

  // PDF
  if (extension === ".pdf") {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  // DOCX
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }
  throw new Error("Unsupported resume file format");
};
