"use client";

import {
  ArrowRightOutlined,
  BookOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  RobotOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Card, Tag } from "antd";
import Link from "next/link";
import { AppShell, DemoNotice } from "@/shared/components/AppShell";
import {
  mockDashboardSummary,
  mockDocuments,
  mockKnowledgeBaseCards,
  mockUsers,
} from "@/mocks";
import { formatDateTime, formatFileSize } from "@/shared/utils/format";

const statusLabels = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã hoàn tất",
  FAILED: "Thất bại",
} as const;

const statusClass = {
  PENDING: "status-pending",
  PROCESSING: "status-processing",
  COMPLETED: "status-completed",
  FAILED: "status-failed",
} as const;

const recentDocuments = [...mockDocuments]
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .slice(0, 4);

const features = [
  {
    icon: <FolderOpenOutlined />,
    title: "Tài liệu dễ tìm",
    description:
      "Nhóm tài liệu theo kho tri thức và giữ mọi thứ trong đúng ngữ cảnh.",
  },
  {
    icon: <SearchOutlined />,
    title: "Tra cứu nhanh",
    description:
      "Tìm câu trả lời dựa trên nội dung tài liệu đã được lập chỉ mục.",
  },
  {
    icon: <SettingOutlined />,
    title: "Cộng tác rõ ràng",
    description:
      "Theo dõi thành viên và vai trò trong từng không gian làm việc.",
  },
];

export default function DashboardPage() {
  return (
    <AppShell breadcrumb="Tổng quan">
      <div className="page-intro dashboard-intro">
        <div>
          <DemoNotice />
          <h1>Xin chào, {mockUsers[0].name} 👋</h1>
          <p>
            Chào mừng quay trở lại DocMind. Dưới đây là tình trạng dữ liệu demo
            trong không gian làm việc của bạn.
          </p>
        </div>
        <Button icon={<PlusOutlined />} type="primary" href="/knowledge-bases">
          Tạo kho tri thức
        </Button>
      </div>
      <section aria-label="Tổng quan dữ liệu" className="metric-grid">
        <Card className="metric-card">
          <div className="metric-heading">
            <span>TỔNG SỐ KHO TRI THỨC</span>
            <span className="metric-icon purple">
              <FolderOpenOutlined />
            </span>
          </div>
          <strong className="metric-value">
            {mockDashboardSummary.knowledgeBaseCount}
          </strong>
          <div className="metric-foot">
            <span>{mockKnowledgeBaseCards.length} kho có dữ liệu mock</span>
            <Link href="/knowledge-bases">
              Chi tiết <ArrowRightOutlined />
            </Link>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-heading">
            <span>TÀI LIỆU ĐÃ LẬP CHỈ MỤC</span>
            <span className="metric-icon blue">
              <FileTextOutlined />
            </span>
          </div>
          <strong className="metric-value">
            {mockDashboardSummary.documentCount}
          </strong>
          <div className="metric-foot">
            <span>
              {mockDashboardSummary.documentsByStatus.COMPLETED} hoàn tất
            </span>
            <Link href="/knowledge-bases/75c258e7-35f2-487b-b7ad-28e5935384cd">
              Xem tài liệu
            </Link>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-heading">
            <span>TRẠNG THÁI XỬ LÝ</span>
            <span className="metric-icon green">
              <CheckCircleFilled />
            </span>
          </div>
          <strong className="metric-value">
            {mockDashboardSummary.documentsByStatus.COMPLETED}/
            {mockDashboardSummary.documentCount}
          </strong>
          <div className="metric-foot">
            <span>
              {mockDashboardSummary.documentsByStatus.PROCESSING} đang xử lý ·{" "}
              {mockDashboardSummary.documentsByStatus.FAILED} lỗi
            </span>
            <span className="metric-success">Từ dữ liệu mock</span>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-heading">
            <span>THÀNH VIÊN</span>
            <span className="metric-icon lavender">
              <BookOutlined />
            </span>
          </div>
          <strong className="metric-value">{mockUsers.length}</strong>
          <div className="metric-foot">
            <span>Người dùng trong bộ dữ liệu</span>
            <Link href="/knowledge-bases">Quản lý kho</Link>
          </div>
        </Card>
      </section>
      <Card className="insight-banner">
        <span className="insight-icon">
          <RobotOutlined />
        </span>
        <div>
          <strong>Mẹo nâng cao hiệu quả hỏi đáp AI</strong>
          <p>
            Chọn kho tri thức phù hợp để xem câu trả lời và nguồn tài liệu liên
            quan.
          </p>
        </div>
        <Link href="/chat">
          Khám phá hỏi đáp <ArrowRightOutlined />
        </Link>
      </Card>
      <div className="section-heading">
        <h2>
          <BookOutlined /> Kho tri thức truy cập gần đây
        </h2>
        <Link href="/knowledge-bases">
          Xem tất cả ({mockKnowledgeBaseCards.length}) <ArrowRightOutlined />
        </Link>
      </div>
      <section className="recent-kb-grid">
        {mockKnowledgeBaseCards.map((kb, index) => (
          <Card className="recent-kb-card" key={kb.id}>
            <div className={`kb-symbol tone-${index}`}>
              <BookOutlined />
            </div>
            <h3>{kb.name}</h3>
            <p>{kb.description ?? "Chưa có mô tả cho kho tri thức này."}</p>
            <div className="tag-row">
              <Tag>
                {index === 0
                  ? "Sản phẩm"
                  : index === 1
                    ? "Nghiên cứu"
                    : "Vận hành"}
              </Tag>
              <Tag>Không gian làm việc</Tag>
            </div>
            <div className="kb-card-meta">
              <span>
                <FileTextOutlined /> {kb.documentCount} tài liệu
              </span>
              <span>
                <ClockCircleOutlined /> {formatDateTime(kb.updatedAt)}
              </span>
            </div>
            <div className="kb-card-actions">
              <Button
                icon={<RobotOutlined />}
                type="primary"
                href={`/chat?kb=${kb.id}`}
              >
                Hỏi đáp AI
              </Button>
              <Button href={`/knowledge-bases/${kb.id}`}>Chi tiết</Button>
            </div>
          </Card>
        ))}
      </section>
      <div className="section-heading activity-heading">
        <h2>
          <FileTextOutlined /> Hoạt động tài liệu gần đây
        </h2>
        <Button icon={<SearchOutlined />} href="/knowledge-bases">
          Xem tất cả tài liệu
        </Button>
      </div>
      <Card className="activity-card">
        <div className="activity-table-wrap">
          <table className="activity-table">
            <thead>
              <tr>
                <th>TÊN TÀI LIỆU</th>
                <th>KHO TRI THỨC</th>
                <th>NGƯỜI TẢI LÊN</th>
                <th>TRẠNG THÁI</th>
                <th>THỜI GIAN</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentDocuments.map((document) => {
                const base = mockKnowledgeBaseCards.find(
                  (kb) => kb.id === document.knowledgeBaseId,
                );
                const user = mockUsers.find(
                  (item) => item.id === document.uploadedBy,
                );

                return (
                  <tr key={document.id}>
                    <td>
                      <span className="file-name">
                        <span className="file-type-icon">
                          <FileTextOutlined />
                        </span>
                        <span>
                          <strong>{document.name}</strong>
                          <small>
                            {formatFileSize(document.fileSize)} ·{" "}
                            {document.mimeType.split("/").pop()?.toUpperCase()}
                          </small>
                        </span>
                      </span>
                    </td>
                    <td>{base?.name}</td>
                    <td>{user?.name}</td>
                    <td>
                      <Tag
                        className={`status-tag ${statusClass[document.status]}`}
                      >
                        {statusLabels[document.status]}
                      </Tag>
                    </td>
                    <td>{formatDateTime(document.createdAt)}</td>
                    <td>
                      <Link
                        aria-label={`Xem ${document.name}`}
                        href={`/knowledge-bases/${document.knowledgeBaseId}`}
                      >
                        <ArrowRightOutlined />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          Hiển thị {recentDocuments.length} trong tổng số{" "}
          {mockDashboardSummary.documentCount} tài liệu mock
        </div>
      </Card>
      <section className="feature-strip">
        {features.map((feature) => (
          <div key={feature.title}>
            <span>{feature.icon}</span>
            <strong>{feature.title}</strong>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
