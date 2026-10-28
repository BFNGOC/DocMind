'use client';

import {
    ArrowRightOutlined,
    FolderOpenOutlined,
    LockOutlined,
    MailOutlined,
    RobotOutlined,
    SafetyCertificateOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/user.types';

type AuthMode = 'login' | 'register';
type RegisterFormValues = RegisterRequest & { confirmPassword: string };

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

const passwordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
    {
        pattern: passwordPattern,
        message: 'Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt',
    },
];

export default function AuthPage({ mode }: { mode: AuthMode }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
    const [registerForm] = Form.useForm<RegisterFormValues>();
    const isRegister = mode === 'register';

    async function handleDemoSubmit() {
        setSubmissionMessage(null);
        setIsSubmitting(true);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        setIsSubmitting(false);
        setSubmissionMessage('Dịch vụ xác thực chưa được kết nối. Thông tin bạn nhập không được gửi hoặc lưu.');
    }

    return (
        <div className="auth-page">
            <header className="auth-header">
                <Link aria-label="DocMind - về trang chủ" className="auth-brand" href="/">
                    <span className="auth-brand-mark"><RobotOutlined /></span>
                    <span><strong>DocMind</strong><small>Enterprise AI Knowledge</small></span>
                </Link>
                <span className="auth-header-badge"><SafetyCertificateOutlined /> Không gian tri thức của bạn</span>
            </header>

            <main className="auth-main">
                <section aria-label={isRegister ? 'Tạo tài khoản DocMind' : 'Đăng nhập DocMind'} className="auth-card">
                    <aside className="auth-story">
                        <div>
                            <span className="auth-eyebrow"><RobotOutlined /> DOCMIND · AI KNOWLEDGE</span>
                            <h1>{isRegister ? 'Biến tri thức tĩnh thành sức mạnh hành động.' : 'Khơi mở tri thức tiềm ẩn trong tài liệu của bạn.'}</h1>
                            <p>
                                {isRegister
                                    ? 'Tập hợp tài liệu và khám phá thông tin trong một không gian làm việc thông minh.'
                                    : 'Đăng nhập để tiếp tục khám phá câu trả lời trong kho tri thức của bạn.'}
                            </p>
                        </div>
                        <div className="auth-benefits">
                            <div>
                                <span><FolderOpenOutlined /></span>
                                <div><strong>Kho tri thức tập trung</strong><small>Sắp xếp tài liệu theo đúng ngữ cảnh làm việc.</small></div>
                            </div>
                            <div>
                                <span><SearchOutlined /></span>
                                <div><strong>Tìm kiếm dễ dàng</strong><small>Tra cứu thông tin trong nội dung tài liệu.</small></div>
                            </div>
                            <div>
                                <span><RobotOutlined /></span>
                                <div><strong>Hỏi đáp cùng AI</strong><small>Khám phá câu trả lời từ kho tri thức của bạn.</small></div>
                            </div>
                        </div>
                        <div className="auth-story-note">
                            <SafetyCertificateOutlined />
                            <span><strong>Bắt đầu với DocMind</strong><small>Giao diện xác thực hiện đang ở chế độ demo.</small></span>
                        </div>
                    </aside>

                    <div className="auth-content">
                        <div className="auth-form-heading">
                            <span className="auth-mobile-eyebrow"><RobotOutlined /> DOCMIND</span>
                            <h2>{isRegister ? 'Tạo tài khoản DocMind' : 'Đăng nhập DocMind'}</h2>
                            <p>
                                {isRegister
                                    ? 'Tạo tài khoản để bắt đầu không gian tri thức của bạn.'
                                    : 'Chào mừng bạn quay trở lại. Đăng nhập để tiếp tục.'}
                            </p>
                        </div>

                        <Alert
                            className="auth-demo-alert"
                            showIcon
                            title="Bản demo · Chưa kết nối dịch vụ xác thực"
                            description="Biểu mẫu chỉ kiểm tra dữ liệu trên giao diện; thông tin sẽ không được gửi đến máy chủ."
                            type="info"
                        />

                        {submissionMessage && (
                            <Alert
                                className="auth-submit-alert"
                                showIcon
                                title="Chưa thể xác thực"
                                description={submissionMessage}
                                type="warning"
                            />
                        )}

                        {isRegister ? (
                            <Form<RegisterFormValues>
                                autoComplete="on"
                                className="auth-form"
                                form={registerForm}
                                layout="vertical"
                                onFinish={() => void handleDemoSubmit()}
                            >
                                <Form.Item
                                    label="Họ và tên"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ và tên' },
                                        {
                                            validator: (_, value: string | undefined) => (
                                                value?.trim()
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error('Họ và tên không được để trống'))
                                            ),
                                        },
                                    ]}
                                >
                                    <Input autoComplete="name" placeholder="Nguyễn Minh Anh" prefix={<UserOutlined />} />
                                </Form.Item>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không đúng định dạng' },
                                    ]}
                                >
                                    <Input autoComplete="email" placeholder="name@company.com" prefix={<MailOutlined />} />
                                </Form.Item>
                                <Form.Item label="Mật khẩu" name="password" rules={passwordRules}>
                                    <Input.Password
                                        autoComplete="new-password"
                                        placeholder="Ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                                        prefix={<LockOutlined />}
                                    />
                                </Form.Item>
                                <Form.Item
                                    dependencies={['password']}
                                    label="Xác nhận mật khẩu"
                                    name="confirmPassword"
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                        {
                                            validator: (_, value: string | undefined) => (
                                                !value || value === registerForm.getFieldValue('password')
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                                            ),
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        autoComplete="new-password"
                                        placeholder="Nhập lại mật khẩu"
                                        prefix={<LockOutlined />}
                                    />
                                </Form.Item>
                                <Button block className="auth-submit" htmlType="submit" loading={isSubmitting} type="primary">
                                    Tạo tài khoản <ArrowRightOutlined />
                                </Button>
                            </Form>
                        ) : (
                            <Form<LoginRequest>
                                autoComplete="on"
                                className="auth-form"
                                layout="vertical"
                                onFinish={() => void handleDemoSubmit()}
                            >
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không đúng định dạng' },
                                    ]}
                                >
                                    <Input autoComplete="email" placeholder="name@company.com" prefix={<MailOutlined />} />
                                </Form.Item>
                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                                >
                                    <Input.Password
                                        autoComplete="current-password"
                                        placeholder="Nhập mật khẩu"
                                        prefix={<LockOutlined />}
                                    />
                                </Form.Item>
                                <Button block className="auth-submit" htmlType="submit" loading={isSubmitting} type="primary">
                                    Đăng nhập <ArrowRightOutlined />
                                </Button>
                            </Form>
                        )}

                        <p className="auth-switch">
                            {isRegister ? 'Đã có tài khoản DocMind?' : 'Chưa có tài khoản DocMind?'}{' '}
                            <Link href={isRegister ? '/login' : '/register'}>
                                {isRegister ? 'Đăng nhập' : 'Tạo tài khoản'}
                            </Link>
                        </p>
                        <div className="auth-security-note"><SafetyCertificateOutlined /> Bảo mật thông tin · Không gửi dữ liệu trong bản demo</div>
                    </div>
                </section>
            </main>

            <footer className="auth-footer">
                <span><LockOutlined /> Không gian tri thức DocMind</span>
                <span>© 2026 DocMind</span>
            </footer>
        </div>
    );
}
