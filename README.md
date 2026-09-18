# Ugolki (Corners) — Full-Stack Web Game

A modern, responsive web application for the classic board game **Ugolki (Corners)** with real-time online multiplayer, multi-level AI, local pass-and-play, and procedural audio.

![Ugolki Game](https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1000&q=80)

---

## Features

- **Game Presets (8x8 Board)**:
  - **Speed 3x3**: 9 pieces per player
  - **Classic 3x4**: 12 pieces per player
  - **Grand 4x4**: 16 pieces per player
- **Authentic Ugolki Rules**:
  - Orthogonal-only steps (1 square) and jumps (over friendly or opponent pieces).
  - Multi-jump chaining across the board with live trajectory path preview.
  - Equal turns rule (if Player 1 reaches goal first, Player 2 gets one final turn to match for an honorable Draw).
  - Anti-camping move limit warning.
- **Game Modes**:
  - **Online Real-Time Multiplayer**: 6-letter room codes, 1-click shareable invite links, public lobby browser, turn timers, and spectator mode.
  - **Single Player vs AI**: 3 sophisticated difficulty levels:
    - **Easy**: Fast greedy forward moves.
    - **Medium**: Minimax depth 2 with compactness and jump potential heuristics.
    - **Hard**: Alpha-Beta minimax with corner entry sorting and ladder construction.
  - **Local Pass & Play**: 2 players on one screen with undo and board flipping.
- **Polished UI & Audio**:
  - Classic Wood vs Modern Slate themes.
  - Web Audio API procedural sound engine (no external audio assets needed; zero load latency).
  - Confetti victory celebrations and floating in-game reaction emojis.
  - Mobile & desktop responsive layout with touch support.

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Starts both the Express + Socket.io backend (port 3001) and the React Vite dev server (port 5173):
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```
The server will build the frontend into `client/dist` and serve it directly from `http://localhost:3001`.

---

## Free Hosting Guide (Deploying to Render.com in 2 Minutes)

[Render.com](https://render.com) provides a 100% free web service tier that supports WebSockets natively.

### Step-by-Step Instructions:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Ugolki game"
   git remote add origin https://github.com/<your-username>/ugolki.git
   git push -u origin main
   ```

2. **Log into [Render.com](https://render.com)** (sign up for free using your GitHub account).

3. **Create New Web Service**:
   - Click **New +** -> **Web Service**.
   - Select **Build and deploy from a Git repository** and pick your `ugolki` repository.

4. **Configure Settings**:
   - **Name**: `ugolki-game` (or your chosen name)
   - **Region**: Closest to your location (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** ($0/month)

5. **Deploy**:
   - Click **Create Web Service**.
   - Render will clone the repository, run `npm install`, compile the Vite client, compile the TypeScript server, and launch the unified full-stack service.
   - Within 2-3 minutes, your game will be live at `https://<your-service-name>.onrender.com`!

---

## Project Structure

```
Ugolki/
├── client/                     # Vite + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/         # Board, Piece, Header, Controls, Modals
│   │   ├── logic/              # ugolkiEngine.ts, aiPlayer.ts, sound.ts
│   │   ├── types/              # Game TypeScript definitions
│   │   └── App.tsx             # Main client orchestration
├── server/                     # Express + Socket.io Backend
│   ├── src/
│   │   ├── index.ts            # WebSocket handlers & static server
│   │   ├── rooms.ts            # Room & timer management
│   │   └── ugolkiEngine.ts     # Authoritative move validation
├── Dockerfile                  # Production container definition
├── render.yaml                 # 1-click Render blueprint
└── package.json                # Monorepo root workspace configuration
```

---

## License
MIT
