import { NextResponse } from "next/server";

export async function POST() {
  try {
    // With Pinecone and per-session namespaces, we don't need to explicitly "reset" 
    // a global store. Each session gets a fresh namespace automatically.
    // We can treat this as a no-op or implement namespace deletion if needed later.
    return NextResponse.json({ success: true, message: "Vector store reset successfully (No-op for Pinecone)" });
  } catch (error: any) {
    console.error("Error resetting vector store:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
