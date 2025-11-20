import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { JSONLoader } from "@langchain/classic/document_loaders/fs/json";
import { JSONLinesLoader } from "@langchain/classic/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";


export async function loadAndSplitDocuments(
  directoryPath: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<Document[]> {
  try {
    const loader = new DirectoryLoader(directoryPath, {
      ".pdf": (path) => new PDFLoader(path),
      ".docx": (path) => new DocxLoader(path),
      ".pptx": (path) => new PPTXLoader(path),
      ".txt": (path) => new TextLoader(path),
      ".md": (path) => new TextLoader(path),
      ".json": (path) => new JSONLoader(path),
      ".jsonl": (path) => new JSONLinesLoader(path, "/content"),
      ".csv": (path) => new CSVLoader(path),
    });

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    return splitDocs;
  } catch (error) {
    console.error("Error loading and splitting documents:", error);
    throw error;
  }
}
