# ChatBot Widget

An embeddable AI chat widget with a Node.js backend.  
Works in **mock mode out of the box** — switch to OpenAI with a single `.env` change.

---

## 📁 Folder Structure

```
chatbot-widget/
├── server.js                  # Entry point — starts the Express server
├── package.json
├── .env.example               # Copy this to .env and fill in your values
├── public/
│   ├── widget.js              # ← The embeddable widget (served as static file)
│   └── test.html              # Local test page
└── src/
    ├── app.js                 # Express app: middleware, routes, error handler
    ├── routes/
    │   └── chat.routes.js     # GET /api/health, POST /api/chat
    ├── controllers/
    │   └── chat.controller.js # Request validation, response formatting
    ├── services/
    │   ├── chat.service.js    # Orchestrates mock vs OpenAI, manages history
    │   ├── mock.service.js    # Keyword-based mock replies
    │   └── openai.service.js  # OpenAI SDK integration (ready to activate)
    └── utils/
        └── validators.js      # Input validation helpers
```

---

## ⚡ Quick Start (Local)

### 1. Install dependencies
```bash
cd chatbot-widget
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# No changes needed for mock mode
```

### 3. Start the server
```bash
npm start
# Or, for auto-reload during development:
npm run dev
```

### 4. Open the test page
Visit **http://localhost:5000/test.html** — the widget appears in the bottom-right corner.

---

## 🌐 API Reference

### `GET /api/health`
```json
{ "success": true, "message": "Server is running" }
```

### `POST /api/chat`
**Request body:**
```json
{ "userId": "guest_123", "message": "Hello" }
```
**Response:**
```json
{
  "success": true,
  "reply": "Hey there! How can I help you today?",
  "userId": "guest_123",
  "mode": "mock"
}
```

---

## 🔗 Embed on Any Website

Add **two script tags** anywhere in your HTML:

```html
<!-- Step 1: Load the widget -->
<script src="https://yourdomain.com/widget.js"></script>

<!-- Step 2: Initialise with your config -->
<script>
  ChatBotWidget.init({
    apiUrl: "https://yourdomain.com/api/chat",
    userId: "guest_123",
    botName: "Support Bot",
    welcomeMessage: "👋 Hi! How can I help you?",
    primaryColor: "#2563eb",
    position: "right"       // "left" or "right"
  });
</script>
```

That's it. The widget injects its own HTML and CSS — no conflicts with your site's styles.

### Config options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiUrl` | string | `http://localhost:5000/api/chat` | Your backend endpoint |
| `userId` | string | random | Unique ID for conversation history |
| `botName` | string | `"Support Bot"` | Name shown in chat header |
| `welcomeMessage` | string | `"👋 Hi there!"` | First message shown on open |
| `primaryColor` | string | `"#2563eb"` | Brand color for header + bubbles |
| `position` | string | `"right"` | `"left"` or `"right"` |

---

## 🤖 Switch to OpenAI (When Ready)

1. Open `.env`
2. Set your key and flip the flag:
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4.1-mini
USE_OPENAI=true
```
3. Restart the server: `npm start`

No other changes needed. The same widget, same API, now powered by real AI.

---

## 🧪 Mock Mode Responses

| You say | Bot replies with |
|---|---|
| hello, hi, hey | Greeting |
| name, who are you | Bot intro |
| help, problem, issue | Support reply |
| pricing, cost, plans | Business reply |
| bye, thanks | Sign-off |
| contact, human, agent | Escalation |
| feature, what can you do | Capability list |
| Anything else | Polite fallback (random) |

---

## 🚀 Hosting Guide

### Backend (Node.js server)
Deploy to any Node-compatible host:
- **Railway** — `railway up` (free tier available)
- **Render** — connect GitHub repo, auto-deploys
- **Fly.io** — `fly deploy`
- **DigitalOcean App Platform** — point to repo
- **VPS / EC2** — `npm start` behind nginx + PM2

Set your environment variables in the host's dashboard (same as `.env`).

### Widget file (`widget.js`)
`widget.js` is served as a static file by the same Express server at:
```
https://yourdomain.com/widget.js
```
You can also host it separately on a CDN (Cloudflare R2, AWS S3, Bunny CDN) for faster global delivery.

### CORS
The server allows all origins by default. For production, restrict it in `src/app.js`:
```js
app.use(cors({ origin: ["https://yoursite.com", "https://www.yoursite.com"] }));
```

---

## 🔭 Phase 2 Suggestions

| Feature | How |
|---|---|
| **Persistent history** | Replace the in-memory Map with MongoDB (mongoose) |
| **Rate limiting** | Add `express-rate-limit` middleware |
| **Domain restriction** | Validate `Origin` header in CORS config |
| **Lead capture** | Add a "name + email" form before first message |
| **Admin panel** | Build a React dashboard to view conversations |
| **File uploads** | Accept images with `multer`, pass to OpenAI vision |
| **Streaming** | Use `openai.chat.completions.stream()` + SSE |
| **Analytics** | Log sessions to a database, visualise with Metabase |

---

## 🛠 Programmatic Control

```js
ChatBotWidget.open();    // Open the chat window
ChatBotWidget.close();   // Close the chat window
ChatBotWidget.destroy(); // Remove widget from page entirely
```
