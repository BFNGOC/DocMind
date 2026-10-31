"use client";

import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FilterOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Progress,
  Select,
  Table,
  Tabs,
  Tag,
  Upload,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Document } from "@/features/documents/types/document.types";
import type { KnowledgeBaseMemberRole } from "@/features/knowledge-bases/types/knowledge-base.types";
import {
  mockConversations,
  mockDocuments,
  mockKnowledgeBaseCards,
  mockKnowledgeBaseMemberViews,
  mockKnowledgeBases,
} from "@/mocks";
import { AppShell, DemoNotice } from "@/shared/components/AppShell";
import { formatDateTime, formatFileSize } from "@/shared/utils/format";

const statusNames = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã hoàn tất",
  FAILED: "Thất bại",
} as const;

const roleNames: Record<KnowledgeBaseMemberRole, string> = {
  OWNER: "Chủ sở hữu",
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên",
  VIEWER: "Người xem",
};

const statusStyles = {
  PENDING: "status-pending",
  PROCESSING: "status-processing",
  COMPLETED: "status-completed",
  FAILED: "status-failed",
} as const;

function documentIcon(mimeType: string) {
  if (mimeType === "application/pdf") {
    return <FilePdfOutlined />;
  }

  if (mimeType === "text/markdown") {
    return <FileMarkdownOutlined />;
  }

  return <FileTextOutlined />;
}

export default function KnowledgeBaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const base = mockKnowledgeBases.find((item) => item.id === id);
  const baseSummary = mockKnowledgeBaseCards.find((item) => item.id === id);
  const [activeTab, setActiveTab] = useState("documents");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [messageApi, contextHolder] = message.useMessage();

  const documents = useMemo(
    () =>
      mockDocuments.filter(
        (document) =>
          document.knowledgeBaseId === id &&
          (statusFilter === "ALL" || document.status === statusFilter) &&
          document.name
            .toLocaleLowerCase("vi")
            .includes(search.trim().toLocaleLowerCase("vi")),
      ),
    [id, search, statusFilter],
  );
  const members = mockKnowledgeBaseMemberViews.filter(
    (member) => member.knowledgeBaseId === id,
  );

  if (!base) {
    return (
      <AppShell breadcrumb="Kho tri thức">
        <Card className="not-found-card">
          <Empty description="Không tìm thấy kho tri thức này">
            <Button href="/knowledge-bases">Quay lại danh sách kho</Button>
          </Empty>
        </Card>
      </AppShell>
    );
  }

  const columns: TableColumnsType<Document> = [
    {
      title: "TÊN TÀI LIỆU",
      dataIndex: "name",
      key: "name",
      render: (_name, document) => (
        <div className="file-name">
          <span
            className={`file-type-icon ${document.status === "FAILED" ? "file-error" : ""}`}
          >
            {document.status === "FAILED" ? (
              <WarningOutlined />
            ) : (
              documentIcon(document.mimeType)
            )}
          </span>
          <span>
            <strong>{document.name}</strong>
            <small>{document.mimeType}</small>
          </span>
        </div>
      ),
    },
    {
      title: "DUNG LƯỢNG",
      dataIndex: "fileSize",
      key: "fileSize",
      render: (size: string) => formatFileSize(size),
      sorter: (a, b) => Number(a.fileSize) - Number(b.fileSize),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: Document["status"], document) => (
        <Tag
          className={`status-tag ${statusStyles[status]}`}
          title={document.errorMessage ?? undefined}
        >
          {statusNames[status]}
        </Tag>
      ),
    },
    {
      title: "NGÀY TẢI LÊN",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      render: (_value, document) => (
        <Button
          aria-label={`Xem ${document.name}`}
          icon={<EyeOutlined />}
          onClick={() => setSelectedDocument(document)}
          type="text"
        />
      ),
    },
  ];

  function showUploadFeedback() {
    messageApi.info(
      "Tải tệp chỉ là minh họa trong bản demo; chưa gửi lên máy chủ.",
    );
    return Upload.LIST_IGNORE;
  }

  return (
    <AppShell breadcrumb={base.name}>
      {contextHolder}
      <div className="detail-breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span>/</span>
        <Link href="/knowledge-bases">Kho tri thức</Link>
        <span>/</span>
        <strong>{base.name}</strong>
      </div>
      <section className="detail-heading">
        <div className="detail-title">
          <h1>{base.name}</h1>
          <div className="detail-subline">
            <Tag>
              <DatabaseOutlined /> Không gian tri thức
            </Tag>
            <Tag className="index-state">
              <CheckCircleFilled /> Vector Index đang hoạt động (demo)
            </Tag>
          </div>
          <p>{base.description || "Chưa có mô tả cho kho tri thức này."}</p>
          <div className="detail-stats">
            <span>
              <FileTextOutlined /> {baseSummary?.documentCount ?? 0} tài liệu
            </span>
            <span>
              <DatabaseOutlined />{" "}
              {formatFileSize(
                String(
                  documents.reduce((sum, doc) => sum + Number(doc.fileSize), 0),
                ),
              )}{" "}
              dữ liệu mẫu
            </span>
            <span>
              <TeamOutlined /> {members.length} thành viên
            </span>
            <span>
              <ClockCircleOutlined /> Cập nhật {formatDateTime(base.updatedAt)}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <Button icon={<SettingOutlined />}>Cài đặt kho</Button>
          <Upload
            accept=".pdf,.doc,.docx,.txt,.md,.xml"
            beforeUpload={showUploadFeedback}
            showUploadList={false}
          >
            <Button icon={<PlusOutlined />}>Tải lên tài liệu</Button>
          </Upload>
          <Button
            icon={<RobotOutlined />}
            type="primary"
            href={`/chat?kb=${base.id}`}
          >
            Hỏi đáp AI với kho này
          </Button>
        </div>
      </section>
      <div className="detail-demo-banner">
        <DemoNotice />
        <span>
          Các chỉ số lập chỉ mục và vector bên dưới là nội dung minh họa, không
          phải kết quả xử lý thực.
        </span>
      </div>
      <Card className="detail-tabs-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "documents",
              label: (
                <span>
                  <FileTextOutlined /> Tài liệu{" "}
                  <Tag>{baseSummary?.documentCount ?? 0}</Tag>
                </span>
              ),
            },
            {
              key: "members",
              label: (
                <span>
                  <TeamOutlined /> Thành viên &amp; phân quyền{" "}
                  <Tag>{members.length}</Tag>
                </span>
              ),
            },
            {
              key: "history",
              label: (
                <span>
                  <HistoryOutlined /> Lịch sử hỏi đáp AI
                </span>
              ),
            },
            {
              key: "vectors",
              label: (
                <span>
                  <ThunderboltOutlined /> Chỉ số Vector &amp; Chunk
                </span>
              ),
            },
          ]}
        />
        {activeTab === "documents" && (
          <div className="detail-tab-content">
            <div className="upload-dropzone">
              <span className="upload-cloud">
                <CloudUploadOutlined />
              </span>
              <strong>
                Kéo thả tài liệu vào đây hoặc{" "}
                <Upload
                  accept=".pdf,.doc,.docx,.txt,.md,.xml"
                  beforeUpload={showUploadFeedback}
                  showUploadList={false}
                >
                  <button className="inline-button" type="button">
                    nhấp để duyệt tệp từ máy
                  </button>
                </Upload>
              </strong>
              <p>
                Hỗ trợ PDF, DOCX, TXT, Markdown (.md), bảng tính XML. Tệp được
                chọn sẽ không tải lên trong bản demo.
              </p>
              <div>
                <Tag color="green">
                  <CheckCircleFilled /> Mã hóa AES-256
                </Tag>
                <Tag color="blue">
                  <ThunderboltOutlined /> Trích xuất tự động
                </Tag>
                <Tag color="gold">
                  <InfoCircleOutlined /> Chunking minh họa
                </Tag>
              </div>
            </div>
            <div className="document-filters">
              <Input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên tài liệu..."
                prefix={<SearchOutlined />}
                value={search}
              />
              <Select
                aria-label="Lọc trạng thái"
                onChange={setStatusFilter}
                options={[
                  { label: "Tất cả trạng thái", value: "ALL" },
                  { label: "Đã hoàn tất", value: "COMPLETED" },
                  { label: "Đang xử lý", value: "PROCESSING" },
                  { label: "Chờ xử lý", value: "PENDING" },
                  { label: "Thất bại", value: "FAILED" },
                ]}
                value={statusFilter}
              />
              <Button icon={<FilterOutlined />}>Bộ lọc</Button>
              <Button
                aria-label="Làm mới danh sách"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  messageApi.info("Xuất báo cáo chưa khả dụng trong bản demo.")
                }
              >
                Xuất báo cáo
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={documents}
              locale={{
                emptyText: <Empty description="Chưa có tài liệu phù hợp" />,
              }}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `Hiển thị ${total} tài liệu`,
              }}
              rowKey="id"
              scroll={{ x: 760 }}
              size="middle"
            />
          </div>
        )}
        {activeTab === "members" && (
          <div className="detail-tab-content">
            <div className="tab-toolbar">
              <div>
                <h2>Thành viên trong kho</h2>
                <p>Vai trò được hiển thị từ dữ liệu mock.</p>
              </div>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() =>
                  messageApi.info("Mời thành viên chưa kết nối backend.")
                }
              >
                Mời thành viên
              </Button>
            </div>
            {members.length === 0 ? (
              <Empty description="Chưa có thành viên" />
            ) : (
              <div className="member-list">
                {members.map((member) => (
                  <div className="member-row" key={member.id}>
                    <Avatar>{member.user.name.slice(0, 1)}</Avatar>
                    <div className="member-identity">
                      <strong>{member.user.name}</strong>
                      <span>{member.user.email}</span>
                    </div>
                    <Tag>{roleNames[member.role]}</Tag>
                    <span className="member-date">
                      {formatDateTime(member.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "history" && (
          <div className="detail-tab-content">
            <div className="tab-toolbar">
              <div>
                <h2>Lịch sử hỏi đáp</h2>
                <p>Các cuộc hội thoại mẫu liên quan đến kho này.</p>
              </div>
              <Button href={`/chat?kb=${base.id}`} icon={<RobotOutlined />}>
                Mở Hỏi đáp AI
              </Button>
            </div>
            {mockConversationsForBase(id).length ? (
              mockConversationsForBase(id).map((conversation) => (
                <Link
                  className="history-row"
                  href={`/chat?kb=${base.id}`}
                  key={conversation.id}
                >
                  <span className="history-icon">
                    <RobotOutlined />
                  </span>
                  <span>
                    <strong>{conversation.title}</strong>
                    <small>
                      Cập nhật {formatDateTime(conversation.updatedAt)} ·{" "}
                      {conversation.messages.length} tin nhắn
                    </small>
                  </span>
                  <span>{conversation.messages.length} lượt</span>
                </Link>
              ))
            ) : (
              <Empty description="Chưa có hội thoại mẫu cho kho này" />
            )}
          </div>
        )}
        {activeTab === "vectors" && (
          <div className="detail-tab-content vector-content">
            <Alert
              message="Bảng điều khiển minh họa"
              description="Thông tin vector và chunk không được backend hiện tại cung cấp; các con số sau chỉ phục vụ trình bày thiết kế."
              showIcon
              type="info"
            />
            <div className="vector-summary">
              <Card>
                <span>VECTOR INDEX</span>
                <strong>99.8%</strong>
                <Progress percent={99.8} showInfo={false} />
                <small>Chỉ số minh họa</small>
              </Card>
              <Card>
                <span>THỜI GIAN TRUY VẤN</span>
                <strong>42 ms</strong>
                <small>Giá trị mẫu, không phải đo thực tế</small>
              </Card>
              <Card>
                <span>CHUNK KÍCH THƯỚC</span>
                <strong>512 tokens</strong>
                <small>Overlap mẫu: 64 tokens</small>
              </Card>
            </div>
          </div>
        )}
      </Card>
      <Card className="detail-bottom-card">
        <div>
          <CheckCircleFilled />
          <span>
            <strong>
              {mockKnowledgeBaseCards.find((item) => item.id === base.id)
                ?.documentCount ?? 0}{" "}
              tài liệu trong bộ dữ liệu
            </strong>
            <small>Trạng thái hiển thị dựa trên fixture tĩnh.</small>
          </span>
        </div>
        <Button icon={<UserOutlined />} onClick={() => setActiveTab("members")}>
          {members.length} thành viên
        </Button>
        <Button icon={<RobotOutlined />} href={`/chat?kb=${base.id}`}>
          Mở hỏi đáp
        </Button>
      </Card>
      <Modal
        footer={
          <Button type="primary" onClick={() => setSelectedDocument(null)}>
            Đóng
          </Button>
        }
        onCancel={() => setSelectedDocument(null)}
        open={Boolean(selectedDocument)}
        title="Chi tiết tài liệu"
      >
        {selectedDocument && (
          <div className="document-detail-modal">
            <span className="file-type-icon">
              {documentIcon(selectedDocument.mimeType)}
            </span>
            <strong>{selectedDocument.name}</strong>
            <p>
              {selectedDocument.mimeType} ·{" "}
              {formatFileSize(selectedDocument.fileSize)}
            </p>
            <p>
              Trạng thái:{" "}
              <Tag
                className={`status-tag ${statusStyles[selectedDocument.status]}`}
              >
                {statusNames[selectedDocument.status]}
              </Tag>
            </p>
            {selectedDocument.errorMessage && (
              <Alert
                message={selectedDocument.errorMessage}
                showIcon
                type="error"
              />
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

function mockConversationsForBase(knowledgeBaseId: string) {
  return mockConversations.filter(
    (conversation: (typeof mockConversations)[number]) =>
      conversation.knowledgeBaseId === knowledgeBaseId,
  );
}
