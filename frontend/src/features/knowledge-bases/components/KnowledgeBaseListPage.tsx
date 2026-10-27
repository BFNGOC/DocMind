'use client';

import {
    BookOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    MoreOutlined,
    PlusOutlined,
    RobotOutlined,
    SearchOutlined,
    TeamOutlined,
    UnorderedListOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { Button, Card, Dropdown, Empty, Form, Input, Modal, Select, Tag, message } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { KnowledgeBase } from '@/features/knowledge-bases/types/knowledge-base.types';
import { mockKnowledgeBaseCards, mockKnowledgeBases } from '@/mocks';
import { AppShell, DemoNotice } from '@/shared/components/AppShell';
import { formatRelativeDate } from '@/shared/utils/format';

type KnowledgeBaseForm = Pick<KnowledgeBase, 'name' | 'description'>;
type FilterType = 'Tất cả' | 'Kỹ thuật' | 'Nghiên cứu' | 'Vận hành' | 'Sản phẩm';

const filters: FilterType[] = ['Tất cả', 'Kỹ thuật', 'Nghiên cứu', 'Vận hành', 'Sản phẩm'];
const categories: FilterType[] = ['Sản phẩm', 'Nghiên cứu', 'Vận hành'];
const demoIds = ['d221ec28-d40b-4555-b537-1339fa1d5aca', 'af5eef96-2c56-4839-9f88-1eb2ab98b8e3'];

export default function KnowledgeBaseListPage() {
    const [bases, setBases] = useState<KnowledgeBase[]>([...mockKnowledgeBases]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('Tất cả');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [editing, setEditing] = useState<KnowledgeBase | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm<KnowledgeBaseForm>();
    const [messageApi, contextHolder] = message.useMessage();

    const visibleBases = useMemo(() => {
        return bases
            .filter((base, index) => {
                const normalizedSearch = search.trim().toLocaleLowerCase('vi');
                const matchesSearch = !normalizedSearch
                    || base.name.toLocaleLowerCase('vi').includes(normalizedSearch)
                    || base.description?.toLocaleLowerCase('vi').includes(normalizedSearch);
                const category = categories[index % categories.length];

                return matchesSearch && (filter === 'Tất cả' || category === filter || filter === 'Kỹ thuật');
            })
            .sort((left, right) => {
                if (sortOrder === 'name') {
                    return left.name.localeCompare(right.name);
                }

                return sortOrder === 'newest'
                    ? right.createdAt.localeCompare(left.createdAt)
                    : left.createdAt.localeCompare(right.createdAt);
            });
    }, [bases, filter, search, sortOrder]);

    function showCreateModal() {
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    }

    function showEditModal(base: KnowledgeBase) {
        setEditing(base);
        form.setFieldsValue({ name: base.name, description: base.description ?? '' });
        setModalOpen(true);
    }

    function saveBase(values: KnowledgeBaseForm) {
        if (editing) {
            setBases((current) => current.map((base) =>
                base.id === editing.id
                    ? { ...base, ...values, updatedAt: new Date().toISOString() }
                    : base,
            ));
            messageApi.success('Đã cập nhật kho trong bản demo.');
        } else {
            const id = demoIds[bases.length - mockKnowledgeBases.length] ?? demoIds[demoIds.length - 1];
            setBases((current) => [...current, {
                id,
                name: values.name,
                description: values.description?.trim() || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }]);
            messageApi.success('Đã tạo kho trong bản demo.');
        }

        setModalOpen(false);
        form.resetFields();
    }

    function deleteBase(id: string) {
        setBases((current) => current.filter((base) => base.id !== id));
        messageApi.success('Đã xóa kho khỏi phiên demo hiện tại.');
    }

    function menuFor(base: KnowledgeBase): MenuProps {
        return {
            items: [
                { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined /> },
                { key: 'delete', label: 'Xóa kho', icon: <DeleteOutlined />, danger: true },
            ],
            onClick: ({ key }) => {
                if (key === 'edit') {
                    showEditModal(base);
                }
                if (key === 'delete') {
                    deleteBase(base.id);
                }
            },
        };
    }

    return (
        <AppShell breadcrumb="Kho tri thức">
            {contextHolder}
            <section className="kb-list-hero">
                <div className="page-title-line">
                    <span className="page-title-icon"><BookOutlined /></span>
                    <div><h1>Kho tri thức</h1><Tag>{bases.length} không gian</Tag></div>
                </div>
                <p>Quản lý các không gian tri thức chuyên biệt cho từng dự án, nghiên cứu hoặc tài liệu chuyên ngành của bạn.</p>
                <DemoNotice />
                <Button icon={<PlusOutlined />} type="primary" onClick={showCreateModal}>Tạo kho tri thức mới</Button>
            </section>
            <section className="kb-controls">
                <Input
                    aria-label="Tìm kho tri thức"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm kiếm theo tên hoặc mô tả kho tri thức..."
                    prefix={<SearchOutlined />}
                    value={search}
                />
                <div className="kb-control-row">
                    <div className="filter-pills" role="group" aria-label="Lọc danh mục">
                        {filters.map((item) => <Button className={filter === item ? 'selected' : ''} key={item} onClick={() => setFilter(item)}>{item}</Button>)}
                    </div>
                    <div className="sort-controls">
                        <span>Sắp xếp:</span>
                        <Select
                            aria-label="Sắp xếp kho tri thức"
                            onChange={setSortOrder}
                            options={[
                                { label: 'Mới nhất', value: 'newest' },
                                { label: 'Cũ nhất', value: 'oldest' },
                                { label: 'Tên A-Z', value: 'name' },
                            ]}
                            value={sortOrder}
                        />
                        <Button aria-label="Dạng lưới" className={view === 'grid' ? 'view-selected' : ''} icon={<AppstoreOutlined />} onClick={() => setView('grid')} />
                        <Button aria-label="Dạng danh sách" className={view === 'list' ? 'view-selected' : ''} icon={<UnorderedListOutlined />} onClick={() => setView('list')} />
                    </div>
                </div>
            </section>
            {visibleBases.length === 0 ? (
                <Card className="empty-card"><Empty description="Không tìm thấy kho tri thức"><Button type="primary" onClick={showCreateModal}>Tạo kho tri thức</Button></Empty></Card>
            ) : (
                <section className={`knowledge-grid ${view === 'list' ? 'knowledge-list' : ''}`}>
                    {visibleBases.map((base, index) => {
                        const originalIndex = bases.findIndex((item) => item.id === base.id);
                        const seeded = mockKnowledgeBaseCards.find((item) => item.id === base.id);
                        const category = categories[originalIndex % categories.length];

                        return (
                            <Card className="knowledge-card" key={base.id}>
                                <div className="knowledge-card-top">
                                    <span className={`kb-symbol tone-${index % 3}`}><BookOutlined /></span>
                                    <Tag className="index-state"><CheckOutlined /> Đã lập chỉ mục</Tag>
                                    <Dropdown menu={menuFor(base)} trigger={['click']}><Button aria-label={`Tùy chọn ${base.name}`} icon={<MoreOutlined />} type="text" /></Dropdown>
                                </div>
                                <Link className="knowledge-card-title" href={`/knowledge-bases/${base.id}`}>{base.name}</Link>
                                <p>{base.description || 'Chưa có mô tả cho kho tri thức này.'}</p>
                                <div className="tag-row"><Tag>{category}</Tag>{category === 'Sản phẩm' && <Tag>Kỹ thuật</Tag>}</div>
                                <div className="knowledge-card-meta">
                                    <span><FileTextOutlined /> <strong>{seeded?.documentCount ?? 0}</strong> tài liệu</span>
                                    <span><TeamOutlined /> {seeded?.memberCount ?? 0} thành viên</span>
                                </div>
                                <div className="knowledge-card-date"><ClockCircleOutlined /> Cập nhật {formatRelativeDate(base.updatedAt)}</div>
                                <div className="knowledge-card-actions">
                                    <Button icon={<RobotOutlined />} href={`/chat?kb=${base.id}`}>Hỏi đáp AI</Button>
                                    <Button href={`/knowledge-bases/${base.id}`}>Mở kho</Button>
                                </div>
                            </Card>
                        );
                    })}
                </section>
            )}
            <Modal
                okText={editing ? 'Lưu thay đổi' : 'Tạo kho'}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                open={modalOpen}
                title={editing ? 'Chỉnh sửa kho tri thức' : 'Tạo kho tri thức mới'}
            >
                <Form form={form} layout="vertical" onFinish={saveBase}>
                    <Form.Item label="Tên kho tri thức" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên kho.' }, { max: 100, message: 'Tên kho tối đa 100 ký tự.' }]}>
                        <Input autoFocus maxLength={100} placeholder="Ví dụ: Tài liệu sản phẩm" />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea maxLength={300} placeholder="Mô tả ngắn về nội dung kho..." rows={3} />
                    </Form.Item>
                    <p className="modal-demo-hint">Thay đổi chỉ tồn tại trong phiên demo này.</p>
                </Form>
            </Modal>
        </AppShell>
    );
}
