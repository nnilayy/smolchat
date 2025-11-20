import { NextResponse } from "next/server";
import { clearVectorStore } from "@/lib/memory-store";

export async function POST() {
  try {
    clearVectorStore();
    return NextResponse.json({ success: true, message: "Vector store reset successfully" });
  } catch (error: any) {
    console.error("Error resetting vector store:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
