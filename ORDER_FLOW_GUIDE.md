# 🛒 Order Flow Implementation Guide

## Overview
Tài liệu này mô tả luồng tạo đơn hàng (Order) từ front-end đến backend, bao gồm việc Billing service tự động lắng nghe và tạo invoice.

---

## 📋 Flow Diagram

```
User (Front-end) 
  └─> Checkout Page
       └─> POST /api/orders (API Gateway)
            └─> Order-svc (gRPC)
                 └─> Create Order in DB
                 └─> Emit ORDER_CREATED event (Kafka) ✅
                      └─> Inventory-svc listens
                           └─> Reserve stock
                           └─> Emit INVENTORY_RESERVED ✅
                                └─> Billing-svc listens
                                     └─> Create Invoice (auto) ✅
                                     └─> Emit INVOICE_CREATED
                                          └─> Payment-svc listens (TODO)
```

---

## 🔧 Implementation Details

### 1. API Endpoint

**Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "billingAddress": "123 Main St, City, State 12345",
  "notes": "Please deliver before 5pm"
}
```

**Response:**
```json
{
  "order": {
    "id": 5,
    "orderNumber": "ORD-20251109-0005",
    "customerId": 1,
    "status": "pending",
    "subtotal": 199.98,
    "totalAmount": 199.98,
    "shippingAddress": "123 Main St, City, State 12345",
    "items": [
      {
        "id": 10,
        "productId": 1,
        "quantity": 2,
        "price": 99.99,
        "subtotal": 199.98
      }
    ],
    "createdAt": "2025-11-09T10:30:00Z",
    "updatedAt": "2025-11-09T10:30:00Z"
  }
}
```

---

### 2. Front-end Implementation

#### File Structure
```
front-end/src/
├── lib/api/
│   └── orders.ts         ✅ API functions
├── pages/
│   ├── Checkout/
│   │   └── index.tsx     ✅ Create order
│   └── MyOrders/
│       └── index.tsx     ✅ View orders
```

#### API Functions (`src/lib/api/orders.ts`)

```typescript
export const createOrder = async (data: {
  customerId: number;           // Backend expects number
  items: Array<{
    productId: number;
    quantity: number;
    price: number;              // NOT unitPrice!
    notes?: string;
  }>;
  notes?: string;
  shippingAddress: string;      // Required
  billingAddress?: string;
  shippingCost?: number;
  discount?: number;
}) => {
  const token = Cookies.get('token');
  if (!token) throw new Error('No token found');

  const res = await axios.post(`${API_BASE}/orders`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getOrdersByCustomer = async (
  customerId: string,
  params?: { page?: number; limit?: number }
) => {
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/orders/customer/${customerId}`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
```

#### Checkout Page (`src/pages/Checkout/index.tsx`)

**Key Points:**
1. ✅ Parse `customerId` to **number** (backend expects number, not string)
2. ✅ Use `price` field (NOT `unitPrice`)
3. ✅ Validate shipping address is required
4. ✅ Handle API errors properly
5. ✅ Clear cart after successful order

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Parse customerId to number
  const customerId = parseInt(currentUser.id);
  if (isNaN(customerId)) {
    throw new Error('Invalid customer ID');
  }

  // Create order with correct data structure
  const orderData = {
    customerId: customerId,              // number
    items: items.map((item) => ({
      productId: item.product.id,        // number
      quantity: item.quantity,
      price: item.product.price,         // "price" not "unitPrice"
    })),
    shippingAddress: formData.shippingAddress,
    billingAddress: formData.billingAddress || formData.shippingAddress,
    notes: 'Order placed via web checkout',
  };

  const response = await createOrder(orderData);
  const order = response.order || response;
  
  console.log('✅ Order created:', order.orderNumber);
  
  clearCart();
  navigate('/orders');
};
```

#### My Orders Page (`src/pages/MyOrders/index.tsx`)

**Key Points:**
1. ✅ Fetch orders by customer ID
2. ✅ Display order number, status, items, total
3. ✅ Handle different order statuses with colors
4. ✅ Show proper item prices (handle both `price` and `unitPrice` fields)

```tsx
useEffect(() => {
  const fetchOrders = async () => {
    const customerId = currentUser.id;
    const response = await getOrdersByCustomer(customerId);
    const orders = response.orders || response;
    setOrders(orders);
  };
  fetchOrders();
}, [currentUser]);
```

---

### 3. Backend Auto-Processing

#### Order Service
- ✅ Creates order in database
- ✅ Emits `ORDER_CREATED` event via Kafka

#### Inventory Service
- ✅ Listens to `ORDER_CREATED` event
- ✅ Reserves stock for each item
- ✅ Emits `INVENTORY_RESERVED` event

#### Billing Service
- ✅ Listens to `INVENTORY_RESERVED` event
- ✅ **Automatically creates invoice** (no manual call needed)
- ✅ Emits `INVOICE_CREATED` event

#### Payment Service (TODO)
- ⏳ Listens to `INVOICE_CREATED` event
- ⏳ Creates payment record
- ⏳ Generates VNPay payment URL

---

## 🎯 Testing Guide

### Prerequisites
```bash
# 1. Start services
cd c:\Users\vulin\Desktop\App\repo-root\bmms
docker-compose up -d postgres kafka redis

# 2. Start backend services
npm run start:dev order-svc
npm run start:dev api-gateway
npm run start:dev inventory-svc
npm run start:dev billing-svc
npm run start:dev payment-svc

# 3. Start frontend
cd c:\Users\vulin\Desktop\App\front-end
npm run dev
```

### Test Steps

1. **Login as Customer**
   - Go to http://localhost:5173/login
   - Login with existing customer account

2. **Browse Products**
   - Go to Products page
   - Add products to cart

3. **Checkout**
   - Go to Cart
   - Click "Proceed to Checkout"
   - Fill in shipping address (required)
   - Fill in billing address (optional)
   - Click "Place Order"

4. **Verify Order Created**
   - Check console logs: `✅ Order created: ORD-20251109-0005`
   - Navigate to My Orders page
   - See newly created order

5. **Verify Backend Processing**
   - Check Order-svc logs: `🚀 Emitting order.created event`
   - Check Inventory-svc logs: `📦 Received ORDER_CREATED, reserving stock`
   - Check Billing-svc logs: `💰 Auto-creating invoice for order`
   - Query database:
     ```sql
     -- Check order
     SELECT * FROM orders ORDER BY id DESC LIMIT 1;
     
     -- Check invoice (auto-created by billing-svc)
     SELECT * FROM invoices ORDER BY id DESC LIMIT 1;
     
     -- Check inventory reservation
     SELECT * FROM inventory WHERE id = 1; -- quantityReserved should increase
     ```

---

## ⚠️ Common Issues

### Issue 1: customerId type mismatch
**Error:** `customerId must be a number`

**Solution:** Parse string to number
```typescript
const customerId = parseInt(currentUser.id);
if (isNaN(customerId)) {
  throw new Error('Invalid customer ID');
}
```

### Issue 2: unitPrice vs price
**Error:** API validation fails

**Solution:** Use `price` field (not `unitPrice`)
```typescript
items: items.map((item) => ({
  productId: item.product.id,
  quantity: item.quantity,
  price: item.product.price,  // ✅ Correct
  // unitPrice: item.product.price,  // ❌ Wrong
}))
```

### Issue 3: Missing shipping address
**Error:** `shippingAddress is required`

**Solution:** Validate before submit
```typescript
if (!formData.shippingAddress.trim()) {
  setError('Shipping address is required');
  return;
}
```

### Issue 4: Invoice not created
**Problem:** Order created but no invoice

**Check:**
1. Kafka is running: `docker ps | grep kafka`
2. Billing-svc is running and connected to Kafka
3. Check billing-svc logs for errors
4. Check Kafka topic: `kafka-console-consumer --topic inventory.reserved`

---

## 🚀 Next Steps

### Payment Integration (TODO)
- [ ] Payment-svc listens to `INVOICE_CREATED`
- [ ] Generate VNPay payment URL
- [ ] Return payment URL to frontend
- [ ] Handle payment callback
- [ ] Emit `PAYMENT_SUCCESS` event

### Frontend Enhancements
- [ ] Add payment page
- [ ] Show invoice details
- [ ] Track order status updates
- [ ] Add order cancellation
- [ ] Email notifications

---

## 📊 Data Flow Summary

```
Front-end Checkout
  ↓
POST /api/orders
  ↓
Order-svc
  ├─ Create order (DB)
  ├─ Generate order number
  └─ Emit ORDER_CREATED (Kafka) ✅
       ↓
Inventory-svc (Listener)
  ├─ Reserve stock (DB)
  └─ Emit INVENTORY_RESERVED ✅
       ↓
Billing-svc (Listener) 
  ├─ Create invoice (DB) ✅
  └─ Emit INVOICE_CREATED ✅
       ↓
Payment-svc (Listener) ⏳
  ├─ Create payment record
  └─ Generate payment URL
```

---

## 📝 Notes

1. **No manual invoice creation needed** - Billing-svc automatically creates invoice when listening to `INVENTORY_RESERVED` event

2. **Order status flow:**
   - `pending` → Order created, waiting for inventory
   - `confirmed` → Inventory reserved
   - `processing` → Payment processing
   - `shipped` → Order shipped
   - `delivered` → Order delivered
   - `cancelled` → Order cancelled

3. **Invoice types:**
   - `onetime` - For retail orders (this flow)
   - `recurring` - For subscriptions

4. **Current limitations:**
   - No payment integration yet
   - No email notifications
   - No order tracking
   - No order cancellation from frontend

---

## 🔗 Related Files

**Front-end:**
- `src/lib/api/orders.ts` - API functions
- `src/pages/Checkout/index.tsx` - Create order
- `src/pages/MyOrders/index.tsx` - View orders
- `src/contexts/CartContext.tsx` - Cart state management

**Backend:**
- `apps/order/order-svc/src/order-svc.service.ts` - Order creation
- `apps/order/order-svc/src/order-svc.controller.ts` - gRPC methods
- `apps/inventory/inventory-svc/src/inventory.listener.ts` - Listen ORDER_CREATED
- `apps/finance/billing-svc/src/billing.listener.ts` - Listen INVENTORY_RESERVED
- `apps/finance/payment-svc/src/payment.listener.ts` - Listen INVOICE_CREATED

**Documentation:**
- `repo-root/bmms/E2E.md` - Complete E2E flow
- `front-end/SETUP.md` - Front-end setup guide
