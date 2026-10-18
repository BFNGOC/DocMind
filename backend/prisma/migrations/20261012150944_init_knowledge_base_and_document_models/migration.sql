-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "kb_member_role" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "message_role" AS ENUM ('USER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_members" (
    "id" UUID NOT NULL,
    "knowledge_base_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "kb_member_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "knowledge_base_id" UUID NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_hash" VARCHAR(64) NOT NULL,
    "status" "document_status" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "knowledge_base_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL DEFAULT 'New conversation',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" "message_role" NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "knowledge_base_id" UUID NOT NULL,
    "conversation_id" UUID,
    "model" VARCHAR(100) NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "estimated_cost" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_base_members_user_id_idx" ON "knowledge_base_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_members_knowledge_base_id_user_id_key" ON "knowledge_base_members"("knowledge_base_id", "user_id");

-- CreateIndex
CREATE INDEX "documents_knowledge_base_id_idx" ON "documents"("knowledge_base_id");

-- CreateIndex
CREATE INDEX "documents_knowledge_base_id_status_idx" ON "documents"("knowledge_base_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "documents_knowledge_base_id_file_hash_key" ON "documents"("knowledge_base_id", "file_hash");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunks_document_id_chunk_index_key" ON "document_chunks"("document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "conversations_knowledge_base_id_idx" ON "conversations"("knowledge_base_id");

-- CreateIndex
CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "conversations_knowledge_base_id_updated_at_idx" ON "conversations"("knowledge_base_id", "updated_at");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_user_id_created_at_idx" ON "ai_usage"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_knowledge_base_id_idx" ON "ai_usage"("knowledge_base_id");

-- CreateIndex
CREATE INDEX "ai_usage_conversation_id_idx" ON "ai_usage"("conversation_id");

-- AddForeignKey
ALTER TABLE "knowledge_base_members" ADD CONSTRAINT "knowledge_base_members_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_members" ADD CONSTRAINT "knowledge_base_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_knowledge_base_id_fkey" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
