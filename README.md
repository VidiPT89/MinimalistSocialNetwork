# 💬 Minimalist Social Network

> Bilingual social thread with text and image posts, likes, comments, reposts, a following feed, live notifications and direct messages, painted in the ividi.dev palette (black, burnt orange, amber).

[🐞 Report Bug](https://github.com/VidiPT89/MinimalistSocialNetwork/issues) · [✨ Request Feature](https://github.com/VidiPT89/MinimalistSocialNetwork/issues)

FIO is a Next.js desk for a small, sharp network: you publish a line or a picture, like and comment, repost someone else's post, and the home feed shows only the people you follow. Notifications and DMs update live. The UI is European Portuguese / English, with the language toggle remembered in `localStorage`. Live updates go through Pusher when keys are set, or Server-Sent Events on a single machine.

## ✨ Main Features

- 📝 **Text and image posts** — compose a line and attach a picture
- ❤️ **Likes, comments and reposts** — the three basic reactions
- 🧵 **Following feed** — your thread, not the whole room
- 🔔 **Live notifications** — likes, comments, follows, reposts and DMs
- ✉️ **Direct messages** — private threads between two people
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🎬 **Motion** — grain, ember glow and a thin filament across the desk

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?style=flat&logo=trpc&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Pusher](https://img.shields.io/badge/Pusher-optional-300D4F?style=flat&logo=pusher&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Pages and API routes |
| **API** | tRPC | Typed posts, follows, notices and DMs |
| **Data** | Prisma + PostgreSQL | Users, posts, likes, comments, messages |
| **Realtime** | Pusher or SSE | Notification and inbox refresh |
| **Motion** | Framer Motion | Card and landing reveal |

## 🧱 Project Structure

```text
MinimalistSocialNetwork/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── i18n/
│   ├── lib/
│   ├── server/
│   └── trpc/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- **Docker** (PostgreSQL 16 on port 55437)

### Installation

```bash
git clone https://github.com/VidiPT89/MinimalistSocialNetwork.git
cd MinimalistSocialNetwork
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Pusher is optional. Leave those keys empty to keep live updates on Server-Sent Events for this process. To sync across machines, create a Pusher app and fill `PUSHER_*` and `NEXT_PUBLIC_PUSHER_*`.

## 📖 Usage

1. Toggle **PT** or **EN** in the header.
2. Pick a test account (David, Inês or Nuno).
3. Publish a post, like, comment or repost.
4. Follow someone so they appear on the following feed.
5. Open notifications and send a direct message.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST / DELETE | `/api/session` | Demo sign-in cookie |
| GET / POST | `/api/trpc/*` | tRPC router (posts, follow, notify, message) |
| GET | `/api/realtime?userId=` | SSE live channel |
| GET | `/api/pusher` | Public Pusher config |

## 🧪 Testing

```bash
npm test
```

`node:test` checks the following feed, like toggle, DM thread keys, self-follow and clipped post bodies.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
