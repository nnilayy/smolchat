import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { loadAndSplitDocuments } from "@/lib/document-loader";
import { createEmbeddings, EmbeddingProvider } from "@/lib/embeddings-factory";
import { getPineconeStore } from "@/lib/memory-store";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files: File[] | null = data.getAll("files") as unknown as File[];
  
  // Extract RAG settings
  const provider = data.get("provider") as EmbeddingProvider;
  const apiKey = data.get("apiKey") as string;
  const model = data.get("model") as string;
  const chunkSize = parseInt(data.get("chunkSize") as string) || 1000;
  const chunkOverlap = parseInt(data.get("chunkOverlap") as string) || 200;
  
  // Extract Pinecone settings
  const pineconeApiKey = data.get("pineconeApiKey") as string;
  const pineconeIndex = data.get("pineconeIndex") as string;
  const sessionId = data.get("sessionId") as string;

  if (!files || files.length === 0) {
    return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
  }

  if (!provider || !apiKey) {
      return NextResponse.json({ success: false, message: "Provider and API Key are required" }, { status: 400 });
  }

  if (!pineconeApiKey || !pineconeIndex || !sessionId) {
      return NextResponse.json({ success: false, message: "Pinecone API Key, Index Name, and Session ID are required" }, { status: 400 });
  }

  const uploadDir = path.join(os.tmpdir(), "temp_upload");
  
  try {
      await mkdir(uploadDir, { recursive: true });
  } catch (e) {
      console.error("Error creating directory", e);
  }

  const savedFiles = [];

  try {
    // 1. Save files
    for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Sanitize filename to prevent directory traversal or other issues
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = path.join(uploadDir, safeName);
        
        await writeFile(filePath, buffer);
        savedFiles.push(safeName);
    }

    // 2. Load and Split
    const docs = await loadAndSplitDocuments(uploadDir, chunkSize, chunkOverlap);

    // 3. Create Embeddings
    const embeddings = createEmbeddings({
        provider,
        apiKey,
        model
    });

    // 4. Store in Pinecone
    console.log(`Storing in Pinecone Index: ${pineconeIndex}, Namespace: ${sessionId}`);
    const vectorStore = await getPineconeStore(embeddings, {
        pineconeApiKey,
        pineconeIndex,
        namespace: sessionId,
    });
    
    await vectorStore.addDocuments(docs);
    console.log(`Added ${docs.length} documents to Pinecone`);

    // 5. Cleanup files
    for (const file of savedFiles) {
        try {
            await unlink(path.join(uploadDir, file));
        } catch (e) {
            console.error(`Failed to delete ${file}`, e);
        }
    }

    return NextResponse.json({ success: true, files: savedFiles, docCount: docs.length });

  } catch (error: any) {
      console.error("Upload/Ingest error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
