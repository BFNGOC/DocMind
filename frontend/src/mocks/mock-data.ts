import type { ChatConversation } from '@/features/chat/types/chat.types';
import type { DashboardSummary } from '@/features/dashboard/types/dashboard.types';
import type { Document } from '@/features/documents/types/document.types';
import type { PublicUser } from '@/features/auth/types/user.types';
import type {
    KnowledgeBase,
    KnowledgeBaseCardView,
    KnowledgeBaseMember,
    KnowledgeBaseMemberView,
} from '@/features/knowledge-bases/types/knowledge-base.types';

const ids = {
    users: {
        current: '87f8c50b-101a-4bf8-8919-34c73ab19d05',
        maya: 'fdb388d9-4ad0-456b-9ba7-4ab436c7b9f1',
        noah: '93858a61-b916-44ef-951b-a78e8eb24686',
        priya: 'a1f92f80-8c03-4a46-9e97-76ce05ac26f2',
    },
    knowledgeBases: {
        product: '75c258e7-35f2-487b-b7ad-28e5935384cd',
        research: '1292b69a-dd59-4419-909b-7ec953715c63',
        operations: 'bc88c332-4bbb-4530-8071-45a1e87bc1ac',
    },
    documents: {
        handbook: '6efc124e-949b-42da-bbca-65dbec7ac701',
        roadmap: '5834f725-bfc9-47da-8862-1c0386b52f5c',
        interviews: '6c0b9e3f-c252-4e96-a3f1-5b1928caa110',
        apiGuide: '5dfefdc6-a339-46bb-8c21-e83e6f4f3a98',
        incident: 'de5f2c40-75f4-4c8b-9cc3-a94382b8ea72',
        onboarding: '87e2bc2e-60ef-46a8-88d5-2d54e0b2e8de',
    },
    conversations: {
        productQna: '8382958a-40af-4fdc-bda5-8ee58019d892',
        researchSynthesis: '7c736b6e-d8d1-4572-9eea-b4e50d403b55',
    },
} as const;

const usersById = {
    [ids.users.current]: {
        id: ids.users.current,
        email: 'alex.morgan@example.test',
        name: 'Alex Morgan',
        role: 'USER',
        avatarUrl: null,
        lastLogin: '2026-10-26T14:18:00.000Z',
        createdAt: '2026-06-12T08:30:00.000Z',
        updatedAt: '2026-10-26T14:18:00.000Z',
    },
    [ids.users.maya]: {
        id: ids.users.maya,
        email: 'maya.chen@example.test',
        name: 'Maya Chen',
        role: 'USER',
        avatarUrl: null,
        lastLogin: '2026-10-25T09:10:00.000Z',
        createdAt: '2026-07-02T11:00:00.000Z',
        updatedAt: '2026-10-25T09:10:00.000Z',
    },
    [ids.users.noah]: {
        id: ids.users.noah,
        email: 'noah.williams@example.test',
        name: 'Noah Williams',
        role: 'USER',
        avatarUrl: null,
        lastLogin: null,
        createdAt: '2026-08-15T16:45:00.000Z',
        updatedAt: '2026-08-15T16:45:00.000Z',
    },
    [ids.users.priya]: {
        id: ids.users.priya,
        email: 'priya.shah@example.test',
        name: 'Priya Shah',
        role: 'USER',
        avatarUrl: null,
        lastLogin: '2026-10-24T13:05:00.000Z',
        createdAt: '2026-09-01T10:20:00.000Z',
        updatedAt: '2026-10-24T13:05:00.000Z',
    },
} satisfies Record<string, PublicUser>;

export const mockUsers: readonly PublicUser[] = Object.values(usersById);
export const mockCurrentUser: PublicUser = usersById[ids.users.current];

export const mockKnowledgeBases = [
    {
        id: ids.knowledgeBases.product,
        name: 'Product Knowledge',
        description: 'Product strategy, release notes, and customer-facing guidance.',
        createdAt: '2026-07-14T09:00:00.000Z',
        updatedAt: '2026-10-26T15:40:00.000Z',
    },
    {
        id: ids.knowledgeBases.research,
        name: 'Customer Research',
        description: 'Interview notes and research synthesis for the product team.',
        createdAt: '2026-08-03T13:25:00.000Z',
        updatedAt: '2026-10-24T16:15:00.000Z',
    },
    {
        id: ids.knowledgeBases.operations,
        name: 'Team Operations',
        description: null,
        createdAt: '2026-09-18T07:45:00.000Z',
        updatedAt: '2026-10-20T12:10:00.000Z',
    },
] satisfies readonly KnowledgeBase[];

export const mockEmptyKnowledgeBases: readonly KnowledgeBase[] = [];

export const mockKnowledgeBaseMembers = [
    {
        id: 'b6f52bf9-1a91-4775-a87f-28d98404c312',
        knowledgeBaseId: ids.knowledgeBases.product,
        userId: ids.users.current,
        role: 'OWNER',
        createdAt: '2026-07-14T09:00:00.000Z',
    },
    {
        id: 'fc147a43-1ef8-4d18-89a6-ac6bb14f1b85',
        knowledgeBaseId: ids.knowledgeBases.product,
        userId: ids.users.maya,
        role: 'EDITOR',
        createdAt: '2026-07-18T10:30:00.000Z',
    },
    {
        id: '14ead6d6-8c7d-4432-8487-7383e30a75ea',
        knowledgeBaseId: ids.knowledgeBases.product,
        userId: ids.users.noah,
        role: 'VIEWER',
        createdAt: '2026-08-02T14:20:00.000Z',
    },
    {
        id: '0125c1cf-2bd7-4aa3-8aed-dd89262aa47b',
        knowledgeBaseId: ids.knowledgeBases.research,
        userId: ids.users.current,
        role: 'ADMIN',
        createdAt: '2026-08-03T13:25:00.000Z',
    },
    {
        id: '7d8620d5-30ea-4a6f-bcf8-b18e1de17020',
        knowledgeBaseId: ids.knowledgeBases.research,
        userId: ids.users.maya,
        role: 'OWNER',
        createdAt: '2026-08-03T13:25:00.000Z',
    },
    {
        id: 'bb64813a-4ac6-4292-9e2f-a2444b20b83c',
        knowledgeBaseId: ids.knowledgeBases.research,
        userId: ids.users.priya,
        role: 'EDITOR',
        createdAt: '2026-08-12T08:40:00.000Z',
    },
    {
        id: '1f567151-8ba5-4751-8147-797f121bd701',
        knowledgeBaseId: ids.knowledgeBases.operations,
        userId: ids.users.current,
        role: 'OWNER',
        createdAt: '2026-09-18T07:45:00.000Z',
    },
    {
        id: '6d46a7e7-32c9-4956-9dc1-b7617fbd428d',
        knowledgeBaseId: ids.knowledgeBases.operations,
        userId: ids.users.noah,
        role: 'ADMIN',
        createdAt: '2026-09-20T09:00:00.000Z',
    },
] satisfies readonly KnowledgeBaseMember[];

export const mockKnowledgeBaseMemberViews: readonly KnowledgeBaseMemberView[] =
    mockKnowledgeBaseMembers.map((member) => {
        const user = usersById[member.userId];

        return {
            ...member,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
        };
    });

export const mockDocuments = [
    {
        id: ids.documents.handbook,
        knowledgeBaseId: ids.knowledgeBases.product,
        uploadedBy: ids.users.current,
        name: 'Product Handbook.pdf',
        fileSize: '2457600',
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        errorMessage: null,
        createdAt: '2026-10-26T15:40:00.000Z',
        updatedAt: '2026-10-26T15:43:00.000Z',
    },
    {
        id: ids.documents.roadmap,
        knowledgeBaseId: ids.knowledgeBases.product,
        uploadedBy: ids.users.maya,
        name: 'Q4 Product Roadmap.docx',
        fileSize: '983040',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        status: 'PROCESSING',
        errorMessage: null,
        createdAt: '2026-10-27T07:30:00.000Z',
        updatedAt: '2026-10-27T07:31:00.000Z',
    },
    {
        id: ids.documents.interviews,
        knowledgeBaseId: ids.knowledgeBases.research,
        uploadedBy: ids.users.priya,
        name: 'October Customer Interviews.pdf',
        fileSize: '3670016',
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        errorMessage: null,
        createdAt: '2026-10-24T16:15:00.000Z',
        updatedAt: '2026-10-24T16:19:00.000Z',
    },
    {
        id: ids.documents.apiGuide,
        knowledgeBaseId: ids.knowledgeBases.product,
        uploadedBy: ids.users.current,
        name: 'Public API Guide.md',
        fileSize: '184320',
        mimeType: 'text/markdown',
        status: 'PENDING',
        errorMessage: null,
        createdAt: '2026-10-27T07:45:00.000Z',
        updatedAt: '2026-10-27T07:45:00.000Z',
    },
    {
        id: ids.documents.incident,
        knowledgeBaseId: ids.knowledgeBases.operations,
        uploadedBy: ids.users.noah,
        name: 'Incident Review 2026-10-12.pdf',
        fileSize: '1572864',
        mimeType: 'application/pdf',
        status: 'FAILED',
        errorMessage: 'The file could not be parsed because the PDF is password protected.',
        createdAt: '2026-10-20T12:10:00.000Z',
        updatedAt: '2026-10-20T12:12:00.000Z',
    },
    {
        id: ids.documents.onboarding,
        knowledgeBaseId: ids.knowledgeBases.operations,
        uploadedBy: ids.users.current,
        name: 'Team Onboarding Checklist.docx',
        fileSize: '524288',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        status: 'COMPLETED',
        errorMessage: null,
        createdAt: '2026-10-19T10:00:00.000Z',
        updatedAt: '2026-10-19T10:03:00.000Z',
    },
] satisfies readonly Document[];

export const mockKnowledgeBaseCards: readonly KnowledgeBaseCardView[] =
    mockKnowledgeBases.map((knowledgeBase) => ({
        ...knowledgeBase,
        documentCount: mockDocuments.filter(
            (document) => document.knowledgeBaseId === knowledgeBase.id,
        ).length,
        memberCount: mockKnowledgeBaseMembers.filter(
            (member) => member.knowledgeBaseId === knowledgeBase.id,
        ).length,
    }));

export const mockConversations = [
    {
        id: ids.conversations.productQna,
        knowledgeBaseId: ids.knowledgeBases.product,
        userId: ids.users.current,
        title: 'What are the Q4 product priorities?',
        createdAt: '2026-10-26T16:00:00.000Z',
        updatedAt: '2026-10-26T16:01:00.000Z',
        messages: [
            {
                id: '11d59ac7-7af6-4f4b-ac47-352bdac77d8f',
                conversationId: ids.conversations.productQna,
                role: 'USER',
                content: 'What are the main Q4 product priorities?',
                createdAt: '2026-10-26T16:00:00.000Z',
                sources: [],
            },
            {
                id: 'f6507c3b-7b67-4c17-b41a-c8f0bff8d8a1',
                conversationId: ids.conversations.productQna,
                role: 'ASSISTANT',
                content:
                    'The Product Handbook describes Q4 priorities as improving first-session onboarding, making document search faster, and expanding workspace controls.',
                createdAt: '2026-10-26T16:01:00.000Z',
                sources: [
                    {
                        documentId: ids.documents.handbook,
                        excerpt:
                            'Q4 focus areas include onboarding, document discovery, and workspace administration.',
                        pageNumber: 8,
                    },
                ],
            },
        ],
    },
    {
        id: ids.conversations.researchSynthesis,
        knowledgeBaseId: ids.knowledgeBases.research,
        userId: ids.users.current,
        title: 'Common customer feedback themes',
        createdAt: '2026-10-24T17:00:00.000Z',
        updatedAt: '2026-10-24T17:02:00.000Z',
        messages: [
            {
                id: '6910f076-aedc-4919-9533-45bb78849bd0',
                conversationId: ids.conversations.researchSynthesis,
                role: 'USER',
                content: 'What friction points came up most often in October interviews?',
                createdAt: '2026-10-24T17:00:00.000Z',
                sources: [],
            },
            {
                id: '4ace0da9-c6b6-44d7-8fb4-22fc8e3f8f6c',
                conversationId: ids.conversations.researchSynthesis,
                role: 'ASSISTANT',
                content:
                    'Participants most often mentioned difficulty locating the latest approved document and uncertainty about whether a long upload was still processing.',
                createdAt: '2026-10-24T17:02:00.000Z',
                sources: [
                    {
                        documentId: ids.documents.interviews,
                        excerpt:
                            'Several participants asked for clearer version cues and a visible processing state after upload.',
                        pageNumber: 4,
                    },
                ],
            },
        ],
    },
] satisfies readonly ChatConversation[];

const documentsByDate = [...mockDocuments].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
);

export const mockDashboardSummary: DashboardSummary = {
    knowledgeBaseCount: mockKnowledgeBases.length,
    documentCount: mockDocuments.length,
    documentsByStatus: {
        PENDING: mockDocuments.filter((document) => document.status === 'PENDING').length,
        PROCESSING: mockDocuments.filter((document) => document.status === 'PROCESSING').length,
        COMPLETED: mockDocuments.filter((document) => document.status === 'COMPLETED').length,
        FAILED: mockDocuments.filter((document) => document.status === 'FAILED').length,
    },
    recentDocumentIds: documentsByDate.slice(0, 5).map((document) => document.id),
};
