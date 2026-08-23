# 🛍️ DYNA STORE - Digital Store & Gaming Platform (Backend & Frontend)

Centralized production backend and frontend architecture for **DYNA STORE** digital gaming & media marketplace with Bakong KHQR, CutLuy Live Payment Gateway, and Instant Digital Fulfillment.

---

## ⚡ Key Systems & Features

- **🚀 Express.js & Node.js Engine**: High-performance REST APIs with Socket.io real-time live payment listeners.
- **🇰🇭 CutLuy & Bakong KHQR Gateway**: Live auto-verifying payment processing (`ck_live_QuVCpMzXMhvf5jUobZ6Z85OtsXpGW_FS`) with 5-second automatic worker verification.
- **🎮 Game Store & Catalog Management**: Direct game upload handling (ZIP, EXE, APK, ISO, MP4) and stream URL management.
- **🎬 Watch Now & Streaming Player**: Built-in 4K video player with trailer previews, episode support, and anti-screen recording DRM shield.
- **💳 Multi-Tier Wallets & Orders**: Instant user wallet checkout, transaction logs, lifetime access, and one-click order history cleanup.
- **🛡️ Super Admin Control Center**: Centralized administration for game catalogs, KHQR transaction settlement auditing, user wallet adjustment, and instant one-click login.

---

## 🛠️ Quick Start

### 1. Installation
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5050
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dyna_store_jwt_secret_key_2026_super_secure"
JWT_EXPIRES_IN="7d"

# CutLuy Live KHQR Gateway
CUTLUY_API_KEY="ck_live_QuVCpMzXMhvf5jUobZ6Z85OtsXpGW_FS"
CUTLUY_WEBHOOK_SECRET="dyna_store_webhook_secret_2026"
CUTLUY_BASE_URL="https://cutluy.com"

# Bakong KHQR
BAKONG_ACCOUNT_ID="dara_mao1@bkrt"
MERCHANT_NAME="DYNA STORE / MAO DARA"
MERCHANT_CITY="Phnom Penh"
```

### 3. Database Migration & Seeding
```bash
npx prisma generate
npx prisma db push
node set_admin.js
```

### 4. Running the Platform
```bash
# Run backend server
node server.js

# In a separate terminal, run frontend
cd frontend && npm run dev
```

---

## 👑 Super Admin Credentials
- **Email**: `dynastore2-904758-39q457@gmai.com`
- **Password**: `dynastore39w8537q458974`
- **Admin Portal**: `http://localhost:5173/admin`

---

## 🧪 System Health Verification
Run the comprehensive test suite verifying all 12 backend and frontend subsystems:
```bash
node test_system.js
```
