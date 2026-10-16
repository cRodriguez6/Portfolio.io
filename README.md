# Connor Rodriguez · Portfolio Website

> Professional Portfolio for **Connor Rodriguez** (@cRodriguez6 / @CJR1400), featuring published Indie Games on **itch.io**, Software & Data Science projects on **GitHub**, and an interactive **Play Mode** designed for Godot Engine integration.

---

## 🌟 Highlights & Features

1. **Dedicated "Play Mode" (Godot Engine & Arcade Showcase)**:
   - Built-in interactive 2D canvas arcade game world where visitors can control a character, collect gems, hear 8-bit sound effects (Web Audio API), and walk up to physical kiosks to inspect games and GitHub repositories.
   - **Godot HTML5 Engine Port Bridge**: Ready to host your Godot game! Simply drop your exported files into `/godot-build/` or enter any live URL in Play Mode.
2. **Interactive Headshot Photo Manager**:
   - Beautiful futuristic neon halo frame featuring your GitHub avatar (`https://avatars.githubusercontent.com/u/160680927?v=4`).
   - Click the avatar or open the customizer to drag-and-drop or select any custom headshot photo file (`.jpg`, `.png`, `.webp`) with instant live preview and persistence.
3. **Itch.io Games Showcase**:
   - **Paint The Panda** (Pixel Painting Game · Educational)
   - **Beware The Space Octopus** (Cosmic Action)
   - **Five Nights At Julio's** (Interactive Fiction / Survival)
   - **Isaiah's Diner** (Not-so-Vegan Burger Management Simulation)
   - **Stop the evil Josh** (21 Games in 21 Days: Day 2)
   - **Race Car Sweeper** (21 Games in 21 Days: Day 1)
   - **Iceberg Commander** (Naval Strategy)
   - Includes real cover art, category filter tabs, direct Itch links, and quick in-browser preview lightboxes!
4. **GitHub Software & Data Repositories**:
   - `crodriguez6.github.io-final-project` (Web Capstone & HTML5/CSS3/JS Showcase)
   - `Intro-To-Data-Science-Final-Project` (Python, EDA, statistical insights)
   - `Portfolio.io` (Web engineering & portfolio architecture)
   - `codespaces-blank` (Python cloud development & environment setup)
5. **Technical Capabilities Matrix**:
   - Godot 4 / 3, GDScript, Python, JavaScript, HTML5/CSS3, Game Jam Prototyping, Level & Sound Design.
6. **21 Games in 21 Days Spotlight Banner**:
   - Highlighting the rapid game-jam sprint demonstrating dedication to iterative game design.

---

## 🚀 How to Run Locally

You can run this portfolio locally with any static web server:

### Option A: Using Python (Recommended)
```bash
cd /Users/connorrodriguez/.gemini/antigravity-ide/scratch/portfolio
python3 -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Using Node.js (npx serve)
```bash
cd /Users/connorrodriguez/.gemini/antigravity-ide/scratch/portfolio
npx -y serve . -p 3000
```

---

## 🎮 How to Load Your Godot Game into "Play Mode"

When you are ready to export your Godot portfolio game:
1. In Godot, go to **Project &rarr; Export...**
2. Add a preset for **Web (HTML5)**.
3. Export into the `godot-build` directory:
   - File name: `index.html` (along with `index.pck`, `index.wasm`, etc.)
   - Path: `/Users/connorrodriguez/.gemini/antigravity-ide/scratch/portfolio/godot-build/`
4. In the web portfolio, click **PLAY MODE** in the top navigation, switch to the **"Godot HTML5 Engine Port"** tab, and your Godot game will run directly inside the arcade cabinet!
5. You can also paste your itch.io embed URL (e.g., `https://itch.io/embed-upload/...`) directly into the input bar.

---

## 📷 How to Add Your Headshot Photo

- **In the browser**: Click on your avatar photo on the homepage to open the **"Customize Your Headshot"** modal. Drag and drop any image file to see it live instantly!
- **Via file system**: Save your picture as `headshot.jpg` or `headshot.png` inside the `assets/` folder, and update the `src` attribute in `index.html` line 125.

---

## 🌐 Free Deployment to GitHub Pages

To make your website live on the web at `https://cRodriguez6.github.io`:
1. Push this folder to your GitHub repository `cRodriguez6/cRodriguez6.github.io` (or `Portfolio.io`).
2. Go to **Settings &rarr; Pages** on GitHub.
3. Under **Branch**, select `main` and root `/`.
4. Click **Save** — your site will be live across the world with SSL enabled!
