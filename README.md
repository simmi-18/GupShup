# 🗨️ Chatify — Real-Time Chat Application

Chatify is a modern, real-time messaging platform built using **React, Node.js, Socket.io, and MySQL**.
It supports single & multi-user chat rooms, file sharing, encryption, QR-based joining, and a clean, responsive UI.

Users can instantly chat by joining rooms using a **Room ID or QR Code**, send multimedia messages, view message ticks, and enjoy secure communication with **end-to-end encryption**.

# 🚀 Features

**💬 Messaging**
Real-time chat using **Socket.io**
One-to-one or group conversations
Message Reply, Edit, Delete, Copy
Sent / Delivered / Read message ticks
End-to-End Encryption

**📸 Media Support**
Send **Images, GIFs, Stickers, Files**
File preview & zoom modal
Profile image support (optional)

**👥 User System**
Join via **Room ID or QR Code**
Online / Offline status indicators
Custom username & avatar
Unique Room IDs generated using **UUID**

**📱 UI & UX**
Fully responsive UI — **TailwindCSS**
Modern component-based architecture
Interactive popups, dropdowns, modals

**🔐 Security & Authentication**
Authentication with **JWT**
Password hashing with **bcrypt**
Secure file uploads via **Multer**

# 🛠️ Tech Stack

| Tool / Library     | Version |
| ------------------ | ------- |
| React              | 18      |
| Socket.io-client   | 4       |
| Node.js            | 24      |
| Express            | 5       |
| Socket.io (Server) | 4       |
| MySQL2             | 3       |
| Knex               | 3       |
| UUID               | 11      |
| TailwindCSS        | Latest  |

## Project Structure

```
CHATIFY/
│
├── app/
│   ├── controllers/
│   │   ├── ChatController.js
│   │   └── JoinRoomController.js
│   │
│   ├── utils/
│   │   └── encryption.js
│   │
│   ├── db/
│   │   ├── migration/
│   │   │   ├── 20250711065054_create_users_table.js
│   │   │   └── 20250912061435_create_messages_table.js
│   │   └── socket/
│   │       ├── Socket.js
│   │       └── index.js
│   │
│   ├── middleware/
│   │   └── multer.js
│
├── resources/  ← (Frontend React App)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── utils/
│       ├── App.js
│       └── index.js
│
├── uploads/
├── routes/
├── .env
├── knexfile.js
└── README.md

```

## Getting Started

**Frontend (React + TailwindCSS)**
cd resources
npm install
npm start

Visit: http://localhost:4000

**Backend (Node + Express)**
npm install
npm start

Backend runs on: http://localhost:4009
