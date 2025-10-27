# Demo Mode - Hướng dẫn sử dụng

## 🎯 Chế độ hiện tại: DEMO MODE

Ứng dụng hiện đang chạy với **mock data** (dữ liệu giả) để demo. Tất cả các API calls đã được comment lại.

## ✨ Tính năng Demo

### Dữ liệu mẫu bao gồm:

**Sản phẩm (Products):**
- 6 sản phẩm mẫu (Laptop, iPhone, Headphones, Monitor, Mouse, iPad)
- Có đầy đủ thông tin: tên, giá, mô tả, tồn kho
- Hình ảnh placeholder

**Gói Subscription:**
- 4 gói: Basic, Pro, Enterprise, Pro Yearly
- Có feature list chi tiết
- Giá từ $9.99 - $99.99/tháng

### Lưu trữ dữ liệu:
- **LocalStorage** được dùng để lưu:
  - Giỏ hàng (cart)
  - Đơn hàng đã đặt (demoOrders)
  - Subscription đã đăng ký (demoSubscriptions)

## 🚀 Cách sử dụng Demo

### 1. Chạy ứng dụng
```powershell
npm run dev
```

### 2. Test các chức năng:

#### **Mua hàng (Retail Flow):**
1. Vào `/products` - Xem danh sách sản phẩm
2. Click vào sản phẩm để xem chi tiết
3. Thêm vào giỏ hàng
4. Vào `/cart` - Chỉnh số lượng
5. Click "Proceed to Checkout"
6. Điền form và đặt hàng
7. Vào `/orders` để xem đơn hàng vừa tạo

#### **Đăng ký gói (Subscription Flow):**
1. Vào `/plans` - Xem các gói
2. Click "Subscribe Now" trên gói bất kỳ
3. Điền thông tin thanh toán
4. Subscribe
5. Vào `/my-subscriptions` để xem gói đã đăng ký

### 3. Xóa dữ liệu demo:
Mở DevTools (F12) và chạy:
```javascript
localStorage.removeItem('cart');
localStorage.removeItem('demoOrders');
localStorage.removeItem('demoSubscriptions');
```

## 🔄 Chuyển sang chế độ API thật

Khi backend đã sẵn sàng, làm theo các bước sau:

### 1. Cấu hình .env
```env
VITE_API_BASE=http://localhost:3000
```

### 2. Uncomment API calls trong các file:

**Products Page** (`src/pages/Products/index.tsx`):
```typescript
// Bỏ comment dòng này:
// const data = await getAllProducts();
// setProducts(data.products || data);

// Xóa phần mock data
```

**ProductDetail Page** (`src/pages/ProductDetail/index.tsx`):
```typescript
// Bỏ comment:
// const data = await getProductById(Number(id));
// setProduct(data.product || data);
```

**Checkout Page** (`src/pages/Checkout\index.tsx`):
```typescript
// Bỏ comment toàn bộ block API call:
/*
const orderData = { ... };
const orderResponse = await createOrder(orderData);
...
*/
```

**My Orders Page** (`src/pages/MyOrders/index.tsx`):
```typescript
// Bỏ comment:
// const data = await getOrdersByCustomer(currentUser.id || currentUser.email);
// setOrders(data.orders || data);
```

**Subscription Plans** (`src/pages/SubscriptionPlans/index.tsx`):
```typescript
// Bỏ comment:
// const data = await getAllPlans();
// setPlans(data.plans || data);
```

**Subscribe Page** (`src/pages/Subscribe/index.tsx`):
```typescript
// Bỏ comment API calls cho getPlanById và initiatePayment
```

**My Subscriptions** (`src/pages/MySubscriptions/index.tsx`):
```typescript
// Bỏ comment và implement API call cho getSubscriptionsByCustomer
```

### 3. Bật lại imports:
Trong mỗi file, uncomment các import functions:
```typescript
// Từ:
// import { getAllProducts } from '@/lib/api/products';

// Thành:
import { getAllProducts } from '@/lib/api/products';
```

### 4. Xóa mock data code:
Sau khi uncomment API calls, xóa các đoạn mock data (array mockProducts, mockPlans, etc.)

## 📝 Checklist chuyển đổi

- [ ] Backend API đang chạy
- [ ] Cập nhật VITE_API_BASE trong .env
- [ ] Uncomment imports trong các page files
- [ ] Uncomment API calls trong useEffect/handlers
- [ ] Xóa mock data arrays
- [ ] Test kỹ từng flow
- [ ] Xóa localStorage demo data

## 🐛 Troubleshooting Demo Mode

**Lỗi "No products/plans available":**
- Reload lại trang, mock data sẽ được load

**Giỏ hàng/Orders không hiển thị:**
- Check localStorage trong DevTools
- Clear cache và thử lại

**Subscription không lưu:**
- Đảm bảo đã login
- Check console log để debug

## 💡 Lưu ý

- Demo mode dùng setTimeout để giả lập API delay (500-1500ms)
- Dữ liệu chỉ tồn tại trong localStorage, clear browser sẽ mất hết
- Không có validation backend trong demo mode
- Payments chỉ giả lập, không kết nối payment gateway thật

Chúc demo vui vẻ! 🎉
