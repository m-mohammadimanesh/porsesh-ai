<div align="center">

# 🤖 Porsesh AI (پرسش هوش مصنوعی)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://porsesh-ai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/m-mohammadimanesh/porsesh-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-FF5A5F?style=for-the-badge)](https://openrouter.ai/)

**A professional, bilingual AI chatbot powered by Nvidia Nemotron Ultra with RAG capabilities for PDF analysis.**
<br>
**یک چت‌بات حرفه‌ای و دوزبانه مبتنی بر هوش مصنوعی با قابلیت تحلیل فایل‌های PDF.**

</div>

---

## 📖 About The Project / درباره پروژه

**🇬🇧 English:**
Porsesh AI is a full-stack, AI-powered conversational interface designed to act as your intelligent assistant. Not only does it offer seamless real-time chatting using state-of-the-art models via OpenRouter (currently powered by Nvidia's Nemotron Ultra), but it also features **Retrieval-Augmented Generation (RAG)**. This allows you to upload any PDF document and instantly ask questions about its content. Built with a stunning dark/light mode interface using Next.js 14 and supported by a robust Python FastAPI backend with ChromaDB vector storage.

**🇮🇷 Persian (فارسی):**
پرسش AI یک دستیار هوشمند و تمام‌عیار است که نه تنها امکان چت پیشرفته و لحظه‌ای را با استفاده از مدل‌های قدرتمند OpenRouter (مانند Nvidia Nemotron Ultra) فراهم می‌کند، بلکه به لطف سیستم **RAG** امکان آپلود فایل‌های PDF و استخراج پاسخ از محتوای آن‌ها را به شما می‌دهد. این پروژه با رابط کاربری مدرن، پشتیبانی از حالت تاریک/روشن و فونت‌های استاندارد فارسی در Next.js توسعه یافته و از یک بک‌اند قدرتمند با پایتون و FastAPI بهره می‌برد.

---

## ✨ Features / ویژگی‌ها

- 💬 **Intelligent Chat (چت هوشمند):** Real-time conversational AI powered by OpenRouter.
- 📄 **PDF Knowledge Extraction (تحلیل PDF):** Upload PDFs and ask targeted questions based on the document's content using ChromaDB vector search.
- 🌓 **Dark & Light Mode (حالت تاریک و روشن):** Beautiful and responsive UI adapting to system preferences.
- 🌐 **Bilingual Support (دوزبانه):** Built-in support for right-to-left (RTL) Persian typography (Vazirmatn) and English (Inter).
- 📝 **Markdown & LaTeX Rendering (پشتیبانی از مارک‌داون و ریاضی):** Code highlighting and complex math equations render beautifully right inside the chat.

---

## 📸 Screenshots / تصاویر

> *Placeholders for screenshots - Add your images here!*

| ☀️ Light Mode | 🌙 Dark Mode |
| :---: | :---: |
| ![Light Mode](https://via.placeholder.com/600x400?text=Light+Mode+Screenshot) | ![Dark Mode](https://via.placeholder.com/600x400?text=Dark+Mode+Screenshot) |

---

## ⚙️ How It Works / نحوه کارکرد

```mermaid
graph LR
    U[User] -->|Upload PDF / Send Chat| F[Next.js Frontend]
    F -->|REST API| B[FastAPI Backend]
    B -->|Chunking & Embedding| V[(ChromaDB Vector Store)]
    V -.->|Context Retrieval| B
    B -->|Prompt + Context| AI[OpenRouter API]
    AI -->|LLM Response| B
    B -->|Return Answer| F
```

---

## 🚀 Installation & Setup / راه‌اندازی

### 1. Clone the repository
```bash
git clone https://github.com/m-mohammadimanesh/porsesh-ai.git
cd porsesh-ai
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```
Run the backend server:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables / متغیرهای محیطی

### Backend (`/backend/.env`)
| Variable | Description |
| :--- | :--- |
| `OPENROUTER_API_KEY` | Your API key from OpenRouter.ai |
| `CHROMA_DB_PATH` | Path to store local vector data (e.g. `./chroma_db`) |
| `MAX_PDF_SIZE_MB` | Maximum allowed size for PDF uploads (e.g. `10`) |

### Frontend (`/frontend/.env.local`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Your FastAPI backend URL (e.g. `http://localhost:8000`) |

---

## 📂 Project Structure / ساختار پروژه

```text
porsesh-ai/
├── backend/                  # Python FastAPI Backend
│   ├── models/               # Pydantic schemas
│   ├── services/             # Core logic (AI, Vector, PDF)
│   ├── main.py               # API Endpoints
│   └── requirements.txt      # Python dependencies
└── frontend/                 # Next.js 14 Frontend
    ├── src/
    │   ├── app/              # Next.js App Router & Layouts
    │   ├── components/       # UI Components (ChatWindow, PDFUploader)
    │   └── services/         # Frontend API integrations
    └── next.config.mjs       # Next.js Configuration
```

---

## 🤝 Contributing / مشارکت

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/m-mohammadimanesh/porsesh-ai/issues).

---

## 📄 License / مجوز

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 📬 Contact / ارتباط

**Mohammad**  
- GitHub: [@m-mohammadimanesh](https://github.com/m-mohammadimanesh)
- Project Link: [https://porsesh-ai.vercel.app](https://porsesh-ai.vercel.app)

<div align="center">
  <i>If you found this project helpful, please give it a ⭐️!</i>
</div>
