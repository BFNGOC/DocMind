import type { DocumentStatus } from '@/features/documents/types/document.types';

export interface DashboardSummary {
    knowledgeBaseCount: number;
    documentCount: number;
    documentsByStatus: Record<DocumentStatus, number>;
    recentDocumentIds: string[];
}
