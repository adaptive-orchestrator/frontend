# 🧪 Hướng dẫn Test Mode - Demo Validation Errors

## 📋 Tổng quan

Tính năng **Test Mode** (ẩn) cho phép demo giao diện xử lý lỗi validation từ backend mà **KHÔNG GỌI API THẬT**. 

---

## 🎯 Tính năng

### 1. **Test Mode - Keyboard Shortcut**
- **Phím tắt: `Ctrl + Shift + D`** (D = Debug/Demo) để bật/tắt
- Hoàn toàn ẩn, không có button trên UI
- Khi BẬT: Badge nhỏ hiện ở dưới input
- Check console để confirm: `[Test Mode] ENABLED/DISABLED`

### 2. **Mock Validation Errors**
Giả lập 4 lỗi phổ biến (dựa trên Zod schema backend):

```typescript
Field "business_model" must be one of [retail, subscription, ...]. Received: "invalid_xyz"
Field "confidence" must be a number between 0 and 1. Received type: string
Field "impacted_services" expected array, received: null
Required field "changeset.model" is missing
```

**Lưu ý:** Mock errors này **TỰ SUY LUẬN** dựa trên Zod schema thật từ backend (`nexora-core-services/bmms/apps/platform/llm-orchestrator/src/schemas.ts`)

### 3. **Validation Warning Modal - Đơn giản**
- ✅ Modal nhỏ gọn, màu neutral (gray)
- ✅ Không có màu đỏ chói mắt
- ✅ Hiển thị errors trong box gray đơn giản
- ✅ 1 nút "Đóng" duy nhất

---

## 🚀 Cách sử dụng

### Bước 1: Bật Test Mode
**Nhấn `Ctrl + Shift + D`** (anywhere trên trang)

→ Sẽ thấy badge nhỏ: `🔬 Test Mode (Ctrl+Shift+D to toggle)`

### Bước 2: Nhập bất kỳ text nào
```
VD: "Bán linh kiện điện tử cho sinh viên"
```

### Bước 3: Click "Phân tích"
→ Modal validation error sẽ hiện ra (không gọi API)

### Bước 4: Demo xong, đóng modal
Click "Đóng" hoặc nhấn `Ctrl + Shift + D` để tắt test mode

---

## 🔐 Tại sao giấu Test Mode?

1. ✅ Không làm lộn xộn UI cho user bình thường
2. ✅ Chỉ dev/presenter biết (Ctrl+Shift+T)
3. ✅ Chuyên nghiệp hơn khi demo
4. ✅ Tránh user vô tình bật test mode

---

## 🎨 UI Design - Đơn giản

### Modal Style
```
Header: Gray background, orange icon
Content: Simple gray boxes cho errors
Footer: 1 button "Đóng"
```

### Không còn
- ❌ Red theme chói mắt
- ❌ Nhiều button (Từ chối/Đóng)
- ❌ Animations phức tạp
- ❌ Badge màu tím lớn

---

## 📝 Về Mock Errors

### Q: Mock errors này từ đâu?
**A:** Tự suy luận dựa trên Zod schema thật ở backend:

File: `nexora-core-services/bmms/apps/platform/llm-orchestrator/src/schemas.ts`

```typescript
export const MetadataSchema = z.object({
  confidence: z.number().min(0).max(1).default(0.5),  // ← Mock error: "must be number 0-1"
  risk: z.enum(['low','medium','high']),              // ← Mock error: "must be one of [...]"
});
```

Mock errors **giống như** lỗi thật từ Zod validation, nhưng **không gọi API thật**.

---

## 🛠️ Technical

### Keyboard Listener
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      setTestMode(prev => !prev);
      console.log('[Test Mode]', !testMode ? 'ENABLED' : 'DISABLED');
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [testMode]);
```

### States
```typescript
const [testMode, setTestMode] = useState(false);
const [showValidationWarning, setShowValidationWarning] = useState(false);
const [validationErrors, setValidationErrors] = useState<string[]>([]);
```

---

## ⚠️ Lưu ý khi demo

### Trước khi demo
1. Nhấn `Ctrl + Shift + D` để bật test mode
2. Kiểm tra badge đã hiện chưa
3. Check console: `[Test Mode] ENABLED`

### Khi demo
1. Nói: "Hệ thống có validation nghiêm ngặt từ backend"
2. Nhập text bất kỳ → Click "Phân tích"
3. Modal hiện ra → Giải thích các lỗi
4. "API không được gọi khi có lỗi validation"

### Sau demo
1. Click "Đóng"
2. Nhấn `Ctrl + Shift + D` để tắt
3. Hoặc refresh page

---
## 🎯 Tính năng đã thêm

### 1. **Test Mode Toggle**
- Nút bật/tắt Test Mode trên UI
- Khi BẬT: Sẽ hiển thị mock validation errors thay vì gọi API
- Khi TẮT: Hoạt động bình thường (gọi API backend thật)

### 2. **Mock Validation Errors**
Giả lập 6 loại lỗi validation phổ biến từ Zod:

```typescript
🚨 CRITICAL: Field "business_model" sai giá trị
⚠️ ERROR: Field "confidence" sai kiểu dữ liệu (string thay vì number)
⚠️ ERROR: Field "impacted_services" null thay vì array
🔴 CRITICAL: Thiếu required field
⚠️ WARNING: XSS/injection attempt detected
🚨 DATA CORRUPTION: Duplicate keys trong array
```

### 3. **Validation Warning Modal**
- 🎨 **Modal overlay** toàn màn hình với backdrop blur
- 🚨 **Red theme** để nhấn mạnh mức độ nghiêm trọng
- 📋 **Chi tiết từng lỗi** với color coding:
  - 🔴 CRITICAL = Đỏ đậm
  - 🟠 ERROR = Cam
  - 🟡 WARNING = Vàng
- ⚡ **Animations** mượt mà (Framer Motion)
- 🔘 **2 nút action**:
  - "Từ chối và Đóng" → Clear input + đóng modal
  - "Chỉ Đóng" → Giữ input + đóng modal

---

## 🚀 Cách sử dụng

### Bước 1: Bật Test Mode
1. Mở trang LLM Recommendation
2. Tìm section **"Test Mode - Demo Validation Errors"** (màu tím)
3. Click nút **BẬT** để enable test mode

### Bước 2: Nhập bất kỳ text nào
```
VD: "Bán linh kiện điện tử cho sinh viên"
```
(Nội dung không quan trọng vì không gọi API)

### Bước 3: Click "Phân tích"
- Sẽ có loading ngắn (1 giây)
- Modal validation warning sẽ hiện ra

### Bước 4: Xem demo UI
- Review toàn bộ error messages
- Test responsive (thử resize browser)
- Test theme (light/dark mode)

### Bước 5: Đóng modal
Chọn 1 trong 2:
- **"Từ chối và Đóng"** → Input sẽ bị clear
- **"Chỉ Đóng"** → Giữ nguyên input để thử lại

---

## 🎨 UI Components

### Color Scheme
```css
CRITICAL Errors:  bg-red-100, border-red-600
Regular Errors:   bg-orange-100, border-orange-500
Warnings:         bg-yellow-100, border-yellow-500
Info Box:         bg-blue-50, border-blue-300
```

### Icons sử dụng
- `AlertTriangle` - Header icon (màu trắng, animated pulse)
- `AlertCircle` - Alert message icon
- `Server` - Backend validation indicator
- `XCircle` - Reject button
- `Eye` - Close without reject button

---

## 🔧 Code Structure

### States đã thêm
```typescript
const [testMode, setTestMode] = useState(false);
const [showValidationWarning, setShowValidationWarning] = useState(false);
const [validationErrors, setValidationErrors] = useState<string[]>([]);
```

### Mock Data
```typescript
const MOCK_VALIDATION_ERRORS = [
  '🚨 CRITICAL: ...',
  '⚠️ ERROR: ...',
  // ... 6 errors total
];
```

### Logic flow
```
User clicks "Phân tích"
  → Check if testMode === true
    → YES: Show mock errors (NO API CALL)
    → NO: Call API normally
```

---

## 📸 Screenshots (Mô tả UI)

### 1. Test Mode Toggle
```
┌──────────────────────────────────────────────┐
│ 🔬 Test Mode - Demo Validation Errors       │
│                              [UI TESTING]    │
│                                      [BẬT]   │
└──────────────────────────────────────────────┘
```

### 2. Validation Warning Modal
```
┌────────────────────────────────────────────────┐
│ 🚨 CẢNH BÁO CAO - VALIDATION ERROR        [X] │
│ Phát hiện dữ liệu sai cấu trúc từ Zod Schema  │
├────────────────────────────────────────────────┤
│                                                │
│ ⛔ Không thể tiếp tục xử lý yêu cầu           │
│ Backend validation đã phát hiện 6 lỗi...      │
│                                                │
│ Chi tiết lỗi validation từ Backend (Zod):     │
│ ┌─────────────────────────────────────────┐  │
│ │ ! 🚨 CRITICAL: Field "business_model"... │  │
│ └─────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────┐  │
│ │ E ⚠️ ERROR: Field "confidence"...        │  │
│ └─────────────────────────────────────────┘  │
│                                                │
│ 💡 Chế độ TEST MODE đang bật                  │
│                                                │
├────────────────────────────────────────────────┤
│ [Từ chối và Đóng]         [Chỉ Đóng]         │
└────────────────────────────────────────────────┘
```

---

## 🎯 Use Cases

### 1. Demo cho Khách hàng
```
"Để đảm bảo an toàn, hệ thống có validation nghiêm ngặt.
Nếu dữ liệu sai cấu trúc, người dùng sẽ thấy cảnh báo rõ ràng
và API KHÔNG được gọi."
```

### 2. Training Team
```
"Khi backend trả về lỗi validation, UI sẽ hiển thị như thế này.
Người dùng có thể từ chối và nhập lại."
```

### 3. QA Testing
```
"Test xem UI có responsive không khi có nhiều error messages.
Test light/dark theme rendering."
```

---

## ⚠️ Lưu ý

### ✅ Nên
- Bật Test Mode khi demo
- Show cho stakeholders về error handling
- Dùng để test responsive design
- Tắt Test Mode khi dev/test thật

### ❌ Không nên
- Để Test Mode BẬT trong production
- Dùng Test Mode để test logic backend
- Commit code với testMode = true (default)

---

## 🔄 Tắt Test Mode

Để trở về hoạt động bình thường:
1. Click nút **TẮT** trong Test Mode toggle
2. Hoặc refresh page (default là TẮT)

---

## 🐛 Troubleshooting

### Modal không hiện?
- Kiểm tra Test Mode có BẬT không
- Check console logs
- Kiểm tra z-index của modal (z-50)

### Backdrop click không đóng modal?
- Đây là tính năng, user phải click nút "Từ chối" hoặc "Đóng"
- Hoặc click icon X ở góc phải

### Styling bị lỗi?
- Kiểm tra Tailwind classes
- Check dark mode classes (dark:...)

---

## 📝 Changelog

### v1.0 - Initial Release
- ✅ Test Mode toggle
- ✅ 6 mock validation errors
- ✅ Full validation warning modal
- ✅ Animations with Framer Motion
- ✅ Responsive design
- ✅ Dark mode support

---

## 🤝 Contributing

Nếu muốn thêm error types:
1. Thêm vào `MOCK_VALIDATION_ERRORS` array
2. Update color logic trong modal render
3. Test UI với số lượng errors mới

---