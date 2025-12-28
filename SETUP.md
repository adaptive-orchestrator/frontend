# BMMS Frontend - Setup Guide

Frontend application cho hệ thống quản lý đa mô hình kinh doanh.

## Tính năng

### 🛒 Retail (Bán lẻ)
- Danh sách sản phẩm với inventory tracking
- Chi tiết sản phẩm, giá, tồn kho
- Giỏ hàng với quantity management
- Checkout với thanh toán
- Lịch sử đơn hàng

### 📅 Subscription (Đăng ký gói)
- Danh sách gói subscription với features
- So sánh các gói
- Đăng ký với trial period
- Quản lý subscription (renew, cancel, change plan)

### 🎁 Freemium (Miễn phí + Add-ons)
- Free tier với usage limits
- Mua add-ons (AI Assistant, Extra Storage, etc.)
- Dashboard với usage tracking
- Upgrade to subscription

### 👤 Authentication
- Login/Register với JWT
- Role-based access (customer, member, org_admin, super_admin)
- Password reset

### 🔧 Admin
- Dashboard với stats cho cả 3 models
- Quản lý Products, Plans, Add-ons
- Quản lý Customers, Orders
- Analytics & Reports

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router v6** - Routing
- **TailwindCSS** + **shadcn/ui** - Styling
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Context** - State management

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình môi trường

```bash
copy .env.example .env
```

Cập nhật `.env`:
```env
VITE_API_BASE=http://localhost:3000
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Lint code
```

## Kết nối Backend

Đảm bảo các services đang chạy:

```bash
cd ../repo-root/bmms
npm run start:gateway      # API Gateway (3000)
npm run start:auth         # Auth Service
npm run start:catalogue    # Catalogue Service
npm run start:order        # Order Service
npm run start:subscription # Subscription Service
npm run start:billing      # Billing Service
npm run start:payment      # Payment Service
```
