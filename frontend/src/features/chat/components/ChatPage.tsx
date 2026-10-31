"use client";

import {
  CheckCircleOutlined,
  CopyOutlined,
  FileTextOutlined,
  PlusOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Input, Select, Tag, message } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  ChatConversation,
  ChatMessage,
} from "@/features/chat/types/chat.types";
import {
  mockConversations,
  mockCurrentUser,
  mockDocuments,
  mockKnowledgeBases,
} from "@/mocks";
import { AppShell } from "@/shared/components/AppShell";
import { formatRelativeDate } from "@/shared/utils/format";

const suggestions = [
  "Tóm tắt các điểm chính trong tài liệu",
  "Có những việc nào cần ưu tiên?",
  "So sánh các tài liệu gần đây",
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([
    ...mockConversations,
  ]);
  const [activeId, setActiveId] = useState<string>(
    mockConversations[0]?.id ?? "",
  );
  const [selectedBaseId, setSelectedBaseId] = useState<string>(
    mockConversations[0]?.knowledgeBaseId ?? mockKnowledgeBases[0].id,
  );
  const [question, setQuestion] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId,
  );
  const activeBase = mockKnowledgeBases.find(
    (base) =>
      base.id === (activeConversation?.knowledgeBaseId ?? selectedBaseId),
  );
  const availableDocuments = useMemo(
    () =>
      mockDocuments.filter(
        (document) =>
          document.knowledgeBaseId ===
            (activeConversation?.knowledgeBaseId ?? selectedBaseId) &&
          document.status === "COMPLETED",
      ),
    [activeConversation?.knowledgeBaseId, selectedBaseId],
  );

  function startConversation() {
    setActiveId("");
    setQuestion("");
  }

  function submitQuestion(value = question) {
    const content = value.trim();
    if (!content) {
      return;
    }

    const now = new Date().toISOString();
    const conversationId =
      activeConversation?.id ?? `demo-conversation-${conversations.length + 1}`;
    const source = availableDocuments[0];
    const userMessage: ChatMessage = {
      id: `demo-user-message-${conversations.reduce((sum, item) => sum + item.messages.length, 0) + 1}`,
      conversationId,
      role: "USER",
      content,
      createdAt: now,
      sources: [],
    };
    const answerText = source
      ? `Đây là câu trả lời minh họa dựa trên “${source.name}”. ${content.toLocaleLowerCase("vi").includes("tóm tắt") ? "Tài liệu tập trung vào các hướng dẫn chính và những điểm cần lưu ý." : "Hãy xem trích dẫn bên dưới để kiểm tra nội dung nguồn liên quan."}`
      : "Kho này chưa có tài liệu đã hoàn tất trong bộ dữ liệu mẫu để trích dẫn.";
    const assistantMessage: ChatMessage = {
      id: `demo-assistant-message-${conversations.reduce((sum, item) => sum + item.messages.length, 0) + 2}`,
      conversationId,
      role: "ASSISTANT",
      content: answerText,
      createdAt: now,
      sources: source
        ? [
            {
              documentId: source.id,
              excerpt: `Nguồn tham khảo: ${source.name}. Nội dung trích dẫn là ví dụ minh họa, không phải kết quả truy xuất thực.`,
              pageNumber: null,
            },
          ]
        : [],
    };

    if (activeConversation) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                updatedAt: now,
                messages: [
                  ...conversation.messages,
                  userMessage,
                  assistantMessage,
                ],
              }
            : conversation,
        ),
      );
    } else {
      const draft: ChatConversation = {
        id: conversationId,
        knowledgeBaseId: selectedBaseId,
        userId: mockCurrentUser.id,
        title: content.slice(0, 48),
        createdAt: now,
        updatedAt: now,
        messages: [userMessage, assistantMessage],
      };
      setConversations((current) => [draft, ...current]);
      setActiveId(conversationId);
    }

    setQuestion("");
  }

  function selectConversation(conversation: ChatConversation) {
    setActiveId(conversation.id);
    setSelectedBaseId(conversation.knowledgeBaseId);
  }

  const grouped = [
    {
      label: "HÔM NAY",
      entries: conversations.filter(
        (item) =>
          new Date(item.updatedAt).toDateString() === new Date().toDateString(),
      ),
    },
    {
      label: "GẦN ĐÂY",
      entries: conversations.filter(
        (item) =>
          new Date(item.updatedAt).toDateString() !== new Date().toDateString(),
      ),
    },
  ];

  return (
    <AppShell breadcrumb="Hỏi đáp AI">
      {contextHolder}
      <section className="chat-layout">
        <aside className="chat-history">
          <div className="chat-history-head">
            <div>
              <h1>Hỏi đáp AI</h1>
              <p>Hội thoại trong không gian làm việc</p>
            </div>
            <Button
              aria-label="Tạo hội thoại mới"
              icon={<PlusOutlined />}
              onClick={startConversation}
              type="primary"
            />
          </div>
          <Input
            placeholder="Tìm kiếm phiên thảo luận..."
            prefix={<SearchOutlined />}
          />
          <div className="chat-history-list">
            {grouped.map(
              (group) =>
                group.entries.length > 0 && (
                  <section key={group.label}>
                    <span className="history-group-label">
                      {group.label} <small>{group.entries.length} phiên</small>
                    </span>
                    {group.entries.map((conversation) => (
                      <button
                        className={`conversation-link ${activeId === conversation.id ? "selected" : ""}`}
                        key={conversation.id}
                        onClick={() => selectConversation(conversation)}
                        type="button"
                      >
                        <span className="conversation-symbol">
                          <FileTextOutlined />
                        </span>
                        <span>
                          <strong>{conversation.title}</strong>
                          <small>
                            {formatRelativeDate(conversation.updatedAt)} ·{" "}
                            {conversation.messages.length} tin nhắn
                          </small>
                        </span>
                      </button>
                    ))}
                  </section>
                ),
            )}
          </div>
          <div className="vector-cache">
            <span>
              <ThunderboltOutlined /> Vector Cache
            </span>
            <strong>Demo</strong>
          </div>
        </aside>
        <section className="chat-main">
          <div className="chat-toolbar">
            <Select
              aria-label="Chọn kho tri thức"
              onChange={(value) => {
                setSelectedBaseId(String(value));
                setActiveId("");
              }}
              options={mockKnowledgeBases.map((base) => ({
                label: base.name,
                value: base.id,
              }))}
              value={activeConversation?.knowledgeBaseId ?? selectedBaseId}
            />
            <div className="ai-ready">
              <span /> DocMind RAG · giao diện demo
            </div>
            <Button icon={<SettingOutlined />}>Cài đặt</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={startConversation}
            >
              Cuộc trò chuyện mới
            </Button>
          </div>
          <div className="chat-transcript">
            {activeConversation ? (
              activeConversation.messages.map((item) => (
                <article
                  className={`chat-message ${item.role === "USER" ? "chat-user" : "chat-assistant"}`}
                  key={item.id}
                >
                  <Avatar
                    className={
                      item.role === "USER"
                        ? "chat-avatar-user"
                        : "chat-avatar-ai"
                    }
                    icon={
                      item.role === "USER" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                  >
                    {item.role === "USER"
                      ? mockCurrentUser.name.slice(0, 1)
                      : undefined}
                  </Avatar>
                  <div className="chat-message-content">
                    <div className="chat-message-meta">
                      {item.role === "USER"
                        ? mockCurrentUser.name
                        : "DocMind Engine"}{" "}
                      <span>{formatRelativeDate(item.createdAt)}</span>
                      {item.role === "ASSISTANT" && <Tag>Trả lời mẫu</Tag>}
                    </div>
                    <Card className="chat-bubble">
                      <p>{item.content}</p>
                      {item.sources.length > 0 && (
                        <div className="source-list">
                          <strong>
                            <CheckCircleOutlined /> Tài liệu tham chiếu (minh
                            họa)
                          </strong>
                          {item.sources.map((source) => {
                            const document = mockDocuments.find(
                              (item) => item.id === source.documentId,
                            );
                            return (
                              <Link
                                className="source-card"
                                href={`/knowledge-bases/${activeConversation.knowledgeBaseId}`}
                                key={source.documentId}
                              >
                                <FileTextOutlined />
                                <span>
                                  <strong>
                                    {document?.name ?? "Tài liệu nguồn"}
                                  </strong>
                                  <small>{source.excerpt}</small>
                                </span>
                                <span className="source-confidence">
                                  Nguồn mẫu
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      {item.role === "ASSISTANT" && (
                        <div className="answer-actions">
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() => {
                              void navigator.clipboard?.writeText(item.content);
                              messageApi.success("Đã sao chép câu trả lời.");
                            }}
                            size="small"
                          >
                            Sao chép
                          </Button>
                          <span>
                            Được tạo từ nội dung mock · Không có truy vấn AI
                            thật
                          </span>
                        </div>
                      )}
                    </Card>
                  </div>
                </article>
              ))
            ) : (
              <div className="chat-empty-state">
                <span>
                  <RobotOutlined />
                </span>
                <h2>Hỏi về tài liệu của bạn</h2>
                <p>
                  {activeBase?.name ?? "Chọn một kho tri thức"} · Nội dung trả
                  lời chỉ là mô phỏng giao diện.
                </p>
                <div>
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      onClick={() => submitQuestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {activeConversation && (
            <div className="quick-prompts">
              {suggestions.map((item) => (
                <Button key={item} onClick={() => submitQuestion(item)}>
                  {item}
                </Button>
              ))}
            </div>
          )}
          <div className="chat-composer">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 5 }}
              onChange={(event) => setQuestion(event.target.value)}
              onPressEnter={(event) => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  submitQuestion();
                }
              }}
              placeholder="Đặt câu hỏi về tài liệu trong kho này (Shift + Enter để xuống dòng)..."
              value={question}
            />
            <div className="composer-footer">
              <span>
                <FileTextOutlined /> {availableDocuments.length} tài liệu hoàn
                tất trong kho
              </span>
              <span>AI Demo · Không gửi dữ liệu</span>
              <Button
                disabled={!question.trim()}
                icon={<SendOutlined />}
                onClick={() => submitQuestion()}
                type="primary"
              >
                Hỏi AI
              </Button>
            </div>
          </div>
          <p className="chat-disclaimer">
            Câu trả lời minh họa chỉ phục vụ xem trước giao diện. Không có nội
            dung nào được gửi tới mô hình AI.
          </p>
        </section>
      </section>
    </AppShell>
  );
}
