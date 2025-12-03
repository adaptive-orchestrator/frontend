# 🎨 BMMS Frontend - Multi-Business Model Web Application

Frontend React application cho hệ thống BMMS, hỗ trợ 4 mô hình kinh doanh: Retail, Subscription, Freemium, Multi-Model.

## 🚀 Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** + shadcn/ui
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Context** - State management
- **Framer Motion** - Animations

## 📁 Project Structure

```
src/
├── components/
│   ├── chatbot/          # AI Chatbot widget
│   ├── common/           # Shared components
│   ├── feature/          # Feature-specific components
│   ├── layout/           # Layout components (Navbar, Footer)
│   └── ui/               # shadcn/ui components
│
├── contexts/
│   ├── BusinessModeContext.tsx  # Retail/Subscription/Freemium mode
│   ├── CartContext.tsx          # Shopping cart (Retail)
│   ├── TaskContext.tsx          # Task management
│   ├── ThemeContext.tsx         # Dark/Light theme
│   └── UserContext.tsx          # Authentication & roles
│
├── pages/
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Login, Register, Reset password
│   ├── freemium/         # Freemium model pages
│   ├── retail/           # Retail model pages
│   └── subscription/     # Subscription model pages
│
├── routes/               # Route configuration
├── types/                # TypeScript types
└── utils/                # Utility functions
```

## 🎯 Business Modes

### Retail Mode 🛒
- Product catalog với inventory tracking
- Shopping cart
- Checkout & payment
- Order history

### Subscription Mode 📅
- Subscription plans với features
- Plan comparison
- Subscription management
- Auto-renewal

### Freemium Mode 🎁
- Free tier với usage limits:
  - 2GB storage
  - 3 projects
  - 50 tasks/month
- Paid add-ons:
  - AI Assistant ($19.99/mo)
  - Extra Storage ($9.99/mo)
  - Team Collaboration ($14.99/mo)
  - Advanced Analytics ($12.99/mo)

### Multi Mode 🔄
- Unified dashboard
- Manage all 3 models simultaneously

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| `customer` | Regular customer access |
| `member` | Team member |
| `organization_admin` | Admin for organization |
| `super_admin` | Full system access |

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📝 Environment Variables

```env
VITE_API_BASE=http://localhost:3000
```

## 📄 Pages

### Public Pages
- `/` - Landing page
- `/login` - Login
- `/register` - Register
- `/mode-selection` - Choose business mode

### Retail Pages
- `/products` - Product catalog
- `/products/:id` - Product detail
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Order history

### Subscription Pages
- `/plans` - Subscription plans
- `/subscribe` - Subscribe to plan
- `/my-subscriptions` - Manage subscriptions

### Freemium Pages
- `/freemium` - Free plan + add-ons
- `/freemium/dashboard` - Usage dashboard
- `/freemium/addons` - Purchased add-ons

### Admin Pages
- `/admin` - Dashboard
- `/admin/products` - Manage products
- `/admin/customers` - Manage customers
- `/admin/orders` - Manage orders
- `/admin/plans` - Manage plans
- `/admin/addons` - Manage add-ons

## 🔗 API Integration

Frontend connects to BMMS API Gateway at `http://localhost:3000`:

- `/auth/*` - Authentication
- `/catalogue/*` - Products & Plans
- `/orders/*` - Orders
- `/subscriptions/*` - Subscriptions
- `/addons/*` - Add-ons
- `/payments/*` - Payments
- `/ai/chat` - AI Chat

## 📄 License

MIT License
