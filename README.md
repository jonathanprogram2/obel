# Obel ⚡️
**Subtitle:** *Your Personal Command Center*

Obel is a futuristic dashboard-style web app built to combine markets + portfolio tracking + news + weather + budgeting + productivity + an AI workspace assistant into one clean “command center” experience.

This is a portfolio project focused on frontend engineering, polished UI/UX, modular components, and real API integration (market data powered by Twelve Data API).
---

## ✨ What Obel Does

Obel is designed to feel like a daily hub you’d actually open. Instead of bouncing between apps, Obel centralizes everything into a smooth dashboard workflow.

### ✅ Homepage / Demo Notice (Auth Removed)
Obel originally included login/signup, but for the demo version it’s currently removed.

**Why?** MongoDB free tier can pause after inactivity, which makes always-on authentication unreliable unless upgraded to a paid tier. Since this is a showcase build, auth was removed temporarily and can be re-enabled once backend hosting is always-on.

---

## 🧩 Pages & Features

### 🏠 Dashboard (Command Center Hub)
The Dashboard is the main entry point for daily scanning and quick actions:
- Hero “Welcome back” section with Obel theme + motion animations
- **Portfolio Snapshot** module (net worth + goal progress bar)
- **Today’s To-Dos gallery** (pulled from Workspace board stored in `localStorage`)
- Clickable **Weather tile** → opens full Weather Dashboard modal
- Clickable **Mini Calendar widget** → opens full Calendar Planner modal
- **Motivational Quote** widget (refreshes periodically)
- Built with careful layout tuning so the dashboard stays readable across desktop/mobile

---

### 📈 Portfolio Page (Webull-Style Research)
A dedicated page for market-focused portfolio tracking:
- Net worth + progress tracking visuals
- **Interactive allocation pie chart** + breakdown visuals (structured to scale)
- **Growth chart** to visualize portfolio performance over time
- **Distribution chart** to highlight allocation / category spread at a glance
- **Webull-style trading chart section** for stock performance / research
- Designed to feel like a fast-scanning “trading dashboard” experience
- Market data integration is planned/expanding using **Twelve Data API**

> Goal: Keep this page clean and scannable like a real investing platform UI.

---

### 💸 Budgets Page (Cash Flow + Categories)
A budgeting and spending breakdown page:
- Budget totals + quick summary layout
- Category cards with progress bars
- Designed for “at-a-glance” money tracking
- Built as a practical companion to the portfolio workflow

---

### 📰 News Page (Research Hub + Bookmarks)
A category-based news feed that supports “read later” research:
- Category pills: Political, Sports, Entertainment, Sci&Tech
- Glassmorphism news cards (image, headline, summary, source, date)
- **Clickable cards** open the article link in a new tab
- Bookmark system stored in `localStorage`
- Saved articles modal (“Bookmarks”)
- “What is this page?” explainer modal for UX clarity

---

### 🗂 Workspace Page (Productivity + AI Assistant)
The Workspace is the productivity side of Obel — built like a mini project manager:
- Kanban-style board (To Do / In Progress / Done)
- Task modal with structured fields (priority, due date, etc.)
- Designed to feel like a real workflow system, not just a notes page
- Includes an **AI Workspace Assistant** concept panel to help:
  - break down tasks
  - suggest next steps
  - guide daily prioritization (built to expand over time)

---

## 🧭 How To Navigate Obel

### Dashboard
- Click the **Weather tile** → opens Weather Dashboard modal  
- Click the **Calendar widget** → opens Calendar Planner modal  
- Click a **To-Do card** → routes into Workspace context

### Portfolio
- Use it for investing-focused views and market research layout  
- Check the **allocation pie chart** for portfolio breakdown  
- Review **Growth** and **Distribution** charts for quick performance + spread insights  
- Use the **Webull-style trading chart** section to analyze stock movement and trends  
- Built for fast scanning like a trading platform page

### Budgets
- Track spending categories + budget progress bars  
- Designed as a “money management” companion tool

### News
- Switch categories with pills  
- Click a story card to open the full article  
- Bookmark stories to save them for later

### Workspace
- View tasks by column  
- Create/edit tasks through the modal  
- Use the **AI assistant panel** as a workflow helper concept

---

## 🗂 Key Features (Technical Details)

### ✅ LocalStorage Persistence
Obel uses localStorage to make the demo feel “real” without requiring login:
- Workspace board → `localStorage["obel-workspace-board"]`
- News bookmarks → `localStorage["obelNewsBookmarks"]`

This makes Obel usable after refresh and helps the project feel like a real product.

---

### ✅ Real Data Integration (Twelve Data + APIs)
- **Twelve Data API** is used for stock/market data integration (expanding)

- **NewsData API** is used to pull fresh headlines by category for the News page

- **Groq API** is used to power the built-in AI assistant experience

- Weather/Quotes are fetched through backend API routes

- The UI includes strong loading/error/fallback states so missing data doesn’t break the experience

---

## 🧱 Tech Stack
- **React (Vite)**
- **JavaScript**
- **Tailwind CSS + custom CSS**
- **Framer Motion** (animations)
- **REST API integration**
- **LocalStorage persistence**

---

## ⚠️ Challenges & Lessons Learned
This project forced real “frontend engineering” work beyond just making things look good:

- **Responsive dashboard layout fixes**
  - especially making cards behave in landscape widths
- **Clickable card UX**
  - ensuring cards open links while bookmark buttons still work (event propagation)
- **State + modal management**
  - multiple modals, loading states, fallbacks
- **Deployment polish**
  - favicon/tab icon behavior differences after deployment
- **Backend reliability**
  - MongoDB free tier pausing → led to removing auth for demo stability

---

## 🚀 Roadmap (Next Up)
- Expand Twelve Data usage for more live market widgets (quotes, mini charts, movers)
- Persist Workspace tasks to a database (instead of only localStorage)
- Re-enable auth once backend is always-on (paid tier / always-on hosting)
- Add saved portfolio holdings + real performance tracking
- Upgrade AI Workspace Assistant into a more functional workflow helper

---

## 📸 Screenshots

### Home 
<img width="2527" height="1386" alt="image" src="https://github.com/user-attachments/assets/e1ae36d2-db23-4ccd-b177-6913f5ad8b6f" />

### Dashboard
<img width="2543" height="1391" alt="Screenshot 2026-01-06 191829" src="https://github.com/user-attachments/assets/fa1a4e6a-da02-47d5-8178-75452d40f648" />

### Portfolio
<img width="2539" height="1395" alt="Screenshot 2026-01-06 191926" src="https://github.com/user-attachments/assets/4d7cc716-efa9-438b-8a7e-c0466623263f" />

### Stock Detail Page
<img width="2191" height="1365" alt="image" src="https://github.com/user-attachments/assets/961d8286-d2e1-4e9b-85ab-d35e300eb87f" />

### Portfolio Pie Chart
<img width="2527" height="1382" alt="Screenshot 2026-01-06 193110" src="https://github.com/user-attachments/assets/e2ab6c2d-7c51-4a8f-b079-005ed04e4101" />

### Budgets
<img width="2540" height="1384" alt="Screenshot 2026-01-06 191957" src="https://github.com/user-attachments/assets/1c9dcf19-f8d9-4923-a094-5414eb9225f9" />

### News
<img width="2540" height="1397" alt="Screenshot 2026-01-06 192027" src="https://github.com/user-attachments/assets/183de240-f3d9-46c7-a764-a14c8a1f9f24" />

### Workspace + AI Assistant
<img width="2534" height="1389" alt="Screenshot 2026-01-06 192939" src="https://github.com/user-attachments/assets/59178a8c-930a-492b-b35a-e5ee45431083" />

---

## 🎥 Demo Video (YouTube)

Watch the full walkthrough here: **[Obel Demo Video](https://youtu.be/2PA-9dIngD0)**

---

## 🔗 Links
- Website link: https://theobel.vercel.app/
- Portfolio Website: https://jamxstudios.vercel.app/  
- LinkedIn: https://www.linkedin.com/in/jonathanmirabal/

---

## 📜 License
Portfolio / learning project. Feel free to explore and learn from it.
