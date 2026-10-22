# 🎬 GenreLens — Movie Genre Classifier

> **Read the story between the lines.** A thoughtful, browser-based movie genre classifier powered by natural language processing and machine learning that runs 100% client-side.

---

## ✨ Features

- **Intuitive Story Analysis**: Paste any movie plot summary or story premise and receive real-time genre predictions with confidence scoring.
- **Explainable Signals**: Highlights influential terms and keywords that shaped the genre reading.
- **100% Private & In-Browser**: Built with an in-browser TF-IDF and Naive Bayes model. No story text or data ever leaves your device.
- **Custom Model Training**: Train your own personalized classifier by uploading any movie dataset CSV (with plot and genre columns).
- **History & CSV Export**: Review previous readings stored locally in your browser notebook, and export them as a CSV anytime.
- **Responsive & Modern Design**: Styled with curated typography (Instrument Serif, DM Sans, DM Mono) and dark mode aesthetics.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite 7](https://vitejs.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Routing**: [Wouter](https://github.com/molefrog/wouter)
- **State & Data**: [TanStack Query](https://tanstack.com/query)

---

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- `npm` (comes with Node.js)

### Installation & Run

1. Clone or open this repository:
   ```bash
   git clone <your-repo-url>
   cd Movie-Genre-Classifier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```text
   http://localhost:5173/
   ```

*(On Windows, you can also simply double-click `start.bat` to launch the app!)*

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output files will be built into the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment

This project is pre-configured for one-click deployment on both **Vercel** and **Render**.

### Deploy to Vercel

1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

> **Note**: `vercel.json` is already included to automatically route all requests to `index.html` for client-side routing.

---

### Deploy to Render

#### Option A: Using the included Blueprint (Easiest)
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New > Blueprint**.
3. Connect your repository. Render will automatically read [`render.yaml`](./render.yaml) and deploy the static site!

#### Option B: Manual Static Site
1. In Render, click **New > Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `movie-genre-classifier`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites**, add:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Click **Create Static Site**.

---

## 📂 Project Structure

```text
Movie-Genre-Classifier/
├── public/                 # Static assets (favicons, etc.)
├── src/
│   ├── components/         # UI components (Radix + Tailwind)
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── classifier.ts   # Core NLP classifier (TF-IDF + Naive Bayes)
│   │   └── utils.ts        # Helper utilities
│   ├── pages/              # 404 & route views
│   ├── App.tsx             # Main GenreLens application UI & state
│   ├── index.css           # Global Tailwind CSS styles and theme
│   └── main.tsx            # React application entrypoint
├── index.html              # HTML template
├── package.json            # Dependencies and npm scripts
├── render.yaml             # Render static site blueprint
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel SPA routing configuration
├── vite.config.ts          # Vite configuration
└── README.md               # Project documentation
```

---

## 📄 License

MIT License. Feel free to use and customize for your own projects!
