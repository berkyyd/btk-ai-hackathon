import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { Document } from "langchain/document";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not set in environment variables.");
}

// Gemini LLM (2.5 Flash)
export const geminiLLM = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
  model: "gemini-2.5-flash"
});

// Gemini Embeddings
export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY
});

// Global cache
let vectorStoreCache: MemoryVectorStore | null = null;
let notesHashCache: string | null = null;

function hashNotes(notes: Array<{ id: string; title: string; content: string; course?: string }>): string {
  // Basit bir hash: id'leri ve updatedAt'leri birleştirip hashle
  return notes.map(n => `${n.id}:${n.title}:${n.content.length}:${n.course || ''}`).join('|');
}

// Notları vektör store'a ekle ve cache'le
export async function getCachedVectorStore(notes: Array<{ id: string; title: string; content: string; course?: string }>) {
  // Filtreleme: title ve content string ve dolu olmalı, content çok kısa ise alma, çok uzunsa truncate et
  const filteredNotes = notes.filter(note =>
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    note.title.trim().length > 0 &&
    note.content.trim().length >= 10
  ).map(note => ({
    ...note,
    content: note.content.length > 2000 ? note.content.slice(0, 2000) : note.content
  }));

  const hash = hashNotes(filteredNotes);
  if (vectorStoreCache && notesHashCache === hash) {
    return vectorStoreCache;
  }
  const docs = filteredNotes.map(note =>
    new Document({
      pageContent: note.content,
      metadata: {
        id: note.id,
        title: note.title,
        course: note.course || ""
      }
    })
  );
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, geminiEmbeddings);
  vectorStoreCache = vectorStore;
  notesHashCache = hash;
  return vectorStore;
}

// Retriever + QA zinciri ile cevap üret
export async function answerWithRetriever({ question, notes }:{ question: string, notes: Array<{ id: string; title: string; content: string; course?: string }> }) {
  const vectorStore = await getCachedVectorStore(notes);
  const retriever = vectorStore.asRetriever();
  const chain = RetrievalQAChain.fromLLM(geminiLLM, retriever, {
    returnSourceDocuments: true
  });
  const result = await chain.invoke({ query: question });
  return {
    answer: result.text,
    sources: (result.sourceDocuments || []).map((doc: any) => doc.metadata.title)
  };
} 