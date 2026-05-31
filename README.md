<br/>
<div align="center">
<a href="#">
<img src="https://img.icons8.com/color/100/null/robot-2.png" alt="Logo" width="80" height="80">
</a>
<h3 align="center">Cleen Chat (NodeApp)</h3>
<p align="center">
  A visual, node-based automation and moderation platform for YouTube and AI integrations.
  <br/>
  <br/>
  <a href="#"><strong>Explore the docs »</strong></a>
  <br/>
  <br/>
</p>
</div>

## 🌟 About The Project

**Cleen Chat** is a powerful node-based visual workflow builder designed to automate community moderation, integrate AI services, and manage YouTube Live Chats & Comments effortlessly. Inspired by tools like n8n and Zapier, this platform allows creators and developers to drag-and-drop logical blocks to build complex moderation bots without writing a single line of code.

Whether you want to automatically detect gambling links in your live chat, analyze the sentiment of your commenters using LLaMA-3, or timeout users who spam, Cleen Chat handles it all using an event-driven workflow engine.

---

## 🚀 Key Features

* 🧩 **Visual Canvas (Drag & Drop)**: Build workflows visually using `React Flow`. Connect triggers to actions seamlessly.
* 🤖 **AI-Powered Moderation**:
  * **Gambling Checker**: Custom FastAPI integration to classify and predict gambling text.
  * **Sentiment Analysis**: Ultra-fast sentiment labeling via Groq API (LLaMA-3).
  * **Spam Detection**: Detect repetitive links, caps lock, and forbidden keywords.
* 🔴 **YouTube Integrations**:
  * Triggers: YouTube Live Chat, YouTube Video Comment.
  * Actions: Reply to comment, Pin comment, Timeout user, Delete message.
* ⏳ **Smart Wait/Delay**: Add fixed or randomized delays (e.g., wait 5-15 mins) to make bot replies feel human. Features a live real-time countdown timer right on the canvas.
* 🔔 **Webhooks & External Connectors**: Fire Discord notifications, HTTP requests, or append rows to Google Sheets dynamically.
* 💡 **Handlebars Support**: Pass dynamic variables between nodes using syntax like `{{YOUTUBE_VIDEO_COMMENT.text}}`.
* ⚡ **Resilient Execution**: Powered by `Inngest` to guarantee workflow execution, even if a node takes hours to complete.

---

## 🛠️ Built With

This project uses modern, scalable technologies:

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
* **API / Backend**: [tRPC](https://trpc.io/)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
* **Workflow Engine**: [Inngest](https://www.inngest.com/)
* **Visual Nodes**: [React Flow](https://reactflow.dev/)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

---

## 🚦 Getting Started

Follow these steps to get a local copy up and running.

### 1. Prerequisites

Ensure you have Node.js and npm (or pnpm/yarn) installed. You will also need a running instance of PostgreSQL.

### 2. Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/nodeapp.git
   cd nodeapp
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Set up your `.env` file based on `.env.example`
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/nodeapp"
   GROQ_API_KEY="your_groq_api_key_here"
   # ... other required keys
   ```

### 3. Database Migration

Run Prisma migrations to set up the database schema:
```sh
npx prisma migrate dev
```

### 4. Running the Development Server

You need to run both the Next.js frontend and the Inngest Dev Server.

**Terminal 1 (Next.js):**
```sh
npm run dev
```

**Terminal 2 (Inngest):**
```sh
npm run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start building workflows!

---

## 📚 How to Use

1. **Configure Credentials**: Navigate to the Credentials page and add your YouTube OAuth or API keys.
2. **Create Workflow**: Go to the Dashboard and click "New Workflow".
3. **Add a Trigger**: Drag a trigger node (e.g., Manual Trigger or YouTube Comment) onto the canvas.
4. **Add Actions**: Connect the trigger to AI nodes (like Spam Detection) or logic nodes (Wait/Delay).
5. **Use Variables**: Use the Output Hint provided inside the node dialog to write handlebars variables. For example, use `{{spamResult.isSpam}}` in a Decision node to route spam comments to the YouTube Timeout node.
6. **Save & Execute**: Execute your workflow and watch the live visual status indicators light up!

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
