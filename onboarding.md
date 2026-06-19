# Track-It — Teammate Onboarding Guide

Everything you need to get set up and start contributing.
Follow this guide top to bottom, don't skip steps.

---

## Prerequisites

Install these before anything else.

### 1. Node.js
- Download from: https://nodejs.org
- Pick the **LTS version** (left button, not "Current")
- After installing, verify it worked:
  ```bash
  node -v
  npm -v
  ```
  Both should print a version number. If they don't, restart your terminal and try again.

### 2. Git
- Download from: https://git-scm.com/downloads
- Pick your OS, run the installer with default settings
- After installing, verify:
  ```bash
  git --version
  ```
- Then configure your identity (do this once):
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```
  Use the same email as your GitHub account.

### 3. GitHub Account
- If you don't have one: https://github.com/signup
- Send your GitHub username to the project lead so you can be added as a collaborator
- You'll get an email invite — **accept it** before trying to clone the repo

### 4. A Code Editor
- We recommend **VS Code**: https://code.visualstudio.com
- Useful extensions to install inside VS Code:
  - `ES7+ React/Redux/React-Native snippets`
  - `Tailwind CSS IntelliSense`
  - `GitLens`
  - `Prettier - Code formatter`

---

## Getting the Project Running

### Step 1 — Clone the repo
Open your terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux):

```bash
git clone https://github.com/<org-or-username>/Track-It.git
cd Track-It
```

Replace `<org-or-username>` with the actual GitHub path — ask the project lead if unsure.

### Step 2 — Install dependencies
```bash
npm install
```
This installs everything the project needs. Will take a minute, you'll see packages being downloaded.

### Step 3 — Set up environment variables
The project needs Supabase credentials to connect to the database.
These are secret and NOT in the repo — get them from the project lead directly (WhatsApp/DM).

Once you have them:
```bash
cp .env.example .env.local
```
Then open `.env.local` in VS Code and fill in the values:
```
VITE_SUPABASE_URL=<paste the URL here>
VITE_SUPABASE_ANON_KEY=<paste the key here>
```

⚠️ **Never commit `.env.local` to GitHub.** It's already in `.gitignore` so git will ignore it automatically, but don't manually force-add it.

### Step 4 — Start the dev server
```bash
npm run dev
```
Open your browser and go to: **http://localhost:5173**

You should see the Track-It app running locally. If the page is blank, open browser DevTools (F12) → Console tab and share any red errors with the project lead.

---

## How to Contribute Code

**The golden rule: never push directly to `main`. Always work on a branch.**

### Starting new work

Before starting anything, always sync with the latest main first:
```bash
git checkout main
git pull
```

Then create your own branch:
```bash
git checkout -b feature/your-feature-name
```

Use these prefixes:
| Type | Prefix | Example |
|------|--------|---------|
| New feature | `feature/` | `feature/auth-setup` |
| Bug fix | `fix/` | `fix/sr-interval-bug` |
| UI work | `ui/` | `ui/review-card-polish` |
| Database | `db/` | `db/schema-update` |

### Saving your work
```bash
git add .
git commit -m "short description of what you did"
```

Good commit messages:
- `add supabase auth with email validation`
- `fix streak not incrementing after review`
- `style review queue cards`

Bad commit messages:
- `changes`
- `fix`
- `asdfgh`

### Pushing your branch to GitHub
First time pushing a new branch:
```bash
git push -u origin feature/your-feature-name
```
After that, just:
```bash
git push
```

### Opening a Pull Request
1. Go to the repo on GitHub
2. You'll see a banner: **"your-branch had recent pushes — Compare & pull request"** — click it
3. Write a short description of what you built/changed
4. Click **Create pull request**
5. Tag the project lead as reviewer
6. Wait for approval — don't merge your own PR

### After your PR is merged
```bash
git checkout main
git pull
```
Always come back to an updated main before starting your next task.

---

## Project Structure

```
Track-It/
├── src/
│   ├── components/     # Reusable UI components (buttons, cards, modals)
│   ├── pages/          # Full pages (Dashboard, Review, Problems, etc.)
│   ├── hooks/          # Custom React hooks (SR logic, XP, streaks)
│   ├── lib/            # Supabase client setup + helper functions
│   └── main.jsx        # App entry point
├── .env.example        # Template for env vars (safe to commit)
├── .env.local          # Your actual keys (gitignored — never commit)
├── .gitignore
└── README.md
```

---

## Tech Stack — Quick Reference

| Tech | What it does | Learn if unfamiliar |
|------|-------------|---------------------|
| React | UI framework | https://react.dev/learn |
| Vite | Build tool / dev server | Just runs in background, don't worry about it |
| Tailwind CSS | Styling via utility classes | https://tailwindcss.com/docs |
| Supabase | Database + Auth backend | https://supabase.com/docs |
| Git | Version control | https://learngitbranching.js.org |

---

## Common Problems

**`npm install` fails**
- Make sure Node.js is properly installed (`node -v` should work)
- Try deleting `node_modules` folder and running `npm install` again

**`npm run dev` gives an error about `.env`**
- Make sure you've created `.env.local` with the Supabase credentials
- Get the values from the project lead

**Git says "permission denied" when pushing**
- Make sure you've accepted the GitHub collaborator invite
- Check that you're pushing your branch, not `main`

**Page is blank after `npm run dev`**
- Open browser DevTools (F12) → Console tab
- Screenshot the red errors and send to project lead

**Git says "your branch is behind main"**
```bash
git checkout main
git pull
git checkout your-branch-name
git merge main
```
This brings your branch up to date with the latest main.

---

## Quick Command Reference

```bash
# Sync with latest main
git checkout main && git pull

# Start new feature
git checkout -b feature/name

# Save progress
git add . && git commit -m "message"

# Push to GitHub
git push

# Start dev server
npm run dev

# Check what branch you're on
git branch

# Check what files changed
git status
```

---

## Who to Contact

| Need | Contact |
|------|---------|
| Repo access / collaborator invite | Project Lead |
| Supabase credentials (.env values) | Project Lead |
| Unclear what to work on | Check GitHub Issues board |
| Found a bug | Open a GitHub Issue |
| Code review / PR approval | Project Lead |

---

*Last updated by project lead before first meeting.*
