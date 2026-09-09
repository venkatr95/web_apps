# 🧠 Resume Optimizer Fullstack App

This project builds a smart AI-powered resume optimizer with:

- 🐍 FastAPI backend (with LLM & ATS support)
- ⚛️ React + TypeScript frontend (Vite)
- 🐳 Dockerized setup

---

## 🚀 Run with Docker

1. **Set your OpenAI key** in `docker-compose.yml`:
   ```yaml
   environment:
     - OPENAI_API_KEY=your_openai_key_here
   ```

2. **Build and start services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the app**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠 Development (Optional)

**Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---