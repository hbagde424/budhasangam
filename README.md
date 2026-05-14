# ☸ BuddhaSangam — Buddhist Matrimony Platform

> A dedicated matrimony website for the Buddhist community — Theravada, Mahayana, Vajrayana, and Navayana traditions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (or Docker)
- Cloudinary account
- Resend account (for email)
- Razorpay account (for payments)
- Google OAuth credentials

### 1. Clone & Install
```bash
git clone https://github.com/your-org/buddha-sangam.git
cd buddha-sangam
npm install
```

### 2. Environment Setup
```bash
cp .env.local .env.local.example
# Edit .env.local with your actual credentials
```

### 3. Database Setup
```bash
# Start PostgreSQL (via Docker)
docker-compose up postgres -d

# Push schema
npx prisma db push

# Or run migrations (production)
npx prisma migrate dev --name init

# View data
npx prisma studio
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🐳 Docker (Full Stack)

```bash
# Copy and fill env vars
cp .env.local .env

# Start all services
docker-compose up --build

# With Prisma Studio (dev)
docker-compose --profile dev up
```

Services:
- **App** → http://localhost:3000
- **Prisma Studio** → http://localhost:5555
- **PostgreSQL** → localhost:5432
- **Redis** → localhost:6379

---

## 📁 Project Structure

```
buddha-sangam/
├── app/
│   ├── (auth)/               # Login, Register, Verify OTP
│   ├── (dashboard)/          # Protected pages (Dashboard, Chat, etc.)
│   ├── search/               # Profile search page
│   ├── premium/              # Subscription plans + Razorpay
│   ├── admin/                # Admin dashboard
│   └── api/                  # All API routes
│       ├── auth/             # NextAuth + register + OTP
│       ├── profile/          # Profile CRUD
│       ├── search/           # Profile search with filters
│       ├── interests/        # Send / respond to interests
│       ├── connections/      # Active connections
│       ├── chat/             # Messages REST + Socket.IO
│       ├── upload/           # Cloudinary photo upload
│       ├── premium/          # Razorpay payment + verify
│       └── admin/            # Admin actions + stats
│
├── components/
│   ├── forms/                # BiodataForm (6-step wizard), PhotoUpload
│   ├── search/               # ProfileCard, FilterSidebar, CompatibilityBadge
│   ├── chat/                 # ChatWindow, MessageBubble, ChatList
│   ├── dashboard/            # InterestCard, DailyMatches
│   └── layout/               # DashboardLayout, Providers
│
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── db.ts                 # Prisma client singleton
│   ├── matching-algorithm.ts # 10-criteria compatibility engine
│   ├── socket.ts             # Socket.IO server
│   ├── email/                # Resend email templates
│   └── storage/              # Cloudinary upload helpers
│
├── hooks/                    # useSocket, useProfile, useInterests
├── types/                    # TypeScript types + NextAuth extension
├── prisma/schema.prisma      # Full database schema
├── docker-compose.yml        # PostgreSQL + Redis + App
└── Dockerfile
```

---

## ✨ Features

### Users & Profiles
- 3 registration types: Seeker, Parent/Guardian, Matchmaker
- 6-step biodata wizard (Personal → Buddhist → Education → Family → Lifestyle → Preferences)
- Photo upload (Cloudinary) — 3 photos Free, 10 Premium
- Profile verification (Email, Phone OTP, Photo, Income, Education)
- Privacy controls (blur photos, private mode, pause profile)

### Matching & Search
- 10-criteria compatibility algorithm (tradition, meditation, diet, lifestyle, age, location, education, family values, income, work preference)
- Advanced filters (tradition, diet, vipassana course, meditation, location, marital status, height, age)
- Daily curated match suggestions
- Compatibility score (0–100%) on every profile

### Interests & Chat
- Send/accept/decline interests with personal notes (150 chars)
- Daily limits enforced (Free: 5 interests, 10 messages)
- Real-time chat via Socket.IO with typing indicators and read receipts
- Dhamma icebreaker question suggestions
- Delete messages within 5 minutes

### Premium (Razorpay)
| Plan | Price | Key Features |
|------|-------|--------------|
| Sacred Path | Free | 5 interests/day, 3 photos |
| Bodhisattva | ₹1,499/mo | Unlimited, 10 photos, video calls, profile boost |
| Dhamma Vihara | ₹3,499/mo | Manage 10 profiles, bulk tools, analytics |

### Admin Dashboard
- User management (view, block, unblock, verify, delete)
- Report moderation (fake profiles, harassment, spam)
- Analytics (registrations, traditions, premium uptake)
- Real-time stats

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes + Node.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials + Google OAuth) |
| Storage | Cloudinary (photos) |
| Real-time | Socket.IO |
| Payments | Razorpay |
| Email | Resend |
| Deployment | Docker + Vercel / AWS |

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
vercel --prod
# Add all env vars in Vercel dashboard
```

### AWS / Self-hosted
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Database Migrations (Production)
```bash
npx prisma migrate deploy
```

---

## 📧 Support

- Email: support@buddhasangam.com
- GitHub Issues: [github.com/your-org/buddha-sangam/issues](https://github.com/your-org/buddha-sangam)

---

*Made with Metta 🙏 for the Buddhist community*
