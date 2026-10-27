'use client';

import {
    AppstoreOutlined,
    BellOutlined,
    BookOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
    RobotOutlined,
    SettingOutlined,
    MenuOutlined,
    PlusOutlined,
    SearchOutlined,
    HomeOutlined,
    DownOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Input, Tag } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { mockCurrentUser, mockDocuments } from '@/mocks';
import { formatFileSize } from '@/shared/utils/format';

const navigation = [
    { href: '/', label: 'Tổng quan', icon: <AppstoreOutlined /> },
    { href: '/knowledge-bases', label: 'Kho tri thức', icon: <BookOutlined /> },
    { href: '/knowledge-bases/75c258e7-35f2-487b-b7ad-28e5935384cd', label: 'Tài liệu', icon: <FileTextOutlined /> },
    { href: '/chat', label: 'Hỏi đáp AI', icon: <RobotOutlined /> },
];

export function AppShell({
    children,
    breadcrumb,
}: {
    children: React.ReactNode;
    breadcrumb: string;
}) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const totalBytes = mockDocuments.reduce((sum, document) => sum + Number(document.fileSize), 0);

    function isActive(href: string) {
        if (href === '/') {
            return pathname === '/';
        }

        if (href === '/knowledge-bases/75c258e7-35f2-487b-b7ad-28e5935384cd') {
            return pathname.startsWith('/knowledge-bases/');
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <div className="workspace">
            <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
                <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
                    <span className="brand-mark"><RobotOutlined /></span>
                    <span><strong>DocMind</strong><small>Enterprise AI Knowledge</small></span>
                </Link>
                <button className="workspace-switch" type="button">
                    <span className="workspace-mark"><AppstoreOutlined /></span>
                    <span><strong>Không gian làm việc</strong><small>Nhóm Nghiên cứu AI</small></span>
                    <DownOutlined />
                </button>
                <nav aria-label="Điều hướng chính" className="side-nav">
                    {navigation.map((item) => (
                        <Link
                            aria-current={isActive(item.href) ? 'page' : undefined}
                            className={`side-nav-link ${isActive(item.href) ? 'active' : ''}`}
                            href={item.href}
                            key={item.href}
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.icon}<span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="storage-card">
                        <div className="storage-row"><span>Dung lượng dữ liệu</span><strong>{formatFileSize(String(totalBytes))}</strong></div>
                        <div className="storage-track"><span style={{ width: '18%' }} /></div>
                        <small>Dữ liệu mock của không gian</small>
                    </div>
                    <a href="#help"><QuestionCircleOutlined /> Trợ giúp &amp; Hướng dẫn</a>
                    <a href="#settings"><SettingOutlined /> Cài đặt hệ thống</a>
                </div>
            </aside>
            {menuOpen && <button aria-label="Đóng menu" className="sidebar-scrim" onClick={() => setMenuOpen(false)} type="button" />}
            <div className="workspace-main">
                <header className="topbar">
                    <Button aria-label="Mở menu" className="mobile-menu" icon={<MenuOutlined />} onClick={() => setMenuOpen(!menuOpen)} />
                    <div className="breadcrumbs"><HomeOutlined /><span>/</span><span>Không gian làm việc</span><span>/</span><strong>{breadcrumb}</strong></div>
                    <div className="topbar-actions">
                        <Input aria-label="Tìm kiếm" className="global-search" placeholder="Tìm kiếm tài liệu, hỏi AI..." prefix={<SearchOutlined />} suffix={<kbd>Ctrl K</kbd>} />
                        <Button className="top-add" icon={<PlusOutlined />} type="primary" href="/knowledge-bases/75c258e7-35f2-487b-b7ad-28e5935384cd">Thêm tài liệu</Button>
                        <Button aria-label="Thông báo" className="notification-button" icon={<BellOutlined />} />
                        <div className="profile">
                            <Avatar>{mockCurrentUser.name.slice(0, 1)}</Avatar>
                            <span><strong>{mockCurrentUser.name}</strong><small>Thành viên nhóm</small></span>
                            <DownOutlined />
                        </div>
                    </div>
                </header>
                <main className="workspace-content">{children}</main>
            </div>
        </div>
    );
}

export function DemoNotice() {
    return (
        <Tag className="demo-notice" color="blue">
            Bản demo · dữ liệu chỉ lưu trong phiên
        </Tag>
    );
}
