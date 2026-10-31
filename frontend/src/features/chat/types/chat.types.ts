// Frontend-only domain types; the backend has no conversation or message API contract yet.
export type ChatMessageRole = "USER" | "ASSISTANT";

// Frontend-only source view; chat endpoints and response contracts are not present yet.
export interface ChatSourceReference {
  documentId: string;
  excerpt: string;
  pageNumber: number | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  sources: ChatSourceReference[];
}

export interface ChatConversation {
  id: string;
  knowledgeBaseId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
