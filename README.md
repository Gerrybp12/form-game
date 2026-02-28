# Form Game

Web application berbentuk game untuk membuat dan mengisi form dengan sistem PIN seperti Quizizz.  
Project ini terdiri dari backend (Express + Prisma) dan frontend (Next.js).

---

# 🏗️ Tech Stack

## Backend
- Node.js
- Express.js
- Prisma 7
- PostgreSQL (Neon)

## Frontend
- Next.js
- React
- Axios

---

# ⚙️ Requirements

- Node.js v18 atau lebih baru
- PostgreSQL database (Neon atau lokal)
- npm

---

# 🚀 Cara Menjalankan Project (Lokal)

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd form-game
```
🔧 Backend Setup
## 2️⃣ Install Dependency

```bash
cd backend
npm install
```
## 3️⃣ Buat File Environment

Buat file .env di dalam folder backend/.

Isi sesuai template berikut:

DATABASE_URL=
DIRECT_DATABASE_URL=
JWT_SECRET=

Value environment variable di pdf terpisah.

## 4️⃣ Generate Prisma Client

```bash
npx prisma generate
```

Jika database belum memiliki tabel:
```bash
npx prisma migrate dev
```

Jika database sudah ada:
```bash
npx prisma migrate deploy
```

## 5️⃣ Jalankan Backend

```bash
npm run dev
```

Backend berjalan di:
```bash
http://localhost:4000
```
Cek health endpoint:
```bash
http://localhost:4000/health
```

## 💻 Frontend Setup

Buka terminal baru.

## 6️⃣ Install Dependency

```bash
cd frontend
npm install
```

## 7️⃣ Buat File Environment Frontend

Buat file .env.local di folder frontend/:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 8️⃣ Jalankan Frontend

```bash
npm run dev
```

Frontend berjalan di:
```bash
http://localhost:3000
```
