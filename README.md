# ⚡ Track-It

> Spaced repetition-based DSA & competitive programming tracker, built exclusively for Amrita Chennai students.

Track-It helps you actually *retain* what you solve — not just collect solved problems. Log a problem, rate your confidence, and the system schedules it for review at the right time using spaced repetition. Streaks, XP, ranks, and achievements keep you coming back.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel (frontend) · Supabase Cloud (backend) |

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- A Supabase account (get credentials from the project lead)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/track-it.git
cd track-it

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key (get these from the project lead — do NOT commit this file)

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

Create a `.env.local` file in the root (gitignored — never commit this):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get the actual values from the project lead directly (WhatsApp/DM).

---

## Branch & Contribution Workflow

1. **Never push directly to `main`** — branch protection is enabled.
2. Create a branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git add .
   git commit -m "brief description of what changed"
   ```
4. Push your branch:
   ```bash
   git push -u origin feature/your-feature-name
   ```
5. Open a **Pull Request** on GitHub — describe what you built/changed.
6. Get at least **1 approval** before merging.
7. Before starting new work, always sync with main:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/next-thing
   ```

### Branch naming convention
| Type | Format | Example |
|------|--------|---------|
| New feature | `feature/` | `feature/auth-setup` |
| Bug fix | `fix/` | `fix/sr-interval-bug` |
| UI/design | `ui/` | `ui/review-card-polish` |
| Database | `db/` | `db/schema-update` |

---

## Project Structure (once scaffold is in)

```
track-it/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level pages
│   ├── hooks/          # Custom React hooks (SR logic, XP, etc.)
│   ├── lib/            # Supabase client, helpers
│   └── main.jsx
├── .env.example        # Template for environment variables (safe to commit)
├── .env.local          # Your actual keys (gitignored — NEVER commit)
└── README.md
```

---

## Core Features

- 🔁 **Spaced Repetition** — Again (1d) / Hard (3d) / Good (7d) / Master (21d)
- 🏷️ **Custom Topics** — not locked to a fixed DSA list
- 📘 **Master Notebook** — per-topic theory and template notes
- ⚡ **XP + Rank Ladder** — Novice → Apprentice → Adept → Expert → Master → Grandmaster
- 🔥 **Streaks** — daily review streaks with personal best tracking
- 🎯 **Weekly Goals** — set and track review targets, resets every Monday
- 🏆 **Achievements** — 20+ badges tied to real milestones
- 🔍 **Weak Topic Detection** — surfaces topics where you struggle most
- 🔒 **Amrita Chennai Exclusive** — restricted to college email domain

---

## Team

| Role | Owner |
|------|-------|
| Project Lead / Tester | C RYTHAN |
| Backend / Auth | SISHIR |
| Core CRUD + SR Logic | VETRIVEL |
| XP / Gamification | C RYTHAN |
| Frontend / UI | THIRUYAZHINI / DEEPSIKHA |
| Landing Page | NAVYASREE |

---

## Status

🚧 **In active development** — but ready to use !!
