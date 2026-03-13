# 🚀 Premium POS Application v2

Một hệ thống Quản lý Bán hàng (Point of Sale) hiện đại, hiệu năng cao, được xây dựng với các công nghệ mới nhất trong hệ sinh thái Next.js. 

> [!NOTE]
> Dự án đã được refactor toàn diện sang kiến trúc lớp (Layered Architecture) và chuẩn hóa Server Actions để đảm bảo tính ổn định và bảo mật doanh nghiệp.

---

## ✨ Tính năng nổi bật

### 🖥️ POS Terminal & Bán hàng
- **Giao diện Modern UI**: Thiết kế tối giản, hỗ trợ Dark/Light mode, tối ưu cho màn hình cảm ứng.
- **Quản lý Giỏ hàng thông minh**: Thêm món nhanh, tùy chỉnh Options (Size, Topping), ghi chú riêng cho từng món.
- **Dining Options**: Linh hoạt giữa Ăn tại chỗ (Dine-in), Mang về (Take-away) và Giao hàng (Delivery).
- **Quản lý Bàn (Table Management)**: Theo dõi trạng thái bàn trực quan, hỗ trợ Đổi bàn và Gộp bàn.
- **Lưu tạm đơn hàng (Hold Orders)**: Xử lý nhiều đơn hàng cùng lúc mà không làm gián đoạn quy trình.

### 📦 Quản lý Kho & Sản phẩm
- **Inventory Control**: Theo dõi tồn kho thực tế, cảnh báo khi sắp hết hàng.
- **Giá vốn & Lợi nhuận**: Quản lý giá nhập (Cost Price) để tính toán biên lợi nhuận chính xác.
- **Media Support**: Tích hợp Cloudinary để quản lý hình ảnh sản phẩm chất lượng cao.

### 📊 Báo cáo & Phân tích
- **Real-time Dashboard**: Thống kê doanh thu, số lượng đơn hàng và sản phẩm bán chạy theo thời gian thực.
- **Báo cáo chi tiết**: Xuất dữ liệu kinh doanh phục vụ quản lý và kế toán.

---

## 🏗️ Kiến trúc Hệ thống (Layered Architecture)

Dự án tuân thủ nghiêm ngặt mô hình phân lớp để dễ dàng bảo trì và mở rộng:

1. **Client (Next.js App Router)**: 
   - Server Components cho hiệu năng tối ưu.
   - Client Components với Framer Motion cho trải nghiệm mượt mà.
   - Zustand cho quản lý State tập trung.

2. **Action Layer (Server Actions)**: 
   - Sử dụng mô hình **Safe Action** với Zod validation.
   - Xử lý lỗi tập trung, đảm bảo dữ liệu đầu vào luôn sạch.

3. **Service Layer**: 
   - Chứa logic nghiệp vụ (Business Logic).
   - Độc lập với hạ tầng, dễ dàng viết Unit Test.

4. **Repository Layer**: 
   - Đóng gói logic truy vấn dữ liệu.
   - Sử dụng **Prisma ORM** cho Type-safety tuyệt đối.

5. **Data Layer**: 
   - Database: PostgreSQL (Supabase / PgBouncer).
   - Storage: Cloudinary (Images).

---

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router)
- **UI/UX**: React 19, Tailwind CSS v4, Framer Motion, Lucide React
- **ORM**: Prisma v5 (PostgreSQL)
- **State Management**: Zustand
- **Validation**: Zod
- **External**: Cloudinary (Image Management)

---

## 🚦 Bắt đầu nhanh

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Môi trường
Tạo file `.env` từ `.env.example` và điền các thông tin:
```env
DATABASE_URL="postgres://..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 3. Khởi tạo Database
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Chạy Development Server
```bash
npm run dev
```

---

## 🛡️ Security & Quality Standards
- **Safe Actions**: Mọi thao tác ghi dữ liệu đều được kiểm chứng qua Zod.
- **Type Safety**: TypeScript được áp dụng 100% từ database đến giao diện.
- **RBAC**: Hỗ trợ phân quyền Admin và Nhân viên (Staff).

---
*Phát triển bởi Google Antigravity & [Your Name/Team]*
