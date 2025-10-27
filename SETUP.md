# OctalTask - Business Management System Frontend

Frontend application cho hệ thống quản lý kinh doanh với 2 mô hình: **Retail** và **Subscription**.

## Tính năng

### 🛒 Retail (Bán lẻ)
- **Danh sách sản phẩm**: Xem tất cả sản phẩm có sẵn
- **Chi tiết sản phẩm**: Xem thông tin chi tiết, giá, tồn kho
- **Giỏ hàng**: Thêm, xóa, cập nhật số lượng sản phẩm
- **Thanh toán**: Đặt hàng với thông tin giao hàng và thanh toán
- **Đơn hàng của tôi**: Xem lịch sử và trạng thái đơn hàng

### 📋 Subscription (Đăng ký gói)
- **Danh sách gói**: Xem các gói subscription có sẵn
- **Chi tiết gói**: Xem tính năng, giá, chu kỳ thanh toán
- **Đăng ký**: Subscribe một gói với thanh toán
- **Quản lý subscription**: Xem và quản lý các gói đã đăng ký

### ✅ Quản lý công việc (Tasks)
- Tính năng task management có sẵn từ template gốc

## Công nghệ sử dụng

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **TailwindCSS** - Styling
- **Radix UI** - Component library
- **Axios** - HTTP client
- **Framer Motion** - Animations

## Cài đặt

### 1. Clone repository

```bash
cd octaltask
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Cập nhật `VITE_API_BASE` trong file `.env`:

```env
VITE_API_BASE=http://localhost:3000
```

> **Lưu ý**: Đảm bảo backend API đang chạy tại địa chỉ này.

### 4. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Cấu trúc thư mục

```
octaltask/
├── src/
│   ├── components/        # React components
│   │   ├── common/       # Shared components (Logo, Navbar, Footer)
│   │   ├── layout/       # Layout components (PageLayout, UserMenu)
│   │   ├── feature/      # Feature-specific components
│   │   └── ui/           # UI primitives (Button, Card, Input)
│   ├── contexts/         # React contexts
│   │   ├── UserContext.tsx
│   │   ├── CartContext.tsx
│   │   └── TaskContext.tsx
│   ├── lib/
│   │   └── api/          # API clients
│   │       ├── auth.ts
│   │       ├── products.ts
│   │       ├── plans.ts
│   │       ├── orders.ts
│   │       └── payments.ts
│   ├── pages/            # Page components
│   │   ├── Products/     # Product listing
│   │   ├── ProductDetail/
│   │   ├── Cart/         # Shopping cart
│   │   ├── Checkout/     # Checkout flow
│   │   ├── MyOrders/     # Order history
│   │   ├── SubscriptionPlans/
│   │   ├── Subscribe/
│   │   └── MySubscriptions/
│   ├── routes/           # Route definitions
│   ├── types/            # TypeScript types
│   └── App.tsx           # Root component
```

## API Endpoints được sử dụng

### Catalogue (Products & Plans)
- `GET /catalogue/products` - Lấy danh sách sản phẩm
- `GET /catalogue/products/:id` - Lấy chi tiết sản phẩm
- `GET /catalogue/plans` - Lấy danh sách gói subscription
- `GET /catalogue/plans/:id` - Lấy chi tiết gói

### Orders
- `POST /orders` - Tạo đơn hàng mới
- `GET /orders` - Lấy tất cả đơn hàng
- `GET /orders/:id` - Lấy chi tiết đơn hàng
- `GET /orders/customer/:customerId` - Lấy đơn hàng của khách hàng

### Payments
- `POST /payments/initiate` - Khởi tạo thanh toán
- `POST /payments/confirm` - Xác nhận thanh toán
- `GET /payments/:id` - Lấy chi tiết thanh toán

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/signup` - Đăng ký
- `GET /auth/me` - Lấy thông tin user hiện tại

## Scripts

```bash
# Development
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Hướng dẫn sử dụng

### 1. Đăng ký/Đăng nhập
- Truy cập `/signup` để tạo tài khoản
- Hoặc `/login` để đăng nhập

### 2. Mua hàng (Retail)
1. Vào `/products` để xem sản phẩm
2. Click vào sản phẩm để xem chi tiết
3. Thêm vào giỏ hàng
4. Vào `/cart` để xem giỏ hàng
5. Click "Proceed to Checkout"
6. Điền thông tin và hoàn tất đơn hàng
7. Xem đơn hàng tại `/orders`

### 3. Đăng ký gói (Subscription)
1. Vào `/plans` để xem các gói
2. Chọn gói phù hợp và click "Subscribe"
3. Điền thông tin thanh toán
4. Hoàn tất đăng ký
5. Xem subscription tại `/my-subscriptions`

## Kết nối với Backend

Đảm bảo backend (repo-root/bmms) đang chạy:

```bash
cd ../repo-root/bmms
npm install
# Start các services cần thiết (api-gateway, catalogue-svc, order-svc, payment-svc)
```

Xem hướng dẫn chi tiết trong `repo-root/bmms/README.md`

## Troubleshooting

### CORS errors
Đảm bảo backend API Gateway có cấu hình CORS cho phép origin từ frontend:
```typescript
// api-gateway/main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### API connection failed
- Kiểm tra `VITE_API_BASE` trong `.env`
- Kiểm tra backend đang chạy
- Kiểm tra network tab trong DevTools

## License

MIT
