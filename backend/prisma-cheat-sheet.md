# 📑 PRISMA CLI CHEAT SHEET - DỰ ÁN DOCMIND (PRISMA V7)

Tài liệu tổng hợp toàn bộ các câu lệnh Prisma phổ biến kèm chú thích chi tiết, đã được tối ưu hóa cho cấu hình file tùy chỉnh (`prisma7.config.ts`) của dự án.

---

## 🛠️ 1. Nhóm Lệnh Khởi Tạo & Đồng Bộ (Schema & Database)

### 🔹 Tạo File Migration và Cập nhật Database (Dùng nhiều nhất)

Khi bạn sửa đổi file `schema.prisma` (thêm bảng, thêm cột) và muốn áp dụng thay đổi đó vào database PostgreSQL trong Docker:

```bash
npx prisma migrate dev --name <ten_migration> --config prisma7.config.ts
```

- **Ví dụ:** `npx prisma migrate dev --name create_users --config prisma7.config.ts`
- **Chú thích:** Lệnh này sẽ tạo file SQL trong thư mục `migrations`, chạy cập nhật DB, và tự động gọi luôn lệnh `generate` để cập nhật code.

### 🔹 Sinh mã nguồn Prisma Client (Bắt buộc ở v7)

Biến các định nghĩa văn bản trong file schema thành code TypeScript/JavaScript nằm trong thư mục `src/generated/prisma`:

```bash
npx prisma generate --config prisma7.config.ts
```

- **Chú thích:** Cần chạy khi bạn vừa chạy `npm install` ở máy mới, hoặc khi có thay đổi ở file schema mà chưa muốn cập nhật database.

### 🔹 Kiểm tra cú pháp file Schema

Kiểm tra xem file `schema.prisma` có viết đúng cú pháp không mà không gây ảnh hưởng đến database:

```bash
npx prisma validate --config prisma7.config.ts
```

---

## 🗂️ 2. Nhóm Lệnh Đồng Bộ Ngược (Khi Database đã có sẵn bảng)

### 🔹 Cập nhật file Schema từ Database (Introspect)

Nếu bạn tự dùng giao diện Web (Adminer) để tạo bảng hoặc sửa cột, lệnh này sẽ kéo cấu trúc đó ngược trở lại vào file `schema.prisma`:

```bash
npx prisma db update --config prisma7.config.ts
```

_(Lưu ý: Đối với phiên bản CLI cũ, lệnh tương đương là `npx prisma db pull`)._

### 🔹 Ép cấu trúc file Schema lên thẳng Database (Xóa sạch data cũ)

Lấy cấu trúc trong file `schema.prisma` và đè thẳng lên database. **Cảnh báo: Lệnh này sẽ xóa sạch dữ liệu hiện tại trong DB!**

```bash
npx prisma db push --config prisma7.config.ts
```

- **Khi nào dùng:** Thường dùng khi làm prototype dự án thử nghiệm, cần thay đổi cấu trúc bảng liên tục một cách nhanh chóng mà không muốn sinh ra quá nhiều file history migration rác.

---

## 📊 3. Nhóm Lệnh Quản Trị & Dữ Liệu Giao Diện (UI)

### 🔹 Mở Giao diện Quản trị Database (Prisma Studio)

Mở trang web trực quan tại địa chỉ `http://localhost:5555` để xem, thêm, sửa, xóa dữ liệu:

```bash
npx prisma studio --config prisma7.config.ts
```

- **Mẹo tối ưu:** Thay vì gõ lệnh dài, hãy dùng phím tắt bạn đã cấu hình trong `package.json`:
  ```bash
  npm run db:ui
  ```

---

## ⚡ 4. Các phím tắt hữu ích khuyến khích cấu hình vào `package.json`

Để không phải gõ cờ `--config prisma7.config.ts` dài dòng mỗi lần chạy, bạn nên mở file `package.json` mục `"scripts"` và thêm sẵn các phím tắt sau:

```json
"scripts": {
  "db:migrate": "prisma migrate dev --config prisma7.config.ts",
  "db:gen": "prisma generate --config prisma7.config.ts",
  "db:ui": "prisma studio --config prisma7.config.ts",
  "db:validate": "prisma validate --config prisma7.config.ts",
  "db:seed": "tsx prisma/seed.ts"
}
```

**Cách dùng sau khi cấu hình:**

- Thay vì gõ lệnh dài, bạn chỉ cần gõ: `npm run db:migrate -- --name ten_file` hoặc `npm run db:gen`.
