export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// Mock-facing JSON shape; no Document endpoint exists in the current backend.
export interface Document {
    id: string;
    knowledgeBaseId: string;
    uploadedBy: string;
    name: string;
    fileSize: string;
    mimeType: string;
    status: DocumentStatus;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}
