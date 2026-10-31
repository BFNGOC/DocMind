export type KnowledgeBaseMemberRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

// Mock-facing shape only; the current backend has no Knowledge Base API contract.
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseMember {
  id: string;
  knowledgeBaseId: string;
  userId: string;
  role: KnowledgeBaseMemberRole;
  createdAt: string;
}

export interface KnowledgeBaseMemberView extends KnowledgeBaseMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

// Derived frontend view model, not a persisted Knowledge Base field.
export interface KnowledgeBaseCardView extends KnowledgeBase {
  documentCount: number;
  memberCount: number;
}
