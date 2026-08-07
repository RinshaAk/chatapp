# PulseChat 🚀

A production-ready **Full-Stack Real-Time Messaging & Calling Platform** built with Next.js 14, Express, TypeScript, Socket.IO, MongoDB, and WebRTC.

---

## 🧱 Project Structure

```
chatapp/
├── shared/          # Shared TypeScript types (User, Chat, Message, Call, SocketEvents)
├── server/          # Node.js + Express + Socket.IO backend
└── client/          # Next.js 14 App Router frontend
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running on `localhost:27017` (or update `MONGO_URI` in `server/.env`)

### 1. Install all dependencies
```bash
npm install
```

### 2. Set up environment variables
Server env file is at `server/.env` — defaults work out-of-the-box for local dev.

Client env is at `client/.env.local` — already configured for local dev.

### 3. Seed demo data (users, chats, messages)
```bash
npm run seed
```
Creates 4 demo accounts, all with password **`password123`**:
| Email | Role |
|---|---|
| `admin@pulsechat.com` | 👑 Admin |
| `alex@pulsechat.com` | User |
| `sarah@pulsechat.com` | User |
| `david@pulsechat.com` | User |

### 4. Start the development servers
In two separate terminals:

```bash
# Terminal 1 — Backend API + Socket.IO
npm run dev:server

# Terminal 2 — Next.js Frontend
npm run dev:client
```

Then open **http://localhost:3000** in your browser.

---

## 🎯 Features

### ✅ Authentication
- Register, Login, Logout
- JWT Access Token + Refresh Token rotation
- Forgot Password via OTP (check server console for demo OTP)
- Session management per device

### 💬 Real-Time Messaging
- One-to-one and group chats
- Text, images, videos, documents, voice notes
- Reply, edit, delete for everyone
- Emoji reactions (❤️ 👍 😂 😮 😢 🔥)
- Typing & recording indicators
- Message delivery / read receipts (✓ ✓✓ 🔵)
- Unread badge counters

### 📞 WebRTC Calling
- HD Audio & Video calls
- Mute, camera toggle, screen sharing
- Network quality indicator
- Incoming call notifications with ringtone

### 👥 Groups
- Create groups with name, description, avatar
- Add/remove members, admin roles
- Mute, pin chats

### 🔔 Notifications
- Browser notifications (when in background)
- Notification sound
- In-app notification center

### 👑 Admin Dashboard (`/admin`)
- Live stats (users, messages, calls)
- Block/unblock users
- System-wide broadcast notifications

---

## 🐳 Docker (Production)

```bash
docker-compose up --build
```

---

## 🔧 Environment Variables

### `server/.env`
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/pulsechat` | MongoDB connection string |
| `JWT_SECRET` | `pulsechat_super_secret_jwt_key_2026` | JWT signing secret |
| `CLIENT_URL` | `http://localhost:3000` | CORS origin |
| `CLOUDINARY_CLOUD_NAME` | *(optional)* | Cloudinary cloud for media uploads |
| `CLOUDINARY_API_KEY` | *(optional)* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | *(optional)* | Cloudinary secret |

### `client/.env.local`
| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend REST API URL |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:5000` | Socket.IO server URL |
